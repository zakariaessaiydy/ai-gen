// =============================================================================
// lib/autopilot.tsx — THE AUTOMATICITY ENGINE (a habit is a schedule of days)
//
// First used by short-47 ("How to Make Good Habits Feel Automatic").
//
// A habit is a SCHEDULE: day 1..n, each one done or missed. Automaticity is never keyframed —
// it is read off the number of repetitions actually done by that day, through ONE asymptotic
// curve, `1 − e^(−reps/τ)` (the exponential form of Lally et al. 2010's model). τ is solved so
// that 95% of the plateau lands on a named day, so "95% by day 66" is a property of the curve,
// not a label typed next to it.
//
// Everything a shot draws from the engine is the same number: the chart line, the % readout,
// the link's thickness and the decision gate's fade. A missed day is simply a day that adds no
// repetition — the line goes flat for one step and carries on from where it was.
// =============================================================================
import React from 'react';
import { Easing } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export const AP = {
  ink: '#0f1216',
  gold: '#f5d76e',
  teal: '#4db8a8',
  pink: '#e8879f',
  indigo: '#6366F1',
  muted: '#8b949e',
  line: 'rgba(255,255,255,0.14)',
  card: 'rgba(12,14,20,0.9)',
} as const;

export const hexMix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  const k = clamp01(t);
  return `#${x.map((v, i) => Math.round(mix(v, y[i], k)).toString(16).padStart(2, '0')).join('')}`;
};

// =============================================================================
// THE MODEL
// =============================================================================
export type Schedule = { days: number; missed: number[] };

// repetitions done by (fractional) day `d`: whole days done, plus the part of today if it is done
export const repsBy = (s: Schedule, d: number) => {
  const dd = Math.max(0, Math.min(s.days, d));
  const whole = Math.floor(dd);
  const missedSoFar = s.missed.filter((m) => m <= whole).length;
  const today = whole + 1;
  const part = today <= s.days && !s.missed.includes(today) ? dd - whole : 0;
  return whole - missedSoFar + part;
};

// τ such that automaticity hits 95% of the plateau exactly on `day` (given the misses before it)
export const tauFor = (s: Schedule, day: number) => repsBy(s, day) / Math.log(20);
export const autoOfReps = (reps: number, tau: number) => 1 - Math.exp(-reps / tau);
export const autoAt = (s: Schedule, tau: number, d: number) => autoOfReps(repsBy(s, d), tau);

// the first whole day on which the curve reaches `level`
export const dayReaching = (s: Schedule, tau: number, level: number) => {
  for (let d = 0; d <= s.days; d++) if (autoAt(s, tau, d) >= level - 1e-9) return d;
  return Infinity;
};

// =============================================================================
// THE CHART — automaticity against days, drawn up to a fractional day.
// =============================================================================
export type Plot = { x: number; y: number; w: number; h: number; maxDay: number };
export const px = (p: Plot, day: number) => p.x + (day / p.maxDay) * p.w;
export const py = (p: Plot, a: number) => p.y + p.h - a * p.h;

export type Marker = { day: number; label: string; color: string; opacity: number; strike?: number; value?: number; lift?: number };

const pathOf = (pts: { x: number; y: number }[]) => pts.map((q, i) => `${i ? 'L' : 'M'}${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ');

export const AutoChart: React.FC<{
  plot: Plot;
  s: Schedule;
  tau: number;
  upTo: number; // fractional day the line is drawn to
  opacity?: number;
  markers?: Marker[];
  ghostFrom?: number; // the day a "reset" ghost restarts from 0
  ghostDraw?: number; // 0..1
  ghostO?: number;
  missPing?: number; // 0..1 pulse on the missed days
  color?: string;
}> = ({ plot, s, tau, upTo, opacity = 1, markers = [], ghostFrom, ghostDraw = 0, ghostO = 0, missPing = 0, color = AP.gold }) => {
  if (opacity <= 0.01) return null;
  const pts: { x: number; y: number }[] = [];
  const end = Math.max(0, Math.min(s.days, upTo));
  for (let d = 0; d <= Math.floor(end); d++) pts.push({ x: px(plot, d), y: py(plot, autoAt(s, tau, d)) });
  if (end > Math.floor(end)) pts.push({ x: px(plot, end), y: py(plot, autoAt(s, tau, end)) });
  const head = pts[pts.length - 1];

  // the ghost: what people fear a miss does — drop to zero and start over
  const ghost: { x: number; y: number }[] = [];
  if (ghostFrom !== undefined && ghostDraw > 0) {
    const g0 = ghostFrom;
    const gEnd = mix(g0, s.days, ghostDraw);
    ghost.push({ x: px(plot, g0), y: py(plot, autoAt(s, tau, g0)) });
    for (let d = g0; d <= gEnd; d += 0.5) ghost.push({ x: px(plot, d), y: py(plot, autoOfReps(d - g0, tau)) });
  }

  const ticks = [0, 10, 20, 30, 40, 50, 60, 70].filter((t) => t <= plot.maxDay);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity }}>
      <defs>
        <filter id="apGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      {/* grid + axes */}
      {[0, 0.5, 1].map((a) => (
        <line key={a} x1={plot.x} x2={plot.x + plot.w} y1={py(plot, a)} y2={py(plot, a)} stroke={AP.line} strokeWidth={2} strokeDasharray={a === 0 ? undefined : '6 10'} />
      ))}
      {[0, 50, 100].map((v) => (
        <text key={v} x={plot.x - 18} y={py(plot, v / 100) + 9} textAnchor="end" fontFamily={FONT_MONO} fontSize={24} fill={AP.muted}>
          {v}%
        </text>
      ))}
      {ticks.map((t) => (
        <text key={t} x={px(plot, t)} y={plot.y + plot.h + 42} textAnchor="middle" fontFamily={FONT_MONO} fontSize={24} fill={AP.muted}>
          {t}
        </text>
      ))}
      <text x={plot.x + plot.w} y={plot.y + plot.h + 80} textAnchor="end" fontFamily={FONT_BODY} fontWeight={600} fontSize={22} letterSpacing={3} fill={AP.muted}>
        DAYS OF REPEATING
      </text>
      {/* one tick per day — pink where the day was missed */}
      {Array.from({ length: Math.floor(end) }, (_, i) => i + 1).map((d) => {
        const miss = s.missed.includes(d);
        return (
          <line
            key={d}
            x1={px(plot, d)}
            x2={px(plot, d)}
            y1={plot.y + plot.h + 4}
            y2={plot.y + plot.h + (miss ? 22 + 8 * missPing : 12)}
            stroke={miss ? AP.pink : 'rgba(255,255,255,0.35)'}
            strokeWidth={miss ? 4 : 2}
          />
        );
      })}

      {/* markers: a day, its own value on the curve, and a label */}
      {markers.map((m, i) => {
        if (m.opacity <= 0.01) return null;
        const a = autoAt(s, tau, m.day);
        const x = px(plot, m.day);
        const ly = plot.y - 26 - (m.lift ?? 0);
        const label = m.value === undefined ? m.label : `${m.label} · ${Math.round(a * 100)}%`;
        const wEst = label.length * 15.5 + 36;
        return (
          <g key={i} opacity={m.opacity}>
            <line x1={x} x2={x} y1={ly + 20} y2={plot.y + plot.h} stroke={m.color} strokeWidth={3} strokeDasharray="8 8" />
            <circle cx={x} cy={py(plot, a)} r={10} fill={m.color} />
            <rect x={x - wEst / 2} y={ly - 24} width={wEst} height={46} rx={23} fill={AP.card} stroke={m.color} strokeWidth={2} />
            <text x={x} y={ly + 8} textAnchor="middle" fontFamily={FONT_MONO} fontWeight={700} fontSize={26} fill={m.color}>
              {label}
            </text>
            {m.strike ? (
              <line x1={x - wEst / 2 - 6} x2={x - wEst / 2 - 6 + (wEst + 12) * m.strike} y1={ly} y2={ly} stroke={AP.pink} strokeWidth={5} strokeLinecap="round" />
            ) : null}
          </g>
        );
      })}

      {/* the reset ghost */}
      {ghost.length > 1 ? (
        <path d={pathOf(ghost)} fill="none" stroke={AP.pink} strokeWidth={5} strokeDasharray="10 10" opacity={ghostO} strokeLinecap="round" />
      ) : null}

      {/* the line itself */}
      {pts.length > 1 ? (
        <>
          <path d={pathOf(pts)} fill="none" stroke={color} strokeWidth={14} opacity={0.45} filter="url(#apGlow)" />
          <path d={pathOf(pts)} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
      {s.missed
        .filter((m) => m <= end && missPing > 0.01)
        .map((m) => {
          const c = { x: px(plot, m), y: py(plot, autoAt(s, tau, m)) };
          return <circle key={m} cx={c.x} cy={c.y} r={12 + 26 * missPing} fill="none" stroke={AP.pink} strokeWidth={4} opacity={1 - 0.6 * missPing} />;
        })}
      <circle cx={head.x} cy={head.y} r={11} fill="#fff" stroke={color} strokeWidth={5} />
    </svg>
  );
};

// =============================================================================
// THE LINK — cue card → (decision gate) → habit card. The link's width IS the automaticity.
// =============================================================================
export type CardFace = { kicker: string; main: string; color: string; body?: React.ReactNode };

// a card that can flip between two faces (flip 0 = front, 1 = back); scaleX fakes the turn
export const FlipCard: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  front: CardFace;
  back?: CardFace;
  flip?: number;
  glow?: number;
}> = ({ x, y, w, h, front, back, flip = 0, glow = 0 }) => {
  const face = back && flip > 0.5 ? back : front;
  const sx = back ? Math.max(0.02, Math.abs(Math.cos(Math.PI * clamp01(flip)))) : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        transform: `scaleX(${sx})`,
        background: AP.card,
        border: `3px solid ${face.color}${glow > 0.5 ? 'ee' : '77'}`,
        borderRadius: 24,
        boxShadow: glow > 0.01 ? `0 0 ${60 * glow}px ${face.color}88` : '0 14px 50px rgba(0,0,0,0.5)',
        padding: '18px 22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 6,
      }}
    >
      <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 22, letterSpacing: 4, color: face.color, textTransform: 'uppercase' }}>{face.kicker}</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: '#fff', lineHeight: 1.05 }}>{face.main}</div>
      {face.body}
    </div>
  );
};

// small pill used on a card body ("same place", "same time")
export const Pill: React.FC<{ text: string; lit: number; color: string }> = ({ text, lit, color }) => (
  <div
    style={{
      fontFamily: FONT_MONO,
      fontWeight: 700,
      fontSize: 19,
      letterSpacing: 1,
      padding: '5px 12px',
      borderRadius: 999,
      color: lit > 0.5 ? AP.ink : 'rgba(255,255,255,0.45)',
      background: lit > 0.5 ? color : 'rgba(255,255,255,0.06)',
      border: `2px solid ${hexMix('#3a414b', color, lit)}`,
      transform: `scale(${1 + 0.08 * Math.sin(Math.PI * clamp01(lit))})`,
      whiteSpace: 'nowrap',
    }}
  >
    {text}
  </div>
);

export type LinkPulse = { u: number; color: string; stopAt?: number }; // u 0..1 along the link

export const Link: React.FC<{
  x1: number;
  x2: number;
  y: number;
  auto: number; // 0..1 — width and colour both come from here
  gate: number; // 0..1 decision-gate presence
  gateFlash?: number; // 0..1 a decision being made
  gateHeat?: number; // 0..1 pink "effort" glow
  pulses?: LinkPulse[];
}> = ({ x1, x2, y, auto, gate, gateFlash = 0, gateHeat = 0, pulses = [] }) => {
  const width = 4 + 20 * auto;
  const color = hexMix('#3a414b', AP.gold, clamp01(auto * 1.15));
  const gx = (x1 + x2) / 2;
  const R = 50;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
      <defs>
        <filter id="apLinkGlow" x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <line x1={x1} x2={x2} y1={y} y2={y} stroke={color} strokeWidth={width * 1.8} opacity={0.5 * auto} filter="url(#apLinkGlow)" />
      <line x1={x1} x2={x2} y1={y} y2={y} stroke={color} strokeWidth={width} strokeLinecap="round" />
      {pulses.map((p, i) => {
        const x = mix(x1, x2, clamp01(p.u));
        return <circle key={i} cx={x} cy={y} r={13} fill={p.color} opacity={Math.sin(Math.PI * clamp01(p.u)) * 0.6 + 0.4} />;
      })}
      {gate > 0.01 ? (
        <g opacity={gate} transform={`translate(${gx} ${y}) scale(${0.7 + 0.3 * gate + 0.12 * gateFlash})`}>
          <circle r={R + 30 * gateHeat} fill={AP.pink} opacity={0.22 * gateHeat} />
          <rect x={-R} y={-R} width={R * 2} height={R * 2} rx={12} transform="rotate(45)" fill={hexMix('#1b1f27', '#3a1e28', Math.max(gateFlash, gateHeat))} stroke={AP.pink} strokeWidth={4} />
          <text y={11} textAnchor="middle" fontFamily={FONT_MONO} fontWeight={700} fontSize={30} fill={AP.pink}>
            ?
          </text>
          <text y={R + 50} textAnchor="middle" fontFamily={FONT_BODY} fontWeight={600} fontSize={22} letterSpacing={3} fill={AP.pink}>
            DECIDE
          </text>
        </g>
      ) : null}
    </svg>
  );
};
