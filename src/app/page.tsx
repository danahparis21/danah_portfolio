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
import { DanahSecretGarden } from "@/components/Garden/DanahSecretGarden";
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
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 relative">
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

          {/* Chapter 1: Hero Section */}
          <HeroStationery
            onScrollDown={() => scrollToSection("about")}
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

          {/* Chapter 7: Danah's Secret Garden (Full-Bleed 100% Screen Width Meadow Footer) */}
          <DanahSecretGarden />
        </>
      )}
    </main>
  );
}
