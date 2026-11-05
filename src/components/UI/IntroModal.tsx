"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Sparkles, ArrowRight, X } from "lucide-react";

interface IntroModalProps {
  onClose: () => void;
}

export const IntroModal: React.FC<IntroModalProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const handleStart = () => {
    setIsOpen(false);
    onClose();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.5 },
      colors: ["#3b82f6", "#f59e0b", "#ec4899", "#10b981"],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-7 sm:p-9 shadow-2xl border border-slate-200 text-center space-y-5 animate-scale-up">
        {/* Close Button */}
        <button
          onClick={handleStart}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Sticker Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
          <span>PORTFOLIO OS // V2.0</span>
        </div>

        {/* Big Catchy Title */}
        <div className="space-y-1">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            HI! Let me <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600">
              introduce myself!
            </span>
          </h2>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest pt-1">
            Mica Danah Paris • Software & AI Engineer
          </p>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
          I build high-precision computer vision pipelines, full-stack mobile apps, and interactive web experiences. Welcome to my creative workspace!
        </p>

        {/* CTA Button */}
        <div className="pt-2">
          <button
            onClick={handleStart}
            className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs tracking-wide shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Explore Danah&apos;s Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

