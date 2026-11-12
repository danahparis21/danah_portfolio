"use client";

import React, { useState } from "react";
import { MacMenuBar } from "@/components/Navigation/MacMenuBar";
import { ControlCenterModal } from "@/components/Navigation/ControlCenterModal";
import { HeroStationery } from "@/components/Hero/HeroStationery";
import { HumanAbout } from "@/components/About/HumanAbout";
import { ProjectsScrollStory } from "@/components/Projects/ProjectsScrollStory";
import { AchievementTheater } from "@/components/Achievements/AchievementTheater";
import { CertificateCarousel } from "@/components/Certificates/CertificateCarousel";
import { ContactNumpad } from "@/components/Contact/ContactNumpad";
import { RecruiterResumeView } from "@/components/RecruiterMode/RecruiterResumeView";
import { playUiClick } from "@/utils/sound";

export default function Home() {
  const [recruiterMode, setRecruiterMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState<boolean>(false);

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
    if (sectionId === "garden") {
      const elem = document.getElementById("projects");
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
        window.dispatchEvent(new CustomEvent("open-project-tab", { detail: "secret-garden" }));
      }
      return;
    }
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 relative">
      {/* Top macOS Menu Bar — Always present to preserve the portfolio shell */}
      <MacMenuBar
        recruiterMode={recruiterMode}
        onToggleRecruiterMode={handleToggleRecruiterMode}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenSection={(sec) => {
          if (recruiterMode) setRecruiterMode(false);
          scrollToSection(sec);
        }}
        onToggleControlCenter={() => setIsControlCenterOpen(!isControlCenterOpen)}
      />

      {/* Apple iOS / macOS Glassmorphic Control Center Modal */}
      <ControlCenterModal
        isOpen={isControlCenterOpen}
        onClose={() => setIsControlCenterOpen(false)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenSection={(sec) => {
          if (recruiterMode) setRecruiterMode(false);
          scrollToSection(sec);
        }}
        recruiterMode={recruiterMode}
        onToggleRecruiterMode={handleToggleRecruiterMode}
      />

      {/* View Switcher: Minimalist One Page View vs. Full Interactive Danah OS */}
      {recruiterMode ? (
        <div className="pt-12 sm:pt-14">
          <RecruiterResumeView onExit={handleToggleRecruiterMode} />
        </div>
      ) : (
        <>
          {/* Chapter 1: Hero Section */}
          <HeroStationery
            onScrollDown={() => scrollToSection("about")}
            onFolderClick={scrollToSection}
          />

          {/* Chapter 2: Scroll-Driven Stacking Projects in Shades of Pink (MacBook Windows) */}
          <div className="bg-pink-50/30 border-y border-pink-100/80">
            <ProjectsScrollStory />
          </div>

          {/* Chapter 3: Warm, Reflective Human About Me (Picasso Quote + Resume Skills) */}
          <HumanAbout />

          {/* Chapter 4: Official Certificates Navigable Accordion Deck */}
          <CertificateCarousel />

          {/* Chapter 5: Media & Advocacy Award Theater */}
          <AchievementTheater />

          {/* Chapter 6: 3D Mechanical Numpad Contact Portal */}
          <ContactNumpad />

          {/* Translucent Footer credits */}
          <footer className="w-full bg-white/75 py-6 text-center text-xs font-medium text-slate-600 backdrop-blur-md border-t border-slate-200/50">
            Handcrafted with care by Mica Danah Paris &middot; Software Engineer &amp; Applied AI Developer
          </footer>
        </>
      )}
    </main>
  );
}
