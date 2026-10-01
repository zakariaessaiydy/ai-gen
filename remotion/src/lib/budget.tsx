// =============================================================================
// lib/budget.tsx — THE FINITE-TOTAL ALLOCATION ENGINE (a dial you cannot lie on)
//
// One fixed total (24 hours, 100%, a salary, a calorie budget) drawn as a ring, and a table of
// blocks that claim parts of it. EVERY number this kit prints is read back off the geometry it
// just drew: `spent()` sums the arcs actually rendered this frame and `remaining()` subtracts
// them from the total, so a mis-timed animation shows up as a WRONG NUMBER rather than hiding
// behind a keyframed counter that happens to look right.
//
// Same ethos as prob.tsx's seeded trials, map.tsx's real Mercator, orbit.tsx's Verlet
// integrator, cycle.tsx's conserved particles and order.tsx's replayed swaps: never assert what
// the code can compute.
//
// Reusable for anything with a "the total is fixed, so these compete" shape: where your day
// goes, where your salary goes, what is actually in a calorie, where a country's water goes,
// how a 40-hour week is really spent.
//
// GEOMETRY CONVENTION: angle 0 is at 12 o'clock and grows CLOCKWISE, in units of the total
// (not radians, not degrees) — `a = hours` on a 24-hour dial. Everything converts through
// `polar()`, so a ring with a different total needs no other change.
// =============================================================================
import React from 'react';
import { Easing } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const BUDGET_COLORS = {
  stage: '#0b0e14',
  track: 'rgba(255,255,255,0.13)',
  trackEdge: 'rgba(255,255,255,0.20)',
  dim: '#8b93a7',
  text: '#e8ecf5',
  accent: '#f5d76e', // captions / progress / hero number
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

// =============================================================================
// THE MODEL — a total, and blocks that claim parts of it.
// =============================================================================
export type Block = {
  id: string;
  label: string;
  units: number; // hours (or whatever the total is denominated in)
  color: string;
  note?: string;
};

/**
 * How much of the budget is actually DRAWN at this moment.
 *
 * `filled` is a single scalar in the total's own units — the pen position as it travels around
 * the ring. Every block is drawn from where the previous one ended up to `min(its end, filled)`,
 * so one number choreographs the whole dial and the hub can never disagree with the arcs.
 */
export const spent = (blocks: Block[], filled: number) =>
  Math.min(filled, blocks.reduce((a, b) => a + b.units, 0));

export const remaining = (total: number, blocks: Block[], filled: number) =>
  total - spent(blocks, filled);

/** Start/end offsets of each block along the ring, in the total's units. */
export const layout = (blocks: Block[]) => {
  let at = 0;
  return blocks.map((b) => {
    const seg = { block: b, from: at, to: at + b.units };
    at += b.units;
    return seg;
  });
};

// =============================================================================
// FORMATTING — one place, so the hub, the legend and the callouts agree by construction.
// =============================================================================
/** 6.3 -> "6h 18m" · 10 -> "10h" · 0.75 -> "45m". Rounded to the minute, never to the hour. */
export const fmtHM = (hours: number) => {
  const m = Math.max(0, Math.round(hours * 60));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r}m`;
  if (r === 0) return `${h}h`;
  return `${h}h ${r}m`;
};

// =============================================================================
// ARC GEOMETRY — 0 at 12 o'clock, clockwise, in units of `total`.
// =============================================================================
export const polar = (cx: number, cy: number, r: number, a: number, total: number) => {
  const th = (a / total) * TAU;
  return [cx + r * Math.sin(th), cy - r * Math.cos(th)] as const;
};

/**
 * A donut segment from `a0` to `a1` (units of `total`), between radii rIn and rOut.
 * Returns '' for a segment of no length so callers can render it unconditionally.
 */
export const donutPath = (
  cx: number,
  cy: number,
  rIn: number,
  rOut: number,
  a0: number,
  a1: number,
  total: number
) => {
  const span = a1 - a0;
  if (span <= 1e-6) return '';
  // A full ring cannot be one arc (start == end); pull the end back a hair and let the
  // stroke/fill close the seam. 1e-4 of the total is well under a rendered pixel.
  const b1 = span >= total ? a0 + total - 1e-4 : a1;
  const large = (b1 - a0) / total > 0.5 ? 1 : 0;
  const [x0o, y0o] = polar(cx, cy, rOut, a0, total);
  const [x1o, y1o] = polar(cx, cy, rOut, b1, total);
  const [x1i, y1i] = polar(cx, cy, rIn, b1, total);
  const [x0i, y0i] = polar(cx, cy, rIn, a0, total);
  return [
    `M ${x0o} ${y0o}`,
    `A ${rOut} ${rOut} 0 ${large} 1 ${x1o} ${y1o}`,
    `L ${x1i} ${y1i}`,
    `A ${rIn} ${rIn} 0 ${large} 0 ${x0i} ${y0i}`,
    'Z',
  ].join(' ');
};

/** Mid-angle of a segment, for hanging a label off it. */
export const midOf = (a0: number, a1: number) => (a0 + a1) / 2;

// =============================================================================
// THE RING
// =============================================================================
export type RingProps = {
  cx: number;
  cy: number;
  rIn: number;
  rOut: number;
  total: number;
  blocks: Block[];
  /** Pen position in the total's units: how much of the block table is drawn. */
  filled: number;
  /** 0..1 — how lit the un-spent remainder is. */
  glow?: number;
  glowColor?: string;
  /** Dim every block uniformly (used while the guidance arcs own the ring). */
  blockAlpha?: number;
  /** Seam between adjacent blocks, in the total's units — many small blocks read as separate claims. */
  gap?: number;
  /** Per-block alpha override (e.g. isolate one block); falls back to blockAlpha. */
  alphaOf?: (b: Block) => number;
};

export const Ring: React.FC<RingProps> = ({
  cx,
  cy,
  rIn,
  rOut,
  total,
  blocks,
  filled,
  glow = 0,
  glowColor = BUDGET_COLORS.indigo,
  blockAlpha = 1,
  gap = 0,
  alphaOf,
}) => {
  const segs = layout(blocks);
  const used = spent(blocks, filled);
  return (
    <g>
      {/* the empty budget — always visible, so the ring reads as a fixed total */}
      <circle cx={cx} cy={cy} r={(rIn + rOut) / 2} fill="none" stroke={BUDGET_COLORS.track} strokeWidth={rOut - rIn} />
      <circle cx={cx} cy={cy} r={rOut} fill="none" stroke={BUDGET_COLORS.trackEdge} strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={rIn} fill="none" stroke={BUDGET_COLORS.trackEdge} strokeWidth={1.5} />

      {/* the remainder, lit */}
      {glow > 0.005 && used < total && (
        <>
          <path
            d={donutPath(cx, cy, rIn, rOut, used, total, total)}
            fill={glowColor}
            opacity={0.34 * glow}
          />
          <path
            d={donutPath(cx, cy, rIn - 3, rOut + 3, used, total, total)}
            fill="none"
            stroke={glowColor}
            strokeWidth={3}
            opacity={0.85 * glow}
          />
        </>
      )}

      {/* the claims */}
      {segs.map((s) => {
        const a1 = Math.min(s.to - gap / 2, filled);
        const d = donutPath(cx, cy, rIn, rOut, s.from + gap / 2, a1, total);
        if (!d) return null;
        return (
          <g key={s.block.id} opacity={alphaOf ? alphaOf(s.block) : blockAlpha}>
            <path d={d} fill={s.block.color} opacity={0.9} />
            <path d={d} fill="none" stroke={s.block.color} strokeWidth={2} opacity={0.95} />
          </g>
        );
      })}
    </g>
  );
};

/** Hour ticks around the outside — what makes it read as a DAY and not a pie chart. */
export const Ticks: React.FC<{
  cx: number;
  cy: number;
  r: number;
  total: number;
  step?: number;
  major?: number;
  color?: string;
  opacity?: number;
}> = ({ cx, cy, r, total, step = 1, major = 6, color = BUDGET_COLORS.dim, opacity = 1 }) => {
  const ticks: React.ReactNode[] = [];
  for (let a = 0; a < total - 1e-6; a += step) {
    const big = Math.abs(a % major) < 1e-6;
    const len = big ? 20 : 10;
    const [x0, y0] = polar(cx, cy, r, a, total);
    const [x1, y1] = polar(cx, cy, r + len, a, total);
    ticks.push(
      <line
        key={a}
        x1={x0}
        y1={y0}
        x2={x1}
        y2={y1}
        stroke={color}
        strokeWidth={big ? 3 : 1.5}
        opacity={big ? 0.85 : 0.4}
      />
    );
  }
  return <g opacity={opacity}>{ticks}</g>;
};

// =============================================================================
// THE HUB — the derived number. It takes a VALUE, never a target: callers pass
// `remaining(total, blocks, filled)` so the digits are the arcs.
// =============================================================================
export const Hub: React.FC<{
  cx: number;
  cy: number;
  value: string;
  label?: string;
  sub?: string;
  color?: string;
  size?: number;
  opacity?: number;
}> = ({ cx, cy, value, label, sub, color = BUDGET_COLORS.text, size = 118, opacity = 1 }) => (
  <g opacity={opacity}>
    {label && (
      <text
        x={cx}
        y={cy - size * 0.62}
        textAnchor="middle"
        fill={BUDGET_COLORS.dim}
        fontFamily={FONT_BODY}
        fontSize={30}
        fontWeight={600}
        letterSpacing={4}
      >
        {label}
      </text>
    )}
    <text
      x={cx}
      y={cy + size * 0.34}
      textAnchor="middle"
      fill={color}
      fontFamily={FONT_DISPLAY}
      fontSize={size}
      fontWeight={700}
      letterSpacing={-2}
    >
      {value}
    </text>
    {sub && (
      <text
        x={cx}
        y={cy + size * 0.86}
        textAnchor="middle"
        fill={BUDGET_COLORS.dim}
        fontFamily={FONT_BODY}
        fontSize={27}
        fontWeight={500}
      >
        {sub}
      </text>
    )}
  </g>
);

// =============================================================================
// CALLOUT — a label hung off a segment on a leader line, so nothing needs
// hand-measured coordinates: give it the segment, it finds its own anchor.
// =============================================================================
export const Callout: React.FC<{
  cx: number;
  cy: number;
  r: number; // radius the leader starts at
  a: number; // angle, in units of total
  total: number;
  text: string;
  value?: string;
  color?: string;
  lead?: number; // how far out the leader runs
  opacity?: number;
  align?: 'auto' | 'start' | 'end' | 'middle';
  dy?: number;
}> = ({ cx, cy, r, a, total, text, value, color = BUDGET_COLORS.text, lead = 84, opacity = 1, align = 'auto', dy = 0 }) => {
  if (opacity <= 0.005) return null;
  const [x0, y0] = polar(cx, cy, r, a, total);
  const [x1, y1] = polar(cx, cy, r + lead, a, total);
  const right = Math.sin((a / total) * TAU) >= -0.02;
  const anchor = align === 'auto' ? (right ? 'start' : 'end') : align;
  const pad = anchor === 'middle' ? 0 : right ? 18 : -18;
  return (
    <g opacity={opacity}>
      <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={color} strokeWidth={2.5} opacity={0.75} />
      <circle cx={x0} cy={y0} r={6} fill={color} />
      <text
        x={x1 + pad}
        y={y1 + dy - (value ? 6 : 10)}
        textAnchor={anchor}
        fill={color}
        fontFamily={FONT_DISPLAY}
        fontSize={40}
        fontWeight={700}
        letterSpacing={1}
      >
        {text}
      </text>
      {value && (
        <text
          x={x1 + pad}
          y={y1 + dy + 38}
          textAnchor={anchor}
          fill={color}
          fontFamily={FONT_MONO}
          fontSize={40}
          fontWeight={700}
          opacity={0.92}
        >
          {value}
        </text>
      )}
    </g>
  );
};

// =============================================================================
// OVERLAY ARC — a second claim laid OVER the ring in the same units, so two
// quantities can be compared without a second chart. (Here: measured screen use
// against the remainder it has to fit inside.)
// =============================================================================
export const Overlay: React.FC<{
  cx: number;
  cy: number;
  rIn: number;
  rOut: number;
  total: number;
  from: number;
  to: number;
  color?: string;
  opacity?: number;
  hatch?: string; // id of a pattern to fill with instead of a flat colour
}> = ({ cx, cy, rIn, rOut, total, from, to, color = BUDGET_COLORS.pink, opacity = 1, hatch }) => {
  const d = donutPath(cx, cy, rIn, rOut, from, to, total);
  if (!d || opacity <= 0.005) return null;
  return (
    <g opacity={opacity}>
      <path d={d} fill={hatch ? `url(#${hatch})` : color} opacity={hatch ? 1 : 0.88} />
      <path d={d} fill="none" stroke={color} strokeWidth={3} />
    </g>
  );
};

/** Diagonal hatch pattern — an overlay reads as an overlay, not another block. */
export const Hatch: React.FC<{ id: string; color?: string }> = ({ id, color = BUDGET_COLORS.pink }) => (
  <defs>
    <pattern id={id} width={16} height={16} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width={16} height={16} fill={color} opacity={0.34} />
      <rect width={7} height={16} fill={color} opacity={0.95} />
    </pattern>
  </defs>
);

// =============================================================================
// GUIDANCE MARK — a published recommendation drawn in the SAME units as the
// budget, so "one hour" and "a whole day" are visibly the same kind of thing.
// A mark with `units: 0` is a tick, and one with `unknown` is a dashed arc of no
// stated length — which is the entire point of short-17.
// =============================================================================
export const GuidanceArc: React.FC<{
  cx: number;
  cy: number;
  rIn: number;
  rOut: number;
  total: number;
  units: number;
  unknown?: boolean;
  color?: string;
  opacity?: number;
  pulse?: number; // 0..1, for the unknown arc's breathing
  mark?: string; // glyph at the open end of an unknown arc; omit when a hub carries it
}> = ({ cx, cy, rIn, rOut, total, units, unknown = false, color = BUDGET_COLORS.teal, opacity = 1, pulse = 0, mark }) => {
  if (opacity <= 0.005) return null;
  const rMid = (rIn + rOut) / 2;
  if (unknown) {
    const span = mix(2.0, 3.4, pulse); // it has no length; it breathes to say so
    const [xe, ye] = polar(cx, cy, rMid, span, total);
    return (
      <g opacity={opacity}>
        <path
          d={donutPath(cx, cy, rIn, rOut, 0, span, total)}
          fill={color}
          opacity={0.13}
        />
        <path
          d={donutPath(cx, cy, rIn, rOut, 0, span, total)}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeDasharray="14 12"
          opacity={0.95}
        />
        {mark && (
          <text x={xe + 26} y={ye + 14} fill={color} fontFamily={FONT_DISPLAY} fontSize={62} fontWeight={700}>
            {mark}
          </text>
        )}
      </g>
    );
  }
  if (units <= 1e-6) {
    // "none" is not an empty arc — it is a hard stop at zero, and it must be visible.
    const [x0, y0] = polar(cx, cy, rIn - 18, 0, total);
    const [x1, y1] = polar(cx, cy, rOut + 18, 0, total);
    return (
      <g opacity={opacity}>
        <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={color} strokeWidth={10} strokeLinecap="round" />
        <circle cx={(x0 + x1) / 2} cy={(y0 + y1) / 2} r={19} fill={BUDGET_COLORS.stage} stroke={color} strokeWidth={7} />
      </g>
    );
  }
  return (
    <g opacity={opacity}>
      <path d={donutPath(cx, cy, rIn, rOut, 0, units, total)} fill={color} opacity={0.9} />
      <path d={donutPath(cx, cy, rIn - 3, rOut + 3, 0, units, total)} fill="none" stroke={color} strokeWidth={2.5} opacity={0.8} />
    </g>
  );
};

// =============================================================================
// LEGEND CHIP — label + value, for the block table under the dial.
// =============================================================================
export const Chip: React.FC<{
  x: number;
  y: number;
  w?: number;
  label: string;
  value: string;
  color: string;
  opacity?: number;
  strong?: boolean;
}> = ({ x, y, w = 300, label, value, color, opacity = 1, strong = false }) => {
  if (opacity <= 0.005) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y,
        width: w,
        opacity,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 20px',
        borderRadius: 14,
        background: strong ? `${color}22` : 'rgba(255,255,255,0.04)',
        border: `1.5px solid ${strong ? color : 'rgba(255,255,255,0.10)'}`,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: 16, height: 16, borderRadius: 5, background: color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 26,
            fontWeight: 600,
            color: BUDGET_COLORS.dim,
            letterSpacing: 2,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
      </div>
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 34,
          fontWeight: 700,
          color: strong ? color : BUDGET_COLORS.text,
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </div>
    </div>
  );
};
