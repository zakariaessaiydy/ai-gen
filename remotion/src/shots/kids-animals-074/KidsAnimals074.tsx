// TINY SPARKS · Day 74 · 🦁 Animal Stories #13 — "The Lion and the Little Mouse" (LONG 16:9)
// kids-shorts/tiny-sparks/animals/day-074-the-lion-and-the-little-mouse. Cues from VO via K (keys.gen.ts).
// NOT the net fable — Day 64 (Marathon #7) already retold Aesop's lion and mouse — this story teaches being GENTLE.
// COLD OPEN (no ident): Leon the lion ROARS at 0.3 s (sound rings) → who's that? → roar like Leon (your turn) → 4 TRUE
// FACTS (a roar carries far · lions nap most of the day — yawn like Leon · a baby lion is a cub — Bobo: "like me!" · a
// family is a pride) → Pip the mouse pops out of the grass (whiskers feel the way in the dark · squeak like Pip) → STORY:
// Pip rocks her 3 babies to sleep in a nest under the tree → happy Leon walks in: "What a beautiful day! ROAR!" → the
// babies wake and cry → "I'm so sorry" → think timer: how can Leon say hello without waking them? (Leo ✗ roar louder ·
// Mila ✓ a quiet voice) → a little roar — still too loud → Pip: try a whisper → "Hello… little ones…" → they sleep (count
// them quietly 1·2·3) → whisper like Leon (your turn) → the gentle ride (all on Leon's head, bumpity bump) → "I'm big,
// but I can be gentle" → the lesson: being gentle is a super power → remember (7) → chant "gentle hands, gentle voice"
// → bye + star iris.
import React from 'react';
import { Kid, type KArm } from '../../lib/kids/kid';
import { Critter, critterFaceAt, type CArm, type CritterSpec } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { Backdrop, PlaceLight, standY } from '../../lib/kids/places';
import { Confetti, FONT_TOON, KidsCaptions, PopText, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, ImpactStar, MotionLines, Reaction, StageWord, StarWipe, directorCam, hopAt, onBeat, shakeOf, type Hit, type Shot } from '../../lib/kids/energy';
import { exprAt, poseAt, walkPath } from '../../lib/kids/smooth';
import { voKeys, wordHops, type Span } from '../../lib/kids/cues';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsAnimals074', durationInSeconds: 304.5, fps: 30, width: 1920, height: 1080 };

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
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff', leon: '#ffb703', pip: '#ffc8dd', babies: '#bde0fe' };
const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (EASE_OUT(p) - 1) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};
const beat = (x: number) => onBeat(x, 0);

// ── the cast of the story (one-off specs, this episode only)
const LEON: CritterSpec = { id: 'leon', species: 'lion', fur: '#f4a261', fur2: '#ffe8c2', dark: '#b5651d', iris: '#7b4f2c' };
const LIONESS: CritterSpec = { id: 'lioness', species: 'cat', fur: '#e9b872', fur2: '#fff1d6', dark: '#c08a4a', iris: '#7b4f2c' };
const CUB: CritterSpec = { id: 'cub', species: 'lion', fur: '#f6bd60', fur2: '#fff1d6', dark: '#f6bd60', iris: '#7b4f2c' };
const PIP: CritterSpec = { id: 'pip', species: 'mouse', fur: '#d9cbbd', fur2: '#ffd6e0', dark: '#9c8574', bow: '#ff6fa5', iris: '#3b2a4a' };
const BABY: CritterSpec = { id: 'baby', species: 'mouse', fur: '#e6dccf', fur2: '#ffe0ec', dark: '#b8a694', iris: '#3b2a4a' };

// ── place + blocking: the kids watch from the left, the story plays in the middle/right
const PLACE = 'jungle' as const;
const LS = 0.72; // Leon
const PS = 0.26; // Pip (tiny!)
const KS = 0.46;
const BS = 0.48;
const X = { leo: 120, mila: 280, bobo: 450 };
const LX = 1150;
const yAt = (x: number, s: number) => standY(PLACE, x, W, H, { halfW: 150 * s });

// Leon: off to the left when the story starts, back in (happy), over to the nest to whisper, the gentle ride
const LEON_PATH: [number, number, number, number][] = [
  [S('s1') - 0.6, S('s1') + 1.6, LX, -400], [S('s2'), E('s2') + 0.6, -400, 820], [S('l_tip') + 0.4, E('l_tip') + 0.6, 820, 1130],
  [S('ride_turn'), E('ride_turn') + 0.4, 1130, 960],
];
// Pip: pops out of the grass, then by her nest for the whole story
const PIP0 = 1520;
const NEST_X = 1500;
const PIP_PATH: [number, number, number, number][] = [[S('s1') - 0.4, S('s1') + 0.8, PIP0, 1360]];
const ON_HEAD: [number, number] = [S('l_later') + 0.4, 999]; // Pip + the babies ride on Leon's head
const END_IRIS = E('bye2') + 0.6;
const ROARS: [number, number][] = [[S('roar'), -1], [S('f1b'), -1], [word('s_roar', 4), 1], [S('l_try'), 1], [S('ra1'), -1]];
const CRY: [number, number] = [word('s_wake', 6), E('s_lull2') + 0.4];
const COUNT = [S('c_one'), S('c_two'), S('c_three')];
const asleep = (t: number) => within(t, S('s1') + 1, CRY[0]) || within(t, E('l_smile') - 0.6, S('l_later'));

// ── arms + faces
const BYE: Span<KArm> = [S('bye'), 999, 'wave'];
const CHANT: Span<KArm> = [S('c1'), E('c_turn') + 0.3, 'cheer'];
const MILA_R = voKeys<KArm>(VO, 'mila', 'present', 'down', [[S('q_mila'), E('q_mila'), 'point'], [S('ra5'), E('ra5'), 'cheer'], CHANT, BYE]);
const MILA_L = voKeys<KArm>(VO, null, 'down', 'down', [[CRY[0], E('s_upset'), 'cheeks'], [S('whisper_turn'), E('whisper_turn'), 'cover'], CHANT, BYE]);
const MILA_E = voKeys<KExpr>(VO, 'mila', 'happy', 'smile', [
  [S('roar'), E('intro'), 'wow'], [CRY[0], E('s_upset'), 'oops'], [S('l_ride'), E('l_hug') + 1, 'laugh'], [S('c1'), 999, 'laugh'],
]);
const LEO_R = voKeys<KArm>(VO, 'leo', 'present', 'down', [[S('q_leo'), E('q_leo'), 'cheer'], [S('leo_learn'), E('leo_learn'), 'cheeks'], CHANT, BYE]);
const LEO_L = voKeys<KArm>(VO, null, 'down', 'down', [[S('q_leo'), E('q_leo'), 'cheer'], [S('sound'), E('sound') + 0.6, 'up'], [S('whisper_turn'), E('whisper_turn'), 'cover'], CHANT, BYE]);
const LEO_E = voKeys<KExpr>(VO, 'leo', 'happy', 'smile', [
  [S('roar'), E('intro'), 'surprised'], [S('q_leo'), E('q_leo'), 'proud'], [E('q_leo'), S('q_mila') + 1, 'oops'], [S('leo_learn'), E('leo_learn'), 'oops'], [S('c1'), 999, 'laugh'],
]);
const BOBO_A = voKeys<CArm>(VO, 'bobo', 'wave', 'down', [
  [S('f3b'), E('f3b'), 'cheer'], [S('bobo_small'), E('bobo_small'), 'cheeks'], [S('ra2'), E('ra2'), 'cheer'], [S('c1'), E('c_turn') + 0.3, 'cheer'], [S('bye'), 999, 'wave'],
]);
const BOBO_E = voKeys<KExpr>(VO, 'bobo', 'happy', 'smile', [
  [S('roar'), E('intro'), 'surprised'], [S('f3b'), E('f3b'), 'laugh'], [CRY[0], E('s_upset'), 'oops'], [S('bobo_small'), E('bobo_small'), 'wink'], [S('c1'), 999, 'laugh'],
]);
const LEON_A = voKeys<CArm>(VO, 'leon', 'wave', 'down', [
  [S('roar'), E('roar') + 0.3, 'up'], [S('f1b'), E('f1b'), 'up'], [S('f4b'), E('f4b'), 'hug'], [S('s_roar'), E('s_roar') + 0.3, 'up'], [S('s_sorry'), E('s_sorry'), 'cheeks'],
  [S('l_try'), E('l_try'), 'up'], [S('l_whisper'), E('l_whisper') + 0.4, 'wave'], [S('l_gentle'), E('l_gentle'), 'hug'], [S('ra1'), E('ra1'), 'up'],
  [S('c1'), E('c_turn') + 0.3, 'cheer'], [S('bye'), 999, 'wave'],
]);
const LEON_E = voKeys<KExpr>(VO, 'leon', 'happy', 'smile', [
  [S('roar'), E('roar') + 0.2, 'proud'], [S('f2b'), E('f2_turn') + 0.4, 'sleepy'], [S('s2'), E('s_roar'), 'laugh'], [CRY[0], E('s_upset'), 'surprised'],
  [S('s_sorry'), E('s_lull2'), 'oops'], [S('l_stir'), E('l_stir'), 'oops'], [S('l_whisper'), E('c_three') + 0.4, 'smile'], [S('l_ride'), E('l_gentle'), 'happy'],
  [S('c1'), 999, 'laugh'],
]);
const PIP_E = voKeys<KExpr>(VO, 'pip', 'happy', 'smile', [
  [S('s_lull'), E('s_lull'), 'sleepy'], [CRY[0], S('s_lull2'), 'oops'], [S('s_lull2'), E('s_lull2'), 'smile'], [S('l_ride'), E('ride_turn'), 'laugh'], [S('c1'), 999, 'laugh'],
]);
const PIP_A = voKeys<CArm>(VO, 'pip', 'wave', 'down', [
  [S('s_lull'), E('s_lull'), 'hug'], [S('s_upset'), E('s_upset'), 'point'], [S('s_lull2'), E('s_lull2'), 'hug'], [S('l_tip'), E('l_tip'), 'point'],
  [S('l_ride'), E('ride_turn') + 0.4, 'cheer'], [S('bye'), 999, 'wave'],
]);
const HOPS = [...wordHops(VO, [K.c1, K.c2]), S('f3b') + 0.3];
const HITS: Hit[] = [{ at: S('roar') + 0.1, amp: 10, dur: 0.35 }, { at: word('s_roar', 4) + 0.1, amp: 10, dur: 0.35 }];

// ── camera
const WIDE = { z: 1.0, x: 960, y: 540 };
const leonFace = critterFaceAt(LX, yAt(LX, LS), LS);
const LEON_CU = { z: 1.55, x: LX, y: leonFace[1] + 90 };
const STORY = { z: 1.2, x: 1180, y: 560 };
const KIDS = { z: 1.5, x: 560, y: yAt(X.mila, KS) - 230 };
const pipFace = (x: number) => critterFaceAt(x, yAt(x, PS), PS);
const NEST_CU = { z: 2.0, x: NEST_X - 60, y: yAt(NEST_X, PS) - 90 };
const HEAD_CU = { z: 1.5, x: 960, y: yAt(960, LS) - 470 };
const SHOTS: Shot[] = [
  { t: 0, ...LEON_CU, move: 'cut', push: 0.012 },
  { t: S('intro') + 0.6, ...WIDE, move: 'smooth', dur: 0.7, push: 0.01 },
  { t: S('sound') - 0.1, ...LEON_CU, move: 'smooth', dur: 0.5 },
  { t: S('facts') - 0.2, ...STORY, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('f1b') - 0.1, ...LEON_CU, move: 'snap' },
  { t: S('f2') - 0.2, ...STORY, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('f2_turn') - 0.1, ...LEON_CU, move: 'smooth', dur: 0.5 },
  { t: S('f3') - 0.2, ...STORY, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('f3b') - 0.1, ...KIDS, move: 'whip' },
  { t: S('f4') - 0.2, ...WIDE, move: 'whip', push: 0.01 },
  { t: S('m_snd') - 0.2, z: 2.0, x: PIP0 - 80, y: pipFace(PIP0)[1] + 40, move: 'snap' },
  { t: S('m_intro') + 0.4, z: 1.5, x: PIP0 - 200, y: pipFace(PIP0)[1] - 20, move: 'smooth', dur: 0.6 },
  { t: S('m_fact') - 0.1, z: 2.4, x: PIP0 - 40, y: pipFace(PIP0)[1] + 20, move: 'smooth', dur: 0.7 },
  { t: S('m_turn') - 0.1, ...STORY, move: 'smooth', dur: 0.6 },
  { t: S('s1') - 0.2, ...WIDE, move: 'smooth', dur: 0.8, push: 0.008 },
  { t: S('s_lull') - 0.1, ...NEST_CU, move: 'smooth', dur: 0.7 },
  { t: S('s2') - 0.1, ...WIDE, move: 'smooth', dur: 0.7, push: 0.01 },
  { t: S('s_roar') - 0.1, z: 1.45, x: 900, y: yAt(820, LS) - 330, move: 'snap' },
  { t: S('s_wake') - 0.1, ...NEST_CU, move: 'whip' },
  { t: S('s_upset') - 0.1, ...STORY, move: 'smooth', dur: 0.5 },
  { t: S('s_sorry') - 0.1, z: 1.5, x: 860, y: yAt(820, LS) - 330, move: 'snap' },
  { t: S('s_lull2') - 0.1, ...NEST_CU, move: 'smooth', dur: 0.6 },
  { t: S('q') - 0.2, ...WIDE, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('q_leo') - 0.1, ...KIDS, move: 'snap' },
  { t: S('l1') - 0.2, ...STORY, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('l_stir') - 0.1, ...NEST_CU, move: 'snap' },
  { t: S('l_tip') - 0.1, ...STORY, move: 'smooth', dur: 0.6 },
  { t: S('l_whisper') - 0.1, z: 1.55, x: 1300, y: yAt(1300, LS) - 300, move: 'smooth', dur: 0.8, push: 0.01 },
  { t: S('count') - 0.1, ...NEST_CU, move: 'smooth', dur: 0.7 },
  { t: S('whisper_turn') - 0.1, ...STORY, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('l_later') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('l_ride') - 0.1, ...HEAD_CU, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('l_hug') - 0.2, z: 1.2, x: 1000, y: 520, move: 'smooth', dur: 0.8, push: 0.012 },
  { t: S('lesson') - 0.2, ...WIDE, move: 'smooth', dur: 0.8, push: 0.01 },
  { t: S('leo_learn') - 0.1, ...KIDS, move: 'snap' },
  { t: S('your_q') - 0.1, ...WIDE, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('rem') - 0.2, ...WIDE, move: 'cut', push: 0.008 },
  { t: S('ra1') - 0.1, z: 1.5, x: 960, y: yAt(960, LS) - 300, move: 'snap' },
  { t: S('rq2') - 0.2, ...WIDE, move: 'smooth', dur: 0.5 },
  { t: S('ra2') - 0.1, ...KIDS, move: 'snap' },
  { t: S('rq7') - 0.2, ...WIDE, move: 'smooth', dur: 0.5 },
  { t: S('ra7') - 0.1, ...HEAD_CU, move: 'snap' },
  { t: S('rq3') - 0.2, ...WIDE, move: 'smooth', dur: 0.5 },
  { t: S('ra3') - 0.1, ...HEAD_CU, move: 'snap' },
  { t: S('rq6') - 0.2, ...WIDE, move: 'smooth', dur: 0.5 },
  { t: S('ra6') - 0.1, ...HEAD_CU, move: 'snap' },
  { t: S('rq4') - 0.2, ...WIDE, move: 'smooth', dur: 0.5 },
  { t: S('ra4') - 0.1, ...KIDS, move: 'snap' },
  { t: S('rq5') - 0.2, ...WIDE, move: 'smooth', dur: 0.5 },
  { t: S('ra5') - 0.1, ...KIDS, move: 'snap' },
  { t: S('chant') - 0.2, z: 1.04, x: 960, y: 560, move: 'smooth', dur: 0.6, push: 0.015 },
  { t: S('bye') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
];
SHOTS.sort((a, b) => a.t - b.t);
const PUNCHES = [S('roar') + 0.05, word('s_roar', 4) + 0.05, S('l_ride')];

// ── props
const SoundRings: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) => (
  <g>
    {ROARS.map(([a, dir]) => within(t, a, a + 1.6) && [0, 0.25, 0.5].map((d, k) => {
      const p = prog(t, a + d, a + d + 1.0);
      const r = 120 + p * 320;
      const x0 = x + dir * (80 + p * 300);
      return p > 0 && p < 1 && (
        <path key={`${a}-${k}`} d={`M ${x0},${y - 60 - p * 120} A ${r},${r} 0 0 ${dir < 0 ? 0 : 1} ${x0},${y + 60 + p * 120}`}
          fill="none" stroke="#ffb703" strokeWidth={14 * (1 - p)} strokeLinecap="round" opacity={1 - p} />
      );
    }))}
  </g>
);
const Nest: React.FC<{ front?: boolean }> = ({ front }) => (
  front ? (
    <g>
      <Vol kind="slope"><path d="M -130,-20 Q -120,50 0,54 Q 120,50 130,-20 Q 70,10 0,10 Q -70,10 -130,-20 Z" fill="#c9a66b" {...kst(6)} /></Vol>
      {[-90, -40, 20, 70].map((x, k) => <path key={k} d={`M ${x},${-6 + (k % 2) * 8} q 20,14 40,0`} fill="none" stroke="#8d6e46" strokeWidth={5} strokeLinecap="round" />)}
    </g>
  ) : <Vol kind="slope"><ellipse cx={0} cy={-20} rx={130} ry={40} fill="#a47c48" {...kst(6)} /></Vol>
);
const CANOPY = [[-150, -560, 150], [150, -580, 150], [0, -690, 165], [10, -540, 140]];
const Tree: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x},${y})`}>
    <Vol kind="tube"><rect x={-50} y={-520} width={100} height={540} rx={30} fill="#8d5a3b" {...kst(7)} /></Vol>
    {CANOPY.map(([cx, cy, r], k) => <circle key={`o${k}`} cx={cx} cy={cy} r={r} fill="#52b788" {...kst(14)} />)}
    {CANOPY.map(([cx, cy, r], k) => <circle key={`f${k}`} cx={cx} cy={cy} r={r - 3} fill={['#52b788', '#40916c', '#74c69d', '#52b788'][k]} />)}
    {CANOPY.map(([cx, cy, r], k) => <circle key={`h${k}`} cx={cx - r * 0.35} cy={cy - r * 0.35} r={r * 0.32} fill="#ffffff" opacity={0.18} />)}
  </g>
);

export default function KidsAnimals074() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const shake = shakeOf(t, HITS);
  const hop = hopAt(t, HOPS, { h: 50 });
  const lw = walkPath(t, LEON_PATH, 150 * LS);
  const pw = walkPath(t, PIP_PATH, 130 * PS);
  const leonX = lw.x;
  const riding = within(t, S('ride_turn'), E('ride_turn') + 0.4);
  const leonY = yAt(leonX, LS) - (riding ? Math.abs(Math.sin(t * 6)) * 26 : 0);
  const leonOn = leonX > -380;
  const story = t >= S('s1') - 0.4;
  const onHead = within(t, ...ON_HEAD);
  const headY = leonY - 600 * LS;
  const jump = prog(t, ON_HEAD[0], ON_HEAD[0] + 0.8);
  const pipX = onHead ? pw.x + (leonX - 70 - pw.x) * EASE_INOUT(jump) : pw.x;
  const pipGround = yAt(pipX, PS);
  const pipY = onHead ? pipGround + (headY - pipGround) * EASE_INOUT(jump) - Math.sin(jump * Math.PI) * 120 : pipGround;
  const pipShown = t >= S('m_snd') - 0.05;
  const pipPop = t < S('m_snd') + 0.4 ? popIn(t, S('m_snd') - 0.05, 0.4) : 1;
  const pride = within(t, S('f4') + 0.6, E('f4b') + 1.2);
  const cub = within(t, word('f3', 6), E('f3b') + 0.6);
  const seg = LEON_PATH.find(([a, b]) => t > a && t < b);
  const facingL: 1 | -1 = seg ? (seg[3] > seg[2] ? 1 : -1) : t >= S('s2') && t < S('lesson') ? 1 : -1;
  const crying = within(t, ...CRY);
  const sleeping = asleep(t);
  const stir = within(t, S('l_stir'), E('l_stir') + 0.3);
  const whisper = within(t, S('l_whisper'), E('c_three'));
  const leonFaceNow = critterFaceAt(leonX, leonY, LS);
  // the 3 babies: in the nest, then up on Leon's head with Pip
  const babyAt = (k: number): [number, number] => {
    const nx = NEST_X - 60 + k * 60;
    const ny = yAt(NEST_X, PS) - 26;
    if (!onHead) return [nx, ny];
    const p = EASE_INOUT(prog(t, ON_HEAD[0] + 0.2 + k * 0.15, ON_HEAD[0] + 1.0 + k * 0.15));
    const hx = leonX - 10 + k * 55;
    return [nx + (hx - nx) * p, ny + (headY + 4 - ny) * p - Math.sin(p * Math.PI) * 100];
  };

  return (
    <>
      <ActionStage cam={cam} shake={shake} blur={cam.blur}>
        <Backdrop place={PLACE} w={W} h={H} t={t} fx={['butterflies']} />
        {story && <g opacity={popIn(t, S('s1') - 0.4, 0.6)}><Tree x={NEST_X + 160} y={yAt(NEST_X, LS) - 30} /></g>}
        {story && <g transform={`translate(${NEST_X},${yAt(NEST_X, PS)})`}><Nest /></g>}
        <PlaceLight place={PLACE}>
          {/* the pride */}
          {pride && ([[-330, LIONESS, 0.6], [330, LIONESS, 0.6], [-190, CUB, 0.36], [200, CUB, 0.34]] as [number, CritterSpec, number][]).map(([dx, spec, s], k) => {
            const xx = LX + dx;
            return (
              <g key={k} transform={`translate(${xx},${yAt(xx, s)}) scale(${popIn(t, S('f4') + 0.6 + k * 0.15)}) translate(${-xx},${-yAt(xx, s)})`}>
                <Critter spec={spec} x={xx} y={yAt(xx, s)} scale={s} expr="happy" facing={dx < 0 ? 1 : -1} hop={k > 1 ? Math.abs(Math.sin(t * 5 + k)) * 16 : 0} />
              </g>
            );
          })}
          {/* the babies (in the nest: drawn between its back and its front rim) */}
          {story && [0, 1, 2].map((k) => {
            const [bx, by] = babyAt(k);
            return (
              <Critter key={k} spec={BABY} x={bx} y={by} scale={0.11} expr={crying ? 'sad' : sleeping ? 'sleepy' : onHead ? 'laugh' : 'smile'}
                mouth={crying ? 0.6 + 0.4 * Math.sin(t * 14 + k) : 0} tilt={stir ? Math.sin(t * 16 + k) * 10 : 0} idle={!sleeping} shadow={false}
                hop={onHead && riding ? Math.abs(Math.sin(t * 6 + k)) * 10 : 0} armL={onHead && t < S('lesson') ? 'up' : 'down'} />
            );
          })}
          {story && <g transform={`translate(${NEST_X},${yAt(NEST_X, PS)})`}><Nest front /></g>}
          {leonOn && (
            <Critter spec={LEON} x={leonX} y={leonY} scale={LS} expr={exprAt(t, LEON_E)}
              look={onHead ? [0, -1] : whisper ? [0.8, 0.5] : t >= S('s2') && t < S('q') ? [0.6, 0.2] : [-0.3, 0]}
              mouth={within(t, S('l_whisper'), E('l_whisper')) ? lipSync(VO, 'leon', t) * 0.35 : lipSync(VO, 'leon', t)} armL={poseAt(t, LEON_A)} armR={poseAt(t, LEON_A)}
              walking={lw.walking} walk={lw.walk} facing={facingL} tilt={whisper ? 8 : 0} />
          )}
          {cub && (
            <g transform={`translate(${LX + 260},${yAt(LX + 260, 0.36)}) scale(${popIn(t, word('f3', 6))}) translate(${-(LX + 260)},${-yAt(LX + 260, 0.36)})`}>
              <Critter spec={CUB} x={LX + 260} y={yAt(LX + 260, 0.36)} scale={0.36} expr="happy" facing={-1} hop={Math.abs(Math.sin(t * 5)) * 14} />
            </g>
          )}
          {pipShown && (
            <g transform={`translate(${pipX},${pipY}) scale(${pipPop}) translate(${-pipX},${-pipY})`}>
              <Critter spec={PIP} x={pipX} y={pipY} scale={PS} expr={exprAt(t, PIP_E)} look={onHead ? [0, 0] : story ? [0.6, 0.3] : [-0.4, -0.6]}
                mouth={lipSync(VO, 'pip', t)} armL={poseAt(t, PIP_A)} armR={poseAt(t, PIP_A)} walking={pw.walking} walk={pw.walk * 1.6} facing={pw.walking ? -1 : 1}
                hop={(within(t, S('m_fact_b'), E('m_fact_b')) ? Math.abs(Math.sin(t * 12)) * 10 : 0) + (onHead && riding ? Math.abs(Math.sin(t * 6)) * 12 : 0)} />
            </g>
          )}
          {/* the kids, watching */}
          <Critter spec={BOBO_HERO} x={X.bobo} y={yAt(X.bobo, BS)} scale={BS} expr={exprAt(t, BOBO_E)} look={[0.7, -0.1]} mouth={lipSync(VO, 'bobo', t)}
            armL={poseAt(t, BOBO_A)} armR={poseAt(t, BOBO_A)} hop={hop.hop} squash={hop.squash} />
          <Kid spec={MILA_HERO} x={X.mila} y={yAt(X.mila, KS)} scale={KS} expr={exprAt(t, MILA_E)} look={[0.7, -0.1]} mouth={lipSync(VO, 'mila', t)}
            armL={poseAt(t, MILA_L)} armR={poseAt(t, MILA_R)} hop={hop.hop} squash={hop.squash} />
          <Kid spec={LEO_HERO} x={X.leo} y={yAt(X.leo, KS)} scale={KS} expr={exprAt(t, LEO_E)} look={[0.7, -0.1]} mouth={lipSync(VO, 'leo', t)}
            armL={poseAt(t, LEO_L)} armR={poseAt(t, LEO_R)} hop={hop.hop} squash={hop.squash} />
        </PlaceLight>
        {leonOn && <SoundRings t={t} x={leonX} y={leonFaceNow[1] + 40} />}
        {within(t, S('s2'), E('s2') + 0.6) && <MotionLines t={t} from={S('s2')} to={E('s2') + 0.6} x={leonX - 160} y={leonY - 200} dir={-1} n={3} len={80} />}
        {/* the quiet count: 1 · 2 · 3 badges over the sleeping babies */}
        {COUNT.map((a, k) => t >= a && t < E('c_three') + 1.6 && (
          <g key={k} transform={`translate(${babyAt(k)[0]},${babyAt(k)[1] - 110}) scale(${popIn(t, a) * 0.8})`}>
            <circle r={30} fill={['#ff595e', '#ffca3a', '#4cc9f0'][k]} {...kst(4)} />
            <text y={12} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={36} fill="#ffffff">{k + 1}</text>
          </g>
        ))}
        <ImpactStar t={t} at={S('roar') + 0.05} x={LX + 260} y={leonFace[1] - 160} s={0.7} text="ROAR!" />
        <ImpactStar t={t} at={word('s_roar', 4) + 0.05} x={1060} y={yAt(820, LS) - 560} s={0.6} text="ROAR!" />
        <StageWord t={t} at={S('f2b')} until={E('f2_turn') + 0.4} text="YAWN…" x={LX + 200} y={leonFace[1] - 200} size={90} color="#c77dff" rot={6} />
        <StageWord t={t} at={S('s_lull') + 0.6} until={S('s2') + 1.0} text="ZZZ…" x={NEST_X + 40} y={yAt(NEST_X, PS) - 170} size={60} color="#c77dff" rot={6} />
        <StageWord t={t} at={E('l_smile') - 0.6} until={S('l_later')} text="ZZZ…" x={NEST_X + 40} y={yAt(NEST_X, PS) - 170} size={60} color="#c77dff" rot={6} />
        <StageWord t={t} at={S('s_cry')} until={E('s_upset')} text="WAAH!" x={NEST_X + 20} y={yAt(NEST_X, PS) - 180} size={72} color="#4cc9f0" rot={-6} />
        <StageWord t={t} at={S('l_whisper')} until={E('l_whisper') + 0.6} text="psst… hello…" x={1360} y={yAt(1300, LS) - 470} size={48} color="#ffc8dd" rot={-4} />
        <StageWord t={t} at={word('ride_turn', 3)} until={E('ride_turn') + 0.3} text="BUMPITY BUMP!" x={960} y={yAt(960, LS) - 640} size={64} color="#ffb703" rot={-4} />
        <StageWord t={t} at={S('m_fact_b')} until={E('m_fact_b') + 0.4} text="TWITCH!" x={PIP0 + 40} y={pipFace(PIP0)[1] - 110} size={48} color="#ffc8dd" rot={5} />
        <Reaction kind="!" t={t} at={CRY[0]} until={E('s_upset')} x={leonX + 60} y={leonFaceNow[1] - 230} s={0.7} />
        <Reaction kind="sweat" t={t} at={S('s_sorry')} until={E('s_sorry') + 0.3} x={leonX + 120} y={leonFaceNow[1] - 180} s={0.6} />
        <Reaction kind="heart" t={t} at={S('l_smile')} until={E('l_smile') + 0.6} x={NEST_X} y={yAt(NEST_X, PS) - 200} s={0.5} />
        <Reaction kind="heart" t={t} at={S('l_hug')} until={E('l_hug') + 1} x={leonX + 160} y={leonFaceNow[1] - 260} s={0.7} />
        <Reaction kind="?" t={t} at={E('q_leo')} until={S('q_mila') + 0.6} x={X.leo} y={yAt(X.leo, KS) - 420} s={0.45} />
        <Reaction kind="idea" t={t} at={S('leo_learn')} until={E('leo_learn') + 0.3} x={X.leo} y={yAt(X.leo, KS) - 420} s={0.45} />
      </ActionStage>

      {/* screen-space */}
      <PopText t={t} at={0.9} until={S('sound') - 0.1} text="LEON THE LION!" y={110} size={110} color="#ffb703" />
      <PopText t={t} at={S('sound')} until={S('facts') - 0.1} text="🗣️ ROAR LIKE LEON!" y={110} size={96} color="#ffffff" />
      <PopText t={t} at={S('f1')} until={S('f2') - 0.1} text="1 · A HUGE ROAR!" y={110} size={100} color="#ffb703" />
      <PopText t={t} at={S('f2')} until={S('f2_turn') - 0.1} text="2 · LOTS OF NAPS!" y={110} size={100} color="#c77dff" />
      <PopText t={t} at={S('f2_turn')} until={S('f3') - 0.1} text="🥱 YAWN LIKE LEON!" y={110} size={100} color="#ffffff" />
      <PopText t={t} at={S('f3')} until={S('f4') - 0.1} text="3 · A BABY = A CUB!" y={110} size={100} color="#f6bd60" />
      <PopText t={t} at={S('f4')} until={S('m_snd') - 0.1} text="4 · A FAMILY = A PRIDE!" y={110} size={96} color="#ff924c" />
      <PopText t={t} at={S('m_intro')} until={S('m_fact') - 0.1} text="PIP THE MOUSE!" y={110} size={110} color="#ffc8dd" />
      <PopText t={t} at={S('m_fact')} until={S('m_turn') - 0.1} text="LONG WHISKERS!" y={110} size={110} color="#ffffff" />
      <PopText t={t} at={S('m_turn')} until={S('s1') - 0.1} text="🗣️ SQUEAK, SQUEAK!" y={110} size={100} color="#ffc8dd" />
      <PopText t={t} at={S('q')} until={beat(E('q') + 0.1)} text="HOW CAN LEON SAY HELLO?" y={110} size={90} color="#ffffff" />
      <ThinkTimer t={t} from={beat(E('q') + 0.1)} to={S('q_leo') - 0.1} x={1780} y={170} r={84} />
      <PopText t={t} at={S('q_mila')} until={S('l1') - 0.1} text="A QUIET VOICE!" y={110} size={110} color="#52b788" />
      <PopText t={t} at={S('l_stir')} until={S('l_tip') - 0.1} text="TOO LOUD!" y={110} size={120} color="#ff595e" />
      <PopText t={t} at={S('l_tip')} until={S('l_smile') - 0.1} text="🤫 A WHISPER!" y={110} size={110} color="#ffc8dd" />
      <PopText t={t} at={S('c_one')} until={S('whisper_turn') - 0.1} text="1 · 2 · 3 BABIES" y={110} size={100} color="#ffca3a" />
      <PopText t={t} at={S('whisper_turn')} until={S('l_later') - 0.1} text="🤫 WHISPER LIKE LEON!" y={110} size={96} color="#ffffff" />
      <PopText t={t} at={S('l_gentle')} until={S('l_hug') - 0.1} text="BIG, BUT GENTLE!" y={110} size={110} color="#ffb703" />
      <PopText t={t} at={S('lesson')} until={S('leo_learn') - 0.1} text="BEING GENTLE = SUPER POWER!" y={110} size={88} color="#ff6fa5" />
      <PopText t={t} at={S('your_q')} until={S('rem') - 0.1} text="WHEN DO YOU WHISPER? 🤫" y={110} size={96} color="#ffffff" />
      <PopText t={t} at={S('rem')} until={S('rq1') - 0.1} text="LET'S REMEMBER!" y={110} size={110} color="#ffca3a" />
      {(['rq1', 'rq2', 'rq7', 'rq3', 'rq6', 'rq4', 'rq5'] as const).map((q) => <ThinkTimer key={q} t={t} from={beat(E(q) + 0.1)} to={VO[K[q] + 1].start - 0.1} x={1780} y={170} r={84} />)}
      <PopText t={t} at={S('ra1')} until={S('rq2') - 0.2} text="ROAR!" y={110} size={140} color="#ffb703" />
      <PopText t={t} at={S('ra2')} until={S('rq7') - 0.2} text="A CUB!" y={110} size={130} color="#f6bd60" />
      <PopText t={t} at={S('ra7')} until={S('rq3') - 0.2} text="THREE!" y={110} size={130} color="#ffca3a" />
      <PopText t={t} at={S('ra3')} until={S('rq6') - 0.2} text="THE BIG ROAR!" y={110} size={110} color="#ff595e" />
      <PopText t={t} at={S('ra6')} until={S('rq4') - 0.2} text="WHISKERS!" y={110} size={130} color="#ffffff" />
      <PopText t={t} at={S('ra4')} until={S('rq5') - 0.2} text="A WHISPER!" y={110} size={120} color="#ffc8dd" />
      <PopText t={t} at={S('ra5')} until={S('chant') - 0.2} text="BE GENTLE!" y={110} size={120} color="#ff6fa5" />
      <PopText t={t} at={S('c1')} until={S('c_turn') - 0.05} text="GENTLE HANDS, GENTLE VOICE!" y={110} size={88} color="#ffca3a" />
      <PopText t={t} at={S('c_turn')} until={S('bye') - 0.1} text="🗣️ YOUR TURN!" y={110} size={110} color="#ffffff" />
      <PopText t={t} at={S('bye')} until={END_IRIS} text="SEE YOU NEXT TIME!" y={110} size={100} color="#ffb703" />
      <Confetti t={t} at={S('l_smile') + 0.6} y={380} />
      <Confetti t={t} at={S('l_ride')} y={380} />
      <Confetti t={t} at={E('c2')} y={380} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <StarWipe t={t} at={END_IRIS} dur={0.5} hold={5} color="#ffb703" x={W / 2} y={H * 0.45} />
    </>
  );
}
