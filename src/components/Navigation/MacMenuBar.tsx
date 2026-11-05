"use client";

import React, { useState, useEffect } from "react";
import { 
  Wifi, 
  FileText, 
  Sliders 
} from "lucide-react";

interface MacMenuBarProps {
  recruiterMode: boolean;
  onToggleRecruiterMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSection: (sectionId: string) => void;
  onToggleControlCenter: () => void;
}

export const MacMenuBar: React.FC<MacMenuBarProps> = ({
  recruiterMode,
  onToggleRecruiterMode,
  onOpenSection,
  onToggleControlCenter,
}) => {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-9 px-4 flex items-center justify-between text-xs select-none backdrop-blur-md bg-white/20 border-b border-black/[0.05] text-slate-800 transition-all">
      {/* Left side: Danah OS brand & nav tabs (hidden on mobile, progressive reveal) */}
      <div className="flex items-center gap-4 lg:gap-5 font-medium text-slate-700">
        <button 
          onClick={() => onOpenSection("hero")}
          className="hover:opacity-75 transition font-bold text-slate-900 tracking-tight text-[13px] shrink-0"
          title="Danah OS Home"
        >
          Danah OS
        </button>

        {/* Separator — only shown when tabs are visible */}
        <span className="text-slate-300 font-light select-none hidden lg:inline -ml-1 mr-0.5">|</span>

        {/* Nav tabs: fully hidden on mobile & tablet — users navigate via Mac Dock */}
        <button
          onClick={() => onOpenSection("about")}
          className="hover:text-black transition hidden lg:inline-block text-slate-700 font-medium tracking-tight"
        >
          About Me
        </button>

        <button
          onClick={() => onOpenSection("tech-stack")}
          className="hover:text-black transition hidden lg:inline-block text-slate-700 font-medium tracking-tight"
        >
          Tech Stack
        </button>

        <button
          onClick={() => onOpenSection("projects")}
          className="hover:text-black transition hidden lg:inline-block text-slate-700 font-medium tracking-tight"
        >
          Projects
        </button>

        <button
          onClick={() => onOpenSection("certificates")}
          className="hover:text-black transition hidden lg:inline-block text-slate-700 font-medium tracking-tight"
        >
          Certificates
        </button>

        <button
          onClick={() => onOpenSection("achievements")}
          className="hover:text-black transition hidden xl:inline-block text-slate-700 font-medium tracking-tight"
        >
          Achievements
        </button>

        <button
          onClick={() => onOpenSection("contact")}
          className="hover:text-black transition hidden xl:inline-block text-slate-700 font-medium tracking-tight"
        >
          Contact
        </button>

        <button
          onClick={() => onOpenSection("garden")}
          className="hover:text-black transition hidden xl:inline-block text-slate-700 font-medium tracking-tight"
        >
          Secret Garden
        </button>
      </div>

      {/* Right side: One Page View, Controls, Wifi, Horizontal Battery, Clock */}
      <div className="flex items-center gap-2.5">
        {/* One Page View Toggle Button (paper/page icon) */}
        <button
          onClick={onToggleRecruiterMode}
          className={`px-2 sm:px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 transition-all ${
            recruiterMode
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white/40 hover:bg-white/70 backdrop-blur-xs text-slate-700 border border-slate-200/60 shadow-2xs"
          }`}
          title="Toggle Executive One Page View"
        >
          <FileText className={`w-3 h-3 ${recruiterMode ? "text-white" : "text-slate-600"}`} />
          <span className="hidden sm:inline">{recruiterMode ? "Exit One Page View" : "One Page View"}</span>
        </button>

        {/* Apple Control Center Button */}
        <button
          onClick={onToggleControlCenter}
          className="p-1 rounded-md hover:bg-white/40 text-slate-700 transition flex items-center gap-1 font-medium"
          title="Open macOS Control Center"
        >
          <Sliders className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-[11px] hidden sm:inline">Controls</span>
        </button>

        {/* Wi-Fi Icon (macOS system status) */}
        <span className="hidden sm:inline-flex items-center text-slate-600">
          <Wifi className="w-3.5 h-3.5" />
        </span>

        {/* Horizontal Battery Icon (Matching heyclicky & macOS) */}
        <span className="flex items-center gap-1.5 text-slate-700" title="Battery: 100%">
          <span className="text-[10px] font-mono hidden sm:inline text-slate-600">100%</span>
          <svg
            className="w-5 h-2.5 text-slate-700"
            viewBox="0 0 22 11"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            {/* Battery Body */}
            <rect x="0.6" y="0.6" width="17.8" height="9.8" rx="2.4" />
            {/* Positive Terminal Nipple on the right */}
            <path d="M20.2 3.8v3.4" strokeLinecap="round" strokeWidth="1.6" />
            {/* Full Battery Level Fill */}
            <rect x="2.2" y="2.2" width="14.6" height="6.6" rx="1.2" fill="currentColor" stroke="none" />
          </svg>
        </span>

        {/* Clock */}
        <div className="flex items-center gap-1 font-mono text-[11px] text-slate-800 pl-0.5">
          <span>{time || "8:26 PM"}</span>
        </div>
      </div>
    </header>
  );
};
