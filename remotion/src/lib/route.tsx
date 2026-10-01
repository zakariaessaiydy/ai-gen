// lib/route.tsx — a floor plan in METRES, a walking route with arc-length parametrisation, and
// stops that light when the walker actually reaches them.
//
// The engine's one rule: nothing about the route is typed twice. A stop is given the OBJECT it
// belongs to (the alarm on the dresser, the tap on the counter); its arc position `s` is that
// object PROJECTED onto the route, its station is the route's own point at `s`, and its order is
// the rank of `s`. So "three things before the phone" is the route counting, not a caption —
// move the phone to the nightstand and the count re-argues itself.
//
// Plan space is metres; `View` maps it to pixels (px = o + m·k). Lengths the screen prints are
// metres read back off the same polyline the line is drawn from.
import React from 'react';
import { Easing } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const ROUTE_COLORS = {
  stage: '#0f1216',
  wall: '#aab3c5',
  floor: 'rgba(255,255,255,0.025)',
  furn: 'rgba(255,255,255,0.055)',
  furnEdge: 'rgba(255,255,255,0.22)',
  dim: '#8b93a7',
  text: '#e8ecf5',
  accent: '#f5d76e',
  indigo: '#6366F1',
  violet: '#9b7cc4',
  teal: '#4db8a8',
  pink: '#e8879f',
  glass: '#8fc7ff',
} as const;

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const TAU = Math.PI * 2;
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

// =============================================================================
// GEOMETRY — metres in, metres out.
// =============================================================================
export type Pt = { x: number; y: number };
export const P = (x: number, y: number): Pt => ({ x, y });
export type View = { ox: number; oy: number; k: number };
export const toPx = (v: View, p: Pt): Pt => ({ x: v.ox + p.x * v.k, y: v.oy + p.y * v.k });
export const dist = (a: Pt, b: Pt) => Math.hypot(b.x - a.x, b.y - a.y);
export const lerpPt = (a: Pt, b: Pt, t: number): Pt => ({ x: mix(a.x, b.x, t), y: mix(a.y, b.y, t) });

export const pathLen = (pts: Pt[]) => {
  let s = 0;
  for (let i = 1; i < pts.length; i++) s += dist(pts[i - 1], pts[i]);
  return s;
};

/** The point `s` metres along the polyline (clamped to its ends). */
export const pointAt = (pts: Pt[], s: number): Pt => {
  if (s <= 0) return pts[0];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = dist(pts[i - 1], pts[i]);
    if (acc + d >= s) return lerpPt(pts[i - 1], pts[i], d === 0 ? 0 : (s - acc) / d);
    acc += d;
  }
  return pts[pts.length - 1];
};

/** The piece of the polyline between arc positions s0 and s1, corners included. */
export const subpath = (pts: Pt[], s0: number, s1: number): Pt[] => {
  if (s1 <= s0) return [];
  const out = [pointAt(pts, s0)];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    acc += dist(pts[i - 1], pts[i]);
    if (acc > s0 && acc < s1) out.push(pts[i]);
  }
  out.push(pointAt(pts, s1));
  return out;
};

/** Arc position of the point on the polyline nearest to p — how a thing gets ON the route. */
export const projectS = (pts: Pt[], p: Pt): number => {
  let best = Infinity;
  let bestS = 0;
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const d = dist(a, b);
    const t = d === 0 ? 0 : clamp01(((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / (d * d));
    const dd = dist(p, lerpPt(a, b, t));
    if (dd < best) {
      best = dd;
      bestS = acc + t * d;
    }
    acc += d;
  }
  return bestS;
};

export type StopDef = { id: string; label: string; sub: string; at: Pt; color: string };
export type Stop = StopDef & { s: number; station: Pt; order: number };

/** Put things on the route: s by projection, station = the route's own point, order = rank of s. */
export const placeStops = (route: Pt[], defs: StopDef[]): Stop[] => {
  const withS = defs.map((d) => {
    const s = projectS(route, d.at);
    return { ...d, s, station: pointAt(route, s) };
  });
  const ranked = [...withS].sort((a, b) => a.s - b.s);
  return withS.map((d) => ({ ...d, order: ranked.indexOf(d) + 1 }));
};

/** How lit a stop is, from how far the walker has ACTUALLY got: 1 exactly when walked >= s. */
export const litAt = (stop: Stop, walked: number, ramp = 0.4) => clamp01((walked - stop.s + ramp) / ramp);

/** Keyed walk: [frame, metres] pairs, eased per leg so the walker settles at each key. */
export const walkAt = (keys: [number, number][], f: number) => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f1, s1] = keys[i];
    if (f < f1) {
      const [f0, s0] = keys[i - 1];
      return mix(s0, s1, EASE_INOUT(clamp01((f - f0) / Math.max(1e-4, f1 - f0))));
    }
  }
  return keys[keys.length - 1][1];
};

export const fmtM = (m: number) => `${m.toFixed(1)} m`;

const polyD = (v: View, pts: Pt[]) =>
  pts
    .map((p, i) => {
      const q = toPx(v, p);
      return `${i === 0 ? 'M' : 'L'}${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
    })
    .join(' ');

// A stage-coloured halo so lines pass BEHIND text instead of through it (short-27's lesson).
const halo = (w = 9): React.CSSProperties => ({
  stroke: ROUTE_COLORS.stage,
  strokeWidth: w,
  paintOrder: 'stroke',
  strokeLinejoin: 'round',
});

// =============================================================================
// THE PLAN — walls, rooms, furniture. Static; drawn once per frame from metres.
// =============================================================================
export const Floor: React.FC<{ v: View; w: number; h: number }> = ({ v, w, h }) => {
  const a = toPx(v, P(0, 0));
  return <rect x={a.x} y={a.y} width={w * v.k} height={h * v.k} fill={ROUTE_COLORS.floor} />;
};

export const Walls: React.FC<{ v: View; segs: [Pt, Pt][]; opacity?: number }> = ({ v, segs, opacity = 0.62 }) => (
  <g opacity={opacity}>
    {segs.map(([a, b], i) => {
      const p = toPx(v, a);
      const q = toPx(v, b);
      return <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={ROUTE_COLORS.wall} strokeWidth={9} strokeLinecap="square" />;
    })}
  </g>
);

export const Furniture: React.FC<{
  v: View;
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  r?: number;
}> = ({ v, x, y, w, h, label, r = 8 }) => {
  const a = toPx(v, P(x, y));
  return (
    <g>
      <rect x={a.x} y={a.y} width={w * v.k} height={h * v.k} rx={r} fill={ROUTE_COLORS.furn} stroke={ROUTE_COLORS.furnEdge} strokeWidth={2} />
      {label ? (
        <text
          x={a.x + (w * v.k) / 2}
          y={a.y + (h * v.k) / 2 + 8}
          textAnchor="middle"
          style={{ fontFamily: FONT_MONO, fontSize: 21, letterSpacing: 3, fill: ROUTE_COLORS.dim }}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
};

/** A bed seen from above: frame, pillow band, folded duvet line. */
export const Bed: React.FC<{ v: View; x: number; y: number; w: number; h: number }> = ({ v, x, y, w, h }) => {
  const a = toPx(v, P(x, y));
  const W = w * v.k;
  const H = h * v.k;
  return (
    <g>
      <rect x={a.x} y={a.y} width={W} height={H} rx={12} fill="rgba(255,255,255,0.05)" stroke={ROUTE_COLORS.furnEdge} strokeWidth={2} />
      <rect x={a.x + 12} y={a.y + 12} width={W / 2 - 18} height={H * 0.17} rx={10} fill="rgba(255,255,255,0.10)" />
      <rect x={a.x + W / 2 + 6} y={a.y + 12} width={W / 2 - 18} height={H * 0.17} rx={10} fill="rgba(255,255,255,0.10)" />
      <rect x={a.x + 6} y={a.y + H * 0.36} width={W - 12} height={H * 0.6} rx={10} fill="rgba(155,124,196,0.10)" />
    </g>
  );
};

export const RoomLabel: React.FC<{ v: View; at: Pt; text: string; anchor?: 'start' | 'middle' | 'end' }> = ({
  v,
  at,
  text,
  anchor = 'middle',
}) => {
  const p = toPx(v, at);
  return (
    <text x={p.x} y={p.y} textAnchor={anchor} style={{ fontFamily: FONT_MONO, fontWeight: 500, fontSize: 22, letterSpacing: 5, fill: 'rgba(170,179,197,0.55)' }}>
      {text}
    </text>
  );
};

// =============================================================================
// THE ROUTE — drawn from the polyline, so the drawn line IS the metres counted.
// =============================================================================
export const RouteLine: React.FC<{
  v: View;
  pts: Pt[];
  to: number;
  color: string;
  glow?: number; // 0..1 extra bloom
  opacity?: number;
}> = ({ v, pts, to, color, glow = 0, opacity = 1 }) => {
  const seg = subpath(pts, 0, to);
  if (seg.length < 2 || opacity <= 0.001) return null;
  const d = polyD(v, seg);
  return (
    <g opacity={opacity}>
      <path d={d} fill="none" stroke={color} strokeOpacity={0.14 + 0.22 * glow} strokeWidth={34 + 22 * glow} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

/** The whole route, faint and dashed — where the walk WILL go. */
export const GhostRoute: React.FC<{ v: View; pts: Pt[]; opacity: number }> = ({ v, pts, opacity }) =>
  opacity <= 0.001 ? null : (
    <path d={polyD(v, pts)} fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth={4} strokeDasharray="4 14" strokeLinecap="round" opacity={opacity} />
  );

export const Walker: React.FC<{ v: View; at: Pt; label?: string; opacity?: number; labelOpacity?: number }> = ({
  v,
  at,
  label = 'YOU',
  opacity = 1,
  labelOpacity = 1,
}) => {
  const p = toPx(v, at);
  return (
    <g opacity={opacity}>
      <circle cx={p.x} cy={p.y} r={24} fill="none" stroke={ROUTE_COLORS.accent} strokeWidth={3} strokeOpacity={0.7} />
      <circle cx={p.x} cy={p.y} r={13} fill="#ffffff" />
      <text
        x={p.x}
        y={p.y - 36}
        textAnchor="middle"
        opacity={labelOpacity}
        style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 22, letterSpacing: 3, fill: ROUTE_COLORS.text, ...halo(8) }}
      >
        {label}
      </text>
    </g>
  );
};

/** A station on the route: numbered by its rank, filled once the walker has reached it. */
export const StopPin: React.FC<{
  v: View;
  stop: Stop;
  lit: number;
  opacity: number;
  dx: number;
  dy: number;
  anchor?: 'start' | 'middle' | 'end';
  pulse?: number;
}> = ({ v, stop, lit, opacity, dx, dy, anchor = 'start', pulse = 0 }) => {
  if (opacity <= 0.001) return null;
  const p = toPx(v, stop.station);
  const r = 21 * (1 + 0.12 * pulse);
  return (
    <g opacity={opacity}>
      {lit > 0.01 ? <circle cx={p.x} cy={p.y} r={r + 14} fill={stop.color} opacity={0.22 * lit} /> : null}
      <circle cx={p.x} cy={p.y} r={r} fill={ROUTE_COLORS.stage} stroke={stop.color} strokeWidth={4} />
      <circle cx={p.x} cy={p.y} r={r} fill={stop.color} opacity={lit} />
      <text x={p.x} y={p.y + 9} textAnchor="middle" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 25, fill: lit > 0.5 ? ROUTE_COLORS.stage : stop.color }}>
        {stop.order}
      </text>
      <g opacity={0.5 + 0.5 * lit}>
        <text x={p.x + dx} y={p.y + dy} textAnchor={anchor} style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 32, letterSpacing: 1.5, fill: stop.color, ...halo(10) }}>
          {stop.label}
        </text>
        <text x={p.x + dx} y={p.y + dy + 28} textAnchor={anchor} style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: 22, fill: ROUTE_COLORS.dim, ...halo(8) }}>
          {stop.sub}
        </text>
      </g>
    </g>
  );
};

/** Arm's reach around a point: what the hand can take without the body moving. */
export const ReachRing: React.FC<{ v: View; at: Pt; r: number; opacity: number; color: string }> = ({ v, at, r, opacity, color }) => {
  if (opacity <= 0.001) return null;
  const p = toPx(v, at);
  return (
    <g opacity={opacity}>
      <circle cx={p.x} cy={p.y} r={r * v.k} fill={color} fillOpacity={0.1} stroke={color} strokeWidth={3} strokeDasharray="10 8" />
    </g>
  );
};

// =============================================================================
// OBJECTS — small top-down glyphs, sized in pixels so they read at phone scale.
// =============================================================================
export const PhoneIcon: React.FC<{
  v: View;
  at: Pt;
  glow?: number; // 0..1 pink bloom: "built to keep you"
  ring?: number; // 0..1 alarm rings amplitude
  ringPhase?: number; // 0..1, fractional
  color?: string;
}> = ({ v, at, glow = 0, ring = 0, ringPhase = 0, color = ROUTE_COLORS.pink }) => {
  const p = toPx(v, at);
  const W = 32;
  const H = 54;
  return (
    <g>
      {ring > 0.01
        ? [0, 0.5].map((o) => {
            const t = (ringPhase + o) % 1;
            return <circle key={o} cx={p.x} cy={p.y} r={30 + 46 * t} fill="none" stroke={color} strokeWidth={4} opacity={ring * (1 - t) * 0.85} />;
          })
        : null}
      {glow > 0.01 ? <circle cx={p.x} cy={p.y} r={60} fill={color} opacity={0.28 * glow} /> : null}
      <rect x={p.x - W / 2} y={p.y - H / 2} width={W} height={H} rx={8} fill="#1b202b" stroke={color} strokeWidth={3.5} />
      <rect x={p.x - W / 2 + 5} y={p.y - H / 2 + 7} width={W - 10} height={H - 16} rx={3} fill={color} opacity={0.25 + 0.55 * glow} />
    </g>
  );
};

export const AlarmIcon: React.FC<{ v: View; at: Pt; opacity: number; color?: string }> = ({ v, at, opacity, color = ROUTE_COLORS.violet }) => {
  if (opacity <= 0.001) return null;
  const p = toPx(v, at);
  return (
    <g opacity={opacity}>
      <circle cx={p.x - 13} cy={p.y - 15} r={7} fill={color} />
      <circle cx={p.x + 13} cy={p.y - 15} r={7} fill={color} />
      <circle cx={p.x} cy={p.y} r={19} fill="#1b202b" stroke={color} strokeWidth={4} />
      <line x1={p.x} y1={p.y} x2={p.x} y2={p.y - 11} stroke={color} strokeWidth={3} strokeLinecap="round" />
      <line x1={p.x} y1={p.y} x2={p.x + 8} y2={p.y + 4} stroke={color} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
};

/** A window in a horizontal wall, with curtains that part as `open` rises and let light in. */
export const WindowLight: React.FC<{ v: View; a: Pt; b: Pt; open: number; depth: number; color?: string }> = ({
  v,
  a,
  b,
  open,
  depth,
  color = ROUTE_COLORS.accent,
}) => {
  const p = toPx(v, a);
  const q = toPx(v, b);
  const spread = 0.5 * v.k;
  const d = depth * v.k;
  const half = (q.x - p.x) / 2;
  const cw = half * (1 - 0.8 * open); // each curtain panel's width
  return (
    <g>
      <defs>
        <linearGradient id="win-light" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={0.4} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon
        points={`${p.x},${p.y} ${q.x},${q.y} ${q.x + spread},${q.y + d} ${p.x - spread},${p.y + d}`}
        fill="url(#win-light)"
        opacity={open}
      />
      <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={ROUTE_COLORS.glass} strokeWidth={9} />
      <rect x={p.x} y={p.y + 5} width={cw} height={14} rx={4} fill="#c9b8e6" opacity={0.9} />
      <rect x={q.x - cw} y={q.y + 5} width={cw} height={14} rx={4} fill="#c9b8e6" opacity={0.9} />
    </g>
  );
};

export const SinkIcon: React.FC<{ v: View; at: Pt; lit: number; color?: string }> = ({ v, at, lit, color = ROUTE_COLORS.teal }) => {
  const p = toPx(v, at);
  return (
    <g>
      <rect x={p.x - 30} y={p.y - 18} width={60} height={36} rx={12} fill="#1b202b" stroke={ROUTE_COLORS.furnEdge} strokeWidth={2} />
      <circle cx={p.x} cy={p.y} r={9} fill={color} opacity={0.3 + 0.7 * lit} />
    </g>
  );
};
