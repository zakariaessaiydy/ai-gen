// =============================================================================
// lib/cuts.tsx — THE CUT-DAY ENGINE
//
// A day drawn as ONE vertical column (time runs down, like a phone calendar), cut by
// interruptions. The subject is not how much time is used but how it is BROKEN: the same
// minutes of interruption, placed differently, leave completely different stretches behind.
//
// Nothing on screen is keyframed. Every frame the composition hands in where each cut is
// DRAWN; `clusters` merges cuts that sit close together into one "pull away", `stretches` is the
// complement of those clusters inside the day, and the readouts print what those return. A cut
// that slides visibly changes the numbers as it moves — a mis-timed cut shows a wrong number
// instead of hiding behind a hand-animated counter. Same ethos as overlap.tsx's live set algebra.
//
// Generic for a series: any "same load, different fragmentation" question is a new schedule,
// not a new engine — meetings scattered vs. stacked, a toddler's naps, errands batched into one
// trip, context switches between two projects.
// =============================================================================
import React from 'react';
import { Easing } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const CUT = {
  stage: '#0b0e14',
  text: '#e8ecf5',
  dim: '#8b93a7',
  faint: 'rgba(232,236,245,0.42)',
  track: 'rgba(255,255,255,0.045)',
  trackEdge: 'rgba(255,255,255,0.14)',
  piece: 'rgba(120,134,168,0.22)', // an ordinary stretch
  pieceEdge: 'rgba(160,172,200,0.30)',
  focus: '#4db8a8', // the longest stretch — the one the video is about
  ping: '#e8879f', // an interruption
  warn: '#f5d76e',
  indigo: '#6366F1',
  ink: '#0b0e14',
} as const;

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// =============================================================================
// THE ALGEBRA — times are MINUTES PAST MIDNIGHT.
// =============================================================================
export type Iv = { a: number; b: number };

/** Sort, then merge intervals whose gap is under `join` minutes: each result is ONE pull away. */
export const clusters = (ivs: Iv[], join: number): Iv[] => {
  const src = ivs.filter((v) => v.b > v.a).slice().sort((p, q) => p.a - q.a);
  const out: Iv[] = [];
  for (const v of src) {
    const last = out[out.length - 1];
    if (last && v.a - last.b < join) last.b = Math.max(last.b, v.b);
    else out.push({ a: v.a, b: v.b });
  }
  return out;
};

/** The stretches: the complement of the (already merged) clusters inside [lo, hi]. */
export const stretches = (busy: Iv[], lo: number, hi: number): Iv[] => {
  const out: Iv[] = [];
  let t = lo;
  for (const v of busy) {
    const a = Math.max(v.a, lo);
    const b = Math.min(v.b, hi);
    if (b <= a) continue;
    if (a > t) out.push({ a: t, b: a });
    t = Math.max(t, b);
  }
  if (t < hi) out.push({ a: t, b: hi });
  return out;
};

export const longest = (ivs: Iv[]): Iv | null =>
  ivs.reduce<Iv | null>((best, v) => (!best || v.b - v.a > best.b - best.a ? v : best), null);

export type Measure = { pulls: Iv[]; pieces: Iv[]; best: Iv | null; bestMin: number };
/** Everything the video states about a day, from the cuts that are currently counted. */
export const measure = (cuts: Iv[], lo: number, hi: number, join: number): Measure => {
  const pulls = clusters(cuts, join);
  const pieces = stretches(pulls, lo, hi);
  const best = longest(pieces);
  return { pulls, pieces, best, bestMin: best ? best.b - best.a : 0 };
};

/** 354 -> "5:54". Rounds first so a moving value never prints a fractional minute. */
export const hm = (m: number): string => {
  const M = Math.max(0, Math.round(m));
  return `${Math.floor(M / 60)}:${String(M % 60).padStart(2, '0')}`;
};
/** 540 -> "09:00" */
export const clock = (m: number): string => {
  const t = Math.round(m);
  return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

// =============================================================================
// GEOMETRY — one mapping from minutes to y.
// =============================================================================
export type Col = { x: number; w: number; y: number; h: number; lo: number; hi: number };
export const my = (c: Col, m: number) => c.y + ((m - c.lo) / (c.hi - c.lo)) * c.h;
export const mh = (c: Col, m: number) => (m / (c.hi - c.lo)) * c.h;

// =============================================================================
// DAY COLUMN — the track, its stretches, the longest one lit, and the cuts on top.
// =============================================================================
export type DrawnCut = { a: number; b: number; alpha: number; glow?: number };

export const DayColumn: React.FC<{
  c: Col;
  cuts: DrawnCut[];
  pieces: Iv[];
  best: Iv | null;
  bestOn?: number; // 0..1 how lit the longest stretch is
  ticks: number[]; // minutes past midnight
  minCutPx?: number;
}> = ({ c, cuts, pieces, best, bestOn = 1, ticks, minCutPx = 9 }) => (
  <g>
    {/* clock rail */}
    {ticks.map((m) => (
      <g key={`tk${m}`}>
        <line x1={c.x - 22} y1={my(c, m)} x2={c.x - 6} y2={my(c, m)} stroke="rgba(255,255,255,0.26)" strokeWidth={2} />
        <text
          x={c.x - 34}
          y={my(c, m) + 9}
          fill={CUT.dim}
          fontFamily={FONT_MONO}
          fontSize={26}
          fontWeight={500}
          textAnchor="end"
        >
          {clock(m)}
        </text>
      </g>
    ))}

    <rect x={c.x} y={c.y} width={c.w} height={c.h} rx={18} fill={CUT.track} stroke={CUT.trackEdge} strokeWidth={2} />

    {/* every stretch, inset, so the cuts read as gaps between pieces */}
    {pieces.map((p, i) => {
      const y0 = my(c, p.a) + 3;
      const h = Math.max(0, mh(c, p.b - p.a) - 6);
      const isBest = best !== null && p.a === best.a && p.b === best.b;
      return (
        <g key={`pc${i}`}>
          <rect x={c.x + 8} y={y0} width={c.w - 16} height={h} rx={Math.min(12, h / 2)} fill={CUT.piece} stroke={CUT.pieceEdge} strokeWidth={1.5} />
          {isBest && bestOn > 0.01 ? (
            <rect
              x={c.x + 8}
              y={y0}
              width={c.w - 16}
              height={h}
              rx={Math.min(12, h / 2)}
              fill={CUT.focus}
              fillOpacity={0.3 * bestOn}
              stroke={CUT.focus}
              strokeOpacity={bestOn}
              strokeWidth={4}
            />
          ) : null}
        </g>
      );
    })}

    {/* the cuts */}
    {cuts.map((k, i) => {
      if (k.alpha <= 0.005) return null;
      const h = Math.max(minCutPx, mh(c, k.b - k.a));
      const yc = my(c, (k.a + k.b) / 2);
      const glow = k.glow ?? 0;
      return (
        <g key={`ct${i}`} opacity={k.alpha}>
          {glow > 0.01 ? (
            <rect x={c.x - 10} y={yc - h / 2 - 8} width={c.w + 20} height={h + 16} rx={10} fill={CUT.ping} opacity={0.35 * glow} />
          ) : null}
          <rect x={c.x - 4} y={yc - h / 2} width={c.w + 8} height={h} rx={Math.min(5, h / 2)} fill={CUT.ping} />
        </g>
      );
    })}
  </g>
);

/** The longest stretch's length, printed inside it (or dropped when it is too short to hold it). */
export const StretchLabel: React.FC<{ c: Col; best: Iv | null; opacity?: number }> = ({ c, best, opacity = 1 }) => {
  if (!best || opacity <= 0.01) return null;
  const h = mh(c, best.b - best.a);
  const big = h > 120;
  const cy = my(c, (best.a + best.b) / 2);
  return (
    <g opacity={opacity}>
      <text
        x={c.x + c.w / 2}
        y={cy + (big ? 26 : 13)}
        fill={CUT.focus}
        fontFamily={FONT_DISPLAY}
        fontSize={big ? 92 : 40}
        fontWeight={700}
        textAnchor="middle"
        style={{ paintOrder: 'stroke' }}
        stroke={CUT.stage}
        strokeWidth={big ? 0 : 6}
      >
        {hm(best.b - best.a)}
      </text>
      {big ? (
        <text
          x={c.x + c.w / 2}
          y={cy + 72}
          fill={CUT.text}
          fontFamily={FONT_BODY}
          fontSize={24}
          fontWeight={600}
          letterSpacing={4}
          textAnchor="middle"
          opacity={0.8}
        >
          UNBROKEN
        </text>
      ) : null}
    </g>
  );
};

/** A tag beside the column at a clock time — batch labels. */
export const SideTag: React.FC<{ c: Col; m: number; text: string; color?: string; opacity?: number }> = ({
  c,
  m,
  text,
  color = CUT.ping,
  opacity = 1,
}) => (
  <g opacity={opacity}>
    <line x1={c.x + c.w + 8} y1={my(c, m)} x2={c.x + c.w + 26} y2={my(c, m)} stroke={color} strokeWidth={3} />
    <text x={c.x + c.w + 34} y={my(c, m) + 10} fill={color} fontFamily={FONT_MONO} fontSize={28} fontWeight={700}>
      {text}
    </text>
  </g>
);

// =============================================================================
// TALLY — two read-back numbers over the column.
// =============================================================================
export const Tally: React.FC<{
  y: number;
  cols: { label: string; value: string; color: string; pulse?: number }[];
  opacity?: number;
}> = ({ y, cols, opacity = 1 }) => {
  const w = 1080 / cols.length;
  return (
    <g opacity={opacity}>
      {cols.map((k, i) => {
        const cx = w * i + w / 2;
        return (
          <g key={k.label}>
            <text x={cx} y={y} fill={CUT.dim} fontFamily={FONT_BODY} fontSize={26} fontWeight={600} letterSpacing={4} textAnchor="middle">
              {k.label}
            </text>
            <text
              x={cx}
              y={y + 92}
              fill={k.color}
              fontFamily={FONT_DISPLAY}
              fontSize={88 * (1 + 0.05 * (k.pulse ?? 0))}
              fontWeight={700}
              textAnchor="middle"
            >
              {k.value}
            </text>
          </g>
        );
      })}
    </g>
  );
};

/** The citation, in the beat that makes the claim. */
export const SourcePlate: React.FC<{ lines: string[]; y: number; opacity?: number }> = ({ lines, y, opacity = 1 }) => (
  <g opacity={opacity}>
    {lines.map((l, i) => (
      <text
        key={i}
        x={540}
        y={y + i * 32}
        fill={i === 0 ? CUT.faint : CUT.dim}
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
