"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronsUp,
  Globe,
  FolderOpen,
  Flower2,
} from "lucide-react";
import { GithubIcon } from "@/components/UI/Icons";
import { PORTFOLIO_DATA, Project } from "@/data/portfolioData";
import { SecretGardenInWindow } from "@/components/Garden/DanahSecretGarden";

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */
/** Projects that also have a phone version. When your mobile recording is ready,
 *  put its path here (e.g. "/videos/senas-mobile.mp4"). `null` shows a clean placeholder. */
const MOBILE_DEMOS: Record<string, string | null> = {
  senas: null,
  "ai-reviewer": null,
};

/* ------------------------------------------------------------------ */
/*  Small pieces                                                       */
/* ------------------------------------------------------------------ */
const FolderIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-5 shrink-0" }) => {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 120 94" className={className} aria-hidden>
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
      <rect x="7" y="14" width="106" height="50" rx="7" fill="#ffffff" />
      <path
        d="M0 28A12 12 0 0 1 12 16H108A12 12 0 0 1 120 28V82A12 12 0 0 1 108 94H12A12 12 0 0 1 0 82Z"
        fill={`url(#${uid}f)`}
      />
    </svg>
  );
};

const TrafficLights: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center gap-2 ${className}`} aria-hidden>
    <span className="h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-black/10" />
    <span className="h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-black/10" />
    <span className="h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-black/10" />
  </div>
);

/* ------------------------------------------------------------------ */
/*  Main Component: Single Window with Tabbed Projects                */
/* ------------------------------------------------------------------ */
export const ProjectsScrollStory: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const projects = PORTFOLIO_DATA.projects as Project[];
  const [activeIdx, setActiveIdx] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const phoneRef = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  // True only while the Projects section is actually on screen (gates all video playback)
  const isInView = useRef(false);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  const currentProject = projects[activeIdx] ?? projects[0];
  const hasPhone = currentProject.id in MOBILE_DEMOS;
  const phoneSrc = MOBILE_DEMOS[currentProject.id];
  const metrics = currentProject.metrics ?? [];
  const isSecretGarden = currentProject.id === "secret-garden";

  // Videos only decode while the Projects section is on screen:
  // they start when it enters the viewport and pause the moment it leaves.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        isInView.current = entry.isIntersecting;
        const v = videoRef.current;
        const p = phoneRef.current;
        if (!entry.isIntersecting) {
          if (v && !v.paused) v.pause();
          if (p && !p.paused) p.pause();
        } else {
          if (v && v.paused && !userPaused.current) v.play().catch(() => { });
          if (p && p.paused && !userPaused.current) p.play().catch(() => { });
        }
      },
      { threshold: 0 }
    );

    io.observe(section);
    return () => io.disconnect();
  }, []);

  // Reset video playback on project switch. Playback only starts if the
  // Projects section is on screen; otherwise the new video stays idle.
  useEffect(() => {
    userPaused.current = false;
    const canPlay = isInView.current;
    setPlaying(canPlay);
    const web = videoRef.current;
    if (web) {
      web.currentTime = 0;
      if (canPlay) web.play().catch(() => { });
      else web.pause();
    }
    const phone = phoneRef.current;
    if (phone) {
      phone.currentTime = 0;
      if (canPlay) phone.play().catch(() => { });
      else phone.pause();
    }
  }, [activeIdx]);

  // Listen for open-project-tab event from navigation or hero folders
  useEffect(() => {
    const handleOpenTab = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        const idx = projects.findIndex((p) => p.id === customEvent.detail);
        if (idx !== -1) setActiveIdx(idx);
      }
    };
    window.addEventListener("open-project-tab", handleOpenTab);
    return () => window.removeEventListener("open-project-tab", handleOpenTab);
  }, [projects]);

  // Handle play/pause toggle
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      v.play().catch(() => { });
      setPlaying(true);
    } else {
      userPaused.current = true;
      v.pause();
      setPlaying(false);
    }
  };

  // Handle mute/unmute toggle
  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !muted;
    setMuted(!muted);
  };

  /* ---------------- Infinite navigation + idle hint ---------------- */
  const n = projects.length;
  const [slide, setSlide] = useState<"next" | "prev">("next");
  const [isTouch, setIsTouch] = useState(false);

  // The hint shows while the visitor is idle and hides the moment they interact.
  const [hintOn, setHintOn] = useState(false);
  const hintOnRef = useRef(false);
  const inViewRef = useRef(false);
  const idleTimer = useRef<number | null>(null);
  const IDLE_FIRST = 1800; // first appearance after the section enters the screen
  const IDLE_AFTER = 6500; // re-appears after this much quiet time

  const showHint = useCallback((v: boolean) => {
    if (hintOnRef.current !== v) {
      hintOnRef.current = v;
      setHintOn(v);
    }
  }, []);
  const armHint = useCallback(
    (ms: number) => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => {
        if (inViewRef.current) showHint(true);
      }, ms);
    },
    [showHint]
  );
  const bump = useCallback(() => {
    showHint(false);
    armHint(IDLE_AFTER);
  }, [showHint, armHint]);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none) and (pointer: coarse)");
    const update = () => setIsTouch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          armHint(IDLE_FIRST);
        } else {
          showHint(false);
          if (idleTimer.current) window.clearTimeout(idleTimer.current);
        }
      },
      { threshold: 0.35 }
    );
    io.observe(section);
    return () => {
      io.disconnect();
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, [armHint, showHint]);

  // dir = +1 goes to the next project, -1 to the previous one. Wraps around forever.
  const step = useCallback(
    (dir: 1 | -1) => {
      setSlide(dir === 1 ? "next" : "prev");
      setActiveIdx((prev) => (prev + dir + n) % n);
      bump();
    },
    [n, bump]
  );

  const goTo = (i: number) => {
    if (i < 0 || i >= n || i === activeIdx) return;
    setSlide(i > activeIdx ? "next" : "prev");
    setActiveIdx(i);
    bump();
  };

  /* ---------------- Wheel: only inside the project window ---------------- */
  // While the pointer is over the content area the page never scrolls; one
  // gesture = one project. Trackpad inertia is swallowed so it can't skip ahead.
  const zoneRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = zoneRef.current;
    if (!el) return;
    let acc = 0;
    let lastEvt = 0;
    let lockUntil = 0;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-zoom
      const dy =
        e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;
      if (Math.abs(e.deltaX) > Math.abs(dy)) return; // horizontal gesture

      // Let the description box scroll first when it still has room
      const inner = (e.target as HTMLElement | null)?.closest<HTMLElement>(".pj-desc");
      if (inner && inner.scrollHeight > inner.clientHeight + 1) {
        const atTop = inner.scrollTop <= 0;
        const atBottom = inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 1;
        if ((dy > 0 && !atBottom) || (dy < 0 && !atTop)) return;
      }

      e.preventDefault(); // the page stays put while you browse projects

      const now = performance.now();
      if (now < lockUntil) {
        lockUntil = Math.max(lockUntil, now + 160); // still coasting: keep ignoring
        return;
      }
      if (now - lastEvt > 180) acc = 0;
      lastEvt = now;
      acc += dy;
      if (Math.abs(acc) < 36) return;

      const dir = acc > 0 ? 1 : -1;
      acc = 0;
      lockUntil = now + 700;
      step(dir);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [step]);

  /* ---------------- Touch: swipe inside the window, with live feedback ---------------- */
  // The Secret Garden is skipped completely so drawing never counts as a swipe.
  const bodyRef = useRef<HTMLDivElement>(null);
  const pullNextRef = useRef<HTMLDivElement>(null);
  const pullPrevRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = zoneRef.current;
    if (!el || isSecretGarden) return;

    const THRESH = 64;
    let sx = 0;
    let sy = 0;
    let st = 0;
    let dy = 0;
    let tracking = false;
    let dragging = false;

    const hidePulls = () => {
      [pullNextRef.current, pullPrevRef.current].forEach((p) => {
        if (p) {
          p.style.opacity = "0";
          p.dataset.ready = "false";
        }
      });
    };
    const reset = (animate: boolean) => {
      const b = bodyRef.current;
      if (b) {
        b.style.transition = animate
          ? "transform .25s cubic-bezier(.2,.8,.2,1), opacity .25s"
          : "none";
        b.style.transform = "";
        b.style.opacity = "";
        if (animate) window.setTimeout(() => { b.style.transition = ""; }, 280);
      }
      hidePulls();
    };

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        tracking = false;
        return;
      }
      const t = e.target as HTMLElement | null;
      if (t?.closest(".pj-desc, [data-no-swipe]")) {
        tracking = false;
        return;
      }
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      st = Date.now();
      dy = 0;
      tracking = true;
      dragging = false;
    };

    const onMove = (e: TouchEvent) => {
      if (!tracking) return;
      const t = e.touches[0];
      const dx = t.clientX - sx;
      dy = t.clientY - sy;
      if (!dragging) {
        if (Math.abs(dx) > 14 && Math.abs(dx) > Math.abs(dy)) {
          tracking = false; // horizontal: not ours
          return;
        }
        if (Math.abs(dy) > 8 && Math.abs(dy) >= Math.abs(dx)) dragging = true;
      }
      if (!dragging) return;
      if (e.cancelable) e.preventDefault();

      // The content follows your finger a little and the "next / previous" pill fills up
      const damped = Math.sign(dy) * Math.min(110, Math.abs(dy) * 0.45);
      const b = bodyRef.current;
      if (b) {
        b.style.transition = "none";
        b.style.transform = `translate3d(0,${damped}px,0)`;
        b.style.opacity = String(1 - Math.min(0.4, Math.abs(dy) / 320));
      }
      const p = Math.min(1, Math.abs(dy) / THRESH);
      const show = dy < 0 ? pullNextRef.current : pullPrevRef.current;
      const hide = dy < 0 ? pullPrevRef.current : pullNextRef.current;
      if (hide) hide.style.opacity = "0";
      if (show) {
        show.style.opacity = String(p);
        show.style.transform = `translate(-50%, ${(1 - p) * (dy < 0 ? 12 : -12)}px) scale(${0.92 + 0.08 * p})`;
        show.dataset.ready = String(p >= 1);
      }
    };

    const onEnd = () => {
      if (!tracking) return;
      tracking = false;
      if (!dragging) return;
      dragging = false;
      const v = Math.abs(dy) / Math.max(1, Date.now() - st);
      const commit = Math.abs(dy) >= THRESH || (Math.abs(dy) > 28 && v > 0.55);
      if (commit) {
        reset(false);
        step(dy < 0 ? 1 : -1); // finger up = scroll down = next project
      } else {
        reset(true);
      }
    };
    const onCancel = () => {
      tracking = false;
      dragging = false;
      reset(true);
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onCancel);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onCancel);
    };
  }, [isSecretGarden, step]);

  /* Keep the active chip centered in the mobile tab row (it can wrap around now) */
  const mobileTabsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const c = mobileTabsRef.current;
    const chip = c?.children[activeIdx] as HTMLElement | undefined;
    if (!c || !chip) return;
    c.scrollTo({ left: chip.offsetLeft - (c.clientWidth - chip.offsetWidth) / 2, behavior: "smooth" });
  }, [activeIdx]);

  /* Where the hint cursor starts and where it clicks (the next tab) */
  const sideRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const navNextRef = useRef<HTMLButtonElement>(null);
  const [hintGeo, setHintGeo] = useState<{ sx: number; sy: number; tx: number; ty: number } | null>(null);
  useEffect(() => {
    if (!hintOn) return;
    const art = articleRef.current;
    if (!art) return;
    const a = art.getBoundingClientRect();
    const isLg = window.matchMedia("(min-width: 1024px)").matches;
    const tgt = isLg ? sideRefs.current[(activeIdx + 1) % n] : navNextRef.current;
    if (!tgt) return;
    const t = tgt.getBoundingClientRect();
    const tx = t.left - a.left + Math.min(t.width * 0.6, 130);
    const ty = t.top - a.top + t.height * 0.55;
    const src = isLg ? sideRefs.current[activeIdx] : null;
    let sx = tx + 120;
    let sy = ty + 90;
    if (src) {
      const s = src.getBoundingClientRect();
      sx = s.left - a.left + s.width * 0.5;
      sy = s.top - a.top + s.height * 0.5;
    }
    setHintGeo({ sx, sy, tx, ty });
  }, [hintOn, activeIdx, n]);

  const nextProject = projects[(activeIdx + 1) % n];
  const prevProject = projects[(activeIdx - 1 + n) % n];

  // Entrance reveal animations
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveals = section.querySelectorAll<HTMLElement>("[data-reveal],[data-words]");

    if (reduce) {
      reveals.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
    );
    reveals.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, []);

  const links = [
    ...(currentProject.liveUrl
      ? [{ label: "Live Platform", url: currentProject.liveUrl, live: true }]
      : []),
    ...(currentProject.githubUrls ?? []).map((r) => ({ label: r.label, url: r.url, live: false })),
  ];
  const repoLinks = links.filter((l) => !l.live);

  const headline = ["Things", "I've", "built."];

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative scroll-mt-12 bg-[#f8f8fa] py-12 sm:py-18 flex flex-col justify-center items-center min-h-[90vh]"
    >
      <style>{`
        @keyframes pj-rise { from { opacity: 0; transform: translate3d(0, 24px, 0) scale(.98); filter: blur(4px); } to { opacity: 1; transform: none; filter: blur(0); } }
        @keyframes pj-pop  { 0% { opacity: 0; transform: scale(.7) translateY(10px); } 70% { opacity: 1; transform: scale(1.03); } 100% { opacity: 1; transform: none; } }
        @keyframes pj-phone { from { opacity: 0; transform: translate3d(30px, 15px, 0) rotate(8deg); } to { opacity: 1; transform: rotate(3deg); } }
        @keyframes pj-bob  { 0%,100% { translate: 0 0; } 50% { translate: 0 -4px; } }
        @keyframes pj-word { from { transform: translateY(110%); } to { transform: translateY(0); } }
        @keyframes pj-crossfade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

        [data-reveal] { opacity: 0; }
        [data-reveal].is-in { opacity: 1; }
        .pj-wrap.is-in { animation: pj-rise .7s cubic-bezier(.2,.8,.2,1) backwards; }

        .pj-laptop, .pj-tile, .pj-fade { opacity: 0; }
        .is-in .pj-laptop { opacity: 1; animation: pj-rise .8s cubic-bezier(.2,.8,.2,1) backwards .12s; }
        .is-in .pj-fade   { opacity: 1; animation: pj-rise .6s cubic-bezier(.2,.8,.2,1) backwards .04s; }
        .is-in .pj-tile   { opacity: 1; animation: pj-pop .5s cubic-bezier(.34,1.56,.64,1) backwards, pj-bob 6s ease-in-out infinite; animation-delay: calc(.18s + var(--i) * .06s), calc(1.2s + var(--i) * .5s); }
        .pj-phone { opacity: 0; transform: rotate(3deg); }
        .is-in .pj-phone { opacity: 1; animation: pj-phone .7s cubic-bezier(.2,.8,.2,1) backwards .3s; }

        .pj-slide-next { animation: pj-slide-next .42s cubic-bezier(.16,1,.3,1) backwards; }
        .pj-slide-prev { animation: pj-slide-prev .42s cubic-bezier(.16,1,.3,1) backwards; }
        @keyframes pj-slide-next { from { opacity: 0; transform: translate3d(0, 40px, 0); } to { opacity: 1; transform: none; } }
        @keyframes pj-slide-prev { from { opacity: 0; transform: translate3d(0, -40px, 0); } to { opacity: 1; transform: none; } }

        /* Description box still scrolls by touch even though the window captures swipes */
        .pj-desc { touch-action: pan-y; overscroll-behavior: contain; }

        /* Live swipe indicators (filled in while a finger is dragging) */
        .pj-pull {
          position: absolute; left: 50%; z-index: 30; opacity: 0; pointer-events: none;
          transform: translate(-50%, 12px);
          display: inline-flex; align-items: center; gap: .4rem; white-space: nowrap;
          border-radius: 9999px; padding: .4rem .8rem; font-size: 12px; font-weight: 600;
          color: #334155; background: rgba(255,255,255,.96); border: 1px solid rgba(148,163,184,.5);
          box-shadow: 0 8px 18px -8px rgba(15,23,42,.35);
        }
        .pj-pull[data-ready="true"] { color: #fff; background: #ec4899; border-color: #ec4899; }

        /* Idle hint: a cursor glides to the next tab and clicks it */
        .pj-hint-cursor {
          position: absolute; left: 0; top: 0; opacity: 0;
          animation: pj-hint-move 4.6s cubic-bezier(.4,0,.2,1) infinite;
        }
        .pj-hint-ring {
          position: absolute; left: -18px; top: -18px; width: 36px; height: 36px;
          border-radius: 9999px; border: 2px solid #ec4899; opacity: 0;
          transform: translate(var(--tx), var(--ty));
          animation: pj-hint-ring 4.6s ease-out infinite;
        }
        .pj-hint-bubble {
          position: absolute; left: 16px; top: 22px; width: 208px; opacity: 0;
          animation: pj-hint-bubble 4.6s ease infinite;
        }
        @keyframes pj-hint-move {
          0%   { opacity: 0; transform: translate(var(--sx), var(--sy)); }
          10%  { opacity: 1; }
          50%  { opacity: 1; transform: translate(var(--tx), var(--ty)); }
          56%  { transform: translate(var(--tx), var(--ty)) scale(.82); }
          62%  { transform: translate(var(--tx), var(--ty)) scale(1); }
          90%  { opacity: 1; transform: translate(var(--tx), var(--ty)); }
          100% { opacity: 0; transform: translate(var(--tx), var(--ty)); }
        }
        @keyframes pj-hint-ring {
          0%, 55% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(.3); }
          58%     { opacity: .9; transform: translate(var(--tx), var(--ty)) scale(.5); }
          78%, 100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(1.7); }
        }
        @keyframes pj-hint-bubble {
          0%, 40% { opacity: 0; transform: translateY(6px) scale(.94); }
          50%, 90% { opacity: 1; transform: none; }
          100% { opacity: 0; transform: none; }
        }
        @keyframes pj-wheel { 0% { transform: translateY(0); opacity: 1; } 70% { transform: translateY(6px); opacity: 0; } 100% { transform: translateY(0); opacity: 0; } }
        @keyframes pj-bob-up { 0%,100% { transform: translateY(2px); } 50% { transform: translateY(-3px); } }
        .pj-wheel-dot { animation: pj-wheel 1.4s ease-in-out infinite; }
        .pj-bob-up { animation: pj-bob-up 1s ease-in-out infinite; }

        .pj-mask { display: inline-block; overflow: hidden; padding: 0 .06em .14em; margin: 0 -.06em -.14em; vertical-align: bottom; }
        .pj-word { display: inline-block; transform: translateY(110%); }
        .pj-words.is-in .pj-word { transform: none; animation: pj-word .9s cubic-bezier(.2,.8,.2,1) backwards; animation-delay: calc(var(--i) * 110ms); }
        .pj-grad { background: linear-gradient(135deg, #0b0b10 10%, #4a1236 50%, #f0568f 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }

        /* Frosted-glass Finder window */
        .pj-win {
          transform-origin: top center;
          background: linear-gradient(180deg, rgba(255,255,255,.82), rgba(255,255,255,.6));
          -webkit-backdrop-filter: blur(28px) saturate(1.5); backdrop-filter: blur(28px) saturate(1.5);
          border: 1px solid rgba(255,255,255,.9);
          box-shadow: 0 0 0 1px rgba(15,23,42,.06), inset 0 1px 0 rgba(255,255,255,.95), 0 28px 56px -22px rgba(76,57,120,.24);
        }
        .pj-side { background: rgba(255,255,255,.4); border-right: 1px solid rgba(255,255,255,.75); }
        .pj-nav { background: linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,.65)); border: 1px solid rgba(255,255,255,.9); box-shadow: 0 0 0 1px rgba(15,23,42,.06), 0 4px 10px -6px rgba(15,23,42,.2); }
        .pj-tile { border-radius: 16px; padding: .65rem .8rem; background: linear-gradient(180deg, rgba(255,255,255,.9), rgba(255,255,255,.65)); border: 1px solid rgba(255,255,255,.95); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); box-shadow: 0 0 0 1px rgba(15,23,42,.05), inset 0 1px 0 #fff, 0 10px 20px -14px rgba(76,57,120,.3); }
        .pj-ctl { display: flex; align-items: center; justify-content: center; height: 26px; width: 26px; border-radius: 9999px; color: #fff; background: rgba(255,255,255,.25); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,.4); transition: background .2s; }
        .pj-ctl:hover { background: rgba(255,255,255,.4); }

        .pj-pill {
          position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: .4rem;
          border-radius: 9999px; border: 1px solid rgba(148,163,184,.55); padding: .4rem .85rem;
          font-size: 13px; font-weight: 500; color: #334155; white-space: nowrap;
          background: linear-gradient(180deg, #fff, #f1f2f5);
          box-shadow: inset 0 1px 1px #fff, inset 0 -1px 2px rgba(15,23,42,.07), 0 4px 10px -6px rgba(15,23,42,.25);
          transition: transform .15s, filter .15s;
        }
        .pj-pill > * { position: relative; z-index: 1; }
        .pj-chip { padding: .24rem .65rem; font-size: 11.5px; }
        .pj-pill-pink { color: #4a1230; border-color: rgba(224,98,143,.7); text-shadow: 0 1px 0 rgba(255,255,255,.55); background: linear-gradient(180deg, #ffc9db 0%, #ff9bbd 48%, #fb7fa9 52%, #ffa8c6 100%); box-shadow: inset 0 1px 1px rgba(255,255,255,.9), inset 0 -1px 2px rgba(190,40,100,.25), 0 6px 14px -5px rgba(244,114,182,.55); }
        .pj-pill-pink::before { content: ""; position: absolute; z-index: 0; left: 10px; right: 10px; top: 2px; height: 44%; border-radius: 9999px; background: linear-gradient(180deg, rgba(255,255,255,.75), rgba(255,255,255,.05)); }
        a.pj-pill:active { transform: translateY(1px); filter: brightness(.96); }

        /* Custom subtle scrollbar for description */
        .pj-desc::-webkit-scrollbar { width: 4px; }
        .pj-desc::-webkit-scrollbar-track { background: transparent; }
        .pj-desc::-webkit-scrollbar-thumb { background: rgba(244,114,182,0.45); border-radius: 9999px; }
        .pj-desc::-webkit-scrollbar-thumb:hover { background: rgba(244,114,182,0.85); }

        @media (prefers-reduced-motion: reduce) {
          .pj-wrap.is-in, .is-in .pj-laptop, .is-in .pj-fade, .is-in .pj-tile, .is-in .pj-phone, .pj-words.is-in .pj-word { animation: none; }
          .pj-laptop, .pj-tile, .pj-fade, .pj-phone { opacity: 1; }
          .pj-slide-next, .pj-slide-prev, .pj-wheel-dot, .pj-bob-up, .pj-hint-ring { animation: none; }
          .pj-hint-cursor { animation: none; opacity: 1; transform: translate(var(--tx), var(--ty)); }
          .pj-hint-bubble { animation: none; opacity: 1; }
          .pj-word { transform: none; }
        }
      `}</style>

      {/* Dotted desktop pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(15,23,42,0.15) 1.3px, transparent 1.5px)",
          backgroundSize: "34px 34px",
        }}
      />

      {/* Soft color blobs for glassmorphism */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden hidden md:block">
        <div className="absolute left-[-6%] top-[10%] h-[380px] w-[380px] rounded-full bg-[#ffc9dc] opacity-35 blur-3xl" />
        <div className="absolute right-[-8%] top-[25%] h-[420px] w-[420px] rounded-full bg-[#d9ccff] opacity-35 blur-3xl" />
        <div className="absolute left-[10%] top-[55%] h-[360px] w-[360px] rounded-full bg-[#c9e4ff] opacity-35 blur-3xl" />
        <div className="absolute right-[4%] top-[75%] h-[340px] w-[340px] rounded-full bg-[#ffe3cc] opacity-35 blur-3xl" />
      </div>

      {/* Main Container — Uniform max-w-6xl matching About Me section */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4">

        {/* Section Header */}
        <div className="mb-5 sm:mb-6 flex flex-wrap items-baseline justify-between gap-3 px-1">
          <div className="space-y-1.5">
            <span data-reveal className="pj-pill pj-chip">
              <span className="h-2 w-2 rounded-full bg-pink-400" />
              <span>Featured Work</span>
            </span>
            <h2
              data-words
              className="pj-words text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900"
            >
              {headline.map((w, i) => (
                <React.Fragment key={w}>
                  <span className="pj-mask">
                    <span
                      className={`pj-word ${i === headline.length - 1 ? "pj-grad" : ""}`}
                      style={{ "--i": i } as React.CSSProperties}
                    >
                      {w}
                    </span>
                  </span>{" "}
                </React.Fragment>
              ))}
            </h2>
          </div>
          <p data-reveal className="hidden sm:block text-xs sm:text-sm text-slate-400 font-medium">
            {isTouch
              ? "Swipe up inside the window to explore each project"
              : "Scroll inside the window to explore each project"}
          </p>
        </div>

        {/* ── Single Window with Sidebar & Tabbed Contents ── */}
        <div data-reveal className="pj-wrap">
          <article
            ref={articleRef}
            onPointerDownCapture={bump}
            className="pj-win relative overflow-hidden rounded-[24px] lg:grid lg:grid-cols-[210px_1fr]"
          >

            {/* ---------------- Sidebar (large screens) ---------------- */}
            <aside className="pj-side hidden flex-col gap-5 p-5 pt-6 lg:flex" style={{ minHeight: 0 }}>
              <TrafficLights />

              <div>
                <div className="mb-1.5 px-2 text-[12px] font-semibold uppercase tracking-wider text-slate-400">
                  Projects
                </div>
                <ul className="space-y-1">
                  {projects.map((p, i) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        ref={(el) => {
                          sideRefs.current[i] = el;
                        }}
                        onClick={() => goTo(i)}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13.5px] font-medium transition ${i === activeIdx
                            ? "bg-white/95 text-slate-900 shadow-[0_1px_0_#fff_inset,0_0_0_1px_rgba(255,255,255,.9),0_4px_8px_-5px_rgba(15,23,42,.25)]"
                            : "text-slate-600 hover:bg-white/45"
                          }`}
                      >
                        {p.id === "secret-garden" ? (
                          <Flower2
                            className={`h-4 w-4 shrink-0 transition-colors ${i === activeIdx ? "text-pink-600 fill-pink-200" : "text-pink-400 fill-pink-100"
                              }`}
                          />
                        ) : (
                          <FolderIcon className="h-4 w-5 shrink-0" />
                        )}
                        <span className="truncate">{p.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="mb-1.5 px-2 text-[12px] font-semibold uppercase tracking-wider text-slate-400">
                  Info
                </div>
                <dl className="space-y-1.5 px-2 text-[12.5px] leading-snug">
                  <div>
                    <dt className="text-slate-400 text-[11px]">Year</dt>
                    <dd className="font-medium text-slate-700">{currentProject.period}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 text-[11px]">Role</dt>
                    <dd className="font-medium text-slate-700 truncate">{currentProject.role}</dd>
                  </div>
                </dl>
              </div>

              {repoLinks.length > 0 && (
                <div>
                  <div className="mb-1.5 px-2 text-[12px] font-semibold uppercase tracking-wider text-slate-400">
                    Code
                  </div>
                  <ul className="space-y-1">
                    {repoLinks.map((l) => (
                      <li key={l.label}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-[12.5px] font-medium text-slate-600 transition hover:bg-white/50"
                        >
                          <GithubIcon className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{l.label}</span>
                          <ExternalLink className="ml-auto h-2.5 w-2.5 shrink-0 text-slate-400" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* More Projects archive link pinned at bottom of sidebar */}
              <div className="mt-auto pt-2">
                <a
                  href="https://github.com/danahparis21"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-[12.5px] font-medium text-pink-600 transition hover:bg-pink-50/60"
                >
                  <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                  <span>More Projects</span>
                  <ExternalLink className="ml-auto h-3 w-3 shrink-0 text-pink-300" />
                </a>
              </div>
            </aside>

            {/* ---------------- Main Content Area ---------------- */}
            <div className="flex flex-col p-5 sm:p-6 lg:pl-7">

              {/* Window Toolbar */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200/50">
                <TrafficLights className="lg:hidden" />

                <div className="pj-nav flex items-center rounded-full">
                  <button
                    type="button"
                    aria-label="Previous project"
                    onClick={() => step(-1)}
                    className="px-2.5 py-1 text-slate-700 transition hover:text-slate-950"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span className="h-3.5 w-px bg-slate-300/70" />
                  <button
                    type="button"
                    ref={navNextRef}
                    aria-label="Next project"
                    onClick={() => step(1)}
                    className="px-2.5 py-1 text-slate-700 transition hover:text-slate-950"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <span className="text-[15px] sm:text-[16px] font-semibold text-slate-800">
                  {isSecretGarden ? "Secret Garden" : "Projects"}
                </span>

                {/* Step Progress Dots */}
                <div className="hidden sm:flex items-center gap-1.5 ml-2">
                  {projects.map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => goTo(i)}
                      title={p.title}
                      aria-label={`Jump to ${p.title}`}
                      className={`h-2 rounded-full transition-all duration-300 ${i === activeIdx
                          ? "w-6 bg-gradient-to-r from-pink-500 to-rose-400 shadow-sm"
                          : "w-2 bg-slate-300 hover:bg-slate-400"
                        }`}
                    />
                  ))}
                </div>

                <span className="ml-auto text-xs font-mono text-slate-400">
                  {activeIdx + 1} of {projects.length}
                </span>
              </div>

              {/* Mobile Tabs Switcher (when sidebar is hidden on small screens) */}
              <div ref={mobileTabsRef} className="relative flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-1 lg:hidden">
                {projects.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => goTo(i)}
                    className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition whitespace-nowrap ${i === activeIdx
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:bg-white/40"
                      }`}
                  >
                    {p.id === "secret-garden" ? (
                      <Flower2 className="h-3.5 w-3.5 text-pink-500 fill-pink-200" />
                    ) : (
                      <FolderIcon className="h-3.5 w-4 shrink-0" />
                    )}
                    <span>{p.title}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Project Content: the only area that captures scroll / swipe */}
              <div
                ref={zoneRef}
                className="relative flex flex-1 flex-col"
                style={{ touchAction: isSecretGarden ? "auto" : "none" }}
              >
                <div
                  key={currentProject.id}
                  ref={bodyRef}
                  className={`flex flex-1 flex-col pj-slide-${slide}`}
                >
                  {isSecretGarden ? (
                    /* ── Full Secret Garden Living Experience (no detail floating boxes) ── */
                    <SecretGardenInWindow />
                  ) : (
                    /* ── Standard Project Stage: Centered Laptop & Details ── */
                    <div>

                      {/* Title row */}
                      <div className="pj-fade mt-4 sm:mt-5 flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                            {currentProject.title}
                          </h3>
                          <p className="mt-1 text-[13.5px] sm:text-[14.5px] text-slate-500">{currentProject.subtitle}</p>
                          <p className="mt-1 text-xs text-slate-400 lg:hidden">
                            {currentProject.period} · {currentProject.role}
                          </p>
                        </div>
                        {currentProject.liveUrl && (
                          <a
                            href={currentProject.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pj-pill pj-pill-pink"
                          >
                            <Globe className="h-3.5 w-3.5" />
                            <span>Live Platform</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>

                      {/* Device Stage — Centered & Balanced */}
                      <div className="mt-5 flex flex-col items-center justify-center gap-6 lg:flex-row lg:items-center lg:gap-8">
                        {metrics.length > 0 && (
                          <div className="order-2 grid w-full grid-cols-2 gap-2.5 sm:grid-cols-4 lg:order-1 lg:w-[210px] xl:w-[220px] lg:shrink-0 lg:grid-cols-2">
                            {metrics.map((m, i) => (
                              <div
                                key={m.label}
                                className={`pj-tile flex flex-col justify-center ${metrics.length === 3 && i === 2 ? "col-span-2 lg:col-span-2" : ""
                                  }`}
                                style={{ "--i": i } as React.CSSProperties}
                              >
                                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
                                  {m.label}
                                </div>
                                <div className="mt-0.5 text-[12.5px] sm:text-[13.5px] font-bold tracking-tight text-slate-800 leading-snug break-words">
                                  {m.value}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Centered Laptop Device */}
                        <div className="relative order-1 w-full max-w-[430px] shrink-0 lg:order-2">
                          <div className="pj-laptop group relative">
                            <div className="rounded-[16px] bg-[#16161a] p-[8px] sm:p-[9px] shadow-[0_26px_46px_-18px_rgba(15,23,42,.55)] ring-1 ring-black/40">
                              <div className="relative aspect-[16/10] overflow-hidden rounded-[8px] bg-slate-950">
                                <span className="absolute left-1/2 top-[5px] z-10 h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-slate-700" />
                                {currentProject.videoUrl ? (
                                  <>
                                    <video
                                      ref={videoRef}
                                      src={currentProject.videoUrl}
                                      preload="metadata"
                                      loop
                                      muted
                                      playsInline
                                      className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/45 to-transparent p-2.5 opacity-0 transition-opacity group-hover:opacity-100">
                                      <button
                                        type="button"
                                        onClick={togglePlay}
                                        aria-label={playing ? "Pause demo" : "Play demo"}
                                        className="pj-ctl"
                                      >
                                        {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={toggleMute}
                                        aria-label={muted ? "Unmute demo" : "Mute demo"}
                                        className="pj-ctl"
                                      >
                                        {muted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-white to-violet-50 p-5 text-center">
                                    <div className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                                      {currentProject.title}
                                    </div>
                                    <p className="mt-0.5 max-w-[240px] text-[11px] text-slate-500">
                                      {currentProject.tags.slice(0, 3).join(" • ")}
                                    </p>
                                  </div>
                                )}
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                              </div>
                            </div>
                            {/* Laptop Base */}
                            <div className="-mx-[6%] h-[12px] sm:h-[13px] rounded-b-[13px] rounded-t-[2px] bg-gradient-to-b from-[#eceef2] via-[#cfd3da] to-[#aab0ba] shadow-[0_12px_18px_-8px_rgba(15,23,42,.4)]">
                              <div className="mx-auto h-[4px] w-[16%] rounded-b-md bg-[#9aa0ab]" />
                            </div>
                          </div>

                          {/* Phone Demo (if available) */}
                          {hasPhone && (
                            <div className="absolute -bottom-3 -right-2 z-20 w-[24%] min-w-[88px] sm:-right-4 sm:-bottom-4">
                              <div className="pj-phone rounded-[1.8rem] bg-[#0d0d10] p-[4px] shadow-[0_24px_38px_-14px_rgba(15,23,42,.6)] ring-1 ring-white/20">
                                <div className="relative aspect-[9/19.5] overflow-hidden rounded-[1.55rem] bg-slate-950">
                                  <span className="absolute left-1/2 top-[5px] z-10 h-[7px] w-[34%] -translate-x-1/2 rounded-full bg-black" />
                                  {phoneSrc ? (
                                    <video
                                      ref={phoneRef}
                                      src={phoneSrc}
                                      preload="metadata"
                                      loop
                                      muted
                                      playsInline
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 bg-gradient-to-b from-pink-100 via-white to-violet-100 px-1.5 text-center">
                                      <span className="text-[11px] sm:text-xs font-extrabold tracking-tight text-slate-900">
                                        {currentProject.title}
                                      </span>
                                      <span className="text-[7.5px] leading-tight text-slate-500">
                                        Mobile Demo
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Description + Tech Stack */}
                      <div className="pj-fade mt-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div className="group/desc relative max-w-md lg:max-w-lg">
                          <div className="pj-desc max-h-[64px] sm:max-h-[72px] overflow-y-auto pr-2 text-[13.5px] leading-relaxed text-slate-600 transition-[max-height] duration-300 ease-in-out hover:max-h-[160px]">
                            <p>{currentProject.description}</p>
                          </div>
                          <div className="mt-1 text-[11px] font-medium text-pink-500/80">
                            <span>Hover or scroll for full description</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 md:max-w-sm md:justify-end">
                          {currentProject.tags.map((tag) => (
                            <span key={tag} className="pj-pill pj-chip">
                              <span>{tag}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Repo links on small screens (sidebar is hidden there) */}
                      {repoLinks.length > 0 && (
                        <div className="mt-3.5 flex flex-wrap gap-1.5 lg:hidden">
                          {repoLinks.map((l) => (
                            <a
                              key={l.label}
                              href={l.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="pj-pill text-xs py-1 px-2.5"
                            >
                              <GithubIcon className="h-3 w-3" />
                              <span>{l.label}</span>
                            </a>
                          ))}
                        </div>
                      )}

                    </div>
                  )}
                </div>

                {/* Live swipe indicators (touch) */}
                <div ref={pullPrevRef} aria-hidden className="pj-pull top-2">
                  <ChevronDown className="h-3.5 w-3.5" />
                  <span>Previous: {prevProject.title}</span>
                </div>
                <div ref={pullNextRef} aria-hidden className="pj-pull bottom-2">
                  <ChevronsUp className="h-3.5 w-3.5" />
                  <span>Next: {nextProject.title}</span>
                </div>
              </div>

              {/* Footer: always-visible cue + next button. Scrolling here scrolls the page. */}
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200/50 pt-3">
                <div
                  className={`flex min-w-0 items-center gap-2 text-[12px] font-medium transition-colors ${hintOn ? "text-pink-600" : "text-slate-400"
                    }`}
                >
                  {isTouch ? (
                    <ChevronsUp className={`h-4 w-4 shrink-0 ${hintOn ? "pj-bob-up" : ""}`} />
                  ) : (
                    <svg width="14" height="20" viewBox="0 0 14 20" className="shrink-0" aria-hidden>
                      <rect x="1" y="1" width="12" height="18" rx="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
                      <circle className={hintOn ? "pj-wheel-dot" : ""} cx="7" cy="6" r="1.6" fill="currentColor" />
                    </svg>
                  )}
                  <span className="truncate">
                    {isTouch
                      ? hintOn
                        ? "Swipe up for the next project"
                        : "Swipe up inside the window to switch"
                      : hintOn
                        ? "Scroll down to browse more"
                        : "Scroll inside the window to switch projects"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="pj-pill pj-chip shrink-0"
                  aria-label={`Next project: ${nextProject.title}`}
                >
                  <span>Next: {nextProject.title}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Idle hint: cursor clicking the next tab */}
            {hintOn && hintGeo && (
              <div
                key={`hint-${activeIdx}`}
                aria-hidden
                className="pointer-events-none absolute left-0 top-0 z-40"
                style={
                  {
                    "--sx": `${hintGeo.sx}px`,
                    "--sy": `${hintGeo.sy}px`,
                    "--tx": `${hintGeo.tx}px`,
                    "--ty": `${hintGeo.ty}px`,
                  } as React.CSSProperties
                }
              >
                <span className="pj-hint-ring" />
                <span className="pj-hint-cursor">
                  <svg
                    width="22"
                    height="26"
                    viewBox="0 0 20 24"
                    className="block drop-shadow-[0_2px_4px_rgba(15,23,42,0.35)]"
                  >
                    <path
                      d="M2 1.5v18.2l4.7-4.4 3.3 7.4 3.3-1.5-3.2-7.2h6.6L2 1.5Z"
                      fill="#0a0a0a"
                      stroke="#fff"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="pj-hint-bubble rounded-2xl bg-[#0a0a0a] px-3.5 py-2.5 shadow-[0_14px_30px_-10px_rgba(0,0,0,0.5)]">
                    <span className="block text-[11px] font-semibold text-pink-400">Mica</span>
                    <span className="mt-0.5 block text-[13.5px] font-medium leading-snug text-white">
                      {isTouch ? "Tap here to see more projects" : "Click here to see more projects"}
                    </span>
                  </span>
                </span>
              </div>
            )}

          </article>
        </div>

      </div>
    </section>
  );
};