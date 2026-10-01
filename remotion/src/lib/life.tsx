// =============================================================================
// lib/life.tsx — THE SURVIVAL ENGINE (how many of 100 people are still alive at year t)
//
// First used by short-49 ("What If Humans Could Live for 500 Years?").
//
// One hazard model, COMPUTED, never typed:
//   TODAY   — Gompertz–Makeham: h(t) = λ + a·2^(t/8). A flat background risk plus a risk that
//             doubles every 8 years (aging). Life expectancy ≈ 77, ~3% reach 100.
//   AGELESS — the same body with aging switched off at `freezeAt`: the hazard stays at h(freezeAt)
//             forever, so survival after that is a plain exponential.
//
// The 100 people are the curve read back: person i dies at their own survival QUANTILE (ranks
// shuffled across the grid), so "61 of 100 alive" is literally S(t) sampled, and the same person
// dies at the same rank under either model — rewinding the cursor revives them in order.
// =============================================================================
import React from 'react';
import { Easing } from 'remotion';
import { FONT_BODY, FONT_MONO } from '../fonts';

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export const LF = {
  bg: '#0d1117',
  panel: 'rgba(22,27,34,0.88)',
  grid: 'rgba(255,255,255,0.08)',
  axis: 'rgba(255,255,255,0.35)',
  dim: '#8b949e',
  today: '#e8879f',
  ageless: '#4ecdc4',
  gold: '#f5d76e',
  indigo: '#6366F1',
  dead: 'rgba(255,255,255,0.14)',
} as const;

// deterministic 0..1 noise — no Math.random in a render
const frac = (v: number) => v - Math.floor(v);
export const hash = (n: number) => frac(Math.sin(n * 127.1 + 311.7) * 43758.5453);

// =============================================================================
// THE MODEL
// =============================================================================
export const LIFE = {
  makeham: 0.0007, // /yr, background risk that doesn't age (accidents, infection)
  gompA: 0.00005, // /yr, the aging term at birth
  doubling: 8, // years for the aging term to double
  freezeAt: 20, // age at which "ageless" switches aging off
} as const;

const B = Math.LN2 / LIFE.doubling;
export const hazardToday = (t: number) => LIFE.makeham + LIFE.gompA * Math.exp(B * t);
const cumToday = (t: number) => LIFE.makeham * t + (LIFE.gompA / B) * (Math.exp(B * t) - 1);
export const survivalToday = (t: number) => Math.exp(-cumToday(Math.max(0, t)));

export const H_FROZEN = hazardToday(LIFE.freezeAt);
export const survivalAgeless = (t: number) =>
  t <= LIFE.freezeAt ? survivalToday(t) : survivalToday(LIFE.freezeAt) * Math.exp(-H_FROZEN * (t - LIFE.freezeAt));

export const survival = (t: number, ageless: boolean) => (ageless ? survivalAgeless(t) : survivalToday(t));

// the age by which half are gone, ageless
export const MEDIAN_AGELESS = LIFE.freezeAt + Math.log(2 * survivalToday(LIFE.freezeAt)) / H_FROZEN;

// expected years left at age `at` (numerical, 0.1 yr steps)
export const yearsLeft = (at: number, ageless: boolean) => {
  let e = 0;
  for (let k = 0; k < 40000; k++) e += survival(at + k * 0.1, ageless) * 0.1;
  return e / survival(at, ageless);
};

// =============================================================================
// THE 100 PEOPLE — person i dies when S(t) falls below their quantile q_i.
// =============================================================================
export const N_PEOPLE = 100;
const RANK: number[] = (() => {
  const idx = Array.from({ length: N_PEOPLE }, (_, i) => i);
  idx.sort((x, y) => hash(x + 17) - hash(y + 17));
  const rank = new Array<number>(N_PEOPLE);
  idx.forEach((person, r) => (rank[person] = r));
  return rank;
})();
export const quantile = (i: number) => (RANK[i] + 0.5) / N_PEOPLE;
export const aliveCount = (s: number) => {
  let n = 0;
  for (let i = 0; i < N_PEOPLE; i++) if (quantile(i) < s) n++;
  return n;
};
// 0..1 per person, soft over ~1% of survival so a dying person fades rather than blinks
export const aliveness = (i: number, s: number) => clamp01((s - quantile(i)) * N_PEOPLE + 0.5);

// =============================================================================
// SURVIVAL CHART — x = age (0..span years), y = % alive. Curves drawn up to their extent.
// =============================================================================
export type ChartBox = { x: number; y: number; w: number; h: number };

const curvePath = (box: ChartBox, span: number, from: number, to: number, ageless: boolean) => {
  if (to <= from) return '';
  const n = 180;
  const pts: string[] = [];
  for (let k = 0; k <= n; k++) {
    const t = from + ((to - from) * k) / n;
    const px = box.x + (t / span) * box.w;
    const py = box.y + (1 - survival(t, ageless)) * box.h;
    pts.push(`${k === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`);
  }
  return pts.join(' ');
};

const TICKS_NEAR = [0, 20, 40, 60, 80, 100, 120];
const TICKS_FAR = [0, 200, 400, 600, 800, 1000];

export const SurvivalChart: React.FC<{
  box: ChartBox;
  span: number; // x-axis max, years
  todayTo: number; // today's curve drawn over [0, todayTo]
  agelessTo: number; // ageless curve drawn over [freezeAt, agelessTo]
  cursor: number; // year
  cursorAgeless: boolean; // which curve the cursor rides
  cursorO?: number;
  pinO?: number; // "AGING OFF" pin at freezeAt
  medianO?: number; // dashed 50% line to the ageless median
  opacity?: number;
  tag?: string;
}> = ({ box, span, todayTo, agelessTo, cursor, cursorAgeless, cursorO = 1, pinO = 0, medianO = 0, opacity = 1, tag }) => {
  if (opacity <= 0.01) return null;
  const X = (t: number) => box.x + (t / span) * box.w;
  const Y = (s: number) => box.y + (1 - s) * box.h;
  const far = clamp01((span - 150) / 250); // tick set crossfade
  const s = survival(cursor, cursorAgeless);
  const cx = X(cursor);
  const cy = Y(s);
  const cColor = cursorAgeless && cursor > LIFE.freezeAt ? LF.ageless : LF.today;
  const ticks = [
    ...TICKS_NEAR.map((t) => ({ t, o: 1 - far })),
    ...TICKS_FAR.map((t) => ({ t, o: far })),
  ].filter((k) => k.o > 0.01 && k.t <= span + 0.5);
  const labelLeft = cx > box.x + box.w - 170;

  return (
    <div style={{ position: 'absolute', inset: 0, opacity }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id="life-plot">
            <rect x={box.x - 4} y={box.y - 20} width={box.w + 8} height={box.h + 24} />
          </clipPath>
          <linearGradient id="life-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={LF.ageless} stopOpacity={0.22} />
            <stop offset="1" stopColor={LF.ageless} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* horizontal grid: 0 / 50 / 100 % */}
        {[0, 0.5, 1].map((v) => (
          <line key={v} x1={box.x} x2={box.x + box.w} y1={Y(v)} y2={Y(v)} stroke={v === 0 ? LF.axis : LF.grid} strokeWidth={2} />
        ))}
        {ticks.map((k) => (
          <line key={`${k.t}-${k.o > 0.5}`} x1={X(k.t)} x2={X(k.t)} y1={box.y} y2={box.y + box.h} stroke={LF.grid} strokeWidth={2} opacity={k.o} />
        ))}

        <g clipPath="url(#life-plot)">
          {/* ageless: filled area under the drawn part */}
          {agelessTo > LIFE.freezeAt ? (
            <>
              <path
                d={`${curvePath(box, span, LIFE.freezeAt, Math.min(agelessTo, span * 1.02), true)} L${X(Math.min(agelessTo, span * 1.02)).toFixed(1)},${Y(0)} L${X(LIFE.freezeAt).toFixed(1)},${Y(0)} Z`}
                fill="url(#life-fill)"
              />
              <path d={curvePath(box, span, LIFE.freezeAt, Math.min(agelessTo, span * 1.02), true)} fill="none" stroke={LF.ageless} strokeWidth={7} strokeLinecap="round" />
            </>
          ) : null}
          {/* today */}
          {todayTo > 0 ? (
            <path d={curvePath(box, span, 0, Math.min(todayTo, span * 1.02), false)} fill="none" stroke={LF.today} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          ) : null}
        </g>

        {/* the ageless median: dashed from the 50% line down to the axis */}
        {medianO > 0.01 ? (
          <g opacity={medianO}>
            <line x1={box.x} x2={X(MEDIAN_AGELESS)} y1={Y(0.5)} y2={Y(0.5)} stroke={LF.gold} strokeWidth={3} strokeDasharray="10 10" />
            <line x1={X(MEDIAN_AGELESS)} x2={X(MEDIAN_AGELESS)} y1={Y(0.5)} y2={Y(0)} stroke={LF.gold} strokeWidth={3} strokeDasharray="10 10" />
          </g>
        ) : null}

        {/* aging-off pin */}
        {pinO > 0.01 ? (
          <g opacity={pinO}>
            <line x1={X(LIFE.freezeAt)} x2={X(LIFE.freezeAt)} y1={box.y - 10} y2={box.y + box.h} stroke={LF.gold} strokeWidth={3} />
            <circle cx={X(LIFE.freezeAt)} cy={Y(survival(LIFE.freezeAt, false))} r={11} fill={LF.gold} />
          </g>
        ) : null}

        {/* cursor */}
        {cursorO > 0.01 ? (
          <g opacity={cursorO}>
            <line x1={cx} x2={cx} y1={box.y} y2={box.y + box.h} stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
            <circle cx={cx} cy={cy} r={20} fill={cColor} opacity={0.25} />
            <circle cx={cx} cy={cy} r={11} fill={cColor} stroke="#fff" strokeWidth={3} />
          </g>
        ) : null}
      </svg>

      {/* y labels */}
      {[1, 0.5, 0].map((v) => (
        <div key={v} style={{ position: 'absolute', left: box.x - 96, width: 80, top: Y(v) - 16, textAlign: 'right', fontFamily: FONT_MONO, fontSize: 24, color: LF.dim }}>
          {Math.round(v * 100)}%
        </div>
      ))}
      {/* x labels */}
      {ticks.map((k) => (
        <div key={`l${k.t}-${k.o > 0.5}`} style={{ position: 'absolute', left: X(k.t) - 60, width: 120, top: box.y + box.h + 14, textAlign: 'center', fontFamily: FONT_MONO, fontSize: 24, color: LF.dim, opacity: k.o }}>
          {k.t}
        </div>
      ))}
      <div style={{ position: 'absolute', left: box.x, top: box.y + box.h + 52, width: box.w, textAlign: 'center', fontFamily: FONT_BODY, fontWeight: 600, fontSize: 20, letterSpacing: 4, color: LF.dim }}>
        AGE · YEARS
      </div>
      {tag ? (
        <div style={{ position: 'absolute', right: 1080 - box.x - box.w, top: box.y - 44, fontFamily: FONT_MONO, fontSize: 18, letterSpacing: 2, color: 'rgba(255,255,255,0.38)' }}>{tag}</div>
      ) : null}
      {pinO > 0.01 ? (
        <div style={{ position: 'absolute', left: X(LIFE.freezeAt) + 16, top: box.y - 6, opacity: pinO, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 22, color: LF.gold, whiteSpace: 'nowrap' }}>
          AGING OFF
        </div>
      ) : null}
      {medianO > 0.01 ? (
        <div style={{ position: 'absolute', left: X(MEDIAN_AGELESS) - 216, width: 200, top: Y(0.5) + 14, textAlign: 'right', opacity: medianO, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 24, color: LF.gold }}>
          HALF · {Math.round(MEDIAN_AGELESS)}
        </div>
      ) : null}

      {/* cursor readout */}
      {cursorO > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            left: labelLeft ? cx - 188 : cx + 22,
            width: 166,
            textAlign: labelLeft ? 'right' : 'left',
            top: cy - 104 > box.y - 6 ? cy - 104 : Math.min(cy + 22, box.y + box.h - 86),
            opacity: cursorO,
            fontFamily: FONT_MONO,
            fontWeight: 700,
            lineHeight: 1.05,
          }}
        >
          <div style={{ fontSize: 22, color: LF.dim, letterSpacing: 2 }}>AGE {Math.round(cursor)}</div>
          <div style={{ fontSize: 44, color: cColor }}>{Math.round(s * 100)}%</div>
        </div>
      ) : null}
    </div>
  );
};

// =============================================================================
// PEOPLE — 100 figures in a grid; each fades out by its own quantile, dead tint on demand.
// =============================================================================
const Figure: React.FC<{ x: number; y: number; s: number; color: string; alive: number; deadColor: string }> = ({ x, y, s, color, alive, deadColor }) => {
  const c = alive > 0.5 ? color : deadColor;
  const fill = alive;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <circle cx={0} cy={-11} r={7} fill={c} fillOpacity={0.12 + 0.88 * fill} stroke={c} strokeOpacity={0.5 + 0.5 * (1 - fill)} strokeWidth={2} />
      <path d="M-11,14 Q-11,0 0,0 Q11,0 11,14 Z" fill={c} fillOpacity={0.12 + 0.88 * fill} stroke={c} strokeOpacity={0.5 + 0.5 * (1 - fill)} strokeWidth={2} />
    </g>
  );
};

export const PeopleGrid: React.FC<{
  x: number;
  y: number;
  cols: number;
  cell: number;
  s: number; // survival 0..1 — person i alive while quantile(i) < s
  color: string;
  deadTint?: number; // 0 = dim grey dead, 1 = dead turn `tintColor`
  tintColor?: string;
  opacity?: number;
}> = ({ x, y, cols, cell, s, color, deadTint = 0, tintColor = LF.today, opacity = 1 }) => {
  if (opacity <= 0.01) return null;
  const rows = Math.ceil(N_PEOPLE / cols);
  const deadColor = deadTint > 0.5 ? tintColor : 'rgba(255,255,255,0.28)';
  return (
    <svg width={cols * cell} height={rows * cell} style={{ position: 'absolute', left: x, top: y, opacity, overflow: 'visible' }}>
      {Array.from({ length: N_PEOPLE }, (_, i) => {
        const a = aliveness(i, s);
        const col = i % cols;
        const row = Math.floor(i / cols);
        return (
          <g key={i} opacity={a > 0.5 ? 1 : mix(0.55, 0.9, deadTint)}>
            <Figure x={col * cell + cell / 2} y={row * cell + cell / 2 + 2} s={cell / 44} color={color} alive={a} deadColor={deadColor} />
          </g>
        );
      })}
    </svg>
  );
};

// =============================================================================
// CHIP — a small labelled fact pinned to the chart.
// =============================================================================
export const Chip: React.FC<{ x: number; y: number; text: string; color: string; opacity: number; pop?: number; align?: 'left' | 'center' }> = ({
  x,
  y,
  text,
  color,
  opacity,
  pop = 0,
  align = 'left',
}) => {
  if (opacity <= 0.01) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: align === 'center' ? 0 : x,
        right: align === 'center' ? 0 : undefined,
        top: y,
        display: 'flex',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        opacity,
        transform: `translateY(${(1 - opacity) * 10}px) scale(${1 + 0.05 * pop})`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_MONO,
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: 1,
          color,
          background: 'rgba(13,17,23,0.9)',
          border: `2px solid ${color}88`,
          borderRadius: 999,
          padding: '8px 22px',
          whiteSpace: 'nowrap',
          boxShadow: pop > 0.01 ? `0 0 ${30 * pop}px ${color}66` : '0 8px 32px rgba(0,0,0,0.35)',
        }}
      >
        {text}
      </div>
    </div>
  );
};

// =============================================================================
// BAR — a labelled horizontal quantity. `fill` 0..1 of the track.
// =============================================================================
export const YearsBar: React.FC<{ x: number; y: number; w: number; label: string; value: string; fill: number; color: string; opacity?: number; glow?: number }> = ({
  x,
  y,
  w,
  label,
  value,
  fill,
  color,
  opacity = 1,
  glow = 0,
}) => {
  if (opacity <= 0.01) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, opacity }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 26, letterSpacing: 3, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 48, color }}>{value}</span>
      </div>
      <div style={{ height: 30, borderRadius: 15, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div
          style={{
            width: `${clamp01(fill) * 100}%`,
            minWidth: fill > 0.0005 ? 14 : 0,
            height: '100%',
            borderRadius: 15,
            background: color,
            boxShadow: glow > 0.01 ? `0 0 ${30 * glow}px ${color}` : undefined,
          }}
        />
      </div>
    </div>
  );
};
