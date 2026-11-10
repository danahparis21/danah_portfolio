/**
 * /api/validate-flower
 *
 * Receives a base64 image of the visitor's canvas drawing and asks Groq's
 * vision model whether it looks like a flower, something harmless but not a
 * flower, or something inappropriate.
 *
 * Get a FREE API key at: https://console.groq.com
 * Add to .env.local:  GROQ_API_KEY=gsk_...
 * Optional:           GROQ_VISION_MODEL=...   (swap models without touching code)
 *
 * Model history: llama-3.2-11b-vision-preview was shut down (Apr 2025), and its
 * replacement llama-4-scout was shut down too (Jul 2026). Groq now lists
 * qwen/qwen3.8-27b for image input: https://console.groq.com/docs/vision
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_VISION_MODEL || "qwen/qwen3.8-27b";

const REJECTION_MESSAGES = [
  "That's not a flower... that's a 0_0 moment. Try again with something more garden-friendly!",
  "Hmm, that doesn't look like a flower to me 0_0 — maybe try a rose or a tulip?",
  "This garden only blooms flowers! What you drew is... something else entirely 0_0",
  "The garden fairy says: not a flower! 0_0 Give it another shot!",
  "My flower detector is blushing 0_0 — that's definitely not plantable here!",
  "Nope! 0_0 Danah's garden is a flower-only zone. No other shapes allowed!",
];

const getFunnyRejection = () =>
  REJECTION_MESSAGES[Math.floor(Math.random() * REJECTION_MESSAGES.length)];

/* ---- tiny best-effort rate limit (per server instance) so nobody can burn the API key ---- */
const hits = new Map<string, number[]>();
const limited = (ip: string) => {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) hits.clear();
  return recent.length > 8;
};

const PROMPT = `You are a strict content moderator for a portfolio garden website. Your ONLY job is to classify drawings.

Look at this drawing carefully and respond with EXACTLY one of these three options (no other text, no explanation):

FLOWER:<type>          — if it looks like any flower or plant (rose, tulip, lavender, sunflower, daisy, poppy, lotus, cherry blossom, wildflower, any abstract petal+stem shape). Be generous — simple/rough flower sketches pass.
NOTFLOWER:other        — if it is a smiley face, heart, text, animal, random scribble, or anything harmless but NOT a flower.
INAPPROPRIATE:blocked  — if it contains anything sexually explicit, phallic shapes, genitalia, or offensive content.

IMPORTANT: Reply with ONLY the classification. No other words.`;

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;

  // No API key = validation is skipped (handy in local dev)
  if (!apiKey) {
    console.warn("[validate-flower] GROQ_API_KEY not set — skipping validation");
    return NextResponse.json({ ok: true });
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (limited(ip)) {
    return NextResponse.json({
      ok: false,
      reason: "Easy there, gardener — give it a minute before checking another drawing!",
    });
  }

  let imageBase64: string;
  try {
    const body = await req.json();
    imageBase64 = body?.image;
    if (
      typeof imageBase64 !== "string" ||
      !/^data:image\/(png|jpeg|webp);base64,/.test(imageBase64) ||
      imageBase64.length > 600_000
    ) {
      return NextResponse.json({ error: "invalid image" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: imageBase64 } },
              { type: "text", text: PROMPT },
            ],
          },
        ],
        temperature: 0, // deterministic: this is a classifier
        max_tokens: 32, // forces a short answer
        // Qwen 3.x "thinks" by default, which would use up all the tokens and leave an
        // empty answer. "none" turns thinking off on Groq.
        ...(MODEL.startsWith("qwen/") ? { reasoning_effort: "none" } : {}),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      // If this ever says "model_decommissioned" again, pick a current vision model at
      // https://console.groq.com/docs/vision and set GROQ_VISION_MODEL in your env.
      console.error("[validate-flower] Groq API error:", response.status, err);
      return NextResponse.json({
        ok: false,
        reason: "Couldn't verify your drawing right now — please try again in a moment!",
      });
    }

    const data = await response.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "";
    // drop any <think> block, just in case, then normalise
    const text = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    console.log("[validate-flower] Groq raw response:", JSON.stringify(text));

    // INAPPROPRIATE first, then NOTFLOWER, then FLOWER ("NOTFLOWER" must not match as FLOWER)
    const m = text.toUpperCase().match(/\b(INAPPROPRIATE|NOTFLOWER|FLOWER)\b\s*:?\s*([^\n]*)/);

    if (m?.[1] === "FLOWER") {
      const label = m[2].trim().toLowerCase().slice(0, 30);
      return NextResponse.json({ ok: true, label });
    }

    if (m?.[1] === "INAPPROPRIATE") {
      return NextResponse.json({ ok: false, reason: getFunnyRejection(), type: "inappropriate" });
    }

    if (m?.[1] === "NOTFLOWER") {
      return NextResponse.json({
        ok: false,
        reason: "That doesn't quite look like a flower 0_0 — try drawing petals, a stem, or a bloom!",
        type: "not_flower",
      });
    }

    // Unexpected output: block rather than silently allow
    console.warn("[validate-flower] Unexpected response, blocking:", text);
    return NextResponse.json({
      ok: false,
      reason: "Couldn't quite read your drawing 0_0 — try again with a clearer flower!",
    });
  } catch (err) {
    console.error("[validate-flower] Fetch error:", err);
    return NextResponse.json({
      ok: false,
      reason: "Something went wrong checking your drawing — please try again!",
    });
  }
}