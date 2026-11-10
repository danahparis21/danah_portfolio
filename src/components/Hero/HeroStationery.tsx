"use client";

import React, { useEffect, useId, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { FileDown, ArrowDown, MapPin } from "lucide-react";
import { LinkedinIcon } from "@/components/UI/Icons";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { playUiClick } from "@/utils/sound";

interface HeroStationeryProps {
  onResumeClick?: () => void;
  onScrollDown?: () => void;
  /** Called with the folder id when a folder is clicked. Falls back to scrolling to #id. */
  onFolderClick?: (id: string) => void;
}

/* Scattered pink folders floating across the desktop */
const FOLDERS = [
  { id: "certificates", label: "Certificates", pos: "left-[41%] top-[24%]", rot: "-rotate-6" },
  { id: "projects",     label: "Projects",     pos: "left-[57%] top-[17%]", rot: "rotate-3" },
  { id: "tech-stack",   label: "Tech Stack",   pos: "left-[48%] top-[39%]", rot: "-rotate-3" },
  { id: "achievements", label: "Achievements", pos: "right-[3%] top-[48%]", rot: "rotate-6" },
  { id: "contact",      label: "Contact",      pos: "left-[43%] bottom-[6%]", rot: "rotate-3" },
  { id: "garden",       label: "Secret Garden",pos: "left-[61%] bottom-[8%]", rot: "-rotate-3" },
] as const;

/* Social links */
const SOCIALS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/mica-danah-paris-374a10289/",
    Icon: LinkedinIcon,
  },
];

/* ------------------------------------------------------------------ */
/*  Pink macOS-style folder (Matches About Me color exactly)          */
/* ------------------------------------------------------------------ */

const FolderIcon: React.FC = () => {
  const uid = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 120 94"
      className="w-full drop-shadow-[0_10px_12px_rgba(236,120,160,0.3)]"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${uid}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f9c0d1" />
          <stop offset="1" stopColor="#f3a6be" />
        </linearGradient>
        <linearGradient id={`${uid}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe0e8" />
          <stop offset="1" stopColor="#ffc2d2" />
        </linearGradient>
      </defs>
      <path
        d="M6 0H38C46 0 48 8 56 8H108A12 12 0 0 1 120 20V82A12 12 0 0 1 108 94H12A12 12 0 0 1 0 82V6A6 6 0 0 1 6 0Z"
        fill={`url(#${uid}b)`}
      />
      <g className="transition-transform duration-300 group-hover:-translate-y-[6px] group-focus-visible:-translate-y-[6px]">
        <rect x="7" y="14" width="106" height="50" rx="7" fill="#ffffff" />
      </g>
      <path
        d="M0 28A12 12 0 0 1 12 16H108A12 12 0 0 1 120 28V82A12 12 0 0 1 108 94H12A12 12 0 0 1 0 82Z"
        fill={`url(#${uid}f)`}
      />
    </svg>
  );
};

/* Draggable folder with macOS blue selection highlight on hover */
const DraggableFolder: React.FC<{
  label: string;
  rot: string;
  onOpen: () => void;
  size?: "sm" | "md";
}> = ({ label, rot, onOpen, size = "md" }) => {
  const isDragging = useRef(false);
  const isSm = size === "sm";

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => {
        isDragging.current = true;
      }}
      onDragEnd={() => {
        setTimeout(() => {
          isDragging.current = false;
        }, 120);
      }}
      whileDrag={{ scale: 1.15, cursor: "grabbing", zIndex: 60 }}
      className="cursor-grab active:cursor-grabbing select-none"
    >
      <button
        type="button"
        onClick={() => {
          if (!isDragging.current) {
            onOpen();
          }
        }}
        aria-label={`Open ${label}`}
        className={`group flex flex-col items-center outline-none ${
          isSm ? "w-20 gap-1" : "w-28 gap-1.5"
        }`}
      >
        <span
          className={`block origin-bottom transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:-translate-y-1.5 group-hover:rotate-0 group-hover:scale-[1.22] group-focus-visible:rotate-0 group-focus-visible:scale-[1.22] ${
            isSm ? "w-[48px]" : "w-[78px]"
          } ${rot}`}
        >
          <FolderIcon />
        </span>
        <span
          className={`mt-0.5 whitespace-nowrap rounded-md text-center font-medium leading-tight text-slate-700 bg-white/85 backdrop-blur-sm border border-slate-200/60 shadow-2xs transition-colors duration-150 group-hover:bg-[#007aff] group-hover:text-white group-hover:border-[#007aff] ${
            isSm ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[12px]"
          }`}
        >
          {label}
        </span>
      </button>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/*  3D Star Lily Point Cloud (Curved Chalice, Soft Depth & Glow)      */
/* ------------------------------------------------------------------ */

type Cloud = {
  n: number;
  x: Float32Array;
  y: Float32Array;
  z: Float32Array;
  r: Uint8Array;
  g: Uint8Array;
  b: Uint8Array;
  ink: Float32Array;
};

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildFlower(): Cloud {
  const rnd = mulberry(42);
  const P: number[][] = [];
  const push = (
    x: number, y: number, z: number,
    r: number, g: number, b: number, ink: number
  ) => P.push([x, y, z, r, g, b, ink]);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  // Flower head is angled so the viewer gazes into the open blooming chalice
  const flowerHeadY = 0.25;
  const flowerTilt = 0.44; // tilted toward camera for full 3D opening
  const cosT = Math.cos(flowerTilt);
  const sinT = Math.sin(flowerTilt);

  /* Petals: 6 broad, cupped petals opening upward like a blooming Easter / Stargazer Lily */
  const PETALS = 6;
  for (let k = 0; k < PETALS; k++) {
    const isInner = k % 2 === 1;
    const baseAngle = (k * Math.PI * 2) / PETALS + (isInner ? 0.06 : 0);
    const petalLen = isInner ? 1.48 : 1.62;
    const petalLift = isInner ? 0.16 : 0;
    const ct = Math.cos(baseAngle);
    const st = Math.sin(baseAngle);

    // Dense regular 2D grid (110 length steps x 64 width steps = 7,040 points per petal)
    // Completely eliminates Poisson clustering gaps, guaranteeing solid, gap-free petals with zero blank spaces!
    const U_STEPS = 110;
    const V_STEPS = 64;
    for (let iu = 0; iu < U_STEPS; iu++) {
      const u = (iu + 0.5) / U_STEPS;
      for (let iv = 0; iv < V_STEPS; iv++) {
        const v = ((iv + 0.5) / V_STEPS) * 2 - 1;

        // Broad oval/rounded petal width (not skinny spikes!)
        const widthProfile = 0.52 * Math.sin(Math.PI * Math.pow(u, 0.68)) * (1 - 0.12 * Math.pow(u, 3));
        const dist = petalLen * Math.pow(u, 0.9);

        // Flaring upward & outward trumpet curve
        let py = 0.92 * Math.pow(u, 0.78) - 0.38 * Math.pow(u, 2.0) + petalLift * u;
        py += 0.22 * (v * v) * Math.sin(Math.PI * u); // realistic cupped petal curve
        py += 0.02 * Math.sin(u * 14 + v * 3.5); // soft organic waviness

        const lateral = v * widthProfile;
        const px = dist * ct - lateral * st;
        const pz = dist * st + lateral * ct;

        // Tilt flower head toward the camera
        const rx = px;
        const ry = py * cosT - pz * sinT + flowerHeadY;
        const rz = py * sinT + pz * cosT;

        // Smooth continuous botanical shading (no hard edges or triangular wedges):
        // 1. Soft radial chartreuse throat glow at base of cup
        const throatGlow = Math.exp(-Math.pow(u / 0.24, 2.2));

        // 2. Smooth Gaussian midrib vein running down the central spine of the petal
        const ribVein = Math.exp(-Math.pow(v / 0.35, 2)) * Math.sin(Math.PI * Math.pow(u, 0.65));

        // 3. Petal body gradient along length u (rich ruby at base -> warm fuchsia -> glowing rose -> soft blush-white tips)
        let pr: number, pg: number, pb: number;
        if (u < 0.45) {
          const t = u / 0.45;
          pr = lerp(165, 235, t);
          pg = lerp(22, 50, t);
          pb = lerp(60, 118, t);
        } else {
          const t = (u - 0.45) / 0.55;
          pr = lerp(235, 255, t);
          pg = lerp(50, 218, t);
          pb = lerp(118, 238, t);
        }

        // Edge softening: slightly lighter towards lateral edges for natural petal translucency
        const edgeLight = Math.pow(Math.abs(v), 2) * 0.25;
        pr = lerp(pr, 255, edgeLight);
        pg = lerp(pg, 210, edgeLight);
        pb = lerp(pb, 235, edgeLight);

        // Blend smoothly with lime-green throat (no abrupt cutoff!)
        let r = lerp(pr, 115, throatGlow);
        let g = lerp(pg, 215, throatGlow);
        let b = lerp(pb, 28, throatGlow);

        // Blend soft magenta star midrib (smooth Gaussian blend without triangular edges)
        const ribStrength = ribVein * 0.42 * (1 - throatGlow * 0.85);
        r = lerp(r, 205, ribStrength);
        g = lerp(g, 18, ribStrength);
        b = lerp(b, 85, ribStrength);

        // Smooth continuous ink density
        let ink = lerp(0.96, 0.75, Math.pow(u, 1.1)) + 0.12 * ribStrength;

        // Organic freckles clustered in the lower cup (smooth radial probability)
        const freckleProb = 0.08 * Math.exp(-Math.pow((u - 0.32) / 0.16, 2)) * Math.exp(-Math.pow(v / 0.5, 2));
        if (rnd() < freckleProb) {
          r = 135;
          g = 18;
          b = 52;
          ink = 1.0;
        }

        push(rx, ry, rz, Math.round(r), Math.round(g), Math.round(b), ink);
      }
    }
  }

  /* Stamens: 6 prominent filaments rising from the center with large pollen anthers */
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI * 2) / 6 + 0.28;
    const filamentLen = 0.75;
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const frho = filamentLen * Math.pow(t, 0.85);
      const fx = frho * Math.cos(a);
      const fz = frho * Math.sin(a);
      const fy = 0.12 + 0.75 * t - 0.22 * t * t;
      const rx = fx;
      const ry = fy * cosT - fz * sinT + flowerHeadY;
      const rz = fy * sinT + fz * cosT;
      // Spring green at base to vivid golden filament
      push(rx, ry, rz, Math.round(lerp(120, 245, t)), Math.round(lerp(205, 158, t)), Math.round(lerp(25, 11, t)), 0.9);
    }
    // Pollen anthers at tips
    const tipX = filamentLen * Math.cos(a);
    const tipZ = filamentLen * Math.sin(a);
    const tipY = 0.12 + 0.75 - 0.22;
    for (let i = 0; i < 40; i++) {
      const ox = (rnd() - 0.5) * 0.14;
      const oy = (rnd() - 0.5) * 0.08;
      const oz = (rnd() - 0.5) * 0.14;
      const rx = tipX + ox;
      const ry = (tipY + oy) * cosT - (tipZ + oz) * sinT + flowerHeadY;
      const rz = (tipY + oy) * sinT + (tipZ + oz) * cosT;
      // Terracotta red-brown
      push(rx, ry, rz, 180, 60, 20, 1.0);
    }
  }

  // Central Pistil / Stigma:
  for (let i = 0; i <= 36; i++) {
    const t = i / 36;
    const py = 0.18 + 0.88 * t;
    const px = 0.08 * t * Math.sin(t * 2);
    const pz = 0.08 * t * Math.cos(t * 2);
    const rx = px;
    const ry = py * cosT - pz * sinT + flowerHeadY;
    const rz = py * sinT + pz * cosT;
    push(rx, ry, rz, 101, 163, 13, 0.95);
  }

  /* Stem: rich emerald botanical stalk */
  const stemX = (y: number) => 0.14 * Math.sin(-y * 0.9);
  for (let i = 0; i < 2600; i++) {
    const s = rnd();
    const y = -3.2 * s;
    const a = rnd() * Math.PI * 2;
    const rad = 0.065 * (1 + 0.3 * s);
    push(
      stemX(y) + Math.cos(a) * rad,
      y + flowerHeadY,
      Math.sin(a) * rad,
      Math.round(lerp(34, 15, s)),
      Math.round(lerp(197, 120, s)),
      Math.round(lerp(94, 45, s)),
      0.85 + 0.15 * rnd()
    );
  }

  /* Broad, graceful leaves */
  const leaf = (yAttach: number, phi: number, len: number, wid: number) => {
    const bx = stemX(yAttach);
    const dx = Math.cos(phi);
    const dz = Math.sin(phi);
    const LU = 70;
    const LV = 36;
    for (let iu = 0; iu < LU; iu++) {
      const u = (iu + 0.5) / LU;
      for (let iv = 0; iv < LV; iv++) {
        const v = ((iv + 0.5) / LV) * 2 - 1;
        const w = wid * Math.sin(Math.PI * Math.pow(u, 0.85));
        const rho = len * u;
        const h = 0.5 * len * u - 0.65 * len * u * u;
        const t = v * w;
        const rib = Math.abs(v) < 0.08;
        push(
          bx + rho * dx - t * dz,
          yAttach + h + flowerHeadY,
          rho * dz + t * dx,
          rib ? 84 : Math.round(lerp(34, 16, u)),
          rib ? 222 : Math.round(lerp(185, 115, u)),
          rib ? 128 : Math.round(lerp(85, 45, u)),
          rib ? 1.0 : 0.88
        );
      }
    }
  };
  leaf(-0.6, 0.6, 1.45, 0.26);
  leaf(-1.2, Math.PI + 0.45, 1.35, 0.24);
  leaf(-1.8, 0.9 + Math.PI * 0.5, 1.2, 0.22);

  const n = P.length;
  const c: Cloud = {
    n,
    x: new Float32Array(n),
    y: new Float32Array(n),
    z: new Float32Array(n),
    r: new Uint8Array(n),
    g: new Uint8Array(n),
    b: new Uint8Array(n),
    ink: new Float32Array(n),
  };
  P.forEach((p, i) => {
    c.x[i] = p[0]; c.y[i] = p[1]; c.z[i] = p[2];
    c.r[i] = p[3]; c.g[i] = p[4]; c.b[i] = p[5];
    c.ink[i] = p[6];
  });
  return c;
}

/* Character ramp with solid visible glyphs */
const RAMP = ".:+*x7S8WoW%#@";

/* ------------------------------------------------------------------ */
/*  Free-Floating Screen ASCII Flower (Open Bloom, Glow & Soft Depth) */
/* ------------------------------------------------------------------ */

const AsciiFlower: React.FC<{ angleLabelRef: React.RefObject<HTMLSpanElement | null> }> = ({
  angleLabelRef,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cloud = useMemo(buildFlower, []);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0, h = 0, dpr = 1, cols = 0, rows = 0, CW = 8, CH = 10;
    let zbuf = new Float32Array(0);
    let pidx = new Int32Array(0);

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      w = r.width; h = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      CW = w < 520 ? 4.0 : w < 1024 ? 4.5 : 5.0;
      CH = CW * 1.25;
      cols = Math.ceil(w / CW);
      rows = Math.ceil(h / CH);
      zbuf = new Float32Array(cols * rows);
      pidx = new Int32Array(cols * rows);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let angle = 0.6;
    let vel = 0;
    const auto = reduced ? 0 : 0.45; // rad/s
    let dragging = false;
    let lastX = 0;
    let visible = true;
    let raf = 0;
    let last = performance.now();
    let frameNo = 0;

    const down = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      angle += dx * 0.012;
      vel = dx * 0.6;
    };
    const up = () => { dragging = false; };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);

    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; });
    io.observe(wrap);

    const TILT = 0.38;
    const ca = Math.cos(TILT), sa = Math.sin(TILT);
    const TAU = Math.PI * 2;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) { last = now; return; }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!dragging) {
        angle += (auto + vel) * dt;
        vel *= 0.94;
      }

      const cs = Math.cos(angle), sn = Math.sin(angle);
      const isMobile = w < 640;
      const isTablet = w >= 640 && w < 1024;

      // Responsive scale:
      // - Mobile (<640px): compact bloom to fit comfortably in a 250px container
      // - Tablet (640-1023px): modest scale so it never overpowers intermediate resized windows
      // - Desktop (>=1024px): fine-tuned sweet-spot centerpiece (~6% smaller than previous, perfect balance)
      const scale = isMobile
        ? Math.min(h / 3.2, w / 2.1)
        : isTablet
        ? Math.min(h / 2.85, w / 1.95)
        : Math.min(h / 2.28, w / 1.56);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      zbuf.fill(-1e9);

      const { n, x, y, z } = cloud;
      for (let i = 0; i < n; i++) {
        const x1 = x[i] * cs + z[i] * sn;
        const z1 = -x[i] * sn + z[i] * cs;
        const y2 = y[i] * ca - z1 * sa;
        const z2 = z1 * ca + y[i] * sa;
        const s = 6 / (6 - z2);
        const sx = w / 2 + x1 * scale * s;
        // Calibrated vertical headroom anchor per breakpoint
        const yOffset = isMobile ? -0.06 : isTablet ? -0.14 : -0.20;
        const sy = h / 2 - (y2 + yOffset) * scale * s;
        const col = (sx / CW) | 0;
        const row = (sy / CH) | 0;
        if (col < 0 || row < 0 || col >= cols || row >= rows) continue;
        const idx = row * cols + col;
        if (z2 > zbuf[idx]) { zbuf[idx] = z2; pidx[idx] = i; }
      }

      ctx.font = `700 ${CH * 0.98}px ui-monospace, Menlo, Consolas, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const tick = (now / 220) | 0;

      for (let idx = 0; idx < zbuf.length; idx++) {
        const z2 = zbuf[idx];
        if (z2 < -1e8) continue;
        const i = pidx[idx];
        const d = Math.max(0, Math.min(1, (z2 + 1.4) / 2.8));
        const ink = cloud.ink[i] * (0.6 + 0.4 * d);
        let ci = Math.min(RAMP.length - 1, (ink * RAMP.length) | 0);
        if ((idx * 31 + tick * 17) % 13 === 0) ci = Math.max(0, ci - 1);
        const a = 0.78 + 0.22 * d;
        ctx.fillStyle = `rgba(${cloud.r[i]},${cloud.g[i]},${cloud.b[i]},${a.toFixed(2)})`;
        // Soft glowing halo effect for realistic photographic bloom
        ctx.shadowColor = `rgba(${cloud.r[i]},${cloud.g[i]},${cloud.b[i]},0.35)`;
        ctx.shadowBlur = 3;
        const col = idx % cols;
        const row = (idx / cols) | 0;
        ctx.fillText(RAMP[ci], col * CW + CW / 2, row * CH + CH / 2);
      }
      // Reset shadow for next frame
      ctx.shadowBlur = 0;

      if (angleLabelRef.current && ++frameNo % 6 === 0) {
        angleLabelRef.current.textContent = `${String(
          Math.round((((angle % TAU) + TAU) % TAU) * (180 / Math.PI))
        ).padStart(3, "0")}°`;
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    };
  }, [cloud, angleLabelRef]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        aria-label="Interactive rotating ASCII star lily flower"
        role="img"
        className="block cursor-grab touch-pan-y active:cursor-grabbing"
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main Hero Section                                                 */
/* ------------------------------------------------------------------ */

export const HeroStationery: React.FC<HeroStationeryProps> = ({
  onResumeClick,
  onScrollDown,
  onFolderClick,
}) => {
  const angleRef = useRef<HTMLSpanElement>(null);

  const openFolder = (id: string) => {
    playUiClick(true);
    if (onFolderClick) return onFolderClick(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative overflow-hidden bg-[#f8f8fa]">
      <style>{`
        @keyframes hs-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .hs-float {
          animation: hs-float 6s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hs-float { animation: none; }
        }
      `}</style>

      {/* Faint ambient grid + soft blush glow behind the flower */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 72% 44%, rgba(254,205,226,0.35), transparent 48%), radial-gradient(rgba(15,23,42,0.12) 1.2px, transparent 1.3px)",
          backgroundSize: "100% 100%, 36px 36px",
          WebkitMaskImage: "linear-gradient(to bottom, #000 82%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, #000 82%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-8 sm:pt-14 pb-8 sm:pb-20">
        {/* Pink scattered draggable folders across the desktop (large screens) */}
        <div className="pointer-events-none absolute inset-0 z-20 hidden lg:block">
          {FOLDERS.map((f, i) => (
            <div key={f.id} className={`absolute ${f.pos} pointer-events-auto`}>
              <div
                className="hs-float"
                style={{ animationDelay: `${i * -1.1}s` }}
              >
                <DraggableFolder
                  label={f.label}
                  rot={f.rot}
                  onOpen={() => openFolder(f.id)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 items-center gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Ultra-Readable Editorial Typography with Fade Gradient */}
          <div className="relative z-10 space-y-4 sm:space-y-6 text-left lg:col-span-6 lg:pr-2">
            <div className="space-y-3 sm:space-y-4">
              {/* Refined Portfolio Eyebrow */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-pink-200/90 bg-white/85 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-semibold tracking-wider text-pink-700 shadow-2xs backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
                  PORTFOLIO &middot; 2026
                </span>
              </div>

              {/* Ultra-readable, sleek modern typography with delicate fade gradient */}
              <h1 className="text-4xl sm:text-6xl lg:text-[5.25rem] font-black tracking-tight text-slate-900 leading-[0.96]">
                <span className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Mica Danah
                </span>
                <br />
                <span className="bg-gradient-to-r from-slate-950 via-slate-800 to-[#ec4899] bg-clip-text text-transparent">
                  Paris
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-[15px] sm:text-xl lg:text-2xl font-bold tracking-tight text-slate-800 pt-0.5 sm:pt-1">
                Turning complex systems into delightful, intuitive experiences.
              </p>

              {/* Tagline */}
              <p className="max-w-md text-xs sm:text-base leading-relaxed text-slate-600">
                {PORTFOLIO_DATA.profile.tagline}
              </p>

              {/* Location Badge */}
              <div className="pt-0.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-200/80 bg-white/80 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-medium text-slate-700 shadow-2xs backdrop-blur-md">
                  <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-pink-500" />
                  Based in the Philippines
                </span>
              </div>
            </div>

            {/* macOS Aqua Jelly & Frosted Glass Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-1 sm:pt-2">
              {/* Pink Jelly Pill Button for Resume */}
              <a
                href={PORTFOLIO_DATA.profile.resumePath}
                download="MicaDanahParis_Resume.pdf"
                onClick={() => {
                  playUiClick(true);
                  onResumeClick?.();
                }}
                className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-[#e0628f]/70 px-4 py-2.5 sm:px-7 sm:py-3 text-xs sm:text-[15px] font-semibold text-[#4a1230] transition hover:brightness-105 active:translate-y-px active:brightness-95 shadow-md"
                style={{
                  background:
                    "linear-gradient(180deg, #ffc9db 0%, #ff9bbd 48%, #fb7fa9 52%, #ffa8c6 100%)",
                  boxShadow:
                    "inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -1px 2px rgba(190,40,100,0.25), 0 8px 16px -6px rgba(244,114,182,0.6)",
                  textShadow: "0 1px 0 rgba(255,255,255,0.55)",
                }}
              >
                {/* Specular highlight shine */}
                <span className="pointer-events-none absolute inset-x-3 top-[3px] h-[44%] rounded-full bg-gradient-to-b from-white/80 to-white/10" />
                <FileDown className="relative h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="relative">Download Resume</span>
              </a>

              {/* Frosted silver glass button for Read Story */}
              {onScrollDown && (
                <button
                  type="button"
                  onClick={onScrollDown}
                  className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-slate-300/80 px-4 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-[15px] font-medium text-slate-800 transition hover:bg-white active:translate-y-px active:brightness-95 shadow-xs"
                  style={{
                    background: "linear-gradient(180deg, #ffffff 0%, #f1f2f5 100%)",
                    boxShadow:
                      "inset 0 1px 1px rgba(255,255,255,1), inset 0 -1px 2px rgba(15,23,42,0.08), 0 8px 16px -8px rgba(15,23,42,0.25)",
                  }}
                >
                  <span>See what I&apos;ve built</span>
                  <ArrowDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-500" />
                </button>
              )}

              {/* LinkedIn icon button */}
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  onClick={() => playUiClick(true)}
                  className="relative inline-flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center overflow-hidden rounded-full border border-slate-300/80 text-slate-700 transition hover:bg-white hover:text-slate-950 active:translate-y-px shadow-xs"
                  style={{
                    background: "linear-gradient(180deg, #ffffff 0%, #f1f2f5 100%)",
                    boxShadow:
                      "inset 0 1px 1px rgba(255,255,255,1), inset 0 -1px 2px rgba(15,23,42,0.08), 0 8px 16px -8px rgba(15,23,42,0.25)",
                  }}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Right Column: Free-Floating 3D Star Lily (Open Bloom Chalice with Depth & Soft Glow) */}
          <div className="relative z-10 lg:col-span-6">
            <div
              className="relative h-[250px] sm:h-[380px] lg:h-[700px] w-full"
              style={{
                WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 80%, transparent 99%)",
                maskImage: "linear-gradient(to bottom, black 0%, black 80%, transparent 99%)",
              }}
            >
              <AsciiFlower angleLabelRef={angleRef} />

              {/* Floating editorial ASCII telemetry */}
              <div className="pointer-events-none absolute left-3 top-2 sm:top-4 font-mono text-[9px] sm:text-[10px] leading-relaxed text-slate-400 select-none">
                <p className="font-semibold tracking-wider text-slate-600">SUBJECT: STAR LILY</p>
                <p className="hidden sm:block">CHARSET: 7 8 W S A</p>
                <p>PETALS: 06 &middot; DENSITY: ULTRA</p>
                <p className="hidden sm:block">MODE: PIXEL TO TEXT</p>
              </div>

              <div className="pointer-events-none absolute right-4 bottom-3 sm:bottom-12 text-right font-mono text-[9px] sm:text-[10px] leading-relaxed text-slate-400 select-none">
                <p>
                  ROT: <span ref={angleRef} className="font-semibold text-pink-600">034°</span>
                </p>
                <p className="tracking-wider">DRAG TO SPIN</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pink Desktop Folders for Mobile / Tablet View (Compact Mini-Folders) */}
        <div className="relative z-10 mt-6 sm:mt-8 lg:hidden">
          <div className="flex items-center gap-3 overflow-x-auto px-2 py-2 no-scrollbar justify-start sm:justify-center">
            {FOLDERS.map((f) => (
              <div key={f.id} className="shrink-0">
                <DraggableFolder
                  label={f.label}
                  rot={f.rot}
                  size="sm"
                  onOpen={() => openFolder(f.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
