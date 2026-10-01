// =============================================================================
// lib/recall.tsx — THE RETENTION ENGINE (a way of learning is TWO measured numbers)
//
// A learning condition is not a curve somebody drew. It is two data points — what was recalled
// five minutes after the session, and what was recalled a week later — plus a power law fitted
// through them. Everything else on screen is read back off that fit: the shape of the line,
// the day the two lines cross, the gap between them on any day, and how much each one forgot.
// Nothing is keyframed twice, so nothing can disagree with itself, and a mistimed frame shows
// a WRONG number rather than hiding behind a right-looking one.
//
// Same ethos as prob.tsx's seeded trials, map.tsx's real Mercator, orbit.tsx's Verlet
// integrator, flow.tsx's remainder branches, order.tsx's replayed swaps and phase.tsx's one
// staircase: never assert what the code can compute.
//
// WHY A POWER LAW: forgetting over time is well described by R = a(1+t)^-b (Wixted & Ebbesen,
// Psychol Sci 1991, "On the form of forgetting: a review of meta-analytic studies"). Two
// anchors fix a and b exactly, so this is not a free-hand curve — it is the ONLY power law
// through the two measured points. The anchors are data. The shape between them is a model,
// and the one quantity read from between them (the crossing) is labelled FITTED on screen.
//
// TIME CONVENTION: t is days since the work was done. t=0 is the five-minute test, t=7 the
// one-week test. The x axis is LOGARITHMIC in (1+t) — the axis a power law is naturally read
// on, and the only one where "tonight" and "next week" both get room on a phone.
// =============================================================================
import React from 'react';
import { Easing } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const RECALL_COLORS = {
  stage: '#0b0e14',
  grid: 'rgba(255,255,255,0.05)',
  gridStrong: 'rgba(255,255,255,0.15)',
  dim: '#8b93a7',
  text: '#e8ecf5',
  shown: '#e8879f', // brand pink — the expensive way
  shownEdge: '#f4b0c0',
  asked: '#4db8a8', // brand teal — the one that keeps
  askedEdge: '#7ad8c8',
  accent: '#f5d76e',
} as const;

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// =============================================================================
// THE MODEL — two anchors per condition, and one exponent derived from them.
// =============================================================================
/** Days between the two measured tests. The whole x axis. */
export const SPAN = 7;
const LOG_SPAN = Math.log(1 + SPAN);

export type Curve = {
  key: 'shown' | 'asked';
  name: string;
  sub: string;
  color: string;
  edge: string;
  /** MEASURED: proportion of idea units recalled on the final test 5 minutes later. */
  r0: number;
  /** MEASURED: the same, one week later. */
  r7: number;
  /** MEASURED: times the passage was read end to end during the learning session. */
  reads: number;
  /** MEASURED: "how well will you remember this in a week?", rated 1-7 right after it. */
  conf: number;
  /** DERIVED: the only decay exponent that puts a power law through both anchors. */
  b: number;
};

type Spec = Omit<Curve, 'b'>;
const fit = (s: Spec): Curve => ({ ...s, b: Math.log(s.r0 / s.r7) / LOG_SPAN });

/** Read the passage four times, never tested. Roediger & Karpicke 2006, Exp. 2, SSSS. */
export const SHOWN: Curve = fit({
  key: 'shown',
  name: 'SHOWN',
  sub: 'read it 4 times',
  color: RECALL_COLORS.shown,
  edge: RECALL_COLORS.shownEdge,
  r0: 0.83,
  r7: 0.4,
  reads: 14.2,
  conf: 4.8,
});

/** Read it once, then recalled it three times, with NO answers given. Same paper, STTT. */
export const ASKED: Curve = fit({
  key: 'asked',
  name: 'ASKED',
  sub: 'recalled it 3 times',
  color: RECALL_COLORS.asked,
  edge: RECALL_COLORS.askedEdge,
  r0: 0.71,
  r7: 0.61,
  reads: 3.4,
  conf: 4.0,
});

export const CURVES: Curve[] = [SHOWN, ASKED];

/** The fit itself. Every line, number and marker below is this function, sampled. */
export const R = (c: Curve, t: number) => c.r0 * Math.pow(1 + Math.max(0, t), -c.b);

/** Of what they had at five minutes, the share gone a week later. Reproduces the paper's 52/14. */
export const forgot = (c: Curve) => (c.r0 - c.r7) / c.r0;
/** ...and the share still there. */
export const kept = (c: Curve) => c.r7 / c.r0;

/** The gap between the two fits on day t, in points. Signed: positive means ASKED leads. */
export const gapAt = (t: number) => (R(ASKED, t) - R(SHOWN, t)) * 100;

/**
 * The day the two fits cross, in closed form from the four anchors:
 *   r0s(1+t)^-bs = r0a(1+t)^-ba   =>   1+t = (r0s/r0a)^(1/(bs-ba))
 * A crossing is GUARANTEED by the data — SHOWN leads at t=0, ASKED leads at t=7 — so only its
 * position comes from the fit, which is why the marker on screen says FITTED.
 */
export const CROSS_DAY = Math.pow(SHOWN.r0 / ASKED.r0, 1 / (SHOWN.b - ASKED.b)) - 1;
export const CROSS_HOURS = CROSS_DAY * 24;

export const pct = (x: number) => `${Math.round(x * 100)}%`;
export const pts = (x: number) => `${x > 0 ? '+' : ''}${Math.round(x)}`;

// =============================================================================
// GEOMETRY — x is log time, y is how much is left.
// =============================================================================
export type Geom = {
  x: number;
  w: number;
  y: number;
  h: number;
  rMin: number;
  rMax: number;
};

export const xOf = (t: number, g: Geom) => g.x + (Math.log(1 + clamp(t, 0, SPAN)) / LOG_SPAN) * g.w;
export const yOf = (r: number, g: Geom) => g.y + g.h * (1 - (r - g.rMin) / (g.rMax - g.rMin));
/** A 0..1 sweep across the panel, back to days. Linear in x, so the play-out is even. */
export const dayAt = (u: number) => Math.pow(1 + SPAN, clamp01(u)) - 1;
/** ...and the inverse, for parking a cue on a known day. */
export const uAt = (t: number) => Math.log(1 + clamp(t, 0, SPAN)) / LOG_SPAN;

/** The fit, sampled into an SVG path, from t=0 out to the swept day. */
export const pathOf = (c: Curve, g: Geom, u: number, steps = 96) => {
  const end = clamp01(u);
  let d = '';
  for (let i = 0; i <= steps; i += 1) {
    const t = dayAt((end * i) / steps);
    d += `${i === 0 ? 'M' : 'L'}${xOf(t, g).toFixed(2)},${yOf(R(c, t), g).toFixed(2)}`;
  }
  return d;
};

// =============================================================================
// DEFS — one fill per track, one hatch for the gap. Mount once per <svg>.
// =============================================================================
export const RecallDefs: React.FC = () => (
  <defs>
    {CURVES.map((c) => (
      <linearGradient key={c.key} id={`rc-fill-${c.key}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={c.color} stopOpacity={0.24} />
        <stop offset="100%" stopColor={c.color} stopOpacity={0} />
      </linearGradient>
    ))}
    <pattern id="rc-gap" width={12} height={12} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width={12} height={12} fill="rgba(245,215,110,0.10)" />
      <line x1={0} y1={0} x2={0} y2={12} stroke="rgba(245,215,110,0.5)" strokeWidth={3} />
    </pattern>
  </defs>
);

// =============================================================================
// THE PANEL — how much is left (y) against when (x).
// =============================================================================
const DAY_TICKS: { t: number; label: string; anchor: 'start' | 'middle' | 'end' }[] = [
  { t: 0, label: 'TONIGHT', anchor: 'start' },
  { t: 1, label: '+1 DAY', anchor: 'middle' },
  { t: 2, label: '+2 DAYS', anchor: 'middle' },
  { t: 7, label: 'TEST DAY', anchor: 'end' },
];

export const Panel: React.FC<{ g: Geom; opacity?: number }> = ({ g, opacity = 1 }) => {
  const rules = [0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
  return (
    <g opacity={opacity}>
      <rect
        x={g.x - 70}
        y={g.y - 70}
        width={g.w + 140}
        height={g.h + 156}
        rx={22}
        fill="rgba(255,255,255,0.016)"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={2}
      />

      <text
        x={g.x - 46}
        y={g.y - 30}
        fill={RECALL_COLORS.dim}
        fontFamily={FONT_BODY}
        fontWeight={600}
        fontSize={24}
        letterSpacing={4}
      >
        % STILL REMEMBERED
      </text>

      {rules.map((r) => (
        <g key={r}>
          <line x1={g.x} y1={yOf(r, g)} x2={g.x + g.w} y2={yOf(r, g)} stroke={RECALL_COLORS.grid} strokeWidth={1} />
          <text
            x={g.x - 18}
            y={yOf(r, g) + 9}
            fill={RECALL_COLORS.dim}
            fontFamily={FONT_MONO}
            fontSize={24}
            textAnchor="end"
          >
            {Math.round(r * 100)}
          </text>
        </g>
      ))}

      {DAY_TICKS.map((d) => {
        const edge = d.t === 0 || d.t === SPAN;
        return (
          <g key={d.label}>
            <line
              x1={xOf(d.t, g)}
              y1={g.y}
              x2={xOf(d.t, g)}
              y2={g.y + g.h}
              stroke={edge ? RECALL_COLORS.gridStrong : RECALL_COLORS.grid}
              strokeWidth={edge ? 2 : 1}
            />
            <text
              x={xOf(d.t, g)}
              y={g.y + g.h + 58}
              fill={RECALL_COLORS.dim}
              fontFamily={FONT_BODY}
              fontWeight={600}
              fontSize={24}
              letterSpacing={1}
              textAnchor={d.anchor}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </g>
  );
};

// =============================================================================
// A TRACK — the fit, drawn as far as the sweep has reached, plus the head that carries it.
// No text rides the head: at the crossing the two heads are, by definition, on top of each
// other, so anything labelled there would collide with itself. Values are printed by EndLabel
// (once the lines have separated) and by Gap (which measures them).
// =============================================================================
export const Track: React.FC<{
  c: Curve;
  g: Geom;
  u: number;
  opacity?: number;
  glow?: number;
}> = ({ c, g, u, opacity = 1, glow = 0 }) => {
  const t = dayAt(u);
  const hx = xOf(t, g);
  const hy = yOf(R(c, t), g);
  const d = pathOf(c, g, u);
  return (
    <g opacity={opacity}>
      <path
        d={`${d}L${hx.toFixed(2)},${(g.y + g.h).toFixed(2)}L${g.x.toFixed(2)},${(g.y + g.h).toFixed(2)}Z`}
        fill={`url(#rc-fill-${c.key})`}
      />
      {glow > 0.01 ? (
        <path d={d} fill="none" stroke={c.edge} strokeWidth={22} opacity={0.2 * glow} strokeLinecap="round" />
      ) : null}
      <path d={d} fill="none" stroke={c.color} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={hx} cy={hy} r={16} fill={RECALL_COLORS.stage} stroke={c.color} strokeWidth={7} />
    </g>
  );
};

/** The sweep's own position, so "time is running" is visible and not just implied. */
export const Playhead: React.FC<{ g: Geom; u: number; opacity?: number }> = ({ g, u, opacity = 1 }) => {
  const x = xOf(dayAt(u), g);
  return (
    <line
      x1={x}
      y1={g.y - 8}
      x2={x}
      y2={g.y + g.h + 8}
      stroke={RECALL_COLORS.accent}
      strokeWidth={2}
      opacity={0.22 * opacity}
    />
  );
};

/** Name + final number, parked at the day-7 end, outward from the line it belongs to. */
export const EndLabel: React.FC<{ c: Curve; g: Geom; lx: number; opacity?: number }> = ({
  c,
  g,
  lx,
  opacity = 1,
}) => {
  if (opacity <= 0.01) return null;
  const y = yOf(c.r7, g);
  const above = c.key === 'asked';
  return (
    <g opacity={opacity}>
      <text
        x={lx}
        y={above ? y - 86 : y + 36}
        fill={RECALL_COLORS.text}
        fontFamily={FONT_BODY}
        fontWeight={600}
        fontSize={29}
        letterSpacing={6}
        textAnchor="end"
      >
        {c.name}
      </text>
      <text
        x={lx}
        y={above ? y - 34 : y + 90}
        fill={c.color}
        fontFamily={FONT_DISPLAY}
        fontWeight={700}
        fontSize={58}
        textAnchor="end"
      >
        {pct(c.r7)}
      </text>
    </g>
  );
};

/** The value of a fit on day `t`, printed beside its head. Read off R(), never typed. */
export const PointLabel: React.FC<{ c: Curve; g: Geom; t: number; dx?: number; opacity?: number }> = ({
  c,
  g,
  t,
  dx = 42,
  opacity = 1,
}) => {
  if (opacity <= 0.01) return null;
  return (
    <text
      x={xOf(t, g) + dx}
      y={yOf(R(c, t), g) + 18}
      opacity={opacity}
      fill={c.color}
      fontFamily={FONT_DISPLAY}
      fontWeight={700}
      fontSize={52}
    >
      {pct(R(c, t))}
    </text>
  );
};

// =============================================================================
// THE GAP — measured between the two lines as they are actually drawn, on day `t`.
// =============================================================================
export const Gap: React.FC<{
  g: Geom;
  t: number;
  opacity?: number;
  side?: 'left' | 'right';
  caption?: string;
  dx?: number;
}> = ({ g, t, opacity = 1, side = 'left', caption = 'POINTS', dx = 42 }) => {
  if (opacity <= 0.01) return null;
  const x = xOf(t, g);
  const ys = yOf(R(SHOWN, t), g);
  const ya = yOf(R(ASKED, t), g);
  const top = Math.min(ys, ya);
  const bot = Math.max(ys, ya);
  const lead = gapAt(t);
  const color = lead >= 0 ? RECALL_COLORS.asked : RECALL_COLORS.shown;
  const tx = side === 'left' ? x - dx : x + dx;
  const anchor = side === 'left' ? 'end' : 'start';
  return (
    <g opacity={opacity}>
      <rect x={x - 14} y={top} width={28} height={Math.max(0, bot - top)} fill="url(#rc-gap)" rx={6} />
      <line x1={x - 24} y1={top} x2={x + 24} y2={top} stroke={color} strokeWidth={4} strokeLinecap="round" />
      <line x1={x - 24} y1={bot} x2={x + 24} y2={bot} stroke={color} strokeWidth={4} strokeLinecap="round" />
      <text
        x={tx}
        y={top + 46}
        fill={color}
        fontFamily={FONT_DISPLAY}
        fontWeight={700}
        fontSize={46}
        textAnchor={anchor}
      >
        {pts(lead)}
      </text>
      <text
        x={tx}
        y={top + 80}
        fill={RECALL_COLORS.dim}
        fontFamily={FONT_BODY}
        fontWeight={600}
        fontSize={23}
        letterSpacing={3}
        textAnchor={anchor}
      >
        {caption}
      </text>
    </g>
  );
};

// =============================================================================
// THE CROSSING — solved, not placed. The label says which of the two it is.
// =============================================================================
export const Cross: React.FC<{ g: Geom; opacity?: number }> = ({ g, opacity = 1 }) => {
  if (opacity <= 0.01) return null;
  const x = xOf(CROSS_DAY, g);
  const y = yOf(R(SHOWN, CROSS_DAY), g);
  return (
    <g opacity={opacity}>
      <line
        x1={x}
        y1={y}
        x2={x}
        y2={g.y + g.h}
        stroke={RECALL_COLORS.accent}
        strokeWidth={3}
        strokeDasharray="9 11"
        opacity={0.7}
      />
      <circle cx={x} cy={y} r={25} fill="none" stroke={RECALL_COLORS.accent} strokeWidth={5} />
      <circle cx={x} cy={y} r={9} fill={RECALL_COLORS.accent} />
      <text x={x + 38} y={y - 118} fill={RECALL_COLORS.accent} fontFamily={FONT_DISPLAY} fontWeight={700} fontSize={54}>
        {`${Math.round(CROSS_HOURS)} H`}
      </text>
      <text x={x + 38} y={y - 82} fill={RECALL_COLORS.dim} fontFamily={FONT_MONO} fontSize={23} letterSpacing={2}>
        FITTED CROSSING
      </text>
    </g>
  );
};

// =============================================================================
// A CHIP — the panel every readout in this engine is printed on.
// =============================================================================
export const Chip: React.FC<{
  x: number;
  y: number;
  w: number;
  lines: string[];
  color?: string;
  opacity?: number;
}> = ({ x, y, w, lines, color = RECALL_COLORS.accent, opacity = 1 }) => {
  if (opacity <= 0.01) return null;
  const h = 28 + lines.length * 40;
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={h} rx={16} fill="rgba(12,14,20,0.92)" stroke={`${color}55`} strokeWidth={2} />
      <rect x={x} y={y} width={8} height={h} rx={4} fill={color} />
      {lines.map((l, i) => (
        <text
          key={i}
          x={x + 26}
          y={y + 44 + i * 40}
          fill={i === 0 ? color : RECALL_COLORS.text}
          fontFamily={i === 0 ? FONT_BODY : FONT_DISPLAY}
          fontWeight={600}
          fontSize={i === 0 ? 26 : 34}
          letterSpacing={i === 0 ? 4 : 0}
        >
          {l}
        </text>
      ))}
    </g>
  );
};

// =============================================================================
// TWO BAR READOUTS, both driven straight off CURVES — the same two objects that drew the
// lines, so a bar can never describe a different study from the curve above it.
// =============================================================================
const BarPair: React.FC<{
  x: number;
  y: number;
  w: number;
  title: string;
  frac: (c: Curve) => number;
  value: (c: Curve) => string;
  show: number;
  opacity: number;
  rowH: number;
  barH: number;
}> = ({ x, y, w, title, frac, value, show, opacity, rowH, barH }) => (
  <g opacity={opacity}>
    <text
      x={x - 100}
      y={y - 20}
      fill={RECALL_COLORS.dim}
      fontFamily={FONT_BODY}
      fontWeight={600}
      fontSize={25}
      letterSpacing={4}
    >
      {title}
    </text>
    {CURVES.map((c, i) => {
      const by = y + i * rowH;
      return (
        <g key={c.key}>
          <rect x={x} y={by} width={w} height={barH} rx={10} fill="rgba(255,255,255,0.05)" />
          <rect x={x} y={by} width={Math.max(8, w * frac(c) * clamp01(show))} height={barH} rx={10} fill={c.color} opacity={0.85} />
          <text
            x={x - 22}
            y={by + barH / 2 + 9}
            fill={RECALL_COLORS.text}
            fontFamily={FONT_BODY}
            fontWeight={600}
            fontSize={25}
            letterSpacing={4}
            textAnchor="end"
          >
            {c.name}
          </text>
          <text
            x={x + w + 24}
            y={by + barH / 2 + 13}
            fill={c.color}
            fontFamily={FONT_DISPLAY}
            fontWeight={700}
            fontSize={40}
          >
            {value(c)}
          </text>
        </g>
      );
    })}
  </g>
);

/** How much of what they had was gone by test day. 52% against 14%, computed off the anchors. */
export const LossBars: React.FC<{ x: number; y: number; w: number; opacity?: number; show?: number }> = ({
  x,
  y,
  w,
  opacity = 1,
  show = 1,
}) => {
  if (opacity <= 0.01) return null;
  return (
    <BarPair
      x={x}
      y={y}
      w={w}
      title="FORGOTTEN BY TEST DAY"
      frac={forgot}
      value={(c) => pct(forgot(c))}
      show={show}
      opacity={opacity}
      rowH={92}
      barH={46}
    />
  );
};

export const CONF_MAX = 7;

/** The twist: rated before anyone knew what they would remember. */
export const ConfBars: React.FC<{ x: number; y: number; w: number; opacity?: number; show?: number }> = ({
  x,
  y,
  w,
  opacity = 1,
  show = 1,
}) => {
  if (opacity <= 0.01) return null;
  return (
    <BarPair
      x={x}
      y={y}
      w={w}
      title={'"I WILL REMEMBER THIS"   RATED 1-7'}
      frac={(c) => c.conf / CONF_MAX}
      value={(c) => c.conf.toFixed(1)}
      show={show}
      opacity={opacity}
      rowH={92}
      barH={46}
    />
  );
};

// =============================================================================
// SOURCE LINE — this engine prints where its anchors came from, always.
// =============================================================================
export const Source: React.FC<{ x: number; y: number; opacity?: number }> = ({ x, y, opacity = 1 }) => (
  <text
    x={x}
    y={y}
    opacity={opacity * 0.7}
    fill={RECALL_COLORS.dim}
    fontFamily={FONT_MONO}
    fontSize={21}
    letterSpacing={1}
    textAnchor="middle"
  >
    ROEDIGER &amp; KARPICKE 2006 · PSYCH SCI · EXP. 2 · N=180
  </text>
);
