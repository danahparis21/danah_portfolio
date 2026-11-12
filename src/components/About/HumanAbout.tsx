"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Sprout,
  Cookie,
  Pencil,
  Compass,
  ArrowRight,
} from "lucide-react";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { BLOG_POSTS } from "@/data/blogsData";
import { playUiClick } from "@/utils/sound";

interface HumanAboutProps {
  /** Called with a folder id (e.g. "projects"). Falls back to scrolling to #id. */
  onFolderClick?: (id: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Content (kept short on purpose)                                    */
/* ------------------------------------------------------------------ */
const QUOTE =
  "I am always doing that which I cannot do, in order that I may learn how to do it.";

const OFF_SCREEN = [
  { label: "Travelling & discovering new places", Icon: Compass },
  { label: "Growing plants", Icon: Sprout },
  { label: "Baking warm pastries", Icon: Cookie },
  { label: "Sketching", Icon: Pencil },
];

const STACK = [
  {
    key: "ai",
    title: "AI & ML",
    note: "The part I enjoy most.",
    span: "md:col-span-4",
    items: ["MediaPipe", "MobileNetV2", "LSTM", "TensorFlow", "scikit-learn"],
  },
  {
    key: "frameworks",
    title: "Frameworks",
    span: "md:col-span-2",
    items: ["React Native", "Expo", "React.js", "Laravel", "Tailwind CSS"],
  },
  {
    key: "languages",
    title: "Languages",
    span: "md:col-span-2",
    items: ["Python", "JavaScript", "PHP", "Java", "C++", "HTML/CSS"],
  },
  {
    key: "tools",
    title: "Tools",
    span: "md:col-span-4",
    items: ["Docker", "Figma", "Canva", "MySQL", "Supabase", "Git & GitHub", "XAMPP"],
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Small pieces                                                       */
/* ------------------------------------------------------------------ */
const v = (delay: number, x?: string) =>
  ({ "--d": `${delay}ms`, ...(x ? { "--x": x } : {}) }) as React.CSSProperties;

const FolderIcon: React.FC = () => {
  const uid = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 120 94"
      className="w-full drop-shadow-[0_10px_12px_rgba(236,120,160,0.3)]"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${uid}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f9c0d1" />
          <stop offset="1" stopColor="#f3a6be" />
        </linearGradient>
        <linearGradient id={`${uid}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe0e8" />
          <stop offset="1" stopColor="#ffc2d2" />
        </linearGradient>
      </defs>
      <path
        d="M6 0H38C46 0 48 8 56 8H108A12 12 0 0 1 120 20V82A12 12 0 0 1 108 94H12A12 12 0 0 1 0 82V6A6 6 0 0 1 6 0Z"
        fill={`url(#${uid}b)`}
      />
      <g className="transition-transform duration-300 group-hover:-translate-y-[6px]">
        <rect x="7" y="14" width="106" height="50" rx="7" fill="#ffffff" />
      </g>
      <path
        d="M0 28A12 12 0 0 1 12 16H108A12 12 0 0 1 120 28V82A12 12 0 0 1 108 94H12A12 12 0 0 1 0 82Z"
        fill={`url(#${uid}f)`}
      />
    </svg>
  );
};

/* Headline whose words slide up one by one when it scrolls into view */
const Headline: React.FC<{ words: string[]; accentFrom: number }> = ({
  words,
  accentFrom,
}) => (
  <h2
    data-words
    className="ha-words text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-7xl"
  >
    {words.map((w, i) => (
      <React.Fragment key={w + i}>
        <span className="ha-mask">
          <span
            className={`ha-word ${i >= accentFrom ? "ha-grad" : ""}`}
            style={{ "--i": i } as React.CSSProperties}
          >
            {w}
          </span>
        </span>{" "}
      </React.Fragment>
    ))}
  </h2>
);

export const HumanAbout: React.FC<HumanAboutProps> = ({ onFolderClick }) => {
  const rootRef = useRef<HTMLElement>(null);
  const profile = PORTFOLIO_DATA.profile;
  const [activeBlogIdx, setActiveBlogIdx] = useState(0);
  const [cardTab, setCardTab] = useState<"stories" | "hobbies">("stories");
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const isMouseDown = useRef(false);
  const mouseStartX = useRef<number | null>(null);

  // Auto-swipe infinitely every 4.5 seconds
  useEffect(() => {
    if (cardTab !== "stories" || isHovered) return;
    const timer = setInterval(() => {
      setActiveBlogIdx((prev) => (prev + 1) % BLOG_POSTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [cardTab, isHovered]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    touchStartX.current = null;
    if (Math.abs(deltaX) > 40) {
      if (deltaX > 0) {
        setActiveBlogIdx((prev) => (prev + 1) % BLOG_POSTS.length);
      } else {
        setActiveBlogIdx((prev) => (prev === 0 ? BLOG_POSTS.length - 1 : prev - 1));
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDown.current = true;
    mouseStartX.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isMouseDown.current || mouseStartX.current === null) return;
    const deltaX = mouseStartX.current - e.clientX;
    isMouseDown.current = false;
    mouseStartX.current = null;
    if (Math.abs(deltaX) > 35) {
      if (deltaX > 0) {
        setActiveBlogIdx((prev) => (prev + 1) % BLOG_POSTS.length);
      } else {
        setActiveBlogIdx((prev) => (prev === 0 ? BLOG_POSTS.length - 1 : prev - 1));
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    isMouseDown.current = false;
    mouseStartX.current = null;
  };

  const openFolder = (id: string) => {
    playUiClick(true);
    if (onFolderClick) return onFolderClick(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const reveals = root.querySelectorAll<HTMLElement>("[data-reveal],[data-words]");
    const words = Array.from(root.querySelectorAll<HTMLElement>("[data-w]"));

    if (reduce) {
      reveals.forEach((el) => el.classList.add("is-in"));
      words.forEach((w) => (w.style.opacity = "1"));
      return;
    }

    /* 1. Reveal on scroll (keyframe animations, staggered via --d / --i) */
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));

    /* 2. Scroll-linked effects: parallax, word-by-word quote, growing strap */
    const parallax = Array.from(root.querySelectorAll<HTMLElement>("[data-speed]"));
    const scrub = root.querySelector<HTMLElement>("[data-scrub]");
    const grow = root.querySelector<HTMLElement>("[data-grow]");
    let raf = 0;

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;

      for (const el of parallax) {
        const host = el.parentElement;
        if (!host) continue;
        const r = host.getBoundingClientRect();
        if (r.bottom < -300 || r.top > vh + 300) continue;
        const d = r.top + r.height / 2 - vh / 2;
        const speed = parseFloat(el.dataset.speed || "0");
        const spin = parseFloat(el.dataset.spin || "0");
        const base = parseFloat(el.dataset.base || "0");
        const scale = parseFloat(el.dataset.scale || "1");
        el.style.transform = `translate3d(0, ${(-d * speed).toFixed(1)}px, 0) rotate(${(
          base +
          d * spin
        ).toFixed(2)}deg) scale(${scale})`;
      }

      if (scrub) {
        const r = scrub.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh * 0.88 - r.top) / (vh * 0.5)));
        words.forEach((w, i) => {
          const o = Math.min(1, Math.max(0, p * words.length - i));
          w.style.opacity = (0.16 + 0.84 * o).toFixed(2);
        });
      }

      if (grow) {
        const r = (grow.parentElement as HTMLElement).getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.1)));
        grow.style.transform = `scaleY(${p.toFixed(3)})`;
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      id="about"
      ref={rootRef}
      className="relative scroll-mt-12 overflow-hidden bg-[#f8f8fa] text-slate-800"
    >
      <style>{`
        @keyframes ha-rise { from { opacity: 0; transform: translate3d(var(--x, 0), 40px, 0) scale(.95); filter: blur(8px); } to { opacity: 1; transform: none; filter: blur(0); } }
        @keyframes ha-word { from { transform: translateY(110%); } to { transform: translateY(0); } }
        @keyframes ha-pop  { 0% { opacity: 0; transform: scale(.6) translateY(8px); } 70% { opacity: 1; transform: scale(1.06); } 100% { opacity: 1; transform: none; } }
        @keyframes ha-bob  { 0%,100% { translate: 0 0; } 50% { translate: 0 -10px; } }

        [data-reveal] { opacity: 0; }
        [data-reveal].is-in { opacity: 1; animation: ha-rise .9s cubic-bezier(.2,.8,.2,1) backwards; animation-delay: var(--d, 0ms); }

        .ha-mask { display: inline-block; overflow: hidden; padding: 0 .06em .14em; margin: 0 -.06em -.14em; vertical-align: bottom; }
        .ha-word { display: inline-block; transform: translateY(110%); }
        .ha-words.is-in .ha-word { transform: none; animation: ha-word .95s cubic-bezier(.2,.8,.2,1) backwards; animation-delay: calc(var(--i) * 110ms); }
        .ha-grad { background: linear-gradient(135deg, #0b0b10 10%, #4a1236 50%, #f0568f 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }

        .ha-chip { opacity: 0; }
        .is-in .ha-chip { opacity: 1; animation: ha-pop .6s cubic-bezier(.34,1.56,.64,1) backwards; animation-delay: calc(260ms + var(--i) * 60ms); }
        .ha-bob { animation: ha-bob 7s ease-in-out infinite; }

        .ha-tile {
          position: relative; border-radius: 30px;
          background: linear-gradient(180deg, rgba(255,255,255,.92), rgba(255,255,255,.7));
          border: 1px solid rgba(255,255,255,.9);
          box-shadow: 0 0 0 1px rgba(15,23,42,.06), 0 1px 0 #fff inset, 0 26px 40px -26px rgba(76,57,120,.3);
          -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px);
          transition: transform .4s cubic-bezier(.34,1.4,.5,1), box-shadow .3s;
        }
        .ha-tile:hover { transform: translateY(-4px); box-shadow: 0 0 0 1px rgba(15,23,42,.06), 0 1px 0 #fff inset, 0 34px 46px -26px rgba(76,57,120,.38); }

        .ha-pill {
          position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: .4rem;
          border-radius: 9999px; border: 1px solid rgba(148,163,184,.55); padding: .35rem .8rem;
          font-size: 12.5px; font-weight: 500; color: #334155; white-space: nowrap;
          background: linear-gradient(180deg, #fff, #f1f2f5);
          box-shadow: inset 0 1px 1px #fff, inset 0 -1px 2px rgba(15,23,42,.07), 0 4px 10px -6px rgba(15,23,42,.3);
          transition: transform .15s, filter .15s;
        }
        .ha-pill > * { position: relative; z-index: 1; }
        .ha-pill-pink {
          color: #4a1230; border-color: rgba(224,98,143,.7); text-shadow: 0 1px 0 rgba(255,255,255,.55);
          background: linear-gradient(180deg, #ffc9db 0%, #ff9bbd 48%, #fb7fa9 52%, #ffa8c6 100%);
          box-shadow: inset 0 1px 1px rgba(255,255,255,.9), inset 0 -1px 2px rgba(190,40,100,.25), 0 8px 16px -6px rgba(244,114,182,.6);
        }
        .ha-pill-pink::before { content: ""; position: absolute; z-index: 0; left: 12px; right: 12px; top: 3px; height: 44%; border-radius: 9999px; background: linear-gradient(180deg, rgba(255,255,255,.75), rgba(255,255,255,.05)); }
        .ha-btn { padding: .75rem 1.5rem; font-size: 15px; }
        button.ha-pill:active, a.ha-pill:active { transform: translateY(1px); filter: brightness(.96); }

        @media (prefers-reduced-motion: reduce) {
          [data-reveal] { opacity: 1; }
          [data-reveal].is-in, .ha-words.is-in .ha-word, .is-in .ha-chip, .ha-bob { animation: none; }
          .ha-word, .ha-chip { opacity: 1; transform: none; }
        }
      `}</style>

      {/* Ambient blush gradient (dotted pattern removed) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 82% 14%, rgba(255,214,230,0.25), transparent 45%), radial-gradient(circle at 12% 62%, rgba(255,214,230,0.18), transparent 45%)",
          backgroundSize: "100% 100%, 100% 100%",
        }}
      />

      {/* folders drifting at different speeds (parallax) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
        {[
          { cls: "right-[7%] top-[5%] w-20", speed: 0.14, base: 8 },
          { cls: "left-[2%] top-[30%] w-16", speed: -0.1, base: -12 },
          { cls: "right-[3%] top-[56%] w-24", speed: 0.2, base: 6 },
          { cls: "left-[5%] top-[80%] w-16", speed: 0.12, base: 3 },
        ].map((f, i) => (
          <div key={i} className={`absolute ${f.cls}`}>
            <div data-speed={f.speed} data-base={f.base} data-spin="0.01" className="ha-bob will-change-transform" style={{ animationDelay: `${i * -1.7}s` }}>
              <FolderIcon />
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-16 sm:pt-20">
        {/* ------------------------- Chapter 1: about me ------------------------- */}
        <div className="space-y-4">
          <span data-reveal className="ha-pill" style={v(0)}>
            <span className="h-2 w-2 rounded-full bg-pink-400" />
            <span>About me</span>
          </span>
          <Headline words={["Hi,", "I'm", "Danah."]} accentFrom={2} />
          <p data-reveal className="max-w-md text-lg text-slate-500" style={v(450)}>
            I build AI-powered apps that feel human to use.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:auto-rows-[200px] md:grid-cols-4">
          {/* photo */}
          <div data-reveal className="ha-tile min-h-[420px] overflow-hidden md:col-span-2 md:row-span-2" style={v(0, "-40px")}>
            <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
              <div data-speed="0.07" data-scale="1.16" className="absolute inset-0 will-change-transform">
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover object-top"
                />
              </div>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
            <span className="ha-pill ha-pill-pink absolute left-5 top-5"><span>Me</span></span>
            <span className="ha-pill absolute bottom-5 left-5">
              <MapPin className="h-3.5 w-3.5 text-pink-500" />
              <span>Batangas, Philippines</span>
            </span>
          </div>

          {/* bio */}
          <div data-reveal className="ha-tile flex flex-col justify-center p-7 md:col-span-2" style={v(120, "40px")}>
            <p className="text-xl font-semibold leading-snug tracking-tight text-slate-900 sm:text-2xl">
              Building intuitive applications with technology and people in mind.
            </p>
            <p className="mt-2.5 text-[15px] leading-relaxed text-slate-500">
              I enjoy exploring new technologies, solving problems, and developing applications that are functional, intuitive, and thoughtfully designed.
            </p>
          </div>

          {/* AI as a tool */}
          <div data-reveal className="ha-tile flex h-full min-h-[200px] flex-col justify-between p-5 sm:p-6" style={v(240)}>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-pink-400" />
              <span className="text-sm font-semibold text-slate-900">AI as a tool</span>
            </div>
            <p className="text-[13.5px] sm:text-[14px] leading-relaxed text-slate-600">
              Using AI to explore possibilities and bring ideas to life. I like experimenting, asking questions, and finding the cleanest solution for real users.
            </p>
          </div>

          {/* Stories & Hobbies Card (Full-bleed Background Image with Mouse/Touch Swipe & Infinite Auto-swipe) */}
          <div
            data-reveal
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="ha-tile relative flex h-full min-h-[200px] flex-col justify-between overflow-hidden p-5 sm:p-6 cursor-grab active:cursor-grabbing select-none"
            style={v(360)}
          >
            {cardTab === "stories" ? (
              <>
                {/* Full-bleed Background Image */}
                <Image
                  key={BLOG_POSTS[activeBlogIdx].id}
                  src={BLOG_POSTS[activeBlogIdx].image}
                  alt={BLOG_POSTS[activeBlogIdx].title}
                  fill
                  sizes="(min-width: 768px) 30vw, 100vw"
                  className="object-cover object-center transition-all duration-700 ease-out"
                />

                {/* Dark Vignette Overlay for readable text */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/35 z-1" />

                {/* Top Controls: Tab Switcher & Progress Bars */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-md p-0.5 border border-white/20">
                    <button
                      type="button"
                      onClick={() => setCardTab("stories")}
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold transition bg-white text-slate-900 shadow-xs"
                    >
                      Stories
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardTab("hobbies")}
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold transition text-white/80 hover:text-white"
                    >
                      Hobbies
                    </button>
                  </div>

                  {/* Infinite Story Progress Indicators */}
                  <div className="flex items-center gap-1.5">
                    {BLOG_POSTS.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveBlogIdx(idx)}
                        aria-label={`Go to story ${idx + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          idx === activeBlogIdx
                            ? "w-5 bg-white shadow-xs"
                            : "w-1.5 bg-white/40 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Bottom Story Content Overlay (Clean Headline & Subtitle without chips) */}
                <div className="relative z-10 mt-auto pt-4 space-y-1.5">
                  <h4 className="text-[15px] sm:text-[16px] font-bold text-white leading-snug drop-shadow-sm">
                    &ldquo;{BLOG_POSTS[activeBlogIdx].title}&rdquo;
                  </h4>

                  <p className="text-[12px] text-white/80 line-clamp-1 leading-normal">
                    {BLOG_POSTS[activeBlogIdx].subtitle}
                  </p>

                  <div className="pt-1.5 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-white/60">
                      {BLOG_POSTS[activeBlogIdx].readTime}
                    </span>
                    <Link
                      href={`/blogs#${BLOG_POSTS[activeBlogIdx].slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-pink-300 hover:text-white transition"
                    >
                      <span>Read Story</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Hobbies View */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-0.5">
                    <button
                      type="button"
                      onClick={() => setCardTab("stories")}
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold transition text-slate-500 hover:text-slate-900"
                    >
                      Stories
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardTab("hobbies")}
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold transition bg-slate-900 text-white shadow-2xs"
                    >
                      Hobbies
                    </button>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Personal</span>
                </div>

                <div className="my-auto py-2">
                  <ul className="space-y-2 text-xs sm:text-[13px] text-slate-700">
                    {OFF_SCREEN.map(({ label, Icon }) => (
                      <li key={label} className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-pink-50 text-pink-500 shrink-0">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-medium text-slate-800">{label}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-400">
                  Off-screen interests &amp; creativity
                </div>
              </>
            )}
          </div>

          {/* quote: words light up as you scroll */}
          <div
            data-reveal
            className="ha-tile flex flex-col justify-center gap-4 overflow-hidden bg-gradient-to-br from-pink-50/90 to-white/80 p-8 md:col-span-4 md:px-12"
            style={v(0)}
          >
            <span aria-hidden className="absolute -top-3 left-6 select-none font-serif text-[9rem] leading-none text-pink-200/80">&ldquo;</span>
            <p data-scrub className="relative max-w-3xl font-serif text-2xl italic leading-snug text-slate-900 sm:text-3xl">
              {QUOTE.split(" ").map((w, i) => (
                <span key={i} data-w className="inline-block" style={{ opacity: 0.16 }}>
                  {w}&nbsp;
                </span>
              ))}
            </p>
            <span className="ha-pill self-start"><span>Pablo Picasso</span></span>
          </div>
        </div>

        {/* strap that grows as you scroll to the next chapter */}
        <div className="mx-auto my-6 flex h-28 w-[22px] flex-col items-center sm:my-8">
          <div
            data-grow
            className="h-full w-full origin-top rounded-b-full"
            style={{
              transform: "scaleY(0)",
              background:
                "repeating-linear-gradient(180deg, rgba(255,255,255,.55) 0 5px, transparent 5px 11px) center/2px 100% no-repeat, #f8c6d6",
              boxShadow: "inset 0 0 0 1px #e79ab5",
            }}
          />
        </div>

        {/* ------------------------- Chapter 2: tech stack ------------------------- */}
        <div id="tech-stack" className="scroll-mt-16 space-y-4">
          <span data-reveal className="ha-pill" style={v(0)}>
            <span className="h-2 w-2 rounded-full bg-pink-400" />
            <span>Tech stack</span>
          </span>
          <Headline words={["What's", "in", "my", "toolbox"]} accentFrom={3} />
          <p data-reveal className="max-w-md text-lg text-slate-500" style={v(450)}>
            The things I reach for most.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-6">
          {STACK.map((s, i) => (
            <div
              key={s.key}
              data-reveal
              className={`ha-tile group p-7 ${s.span}`}
              style={v(i % 2 === 0 ? 0 : 140, i % 2 === 0 ? "-30px" : "30px")}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 origin-bottom -rotate-3 transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:rotate-0 group-hover:scale-110">
                  <FolderIcon />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900">{s.title}</h3>
                  {"note" in s && <p className="text-sm text-slate-500">{s.note}</p>}
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {s.items.map((it, j) => (
                  <span key={it} className="ha-pill ha-chip" style={{ "--i": j } as React.CSSProperties}>
                    <span>{it}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};