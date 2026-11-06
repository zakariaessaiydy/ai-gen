// TINY SPARKS · Day 76 · 🧩 Puzzles #11 — "Find 5 Differences" (LONG 16:9)
// kids-shorts/tiny-sparks/puzzles/day-076-find-5-differences. Cues from VO via K (keys.gen.ts).
// COLD OPEN (no ident): two picnic pictures side by side at frame 0 — "Look! … this sun has sunglasses!" = difference 1 in
// the first 3 s → "five things are different" → THINK → Leo ✗ the clouds → 4 more → 5 stars. Then the toy room (Leo ✗
// "the teddy has no eyes!"), under the sea, the snowmen, and the SUPER puzzle: two Bobos ("which one is the real me?") →
// 25 differences → remember (7) → the trick: look here, then look THERE → bye + star iris.
// Every difference is BIG (an object or a colour), circled on BOTH pictures, and the camera pushes in on the pair.
import React from 'react';
import { Kid, kidFaceAt, type KArm } from '../../lib/kids/kid';
import { Critter, critterFaceAt, type CArm, type CritterSpec } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, HOOT_HERO, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { Backdrop, PlaceLight, standY } from '../../lib/kids/places';
import { AnswerMark, Apple, Confetti, FONT_TOON, KidsCaptions, PopText, ThinkTimer, useT } from '../../lib/kids/kit';
import { speechAt } from '../../lib/kids/acting';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, Reaction, StarWipe, directorCam, hopAt, onBeat, type Shot } from '../../lib/kids/energy';
import { exprAt, lookAt, poseAt, type Keys } from '../../lib/kids/smooth';
import { voKeys, type Span } from '../../lib/kids/cues';
import { EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsPuzzles076', durationInSeconds: 316.6, fps: 30, width: 1920, height: 1080 };

const W = 1920;
const H = 1080;
type Key = keyof typeof K;
const S = (k: Key) => VO[K[k]].start;
const E = (k: Key) => VO[K[k]].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;
const word = (k: Key, i: number) => {
  const w = timeWords(VO[K[k]]);
  return (w[Math.min(i, w.length - 1)] ?? { start: S(k) }).start;
};
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff' };
const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (EASE_OUT(p) - 1) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};
const beat = (x: number) => onBeat(x, 0);

// ── place + blocking: a big two-picture board in the middle of the playroom, the cast at the sides
const PLACE = 'playroom' as const;
const KS = 0.5;
const CS = 0.52;
const X = { leo: 140, mila: 320, bobo: 1600, hoot: 1780 };
const yAt = (x: number, s: number) => standY(PLACE, x, W, H, { halfW: 150 * s });
const PY = 392; // picture centre y
const PX = [640, 1280]; // left (the original) · right (the changed one)
const PW = 580;
const PH = 420;

// ── the scenes and their five differences ([x, y, r] in picture coords, centre origin)
type Scene = 1 | 2 | 3 | 4 | 5;
type Diff = { k: Key; at: number; x: number; y: number; r: number };
const d = (k: Key, x: number, y: number, r: number, at?: number): Diff => ({ k, at: at ?? S(k) + 0.2, x, y, r });
const BOBO_Y = 176;
const BS = 0.5;
const DIFFS: Record<Scene, Diff[]> = {
  1: [d('open', -200, -130, 62, word('open', 8)), d('p1_d2', -40, -110, 52), d('p1_d3', 30, 132, 92), d('p1_d4', 180, -50, 88), d('p1_d5', -150, 110, 58)],
  2: [d('p2_d1', -160, 34, 48), d('p2_d2', 150, -110, 86), d('p2_d3', 40, 150, 52), d('p2_d4', 200, 90, 72), d('p2_d5', -232, -40, 70)],
  3: [d('p3_d1', -110, -30, 80), d('p3_d2', 180, 150, 52), d('p3_d3', -210, -130, 62), d('p3_d4', -50, 150, 60), d('p3_d5', 130, -110, 72)],
  4: [d('p4_d1', 0, -158, 58), d('p4_d2', 14, -96, 40), d('p4_d3', 0, 6, 46), d('p4_d4', -34, -48, 42), d('p4_d5', -200, -40, 54)],
  5: [d('p5_d1', 0, BOBO_Y - 128, 44), d('p5_d2', 0, BOBO_Y - 316, 56), d('p5_d3', 0, BOBO_Y - 54, 46), d('p5_d4', 0, BOBO_Y - 4, 58), d('p5_d5', -150, -110, 72)],
};
// what's on the board, in time order: [from, scene, mode] — 'play' = the puzzle, 'rq' = a remember question (one circle)
type Mode = { s: Scene; ring?: Diff; all?: boolean; trick?: boolean };
const BOARD: [number, Mode][] = [
  [0, { s: 1 }], [S('p2') - 0.3, { s: 2 }], [S('p3') - 0.3, { s: 3 }], [S('p4') - 0.3, { s: 4 }], [S('p5') - 0.3, { s: 5 }],
  [S('rq1') - 0.2, { s: 1, ring: { ...DIFFS[1][0], at: S('ra1') } }], [S('rq2') - 0.2, { s: 4, ring: { ...DIFFS[4][2], at: S('ra2') } }],
  [S('rq3') - 0.2, { s: 3, ring: { ...DIFFS[3][3], at: S('ra3') } }], [S('rq4') - 0.2, { s: 1, ring: { ...DIFFS[1][4], at: S('ra4') } }],
  [S('rq5') - 0.2, { s: 5, ring: { ...DIFFS[5][0], at: S('ra5') } }], [S('rq6') - 0.2, { s: 2, ring: { ...DIFFS[2][1], at: S('ra6') } }],
  [S('rq7') - 0.2, { s: 3, ring: { ...DIFFS[3][4], at: S('ra7') } }], [S('trick') - 0.2, { s: 4, trick: true }], [S('bye') - 0.2, { s: 5, all: true }],
];
const boardAt = (t: number): [Mode, number] => {
  let p = BOARD[0];
  for (const x of BOARD) if (t >= x[0]) p = x;
  return [p[1], p[0]];
};
const PLAY_END = S('rem') - 0.2;
const foundIn = (s: Scene, t: number) => DIFFS[s].filter((x) => t >= x.at).length;
const ALL_DIFFS = ([1, 2, 3, 4, 5] as Scene[]).flatMap((s) => DIFFS[s]);
const END_IRIS = E('bye2') + 0.6;

// ── arms, faces
const BYE: Span<KArm> = [S('bye'), 999, 'wave'];
const MILA_R = voKeys<KArm>(VO, 'mila', 'point', 'down', [
  [S('p1_no'), E('p1_no'), 'present'], [S('p4_d3'), E('p4_d3'), 'count'], [S('rem'), E('rem'), 'present'], [S('ra5'), E('ra5'), 'cheer'],
  [S('trick_turn'), E('trick_turn') + 0.4, 'point'], [S('p5_done'), S('p5_done') + 2.4, 'cheer'], BYE,
]);
const MILA_L = voKeys<KArm>(VO, null, 'down', 'down', [[S('p2_no'), E('p2_no'), 'cover'], [S('p5_bobo2'), E('p5_bobo2'), 'cover'], [S('p5_done'), S('p5_done') + 2.4, 'cheer'], BYE]);
const MILA_E = voKeys<KExpr>(VO, 'mila', 'happy', 'smile', [
  [0, word('open', 8), 'wow'], [S('p2_no'), E('p2_no'), 'laugh'], [S('p5_bobo2'), E('p5_bobo2'), 'laugh'], [S('p5_done'), S('p5_done') + 2.4, 'laugh'], [S('bye'), 999, 'laugh'],
]);
const LEO_R = voKeys<KArm>(VO, 'leo', 'point', 'down', [
  [E('p1_leo'), E('p1_no'), 'shrug'], [E('p2_leo'), E('p2_no'), 'cheeks'], [S('ra1'), E('ra1'), 'cheer'], [S('ra6'), E('ra6'), 'present'],
  [S('p5_done'), S('p5_done') + 2.4, 'cheer'], BYE,
]);
const LEO_L = voKeys<KArm>(VO, null, 'down', 'down', [[E('p1_leo'), E('p1_no'), 'shrug'], [E('p2_leo'), E('p2_no'), 'cheeks'], [S('p5_done'), S('p5_done') + 2.4, 'cheer'], BYE]);
const LEO_E = voKeys<KExpr>(VO, 'leo', 'happy', 'smile', [
  [S('p1_leo'), E('p1_leo'), 'proud'], [E('p1_leo'), E('p1_no') + 0.3, 'oops'], [S('p2_leo'), E('p2_leo'), 'surprised'], [E('p2_leo'), E('p2_no') + 0.3, 'oops'],
  [S('p5_done'), S('p5_done') + 2.4, 'laugh'], [S('bye'), 999, 'laugh'],
]);
const BOBO_A = voKeys<CArm>(VO, 'bobo', 'point', 'down', [
  [S('p1_d5'), E('p1_d5'), 'cheeks'], [S('p2_no'), E('p2_no'), 'clap'], [S('p5_bobo'), E('p5_bobo'), 'think'], [S('p5_bobo2'), E('p5_bobo2'), 'clap'],
  [S('ra4'), E('ra4'), 'cheer'], [S('ra7'), E('ra7'), 'wave'], [S('p5_done'), S('p5_done') + 2.4, 'cheer'], [S('bye'), 999, 'wave'],
]);
const BOBO_E = voKeys<KExpr>(VO, 'bobo', 'happy', 'smile', [
  [S('p1_d5'), E('p1_d5') + 0.3, 'sad'], [S('p2_no'), E('p2_no'), 'laugh'], [S('p5_bobo'), E('p5_bobo'), 'surprised'], [S('p5_bobo2'), E('p5_bobo2'), 'laugh'],
  [S('ra4'), E('ra4'), 'laugh'], [S('p5_done'), S('p5_done') + 2.4, 'laugh'], [S('bye'), 999, 'laugh'],
]);
const HOOT_A = voKeys<CArm>(VO, 'hoot', 'point', 'down', [[S('p5_done'), S('p5_done') + 2.4, 'cheer'], [S('bye'), 999, 'wave']]);
const HOOT_E = voKeys<KExpr>(VO, 'hoot', 'happy', 'smile', [[S('p5_done'), S('p5_done') + 2.4, 'laugh']]);
const looks = (base: [number, number]): Keys<[number, number]> => [
  [0, base], ...(['p1_q', 'p2_q', 'p3_q', 'p4_q', 'p5_q', 'rq1', 'rq2', 'rq3', 'rq4', 'rq5', 'rq6', 'rq7'] as const).flatMap((q): Keys<[number, number]> => [[E(q), [0, 0]], [VO[K[q] + 1].start, base]]),
  [S('trick_turn'), [0, 0]], [E('trick_turn') + 0.5, base], [S('bye'), [0, 0]],
];
const LOOK_L = looks([0.7, -0.4]);
const LOOK_R = looks([-0.7, -0.4]);
const HOPS = [S('p1_done') + 0.1, S('p2_done') + 0.1, S('p3_done') + 0.1, S('p4_done') + 0.1, S('p5_done') + 0.1, S('p5_done') + 0.9];

// ── camera: the board, a push onto every found pair, close-ups for the jokes
const WIDE = { z: 1.0, x: 960, y: 540 };
const PICS = { z: 1.18, x: 960, y: 450 };
const kFace = (x: number) => kidFaceAt(x, yAt(x, KS), KS)[1] + 80;
const cFace = (x: number) => critterFaceAt(x, yAt(x, CS), CS)[1] + 80;
const LEO_CU = { z: 1.6, x: X.leo + 160, y: kFace(X.leo) };
const MILA_CU = { z: 1.6, x: X.mila + 40, y: kFace(X.mila) };
const BOBO_CU = { z: 1.5, x: X.bobo - 80, y: cFace(X.bobo) };
const pairShot = (x: Diff): Shot => ({ t: x.at - 0.25, z: 1.42, x: 960, y: Math.max(380, Math.min(560, PY + x.y)), move: 'smooth', dur: 0.5, push: 0.01 });
const SHOTS: Shot[] = [
  { t: 0, ...PICS, move: 'cut', push: 0.012 },
  pairShot(DIFFS[1][0]),
  { t: S('premise') - 0.1, ...PICS, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('p1_leo') - 0.1, ...LEO_CU, move: 'snap' },
  { t: S('p1_no') - 0.1, ...PICS, move: 'smooth', dur: 0.5 },
  ...ALL_DIFFS.filter((x) => x.k !== 'open').map(pairShot),
  ...(['p1_done', 'p2_done', 'p3_done', 'p4_done'] as const).map((k): Shot => ({ t: S(k) - 0.1, ...WIDE, move: 'smooth', dur: 0.5 })),
  ...(['p2', 'p3', 'p4', 'p5', 'rem'] as const).map((k): Shot => ({ t: S(k) - 0.3, ...PICS, move: 'whip' })),
  { t: S('p2_leo') - 0.1, ...LEO_CU, move: 'snap' },
  { t: S('p2_no') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: S('p5_bobo') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: S('p5_q') - 0.1, ...PICS, move: 'smooth', dur: 0.5, push: 0.01 },
  { t: S('p5_bobo2') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: S('p5_done') - 0.1, ...WIDE, move: 'smooth', dur: 0.5 },
  ...(['ra1', 'ra2', 'ra3', 'ra4', 'ra5', 'ra6', 'ra7'] as const).map((k): Shot => ({ t: S(k) - 0.1, z: 1.24, x: 960, y: 460, move: 'snap' })),
  ...(['rq2', 'rq3', 'rq4', 'rq5', 'rq6', 'rq7'] as const).map((k): Shot => ({ t: S(k) - 0.2, ...PICS, move: 'smooth', dur: 0.5, push: 0.01 })),
  { t: S('rem') - 0.1, ...WIDE, move: 'smooth', dur: 0.5 },
  { t: S('rq1') - 0.2, ...PICS, move: 'smooth', dur: 0.5, push: 0.01 },
  { t: S('trick') - 0.2, ...PICS, move: 'smooth', dur: 0.6, push: 0.012 },
  { t: S('trick_turn') - 0.1, ...MILA_CU, move: 'snap' },
  { t: S('bye') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
];
SHOTS.sort((a, b) => a.t - b.t);
const PUNCHES = [word('open', 8), S('p5'), S('p5_done')];

// ── the pictures (centre origin, ±290 × ±210); v = 0 the original, 1 the changed copy
const Sun: React.FC<{ glasses: boolean; t: number }> = ({ glasses, t }) => (
  <g>
    {Array.from({ length: 10 }).map((_, k) => <rect key={k} x={-5} y={-66} width={10} height={22} rx={5} fill="#ffca3a" transform={`rotate(${k * 36 + t * 10})`} />)}
    <Vol><circle r={42} fill="#ffd23f" {...kst(5)} /></Vol>
    {glasses
      ? <g><rect x={-32} y={-14} width={26} height={18} rx={6} fill={KINK} /><rect x={6} y={-14} width={26} height={18} rx={6} fill={KINK} /><path d="M -6,-6 L 6,-6" {...kst(4)} /></g>
      : <g><circle cx={-14} cy={-6} r={5} fill={KINK} /><circle cx={14} cy={-6} r={5} fill={KINK} /></g>}
    <path d="M -14,14 Q 0,24 14,14" fill="none" {...kst(4)} />
  </g>
);
const Cloud: React.FC = () => <Vol><path d="M -60,16 Q -66,-14 -36,-16 Q -26,-42 4,-34 Q 30,-50 48,-22 Q 74,-16 64,16 Z" fill="#ffffff" {...kst(4)} /></Vol>;
const Butterfly: React.FC<{ t: number }> = ({ t }) => {
  const f = 0.6 + 0.4 * Math.abs(Math.sin(t * 6));
  return (
    <g>
      <g transform={`scale(${f},1)`}><Vol><ellipse cx={-20} cy={-8} rx={20} ry={16} fill="#ff6fa5" {...kst(3)} /><ellipse cx={20} cy={-8} rx={20} ry={16} fill="#ff6fa5" {...kst(3)} /><ellipse cx={-14} cy={14} rx={13} ry={11} fill="#ffafcc" {...kst(3)} /><ellipse cx={14} cy={14} rx={13} ry={11} fill="#ffafcc" {...kst(3)} /></Vol></g>
      <rect x={-3} y={-18} width={6} height={38} rx={3} fill={KINK} />
    </g>
  );
};
const Picnic: React.FC<{ v: 0 | 1; t: number }> = ({ v, t }) => (
  <g>
    <rect x={-290} y={-210} width={580} height={420} fill="#9bd8ff" />
    <path d="M -290,10 Q -120,-40 40,0 Q 180,-30 290,0 L 290,210 L -290,210 Z" fill="#8ac926" />
    <g transform="translate(-200,-130)"><Sun glasses={v === 1} t={t} /></g>
    <g transform="translate(60,-160) scale(0.9)"><Cloud /></g>
    {v === 0 && <g transform={`translate(-40,${-110 + Math.sin(t * 2) * 6})`}><Butterfly t={t} /></g>}
    <g transform="translate(180,-50)">
      <Vol kind="tube"><rect x={-16} y={10} width={32} height={110} rx={10} fill="#a0663f" {...kst(4)} /></Vol>
      <Vol><circle r={78} fill="#52b788" {...kst(5)} /></Vol>
      {v === 0 && [[-34, -20], [26, -36], [10, 28]].map(([x, y], k) => <g key={k} transform={`translate(${x},${y}) scale(0.32)`}><Apple /></g>)}
    </g>
    <g transform="translate(30,132)">
      <Vol kind="slope"><path d="M -150,-40 L 150,-40 L 180,60 L -180,60 Z" fill={v === 0 ? '#ff595e' : '#1982c4'} {...kst(5)} /></Vol>
      {[-100, -30, 40, 110].map((x) => <path key={x} d={`M ${x},-40 L ${x * 1.15},60`} stroke="#ffffff" strokeWidth={8} opacity={0.6} />)}
      <path d="M -165,10 L 165,10" stroke="#ffffff" strokeWidth={8} opacity={0.6} />
    </g>
    {v === 0 && (
      <g transform="translate(-150,110)">
        <Vol><path d="M -34,-30 L 34,-30 Q 46,10 30,36 L -30,36 Q -46,10 -34,-30 Z" fill="#ffca3a" {...kst(4)} /></Vol>
        <rect x={-40} y={-44} width={80} height={18} rx={8} fill="#ff924c" {...kst(4)} />
        <text y={14} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={22} fill="#8d5a3b">HONEY</text>
      </g>
    )}
    <g transform="translate(130,120)"><Vol><path d="M -20,-24 L 20,-24 L 16,24 L -16,24 Z" fill="#ffffff" {...kst(4)} /></Vol></g>
  </g>
);
const Teddy: React.FC<{ bow: string }> = ({ bow }) => (
  <g>
    <Vol>
      <circle cx={-36} cy={-56} r={18} fill="#c98f5f" {...kst(4)} /><circle cx={36} cy={-56} r={18} fill="#c98f5f" {...kst(4)} />
      <ellipse cx={0} cy={70} rx={56} ry={60} fill="#c98f5f" {...kst(5)} />
      <circle cx={0} cy={-24} r={48} fill="#c98f5f" {...kst(5)} />
    </Vol>
    <circle cx={-16} cy={-30} r={6} fill={KINK} /><circle cx={16} cy={-30} r={6} fill={KINK} /><ellipse cx={0} cy={-12} rx={9} ry={6} fill={KINK} />
    <g transform="translate(0,34)"><path d="M 0,0 L -30,-16 L -30,16 Z M 0,0 L 30,-16 L 30,16 Z" fill={bow} {...kst(4)} /><circle r={8} fill={bow} {...kst(3)} /></g>
  </g>
);
const ToyRoom: React.FC<{ v: 0 | 1; t: number }> = ({ v, t }) => (
  <g>
    <rect x={-290} y={-210} width={580} height={420} fill="#ffe5ec" />
    <rect x={-290} y={80} width={580} height={130} fill="#f4d6b0" />
    <g transform="translate(150,-110)">
      <rect x={-80} y={-64} width={160} height={128} rx={10} fill={v === 0 ? '#9bd8ff' : '#2b2d6e'} {...kst(6)} />
      {v === 0 ? <g transform="translate(-30,-16)"><circle r={24} fill="#ffd23f" {...kst(3)} /></g> : <g transform="translate(-26,-14)"><path d="M 8,-24 A 24,24 0 1 0 22,14 A 18,18 0 1 1 8,-24 Z" fill="#fff3b0" {...kst(3)} />{[[40, -30], [56, 20], [-30, 34]].map(([x, y], k) => <circle key={k} cx={x} cy={y} r={3} fill="#ffffff" />)}</g>}
      <path d="M 0,-64 L 0,64 M -80,0 L 80,0" {...kst(6)} />
    </g>
    <g transform="translate(-232,-40)">
      {v === 0 && <circle cx={0} cy={10} r={64} fill="#fff3b0" opacity={0.75} />}
      <path d="M -36,-10 L 36,-10 L 24,-56 L -24,-56 Z" fill={v === 0 ? '#ffd23f' : '#adb5bd'} {...kst(4)} />
      <rect x={-5} y={-10} width={10} height={90} fill="#8d5a3b" />
      <rect x={-30} y={80} width={60} height={14} rx={6} fill="#8d5a3b" {...kst(3)} />
    </g>
    <g transform="translate(-160,40)"><Teddy bow={v === 0 ? '#ff595e' : '#1982c4'} /></g>
    {v === 0 && <g transform="translate(40,150)"><Vol><circle r={36} fill="#ffca3a" {...kst(4)} /></Vol><path d="M -36,0 Q 0,-20 36,0 M -10,-34 Q 6,0 -10,34" fill="none" stroke="#ff595e" strokeWidth={6} /></g>}
    <g transform="translate(200,90)">
      <Vol><path d="M 0,-80 Q 34,-40 30,40 L -30,40 Q -34,-40 0,-80 Z" fill={v === 0 ? '#ff595e' : '#52b788'} {...kst(5)} /></Vol>
      <path d="M -30,10 L -54,54 L -26,40 Z M 30,10 L 54,54 L 26,40 Z" fill="#ffca3a" {...kst(4)} />
      <circle cy={-24} r={14} fill="#9bd8ff" {...kst(4)} />
      <path d={`M -14,44 Q 0,${70 + Math.sin(t * 20) * 6} 14,44 Z`} fill="#ff924c" />
    </g>
  </g>
);
const Fish: React.FC<{ c: string; t: number }> = ({ c, t }) => (
  <g transform={`translate(0,${Math.sin(t * 2) * 6})`}>
    <path d={`M 50,0 L 96,${-34 + Math.sin(t * 8) * 6} L 96,${34 + Math.sin(t * 8) * 6} Z`} fill={c} {...kst(4)} />
    <Vol><ellipse rx={64} ry={42} fill={c} {...kst(5)} /></Vol>
    <circle cx={-30} cy={-8} r={9} fill={KINK} /><circle cx={-32} cy={-11} r={3} fill="#ffffff" />
    <path d="M -50,14 Q -42,20 -34,14" fill="none" {...kst(3)} />
  </g>
);
const SeaStar: React.FC = () => <Vol><path d={Array.from({ length: 10 }).map((_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5; const r = i % 2 ? 16 : 40; return `${i ? 'L' : 'M'} ${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`; }).join(' ') + ' Z'} fill="#ff924c" {...kst(4)} strokeLinejoin="round" /></Vol>;
const Sea: React.FC<{ v: 0 | 1; t: number }> = ({ v, t }) => (
  <g>
    <rect x={-290} y={-210} width={580} height={420} fill="#48cae4" />
    <rect x={-290} y={-210} width={580} height={120} fill="#90e0ef" opacity={0.5} />
    <path d="M -290,130 Q -100,100 60,128 Q 200,110 290,124 L 290,210 L -290,210 Z" fill="#ffe8b0" />
    {[[-250, 140], [240, 120]].map(([x, y], k) => <path key={k} d={`M ${x},${y} q ${-14 + Math.sin(t * 2 + k) * 8},-50 0,-100 q ${14 + Math.sin(t * 2 + k) * 8},-40 0,-80`} fill="none" stroke="#52b788" strokeWidth={14} strokeLinecap="round" />)}
    {v === 0 && [0, 1, 2].map((k) => <circle key={k} cx={-210 + k * 14} cy={-110 - k * 30 - ((t * 20) % 10)} r={10 + k * 3} fill="none" stroke="#ffffff" strokeWidth={4} />)}
    <g transform="translate(-110,-30)"><Fish c={v === 0 ? '#ff924c' : '#9b5de5'} t={t} /></g>
    {v === 0 && <g transform="translate(180,150) rotate(12)"><SeaStar /></g>}
    <g transform="translate(-50,150)">
      {v === 0
        ? <g><Vol><ellipse rx={44} ry={26} fill="#ff595e" {...kst(4)} /></Vol><path d="M -44,-6 q -30,-30 -10,-44 M 44,-6 q 30,-30 10,-44" fill="none" stroke="#ff595e" strokeWidth={12} strokeLinecap="round" /><circle cx={-12} cy={-30} r={6} fill={KINK} /><circle cx={12} cy={-30} r={6} fill={KINK} /></g>
        : <g><Vol><path d="M -40,20 Q -44,-30 0,-36 Q 44,-30 40,20 Z" fill="#ffd6e5" {...kst(4)} /></Vol>{[-24, -8, 8, 24].map((x) => <path key={x} d={`M ${x * 0.5},-30 L ${x},18`} stroke="#ff6fa5" strokeWidth={4} />)}</g>}
    </g>
    {v === 0 && (
      <g transform={`translate(130,${-110 + Math.sin(t * 1.6) * 8})`}>
        <Vol><path d="M -44,10 Q -44,-44 0,-44 Q 44,-44 44,10 Z" fill="#ffafcc" {...kst(4)} /></Vol>
        {[-30, -10, 10, 30].map((x, k) => <path key={x} d={`M ${x},10 q ${6 + Math.sin(t * 4 + k) * 6},24 0,48`} fill="none" stroke="#ffafcc" strokeWidth={8} strokeLinecap="round" />)}
        <circle cx={-12} cy={-14} r={5} fill={KINK} /><circle cx={12} cy={-14} r={5} fill={KINK} />
      </g>
    )}
  </g>
);
const Snow: React.FC<{ v: 0 | 1; t: number }> = ({ v, t }) => (
  <g>
    <rect x={-290} y={-210} width={580} height={420} fill="#caf0f8" />
    {Array.from({ length: 22 }).map((_, k) => <circle key={k} cx={-290 + ((k * 137) % 580)} cy={-210 + (((k * 89) + t * 30) % 300)} r={4} fill="#ffffff" />)}
    <path d="M -290,90 Q -100,60 80,90 Q 200,70 290,86 L 290,210 L -290,210 Z" fill="#ffffff" stroke="#bde0fe" strokeWidth={4} />
    <g transform="translate(-200,40)">
      <rect x={-12} y={-60} width={24} height={110} rx={6} fill="#a0663f" {...kst(4)} />
      {v === 0 && <g transform="translate(0,-80)"><Vol><ellipse rx={26} ry={20} fill="#1982c4" {...kst(4)} /><circle cx={-18} cy={-14} r={14} fill="#1982c4" {...kst(4)} /></Vol><path d="M -32,-14 L -42,-10 L -32,-6 Z" fill="#ff924c" /><circle cx={-20} cy={-17} r={3} fill={KINK} /></g>}
    </g>
    <g transform="translate(0,0)">
      <Vol><circle cx={0} cy={110} r={92} fill="#ffffff" {...kst(5)} /><circle cx={0} cy={4} r={66} fill="#ffffff" {...kst(5)} /><circle cx={0} cy={-96} r={50} fill="#ffffff" {...kst(5)} /></Vol>
      <g transform="translate(0,-48)">
        <rect x={-58} y={-12} width={116} height={24} rx={10} fill="#ff595e" {...kst(4)} />
        <path d="M 30,0 L 46,56 L 22,56 Z" fill="#ff595e" {...kst(4)} />
        {v === 0 && [-40, -14, 12, 38].map((x) => <rect key={x} x={x} y={-12} width={10} height={24} fill="#ffffff" />)}
      </g>
      {(v === 0 ? [-18, 4, 26] : [-6, 18]).map((y) => <circle key={y} cx={0} cy={y} r={8} fill={KINK} />)}
      <circle cx={-16} cy={-104} r={6} fill={KINK} /><circle cx={16} cy={-104} r={6} fill={KINK} />
      {v === 0 && <path d="M 2,-94 L 56,-86 L 2,-80 Z" fill="#ff924c" {...kst(3)} />}
      <path d="M -14,-74 Q 0,-66 14,-74" fill="none" {...kst(3)} />
      <g transform="translate(0,-146)">
        <rect x={-52} y={10} width={104} height={14} rx={6} fill={v === 0 ? '#2b2d42' : '#ff595e'} {...kst(3)} />
        <rect x={-34} y={-44} width={68} height={58} rx={6} fill={v === 0 ? '#2b2d42' : '#ff595e'} {...kst(3)} />
      </g>
      <path d="M -60,0 L -120,-40 M 60,0 L 120,-40" stroke="#8d5a3b" strokeWidth={8} strokeLinecap="round" />
    </g>
  </g>
);
const BOBO_A_SPEC: CritterSpec = { ...BOBO_HERO, id: 'bobo-pic-a', scarf: '#ff595e' };
const BOBO_B_SPEC: CritterSpec = { ...BOBO_HERO, id: 'bobo-pic-b', scarf: '#1982c4', hat: 'party' };
const TwoBobos: React.FC<{ v: 0 | 1; t: number }> = ({ v, t }) => (
  <g>
    <rect x={-290} y={-210} width={580} height={420} fill="#fff3b0" />
    <rect x={-290} y={140} width={580} height={70} fill="#f4d6b0" />
    {[-220, -110, 110, 220].map((x, k) => <circle key={k} cx={x} cy={-150 + (k % 2) * 30} r={14} fill={['#ff595e', '#4cc9f0', '#8ac926', '#ff6fa5'][k]} opacity={0.6} />)}
    {v === 1 && <ellipse cx={0} cy={BOBO_Y + 6} rx={130} ry={26} fill="#8ac926" {...kst(4)} />}
    {v === 1 && (
      <g>
        <path d={`M ${-150 + Math.sin(t * 1.5) * 6},-50 Q -110,40 -66,${BOBO_Y - 150}`} fill="none" stroke={KINK} strokeWidth={3} />
        <g transform={`translate(${-150 + Math.sin(t * 1.5) * 6},-110)`}>
          <Vol><ellipse rx={46} ry={56} fill="#ff6fa5" {...kst(4)} /></Vol>
          <path d="M -6,56 L 6,56 L 0,66 Z" fill="#ff6fa5" {...kst(3)} />
        </g>
      </g>
    )}
    <Critter spec={v === 0 ? BOBO_A_SPEC : BOBO_B_SPEC} x={0} y={BOBO_Y} scale={BS} idle={false} expr="smile"
      armL="down" armR={v === 0 ? 'down' : 'hold'} holdR={v === 1 ? <g transform="scale(0.8)"><Apple /></g> : undefined} />
  </g>
);
const Picture: React.FC<{ s: Scene; v: 0 | 1; t: number }> = ({ s, v, t }) =>
  s === 1 ? <Picnic v={v} t={t} /> : s === 2 ? <ToyRoom v={v} t={t} /> : s === 3 ? <Sea v={v} t={t} /> : s === 4 ? <Snow v={v} t={t} /> : <TwoBobos v={v} t={t} />;
const Ring: React.FC<{ x: Diff; t: number }> = ({ x, t }) => (
  <g transform={`translate(${x.x},${x.y}) scale(${popIn(t, x.at, 0.4)})`}>
    <circle r={x.r} fill="none" stroke="#ffffff" strokeWidth={14} opacity={0.8} />
    <circle r={x.r} fill="none" stroke="#2dc653" strokeWidth={9} strokeDasharray="18 10" transform={`rotate(${t * 50})`} />
  </g>
);

export default function KidsPuzzles076() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const hop = hopAt(t, HOPS, { h: 46 });
  const [mode, since] = boardAt(t);
  const s = mode.s;
  const playing = t < PLAY_END;
  const rings = playing ? DIFFS[s].filter((x) => t >= x.at) : mode.all ? DIFFS[s] : mode.ring && t >= mode.ring.at ? [mode.ring] : [];
  const n = playing ? foundIn(s, t) : mode.all ? 5 : 0;
  const enter = since > 0 ? popIn(t, since + 0.05, 0.45) : 1;
  const trickP = mode.trick ? ((t - since) % 2.4) / 2.4 : 0;
  const eyeX = mode.trick ? (trickP < 0.5 ? PX[0] : PX[1]) + (Math.round((t - since) / 2.4 - 0.5) % 2 ? 0 : 0) : 0;
  const cheer = (k: number) => (within(t, S('p5_done'), S('p5_done') + 2.4) ? Math.abs(Math.sin(t * 7 + k)) * 20 : 0);

  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
        <Backdrop place={PLACE} w={W} h={H} t={t} fx={false} dim={0.35} />
        {/* the two-picture board */}
        <g transform={`translate(960,${PY}) scale(${enter}) translate(-960,${-PY})`}>
          <rect x={PX[0] - PW / 2 - 34} y={PY - PH / 2 - 34} width={PX[1] - PX[0] + PW + 68} height={PH + 68} rx={30} fill="#ffffff" {...kst(8)} />
          {PX.map((px, v) => (
            <g key={v} transform={`translate(${px},${PY})`}>
              <defs><clipPath id={`d76pic${v}`}><rect x={-PW / 2} y={-PH / 2} width={PW} height={PH} rx={16} /></clipPath></defs>
              <g clipPath={`url(#d76pic${v})`}><Picture s={s} v={v as 0 | 1} t={t} /></g>
              <rect x={-PW / 2} y={-PH / 2} width={PW} height={PH} rx={16} fill="none" {...kst(6)} />
              {rings.map((x) => <Ring key={x.k} x={x} t={t} />)}
              {v === 1 && <AnswerMark t={t} at={E('p1_leo') + 0.1} until={S('p1_no') + 1.6} ok={false} x={60} y={-160} size={0.5} />}
              {v === 1 && <AnswerMark t={t} at={E('p2_leo') + 0.1} until={S('p2_no') + 1.6} ok={false} x={-160} y={-10} size={0.5} />}
            </g>
          ))}
          {/* the score: five stars under the board */}
          {playing && (
            <g transform={`translate(960,${PY + PH / 2 + 4})`}>
              <rect x={-190} y={-26} width={380} height={64} rx={32} fill="#ffffff" {...kst(5)} />
              {[0, 1, 2, 3, 4].map((k) => {
                const on = k < n;
                const at = on ? DIFFS[s][k].at : 1e9;
                return (
                  <g key={k} transform={`translate(${(k - 2) * 70},6) scale(${on ? popIn(t, at, 0.4) * 0.5 + 0.5 : 0.8})`}>
                    <path d="M 0,-26 L 7.6,-9 L 26,-8 L 12,4.6 L 16,22 L 0,12.6 L -16,22 L -12,4.6 L -26,-8 L -7.6,-9 Z" fill={on ? '#ffca3a' : '#e9ecef'} {...kst(3)} strokeLinejoin="round" />
                  </g>
                );
              })}
            </g>
          )}
          {mode.trick && (
            <g transform={`translate(${eyeX},${PY - 40})`}>
              <circle r={70} fill="none" stroke="#ff6fa5" strokeWidth={10} strokeDasharray="16 10" transform={`rotate(${t * 80})`} />
              <text y={-90} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={56} fill="#ff6fa5" stroke="#ffffff" strokeWidth={8} paintOrder="stroke">{trickP < 0.5 ? 'LOOK HERE…' : '…THEN THERE!'}</text>
            </g>
          )}
        </g>
        <PlaceLight place={PLACE}>
          <Critter polish acting spec={HOOT_HERO} x={X.hoot} y={yAt(X.hoot, CS)} scale={CS} expr={exprAt(t, HOOT_E)} look={lookAt(t, LOOK_R)} {...speechAt(VO, 'hoot', t)}
            armL={poseAt(t, HOOT_A)} armR={poseAt(t, HOOT_A)} facing={-1} hop={hop.hop + cheer(3)} squash={hop.squash} />
          <Critter polish acting spec={BOBO_HERO} x={X.bobo} y={yAt(X.bobo, CS)} scale={CS} expr={exprAt(t, BOBO_E)} look={lookAt(t, LOOK_R)} {...speechAt(VO, 'bobo', t)}
            armL={poseAt(t, BOBO_A)} armR={poseAt(t, BOBO_A)} facing={-1} hop={hop.hop + cheer(2)} squash={hop.squash} />
          <Kid polish acting spec={LEO_HERO} x={X.leo} y={yAt(X.leo, KS)} scale={KS} expr={exprAt(t, LEO_E)} look={lookAt(t, LOOK_L)} {...speechAt(VO, 'leo', t)}
            armL={poseAt(t, LEO_L)} armR={poseAt(t, LEO_R)} hop={hop.hop + cheer(1)} squash={hop.squash} />
          <Kid polish acting spec={MILA_HERO} x={X.mila} y={yAt(X.mila, KS)} scale={KS} expr={exprAt(t, MILA_E)} look={lookAt(t, LOOK_L)} {...speechAt(VO, 'mila', t)}
            armL={poseAt(t, MILA_L)} armR={poseAt(t, MILA_R)} hop={hop.hop + cheer(0)} squash={hop.squash} />
        </PlaceLight>
        <Reaction kind="?" t={t} at={E('p1_leo') + 0.1} until={E('p1_no')} x={X.leo} y={yAt(X.leo, KS) - 460} s={0.5} />
        <Reaction kind="sweat" t={t} at={E('p2_leo') + 0.1} until={E('p2_no')} x={X.leo + 50} y={yAt(X.leo, KS) - 400} s={0.5} />
        <Reaction kind="cloud" t={t} at={S('p1_d5')} until={E('p1_d5') + 0.4} x={X.bobo} y={yAt(X.bobo, CS) - 470} s={0.5} />
        <Reaction kind="!" t={t} at={S('p5_bobo')} until={E('p5_bobo')} x={X.bobo} y={yAt(X.bobo, CS) - 470} s={0.55} />
        <Reaction kind="heart" t={t} at={S('p5_bobo2')} until={E('p5_bobo2') + 0.4} x={X.bobo} y={yAt(X.bobo, CS) - 470} s={0.5} />
        <Reaction kind="idea" t={t} at={S('trick')} until={E('trick')} x={X.hoot} y={yAt(X.hoot, CS) - 470} s={0.5} />
      </ActionStage>

      {/* screen-space */}
      <PopText t={t} at={0.3} until={S('premise') - 0.1} text="FIND 5 DIFFERENCES!" y={100} size={100} color="#ff6fa5" />
      <PopText t={t} at={S('premise')} until={S('p1_leo') - 0.1} text="5 THINGS CHANGED!" y={100} size={100} color="#ffca3a" />
      <PopText t={t} at={S('p1_no')} until={S('p1_d2') - 0.1} text="THE CLOUDS ARE THE SAME!" y={100} size={84} color="#4cc9f0" />
      <PopText t={t} at={S('p1_done')} until={S('p2') - 0.2} text="⭐ 5 / 5! ⭐" y={100} size={110} color="#ffca3a" />
      <PopText t={t} at={S('p2')} until={S('p2_leo') - 0.1} text="THE TOY ROOM" y={100} size={100} color="#ff6fa5" />
      <PopText t={t} at={S('p2_no')} until={S('p2_d1') - 0.1} text="HE HAS 2 EYES!" y={100} size={100} color="#4cc9f0" />
      <PopText t={t} at={S('p2_done')} until={S('p3') - 0.2} text="⭐ SUPER EYES! ⭐" y={100} size={100} color="#ffca3a" />
      <PopText t={t} at={S('p3')} until={S('p3_d1') - 0.1} text="UNDER THE SEA" y={100} size={100} color="#4cc9f0" />
      <PopText t={t} at={S('p3_done')} until={S('p4') - 0.2} text="⭐ SPLASH! 5 / 5! ⭐" y={100} size={100} color="#ffca3a" />
      <PopText t={t} at={S('p4')} until={S('p4_d1') - 0.1} text="THE SNOWMEN" y={100} size={100} color="#ffffff" />
      <PopText t={t} at={S('p4_done')} until={S('p5') - 0.2} text="⭐ HOORAY! 5 / 5! ⭐" y={100} size={100} color="#ffca3a" />
      <PopText t={t} at={S('p5')} until={S('p5_d1') - 0.1} text="🌟 SUPER PUZZLE! 🌟" y={100} size={100} color="#ff595e" />
      <PopText t={t} at={S('p5_done')} until={S('rem') - 0.2} text="25 DIFFERENCES!" y={100} size={110} color="#ffca3a" />
      <PopText t={t} at={S('rem')} until={S('rq1') - 0.1} text="LET'S REMEMBER!" y={100} size={110} color="#ffca3a" />
      <PopText t={t} at={S('ra1')} until={S('rq2') - 0.2} text="😎 SUNGLASSES!" y={100} size={110} color="#ffca3a" />
      <PopText t={t} at={S('ra2')} until={S('rq3') - 0.2} text="2 BUTTONS!" y={100} size={120} color="#ffffff" />
      <PopText t={t} at={S('ra3')} until={S('rq4') - 0.2} text="🐚 A SEASHELL!" y={100} size={110} color="#ffafcc" />
      <PopText t={t} at={S('ra4')} until={S('rq5') - 0.2} text="🍯 THE HONEY POT!" y={100} size={110} color="#ffca3a" />
      <PopText t={t} at={S('ra5')} until={S('rq6') - 0.2} text="BLUE!" y={100} size={130} color="#1982c4" />
      <PopText t={t} at={S('ra6')} until={S('rq7') - 0.2} text="☀️ DAY + NIGHT 🌙" y={100} size={110} color="#ffca3a" />
      <PopText t={t} at={S('ra7')} until={S('trick') - 0.2} text="THE JELLYFISH!" y={100} size={110} color="#ffafcc" />
      <PopText t={t} at={S('trick')} until={S('trick_turn') - 0.1} text="👀 THE TRICK" y={100} size={110} color="#ff6fa5" />
      <PopText t={t} at={S('trick_turn')} until={S('bye') - 0.1} text="🗣️ YOUR TURN!" y={100} size={110} color="#ffffff" />
      <PopText t={t} at={S('bye')} until={END_IRIS} text="SEE YOU NEXT TIME!" y={100} size={100} color="#ffca3a" />
      {(['p1_q', 'p2_q', 'p3_q', 'p4_q', 'p5_q', 'rq1', 'rq2', 'rq3', 'rq4', 'rq5', 'rq6', 'rq7'] as const).map((q) => (
        <ThinkTimer key={q} t={t} from={beat(E(q) + 0.1)} to={VO[K[q] + 1].start - 0.1} x={1790} y={170} r={84} />
      ))}
      {(['p1_done', 'p2_done', 'p3_done', 'p4_done', 'p5_done'] as const).map((k) => <Confetti key={k} t={t} at={S(k)} y={360} />)}
      <Confetti t={t} at={S('p5_done') + 0.8} y={360} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <StarWipe t={t} at={END_IRIS} dur={0.5} hold={5} color="#ff6fa5" x={W / 2} y={H * 0.45} />
    </>
  );
}
