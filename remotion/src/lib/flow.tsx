// Flow kit — a PROPORTIONAL FLOW NETWORK (Sankey) engine: every ribbon's width is its share
// of the trunk, and the trunk is a real physical quantity. Seeds short-15.
//
// The engine in one line: a branch is never given a width. It is given a SHARE, and the width
// falls out of `trunkW * share`. The last branch of a split is the REMAINDER of its parent, so
// the ledger cannot fail to balance even if a share is edited — the same discipline as
// prob.tsx's seeded trials, map.tsx's real Mercator, orbit.tsx's Verlet integrator,
// cycle.tsx's conserved particles and grow.tsx's one solver.
//
// THE CONSEQUENCE THAT BECOMES THE VIDEO: an honest width mapping has no floor. Life's share
// of the sunlight Earth intercepts is 0.08%, so on an 800px trunk its ribbon is 0.64 PIXELS —
// literally sub-pixel, invisible, and correct. The kit therefore ships a LOUPE rather than a
// log scale: bending the width axis would destroy the one claim the diagram exists to make.
// The magnification is derived from the ribbon's own width (`magFor`), never chosen.
//
// Generic by design — a new flow ships a new ledger, not a new engine.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const TAU = Math.PI * 2;
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const frac = (v: number) => v - Math.floor(v);
export const sstep = (t: number, a: number, b: number) => {
  const x = clamp01((t - a) / Math.max(0.0001, b - a));
  return x * x * (3 - 2 * x);
};

// Same generator as lib/cycle.tsx / lib/grow.tsx — kept local so this kit stands alone.
export function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// =============================================================================
// THE PHYSICS — the trunk is not a design decision, it is a computation.
// =============================================================================
export const SOLAR = {
  /** total solar irradiance at 1 AU, W/m^2 (the "solar constant") */
  S: 1361,
  /** Earth's mean radius, m */
  R: 6.371e6,
} as const;

/** Sunlight Earth INTERCEPTS: the irradiance times Earth's shadow disc, not its surface. */
export const interceptedW = () => SOLAR.S * Math.PI * SOLAR.R * SOLAR.R; // 1.7355e17 W
export const TW = 1e12;
export const EJ = 1e18;

/** Joules of sunlight Earth intercepts in `hours` hours. */
export const solarJoules = (hours: number) => interceptedW() * hours * 3600;

export const fmtInt = (v: number) => Math.round(v).toLocaleString('en-US');
/** A percentage printed at the precision it actually carries: 0.08%, 23%, 46.9%. */
export const fmtPct = (share: number) => {
  const p = share * 100;
  if (p >= 10) return `${p.toFixed(p % 1 < 0.05 ? 0 : 1)}%`;
  if (p >= 1) return `${p.toFixed(1)}%`;
  return `${p.toFixed(2)}%`;
};

// =============================================================================
// THE LEDGER — shares of the intercepted sunlight.
//
// Three are measured; the fourth is the REMAINDER, so the four always sum to exactly 1.
// (Bond albedo ~0.30; latent heat of evaporation ~23% of the top-of-atmosphere flux;
// photosynthesis ~0.08%. Sources are listed in the short's beats.json `facts`.)
// =============================================================================
export const SHARES = {
  reflected: 0.3,
  water: 0.23,
  life: 0.0008,
} as const;
/** everything not bounced back, not lifting water and not alive: it warms the planet and re-radiates */
export const heatShare = 1 - SHARES.reflected - SHARES.water - SHARES.life;

export const FLOW_COLORS = {
  space: '#080c14',
  spaceGlow: '#141d2e',
  sun: '#f5d76e',
  sunCore: '#fff6d2',
  beam: '#f3dc93',
  reflected: '#9b7cc4',
  water: '#6366f1',
  heat: '#e8879f',
  life: '#4ecdc4',
  ink: '#0b1018',
  dim: '#8d93a6',
  paper: '#eef2f8',
  accent: '#f5d76e',
} as const;

// =============================================================================
// GEOMETRY — the one place the diagram's fixed points live.
// Everything below y1330 belongs to the captions; everything above y150 to the progress bar.
// =============================================================================
export const FLOW_GEOM = {
  sunX: 540,
  sunY: 76,
  sunR: 150,
  beamY: 226, // where the beam leaves the sun's limb
  beamW: 230,
  bandY: 236, // the strip the title / comparison bars / twist card share
  trunkY: 416, // the beam has spread to full width here
  trunkW: 800,
  trunkX: 540,
  splitAY: 560,
  midY: 790, // the reflected head, and where the absorbed stream is re-gathered
  splitBY: 836,
  headY: 1040, // the three branch heads
  labelY: 1082, // BELOW the heads: at head level the names sat inside the ribbons (QA f0)
  reflX: 190,
  absAX: 660, // absorbed centre at splitAY
  absBX: 640, // absorbed centre at splitBY
  waterX: 290,
  heatX: 600,
  lifeX: 845,
  loupeX: 845,
  loupeY: 1268,
  loupeR: 62,
} as const;

/**
 * The whole diagram, solved from the shares. NOTHING here is a chosen width.
 * `heat` is the remainder of the absorbed stream, so the split is exact by construction.
 */
export function solveLedger(trunkW = FLOW_GEOM.trunkW) {
  const total = interceptedW();
  const wRefl = trunkW * SHARES.reflected;
  const wAbs = trunkW - wRefl;
  const wWater = trunkW * SHARES.water;
  const wLife = trunkW * SHARES.life;
  const wHeat = wAbs - wWater - wLife; // the remainder — the ledger cannot drift
  const g = FLOW_GEOM;
  // where each branch LEAVES the absorbed stream, packed left to right in draw order
  const absLeft = g.absBX - wAbs / 2;
  return {
    total,
    trunkW,
    refl: { w: wRefl, share: SHARES.reflected, watts: total * SHARES.reflected },
    abs: { w: wAbs, share: 1 - SHARES.reflected },
    water: { w: wWater, share: SHARES.water, watts: total * SHARES.water, src: absLeft + wWater / 2 },
    heat: { w: wHeat, share: wHeat / trunkW, watts: total * (wHeat / trunkW), src: absLeft + wWater + wHeat / 2 },
    life: { w: wLife, share: SHARES.life, watts: total * SHARES.life, src: absLeft + wWater + wHeat + wLife / 2 },
  };
}

/** The magnification a sub-pixel ribbon needs to reach `targetPx` — derived, never chosen. */
export const magFor = (widthPx: number, targetPx: number) => Math.round(targetPx / Math.max(1e-6, widthPx));

// =============================================================================
// RIBBONS — the Sankey link: a band that keeps its width while it moves sideways.
// =============================================================================
export type Link = { x0: number; y0: number; w0: number; x1: number; y1: number; w1: number };

/** Cubic bezier with VERTICAL tangents — the standard Sankey link, as a filled band. */
export const linkPath = (l: Link): string => {
  const ym = (l.y0 + l.y1) / 2;
  const l0 = l.x0 - l.w0 / 2;
  const r0 = l.x0 + l.w0 / 2;
  const l1 = l.x1 - l.w1 / 2;
  const r1 = l.x1 + l.w1 / 2;
  return (
    `M ${l0.toFixed(2)} ${l.y0.toFixed(2)} L ${r0.toFixed(2)} ${l.y0.toFixed(2)} ` +
    `C ${r0.toFixed(2)} ${ym.toFixed(2)} ${r1.toFixed(2)} ${ym.toFixed(2)} ${r1.toFixed(2)} ${l.y1.toFixed(2)} ` +
    `L ${l1.toFixed(2)} ${l.y1.toFixed(2)} ` +
    `C ${l1.toFixed(2)} ${ym.toFixed(2)} ${l0.toFixed(2)} ${ym.toFixed(2)} ${l0.toFixed(2)} ${l.y0.toFixed(2)} Z`
  );
};

/** A point on the link's CENTRELINE at 0..1 — what the light packets ride. */
export const linkPoint = (l: Link, t: number): [number, number] => {
  const ym = (l.y0 + l.y1) / 2;
  const u = 1 - t;
  const x = u * u * u * l.x0 + 3 * u * u * t * l.x0 + 3 * u * t * t * l.x1 + t * t * t * l.x1;
  const y = u * u * u * l.y0 + 3 * u * u * t * ym + 3 * u * t * t * ym + t * t * t * l.y1;
  return [x, y];
};

/** The width of the link at 0..1 (linear between the two ends). */
export const linkWidth = (l: Link, t: number) => l.w0 + (l.w1 - l.w0) * clamp01(t);

/**
 * A ribbon, drawn as a fraction `p` of its full run so a split can be DRAWN and UN-DRAWN.
 * p < 1 shortens the link toward its source, which is what the rewind needs.
 */
export const Ribbon: React.FC<{
  link: Link;
  color: string;
  p?: number;
  opacity?: number;
  glow?: number;
}> = ({ link, color, p = 1, opacity = 1, glow = 0 }) => {
  const c = clamp01(p);
  if (c <= 0.001 || opacity <= 0.01) return null;
  const [x1, y1] = linkPoint(link, c);
  const cut: Link = { ...link, x1, y1, w1: linkWidth(link, c) };
  const d = linkPath(cut);
  return (
    <g opacity={opacity}>
      {glow > 0 ? <path d={d} fill="none" stroke={color} strokeWidth={14} opacity={0.22 * glow} /> : null}
      <path d={d} fill={color} />
    </g>
  );
};

/**
 * Light packets riding a link. The phase is `laps * f / END` with an INTEGER lap count, so the
 * last frame is exactly one step short of frame 0 — the stream loops because the arithmetic
 * loops, not because a dissolve hides the join. (short-13's rule, applied at construction.)
 */
export const Packets: React.FC<{
  link: Link;
  phase: number; // laps * f / END
  n?: number;
  color?: string;
  r?: number;
  seed?: number;
  opacity?: number;
  spread?: number; // 0..1 of the ribbon width the packets scatter across
}> = ({ link, phase, n = 10, color = '#fff6d2', r = 5, seed = 4, opacity = 1, spread = 0.72 }) => {
  if (opacity <= 0.01) return null;
  const rnd = mulberry32(seed);
  const dots = Array.from({ length: n }, (_, i) => ({ u: i / n, o: 0.35 + 0.65 * rnd(), lat: rnd() - 0.5 }));
  return (
    <g opacity={opacity}>
      {dots.map((d, i) => {
        const t = frac(d.u + phase);
        const [x, y] = linkPoint(link, t);
        const w = linkWidth(link, t);
        // fade in and out at the ends so packets never pop at a ribbon's edge
        const fade = Math.min(1, t / 0.12) * Math.min(1, (1 - t) / 0.12);
        return (
          <circle
            key={i}
            cx={x + d.lat * w * spread}
            cy={y}
            r={r}
            fill={color}
            opacity={0.5 * d.o * fade}
          />
        );
      })}
    </g>
  );
};

// =============================================================================
// THE SUN — a cap at the top edge, with a ray corona that turns EXACTLY once per
// composition (a per-frame rate leaves the ring out of phase at the wrap: short-14, measured).
// =============================================================================
export const SunCap: React.FC<{ spin: number; pulse?: number }> = ({ spin, pulse = 0 }) => {
  const g = FLOW_GEOM;
  const rays = Array.from({ length: 24 }, (_, i) => i);
  const swell = 1 + 0.03 * Math.sin(pulse); // a PHASE, used through sin() — never as a magnitude
  return (
    <g>
      <defs>
        <radialGradient id="flowSunG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={FLOW_COLORS.sunCore} stopOpacity={0.9} />
          <stop offset="45%" stopColor={FLOW_COLORS.sun} stopOpacity={0.28} />
          <stop offset="100%" stopColor={FLOW_COLORS.sun} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="flowSunBody" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#fffdf2" />
          <stop offset="60%" stopColor={FLOW_COLORS.sunCore} />
          <stop offset="100%" stopColor={FLOW_COLORS.sun} />
        </radialGradient>
      </defs>
      <circle cx={g.sunX} cy={g.sunY} r={g.sunR * 3.1 * swell} fill="url(#flowSunG)" />
      <g transform={`rotate(${spin} ${g.sunX} ${g.sunY})`} opacity={0.5}>
        {rays.map((i) => (
          <rect
            key={i}
            x={g.sunX - 3}
            y={g.sunY}
            width={6}
            height={g.sunR * 2.15}
            fill={FLOW_COLORS.sun}
            opacity={0.35}
            transform={`rotate(${(i * 360) / rays.length} ${g.sunX} ${g.sunY})`}
          />
        ))}
      </g>
      <circle cx={g.sunX} cy={g.sunY} r={g.sunR} fill="url(#flowSunBody)" />
    </g>
  );
};

// =============================================================================
// LABELS
// =============================================================================
/** A branch head label: name over a big percentage, optionally with a leader to a hairline. */
export const BranchLabel: React.FC<{
  x: number;
  y: number;
  name: string;
  pct: string;
  gloss?: string;
  color: string;
  on: number;
  leaderTo?: number; // y of the ribbon head, when the ribbon is too thin to point at itself
}> = ({ x, y, name, pct, gloss, color, on, leaderTo }) => {
  if (on <= 0.01) return null;
  const rise = (1 - on) * 14;
  return (
    <g opacity={on} transform={`translate(0 ${rise.toFixed(2)})`}>
      {/* A branch too thin to draw still has to be POINTED AT. The leader is dashed and sits
          above the head, so it reads as an annotation and is never mistaken for the ribbon. */}
      {leaderTo !== undefined ? (
        <>
          <line
            x1={x}
            y1={leaderTo - 64}
            x2={x}
            y2={leaderTo}
            stroke={color}
            strokeWidth={3}
            strokeDasharray="7 6"
            opacity={0.95}
          />
          <line x1={x - 19} y1={leaderTo} x2={x + 19} y2={leaderTo} stroke={color} strokeWidth={4} opacity={1} />
        </>
      ) : null}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        fill={color}
        fontFamily={FONT_BODY}
        fontWeight={600}
        fontSize={31}
        letterSpacing={5}
      >
        {name}
      </text>
      <text
        x={x}
        y={y + 50}
        textAnchor="middle"
        fill="#ffffff"
        fontFamily={FONT_MONO}
        fontWeight={700}
        fontSize={44}
      >
        {pct}
      </text>
      {gloss ? (
        <text
          x={x}
          y={y + 88}
          textAnchor="middle"
          fill={FLOW_COLORS.dim}
          fontFamily={FONT_BODY}
          fontWeight={500}
          fontSize={25}
        >
          {gloss}
        </text>
      ) : null}
    </g>
  );
};

/** A label that sits INSIDE a ribbon (dark ink on the band itself). */
export const RibbonLabel: React.FC<{
  x: number;
  y: number;
  top: string;
  bottom?: string;
  on: number;
  size?: number;
  bottomSize?: number;
}> = ({ x, y, top, bottom, on, size = 46, bottomSize = 24 }) => {
  if (on <= 0.01) return null;
  return (
    <g opacity={on}>
      <text
        x={x}
        y={y}
        textAnchor="middle"
        fill={FLOW_COLORS.ink}
        fontFamily={FONT_MONO}
        fontWeight={700}
        fontSize={size}
      >
        {top}
      </text>
      {bottom ? (
        <text
          x={x}
          y={y + 34}
          textAnchor="middle"
          fill={FLOW_COLORS.ink}
          fontFamily={FONT_BODY}
          fontWeight={600}
          fontSize={bottomSize}
          letterSpacing={2}
          opacity={0.78}
        >
          {bottom}
        </text>
      ) : null}
    </g>
  );
};

// =============================================================================
// THE LOUPE — the honest answer to a sub-pixel ribbon.
//
// A log width scale would make the hairline visible by LYING about the proportion, which is
// the one thing this diagram exists to state. So the width stays true and the loupe magnifies
// a circle of it by `mag` — a number derived from the ribbon's own width, and printed on the
// glass so the viewer knows exactly what was done to the picture.
// =============================================================================
export const Loupe: React.FC<{
  x: number;
  y: number;
  r: number;
  /** the TRUE width of the thing being magnified, px */
  widthPx: number;
  mag: number;
  color: string;
  on: number;
  phase: number;
  /** print the magnification on the glass (off when the readout beside it already carries it) */
  label?: boolean;
  /** the ribbon head this loupe is looking at (draws a short dashed tether) */
  fromX?: number;
  fromY?: number;
}> = ({ x, y, r, widthPx, mag, color, on, phase, label = true, fromX, fromY }) => {
  if (on <= 0.01) return null;
  const open = sstep(on, 0, 1);
  const w = widthPx * mag;
  const id = `loupeClip${Math.round(x)}`;
  const dots = Array.from({ length: 7 }, (_, i) => i / 7);
  return (
    <g opacity={on}>
      {fromX !== undefined && fromY !== undefined ? (
        <line
          x1={fromX}
          y1={fromY}
          x2={x}
          y2={y - r}
          stroke={color}
          strokeWidth={2}
          strokeDasharray="7 7"
          opacity={0.6}
        />
      ) : null}
      <defs>
        <clipPath id={id}>
          <circle cx={x} cy={y} r={r * open} />
        </clipPath>
      </defs>
      <circle cx={x} cy={y} r={r * open} fill="#05080e" />
      <g clipPath={`url(#${id})`}>
        <rect x={x - w / 2} y={y - r} width={w} height={r * 2} fill={color} />
        <rect x={x - w / 2} y={y - r} width={w} height={r * 2} fill={color} opacity={0.45} />
        {dots.map((u, i) => (
          <circle
            key={i}
            cx={x}
            cy={y - r + frac(u + phase) * r * 2}
            r={Math.min(w * 0.3, 7)}
            fill="#ffffff"
            opacity={0.55}
          />
        ))}
      </g>
      <circle cx={x} cy={y} r={r * open} fill="none" stroke={color} strokeWidth={4} opacity={0.9} />
      <circle cx={x} cy={y} r={r * open} fill="none" stroke="#ffffff" strokeWidth={1.5} opacity={0.25} />
      {/* the magnification sits ABOVE the glass: below it would fall into the caption block */}
      {label ? (
        <text
          x={x}
          y={y - r - 18}
          textAnchor="middle"
          fill={color}
          fontFamily={FONT_MONO}
          fontWeight={700}
          fontSize={38}
        >
          {`x${mag}`}
        </text>
      ) : null}
    </g>
  );
};

// =============================================================================
// THE BAND — the strip under the sun that hands off between beats: the hook title lives
// here, then the comparison bars, then the twist card. One place, never two fighting.
// =============================================================================
export const CompareBars: React.FC<{
  y: number;
  on: number;
  rows: { label: string; value: string; frac: number; color: string }[];
  note?: string;
}> = ({ y, on, rows, note }) => {
  if (on <= 0.01) return null;
  const L = 112;
  const R = 900; // stops short of the like/share rail (the right 160px)
  return (
    <g opacity={on}>
      {/* ITS OWN PANEL. These bars land in the band under the sun, which is filled by the beam:
          bare, the yellow bar and the yellow note were invisible against it and the grey labels
          were unreadable (QA f330/f400). Same treatment as FlowCard. */}
      <rect
        x={76}
        y={y - 68}
        width={912}
        height={rows.length * 88 + 78}
        rx={22}
        fill="rgba(9,13,22,0.92)"
        stroke="rgba(245,215,110,0.4)"
        strokeWidth={2}
      />
      {/* the note sits ABOVE the rows */}
      {note ? (
        <text
          x={540}
          y={y - 36}
          textAnchor="middle"
          fill={FLOW_COLORS.accent}
          fontFamily={FONT_BODY}
          fontWeight={600}
          fontSize={29}
          letterSpacing={3}
        >
          {note}
        </text>
      ) : null}
      {rows.map((row, i) => {
        const yy = y + i * 88;
        const grow = sstep(on, 0, 1);
        return (
          <g key={i}>
            <text x={L} y={yy} fill={FLOW_COLORS.dim} fontFamily={FONT_BODY} fontWeight={600} fontSize={26} letterSpacing={4}>
              {row.label}
            </text>
            <rect x={L} y={yy + 16} width={R - L} height={30} rx={15} fill="#ffffff" opacity={0.07} />
            <rect x={L} y={yy + 16} width={(R - L) * row.frac * grow} height={30} rx={15} fill={row.color} />
            <text
              x={R}
              y={yy}
              textAnchor="end"
              fill="#ffffff"
              fontFamily={FONT_MONO}
              fontWeight={700}
              fontSize={30}
            >
              {row.value}
            </text>
          </g>
        );
      })}
    </g>
  );
};

/** A card for the twist beat, sized to the band. */
export const FlowCard: React.FC<{
  y: number;
  on: number;
  kicker: string;
  lines: string[];
  color: string;
}> = ({ y, on, kicker, lines, color }) => {
  if (on <= 0.01) return null;
  const h = 74 + lines.length * 58;
  return (
    <g opacity={on} transform={`translate(0 ${((1 - on) * 16).toFixed(2)})`}>
      <rect x={92} y={y} width={896} height={h} rx={22} fill="rgba(9,13,22,0.9)" stroke={`${color}66`} strokeWidth={2} />
      <rect x={92} y={y} width={10} height={h} rx={5} fill={color} />
      <text x={132} y={y + 46} fill={color} fontFamily={FONT_BODY} fontWeight={600} fontSize={27} letterSpacing={6}>
        {kicker}
      </text>
      {lines.map((t, i) => (
        <text
          key={i}
          x={132}
          y={y + 104 + i * 58}
          fill="#ffffff"
          fontFamily={FONT_DISPLAY}
          fontWeight={600}
          fontSize={44}
        >
          {t}
        </text>
      ))}
    </g>
  );
};

/** The mono readout that names what the loupe is looking at. */
export const Readout: React.FC<{
  x: number;
  y: number;
  on: number;
  lines: { text: string; color?: string; size?: number }[];
  align?: 'start' | 'end' | 'middle';
}> = ({ x, y, on, lines, align = 'end' }) => {
  if (on <= 0.01) return null;
  return (
    <g opacity={on}>
      {lines.map((l, i) => (
        <text
          key={i}
          x={x}
          y={y + i * 46}
          textAnchor={align}
          fill={l.color ?? '#ffffff'}
          fontFamily={FONT_MONO}
          fontWeight={700}
          fontSize={l.size ?? 34}
        >
          {l.text}
        </text>
      ))}
    </g>
  );
};

// =============================================================================
// BACKDROP — deep space with a faint star field. Deterministic, so it never flickers.
// =============================================================================
const STARS = (() => {
  const rnd = mulberry32(31);
  return Array.from({ length: 150 }, () => ({
    x: rnd() * 1080,
    y: rnd() * 1920,
    r: 0.8 + rnd() * 1.9,
    o: 0.08 + rnd() * 0.3,
  }));
})();

export const FlowBackdrop: React.FC = () => (
  <>
    <defs>
      {/* the beam, in user space so every ribbon that uses it shares ONE gradient down the
          whole column — a per-shape gradient would restart at each ribbon's own top edge */}
      <linearGradient id="flowBeamG" x1="0" y1={FLOW_GEOM.beamY} x2="0" y2={FLOW_GEOM.headY} gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fcecb2" />
        <stop offset="100%" stopColor="#e2c87e" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={1080} height={1920} fill={FLOW_COLORS.space} />
    <ellipse cx={540} cy={140} rx={900} ry={620} fill={FLOW_COLORS.spaceGlow} opacity={0.55} />
    {STARS.map((s, i) => (
      <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#cdd8ee" opacity={s.o} />
    ))}
  </>
);

/** A gentle constant vignette — never a travelling dim (short-14: a moving hole reads as fog). */
export const Vignette: React.FC<{ amount?: number }> = ({ amount = 0.4 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 82% 62% at 50% 46%, rgba(4,7,13,0) 55%, rgba(4,7,13,${amount}) 100%)`,
    }}
  />
);
