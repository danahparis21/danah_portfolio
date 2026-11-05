"use client";

import React, { useState } from "react";
import { Maximize2, Minimize2, X } from "lucide-react";

interface MacWindowProps {
  id?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  defaultExpanded?: boolean;
}

export const MacWindow: React.FC<MacWindowProps> = ({
  id,
  title,
  subtitle,
  children,
  icon,
  className = "",
  defaultExpanded = true,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  return (
    <div
      id={id}
      className={`relative w-full rounded-2xl glass-panel shadow-mac-window border border-white/50 transition-all duration-300 overflow-hidden ${
        isMaximized ? "scale-[1.01]" : ""
      } ${className}`}
    >
      {/* macOS Window Header Bar */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-white/30 bg-white/40 backdrop-blur-md select-none">
        {/* Traffic Light Window Controls */}
        <div className="flex items-center gap-2">
          {/* Close (Red) */}
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] hover:opacity-80 transition flex items-center justify-center group"
            title="Minimize window"
          >
            <X className="w-2 h-2 text-[#7f1d1d] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Minimize (Yellow) */}
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] hover:opacity-80 transition flex items-center justify-center group"
            title="Minimize"
          >
            <Minimize2 className="w-2 h-2 text-[#78350f] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Maximize (Green) */}
          <button
            type="button"
            onClick={() => setIsMaximized(!isMaximized)}
            className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] hover:opacity-80 transition flex items-center justify-center group"
            title="Maximize"
          >
            <Maximize2 className="w-2 h-2 text-[#064e3b] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Window Title & Icon */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 tracking-tight">
          {icon && <span className="opacity-80">{icon}</span>}
          <span>{title}</span>
          {subtitle && (
            <span className="text-[11px] font-normal text-slate-400 hidden sm:inline">
              — {subtitle}
            </span>
          )}
        </div>

        {/* Right side balance spacer */}
        <div className="w-12 text-right">
          <span className="text-[10px] font-mono text-slate-400">DanahOS</span>
        </div>
      </div>

      {/* Window Body */}
      {!isMinimized && (
        <div className="p-4 sm:p-6 transition-all duration-300">
          {children}
        </div>
      )}
    </div>
  );
};

