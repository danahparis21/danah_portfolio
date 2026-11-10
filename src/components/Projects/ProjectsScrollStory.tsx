"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Globe,
  FolderOpen,
} from "lucide-react";
import { GithubIcon } from "@/components/UI/Icons";
import { PORTFOLIO_DATA, Project } from "@/data/portfolioData";
import { playUiClick } from "@/utils/sound";

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */
/** Projects that also have a phone version. When your mobile recording is ready,
 *  put its path here (e.g. "/videos/senas-mobile.mp4"). `null` shows a clean placeholder. */
const MOBILE_DEMOS: Record<string, string | null> = {
  senas: null,
  "ai-reviewer": null,
};

/* ------------------------------------------------------------------ */
/*  Small pieces                                                       */
/* ------------------------------------------------------------------ */
const FolderIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-5 shrink-0" }) => {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 120 94" className={className} aria-hidden>
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
      <rect x="7" y="14" width="106" height="50" rx="7" fill="#ffffff" />
      <path
        d="M0 28A12 12 0 0 1 12 16H108A12 12 0 0 1 120 28V82A12 12 0 0 1 108 94H12A12 12 0 0 1 0 82Z"
        fill={`url(#${uid}f)`}
      />
    </svg>
  );
};

const TrafficLights: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center gap-2 ${className}`} aria-hidden>
    <span className="h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-black/10" />
    <span className="h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-black/10" />
    <span className="h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-black/10" />
  </div>
);

/* ------------------------------------------------------------------ */
/*  Main Component: Single Window with Tabbed Projects                */
/* ------------------------------------------------------------------ */
export const ProjectsScrollStory: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const projects = PORTFOLIO_DATA.projects as Project[];
  const [activeIdx, setActiveIdx] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const phoneRef = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  const currentProject = projects[activeIdx] ?? projects[0];
  const hasPhone = currentProject.id in MOBILE_DEMOS;
  const phoneSrc = MOBILE_DEMOS[currentProject.id];
  const metrics = currentProject.metrics ?? [];

  // Reset video playback states on project switch
  useEffect(() => {
    userPaused.current = false;
    setPlaying(true);
    const web = videoRef.current;
    if (web) {
      web.currentTime = 0;
      web.play().catch(() => {});
    }
    const phone = phoneRef.current;
    if (phone) {
      phone.currentTime = 0;
      phone.play().catch(() => {});
    }
  }, [activeIdx]);

  // Handle play/pause toggle
  const togglePlay = () => {
    playUiClick(true);
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      v.play().catch(() => {});
      setPlaying(true);
    } else {
      userPaused.current = true;
      v.pause();
      setPlaying(false);
    }
  };

  // Handle mute/unmute toggle
  const toggleMute = () => {
    playUiClick(true);
    const v = videoRef.current;
    if (!v) return;
    v.muted = !muted;
    setMuted(!muted);
  };

  const goTo = (i: number) => {
    if (i < 0 || i >= projects.length || i === activeIdx) return;
    playUiClick(true);
    setActiveIdx(i);
  };

  // High-performance wheel scroll controller on the Projects window
  // Allows cycling through all projects with fluid trackpad or mouse wheel strokes,
  // pausing on any project, and scrolling naturally past the first or last project!
  const lastWheelTime = useRef(0);
  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Ignore tiny jitter
      if (Math.abs(e.deltaY) < 18) return;

      const now = Date.now();
      // 360ms cooldown prevents accidental rapid skipping
      if (now - lastWheelTime.current < 360) return;

      if (e.deltaY > 0) {
        // Scrolling DOWN
        if (activeIdx < projects.length - 1) {
          e.preventDefault();
          lastWheelTime.current = now;
          playUiClick(true);
          setActiveIdx((prev) => prev + 1);
        }
        // At last project (activeIdx === 3), do not preventDefault -> page scrolls down to About
      } else {
        // Scrolling UP
        if (activeIdx > 0) {
          e.preventDefault();
          lastWheelTime.current = now;
          playUiClick(true);
          setActiveIdx((prev) => prev - 1);
        }
        // At first project (activeIdx === 0), do not preventDefault -> page scrolls up to Hero
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [activeIdx, projects.length]);

  // Touch swipe support for mobile
  const touchStartY = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    touchStartY.current = null;
    if (Math.abs(deltaY) < 45) return;

    if (deltaY > 0 && activeIdx < projects.length - 1) {
      playUiClick(true);
      setActiveIdx((prev) => prev + 1);
    } else if (deltaY < 0 && activeIdx > 0) {
      playUiClick(true);
      setActiveIdx((prev) => prev - 1);
    }
  };

  // Entrance reveal animations
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveals = section.querySelectorAll<HTMLElement>("[data-reveal],[data-words]");

    if (reduce) {
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
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
    );
    reveals.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, []);

  const links = [
    ...(currentProject.liveUrl
      ? [{ label: "Live Platform", url: currentProject.liveUrl, live: true }]
      : []),
    ...(currentProject.githubUrls ?? []).map((r) => ({ label: r.label, url: r.url, live: false })),
  ];
  const repoLinks = links.filter((l) => !l.live);

  const headline = ["Things", "I've", "built."];

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative scroll-mt-12 bg-[#f8f8fa] py-12 sm:py-18 flex flex-col justify-center items-center min-h-[90vh]"
    >
      <style>{`
        @keyframes pj-rise { from { opacity: 0; transform: translate3d(0, 24px, 0) scale(.98); filter: blur(4px); } to { opacity: 1; transform: none; filter: blur(0); } }
        @keyframes pj-pop  { 0% { opacity: 0; transform: scale(.7) translateY(10px); } 70% { opacity: 1; transform: scale(1.03); } 100% { opacity: 1; transform: none; } }
        @keyframes pj-phone { from { opacity: 0; transform: translate3d(30px, 15px, 0) rotate(8deg); } to { opacity: 1; transform: rotate(3deg); } }
        @keyframes pj-bob  { 0%,100% { translate: 0 0; } 50% { translate: 0 -4px; } }
        @keyframes pj-word { from { transform: translateY(110%); } to { transform: translateY(0); } }
        @keyframes pj-crossfade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

        [data-reveal] { opacity: 0; }
        [data-reveal].is-in { opacity: 1; }
        .pj-wrap.is-in { animation: pj-rise .7s cubic-bezier(.2,.8,.2,1) backwards; }

        .pj-laptop, .pj-tile, .pj-fade { opacity: 0; }
        .is-in .pj-laptop { opacity: 1; animation: pj-rise .8s cubic-bezier(.2,.8,.2,1) backwards .12s; }
        .is-in .pj-fade   { opacity: 1; animation: pj-rise .6s cubic-bezier(.2,.8,.2,1) backwards .04s; }
        .is-in .pj-tile   { opacity: 1; animation: pj-pop .5s cubic-bezier(.34,1.56,.64,1) backwards, pj-bob 6s ease-in-out infinite; animation-delay: calc(.18s + var(--i) * .06s), calc(1.2s + var(--i) * .5s); }
        .pj-phone { opacity: 0; transform: rotate(3deg); }
        .is-in .pj-phone { opacity: 1; animation: pj-phone .7s cubic-bezier(.2,.8,.2,1) backwards .3s; }

        .pj-switch-content {
          animation: pj-crossfade .25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .pj-mask { display: inline-block; overflow: hidden; padding: 0 .06em .14em; margin: 0 -.06em -.14em; vertical-align: bottom; }
        .pj-word { display: inline-block; transform: translateY(110%); }
        .pj-words.is-in .pj-word { transform: none; animation: pj-word .9s cubic-bezier(.2,.8,.2,1) backwards; animation-delay: calc(var(--i) * 110ms); }
        .pj-grad { background: linear-gradient(135deg, #0b0b10 10%, #4a1236 50%, #f0568f 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }

        /* Frosted-glass Finder window */
        .pj-win {
          transform-origin: top center;
          background: linear-gradient(180deg, rgba(255,255,255,.82), rgba(255,255,255,.6));
          -webkit-backdrop-filter: blur(28px) saturate(1.5); backdrop-filter: blur(28px) saturate(1.5);
          border: 1px solid rgba(255,255,255,.9);
          box-shadow: 0 0 0 1px rgba(15,23,42,.06), inset 0 1px 0 rgba(255,255,255,.95), 0 28px 56px -22px rgba(76,57,120,.24);
        }
        .pj-side { background: rgba(255,255,255,.4); border-right: 1px solid rgba(255,255,255,.75); }
        .pj-nav { background: linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,.65)); border: 1px solid rgba(255,255,255,.9); box-shadow: 0 0 0 1px rgba(15,23,42,.06), 0 4px 10px -6px rgba(15,23,42,.2); }
        .pj-tile { border-radius: 16px; padding: .65rem .8rem; background: linear-gradient(180deg, rgba(255,255,255,.9), rgba(255,255,255,.65)); border: 1px solid rgba(255,255,255,.95); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); box-shadow: 0 0 0 1px rgba(15,23,42,.05), inset 0 1px 0 #fff, 0 10px 20px -14px rgba(76,57,120,.3); }
        .pj-ctl { display: flex; align-items: center; justify-content: center; height: 26px; width: 26px; border-radius: 9999px; color: #fff; background: rgba(255,255,255,.25); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,.4); transition: background .2s; }
        .pj-ctl:hover { background: rgba(255,255,255,.4); }

        .pj-pill {
          position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: .4rem;
          border-radius: 9999px; border: 1px solid rgba(148,163,184,.55); padding: .4rem .85rem;
          font-size: 13px; font-weight: 500; color: #334155; white-space: nowrap;
          background: linear-gradient(180deg, #fff, #f1f2f5);
          box-shadow: inset 0 1px 1px #fff, inset 0 -1px 2px rgba(15,23,42,.07), 0 4px 10px -6px rgba(15,23,42,.25);
          transition: transform .15s, filter .15s;
        }
        .pj-pill > * { position: relative; z-index: 1; }
        .pj-chip { padding: .24rem .65rem; font-size: 11.5px; }
        .pj-pill-pink { color: #4a1230; border-color: rgba(224,98,143,.7); text-shadow: 0 1px 0 rgba(255,255,255,.55); background: linear-gradient(180deg, #ffc9db 0%, #ff9bbd 48%, #fb7fa9 52%, #ffa8c6 100%); box-shadow: inset 0 1px 1px rgba(255,255,255,.9), inset 0 -1px 2px rgba(190,40,100,.25), 0 6px 14px -5px rgba(244,114,182,.55); }
        .pj-pill-pink::before { content: ""; position: absolute; z-index: 0; left: 10px; right: 10px; top: 2px; height: 44%; border-radius: 9999px; background: linear-gradient(180deg, rgba(255,255,255,.75), rgba(255,255,255,.05)); }
        a.pj-pill:active { transform: translateY(1px); filter: brightness(.96); }

        /* Custom subtle scrollbar for description */
        .pj-desc::-webkit-scrollbar { width: 4px; }
        .pj-desc::-webkit-scrollbar-track { background: transparent; }
        .pj-desc::-webkit-scrollbar-thumb { background: rgba(244,114,182,0.45); border-radius: 9999px; }
        .pj-desc::-webkit-scrollbar-thumb:hover { background: rgba(244,114,182,0.85); }

        @media (prefers-reduced-motion: reduce) {
          .pj-wrap.is-in, .is-in .pj-laptop, .is-in .pj-fade, .is-in .pj-tile, .is-in .pj-phone, .pj-words.is-in .pj-word { animation: none; }
          .pj-laptop, .pj-tile, .pj-fade, .pj-phone { opacity: 1; }
          .pj-word { transform: none; }
        }
      `}</style>

      {/* Dotted desktop pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(15,23,42,0.15) 1.3px, transparent 1.5px)",
          backgroundSize: "34px 34px",
        }}
      />

      {/* Soft color blobs for glassmorphism */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden hidden md:block">
        <div className="absolute left-[-6%] top-[10%] h-[380px] w-[380px] rounded-full bg-[#ffc9dc] opacity-35 blur-3xl" />
        <div className="absolute right-[-8%] top-[25%] h-[420px] w-[420px] rounded-full bg-[#d9ccff] opacity-35 blur-3xl" />
        <div className="absolute left-[10%] top-[55%] h-[360px] w-[360px] rounded-full bg-[#c9e4ff] opacity-35 blur-3xl" />
        <div className="absolute right-[4%] top-[75%] h-[340px] w-[340px] rounded-full bg-[#ffe3cc] opacity-35 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4">

        {/* Section Header */}
        <div className="mb-5 sm:mb-6 flex flex-wrap items-baseline justify-between gap-3 px-1">
          <div className="space-y-1.5">
            <span data-reveal className="pj-pill pj-chip">
              <span className="h-2 w-2 rounded-full bg-pink-400" />
              <span>Featured Work</span>
            </span>
            <h2
              data-words
              className="pj-words text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900"
            >
              {headline.map((w, i) => (
                <React.Fragment key={w}>
                  <span className="pj-mask">
                    <span
                      className={`pj-word ${i === headline.length - 1 ? "pj-grad" : ""}`}
                      style={{ "--i": i } as React.CSSProperties}
                    >
                      {w}
                    </span>
                  </span>{" "}
                </React.Fragment>
              ))}
            </h2>
          </div>
          <p data-reveal className="hidden sm:block text-xs sm:text-sm text-slate-400 font-medium">
            Scroll or use folder tabs to explore each project
          </p>
        </div>

        {/* ── Single Window with Sidebar & Tabbed Contents ── */}
        <div data-reveal className="pj-wrap">
          <article
            ref={articleRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="pj-win relative overflow-hidden rounded-[24px] lg:grid lg:grid-cols-[210px_1fr]"
          >
            
            {/* ---------------- Sidebar (large screens) ---------------- */}
            <aside className="pj-side hidden flex-col gap-5 p-5 pt-6 lg:flex" style={{ minHeight: 0 }}>
              <TrafficLights />

              <div>
                <div className="mb-1.5 px-2 text-[12px] font-semibold uppercase tracking-wider text-slate-400">
                  Projects
                </div>
                <ul className="space-y-1">
                  {projects.map((p, i) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => goTo(i)}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13.5px] font-medium transition ${
                          i === activeIdx
                            ? "bg-white/95 text-slate-900 shadow-[0_1px_0_#fff_inset,0_0_0_1px_rgba(255,255,255,.9),0_4px_8px_-5px_rgba(15,23,42,.25)]"
                            : "text-slate-600 hover:bg-white/45"
                        }`}
                      >
                        <FolderIcon className="h-4 w-5 shrink-0" />
                        <span className="truncate">{p.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="mb-1.5 px-2 text-[12px] font-semibold uppercase tracking-wider text-slate-400">
                  Info
                </div>
                <dl className="space-y-1.5 px-2 text-[12.5px] leading-snug">
                  <div>
                    <dt className="text-slate-400 text-[11px]">Year</dt>
                    <dd className="font-medium text-slate-700">{currentProject.period}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 text-[11px]">Role</dt>
                    <dd className="font-medium text-slate-700 truncate">{currentProject.role}</dd>
                  </div>
                </dl>
              </div>

              {repoLinks.length > 0 && (
                <div>
                  <div className="mb-1.5 px-2 text-[12px] font-semibold uppercase tracking-wider text-slate-400">
                    Code
                  </div>
                  <ul className="space-y-1">
                    {repoLinks.map((l) => (
                      <li key={l.label}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => playUiClick(true)}
                          className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-[12.5px] font-medium text-slate-600 transition hover:bg-white/50"
                        >
                          <GithubIcon className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{l.label}</span>
                          <ExternalLink className="ml-auto h-2.5 w-2.5 shrink-0 text-slate-400" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* More Projects archive link pinned at bottom of sidebar */}
              <div className="mt-auto pt-2">
                <a
                  href="https://github.com/danahparis21"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playUiClick(true)}
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-[12.5px] font-medium text-pink-600 transition hover:bg-pink-50/60"
                >
                  <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                  <span>More Projects</span>
                  <ExternalLink className="ml-auto h-3 w-3 shrink-0 text-pink-300" />
                </a>
              </div>
            </aside>

            {/* ---------------- Main Content Area ---------------- */}
            <div className="flex flex-col p-5 sm:p-6 lg:pl-7">
              
              {/* Window Toolbar */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200/50">
                <TrafficLights className="lg:hidden" />
                
                <div className="pj-nav flex items-center rounded-full">
                  <button
                    type="button"
                    aria-label="Previous project"
                    disabled={activeIdx === 0}
                    onClick={() => goTo(activeIdx - 1)}
                    className="px-2.5 py-1 text-slate-700 transition disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-950"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span className="h-3.5 w-px bg-slate-300/70" />
                  <button
                    type="button"
                    aria-label="Next project"
                    disabled={activeIdx === projects.length - 1}
                    onClick={() => goTo(activeIdx + 1)}
                    className="px-2.5 py-1 text-slate-700 transition disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-950"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <span className="text-[15px] sm:text-[16px] font-semibold text-slate-800">Projects</span>

                {/* Step Progress Dots */}
                <div className="hidden sm:flex items-center gap-1.5 ml-2">
                  {projects.map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => goTo(i)}
                      title={p.title}
                      aria-label={`Jump to ${p.title}`}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === activeIdx
                          ? "w-6 bg-gradient-to-r from-pink-500 to-rose-400 shadow-sm"
                          : "w-2 bg-slate-300 hover:bg-slate-400"
                      }`}
                    />
                  ))}
                </div>
                
                <span className="ml-auto text-xs font-mono text-slate-400">
                  {activeIdx + 1} of {projects.length}
                </span>
              </div>

              {/* Mobile Tabs Switcher (when sidebar is hidden on small screens) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-1 lg:hidden">
                {projects.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => goTo(i)}
                    className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition whitespace-nowrap ${
                      i === activeIdx
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:bg-white/40"
                    }`}
                  >
                    <FolderIcon className="h-3.5 w-4 shrink-0" />
                    <span>{p.title}</span>
                  </button>
                ))}
              </div>

              {/* Project Content Stage */}
              <div className="pj-switch-content">
                
                {/* Title row */}
                <div className="pj-fade mt-4 sm:mt-5 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                      {currentProject.title}
                    </h3>
                    <p className="mt-1 text-[13.5px] sm:text-[14.5px] text-slate-500">{currentProject.subtitle}</p>
                    <p className="mt-1 text-xs text-slate-400 lg:hidden">
                      {currentProject.period} · {currentProject.role}
                    </p>
                  </div>
                  {currentProject.liveUrl && (
                    <a
                      href={currentProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => playUiClick(true)}
                      className="pj-pill pj-pill-pink"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>Live Platform</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {/* Device Stage — Centered & Balanced */}
                <div className="mt-5 flex flex-col items-center justify-center gap-6 lg:flex-row lg:items-center lg:gap-8">
                  {metrics.length > 0 && (
                    <div className="order-2 grid w-full grid-cols-2 gap-2.5 sm:grid-cols-4 lg:order-1 lg:w-[210px] xl:w-[220px] lg:shrink-0 lg:grid-cols-2">
                      {metrics.map((m, i) => (
                        <div
                          key={m.label}
                          className={`pj-tile flex flex-col justify-center ${
                            metrics.length === 3 && i === 2 ? "col-span-2 lg:col-span-2" : ""
                          }`}
                          style={{ "--i": i } as React.CSSProperties}
                        >
                          <div className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
                            {m.label}
                          </div>
                          <div className="mt-0.5 text-[12.5px] sm:text-[13.5px] font-bold tracking-tight text-slate-800 leading-snug break-words">
                            {m.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Centered Laptop Device */}
                  <div className="relative order-1 w-full max-w-[430px] shrink-0 lg:order-2">
                    <div className="pj-laptop group relative">
                      <div className="rounded-[16px] bg-[#16161a] p-[8px] sm:p-[9px] shadow-[0_26px_46px_-18px_rgba(15,23,42,.55)] ring-1 ring-black/40">
                        <div className="relative aspect-[16/10] overflow-hidden rounded-[8px] bg-slate-950">
                          <span className="absolute left-1/2 top-[5px] z-10 h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-slate-700" />
                          {currentProject.videoUrl ? (
                            <>
                              <video
                                ref={videoRef}
                                src={currentProject.videoUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/45 to-transparent p-2.5 opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                  type="button"
                                  onClick={togglePlay}
                                  aria-label={playing ? "Pause demo" : "Play demo"}
                                  className="pj-ctl"
                                >
                                  {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={toggleMute}
                                  aria-label={muted ? "Unmute demo" : "Mute demo"}
                                  className="pj-ctl"
                                >
                                  {muted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-white to-violet-50 p-5 text-center">
                              <div className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                                {currentProject.title}
                              </div>
                              <p className="mt-0.5 max-w-[240px] text-[11px] text-slate-500">
                                {currentProject.tags.slice(0, 3).join(" • ")}
                              </p>
                            </div>
                          )}
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                        </div>
                      </div>
                      {/* Laptop Base */}
                      <div className="-mx-[6%] h-[12px] sm:h-[13px] rounded-b-[13px] rounded-t-[2px] bg-gradient-to-b from-[#eceef2] via-[#cfd3da] to-[#aab0ba] shadow-[0_12px_18px_-8px_rgba(15,23,42,.4)]">
                        <div className="mx-auto h-[4px] w-[16%] rounded-b-md bg-[#9aa0ab]" />
                      </div>
                    </div>

                    {/* Phone Demo (if available) */}
                    {hasPhone && (
                      <div className="absolute -bottom-3 -right-2 z-20 w-[24%] min-w-[88px] sm:-right-4 sm:-bottom-4">
                        <div className="pj-phone rounded-[1.8rem] bg-[#0d0d10] p-[4px] shadow-[0_24px_38px_-14px_rgba(15,23,42,.6)] ring-1 ring-white/20">
                          <div className="relative aspect-[9/19.5] overflow-hidden rounded-[1.55rem] bg-slate-950">
                            <span className="absolute left-1/2 top-[5px] z-10 h-[7px] w-[34%] -translate-x-1/2 rounded-full bg-black" />
                            {phoneSrc ? (
                              <video
                                ref={phoneRef}
                                src={phoneSrc}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 bg-gradient-to-b from-pink-100 via-white to-violet-100 px-1.5 text-center">
                                <span className="text-[11px] sm:text-xs font-extrabold tracking-tight text-slate-900">
                                  {currentProject.title}
                                </span>
                                <span className="text-[7.5px] leading-tight text-slate-500">
                                  Mobile Demo
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description + Tech Stack */}
                <div className="pj-fade mt-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="group/desc relative max-w-md lg:max-w-lg">
                    <div className="pj-desc max-h-[64px] sm:max-h-[72px] overflow-y-auto pr-2 text-[13.5px] leading-relaxed text-slate-600 transition-[max-height] duration-300 ease-in-out hover:max-h-[160px]">
                      <p>{currentProject.description}</p>
                    </div>
                    <div className="mt-1 text-[11px] font-medium text-pink-500/80">
                      <span>Hover or scroll for full description</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 md:max-w-sm md:justify-end">
                    {currentProject.tags.map((tag) => (
                      <span key={tag} className="pj-pill pj-chip">
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Repo links on small screens (sidebar is hidden there) */}
                {repoLinks.length > 0 && (
                  <div className="mt-3.5 flex flex-wrap gap-1.5 lg:hidden">
                    {repoLinks.map((l) => (
                      <a
                        key={l.label}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => playUiClick(true)}
                        className="pj-pill text-xs py-1 px-2.5"
                      >
                        <GithubIcon className="h-3 w-3" />
                        <span>{l.label}</span>
                      </a>
                    ))}
                  </div>
                )}

              </div>
            </div>

          </article>
        </div>

      </div>
    </section>
  );
};
