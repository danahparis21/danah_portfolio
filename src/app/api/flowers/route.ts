// Put this file at: src/app/api/flowers/route.ts
//
// Shared storage for the Secret Garden, using Upstash Redis.
//   npm i @upstash/redis
// On Vercel: Project -> Storage / Marketplace -> Upstash Redis -> Connect.
// That adds the env vars below automatically; redeploy afterwards.

import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const dynamic = "force-dynamic";

const KEY = "danah:garden:flowers";
const KEEP = 500; // flowers stored
const SHOW = 300; // flowers sent to visitors (newest)
// New pastel palette + the old one (so flowers saved before the redesign still validate)
const COLORS = new Set([
    "#f2a6bd", "#e5799f", "#8fc3ea", "#f4d58a", "#6fb58a",
    "#d8503f", "#ee9249", "#f3cb5a", "#3f7a3a",
]);

const getRedis = () => {
    const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
    return url && token ? new Redis({ url, token }) : null;
};

const num = (v: unknown, min: number, max: number) =>
    typeof v === "number" && Number.isFinite(v) && v >= min && v <= max ? v : null;

type Stroke = { c: string; w: number; p: number[] };

const validate = (b: any): { u: number; v: number; strokes: Stroke[] } | null => {
    const u = num(b?.u, -1, 1);
    const v = num(b?.v, -1, 1);
    if (u === null || v === null || !Array.isArray(b?.strokes)) return null;
    if (b.strokes.length < 1 || b.strokes.length > 14) return null;

    let total = 0;
    const strokes: Stroke[] = [];
    for (const s of b.strokes) {
        const w = num(s?.w, 0.5, 4);
        if (w === null || typeof s?.c !== "string" || !COLORS.has(s.c)) return null;
        if (!Array.isArray(s.p) || s.p.length < 4 || s.p.length % 2 !== 0) return null;
        total += s.p.length;
        if (total > 900) return null;
        const p: number[] = [];
        for (const n of s.p) {
            const x = num(n, 0, 100);
            if (x === null) return null;
            p.push(Math.round(x * 10) / 10);
        }
        strokes.push({ c: s.c, w, p });
    }
    return { u: Math.round(u * 100) / 100, v: Math.round(v * 100) / 100, strokes };
};

export async function GET() {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ flowers: [] });
    try {
        const items = await redis.lrange(KEY, 0, SHOW - 1);
        return NextResponse.json({ flowers: [...items].reverse() }, { headers: { "Cache-Control": "no-store" } });
    } catch {
        return NextResponse.json({ flowers: [] });
    }
}

export async function POST(req: Request) {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: "storage not configured" }, { status: 503 });

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "bad json" }, { status: 400 });
    }
    const clean = validate(body);
    if (!clean) return NextResponse.json({ error: "invalid flower" }, { status: 400 });

    // one flower per visitor every 15 seconds
    const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
    try {
        const ok = await redis.set(`danah:garden:rl:${ip}`, 1, { nx: true, ex: 15 });
        if (!ok) return NextResponse.json({ error: "slow down" }, { status: 429 });

        const flower = { id: crypto.randomUUID().slice(0, 8), ...clean };
        await redis.lpush(KEY, flower);
        await redis.ltrim(KEY, 0, KEEP - 1);
        return NextResponse.json(flower);
    } catch {
        return NextResponse.json({ error: "storage error" }, { status: 500 });
    }
}