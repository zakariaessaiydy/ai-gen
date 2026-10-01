// =============================================================================
// lib/bone.tsx — THE OSSIFICATION ENGINE (a skeleton is a COUNT that falls)
//
// A newborn is not a small adult. It is the same body delivered in more pieces, because a
// bone can only get longer at a gap, and a skull can only be born and then hold a doubling
// brain if it is not finished yet. So the interesting quantity is not "how many bones" but
// "how many pieces, at what age" — a function, sampled.
//
// Everything on screen is read back off that one function:
//   * the big number is countAt(age), summed over the groups below — never typed
//   * every seam in the figure is that group's own openness at the same age
//   * the axis bands are the groups' closure windows, drawn where the model says they are
//   * the figure's proportions are a second function of age (head fraction 1/4 -> 1/7.4)
// so a mistimed frame shows a WRONG number rather than hiding behind a right-looking one.
//
// Same ethos as prob.tsx's seeded trials, map.tsx's real Mercator, orbit.tsx's Verlet
// integrator and recall.tsx's fitted power law: never assert what the code can compute.
//
// HONESTY, DRAWN IN: the adult 206 is a definite number. The newborn ~300 is NOT — published
// estimates run 270-300, because at birth a great many "bones" are still cartilage and the
// count depends on what you agree to count. So the two ends are modelled differently: the
// NAMED groups below are documented fusions with documented windows, and everything else is
// one honest aggregate that carries the residual. The chip prints a leading "≈" for every
// value that is not one of the two anchors, and the source plate states the range.
// =============================================================================
import React from 'react';
import { Easing } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const BONE_COLORS = {
  stage: '#0b0e14',
  bone: '#e9e4d8', // the bone itself — warm ivory against the cold stage
  boneDim: '#a9a596',
  cartilage: '#5d6b80', // the parts that are not bone yet
  seam: '#f5d76e', // brand yellow — an OPEN gap, i.e. somewhere still growing
  fused: '#4db8a8', // brand teal — a gap that has closed for good
  brain: '#9b7cc4', // brand violet
  dim: '#8b93a7',
  text: '#e8ecf5',
  accent: '#f5d76e',
} as const;

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
/** Smooth 0..1 ramp of x through [a,b]. Every fusion below closes on this curve. */
export const smooth = (x: number, a: number, b: number) => {
  const t = clamp01((x - a) / Math.max(1e-6, b - a));
  return t * t * (3 - 2 * t);
};

// =============================================================================
// THE MODEL — groups of pieces, and the age window each one spends closing.
// =============================================================================
export type Group = {
  key: string;
  label: string;
  /** Separate pieces present at birth. */
  n0: number;
  /** Separate bones left in a finished adult. */
  n1: number;
  /** Age in years at which this group starts fusing... */
  a: number;
  /** ...and at which it is done. */
  b: number;
  /** The published window, printed on screen rather than hidden. */
  window: string;
  named: boolean;
};

/**
 * The documented fusions, then one aggregate for everything else.
 *
 *  frontal   the metopic suture: the frontal bone arrives as a left and a right half
 *  clavicle  the medial clavicular epiphysis — the LAST epiphysis in the body to fuse
 *  hip       ilium + ischium + pubis meet at the triradiate cartilage, one Y per side
 *  sacrum    five sacral vertebrae become the sacrum, lowest pair first, S1-S2 last
 *  coccyx    the tailbone's segments, last of the vertebral column
 *  sternum   the sternebrae of the body of the sternum
 *  plates    every other ossification centre in the skeleton: each long bone is a shaft and
 *            two ends, and each end is a separate piece until its growth plate closes
 */
export const GROUPS: Group[] = [
  { key: 'frontal', label: 'FRONTAL BONE', n0: 2, n1: 1, a: 0.25, b: 1.6, window: '3-19 MONTHS', named: true },
  { key: 'plates', label: 'GROWTH PLATES', n0: 275, n1: 198, a: 1, b: 20, window: 'TO ~20 YEARS', named: false },
  { key: 'hip', label: 'HIP BONES', n0: 6, n1: 2, a: 14, b: 20, window: '14-20 YEARS', named: true },
  { key: 'sternum', label: 'STERNUM', n0: 4, n1: 1, a: 15, b: 25, window: '15-25 YEARS', named: true },
  { key: 'sacrum', label: 'SACRUM', n0: 5, n1: 1, a: 16, b: 25, window: '16-30 YEARS', named: true },
  { key: 'coccyx', label: 'COCCYX', n0: 4, n1: 1, a: 18, b: 25, window: '18-25 YEARS', named: true },
  { key: 'clavicle', label: 'COLLARBONE', n0: 4, n1: 2, a: 22, b: 25, window: '22-30 YEARS', named: true },
];

export const G = (key: string): Group => GROUPS.find((g) => g.key === key) as Group;

/** 0 = this group is still in as many pieces as it was born in, 1 = fused for good. */
export const closedAt = (g: Group, age: number) => smooth(age, g.a, g.b);
/** How wide this group's seams are drawn. 1 = a newborn gap. */
export const openAt = (g: Group, age: number) => 1 - closedAt(g, age);
/** Pieces this group is in, at this age. Fractional between the anchors — that is the point. */
export const piecesAt = (g: Group, age: number) => g.n0 - (g.n0 - g.n1) * closedAt(g, age);

/** THE NUMBER. Summed, never typed. 300 at birth by construction, 206 at 25. */
export const countAt = (age: number) => GROUPS.reduce((s, g) => s + piecesAt(g, age), 0);

export const AGE_MAX = 25;
export const BIRTH_COUNT = Math.round(countAt(0)); // 300
export const ADULT_COUNT = Math.round(countAt(AGE_MAX)); // 206

// =============================================================================
// THE AXIS — birth to twenty-five. Linear time crushes the first year to nothing and a log
// axis crushes the twenties, and this video needs BOTH ends: the skull closes before you can
// walk, the collarbone closes when you can rent a car. A power axis gives each about a third
// of the rail.
// =============================================================================
const AXIS_POW = 0.62;
/** age (years) -> 0..1 across the rail. */
export const pOf = (age: number) => Math.pow(clamp01(age / AGE_MAX), AXIS_POW);
/** ...and back. `u`, the one scalar this whole video runs on, IS the rail position. */
export const ageOf = (p: number) => AGE_MAX * Math.pow(clamp01(p), 1 / AXIS_POW);

/** How the count reads: exact at the two anchors, approximate everywhere between. */
export const countLabel = (age: number) => {
  // 206 is a definite number; every value before it — the newborn ~300 included — is not.
  const n = Math.round(countAt(age));
  return `${age >= AGE_MAX - 1e-4 ? '' : '≈'}${n}`;
};

export const ageLabel = (age: number) => {
  if (age < 0.08) return 'AT BIRTH';
  if (age < 1) return `AT ${Math.round(age * 12)} MONTHS`;
  if (age < 1.5) return 'AT 1 YEAR';
  return `AT ${Math.round(age)} YEARS`;
};

// =============================================================================
// PROPORTIONS — the other function of age. A newborn's head is about a quarter of its length
// and an adult's about a seventh, which is why the same 760px figure can grow without leaving
// the frame: it is the SHARES that move, not the total.
// =============================================================================
export type Figure = {
  cx: number;
  top: number;
  H: number;
  headH: number;
  headW: number;
  headCy: number;
  shoulderY: number;
  shW: number;
  torsoH: number;
  pelvisTop: number;
  pelvisH: number;
  legTop: number;
  legH: number;
};

export const figureAt = (age: number, cx: number, top: number, H: number): Figure => {
  const g = smooth(age, 0, 16);
  const headH = mix(0.25, 0.135, g) * H;
  const headW = headH * 0.92; // a cranium is nearly as wide as it is tall from the front
  const neckH = 0.022 * H;
  const shoulderY = top + headH + neckH;
  const torsoH = 0.295 * H;
  const pelvisTop = shoulderY + torsoH;
  const pelvisH = 0.075 * H;
  const legTop = pelvisTop + pelvisH;
  return {
    cx,
    top,
    H,
    headH,
    headW,
    headCy: top + headH * 0.46,
    shoulderY,
    shW: mix(0.26, 0.32, g) * H,
    torsoH,
    pelvisTop,
    pelvisH,
    legTop,
    legH: top + H - legTop,
  };
};

/**
 * Where a Segmented run's gaps sit, as fractions along it. The shot points its camera and its
 * arrows at a growth plate with this, so the annotation cannot land somewhere the drawing did
 * not put a seam.
 */
export const seamFracs = (L: number, w: number, weights: number[], gapMax?: number) => {
  const n = weights.length;
  const gap = gapMax ?? Math.min(w * 0.8, L * 0.085);
  const body = Math.max(1, L - gap * (n - 1));
  const wsum = weights.reduce((a, b) => a + b, 0);
  const out: number[] = [];
  let t = 0;
  for (let i = 0; i < n - 1; i++) {
    t += (weights[i] / wsum) * body;
    out.push((t + gap / 2) / L);
    t += gap;
  }
  return out;
};

/** THE femur — one definition, used by the drawing below AND by the shot's camera. */
export const femurOf = (f: Figure, side = 1) => {
  const hipX = f.pelvisH * 0.65;
  const bw = f.H * 0.028;
  const kneeY = f.legTop + f.legH * 0.47;
  const x1 = f.cx + side * hipX;
  const x2 = f.cx + side * hipX * 1.15;
  const w = bw * 1.25;
  const L = Math.hypot(x2 - x1, kneeY - f.legTop);
  const at = (fr: number) => ({ x: mix(x1, x2, fr), y: mix(f.legTop, kneeY, fr) });
  return { x1, y1: f.legTop, x2, y2: kneeY, w, L, seams: seamFracs(L, w, [0.17, 0.66, 0.17]).map(at) };
};

// =============================================================================
// PRIMITIVE — a long bone: a shaft, two ends, and the growth plate between them.
//
// This is the whole argument in one component. The gap is not decoration: the segments are
// laid out so that the bone's LENGTH includes its gaps, which is what "a bone gets longer at
// a gap" means. And the ends are drawn as cartilage (hollow, cold) until their own
// ossification centre fills in, because at birth that is what they are.
// =============================================================================
export const Segmented: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  w: number;
  weights?: number[];
  /** 0..1 — this group's openness, scaled to px inside. */
  open: number;
  /** 0..1 — how far the ends have ossified. */
  fill?: number;
  /** px of gap at open = 1. */
  gapMax?: number;
  glow?: number;
  opacity?: number;
}> = ({ x1, y1, x2, y2, w, weights = [0.17, 0.66, 0.17], open, fill = 1, gapMax, glow = 0, opacity = 1 }) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L;
  const uy = dy / L;
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  const n = weights.length;
  const gap = (gapMax ?? Math.min(w * 0.8, L * 0.085)) * clamp01(open);
  const body = Math.max(1, L - gap * (n - 1));
  const wsum = weights.reduce((a, b) => a + b, 0);

  const parts: React.ReactNode[] = [];
  let t = 0;
  for (let i = 0; i < n; i++) {
    const seg = (weights[i] / wsum) * body;
    const mid = t + seg / 2;
    const mx = x1 + ux * mid;
    const my = y1 + uy * mid;
    const end = i === 0 || i === n - 1;
    parts.push(
      <rect
        key={`s${i}`}
        x={mx - seg / 2}
        y={my - w / 2}
        width={seg}
        height={w}
        rx={w / 2}
        transform={`rotate(${deg} ${mx} ${my})`}
        fill={end ? BONE_COLORS.cartilage : BONE_COLORS.bone}
      />,
    );
    if (end && fill > 0.02) {
      // the secondary ossification centre, filling the cartilage end in from its middle
      parts.push(
        <rect
          key={`o${i}`}
          x={mx - (seg * fill) / 2}
          y={my - (w * (0.5 + 0.5 * fill)) / 2}
          width={seg * fill}
          height={w * (0.5 + 0.5 * fill)}
          rx={w / 2}
          transform={`rotate(${deg} ${mx} ${my})`}
          fill={BONE_COLORS.bone}
        />,
      );
    }
    t += seg;
    if (i < n - 1 && gap > 0.4) {
      const gm = t + gap / 2;
      const gx = x1 + ux * gm;
      const gy = y1 + uy * gm;
      parts.push(
        <rect
          key={`g${i}`}
          x={gx - gap / 2}
          y={gy - (w * 0.86) / 2}
          width={gap}
          height={w * 0.86}
          rx={Math.min(gap, w) / 2}
          transform={`rotate(${deg} ${gx} ${gy})`}
          fill={BONE_COLORS.seam}
          opacity={0.55 + 0.45 * glow}
        />,
      );
      t += gap;
    }
  }
  return <g opacity={opacity}>{parts}</g>;
};

// =============================================================================
// THE SKULL — five vault plates, drawn as five wedges radiating from bregma and pushed apart
// along their own directions. The soft spot is not drawn: it is the HOLE the five wedges
// leave behind when they separate, so it closes exactly when they do.
// =============================================================================
const SECTORS: { key: string; a0: number; a1: number }[] = [
  // SVG degrees, y down: 90 is straight down (the face), 270 is up (the back of the head).
  { key: 'frontalR', a0: 20, a1: 90 },
  { key: 'frontalL', a0: 90, a1: 160 },
  { key: 'parietalL', a0: 160, a1: 250 },
  { key: 'occipital', a0: 250, a1: 290 },
  { key: 'parietalR', a0: 290, a1: 380 },
];

export const Skull: React.FC<{
  f: Figure;
  /** vault-gap openness 0..1 — the fontanelles and the sutures between the five plates. */
  open: number;
  /** the metopic seam specifically: once this hits 0 the two frontal halves are ONE bone. */
  metopic: number;
  /** 0..1 moulding: the plates ride over each other and the vault narrows to be born. */
  fold?: number;
  /** 0..1 -> the brain inside doubles in VOLUME, so the dome grows with it. */
  brain?: number;
  brainOn?: number;
  id: string;
}> = ({ f, open, metopic, fold = 0, brain = 0, brainOn = 0, id }) => {
  const rx = (f.headW / 2) * (1 + 0.08 * brain) * (1 - 0.13 * fold);
  const ry = (f.headH / 2) * (1 + 0.08 * brain) * (1 + 0.09 * fold);
  const cy = f.headCy;
  const R = Math.max(rx, ry) * 2.4;
  const fx = f.cx;
  const fy = cy - ry * 0.44; // bregma: where the two frontals meet the two parietals
  // Adjacent wedges separate by roughly 1.15x this, so a coefficient that looks generous on
  // paper reads as a hairline on a phone. 0.14 is what actually shows a soft spot.
  const gap = 0.11 * ry * clamp01(open);

  const wedge = (a0: number, a1: number) => {
    const r0 = (a0 * Math.PI) / 180;
    const r1 = (a1 * Math.PI) / 180;
    const p0x = fx + R * Math.cos(r0);
    const p0y = fy + R * Math.sin(r0);
    const p1x = fx + R * Math.cos(r1);
    const p1y = fy + R * Math.sin(r1);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M ${fx} ${fy} L ${p0x} ${p0y} A ${R} ${R} 0 ${large} 1 ${p1x} ${p1y} Z`;
  };

  return (
    <g>
      <defs>
        <clipPath id={`${id}-dome`}>
          <ellipse cx={f.cx} cy={cy} rx={rx} ry={ry} />
        </clipPath>
      </defs>

      {/* THE MEMBRANE the plates float in. Without it the gaps read as CRACKS in a broken
          shell; a newborn's sutures and fontanelles are soft tissue, and drawing them as
          tissue is both truer and the difference between "damaged" and "not finished yet". */}
      <ellipse cx={f.cx} cy={cy} rx={rx * 1.02} ry={ry * 1.02} fill={BONE_COLORS.cartilage} opacity={0.55} />

      {/* THE FACE — jaw, cheeks and a nose, drawn first so the vault sits over it. It is not
          part of the vault, so it never separates: only the five plates above it do. Without
          it the dome reads as an egg, and the whole skull beat stops landing. */}
      <path
        d={`M ${f.cx - rx * 0.82} ${cy + ry * 0.3}
            L ${f.cx - rx * 0.62} ${cy + ry * 1.0}
            Q ${f.cx - rx * 0.5} ${cy + ry * 1.34} ${f.cx} ${cy + ry * 1.36}
            Q ${f.cx + rx * 0.5} ${cy + ry * 1.34} ${f.cx + rx * 0.62} ${cy + ry * 1.0}
            L ${f.cx + rx * 0.82} ${cy + ry * 0.3} Z`}
        fill={BONE_COLORS.boneDim}
      />
      <path
        d={`M ${f.cx} ${cy + ry * 0.86} L ${f.cx - rx * 0.13} ${cy + ry * 1.08} L ${f.cx + rx * 0.13} ${
          cy + ry * 1.08
        } Z`}
        fill={BONE_COLORS.stage}
        opacity={0.85}
      />

      {SECTORS.map((s, i) => {
        const midDeg = (s.a0 + s.a1) / 2;
        const mid = (midDeg * Math.PI) / 180;
        // a frontal half is pulled apart by the METOPIC seam, the rest by the vault gaps
        const isFrontal = s.key.indexOf('frontal') === 0;
        const push = gap * (isFrontal ? Math.max(clamp01(metopic), clamp01(open) * 0.5) : 1);
        // moulding: the frontals slide UNDER the parietals, which is how a head is delivered
        const ride = fold * rx * (isFrontal ? -0.17 : 0.05);
        const d = push + ride;
        const orbitX = s.key === 'frontalL' ? -1 : 1;
        return (
          <g key={s.key} transform={`translate(${Math.cos(mid) * d} ${Math.sin(mid) * d})`}>
            <g clipPath={`url(#${id}-dome)`}>
              <path d={wedge(s.a0, s.a1)} fill={BONE_COLORS.bone} opacity={i % 2 === 0 ? 1 : 0.92} />
              <path d={wedge(s.a0, s.a1)} fill="none" stroke={BONE_COLORS.stage} strokeWidth={2.5} opacity={0.55} />
              {/* the orbit belongs to the frontal bone, so it rides with its own half */}
              {isFrontal ? (
                <ellipse
                  cx={f.cx + orbitX * rx * 0.42}
                  cy={cy + ry * 0.6}
                  rx={rx * 0.27}
                  ry={ry * 0.21}
                  fill={BONE_COLORS.stage}
                  opacity={0.92}
                />
              ) : null}
            </g>
          </g>
        );
      })}

      {/* THE BRAIN — over the vault, not behind it: an opaque skull hides it completely, and
          the whole point of the beat is that you can see what is pushing. Volume doubles, so
          the radius goes up by sqrt(2), not by 2. */}
      {brainOn > 0.01 ? (
        <g opacity={brainOn} clipPath={`url(#${id}-dome)`}>
          <ellipse
            cx={f.cx}
            cy={cy + ry * 0.02}
            rx={rx * 0.59 * mix(1, Math.SQRT2, brain)}
            ry={ry * 0.54 * mix(1, Math.SQRT2, brain)}
            fill={BONE_COLORS.brain}
            opacity={0.62}
          />
          <ellipse
            cx={f.cx}
            cy={cy + ry * 0.02}
            rx={rx * 0.59 * mix(1, Math.SQRT2, brain)}
            ry={ry * 0.54 * mix(1, Math.SQRT2, brain)}
            fill="none"
            stroke={BONE_COLORS.brain}
            strokeWidth={3}
          />
        </g>
      ) : null}

      {/* the metopic seam, lit while it still exists */}
      {metopic > 0.02 ? (
        <line
          x1={fx}
          y1={fy}
          x2={fx}
          y2={cy + ry * 0.72}
          stroke={BONE_COLORS.seam}
          strokeWidth={Math.max(2.5, gap * 0.85)}
          opacity={0.3 + 0.6 * clamp01(metopic)}
        />
      ) : null}
    </g>
  );
};

// =============================================================================
// SACRUM / COCCYX / HIP — the named fusions that are worth drawing as shapes.
// =============================================================================
export const SacrumStack: React.FC<{ f: Figure; open: number }> = ({ f, open }) => {
  const top = f.pelvisTop;
  const h = f.pelvisH * 0.62;
  const gap = f.pelvisH * 0.08 * clamp01(open);
  const seg = (h - gap * 4) / 5;
  return (
    <g>
      {[0, 1, 2, 3, 4].map((i) => {
        const w = f.H * (0.062 - i * 0.008);
        const y = top + i * (seg + gap);
        return (
          <g key={`sa${i}`}>
            <rect x={f.cx - w / 2} y={y} width={w} height={seg} rx={f.H * 0.006} fill={BONE_COLORS.bone} />
            {i < 4 && gap > 0.6 ? (
              <rect x={f.cx - w / 2 + 1} y={y + seg} width={w - 2} height={gap} fill={BONE_COLORS.seam} opacity={0.8} />
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

export const CoccyxStack: React.FC<{ f: Figure; open: number }> = ({ f, open }) => {
  const top = f.pelvisTop + f.pelvisH * 0.66;
  const h = f.pelvisH * 0.3;
  const gap = f.pelvisH * 0.035 * clamp01(open);
  const seg = (h - gap * 3) / 4;
  return (
    <g>
      {[0, 1, 2, 3].map((i) => {
        const w = f.H * (0.026 - i * 0.004);
        return (
          <rect
            key={`co${i}`}
            x={f.cx - w / 2}
            y={top + i * (seg + gap)}
            width={w}
            height={seg}
            rx={f.H * 0.004}
            fill={BONE_COLORS.boneDim}
          />
        );
      })}
    </g>
  );
};

/** ilium (wing), ischium (lower rear), pubis (lower front) around the triradiate Y. */
export const HipBone: React.FC<{ f: Figure; open: number; side: number }> = ({ f, open, side }) => {
  const cx = f.cx;
  const y0 = f.pelvisTop - f.pelvisH * 0.2;
  const W = f.H * 0.1;
  const d = f.pelvisH * 0.15 * clamp01(open);
  const s = side;
  const ac = { x: cx + s * W * 0.92, y: y0 + f.pelvisH * 0.75 }; // the acetabulum
  const P = (pts: number[][]) => pts.map((p) => `${p[0]} ${p[1]}`).join(' L ');
  const ilium = `M ${P([
    [ac.x - s * W * 0.3, ac.y - f.pelvisH * 0.16],
    [cx + s * W * 0.18, y0],
    [cx + s * W * 1.3, y0 + f.pelvisH * 0.1],
    [ac.x + s * W * 0.22, ac.y - f.pelvisH * 0.18],
  ])} Z`;
  const ischium = `M ${P([
    [ac.x - s * W * 0.22, ac.y + f.pelvisH * 0.03],
    [ac.x + s * W * 0.26, ac.y + f.pelvisH * 0.03],
    [ac.x + s * W * 0.06, ac.y + f.pelvisH * 0.5],
    [ac.x - s * W * 0.44, ac.y + f.pelvisH * 0.44],
  ])} Z`;
  const pubis = `M ${P([
    [ac.x - s * W * 0.36, ac.y - f.pelvisH * 0.12],
    [ac.x - s * W * 0.36, ac.y + f.pelvisH * 0.12],
    [cx + s * W * 0.05, ac.y + f.pelvisH * 0.36],
    [cx + s * W * 0.05, ac.y + f.pelvisH * 0.1],
  ])} Z`;
  return (
    <g>
      <g transform={`translate(${s * d * 0.35} ${-d})`}>
        <path d={ilium} fill={BONE_COLORS.bone} />
      </g>
      <g transform={`translate(${s * d * 0.5} ${d * 0.85})`}>
        <path d={ischium} fill={BONE_COLORS.bone} />
      </g>
      <g transform={`translate(${-s * d * 0.85} ${d * 0.5})`}>
        <path d={pubis} fill={BONE_COLORS.bone} />
      </g>
      {open > 0.05 ? (
        <circle cx={ac.x} cy={ac.y} r={f.pelvisH * 0.15 * clamp01(open)} fill={BONE_COLORS.seam} opacity={0.85} />
      ) : null}
    </g>
  );
};

// =============================================================================
// THE FIGURE — one schematic skeleton whose every seam is a group's openness at this age.
// =============================================================================
export const Skeleton: React.FC<{
  age: number;
  id: string;
  /** The figure's box — owned by the shot, so the camera and the drawing cannot disagree. */
  top: number;
  H: number;
  cx?: number;
  fold?: number;
  brain?: number;
  brainOn?: number;
  /** 0..1 — lights every growth plate in the body, for the beat that is about them. */
  glow?: number;
}> = ({ age, id, top, H, cx = 540, fold = 0, brain = 0, brainOn = 0, glow = 0 }) => {
  const f = figureAt(age, cx, top, H);
  const plates = openAt(G('plates'), age);
  const ends = smooth(age, 0.4, 9); // secondary ossification centres filling in
  const hip = openAt(G('hip'), age);
  const sac = openAt(G('sacrum'), age);
  const coc = openAt(G('coccyx'), age);
  const ste = openAt(G('sternum'), age);
  const cla = openAt(G('clavicle'), age);
  const met = openAt(G('frontal'), age);
  const vault = 1 - smooth(age, 0.25, 2); // the fontanelles closing

  const halfSh = f.shW / 2;
  const armTop = f.shoulderY + f.torsoH * 0.06;
  const elbowY = armTop + f.torsoH * 0.5;
  const wristY = elbowY + f.torsoH * 0.46;
  const armX = halfSh * 1.02;
  const kneeY = f.legTop + f.legH * 0.47;
  const ankleY = f.legTop + f.legH * 0.93;
  const hipX = f.pelvisH * 0.65;
  const bw = f.H * 0.028;

  const ribY0 = f.shoulderY + f.torsoH * 0.12;

  return (
    <g>
      {/* RIBS — context, not content: they carry no seam the video talks about */}
      {[0, 1, 2, 3, 4].map((i) => {
        const y = ribY0 + (i * f.torsoH * 0.4) / 4;
        const spread = halfSh * (0.6 + 0.16 * i);
        const drop = f.torsoH * (0.15 + 0.05 * i);
        return (
          <g key={`rib${i}`} opacity={0.5}>
            {[-1, 1].map((s) => (
              <path
                key={s}
                d={`M ${f.cx + s * f.H * 0.014} ${y} Q ${f.cx + s * spread} ${y + drop * 0.2} ${
                  f.cx + s * spread * 0.72
                } ${y + drop}`}
                fill="none"
                stroke={BONE_COLORS.boneDim}
                strokeWidth={f.H * 0.011}
                strokeLinecap="round"
              />
            ))}
          </g>
        );
      })}

      {/* SPINE — the lumbar column, which never fuses, above the sacrum, which does */}
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={`v${i}`}
          x={f.cx - f.H * 0.026}
          y={f.shoulderY + f.torsoH * (0.63 + i * 0.085)}
          width={f.H * 0.052}
          height={f.torsoH * 0.06}
          rx={f.H * 0.008}
          fill={BONE_COLORS.boneDim}
        />
      ))}

      <SacrumStack f={f} open={sac} />
      <CoccyxStack f={f} open={coc} />

      <HipBone f={f} open={hip} side={-1} />
      <HipBone f={f} open={hip} side={1} />

      {/* STERNUM — the sternebrae, one column of four */}
      {[0, 1, 2, 3].map((i) => {
        const h = f.torsoH * 0.04;
        const g0 = f.torsoH * 0.02 * clamp01(ste);
        return (
          <rect
            key={`st${i}`}
            x={f.cx - f.H * 0.021}
            y={f.shoulderY + f.torsoH * 0.15 + i * (h + g0)}
            width={f.H * 0.042}
            height={h}
            rx={f.H * 0.007}
            fill={BONE_COLORS.bone}
          />
        );
      })}

      {/* CLAVICLES — a shaft, and the medial end that is the last piece in the body to join */}
      {[-1, 1].map((s) => (
        <Segmented
          key={`cl${s}`}
          x1={f.cx + s * f.H * 0.024}
          y1={f.shoulderY + f.torsoH * 0.045}
          x2={f.cx + s * halfSh}
          y2={f.shoulderY + f.torsoH * 0.005}
          w={f.H * 0.02}
          weights={[0.22, 0.78]}
          open={cla}
          fill={smooth(age, 14, 22)}
          gapMax={f.H * 0.017}
          glow={1}
        />
      ))}

      {/* LIMBS — every one of them a shaft and two ends, until it is not */}
      {[-1, 1].map((s) => (
        <g key={`arm${s}`}>
          <Segmented
            x1={f.cx + s * armX}
            y1={armTop}
            x2={f.cx + s * armX * 1.16}
            y2={elbowY}
            w={bw}
            open={plates}
            fill={ends}
            glow={glow}
          />
          <Segmented
            x1={f.cx + s * (armX * 1.16 - bw * 0.55)}
            y1={elbowY}
            x2={f.cx + s * (armX * 1.22 - bw * 0.55)}
            y2={wristY}
            w={bw * 0.6}
            open={plates}
            fill={ends}
            glow={glow}
          />
          <Segmented
            x1={f.cx + s * (armX * 1.16 + bw * 0.55)}
            y1={elbowY}
            x2={f.cx + s * (armX * 1.22 + bw * 0.55)}
            y2={wristY}
            w={bw * 0.6}
            open={plates}
            fill={ends}
            glow={glow}
          />
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={`h${i}`}
              x={f.cx + s * armX * 1.22 - bw * 0.72 + i * bw * 0.48}
              y={wristY + bw * 0.5}
              width={bw * 0.28}
              height={bw * 1.4}
              rx={bw * 0.14}
              fill={BONE_COLORS.boneDim}
            />
          ))}
        </g>
      ))}

      {[-1, 1].map((s) => (
        <g key={`leg${s}`}>
          <Segmented
            x1={femurOf(f, s).x1}
            y1={femurOf(f, s).y1}
            x2={femurOf(f, s).x2}
            y2={femurOf(f, s).y2}
            w={femurOf(f, s).w}
            open={plates}
            fill={ends}
            glow={glow}
          />
          <Segmented
            x1={f.cx + s * (hipX * 1.15 - bw * 0.35)}
            y1={kneeY}
            x2={f.cx + s * (hipX * 1.15 - bw * 0.35)}
            y2={ankleY}
            w={bw * 0.95}
            open={plates}
            fill={ends}
            glow={glow}
          />
          <Segmented
            x1={f.cx + s * (hipX * 1.15 + bw * 0.62)}
            y1={kneeY}
            x2={f.cx + s * (hipX * 1.15 + bw * 0.62)}
            y2={ankleY}
            w={bw * 0.38}
            open={plates}
            fill={ends}
            glow={glow}
          />
          <rect
            x={f.cx + s * hipX * 1.15 - (s > 0 ? bw * 0.6 : bw * 1.9)}
            y={ankleY + bw * 0.35}
            width={bw * 2.5}
            height={bw * 0.75}
            rx={bw * 0.37}
            fill={BONE_COLORS.boneDim}
          />
        </g>
      ))}

      <Skull f={f} open={vault} metopic={met} fold={fold} brain={brain} brainOn={brainOn} id={id} />
    </g>
  );
};

// =============================================================================
// UI — the readout, the rail, the callout, the source plate. These live OUTSIDE the camera
// group: the figure is what gets zoomed, the instruments never move.
// =============================================================================
export const CountRow: React.FC<{ age: number; y: number; opacity?: number }> = ({ age, y, opacity = 1 }) => {
  const cell = (x: number, w: number, big: string, small: string, color: string, dim: boolean) => (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={166}
        rx={20}
        fill="rgba(12,16,24,0.85)"
        stroke={dim ? 'rgba(245,215,110,0.28)' : `${color}88`}
        strokeWidth={2}
      />
      <text
        x={x + w / 2}
        y={y + 102}
        textAnchor="middle"
        fontFamily={FONT_DISPLAY}
        fontWeight={700}
        fontSize={92}
        fill={dim ? BONE_COLORS.dim : color}
      >
        {big}
      </text>
      <text
        x={x + w / 2}
        y={y + 141}
        textAnchor="middle"
        fontFamily={FONT_BODY}
        fontWeight={600}
        fontSize={25}
        letterSpacing={4}
        fill={dim ? 'rgba(139,147,167,0.8)' : `${color}cc`}
      >
        {small}
      </text>
    </g>
  );
  return (
    <g opacity={opacity}>
      {cell(104, 372, `≈${BIRTH_COUNT}`, 'AT BIRTH', BONE_COLORS.seam, true)}
      <text
        x={540}
        y={y + 100}
        textAnchor="middle"
        fontFamily={FONT_DISPLAY}
        fontWeight={700}
        fontSize={54}
        fill={BONE_COLORS.dim}
      >
        {'→'}
      </text>
      {cell(604, 372, countLabel(age), ageLabel(age), BONE_COLORS.fused, false)}
    </g>
  );
};

/** The rail: birth on the left, twenty-five on the right, every documented window on it. */
export const AgeAxis: React.FC<{ age: number; y: number; opacity?: number; lit?: string }> = ({
  age,
  y,
  opacity = 1,
  lit,
}) => {
  const x0 = 104;
  const w = 872;
  const X = (a: number) => x0 + pOf(a) * w;
  const ticks = [0.5, 2, 5, 10, 15, 20, 25];
  return (
    <g opacity={opacity}>
      <rect x={x0} y={y} width={w} height={6} rx={3} fill="rgba(255,255,255,0.12)" />
      {GROUPS.filter((g) => g.named).map((g, i) => {
        const on = lit === g.key;
        return (
          <rect
            key={g.key}
            x={X(g.a)}
            y={y - 10 - (i % 2) * 14}
            width={Math.max(6, X(g.b) - X(g.a))}
            height={26}
            rx={8}
            fill={on ? BONE_COLORS.seam : 'rgba(245,215,110,0.2)'}
            opacity={on ? 0.95 : 0.75}
          />
        );
      })}
      <rect x={x0} y={y} width={pOf(age) * w} height={6} rx={3} fill={BONE_COLORS.fused} />
      <g transform={`translate(${X(age)} ${y + 3})`}>
        <circle r={22} fill="none" stroke={BONE_COLORS.fused} strokeWidth={2} opacity={0.45} />
        <circle r={13} fill={BONE_COLORS.fused} />
      </g>
      {ticks.map((t) => (
        <text
          key={t}
          x={X(t)}
          y={y + 52}
          textAnchor="middle"
          fontFamily={FONT_MONO}
          fontSize={23}
          fill={BONE_COLORS.dim}
        >
          {t < 1 ? '6M' : `${t}Y`}
        </text>
      ))}
      <text
        x={x0}
        y={y - 44}
        fontFamily={FONT_BODY}
        fontWeight={600}
        fontSize={24}
        letterSpacing={5}
        fill={BONE_COLORS.dim}
      >
        BIRTH
      </text>
      <text
        x={x0 + w}
        y={y - 44}
        textAnchor="end"
        fontFamily={FONT_BODY}
        fontWeight={600}
        fontSize={24}
        letterSpacing={5}
        fill={BONE_COLORS.dim}
      >
        25 YEARS
      </text>
    </g>
  );
};

/** A named fusion, printed with what it was, what it became, and the published window. */
export const Callout: React.FC<{
  x: number;
  y: number;
  w?: number;
  group: Group;
  note?: string;
  opacity?: number;
  color?: string;
}> = ({ x, y, w = 500, group, note, opacity = 1, color = BONE_COLORS.seam }) => {
  if (opacity <= 0.01) return null;
  const h = note ? 172 : 126;
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={h} rx={18} fill="rgba(10,14,22,0.92)" stroke={`${color}66`} strokeWidth={2} />
      <rect x={x} y={y} width={9} height={h} rx={4} fill={color} />
      <text x={x + 30} y={y + 44} fontFamily={FONT_BODY} fontWeight={600} fontSize={26} letterSpacing={4} fill={color}>
        {group.label}
      </text>
      <text x={x + 30} y={y + 102} fontFamily={FONT_DISPLAY} fontWeight={700} fontSize={50} fill={BONE_COLORS.text}>
        {group.n0} {'→'} {group.n1}
      </text>
      <text
        x={x + w - 30}
        y={y + 102}
        textAnchor="end"
        fontFamily={FONT_MONO}
        fontSize={26}
        fill={BONE_COLORS.dim}
      >
        {group.window}
      </text>
      {note ? (
        <text x={x + 30} y={y + 148} fontFamily={FONT_BODY} fontWeight={500} fontSize={28} fill="rgba(232,236,245,0.8)">
          {note}
        </text>
      ) : null}
    </g>
  );
};

/** A callout for something that is not one of the modelled groups (a mechanism, not a count). */
export const Note: React.FC<{
  x: number;
  y: number;
  w?: number;
  label: string;
  big: string;
  sub?: string;
  opacity?: number;
  color?: string;
}> = ({ x, y, w = 500, label, big, sub, opacity = 1, color = BONE_COLORS.seam }) => {
  if (opacity <= 0.01) return null;
  const h = sub ? 172 : 126;
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={h} rx={18} fill="rgba(10,14,22,0.92)" stroke={`${color}66`} strokeWidth={2} />
      <rect x={x} y={y} width={9} height={h} rx={4} fill={color} />
      <text x={x + 30} y={y + 44} fontFamily={FONT_BODY} fontWeight={600} fontSize={26} letterSpacing={4} fill={color}>
        {label}
      </text>
      <text x={x + 30} y={y + 100} fontFamily={FONT_DISPLAY} fontWeight={700} fontSize={44} fill={BONE_COLORS.text}>
        {big}
      </text>
      {sub ? (
        <text x={x + 30} y={y + 148} fontFamily={FONT_BODY} fontWeight={500} fontSize={28} fill="rgba(232,236,245,0.8)">
          {sub}
        </text>
      ) : null}
    </g>
  );
};

/** Two arrows pushing apart, drawn ON the seam they are about: growth happens HERE. */
export const PlateArrows: React.FC<{ x: number; y: number; len: number; opacity?: number }> = ({
  x,
  y,
  len,
  opacity = 1,
}) => {
  if (opacity <= 0.01) return null;
  const a = (dir: number) => (
    <g key={dir} transform={`translate(${x} ${y + dir * len * 0.34})`}>
      <line x1={0} y1={0} x2={0} y2={dir * len * 0.5} stroke={BONE_COLORS.seam} strokeWidth={5} strokeLinecap="round" />
      <path
        d={`M ${-11} ${dir * len * 0.42} L 0 ${dir * len * 0.62} L 11 ${dir * len * 0.42} Z`}
        fill={BONE_COLORS.seam}
      />
    </g>
  );
  return (
    <g opacity={opacity}>
      {a(-1)}
      {a(1)}
    </g>
  );
};

export const Source: React.FC<{ y: number; opacity?: number }> = ({ y, opacity = 0.85 }) => (
  <g opacity={opacity}>
    <text x={540} y={y} textAnchor="middle" fontFamily={FONT_MONO} fontSize={20} fill="rgba(139,147,167,0.92)">
      NEWBORN COUNT IS AN ESTIMATE (270-300) · BRAIN +101% IN YEAR ONE: KNICKMEYER 2008
    </text>
  </g>
);
