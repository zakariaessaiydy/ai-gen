// =============================================================================
// lib/rooms.tsx — THE ROOMS ENGINE
//
// One floor of a house in CROSS-SECTION: a row of rooms, the partition walls between them,
// and a DOORWAY cut into the foot of each wall. It is the single-storey sibling of
// lib/carry.tsx (whose things, walker and tally it reuses): carry.tsx is about the stairs,
// this one is about the doorways — the boundary a person crosses dozens of times a day.
//
// Each room has a colour, and a thing is filled with the colour of the room it BELONGS in,
// so a blue thing on the amber floor is visibly in the wrong room before anyone says so.
// Each room also has a shelf of SLOTS — the homes things go back to, drawn as dashed
// outlines while they are empty, so the viewer can see where each thing is headed.
//
// Generic for a series: any "boundary you already cross" rule is a new layout and a new set
// of things, not a new engine — the one-touch rule, the launch pad by the front door, the
// kitchen-closing lap, the "nothing on the stairs" rule.
//
// The second half is FURNITURE and the LAUNCH PAD: side-on beds, sofas, tables and chairs to
// hide things in, a front door, a bench-and-hooks pad by it, and the search tags (? / x / tick)
// that turn "where is it?" into a count of places checked.
//
// HOMES (hamper, mail tray, key hook) hold a thing INSIDE them, and the TouchBadge counts how many
// times a thing has been picked up and put somewhere (the one-touch rule, short-41).
// =============================================================================
import React from 'react';
import { FONT_DISPLAY, FONT_MONO } from '../fonts';
import { CR, XY, clamp01 } from './carry';

export type Room = { id: string; label: string; color: string; x0: number; x1: number };

export type RoomsLayout = {
  ceil: number; // top of the rooms
  apex: number; // roof peak
  floor: number; // y the things (and the walker) stand on
  doorH: number; // doorway opening height, measured up from the floor
  wall: number; // partition thickness
  rooms: Room[]; // left to right, sharing walls: rooms[k].x1 === rooms[k + 1].x0
};

/** x of the wall (and doorway) between room k and room k + 1. */
export const doorX = (h: RoomsLayout, k: number) => h.rooms[k].x1;
export const roomMid = (h: RoomsLayout, k: number) => (h.rooms[k].x0 + h.rooms[k].x1) / 2;
/** Which room an x lies in (walls count as the room to their right). */
export const roomOf = (h: RoomsLayout, x: number) => {
  const k = h.rooms.findIndex((r) => x < r.x1);
  return k < 0 ? h.rooms.length - 1 : k;
};

/**
 * The house: roof, outer walls, floor, partitions with a doorway in each, room labels.
 * `doorGlow[k]` lights doorway k (0..1) in `doorColor[k]`.
 */
export const RoomsSection: React.FC<{
  h: RoomsLayout;
  labelOn?: number;
  doorGlow?: number[];
  doorColor?: string[];
}> = ({ h, labelOn = 1, doorGlow = [], doorColor = [] }) => {
  const x0 = h.rooms[0].x0;
  const x1 = h.rooms[h.rooms.length - 1].x1;
  const mid = (x0 + x1) / 2;
  const doorTop = h.floor - h.doorH;
  return (
    <g>
      {/* roof */}
      <path d={`M${x0 - 30},${h.ceil}L${mid},${h.apex}L${x1 + 30},${h.ceil}`} fill="none" stroke={CR.wallEdge} strokeWidth={6} strokeLinejoin="round" />
      {/* room fills: a faint wash of each room's colour */}
      {h.rooms.map((r) => (
        <g key={r.id}>
          <rect x={r.x0} y={h.ceil} width={r.x1 - r.x0} height={h.floor - h.ceil} fill={CR.wall} />
          <rect x={r.x0} y={h.floor - 16} width={r.x1 - r.x0} height={16} fill={r.color} opacity={0.18} />
        </g>
      ))}
      {/* outer shell */}
      <rect x={x0} y={h.ceil} width={x1 - x0} height={h.floor - h.ceil} fill="none" stroke={CR.wallEdge} strokeWidth={4} />
      {/* partitions, each with a doorway at its foot */}
      {h.rooms.slice(0, -1).map((_, k) => {
        const x = doorX(h, k);
        const g = clamp01(doorGlow[k] ?? 0);
        const c = doorColor[k] ?? CR.good;
        return (
          <g key={`w${k}`}>
            <rect x={x - h.wall / 2} y={h.ceil} width={h.wall} height={doorTop - h.ceil} fill="rgba(255,255,255,0.2)" />
            {/* door frame: the lintel and two jamb stubs */}
            <rect x={x - h.wall / 2 - 10} y={doorTop - 6} width={h.wall + 20} height={10} rx={3} fill="rgba(255,255,255,0.34)" />
            {g > 0.01 ? (
              <g opacity={g}>
                <rect x={x - 34} y={doorTop + 4} width={68} height={h.doorH - 4} rx={10} fill={c} opacity={0.16} />
                <path
                  d={`M${x - 26},${h.floor}L${x - 26},${doorTop + 6}L${x + 26},${doorTop + 6}L${x + 26},${h.floor}`}
                  fill="none"
                  stroke={c}
                  strokeWidth={6}
                  strokeLinejoin="round"
                />
              </g>
            ) : null}
          </g>
        );
      })}
      {/* ground */}
      <line x1={x0 - 40} y1={h.floor} x2={x1 + 40} y2={h.floor} stroke="rgba(255,255,255,0.3)" strokeWidth={5} />
      {labelOn > 0.01 ? (
        <g opacity={labelOn}>
          {h.rooms.map((r) => (
            <text key={r.id} x={(r.x0 + r.x1) / 2} y={h.ceil + 44} fill={r.color} fontFamily={FONT_MONO} fontSize={24} fontWeight={700} letterSpacing={2.5} textAnchor="middle">
              {r.label}
            </text>
          ))}
        </g>
      ) : null}
    </g>
  );
};

/** A dashed outline where a thing's home is while it is empty. Origin bottom-centre. */
export const SlotMark: React.FC<{ x: number; y: number; color: string; opacity?: number; s?: number }> = ({ x, y, color, opacity = 1, s = 1 }) => {
  if (opacity <= 0.01) return null;
  return (
    <rect
      x={x - 23 * s}
      y={y - 50 * s}
      width={46 * s}
      height={48 * s}
      rx={8}
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeDasharray="7 7"
      opacity={0.55 * opacity}
    />
  );
};

/** A thought bubble above a point (the walker's head). Its content is drawn by the caller. */
export const Thought: React.FC<{ at: XY; opacity?: number; s?: number; children?: React.ReactNode }> = ({ at, opacity = 1, s = 1, children }) => {
  if (opacity <= 0.01) return null;
  const cx = at.x + 40 * s;
  const cy = at.y - 90 * s;
  return (
    <g opacity={opacity}>
      <circle cx={at.x + 10 * s} cy={at.y - 14 * s} r={7 * s} fill={CR.text} opacity={0.85} />
      <circle cx={at.x + 22 * s} cy={at.y - 36 * s} r={11 * s} fill={CR.text} opacity={0.9} />
      <ellipse cx={cx} cy={cy} rx={62 * s} ry={50 * s} fill={CR.text} />
      <g transform={`translate(${cx},${cy})`}>{children}</g>
    </g>
  );
};

// =============================================================================
// FURNITURE — side-on silhouettes, origin at the floor. Drawn AFTER whatever is tucked into
// or behind them, so a thing "under the bed" is really under the valance. Same line weight
// as the house, so furniture reads as part of the room, not as content.
// =============================================================================
const FURN = { fill: 'rgba(255,255,255,0.07)', stroke: 'rgba(255,255,255,0.34)', sw: 3 } as const;
const furn = { fill: FURN.fill, stroke: FURN.stroke, strokeWidth: FURN.sw, strokeLinejoin: 'round' as const };

/** A bed from x0 to x1: headboard on the left, mattress top at floor - BED_TOP, a valance hiding the gap below. */
export const BED_TOP = 92;
export const Bed: React.FC<{ x0: number; x1: number; floor: number }> = ({ x0, x1, floor }) => (
  <g>
    <rect x={x0} y={floor - 160} width={14} height={160} rx={4} {...furn} />
    <rect x={x0 + 14} y={floor - BED_TOP} width={x1 - x0 - 14} height={24} rx={8} {...furn} />
    <rect x={x0 + 22} y={floor - BED_TOP - 16} width={40} height={16} rx={7} {...furn} />
    <rect x={x0 + 14} y={floor - 68} width={x1 - x0 - 14} height={50} rx={3} fill="#141925" stroke={FURN.stroke} strokeWidth={FURN.sw} />
    <path
      d={`M${x0 + 34},${floor - 58}L${x0 + 34},${floor - 24}M${x0 + 62},${floor - 58}L${x0 + 62},${floor - 24}M${x0 + 90},${floor - 58}L${x0 + 90},${floor - 24}`}
      stroke="rgba(255,255,255,0.1)"
      strokeWidth={3}
    />
    <rect x={x1 - 10} y={floor - 18} width={8} height={18} fill={FURN.stroke} />
  </g>
);

/** A toy box, lid shut. */
export const TOYBOX_H = 64;
export const ToyBox: React.FC<{ x: number; floor: number }> = ({ x, floor }) => (
  <g>
    <rect x={x - 32} y={floor - TOYBOX_H} width={64} height={TOYBOX_H} rx={5} {...furn} />
    <rect x={x - 36} y={floor - TOYBOX_H - 8} width={72} height={10} rx={4} {...furn} />
    <circle cx={x} cy={floor - TOYBOX_H / 2} r={7} fill="none" stroke={FURN.stroke} strokeWidth={3} />
  </g>
);

/** A chair seen side-on, back on the right. Seat at floor - SEAT_H. */
export const SEAT_H = 68;
export const Chair: React.FC<{ x: number; floor: number }> = ({ x, floor }) => (
  <g>
    <path d={`M${x - 24},${floor}L${x - 24},${floor - SEAT_H}M${x + 20},${floor}L${x + 20},${floor - 150}`} stroke={FURN.stroke} strokeWidth={6} strokeLinecap="round" />
    <rect x={x - 30} y={floor - SEAT_H - 8} width={56} height={10} rx={4} {...furn} />
  </g>
);

/** A sofa from x0 to x1, arm on the left, high back on the right. Cushion top at floor - CUSHION. */
export const CUSHION = 72;
export const Sofa: React.FC<{ x0: number; x1: number; floor: number }> = ({ x0, x1, floor }) => (
  <g>
    <rect x={x0} y={floor - 46} width={x1 - x0} height={36} rx={8} {...furn} />
    <rect x={x0 + 18} y={floor - CUSHION} width={x1 - x0 - 42} height={28} rx={10} {...furn} />
    <rect x={x0} y={floor - 100} width={22} height={62} rx={9} {...furn} />
    <rect x={x1 - 24} y={floor - 146} width={24} height={110} rx={10} {...furn} />
    <path d={`M${x0 + 10},${floor - 10}L${x0 + 10},${floor}M${x1 - 10},${floor - 10}L${x1 - 10},${floor}`} stroke={FURN.stroke} strokeWidth={5} />
  </g>
);

/** A table, top at floor - TABLE_H. */
export const TABLE_H = 112;
export const Table: React.FC<{ x0: number; x1: number; floor: number }> = ({ x0, x1, floor }) => (
  <g>
    <rect x={x0} y={floor - TABLE_H} width={x1 - x0} height={12} rx={4} {...furn} />
    <path
      d={`M${x0 + 12},${floor - TABLE_H + 12}L${x0 + 12},${floor}M${x1 - 12},${floor - TABLE_H + 12}L${x1 - 12},${floor}`}
      stroke={FURN.stroke}
      strokeWidth={6}
      strokeLinecap="round"
    />
  </g>
);

/** Floor clutter: a lumpy heap (the "somewhere in that pile" place). */
export const Heap: React.FC<{ x: number; floor: number; opacity?: number }> = ({ x, floor, opacity = 1 }) =>
  opacity <= 0.01 ? null : (
    <g opacity={opacity}>
      <path
        d={`M${x - 44},${floor}Q${x - 40},${floor - 26} ${x - 18},${floor - 30}Q${x - 6},${floor - 48} ${x + 12},${floor - 34}Q${x + 38},${floor - 34} ${x + 44},${floor}Z`}
        {...furn}
      />
      <path d={`M${x - 22},${floor - 12}Q${x},${floor - 22} ${x + 24},${floor - 10}`} stroke="rgba(255,255,255,0.18)" strokeWidth={3} fill="none" />
    </g>
  );

/** An open bin (the "maybe it's in there" place). */
export const Bin: React.FC<{ x: number; floor: number; opacity?: number }> = ({ x, floor, opacity = 1 }) =>
  opacity <= 0.01 ? null : (
    <g opacity={opacity}>
      <path d={`M${x - 26},${floor - 48}L${x + 26},${floor - 48}L${x + 21},${floor}L${x - 21},${floor}Z`} {...furn} />
      <line x1={x - 24} y1={floor - 30} x2={x + 24} y2={floor - 30} stroke="rgba(255,255,255,0.14)" strokeWidth={3} />
    </g>
  );

/** The front door, cut into the right-hand outer wall at x. Lights like a doorway. */
export const FrontDoor: React.FC<{ x: number; floor: number; h: number; glow?: number; color?: string }> = ({ x, floor, h, glow = 0, color = CR.good }) => {
  const top = floor - h;
  const g = clamp01(glow);
  return (
    <g>
      <rect x={x - 5} y={top} width={10} height={h} fill={CR.stage} />
      <rect x={x - 12} y={top - 6} width={28} height={10} rx={3} fill="rgba(255,255,255,0.34)" />
      <rect x={x - 3} y={top + 4} width={12} height={h - 4} rx={2} fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.4)" strokeWidth={2} />
      <circle cx={x} cy={floor - h * 0.45} r={4} fill="rgba(255,255,255,0.6)" />
      {g > 0.01 ? (
        <g opacity={g}>
          <rect x={x - 38} y={top + 4} width={50} height={h - 4} rx={10} fill={color} opacity={0.16} />
          <path d={`M${x - 30},${floor}L${x - 30},${top + 8}L${x + 10},${top + 8}`} fill="none" stroke={color} strokeWidth={6} strokeLinejoin="round" />
        </g>
      ) : null}
    </g>
  );
};

/** The LAUNCH PAD: a low bench with a rail of hooks above it, by the door. Things hang on it or sit on it. */
export const PAD_BENCH = 66;
export const PAD_HOOK = 236;
export const LaunchPad: React.FC<{ x0: number; x1: number; floor: number; hooks: number[]; color: string; opacity?: number; glow?: number }> = ({
  x0,
  x1,
  floor,
  hooks,
  color,
  opacity = 1,
  glow = 0,
}) => {
  if (opacity <= 0.01) return null;
  const g = clamp01(glow);
  const rail = floor - PAD_HOOK;
  return (
    <g opacity={opacity}>
      {g > 0.01 ? <rect x={x0 - 22} y={rail - 30} width={x1 - x0 + 44} height={PAD_HOOK + 30} rx={22} fill={color} opacity={0.1 * g} /> : null}
      <rect x={x0} y={rail - 8} width={x1 - x0} height={10} rx={4} fill="rgba(255,255,255,0.3)" />
      {hooks.map((hx) => (
        <path key={hx} d={`M${hx},${rail + 2}L${hx},${rail + 14}Q${hx},${rail + 22} ${hx + 8},${rail + 18}`} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={4} strokeLinecap="round" />
      ))}
      <rect x={x0} y={floor - PAD_BENCH} width={x1 - x0} height={12} rx={4} fill="rgba(255,255,255,0.3)" />
      <path
        d={`M${x0 + 12},${floor - PAD_BENCH + 12}L${x0 + 12},${floor}M${x1 - 12},${floor - PAD_BENCH + 12}L${x1 - 12},${floor}`}
        stroke="rgba(255,255,255,0.3)"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <rect x={x0} y={floor - 5} width={x1 - x0} height={5} fill={color} opacity={0.5 + 0.5 * g} />
    </g>
  );
};

// =============================================================================
// HOMES — where a thing lives, drawn in two halves like the basket: the caller draws the
// thing between `back` and the front, so a shirt sits INSIDE the hamper and the mail INSIDE
// the tray. Each takes the colour of the room the thing belongs to.
// =============================================================================

/** A laundry hamper, origin bottom-centre. A shirt at (x, floor - 50) peeks over the rim. */
export const HAMPER_H = 84;
export const Hamper: React.FC<{ x: number; floor: number; color: string; glow?: number; children?: React.ReactNode }> = ({ x, floor, color, glow = 0, children }) => {
  const top = floor - HAMPER_H;
  const g = clamp01(glow);
  return (
    <g>
      {g > 0.01 ? <ellipse cx={x} cy={top + 20} rx={62} ry={70} fill={color} opacity={0.12 * g} /> : null}
      <ellipse cx={x} cy={top} rx={31} ry={7} fill="rgba(0,0,0,0.5)" stroke={FURN.stroke} strokeWidth={2} />
      {children}
      <path d={`M${x - 32},${top}L${x + 32},${top}L${x + 27},${floor}L${x - 27},${floor}Z`} fill="#141925" stroke={FURN.stroke} strokeWidth={FURN.sw} strokeLinejoin="round" />
      {[top + 26, top + 50].map((yy) => (
        <line key={yy} x1={x - 29} y1={yy} x2={x + 29} y2={yy} stroke="rgba(255,255,255,0.1)" strokeWidth={3} />
      ))}
      <rect x={x - 34} y={top - 4} width={68} height={8} rx={4} fill={color} opacity={0.55 + 0.45 * g} />
    </g>
  );
};

/** A wall shelf with a mail tray on it; `y` is the shelf top, where the mail stands. */
export const MailTray: React.FC<{ x: number; y: number; color: string; glow?: number; children?: React.ReactNode }> = ({ x, y, color, glow = 0, children }) => {
  const g = clamp01(glow);
  return (
    <g>
      {g > 0.01 ? <ellipse cx={x} cy={y - 20} rx={70} ry={48} fill={color} opacity={0.12 * g} /> : null}
      <rect x={x - 54} y={y} width={108} height={10} rx={4} fill="rgba(255,255,255,0.3)" />
      <path d={`M${x - 36},${y + 10}l0,20l14,-20M${x + 36},${y + 10}l0,20l-14,-20`} stroke="rgba(255,255,255,0.22)" strokeWidth={4} fill="none" />
      <rect x={x - 38} y={y - 44} width={8} height={44} rx={3} fill="rgba(255,255,255,0.18)" />
      {children}
      <rect x={x - 38} y={y - 17} width={76} height={17} rx={4} fill="#141925" stroke={FURN.stroke} strokeWidth={FURN.sw} />
      <rect x={x - 38} y={y - 19} width={76} height={5} rx={2} fill={color} opacity={0.55 + 0.45 * g} />
    </g>
  );
};

/** A key hook on the wall; keys hang from (x, y) — put the keys glyph at (x + 16, y + 30). */
export const KeyHook: React.FC<{ x: number; y: number; color: string; glow?: number }> = ({ x, y, color, glow = 0 }) => {
  const g = clamp01(glow);
  return (
    <g>
      {g > 0.01 ? <ellipse cx={x + 10} cy={y + 14} rx={52} ry={44} fill={color} opacity={0.12 * g} /> : null}
      <rect x={x - 22} y={y - 16} width={44} height={12} rx={4} fill="rgba(255,255,255,0.3)" />
      <rect x={x - 22} y={y - 18} width={44} height={4} rx={2} fill={color} opacity={0.55 + 0.45 * g} />
      <path d={`M${x},${y - 4}L${x},${y + 8}Q${x},${y + 15} ${x + 7},${y + 11}`} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={4} strokeLinecap="round" />
    </g>
  );
};

/** A touch counter over a thing: how many times it has been picked up and put somewhere. */
export const TouchBadge: React.FC<{ x: number; y: number; n: number; color: string; pop?: number; opacity?: number }> = ({ x, y, n, color, pop = 0, opacity = 1 }) => {
  if (opacity <= 0.01 || n <= 0) return null;
  const s = 1 + 0.4 * Math.sin(Math.PI * clamp01(pop));
  return (
    <g opacity={opacity} transform={`translate(${x},${y}) scale(${s})`}>
      <circle cx={0} cy={0} r={17} fill={color} stroke={CR.ink} strokeWidth={3} />
      <text x={0} y={8} fill={CR.ink} fontFamily={FONT_DISPLAY} fontSize={23} fontWeight={700} textAnchor="middle">
        {`${n}`}
      </text>
    </g>
  );
};

/** A search tag over a place: "?" until it is checked, then a cross (nothing there) or a tick (found it). */
export type TagState = 'open' | 'miss' | 'hit';
export const SpotTag: React.FC<{ x: number; y: number; state: TagState; pop?: number; opacity?: number; colors: Record<TagState, string> }> = ({
  x,
  y,
  state,
  pop = 0,
  opacity = 1,
  colors,
}) => {
  if (opacity <= 0.01) return null;
  const c = colors[state];
  const s = 1 + 0.35 * Math.sin(Math.PI * clamp01(pop));
  return (
    <g opacity={opacity} transform={`translate(${x},${y}) scale(${s})`}>
      <circle cx={0} cy={0} r={19} fill={state === 'open' ? 'rgba(11,14,20,0.85)' : c} stroke={c} strokeWidth={3} />
      {state === 'open' ? (
        <text x={0} y={9} fill={c} fontFamily={FONT_DISPLAY} fontSize={26} fontWeight={700} textAnchor="middle">
          ?
        </text>
      ) : state === 'miss' ? (
        <path d="M-7,-7L7,7M7,-7L-7,7" stroke={CR.ink} strokeWidth={5} strokeLinecap="round" />
      ) : (
        <path d="M-8,0L-2,7L9,-7" fill="none" stroke={CR.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      )}
    </g>
  );
};

/** A speech bubble anchored at a point (a head), text inside. */
export const Say: React.FC<{ at: XY; text: string; color: string; opacity?: number; size?: number }> = ({ at, text, color, opacity = 1, size = 24 }) => {
  if (opacity <= 0.01) return null;
  const w = text.length * size * 0.6 + 30;
  const h = size + 22;
  const bx = at.x - w / 2;
  const by = at.y - h - 22;
  return (
    <g opacity={opacity}>
      <rect x={bx} y={by} width={w} height={h} rx={h / 2} fill={color} />
      <path d={`M${at.x - 8},${by + h - 1}L${at.x},${at.y - 6}L${at.x + 10},${by + h - 1}Z`} fill={color} />
      <text x={at.x} y={by + h / 2 + size * 0.36} fill={CR.ink} fontFamily={FONT_DISPLAY} fontSize={size} fontWeight={700} textAnchor="middle">
        {text}
      </text>
    </g>
  );
};
