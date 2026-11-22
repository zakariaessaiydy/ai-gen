// PAPERDOC · DOODLE — the crayon character rig for drawn finance/history documentaries
// ("big stories, drawn small"). A simple, likeable drawn person: round head, crayon-filled
// body, line limbs — every stroke sketched by rough.js and re-seeded every BOIL frames so the
// drawing boils like hand-made animation.
//
//   <Doodle spec={BANKER} x={600} y={900} s={1.2} pose="point" expr="smug" t={t} talk />
//
// (x, y) = between the feet; height ≈ 380 px × s. Poses + expressions + outfits + props.
import React from 'react';
import { CRAYON, INK, RCircle, RCurve, REllipse, RLine, RPath, RPoly, boilSeed } from './rough';

export type DoodlePose = 'stand' | 'wave' | 'point' | 'cheer' | 'shrug' | 'think' | 'hold' | 'facepalm' | 'cross' | 'present';
export type DoodleExpr = 'neutral' | 'happy' | 'grin' | 'sad' | 'shock' | 'worried' | 'smug' | 'angry' | 'think';
export type DoodleHat = 'none' | 'top' | 'cap' | 'beret' | 'crown' | 'hardhat';
export type DoodleHair = 'none' | 'short' | 'spiky' | 'bob' | 'curly' | 'bun';
export type DoodleProp = 'none' | 'money' | 'coin' | 'tulip' | 'phone' | 'briefcase' | 'paper' | 'chart';

export type DoodleSpec = {
  id: string; // seeds the strokes, so two characters never boil in sync
  skin?: string;
  shirt: string;
  pants?: string;
  hair?: string;
  hairStyle?: DoodleHair;
  hat?: DoodleHat;
  hatColor?: string;
  tie?: string; // a tie colour = a suit
  glasses?: boolean;
  mustache?: boolean;
  dress?: boolean; // a dress instead of shirt + pants
};

// ready-made cast (generic types — no real people)
export const DOODLES = {
  banker: { id: 'banker', shirt: '#3b3f52', pants: '#2c2f3d', tie: CRAYON.red, hat: 'top', hatColor: '#25252b', hair: '#4a3a2c', hairStyle: 'short', mustache: true },
  trader: { id: 'trader', shirt: CRAYON.blue, pants: '#2d3550', tie: CRAYON.yellow, hair: '#2d2218', hairStyle: 'spiky' },
  worker: { id: 'worker', shirt: CRAYON.orange, pants: '#4a5a7a', hat: 'cap', hatColor: CRAYON.green, hair: '#5a3d24', hairStyle: 'short' },
  merchant: { id: 'merchant', shirt: CRAYON.brown, pants: '#3d3226', hat: 'beret', hatColor: '#2c2a3a', hair: '#7a5a3a', hairStyle: 'curly', mustache: true },
  investor: { id: 'investor', shirt: CRAYON.purple, dress: true, hair: '#2a1d14', hairStyle: 'bob', glasses: true },
  kid: { id: 'kid', shirt: CRAYON.green, pants: CRAYON.blue, hair: '#c4782f', hairStyle: 'spiky' },
  king: { id: 'king', shirt: CRAYON.red, pants: '#5a2a2a', hat: 'crown', hatColor: CRAYON.yellow, hair: '#8a8a8a', hairStyle: 'curly', mustache: true },
  narrator: { id: 'narrator', shirt: CRAYON.teal, pants: '#33404a', hair: '#3a2a1e', hairStyle: 'bun', glasses: true, dress: false },
} satisfies Record<string, DoodleSpec>;

const sk = (w: number, color = INK) => ({ strokeWidth: w, stroke: color });
const fillO = (fill: string, w = 4) => ({ ...sk(w), fill, fillStyle: 'hachure' as const, hachureGap: 6, fillWeight: 2.4 });
const solidO = (fill: string, w = 4) => ({ ...sk(w), fill, fillStyle: 'solid' as const });

// arm end points (hand) per pose, relative to the shoulder, for the RIGHT arm (screen right).
// The left arm mirrors x. `elbow` bends the line so arms never look like sticks.
type Arm = { hand: [number, number]; elbow: [number, number] };
const ARMS: Record<DoodlePose, { r: Arm; l: Arm }> = {
  stand: { r: { elbow: [16, 58], hand: [22, 118] }, l: { elbow: [16, 58], hand: [22, 118] } },
  wave: { r: { elbow: [62, -12], hand: [74, -92] }, l: { elbow: [16, 58], hand: [22, 118] } },
  point: { r: { elbow: [70, 6], hand: [150, -6] }, l: { elbow: [16, 58], hand: [22, 118] } },
  cheer: { r: { elbow: [44, -50], hand: [56, -128] }, l: { elbow: [44, -50], hand: [56, -128] } },
  shrug: { r: { elbow: [58, 40], hand: [104, -10] }, l: { elbow: [58, 40], hand: [104, -10] } },
  think: { r: { elbow: [40, 64], hand: [-8, -38] }, l: { elbow: [10, 62], hand: [18, 116] } },
  hold: { r: { elbow: [30, 64], hand: [-10, 78] }, l: { elbow: [30, 64], hand: [-10, 78] } },
  facepalm: { r: { elbow: [46, 50], hand: [-28, -64] }, l: { elbow: [16, 58], hand: [22, 118] } },
  cross: { r: { elbow: [36, 52], hand: [-40, 62] }, l: { elbow: [36, 52], hand: [-40, 74] } },
  present: { r: { elbow: [64, 30], hand: [128, 10] }, l: { elbow: [16, 58], hand: [22, 118] } },
};

const Face: React.FC<{ expr: DoodleExpr; t: number; talk: boolean; seed: number; glasses?: boolean; mustache?: boolean; hair?: string }> = ({ expr, t, talk, seed, glasses, mustache, hair }) => {
  // blink: closed for 3 frames every ~3.4 s, offset per character
  const ph = (t * 30 + seed * 7) % 102;
  const closed = ph < 3;
  const eyeY = -6;
  const eye = (x: number) =>
    closed || expr === 'happy' || expr === 'grin' ? (
      <RPath d={`M ${x - 9},${eyeY} Q ${x},${eyeY - 9} ${x + 9},${eyeY}`} seed={seed + x} o={sk(4)} />
    ) : expr === 'shock' ? (
      <g>
        <RCircle x={x} y={eyeY} d={20} seed={seed + x} o={solidO(CRAYON.white, 3)} />
        <circle cx={x} cy={eyeY} r={4.5} fill={INK} />
      </g>
    ) : (
      <ellipse cx={x} cy={eyeY} rx={5.5} ry={7} fill={INK} />
    );
  // brows carry most of the emotion
  const brow = (x: number, side: 1 | -1) => {
    const tilt = expr === 'angry' ? 8 * side : expr === 'sad' || expr === 'worried' ? -7 * side : expr === 'shock' ? 0 : expr === 'smug' ? (side > 0 ? -5 : 4) : 0;
    const lift = expr === 'shock' ? -12 : expr === 'think' && side > 0 ? -7 : 0;
    return <RLine x1={x - 12} y1={-28 + tilt + lift} x2={x + 12} y2={-28 - tilt + lift} seed={seed + 40 + x} o={sk(4, hair ?? INK)} />;
  };
  const open = talk ? 0.35 + 0.65 * Math.abs(Math.sin(t * 15)) : 0;
  const mouth = (() => {
    if (talk) return <REllipse x={2} y={26} w={24} h={4 + 18 * open} seed={seed + 5} o={solidO('#7a2a2a', 3)} />;
    switch (expr) {
      case 'happy':
        return <RPath d="M -16,20 Q 2,38 20,20" seed={seed + 5} o={sk(4)} />;
      case 'grin':
        return <RPath d="M -20,18 Q 2,46 24,18 Z" seed={seed + 5} o={solidO(CRAYON.white, 4)} />;
      case 'sad':
        return <RPath d="M -14,32 Q 2,18 18,32" seed={seed + 5} o={sk(4)} />;
      case 'shock':
        return <REllipse x={2} y={28} w={22} h={28} seed={seed + 5} o={solidO('#7a2a2a', 3)} />;
      case 'worried':
        return <RPath d="M -16,28 Q -8,22 0,28 Q 8,34 18,26" seed={seed + 5} o={sk(4)} />;
      case 'smug':
        return <RPath d="M -12,26 Q 8,30 22,16" seed={seed + 5} o={sk(4)} />;
      case 'angry':
        return <RLine x1={-14} y1={28} x2={18} y2={26} seed={seed + 5} o={sk(5)} />;
      case 'think':
        return <RPath d="M -6,28 Q 6,24 16,28" seed={seed + 5} o={sk(4)} />;
      default:
        return <RLine x1={-10} y1={26} x2={14} y2={26} seed={seed + 5} o={sk(4)} />;
    }
  })();
  return (
    <g>
      {brow(-22, -1)}
      {brow(24, 1)}
      {eye(-22)}
      {eye(24)}
      {glasses && (
        <g>
          <RCircle x={-22} y={eyeY} d={36} seed={seed + 61} o={sk(3.5)} />
          <RCircle x={24} y={eyeY} d={36} seed={seed + 62} o={sk(3.5)} />
          <RLine x1={-4} y1={eyeY - 2} x2={6} y2={eyeY - 2} seed={seed + 63} o={sk(3.5)} />
        </g>
      )}
      {mustache && <RPath d="M -22,16 Q -8,8 2,14 Q 12,8 26,16 Q 12,22 2,18 Q -8,22 -22,16 Z" seed={seed + 70} o={solidO(hair ?? INK, 3)} />}
      {mouth}
      {(expr === 'sad' || expr === 'worried') && <RPath d="M 40,-2 Q 46,10 40,16 Q 34,10 40,-2 Z" seed={seed + 80} o={solidO('#8fc8f0', 2)} />}
    </g>
  );
};

const Hair: React.FC<{ style: DoodleHair; color: string; seed: number }> = ({ style, color, seed }) => {
  const o = fillO(color, 4);
  switch (style) {
    case 'short':
      return <RPath d="M -62,-18 Q -66,-70 -10,-74 Q 50,-78 64,-22 Q 40,-52 0,-52 Q -40,-52 -62,-18 Z" seed={seed} o={o} />;
    case 'spiky':
      return <RPoly pts={[[-62, -22], [-56, -64], [-34, -52], [-20, -84], [0, -58], [18, -86], [32, -56], [54, -70], [64, -24], [30, -48], [-30, -48]]} seed={seed} o={o} />;
    case 'bob':
      return <RPath d="M -70,30 Q -80,-74 0,-76 Q 80,-74 70,30 L 54,30 Q 58,-40 0,-48 Q -58,-40 -54,30 Z" seed={seed} o={o} />;
    case 'curly':
      return (
        <g>
          {[-52, -28, 0, 28, 52].map((x, i) => (
            <RCircle key={i} x={x} y={-56 - (i % 2) * 10} d={40} seed={seed + i} o={o} />
          ))}
        </g>
      );
    case 'bun':
      return (
        <g>
          <RCircle x={0} y={-86} d={44} seed={seed + 1} o={o} />
          <RPath d="M -62,-14 Q -64,-72 0,-74 Q 64,-72 62,-14 Q 40,-50 0,-50 Q -40,-50 -62,-14 Z" seed={seed} o={o} />
        </g>
      );
    default:
      return null;
  }
};

const Hat: React.FC<{ hat: DoodleHat; color: string; seed: number }> = ({ hat, color, seed }) => {
  switch (hat) {
    case 'top':
      return (
        <g>
          <RPoly pts={[[-40, -140], [40, -140], [36, -62], [-36, -62]]} seed={seed} o={solidO(color, 4)} />
          <RLine x1={-38} y1={-78} x2={38} y2={-78} seed={seed + 1} o={sk(7, CRAYON.red)} />
          <REllipse x={0} y={-60} w={130} h={22} seed={seed + 2} o={solidO(color, 4)} />
        </g>
      );
    case 'cap':
      return (
        <g>
          <RPath d="M -62,-40 Q -60,-92 0,-94 Q 60,-92 62,-40 Z" seed={seed} o={fillO(color, 4)} />
          <RPath d="M 40,-44 Q 90,-48 104,-36 L 52,-34 Z" seed={seed + 1} o={solidO(color, 4)} />
        </g>
      );
    case 'beret':
      return <REllipse x={-6} y={-66} w={140} h={50} seed={seed} o={fillO(color, 4)} />;
    case 'crown':
      return <RPoly pts={[[-48, -56], [-50, -110], [-24, -82], [0, -122], [24, -82], [50, -110], [48, -56]]} seed={seed} o={solidO(color, 4)} />;
    case 'hardhat':
      return (
        <g>
          <RPath d="M -60,-46 Q -56,-104 0,-106 Q 56,-104 60,-46 Z" seed={seed} o={solidO(color, 4)} />
          <RLine x1={-74} y1={-46} x2={74} y2={-46} seed={seed + 1} o={sk(8, color)} />
        </g>
      );
    default:
      return null;
  }
};

export const Prop: React.FC<{ prop: DoodleProp; seed: number; s?: number }> = ({ prop, seed, s = 1 }) => {
  const g = (child: React.ReactNode) => <g transform={`scale(${s})`}>{child}</g>;
  switch (prop) {
    case 'money':
      return g(
        <g>
          <RPath d="M -34,-6 Q -50,40 0,46 Q 50,40 34,-6 Q 20,-20 12,-24 L 18,-40 L -18,-40 L -12,-24 Q -20,-20 -34,-6 Z" seed={seed} o={fillO('#c9a46a', 4)} />
          <text x={0} y={30} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={900} fontSize={34} fill={CRAYON.money}>$</text>
        </g>,
      );
    case 'coin':
      return g(
        <g>
          <RCircle x={0} y={0} d={56} seed={seed} o={solidO(CRAYON.yellow, 4)} />
          <text x={0} y={11} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={900} fontSize={30} fill="#8a6410">$</text>
        </g>,
      );
    case 'tulip':
      return g(
        <g>
          <RLine x1={0} y1={0} x2={0} y2={-70} seed={seed} o={sk(5, CRAYON.green)} />
          <RPath d="M 0,-40 Q 22,-50 26,-30 Q 10,-30 0,-40 Z" seed={seed + 1} o={solidO(CRAYON.green, 3)} />
          <RPath d="M -20,-96 L -10,-74 L 0,-98 L 10,-74 L 20,-96 Q 24,-66 0,-62 Q -24,-66 -20,-96 Z" seed={seed + 2} o={solidO(CRAYON.red, 4)} />
        </g>,
      );
    case 'phone':
      return g(<g><RPoly pts={[[-18, -34], [18, -34], [18, 34], [-18, 34]]} seed={seed} o={solidO('#33363f', 4)} /><rect x={-12} y={-26} width={24} height={44} fill="#9fd8ff" /></g>);
    case 'briefcase':
      return g(
        <g>
          <RPoly pts={[[-44, -24], [44, -24], [44, 30], [-44, 30]]} seed={seed} o={fillO(CRAYON.brown, 4)} />
          <RPath d="M -14,-24 L -14,-38 L 14,-38 L 14,-24" seed={seed + 1} o={sk(5)} />
        </g>,
      );
    case 'paper':
      return g(
        <g>
          <RPoly pts={[[-32, -42], [32, -42], [32, 42], [-32, 42]]} seed={seed} o={solidO(CRAYON.white, 4)} />
          {[-24, -10, 4, 18].map((y, i) => <RLine key={i} x1={-20} y1={y} x2={20 - (i % 2) * 10} y2={y} seed={seed + 2 + i} o={sk(2.5, '#8a8170')} />)}
        </g>,
      );
    case 'chart':
      return g(
        <g>
          <RPoly pts={[[-46, -36], [46, -36], [46, 36], [-46, 36]]} seed={seed} o={solidO(CRAYON.white, 4)} />
          <RPath d="M -36,24 L -14,4 L 4,14 L 34,-26" seed={seed + 1} o={sk(5, CRAYON.green)} />
        </g>,
      );
    default:
      return null;
  }
};

export const Doodle: React.FC<{
  spec: DoodleSpec;
  x: number;
  y: number;
  s?: number;
  t: number; // seconds (for blink, boil, talk, idle)
  pose?: DoodlePose;
  expr?: DoodleExpr;
  talk?: boolean;
  prop?: DoodleProp; // held in the right hand
  facing?: 1 | -1;
  walk?: number; // walk cycle phase (0 = standing)
  hop?: number; // px off the ground
  boil?: boolean;
}> = ({ spec, x, y, s = 1, t, pose = 'stand', expr = 'neutral', talk = false, prop = 'none', facing = 1, walk = 0, hop = 0, boil = true }) => {
  const frame = Math.round(t * 30);
  const base = [...spec.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const seed = boil ? boilSeed(frame, base) : base * 97 + 1;
  const skin = spec.skin ?? CRAYON.skin;
  const pants = spec.pants ?? '#3d4458';
  const bob = Math.sin(t * 2.2 + base) * 3 + (talk ? Math.abs(Math.sin(t * 7.5)) * 3 : 0);
  const arms = ARMS[pose];
  const legSwing = Math.sin(walk * Math.PI * 2) * 22;
  const shoulderY = -206;
  const hip = -96;

  const arm = (side: 1 | -1, a: Arm, k: number) => {
    const sx = 48 * side;
    const ex = sx + a.elbow[0] * side;
    const ey = shoulderY + a.elbow[1];
    const hx = sx + a.hand[0] * side;
    const hy = shoulderY + a.hand[1];
    return (
      <g key={k}>
        <RCurve pts={[[sx, shoulderY + 6], [ex, ey], [hx, hy]]} seed={seed + 300 + k} o={sk(9, spec.dress ? spec.shirt : spec.shirt)} />
        <RCurve pts={[[sx, shoulderY + 6], [ex, ey], [hx, hy]]} seed={seed + 310 + k} o={sk(3)} />
        <RCircle x={hx} y={hy} d={24} seed={seed + 320 + k} o={solidO(skin, 3)} />
      </g>
    );
  };

  return (
    <g transform={`translate(${x},${y - hop}) scale(${s * facing},${s})`}>
      {/* ground shadow */}
      <ellipse cx={0} cy={4 + hop / s} rx={70} ry={12} fill="rgba(60,40,20,0.16)" />
      <g transform={`translate(0,${bob})`}>
        {/* legs */}
        {!spec.dress || true ? (
          <g>
            <RLine x1={-20} y1={hip} x2={-26 + legSwing} y2={-8} seed={seed + 10} o={sk(14, pants)} />
            <RLine x1={20} y1={hip} x2={26 - legSwing} y2={-8} seed={seed + 11} o={sk(14, pants)} />
            <REllipse x={-32 + legSwing} y={-4} w={46} h={20} seed={seed + 12} o={solidO('#2d2620', 3)} />
            <REllipse x={32 - legSwing} y={-4} w={46} h={20} seed={seed + 13} o={solidO('#2d2620', 3)} />
          </g>
        ) : null}
        {/* body */}
        {spec.dress ? (
          <RPath d="M -44,-212 Q 0,-228 44,-212 L 74,-70 Q 0,-52 -74,-70 Z" seed={seed + 20} o={fillO(spec.shirt, 4)} />
        ) : (
          <g>
            <RPath d={`M -50,-212 Q 0,-226 50,-212 L 46,${hip} L -46,${hip} Z`} seed={seed + 20} o={fillO(spec.shirt, 4)} />
            <RLine x1={-46} y1={hip + 2} x2={46} y2={hip + 2} seed={seed + 21} o={sk(10, pants)} />
          </g>
        )}
        {spec.tie && <RPoly pts={[[0, -212], [10, -196], [6, -150], [0, -138], [-6, -150], [-10, -196]]} seed={seed + 22} o={solidO(spec.tie, 3)} />}
        {/* arms (back arm first) */}
        {arm(-1, arms.l, 1)}
        {/* head */}
        <g transform="translate(0,-282)">
          <RCircle x={0} y={0} d={136} seed={seed + 30} o={fillO(skin, 4)} />
          {spec.hairStyle && spec.hairStyle !== 'none' && <Hair style={spec.hairStyle} color={spec.hair ?? '#3a2a1e'} seed={seed + 40} />}
          {spec.hat && spec.hat !== 'none' && <Hat hat={spec.hat} color={spec.hatColor ?? INK} seed={seed + 50} />}
          <g transform={`scale(${facing},1)`}>
            <Face expr={expr} t={t} talk={talk} seed={seed + 60} glasses={spec.glasses} mustache={spec.mustache} hair={spec.hair} />
          </g>
        </g>
        {arm(1, arms.r, 2)}
        {prop !== 'none' && (
          <g transform={`translate(${48 + arms.r.hand[0]},${shoulderY + arms.r.hand[1] - 6})`}>
            <Prop prop={prop} seed={seed + 400} s={0.95} />
          </g>
        )}
      </g>
    </g>
  );
};
