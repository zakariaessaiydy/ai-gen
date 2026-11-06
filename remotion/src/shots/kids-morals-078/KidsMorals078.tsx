// TINY SPARKS · Day 78 · 📚 Moral Stories #6 — "The Turtle Who Never Gave Up" (LONG 16:9)
// kids-shorts/tiny-sparks/morals/day-078-the-turtle-who-never-gave-up. Cues from VO via K (keys.gen.ts).
// WANT → WRONG CHOICE → FEELING → KIND CHOICE → HAPPY ENDING → THE MORAL. An ORIGINAL story (not the tortoise and the hare,
// not Day 32's Sammy): Tilly the turtle (guest) wants to fly her kite at the top of Rainbow Hill (a hill drawn over the
// meadow painting; Spark Girl + Captain Leo fly kites up there). Zip the bunny zooms past → TRY 1: count 5 steps → a pebble,
// she rolls all the way down → TRY 2: the muddy spot, she slides down → "I can't, I give up!" — she hides in her shell →
// FEELING: frustrated (the one word) + think timer → KIND CHOICE: Bobo knocks on her shell — he fell off his bike lots of
// times — 3 tricks: "I can't do it… YET!" (your turn) · rest + breathe · look at the next flower, one step at a time →
// TRY 3: flower 1 · rest · flower 2 · around the mud (the long way) · the kids cheer (your turn) · flower 3 · one more step →
// THE TOP → her kite flies highest → PASS IT ON: Zip's kite is stuck in the tree, he gives up → Tilly: "say… yet!" (your
// turn) → gently → free → kites together → the moral "Keep trying, one step at a time." → remember (7) → rhyme → bye.
import React from 'react';
import { getLength, getPointAtLength, getTangentAtLength } from '@remotion/paths';
import { Kid, kidFaceAt, type KArm } from '../../lib/kids/kid';
import { Critter, critterFaceAt, type CArm, type CritterSpec } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { Backdrop, PlaceLight } from '../../lib/kids/places';
import { Confetti, FONT_TOON, KidsCaptions, PopText, ThinkTimer, useT } from '../../lib/kids/kit';
import { speechAt } from '../../lib/kids/acting';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, Dust, MotionLines, Reaction, StageWord, StarWipe, directorCam, hopAt, onBeat, type Shot } from '../../lib/kids/energy';
import { exprAt, lookAt, poseAt, type Keys } from '../../lib/kids/smooth';
import { voKeys, wordHops, type Span } from '../../lib/kids/cues';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsMorals078', durationInSeconds: 311.9, fps: 30, width: 1920, height: 1080 };

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
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff', tilly: '#80ed99', zip: '#bde0fe' };
const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (EASE_OUT(p) - 1) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};
const beat = (x: number) => onBeat(x, 0);

// ── the cast (guests are episode specs; the locked cast is untouched)
const TILLY: CritterSpec = { id: 'tilly', species: 'turtle', fur: '#80ed99', fur2: '#fff3b0', dark: '#2d6a4f', bow: '#ff6fa5' };
const ZIP: CritterSpec = { id: 'zip', species: 'bunny', fur: '#f8f9fa', fur2: '#ffe3ec', dark: '#adb5bd', scarf: '#4cc9f0' };
const TS = 0.4; // Tilly
const ZS = 0.4;
const KS = 0.4; // the kids up on the hill
const BS = 0.5; // Bobo at the bottom

// ── RAINBOW HILL: the hill body, the trail (Tilly walks on it), the plateau on top
const HILL = 'M 0,1080 L 120,1080 C 860,1060 1130,720 1290,480 Q 1350,404 1480,400 L 1920,392 L 1920,1080 Z';
const TRAIL = 'M 330,1010 C 900,990 1150,700 1300,470 Q 1340,418 1400,412';
const TL = getLength(TRAIL);
const onTrail = (u: number): [number, number, number] => {
  const l = Math.max(0, Math.min(1, u)) * TL;
  const p = getPointAtLength(TRAIL, l);
  const g = getTangentAtLength(TRAIL, l);
  return [p.x, p.y, (Math.atan2(g.y, g.x) * 180) / Math.PI];
};
const TOP_Y = 404;
const FLOWERS = [0.3, 0.56, 0.84];
const PEBBLE_U = 0.43;
const MUD_U = 0.66;

// Tilly's trail position u(t): [t, u] keys, eased between
type UK = [number, number][];
const uAt = (t: number, k: UK) => {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) return k[i - 1][1] + (k[i][1] - k[i - 1][1]) * EASE_INOUT((t - k[i - 1][0]) / Math.max(1e-6, k[i][0] - k[i - 1][0]));
  return k[k.length - 1][1];
};
const STEPS = (['s1', 's2', 's3', 's4', 's5'] as const).map((k) => S(k));
const ROLL0 = S('roll') + 0.3;
const ROLL1 = word('roll', 10) + 0.5;
const SLIDE0 = S('slide') + 0.2;
const SLIDE1 = E('slide') - 0.2;
const MUD_AROUND: [number, number] = [word('mud2', 4), S('f3') - 0.3];
const TOP_T = word('top', 2);
const U: UK = [
  [0, 0], [S('zip_b') + 0.4, 0], [S('zip_b') + 1.2, 0.04],
  ...STEPS.flatMap((s, i): UK => [[s, 0.04 + i * 0.075], [s + 0.5, 0.04 + (i + 1) * 0.075]]), [S('pebble'), PEBBLE_U - 0.01], [S('pebble') + 0.3, PEBBLE_U],
  [ROLL0, PEBBLE_U], [ROLL1, 0], [S('try2') + 0.3, 0], [S('mud') - 0.2, MUD_U - 0.04], [S('mud') + 0.8, MUD_U - 0.02], [SLIDE0, MUD_U - 0.02], [SLIDE1, 0],
  [S('try3') + 1.0, 0], [S('f1') - 0.1, FLOWERS[0]], [S('f2') + 0.4, FLOWERS[0]], [S('f2_b') - 0.1, FLOWERS[1]], [MUD_AROUND[0], FLOWERS[1] + 0.02],
  [MUD_AROUND[1], 0.76], [S('f3') + 0.2, 0.76], [word('f3', 3), FLOWERS[2]], [TOP_T - 0.6, 0.95], [TOP_T, 1],
];
// the detour around the mud: off the trail, downhill side
const detour = (t: number) => (within(t, MUD_AROUND[0], MUD_AROUND[1]) ? Math.sin(prog(t, MUD_AROUND[0], MUD_AROUND[1]) * Math.PI) * 70 : 0);
const PLATEAU_X = (t: number) => 1400 + EASE_INOUT(prog(t, TOP_T + 0.4, TOP_T + 2.0)) * 30;
const tillyAt = (t: number): [number, number, number] => {
  const u = uAt(t, U);
  if (t >= TOP_T + 0.4) return [PLATEAU_X(t), TOP_Y + 4, 0];
  const [x, y, a] = onTrail(u);
  const d = detour(t);
  return [x + d * 0.6, y + d, a];
};
const rolling = (t: number) => within(t, ROLL0, ROLL1 + 0.3);
const sliding = (t: number) => within(t, SLIDE0, SLIDE1 + 0.2);
const walking = (t: number) => STEPS.some((s) => within(t, s, s + 0.5)) || within(t, S('try2') + 0.3, S('mud') - 0.2) || within(t, S('try3') + 1.0, S('f1') - 0.1)
  || within(t, S('f2') + 0.4, S('f2_b') - 0.1) || within(t, MUD_AROUND[0], MUD_AROUND[1]) || within(t, S('f3') + 0.2, TOP_T) || within(t, TOP_T + 0.4, TOP_T + 2);
const tuckAt = (t: number) => (rolling(t) ? 1 : within(t, word('hide', 2), S('secret_b')) ? Math.min(1, prog(t, word('hide', 2), word('hide', 2) + 0.4)) : within(t, S('secret_b'), S('out')) ? 0.55 : 0);

// Zip the bunny: zooms up the trail, waits on the plateau, by the tree for his kite
const ZIP_GO = word('zip', 6);
const zipAt = (t: number): [number, number] => {
  if (t < ZIP_GO) return [520, 1004];
  if (t < ZIP_GO + 1.3) { const [x, y] = onTrail(0.33 + EASE_INOUT(prog(t, ZIP_GO, ZIP_GO + 1.3)) * 0.67); return [x, y]; }
  const x = 1400 + EASE_INOUT(prog(t, ZIP_GO + 1.3, ZIP_GO + 2.4)) * 365;
  return [x, TOP_Y];
};
const X = { mila: 1545, leo: 1655 };
const BOBO_X = (t: number) => 200 + EASE_INOUT(prog(t, S('bobo1') - 1.2, S('bobo1'))) * 40 - EASE_INOUT(prog(t, S('try2'), S('try2') + 1.2)) * 40
  + EASE_INOUT(prog(t, S('knock') - 1.4, S('knock'))) * 50 - EASE_INOUT(prog(t, S('try3'), S('try3') + 1.2)) * 50;
const BOBO_Y = 1052;
const TREE: [number, number] = [1880, TOP_Y];
const KITE_FREE = word('zfree', 5);

// ── arms, faces
const BYE: Span<KArm> = [S('bye'), 999, 'wave'];
const RHYME: Span<KArm> = [S('c1'), E('c_turn') + 0.3, 'cheer'];
const KITE_HOLD: Span<KArm> = [0, S('cheer') - 0.3, 'up'];
const MILA_R = voKeys<KArm>(VO, 'mila', 'up', 'up', [KITE_HOLD, [S('cheer') - 0.3, E('cheer_turn') + 0.4, 'cheer'], [S('happy_b'), E('happy_b') + 0.4, 'present'], [E('happy_b') + 0.4, S('rem'), 'up'], [S('rem'), S('chant'), 'present'], RHYME, BYE]);
const MILA_L = voKeys<KArm>(VO, null, 'down', 'down', [[S('cheer') - 0.3, E('cheer_turn') + 0.4, 'cheer'], [S('top'), E('top') + 1, 'cheer'], RHYME, BYE]);
const MILA_E = voKeys<KExpr>(VO, 'mila', 'happy', 'smile', [[S('roll'), E('roll_b'), 'surprised'], [S('giveup'), S('out'), 'sad'], [S('top'), E('happy') + 1, 'laugh'], [S('c1'), E('c_turn'), 'laugh']]);
const LEO_R = voKeys<KArm>(VO, 'leo', 'up', 'up', [KITE_HOLD, [S('cheer') - 0.3, E('cheer_turn') + 0.4, 'cheer'], [S('top'), E('top') + 1, 'cheer'], [E('top') + 1, S('rem'), 'up'], [S('rem'), S('chant'), 'present'], RHYME, BYE]);
const LEO_L = voKeys<KArm>(VO, null, 'down', 'down', [[S('cheer') - 0.3, E('cheer_turn') + 0.4, 'cheer'], [S('top'), E('top') + 1, 'cheer'], RHYME, BYE]);
const LEO_E = voKeys<KExpr>(VO, 'leo', 'happy', 'smile', [[S('roll'), E('roll_b'), 'surprised'], [S('giveup'), S('out'), 'sad'], [S('top'), E('happy') + 1, 'laugh'], [S('c1'), E('c_turn'), 'laugh']]);
const TILLY_A = voKeys<CArm>(VO, 'tilly', 'wave', 'down', [
  [0, E('want'), 'point'], [S('giveup'), E('giveup'), 'cheeks'], [S('out'), E('out'), 'cheer'], [S('rest'), E('rest'), 'hug'], [S('top'), E('top') + 0.8, 'cheer'],
  [S('kite'), S('zstuck'), 'up'], [S('zbreathe'), E('zbreathe'), 'point'], [S('zall'), S('rem'), 'up'], [S('ra5'), E('ra5'), 'cheer'], [S('c1'), E('c_turn') + 0.3, 'cheer'], [S('bye'), 999, 'wave'],
]);
const TILLY_E = voKeys<KExpr>(VO, 'tilly', 'happy', 'smile', [
  [0, E('want'), 'wow'], [S('pebble'), E('roll_b'), 'surprised'], [E('roll_b') - 0.6, E('roll_b'), 'sad'], [S('mud'), E('slide'), 'oops'], [S('giveup'), S('secret_b'), 'sad'],
  [S('secret_b'), S('out'), 'surprised'], [S('out'), E('out'), 'proud'], [S('rest'), E('rest'), 'sleepy'], [S('mud2'), E('mud2'), 'think'], [S('top'), E('top') + 1, 'laugh'],
  [S('proud'), E('proud') + 0.6, 'proud'], [S('c1'), E('c_turn'), 'laugh'],
]);
const ZIP_A = voKeys<CArm>(VO, 'zip', 'wave', 'down', [[S('zstuck'), word('zstuck', 9), 'up'], [word('zstuck', 9), E('zstuck'), 'cheeks'], [S('zfree'), KITE_FREE, 'up'], [KITE_FREE, S('rem'), 'up'], [S('c1'), E('c_turn') + 0.3, 'cheer'], [S('bye'), 999, 'wave']]);
const ZIP_E = voKeys<KExpr>(VO, 'zip', 'happy', 'smile', [[S('zstuck'), E('zstuck'), 'sad'], [S('zturn'), S('zfree'), 'think'], [KITE_FREE, E('zfree') + 0.6, 'laugh'], [S('c1'), E('c_turn'), 'laugh']]);
const BOBO_A = voKeys<CArm>(VO, 'bobo', 'wave', 'down', [
  [S('knock'), word('knock', 2), { a: 60 }], [S('t1'), E('t1_turn'), 'point'], [S('t2_b'), E('t2_b'), 'hug'], [S('t3'), E('t3_b'), 'point'], [S('try3'), S('top'), 'cheer'],
  [S('top'), E('top') + 1, 'cheer'], [S('ra2'), E('ra2'), 'point'], [S('c1'), E('c_turn') + 0.3, 'cheer'], [S('bye'), 999, 'wave'],
]);
const BOBO_E = voKeys<KExpr>(VO, 'bobo', 'happy', 'smile', [[S('roll'), E('roll'), 'surprised'], [S('giveup'), S('knock'), 'sad'], [S('secret'), E('secret'), 'laugh'], [S('top'), E('top') + 1, 'laugh'], [S('c1'), E('c_turn'), 'laugh']]);
const looks: Keys<[number, number]> = [
  [0, [0.6, -0.6]], [S('intro'), [0, 0]], [S('zip'), [0.6, -0.6]], [S('feel_q'), [0, 0]], [S('knock'), [-0.4, 0]], [S('t1_turn'), [0, 0]], [E('t1_turn'), [-0.4, 0]],
  [S('t2_b'), [0, 0]], [S('t3'), [-0.4, 0]], [S('try3'), [0.6, -0.6]], [S('cheer_turn'), [0, 0]], [S('f3'), [0.6, -0.6]], [S('top'), [0, 0]], [S('kite'), [0.3, -1]],
  [S('zstuck'), [0.6, -0.4]], [S('zturn'), [0, 0]], [S('zbreathe'), [0.6, -0.4]], [S('moral'), [0, 0]],
];
const HOPS = [S('top') + 0.1, S('top') + 0.8, KITE_FREE + 0.1, ...wordHops(VO, [K.c1, K.c2, K.c3], 2), S('ra5') + 0.1];

// ── camera
const WIDE = { z: 1.0, x: 960, y: 540 };
const BOTTOM = { z: 1.45, x: 420, y: 800 };
const TOP = { z: 1.4, x: 1600, y: 300 };
const tillyCU = (t: number) => { const [x, y] = tillyAt(t); return { z: 1.7, x: Math.max(300, Math.min(1660, x)), y: Math.max(330, y - 90) }; };
const follow = (a: number, b: number, z = 1.3, every = 1.2): Shot[] => {
  const out: Shot[] = [];
  for (let x = a; x < b; x += every) {
    const [px, py] = tillyAt(x + every);
    out.push({ t: x, z, x: Math.max(560, Math.min(1360, px)), y: Math.max(420, Math.min(760, py - 60)), move: 'smooth', dur: every, push: 0 });
  }
  return out;
};
const kFace = (x: number, y: number) => kidFaceAt(x, y, KS)[1] + 50;
const BOBO_CU = (t: number) => ({ z: 1.6, x: Math.max(330, BOBO_X(t) + 120), y: critterFaceAt(BOBO_X(t), BOBO_Y, BS)[1] + 120 });
const SHOTS: Shot[] = [
  { t: 0, ...WIDE, move: 'cut', push: 0.01 },
  { t: S('intro') - 0.1, ...tillyCU(S('intro')), move: 'smooth', dur: 0.8, push: 0.015 },
  { t: S('zip') - 0.1, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('try1') - 0.2, ...BOTTOM, move: 'smooth', dur: 0.6 },
  ...follow(STEPS[0], S('pebble'), 1.35, 1.1),
  { t: S('pebble') - 0.1, ...tillyCU(S('pebble')), move: 'snap' },
  { t: ROLL0 - 0.1, ...WIDE, move: 'smooth', dur: 0.5 },
  { t: S('roll_b') - 0.1, ...tillyCU(S('roll_b')), move: 'smooth', dur: 0.5 },
  { t: S('bobo1') - 0.1, ...BOTTOM, move: 'smooth', dur: 0.5 },
  ...follow(S('try2') + 0.2, S('mud') - 0.2, 1.3, 1.2),
  { t: S('mud') - 0.1, ...tillyCU(S('mud')), move: 'snap' },
  { t: SLIDE0 - 0.1, ...WIDE, move: 'smooth', dur: 0.5 },
  { t: S('giveup') - 0.1, ...tillyCU(S('giveup')), move: 'smooth', dur: 0.6, push: 0.02 },
  { t: S('feel') - 0.1, ...BOTTOM, move: 'smooth', dur: 0.8, push: 0.01 },
  { t: S('knock') - 0.1, ...BOBO_CU(S('knock')), move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('secret_b') - 0.1, ...tillyCU(S('secret_b')), move: 'snap' },
  { t: S('secret_c') - 0.1, ...BOTTOM, move: 'smooth', dur: 0.6, push: 0.012 },
  { t: S('t1_turn') - 0.1, ...BOBO_CU(S('t1_turn')), move: 'snap' },
  { t: S('t2') - 0.1, ...BOTTOM, move: 'smooth', dur: 0.5, push: 0.01 },
  { t: S('out') - 0.1, ...tillyCU(S('out')), move: 'snap' },
  ...follow(S('try3') + 0.4, S('cheer') - 0.2, 1.3, 1.4),
  { t: S('cheer') - 0.1, ...TOP, move: 'whip' },
  { t: S('cheer_turn') - 0.1, ...WIDE, move: 'smooth', dur: 0.6 },
  ...follow(S('f3'), TOP_T - 0.2, 1.35, 1.0),
  { t: TOP_T - 0.1, ...TOP, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('kite') - 0.1, z: 1.15, x: 1360, y: 360, move: 'smooth', dur: 0.8, push: 0.01 },
  { t: S('proud') - 0.1, ...tillyCU(S('proud')), move: 'smooth', dur: 0.6 },
  { t: S('zstuck') - 0.1, z: 1.22, x: 1500, y: 330, move: 'smooth', dur: 0.6 },
  { t: S('zturn') - 0.1, ...tillyCU(S('zturn')), move: 'snap' },
  { t: S('zbreathe') - 0.1, z: 1.22, x: 1500, y: 330, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('zall') - 0.1, z: 1.1, x: 1300, y: 420, move: 'smooth', dur: 1.0, push: 0.01 },
  { t: S('moral') - 0.1, ...WIDE, move: 'smooth', dur: 1.0, push: 0.008 },
  { t: S('rem') - 0.1, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('chant') - 0.2, z: 1.06, x: 1100, y: 500, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('bye') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
];
SHOTS.sort((a, b) => a.t - b.t);
const PUNCHES = [S('pebble') + 0.1, ROLL1, TOP_T, KITE_FREE];
const END_IRIS = E('bye2') + 0.6;

// ── props
const Flower: React.FC<{ c: string; t: number; k: number; glow?: boolean }> = ({ c, t, k, glow }) => (
  <g transform={`rotate(${Math.sin(t * 1.4 + k) * 4})`}>
    <rect x={-4} y={-70} width={8} height={70} rx={4} fill="#2d6a4f" />
    {glow && <circle cy={-76} r={46} fill="#fff3b0" opacity={0.6} />}
    {[0, 1, 2, 3, 4].map((j) => <circle key={j} cx={Math.cos((j / 5) * Math.PI * 2) * 18} cy={-76 + Math.sin((j / 5) * Math.PI * 2) * 18} r={14} fill={c} {...kst(3)} />)}
    <circle cy={-76} r={11} fill="#ffd23f" {...kst(3)} />
  </g>
);
const Kite: React.FC<{ c: string; c2: string; s?: number; t: number; k: number }> = ({ c, c2, s = 1, t, k }) => (
  <g transform={`scale(${s}) rotate(${Math.sin(t * 1.3 + k) * 8})`}>
    <Vol><path d="M 0,-60 L 44,0 L 0,70 L -44,0 Z" fill={c} {...kst(4)} /></Vol>
    <path d="M 0,-60 L 0,70 M -44,0 L 44,0" stroke={c2} strokeWidth={5} />
    <path d={`M 0,70 q ${10 + Math.sin(t * 3 + k) * 8},30 0,60 q ${-10 - Math.sin(t * 3 + k) * 8},30 0,60`} fill="none" stroke={KINK} strokeWidth={3} />
    {[0, 1, 2].map((j) => <path key={j} d={`M 0,${96 + j * 30} l -10,-8 l 0,16 Z M 0,${96 + j * 30} l 10,-8 l 0,16 Z`} fill={['#ff595e', '#ffca3a', '#4cc9f0'][j]} />)}
  </g>
);
const Tree: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Vol kind="tube"><rect x={-26} y={-200} width={52} height={200} rx={14} fill="#a0663f" {...kst(5)} /></Vol>
    <g transform={`rotate(${Math.sin(t * 0.8) * 1.5} 0 -200)`}>
      <Vol><circle cx={-60} cy={-250} r={80} fill="#52b788" {...kst(5)} /><circle cx={50} cy={-280} r={90} fill="#52b788" {...kst(5)} /><circle cx={-10} cy={-340} r={80} fill="#74c69d" {...kst(5)} /></Vol>
    </g>
  </g>
);
// the memory card for "let's remember" (in the sky, over the meadow)
const Memory: React.FC<{ k: Key; t: number }> = ({ k, t }) => {
  const icon: Record<string, React.ReactNode> = {
    rq1: <Kite c="#ff6fa5" c2="#ffffff" t={t} k={0} s={1.3} />,
    rq2: <g><circle r={30} fill="#adb5bd" {...kst(4)} /><path d="M 40,-20 q 40,-30 80,0" fill="none" stroke={KINK} strokeWidth={6} strokeDasharray="10 8" /></g>,
    rq3: <g><circle r={70} fill="#80ed99" {...kst(5)} /><path d="M -30,-16 l 20,8 M 30,-16 l -20,8" {...kst(6)} /><path d="M -26,34 Q 0,16 26,34" fill="none" {...kst(6)} /></g>,
    rq4: <text y={36} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={110} fill="#ff6fa5" stroke={KINK} strokeWidth={6} paintOrder="stroke">YET!</text>,
    rq5: <g>{FLOWERS.map((_, j) => <g key={j} transform={`translate(${(j - 1) * 90},${40 - j * 30}) scale(0.8)`}><Flower c={['#ff6fa5', '#9b5de5', '#ff924c'][j]} t={t} k={j} /></g>)}</g>,
    rq6: <g><circle cx={-60} cy={20} r={40} fill="none" stroke={KINK} strokeWidth={10} /><circle cx={60} cy={20} r={40} fill="none" stroke={KINK} strokeWidth={10} /><path d="M -60,20 L -10,-30 L 40,-30 L 60,20 M -10,-30 L 0,20 L 40,-30" fill="none" stroke="#ff595e" strokeWidth={10} strokeLinejoin="round" /></g>,
    rq7: <g><ellipse rx={80} ry={30} fill="#8d5a3b" {...kst(4)} /><path d="M -110,50 Q 0,110 110,50" fill="none" stroke="#2dc653" strokeWidth={10} strokeDasharray="16 10" /></g>,
  };
  return <g>{icon[k]}</g>;
};
const MEM_KEYS = ['rq1', 'rq2', 'rq3', 'rq4', 'rq5', 'rq6', 'rq7'] as const;

export default function KidsMorals078() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const hop = hopAt(t, HOPS, { h: 40 });
  const [tx, ty, ta] = tillyAt(t);
  const spin = rolling(t) ? -prog(t, ROLL0, ROLL1) * 1080 : 0;
  const slideTilt = sliding(t) ? -18 : 0;
  const tTilt = t >= TOP_T + 0.4 ? 0 : ta * 0.55 + slideTilt;
  const [zx, zy] = zipAt(t);
  const zipping = within(t, ZIP_GO, ZIP_GO + 2.4);
  const bx = BOBO_X(t);
  const kiteUp = prog(t, S('kite'), S('kite') + 3.5);
  const zipKiteFree = t >= KITE_FREE;
  const mem = MEM_KEYS.filter((k) => t >= S(k) - 0.2 && t < VO[K[k] + 1].end + 1.0).pop();
  const memAt = mem ? S(mem) - 0.2 : 0;

  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
        <Backdrop place="meadow" w={W} h={H} t={t} fx={false} />
        {/* the kites the kids fly from the top (strings to their hands) */}
        {t < S('rem') + 999 && (
          <g>
            {[[X.mila, '#ffca3a', '#ff6fa5', 1220, 150], [X.leo, '#4cc9f0', '#1982c4', 1500, 110]].map(([x, c, c2, kx, ky], k) => (
              <g key={k}>
                <path d={`M ${x as number + 40},${TOP_Y - 190} Q ${((x as number) + (kx as number)) / 2},${TOP_Y - 120} ${kx as number + Math.sin(t * 1.3 + k) * 10},${(ky as number) + 140}`} fill="none" stroke={KINK} strokeWidth={2} opacity={0.6} />
                <g transform={`translate(${kx as number + Math.sin(t * 1.3 + k) * 10},${ky})`}><Kite c={c as string} c2={c2 as string} t={t} k={k} s={0.8} /></g>
              </g>
            ))}
          </g>
        )}
        {/* Tilly's kite: rolled up on her back, then high above everyone */}
        {t >= S('kite') && (
          <g>
            <path d={`M ${tx + 30},${ty - 90} Q ${tx - 60},${ty - 300 * kiteUp} ${1100 + Math.sin(t) * 12},${ty - 80 - 300 * kiteUp}`} fill="none" stroke={KINK} strokeWidth={2} opacity={0.6} />
            <g transform={`translate(${1100 + Math.sin(t) * 12},${ty - 200 - 300 * EASE_OUT(kiteUp)})`}><Kite c="#ff6fa5" c2="#80ed99" t={t} k={3} s={0.9} /></g>
          </g>
        )}
        {/* RAINBOW HILL */}
        <Vol kind="slope"><path d={HILL} fill="#95d5b2" {...kst(6)} /></Vol>
        <path d={TRAIL} fill="none" stroke="#e9c46a" strokeWidth={46} strokeLinecap="round" opacity={0.85} />
        <path d={TRAIL} fill="none" stroke="#f4dfa0" strokeWidth={30} strokeLinecap="round" strokeDasharray="2 26" opacity={0.7} />
        {(() => { const [x, y] = onTrail(MUD_U); return <ellipse cx={x} cy={y + 6} rx={70} ry={24} fill="#8d5a3b" {...kst(4)} transform={`rotate(-40 ${x} ${y})`} />; })()}
        {t < ROLL0 && (() => { const [x, y] = onTrail(PEBBLE_U + 0.02); return <g transform={`translate(${x},${y - 6})`}><Vol><ellipse rx={22} ry={15} fill="#adb5bd" {...kst(4)} /></Vol></g>; })()}
        {FLOWERS.map((u, k) => {
          const [x, y] = onTrail(u);
          const lit = (k === 0 && t >= S('f1')) || (k === 1 && t >= S('f2_b')) || (k === 2 && t >= word('f3', 3));
          const show = t >= S('t3') - 0.2 || t < S('try1');
          return show && <g key={k} transform={`translate(${x - 70},${y + 10}) scale(${t >= S('t3') - 0.2 && t < S('t3') + 2 ? popIn(t, S('t3') + k * 0.25) : 1})`}><Flower c={['#ff6fa5', '#9b5de5', '#ff924c'][k]} t={t} k={k} glow={lit} /></g>;
        })}
        <g transform={`translate(${TREE[0]},${TREE[1] + 10})`}><Tree t={t} /></g>
        {/* Zip's kite: in the tree, then free */}
        {t >= S('happy') && (
          <g transform={zipKiteFree ? `translate(${TREE[0] - 28 - EASE_OUT(prog(t, KITE_FREE, KITE_FREE + 2)) * 330},${TREE[1] - 250 - EASE_OUT(prog(t, KITE_FREE, KITE_FREE + 2)) * 40})` : `translate(${TREE[0] - 28},${TREE[1] - 250}) rotate(${Math.sin(t * 9) * (within(t, S('zstuck'), word('zstuck', 9)) ? 8 : 1)})`}>
            <Kite c="#ffb347" c2="#ff924c" t={t} k={4} s={0.8} />
            {!zipKiteFree && [[-10, -50, 30], [30, -10, 26], [-30, 20, 22]].map(([x, y, r], j) => <circle key={j} cx={x} cy={y} r={r} fill="#52b788" stroke="#2d6a4f" strokeWidth={3} />)}
          </g>
        )}
        <PlaceLight place="meadow">
          <Kid polish acting spec={MILA_HERO} x={X.mila} y={TOP_Y + 8} scale={KS} expr={exprAt(t, MILA_E)} look={lookAt(t, [[0, [-0.6, 0.4]], [S('kite'), [-0.6, -0.4]], [S('moral'), [0, 0]]])} {...speechAt(VO, 'mila', t)}
            armL={poseAt(t, MILA_L)} armR={poseAt(t, MILA_R)} hop={hop.hop} squash={hop.squash} />
          <Kid polish acting spec={LEO_HERO} x={X.leo} y={TOP_Y + 8} scale={KS} expr={exprAt(t, LEO_E)} look={lookAt(t, [[0, [-0.6, 0.4]], [S('kite'), [-0.6, -0.4]], [S('moral'), [0, 0]]])} {...speechAt(VO, 'leo', t)}
            armL={poseAt(t, LEO_L)} armR={poseAt(t, LEO_R)} hop={hop.hop} squash={hop.squash} />
          <Critter polish acting spec={ZIP} x={zx} y={zy} scale={ZS} expr={exprAt(t, ZIP_E)} look={lookAt(t, [[0, [0.6, -0.4]], [S('zhelp'), [-0.6, 0]], [S('moral'), [0, 0]]])} {...speechAt(VO, 'zip', t)}
            armL={poseAt(t, ZIP_A)} armR={poseAt(t, ZIP_A)} walk={t * 4} walking={zipping} hop={zipping ? Math.abs(Math.sin(t * 14)) * 30 : hop.hop} squash={hop.squash} facing={zipping || t < ZIP_GO ? 1 : -1} />
          <Critter polish acting spec={BOBO_HERO} x={bx} y={BOBO_Y} scale={BS} expr={exprAt(t, BOBO_E)} look={lookAt(t, [[0, [0.6, -0.5]], [S('knock') - 1, [0.6, 0]], [S('try3'), [0.6, -0.5]], [S('moral'), [0, 0]]])} {...speechAt(VO, 'bobo', t)}
            armL={poseAt(t, BOBO_A)} armR={poseAt(t, BOBO_A)} hop={hop.hop} squash={hop.squash} />
          <g transform={`rotate(${tTilt + spin} ${tx} ${ty - 70 * TS})`}>
            <Critter polish acting spec={TILLY} x={tx} y={ty} scale={TS} expr={exprAt(t, TILLY_E)} look={lookAt(t, looks)} {...speechAt(VO, 'tilly', t)}
              armL={poseAt(t, TILLY_A)} armR={poseAt(t, TILLY_A)} walk={t * 2.4} walking={walking(t)} tuck={tuckAt(t)} hop={hop.hop} squash={hop.squash} idle={!rolling(t)} />
          </g>
        </PlaceLight>
        <MotionLines t={t} from={ZIP_GO} to={ZIP_GO + 1.3} x={zx} y={zy - 80} dir={-40} />
        {within(t, ROLL1, ROLL1 + 0.6) && <Dust t={t} at={ROLL1} x={tx} y={ty} />}
        {within(t, SLIDE1, SLIDE1 + 0.6) && <Dust t={t} at={SLIDE1} x={tx} y={ty} />}
        <StageWord t={t} at={ZIP_GO} until={ZIP_GO + 1.4} text="ZOOM!" x={700} y={820} size={90} color="#4cc9f0" rot={-6} />
        <StageWord t={t} at={S('pebble')} until={S('pebble') + 1.2} text="OOPS!" x={tx} y={ty - 170} size={80} color="#ff924c" rot={5} />
        <StageWord t={t} at={word('roll', 10)} until={E('roll') + 0.3} text="ROLL ROLL ROLL!" x={700} y={760} size={76} color="#80ed99" rot={-4} />
        <StageWord t={t} at={S('slide')} until={E('slide') + 0.2} text="WHEE!" x={760} y={760} size={90} color="#8d5a3b" rot={6} />
        <StageWord t={t} at={S('knock')} until={word('knock', 2) + 0.6} text="KNOCK KNOCK!" x={bx + 260} y={BOBO_Y - 260} size={70} color="#ffca3a" rot={-5} />
        <StageWord t={t} at={S('cheer')} until={E('cheer_b') + 0.4} text="GO, TILLY, GO!" x={1600} y={TOP_Y - 280} size={70} color="#ff6fa5" rot={-4} />
        <StageWord t={t} at={KITE_FREE} until={KITE_FREE + 1.4} text="FREE!" x={1640} y={150} size={84} color="#4cc9f0" rot={5} />
        <Reaction kind="!" t={t} at={S('pebble')} until={S('roll')} x={tx} y={ty - 220} s={0.45} />
        <Reaction kind="stars" t={t} at={ROLL1} until={E('roll_b')} x={tx} y={ty - 180} s={0.45} />
        <Reaction kind="sweat" t={t} at={S('mud')} until={E('slide')} x={tx + 40} y={ty - 180} s={0.45} />
        <Reaction kind="steam" t={t} at={S('giveup')} until={E('giveup') + 0.4} x={tx} y={ty - 200} s={0.45} />
        <Reaction kind="cloud" t={t} at={S('feel')} until={S('knock')} x={tx} y={ty - 150} s={0.5} />
        <Reaction kind="idea" t={t} at={S('out')} until={E('out')} x={tx} y={ty - 200} s={0.45} />
        <Reaction kind="heart" t={t} at={S('top')} until={E('top') + 0.6} x={tx} y={ty - 200} s={0.5} />
        <Reaction kind="cloud" t={t} at={S('zstuck')} until={E('zstuck') + 0.2} x={zx} y={zy - 230} s={0.45} />
        {/* let's remember: the card in the sky */}
        {mem && (
          <g transform={`translate(720,330) scale(${popIn(t, memAt + 0.05, 0.4) * 1.15})`}>
            <rect x={-230} y={-150} width={460} height={300} rx={40} fill="#ffffff" {...kst(7)} />
            <Memory k={mem} t={t} />
          </g>
        )}
      </ActionStage>

      {/* screen-space */}
      <PopText t={t} at={0.3} until={S('intro') - 0.1} text="🪁 TO THE TOP!" y={100} size={110} color="#ff6fa5" />
      <PopText t={t} at={S('try1')} until={S('pebble') - 0.1} text="COUNT HER STEPS!" y={100} size={100} color="#ffffff" />
      {(['s1', 's2', 's3', 's4', 's5'] as const).map((k, i) => <PopText key={k} t={t} at={S(k)} until={i < 4 ? S(['s2', 's3', 's4', 's5'][i] as Key) - 0.05 : S('pebble') - 0.1} text={`${i + 1}`} y={260} size={150} color={['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#4cc9f0'][i]} />)}
      <PopText t={t} at={S('feel')} until={S('feel_q') - 0.1} text="FRUSTRATED 😣" y={100} size={110} color="#ff924c" />
      <PopText t={t} at={S('t1')} until={S('t2') - 0.1} text="1 · I CAN'T DO IT… YET!" y={100} size={84} color="#ff6fa5" />
      <PopText t={t} at={S('t2')} until={S('t3') - 0.1} text="2 · REST + BREATHE 🌬️" y={100} size={90} color="#4cc9f0" />
      <PopText t={t} at={S('t3')} until={S('out') - 0.1} text="3 · ONE STEP AT A TIME 🌸" y={100} size={84} color="#9b5de5" />
      <PopText t={t} at={S('t1_turn')} until={E('t1_turn') + 1.6} text="🗣️ YOUR TURN!" y={240} size={90} color="#ffffff" />
      <PopText t={t} at={S('f1')} until={S('rest') - 0.1} text="🌸 FLOWER 1!" y={100} size={110} color="#ff6fa5" />
      <PopText t={t} at={S('f2_b')} until={S('mud2') - 0.1} text="🌸 FLOWER 2!" y={100} size={110} color="#9b5de5" />
      <PopText t={t} at={S('mud2')} until={S('cheer') - 0.1} text="GO AROUND!" y={100} size={110} color="#8d5a3b" />
      <PopText t={t} at={S('cheer_turn')} until={S('f3') - 0.1} text="📣 GO, TILLY, GO!" y={100} size={110} color="#ffffff" />
      <PopText t={t} at={word('f3', 3)} until={TOP_T - 0.1} text="🌸 ONE MORE STEP…" y={100} size={100} color="#ff924c" />
      <PopText t={t} at={TOP_T} until={S('happy_b') - 0.1} text="⭐ THE TOP! ⭐" y={100} size={120} color="#ffca3a" />
      <PopText t={t} at={S('zturn')} until={S('zbreathe') - 0.1} text="🗣️ …YET!" y={100} size={120} color="#ffffff" />
      <PopText t={t} at={S('moral')} until={S('rem') - 0.1} text="KEEP TRYING, ONE STEP AT A TIME" y={100} size={76} color="#ffca3a" />
      <PopText t={t} at={S('rem')} until={S('rq1') - 0.1} text="LET'S REMEMBER!" y={100} size={110} color="#ffca3a" />
      <PopText t={t} at={S('ra3')} until={S('rq4') - 0.2} text="FRUSTRATED!" y={100} size={110} color="#ff924c" />
      <PopText t={t} at={S('ra4')} until={S('rq5') - 0.2} text="YET!" y={100} size={140} color="#ff6fa5" />
      <PopText t={t} at={S('c1')} until={S('c2') - 0.05} text="STEP BY STEP, I CLIMB THE HILL!" y={100} size={76} color="#80ed99" />
      <PopText t={t} at={S('c2')} until={S('c3') - 0.05} text="IF I FALL, I TRY AGAIN!" y={100} size={84} color="#4cc9f0" />
      <PopText t={t} at={S('c3')} until={S('c_turn') - 0.05} text="I CAN'T DO IT YET, BUT I WILL!" y={100} size={76} color="#ff6fa5" />
      <PopText t={t} at={S('c_turn')} until={S('bye') - 0.1} text="🗣️ YOUR TURN!" y={100} size={110} color="#ffffff" />
      <PopText t={t} at={S('bye')} until={END_IRIS} text="KEEP TRYING! SEE YOU NEXT TIME!" y={100} size={80} color="#ffca3a" />
      {(['feel_q', 'rq1', 'rq2', 'rq3', 'rq4', 'rq5', 'rq6', 'rq7'] as const).map((q) => (
        <ThinkTimer key={q} t={t} from={beat(E(q) + 0.1)} to={VO[K[q] + 1].start - 0.1} x={1780} y={170} r={84} />
      ))}
      <Confetti t={t} at={TOP_T} y={360} />
      <Confetti t={t} at={KITE_FREE} y={360} />
      <Confetti t={t} at={E('c3')} y={360} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <StarWipe t={t} at={END_IRIS} dur={0.5} hold={5} color="#80ed99" x={W / 2} y={H * 0.45} />
    </>
  );
}
