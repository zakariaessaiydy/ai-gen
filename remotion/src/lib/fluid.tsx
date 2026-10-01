// lib/fluid.tsx — liquid in a vessel: a surface that SLOSHES, streams that pour into it, and a fill
// you can count because every pour is its own band.
//
// The engine's one rule: the liquid is never keyframed. The surface is a height field integrated
// under a damped wave equation (explicit, reflective walls, volume-conserving), excited only by
// the streams that actually land on it — so a pour makes a splash where it lands, the ripple
// travels to the walls and back, and it dies away at a rate set by one damping constant. The level
// is the SUM of the bands, and each band is one source's poured volume, so "2.0 litres" on screen
// is the bands read back, not a counter.
//
// The simulation is a pure function of the splash table: `simulateSurface()` integrates the whole
// composition once (a few hundred thousand multiply-adds) and returns one height array per frame,
// so any frame renders identically in any order. Loop safety is structural as long as the last
// splash has had time to damp out before the wrap — `quietBy()` measures it rather than assuming.
//
// Canvas space is the 1080x1920 frame. A height h > 0 is liquid ABOVE the mean level.
import React from 'react';
import { Easing } from 'remotion';
import { FONT_MONO } from '../fonts';

export const FLUID_COLORS = {
  stage: '#0c1118',
  glow: '#15263a',
  text: '#e8ecf5',
  dim: '#8b93a7',
  accent: '#f5d76e',
  indigo: '#6366F1',
  violet: '#9b7cc4',
  teal: '#4db8a8',
  pink: '#e8879f',
  glass: '#cfe3f5',
  water: '#4f9fe0',
  waterAlt: '#3f8bd0',
  waterHi: '#bfe2ff',
  coffee: '#a0714a',
  coffeeAlt: '#8c6240',
} as const;
const C = FLUID_COLORS;

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const TAU = Math.PI * 2;
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
type Pt = { x: number; y: number };

// =============================================================================
// THE SURFACE — a damped 1D wave equation on n columns.
// =============================================================================
/** One stream landing: from frame f for dur frames, centred at x (0..1 across the vessel). */
export type Splash = { f: number; dur: number; x: number; amp: number };

export type SurfaceSim = {
  /** Height per column per frame, normalised so the loudest splash peaks at 1. */
  at: (f: number) => Float32Array;
  n: number;
  /** Raw peak before normalisation (0 when nothing ever splashes). */
  peak: number;
};

/**
 * Integrate the surface over the whole composition. Explicit leapfrog-ish update with a c² well
 * inside the stability bound (0.5), reflective (Neumann) walls, and the mean subtracted every
 * substep so a splash moves liquid around but never creates or destroys any.
 */
export const simulateSurface = ({
  frames,
  splashes,
  n = 56,
  c2 = 0.28,
  damp = 0.993,
  sub = 3,
  k = 0.0015,
  spread = 2.2,
}: {
  frames: number;
  splashes: Splash[];
  n?: number;
  c2?: number;
  damp?: number;
  sub?: number;
  k?: number;
  spread?: number;
}): SurfaceSim => {
  const h = new Float32Array(n);
  const v = new Float32Array(n);
  const a = new Float32Array(n);
  const out: Float32Array[] = new Array(frames);
  let peak = 0;
  for (let f = 0; f < frames; f++) {
    for (const s of splashes) {
      if (f < s.f || f >= s.f + s.dur) continue;
      const c = s.x * (n - 1);
      for (let i = 0; i < n; i++) {
        const d = (i - c) / spread;
        v[i] -= s.amp * Math.exp(-d * d);
      }
    }
    for (let st = 0; st < sub; st++) {
      for (let i = 0; i < n; i++) {
        const l = h[i > 0 ? i - 1 : 0];
        const r = h[i < n - 1 ? i + 1 : n - 1];
        a[i] = c2 * (l + r - 2 * h[i]) - k * h[i];
      }
      let mean = 0;
      for (let i = 0; i < n; i++) {
        v[i] = (v[i] + a[i]) * damp;
        h[i] += v[i];
        mean += h[i];
      }
      mean /= n;
      for (let i = 0; i < n; i++) h[i] -= mean;
    }
    const snap = Float32Array.from(h);
    for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(snap[i]));
    out[f] = snap;
  }
  const norm = peak > 0 ? 1 / peak : 0;
  for (const arr of out) for (let i = 0; i < n; i++) arr[i] *= norm;
  const zero = new Float32Array(n);
  return { at: (f) => out[Math.max(0, Math.min(frames - 1, Math.round(f)))] ?? zero, n, peak };
};

/** Largest |height| (normalised) at frame f — use it to PROVE the surface is calm at the wrap. */
export const quietBy = (sim: SurfaceSim, f: number) => {
  const a = sim.at(f);
  let m = 0;
  for (let i = 0; i < a.length; i++) m = Math.max(m, Math.abs(a[i]));
  return m;
};

// =============================================================================
// THE VESSEL — a tapered glass. Widths are OUTER; the wall is inside them.
// =============================================================================
export type Vessel = { cx: number; top: number; bottom: number; wTop: number; wBot: number; wall: number; base: number };

/** Interior [left, right] x at height y. */
export const wallsAt = (v: Vessel, y: number): [number, number] => {
  const t = clamp01((y - v.top) / (v.bottom - v.top));
  const w = mix(v.wTop, v.wBot, t) / 2 - v.wall;
  return [v.cx - w, v.cx + w];
};

const interiorD = (v: Vessel) => {
  const r = 22;
  const [lt, rt] = wallsAt(v, v.top);
  const [lb, rb] = wallsAt(v, v.bottom);
  return (
    `M${lt},${v.top} L${lb},${v.bottom - r} Q${lb},${v.bottom} ${lb + r},${v.bottom} ` +
    `L${rb - r},${v.bottom} Q${rb},${v.bottom} ${rb},${v.bottom - r} L${rt},${v.top} Z`
  );
};

const outerD = (v: Vessel) => {
  const r = 30;
  const lt = v.cx - v.wTop / 2;
  const rt = v.cx + v.wTop / 2;
  const lb = v.cx - v.wBot / 2;
  const rb = v.cx + v.wBot / 2;
  const b = v.bottom + v.base;
  return `M${lt},${v.top} L${lb},${b - r} Q${lb},${b} ${lb + r},${b} L${rb - r},${b} Q${rb},${b} ${rb},${b - r} L${rt},${v.top}`;
};

/** Clip path + gradients the liquid needs. Mount once, inside the <svg>. */
export const FluidDefs: React.FC<{ vessel: Vessel; id?: string }> = ({ vessel, id = 'fluid' }) => (
  <defs>
    <clipPath id={`${id}Inside`}>
      <path d={interiorD(vessel)} />
    </clipPath>
    <linearGradient id={`${id}Depth`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#ffffff" stopOpacity={0.1} />
      <stop offset="100%" stopColor="#000814" stopOpacity={0.35} />
    </linearGradient>
    <filter id={`${id}Glow`} x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="12" />
    </filter>
  </defs>
);

/** The glass behind the liquid: a faint body so an empty glass still reads as a glass. */
export const GlassBack: React.FC<{ vessel: Vessel }> = ({ vessel }) => (
  <path d={`${outerD(vessel)} Z`} fill={C.glass} fillOpacity={0.06} />
);

/** The glass in front of the liquid: walls, base, rim and one long highlight. */
export const GlassFront: React.FC<{ vessel: Vessel; glow?: number }> = ({ vessel, glow = 0 }) => {
  const [lt] = wallsAt(vessel, vessel.top);
  const [lb] = wallsAt(vessel, vessel.bottom);
  return (
    <g>
      {glow > 0.01 ? (
        <path d={outerD(vessel)} fill="none" stroke={C.accent} strokeWidth={18} opacity={0.35 * glow} filter="url(#fluidGlow)" />
      ) : null}
      <path d={outerD(vessel)} fill="none" stroke={C.glass} strokeOpacity={0.72} strokeWidth={4} strokeLinejoin="round" />
      <path d={interiorD(vessel)} fill="none" stroke={C.glass} strokeOpacity={0.22} strokeWidth={2} />
      <rect
        x={vessel.cx - vessel.wBot / 2 + 12}
        y={vessel.bottom + 4}
        width={vessel.wBot - 24}
        height={vessel.base - 10}
        rx={6}
        fill={C.glass}
        opacity={0.12}
      />
      <line x1={vessel.cx - vessel.wTop / 2 - 6} y1={vessel.top} x2={vessel.cx + vessel.wTop / 2 + 6} y2={vessel.top} stroke={C.glass} strokeOpacity={0.8} strokeWidth={5} strokeLinecap="round" />
      <line x1={lt + 18} y1={vessel.top + 40} x2={lb + 18} y2={vessel.bottom - 60} stroke="#ffffff" strokeOpacity={0.16} strokeWidth={10} strokeLinecap="round" />
    </g>
  );
};

/** Litre marks on the left wall, labelled outside it. */
export const Graduations: React.FC<{ vessel: Vessel; litrePx: number; step: number; max: number; opacity?: number }> = ({
  vessel,
  litrePx,
  step,
  max,
  opacity = 1,
}) => {
  const marks: number[] = [];
  for (let l = step; l <= max + 1e-6; l += step) marks.push(Math.round(l * 100) / 100);
  return (
    <g opacity={opacity}>
      {marks.map((l) => {
        const y = vessel.bottom - l * litrePx;
        const [xl] = wallsAt(vessel, y);
        const outer = xl - vessel.wall;
        const major = Math.abs(l - Math.round(l)) < 1e-6 || l === max;
        return (
          <g key={l}>
            <line x1={xl} y1={y} x2={xl + (major ? 34 : 20)} y2={y} stroke={C.glass} strokeOpacity={0.55} strokeWidth={3} strokeLinecap="round" />
            <text
              x={outer - 14}
              y={y + 7}
              textAnchor="end"
              style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 20, fill: C.dim }}
            >
              {l.toFixed(1)}
            </text>
          </g>
        );
      })}
      <text
        x={vessel.cx - vessel.wBot / 2 - 24}
        y={vessel.bottom + 8}
        textAnchor="end"
        style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 20, fill: C.dim }}
      >
        L
      </text>
    </g>
  );
};

// =============================================================================
// THE LIQUID — stacked bands, the top one carrying the simulated surface.
// =============================================================================
export type Band = { px: number; color: string; glow?: number };

/** Total height of the liquid column in px — the one number the level is. */
export const columnPx = (bands: Band[]) => bands.reduce((s, b) => s + Math.max(0, b.px), 0);

/**
 * `heights` are the simulated surface (normalised), drawn at `amp` px; `ambient(i)` adds a
 * loop-safe drift in px. Waves are scaled down in a shallow column so a splash can never
 * lift the bottom of the glass into view.
 */
export const Liquid: React.FC<{
  vessel: Vessel;
  bands: Band[];
  heights: Float32Array;
  amp: number;
  ambient?: (i: number, n: number) => number;
  seams?: boolean;
}> = ({ vessel, bands, heights, amp, ambient, seams = true }) => {
  const total = columnPx(bands);
  if (total < 0.5) return null;
  const level = vessel.bottom - total;
  const n = heights.length;
  const shallow = clamp01(total / 60);
  const [xl, xr] = wallsAt(vessel, level);
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const hpx = (heights[i] * amp + (ambient ? ambient(i, n) : 0)) * shallow;
    pts.push({ x: mix(xl - 4, xr + 4, i / (n - 1)), y: level - hpx });
  }
  const top = bands.filter((b) => b.px > 0.01).slice(-1)[0] ?? bands[bands.length - 1];
  const wide = vessel.wTop;
  const surfD =
    pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') +
    ` L${vessel.cx + wide},${vessel.bottom + 40} L${vessel.cx - wide},${vessel.bottom + 40} Z`;
  const lineD = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // lower bands, bottom-up, drawn as rects under the top band's surface
  let y0 = vessel.bottom;
  const rects: React.ReactNode[] = [];
  const seamYs: number[] = [];
  bands.forEach((b, k) => {
    if (b.px <= 0.01) return;
    const y1 = y0 - b.px;
    if (b !== top) {
      rects.push(<rect key={k} x={vessel.cx - wide} y={y1} width={wide * 2} height={y0 - y1 + 0.6} fill={b.color} />);
      seamYs.push(y1);
    }
    if (b.glow && b.glow > 0.01) {
      rects.push(
        <rect key={`g${k}`} x={vessel.cx - wide} y={y1} width={wide * 2} height={y0 - y1} fill={C.accent} opacity={0.28 * b.glow} />,
      );
    }
    y0 = y1;
  });

  return (
    <g clipPath="url(#fluidInside)">
      <path d={surfD} fill={top.color} />
      {rects}
      {seams
        ? seamYs.map((y, k) => (
            <line key={k} x1={vessel.cx - wide} y1={y} x2={vessel.cx + wide} y2={y} stroke="#ffffff" strokeOpacity={0.18} strokeWidth={2} />
          ))
        : null}
      {/* depth shading takes the SURFACE's shape — a rect would paint a dark band above the water */}
      <path d={surfD} fill="url(#fluidDepth)" />
      <path d={lineD} fill="none" stroke={C.waterHi} strokeOpacity={0.7} strokeWidth={4} strokeLinejoin="round" />
    </g>
  );
};

// =============================================================================
// STREAMS — a falling column from a cup's lip into the vessel.
// =============================================================================
/**
 * A pour path: up and out of the lip, then over the mouth and STRAIGHT DOWN through it, so the
 * stream never crosses a wall — the last leg is vertical, which is how a falling column looks.
 */
export const pourD = (from: Pt, to: Pt, mouthY: number, lift = 60) => {
  const c1 = { x: from.x + (to.x - from.x) * 0.35, y: Math.min(from.y, mouthY) - lift };
  const c2 = { x: to.x, y: mouthY - lift * 0.9 };
  return `M${from.x.toFixed(1)},${from.y.toFixed(1)} C${c1.x.toFixed(1)},${c1.y.toFixed(1)} ${c2.x.toFixed(1)},${c2.y.toFixed(1)} ${to.x.toFixed(1)},${to.y.toFixed(1)}`;
};

/** The visible part of a pour path: [s0, s1] of its length (0 = lip, 1 = landing). */
export const Stream: React.FC<{ d: string; s0: number; s1: number; color: string; width?: number }> = ({
  d,
  s0,
  s1,
  color,
  width = 10,
}) => {
  const a = clamp01(Math.min(s0, s1));
  const b = clamp01(Math.max(s0, s1));
  if (b - a < 0.004) return null;
  const dash = `${(b - a).toFixed(4)} 4`;
  const off = (-a).toFixed(4);
  return (
    <g>
      <path d={d} pathLength={1} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dash} strokeDashoffset={off} />
      <path
        d={d}
        pathLength={1}
        fill="none"
        stroke="#ffffff"
        strokeOpacity={0.45}
        strokeWidth={width * 0.28}
        strokeLinecap="round"
        strokeDasharray={dash}
        strokeDashoffset={off}
        transform={`translate(${-width * 0.18} 0)`}
      />
    </g>
  );
};

// =============================================================================
// CUPS — the source of a pour. A cup is drawn by its BOTTOM CENTRE and tips about it.
// =============================================================================
export type CupKind = 'glass' | 'mug';
const CUP = { h: 44, wTop: 36, wBot: 28 };

/** Where the lip on the `dir` side (+1 right, -1 left) is when the cup is tipped by `tilt` degrees. */
export const cupLip = (x: number, y: number, tilt: number, dir: number): Pt => {
  const lx = (dir * CUP.wTop) / 2;
  const ly = -CUP.h;
  const t = (tilt * Math.PI) / 180;
  return { x: x + lx * Math.cos(t) - ly * Math.sin(t), y: y + lx * Math.sin(t) + ly * Math.cos(t) };
};

export const Cup: React.FC<{
  x: number;
  y: number;
  fill: number; // 0..1 of the cup's own volume
  tilt?: number; // degrees, clockwise positive
  kind?: CupKind;
  color: string;
  opacity?: number;
  glow?: number;
}> = ({ x, y, fill, tilt = 0, kind = 'glass', color, opacity = 1, glow = 0 }) => {
  const { h, wTop, wBot } = CUP;
  const body =
    kind === 'mug'
      ? `M${-wTop / 2 + 2},${-h + 8} L${-wTop / 2 + 2},-6 Q${-wTop / 2 + 2},0 ${-wTop / 2 + 8},0 L${wTop / 2 - 8},0 Q${wTop / 2 - 2},0 ${wTop / 2 - 2},-6 L${wTop / 2 - 2},${-h + 8} Z`
      : `M${-wTop / 2},${-h} L${-wBot / 2},-4 Q${-wBot / 2},0 ${-wBot / 2 + 4},0 L${wBot / 2 - 4},0 Q${wBot / 2},0 ${wBot / 2},-4 L${wTop / 2},${-h} Z`;
  const inner = kind === 'mug' ? h - 12 : h - 4;
  const fy = -3 - inner * clamp01(fill);
  const id = `cup${Math.round(x)}_${Math.round(y)}`;
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${tilt.toFixed(2)})`} opacity={opacity}>
      <defs>
        <clipPath id={id}>
          <path d={body} />
        </clipPath>
      </defs>
      {glow > 0.01 ? <path d={body} fill={C.accent} opacity={0.6 * glow} filter="url(#fluidGlow)" /> : null}
      <path d={body} fill={C.glass} fillOpacity={0.08} />
      {fill > 0.005 ? <rect x={-wTop} y={fy} width={wTop * 2} height={-fy + 2} fill={color} clipPath={`url(#${id})`} /> : null}
      {kind === 'mug' ? (
        <path
          d={`M${wTop / 2 - 2},${-h + 16} q14,0 14,11 q0,11 -14,11`}
          fill="none"
          stroke={C.glass}
          strokeOpacity={0.8}
          strokeWidth={4}
        />
      ) : null}
      <path d={body} fill="none" stroke={C.glass} strokeOpacity={0.85} strokeWidth={3} strokeLinejoin="round" />
    </g>
  );
};
