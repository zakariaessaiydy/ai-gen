// =============================================================================
// lib/avoid.tsx — THE AVOIDANCE ENGINE (a week of mornings, each one a single number)
//
// A morning is ONE SCALAR: `peak`, the height the fear reaches at the moment of confrontation
// (`DOOR`). Everything drawn on a row is derived from it — the shared climb both answers make,
// the cliff that a rescue cuts into it, the crest and the long settle that staying produces,
// and the multiple printed under each reply. Nothing on a row is keyframed independently, so
// no two things on a row can disagree.
//
// The engine's whole argument is the BETWEEN-MORNING MAP. It is two lines long:
//
//     rescue:  peak *= 1 + UP      escape at the door is negatively reinforced -> tomorrow is
//                                  a bigger morning (Mowrer's two-factor theory; Kearney &
//                                  Silverman's functional model of school refusal)
//     stay:    peak *= 1 - DOWN    the fear that is not escaped rises, crests and comes down
//                                  inside the situation, and the next one starts lower
//
// WHAT IS MODELLED AND WHAT IS CLAIMED. The SIGN of each map is the documented part. The RATES
// are a stated premise, not an effect size: UP and DOWN are chosen so that five mornings land
// on exactly x2.0 and exactly x0.5, and the plot carries a MODEL tag for the whole video. The
// video never speaks a percentage, because no percentage is being claimed.
//
// The two multiples are MEASURED back off the sampled curves (max of morning 5 over max of
// morning 1, per branch), never typed — so a mis-tuned constant prints a wrong number instead
// of hiding behind a right-looking one. Same ethos as prob.tsx's seeded trials, map.tsx's real
// Mercator, orbit.tsx's Verlet integrator, cycle.tsx's conserved particles, order.tsx's
// replayed swaps and phase.tsx's read-back debt: never assert what the code can compute.
//
// TIME CONVENTION: `u` is a morning's OWN clock, 0 = wake, DOOR = the moment at the door,
// 1 = mid-morning. It is not wall-clock time and is never labelled as any number of minutes.
// =============================================================================
import React from 'react';
import { Easing } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const AVOID_COLORS = {
  stage: '#0b0e14',
  grid: 'rgba(255,255,255,0.05)',
  axis: 'rgba(255,255,255,0.13)',
  dim: '#8b93a7',
  text: '#e8ecf5',
  rescue: '#e8879f', // pink — the escape, and everything that feeds it
  stay: '#4db8a8', // teal — going in
  shared: '#c9d1d9', // the climb both answers make, before there is a branch
  warn: '#f5d76e',
  accent: '#f5d76e',
} as const;

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

// =============================================================================
// THE MODEL — six constants, and two of them are the argument.
// =============================================================================
export const MORNINGS = 5;
/** Where in a morning the confrontation happens. */
export const DOOR = 0.42;
/** A rescue ends the fear almost instantly — that speed is the reward. */
export const TAU_RELIEF = 0.055;
/** Going in ends it too, just slowly, and by itself. */
export const TAU_SETTLE = 0.22;
/** ...but FIRST it gets worse than the rescue ever did. This is not a rhetorical flourish:
 *  at the door, going in IS harder in the moment than being let off, and a video that hid
 *  that would lose every parent who has actually tried it. */
export const CREST = 1.1;
export const CREST_U = 0.07;

/** Escape at the door is rewarded, so the next morning starts higher... */
export const UP = Math.pow(2, 1 / 4) - 1;
/** ...and a morning that is not escaped starts the next one lower. */
export const DOWN = 1 - Math.pow(0.5, 1 / 4);

export type Branch = 'rescue' | 'stay';

/** Morning `i`'s peak, from the iterated map. Morning 0 is 1 by definition — the axis is
 *  relative and the video says so. */
export const peakAt = (i: number, b: Branch) => Math.pow(b === 'rescue' ? 1 + UP : 1 - DOWN, i);

/** The fear at time `u` of a morning whose peak is `peak`. Both branches share everything up
 *  to the door — that shared stretch is the point, drawn in one neutral stroke. */
export const fearAt = (u: number, peak: number, b: Branch) => {
  if (u <= DOOR) return peak * smooth(u / DOOR);
  const v = u - DOOR;
  if (b === 'rescue') return peak * Math.exp(-v / TAU_RELIEF);
  if (v <= CREST_U) return peak * (1 + (CREST - 1) * smooth(v / CREST_U));
  return peak * CREST * Math.exp(-(v - CREST_U) / TAU_SETTLE);
};

export type Pt = { u: number; a: number };
const SAMPLES = 160;

export const curveOf = (i: number, b: Branch): Pt[] => {
  const peak = peakAt(i, b);
  const pts: Pt[] = [];
  for (let s = 0; s <= SAMPLES; s++) {
    const u = s / SAMPLES;
    pts.push({ u, a: fearAt(u, peak, b) });
  }
  return pts;
};

export const maxOf = (pts: Pt[]) => pts.reduce((m, p) => Math.max(m, p.a), 0);

/** THE NUMBER UNDER EACH REPLY — morning 5 against morning 1, measured off the drawn curves.
 *  Not a constant, not a caption: if the map above is retuned, this follows it. */
export const multipleOf = (b: Branch) => maxOf(curveOf(MORNINGS - 1, b)) / maxOf(curveOf(0, b));
export const fmtMultiple = (x: number) => `×${x.toFixed(1)}`;

/** The shared y scale of the STACK — big enough for the tallest curve the video ever draws,
 *  which is why morning 1 only uses half of its row. */
export const YMAX = 2.05;

export const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

// =============================================================================
// GEOMETRY — x is one morning, y is the week.
//
// The video has two of these and LERPS BETWEEN THEM. A morning drawn 108px tall is a fact
// nobody can read, so the setup grows row 0 into a 620px hero plot and the reveal shrinks it
// back into the stack as the other four arrive. It is a layout morph rather than a camera
// because a camera at this zoom would push 60% of the x axis off the side of the phone.
// =============================================================================
export type Geom = { x: number; w: number; y: number; rowH: number; plotH: number; ymax: number };

export const STACK: Geom = { x: 96, w: 888, y: 364, rowH: 140, plotH: 118, ymax: YMAX };
/** The hero plot carries its OWN y scale. That is not a cheat: only morning 1 is on screen at
 *  hero scale, so there is nothing to mis-compare, and the rescale is hidden inside a much
 *  larger shrink when the plot folds back into the stack. Sized at 1.30 rather than 2.05 so a
 *  curve that peaks at 1.0 fills its plot instead of using the bottom half of it. */
export const BIG: Geom = { x: 96, w: 888, y: 430, rowH: 140, plotH: 612, ymax: 1.3 };

export const mixGeom = (a: Geom, b: Geom, t: number): Geom => ({
  x: mix(a.x, b.x, t),
  w: mix(a.w, b.w, t),
  y: mix(a.y, b.y, t),
  rowH: mix(a.rowH, b.rowH, t),
  plotH: mix(a.plotH, b.plotH, t),
  ymax: mix(a.ymax, b.ymax, t),
});

export const xOf = (u: number, g: Geom) => g.x + u * g.w;
export const baseY = (i: number, g: Geom) => g.y + i * g.rowH + g.plotH;
export const yOf = (a: number, i: number, g: Geom) => baseY(i, g) - (a / g.ymax) * g.plotH;

/** Slice a sampled curve to u in [from, to] and emit a polyline. `to` is what animates, so a
 *  curve DRAWS itself rather than fading in — the shape arriving is the argument. */
export const pathOf = (pts: Pt[], i: number, g: Geom, from: number, to: number) => {
  const seg = pts.filter((p) => p.u >= from - 1e-9 && p.u <= to + 1e-9);
  if (seg.length < 2) return '';
  let d = `M ${xOf(seg[0].u, g).toFixed(2)} ${yOf(seg[0].a, i, g).toFixed(2)}`;
  for (let k = 1; k < seg.length; k++) d += ` L ${xOf(seg[k].u, g).toFixed(2)} ${yOf(seg[k].a, i, g).toFixed(2)}`;
  return d;
};

/** ...and the same slice closed down to the baseline, for the fill under it. */
export const areaOf = (pts: Pt[], i: number, g: Geom, from: number, to: number) => {
  const seg = pts.filter((p) => p.u >= from - 1e-9 && p.u <= to + 1e-9);
  if (seg.length < 2) return '';
  const b = baseY(i, g).toFixed(2);
  let d = `M ${xOf(seg[0].u, g).toFixed(2)} ${b}`;
  for (const p of seg) d += ` L ${xOf(p.u, g).toFixed(2)} ${yOf(p.a, i, g).toFixed(2)}`;
  d += ` L ${xOf(seg[seg.length - 1].u, g).toFixed(2)} ${b} Z`;
  return d;
};

// =============================================================================
// DEFS — mount once per <svg>.
// =============================================================================
export const AvoidDefs: React.FC = () => (
  <defs>
    <linearGradient id="av-rescue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="rgba(232,135,159,0.34)" />
      <stop offset="100%" stopColor="rgba(232,135,159,0.02)" />
    </linearGradient>
    <linearGradient id="av-stay" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="rgba(77,184,168,0.32)" />
      <stop offset="100%" stopColor="rgba(77,184,168,0.02)" />
    </linearGradient>
    <marker id="av-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill={AVOID_COLORS.rescue} />
    </marker>
  </defs>
);

// =============================================================================
// A MORNING ROW — the baseline, the day label, and the two branches over one shared climb.
//
// `rise`, `rescue` and `stay` are DRAW EXTENTS in 0..1, not opacities. `shared` is true only
// for morning 1, where both answers have the same peak and therefore the same climb: drawing
// that stretch once, in neutral grey, is what makes the door read as a fork rather than as
// two unrelated lines. On every later morning the peaks differ, so each branch draws its own.
// =============================================================================
export const MorningRow: React.FC<{
  i: number;
  g: Geom;
  o?: number;
  shared?: boolean;
  rise?: number; // 0..1 of the stretch up to the door
  rescue?: number; // 0..1 of this branch's own drawn extent
  stay?: number;
  fills?: number;
  label?: string; // row label — defaults to the weekday, override for a non-weekly series
}> = ({ i, g, o = 1, shared = false, rise = 1, rescue = 1, stay = 1, fills = 1, label }) => {
  if (o <= 0.01) return null;
  const b = baseY(i, g);
  const pr = curveOf(i, 'rescue');
  const ps = curveOf(i, 'stay');
  // On morning 1 the branches begin AT the door; elsewhere they carry their own climb.
  const from = shared ? DOOR : 0;
  const rTo = shared ? mix(DOOR, 1, clamp01(rescue)) : clamp01(rescue);
  const sTo = shared ? mix(DOOR, 1, clamp01(stay)) : clamp01(stay);
  const riseTo = DOOR * clamp01(rise);
  return (
    <g opacity={o}>
      <line x1={g.x} y1={b} x2={g.x + g.w} y2={b} stroke={AVOID_COLORS.axis} strokeWidth={2} />
      <text
        x={g.x - 12}
        y={b - 2}
        textAnchor="end"
        fontFamily={FONT_MONO}
        fontSize={22}
        fontWeight={500}
        letterSpacing={1.5}
        fill={AVOID_COLORS.dim}
      >
        {label ?? DAYS[i]}
      </text>

      {fills > 0.01 ? (
        <>
          <path d={areaOf(pr, i, g, from, rTo)} fill="url(#av-rescue)" opacity={fills} />
          <path d={areaOf(ps, i, g, from, sTo)} fill="url(#av-stay)" opacity={fills} />
        </>
      ) : null}

      {shared && riseTo > 0.002 ? (
        <path
          d={pathOf(pr, i, g, 0, riseTo)}
          fill="none"
          stroke={AVOID_COLORS.shared}
          strokeWidth={5}
          strokeLinecap="round"
          opacity={0.72}
        />
      ) : null}

      <path d={pathOf(ps, i, g, from, sTo)} fill="none" stroke={AVOID_COLORS.stay} strokeWidth={5} strokeLinecap="round" />
      <path d={pathOf(pr, i, g, from, rTo)} fill="none" stroke={AVOID_COLORS.rescue} strokeWidth={5} strokeLinecap="round" />
    </g>
  );
};

// =============================================================================
// THE DOOR — the dashed spine every morning is cut by. In the hero plot it is labelled; in
// the stack it needs no label, because by then it is the only vertical line on screen.
// =============================================================================
export const DoorLine: React.FC<{ g: Geom; top: number; bottom: number; label?: number; text?: string }> = ({
  g,
  top,
  bottom,
  label = 0,
  text = 'THE DOOR',
}) => {
  const x = xOf(DOOR, g);
  return (
    <g>
      <line x1={x} y1={top} x2={x} y2={bottom} stroke="rgba(255,255,255,0.30)" strokeWidth={2} strokeDasharray="10 10" />
      {label > 0.01 ? (
        <text
          x={x}
          y={top - 16}
          textAnchor="middle"
          fontFamily={FONT_BODY}
          fontSize={26}
          fontWeight={600}
          letterSpacing={5}
          fill={AVOID_COLORS.text}
          opacity={label}
        >
          {text}
        </text>
      ) : null}
    </g>
  );
};

/** The morning's own clock, ends only. Hero plot only — in the stack it is noise. */
export const MorningAxis: React.FC<{ g: Geom; row: number; o?: number; label?: string }> = ({
  g,
  row,
  o = 1,
  label = 'WAKE',
}) => {
  if (o <= 0.01) return null;
  const b = baseY(row, g) + 26;
  const t = (x: number, anchor: 'start' | 'end', s: string) => (
    <text x={x} y={b} textAnchor={anchor} fontFamily={FONT_MONO} fontSize={21} letterSpacing={2} fill={AVOID_COLORS.dim}>
      {s}
    </text>
  );
  return <g opacity={o}>{t(g.x, 'start', label)}</g>;
};

// =============================================================================
// THE RELIEF MEASURE — the drop, drawn as a size. It is the reward, so it gets a number's
// worth of attention without ever being given a number.
// =============================================================================
export const ReliefMeasure: React.FC<{ g: Geom; row: number; o?: number }> = ({ g, row, o = 1 }) => {
  if (o <= 0.01) return null;
  const u = DOOR + 0.085;
  const x = xOf(u, g);
  const top = yOf(peakAt(row, 'rescue'), row, g);
  const bot = baseY(row, g);
  return (
    <g opacity={o}>
      <line x1={x} y1={top} x2={x} y2={bot} stroke={AVOID_COLORS.rescue} strokeWidth={3} />
      <line x1={x - 16} y1={top} x2={x + 16} y2={top} stroke={AVOID_COLORS.rescue} strokeWidth={3} />
      <line x1={x - 16} y1={bot} x2={x + 16} y2={bot} stroke={AVOID_COLORS.rescue} strokeWidth={3} />
      <text
        x={x + 28}
        y={(top + bot) / 2 + 9}
        fontFamily={FONT_DISPLAY}
        fontSize={38}
        fontWeight={700}
        letterSpacing={4}
        fill={AVOID_COLORS.rescue}
      >
        RELIEF
      </text>
    </g>
  );
};

// =============================================================================
// THE REWARD ARROW — the reinforcement, drawn as what it is: the relief running back UP to
// the thing that produced it. This is the one picture the whole video exists to put on screen.
// =============================================================================
export const RewardArrow: React.FC<{ g: Geom; row: number; draw?: number; o?: number }> = ({
  g,
  row,
  draw = 1,
  o = 1,
}) => {
  if (o <= 0.01 || draw <= 0.01) return null;
  const peak = peakAt(row, 'rescue');
  const x0 = xOf(0.86, g); //  out on the flat tail: the morning the escape produced
  const y0 = baseY(row, g) - 10;
  const cx = xOf(0.94, g);
  const cy = yOf(peak * 0.72, row, g);
  const x1 = xOf(DOOR + 0.02, g); //  ...running back to the moment that produced it
  const y1 = yOf(peak * 0.98, row, g);
  const d = `M ${x0} ${y0} Q ${cx} ${cy} ${x1} ${y1}`;
  const len = 1100;
  return (
    <g opacity={o}>
      <path
        d={d}
        fill="none"
        stroke={AVOID_COLORS.rescue}
        strokeWidth={4}
        strokeDasharray={len}
        strokeDashoffset={len * (1 - clamp01(draw))}
        markerEnd={draw > 0.97 ? 'url(#av-arrow)' : undefined}
      />
      <text
        x={xOf(0.82, g)}
        y={yOf(peak * 0.3, row, g)}
        textAnchor="middle"
        fontFamily={FONT_BODY}
        fontSize={30}
        fontWeight={600}
        letterSpacing={3}
        fill={AVOID_COLORS.rescue}
        opacity={clamp01((draw - 0.55) / 0.35)}
      >
        <tspan x={xOf(0.82, g)} dy="0">REWARDS</tspan>
        <tspan x={xOf(0.82, g)} dy="36">THE ESCAPE</tspan>
      </text>
    </g>
  );
};

// =============================================================================
// THE GAP — a brace between the two Friday curves. The video's last visual claim, and it is
// measured: both ends sit on the drawn peaks, not on chosen coordinates.
// =============================================================================
export const FridayGap: React.FC<{ g: Geom; o?: number; label?: string }> = ({ g, o = 1, label = 'SAME CHILD' }) => {
  if (o <= 0.01) return null;
  const i = MORNINGS - 1;
  // At the door, fearAt() is exactly the morning's peak for both branches — so these two ticks
  // land ON the two curves, and the ratio between them is read, not written.
  const hi = fearAt(DOOR, peakAt(i, 'rescue'), 'rescue');
  const lo = fearAt(DOOR, peakAt(i, 'stay'), 'stay');
  const x = xOf(DOOR, g);
  const yTop = yOf(hi, i, g);
  const yBot = yOf(lo, i, g);
  const lx = xOf(DOOR + 0.14, g);
  return (
    <g opacity={o}>
      <line x1={x} y1={yTop} x2={x} y2={yBot} stroke={AVOID_COLORS.warn} strokeWidth={3} />
      <line x1={x - 13} y1={yTop} x2={x + 13} y2={yTop} stroke={AVOID_COLORS.warn} strokeWidth={3} />
      <line x1={x - 13} y1={yBot} x2={x + 13} y2={yBot} stroke={AVOID_COLORS.warn} strokeWidth={3} />
      <text
        x={lx}
        y={(yTop + yBot) / 2 - 2}
        fontFamily={FONT_BODY}
        fontSize={23}
        fontWeight={600}
        letterSpacing={3}
        fill={AVOID_COLORS.warn}
      >
        <tspan x={lx} dy="0">{label}</tspan>
        <tspan x={lx} dy="30" fontFamily={FONT_DISPLAY} fontSize={30} fontWeight={700}>
          {`${(hi / lo).toFixed(0)}× apart`}
        </tspan>
      </text>
    </g>
  );
};

// =============================================================================
// THE TWO REPLIES — a reply, and what the week does with it. The quote and the multiple live
// in ONE card on purpose: the sentence is not advice sitting next to a chart, it is the input
// the chart was run on.
// =============================================================================
export const ReplyCard: React.FC<{
  x: number;
  y: number;
  w: number;
  color: string;
  head: string;
  line1: string;
  line2: string; // always rendered, so both cards are the same height whatever is revealed
  line2o?: number;
  value: string;
  valueO?: number;
  lit?: number;
  o?: number;
  byLabel?: string;
}> = ({ x, y, w, color, head, line1, line2, line2o = 1, value, valueO = 1, lit = 0, o = 1, byLabel = 'BY FRIDAY' }) => {
  if (o <= 0.01) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        opacity: o,
        background: 'rgba(12,14,20,0.90)',
        border: `2px solid ${color}55`,
        borderLeft: `9px solid ${color}`,
        borderRadius: 16,
        padding: '13px 20px 15px',
        boxShadow: lit > 0.01 ? `0 0 ${30 * lit}px ${color}66` : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span
          style={{
            fontFamily: FONT_BODY,
            fontWeight: 600,
            fontSize: 21,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color,
          }}
        >
          {head}
        </span>
        <span style={{ opacity: valueO, whiteSpace: 'nowrap' }}>
          <span style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 19, letterSpacing: 2, color: AVOID_COLORS.dim }}>
            {byLabel}{' '}
          </span>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 42, color }}>{value}</span>
        </span>
      </div>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 600,
          fontSize: 27,
          color: '#fff',
          marginTop: 6,
          lineHeight: 1.26,
          whiteSpace: 'nowrap',
        }}
      >
        {line1}
      </div>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 600,
          fontSize: 27,
          color: '#fff',
          lineHeight: 1.26,
          whiteSpace: 'nowrap',
          opacity: line2o,
        }}
      >
        {line2}
      </div>
    </div>
  );
};

// =============================================================================
// PLATES — the two honesty labels. Both are on screen at frame 0 and at the last frame,
// because a model that only admits to being a model in the description is not admitting it.
// =============================================================================
export const ModelTag: React.FC<{ x?: number; y?: number; o?: number; text?: string }> = ({
  x = 984,
  y = 1048,
  o = 1,
  text = 'MODEL · FEAR, RELATIVE',
}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: y,
      width: x,
      textAlign: 'right',
      opacity: o,
      fontFamily: FONT_MONO,
      fontSize: 21,
      letterSpacing: 2.5,
      color: AVOID_COLORS.dim,
    }}
  >
    {text}
  </div>
);

export const SourceLine: React.FC<{ y?: number; o?: number; text?: string }> = ({
  y = 1248,
  o = 1,
  text = 'the two-part reply is the SPACE supportive statement · Lebowitz et al., JAACAP 2020',
}) => (
  <div
    style={{
      position: 'absolute',
      left: 60,
      right: 60,
      top: y,
      textAlign: 'center',
      opacity: o,
      fontFamily: FONT_BODY,
      fontSize: 21,
      letterSpacing: 1,
      color: AVOID_COLORS.dim,
    }}
  >
    {text}
  </div>
);

/** The qualifier. It is up for the whole setup and the whole quiz, which is the entire time
 *  the video is asking anyone to picture their own child. */
export const Qualifier: React.FC<{ y?: number; o?: number; title?: string; subtitle?: string }> = ({
  y = 272,
  o = 1,
  title = 'THE ORDINARY SCARED MORNING',
  subtitle = 'not bullying · not illness · not a school that is actually unsafe',
}) => {
  if (o <= 0.01) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: o }}>
      <div
        style={{
          background: 'rgba(12,14,20,0.86)',
          border: `1px solid ${AVOID_COLORS.warn}44`,
          borderRadius: 12,
          padding: '10px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 24, letterSpacing: 3, color: AVOID_COLORS.warn }}>
          {title}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 22, color: AVOID_COLORS.dim, marginTop: 4 }}>{subtitle}</div>
      </div>
    </div>
  );
};

// =============================================================================
// THE STRUCK-OUT PROMISE — reassurance, and the tie that puts it on the pink curve. It is not
// a third option: it is the rescue in a softer voice, so it belongs to the branch it feeds.
// =============================================================================
export const FalseComfort: React.FC<{
  y: number;
  strike?: number;
  tie?: number;
  o?: number;
  tag?: string;
  quote?: React.ReactNode;
  tieText?: string;
}> = ({
  y,
  strike = 0,
  tie = 0,
  o = 1,
  tag = 'NOT THIS',
  quote = <>&ldquo;you&rsquo;ll be fine, nothing bad will happen&rdquo;</>,
  tieText = 'a promise you cannot keep — same curve, softer voice',
}) => {
  if (o <= 0.01) return null;
  const W = 840;
  return (
    <div style={{ position: 'absolute', left: (1080 - W) / 2, top: y, width: W, opacity: o }}>
      <div
        style={{
          position: 'relative',
          background: 'rgba(12,14,20,0.97)',
          border: `2px solid ${AVOID_COLORS.rescue}55`,
          borderRadius: 16,
          padding: '20px 26px',
          boxShadow: '0 18px 60px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 22, letterSpacing: 4, color: AVOID_COLORS.dim }}>
          {tag}
        </div>
        <div
          style={{
            position: 'relative',
            fontFamily: FONT_DISPLAY,
            fontWeight: 600,
            fontSize: 40,
            color: '#fff',
            marginTop: 8,
            lineHeight: 1.2,
          }}
        >
          {quote}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '52%',
              height: 5,
              width: `${clamp01(strike) * 100}%`,
              background: AVOID_COLORS.rescue,
              borderRadius: 3,
            }}
          />
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: FONT_BODY,
            fontSize: 24,
            color: AVOID_COLORS.rescue,
            opacity: clamp01(tie),
          }}
        >
          {tieText}
        </div>
      </div>
    </div>
  );
};
