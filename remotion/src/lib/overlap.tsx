// =============================================================================
// lib/overlap.tsx — THE INTERVAL-SET INTERSECTION ENGINE
//
// The subject is not an object, a quantity or a configuration: it is a SET OPERATION.
// Several people's days are drawn as strips of busy blocks; the free time of each is the
// COMPLEMENT of its blocks, and the time they share is the INTERSECTION of those complements.
//
// Nothing on screen is keyframed. `sharedOf` runs every frame against whatever blocks are
// currently DRAWN, so while a block slides the shared band grows continuously and correctly,
// and a mis-timed block shows a wrong number instead of hiding behind a hand-animated counter.
// Same ethos as montyTrials, the real Mercator, the Verlet integrator, cycle.tsx's conserved
// particles and kid.tsx's measured rail.
//
// Generic for a series: any "when are we all free" question is a new roster, not a new engine —
// remote teams across time zones, shift work, two parents and a childminder, opening hours.
// =============================================================================
import React from 'react';
import { Easing } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const OV = {
  stage: '#0b0e14',
  text: '#e8ecf5',
  dim: '#8b93a7',
  faint: 'rgba(232,236,245,0.42)',
  track: 'rgba(255,255,255,0.055)',
  trackEdge: 'rgba(255,255,255,0.15)',
  accent: '#4db8a8', // SHARED — the colour of everyone being free at once
  warn: '#f5d76e',
  pink: '#e8879f', // the culprit block
  indigo: '#6366F1',
  violet: '#9b7cc4',
  slate: '#42506b',
  ink: '#0b0e14',
} as const;

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// =============================================================================
// THE SET ALGEBRA — the whole argument of the video lives in these six functions.
// Times are MINUTES from the start of the drawn day.
// =============================================================================
export type Iv = { a: number; b: number };
export type Block = Iv & { id: string; label: string; color: string; textColor?: string };
export type Person = { id: string; label: string; sub: string; blocks: Block[] };

/** Sort + merge. Every other function assumes its input has been through here. */
export const norm = (ivs: Iv[]): Iv[] => {
  const src = ivs.filter((v) => v.b > v.a).slice().sort((p, q) => p.a - q.a);
  const out: Iv[] = [];
  for (const v of src) {
    const last = out[out.length - 1];
    if (last && v.a <= last.b) last.b = Math.max(last.b, v.b);
    else out.push({ a: v.a, b: v.b });
  }
  return out;
};

/** FREE = the complement of BUSY inside the day window. */
export const complement = (ivs: Iv[], lo: number, hi: number): Iv[] => {
  const out: Iv[] = [];
  let t = lo;
  for (const v of norm(ivs)) {
    const a = Math.max(v.a, lo);
    const b = Math.min(v.b, hi);
    if (b <= a) continue;
    if (a > t) out.push({ a: t, b: a });
    t = Math.max(t, b);
  }
  if (t < hi) out.push({ a: t, b: hi });
  return out;
};

export const intersect2 = (A: Iv[], B: Iv[]): Iv[] => {
  const X = norm(A);
  const Y = norm(B);
  const out: Iv[] = [];
  let i = 0;
  let j = 0;
  while (i < X.length && j < Y.length) {
    const a = Math.max(X[i].a, Y[j].a);
    const b = Math.min(X[i].b, Y[j].b);
    if (b > a) out.push({ a, b });
    if (X[i].b < Y[j].b) i++;
    else j++;
  }
  return out;
};

export const intersectAll = (sets: Iv[][]): Iv[] =>
  sets.length === 0 ? [] : sets.reduce((r, s) => intersect2(r, s));

export const totalMin = (ivs: Iv[]): number => ivs.reduce((s, v) => s + (v.b - v.a), 0);
export const freeOf = (p: { blocks: Block[] }, lo: number, hi: number): Iv[] => complement(p.blocks, lo, hi);
export const sharedOf = (ps: { blocks: Block[] }[], lo: number, hi: number): Iv[] =>
  intersectAll(ps.map((p) => freeOf(p, lo, hi)));

/** 135 -> "2:15". Rounds first so an animating value never prints a fractional minute. */
export const hm = (m: number): string => {
  const M = Math.max(0, Math.round(m));
  return `${Math.floor(M / 60)}:${String(M % 60).padStart(2, '0')}`;
};

/** minutes-into-the-day -> wall clock, given the day's start in minutes past midnight. */
export const clockAt = (m: number, dayStart: number): string => {
  const t = Math.round(dayStart + m);
  return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

// =============================================================================
// GEOMETRY — one x mapping shared by every strip, so a column IS vertical.
// =============================================================================
export type Scale = { x: number; w: number; lo: number; hi: number };
export const px = (s: Scale, m: number) => s.x + ((m - s.lo) / (s.hi - s.lo)) * s.w;
export const pw = (s: Scale, m: number) => (m / (s.hi - s.lo)) * s.w;

// =============================================================================
// DAY AXIS — hour ticks under the last strip.
// =============================================================================
export const DayAxis: React.FC<{
  s: Scale;
  y: number;
  dayStart: number;
  stepMin?: number;
  opacity?: number;
}> = ({ s, y, dayStart, stepMin = 120, opacity = 1 }) => {
  const ticks: number[] = [];
  for (let m = s.lo; m <= s.hi; m += stepMin) ticks.push(m);
  return (
    <g opacity={opacity}>
      <line x1={s.x} y1={y} x2={s.x + s.w} y2={y} stroke="rgba(255,255,255,0.14)" strokeWidth={2} />
      {ticks.map((m) => (
        <g key={m}>
          <line x1={px(s, m)} y1={y} x2={px(s, m)} y2={y + 10} stroke="rgba(255,255,255,0.24)" strokeWidth={2} />
          <text
            x={px(s, m)}
            y={y + 42}
            fill={OV.dim}
            fontFamily={FONT_MONO}
            fontSize={26}
            fontWeight={500}
            letterSpacing={1}
            textAnchor="middle"
          >
            {clockAt(m, dayStart)}
          </text>
        </g>
      ))}
    </g>
  );
};

// =============================================================================
// STRIP — one person's day. Busy blocks over an empty track; the empty track IS their free
// time, which is why the picture and the arithmetic cannot disagree.
// =============================================================================
export const Strip: React.FC<{
  person: Person;
  blocks: Block[]; // passed in already animated
  shared: Iv[]; // the intersection, drawn solid INSIDE this track
  s: Scale;
  y: number;
  h: number;
  freeMin: number;
  freeShown?: number; // 0..1 — how much of the free readout has counted up
  dim?: number; // 0..1, 1 = fully lit
  sharedOpacity?: number;
  pulse?: number; // 0..1 — this row is being counted into the house total right now
  ring?: string | null; // id of the block to ring as the culprit
  ringOp?: number;
}> = ({
  person,
  blocks,
  shared,
  s,
  y,
  h,
  freeMin,
  freeShown = 1,
  dim = 1,
  sharedOpacity = 1,
  pulse = 0,
  ring = null,
  ringOp = 0,
}) => (
  <g opacity={mix(0.24, 1, dim)}>
    {/* header */}
    <text x={s.x} y={y - 16} fill={OV.text} fontFamily={FONT_DISPLAY} fontSize={31} fontWeight={700} letterSpacing={3}>
      {person.label}
    </text>
    <text
      x={s.x + 22 + person.label.length * 21}
      y={y - 16}
      fill={OV.dim}
      fontFamily={FONT_BODY}
      fontSize={25}
      fontWeight={500}
      letterSpacing={2}
    >
      {person.sub}
    </text>
    <text
      x={s.x + s.w}
      y={y - 16}
      fill={OV.faint}
      fontFamily={FONT_MONO}
      fontSize={27}
      fontWeight={500}
      letterSpacing={1}
      textAnchor="end"
    >
      {hm(freeMin * clamp01(freeShown))} FREE
    </text>

    {/* the track — everything not covered by a block is free */}
    <rect x={s.x} y={y} width={s.w} height={h} rx={10} fill={OV.track} stroke={OV.trackEdge} strokeWidth={2} />
    {pulse > 0.01 ? (
      <rect
        x={s.x - 4}
        y={y - 4}
        width={s.w + 8}
        height={h + 8}
        rx={13}
        fill="none"
        stroke={OV.accent}
        strokeWidth={3}
        opacity={pulse}
      />
    ) : null}

    {/* the shared window, solid inside this person's own row */}
    {shared.map((v, i) => (
      <rect
        key={`sh${i}`}
        x={px(s, v.a)}
        y={y + 3}
        width={Math.max(0, pw(s, v.b - v.a))}
        height={h - 6}
        rx={7}
        fill={OV.accent}
        opacity={0.92 * sharedOpacity}
      />
    ))}

    {/* busy blocks */}
    {blocks.map((b) => {
      const w = Math.max(0, pw(s, b.b - b.a));
      return (
        <g key={b.id}>
          <rect x={px(s, b.a)} y={y + 3} width={w} height={h - 6} rx={7} fill={b.color} opacity={0.94} />
          {w > 150 ? (
            <text
              x={px(s, b.a) + w / 2}
              y={y + h / 2 + 9}
              fill={b.textColor ?? OV.ink}
              fontFamily={FONT_BODY}
              fontSize={25}
              fontWeight={700}
              letterSpacing={2.4}
              textAnchor="middle"
            >
              {b.label}
            </text>
          ) : null}
          {ring === b.id && ringOp > 0.01 ? (
            <rect
              x={px(s, b.a) - 5}
              y={y - 5}
              width={w + 10}
              height={h + 10}
              rx={13}
              fill="none"
              stroke={OV.pink}
              strokeWidth={5}
              opacity={ringOp}
            />
          ) : null}
        </g>
      );
    })}
  </g>
);

// =============================================================================
// SHARED WASH — the intersection as a column of light through every strip at once. This is
// the engine's signature: an intersection is a VERTICAL fact.
// =============================================================================
export const SharedWash: React.FC<{
  shared: Iv[];
  s: Scale;
  y0: number;
  y1: number;
  opacity?: number;
  color?: string;
}> = ({ shared, s, y0, y1, opacity = 1, color = OV.accent }) => (
  <g opacity={opacity}>
    {shared.map((v, i) => {
      const x = px(s, v.a);
      const w = Math.max(0, pw(s, v.b - v.a));
      return (
        <g key={`w${i}`}>
          <rect x={x} y={y0} width={w} height={y1 - y0} fill={color} opacity={0.13} />
          <line x1={x} y1={y0} x2={x} y2={y1} stroke={color} strokeWidth={2.5} opacity={0.7} />
          <line x1={x + w} y1={y0} x2={x + w} y2={y1} stroke={color} strokeWidth={2.5} opacity={0.7} />
        </g>
      );
    })}
  </g>
);

// =============================================================================
// MARKER — a caret + wall-clock label pointing at one shared window. A 15-minute window is
// twelve pixels wide, which is its honest width; the marker is how the eye finds it without
// the picture having to lie about its size.
// =============================================================================
export const Marker: React.FC<{
  iv: Iv;
  s: Scale;
  y: number;
  dayStart: number;
  text?: string;
  color?: string;
  opacity?: number;
}> = ({ iv, s, y, dayStart, text, color = OV.accent, opacity = 1 }) => {
  const cx = px(s, (iv.a + iv.b) / 2);
  return (
    <g opacity={opacity}>
      <polygon points={`${cx - 13},${y - 22} ${cx + 13},${y - 22} ${cx},${y - 2}`} fill={color} />
      <text
        x={cx}
        y={y - 34}
        fill={color}
        fontFamily={FONT_MONO}
        fontSize={27}
        fontWeight={700}
        letterSpacing={1}
        textAnchor="middle"
      >
        {text ?? `${clockAt(iv.a, dayStart)}-${clockAt(iv.b, dayStart)}`}
      </text>
    </g>
  );
};

// =============================================================================
// COLUMN TAG — a name at the head of a column. Used for the one block the video is about: a
// 120-minute block is 97px wide, too narrow to hold "TRAINING" at a legible size, so the name
// goes above the column that block casts and the column does the pointing.
// =============================================================================
export const ColumnTag: React.FC<{
  iv: Iv;
  s: Scale;
  y: number;
  text: string;
  color?: string;
  opacity?: number;
}> = ({ iv, s, y, text, color = OV.pink, opacity = 1 }) => (
  <text
    x={px(s, (iv.a + iv.b) / 2)}
    y={y}
    fill={color}
    fontFamily={FONT_BODY}
    fontSize={26}
    fontWeight={700}
    letterSpacing={3}
    textAnchor="middle"
    opacity={opacity}
  >
    {text}
  </text>
);

// =============================================================================
// READOUT — the shared total. Reads the drawn intersection, never a counter.
// =============================================================================
export const Readout: React.FC<{
  minutes: number;
  x: number;
  y: number;
  note: string;
  size?: number;
  noteSize?: number;
  color?: string;
  opacity?: number;
}> = ({ minutes, x, y, note, size = 128, noteSize = 26, color = OV.accent, opacity = 1 }) => (
  <g opacity={opacity}>
    <text x={x} y={y} fill={color} fontFamily={FONT_DISPLAY} fontSize={size} fontWeight={700} letterSpacing={-1}>
      {hm(minutes)}
    </text>
    <text x={x + 6} y={y + 42} fill={OV.dim} fontFamily={FONT_BODY} fontSize={noteSize} fontWeight={600} letterSpacing={3}>
      {note}
    </text>
  </g>
);

// =============================================================================
// PILL — a wide labelled fact bar (the house total, the twist's two findings).
// =============================================================================
export const Pill: React.FC<{
  text: string;
  x: number;
  y: number;
  w: number;
  color?: string;
  size?: number;
  opacity?: number;
}> = ({ text, x, y, w, color = OV.text, size = 30, opacity = 1 }) => (
  <g opacity={opacity}>
    <rect
      x={x}
      y={y}
      width={w}
      height={size * 2.05}
      rx={size}
      fill="rgba(12,16,24,0.82)"
      stroke={`${color}55`}
      strokeWidth={2}
    />
    <text
      x={x + w / 2}
      y={y + size * 1.32}
      fill={color}
      fontFamily={FONT_BODY}
      fontSize={size}
      fontWeight={600}
      letterSpacing={3}
      textAnchor="middle"
    >
      {text}
    </text>
  </g>
);

// =============================================================================
// SOURCE PLATE — the citation, on screen, in the beat that makes the claim.
// =============================================================================
export const SourcePlate: React.FC<{ lines: string[]; x: number; y: number; opacity?: number }> = ({
  lines,
  x,
  y,
  opacity = 1,
}) => (
  <g opacity={opacity}>
    {lines.map((l, i) => (
      <text
        key={i}
        x={x}
        y={y + i * 32}
        fill={i === 0 ? OV.faint : OV.dim}
        fontFamily={FONT_MONO}
        fontSize={23}
        fontWeight={500}
        letterSpacing={1.6}
        textAnchor="middle"
      >
        {l}
      </text>
    ))}
  </g>
);
