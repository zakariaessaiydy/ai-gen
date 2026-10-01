// =============================================================================
// lib/hypno.tsx — THE HYPNOGRAM ENGINE (a night drawn as sleep depth against the clock)
//
// A night is a list of SEGMENTS, each one a stage held over an interval of hours since
// lights-out. Everything else on the chart is DERIVED from that list: the line itself, the
// pen tip riding it, the wake spikes (a stage-0 segment after sleep onset), the cycles (the
// stretches between spikes), each cycle's FLOOR (the deepest stage it reaches) and the share of
// deep sleep that falls before any given hour. Nothing is keyframed alongside the line, so a
// chart and its readouts cannot disagree — move a segment and the floor and the % move with it.
//
// Companion: `Lane`, a thin strip chart for one physiological curve on the SAME time axis
// (sleep pressure, cortisol, temperature, melatonin), with a marker that reads its own value.
//
// Generic for a series: any "what does the night look like" question is a new segment list,
// not a new engine — alcohol stealing REM from the second half, why naps over 30 minutes feel
// awful (waking from DEEP), the first night in a hotel, why the alarm mid-cycle hurts.
// =============================================================================
import React from 'react';
import { Easing } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const HY = {
  stage: '#0b0e14',
  text: '#e8ecf5',
  dim: '#8b93a7',
  faint: 'rgba(232,236,245,0.42)',
  grid: 'rgba(255,255,255,0.07)',
  gridStrong: 'rgba(255,255,255,0.16)',
  deep: '#6366F1',
  rem: '#9b7cc4',
  floor: '#4db8a8',
  wake: '#e8879f',
  warn: '#f5d76e',
} as const;

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// 0 is the surface. Depth increases downward, exactly as it is drawn.
export const AWAKE = 0;
export const REM = 1;
export const LIGHT = 2;
export const DEEP = 3;
export const LEVEL_NAMES = ['AWAKE', 'REM', 'LIGHT', 'DEEP'] as const;

export type Seg = { a: number; b: number; s: number };

/** "22:30" for `t` hours after a lights-out at `startMin` minutes past midnight. */
export const hhmm = (startMin: number, t: number): string => {
  const m = Math.round(startMin + t * 60);
  return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(((m % 60) + 60) % 60).padStart(2, '0')}`;
};

// =============================================================================
// DERIVED FACTS — read off the segment list, never typed.
// =============================================================================

/** Every brief awakening after sleep onset: the stage-0 segments that are not the first. */
export const spikes = (segs: Seg[]) => segs.filter((g, i) => i > 0 && g.s === AWAKE);

/** Cycles = the stretches between spikes. Each carries its floor (deepest stage reached). */
export const cycles = (segs: Seg[]) => {
  const out: { a: number; b: number; floor: number }[] = [];
  let cur: { a: number; b: number; floor: number } | null = null;
  segs.forEach((g, i) => {
    if (g.s === AWAKE) {
      if (cur) out.push(cur);
      cur = null;
      return;
    }
    if (!cur) cur = { a: g.a, b: g.b, floor: g.s };
    cur.b = g.b;
    cur.floor = Math.max(cur.floor, g.s);
    if (i === segs.length - 1) out.push(cur);
  });
  return out;
};

/** Hours spent in `stage` inside [from, to]. */
export const hoursIn = (segs: Seg[], stage: number, from = -Infinity, to = Infinity) =>
  segs
    .filter((g) => g.s === stage)
    .reduce((acc, g) => acc + Math.max(0, Math.min(g.b, to) - Math.max(g.a, from)), 0);

// =============================================================================
// GEOMETRY
// =============================================================================
export type Plot = { x: number; y: number; w: number; h: number; t0: number; t1: number };
export const hx = (p: Plot, t: number) => p.x + ((t - p.t0) / (p.t1 - p.t0)) * p.w;
export const dy = (p: Plot, depth: number) => p.y + (depth / DEEP) * p.h;

const RAMP = 0.035; // hours spent sliding between stages — keeps the steps from reading as a bar code

/** The line as a polyline in (hours, depth): flat runs joined by short slides. */
export const polyline = (segs: Seg[]): [number, number][] => {
  const pts: [number, number][] = [];
  segs.forEach((g, i) => {
    const r = Math.min(RAMP, (g.b - g.a) / 3);
    pts.push([i === 0 ? g.a : g.a + r, g.s]);
    pts.push([i === segs.length - 1 ? g.b : g.b - r, g.s]);
  });
  return pts;
};

/** Depth of the drawn line at hour `t` — the pen tip reads the same polyline it draws. */
export const depthAt = (segs: Seg[], t: number) => {
  const pts = polyline(segs);
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i += 1) {
    const [t1, d1] = pts[i];
    if (t <= t1) {
      const [t0, d0] = pts[i - 1];
      return mix(d0, d1, clamp01((t - t0) / Math.max(1e-6, t1 - t0)));
    }
  }
  return pts[pts.length - 1][1];
};

export const pathOf = (p: Plot, segs: Seg[]) =>
  polyline(segs)
    .map(([t, d], i) => `${i === 0 ? 'M' : 'L'}${hx(p, t).toFixed(1)},${dy(p, d).toFixed(1)}`)
    .join('');

// =============================================================================
// THE HYPNOGRAM — grid, stage labels, time axis, the line (drawn up to `pen`), the deep fill,
// the per-cycle floor, and a styling hook per spike.
// =============================================================================
export const Hypnogram: React.FC<{
  id: string;
  p: Plot;
  segs: Seg[];
  pen: number; // hours drawn
  startMin: number; // lights-out, minutes past midnight
  ticks: number[]; // hours to label on the time axis
  hot?: number; // hour to emphasise on the axis
  deepFill?: number; // 0..1 — deep-sleep blocks rise in
  floor?: number; // 0..1 — the floor line draws left to right
  spikeStyle?: (g: Seg, i: number) => { color: string; alpha: number; glow: number };
  dim?: number; // multiplies everything
  tip?: number; // 0..1 pen-tip dot visibility
}> = ({ id, p, segs, pen, startMin, ticks, hot, deepFill = 0, floor = 0, spikeStyle, dim = 1, tip = 0 }) => {
  const clipX = hx(p, Math.max(p.t0, pen));
  const d = pathOf(p, segs);
  const sp = spikes(segs);
  const cyc = cycles(segs);
  const tipT = Math.min(pen, p.t1);
  return (
    <g opacity={dim}>
      <defs>
        <clipPath id={`${id}-pen`}>
          <rect x={p.x - 40} y={p.y - 80} width={Math.max(0, clipX - p.x + 40)} height={p.h + 160} />
        </clipPath>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* stage rails + labels */}
      {LEVEL_NAMES.map((name, lv) => (
        <g key={name}>
          <line x1={p.x} x2={p.x + p.w} y1={dy(p, lv)} y2={dy(p, lv)} stroke={lv === 0 ? HY.gridStrong : HY.grid} strokeWidth={2} strokeDasharray={lv === 0 ? undefined : '4 10'} />
          <text x={p.x - 18} y={dy(p, lv) + 8} textAnchor="end" fontFamily={FONT_MONO} fontWeight={500} fontSize={23} fill={lv === DEEP ? HY.deep : lv === AWAKE ? HY.wake : HY.dim}>
            {name}
          </text>
        </g>
      ))}

      {/* time axis */}
      {ticks.map((t) => {
        const isHot = hot !== undefined && Math.abs(t - hot) < 1e-6;
        return (
          <g key={t}>
            <line x1={hx(p, t)} x2={hx(p, t)} y1={p.y} y2={p.y + p.h + 14} stroke={isHot ? `${HY.wake}66` : HY.grid} strokeWidth={2} strokeDasharray="3 9" />
            <text x={hx(p, t)} y={p.y + p.h + 50} textAnchor="middle" fontFamily={FONT_MONO} fontWeight={isHot ? 700 : 500} fontSize={isHot ? 27 : 23} fill={isHot ? HY.wake : HY.dim}>
              {hhmm(startMin, t)}
            </text>
          </g>
        );
      })}

      {/* deep sleep — every DEEP segment as a block between LIGHT and DEEP */}
      {deepFill > 0.001 &&
        segs
          .filter((g) => g.s === DEEP)
          .map((g, i) => {
            const k = EASE_OUT(clamp01(deepFill * 1.6 - i * 0.2));
            const top = mix(dy(p, DEEP), dy(p, LIGHT), k);
            return (
              <rect key={i} x={hx(p, g.a)} y={top} width={hx(p, g.b) - hx(p, g.a)} height={dy(p, DEEP) - top} rx={8} fill={HY.deep} opacity={0.42 * k} />
            );
          })}

      {/* the line */}
      <g clipPath={`url(#${id}-pen)`}>
        <path d={d} fill="none" stroke={HY.text} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" opacity={0.92} />
        {sp.map((g, i) => {
          const st = spikeStyle ? spikeStyle(g, i) : { color: HY.text, alpha: 1, glow: 0 };
          const x0 = hx(p, g.a) - 4;
          const x1 = hx(p, g.b) + 4;
          return (
            <g key={i}>
              {st.glow > 0.01 && (
                <rect x={x0 - 6} y={dy(p, AWAKE) - 10} width={x1 - x0 + 12} height={dy(p, REM) - dy(p, AWAKE) + 30} rx={10} fill={st.color} opacity={0.55 * st.glow} filter={`url(#${id}-glow)`} />
              )}
              <rect x={x0} y={dy(p, AWAKE) - 5} width={x1 - x0} height={10} rx={5} fill={st.color} opacity={st.alpha} />
            </g>
          );
        })}
      </g>

      {/* each cycle's floor — the deepest it gets — drawn left to right */}
      {floor > 0.001 &&
        cyc.map((c, i) => {
          const k = clamp01(floor * cyc.length - i);
          if (k <= 0) return null;
          const xa = hx(p, c.a) + 6;
          const xb = mix(xa, hx(p, c.b) - 6, EASE_OUT(k));
          const y = dy(p, c.floor) + 16;
          const prev = cyc[i - 1];
          return (
            <g key={i}>
              {prev && prev.floor !== c.floor && (
                <line x1={xa} x2={xa} y1={dy(p, prev.floor) + 16} y2={y} stroke={HY.floor} strokeWidth={4} opacity={0.9 * k} />
              )}
              <line x1={xa} x2={xb} y1={y} y2={y} stroke={HY.floor} strokeWidth={5} strokeLinecap="round" strokeDasharray="14 10" opacity={0.95} />
            </g>
          );
        })}

      {/* pen tip */}
      {tip > 0.01 && pen > p.t0 && (
        <g opacity={tip}>
          <circle cx={hx(p, tipT)} cy={dy(p, depthAt(segs, tipT))} r={22} fill={HY.warn} opacity={0.25} filter={`url(#${id}-glow)`} />
          <circle cx={hx(p, tipT)} cy={dy(p, depthAt(segs, tipT))} r={11} fill={HY.warn} />
        </g>
      )}
    </g>
  );
};

// =============================================================================
// LANE — one curve on the same time axis, drawn up to `draw`, with a marker at `markT`
// that prints `read(value)` — the value is evaluated, never typed.
// =============================================================================
export const Lane: React.FC<{
  id: string;
  p: Plot; // the hypnogram's plot — x/t mapping is shared
  y: number;
  h: number;
  label: string;
  color: string;
  fn: (t: number) => number; // 0..1
  draw: number; // 0..1 of the night
  markT?: number;
  mark?: number; // 0..1 marker visibility
  read?: (v: number) => string;
  opacity?: number;
}> = ({ id, p, y, h, label, color, fn, draw, markT, mark = 0, read, opacity = 1 }) => {
  if (opacity <= 0.01) return null;
  const tEnd = mix(p.t0, p.t1, clamp01(draw));
  const N = 90;
  const X = (t: number) => hx(p, t);
  const Y = (v: number) => y + h - clamp01(v) * h;
  let line = '';
  for (let i = 0; i <= N; i += 1) {
    const t = mix(p.t0, tEnd, i / N);
    line += `${i === 0 ? 'M' : 'L'}${X(t).toFixed(1)},${Y(fn(t)).toFixed(1)}`;
  }
  const area = tEnd > p.t0 ? `${line}L${X(tEnd).toFixed(1)},${y + h}L${X(p.t0).toFixed(1)},${y + h}Z` : '';
  const mv = markT !== undefined ? fn(markT) : 0;
  return (
    <g opacity={opacity}>
      <rect x={p.x} y={y} width={p.w} height={h} rx={12} fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
      {/* label in the stage-label gutter, one word per line, so it never meets the curve */}
      {label.split(' ').map((word, i, all) => (
        <text key={i} x={p.x - 18} y={y + h / 2 + 8 + (i - (all.length - 1) / 2) * 26} textAnchor="end" fontFamily={FONT_MONO} fontWeight={700} fontSize={21} fill={color}>
          {word}
        </text>
      ))}
      {tEnd > p.t0 && (
        <>
          <path d={area} fill={color} opacity={0.12} />
          <path d={line} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {markT !== undefined && mark > 0.01 && (
        <g opacity={mark} key={`${id}-mark`}>
          <circle cx={X(markT)} cy={Y(mv)} r={13} fill={HY.stage} stroke={color} strokeWidth={5} />
          <text x={X(markT) + 26} y={Y(mv) - 16} fontFamily={FONT_DISPLAY} fontWeight={700} fontSize={36} fill={HY.text}>
            {read ? read(mv) : ''}
          </text>
        </g>
      )}
    </g>
  );
};
