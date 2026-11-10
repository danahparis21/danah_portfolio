"use client";

/**
 * Danah's Secret Garden — Soft Pastel Meadow
 * ------------------------------------------------------------------
 * - Atmospheric cloudscape background (garden-background2.png)
 *   with milky white overlay and panoramic float animation.
 * - Perfectly synchronized drawing pad: 1:1 aspect ratio, rock-solid
 *   stable coordinates, zero cursor offset.
 * - Consistent SF Pro typography matching the rest of the portfolio.
 * - Full-bleed meadow horizon at the footer where interactive flowers
 *   and visitor drawings blossom in real-time.
 * - Shared cloud persistence with Upstash Redis (/api/flowers).
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { RotateCcw, Sprout, Undo2 } from "lucide-react";
import { playPlantChime } from "@/utils/sound";

/* ───────────────────────── types & palette ───────────────────────── */

interface Stroke {
  c: string;
  w: number;
  p: number[];
}

interface Flower {
  id: string;
  u: number; // -1..1 across meadow width
  v: number; // -1..1 depth in meadow (-1 = back, 1 = front)
  strokes: Stroke[];
  t?: number;
}

// Palette pulled from the cherry-blossom meadow: blossom pink, rose, sky, cream and mint
const BLUSH = "#f2a6bd";
const ROSE = "#e5799f";
const SKY = "#8fc3ea";
const CREAM = "#f4d58a";
const LEAF = "#6fb58a";

const PAINT = [
  { name: "Blossom", hex: BLUSH },
  { name: "Rose", hex: ROSE },
  { name: "Sky", hex: SKY },
  { name: "Cream", hex: CREAM },
  { name: "Mint leaf", hex: LEAF },
];

/** Flowers saved with the old palette are re-coloured on the fly so the whole meadow matches. */
const LEGACY: Record<string, string> = {
  "#d8503f": ROSE,
  "#ee9249": "#f6b79a",
  "#f3cb5a": CREAM,
  "#3f7a3a": LEAF,
};
const tone = (c: string) => LEGACY[c] ?? c;

const COOLDOWN_MS = 15000;

/* ───────────────────────── small helpers ───────────────────────── */

const r1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const mulberry = (seed: number) => {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const easeOutBack = (k: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
};

const hashId = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000;
  return h;
};

const sig = (f: Flower) => `${f.u.toFixed(2)}|${f.v.toFixed(2)}|${f.strokes.length}`;

/* ───────────────────────── the gouache painter ───────────────────────── */

const trace = (ctx: CanvasRenderingContext2D, p: number[], k: number) => {
  ctx.beginPath();
  const n = p.length / 2;
  ctx.moveTo(p[0] * k, p[1] * k);
  if (n === 2) {
    ctx.lineTo(p[2] * k, p[3] * k);
    return;
  }
  for (let i = 1; i < n - 1; i++) {
    const x = p[i * 2] * k, y = p[i * 2 + 1] * k;
    const nx = p[(i + 1) * 2] * k, ny = p[(i + 1) * 2 + 1] * k;
    ctx.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2);
  }
  ctx.lineTo(p[(n - 1) * 2] * k, p[(n - 1) * 2 + 1] * k);
};

const paintStrokes = (ctx: CanvasRenderingContext2D, strokes: Stroke[], k: number, minW = 1.1) => {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const s of strokes) {
    const n = s.p.length / 2;
    const closed = n >= 8 && Math.hypot(s.p[0] - s.p[s.p.length - 2], s.p[1] - s.p[s.p.length - 1]) < 7;
    trace(ctx, s.p, k);
    ctx.strokeStyle = tone(s.c);
    ctx.fillStyle = tone(s.c);
    if (closed) {
      ctx.globalAlpha = 0.4;
      ctx.fill();
    }
    const w = Math.max(minW, s.w * k);
    ctx.globalAlpha = 0.2;
    ctx.lineWidth = w * 2.4;
    ctx.stroke();
    ctx.globalAlpha = 0.92;
    ctx.lineWidth = w;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
};

/* ───────────────────────── starter flowers ───────────────────────── */

const rot = (x: number, y: number, a: number): [number, number] => [
  x * Math.cos(a) - y * Math.sin(a),
  x * Math.sin(a) + y * Math.cos(a),
];

/** A petal as a closed outline rooted at (cx, cy) and pointing along `ang`. `notch` carves the sakura dip. */
const petal = (cx: number, cy: number, ang: number, len: number, wid: number, notch: number, rand: () => number) => {
  const shape: [number, number][] = [
    [0, 0], [len * 0.5, -wid], [len * 0.92, -wid * 0.6], [len, -wid * 0.14],
    [len * (1 - notch), 0],
    [len, wid * 0.14], [len * 0.92, wid * 0.6], [len * 0.5, wid], [0, 0],
  ];
  const out: number[] = [];
  for (const [x, y] of shape) {
    const j = 1 + (rand() - 0.5) * 0.1;
    const [rx, ry] = rot(x * j, y * j, ang);
    out.push(r1(cx + rx), r1(cy + ry));
  }
  return out;
};

/** A pointed leaf (lens shape) growing from (x, y). */
const leafShape = (x: number, y: number, ang: number, len: number, wid: number) => {
  const n = 5;
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) pts.push(rot(len * (i / n), -wid * Math.sin(Math.PI * (i / n)), ang));
  for (let i = n - 1; i >= 0; i--) pts.push(rot(len * (i / n), wid * Math.sin(Math.PI * (i / n)), ang));
  return pts.flatMap(([px, py]) => [r1(x + px), r1(y + py)]);
};

const spiral = (cx: number, cy: number, r: number) => {
  const out: number[] = [];
  const n = 18;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = t * 2.2 * Math.PI * 2;
    const rr = r * t + 0.4;
    out.push(r1(cx + Math.cos(a) * rr), r1(cy + Math.sin(a) * rr));
  }
  return out;
};

/** Three little flower types (sakura, daisy, tulip). Always <= 14 strokes so the server accepts "surprise me". */
const makeFlower = (seed: number): Stroke[] => {
  const rand = mulberry(seed);
  const lean = (rand() - 0.5) * 14;
  const cx = 50 + lean;
  const cy = 40;
  const x0 = 50 + lean * 0.15;
  const topY = cy + 10;
  const stemX = (y: number) => x0 + (cx - x0) * ((97 - y) / (97 - topY));
  const side = rand() > 0.5 ? 1 : -1;

  const strokes: Stroke[] = [
    { c: LEAF, w: 2.2, p: [r1(x0), 97, r1(50 + lean * 0.5), 84, r1(50 + lean * 0.85), 68, r1(cx), topY] },
    { c: LEAF, w: 1.6, p: leafShape(stemX(84), 84, side > 0 ? -0.75 : Math.PI + 0.75, 15, 4.2) },
    { c: LEAF, w: 1.6, p: leafShape(stemX(70), 70, side > 0 ? Math.PI + 0.65 : -0.65, 11, 3.4) },
  ];

  const colours = [BLUSH, BLUSH, ROSE, SKY, CREAM];
  const pc = colours[Math.floor(rand() * colours.length)];
  const centre = pc === CREAM ? ROSE : CREAM;
  const kind = rand();

  if (kind < 0.5) {
    // sakura: five notched petals
    const base = rand() * Math.PI * 2;
    for (let k = 0; k < 5; k++) {
      strokes.push({ c: pc, w: 1.7, p: petal(cx, cy, base + (k / 5) * Math.PI * 2, 11.5, 6.4, 0.16, rand) });
    }
    strokes.push({ c: centre, w: 1.6, p: spiral(cx, cy, 3.4) });
  } else if (kind < 0.78) {
    // daisy: ring of slim petals
    const dc = pc === CREAM ? SKY : pc;
    const base = rand() * Math.PI * 2;
    for (let k = 0; k < 8; k++) {
      strokes.push({ c: dc, w: 1.5, p: petal(cx, cy, base + (k / 8) * Math.PI * 2, 12.5, 3.3, 0, rand) });
    }
    strokes.push({ c: CREAM, w: 2, p: spiral(cx, cy, 4.8) });
  } else {
    // tulip
    strokes.push({
      c: pc, w: 2,
      p: [cx - 11, cy - 12, cx - 12, cy + 2, cx - 6, cy + 12, cx, cy + 14, cx + 6, cy + 12, cx + 12, cy + 2, cx + 11, cy - 12, cx + 5, cy - 4, cx, cy - 13, cx - 5, cy - 4, cx - 11, cy - 12].map(r1),
    });
    strokes.push({ c: pc, w: 1.5, p: [r1(cx), cy - 12, r1(cx + (rand() - 0.5) * 3), cy + 9] });
  }
  return strokes;
};

/** Pick a spot spread across the meadow strip. */
const pickSpot = (existing: { u: number; v: number }[], rand: () => number) => {
  let best = { u: 0, v: 0 };
  let bestD = -1;
  for (let i = 0; i < 20; i++) {
    const u = (rand() * 2 - 1) * 0.92;
    const v = (rand() * 2 - 1) * 0.82;
    let d = existing.length === 0 ? 1 : Infinity;
    for (const e of existing) d = Math.min(d, Math.hypot(e.u - u, (e.v - v) * 0.5));
    if (d > bestD) {
      bestD = d;
      best = { u: Math.round(u * 100) / 100, v: Math.round(v * 100) / 100 };
    }
  }
  return best;
};

const makeSeeds = (): Flower[] => {
  const rand = mulberry(99);
  const list: Flower[] = [];
  for (let i = 0; i < 20; i++) {
    const spot = pickSpot(list, rand);
    list.push({ id: `s${i}`, u: spot.u, v: spot.v, strokes: makeFlower(1000 + i * 37) });
  }
  return list;
};

/* ───────────────────────── painted meadow ───────────────────────── */

const terrainY = (x: number, baseY: number, seed: number): number => {
  const s1 = Math.sin(x * 0.005 + seed);
  const s2 = Math.sin(x * 0.013 + seed * 1.7);
  const s3 = Math.sin(x * 0.031 + seed * 2.3);
  return baseY - 14 * s1 - 9 * s2 - 5 * s3;
};

const buildMeadow = (w: number, h: number, dpr: number) => {
  const c = document.createElement("canvas");
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const ctx = c.getContext("2d")!;
  ctx.scale(dpr, dpr);
  ctx.lineCap = "round";
  ctx.clearRect(0, 0, w, h);

  /* helper — paint one grass terrain layer */
  const paintLayer = (
    baseY: number,
    topCol: string,
    botCol: string,
    bladeCol: string,
    bladeCnt: number,
    bladeMax: number,
    seed: number,
  ) => {
    const lr = mulberry(Math.floor(seed * 1000));

    /* filled terrain shape */
    ctx.beginPath();
    ctx.moveTo(-2, h + 2);
    for (let x = -2; x <= w + 2; x += 3) {
      ctx.lineTo(x, terrainY(x, baseY, seed));
    }
    ctx.lineTo(w + 2, h + 2);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, baseY - 25, 0, h);
    g.addColorStop(0, topCol);
    g.addColorStop(1, botCol);
    ctx.fillStyle = g;
    ctx.fill();

    /* individual grass blades */
    for (let i = 0; i < bladeCnt; i++) {
      const x = lr() * w;
      const y = terrainY(x, baseY, seed) + lr() * 4;
      const bh = 8 + lr() * bladeMax;
      const bend = (lr() - 0.5) * bh * 0.6;
      ctx.strokeStyle = bladeCol;
      ctx.globalAlpha = 0.3 + lr() * 0.4;
      ctx.lineWidth = 0.8 + lr() * 1.8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + bend * 0.3, y - bh * 0.6, x + bend, y - bh);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  /* 3 grass layers, back → front (darkest → brightest) */
  paintLayer(h - 155, "#dcefd9", "#c7e4cc", "#9bcfae", 360, 52, 7.1);
  paintLayer(h - 105, "#c9e6cb", "#b2dcba", "#86c49f", 330, 42, 13.3);
  paintLayer(h - 58, "#b6dfbf", "#9ccfaa", "#74b890", 290, 32, 19.7);

  /* scattered leaf clusters */
  const lr = mulberry(500);
  for (let i = 0; i < 55; i++) {
    const x = lr() * w;
    const y = h - 12 - lr() * 125;
    ctx.fillStyle = `rgba(110, 180, 140, ${0.18 + lr() * 0.22})`;
    for (let j = 0; j < 3; j++) {
      ctx.beginPath();
      ctx.ellipse(x + (j - 1) * 5, y + lr() * 4, 2.5 + lr() * 3, 4.5 + lr() * 4, lr() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* small decorative wildflowers baked into the static grass */
  const petalCols = [BLUSH, CREAM, "#ffffff", "#f7d3df", "#cfe5f7"];
  for (let i = 0; i < 14; i++) {
    const x = 30 + lr() * (w - 60);
    const y = h - 35 - lr() * 105;
    const pc = petalCols[Math.floor(lr() * petalCols.length)];
    const petals = 4 + Math.floor(lr() * 3);
    ctx.globalAlpha = 0.55 + lr() * 0.35;
    for (let p = 0; p < petals; p++) {
      const a = (p / petals) * Math.PI * 2 + lr() * 0.4;
      const pr = 3 + lr() * 4;
      ctx.fillStyle = pc;
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(a) * pr, y + Math.sin(a) * pr, 2 + lr() * 2.5, 3 + lr() * 2, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = CREAM;
    ctx.beginPath();
    ctx.arc(x, y, 1.5 + lr(), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  return c;
};

/* ───────────────────────── component ───────────────────────── */

interface DanahSecretGardenProps {
  inWindow?: boolean;
}

export const DanahSecretGarden: React.FC<DanahSecretGardenProps> = ({ inWindow = false }) => {
  const [flowers, setFlowers] = useState<Flower[]>(makeSeeds);
  const [size, setSize] = useState({ w: 900, h: 300 });
  const [color, setColor] = useState<string>(BLUSH);
  const [strokeCount, setStrokeCount] = useState<number>(0);
  const [note, setNote] = useState<string>("");
  const [validating, setValidating] = useState<boolean>(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<HTMLCanvasElement>(null);
  const flowersRef = useRef<Flower[]>(flowers);
  const pointerRef = useRef<{ x: number; y: number; vx: number } | null>(null);
  const pushRef = useRef(new Map<string, { a: number; v: number }>());
  const inViewRef = useRef<boolean>(false);
  const spriteCache = useRef(new Map<string, HTMLCanvasElement>());
  const strokesRef = useRef<Stroke[]>([]);
  const curRef = useRef<Stroke | null>(null);
  const lastPlant = useRef<number>(0);
  const firstLoad = useRef<boolean>(true);
  flowersRef.current = flowers;

  /* responsive size + visibility */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = Math.round(e.contentRect.width);
      if (w > 0) {
        const mh = inWindow ? (w < 640 ? 140 : 170) : (w < 640 ? 230 : w < 1024 ? 270 : 310);
        setSize({ w, h: mh });
      }
    });
    ro.observe(el);
    const io = new IntersectionObserver(
      ([e]) => { inViewRef.current = e.isIntersecting; },
      { rootMargin: "100px" },
    );
    io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); };
  }, []);

  /* load + poll shared flowers */
  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/flowers", { cache: "no-store" });
      if (!r.ok) return;
      const data = await r.json();
      const remote: Flower[] = Array.isArray(data.flowers) ? data.flowers : [];
      const fresh = !firstLoad.current;
      firstLoad.current = false;
      setFlowers((prev) => {
        const ids = new Set(prev.map((f) => f.id));
        const sigs = new Set(prev.map(sig));
        const add = remote
          .filter((f) => f && f.id && Array.isArray(f.strokes) && !ids.has(f.id) && !sigs.has(sig(f)))
          .map((f) => (fresh ? { ...f, t: performance.now() } : f));
        return add.length ? [...prev, ...add] : prev;
      });
    } catch {
      /* the garden still works locally */
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  /* scene render loop — windy meadow */
  useEffect(() => {
    const canvas = sceneRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(size.w * dpr);
    canvas.height = Math.round(size.h * dpr);
    const bg = buildMeadow(size.w, size.h, dpr);
    spriteCache.current.clear();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const meadowTop = size.h * 0.12;
    const meadowBot = size.h * 0.82;

    /* wind: waves travel across the meadow, and a slow gust swells every now and then */
    const gustAt = (t: number) => Math.pow(Math.max(0, Math.sin(t / 6500 - 1)), 2);
    const windAt = (t: number, x: number) => {
      if (reduce) return 0;
      const g = gustAt(t);
      const waves = Math.sin(t / 2400 - x * 0.0035) * 0.55 + Math.sin(t / 1050 - x * 0.007 + 1.3) * 0.28;
      return waves * (0.65 + 0.9 * g) + 0.3 * g;
    };

    /* animated foreground grass */
    const gr = mulberry(4242);
    const blades = Array.from({ length: Math.round(size.w / 5) }, () => ({
      x: gr() * size.w,
      y: size.h - 4 - gr() * 52,
      h: 12 + gr() * 22,
      ph: gr() * 6.28,
      dark: gr() > 0.5,
    }));
    const drawBlades = (t: number) => {
      for (const dark of [true, false]) {
        ctx.beginPath();
        for (const b of blades) {
          if (b.dark !== dark) continue;
          const w = windAt(t, b.x) * 0.55 + (reduce ? 0 : Math.sin(t / 500 + b.ph) * 0.06);
          ctx.moveTo(b.x, b.y);
          ctx.quadraticCurveTo(b.x + w * b.h * 0.25, b.y - b.h * 0.6, b.x + w * b.h * 0.9, b.y - b.h * (1 - Math.abs(w) * 0.12));
        }
        ctx.strokeStyle = dark ? "rgba(112,184,144,0.8)" : "rgba(168,220,186,0.85)";
        ctx.lineWidth = dark ? 1.6 : 1.3;
        ctx.stroke();
      }
    };

    /* blossom petals carried by the wind */
    const pr = mulberry(777);
    const petalCols = ["#f7cddb", "#fbe1e9", "#f2a6bd", "#ffffff"];
    const fall = Array.from({ length: size.w < 640 ? 9 : 18 }, () => ({
      x: pr() * size.w,
      y: pr() * size.h,
      r: 3 + pr() * 3.2,
      rot: pr() * 6.28,
      vr: (pr() - 0.5) * 0.04,
      sp: 0.15 + pr() * 0.35,
      ph: pr() * 6.28,
      col: petalCols[Math.floor(pr() * petalCols.length)],
      a: 0.6 + pr() * 0.35,
    }));
    const drawPetals = (t: number, dt: number) => {
      for (const p of fall) {
        const w = windAt(t, p.x);
        p.x += (0.3 + w * 1.3 + p.sp) * dt;
        p.y += (0.22 + p.sp * 0.5 + Math.sin(t / 700 + p.ph) * 0.25) * dt;
        p.rot += (p.vr + w * 0.02) * dt;
        if (p.x > size.w + 12) { p.x = -12; p.y = Math.random() * size.h * 0.7; }
        if (p.x < -20) p.x = size.w + 10;
        if (p.y > size.h + 8) { p.y = -8; p.x = Math.random() * size.w; }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(t / 900 + p.ph)));
        ctx.globalAlpha = p.a;
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r, p.r * 0.62, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    };

    const getSprite = (f: Flower, px: number) => {
      const S = Math.max(48, Math.round(px * dpr));
      const key = `${f.id}:${S}`;
      let c = spriteCache.current.get(key);
      if (!c) {
        c = document.createElement("canvas");
        c.width = S;
        c.height = S;
        paintStrokes(c.getContext("2d")!, f.strokes, S / 100, 1.1 * dpr);
        spriteCache.current.set(key, c);
      }
      return c;
    };

    let raf = 0;
    let last = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!inViewRef.current) { last = now; return; }
      const dt = last ? Math.min(2.5, (now - last) / 16.67) : 1;
      last = now;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bg, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";

      const items = [...flowersRef.current]
        .sort((a, b) => a.v - b.v)
        .map((f) => {
          const depth = (f.v + 1) / 2; // 0 = back, 1 = front
          return {
            f,
            px: size.h * 0.22 * (0.5 + 0.5 * depth),
            x: size.w * 0.5 + f.u * size.w * 0.44,
            y: meadowTop + depth * (meadowBot - meadowTop),
          };
        });

      let hover: string | null = null;
      const ptr = pointerRef.current;
      if (ptr) {
        for (let i = items.length - 1; i >= 0; i--) {
          const it = items[i];
          if (Math.abs(ptr.x - it.x) < it.px * 0.28 && ptr.y < it.y && ptr.y > it.y - it.px * 0.8) {
            hover = it.f.id;
            break;
          }
        }
        /* moving the cursor through the meadow gives nearby flowers a push */
        if (!reduce && Math.abs(ptr.vx) > 0.5) {
          for (const it of items) {
            const dist = Math.hypot(ptr.x - it.x, ptr.y - (it.y - it.px * 0.45));
            const R = it.px * 0.9;
            if (dist < R) {
              const st = pushRef.current.get(it.f.id) ?? { a: 0, v: 0 };
              st.v += clamp(ptr.vx, -40, 40) * 0.0012 * (1 - dist / R);
              pushRef.current.set(it.f.id, st);
            }
          }
        }
        ptr.vx *= 0.85;
      }

      for (const { f, px, x, y } of items) {
        let s = 1;
        if (f.t !== undefined) s = easeOutBack(clamp((now - f.t) / 900, 0, 1));
        if (hover === f.id) s *= 1.15;

        let push = 0;
        const st = pushRef.current.get(f.id);
        if (st) {
          st.v += -0.05 * st.a * dt;
          st.v *= Math.pow(0.9, dt);
          st.a += st.v * dt;
          push = st.a;
          if (Math.abs(st.a) < 0.0005 && Math.abs(st.v) < 0.0005) pushRef.current.delete(f.id);
        }

        const w = windAt(now, x);
        const lean = clamp(w * 0.11 + push, -0.45, 0.45); // bends the stem: the top moves more than the base
        const flutter = reduce ? 0 : Math.sin(now / 240 + hashId(f.id)) * 0.012 * (0.4 + Math.abs(w));

        ctx.fillStyle = "rgba(60, 110, 80, 0.15)";
        ctx.beginPath();
        ctx.ellipse(x, y + 1, px * 0.11 * s, px * 0.035 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.translate(x, y);
        ctx.transform(1, 0, -lean, 1, 0, 0);
        ctx.rotate(lean * 0.35 + flutter);
        ctx.scale(s, s);
        ctx.drawImage(getSprite(f, px), -px / 2, -px * 0.96, px, px);
        ctx.restore();
      }

      drawBlades(now);
      if (!reduce) drawPetals(now, dt);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [size]);

  /* drawing pad with 100% synchronized coordinates */
  const redrawPad = useCallback(() => {
    const c = padRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    const all = curRef.current ? [...strokesRef.current, curRef.current] : strokesRef.current;
    paintStrokes(ctx, all, c.width / 100, 1.2);
  }, []);

  useEffect(() => {
    const c = padRef.current;
    if (c) {
      c.width = 520;
      c.height = 520;
      redrawPad();
    }
  }, [redrawPad]);

  const padPoint = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const canvas = padRef.current || e.currentTarget;
    const r = canvas.getBoundingClientRect();
    return [
      r1(clamp(((e.clientX - r.left) / r.width) * 100, 0, 100)),
      r1(clamp(((e.clientY - r.top) / r.height) * 100, 0, 100)),
    ];
  };

  const totalPoints = () => strokesRef.current.reduce((a, s) => a + s.p.length, 0);

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (strokesRef.current.length >= 14) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch { }
    const [x, y] = padPoint(e);
    curRef.current = { c: color, w: 2.2, p: [x, y] };
    redrawPad();
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cur = curRef.current;
    if (!cur) return;
    const [x, y] = padPoint(e);
    const n = cur.p.length;
    if (Math.hypot(x - cur.p[n - 2], y - cur.p[n - 1]) < 0.9) return;
    if (totalPoints() + n > 800) return;
    cur.p.push(x, y);
    redrawPad();
  };

  const onUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch { }
    const cur = curRef.current;
    if (!cur) return;
    if (cur.p.length < 4) cur.p.push(r1(cur.p[0] + 0.1), r1(cur.p[1] + 0.1));
    strokesRef.current.push(cur);
    curRef.current = null;
    setStrokeCount(strokesRef.current.length);
    redrawPad();
  };

  const undo = () => {
    strokesRef.current.pop();
    setStrokeCount(strokesRef.current.length);
    redrawPad();
  };

  const clearPad = () => {
    strokesRef.current = [];
    curRef.current = null;
    setStrokeCount(0);
    redrawPad();
  };

  /* planting */
  const flash = (msg: string) => {
    setNote(msg);
    window.setTimeout(() => setNote(""), 4500);
  };

  const plant = async (strokes: Stroke[]) => {
    const now = Date.now();
    if (now - lastPlant.current < COOLDOWN_MS) {
      flash("Let your last flower settle in first, then plant another.");
      return;
    }
    lastPlant.current = now;
    const spot = pickSpot(flowersRef.current, Math.random);
    const id = `l${now}`;
    const flower: Flower = { id, u: spot.u, v: spot.v, strokes, t: performance.now() };
    setFlowers((prev) => [...prev, flower]);
    playPlantChime(true);
    confetti({
      particleCount: 40,
      spread: 60,
      startVelocity: 22,
      origin: { y: 0.85 },
      colors: PAINT.map((p) => p.hex),
    });
    try {
      const res = await fetch("/api/flowers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ u: flower.u, v: flower.v, strokes }),
      });
      if (res.ok) {
        const saved = await res.json();
        if (saved?.id) setFlowers((prev) => prev.map((f) => (f.id === id ? { ...f, id: saved.id } : f)));
      } else if (res.status === 429) {
        setFlowers((prev) => prev.filter((f) => f.id !== id));
        flash("Too many flowers at once. Try again in a moment.");
      }
    } catch {
      /* stays in this visitor's garden */
    }
  };

  const handlePlant = () => {
    if (strokesRef.current.length === 0) return;
    plant([...strokesRef.current]);
    clearPad();
  };

  /* ── AI flower validation ── */
  const validateAndPlant = async () => {
    if (strokesRef.current.length === 0) return;
    const c = padRef.current;
    if (!c) return;

    setValidating(true);
    setNote("Checking if that's a flower...");

    // Composite the drawing onto a solid white background before exporting
    // so Llama can clearly see the strokes (transparent PNG = black in many renderers)
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = c.width;
    exportCanvas.height = c.height;
    const ectx = exportCanvas.getContext("2d")!;
    ectx.fillStyle = "#ffffff";
    ectx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ectx.drawImage(c, 0, 0);
    // Also downscale to 256×256 — plenty for shape classification, keeps payload small
    const thumbCanvas = document.createElement("canvas");
    thumbCanvas.width = 256;
    thumbCanvas.height = 256;
    const tctx = thumbCanvas.getContext("2d")!;
    tctx.drawImage(exportCanvas, 0, 0, c.width, c.height, 0, 0, 256, 256);
    const imageDataUrl = thumbCanvas.toDataURL("image/jpeg", 0.9);

    try {
      const res = await fetch("/api/validate-flower", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageDataUrl }),
      });

      const data = await res.json();

      if (data.ok === true) {
        // It's a flower! Plant it.
        const label = data.label ? ` Looks like a ${data.label}!` : "";
        setNote(`Beautiful!${label} Planting it now...`);
        setTimeout(() => setNote(""), 3500);
        plant([...strokesRef.current]);
        clearPad();
      } else {
        // Not a flower or inappropriate — always block
        flash(data.reason ?? "That doesn't look like a flower 0_0 — try again!");
      }
    } catch {
      // Network failure — block rather than allow, to be safe
      flash("Couldn't check your drawing right now. Please try again!");
    } finally {
      setValidating(false);
    }
  };

  const handleSurprise = () => plant(makeFlower(Math.floor(Math.random() * 1e9)));

  if (inWindow) {
    return (
      <div className="relative w-full select-none overflow-hidden rounded-[20px] bg-gradient-to-b from-[#eef6fc] via-[#fceef3] to-[#e8f7ee] border border-pink-100/60 shadow-inner flex flex-col justify-between mt-3 min-h-[500px]">
        <style>{`
          @keyframes garden-drift {
            0% { transform: scale(1.02) translate3d(0, 0, 0); }
            50% { transform: scale(1.06) translate3d(-1%, -1.2%, 0); }
            100% { transform: scale(1.02) translate3d(0, 0, 0); }
          }
          .garden-bg-anim {
            animation: garden-drift 28s ease-in-out infinite alternate;
            will-change: transform;
            filter: saturate(0.78) brightness(1.06);
            opacity: 0.68;
          }
          .gd-pill {
            position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: .45rem;
            border-radius: 9999px; border: 1px solid rgba(148,163,184,.45); padding: .35rem .85rem;
            font-size: 12.5px; font-weight: 500; color: #334155; white-space: nowrap;
            background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(245,245,248,0.85));
            box-shadow: inset 0 1px 1px #fff, inset 0 -1px 2px rgba(15,23,42,.05), 0 4px 10px -6px rgba(15,23,42,.2);
          }
          .gd-chip { padding: .2rem .65rem; font-size: 11px; }
          .gd-grad {
            background: linear-gradient(135deg, #0b0b10 10%, #4a1236 50%, #f0568f 100%);
            -webkit-background-clip: text; background-clip: text; color: transparent;
          }
          .garden-glass {
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(255, 245, 250, 0.88));
            -webkit-backdrop-filter: blur(24px) saturate(1.4);
            backdrop-filter: blur(24px) saturate(1.4);
            border: 1px solid rgba(255, 255, 255, 0.95);
            box-shadow: 0 0 0 1px rgba(255, 180, 200, 0.2), 0 20px 40px -12px rgba(130, 40, 70, 0.15);
          }
        `}</style>

        {/* Floating Animated Cloud Background Layer */}
        <div
          aria-hidden
          className="garden-bg-anim pointer-events-none absolute inset-[-3%] bg-cover bg-center"
          style={{
            backgroundImage: "url('/assets/images/stickers/garden-background2.png')",
          }}
        />

        {/* Milky Wash Overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-1 bg-gradient-to-b from-white/40 via-[#e8f2fb]/45 to-[#f9e8ef]/35"
        />

        {/* Content area: Header & Easel */}
        <div className="relative z-10 w-full pt-3 px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Danah&apos;s <span className="gd-grad">Secret Garden</span>
              </h3>
              <p className="text-xs text-slate-600">
                Draw a flower, our AI validates your bloom, and it plants into our shared meadow.
              </p>
            </div>
            <div className="gd-pill gd-chip shadow-xs">
              <span className="h-2 w-2 rounded-full bg-[#8fc3ea]" />
              <span className="font-semibold text-slate-800">{flowers.length} wildflowers blooming</span>
            </div>
          </div>

          {/* Frosted Glass Drawing Card */}
          <aside className="garden-glass mx-auto my-3 w-full max-w-[270px] sm:max-w-[290px] rounded-2xl p-3.5 sm:p-4">
            <h4 className="text-center text-xs font-semibold tracking-tight text-slate-800">
              Draw a flower, plant it below
            </h4>

            {/* palette */}
            <div className="mt-2 flex items-center justify-center gap-2">
              {PAINT.map((p) => (
                <button
                  key={p.hex}
                  type="button"
                  title={p.name}
                  aria-label={p.name}
                  onClick={() => setColor(p.hex)}
                  style={{ backgroundColor: p.hex }}
                  className={`h-6 w-6 rounded-full border border-black/10 transition ${
                    color === p.hex
                      ? "scale-110 ring-2 ring-slate-800 ring-offset-2"
                      : "hover:scale-105"
                  }`}
                />
              ))}
            </div>

            {/* drawing canvas — strictly 1:1 square internal resolution */}
            <div className="relative mt-2.5 aspect-square w-full touch-none rounded-xl border border-slate-200/90 bg-white/95 shadow-inner overflow-hidden">
              {strokeCount === 0 && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center text-xs font-medium text-slate-400">
                  draw a flower, then a stem and a leaf
                </div>
              )}
              <canvas
                ref={padRef}
                width={520}
                height={520}
                className="absolute inset-0 h-full w-full cursor-crosshair rounded-xl touch-none"
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
              />
            </div>

            {/* controls */}
            <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-500">
              <button
                type="button"
                onClick={undo}
                disabled={strokeCount === 0}
                className="flex items-center gap-1 hover:text-slate-800 transition disabled:opacity-30"
              >
                <Undo2 className="h-3 w-3" />
                <span>undo</span>
              </button>
              <button
                type="button"
                onClick={handleSurprise}
                className="text-pink-600 hover:text-pink-700 font-semibold transition text-xs"
              >
                surprise me
              </button>
              <button
                type="button"
                onClick={clearPad}
                disabled={strokeCount === 0}
                className="flex items-center gap-1 hover:text-slate-800 transition disabled:opacity-30"
              >
                <RotateCcw className="h-3 w-3" />
                <span>clear</span>
              </button>
            </div>

            {/* AI plant button */}
            <button
              type="button"
              onClick={validateAndPlant}
              disabled={strokeCount === 0 || validating}
              className="relative mt-2.5 flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-full border border-[#e0628f]/70 py-2 text-[13px] font-medium text-[#4a1230] transition active:translate-y-px disabled:opacity-40"
              style={{
                background: "linear-gradient(180deg,#ffc9db 0%,#ff9bbd 48%,#fb7fa9 52%,#ffa8c6 100%)",
                boxShadow: "inset 0 1px 1px rgba(255,255,255,.9), inset 0 -1px 2px rgba(190,40,100,.25), 0 6px 14px -5px rgba(244,114,182,.6)",
                textShadow: "0 1px 0 rgba(255,255,255,.55)",
              }}
            >
              <span className="pointer-events-none absolute inset-x-3 top-[2px] h-[44%] rounded-full bg-gradient-to-b from-white/75 to-white/5" />
              {validating ? (
                <>
                  <svg className="relative h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="relative">Checking...</span>
                </>
              ) : (
                <>
                  <Sprout className="relative h-3.5 w-3.5" />
                  <span className="relative">Plant Wildflower</span>
                </>
              )}
            </button>
            <p className={`mt-1 min-h-[1rem] text-center text-[11px] font-medium transition-colors ${
              note.startsWith("Beautiful") || note.startsWith("Checking") ? "text-[#4f9a73]" : "text-rose-500"
            }`}>
              {note}
            </p>
          </aside>
        </div>

        {/* Meadow canvas at the bottom */}
        <div ref={wrapRef} className="relative z-10 w-full mt-auto" style={{ height: size.h }}>
          <canvas
            ref={sceneRef}
            style={{ width: size.w, height: size.h }}
            className="absolute inset-0 block w-full"
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - r.left;
              const prev = pointerRef.current;
              pointerRef.current = { x, y: e.clientY - r.top, vx: prev ? x - prev.x : 0 };
            }}
            onPointerLeave={() => { pointerRef.current = null; }}
          />
        </div>
      </div>
    );
  }

  return (
    <footer
      id="garden"
      className="relative w-full select-none scroll-mt-12 overflow-hidden bg-white"
    >
      <style>{`
        /* Slow panoramic float animation for the dreamy cloudscape */
        @keyframes garden-drift {
          0% {
            transform: scale(1.02) translate3d(0, 0, 0);
          }
          50% {
            transform: scale(1.06) translate3d(-1%, -1.2%, 0);
          }
          100% {
            transform: scale(1.02) translate3d(0, 0, 0);
          }
        }
        .garden-bg-anim {
          animation: garden-drift 28s ease-in-out infinite alternate;
          will-change: transform;
          filter: saturate(0.78) brightness(1.06);
          opacity: 0.68;
        }

        /* Unified macOS Section Pill & Gradient matching Hero, About, Projects, and Contact */
        .gd-pill {
          position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: .45rem;
          border-radius: 9999px; border: 1px solid rgba(148,163,184,.45); padding: .4rem .9rem;
          font-size: 13px; font-weight: 500; color: #334155; white-space: nowrap;
          background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(245,245,248,0.85));
          box-shadow: inset 0 1px 1px #fff, inset 0 -1px 2px rgba(15,23,42,.05), 0 4px 10px -6px rgba(15,23,42,.2);
        }
        .gd-chip { padding: .24rem .7rem; font-size: 11.5px; }
        .gd-grad {
          background: linear-gradient(135deg, #0b0b10 10%, #4a1236 50%, #f0568f 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }

        /* Frosted Glass Artist Card (rock-solid, no hover scale to keep drawing synced) */
        .garden-glass {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(255, 245, 250, 0.85));
          -webkit-backdrop-filter: blur(24px) saturate(1.4);
          backdrop-filter: blur(24px) saturate(1.4);
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow: 0 0 0 1px rgba(255, 180, 200, 0.2), 0 24px 48px -12px rgba(130, 40, 70, 0.16);
        }
      `}</style>

      {/* Floating Animated Cloud Background Layer (Softened & Desaturated) */}
      <div
        aria-hidden
        className="garden-bg-anim pointer-events-none absolute inset-[-3%] bg-cover bg-center"
        style={{
          backgroundImage: "url('/assets/images/stickers/garden-background2.png')",
        }}
      />

      {/* Milky White Wash Overlay (Softens Saturation & Melts with Portfolio) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-1 bg-gradient-to-b from-white/40 via-[#e8f2fb]/45 to-[#f9e8ef]/35"
      />

      {/* Soft Gradient Fade from White Contact Section Above */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white via-white/80 to-transparent z-2"
      />

      {/* ── Content above the meadow ── */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 pt-16 sm:pt-24 pb-6">

        {/* Section Header Matching the Rest of the Portfolio */}
        <div className="text-center space-y-3">
          <span className="gd-pill gd-chip shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-pink-400" />
            <span>Interactive Meadow</span>
          </span>
          <h2 className="text-4xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight text-slate-900">
            Danah&apos;s <span className="gd-grad">secret garden.</span>
          </h2>
          <p className="mx-auto max-w-md text-base sm:text-lg text-slate-600">
            Leave a wildflower before you go. Draw a bloom and plant it into our shared meadow.
          </p>
        </div>

        {/* Drawing card — frosted glass easel (stable container, no scale jitter) */}
        <aside className="garden-glass mx-auto mt-7 w-full max-w-[310px] rounded-3xl p-5">
          <h3 className="text-center text-sm font-semibold tracking-tight text-slate-800">
            Draw a flower, plant it below
          </h3>

          {/* palette */}
          <div className="mt-3 flex items-center justify-center gap-2.5">
            {PAINT.map((p) => (
              <button
                key={p.hex}
                type="button"
                title={p.name}
                aria-label={p.name}
                onClick={() => setColor(p.hex)}
                style={{ backgroundColor: p.hex }}
                className={`h-7 w-7 rounded-full border border-black/10 transition ${color === p.hex
                  ? "scale-110 ring-2 ring-slate-800 ring-offset-2"
                  : "hover:scale-105"
                  }`}
              />
            ))}
          </div>

          {/* drawing canvas — strictly 1:1 square internal resolution matching display */}
          <div className="relative mt-3 aspect-square w-full touch-none rounded-2xl border border-slate-200/90 bg-white/95 shadow-inner overflow-hidden">
            {strokeCount === 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-xs font-medium text-slate-400">
                draw a flower, then a stem and a leaf
              </div>
            )}
            <canvas
              ref={padRef}
              width={520}
              height={520}
              className="absolute inset-0 h-full w-full cursor-crosshair rounded-2xl touch-none"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
            />
          </div>

          {/* controls */}
          <div className="mt-2.5 flex items-center justify-between text-xs font-medium text-slate-500">
            <button
              type="button"
              onClick={undo}
              disabled={strokeCount === 0}
              className="flex items-center gap-1 hover:text-slate-800 transition disabled:opacity-30"
            >
              <Undo2 className="h-3.5 w-3.5" />
              <span>undo</span>
            </button>
            <button
              type="button"
              onClick={handleSurprise}
              className="text-pink-600 hover:text-pink-700 font-semibold transition"
            >
              surprise me
            </button>
            <button
              type="button"
              onClick={clearPad}
              disabled={strokeCount === 0}
              className="flex items-center gap-1 hover:text-slate-800 transition disabled:opacity-30"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>clear</span>
            </button>
          </div>

          {/* plant button */}
          <button
            type="button"
            onClick={validateAndPlant}
            disabled={strokeCount === 0 || validating}
            className="relative mt-3.5 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-[#e0628f]/70 py-2.5 text-[14px] font-medium text-[#4a1230] transition active:translate-y-px disabled:opacity-40"
            style={{
              background: "linear-gradient(180deg,#ffc9db 0%,#ff9bbd 48%,#fb7fa9 52%,#ffa8c6 100%)",
              boxShadow: "inset 0 1px 1px rgba(255,255,255,.9), inset 0 -1px 2px rgba(190,40,100,.25), 0 8px 16px -6px rgba(244,114,182,.6)",
              textShadow: "0 1px 0 rgba(255,255,255,.55)",
            }}
          >
            <span className="pointer-events-none absolute inset-x-3 top-[3px] h-[44%] rounded-full bg-gradient-to-b from-white/75 to-white/5" />
            {validating ? (
              <>
                <svg className="relative h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="relative">Checking...</span>
              </>
            ) : (
              <>
                <Sprout className="relative h-4 w-4" />
                <span className="relative">Plant Wildflower</span>
              </>
            )}
          </button>
          <p className={`mt-1.5 min-h-[1.25rem] text-center text-xs font-medium transition-colors ${note.startsWith("Beautiful") || note.startsWith("Checking") ? "text-[#4f9a73]" : "text-rose-500"}`}>{note}</p>
        </aside>
      </div>

      {/* ── Full-bleed meadow at the footer ── */}
      <div ref={wrapRef} className="relative z-10 w-full" style={{ height: size.h }}>
        <canvas
          ref={sceneRef}
          style={{ width: size.w, height: size.h }}
          className="absolute inset-0 block w-full"
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - r.left;
            const prev = pointerRef.current;
            pointerRef.current = { x, y: e.clientY - r.top, vx: prev ? x - prev.x : 0 };
          }}
          onPointerLeave={() => { pointerRef.current = null; }}
        />

        {/* flower count badge */}
        <div className="absolute bottom-5 left-5 z-20 gd-pill gd-chip shadow-md">
          <span className="h-2 w-2 rounded-full bg-[#8fc3ea]" />
          <span className="font-semibold text-slate-800">{flowers.length} wildflowers blooming</span>
        </div>
      </div>

      {/* ── Translucent Footer credits ── */}
      <div className="relative z-20 w-full bg-white/75 py-4 text-center text-xs font-medium text-slate-600 backdrop-blur-md border-t border-white/50">
        Handcrafted with care by Mica Danah Paris &middot; Software Engineer &amp; Applied AI Developer
      </div>
    </footer>
  );
};

export const SecretGardenInWindow: React.FC = () => <DanahSecretGarden inWindow />;
