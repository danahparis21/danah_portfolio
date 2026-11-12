"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Pixelify_Sans } from "next/font/google";
import { FileDown, ArrowDown, MapPin } from "lucide-react";
import { LinkedinIcon } from "@/components/UI/Icons";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { playUiClick } from "@/utils/sound";

/* Pixel display font for the name, role and statement */
const pixel = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

interface HeroStationeryProps {
  /** Set to false while a loader overlay sits on top; the boot sequence starts when it becomes true. */
  ready?: boolean;
  onResumeClick?: () => void;
  onScrollDown?: () => void;
  /** Called with the folder id when a folder is clicked. Falls back to scrolling to #id. */
  onFolderClick?: (id: string) => void;
}

/* Scattered pink folders floating across the desktop */
const FOLDERS = [
  { id: "certificates", label: "Certificates", pos: "left-[41%] top-[24%]", rot: "-rotate-6" },
  { id: "projects", label: "Projects", pos: "left-[57%] top-[17%]", rot: "rotate-3" },
  { id: "tech-stack", label: "Tech Stack", pos: "left-[48%] top-[39%]", rot: "-rotate-3" },
  { id: "achievements", label: "Achievements", pos: "right-[3%] top-[48%]", rot: "rotate-6" },
  { id: "contact", label: "Contact", pos: "left-[43%] bottom-[6%]", rot: "rotate-3" },
  { id: "garden", label: "Secret Garden", pos: "left-[61%] bottom-[8%]", rot: "-rotate-3" },
] as const;

/* Social links */
const SOCIALS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/mica-danah-paris-374a10289/",
    Icon: LinkedinIcon,
  },
];

/* Boot sequence timeline (seconds after the hero starts booting) */
const T = {
  name: 0.3,
  role: 0.95,
  statement: 1.65,
  folders: 1.3,
  location: 2.4,
  buttons: 2.2,
  hud: 0.4,
};
/* Collaborator cursors */
const CURSOR_COLOR = "#ec4899"; // one color for every cursor, box and tag
const CURSOR_NAMES = ["Mica", "Danah", "Paris", "Pixel", "Bot", "AI"];
const BOOT_MS = 3800; // flower formation time
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

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
        className={`group flex flex-col items-center outline-none ${isSm ? "w-20 gap-1" : "w-28 gap-1.5"
          }`}
      >
        <span
          className={`block origin-bottom transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:-translate-y-1.5 group-hover:rotate-0 group-hover:scale-[1.22] group-focus-visible:rotate-0 group-focus-visible:scale-[1.22] ${isSm ? "w-[48px]" : "w-[78px]"
            } ${rot}`}
        >
          <FolderIcon />
        </span>
        <span
          className={`mt-0.5 whitespace-nowrap rounded-md text-center font-medium leading-tight text-slate-700 bg-white/85 backdrop-blur-sm border border-slate-200/60 shadow-2xs transition-colors duration-150 group-hover:bg-[#007aff] group-hover:text-white group-hover:border-[#007aff] ${isSm ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[12px]"
            }`}
        >
          {label}
        </span>
      </button>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/*  Boot-sequence helpers: multiplayer-cursor "timelapse" build        */
/* ------------------------------------------------------------------ */

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Vec = [number, number];
const SCRAMBLE = "01#%&$<>/|+*=_";

/** Figma / Canva style multiplayer cursor with a name tag */
const Cursor: React.FC<{ color: string; name: string }> = ({ color, name }) => (
  <span aria-hidden className="pointer-events-none absolute left-0 top-0 z-40 block">
    <svg
      width="20"
      height="24"
      viewBox="0 0 20 24"
      className="block drop-shadow-[0_2px_3px_rgba(15,23,42,0.28)]"
    >
      <path
        d="M2 1.5v18.2l4.7-4.4 3.3 7.4 3.3-1.5-3.2-7.2h6.6L2 1.5Z"
        fill={color}
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
    <span
      className="absolute left-4 top-5 whitespace-nowrap rounded-full px-2 py-[2px] text-[10px] font-semibold leading-tight text-white shadow-sm"
      style={{ background: color }}
    >
      {name}
    </span>
  </span>
);

/**
 * A collaborator "builds" this element: a cursor flies in, grabs the bottom-right
 * handle of a selection box and drags it open while the element is revealed
 * behind it (like a Canva / Figma timelapse). Then the box and cursor leave.
 */
const BuildBlock: React.FC<{
  play: boolean;
  delay?: number;
  color: string;
  name: string;
  from?: Vec;
  to?: Vec;
  blur?: number;
  className?: string;
  children: React.ReactNode;
}> = ({
  play,
  delay = 0,
  color,
  name,
  from = [-240, -160],
  to = [200, 160],
  blur = 0,
  className = "",
  children,
}) => {
    const reduce = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState<{ w: number; h: number } | null>(null);

    useEffect(() => {
      if (!play || reduce || !ref.current) return;
      setSize({ w: ref.current.offsetWidth, h: ref.current.offsetHeight });
    }, [play, reduce]);

    if (reduce) return <div className={`w-fit ${className}`}>{children}</div>;

    const GROW_AT = 0.45; // cursor arrives, then starts dragging
    const GROW = 0.7;
    const TOTAL = 1.65;
    const W = size?.w ?? 0;
    // generous insets so shadows and blurred ghosts are never cut by the reveal mask
    const hidden = `inset(-90px ${W}px -90px -90px)`;
    const shown = "inset(-90px -90px -90px -90px)";

    return (
      <div ref={ref} className={`relative w-fit ${className}`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={
            size
              ? {
                opacity: 1,
                clipPath: [hidden, shown],
                ...(blur ? { filter: [`blur(${blur}px)`, "blur(0px)"] } : {}),
              }
              : undefined
          }
          transition={{
            delay: delay + GROW_AT,
            duration: GROW,
            ease: EASE,
            opacity: { delay: delay + GROW_AT, duration: 0.01 },
          }}
        >
          {children}
        </motion.div>

        {size && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute -left-1.5 -top-1.5 z-30"
            style={{
              height: size.h + 12,
              border: `1.5px solid ${color}`,
              background: `${color}12`,
            }}
            initial={{ opacity: 0, width: 14 }}
            animate={{ opacity: [0, 1, 1, 0], width: size.w + 12 }}
            transition={{
              opacity: { delay, duration: TOTAL, times: [0, 0.1, 0.82, 1] },
              width: { delay: delay + GROW_AT, duration: GROW, ease: EASE },
            }}
          >
            {/* corner handles */}
            {["-left-[4.5px] -top-[4.5px]", "-right-[4.5px] -top-[4.5px]", "-left-[4.5px] -bottom-[4.5px]", "-right-[4.5px] -bottom-[4.5px]"].map((p) => (
              <span
                key={p}
                className={`absolute h-[7px] w-[7px] bg-white ${p}`}
                style={{ border: `1.5px solid ${color}` }}
              />
            ))}

            {/* live size tag */}
            {size.w > 90 && (
              <span
                className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded px-1.5 py-px font-mono text-[9px] font-semibold text-white"
                style={{ background: color }}
              >
                {Math.round(size.w)} × {Math.round(size.h)}
              </span>
            )}

            {/* the collaborator's cursor rides the bottom-right handle */}
            <motion.span
              className="absolute -bottom-[3px] -right-[3px] block h-0 w-0"
              initial={{ x: from[0], y: from[1], opacity: 0 }}
              animate={{
                x: [from[0], 0, 0, to[0]],
                y: [from[1], 0, 0, to[1]],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                delay,
                duration: TOTAL,
                times: [0, 0.28, 0.72, 1],
                ease: "easeInOut",
                opacity: { delay, duration: TOTAL, times: [0, 0.08, 0.82, 1] },
              }}
            >
              <Cursor color={color} name={name} />
            </motion.span>
          </motion.span>
        )}
      </div>
    );
  };

/** A cursor grabs the element somewhere off screen and drops it into place. */
const DropIn: React.FC<{
  play: boolean;
  delay?: number;
  color: string;
  name: string;
  from?: Vec;
  showCursor?: boolean;
  children: React.ReactNode;
}> = ({ play, delay = 0, color, name, from = [120, -160], showCursor = true, children }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="relative"
      initial={reduce ? false : { x: from[0], y: from[1], opacity: 0, scale: 0.7 }}
      animate={play || reduce ? { x: 0, y: 0, opacity: 1, scale: 1 } : undefined}
      transition={{
        delay,
        duration: 0.9,
        ease: EASE,
        opacity: { delay, duration: 0.2 },
      }}
    >
      {children}
      {showCursor && !reduce && play && (
        <motion.span
          className="pointer-events-none absolute left-[68%] top-[14%] z-40 block h-0 w-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0], x: [0, 0, 0, 40], y: [0, 0, 0, -34] }}
          transition={{ delay, duration: 1.5, times: [0, 0.1, 0.68, 1] }}
        >
          <Cursor color={color} name={name} />
        </motion.span>
      )}
    </motion.div>
  );
};

/** Pixel-font text that decodes from random glyphs (used for the subtitle only). */
const DecodeText: React.FC<{
  text: string;
  play: boolean;
  delay?: number;
  color: string;
  className?: string;
}> = ({ text, play, delay = 0, color, className }) => {
  const reduce = useReducedMotion();
  const [elapsed, setElapsed] = useState(-1);

  useEffect(() => {
    if (!play || reduce) return;
    const t0 = performance.now();
    const total = (delay + text.length * 0.02 + 0.5) * 1000 + 100;
    const id = setInterval(() => {
      const e = performance.now() - t0;
      setElapsed(e);
      if (e > total) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, [play, reduce, delay, text.length]);

  const words = useMemo(() => {
    let i = 0;
    return text.split(" ").map((w) => Array.from(w).map((ch) => ({ ch, i: i++ })));
  }, [text]);

  const shown = (ch: string, i: number) => {
    if (reduce) return ch;
    const settleAt = (delay + i * 0.02) * 1000;
    if (elapsed >= settleAt) return ch;
    return SCRAMBLE[(i * 7 + ((elapsed / 45) | 0) * 13 + 99) % SCRAMBLE.length];
  };

  return (
    <span className={className} style={{ color }}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, wi) => (
          <React.Fragment key={wi}>
            <span className="inline-block whitespace-nowrap">
              {word.map(({ ch, i }) => (
                <span key={i} className="relative inline-block">
                  <span className="invisible">{ch}</span>
                  <span className="absolute left-0 top-0">{shown(ch, i)}</span>
                </span>
              ))}
            </span>
            {wi < words.length - 1 ? " " : null}
          </React.Fragment>
        ))}
      </span>
    </span>
  );
};

/**
 * Name / title text with a hover effect: each letter you touch turns into a
 * blurred, grainy smear (like the "web designer" inspo) and then resolves back
 * to sharp. Letters next to it soften a little, so it feels like a ripple.
 */
const NoisyText: React.FC<{
  text: string;
  strength?: "lg" | "sm";
  accentAmp?: boolean;
  className?: string;
}> = ({ text, strength = "lg", accentAmp = false, className }) => {
  const words = useMemo(() => {
    let i = 0;
    return text.split(" ").map((w) => Array.from(w).map((ch) => ({ ch, i: i++ })));
  }, [text]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, wi) => (
          <React.Fragment key={wi}>
            <span className="inline-block whitespace-nowrap">
              {word.map(({ ch, i }) => (
                <span
                  key={i}
                  className={`hs-noisy relative inline-block ${accentAmp && ch === "&" ? "text-[#ec4899]" : ""}`}
                >
                  <span className="hs-noisy-base">{ch}</span>
                  <span
                    className={`hs-noisy-fx absolute left-0 top-0 ${strength === "lg" ? "hs-noisy-lg" : "hs-noisy-sm"}`}
                  >
                    {ch}
                  </span>
                </span>
              ))}
            </span>
            {wi < words.length - 1 ? " " : null}
          </React.Fragment>
        ))}
      </span>
    </span>
  );
};

/** Simple flicker-in for small HUD text. */
const SwarmBlock: React.FC<{
  play: boolean;
  delay?: number;
  className?: string;
  children: React.ReactNode;
}> = ({ play, delay = 0, className = "", children }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, x: -20 }}
      animate={
        play || reduce
          ? { opacity: [0, 1, 0.25, 1, 0.55, 1], x: [-20, 8, -5, 2, 0, 0] }
          : undefined
      }
      transition={{ delay, duration: reduce ? 0 : 0.7, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
    >
      {children}
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/*  3D Star Lily Point Cloud (structured petals: veins, edge, throat) */
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
  /** boot order: 0 = forms first (stem), 1 = forms last (petal tips) */
  ord: Float32Array;
  /** scatter vector used while the point is still assembling */
  jx: Float32Array;
  jy: Float32Array;
  jz: Float32Array;
};

const sstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function buildFlower(isMobile = false): Cloud {
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

    // Optimized grid: on mobile, 52 length steps x 30 width steps = 1,560 points per petal (instead of 7,040)
    const U_STEPS = isMobile ? 52 : 110;
    const V_STEPS = isMobile ? 30 : 64;
    for (let iu = 0; iu < U_STEPS; iu++) {
      const u = (iu + 0.5) / U_STEPS;
      for (let iv = 0; iv < V_STEPS; iv++) {
        const v = ((iv + 0.5) / V_STEPS) * 2 - 1;

        // Broad oval/rounded petal width
        const widthProfile = 0.52 * Math.sin(Math.PI * Math.pow(u, 0.68)) * (1 - 0.12 * Math.pow(u, 3));
        const dist = petalLen * Math.pow(u, 0.9);

        // Flaring upward & outward trumpet curve
        let py = 0.92 * Math.pow(u, 0.78) - 0.38 * Math.pow(u, 2.0) + petalLift * u;
        py += 0.22 * (v * v) * Math.sin(Math.PI * u); // cupped petal curve
        py += 0.02 * Math.sin(u * 14 + v * 3.5); // soft organic waviness

        const lateral = v * widthProfile;
        const px = dist * ct - lateral * st;
        const pz = dist * st + lateral * ct;

        // Tilt flower head toward the camera
        const rx = px;
        const ry = py * cosT - pz * sinT + flowerHeadY;
        const rz = py * sinT + pz * cosT;

        /* ---- Structured petal coloring (distinct zones, not one long blend) ---- */
        const av = Math.abs(v);

        // 1. Body zones: ruby base -> hot rose middle -> blush tip, with fairly steep steps
        let r = 150, g = 18, b = 58;
        const zMid = sstep(0.2, 0.4, u);
        r = lerp(r, 232, zMid); g = lerp(g, 52, zMid); b = lerp(b, 118, zMid);
        const zTip = sstep(0.7, 0.92, u);
        r = lerp(r, 255, zTip); g = lerp(g, 200, zTip); b = lerp(b, 224, zTip);

        // 2. Pale edge band so every petal has a readable outline against the one behind it
        const edge = sstep(0.7, 0.92, av);
        r = lerp(r, 255, edge * 0.8); g = lerp(g, 218, edge * 0.8); b = lerp(b, 234, edge * 0.8);

        // 3. Longitudinal veins (5 thin lines) + a strong midrib
        const veinFade = (1 - sstep(0.72, 0.96, u)) * (1 - edge);
        const lines = Math.pow(Math.abs(Math.cos(v * Math.PI * 2.5)), 20);
        const midrib = Math.exp(-Math.pow(v / 0.07, 2));
        const vein = Math.min(1, lines * 0.8 + midrib * 0.9) * veinFade;
        r = lerp(r, 190, vein * 0.85); g = lerp(g, 12, vein * 0.85); b = lerp(b, 82, vein * 0.85);

        // 4. Lime-green throat with a short star ray along each petal
        const throat = 1 - sstep(0.1, 0.24, u);
        const ray = Math.exp(-Math.pow(v / 0.2, 2)) * (1 - sstep(0.18, 0.46, u));
        const lime = Math.max(throat, ray * 0.7);
        r = lerp(r, 150, lime); g = lerp(g, 226, lime); b = lerp(b, 40, lime);

        // Ink (glyph weight): heavy characters on veins, lighter on edges and tips
        let ink = lerp(0.8, 0.5, Math.pow(u, 1.2));
        ink = lerp(ink, 0.42, edge);
        ink = Math.max(ink, vein);
        ink = lerp(ink, 0.9, lime * 0.6);

        // Dark freckles clustered in the lower cup, kept off the veins
        const freckleProb =
          0.1 *
          Math.exp(-Math.pow((u - 0.34) / 0.16, 2)) *
          Math.exp(-Math.pow(av / 0.5, 2)) *
          (1 - vein);
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
  const filamentSteps = isMobile ? 20 : 40;
  const antherSteps = isMobile ? 18 : 40;
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI * 2) / 6 + 0.28;
    const filamentLen = 0.75;
    for (let i = 0; i <= filamentSteps; i++) {
      const t = i / filamentSteps;
      const frho = filamentLen * Math.pow(t, 0.85);
      const fx = frho * Math.cos(a);
      const fz = frho * Math.sin(a);
      const fy = 0.12 + 0.75 * t - 0.22 * t * t;
      const rx = fx;
      const ry = fy * cosT - fz * sinT + flowerHeadY;
      const rz = fy * sinT + fz * cosT;
      push(rx, ry, rz, Math.round(lerp(120, 245, t)), Math.round(lerp(205, 158, t)), Math.round(lerp(25, 11, t)), 0.9);
    }
    // Pollen anthers at tips
    const tipX = filamentLen * Math.cos(a);
    const tipZ = filamentLen * Math.sin(a);
    const tipY = 0.12 + 0.75 - 0.22;
    for (let i = 0; i < antherSteps; i++) {
      const ox = (rnd() - 0.5) * 0.14;
      const oy = (rnd() - 0.5) * 0.08;
      const oz = (rnd() - 0.5) * 0.14;
      const rx = tipX + ox;
      const ry = (tipY + oy) * cosT - (tipZ + oz) * sinT + flowerHeadY;
      const rz = (tipY + oy) * sinT + (tipZ + oz) * cosT;
      push(rx, ry, rz, 180, 60, 20, 1.0);
    }
  }

  // Central Pistil / Stigma
  const pistilSteps = isMobile ? 18 : 36;
  for (let i = 0; i <= pistilSteps; i++) {
    const t = i / pistilSteps;
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
  const stemSamples = isMobile ? 1000 : 2600;
  for (let i = 0; i < stemSamples; i++) {
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
    const LU = isMobile ? 36 : 70;
    const LV = isMobile ? 18 : 36;
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
    ord: new Float32Array(n),
    jx: new Float32Array(n),
    jy: new Float32Array(n),
    jz: new Float32Array(n),
  };
  let yMin = Infinity, yMax = -Infinity;
  P.forEach((p) => {
    if (p[1] < yMin) yMin = p[1];
    if (p[1] > yMax) yMax = p[1];
  });
  const bootRnd = mulberry(7);
  P.forEach((p, i) => {
    c.x[i] = p[0]; c.y[i] = p[1]; c.z[i] = p[2];
    c.r[i] = p[3]; c.g[i] = p[4]; c.b[i] = p[5];
    c.ink[i] = p[6];
    // Builds from the roots up (stem, leaves, then petals), with noise so it scatters in like a swarm
    c.ord[i] = ((p[1] - yMin) / (yMax - yMin)) * 0.62 + bootRnd() * 0.38;
    const theta = bootRnd() * Math.PI * 2;
    const phi = Math.acos(2 * bootRnd() - 1);
    const mag = 0.7 + bootRnd() * 1.4;
    c.jx[i] = Math.sin(phi) * Math.cos(theta) * mag;
    c.jy[i] = Math.sin(phi) * Math.sin(theta) * mag;
    c.jz[i] = Math.cos(phi) * mag;
  });
  return c;
}

/* Character ramp with solid visible glyphs */
const RAMP = ".:+*x7S8WoW%#@";
/* Glyphs shown while a point is still assembling */
const GLITCH = "01#@%&$<>/\\|+=";

const hash32 = (n: number) => {
  n = (n ^ 61) ^ (n >>> 16);
  n = (n + (n << 3)) | 0;
  n = n ^ (n >>> 4);
  n = Math.imul(n, 0x27d4eb2d);
  n = n ^ (n >>> 15);
  return n >>> 0;
};

/* ------------------------------------------------------------------ */
/*  Free-Floating Screen ASCII Flower (boots in, then spins)           */
/* ------------------------------------------------------------------ */

const AsciiFlower: React.FC<{
  play: boolean;
  angleLabelRef: React.RefObject<HTMLSpanElement | null>;
  statusRef: React.RefObject<HTMLSpanElement | null>;
}> = ({ play, angleLabelRef, statusRef }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent));
    }
  }, []);

  const cloud = useMemo(() => buildFlower(isMobile), [isMobile]);
  const playRef = useRef(play);

  useEffect(() => {
    playRef.current = play;
  }, [play]);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0, h = 0, dpr = 1, cols = 0, rows = 0, CW = 8, CH = 10;
    let zbuf = new Float32Array(0);
    let pidx = new Int32Array(0);
    let kbuf = new Float32Array(0);

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      w = r.width; h = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
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
      kbuf = new Float32Array(cols * rows);
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
    let bootT0 = -1;

    const setStatus = (text: string, online: boolean) => {
      const el = statusRef.current;
      if (!el) return;
      if (el.textContent !== text) el.textContent = text;
      el.style.color = online ? "#db2777" : "";
    };

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

    let isLoopRunning = false;
    const startLoop = () => {
      if (!isLoopRunning) {
        isLoopRunning = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const stopLoop = () => {
      isLoopRunning = false;
      if (raf) cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) startLoop();
      else stopLoop();
    });
    io.observe(wrap);

    const TILT = 0.38;
    const ca = Math.cos(TILT), sa = Math.sin(TILT);
    const TAU = Math.PI * 2;

    const frame = (now: number) => {
      if (!visible || !isLoopRunning) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      /* ---- Boot state: standby -> forming -> online ---- */
      let form = 1;
      if (!reduced) {
        if (!playRef.current) {
          ctx.clearRect(0, 0, w, h);
          setStatus("STANDBY", false);
          return;
        }
        if (bootT0 < 0) bootT0 = now;
        const f = Math.min(1, (now - bootT0) / BOOT_MS);
        form = f * f * (3 - 2 * f);
        if (f < 1) setStatus(`FORMING ${String(Math.round(f * 100)).padStart(2, "0")}%`, false);
        else setStatus("ONLINE", true);
      } else {
        setStatus("ONLINE", true);
      }
      const booting = form < 1;

      if (!dragging) {
        angle += (auto + vel) * dt;
        vel *= 0.94;
      }

      const cs = Math.cos(angle), sn = Math.sin(angle);
      const isMobile = w < 640;
      const isTablet = w >= 640 && w < 1024;

      // Responsive scale (unchanged: the size of the flower stays as you liked it)
      const scale = isMobile
        ? Math.min(h / 3.2, w / 2.1)
        : isTablet
          ? Math.min(h / 2.85, w / 1.95)
          : Math.min(h / 2.28, w / 1.56);

      ctx.clearRect(0, 0, w, h);
      zbuf.fill(-1e9);

      // Vertical anchor: moved lower so the bloom sits closer to the middle of the hero
      const yOffset = isMobile ? -0.14 : isTablet ? -0.3 : -0.46;

      const gtick = (now / 90) | 0;
      const glitch = booting ? 1 - form : 0;

      const { n, x, y, z, ord, jx, jy, jz } = cloud;
      for (let i = 0; i < n; i++) {
        let k = 1;
        if (booting) {
          k = Math.min(1, Math.max(0, (form * 1.45 - ord[i]) / 0.45));
          if (k <= 0) continue;
        }
        const m = (1 - k) * (1 - k);
        const px = x[i] + jx[i] * m;
        const py = y[i] + jy[i] * m;
        const pz = z[i] + jz[i] * m;

        const x1 = px * cs + pz * sn;
        const z1 = -px * sn + pz * cs;
        const y2 = py * ca - z1 * sa;
        const z2 = z1 * ca + py * sa;
        const s = 6 / (6 - z2);
        let sx = w / 2 + x1 * scale * s;
        const sy = h / 2 - (y2 + yOffset) * scale * s;

        // Glitch: whole horizontal bands slide sideways while the flower is forming
        if (booting) {
          const band = (sy / (CH * 5)) | 0;
          const hv = hash32(band * 7919 + gtick * 104729);
          if (hv % 100 < 5 + 14 * glitch) {
            sx += (((hv >>> 8) % 21) - 10) * CW * (0.4 + glitch);
          }
        }

        const col = (sx / CW) | 0;
        const row = (sy / CH) | 0;
        if (col < 0 || row < 0 || col >= cols || row >= rows) continue;
        const idx = row * cols + col;
        if (z2 > zbuf[idx]) { zbuf[idx] = z2; pidx[idx] = i; kbuf[idx] = k; }
      }

      ctx.font = `700 ${CH * 0.98}px ui-monospace, Menlo, Consolas, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const tick = (now / 220) | 0;
      const gt = (now / 60) | 0;

      for (let idx = 0; idx < zbuf.length; idx++) {
        const z2 = zbuf[idx];
        if (z2 < -1e8) continue;
        const i = pidx[idx];
        const k = kbuf[idx];
        const d = Math.max(0, Math.min(1, (z2 + 1.4) / 2.8));
        const ink = cloud.ink[i] * (0.6 + 0.4 * d);
        let ci = Math.min(RAMP.length - 1, (ink * RAMP.length) | 0);
        if ((idx * 31 + tick * 17) % 13 === 0) ci = Math.max(0, ci - 1);

        // Depth shading: back petals darker, front petals brighter, so overlapping petals stay distinct
        const shade = 0.74 + 0.26 * d;
        let rr = cloud.r[i] * shade;
        let gg = cloud.g[i] * shade;
        let bb = cloud.b[i] * shade;
        let alpha = 0.8 + 0.2 * d;
        let glyph = RAMP[ci];

        if (k < 1) {
          // Still assembling: hot-pink scrambled glyphs
          const mix = (1 - k) * 0.75;
          rr += (255 - rr) * mix;
          gg += (70 - gg) * mix;
          bb += (150 - bb) * mix;
          alpha *= 0.55 + 0.45 * k;
          glyph = GLITCH[(idx * 13 + gt * 7) % GLITCH.length];
        }

        ctx.fillStyle = `rgba(${rr | 0},${gg | 0},${bb | 0},${alpha.toFixed(2)})`;
        const col = idx % cols;
        const row = (idx / cols) | 0;
        ctx.fillText(glyph, col * CW + CW / 2, row * CH + CH / 2);
      }

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
  }, [cloud, angleLabelRef, statusRef]);

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
  ready = true,
  onResumeClick,
  onScrollDown,
  onFolderClick,
}) => {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const angleRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);

  /* Boot starts once the hero is on screen AND the loader (if any) is done */
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const play = ready && inView;

  /* Blinking pink caret appears after the name has been built */
  const [cursor, setCursor] = useState(false);
  useEffect(() => {
    if (!play) return;
    const t = setTimeout(() => setCursor(true), reduce ? 0 : (T.name + 1.9) * 1000);
    return () => clearTimeout(t);
  }, [play, reduce]);

  const role: string = PORTFOLIO_DATA.profile.tagline ?? "";

  const openFolder = (id: string) => {
    playUiClick(true);
    if (onFolderClick) return onFolderClick(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" ref={rootRef} className="relative overflow-hidden bg-[#f8f8fa]">
      <style>{`
        @keyframes hs-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .hs-float {
          animation: hs-float 6s ease-in-out infinite;
        }
        @keyframes hs-cursor {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .hs-cursor {
          animation: hs-cursor 1s steps(1) infinite;
        }

        /* Hover: a letter turns into a blurred, grainy smear, then resolves back */
        .hs-noisy-base { transition: opacity 0.8s ease; }
        .hs-noisy-fx {
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.8s ease;
        }
        .hs-noisy-lg { filter: url(#hs-noisy-lg); }
        .hs-noisy-sm { filter: url(#hs-noisy-sm); }
        .hs-noisy:hover .hs-noisy-base { opacity: 0; transition-duration: 0.12s; }
        .hs-noisy:hover .hs-noisy-fx { opacity: 1; transition-duration: 0.12s; }
        .hs-noisy:hover + .hs-noisy .hs-noisy-fx { opacity: 0.45; transition-duration: 0.2s; }

        @media (prefers-reduced-motion: reduce) {
          .hs-float, .hs-cursor { animation: none; }
          .hs-noisy-base, .hs-noisy-fx { transition: none; }
        }
      `}</style>

      {/* SVG filters used by the hover effect (blur + noise displacement) */}
      <svg aria-hidden width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id="hs-noisy-lg" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="noise" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feDisplacementMap in="blur" in2="noise" scale="24" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="hs-noisy-sm" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="noise" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur" />
            <feDisplacementMap in="blur" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Faint ambient grid + soft blush glow behind the flower */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 72% 52%, rgba(254,205,226,0.26), transparent 46%), radial-gradient(rgba(15,23,42,0.12) 1.2px, transparent 1.3px)",
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
                <DropIn
                  play={play}
                  delay={T.folders + i * 0.16}
                  color={CURSOR_COLOR}
                  name={CURSOR_NAMES[i % CURSOR_NAMES.length]}
                  from={[i % 2 ? 140 : -140, i % 3 ? -170 : 170]}
                >
                  <DraggableFolder
                    label={f.label}
                    rot={f.rot}
                    onOpen={() => openFolder(f.id)}
                  />
                </DropIn>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 items-center gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: name > role > statement > location > actions */}
          <div className="relative z-10 text-left lg:col-span-6 lg:pr-2">
            {/* 1. Name: plain black bold sans */}
            <BuildBlock
              play={play}
              delay={T.name}
              color={CURSOR_COLOR}
              name="Mica"
              from={[-260, -120]}
              to={[280, -150]}
            >
              <h1 className="text-[2.9rem] sm:text-7xl lg:text-[5.25rem] font-black leading-[0.95] tracking-[-0.045em] text-[#0a0a0a]">
                <NoisyText text="Mica Danah" strength="lg" className="block whitespace-nowrap" />
                <span className="block whitespace-nowrap">
                  <NoisyText text="Paris" strength="lg" />
                  {cursor && (
                    <span
                      aria-hidden
                      className="hs-cursor ml-2 inline-block h-[0.72em] w-[0.1em] translate-y-[0.06em] rounded-[2px] bg-[#ec4899] align-baseline"
                    />
                  )}
                </span>
              </h1>
            </BuildBlock>

            {/* 2. Role: one clean line, semibold, clearly second in the hierarchy */}
            <BuildBlock
              play={play}
              delay={T.role}
              color={CURSOR_COLOR}
              name="Danah"
              from={[-230, 120]}
              to={[240, -70]}
              className="mt-5 sm:mt-6"
            >
              <p className="max-w-xl text-xl sm:text-2xl lg:text-[1.6rem] font-semibold leading-tight tracking-tight text-slate-800">
                <NoisyText text={role} strength="sm" accentAmp />
              </p>
            </BuildBlock>

            {/* 3. Statement: the only pixel-font text, small and quiet */}
            <BuildBlock
              play={play}
              delay={T.statement}
              color={CURSOR_COLOR}
              name="Pixel"
              from={[-210, 140]}
              to={[250, 70]}
              className="mt-4 sm:mt-5"
            >
              <DecodeText
                text="Turning complex systems into delightful, intuitive experiences."
                play={play}
                delay={T.statement + 0.45}
                color="#64748b"
                className={`${pixel.className} block max-w-md text-[13px] sm:text-base lg:text-[1.05rem] font-medium leading-snug`}
              />
            </BuildBlock>

            {/* 4. Location: quiet line */}
            <SwarmBlock play={play} delay={T.location} className="mt-3">
              <p className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500">
                <MapPin className="h-3.5 w-3.5 text-pink-500" />
                Based in the Philippines
              </p>
            </SwarmBlock>

            {/* 5. Actions: macOS Aqua jelly + frosted glass buttons */}
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-2.5 sm:gap-3.5">
              {/* Pink Jelly Pill Button for Resume */}
              <BuildBlock
                play={play}
                delay={T.buttons}
                color={CURSOR_COLOR}
                name="Bot"
                from={[-200, 160]}
                to={[-120, 190]}
              >
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
              </BuildBlock>

              {/* Frosted silver glass button for Read Story */}
              {onScrollDown && (
                <BuildBlock
                  play={play}
                  delay={T.buttons + 0.25}
                  color={CURSOR_COLOR}
                  name="Danah"
                  from={[220, 170]}
                  to={[160, 200]}
                >
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
                </BuildBlock>
              )}

              {/* LinkedIn icon button */}
              {SOCIALS.map(({ label, href, Icon }) => (
                <BuildBlock
                  key={label}
                  play={play}
                  delay={T.buttons + 0.5}
                  color={CURSOR_COLOR}
                  name="Paris"
                  from={[120, 190]}
                  to={[100, 210]}
                >
                  <a
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
                </BuildBlock>
              ))}
            </div>
          </div>

          {/* Right Column: Free-Floating 3D Star Lily (forms itself on boot) */}
          <div className="relative z-10 lg:col-span-6">
            <div
              className="relative h-[250px] sm:h-[380px] lg:h-[700px] w-full"
              style={{
                WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 80%, transparent 99%)",
                maskImage: "linear-gradient(to bottom, black 0%, black 80%, transparent 99%)",
              }}
            >
              <AsciiFlower play={play} angleLabelRef={angleRef} statusRef={statusRef} />

              {/* Floating editorial ASCII telemetry */}
              <SwarmBlock
                play={play}
                delay={T.hud}
                className="pointer-events-none absolute left-3 top-2 sm:top-4"
              >
                <div className="font-mono text-[9px] sm:text-[10px] leading-relaxed text-slate-400 select-none">
                  <p className="font-semibold tracking-wider text-slate-600">SUBJECT: STAR LILY</p>
                  <p className="hidden sm:block">CHARSET: 7 8 W S A</p>
                  <p>PETALS: 06 &middot; DENSITY: ULTRA</p>
                  <p className="hidden sm:block">MODE: PIXEL TO TEXT</p>
                  <p className="font-semibold tracking-wider">
                    STATUS: <span ref={statusRef}>STANDBY</span>
                  </p>
                </div>
              </SwarmBlock>

              <SwarmBlock
                play={play}
                delay={T.hud + 0.6}
                className="pointer-events-none absolute right-4 bottom-3 sm:bottom-12"
              >
                <div className="text-right font-mono text-[9px] sm:text-[10px] leading-relaxed text-slate-400 select-none">
                  <p>
                    ROT: <span ref={angleRef} className="font-semibold text-pink-600">034°</span>
                  </p>
                  <p className="tracking-wider">DRAG TO SPIN</p>
                </div>
              </SwarmBlock>
            </div>
          </div>
        </div>

        {/* Pink Desktop Folders for Mobile / Tablet View (Compact Mini-Folders) */}
        <div className="relative z-10 mt-6 sm:mt-8 lg:hidden">
          <div className="flex items-center gap-3 overflow-x-auto px-2 py-2 no-scrollbar justify-start sm:justify-center">
            {FOLDERS.map((f, i) => (
              <div key={f.id} className="shrink-0">
                <DropIn
                  play={play}
                  delay={T.folders + i * 0.1}
                  color={CURSOR_COLOR}
                  name={CURSOR_NAMES[i % CURSOR_NAMES.length]}
                  from={[0, 60]}
                  showCursor={false}
                >
                  <DraggableFolder
                    label={f.label}
                    rot={f.rot}
                    size="sm"
                    onOpen={() => openFolder(f.id)}
                  />
                </DropIn>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};