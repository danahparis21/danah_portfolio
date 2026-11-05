"use client";

import React, { useId } from "react";
import { Lanyard3DBadge } from "@/components/Hero/Lanyard3DBadge";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { FileDown, ArrowDown, MapPin } from "lucide-react";
import { playUiClick } from "@/utils/sound";

interface HeroStationeryProps {
  onResumeClick?: () => void;
  onScrollDown?: () => void;
  /** Called with the folder id when a folder is clicked. Falls back to scrolling to #id. */
  onFolderClick?: (id: string) => void;
}

/* Folder ids match your top-bar sections. `pos` places it on desktop,
   `rot` is its resting tilt (straightens + enlarges on hover). */
const FOLDERS = [
  { id: "certificates", label: "Certificates", pos: "left-[47%] top-[12%]", rot: "-rotate-6" },
  { id: "projects", label: "Projects", pos: "left-[61%] top-[9%]", rot: "rotate-3" },
  { id: "awards", label: "Awards & Media", pos: "right-[8%] top-[56%]", rot: "rotate-6" },
  { id: "bakery", label: "Bakery & Connect", pos: "left-[50%] bottom-[3%]", rot: "rotate-3" },
  { id: "garden", label: "Secret Garden", pos: "left-[64%] bottom-[7%]", rot: "-rotate-3" },
] as const;

/* Pink macOS-style folder (inline SVG, no asset needed) */
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

const Folder: React.FC<{
  label: string;
  rot: string;
  onOpen: () => void;
}> = ({ label, rot, onOpen }) => (
  <button
    type="button"
    onClick={onOpen}
    aria-label={`Open ${label}`}
    className="group flex w-32 flex-col items-center gap-1.5 outline-none"
  >
    <span
      className={`block w-[84px] ${rot} origin-bottom transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:-translate-y-1 group-hover:rotate-0 group-hover:scale-[1.4] group-focus-visible:rotate-0 group-focus-visible:scale-[1.4]`}
    >
      <FolderIcon />
    </span>
    <span className="mt-1 whitespace-nowrap rounded-md px-2 py-0.5 text-center text-[12px] font-medium leading-tight text-slate-600 transition-colors group-hover:bg-blue-500 group-hover:text-white group-focus-visible:bg-blue-500 group-focus-visible:text-white">
      {label}
    </span>
  </button>
);

export const HeroStationery: React.FC<HeroStationeryProps> = ({
  onScrollDown,
  onFolderClick,
}) => {
  const openFolder = (id: string) => {
    playUiClick(true);
    if (onFolderClick) return onFolderClick(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative overflow-hidden bg-[#f8f8fa]">
      <style>{`
        @keyframes hs-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
        .hs-float { animation: hs-float 6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .hs-float { animation: none; } }
      `}</style>

      {/* Dotted desktop pattern + a very soft blush behind the badge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 24% 42%, rgba(255,214,230,0.24), transparent 50%), radial-gradient(rgba(15,23,42,0.15) 1.3px, transparent 1.5px)",
          backgroundSize: "100% 100%, 34px 34px",
          WebkitMaskImage:
            "linear-gradient(to bottom, #000 78%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, #000 78%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-12 sm:pt-16">
        {/* Folders around the text (large screens) */}
        <div className="pointer-events-none absolute inset-0 z-20 hidden lg:block">
          {FOLDERS.map((f, i) => (
            <div key={f.id} className={`absolute ${f.pos} pointer-events-auto`}>
              <div
                className="hs-float"
                style={{ animationDelay: `${i * -1.1}s` }}
              >
                <Folder
                  label={f.label}
                  rot={f.rot}
                  onOpen={() => openFolder(f.id)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          {/* Left: swinging 3D ID badge */}
          <div className="relative z-10 flex items-center justify-center lg:col-span-5">
            <Lanyard3DBadge />
          </div>

          {/* Right: name + CTA */}
          <div className="relative z-10 space-y-6 pl-0 text-left lg:col-span-7 lg:pl-4">
            <div className="space-y-3">
              <h1 className="bg-gradient-to-br from-[#0b0b10] from-30% via-[#4a1236] to-[#f0568f] bg-clip-text text-6xl font-extrabold leading-[1.02] tracking-tight text-transparent sm:text-7xl lg:text-[6.5rem]">
                Mica Danah <br />
                Paris
              </h1>
              <p className="text-base font-semibold text-slate-700 sm:text-lg">
                {PORTFOLIO_DATA.profile.tagline}
              </p>
              <p className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur">
                <MapPin className="h-3.5 w-3.5 text-pink-500" />
                Based in the Philippines
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={PORTFOLIO_DATA.profile.resumePath}
                download="MicaDanahParis_Resume.pdf"
                onClick={() => playUiClick(true)}
                className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-[#e0628f]/70 px-6 py-3 text-[15px] font-medium text-[#4a1230] transition active:translate-y-px active:brightness-95"
                style={{
                  background:
                    "linear-gradient(180deg,#ffc9db 0%,#ff9bbd 48%,#fb7fa9 52%,#ffa8c6 100%)",
                  boxShadow:
                    "inset 0 1px 1px rgba(255,255,255,.9), inset 0 -1px 2px rgba(190,40,100,.25), 0 8px 16px -6px rgba(244,114,182,.6)",
                  textShadow: "0 1px 0 rgba(255,255,255,.55)",
                }}
              >
                <span className="pointer-events-none absolute inset-x-3 top-[3px] h-[44%] rounded-full bg-gradient-to-b from-white/75 to-white/5" />
                <FileDown className="relative h-4 w-4" />
                <span className="relative">Download Resume</span>
              </a>

              {onScrollDown && (
                <button
                  onClick={onScrollDown}
                  className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-slate-300 px-5 py-3 text-[15px] font-medium text-slate-800 transition active:translate-y-px active:brightness-95"
                  style={{
                    background: "linear-gradient(180deg,#ffffff 0%,#f1f2f5 100%)",
                    boxShadow:
                      "inset 0 1px 1px rgba(255,255,255,1), inset 0 -1px 2px rgba(15,23,42,.08), 0 8px 16px -8px rgba(15,23,42,.25)",
                  }}
                >
                  <span>Read Story</span>
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Folders for small screens */}
        <div className="relative z-10 mt-12 flex flex-wrap justify-center gap-x-4 gap-y-8 lg:hidden">
          {FOLDERS.map((f) => (
            <Folder
              key={f.id}
              label={f.label}
              rot={f.rot}
              onOpen={() => openFolder(f.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};