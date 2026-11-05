"use client";

/**
 * CertificateCarousel — macOS-Inspired Folder Deck Window
 * Unified with the Hero, About, and Projects sections:
 * - Frosted-glass macOS window chrome (traffic lights, toolbar, segmented controls)
 * - Subtle desktop dotted pattern and ambient color blur blobs
 * - 5 vertical folder panels sitting side by side
 * - Staggered index tabs along each folder with vertical white pill labels
 * - Luxurious shades of pink, rose gold, blush, and satin cream
 * - Smooth hover (holding hover for 240ms or clicking expands the folder smoothly)
 * - Expanded view reveals the full certificate document + concise key details
 * - Zero emojis — uses Lucide icons only.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ExternalLink,
  Download,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Building2,
  FileText,
} from "lucide-react";
import { playUiClick, playBookSlide } from "@/utils/sound";

interface CertificateItem {
  id: string;
  tabLabel: string;
  tabPositionPercent: number; // Staggered vertical position along the folder edge
  folderNumber: string;
  title: string;
  issuer: string;
  date: string;
  pdfPath: string;
  summary: string;
  skills: string[];
  theme: {
    bgGradient: string;
    border: string;
    pillText: string;
    accentColor: string;
    coverBg: string;
  };
}

const CERTIFICATES: CertificateItem[] = [
  {
    id: "cert-data-analytics",
    tabLabel: "data analytics",
    tabPositionPercent: 10,
    folderNumber: "01",
    title: "IT Specialist – Data Analytics",
    issuer: "Certiport (Pearson VUE)",
    date: "May 2026",
    pdfPath: "/assets/images/certificates/Data Analytics (1).pdf",
    summary: "Exploratory data analysis, statistical modeling, data cleaning, and Python analytics pipelines.",
    skills: ["Data Modeling", "Python Analytics", "Statistical Analysis", "Data Visualization"],
    theme: {
      bgGradient: "linear-gradient(145deg, #fff1f5 0%, #fdf2f8 45%, #fce7f3 100%)",
      border: "rgba(244, 114, 182, 0.4)",
      pillText: "#9d174d",
      accentColor: "#be185d",
      coverBg: "#fce7f3",
    },
  },
  {
    id: "cert-sp",
    tabLabel: "social innovation",
    tabPositionPercent: 28,
    folderNumber: "02",
    title: "Learning Express Programme",
    issuer: "Singapore Polytechnic",
    date: "Apr 2026",
    pdfPath: "/assets/images/certificates/Mica_Danah_P__Paris_6a1badc628eafe0554ca4a57.pdf",
    summary: "International design thinking, user empathy, rapid field prototyping, and cross-cultural social innovation.",
    skills: ["Design Thinking", "Social Innovation", "Cross-Cultural Co-Creation", "User Empathy"],
    theme: {
      bgGradient: "linear-gradient(145deg, #fff0f3 0%, #fdf4f5 45%, #ffe4e6 100%)",
      border: "rgba(251, 113, 133, 0.4)",
      pillText: "#9f1239",
      accentColor: "#e11d48",
      coverBg: "#ffe4e6",
    },
  },
  {
    id: "cert-device-mgmt",
    tabLabel: "device management",
    tabPositionPercent: 46,
    folderNumber: "03",
    title: "Device Configuration & Management",
    issuer: "Certiport (Pearson VUE)",
    date: "Dec 2025",
    pdfPath: "/assets/images/certificates/Device Configuration and Management.pdf",
    summary: "Operating system deployment, cloud governance, device lifecycle management, and endpoint security.",
    skills: ["OS Provisioning", "Cloud Architecture", "Device Governance", "Network Security"],
    theme: {
      bgGradient: "linear-gradient(145deg, #fff7ed 0%, #fdf2f8 45%, #ffedd5 100%)",
      border: "rgba(251, 146, 60, 0.4)",
      pillText: "#9a3412",
      accentColor: "#ea580c",
      coverBg: "#fed7aa",
    },
  },
  {
    id: "cert-databases",
    tabLabel: "relational databases",
    tabPositionPercent: 64,
    folderNumber: "04",
    title: "IT Specialist – Databases",
    issuer: "Certiport (Pearson VUE)",
    date: "May 2025",
    pdfPath: "/assets/images/certificates/Databases.pdf",
    summary: "Relational database schema architecture, SQL queries, normalization, transaction integrity, and DBMS indexing.",
    skills: ["Schema Architecture", "SQL Query Optimization", "Normalization", "MySQL & DBMS"],
    theme: {
      bgGradient: "linear-gradient(145deg, #faf5ff 0%, #fdf2f8 45%, #f5d0fe 100%)",
      border: "rgba(192, 132, 252, 0.4)",
      pillText: "#7e22ce",
      accentColor: "#9333ea",
      coverBg: "#f3e8ff",
    },
  },
  {
    id: "cert-excel",
    tabLabel: "advanced excel",
    tabPositionPercent: 82,
    folderNumber: "05",
    title: "Microsoft Office Specialist – Excel",
    issuer: "Certiport (Microsoft Certified)",
    date: "Dec 2023",
    pdfPath: "/assets/images/certificates/Office Excel 2016.pdf",
    summary: "Advanced dynamic formulas, multi-dimensional PivotTables, statistical reporting, and workflow automation.",
    skills: ["Advanced Formulas", "Pivot Tables & Charts", "Data Validation", "Financial Modeling"],
    theme: {
      bgGradient: "linear-gradient(145deg, #f0fdf4 0%, #fdf2f8 45%, #dcfce7 100%)",
      border: "rgba(74, 222, 128, 0.4)",
      pillText: "#166534",
      accentColor: "#15803d",
      coverBg: "#dcfce7",
    },
  },
];

const TrafficLights: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center gap-2 ${className}`} aria-hidden>
    <span className="h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-black/10" />
    <span className="h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-black/10" />
    <span className="h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-black/10" />
  </div>
);

export const CertificateCarousel: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number>(0);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeCert = CERTIFICATES[openIdx] ?? CERTIFICATES[0];

  const handleOpen = useCallback((idx: number) => {
    if (idx < 0 || idx >= CERTIFICATES.length) return;
    playBookSlide(true);
    setOpenIdx(idx);
  }, []);

  const handleMouseEnter = (idx: number) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      handleOpen(idx);
    }, 240);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  // Keyboard navigation (Left / Right arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handleOpen(openIdx - 1);
      if (e.key === "ArrowRight") handleOpen(openIdx + 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openIdx, handleOpen]);

  useEffect(() => {
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, []);

  const headline = ["Verified", "credentials."];

  return (
    <section
      id="certificates"
      className="relative scroll-mt-12 overflow-hidden bg-[#f8f8fa] pt-16 pb-6 sm:pt-20 sm:pb-8"
    >
      <style>{`
        /* frosted-glass macOS Window styling matching Projects */
        .cert-win {
          background: linear-gradient(180deg, rgba(255,255,255,.75), rgba(255,255,255,.5));
          -webkit-backdrop-filter: blur(30px) saturate(1.5);
          backdrop-filter: blur(30px) saturate(1.5);
          border: 1px solid rgba(255,255,255,.88);
          box-shadow: 0 0 0 1px rgba(15,23,42,.06), inset 0 1px 0 rgba(255,255,255,.95), 0 32px 64px -24px rgba(76,57,120,.3);
        }
        .cert-nav {
          background: linear-gradient(180deg, rgba(255,255,255,.9), rgba(255,255,255,.55));
          border: 1px solid rgba(255,255,255,.9);
          box-shadow: 0 0 0 1px rgba(15,23,42,.06), 0 6px 14px -8px rgba(15,23,42,.3);
        }
        .cert-pill {
          position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: .45rem;
          border-radius: 9999px; border: 1px solid rgba(148,163,184,.55); padding: .5rem 1rem;
          font-size: 13.5px; font-weight: 500; color: #334155; white-space: nowrap;
          background: linear-gradient(180deg, #fff, #f1f2f5);
          box-shadow: inset 0 1px 1px #fff, inset 0 -1px 2px rgba(15,23,42,.07), 0 4px 10px -6px rgba(15,23,42,.3);
          transition: transform .15s, filter .15s;
        }
        .cert-chip { padding: .28rem .7rem; font-size: 12px; }
        .cert-grad {
          background: linear-gradient(135deg, #0b0b10 10%, #4a1236 50%, #f0568f 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
      `}</style>

      {/* Ambient glassmorphic color blobs (dot pattern removed) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
        <div className="absolute left-[-5%] top-[15%] h-[380px] w-[380px] rounded-full bg-[#ffc9dc] opacity-40 blur-3xl" />
        <div className="absolute right-[-6%] top-[40%] h-[420px] w-[420px] rounded-full bg-[#d9ccff] opacity-40 blur-3xl" />
        <div className="absolute left-[12%] bottom-[10%] h-[360px] w-[360px] rounded-full bg-[#ffe3cc] opacity-35 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="mb-10 space-y-3">
          <span className="cert-pill cert-chip">
            <span className="h-2 w-2 rounded-full bg-pink-400" />
            <span>Official Credentials</span>
          </span>
          <h2 className="text-4xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight text-slate-900">
            {headline.map((w, i) => (
              <span key={w} className={i === headline.length - 1 ? "cert-grad" : ""}>
                {w}{" "}
              </span>
            ))}
          </h2>
          <p className="max-w-md text-base sm:text-lg text-slate-500">
            Hover over any folder tab or click to preview the verified certificate dossier.
          </p>
        </div>

        {/* ── macOS-Inspired Frosted Glass Window ── */}
        <div className="cert-win relative rounded-[28px] sm:rounded-[32px] overflow-hidden p-4 sm:p-6 shadow-2xl">
          
          {/* macOS Window Top Toolbar */}
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-200/60">
            <TrafficLights />

            {/* Back / Next Segmented Control */}
            <div className="cert-nav flex items-center rounded-full ml-1">
              <button
                type="button"
                aria-label="Previous folder"
                disabled={openIdx === 0}
                onClick={() => handleOpen(openIdx - 1)}
                className="px-3 py-1.5 text-slate-700 transition disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-950"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="h-4 w-px bg-slate-300/70" />
              <button
                type="button"
                aria-label="Next folder"
                disabled={openIdx === CERTIFICATES.length - 1}
                onClick={() => handleOpen(openIdx + 1)}
                className="px-3 py-1.5 text-slate-700 transition disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-950"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <span className="text-[15px] sm:text-[17px] font-semibold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-pink-500" />
              <span>Certificates — Quick Look</span>
            </span>

            <span className="ml-auto text-xs font-mono text-slate-400">
              {openIdx + 1} of {CERTIFICATES.length}
            </span>
          </div>

          {/* ── Mobile Horizontal Folder Tab Switcher (Small Screens) ── */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-2 md:hidden">
            {CERTIFICATES.map((cert, idx) => (
              <button
                key={cert.id}
                type="button"
                onClick={() => handleOpen(idx)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  openIdx === idx
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:bg-white/40"
                }`}
              >
                <span>{cert.tabLabel}</span>
              </button>
            ))}
          </div>

          {/* ── THE FOLDER ACCORDION DECK ── */}
          <div
            className="flex flex-row items-stretch w-full gap-2 sm:gap-3 rounded-[24px] p-2 sm:p-3 bg-white/40 border border-white/70 shadow-inner overflow-hidden"
            style={{ minHeight: 600 }}
          >
            {CERTIFICATES.map((cert, idx) => {
              const isOpen = openIdx === idx;

              return (
                <div
                  key={cert.id}
                  onClick={() => handleOpen(idx)}
                  onMouseEnter={() => handleMouseEnter(idx)}
                  onMouseLeave={handleMouseLeave}
                  className={`relative flex flex-col cursor-pointer overflow-hidden rounded-[22px] sm:rounded-[26px] border transition-all ${
                    isOpen
                      ? "shadow-2xl shadow-pink-500/15"
                      : "hover:-translate-y-1 shadow-md hover:shadow-xl hover:shadow-pink-500/10"
                  }`}
                  style={{
                    /* Ultra-smooth cubic bezier accordion animation */
                    flex: isOpen ? "4.2 1 0%" : "0.34 1 0%",
                    transition: "flex 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s ease, box-shadow 0.4s ease",
                    background: cert.theme.bgGradient,
                    borderColor: isOpen ? cert.theme.border : "rgba(255, 255, 255, 0.75)",
                    minWidth: 50,
                  }}
                >
                  {/* Subtle Fold Crease Line */}
                  <div className="absolute inset-1.5 rounded-[18px] border border-white/60 pointer-events-none" />

                  {/* ══════════════════════════════════════════════════ */}
                  {/* 1. COLLAPSED FOLDER SPINE VIEW                      */}
                  {/* ══════════════════════════════════════════════════ */}
                  <div
                    className={`absolute inset-0 flex flex-col items-center justify-between p-3 sm:p-4 transition-all duration-300 pointer-events-none ${
                      isOpen ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
                    }`}
                  >
                    {/* Top: Folder Number Badge */}
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 shadow-2xs border border-pink-100 flex items-center justify-center text-[10px] sm:text-[11px] font-mono font-bold text-slate-700">
                      {cert.folderNumber}
                    </div>

                    {/* Staggered Vertical Tab with White Pill */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
                      style={{ top: `${cert.tabPositionPercent}%` }}
                    >
                      <div
                        className="flex items-center gap-1.5 px-2 py-3 rounded-full bg-white/95 shadow-md border border-pink-200/80 transition-transform duration-300 hover:scale-105"
                        style={{
                          writingMode: "vertical-rl",
                          transform: "rotate(180deg)",
                        }}
                      >
                        <span
                          className="text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap"
                          style={{ color: cert.theme.pillText }}
                        >
                          {cert.tabLabel}
                        </span>
                      </div>
                    </div>

                    {/* Bottom: Date Pill */}
                    <div
                      className="px-2 py-1.5 rounded-full bg-white/75 border border-white text-[9px] font-mono font-bold text-slate-500 whitespace-nowrap"
                      style={{
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)",
                      }}
                    >
                      {cert.date}
                    </div>
                  </div>

                  {/* ══════════════════════════════════════════════════ */}
                  {/* 2. EXPANDED FOLDER DOSSIER VIEW                     */}
                  {/* ══════════════════════════════════════════════════ */}
                  <div
                    className={`flex flex-col h-full w-full p-4 sm:p-6 transition-all duration-500 ${
                      isOpen
                        ? "opacity-100 scale-100 pointer-events-auto"
                        : "opacity-0 scale-95 pointer-events-none"
                    }`}
                  >
                    {/* Folder Top Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-pink-200/50 gap-2.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/90 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold shadow-2xs">
                            <CheckCircle2 className="w-3 h-3" />
                            Officially Verified
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            FOLDER #{cert.folderNumber} • {cert.date}
                          </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                          {cert.title}
                        </h3>

                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                          <Building2 className="w-3.5 h-3.5 text-pink-500" />
                          <span>{cert.issuer}</span>
                        </div>
                      </div>

                      {/* Actions: Download + Open PDF */}
                      <div className="flex items-center gap-2">
                        <a
                          href={cert.pdfPath}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            e.stopPropagation();
                            playUiClick(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-pink-50 border border-pink-200/80 text-slate-700 hover:text-pink-600 text-xs font-bold transition shadow-2xs flex items-center gap-1.5 active:scale-95"
                          title="Open full PDF in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open PDF</span>
                        </a>

                        <a
                          href={cert.pdfPath}
                          download
                          onClick={(e) => {
                            e.stopPropagation();
                            playUiClick(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition shadow-md shadow-pink-600/20 flex items-center gap-1.5 hover:scale-[1.02] active:scale-95"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </div>
                    </div>

                    {/* Main Content Area: Framed Document Display */}
                    <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-pink-200/80 shadow-md p-2.5 sm:p-3 overflow-hidden relative">
                      
                      {/* Corner Mounts */}
                      <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-pink-300 pointer-events-none z-10" />
                      <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-pink-300 pointer-events-none z-10" />
                      <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-pink-300 pointer-events-none z-10" />
                      <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-pink-300 pointer-events-none z-10" />

                      {/* Clean Responsive PDF Viewer */}
                      <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-50">
                        <iframe
                          src={`${cert.pdfPath}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                          className="w-full h-full border-none"
                          title={cert.title}
                        />
                      </div>
                    </div>

                    {/* Bottom Details Footer */}
                    <div className="pt-3 mt-3 border-t border-pink-200/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <p className="text-xs text-slate-600 line-clamp-1 max-w-lg">
                        {cert.summary}
                      </p>
                      
                      {/* Competency Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {cert.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-0.5 rounded-lg bg-white/80 border border-pink-200/70 text-[10px] font-medium text-slate-700 shadow-2xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Dot Indicators */}
          <div className="flex items-center justify-between mt-4 px-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">
                Active folder:
              </span>
              <div className="flex items-center gap-1.5">
                {CERTIFICATES.map((cert, idx) => (
                  <button
                    key={cert.id}
                    onClick={() => handleOpen(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      openIdx === idx
                        ? "w-8 bg-pink-600"
                        : "w-2 bg-pink-200 hover:bg-pink-300"
                    }`}
                    title={cert.title}
                  />
                ))}
              </div>
            </div>

            <p className="text-[11px] font-mono text-slate-400 hidden sm:block">
              Hover over any tab or use arrow keys ← → to browse
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
