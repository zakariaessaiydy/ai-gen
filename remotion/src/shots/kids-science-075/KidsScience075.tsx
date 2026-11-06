// TINY SPARKS · Day 75 · 🚀 Science for Kids #11 — "What Is Thunder?" (LONG 16:9)
// kids-shorts/tiny-sparks/science/day-075-what-is-thunder. Cues from VO via K (keys.gen.ts).
// A PAJAMA SLEEPOVER in the bedroom, a storm in the window (the sister episode of Day 68 "What Is Lightning?", which
// covered the flash-then-count and the storm rule outside — this one stays cosy INSIDE and is about the SOUND).
// COLD OPEN (no ident): a flash in the window + BOOM at 0.1 s, Bobo jumps, Mila: "What is thunder?" at 1 s → Leo's guess
// (two clouds bumping, BONK) + Bobo's (a giant's drum) → Hoot: clouds are soft like fog; thunder is THE SOUND OF LIGHTNING
// → we're inside: when thunder roars, go indoors → Q1 lightning heats the air so fast it jumps out of the way = BOOM →
// Bobo pops a balloon (a tiny thunder) → Q2 every sound is the air SHAKING: clap · rice on Bobo's drum · "aaah" with a hand
// on the neck → Q3 near = CRACK, far = RUMBLE (long lightning: the sound arrives a little at a time) + 2 think quizzes →
// thunder is only a sound (Bobo is scared: a teddy, cover ears, sing with a friend) → try it with a grown-up: the paper
// bag pop → WOW (heard from far away; if you hear it, go inside; every lightning makes thunder) → quiz (3, Bobo ✗ "the drum
// giant!") → remember (5) → the thunder rhyme → the storm is over → bye + star iris.
// Facts (NOAA / NWS / National Geographic Kids): lightning heats the air around it to ~30,000 °C (≈5× the Sun's surface)
// in a split second; the air expands explosively → the shock wave becomes the sound of thunder; nearby thunder is a sharp
// crack, distant thunder rumbles because sound from different parts of the long channel arrives at different times;
// thunder can be heard ~10 miles away and "if you can hear thunder, you are close enough to be struck" → go indoors;
// all lightning produces thunder. The paper-bag pop is safe with a grown-up (no heat, nothing to swallow).
import React from 'react';
import { Kid, kidFaceAt, type KArm } from '../../lib/kids/kid';
import { Critter, critterFaceAt, type CArm } from '../../lib/kids/critter';
import { CAPTION_COLORS } from '../../lib/kids/cast/tiny-sparks';
import { dress } from '../../lib/kids/cast/wardrobe';
import { Backdrop, PlaceLight, standY } from '../../lib/kids/places';
import { AnswerMark, Balloon, Confetti, FONT_TOON, KidsCaptions, PopText, ThinkTimer, useT } from '../../lib/kids/kit';
import { speechAt } from '../../lib/kids/acting';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, ImpactStar, Reaction, StageWord, StarWipe, directorCam, hopAt, onBeat, shakeOf, type Hit, type Shot } from '../../lib/kids/energy';
import { exprAt, lookAt, poseAt, type Keys } from '../../lib/kids/smooth';
import { voKeys, wordHops, type Span } from '../../lib/kids/cues';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsScience075', durationInSeconds: 335.2, fps: 30, width: 1920, height: 1080 };

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

// ── place, outfits, blocking
const PLACE = 'bedroom' as const;
const VAR = 1; // bedroom-169-b: the arched window on the right
const MILA = dress('mila', 'pajamas');
const LEO = dress('leo', 'pajamas');
const BOBO = dress('bobo', 'pajamas');
const HOOT = dress('hoot', 'pajamas');
const KS = 0.52;
const CS = 0.54;
const X = { mila: 230, leo: 420, bobo: 1290, hoot: 1640 };
const yAt = (x: number, s: number) => standY(PLACE, x, W, H, { halfW: 150 * s });
const CZ: [number, number] = [830, 340]; // Hoot's picture card
const CW = 760;
const CH = 440;
// the arched window of the painting (stage coords)
const WIN = 'M 1462,548 L 1462,300 A 135,135 0 0 1 1732,300 L 1732,548 Z';
const WINC: [number, number] = [1597, 380];

// ── the storm: when the window flashes (a flash = 0.14 s, never more than one a second)
const POP = S('pop');
const CRACK = word('crack', 8);
const RUMBLE0 = word('rumble', 8);
const FLASH = [0.1, E('rule'), S('hot') + 0.2, CRACK, RUMBLE0, S('rq_near') + 0.5, S('rq_far') + 0.5, S('scary') - 0.4, S('wow') + 0.2, S('g2') + 0.3, S('chant') + 0.2, word('c1', 1)];
const STORM_END = S('over');
const flashAt = (t: number) => FLASH.reduce((m, f) => Math.max(m, t >= f && t < f + 0.5 ? (1 - (t - f) / 0.5) ** 2 : 0), 0);
const HITS: Hit[] = [{ at: 0.1, amp: 10, dur: 0.4 }, { at: CRACK, amp: 12, dur: 0.35 }, { at: POP, amp: 8, dur: 0.25 }, { at: word('boom', 7), amp: 10, dur: 0.35 }];

// ── what Hoot's card shows (in time order)
type Card = 'none' | 'guess' | 'answer' | 'heat' | 'popair' | 'clap' | 'drum' | 'neck' | 'crack' | 'rumble' | 'long' | 'qfarq' | 'qnearq'
  | 'bag' | 'wow' | 'g1' | 'g2' | 'g3' | 'r1' | 'r2' | 'r3' | 'r4' | 'r5' | 'rhyme';
const CARDS: [number, Card][] = [
  [0, 'none'], [S('guess') - 0.2, 'guess'], [S('answer') - 0.2, 'answer'], [S('safe') - 0.2, 'none'], [S('hot') - 0.2, 'heat'],
  [S('pop_q') - 0.2, 'none'], [S('pop_d') - 0.2, 'popair'], [S('shake') - 0.2, 'clap'], [S('drum') - 0.2, 'drum'], [S('throat') - 0.2, 'neck'],
  [S('q3') - 0.2, 'crack'], [S('rumble') - 0.2, 'rumble'], [S('why_rumble') - 0.2, 'long'], [S('rq_near') - 0.2, 'qfarq'], [S('rq_far') - 0.2, 'qnearq'],
  [S('scary') - 0.2, 'none'], [S('try') - 0.2, 'bag'], [S('wow') - 0.2, 'wow'], [S('game') - 0.2, 'none'], [S('g1') - 0.2, 'g1'], [S('g2') - 0.2, 'g2'],
  [S('g3') - 0.2, 'g3'], [S('rem') - 0.2, 'none'], [S('rq1') - 0.2, 'r1'], [S('rq2') - 0.2, 'r2'], [S('rq3') - 0.2, 'r3'], [S('rq4') - 0.2, 'r4'],
  [S('rq5') - 0.2, 'r5'], [S('chant') - 0.2, 'rhyme'], [S('over') - 0.2, 'none'],
];
const cardAt = (t: number): [Card, number] => {
  let p = CARDS[0];
  for (const x of CARDS) if (t >= x[0]) p = x;
  return [p[1], p[0]];
};

// ── arms, faces
const BYE: Span<KArm> = [S('bye'), 999, 'wave'];
const RHYME: Span<KArm> = [S('c1'), E('c_turn') + 0.3, 'cheer'];
const CLAP: Span<KArm> = [word('clap', 6), E('clap') + 0.8, 'clap'];
const MILA_R = voKeys<KArm>(VO, 'mila', 'present', 'down', [
  [0.1, E('why'), 'cheeks'], CLAP, [S('drum_b'), E('drum_b'), 'point'], [S('throat_b') - 0.1, E('throat_c'), { to: [10, -250] }], [S('scary_b'), E('scary_b') + 0.4, 'hug'],
  [S('g1_no'), E('g1_no'), 'cover'], [S('ra5'), E('ra5'), 'point'], RHYME, [S('over'), E('over'), 'point'], BYE,
]);
const MILA_L = voKeys<KArm>(VO, null, 'down', 'down', [[0.1, E('why'), 'cheeks'], CLAP, [S('scary_b'), E('scary_b') + 0.4, 'hug'], RHYME, BYE]);
const MILA_E = voKeys<KExpr>(VO, 'mila', 'happy', 'smile', [
  [0.1, E('why'), 'surprised'], [S('pop'), E('pop') + 0.6, 'laugh'], [S('throat_c'), E('throat_c'), 'laugh'], [S('g1_no'), E('g1_no'), 'laugh'], [S('c1'), E('c_turn'), 'laugh'],
]);
const LEO_R = voKeys<KArm>(VO, 'leo', 'present', 'down', [
  [0.1, S('guess'), 'cheeks'], [S('guess'), E('guess'), { a: 30, b: 0 }], CLAP, [S('throat') + 0.3, E('throat_c'), { to: [10, -250] }], [S('scary_c'), E('scary_c'), 'cheeks'],
  [S('try_c'), E('try_c'), 'clap'], [S('g2_a'), E('g2_a'), 'point'], [S('ra4'), E('ra4'), 'cheer'], RHYME, BYE,
]);
const LEO_L = voKeys<KArm>(VO, null, 'down', 'down', [[0.1, S('guess'), 'cheeks'], [S('guess'), E('guess'), { a: -30, b: 0 }], CLAP, [S('scary_c'), E('scary_c'), 'cheeks'], [S('try_c'), E('try_c'), 'clap'], RHYME, BYE]);
const LEO_E = voKeys<KExpr>(VO, 'leo', 'happy', 'smile', [
  [0.1, S('guess'), 'surprised'], [S('guess'), E('guess'), 'proud'], [S('good'), E('good') + 0.3, 'oops'], [S('pop'), E('pop') + 0.6, 'surprised'], [S('throat_b'), E('throat_b'), 'laugh'],
  [S('c1'), E('c_turn'), 'laugh'],
]);
const BOBO_A = voKeys<CArm>(VO, 'bobo', 'wave', 'down', [
  [0.1, E('why'), 'up'], [S('guess2'), E('guess2'), 'clap'], [S('pop_b') - 0.3, word('pop_b', 6), 'hold'], [word('pop_b', 6), POP + 0.1, 'hug'], [POP + 0.1, E('pop') + 0.4, 'up'],
  CLAP as Span<CArm>, [S('drum') - 0.2, E('drum_b'), 'point'], [S('scary'), E('scary_d'), 'hug'], [S('g1_bobo'), E('g1_bobo'), 'up'], [S('g1_no'), E('g1_no'), 'cheeks'],
  [S('ra2'), E('ra2'), 'cheer'], [S('c1'), E('c_turn') + 0.3, 'cheer'], [S('bye'), 999, 'wave'],
]);
const BOBO_E = voKeys<KExpr>(VO, 'bobo', 'happy', 'smile', [
  [0.1, E('why'), 'surprised'], [S('guess2'), E('guess2'), 'proud'], [S('good'), E('good') + 0.3, 'oops'], [S('pop_b'), POP, 'think'], [POP, E('pop') + 0.6, 'surprised'],
  [S('scary'), S('scary_d'), 'sad'], [S('scary_d'), E('scary_d') + 0.4, 'happy'], [S('g1_no'), E('g1_no'), 'oops'], [S('c1'), E('c_turn'), 'laugh'],
]);
const HOOT_A = voKeys<CArm>(VO, 'hoot', 'point', 'down', [CLAP as Span<CArm>, [S('scary_a'), E('scary_a'), 'hug'], [S('c1'), E('c_turn') + 0.3, 'cheer'], [S('bye'), 999, 'wave']]);
const HOOT_E = voKeys<KExpr>(VO, 'hoot', 'happy', 'smile', [[0.1, E('why'), 'surprised'], [S('pop'), E('pop') + 0.6, 'laugh'], [S('c1'), E('c_turn'), 'laugh']]);
const looks = (base: [number, number]): Keys<[number, number]> => [
  [0, [0.8, -0.5]], [S('why'), [0, 0]], [E('why'), base], [S('say'), [0, 0]], [E('say'), base], [S('clap'), [0, 0]], [E('clap') + 0.6, base],
  [S('throat'), [0, 0]], [E('throat_c'), base], ...(['rq_near', 'rq_far', 'g1', 'g2', 'g3', 'rq1', 'rq2', 'rq3', 'rq4', 'rq5'] as const).flatMap((q): Keys<[number, number]> => [[E(q), [0, 0]], [VO[K[q] + 1].start, base]]),
  [S('c_turn'), [0, 0]], [S('over'), [0.8, -0.5]], [S('bye'), [0, 0]],
];
const LOOK_L = looks([0.6, -0.3]);
const LOOK_R = looks([-0.6, -0.3]);
const HOPS = [0.12, ...wordHops(VO, [K.c1, K.c2, K.c3], 2), POP + 0.02, S('g3_a') + 0.2, S('ra5') + 0.2];

// ── camera
const WIDE = { z: 1.0, x: 960, y: 540 };
const CARD = { z: 1.18, x: CZ[0] + 40, y: CZ[1] + 110 };
const WINDOW = { z: 1.55, x: WINC[0] - 60, y: WINC[1] + 40 };
const kFace = (x: number) => kidFaceAt(x, yAt(x, KS), KS)[1] + 80;
const cFace = (x: number) => critterFaceAt(x, yAt(x, CS), CS)[1] + 80;
const MILA_CU = { z: 1.6, x: X.mila + 60, y: kFace(X.mila) };
const LEO_CU = { z: 1.6, x: X.leo + 100, y: kFace(X.leo) };
const BOBO_CU = { z: 1.5, x: X.bobo - 40, y: cFace(X.bobo) };
const HOOT_CU = { z: 1.45, x: X.hoot - 120, y: cFace(X.hoot) };
const TWO_KIDS = { z: 1.3, x: 420, y: 640 };
const SHOTS: Shot[] = [
  { t: 0, ...WINDOW, move: 'cut', push: 0.01 },
  { t: S('why') - 0.2, ...MILA_CU, move: 'snap' },
  { t: S('guess') - 0.1, ...CARD, move: 'smooth', dur: 0.5, push: 0.01 },
  { t: S('good') - 0.1, ...HOOT_CU, move: 'smooth', dur: 0.5 },
  { t: S('answer') - 0.1, ...CARD, move: 'smooth', dur: 0.5, push: 0.012 },
  { t: S('say') - 0.1, ...MILA_CU, move: 'snap' },
  { t: S('safe') - 0.1, ...WIDE, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('rule') + 0.4, ...WINDOW, move: 'smooth', dur: 0.6 },
  { t: S('q1') - 0.1, ...MILA_CU, move: 'snap' },
  { t: S('hot') - 0.1, ...CARD, move: 'smooth', dur: 0.5, push: 0.012 },
  { t: S('pop_q') - 0.1, ...LEO_CU, move: 'snap' },
  { t: S('pop_a') - 0.1, ...WIDE, move: 'smooth', dur: 0.5 },
  { t: S('pop_b') - 0.1, ...BOBO_CU, move: 'smooth', dur: 0.5, push: 0.02 },
  { t: S('pop_c') - 0.1, ...WIDE, move: 'smooth', dur: 0.5 },
  { t: S('pop_d') - 0.1, ...CARD, move: 'smooth', dur: 0.5, push: 0.01 },
  { t: S('q2') - 0.1, ...LEO_CU, move: 'snap' },
  { t: S('shake') - 0.1, ...CARD, move: 'smooth', dur: 0.5, push: 0.01 },
  { t: S('clap') - 0.1, ...TWO_KIDS, move: 'smooth', dur: 0.5 },
  { t: S('clap2') - 0.1, ...CARD, move: 'smooth', dur: 0.5, push: 0.01 },
  { t: S('drum_b') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: S('throat') - 0.1, ...TWO_KIDS, move: 'smooth', dur: 0.5, push: 0.01 },
  { t: S('q3') - 0.1, ...HOOT_CU, move: 'smooth', dur: 0.5 },
  { t: S('crack') - 0.1, ...CARD, move: 'smooth', dur: 0.5, push: 0.01 },
  { t: S('rumble_b') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: S('rq_near') - 0.2, ...CARD, move: 'smooth', dur: 0.5, push: 0.008 },
  { t: S('ra_near') - 0.1, ...LEO_CU, move: 'snap' },
  { t: S('rq_far') - 0.2, ...CARD, move: 'smooth', dur: 0.5, push: 0.008 },
  { t: S('ra_far') - 0.1, ...MILA_CU, move: 'snap' },
  { t: S('scary') - 0.1, ...BOBO_CU, move: 'smooth', dur: 0.5, push: 0.01 },
  { t: S('scary_b') - 0.1, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('scary_d') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: S('try') - 0.1, ...CARD, move: 'smooth', dur: 0.5, push: 0.01 },
  { t: S('game') - 0.1, ...WIDE, move: 'smooth', dur: 0.5 },
  { t: S('g1') - 0.2, ...CARD, move: 'smooth', dur: 0.5, push: 0.008 },
  { t: S('g1_bobo') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: S('g1_no') - 0.1, ...WIDE, move: 'smooth', dur: 0.5 },
  { t: S('g2') - 0.2, ...CARD, move: 'smooth', dur: 0.5, push: 0.008 },
  { t: S('g2_a') - 0.1, ...LEO_CU, move: 'snap' },
  { t: S('g3') - 0.2, ...CARD, move: 'smooth', dur: 0.5, push: 0.008 },
  { t: S('g3_a') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: S('rem') - 0.1, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('rq1') - 0.2, ...CARD, move: 'smooth', dur: 0.5, push: 0.008 },
  { t: S('chant') - 0.2, z: 1.06, x: 960, y: 560, move: 'smooth', dur: 0.6, push: 0.02 },
  { t: S('over') - 0.1, ...WINDOW, move: 'smooth', dur: 0.8 },
  { t: S('bye') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
];
SHOTS.sort((a, b) => a.t - b.t);
const PUNCHES = [0.1, POP, CRACK, word('boom', 7)];
const END_IRIS = E('bye2') + 0.6;

// ── drawings (card coords, origin = card centre; the card is 760 × 440)
const Bolt: React.FC<{ s?: number; c?: string }> = ({ s = 1, c = '#ffd23f' }) => (
  <g transform={`scale(${s})`}>
    <Vol><path d="M 20,-140 L -50,10 L 0,10 L -30,140 L 60,-30 L 10,-30 L 50,-140 Z" fill={c} {...kst(6)} strokeLinejoin="round" /></Vol>
  </g>
);
const CloudShape: React.FC<{ c?: string; s?: number }> = ({ c = '#ced4da', s = 1 }) => (
  <g transform={`scale(${s})`}><Vol><path d="M -110,30 Q -124,-20 -72,-28 Q -60,-80 -6,-66 Q 34,-96 72,-56 Q 120,-56 118,-6 Q 136,30 100,40 L -96,40 Q -120,40 -110,30 Z" fill={c} {...kst(5)} /></Vol></g>
);
const Rings: React.FC<{ t: number; at: number; c?: string; n?: number; r0?: number; speed?: number }> = ({ t, at, c = '#4cc9f0', n = 3, r0 = 60, speed = 1 }) => (
  <g>
    {Array.from({ length: n }).map((_, k) => {
      const p = ((t - at) * speed + k / n) % 1;
      return t >= at ? <circle key={k} r={r0 + p * 220} fill="none" stroke={c} strokeWidth={10} opacity={1 - p} /> : null;
    })}
  </g>
);
const Ear: React.FC = () => (
  <g>
    <Vol tone="skin"><path d="M -10,-60 Q 50,-70 54,-10 Q 56,30 20,44 Q 0,52 4,70 Q -30,72 -26,40 Q -40,-50 -10,-60 Z" fill="#f7c59f" {...kst(5)} /></Vol>
    <path d="M 0,-34 Q 30,-36 30,-6 Q 30,14 10,18" fill="none" {...kst(4)} />
  </g>
);
const House: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <Vol><rect x={-70} y={-40} width={140} height={110} fill="#ffd6e5" {...kst(5)} /></Vol>
    <path d="M -90,-34 L 0,-110 L 90,-34 Z" fill="#ff595e" {...kst(5)} strokeLinejoin="round" />
    <rect x={-22} y={10} width={44} height={60} rx={8} fill="#a0663f" {...kst(4)} />
    <rect x={30} y={-20} width={28} height={26} fill="#fff3b0" {...kst(3)} />
  </g>
);
const Teddy: React.FC = () => (
  <g>
    <Vol>
      <circle cx={-36} cy={-56} r={18} fill="#c98f5f" {...kst(4)} /><circle cx={36} cy={-56} r={18} fill="#c98f5f" {...kst(4)} />
      <ellipse cx={0} cy={60} rx={52} ry={56} fill="#c98f5f" {...kst(5)} />
      <circle cx={0} cy={-24} r={46} fill="#c98f5f" {...kst(5)} />
    </Vol>
    <circle cx={-15} cy={-30} r={6} fill={KINK} /><circle cx={15} cy={-30} r={6} fill={KINK} /><ellipse cx={0} cy={-12} rx={9} ry={6} fill={KINK} />
  </g>
);
const Drum: React.FC<{ t: number; hits: number[] }> = ({ t, hits }) => {
  const last = hits.filter((h) => t >= h).pop();
  const j = last !== undefined ? Math.max(0, 1 - (t - last) / 0.6) : 0;
  return (
    <g>
      <Vol><rect x={-120} y={-20} width={240} height={120} rx={20} fill="#ff595e" {...kst(6)} /></Vol>
      {[-90, -30, 30, 90].map((x) => <path key={x} d={`M ${x},-14 L ${x + 30},94`} stroke="#ffffff" strokeWidth={6} />)}
      <Vol kind="slope"><ellipse cx={0} cy={-20} rx={120} ry={30} fill="#fff8e7" {...kst(6)} /></Vol>
      {Array.from({ length: 14 }).map((_, k) => {
        const x = -90 + ((k * 53) % 180);
        const y = -24 - ((k * 7) % 12) - j * (40 + ((k * 37) % 50)) * Math.abs(Math.sin((t - (last ?? 0)) * 9 + k));
        return <ellipse key={k} cx={x} cy={y} rx={7} ry={4} fill="#ffffff" stroke="#adb5bd" strokeWidth={2} />;
      })}
    </g>
  );
};
const Bag: React.FC<{ step: number; t: number; pop: number }> = ({ step, t, pop }) => (
  <g>
    {t < pop ? (
      <g transform={`scale(${step >= 1 ? 1 : 0.8},${step >= 1 ? 1 : 0.7})`}>
        <Vol><path d="M -60,-70 L 60,-70 Q 74,0 64,80 L -64,80 Q -74,0 -60,-70 Z" fill="#d4a373" {...kst(5)} /></Vol>
        {step >= 2 && <path d="M -20,-70 L 0,-100 L 20,-70 M -18,-96 L 18,-104" fill="none" stroke="#8d5a3b" strokeWidth={8} strokeLinecap="round" />}
      </g>
    ) : (
      <g>{[0, 1, 2, 3, 4, 5].map((k) => <path key={k} d="M 0,0 L 30,-10 L 20,20 Z" fill="#d4a373" {...kst(3)} transform={`rotate(${k * 60}) translate(${30 + prog(t, pop, pop + 0.5) * 80},0)`} />)}</g>
    )}
  </g>
);
const Label: React.FC<{ x: number; y: number; text: string; c?: string; size?: number }> = ({ x, y, text, c = KINK, size = 44 }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={size} fill={c} stroke="#ffffff" strokeWidth={8} paintOrder="stroke">{text}</text>
);
const Cross: React.FC<{ t: number; at: number; x: number; y: number }> = ({ t, at, x, y }) => <AnswerMark t={t} at={at} ok={false} x={x} y={y} size={0.5} />;
const Hills: React.FC = () => <path d="M -380,160 Q -240,40 -100,120 Q 60,20 220,110 Q 320,60 380,90 L 380,220 L -380,220 Z" fill="#6a994e" />;

const CardPanel: React.FC<{ c: Card; t: number; since: number }> = ({ c, t, since }) => {
  switch (c) {
    case 'guess': return (
      <g>
        <g transform={`translate(-200,-10)`}>
          <g transform={`translate(${-40 + Math.min(1, prog(t, S('guess'), word('guess', 8))) * 30},0)`}><CloudShape s={0.75} /></g>
          <g transform={`translate(${70 - Math.min(1, prog(t, S('guess'), word('guess', 8))) * 30},10)`}><CloudShape s={0.75} c="#adb5bd" /></g>
          {t >= word('guess', 8) && <Label x={10} y={-80} text="BONK?" c="#ff924c" />}
          {t >= S('good') && <Cross t={t} at={word('good', 7)} x={10} y={20} />}
        </g>
        {t >= S('guess2') && (
          <g transform={`translate(200,0) scale(${popIn(t, S('guess2'))})`}>
            <CloudShape s={0.9} c="#e9ecef" />
            <g transform={`translate(0,20) scale(0.5) rotate(${Math.sin(t * 8) * 4})`}><Drum t={t} hits={[word('guess2', 7), word('guess2', 8)]} /></g>
            {t >= S('good') && <Cross t={t} at={word('good', 9)} x={0} y={20} />}
          </g>
        )}
      </g>
    );
    case 'answer': return (
      <g>
        <g transform="translate(-160,0)"><Bolt s={1.1} /></g>
        <g transform="translate(-160,0)"><Rings t={t} at={S('answer') + 0.4} c="#4cc9f0" /></g>
        <g transform={`translate(180,0) scale(${popIn(t, word('answer', 3))})`}>
          <Label x={0} y={-30} text="THUNDER" c="#7b2cbf" size={64} />
          <Label x={0} y={30} text="=" size={52} />
          <Label x={0} y={100} text="the SOUND" c="#4cc9f0" size={62} />
          <Label x={0} y={160} text="of lightning" size={40} />
        </g>
      </g>
    );
    case 'heat': {
      const push = t >= S('push');
      return (
        <g>
          <g transform={`translate(0,0) scale(${t >= S('hot') ? 1 : 0})`}><Bolt s={1.0} c={t >= S('hot') + 0.5 ? '#fff3b0' : '#ffd23f'} /></g>
          {t >= S('hot') + 0.5 && <circle r={150} fill="#ff924c" opacity={0.18 + 0.08 * Math.sin(t * 6)} />}
          {Array.from({ length: 22 }).map((_, k) => {
            const a = (k / 22) * Math.PI * 2;
            const r0 = 110 + (k % 3) * 22;
            const r = push ? r0 + EASE_OUT(prog(t, word('push', 6), word('push', 12))) * 180 : r0;
            return <circle key={k} cx={Math.cos(a) * r * 1.5} cy={Math.sin(a) * r * 0.8} r={11} fill="#90e0ef" {...kst(3)} />;
          })}
          {push && t >= word('push', 6) && <g transform="scale(1.5,0.8)"><Rings t={t} at={word('push', 6)} c="#ffffff" n={2} r0={100} speed={1.2} /></g>}
          {t < S('push') && t >= S('hot') + 0.6 && (
            <g transform="translate(260,-40)">
              <rect x={-14} y={-110} width={28} height={180} rx={14} fill="#ffffff" {...kst(5)} />
              <rect x={-7} y={-100 + 150 * (1 - Math.min(1, prog(t, S('hot') + 0.6, S('hot') + 2)))} width={14} height={150 * Math.min(1, prog(t, S('hot') + 0.6, S('hot') + 2))} rx={7} fill="#ff595e" />
              <circle cy={84} r={26} fill="#ff595e" {...kst(5)} />
              <Label x={0} y={-130} text="HOT!" c="#ff595e" size={44} />
            </g>
          )}
          {t >= word('boom', 7) && <g transform={`scale(${popIn(t, word('boom', 7), 0.4)})`}><Label x={0} y={30} text="BOOM!" c="#7b2cbf" size={130} /></g>}
        </g>
      );
    }
    case 'popair': return (
      <g>
        <path d="M -300,-150 L -120,-60 L -160,-10 L 40,60 L 0,110 L 300,180" fill="none" stroke="#ffd23f" strokeWidth={22} strokeLinejoin="round" strokeLinecap="round" />
        {[[-300, -150], [-140, -40], [20, 80], [180, 140]].map(([x, y], k) => (
          <g key={k} transform={`translate(${x},${y}) scale(0.45)`}><Rings t={t} at={S('pop_d') + 0.3 + k * 0.25} c="#4cc9f0" n={2} /></g>
        ))}
        {[[-300, -150], [-140, -40], [20, 80], [180, 140]].map(([x, y], k) => t >= word('pop_d', 4) + k * 0.2 && <Label key={k} x={x + 60} y={y - 30} text="POP!" c="#ff6fa5" size={40} />)}
      </g>
    );
    case 'clap': {
      const clapT = word('clap', 8);
      const closed = within(t, clapT - 0.05, clapT + 0.15) || within(t, word('clap2', 2), word('clap2', 2) + 0.15);
      return (
        <g>
          <g transform="translate(-200,0)">
            <g transform={`translate(${closed ? -6 : -40},0) rotate(-10)`}><Vol tone="skin"><rect x={-28} y={-70} width={56} height={140} rx={26} fill="#f7c59f" {...kst(5)} /></Vol></g>
            <g transform={`translate(${closed ? 6 : 40},0) rotate(10)`}><Vol tone="skin"><rect x={-28} y={-70} width={56} height={140} rx={26} fill="#f7c59f" {...kst(5)} /></Vol></g>
            <g transform="scale(0.6)"><Rings t={t} at={clapT} c="#ff6fa5" /></g>
          </g>
          {t >= clapT && Array.from({ length: 5 }).map((_, k) => {
            const p = ((t - clapT) * 0.8 + k / 5) % 1;
            return <path key={k} d={`M ${-120 + p * 300},${-30} q 10,-30 20,0 q 10,30 20,0`} fill="none" stroke="#ff6fa5" strokeWidth={6} opacity={1 - p * 0.6} />;
          })}
          <g transform="translate(240,0) scale(1.3)"><Ear /></g>
          <Label x={0} y={-150} text="THE AIR SHAKES!" c="#ff6fa5" size={50} />
        </g>
      );
    }
    case 'drum': return <g><g transform="translate(0,60) scale(1.3)"><Drum t={t} hits={[word('drum', 10), word('drum', 11), word('drum_b', 1) + 0.2]} /></g>{t >= S('drum_b') && <Label x={0} y={-150} text="THE RICE JUMPS!" c="#ff595e" size={52} />}</g>;
    case 'neck': {
      const ah = within(t, S('throat_b'), E('throat_b') + 0.2);
      return (
        <g>
          <Vol tone="skin"><circle cx={0} cy={-60} r={110} fill="#f7c59f" {...kst(6)} /><rect x={-46} y={30} width={92} height={150} fill="#f7c59f" {...kst(6)} /></Vol>
          <circle cx={-36} cy={-80} r={11} fill={KINK} /><circle cx={36} cy={-80} r={11} fill={KINK} />
          <ellipse cx={0} cy={-10} rx={ah ? 26 : 22} ry={ah ? 30 + Math.sin(t * 30) * 4 : 8} fill="#ff6fa5" {...kst(4)} />
          {ah && [-1, 1].map((d) => [0, 1, 2].map((k) => <path key={`${d}${k}`} d={`M ${d * (64 + k * 22)},70 q ${d * 10},20 0,40 q ${d * -10},20 0,40`} fill="none" stroke="#4cc9f0" strokeWidth={6} transform={`translate(${Math.sin(t * 40 + k) * 3},0)`} />))}
          <g transform="translate(150,110) rotate(-80)"><Vol tone="skin"><rect x={-26} y={-60} width={52} height={120} rx={24} fill="#e8b48a" {...kst(5)} /></Vol></g>
        </g>
      );
    }
    case 'crack': return (
      <g>
        <rect x={-CW / 2} y={-CH / 2} width={CW} height={CH} fill="#3c3f8f" />
        <Hills />
        <g transform="translate(-160,120)"><House s={1.1} /></g>
        <g transform="translate(-20,-150)"><CloudShape c="#6c757d" s={1.1} /></g>
        {t >= CRACK && t < CRACK + 1.2 && <g transform="translate(-10,-20)"><Bolt s={1.0} c="#fff3b0" /></g>}
        {t >= CRACK && <g transform={`translate(200,-40) scale(${popIn(t, CRACK, 0.3)}) rotate(-6)`}><Label x={0} y={0} text="CRACK!" c="#ffd23f" size={100} /></g>}
        <Label x={0} y={196} text="CLOSE" c="#ff595e" size={44} />
      </g>
    );
    case 'rumble': case 'qfarq': {
      const ask = c === 'qfarq';
      const at = ask ? S('ra_near') : RUMBLE0;
      return (
        <g>
          <rect x={-CW / 2} y={-CH / 2} width={CW} height={CH} fill="#3c3f8f" />
          <Hills />
          <g transform="translate(-260,140) scale(0.7)"><House /></g>
          <g transform="translate(220,-80)"><CloudShape c="#6c757d" s={0.55} /></g>
          {((!ask && t >= RUMBLE0 && t < RUMBLE0 + 1.0) || (ask && t >= S('rq_near') + 0.5 && t < S('rq_near') + 1.3)) && <g transform="translate(220,10)"><Bolt s={0.45} c="#fff3b0" /></g>}
          {t >= at && Array.from({ length: 3 }).map((_, k) => <g key={k} transform={`translate(${-40 + k * 110 + Math.sin(t * 9 + k) * 6},${-120 + k * 20})`}><Label x={0} y={0} text="rumble" c="#adb5bd" size={40} /></g>)}
          <Label x={0} y={196} text={ask ? 'FAR AWAY…' : 'FAR AWAY'} c="#4cc9f0" size={44} />
          {ask && t < at && <Label x={250} y={120} text="?" c="#ffffff" size={130} />}
        </g>
      );
    }
    case 'qnearq': {
      const at = S('ra_far');
      return (
        <g>
          <rect x={-CW / 2} y={-CH / 2} width={CW} height={CH} fill="#3c3f8f" />
          <Hills />
          <g transform="translate(-160,120)"><House s={1.1} /></g>
          <g transform="translate(0,-150)"><CloudShape c="#6c757d" s={1.1} /></g>
          {t >= S('rq_far') + 0.5 && t < S('rq_far') + 1.4 && <g transform="translate(10,-20)"><Bolt s={1.0} c="#fff3b0" /></g>}
          {t >= at && <g transform={`translate(200,-40) scale(${popIn(t, at, 0.3)}) rotate(-6)`}><Label x={0} y={0} text="CRACK!" c="#ffd23f" size={100} /></g>}
          <Label x={0} y={196} text="CLOSE!" c="#ff595e" size={44} />
          {t < at && <Label x={250} y={100} text="?" c="#ffffff" size={130} />}
        </g>
      );
    }
    case 'long': {
      const p = prog(t, word('why_rumble', 6), E('why_rumble'));
      const pts: [number, number][] = [[-120, -170], [-60, -100], [-110, -30], [-30, 40], [-80, 110], [0, 170]];
      return (
        <g>
          <rect x={-CW / 2} y={-CH / 2} width={CW} height={CH} fill="#3c3f8f" />
          <path d={'M ' + pts.map(([x, y]) => `${x},${y}`).join(' L ')} fill="none" stroke="#ffd23f" strokeWidth={16} strokeLinejoin="round" />
          <g transform="translate(250,150)"><Ear /></g>
          {pts.map(([x, y], k) => {
            const d = Math.hypot(250 - x, 150 - y);
            const q = Math.min(1, Math.max(0, (p * 700 - k * 20) / d));
            return q > 0 && q < 1 ? <circle key={k} cx={x + (250 - x) * q} cy={y + (150 - y) * q} r={14} fill={['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#4cc9f0', '#9b5de5'][k]} {...kst(3)} /> : null;
          })}
          <Label x={160} y={-150} text="near… then far…" c="#ffffff" size={40} />
        </g>
      );
    }
    case 'bag': {
      const step = t >= S('try_b') ? (t >= word('try_b', 6) ? 2 : 1) : 0;
      const pop = word('try_c', 6);
      return (
        <g>
          <g transform="translate(-130,30)"><Bag step={step} t={t} pop={pop} /></g>
          {t >= S('try_c') && t < pop && <g transform={`translate(-130,30)`}><g transform={`translate(${-110 + prog(t, S('try_c'), pop) * 50},0)`}><Vol tone="skin"><rect x={-24} y={-50} width={48} height={100} rx={22} fill="#f7c59f" {...kst(4)} /></Vol></g><g transform={`translate(${110 - prog(t, S('try_c'), pop) * 50},0)`}><Vol tone="skin"><rect x={-24} y={-50} width={48} height={100} rx={22} fill="#f7c59f" {...kst(4)} /></Vol></g></g>}
          {t >= pop && <g transform={`translate(-130,0) scale(${popIn(t, pop, 0.3)})`}><Label x={0} y={0} text="POP!" c="#ff6fa5" size={110} /></g>}
          {['1 BLOW', '2 TWIST', '3 CLAP!'].map((s, k) => <Label key={s} x={230} y={-80 + k * 80} text={s} c={step >= k || (k === 2 && t >= S('try_c')) ? '#7b2cbf' : '#ced4da'} size={46} />)}
          <rect x={-CW / 2 + 20} y={CH / 2 - 70} width={360} height={50} rx={25} fill="#ffca3a" {...kst(4)} />
          <text x={-CW / 2 + 200} y={CH / 2 - 34} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={30} fill={KINK}>WITH A GROWN-UP!</text>
        </g>
      );
    }
    case 'wow': {
      const two = t >= S('wow_b');
      return (
        <g>
          <rect x={-CW / 2} y={-CH / 2} width={CW} height={CH} fill="#3c3f8f" />
          <Hills />
          <path d="M -380,190 Q -100,150 140,170 Q 280,180 380,160" fill="none" stroke="#e9ecef" strokeWidth={14} strokeDasharray="30 20" />
          <g transform="translate(-280,140) scale(0.65)"><House /></g>
          <g transform="translate(-280,40)"><Ear /></g>
          <g transform="translate(260,-90)"><CloudShape c="#6c757d" s={0.5} /></g>
          {t >= S('wow') + 0.2 && t < S('wow') + 1.0 && <g transform="translate(260,-10)"><Bolt s={0.38} c="#fff3b0" /></g>}
          {Array.from({ length: 4 }).map((_, k) => {
            const p = ((t - S('wow')) * 0.4 + k / 4) % 1;
            return t >= S('wow') ? <path key={k} d={`M ${260 - p * 480},${-20 + p * 40} q 0,-24 14,-30`} fill="none" stroke="#adb5bd" strokeWidth={8} opacity={1 - p} /> : null;
          })}
          <Label x={0} y={-150} text={two ? 'HEAR IT? GO INSIDE!' : 'VERY FAR AWAY!'} c={two ? '#ffca3a' : '#ffffff'} size={50} />
        </g>
      );
    }
    case 'g1': {
      const ok = t >= S('g1_no') + 0.3;
      return (
        <g>
          <g transform="translate(-180,0)"><g transform="translate(-30,0)"><CloudShape s={0.6} /></g><g transform="translate(50,10)"><CloudShape s={0.6} c="#adb5bd" /></g><Label x={0} y={140} text="BUMPING?" size={40} />{ok && <Cross t={t} at={S('g1_no') + 0.3} x={0} y={0} />}</g>
          <g transform="translate(180,0)"><Bolt s={0.9} /><Label x={0} y={170} text="LIGHTNING?" size={40} />{ok && <AnswerMark t={t} at={S('g1_no') + 0.3} ok x={80} y={-100} size={0.6} />}</g>
          {t >= E('g1_bobo') + 0.1 && t < S('g1_no') + 0.3 && <Cross t={t} at={E('g1_bobo') + 0.1} x={-180} y={-120} />}
        </g>
      );
    }
    case 'g2': {
      const ok = t >= S('g2_a');
      return (
        <g>
          <g transform="translate(-180,10)">
            <rect x={-110} y={-90} width={220} height={190} rx={20} fill="#6a994e" />
            <path d="M -80,60 L -80,-30 L 0,-30 L 0,60 M -80,-30 L -40,-70 L 0,-30" fill="none" stroke="#ff924c" strokeWidth={10} />
            <path d="M 30,60 L 80,-50" stroke="#ffca3a" strokeWidth={12} strokeLinecap="round" />
            <Label x={0} y={150} text="PARK?" size={40} />
            {ok && <Cross t={t} at={S('g2_a')} x={0} y={-10} />}
          </g>
          <g transform="translate(180,40)"><House s={1.3} /><Label x={0} y={120} text="INSIDE?" size={40} />{ok && <AnswerMark t={t} at={S('g2_a')} ok x={110} y={-130} size={0.6} />}</g>
        </g>
      );
    }
    case 'g3': {
      const ok = t >= S('g3_a');
      return (
        <g>
          <g transform="translate(-140,0)"><Rings t={t} at={S('g3')} c="#adb5bd" n={3} r0={40} /><Label x={0} y={20} text="BOOM" c="#7b2cbf" size={70} /></g>
          <g transform="translate(200,0)">{ok ? <g transform={`scale(${popIn(t, S('g3_a'))})`}><Label x={0} y={-20} text="ONLY" c="#52b788" size={64} /><Label x={0} y={50} text="A SOUND!" c="#52b788" size={64} /></g> : <Label x={0} y={40} text="?" c="#adb5bd" size={160} />}</g>
        </g>
      );
    }
    case 'r1': return <g><g transform="translate(-180,0)"><Bolt s={1.0} /><Rings t={t} at={S('rq1')} /></g>{t >= S('ra1') ? <g transform={`translate(160,20) scale(${popIn(t, S('ra1'))})`}><Label x={0} y={-20} text="THE SOUND" c="#4cc9f0" size={60} /><Label x={0} y={40} text="of lightning!" size={44} /></g> : <Label x={170} y={60} text="?" c="#adb5bd" size={160} />}</g>;
    case 'r2': return <g>{t < S('ra2') ? <g transform="translate(-120,0) scale(1.4)"><Balloon c="#ff6fa5" /></g> : <g transform={`translate(-120,0) scale(${popIn(t, S('ra2'))})`}><Label x={0} y={30} text="POP!" c="#ff6fa5" size={120} /></g>}<Label x={200} y={40} text={t >= S('ra2') ? '= tiny thunder' : '?'} c={t >= S('ra2') ? '#7b2cbf' : '#adb5bd'} size={t >= S('ra2') ? 44 : 140} /></g>;
    case 'r3': return <g><g transform="translate(-130,60)"><Drum t={t} hits={[S('ra3') + 0.1, S('ra3') + 0.5, S('ra3') + 0.9]} /></g>{t >= S('ra3') ? <Label x={220} y={20} text="SHAKY AIR!" c="#ff595e" size={52} /> : <Label x={220} y={60} text="?" c="#adb5bd" size={160} />}</g>;
    case 'r4': return (
      <g>
        <rect x={-CW / 2} y={-CH / 2} width={CW} height={CH} fill="#3c3f8f" />
        <Hills />
        <g transform="translate(-160,120)"><House s={1.0} /></g>
        <g transform="translate(-10,-20)"><Bolt s={0.9} c="#fff3b0" /></g>
        {t >= S('ra4') ? <g transform={`translate(220,-40) scale(${popIn(t, S('ra4'), 0.3)})`}><Label x={0} y={0} text="CRACK!" c="#ffd23f" size={90} /></g> : <Label x={230} y={60} text="?" c="#ffffff" size={150} />}
      </g>
    );
    case 'r5': return <g><g transform="translate(-160,40)"><House s={1.6} /></g><g transform="translate(200,-60)"><CloudShape c="#6c757d" s={0.8} /></g>{t >= S('ra5') && <g transform={`translate(160,110) scale(${popIn(t, S('ra5'))})`}><Label x={0} y={0} text="GO INDOORS!" c="#52b788" size={58} /></g>}</g>;
    case 'rhyme': return <g transform={`translate(0,${20 - Math.abs(Math.sin((t - since) * 4.2)) * 20})`}><g transform="translate(-180,0)"><Bolt s={1.0} /></g><Label x={160} y={30} text="BOOM!" c="#7b2cbf" size={120} /></g>;
    default: return null;
  }
};

export default function KidsScience075() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const shake = shakeOf(t, HITS);
  const hop = hopAt(t, HOPS, { h: 50 });
  const [card, since] = cardAt(t);
  const storm = t < STORM_END ? 1 : 1 - prog(t, STORM_END, STORM_END + 2.5);
  const flash = flashAt(t) * storm;
  const rain = Array.from({ length: 34 }).map((_, k) => {
    const x = 1450 + ((k * 61) % 300);
    const y = 150 + ((k * 97 + t * 900) % 420);
    return <path key={k} d={`M ${x},${y} l -8,26`} stroke="#bde0fe" strokeWidth={4} strokeLinecap="round" opacity={0.7} />;
  });
  const balloonHeld = within(t, S('pop_b') - 0.3, POP);
  const teddy = within(t, S('scary_b') - 0.2, E('scary_d') + 0.4);
  const shown = card !== 'none';
  const cardScale = shown ? popIn(t, since + 0.05, 0.4) : 0;

  return (
    <>
      <ActionStage cam={cam} shake={shake} blur={cam.blur}>
        <Backdrop place={PLACE} variant={VAR} w={W} h={H} t={t} fx={false} />
        {/* the storm in the window */}
        <defs><clipPath id="d75win"><path d={WIN} /></clipPath></defs>
        <g clipPath="url(#d75win)" opacity={storm}>
          <rect x={1440} y={140} width={320} height={420} fill="#262a5c" />
          {[[1510, 230, 0.7], [1650, 260, 0.9], [1580, 330, 0.6]].map(([x, y, s], k) => <g key={k} transform={`translate(${x + Math.sin(t * 0.3 + k) * 14},${y})`}><CloudShape c="#565c8a" s={s} /></g>)}
          {rain}
          {flash > 0.3 && <g transform="translate(1610,420) scale(0.6)"><Bolt c="#fff8d6" /></g>}
          <rect x={1440} y={140} width={320} height={420} fill="#e6f3ff" opacity={flash * 0.75} />
        </g>
        {/* the room lights up a little with each flash */}
        <rect x={0} y={0} width={W} height={H} fill="#cfe8ff" opacity={flash * 0.12} />
        {/* Hoot's picture card */}
        {shown && (
          <g transform={`translate(${CZ[0]},${CZ[1]}) scale(${cardScale})`}>
            <rect x={-CW / 2 - 16} y={-CH / 2 - 16} width={CW + 32} height={CH + 32} rx={34} fill="#fff3b0" {...kst(8)} />
            <defs><clipPath id="d75card"><rect x={-CW / 2} y={-CH / 2} width={CW} height={CH} rx={22} /></clipPath></defs>
            <rect x={-CW / 2} y={-CH / 2} width={CW} height={CH} rx={22} fill="#fffdf7" />
            <g clipPath="url(#d75card)"><CardPanel c={card} t={t} since={since} /></g>
          </g>
        )}
        <PlaceLight place={PLACE}>
          <Critter polish acting spec={HOOT.spec} wear={HOOT.wear} x={X.hoot} y={yAt(X.hoot, CS)} scale={CS} expr={exprAt(t, HOOT_E)} look={lookAt(t, LOOK_R)} {...speechAt(VO, 'hoot', t)}
            armL={poseAt(t, HOOT_A)} armR={poseAt(t, HOOT_A)} facing={-1} hop={hop.hop} squash={hop.squash} />
          <Critter polish acting spec={BOBO.spec} wear={BOBO.wear} x={X.bobo} y={yAt(X.bobo, CS)} scale={CS} expr={exprAt(t, BOBO_E)} look={lookAt(t, LOOK_R)} {...speechAt(VO, 'bobo', t)}
            armL={poseAt(t, BOBO_A)} armR={poseAt(t, BOBO_A)} facing={-1} hop={hop.hop} squash={hop.squash}
            tilt={within(t, S('scary'), S('scary_d')) ? Math.sin(t * 18) * 2 : 0}
            holdR={balloonHeld ? <g transform={`scale(${0.7 - 0.12 * prog(t, word('pop_b', 6), POP)},${0.7 + 0.1 * prog(t, word('pop_b', 6), POP)})`}><Balloon c="#ff6fa5" /></g>
              : within(t, S('drum') - 0.2, E('drum_b')) ? <g transform="scale(0.5)"><Drum t={t} hits={[word('drum', 10), word('drum', 11)]} /></g>
              : teddy ? <g transform="scale(0.6)"><Teddy /></g> : undefined} />
          <Kid polish acting spec={LEO.spec} wear={LEO.wear} x={X.leo} y={yAt(X.leo, KS)} scale={KS} expr={exprAt(t, LEO_E)} look={lookAt(t, LOOK_L)} {...speechAt(VO, 'leo', t)}
            armL={poseAt(t, LEO_L)} armR={poseAt(t, LEO_R)} hop={hop.hop} squash={hop.squash} />
          <Kid polish acting spec={MILA.spec} wear={MILA.wear} x={X.mila} y={yAt(X.mila, KS)} scale={KS} expr={exprAt(t, MILA_E)} look={lookAt(t, LOOK_L)} {...speechAt(VO, 'mila', t)}
            armL={poseAt(t, MILA_L)} armR={poseAt(t, MILA_R)} hop={hop.hop} squash={hop.squash} />
        </PlaceLight>
        {t >= POP && t < POP + 0.8 && (
          <g transform={`translate(${X.bobo + 80},${yAt(X.bobo, CS) - 280})`}>
            <ImpactStar t={t} at={POP} x={0} y={0} />
            {[0, 1, 2, 3, 4, 5].map((k) => <path key={k} d="M 0,0 L 22,-8 L 14,16 Z" fill="#ff6fa5" {...kst(3)} transform={`rotate(${k * 60}) translate(${30 + prog(t, POP, POP + 0.6) * 90},0)`} />)}
          </g>
        )}
        <StageWord t={t} at={0.15} until={1.6} text="BOOM!" x={WINC[0] - 40} y={WINC[1] - 230} size={110} color="#ffd23f" rot={-6} />
        <StageWord t={t} at={POP} until={E('pop') + 0.6} text="POP!" x={X.bobo - 40} y={yAt(X.bobo, CS) - 560} size={110} color="#ff6fa5" rot={6} />
        <StageWord t={t} at={word('clap', 8)} until={E('clap') + 0.5} text="CLAP!" x={X.mila + 100} y={yAt(X.mila, KS) - 520} size={90} color="#ff924c" rot={-5} />
        <StageWord t={t} at={S('throat_b')} until={E('throat_b') + 0.3} text="AAAAH!" x={X.leo + 60} y={yAt(X.leo, KS) - 520} size={84} color="#4cc9f0" rot={4} />
        <StageWord t={t} at={word('drum', 10)} until={E('drum') + 0.3} text="TAP TAP!" x={X.bobo - 40} y={yAt(X.bobo, CS) - 560} size={80} color="#ff595e" rot={-5} />
        <Reaction kind="!" t={t} at={0.15} until={1.2} x={X.bobo} y={yAt(X.bobo, CS) - 470} s={0.55} />
        <Reaction kind="!" t={t} at={0.2} until={1.2} x={X.leo} y={yAt(X.leo, KS) - 470} s={0.5} />
        <Reaction kind="idea" t={t} at={S('guess')} until={E('guess')} x={X.leo} y={yAt(X.leo, KS) - 470} s={0.5} />
        <Reaction kind="idea" t={t} at={S('guess2')} until={E('guess2')} x={X.bobo} y={yAt(X.bobo, CS) - 470} s={0.5} />
        <Reaction kind="stars" t={t} at={POP} until={E('pop') + 0.6} x={X.bobo} y={yAt(X.bobo, CS) - 470} s={0.5} />
        <Reaction kind="sweat" t={t} at={S('scary')} until={S('scary_d')} x={X.bobo + 50} y={yAt(X.bobo, CS) - 420} s={0.5} />
        <Reaction kind="heart" t={t} at={S('scary_d')} until={E('scary_d') + 0.6} x={X.bobo} y={yAt(X.bobo, CS) - 470} s={0.55} />
        <Reaction kind="?" t={t} at={E('g1_bobo') + 0.1} until={E('g1_no')} x={X.bobo} y={yAt(X.bobo, CS) - 470} s={0.5} />
      </ActionStage>

      {/* screen-space */}
      <PopText t={t} at={0.4} until={S('guess') - 0.1} text="WHAT IS THUNDER?" y={100} size={110} color="#ffd23f" />
      <PopText t={t} at={S('answer')} until={S('safe') - 0.1} text="THE SOUND OF LIGHTNING!" y={100} size={90} color="#4cc9f0" />
      <PopText t={t} at={word('rule', 3)} until={S('q1') - 0.1} text="🏠 WHEN THUNDER ROARS, GO INDOORS!" y={100} size={72} color="#ffffff" />
      <PopText t={t} at={word('boom', 7)} until={S('pop_q') - 0.1} text="HOT AIR JUMPS = BOOM!" y={100} size={96} color="#7b2cbf" />
      <PopText t={t} at={S('pop_c')} until={S('q2') - 0.1} text="🎈 A TINY THUNDER!" y={100} size={100} color="#ff6fa5" />
      <PopText t={t} at={S('shake')} until={S('clap') - 0.1} text="SOUND = SHAKING AIR" y={100} size={96} color="#ff6fa5" />
      <PopText t={t} at={S('clap')} until={S('clap2') - 0.1} text="👏 CLAP WITH ME!" y={100} size={100} color="#ffffff" />
      <PopText t={t} at={S('throat')} until={S('q3') - 0.1} text="🗣️ SAY AAAH!" y={100} size={100} color="#ffffff" />
      <PopText t={t} at={S('crack')} until={S('rumble') - 0.1} text="CLOSE = CRACK!" y={100} size={110} color="#ffd23f" />
      <PopText t={t} at={S('rumble')} until={S('rq_near') - 0.1} text="FAR = RUMBLE…" y={100} size={110} color="#adb5bd" />
      <PopText t={t} at={S('ra_near')} until={S('rq_far') - 0.1} text="RUMBLE! FAR AWAY!" y={100} size={100} color="#adb5bd" />
      <PopText t={t} at={S('ra_far')} until={S('scary') - 0.1} text="CRACK! CLOSE!" y={100} size={110} color="#ffd23f" />
      <PopText t={t} at={S('scary_a')} until={S('scary_b') - 0.1} text="ONLY A SOUND 💛" y={100} size={100} color="#ffca3a" />
      <PopText t={t} at={S('scary_b')} until={S('try') - 0.1} text="🧸 HUG · 🙉 COVER · 🎵 SING" y={100} size={80} color="#ffffff" />
      <PopText t={t} at={S('try')} until={S('wow') - 0.1} text="TRY IT WITH A GROWN-UP!" y={100} size={90} color="#ffca3a" />
      <PopText t={t} at={S('wow')} until={S('wow_b') - 0.1} text="✨ WOW FACT!" y={100} size={110} color="#ffd23f" />
      <PopText t={t} at={S('wow2')} until={S('game') - 0.1} text="EVERY ⚡ MAKES THUNDER!" y={100} size={90} color="#ffd23f" />
      <PopText t={t} at={S('game')} until={beat(E('g1') + 0.1)} text="QUIZ TIME!" y={100} size={120} color="#ffca3a" />
      <PopText t={t} at={S('g1_no')} until={S('g2') - 0.1} text="⚡ LIGHTNING!" y={100} size={110} color="#ffd23f" />
      <PopText t={t} at={S('g2_a')} until={S('g3') - 0.1} text="🏠 GO INDOORS!" y={100} size={110} color="#52b788" />
      <PopText t={t} at={S('g3_a')} until={S('rem') - 0.1} text="ONLY A SOUND!" y={100} size={110} color="#52b788" />
      <PopText t={t} at={S('rem')} until={S('rq1') - 0.1} text="LET'S REMEMBER!" y={100} size={110} color="#ffca3a" />
      <PopText t={t} at={S('c1')} until={S('c2') - 0.05} text="LIGHTNING FLASHES, THE AIR GOES BOOM!" y={100} size={68} color="#ffd23f" />
      <PopText t={t} at={S('c2')} until={S('c3') - 0.05} text="CRACK IS NEAR, AND RUMBLE IS FAR!" y={100} size={72} color="#4cc9f0" />
      <PopText t={t} at={S('c3')} until={S('c_turn') - 0.05} text="WHEN THUNDER ROARS, GO INDOORS!" y={100} size={74} color="#52b788" />
      <PopText t={t} at={S('c_turn')} until={S('over') - 0.1} text="🗣️ YOUR TURN!" y={100} size={110} color="#ffffff" />
      <PopText t={t} at={S('over')} until={S('bye') - 0.1} text="🌙 GOODNIGHT, THUNDER!" y={100} size={96} color="#fff3b0" />
      <PopText t={t} at={S('bye')} until={END_IRIS} text="SEE YOU NEXT TIME!" y={100} size={100} color="#ffca3a" />
      {(['rq_near', 'rq_far', 'g1', 'g2', 'g3', 'rq1', 'rq2', 'rq3', 'rq4'] as const).map((q) => (
        <ThinkTimer key={q} t={t} from={beat(E(q) + 0.1)} to={VO[K[q] + 1].start - 0.1} x={1780} y={170} r={84} />
      ))}
      <Confetti t={t} at={S('answer') + 0.3} y={360} />
      <Confetti t={t} at={E('pop')} y={360} />
      <Confetti t={t} at={S('scary_d')} y={360} />
      <Confetti t={t} at={S('g3_a')} y={360} />
      <Confetti t={t} at={E('c3')} y={360} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <StarWipe t={t} at={END_IRIS} dur={0.5} hold={5} color="#7b2cbf" x={W / 2} y={H * 0.45} />
    </>
  );
}
