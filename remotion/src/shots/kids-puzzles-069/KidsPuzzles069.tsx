// TINY SPARKS · Day 69 · 🧩 Puzzles #10 — "Find the Hidden Heart" (LONG 16:9)
// kids-shorts/tiny-sparks/puzzles/day-069-find-the-hidden-heart. Cues from VO via K (keys.gen.ts).
// COLD OPEN (no ident): in the park, puzzle 1 (balloons) is already on the big picture board at frame 0 — "The wind blew
// away our heart stickers! Can you find one?" → think timer → Leo ✗ (the round red balloon) → Mila ✓ (the heart
// balloon) → the heart flies onto the FRIENDSHIP CARD (top-left) → premise (12 hearts) + the heart trick "two round
// bumps on top, one little point" → 12 puzzles: clouds (Leo ✗ a sheep cloud) · butterflies (they taste with their
// feet) · Bobo's sandwiches (he nearly eats the heart) · red shapes (Leo ✗ the triangle) · the pond (a frog's lily pad,
// Leo finds it) · the UPSIDE-DOWN heart (turn it — still a heart) · kites · the tiny heart on a ladybug · the heart
// window · teddy's toy box · all pink → the SUPER puzzle: 3 hearts at the picnic → 15 → the card is for YOU → remember
// (4) → draw a heart in the air (bump · bump · point) → bye + star iris.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Kid, kidFaceAt, type KArm } from '../../lib/kids/kid';
import { Critter, critterFaceAt, type CArm } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, HOOT_HERO, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { Backdrop, PlaceLight, standY } from '../../lib/kids/places';
import { AnswerMark, Confetti, FONT_TOON, KidsCaptions, PopText, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, Reaction, StageWord, StarWipe, directorCam, hopAt, onBeat, type Shot } from '../../lib/kids/energy';
import { exprAt, lookAt, poseAt, type Keys } from '../../lib/kids/smooth';
import { voKeys, wordHops, type Span } from '../../lib/kids/cues';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsPuzzles069', durationInSeconds: 325.1, fps: 30, width: 1920, height: 1080 };

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

// ── place + blocking
const PLACE = 'park' as const;
const KS = 0.5;
const CS = 0.52;
const X = { leo: 170, mila: 360, bobo: 1560, hoot: 1760 };
const yAt = (x: number, s: number) => standY(PLACE, x, W, H, { halfW: 150 * s });
const CARD: [number, number] = [960, 420];
const CW = 1000;
const CH = 600;

// ── the puzzles: [question line, answer moment, answer spot (card coords), wrong try (line, spot)]
type Puz = { q: Key; a: number; at: [number, number]; wrong?: { line: Key; at: [number, number] }; bg: string; ring?: number; fly?: number };
const PUZ: Puz[] = [
  { q: 'p1', a: S('p1_a') + 0.3, at: [-300, -150], wrong: { line: 'p1_leo', at: [250, -150] }, bg: '#bde0fe' },
  { q: 'p2', a: S('p2_a') + 0.3, at: [200, -140], wrong: { line: 'p2_leo', at: [-250, -100] }, bg: '#a0d8ff' },
  { q: 'p3', a: S('p3_a') + 0.3, at: [300, -20], bg: '#e9f5db' },
  { q: 'p4', a: S('p4_a') + 0.3, at: [130, 40], bg: '#fff1e6', fly: E('p4_stop') - 0.2 },
  { q: 'p5', a: S('p5_a') + 0.3, at: [300, -170], wrong: { line: 'p5_leo', at: [-300, 0] }, bg: '#fff8e7' },
  { q: 'p6', a: S('p6_a') + 0.3, at: [80, 110], bg: '#8ecae6' },
  { q: 'p7', a: word('p7_a', 5), at: [-60, 40], bg: '#f3e8ff' },
  { q: 'p8', a: S('p8_a') + 0.3, at: [250, -140], bg: '#a0d8ff' },
  { q: 'p9', a: S('p9_a') + 0.3, at: [100, 30], bg: '#d8f3dc', ring: 70 },
  { q: 'p10', a: S('p10_a') + 0.3, at: [300, -40], bg: '#bde0fe' },
  { q: 'p11', a: S('p11_a') + 0.3, at: [-250, -60], bg: '#ffe5d9' },
  { q: 'p12', a: S('p12_a') + 0.3, at: [330, 120], bg: '#fff0f6' },
];
const SUPER_AT: { a: number; at: [number, number] }[] = [
  { a: S('s1'), at: [-300, -60] }, { a: S('s2'), at: [80, -70] }, { a: S('s3'), at: [330, 200] },
];
const SUPER0 = S('super') - 0.3;
const CARD0 = S('card') - 0.2;
const REM0 = S('rem') - 0.3;
const FLY = 0.9; // the found heart flies to the card
const ALL_FOUND = [...PUZ.map((p) => p.fly ?? p.a), ...SUPER_AT.map((s) => s.a)];
const puzzleAt = (t: number) => {
  if (t >= SUPER0) return -1;
  let i = 0;
  for (let j = 0; j < PUZ.length; j++) if (t >= S(PUZ[j].q) - 0.35) i = j;
  return i;
};
const END_IRIS = E('bye2') + 0.6;
const TURN = word('p7_a', 3); // the upside-down heart turns around

// ── arms, faces, eyes
const CHANT: Span<KArm> = [S('ch1'), E('ch_a') + 0.3, 'point'];
const BYE: Span<KArm> = [S('bye'), 999, 'wave'];
const ans = (k: Key): Span<KArm> => [S(k), E(k) + 0.3, 'point'];
const MILA_R = voKeys<KArm>(VO, 'mila', 'present', 'down', [
  ans('p1_a'), ans('p2_a'), ans('p3_a'), ans('p5_a'), ans('p7_a'), ans('p8_a'), ans('p10_a'), ans('p12_a'), ans('s1'),
  [S('p4_stop'), E('p4_stop'), 'point'], [S('card'), E('card_b'), 'present'], [S('ra4'), E('ra4'), 'cheer'], CHANT, BYE,
]);
const MILA_L = voKeys<KArm>(VO, null, 'down', 'down', [[S('card'), E('card_b'), 'present'], [S('bye'), 999, 'hug']]);
const MILA_E = voKeys<KExpr>(VO, 'mila', 'happy', 'smile', [
  [S('p1'), word('p1', 2), 'surprised'], [S('p4_stop'), E('p4_stop'), 'surprised'], [S('p2_no'), E('p2_no'), 'laugh'],
  [S('super_yay'), E('super_yay') + 1, 'laugh'], [S('card'), E('card_b') + 1, 'happy'], [S('ch4'), 999, 'laugh'],
]);
const LEO_R = voKeys<KArm>(VO, 'leo', 'present', 'down', [
  ans('p1_leo'), ans('p2_leo'), ans('p4_a'), ans('p5_leo'), [S('p6_a'), E('p6_a') + 0.3, 'cheer'], ans('p9_a'), ans('p11_a'), ans('s2'),
  [S('p2_yay'), E('p2_yay'), 'cover'], [S('p7_leo'), E('p7_leo'), 'shrug'], [S('card_q'), E('card_q'), 'point'], [S('ra1'), E('ra1'), 'cheer'], CHANT, BYE,
]);
const LEO_L = voKeys<KArm>(VO, null, 'down', 'down', [[S('p2_yay'), E('p2_yay'), 'cover'], [S('p7_leo'), E('p7_leo'), 'shrug'], [S('p6_a'), E('p6_a') + 0.3, 'cheer'], [S('bye'), 999, 'wave']]);
const wrongFace = (k: Key, next: Key): Span<KExpr> => [E(k), S(next) + 0.6, 'oops'];
const LEO_E = voKeys<KExpr>(VO, 'leo', 'happy', 'smile', [
  [S('p1_leo'), E('p1_leo'), 'proud'], wrongFace('p1_leo', 'p1_a'), [S('p2_leo'), E('p2_leo'), 'proud'], wrongFace('p2_leo', 'p2_a'),
  [S('p2_yay'), E('p2_yay'), 'laugh'], [S('p5_leo'), E('p5_leo'), 'proud'], wrongFace('p5_leo', 'p5_a'),
  [S('p6_a'), E('p6_yay'), 'laugh'], [S('p7_leo'), E('p7_leo'), 'think'], [S('p7_a') + 1, E('p7_fact'), 'wow'],
  [S('card_q'), E('card_q'), 'surprised'], [S('super_yay'), E('super_yay') + 1, 'laugh'], [S('ch4'), 999, 'laugh'],
]);
const BOBO_A = voKeys<CArm>(VO, 'bobo', 'wave', 'down', [
  [S('p2_no'), E('p2_no'), 'point'], [S('p4'), E('p4'), 'point'], [S('p4_bobo'), E('p4_bobo'), 'hold'], [S('p4_stop'), E('p4_stop'), 'cheeks'],
  [S('p4_yay'), E('p4_yay'), 'hold'], [S('p9_yay'), E('p9_yay'), 'cheeks'], [S('p11_yay'), E('p11_yay') + 0.4, 'hug'], [S('s3'), E('s3'), 'point'],
  [S('card_b'), E('card_b') + 0.8, 'hug'], [S('ra3'), E('ra3'), 'cheer'], [S('ch1'), E('ch_a') + 0.3, 'cheer'], [S('bye'), 999, 'wave'],
]);
const BOBO_E = voKeys<KExpr>(VO, 'bobo', 'happy', 'smile', [
  [S('p2_no'), E('p2_no'), 'laugh'], [S('p4_bobo'), E('p4_bobo'), 'proud'], [S('p4_stop'), E('p4_stop'), 'surprised'], [S('p4_yay'), E('p4_yay'), 'oops'],
  [S('p9_yay'), E('p9_yay'), 'wow'], [S('p11_yay'), E('p11_yay') + 0.4, 'happy'], [S('super_yay'), E('super_yay') + 1, 'laugh'],
  [S('card_b'), E('card_b') + 0.8, 'happy'], [S('ch4'), 999, 'laugh'],
]);
const HOOT_A = voKeys<CArm>(VO, 'hoot', 'point', 'down', [[S('ch1'), E('ch_a') + 0.3, 'cheer'], [S('bye'), 999, 'wave']]);
const HOOT_R = voKeys<CArm>(VO, null, 'down', 'down', [[S('ch1'), E('ch_a') + 0.3, 'cheer'], [S('bye'), 999, 'wave']]);
const HOOT_E = voKeys<KExpr>(VO, 'hoot', 'happy', 'smile', [[S('p3_fact'), E('p3_fact'), 'wow'], [S('super_yay'), E('super_yay') + 1, 'laugh'], [S('ch4'), 999, 'laugh']]);
const looks = (base: [number, number]): Keys<[number, number]> => [
  [0, base], [S('p2'), [0, -1]], [E('p2') + 0.6, base], [S('p8'), [0, -1]], [E('p8') + 0.6, base],
  [S('card'), [0, 0]], [E('card_b') + 0.4, base], [S('ch1'), [0, 0]], [S('bye'), [0, 0]],
];
const LOOK_L = looks([0.6, -0.3]);
const LOOK_R = looks([-0.6, -0.3]);
const HOPS = [...wordHops(VO, [K.ch1, K.ch2, K.ch3, K.ch4]), S('p6_a') + 0.2, S('super_yay') + 0.2, E('ch_a')];

// ── camera
const WIDE = { z: 1.0, x: 960, y: 540 };
const BOARD = { z: 1.12, x: 960, y: 455 };
const kFace = (x: number) => kidFaceAt(x, yAt(x, KS), KS)[1] + 70;
const cFace = (x: number) => critterFaceAt(x, yAt(x, CS), CS)[1] + 70;
const LEO_CU = { z: 1.55, x: X.leo + 120, y: kFace(X.leo) };
const BOBO_CU = { z: 1.45, x: X.bobo - 80, y: cFace(X.bobo) };
const SHOTS: Shot[] = [
  { t: 0, ...BOARD, move: 'cut', push: 0.01 },
  { t: S('p1_leo') - 0.1, ...LEO_CU, move: 'whip' },
  { t: S('p1_no') - 0.1, ...BOARD, move: 'whip' },
  { t: S('premise') - 0.2, ...WIDE, move: 'smooth', dur: 0.8, push: 0.01 },
  { t: S('trick_b') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: S('p2') - 0.2, ...BOARD, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('p2_no') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: S('p2_a') - 0.1, ...BOARD, move: 'snap' },
  { t: S('p2_yay') - 0.1, ...LEO_CU, move: 'snap' },
  { t: S('p3') - 0.2, ...BOARD, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('p3_fact') - 0.1, z: 1.4, x: X.hoot - 160, y: cFace(X.hoot), move: 'snap' },
  { t: S('p4') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: E('p4') + 0.1, ...BOARD, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('p4_bobo') - 0.1, ...BOBO_CU, move: 'whip' },
  { t: S('p4_stop') - 0.1, z: 1.0, x: 960, y: 540, move: 'whip' },
  { t: S('p4_yay') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: S('p5') - 0.2, ...BOARD, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('p6') - 0.2, ...BOARD, move: 'cut', push: 0.01 },
  { t: S('p6_a') - 0.1, ...LEO_CU, move: 'snap' },
  { t: S('p7') - 0.2, ...BOARD, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('p7_leo') - 0.1, ...LEO_CU, move: 'snap' },
  { t: S('p7_a') - 0.1, ...BOARD, move: 'smooth', dur: 0.5 },
  { t: S('p8') - 0.2, ...BOARD, move: 'cut', push: 0.01 },
  { t: S('p9') - 0.2, ...BOARD, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('p9_a') - 0.1, z: 1.9, x: CARD[0] + PUZ[8].at[0], y: CARD[1] + PUZ[8].at[1], move: 'smooth', dur: 0.6 },
  { t: S('p9_yay') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: S('p10') - 0.2, ...BOARD, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('p11') - 0.2, ...BOARD, move: 'cut', push: 0.01 },
  { t: S('p11_yay') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: S('p12') - 0.2, ...BOARD, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('card_q') - 0.1, ...LEO_CU, move: 'snap' },
  { t: SUPER0, ...BOARD, move: 'smooth', dur: 0.8, push: 0.015 },
  { t: S('super_yay') - 0.2, ...WIDE, move: 'smooth', dur: 0.8, push: 0.01 },
  { t: CARD0, ...WIDE, move: 'smooth', dur: 0.6, push: 0.012 },
  { t: REM0, ...BOARD, move: 'smooth', dur: 0.6, push: 0.006 },
  { t: S('ra3') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: E('ra3') + 0.6, ...BOARD, move: 'smooth', dur: 0.6 },
  { t: S('chant') - 0.2, z: 1.06, x: 960, y: 560, move: 'smooth', dur: 0.6, push: 0.02 },
  { t: S('bye') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
];
SHOTS.sort((a, b) => a.t - b.t);
const PUNCHES = ALL_FOUND;

// ── drawings (card coords)
const heartPath = (r: number) =>
  `M 0,${0.95 * r} C ${-1.35 * r},${0.1 * r} ${-0.95 * r},${-1.0 * r} 0,${-0.4 * r} C ${0.95 * r},${-1.0 * r} ${1.35 * r},${0.1 * r} 0,${0.95 * r} Z`;
const HHeart: React.FC<{ r?: number; c?: string; face?: boolean }> = ({ r = 56, c = '#ff4d6d', face = true }) => (
  <g>
    <Vol><path d={heartPath(r)} fill={c} {...kst(5)} strokeLinejoin="round" /></Vol>
    {face && (
      <g transform={`scale(${r / 56})`}>
        <ellipse cx={-14} cy={0} rx={5} ry={7} fill={KINK} /><ellipse cx={14} cy={0} rx={5} ry={7} fill={KINK} />
        <circle cx={-12} cy={-3} r={2} fill="#ffffff" /><circle cx={16} cy={-3} r={2} fill="#ffffff" />
        <path d="M -8,14 Q 0,21 8,14" fill="none" {...kst(3.5)} />
        <ellipse cx={-26} cy={12} rx={6} ry={4} fill="#ffc2d1" opacity={0.8} /><ellipse cx={26} cy={12} rx={6} ry={4} fill="#ffc2d1" opacity={0.8} />
      </g>
    )}
  </g>
);
const Grass: React.FC<{ y?: number; c?: string }> = ({ y = 200, c = '#8ac926' }) => <rect x={-CW / 2} y={y} width={CW} height={CH / 2 - y + 40} fill={c} />;
const CloudP: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <Vol><path d="M -110,30 Q -140,30 -140,0 Q -140,-36 -100,-38 Q -90,-80 -40,-80 Q -10,-110 40,-90 Q 90,-100 100,-50 Q 140,-44 140,-6 Q 140,30 110,30 Z" fill="#ffffff" {...kst(5)} /></Vol>
  </g>
);
const SHEEP_PUFFS = [[-70, 0, 60], [0, -30, 70], [70, 0, 60], [0, 30, 60], [-40, 30, 50], [40, 30, 50]];
const SheepCloud: React.FC = () => (
  <g>
    <Vol>{SHEEP_PUFFS.map(([x, y, r], k) => <circle key={k} cx={x} cy={y} r={r} fill="#ffffff" {...kst(10)} />)}</Vol>
    {SHEEP_PUFFS.map(([x, y, r], k) => <circle key={k} cx={x} cy={y} r={r - 2} fill="#ffffff" />)}
    <circle cx={-110} cy={-10} r={30} fill="#ffffff" {...kst(5)} /><circle cx={-118} cy={-14} r={5} fill={KINK} />
  </g>
);
const BalloonR: React.FC<{ c: string; heart?: boolean }> = ({ c, heart }) => (
  <g>
    <path d="M 0,60 q 14,40 -6,80 q -14,30 4,70" fill="none" {...kst(3)} />
    {heart ? <HHeart r={62} c={c} face={false} /> : <Vol><ellipse rx={56} ry={66} fill={c} {...kst(5)} /></Vol>}
    <path d="M -6,62 L 6,62 L 0,72 Z" fill={c} {...kst(3)} />
  </g>
);
const Butterfly: React.FC<{ c: string; heart?: boolean; t: number; k: number }> = ({ c, heart, t, k }) => {
  const flap = 0.75 + 0.25 * Math.abs(Math.sin(t * 5 + k));
  return (
    <g>
      <g transform={`scale(${flap},1)`}>
        {heart ? <g transform="translate(0,8)"><HHeart r={58} c={c} face={false} /></g> : (
          <Vol>
            <circle cx={-42} cy={-24} r={38} fill={c} {...kst(5)} /><circle cx={42} cy={-24} r={38} fill={c} {...kst(5)} />
            <circle cx={-32} cy={30} r={26} fill={c} {...kst(5)} /><circle cx={32} cy={30} r={26} fill={c} {...kst(5)} />
          </Vol>
        )}
      </g>
      <rect x={-8} y={-44} width={16} height={92} rx={8} fill="#5a3e6b" {...kst(3)} />
      <path d="M -4,-44 Q -18,-70 -26,-72 M 4,-44 Q 18,-70 26,-72" fill="none" {...kst(3)} />
    </g>
  );
};
const Sandwich: React.FC<{ k: number }> = ({ k }) => {
  const bread = '#f4d19b';
  const crust = '#c98f5f';
  const shape =
    k === 0 ? <rect x={-70} y={-70} width={140} height={140} rx={16} fill={bread} stroke={crust} strokeWidth={12} />
      : k === 1 ? <path d="M -80,60 L 80,60 L 0,-80 Z" fill={bread} stroke={crust} strokeWidth={12} strokeLinejoin="round" />
        : k === 2 ? <circle r={74} fill={bread} stroke={crust} strokeWidth={12} />
          : <path d={heartPath(72)} fill={bread} stroke={crust} strokeWidth={12} strokeLinejoin="round" />;
  return <g><Vol>{shape}</Vol><circle cx={-16} cy={-6} r={6} fill="#ffffff" opacity={0.5} /></g>;
};
const RedShape: React.FC<{ k: number }> = ({ k }) => (
  <Vol>
    {k === 0 && <circle r={62} fill="#ff595e" {...kst(5)} />}
    {k === 1 && <rect x={-58} y={-58} width={116} height={116} rx={10} fill="#ff595e" {...kst(5)} />}
    {k === 2 && <path d="M 0,-66 L 64,52 L -64,52 Z" fill="#ff595e" {...kst(5)} strokeLinejoin="round" />}
  </Vol>
);
const LilyPad: React.FC<{ r?: number; heart?: boolean }> = ({ r = 80, heart }) => (
  <g transform="scale(1,0.55)">
    <Vol>{heart ? <path d={heartPath(r * 0.9)} fill="#52b788" {...kst(5)} strokeLinejoin="round" /> : <path d={`M 0,0 L ${r * 0.3},${-r * 0.95} A ${r},${r} 0 1 1 ${-r * 0.3},${-r * 0.95} Z`} fill="#52b788" {...kst(5)} strokeLinejoin="round" />}</Vol>
  </g>
);
const Frog: React.FC = () => (
  <g>
    <Vol><ellipse cx={0} cy={0} rx={46} ry={34} fill="#80ed99" {...kst(5)} /><circle cx={-22} cy={-32} r={16} fill="#80ed99" {...kst(4)} /><circle cx={22} cy={-32} r={16} fill="#80ed99" {...kst(4)} /></Vol>
    <circle cx={-22} cy={-33} r={7} fill={KINK} /><circle cx={22} cy={-33} r={7} fill={KINK} />
    <path d="M -16,6 Q 0,18 16,6" fill="none" {...kst(3)} />
  </g>
);
const Kite: React.FC<{ c: string; heart?: boolean }> = ({ c, heart }) => (
  <g>
    {heart ? <HHeart r={70} c={c} face={false} /> : <Vol><path d="M 0,-80 L 60,0 L 0,90 L -60,0 Z" fill={c} {...kst(5)} /></Vol>}
    <path d="M 0,80 q 20,40 0,70 q -20,30 0,60" fill="none" {...kst(3)} />
    {[0, 1, 2].map((j) => <path key={j} d={`M ${-10},${110 + j * 40} L 10,${118 + j * 40} L -10,${126 + j * 40} Z`} fill={c} {...kst(2)} />)}
  </g>
);
const Ladybug: React.FC = () => (
  <g>
    <Vol><circle cx={0} cy={-58} r={30} fill="#3b2a4a" {...kst(4)} /><ellipse rx={70} ry={64} fill="#ff595e" {...kst(5)} /></Vol>
    <line x1={0} y1={-60} x2={0} y2={62} {...kst(5)} />
    {[[-36, -20], [-30, 26], [36, -24]].map(([x, y], k) => <circle key={k} cx={x} cy={y} r={11} fill={KINK} />)}
    <circle cx={-12} cy={-66} r={5} fill="#ffffff" /><circle cx={12} cy={-66} r={5} fill="#ffffff" />
  </g>
);
const House: React.FC<{ c: string; win: 0 | 1 | 2 }> = ({ c, win }) => (
  <g>
    <Vol><rect x={-110} y={-80} width={220} height={200} rx={12} fill={c} {...kst(6)} /></Vol>
    <Vol><path d="M -140,-70 L 0,-190 L 140,-70 Z" fill="#ff924c" {...kst(6)} strokeLinejoin="round" /></Vol>
    <rect x={-30} y={40} width={60} height={80} rx={10} fill="#8d5a3b" {...kst(4)} />
    <g transform="translate(0,-30)">
      {win === 0 && <rect x={-36} y={-30} width={72} height={60} rx={6} fill="#bde0fe" {...kst(5)} />}
      {win === 1 && <circle r={34} fill="#bde0fe" {...kst(5)} />}
      {win === 2 && <path d={heartPath(40)} fill="#ff8fab" {...kst(5)} strokeLinejoin="round" />}
    </g>
  </g>
);
const Teddy: React.FC<{ show: boolean; pulse: number }> = ({ show, pulse }) => (
  <g>
    <Vol tone="skin">
      <circle cx={-48} cy={-120} r={22} fill="#c98f5f" {...kst(4)} /><circle cx={48} cy={-120} r={22} fill="#c98f5f" {...kst(4)} />
      <circle cx={0} cy={-80} r={58} fill="#c98f5f" {...kst(5)} /><ellipse cx={0} cy={40} rx={70} ry={80} fill="#c98f5f" {...kst(5)} />
    </Vol>
    <ellipse cx={0} cy={-62} rx={24} ry={18} fill="#f4d19b" /><circle cx={0} cy={-68} r={8} fill={KINK} />
    <circle cx={-20} cy={-92} r={6} fill={KINK} /><circle cx={20} cy={-92} r={6} fill={KINK} />
    {show && <g transform={`translate(0,40) scale(${pulse})`}><HHeart r={44} /></g>}
    <Vol tone="skin"><ellipse cx={-56} cy={30} rx={20} ry={34} fill="#c98f5f" {...kst(4)} transform="rotate(-30 -56 30)" /><ellipse cx={56} cy={30} rx={20} ry={34} fill="#c98f5f" {...kst(4)} transform="rotate(30 56 30)" /></Vol>
  </g>
);
const Piggy: React.FC = () => (
  <g>
    <Vol><ellipse rx={80} ry={60} fill="#ffafcc" {...kst(5)} /><circle cx={-64} cy={-34} r={40} fill="#ffafcc" {...kst(5)} /></Vol>
    <path d="M -84,-70 L -74,-96 L -60,-70 Z" fill="#ffafcc" {...kst(3)} />
    <ellipse cx={-96} cy={-26} rx={18} ry={14} fill="#ff8fab" {...kst(3)} /><circle cx={-100} cy={-26} r={3} fill={KINK} /><circle cx={-92} cy={-26} r={3} fill={KINK} />
    <circle cx={-66} cy={-46} r={5} fill={KINK} />
    {[-40, 40].map((x) => <rect key={x} x={x - 12} y={46} width={24} height={30} rx={8} fill="#ffafcc" {...kst(3)} />)}
  </g>
);
const Cake: React.FC<{ heart: boolean }> = ({ heart }) => (
  <g>
    <Vol><rect x={-110} y={-40} width={220} height={120} rx={20} fill="#ffd6e5" {...kst(5)} /></Vol>
    <path d="M -110,-10 Q -80,20 -50,-10 Q -20,20 10,-10 Q 40,20 70,-10 Q 95,15 110,-10" fill="none" stroke="#ffffff" strokeWidth={14} />
    <rect x={-6} y={-90} width={12} height={50} rx={5} fill="#4cc9f0" {...kst(3)} />
    <path d="M 0,-110 Q 10,-96 0,-90 Q -10,-96 0,-110 Z" fill="#ffca3a" />
    {heart && <g transform="translate(0,30)"><HHeart r={26} face={false} /></g>}
  </g>
);
const Cup: React.FC<{ heart: boolean }> = ({ heart }) => (
  <g>
    <Vol><path d="M -60,-60 L 60,-60 L 48,60 Q 0,74 -48,60 Z" fill="#ffffff" {...kst(5)} /></Vol>
    <path d="M 58,-30 Q 100,-30 96,10 Q 92,40 52,40" fill="none" {...kst(8)} />
    {heart && <g transform="translate(0,0)"><HHeart r={26} face={false} /></g>}
  </g>
);

// one puzzle picture; `show` = the answer heart is still on the picture (not yet flown to the card)
const Scene: React.FC<{ i: number; t: number; show: boolean }> = ({ i, t, show }) => {
  const P = PUZ[i];
  const pulse = t >= P.a ? 1 + 0.18 * Math.sin(Math.min(1, (t - P.a) / 0.7) * Math.PI) : 1;
  const heart = (r = 46, c?: string) => (show ? <g transform={`scale(${pulse})`}><HHeart r={r} c={c} /></g> : null);
  const sway = (k: number, a = 6) => Math.sin(t * 1.6 + k) * a;
  switch (i) {
    case 0: return (
      <g>
        <Grass y={210} />
        <CloudP x={0} y={-220} s={0.7} />
        {[[-300, -150, '#ff6fa5', true], [-110, -60, '#4cc9f0', false], [80, -170, '#8ac926', false], [250, -150, '#ff595e', false], [380, -40, '#ffca3a', false], [-420, -20, '#c77dff', false]].map(([x, y, c, h], k) => (
          <g key={k} transform={`translate(${(x as number) + sway(k, 4)},${(y as number) + sway(k + 2, 6)})`}>
            {h ? (show ? <g transform={`scale(${pulse})`}><BalloonR c="#ff4d6d" heart /></g> : <path d="M 0,60 q 14,40 -6,80" fill="none" {...kst(3)} />) : <BalloonR c={c as string} />}
          </g>
        ))}
      </g>
    );
    case 1: return (
      <g>
        <Grass y={220} />
        <g transform="translate(-400,-210)"><Vol><circle r={50} fill="#ffd23f" {...kst(5)} /></Vol></g>
        <g transform={`translate(-250,-100) scale(0.9)`}><SheepCloud /></g>
        <CloudP x={-20} y={60} s={0.7} />
        <g transform="translate(200,-140)">{show ? <g transform={`scale(${pulse})`}><HHeart r={80} c="#ffffff" /></g> : null}</g>
        <CloudP x={380} y={60} s={0.6} />
      </g>
    );
    case 2: return (
      <g>
        <Grass y={170} c="#b5e48c" />
        {[[-360, -150, '#ffca3a'], [-120, -60, '#4cc9f0'], [100, -180, '#ff924c'], [-280, 120, '#c77dff'], [60, 130, '#8ac926'], [300, -20, '#ff6fa5']].map(([x, y, c], k) => (
          <g key={k} transform={`translate(${(x as number) + sway(k, 10)},${(y as number) + sway(k + 1, 8)}) rotate(${sway(k, 6)})`}>
            {k === 5 ? (show ? <g transform={`scale(${pulse})`}><Butterfly c="#ff6fa5" heart t={t} k={k} /></g> : null) : <Butterfly c={c as string} t={t} k={k} />}
          </g>
        ))}
      </g>
    );
    case 3: return (
      <g>
        <Vol kind="slope"><ellipse cx={0} cy={40} rx={440} ry={230} fill="#ffffff" {...kst(6)} /></Vol>
        <ellipse cx={0} cy={40} rx={380} ry={180} fill="none" stroke="#bde0fe" strokeWidth={10} />
        <g transform="translate(-250,-40)"><Sandwich k={0} /></g>
        <g transform="translate(-120,140)"><Sandwich k={1} /></g>
        <g transform="translate(300,-50)"><Sandwich k={2} /></g>
        {show && <g transform={`translate(130,40) scale(${pulse})`}><Sandwich k={3} /></g>}
      </g>
    );
    case 4: return (
      <g>{Array.from({ length: 9 }).map((_, k) => {
        const x = (k % 3 - 1) * 300;
        const y = (Math.floor(k / 3) - 1) * 170;
        return <g key={k} transform={`translate(${x},${y})`}>{k === 2 ? heart(60, '#ff595e') : <RedShape k={[0, 1, 0, 2, 1, 0, 2, 0, 1][k]} />}</g>;
      })}</g>
    );
    case 5: return (
      <g>
        <Grass y={-200} c="#95d5b2" />
        <Vol kind="slope"><ellipse cx={0} cy={60} rx={460} ry={230} fill="#48cae4" {...kst(6)} /></Vol>
        {[[-300, 0], [-120, 180], [280, -40], [340, 170], [-330, 170]].map(([x, y], k) => <g key={k} transform={`translate(${x},${y})`}><LilyPad r={70} /></g>)}
        {[-420, 420].map((x, k) => <g key={k}>{[0, 1, 2].map((j) => <rect key={j} x={x - 30 + j * 24} y={-260} width={12} height={150} rx={6} fill="#52b788" {...kst(3)} />)}</g>)}
        <g transform="translate(80,110)">
          {show ? <g transform={`scale(${pulse})`}><LilyPad r={90} heart /></g> : <LilyPad r={70} />}
          <g transform="translate(62,-34) scale(0.7)"><Frog /></g>
        </g>
      </g>
    );
    case 6: {
      const rot = 180 * (1 - EASE_INOUT(prog(t, TURN, TURN + 0.8)));
      return (
        <g>
          {[[-330, -150, 0], [-120, -160, 1], [130, -150, 2], [340, -140, 0], [-330, 140, 2], [160, 140, 1], [370, 130, 0]].map(([x, y, k], j) => (
            <g key={j} transform={`translate(${x},${y})`}>
              <Vol>
                {k === 0 && <circle r={56} fill="#c77dff" {...kst(5)} />}
                {k === 1 && <rect x={-52} y={-52} width={104} height={104} rx={10} fill="#4cc9f0" {...kst(5)} />}
                {k === 2 && <path d="M 0,-62 L 58,48 L -58,48 Z" fill="#ffca3a" {...kst(5)} strokeLinejoin="round" />}
              </Vol>
            </g>
          ))}
          {show && <g transform={`translate(-60,40) rotate(${rot}) scale(${pulse})`}><HHeart r={70} /></g>}
          {within(t, TURN - 0.2, TURN + 1.0) && show && <path d="M -170,-60 A 140,140 0 0 1 50,-130" fill="none" stroke="#ff6fa5" strokeWidth={10} strokeDasharray="18 12" markerEnd="" />}
        </g>
      );
    }
    case 7: return (
      <g>
        <Grass y={230} />
        <CloudP x={-60} y={150} s={0.6} />
        {[[-330, -120, '#ff924c'], [-90, -190, '#4cc9f0'], [100, -60, '#8ac926'], [380, -40, '#ffca3a']].map(([x, y, c], k) => (
          <g key={k} transform={`translate(${x},${y}) rotate(${sway(k, 8)})`}><Kite c={c as string} /></g>
        ))}
        <g transform={`translate(250,-140) rotate(${sway(5, 8)})`}>{show ? <g transform={`scale(${pulse})`}><Kite c="#9b5de5" heart /></g> : null}</g>
      </g>
    );
    case 8: return (
      <g>
        <Vol><path d="M -400,200 Q -300,-260 300,-200 Q 420,0 200,220 Q -100,300 -400,200 Z" fill="#52b788" {...kst(6)} /></Vol>
        <path d="M -380,190 Q 0,0 290,-190" fill="none" stroke="#2d6a4f" strokeWidth={8} />
        {[-200, -60, 80].map((x, k) => <path key={k} d={`M ${x},${80 - k * 70} q 40,60 120,60`} fill="none" stroke="#2d6a4f" strokeWidth={5} />)}
        <g transform="translate(100,30) scale(1.3)">
          <Ladybug />
          {show && <g transform={`translate(30,24) scale(${pulse})`}><HHeart r={12} c={KINK} face={false} /></g>}
        </g>
        <g transform="translate(-260,-60) scale(0.9)"><Ladybug /></g>
      </g>
    );
    case 9: return (
      <g>
        <Grass y={170} />
        <g transform="translate(-300,10) scale(0.9)"><House c="#8ecae6" win={0} /></g>
        <g transform="translate(0,20) scale(0.85)"><House c="#c77dff" win={1} /></g>
        <g transform="translate(300,10) scale(0.9)"><House c="#ffd23f" win={show ? 2 : 0} /></g>
      </g>
    );
    case 10: return (
      <g>
        <rect x={-CW / 2} y={150} width={CW} height={160} fill="#d4a373" opacity={0.6} />
        <g transform="translate(120,90)">
          <Vol><rect x={-260} y={-60} width={520} height={200} rx={20} fill="#ff924c" {...kst(6)} /></Vol>
          <rect x={-260} y={-60} width={520} height={30} rx={10} fill="#ffca3a" {...kst(4)} />
          <g transform="translate(-140,-110)"><Vol><circle r={60} fill="#4cc9f0" {...kst(5)} /></Vol><path d="M -60,0 Q 0,30 60,0" fill="none" stroke="#ffffff" strokeWidth={8} /></g>
          {['#ff595e', '#8ac926', '#ffca3a'].map((c, k) => <g key={c} transform={`translate(${40 + k * 70},${-100 - (k === 1 ? 50 : 0)})`}><Vol><rect x={-30} y={-30} width={60} height={60} rx={8} fill={c} {...kst(4)} /></Vol></g>)}
        </g>
        <g transform="translate(-250,-60) scale(1)"><Teddy show={show} pulse={pulse} /></g>
      </g>
    );
    case 11: return (
      <g>
        <g transform="translate(-320,-120) scale(0.9)"><Vol>{[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 34} cy={Math.sin((a * Math.PI) / 180) * 34} r={28} fill="#ff8fab" {...kst(4)} />)}<circle r={20} fill="#ffc2d1" {...kst(4)} /></Vol></g>
        <g transform="translate(-60,-150)"><Cup heart={false} /></g>
        <g transform="translate(-280,150) scale(0.9)"><BalloonR c="#ffafcc" /></g>
        <g transform="translate(240,-170)"><Vol><circle r={60} fill="#ffafcc" {...kst(5)} /></Vol></g>
        <g transform="translate(-40,120)"><Vol><rect x={-70} y={-50} width={140} height={100} rx={18} fill="#ffc2d1" {...kst(5)} /></Vol></g>
        <g transform="translate(140,100)"><Piggy /></g>
        <g transform="translate(330,120)">{heart(50, '#ff8fab')}</g>
      </g>
    );
    default: return null;
  }
};
const SuperScene: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={-CW / 2} y={-CH / 2} width={CW} height={CH} fill="#a0d8ff" />
    <Grass y={-60} />
    <CloudP x={-300} y={-220} s={0.6} />
    <CloudP x={260} y={-230} s={0.5} />
    <g transform="translate(0,170)">
      <path d="M -460,-110 L 460,-110 L 500,140 L -500,140 Z" fill="#ff8fab" {...kst(6)} />
      {[-360, -180, 0, 180, 360].map((x) => <rect key={x} x={x - 40} y={-110} width={80} height={250} fill="#ffffff" opacity={0.55} />)}
      {t < SUPER_AT[2].a + FLY && <g transform="translate(330,30)"><HHeart r={34} face={false} c="#ff4d6d" /></g>}
    </g>
    <g transform="translate(-300,-60)"><Cake heart={t < SUPER_AT[0].a + FLY} /></g>
    <g transform="translate(80,-70)"><Cup heart={t < SUPER_AT[1].a + FLY} /></g>
    <g transform="translate(-80,80)"><Vol><circle r={44} fill="#ff595e" {...kst(4)} /></Vol></g>
    <g transform="translate(200,50) scale(0.8)"><Vol><path d="M -60,0 Q 0,-70 60,0 Q 0,30 -60,0 Z" fill="#ffd23f" {...kst(4)} /></Vol></g>
  </g>
);
// the remember round: a big heart with "bump" "bump" "point" tags
const BumpHeart: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <HHeart r={190} />
    {[[-140, -230, 'BUMP', S('ra1'), '#ff595e'], [140, -230, 'BUMP', S('ra1') + 0.3, '#ff924c'], [0, 250, 'POINT', S('ra2'), '#1982c4']].map(([x, y, txt, at, c], k) => (
      t >= (at as number) && (
        <g key={k} transform={`translate(${x},${y}) scale(${popIn(t, at as number)})`}>
          <rect x={-90} y={-36} width={180} height={64} rx={32} fill={c as string} {...kst(4)} />
          <text y={14} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill="#ffffff">{txt as string}</text>
        </g>
      )
    ))}
  </g>
);

// the friendship card (screen space, top-left): 15 heart slots that fill up
const SLOT = (k: number): [number, number] => [((k % 5) - 2) * 44, Math.floor(k / 5) * 44 - 30];
const FriendCard: React.FC<{ n: number; t: number; big: number }> = ({ n, t, big }) => {
  const x = 150 + (W / 2 - 150) * big;
  const y = 150 + (H * 0.42 - 150) * big;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <g transform={`translate(${x},${y}) scale(${1 + big * 1.9}) rotate(${-3 + Math.sin(t * 2) * big * 2})`}>
        <rect x={-130} y={-96} width={260} height={192} rx={22} fill="#ffffff" {...kst(6)} />
        <rect x={-118} y={-84} width={236} height={168} rx={16} fill="none" stroke="#ff8fab" strokeWidth={4} strokeDasharray="10 7" />
        {Array.from({ length: 15 }).map((_, k) => {
          const [sx, sy] = SLOT(k);
          return k < n
            ? <g key={k} transform={`translate(${sx},${sy}) scale(0.34)`}><HHeart r={52} face={false} c={['#ff4d6d', '#ff6fa5', '#f15bb5', '#ff8fab', '#c9184a'][k % 5]} /></g>
            : <path key={k} d={heartPath(15)} transform={`translate(${sx},${sy})`} fill="none" stroke="#ffc2d1" strokeWidth={3} strokeDasharray="5 4" />;
        })}
        <text y={-60} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={22} fill="#ff4d6d">{big > 0.5 ? 'FOR YOU!' : 'FRIENDSHIP CARD'}</text>
        <g transform="translate(0,118)">
          <rect x={-46} y={-26} width={92} height={50} rx={25} fill="#ff4d6d" {...kst(4)} />
          <text y={12} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={34} fill="#ffffff">{n}</text>
        </g>
      </g>
    </svg>
  );
};

export default function KidsPuzzles069() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const hop = hopAt(t, HOPS, { h: 50 });
  const yay = (k: number) => (within(t, S('super_yay'), E('super_yay') + 0.6) ? Math.abs(Math.sin(t * 7 + k)) * 26 : 0);
  const pi = puzzleAt(t);
  const P = pi >= 0 ? PUZ[pi] : null;
  const cardN = ALL_FOUND.filter((a) => t >= a + FLY).length;
  const big = within(t, CARD0, REM0) ? EASE_INOUT(prog(t, CARD0, CARD0 + 0.7)) * (1 - EASE_INOUT(prog(t, REM0 - 0.7, REM0))) : 0;
  const remPic = t >= REM0 && t < S('chant') - 0.2;
  const outro = t >= S('chant') - 0.2;
  const remWhich = t < S('rq3') - 0.2 ? 'bumps' : t < S('rq4') - 0.2 ? 'p1' : 'p7';
  const boardOn = (P || t >= SUPER0) && !(t >= S('super_yay') + 2 && t < REM0);
  const drawHeart = within(t, S('ch1'), E('ch_a') + 0.5); // the heart drawn in the air

  // the found heart flying to the card (screen space)
  const toScreen = (sx: number, sy: number): [number, number] => [(sx - cam.x) * cam.z + W / 2, (sy - cam.y) * cam.z + H / 2];
  const flying = ALL_FOUND.map((a, k) => ({ a, k })).filter(({ a }) => within(t, a + 0.4, a + FLY));
  const spotOf = (k: number): [number, number] => (k < PUZ.length ? PUZ[k].at : SUPER_AT[k - PUZ.length].at);

  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
        <Backdrop place={PLACE} w={W} h={H} t={t} fx={false} />
        {/* the picture board on its easel */}
        {boardOn && (
          <g transform={`translate(${CARD[0]},${CARD[1]}) scale(${t >= REM0 ? popIn(t, REM0) : t >= SUPER0 ? popIn(t, SUPER0) : pi === 0 ? 1 : popIn(t, S(P!.q) - 0.35)})`}>
            <rect x={-30} y={CH / 2} width={24} height={240} rx={8} fill="#8d5a3b" {...kst(5)} transform="rotate(12)" />
            <rect x={6} y={CH / 2} width={24} height={240} rx={8} fill="#8d5a3b" {...kst(5)} transform="rotate(-12)" />
            <defs><clipPath id="d69card"><rect x={-CW / 2} y={-CH / 2} width={CW} height={CH} rx={36} /></clipPath></defs>
            <rect x={-CW / 2 - 18} y={-CH / 2 - 18} width={CW + 36} height={CH + 36} rx={50} fill="#ff8fab" {...kst(8)} />
            <g clipPath="url(#d69card)">
              <rect x={-CW / 2} y={-CH / 2} width={CW} height={CH} fill={remPic || outro ? '#fff0f6' : t >= SUPER0 ? '#a0d8ff' : P!.bg} />
              {remPic ? (
                remWhich === 'bumps' ? <BumpHeart t={t} />
                  : remWhich === 'p1' ? <Scene i={0} t={t} show />
                    : <g transform="translate(0,0)"><g transform="scale(1.6)"><HHeart r={70} /></g></g>
              ) : outro ? (t >= S('bye') - 0.2 ? <g transform={`scale(${popIn(t, S('bye') - 0.2) * 2.4})`}><HHeart r={80} /></g> : null) : t >= SUPER0 ? <SuperScene t={t} /> : <Scene i={pi} t={t} show={t < (P!.fly ?? P!.a) + 0.4} />}
            </g>
            {/* the answer ring + marks */}
            {P && !remPic && t < SUPER0 && (
              <g>
                {t >= P.a && t < P.a + 2.2 && (
                  <circle cx={P.at[0]} cy={P.at[1]} r={P.ring ?? 100} fill="none" stroke="#ff4d6d" strokeWidth={12} strokeDasharray="22 14"
                    transform={`rotate(${t * 60} ${P.at[0]} ${P.at[1]})`} opacity={1 - prog(t, P.a + 1.8, P.a + 2.2)} />
                )}
                {P.wrong && <AnswerMark t={t} at={E(P.wrong.line) + 0.1} until={P.a + 0.2} ok={false} x={P.wrong.at[0]} y={P.wrong.at[1]} size={0.6} />}
                <AnswerMark t={t} at={P.a + 0.1} until={P.a + 2.2} ok x={P.at[0] + 90} y={P.at[1] - 80} size={0.55} />
              </g>
            )}
            {t >= SUPER0 && !remPic && !outro && SUPER_AT.map((s, k) => t >= s.a && t < s.a + 2.4 && (
              <g key={k} transform={`translate(${s.at[0]},${s.at[1]})`}>
                <circle r={80} fill="none" stroke="#ff4d6d" strokeWidth={10} strokeDasharray="18 12" transform={`rotate(${t * 60})`} />
                <g transform={`translate(70,-70) scale(${popIn(t, s.a)})`}>
                  <circle r={34} fill={['#ff595e', '#ff924c', '#ffca3a'][k]} {...kst(4)} />
                  <text y={13} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill="#ffffff">{k + 1}</text>
                </g>
              </g>
            ))}
            {remPic && remWhich === 'p1' && t >= S('ra3') && <circle cx={PUZ[0].at[0]} cy={PUZ[0].at[1]} r={100} fill="none" stroke="#ff4d6d" strokeWidth={12} strokeDasharray="22 14" />}
          </g>
        )}
        <PlaceLight place={PLACE}>
          <Critter spec={HOOT_HERO} x={X.hoot} y={yAt(X.hoot, CS)} scale={CS} expr={exprAt(t, HOOT_E)} look={lookAt(t, LOOK_R)} mouth={lipSync(VO, 'hoot', t)}
            armL={poseAt(t, HOOT_A)} armR={poseAt(t, HOOT_R)} facing={-1} hop={hop.hop + yay(3)} squash={hop.squash} />
          <Critter spec={BOBO_HERO} x={X.bobo} y={yAt(X.bobo, CS)} scale={CS} expr={exprAt(t, BOBO_E)} look={lookAt(t, LOOK_R)}
            mouth={within(t, word('p4_yay', 7), E('p4_yay') + 0.3) ? 0.5 + 0.5 * Math.sin(t * 16) : lipSync(VO, 'bobo', t)}
            armL={poseAt(t, BOBO_A)} armR={poseAt(t, BOBO_A)} facing={-1} hop={hop.hop + yay(2)} squash={hop.squash}
            holdR={within(t, S('p4_yay'), word('p4_yay', 7)) ? <g transform="scale(0.5)"><Sandwich k={2} /></g> : undefined} />
          <Kid spec={LEO_HERO} x={X.leo} y={yAt(X.leo, KS)} scale={KS} expr={exprAt(t, LEO_E)} look={lookAt(t, LOOK_L)} mouth={lipSync(VO, 'leo', t)}
            armL={poseAt(t, LEO_L)} armR={poseAt(t, LEO_R)} hop={hop.hop + yay(1)} squash={hop.squash} />
          <Kid spec={MILA_HERO} x={X.mila} y={yAt(X.mila, KS)} scale={KS} expr={exprAt(t, MILA_E)} look={lookAt(t, LOOK_L)} mouth={lipSync(VO, 'mila', t)}
            armL={poseAt(t, MILA_L)} armR={poseAt(t, MILA_R)} hop={hop.hop + yay(0)} squash={hop.squash} />
        </PlaceLight>
        <StageWord t={t} at={word('p4_yay', 7)} until={E('p4_yay') + 0.3} text="MUNCH!" x={X.bobo - 80} y={yAt(X.bobo, CS) - 520} size={80} color="#d4a373" rot={5} />
        <StageWord t={t} at={word('p2_no', 7)} until={E('p2_no') + 0.4} text="BAA!" x={X.bobo - 60} y={yAt(X.bobo, CS) - 520} size={80} color="#ffffff" rot={-6} />
        <Reaction kind="?" t={t} at={E('p1_leo') + 0.1} until={S('p1_a')} x={X.leo} y={yAt(X.leo, KS) - 460} s={0.5} />
        <Reaction kind="sweat" t={t} at={S('p2_yay')} until={E('p2_yay')} x={X.leo + 60} y={yAt(X.leo, KS) - 380} s={0.5} />
        <Reaction kind="!" t={t} at={S('p4_stop')} until={E('p4_stop')} x={X.bobo} y={yAt(X.bobo, CS) - 460} s={0.55} />
        <Reaction kind="stars" t={t} at={S('p6_a')} until={E('p6_yay')} x={X.leo} y={yAt(X.leo, KS) - 460} s={0.55} />
        <Reaction kind="?" t={t} at={S('p7_leo')} until={E('p7_leo') + 0.3} x={X.leo} y={yAt(X.leo, KS) - 460} s={0.5} />
        <Reaction kind="heart" t={t} at={S('p11_yay')} until={E('p11_yay') + 0.4} x={X.bobo} y={yAt(X.bobo, CS) - 460} s={0.55} />
        <Reaction kind="!" t={t} at={S('card_q')} until={E('card_q')} x={X.leo} y={yAt(X.leo, KS) - 460} s={0.55} />
        <Reaction kind="heart" t={t} at={S('card_b')} until={E('card_b') + 1} x={X.bobo} y={yAt(X.bobo, CS) - 460} s={0.6} />
      </ActionStage>

      {/* screen-space */}
      <FriendCard n={cardN} t={t} big={big} />
      {flying.map(({ a, k }) => {
        const [sx, sy] = toScreen(CARD[0] + spotOf(k)[0], CARD[1] + spotOf(k)[1]);
        const [cx, cy] = SLOT(k);
        const tx = 150 + cx;
        const ty = 150 + cy;
        const p = EASE_INOUT(prog(t, a + 0.4, a + FLY));
        const x = sx + (tx - sx) * p;
        const y = sy + (ty - sy) * p - Math.sin(p * Math.PI) * 160;
        return (
          <AbsoluteFill key={k}>
            <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
              <g transform={`translate(${x},${y}) scale(${1 - p * 0.65}) rotate(${Math.sin(p * Math.PI) * 30})`}><HHeart r={50} /></g>
            </svg>
          </AbsoluteFill>
        );
      })}
      {drawHeart && (
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <g transform="translate(960,400)">
            {(() => {
              // bump (left lobe) · bump (right lobe) · point — drawn on the chant words
              const p1 = prog(t, S('ch1'), E('ch1') + 0.3);
              const p2 = prog(t, S('ch2'), E('ch2') + 0.3);
              const p3 = prog(t, S('ch3'), E('ch3') + 0.3);
              const r = 170;
              const L = `M 0,${-0.4 * r} C ${-0.95 * r},${-1.0 * r} ${-1.35 * r},${0.1 * r} 0,${0.95 * r}`;
              const R = `M 0,${-0.4 * r} C ${0.95 * r},${-1.0 * r} ${1.35 * r},${0.1 * r} 0,${0.95 * r}`;
              const full = t >= S('ch4');
              return (
                <g>
                  {full && <g transform={`scale(${popIn(t, S('ch4'))})`}><HHeart r={r} /></g>}
                  {!full && <path d={L} fill="none" stroke="#ff4d6d" strokeWidth={22} strokeLinecap="round" pathLength={1} strokeDasharray={`${p1 * 0.8 + p3 * 0.2} 1`} />}
                  {!full && <path d={R} fill="none" stroke="#ff6fa5" strokeWidth={22} strokeLinecap="round" pathLength={1} strokeDasharray={`${p2 * 0.8 + p3 * 0.2} 1`} />}
                </g>
              );
            })()}
          </g>
        </svg>
      )}
      <PopText t={t} at={0.4} until={S('p1_leo') - 0.1} text="FIND THE HIDDEN HEART!" y={90} size={92} color="#ff4d6d" />
      {PUZ.map((p, k) => (
        <React.Fragment key={k}>
          {k > 0 && <PopText t={t} at={S(p.q)} until={beat(E(p.q) + 0.1)} text={`PUZZLE ${k + 1}`} y={90} size={90} color="#ffffff" />}
          <ThinkTimer t={t} from={beat(E(p.q) + 0.1)} to={VO[K[p.q] + 1].start - 0.1} x={1780} y={170} r={84} />
        </React.Fragment>
      ))}
      <PopText t={t} at={S('premise')} until={S('trick') - 0.1} text="12 HIDDEN HEARTS!" y={90} size={110} color="#ff4d6d" />
      <PopText t={t} at={S('trick')} until={S('p2') - 0.1} text="BUMP · BUMP · POINT!" y={90} size={100} color="#ffffff" />
      <PopText t={t} at={S('p3_fact')} until={S('p4') - 0.1} text="THEY TASTE WITH THEIR FEET!" y={90} size={76} color="#ffca3a" />
      <PopText t={t} at={S('p5_no')} until={S('p5_a') - 0.1} text="A POINT + 2 BUMPS!" y={90} size={100} color="#ff4d6d" />
      <PopText t={t} at={S('p7_fact')} until={S('p8') - 0.1} text="STILL A HEART!" y={90} size={110} color="#c77dff" />
      <PopText t={t} at={S('p12_yay')} until={S('super') - 0.1} text="12 HEARTS!" y={90} size={120} color="#ff4d6d" />
      <PopText t={t} at={S('super')} until={beat(E('super') + 0.1)} text="💖 SUPER PUZZLE 💖" y={90} size={100} color="#ff6fa5" />
      <ThinkTimer t={t} from={beat(E('super') + 0.1)} to={S('s1') - 0.1} x={1780} y={170} r={84} />
      <PopText t={t} at={S('super_yay')} until={CARD0} text="15 HEARTS! SUPER FINDERS!" y={90} size={90} color="#ff4d6d" />
      <PopText t={t} at={S('rem')} until={S('rq1') - 0.1} text="LET'S REMEMBER!" y={90} size={110} color="#ffca3a" />
      {(['rq1', 'rq2', 'rq3', 'rq4'] as const).map((q, k) => (
        <ThinkTimer key={q} t={t} from={beat(E(q) + 0.1)} to={S((['ra1', 'ra2', 'ra3', 'ra4'] as const)[k]) - 0.1} x={1780} y={170} r={84} />
      ))}
      <PopText t={t} at={S('ra1')} until={S('rq2') - 0.2} text="TWO ROUND BUMPS!" y={90} size={100} color="#ff595e" />
      <PopText t={t} at={S('ra2')} until={S('rq3') - 0.2} text="ONE LITTLE POINT!" y={90} size={100} color="#1982c4" />
      <PopText t={t} at={S('ra3')} until={S('rq4') - 0.2} text="ON A BALLOON!" y={90} size={110} color="#ff6fa5" />
      <PopText t={t} at={S('ra4')} until={S('chant') - 0.2} text="STILL A HEART!" y={90} size={110} color="#c77dff" />
      <PopText t={t} at={S('chant')} until={S('ch1') - 0.05} text="DRAW A HEART!" y={90} size={110} color="#ffffff" />
      <PopText t={t} at={S('ch1')} until={S('ch2') - 0.05} text="BUMP!" y={90} size={130} color="#ff595e" />
      <PopText t={t} at={S('ch2')} until={S('ch3') - 0.05} text="BUMP!" y={90} size={130} color="#ff6fa5" />
      <PopText t={t} at={S('ch3')} until={S('ch4') - 0.05} text="POINT!" y={90} size={130} color="#1982c4" />
      <PopText t={t} at={S('ch4')} until={S('ch_turn') - 0.1} text="A HEART!" y={90} size={130} color="#ff4d6d" />
      <PopText t={t} at={S('ch_turn')} until={S('bye') - 0.1} text="YOUR TURN! ☝️" y={90} size={110} color="#ffffff" />
      <PopText t={t} at={S('bye')} until={END_IRIS} text="SEE YOU NEXT TIME!" y={90} size={100} color="#ff6fa5" />
      <Confetti t={t} at={PUZ[0].a + FLY} y={420} />
      <Confetti t={t} at={S('p6_yay')} y={420} />
      <Confetti t={t} at={S('p12_yay') + 0.4} y={420} />
      <Confetti t={t} at={S('super_yay')} y={420} />
      <Confetti t={t} at={S('card') + 0.6} y={420} />
      <Confetti t={t} at={S('ch4')} y={420} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <StarWipe t={t} at={END_IRIS} dur={0.5} hold={5} color="#ff6fa5" x={W / 2} y={H * 0.45} />
    </>
  );
}
