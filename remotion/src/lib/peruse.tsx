// =============================================================================
// lib/peruse.tsx — THE AMORTIZATION ENGINE (a price, cut into the uses it buys)
//
// A purchase is drawn as a bar whose height IS its price, and every use cuts one more slice
// into it: n uses = n equal slices. The "cost per use" readout is not keyframed — it is the
// height of one slice, `price / n`, read back off the same `uses` the bar was cut with, so a
// mis-timed animation shows up as a WRONG NUMBER instead of hiding behind a counter.
//
// Same ethos as budget.tsx's read-back hub: never assert what the code can compute.
//
// Reusable for anything with a "one price, spread over how often you use it" shape: cost per
// wear, per workout, per streaming hour, a tool you rent vs buy, a course you never open,
// a car's cost per mile, the subscription you forgot.
// =============================================================================
import React from 'react';
import { Easing } from 'remotion';
import { FONT_BODY, FONT_MONO } from '../fonts';

export const PU = {
  stage: '#0b0e14',
  base: 'rgba(255,255,255,0.22)',
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
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// =============================================================================
// THE MODEL
// =============================================================================
/** Whole uses so far — a slice is only cut once the use has happened. */
export const wholeUses = (uses: number) => Math.max(0, Math.floor(uses + 1e-6));

/** Cost of ONE use, or null before the first use (a price with no uses has no per-use cost). */
export const perUse = (price: number, uses: number) => {
  const n = wholeUses(uses);
  return n === 0 ? null : price / n;
};

/** 2 -> "$2.00" · 0.5 -> "$0.50" · 50 -> "$50" (tags are whole dollars, per-use is cents). */
export const usd = (v: number, cents = true) => (cents ? `$${v.toFixed(2)}` : `$${Math.round(v)}`);

// =============================================================================
// THE SLICE BAR — price as height, uses as cuts.
// =============================================================================
export const SliceBar: React.FC<{
  x: number; // centre
  base: number; // baseline y
  w?: number;
  price: number;
  pxPer: number; // pixels per dollar — shared by every bar on screen, so heights compare
  uses: number;
  color: string;
  label?: string;
  broken?: number; // 0..1 — the thing wore out (a crack across the bar)
  lift?: number; // 0..1 — bar grows from the baseline
  opacity?: number;
  topGlow?: number; // 0..1 — light up the ONE-use slice at the top
}> = ({ x, base, w = 200, price, pxPer, uses, color, label, broken = 0, lift = 1, opacity = 1, topGlow = 1 }) => {
  if (opacity <= 0.005) return null;
  const hFull = price * pxPer;
  const h = hFull * lift;
  const top = base - h;
  const left = x - w / 2;
  const n = wholeUses(uses);
  const step = n > 0 ? h / n : 0;

  const cuts: React.ReactNode[] = [];
  if (n > 1) {
    // coarse slices read as a stack; fine ones become a texture — the price "ground down"
    const fine = step < 5;
    const sw = fine ? Math.max(0.6, step * 0.45) : 2.5;
    for (let i = 1; i < n; i++) {
      const y = top + i * step;
      cuts.push(<line key={i} x1={left} x2={left + w} y1={y} y2={y} stroke={PU.stage} strokeWidth={sw} opacity={fine ? 0.55 : 1} />);
    }
  }

  // the crack: a zigzag cut through the middle, opening as `broken` goes to 1
  const crackY = top + h * 0.48;
  const zig = Array.from({ length: 9 }, (_, i) => `${left - 4 + (i * (w + 8)) / 8},${crackY + (i % 2 === 0 ? -12 : 12)}`).join(' ');

  return (
    <g opacity={opacity}>
      <rect x={left} y={top} width={w} height={h} rx={6} fill={color} opacity={0.9} />
      {cuts}
      {n > 0 && topGlow > 0.01 && (
        <rect x={left - 6} y={top} width={w + 12} height={Math.max(4, step)} rx={2} fill={PU.accent} opacity={0.95 * topGlow} />
      )}
      <rect x={left} y={top} width={w} height={h} rx={6} fill="none" stroke={color} strokeWidth={3} />
      {broken > 0.01 && (
        <polyline points={zig} fill="none" stroke={PU.stage} strokeWidth={4 + 9 * broken} strokeLinejoin="miter" opacity={broken} />
      )}
      {label && (
        <text x={x} y={base + 48} textAnchor="middle" fill={PU.dim} fontFamily={FONT_BODY} fontSize={30} fontWeight={600} letterSpacing={3}>
          {label}
        </text>
      )}
    </g>
  );
};

// =============================================================================
// READOUT — label / value / sub, stacked above a bar. Callers pass the value computed from
// the SAME `uses` the bar was drawn with.
// =============================================================================
export const Readout: React.FC<{
  x: number;
  bottom: number; // y of the readout's bottom edge (the bar top, minus a gap)
  label: string;
  value: string;
  sub?: string;
  color: string;
  size?: number;
  opacity?: number;
  pop?: number; // 0..1 emphasis
}> = ({ x, bottom, label, value, sub, color, size = 84, opacity = 1, pop = 0 }) => {
  if (opacity <= 0.005) return null;
  const s = 1 + 0.06 * pop;
  return (
    <g opacity={opacity} transform={`translate(${x} ${bottom}) scale(${s}) translate(${-x} ${-bottom})`}>
      <text x={x} y={bottom - size - 44} textAnchor="middle" fill={PU.dim} fontFamily={FONT_BODY} fontSize={27} fontWeight={600} letterSpacing={4}>
        {label}
      </text>
      <text x={x} y={bottom - 40} textAnchor="middle" fill={color} fontFamily={FONT_MONO} fontSize={size} fontWeight={700}>
        {value}
      </text>
      {sub && (
        <text x={x} y={bottom} textAnchor="middle" fill={PU.dim} fontFamily={FONT_BODY} fontSize={27} fontWeight={500}>
          {sub}
        </text>
      )}
    </g>
  );
};

// =============================================================================
// FORMULA PILL — the rule, stated once, in the same mono as the numbers it produces.
// =============================================================================
export const Formula: React.FC<{ y: number; parts: { t: string; color?: string }[]; size?: number; opacity?: number }> = ({
  y,
  parts,
  size = 46,
  opacity = 1,
}) => {
  if (opacity <= 0.005) return null;
  return (
    <div style={{ position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity }}>
      <div
        style={{
          display: 'flex',
          gap: size * 0.32,
          alignItems: 'baseline',
          padding: `${size * 0.34}px ${size * 0.7}px`,
          borderRadius: 18,
          background: 'rgba(255,255,255,0.05)',
          border: '1.5px solid rgba(255,255,255,0.14)',
          fontFamily: FONT_MONO,
          fontWeight: 700,
          fontSize: size,
          whiteSpace: 'nowrap',
        }}
      >
        {parts.map((p, i) => (
          <span key={i} style={{ color: p.color ?? PU.text }}>
            {p.t}
          </span>
        ))}
      </div>
    </div>
  );
};

