"use client";

/**
 * Danah's Bakery (3D)
 * ------------------------------------------------------------------
 * Needs the same packages as the loader:
 *   npm i three @react-three/fiber @react-three/drei
 *
 * - Curved-front display case with two shelves of pastries
 * - Click a pastry -> it drops into the box. Click it in the box to take it out.
 * - Each pastry is one of your contact channels; "Checkout & Connect" opens them.
 * - Real photos: give a pastry a `photo` (transparent PNG in /public/pastries).
 *   If the file is missing, the 3D pastry is shown instead, so nothing breaks.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, Environment, Lightformer, ContactShadows, Html } from "@react-three/drei";
import confetti from "canvas-confetti";
import { ArrowRight, ExternalLink, FileDown, Heart, Mail, Phone, RotateCcw, ShoppingBag, X } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/UI/Icons";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { playPastryPop, playUiClick } from "@/utils/sound";

/* ───────────────────────── data ───────────────────────── */

type Kind = "swirl" | "croissant" | "cookie" | "danish" | "knot" | "babka";

interface Pastry {
  id: string;
  name: string;
  channel: string;
  desc: string;
  price: number;
  iconType: "mail" | "linkedin" | "github" | "resume" | "senas" | "phone";
  link: string;
  kind: Kind;
  photo?: string; // optional transparent PNG, e.g. "/pastries/cinnamon-swirl.png"
  isExternal?: boolean;
  isDownload?: boolean;
}

const PASTRIES: Pastry[] = [
  {
    id: "cinnamon-swirl", name: "Cinnamon Swirl", channel: "Gmail", price: 6.0,
    desc: "Send a direct message to Danah's inbox", iconType: "mail",
    link: `mailto:${PORTFOLIO_DATA.profile.email}`, kind: "swirl",
    isExternal: true,
  },
  {
    id: "butter-croissant", name: "Butter Croissant", channel: "LinkedIn", price: 4.5,
    desc: "Connect on LinkedIn for opportunities", iconType: "linkedin",
    link: PORTFOLIO_DATA.profile.linkedin, kind: "croissant", isExternal: true,
  },
  {
    id: "choco-chip", name: "Chocolate Chip Cookie", channel: "GitHub", price: 4.0,
    desc: "Explore repositories, code & commits", iconType: "github",
    link: PORTFOLIO_DATA.profile.github, kind: "cookie", isExternal: true,
  },
  {
    id: "strawberry-danish", name: "Strawberry Danish", channel: "Resume PDF", price: 5.5,
    desc: "Download official resume document", iconType: "resume",
    link: PORTFOLIO_DATA.profile.resumePath, kind: "danish", isDownload: true,
  },
  {
    id: "cardamom-knot", name: "Cardamom Knot", channel: "señas.tech", price: 5.0,
    desc: "Visit the live sign language platform", iconType: "senas",
    link: "https://señas.tech", kind: "knot", isExternal: true,
  },
  {
    id: "chocolate-babka", name: "Chocolate Babka", channel: "Direct Phone", price: 5.0,
    desc: "Call or text for immediate contact", iconType: "phone",
    link: `tel:${PORTFOLIO_DATA.profile.phone}`, kind: "babka", isExternal: true,
  },
];

const SCRIPT = '"Pinyon Script", "Snell Roundhand", "Brush Script MT", cursive';
const WINE = "#7d1f3f";

/* ───────────────────────── 3D pastries ───────────────────────── */

const Mat: React.FC<{ c: string; r?: number; cc?: number }> = ({ c, r = 0.6, cc = 0 }) => (
  <meshPhysicalMaterial color={c} roughness={r} clearcoat={cc} clearcoatRoughness={0.3} />
);

class SpiralCurve extends THREE.Curve<THREE.Vector3> {
  constructor(private turns: number, private r0: number, private r1: number) {
    super();
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    const a = t * this.turns * Math.PI * 2;
    const r = this.r0 + (this.r1 - this.r0) * t;
    return target.set(Math.cos(a) * r, 0, Math.sin(a) * r);
  }
}

const Swirl: React.FC = () => {
  const dough = useMemo(() => new THREE.TubeGeometry(new SpiralCurve(2.4, 0.05, 0.36), 180, 0.1, 12, false), []);
  const icing = useMemo(() => new THREE.TubeGeometry(new SpiralCurve(2.4, 0.05, 0.36), 180, 0.055, 10, false), []);
  return (
    <group>
      <mesh position-y={0.07}>
        <cylinderGeometry args={[0.47, 0.47, 0.12, 48]} />
        <Mat c="#c98a4b" r={0.7} />
      </mesh>
      <mesh geometry={dough} position-y={0.17}>
        <Mat c="#d9a05b" r={0.65} />
      </mesh>
      <mesh geometry={icing} position-y={0.24}>
        <Mat c="#fff4e2" r={0.3} cc={0.6} />
      </mesh>
      <mesh position-y={0.15} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.45, 0.09, 14, 64]} />
        <Mat c="#c98547" r={0.7} />
      </mesh>
    </group>
  );
};

const Croissant: React.FC = () => {
  const segs = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const u = i / 8;
        return { i, a: (u - 0.5) * 2.3, s: Math.max(0.25, 1 - Math.abs(u - 0.5) * 1.7) };
      }),
    []
  );
  return (
    <group position-y={0.13} rotation-y={Math.PI}>
      {segs.map(({ i, a, s }) => (
        <mesh
          key={i}
          position={[Math.sin(a) * 0.52, 0.02, (Math.cos(a) - 0.75) * 0.52]}
          rotation-y={a}
          scale={[0.13, 0.1 + 0.1 * s, 0.1 + 0.14 * s]}
        >
          <sphereGeometry args={[1, 24, 16]} />
          <Mat c={i % 2 ? "#e2a652" : "#d7963f"} r={0.5} cc={0.3} />
        </mesh>
      ))}
    </group>
  );
};

const Cookie: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 4);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const r = 1 + Math.sin(x * 9.1 + y * 3.3) * Math.cos(z * 8.7 + x * 2.1) * 0.06;
      p.setXYZ(i, x * r, y * r, z * r);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const chips = useMemo(() => {
    const pts: [number, number][] = [
      [0.12, 0.08], [-0.2, 0.16], [0.24, -0.15], [-0.1, -0.24], [-0.01, -0.02],
      [-0.3, -0.06], [0.06, 0.3], [0.3, 0.1], [-0.22, 0.3], [0.17, -0.3],
    ];
    return pts.map(([x, z]) => {
      const r = Math.min(0.95, Math.hypot(x, z) / 0.46);
      return { x, z, y: 0.1 + 0.13 * Math.sqrt(1 - r * r) - 0.01 };
    });
  }, []);
  return (
    <group>
      <mesh geometry={geo} position-y={0.1} scale={[0.46, 0.13, 0.46]}>
        <Mat c="#cf9550" r={0.75} />
      </mesh>
      {chips.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]} rotation-y={i} scale={[0.07, 0.045, 0.06]}>
          <icosahedronGeometry args={[1, 1]} />
          <Mat c="#3b1f14" r={0.35} cc={0.5} />
        </mesh>
      ))}
    </group>
  );
};

const Danish: React.FC = () => (
  <group>
    <RoundedBox args={[0.84, 0.14, 0.84]} radius={0.05} smoothness={4} position-y={0.07}>
      <Mat c="#d8a057" r={0.6} />
    </RoundedBox>
    <RoundedBox args={[0.7, 0.05, 0.7]} radius={0.04} smoothness={4} position-y={0.15}>
      <Mat c="#e8b66b" r={0.5} />
    </RoundedBox>
    <RoundedBox args={[0.5, 0.05, 0.5]} radius={0.04} smoothness={4} position-y={0.19}>
      <Mat c="#fff3dc" r={0.4} cc={0.3} />
    </RoundedBox>
    {[[-0.1, -0.06], [0.1, 0.07]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.27, z]} scale={[1, 1.1, 1]}>
        <sphereGeometry args={[0.11, 24, 16]} />
        <Mat c="#d62f45" r={0.2} cc={1} />
      </mesh>
    ))}
    <mesh position={[0, 0.225, 0.0]} rotation-x={-Math.PI / 2}>
      <circleGeometry args={[0.2, 32]} />
      <Mat c="#f2a2ad" r={0.2} cc={1} />
    </mesh>
  </group>
);

const Knot: React.FC = () => (
  <group>
    <mesh position-y={0.16} rotation-x={Math.PI / 2} scale={[1, 1, 0.65]}>
      <torusKnotGeometry args={[0.27, 0.088, 180, 18, 2, 3]} />
      <Mat c="#d99a55" r={0.55} cc={0.3} />
    </mesh>
  </group>
);

const Babka: React.FC = () => {
  const strand = (phase: number) =>
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(
        Array.from({ length: 25 }, (_, i) => {
          const x = -0.42 + (0.84 * i) / 24;
          return new THREE.Vector3(x, 0.16 + Math.cos(x * 14 + phase) * 0.03, Math.sin(x * 14 + phase) * 0.12);
        })
      ),
      120, 0.12, 12, false
    );
  const a = useMemo(() => strand(0), []);
  const b = useMemo(() => strand(Math.PI), []);
  return (
    <group>
      <RoundedBox args={[0.98, 0.12, 0.5]} radius={0.05} smoothness={4} position-y={0.06}>
        <Mat c="#8a5a2e" r={0.7} />
      </RoundedBox>
      <mesh geometry={a}>
        <Mat c="#3d2016" r={0.35} cc={0.5} />
      </mesh>
      <mesh geometry={b}>
        <Mat c="#a8682f" r={0.55} cc={0.2} />
      </mesh>
    </group>
  );
};

const MODELS: Record<Kind, React.FC> = {
  swirl: Swirl, croissant: Croissant, cookie: Cookie, danish: Danish, knot: Knot, babka: Babka,
};

/** Turns 3D models on hover; real photos stay facing the camera. */
const Spinner: React.FC<{ active: boolean; yaw: number; children: React.ReactNode }> = ({ active, yaw, children }) => {
  const g = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    const r = g.current.rotation.y;
    if (active) g.current.rotation.y += dt * 1.4;
    else {
      const target = yaw + Math.round((r - yaw) / (Math.PI * 2)) * Math.PI * 2;
      g.current.rotation.y = THREE.MathUtils.lerp(r, target, 0.1);
    }
  });
  return <group ref={g} rotation-y={yaw}>{children}</group>;
};

/** A real photo cut-out if the file loads, otherwise the 3D model. */
const Pastry3D: React.FC<{ p: Pastry; counterTilt: number; spinning?: boolean; yaw?: number }> = ({
  p, counterTilt, spinning = false, yaw = 0,
}) => {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!p.photo) return;
    let alive = true;
    new THREE.TextureLoader().load(
      p.photo,
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        if (alive) setTex(t);
      },
      undefined,
      () => { }
    );
    return () => { alive = false; };
  }, [p.photo]);

  if (tex) {
    return (
      <group rotation-x={-counterTilt} position-y={0.5}>
        <mesh>
          <planeGeometry args={[1.25, 1.25]} />
          <meshBasicMaterial map={tex} transparent toneMapped={false} />
        </mesh>
      </group>
    );
  }
  const Model = MODELS[p.kind];
  return (
    <Spinner active={spinning} yaw={yaw}>
      <Model />
    </Spinner>
  );
};

/* ───────────────────────── scene pieces ───────────────────────── */

const SHELF_TILT = 0.55;
const BOX_TILT = 0.62;

interface ShelfItemProps {
  p: Pastry;
  x: number;
  selected: boolean;
  hovered: boolean;
  onHover: (id: string | null) => void;
  onToggle: (p: Pastry) => void;
}

const ShelfItem: React.FC<ShelfItemProps> = ({ p, x, selected, hovered, onHover, onToggle }) => {
  const outer = useRef<THREE.Group>(null!);
  useFrame(() => {
    outer.current.scale.setScalar(THREE.MathUtils.lerp(outer.current.scale.x, hovered ? 1.1 : 1, 0.15));
  });
  return (
    <group position={[x, 0.07, 0]}>
      <group
        ref={outer}
        onPointerOver={(e) => { e.stopPropagation(); onHover(p.id); }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => { e.stopPropagation(); onToggle(p); }}
      >
        <mesh position-y={-0.01}>
          <cylinderGeometry args={[0.7, 0.64, 0.05, 56]} />
          <meshPhysicalMaterial color="#f7ecd2" roughness={0.35} metalness={0.15} clearcoat={0.5} />
        </mesh>
        {(selected || hovered) && (
          <mesh position-y={0.03} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.76, 0.03, 12, 64]} />
            <meshBasicMaterial color={selected ? "#e8567f" : "#f5b5c6"} toneMapped={false} />
          </mesh>
        )}
        <Pastry3D p={p} counterTilt={SHELF_TILT} spinning={hovered} />
      </group>
      {hovered && (
        <Html position={[0, 1.0, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div className="whitespace-nowrap rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#6b2a3f] shadow-md">
            {p.name} · {p.channel} · ${p.price.toFixed(2)}
          </div>
        </Html>
      )}
    </group>
  );
};

interface BoxItemProps {
  p: Pastry;
  index: number;
  onRemove: (p: Pastry) => void;
  onHover: (id: string | null) => void;
}

const BoxItem: React.FC<BoxItemProps> = ({ p, index, onRemove, onHover }) => {
  const g = useRef<THREE.Group>(null!);
  const col = index % 3;
  const row = Math.floor(index / 3);
  const target = useMemo(() => new THREE.Vector3((col - 1) * 1.08, 0.1, (row - 0.5) * 1.15), [col, row]);
  useFrame(() => {
    const L = THREE.MathUtils.lerp;
    g.current.scale.setScalar(L(g.current.scale.x, 0.72, 0.14));
    g.current.position.x = L(g.current.position.x, target.x, 0.14);
    g.current.position.z = L(g.current.position.z, target.z, 0.14);
    g.current.position.y = L(g.current.position.y, target.y, 0.14);
  });
  return (
    <group
      ref={g}
      position={[target.x, 1.6, target.z]}
      scale={0.001}
      onPointerOver={(e) => { e.stopPropagation(); onHover(`box:${p.id}`); }}
      onPointerOut={() => onHover(null)}
      onClick={(e) => { e.stopPropagation(); onRemove(p); }}
    >
      <Pastry3D p={p} counterTilt={BOX_TILT} yaw={index * 0.7} />
    </group>
  );
};

interface SceneProps {
  box: Pastry[];
  hoverId: string | null;
  onHover: (id: string | null) => void;
  onToggle: (p: Pastry) => void;
}

const Scene: React.FC<SceneProps> = ({ box, hoverId, onHover, onToggle }) => {
  const { size } = useThree();
  const aspect = size.width / size.height;
  const cam = useRef({ x: 0, y: 6 });

  useEffect(() => {
    document.body.style.cursor = hoverId ? "pointer" : "auto";
    return () => { document.body.style.cursor = "auto"; };
  }, [hoverId]);

  useFrame(({ camera, pointer }) => {
    cam.current.x += (pointer.x * 0.7 - cam.current.x) * 0.05;
    cam.current.y += (6 + pointer.y * 0.35 - cam.current.y) * 0.05;
    camera.position.set(cam.current.x, cam.current.y, Math.max(13.4, 23.1 / aspect));
    camera.lookAt(0, 1.5, 0);
  });

  const upper = PASTRIES.slice(0, 3);
  const lower = PASTRIES.slice(3, 6);
  const inBox = (id: string) => box.some((b) => b.id === id);

  const shelf = (items: Pastry[], y: number) => (
    <group position={[0, y, 0]} rotation-x={SHELF_TILT}>
      <mesh>
        <boxGeometry args={[5.4, 0.04, 1.75]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.55} roughness={0.08} clearcoat={1} />
      </mesh>
      {items.map((p, i) => (
        <ShelfItem
          key={p.id}
          p={p}
          x={(i - 1) * 1.8}
          selected={inBox(p.id)}
          hovered={hoverId === p.id}
          onHover={onHover}
          onToggle={onToggle}
        />
      ))}
    </group>
  );

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 7, 6]} intensity={1.2} color="#fff1ee" />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 6, 4]} rotation-x={Math.PI / 2} scale={[12, 6, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#ffd9e4" position={[-7, 3, 3]} rotation-y={Math.PI / 2} scale={[6, 4, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#fff1e6" position={[7, 3, 3]} rotation-y={-Math.PI / 2} scale={[6, 4, 1]} />
      </Environment>
      <ContactShadows position={[0, 0.002, 0]} opacity={0.3} scale={18} blur={2.6} far={2} resolution={512} color="#8a3a55" />

      {/* counter */}
      <RoundedBox args={[15, 0.9, 4.6]} radius={0.08} smoothness={4} position={[0, -0.45, 0.7]}>
        <meshPhysicalMaterial color="#f7d3de" roughness={0.35} clearcoat={0.6} />
      </RoundedBox>

      {/* display case */}
      <group position={[-1.9, 0, 0]}>
        <RoundedBox args={[5.7, 0.9, 2.2]} radius={0.06} smoothness={4} position={[0, 0.45, 0]}>
          <meshPhysicalMaterial color="#f3b8c8" roughness={0.45} />
        </RoundedBox>
        {Array.from({ length: 27 }, (_, i) => (
          <mesh key={i} position={[-2.6 + i * 0.2, 0.45, 1.11]}>
            <boxGeometry args={[0.07, 0.7, 0.04]} />
            <meshStandardMaterial color="#f9d0dc" roughness={0.4} />
          </mesh>
        ))}
        <RoundedBox args={[5.7, 0.1, 2.2]} radius={0.04} position={[0, 0.95, 0]}>
          <meshStandardMaterial color={WINE} metalness={0.6} roughness={0.3} />
        </RoundedBox>
        <RoundedBox args={[5.7, 0.14, 2.2]} radius={0.06} smoothness={4} position={[0, 3.65, 0]}>
          <meshStandardMaterial color={WINE} metalness={0.6} roughness={0.3} />
        </RoundedBox>
        {[[-2.78, 1], [2.78, 1], [-2.78, -1], [2.78, -1]].map(([x, z], i) => (
          <mesh key={i} position={[x, 2.3, z]}>
            <cylinderGeometry args={[0.05, 0.05, 2.7, 16]} />
            <meshStandardMaterial color={WINE} metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
        {/* glass shell, ignores clicks so pastries stay clickable */}
        <mesh position={[0, 2.3, 0]} raycast={() => null}>
          <boxGeometry args={[5.5, 2.7, 2.05]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.1} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {shelf(upper, 2.95)}
        {shelf(lower, 1.55)}
      </group>

      {/* box */}
      <group position={[4.0, 0.62, 1.0]} rotation={[BOX_TILT, -0.18, 0]}>
        <RoundedBox args={[3.5, 0.14, 2.5]} radius={0.05} smoothness={4}>
          <meshPhysicalMaterial color="#ee9db3" roughness={0.5} />
        </RoundedBox>
        <mesh position-y={0.075} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[3.3, 2.3]} />
          <meshStandardMaterial color="#fff6e4" roughness={0.9} />
        </mesh>
        {[[0, 1.2, 3.5, 0.1], [0, -1.2, 3.5, 0.1]].map(([x, z, w, d], i) => (
          <RoundedBox key={i} args={[w, 0.34, d]} radius={0.03} position={[x, 0.2, z]}>
            <meshPhysicalMaterial color="#e98aa5" roughness={0.5} />
          </RoundedBox>
        ))}
        {[-1.7, 1.7].map((x, i) => (
          <RoundedBox key={i} args={[0.1, 0.34, 2.5]} radius={0.03} position={[x, 0.2, 0]}>
            <meshPhysicalMaterial color="#e98aa5" roughness={0.5} />
          </RoundedBox>
        ))}
        {box.map((p, i) => (
          <BoxItem key={p.id} p={p} index={i} onRemove={onToggle} onHover={onHover} />
        ))}
      </group>
    </>
  );
};

/* ───────────────────────── section ───────────────────────── */

const renderIcon = (type: Pastry["iconType"]) => {
  switch (type) {
    case "mail": return <Mail className="h-5 w-5 text-rose-600" />;
    case "linkedin": return <LinkedinIcon className="h-5 w-5 text-blue-600" />;
    case "github": return <GithubIcon className="h-5 w-5 text-slate-800" />;
    case "resume": return <FileDown className="h-5 w-5 text-amber-600" />;
    case "senas": return <ExternalLink className="h-5 w-5 text-indigo-600" />;
    case "phone": return <Phone className="h-5 w-5 text-slate-700" />;
    default: return <ShoppingBag className="h-5 w-5 text-pink-600" />;
  }
};

export const ButterDaysBakery: React.FC = () => {
  const [box, setBox] = useState<Pastry[]>([PASTRIES[0], PASTRIES[1]]);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [isCheckedOut, setIsCheckedOut] = useState<boolean>(false);
  const [isTying, setIsTying] = useState<boolean>(false);
  const [inView, setInView] = useState<boolean>(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const total = box.reduce((acc, p) => acc + p.price, 0);

  // same script font as the loader
  useEffect(() => {
    const id = "danah-loader-fonts";
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id;
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@500&family=Pinyon+Script&display=swap";
    document.head.appendChild(l);
  }, []);

  // only animate while the case is on screen
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, [isCheckedOut]);

  const toggle = (p: Pastry) => {
    const has = box.some((b) => b.id === p.id);
    if (has) playUiClick(true);
    else playPastryPop(true);
    setBox((prev) => (has ? prev.filter((b) => b.id !== p.id) : [...prev, p]));
  };

  const handleCheckout = () => {
    if (box.length === 0) return;
    setIsTying(true);
    setTimeout(() => {
      setIsTying(false);
      setIsCheckedOut(true);
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#fda4af", "#f43f5e", "#fbcfe8", "#7d1f3f", "#ffffff"],
      });
    }, 900);
  };

  return (
    <section id="bakery" className="mx-auto max-w-6xl scroll-mt-12 select-none px-4 py-20">
      <div className="mb-8">
        <h2 className="text-6xl leading-none text-[#6b2a3f] sm:text-7xl" style={{ fontFamily: SCRIPT }}>
          Danah&apos;s Bakery
        </h2>
        <p className="mt-3 max-w-xl text-sm text-[#8a5a66] sm:text-base">
          Pick a pastry from the case and it goes into your box. Check out, and each one opens a way to reach me.
        </p>
      </div>

      {isCheckedOut ? (
        <div className="mx-auto max-w-md space-y-5 rounded-3xl border border-pink-200 bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-pink-300 bg-pink-100">
            <Heart className="h-8 w-8 fill-pink-500 text-pink-600" />
          </div>
          <h3 className="text-3xl text-[#6b2a3f]" style={{ fontFamily: SCRIPT }}>Your box is ready</h3>
          <p className="text-xs leading-relaxed text-slate-600">Tap a channel to open it or message Danah directly.</p>
          <div className="space-y-2 text-left">
            {box.map((item) => (
              <a
                key={item.id}
                href={item.link}
                target={item.isExternal ? "_blank" : undefined}
                rel={item.isExternal ? "noopener noreferrer" : undefined}
                download={item.isDownload ? "MicaDanahParis_Resume.pdf" : undefined}
                onClick={() => playUiClick(true)}
                className="flex items-center justify-between rounded-2xl border border-pink-200 bg-pink-50/70 p-3 transition hover:bg-pink-100"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white p-1.5 shadow-sm">{renderIcon(item.iconType)}</div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{item.name}</div>
                    <div className="text-[11px] font-semibold text-pink-700">{item.channel}</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-pink-600" />
              </a>
            ))}
          </div>
          <button
            onClick={() => setIsCheckedOut(false)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7d1f3f] py-3 text-xs font-semibold text-white transition hover:bg-[#651833]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Back to the case</span>
          </button>
        </div>
      ) : (
        <>
          <div
            ref={wrapRef}
            className="relative h-[520px] overflow-hidden rounded-[2rem] border border-[#f0c4d0] shadow-[0_30px_80px_-30px_rgba(125,31,63,0.35)] sm:h-[620px] lg:h-[680px]"
            style={{
              background:
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.22) 0 38px, rgba(255,255,255,0) 38px 76px), linear-gradient(180deg,#fde9ee 0%,#f9d3df 55%,#f3bccd 100%)",
            }}
          >
            <Canvas
              dpr={[1, 2]}
              frameloop={inView ? "always" : "never"}
              camera={{ position: [0, 6, 13.4], fov: 30 }}
              gl={{ antialias: true, alpha: true }}
            >
              <Scene box={box} hoverId={hoverId} onHover={setHoverId} onToggle={toggle} />
            </Canvas>

            {/* register display */}
            <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl bg-[#7d1f3f] px-5 py-3 text-[#ffe9ef] shadow-xl sm:bottom-6 sm:left-8">
              <div className="text-[11px] text-[#f5b5c6]">{box.length} of {PASTRIES.length} in your box</div>
              <div className="text-3xl font-semibold tabular-nums">${total.toFixed(2)}</div>
            </div>
          </div>

          {/* controls: also the touch-friendly way to pick */}
          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {PASTRIES.map((p) => {
                const on = box.some((b) => b.id === p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggle(p)}
                    aria-pressed={on}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${on
                      ? "border-[#7d1f3f] bg-[#7d1f3f] text-white"
                      : "border-pink-200 bg-white text-[#6b2a3f] hover:border-pink-400"
                      }`}
                  >
                    {on && <X className="h-3 w-3" />}
                    <span>{p.channel}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden text-xs text-[#8a5a66] sm:inline">Complimentary treat. No payment taken.</span>
              {box.length > 0 && (
                <button onClick={() => setBox([])} className="text-xs font-semibold text-rose-700 hover:underline">
                  Clear box
                </button>
              )}
              <button
                onClick={handleCheckout}
                disabled={box.length === 0 || isTying}
                className="flex items-center gap-2 rounded-full bg-[#7d1f3f] px-6 py-3 text-xs font-bold text-white shadow-lg shadow-[#7d1f3f]/25 transition hover:scale-[1.02] hover:bg-[#651833] disabled:opacity-50"
              >
                {isTying ? (
                  <span>Tying the ribbon...</span>
                ) : (
                  <>
                    <span>Checkout &amp; Connect</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};