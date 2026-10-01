// =============================================================================
// Wander kit — a THOUGHT NETWORK inside a head. First used by short-46 ("Why You Suddenly Get
// Ideas in the Shower").
//
// The engine: nodes are packed in HEAD space (the page.tsx Head viewBox, cranium centre 300,290)
// once at module load, then projected to the screen through a head pose each frame — so the
// network moves, shrinks and returns with the head, never drawn twice. A shot drives it with
// per-edge / per-node values (draw, glow) that it derives from ONE set of cues, and counts its
// tallies from the same values.
//
// Also: ShowerRain (streaks PERIODIC in the composition length, so a looped short wraps with no
// jump), Spotlight (focus vignette), SparkBadge (the idea moment) and Dial (a 3-zone slider).
// =============================================================================
import React from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import { HEAD_CRANIUM } from './page';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export const WD = {
  ink: '#0f1216',
  node: '#5b6472',
  edge: 'rgba(255,255,255,0.13)',
  indigo: '#6366F1',
  teal: '#4db8a8',
  water: '#9fd3ff',
  yellow: '#f5d76e',
  pink: '#e8879f',
  muted: '#8b949e',
} as const;

// deterministic pseudo-random in [0,1) — Math.random is banned in compositions
export const hash = (i: number, salt = 0) => {
  const s = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export const hexMix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `#${x.map((v, k) => Math.round(mix(v, y[k], clamp01(t))).toString(16).padStart(2, '0')).join('')}`;
};

// =============================================================================
// THE NETWORK — built once, in head space.
// =============================================================================
export type Pt = { x: number; y: number };
export type NetNode = Pt & { i: number };

// sunflower packing inside an ellipse + a little jitter so it reads organic, not tiled
export const packNodes = (n: number, c: Pt, rx: number, ry: number, jitter = 14): NetNode[] =>
  Array.from({ length: n }, (_, i) => {
    const r = Math.sqrt((i + 0.5) / n);
    const a = i * 2.39996;
    return {
      i,
      x: c.x + Math.cos(a) * r * rx + (hash(i, 11) - 0.5) * 2 * jitter,
      y: c.y + Math.sin(a) * r * ry + (hash(i, 12) - 0.5) * 2 * jitter,
    };
  });

export const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
export const nearest = (nodes: NetNode[], p: Pt, skip: number[] = []) =>
  nodes.filter((n) => !skip.includes(n.i)).reduce((best, n) => (dist(n, p) < dist(best, p) ? n : best));

// k-nearest-neighbour edges, de-duplicated — the "resting" wiring of the network
export const knnEdges = (nodes: NetNode[], k: number): [number, number][] => {
  const seen = new Set<string>();
  const out: [number, number][] = [];
  nodes.forEach((a) => {
    [...nodes]
      .filter((b) => b.i !== a.i)
      .sort((p, q) => dist(a, p) - dist(a, q))
      .slice(0, k)
      .forEach((b) => {
        const id = a.i < b.i ? `${a.i}-${b.i}` : `${b.i}-${a.i}`;
        if (!seen.has(id)) {
          seen.add(id);
          out.push([Math.min(a.i, b.i), Math.max(a.i, b.i)]);
        }
      });
  });
  return out;
};

// head pose → screen. (cx, cy) is where the cranium centre lands, s scales.
export type Pose = { cx: number; cy: number; s: number };
export const toScreen = (p: Pt, pose: Pose): Pt => ({ x: pose.cx + (p.x - HEAD_CRANIUM.x) * pose.s, y: pose.cy + (p.y - HEAD_CRANIUM.y) * pose.s });
export const lerpPose = (a: Pose, b: Pose, t: number): Pose => ({ cx: mix(a.cx, b.cx, t), cy: mix(a.cy, b.cy, t), s: mix(a.s, b.s, t) });

// a point along a polyline at u in [0,1] (by segment count — hops are equal-time)
export const alongPath = (pts: Pt[], u: number): Pt => {
  const n = pts.length - 1;
  const k = Math.min(n - 1, Math.floor(clamp01(u) * n));
  const t = clamp01(u) * n - k;
  return { x: mix(pts[k].x, pts[k + 1].x, t), y: mix(pts[k].y, pts[k + 1].y, t) };
};

// =============================================================================
// DRAWING — one SVG, screen space. The shot passes plain values; this only draws.
// =============================================================================
export type EdgeDraw = { a: Pt; b: Pt; color: string; width: number; opacity: number; draw?: number; bend?: number; glow?: number };
export type NodeDraw = Pt & { r: number; color: string; glow?: number; ring?: string; opacity?: number };
export type PulseDraw = Pt & { color: string; r: number; opacity: number };

const edgePath = (e: EdgeDraw) => {
  if (!e.bend) return `M ${e.a.x} ${e.a.y} L ${e.b.x} ${e.b.y}`;
  const mx = (e.a.x + e.b.x) / 2;
  const my = (e.a.y + e.b.y) / 2;
  const dx = e.b.x - e.a.x;
  const dy = e.b.y - e.a.y;
  const L = Math.hypot(dx, dy) || 1;
  // control point off the normal — positive bend arcs to the left of a→b
  return `M ${e.a.x} ${e.a.y} Q ${mx + (dy / L) * e.bend} ${my - (dx / L) * e.bend} ${e.b.x} ${e.b.y}`;
};
export const bendMid = (a: Pt, b: Pt, bend: number): Pt => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const L = Math.hypot(dx, dy) || 1;
  // a quadratic's midpoint sits halfway to its control point
  return { x: (a.x + b.x) / 2 + (dy / L) * bend * 0.5, y: (a.y + b.y) / 2 - (dx / L) * bend * 0.5 };
};

export const NetLayer: React.FC<{ edges: EdgeDraw[]; nodes: NodeDraw[]; pulses?: PulseDraw[] }> = ({ edges, nodes, pulses = [] }) => (
  <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1080} height={1920}>
    {edges.map((e, k) =>
      e.opacity > 0.01 && (e.draw ?? 1) > 0.001 ? (
        <path
          key={`e${k}`}
          d={edgePath(e)}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - clamp01(e.draw ?? 1)}
          fill="none"
          stroke={e.color}
          strokeWidth={e.width}
          strokeLinecap="round"
          opacity={e.opacity}
          style={e.glow ? { filter: `drop-shadow(0 0 ${10 * e.glow}px ${e.color})` } : undefined}
        />
      ) : null,
    )}
    {nodes.map((n, k) => (
      <g key={`n${k}`} opacity={n.opacity ?? 1}>
        {n.glow && n.glow > 0.01 ? <circle cx={n.x} cy={n.y} r={n.r * (1.8 + 1.4 * n.glow)} fill={n.color} opacity={0.22 * n.glow} /> : null}
        <circle cx={n.x} cy={n.y} r={n.r} fill={n.color} />
        {n.ring ? <circle cx={n.x} cy={n.y} r={n.r + 7} fill="none" stroke={n.ring} strokeWidth={3.5} /> : null}
      </g>
    ))}
    {pulses.map((p, k) =>
      p.opacity > 0.01 ? (
        <g key={`p${k}`} opacity={p.opacity}>
          <circle cx={p.x} cy={p.y} r={p.r * 2.6} fill={p.color} opacity={0.25} />
          <circle cx={p.x} cy={p.y} r={p.r} fill="#ffffff" stroke={p.color} strokeWidth={4} />
        </g>
      ) : null,
    )}
  </svg>
);

// a memory label next to its node
export const NodeLabel: React.FC<{ at: Pt; text: string; size: number; color?: string; pill?: string; opacity?: number; dy?: number }> = ({
  at,
  text,
  size,
  color = 'rgba(255,255,255,0.78)',
  pill,
  opacity = 1,
  dy = -1,
}) =>
  opacity <= 0.01 ? null : (
    <div
      style={{
        position: 'absolute',
        left: at.x,
        top: at.y + dy * size * 1.25,
        transform: 'translate(-50%, -50%)',
        opacity,
        whiteSpace: 'nowrap',
        fontFamily: pill ? FONT_MONO : FONT_BODY,
        fontWeight: pill ? 700 : 600,
        fontSize: size,
        letterSpacing: pill ? 2 : 0.5,
        color: pill ? WD.ink : color,
        background: pill,
        borderRadius: 999,
        padding: pill ? `${size * 0.22}px ${size * 0.6}px` : 0,
        textShadow: pill ? 'none' : '0 2px 10px rgba(0,0,0,0.8)',
      }}
    >
      {text}
    </div>
  );

// =============================================================================
// SHOWER RAIN — every streak's phase is (f * n / period), n an integer, so frame `period`
// equals frame 0 exactly: pass the composition length and the loop wraps seamlessly.
// =============================================================================
export const ShowerRain: React.FC<{ f: number; period: number; k: number; count?: number; top?: number; color?: string }> = ({
  f,
  period,
  k,
  count = 70,
  top = 0,
  color = WD.water,
}) => {
  if (k <= 0.01) return null;
  const H = 1920 - top + 200;
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0 }} width={1080} height={1920}>
      {Array.from({ length: count }, (_, i) => {
        const laps = Math.max(1, Math.round(period / (22 + 26 * hash(i, 1)))); // ~0.7–1.6s per fall
        const ph = (f * laps) / period + hash(i, 2);
        const u = ph - Math.floor(ph);
        const len = 70 + 90 * hash(i, 3);
        const x = 30 + 1020 * hash(i, 4) + u * 26; // a slight slant
        const y = top - 200 + u * H;
        // the streaks thin out with k from the top down — the water "stops" rather than blinks
        const vis = clamp01((k * 1.4 - hash(i, 5) * 0.4) * 1.0);
        return (
          <line
            key={i}
            x1={x}
            y1={y}
            x2={x - 8}
            y2={y - len}
            stroke={color}
            strokeWidth={2 + 2.5 * hash(i, 6)}
            strokeLinecap="round"
            opacity={(0.16 + 0.26 * hash(i, 7)) * vis}
          />
        );
      })}
    </svg>
  );
};

// =============================================================================
// SPOTLIGHT — everything outside a circle darkens; r shrinks = focus clamps down.
// =============================================================================
export const Spotlight: React.FC<{ at: Pt; r: number; k: number }> = ({ at, r, k }) =>
  k <= 0.01 ? null : (
    <AbsoluteFill
      style={{
        opacity: k,
        background: `radial-gradient(circle ${r}px at ${at.x}px ${at.y}px, rgba(99,102,241,0.10) 0%, rgba(99,102,241,0.06) 70%, rgba(6,8,12,0.82) 100%)`,
      }}
    />
  );

// =============================================================================
// SPARK BADGE — the idea moment: a burst of rays + a label pill.
// =============================================================================
export const SparkBadge: React.FC<{ at: Pt; k: number; burst?: number; text?: string; scale?: number; color?: string }> = ({
  at,
  k,
  burst = 0,
  text = 'IDEA',
  scale = 1,
  color = WD.yellow,
}) => {
  if (k <= 0.01) return null;
  const s = scale * (0.85 + 0.15 * EASE_OUT(k));
  return (
    <div style={{ position: 'absolute', left: at.x, top: at.y, opacity: k, transform: `translate(-50%, -50%) scale(${s})` }}>
      <svg style={{ position: 'absolute', left: -120, top: -120, overflow: 'visible' }} width={240} height={240}>
        <circle cx={120} cy={120} r={46} fill={color} opacity={0.22} />
        {Array.from({ length: 10 }, (_, j) => {
          const a = (j / 10) * Math.PI * 2;
          const r0 = 52 + 20 * burst;
          const r1 = r0 + 26 + 30 * burst;
          return (
            <line key={j} x1={120 + Math.cos(a) * r0} y1={120 + Math.sin(a) * r0} x2={120 + Math.cos(a) * r1} y2={120 + Math.sin(a) * r1}
              stroke={color} strokeWidth={7} strokeLinecap="round" opacity={0.9 - 0.5 * burst} />
          );
        })}
      </svg>
      <div
        style={{
          position: 'relative',
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 44,
          letterSpacing: 5,
          color: WD.ink,
          background: color,
          borderRadius: 999,
          padding: '8px 30px',
          boxShadow: `0 0 50px ${color}99`,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
    </div>
  );
};

// =============================================================================
// DIAL — a track in N labelled zones and a needle at u in [0,1].
// zoneLit[i] 0..1 glows a zone; zoneX[i] 0..1 strikes one out.
// =============================================================================
export type Zone = { label: string; sub: string; color: string };
export const Dial: React.FC<{
  x: number;
  y: number;
  w: number;
  title: string;
  zones: Zone[];
  u: number;
  zoneLit: number[];
  zoneX?: number[];
  opacity?: number;
  needle?: string;
}> = ({ x, y, w, title, zones, u, zoneLit, zoneX = [], opacity = 1, needle = '#ffffff' }) => {
  if (opacity <= 0.01) return null;
  const zw = w / zones.length;
  const TRACK_Y = 96;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: 250, opacity }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: WD.muted }}>
        {title}
      </div>
      {zones.map((z, i) => {
        const lit = clamp01(zoneLit[i] ?? 0);
        const xk = clamp01(zoneX[i] ?? 0);
        return (
          <div key={i} style={{ position: 'absolute', left: i * zw, top: 44, width: zw, textAlign: 'center' }}>
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: 30,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: hexMix('#9aa3ad', z.color, Math.max(lit, xk)),
                textDecoration: xk > 0.5 ? `line-through ${WD.pink} 4px` : 'none',
              }}
            >
              {z.label}
            </div>
            <div
              style={{
                position: 'absolute',
                left: 8,
                right: 8,
                top: TRACK_Y - 44 + 14,
                height: 22,
                borderRadius: 999,
                background: hexMix('#2a303a', z.color, 0.35 + 0.65 * lit),
                boxShadow: lit > 0.01 ? `0 0 ${36 * lit}px ${z.color}aa` : 'none',
              }}
            />
            <div style={{ position: 'absolute', left: 0, right: 0, top: TRACK_Y - 44 + 54, fontFamily: FONT_BODY, fontWeight: 500, fontSize: 23, color: `rgba(255,255,255,${0.5 + 0.4 * lit})` }}>
              {z.sub}
            </div>
          </div>
        );
      })}
      {/* needle */}
      <div
        style={{
          position: 'absolute',
          left: u * w - 16,
          top: TRACK_Y + 9, // track centre (44 + 66 + 11) minus the needle radius
          width: 32,
          height: 32,
          borderRadius: 999,
          background: needle,
          border: `5px solid ${WD.ink}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
        }}
      />
    </div>
  );
};
