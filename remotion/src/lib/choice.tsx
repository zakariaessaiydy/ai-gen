// Choice lib — a two-option decision card and a COHORT of discrete agents partitioned
// between the options.
//
// Engine: `COHORT` agents with stable identities and fixed slots in each column. Nothing
// spawns and nothing despawns, so the population cannot change even if the choreography is
// wrong (cycle.tsx's conservation rule, applied to people). A contiguous BAND of agents
// migrates A -> B as a single scalar `cross` runs 0 -> 1, each agent on its own staggered
// ramp; run the same scalar 1 -> 0 and they walk back, because it is the same interpolation
// either way (vote.tsx's one-scalar-both-directions rule).
//
// Every number on screen is COUNTED off the positions actually rendered this frame:
// `countLeft()` is literally how many agents are left of the midline. The readout ticks
// because dots cross, never from a keyframe (order.tsx: animate the thing that produces
// the count).
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';
import { EASE_OUT, prog } from './shorts';

export const COHORT = 100;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Mix two #rrggbb colors. Inline rather than chroma-js — one less import to crash a render.
export const mixHex = (a: string, b: string, t: number): string => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [ar, ag, ab] = p(a);
  const [br, bg, bb] = p(b);
  const c = (x: number, y: number) => Math.round(lerp(x, y, clamp01(t))).toString(16).padStart(2, '0');
  return `#${c(ar, br)}${c(ag, bg)}${c(ab, bb)}`;
};

// =============================================================================
// GEOMETRY — where an agent sits when it is settled.
// =============================================================================
export type CohortGeom = {
  leftX: number;
  rightX: number;
  baseline: number; // stacks grow UP from here
  cell: number;
  cols: number;
};

export type Pt = { x: number; y: number };

// Slot `i` of a column: fills left-to-right, bottom-to-top.
export const slotPos = (g: CohortGeom, side: 'left' | 'right', i: number): Pt => {
  const row = Math.floor(i / g.cols);
  const col = i % g.cols;
  const cx = side === 'left' ? g.leftX : g.rightX;
  return {
    x: cx + (col - (g.cols - 1) / 2) * g.cell,
    y: g.baseline - row * g.cell,
  };
};

// Agent i's home in each column. A fills from index 0 up; B fills from the TOP index down,
// so agents already in B keep their slots when the band arrives — nobody shuffles.
export const homeA = (g: CohortGeom, i: number) => slotPos(g, 'left', i);
export const homeB = (g: CohortGeom, i: number) => slotPos(g, 'right', COHORT - 1 - i);

// =============================================================================
// THE MIGRATION — one scalar, both directions.
// =============================================================================
export type Band = { lo: number; hi: number }; // agents [lo, hi) migrate

// Agent i's "B-ness", 0..1. Agents outside the band are pinned by their index alone, so the
// rest states are exact at cross = 0 and cross = 1 (which is what makes the loop structural).
export const bness = (i: number, band: Band, cross: number, stagger = 0.5): number => {
  if (i < band.lo) return 0; // always option A
  if (i >= band.hi) return 1; // always option B
  const n = band.hi - band.lo;
  const k = n <= 1 ? 0 : (i - band.lo) / (n - 1);
  return clamp01((cross - k * stagger) / (1 - stagger));
};

// Where agent i actually is this frame. The arc lifts migrating agents off the stacks so
// twenty bodies crossing read as movement rather than a dissolve.
export const agentPos = (g: CohortGeom, i: number, band: Band, cross: number, stagger = 0.5): Pt => {
  const p = bness(i, band, cross, stagger);
  const a = homeA(g, i);
  const b = homeB(g, i);
  const e = EASE_OUT(p);
  const arc = Math.sin(Math.PI * p) * g.cell * 2.2;
  return { x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e) - arc };
};

// THE READOUT. Counted off the positions rendered this frame, not derived from `cross`.
export const countLeft = (g: CohortGeom, band: Band, cross: number, midX: number, stagger = 0.5): number => {
  let n = 0;
  for (let i = 0; i < COHORT; i++) if (agentPos(g, i, band, cross, stagger).x < midX) n++;
  return n;
};

// =============================================================================
// THE COHORT
// =============================================================================
export const Cohort: React.FC<{
  geom: CohortGeom;
  band: Band;
  cross: number;
  colorA: string;
  colorB: string;
  r?: number;
  stagger?: number;
}> = ({ geom, band, cross, colorA, colorB, r = 12, stagger = 0.5 }) => (
  <svg
    width={1080}
    height={1920}
    viewBox="0 0 1080 1920"
    style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
  >
    {[...Array(COHORT)].map((_, i) => {
      const p = bness(i, band, cross, stagger);
      const { x, y } = agentPos(geom, i, band, cross, stagger);
      const moving = p > 0.001 && p < 0.999;
      return (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={r * (moving ? 1.18 : 1)}
          fill={mixHex(colorA, colorB, p)}
          opacity={moving ? 1 : 0.9}
        />
      );
    })}
  </svg>
);

// Count + percentage under a column. `n` is the COUNTED value, passed in.
export const ColumnReadout: React.FC<{
  x: number;
  y: number;
  n: number;
  label: string;
  color: string;
  size?: number;
}> = ({ x, y, n, label, color, size = 40 }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: 'translate(-50%, 0)',
      textAlign: 'center',
      whiteSpace: 'nowrap',
    }}
  >
    <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: size, color, lineHeight: 1.1 }}>{n}%</div>
    <div
      style={{
        fontFamily: FONT_BODY,
        fontWeight: 600,
        fontSize: size * 0.48,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.6)',
        marginTop: 2,
      }}
    >
      {label}
    </div>
  </div>
);

// =============================================================================
// THE CHOICE CARD — option A, and option B with a bracket that starts EMPTY.
// =============================================================================
export const ChoiceCard: React.FC<{
  y: number;
  scale?: number;
  optionA: string;
  priceA?: string;
  optionB: string;
  fillWords: string[];
  fill: number; // 0..1 — how much of the bracket text is in. Runs backward to erase.
  colorA: string;
  colorB: string;
  pulse?: number; // 0..1 — attention on the empty bracket
}> = ({ y, scale = 1, optionA, priceA, optionB, fillWords, fill, colorA, colorB, pulse = 0 }) => {
  const n = fillWords.length;
  const empty = 1 - clamp01(fill * 3);
  const row = (letter: string, text: string, color: string, extra?: React.ReactNode, price?: string) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        background: 'rgba(12,14,20,0.82)',
        border: `2px solid ${color}55`,
        borderLeft: `10px solid ${color}`,
        borderRadius: 16,
        padding: '18px 24px',
        marginBottom: 14,
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 34,
          color,
          width: 44,
          flexShrink: 0,
        }}
      >
        {letter}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontWeight: 500,
            fontSize: 34,
            color: 'rgba(255,255,255,0.92)',
            lineHeight: 1.25,
          }}
        >
          {text}
        </div>
        {extra}
      </div>
      {price ? (
        <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 38, color, flexShrink: 0 }}>{price}</div>
      ) : null}
    </div>
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: 90,
        width: 900,
        top: y,
        transform: `scale(${scale})`,
        transformOrigin: '50% 0%',
      }}
    >
      {row('A', optionA, colorA, undefined, priceA)}
      {row(
        'B',
        optionB,
        colorB,
        <div
          style={{
            marginTop: 10,
            border: `2px dashed ${colorB}${empty > 0.5 ? 'cc' : '55'}`,
            borderRadius: 12,
            padding: '10px 14px',
            minHeight: 46,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 10,
            background: `${colorB}${empty > 0.5 ? '1a' : '0d'}`,
            boxShadow: pulse > 0.01 ? `0 0 ${18 * pulse}px ${colorB}${Math.round(pulse * 140).toString(16).padStart(2, '0')}` : 'none',
          }}
        >
          {fillWords.map((w, i) => {
            const o = clamp01(fill * n - i);
            return (
              <span
                key={i}
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  fontSize: 34,
                  color: colorB,
                  opacity: o,
                  transform: `translateY(${(1 - EASE_OUT(o)) * 10}px)`,
                  display: 'inline-block',
                }}
              >
                {w}
              </span>
            );
          })}
        </div>,
      )}
    </div>
  );
};

// =============================================================================
// EFFECT BAR — a value (or an honest RANGE) on a shared Cohen's-d axis.
// =============================================================================
export const EffectBar: React.FC<{
  x: number;
  y: number;
  w: number;
  label: string;
  sub?: string;
  lo?: number; // set lo+hi for a range bar; set `value` for a point
  hi?: number;
  value?: number;
  axisMax: number;
  color: string;
  at: number;
  dur?: number;
}> = ({ x, y, w, label, sub, lo, hi, value, axisMax, color, at, dur = 22 }) => {
  const frame = useCurrentFrame();
  const p = EASE_OUT(prog(frame, at, at + dur));
  const o = prog(frame, at - 4, at + 6);
  if (o <= 0.01) return null;
  const trackW = w - 210;
  const H = 46;
  const isRange = lo !== undefined && hi !== undefined;
  const a = isRange ? (lo as number) : 0;
  const b = isRange ? (hi as number) : (value as number);
  const px = (v: number) => (v / axisMax) * trackW;
  const left = px(a) * p;
  const width = Math.max(4, (px(b) - px(a)) * p);
  const text = isRange ? `d ${(lo as number).toFixed(2)}–${(hi as number).toFixed(2)}` : `d ${(value as number).toFixed(2)}`;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, opacity: o }}>
      <div
        style={{
          fontFamily: FONT_BODY,
          fontWeight: 600,
          fontSize: 26,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.78)',
        }}
      >
        {label}
      </div>
      {sub ? (
        <div style={{ fontFamily: FONT_BODY, fontWeight: 400, fontSize: 22, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
          {sub}
        </div>
      ) : null}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 10 }}>
        <div
          style={{
            position: 'relative',
            width: trackW,
            height: H,
            borderRadius: H / 2,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.14)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left,
              top: 0,
              bottom: 0,
              width,
              borderRadius: H / 2,
              background: color,
              opacity: isRange ? 0.55 : 1,
              border: isRange ? `2px solid ${color}` : 'none',
              boxShadow: `0 6px 24px ${color}44`,
            }}
          />
        </div>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontWeight: 700,
            fontSize: 30,
            color,
            whiteSpace: 'nowrap',
            minWidth: 170,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

// Small grey citation line — every plate in this series carries its source.
export const SourceNote: React.FC<{ y: number; text: string; at: number }> = ({ y, text, at }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        right: 70,
        top: y,
        textAlign: 'center',
        fontFamily: FONT_BODY,
        fontWeight: 400,
        fontSize: 24,
        lineHeight: 1.35,
        letterSpacing: 0.5,
        color: 'rgba(255,255,255,0.48)',
        opacity: prog(frame, at, at + 16),
      }}
    >
      {text}
    </div>
  );
};
