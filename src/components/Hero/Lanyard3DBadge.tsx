"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Mail, Download, MapPin } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/UI/Icons";
import { PORTFOLIO_DATA } from "@/data/portfolioData";

/* ------------------------------------------------------------------ */
/*  Layout + physics constants (tweak these to change the "feel")      */
/* ------------------------------------------------------------------ */
const CARD_W = 300;
const CARD_H = 440;
const CLIP_H = 64; // strap end + ring + clasp above the card
const STAGE_W = 340;
const STAGE_H = 670;
const ANCHOR_Y = -24; // where the strap is pinned (above the stage)
const SEGMENTS = 7; // rope links
const SEG_LEN = 22; // px per link -> rope length = 154px
const CARD_D = CLIP_H + CARD_H / 2; // rope end -> card centre
const REACH = SEGMENTS * SEG_LEN + CARD_D - 6; // max pull distance
const GRAVITY = 2000 / 3600; // px per step^2 (2000 px/s^2 at 60fps)
const DAMPING = 0.991; // closer to 1 = bouncier / swings longer
const ITERATIONS = 14; // constraint passes (higher = stiffer rope)
const STEP_MS = 1000 / 60;
const LOCATION_LABEL = "Based in the Philippines";

type Pt = { x: number; y: number; px: number; py: number };

export const Lanyard3DBadge: React.FC = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    const card = cardRef.current;
    const tilt = tiltRef.current;
    const svg = svgRef.current;
    if (!stage || !card || !tilt || !svg) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const cx = STAGE_W / 2;

    /* ---- build the rope: anchor -> SEGMENTS points -> card centre ---- */
    const swing = reduceMotion ? 0 : 0.45; // entrance swing (radians)
    const pts: Pt[] = [];
    const place = (dist: number): Pt => {
      const x = cx - Math.sin(swing) * dist;
      const y = ANCHOR_Y + Math.cos(swing) * dist;
      return { x, y, px: x, py: y };
    };
    for (let i = 0; i <= SEGMENTS; i++) pts.push(place(i * SEG_LEN));
    pts.push(place(SEGMENTS * SEG_LEN + CARD_D));

    const last = pts.length - 1; // card centre
    const attach = SEGMENTS; // rope end / clip top
    const C = pts[last];
    const T = pts[attach];
    const invMass = pts.map((_, i) => (i === 0 ? 0 : i === last ? 0.2 : 1));
    const links = pts.slice(0, -1).map((_, i) => ({
      a: i,
      b: i + 1,
      len: i === attach ? CARD_D : SEG_LEN,
    }));

    const drag = {
      active: false,
      moved: false,
      sx: 0,
      sy: 0,
      ox: 0,
      oy: 0,
      tx: 0,
      ty: 0,
    };

    /* ---------------------------- simulation ---------------------------- */
    const step = () => {
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i];
        if (i === last && drag.active) {
          p.px = p.x;
          p.py = p.y;
          p.x += (drag.tx - p.x) * 0.45;
          p.y += (drag.ty - p.y) * 0.45;
          continue;
        }
        let vx = (p.x - p.px) * DAMPING;
        let vy = (p.y - p.py) * DAMPING;
        const speed = Math.hypot(vx, vy);
        if (speed > 60) {
          vx = (vx / speed) * 60;
          vy = (vy / speed) * 60;
        }
        p.px = p.x;
        p.py = p.y;
        p.x += vx;
        p.y += vy + GRAVITY;
      }

      for (let it = 0; it < ITERATIONS; it++) {
        for (const l of links) {
          const a = pts[l.a];
          const b = pts[l.b];
          const wa = drag.active && l.a === last ? 0 : invMass[l.a];
          const wb = drag.active && l.b === last ? 0 : invMass[l.b];
          const w = wa + wb;
          if (w === 0) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          const diff = (dist - l.len) / dist;
          a.x += dx * diff * (wa / w);
          a.y += dy * diff * (wa / w);
          b.x -= dx * diff * (wb / w);
          b.y -= dy * diff * (wb / w);
        }
      }
    };

    /* ----------------------------- rendering ---------------------------- */
    const paths = svg.querySelectorAll("path");
    const render = () => {
      // strap: smooth curve through rope points, starting far above the stage
      const q = [{ x: cx, y: ANCHOR_Y - 900 }, ...pts.slice(0, attach + 1)];
      let d = `M ${q[0].x} ${q[0].y}`;
      for (let i = 1; i < q.length - 1; i++) {
        const mx = (q[i].x + q[i + 1].x) / 2;
        const my = (q[i].y + q[i + 1].y) / 2;
        d += ` Q ${q[i].x} ${q[i].y} ${mx} ${my}`;
      }
      d += ` L ${q[q.length - 1].x} ${q[q.length - 1].y}`;
      paths.forEach((p) => p.setAttribute("d", d));

      // card hangs along the rope-end -> centre vector
      const deg =
        (Math.atan2(-(C.x - T.x), C.y - T.y) * 180) / Math.PI;
      card.style.transform = `translate3d(${(C.x - CARD_W / 2).toFixed(2)}px, ${(
        C.y -
        CARD_H / 2
      ).toFixed(2)}px, 0) rotate(${deg.toFixed(2)}deg)`;
      card.style.setProperty("--sw", deg.toFixed(2)); // drives holo shimmer
    };

    /* ------------------------------ loop -------------------------------- */
    let raf = 0;
    let running = false;
    let lastT = 0;
    let acc = 0;
    let calm = 0;
    let inView = true;

    const frame = (t: number) => {
      if (!running) return;
      acc += Math.min(64, t - lastT);
      lastT = t;
      let n = 0;
      while (acc >= STEP_MS && n < 4) {
        step();
        acc -= STEP_MS;
        n++;
      }
      if (acc > 50) acc = 0;
      render();

      let energy = 0;
      for (const p of pts)
        energy = Math.max(energy, Math.abs(p.x - p.px) + Math.abs(p.y - p.py));
      calm = !drag.active && energy < 0.02 ? calm + 1 : 0;
      if (calm > 45 || !inView) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (running) return;
      running = true;
      lastT = performance.now();
      acc = 0;
      calm = 0;
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) wake();
    });
    io.observe(stage);

    /* ---------------------------- interaction --------------------------- */
    const toLocal = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    let flipTimer: number | undefined;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if ((e.target as HTMLElement).closest("a,button")) return; // let links work
      card.setPointerCapture(e.pointerId);
      const p = toLocal(e);
      drag.active = true;
      drag.moved = false;
      drag.sx = e.clientX;
      drag.sy = e.clientY;
      drag.ox = C.x - p.x;
      drag.oy = C.y - p.y;
      drag.tx = C.x;
      drag.ty = C.y;
      card.style.cursor = "grabbing";
      wake();
    };

    const onMove = (e: PointerEvent) => {
      if (drag.active) {
        if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 5)
          drag.moved = true;
        const p = toLocal(e);
        let tx = p.x + drag.ox;
        let ty = Math.max(p.y + drag.oy, ANCHOR_Y + 60);
        const dx = tx - cx;
        const dy = ty - ANCHOR_Y;
        const dist = Math.hypot(dx, dy);
        if (dist > REACH) {
          tx = cx + (dx / dist) * REACH;
          ty = ANCHOR_Y + (dy / dist) * REACH;
        }
        drag.tx = tx;
        drag.ty = ty;
        return;
      }
      if (e.pointerType !== "mouse") return;
      const r = card.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
      tilt.style.transform = `rotateX(${(-ny * 8).toFixed(2)}deg) rotateY(${(
        nx * 10
      ).toFixed(2)}deg)`;
      card.style.setProperty("--hx", String(50 + nx * 40));
      card.style.setProperty("--hy", String(50 + ny * 40));
    };

    const onUp = (e: PointerEvent) => {
      if (!drag.active) return;
      drag.active = false;
      card.style.cursor = "grab";
      if (card.hasPointerCapture(e.pointerId))
        card.releasePointerCapture(e.pointerId);
      if (!drag.moved && e.pointerType !== "mouse") setFlipped((f) => !f);
      if (
        e.pointerType === "mouse" &&
        !card.contains(document.elementFromPoint(e.clientX, e.clientY))
      )
        setFlipped(false);
      wake();
    };

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      window.clearTimeout(flipTimer);
      flipTimer = window.setTimeout(() => setFlipped(true), 80);
    };

    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || drag.active) return;
      window.clearTimeout(flipTimer);
      setFlipped(false);
      tilt.style.transform = "rotateX(0deg) rotateY(0deg)";
      card.style.setProperty("--hx", "50");
      card.style.setProperty("--hy", "50");
    };

    card.addEventListener("pointerdown", onDown);
    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerup", onUp);
    card.addEventListener("pointercancel", onUp);
    card.addEventListener("pointerenter", onEnter);
    card.addEventListener("pointerleave", onLeave);

    render();
    wake();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(flipTimer);
      io.disconnect();
      card.removeEventListener("pointerdown", onDown);
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerup", onUp);
      card.removeEventListener("pointercancel", onUp);
      card.removeEventListener("pointerenter", onEnter);
      card.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const profile = PORTFOLIO_DATA.profile;

  return (
    <div
      ref={stageRef}
      className="relative mx-auto select-none"
      style={{ width: STAGE_W, height: STAGE_H }}
    >
      <style>{`
        .lny-card { --hx: 50; --hy: 50; --sw: 0; touch-action: none; cursor: grab; perspective: 1200px; }
        .lny-card:focus-visible { outline: 2px solid #f472b6; outline-offset: 6px; border-radius: 28px; }
        .lny-flip { transition: transform .75s cubic-bezier(.34,1.45,.5,1); transform-style: preserve-3d; }
        .lny-face {
          position: absolute; inset: 0; border-radius: 28px; overflow: hidden;
          backface-visibility: hidden; -webkit-backface-visibility: hidden;
          background: linear-gradient(160deg, #ffffff 0%, #fbf9ff 55%, #fff6fa 100%);
          box-shadow:
            0 1px 0 rgba(255,255,255,.95) inset,
            0 0 0 1px rgba(15,23,42,.07),
            0 30px 50px -18px rgba(76,57,120,.35),
            0 8px 18px -8px rgba(15,23,42,.18);
        }
        .lny-holo {
          position: absolute; inset: 0; pointer-events: none; border-radius: inherit;
          background: linear-gradient(115deg, transparent 16%, rgba(255,160,210,.55) 30%, rgba(140,195,255,.55) 42%, rgba(160,255,220,.48) 54%, rgba(255,232,140,.48) 66%, transparent 80%);
          background-size: 300% 300%;
          background-position: calc(var(--hx) * 1% + var(--sw) * 4%) calc(var(--hy) * 1%);
          mix-blend-mode: multiply; opacity: .4; transition: opacity .3s;
        }
        .lny-card:hover .lny-holo { opacity: .85; }
        .lny-glare {
          position: absolute; inset: 0; pointer-events: none; border-radius: inherit;
          background: radial-gradient(circle at calc(var(--hx) * 1%) calc(var(--hy) * 1%), rgba(255,255,255,.9), rgba(255,255,255,0) 42%);
          opacity: .5;
        }
        .lny-seal {
          background: conic-gradient(from calc(var(--sw) * 8deg), #ffc6e3, #c9e0ff, #ccffe6, #fff0ad, #ffc6e3);
          box-shadow: 0 2px 6px rgba(76,57,120,.25), inset 0 0 0 1.5px rgba(255,255,255,.8);
        }
        @media (prefers-reduced-motion: reduce) { .lny-flip { transition-duration: .01s; } }
      `}</style>

      {/* Lanyard strap (drawn from physics points) */}
      <svg
        ref={svgRef}
        aria-hidden
        width={STAGE_W}
        height={STAGE_H}
        viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
        className="pointer-events-none absolute left-0 top-0 overflow-visible"
      >
        <path fill="none" stroke="#e79ab5" strokeWidth={23} />
        <path fill="none" stroke="#f8c6d6" strokeWidth={21} />
        <path fill="none" stroke="#ffffff" strokeWidth={17} strokeDasharray="1.2 2.6" opacity={0.28} />
        <path fill="none" stroke="#ffffff" strokeWidth={2} opacity={0.35} />
      </svg>

      {/* Physics body: moved + rotated every frame by the simulation */}
      <div
        ref={cardRef}
        className="lny-card absolute left-0 top-0 outline-none"
        style={{ width: CARD_W, height: CARD_H, willChange: "transform" }}
        tabIndex={0}
        role="button"
        aria-pressed={flipped}
        aria-label="Flip ID badge. Drag to swing it."
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
      >
        {/* tilt layer (follows the mouse) */}
        <div
          ref={tiltRef}
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            transition: "transform .18s ease-out",
          }}
        >
          {/* flip layer (hover to turn around) */}
          <div
            className="lny-flip absolute inset-0"
            style={{ transform: `rotateY(${flipped ? 180 : 0}deg)` }}
          >
            {/* ------------------------- FRONT ------------------------- */}
            <div
              className="lny-face"
              style={{ pointerEvents: flipped ? "none" : "auto" }}
            >
              <div className="lny-holo" />
              <div className="lny-glare" />

              <div className="relative z-10 flex h-full flex-col items-center justify-center gap-5 p-6 pt-10">
                <div className="absolute left-1/2 top-2 h-3 w-14 -translate-x-1/2 rounded-full bg-slate-300 shadow-[inset_0_2px_3px_rgba(15,23,42,0.4)]" />

                <div className="relative">
                  <div className="relative h-56 w-52 overflow-hidden rounded-2xl border-2 border-white bg-slate-50 shadow-md ring-1 ring-slate-200">
                    <Image
                      src={profile.avatar}
                      alt={profile.name}
                      fill
                      sizes="208px"
                      draggable={false}
                      className="pointer-events-none object-cover object-top"
                      priority
                    />
                  </div>
                  <div className="lny-seal absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full text-[15px] text-white/90">
                    ✦
                  </div>
                </div>

                <div className="w-full text-center">
                  <h2 className="text-[26px] font-bold tracking-tight text-slate-900">
                    {profile.name}
                  </h2>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-1 font-mono text-[10px] text-slate-700">
                    <span>Computer Vision • Full-Stack</span>
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-1 text-[11px] font-medium text-slate-500">
                    <MapPin className="h-3 w-3 text-pink-500" />
                    {LOCATION_LABEL}
                  </div>
                </div>
              </div>
            </div>

            {/* -------------------------- BACK -------------------------- */}
            <div
              className="lny-face"
              style={{
                transform: "rotateY(180deg)",
                pointerEvents: flipped ? "auto" : "none",
              }}
            >
              <div className="lny-holo" />
              <div className="lny-glare" />

              <div className="relative z-10 flex h-full flex-col items-center justify-center gap-5 p-6 pt-10">
                <div className="absolute left-1/2 top-2 h-3 w-14 -translate-x-1/2 rounded-full bg-slate-300 shadow-[inset_0_2px_3px_rgba(15,23,42,0.4)]" />

                <div className="relative h-44 w-44 overflow-hidden rounded-2xl border-2 border-white bg-pink-50 shadow-md ring-1 ring-slate-200">
                  <Image
                    src={profile.pixelAvatar}
                    alt={`${profile.name} Pixel Art`}
                    fill
                    sizes="176px"
                    draggable={false}
                    className="pointer-events-none object-cover"
                  />
                </div>

                <div className="w-full text-center">
                  <div className="text-[26px] font-bold tracking-tight text-slate-900">
                    {profile.name}
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-1 text-[11px] font-medium text-slate-500">
                    <MapPin className="h-3 w-3 text-pink-500" />
                    {LOCATION_LABEL}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="LinkedIn"
                    className="rounded-xl bg-slate-900/90 p-2 text-white transition hover:bg-blue-600"
                  >
                    <LinkedinIcon className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="GitHub"
                    className="rounded-xl bg-slate-900/90 p-2 text-white transition hover:bg-slate-600"
                  >
                    <GithubIcon className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href={`mailto:${profile.email}`}
                    title="Email"
                    className="rounded-xl bg-slate-900/90 p-2 text-white transition hover:bg-rose-500"
                  >
                    <Mail className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href={profile.resumePath}
                    download="MicaDanahParis_Resume.pdf"
                    className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-slate-700"
                  >
                    <Download className="h-3 w-3" />
                    <span>Resume</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* strap end looped through a D-ring, swivel + lobster clasp whose tip goes into the slot */}
        <svg
          aria-hidden
          width={44}
          height={CLIP_H + 20}
          viewBox={`0 0 44 ${CLIP_H + 20}`}
          className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 overflow-visible"
          style={{ top: -CLIP_H, filter: "drop-shadow(0 2px 2px rgba(15,23,42,.25))" }}
        >
          <defs>
            <linearGradient id="lny-metal" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#9aa3b2" />
              <stop offset=".45" stopColor="#f4f6fa" />
              <stop offset="1" stopColor="#8d96a6" />
            </linearGradient>
          </defs>
          <rect x="8" y="11" width="28" height="24" rx="11" fill="none" stroke="#7b8494" strokeWidth="4.4" />
          <rect x="8" y="11" width="28" height="24" rx="11" fill="none" stroke="url(#lny-metal)" strokeWidth="3" />
          <rect x="11" y="0" width="22" height="22" rx="2.5" fill="#f8c6d6" stroke="#e79ab5" strokeWidth="1" />
          <path d="M13 18H31" stroke="#ffffff" strokeWidth="1" strokeDasharray="2 2" opacity=".85" />
          <rect x="19.5" y="35" width="5" height="8" rx="2" fill="url(#lny-metal)" stroke="#7b8494" strokeWidth=".6" />
          <path d="M22 42C14.5 47 15.5 62 20.5 70H23.5C28.5 62 29.5 47 22 42Z" fill="url(#lny-metal)" stroke="#7b8494" strokeWidth=".8" />
          <path d="M25.5 50C27 56 26 62 24 67" fill="none" stroke="#7b8494" strokeWidth=".8" />
          <rect x="20" y="69" width="4" height="12" rx="2" fill="url(#lny-metal)" stroke="#7b8494" strokeWidth=".6" />
        </svg>
      </div>

      <div className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[11px] text-slate-400">
        drag to swing · hover to flip
      </div>
    </div>
  );
};