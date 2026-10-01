// =============================================================================
// lib/pairs.tsx — THE DYAD-NETWORK ENGINE (a settling network)
//
// The subject is not a quantity, a configuration or a body: it is a SET OF RELATIONSHIPS.
// A household of n people is drawn as the complete graph on n nodes, and the only authored
// content is the roster. `pairsOf` GENERATES the edges — C(n,2) of them — so the number on
// screen is a count of drawn lines, never a typed constant, and adding a person to the roster
// re-argues the whole video instead of desynchronising it.
//
// Nothing about the picture is keyframed. Each edge carries a CHARGE (0..1 = how much
// one-on-one time that pair has had this week); `relax` runs a deterministic spring
// relaxation every frame in which each edge's rest length is a function of its own charge,
// so the network visibly TIGHTENS as the week fills. The layout is not an animation of the
// argument, it is the argument solved. Same ethos as montyTrials, the real Mercator, the
// Verlet integrator, cycle.tsx's conserved particles and overlap.tsx's recomputed intersection.
//
// Loop-safe by construction: `relax` is a pure function of the charges and the roster, with a
// fixed iteration count from fixed anchors and no state carried between frames. Return the
// charges to their frame-0 values and the layout returns with them, to the pixel.
//
// Generic for a series: any "who is actually connected to whom" question is a new roster and a
// new charge schedule, not a new engine — a team's one-to-ones, a class's friendships, a
// support network after a move, the group chat that is not the same as the friendship.
// =============================================================================
import React from 'react';
import { Easing } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const NP = {
  stage: '#0b0e14',
  text: '#e8ecf5',
  dim: '#8b93a7',
  faint: 'rgba(232,236,245,0.42)',
  wire: 'rgba(232,236,245,0.20)', // a relationship that exists but has had nothing
  fed: '#4db8a8', // TEAL — a pair that got its turn
  warn: '#f5d76e',
  pink: '#e8879f',
  indigo: '#6366F1',
  violet: '#9b7cc4',
  slate: '#42506b',
  panel: 'rgba(12,16,24,0.86)',
} as const;

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// =============================================================================
// THE ROSTER AND ITS PAIRS — the one piece of arithmetic the whole video rests on.
// =============================================================================
export type Person = { id: string; name: string; sub: string; color: string };
export type Pair = { a: number; b: number; key: string };
export type Pt = { x: number; y: number };

/** Every unordered pair of n people: C(n,2). GENERATED — 4 -> 6, 5 -> 10, 6 -> 15. */
export const pairsOf = (n: number): Pair[] => {
  const out: Pair[] = [];
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) out.push({ a, b, key: `${a}-${b}` });
  return out;
};

/** The same count, stated as the formula the reveal prints. Used only to ASSERT agreement. */
export const nChoose2 = (n: number) => (n * (n - 1)) / 2;

/** Nodes are anchored on a ring, head of the household at the top, going clockwise. */
export const ringAnchors = (n: number, cx: number, cy: number, r: number): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });

export type RelaxOpts = {
  near: number;
  far: number;
  iter?: number;
  kEdge?: number;
  kAnchor?: number;
  /** 0..1 presence — an edge that is only half drawn only half pulls. */
  weightOf?: (key: string) => number;
};

/**
 * THE SETTLE. Each edge is a spring whose REST LENGTH is set by its charge — a pair that has
 * had its ten minutes wants to be `near`, a pair that has had nothing wants to be `far` — and
 * each node is held to its ring anchor by a weak spring so the household keeps its shape and
 * its labels stay readable. Fixed iterations from fixed anchors: same charges, same pixels.
 */
export const relax = (
  anchors: Pt[],
  pairs: Pair[],
  chargeOf: (key: string) => number,
  o: RelaxOpts,
): Pt[] => {
  const iter = o.iter ?? 160;
  const kEdge = o.kEdge ?? 0.10;
  const kAnchor = o.kAnchor ?? 0.13;
  const P: Pt[] = anchors.map((p) => ({ x: p.x, y: p.y }));
  for (let it = 0; it < iter; it++) {
    for (const pr of pairs) {
      const A = P[pr.a];
      const B = P[pr.b];
      const dx = B.x - A.x;
      const dy = B.y - A.y;
      const d = Math.max(1e-6, Math.hypot(dx, dy));
      const rest = mix(o.far, o.near, clamp01(chargeOf(pr.key)));
      const w = o.weightOf ? clamp01(o.weightOf(pr.key)) : 1;
      if (w <= 0.001) continue;
      const f = (kEdge * w * (d - rest)) / d / 2;
      A.x += dx * f;
      A.y += dy * f;
      B.x -= dx * f;
      B.y -= dy * f;
    }
    for (let i = 0; i < P.length; i++) {
      P[i].x += (anchors[i].x - P[i].x) * kAnchor;
      P[i].y += (anchors[i].y - P[i].y) * kAnchor;
    }
  }
  return P;
};

/** Convex hull (monotone chain), padded outward from the centroid — the "everyone together" set. */
export const hullOf = (pts: Pt[], pad: number): Pt[] => {
  if (pts.length < 3) return pts;
  const s = pts.slice().sort((p, q) => (p.x === q.x ? p.y - q.y : p.x - q.x));
  const cross = (o: Pt, a: Pt, b: Pt) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const half = (src: Pt[]) => {
    const h: Pt[] = [];
    for (const p of src) {
      while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop();
      h.push(p);
    }
    h.pop();
    return h;
  };
  const hull = half(s).concat(half(s.slice().reverse()));
  const cx = hull.reduce((t, p) => t + p.x, 0) / hull.length;
  const cy = hull.reduce((t, p) => t + p.y, 0) / hull.length;
  return hull.map((p) => {
    const d = Math.max(1e-6, Math.hypot(p.x - cx, p.y - cy));
    return { x: p.x + ((p.x - cx) / d) * pad, y: p.y + ((p.y - cy) / d) * pad };
  });
};

export const midOf = (A: Pt, B: Pt): Pt => ({ x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 });

// =============================================================================
// EDGE — the relationship itself. The faint wire is always there (a relationship you are
// not feeding is still a relationship); the lit overlay is the one-on-one time it has had.
// =============================================================================
export const EdgeLine: React.FC<{
  A: Pt;
  B: Pt;
  charge: number;
  opacity?: number;
  ring?: number; // 0..1 — called out by the narration as one of the ones nobody schedules
  label?: string;
  labelOpacity?: number;
}> = ({ A, B, charge, opacity = 1, ring = 0, label, labelOpacity = 0 }) => {
  const c = clamp01(charge);
  const m = midOf(A, B);
  // The chip rides the edge's own normal, so it never lands on the label of a node it passes.
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const d = Math.max(1e-6, Math.hypot(dx, dy));
  const lx = m.x + (dy / d) * 40;
  const ly = m.y - (dx / d) * 40;
  return (
    <g opacity={opacity}>
      <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={NP.wire} strokeWidth={3} strokeLinecap="round" />
      {ring > 0.01 ? (
        <line
          x1={A.x}
          y1={A.y}
          x2={B.x}
          y2={B.y}
          stroke={NP.warn}
          strokeWidth={6 + 8 * ring}
          strokeLinecap="round"
          strokeDasharray="14 16"
          opacity={0.25 + 0.55 * ring}
        />
      ) : null}
      {c > 0.005 ? (
        <line
          x1={A.x}
          y1={A.y}
          x2={B.x}
          y2={B.y}
          stroke={NP.fed}
          strokeWidth={4 + 11 * c}
          strokeLinecap="round"
          opacity={0.28 + 0.72 * c}
        />
      ) : null}
      {label && labelOpacity > 0.01 ? (
        <g opacity={labelOpacity}>
          <rect x={lx - 57} y={ly - 23} width={114} height={46} rx={23} fill={NP.panel} stroke={`${NP.fed}77`} strokeWidth={2} />
          <text
            x={lx}
            y={ly + 9}
            fill={NP.fed}
            fontFamily={FONT_MONO}
            fontSize={24}
            fontWeight={700}
            letterSpacing={1}
            textAnchor="middle"
          >
            {label}
          </text>
        </g>
      ) : null}
    </g>
  );
};

/** The ten minutes themselves, travelling the edge they are being spent on. */
export const TurnDot: React.FC<{ A: Pt; B: Pt; t: number; opacity?: number }> = ({ A, B, t, opacity = 1 }) => {
  if (opacity <= 0.01) return null;
  const p = clamp01(t);
  const x = mix(A.x, B.x, p);
  const y = mix(A.y, B.y, p);
  return (
    <g opacity={opacity}>
      <circle cx={x} cy={y} r={26} fill={NP.fed} opacity={0.18} />
      <circle cx={x} cy={y} r={11} fill={NP.fed} />
    </g>
  );
};

// =============================================================================
// NODE — a person. Value separation matters (short-19's lesson): the disc is drawn over a
// stage-coloured plate so an edge passing behind it never reads as passing through it.
// =============================================================================
export const NodeDisc: React.FC<{
  p: Pt;
  person: Person;
  r?: number;
  opacity?: number;
}> = ({ p, person, r = 60, opacity = 1 }) => (
  <g opacity={opacity}>
    <circle cx={p.x} cy={p.y} r={r + 9} fill={NP.stage} />
    <circle cx={p.x} cy={p.y} r={r} fill={`${person.color}22`} stroke={person.color} strokeWidth={4} />
    <text
      x={p.x}
      y={p.y + 16}
      fill={person.color}
      fontFamily={FONT_DISPLAY}
      fontSize={46}
      fontWeight={700}
      textAnchor="middle"
    >
      {person.name.slice(0, 1)}
    </text>
    <text
      x={p.x}
      y={p.y + r + 40}
      fill={NP.text}
      stroke={NP.stage}
      strokeWidth={11}
      paintOrder="stroke"
      strokeLinejoin="round"
      fontFamily={FONT_BODY}
      fontSize={30}
      fontWeight={600}
      letterSpacing={2}
      textAnchor="middle"
    >
      {person.name.toUpperCase()}
    </text>
    <text
      x={p.x}
      y={p.y + r + 70}
      fill={NP.dim}
      stroke={NP.stage}
      strokeWidth={9}
      paintOrder="stroke"
      strokeLinejoin="round"
      fontFamily={FONT_BODY}
      fontSize={23}
      fontWeight={500}
      letterSpacing={2}
      textAnchor="middle"
    >
      {person.sub.toUpperCase()}
    </text>
  </g>
);

// =============================================================================
// HULL — everyone in the room at once. It is drawn as ONE shape on purpose: shared time is
// real and it is one relationship, the group's. It never touches an edge, because an edge is
// one-on-one minutes and inside this shape nobody is alone with anybody.
// =============================================================================
export const Hull: React.FC<{ pts: Pt[]; opacity?: number; label?: string; labelY?: number }> = ({
  pts,
  opacity = 1,
  label,
  labelY,
}) => {
  if (opacity <= 0.01 || pts.length < 3) return null;
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
  const top = Math.min(...pts.map((p) => p.y));
  return (
    <g opacity={opacity}>
      <path d={d} fill={`${NP.violet}1e`} stroke={`${NP.violet}aa`} strokeWidth={3} strokeDasharray="16 14" />
      {label ? (
        <text
          x={pts.reduce((t, p) => t + p.x, 0) / pts.length}
          y={labelY ?? top - 26}
          fill={NP.violet}
          fontFamily={FONT_BODY}
          fontSize={28}
          fontWeight={600}
          letterSpacing={4}
          textAnchor="middle"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
};

// =============================================================================
// READOUTS — every one of these is handed a COUNT of what is drawn this frame.
// =============================================================================
export const BigCount: React.FC<{
  n: number;
  label: string;
  x: number;
  y: number;
  size?: number;
  color?: string;
  opacity?: number;
  pulse?: number;
}> = ({ n, label, x, y, size = 124, color = NP.text, opacity = 1, pulse = 0 }) => (
  <g opacity={opacity} transform={`translate(${x} ${y}) scale(${1 + 0.06 * pulse}) translate(${-x} ${-y})`}>
    <text
      x={x}
      y={y}
      fill={color}
      fontFamily={FONT_DISPLAY}
      fontSize={size}
      fontWeight={700}
      letterSpacing={-2}
      textAnchor="middle"
    >
      {n}
    </text>
    <text
      x={x}
      y={y + 44}
      fill={NP.dim}
      fontFamily={FONT_BODY}
      fontSize={26}
      fontWeight={600}
      letterSpacing={5}
      textAnchor="middle"
    >
      {label}
    </text>
  </g>
);

export const Stat: React.FC<{
  value: string;
  label: string;
  x: number;
  y: number;
  color?: string;
  size?: number;
  opacity?: number;
}> = ({ value, label, x, y, color = NP.text, size = 58, opacity = 1 }) => (
  <g opacity={opacity}>
    <text
      x={x}
      y={y}
      fill={color}
      fontFamily={FONT_DISPLAY}
      fontSize={size}
      fontWeight={700}
      letterSpacing={-1}
      textAnchor="middle"
    >
      {value}
    </text>
    <text
      x={x}
      y={y + 32}
      fill={NP.dim}
      fontFamily={FONT_BODY}
      fontSize={22}
      fontWeight={600}
      letterSpacing={3}
      textAnchor="middle"
    >
      {label}
    </text>
  </g>
);

// =============================================================================
// DAY RAIL — one slot per relationship, because the schedule IS the edge list. It grows when
// the household does, which is the whole twist: the days needed are the pairs, not the people.
// =============================================================================
export const DayRail: React.FC<{
  slots: number;
  filled: number;
  cx: number;
  y: number;
  w: number;
  opacity?: number;
}> = ({ slots, filled, cx, y, w, opacity = 1 }) => {
  if (opacity <= 0.01 || slots < 1) return null;
  const gap = 12;
  const cell = (w - gap * (slots - 1)) / slots;
  const x0 = cx - w / 2;
  return (
    <g opacity={opacity}>
      {Array.from({ length: slots }, (_, i) => {
        const on = clamp01(filled - i);
        return (
          <rect
            key={i}
            x={x0 + i * (cell + gap)}
            y={y}
            width={cell}
            height={18}
            rx={9}
            fill={on > 0.01 ? NP.fed : 'rgba(255,255,255,0.08)'}
            opacity={on > 0.01 ? 0.35 + 0.65 * on : 1}
          />
        );
      })}
      <text
        x={cx}
        y={y + 52}
        fill={NP.dim}
        fontFamily={FONT_BODY}
        fontSize={23}
        fontWeight={600}
        letterSpacing={4}
        textAnchor="middle"
      >
        {`ONE PAIR A DAY  ·  ${slots} DAYS`}
      </text>
    </g>
  );
};

/** n(n-1)/2, printed with the roster's own n substituted in. */
export const FormulaChip: React.FC<{ n: number; cx: number; y: number; opacity?: number }> = ({
  n,
  cx,
  y,
  opacity = 1,
}) => {
  if (opacity <= 0.01) return null;
  const text = `${n} x ${n - 1} / 2  =  ${nChoose2(n)}`;
  return (
    <g opacity={opacity}>
      <rect x={cx - 175} y={y - 34} width={350} height={62} rx={31} fill={NP.panel} stroke={`${NP.warn}66`} strokeWidth={2} />
      <text
        x={cx}
        y={y + 8}
        fill={NP.warn}
        fontFamily={FONT_MONO}
        fontSize={31}
        fontWeight={700}
        letterSpacing={1}
        textAnchor="middle"
      >
        {text}
      </text>
    </g>
  );
};

// =============================================================================
// FACT PLATE — the citation, on screen, in the beat that makes the claim, with the setting it
// was measured in printed under it (short-26's rule: name the room).
// =============================================================================
export const FactPlate: React.FC<{
  headline: string;
  source: string[];
  y: number;
  color?: string;
  opacity?: number;
}> = ({ headline, source, y, color = NP.fed, opacity = 1 }) => (
  <div
    style={{
      position: 'absolute',
      left: 70,
      right: 70,
      top: y,
      opacity,
      background: NP.panel,
      border: `2px solid ${color}55`,
      borderRadius: 20,
      padding: '20px 26px',
      textAlign: 'center',
    }}
  >
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 36, letterSpacing: 1, color }}>{headline}</div>
    {source.map((s, i) => (
      <div
        key={i}
        style={{
          marginTop: i === 0 ? 10 : 4,
          fontFamily: FONT_MONO,
          fontWeight: 500,
          fontSize: 21,
          letterSpacing: 1.4,
          color: i === 0 ? NP.faint : NP.dim,
        }}
      >
        {s}
      </div>
    ))}
  </div>
);

export const Disclaimer: React.FC<{ text: string; y: number; opacity?: number }> = ({ text, y, opacity = 1 }) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: y,
      textAlign: 'center',
      opacity: 0.62 * opacity,
      fontFamily: FONT_MONO,
      fontWeight: 500,
      fontSize: 21,
      letterSpacing: 2,
      color: NP.dim,
    }}
  >
    {text}
  </div>
);
