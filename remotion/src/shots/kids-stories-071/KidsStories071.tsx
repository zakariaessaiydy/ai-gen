// TINY SPARKS · Day 71 · 🧠 Educational Stories #6 — "Lily Learns to Help Her Friends" (LONG 16:9, 5:37)
// kids-shorts/tiny-sparks/stories/day-071-lily-learns-to-help-her-friends. Cues from VO via K (keys.gen.ts).
// ENERGY LAYER standard: ident → the park: new friend LILY builds the biggest sandcastle → OOPS ×3: Mila's apples spill
// ("sorry, I'm busy") · Leo's kite sticks in the tree ("not my kite") · Bobo's heavy toy box ("I'm busy, Bobo!") → friends
// feel sad → think timer "Was Lily a good friend?" ✗ → a gust knocks down HER castle and blows away her bucket and spade →
// everybody helps her anyway → "Why?" — "Because friends help friends!" → sorry → Prof. Hoot's 3 helping steps LOOK · ASK
// · HELP (a step strip fills in, each with a your-turn) → PRACTISE game (crayons: pick up · a sad friend: hug · a fallen
// tower: stack — Bobo hugs the tower · a lonely friend: wave "come and play!") → DO IT: Lily helps — count 5 apples into
// Mila's basket · the kite (think timer · Leo jumps ✗ · wait for the wind and pull gently together) · carry Bobo's box
// (heave, ho) → the biggest castle, built together → lesson → remember (4 questions) → chant → bye + star iris.
import React from 'react';
import { Critter, critterFaceAt, type CArm } from '../../lib/kids/critter';
import { Kid, kidFaceAt, type KArm, type KidSpec } from '../../lib/kids/kid';
import { BOBO_HERO, CAPTION_COLORS, HOOT_HERO, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR } from '../../lib/kids/sets';
import { Backdrop } from '../../lib/kids/places';
import { AnswerMark, Apple, Confetti, KidsCaptions, PopText, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import {
  ActionStage, Dust, ImpactStar, MotionLines, Reaction, SparksIntro, StageWord, StarWipe, StrainLines, directorCam, onBeat, shakeOf,
  type Hit, type Shot,
} from '../../lib/kids/energy';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsStories071', durationInSeconds: 336.6, fps: 30, width: 1920, height: 1080 };

const W = 1920;
const H = 1080;
const f = FLOOR(H);
type Key = keyof typeof K;
const S = (k: Key) => VO[K[k]].start;
const E = (k: Key) => VO[K[k]].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;
const word = (k: Key, i: number) => {
  const w = timeWords(VO[K[k]]);
  return (w[Math.min(i, w.length - 1)] ?? { start: S(k) }).start;
};
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff', lily: '#c77dff' };
type KF = [number, number, number][]; // [t, x, y]
const lerp2 = (t: number, kf: KF): [number, number] => {
  if (t <= kf[0][0]) return [kf[0][1], kf[0][2]];
  for (let i = 1; i < kf.length; i++) {
    if (t <= kf[i][0]) {
      const [t0, x0, y0] = kf[i - 1];
      const [t1, x1, y1] = kf[i];
      const p = EASE_INOUT((t - t0) / Math.max(1e-6, t1 - t0));
      return [x0 + (x1 - x0) * p, y0 + (y1 - y0) * p];
    }
  }
  const l = kf[kf.length - 1];
  return [l[1], l[2]];
};
const moving = (t: number, kf: KF) => {
  for (let i = 1; i < kf.length; i++) if (t > kf[i - 1][0] && t < kf[i][0]) return kf[i - 1][1] !== kf[i][1] || kf[i - 1][2] !== kf[i][2];
  return false;
};
const heading = (t: number, kf: KF) => {
  for (let i = 1; i < kf.length; i++) if (t > kf[i - 1][0] && t < kf[i][0]) return Math.sign(kf[i][1] - kf[i - 1][1]);
  return 0;
};
const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (EASE_OUT(p) - 1) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};
const arc = (t: number, a: number, b: number, h: number) => (within(t, a, b) ? Math.sin(prog(t, a, b) * Math.PI) * h : 0);
const bounce = (on: boolean, t: number, k = 0, h = 24) => (on ? Math.abs(Math.sin(t * 7 + k)) * h : 0);

// ── cast + places
// LILY — a one-off new friend (not part of the locked cast): purple overalls, a high ponytail, pink bow.
const LILY: KidSpec = {
  id: 'lily', skin: '#a86b3c', hair: 'ponytail', hairColor: '#2b1a12', top: 'overalls', topColor: '#9d4edd', topColor2: '#ffd6ff',
  pants: '#7b2cbf', shoes: '#ff6fa5', bow: '#ff6fa5', lashes: true,
};
const KS = 0.54;
const BS = 0.6;
const HS = 0.55;
const TREE_X = 230;
const KITE_TREE: [number, number] = [330, 300];
const SAND_X = 1160;
const LILY_X = 900;
const LEO_X = 520;
const MILA_X = 1520;
const BOBO_X = 1760;
const HOOT_X = 1320;
const APPLES: [number, number][] = [[1360, f + 20], [1450, f + 50], [1640, f + 40], [1720, f + 10], [1290, f + 45]];
const BUCKET_TO = 1860;
const SPADE_TO = 700;

// ── timeline anchors
const BUILD0 = S('lily_busy');
const SPILL = word('spill', 2); // "Bump!"
const KITE_UP = word('leo_in', 9); // "flies"
const KITE_STUCK = word('leo_in', 13); // "stuck"
const GUST = word('wave', 3); // "gust"
const FALL = word('wave', 16); // "castle"
const FIX0 = S('fix');
const HOOT_IN = S('hoot_in') - 1.0;
const HOOT_OUT = S('try');
const COUNT = S('count');
const PULL = word('pull', 3);
const KITE_FREE = S('kite_free');
const CARRY0 = S('carry');
const TOGETHER = S('together');
const END_IRIS = E('bye2') + 0.6;

const LILY_PATH: KF = [
  [0, LILY_X, f], [S('mila_run') + 0.5, LILY_X, f],
  [S('try') + 0.6, LILY_X, f], [S('look1') + 0.4, 1240, f], [E('mila_thanks') + 0.2, 1240, f],
  [S('look2') + 0.4, 760, f], [E('leo_thanks') + 0.2, 760, f],
  [S('look3') + 0.4, BOBO_X - 230, f], [CARRY0 + 0.4, BOBO_X - 230, f], [CARRY0 + 3.4, 1270, f],
  [TOGETHER, 1270, f], [TOGETHER + 1.4, LILY_X, f],
];
const MILA_PATH: KF = [[0, W + 300, f], [S('mila_in') - 0.2, W + 300, f], [SPILL, MILA_X, f], [TOGETHER, MILA_X, f], [TOGETHER + 1.4, 1470, f]];
const LEO_PATH: KF = [
  [0, -300, f], [S('leo_in') - 0.2, -300, f], [KITE_UP, LEO_X, f],
  [S('leo_run') + 0.2, LEO_X, f], [S('leo_run') + 1.6, BUCKET_TO - 120, f], [FIX0 + 0.6, BUCKET_TO - 120, f], [FIX0 + 2.4, 1450, f],
  [S('hoot_in') - 0.3, 1450, f], [S('hoot_in') + 1.0, LEO_X, f],
  [TOGETHER, LEO_X + 40, f], [TOGETHER + 1.4, 680, f],
];
const BOBO_PATH: KF = [
  [0, W + 300, f], [S('bobo_in') - 0.2, W + 300, f], [E('bobo_help'), BOBO_X, f],
  [S('bobo_run') + 0.2, BOBO_X, f], [S('bobo_run') + 1.6, SPADE_TO + 100, f], [FIX0 + 0.6, SPADE_TO + 100, f], [FIX0 + 2.4, 820, f],
  [S('hoot_in') - 0.3, 820, f], [S('hoot_in') + 1.0, BOBO_X, f],
  [CARRY0 + 0.4, BOBO_X, f], [CARRY0 + 3.4, 1480, f], [TOGETHER, 1480, f], [TOGETHER + 1.4, 1700, f],
];
const HOOT_PATH: KF = [[0, W + 300, 120], [HOOT_IN, W + 300, 120], [HOOT_IN + 1.6, HOOT_X, f], [HOOT_OUT, HOOT_X, f], [HOOT_OUT + 1.8, W + 300, 100]];

// castle height in levels (0..5): built → falls → rebuilt bigger → the biggest, together
const castleLevel = (t: number) => {
  if (t < FALL) return Math.min(3, 1 + Math.floor(Math.max(0, t - BUILD0) / 1.2));
  if (t < FIX0) return 0;
  if (t < TOGETHER) return Math.min(4, Math.floor((t - FIX0) / 0.8) + 1);
  return Math.min(6, 4 + Math.floor((t - TOGETHER - 0.6) / 0.9) + 1);
};

// ── director camera
const WIDE = { z: 1.0, x: 960, y: 540 };
const KID_Y = kidFaceAt(LILY_X, f, KS)[1] + 60;
const CU = (x: number) => ({ z: 1.55, x, y: KID_Y });
const BOBO_CU = (x: number) => ({ z: 1.55, x, y: f - 280 });
const HOOT_CU = { z: 1.55, x: HOOT_X, y: critterFaceAt(HOOT_X, f, HS)[1] + 40 };
const SHOTS: Shot[] = [
  { t: 0, ...WIDE, move: 'cut', push: 0.01 },
  { t: S('lily_hi') - 0.2, z: 1.4, x: 1020, y: KID_Y + 80, move: 'smooth', dur: 1.0, push: 0.02 },
  { t: S('mila_in') - 0.2, z: 1.1, x: 1200, y: 560, move: 'smooth', dur: 0.8 },
  { t: SPILL - 0.1, z: 1.3, x: 1520, y: f - 200, move: 'snap', push: 0.01 },
  { t: S('mila_help') - 0.1, ...CU(MILA_X), move: 'whip' },
  { t: S('lily_no1') - 0.1, ...CU(LILY_X + 60), move: 'whip' },
  { t: S('leo_in') - 0.2, z: 1.1, x: 600, y: 520, move: 'smooth', dur: 0.8 },
  { t: KITE_UP - 0.1, z: 1.2, x: 520, y: 420, move: 'smooth', dur: 1.4, push: 0.02 },
  { t: S('leo_help') - 0.1, ...CU(LEO_X), move: 'whip' },
  { t: S('lily_no2') - 0.1, ...CU(LILY_X + 60), move: 'whip' },
  { t: S('bobo_in') - 0.2, z: 1.15, x: 1500, y: 560, move: 'smooth', dur: 0.8 },
  { t: S('bobo_help') - 0.1, ...BOBO_CU(BOBO_X), move: 'snap', push: 0.02 },
  { t: S('lily_no3') - 0.1, ...CU(LILY_X + 60), move: 'whip' },
  { t: S('friends_sad') - 0.2, ...WIDE, move: 'smooth', dur: 1.2, push: 0.02 },
  { t: S('answer_kind') - 0.1, ...CU(LILY_X + 60), move: 'smooth', dur: 0.8 },
  { t: GUST - 0.2, ...WIDE, move: 'snap' },
  { t: S('lily_oh') - 0.1, ...CU(LILY_X), move: 'snap', push: 0.02 },
  { t: S('mila_run') - 0.1, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: FIX0 + 0.4, z: 1.25, x: SAND_X, y: f - 220, move: 'smooth', dur: 1.0, push: 0.02 },
  { t: S('lily_why') - 0.1, ...CU(LILY_X), move: 'snap' },
  { t: S('mila_why') - 0.1, z: 1.2, x: 1200, y: KID_Y + 80, move: 'whip' },
  { t: S('lily_sorry') - 0.1, ...CU(LILY_X), move: 'snap', push: 0.02 },
  { t: HOOT_IN - 0.2, z: 1.1, x: 1200, y: 520, move: 'smooth', dur: 1.2 },
  { t: S('hoot_in') + 0.8, ...HOOT_CU, move: 'snap' },
  { t: S('step1') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('lily_repeat') - 0.1, ...CU(LILY_X), move: 'snap', push: 0.02 },
  { t: S('game') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('g3a') - 0.1, ...BOBO_CU(BOBO_X), move: 'whip' },
  { t: S('g4') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('g4a') - 0.1, ...CU(LILY_X), move: 'snap' },
  { t: S('try') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('ask1') - 0.1, z: 1.35, x: 1380, y: KID_Y + 80, move: 'smooth', dur: 0.6 },
  { t: COUNT - 0.2, z: 1.2, x: 1480, y: f - 220, move: 'smooth', dur: 0.8 },
  { t: S('mila_thanks') - 0.1, ...CU(MILA_X), move: 'snap' },
  { t: S('look2') - 0.2, z: 1.15, x: 560, y: 500, move: 'smooth', dur: 1.2 },
  { t: S('kite_q') - 0.2, z: 1.0, x: 700, y: 520, move: 'smooth', dur: 0.6 },
  { t: S('leo_jump') - 0.1, ...CU(LEO_X), move: 'whip' },
  { t: S('jump') - 0.1, z: 1.15, x: 500, y: 460, move: 'smooth', dur: 0.6 },
  { t: S('lily_idea') - 0.1, ...CU(760), move: 'whip' },
  { t: S('pull') - 0.2, z: 1.1, x: 560, y: 470, move: 'smooth', dur: 3.0, push: 0.02 },
  { t: S('leo_thanks') - 0.1, ...CU(LEO_X), move: 'snap' },
  { t: S('look3') - 0.2, z: 1.3, x: BOBO_X - 120, y: KID_Y + 80, move: 'smooth', dur: 1.0 },
  { t: CARRY0 - 0.2, z: 1.1, x: 1450, y: 560, move: 'smooth', dur: 3.4, push: 0.02 },
  { t: S('bobo_thanks') - 0.1, ...BOBO_CU(1480), move: 'snap' },
  { t: TOGETHER - 0.2, ...WIDE, move: 'smooth', dur: 1.0, push: 0.02 },
  { t: S('lily_feel') - 0.1, ...CU(LILY_X), move: 'snap', push: 0.02 },
  { t: S('lesson') - 0.2, ...WIDE, move: 'smooth', dur: 0.8 },
  { t: S('a1') - 0.1, ...CU(LILY_X), move: 'snap' },
  { t: E('a1') + 0.6, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('a4') - 0.1, ...CU(680), move: 'snap' },
  { t: E('a4') + 0.6, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('c1') - 0.1, z: 1.25, x: LILY_X + 100, y: 560, move: 'smooth', dur: 0.5, push: 0.02 },
  { t: S('c_turn') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
];
const PUNCHES = [SPILL, KITE_STUCK, FALL, KITE_FREE, TOGETHER + 1.0, S('c3')];
const HITS: Hit[] = [{ at: SPILL, amp: 6, dur: 0.25 }, { at: FALL, amp: 10, dur: 0.4 }];

// ── props
const Tree: React.FC<{ t: number }> = ({ t }) => (
  <g transform={`translate(${TREE_X},${f + 10})`}>
    <Vol kind="tube"><path d="M -50,0 Q -40,-300 -30,-520 L 30,-520 Q 40,-300 50,0 Z" fill="#8d5a3b" {...kst(7)} /></Vol>
    <g transform={`rotate(${Math.sin(t * 0.8) * 1.2} 0 -560)`}>
      <Vol>
        <circle cx={-110} cy={-600} r={150} fill="#52b788" {...kst(7)} />
        <circle cx={120} cy={-640} r={160} fill="#40916c" {...kst(7)} />
        <circle cx={10} cy={-760} r={160} fill="#74c69d" {...kst(7)} />
      </Vol>
    </g>
  </g>
);
const Kite: React.FC<{ rot?: number }> = ({ rot = 0 }) => (
  <g transform={`rotate(${rot})`}>
    <Vol><path d="M 0,-80 L 60,0 L 0,90 L -60,0 Z" fill="#ff595e" {...kst(6)} /></Vol>
    <path d="M 0,-80 L 0,90 M -60,0 L 60,0" stroke="#ffca3a" strokeWidth={6} />
    <path d="M 0,90 q 20,40 0,70 q -20,30 0,60" fill="none" {...kst(4)} />
    {[0, 1, 2].map((i) => <path key={i} d={`M ${-14},${120 + i * 30} l 28,0`} stroke={['#4cc9f0', '#8ac926', '#ffca3a'][i]} strokeWidth={10} strokeLinecap="round" />)}
  </g>
);
const Sandbox: React.FC = () => (
  <g transform={`translate(${SAND_X},${f + 10})`}>
    <Vol kind="slope"><rect x={-230} y={-40} width={460} height={70} rx={20} fill="#c98f5f" {...kst(6)} /></Vol>
    <ellipse cx={0} cy={-30} rx={210} ry={26} fill="#ffd6a5" {...kst(4)} />
  </g>
);
const Castle: React.FC<{ level: number; t: number; at: number }> = ({ level, t, at }) => {
  if (level <= 0) return null;
  const tiers = Math.min(level, 6);
  const out: React.ReactNode[] = [];
  for (let i = 0; i < tiers; i++) {
    const w = 300 - i * 38;
    const h = 62;
    const y = -40 - i * h;
    out.push(
      <g key={i}>
        <Vol kind="slope"><rect x={-w / 2} y={y - h} width={w} height={h} rx={10} fill={i % 2 ? '#ffd6a5' : '#f4a261'} {...kst(5)} /></Vol>
        {[-1, 0, 1].map((k) => <rect key={k} x={k * (w / 3) - 14} y={y - h - 18} width={28} height={22} rx={4} fill={i % 2 ? '#ffd6a5' : '#f4a261'} {...kst(4)} />)}
      </g>,
    );
  }
  const topY = -40 - tiers * 62 - 18;
  return (
    <g transform={`translate(${SAND_X},${f + 10})`}>
      {out}
      <path d={`M 0,${topY} L 0,${topY - 80}`} {...kst(5)} />
      <path d={`M 0,${topY - 80} L 60,${topY - 62} L 0,${topY - 44} Z`} fill={RAINBOW_FLAG[(tiers - 1) % RAINBOW_FLAG.length]} {...kst(4)}
        transform={`skewY(${Math.sin(t * 6 + at) * 6})`} />
    </g>
  );
};
const RAINBOW_FLAG = ['#ff595e', '#ffca3a', '#8ac926', '#4cc9f0', '#c77dff', '#ff6fa5'];
const Bucket: React.FC<{ rot?: number }> = ({ rot = 0 }) => (
  <g transform={`rotate(${rot})`}>
    <Vol><path d="M -40,-60 L 40,-60 L 30,10 L -30,10 Z" fill="#ff595e" {...kst(5)} /></Vol>
    <path d="M -40,-60 Q 0,-110 40,-60" fill="none" {...kst(4)} />
  </g>
);
const Spade: React.FC<{ rot?: number }> = ({ rot = 0 }) => (
  <g transform={`rotate(${rot})`}>
    <rect x={-6} y={-90} width={12} height={70} rx={5} fill="#ffca3a" {...kst(4)} />
    <Vol><path d="M -26,-24 L 26,-24 L 18,20 Q 0,34 -18,20 Z" fill="#4cc9f0" {...kst(5)} /></Vol>
  </g>
);
const Basket: React.FC = () => (
  <g>
    <path d="M -50,-40 Q 0,-110 50,-40" fill="none" stroke="#8d5a3b" strokeWidth={9} />
    <Vol><path d="M -60,-40 L 60,-40 L 46,30 L -46,30 Z" fill="#d4a373" {...kst(5)} /></Vol>
    <path d="M -54,-10 L 54,-10" stroke="#8d5a3b" strokeWidth={5} />
  </g>
);
const ToyBox: React.FC = () => (
  <g>
    <Vol><rect x={-90} y={-80} width={180} height={110} rx={14} fill="#4cc9f0" {...kst(6)} /></Vol>
    <rect x={-90} y={-80} width={180} height={24} rx={10} fill="#1982c4" {...kst(4)} />
    <circle cx={-40} cy={-20} r={16} fill="#ffca3a" {...kst(3)} /><circle cx={30} cy={-16} r={16} fill="#ff595e" {...kst(3)} />
  </g>
);
// the step strip: LOOK · ASK · HELP
const STEP_X = [620, 960, 1300];
const StepCard: React.FC<{ i: number; on: boolean }> = ({ i, on }) => (
  <g>
    <rect x={-150} y={-70} width={300} height={140} rx={34} fill={on ? ['#4cc9f0', '#ffca3a', '#ff6fa5'][i] : '#ffffff'} opacity={on ? 1 : 0.7} {...kst(6)} />
    <g transform="translate(-90,0)">
      {i === 0 && <g><ellipse cx={0} cy={0} rx={34} ry={22} fill="#ffffff" {...kst(4)} /><circle cx={0} cy={0} r={12} fill={KINK} /></g>}
      {i === 1 && <g><path d="M -34,-26 L 34,-26 Q 42,-26 42,-18 L 42,12 Q 42,20 34,20 L -6,20 L -22,34 L -18,20 L -34,20 Q -42,20 -42,12 L -42,-18 Q -42,-26 -34,-26 Z" fill="#ffffff" {...kst(4)} /><text y={8} textAnchor="middle" fontSize={30} fontWeight={900} fill={KINK}>?</text></g>}
      {i === 2 && <path d="M 0,26 C -50,-6 -30,-46 0,-20 C 30,-46 50,-6 0,26 Z" fill="#ff595e" {...kst(4)} />}
    </g>
    <text x={40} y={22} textAnchor="middle" fontSize={64} fontWeight={900} fill="#ffffff" stroke={KINK} strokeWidth={5} paintOrder="stroke">{['LOOK', 'ASK', 'HELP'][i]}</text>
  </g>
);
// the practise game picture cards
const GameCard: React.FC<{ i: number; t: number }> = ({ i, t }) => (
  <g>
    <rect x={-210} y={-160} width={420} height={320} rx={40} fill="#ffffff" {...kst(7)} />
    {i === 0 && ['#ff595e', '#ffca3a', '#4cc9f0', '#8ac926'].map((c, k) => (
      <g key={c} transform={`translate(${-110 + k * 72},${40}) rotate(${[-30, 15, -10, 40][k]})`}>
        <rect x={-14} y={-70} width={28} height={110} rx={6} fill={c} {...kst(4)} /><path d="M -14,-70 L 0,-100 L 14,-70 Z" fill={c} {...kst(4)} />
      </g>
    ))}
    {i === 1 && <g><circle cx={0} cy={0} r={100} fill="#ffd6a5" {...kst(6)} /><circle cx={-34} cy={-20} r={10} fill={KINK} /><circle cx={34} cy={-20} r={10} fill={KINK} />
      <path d="M -40,50 Q 0,20 40,50" fill="none" {...kst(6)} /><ellipse cx={-40} cy={10} rx={8} ry={14} fill="#4cc9f0" /></g>}
    {i === 2 && ['#ff595e', '#ffca3a', '#8ac926'].map((c, k) => (
      <rect key={c} x={-150 + k * 100 + Math.sin(t * 3 + k) * 4} y={60 - (k === 1 ? 60 : 0)} width={80} height={80} rx={10} fill={c}
        transform={`rotate(${[-20, 30, 10][k]} ${-110 + k * 100} 100)`} {...kst(5)} />
    ))}
    {i === 3 && <g><circle cx={0} cy={-40} r={50} fill="#ffd6a5" {...kst(5)} /><circle cx={-16} cy={-46} r={7} fill={KINK} /><circle cx={16} cy={-46} r={7} fill={KINK} />
      <path d="M -16,-20 Q 0,-28 16,-20" fill="none" {...kst(4)} /><rect x={-50} y={14} width={100} height={110} rx={30} fill="#8ac926" {...kst(5)} />
      <text x={150} y={-60} textAnchor="middle" fontSize={50} fontWeight={900} fill="#adb5bd">?</text></g>}
  </g>
);

export default function KidsStories071() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const shake = shakeOf(t, HITS);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const chantHop = within(t, S('c1'), E('c_turn') + 0.4);
  const level = castleLevel(t);
  const sadAll = within(t, S('friends_sad'), GUST);
  const gameIdx = within(t, S('g1'), S('g2')) ? 0 : within(t, S('g2'), S('g3')) ? 1 : within(t, S('g3'), S('g4')) ? 2 : within(t, S('g4'), S('try') - 0.3) ? 3 : -1;
  const gameDo = (i: number) => gameIdx === i && t >= word(['g1', 'g2', 'g3', 'g4'][i] as Key, 6);
  const stepsOn = within(t, S('step1') - 0.2, S('game'));

  // ── Lily
  const [lx] = lerp2(t, LILY_PATH);
  const lDir = heading(t, LILY_PATH);
  const sitting = t < S('mila_run') + 0.2;
  const building = (within(t, BUILD0, S('mila_in')) || within(t, S('mila_help') + 1, S('leo_in')) || within(t, S('leo_help') + 1, S('bobo_in')) ||
    within(t, S('bobo_help') + 1, S('friends_sad'))) && !talks('lily');
  const lilyExpr: KExpr =
    within(t, GUST, S('mila_run')) ? (t < FALL + 0.2 ? 'surprised' : 'sad')
    : within(t, S('lily_why'), S('mila_why')) ? 'think'
    : within(t, S('lily_sorry'), S('hoot_in')) ? 'sad'
    : within(t, S('lily_no1'), E('lily_no1')) || within(t, S('lily_no2'), E('lily_no2')) || within(t, S('lily_no3'), E('lily_no3')) ? 'proud'
    : within(t, S('q_kind'), GUST) ? 'smile'
    : within(t, S('lily_idea'), E('lily_idea')) ? 'wow'
    : within(t, S('lily_feel'), E('lily_feel') + 0.6) || chantHop || within(t, KITE_FREE, E('kite_free')) ? 'laugh'
    : talks('lily') ? 'happy' : 'smile';
  const lilyPull = within(t, PULL, KITE_FREE + 0.6);
  const carrying = within(t, CARRY0, CARRY0 + 3.6);
  const lilyArmR: KArm =
    building ? { a: 40 + Math.abs(Math.sin(t * 8)) * 40, b: 60 } : carrying ? 'hold' : lilyPull ? { to: [-40, -150] }
    : within(t, COUNT, E('count')) ? 'count' : gameDo(1) ? 'hug' : gameDo(3) ? 'wave' : gameDo(2) ? 'clap' : gameDo(0) ? { a: 20, b: 20 }
    : within(t, S('step1_turn'), E('step1_turn') + 1) ? 'think' : within(t, S('step3_turn'), E('step3_turn') + 1) ? 'up'
    : t >= S('bye') ? 'wave' : chantHop ? 'up' : talks('lily') ? 'present' : 'down';
  const lilyArmL: KArm = building ? { a: 30 + Math.abs(Math.sin(t * 8 + 1.5)) * 40, b: 60 } : carrying ? 'hold' : lilyPull ? { to: [-30, -130] }
    : gameDo(1) ? 'hug' : gameDo(2) ? 'clap' : chantHop ? 'up' : t >= S('bye') ? 'wave' : 'down';
  const lilyLook: [number, number] = building ? [0.8, 0.6] : lDir ? [lDir * 0.8, 0] : within(t, S('lily_no1'), E('lily_no3')) ? [0.6, 0.4] : [0.3, 0];

  // ── Mila
  const [mx] = lerp2(t, MILA_PATH);
  const milaExpr: KExpr =
    sadAll || within(t, S('lily_no1'), S('leo_in')) ? 'sad'
    : within(t, SPILL, SPILL + 1.2) ? 'surprised'
    : within(t, S('mila_thanks'), E('mila_thanks') + 0.5) || chantHop || within(t, TOGETHER, S('lesson')) ? 'laugh'
    : talks('mila') ? 'happy' : 'smile';
  const milaArm: KArm = within(t, COUNT, E('count')) ? 'count' : gameDo(1) ? 'hug' : gameDo(3) ? 'wave' : gameDo(2) ? 'clap'
    : t >= S('bye') ? 'wave' : chantHop ? 'up' : talks('mila') ? 'wave' : within(t, S('step1_turn'), E('step3_turn') + 1) ? 'clap' : 'down';
  const holdsBasket = t < SPILL || t >= E('count') + 0.2;

  // ── Leo
  const [ex] = lerp2(t, LEO_PATH);
  const eDir = heading(t, LEO_PATH);
  const leoJump = within(t, S('jump'), E('jump') + 0.3);
  const leoExpr: KExpr =
    sadAll || within(t, S('lily_no2'), S('bobo_in')) ? 'sad'
    : within(t, KITE_STUCK, KITE_STUCK + 1.4) ? 'surprised'
    : within(t, S('leo_jump'), E('leo_jump')) ? 'proud'
    : leoJump ? 'oops'
    : within(t, KITE_FREE, E('leo_thanks') + 0.5) || chantHop || within(t, TOGETHER, S('lesson')) ? 'laugh'
    : talks('leo') ? 'happy' : 'smile';
  const leoArm: KArm = lilyPull ? { to: [-30, -140] } : leoJump ? 'up' : gameDo(1) ? 'hug' : gameDo(3) ? 'wave' : gameDo(2) ? 'clap'
    : within(t, S('leo_in'), KITE_STUCK) ? { to: [-60, -140] } : t >= S('bye') ? 'wave' : chantHop ? 'up' : talks('leo') ? 'present' : 'down';
  const leoHop = bounce(chantHop, t, 3, 22) + (leoJump ? Math.abs(Math.sin((t - S('jump')) * 6)) * 110 : 0);

  // ── Bobo
  const [ox] = lerp2(t, BOBO_PATH);
  const oDir = heading(t, BOBO_PATH);
  const boboHasBox = within(t, S('bobo_in') - 0.2, S('bobo_run') + 0.2) || within(t, S('hoot_in') + 1.0, TOGETHER - 0.2);
  const boboHugsTower = within(t, S('g3a'), E('g3a') + 0.5);
  const boboExpr: KExpr =
    sadAll || within(t, S('lily_no3'), S('friends_sad')) ? 'sad'
    : within(t, S('bobo_help'), E('bobo_help')) ? 'oops'
    : boboHugsTower ? 'laugh'
    : within(t, S('bobo_thanks'), E('bobo_thanks') + 0.5) || chantHop || within(t, TOGETHER, S('lesson')) ? 'laugh'
    : talks('bobo') ? 'happy' : 'smile';
  const boboArms: CArm = boboHasBox ? 'hold' : boboHugsTower ? 'hug' : gameDo(1) ? 'hug' : gameDo(3) ? 'wave' : gameDo(2) ? 'clap'
    : t >= S('bye') ? 'wave' : chantHop ? 'up' : talks('bobo') ? 'wave' : 'down';

  // ── Hoot
  const [hx, hy] = lerp2(t, HOOT_PATH);
  const hootOn = within(t, HOOT_IN, HOOT_OUT + 1.9) || within(t, S('a3') - 1.2, E('a3') + 1.2);
  const [hx2, hy2] = within(t, S('a3') - 1.2, E('a3') + 1.2) ? lerp2(t, [[S('a3') - 1.2, W + 300, 100], [S('a3') - 0.1, 1600, f], [E('a3') + 0.2, 1600, f], [E('a3') + 1.2, W + 300, 100]]) : [hx, hy];
  const hootFlying = hy2 < f - 2;

  // kite: in Leo's hand → up into the tree (stuck) → free, floating in the sky
  const kiteUpP = prog(t, KITE_UP, KITE_STUCK);
  const freeP = prog(t, KITE_FREE, KITE_FREE + 2.0);
  const handLeo: [number, number] = [ex + 60, f - 420];
  const kitePos: [number, number] =
    t < KITE_UP ? [ex + 40, f - 520]
    : t < KITE_FREE ? [handLeo[0] + (KITE_TREE[0] - handLeo[0]) * EASE_OUT(kiteUpP), handLeo[1] - 100 + (KITE_TREE[1] - handLeo[1] + 100) * EASE_OUT(kiteUpP)]
    : [KITE_TREE[0] + 380 * EASE_INOUT(freeP) + Math.sin(t * 1.5) * 30, KITE_TREE[1] - 120 * EASE_INOUT(freeP) + Math.sin(t * 2) * 20];
  const kiteShown = t >= S('leo_in') - 0.2;
  const kiteWiggle = within(t, KITE_STUCK, KITE_FREE) ? Math.sin(t * 14) * 6 * (lilyPull ? 2 : 0.5) : Math.sin(t * 2) * 10;

  // bucket + spade: by Lily's castle → blown away → brought back
  const blowP = prog(t, GUST + 0.4, GUST + 1.6);
  const backP = prog(t, FIX0 - 0.4, FIX0 + 0.8);
  const bucketX = t < GUST ? SAND_X + 260 : t < S('leo_run') + 1.6 ? SAND_X + 260 + (BUCKET_TO - SAND_X - 260) * EASE_OUT(blowP) : ex + 60 + (SAND_X + 260 - ex - 60) * backP;
  const spadeX = t < GUST ? SAND_X - 300 : t < S('bobo_run') + 1.6 ? SAND_X - 300 + (SPADE_TO - SAND_X + 300) * EASE_OUT(blowP) : ox - 40 + (SAND_X - 300 - ox + 40) * backP;

  // apples: on the grass after the spill → hop into the basket on the count
  const appleAt = (i: number) => word('count', 5 + i);

  return (
    <>
      <ActionStage cam={cam} shake={shake} blur={cam.blur}>
        <Backdrop place="meadow" w={W} h={H} t={t} fx={['butterflies', 'birds']} />
        <Tree t={t} />
        <Sandbox />
        <Castle level={level} t={t} at={0} />
        {/* bucket + spade */}
        {(t < GUST || t >= GUST) && (
          <>
            <g transform={`translate(${bucketX},${f + 20 - arc(t, GUST + 0.4, GUST + 1.6, 120)})`}><Bucket rot={within(t, GUST, FIX0) ? 90 * blowP : 0} /></g>
            <g transform={`translate(${spadeX},${f + 20 - arc(t, GUST + 0.4, GUST + 1.6, 160)})`}><Spade rot={within(t, GUST, FIX0) ? -200 * blowP : -20} /></g>
          </>
        )}
        {/* the spilled apples */}
        {t >= SPILL && APPLES.map(([x, y], i) => {
          const at = appleAt(i);
          if (t >= at + 0.5 && t >= COUNT) return null;
          const p = prog(t, SPILL, SPILL + 0.8 + i * 0.1);
          const ax = MILA_X - 60 + (x - MILA_X + 60) * EASE_OUT(p);
          const toP = t >= COUNT ? prog(t, at, at + 0.5) : 0;
          const bx = mx - 80;
          const fx = ax + (bx - ax) * toP;
          const fy = y - 30 - arc(t, SPILL, SPILL + 0.6, 80) + (f - 300 - y) * toP - arc(t, at, at + 0.5, 120);
          return <g key={i} transform={`translate(${fx},${fy}) scale(0.7) rotate(${p * 360 + i * 40})`}><Apple /></g>;
        })}
        {/* the game cards */}
        {gameIdx >= 0 && <g transform={`translate(960,330) scale(${popIn(t, [S('g1'), S('g2'), S('g3'), S('g4')][gameIdx])})`}><GameCard i={gameIdx} t={t} /></g>}
        {/* Hoot */}
        {hootOn && (
          <Critter spec={HOOT_HERO} x={hx2} y={hy2} scale={HS} expr={talks('hoot') ? 'happy' : 'smile'} look={[-0.6, 0]} mouth={lipSync(VO, 'hoot', t)}
            armL={hootFlying ? { a: 60 + Math.sin(t * 14) * 40 } : talks('hoot') ? 'point' : 'down'} armR={hootFlying ? { a: 60 + Math.sin(t * 14) * 40 } : 'down'}
            facing={-1} hop={hootFlying ? 0 : bounce(false, t)} />
        )}
        {/* Bobo */}
        <Critter spec={BOBO_HERO} x={ox} y={f} scale={BS} expr={boboExpr} look={oDir ? [oDir * 0.8, 0] : [-0.6, 0]} mouth={lipSync(VO, 'bobo', t)}
          armL={boboArms} armR={boboArms} walking={moving(t, BOBO_PATH)} walk={t * (boboHasBox ? 1.4 : 2.2)} facing={oDir > 0 ? 1 : -1}
          holdR={boboHasBox && !carrying ? <ToyBox /> : undefined}
          hop={bounce(chantHop, t, 2, 22)} squash={boboHasBox && !carrying ? 0.06 : 0} />
        {boboHugsTower && (
          <g transform={`translate(${ox - 10},${f - 200})`}>
            {['#ff595e', '#ffca3a', '#8ac926'].map((c, k) => <rect key={c} x={-40} y={-k * 70} width={80} height={70} rx={10} fill={c} {...kst(5)} />)}
          </g>
        )}
        {/* the box carried by two */}
        {carrying && (
          <g transform={`translate(${(lx + ox) / 2},${f - 300 + Math.sin(t * 8) * 6}) scale(1.3)`}><ToyBox /></g>
        )}
        {/* Mila */}
        {mx < W + 200 && (
          <Kid spec={MILA_HERO} x={mx} y={f} scale={KS} expr={milaExpr} look={moving(t, MILA_PATH) ? [-0.8, 0] : [-0.6, 0]} mouth={lipSync(VO, 'mila', t)}
            armL={milaArm} armR={holdsBasket ? 'hold' : milaArm} legs={moving(t, MILA_PATH) ? 'walk' : 'stand'} walk={t * 2}
            holdR={holdsBasket ? <Basket /> : undefined} hop={bounce(chantHop, t, 1, 22)} />
        )}
        {/* the basket on the grass while counting */}
        {!holdsBasket && t >= SPILL + 0.4 && <g transform={`translate(${mx - 80},${f - 10})`}><Basket /></g>}
        {/* Leo */}
        {ex > -250 && (
          <Kid spec={LEO_HERO} x={ex} y={f} scale={KS} expr={leoExpr} look={within(t, KITE_STUCK, KITE_FREE + 2) ? [-0.4, -1] : eDir ? [eDir * 0.8, 0] : [0.6, 0]}
            mouth={lipSync(VO, 'leo', t)} armL={leoArm === 'present' ? 'down' : leoArm} armR={leoArm} legs={moving(t, LEO_PATH) ? 'walk' : 'stand'} walk={t * 2.6}
            hop={leoHop} />
        )}
        {/* Lily */}
        <Kid spec={LILY} x={lx} y={f} scale={KS} expr={lilyExpr} look={lilyLook} mouth={lipSync(VO, 'lily', t)}
          armL={lilyArmL} armR={lilyArmR} legs={sitting ? 'sit' : moving(t, LILY_PATH) ? 'walk' : 'stand'} walk={t * 2}
          hop={bounce(chantHop || within(t, S('lily_feel'), E('lily_feel')), t, 0, 22)} />
        {/* the kite + its string */}
        {kiteShown && (
          <g>
            {t < KITE_FREE + 2.2 && (
              <path d={`M ${t < KITE_STUCK ? ex + 50 : lilyPull ? (ex + lx) / 2 : ex + 50},${f - 380} Q ${(kitePos[0] + ex) / 2},${(kitePos[1] + f) / 2} ${kitePos[0]},${kitePos[1] + 80}`}
                fill="none" stroke="#ffffff" strokeWidth={4} opacity={0.9} />
            )}
            <g transform={`translate(${kitePos[0]},${kitePos[1]})`}><Kite rot={kiteWiggle} /></g>
          </g>
        )}
        {/* FX */}
        <ImpactStar t={t} at={SPILL} x={MILA_X - 120} y={f - 260} s={0.8} />
        <ImpactStar t={t} at={KITE_STUCK} x={KITE_TREE[0] + 80} y={KITE_TREE[1] - 60} s={0.8} />
        <Dust t={t} at={FALL} x={SAND_X} y={f - 60} s={1.6} />
        <MotionLines t={t} from={GUST - 0.2} to={GUST + 2.0} x={900} y={500} dir={0} n={6} len={260} spread={420} />
        <MotionLines t={t} from={KITE_FREE} to={KITE_FREE + 1.6} x={600} y={260} dir={0} n={4} len={160} spread={160} />
        <StrainLines t={t} from={S('bobo_in')} to={E('bobo_help')} x={ox} y={f - 300} />
        <StrainLines t={t} from={CARRY0} to={CARRY0 + 3.4} x={(lx + ox) / 2} y={f - 360} />
        <StageWord t={t} at={word('lily_busy', 0)} until={E('lily_busy') + 0.3} text="PAT, PAT! SCOOP!" x={SAND_X} y={f - 470} size={80} color="#f4a261" rot={-5} />
        <StageWord t={t} at={SPILL} until={SPILL + 1.3} text="BUMP!" x={MILA_X - 160} y={f - 560} size={100} color="#ff595e" rot={6} />
        <StageWord t={t} at={word('leo_in', 7)} until={KITE_STUCK} text="WHOOSH!" x={520} y={260} size={90} color="#4cc9f0" rot={-6} />
        <StageWord t={t} at={word('bobo_help', 0)} until={E('bobo_help')} text="HUFF, PUFF!" x={BOBO_X - 120} y={f - 560} size={80} color="#ff924c" rot={-5} />
        <StageWord t={t} at={GUST} until={FALL + 0.6} text="WHOOOSH!" x={760} y={330} size={110} color="#a0c4ff" rot={-6} />
        <StageWord t={t} at={FALL} until={FALL + 1.4} text="CRASH!" x={SAND_X} y={f - 420} size={110} color="#f4a261" rot={6} />
        <StageWord t={t} at={word('fix', 2)} until={E('fix') + 0.3} text="PAT, PAT, SCOOP!" x={SAND_X} y={f - 560} size={80} color="#f4a261" rot={-5} />
        <StageWord t={t} at={S('jump')} until={E('jump') + 0.4} text="BOING! BOING!" x={LEO_X + 40} y={f - 640} size={90} color="#4cc9f0" rot={6} />
        <StageWord t={t} at={PULL} until={KITE_FREE} text="GENTLY, GENTLY…" x={640} y={f - 640} size={80} color="#52b788" rot={-5} />
        <StageWord t={t} at={CARRY0 + 0.4} until={CARRY0 + 3.6} text="HEAVE, HO!" x={1500} y={f - 600} size={90} color="#ff924c" rot={5} />
        <StageWord t={t} at={S('g3a')} until={E('g3a') + 0.5} text="HUG!" x={BOBO_X - 140} y={f - 560} size={90} color="#ff6fa5" rot={-6} />
        <Reaction kind="cloud" t={t} at={S('lily_no1')} until={S('leo_in')} x={mx} y={f - 640} s={0.6} />
        <Reaction kind="cloud" t={t} at={S('lily_no2')} until={S('bobo_in')} x={ex} y={f - 640} s={0.6} />
        <Reaction kind="sweat" t={t} at={S('bobo_in') + 0.6} until={S('lily_no3')} x={ox + 50} y={f - 480} s={0.6} />
        <Reaction kind="cloud" t={t} at={S('lily_no3')} until={GUST} x={ox} y={f - 480} s={0.6} />
        <Reaction kind="!" t={t} at={FALL} until={FALL + 1.4} x={lx} y={f - 640} s={0.7} />
        <Reaction kind="?" t={t} at={S('lily_why')} until={S('mila_why')} x={lx} y={f - 640} s={0.7} />
        <Reaction kind="heart" t={t} at={S('mila_why')} until={E('mila_why') + 0.6} x={mx} y={f - 640} s={0.7} />
        <Reaction kind="idea" t={t} at={S('lily_idea')} until={E('lily_idea')} x={lx} y={f - 640} s={0.7} />
        <Reaction kind="heart" t={t} at={S('mila_thanks')} until={E('mila_thanks') + 0.6} x={mx} y={f - 640} s={0.6} />
        <Reaction kind="heart" t={t} at={S('leo_thanks')} until={E('leo_thanks') + 0.6} x={ex} y={f - 640} s={0.6} />
        <Reaction kind="heart" t={t} at={S('bobo_thanks')} until={E('bobo_thanks') + 0.6} x={ox} y={f - 480} s={0.6} />
        <Reaction kind="heart" t={t} at={S('lily_feel')} until={E('lily_feel') + 0.8} x={lx} y={f - 640} s={0.8} />
      </ActionStage>

      {/* screen-space */}
      {stepsOn && STEP_X.map((x, i) => {
        const at = S((['step1', 'step2', 'step3'] as const)[i]);
        if (t < at) return null;
        const cur = within(t, at, i < 2 ? S((['step2', 'step3'] as const)[i]) : S('lily_repeat'));
        return <g key={i} transform={`translate(${x},${330}) scale(${popIn(t, at) * (cur ? 1.08 : 1)})`}><StepCard i={i} on /></g>;
      })}
      <PopText t={t} at={S('lily_hi') + 0.3} until={S('mila_in') - 0.1} text="MEET LILY!" y={170} size={130} color="#c77dff" />
      <PopText t={t} at={word('mila_help', 2)} until={S('lily_no1') - 0.1} text="CAN YOU HELP?" y={170} size={110} color="#ffca3a" />
      <PopText t={t} at={word('lily_no1', 1)} until={S('leo_in') - 0.1} text="“I'M BUSY.”" y={170} size={110} color="#c77dff" />
      <PopText t={t} at={word('lily_no2', 0)} until={S('bobo_in') - 0.1} text="“NOT NOW.”" y={170} size={110} color="#c77dff" />
      <PopText t={t} at={word('lily_no3', 0)} until={S('friends_sad') - 0.1} text="“I'M BUSY!”" y={170} size={110} color="#c77dff" />
      <ThinkTimer t={t} from={onBeat(E('q_kind') + 0.1)} to={S('answer_kind') - 0.1} x={1760} y={190} r={90} label="THINK!" />
      <AnswerMark t={t} at={S('answer_kind') + 0.1} until={E('answer_kind') + 0.8} ok={false} x={1760} y={190} />
      <PopText t={t} at={word('mila_why', 1)} until={E('mila_why') + 0.6} text="FRIENDS HELP FRIENDS!" y={170} size={100} color="#ff6fa5" />
      <PopText t={t} at={S('lily_repeat')} until={S('game') - 0.1} text="LOOK · ASK · HELP!" y={170} size={110} color="#ffffff" />
      <PopText t={t} at={S('game') + 0.2} until={S('g1') - 0.1} text="LET'S PRACTISE!" y={170} size={110} color="#ffca3a" />
      {(['g1', 'g2', 'g3', 'g4'] as const).map((g, i) => (
        <PopText key={g} t={t} at={word(g, 6)} until={S((['g1a', 'g2a', 'g3a', 'g4a'] as const)[i]) - 0.05}
          text={['PICK, PICK, PICK!', 'A BIG HUG!', 'STACK, STACK!', 'COME AND PLAY!'][i]} y={170} size={110} color={['#ff595e', '#ff6fa5', '#8ac926', '#4cc9f0'][i]} />
      ))}
      <PopText t={t} at={word('ask1', 1)} until={S('mila_yes') - 0.05} text="CAN I HELP YOU?" y={170} size={110} color="#ffca3a" />
      {APPLES.map((_, i) => (
        <PopText key={i} t={t} at={appleAt(i)} until={i < 4 ? appleAt(i + 1) - 0.02 : E('count') + 1.0} text={`${i + 1}`} y={170} size={150} color="#ff595e" />
      ))}
      <ThinkTimer t={t} from={onBeat(E('kite_q') + 0.1)} to={S('leo_jump') - 0.1} x={1760} y={190} r={90} label="THINK!" />
      <AnswerMark t={t} at={E('jump') - 0.4} until={S('lily_idea') + 0.2} ok={false} x={1760} y={190} />
      <PopText t={t} at={word('lily_idea', 6)} until={E('lily_idea') + 0.6} text="PULL TOGETHER, GENTLY!" y={170} size={96} color="#52b788" />
      <PopText t={t} at={KITE_FREE + 0.5} until={S('leo_thanks') - 0.1} text="HOORAY!" y={170} size={130} color="#ffca3a" />
      <PopText t={t} at={word('together', 9)} until={S('lily_feel') - 0.1} text="THE BIGGEST CASTLE!" y={170} size={110} color="#f4a261" />
      <PopText t={t} at={S('lesson')} until={S('your_q') - 0.1} text="HELPING MAKES EVERYONE HAPPY" y={170} size={84} color="#ff6fa5" />
      <PopText t={t} at={S('your_q') + 0.2} until={S('again') - 0.1} text="WHO WILL YOU HELP?" y={170} size={110} color="#ffca3a" />
      <PopText t={t} at={S('again') + 0.2} until={S('q1') - 0.1} text="LET'S REMEMBER!" y={170} size={110} color="#ffca3a" />
      {(['q1', 'q2', 'q3', 'q4'] as const).map((q) => {
        const a = ({ q1: 'a1', q2: 'a2', q3: 'a3', q4: 'a4' } as const)[q];
        return <ThinkTimer key={q} t={t} from={onBeat(E(q) + 0.1)} to={S(a) - 0.1} x={1760} y={190} r={90} label="THINK!" />;
      })}
      <PopText t={t} at={S('a1')} until={S('q2') - 0.2} text="A SANDCASTLE!" y={170} size={120} color="#f4a261" />
      <PopText t={t} at={S('a2')} until={S('q3') - 0.2} text="FRIENDS HELPED!" y={170} size={120} color="#ff6fa5" />
      <PopText t={t} at={S('a3')} until={S('q4') - 0.2} text="LOOK · ASK · HELP!" y={170} size={110} color="#ffca3a" />
      <PopText t={t} at={S('a4')} until={S('chant') - 0.2} text="NO! PULL GENTLY!" y={170} size={110} color="#52b788" />
      <PopText t={t} at={S('c1')} until={S('c2') - 0.1} text="LOOK!" y={170} size={140} color="#4cc9f0" />
      <PopText t={t} at={S('c2')} until={S('c3') - 0.1} text="ASK!" y={170} size={140} color="#ffca3a" />
      <PopText t={t} at={S('c3')} until={S('c_turn') - 0.1} text="HELP!" y={170} size={140} color="#ff6fa5" />
      <PopText t={t} at={E('c_turn') - 0.2} until={S('bye') - 0.1} text="YOUR TURN!" y={170} size={120} color="#ffffff" />
      <PopText t={t} at={S('bye')} until={END_IRIS} text="SEE YOU NEXT TIME!" y={170} size={100} color="#c77dff" />
      <Confetti t={t} at={KITE_FREE} y={420} />
      <Confetti t={t} at={TOGETHER + 4.0} y={420} />
      <Confetti t={t} at={S('c3')} y={420} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <SparksIntro t={t} at={0} cast={{ kids: [MILA_HERO, LEO_HERO], buddy: BOBO_HERO }} />
      <StarWipe t={t} at={END_IRIS} dur={0.5} hold={5} color="#c77dff" x={W / 2} y={H * 0.45} />
    </>
  );
}
