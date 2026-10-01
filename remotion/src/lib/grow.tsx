// Grow kit — a PROCEDURAL GROWTH engine: tips integrated step by step under Sachs' sine law
// of gravitropism, plus the scene atoms a germination explainer needs. Seeds short-14.
//
// The engine in one line: per step, `ang += k * sin(target - ang) + bias + wander`, then
// advance one step along `ang`. Sachs' law states the gravitropic response is proportional to
// the SINE of the angle between the organ's axis and the vertical — so that one line is the
// model, not a stylisation of it, and every organ on screen is the same call with a different
// initial angle:
//
//   primary root   ang0 =  +72deg, target = down, k = 0.22   -> straightens down fast
//   lateral roots  ang0 = +-60deg, target = down, k = 0.045  -> a WEAK gain, so they hold an
//                                                               oblique angle instead of diving
//                                                               (the gravitropic set-point angle)
//   flipped root   ang0 = -108deg, target = down, k = 0.22   -> THE SAME CONSTANTS as the
//                                                               primary, one changed initial
//                                                               angle: slowest when inverted,
//                                                               fastest through horizontal,
//                                                               arrives vertical
//   shoot          ang0 =  -84deg, target = up,   k = 0.22   -> negative gravitropism, plus a
//                                                               differential-growth term active
//                                                               ONLY in the apical zone and only
//                                                               while the hook has not relaxed
//
// The apical hook is what makes the shoot term local rather than global: a constant bias over a
// growing axis draws a CIRCLE (measured — it coils underground), while a bias confined to the
// elongation zone behind the tip migrates upward with the tip and leaves a straight stem behind
// it. That is basipetal straightening, and it is the difference between a seedling and a spring.
//
// Generic by design — a new plant ships new constants, not a new engine.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const TAU = Math.PI * 2;
export const D2R = (deg: number) => (deg * Math.PI) / 180;

// Same generator as lib/cycle.tsx — kept local so this kit stands alone for the series.
export function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const sstep = (t: number, a: number, b: number) => {
  const x = clamp01((t - a) / Math.max(0.0001, b - a));
  return x * x * (3 - 2 * x);
};

// =============================================================================
// GEOMETRY — the one place the scene's fixed points live.
// =============================================================================
export const GROW_GEOM = {
  soilY: 950, // the surface. Below it is the cutaway, above it is sky.
  seedX: 540,
  seedY: 1064, // 114px of cover — deep enough that the hook forms out of sight
  seedRX: 46,
  seedRY: 34,
  rootY: 1092, // where the radicle leaves the seed
  shootY: 1042, // where the shoot leaves the seed
  canopyY: 461, // where the tip lands once straightened (measured from the solver)
} as const;

export const GROW_COLORS = {
  skyTop: '#dfeef8',
  skyLow: '#fbf3e0',
  soilTop: '#6b4a33',
  soil: '#4a3223',
  soilDeep: '#2b1c13',
  root: '#f2e3cc',
  rootEdge: '#cbb08c',
  stem: '#5fbf7a',
  leaf: '#46a862',
  leafDark: '#2f7d47',
  cotyledon: '#8ad79a',
  coat: '#a9713f',
  coatDark: '#7d5029',
  flesh: '#f7ead2',
  food: '#f5d76e',
  embryo: '#5fbf7a',
  water: '#5fc7e8',
  accent: '#f5d76e',
} as const;

export type Pt = [number, number];

export type Branch = {
  pts: Pt[];
  w0: number;
  w1: number;
  t0: number; // growth window inside the organ's 0..1 progress
  t1: number;
};

// =============================================================================
// THE SOLVER — Sachs' sine law, integrated.
// =============================================================================
export type TropismCfg = {
  x: number;
  y: number;
  ang: number; // initial heading, radians (SVG: +y is DOWN, so +PI/2 is down)
  target: number; // the organ's set-point: +PI/2 for roots, -PI/2 for shoots
  k: number; // gravitropic gain
  steps: number;
  step: number; // px per step
  seed: number;
  wander?: number;
  /** constant differential-growth term (used for the apical hook), per step */
  hook?: number;
  /** how many steps behind the tip the hook term is active */
  hookLen?: number;
};

export function tropism(cfg: TropismCfg): Pt[] {
  const rnd = mulberry32(cfg.seed);
  const n = Math.max(0, Math.round(cfg.steps));
  const wander = cfg.wander ?? 0;
  const hook = cfg.hook ?? 0;
  const hookLen = cfg.hookLen ?? 0;
  const pts: Pt[] = [[cfg.x, cfg.y]];
  let a = cfg.ang;
  let x = cfg.x;
  let y = cfg.y;
  for (let i = 0; i < n; i++) {
    // SACHS' SINE LAW: response proportional to sin(angle between the axis and the vertical).
    const grav = cfg.k * Math.sin(cfg.target - a);
    // the apical zone only — a bias over the WHOLE axis coils instead of hooking
    const zone = hook === 0 ? 0 : clamp01((hookLen + 4 - (n - i)) / 4);
    a += grav + hook * zone + wander * (rnd() - 0.5);
    x += Math.cos(a) * cfg.step;
    y += Math.sin(a) * cfg.step;
    pts.push([x, y]);
  }
  return pts;
}

/** The first `p` (0..1) of a polyline, with the partial last segment interpolated. */
export const partial = (pts: Pt[], p: number): Pt[] => {
  const c = clamp01(p);
  if (pts.length < 2 || c <= 0) return [];
  const n = (pts.length - 1) * c;
  const i = Math.floor(n);
  const fr = n - i;
  const out = pts.slice(0, i + 1);
  if (fr > 0.001 && i + 1 < pts.length) {
    out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * fr, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * fr]);
  }
  return out;
};

/** Tip position + heading of a polyline (for hanging cotyledons off a growing shoot). */
export const tipOf = (pts: Pt[]) => {
  if (pts.length === 0) return { x: 0, y: 0, ang: -Math.PI / 2 };
  if (pts.length === 1) return { x: pts[0][0], y: pts[0][1], ang: -Math.PI / 2 };
  const b = pts[pts.length - 1];
  const a = pts[pts.length - 2];
  return { x: b[0], y: b[1], ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
};

/**
 * A tapered ribbon around a polyline. `full` is the FULL branch's segment count so a
 * half-grown branch is drawn at half its taper, not squeezed to the tip width.
 */
export const taperedPath = (pts: Pt[], w0: number, w1: number, full?: number): string => {
  if (pts.length < 2) return '';
  const N = Math.max(1, full ?? pts.length - 1);
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const m = Math.hypot(dx, dy) || 1;
    const nx = -dy / m;
    const ny = dx / m;
    const w = (w0 + (w1 - w0) * clamp01(i / N)) / 2;
    L.push([pts[i][0] + nx * w, pts[i][1] + ny * w]);
    R.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
  }
  const fwd = L.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');
  const back = R.reverse()
    .map((p) => `L ${p[0].toFixed(2)} ${p[1].toFixed(2)}`)
    .join(' ');
  return `${fwd} ${back} Z`;
};

// =============================================================================
// THE ROOT SYSTEM — a primary radicle plus laterals that branch behind the tip,
// oldest longest (the acropetal order real root systems branch in).
// =============================================================================
export function growRootSystem(cfg: { x: number; y: number; seed: number; scale?: number }): Branch[] {
  const s = cfg.scale ?? 1;
  const primary = tropism({
    x: cfg.x,
    y: cfg.y,
    ang: D2R(72),
    target: D2R(90),
    k: 0.22,
    wander: 0.075,
    steps: 28,
    step: 6.8 * s,
    seed: cfg.seed,
  });
  const out: Branch[] = [{ pts: primary, w0: 11 * s, w1: 2.4 * s, t0: 0, t1: 0.62 }];
  const rnd = mulberry32(cfg.seed * 7 + 3);
  for (let i = 0; i < 6; i++) {
    const at = 0.2 + 0.13 * i;
    const idx = Math.round(at * (primary.length - 1));
    const side = i % 2 === 0 ? 1 : -1;
    const pts = tropism({
      x: primary[idx][0],
      y: primary[idx][1],
      ang: D2R(90) + side * (1.05 + 0.25 * rnd()),
      target: D2R(90),
      k: 0.045, // weak on purpose: laterals hold their angle instead of diving
      wander: 0.09,
      steps: Math.round(22 * (1 - at) + 6),
      step: 6.6 * s,
      seed: cfg.seed * 13 + i,
    });
    const t0 = 0.3 + 0.085 * i;
    out.push({ pts, w0: (5.2 - 0.35 * i) * s, w1: 1.2 * s, t0, t1: Math.min(1, t0 + 0.55) });
  }
  return out;
}

/** The shoot, integrated to its CURRENT length so the hook rides the tip. */
export function growShoot(cfg: { x: number; y: number; p: number; relax: number; seed?: number; scale?: number }): Pt[] {
  const s = cfg.scale ?? 1;
  return tropism({
    x: cfg.x,
    y: cfg.y,
    ang: D2R(-84),
    target: D2R(-90),
    k: 0.22,
    wander: 0.015,
    steps: 58 * clamp01(cfg.p),
    step: 10.4 * s,
    seed: cfg.seed ?? 3,
    hook: 0.52 * (1 - clamp01(cfg.relax)),
    hookLen: 7,
  });
}

// =============================================================================
// SCENE — sky, soil cutaway, speckles.
// =============================================================================
const SPECKLES = (() => {
  const rnd = mulberry32(99);
  return Array.from({ length: 190 }, () => ({
    x: rnd() * 1080,
    y: GROW_GEOM.soilY + 12 + rnd() * (1920 - GROW_GEOM.soilY),
    r: 1.6 + rnd() * 5.2,
    o: 0.06 + rnd() * 0.16,
    light: rnd() > 0.45,
  }));
})();

export const Ground: React.FC<{ warmth?: number }> = ({ warmth = 0 }) => {
  const g = GROW_GEOM;
  return (
    <>
      <defs>
        <linearGradient id="growSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GROW_COLORS.skyTop} />
          <stop offset="100%" stopColor={GROW_COLORS.skyLow} />
        </linearGradient>
        <linearGradient id="growSoil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GROW_COLORS.soilTop} />
          <stop offset="45%" stopColor={GROW_COLORS.soil} />
          <stop offset="100%" stopColor={GROW_COLORS.soilDeep} />
        </linearGradient>
      </defs>
      {/* oversized on purpose: the shot flies a camera over this, so the ground has to keep
          covering the frame when the view is pushed in and panned off-centre */}
      <rect x={-1200} y={-1200} width={3480} height={g.soilY + 1200} fill="url(#growSky)" />
      {warmth > 0 ? (
        <rect x={-1200} y={-1200} width={3480} height={g.soilY + 1200} fill="#f5d76e" opacity={0.16 * warmth} />
      ) : null}
      <rect x={-1200} y={g.soilY} width={3480} height={2400} fill="url(#growSoil)" />
      <rect x={-1200} y={g.soilY} width={3480} height={9} fill="#8a6243" opacity={0.9} />
      {SPECKLES.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.light ? '#c69b72' : '#1b1109'} opacity={s.o} />
      ))}
    </>
  );
};

/** A soft radial dim that closes onto the active stage. Open (amount 0) = no dim at all. */
export const Spot: React.FC<{ x: number; y: number; r: number; amount: number }> = ({ x, y, r, amount }) => {
  if (amount <= 0.01) return null;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle ${r}px at ${x}px ${y}px, rgba(6,10,18,0) 55%, rgba(6,10,18,${amount}) 100%)`,
      }}
    />
  );
};

// =============================================================================
// ORGANS
// =============================================================================
export const RootSystem: React.FC<{ branches: Branch[]; p: number; color?: string; edge?: string }> = ({
  branches,
  p,
  color = GROW_COLORS.root,
  edge = GROW_COLORS.rootEdge,
}) => (
  <g>
    {branches.map((b, i) => {
      const lp = clamp01((p - b.t0) / Math.max(0.0001, b.t1 - b.t0));
      if (lp <= 0) return null;
      const d = taperedPath(partial(b.pts, lp), b.w0, b.w1, b.pts.length - 1);
      if (!d) return null;
      return <path key={i} d={d} fill={color} stroke={edge} strokeWidth={1.2} strokeOpacity={0.5} />;
    })}
  </g>
);

export const Stem: React.FC<{ pts: Pt[]; w0?: number; w1?: number; color?: string }> = ({
  pts,
  w0 = 15,
  w1 = 8,
  color = GROW_COLORS.stem,
}) => {
  const d = taperedPath(pts, w0, w1);
  if (!d) return null;
  return <path d={d} fill={color} />;
};

/** A leaf that unfurls: `open` 0..1 scales it out of the stem and rotates it into place. */
export const Leaf: React.FC<{
  x: number;
  y: number;
  ang: number; // degrees, 0 = pointing right
  len: number;
  open: number;
  color?: string;
  vein?: string;
}> = ({ x, y, ang, len, open, color = GROW_COLORS.leaf, vein = GROW_COLORS.leafDark }) => {
  const o = clamp01(open);
  if (o <= 0.01) return null;
  const w = len * 0.42;
  const a = ang - (1 - o) * 42; // folded up against the stem, then swings out
  return (
    <g transform={`translate(${x} ${y}) rotate(${a}) scale(${0.25 + 0.75 * o})`}>
      <path
        d={`M 0 0 Q ${len * 0.45} ${-w} ${len} 0 Q ${len * 0.45} ${w} 0 0 Z`}
        fill={color}
        stroke={vein}
        strokeWidth={2}
        strokeOpacity={0.35}
      />
      <path d={`M 0 0 L ${len * 0.94} 0`} stroke={vein} strokeWidth={2.4} strokeOpacity={0.5} fill="none" />
    </g>
  );
};

/** The two seed leaves, hanging off the shoot tip. */
export const Cotyledons: React.FC<{ x: number; y: number; ang: number; open: number; size?: number }> = ({
  x,
  y,
  ang,
  open,
  size = 62,
}) => {
  const o = clamp01(open);
  if (o <= 0.01) return null;
  const base = (ang * 180) / Math.PI + 90; // the stem's "up" in leaf coordinates
  return (
    <g transform={`translate(${x} ${y}) rotate(${base})`}>
      <Leaf x={0} y={0} ang={-24 - 34 * o} len={size} open={o} color={GROW_COLORS.cotyledon} />
      <g transform="scale(-1 1)">
        <Leaf x={0} y={0} ang={-24 - 34 * o} len={size} open={o} color={GROW_COLORS.cotyledon} />
      </g>
    </g>
  );
};

// =============================================================================
// THE SEED — in the ground, and as a labelled cutaway.
// =============================================================================
const seedHalf = (rx: number, ry: number, side: 1 | -1) =>
  `M 0 ${-ry} C ${side * rx * 0.62} ${-ry} ${side * rx} ${-ry * 0.5} ${side * rx} 0` +
  ` C ${side * rx} ${ry * 0.62} ${side * rx * 0.55} ${ry} 0 ${ry} Z`;

export const Seed: React.FC<{
  x: number;
  y: number;
  rx?: number;
  ry?: number;
  swell?: number; // 0..1 imbibition
  split?: number; // 0..1 the coat opens
  food?: number; // 1 = full store, 0 = spent
  tilt?: number; // degrees
  showInside?: boolean;
}> = ({ x, y, rx = GROW_GEOM.seedRX, ry = GROW_GEOM.seedRY, swell = 0, split = 0, food = 1, tilt = -12, showInside = true }) => {
  const s = 1 + 0.15 * clamp01(swell);
  const sp = clamp01(split);
  const open = sp * 13; // a seam, not a beak — 20deg read as a pac-man mouth at phone scale
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
      {showInside ? (
        <>
          <ellipse cx={0} cy={0} rx={rx * 0.92} ry={ry * 0.92} fill={GROW_COLORS.flesh} />
          {/* the packed lunch — drains from the bottom as the seedling spends it */}
          <clipPath id={`food-${Math.round(x)}-${Math.round(y)}`}>
            <rect x={-rx} y={ry - 2 * ry * clamp01(food)} width={rx * 2} height={2 * ry} />
          </clipPath>
          <ellipse
            cx={0}
            cy={0}
            rx={rx * 0.92}
            ry={ry * 0.92}
            fill={GROW_COLORS.food}
            clipPath={`url(#food-${Math.round(x)}-${Math.round(y)})`}
          />
        </>
      ) : null}
      <g transform={`rotate(${-open}) translate(${-sp * 3} 0)`}>
        <path d={seedHalf(rx, ry, -1)} fill={GROW_COLORS.coat} stroke={GROW_COLORS.coatDark} strokeWidth={2} />
      </g>
      <g transform={`rotate(${open}) translate(${sp * 3} 0)`}>
        <path d={seedHalf(rx, ry, 1)} fill={GROW_COLORS.coat} stroke={GROW_COLORS.coatDark} strokeWidth={2} />
      </g>
    </g>
  );
};

/** The magnified cutaway: what is actually inside a seed. */
export const SeedCutaway: React.FC<{
  x: number;
  y: number;
  r: number;
  food: number;
  on: number;
  label?: string;
  foodLabel?: string;
  embryoLabel?: string;
  color?: string;
}> = ({ x, y, r, food, on, label, foodLabel = 'PACKED LUNCH', embryoLabel = 'BABY PLANT', color = GROW_COLORS.accent }) => {
  const o = clamp01(on);
  if (o <= 0.01) return null;
  const rx = r;
  const ry = r * 0.74;
  const fill = clamp01(food);
  return (
    <g opacity={o} transform={`translate(${x} ${y}) scale(${0.92 + 0.08 * o})`}>
      <ellipse cx={0} cy={0} rx={rx + 16} ry={ry + 16} fill="rgba(12,14,20,0.55)" />
      <ellipse cx={0} cy={0} rx={rx} ry={ry} fill={GROW_COLORS.flesh} stroke={GROW_COLORS.coat} strokeWidth={7} />
      <clipPath id={`cut-${Math.round(x)}`}>
        <rect x={-rx} y={ry - 2 * ry * fill} width={rx * 2} height={2 * ry} />
      </clipPath>
      <ellipse cx={0} cy={0} rx={rx} ry={ry} fill={GROW_COLORS.food} clipPath={`url(#cut-${Math.round(x)})`} />
      {/* the embryo: a curled baby plant against the store */}
      <path
        d={`M ${-rx * 0.1} ${ry * 0.52} C ${-rx * 0.46} ${ry * 0.22} ${-rx * 0.46} ${-ry * 0.3} ${-rx * 0.06} ${-ry * 0.46}`}
        stroke={GROW_COLORS.embryo}
        strokeWidth={r * 0.13}
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx={rx * 0.12} cy={-ry * 0.5} rx={r * 0.19} ry={r * 0.1} fill={GROW_COLORS.embryo} transform={`rotate(-18 ${rx * 0.12} ${-ry * 0.5})`} />
      <ellipse cx={-rx * 0.28} cy={-ry * 0.44} rx={r * 0.16} ry={r * 0.09} fill={GROW_COLORS.embryo} transform={`rotate(18 ${-rx * 0.28} ${-ry * 0.44})`} />
      <text
        x={0}
        y={-ry - 34}
        textAnchor="middle"
        fill="#2f4a3a"
        fontFamily={FONT_DISPLAY}
        fontWeight={700}
        fontSize={r * 0.3}
        letterSpacing={3}
      >
        {label ?? ''}
      </text>
      <text x={-rx - 6} y={-ry * 0.62} textAnchor="end" fill="#2f7d47" fontFamily={FONT_BODY} fontWeight={700} fontSize={r * 0.23}>
        {embryoLabel}
      </text>
      <text x={rx + 6} y={ry * 0.72} textAnchor="start" fill="#9a7413" fontFamily={FONT_BODY} fontWeight={700} fontSize={r * 0.23}>
        {fill > 0.05 ? foodLabel : 'ALL EATEN'}
      </text>
    </g>
  );
};

// =============================================================================
// WATER + AIR
// =============================================================================
const RAIN = (() => {
  const rnd = mulberry32(17);
  return Array.from({ length: 26 }, () => ({ x: 120 + rnd() * 840, ph: rnd(), len: 26 + rnd() * 26, sp: 0.8 + rnd() * 0.5 }));
})();

export const Rain: React.FC<{ on: number; t: number }> = ({ on, t }) => {
  const o = clamp01(on);
  if (o <= 0.01) return null;
  return (
    <g opacity={o * 0.85}>
      {RAIN.map((d, i) => {
        const y = ((d.ph + t * d.sp) % 1) * (GROW_GEOM.soilY + 60) - 40;
        return <rect key={i} x={d.x} y={y} width={4} height={d.len} rx={2} fill={GROW_COLORS.water} opacity={0.75} />;
      })}
    </g>
  );
};

/** The damp patch spreading through the soil around the seed. */
export const Damp: React.FC<{ x: number; y: number; r: number; on: number }> = ({ x, y, r, on }) => {
  const o = clamp01(on);
  if (o <= 0.01) return null;
  return (
    <>
      <defs>
        <radialGradient id="dampG">
          <stop offset="0%" stopColor="#2b5f77" stopOpacity={0.75} />
          <stop offset="100%" stopColor="#2b5f77" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={x} cy={y} rx={r * o} ry={r * 0.72 * o} fill="url(#dampG)" opacity={o} />
    </>
  );
};

/** Motes drifting toward a target — CO2 into the leaves, water up the stem. */
export const Motes: React.FC<{
  from: 'sides' | 'roots';
  to: Pt;
  on: number;
  t: number;
  label: string;
  color: string;
  n?: number;
}> = ({ from, to, on, t, label, color, n = 7 }) => {
  const o = clamp01(on);
  if (o <= 0.01) return null;
  const rnd = mulberry32(from === 'sides' ? 5 : 9);
  const items = Array.from({ length: n }, (_, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const ph = (t * (0.42 + 0.1 * ((i % 3) + 1)) + i / n) % 1;
    const sx = from === 'sides' ? to[0] + side * (330 + rnd() * 140) : GROW_GEOM.seedX + (rnd() - 0.5) * 280;
    const sy = from === 'sides' ? to[1] - 130 + rnd() * 300 : GROW_GEOM.soilY + 160 + rnd() * 260;
    const e = ph * ph * (3 - 2 * ph);
    return {
      x: sx + (to[0] - sx) * e,
      y: sy + (to[1] - sy) * e,
      fade: Math.sin(Math.PI * ph),
      k: i,
    };
  });
  return (
    <g opacity={o}>
      {items.map((m) => (
        <g key={m.k} opacity={m.fade}>
          <circle cx={m.x} cy={m.y} r={21} fill={color} opacity={0.24} />
          <text
            x={m.x}
            y={m.y + 8}
            textAnchor="middle"
            fill={color}
            fontFamily={FONT_MONO}
            fontWeight={700}
            fontSize={23}
          >
            {label}
          </text>
        </g>
      ))}
    </g>
  );
};

export const SunGlow: React.FC<{ on: number; x?: number; y?: number; r?: number; spin?: number }> = ({
  on,
  x = 858,
  y = 300,
  r = 74,
  spin = 0,
}) => {
  const o = clamp01(on);
  if (o <= 0.01) return null;
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={r * 2.5} fill={GROW_COLORS.accent} opacity={0.12} />
      <g transform={`rotate(${spin} ${x} ${y})`}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * TAU;
          return (
            <rect
              key={i}
              x={x - 3}
              y={y - r * 1.92}
              width={6}
              height={r * 0.46}
              rx={3}
              fill={GROW_COLORS.accent}
              opacity={0.5}
              transform={`rotate(${(a * 180) / Math.PI} ${x} ${y})`}
            />
          );
        })}
      </g>
      <circle cx={x} cy={y} r={r} fill={GROW_COLORS.accent} />
    </g>
  );
};

// =============================================================================
// TYPE — the curriculum word, the need chips, the dry-mass ledger.
// =============================================================================
// The curriculum word rides on a light plate: this scene is a bright sky that the Spot dims
// hard on some beats, so unplated text would read on one beat and vanish on the next.
export const StageWord: React.FC<{ word: string; gloss: string; on: number; color?: string; y?: number }> = ({
  word,
  gloss,
  on,
  color = '#256b41',
  y = 158,
}) => {
  const o = clamp01(on);
  if (o <= 0.01) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        opacity: o,
        transform: `translateY(${(1 - o) * 14}px)`,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          background: 'rgba(253,250,242,0.92)',
          border: '2px solid rgba(37,107,65,0.18)',
          borderRadius: 26,
          padding: '20px 42px 24px',
          boxShadow: '0 10px 34px rgba(0,0,0,0.18)',
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 56, letterSpacing: 6, color }}>{word}</div>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 32, color: '#54606b', marginTop: 6 }}>{gloss}</div>
      </div>
    </div>
  );
};

export const NeedChips: React.FC<{
  header: string;
  items: { text: string; struck?: boolean; at: number }[];
  frame: number;
  y: number;
  on: number;
  color?: string;
}> = ({ header, items, frame, y, on, color = GROW_COLORS.accent }) => {
  const o = clamp01(on);
  if (o <= 0.01) return null;
  return (
    <div style={{ position: 'absolute', top: y, left: 0, right: 0, textAlign: 'center', opacity: o }}>
      <div
        style={{
          fontFamily: FONT_BODY,
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: 6,
          color: '#3d4a55',
          marginBottom: 14,
          textShadow: '0 1px 10px rgba(255,255,255,0.7)',
        }}
      >
        {header}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 16 }}>
        {items.map((it, i) => {
          const p = clamp01((frame - it.at) / 9);
          if (p <= 0) return null;
          const strike = it.struck ? clamp01((frame - it.at - 6) / 8) : 0;
          return (
            <div
              key={i}
              style={{
                position: 'relative',
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: 40,
                letterSpacing: 3,
                color: it.struck ? '#8d97a1' : '#1f3b2c',
                background: it.struck ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.9)',
                border: `3px solid ${it.struck ? '#b9c2cb' : color}`,
                borderRadius: 999,
                padding: '12px 30px',
                opacity: p,
                transform: `translateY(${(1 - p) * 12}px) scale(${0.94 + 0.06 * p})`,
                boxShadow: '0 8px 26px rgba(0,0,0,0.12)',
              }}
            >
              {it.text}
              {strike > 0 ? (
                <div
                  style={{
                    position: 'absolute',
                    left: '8%',
                    top: '50%',
                    height: 5,
                    width: `${84 * strike}%`,
                    background: '#e8879f',
                    borderRadius: 3,
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** The payoff: one bar, split by where a plant's DRY mass actually comes from. */
export const MassLedger: React.FC<{
  on: number;
  y: number;
  airPct: number;
  soilPct: number;
  title?: string;
  color?: string;
}> = ({ on, y, airPct, soilPct, title = 'DRY MASS OF A PLANT', color = GROW_COLORS.accent }) => {
  const o = clamp01(on);
  if (o <= 0.01) return null;
  const W = 900;
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: (1080 - W) / 2,
        width: W,
        opacity: o,
        transform: `translateY(${(1 - o) * 16}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_BODY,
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: 6,
          color: '#4a5560',
          textAlign: 'center',
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', height: 96, borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 34px rgba(0,0,0,0.18)' }}>
        <div
          style={{
            width: `${airPct}%`,
            background: `linear-gradient(90deg, ${color} 0%, #7fd8c2 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 38,
            color: '#17301f',
            letterSpacing: 1,
          }}
        >
          {`AIR + WATER  ${airPct}%`}
        </div>
        <div
          style={{
            width: `${soilPct}%`,
            background: GROW_COLORS.soil,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 28,
            color: '#f0e2cd',
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 12,
          fontFamily: FONT_BODY,
          fontWeight: 600,
          fontSize: 27,
          color: '#4a5560',
        }}
      >
        <span>carbon from the air, hydrogen from water</span>
        <span>{`soil minerals  ${soilPct}%`}</span>
      </div>
    </div>
  );
};
