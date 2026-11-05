"use client";

import React, { useState } from "react";
import { 
  Mail, 
  ExternalLink, 
  FileDown, 
  Sparkles,
  Heart
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/UI/Icons";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { playBookSlide, playUiClick } from "@/utils/sound";

interface Book {
  id: string;
  title: string;
  author: string;
  color: string;
  textColor: string;
  link: string;
  isDownload?: boolean;
  isExternal?: boolean;
}

export const BookshelfContact: React.FC = () => {
  const [activeBookId, setActiveBookId] = useState<string | null>(null);

  const books: Book[] = [
    {
      id: "gmail",
      title: "Gmail",
      author: "Direct Email",
      color: "bg-[#dc2626]",
      textColor: "text-white",
      link: `mailto:${PORTFOLIO_DATA.profile.email}`,
      isExternal: true,
    },
    {
      id: "linkedin",
      title: "LinkedIn",
      author: "Mica Danah Paris",
      color: "bg-[#0284c7]",
      textColor: "text-white",
      link: PORTFOLIO_DATA.profile.linkedin,
      isExternal: true,
    },
    {
      id: "github",
      title: "GitHub",
      author: "danahparis21",
      color: "bg-[#18181b]",
      textColor: "text-white",
      link: PORTFOLIO_DATA.profile.github,
      isExternal: true,
    },
    {
      id: "resume",
      title: "Resume",
      author: "Official PDF",
      color: "bg-[#e11d48]",
      textColor: "text-white",
      link: PORTFOLIO_DATA.profile.resumePath,
      isDownload: true,
    },
    {
      id: "senas",
      title: "señas.tech",
      author: "Live AI Platform",
      color: "bg-[#2563eb]",
      textColor: "text-white",
      link: "https://señas.tech",
      isExternal: true,
    },
  ];

  const handleBookHover = (id: string) => {
    playBookSlide(true);
    setActiveBookId(id);
  };

  return (
    <section id="contact" className="py-20 px-4 max-w-4xl mx-auto text-center select-none">
      {/* Editorial Header */}
      <div className="mb-12">
        <h2 className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-slate-900">
          Let&apos;s talk.
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-sans mt-2 max-w-md mx-auto">
          Whether you want to build assistive AI, collaborate on mobile systems, or discuss creative engineering — pull a book from my shelf.
        </p>
      </div>

      {/* THE WOODEN BOOKSHELF WITH HOUSEPLANTS (Image 2 Replica!) */}
      <div className="relative max-w-2xl mx-auto pt-16 pb-12 flex flex-col items-center">
        
        {/* Books & Plants Row standing on the shelf */}
        <div className="relative z-10 flex items-end justify-center gap-2 sm:gap-4 px-6 w-full">
          
          {/* Left Plant: Trailing Pothos in Ceramic Pot (Image 2) */}
          <div className="relative flex flex-col items-center group mb-[-2px] shrink-0">
            {/* Trailing Pothos Vines */}
            <div className="relative">
              <span className="text-4xl sm:text-5xl drop-shadow-md">🌿</span>
              {/* Extra trailing leaves hanging below shelf */}
              <div className="absolute -bottom-6 left-1 text-2xl text-emerald-600 drop-shadow rotate-12 pointer-events-none">
                🍃
              </div>
            </div>
            {/* Ceramic Planter Pot */}
            <div className="w-12 h-10 rounded-b-xl rounded-t-sm bg-[#fffbeb] border-2 border-[#d97706]/40 shadow-md flex items-center justify-center text-[10px] text-amber-800">
              🪴
            </div>
          </div>

          {/* Hardcover Books Standing Upright */}
          <div className="flex items-end gap-1 sm:gap-2 mb-[-2px]">
            {books.map((book) => {
              const isHovered = activeBookId === book.id;

              return (
                <a
                  key={book.id}
                  href={book.link}
                  target={book.isExternal ? "_blank" : undefined}
                  rel={book.isExternal ? "noopener noreferrer" : undefined}
                  download={book.isDownload ? "MicaDanahParis_Resume.pdf" : undefined}
                  onMouseEnter={() => handleBookHover(book.id)}
                  onMouseLeave={() => setActiveBookId(null)}
                  onClick={() => playUiClick(true)}
                  style={{
                    transform: isHovered ? "translateY(-18px) scale(1.04)" : "translateY(0) scale(1)",
                    transition: "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  }}
                  className={`relative w-9 sm:w-11 h-44 sm:h-52 rounded-t-md rounded-b-xs ${book.color} ${book.textColor} shadow-lg border-t border-r border-white/30 flex flex-col items-center justify-between py-3 cursor-pointer group`}
                >
                  {/* Embossed Book Spine Ribs */}
                  <div className="w-full flex flex-col gap-1 px-1 opacity-40">
                    <div className="w-full h-0.5 bg-white/60 rounded" />
                    <div className="w-full h-0.5 bg-white/60 rounded" />
                  </div>

                  {/* Vertical Spine Title */}
                  <div
                    className="font-bold font-mono text-xs sm:text-sm tracking-wider uppercase writing-vertical transform rotate-180 my-auto select-none"
                    style={{ writingMode: "vertical-rl" }}
                  >
                    {book.title}
                  </div>

                  {/* Bottom Spine Ribbon Marker */}
                  <div className="w-full flex flex-col items-center gap-1 opacity-50 text-[9px] font-mono">
                    <div className="w-full h-0.5 bg-white/60" />
                    <span>★</span>
                  </div>

                  {/* Slide-out Tooltip Tag Above Book */}
                  {isHovered && (
                    <div className="absolute -top-10 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[10px] font-mono whitespace-nowrap shadow-xl animate-fade-in pointer-events-none">
                      Pull: {book.author}
                    </div>
                  )}
                </a>
              );
            })}
          </div>

          {/* Right Plant: Pilea Peperomioides in Terracotta Pot (Image 2) */}
          <div className="relative flex flex-col items-center mb-[-2px] shrink-0">
            {/* Round Pilea Coin Leaves */}
            <span className="text-4xl sm:text-5xl drop-shadow-md">🪴</span>
            {/* Terracotta Pot */}
            <div className="w-12 h-10 rounded-b-xl rounded-t-sm bg-gradient-to-b from-[#ea580c] to-[#c2410c] border border-amber-800 shadow-md flex items-center justify-center text-[9px] text-amber-200 font-mono font-bold">
              FLORA
            </div>
          </div>

        </div>

        {/* THE WOODEN WALL SHELF (Image 2) */}
        <div className="relative w-full max-w-lg">
          {/* Top Wooden Surface */}
          <div className="w-full h-4 rounded-sm bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#b45309] border-t border-amber-300 shadow-md" />
          
          {/* Wood Shelf Depth & Grain */}
          <div className="w-full h-3 bg-gradient-to-b from-[#92400e] to-[#78350f] rounded-b-sm shadow-xl" />

          {/* Wooden Wall Brackets underneath */}
          <div className="flex justify-between px-10 -mt-1">
            <div className="w-4 h-8 bg-gradient-to-b from-[#78350f] to-[#451a03] rounded-b-md shadow-md" />
            <div className="w-4 h-8 bg-gradient-to-b from-[#78350f] to-[#451a03] rounded-b-md shadow-md" />
          </div>

          {/* Soft Shadow Cast on Wall */}
          <div className="w-full h-6 bg-slate-900/10 rounded-full blur-xl -mt-4 mx-auto" />
        </div>

      </div>

      <div className="text-xs font-mono text-slate-400 mt-2">
        Click any book to open link or email directly: <span className="font-semibold text-slate-700 underline">{PORTFOLIO_DATA.profile.email}</span>
      </div>
    </section>
  );
};

