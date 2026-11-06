// TINY SPARKS · Day 79 · 🔢 Numbers & Math #12 — "Learn Number 2" (LONG 16:9)
// kids-shorts/tiny-sparks/numbers/day-079-learn-number-2. Cues from VO via K (keys.gen.ts).
// COLD OPEN (no ident): in the classroom, Captain Leo holds up TWO fingers at frame 0 — "Look! Two fingers! Two!" → the
// big 2 pops on the chalkboard → ONE premise line → round top + flat bottom → it looks like a SWAN → say it ×2 → your turn
// → two fingers (Bobo's fluffy paws) → CHALK a 2 (around, down, along) → in the air → once more → Leo writes it
// BACKWARDS ✗ → again ✓ → things that come in TWO (eyes (think) · Bobo's ears (think) · shoes · bike wheels (think) ·
// Hoot's wings (think)) → one cookie + one more = two (think) → French: deux → FIND THE 2 (Leo ✗ the 5) · nests · the
// odd sock · ducks (Leo ✗ "three!") · Bobo eats one of two cookies (how many left?) → remember (6) → the number-two rhyme
// → next time: three → bye + star iris.
import React from 'react';
import { getLength, getPointAtLength } from '@remotion/paths';
import { Kid, kidFaceAt, type KArm } from '../../lib/kids/kid';
import { Critter, critterFaceAt, type CArm } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, HOOT_HERO, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { Backdrop, PlaceLight, standY } from '../../lib/kids/places';
import { AnswerMark, Confetti, FONT_TOON, KidsCaptions, PopText, RAINBOW, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { speechAt } from '../../lib/kids/acting';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, Reaction, StageWord, StarWipe, directorCam, hopAt, onBeat, type Shot } from '../../lib/kids/energy';
import { exprAt, lookAt, poseAt, type Keys } from '../../lib/kids/smooth';
import { voKeys, wordHops, type Span } from '../../lib/kids/cues';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsNumbers079', durationInSeconds: 339.7, fps: 30, width: 1920, height: 1080 };

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
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff', narrator_fr: '#4cc9f0' };
const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (EASE_OUT(p) - 1) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};
const beat = (x: number) => onBeat(x, 0);

// ── place + blocking: the painted chalkboard in the middle, the kids on the left, Bobo + Hoot on the right
const PLACE = 'classroom' as const;
const KS = 0.52;
const CS = 0.54;
const X = { leo: 210, mila: 410, bobo: 1500, hoot: 1720 };
const yAt = (x: number, s: number) => standY(PLACE, x, W, H, { halfW: 150 * s });
const BZ: [number, number] = [958, 424]; // the board centre (painting)
const BW = 728;
const BH = 412;
const CHALK = '#f8f9fa';

// ── what the board shows (in time order)
type Panel = 'hand' | 'swan' | 'write' | 'leo' | 'eyes' | 'ears' | 'shoes' | 'bike' | 'wings' | 'add' | 'fr' | 'gA' | 'gB' | 'gB2' | 'gC' | 'gC2' | 'gD' | 'gE'
  | 'r1' | 'r2' | 'r3' | 'r4' | 'r6' | 'r5' | 'rhyme' | 'three' | 'bye';
const PANELS: [number, Panel][] = [
  [0, 'hand'], [S('swan') - 0.2, 'swan'], [S('fingers') - 0.2, 'hand'], [S('draw') - 0.3, 'write'], [S('leo_draw') - 0.2, 'leo'],
  [S('o_eyes') - 0.2, 'eyes'], [S('o_ears') - 0.2, 'ears'], [S('o_shoes') - 0.2, 'shoes'], [S('o_bike') - 0.2, 'bike'], [S('o_wings') - 0.2, 'wings'],
  [S('add') - 0.2, 'add'], [S('fr_q') - 0.2, 'fr'], [S('gA') - 0.3, 'gA'], [S('gB') - 0.3, 'gB'], [S('gB2') - 0.3, 'gB2'], [S('gC') - 0.3, 'gC'],
  [S('gC2') - 0.3, 'gC2'], [S('gD') - 0.3, 'gD'], [S('gE') - 0.3, 'gE'], [S('rq1') - 0.2, 'r1'], [S('rq2') - 0.2, 'r2'], [S('rq3') - 0.2, 'r3'],
  [S('rq4') - 0.2, 'r4'], [S('rq6') - 0.2, 'r6'], [S('rq5') - 0.2, 'r5'], [S('chant') - 0.2, 'rhyme'], [S('next') - 0.2, 'three'], [S('bye') - 0.2, 'bye'],
];
const panelAt = (t: number): [Panel, number] => {
  let p = PANELS[0];
  for (const x of PANELS) if (t >= x[0]) p = x;
  return [p[1], p[0]];
};
const BIG2 = word('n2b', 7); // "Number two!" — the big 2 pops

// the 2, as ONE chalk stroke: around the top → down to the corner → along the bottom
const TWO_PATH = 'M -78,-92 C -70,-178 92,-182 86,-78 C 82,-14 -10,50 -92,136 L 104,136';
const TWO_LEN = getLength(TWO_PATH);
const twoTip = (p: number): [number, number] => {
  const pt = getPointAtLength(TWO_PATH, Math.max(0.01, Math.min(1, p)) * TWO_LEN);
  return [pt.x, pt.y];
};
// the write-it timing: "around" → "down" → "along", each a third of the stroke
const seg3 = (t: number, a: number, b: number, c: number, d: number) =>
  t < a ? 0 : t < b ? 0.42 * EASE_INOUT(prog(t, a, b)) : t < c ? 0.42 + 0.33 * EASE_INOUT(prog(t, b, c)) : 0.75 + 0.25 * EASE_INOUT(prog(t, c, d));
const WRITE1 = (t: number) => seg3(t, word('draw', 9), word('draw', 12), word('draw2', 5), word('draw2', 9) + 0.2);
const WRITE2 = (t: number) => seg3(t, word('draw_again', 3), word('draw_again2', 0), word('draw_again2', 2), word('draw_again2', 5));
const LEO_BACK = (t: number) => EASE_INOUT(prog(t, word('leo_draw', 5), E('leo_draw') + 0.4));
const LEO_FIX = (t: number) => seg3(t, word('leo_fix', 2), word('leo_fix', 3), word('leo_fix', 5), word('leo_fix', 6) + 0.3);
const EATEN = S('gE_crunch');
const DUCK_AT = [word('gD_no', 3), word('gD_no', 4)];
const END_IRIS = E('bye2') + 0.6;

// ── arms, fingers, faces
const BYE: Span<KArm> = [S('bye'), 999, 'wave'];
const RHYME: Span<KArm> = [S('c1'), E('c_turn') + 0.3, 'cheer'];
const MILA_R = voKeys<KArm>(VO, 'mila', 'present', 'down', [
  [S('say1'), E('say2'), 'point'], [S('draw_turn'), E('draw_turn') + 0.4, { to: [120, -230] }], [S('draw_again2'), E('draw_again2'), 'point'],
  [S('o_eyes_a'), E('o_eyes_a'), 'count'], [S('o_bike_a'), E('o_bike_a'), 'cheer'], [S('add2'), E('add2') + 0.3, 'hold'], [S('gA_no'), E('gA_no'), 'point'],
  [S('gC_a'), E('gC_a'), 'point'], [S('gE_a'), E('gE_a'), 'point'], [S('rq5'), E('ra5') + 0.4, 'count'], RHYME, BYE,
]);
const MILA_L = voKeys<KArm>(VO, null, 'down', 'down', [[S('leo_wig'), E('leo_wig'), 'cover'], [S('gE_a'), E('gE_a'), 'cover'], RHYME, BYE]);
const MILA_E = voKeys<KExpr>(VO, 'mila', 'happy', 'smile', [
  [S('leo_wig'), E('leo_wig'), 'laugh'], [S('o_eyes'), E('o_eyes'), 'wink'], [S('gE_a'), E('gE_a') + 0.4, 'laugh'], [S('c1'), 999, 'laugh'],
]);
const LEO_R = voKeys<KArm>(VO, 'leo', 'present', 'down', [
  [0, E('n2') + 0.6, 'count'], [S('fingers'), E('fingers') + 0.6, 'count'], [S('draw_turn'), E('draw_turn') + 0.4, { to: [140, -230] }],
  [word('leo_draw', 5) - 0.3, E('leo_draw') + 0.6, { to: [170, -60] }], [word('leo_fix', 2) - 0.3, word('leo_fix', 6) + 0.4, { to: [170, -60] }],
  [S('o_shoes_a'), E('o_shoes_a'), 'point'], [S('o_wings_a'), E('o_wings_a'), 'point'], [S('fr_q'), E('fr_q'), 'think'],
  [S('gA_leo'), E('gA_leo'), 'point'], [S('gB2_a'), E('gB2_a'), 'point'], [S('gD_leo'), E('gD_leo') + 0.3, 'point'], [S('gD_b'), E('gD_b'), 'cheeks'], [S('ra1'), E('ra1'), 'present'],
  [S('rq5'), E('ra5') + 0.4, 'count'], RHYME, BYE,
]);
const LEO_L = voKeys<KArm>(VO, null, 'down', 'down', [[S('leo_wig'), E('leo_wig'), 'cover'], [S('gD_b'), E('gD_b'), 'cheeks'], [S('leo_yay'), E('leo_yay'), 'cheer'], RHYME, BYE]);
const twoUp = (t: number) => within(t, 0, E('n2') + 0.6) || within(t, S('fingers'), E('fingers') + 0.6) || within(t, S('rq5'), E('ra5') + 0.4);
const LEO_E = voKeys<KExpr>(VO, 'leo', 'happy', 'smile', [
  [0, E('n2') + 0.4, 'wow'], [S('leo_draw'), E('leo_draw'), 'proud'], [S('leo_wig'), E('leo_wig') + 0.3, 'oops'], [S('leo_yay'), E('leo_yay'), 'laugh'],
  [S('gA_leo'), E('gA_leo'), 'proud'], [E('gA_leo'), S('gA_no') + 0.8, 'oops'], [S('gD_leo'), E('gD_leo'), 'proud'], [E('gD_leo'), E('gD_no'), 'think'],
  [S('gD_b'), E('gD_b') + 0.4, 'surprised'], [S('c1'), 999, 'laugh'],
]);
const BOBO_A = voKeys<CArm>(VO, 'bobo', 'wave', 'down', [
  [S('fingers_b'), E('fingers_b') + 0.4, 'up'], [S('leo_wig'), E('leo_wig'), 'point'], [S('o_ears_a'), E('o_ears_a'), 'cheeks'], [S('add'), E('add_a') + 0.4, 'hold'],
  [S('gB_a'), E('gB_a'), 'point'], [S('gC2_a'), E('gC2_a'), 'point'], [S('gE'), E('gE_crunch') + 0.4, 'hold'], [S('ra3'), E('ra3'), 'cheer'], [S('c1'), E('c_turn') + 0.3, 'cheer'], [S('bye'), 999, 'wave'],
]);
const BOBO_E = voKeys<KExpr>(VO, 'bobo', 'happy', 'smile', [
  [S('leo_wig'), E('leo_wig'), 'laugh'], [S('o_ears_a'), E('o_ears_a'), 'laugh'], [S('add_a'), E('add_a') + 0.4, 'laugh'],
  [S('gE_crunch'), E('gE_crunch') + 0.5, 'happy'], [S('gE_a'), E('gE_a'), 'oops'], [S('c1'), 999, 'laugh'],
]);
const HOOT_A = voKeys<CArm>(VO, 'hoot', 'point', 'down', [[S('o_wings_a'), E('o_wings_a') + 0.3, 'wave'], [S('leo_yay'), E('leo_yay'), 'cheer'], [S('c1'), E('c_turn') + 0.3, 'cheer'], [S('bye'), 999, 'wave']]);
const HOOT_E = voKeys<KExpr>(VO, 'hoot', 'happy', 'smile', [[S('leo_yay'), E('leo_yay'), 'laugh'], [S('o_wings_a'), E('o_wings_a'), 'proud'], [S('c1'), 999, 'laugh']]);
const looks = (base: [number, number]): Keys<[number, number]> => [
  [0, [0, 0]], [E('n2') + 0.4, base], [S('say_turn'), [0, 0]], [E('fingers_b') + 0.4, base], [S('draw_turn'), [0, 0]], [E('draw_turn') + 0.3, base],
  [S('ra5'), [0, 0]], [E('ra5'), base], [S('c_turn'), [0, 0]], [S('next'), base], [S('bye'), [0, 0]],
];
const LOOK_L = looks([0.6, -0.3]);
const LOOK_R = looks([-0.6, -0.3]);
const HOPS = [...wordHops(VO, [K.c1, K.c2, K.c3], 2), S('leo_yay') + 0.2, S('add_a') + 0.2, S('gD_b') + 0.2, S('ra5') + 0.2];

// ── camera
const WIDE = { z: 1.0, x: 960, y: 540 };
const BOARD = { z: 1.2, x: 958, y: 470 };
const kFace = (x: number) => kidFaceAt(x, yAt(x, KS), KS)[1] + 80;
const cFace = (x: number) => critterFaceAt(x, yAt(x, CS), CS)[1] + 80;
const MILA_CU = { z: 1.6, x: X.mila + 60, y: kFace(X.mila) };
const LEO_CU = { z: 1.6, x: X.leo + 140, y: kFace(X.leo) };
const BOBO_CU = { z: 1.5, x: X.bobo - 60, y: cFace(X.bobo) };
const HOOT_CU = { z: 1.5, x: X.hoot - 120, y: cFace(X.hoot) };
const SHOTS: Shot[] = [
  { t: 0, ...LEO_CU, move: 'cut', push: 0.012 },
  { t: S('n2b') - 0.1, ...BOARD, move: 'smooth', dur: 0.7, push: 0.01 },
  { t: S('premise') - 0.1, ...WIDE, move: 'smooth', dur: 0.7, push: 0.01 },
  { t: S('look') - 0.1, ...BOARD, move: 'smooth', dur: 0.6, push: 0.012 },
  { t: S('say_turn') - 0.1, ...MILA_CU, move: 'snap' },
  { t: S('fingers') - 0.1, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('fingers_b') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: S('draw') - 0.3, ...BOARD, move: 'smooth', dur: 0.6, push: 0.015 },
  { t: S('draw_turn') - 0.1, ...MILA_CU, move: 'snap' },
  { t: S('draw_again') - 0.2, ...BOARD, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('leo_wig') - 0.1, ...BOBO_CU, move: 'whip' },
  { t: S('leo_fix') - 0.1, ...BOARD, move: 'whip' },
  { t: S('leo_yay') - 0.1, ...WIDE, move: 'smooth', dur: 0.5 },
  { t: S('twos') - 0.1, ...BOARD, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('o_ears') - 0.2, ...BOBO_CU, move: 'smooth', dur: 0.5 },
  { t: S('o_ears_a') - 0.1, ...BOARD, move: 'snap', push: 0.01 },
  { t: S('o_shoes_a') - 0.1, ...LEO_CU, move: 'snap' },
  { t: S('o_bike') - 0.2, ...BOARD, move: 'smooth', dur: 0.5, push: 0.01 },
  { t: S('o_wings') - 0.2, ...HOOT_CU, move: 'smooth', dur: 0.5 },
  { t: S('o_wings_a') - 0.1, ...WIDE, move: 'smooth', dur: 0.5 },
  { t: S('add') - 0.2, ...BOARD, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('add_a') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: S('fr_q') - 0.2, ...LEO_CU, move: 'smooth', dur: 0.5 },
  { t: S('fr') - 0.1, ...BOARD, move: 'snap', push: 0.01 },
  { t: S('game') - 0.2, ...WIDE, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('gA') - 0.3, ...BOARD, move: 'smooth', dur: 0.5, push: 0.01 },
  { t: S('gA_leo') - 0.1, ...LEO_CU, move: 'whip' },
  { t: S('gA_no') - 0.1, ...BOARD, move: 'whip' },
  { t: S('gB') - 0.3, ...BOARD, move: 'cut', push: 0.01 },
  { t: S('gB2') - 0.3, ...BOARD, move: 'cut', push: 0.01 },
  { t: S('gB2_a') - 0.1, ...LEO_CU, move: 'snap' },
  { t: S('gC') - 0.3, ...BOARD, move: 'smooth', dur: 0.5, push: 0.01 },
  { t: S('gC2') - 0.3, ...BOARD, move: 'cut', push: 0.01 },
  { t: S('gC2_a') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: S('gD') - 0.3, ...BOARD, move: 'smooth', dur: 0.5, push: 0.01 },
  { t: S('gD_leo') - 0.1, ...LEO_CU, move: 'snap' },
  { t: S('gD_no') - 0.1, ...BOARD, move: 'smooth', dur: 0.4 },
  { t: S('gE') - 0.3, ...WIDE, move: 'smooth', dur: 0.5 },
  { t: S('gE_crunch') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: S('gE_q') - 0.1, ...BOARD, move: 'smooth', dur: 0.5, push: 0.01 },
  { t: S('gE_a') - 0.1, ...WIDE, move: 'smooth', dur: 0.5 },
  { t: S('rem') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('rq1') - 0.2, ...BOARD, move: 'smooth', dur: 0.5, push: 0.008 },
  { t: S('rq5') - 0.2, ...WIDE, move: 'smooth', dur: 0.5, push: 0.01 },
  { t: S('chant') - 0.2, z: 1.06, x: 960, y: 560, move: 'smooth', dur: 0.6, push: 0.02 },
  { t: S('next') - 0.2, ...BOARD, move: 'smooth', dur: 0.6 },
  { t: S('bye') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
];
SHOTS.sort((a, b) => a.t - b.t);
const PUNCHES = [BIG2, S('gA_no') + 2.0, S('gB_a'), S('gB2_a'), S('gC_a'), S('gC2_a'), S('gD_b'), S('gE_crunch')];

// ── drawings (board coords, origin = board centre; the board is ~728 × 412)
const TwoStroke: React.FC<{ p: number; c?: string; w?: number; chalk?: boolean }> = ({ p, c = CHALK, w = 34, chalk = true }) => (
  <g>
    <path d={TWO_PATH} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${p} 2`} opacity={chalk ? 0.95 : 1} />
    {chalk && <path d={TWO_PATH} fill="none" stroke="#2f5d46" strokeWidth={w * 0.18} strokeLinecap="round" strokeDasharray="3 17" pathLength={undefined} opacity={p > 0 ? 0.35 : 0} />}
  </g>
);
const BigTwo: React.FC<{ s?: number; c?: string; face?: boolean; t?: number }> = ({ s = 1, c = '#8ac926', face = true, t = 0 }) => (
  <g transform={`scale(${s})`}>
    <path d={TWO_PATH} fill="none" stroke={KINK} strokeWidth={72} strokeLinecap="round" strokeLinejoin="round" />
    <path d={TWO_PATH} fill="none" stroke={c} strokeWidth={56} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M -64,-108 C -50,-150 30,-160 60,-120" fill="none" stroke="#ffffff" strokeWidth={10} strokeLinecap="round" opacity={0.5} />
    {face && (
      <g transform={`translate(30,${-96 + Math.sin(t * 3) * 3})`}>
        <ellipse cx={-14} cy={0} rx={6} ry={9} fill={KINK} /><ellipse cx={14} cy={0} rx={6} ry={9} fill={KINK} />
        <circle cx={-12} cy={-3} r={2.5} fill="#ffffff" /><circle cx={16} cy={-3} r={2.5} fill="#ffffff" />
        <path d="M -10,16 Q 0,26 10,16" fill="none" {...kst(4)} />
      </g>
    )}
  </g>
);
const Chalk: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x},${y}) rotate(-35)`}>
    <rect x={-9} y={-70} width={18} height={70} rx={6} fill="#ffffff" stroke="#adb5bd" strokeWidth={3} />
  </g>
);
const Swan: React.FC<{ t: number }> = ({ t }) => (
  <g transform={`translate(0,${Math.sin(t * 2) * 5})`}>
    <path d="M -150,120 Q -40,150 70,120" fill="none" stroke="#4cc9f0" strokeWidth={10} strokeLinecap="round" />
    <Vol><path d="M -130,70 Q -120,130 -20,128 L 90,128 Q 130,100 60,60 Q 0,40 -60,64 Z" fill="#ffffff" {...kst(6)} /></Vol>
    <path d="M -100,70 C -110,-20 -40,-80 0,-60 C 30,-40 10,10 -30,30" fill="none" stroke={KINK} strokeWidth={36} strokeLinecap="round" />
    <path d="M -100,70 C -110,-20 -40,-80 0,-60 C 30,-40 10,10 -30,30" fill="none" stroke="#ffffff" strokeWidth={24} strokeLinecap="round" />
    <path d="M 4,-64 L 40,-56 L 6,-48 Z" fill="#ff924c" {...kst(3)} />
    <circle cx={-16} cy={-62} r={5} fill={KINK} />
  </g>
);
const EyesCard: React.FC<{ t: number; ring: number }> = ({ t, ring }) => {
  const blink = within(t, word('o_eyes', 6), word('o_eyes', 6) + 0.18) || within(t, word('o_eyes', 7), word('o_eyes', 7) + 0.18);
  return (
    <g>
      <Vol tone="skin"><circle r={150} fill="#f7c59f" {...kst(7)} /></Vol>
      <path d="M -150,-30 Q -130,-180 0,-176 Q 130,-180 150,-30 Q 80,-110 -150,-30 Z" fill="#e07a3f" {...kst(6)} />
      {[-55, 55].map((x) => blink
        ? <path key={x} d={`M ${x - 22},0 Q ${x},12 ${x + 22},0`} fill="none" {...kst(6)} />
        : <g key={x}><ellipse cx={x} cy={0} rx={20} ry={26} fill={KINK} /><circle cx={x - 6} cy={-8} r={7} fill="#ffffff" /></g>)}
      <path d="M -40,80 Q 0,110 40,80" fill="none" {...kst(7)} />
      {t >= ring && [-55, 55].map((x, k) => <circle key={k} cx={x} cy={0} r={46} fill="none" stroke="#ff595e" strokeWidth={8} strokeDasharray="14 10" transform={`rotate(${t * 60} ${x} 0) `} opacity={popIn(t, ring + k * 0.3) > 0 ? 1 : 0} />)}
    </g>
  );
};
const BearHead: React.FC<{ t: number; ring: number }> = ({ t, ring }) => {
  const wig = t >= ring ? Math.sin(t * 14) * 10 : 0;
  return (
    <g>
      {[-1, 1].map((d) => (
        <g key={d} transform={`rotate(${d * wig} ${d * 110} -110)`}>
          <Vol><circle cx={d * 110} cy={-110} r={56} fill="#a0663f" {...kst(6)} /></Vol>
          <circle cx={d * 110} cy={-110} r={28} fill="#e8b48a" />
          {t >= ring && <circle cx={d * 110} cy={-110} r={78} fill="none" stroke="#ff595e" strokeWidth={8} strokeDasharray="14 10" transform={`rotate(${t * 60} ${d * 110} -110)`} />}
        </g>
      ))}
      <Vol><circle r={150} fill="#a0663f" {...kst(7)} /></Vol>
      <Vol><ellipse cx={0} cy={50} rx={70} ry={52} fill="#e8b48a" {...kst(5)} /></Vol>
      <ellipse cx={0} cy={26} rx={22} ry={15} fill={KINK} />
      <circle cx={-52} cy={-20} r={13} fill={KINK} /><circle cx={52} cy={-20} r={13} fill={KINK} />
      <path d="M -24,64 Q 0,82 24,64" fill="none" {...kst(5)} />
    </g>
  );
};
const Shoe: React.FC<{ c: string; flip?: boolean }> = ({ c, flip }) => (
  <g transform={flip ? 'scale(-1,1)' : undefined}>
    <Vol><path d="M -110,40 Q -110,-50 -50,-60 L -10,-60 Q 10,-10 60,-6 Q 120,0 120,40 Z" fill={c} {...kst(6)} /></Vol>
    <rect x={-116} y={34} width={242} height={26} rx={12} fill="#ffffff" {...kst(5)} />
    {[-40, -20, 0].map((x) => <path key={x} d={`M ${x - 14},${-50 + (x + 40) * 0.6} l 28,0`} {...kst(4)} />)}
  </g>
);
const Bike: React.FC<{ t: number; ring: number }> = ({ t, ring }) => (
  <g>
    {[-150, 150].map((x, k) => (
      <g key={x} transform={`translate(${x},60)`}>
        <circle r={90} fill="none" stroke={KINK} strokeWidth={16} />
        <circle r={90} fill="none" stroke="#adb5bd" strokeWidth={9} />
        {Array.from({ length: 6 }).map((_, j) => <line key={j} x1={0} y1={0} x2={Math.cos(j + t * 2) * 84} y2={Math.sin(j + t * 2) * 84} stroke="#ced4da" strokeWidth={3} />)}
        {t >= ring && <circle r={118} fill="none" stroke="#ff595e" strokeWidth={8} strokeDasharray="14 10" transform={`rotate(${t * 60})`} opacity={popIn(t, ring + k * 0.3) > 0 ? 1 : 0} />}
      </g>
    ))}
    <path d="M -150,60 L -40,-60 L 100,-60 L 150,60 M -40,-60 L 10,60 L 100,-60 M 10,60 L -150,60" fill="none" stroke="#ff595e" strokeWidth={16} strokeLinejoin="round" strokeLinecap="round" />
    <path d="M -60,-90 L -10,-90" stroke={KINK} strokeWidth={16} strokeLinecap="round" />
    <path d="M 100,-60 L 90,-110 L 130,-120" fill="none" stroke={KINK} strokeWidth={12} strokeLinecap="round" />
  </g>
);
const Bird: React.FC<{ t: number; ring: number }> = ({ t, ring }) => {
  const flap = t >= ring ? Math.sin(t * 12) * 18 : 0;
  return (
    <g>
      {[-1, 1].map((d, k) => (
        <g key={d} transform={`rotate(${d * flap} ${d * 60} -20)`}>
          <Vol><ellipse cx={d * 130} cy={-10} rx={90} ry={44} fill="#9b5de5" {...kst(6)} transform={`rotate(${d * -20} ${d * 130} -10)`} /></Vol>
          {t >= ring && <circle cx={d * 150} cy={-14} r={96} fill="none" stroke="#ff595e" strokeWidth={8} strokeDasharray="14 10" transform={`rotate(${t * 60} ${d * 150} -14)`} opacity={popIn(t, ring + k * 0.3) > 0 ? 1 : 0} />}
        </g>
      ))}
      <Vol><ellipse cx={0} cy={20} rx={80} ry={100} fill="#c77dff" {...kst(7)} /></Vol>
      <circle cx={-26} cy={-20} r={20} fill="#ffffff" {...kst(4)} /><circle cx={26} cy={-20} r={20} fill="#ffffff" {...kst(4)} />
      <circle cx={-24} cy={-18} r={9} fill={KINK} /><circle cx={28} cy={-18} r={9} fill={KINK} />
      <path d="M -12,10 L 12,10 L 0,30 Z" fill="#ffca3a" {...kst(3)} />
    </g>
  );
};
const Cookie: React.FC<{ bite?: boolean }> = ({ bite }) => (
  <g>
    <Vol><circle r={66} fill="#e0a96d" {...kst(6)} /></Vol>
    {[[-24, -20], [20, -30], [30, 18], [-10, 30], [-34, 10]].map(([x, y], k) => <circle key={k} cx={x} cy={y} r={8} fill="#6b4226" />)}
    {bite && <circle cx={50} cy={-40} r={34} fill="#2f5d46" />}
  </g>
);
const NumCard: React.FC<{ n: number; x: number; ok?: boolean; at?: number; t: number }> = ({ n, x, t, ok, at = 1e9 }) => (
  <g transform={`translate(${x},0) scale(${ok && t >= at ? 1 + 0.12 * Math.sin(Math.min(1, (t - at) / 0.6) * Math.PI) : 1})`}>
    <rect x={-90} y={-125} width={180} height={250} rx={26} fill="#ffffff" stroke={ok && t >= at ? '#52b788' : KINK} strokeWidth={ok && t >= at ? 14 : 7} />
    <text y={62} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={180} fill={RAINBOW[n % RAINBOW.length]} stroke={KINK} strokeWidth={7} paintOrder="stroke">{n}</text>
  </g>
);
const Nest: React.FC<{ n: number }> = ({ n }) => (
  <g>
    {Array.from({ length: n }).map((_, k) => <g key={k} transform={`translate(${(k - (n - 1) / 2) * 46},-28)`}><Vol><ellipse rx={24} ry={32} fill="#fff8e7" {...kst(4)} /></Vol></g>)}
    <Vol kind="slope"><path d="M -100,-20 Q -96,50 0,54 Q 96,50 100,-20 Z" fill="#a0663f" {...kst(5)} /></Vol>
    {[-70, -30, 10, 50].map((x) => <path key={x} d={`M ${x},0 q 20,14 40,0`} fill="none" stroke="#6b4226" strokeWidth={4} />)}
  </g>
);
const Sock: React.FC<{ c: string; stripe?: boolean }> = ({ c, stripe }) => (
  <g>
    <Vol><path d="M -30,-90 L 30,-90 L 30,20 Q 30,60 70,60 Q 90,90 60,100 L 0,100 Q -30,100 -30,60 Z" fill={c} {...kst(5)} /></Vol>
    <rect x={-32} y={-96} width={64} height={22} rx={8} fill="#ffffff" {...kst(4)} />
    {stripe && [-50, -20, 10, 40].map((y) => <rect key={y} x={-28} y={y} width={56} height={12} fill="#ffffff" opacity={0.85} />)}
  </g>
);
const Duck: React.FC<{ t: number; k: number }> = ({ t, k }) => (
  <g transform={`translate(0,${Math.sin(t * 2 + k) * 6}) rotate(${Math.sin(t * 2 + k) * 3})`}>
    <Vol><ellipse cx={0} cy={20} rx={80} ry={50} fill="#ffd23f" {...kst(6)} /><circle cx={-50} cy={-36} r={40} fill="#ffd23f" {...kst(6)} /></Vol>
    <path d="M -86,-34 L -118,-26 L -86,-18 Z" fill="#ff924c" {...kst(4)} /><circle cx={-58} cy={-44} r={7} fill={KINK} />
    <path d="M 6,6 Q 36,0 50,22" fill="none" {...kst(5)} />
  </g>
);
const Badge: React.FC<{ n: number; t: number; at: number; x: number; y: number; c: string }> = ({ n, t, at, x, y, c }) => t < at ? null : (
  <g transform={`translate(${x},${y}) scale(${popIn(t, at)})`}>
    <circle r={30} fill={c} {...kst(4)} />
    <text y={12} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={36} fill="#ffffff">{n}</text>
  </g>
);
const Two2: React.FC<{ t: number; at: number; x: number; c: string; s?: number }> = ({ t, at, x, c, s = 0.62 }) => t < at ? null : (
  <g transform={`translate(${x},0) scale(${popIn(t, at)})`}><BigTwo s={s} c={c} face={false} /></g>
);

const Panel: React.FC<{ p: Panel; t: number; since: number }> = ({ p, t, since }) => {
  switch (p) {
    case 'hand': return (
      <g>
        {[-210, -80].map((x, k) => <g key={x} transform={`translate(${x},20) scale(${popIn(t, 0.5 + k * 0.5)})`}><circle r={44} fill={RAINBOW[k * 2]} {...kst(5)} /><text y={16} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={48} fill="#ffffff">{k + 1}</text></g>)}
        {t >= BIG2 && <g transform={`translate(170,0) scale(${popIn(t, BIG2, 0.45)})`}><BigTwo t={t} /></g>}
        {within(t, S('look'), S('swan')) && (
          <g>
            <path d="M 70,-150 C 90,-200 260,-200 250,-110" fill="none" stroke="#ffca3a" strokeWidth={10} strokeDasharray="16 10" opacity={t >= word('look', 4) ? 1 : 0} />
            <path d="M 60,170 L 280,170" stroke="#4cc9f0" strokeWidth={10} strokeDasharray="16 10" opacity={t >= word('look', 8) ? 1 : 0} />
          </g>
        )}
      </g>
    );
    case 'swan': return (
      <g>
        <g transform="translate(-170,0) scale(0.9)"><BigTwo t={t} /></g>
        <text x={-10} y={30} fontFamily={FONT_TOON} fontWeight={700} fontSize={90} fill={CHALK}>=</text>
        <g transform={`translate(180,0) scale(${popIn(t, word('swan', 4))})`}><Swan t={t} /></g>
      </g>
    );
    case 'write': {
      const again = t >= S('draw_again');
      const len = again ? WRITE2(t) : WRITE1(t);
      const tip = twoTip(len);
      const guide = t >= S('draw_turn') && t < S('draw_again');
      return (
        <g transform="translate(-20,0)">
          <circle cx={-78} cy={-92} r={18} fill="#52b788" />
          <path d={TWO_PATH} fill="none" stroke="#ffffff" strokeWidth={34} strokeLinecap="round" strokeLinejoin="round" opacity={0.12} />
          <TwoStroke p={len} />
          {guide && <TwoStroke p={EASE_INOUT(prog(t, word('draw_turn', 9), E('draw_turn')))} c="#ffca3a" w={12} chalk={false} />}
          {len > 0 && len < 1 && <Chalk x={tip[0]} y={tip[1]} />}
          {[[-150, -150, '1'], [0, 0, '2'], [160, 136, '3']].map(([x, y, n], k) => (len > [0.01, 0.42, 0.75][k] || guide) && (
            <g key={k} transform={`translate(${x},${y})`}><circle r={24} fill="#ffca3a" /><text y={10} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={30} fill={KINK}>{n}</text></g>
          ))}
        </g>
      );
    }
    case 'leo': {
      const b = LEO_BACK(t);
      const f = LEO_FIX(t);
      const crossed = t >= S('leo_fix');
      const ft = twoTip(f);
      return (
        <g>
          <g transform="translate(-180,0) scale(-0.85,0.85)" opacity={crossed ? 0.35 : 1}>
            <TwoStroke p={b} c="#ffd6e5" />
            {b > 0 && b < 1 && <g transform="scale(-1,1)"><Chalk x={-twoTip(b)[0]} y={twoTip(b)[1]} /></g>}
          </g>
          {crossed && <AnswerMark t={t} at={S('leo_fix')} ok={false} x={-180} y={0} size={0.6} />}
          <g transform="translate(180,0) scale(0.85)">
            <TwoStroke p={f} c="#bde0fe" />
            {f > 0 && f < 1 && <Chalk x={ft[0]} y={ft[1]} />}
          </g>
          {t >= S('leo_yay') && <AnswerMark t={t} at={S('leo_yay')} ok x={300} y={-130} size={0.6} />}
        </g>
      );
    }
    case 'eyes': return <g><g transform="translate(-110,10) scale(1.05)"><EyesCard t={t} ring={S('o_eyes_a')} /></g><Two2 t={t} at={S('o_eyes_a')} x={210} c="#ff6fa5" /></g>;
    case 'ears': return <g><g transform="translate(-110,40) scale(0.9)"><BearHead t={t} ring={S('o_ears_a')} /></g><Two2 t={t} at={S('o_ears_a')} x={210} c="#c98f5f" /></g>;
    case 'shoes': return <g><g transform="translate(-200,60) scale(0.85)"><Shoe c="#4cc9f0" flip /></g><g transform="translate(20,60) scale(0.85)"><Shoe c="#4cc9f0" /></g><Two2 t={t} at={S('o_shoes_a')} x={240} c="#4cc9f0" /></g>;
    case 'bike': return <g><g transform="translate(-90,-10) scale(0.85)"><Bike t={t} ring={S('o_bike_a')} /></g><Two2 t={t} at={S('o_bike_a')} x={250} c="#ff595e" /></g>;
    case 'wings': return <g><g transform="translate(-100,20) scale(0.85)"><Bird t={t} ring={S('o_wings_a')} /></g><Two2 t={t} at={S('o_wings_a')} x={250} c="#9b5de5" /></g>;
    case 'add': return (
      <g>
        <g transform="translate(-250,0)"><Cookie /></g>
        <text x={-180} y={24} fontFamily={FONT_TOON} fontWeight={700} fontSize={80} fill={CHALK} opacity={t >= S('add2') ? 1 : 0}>+</text>
        {t >= S('add2') && <g transform={`translate(-60,0) scale(${popIn(t, word('add2', 3))})`}><Cookie /></g>}
        <text x={20} y={24} fontFamily={FONT_TOON} fontWeight={700} fontSize={80} fill={CHALK} opacity={t >= S('add3') ? 1 : 0}>=</text>
        {t < S('add_a') && t >= S('add3') && <text x={170} y={50} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={170} fill="#adb5bd">?</text>}
        <Two2 t={t} at={S('add_a')} x={180} c="#e0a96d" s={0.7} />
      </g>
    );
    case 'fr': return (
      <g>
        <g transform="translate(-180,0) scale(0.9)"><BigTwo t={t} /></g>
        <text x={-20} y={30} fontFamily={FONT_TOON} fontWeight={700} fontSize={90} fill={CHALK}>=</text>
        {t >= S('fr') && (
          <g transform={`translate(190,30) scale(${popIn(t, S('fr'))})`}>
            <text textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={150} fill="#4cc9f0" stroke={KINK} strokeWidth={8} paintOrder="stroke">deux</text>
            <g transform="translate(-60,40)">{['#1982c4', '#ffffff', '#ff595e'].map((c, k) => <rect key={c} x={k * 40} y={0} width={40} height={56} fill={c} {...kst(3)} />)}</g>
          </g>
        )}
      </g>
    );
    case 'gA': return <g>{[5, 2, 7].map((n, k) => <NumCard key={n} n={n} x={(k - 1) * 220} t={t} ok={n === 2} at={E('gA_no') - 0.6} />)}<AnswerMark t={t} at={E('gA_leo') + 0.1} until={S('gA_no') + 2.0} ok={false} x={-220 + 80} y={-120} size={0.55} /></g>;
    case 'gB': return <g>{[3, 6, 2].map((n, k) => <NumCard key={n} n={n} x={(k - 1) * 220} t={t} ok={n === 2} at={S('gB_a')} />)}</g>;
    case 'gB2': return <g>{[7, 4, 2, 5].map((n, k) => <g key={n} transform="scale(0.85)"><NumCard n={n} x={(k - 1.5) * 205} t={t} ok={n === 2} at={S('gB2_a')} /></g>)}</g>;
    case 'gC': return (
      <g>
        {[1, 2, 3].map((n, k) => (
          <g key={n} transform={`translate(${(k - 1) * 240},40)`}>
            <Nest n={n} />
            {n === 2 && t >= S('gC_a') && <circle cy={-10} r={120} fill="none" stroke="#52b788" strokeWidth={10} strokeDasharray="20 12" transform={`rotate(${t * 60} 0 -10)`} />}
          </g>
        ))}
      </g>
    );
    case 'gC2': return (
      <g>
        {[['#ff595e', -270], ['#ff595e', -170], ['#1982c4', -40], ['#1982c4', 60], ['#ffca3a', 220]].map(([c, x], k) => (
          <g key={k} transform={`translate(${x},10) rotate(${k % 2 ? 6 : -6}) scale(0.95)`}><Sock c={c as string} stripe={k === 4} /></g>
        ))}
        {t >= S('gC2_a') && <circle cx={230} cy={10} r={120} fill="none" stroke="#52b788" strokeWidth={10} strokeDasharray="20 12" transform={`rotate(${t * 60} 230 10)`} />}
      </g>
    );
    case 'gD': return (
      <g>
        <ellipse cx={0} cy={80} rx={330} ry={90} fill="#4cc9f0" opacity={0.85} />
        <ellipse cx={-80} cy={64} rx={150} ry={20} fill="#ffffff" opacity={0.25} />
        {[-120, 120].map((x, k) => <g key={x} transform={`translate(${x},40)`}><Duck t={t} k={k} /><Badge n={k + 1} t={t} at={DUCK_AT[k]} x={0} y={-120} c={RAINBOW[k * 2]} /></g>)}
        <AnswerMark t={t} at={E('gD_leo') + 0.1} until={S('gD_no') + 0.6} ok={false} x={0} y={-120} size={0.55} />
      </g>
    );
    case 'gE': {
      const n = t >= EATEN ? 1 : 2;
      return (
        <g>
          {Array.from({ length: n }).map((_, k) => <g key={k} transform={`translate(${(k - (n - 1) / 2) * 180},0)`}><Cookie /></g>)}
          {t >= EATEN && t < E('gE_crunch') + 1.2 && <g transform={`translate(160,-40)`} opacity={1 - prog(t, EATEN, E('gE_crunch') + 1.2)}>{[0, 1, 2, 3].map((k) => <circle key={k} cx={Math.cos(k * 1.6) * 40 * prog(t, EATEN, EATEN + 0.8)} cy={Math.sin(k * 1.6) * 40 * prog(t, EATEN, EATEN + 0.8)} r={9} fill="#e0a96d" />)}</g>}
          {t >= S('gE_a') && <Badge n={1} t={t} at={S('gE_a')} x={0} y={-110} c="#ff595e" />}
        </g>
      );
    }
    case 'r1': {
      const l = t >= S('ra1') ? seg3(t, word('ra1', 0), word('ra1', 1), word('ra1', 3), E('ra1')) : 0;
      return <g><g transform="translate(-60,0)"><circle cx={-78} cy={-92} r={18} fill="#52b788" /><TwoStroke p={l} /></g>{t < S('ra1') && <text x={170} y={40} fontFamily={FONT_TOON} fontWeight={700} fontSize={170} fill="#adb5bd">?</text>}</g>;
    }
    case 'r2': return <g><g transform="translate(-110,10) scale(0.95)"><EyesCard t={t} ring={S('ra2')} /></g><Two2 t={t} at={S('ra2')} x={220} c="#ff6fa5" /></g>;
    case 'r3': return <g><g transform="translate(-90,-10) scale(0.8)"><Bike t={t} ring={S('ra3')} /></g><Two2 t={t} at={S('ra3')} x={250} c="#ff595e" /></g>;
    case 'r4': return <g><g transform="translate(-180,0) scale(0.85)"><BigTwo t={t} /></g><text x={-20} y={30} fontFamily={FONT_TOON} fontWeight={700} fontSize={90} fill={CHALK}>=</text><text x={190} y={60} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={150} fill={t >= S('ra4') ? '#4cc9f0' : '#adb5bd'} stroke={KINK} strokeWidth={8} paintOrder="stroke">{t >= S('ra4') ? 'deux' : '?'}</text></g>;
    case 'r6': return <g><g transform="translate(-170,0) scale(0.9)"><BigTwo t={t} /></g><text x={-10} y={30} fontFamily={FONT_TOON} fontWeight={700} fontSize={90} fill={CHALK}>=</text>{t >= S('ra6') ? <g transform={`translate(180,0) scale(${popIn(t, S('ra6'))})`}><Swan t={t} /></g> : <text x={180} y={50} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={170} fill="#adb5bd">?</text>}</g>;
    case 'r5': return <g>{[-150, 150].map((x, k) => <g key={x} transform={`translate(${x},0) scale(${t >= S('ra5') ? popIn(t, S('ra5') + k * 0.25) : 1})`}><circle r={80} fill={RAINBOW[k * 3]} {...kst(6)} /><text y={36} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={100} fill="#ffffff">{k + 1}</text></g>)}</g>;
    case 'rhyme': return <g transform={`translate(0,${20 - Math.abs(Math.sin((t - since) * 4.2)) * 26})`}><BigTwo s={0.95} t={t} /></g>;
    case 'three': return (
      <g>
        <g transform="translate(-170,0) scale(0.75)"><BigTwo t={t} /></g>
        <g transform={`translate(190,10) scale(${popIn(t, word('next', 5))})`}>
          <text textAnchor="middle" y={95} fontFamily={FONT_TOON} fontWeight={700} fontSize={290} fill="#ffca3a" stroke={KINK} strokeWidth={10} paintOrder="stroke">3</text>
          <text textAnchor="middle" y={-140} fontFamily={FONT_TOON} fontWeight={700} fontSize={44} fill={CHALK}>NEXT TIME!</text>
        </g>
      </g>
    );
    case 'bye': return <g transform={`rotate(${Math.sin(t * 5) * 6})`}><BigTwo s={0.95} t={t} /></g>;
    default: return null;
  }
};

export default function KidsNumbers079() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const hop = hopAt(t, HOPS, { h: 50 });
  const [panel, since] = panelAt(t);
  const yay = (k: number) => (within(t, S('add_a'), E('add_a') + 0.4) || within(t, S('leo_yay'), E('leo_yay')) ? Math.abs(Math.sin(t * 7 + k)) * 22 : 0);
  const wiggle = within(t, S('o_ears_a'), E('o_ears_a') + 0.3) ? Math.sin(t * 16) * 7 : 0;
  const chew = within(t, S('gE_crunch'), E('gE_crunch') + 0.6);
  const fresh = panel !== 'write' && panel !== 'leo' && panel !== 'rhyme' && panel !== 'bye' && !(panel === 'hand' && since === 0);
  const cookie = <g transform="scale(0.45)"><Cookie /></g>;

  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
        <Backdrop place={PLACE} w={W} h={H} t={t} fx={false} />
        {/* the chalkboard: a soft green wash over the painted board, the lesson drawn on it */}
        <g transform={`translate(${BZ[0]},${BZ[1]})`}>
          <defs><clipPath id="d79board"><rect x={-BW / 2} y={-BH / 2} width={BW} height={BH} rx={10} /></clipPath></defs>
          <rect x={-BW / 2} y={-BH / 2} width={BW} height={BH} rx={10} fill="#2f5d46" opacity={0.55} />
          <g clipPath="url(#d79board)">
            <g transform={`scale(${fresh ? popIn(t, since + 0.05, 0.4) : 1})`}><Panel p={panel} t={t} since={since} /></g>
          </g>
        </g>
        <PlaceLight place={PLACE}>
          <Critter polish acting spec={HOOT_HERO} x={X.hoot} y={yAt(X.hoot, CS)} scale={CS} expr={exprAt(t, HOOT_E)} look={lookAt(t, LOOK_R)} {...speechAt(VO, 'hoot', t)}
            armL={poseAt(t, HOOT_A)} armR={poseAt(t, HOOT_A)} facing={-1} hop={hop.hop} squash={hop.squash} />
          <Critter polish acting spec={BOBO_HERO} x={X.bobo} y={yAt(X.bobo, CS)} scale={CS} expr={exprAt(t, BOBO_E)} look={lookAt(t, LOOK_R)}
            mouth={chew ? 0.5 + 0.5 * Math.sin(t * 16) : lipSync(VO, 'bobo', t)} viseme={chew ? undefined : speechAt(VO, 'bobo', t).viseme} armL={poseAt(t, BOBO_A)} armR={poseAt(t, BOBO_A)} facing={-1}
            hop={hop.hop + yay(2)} squash={hop.squash} tilt={wiggle}
            holdR={within(t, S('add'), E('add_a') + 0.4) || within(t, S('gE'), S('gE_crunch')) ? cookie : undefined} />
          <Kid polish acting spec={LEO_HERO} x={X.leo} y={yAt(X.leo, KS)} scale={KS} expr={exprAt(t, LEO_E)} look={lookAt(t, LOOK_L)} {...speechAt(VO, 'leo', t)}
            armL={poseAt(t, LEO_L)} armR={poseAt(t, LEO_R)} fingersR={twoUp(t) ? 2 : 0} hop={hop.hop + yay(1)} squash={hop.squash} />
          <Kid polish acting spec={MILA_HERO} x={X.mila} y={yAt(X.mila, KS)} scale={KS} expr={exprAt(t, MILA_E)} look={lookAt(t, LOOK_L)} {...speechAt(VO, 'mila', t)}
            armL={poseAt(t, MILA_L)} armR={poseAt(t, MILA_R)} fingersR={within(t, S('o_eyes_a'), E('o_eyes_a')) || within(t, S('rq5'), E('ra5') + 0.4) ? 2 : 0}
            holdR={within(t, S('add2'), word('add2', 3)) ? cookie : undefined} hop={hop.hop + yay(0)} squash={hop.squash} />
        </PlaceLight>
        <StageWord t={t} at={word('fingers_b', 6)} until={E('fingers_b') + 0.3} text="1, 2!" x={X.bobo - 60} y={yAt(X.bobo, CS) - 540} size={80} color="#8ac926" rot={-5} />
        <StageWord t={t} at={word('o_ears_a', 3)} until={E('o_ears_a') + 0.3} text="WIGGLE!" x={X.bobo - 60} y={yAt(X.bobo, CS) - 540} size={80} color="#c98f5f" rot={5} />
        <StageWord t={t} at={word('o_bike_a', 2)} until={E('o_bike_a') + 0.3} text="RING RING!" x={X.mila + 40} y={yAt(X.mila, KS) - 520} size={76} color="#ff595e" rot={-6} />
        <StageWord t={t} at={word('o_wings_a', 2)} until={E('o_wings_a') + 0.3} text="FLAP FLAP!" x={X.hoot - 120} y={yAt(X.hoot, CS) - 560} size={76} color="#9b5de5" rot={5} />
        <StageWord t={t} at={S('gE_crunch')} until={E('gE_crunch') + 0.5} text="CRUNCH!" x={X.bobo - 60} y={yAt(X.bobo, CS) - 540} size={84} color="#e0a96d" rot={5} />
        <Reaction kind="sweat" t={t} at={S('leo_wig')} until={E('leo_wig') + 0.2} x={X.leo + 60} y={yAt(X.leo, KS) - 400} s={0.5} />
        <Reaction kind="?" t={t} at={E('gA_leo') + 0.1} until={S('gA_no') + 1.0} x={X.leo} y={yAt(X.leo, KS) - 470} s={0.5} />
        <Reaction kind="!" t={t} at={S('gD_b')} until={E('gD_b') + 0.3} x={X.leo} y={yAt(X.leo, KS) - 470} s={0.55} />
        <Reaction kind="heart" t={t} at={S('add_a')} until={E('add_a') + 0.5} x={X.bobo} y={yAt(X.bobo, CS) - 470} s={0.55} />
        <Reaction kind="heart" t={t} at={S('gE_crunch')} until={E('gE_crunch') + 0.5} x={X.bobo} y={yAt(X.bobo, CS) - 470} s={0.55} />
        <Reaction kind="idea" t={t} at={S('fr_q')} until={E('fr_q') + 0.2} x={X.leo} y={yAt(X.leo, KS) - 470} s={0.5} />
      </ActionStage>

      {/* screen-space */}
      <PopText t={t} at={0.3} until={S('n2b') - 0.1} text="NUMBER TWO!" y={110} size={110} color="#8ac926" />
      <PopText t={t} at={S('premise')} until={S('look') - 0.1} text="LET'S LEARN 2!" y={110} size={110} color="#ffca3a" />
      <PopText t={t} at={word('look', 4)} until={S('swan') - 0.1} text="ROUND TOP + FLAT BOTTOM" y={110} size={84} color="#ffca3a" />
      <PopText t={t} at={word('swan', 4)} until={S('say1') - 0.1} text="🦢 LIKE A SWAN!" y={110} size={100} color="#ffffff" />
      <PopText t={t} at={S('say1')} until={S('say_turn') - 0.1} text="TWO!" y={110} size={140} color="#8ac926" />
      <PopText t={t} at={S('say_turn')} until={S('fingers') - 0.1} text="🗣️ YOUR TURN!" y={110} size={100} color="#ffffff" />
      <PopText t={t} at={S('fingers')} until={S('draw') - 0.2} text="✌️ TWO FINGERS!" y={110} size={100} color="#ffca3a" />
      <PopText t={t} at={S('draw')} until={S('draw_turn') - 0.1} text="AROUND… DOWN… ALONG!" y={110} size={92} color="#8ac926" />
      <PopText t={t} at={S('draw_turn')} until={S('draw_again') - 0.1} text="☝️ DRAW IT IN THE AIR!" y={110} size={90} color="#ffffff" />
      <PopText t={t} at={S('draw_again')} until={S('leo_draw') - 0.1} text="SLOWLY… AROUND… DOWN… ALONG!" y={110} size={76} color="#8ac926" />
      <PopText t={t} at={S('leo_yay')} until={S('twos') - 0.1} text="PERFECT!" y={110} size={120} color="#52b788" />
      <PopText t={t} at={S('twos')} until={S('o_eyes') - 0.1} text="THINGS THAT COME IN TWO!" y={110} size={84} color="#ffca3a" />
      <PopText t={t} at={S('o_eyes_a')} until={S('o_ears') - 0.1} text="2 EYES" y={110} size={130} color="#ff6fa5" />
      <PopText t={t} at={S('o_ears_a')} until={S('o_shoes') - 0.1} text="2 EARS" y={110} size={130} color="#c98f5f" />
      <PopText t={t} at={S('o_shoes_a')} until={S('o_bike') - 0.1} text="2 SHOES" y={110} size={130} color="#4cc9f0" />
      <PopText t={t} at={S('o_bike_a')} until={S('o_wings') - 0.1} text="2 WHEELS" y={110} size={130} color="#ff595e" />
      <PopText t={t} at={S('o_wings_a')} until={S('add') - 0.1} text="2 WINGS" y={110} size={130} color="#9b5de5" />
      <PopText t={t} at={S('add_a')} until={S('fr_q') - 0.1} text="1 + 1 = 2" y={110} size={130} color="#e0a96d" />
      <PopText t={t} at={S('fr')} until={S('game') - 0.1} text="🇫🇷 DEUX!" y={110} size={130} color="#4cc9f0" />
      <PopText t={t} at={S('game')} until={beat(E('gA') + 0.1)} text="FIND THE 2!" y={110} size={120} color="#ffca3a" />
      <PopText t={t} at={word('gA_no', 0)} until={S('gB') - 0.2} text="ROUND TOP, FLAT BOTTOM!" y={110} size={90} color="#52b788" />
      <PopText t={t} at={S('gB2_a')} until={S('gC') - 0.2} text="🦢 SWIMMING LIKE A SWAN!" y={110} size={90} color="#52b788" />
      <PopText t={t} at={S('gC_a')} until={S('gC2') - 0.2} text="2 EGGS!" y={110} size={120} color="#fff8e7" />
      <PopText t={t} at={S('gC2')} until={beat(E('gC2') + 0.1)} text="FIND THE ODD SOCK!" y={110} size={100} color="#ffffff" />
      <PopText t={t} at={S('gC2_a')} until={S('gD') - 0.2} text="ALL ALONE!" y={110} size={120} color="#ffca3a" />
      <PopText t={t} at={S('gD_b')} until={S('gE') - 0.2} text="2 DUCKS!" y={110} size={130} color="#ffd23f" />
      <PopText t={t} at={S('gE_a')} until={S('rem') - 0.2} text="2 − 1 = 1" y={110} size={130} color="#e0a96d" />
      <PopText t={t} at={S('rem')} until={S('rq1') - 0.1} text="LET'S REMEMBER!" y={110} size={110} color="#ffca3a" />
      <PopText t={t} at={S('ra1')} until={S('rq2') - 0.2} text="AROUND → DOWN → ALONG!" y={110} size={92} color="#8ac926" />
      <PopText t={t} at={S('ra2')} until={S('rq3') - 0.2} text="2 EYES!" y={110} size={130} color="#ff6fa5" />
      <PopText t={t} at={S('ra3')} until={S('rq4') - 0.2} text="2 WHEELS!" y={110} size={130} color="#ff595e" />
      <PopText t={t} at={S('ra4')} until={S('rq6') - 0.2} text="DEUX!" y={110} size={140} color="#4cc9f0" />
      <PopText t={t} at={S('ra6')} until={S('rq5') - 0.2} text="🦢 A SWAN!" y={110} size={130} color="#ffffff" />
      <PopText t={t} at={S('rq5')} until={S('chant') - 0.2} text="✌️ SHOW ME TWO!" y={110} size={110} color="#ffffff" />
      <PopText t={t} at={S('c1')} until={S('c2') - 0.05} text="TWO, TWO, NUMBER TWO!" y={110} size={96} color="#8ac926" />
      <PopText t={t} at={S('c2')} until={S('c3') - 0.05} text="ROUND THE TOP, LIKE A SWAN!" y={110} size={84} color="#1982c4" />
      <PopText t={t} at={S('c3')} until={S('c_turn') - 0.05} text="FLAT ALONG THE BOTTOM!" y={110} size={90} color="#ff595e" />
      <PopText t={t} at={S('c_turn')} until={S('next') - 0.1} text="🗣️ YOUR TURN!" y={110} size={110} color="#ffffff" />
      <PopText t={t} at={S('bye')} until={END_IRIS} text="SEE YOU NEXT TIME!" y={110} size={100} color="#ffca3a" />
      {(['o_eyes', 'o_ears', 'o_bike', 'o_wings', 'add3', 'gA', 'gB', 'gB2', 'gC', 'gC2', 'gD', 'gE_q', 'rq1', 'rq2', 'rq3', 'rq4', 'rq6'] as const).map((q) => (
        <ThinkTimer key={q} t={t} from={beat(E(q) + 0.1)} to={VO[K[q] + 1].start - 0.1} x={1780} y={170} r={84} />
      ))}
      <Confetti t={t} at={BIG2} y={380} />
      <Confetti t={t} at={S('leo_yay')} y={380} />
      <Confetti t={t} at={S('add_a')} y={380} />
      <Confetti t={t} at={S('gD_b')} y={380} />
      <Confetti t={t} at={S('ra5')} y={380} />
      <Confetti t={t} at={E('c3')} y={380} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <StarWipe t={t} at={END_IRIS} dur={0.5} hold={5} color="#8ac926" x={W / 2} y={H * 0.45} />
    </>
  );
}
