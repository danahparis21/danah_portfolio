"use client";

import React, { useState } from "react";
import { MacMenuBar } from "@/components/Navigation/MacMenuBar";
import { ControlCenterModal } from "@/components/Navigation/ControlCenterModal";
import { DesktopLoader } from "@/components/UI/DesktopLoader";
import { HeroStationery } from "@/components/Hero/HeroStationery";
import { HumanAbout } from "@/components/About/HumanAbout";
import { ProjectsScrollStory } from "@/components/Projects/ProjectsScrollStory";
import { AchievementTheater } from "@/components/Achievements/AchievementTheater";
import { CertificateCarousel } from "@/components/Certificates/CertificateCarousel";
import { ContactNumpad } from "@/components/Contact/ContactNumpad";
import { DanahSecretGarden } from "@/components/Garden/DanahSecretGarden";
import { RecruiterResumeView } from "@/components/RecruiterMode/RecruiterResumeView";
import { Monitor } from "lucide-react";
import { playUiClick } from "@/utils/sound";

export default function Home() {
  const [recruiterMode, setRecruiterMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState<boolean>(false);
  const [inDesktopScene, setInDesktopScene] = useState<boolean>(true);

  const handleToggleRecruiterMode = () => {
    playUiClick(soundEnabled);
    setRecruiterMode(!recruiterMode);
  };

  const handleToggleSound = () => {
    playUiClick(!soundEnabled);
    setSoundEnabled(!soundEnabled);
  };

  const scrollToSection = (sectionId: string) => {
    playUiClick(soundEnabled);
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 relative">
      {/* 1. Desktop Loading & Studio Zoom-In Screen */}
      {inDesktopScene && (
        <DesktopLoader
          onEnter={() => setInDesktopScene(false)}
          soundEnabled={soundEnabled}
        />
      )}

      {/* Recruiter ATS View Mode */}
      {recruiterMode ? (
        <div className="pt-10">
          <RecruiterResumeView onExit={handleToggleRecruiterMode} />
        </div>
      ) : (
        <>
          {/* Top macOS Menu Bar */}
          <MacMenuBar
            recruiterMode={recruiterMode}
            onToggleRecruiterMode={handleToggleRecruiterMode}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            onOpenSection={scrollToSection}
            onToggleControlCenter={() => setIsControlCenterOpen(!isControlCenterOpen)}
          />

          {/* Apple iOS / macOS Glassmorphic Control Center Modal */}
          <ControlCenterModal
            isOpen={isControlCenterOpen}
            onClose={() => setIsControlCenterOpen(false)}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            onOpenSection={scrollToSection}
            recruiterMode={recruiterMode}
            onToggleRecruiterMode={handleToggleRecruiterMode}
          />

          {/* Return to Studio Desk scene button (Icon, no emojis) */}
          <button
            onClick={() => {
              playUiClick(soundEnabled);
              setInDesktopScene(true);
            }}
            className="fixed bottom-4 right-4 z-40 px-3.5 py-2 rounded-full bg-slate-900/90 text-white text-[11px] font-mono hover:bg-slate-800 shadow-xl flex items-center gap-2 backdrop-blur-md transition-all hover:scale-105"
            title="Return to Studio Desk"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Studio Desk</span>
          </button>

          {/* Chapter 1: Hero Section with 3D ID Badge (Pixel Flip on back) & Clean Resume CTA */}
          <HeroStationery
            onScrollDown={() => scrollToSection("about")}
          />

          {/* Chapter 2: Warm, Reflective Human About Me (Picasso Quote + Resume Skills) */}
          <HumanAbout />

          {/* Chapter 3: Scroll-Driven Stacking Projects in Shades of Pink (MacBook Windows) */}
          <div className="bg-pink-50/30 border-y border-pink-100/80">
            <ProjectsScrollStory />
          </div>

          {/* Chapter 4: Official Certificates Navigable Accordion Deck */}
          <CertificateCarousel />

          {/* Chapter 5: Media & Advocacy Award Theater */}
          <AchievementTheater />

          {/* Chapter 6: 3D Mechanical Numpad Contact Portal */}
          <ContactNumpad />

          {/* Chapter 7: Danah's Secret Garden (Full-Bleed 100% Screen Width Meadow Footer) */}
          <DanahSecretGarden />
        </>
      )}
    </main>
  );
}
