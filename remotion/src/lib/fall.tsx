// Falling kit — a REAL vertical-motion simulation (gravity that can change sign, quadratic air drag,
// a floor and an optional ceiling) plus the side-view pieces to draw it to scale. Seeds short-54
// ("what if gravity reversed for 10 seconds?") and is generic enough for the rest of the niche:
// terminal velocity, "could you survive falling from X", dropping a penny off a skyscraper,
// jumping on the Moon, a tunnel through the Earth.
//
// THE POINT OF THIS LIB: the altitude on screen is never keyframed. `simulate` integrates the
// motion once at module load, the shot only decides WHICH moment of that motion to show (the sim
// clock), and every number the narrator says is read back off the arrays and asserted.
import React from 'react';
import { FONT_BODY, FONT_DISPLAY } from '../fonts';

export const G = 9.81; // m/s²
export const VT_SKYDIVER = 53; // m/s, belly-to-earth terminal velocity (~190 km/h)

// =============================================================================
// THE SIMULATION — semi-implicit Euler at 1 ms. y is metres above the floor, + is up.
// =============================================================================
export type Motion = {
  dt: number;
  y: Float64Array;
  v: Float64Array;
  hitHi: number; // first time the ceiling stopped it (s), or -1
  landed: number; // first time the floor stopped it after lift-off (s), or -1
  landV: number; // speed at that moment (m/s, signed)
  hiV: number; // speed when it hit the ceiling (m/s)
};

export const simulate = (opts: {
  T: number; // seconds to simulate
  gravity: (t: number) => number; // signed acceleration, + = up
  vt?: number; // terminal velocity for quadratic drag; Infinity = vacuum
  hi?: number; // ceiling (metres above the floor), inelastic
  dt?: number;
}): Motion => {
  const { T, gravity, vt = Infinity, hi = Infinity, dt = 0.001 } = opts;
  const n = Math.ceil(T / dt) + 1;
  const y = new Float64Array(n);
  const v = new Float64Array(n);
  let yy = 0;
  let vv = 0;
  let hitHi = -1;
  let hiV = 0;
  let landed = -1;
  let landV = 0;
  let airborne = false;
  for (let i = 1; i < n; i++) {
    const t = i * dt;
    const drag = Number.isFinite(vt) ? (-G * vv * Math.abs(vv)) / (vt * vt) : 0;
    vv += (gravity(t) + drag) * dt;
    yy += vv * dt;
    if (yy > 0.001) airborne = true;
    if (yy >= hi) {
      if (hitHi < 0) {
        hitHi = t;
        hiV = vv;
      }
      yy = hi;
      vv = Math.min(0, vv);
    }
    if (yy <= 0) {
      if (airborne && landed < 0) {
        landed = t;
        landV = vv;
      }
      yy = 0;
      vv = Math.max(0, vv);
    }
    y[i] = yy;
    v[i] = vv;
  }
  return { dt, y, v, hitHi, landed, landV, hiV };
};

const idx = (m: Motion, t: number) => Math.max(0, Math.min(m.y.length - 1, t / m.dt));
const lerpArr = (a: Float64Array, i: number) => {
  const i0 = Math.floor(i);
  const i1 = Math.min(a.length - 1, i0 + 1);
  return a[i0] + (a[i1] - a[i0]) * (i - i0);
};
export const altAt = (m: Motion, t: number) => lerpArr(m.y, idx(m, t));
export const velAt = (m: Motion, t: number) => lerpArr(m.v, idx(m, t));
export const peakOf = (m: Motion): { y: number; t: number } => {
  let best = 0;
  for (let i = 1; i < m.y.length; i++) if (m.y[i] > m.y[best]) best = i;
  return { y: m.y[best], t: best * m.dt };
};
// the highest point reached up to sim time t — the trail
export const maxUpTo = (m: Motion, t: number) => {
  const last = Math.floor(idx(m, t));
  let best = 0;
  for (let i = 0; i <= last; i += 10) best = Math.max(best, m.y[i]);
  return Math.max(best, altAt(m, t));
};

export const kmh = (ms: number) => ms * 3.6;

// =============================================================================
// THE SIM CLOCK — which moment of the motion the frame shows. Piecewise-linear keys
// [frame, simSeconds]; frames must increase, sim seconds may hold, rewind or race.
// =============================================================================
export type ClockKey = [number, number];
export const clockAt = (keys: ClockKey[], f: number): number => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f1, s1] = keys[i];
    if (f <= f1) {
      const [f0, s0] = keys[i - 1];
      return f1 === f0 ? s1 : s0 + ((s1 - s0) * (f - f0)) / (f1 - f0);
    }
  }
  return keys[keys.length - 1][1];
};
// sim seconds per real second at frame f (1 = real time, 0 = frozen, < 0 = rewinding)
export const clockRate = (keys: ClockKey[], f: number, fps = 30): number => {
  for (let i = 1; i < keys.length; i++) {
    const [f1, s1] = keys[i];
    const [f0, s0] = keys[i - 1];
    if (f >= f0 && f < f1) return ((s1 - s0) / (f1 - f0)) * fps;
  }
  return 0;
};

// =============================================================================
// DRAWING — a side view in metres. `yOf(m)` maps altitude to screen y.
// =============================================================================
export type SideScale = { ground: number; pxm: number; yOf: (m: number) => number };
export const makeSide = (ground: number, pxm: number): SideScale => ({ ground, pxm, yOf: (m) => ground - m * pxm });

export const AltitudeScale: React.FC<{ s: SideScale; x: number; max: number; step?: number; o?: number }> = ({ s, x, max, step = 50, o = 1 }) => (
  <g opacity={o}>
    <line x1={x} x2={x} y1={s.yOf(0)} y2={s.yOf(max)} stroke="rgba(255,255,255,0.25)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
    {Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => i * step).map((m) => (
      <g key={m}>
        <line x1={x} x2={x + (m % 100 === 0 ? 18 : 10)} y1={s.yOf(m)} y2={s.yOf(m)} stroke="rgba(255,255,255,0.35)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
        {m % 100 === 0 && m > 0 ? (
          <text x={x + 26} y={s.yOf(m) + 9} fill="rgba(255,255,255,0.5)" fontFamily={FONT_BODY} fontWeight={600} fontSize={26}>
            {m} m
          </text>
        ) : null}
      </g>
    ))}
  </g>
);

// Empire State Building, side silhouette to scale: roof 381 m, antenna tip 443 m. Stepped massing
// simplified to four setbacks; heights are the real ones, widths are approximate.
export const ESB = { roof: 381, tip: 443 };
export const EmpireState: React.FC<{ s: SideScale; cx: number; fill?: string; stroke?: string }> = ({ s, cx, fill = '#1d2636', stroke = '#3a4a64' }) => {
  const tiers: [number, number, number][] = [
    [0, 26, 128],
    [26, 85, 100],
    [85, 320, 58],
    [320, 373, 40],
    [373, 381, 30],
    [381, 405, 14],
  ];
  return (
    <g>
      {tiers.map(([a, b, w]) => (
        <rect key={a} x={cx - (w * s.pxm) / 2} y={s.yOf(b)} width={w * s.pxm} height={(b - a) * s.pxm} fill={fill} stroke={stroke} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      ))}
      <line x1={cx} x2={cx} y1={s.yOf(405)} y2={s.yOf(ESB.tip)} stroke={stroke} strokeWidth={3} vectorEffect="non-scaling-stroke" />
      {/* window bands, so it reads as a building at phone size */}
      {Array.from({ length: 22 }, (_, i) => 95 + i * 10).map((m) => (
        <line key={m} x1={cx - 22 * s.pxm} x2={cx + 22 * s.pxm} y1={s.yOf(m)} y2={s.yOf(m)} stroke="rgba(245,215,110,0.12)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      ))}
    </g>
  );
};

// A person, drawn in METRES (height h) with the feet at (x, yFeet) — to scale when zoomed in.
export const Person: React.FC<{ x: number; yFeet: number; h: number; color: string; glow?: boolean }> = ({ x, yFeet, h, color, glow }) => {
  const head = h * 0.13;
  const bodyW = h * 0.26;
  return (
    <g style={glow ? { filter: `drop-shadow(0 0 ${h * 0.25}px ${color})` } : undefined}>
      <circle cx={x} cy={yFeet - h + head} r={head} fill={color} />
      <rect x={x - bodyW / 2} y={yFeet - h + head * 2.25} width={bodyW} height={h * 0.45} rx={bodyW * 0.45} fill={color} />
      <rect x={x - bodyW * 0.42} y={yFeet - h * 0.34} width={bodyW * 0.32} height={h * 0.34} rx={bodyW * 0.16} fill={color} />
      <rect x={x + bodyW * 0.1} y={yFeet - h * 0.34} width={bodyW * 0.32} height={h * 0.34} rx={bodyW * 0.16} fill={color} />
    </g>
  );
};

// Chevrons drifting the way gravity pulls: dir +1 = down (normal), -1 = up (reversed).
export const GravityField: React.FC<{ frame: number; dir: number; o: number; xs: number[]; top: number; bottom: number; color?: string }> = ({
  frame,
  dir,
  o,
  xs,
  top,
  bottom,
  color = '#8f93f7',
}) => {
  if (o <= 0.01) return null;
  const gap = 150;
  const span = bottom - top;
  const rows = Math.ceil(span / gap) + 1;
  const off = ((frame * 3 * dir) % gap + gap) % gap;
  return (
    <g opacity={o}>
      {xs.map((x, j) =>
        Array.from({ length: rows }, (_, i) => {
          const y = top + ((i * gap + off + j * 60) % (rows * gap)) - gap / 2;
          if (y < top || y > bottom) return null;
          const edge = Math.min(1, (y - top) / 80, (bottom - y) / 80);
          const d = dir * 14;
          return (
            <polyline key={`${j}-${i}`} points={`${x - 18},${y - d} ${x},${y + d} ${x + 18},${y - d}`} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" opacity={0.35 * edge} />
          );
        }),
      )}
    </g>
  );
};

// Panel readout: label over a big number.
export const Readout: React.FC<{ label: string; value: string; color?: string; w: number; pop?: number }> = ({ label, value, color = '#fff', w, pop = 0 }) => (
  <div style={{ width: w, textAlign: 'center' }}>
    <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: 'rgba(255,255,255,0.55)' }}>{label}</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 58, color, marginTop: 4, transform: `scale(${1 + 0.08 * pop})` }}>{value}</div>
  </div>
);
