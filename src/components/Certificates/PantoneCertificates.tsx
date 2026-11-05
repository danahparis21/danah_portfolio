"use client";

import React, { useState } from "react";
import { 
  Award, 
  ExternalLink, 
  Download, 
  X, 
  Sparkles,
  Maximize2,
  FileCheck
} from "lucide-react";
import { PORTFOLIO_DATA, Certificate } from "@/data/portfolioData";
import { playUiClick } from "@/utils/sound";

export const PantoneCertificates: React.FC = () => {
  const [activeCert, setActiveCert] = useState<Certificate | null>(null);

  const handleOpenCert = (cert: Certificate) => {
    playUiClick(true);
    setActiveCert(cert);
  };

  return (
    <section id="certificates" className="py-16 px-4 max-w-6xl mx-auto scroll-mt-12 select-none">
      {/* Editorial Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-purple-600 uppercase tracking-widest">
            <Award className="w-4 h-4" />
            <span>CREDENTIAL SPECIMENS // PANTONE DECK</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-1">
            Certifications &amp; Credentials
          </h2>
        </div>
        <p className="text-xs text-slate-500 max-w-xs mt-2 sm:mt-0">
          Presented as collectible Pantone design swatch specimens. Click any specimen to view official verified PDF.
        </p>
      </div>

      {/* PANTONE SWATCH DECK GRID (Image 4 Replica!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {PORTFOLIO_DATA.pantoneCertificates.map((cert) => (
          <div
            key={cert.id}
            onClick={() => handleOpenCert(cert)}
            className="group relative rounded-3xl bg-white p-6 shadow-md hover:shadow-2xl border border-slate-200 hover:border-slate-400 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:scale-[1.02]"
          >
            {/* Top Swatch Metadata (Pantone Header) */}
            <div className="space-y-3">
              <div className="flex justify-between items-start font-mono text-[11px] text-slate-500">
                <div>
                  <div className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                    {cert.pantoneName}
                  </div>
                  <div className="text-[10px] text-purple-600 font-semibold">{cert.pantoneCode}</div>
                </div>
                <div className="text-right text-[9px] text-slate-400 leading-tight">
                  <div>{cert.cmyk}</div>
                  <div>{cert.rgb}</div>
                </div>
              </div>

              {/* MULTI-BAR SPECTRUM COLOR BLOCK (Image 4 exact aesthetic!) */}
              <div className="w-full h-36 rounded-2xl overflow-hidden shadow-inner flex border border-slate-100">
                {cert.colorBars.map((color, idx) => (
                  <div
                    key={idx}
                    className="flex-1 h-full transition-transform duration-300 group-hover:scale-y-105"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Certificate Title & Verified Issuer */}
              <div className="pt-2">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition leading-snug">
                  {cert.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                  <span className="font-semibold text-slate-700">{cert.issuer}</span>
                  <span className="font-mono text-[10px] text-slate-400">{cert.date}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="group-hover:text-purple-600 transition font-medium flex items-center gap-1">
                <Maximize2 className="w-3 h-3" />
                QuickLook PDF
              </span>
              <a
                href={cert.pdfPath}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition"
                title="Open PDF"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* QuickLook PDF Modal Viewer */}
      {activeCert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setActiveCert(null)}
        >
          <div
            className="w-full max-w-4xl h-[82vh] rounded-3xl bg-white shadow-2xl border border-slate-300 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="h-12 px-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between select-none">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveCert(null)}
                  className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] hover:opacity-80 transition"
                />
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {activeCert.title} // {activeCert.issuer}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={activeCert.pdfPath}
                  download
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Specimen PDF</span>
                </a>
                <button
                  onClick={() => setActiveCert(null)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* PDF Viewer Body */}
            <div className="flex-1 w-full h-full bg-slate-100 p-2">
              <iframe
                src={`${activeCert.pdfPath}#toolbar=0`}
                className="w-full h-full rounded-2xl border border-slate-200 shadow-inner bg-white"
                title={activeCert.title}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

