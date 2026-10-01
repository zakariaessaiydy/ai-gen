// =============================================================================
// lib/thermo.tsx — THE BODY-HEAT ENGINE
//
// A night drawn as ONE descending curve: core temperature against the clock, with a
// horizontal GATE the curve has to cross before sleep happens. The subject is never the
// temperature itself but WHEN the crossing arrives — so every number the video says out
// loud is a horizontal distance on this chart, measured off the curve that is actually
// drawn this frame (`crossing` bisects it) rather than keyframed by hand.
//
// The companion glyph is a body whose hands and feet are VENTS: one scalar `vent` opens
// them, and the heat that leaves through them is what bends the curve. Nothing animates
// itself — the composition hands in `vent`, `draw`, and the window, and the readouts
// print what the geometry returns.
//
// Generic for a series: any "one variable falls, and the crossing time is the story"
// question is a new curve, not a new engine — caffeine clearing a threshold, blood sugar
// after a meal, a room cooling overnight, alcohol leaving the blood before a drive.
// =============================================================================
import React from 'react';
import { Easing } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const TH = {
  stage: '#0b0e14',
  text: '#e8ecf5',
  dim: '#8b93a7',
  faint: 'rgba(232,236,245,0.42)',
  track: 'rgba(255,255,255,0.04)',
  trackEdge: 'rgba(255,255,255,0.13)',
  grid: 'rgba(255,255,255,0.07)',
  plain: '#8b93a7', // the descent you get anyway
  cool: '#6366F1', // the descent a warm bath buys — the one the video is about
  heat: '#e8879f', // warmth, vents, the body flushed
  gate: '#4db8a8', // the sleep gate, and anything that means "asleep"
  warn: '#f5d76e',
} as const;

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (x: number) => {
  const u = clamp01(x);
  return u * u * (3 - 2 * u);
};

/** 1350 -> "22:30" */
export const clock = (m: number): string => {
  const t = Math.round(m);
  return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

// =============================================================================
// THE MODEL — minutes past midnight in, degrees Celsius out.
// Core body temperature runs a ~1C circadian swing: trough at 04:00, peak at 16:00.
// =============================================================================
export const NADIR = 4 * 60;
export const coreT = (m: number) => 36.7 - 0.5 * Math.cos((2 * Math.PI * (m - NADIR)) / 1440);

export type TempFn = (m: number) => number;

/** Peak, floor and range of a curve, SCANNED over a full day — never typed. */
export const dayRange = (at: TempFn) => {
  let lo = Infinity;
  let hi = -Infinity;
  for (let m = 0; m < 1440; m += 1) {
    const t = at(m);
    if (t < lo) lo = t;
    if (t > hi) hi = t;
  }
  return { lo, hi, range: hi - lo };
};

/**
 * The minute at which a FALLING curve crosses `gate`, by bisection.
 * Returns null when the curve never gets there inside [lo, hi] — so a broken curve
 * drops its mark instead of parking it at an edge and printing a plausible lie.
 */
export const crossing = (at: TempFn, gate: number, lo: number, hi: number): number | null => {
  if (at(lo) < gate || at(hi) > gate) return null;
  let a = lo;
  let b = hi;
  for (let i = 0; i < 60; i += 1) {
    const m = (a + b) / 2;
    if (at(m) > gate) a = m;
    else b = m;
  }
  return (a + b) / 2;
};

/**
 * Solve for the depth of the cooling boost that makes `base` minus that boost cross
 * `gate` at exactly `want`. The bend in the warmed curve is therefore a CONSEQUENCE of
 * the published effect size, not an art direction choice.
 */
export const solveBoost = (base: TempFn, ramp: (m: number) => number, gate: number, want: number): number => {
  let a = 0;
  let b = 2;
  for (let i = 0; i < 80; i += 1) {
    const d = (a + b) / 2;
    if (base(want) - d * ramp(want) > gate) a = d;
    else b = d;
  }
  return (a + b) / 2;
};

// =============================================================================
// GEOMETRY — one mapping from (minute, degree) to (x, y).
// =============================================================================
export type Plot = { x: number; w: number; y: number; h: number; lo: number; hi: number; tLo: number; tHi: number };
export const px = (p: Plot, m: number) => p.x + ((m - p.lo) / (p.hi - p.lo)) * p.w;
export const py = (p: Plot, t: number) => p.y + ((p.tHi - t) / (p.tHi - p.tLo)) * p.h;

/** Sample a curve into an SVG path, clipped to the plot and drawn `draw` of the way along. */
export const pathOf = (p: Plot, at: TempFn, from: number, to: number, draw = 1): string => {
  const end = mix(from, to, clamp01(draw));
  if (end <= from) return '';
  const steps = 120;
  let d = '';
  for (let i = 0; i <= steps; i += 1) {
    const m = mix(from, end, i / steps);
    const t = Math.max(p.tLo, Math.min(p.tHi, at(m)));
    d += `${i === 0 ? 'M' : 'L'}${px(p, m).toFixed(1)},${py(p, t).toFixed(1)}`;
  }
  return d;
};

/**
 * The closed area BETWEEN two curves. Ten minutes of head start is a genuinely small
 * number of degrees — a sliver, not a canyon — so the gap gets filled rather than
 * exaggerated: the wedge reads at phone scale while the curves stay where they belong.
 */
export const wedgeOf = (p: Plot, top: TempFn, bot: TempFn, from: number, to: number, draw = 1): string => {
  const end = mix(from, to, clamp01(draw));
  if (end <= from) return '';
  const steps = 90;
  const clamp = (t: number) => Math.max(p.tLo, Math.min(p.tHi, t));
  let d = '';
  for (let i = 0; i <= steps; i += 1) {
    const m = mix(from, end, i / steps);
    d += `${i === 0 ? 'M' : 'L'}${px(p, m).toFixed(1)},${py(p, clamp(top(m))).toFixed(1)}`;
  }
  for (let i = steps; i >= 0; i -= 1) {
    const m = mix(from, end, i / steps);
    d += `L${px(p, m).toFixed(1)},${py(p, clamp(bot(m))).toFixed(1)}`;
  }
  return `${d}Z`;
};

// =============================================================================
// THE CHART — track, clock rail, degree rail, and the gate the curve has to cross.
// =============================================================================
export const TempChart: React.FC<{
  p: Plot;
  ticks: number[]; // minutes past midnight
  degrees: number[];
  gate: number;
  gateOn?: number;
}> = ({ p, ticks, degrees, gate, gateOn = 1 }) => (
  <g>
    <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={16} fill={TH.track} stroke={TH.trackEdge} strokeWidth={2} />

    {degrees.map((t) => (
      <g key={`dg${t}`}>
        <line x1={p.x} y1={py(p, t)} x2={p.x + p.w} y2={py(p, t)} stroke={TH.grid} strokeWidth={2} />
        <text x={p.x - 16} y={py(p, t) + 9} fill={TH.dim} fontFamily={FONT_MONO} fontSize={24} fontWeight={500} textAnchor="end">
          {t.toFixed(1)}
        </text>
      </g>
    ))}

    {ticks.map((m) => (
      <g key={`tk${m}`}>
        <line x1={px(p, m)} y1={p.y + p.h} x2={px(p, m)} y2={p.y + p.h + 14} stroke="rgba(255,255,255,0.26)" strokeWidth={2} />
        <text x={px(p, m)} y={p.y + p.h + 46} fill={TH.dim} fontFamily={FONT_MONO} fontSize={26} fontWeight={500} textAnchor="middle">
          {clock(m)}
        </text>
      </g>
    ))}

    {gateOn > 0.01 ? (
      <g opacity={gateOn}>
        <line
          x1={p.x}
          y1={py(p, gate)}
          x2={p.x + p.w}
          y2={py(p, gate)}
          stroke={TH.dim}
          strokeWidth={3}
          strokeDasharray="12 10"
          opacity={0.7}
        />
        {/* label rides the LEFT end, where the curves are still far above the gate */}
        <text x={p.x + 12} y={py(p, gate) - 16} fill={TH.dim} fontFamily={FONT_BODY} fontSize={25} fontWeight={700} letterSpacing={3}>
          ASLEEP
        </text>
      </g>
    ) : null}
  </g>
);

/** A vertical rule on the clock — bedtime, or a bath. */
export const TimeRule: React.FC<{
  p: Plot;
  m: number;
  label: string;
  color?: string;
  opacity?: number;
  dash?: boolean;
  labelY?: number;
}> = ({ p, m, label, color = TH.text, opacity = 1, dash = false, labelY }) => {
  if (opacity <= 0.01) return null;
  return (
    <g opacity={opacity}>
      <line
        x1={px(p, m)}
        y1={p.y}
        x2={px(p, m)}
        y2={p.y + p.h}
        stroke={color}
        strokeWidth={2.5}
        strokeDasharray={dash ? '8 8' : undefined}
        opacity={0.6}
      />
      <text
        x={px(p, m)}
        y={labelY ?? p.y - 14}
        fill={color}
        fontFamily={FONT_BODY}
        fontSize={24}
        fontWeight={700}
        letterSpacing={2.4}
        textAnchor="middle"
      >
        {label}
      </text>
    </g>
  );
};

/** Where a curve met the gate: the dot, plus its drop line down to the clock. */
export const SleepMark: React.FC<{ p: Plot; m: number; gate: number; color: string; opacity?: number; pulse?: number }> = ({
  p,
  m,
  gate,
  color,
  opacity = 1,
  pulse = 0,
}) => {
  if (opacity <= 0.01) return null;
  return (
    <g opacity={opacity}>
      <line x1={px(p, m)} y1={py(p, gate)} x2={px(p, m)} y2={p.y + p.h} stroke={color} strokeWidth={2} strokeDasharray="6 7" opacity={0.55} />
      <circle cx={px(p, m)} cy={py(p, gate)} r={16 + 10 * pulse} fill={color} opacity={0.22} />
      <circle cx={px(p, m)} cy={py(p, gate)} r={9} fill={color} stroke={TH.stage} strokeWidth={3} />
    </g>
  );
};

/** The band the evidence applies to: 1-2 hours before bed. */
export const WindowBand: React.FC<{ p: Plot; a: number; b: number; label: string; opacity?: number; live?: number }> = ({
  p,
  a,
  b,
  label,
  opacity = 1,
  live = 1,
}) => {
  if (opacity <= 0.01) return null;
  // dim (#8b93a7) when nothing is inside it, gate-teal (#4db8a8) when something is —
  // interpolated, so a bath dragged out of the window fades the band instead of snapping it
  const col = `rgb(${Math.round(mix(139, 77, live))},${Math.round(mix(147, 184, live))},${Math.round(mix(167, 168, live))})`;
  return (
    <g opacity={opacity}>
      <rect x={px(p, a)} y={p.y} width={px(p, b) - px(p, a)} height={p.h} fill={col} opacity={0.1 + 0.07 * live} />
      <rect x={px(p, a)} y={p.y} width={px(p, b) - px(p, a)} height={p.h} fill="none" stroke={col} strokeWidth={2} opacity={0.35 + 0.35 * live} />
      <text
        x={(px(p, a) + px(p, b)) / 2}
        y={p.y + p.h - 14}
        fill={col}
        fontFamily={FONT_BODY}
        fontSize={23}
        fontWeight={700}
        letterSpacing={2.2}
        textAnchor="middle"
      >
        {label}
      </text>
    </g>
  );
};

/** The horizontal head start between two crossings, bracketed on the gate line. */
export const HeadStart: React.FC<{ p: Plot; a: number; b: number; gate: number; text: string; opacity?: number }> = ({
  p,
  a,
  b,
  gate,
  text,
  opacity = 1,
}) => {
  if (opacity <= 0.01) return null;
  const xa = px(p, a);
  const xb = px(p, b);
  const y = py(p, gate) - 34;
  return (
    <g opacity={opacity}>
      <line x1={xa} y1={y - 9} x2={xa} y2={y + 9} stroke={TH.gate} strokeWidth={3} />
      <line x1={xb} y1={y - 9} x2={xb} y2={y + 9} stroke={TH.gate} strokeWidth={3} />
      <line x1={xa} y1={y} x2={xb} y2={y} stroke={TH.gate} strokeWidth={3} />
      <text x={(xa + xb) / 2} y={y - 18} fill={TH.gate} fontFamily={FONT_BODY} fontSize={26} fontWeight={700} letterSpacing={1.5} textAnchor="middle">
        {text}
      </text>
    </g>
  );
};

// =============================================================================
// THE WAIT — one horizontal bar per curve: how long you lie there, in minutes.
// Deliberately NOT on the chart's x-scale: ten minutes is a real difference and a thin
// one in clock-space, so the bars get their own px-per-minute and the chart keeps the
// mechanism. The MINUTES are still measured off the drawn curves, never typed.
// =============================================================================
export const WaitBar: React.FC<{
  x0: number;
  w: number;
  y: number;
  label: string;
  value: string;
  color: string;
  opacity?: number;
  pulse?: number;
}> = ({ x0, w, y, label, value, color, opacity = 1, pulse = 0 }) => {
  if (opacity <= 0.01) return null;
  return (
    <g opacity={opacity}>
      <text x={x0 - 18} y={y + 11} fill={TH.dim} fontFamily={FONT_BODY} fontSize={22} fontWeight={600} letterSpacing={2} textAnchor="end">
        {label}
      </text>
      <rect x={x0} y={y - 15} width={w} height={30} rx={15} fill={color} opacity={0.28} />
      <rect x={x0} y={y - 15} width={w} height={30} rx={15} fill="none" stroke={color} strokeWidth={2.5} />
      <text
        x={x0 + w + 20}
        y={y + 15 + 4 * pulse}
        fill={color}
        fontFamily={FONT_DISPLAY}
        fontSize={46 * (1 + 0.08 * pulse)}
        fontWeight={700}
      >
        {value}
      </text>
    </g>
  );
};

/** The difference between the two bars, bracketed across the gap that makes it. */
export const DeltaChip: React.FC<{ xa: number; xb: number; y: number; text: string; opacity?: number }> = ({
  xa,
  xb,
  y,
  text,
  opacity = 1,
}) => {
  if (opacity <= 0.01) return null;
  return (
    <g opacity={opacity}>
      <line x1={xa} y1={y - 24} x2={xa} y2={y + 10} stroke={TH.gate} strokeWidth={3} />
      <line x1={xb} y1={y - 24} x2={xb} y2={y + 10} stroke={TH.gate} strokeWidth={3} />
      <line x1={xa} y1={y + 10} x2={xb} y2={y + 10} stroke={TH.gate} strokeWidth={3} />
      <text x={(xa + xb) / 2} y={y + 62} fill={TH.gate} fontFamily={FONT_DISPLAY} fontSize={44} fontWeight={700} textAnchor="middle">
        {text}
      </text>
    </g>
  );
};

// =============================================================================
// THE BODY — a core that runs warm or cool, and four vents that open at the ends.
// `vent` 0..1 opens hands and feet; `flush` 0..1 warms the whole skin; the wisps are
// derived from the frame so nothing has to be keyframed.
// =============================================================================
const WISPS = [
  { x: -132, y: 18, s: 1.0 },
  { x: 132, y: 18, s: 1.0 },
  { x: -46, y: 196, s: 0.85 },
  { x: 46, y: 196, s: 0.85 },
];

export const BodyGlyph: React.FC<{
  cx: number;
  cy: number;
  vent?: number;
  flush?: number;
  f: number;
  opacity?: number;
  limbGlow?: number;
}> = ({ cx, cy, vent = 0, flush = 0, f, opacity = 1, limbGlow = 0 }) => {
  if (opacity <= 0.01) return null;
  const skin = mix(0.42, 1, clamp01(flush));
  const core = `rgb(${Math.round(mix(99, 232, flush))},${Math.round(mix(102, 135, flush))},${Math.round(mix(241, 159, flush))})`;
  const ends = TH.heat;
  const open = clamp01(vent);

  return (
    <g opacity={opacity} transform={`translate(${cx} ${cy})`}>
      {/* heat leaving the vents — only when they are open */}
      {open > 0.02
        ? WISPS.map((w, i) => (
            <g key={`ws${i}`}>
              {[0, 1, 2].map((k) => {
                const ph = ((f * 0.028 + i * 0.31 + k * 0.333) % 1 + 1) % 1;
                return (
                  <ellipse
                    key={k}
                    cx={w.x + Math.sin((ph + i) * 6.283) * 11 * w.s}
                    cy={w.y - ph * 96 * w.s}
                    rx={11 * w.s * (1 - 0.4 * ph)}
                    ry={19 * w.s * (1 - 0.3 * ph)}
                    fill={ends}
                    opacity={open * 0.8 * (1 - ph) * (ph < 0.08 ? ph / 0.08 : 1)}
                  />
                );
              })}
            </g>
          ))
        : null}

      {/* head + torso: the core */}
      <circle cx={0} cy={-128} r={40} fill={core} opacity={skin} />
      <path
        d="M -52 -78 Q 0 -94 52 -78 L 62 34 Q 0 48 -62 34 Z"
        fill={core}
        opacity={skin}
      />
      {/* arms out to the hands */}
      <path d="M -52 -66 L -126 6" stroke={core} strokeWidth={22} strokeLinecap="round" fill="none" opacity={skin} />
      <path d="M 52 -66 L 126 6" stroke={core} strokeWidth={22} strokeLinecap="round" fill="none" opacity={skin} />
      {/* legs down to the feet */}
      <path d="M -30 40 L -44 180" stroke={core} strokeWidth={26} strokeLinecap="round" fill="none" opacity={skin} />
      <path d="M 30 40 L 44 180" stroke={core} strokeWidth={26} strokeLinecap="round" fill="none" opacity={skin} />

      {/* the vents themselves: hands and feet */}
      {[
        { x: -132, y: 12 },
        { x: 132, y: 12 },
        { x: -46, y: 190 },
        { x: 46, y: 190 },
      ].map((v, i) => (
        <g key={`vt${i}`}>
          <circle cx={v.x} cy={v.y} r={20 + 26 * open} fill={ends} opacity={0.1 + 0.26 * open + 0.2 * limbGlow} />
          <circle cx={v.x} cy={v.y} r={17} fill={ends} opacity={0.5 + 0.5 * Math.max(open, limbGlow)} />
        </g>
      ))}
    </g>
  );
};

/** The bath, sitting on the clock where it was taken. */
export const BathMark: React.FC<{ x: number; y: number; opacity?: number; label?: string; ghost?: boolean }> = ({
  x,
  y,
  opacity = 1,
  label,
  ghost = false,
}) => {
  if (opacity <= 0.01) return null;
  const col = ghost ? TH.dim : TH.heat;
  return (
    <g opacity={opacity} transform={`translate(${x} ${y})`}>
      <rect x={-52} y={-26} width={104} height={52} rx={16} fill={col} opacity={ghost ? 0.14 : 0.24} />
      <rect x={-52} y={-26} width={104} height={52} rx={16} fill="none" stroke={col} strokeWidth={2.5} strokeDasharray={ghost ? '7 7' : undefined} />
      {/* three rising steam curls */}
      {[-24, 0, 24].map((dx) => (
        <path
          key={dx}
          d={`M ${dx} 8 q -9 -12 0 -22 q 9 -11 0 -22`}
          stroke={col}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          opacity={0.9}
        />
      ))}
      {label ? (
        <text x={0} y={52} fill={col} fontFamily={FONT_BODY} fontSize={23} fontWeight={700} letterSpacing={2} textAnchor="middle">
          {label}
        </text>
      ) : null}
    </g>
  );
};

// =============================================================================
// READOUTS
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
            <text x={cx} y={y} fill={TH.dim} fontFamily={FONT_BODY} fontSize={24} fontWeight={600} letterSpacing={3.4} textAnchor="middle">
              {k.label}
            </text>
            <text
              x={cx}
              y={y + 72}
              fill={k.color}
              fontFamily={FONT_DISPLAY}
              fontSize={66 * (1 + 0.06 * (k.pulse ?? 0))}
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

export const SourcePlate: React.FC<{ lines: string[]; y: number; opacity?: number }> = ({ lines, y, opacity = 1 }) => (
  <g opacity={opacity}>
    {lines.map((l, i) => (
      <text
        key={i}
        x={540}
        y={y + i * 30}
        fill={i === 0 ? TH.faint : TH.dim}
        fontFamily={FONT_MONO}
        fontSize={22}
        fontWeight={500}
        letterSpacing={1.5}
        textAnchor="middle"
      >
        {l}
      </text>
    ))}
  </g>
);
