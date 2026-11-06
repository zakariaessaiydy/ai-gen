// Countable objects for the math songs (origin = centre, ~160 px tall like kit's Apple/Star/Balloon).
import React from 'react';
import { Apple, Ball, Balloon, FONT_TOON, RAINBOW, Star } from './kit';
import { KINK, kst } from './face';
import { Vol } from './depth';

export type ItemKind = 'apple' | 'duck' | 'ball' | 'star' | 'finger' | 'cupcake' | 'frog' | 'balloon' | 'bird' | 'cookie';

export const Duck: React.FC = () => (
  <g>
    <Vol><ellipse cx={0} cy={20} rx={78} ry={50} fill="#ffd166" {...kst(7)} /></Vol>
    <Vol><circle cx={42} cy={-40} r={40} fill="#ffd166" {...kst(7)} /></Vol>
    <path d="M 76,-40 L 112,-30 L 76,-20 Z" fill="#ff924c" {...kst(5)} />
    <circle cx={52} cy={-50} r={7} fill={KINK} />
    <path d="M -40,10 Q -10,40 20,10" fill="none" stroke="#e9a35b" strokeWidth={7} strokeLinecap="round" />
    <path d="M -110,60 Q 0,90 110,60" fill="none" stroke="#4cc9f0" strokeWidth={10} strokeLinecap="round" />
  </g>
);

export const Finger: React.FC<{ c?: string }> = ({ c = '#f2c4a0' }) => (
  <g>
    <Vol kind="tube"><rect x={-28} y={-80} width={56} height={160} rx={28} fill={c} {...kst(7)} /></Vol>
    <rect x={-17} y={-70} width={34} height={36} rx={12} fill="#ffffff" opacity={0.65} {...kst(3)} />
  </g>
);

export const Cupcake: React.FC<{ c?: string }> = ({ c = '#ff9ec7' }) => (
  <g>
    <Vol><path d="M -60,0 L 60,0 L 44,80 L -44,80 Z" fill="#c9a0ff" {...kst(7)} /></Vol>
    {[-30, 0, 30].map((x) => <path key={x} d={`M ${x},6 L ${x * 0.75},76`} stroke="#9b72cf" strokeWidth={5} />)}
    <Vol><path d="M -70,4 Q -80,-40 -30,-50 Q 0,-90 30,-50 Q 80,-40 70,4 Z" fill={c} {...kst(7)} /></Vol>
    <Vol><circle cx={0} cy={-76} r={16} fill="#ff595e" {...kst(5)} /></Vol>
  </g>
);

export const Frog: React.FC = () => (
  <g>
    <Vol><ellipse cx={0} cy={20} rx={80} ry={56} fill="#8ac926" {...kst(7)} /></Vol>
    {[-36, 36].map((x) => (
      <g key={x}>
        <Vol><circle cx={x} cy={-36} r={28} fill="#8ac926" {...kst(6)} /></Vol>
        <circle cx={x} cy={-36} r={15} fill="#ffffff" {...kst(3)} />
        <circle cx={x + 3} cy={-34} r={7} fill={KINK} />
      </g>
    ))}
    <path d="M -36,24 Q 0,50 36,24" fill="none" {...kst(6)} />
    <ellipse cx={-36} cy={10} rx={10} ry={6} fill="#ff9ec7" opacity={0.7} />
    <ellipse cx={36} cy={10} rx={10} ry={6} fill="#ff9ec7" opacity={0.7} />
  </g>
);

export const Bird: React.FC<{ c?: string; flap?: number }> = ({ c = '#4cc9f0', flap = 0 }) => (
  <g>
    <Vol><ellipse cx={0} cy={10} rx={64} ry={50} fill={c} {...kst(7)} /></Vol>
    <path d={`M -10,0 Q -60,${-30 - flap * 40} -80,${-10 - flap * 50} Q -50,20 -10,20 Z`} fill={c} {...kst(6)} />
    <circle cx={30} cy={-6} r={8} fill={KINK} />
    <path d="M 60,0 L 88,10 L 60,20 Z" fill="#ffca3a" {...kst(5)} />
  </g>
);

export const Cookie: React.FC<{ bite?: number }> = ({ bite = 0 }) => (
  <g>
    <Vol><circle r={72} fill="#e9a35b" {...kst(7)} /></Vol>
    {[[-26, -20], [24, -30], [-6, 20], [34, 22], [-36, 30]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={10} fill="#6b3f2a" />)}
    {bite > 0 && <circle cx={60} cy={-50} r={40 * bite} fill="#ffffff" />}
  </g>
);

export const Item: React.FC<{ kind: ItemKind; i?: number; t?: number }> = ({ kind, i = 0, t = 0 }) => {
  switch (kind) {
    case 'apple': return <Apple />;
    case 'duck': return <Duck />;
    case 'ball': return <Ball r={70} rot={i * 40} />;
    case 'star': return <Star c={RAINBOW[(i + 2) % RAINBOW.length]} />;
    case 'finger': return <Finger />;
    case 'cupcake': return <Cupcake c={['#ff9ec7', '#ffd166', '#9be7ff', '#b9fbc0', '#ffb3c6'][i % 5]} />;
    case 'frog': return <Frog />;
    case 'balloon': return <Balloon c={['#ff595e', '#1982c4', '#ffca3a'][i % 3]} />;
    case 'bird': return <Bird c={['#4cc9f0', '#ff924c'][i % 2]} flap={Math.abs(Math.sin(t * 3 + i))} />;
    default: return <Cookie />;
  }
};

/** a hand with n raised fingers (0 = fist) — the finger-counting card */
export const Hand: React.FC<{ n: number; skin?: string }> = ({ n, skin = '#f2c4a0' }) => (
  <g>
    {/* index, middle, ring, pinky go up first (1..4), the thumb is the 5th */}
    {[-66, -22, 22, 66].map((x, k) => {
      const up = k < Math.min(n, 4);
      return <Vol key={k} kind="tube"><rect x={x - 20} y={up ? -170 : -60} width={40} height={up ? 150 : 50} rx={20} fill={skin} {...kst(6)} /></Vol>;
    })}
    <Vol kind="tube"><rect x={86} y={n >= 5 ? -70 : -20} width={40} height={n >= 5 ? 110 : 50} rx={20} fill={skin} {...kst(6)} transform={n >= 5 ? 'rotate(30 106 20)' : undefined} /></Vol>
    <Vol><rect x={-95} y={-50} width={200} height={170} rx={60} fill={skin} {...kst(7)} /></Vol>
  </g>
);

/** a number badge (rainbow circle) — the count-along mark */
export const Badge: React.FC<{ n: number; s?: number }> = ({ n, s = 1 }) => (
  <g transform={`scale(${s})`}>
    <circle r={38} fill={RAINBOW[(n - 1 + RAINBOW.length) % RAINBOW.length]} {...kst(6)} />
    <text y={16} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={46} fill="#ffffff" stroke={KINK} strokeWidth={3} paintOrder="stroke">{n}</text>
  </g>
);

/** positions + scale for a group of n objects around (cx, cy) inside a ~300 px wide box (rows of 3, 5 → 3 + 2) */
export const groupLayout = (n: number, cx: number, cy: number, box = 300): { x: number; y: number; s: number }[] => {
  const per = n <= 2 ? n : n === 4 ? 2 : 3;
  const rows = Math.ceil(n / per);
  const s = n === 1 ? 0.95 : n === 2 ? 0.8 : n === 3 ? 0.5 : rows > 1 ? 0.6 : 0.55;
  const g = Math.min(box / per, 175 * s + 18);
  return Array.from({ length: n }, (_, i) => {
    const r = Math.floor(i / per);
    const inRow = Math.min(per, n - r * per);
    return { x: cx + (i % per - (inRow - 1) / 2) * g, y: cy + (r - (rows - 1) / 2) * g * 1.05, s };
  });
};

/** the white table behind the counted objects (top-left teaching area) */
export const Table: React.FC<{ x: number; y: number; w?: number; h?: number; o?: number }> = ({ x, y, w = 700, h = 440, o = 1 }) => (
  <g opacity={o}>
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={44} fill="#ffffff" opacity={0.9} {...kst(9)} />
  </g>
);
