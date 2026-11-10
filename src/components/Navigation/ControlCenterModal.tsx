"use client";

/**
 * Control Center — light, frosted iOS/macOS-style tiles floating on a blurred page.
 *  - No big container: just soft tiles, one pink icon colour, dark readable labels.
 *  - Phone: drops down from the TOP like the real thing. Swipe down from the header to open it
 *    (pass `onOpen`), swipe up or tap outside to close.
 *  - Laptop: the same tiles tucked into the top-right corner under the menu bar.
 */

import React, { useEffect, useRef, useState } from "react";
import {
  Wifi,
  Radio,
  Volume2,
  VolumeX,
  Layers,
  X,
  User,
  Code2,
  Briefcase,
  Film,
  Award,
  Phone,
  Flower2,
  Mail,
} from "lucide-react";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { playUiClick, setUiVolume, getUiVolume } from "@/utils/sound";

interface ControlCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional: lets a swipe-down from the top of the phone screen open the panel. */
  onOpen?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSection: (sectionId: string) => void;
  recruiterMode: boolean;
  onToggleRecruiterMode: () => void;
}

const ICON = "h-6 w-6";
const NAV = [
  { id: "about", label: "About Me", icon: <User className={ICON} /> },
  { id: "tech-stack", label: "Tech Stack", icon: <Code2 className={ICON} /> },
  { id: "projects", label: "Projects", icon: <Briefcase className={ICON} /> },
  { id: "certificates", label: "Certificates", icon: <Award className={ICON} /> },
  { id: "achievements", label: "Achievements", icon: <Film className={ICON} /> },
  { id: "contact", label: "Contact Me", icon: <Phone className={ICON} /> },
  { id: "garden", label: "Secret Garden", icon: <Flower2 className={ICON} /> },
];

const INK = "#52525e"; // icons: neutral control-panel gray

export const ControlCenterModal: React.FC<ControlCenterModalProps> = ({
  isOpen,
  onClose,
  onOpen,
  soundEnabled,
  onToggleSound,
  onOpenSection,
  recruiterMode,
  onToggleRecruiterMode,
}) => {
  const [mounted, setMounted] = useState(isOpen);
  const [closing, setClosing] = useState(false);
  const [wifiOn, setWifiOn] = useState(true);
  const [airDropOn, setAirDropOn] = useState(true);
  const [volume, setVolume] = useState(getUiVolume());
  const [current, setCurrent] = useState<string | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const touchY = useRef<number | null>(null);

  useEffect(() => {
    setUiVolume(volume);
  }, [volume]);

  /* mount on open, play the exit animation on close */
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;
    setClosing(true);
    const t = window.setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, 240);
    return () => window.clearTimeout(t);
  }, [isOpen, mounted]);

  /* Esc, scroll lock, which section you're on */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const mid = window.innerHeight * 0.4;
    let found: string | null = null;
    for (const n of NAV) {
      const el = document.getElementById(n.id);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) {
        found = n.id;
        break;
      }
    }
    setCurrent(found);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  /* phone: swipe down from the header area to pull the panel open */
  useEffect(() => {
    if (isOpen || !onOpen) return;
    let active = false;
    let fired = false;
    let sx = 0;
    let sy = 0;
    const start = (e: TouchEvent) => {
      const t = e.touches[0];
      if (window.innerWidth < 640 && t.clientY <= 64) {
        active = true;
        fired = false;
        sx = t.clientX;
        sy = t.clientY;
      }
    };
    const move = (e: TouchEvent) => {
      if (!active || fired) return;
      const t = e.touches[0];
      const dy = t.clientY - sy;
      const dx = Math.abs(t.clientX - sx);
      if (dy > 8 && dy > dx && e.cancelable) e.preventDefault(); // stop pull-to-refresh
      if (dy > 56 && dy > dx * 1.4) {
        fired = true;
        onOpen();
      }
    };
    const end = () => {
      active = false;
    };
    document.addEventListener("touchstart", start, { passive: true });
    document.addEventListener("touchmove", move, { passive: false });
    document.addEventListener("touchend", end, { passive: true });
    document.addEventListener("touchcancel", end, { passive: true });
    return () => {
      document.removeEventListener("touchstart", start);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", end);
      document.removeEventListener("touchcancel", end);
    };
  }, [isOpen, onOpen]);

  if (!mounted) return null;

  const click = () => playUiClick(soundEnabled);
  const go = (id: string) => {
    click();
    onClose();
    window.setTimeout(() => onOpenSection(id), 60); // after page scroll is unlocked again
  };

  /* swipe up on the overlay to close it (phone) */
  const canSwipe = () => {
    const o = overlayRef.current;
    return !!o && o.scrollTop === 0 && o.scrollHeight <= o.clientHeight + 1;
  };
  const tStart = (e: React.TouchEvent) => {
    touchY.current = canSwipe() ? e.touches[0].clientY : null;
    if (stackRef.current) stackRef.current.style.transition = "none";
  };
  const tMove = (e: React.TouchEvent) => {
    if (touchY.current === null || !stackRef.current) return;
    const dy = Math.min(0, e.touches[0].clientY - touchY.current);
    stackRef.current.style.transform = `translateY(${dy * 0.8}px)`;
  };
  const tEnd = (e: React.TouchEvent) => {
    if (touchY.current === null || !stackRef.current) return;
    const dy = e.changedTouches[0].clientY - touchY.current;
    touchY.current = null;
    stackRef.current.style.transition = "";
    if (dy < -70) onClose();
    else stackRef.current.style.transform = "";
  };

  const muted = !soundEnabled || volume === 0;
  const shown = soundEnabled ? volume : 0;
  const idx = (i: number) => ({ "--i": i }) as React.CSSProperties;

  return (
    <div
      ref={overlayRef}
      className="cc-overlay fixed inset-0 z-[70] flex select-none items-start justify-center overflow-y-auto px-5 pb-8 pt-[calc(env(safe-area-inset-top)+28px)] sm:justify-end sm:px-4 sm:pt-12"
      data-closing={closing}
      onClick={onClose}
      onTouchStart={tStart}
      onTouchMove={tMove}
      onTouchEnd={tEnd}
    >
      <style>{`
        @keyframes cc-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cc-fade-out { to { opacity: 0 } }
        @keyframes cc-pop { from { opacity: 0; transform: translateY(-14px) scale(.97) } to { opacity: 1; transform: none } }
        @keyframes cc-pop-out { to { opacity: 0; transform: translateY(-10px) scale(.97) } }
        @keyframes cc-drop { from { opacity: 0; transform: translateY(-22px) scale(.92) } to { opacity: 1; transform: none } }
        @keyframes cc-lift { to { opacity: 0; transform: translateY(-12px) scale(.95) } }

        /* phone: a light veil with only a little blur. laptop: no veil, the page stays fully visible */
        .cc-overlay { background: rgba(246,246,249,.2); -webkit-backdrop-filter: blur(7px); backdrop-filter: blur(7px); animation: cc-fade .25s ease both; overscroll-behavior: contain; }
        @media (min-width: 640px) {
          .cc-overlay { background: transparent; -webkit-backdrop-filter: none; backdrop-filter: none; }
        }
        .cc-overlay[data-closing="true"] { animation: cc-fade-out .24s ease both; }

        /* the glass container: only this area is blurred */
        .cc-glass {
          border-radius: 34px; padding: 14px;
          background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,.32));
          -webkit-backdrop-filter: blur(26px) saturate(1.6); backdrop-filter: blur(26px) saturate(1.6);
          border: 1px solid rgba(255,255,255,.65);
          box-shadow: 0 24px 60px -22px rgba(40,40,60,.38), inset 0 1px 0 rgba(255,255,255,.85);
          animation: cc-pop .3s cubic-bezier(.2,.9,.25,1) backwards;
          transition: transform .25s cubic-bezier(.2,.9,.25,1);
        }
        .cc-overlay[data-closing="true"] .cc-glass { animation: cc-pop-out .22s ease forwards; }
        @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
          .cc-glass { background: rgba(247,247,250,.95); }
        }

        .cc-grid > * { animation: cc-drop .5s cubic-bezier(.2,.9,.25,1) backwards; animation-delay: calc(var(--i, 0) * 30ms); }
        .cc-overlay[data-closing="true"] .cc-grid > * { animation: cc-lift .2s ease forwards; animation-delay: 0s; }

        /* round buttons: see-through until you press them */
        .cc-item { display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 0; -webkit-tap-highlight-color: transparent; }
        .cc-circle {
          position: relative; width: 100%; aspect-ratio: 1; border-radius: 9999px; display: flex; align-items: center; justify-content: center;
          color: ${INK}; background: rgba(255,255,255,.3); border: 1px solid rgba(255,255,255,.7);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.7), 0 8px 18px -14px rgba(40,40,60,.35);
          transition: transform .22s cubic-bezier(.34,1.56,.64,1), background .2s, box-shadow .2s;
        }
        .cc-item:hover .cc-circle { background: rgba(255,255,255,.5); transform: scale(1.06); }
        .cc-item:active .cc-circle { transform: scale(.94); }
        .cc-item[data-active="true"] .cc-circle { background: rgba(255,255,255,.96); color: #3a3a44; box-shadow: 0 0 0 2px rgba(255,255,255,.9), 0 10px 22px -12px rgba(40,40,60,.45); }
        .cc-label { max-width: 100%; text-align: center; font-size: 11px; font-weight: 500; line-height: 1.15; color: #3a3a44; text-shadow: 0 1px 0 rgba(255,255,255,.5); }

        /* tiles */
        .cc-tile { border-radius: 26px; transition: transform .15s, background .2s; -webkit-tap-highlight-color: transparent; }
        .cc-white { background: rgba(255,255,255,.42); border: 1px solid rgba(255,255,255,.7); box-shadow: inset 0 1px 0 rgba(255,255,255,.8), 0 10px 22px -16px rgba(40,40,60,.35); }
        .cc-gray { background: rgba(255,255,255,.26); border: 1px solid rgba(255,255,255,.6); box-shadow: inset 0 1px 0 rgba(255,255,255,.6); }
        button.cc-tile:active { transform: scale(.97); }
        .cc-mini { width: 100%; aspect-ratio: 1; border-radius: 9999px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,.7); transition: background .2s, transform .15s; }
        .cc-mini:active { transform: scale(.92); }
        .cc-pill { border-radius: 9999px; background: rgba(255,255,255,.5); border: 1px solid rgba(255,255,255,.75); box-shadow: inset 0 1px 0 rgba(255,255,255,.8), 0 6px 14px -10px rgba(40,40,60,.4); color: #3a3a44; transition: transform .15s, background .2s; }
        .cc-pill:hover { background: rgba(255,255,255,.7); }
        .cc-pill:active { transform: scale(.95); }
        .cc-overlay button:focus-visible, .cc-overlay a:focus-visible { outline: 2px solid rgba(70,70,85,.6); outline-offset: 3px; }

        @media (prefers-reduced-motion: reduce) {
          .cc-overlay, .cc-glass, .cc-grid > *, .cc-overlay[data-closing="true"] .cc-grid > * { animation-duration: .01s !important; animation-delay: 0s !important; }
        }
      `}</style>

      <div
        ref={stackRef}
        role="dialog"
        aria-modal="true"
        aria-label="Control Center"
        className="cc-stack cc-glass w-full max-w-[380px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cc-grid grid grid-cols-4 gap-x-3 gap-y-3">
          {/* ── section shortcuts + email ── */}
          {NAV.map((item, i) => {
            const active = current === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                aria-current={active ? "true" : undefined}
                data-active={active}
                className="cc-item"
                style={idx(i)}
              >
                <span className="cc-circle">{item.icon}</span>
                <span className="cc-label">{item.label}</span>
              </button>
            );
          })}
          <a
            href={`mailto:${PORTFOLIO_DATA.profile.email}`}
            onClick={click}
            className="cc-item"
            style={idx(NAV.length)}
          >
            <span className="cc-circle">
              <Mail className={ICON} />
            </span>
            <span className="cc-label">Email</span>
          </a>

          {/* ── connectivity (gray glass cluster) ── */}
          <div className="cc-tile cc-gray col-span-2 grid grid-cols-2 gap-2 p-2.5" style={idx(8)}>
            {[
              { label: "Wi-Fi", on: wifiOn, toggle: () => setWifiOn(!wifiOn), icon: <Wifi className="h-5 w-5" /> },
              { label: "AirDrop", on: airDropOn, toggle: () => setAirDropOn(!airDropOn), icon: <Radio className="h-5 w-5" /> },
            ].map((b) => (
              <button
                key={b.label}
                type="button"
                aria-pressed={b.on}
                onClick={() => {
                  click();
                  b.toggle();
                }}
                className="flex min-w-0 flex-col items-center gap-1.5"
              >
                <span
                  className="cc-mini"
                  style={{
                    background: b.on ? "rgba(255,255,255,.96)" : "rgba(255,255,255,.28)",
                    color: INK,
                  }}
                >
                  {b.icon}
                </span>
                <span className="text-[11px] font-medium leading-none text-[#3a3a44]">
                  {b.label}
                </span>
              </button>
            ))}
          </div>

          {/* ── clean view ── */}
          <button
            type="button"
            onClick={() => {
              click();
              onToggleRecruiterMode();
            }}
            aria-pressed={recruiterMode}
            className="cc-tile cc-white col-span-2 flex flex-col justify-between p-3.5 text-left"
            style={{ ...idx(9), ...(recruiterMode ? { background: "rgba(255,255,255,.92)" } : {}) }}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: recruiterMode ? "rgba(120,120,135,.15)" : "rgba(255,255,255,.6)", color: INK }}
            >
              <Layers className="h-5 w-5" />
            </span>
            <span className="block">
              <span className="block text-[14px] font-semibold leading-tight text-[#3a3a44]">Clean View</span>
              <span className="block text-[11.5px] text-[#7b7b88]">{recruiterMode ? "On · tap to exit" : "One simple page"}</span>
            </span>
          </button>

          {/* ── sound ── */}
          <div className="cc-tile cc-white col-span-4 px-4 py-3.5" style={idx(10)}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13.5px] font-semibold text-[#3a3a44]">Sound effects</span>
              <button
                type="button"
                onClick={() => {
                  if (muted) {
                    if (volume === 0) setVolume(60);
                    if (!soundEnabled) onToggleSound();
                  } else {
                    onToggleSound();
                  }
                }}
                className="cc-pill px-3 py-1 text-[12px] font-semibold"
              >
                {muted ? "Unmute" : "Mute"}
              </button>
            </div>
            <div className="relative h-10 overflow-hidden rounded-full bg-[rgba(110,110,125,.2)] focus-within:ring-2 focus-within:ring-white/90">
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${Math.max(shown, 0)}%`,
                  minWidth: shown > 0 ? 40 : 0,
                  background: "rgba(255,255,255,.97)",
                  boxShadow: "0 2px 8px rgba(40,40,60,.18)",
                  transition: "width .05s",
                }}
              />
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: muted ? "#8a8a96" : INK }}>
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={shown}
                aria-label="Sound effects volume"
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setVolume(v);
                  if (v > 0 && !soundEnabled) onToggleSound();
                  if (v === 0 && soundEnabled) onToggleSound();
                }}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>
          </div>

          {/* ── close ── */}
          <div className="col-span-4 flex justify-center pt-1" style={idx(11)}>
            <button
              type="button"
              onClick={() => {
                click();
                onClose();
              }}
              className="cc-pill flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium"
            >
              <X className="h-4 w-4" style={{ color: INK }} />
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};