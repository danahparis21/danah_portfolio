"use client";

/**
 * DesktopLoader (3D)
 * ------------------------------------------------------------------
 * Requires:  npm i three @react-three/fiber @react-three/drei
 *            npm i -D @types/three
 * (React 19 → @react-three/fiber v9, React 18 → v8)
 *
 * Everything is built from real 3D geometry (no flat UI mockups):
 *  - MacBook: aluminium body, key grid, trackpad, hinged lid that opens
 *  - Ceramic mug with handle, matcha latte with foam art, printed wrap and rising steam
 *  - Floating notification cards close to the screen + sticky note stuck directly on the display
 * The screen only says "Hi, welcome".
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  RoundedBox,
  ContactShadows,
  Environment,
  Lightformer,
  Billboard,
} from "@react-three/drei";
import { playUiClick } from "@/utils/sound";

interface DesktopLoaderProps {
  onEnter: () => void;
  soundEnabled: boolean;
}

/* ───────────────────────── helpers ───────────────────────── */

const SCRIPT = '"Pinyon Script", "Snell Roundhand", "Brush Script MT", cursive';
const HAND = '"Caveat", "Segoe Print", "Bradley Hand", cursive';
const SANS = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

const canvasTex = (w: number, h: number, draw: Draw) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
};

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

/* ───────────────────────── textures ───────────────────────── */

const drawWallpaper: Draw = (ctx, w, h) => {
  const stripes: [string, number][] = [
    ["#f6e3e8", 70], ["#e8dbd8", 44], ["#fbf2ef", 96], ["#d9cbc7", 38],
    ["#f9e6ec", 80], ["#eee2df", 52], ["#fdf6f3", 90], ["#e1d2cf", 40],
  ];
  let x = 0;
  let i = 0;
  while (x < w) {
    const [color, width] = stripes[i % stripes.length];
    ctx.fillStyle = color;
    ctx.fillRect(x, 0, width + 1, h);
    x += width;
    i++;
  }
  const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.12, w / 2, h / 2, h * 0.95);
  g.addColorStop(0, "rgba(255,255,255,0.62)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
};

const drawGreeting: Draw = (ctx, w, h) => {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `230px ${SCRIPT}`;
  ctx.shadowColor = "rgba(255,255,255,0.9)";
  ctx.shadowBlur = 22;
  ctx.fillStyle = "#6b4a40";
  ctx.fillText("Hi, welcome", w / 2, h / 2);
};

const drawEnterButton: Draw = (ctx, w, h) => {
  ctx.shadowColor = "rgba(90,50,40,0.35)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = "#6b4a40";
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, w * 0.36, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#fff7f4";
  ctx.lineWidth = w * 0.045;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const cx = w / 2, cy = h / 2, a = w * 0.14;
  ctx.beginPath();
  ctx.moveTo(cx - a, cy);
  ctx.lineTo(cx + a, cy);
  ctx.moveTo(cx + a * 0.25, cy - a * 0.75);
  ctx.lineTo(cx + a, cy);
  ctx.lineTo(cx + a * 0.25, cy + a * 0.75);
  ctx.stroke();
};

const cardTexture = (title: string, sub: string, glyph: string, accent: [string, string], extra?: Draw) =>
  canvasTex(680, 200, (ctx, w, h) => {
    ctx.shadowColor = "rgba(90,45,60,0.20)";
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 10;
    roundRect(ctx, 24, 18, w - 48, h - 48, 44);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,1)";
    ctx.stroke();

    const g = ctx.createLinearGradient(54, 46, 130, 122);
    g.addColorStop(0, accent[0]);
    g.addColorStop(1, accent[1]);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(92, 84, 38, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = `700 32px ${SANS}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(glyph, 92, 86);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#2b1d20";
    ctx.font = `700 31px ${SANS}`;
    ctx.fillText(title, 152, 76);
    ctx.fillStyle = "#7c6a6e";
    ctx.font = `500 23px ${SANS}`;
    ctx.fillText(sub, 152, 112);
    extra?.(ctx, w, h);
  });

const callButtons: Draw = (ctx) => {
  const btn = (x: number, color: string, mark: (c: CanvasRenderingContext2D, x: number) => void) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, 84, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    mark(ctx, x);
    ctx.stroke();
  };
  btn(534, "#ef4b5f", (c, x) => { c.moveTo(x - 9, 75); c.lineTo(x + 9, 93); c.moveTo(x + 9, 75); c.lineTo(x - 9, 93); });
  btn(600, "#34c759", (c, x) => { c.moveTo(x - 10, 85); c.lineTo(x - 3, 92); c.lineTo(x + 11, 76); });
};

const stickyTexture = () =>
  canvasTex(512, 512, (ctx, w, h) => {
    ctx.shadowColor = "rgba(80,60,20,0.28)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 10;
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#fbefb0");
    g.addColorStop(1, "#f3e08f");
    ctx.fillStyle = g;
    ctx.fillRect(40, 50, w - 80, h - 90);
    ctx.shadowColor = "transparent";

    ctx.save();
    ctx.translate(w / 2, 56);
    ctx.rotate(-0.04);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillRect(-90, -20, 180, 44);
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.strokeRect(-90, -20, 180, 44);
    ctx.restore();

    ctx.fillStyle = "#5b4636";
    ctx.font = `500 41px ${HAND}`;
    ctx.textAlign = "left";
    const lines = ["I am always doing", "that which I cannot", "do, in order that", "I may learn how", "to do it."];
    lines.forEach((l, i) => ctx.fillText(l, 82, 160 + i * 50));
    ctx.textAlign = "right";
    ctx.fillText("— Pablo Picasso", w - 86, 440);
  });

const mugPrintTexture = () =>
  canvasTex(800, 500, (ctx, w, h) => {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff6f8";
    ctx.font = `900 148px ${SANS}`;
    ctx.fillText("CODE", w / 2, h * 0.38);
    ctx.font = `800 66px ${SANS}`;
    ctx.fillText("& MATCHA ★", w / 2, h * 0.7);
  });

const matchaLiquidTexture = () =>
  canvasTex(512, 512, (ctx, w, h) => {
    const cx = w / 2, cy = h / 2, r = w / 2;
    // rich ceremonial matcha green base
    const g = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
    g.addColorStop(0, "#7d9b54");
    g.addColorStop(0.5, "#688543");
    g.addColorStop(0.9, "#536d33");
    g.addColorStop(1, "#3f5426");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // delicate creamy oat milk foam swirl (latte art heart / tulip)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.1);

    // outer foam feathering
    ctx.strokeStyle = "rgba(244, 248, 234, 0.7)";
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.65, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    // center latte heart
    ctx.fillStyle = "rgba(246, 250, 238, 0.88)";
    ctx.beginPath();
    ctx.moveTo(0, -50);
    ctx.bezierCurveTo(-55, -95, -95, -20, 0, 75);
    ctx.bezierCurveTo(95, -20, 55, -95, 0, -50);
    ctx.fill();

    // heart center cleft stroke
    ctx.strokeStyle = "rgba(104, 133, 67, 0.85)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, -55);
    ctx.lineTo(0, 80);
    ctx.stroke();

    ctx.restore();
  });

const steamTexture = () =>
  canvasTex(128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,255,255,0.9)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

/* ───────────────────────── parallax wrapper ───────────────────────── */

interface FloatyProps {
  base: [number, number, number];
  depth?: number;
  bob?: number;
  rz?: number;
  ry?: number;
  appearAt?: number;
  phase?: number;
  children: React.ReactNode;
}

const Floaty: React.FC<FloatyProps> = ({
  base, depth = 0.4, bob = 0.06, rz = 0, ry = 0, appearAt = 0.8, phase = 0, children,
}) => {
  const ref = useRef<THREE.Group>(null!);
  useFrame(({ clock, pointer }) => {
    const g = ref.current;
    const t = clock.elapsedTime;
    const L = THREE.MathUtils.lerp;
    g.position.x = L(g.position.x, base[0] + pointer.x * depth, 0.06);
    g.position.y = L(g.position.y, base[1] + pointer.y * depth * 0.6 + Math.sin(t * 1.1 + phase) * bob, 0.06);
    g.rotation.y = L(g.rotation.y, ry + pointer.x * 0.2 * depth, 0.06);
    g.rotation.x = L(g.rotation.x, -pointer.y * 0.14 * depth, 0.06);
    g.scale.setScalar(Math.max(0.0001, ease(clamp01((t - appearAt) / 0.8))));
  });
  return (
    <group ref={ref} position={base} rotation-z={rz}>
      {children}
    </group>
  );
};

/* ───────────────────────── mug ───────────────────────── */

const Steam: React.FC<{ map: THREE.Texture }> = ({ map }) => {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const p = (t * 0.22 + i / 5) % 1;
      m.position.set(Math.sin(t * 1.3 + i * 2.1) * 0.09 * p, 0.9 + p * 1.2, 0);
      m.scale.setScalar(0.28 + p * 0.55);
      (m.material as THREE.MeshBasicMaterial).opacity = Math.sin(p * Math.PI) * 0.3;
    });
  });
  return (
    <Billboard>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={map} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </Billboard>
  );
};

const Mug: React.FC<{ print: THREE.Texture; steam: THREE.Texture; liquid: THREE.Texture }> = ({ print, steam, liquid }) => {
  const body = useMemo(() => {
    const pts = [
      [0, 0], [0.36, 0], [0.4, 0.03], [0.42, 0.1], [0.42, 0.8],
      [0.405, 0.82], [0.375, 0.82], [0.375, 0.1], [0, 0.1],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 64);
  }, []);
  const arc = 2.0;
  return (
    <group>
      <mesh geometry={body}>
        <meshPhysicalMaterial color="#f4b6c9" roughness={0.22} clearcoat={1} clearcoatRoughness={0.08} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.4, 0.45, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <torusGeometry args={[0.2, 0.05, 20, 40, Math.PI]} />
        <meshPhysicalMaterial color="#f4b6c9" roughness={0.22} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      <mesh position={[0, 0.66, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.375, 48]} />
        <meshStandardMaterial map={liquid} roughness={0.32} metalness={0.02} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.424, 0.424, 0.5, 64, 1, true, -arc / 2, arc]} />
        <meshBasicMaterial map={print} transparent toneMapped={false} />
      </mesh>
      <Steam map={steam} />
    </group>
  );
};

/* ───────────────────────── scene ───────────────────────── */

interface SceneProps {
  zooming: boolean;
  onReady: () => void;
  onEnter: () => void;
}

const Scene: React.FC<SceneProps> = ({ zooming, onReady, onEnter }) => {
  const root = useRef<THREE.Group>(null!);
  const lid = useRef<THREE.Group>(null!);
  const wallMat = useRef<THREE.MeshBasicMaterial>(null!);
  const textMat = useRef<THREE.MeshBasicMaterial>(null!);
  const trackMat = useRef<THREE.MeshBasicMaterial>(null!);
  const fillMat = useRef<THREE.MeshBasicMaterial>(null!);
  const fill = useRef<THREE.Mesh>(null!);
  const btn = useRef<THREE.Mesh>(null!);
  const btnMat = useRef<THREE.MeshBasicMaterial>(null!);

  const sm = useRef({ x: 0, y: 0 });
  const readyAt = useRef<number | null>(null);
  const zoomStart = useRef<number | null>(null);
  const { size } = useThree();
  const aspect = size.width / size.height;
  const narrow = aspect < 1.2;

  const camPos = useMemo(() => new THREE.Vector3(), []);
  const camLook = useMemo(() => new THREE.Vector3(), []);
  const zoomPos = useMemo(() => new THREE.Vector3(0, 1.1, 1.7), []);
  const zoomLook = useMemo(() => new THREE.Vector3(0, 1.1, -1.36), []);

  const tex = useMemo(
    () => ({
      wall: canvasTex(1280, 800, drawWallpaper),
      greet: canvasTex(1280, 420, drawGreeting),
      btn: canvasTex(256, 256, drawEnterButton),
      call: cardTexture("Mica Danah Paris", "calling...", "M", ["#f9a8c0", "#e8567f"], callButtons),
      stack: cardTexture("Full stack", "Web and mobile apps", "{ }", ["#ffc58a", "#f08a4b"]),
      ucd: cardTexture("User-centered design", "Notification · now", "!", ["#ffd36b", "#f0a020"]),
      ml: cardTexture("Machine learning", "Applied AI", "AI", ["#a99bff", "#6a5cf0"]),
      sticky: stickyTexture(),
      print: mugPrintTexture(),
      steam: steamTexture(),
      matcha: matchaLiquidTexture(),
    }),
    []
  );

  const keys = useMemo(() => {
    const arr: [number, number][] = [];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 14; c++) arr.push([(c - 6.5) * 0.2, -0.78 + r * 0.2]);
    return arr;
  }, []);

  useFrame(({ clock, camera, pointer }) => {
    const t = clock.elapsedTime;
    const L = THREE.MathUtils.lerp;

    sm.current.x += (pointer.x - sm.current.x) * 0.06;
    sm.current.y += (pointer.y - sm.current.y) * 0.06;

    let zp = 0;
    if (zooming) {
      if (zoomStart.current === null) zoomStart.current = t;
      zp = ease(clamp01((t - zoomStart.current) / 0.9));
    }

    root.current.rotation.y = (sm.current.x * 0.22 + Math.sin(t * 0.4) * 0.02) * (1 - zp);
    root.current.rotation.x = -sm.current.y * 0.08 * (1 - zp);

    const baseZ = narrow ? 10.8 / aspect : 6.8 * Math.max(1, 1.7 / aspect);
    camPos.set(0, 1.9, baseZ).lerp(zoomPos, zp);
    camLook.set(0, 0.85, -0.3).lerp(zoomLook, zp);
    camera.position.copy(camPos);
    camera.lookAt(camLook);

    // lid opens, screen powers on, greeting fades in, progress fills
    const open = clamp01((t - 0.4) / 1.5);
    lid.current.rotation.x = L(Math.PI / 2 - 0.03, -0.25, ease(open));
    wallMat.current.color.setScalar(clamp01((open - 0.55) / 0.45));

    const textOp = clamp01((t - 1.9) / 0.8);
    textMat.current.opacity = textOp;

    const prog = clamp01((t - 1.6) / 1.8);
    fill.current.scale.x = Math.max(0.001, prog);
    if (prog >= 1 && readyAt.current === null) {
      readyAt.current = t;
      onReady();
    }
    const btnT = readyAt.current === null ? 0 : clamp01((t - readyAt.current) / 0.5);
    trackMat.current.opacity = textOp * (1 - btnT) * 0.35;
    fillMat.current.opacity = textOp * (1 - btnT);
    btnMat.current.opacity = btnT;
    btn.current.scale.setScalar((0.8 + 0.2 * ease(btnT)) * (1 + 0.05 * Math.sin(t * 3)));
  });

  const clickable = () => readyAt.current !== null && !zooming;

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 6, 5]} intensity={1.3} color="#fff4f2" />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 5, 3]} rotation-x={Math.PI / 2} scale={[10, 6, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ffd9e4" position={[-6, 2, 2]} rotation-y={Math.PI / 2} scale={[6, 4, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#fff1e6" position={[6, 2, 2]} rotation-y={-Math.PI / 2} scale={[6, 4, 1]} />
        <Lightformer form="ring" intensity={1} color="#ffffff" position={[0, 2, -6]} scale={8} />
      </Environment>

      <ContactShadows position={[0, 0.001, 0]} opacity={0.45} scale={16} blur={2.4} far={0.5} resolution={512} color="#8a5a68" />

      <group ref={root}>
        {/* ───── MacBook ───── */}
        <group
          onClick={(e) => {
            if (!clickable()) return;
            e.stopPropagation();
            onEnter();
          }}
          onPointerOver={() => { if (clickable()) document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { document.body.style.cursor = "auto"; }}
        >
          {/* base */}
          <RoundedBox args={[3.2, 0.08, 2.2]} radius={0.035} smoothness={4} position={[0, 0.04, 0]}>
            <meshStandardMaterial color="#d3d5da" metalness={1} roughness={0.3} />
          </RoundedBox>
          {/* keyboard well + keys */}
          <mesh position={[0, 0.0815, -0.38]} rotation-x={-Math.PI / 2}>
            <planeGeometry args={[2.92, 1.06]} />
            <meshStandardMaterial color="#0d0d10" roughness={0.8} />
          </mesh>
          {keys.map(([x, z], i) => (
            <mesh key={i} position={[x, 0.093, z]}>
              <boxGeometry args={[0.17, 0.024, 0.16]} />
              <meshStandardMaterial color="#1b1b1f" roughness={0.55} />
            </mesh>
          ))}
          {/* trackpad */}
          <RoundedBox args={[1.15, 0.006, 0.72]} radius={0.003} position={[0, 0.082, 0.64]}>
            <meshStandardMaterial color="#c7c9ce" metalness={0.6} roughness={0.35} />
          </RoundedBox>

          {/* lid (hinged at the back edge) */}
          <group ref={lid} position={[0, 0.085, -1.1]}>
            <RoundedBox args={[3.2, 2.1, 0.05]} radius={0.02} smoothness={4} position={[0, 1.05, 0]}>
              <meshStandardMaterial color="#d3d5da" metalness={1} roughness={0.3} />
            </RoundedBox>
            {/* bezel + display */}
            <group position={[0, 1.05, 0.0265]}>
              <mesh>
                <planeGeometry args={[3.12, 1.99]} />
                <meshBasicMaterial color="#050506" toneMapped={false} />
              </mesh>
              <mesh position={[0, 0, 0.002]}>
                <planeGeometry args={[3.04, 1.9]} />
                <meshBasicMaterial ref={wallMat} map={tex.wall} color="#000000" toneMapped={false} />
              </mesh>
              <mesh position={[0, 0.925, 0.004]}>
                <planeGeometry args={[0.3, 0.05]} />
                <meshBasicMaterial color="#050506" toneMapped={false} />
              </mesh>
              <mesh position={[0, 0.12, 0.004]}>
                <planeGeometry args={[2.6, 0.853]} />
                <meshBasicMaterial ref={textMat} map={tex.greet} transparent opacity={0} depthWrite={false} toneMapped={false} />
              </mesh>
              {/* progress */}
              <mesh position={[0, -0.5, 0.004]}>
                <planeGeometry args={[0.9, 0.012]} />
                <meshBasicMaterial ref={trackMat} color="#6b4a40" transparent opacity={0} depthWrite={false} toneMapped={false} />
              </mesh>
              <mesh ref={fill} position={[-0.45, -0.5, 0.006]}>
                <planeGeometry args={[0.9, 0.012]} onUpdate={(g) => g.translate(0.45, 0, 0)} />
                <meshBasicMaterial ref={fillMat} color="#6b4a40" transparent opacity={0} depthWrite={false} toneMapped={false} />
              </mesh>
              {/* enter button (arrow only) */}
              <mesh ref={btn} position={[0, -0.5, 0.008]}>
                <planeGeometry args={[0.34, 0.34]} />
                <meshBasicMaterial ref={btnMat} map={tex.btn} transparent opacity={0} depthWrite={false} toneMapped={false} />
              </mesh>
              {/* sticky note physically sticking to the actual screen */}
              <mesh position={[0.96, -0.32, 0.012]} rotation={[0, 0, -0.05]}>
                <planeGeometry args={[0.74, 0.74]} />
                <meshBasicMaterial map={tex.sticky} transparent toneMapped={false} />
              </mesh>
            </group>
          </group>
        </group>

        {/* ───── mouse ───── */}
        <Floaty base={[2.3, 0.03, 1.1]} depth={0.1} bob={0} ry={-0.25} appearAt={0.3}>
          <RoundedBox args={[0.46, 0.06, 0.84]} radius={0.03} smoothness={4}>
            <meshStandardMaterial color="#f1f2f4" metalness={0.2} roughness={0.28} />
          </RoundedBox>
        </Floaty>

        {/* ───── mug ───── */}
        <Floaty base={[-2.3, 0, 1.1]} depth={0.12} bob={0} ry={0.55} appearAt={0.3}>
          <Mug print={tex.print} steam={tex.steam} liquid={tex.matcha} />
        </Floaty>

        {/* ───── floating notification cards close to the screen model ───── */}
        {!narrow && (
          <>
            {/* Top-left: Mica Danah Paris calling... */}
            <Floaty base={[-1.85, 2.15, -0.45]} depth={0.16} appearAt={1.0} phase={0}>
              <mesh>
                <planeGeometry args={[1.6, 0.47]} />
                <meshBasicMaterial map={tex.call} transparent toneMapped={false} />
              </mesh>
            </Floaty>
            {/* Mid-left: User-centered design */}
            <Floaty base={[-2.05, 1.5, -0.4]} depth={0.18} appearAt={1.3} phase={1.4}>
              <mesh>
                <planeGeometry args={[1.6, 0.47]} />
                <meshBasicMaterial map={tex.ucd} transparent toneMapped={false} />
              </mesh>
            </Floaty>
            {/* Top-right: Full stack */}
            <Floaty base={[1.85, 2.15, -0.45]} depth={0.16} appearAt={1.6} phase={2.4}>
              <mesh>
                <planeGeometry args={[1.6, 0.47]} />
                <meshBasicMaterial map={tex.stack} transparent toneMapped={false} />
              </mesh>
            </Floaty>
            {/* Mid-right: Machine learning */}
            <Floaty base={[2.05, 1.5, -0.4]} depth={0.18} appearAt={1.9} phase={3.1}>
              <mesh>
                <planeGeometry args={[1.6, 0.47]} />
                <meshBasicMaterial map={tex.ml} transparent toneMapped={false} />
              </mesh>
            </Floaty>
          </>
        )}
      </group>
    </>
  );
};

/* ───────────────────────── component ───────────────────────── */

export const DesktopLoader: React.FC<DesktopLoaderProps> = ({ onEnter, soundEnabled }) => {
  const [fontsReady, setFontsReady] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isZooming, setIsZooming] = useState<boolean>(false);

  // Load the script + handwriting fonts before the canvas textures are drawn.
  useEffect(() => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        setFontsReady(true);
      }
    };
    const loadFaces = () =>
      Promise.all([
        document.fonts.load('200px "Pinyon Script"'),
        document.fonts.load('500 40px "Caveat"'),
      ]).then(finish, finish);

    const id = "danah-loader-fonts";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@500&family=Pinyon+Script&display=swap";
      link.onload = loadFaces;
      link.onerror = finish;
      document.head.appendChild(link);
    } else {
      loadFaces();
    }
    const timeout = setTimeout(finish, 2500);
    return () => clearTimeout(timeout);
  }, []);

  const handleEnter = useCallback(() => {
    if (!isReady || isZooming) return;
    playUiClick(soundEnabled);
    document.body.style.cursor = "auto";
    setIsZooming(true);
    setTimeout(onEnter, 1000);
  }, [isReady, isZooming, soundEnabled, onEnter]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden select-none"
      style={{ background: "radial-gradient(ellipse at 50% 38%, #fdf5f6 0%, #f5e4e8 58%, #ebd3d9 100%)" }}
    >
      {fontsReady && (
        <div className="absolute inset-0">
          <Canvas dpr={[1, 2]} camera={{ position: [0, 1.9, 6.8], fov: 32 }} gl={{ antialias: true, alpha: true }}>
            <Scene zooming={isZooming} onReady={() => setIsReady(true)} onEnter={handleEnter} />
          </Canvas>
        </div>
      )}

      {/* fade into the portfolio at the end of the zoom */}
      <div
        className={`pointer-events-none absolute inset-0 bg-[#f6e3e8] transition-opacity duration-300 ${isZooming ? "opacity-100 delay-[700ms]" : "opacity-0"
          }`}
      />

      {/* keyboard access */}
      {isReady && (
        <button type="button" className="sr-only" onClick={handleEnter}>
          Enter workspace
        </button>
      )}
    </div>
  );
};