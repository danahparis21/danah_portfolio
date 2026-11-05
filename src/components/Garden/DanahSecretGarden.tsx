"use client";

/**
 * Danah's Secret Garden — Redesigned
 * ------------------------------------------------------------------
 * - Matches the portfolio's macOS aesthetic: white bg, dot pattern,
 *   ambient pastel gradient blobs.
 * - Elegant curved serif (Cormorant Garamond) for the garden vibe.
 * - Flowers grow in a full-bleed meadow strip at the very bottom,
 *   inspired by the Surf footer meadow.
 * - Drawing pad in a frosted-glass card above the meadow.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { RotateCcw, Sprout, Undo2 } from "lucide-react";
import { playPlantChime, playUiClick } from "@/utils/sound";

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

const RED = "#d8503f";
const ORANGE = "#ee9249";
const YELLOW = "#f3cb5a";
const BLUSH = "#f2a6bd";
const LEAF = "#3f7a3a";

const PAINT = [
  { name: "Poppy", hex: RED },
  { name: "Apricot", hex: ORANGE },
  { name: "Butter", hex: YELLOW },
  { name: "Blush", hex: BLUSH },
  { name: "Leaf", hex: LEAF },
];

const FONT_GARDEN = '"Cormorant Garamond", "Playfair Display", Georgia, serif';
const FONT_HAND = '"Caveat", "Segoe Print", "Bradley Hand", cursive';
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
    ctx.strokeStyle = s.c;
    ctx.fillStyle = s.c;
    if (closed) {
      ctx.globalAlpha = 0.22;
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

const petalLoop = (cx: number, cy: number, ang: number, len: number, wid: number, rand: () => number) => {
  const out: number[] = [];
  const n = 12;
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const lx = Math.cos(t) * len * (1 + (rand() - 0.5) * 0.14);
    const ly = Math.sin(t) * wid * (1 + (rand() - 0.5) * 0.14);
    out.push(r1(cx + lx * Math.cos(ang) - ly * Math.sin(ang)), r1(cy + lx * Math.sin(ang) + ly * Math.cos(ang)));
  }
  out.push(out[0], out[1]);
  return out;
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

const makeFlower = (seed: number): Stroke[] => {
  const rand = mulberry(seed);
  const lean = (rand() - 0.5) * 14;
  const cx = 50 + lean;
  const cy = 42;
  const side = rand() > 0.5 ? 1 : -1;
  const lx = 50 + lean * 0.55;
  const ly = 78;
  const strokes: Stroke[] = [
    { c: LEAF, w: 2.2, p: [r1(50 + lean * 0.15), 97, r1(50 + lean * 0.5), 84, r1(50 + lean * 0.85), 68, r1(cx), 54] },
    {
      c: LEAF, w: 1.8,
      p: [r1(lx), ly, r1(lx + side * 6), ly - 9, r1(lx + side * 15), ly - 6, r1(lx + side * 10), ly + 3, r1(lx), ly],
    },
  ];
  const petalColors = [RED, ORANGE, YELLOW, BLUSH];
  const pc = petalColors[Math.floor(rand() * petalColors.length)];
  const centre = pc === YELLOW ? ORANGE : YELLOW;

  if (rand() < 0.28) {
    strokes.push({
      c: pc, w: 2,
      p: [cx - 11, cy - 12, cx - 12, cy + 2, cx - 6, cy + 12, cx, cy + 14, cx + 6, cy + 12, cx + 12, cy + 2, cx + 11, cy - 12, cx + 5, cy - 4, cx, cy - 13, cx - 5, cy - 4, cx - 11, cy - 12].map(r1),
    });
    strokes.push({ c: pc, w: 1.5, p: [r1(cx), cy - 12, r1(cx + (rand() - 0.5) * 3), cy + 9] });
  } else {
    const n = 5 + Math.floor(rand() * 3);
    for (let k = 0; k < n; k++) {
      const ang = (k / n) * Math.PI * 2 + rand() * 0.3;
      strokes.push({ c: pc, w: 1.9, p: petalLoop(cx + Math.cos(ang) * 11, cy + Math.sin(ang) * 11, ang, 9.5, 6, rand) });
    }
    strokes.push({ c: centre, w: 1.8, p: spiral(cx, cy, 4.5) });
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
  paintLayer(h - 155, "#2a5620", "#1f3f18", "#1d4c16", 360, 52, 7.1);
  paintLayer(h - 105, "#387028", "#2a5620", "#2d5f24", 330, 42, 13.3);
  paintLayer(h - 58, "#4a8a38", "#367028", "#3d7830", 290, 32, 19.7);

  /* scattered leaf clusters */
  const lr = mulberry(500);
  for (let i = 0; i < 55; i++) {
    const x = lr() * w;
    const y = h - 12 - lr() * 125;
    ctx.fillStyle = `rgba(42, 88, 32, ${0.22 + lr() * 0.3})`;
    for (let j = 0; j < 3; j++) {
      ctx.beginPath();
      ctx.ellipse(x + (j - 1) * 5, y + lr() * 4, 2.5 + lr() * 3, 4.5 + lr() * 4, lr() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* small decorative wildflowers baked into the static grass */
  const petalCols = [BLUSH, YELLOW, "#ffffff", "#f5c6d0", "#ffd9a6"];
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
    ctx.fillStyle = YELLOW;
    ctx.beginPath();
    ctx.arc(x, y, 1.5 + lr(), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  return c;
};

/* ───────────────────────── component ───────────────────────── */

export const DanahSecretGarden: React.FC = () => {
  const [flowers, setFlowers] = useState<Flower[]>(makeSeeds);
  const [size, setSize] = useState({ w: 900, h: 300 });
  const [color, setColor] = useState<string>(BLUSH);
  const [strokeCount, setStrokeCount] = useState<number>(0);
  const [note, setNote] = useState<string>("");

  const wrapRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<HTMLCanvasElement>(null);
  const flowersRef = useRef<Flower[]>(flowers);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const inViewRef = useRef<boolean>(false);
  const spriteCache = useRef(new Map<string, HTMLCanvasElement>());
  const strokesRef = useRef<Stroke[]>([]);
  const curRef = useRef<Stroke | null>(null);
  const lastPlant = useRef<number>(0);
  const firstLoad = useRef<boolean>(true);
  flowersRef.current = flowers;

  /* fonts */
  useEffect(() => {
    const id = "danah-garden-fonts";
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id;
    l.rel = "stylesheet";
    l.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400;1,500&family=Caveat:wght@500;700&display=swap";
    document.head.appendChild(l);
  }, []);

  /* responsive size + visibility */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = Math.round(e.contentRect.width);
      if (w > 0) {
        const mh = w < 640 ? 230 : w < 1024 ? 270 : 310;
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

  /* scene render loop */
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

    /* meadow flower positioning constants */
    const meadowTop = size.h * 0.12;
    const meadowBot = size.h * 0.82;

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
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!inViewRef.current) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bg, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

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
      }

      for (const { f, px, x, y } of items) {
        let s = 1;
        if (f.t !== undefined) s = easeOutBack(clamp((now - f.t) / 900, 0, 1));
        if (hover === f.id) s *= 1.15;
        const sway = Math.sin(now / 900 + hashId(f.id)) * 0.035;
        ctx.fillStyle = "rgba(30, 60, 20, 0.18)";
        ctx.beginPath();
        ctx.ellipse(x, y + 1, px * 0.11 * s, px * 0.035 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(sway);
        ctx.scale(s, s);
        ctx.drawImage(getSprite(f, px), -px / 2, -px * 0.96, px, px);
        ctx.restore();
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [size]);

  /* drawing pad */
  const redrawPad = useCallback(() => {
    const c = padRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    const all = curRef.current ? [...strokesRef.current, curRef.current] : strokesRef.current;
    paintStrokes(ctx, all, c.width / 100, 1.1);
  }, []);

  useEffect(() => {
    const c = padRef.current;
    if (c) { c.width = 520; c.height = 520; }
  }, []);

  const padPoint = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const r = e.currentTarget.getBoundingClientRect();
    return [
      r1(clamp(((e.clientX - r.left) / r.width) * 100, 0, 100)),
      r1(clamp(((e.clientY - r.top) / r.height) * 100, 0, 100)),
    ];
  };

  const totalPoints = () => strokesRef.current.reduce((a, s) => a + s.p.length, 0);

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (strokesRef.current.length >= 14) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const [x, y] = padPoint(e);
    curRef.current = { c: color, w: 2, p: [x, y] };
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

  const onUp = () => {
    const cur = curRef.current;
    if (!cur) return;
    if (cur.p.length < 4) cur.p.push(r1(cur.p[0] + 0.1), r1(cur.p[1] + 0.1));
    strokesRef.current.push(cur);
    curRef.current = null;
    setStrokeCount(strokesRef.current.length);
    redrawPad();
  };

  const undo = () => {
    playUiClick(true);
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

  const handleSurprise = () => plant(makeFlower(Math.floor(Math.random() * 1e9)));

  return (
    <footer
      id="garden"
      className="relative w-full select-none scroll-mt-12 overflow-hidden bg-white"
    >
      {/* Dot pattern — matches body */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(0,0,0,0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Ambient pastel gradient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[8%] h-[380px] w-[380px] rounded-full bg-[#ffc9dc] opacity-30 blur-3xl" />
        <div className="absolute right-[12%] top-[15%] h-[400px] w-[400px] rounded-full bg-[#d9ccff] opacity-25 blur-3xl" />
        <div className="absolute left-[45%] top-[30%] h-[320px] w-[320px] rounded-full bg-[#ffe3cc] opacity-20 blur-3xl" />
      </div>

      {/* ── Content above the meadow ── */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 pt-20 sm:pt-28 pb-10">
        {/* Title */}
        <div className="text-center">
          <h2
            className="text-5xl sm:text-7xl font-light italic tracking-tight text-slate-700"
            style={{ fontFamily: FONT_GARDEN }}
          >
            Danah&apos;s Secret Garden
          </h2>
          <p
            className="mt-4 text-lg sm:text-xl text-slate-400"
            style={{ fontFamily: FONT_HAND }}
          >
            Leave a wildflower before you go.
          </p>
        </div>

        {/* Drawing card — frosted glass */}
        <aside className="glass-panel mx-auto mt-10 w-full max-w-[300px] rounded-2xl p-5">
          <p
            className="text-center text-xl text-slate-600"
            style={{ fontFamily: FONT_HAND }}
          >
            Draw a flower, plant it below
          </p>

          {/* palette */}
          <div className="mt-3 flex items-center justify-center gap-3">
            {PAINT.map((p) => (
              <button
                key={p.hex}
                type="button"
                title={p.name}
                aria-label={p.name}
                onClick={() => setColor(p.hex)}
                style={{ backgroundColor: p.hex }}
                className={`h-7 w-7 rounded-full border border-black/10 transition ${
                  color === p.hex
                    ? "scale-110 ring-2 ring-slate-400 ring-offset-2"
                    : "hover:scale-110"
                }`}
              />
            ))}
          </div>

          {/* drawing canvas */}
          <div className="relative mt-3 aspect-square w-full touch-none rounded-xl border border-slate-200 bg-white">
            {strokeCount === 0 && (
              <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-lg text-slate-300"
                style={{ fontFamily: FONT_HAND }}
              >
                draw a flower, then a stem and a leaf
              </div>
            )}
            <canvas
              ref={padRef}
              className="absolute inset-0 h-full w-full cursor-crosshair"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
            />
          </div>

          {/* controls */}
          <div
            className="mt-2 flex items-center justify-between text-lg"
            style={{ fontFamily: FONT_HAND, color: "#64748b" }}
          >
            <button
              type="button"
              onClick={undo}
              disabled={strokeCount === 0}
              className="flex items-center gap-1 disabled:opacity-30"
            >
              <Undo2 className="h-4 w-4" />
              <span>undo</span>
            </button>
            <button
              type="button"
              onClick={handleSurprise}
              className="underline-offset-4 hover:underline"
            >
              surprise me
            </button>
            <button
              type="button"
              onClick={() => { playUiClick(true); clearPad(); }}
              disabled={strokeCount === 0}
              className="flex items-center gap-1 disabled:opacity-30"
            >
              <RotateCcw className="h-4 w-4" />
              <span>clear</span>
            </button>
          </div>

          {/* plant button */}
          <button
            type="button"
            onClick={handlePlant}
            disabled={strokeCount === 0}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#4a8a3a] py-2.5 text-lg text-white transition hover:bg-[#3d7530] active:scale-[0.98] disabled:opacity-30"
            style={{ fontFamily: FONT_HAND }}
          >
            <Sprout className="h-5 w-5" />
            <span>Plant it</span>
          </button>
          <p className="mt-2 min-h-[1.25rem] text-center text-xs text-rose-400">{note}</p>
        </aside>
      </div>

      {/* ── Full-bleed meadow at the footer ── */}
      <div ref={wrapRef} className="relative w-full" style={{ height: size.h }}>
        <canvas
          ref={sceneRef}
          style={{ width: size.w, height: size.h }}
          className="absolute inset-0 block w-full"
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            pointerRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
          }}
          onPointerLeave={() => { pointerRef.current = null; }}
        />

        {/* flower count badge */}
        <div
          className="absolute bottom-4 left-4 z-10 rounded-full bg-white/80 px-3 py-1 text-lg shadow-sm backdrop-blur-sm"
          style={{ fontFamily: FONT_HAND, color: "#4a7a3a" }}
        >
          {flowers.length} flowers growing here
        </div>
      </div>

      {/* ── Footer credits ── */}
      <div className="w-full bg-white/80 py-4 text-center text-xs text-slate-400 backdrop-blur-sm">
        Handcrafted with care by Mica Danah Paris &middot; Software Engineer &amp; Applied AI Developer
      </div>
    </footer>
  );
};
