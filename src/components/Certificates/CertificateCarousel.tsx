"use client";

/**
 * CertificateCarousel — a compiled stack of paper folders (no window chrome).
 * Desktop: folders sit side by side, hovering one fans it open (flex-grow) and
 *          slides the certificate up out of the folder.
 * Mobile:  the same folders stack vertically; tap one to open it.
 * Plays a 1-second paper sound whenever a folder opens.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Download, X, ChevronDown } from "lucide-react";
import { playUiClick } from "@/utils/sound";

/* ------------------------------------------------------------------ */
/*  Data (paths are relative to /public)                               */
/* ------------------------------------------------------------------ */
const IMG = "/assets/images/certificates/image_ver/";
const PDF = "/assets/images/certificates/";
const PAPER_SOUND = "/assets/sounds/folder-certificates.mp3";

interface Cert {
  id: string;
  tab: string; // short label on the folder sticker
  title: string;
  issuer: string;
  date: string;
  img: string;
  pdf: string;
  skills: string[];
  stickerAt: number; // vertical position of the sticker on the closed folder (%)
}

const CERTS: Cert[] = [
  {
    id: "data-analytics",
    tab: "data analytics",
    title: "IT Specialist – Data Analytics",
    issuer: "Certiport (Pearson VUE)",
    date: "May 2026",
    img: IMG + "Data_Analytics.png",
    pdf: PDF + "Data Analytics (1).pdf",
    skills: ["Data Modeling", "Python Analytics", "Data Visualization"],
    stickerAt: 12,
  },
  {
    id: "lex",
    tab: "social innovation",
    title: "Learning Express Programme",
    issuer: "Singapore Polytechnic",
    date: "Apr 2026",
    img: IMG + "LEX.jpg",
    pdf: PDF + "LEX.pdf",
    skills: ["Design Thinking", "Social Innovation", "User Empathy"],
    stickerAt: 34,
  },
  {
    id: "sikaptala",
    tab: "research",
    title: "SiKAPTala 2026 – National Research Presentation",
    issuer: "De La Salle University–Dasmariñas",
    date: "2026",
    img: IMG + "SikapTala.png",
    pdf: PDF + "Mica_Danah_P__Paris_6a1badc628eafe0554ca4a57.pdf",
    skills: ["Research", "Presentation"],
    stickerAt: 54,
  },
  {
    id: "device-management",
    tab: "device management",
    title: "Device Configuration & Management",
    issuer: "Certiport (Pearson VUE)",
    date: "Dec 2025",
    img: IMG + "Device_Configuration_Management.png",
    pdf: PDF + "Device Configuration and Management.pdf",
    skills: ["OS Provisioning", "Device Governance", "Network Security"],
    stickerAt: 20,
  },
  {
    id: "databases",
    tab: "relational databases",
    title: "IT Specialist – Databases",
    issuer: "Certiport (Pearson VUE)",
    date: "May 2025",
    img: IMG + "Databases.png",
    pdf: PDF + "Databases.pdf",
    skills: ["SQL Queries", "Normalization", "MySQL & DBMS"],
    stickerAt: 42,
  },
  {
    id: "excel",
    tab: "advanced excel",
    title: "Microsoft Office Specialist – Excel",
    issuer: "Certiport (Microsoft Certified)",
    date: "Dec 2023",
    img: IMG + "Microsoft_Excel.png",
    pdf: PDF + "Office Excel 2016.pdf",
    skills: ["Advanced Formulas", "Pivot Tables", "Data Validation"],
    stickerAt: 62,
  },
];

/* muted pink / kraft brown / cream palette */
const THEMES = [
  { back: "#e6c6ca", front: "#f7e8e9", ink: "#5c3139" }, // blush
  { back: "#d1b79c", front: "#eadbc8", ink: "#5a4330" }, // kraft
  { back: "#e9dccb", front: "#f8f1e7", ink: "#5a4638" }, // cream
  { back: "#d5a5ad", front: "#efd5d8", ink: "#5e2f3a" }, // dusty rose
  { back: "#dbc4aa", front: "#efe3d3", ink: "#5a4330" }, // light kraft
  { back: "#efd2d4", front: "#fbeeee", ink: "#5c3139" }, // pale blush
];

const num = (i: number) => String(i + 1).padStart(2, "0");
const href = (p: string) => encodeURI(p);
const vars = (i: number, extra: Record<string, string | number> = {}) =>
  ({
    "--back": THEMES[i % THEMES.length].back,
    "--front": THEMES[i % THEMES.length].front,
    "--ink": THEMES[i % THEMES.length].ink,
    "--i": i,
    ...extra,
  }) as React.CSSProperties;

/* ------------------------------------------------------------------ */
/*  Small pieces                                                       */
/* ------------------------------------------------------------------ */
const Paperclip: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg viewBox="0 0 28 72" className={className} aria-hidden fill="none" strokeLinecap="round">
    <path d="M8 46V14a8 8 0 0 1 16 0V54a12 12 0 0 1-24 0V22" stroke="#a07b8e" strokeWidth="3.2" />
    <path d="M8 46V14a8 8 0 0 1 16 0V54a12 12 0 0 1-24 0V22" stroke="#e6cbd8" strokeWidth="1" />
  </svg>
);

const Details: React.FC<{ cert: Cert; compact?: boolean }> = ({ cert, compact }) => (
  <div className="flex h-full flex-col justify-between gap-3" style={{ color: "var(--ink)" }}>
    <div>
      <h3 className={`font-bold leading-snug tracking-tight ${compact ? "text-lg" : "text-xl"}`}>
        {cert.title}
      </h3>
      <p className="mt-0.5 text-[13px] opacity-70">
        {cert.issuer} · {cert.date}
      </p>
    </div>
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex flex-wrap gap-1.5">
        {cert.skills.map((s) => (
          <span key={s} className="cf-pill cf-chip">
            <span>{s}</span>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <a
          href={href(cert.pdf)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playUiClick(true)}
          className="cf-pill cf-pill-pink"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>View PDF</span>
        </a>
        <a
          href={href(cert.pdf)}
          download
          onClick={() => playUiClick(true)}
          className="cf-pill"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Download</span>
        </a>
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */
export const CertificateCarousel: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number>(0);
  const [zoom, setZoom] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundTimers = useRef<number[]>([]);

  /* preload the paper sound once */
  useEffect(() => {
    const a = new Audio(PAPER_SOUND);
    a.preload = "auto";
    audioRef.current = a;
    return () => {
      soundTimers.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  /* only the first second of the sound, with a short fade-out */
  const playPaper = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    soundTimers.current.forEach((t) => window.clearTimeout(t));
    soundTimers.current = [];
    try {
      a.pause();
      a.currentTime = 0;
      a.volume = 0.6;
      a.play().catch(() => { }); // browsers may block it until the first click/tap
      soundTimers.current.push(
        window.setTimeout(() => (a.volume = 0.3), 800),
        window.setTimeout(() => (a.volume = 0.1), 920),
        window.setTimeout(() => a.pause(), 1000)
      );
    } catch {
      /* ignore */
    }
  }, []);

  const openFolder = useCallback(
    (i: number) => {
      if (i === openIdx) return;
      playPaper();
      setOpenIdx(i);
    },
    [openIdx, playPaper]
  );

  const hoverOpen = (i: number) => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => openFolder(i), 200);
  };
  const cancelHover = () => window.clearTimeout(hoverTimer.current);

  /* close lightbox with Escape */
  useEffect(() => {
    if (zoom === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);

  /* scroll reveal + background parallax */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reveals = section.querySelectorAll<HTMLElement>("[data-reveal],[data-words]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reveals.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));

    const blobs = Array.from(section.querySelectorAll<HTMLElement>("[data-speed]"));
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      for (const el of blobs) {
        const host = el.parentElement;
        if (!host) continue;
        const r = host.getBoundingClientRect();
        if (r.bottom < -300 || r.top > vh + 300) continue;
        const d = r.top + r.height / 2 - vh / 2;
        el.style.transform = `translate3d(0, ${(-d * parseFloat(el.dataset.speed || "0")).toFixed(1)}px, 0)`;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      id="certificates"
      ref={sectionRef}
      className="relative scroll-mt-12 overflow-hidden bg-[#f8f8fa]"
    >
      <style>{`
        @keyframes cf-rise { from { opacity: 0; transform: translate3d(0, 60px, 0) rotate(var(--tilt, 0deg)); } to { opacity: 1; transform: none; } }
        @keyframes cf-clip { 0% { opacity: 0; transform: translateY(-26px) rotate(-8deg); } 65% { opacity: 1; transform: translateY(3px) rotate(2deg); } 100% { opacity: 1; transform: none; } }
        @keyframes cf-word { from { transform: translateY(110%); } to { transform: translateY(0); } }

        [data-reveal] { opacity: 0; }
        [data-reveal].is-in { opacity: 1; animation: cf-rise .9s cubic-bezier(.2,.8,.2,1) backwards; }
        .cf-stack > * { opacity: 0; }
        .is-in .cf-stack > * { opacity: 1; animation: cf-rise .9s cubic-bezier(.2,.8,.2,1) backwards; animation-delay: calc(var(--i) * 90ms); }

        .cf-mask { display: inline-block; overflow: hidden; padding: 0 .06em .14em; margin: 0 -.06em -.14em; vertical-align: bottom; }
        .cf-word { display: inline-block; transform: translateY(110%); background: linear-gradient(135deg, #0b0b10 10%, #4a1236 50%, #f0568f 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .cf-words.is-in .cf-word { transform: none; animation: cf-word .95s cubic-bezier(.2,.8,.2,1) backwards; }

        /* ---------- folder parts ---------- */
        .cf-folder { flex-grow: var(--g, 1); flex-basis: 0; min-width: 0; transition: flex-grow .75s cubic-bezier(.3,.9,.3,1); }
        .cf-panel {
          background: var(--back);
          box-shadow: -14px 0 24px -14px rgba(74,51,40,.38), 0 22px 36px -22px rgba(74,51,40,.4), inset 0 1px 0 rgba(255,255,255,.55);
        }
        .cf-panel::after { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: .5; background: repeating-linear-gradient(180deg, rgba(255,255,255,.16) 0 1px, transparent 1px 3px); }
        .cf-peek { position: absolute; top: -9px; left: 38%; right: 6%; height: 26px; border-radius: 6px 6px 0 0; background: #fbf6ee; box-shadow: 0 -1px 4px rgba(74,51,40,.18); }
        .cf-tab { position: absolute; top: -28px; left: 18px; height: 30px; display: flex; align-items: center; padding: 0 14px; border-radius: 12px 12px 0 0; background: var(--back); color: var(--ink); font: 600 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace; box-shadow: inset 0 1px 0 rgba(255,255,255,.55); white-space: nowrap; }
        .cf-tab::before, .cf-tab::after { content: ""; position: absolute; bottom: 0; width: 10px; height: 10px; }
        .cf-tab::before { left: -10px; background: radial-gradient(circle at 0 0, transparent 10px, var(--back) 10.5px); }
        .cf-tab::after { right: -10px; background: radial-gradient(circle at 100% 0, transparent 10px, var(--back) 10.5px); }
        .cf-tab-label { max-width: 0; opacity: 0; margin-left: 0; overflow: hidden; transition: max-width .6s, opacity .4s, margin .4s; }
        .is-open .cf-tab-label { max-width: 220px; opacity: 1; margin-left: 8px; }

        .cf-sticker { background: rgba(255,255,255,.94); box-shadow: 0 6px 12px -6px rgba(74,51,40,.4), inset 0 0 0 1px rgba(74,51,40,.06); color: var(--ink); }
        .cf-closed { transition: opacity .3s; }
        .is-open .cf-closed { opacity: 0; pointer-events: none; }

        .cf-open { opacity: 0; pointer-events: none; transition: opacity .35s; }
        .is-open .cf-open { opacity: 1; pointer-events: auto; transition-delay: .3s; }
        .cf-paper { transform: translateY(46px) rotate(-1.6deg); transition: transform .7s cubic-bezier(.2,.9,.3,1) .25s; background: #fff; box-shadow: 0 14px 26px -14px rgba(74,51,40,.5), 0 0 0 1px rgba(74,51,40,.06); }
        .is-open .cf-paper { transform: translateY(0) rotate(-.6deg); }
        .cf-pocket { transform: translateY(24px); transition: transform .6s cubic-bezier(.2,.9,.3,1) .3s; background: linear-gradient(180deg, color-mix(in srgb, var(--front) 88%, white), var(--front)); box-shadow: 0 -10px 20px -12px rgba(74,51,40,.35), inset 0 1px 0 rgba(255,255,255,.8); }
        .is-open .cf-pocket { transform: none; }
        .is-open .cf-clipper { animation: cf-clip .7s cubic-bezier(.3,1.3,.5,1) backwards .6s; }

        /* mobile accordion */
        .cf-reveal { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .55s cubic-bezier(.3,.9,.3,1); }
        .is-open .cf-reveal { grid-template-rows: 1fr; }

        /* macOS-style pills (same as the rest of the site) */
        .cf-pill { position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: .4rem; border-radius: 9999px; border: 1px solid rgba(148,163,184,.55); padding: .45rem .9rem; font-size: 13px; font-weight: 500; color: #334155; white-space: nowrap; background: linear-gradient(180deg, #fff, #f1f2f5); box-shadow: inset 0 1px 1px #fff, inset 0 -1px 2px rgba(15,23,42,.07), 0 4px 10px -6px rgba(15,23,42,.3); transition: transform .15s, filter .15s; }
        .cf-pill > * { position: relative; z-index: 1; }
        .cf-chip { padding: .25rem .65rem; font-size: 11.5px; }
        .cf-pill-pink { color: #4a1230; border-color: rgba(224,98,143,.7); text-shadow: 0 1px 0 rgba(255,255,255,.55); background: linear-gradient(180deg, #ffc9db 0%, #ff9bbd 48%, #fb7fa9 52%, #ffa8c6 100%); box-shadow: inset 0 1px 1px rgba(255,255,255,.9), inset 0 -1px 2px rgba(190,40,100,.25), 0 8px 16px -6px rgba(244,114,182,.6); }
        .cf-pill-pink::before { content: ""; position: absolute; z-index: 0; left: 12px; right: 12px; top: 3px; height: 44%; border-radius: 9999px; background: linear-gradient(180deg, rgba(255,255,255,.75), rgba(255,255,255,.05)); }
        a.cf-pill:active, button.cf-pill:active { transform: translateY(1px); filter: brightness(.96); }

        @media (prefers-reduced-motion: reduce) {
          [data-reveal].is-in, .is-in .cf-stack > *, .cf-words.is-in .cf-word, .is-open .cf-clipper { animation: none; }
          .cf-stack > * { opacity: 1; } .cf-word { transform: none; }
          .cf-folder, .cf-paper, .cf-pocket, .cf-reveal { transition-duration: .01s; }
        }
      `}</style>

      {/* dotted desktop pattern (same as the other sections) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(15,23,42,0.15) 1.3px, transparent 1.5px)",
          backgroundSize: "34px 34px",
        }}
      />
      {/* very soft warm blobs (parallax) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
        {[
          { cls: "left-[-6%] top-[10%] h-[420px] w-[420px] bg-[#f3d3d6]", speed: 0.1 },
          { cls: "right-[-6%] top-[55%] h-[440px] w-[440px] bg-[#ead8c4]", speed: -0.08 },
        ].map((b, i) => (
          <div key={i} className="absolute inset-0">
            <div
              data-speed={b.speed}
              className={`absolute rounded-full opacity-50 blur-3xl will-change-transform ${b.cls}`}
            />
          </div>
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-28 pt-24 sm:pt-32">
        {/* header */}
        <div className="mb-14 space-y-4">
          <span
            data-reveal
            className="cf-pill cf-chip"
          >
            <span className="h-2 w-2 rounded-full bg-pink-400" />
            <span>{CERTS.length} certificates</span>
          </span>
          <h2
            data-words
            className="cf-words text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-7xl"
          >
            <span className="cf-mask">
              <span className="cf-word">Certificates</span>
            </span>
          </h2>
          <p data-reveal className="max-w-md text-lg text-slate-500">
            <span className="hidden lg:inline">Hover</span>
            <span className="lg:hidden">Tap</span> a folder to open it.
          </p>
        </div>

        {/* ===================== DESKTOP: folders side by side ===================== */}
        <div data-reveal className="hidden lg:block">
          <div className="cf-stack flex h-[592px] items-stretch pt-8">
            {CERTS.map((cert, i) => {
              const open = openIdx === i;
              return (
                <div
                  key={cert.id}
                  className={`cf-folder relative -ml-3 first:ml-0 ${open ? "is-open" : ""}`}
                  style={{
                    ...vars(i, { "--g": open ? 7 : 1 }),
                    zIndex: open ? 50 : i + 1,
                  }}
                  onMouseEnter={() => hoverOpen(i)}
                  onMouseLeave={cancelHover}
                >
                  <div className="cf-peek" style={{ transform: `rotate(${i % 2 ? 0.8 : -0.8}deg)` }} />
                  <div className="cf-tab">
                    <span>{num(i)}</span>
                    <span className="cf-tab-label">{cert.tab}</span>
                  </div>

                  <div className="cf-panel absolute inset-0 overflow-hidden rounded-[20px]">
                    {/* closed face */}
                    <div className="cf-closed absolute inset-0">
                      <div className="absolute left-1/2 top-4 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-white/90 font-mono text-[11px] font-bold shadow-sm" style={{ color: "var(--ink)" }}>
                        {num(i)}
                      </div>
                      <div
                        className="cf-sticker absolute left-1/2 -translate-x-1/2 rounded-full px-2 py-3 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                        style={{ top: `${cert.stickerAt + 10}%`, writingMode: "vertical-rl", transform: "translateX(-50%) rotate(180deg)" }}
                      >
                        {cert.tab}
                      </div>
                      <div
                        className="absolute bottom-4 left-1/2 whitespace-nowrap font-mono text-[10px] font-semibold opacity-60"
                        style={{ color: "var(--ink)", writingMode: "vertical-rl", transform: "translateX(-50%) rotate(180deg)" }}
                      >
                        {cert.date}
                      </div>
                      {!open && (
                        <button
                          type="button"
                          aria-label={`Open ${cert.title}`}
                          className="absolute inset-0 z-10 cursor-pointer outline-none"
                          onClick={() => openFolder(i)}
                          onFocus={() => openFolder(i)}
                        />
                      )}
                    </div>

                    {/* open face: certificate sliding out of a front pocket */}
                    <div className="cf-open absolute inset-y-0 left-0 min-w-[540px] w-full">
                      <button
                        type="button"
                        aria-label={`Enlarge ${cert.title}`}
                        onClick={() => {
                          playUiClick(true);
                          setZoom(i);
                        }}
                        className="cf-paper absolute bottom-[37%] left-[6%] right-[6%] top-[30px] cursor-zoom-in rounded-md p-2 outline-none"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cert.img}
                          alt={cert.title}
                          loading="lazy"
                          draggable={false}
                          className="h-full w-full object-contain"
                        />
                      </button>
                      <Paperclip className="cf-clipper pointer-events-none absolute right-[11%] top-[6px] z-10 w-7 drop-shadow" />
                      <div className="cf-pocket absolute inset-x-0 bottom-0 h-[38%] rounded-t-[26px] p-5 pt-6">
                        <Details cert={cert} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===================== MOBILE: folders stacked vertically ===================== */}
        <div data-reveal className="lg:hidden">
          <div className="cf-stack flex flex-col gap-9 pt-6">
            {CERTS.map((cert, i) => {
              const open = openIdx === i;
              return (
                <div key={cert.id} className={`relative ${open ? "is-open" : ""}`} style={vars(i)}>
                  <div className="cf-tab" style={{ top: -26, height: 28 }}>
                    <span>{num(i)}</span>
                    <span className="cf-tab-label">{cert.tab}</span>
                  </div>
                  <div className="cf-panel relative overflow-hidden rounded-[20px]">
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => (open ? setOpenIdx(-1) : openFolder(i))}
                      className="relative z-10 flex w-full items-center gap-3 p-3.5 text-left outline-none"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/90 font-mono text-[11px] font-bold shadow-sm" style={{ color: "var(--ink)" }}>
                        {num(i)}
                      </span>
                      <span className="cf-sticker rounded-full px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide">
                        {cert.tab}
                      </span>
                      <span className="ml-auto font-mono text-[11px] font-semibold opacity-60" style={{ color: "var(--ink)" }}>
                        {cert.date}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                        style={{ color: "var(--ink)" }}
                      />
                    </button>

                    <div className="cf-reveal relative z-10">
                      <div className="overflow-hidden">
                        <div className="px-3.5 pb-3.5">
                          <button
                            type="button"
                            aria-label={`Enlarge ${cert.title}`}
                            onClick={() => {
                              playUiClick(true);
                              setZoom(i);
                            }}
                            className="cf-paper relative block w-full rounded-md p-1.5"
                            style={{ transform: open ? "rotate(-.5deg)" : undefined }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={cert.img}
                              alt={cert.title}
                              loading="lazy"
                              draggable={false}
                              className="block h-auto max-h-[60vh] w-full object-contain"
                            />
                          </button>
                          <Paperclip className="pointer-events-none absolute right-6 top-2 z-10 w-6 drop-shadow" />
                          <div className="cf-pocket mt-3 rounded-2xl p-4" style={{ transform: "none" }}>
                            <Details cert={cert} compact />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===================== Lightbox (image only, so it never lags) ===================== */}
      {zoom !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setZoom(null)}
        >
          <div
            role="dialog"
            aria-label={CERTS[zoom].title}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[24px] border border-white/80 bg-white/70 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/70 px-4 py-3">
              <button
                type="button"
                aria-label="Close"
                onClick={() => setZoom(null)}
                className="group flex h-3 w-3 items-center justify-center rounded-full bg-[#ff5f57] ring-1 ring-black/10"
              >
                <X className="h-2 w-2 text-[#7f1d1d] opacity-0 group-hover:opacity-100" />
              </button>
              <span className="truncate text-sm font-semibold text-slate-800">{CERTS[zoom].title}</span>
              <div className="ml-auto flex gap-2">
                <a href={href(CERTS[zoom].pdf)} target="_blank" rel="noopener noreferrer" className="cf-pill cf-pill-pink">
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>View PDF</span>
                </a>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-[#f6efe6]/60 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={CERTS[zoom].img} alt={CERTS[zoom].title} className="mx-auto block max-h-[75vh] w-auto max-w-full rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};