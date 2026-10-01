// Cycle kit — a CLOSED-LOOP CONSERVED-PARTICLE engine over a landscape, plus the scene
// atoms a "natural cycle" explainer needs. Seeds short-13 (the water cycle, for kids).
//
// The engine in one line: a particle's position is `frac(u_i + turns)` along a closed path.
// There is no spawn and no despawn anywhere in this file, so the population is a structural
// invariant — a census can COUNT the array and the number it prints cannot be wrong. That is
// the whole argument of a cycle video, and it is why the counts are measured rather than
// asserted (same ethos as prob.tsx's seeded trials and orbit.tsx's integrator).
//
// It also buys the loop for free: if the composition is an INTEGER number of laps long and
// every ambient animation is driven by f/durationInFrames times an integer, the last frame IS
// frame 0. The video loops because the cycle loops.
//
// Generic by design — a new cycle (carbon, rock, nitrogen) ships a new Geom, not a new engine.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const TAU = Math.PI * 2;

// =============================================================================
// THE GLOBAL WATER BUDGET — the one place a number about real water lives.
// Residence time is DIVIDED OUT of a storage/flux pair, never quoted.
// =============================================================================
export const WATER_BUDGET = {
  atmosphereKm3: 12900, // USGS: water stored in the atmosphere
  precipKm3PerYear: 505000, // ocean 398,000 + land 107,000 (Trenberth / USGS)
} as const;

/** ~9.33 days. The screen rounds this; the VO says "about nine days". */
export const RESIDENCE_DAYS = (WATER_BUDGET.atmosphereKm3 / WATER_BUDGET.precipKm3PerYear) * 365.25;

// =============================================================================
// DETERMINISM
// =============================================================================
export function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const sstep = (t: number, a: number, b: number) => {
  const x = clamp01((t - a) / Math.max(0.0001, b - a));
  return x * x * (3 - 2 * x);
};

// =============================================================================
// GEOMETRY
// =============================================================================
export type Pt = [number, number];
export type Kind = 'evap' | 'cloud' | 'rain' | 'river' | 'sea';

export type Seg = {
  kind: Kind;
  frac: number; // share of ONE lap. The fracs must sum to 1.
  pts: Pt[]; // the polyline particles follow, walked by arc length
};

export type Geom = {
  segs: Seg[];
  /** the stretch of hillside rain lands on — each drop gets its own point along it */
  face: [Pt, Pt];
  seaY: number;
};

// The water cycle, laid out for 1080x1920. Everything critical sits between y260 and y1330:
// clear of the 150px top strip, the 500px bottom UI zone and the plated captions at y1400.
export const WATER_GEOM: Geom = {
  segs: [
    { kind: 'evap', frac: 0.26, pts: [[230, 1212], [196, 1050], [218, 900], [280, 770], [332, 690]] },
    { kind: 'cloud', frac: 0.2, pts: [[332, 690], [378, 624], [480, 592], [610, 590], [690, 622], [720, 682]] },
    { kind: 'rain', frac: 0.1, pts: [[720, 682], [706, 790], [688, 900], [666, 992]] },
    { kind: 'river', frac: 0.18, pts: [[666, 992], [630, 1050], [588, 1105], [545, 1165], [505, 1210]] },
    { kind: 'sea', frac: 0.26, pts: [[505, 1210], [440, 1258], [350, 1272], [265, 1255], [230, 1212]] },
  ],
  // both endpoints sit ON the mountain's left face (the line (500,1215)->(810,800)), so a
  // raindrop steered to any point between them lands on the slope, never in mid-air. 371px of
  // slope for 16 drops — wide enough that the shower visibly covers the hillside.
  face: [[788, 829], [566, 1126]],
  seaY: 1215,
};

// walk a polyline by arc length
const walk = (pts: Pt[], t: number): Pt => {
  const segLen: number[] = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const d = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    segLen.push(d);
    total += d;
  }
  let want = clamp01(t) * total;
  for (let i = 0; i < segLen.length; i++) {
    if (want <= segLen[i] || i === segLen.length - 1) {
      const k = segLen[i] < 0.0001 ? 0 : clamp01(want / segLen[i]);
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k];
    }
    want -= segLen[i];
  }
  return pts[pts.length - 1];
};

/** where the loop coordinate q (0..1) sits, ignoring per-particle spread */
export const basePos = (g: Geom, q: number): { p: Pt; kind: Kind; t: number } => {
  let acc = 0;
  let x = q - Math.floor(q);
  for (const s of g.segs) {
    if (x < acc + s.frac) {
      const t = (x - acc) / s.frac;
      return { p: walk(s.pts, t), kind: s.kind, t };
    }
    acc += s.frac;
  }
  const last = g.segs[g.segs.length - 1];
  return { p: walk(last.pts, 1), kind: last.kind, t: 1 };
};

// =============================================================================
// THE PARTICLES
// =============================================================================
export type Drop = {
  u: number; // loop offset — golden-ratio spaced, so the population is even but not gridded
  lane: number; // -1..1 lateral identity: which part of the plume / which point on the slope
  lane2: number;
  k: number; // INTEGER wobble harmonic — keeps the wobble periodic over the composition
  phi: number;
  rs: number; // size multiplier
};

export const makeDrops = (n: number, seed = 7): Drop[] => {
  const r = mulberry32(seed);
  const GOLD = 0.6180339887498949;
  const out: Drop[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      u: (i * GOLD) % 1,
      lane: r() * 2 - 1,
      lane2: r() * 2 - 1,
      k: 1 + Math.floor(r() * 3),
      phi: r() * TAU,
      rs: 0.82 + r() * 0.42,
    });
  }
  return out;
};

export type Placed = { x: number; y: number; kind: Kind; t: number; alpha: number; r: number };

const SPREAD = 78; // the evaporation footprint on the sea surface
const CLOUD_IN = 35; // spread where the plume enters the cloud
// Rain leaves the cloud already spread across its underside (and steers to its own landing
// point almost linearly), so the shower reads as parallel rain over the whole slope. Steering
// late (w = t*t, the first attempt) kept 16 drops bunched at the cloud exit for most of the
// fall and the spread never actually appeared on screen.
const RAIN_IN = 105;
const RIVER_OUT = 12; // spread in the river channel

/**
 * One particle, at lap position `turn` (a real number of laps) and composition phase `cyc`
 * (0..1). Both are pure functions of the frame, and both return to their frame-0 value at
 * cyc = 1 — which is what makes the last frame identical to the first.
 *
 * The alpha ramp is the science: liquid is opaque, rising vapour fades to 0.22 and swells,
 * and inside the cloud it fades back IN. Evaporation and condensation are the same property
 * run in opposite directions.
 */
export const dropAt = (g: Geom, d: Drop, turn: number, cyc: number): Placed => {
  const wob = 0.012 * Math.sin(TAU * cyc * d.k + d.phi);
  const { p, kind, t } = basePos(g, d.u + turn + wob);
  let dx = 0;
  let dy = 0;
  let alpha = 0.95;
  let r = 5.2;

  if (kind === 'evap') {
    dx = d.lane * (SPREAD + (CLOUD_IN - SPREAD) * t) + 16 * Math.sin(TAU * cyc * (2 + d.k) + d.phi) * (0.3 + 0.7 * t);
    dy = d.lane2 * 18 * Math.sin(Math.PI * t);
    alpha = 0.95 - 0.73 * sstep(t, 0.05, 0.62);
    r = 4.6 + 4.4 * sstep(t, 0.05, 0.7);
  } else if (kind === 'cloud') {
    const bulge = Math.sin(Math.PI * t);
    dx = d.lane * (CLOUD_IN + (RAIN_IN - CLOUD_IN) * t) + d.lane2 * 46 * bulge;
    dy = d.lane2 * 34 * bulge + d.lane * 20 * Math.sin(TAU * cyc * (3 + d.k) + d.phi) * bulge;
    alpha = 0.22 + 0.73 * sstep(t, 0.05, 0.42);
    r = 9.0 - 3.8 * sstep(t, 0.0, 0.5);
  } else if (kind === 'rain') {
    // steer late onto THIS drop's own point on the hillside, so the shower spreads across
    // the slope instead of converging on one dot
    const tgt = faceTarget(g, d);
    const end = g.segs[2].pts[g.segs[2].pts.length - 1];
    const w = sstep(t, 0.05, 0.95);
    dx = d.lane * RAIN_IN * (1 - w) + (tgt[0] - end[0]) * w;
    dy = (tgt[1] - end[1]) * w;
    r = 5.4;
  } else if (kind === 'river') {
    // ...and converge back off it onto the shared channel over the first third
    const tgt = faceTarget(g, d);
    const start = g.segs[3].pts[0];
    const conv = sstep(t, 0, 0.34);
    dx = (tgt[0] - start[0]) * (1 - conv) + d.lane * RIVER_OUT * conv;
    dy = (tgt[1] - start[1]) * (1 - conv) + d.lane2 * 8 * conv;
    r = 5.0;
  } else {
    const ramp = sstep(t, 0, 1);
    dx = d.lane * (RIVER_OUT + (SPREAD - RIVER_OUT) * ramp);
    dy = d.lane2 * 40 * Math.sin(Math.PI * t);
    alpha = 0.7;
    r = 5.0;
  }

  return { x: p[0] + dx, y: p[1] + dy, kind, t, alpha, r: r * d.rs };
};

const faceTarget = (g: Geom, d: Drop): Pt => {
  const m = (d.lane + 1) / 2;
  return [g.face[0][0] + (g.face[1][0] - g.face[0][0]) * m, g.face[0][1] + (g.face[1][1] - g.face[0][1]) * m];
};

/**
 * THE MEASUREMENT. Buckets the live population by stage. The five counts churn every frame;
 * their sum is `drops.length` and cannot move, because nothing in this file creates or
 * destroys a particle.
 */
export const census = (g: Geom, drops: Drop[], turn: number, cyc: number): Record<Kind, number> => {
  const out: Record<Kind, number> = { evap: 0, cloud: 0, rain: 0, river: 0, sea: 0 };
  for (const d of drops) {
    const wob = 0.012 * Math.sin(TAU * cyc * d.k + d.phi);
    out[basePos(g, d.u + turn + wob).kind] += 1;
  }
  return out;
};

/** the closed loop as one smooth SVG path — the arrow and the particles share this geometry */
export const pathD = (g: Geom): string => {
  const pts: Pt[] = [];
  g.segs.forEach((s, i) => s.pts.forEach((p, j) => (i === 0 || j > 0 ? pts.push(p) : null)));
  if (pts.length > 1 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) pts.pop();
  const n = pts.length;
  const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const m0 = mid(pts[n - 1], pts[0]);
  let d = `M ${m0[0].toFixed(1)} ${m0[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const cur = pts[i];
    const m = mid(cur, pts[(i + 1) % n]);
    d += ` Q ${cur[0].toFixed(1)} ${cur[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  }
  return `${d} Z`;
};

// =============================================================================
// SCENE ATOMS — all prop-driven; the SHOT owns the choreography.
// =============================================================================
export const SkyBg: React.FC<{ top?: string; bottom?: string }> = ({ top = '#4f9fd6', bottom = '#cfeaf6' }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, #8fc7e8 46%, ${bottom} 78%, ${bottom} 100%)` }} />
);

export const Sun: React.FC<{ x: number; y: number; r: number; spin: number; pulse?: number; color?: string }> = ({
  x,
  y,
  r,
  spin,
  pulse = 0,
  color = '#f5d76e',
}) => (
  <g>
    {/* sin(pulse), NOT pulse: `pulse` is a raw angle, so using it directly made the outer glow
        grow monotonically across the whole video and snap back at the loop — the one thing in
        this composition that was not periodic, and invisible until the frame-0/last-frame diff. */}
    <circle cx={x} cy={y} r={r * (2.6 + 0.12 * Math.sin(pulse))} fill={color} opacity={0.13} />
    <circle cx={x} cy={y} r={r * 1.75} fill={color} opacity={0.3} />
    <g transform={`rotate(${spin} ${x} ${y})`} opacity={0.92}>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * TAU;
        const r0 = r * 1.26;
        const r1 = r * (1.6 + 0.1 * Math.sin(a * 3 + pulse));
        return (
          <line
            key={i}
            x1={x + Math.cos(a) * r0}
            y1={y + Math.sin(a) * r0}
            x2={x + Math.cos(a) * r1}
            y2={y + Math.sin(a) * r1}
            stroke={color}
            strokeWidth={14}
            strokeLinecap="round"
          />
        );
      })}
    </g>
    <circle cx={x} cy={y} r={r} fill={color} />
    <circle cx={x - r * 0.2} cy={y - r * 0.22} r={r * 0.74} fill="#fff4c9" />
    <circle cx={x - r * 0.3} cy={y - r * 0.34} r={r * 0.42} fill="#fffdf2" opacity={0.9} />
  </g>
);

/** puffy cloud from overlapping discs; `heavy` 0..1 darkens it as it fills */
export const CloudPuff: React.FC<{ cx: number; cy: number; w: number; heavy: number; bob?: number }> = ({
  cx,
  cy,
  w,
  heavy,
  bob = 0,
}) => {
  const s = w / 640;
  const mix = (a: number[], b: number[], k: number) =>
    `rgb(${Math.round(a[0] + (b[0] - a[0]) * k)},${Math.round(a[1] + (b[1] - a[1]) * k)},${Math.round(a[2] + (b[2] - a[2]) * k)})`;
  const top = mix([232, 240, 249], [150, 168, 189], heavy);
  const bottom = mix([196, 211, 228], [104, 122, 145], heavy);
  const puffs: [number, number, number][] = [
    [-215, 18, 78],
    [-138, -18, 100],
    [-38, -44, 118],
    [66, -30, 106],
    [156, 4, 90],
    [222, 30, 66],
    [-92, 44, 86],
    [22, 52, 92],
    [128, 48, 80],
  ];
  return (
    <g transform={`translate(${cx} ${cy + bob})`}>
      {puffs.map(([px, py, pr], i) => (
        <circle key={`b${i}`} cx={px * s} cy={(py + 26) * s} r={pr * s} fill={bottom} />
      ))}
      {puffs.slice(0, 6).map(([px, py, pr], i) => (
        <circle key={`t${i}`} cx={px * s} cy={py * s} r={pr * s * 0.95} fill={top} />
      ))}
    </g>
  );
};

export const Mountain: React.FC<{ face: string; shade: string; snow?: string }> = ({
  face,
  shade,
  snow = '#f4fbff',
}) => (
  <g>
    <polygon points="500,1215 810,800 1130,1215 1130,1440 500,1440" fill={face} />
    <polygon points="810,800 1130,1215 1130,1440 810,1440" fill={shade} />
    <polygon points="810,800 766,847 794,866 758,900 864,900 810,800" fill={snow} opacity={0.94} />
  </g>
);

export const FarHill: React.FC<{ color: string }> = ({ color }) => (
  <polygon points="-40,1215 110,1046 270,1215" fill={color} opacity={0.72} />
);

// Wide and bright on purpose: at 26px under the droplet stream (which converges onto exactly
// this line) the river was invisible during its OWN beat at phone scale.
export const RiverBed: React.FC<{ g: Geom; color: string; width?: number }> = ({ g, color, width = 42 }) => {
  const pts = g.segs[3].pts;
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  return (
    <g>
      <path d={d} stroke="rgba(10,38,58,0.34)" strokeWidth={width + 14} fill="none" strokeLinecap="round" />
      <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#dffaff" strokeWidth={width * 0.3} fill="none" strokeLinecap="round" opacity={0.5} />
    </g>
  );
};

export const Trees: React.FC<{ color: string }> = ({ color }) => (
  <g>
    {[
      [678, 1132, 0.95],
      [742, 1076, 1.05],
      [806, 1150, 1.0],
      [868, 1100, 0.85],
    ].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
        <rect x={-4} y={-6} width={8} height={20} fill="#5b4a3a" />
        <polygon points="0,-52 -22,-6 22,-6" fill={color} />
        <polygon points="0,-72 -17,-30 17,-30" fill={color} opacity={0.86} />
      </g>
    ))}
  </g>
);

export const SeaBody: React.FC<{ y: number; cyc: number; top: string; deep: string }> = ({ y, cyc, top, deep }) => {
  const wave = (x: number, amp: number, n: number) => y + amp * Math.sin(TAU * (cyc * n + x / 540));
  const pts: string[] = [];
  for (let x = -20; x <= 1100; x += 40) pts.push(`${x},${wave(x, 9, 8).toFixed(1)}`);
  const edge = `M -20,${wave(-20, 9, 8).toFixed(1)} L ${pts.join(' L ')}`;
  return (
    <g>
      {/* ONE vertical gradient surface -> deep. A second translucent band on top of a solid
          fill left a hard horizontal seam across the frame at phone scale. */}
      <defs>
        <linearGradient id="cycleSea" x1="0" y1={y} x2="0" y2={1920} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={top} />
          <stop offset="46%" stopColor={top} />
          <stop offset="100%" stopColor={deep} />
        </linearGradient>
      </defs>
      <path d={`M -20,1920 L ${edge.slice(2)} L 1100,1920 Z`} fill="url(#cycleSea)" />
      <path d={edge} stroke="#c8f2f6" strokeWidth={5} fill="none" opacity={0.5} />
      {[0, 1, 2, 3].map((i) => {
        const yy = y + 60 + i * 78;
        const off = 240 * Math.sin(TAU * (cyc * (2 + i) + i * 0.31));
        return (
          <rect
            key={i}
            x={120 + off}
            y={yy}
            width={230 - i * 22}
            height={7}
            rx={4}
            fill="#ffffff"
            opacity={0.16}
          />
        );
      })}
    </g>
  );
};

/** decorative background shower — scenery, never counted by the census */
export const RainVeil: React.FC<{ amount: number; cyc: number; color?: string }> = ({
  amount,
  cyc,
  color = '#eaf9ff',
}) => {
  if (amount <= 0.01) return null;
  const GOLD = 0.6180339887498949;
  return (
    <g opacity={0.55 * amount}>
      {Array.from({ length: 46 }).map((_, i) => {
        const s = (i * GOLD) % 1;
        const x = 566 + s * 470 + 40 * Math.sin(i * 2.4);
        const span = 380;
        const p = ((i * 0.137 + cyc * 6) % 1 + 1) % 1;
        const yTop = 700 + p * span;
        const len = 26 + 16 * ((i % 3) / 2);
        return (
          <line
            key={i}
            x1={x}
            y1={yTop}
            x2={x - 9}
            y2={yTop + len}
            stroke={color}
            strokeWidth={4}
            strokeLinecap="round"
            opacity={0.35 + 0.5 * Math.sin(Math.PI * p)}
          />
        );
      })}
    </g>
  );
};

/** the tracked population. White so it reads on sky, cloud, hillside AND sea. */
export const Drops: React.FC<{
  g: Geom;
  drops: Drop[];
  turn: number;
  cyc: number;
  dim?: Partial<Record<Kind, number>>;
}> = ({ g, drops, turn, cyc, dim }) => (
  <g>
    {drops.map((d, i) => {
      const p = dropAt(g, d, turn, cyc);
      const k = dim && dim[p.kind] !== undefined ? (dim[p.kind] as number) : 1;
      const a = p.alpha * k;
      if (a <= 0.02) return null;
      const rain = p.kind === 'rain';
      return (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={p.r * 2.1} fill="#ffffff" opacity={a * 0.2} />
          {rain ? (
            <>
              {/* a short trail leaning along the fall (down-left) so 16 drops read as RAIN */}
              <line
                x1={p.x + p.r * 1.2}
                y1={p.y - p.r * 3.6}
                x2={p.x}
                y2={p.y}
                stroke="#ffffff"
                strokeWidth={p.r * 0.8}
                strokeLinecap="round"
                opacity={a * 0.45}
              />
              <ellipse cx={p.x} cy={p.y} rx={p.r * 0.86} ry={p.r * 1.6} fill="#ffffff" opacity={a} />
            </>
          ) : (
            <circle cx={p.x} cy={p.y} r={p.r} fill="#ffffff" opacity={a} />
          )}
          <circle cx={p.x} cy={p.y} r={p.r} fill="none" stroke="rgba(16,48,78,0.30)" strokeWidth={1.6} opacity={a} />
        </g>
      );
    })}
  </g>
);

/** the loop, drawn — a faint band along the very path the particles ride, with a marching dash */
export const LoopArrow: React.FC<{ g: Geom; dash: number; color?: string; accent?: string; opacity?: number }> = ({
  g,
  dash,
  color = '#ffffff',
  accent = '#f5d76e',
  opacity = 1,
}) => {
  const d = pathD(g);
  const heads = [0.13, 0.36, 0.63, 0.88].map((q) => {
    const a = basePos(g, q).p;
    const b = basePos(g, q + 0.006).p;
    return { x: a[0], y: a[1], deg: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI };
  });
  return (
    <g opacity={opacity}>
      <path d={d} stroke={color} strokeWidth={34} fill="none" opacity={0.2} strokeLinecap="round" />
      <path
        d={d}
        stroke={accent}
        strokeWidth={7}
        fill="none"
        opacity={0.6}
        strokeDasharray="18 22"
        strokeDashoffset={dash}
        strokeLinecap="round"
      />
      {heads.map((h, i) => (
        <polygon
          key={i}
          points="0,-16 32,0 0,16"
          fill={accent}
          opacity={0.78}
          transform={`translate(${h.x} ${h.y}) rotate(${h.deg})`}
        />
      ))}
    </g>
  );
};

/** the curriculum word, with the kid gloss under it */
export const StageLabel: React.FC<{ word: string; gloss: string; on: number; y?: number; color?: string }> = ({
  word,
  gloss,
  on,
  y = 178,
  color = '#f5d76e',
}) => {
  if (on <= 0.01) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        opacity: on,
        transform: `translateY(${(1 - on) * 14}px)`,
      }}
    >
      <div
        style={{
          background: 'rgba(12,32,52,0.72)',
          border: `2px solid ${color}66`,
          borderRadius: 999,
          padding: '14px 42px 16px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 46,
            letterSpacing: 5,
            color,
            textTransform: 'uppercase',
          }}
        >
          {word}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: 28, color: 'rgba(255,255,255,0.86)', marginTop: 2 }}>
          {gloss}
        </div>
      </div>
    </div>
  );
};

/**
 * THE PAYOFF, as a live measurement. Every cell is counted off the particle array this frame.
 * The cells churn; `total` is drops.length and is a constant of the code.
 */
export const CensusStrip: React.FC<{
  cells: { label: string; n: number }[];
  total: number;
  on: number;
  y?: number;
  color?: string;
  note?: string;
}> = ({ cells, total, on, y = 176, color = '#f5d76e', note = 'never changes' }) => {
  if (on <= 0.01) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: 60,
        right: 60,
        opacity: on,
        transform: `translateY(${(1 - on) * 16}px)`,
      }}
    >
      <div style={{ display: 'flex', gap: 10 }}>
        {cells.map((c) => (
          <div
            key={c.label}
            style={{
              flex: 1,
              background: 'rgba(12,32,52,0.72)',
              border: '2px solid rgba(255,255,255,0.18)',
              borderRadius: 16,
              padding: '12px 4px 14px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 21, letterSpacing: 2, color: 'rgba(255,255,255,0.72)' }}>
              {c.label}
            </div>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 44, color: '#ffffff', lineHeight: 1.1 }}>{c.n}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 12,
          background: 'rgba(12,32,52,0.82)',
          border: `3px solid ${color}`,
          borderRadius: 18,
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <span style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 26, letterSpacing: 3, color: 'rgba(255,255,255,0.8)' }}>
          TOTAL
        </span>
        <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 54, color }}>{total}</span>
        <span style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 30, color }}>{note}</span>
      </div>
    </div>
  );
};

/**
 * FOCUS — a soft radial dim that closes down onto the active stage. Not a cut: the cycle keeps
 * running (and keeps being conserved) underneath it. Fully open at frame 0 and at the last
 * frame, which is what lets the loop close.
 */
export const Focus: React.FC<{ x: number; y: number; r: number; amount: number; tint?: string }> = ({
  x,
  y,
  r,
  amount,
  tint = '8,32,58',
}) => {
  if (amount <= 0.005) return null;
  return (
    <AbsoluteFill
      style={{
        // a long falloff (30% -> 100%): a short one drew a visible disc edge across the sky
        background: `radial-gradient(circle ${r.toFixed(0)}px at ${x.toFixed(0)}px ${y.toFixed(0)}px, rgba(${tint},0) 0%, rgba(${tint},0) 30%, rgba(${tint},${amount.toFixed(3)}) 100%)`,
        pointerEvents: 'none',
      }}
    />
  );
};
