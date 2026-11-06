// TINY SPARKS · Day 62 · 🧩 Puzzles #9 — "Find the Hidden Star" (LONG 16:9)
// kids-shorts/tiny-sparks/puzzles/day-062-find-the-hidden-star. Cues from VO via K (keys.gen.ts).
// COLD OPEN (no ident): puzzle 1 is already on the classroom board at frame 0 ("A little star is hiding!") → think timer →
// Leo ✗ (the sky) → Mila ✓ (in the tree) → the star flies into the STAR JAR → premise (12 stars are hiding) + the finder's
// trick "look up, look down, look all around!" → 12 puzzles, easy → harder: the clouds (Leo ✗ the sun) · flowers (5
// points) · Bobo's honey pots (Leo ✗ red) · shapes · the night sky (Leo finds one) · under the sea (a sea star — an animal)
// · the sleepy star · the biggest star · the cookie plate (Bobo nearly eats it) · the bedroom (under the bed) · all yellow
// → the SUPER puzzle: 3 stars in the park (count them) → 15 stars → remember (4) → chant → bye + star iris.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Kid, kidFaceAt, type KArm } from '../../lib/kids/kid';
import { Critter, critterFaceAt, type CArm } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, HOOT_HERO, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { Backdrop, PlaceLight, standY } from '../../lib/kids/places';
import { AnswerMark, Apple, Confetti, FONT_TOON, KidsCaptions, PopText, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, Reaction, StageWord, StarWipe, directorCam, hopAt, onBeat, type Shot } from '../../lib/kids/energy';
import { exprAt, lookAt, poseAt, type Keys } from '../../lib/kids/smooth';
import { voKeys, wordHops, type Span } from '../../lib/kids/cues';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsPuzzles062', durationInSeconds: 338.3, fps: 30, width: 1920, height: 1080 };

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
const PLACE = 'classroom' as const;
const KS = 0.5;
const CS = 0.52;
const X = { leo: 170, mila: 360, bobo: 1560, hoot: 1760 };
const yAt = (x: number, s: number) => standY(PLACE, x, W, H, { halfW: 150 * s });
const CARD: [number, number] = [960, 420];
const CW = 1000;
const CH = 600;

// ── the puzzles: [question line, answer moment, answer spot (card coords), wrong try (line, spot)]
type Puz = { q: Key; a: number; at: [number, number]; wrong?: { line: Key; at: [number, number] }; bg: string };
const PUZ: Puz[] = [
  { q: 'p1', a: S('p1_a') + 0.3, at: [-305, -215], wrong: { line: 'p1_leo', at: [250, -220] }, bg: '#bde0fe' },
  { q: 'p2', a: S('p2_a') + 0.3, at: [150, -178], wrong: { line: 'p2_leo', at: [-320, -170] }, bg: '#a0d8ff' },
  { q: 'p3', a: S('p3_a') + 0.2, at: [300, 0], bg: '#d8f3dc' },
  { q: 'p4', a: S('p4_a') + 0.3, at: [0, 10], wrong: { line: 'p4_leo', at: [-300, 60] }, bg: '#fff1e6' },
  { q: 'p5', a: S('p5_a') + 0.5, at: [300, -170], bg: '#e7f5ff' },
  { q: 'p6', a: S('p6_a') + 0.2, at: [60, -200], bg: '#1d2a5a' },
  { q: 'p7', a: S('p7_a') + 0.3, at: [230, 200], bg: '#48cae4' },
  { q: 'p8', a: S('p8_a') + 0.3, at: [80, 130], bg: '#f3e8ff' },
  { q: 'p9', a: S('p9_a') + 0.3, at: [-60, 10], bg: '#fff8e7' },
  { q: 'p10', a: word('p10_stop', 9), at: [140, -10], bg: '#ffe5d9' },
  { q: 'p11', a: S('p11_a') + 0.3, at: [60, 225], bg: '#e9e4ff' },
  { q: 'p12', a: S('p12_a') + 0.3, at: [340, 60], bg: '#e9f5db' },
];
const SUPER_AT: { a: number; at: [number, number] }[] = [
  { a: S('s1'), at: [-395, -195] }, { a: S('s2'), at: [190, -200] }, { a: S('s3'), at: [390, 210] },
];
const SUPER0 = S('super') - 0.3;
const REM0 = S('rem') - 0.3;
const FLY = 0.9; // the found star flies to the jar
const ALL_FOUND = [...PUZ.map((p) => p.a), ...SUPER_AT.map((s) => s.a)];
const puzzleAt = (t: number) => {
  if (t >= SUPER0) return -1;
  let i = 0;
  for (let j = 0; j < PUZ.length; j++) if (t >= S(PUZ[j].q) - 0.35) i = j;
  return i;
};
const END_IRIS = E('bye2') + 0.6;

// ── arms, faces, eyes
const CHANT: Span<KArm> = [S('ch1'), E('ch_a') + 0.3, 'cheer'];
const BYE: Span<KArm> = [S('bye'), 999, 'wave'];
const ans = (k: Key): Span<KArm> => [S(k), E(k) + 0.3, 'point'];
const MILA_R = voKeys<KArm>(VO, 'mila', 'present', 'down', [
  ans('p1_a'), ans('p2_a'), ans('p3_a'), ans('p4_a'), ans('p5_a'), ans('p7_a'), ans('p8_a'), ans('p10_stop'), ans('p12_a'), ans('s1'),
  [S('ra4'), E('ra4'), 'cheer'], CHANT, BYE,
]);
const MILA_L = voKeys<KArm>(VO, null, 'down', 'down', [[S('p8_a') + 1.6, E('p8_a') + 0.4, 'cover'], CHANT, BYE]);
const MILA_E = voKeys<KExpr>(VO, 'mila', 'happy', 'smile', [[S('p8_a'), E('p8_a'), 'wink'], [S('p10_yay'), E('p10_yay'), 'laugh'], [S('super_yay'), E('super_yay') + 1, 'laugh'], [S('ch1'), 999, 'laugh']]);
const LEO_R = voKeys<KArm>(VO, 'leo', 'present', 'down', [
  ans('p1_leo'), ans('p2_leo'), ans('p4_leo'), ans('p6_a'), [S('p6_leo'), E('p6_leo') + 0.3, 'cheer'], ans('p9_a'), ans('p11_a'), ans('s2'),
  [S('p2_yay'), word('p2_yay', 2), 'cheeks'], [S('ra1'), E('ra1'), 'cheer'], CHANT, BYE,
]);
const LEO_L = voKeys<KArm>(VO, null, 'down', 'down', [[S('p2_yay'), word('p2_yay', 2), 'cheeks'], [S('p6_leo'), E('p6_leo') + 0.3, 'cheer'], CHANT, BYE]);
const wrongFace = (k: Key, next: Key): Span<KExpr> => [E(k), S(next) + 0.6, 'oops'];
const LEO_E = voKeys<KExpr>(VO, 'leo', 'happy', 'smile', [
  [S('p1_leo'), E('p1_leo'), 'proud'], wrongFace('p1_leo', 'p1_a'), [S('p2_leo'), E('p2_leo'), 'proud'], wrongFace('p2_leo', 'p2_a'),
  [S('p2_yay'), E('p2_yay'), 'laugh'], [S('p4_leo'), E('p4_leo'), 'proud'], wrongFace('p4_leo', 'p4_a'),
  [S('p6_leo'), E('p6_leo') + 0.6, 'laugh'], [S('jar_q'), E('jar_q'), 'wow'], [S('super_yay'), E('super_yay') + 1, 'laugh'], [S('ch1'), 999, 'laugh'],
]);
const BOBO_A = voKeys<CArm>(VO, 'bobo', 'wave', 'down', [
  [S('p4'), E('p4'), 'point'], [S('p4_no'), E('p4_no'), 'cheeks'], [S('p8_zzz'), E('p8_zzz') + 0.4, 'cheeks'],
  [S('p10_bobo'), E('p10_bobo'), 'hold'], [S('p10_yay'), E('p10_yay'), 'cheeks'], [S('s3'), E('s3'), 'point'],
  [S('ra3'), E('ra3'), 'cheeks'], [S('ch1'), E('ch_a') + 0.3, 'cheer'], [S('bye'), 999, 'wave'],
]);
const BOBO_E = voKeys<KExpr>(VO, 'bobo', 'happy', 'smile', [
  [S('p4_no'), E('p4_no'), 'laugh'], [S('p8_zzz'), E('p8_zzz') + 0.4, 'sleepy'], [S('p10_bobo'), E('p10_bobo'), 'laugh'],
  [S('p10_stop'), E('p10_stop'), 'surprised'], [S('p10_yay'), E('p10_yay'), 'oops'], [S('super_yay'), E('super_yay') + 1, 'laugh'], [S('ch1'), 999, 'laugh'],
]);
const HOOT_A = voKeys<CArm>(VO, 'hoot', 'point', 'down', [[S('ch1'), E('ch_a') + 0.3, 'cheer'], [S('bye'), 999, 'wave']]);
const HOOT_R = voKeys<CArm>(VO, null, 'down', 'down', [[S('ch1'), E('ch_a') + 0.3, 'cheer'], [S('bye'), 999, 'wave']]);
const HOOT_E = voKeys<KExpr>(VO, 'hoot', 'happy', 'smile', [[S('super_yay'), E('super_yay') + 1, 'laugh'], [S('ch1'), 999, 'laugh']]);
// eyes: at the board, except the trick + the chant (look up · down · all around)
const lookSeq = (k: Key, base: [number, number]): Keys<[number, number]> => {
  const w = timeWords(VO[K[k]]);
  return [[w[0].start, [0, -1]], [w[Math.min(2, w.length - 1)].start, [0, 0.9]], [w[Math.min(4, w.length - 1)].start, [-0.9, 0]], [E(k), [0.9, 0]], [E(k) + 0.5, base]];
};
const looks = (base: [number, number]): Keys<[number, number]> => [
  [0, base], ...lookSeq('trick_b', base), ...lookSeq('ra4', base),
  [S('ch1'), [0, -1]], [S('ch2'), [0, 0.9]], [S('ch3'), [-0.9, 0]], [S('ch3') + 0.6, [0.9, 0]], [S('ch4'), [0, 0]], [E('ch_a'), base],
];
const LOOK_L = looks([0.6, -0.3]);
const LOOK_R = looks([-0.6, -0.3]);
const HOPS = [...wordHops(VO, [K.ch1, K.ch2, K.ch3, K.ch4]), E('p6_leo') - 0.6, S('super_yay') + 0.2, E('ch_a')];

// ── camera
const WIDE = { z: 1.0, x: 960, y: 540 };
const BOARD = { z: 1.12, x: 960, y: 455 };
const kFace = (x: number) => kidFaceAt(x, yAt(x, KS), KS)[1] + 70;
const cFace = (x: number) => critterFaceAt(x, yAt(x, CS), CS)[1] + 70;
const SHOTS: Shot[] = [
  { t: 0, ...BOARD, move: 'cut', push: 0.01 },
  { t: S('p1_leo') - 0.1, z: 1.55, x: X.leo + 120, y: kFace(X.leo), move: 'whip' },
  { t: S('p1_no') - 0.1, ...BOARD, move: 'whip' },
  { t: S('premise') - 0.2, ...WIDE, move: 'smooth', dur: 0.8, push: 0.01 },
  { t: S('trick_b') - 0.1, z: 1.4, x: X.bobo - 60, y: cFace(X.bobo), move: 'snap' },
  { t: S('p2') - 0.2, ...BOARD, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('p2_yay') - 0.1, z: 1.55, x: X.leo + 120, y: kFace(X.leo), move: 'snap' },
  { t: S('p3') - 0.2, ...BOARD, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('p4') - 0.1, z: 1.45, x: X.bobo - 80, y: cFace(X.bobo), move: 'snap' },
  { t: E('p4') + 0.1, ...BOARD, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('p5') - 0.2, ...BOARD, move: 'cut', push: 0.01 },
  { t: S('p6') - 0.2, ...BOARD, move: 'cut', push: 0.01 },
  { t: S('p6_leo') - 0.1, z: 1.55, x: X.leo + 120, y: kFace(X.leo), move: 'snap' },
  { t: S('p7') - 0.2, ...BOARD, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('p8') - 0.2, ...BOARD, move: 'cut', push: 0.01 },
  { t: S('p8_zzz') - 0.1, z: 1.45, x: X.bobo - 80, y: cFace(X.bobo), move: 'snap' },
  { t: S('p9') - 0.2, ...BOARD, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('p10') - 0.2, ...BOARD, move: 'cut', push: 0.01 },
  { t: S('p10_bobo') - 0.1, z: 1.45, x: X.bobo - 80, y: cFace(X.bobo), move: 'whip' },
  { t: S('p10_stop') - 0.1, ...BOARD, move: 'whip' },
  { t: S('p10_yay') - 0.1, z: 1.45, x: X.bobo - 80, y: cFace(X.bobo), move: 'snap' },
  { t: S('p11') - 0.2, ...BOARD, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('p12') - 0.2, ...BOARD, move: 'cut', push: 0.01 },
  { t: S('jar_q') - 0.1, z: 1.55, x: X.leo + 120, y: kFace(X.leo), move: 'snap' },
  { t: SUPER0, ...BOARD, move: 'smooth', dur: 0.8, push: 0.015 },
  { t: S('super_yay') - 0.2, ...WIDE, move: 'smooth', dur: 0.8, push: 0.01 },
  { t: REM0, ...BOARD, move: 'smooth', dur: 0.6, push: 0.006 },
  { t: S('ra3') - 0.1, z: 1.45, x: X.bobo - 80, y: cFace(X.bobo), move: 'snap' },
  { t: E('ra3') + 0.6, ...BOARD, move: 'smooth', dur: 0.6 },
  { t: S('ra4') - 0.2, ...WIDE, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('ch1') - 0.1, z: 1.06, x: 960, y: 560, move: 'smooth', dur: 0.6, push: 0.02 },
  { t: S('bye') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
];
SHOTS.sort((a, b) => a.t - b.t);
const PUNCHES = ALL_FOUND;

// ── drawings (card coords)
const starPath = (r: number, ri = r * 0.48) =>
  Array.from({ length: 10 }).map((_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? ri : r;
    return `${i ? 'L' : 'M'} ${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`;
  }).join(' ') + ' Z';
const HStar: React.FC<{ r?: number; sleepy?: boolean; c?: string; face?: boolean; t?: number }> = ({ r = 56, sleepy, c = '#ffd23f', face = true, t = 0 }) => (
  <g>
    <Vol><path d={starPath(r)} fill={c} {...kst(5)} strokeLinejoin="round" /></Vol>
    {face && (
      <g transform={`scale(${r / 56})`}>
        {sleepy ? (
          <g><path d="M -20,-4 Q -13,2 -6,-4 M 6,-4 Q 13,2 20,-4" fill="none" {...kst(3.5)} />
            <text x={34} y={-34 - ((t * 20) % 14)} fontFamily={FONT_TOON} fontWeight={700} fontSize={22} fill="#7b2cbf" opacity={0.85}>z</text></g>
        ) : (
          <g><ellipse cx={-12} cy={-4} rx={5} ry={7} fill={KINK} /><ellipse cx={12} cy={-4} rx={5} ry={7} fill={KINK} />
            <circle cx={-10} cy={-7} r={2} fill="#ffffff" /><circle cx={14} cy={-7} r={2} fill="#ffffff" /></g>
        )}
        <path d="M -8,10 Q 0,17 8,10" fill="none" {...kst(3.5)} />
        <ellipse cx={-22} cy={8} rx={6} ry={4} fill="#ff8fab" opacity={0.6} /><ellipse cx={22} cy={8} rx={6} ry={4} fill="#ff8fab" opacity={0.6} />
      </g>
    )}
  </g>
);
const Leaf: React.FC<{ x: number; y: number; r: number; c: string }> = ({ x, y, r, c }) => <Vol><circle cx={x} cy={y} r={r} fill={c} {...kst(5)} /></Vol>;
const CloudP: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <Vol><path d="M -110,30 Q -140,30 -140,0 Q -140,-36 -100,-38 Q -90,-80 -40,-80 Q -10,-110 40,-90 Q 90,-100 100,-50 Q 140,-44 140,-6 Q 140,30 110,30 Z" fill="#ffffff" {...kst(5)} /></Vol>
  </g>
);
const Flower: React.FC<{ c: string }> = ({ c }) => (
  <g>
    <rect x={-5} y={10} width={10} height={70} rx={5} fill="#52b788" {...kst(3)} />
    <Vol>{[0, 60, 120, 180, 240, 300].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 30} cy={Math.sin((a * Math.PI) / 180) * 30} r={24} fill={c} {...kst(4)} />)}</Vol>
    <Vol><circle r={18} fill="#ffd23f" {...kst(4)} /></Vol>
  </g>
);
const Pot: React.FC<{ c: string }> = ({ c }) => (
  <g>
    <Vol><path d="M -90,-60 Q -120,40 -70,90 L 70,90 Q 120,40 90,-60 Z" fill={c} {...kst(6)} /></Vol>
    <Vol><rect x={-100} y={-84} width={200} height={34} rx={16} fill={c} {...kst(6)} /></Vol>
    <rect x={-50} y={-10} width={100} height={50} rx={10} fill="#ffffff" opacity={0.85} {...kst(3)} />
    <text y={24} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={30} fill="#e8a317">HONEY</text>
  </g>
);
const Shape: React.FC<{ k: number }> = ({ k }) => (
  <Vol>
    {k === 0 && <circle r={62} fill="#ffd23f" {...kst(5)} />}
    {k === 1 && <rect x={-58} y={-58} width={116} height={116} rx={10} fill="#ffd23f" {...kst(5)} />}
    {k === 2 && <path d="M 0,-66 L 64,52 L -64,52 Z" fill="#ffd23f" {...kst(5)} strokeLinejoin="round" />}
  </Vol>
);
const Moon: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}><path d="M 10,-40 A 40,40 0 1 0 30,20 A 32,32 0 1 1 10,-40 Z" fill="#fff3b0" {...kst(4)} /></g>
);
const Fish: React.FC<{ c: string; flip?: boolean }> = ({ c, flip }) => (
  <g transform={flip ? 'scale(-1,1)' : undefined}>
    <Vol><ellipse rx={56} ry={34} fill={c} {...kst(5)} /><path d="M 50,0 L 90,-28 L 90,28 Z" fill={c} {...kst(5)} strokeLinejoin="round" /></Vol>
    <circle cx={-26} cy={-6} r={8} fill="#ffffff" {...kst(2)} /><circle cx={-28} cy={-6} r={4} fill={KINK} />
  </g>
);
const SeaStar: React.FC = () => (
  <g>
    <Vol><path d={starPath(62, 26)} fill="#ff8c69" {...kst(5)} strokeLinejoin="round" /></Vol>
    {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={Math.cos(-Math.PI / 2 + (i * 2 * Math.PI) / 5) * 34} cy={Math.sin(-Math.PI / 2 + (i * 2 * Math.PI) / 5) * 34} r={5} fill="#ffd6a5" />)}
    <circle cx={-8} cy={-4} r={4} fill={KINK} /><circle cx={8} cy={-4} r={4} fill={KINK} /><path d="M -6,8 Q 0,13 6,8" fill="none" {...kst(3)} />
  </g>
);
const Cookie: React.FC<{ star?: boolean }> = ({ star }) => (
  <g>
    <Vol>{star ? <path d={starPath(60, 30)} fill="#d4a373" {...kst(5)} strokeLinejoin="round" /> : <circle r={52} fill="#d4a373" {...kst(5)} />}</Vol>
    {[[-14, -10], [14, 6], [-4, 18], [16, -18]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5} fill="#6f4518" />)}
  </g>
);
const Lemon: React.FC = () => <Vol><ellipse rx={70} ry={50} fill="#ffd23f" {...kst(5)} /><circle cx={70} cy={0} r={10} fill="#ffd23f" {...kst(4)} /></Vol>;
const Banana: React.FC = () => <Vol><path d="M -100,-30 Q 0,120 100,-40 Q 60,50 0,50 Q -60,50 -100,-30 Z" fill="#ffd23f" {...kst(5)} /></Vol>;
const Duck: React.FC = () => (
  <g>
    <Vol><ellipse cx={0} cy={20} rx={80} ry={50} fill="#ffd23f" {...kst(5)} /><circle cx={-50} cy={-40} r={40} fill="#ffd23f" {...kst(5)} /></Vol>
    <path d="M -86,-36 L -116,-30 L -86,-22 Z" fill="#ff924c" {...kst(3)} /><circle cx={-58} cy={-48} r={6} fill={KINK} />
  </g>
);
const Kite: React.FC<{ star?: boolean }> = ({ star }) => (
  <g>
    <Vol><path d="M 0,-80 L 60,0 L 0,90 L -60,0 Z" fill="#4cc9f0" {...kst(5)} /></Vol>
    <path d="M 0,90 q 20,40 0,70 q -20,30 0,60" fill="none" {...kst(3)} />
    {star && <g transform="scale(0.45)"><HStar face={false} /></g>}
  </g>
);

// one puzzle picture; `hide` = the star(s) already flown to the jar; `glow` = the answer is pulsing
const Scene: React.FC<{ i: number; t: number; hide: number }> = ({ i, t, hide }) => {
  const P = PUZ[i];
  const pulse = (a: number) => (t >= a ? 1 + 0.18 * Math.sin(Math.min(1, (t - a) / 0.7) * Math.PI) : 1);
  const show = hide === 0;
  const theStar = (r = 46, extra?: { sleepy?: boolean }) => (show ? <g transform={`scale(${pulse(P?.a ?? 0)})`}><HStar r={r} t={t} {...extra} /></g> : null);
  switch (i) {
    case 0: return (
      <g>
        <rect x={-CW / 2} y={140} width={CW} height={200} fill="#8ac926" />
        <g transform="translate(380,-200)"><circle r={60} fill="#ffd23f" {...kst(5)} /></g>
        <CloudP x={150} y={-200} s={0.8} />
        <g transform="translate(-210,0)">
          <Vol kind="tube"><rect x={-30} y={-40} width={60} height={200} rx={20} fill="#8d5a3b" {...kst(6)} /></Vol>
          <Leaf x={-80} y={-90} r={100} c="#52b788" /><Leaf x={90} y={-100} r={100} c="#40916c" />
          <g transform="translate(-95,-215)">{theStar(44)}</g>
          <Leaf x={0} y={-180} r={70} c="#74c69d" /><Leaf x={-40} y={-120} r={46} c="#52b788" /><Leaf x={46} y={-118} r={44} c="#74c69d" />
        </g>
        <g transform="translate(250,140)"><Flower c="#ff6fa5" /></g>
      </g>
    );
    case 1: return (
      <g>
        <rect x={-CW / 2} y={200} width={CW} height={140} fill="#8ac926" />
        <g transform="translate(-320,-170)">{Array.from({ length: 10 }).map((_, k) => <rect key={k} x={-5} y={-92} width={10} height={20} rx={5} fill="#ffca3a" transform={`rotate(${k * 36 + t * 10})`} />)}<Vol><circle r={66} fill="#ffd23f" {...kst(5)} /></Vol></g>
        <CloudP x={-90} y={-60} s={0.9} />
        <g transform="translate(150,-178)">{theStar(46)}</g>
        <CloudP x={150} y={-40} s={1.1} />
        <CloudP x={360} y={-150} s={0.8} />
      </g>
    );
    case 2: return (
      <g>{Array.from({ length: 9 }).map((_, k) => {
        const x = (k % 3 - 1) * 300;
        const y = (Math.floor(k / 3) - 1) * 170 - 20;
        return <g key={k} transform={`translate(${x},${y}) scale(0.9)`}>{k === 5 ? <g transform="translate(0,20)">{theStar(56)}</g> : <Flower c={['#ff6fa5', '#ffca3a', '#c77dff', '#ff924c', '#4cc9f0', '', '#ff595e', '#ffd23f', '#ff6fa5'][k]} />}</g>;
      })}</g>
    );
    case 3: return (
      <g>
        <rect x={-CW / 2} y={170} width={CW} height={170} fill="#e6ccb2" />
        {['#ff595e', '#1982c4', '#52b788'].map((c, k) => (
          <g key={c} transform={`translate(${(k - 1) * 300},${80})`}>
            {k === 1 && <g transform="translate(0,-110) rotate(-12)">{theStar(44)}</g>}
            <Pot c={c} />
          </g>
        ))}
      </g>
    );
    case 4: return (
      <g>{Array.from({ length: 9 }).map((_, k) => {
        const x = (k % 3 - 1) * 300;
        const y = (Math.floor(k / 3) - 1) * 170;
        return <g key={k} transform={`translate(${x},${y})`}>{k === 2 ? <g transform="translate(0,0)">{theStar(62, {})}</g> : <Shape k={[0, 1, 0, 2, 1, 2, 1, 0, 2][k]} />}</g>;
      })}</g>
    );
    case 5: return (
      <g>
        {Array.from({ length: 30 }).map((_, k) => <circle key={k} cx={-CW / 2 + ((k * 263) % CW)} cy={-CH / 2 + ((k * 131) % CH)} r={2} fill="#ffffff" opacity={0.3} />)}
        {[[-360, -180], [-180, -60], [-330, 150], [250, -170], [380, 40], [180, 170], [-40, 120], [-150, 220]].map(([x, y], k) => (
          <g key={k} transform={`translate(${x},${y}) rotate(${k * 25})`}><Moon s={0.95} /></g>
        ))}
        <g transform="translate(60,-200)">{theStar(42)}</g>
      </g>
    );
    case 6: return (
      <g>
        <rect x={-CW / 2} y={190} width={CW} height={150} fill="#ffe8a3" />
        {[[-330, -160, '#ff924c'], [-80, -40, '#c77dff'], [260, -170, '#ffca3a'], [-260, 90, '#ff6fa5'], [140, 60, '#52b788']].map(([x, y, c], k) => (
          <g key={k} transform={`translate(${(x as number) + Math.sin(t + k) * 20},${(y as number) + Math.sin(t * 1.3 + k) * 8})`}><Fish c={c as string} flip={k % 2 === 1} /></g>
        ))}
        {[-420, -380, 300, 420].map((x, k) => <path key={k} d={`M ${x},300 Q ${x + 20},200 ${x - 10},120 Q ${x + 30},60 ${x + 10},0`} fill="none" stroke="#2d6a4f" strokeWidth={14} strokeLinecap="round" />)}
        {show && <g transform={`translate(230,200) scale(${pulse(P.a)})`}><SeaStar /></g>}
      </g>
    );
    case 7: return (
      <g>{Array.from({ length: 7 }).map((_, k) => {
        const x = k < 4 ? (k - 1.5) * 230 : (k - 5) * 230 + 80;
        const y = k < 4 ? -120 : 130;
        const sleepy = k === 5;
        if (sleepy) return <g key={k} transform={`translate(${x},${y})`}>{theStar(66, { sleepy: true })}</g>;
        return <g key={k} transform={`translate(${x},${y + Math.sin(t * 3 + k) * 6})`}><HStar r={66} c={['#ffd23f', '#ffca3a', '#ffe066', '#ffd23f', '#ffca3a', '', '#ffe066'][k]} /></g>;
      })}</g>
    );
    case 8: return (
      <g>
        {[[-360, -150, 34], [-330, 150, 44], [300, -170, 50], [360, 140, 30], [130, 190, 38]].map(([x, y, r], k) => (
          <g key={k} transform={`translate(${x},${y})`}><HStar r={r} /></g>
        ))}
        <g transform="translate(-60,10)">{theStar(120)}</g>
      </g>
    );
    case 9: return (
      <g>
        <Vol kind="slope"><ellipse cx={0} cy={30} rx={430} ry={220} fill="#ffffff" {...kst(6)} /></Vol>
        {[[-260, -40], [-90, -110], [-140, 110], [60, 130], [280, -60], [270, 120]].map(([x, y], k) => (
          <g key={k} transform={`translate(${x},${y})`}><Cookie /></g>
        ))}
        {show && <g transform={`translate(140,-10) scale(${pulse(P.a)})`}><Cookie star /></g>}
      </g>
    );
    case 10: return (
      <g>
        <rect x={-CW / 2} y={130} width={CW} height={210} fill="#d4a373" opacity={0.6} />
        <rect x={250} y={-260} width={200} height={170} rx={14} fill="#bde0fe" {...kst(5)} />
        <path d="M 350,-260 L 350,-90 M 250,-175 L 450,-175" stroke="#ffffff" strokeWidth={8} />
        <g transform="translate(-340,40)"><rect x={-10} y={-60} width={20} height={160} fill="#adb5bd" {...kst(4)} /><Vol><path d="M -60,-60 L 60,-60 L 40,-130 L -40,-130 Z" fill="#ffca3a" {...kst(5)} /></Vol></g>
        <rect x={-120} y={-220} width={280} height={18} rx={6} fill="#8d5a3b" {...kst(4)} />
        {['#ff595e', '#4cc9f0', '#8ac926', '#c77dff'].map((c, k) => <rect key={c} x={-100 + k * 40} y={-290} width={30} height={70} rx={5} fill={c} {...kst(3)} />)}
        <g transform="translate(60,225)">{theStar(40)}</g>
        <g transform="translate(60,60)">
          <Vol><rect x={-240} y={-40} width={480} height={150} rx={20} fill="#c77dff" {...kst(6)} /></Vol>
          <Vol><rect x={-250} y={-80} width={150} height={70} rx={30} fill="#ffffff" {...kst(5)} /></Vol>
          <rect x={-250} y={100} width={30} height={70} fill="#8d5a3b" {...kst(4)} /><rect x={220} y={100} width={30} height={70} fill="#8d5a3b" {...kst(4)} />
        </g>
      </g>
    );
    case 11: return (
      <g>
        <g transform="translate(-300,-60)"><Lemon /></g>
        <g transform="translate(-80,110)"><Banana /></g>
        <g transform="translate(150,-40)"><Duck /></g>
        <g transform="translate(-60,-170)"><Vol><circle r={56} fill="#ffd23f" {...kst(5)} /></Vol><path d="M -40,-40 Q 0,0 40,-40" fill="none" stroke="#ffffff" strokeWidth={6} opacity={0.6} /></g>
        <g transform="translate(340,60)">{show && <g transform={`scale(${pulse(P.a)})`}><HStar r={52} face={false} /></g>}</g>
        <g transform="translate(300,-210) scale(0.8)"><Apple c="#ffd23f" /></g>
      </g>
    );
    default: return null;
  }
};
const SuperScene: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={-CW / 2} y={-CH / 2} width={CW} height={CH} fill="#a0d8ff" />
    <rect x={-CW / 2} y={130} width={CW} height={210} fill="#8ac926" />
    {Array.from({ length: 30 }).map((_, k) => <path key={k} d={`M ${-CW / 2 + k * 34},${330} l 8,-34 l 8,34`} fill="#52b788" />)}
    <g transform="translate(-300,40)">
      <Vol kind="tube"><rect x={-28} y={-40} width={56} height={180} rx={20} fill="#8d5a3b" {...kst(6)} /></Vol>
      <Leaf x={-70} y={-120} r={95} c="#52b788" /><Leaf x={80} y={-130} r={95} c="#40916c" />
      {t < SUPER_AT[0].a + FLY && <g transform="translate(-95,-235)"><HStar r={36} /></g>}
      <Leaf x={0} y={-220} r={60} c="#74c69d" /><Leaf x={-40} y={-160} r={40} c="#52b788" /><Leaf x={44} y={-160} r={40} c="#74c69d" />
    </g>
    <g transform={`translate(190,-200) rotate(${Math.sin(t * 1.5) * 8})`}><Kite star={t < SUPER_AT[1].a + FLY} /></g>
    <path d="M 190,-110 Q 120,40 60,330" fill="none" stroke="#ffffff" strokeWidth={3} />
    <CloudP x={-40} y={-220} s={0.7} />
    {t < SUPER_AT[2].a + FLY && <g transform="translate(390,210)"><HStar r={34} /></g>}
    {Array.from({ length: 8 }).map((_, k) => <path key={k} d={`M ${300 + k * 24},${250} l 8,-40 l 8,40`} fill="#40916c" />)}
  </g>
);
// the remember round: a big star with numbered points
const PointsStar: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <HStar r={190} />
    {[0, 1, 2, 3, 4].map((k) => {
      const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
      const at = S('ra1') + k * 0.12;
      return t >= at && (
        <g key={k} transform={`translate(${Math.cos(a) * 240},${Math.sin(a) * 240}) scale(${popIn(t, at)})`}>
          <circle r={36} fill={['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#1982c4'][k]} {...kst(4)} />
          <text y={14} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill="#ffffff">{k + 1}</text>
        </g>
      );
    })}
  </g>
);

const Jar: React.FC<{ n: number; t: number }> = ({ n, t }) => (
  <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
    <g transform="translate(120,150)">
      <path d="M -70,-80 L 70,-80 L 80,-60 Q 90,90 60,100 L -60,100 Q -90,90 -80,-60 Z" fill="#e8f7ff" opacity={0.85} {...kst(6)} />
      <rect x={-78} y={-104} width={156} height={28} rx={10} fill="#ff6fa5" {...kst(5)} />
      {Array.from({ length: n }).map((_, k) => (
        <g key={k} transform={`translate(${((k % 4) - 1.5) * 34},${80 - Math.floor(k / 4) * 34}) rotate(${k * 37 + Math.sin(t * 2 + k) * 6}) scale(0.32)`}><HStar r={52} face={false} /></g>
      ))}
      <path d="M -50,-50 Q -60,20 -46,80" stroke="#ffffff" strokeWidth={10} strokeLinecap="round" opacity={0.6} fill="none" />
      <g transform="translate(0,150)">
        <rect x={-62} y={-34} width={124} height={62} rx={31} fill="#ffffff" {...kst(5)} />
        <text y={14} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={42} fill={KINK}>{n}</text>
      </g>
    </g>
  </svg>
);

export default function KidsPuzzles062() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const hop = hopAt(t, HOPS, { h: 50 });
  const yay = (k: number) => (within(t, S('super_yay'), E('super_yay') + 0.6) ? Math.abs(Math.sin(t * 7 + k)) * 26 : 0);
  const pi = puzzleAt(t);
  const P = pi >= 0 ? PUZ[pi] : null;
  const jarN = ALL_FOUND.filter((a) => t >= a + FLY).length;
  const remPic = t >= REM0 && t < S('chant') - 0.2;
  const remWhich = t < S('rq2') - 0.2 ? 'points' : t < S('rq3') - 0.2 ? 'p1' : t < S('rq4') - 0.2 ? 'p8' : 'trick';

  // the found star flying to the jar (screen space)
  const toScreen = (sx: number, sy: number): [number, number] => [(sx - cam.x) * cam.z + W / 2, (sy - cam.y) * cam.z + H / 2];
  const flying = ALL_FOUND.map((a, k) => ({ a, k })).filter(({ a }) => within(t, a + 0.4, a + FLY));
  const spotOf = (k: number): [number, number] => (k < PUZ.length ? PUZ[k].at : SUPER_AT[k - PUZ.length].at);

  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
        <Backdrop place={PLACE} w={W} h={H} t={t} fx={false} />
        {/* the puzzle board */}
        {(P || t >= SUPER0) && !(t >= S('super_yay') + 2 && t < REM0) && (
          <g transform={`translate(${CARD[0]},${CARD[1]}) scale(${t >= REM0 ? popIn(t, REM0) : t >= SUPER0 ? popIn(t, SUPER0) : pi === 0 ? 1 : popIn(t, S(P!.q) - 0.35)})`}>
            <defs><clipPath id="d62card"><rect x={-CW / 2} y={-CH / 2} width={CW} height={CH} rx={36} /></clipPath></defs>
            <rect x={-CW / 2 - 18} y={-CH / 2 - 18} width={CW + 36} height={CH + 36} rx={50} fill="#c98f5f" {...kst(8)} />
            <g clipPath="url(#d62card)">
              <rect x={-CW / 2} y={-CH / 2} width={CW} height={CH} fill={remPic ? '#fff8e7' : t >= SUPER0 ? '#a0d8ff' : P!.bg} />
              {remPic ? (
                remWhich === 'points' ? <PointsStar t={t} />
                  : remWhich === 'p1' ? <Scene i={0} t={t} hide={t >= S('ra2') + 1.2 ? 0 : 0} />
                  : remWhich === 'p8' ? <Scene i={7} t={t} hide={0} />
                  : (
                    <g>
                      {[[0, -150, 0], [0, 150, 180], [-260, 0, -90], [260, 0, 90]].map(([x, y, r], k) => (
                        <g key={k} transform={`translate(${x},${y}) rotate(${r}) scale(${popIn(t, S('ra4') + [0, 0.6, 1.2, 1.5][k])})`}>
                          <path d="M 0,-60 L 50,0 L 20,0 L 20,60 L -20,60 L -20,0 L -50,0 Z" fill={['#ff595e', '#4cc9f0', '#8ac926', '#ffca3a'][k]} {...kst(5)} strokeLinejoin="round" />
                        </g>
                      ))}
                      <HStar r={80} />
                    </g>
                  )
              ) : t >= SUPER0 ? <SuperScene t={t} /> : <Scene i={pi} t={t} hide={t >= P!.a + 0.4 ? 1 : 0} />}
            </g>
            {/* the answer ring + marks */}
            {P && !remPic && t < SUPER0 && (
              <g>
                {t >= P.a && t < P.a + 2.2 && (
                  <circle cx={P.at[0]} cy={P.at[1]} r={pi === 8 ? 150 : 90} fill="none" stroke="#ff6fa5" strokeWidth={12} strokeDasharray="22 14"
                    transform={`rotate(${t * 60} ${P.at[0]} ${P.at[1]})`} opacity={1 - prog(t, P.a + 1.8, P.a + 2.2)} />
                )}
                {P.wrong && <AnswerMark t={t} at={E(P.wrong.line) + 0.1} until={P.a + 0.2} ok={false} x={P.wrong.at[0]} y={P.wrong.at[1]} size={0.6} />}
                <AnswerMark t={t} at={P.a + 0.1} until={P.a + 2.2} ok x={P.at[0] + 90} y={P.at[1] - 80} size={0.55} />
              </g>
            )}
            {t >= SUPER0 && !remPic && SUPER_AT.map((s, k) => t >= s.a && t < s.a + 2.4 && (
              <g key={k} transform={`translate(${s.at[0]},${s.at[1]})`}>
                <circle r={70} fill="none" stroke="#ff6fa5" strokeWidth={10} strokeDasharray="18 12" transform={`rotate(${t * 60})`} />
                <g transform={`translate(60,-60) scale(${popIn(t, s.a)})`}>
                  <circle r={34} fill={['#ff595e', '#ff924c', '#ffca3a'][k]} {...kst(4)} />
                  <text y={13} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill="#ffffff">{k + 1}</text>
                </g>
              </g>
            ))}
            {remWhich === 'p1' && remPic && t >= S('ra2') && <circle cx={PUZ[0].at[0]} cy={PUZ[0].at[1]} r={90} fill="none" stroke="#ff6fa5" strokeWidth={12} strokeDasharray="22 14" />}
            {remWhich === 'p8' && remPic && t >= S('ra3') && <circle cx={PUZ[7].at[0]} cy={PUZ[7].at[1]} r={95} fill="none" stroke="#ff6fa5" strokeWidth={12} strokeDasharray="22 14" />}
          </g>
        )}
        <PlaceLight place={PLACE}>
          <Critter spec={HOOT_HERO} x={X.hoot} y={yAt(X.hoot, CS)} scale={CS} expr={exprAt(t, HOOT_E)} look={lookAt(t, LOOK_R)} mouth={lipSync(VO, 'hoot', t)}
            armL={poseAt(t, HOOT_A)} armR={poseAt(t, HOOT_R)} facing={-1} hop={hop.hop + yay(3)} squash={hop.squash} />
          <Critter spec={BOBO_HERO} x={X.bobo} y={yAt(X.bobo, CS)} scale={CS} expr={exprAt(t, BOBO_E)} look={lookAt(t, LOOK_R)} mouth={lipSync(VO, 'bobo', t)}
            armL={poseAt(t, BOBO_A)} armR={poseAt(t, BOBO_A)} facing={-1} hop={hop.hop + yay(2)} squash={hop.squash}
            holdR={within(t, S('p10_bobo'), E('p10_bobo')) ? <g transform="scale(0.6)"><Cookie /></g> : undefined} />
          <Kid spec={LEO_HERO} x={X.leo} y={yAt(X.leo, KS)} scale={KS} expr={exprAt(t, LEO_E)} look={lookAt(t, LOOK_L)} mouth={lipSync(VO, 'leo', t)}
            armL={poseAt(t, LEO_L)} armR={poseAt(t, LEO_R)} hop={hop.hop + yay(1)} squash={hop.squash} />
          <Kid spec={MILA_HERO} x={X.mila} y={yAt(X.mila, KS)} scale={KS} expr={exprAt(t, MILA_E)} look={lookAt(t, LOOK_L)} mouth={lipSync(VO, 'mila', t)}
            armL={poseAt(t, MILA_L)} armR={poseAt(t, MILA_R)} hop={hop.hop + yay(0)} squash={hop.squash} />
        </PlaceLight>
        <StageWord t={t} at={word('p10_bobo', 7)} until={E('p10_bobo') + 0.2} text="MUNCH, MUNCH!" x={X.bobo - 120} y={yAt(X.bobo, CS) - 500} size={70} color="#d4a373" rot={-5} />
        <StageWord t={t} at={S('p8_zzz')} until={E('p8_zzz') + 0.4} text="ZZZ…" x={X.bobo - 60} y={yAt(X.bobo, CS) - 520} size={80} color="#c77dff" rot={5} />
        <Reaction kind="?" t={t} at={E('p1_leo') + 0.1} until={S('p1_a')} x={X.leo} y={yAt(X.leo, KS) - 460} s={0.5} />
        <Reaction kind="sweat" t={t} at={S('p2_yay')} until={E('p2_yay')} x={X.leo + 60} y={yAt(X.leo, KS) - 380} s={0.5} />
        <Reaction kind="stars" t={t} at={S('p6_leo')} until={E('p6_leo') + 0.6} x={X.leo} y={yAt(X.leo, KS) - 460} s={0.55} />
        <Reaction kind="!" t={t} at={S('p10_stop')} until={E('p10_stop')} x={X.bobo} y={yAt(X.bobo, CS) - 460} s={0.55} />
        <Reaction kind="idea" t={t} at={S('jar_q')} until={E('jar_q') + 0.3} x={X.leo} y={yAt(X.leo, KS) - 460} s={0.55} />
      </ActionStage>

      {/* screen-space */}
      <Jar n={jarN} t={t} />
      {flying.map(({ a, k }) => {
        const [sx, sy] = toScreen(CARD[0] + spotOf(k)[0], CARD[1] + spotOf(k)[1]);
        const p = EASE_INOUT(prog(t, a + 0.4, a + FLY));
        const x = sx + (120 - sx) * p;
        const y = sy + (170 - sy) * p - Math.sin(p * Math.PI) * 160;
        return (
          <AbsoluteFill key={k}>
            <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
              <g transform={`translate(${x},${y}) scale(${1 - p * 0.6}) rotate(${p * 360})`}><HStar r={50} /></g>
            </svg>
          </AbsoluteFill>
        );
      })}
      <PopText t={t} at={0.4} until={S('p1_leo') - 0.1} text="FIND THE HIDDEN STAR!" y={90} size={96} color="#ffca3a" />
      {PUZ.map((p, k) => (
        <React.Fragment key={k}>
          {k > 0 && <PopText t={t} at={S(p.q)} until={beat(E(p.q) + 0.1)} text={`PUZZLE ${k + 1}`} y={90} size={90} color="#ffffff" />}
          <ThinkTimer t={t} from={beat(E(p.q) + 0.1)} to={VO[K[p.q] + 1].start - 0.1} x={1780} y={170} r={84} />
        </React.Fragment>
      ))}
      <PopText t={t} at={S('premise')} until={S('trick') - 0.1} text="12 HIDDEN STARS!" y={90} size={110} color="#ffca3a" />
      <PopText t={t} at={S('trick')} until={S('p2') - 0.1} text="LOOK UP · LOOK DOWN · ALL AROUND!" y={90} size={70} color="#ffffff" />
      <PopText t={t} at={word('p3_count', 0)} until={S('p4') - 0.1} text="5 POINTS!" y={90} size={110} color="#ffca3a" />
      <PopText t={t} at={S('p7_fact')} until={S('p8') - 0.1} text="A SEA STAR!" y={90} size={110} color="#ff8c69" />
      <PopText t={t} at={S('p12_yay')} until={S('super') - 0.1} text="12 STARS!" y={90} size={120} color="#ffca3a" />
      <PopText t={t} at={S('super')} until={beat(E('super') + 0.1)} text="⭐ SUPER PUZZLE ⭐" y={90} size={100} color="#ff6fa5" />
      <ThinkTimer t={t} from={beat(E('super') + 0.1)} to={S('s1') - 0.1} x={1780} y={170} r={84} />
      <PopText t={t} at={S('super_yay')} until={S('rem') - 0.1} text="15 STARS! SUPER STAR FINDER!" y={90} size={84} color="#ffca3a" />
      <PopText t={t} at={S('rem')} until={S('rq1') - 0.1} text="LET'S REMEMBER!" y={90} size={110} color="#ffca3a" />
      {(['rq1', 'rq2', 'rq3', 'rq4'] as const).map((q, k) => (
        <ThinkTimer key={q} t={t} from={beat(E(q) + 0.1)} to={S((['ra1', 'ra2', 'ra3', 'ra4'] as const)[k]) - 0.1} x={1780} y={170} r={84} />
      ))}
      <PopText t={t} at={S('ra1')} until={S('rq2') - 0.2} text="FIVE POINTS!" y={90} size={110} color="#ffca3a" />
      <PopText t={t} at={S('ra2')} until={S('rq3') - 0.2} text="IN THE TREE!" y={90} size={110} color="#52b788" />
      <PopText t={t} at={S('ra3')} until={S('rq4') - 0.2} text="CLOSED EYES!" y={90} size={110} color="#c77dff" />
      <PopText t={t} at={S('ra4')} until={S('chant') - 0.2} text="LOOK ALL AROUND!" y={90} size={110} color="#4cc9f0" />
      <PopText t={t} at={S('ch1')} until={S('ch2') - 0.05} text="LOOK UP!" y={90} size={130} color="#ff595e" />
      <PopText t={t} at={S('ch2')} until={S('ch3') - 0.05} text="LOOK DOWN!" y={90} size={130} color="#4cc9f0" />
      <PopText t={t} at={S('ch3')} until={S('ch4') - 0.05} text="LOOK ALL AROUND!" y={90} size={120} color="#8ac926" />
      <PopText t={t} at={S('ch4')} until={S('ch_turn') - 0.1} text="FIND THE STAR!" y={90} size={120} color="#ffca3a" />
      <PopText t={t} at={S('ch_turn')} until={S('bye') - 0.1} text="YOUR TURN!" y={90} size={120} color="#ffffff" />
      <PopText t={t} at={S('bye')} until={END_IRIS} text="SEE YOU NEXT TIME!" y={90} size={100} color="#ffca3a" />
      <Confetti t={t} at={PUZ[0].a + FLY} y={420} />
      <Confetti t={t} at={S('p6_leo')} y={420} />
      <Confetti t={t} at={S('p12_yay') + 0.4} y={420} />
      <Confetti t={t} at={S('super_yay')} y={420} />
      <Confetti t={t} at={S('ch4')} y={420} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <StarWipe t={t} at={END_IRIS} dur={0.5} hold={5} color="#ffca3a" x={W / 2} y={H * 0.45} />
    </>
  );
}
