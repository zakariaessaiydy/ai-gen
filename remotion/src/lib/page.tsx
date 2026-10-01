// One-page planning kit — a sheet of paper, the "open loops" that land on it, and the head
// they come out of. First used by short-45 ("How to Organize Your Life in One Page").
//
// The engine: a loop CHIP has one geometry per stage (in the head, dumped, sorted into a box,
// promoted to NEXT or parked in LATER). A shot blends those geometries with per-chip progress,
// and every tally is COUNTED from the same progress values — nothing is keyframed twice.
import React from 'react';
import { Easing } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export const PG = {
  paper: '#fffef7',
  cream: '#f4f1ea',
  line: '#e2ddd2',
  ink: '#1a1a2e',
  muted: '#8a8898',
  neutral: '#c9c4b8',
  marker: 'rgba(245,215,110,0.62)',
  yellow: '#f5d76e',
  teal: '#4db8a8',
  pink: '#e8879f',
  indigo: '#6366F1',
} as const;

// deterministic pseudo-random in [0,1) — Math.random is banned in compositions
export const hash = (i: number, salt = 0) => {
  const s = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// =============================================================================
// GEOMETRY — a chip's pose. Center x/y, box w/h, font size, rotation (deg).
// =============================================================================
export type Geo = { x: number; y: number; w: number; h: number; fs: number; rot: number };
export const lerpGeo = (a: Geo, b: Geo, t: number): Geo => ({
  x: mix(a.x, b.x, t),
  y: mix(a.y, b.y, t),
  w: mix(a.w, b.w, t),
  h: mix(a.h, b.h, t),
  fs: mix(a.fs, b.fs, t),
  rot: mix(a.rot, b.rot, t),
});

// sunflower packing inside an ellipse — i-th of n seeds, radius rx × ry
export const seed = (i: number, n: number, rx: number, ry: number) => {
  const r = Math.sqrt((i + 0.5) / n);
  const a = i * 2.39996;
  return { x: Math.cos(a) * r * rx, y: Math.sin(a) * r * ry };
};

// =============================================================================
// PAPER — the one sheet everything lands on.
// =============================================================================
export const Paper: React.FC<{ x: number; y: number; w: number; h: number; opacity?: number; lift?: number; children?: React.ReactNode }> = ({
  x,
  y,
  w,
  h,
  opacity = 1,
  lift = 0,
  children,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y + lift,
      width: w,
      height: h,
      opacity,
      background: PG.paper,
      borderRadius: 18,
      boxShadow: '0 30px 90px rgba(0,0,0,0.45), 0 2px 0 rgba(255,255,255,0.6) inset',
      overflow: 'hidden',
    }}
  >
    {/* faint ruled lines — it reads as paper, not a card */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0 43px, rgba(99,102,241,0.07) 43px 44px)',
      }}
    />
    {children}
  </div>
);

// =============================================================================
// AREA BOX — a labelled region of the page. `lit` 0..1 colours label + border.
// =============================================================================
export const AreaBox: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  color: string;
  lit: number;
  opacity?: number;
}> = ({ x, y, w, h, label, color, lit, opacity = 1 }) => {
  if (opacity <= 0.01) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        opacity,
        borderRadius: 14,
        border: `2px ${lit > 0.5 ? 'solid' : 'dashed'} ${lit > 0.5 ? color + 'aa' : PG.line}`,
        background: `rgba(255,255,255,${0.5 * lit})`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 18,
          top: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: lit > 0.5 ? PG.ink : PG.muted,
          opacity: 0.45 + 0.55 * lit,
        }}
      >
        <div style={{ width: 14, height: 14, borderRadius: 7, background: lit > 0.5 ? color : PG.neutral }} />
        {label}
      </div>
    </div>
  );
};

// =============================================================================
// LOOP CHIP — one open loop. `tint` 0..1 fades the side bar from neutral to its area colour,
// `pick` 0..1 draws the NEXT treatment (marker sweep + checkbox), `ring` 0..1 pulses the box.
// =============================================================================
const hexMix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, k) => Math.round(mix(v, pb[k], t))).join(',')})`;
};

export const LoopChip: React.FC<{
  g: Geo;
  label: string;
  color: string;
  tint: number;
  pick?: number;
  ring?: number;
  opacity?: number;
  jx?: number;
  jy?: number;
}> = ({ g, label, color, tint, pick = 0, ring = 0, opacity = 1, jx = 0, jy = 0 }) => {
  if (opacity <= 0.01) return null;
  const bar = Math.max(3, g.h * 0.11);
  const box = g.h * 0.42;
  return (
    <div
      style={{
        position: 'absolute',
        left: g.x + jx - g.w / 2,
        top: g.y + jy - g.h / 2,
        width: g.w,
        height: g.h,
        opacity,
        transform: `rotate(${g.rot}deg)`,
        background: '#ffffff',
        borderRadius: Math.max(4, g.h * 0.2),
        border: `1.5px solid ${PG.line}`,
        boxShadow: '0 6px 18px rgba(26,26,46,0.16)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <div style={{ width: bar, alignSelf: 'stretch', background: hexMix(PG.neutral, color, tint), flexShrink: 0 }} />
      {pick > 0.01 ? (
        <div
          style={{
            width: box * pick,
            height: box,
            marginLeft: g.h * 0.24 * pick,
            borderRadius: box * 0.22,
            border: `${Math.max(1.5, g.h * 0.04)}px solid ${hexMix(PG.ink, PG.pink, ring)}`,
            boxShadow: ring > 0.01 ? `0 0 ${18 * ring}px ${PG.pink}` : undefined,
            flexShrink: 0,
            opacity: pick,
          }}
        />
      ) : null}
      <div style={{ position: 'relative', marginLeft: g.h * 0.2, flex: 1, minWidth: 0 }}>
        {/* marker sweep behind the words — the "circle one" treatment */}
        <div
          style={{
            position: 'absolute',
            left: -g.fs * 0.2,
            top: '12%',
            height: '76%',
            width: `${pick * 104}%`,
            background: PG.marker,
            borderRadius: g.fs * 0.2,
          }}
        />
        <div
          style={{
            position: 'relative',
            fontFamily: FONT_BODY,
            fontWeight: pick > 0.5 ? 600 : 500,
            fontSize: g.fs,
            color: PG.ink,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// HEAD — a right-facing profile. (cx, cy) is where the CRANIUM centre lands; `s` scales.
// `noise` 0..1 draws the "shouting" arcs; `calm` 0..1 turns the outline teal.
// =============================================================================
export const HEAD_CRANIUM = { x: 300, y: 290 };
const HEAD_PATH =
  'M 150 640 C 120 560 70 470 60 380 C 40 190 160 40 320 40 C 470 40 575 150 572 290 ' +
  'C 572 320 580 345 612 400 C 622 418 612 428 588 432 C 594 452 590 470 578 478 ' +
  'C 586 496 578 520 552 530 C 520 540 482 540 460 546 L 452 640 Z';

export const Head: React.FC<{ cx: number; cy: number; s: number; opacity?: number; noise?: number; calm?: number; t?: number }> = ({
  cx,
  cy,
  s,
  opacity = 1,
  noise = 0,
  calm = 0,
  t = 0,
}) => {
  if (opacity <= 0.01) return null;
  const stroke = hexMix('#8b949e', PG.teal, calm);
  return (
    <svg
      style={{ position: 'absolute', left: cx - HEAD_CRANIUM.x * s, top: cy - HEAD_CRANIUM.y * s, overflow: 'visible', opacity }}
      width={680 * s}
      height={660 * s}
      viewBox="0 0 680 660"
    >
      <path d={HEAD_PATH} fill={`rgba(255,255,255,${0.035 + 0.05 * calm})`} stroke={stroke} strokeWidth={6} strokeLinejoin="round" />
      {noise > 0.01
        ? [-150, -110, -70, 200, 240].map((deg, k) => {
            const a = (deg * Math.PI) / 180;
            const wob = 1 + 0.08 * Math.sin(t * 0.9 + k * 1.7);
            const r0 = 300 * wob;
            const r1 = r0 + 60 * noise;
            return (
              <line
                key={k}
                x1={HEAD_CRANIUM.x + Math.cos(a) * r0}
                y1={HEAD_CRANIUM.y + Math.sin(a) * r0}
                x2={HEAD_CRANIUM.x + Math.cos(a) * r1}
                y2={HEAD_CRANIUM.y + Math.sin(a) * r1}
                stroke={PG.pink}
                strokeWidth={10}
                strokeLinecap="round"
                opacity={noise}
              />
            );
          })
        : null}
    </svg>
  );
};

// =============================================================================
// TALLY — a counted readout on the dark stage.
// =============================================================================
export const Tally: React.FC<{
  x: number;
  y: number;
  w: number;
  label: string;
  value: string;
  color?: string;
  opacity?: number;
  pop?: number;
  glow?: number;
  padLeft?: number;
}> = ({ x, y, w, label, value, color = '#ffffff', opacity = 1, pop = 0, glow = 0, padLeft = 22 }) => {
  if (opacity <= 0.01) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: 128,
        opacity,
        transform: `scale(${1 + 0.06 * pop})`,
        background: 'rgba(12,14,20,0.88)',
        border: `2px solid ${color}${glow > 0.5 ? 'cc' : '44'}`,
        boxShadow: glow > 0.01 ? `0 0 ${40 * glow}px ${color}66` : '0 10px 40px rgba(0,0,0,0.4)',
        borderRadius: 20,
        paddingLeft: padLeft,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 21, letterSpacing: 3, color: 'rgba(255,255,255,0.62)', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 58, color, lineHeight: 1.1 }}>{value}</div>
    </div>
  );
};

// =============================================================================
// STEP PILLS — the method printed at the top of the page. `lit[i]` 0..1.
// =============================================================================
export const StepPills: React.FC<{ x: number; y: number; steps: string[]; lit: number[] }> = ({ x, y, steps, lit }) => (
  <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 12 }}>
    {steps.map((s, i) => {
      const on = clamp01(lit[i] ?? 0);
      return (
        <div
          key={i}
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: 2,
            textTransform: 'uppercase',
            padding: '8px 18px',
            borderRadius: 999,
            color: on > 0.5 ? PG.paper : PG.muted,
            background: hexMix(PG.cream, PG.ink, on),
            border: `1.5px solid ${on > 0.5 ? PG.ink : PG.line}`,
          }}
        >
          {`${i + 1} ${s}`}
        </div>
      );
    })}
  </div>
);
