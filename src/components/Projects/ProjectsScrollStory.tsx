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
};

/* ------------------------------------------------------------------ */
/*  Small pieces                                                       */
/* ------------------------------------------------------------------ */
const FolderIcon: React.FC<{ className?: string }> = ({ className = "" }) => {
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

  // IntersectionObserver for entrance reveal animations
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
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));

    const parallax = Array.from(section.querySelectorAll<HTMLElement>("[data-speed]"));
    let raf = 0;

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      for (const el of parallax) {
        const host = el.parentElement;
        if (!host) continue;
        const r = host.getBoundingClientRect();
        if (r.bottom < -400 || r.top > vh + 400) continue;
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
      className="relative scroll-mt-12 overflow-hidden bg-[#f8f8fa]"
    >
      <style>{`
        @keyframes pj-rise { from { opacity: 0; transform: translate3d(0, 40px, 0) scale(.98); filter: blur(6px); } to { opacity: 1; transform: none; filter: blur(0); } }
        @keyframes pj-pop  { 0% { opacity: 0; transform: scale(.7) translateY(12px); } 70% { opacity: 1; transform: scale(1.04); } 100% { opacity: 1; transform: none; } }
        @keyframes pj-phone { from { opacity: 0; transform: translate3d(50px, 20px, 0) rotate(10deg); } to { opacity: 1; transform: rotate(3deg); } }
        @keyframes pj-bob  { 0%,100% { translate: 0 0; } 50% { translate: 0 -6px; } }
        @keyframes pj-word { from { transform: translateY(110%); } to { transform: translateY(0); } }
        @keyframes pj-crossfade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

        [data-reveal] { opacity: 0; }
        [data-reveal].is-in { opacity: 1; }
        .pj-wrap.is-in { animation: pj-rise .8s cubic-bezier(.2,.8,.2,1) backwards; }

        .pj-laptop, .pj-tile, .pj-fade { opacity: 0; }
        .is-in .pj-laptop { opacity: 1; animation: pj-rise .9s cubic-bezier(.2,.8,.2,1) backwards .15s; }
        .is-in .pj-fade   { opacity: 1; animation: pj-rise .7s cubic-bezier(.2,.8,.2,1) backwards .05s; }
        .is-in .pj-tile   { opacity: 1; animation: pj-pop .6s cubic-bezier(.34,1.56,.64,1) backwards, pj-bob 6s ease-in-out infinite; animation-delay: calc(.3s + var(--i) * .09s), calc(1.2s + var(--i) * .5s); }
        .pj-phone { opacity: 0; transform: rotate(3deg); }
        .is-in .pj-phone { opacity: 1; animation: pj-phone .8s cubic-bezier(.2,.8,.2,1) backwards .35s; }

        .pj-switch-content {
          animation: pj-crossfade .35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .pj-mask { display: inline-block; overflow: hidden; padding: 0 .06em .14em; margin: 0 -.06em -.14em; vertical-align: bottom; }
        .pj-word { display: inline-block; transform: translateY(110%); }
        .pj-words.is-in .pj-word { transform: none; animation: pj-word .95s cubic-bezier(.2,.8,.2,1) backwards; animation-delay: calc(var(--i) * 110ms); }
        .pj-grad { background: linear-gradient(135deg, #0b0b10 10%, #4a1236 50%, #f0568f 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }

        /* frosted-glass Finder window */
        .pj-win {
          transform-origin: top center;
          background: linear-gradient(180deg, rgba(255,255,255,.72), rgba(255,255,255,.48));
          -webkit-backdrop-filter: blur(30px) saturate(1.5); backdrop-filter: blur(30px) saturate(1.5);
          border: 1px solid rgba(255,255,255,.88);
          box-shadow: 0 0 0 1px rgba(15,23,42,.06), inset 0 1px 0 rgba(255,255,255,.95), 0 32px 64px -24px rgba(76,57,120,.3);
        }
        .pj-side { background: rgba(255,255,255,.32); border-right: 1px solid rgba(255,255,255,.75); }
        .pj-nav { background: linear-gradient(180deg, rgba(255,255,255,.9), rgba(255,255,255,.55)); border: 1px solid rgba(255,255,255,.9); box-shadow: 0 0 0 1px rgba(15,23,42,.06), 0 6px 14px -8px rgba(15,23,42,.3); }
        .pj-tile { border-radius: 20px; padding: .8rem 1rem; background: linear-gradient(180deg, rgba(255,255,255,.85), rgba(255,255,255,.55)); border: 1px solid rgba(255,255,255,.9); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); box-shadow: 0 0 0 1px rgba(15,23,42,.05), inset 0 1px 0 #fff, 0 16px 26px -18px rgba(76,57,120,.4); }
        .pj-ctl { display: flex; align-items: center; justify-content: center; height: 28px; width: 28px; border-radius: 9999px; color: #fff; background: rgba(255,255,255,.25); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,.4); transition: background .2s; }
        .pj-ctl:hover { background: rgba(255,255,255,.4); }

        .pj-pill {
          position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: .45rem;
          border-radius: 9999px; border: 1px solid rgba(148,163,184,.55); padding: .5rem 1rem;
          font-size: 13.5px; font-weight: 500; color: #334155; white-space: nowrap;
          background: linear-gradient(180deg, #fff, #f1f2f5);
          box-shadow: inset 0 1px 1px #fff, inset 0 -1px 2px rgba(15,23,42,.07), 0 4px 10px -6px rgba(15,23,42,.3);
          transition: transform .15s, filter .15s;
        }
        .pj-pill > * { position: relative; z-index: 1; }
        .pj-chip { padding: .28rem .7rem; font-size: 12px; }
        .pj-pill-pink { color: #4a1230; border-color: rgba(224,98,143,.7); text-shadow: 0 1px 0 rgba(255,255,255,.55); background: linear-gradient(180deg, #ffc9db 0%, #ff9bbd 48%, #fb7fa9 52%, #ffa8c6 100%); box-shadow: inset 0 1px 1px rgba(255,255,255,.9), inset 0 -1px 2px rgba(190,40,100,.25), 0 8px 16px -6px rgba(244,114,182,.6); }
        .pj-pill-pink::before { content: ""; position: absolute; z-index: 0; left: 12px; right: 12px; top: 3px; height: 44%; border-radius: 9999px; background: linear-gradient(180deg, rgba(255,255,255,.75), rgba(255,255,255,.05)); }
        a.pj-pill:active { transform: translateY(1px); filter: brightness(.96); }

        @media (prefers-reduced-motion: reduce) {
          .pj-wrap.is-in, .is-in .pj-laptop, .is-in .pj-fade, .is-in .pj-tile, .is-in .pj-phone, .pj-words.is-in .pj-word { animation: none; }
          .pj-laptop, .pj-tile, .pj-fade, .pj-phone { opacity: 1; }
          .pj-word { transform: none; }
        }
      `}</style>

      {/* dotted desktop pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(15,23,42,0.15) 1.3px, transparent 1.5px)",
          backgroundSize: "34px 34px",
        }}
      />

      {/* soft colour blobs for glassmorphism */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
        {[
          { cls: "left-[-6%] top-[8%] h-[420px] w-[420px] bg-[#ffc9dc]", speed: 0.12 },
          { cls: "right-[-8%] top-[30%] h-[460px] w-[460px] bg-[#d9ccff]", speed: -0.08 },
          { cls: "left-[10%] top-[58%] h-[400px] w-[400px] bg-[#c9e4ff]", speed: 0.16 },
          { cls: "right-[4%] top-[82%] h-[380px] w-[380px] bg-[#ffe3cc]", speed: -0.1 },
        ].map((b, i) => (
          <div key={i} className="absolute inset-0">
            <div
              data-speed={b.speed}
              className={`absolute rounded-full opacity-50 blur-3xl will-change-transform ${b.cls}`}
            />
          </div>
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-28 pt-20 sm:pt-28">
        {/* Header */}
        <div className="mb-10 space-y-3">
          <span data-reveal className="pj-pill pj-chip">
            <span className="h-2 w-2 rounded-full bg-pink-400" />
            <span>Featured Work</span>
          </span>
          <h2
            data-words
            className="pj-words text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl"
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
          <p data-reveal className="max-w-md text-base sm:text-lg text-slate-500">
            Click the folder tabs in the window or use the controls to browse each project.
          </p>
        </div>

        {/* ── Single Window with Sidebar & Tabbed Contents ── */}
        <div data-reveal className="pj-wrap">
          <article className="pj-win relative overflow-hidden rounded-[28px] lg:grid lg:grid-cols-[210px_1fr]">
            
            {/* ---------------- Sidebar (large screens) ---------------- */}
            <aside className="pj-side hidden flex-col gap-6 p-5 pt-6 lg:flex">
              <TrafficLights />

              <div>
                <div className="mb-1.5 px-2 text-[13px] text-slate-500">Projects</div>
                <ul className="space-y-1">
                  {projects.map((p, i) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => goTo(i)}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[14px] font-medium transition ${
                          i === activeIdx
                            ? "bg-white/85 text-slate-900 shadow-[0_1px_0_#fff_inset,0_0_0_1px_rgba(255,255,255,.9),0_4px_10px_-6px_rgba(15,23,42,.25)]"
                            : "text-slate-600 hover:bg-white/45"
                        }`}
                      >
                        <FolderIcon className="w-5 shrink-0" />
                        <span className="truncate">{p.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="mb-1.5 px-2 text-[13px] text-slate-500">Info</div>
                <dl className="space-y-2 px-2 text-[13px] leading-snug">
                  <div>
                    <dt className="text-slate-400">Year</dt>
                    <dd className="font-medium text-slate-700">{currentProject.period}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Role</dt>
                    <dd className="font-medium text-slate-700">{currentProject.role}</dd>
                  </div>
                </dl>
              </div>

              {repoLinks.length > 0 && (
                <div>
                  <div className="mb-1.5 px-2 text-[13px] text-slate-500">Code</div>
                  <ul className="space-y-1">
                    {repoLinks.map((l) => (
                      <li key={l.label}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => playUiClick(true)}
                          className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-[13px] font-medium text-slate-600 transition hover:bg-white/50"
                        >
                          <GithubIcon className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{l.label}</span>
                          <ExternalLink className="ml-auto h-3 w-3 shrink-0 text-slate-400" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>

            {/* ---------------- Main Content Area ---------------- */}
            <div className="flex flex-col p-5 sm:p-7 lg:pl-8">
              
              {/* Toolbar */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200/50">
                <TrafficLights className="lg:hidden" />
                
                <div className="pj-nav flex items-center rounded-full">
                  <button
                    type="button"
                    aria-label="Previous project"
                    disabled={activeIdx === 0}
                    onClick={() => goTo(activeIdx - 1)}
                    className="px-3 py-1.5 text-slate-700 transition disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-950"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="h-4 w-px bg-slate-300/70" />
                  <button
                    type="button"
                    aria-label="Next project"
                    disabled={activeIdx === projects.length - 1}
                    onClick={() => goTo(activeIdx + 1)}
                    className="px-3 py-1.5 text-slate-700 transition disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-950"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <span className="text-[17px] font-semibold text-slate-800">Projects</span>
                
                <span className="ml-auto text-xs font-mono text-slate-400">
                  {activeIdx + 1} of {projects.length}
                </span>
              </div>

              {/* Mobile Tabs Switcher (when sidebar is hidden on small screens) */}
              <div className="flex items-center gap-2 overflow-x-auto pt-3 lg:hidden">
                {projects.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => goTo(i)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition whitespace-nowrap ${
                      i === activeIdx
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:bg-white/40"
                    }`}
                  >
                    <FolderIcon className="w-4 shrink-0" />
                    <span>{p.title}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Project Content (Smoothly switches with key) */}
              <div key={currentProject.id} className="pj-switch-content">
                
                {/* Title row */}
                <div className="pj-fade mt-5 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                      {currentProject.title}
                    </h3>
                    <p className="mt-1 text-[15px] text-slate-500">{currentProject.subtitle}</p>
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
                      <Globe className="h-4 w-4" />
                      <span>Live Platform</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                {/* Device Stage */}
                <div className="mt-6 flex flex-col items-center justify-center gap-6 lg:flex-row lg:gap-8">
                  {metrics.length > 0 && (
                    <div className="order-2 grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:order-1 lg:w-[200px] lg:shrink-0 lg:grid-cols-2">
                      {metrics.map((m, i) => (
                        <div
                          key={m.label}
                          className="pj-tile"
                          style={{ "--i": i } as React.CSSProperties}
                        >
                          <div className="text-xs text-slate-500">{m.label}</div>
                          <div className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-slate-900">
                            {m.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="relative order-1 w-full max-w-[480px] lg:order-2 lg:flex-1">
                    {/* Laptop Frame */}
                    <div className="pj-laptop group relative">
                      <div className="rounded-[16px] bg-[#16161a] p-[9px] shadow-[0_30px_50px_-24px_rgba(15,23,42,.6)] ring-1 ring-black/40">
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
                              <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/45 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                  type="button"
                                  onClick={togglePlay}
                                  aria-label={playing ? "Pause demo" : "Play demo"}
                                  className="pj-ctl"
                                >
                                  {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={toggleMute}
                                  aria-label={muted ? "Unmute demo" : "Mute demo"}
                                  className="pj-ctl"
                                >
                                  {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-white to-violet-50 p-6 text-center">
                              <div className="text-xl font-bold tracking-tight text-slate-900">
                                {currentProject.title}
                              </div>
                              <p className="mt-1 max-w-[260px] text-xs text-slate-500">
                                {currentProject.tags.slice(0, 3).join(" • ")}
                              </p>
                            </div>
                          )}
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                        </div>
                      </div>
                      {/* Laptop Base */}
                      <div className="-mx-[6%] h-[13px] rounded-b-[14px] rounded-t-[3px] bg-gradient-to-b from-[#eceef2] via-[#cfd3da] to-[#aab0ba] shadow-[0_14px_20px_-10px_rgba(15,23,42,.45)]">
                        <div className="mx-auto h-[5px] w-[16%] rounded-b-md bg-[#9aa0ab]" />
                      </div>
                    </div>

                    {/* Phone Demo (if available) */}
                    {hasPhone && (
                      <div
                        data-speed="0.05"
                        className="absolute -bottom-5 -right-3 z-20 w-[23%] min-w-[96px] sm:-right-6"
                      >
                        <div className="pj-phone rounded-[2rem] bg-[#0d0d10] p-[5px] shadow-[0_30px_46px_-18px_rgba(15,23,42,.65)] ring-1 ring-white/20">
                          <div className="relative aspect-[9/19.5] overflow-hidden rounded-[1.65rem] bg-slate-950">
                            <span className="absolute left-1/2 top-[6px] z-10 h-[9px] w-[34%] -translate-x-1/2 rounded-full bg-black" />
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
                              <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-b from-pink-100 via-white to-violet-100 px-2 text-center">
                                <span className="text-sm font-extrabold tracking-tight text-slate-900">
                                  {currentProject.title}
                                </span>
                                <span className="text-[8px] leading-tight text-slate-500">
                                  Mobile demo soon
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description + Stack */}
                <div className="pj-fade mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <p className="line-clamp-3 max-w-md text-[14px] leading-relaxed text-slate-600">
                    {currentProject.description}
                  </p>
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
                  <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
                    {repoLinks.map((l) => (
                      <a
                        key={l.label}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => playUiClick(true)}
                        className="pj-pill"
                      >
                        <GithubIcon className="h-3.5 w-3.5" />
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
