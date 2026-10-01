// =============================================================================
// lib/gill.tsx — THE GILL-BREATHER ENGINE (a body that breathes water, with its budgets)
//
// First used by short-48 ("What If Humans Could Breathe Underwater?").
//
// Two budgets, both COMPUTED from textbook physiology, never typed:
//   OXYGEN — water flow needed = O2 demand / (O2 per liter of water × gill extraction).
//   HEAT   — heat lost = blood flow × heat capacity × (core − sea), because gill blood leaves at
//            sea temperature; compared against the heat a resting body makes from the same O2.
//
// The swimmer is a side profile facing left. Water enters the mouth and leaves through three gill
// slits; the blood loop runs heart → gills → body → heart and is coloured by its temperature at
// every point, so "the blood leaves the gills cold" is drawn, not stated. Every moving particle
// takes a PHASE from the shot, so a shot can make the motion periodic in its own length (loops).
// =============================================================================
import React from 'react';
import { Easing } from 'remotion';
import { FONT_BODY, FONT_MONO } from '../fonts';

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const frac = (v: number) => v - Math.floor(v);

export const GL = {
  deep: '#051019',
  sea: '#0b2536',
  warm: '#ff9466',
  cold: '#5cc8f2',
  gold: '#f5d76e',
  teal: '#4ecdc4',
  pink: '#e8879f',
  skin: '#9fb3c2',
  muted: '#8b949e',
  o2: '#dff7ff',
} as const;

export const hexMix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  const k = clamp01(t);
  return `#${x.map((v, i) => Math.round(mix(v, y[i], k)).toString(16).padStart(2, '0')).join('')}`;
};

// deterministic 0..1 noise — no Math.random in a render
export const hash = (n: number) => frac(Math.sin(n * 127.1 + 311.7) * 43758.5453);

// =============================================================================
// THE MODEL
// =============================================================================
export const PHYS = {
  o2Air: 209, // mL O2 per liter of air (20.9%)
  o2Water: 6.4, // mL O2 per liter of fresh water at 20 °C (9.1 mg/L)
  demand: 250, // mL O2 per minute, a 70 kg adult at rest (3.5 mL/kg/min)
  extract: 0.8, // fraction a fish-grade gill pulls out of the water
  mass: 70, // kg (≈ liters of water)
  core: 37, // °C
  sea: 20, // °C
  cardiac: 5, // L blood per minute at rest
  bloodKg: 1.06, // kg per liter
  bloodCp: 3.6, // kJ/kg/K
  joulesPerMlO2: 20.1, // J released per mL O2 burned
} as const;

export const o2Ratio = () => PHYS.o2Air / PHYS.o2Water;
export const flowNeeded = () => PHYS.demand / (PHYS.o2Water * PHYS.extract); // L water / min
export const bodyWeightSeconds = () => (PHYS.mass / flowNeeded()) * 60;
export const heatLostW = (tOut: number = PHYS.sea) =>
  (PHYS.cardiac * PHYS.bloodKg * PHYS.bloodCp * 1000 * (PHYS.core - tOut)) / 60;
export const heatMadeW = () => (PHYS.demand * PHYS.joulesPerMlO2) / 60;
export const tempColor = (t: number) => hexMix(GL.cold, GL.warm, (t - PHYS.sea) / (PHYS.core - PHYS.sea));

// =============================================================================
// CURVES — closed or open catmull-rom through control points, sampled by arc length.
// =============================================================================
export type Pt = { x: number; y: number };
export type Curve = { pts: Pt[]; len: number[]; total: number; closed: boolean };

export const makeCurve = (ctrl: Pt[], closed: boolean, perSeg = 16): Curve => {
  const n = ctrl.length;
  const at = (i: number) => (closed ? ctrl[(i + n) % n] : ctrl[Math.max(0, Math.min(n - 1, i))]);
  const pts: Pt[] = [];
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    for (let k = 0; k < perSeg; k++) {
      const t = k / perSeg;
      const t2 = t * t;
      const t3 = t2 * t;
      const c = (a: number, b: number, cc: number, d: number) =>
        0.5 * (2 * b + (-a + cc) * t + (2 * a - 5 * b + 4 * cc - d) * t2 + (-a + 3 * b - 3 * cc + d) * t3);
      pts.push({ x: c(p0.x, p1.x, p2.x, p3.x), y: c(p0.y, p1.y, p2.y, p3.y) });
    }
  }
  pts.push(closed ? { ...pts[0] } : { ...ctrl[n - 1] });
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  return { pts, len, total: len[len.length - 1], closed };
};

// point + unit normal at arc fraction s (0..1)
export const pointAt = (c: Curve, s: number): Pt & { nx: number; ny: number } => {
  const d = clamp01(c.closed ? frac(s) : s) * c.total;
  let lo = 0;
  let hi = c.len.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (c.len[mid] <= d) lo = mid;
    else hi = mid;
  }
  const a = c.pts[lo];
  const b = c.pts[hi];
  const u = (d - c.len[lo]) / Math.max(1e-6, c.len[hi] - c.len[lo]);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const m = Math.max(1e-6, Math.hypot(dx, dy));
  return { x: mix(a.x, b.x, u), y: mix(a.y, b.y, u), nx: -dy / m, ny: dx / m };
};

// the arc fraction closest to a point
export const nearestS = (c: Curve, p: Pt) => {
  let best = 0;
  let bd = Infinity;
  c.pts.forEach((q, i) => {
    const d = Math.hypot(q.x - p.x, q.y - p.y);
    if (d < bd) {
      bd = d;
      best = c.len[i] / c.total;
    }
  });
  return best;
};

export const pathOf = (pts: Pt[], close = false) =>
  pts.map((q, i) => `${i ? 'L' : 'M'}${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ') + (close ? ' Z' : '');

// =============================================================================
// THE SWIMMER — side profile facing left, canvas coordinates.
// =============================================================================
const PROFILE = makeCurve(
  [
    { x: 575, y: 392 }, { x: 640, y: 410 }, { x: 678, y: 462 }, { x: 685, y: 530 }, { x: 668, y: 592 },
    { x: 640, y: 632 }, { x: 640, y: 700 }, { x: 702, y: 760 }, { x: 732, y: 860 }, { x: 730, y: 980 },
    { x: 720, y: 1090 }, { x: 470, y: 1090 }, { x: 478, y: 960 }, { x: 462, y: 850 }, { x: 498, y: 760 },
    { x: 530, y: 706 }, { x: 528, y: 660 }, { x: 490, y: 642 }, { x: 463, y: 624 }, { x: 457, y: 603 },
    { x: 447, y: 590 }, { x: 456, y: 575 }, { x: 441, y: 553 }, { x: 424, y: 536 }, { x: 440, y: 506 },
    { x: 452, y: 472 }, { x: 472, y: 438 }, { x: 515, y: 403 },
  ],
  true,
  10,
);
export const SWIMMER = {
  mouth: { x: 450, y: 590 },
  gills: [0, 1, 2].map((i) => ({ x: 574 + i * 22, y: 648, h: 66 })),
  heart: { x: 560, y: 865 },
  eye: { x: 480, y: 500 },
} as const;

// gills[i] 0..1 = how open each slit is
export const Swimmer: React.FC<{ gills: number[]; glow?: number; opacity?: number }> = ({ gills, glow = 0, opacity = 1 }) => (
  <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity }} width={1080} height={1920}>
    <defs>
      <linearGradient id="gl-fade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.72" stopColor="#fff" stopOpacity={1} />
        <stop offset="0.98" stopColor="#fff" stopOpacity={0} />
      </linearGradient>
      <mask id="gl-mask" maskUnits="userSpaceOnUse" x={0} y={380} width={1080} height={720}>
        <rect x={0} y={380} width={1080} height={720} fill="url(#gl-fade)" />
      </mask>
    </defs>
    <g mask="url(#gl-mask)">
      <path d={pathOf(PROFILE.pts, true)} fill="rgba(170,210,230,0.07)" stroke={hexMix(GL.skin, GL.teal, glow)} strokeWidth={5} strokeLinejoin="round" />
    </g>
    <circle cx={SWIMMER.eye.x} cy={SWIMMER.eye.y} r={7} fill={GL.skin} />
    <path d={`M${SWIMMER.mouth.x - 3},${SWIMMER.mouth.y} q 14 4 26 1`} stroke={GL.skin} strokeWidth={4} fill="none" strokeLinecap="round" />
    {SWIMMER.gills.map((g, i) => {
      const o = clamp01(gills[i] ?? 0);
      if (o <= 0.01) return null;
      const d = `M${g.x},${g.y} q ${-10 * o} ${g.h / 2} 0 ${g.h}`;
      return (
        <g key={i} opacity={o}>
          <path d={d} stroke={GL.teal} strokeWidth={14 * o} strokeLinecap="round" fill="none" opacity={0.25 + 0.3 * glow} />
          <path d={d} stroke={hexMix('#0a1a24', GL.teal, 0.25)} strokeWidth={5 + 3 * o} strokeLinecap="round" fill="none" />
        </g>
      );
    })}
  </svg>
);

// =============================================================================
// THE BLOOD LOOP — heart → gills → body → heart, coloured by temperature along the way.
// =============================================================================
export const BLOOD = makeCurve(
  [
    SWIMMER.heart, { x: 588, y: 800 }, { x: 596, y: 730 }, { x: 600, y: 684 }, { x: 640, y: 712 },
    { x: 676, y: 790 }, { x: 686, y: 900 }, { x: 670, y: 1000 }, { x: 600, y: 1040 }, { x: 530, y: 1010 },
    { x: 510, y: 940 }, { x: 526, y: 885 },
  ],
  true,
  14,
);
export const BLOOD_GILL_S = nearestS(BLOOD, { x: 600, y: 684 });

// temperature at arc s: core until the gills, sea-cooled right after, rewarmed by the body on the way home
export const bloodTemp = (s: number, tOut: number) => {
  const u = frac(s);
  if (u <= BLOOD_GILL_S) return PHYS.core;
  const back = (u - BLOOD_GILL_S) / (1 - BLOOD_GILL_S);
  return mix(tOut, PHYS.core, Math.pow(back, 1.6));
};

export const BloodLoop: React.FC<{ tOut: number; phase: number; opacity?: number; beat?: number }> = ({ tOut, phase, opacity = 1, beat = 0 }) => {
  if (opacity <= 0.01) return null;
  const N = 90;
  const segs = [];
  for (let i = 0; i < N; i++) {
    const a = pointAt(BLOOD, i / N);
    const b = pointAt(BLOOD, (i + 1) / N);
    segs.push(<line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={tempColor(bloodTemp((i + 0.5) / N, tOut))} strokeWidth={9} strokeLinecap="round" />);
  }
  const cells = [];
  const C = 22;
  for (let k = 0; k < C; k++) {
    const s = frac(k / C + phase);
    const p = pointAt(BLOOD, s);
    cells.push(<circle key={k} cx={p.x} cy={p.y} r={6.5} fill="#ffffff" opacity={0.75} />);
  }
  const h = SWIMMER.heart;
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity }} width={1080} height={1920}>
      <g opacity={0.35}>{segs.map((s) => React.cloneElement(s, { strokeWidth: 22, key: `g${s.key}` }))}</g>
      {segs}
      {cells}
      <circle cx={h.x} cy={h.y} r={24 + 4 * beat} fill={GL.warm} stroke="#ffd2bd" strokeWidth={3} />
    </svg>
  );
};

// =============================================================================
// THE WATER STREAM — in at the mouth, out through the slits, fanned by particle.
// =============================================================================
export const STREAM = makeCurve(
  [{ x: 170, y: 575 }, { x: 330, y: 585 }, { x: 452, y: 590 }, { x: 520, y: 620 }, { x: 585, y: 680 }, { x: 680, y: 720 }, { x: 830, y: 770 }, { x: 1000, y: 840 }],
  false,
  14,
);
const STREAM_PINCH = nearestS(STREAM, SWIMMER.mouth);
const STREAM_GILL = nearestS(STREAM, { x: 585, y: 680 });

export const WaterStream: React.FC<{ phase: number; density: number; opacity?: number }> = ({ phase, density, opacity = 1 }) => {
  if (opacity <= 0.01 || density <= 0.01) return null;
  const N = 44;
  const out = [];
  for (let k = 0; k < N; k++) {
    if (hash(k + 3) > density) continue;
    const s = frac(k / N + phase + 0.37 * hash(k));
    const p = pointAt(STREAM, s);
    // fan: wide in front of the face, pinched at the mouth, three-way split through the slits
    const spread = s < STREAM_PINCH ? mix(38, 4, s / STREAM_PINCH) : s < STREAM_GILL ? 6 : mix(8, 70, (s - STREAM_GILL) / (1 - STREAM_GILL));
    const j = (hash(k + 11) - 0.5) * 2;
    const x = p.x + p.nx * spread * j;
    const y = p.y + p.ny * spread * j;
    const inside = s > STREAM_PINCH && s < STREAM_GILL;
    const edge = Math.min(1, s / 0.08, (1 - s) / 0.12);
    out.push(
      <line
        key={k}
        x1={x}
        y1={y}
        x2={x - 26 * (p.ny)}
        y2={y + 26 * p.nx}
        stroke={GL.cold}
        strokeWidth={5}
        strokeLinecap="round"
        opacity={edge * (inside ? 0.35 : 0.8)}
      />,
    );
  }
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity }} width={1080} height={1920}>
      {out}
    </svg>
  );
};

// heat leaving the gills as warm wisps, drifting up and back
export const HeatWisps: React.FC<{ phase: number; amount: number }> = ({ phase, amount }) => {
  if (amount <= 0.01) return null;
  const out = [];
  for (let k = 0; k < 14; k++) {
    const u = frac(k / 14 + phase);
    const x = 612 + 190 * u + 24 * Math.sin(u * 7 + k);
    const y = 690 - 150 * u + 30 * (hash(k) - 0.5);
    out.push(<circle key={k} cx={x} cy={y} r={mix(7, 20, u)} fill={GL.warm} opacity={amount * 0.5 * Math.sin(Math.PI * u)} />);
  }
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1080} height={1920}>
      {out}
    </svg>
  );
};

// =============================================================================
// THE OCEAN — deep gradient, light rays, rising bubbles (phase-driven so it loops).
// =============================================================================
export const Ocean: React.FC<{ phase: number }> = ({ phase }) => (
  <svg style={{ position: 'absolute', left: 0, top: 0 }} width={1080} height={1920}>
    <defs>
      <linearGradient id="gl-ray" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#78dcff" stopOpacity={0.07} />
        <stop offset="1" stopColor="#78dcff" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="gl-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0f3a52" />
        <stop offset="0.5" stopColor={GL.sea} />
        <stop offset="1" stopColor={GL.deep} />
      </linearGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#gl-sea)" />
    {[0, 1, 2, 3, 4].map((k) => {
      const sway = 40 * Math.sin(2 * Math.PI * (phase * 2 + k / 5));
      const x = 120 + k * 230 + sway;
      return <polygon key={k} points={`${x - 30},0 ${x + 40},0 ${x + 260},1800 ${x + 70},1800`} fill="url(#gl-ray)" />;
    })}
    {Array.from({ length: 26 }).map((_, k) => {
      const speed = 2 + Math.floor(hash(k + 40) * 4); // whole cycles per phase unit → periodic
      const u = frac(hash(k) + phase * speed);
      const x = 60 + hash(k + 7) * 960 + 14 * Math.sin(u * 12 + k);
      const y = 1920 - u * 2000;
      return <circle key={k} cx={x} cy={y} r={3 + hash(k + 9) * 7} fill="none" stroke="rgba(200,240,255,0.28)" strokeWidth={2} />;
    })}
  </svg>
);

// =============================================================================
// FLASK — one liter, its oxygen drawn as dots (each dot = one liter of water's worth).
// =============================================================================
export const Flask: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub: string;
  dots: number;
  shown: number; // 0..dots, fractional → the next dot pops in
  color: string;
  tint: string;
  opacity?: number;
  glow?: number;
}> = ({ x, y, w, h, label, sub, dots, shown, color, tint, opacity = 1, glow = 0 }) => {
  if (opacity <= 0.01) return null;
  const cols = 7;
  const pad = 26;
  const cw = (w - pad * 2) / cols;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 26,
          background: tint,
          border: `3px solid ${color}${glow > 0.3 ? 'ee' : '77'}`,
          boxShadow: glow > 0.01 ? `0 0 ${46 * glow}px ${color}88` : '0 10px 40px rgba(0,0,0,0.4)',
        }}
      />
      <svg style={{ position: 'absolute', left: 0, top: 0 }} width={w} height={h}>
        {Array.from({ length: dots }).map((_, i) => {
          const p = clamp01(shown - i);
          if (p <= 0) return null;
          const cx = pad + cw * ((i % cols) + 0.5) + (hash(i) - 0.5) * 8;
          const cy = h - 30 - Math.floor(i / cols) * cw * 0.9 + (hash(i + 5) - 0.5) * 6;
          return <circle key={i} cx={cx} cy={cy} r={11 * EASE_OUT(p)} fill={GL.o2} opacity={0.92} />;
        })}
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 16, textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 32, letterSpacing: 4, color }}>{label}</div>
        <div style={{ fontFamily: FONT_MONO, fontWeight: 500, fontSize: 25, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{sub}</div>
      </div>
    </div>
  );
};

// =============================================================================
// BAR — a labelled horizontal quantity (heat, mass). `fill` 0..1 of the track.
// =============================================================================
export const Bar: React.FC<{
  x: number;
  y: number;
  w: number;
  label: string;
  value: string;
  fill: number;
  color: string;
  opacity?: number;
  glow?: number;
}> = ({ x, y, w, label, value, fill, color, opacity = 1, glow = 0 }) => {
  if (opacity <= 0.01) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, opacity }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 22, letterSpacing: 3, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 34, color }}>{value}</span>
      </div>
      <div style={{ height: 22, borderRadius: 11, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div
          style={{
            width: `${clamp01(fill) * 100}%`,
            minWidth: fill > 0.0005 ? 10 : 0,
            height: '100%',
            borderRadius: 11,
            background: color,
            boxShadow: glow > 0.01 ? `0 0 ${30 * glow}px ${color}` : undefined,
          }}
        />
      </div>
    </div>
  );
};

// =============================================================================
// FISH — a small cold-blooded swimmer facing left, with an optional temperature tag.
// =============================================================================
export const Fish: React.FC<{ x: number; y: number; s: number; color: string; tag?: string; wag: number; opacity?: number }> = ({
  x,
  y,
  s,
  color,
  tag,
  wag,
  opacity = 1,
}) => (
  <div style={{ position: 'absolute', left: x, top: y, opacity }}>
    <svg style={{ position: 'absolute', left: -60 * s, top: -30 * s, overflow: 'visible' }} width={130 * s} height={60 * s} viewBox="0 0 130 60">
      <path d="M0,30 C 20,4 70,0 96,30 C 70,60 20,56 0,30 Z" fill={color} opacity={0.9} />
      <path d={`M92,30 L128,${10 + 6 * wag} L${120 + 4 * wag},30 L128,${50 + 6 * wag} Z`} fill={color} opacity={0.75} />
      <circle cx={20} cy={26} r={4} fill={GL.deep} />
    </svg>
    {tag ? (
      <div
        style={{
          position: 'absolute',
          left: -40,
          top: -30 * s - 44,
          width: 80,
          textAlign: 'center',
          fontFamily: FONT_MONO,
          fontWeight: 700,
          fontSize: 24,
          color,
        }}
      >
        {tag}
      </div>
    ) : null}
  </div>
);
