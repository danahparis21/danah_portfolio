"use client";

import React, { useState, useEffect } from "react";
import {
  Wifi,
  Radio,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Layers,
  X,
  User,
  Briefcase,
  Film,
  Award,
  Phone,
  Flower2,
  Mail,
} from "lucide-react";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { playUiClick, setUiVolume, getUiVolume } from "@/utils/sound";

interface ControlCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSection: (sectionId: string) => void;
  recruiterMode: boolean;
  onToggleRecruiterMode: () => void;
}

/* ─── reusable tile style ─── */
const tile: React.CSSProperties = {
  background: "rgba(180, 180, 185, 0.55)",
  backdropFilter: "blur(28px) saturate(180%)",
  WebkitBackdropFilter: "blur(28px) saturate(180%)",
  boxShadow: "0 2px 8px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(255,255,255,0.55) inset",
  borderRadius: 22,
};

const tileDark: React.CSSProperties = {
  background: "rgba(130, 130, 140, 0.70)",
  backdropFilter: "blur(28px) saturate(180%)",
  WebkitBackdropFilter: "blur(28px) saturate(180%)",
  boxShadow: "0 2px 8px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(255,255,255,0.40) inset",
  borderRadius: 22,
};

const iconCircle = (active: boolean): React.CSSProperties => ({
  width: 42,
  height: 42,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: active ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.22)",
  flexShrink: 0,
  transition: "background 0.2s",
});

export const ControlCenterModal: React.FC<ControlCenterModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
  onOpenSection,
  recruiterMode,
  onToggleRecruiterMode,
}) => {
  const [wifiOn, setWifiOn] = useState(true);
  const [airDropOn, setAirDropOn] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(getUiVolume());

  useEffect(() => { setUiVolume(volume); }, [volume]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const go = (id: string) => { playUiClick(soundEnabled); onOpenSection(id); onClose(); };

  const navItems = [
    { id: "about",        label: "About Me",      icon: <User        className="w-5 h-5" />, color: "#f2a6bd" },
    { id: "projects",     label: "Projects",       icon: <Briefcase   className="w-5 h-5" />, color: "#93c5fd" },
    { id: "certificates", label: "Certifications", icon: <Award       className="w-5 h-5" />, color: "#c4b5fd" },
    { id: "achievements", label: "Achievements",   icon: <Film        className="w-5 h-5" />, color: "#fcd34d" },
    { id: "contact",      label: "Contact Me",     icon: <Phone       className="w-5 h-5" />, color: "#fda4af" },
    { id: "garden",       label: "Secret Garden",  icon: <Flower2     className="w-5 h-5" />, color: "#6ee7b7" },
  ];

  return (
    /* ── Backdrop: dark-blurred so white portfolio disappears behind ── */
    <div
      className="fixed inset-0 z-50 flex justify-end items-start pt-10 pr-4 sm:pr-5 select-none overflow-y-auto"
      style={{
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      {/* ── Panel ── */}
      <div
        className="w-[340px] rounded-[32px] p-4 space-y-2.5 mt-1 mb-6"
        style={{
          background: "rgba(200,200,210,0.38)",
          backdropFilter: "blur(60px) saturate(200%)",
          WebkitBackdropFilter: "blur(60px) saturate(200%)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.50), 0 0 0 0.5px rgba(255,255,255,0.45) inset",
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ══ Row 1: Connectivity 2×3 + Media player ══ */}
        <div className="grid grid-cols-2 gap-2.5">

          {/* Connectivity block */}
          <div className="p-4 space-y-3" style={tile}>
            {/* Wi-Fi */}
            <button
              onClick={() => { playUiClick(soundEnabled); setWifiOn(!wifiOn); }}
              className="flex items-center gap-3 w-full"
            >
              <div style={iconCircle(wifiOn)}>
                <Wifi className={`w-5 h-5 ${wifiOn ? "text-slate-800" : "text-white"}`} />
              </div>
              <div className="text-left">
                <div className="text-[13px] font-bold text-white leading-tight">Wi-Fi</div>
                <div className="text-[10px] text-white/65 font-medium">
                  {wifiOn ? "Danah_Fiber" : "Off"}
                </div>
              </div>
            </button>

            <div className="h-px mx-1" style={{ background: "rgba(255,255,255,0.2)" }} />

            {/* Contact email */}
            <a
              href={`mailto:${PORTFOLIO_DATA.profile.email}`}
              onClick={() => playUiClick(soundEnabled)}
              className="flex items-center gap-3 w-full"
            >
              <div style={iconCircle(false)}>
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-[13px] font-bold text-white leading-tight">Contact</div>
                <div className="text-[10px] text-white/65 font-medium">Send email</div>
              </div>
            </a>

            <div className="h-px mx-1" style={{ background: "rgba(255,255,255,0.2)" }} />

            {/* AirDrop */}
            <button
              onClick={() => { playUiClick(soundEnabled); setAirDropOn(!airDropOn); }}
              className="flex items-center gap-3 w-full"
            >
              <div style={iconCircle(airDropOn)}>
                <Radio className={`w-5 h-5 ${airDropOn ? "text-slate-800" : "text-white"}`} />
              </div>
              <div className="text-left">
                <div className="text-[13px] font-bold text-white leading-tight">AirDrop</div>
                <div className="text-[10px] text-white/65 font-medium">
                  {airDropOn ? "Everyone" : "Off"}
                </div>
              </div>
            </button>
          </div>

          {/* Media player */}
          <div className="p-4 flex flex-col justify-between" style={tileDark}>
            {/* Art */}
            <div
              className="w-full aspect-square rounded-xl mb-3 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f2a6bd 0%, #c4b5fd 100%)" }}
            >
              <span style={{
                fontFamily: "serif", fontStyle: "italic", color: "white",
                fontWeight: 700, fontSize: 42
              }}>S</span>
            </div>
            <div>
              <div className="text-[12px] font-bold text-white truncate">SEÑAS Vision</div>
              <div className="text-[10px] text-white/55 font-medium">FSL Gesture AI</div>
            </div>
            <div className="flex items-center justify-between mt-3 text-white/75">
              <button onClick={() => playUiClick(soundEnabled)}>
                <SkipBack className="w-4 h-4 hover:text-white transition" />
              </button>
              <button
                onClick={() => { playUiClick(soundEnabled); setIsPlaying(!isPlaying); }}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.88)" }}
              >
                {isPlaying
                  ? <Pause className="w-4 h-4 text-slate-900" />
                  : <Play  className="w-4 h-4 text-slate-900 translate-x-0.5" />}
              </button>
              <button onClick={() => playUiClick(soundEnabled)}>
                <SkipForward className="w-4 h-4 hover:text-white transition" />
              </button>
            </div>
          </div>
        </div>

        {/* ══ Row 2: Clean Portfolio View toggle (wide pill) ══ */}
        <button
          onClick={() => { playUiClick(soundEnabled); onToggleRecruiterMode(); }}
          className="w-full flex items-center gap-4 px-5 py-4"
          style={recruiterMode ? {
            ...tile,
            background: "rgba(147,197,253,0.45)",
          } : tile}
        >
          <div style={iconCircle(recruiterMode)}>
            <Layers className={`w-5 h-5 ${recruiterMode ? "text-slate-800" : "text-white"}`} />
          </div>
          <div className="text-left">
            <div className="text-[14px] font-bold text-white">
              {recruiterMode ? "Exit Clean View" : "Clean Portfolio View"}
            </div>
            <div className="text-[11px] text-white/60 font-medium mt-0.5">
              {recruiterMode ? "Back to interactive mode" : "Straightforward, no-scroll layout"}
            </div>
          </div>
        </button>

        {/* ══ Row 3: Navigation grid ══ */}
        <div className="grid grid-cols-2 gap-2.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              className="flex items-center gap-3 px-4 py-3.5 text-left group transition-all active:scale-95"
              style={tile}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${item.color}35`, color: item.color }}
              >
                {item.icon}
              </div>
              <span className="text-[13px] font-bold text-white group-hover:text-white/90 leading-tight">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* ══ Row 4: Volume slider ══ */}
        <div className="px-5 py-4" style={tile}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              {soundEnabled && volume > 0
                ? <Volume2 className="w-5 h-5 text-white" />
                : <VolumeX className="w-5 h-5 text-white/40" />}
              <span className="text-[14px] font-bold text-white">Sound Effects</span>
            </div>
            <button
              onClick={() => {
                if (!soundEnabled || volume === 0) { setVolume(60); if (!soundEnabled) onToggleSound(); }
                else onToggleSound();
              }}
              className="text-[11px] font-semibold text-white/55 hover:text-white transition px-2 py-1 rounded-lg"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              {soundEnabled && volume > 0 ? "Mute" : "Unmute"}
            </button>
          </div>
          {/* Pill-style slider track */}
          <div className="relative h-8 flex items-center">
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: "rgba(255,255,255,0.18)" }}
            />
            <div
              className="absolute left-0 top-0 bottom-0 rounded-full"
              style={{
                width: `${soundEnabled ? volume : 0}%`,
                background: "rgba(255,255,255,0.75)",
                transition: "width 0.05s",
              }}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={soundEnabled ? volume : 0}
              onChange={(e) => {
                const v = Number(e.target.value);
                setVolume(v);
                if (v > 0 && !soundEnabled) onToggleSound();
                if (v === 0 && soundEnabled) onToggleSound();
              }}
              className="relative w-full h-full opacity-0 cursor-pointer z-10"
            />
          </div>
        </div>

        {/* ══ Close ══ */}
        <button
          onClick={() => { playUiClick(soundEnabled); onClose(); }}
          className="w-full py-3 flex items-center justify-center gap-2 rounded-[18px] text-[13px] font-semibold text-white/70 hover:text-white transition active:scale-95"
          style={{ background: "rgba(255,255,255,0.14)" }}
        >
          <X className="w-4 h-4" />
          Close
        </button>

      </div>
    </div>
  );
};
