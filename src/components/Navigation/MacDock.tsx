"use client";

import React from "react";
import { 
  User, 
  Sliders, 
  Briefcase, 
  Film, 
  Award, 
  ShoppingBag, 
  Flower2, 
  FileDown, 
  Mail
} from "lucide-react";
import { PORTFOLIO_DATA } from "@/data/portfolioData";

interface MacDockProps {
  onOpenSection: (sectionId: string) => void;
}

export const MacDock: React.FC<MacDockProps> = ({ onOpenSection }) => {
  const dockItems = [
    { id: "hero", label: "3D ID Badge", icon: <User className="w-5 h-5 text-indigo-600" />, bg: "bg-indigo-50" },
    { id: "skills", label: "System Skills", icon: <Sliders className="w-5 h-5 text-blue-600" />, bg: "bg-blue-50" },
    { id: "projects", label: "Finder Projects", icon: <Briefcase className="w-5 h-5 text-pink-600" />, bg: "bg-pink-50" },
    { id: "achievements", label: "QuickTime Theater", icon: <Film className="w-5 h-5 text-amber-600" />, bg: "bg-amber-50" },
    { id: "certificates", label: "Certificates Preview", icon: <Award className="w-5 h-5 text-cyan-600" />, bg: "bg-cyan-50" },
    { id: "bakery", label: "Butter Days Bakery", icon: <span className="text-xl">🧁</span>, bg: "bg-rose-50" },
    { id: "garden", label: "Danah's Garden", icon: <span className="text-xl">🌸</span>, bg: "bg-emerald-50" },
  ];

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 select-none">
      <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-2xl glass-panel shadow-2xl border border-white/60 bg-white/75 backdrop-blur-2xl">
        {/* Navigation Items */}
        {dockItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onOpenSection(item.id)}
            className="group relative p-2.5 rounded-xl hover:bg-white/90 hover:scale-125 transition-all duration-200 flex flex-col items-center shadow-xs"
            title={item.label}
          >
            <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center shadow-inner`}>
              {item.icon}
            </div>

            {/* Tooltip Pill */}
            <span className="absolute -top-9 px-2.5 py-1 rounded-md bg-slate-900/90 text-white text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
              {item.label}
            </span>

            {/* Small active indicator dot */}
            <span className="w-1 h-1 rounded-full bg-slate-400 mt-1 opacity-0 group-hover:opacity-100" />
          </button>
        ))}

        {/* Vertical Divider */}
        <div className="w-px h-8 bg-slate-300/80 mx-1" />

        {/* Resume Download Action */}
        <a
          href={PORTFOLIO_DATA.profile.resumePath}
          download="MicaDanahParis_Resume.pdf"
          className="group relative p-2.5 rounded-xl hover:bg-white/90 hover:scale-125 transition-all duration-200 flex flex-col items-center shadow-xs"
          title="Download Official Resume PDF"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
            <FileDown className="w-5 h-5" />
          </div>

          <span className="absolute -top-9 px-2.5 py-1 rounded-md bg-slate-900/90 text-white text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
            Download Resume (PDF)
          </span>
          <span className="w-1 h-1 rounded-full bg-pink-500 mt-1" />
        </a>

        {/* Email Contact Action */}
        <a
          href={`mailto:${PORTFOLIO_DATA.profile.email}`}
          className="group relative p-2.5 rounded-xl hover:bg-white/90 hover:scale-125 transition-all duration-200 flex flex-col items-center shadow-xs"
          title="Send Direct Email to Danah"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 flex items-center justify-center shadow-inner">
            <Mail className="w-5 h-5" />
          </div>

          <span className="absolute -top-9 px-2.5 py-1 rounded-md bg-slate-900/90 text-white text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
            Email Danah
          </span>
        </a>
      </div>
    </div>
  );
};
