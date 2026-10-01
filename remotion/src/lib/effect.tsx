// =============================================================================
// lib/effect.tsx — THE EFFECT-SIZE PANEL (a claim is a number, an interval, and a k)
//
// Most parenting advice is a sentence. This engine refuses to draw a sentence: the only thing
// it knows how to render is an ESTIMATE — a measured effect size, the 95% interval around it,
// and the number of studies it came from. If a claim cannot supply all three it cannot appear
// on screen, which is the whole point of building it this way.
//
// ONE AXIS FOR THE WHOLE VIDEO. Every bar in a shot is drawn against the same d scale and the
// same zero line, so heights are comparable across every beat — the viewer is never asked to
// re-calibrate their eye between cuts, and a bar that looks twice as tall IS twice as big.
//
// THE INTERVAL IS NOT DECORATION. It is how the panel tells the truth about a null result:
// when an estimate's whisker straddles the zero line, the picture is saying "indistinguishable
// from nothing" at the same moment the narration says it. A bar alone could not make that
// argument, and a bar alone is what would have let us cheat.
//
// Same ethos as prob.tsx's seeded trials, recall.tsx's fitted power law and bone.tsx's summed
// count: never assert what the code can compute, and show the uncertainty you actually have.
// =============================================================================
import React from 'react';
import { Easing } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const EFFECT_COLORS = {
  stage: '#0b0e14',
  grid: 'rgba(255,255,255,0.06)',
  axis: 'rgba(255,255,255,0.18)',
  zero: '#8b93a7',
  dim: '#8b93a7',
  text: '#e8ecf5',
  weak: '#3f7f77', // a real but small effect
  strong: '#4db8a8', // brand teal — the peak
  edge: '#7ad8c8',
  null: '#e8879f', // brand pink — the one that lands on nothing
  accent: '#f5d76e',
} as const;

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// =============================================================================
// THE ESTIMATES — typed once, here, straight off the source tables. Every label, bar height,
// whisker and ratio in the shot is read back off these objects.
// =============================================================================
export type Est = {
  key: string;
  /** what it says on the axis */
  label: string;
  /** the second line under the axis label */
  sub?: string;
  /** Cohen's d */
  d: number;
  /** 95% confidence interval */
  lo: number;
  hi: number;
  /** number of effect sizes / studies behind it — printed, always */
  k: number;
  color: string;
};

/**
 * Patall, Cooper & Robinson (2008), "The effects of choice on intrinsic motivation and related
 * outcomes: a meta-analysis of research findings", Psychological Bulletin 134(2), 270-300.
 * 41 studies, 46 effect sizes on intrinsic motivation; overall d = 0.30 (95% CI 0.25-0.35).
 * All values below are the FIXED-EFFECTS column of that paper's Tables 4 and 5.
 */
export const OVERALL = { d: 0.3, lo: 0.25, hi: 0.35, k: 46 };

/** Table 5, "Sample" — the moderator that makes this a video about children. */
export const ADULTS: Est = {
  key: 'adults',
  label: 'AN ADULT',
  sub: 'given the choice',
  d: 0.25,
  lo: 0.2,
  hi: 0.31,
  k: 33,
  color: EFFECT_COLORS.weak,
};
export const CHILDREN: Est = {
  key: 'children',
  label: 'A CHILD',
  sub: 'given the choice',
  d: 0.55,
  lo: 0.42,
  hi: 0.67,
  k: 13,
  color: EFFECT_COLORS.strong,
};

/**
 * Table 5, "No. of choices (Analysis 2)" — Q(2) = 27.66, p < .01. This is the strong moderator
 * and the spine of the video: the effect is an inverted U in how OFTEN the choice is offered.
 */
export const ONCE: Est = {
  key: 'once',
  label: 'ONCE',
  sub: 'one choice',
  d: 0.21,
  lo: 0.14,
  hi: 0.28,
  k: 21,
  color: EFFECT_COLORS.weak,
};
export const FEW: Est = {
  key: 'few',
  label: 'A FEW TIMES',
  sub: '2-4 choices',
  d: 0.61,
  lo: 0.48,
  hi: 0.75,
  k: 12,
  color: EFFECT_COLORS.strong,
};
export const MANY: Est = {
  key: 'many',
  label: 'EVERY TIME',
  sub: '6+ choices',
  d: 0.32,
  lo: 0.22,
  hi: 0.43,
  k: 12,
  color: EFFECT_COLORS.weak,
};

/**
 * Table 5, "Reward" — an external reward given AFTER the choice. The interval straddles zero,
 * which is the honest form of the claim and the reason the whisker is drawn at all.
 */
export const REWARD: Est = {
  key: 'reward',
  label: '+ A REWARD',
  sub: 'paid afterwards',
  d: -0.01,
  lo: -0.15,
  hi: 0.12,
  k: 5,
  color: EFFECT_COLORS.null,
};
/** ...against the same paper's no-reward cell, so the collapse is a like-for-like comparison. */
export const NO_REWARD: Est = {
  key: 'noreward',
  label: 'NO REWARD',
  sub: 'choice alone',
  d: 0.35,
  lo: 0.29,
  hi: 0.41,
  k: 40,
  color: EFFECT_COLORS.strong,
};

/** DERIVED, so the narration cannot drift from the table: 2.90x and 2.20x. */
export const FEW_OVER_ONCE = FEW.d / ONCE.d;
export const CHILD_OVER_ADULT = CHILDREN.d / ADULTS.d;

// =============================================================================
// GEOMETRY — one d scale, one zero line, for the whole video.
// =============================================================================
export type Geom = { x: number; w: number; y: number; h: number; dMin: number; dMax: number };

export const yOf = (d: number, g: Geom) => g.y + g.h * ((g.dMax - d) / (g.dMax - g.dMin));

/** n bars, centred in the panel, each slot the same width whatever n is. */
export const slotX = (i: number, n: number, g: Geom) => {
  const pitch = g.w / 4; // always laid out on a 4-slot pitch so bars never resize between beats
  const total = pitch * n;
  return g.x + (g.w - total) / 2 + pitch * (i + 0.5);
};

export const fmtD = (d: number) => (d < 0 ? `−${Math.abs(d).toFixed(2)}` : d.toFixed(2));

// =============================================================================
// THE PANEL — grid, axis, and the zero line the whole argument turns on.
// =============================================================================
export const Panel: React.FC<{ g: Geom; opacity?: number }> = ({ g, opacity = 1 }) => {
  const ticks = [0.8, 0.6, 0.4, 0.2, 0];
  return (
    <g opacity={opacity}>
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={g.x}
            y1={yOf(t, g)}
            x2={g.x + g.w}
            y2={yOf(t, g)}
            stroke={t === 0 ? EFFECT_COLORS.axis : EFFECT_COLORS.grid}
            strokeWidth={t === 0 ? 0 : 1.5}
          />
          <text
            x={g.x - 16}
            y={yOf(t, g) + 9}
            textAnchor="end"
            fontFamily={FONT_MONO}
            fontSize={24}
            fill={t === 0 ? EFFECT_COLORS.zero : 'rgba(139,147,167,0.6)'}
          >
            {t.toFixed(1)}
          </text>
        </g>
      ))}
    </g>
  );
};

/** The line every bar is measured from, and the one the last bar has to sit on. */
export const ZeroLine: React.FC<{ g: Geom; opacity?: number; lit?: number }> = ({ g, opacity = 1, lit = 0 }) => (
  <g opacity={opacity}>
    <line
      x1={g.x}
      y1={yOf(0, g)}
      x2={g.x + g.w}
      y2={yOf(0, g)}
      stroke={mixHex(EFFECT_COLORS.zero, EFFECT_COLORS.null, lit)}
      strokeWidth={2 + 2 * lit}
    />
    <text
      x={g.x + g.w}
      y={yOf(0, g) - 16}
      textAnchor="end"
      fontFamily={FONT_BODY}
      fontWeight={600}
      fontSize={24}
      letterSpacing={5}
      fill={mixHex(EFFECT_COLORS.zero, EFFECT_COLORS.null, lit)}
      opacity={0.55 + 0.45 * lit}
    >
      NO EFFECT
    </text>
  </g>
);

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mixHex = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  const c = A.map((v, i) => Math.round(mix(v, B[i], clamp01(t))));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

// =============================================================================
// THE BAR — an estimate, drawn with everything it is required to carry: the value, the 95%
// interval, and the k. `grow` animates the bar out of the zero line, so a bar always ARRIVES
// from the thing it is being compared against.
// =============================================================================
export const Bar: React.FC<{
  est: Est;
  g: Geom;
  i: number;
  n: number;
  /** 0..1 — the bar rising out of the zero line */
  grow?: number;
  opacity?: number;
  /** 0..1 — dims everything except this bar's own colour */
  focus?: number;
  /** show the 95% whisker */
  ci?: number;
}> = ({ est, g, i, n, grow = 1, opacity = 1, focus = 0, ci = 1 }) => {
  if (opacity <= 0.01) return null;
  const cx = slotX(i, n, g);
  const bw = Math.min(178, g.w / 4 - 34);
  const y0 = yOf(0, g);
  const d = est.d * clamp01(grow);
  const y1 = yOf(d, g);
  const up = d >= 0;
  const top = Math.min(y0, y1);
  const hgt = Math.max(1.5, Math.abs(y1 - y0));
  const col = mixHex(est.color, EFFECT_COLORS.edge, focus * 0.5);

  return (
    <g opacity={opacity}>
      <rect x={cx - bw / 2} y={top} width={bw} height={hgt} rx={7} fill={col} opacity={0.92} />
      <rect
        x={cx - bw / 2}
        y={up ? top : y0}
        width={bw}
        height={4}
        rx={2}
        fill={EFFECT_COLORS.edge}
        opacity={up ? 0.9 : 0}
      />

      {/* the 95% interval — the reason a null result cannot be drawn as a small win */}
      {ci > 0.01 ? (
        <g opacity={ci * clamp01(grow * 2 - 1)}>
          <line
            x1={cx}
            y1={yOf(est.lo, g)}
            x2={cx}
            y2={yOf(est.hi, g)}
            stroke={EFFECT_COLORS.text}
            strokeWidth={3}
            opacity={0.75}
          />
          {[est.lo, est.hi].map((v) => (
            <line
              key={v}
              x1={cx - 22}
              y1={yOf(v, g)}
              x2={cx + 22}
              y2={yOf(v, g)}
              stroke={EFFECT_COLORS.text}
              strokeWidth={3}
              opacity={0.75}
            />
          ))}
        </g>
      ) : null}

      {/* The value, ALWAYS above the whisker's top cap whatever the sign. Hanging a negative
          bar's label under its interval puts it straight through the axis labels below. */}
      <text
        x={cx}
        y={yOf(est.hi, g) - 22}
        textAnchor="middle"
        fontFamily={FONT_DISPLAY}
        fontWeight={700}
        fontSize={56}
        fill={col}
        opacity={clamp01(grow * 2 - 0.6)}
      >
        {fmtD(est.d)}
      </text>

      {/* the label and the k, under the axis */}
      <text
        x={cx}
        y={g.y + g.h + 48}
        textAnchor="middle"
        fontFamily={FONT_BODY}
        fontWeight={600}
        fontSize={27}
        letterSpacing={2}
        fill={col}
      >
        {est.label}
      </text>
      {est.sub ? (
        <text
          x={cx}
          y={g.y + g.h + 84}
          textAnchor="middle"
          fontFamily={FONT_BODY}
          fontWeight={500}
          fontSize={24}
          fill="rgba(139,147,167,0.85)"
        >
          {est.sub}
        </text>
      ) : null}
      <text
        x={cx}
        y={g.y + g.h + 120}
        textAnchor="middle"
        fontFamily={FONT_MONO}
        fontSize={22}
        fill="rgba(139,147,167,0.7)"
      >
        k={est.k}
      </text>
    </g>
  );
};

/** A short caption bound to one bar — used for the twist, where a bar needs a sentence. */
export const Tag: React.FC<{
  g: Geom;
  i: number;
  n: number;
  text: string;
  color?: string;
  dy?: number;
  opacity?: number;
}> = ({ g, i, n, text, color = EFFECT_COLORS.accent, dy = 0, opacity = 1 }) => {
  if (opacity <= 0.01) return null;
  const cx = slotX(i, n, g);
  const w = 330;
  return (
    <g opacity={opacity}>
      <rect x={cx - w / 2} y={yOf(0, g) + 62 + dy} width={w} height={62} rx={14} fill="rgba(10,14,22,0.92)" stroke={`${color}66`} strokeWidth={2} />
      <text
        x={cx}
        y={yOf(0, g) + 103 + dy}
        textAnchor="middle"
        fontFamily={FONT_BODY}
        fontWeight={600}
        fontSize={28}
        fill={color}
      >
        {text}
      </text>
    </g>
  );
};

/** The band above the panel: what the axis actually measures, in words. */
export const AxisTitle: React.FC<{ y: number; text: string; sub?: string; opacity?: number }> = ({
  y,
  text,
  sub,
  opacity = 1,
}) => (
  <g opacity={opacity}>
    <text
      x={540}
      y={y}
      textAnchor="middle"
      fontFamily={FONT_BODY}
      fontWeight={600}
      fontSize={30}
      letterSpacing={4}
      fill={EFFECT_COLORS.accent}
    >
      {text}
    </text>
    {sub ? (
      <text
        x={540}
        y={y + 40}
        textAnchor="middle"
        fontFamily={FONT_BODY}
        fontWeight={500}
        fontSize={27}
        fill="rgba(232,236,245,0.7)"
      >
        {sub}
      </text>
    ) : null}
  </g>
);

export const Source: React.FC<{ y: number; opacity?: number }> = ({ y, opacity = 0.85 }) => (
  <g opacity={opacity}>
    <text x={540} y={y} textAnchor="middle" fontFamily={FONT_MONO} fontSize={20} fill="rgba(139,147,167,0.92)">
      CHOICE: PATALL, COOPER &amp; ROBINSON, PSYCH BULLETIN 2008 · 41 STUDIES
    </text>
    <text x={540} y={y + 28} textAnchor="middle" fontFamily={FONT_MONO} fontSize={20} fill="rgba(139,147,167,0.92)">
      d = COHEN&apos;S d · WHISKERS ARE 95% CI · k = EFFECT SIZES PER BAR
    </text>
  </g>
);
