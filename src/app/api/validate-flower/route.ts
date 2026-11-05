/**
 * /api/validate-flower
 *
 * Receives a base64 PNG of the visitor's canvas drawing and asks Groq
 * (Llama 4 Scout — free tier, ~14k req/day) whether it looks like a flower
 * or something inappropriate / non-floral.
 *
 * Get your FREE API key at: https://console.groq.com
 * Add to .env.local:  GROQ_API_KEY=gsk_...
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// Llama 3.2 11B Vision — confirmed working Groq vision model (free tier)
const MODEL = "llama-3.2-11b-vision-preview";

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

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;

  // Graceful fallback: no API key = skip validation
  if (!apiKey) {
    console.warn("[validate-flower] GROQ_API_KEY not set — skipping validation");
    return NextResponse.json({ ok: true });
  }

  let imageBase64: string;
  try {
    const body = await req.json();
    imageBase64 = body?.image;
    if (typeof imageBase64 !== "string" || !imageBase64.startsWith("data:image/")) {
      return NextResponse.json({ error: "invalid image" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  // Very explicit prompt — Llama must respond ONLY in one of three exact formats
  const prompt = `You are a strict content moderator for a portfolio garden website. Your ONLY job is to classify drawings.

Look at this drawing carefully and respond with EXACTLY one of these three options (no other text, no explanation):

FLOWER:<type>          — if it looks like any flower or plant (rose, tulip, lavender, sunflower, daisy, poppy, lotus, wildflower, any abstract petal+stem shape). Be generous — simple/rough flower sketches pass.
NOTFLOWER:other        — if it is a smiley face, heart, text, animal, random scribble, or anything harmless but NOT a flower.
INAPPROPRIATE:blocked  — if it contains anything sexually explicit, phallic shapes, genitalia, or offensive content.

IMPORTANT: Reply with ONLY the classification. No other words.`;

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
              {
                type: "image_url",
                image_url: { url: imageBase64 },
              },
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
        temperature: 0,       // deterministic — no creativity for a classifier
        max_tokens: 24,       // tight limit forces short responses
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[validate-flower] Groq API error:", response.status, err);
      // On API error, block rather than silently allow
      return NextResponse.json({
        ok: false,
        reason: "Couldn't verify your drawing right now — please try again in a moment!",
      });
    }

    const data = await response.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "";
    // Normalize: trim whitespace and uppercase for matching
    const text = raw.trim();

    console.log("[validate-flower] Groq raw response:", JSON.stringify(text));

    // Case-insensitive prefix matching so small variations don't break things
    const upper = text.toUpperCase();

    if (upper.startsWith("FLOWER:")) {
      const label = text.slice(7).trim().toLowerCase();
      return NextResponse.json({ ok: true, label });
    }

    if (upper.startsWith("INAPPROPRIATE:")) {
      return NextResponse.json({
        ok: false,
        reason: getFunnyRejection(),
        type: "inappropriate",
      });
    }

    if (upper.startsWith("NOTFLOWER:")) {
      return NextResponse.json({
        ok: false,
        reason:
          "That doesn't quite look like a flower 0_0 — try drawing petals, a stem, or a bloom!",
        type: "not_flower",
      });
    }

    // Groq returned something unexpected — log it and BLOCK (do not silently allow)
    console.warn("[validate-flower] Unexpected Groq response, blocking:", text);
    return NextResponse.json({
      ok: false,
      reason:
        "Couldn't quite read your drawing 0_0 — try again with a clearer flower!",
    });
  } catch (err) {
    console.error("[validate-flower] Fetch error:", err);
    return NextResponse.json({
      ok: false,
      reason: "Something went wrong checking your drawing — please try again!",
    });
  }
}
