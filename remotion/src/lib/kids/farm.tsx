// KIDS KIT — the FARM (Day 44): the farm animals as Critter specs (cow, pig, sheep, duck, chick, hen …) and the
// farmyard props — a red Barn whose doors open, a white Fence, a HayBale. Put them on a Meadow (tree={false}).
// Model sheet = KidsFarmSheet.
import React from 'react';
import { type CritterSpec } from './critter';
import { kst } from './face';
import { Vol } from './depth';
import { FLOOR } from './sets';

export const COW: CritterSpec = { id: 'cow', species: 'cow', fur: '#ffffff', fur2: '#ffc8dd', dark: '#3d3247', iris: '#4a2c1a' };
export const PIG: CritterSpec = { id: 'pig', species: 'pig', fur: '#ffafcc', fur2: '#ffd6e5', dark: '#d6608f' };
export const SHEEP: CritterSpec = { id: 'sheep', species: 'sheep', fur: '#ffe8d1', fur2: '#ffffff', dark: '#5c4a6a' };
export const DUCK: CritterSpec = { id: 'duck', species: 'duck', fur: '#ffffff', fur2: '#eef2f6', dark: '#ff9f1c' };
export const CHICK: CritterSpec = { id: 'chick', species: 'chick', fur: '#ffd60a', fur2: '#fff3b0', dark: '#ff8c00' };
export const HEN: CritterSpec = { id: 'hen', species: 'chick', fur: '#c8814f', fur2: '#f3d3b0', dark: '#ff8c00' };
export const FARM_ANIMALS = [COW, PIG, SHEEP, DUCK, CHICK];

const RED = '#e63946';
const TRIM = '#fffaf0';

// a raised FARMYARD for tall (9:16) frames, drawn OVER a Meadow (rainbow={false}): a green hill whose crest is at
// `top`, its lower edge on the Meadow's mid-hill line (so the Meadow's front grass and flowers stay in front),
// with a sandy yard (centre y = yardY) where the animals line up
export const FarmYard: React.FC<{ w: number; h: number; top: number; yardY: number }> = ({ w, h, top, yardY }) => {
  const f = FLOOR(h);
  return (
    <g>
      <Vol kind="slope">
        <path d={`M 0,${top + 70} Q ${w * 0.5},${top - 70} ${w},${top + 70} L ${w},${f - h * 0.03} Q ${w * 0.5},${f - h * 0.1} 0,${f - h * 0.04} Z`} fill="#a6dd7f" {...kst(6)} />
      </Vol>
      <Vol kind="slope"><ellipse cx={w / 2} cy={yardY} rx={w * 0.5} ry={96} fill="#f3d9a4" /></Vol>
      {[0.12, 0.3, 0.7, 0.88].map((u, i) => (
        <path key={i} d={`M ${w * u - 14},${top + 150 + (i % 2) * 40} q 6,-26 10,0 q 6,-34 10,0 q 6,-22 10,0`} fill="none" stroke="#5aa845" strokeWidth={5} strokeLinecap="round" />
      ))}
    </g>
  );
};

// a red barn. origin = the middle of its base. open 0..1 = the two doors swing open (they fold toward the walls)
export const Barn: React.FC<{ x: number; y: number; s?: number; open?: number }> = ({ x, y, s = 1, open = 0 }) => {
  const leaf = (k: -1 | 1) => {
    const hinge = k * 110;
    const sx = 1 - 0.82 * open;
    return (
      <g transform={`translate(${hinge},0) scale(${sx},1) translate(${-hinge},0)`}>
        <rect x={k < 0 ? -110 : 0} y={-232} width={110} height={232} fill={RED} {...kst(7)} />
        <rect x={k < 0 ? -98 : 12} y={-220} width={86} height={208} fill="none" stroke={TRIM} strokeWidth={12} />
        <path d={k < 0 ? 'M -98,-220 L -12,-12 M -12,-220 L -98,-12' : 'M 12,-220 L 98,-12 M 98,-220 L 12,-12'} stroke={TRIM} strokeWidth={12} />
      </g>
    );
  };
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {/* roof (gambrel) */}
      <Vol>
        <path d="M -280,-300 L -222,-430 L 0,-492 L 222,-430 L 280,-300 Z" fill="#9b2c2c" {...kst(9)} />
      </Vol>
      <path d="M -280,-300 L -222,-430 L 0,-492 L 222,-430 L 280,-300" fill="none" stroke={TRIM} strokeWidth={14} strokeLinejoin="round" />
      {/* walls */}
      <Vol kind="slope">
        <rect x={-240} y={-310} width={480} height={310} fill={RED} {...kst(9)} />
      </Vol>
      {[-150, -60, 60, 150].map((bx) => <line key={bx} x1={bx} y1={-300} x2={bx} y2={-8} stroke="#c1121f" strokeWidth={5} opacity={0.5} />)}
      <rect x={-240} y={-310} width={480} height={310} fill="none" stroke={TRIM} strokeWidth={14} />
      {/* hay loft window */}
      <rect x={-46} y={-430} width={92} height={78} rx={6} fill="#4a2c3a" stroke={TRIM} strokeWidth={10} />
      <path d="M -40,-360 Q -20,-388 0,-366 Q 20,-392 40,-360 Z" fill="#ffd166" />
      {/* the doorway: dark inside, hay on the floor, then the two doors */}
      <rect x={-110} y={-232} width={220} height={232} fill="#4a2c3a" />
      <path d="M -110,0 Q -70,-36 -20,-20 Q 20,-44 60,-18 Q 90,-34 110,0 Z" fill="#ffd166" opacity={0.85} />
      {leaf(-1)}
      {leaf(1)}
      <rect x={-118} y={-240} width={236} height={14} rx={6} fill={TRIM} {...kst(5)} />
    </g>
  );
};

// a white wooden fence from x0 to x1, its rails at the given ground y
export const Fence: React.FC<{ x0: number; x1: number; y: number; s?: number }> = ({ x0, x1, y, s = 1 }) => {
  const n = Math.max(2, Math.round((x1 - x0) / (110 * s)) + 1);
  const step = (x1 - x0) / (n - 1);
  return (
    <g>
      {[0.45, 0.8].map((h) => (
        <Vol key={h} kind="tube"><rect x={x0 - 10} y={y - 150 * s * h - 9 * s} width={x1 - x0 + 20} height={18 * s} rx={9 * s} fill={TRIM} {...kst(5)} /></Vol>
      ))}
      {Array.from({ length: n }).map((_, i) => (
        <Vol key={i} kind="tube">
          <path d={`M ${x0 + i * step - 14 * s},${y} L ${x0 + i * step - 14 * s},${y - 140 * s} L ${x0 + i * step},${y - 162 * s} L ${x0 + i * step + 14 * s},${y - 140 * s} L ${x0 + i * step + 14 * s},${y} Z`} fill={TRIM} {...kst(5)} />
        </Vol>
      ))}
    </g>
  );
};

export const HayBale: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <Vol kind="slope"><rect x={-90} y={-90} width={180} height={90} rx={18} fill="#ffd166" {...kst(6)} /></Vol>
    {[-60, -20, 20, 60].map((hx) => <path key={hx} d={`M ${hx},-82 L ${hx + 6},-8`} stroke="#e9a23b" strokeWidth={5} />)}
    <rect x={-90} y={-60} width={180} height={10} fill="#c0874f" />
  </g>
);
