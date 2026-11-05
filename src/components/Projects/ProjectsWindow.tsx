"use client";

import React, { useState, useRef } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  Sparkles, 
  BarChart3, 
  CheckCircle2, 
  Layers, 
  Smartphone,
  Laptop
} from "lucide-react";
import { GithubIcon } from "@/components/UI/Icons";
import { MacWindow } from "@/components/UI/MacWindow";
import { PORTFOLIO_DATA, Project } from "@/data/portfolioData";

export const ProjectsWindow: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("senas");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeProject = PORTFOLIO_DATA.projects.find((p) => p.id === selectedProjectId) || PORTFOLIO_DATA.projects[0];

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <MacWindow
      id="projects"
      title="Finder — Projects & Repositories"
      subtitle="Interactive Work Showcase"
      icon={<Layers className="w-4 h-4 text-pink-500" />}
      className="max-w-5xl mx-auto"
    >
      {/* Project Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-5 border-b border-slate-200/60">
        {PORTFOLIO_DATA.projects.map((project) => (
          <button
            key={project.id}
            onClick={() => setSelectedProjectId(project.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm ${
              selectedProjectId === project.id
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-500/20 scale-[1.02]"
                : "bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80"
            }`}
          >
            {project.id === "senas" ? (
              <Smartphone className="w-3.5 h-3.5" />
            ) : (
              <Laptop className="w-3.5 h-3.5" />
            )}
            <span>{project.title}</span>
            <span className="text-[10px] opacity-80 font-normal">({project.period})</span>
          </button>
        ))}
      </div>

      {/* Project Detailed View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
        {/* Left Column: Video Preview / Visual Showcase (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {activeProject.videoUrl ? (
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-white/60 bg-slate-950 aspect-video group">
              <video
                ref={videoRef}
                src={activeProject.videoUrl}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Video Overlay Controls */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                <div className="flex justify-between items-center text-white/90 text-xs">
                  <span className="font-mono bg-black/40 px-2 py-0.5 rounded backdrop-blur-md">
                    {activeProject.title} Demo Video
                  </span>
                  <span className="text-[10px] text-pink-300 font-semibold bg-pink-950/60 px-2 py-0.5 rounded-full border border-pink-500/30">
                    Live Demo
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <span className="text-[11px] text-white/70 font-mono ml-auto">
                    {isPlaying ? "Playing preview" : "Paused"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 flex flex-col items-center justify-center text-center bg-white/40 aspect-video">
              <Sparkles className="w-10 h-10 text-pink-400 mb-2 animate-bounce" />
              <h4 className="font-semibold text-slate-800 text-sm">System Architecture Preview</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Random Forest ML Model • Computer Vision Undertone Detection • Virtual Lipstick Try-on
              </p>
            </div>
          )}

          {/* Metrics Pill Grid (for SEÑAS) */}
          {activeProject.metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {activeProject.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-xl p-3 bg-white/70 border border-white/60 shadow-sm text-center backdrop-blur-sm"
                >
                  <div className="text-xs text-slate-500 font-medium">{metric.label}</div>
                  <div className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Project Info & Actions (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div>
            {/* Badge & Role */}
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-pink-100 text-pink-700 border border-pink-200">
                {activeProject.badge}
              </span>
              <span className="text-xs font-medium text-slate-500">{activeProject.period}</span>
            </div>

            <h3 className="text-2xl font-bold text-slate-900">{activeProject.title}</h3>
            <p className="text-xs font-semibold text-pink-600 mb-2.5">{activeProject.subtitle}</p>
            
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              {activeProject.description}
            </p>

            {/* Bullets */}
            <ul className="space-y-1.5 text-xs text-slate-600 mb-4">
              {activeProject.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            {/* Tech Tags */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {activeProject.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100/90 text-slate-700 border border-slate-200/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Links & Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-200/60">
            {activeProject.liveUrl && (
              <a
                href={activeProject.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium text-xs shadow-md shadow-pink-500/20 transition-all hover:scale-[1.01]"
              >
                <span>Visit Live Platform (señas.tech)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {activeProject.githubUrls && activeProject.githubUrls.map((repo) => (
              <a
                key={repo.label}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/80 hover:bg-white text-slate-800 text-xs font-medium border border-slate-200 shadow-sm transition hover:border-slate-300"
              >
                <span className="flex items-center gap-2">
                  <GithubIcon className="w-3.5 h-3.5 text-slate-700" />
                  {repo.label}
                </span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </MacWindow>
  );
};
