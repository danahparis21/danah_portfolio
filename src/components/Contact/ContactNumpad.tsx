"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { CONTACT_KEYS, type ContactKey } from "./contacts";

/* ── real MP3 sound effects ── */
let hoverAudio: HTMLAudioElement | null = null;
let clickAudio: HTMLAudioElement | null = null;
let hoverStopTimer: ReturnType<typeof setTimeout> | null = null;
let hoverFadeTimer: ReturnType<typeof setTimeout> | null = null;
let isFading = false;

const ensureHoverAudio = () => {
  if (!hoverAudio) {
    hoverAudio = new Audio("/assets/sounds/hover-keyboard.mp3");
    hoverAudio.loop = true;
    hoverAudio.volume = 0.5;
  }
  return hoverAudio;
};

/** Called when pointer enters any key — starts or continues the hover sound. */
const onKeyHoverIn = () => {
  try {
    // Cancel any pending stop or fade
    if (hoverStopTimer) { clearTimeout(hoverStopTimer); hoverStopTimer = null; }
    if (hoverFadeTimer) { clearTimeout(hoverFadeTimer); hoverFadeTimer = null; }
    isFading = false;

    const audio = ensureHoverAudio();
    audio.volume = 0.5;

    if (audio.paused) {
      audio.currentTime = 0;
      audio.play().catch(() => { });
    }

    // If parked on one key for 2s, gently fade out
    hoverFadeTimer = setTimeout(() => {
      if (!hoverAudio || hoverAudio.paused) return;
      isFading = true;
      const step = () => {
        if (!isFading || !hoverAudio || hoverAudio.paused) return;
        if (hoverAudio.volume > 0.03) {
          hoverAudio.volume = Math.max(0, hoverAudio.volume - 0.03);
          requestAnimationFrame(step);
        } else {
          hoverAudio.pause();
          hoverAudio.currentTime = 0;
          hoverAudio.volume = 0.5;
          isFading = false;
        }
      };
      step();
    }, 200);
  } catch { }
};

/** Called when pointer leaves a key — stops after a tiny grace period. */
const onKeyHoverOut = () => {
  if (hoverStopTimer) clearTimeout(hoverStopTimer);
  hoverStopTimer = setTimeout(() => {
    if (hoverFadeTimer) { clearTimeout(hoverFadeTimer); hoverFadeTimer = null; }
    isFading = false;
    if (hoverAudio && !hoverAudio.paused) {
      hoverAudio.pause();
      hoverAudio.currentTime = 0;
      hoverAudio.volume = 0.5;
    }
  }, 60); // 60ms grace so key-to-key sweeps stay seamless
};

const playClickSound = () => {
  try {
    if (!clickAudio) clickAudio = new Audio("/assets/sounds/keyboard-click.mp3");
    clickAudio.currentTime = 0;
    clickAudio.volume = 0.6;
    clickAudio.play().catch(() => { });
  } catch { }
};

/* feel constants */
const KEY = 1.02;
const GAP = 0.18;
const PRESS_DEPTH = 0.16;
const HOVER_LIFT = 0.05;
const SPRING = 20;

const TONES = {
  pink: { cap: "#f6b8cc", text: "#ffffff", glass: false },
  cream: { cap: "#f5efe8", text: "#7a6b70", glass: false },
  glass: { cap: "#ffffff", text: "#b04d74", glass: true },
} as const;

function useLabelTexture(k: ContactKey) {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d");
    if (!g) return new THREE.CanvasTexture(c);
    const t = TONES[k.tone];
    g.fillStyle = t.text;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `700 ${k.glyph.length > 2 ? 74 : 96}px -apple-system, "SF Pro Display", "Helvetica Neue", sans-serif`;
    g.fillText(k.glyph, 128, 112);
    g.font = `600 28px -apple-system, "SF Pro Text", "Helvetica Neue", sans-serif`;
    g.globalAlpha = 0.88;
    g.fillText(k.label, 128, 200);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, [k]);
}

function Key({ k, x, z, hovered, onHover, onPress }: {
  k: ContactKey; x: number; z: number; hovered: boolean;
  onHover: (id: string | null) => void; onPress: (k: ContactKey) => void;
}) {
  const g = useRef<THREE.Group | null>(null);
  const pressedUntil = useRef(0);
  const clock = useThree((state) => state.clock);
  const tex = useLabelTexture(k);
  const t = TONES[k.tone];

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const group = g.current;
    if (!group) return;
    const down = clock.elapsedTime < pressedUntil.current;
    const target = down ? -PRESS_DEPTH : hovered ? HOVER_LIFT : 0;
    group.position.y += (target - group.position.y) * (1 - Math.exp(-SPRING * dt));
  });

  return (
    <group position={[x, 0.42, z]}>
      <group
        ref={g}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(k.id);
          onKeyHoverIn();
        }}
        onPointerOut={() => {
          onHover(null);
          onKeyHoverOut();
        }}
        onClick={(e) => {
          e.stopPropagation();
          playClickSound();
          pressedUntil.current = clock.elapsedTime + 0.16;
          onPress(k);
        }}
      >
        {/* skirt */}
        <RoundedBox args={[KEY, 0.42, KEY]} radius={0.14} smoothness={5} position-y={0.06}>
          {t.glass ? (
            <meshPhysicalMaterial color={t.cap} transmission={0.92} thickness={0.6} roughness={0.08} ior={1.45} clearcoat={1} />
          ) : (
            <meshPhysicalMaterial color={t.cap} roughness={0.22} clearcoat={1} clearcoatRoughness={0.08} sheen={0.4} />
          )}
        </RoundedBox>
        {/* dished top */}
        <RoundedBox args={[KEY * 0.82, 0.08, KEY * 0.82]} radius={0.04} smoothness={4} position-y={0.29}>
          {t.glass ? (
            <meshPhysicalMaterial color={t.cap} transmission={0.85} thickness={0.3} roughness={0.05} clearcoat={1} />
          ) : (
            <meshPhysicalMaterial color={t.cap} roughness={0.15} clearcoat={1} clearcoatRoughness={0.05} />
          )}
        </RoundedBox>
        {t.glass && (
          <mesh position-y={-0.02}>
            <boxGeometry args={[0.42, 0.22, 0.42]} />
            <meshStandardMaterial color="#f7d36b" roughness={0.4} />
          </mesh>
        )}
        <mesh position-y={0.336} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[KEY * 0.74, KEY * 0.74]} />
          <meshBasicMaterial map={tex} transparent toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function Board({ hoverId, setHoverId, onPress }: {
  hoverId: string | null; setHoverId: (id: string | null) => void; onPress: (k: ContactKey) => void;
}) {
  const rig = useRef<THREE.Group | null>(null);
  useFrame(({ pointer }, delta) => {
    const group = rig.current;
    if (!group) return;
    const a = 1 - Math.exp(-4 * Math.min(delta, 0.05));
    group.rotation.x += (-0.12 - pointer.y * 0.12 - group.rotation.x) * a;
    group.rotation.y += (pointer.x * 0.25 - 0.35 - group.rotation.y) * a;
  });

  const cols = 3;
  const rows = 2;
  const step = KEY + GAP;
  const w = cols * step + 0.35;
  const d = rows * step + 0.35;

  return (
    <group ref={rig}>
      <RoundedBox args={[w, 0.5, d]} radius={0.22} smoothness={6}>
        <meshPhysicalMaterial color="#f4b3c8" roughness={0.18} clearcoat={1} clearcoatRoughness={0.06} />
      </RoundedBox>
      {/* cable stub */}
      <mesh position={[0, 0, -d / 2 - 0.15]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.09, 0.09, 0.4, 20]} />
        <meshPhysicalMaterial color="#d9d4d6" metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0, -d / 2 - 1.3]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.065, 0.065, 2, 16]} />
        <meshPhysicalMaterial color="#f29ab8" roughness={0.3} clearcoat={0.8} />
      </mesh>
      {CONTACT_KEYS.map((k, i) => (
        <Key
          key={k.id}
          k={k}
          x={((i % cols) - (cols - 1) / 2) * step}
          z={(Math.floor(i / cols) - (rows - 1) / 2) * step}
          hovered={hoverId === k.id}
          onHover={setHoverId}
          onPress={onPress}
        />
      ))}
    </group>
  );
}

function CameraFit() {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / size.height;
    // Perfectly proportioned camera distance (slightly more compact)
    const fit = 1 + Math.max(0, 1.25 - aspect) * 0.45;
    camera.position.set(0, 5.4 * fit, 4.8 * fit);
    camera.lookAt(0, 0, 0.15);
  }, [camera, size.width, size.height]);
  return null;
}

function openContact(k: ContactKey) {
  // If it's the ASMR key, don't open any link!
  if (!k.href) return;
  const a = document.createElement("a");
  a.href = k.href;
  if (k.external) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
  if (k.download) a.download = k.download;
  a.click();
}

export function ContactNumpad() {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const hovered = CONTACT_KEYS.find((k) => k.id === hoverId);

  useEffect(() => {
    document.body.style.cursor = hoverId ? "pointer" : "auto";
    return () => { document.body.style.cursor = "auto"; };
  }, [hoverId]);

  return (
    <section id="contact" className="relative scroll-mt-12 overflow-hidden bg-white py-16 sm:py-24">
      <style>{`
        .ct-pill {
          position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: .45rem;
          border-radius: 9999px; border: 1px solid rgba(148,163,184,.45); padding: .5rem 1rem;
          font-size: 13.5px; font-weight: 500; color: #334155; white-space: nowrap;
          background: linear-gradient(180deg, #fff, #f6f7f9);
          box-shadow: inset 0 1px 1px #fff, inset 0 -1px 2px rgba(15,23,42,.05), 0 4px 12px -6px rgba(15,23,42,.2);
        }
        .ct-chip { padding: .28rem .75rem; font-size: 12px; }
        .ct-grad {
          background: linear-gradient(135deg, #0b0b10 10%, #4a1236 50%, #f0568f 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
      `}</style>

      {/* Ambient pastel gradient blobs for subtle warmth */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
        <div className="absolute left-[15%] top-[20%] h-[380px] w-[380px] rounded-full bg-[#ffc9dc] opacity-30 blur-3xl" />
        <div className="absolute right-[15%] top-[25%] h-[420px] w-[420px] rounded-full bg-[#d9ccff] opacity-25 blur-3xl" />
        <div className="absolute left-[40%] bottom-[10%] h-[340px] w-[340px] rounded-full bg-[#ffe3cc] opacity-20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">

        {/* Section Header */}
        <div className="mb-4 space-y-3 text-center sm:text-left">
          <span className="ct-pill ct-chip">
            <span className="h-2 w-2 rounded-full bg-pink-400" />
            <span>Get in Touch</span>
          </span>
          <h2 className="text-4xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight text-slate-900">
            Press a <span className="ct-grad">key.</span>
          </h2>
          <p className="max-w-md text-base sm:text-lg text-slate-500">
            Mechanical keycaps floating in space. Click or hover any key to connect.
          </p>
        </div>

        {/* Floating 3D Numpad Stage (Compact & Floating) */}
        <div className="relative h-[460px] sm:h-[540px] lg:h-[580px] w-full" data-scene-ready={ready ? "" : undefined}>
          <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 5.4, 4.8], fov: 32 }}
            gl={{ antialias: true, alpha: true }}
            onCreated={({ camera }) => {
              camera.lookAt(0, 0, 0.15);
              requestAnimationFrame(() => setReady(true));
            }}
          >
            <CameraFit />
            <ambientLight intensity={0.7} />
            <directionalLight position={[3, 8, 5]} intensity={1.35} />
            <Environment resolution={256}>
              <Lightformer intensity={3} position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[10, 6, 1]} />
              <Lightformer intensity={1.4} color="#ffd6e4" position={[-6, 2, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
              <Lightformer intensity={1.2} color="#e6ecff" position={[6, 2, 2]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
            </Environment>
            <Board hoverId={hoverId} setHoverId={setHoverId} onPress={openContact} />
            <ContactShadows position={[0, -0.6, 0]} opacity={0.32} scale={12} blur={3} far={2.5} color="#b0607e" />
          </Canvas>

          {/* Floating Pill Tooltip */}
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 ct-pill ct-chip shadow-md transition-all duration-200">
            <span className="text-slate-700 font-semibold text-xs sm:text-sm">
              {hovered ? `${hovered.label} · ${hovered.hint}` : "Hover a keycap · Click to open"}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
