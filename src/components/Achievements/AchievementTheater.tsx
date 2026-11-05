"use client";

/**
 * AchievementTheater — Clean macOS QuickTime Showcase
 * - 3 Landscape macOS QuickTime windows in a balanced 3-column layout (no overlap)
 * - Second video centered in the middle
 * - Clutter removed: trash can, folders, hello sticker, and 4-star icon removed
 * - Clean subtitle without heavy container box, using smooth keyframe fade animation
 * - Dot pattern removed, ambient pastel blur glow preserved
 * - Zero emojis — uses Lucide SVG icons only.
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Trophy,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { playUiClick } from "@/utils/sound";

/* ------------------------------------------------------------------ */
/*  Subtle Decorative Accents                                         */
/* ------------------------------------------------------------------ */

// macOS Spinning Beachball / Pinwheel
const SpinningBeachball: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`relative h-5 w-5 rounded-full overflow-hidden shadow-2xs animate-spin ${className}`} style={{ animationDuration: "3s" }}>
    <div className="absolute inset-0 bg-[conic-gradient(#ff3b30_0deg_60deg,#ff9500_60deg_120deg,#ffcc00_120deg_180deg,#34c759_180deg_240deg,#007aff_240deg_300deg,#af52de_300deg_360deg)]" />
    <div className="absolute inset-0 bg-radial from-transparent to-black/20" />
    <div className="absolute inset-[30%] rounded-full bg-white/40 backdrop-blur-xs" />
  </div>
);

// macOS Window Traffic Lights
const TrafficLights: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center gap-1.5 ${className}`} aria-hidden>
    <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] ring-1 ring-black/10" />
    <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e] ring-1 ring-black/10" />
    <span className="h-2.5 w-2.5 rounded-full bg-[#28c840] ring-1 ring-black/10" />
  </div>
);

/* ------------------------------------------------------------------ */
/*  Video Item Data (All in Landscape 16:10)                           */
/* ------------------------------------------------------------------ */
interface AwardVideo {
  id: string;
  filename: string;
  videoUrl: string;
  badge: string;
  tagLabel: string;
  tagColor: string;
  title: string;
  organization: string;
  year: string;
  description: string;
  speed: number;
}

const AWARD_VIDEOS: AwardVideo[] = [
  {
    id: "senas-promo",
    filename: "senas-research.mov",
    videoUrl: "/assets/videos/projects/senas-promo.MP4",
    badge: "NATIONAL RESEARCH PRESENTATION",
    tagLabel: "SiKAPTala 2026",
    tagColor: "text-pink-300",
    title: "Human-Centered Usability Evaluation of SEÑAS",
    organization: "SiKAPTala 2026: National CS & IT Competition (DLSU-Dasmariñas)",
    year: "May 2026",
    description:
      "Empirical research presentation on real-time computer vision gesture recognition (90.12% accuracy) for Filipino Sign Language education before academic leaders.",
    speed: 0.08,
  },
  {
    id: "advocacy-video",
    filename: "sdg-advocacy.mov",
    videoUrl: "/assets/videos/achievements/sdg_advocacyvideo.mp4",
    badge: "1ST PLACE WINNER // SDG ADVOCACY",
    tagLabel: "1st Place Winner",
    tagColor: "text-amber-300",
    title: "Advocating for Change: SDG in Action!",
    organization: "College of Informatics and Computing Sciences",
    year: "2024",
    description:
      "First-place winning video production created to champion the United Nations Sustainable Development Goals. Blended creative storytelling, video editing, and human impact narrative.",
    speed: -0.05,
  },
  {
    id: "self-pitch",
    filename: "technopreneur-pitch.mov",
    videoUrl: "/assets/videos/achievements/self-pitch.mp4",
    badge: "TECHNOPRENEURSHIP SPOTLIGHT",
    tagLabel: "Tech Pitch 2025",
    tagColor: "text-sky-300",
    title: "Technopreneurship Self-Pitch",
    organization: "Technopreneurship Program",
    year: "2025",
    description:
      "Personal technical pitch articulating my journey in engineering, technical problem-solving capabilities, and vision for applied AI in accessibility and tech ventures.",
    speed: 0.09,
  },
];

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export const AchievementTheater: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mutedStates, setMutedStates] = useState<Record<string, boolean>>({
    "senas-promo": true,
    "advocacy-video": true,
    "self-pitch": true,
  });

  const activeAward = AWARD_VIDEOS.find((v) => v.id === hoveredId) ?? null;

  // Toggle audio on a specific video
  const toggleMute = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playUiClick(true);
    setMutedStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Parallax Scroll Effect on Floating Elements
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = Array.from(container.querySelectorAll<HTMLElement>("[data-speed]"));
    let raf = 0;

    const onScroll = () => {
      raf = 0;
      const vh = window.innerHeight;
      const r = container.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const d = r.top + r.height / 2 - vh / 2;

      for (const el of elements) {
        const speed = parseFloat(el.dataset.speed || "0");
        el.style.transform = `translate3d(0, ${(-d * speed).toFixed(1)}px, 0)`;
      }
    };

    const handleScroll = () => {
      if (!raf) raf = requestAnimationFrame(onScroll);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    onScroll();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <section
      id="achievements"
      className="relative scroll-mt-12 overflow-hidden bg-[#f8f8fa] pt-4 pb-8 sm:pt-6 sm:pb-10"
    >
      <style>{`
        .aw-pill {
          position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: .45rem;
          border-radius: 9999px; border: 1px solid rgba(148,163,184,.55); padding: .4rem .9rem;
          font-size: 13px; font-weight: 500; color: #334155; white-space: nowrap;
          background: linear-gradient(180deg, #fff, #f1f2f5);
          box-shadow: inset 0 1px 1px #fff, inset 0 -1px 2px rgba(15,23,42,.07), 0 4px 10px -6px rgba(15,23,42,.3);
        }
        .aw-chip { padding: .24rem .7rem; font-size: 11.5px; }

        /* Floating Mini QuickTime Window */
        .qt-win {
          background: linear-gradient(180deg, rgba(255,255,255,.95), rgba(245,245,248,.88));
          -webkit-backdrop-filter: blur(20px);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,.95);
          box-shadow: 0 0 0 1px rgba(15,23,42,.06), 0 16px 32px -12px rgba(76,57,120,.2);
          transition: transform .35s cubic-bezier(.16,1,.3,1), opacity .25s ease, box-shadow .35s ease;
          will-change: transform;
        }

        .qt-ctl {
          display: flex; align-items: center; justify-content: center; height: 24px; width: 24px;
          border-radius: 9999px; color: #fff; background: rgba(0,0,0,.5);
          -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,.3); transition: background .2s;
        }
        .qt-ctl:hover { background: rgba(0,0,0,.75); }

        /* Smooth Faded Subtitle Animation */
        @keyframes aw-fade {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .aw-fade {
          animation: aw-fade 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Ambient pastel blur blobs (dot pattern removed) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
        <div className="absolute left-[-4%] top-[15%] h-[340px] w-[340px] rounded-full bg-[#ffe3cc] opacity-35 blur-3xl" />
        <div className="absolute right-[-6%] top-[25%] h-[380px] w-[380px] rounded-full bg-[#ffc9dc] opacity-30 blur-3xl" />
        <div className="absolute left-[35%] bottom-[5%] h-[300px] w-[300px] rounded-full bg-[#d9ccff] opacity-30 blur-3xl" />
      </div>

      <div ref={containerRef} className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Compact Header Pill Only */}
        <div className="mb-5 flex items-center justify-center">
          <span className="aw-pill aw-chip shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-pink-400" />
            <span className="font-medium tracking-tight">Achievements &amp; Experiences</span>
          </span>
        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/*  CLEAN 3-COLUMN LANDSCAPE STAGE (NO OVERLAPPING VIDEOS)        */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <div className="relative select-none py-2">
          
          {/* Subtle Kaomojis & Beachball in background */}
          <div
            data-speed="0.1"
            className="pointer-events-none absolute left-[26%] -top-2 hidden sm:block text-slate-400 font-mono text-[11px] tracking-wider"
          >
            ^ ω ^
          </div>
          <div
            data-speed="-0.08"
            className="pointer-events-none absolute right-[26%] -top-2 hidden sm:block text-slate-400 font-mono text-[11px] tracking-wider"
          >
            ¯\_(ツ)_/¯
          </div>
          <div
            data-speed="0.08"
            className="pointer-events-none absolute left-[50%] -bottom-2 -translate-x-1/2 hidden md:block"
          >
            <SpinningBeachball />
          </div>

          {/* 3 Balanced Landscape Windows — Perfectly Spaced */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-7 items-center max-w-5xl mx-auto">
            {AWARD_VIDEOS.map((v, idx) => {
              const isHovered = hoveredId === v.id;
              const isOtherHovered = hoveredId !== null && !isHovered;

              // Subtle rotation offset for playfulness: left -1deg, center 0deg, right 1deg
              const tiltClass = idx === 0 ? "md:-rotate-1" : idx === 2 ? "md:rotate-1" : "";

              return (
                <div
                  key={v.id}
                  data-speed={v.speed}
                  onMouseEnter={() => {
                    playUiClick(true);
                    setHoveredId(v.id);
                  }}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`qt-win relative w-full max-w-[320px] mx-auto rounded-xl overflow-hidden cursor-pointer ${tiltClass} ${
                    isHovered
                      ? "z-30 scale-105 shadow-2xl ring-2 ring-pink-400 md:rotate-0"
                      : isOtherHovered
                      ? "z-10 opacity-55 blur-[0.4px] scale-98"
                      : "z-20 hover:scale-102 hover:md:rotate-0"
                  }`}
                >
                  {/* macOS Window Header */}
                  <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100/90 border-b border-slate-200/60">
                    <TrafficLights />
                    <span className="text-[9.5px] font-mono text-slate-500 truncate">
                      {v.filename}
                    </span>
                    <span className="text-[10px] text-slate-400">×</span>
                  </div>

                  {/* Video Canvas (16:10 Landscape) */}
                  <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden group">
                    <video
                      src={v.videoUrl}
                      autoPlay
                      loop
                      muted={mutedStates[v.id]}
                      playsInline
                      className="w-full h-full object-cover"
                    />

                    {/* Mute Button */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => toggleMute(v.id, e)}
                        className="qt-ctl"
                        title={mutedStates[v.id] ? "Unmute" : "Mute"}
                      >
                        {mutedStates[v.id] ? (
                          <VolumeX className="w-3 h-3" />
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {/* Accolade Tag */}
                    <div className="absolute top-2 left-2 pointer-events-none">
                      <span className={`px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md ${v.tagColor} text-[8.5px] font-bold`}>
                        {v.tagLabel}
                      </span>
                    </div>
                  </div>

                  {/* Window Bottom Bar */}
                  <div className="p-1.5 text-center bg-white/95 border-t border-slate-100">
                    <div className="text-[10px] font-mono font-semibold text-slate-700 truncate">
                      {v.filename}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/*  CLEAN FADED SUBTITLE (NO HEAVY CONTAINER BOX)                */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <div className="mt-5 min-h-[46px] flex items-center justify-center text-center px-4">
          {activeAward ? (
            /* Active Accolade Details with Soft Keyframe Fade */
            <div key={activeAward.id} className="aw-fade space-y-1 max-w-2xl mx-auto">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-100/90 text-pink-700 text-[10px] font-mono font-bold">
                  <Trophy className="w-3 h-3 text-pink-600" />
                  <span>{activeAward.badge}</span>
                </span>
                <span className="text-xs font-semibold text-slate-800">
                  {activeAward.title}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  ({activeAward.year})
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
                {activeAward.description}
              </p>
            </div>
          ) : (
            /* Default Idle Subtitle with Soft Keyframe Fade */
            <div key="idle" className="aw-fade flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span>Hover over any recording above to inspect the accolade</span>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
