// =============================================================================
// lib/rate.tsx — THE BACKLOG ENGINE
//
// A quantity that ACCRUES at a steady rate over a window (a week) and is DRAINED by
// scheduled work sessions. Drawn as ONE curve above a week axis, with the sessions drawn
// as bars BELOW it, so the same ink can be spread out or piled up.
//
// The subject is never how much work there is — that is fixed — but WHEN it is done.
// Nothing on screen is keyframed. Every frame the composition hands in where each session
// sits and how big it is; `simulate` integrates the resulting sawtooth and returns the
// peak, the TIME-AVERAGE (area under the curve / duration) and the total minutes
// scheduled. A session that slides visibly changes those numbers as it moves, so a
// mistimed session prints a wrong average instead of hiding behind a hand-animated
// counter. Same ethos as cuts.tsx's live day algebra.
//
// The invariant that makes it a video: sessions carry their minutes with them, so moving
// them around can NEVER change the total. Whatever the schedule, the work is the same.
//
// Generic for a series: any "same load, different schedule" backlog is a new set of
// sessions, not a new engine — laundry, dishes, an inbox, revision before an exam, debt
// paid weekly vs monthly, a lawn, a backlog of tickets.
// =============================================================================
import React from 'react';
import { Easing } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const RT = {
  stage: '#0b0e14',
  text: '#e8ecf5',
  dim: '#8b93a7',
  faint: 'rgba(232,236,245,0.42)',
  track: 'rgba(255,255,255,0.04)',
  trackEdge: 'rgba(255,255,255,0.13)',
  grid: 'rgba(255,255,255,0.07)',
  mess: '#e8879f', // the backlog — what is waiting for you
  messFill: 'rgba(232,135,159,0.20)',
  work: '#4db8a8', // the minutes you actually spend — the good thing
  warn: '#f5d76e',
  indigo: '#6366F1',
  ink: '#0b0e14',
} as const;

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// =============================================================================
// THE MODEL — t is HOURS from the start of the window, v is MINUTES OF WORK WAITING.
// =============================================================================
export type Session = { t: number; minutes: number };
export type Pt = { t: number; v: number };
export type Run = { pts: Pt[]; peak: number; avg: number; total: number; zero: number };

/**
 * Walk the window, accruing at `rate` minutes per hour and draining at each session.
 *
 *  - the backlog can never go below zero (you cannot tidy what is not there), so an
 *    oversized session is simply wasted rather than printing a negative average;
 *  - `avg` is the exact area under the drawn sawtooth divided by its width — the number
 *    the video means by "how much is waiting on an ordinary evening";
 *  - `total` is what was SCHEDULED, so it is invariant under moving sessions around.
 */
export const simulate = (sessions: Session[], rate: number, lo: number, hi: number, v0 = 0): Run => {
  const evs = sessions
    .filter((s) => s.minutes > 0 && s.t > lo && s.t <= hi)
    .slice()
    .sort((a, b) => a.t - b.t);
  const pts: Pt[] = [{ t: lo, v: v0 }];
  let v = v0;
  let t = lo;
  let area = 0;
  let total = 0;
  let zero = 0;
  const walk = (to: number) => {
    const dt = Math.max(0, to - t);
    const next = v + rate * dt;
    area += ((v + next) / 2) * dt;
    if (v <= 0.0001 && next <= 0.0001) zero += dt;
    v = next;
    t = to;
  };
  for (const s of evs) {
    walk(s.t);
    pts.push({ t, v });
    v = Math.max(0, v - s.minutes);
    pts.push({ t, v });
    total += s.minutes;
  }
  walk(hi);
  pts.push({ t: hi, v });
  const peak = pts.reduce((m, p) => Math.max(m, p.v), 0);
  return { pts, peak, avg: area / Math.max(0.0001, hi - lo), total, zero };
};

/**
 * Hours the DRAWN curve spends above `level`, by exact interpolation on each segment.
 * "How long is there more than an hour of tidying waiting?" is a question about the
 * picture, so it is answered by measuring the picture.
 */
export const above = (run: Run, level: number): number => {
  let h = 0;
  for (let i = 1; i < run.pts.length; i += 1) {
    const a = run.pts[i - 1];
    const b = run.pts[i];
    const dt = b.t - a.t;
    if (dt <= 0) continue;
    if (a.v >= level && b.v >= level) h += dt;
    else if (a.v < level && b.v < level) continue;
    else {
      const u = (level - a.v) / (b.v - a.v); // the fraction of the segment before the crossing
      h += a.v >= level ? dt * u : dt * (1 - u);
    }
  }
  return h;
};

/** 98.4 -> "98" — rounded first so a moving value never prints a fraction. */
export const mins = (m: number) => `${Math.max(0, Math.round(m))}`;
/** 196 -> "3H 16M", 49 -> "49 MIN" */
export const hm = (m: number): string => {
  const M = Math.max(0, Math.round(m));
  return M < 60 ? `${M} MIN` : `${Math.floor(M / 60)}H ${String(M % 60).padStart(2, '0')}M`;
};

// =============================================================================
// GEOMETRY — one mapping from (hour, minutes-waiting) to (x, y).
// vTop is FIXED by the composition: a chart that rescales itself would hide the whole
// point, which is how much smaller one schedule's mountain is than the other's.
// =============================================================================
export type Plot = { x: number; w: number; y: number; h: number; tLo: number; tHi: number; vTop: number };
export const ex = (p: Plot, t: number) => p.x + ((t - p.tLo) / (p.tHi - p.tLo)) * p.w;
export const ey = (p: Plot, v: number) => p.y + p.h - (Math.max(0, v) / p.vTop) * p.h;

const line = (p: Plot, pts: Pt[]) =>
  pts.map((q, i) => `${i === 0 ? 'M' : 'L'}${ex(p, q.t).toFixed(1)},${ey(p, q.v).toFixed(1)}`).join('');

// =============================================================================
// THE WEEK — day bands, day names, and the baseline.
// =============================================================================
export const WeekGrid: React.FC<{
  p: Plot;
  days: string[];
  litDay?: number; // index of a day band to light, or -1
  litOn?: number;
  labelColor?: string;
}> = ({ p, days, litDay = -1, litOn = 0, labelColor = RT.dim }) => {
  const dw = p.w / days.length;
  return (
    <g>
      <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={16} fill={RT.track} stroke={RT.trackEdge} strokeWidth={2} />
      {days.map((d, i) => (
        <g key={d + i}>
          {i === litDay && litOn > 0.01 ? (
            <rect x={p.x + dw * i} y={p.y} width={dw} height={p.h} fill={RT.warn} fillOpacity={0.09 * litOn} />
          ) : null}
          {i > 0 ? (
            <line x1={p.x + dw * i} y1={p.y} x2={p.x + dw * i} y2={p.y + p.h} stroke={RT.grid} strokeWidth={2} />
          ) : null}
          <text
            x={p.x + dw * i + dw / 2}
            y={p.y + p.h + 40}
            fill={i === litDay && litOn > 0.5 ? RT.warn : labelColor}
            fontFamily={FONT_MONO}
            fontSize={26}
            fontWeight={600}
            letterSpacing={2}
            textAnchor="middle"
          >
            {d}
          </text>
        </g>
      ))}
      <line x1={p.x} y1={p.y + p.h} x2={p.x + p.w} y2={p.y + p.h} stroke="rgba(255,255,255,0.28)" strokeWidth={3} />
    </g>
  );
};

// =============================================================================
// THE BACKLOG CURVE — the sawtooth and the area under it (which IS the average).
// =============================================================================
export const Backlog: React.FC<{
  p: Plot;
  run: Run;
  color?: string;
  fill?: string;
  opacity?: number;
  dashed?: boolean;
  width?: number;
}> = ({ p, run, color = RT.mess, fill = RT.messFill, opacity = 1, dashed = false, width = 5 }) => {
  if (opacity <= 0.01) return null;
  const d = line(p, run.pts);
  if (!d) return null;
  const base = p.y + p.h;
  return (
    <g opacity={opacity}>
      <path d={`${d}L${ex(p, run.pts[run.pts.length - 1].t).toFixed(1)},${base}L${ex(p, run.pts[0].t).toFixed(1)},${base}Z`} fill={fill} />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" strokeDasharray={dashed ? '14 12' : undefined} />
    </g>
  );
};

/** The time-average, drawn where it actually sits — a horizontal line across the week. */
export const AvgLine: React.FC<{
  p: Plot;
  v: number;
  color?: string;
  label?: string;
  opacity?: number;
  dashed?: boolean;
  /** which end the label hangs off — keep it away from whatever the curve is doing there */
  side?: 'left' | 'right';
  width?: number;
}> = ({ p, v, color = RT.warn, label, opacity = 1, dashed = true, side = 'left', width = 4 }) => {
  if (opacity <= 0.01) return null;
  const y = ey(p, v);
  return (
    <g opacity={opacity}>
      <line
        x1={p.x}
        y1={y}
        x2={p.x + p.w}
        y2={y}
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dashed ? '10 10' : undefined}
      />
      {label ? (
        <text
          x={side === 'left' ? p.x + 14 : p.x + p.w - 14}
          y={y - 16}
          fill={color}
          fontFamily={FONT_BODY}
          fontSize={28}
          fontWeight={700}
          letterSpacing={3}
          textAnchor={side === 'left' ? 'start' : 'end'}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
};

// =============================================================================
// THE WORK BARS — one bar per session, hanging BELOW the axis, depth = minutes.
// Sessions that land on the same spot STACK, so piling the week's work into one day
// makes one deep bar of exactly the depth the seven shallow ones had together. The
// total ink is the total minutes, whatever the schedule.
// =============================================================================
export type DrawnSession = Session & { alpha?: number; glow?: number };

export const WorkBars: React.FC<{
  p: Plot;
  sessions: DrawnSession[];
  pxPerMin: number;
  gap?: number; // px below the axis
  color?: string;
  barW?: number;
  opacity?: number;
  /** 'end' hangs the bar to the LEFT of its time — a session occupies the minutes
      leading UP to it, so a bar scheduled at the end of Sunday sits under SUNDAY. */
  align?: 'center' | 'end';
}> = ({ p, sessions, pxPerMin, gap = 16, color = RT.work, barW = 30, opacity = 1, align = 'center' }) => {
  if (opacity <= 0.01) return null;
  const top = p.y + p.h + gap;
  const used = new Map<number, number>();
  const bars = sessions
    .slice()
    .sort((a, b) => a.t - b.t)
    .map((s, i) => {
      const at = ex(p, s.t);
      const x = align === 'end' ? at - barW - 2 : at - barW / 2;
      const k = Math.round(at / 8);
      const base = used.get(k) ?? 0;
      const h = s.minutes * pxPerMin;
      used.set(k, base + h);
      return { key: i, x, y: top + base, h, alpha: s.alpha ?? 1, glow: s.glow ?? 0 };
    });
  return (
    <g opacity={opacity}>
      {bars.map((b) =>
        b.alpha <= 0.005 || b.h <= 0.2 ? null : (
          <g key={b.key} opacity={b.alpha}>
            {b.glow > 0.01 ? (
              <rect x={b.x - 8} y={b.y - 6} width={barW + 16} height={b.h + 12} rx={12} fill={color} opacity={0.3 * b.glow} />
            ) : null}
            <rect x={b.x} y={b.y} width={barW} height={b.h} rx={Math.min(8, b.h / 2)} fill={color} />
          </g>
        ),
      )}
    </g>
  );
};

// =============================================================================
// READOUTS
// =============================================================================
export const Tally: React.FC<{
  y: number;
  cols: { label: string; value: string; color: string; sub?: string }[];
  opacity?: number;
}> = ({ y, cols, opacity = 1 }) => {
  if (opacity <= 0.01) return null;
  const w = 1080 / cols.length;
  return (
    <g opacity={opacity}>
      {cols.map((k, i) => {
        const cx = w * i + w / 2;
        return (
          <g key={k.label}>
            <text x={cx} y={y} fill={RT.dim} fontFamily={FONT_BODY} fontSize={25} fontWeight={600} letterSpacing={3.5} textAnchor="middle">
              {k.label}
            </text>
            <text x={cx} y={y + 88} fill={k.color} fontFamily={FONT_DISPLAY} fontSize={86} fontWeight={700} textAnchor="middle">
              {k.value}
            </text>
            {k.sub ? (
              <text x={cx} y={y + 124} fill={RT.faint} fontFamily={FONT_MONO} fontSize={23} fontWeight={500} letterSpacing={2} textAnchor="middle">
                {k.sub}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

/** A caption pinned under the bars — who does how much, how often. */
export const Chip: React.FC<{
  x: number;
  y: number;
  text: string;
  color?: string;
  opacity?: number;
  size?: number;
  anchor?: 'start' | 'middle' | 'end';
}> = ({ x, y, text, color = RT.work, opacity = 1, size = 30, anchor = 'middle' }) => {
  if (opacity <= 0.01) return null;
  return (
    <text
      x={x}
      y={y}
      fill={color}
      fontFamily={FONT_BODY}
      fontSize={size}
      fontWeight={700}
      letterSpacing={3}
      textAnchor={anchor}
      opacity={opacity}
    >
      {text}
    </text>
  );
};

/** The household: n little figures, `lit` of them working right now. */
export const People: React.FC<{ cx: number; y: number; n: number; lit?: number; color?: string; opacity?: number; s?: number }> = ({
  cx,
  y,
  n,
  lit = 1,
  color = RT.work,
  opacity = 1,
  s = 1,
}) => {
  if (opacity <= 0.01) return null;
  const step = 46 * s;
  const x0 = cx - ((n - 1) * step) / 2;
  return (
    <g opacity={opacity}>
      {Array.from({ length: n }, (_, i) => (
        <g key={i} opacity={0.3 + 0.7 * clamp01(lit)}>
          <circle cx={x0 + i * step} cy={y} r={11 * s} fill={color} />
          <rect x={x0 + i * step - 13 * s} y={y + 16 * s} width={26 * s} height={30 * s} rx={11 * s} fill={color} />
        </g>
      ))}
    </g>
  );
};

/** The citation, in the beat that makes the claim. */
export const SourcePlate: React.FC<{ lines: string[]; y: number; opacity?: number }> = ({ lines, y, opacity = 1 }) => {
  if (opacity <= 0.01) return null;
  return (
    <g opacity={opacity}>
      {lines.map((l, i) => (
        <text
          key={i}
          x={540}
          y={y + i * 32}
          fill={i === 0 ? RT.faint : RT.dim}
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
};
