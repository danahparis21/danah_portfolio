"use client";

import React, { useState, useEffect } from "react";
import { 
  Wifi, 
  Battery, 
  Volume2, 
  VolumeX, 
  Briefcase, 
  FileText, 
  Layers,
  Sliders,
  Sparkles,
  Phone,
  Flower2,
  Zap
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
  soundEnabled,
  onToggleSound,
  onOpenSection,
  onToggleControlCenter,
}) => {
  const [time, setTime] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");

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
      setDateStr(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-9 px-4 flex items-center justify-between text-xs select-none backdrop-blur-xl bg-white/80 border-b border-slate-200/80 text-slate-800 shadow-xs transition-all">
      {/* Left side: Apple icon & quick navigation */}
      <div className="flex items-center gap-4 font-medium">
        <button 
          onClick={() => onOpenSection("hero")}
          className="hover:opacity-70 transition flex items-center gap-1.5 font-bold text-slate-900"
          title="Danah OS Home"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 170 170">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.9-11.96-14.59-6.49-10.08-11.33-21.78-14.51-35.09-3.19-13.32-4.78-25.5-4.78-36.56 0-14.75 3.8-27.12 11.41-37.1 7.6-9.97 17.1-15.08 28.48-15.32 4.13 0 9.06 1.15 14.81 3.44 5.74 2.29 9.4 3.49 10.97 3.6 2.05-.22 5.92-1.47 11.62-3.75 5.71-2.28 10.42-3.35 14.14-3.21 10.43.55 19.12 4.54 26.06 11.98 6.94 7.44 11.09 16.58 12.46 27.42-10.74 6.49-16 15.42-15.79 26.79.22 9.09 3.73 16.85 10.53 23.27 6.8 6.42 14.65 10.02 23.55 10.8-2.61 8.27-5.99 16.48-10.14 24.63zM119.22 33.15c0-6.73 2.45-13.04 7.36-17.93 4.91-4.9 10.92-7.85 18.03-8.86.33 1.52.5 2.9.5 4.13 0 6.6-2.5 12.83-7.5 17.68-5.01 4.86-11.13 7.7-18.39 8.52V33.15z" />
          </svg>
          <span className="font-semibold tracking-tight">Danah OS</span>
        </button>

        <span className="text-slate-300 font-light">|</span>

        <button
          onClick={() => onOpenSection("projects")}
          className="hover:text-blue-600 transition hidden sm:inline-flex items-center gap-1 text-slate-700 font-medium"
        >
          <Briefcase className="w-3.5 h-3.5 text-blue-500" />
          <span>Projects</span>
        </button>

        <button
          onClick={() => onOpenSection("certificates")}
          className="hover:text-purple-600 transition hidden sm:inline-flex items-center gap-1 text-slate-700 font-medium"
        >
          <FileText className="w-3.5 h-3.5 text-purple-500" />
          <span>Certificates</span>
        </button>

        <button
          onClick={() => onOpenSection("achievements")}
          className="hover:text-amber-600 transition hidden md:inline-flex items-center gap-1 text-slate-700 font-medium"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Awards &amp; Media</span>
        </button>

        <button
          onClick={() => onOpenSection("contact")}
          className="hover:text-rose-600 transition hidden md:inline-flex items-center gap-1.5 text-slate-700 font-medium"
        >
          <Phone className="w-3.5 h-3.5 text-rose-500" />
          <span>Contact</span>
        </button>

        <button
          onClick={() => onOpenSection("garden")}
          className="hover:text-emerald-600 transition hidden lg:inline-flex items-center gap-1.5 text-slate-700 font-medium"
        >
          <Flower2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secret Garden</span>
        </button>
      </div>

      {/* Right side: Control Center, Recruiter Mode, Battery, Clock */}
      <div className="flex items-center gap-2.5">
        {/* Recruiter Mode Switch */}
        <button
          onClick={onToggleRecruiterMode}
          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
            recruiterMode
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
          title="Toggle ATS / Executive Recruiter Overview"
        >
          {recruiterMode ? <Layers className="w-3 h-3" /> : <Zap className="w-3 h-3 text-amber-500 fill-amber-500/20" />}
          <span>{recruiterMode ? "Exit Recruiter View" : "Recruiter View"}</span>
        </button>

        {/* Apple Control Center Toggle Button (Image 2!) */}
        <button
          onClick={onToggleControlCenter}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition flex items-center gap-1 font-semibold"
          title="Open macOS Control Center"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="text-[11px] hidden sm:inline">Controls</span>
        </button>

        {/* Battery */}
        <span className="flex items-center gap-1 text-slate-600 pl-1">
          <span className="text-[10px] font-mono hidden sm:inline">100%</span>
          <Battery className="w-3.5 h-3.5 rotate-90 text-emerald-600 fill-emerald-600/30" />
        </span>

        {/* Clock */}
        <div className="flex items-center gap-1 font-mono text-[11px] text-slate-800 pl-1">
          <span>{time || "10:30 AM"}</span>
        </div>
      </div>
    </header>
  );
};
