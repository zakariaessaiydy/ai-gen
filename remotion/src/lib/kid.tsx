// =============================================================================
// lib/kid.tsx — THE ARTICULATED-FIGURE ENGINE (a body you cannot fake the effort of)
//
// One skeleton, one forward-kinematics pass, and a gait is just a function from phase to joint
// angles. `stand`, `bear`, `crab`, `leap`, `reach`, `run` and `dance` are the SAME draw call
// with different angle functions — nothing about a gait is keyframed, drawn by hand, or special
// cased, which is what lets the video claim that five different games are the same thing
// happening (a body moving) and show it rather than assert it.
//
// The measurement is the point. `travel()` samples a gait around one full cycle, runs the same
// FK that draws it, and sums how far the hands, feet and head actually move. So the talk-test
// badge on screen is reading the animation — it cannot say VIGOROUS over a figure that is
// barely moving, because the number comes from the figure.
//
// Same ethos as prob.tsx's seeded trials, map.tsx's real Mercator, orbit.tsx's Verlet
// integrator, cycle.tsx's conserved particles, order.tsx's replayed swaps and budget.tsx's
// read-back hub: never assert what the code can compute.
//
// The second half of the kit is the RAIL — a collector that fills from a table of parts and
// reports its total by measuring the width it just drew. Reusable for anything with a "the
// total is a sum of scraps, not a single block" shape: minutes of activity, savings, words
// written, steps, practice time.
//
// GEOMETRY CONVENTION: body space, y DOWN, angles ABSOLUTE in radians with 0 = +x (facing
// right) growing clockwise. So "straight up" is -PI/2 and "straight down" is +PI/2. The figure
// is anchored at its FEET (body y = GROUND_Y) so it can be dropped onto a floor line directly.
// =============================================================================
import React from 'react';
import { Easing } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const KID_COLORS = {
  stage: '#0b0e14',
  track: 'rgba(255,255,255,0.10)',
  trackEdge: 'rgba(255,255,255,0.20)',
  dim: '#8b93a7',
  text: '#e8ecf5',
  accent: '#f5d76e',
  indigo: '#6366F1',
  violet: '#9b7cc4',
  teal: '#4db8a8',
  green: '#4ecdc4',
  pink: '#e8879f',
} as const;

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const TAU = Math.PI * 2;
export const HALF_PI = Math.PI / 2;
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// sine of a phase (cycles, not radians) with an optional offset in cycles
const S = (p: number, off = 0) => Math.sin(TAU * (p + off));
const C = (p: number, off = 0) => Math.cos(TAU * (p + off));
const up = (x: number) => Math.max(0, x); // the positive half of a swing

// =============================================================================
// THE SKELETON — segment lengths in body units. A standing figure is GROUND_Y + spine + neck
// + headR = 98 + 62 + 44 + 34 = 238 units tall, so `s` in `Figure` is px-per-238-units / 238.
// =============================================================================
export const L = {
  spine: 62,
  neck: 44,
  headR: 34,
  upper: 44,
  fore: 42,
  thigh: 50,
  shin: 48,
  foot: 22,
} as const;

/** Body y of the floor: where a straight leg (thigh + shin) puts the ankle. */
export const GROUND_Y = L.thigh + L.shin; // 98

export type P = { x: number; y: number };
export type Pair = [number, number]; // [far limb, near limb]

export type Pose = {
  rx: number; // pelvis offset from the anchor, body units
  ry: number; // negative is UP
  spine: number; // absolute angle pelvis -> chest
  neck: number; // absolute angle chest -> head centre
  armU: Pair; // upper arm, absolute
  armF: Pair; // forearm, absolute
  legU: Pair; // thigh, absolute
  legF: Pair; // shin, absolute
  foot: Pair; // absolute angle of the foot from the ankle
};

export type Skeleton = {
  pelvis: P;
  chest: P;
  head: P;
  shoulder: [P, P];
  hip: [P, P];
  elbow: [P, P];
  hand: [P, P];
  knee: [P, P];
  ankle: [P, P];
  toe: [P, P];
};

const step = (p: P, a: number, l: number): P => ({ x: p.x + l * Math.cos(a), y: p.y + l * Math.sin(a) });

// Half the shoulder / hip width, measured PERPENDICULAR to the spine. Without it both arms and
// both legs hang out of the same point and the figure reads as one blob at thumbnail size.
const SH = 20;
const HIPW = 13;

/** Forward kinematics. The ONLY place a joint becomes a point — every gait goes through here. */
export const solve = (pose: Pose): Skeleton => {
  const pelvis: P = { x: pose.rx, y: pose.ry };
  const chest = step(pelvis, pose.spine, L.spine);
  const head = step(chest, pose.neck, L.neck);
  // the body's own across-axis: index 0 sits behind the spine, index 1 in front of it
  const nx = -Math.sin(pose.spine);
  const ny = Math.cos(pose.spine);
  const shoulder: [P, P] = [
    { x: chest.x - nx * SH, y: chest.y - ny * SH },
    { x: chest.x + nx * SH, y: chest.y + ny * SH },
  ];
  const hip: [P, P] = [
    { x: pelvis.x - nx * HIPW, y: pelvis.y - ny * HIPW },
    { x: pelvis.x + nx * HIPW, y: pelvis.y + ny * HIPW },
  ];
  const elbow: [P, P] = [step(shoulder[0], pose.armU[0], L.upper), step(shoulder[1], pose.armU[1], L.upper)];
  const hand: [P, P] = [step(elbow[0], pose.armF[0], L.fore), step(elbow[1], pose.armF[1], L.fore)];
  const knee: [P, P] = [step(hip[0], pose.legU[0], L.thigh), step(hip[1], pose.legU[1], L.thigh)];
  const ankle: [P, P] = [step(knee[0], pose.legF[0], L.shin), step(knee[1], pose.legF[1], L.shin)];
  const toe: [P, P] = [step(ankle[0], pose.foot[0], L.foot), step(ankle[1], pose.foot[1], L.foot)];
  return { pelvis, chest, head, shoulder, hip, elbow, hand, knee, ankle, toe };
};

// =============================================================================
// THE GAITS — every one is (phase in [0,1)) => Pose, periodic by construction.
//
// A knee or elbow can only bend one way, so a flexion is always ADDED to the parent segment's
// absolute angle: shin = thigh + flex with flex >= 0 folds the lower leg backwards, which is
// the only direction a leg has.
// =============================================================================
export type Gait = (p: number) => Pose;
export type GaitName = 'stand' | 'slump' | 'run' | 'bear' | 'crab' | 'leap' | 'reach' | 'dance';

/** Upright and breathing — the reference pose, and the "nothing is happening" gait. */
export const stand: Gait = (p) => ({
  rx: 0,
  ry: 1.6 * S(p),
  spine: -HALF_PI + 0.02 * S(p),
  neck: -HALF_PI + 0.03 * S(p, 0.25),
  armU: [HALF_PI - 0.26, HALF_PI + 0.28],
  armF: [HALF_PI - 0.30 + 0.05 * S(p), HALF_PI + 0.34 + 0.05 * S(p, 0.5)],
  legU: [HALF_PI - 0.15, HALF_PI + 0.16],
  legF: [HALF_PI - 0.10, HALF_PI + 0.11],
  foot: [-0.06, -0.02],
});

/** Standing, but defeated — the parent who has been told to find an hour. */
export const slump: Gait = (p) => ({
  rx: 3,
  ry: 5 + 1.4 * S(p),
  spine: -HALF_PI + 0.20 + 0.02 * S(p),
  neck: -HALF_PI + 0.34,
  armU: [HALF_PI - 0.20, HALF_PI + 0.23],
  armF: [HALF_PI - 0.14, HALF_PI + 0.30],
  legU: [HALF_PI - 0.13, HALF_PI + 0.14],
  legF: [HALF_PI - 0.09, HALF_PI + 0.10],
  foot: [-0.05, -0.02],
});

/** Running, facing right: contralateral swing, knee flexion peaking on the back swing. */
export const run: Gait = (p) => {
  const a = S(p);
  const b = S(p, 0.5);
  const legU: Pair = [HALF_PI + 0.62 * b, HALF_PI + 0.62 * a];
  const armU: Pair = [HALF_PI + 0.85 * a, HALF_PI + 0.85 * b];
  return {
    rx: 0,
    ry: -7 - 5 * Math.abs(C(p)),
    spine: -HALF_PI + 0.17,
    neck: -HALF_PI + 0.02,
    armU,
    armF: [armU[0] - 1.05 - 0.35 * C(p), armU[1] - 1.05 + 0.35 * C(p)],
    legU,
    legF: [legU[0] + 0.62 + 0.60 * up(-b), legU[1] + 0.62 + 0.60 * up(-a)],
    foot: [-0.30 * b, -0.30 * a],
  };
};

/** Bear crawl: hips high, shoulders low, hands and feet down, diagonal pairs alternating. */
export const bear: Gait = (p) => {
  const a = S(p);
  const b = S(p, 0.5);
  const sw = 0.34;
  // The shape is the whole point: the back runs almost HORIZONTAL with the hips a touch higher
  // than the shoulders, and all four limbs drop to the floor. `ry` is solved so the hands and
  // feet land on GROUND_Y with a mild bend rather than punching through it or dangling above.
  const armU: Pair = [HALF_PI - 0.34 + sw * a, HALF_PI - 0.28 + sw * b];
  const legU: Pair = [HALF_PI + 0.24 + sw * b, HALF_PI + 0.30 + sw * a];
  return {
    rx: -34,
    ry: -16 + 3.5 * Math.abs(S(p, 0.25)),
    spine: 0.16,
    neck: -0.38,
    armU,
    armF: [armU[0] + 0.24 - 0.34 * up(a), armU[1] + 0.20 - 0.34 * up(b)],
    legU,
    legF: [legU[0] + 0.10 + 0.40 * up(b), legU[1] + 0.08 + 0.40 * up(a)],
    foot: [-0.95, -0.90],
  };
};

/** Crab walk: same table-top shape, face UP — the spine leans back instead of forward. */
export const crab: Gait = (p) => {
  const a = S(p);
  const b = S(p, 0.5);
  const sw = 0.30;
  // spine points BACKWARDS along the body, so the chest trails the hips and the belly is up
  const armU: Pair = [HALF_PI - 0.30 + sw * a, HALF_PI - 0.24 + sw * b];
  const legU: Pair = [HALF_PI + 0.22 + sw * b, HALF_PI + 0.28 + sw * a];
  return {
    rx: 30,
    ry: -10 + 3 * Math.abs(S(p, 0.25)),
    spine: Math.PI - 0.14,
    neck: Math.PI + 0.42,
    armU,
    armF: [armU[0] + 0.36 - 0.30 * up(a), armU[1] + 0.32 - 0.30 * up(b)],
    legU,
    legF: [legU[0] + 0.30 + 0.36 * up(b), legU[1] + 0.26 + 0.36 * up(a)],
    foot: [-0.85, -0.80],
  };
};

/** Floor is lava: crouch, launch, tuck, land. The pelvis follows a real arc, not a bob. */
export const leap: Gait = (p) => {
  // airborne over [0.14, 0.86); a crouch dips the pelvis on either side of it
  const t = clamp01((p - 0.14) / 0.72);
  const air = p > 0.14 && p < 0.86 ? Math.sin(Math.PI * t) : 0;
  const crouch = 1 - clamp01(Math.abs(p - 0.5) / 0.5); // 0 at the cycle edges, 1 mid-flight
  const dip = 14 * (1 - crouch) * (1 - air);
  const legU: Pair = [HALF_PI - 0.62 * air + 0.16, HALF_PI - 0.74 * air - 0.10];
  const armU: Pair = [HALF_PI - 2.30 * air - 0.10, HALF_PI - 2.45 * air + 0.08];
  return {
    rx: 6 * S(p, -0.25),
    ry: -86 * air + dip,
    spine: -HALF_PI + 0.24 - 0.16 * air,
    neck: -HALF_PI + 0.06 - 0.14 * air,
    armU,
    armF: [armU[0] - 0.34 * air, armU[1] - 0.30 * air],
    legU,
    legF: [legU[0] + 0.42 + 1.05 * air + 0.55 * (1 - air) * (1 - crouch), legU[1] + 0.36 + 1.20 * air + 0.55 * (1 - air) * (1 - crouch)],
    foot: [-0.20 - 0.55 * air, -0.16 - 0.55 * air],
  };
};

/** Balloon keep-up: both arms high, alternating taps, small hops onto the toes. */
export const reach: Gait = (p) => {
  const a = S(p);
  const b = S(p, 0.5);
  const hop = up(S(p, 0.12));
  const armU: Pair = [-HALF_PI - 0.30 + 0.46 * a, -HALF_PI + 0.26 + 0.46 * b];
  const legU: Pair = [HALF_PI - 0.16, HALF_PI + 0.18];
  return {
    rx: 0,
    ry: -16 * hop,
    spine: -HALF_PI - 0.06,
    neck: -HALF_PI - 0.16,
    armU,
    armF: [armU[0] + 0.30 - 0.22 * a, armU[1] + 0.26 - 0.22 * b],
    legU,
    legF: [legU[0] + 0.16 + 0.30 * hop, legU[1] + 0.14 + 0.30 * hop],
    foot: [-0.16 - 0.5 * hop, -0.12 - 0.5 * hop],
  };
};

/**
 * Freeze dance. THE FREEZE IS IN THE FUNCTION, not in the shot.
 *
 * `beatPhase` maps the cycle onto K dance beats through a MONOTONIC ramp with a flat plateau in
 * the middle: the figure dances, holds dead still for a quarter of the cycle, then dances on.
 * Because the ramp is continuous and lands on an integer K, the pose is continuous across the
 * wrap too — so freeze dance is loop-safe for the same reason a plain gait is.
 */
const HOLD_A = 0.42;
const HOLD_B = 0.68;
const DANCE_BEATS = 3;
export const beatPhase = (p: number, k = DANCE_BEATS) => {
  const moving = 1 - (HOLD_B - HOLD_A);
  if (p < HOLD_A) return (p / moving) * k;
  if (p < HOLD_B) return (HOLD_A / moving) * k;
  return ((p - (HOLD_B - HOLD_A)) / moving) * k;
};
/** True while the dance gait is holding — the shot uses it to flash the FREEZE badge. */
export const isFrozen = (p: number) => p >= HOLD_A && p < HOLD_B;

export const dance: Gait = (p) => {
  const d = beatPhase(p);
  const a = S(d);
  const b = S(d, 0.5);
  const bounce = up(S(d, 0.05));
  const armU: Pair = [-HALF_PI - 0.55 + 0.75 * a, -HALF_PI + 0.60 + 0.75 * b];
  const legU: Pair = [HALF_PI - 0.24 - 0.12 * b, HALF_PI + 0.28 + 0.12 * a];
  return {
    rx: 5 * a,
    ry: -13 * bounce,
    spine: -HALF_PI + 0.10 * a,
    neck: -HALF_PI - 0.10 * a,
    armU,
    armF: [armU[0] + 0.55 - 0.40 * a, armU[1] - 0.50 + 0.40 * b],
    legU,
    legF: [legU[0] + 0.22 + 0.42 * up(b), legU[1] + 0.20 + 0.42 * up(a)],
    foot: [-0.14, -0.10],
  };
};

export const GAITS: Record<GaitName, Gait> = { stand, slump, run, bear, crab, leap, reach, dance };

// =============================================================================
// THE MEASUREMENT — how much this body actually moves.
//
// `travel` walks a gait around one full cycle, runs the SAME forward kinematics that draws it,
// and sums the distance the five extremities cover. It is the animation's own arc length, so a
// badge driven by it cannot disagree with the figure the viewer is watching.
// =============================================================================
const TIPS = (sk: Skeleton): P[] => [sk.hand[0], sk.hand[1], sk.toe[0], sk.toe[1], sk.head];

/** Body units of extremity motion per cycle. */
export const travel = (g: Gait, n = 180): number => {
  let sum = 0;
  let prev = TIPS(solve(g(0)));
  for (let i = 1; i <= n; i++) {
    const cur = TIPS(solve(g(i / n)));
    for (let j = 0; j < cur.length; j++) {
      sum += Math.hypot(cur[j].x - prev[j].x, cur[j].y - prev[j].y);
    }
    prev = cur;
  }
  return sum;
};

/** Body units of extremity motion per SECOND — travel scaled by how fast the gait is run. */
export const intensity = (g: Gait, hz: number) => travel(g) * hz;

export type TalkBand = 'LIGHT' | 'MODERATE' | 'VIGOROUS';
/**
 * The CDC talk test, banded against a running reference: moderate = you can talk but not sing,
 * vigorous = you cannot say more than a few words. The DEFINITIONS are CDC's; the placement of
 * a given gait in a band is this figure's measured motion against `ref`.
 */
export const bandOf = (v: number, ref: number): TalkBand =>
  v < 0.22 * ref ? 'LIGHT' : v < 0.62 * ref ? 'MODERATE' : 'VIGOROUS';

export const BAND_COLOR: Record<TalkBand, string> = {
  LIGHT: KID_COLORS.dim,
  MODERATE: KID_COLORS.teal,
  VIGOROUS: KID_COLORS.indigo,
};
export const BAND_TEST: Record<TalkBand, string> = {
  LIGHT: 'can hold a tune',
  MODERATE: 'can talk, cannot sing',
  VIGOROUS: 'a few words at a time',
};

// =============================================================================
// THE FIGURE — an SVG <g>. Anchored at the FEET so it drops onto a floor line.
// =============================================================================
export const Figure: React.FC<{
  gait: GaitName;
  phase: number;
  x: number;
  y: number; // the floor the feet stand on
  s?: number; // 1 => 221 body units tall
  color?: string;
  far?: string; // the limbs on the far side of the body
  opacity?: number;
  shadow?: boolean;
  gap?: string; // the stage colour, cut between overlapping same-value parts
}> = ({ gait, phase, x, y, s = 1, color = KID_COLORS.text, far, opacity = 1, shadow = true, gap = KID_COLORS.stage }) => {
  if (opacity <= 0.01) return null;
  const pose = GAITS[gait](((phase % 1) + 1) % 1);
  const k = solve(pose);
  const farC = far ?? 'rgba(148,157,178,0.78)';
  const lw = 15;
  const line = (a: P, b: P, stroke: string, w = lw) => (
    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={stroke} strokeWidth={w} strokeLinecap="round" />
  );
  // the pelvis sits `GROUND_Y` above the floor at rest, so the whole body shifts up by it
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(0 ${-GROUND_Y})`} opacity={opacity}>
      {shadow ? (
        <ellipse
          cx={k.pelvis.x * 0.4}
          cy={GROUND_Y + 8}
          rx={54 - 0.18 * Math.min(90, -Math.min(0, pose.ry))}
          ry={9}
          fill="rgba(0,0,0,0.34)"
        />
      ) : null}

      {/* FAR side first — the limbs behind the body read as depth, never as a second figure */}
      {line(k.shoulder[0], k.elbow[0], farC, lw - 2)}
      {line(k.elbow[0], k.hand[0], farC, lw - 2)}
      {line(k.hip[0], k.knee[0], farC, lw - 1)}
      {line(k.knee[0], k.ankle[0], farC, lw - 1)}
      {line(k.ankle[0], k.toe[0], farC, lw - 3)}

      {/* TORSO — a single thick stroke, so the body reads as one mass at thumbnail size */}
      <line
        x1={k.pelvis.x}
        y1={k.pelvis.y}
        x2={k.chest.x}
        y2={k.chest.y}
        stroke={color}
        strokeWidth={30}
        strokeLinecap="round"
      />
      {line(k.chest, k.head, color, 15)}
      <circle cx={k.head.x} cy={k.head.y} r={L.headR + 5} fill={gap} />
      <circle cx={k.head.x} cy={k.head.y} r={L.headR} fill={color} />

      {/* NEAR side, each limb over its own gap so it stays a limb where it lies on the torso */}
      {line(k.hip[1], k.knee[1], gap, lw + 10)}
      {line(k.knee[1], k.ankle[1], gap, lw + 10)}
      {line(k.shoulder[1], k.elbow[1], gap, lw + 9)}
      {line(k.elbow[1], k.hand[1], gap, lw + 9)}
      {line(k.hip[1], k.knee[1], color, lw + 1)}
      {line(k.knee[1], k.ankle[1], color, lw + 1)}
      {line(k.ankle[1], k.toe[1], color, lw - 2)}
      {line(k.shoulder[1], k.elbow[1], color, lw)}
      {line(k.elbow[1], k.hand[1], color, lw)}
    </g>
  );
};

// =============================================================================
// THE RAIL — a total assembled out of parts, reporting the width it just drew.
// =============================================================================
export type Part = { id: string; label: string; short: string; min: number; color: string; gait?: GaitName };

/** The only place the total exists. Nothing downstream types it as a literal. */
export const totalOf = (parts: Part[]) => parts.reduce((a, p) => a + p.min, 0);

/**
 * Minutes actually ON the rail right now — the drawn widths added back up.
 *
 * `fracs[i]` is how much of part i has been laid down (0..1). A mis-timed chip therefore shows
 * up as a WRONG NUMBER in the readout rather than hiding behind a counter that was keyframed
 * to look right (short-10's lesson, budget.tsx's `spent()` applied to a bar).
 */
export const filledMinutes = (parts: Part[], fracs: number[]) =>
  parts.reduce((a, p, i) => a + p.min * clamp01(fracs[i] ?? 0), 0);

export const Rail: React.FC<{
  parts: Part[];
  fracs: number[];
  span: number; // minutes the full rail width represents
  target?: number; // the guideline mark
  x: number;
  y: number;
  w: number;
  h: number;
  targetOpacity?: number;
  radius?: number;
}> = ({ parts, fracs, span, target, x, y, w, h, targetOpacity = 1, radius = 10 }) => {
  const px = (m: number) => (m / span) * w;
  let cursor = 0;
  const segs = parts.map((p, i) => {
    const a = cursor;
    const len = p.min * clamp01(fracs[i] ?? 0);
    cursor += len;
    return { p, a, len };
  });
  const tx = target === undefined ? 0 : x + px(target);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={radius} fill={KID_COLORS.track} />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={radius}
        fill="none"
        stroke={KID_COLORS.trackEdge}
        strokeWidth={2}
      />
      {segs.map(({ p, a, len }) =>
        len <= 0.001 ? null : (
          <rect
            key={p.id}
            x={x + px(a)}
            y={y + 3}
            width={Math.max(2, px(len) - 3)}
            height={h - 6}
            rx={radius - 4}
            fill={p.color}
          />
        )
      )}
      {target === undefined ? null : (
        <g opacity={targetOpacity}>
          <line
            x1={tx}
            y1={y - 14}
            x2={tx}
            y2={y + h + 20}
            stroke={KID_COLORS.text}
            strokeWidth={3}
            strokeDasharray="9 8"
            opacity={0.75}
          />
          <text
            x={tx + 10}
            y={y + h + 52}
            fill={KID_COLORS.text}
            fontFamily={FONT_BODY}
            fontSize={26}
            fontWeight={600}
            letterSpacing={3}
            textAnchor="end"
            opacity={0.85}
          >
            {`${target} MIN · WHO`}
          </text>
        </g>
      )}
    </g>
  );
};

// =============================================================================
// SMALL PARTS
// =============================================================================

/** The talk-test badge. `band` is measured, never passed in as a decision. */
export const TalkBadge: React.FC<{
  band: TalkBand;
  x: number;
  y: number;
  opacity?: number;
  scale?: number;
}> = ({ band, x, y, opacity = 1, scale = 1 }) => {
  if (opacity <= 0.01) return null;
  const c = BAND_COLOR[band];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <rect x={-186} y={-38} width={372} height={76} rx={38} fill="rgba(10,13,20,0.86)" stroke={`${c}88`} strokeWidth={2} />
      <circle cx={-146} cy={0} r={11} fill={c} />
      <text x={-118} y={-4} fill={c} fontFamily={FONT_BODY} fontSize={27} fontWeight={700} letterSpacing={3}>
        {band}
      </text>
      <text x={-118} y={24} fill="rgba(232,236,245,0.72)" fontFamily={FONT_BODY} fontSize={21} fontWeight={500}>
        {BAND_TEST[band]}
      </text>
    </g>
  );
};

/** The hero readout: a number that was measured off the rail, plus its unit and target. */
export const Readout: React.FC<{
  value: number;
  target?: number;
  x: number;
  y: number;
  color?: string;
  size?: number;
  opacity?: number;
  note?: string;
}> = ({ value, target, x, y, color = KID_COLORS.accent, size = 150, opacity = 1, note }) => {
  if (opacity <= 0.01) return null;
  return (
    <g opacity={opacity}>
      <text
        x={x}
        y={y}
        fill={color}
        fontFamily={FONT_MONO}
        fontWeight={700}
        fontSize={size}
        textAnchor="middle"
        letterSpacing={-2}
      >
        {Math.round(value)}
      </text>
      <text
        x={x}
        y={y + 44}
        fill="rgba(232,236,245,0.80)"
        fontFamily={FONT_BODY}
        fontWeight={600}
        fontSize={30}
        letterSpacing={7}
        textAnchor="middle"
      >
        {note ?? (target === undefined ? 'MINUTES' : `MINUTES · TARGET ${target}`)}
      </text>
    </g>
  );
};

/** A named chip that announces the part currently landing on the rail. */
export const PartLabel: React.FC<{
  label: string;
  min: number;
  color: string;
  x: number;
  y: number;
  opacity?: number;
}> = ({ label, min, color, x, y, opacity = 1 }) => {
  if (opacity <= 0.01) return null;
  return (
    <g opacity={opacity}>
      <text
        x={x}
        y={y}
        fill={color}
        fontFamily={FONT_DISPLAY}
        fontWeight={700}
        fontSize={52}
        letterSpacing={2}
        textAnchor="middle"
      >
        {label}
      </text>
      <text
        x={x}
        y={y + 44}
        fill="rgba(232,236,245,0.72)"
        fontFamily={FONT_MONO}
        fontWeight={500}
        fontSize={32}
        letterSpacing={2}
        textAnchor="middle"
      >
        {`+${min} MIN`}
      </text>
    </g>
  );
};

/** A row of colour dots naming what is already on the rail. */
export const Legend: React.FC<{
  parts: Part[];
  fracs: number[];
  x: number;
  y: number;
  w: number;
  cols?: number;
  opacity?: number;
}> = ({ parts, fracs, x, y, w, cols = 3, opacity = 1 }) => {
  if (opacity <= 0.01) return null;
  const cw = w / cols;
  return (
    <g opacity={opacity}>
      {parts.map((p, i) => {
        const on = clamp01(fracs[i] ?? 0);
        if (on <= 0.02) return null;
        const r = Math.floor(i / cols);
        const c = i % cols;
        return (
          <g key={p.id} opacity={0.35 + 0.65 * on} transform={`translate(${x + c * cw} ${y + r * 44})`}>
            <circle cx={9} cy={-8} r={9} fill={p.color} />
            <text x={26} y={0} fill="rgba(232,236,245,0.86)" fontFamily={FONT_BODY} fontSize={23} fontWeight={600} letterSpacing={0}>
              {`${p.short} ${p.min}`}
            </text>
          </g>
        );
      })}
    </g>
  );
};

// =============================================================================
// THE WEEK — the same minutes, seven times, with the guideline drawn as what it actually is:
// an AVERAGE across the week rather than a floor under every day.
// =============================================================================
export type Day = { label: string; min: number };

export const averageOf = (days: Day[]) => days.reduce((a, d) => a + d.min, 0) / days.length;

export const WeekBars: React.FC<{
  days: Day[];
  reveal: number; // 0..1, bars grow in order
  target: number;
  x: number;
  y: number; // baseline
  w: number;
  h: number; // px for the tallest day
  highlight?: string; // label of the day the video just built
  opacity?: number;
}> = ({ days, reveal, target, x, y, w, h, highlight, opacity = 1 }) => {
  if (opacity <= 0.01) return null;
  const maxMin = Math.max(...days.map((d) => d.min));
  const bw = (w / days.length) * 0.62;
  const gap = w / days.length;
  const avg = averageOf(days);
  const yFor = (m: number) => y - (m / maxMin) * h;
  return (
    <g opacity={opacity}>
      {days.map((d, i) => {
        // bars arrive left to right, each over a third of the reveal window
        const g = clamp01((reveal * days.length - i) / 0.62);
        const top = y - (d.min / maxMin) * h * EASE_OUT(g);
        const cx = x + i * gap + gap / 2;
        const hot = d.label === highlight;
        return (
          <g key={d.label}>
            <rect
              x={cx - bw / 2}
              y={top}
              width={bw}
              height={Math.max(0, y - top)}
              rx={8}
              fill={hot ? KID_COLORS.accent : d.min >= target ? KID_COLORS.teal : KID_COLORS.violet}
              opacity={hot ? 1 : 0.82}
            />
            <text
              x={cx}
              y={y + 34}
              fill={hot ? KID_COLORS.accent : 'rgba(232,236,245,0.62)'}
              fontFamily={FONT_BODY}
              fontSize={24}
              fontWeight={600}
              letterSpacing={2}
              textAnchor="middle"
            >
              {d.label}
            </text>
          </g>
        );
      })}
      {/* The guideline, drawn where it belongs: through the MEAN, not under every bar.
          The two lines sit within a few minutes of each other by design — which is the claim —
          so they are NOT labelled in place. A label on a line that close to another line reads
          as a label on the wrong line; the key below carries the names instead. */}
      <g opacity={EASE_OUT(clamp01((reveal - 0.72) / 0.28))}>
        <line x1={x - 10} y1={yFor(target)} x2={x + w + 10} y2={yFor(target)} stroke={KID_COLORS.text} strokeWidth={3} strokeDasharray="9 8" opacity={0.7} />
        <line x1={x - 10} y1={yFor(avg)} x2={x + w + 10} y2={yFor(avg)} stroke={KID_COLORS.accent} strokeWidth={5} />
        <g transform={`translate(${x} ${y - h - 74})`}>
          <line x1={0} y1={-9} x2={44} y2={-9} stroke={KID_COLORS.accent} strokeWidth={5} />
          <text x={58} y={0} fill={KID_COLORS.accent} fontFamily={FONT_BODY} fontSize={28} fontWeight={700} letterSpacing={2}>
            {`AVERAGE ${Math.round(avg)}`}
          </text>
          <line x1={0} y1={35} x2={44} y2={35} stroke={KID_COLORS.text} strokeWidth={3} strokeDasharray="9 8" opacity={0.7} />
          <text x={58} y={44} fill="rgba(232,236,245,0.80)" fontFamily={FONT_BODY} fontSize={28} fontWeight={600} letterSpacing={2}>
            {`TARGET ${target}`}
          </text>
        </g>
      </g>
    </g>
  );
};
