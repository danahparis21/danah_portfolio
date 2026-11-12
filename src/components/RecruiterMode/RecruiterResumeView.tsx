"use client";

import React from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  FileDown,
  Mail,
  MapPin,
  Code2,
  Laptop,
  Smartphone,
  Sparkles,
  Rocket,
  PenLine,
  Award,
  Layers,
  BrainCircuit,
  RotateCcw,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/UI/Icons";
import { PORTFOLIO_DATA } from "@/data/portfolioData";

interface RecruiterResumeViewProps {
  onExit: () => void;
}

export const RecruiterResumeView: React.FC<RecruiterResumeViewProps> = ({ onExit }) => {
  const { profile, projects, skills, experience, certificates, achievements } = PORTFOLIO_DATA;

  // Filter out Secret Garden from the technical projects list
  const techProjects = projects.filter((p) => p.id !== "secret-garden");

  return (
    <div className="relative min-h-screen bg-white text-slate-800 pb-24 selection:bg-slate-100 selection:text-slate-900">
      {/* Subtle Dot Grid Canvas overlay matching the paper aesthetic */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-5 sm:px-8 pt-8 sm:pt-12">
        {/* Top Control Bar: Quick Actions (No "One Page View" text) */}
        <div className="flex items-center justify-end gap-2.5 pb-6 border-b border-slate-200/80 mb-8 sm:mb-10 text-xs">
          <button
            onClick={onExit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 font-medium text-xs transition shadow-2xs"
          >
            <RotateCcw className="w-3 h-3 text-slate-500" />
            <span>Back to Interactive OS</span>
          </button>

          <a
            href={profile.resumePath}
            download="MicaDanahParis_Resume.pdf"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-medium text-xs transition shadow-2xs"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>PDF Resume</span>
          </a>
        </div>

        {/* ── HEADER BIO (Natural Color Photo on Left, Bio on Right) ── */}
        <header className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8 pb-8">
          {/* Portrait Headshot — Natural Color, No Black & White */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-50 group">
            <Image
              src={profile.avatar}
              alt={profile.name}
              fill
              priority
              sizes="(min-width: 640px) 144px, 112px"
              className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5" />
          </div>

          {/* Bio Typography & Minimalist Inline Accents */}
          <div className="flex-1 space-y-3 sm:space-y-3.5">
            <div>
              <h1 className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-slate-900">
                {profile.name}
              </h1>
              <p className="mt-1 text-xs sm:text-sm font-mono text-slate-500">
                {profile.tagline}
              </p>
            </div>

            {/* Editorial bio paragraph with minimalist neutral badges */}
            <div className="text-[13.5px] sm:text-[14.5px] leading-relaxed text-slate-700 space-y-2">
              <p>
                I&apos;m a{" "}
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 text-slate-800 text-[11px] font-mono font-medium align-baseline shadow-2xs">
                  <Code2 className="w-3 h-3 text-slate-600" /> full-stack
                </span>{" "}
                engineer. I build modern{" "}
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 text-slate-800 text-[11px] font-mono font-medium align-baseline shadow-2xs">
                  <Laptop className="w-3 h-3 text-slate-600" /> web
                </span>{" "}
                &amp;{" "}
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 text-slate-800 text-[11px] font-mono font-medium align-baseline shadow-2xs">
                  <Smartphone className="w-3 h-3 text-slate-600" /> mobile apps
                </span>
                , and these days I&apos;m focused on{" "}
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 text-slate-800 text-[11px] font-mono font-medium align-baseline shadow-2xs">
                  <Sparkles className="w-3 h-3 text-slate-600" /> generative AI
                </span>{" "}
                &amp; real-time computer vision.
              </p>

              <p>
                Right now I&apos;m building{" "}
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 text-slate-800 text-[11px] font-mono font-medium align-baseline shadow-2xs">
                  <Rocket className="w-3 h-3 text-slate-600" /> high-impact tools
                </span>{" "}
                every day. I love turning{" "}
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 text-slate-800 text-[11px] font-mono font-medium align-baseline shadow-2xs">
                  <PenLine className="w-3 h-3 text-slate-600" /> human-centered ideas
                </span>{" "}
                into things people actually use.
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs font-mono text-slate-500">
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-900 transition inline-flex items-center gap-0.5"
              >
                github <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </a>
              <span className="text-slate-300">/</span>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-900 transition inline-flex items-center gap-0.5"
              >
                linkedin <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </a>
              <span className="text-slate-300">/</span>
              <a
                href={`mailto:${profile.email}`}
                className="hover:text-slate-900 transition inline-flex items-center gap-0.5"
              >
                email <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </a>
              <span className="text-slate-300">/</span>
              <span className="text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Batangas, PH
              </span>
            </div>
          </div>
        </header>

        {/* ── HIGHLIGHTS & STATS GRID (Bryl Lim Style — Minimalist Monochrome) ── */}
        <section className="border border-slate-200/90 rounded-2xl bg-white divide-y divide-slate-200/80 shadow-2xs my-6 sm:my-8 overflow-hidden">
          {/* Row 1: Key Affiliations & Roles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80">
            <div className="p-3.5 sm:p-4 flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 shrink-0">
                <BrainCircuit className="w-4 h-4 text-slate-700" />
              </div>
              <div>
                <div className="font-mono text-xs font-semibold text-slate-900 tracking-tight">
                  SEÑAS FSL AI
                </div>
                <div className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                  Lead ML Engineer
                </div>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 shrink-0">
                <Award className="w-4 h-4 text-slate-700" />
              </div>
              <div>
                <div className="font-mono text-xs font-semibold text-slate-900 tracking-tight">
                  SiKAPTala 2026
                </div>
                <div className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                  National CS Finalist
                </div>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 shrink-0">
                <Layers className="w-4 h-4 text-slate-700" />
              </div>
              <div>
                <div className="font-mono text-xs font-semibold text-slate-900 tracking-tight">
                  BatStateU TNEU
                </div>
                <div className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                  BS IT · Class 2027
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Actual Metrics & Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80">
            <div className="p-3.5 sm:p-4">
              <div className="flex items-center gap-1 font-mono text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                <span>90.12%</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="font-mono text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                Model Recognition Accuracy
              </div>
            </div>

            <div className="p-3.5 sm:p-4">
              <div className="flex items-center gap-1 font-mono text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                <span>4 Apps</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="font-mono text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                Architected &amp; Built
              </div>
            </div>

            <div className="p-3.5 sm:p-4">
              <div className="flex items-center gap-1 font-mono text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                <span>1st Place</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="font-mono text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                SDG Advocacy Video Award
              </div>
            </div>
          </div>
        </section>

        {/* Minimal Dotted Line Separator */}
        <div className="my-8 flex items-center justify-center gap-1 text-slate-300 select-none font-mono text-xs">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i}>·</span>
          ))}
        </div>

        {/* ── 01 — PROJECTS (Technical Projects Only, Secret Garden Excluded) ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-slate-400">
              01 — Featured Projects
            </h2>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] text-slate-400 hover:text-slate-900 transition flex items-center gap-0.5 uppercase tracking-wider"
            >
              All Code on GitHub <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          <div className="divide-y divide-slate-200/80">
            {techProjects.map((p) => (
              <article
                key={p.id}
                className="py-4.5 sm:py-5 group transition-colors -mx-3 px-3 rounded-xl hover:bg-slate-50/70"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-[17px] font-semibold text-slate-900 tracking-tight group-hover:underline decoration-slate-300 underline-offset-4 transition-colors">
                      {p.title}
                    </h3>
                    <span className="text-xs text-slate-400 hidden sm:inline">— {p.subtitle}</span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs text-slate-400 shrink-0">
                    <span>{p.period}</span>
                    {p.liveUrl && (
                      <a
                        href={p.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-900 hover:text-black font-medium inline-flex items-center gap-0.5 underline decoration-slate-300 underline-offset-2"
                      >
                        Live <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <p className="mt-1.5 text-xs sm:text-[13.5px] leading-relaxed text-slate-600">
                  {p.description}
                </p>

                {/* Tech Stack & Metric Pills (Minimalist Neutral) */}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 font-mono text-[11px] text-slate-600 shadow-2xs"
                    >
                      {t}
                    </span>
                  ))}
                  {p.metrics &&
                    p.metrics.map((m) => (
                      <span
                        key={m.label}
                        className="px-2 py-0.5 rounded-md bg-slate-100/80 border border-slate-200 font-mono text-[11px] font-medium text-slate-700"
                      >
                        {m.label}: {m.value}
                      </span>
                    ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Minimal Dotted Line Separator */}
        <div className="my-8 flex items-center justify-center gap-1 text-slate-300 select-none font-mono text-xs">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i}>·</span>
          ))}
        </div>

        {/* ── 02 — EXPERIENCE & LEADERSHIP ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-slate-400">
              02 — Experience &amp; Leadership
            </h2>
          </div>

          <div className="divide-y divide-slate-200/80">
            {experience.map((exp, i) => (
              <div key={i} className="py-4.5 sm:py-5 -mx-3 px-3 rounded-xl hover:bg-slate-50/70 transition">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div>
                    <h3 className="text-[15px] font-semibold text-slate-900">{exp.role}</h3>
                    <div className="text-xs text-slate-500 font-mono">{exp.company}</div>
                  </div>
                  <span className="font-mono text-xs text-slate-400">{exp.period}</span>
                </div>

                <ul className="mt-2.5 space-y-1 text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                  {exp.bullets.map((b, bi) => (
                    <li key={bi} className="flex items-start gap-2">
                      <span className="text-slate-400 font-mono">↳</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {exp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/70 font-mono text-[10.5px] text-slate-500 shadow-2xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Minimal Dotted Line Separator */}
        <div className="my-8 flex items-center justify-center gap-1 text-slate-300 select-none font-mono text-xs">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i}>·</span>
          ))}
        </div>

        {/* ── 03 — TECHNICAL STACK ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-slate-400">
              03 — Technical Stack
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-1.5 shadow-2xs">
              <span className="font-mono text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Languages &amp; Core
              </span>
              <p className="font-mono text-slate-800 leading-relaxed">
                {skills.programming.join(" · ")}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-1.5 shadow-2xs">
              <span className="font-mono text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Frameworks &amp; Mobile
              </span>
              <p className="font-mono text-slate-800 leading-relaxed">
                {skills.frameworks.join(" · ")}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-1.5 shadow-2xs">
              <span className="font-mono text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                AI &amp; Computer Vision
              </span>
              <p className="font-mono text-slate-800 leading-relaxed">
                {skills.ai_ml.join(" · ")}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-1.5 shadow-2xs">
              <span className="font-mono text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Developer Tools &amp; Cloud
              </span>
              <p className="font-mono text-slate-800 leading-relaxed">
                {skills.tools.join(" · ")}
              </p>
            </div>
          </div>
        </section>

        {/* Minimal Dotted Line Separator */}
        <div className="my-8 flex items-center justify-center gap-1 text-slate-300 select-none font-mono text-xs">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i}>·</span>
          ))}
        </div>

        {/* ── 04 — EDUCATION & CERTIFICATIONS ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-slate-400">
              04 — Education &amp; Certifications
            </h2>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-1 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <h3 className="text-sm font-semibold text-slate-900">
                {profile.education.university}
              </h3>
              <span className="font-mono text-xs text-slate-400">
                {profile.education.graduation}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-mono">
              {profile.education.degree}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-3 rounded-xl border border-slate-200/70 bg-white flex justify-between items-start text-xs shadow-2xs"
              >
                <div>
                  <div className="font-medium text-slate-900">{cert.title}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{cert.issuer}</div>
                </div>
                <span className="font-mono text-[10px] text-slate-400 shrink-0 ml-2">{cert.date}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Minimal Dotted Line Separator */}
        <div className="my-8 flex items-center justify-center gap-1 text-slate-300 select-none font-mono text-xs">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i}>·</span>
          ))}
        </div>

        {/* ── 05 — HONORS & RESEARCH PRESENTATIONS ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-slate-400">
              05 — Honors &amp; Research Presentations
            </h2>
          </div>

          <div className="divide-y divide-slate-200/70">
            {achievements.map((a) => (
              <div key={a.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-900">{a.award}</span>
                  <span className="text-slate-500"> — {a.title}</span>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{a.organization}</div>
                </div>
                <span className="font-mono text-xs text-slate-400 shrink-0">{a.year}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Minimal Dotted Line Separator */}
        <div className="my-8 flex items-center justify-center gap-1 text-slate-300 select-none font-mono text-xs">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i}>·</span>
          ))}
        </div>

        {/* ── 06 — CONNECT & GET IN TOUCH ── */}
        <section className="space-y-4 pb-12">
          <div className="flex items-center justify-between pb-2">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-slate-400">
              06 — Connect &amp; Get in Touch
            </h2>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl border border-slate-200/90 bg-white shadow-2xs space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              I&apos;m always excited to collaborate on applied AI research, sign language accessibility, or modern full-stack web and mobile systems. Feel free to reach out directly.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1 text-xs">
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{profile.email}</span>
              </a>

              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition"
              >
                <LinkedinIcon className="w-3.5 h-3.5" />
                <span>LinkedIn Profile</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>github.com/danahparis21</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        </section>

        {/* Editorial Footer */}
        <footer className="pt-6 border-t border-slate-200/80 text-center font-mono text-xs text-slate-400">
          Handcrafted with care by Mica Danah Paris · {new Date().getFullYear()}
        </footer>
      </div>

      {/* Floating Bottom Quick Action Pill */}
      <div className="fixed bottom-5 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto inline-flex items-center gap-1.5 p-1.5 rounded-full bg-slate-900/90 text-white backdrop-blur-md shadow-xl border border-white/20 text-xs font-mono">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
          >
            <RotateCcw className="w-3 h-3 text-slate-300" />
            <span>Interactive Danah OS</span>
          </button>

          <span className="h-3 w-px bg-white/20" />

          <a
            href={profile.resumePath}
            download="MicaDanahParis_Resume.pdf"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-semibold transition active:scale-95 shadow-sm"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>PDF</span>
          </a>
        </div>
      </div>
    </div>
  );
};
