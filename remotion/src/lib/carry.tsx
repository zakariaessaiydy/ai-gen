// =============================================================================
// lib/carry.tsx — THE CARRY ENGINE
//
// A house drawn as a CROSS-SECTION: two floors, one staircase, things that each belong on
// one floor, and carriers (baskets) that ride trips people are already taking.
//
// The subject is never how much mess there is, but what it COSTS to put a thing away. A
// thing on its own floor costs a few steps. A thing on the wrong floor costs a whole stair
// trip, so it stays. A carrier parked where the trips already happen turns that dedicated
// trip into zero extra trips. Nothing is counted by a keyframed number: the composition
// hands every thing a state (where it sits this frame) and the readouts count the states.
//
// Colour is the key the viewer decodes without labels: a thing is filled with the colour
// of the floor it BELONGS on, and each floor's label carries that colour — so an amber
// thing upstairs is visibly on the wrong floor before anyone says so.
//
// Generic for a series: any "wrong place, trips already happening" rule is a new layout
// and a new set of things, not a new engine — the dish bin that rides to the kitchen, the
// car-boot outbox, the launch pad by the front door, the laundry chute.
// =============================================================================
import React from 'react';
import { Easing } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const CR = {
  stage: '#0b0e14',
  text: '#e8ecf5',
  dim: '#8b93a7',
  faint: 'rgba(232,236,245,0.42)',
  wall: 'rgba(255,255,255,0.035)',
  wallEdge: 'rgba(255,255,255,0.16)',
  slab: 'rgba(255,255,255,0.22)',
  up: '#8fa2ff', // belongs UPSTAIRS
  down: '#f2b46b', // belongs DOWNSTAIRS
  mess: '#e8879f', // on the wrong floor
  good: '#4db8a8',
  warn: '#f5d76e',
  walker: '#e8ecf5',
  ink: '#0b0e14',
} as const;

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export type XY = { x: number; y: number };
export type Floor = 'up' | 'down';

// =============================================================================
// THE HOUSE — every coordinate the composition needs, in one place.
// =============================================================================
export type HouseLayout = {
  x0: number;
  x1: number;
  eave: number; // top of the upstairs room
  apex: number; // roof peak
  upFloor: number; // y the upstairs things stand on
  slab: number; // floor thickness
  downFloor: number; // y the downstairs things stand on
  foot: XY; // bottom of the staircase
  top: XY; // top of the staircase
  gap: [number, number]; // the stairwell opening in the upstairs floor
  steps: number;
};

export const HOUSE: HouseLayout = {
  x0: 70,
  x1: 1010,
  eave: 575,
  apex: 470,
  upFloor: 945,
  slab: 18,
  downFloor: 1335,
  foot: { x: 330, y: 1335 },
  top: { x: 710, y: 945 },
  gap: [470, 710],
  steps: 10,
};

export const floorY = (h: HouseLayout, fl: Floor) => (fl === 'up' ? h.upFloor : h.downFloor);

/** The walls, the roof, the two floors, the stairwell and the stairs. */
export const HouseSection: React.FC<{ h?: HouseLayout; labelOn?: number }> = ({ h = HOUSE, labelOn = 1 }) => {
  const mid = (h.x0 + h.x1) / 2;
  const rise = (h.foot.y - h.top.y) / h.steps;
  const run = (h.top.x - h.foot.x) / h.steps;
  let d = `M${h.foot.x},${h.foot.y}`;
  for (let k = 1; k <= h.steps; k += 1) {
    d += `L${h.foot.x + (k - 1) * run},${h.foot.y - k * rise}L${h.foot.x + k * run},${h.foot.y - k * rise}`;
  }
  // the stringer: a straight underside, parallel to the pitch
  const under = `L${h.top.x},${h.top.y + h.slab}L${h.foot.x + run * 1.6},${h.foot.y}Z`;
  return (
    <g>
      {/* roof */}
      <path
        d={`M${h.x0 - 30},${h.eave}L${mid},${h.apex}L${h.x1 + 30},${h.eave}`}
        fill="none"
        stroke={CR.wallEdge}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      {/* the two rooms */}
      <rect x={h.x0} y={h.eave} width={h.x1 - h.x0} height={h.upFloor - h.eave} fill={CR.wall} />
      <rect x={h.x0} y={h.upFloor + h.slab} width={h.x1 - h.x0} height={h.downFloor - h.upFloor - h.slab} fill={CR.wall} />
      <rect
        x={h.x0}
        y={h.eave}
        width={h.x1 - h.x0}
        height={h.downFloor - h.eave}
        fill="none"
        stroke={CR.wallEdge}
        strokeWidth={4}
      />
      {/* upstairs floor, with the stairwell cut out of it */}
      <rect x={h.x0} y={h.upFloor} width={h.gap[0] - h.x0} height={h.slab} fill={CR.slab} />
      <rect x={h.gap[1]} y={h.upFloor} width={h.x1 - h.gap[1]} height={h.slab} fill={CR.slab} />
      {/* ground */}
      <line x1={h.x0 - 40} y1={h.downFloor} x2={h.x1 + 40} y2={h.downFloor} stroke="rgba(255,255,255,0.3)" strokeWidth={5} />
      {/* stairs */}
      <path d={d + under} fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.34)" strokeWidth={3} strokeLinejoin="round" />
      {labelOn > 0.01 ? (
        <g opacity={labelOn}>
          <text x={h.x0 + 22} y={h.eave + 40} fill={CR.up} fontFamily={FONT_MONO} fontSize={25} fontWeight={700} letterSpacing={3}>
            UPSTAIRS
          </text>
          <text x={h.x0 + 22} y={h.upFloor + h.slab + 40} fill={CR.down} fontFamily={FONT_MONO} fontSize={25} fontWeight={700} letterSpacing={3}>
            DOWNSTAIRS
          </text>
        </g>
      ) : null}
    </g>
  );
};

/** A wall shelf — the HOME a thing goes back to. */
export const Shelf: React.FC<{ x0: number; x1: number; y: number; opacity?: number }> = ({ x0, x1, y, opacity = 1 }) => (
  <g opacity={opacity}>
    <rect x={x0} y={y} width={x1 - x0} height={10} rx={4} fill="rgba(255,255,255,0.3)" />
    <path d={`M${x0 + 18},${y + 10}l0,20l14,-20M${x1 - 18},${y + 10}l0,20l-14,-20`} stroke="rgba(255,255,255,0.22)" strokeWidth={4} fill="none" />
  </g>
);

// =============================================================================
// PATHS — walkers and flights. Arc-length parametrised, so speed is constant in PIXELS
// (a walker takes the stairs at the same pace they cross the room).
// =============================================================================
export const pathLen = (pts: XY[]) =>
  pts.slice(1).reduce((s, p, i) => s + Math.hypot(p.x - pts[i].x, p.y - pts[i].y), 0);

/** Point at fraction u of the polyline's length, plus the x-direction of travel there. */
export const along = (pts: XY[], u: number): XY & { dir: number; dist: number } => {
  const total = pathLen(pts);
  let want = clamp01(u) * total;
  for (let i = 1; i < pts.length; i += 1) {
    const a = pts[i - 1];
    const b = pts[i];
    const seg = Math.hypot(b.x - a.x, b.y - a.y);
    if (want <= seg || i === pts.length - 1) {
      const t = seg > 0 ? clamp01(want / seg) : 1;
      return { x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), dir: Math.sign(b.x - a.x) || 1, dist: clamp01(u) * total };
    }
    want -= seg;
  }
  const last = pts[pts.length - 1];
  return { ...last, dir: 1, dist: total };
};

/** A thrown thing: a parabola from a to b peaking `lift` px above the higher end. */
export const hop = (a: XY, b: XY, u: number, lift = 90): XY => {
  const t = clamp01(u);
  const peak = Math.min(a.y, b.y) - lift;
  // quadratic Bezier whose control point puts the apex at `peak`
  const cy = 2 * peak - (a.y + b.y) / 2;
  const cx = (a.x + b.x) / 2;
  return {
    x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * cx + t * t * b.x,
    y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * cy + t * t * b.y,
  };
};

/** The same hop as a dashed SVG path — the "this is where it goes" ghost. */
export const hopPath = (a: XY, b: XY, lift = 90) => {
  const peak = Math.min(a.y, b.y) - lift;
  const cy = 2 * peak - (a.y + b.y) / 2;
  return `M${a.x},${a.y}Q${(a.x + b.x) / 2},${cy} ${b.x},${b.y}`;
};

// =============================================================================
// THINGS — twelve simple glyphs, each ~60px, origin at the BOTTOM-CENTRE (they stand on
// a floor, a shelf or a basket). Filled with the colour of the floor they belong on.
// =============================================================================
export type Glyph = 'sock' | 'towel' | 'pillow' | 'book' | 'shirt' | 'block' | 'shoe' | 'mug' | 'ball' | 'keys' | 'bowl' | 'bag' | 'coat' | 'bottle' | 'mail';

const DETAIL = 'rgba(11,14,20,0.5)';

const glyphBody = (g: Glyph, c: string): React.ReactNode => {
  const st = { stroke: CR.ink, strokeWidth: 3, strokeLinejoin: 'round' as const };
  switch (g) {
    case 'sock':
      return (
        <>
          <path d="M-12,-54L8,-54L8,-22Q8,-14 16,-14L22,-14Q32,-14 32,-5Q32,0 25,0L-4,0Q-16,0 -16,-12L-16,-50Q-16,-54 -12,-54Z" fill={c} {...st} />
          <line x1={-16} y1={-44} x2={8} y2={-44} stroke={DETAIL} strokeWidth={4} />
        </>
      );
    case 'towel':
      return (
        <>
          <rect x={-30} y={-32} width={60} height={32} rx={6} fill={c} {...st} />
          <line x1={-30} y1={-22} x2={30} y2={-22} stroke={DETAIL} strokeWidth={4} />
          <line x1={-30} y1={-10} x2={30} y2={-10} stroke={DETAIL} strokeWidth={4} />
        </>
      );
    case 'pillow':
      return (
        <>
          <path d="M-32,-30Q0,-38 32,-30Q36,-15 32,0Q0,6 -32,0Q-36,-15 -32,-30Z" fill={c} {...st} />
          <path d="M-18,-15Q0,-19 18,-15" stroke={DETAIL} strokeWidth={3} fill="none" />
        </>
      );
    case 'book':
      return (
        <>
          <rect x={-17} y={-56} width={34} height={56} rx={3} fill={c} {...st} />
          <line x1={-17} y1={-46} x2={17} y2={-46} stroke={DETAIL} strokeWidth={4} />
          <line x1={-17} y1={-11} x2={17} y2={-11} stroke={DETAIL} strokeWidth={4} />
        </>
      );
    case 'shirt':
      return <path d="M-32,-40L-14,-52Q0,-43 14,-52L32,-40L24,-27L17,-31L17,0L-17,0L-17,-31L-24,-27Z" fill={c} {...st} />;
    case 'block':
      return (
        <>
          <rect x={-25} y={-50} width={50} height={50} rx={7} fill={c} {...st} />
          <text x={0} y={-12} fill={CR.ink} fontFamily={FONT_DISPLAY} fontSize={34} fontWeight={700} textAnchor="middle">
            A
          </text>
        </>
      );
    case 'shoe':
      return (
        <>
          <path d="M-32,0L-32,-28Q-32,-35 -25,-35L-9,-35Q-5,-21 8,-17L25,-13Q34,-11 34,-4L34,0Z" fill={c} {...st} />
          <line x1={-32} y1={-6} x2={34} y2={-6} stroke={DETAIL} strokeWidth={4} />
        </>
      );
    case 'mug':
      return (
        <>
          <path d="M14,-38Q32,-38 32,-24Q32,-10 14,-10" fill="none" stroke={c} strokeWidth={7} />
          <rect x={-22} y={-48} width={38} height={48} rx={6} fill={c} {...st} />
        </>
      );
    case 'ball':
      return (
        <>
          <circle cx={0} cy={-26} r={26} fill={c} {...st} />
          <path d="M-26,-26Q0,-8 26,-26M0,-52Q-12,-26 0,0" stroke={DETAIL} strokeWidth={3} fill="none" />
        </>
      );
    case 'keys':
      return (
        <>
          <circle cx={-16} cy={-16} r={13} fill="none" stroke={c} strokeWidth={7} />
          <path d="M-3,-19L30,-19L30,-11L24,-11L24,-4L18,-4L18,-11L-3,-11Z" fill={c} {...st} />
        </>
      );
    case 'bowl':
      return (
        <>
          <path d="M-34,-28L34,-28Q32,0 0,0Q-32,0 -34,-28Z" fill={c} {...st} />
          <line x1={-30} y1={-20} x2={30} y2={-20} stroke={DETAIL} strokeWidth={3} />
        </>
      );
    case 'coat':
      return (
        <>
          <path d="M-24,-74L-9,-80Q0,-72 9,-80L24,-74L36,-38L26,-35L23,0L-23,0L-26,-35L-36,-38Z" fill={c} {...st} />
          <line x1={0} y1={-72} x2={0} y2={0} stroke={DETAIL} strokeWidth={3} />
          <line x1={-17} y1={-24} x2={-7} y2={-24} stroke={DETAIL} strokeWidth={4} />
          <line x1={7} y1={-24} x2={17} y2={-24} stroke={DETAIL} strokeWidth={4} />
        </>
      );
    case 'bottle':
      return (
        <>
          <rect x={-9} y={-72} width={18} height={11} rx={3} fill={CR.ink} opacity={0.75} />
          <rect x={-15} y={-62} width={30} height={62} rx={9} fill={c} {...st} />
          <line x1={-15} y1={-40} x2={15} y2={-40} stroke={DETAIL} strokeWidth={4} />
        </>
      );
    case 'mail':
      return (
        <>
          <rect x={-29} y={-38} width={58} height={38} rx={4} fill={c} {...st} />
          <path d="M-27,-36L0,-15L27,-36" fill="none" stroke={DETAIL} strokeWidth={3} strokeLinejoin="round" />
          <rect x={12} y={-33} width={11} height={9} rx={1} fill={DETAIL} />
        </>
      );
    case 'bag':
      return (
        <>
          <path d="M-13,-42Q-13,-60 0,-60Q13,-60 13,-42" fill="none" stroke={c} strokeWidth={6} />
          <rect x={-26} y={-44} width={52} height={44} rx={7} fill={c} {...st} />
        </>
      );
  }
};

export const Thing: React.FC<{
  g: Glyph;
  x: number;
  y: number;
  color: string;
  s?: number;
  rot?: number;
  opacity?: number;
}> = ({ g, x, y, color, s = 1, rot = 0, opacity = 1 }) => {
  if (opacity <= 0.01) return null;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={opacity}>
      {glyphBody(g, color)}
    </g>
  );
};

/** "Wrong floor": a ring round the thing and a tag saying which way it has to go. */
export const WrongRing: React.FC<{ x: number; y: number; way: Floor; opacity?: number; color?: string; s?: number }> = ({
  x,
  y,
  way,
  opacity = 1,
  color = CR.mess,
  s = 1,
}) => {
  if (opacity <= 0.01) return null;
  const cy = y - 27 * s;
  const tx = x + 34 * s;
  const ty = cy - 38 * s;
  const arrow = way === 'up' ? 'M0,-9L8,1L3,1L3,9L-3,9L-3,1L-8,1Z' : 'M0,9L8,-1L3,-1L3,-9L-3,-9L-3,-1L-8,-1Z';
  return (
    <g opacity={opacity}>
      <circle cx={x} cy={cy} r={42 * s} fill="none" stroke={color} strokeWidth={5} />
      <circle cx={tx} cy={ty} r={17} fill={color} />
      <path d={arrow} transform={`translate(${tx},${ty})`} fill={CR.ink} />
    </g>
  );
};

/** A soft highlight ring — "look at this one". */
export const Pulse: React.FC<{ x: number; y: number; k: number; color?: string; s?: number }> = ({ x, y, k, color = CR.text, s = 1 }) => {
  if (k <= 0.01) return null;
  return <circle cx={x} cy={y - 27 * s} r={(40 + 10 * k) * s} fill="none" stroke={color} strokeWidth={4} opacity={0.75 * k} />;
};

// =============================================================================
// THE BASKET — drawn in two halves so what is inside it sits BETWEEN them: the back,
// then the things (poking out over the rim), then the woven front with its label.
// Origin at the bottom-centre, like everything that stands on a floor.
// =============================================================================
export const BASKET = { w: 104, h: 62, rimY: -62 } as const;

/** Where the k-th thing sits inside a basket at (x, y) drawn at scale s. */
export const inBasket = (x: number, y: number, k: number, s = 1): XY => ({
  x: x + (k - 1) * 30 * s,
  y: y - 46 * s,
});

export const Basket: React.FC<{
  x: number;
  y: number;
  way: Floor;
  color: string;
  s?: number;
  lit?: number;
  opacity?: number;
  children?: React.ReactNode; // what is in it, already positioned in stage coordinates
}> = ({ x, y, way, color, s = 1, lit = 1, opacity = 1, children }) => {
  if (opacity <= 0.01) return null;
  const a = 0.35 + 0.65 * clamp01(lit);
  const label = way === 'up' ? 'UP' : 'DOWN';
  const arrow = way === 'up' ? 'M0,-8L7,1L2.5,1L2.5,8L-2.5,8L-2.5,1L-7,1Z' : 'M0,8L7,-1L2.5,-1L2.5,-8L-2.5,-8L-2.5,-1L-7,-1Z';
  return (
    <g opacity={opacity}>
      <g opacity={a}>
        <g transform={`translate(${x},${y}) scale(${s})`}>
          <ellipse cx={0} cy={BASKET.rimY} rx={52} ry={10} fill="rgba(0,0,0,0.45)" />
        </g>
      </g>
      {children}
      <g opacity={a} transform={`translate(${x},${y}) scale(${s})`}>
        {lit > 0.5 ? <ellipse cx={0} cy={-30} rx={74} ry={50} fill={color} opacity={0.1 * lit} /> : null}
        <path d="M-50,-62L50,-62L42,0L-42,0Z" fill={color} stroke={CR.ink} strokeWidth={3} strokeLinejoin="round" />
        {[-40, -26].map((yy) => (
          <line key={yy} x1={-48} y1={yy} x2={48} y2={yy} stroke="rgba(11,14,20,0.28)" strokeWidth={3} />
        ))}
        <rect x={-55} y={-68} width={110} height={12} rx={6} fill={color} stroke={CR.ink} strokeWidth={3} />
        <g transform="translate(0,-17)">
          <path d={arrow} transform={`translate(${label === 'UP' ? -24 : -37},-9)`} fill={CR.ink} />
          <text x={label === 'UP' ? 10 : 8} y={0} fill={CR.ink} fontFamily={FONT_DISPLAY} fontSize={24} fontWeight={700} letterSpacing={1.5} textAnchor="middle">
            {label}
          </text>
        </g>
      </g>
    </g>
  );
};

// =============================================================================
// THE WALKER — a person on a path. Feet at (x, y); legs swing with DISTANCE walked, not
// time, so a walker who stops stops stepping.
// =============================================================================
export const Walker: React.FC<{ x: number; y: number; dist?: number; color?: string; opacity?: number; s?: number }> = ({
  x,
  y,
  dist = 0,
  color = CR.walker,
  opacity = 1,
  s = 1,
}) => {
  if (opacity <= 0.01) return null;
  const sw = Math.sin(dist / 11) * 9;
  return (
    <g opacity={opacity} transform={`translate(${x},${y}) scale(${s})`}>
      <line x1={-5} y1={-26} x2={-5 - sw} y2={0} stroke={color} strokeWidth={9} strokeLinecap="round" />
      <line x1={5} y1={-26} x2={5 + sw} y2={0} stroke={color} strokeWidth={9} strokeLinecap="round" />
      <rect x={-16} y={-74} width={32} height={52} rx={14} fill={color} />
      <circle cx={0} cy={-92} r={15} fill={color} />
    </g>
  );
};

// =============================================================================
// READOUTS
// =============================================================================
export const Tally: React.FC<{
  y: number;
  cols: { label: string; value: string; color: string; sub?: string; glow?: number }[];
  opacity?: number;
}> = ({ y, cols, opacity = 1 }) => {
  if (opacity <= 0.01) return null;
  const w = 1080 / cols.length;
  return (
    <g opacity={opacity}>
      {cols.map((k, i) => {
        const cx = w * i + w / 2;
        return (
          <g key={k.label}>
            {k.glow && k.glow > 0.01 ? (
              <rect x={cx - 210} y={y - 38} width={420} height={186} rx={24} fill={k.color} opacity={0.12 * k.glow} />
            ) : null}
            <text x={cx} y={y} fill={CR.dim} fontFamily={FONT_BODY} fontSize={25} fontWeight={600} letterSpacing={3.5} textAnchor="middle">
              {k.label}
            </text>
            <text x={cx} y={y + 88} fill={k.color} fontFamily={FONT_DISPLAY} fontSize={86} fontWeight={700} textAnchor="middle">
              {k.value}
            </text>
            {k.sub ? (
              <text x={cx} y={y + 124} fill={CR.faint} fontFamily={FONT_MONO} fontSize={22} fontWeight={500} letterSpacing={1.5} textAnchor="middle">
                {k.sub}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

export const Chip: React.FC<{ x: number; y: number; text: string; color?: string; opacity?: number; size?: number }> = ({
  x,
  y,
  text,
  color = CR.good,
  opacity = 1,
  size = 30,
}) => {
  if (opacity <= 0.01) return null;
  return (
    <text x={x} y={y} fill={color} fontFamily={FONT_BODY} fontSize={size} fontWeight={700} letterSpacing={3} textAnchor="middle" opacity={opacity}>
      {text}
    </text>
  );
};
