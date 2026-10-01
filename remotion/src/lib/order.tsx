// =============================================================================
// lib/order.tsx — THE TIDINESS ENGINE (state space + search cost + sorting distance)
//
// A room is modelled as N labelled things occupying N labelled places: one permutation.
// EVERY number this kit puts on screen is computed from that single model — the size of the
// state space (n! by long multiplication, exact to the last digit), the expected number of
// places you search before you find something, and the DISTANCE from any arrangement back to
// the tidy one (n - cycles, from the real swap sequence, not an estimate).
//
// Same ethos as prob.tsx's seeded trials, map.tsx's real Mercator, orbit.tsx's Verlet
// integrator and flow.tsx's solved ledger: never assert what the code can compute. In
// particular the sort animation REPLAYS the actual swaps — the counter on screen cannot
// disagree with the tiles, because both read the same array.
//
// Reusable for anything with a "there is one right arrangement" shape: a sock drawer, a desk,
// forty browser tabs, a toolbox, a kitchen, a codebase's file tree.
// =============================================================================
import React from 'react';
import { Easing } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const ORDER_COLORS = {
  stage: '#0b0e14',
  wall: '#141a24',
  floor: '#10151d',
  ghost: 'rgba(255,255,255,0.20)',
  dim: '#8b93a7',
  text: '#e8ecf5',
  accent: '#f5d76e', // captions / progress / hero number
  tidy: '#4db8a8',
  mess: '#e8879f',
  indigo: '#6366F1',
} as const;

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// =============================================================================
// GEOMETRY — 20 places, laid out 5 x 4, under the band of a 1080x1920 frame.
// =============================================================================
export type RoomLayout = { cols: number; rows: number; cell: number; gap: number; y0: number };
export const ROOM = {
  cols: 5,
  rows: 4,
  cell: 168,
  gap: 24,
  y0: 500,
} as const;
export const N = ROOM.cols * ROOM.rows; // 20 — the one number everything else derives from
export const GRID_W = ROOM.cols * ROOM.cell + (ROOM.cols - 1) * ROOM.gap;
export const GRID_H = ROOM.rows * ROOM.cell + (ROOM.rows - 1) * ROOM.gap;
export const GRID_X = (1080 - GRID_W) / 2;

/** Centre of place `s` (0..N-1), row-major. `L` defaults to short-16's room; a later short
 *  can pass a tighter layout to free the floor below the grid (short-34's overflow pile). */
export const slotXY = (s: number, L: RoomLayout = ROOM): [number, number] => {
  const c = s % L.cols;
  const r = Math.floor(s / L.cols);
  const x0 = (1080 - (L.cols * L.cell + (L.cols - 1) * L.gap)) / 2;
  return [x0 + c * (L.cell + L.gap) + L.cell / 2, L.y0 + r * (L.cell + L.gap) + L.cell / 2];
};

// =============================================================================
// THE COUNT — n! by long multiplication, so the digits on screen are exact, not a float.
// =============================================================================
export const factorialDigits = (n: number): string => {
  const d = [1];
  for (let m = 2; m <= n; m++) {
    let carry = 0;
    for (let i = 0; i < d.length; i++) {
      const v = d[i] * m + carry;
      d[i] = v % 10;
      carry = Math.floor(v / 10);
    }
    while (carry > 0) {
      d.push(carry % 10);
      carry = Math.floor(carry / 10);
    }
  }
  return d.reverse().join('');
};
export const group = (s: string) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** Exact decimal decrement — "all the arrangements that are NOT the tidy one" is n! - 1, and
 *  n! is nineteen digits, so it cannot be done in a double without losing the last three. */
export const decOne = (s: string): string => {
  const d = s.split('').map(Number);
  let i = d.length - 1;
  while (i >= 0 && d[i] === 0) {
    d[i] = 9;
    i--;
  }
  if (i >= 0) d[i] -= 1;
  return d.join('').replace(/^0+(?=\d)/, '');
};

export const SPACE_STR = factorialDigits(N); // 2432902008176640000
export const SPACE = Number(SPACE_STR);
export const NOT_TIDY_STR = decOne(SPACE_STR); // 2432902008176639999
/** 13.8 Gyr in seconds — one reshuffle per second since the Big Bang. */
export const UNIVERSE_S = 13.8e9 * 365.25 * 86400;
export const SEEN_FRAC = UNIVERSE_S / SPACE; // 0.179 — not a fifth of the way through

// =============================================================================
// SEARCH COST — the thing is equally likely in any of the N places; you check until you find it.
// =============================================================================
export const LOOKS_MESSY = (N + 1) / 2; // 10.5
export const LOOKS_TIDY = 1;
export const SEARCHES_PER_DAY = 4;
export const SEC_PER_LOOK = 5;
const HOURS = (looks: number) => (SEARCHES_PER_DAY * looks * SEC_PER_LOOK * 365) / 3600;
export const HOURS_MESSY = HOURS(LOOKS_MESSY); // 21.29
export const HOURS_TIDY = HOURS(LOOKS_TIDY); // 2.03
export const LOST_HOURS = HOURS_MESSY - HOURS_TIDY; // 19.26

// =============================================================================
// THE PERMUTATION — seeded, so every frame agrees and the result is reproducible off-renderer.
// =============================================================================
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** perm[i] = the place thing i currently sits in. Fisher-Yates, seeded. */
export const shufflePerm = (seed: number, n = N): number[] => {
  const r = mulberry32(seed);
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
};

export const IDENTITY = Array.from({ length: N }, (_, i) => i);

/** Cycle decomposition. Sorting a permutation costs exactly n - (number of cycles) swaps. */
export const cycleCount = (perm: number[]) => {
  const seen = new Array(perm.length).fill(false);
  let c = 0;
  for (let i = 0; i < perm.length; i++) {
    if (seen[i]) continue;
    c++;
    let j = i;
    while (!seen[j]) {
      seen[j] = true;
      j = perm[j];
    }
  }
  return c;
};

/**
 * THE ACTUAL SORT, replayed. states[k][i] = the place thing i is in after k put-backs.
 * Cycle sort: pick up whatever is in the wrong place, put it where it belongs, and you are
 * holding whatever was there. Every thing is picked up AT MOST ONCE — which is the whole
 * payoff of the video, and the LENGTH of this array is the claim, not a number typed in.
 */
export const sortStates = (perm: number[]): number[][] => {
  const n = perm.length;
  const slot = perm.slice(); // slot[thing] = place
  const at: number[] = new Array(n); // at[place] = thing
  slot.forEach((s, i) => {
    at[s] = i;
  });
  const states: number[][] = [slot.slice()];
  for (let s = 0; s < n; s++) {
    while (at[s] !== s) {
      const thing = at[s];
      const dest = thing; // thing i belongs in place i
      const other = at[dest];
      at[dest] = thing;
      at[s] = other;
      slot[thing] = dest;
      slot[other] = s;
      states.push(slot.slice());
    }
  }
  return states;
};

/** Worst case for n things: one big cycle. Nothing can ever be further from tidy than this. */
export const WORST_SWAPS = N - 1; // 19

// =============================================================================
// THE THINGS — 10 glyphs x 7 hues, paired so no two of the 20 look alike.
// =============================================================================
export const HUES = ['#6366F1', '#9b7cc4', '#4db8a8', '#4ecdc4', '#f5d76e', '#e8879f', '#7ba7e8'];
const GLYPH_IDS = ['mug', 'book', 'ball', 'shirt', 'cap', 'bottle', 'shoe', 'sock', 'box', 'phone'] as const;
export type GlyphId = (typeof GLYPH_IDS)[number];

export const THINGS = Array.from({ length: N }, (_, i) => ({
  glyph: GLYPH_IDS[i % GLYPH_IDS.length] as GlyphId,
  color: HUES[(i * 3) % HUES.length],
}));

/** One glyph, stroked, in a 100x100 box. Thin and calm — the arrangement is the content. */
export const Glyph: React.FC<{ id: GlyphId; color: string; sw?: number }> = ({ id, color, sw = 6.5 }) => {
  const p = {
    fill: 'none',
    stroke: color,
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (id) {
    case 'mug':
      return (
        <g {...p}>
          <path d="M28 32 h38 v30 a19 19 0 0 1 -38 0 z" />
          <path d="M66 40 h9 a11 11 0 0 1 0 22 h-9" />
          <path d="M32 78 h30" />
        </g>
      );
    case 'book':
      return (
        <g {...p}>
          <rect x={27} y={24} width={46} height={54} rx={6} />
          <path d="M39 24 v54" />
          <path d="M49 40 h15 M49 52 h15" />
        </g>
      );
    case 'ball':
      return (
        <g {...p}>
          <circle cx={50} cy={52} r={25} />
          <path d="M31 36 q19 16 38 0 M31 68 q19 -16 38 0" />
        </g>
      );
    case 'shirt':
      return (
        <g {...p}>
          <path d="M36 26 l-15 11 l9 13 l6 -4 v30 h28 v-30 l6 4 l9 -13 l-15 -11 z" />
          <path d="M42 26 q8 9 16 0" />
        </g>
      );
    case 'cap':
      return (
        <g {...p}>
          <path d="M27 60 a23 23 0 0 1 46 0 z" />
          <path d="M73 60 h9 a5 5 0 0 1 0 9 h-55" />
        </g>
      );
    case 'bottle':
      return (
        <g {...p}>
          <path d="M43 22 h14 v13 l8 13 v30 a7 7 0 0 1 -7 7 h-16 a7 7 0 0 1 -7 -7 v-30 l8 -13 z" />
          <path d="M35 56 h30" />
        </g>
      );
    case 'shoe':
      return (
        <g {...p}>
          <path d="M25 45 v20 a7 7 0 0 0 7 7 h41 a8 8 0 0 0 1 -16 l-18 -5 l-13 -12 h-11 a7 7 0 0 0 -7 6 z" />
        </g>
      );
    case 'sock':
      return (
        <g {...p}>
          <path d="M37 22 h17 v29 l14 13 a13 13 0 0 1 -18 19 l-14 -14 a12 12 0 0 1 1 -18 z" />
          <path d="M37 32 h17" />
        </g>
      );
    case 'box':
      return (
        <g {...p}>
          <rect x={25} y={33} width={50} height={42} rx={5} />
          <path d="M50 33 v42 M25 47 h50" />
        </g>
      );
    default:
      return (
        <g {...p}>
          <rect x={36} y={21} width={28} height={58} rx={7} />
          <path d="M45 29 h10" />
          <circle cx={50} cy={70} r={2.6} />
        </g>
      );
  }
};

// =============================================================================
// THE ROOM — places (ghost outlines) and things (tiles that sit in them).
// =============================================================================
export const RoomStage: React.FC<{ messiness: number; floorY?: number; glowY?: number }> = ({
  messiness,
  floorY = 1240,
  glowY = 868,
}) => (
  <g>
    <rect x={0} y={0} width={1080} height={1920} fill={ORDER_COLORS.stage} />
    <rect x={0} y={0} width={1080} height={floorY} fill={ORDER_COLORS.wall} />
    <rect x={0} y={floorY} width={1080} height={1920 - floorY} fill={ORDER_COLORS.floor} />
    <path d={`M0 ${floorY} h1080`} stroke="rgba(255,255,255,0.07)" strokeWidth={3} />
    <ellipse
      cx={540}
      cy={glowY}
      rx={640}
      ry={470}
      fill={ORDER_COLORS.mess}
      opacity={0.05 + 0.07 * clamp01(messiness)}
    />
    <ellipse
      cx={540}
      cy={glowY}
      rx={640}
      ry={470}
      fill={ORDER_COLORS.tidy}
      opacity={0.09 * (1 - clamp01(messiness))}
    />
  </g>
);

/** A place: its home outline, with the thing that belongs there ghosted inside it. */
export const Place: React.FC<{ s: number; filled: number; layout?: RoomLayout }> = ({ s, filled, layout = ROOM }) => {
  const [cx, cy] = slotXY(s, layout);
  const t = THINGS[s];
  const half = layout.cell / 2;
  const g = (layout.cell / ROOM.cell) * 90;
  const lit = filled > 0.5;
  return (
    <g>
      <rect
        x={cx - half}
        y={cy - half}
        width={layout.cell}
        height={layout.cell}
        rx={18}
        fill="rgba(255,255,255,0.022)"
        stroke={lit ? `${t.color}99` : ORDER_COLORS.ghost}
        strokeWidth={lit ? 3 : 2}
        strokeDasharray={lit ? undefined : '10 10'}
      />
      <svg x={cx - g / 2} y={cy - g / 2} width={g} height={g} viewBox="0 0 100 100" opacity={0.12}>
        <Glyph id={t.glyph} color="#ffffff" sw={7} />
      </svg>
    </g>
  );
};

/** A thing, drawn wherever it currently is. `home` lights its card when it is where it belongs. */
export const Thing: React.FC<{
  i: number;
  x: number;
  y: number;
  rot: number;
  home: number;
  fade?: number;
  cell?: number;
  look?: { glyph: GlyphId; color: string }; // a thing with no place of its own (THINGS covers 0..N-1)
}> = ({ i, x, y, rot, home, fade = 1, cell = ROOM.cell, look }) => {
  const t = look ?? THINGS[i];
  const half = cell / 2 - 11 * (cell / ROOM.cell);
  const w = half * 2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={fade}>
      <rect
        x={-half}
        y={-half}
        width={w}
        height={w}
        rx={16}
        fill={t.color}
        fillOpacity={0.1 + 0.1 * home}
        stroke={t.color}
        strokeWidth={2.5 + home}
        strokeOpacity={0.55 + 0.45 * home}
      />
      <svg x={-w * 0.34} y={-w * 0.34} width={w * 0.68} height={w * 0.68} viewBox="0 0 100 100">
        <Glyph id={t.glyph} color={t.color} />
      </svg>
    </g>
  );
};

// =============================================================================
// BAND FURNITURE — everything secondary lives in the strip above the room.
// =============================================================================
export const Panel: React.FC<{
  y: number;
  on: number;
  h?: number;
  color?: string;
  children?: React.ReactNode;
}> = ({ y, on, h = 190, color = ORDER_COLORS.accent, children }) => {
  if (on <= 0.01) return null;
  return (
    <g opacity={on} transform={`translate(0 ${(1 - on) * 12})`}>
      <rect x={80} y={y} width={920} height={h} rx={22} fill="rgba(9,12,19,0.9)" stroke={`${color}44`} strokeWidth={2} />
      {children}
    </g>
  );
};

export const Line: React.FC<{
  x: number;
  y: number;
  text: string;
  size?: number;
  color?: string;
  weight?: number;
  font?: string;
  anchor?: 'start' | 'middle' | 'end';
  spacing?: number;
}> = ({
  x,
  y,
  text,
  size = 34,
  color = ORDER_COLORS.text,
  weight = 600,
  font = FONT_BODY,
  anchor = 'middle',
  spacing = 0,
}) => (
  <text
    x={x}
    y={y}
    fill={color}
    fontFamily={font}
    fontWeight={weight}
    fontSize={size}
    textAnchor={anchor}
    letterSpacing={spacing}
  >
    {text}
  </text>
);

/** The hero count: 2.4 QUINTILLION, with all nineteen exact digits under it. */
export const CountHero: React.FC<{ on: number; reveal?: number }> = ({ on, reveal = 1 }) => {
  if (on <= 0.01) return null;
  const digits = group(SPACE_STR);
  const cut = Math.max(1, Math.round(digits.length * clamp01(reveal)));
  return (
    <g opacity={on}>
      <Line
        x={540}
        y={330}
        text={`${(SPACE / 1e18).toFixed(1)} QUINTILLION`}
        size={96}
        weight={700}
        font={FONT_DISPLAY}
        color={ORDER_COLORS.accent}
        spacing={-1}
      />
      <Line x={540} y={382} text={digits.slice(0, cut)} size={31} font={FONT_MONO} weight={500} color="#a7b0c4" spacing={1} />
      <Line x={540} y={444} text="WAYS THIS ROOM CAN LOOK. ONE IS TIDY." size={37} weight={600} color={ORDER_COLORS.text} spacing={1} />
    </g>
  );
};

/** Two proportional bars — used for "since the Big Bang" against the whole state space. */
export const Bars: React.FC<{
  y: number;
  on: number;
  rows: { label: string; value: string; frac: number; color: string }[];
  note?: string;
}> = ({ y, on, rows, note }) => {
  if (on <= 0.01) return null;
  const W = 820;
  return (
    <Panel y={y} on={on} h={note ? 214 : 172}>
      {rows.map((r, i) => {
        const by = y + 62 + i * 68;
        return (
          <g key={i}>
            <Line x={130} y={by - 16} text={r.label} size={25} color={ORDER_COLORS.dim} weight={600} anchor="start" spacing={2.5} />
            <rect x={130} y={by} width={W} height={22} rx={11} fill="rgba(255,255,255,0.07)" />
            <rect x={130} y={by} width={Math.max(4, W * clamp01(r.frac))} height={22} rx={11} fill={r.color} />
            <Line x={950} y={by - 16} text={r.value} size={26} color={r.color} weight={700} font={FONT_MONO} anchor="end" />
          </g>
        );
      })}
      {note ? <Line x={540} y={y + 190} text={note} size={28} color={ORDER_COLORS.accent} weight={700} spacing={2} /> : null}
    </Panel>
  );
};

/** A two-row ledger: label left, value right. For counts too big to draw as a bar. */
export const Ledger: React.FC<{
  y: number;
  on: number;
  color?: string;
  rows: { label: string; value: string; color: string; size?: number }[];
}> = ({ y, on, color = ORDER_COLORS.accent, rows }) => {
  if (on <= 0.01) return null;
  return (
    <Panel y={y} on={on} h={72 + rows.length * 74} color={color}>
      {rows.map((r, i) => {
        const by = y + 76 + i * 74;
        return (
          <g key={i}>
            <Line x={130} y={by - 30} text={r.label} size={25} color={ORDER_COLORS.dim} weight={600} anchor="start" spacing={2.5} />
            <Line x={130} y={by + 8} text={r.value} size={r.size ?? 42} color={r.color} weight={700} font={FONT_MONO} anchor="start" />
          </g>
        );
      })}
    </Panel>
  );
};

/** The search meter: how many places you had to check before you found it. */
export const LookMeter: React.FC<{
  y: number;
  on: number;
  looks: number;
  label: string;
  compare?: string;
}> = ({ y, on, looks, label, compare }) => {
  if (on <= 0.01) return null;
  const shown = Math.max(0, Math.round(looks));
  return (
    <Panel y={y} on={on} h={172} color={ORDER_COLORS.mess}>
      <Line x={130} y={y + 54} text={label} size={26} color={ORDER_COLORS.dim} weight={600} anchor="start" spacing={3} />
      <Line x={130} y={y + 130} text={`${shown}`} size={80} color={ORDER_COLORS.mess} weight={700} font={FONT_DISPLAY} anchor="start" />
      <Line
        x={130 + (shown > 9 ? 106 : 60)}
        y={y + 130}
        text={shown === 1 ? 'PLACE CHECKED' : 'PLACES CHECKED'}
        size={30}
        color={ORDER_COLORS.text}
        weight={600}
        anchor="start"
      />
      {compare ? <Line x={950} y={y + 130} text={compare} size={31} color={ORDER_COLORS.tidy} weight={700} font={FONT_MONO} anchor="end" /> : null}
    </Panel>
  );
};

/** One fixed attention budget, cut into N. */
export const Budget: React.FC<{ y: number; on: number; lit: number }> = ({ y, on, lit }) => {
  if (on <= 0.01) return null;
  const W = 820;
  const seg = W / N;
  const split = clamp01(lit);
  return (
    <Panel y={y} on={on} h={190} color={ORDER_COLORS.indigo}>
      <Line x={540} y={y + 52} text="ONE VISUAL SYSTEM · 20 THINGS COMPETING FOR IT" size={27} color={ORDER_COLORS.dim} weight={600} spacing={2} />
      <rect x={130} y={y + 78} width={W} height={40} rx={12} fill={ORDER_COLORS.indigo} opacity={0.85} />
      {Array.from({ length: N - 1 }, (_, k) => (
        <rect key={k} x={130 + seg * (k + 1) - 1.5} y={y + 78} width={3} height={40} fill={ORDER_COLORS.stage} opacity={split} />
      ))}
      <Line x={130} y={y + 158} text="EACH ONE TAKES A SLICE" size={28} color={ORDER_COLORS.text} weight={600} anchor="start" />
      <Line
        x={950}
        y={y + 158}
        text={`${Math.round(mix(100, 100 / N, split))}% LEFT`}
        size={32}
        color={ORDER_COLORS.indigo}
        weight={700}
        font={FONT_MONO}
        anchor="end"
      />
    </Panel>
  );
};

/** The put-back counter, against the true worst case for N things. */
export const SwapCounter: React.FC<{ y: number; on: number; done: number; total: number }> = ({ y, on, done, total }) => {
  if (on <= 0.01) return null;
  return (
    <Panel y={y} on={on} h={190} color={ORDER_COLORS.tidy}>
      <Line x={540} y={y + 52} text="DISTANCE BACK TO THE ONE" size={27} color={ORDER_COLORS.dim} weight={600} spacing={3} />
      <Line x={540} y={y + 136} text={`${Math.round(done)} / ${total}`} size={84} color={ORDER_COLORS.tidy} weight={700} font={FONT_DISPLAY} />
      <Line x={540} y={y + 174} text={`PUT-BACKS · NEVER MORE THAN ${WORST_SWAPS}`} size={27} color={ORDER_COLORS.text} weight={600} spacing={2} />
    </Panel>
  );
};

/** Up to three live counts side by side — THINGS · HOMES · ON THE FLOOR. The values are whatever
 *  the caller counted off its own state this frame; nothing here holds a number of its own. */
export const Tally: React.FC<{
  y: number;
  on: number;
  title?: string;
  color?: string;
  cols: { label: string; value: string; color: string; pulse?: number }[];
}> = ({ y, on, title, color = ORDER_COLORS.accent, cols }) => {
  if (on <= 0.01) return null;
  const top = title ? 52 : 0;
  const w = 920 / cols.length;
  return (
    <Panel y={y} on={on} h={top + 150} color={color}>
      {title ? <Line x={540} y={y + 50} text={title} size={27} color={ORDER_COLORS.dim} weight={600} spacing={3} /> : null}
      {cols.map((c, k) => {
        const cx = 80 + w * (k + 0.5);
        return (
          <g key={k}>
            {k > 0 ? <path d={`M${80 + w * k} ${y + top + 28} v94`} stroke="rgba(255,255,255,0.1)" strokeWidth={2} /> : null}
            <Line x={cx} y={y + top + 58} text={c.label} size={24} color={ORDER_COLORS.dim} weight={600} spacing={2.5} />
            <g transform={`translate(${cx} ${y + top + 124}) scale(${1 + 0.12 * (c.pulse ?? 0)})`}>
              <Line x={0} y={0} text={c.value} size={68} color={c.color} weight={700} font={FONT_DISPLAY} />
            </g>
          </g>
        );
      })}
    </Panel>
  );
};

export const Vignette: React.FC<{ amount?: number }> = ({ amount = 0.4 }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: `radial-gradient(ellipse 118% 84% at 50% 48%, transparent 52%, rgba(0,0,0,${amount}) 100%)`,
      pointerEvents: 'none',
    }}
  />
);
