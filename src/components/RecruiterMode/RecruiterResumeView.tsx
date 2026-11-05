"use client";

import React from "react";
import { 
  FileDown, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink, 
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/UI/Icons";
import { PORTFOLIO_DATA } from "@/data/portfolioData";

interface RecruiterResumeViewProps {
  onExit: () => void;
}

export const RecruiterResumeView: React.FC<RecruiterResumeViewProps> = ({ onExit }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-8 text-slate-800 animate-fade-in pb-28">
      {/* Return to OS button */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Interactive DanahOS</span>
        </button>

        <a
          href={PORTFOLIO_DATA.profile.resumePath}
          download="MicaDanahParis_Resume.pdf"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-semibold shadow-md shadow-pink-500/20 hover:opacity-95 transition"
        >
          <FileDown className="w-4 h-4" />
          <span>Download PDF Resume</span>
        </a>
      </div>

      {/* Main Resume Sheet */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200 space-y-8">
        {/* Header */}
        <div className="text-center pb-6 border-b border-slate-200 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            {PORTFOLIO_DATA.profile.name}
          </h1>
          <p className="text-base font-semibold text-slate-800">
            Software Engineer &amp; Applied AI Developer • Full-Stack &amp; Vision
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600 pt-2 font-medium">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {PORTFOLIO_DATA.profile.phone}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {PORTFOLIO_DATA.profile.email}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {PORTFOLIO_DATA.profile.location}
            </span>
            <span>•</span>
            <a
              href={PORTFOLIO_DATA.profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:underline"
            >
              <LinkedinIcon className="w-3.5 h-3.5" />
              LinkedIn
            </a>
            <span>•</span>
            <a
              href={PORTFOLIO_DATA.profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-800 hover:underline"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              github.com/danahparis21
            </a>
          </div>
        </div>

        {/* Professional Summary */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
            Professional Summary
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            {PORTFOLIO_DATA.profile.summary}
          </p>
        </div>

        {/* Education */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            Education
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {PORTFOLIO_DATA.profile.education.university}
              </h3>
              <p className="text-xs text-slate-600">
                {PORTFOLIO_DATA.profile.education.degree}
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 mt-1 sm:mt-0">
              {PORTFOLIO_DATA.profile.education.graduation}
            </span>
          </div>
        </div>

        {/* Key Projects */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
            Projects
          </h2>
          <div className="space-y-6">
            {PORTFOLIO_DATA.projects.map((project) => (
              <div key={project.id} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{project.title}</h3>
                    <span className="text-xs text-slate-500">— {project.subtitle}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">{project.period}</span>
                </div>
                <div className="text-xs font-semibold text-pink-600">{project.role}</div>

                <ul className="space-y-1 text-xs text-slate-700 pt-1">
                  {project.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-pink-500 font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                {/* Metrics */}
                {project.metrics && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {project.metrics.map((m) => (
                      <span
                        key={m.label}
                        className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold"
                      >
                        {m.label}: {m.value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Technical Skills */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            Technical Skills
          </h2>
          <div className="space-y-2 text-xs text-slate-700">
            <div>
              <strong className="text-slate-900">Programming:</strong>{" "}
              {PORTFOLIO_DATA.skills.programming.join(", ")}
            </div>
            <div>
              <strong className="text-slate-900">Frameworks & Libraries:</strong>{" "}
              {PORTFOLIO_DATA.skills.frameworks.join(", ")}
            </div>
            <div>
              <strong className="text-slate-900">AI / ML:</strong>{" "}
              {PORTFOLIO_DATA.skills.ai_ml.join(", ")}
            </div>
            <div>
              <strong className="text-slate-900">Tools:</strong>{" "}
              {PORTFOLIO_DATA.skills.tools.join(", ")}
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            Certifications
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {PORTFOLIO_DATA.certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-start"
              >
                <div>
                  <div className="font-bold text-slate-900">{cert.title}</div>
                  <div className="text-[11px] text-slate-500">{cert.issuer}</div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{cert.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Awards */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            Awards & Research Presentations
          </h2>
          <div className="space-y-3 text-xs text-slate-700">
            {PORTFOLIO_DATA.achievements.map((a) => (
              <div key={a.id} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-slate-900">{a.award}</strong> — {a.title} ({a.year})
                  <div className="text-[11px] text-slate-500">{a.organization}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
