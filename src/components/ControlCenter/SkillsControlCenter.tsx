"use client";

import React, { useState } from "react";
import { 
  Sliders, 
  BrainCircuit, 
  Smartphone, 
  Code2, 
  Wrench, 
  Sparkles, 
  Cpu, 
  Zap 
} from "lucide-react";
import { MacWindow } from "@/components/UI/MacWindow";
import { PORTFOLIO_DATA } from "@/data/portfolioData";

export const SkillsControlCenter: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("ai");
  const [creativityLevel, setCreativityLevel] = useState<number>(100);

  return (
    <MacWindow
      id="skills"
      title="System Preferences — Tech Stack & Capabilities"
      subtitle="Applied AI, Mobile & Full-Stack Matrix"
      icon={<Sliders className="w-4 h-4 text-indigo-500" />}
      className="max-w-5xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Control Center Quick Toggles (4 cols) */}
        <div className="md:col-span-4 space-y-3">
          {/* AI / ML Widget */}
          <button
            onClick={() => setActiveCategory("ai")}
            className={`w-full p-4 rounded-2xl border text-left transition-all ${
              activeCategory === "ai"
                ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/20 scale-[1.02]"
                : "bg-white/80 hover:bg-white text-slate-800 border-slate-200/80 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <BrainCircuit className="w-5 h-5" />
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                activeCategory === "ai" ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-700"
              }`}>
                Active
              </span>
            </div>
            <div className="font-bold text-sm">Applied AI & Vision</div>
            <div className={`text-[11px] mt-0.5 ${activeCategory === "ai" ? "text-indigo-100" : "text-slate-500"}`}>
              MediaPipe, MobileNetV2, LSTM
            </div>
          </button>

          {/* Mobile & Web Frameworks Widget */}
          <button
            onClick={() => setActiveCategory("frameworks")}
            className={`w-full p-4 rounded-2xl border text-left transition-all ${
              activeCategory === "frameworks"
                ? "bg-gradient-to-br from-pink-500 to-rose-600 text-white border-transparent shadow-lg shadow-pink-500/20 scale-[1.02]"
                : "bg-white/80 hover:bg-white text-slate-800 border-slate-200/80 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Smartphone className="w-5 h-5" />
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                activeCategory === "frameworks" ? "bg-white/20 text-white" : "bg-pink-100 text-pink-700"
              }`}>
                6 Techs
              </span>
            </div>
            <div className="font-bold text-sm">Mobile & Frameworks</div>
            <div className={`text-[11px] mt-0.5 ${activeCategory === "frameworks" ? "text-pink-100" : "text-slate-500"}`}>
              React Native, Expo, Laravel
            </div>
          </button>

          {/* Languages Widget */}
          <button
            onClick={() => setActiveCategory("languages")}
            className={`w-full p-4 rounded-2xl border text-left transition-all ${
              activeCategory === "languages"
                ? "bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-transparent shadow-lg shadow-blue-500/20 scale-[1.02]"
                : "bg-white/80 hover:bg-white text-slate-800 border-slate-200/80 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Code2 className="w-5 h-5" />
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                activeCategory === "languages" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"
              }`}>
                Polyglot
              </span>
            </div>
            <div className="font-bold text-sm">Languages</div>
            <div className={`text-[11px] mt-0.5 ${activeCategory === "languages" ? "text-blue-100" : "text-slate-500"}`}>
              Python, JS, TS, PHP, Java, C++
            </div>
          </button>

          {/* Tools & DevOps Widget */}
          <button
            onClick={() => setActiveCategory("tools")}
            className={`w-full p-4 rounded-2xl border text-left transition-all ${
              activeCategory === "tools"
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-transparent shadow-lg shadow-emerald-500/20 scale-[1.02]"
                : "bg-white/80 hover:bg-white text-slate-800 border-slate-200/80 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Wrench className="w-5 h-5" />
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                activeCategory === "tools" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
              }`}>
                Dev Tools
              </span>
            </div>
            <div className="font-bold text-sm">Tools & Cloud</div>
            <div className={`text-[11px] mt-0.5 ${activeCategory === "tools" ? "text-emerald-100" : "text-slate-500"}`}>
              Docker, Figma, Git, MySQL
            </div>
          </button>
        </div>

        {/* Right Column: Detailed Skill Grid & Sliders (8 cols) */}
        <div className="md:col-span-8 flex flex-col justify-between space-y-5 bg-white/70 p-6 rounded-2xl border border-white/80 shadow-inner">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-500" />
                <span>
                  {activeCategory === "ai" && "Applied Machine Learning & Computer Vision"}
                  {activeCategory === "frameworks" && "Mobile & Web Frameworks"}
                  {activeCategory === "languages" && "Programming & Scripting Languages"}
                  {activeCategory === "tools" && "Developer Tooling & Cloud Platforms"}
                </span>
              </h4>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {activeCategory === "ai" &&
                PORTFOLIO_DATA.skills.ai_ml.map((skill) => (
                  <div
                    key={skill}
                    className="p-3.5 rounded-xl bg-white border border-indigo-100 shadow-xs hover:border-indigo-300 transition flex items-center gap-2.5"
                  >
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-xs font-semibold text-slate-800">{skill}</span>
                  </div>
                ))}

              {activeCategory === "frameworks" &&
                PORTFOLIO_DATA.skills.frameworks.map((skill) => (
                  <div
                    key={skill}
                    className="p-3.5 rounded-xl bg-white border border-pink-100 shadow-xs hover:border-pink-300 transition flex items-center gap-2.5"
                  >
                    <div className="w-2 h-2 rounded-full bg-pink-500" />
                    <span className="text-xs font-semibold text-slate-800">{skill}</span>
                  </div>
                ))}

              {activeCategory === "languages" &&
                PORTFOLIO_DATA.skills.programming.map((skill) => (
                  <div
                    key={skill}
                    className="p-3.5 rounded-xl bg-white border border-blue-100 shadow-xs hover:border-blue-300 transition flex items-center gap-2.5"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-semibold text-slate-800">{skill}</span>
                  </div>
                ))}

              {activeCategory === "tools" &&
                PORTFOLIO_DATA.skills.tools.map((skill) => (
                  <div
                    key={skill}
                    className="p-3.5 rounded-xl bg-white border border-emerald-100 shadow-xs hover:border-emerald-300 transition flex items-center gap-2.5"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-slate-800">{skill}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Interactive Hardware / Mindset Sliders */}
          <div className="pt-4 border-t border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-700">
              <span className="font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Creativity & Problem Solving Overdrive</span>
              </span>
              <span className="font-mono font-bold text-pink-600">{creativityLevel}%</span>
            </div>
            <input
              type="range"
              min="80"
              max="100"
              value={creativityLevel}
              onChange={(e) => setCreativityLevel(Number(e.target.value))}
              className="w-full accent-pink-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </MacWindow>
  );
};

