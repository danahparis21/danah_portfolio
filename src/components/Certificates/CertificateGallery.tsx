"use client";

import React, { useState } from "react";
import { 
  FileText, 
  ExternalLink, 
  Download, 
  Award, 
  CheckCircle, 
  X, 
  Maximize2 
} from "lucide-react";
import { MacWindow } from "@/components/UI/MacWindow";
import { PORTFOLIO_DATA, Certificate } from "@/data/portfolioData";

export const CertificateGallery: React.FC = () => {
  const [activeCert, setActiveCert] = useState<Certificate | null>(null);

  return (
    <MacWindow
      id="certificates"
      title="Preview — Credentials & Certifications"
      subtitle="5 Verified Industry Certifications"
      icon={<Award className="w-4 h-4 text-blue-500" />}
      className="max-w-5xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PORTFOLIO_DATA.certificates.map((cert) => (
          <div
            key={cert.id}
            onClick={() => setActiveCert(cert)}
            className="group relative rounded-2xl bg-white/70 hover:bg-white/95 border border-white/80 hover:border-blue-200 p-5 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Badge & Issuer */}
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                  {cert.issuer}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{cert.date}</span>
              </div>

              {/* Certificate Title */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-100 to-indigo-50 border border-blue-200/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {cert.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Verified Credential</p>
                </div>
              </div>
            </div>

            {/* Quick Action footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="group-hover:text-blue-600 font-medium text-[11px] flex items-center gap-1 transition-colors">
                <Maximize2 className="w-3 h-3" />
                QuickLook View
              </span>
              <a
                href={cert.pdfPath}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                title="Open PDF directly"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* macOS QuickLook Modal */}
      {activeCert && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setActiveCert(null)}
        >
          <div
            className="w-full max-w-4xl h-[80vh] rounded-2xl glass-panel shadow-2xl border border-white/60 flex flex-col overflow-hidden bg-white/95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="h-11 px-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveCert(null)}
                  className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] hover:opacity-80 transition flex items-center justify-center group"
                >
                  <X className="w-2 h-2 text-[#7f1d1d] opacity-0 group-hover:opacity-100" />
                </button>
                <span className="text-xs font-semibold text-slate-800 ml-2">
                  {activeCert.title} — {activeCert.issuer}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={activeCert.pdfPath}
                  download
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
                <button
                  onClick={() => setActiveCert(null)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal PDF Viewer Body */}
            <div className="flex-1 w-full h-full bg-slate-100 p-2">
              <iframe
                src={`${activeCert.pdfPath}#toolbar=0`}
                className="w-full h-full rounded-xl border border-slate-200 shadow-inner bg-white"
                title={activeCert.title}
              />
            </div>
          </div>
        </div>
      )}
    </MacWindow>
  );
};

