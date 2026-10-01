// lib/loops.tsx — open loops: unfinished things circling a mind on tilted orbits, and the paper that
// takes them off it.
//
// The engine's one rule: nothing about the circling is keyframed. A thought is an ORBIT (a ring and
// an INTEGER lap count over the composition) plus one scalar, `closed` (0 = circling, 1 = written
// down). Where it is, how big it looks, whether it is at the front of the mind, and how many times it
// has come back are all read off that one angle — so "it came back 9 times" is the orbits counting,
// not a caption. Integer laps also make every orbit loop-safe by construction: the angle at frame 0
// and at frame END differ by a whole number of turns.
//
// Canvas space is the 1080x1920 frame. Depth is sin(angle): +1 is the point of the ring nearest the
// viewer — the FRONT of the mind — where a thought is drawn biggest and brightest.
import React from 'react';
import { Easing, interpolateColors } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const LOOP_COLORS = {
  stage: '#0d1018',
  glow: '#1a2138',
  head: '#aab3d0',
  dim: '#8b93a7',
  text: '#e8ecf5',
  accent: '#f5d76e',
  indigo: '#6366F1',
  violet: '#9b7cc4',
  teal: '#4db8a8',
  pink: '#e8879f',
  paper: '#f3efe4',
  rule: '#c9d3e6',
  margin: '#e8879f',
  ink: '#1a1a2e',
  inkSoft: '#55586b',
  inkTeal: '#2a7f73',
  inkTime: '#b0521f',
} as const;
const C = LOOP_COLORS;

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const TAU = Math.PI * 2;
/** The angle nearest the viewer: "the front of your mind". */
export const FRONT = Math.PI / 2;
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

// =============================================================================
// ORBITS
// =============================================================================
export type Ring = { cx: number; cy: number; rx: number; ry: number; tilt: number /* degrees */ };
export type Thought = {
  id: string;
  text: string; // what circles
  time: string; // the next step's WHEN
  step: string; // the next step's WHAT
  ring: number;
  laps: number; // INTEGER turns over the whole composition — the loop-safety contract
  phase0: number; // 0..1 of a turn at frame 0
  color: string;
};
export type OrbitPt = { x: number; y: number; depth: number };

export const ringPoint = (r: Ring, a: number): OrbitPt => {
  const t = (r.tilt * Math.PI) / 180;
  const ex = r.rx * Math.cos(a);
  const ey = r.ry * Math.sin(a);
  return {
    x: r.cx + ex * Math.cos(t) - ey * Math.sin(t),
    y: r.cy + ex * Math.sin(t) + ey * Math.cos(t),
    depth: Math.sin(a),
  };
};

export const angleAt = (th: Thought, f: number, end: number) => TAU * (th.phase0 + (th.laps * f) / end);

/** 1 exactly at the front of its ring, 0 from a quarter-turn either side. */
export const frontness = (th: Thought, f: number, end: number) =>
  Math.pow(Math.max(0, Math.cos(angleAt(th, f, end) - FRONT)), 6);

/** Times the thought reached the front of the mind in (fa, fb], counting only frames where open(f). */
export const comebacks = (th: Thought, fa: number, fb: number, end: number, open: (f: number) => boolean) => {
  const turn = (f: number) => Math.floor((angleAt(th, f, end) - FRONT) / TAU);
  let n = 0;
  for (let f = Math.floor(fa) + 1; f <= fb; f++) if (turn(f) > turn(f - 1) && open(f)) n++;
  return n;
};

/** Where a circling thought is drawn, and how: nearer = bigger and brighter, front = biggest. */
export const orbitPose = (th: Thought, ring: Ring, f: number, end: number) => {
  const p = ringPoint(ring, angleAt(th, f, end));
  const near = (p.depth + 1) / 2;
  const fr = frontness(th, f, end);
  return { x: p.x, y: p.y, depth: p.depth, scale: 0.7 + 0.26 * near + 0.16 * fr, opacity: 0.42 + 0.58 * near, front: fr };
};

// =============================================================================
// PAPER — where a closed loop lives. Rows are slots; a thought's slot is its index.
// =============================================================================
export type PadBox = { x: number; y: number; w: number; head: number; rowH: number; col2: number };
export const padHeight = (pad: PadBox, rows: number) => pad.head + rows * pad.rowH + 22;
export const rowY = (pad: PadBox, i: number) => pad.y + pad.head + (i + 0.5) * pad.rowH;
export const CHIP_SIZE = 30;
export const PAD_SIZE = 29;
/** Estimated rendered width of a chip's label — the chip is centred, so its landing x needs it. */
export const textW = (text: string, size: number) => text.length * size * 0.52;
/** The centre a chip must land on so its text starts at the row's first column. */
export const slotPt = (pad: PadBox, i: number, text: string) => ({
  x: pad.x + 64 + textW(text, PAD_SIZE) / 2,
  y: rowY(pad, i),
});

/** A thought in flight from its orbit to its slot: an arc, not a slide. */
export const flight = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) => ({
  x: mix(a.x, b.x, t),
  y: mix(a.y, b.y, t) - 110 * Math.sin(Math.PI * t),
});

// =============================================================================
// DRAWING
// =============================================================================
export const LoopDefs: React.FC = () => (
  <defs>
    <filter id="loopGlow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="12" />
    </filter>
    <radialGradient id="headQuiet" cx="0.48" cy="0.42" r="0.62">
      <stop offset="0%" stopColor={C.indigo} stopOpacity={0.2} />
      <stop offset="100%" stopColor={C.indigo} stopOpacity={0} />
    </radialGradient>
    <radialGradient id="headBusy" cx="0.48" cy="0.42" r="0.62">
      <stop offset="0%" stopColor={C.pink} stopOpacity={0.26} />
      <stop offset="100%" stopColor={C.pink} stopOpacity={0} />
    </radialGradient>
  </defs>
);

/** A right-facing profile, drawn in canvas pixels (crown ~y358, open at the neck ~y1010). */
export const HEAD_PATH =
  'M400,1010 C390,950 370,905 355,870 C250,820 205,720 225,620 C250,450 380,360 520,358 ' +
  'C680,356 790,440 810,560 C815,600 828,625 840,650 C860,690 900,715 906,735 ' +
  'C908,752 880,760 855,768 C862,780 868,792 864,803 C860,812 850,818 848,824 ' +
  'C856,832 862,842 858,856 C852,880 848,895 836,910 C800,935 760,935 730,932 ' +
  'C712,960 700,985 695,1010';

/** busy 0..1 = share of loops still open (warms the inside); pulse = a thought at the front. */
export const Head: React.FC<{ busy: number; pulse: number }> = ({ busy, pulse }) => (
  <g>
    <path d={HEAD_PATH} fill="url(#headQuiet)" opacity={1 - busy} />
    <path d={HEAD_PATH} fill="url(#headBusy)" opacity={busy} />
    <path d={HEAD_PATH} fill="none" stroke={C.pink} strokeWidth={14} opacity={0.22 * pulse * busy} filter="url(#loopGlow)" />
    <path d={HEAD_PATH} fill="none" stroke={C.head} strokeWidth={4} strokeLinecap="round" opacity={0.78} />
  </g>
);

const arcD = (r: Ring, a0: number, a1: number, n = 56) => {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const p = ringPoint(r, a0 + ((a1 - a0) * i) / n);
    d += `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)} `;
  }
  return d;
};

/** Half a ring: the back half is drawn behind everything, dimmer, so the tilt reads as depth. */
export const RingHalf: React.FC<{ ring: Ring; half: 'back' | 'front'; opacity: number; color?: string }> = ({
  ring,
  half,
  opacity,
  color = C.violet,
}) => (
  <path
    d={half === 'back' ? arcD(ring, Math.PI, TAU) : arcD(ring, 0, Math.PI)}
    fill="none"
    stroke={color}
    strokeWidth={half === 'back' ? 2 : 3}
    strokeDasharray={half === 'back' ? '4 10' : undefined}
    strokeLinecap="round"
    opacity={opacity * (half === 'back' ? 0.55 : 1)}
  />
);

/**
 * A thought. `onPaper` 0..1 turns the dark pill into ink on paper: the pill and its border fade, the
 * label goes from white to ink and from chip size to pad size — the same object, now written down.
 */
export const ThoughtChip: React.FC<{
  x: number;
  y: number;
  text: string;
  color: string;
  scale: number;
  opacity: number;
  glow: number;
  onPaper: number;
}> = ({ x, y, text, color, scale, opacity, glow, onPaper }) => {
  const size = mix(CHIP_SIZE, PAD_SIZE, onPaper);
  const w = textW(text, size) + size * 1.3;
  const h = size * 1.75;
  const pill = 1 - onPaper;
  const ink = interpolateColors(onPaper, [0, 1], [C.text, C.ink]);
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale.toFixed(3)})`} opacity={opacity}>
      {glow > 0.01 ? (
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={color} opacity={0.55 * glow * pill} filter="url(#loopGlow)" />
      ) : null}
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={h / 2}
        fill={`rgba(16,20,32,${(0.9 * pill).toFixed(3)})`}
        stroke={color}
        strokeOpacity={pill * (0.55 + 0.45 * glow)}
        strokeWidth={2.5}
      />
      <text
        x={0}
        y={size * 0.36}
        textAnchor="middle"
        style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: size, fill: ink }}
      >
        {text}
      </text>
    </g>
  );
};

/** The notepad: ruled paper, a margin, a header. Rows are drawn empty; thoughts land on them. */
export const Notepad: React.FC<{ pad: PadBox; rows: number; title: string; opacity?: number; glow?: number }> = ({
  pad,
  rows,
  title,
  opacity = 1,
  glow = 0,
}) => {
  const H = padHeight(pad, rows);
  return (
    <g opacity={opacity}>
      <rect x={pad.x} y={pad.y} width={pad.w} height={H} rx={14} fill={C.accent} opacity={0.35 * glow} filter="url(#loopGlow)" />
      <rect x={pad.x} y={pad.y + 8} width={pad.w} height={H} rx={14} fill="rgba(0,0,0,0.35)" />
      <rect x={pad.x} y={pad.y} width={pad.w} height={H} rx={14} fill={C.paper} />
      <line x1={pad.x + 44} y1={pad.y + 10} x2={pad.x + 44} y2={pad.y + H - 10} stroke={C.margin} strokeWidth={2} opacity={0.6} />
      {Array.from({ length: rows }, (_, i) => {
        const y = pad.y + pad.head + (i + 1) * pad.rowH - 4;
        return <line key={i} x1={pad.x + 14} y1={y} x2={pad.x + pad.w - 14} y2={y} stroke={C.rule} strokeWidth={2} />;
      })}
      <text
        x={pad.x + 64}
        y={pad.y + pad.head - 16}
        style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 22, letterSpacing: 4, fill: C.inkSoft }}
      >
        {title}
      </text>
    </g>
  );
};

/** The next step, written left to right as `write` goes 0 -> 1. The WHEN is the specific part. */
export const NextStep: React.FC<{ pad: PadBox; i: number; th: Thought; write: number; timeGlow?: number }> = ({
  pad,
  i,
  th,
  write,
  timeGlow = 0,
}) => {
  if (write <= 0.001) return null;
  const full = `${th.time} · ${th.step}`;
  const n = Math.round(full.length * clamp01(write));
  const tn = Math.min(n, th.time.length);
  const rest = full.slice(th.time.length, n);
  const y = rowY(pad, i) + PAD_SIZE * 0.36;
  const ax = pad.x + pad.col2 - 34;
  const ay = rowY(pad, i);
  return (
    <g>
      <g opacity={clamp01(write * 4)}>
        <line x1={ax - 26} y1={ay} x2={ax - 4} y2={ay} stroke={C.inkTeal} strokeWidth={3} strokeLinecap="round" />
        <path d={`M${ax - 12},${ay - 7} L${ax - 3},${ay} L${ax - 12},${ay + 7}`} fill="none" stroke={C.inkTeal} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {timeGlow > 0.01 ? (
        <rect
          x={pad.x + pad.col2 - 8}
          y={ay - PAD_SIZE * 0.72}
          width={textW(th.time, PAD_SIZE) * 1.08 + 16}
          height={PAD_SIZE * 1.44}
          rx={8}
          fill={C.accent}
          opacity={0.75 * timeGlow}
        />
      ) : null}
      <text x={pad.x + pad.col2} y={y} style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: PAD_SIZE }}>
        <tspan fill={C.inkTime}>{th.time.slice(0, tn)}</tspan>
        <tspan fill={C.inkTeal}>{rest}</tspan>
      </text>
    </g>
  );
};

/** A dot on the front of a ring — "this is where it comes back" — with an optional label under it. */
export const FrontMark: React.FC<{ ring: Ring; opacity: number; label?: string }> = ({ ring, opacity, label }) => {
  if (opacity <= 0.01) return null;
  const p = ringPoint(ring, FRONT);
  if (!label) {
    return <circle cx={p.x} cy={p.y} r={6} fill={C.accent} opacity={opacity} />;
  }
  return (
    <g opacity={opacity}>
      <circle cx={p.x} cy={p.y} r={7} fill={C.accent} />
      <line x1={p.x} y1={p.y + 12} x2={p.x} y2={p.y + 46} stroke={C.accent} strokeWidth={2} strokeDasharray="3 5" />
      <text
        x={p.x}
        y={p.y + 76}
        textAnchor="middle"
        style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 22, letterSpacing: 4, fill: C.accent, stroke: C.stage, strokeWidth: 8, paintOrder: 'stroke' }}
      >
        {label}
      </text>
    </g>
  );
};
