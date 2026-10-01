// =============================================================================
// lib/tape.tsx — THE SPLICE ENGINE (a strip of time you can cut the gaps out of)
//
// A span of time drawn as a strip, and a table of GAPS that interrupt it. One scalar — `cut` —
// removes those gaps, and everything after a gap slides back to meet it. That single transform
// has two opposite readings, and a video can use both:
//
//   COLLECT (cut + pack)    the removed time reappears as a solid block at the far end.
//                           The loss is conserved and countable: "this is how much is missing."
//   SPLICE  (cut + stretch) the removed time is gone and the strip refills the width.
//                           The loss is unobservable: "you would never know it was cut."
//
// EVERY number this kit prints is read back off the geometry it just drew. The block's width is
// `cut * totalLost * (w/span)`, the count is `gaps.length`, the magnifier's power is derived
// from the two pixel scales it sits between. Nothing is a literal chosen to look right — same
// ethos as prob.tsx's seeded trials, map.tsx's real Mercator, orbit.tsx's Verlet integrator,
// cycle.tsx's conserved particles, order.tsx's replayed swaps and budget.tsx's read-back hub.
//
// Reusable for anything shaped "a span of time, minus the parts that were not there": how much
// of a 90-minute match the ball is in play, the ads in a TV hour, red lights on a commute, a
// working day minus meetings, downtime in a year of uptime.
//
// UNITS: the tape's own clock, in whatever `span` is denominated in (seconds here). Pixels only
// ever appear inside a component; the model never sees them.
// =============================================================================
import React from 'react';
import { Easing } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const TAPE_COLORS = {
  stage: '#0b0e14',
  gap: '#04060a',
  rail: 'rgba(255,255,255,0.07)',
  edge: 'rgba(255,255,255,0.22)',
  dim: '#8b93a7',
  text: '#e8ecf5',
  accent: '#f5d76e',
  indigo: '#6366F1',
  violet: '#9b7cc4',
  teal: '#4db8a8',
  pink: '#e8879f',
} as const;

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const TAU = Math.PI * 2;
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

// =============================================================================
// THE MODEL — a span, and gaps that interrupt it.
// =============================================================================
export type Gap = { at: number; dur: number };

/** Deterministic LCG. Same seed, same schedule, every render. */
const lcg = (seed: number) => {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

/**
 * A jittered event schedule at a given RATE — the count is derived, never typed.
 *
 * `n = round(span/60 * ratePerMin)` events, one per equal slot, jittered inside its slot with a
 * margin so no two ever touch or reorder. The rate is the input; the number of marks on screen
 * is `schedule.length`, so a video that prints "15" is printing something it drew.
 */
export const gapSchedule = (seed: number, span: number, ratePerMin: number, dur: number): Gap[] => {
  const n = Math.max(1, Math.round((span / 60) * ratePerMin));
  const slot = span / n;
  const rnd = lcg(seed);
  // The margin is a fraction of the SLOT, not of `dur`: it has to be wide enough that the
  // shutter ramps around the first and last gap still fall inside the span, or a strip that
  // claims to loop opens on a half-closed lid. (short-13/14's wrap rule, applied at the model.)
  const margin = slot * 0.18;
  const room = Math.max(0, slot - dur - 2 * margin);
  const out: Gap[] = [];
  for (let i = 0; i < n; i++) out.push({ at: i * slot + margin + rnd() * room, dur });
  return out;
};

export const totalLost = (gaps: Gap[]) => gaps.reduce((a, g) => a + g.dur, 0);

/** Seconds of gap lying before `t` (a gap straddling `t` contributes only its head). */
export const lostBefore = (gaps: Gap[], t: number) =>
  gaps.reduce((a, g) => a + Math.max(0, Math.min(g.dur, t - g.at)), 0);

/** Gaps fully completed by `t` — the live counter during a recording sweep. */
export const countBefore = (gaps: Gap[], t: number) => gaps.filter((g) => g.at + g.dur <= t).length;

export type Seg = { a: number; b: number };

/** The KEPT runs between the gaps — the parts of the span that actually happened. */
export const segments = (gaps: Gap[], span: number): Seg[] => {
  const out: Seg[] = [];
  let cur = 0;
  for (const g of gaps) {
    if (g.at > cur) out.push({ a: cur, b: g.at });
    cur = Math.max(cur, g.at + g.dur);
  }
  if (cur < span) out.push({ a: cur, b: span });
  return out;
};

/** Where tape-time `t` ends up once `cut` of every preceding gap has been removed. */
export const spliceT = (gaps: Gap[], t: number, cut: number) => t - cut * lostBefore(gaps, t);

/**
 * The refill factor. At cut = 1 and stretch = 1 the surviving `span - totalLost` seconds are
 * scaled to occupy the FULL original width — which is exactly the perceptual claim a splice
 * makes: the strip is shorter, and nothing about looking at it says so.
 */
export const stretchK = (gaps: Gap[], span: number, cut: number, stretch: number) => {
  const kept = span - cut * totalLost(gaps);
  return kept <= 0 ? 1 : 1 + stretch * (span / kept - 1);
};

/**
 * Occlusion 0..1 at tape-time `t`: how covered the view is by the gap in progress.
 *
 * The GAP is the blackout — the part the tape draws and the part the arithmetic counts. The
 * ramps are the shutter MOVING, which is a longer event than the blackout it produces and is
 * asymmetric (closing runs about twice as fast as opening). A caller that draws a lid gets a
 * believable one for free, without the model ever conflating movement with loss.
 */
export const occlusionAt = (gaps: Gap[], t: number, down = 0.09, up = 0.17) => {
  let o = 0;
  for (const g of gaps) {
    if (t <= g.at - down || t >= g.at + g.dur + up) continue;
    const v =
      t < g.at
        ? smooth((t - (g.at - down)) / down)
        : t <= g.at + g.dur
          ? 1
          : 1 - smooth((t - (g.at + g.dur)) / up);
    o = Math.max(o, v);
  }
  return clamp01(o);
};

/** Whole-number magnification needed to bring `px` up to a readable `target`. Printed on screen. */
export const magFor = (px: number, target: number) => Math.max(1, Math.round(target / Math.max(px, 1e-6)));

// =============================================================================
// THE STRIP
// =============================================================================
export type TapeProps = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  span: number;
  gaps: Gap[];
  /** Recording playhead, in span units. Nothing past it is drawn. */
  upto?: number;
  /** 0..1 — how much of every gap has been removed. */
  cut?: number;
  /** 0..1 — opacity of the collected block. Its WIDTH is always the removed time. */
  pack?: number;
  /** 0..1 — refill the width the cut freed. */
  stretch?: number;
  opacity?: number;
  blockLabel?: string;
  blockColor?: string;
  showHead?: boolean;
  /** How brightly the surviving picture reads. */
  glow?: number;
};

export const Tape: React.FC<TapeProps> = ({
  id,
  x,
  y,
  w,
  h,
  span,
  gaps,
  upto = span,
  cut = 0,
  pack = 0,
  stretch = 0,
  opacity = 1,
  blockLabel,
  blockColor = TAPE_COLORS.accent,
  showHead = false,
  glow = 1,
}) => {
  if (opacity <= 0.005) return null;
  const k = stretchK(gaps, span, cut, stretch);
  const scale = (w / span) * k;
  const px = (t: number) => x + spliceT(gaps, Math.min(t, upto), cut) * scale;
  const blockW = cut * totalLost(gaps) * (w / span);
  const blockX = px(span);
  const head = px(upto);

  return (
    <g opacity={opacity}>
      <defs>
        <linearGradient id={id + '-sig'} gradientUnits="userSpaceOnUse" x1={x} y1={0} x2={x + w} y2={0}>
          <stop offset="0" stopColor={TAPE_COLORS.teal} />
          <stop offset="0.5" stopColor={TAPE_COLORS.indigo} />
          <stop offset="1" stopColor={TAPE_COLORS.violet} />
        </linearGradient>
        <clipPath id={id + '-clip'}>
          <rect x={x} y={y} width={w} height={h} rx={10} />
        </clipPath>
      </defs>

      {/* the empty rail — the span exists whether or not it has been recorded yet */}
      <rect x={x} y={y} width={w} height={h} rx={10} fill={TAPE_COLORS.rail} stroke={TAPE_COLORS.edge} strokeWidth={2} />

      <g clipPath={'url(#' + id + '-clip)'}>
        {/* the picture that actually reached you */}
        {segments(gaps, span)
          .filter((s) => s.a < upto)
          .map((s, i) => {
            const a = px(s.a);
            const b = px(Math.min(s.b, upto));
            return b - a <= 0.05 ? null : (
              <rect
                key={'s' + i}
                x={a}
                y={y}
                width={b - a}
                height={h}
                fill={'url(#' + id + '-sig)'}
                opacity={0.55 + 0.45 * glow}
              />
            );
          })}

        {/* the gaps, in place, shrinking to nothing as `cut` removes them */}
        {gaps
          .filter((g) => g.at < upto)
          .map((g, i) => {
            const a = px(g.at);
            const b = px(Math.min(g.at + g.dur, upto));
            return b - a <= 0.02 ? null : (
              <rect key={'g' + i} x={a} y={y} width={Math.max(b - a, 0.7)} height={h} fill={TAPE_COLORS.gap} />
            );
          })}

        {/* the collected block: the removed time, conserved. Its width is never a keyframe. */}
        {blockW > 0.5 ? (
          <g opacity={pack}>
            <rect x={blockX} y={y} width={blockW} height={h} fill={TAPE_COLORS.gap} />
            <rect x={blockX} y={y} width={blockW} height={h} fill="none" stroke={blockColor} strokeWidth={3} />
          </g>
        ) : null}
      </g>

      {showHead ? (
        <g>
          <line x1={head} y1={y - 14} x2={head} y2={y + h + 14} stroke={TAPE_COLORS.accent} strokeWidth={3} />
          <circle cx={head} cy={y - 18} r={7} fill={TAPE_COLORS.accent} />
        </g>
      ) : null}

      {/* The block is a sliver of the strip, so its label cannot sit over it — it is anchored to
          the strip's right edge instead, with a leader down to whatever width the block has. */}
      {blockLabel && pack > 0.02 && blockW > 0.5 ? (
        <g opacity={pack}>
          <line x1={blockX + blockW / 2} y1={y + h + 4} x2={blockX + blockW / 2} y2={y + h + 20} stroke={blockColor} strokeWidth={2} />
          <text
            x={x + w}
            y={y + h + 54}
            textAnchor="end"
            fill={blockColor}
            fontFamily={FONT_DISPLAY}
            fontWeight={700}
            fontSize={50}
            letterSpacing={2}
          >
            {blockLabel}
          </text>
        </g>
      ) : null}
    </g>
  );
};

// =============================================================================
// THE LOUPE — an optical fix for a mark too small to read.
//
// When a gap is honestly a pixel and a half wide, the answer is never a log axis: that would
// distort the one proportion the strip exists to state. Magnify instead, and PRINT the power,
// derived from the two pixel scales rather than typed. (short-15's lesson, on a time axis.)
// =============================================================================
export const Loupe: React.FC<{
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  gaps: Gap[];
  centerT: number;
  windowT: number;
  /** the source strip's pixels-per-second, so the power is computed rather than asserted */
  srcScale: number;
  opacity?: number;
  label?: string;
  value?: string;
  /** the value a loupe reveals usually lands later than the loupe itself */
  valueOpacity?: number;
  color?: string;
}> = ({ id, x, y, w, h, gaps, centerT, windowT, srcScale, opacity = 1, label, value, valueOpacity = 1, color = TAPE_COLORS.accent }) => {
  if (opacity <= 0.005) return null;
  const scale = w / windowT;
  const t0 = centerT - windowT / 2;
  const px = (t: number) => x + (t - t0) * scale;
  const power = magFor(srcScale, scale);
  const inWin = gaps.filter((g) => g.at + g.dur > t0 && g.at < t0 + windowT);

  return (
    <g opacity={opacity}>
      <defs>
        <clipPath id={id + '-lclip'}>
          <rect x={x} y={y} width={w} height={h} rx={10} />
        </clipPath>
        <linearGradient id={id + '-lsig'} gradientUnits="userSpaceOnUse" x1={x} y1={0} x2={x + w} y2={0}>
          <stop offset="0" stopColor={TAPE_COLORS.teal} />
          <stop offset="0.5" stopColor={TAPE_COLORS.indigo} />
          <stop offset="1" stopColor={TAPE_COLORS.violet} />
        </linearGradient>
      </defs>

      <g clipPath={'url(#' + id + '-lclip)'}>
        <rect x={x} y={y} width={w} height={h} fill={'url(#' + id + '-lsig)'} opacity={0.92} />
        {inWin.map((g, i) => (
          <rect key={i} x={px(g.at)} y={y} width={g.dur * scale} height={h} fill={TAPE_COLORS.gap} />
        ))}
      </g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill="none" stroke={color} strokeWidth={3} />

      {/* the power, read off the two scales this box sits between */}
      <text x={x + 16} y={y + h + 42} fill={color} fontFamily={FONT_MONO} fontWeight={700} fontSize={34} letterSpacing={1}>
        {'x' + power}
      </text>
      {label ? (
        <text
          x={x + w - 16}
          y={y + h + 42}
          textAnchor="end"
          fill={TAPE_COLORS.dim}
          fontFamily={FONT_BODY}
          fontWeight={600}
          fontSize={28}
          letterSpacing={4}
        >
          {label.toUpperCase()}
        </text>
      ) : null}
      {value ? (
        <text
          x={x + w / 2}
          y={y - 24}
          opacity={valueOpacity}
          textAnchor="middle"
          fill={color}
          fontFamily={FONT_DISPLAY}
          fontWeight={700}
          fontSize={52}
          letterSpacing={2}
        >
          {value}
        </text>
      ) : null}
    </g>
  );
};

/** Leader lines from a slice of a source strip into a loupe box. */
export const Leaders: React.FC<{
  fromX1: number;
  fromX2: number;
  fromY: number;
  toX1: number;
  toX2: number;
  toY: number;
  opacity?: number;
  color?: string;
}> = ({ fromX1, fromX2, fromY, toX1, toX2, toY, opacity = 1, color = TAPE_COLORS.accent }) =>
  opacity <= 0.005 ? null : (
    <g opacity={opacity * 0.55} stroke={color} strokeWidth={2} strokeDasharray="6 7" fill="none">
      <line x1={fromX1} y1={fromY} x2={toX1} y2={toY} />
      <line x1={fromX2} y1={fromY} x2={toX2} y2={toY} />
    </g>
  );

// =============================================================================
// LABELS — a strip's own caption row, so a shot never hand-places one.
// =============================================================================
export const TapeLabel: React.FC<{
  x: number;
  y: number;
  w: number;
  left: string;
  right?: string;
  color?: string;
  opacity?: number;
  /** the right-hand value often arrives later than the row it lives in */
  rightOpacity?: number;
  size?: number;
}> = ({ x, y, w, left, right, color = TAPE_COLORS.dim, opacity = 1, rightOpacity = 1, size = 30 }) =>
  opacity <= 0.005 ? null : (
    <g opacity={opacity}>
      <text x={x} y={y} fill={color} fontFamily={FONT_BODY} fontWeight={600} fontSize={size} letterSpacing={5}>
        {left.toUpperCase()}
      </text>
      {right ? (
        <text
          x={x + w}
          y={y}
          opacity={rightOpacity}
          textAnchor="end"
          fill={TAPE_COLORS.text}
          fontFamily={FONT_MONO}
          fontWeight={700}
          fontSize={size + 6}
          letterSpacing={1}
        >
          {right}
        </text>
      ) : null}
    </g>
  );

/** A note centred under a strip — the one place a claim about the strip is allowed to sit. */
export const TapeNote: React.FC<{
  x: number;
  y: number;
  w: number;
  text: string;
  color?: string;
  opacity?: number;
  size?: number;
}> = ({ x, y, w, text, color = TAPE_COLORS.accent, opacity = 1, size = 34 }) =>
  opacity <= 0.005 ? null : (
    <text
      x={x + w / 2}
      y={y}
      textAnchor="middle"
      opacity={opacity}
      fill={color}
      fontFamily={FONT_BODY}
      fontWeight={600}
      fontSize={size}
      letterSpacing={3}
    >
      {text}
    </text>
  );
