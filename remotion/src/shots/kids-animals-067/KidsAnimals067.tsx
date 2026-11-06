// TINY SPARKS · Day 67 · 🦁 Animal Stories #10 — "Bella the Butterfly's Journey" (LONG 16:9, 5:50)
// kids-shorts/tiny-sparks/animals/day-067-bella-the-butterflys-journey. Cues from VO via K (keys.gen.ts).
// ENERGY LAYER standard: ident → GUESS WHO (a green chrysalis wiggles on a branch, think timer) → crack: Bella pops out,
// wings crumpled → dries them in the sun → opens them (wow) → MEET Super Bobo → SOUND twist: butterflies are quiet —
// "flutter, flutter" (your turn, flap your arms) → 3 TRUE FACTS (egg → caterpillar → chrysalis → butterfly, a 4-card
// strip · they taste with their feet · they drink nectar through a long curly tongue, like a straw — sip, your turn) →
// STORY (value: little by little, rest and keep going): to the Rainbow Garden with Mila, Leo & Bobo → a big wind
// (hold on to a flower and wait) → rain at the pond (think timer · Leo: "fly between the raindrops!" ✗ · Bobo's leaf
// umbrella) → sun + a rainbow → tired on the hill: Bella rests on Bobo's nose → ACHOO → the Rainbow Garden: count 3
// flower colours, butterfly friends → lesson → LET'S REMEMBER (5 questions) → chant → bye + star iris.
import React from 'react';
import { Critter, critterFaceAt, type CArm } from '../../lib/kids/critter';
import { Kid, kidFaceAt, type KArm } from '../../lib/kids/kid';
import { BOBO_HERO, CAPTION_COLORS, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR } from '../../lib/kids/sets';
import { Backdrop } from '../../lib/kids/places';
import { AnswerMark, Confetti, KidsCaptions, PopText, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { Face, KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import {
  ActionStage, Dust, ImpactStar, MotionLines, Reaction, SparksIntro, StageWord, StarWipe, directorCam, onBeat, shakeOf,
  type Hit, type Shot,
} from '../../lib/kids/energy';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsAnimals067', durationInSeconds: 350.0, fps: 30, width: 1920, height: 1080 };

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
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff', bella: '#c77dff' };
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
const BS = 0.6; // Bobo
const KS = 0.54; // kids
const BELLA_S = 0.62;
const WING = { a: '#c77dff', b: '#ff8fab', dot: '#ffd166' };
const MILA_X = 330;
const LEO_X = 600;
const BOBO_X = 880;
const BELLA_HOME: [number, number] = [1250, 520];
const BRANCH_X = 1250;
const BRANCH_Y = 250;
const FLOWER_X = 1560; // the flower Bella holds in the wind / tastes in fact 2
const RAINBOW_C = ['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];

// ── timeline anchors
const WIGGLE = S('g2');
const CRACK = S('crack');
const REVEAL = S('reveal') - 0.1;
const OPEN0 = S('open');
const OPEN1 = word('open', 6); // "Wow!"
const GO0 = S('go') + 0.8; // everybody walks off to the right...
const SCENE_WIND = S('wind') - 0.6; // ...cut: the meadow, further along
const BLOWN = S('blown') - 0.3;
const CALM = S('calm');
const GO1 = E('bella_ok') + 0.2;
const SCENE_POND = S('pond') - 0.2;
const RAIN0 = word('clouds', 3); // "Pitter"
const LEAF = word('bobo_leaf', 6);
const UNDER = S('under');
const SUN = S('sun');
const RAINBOW0 = S('rainbow');
const GO2 = S('hill') - 0.2;
const SCENE_HILL = S('hill') + 1.6;
const NOSE = word('nose', 1); // lands
const ACHOO = word('tickle', 6);
const GARDEN = S('garden') - 0.3;
const FRIENDS = S('friends');
const END_IRIS = E('bye2') + 0.6;

type Scene = 'meadow' | 'wind' | 'pond' | 'hill';
const sceneAt = (t: number): Scene => (t < SCENE_WIND ? 'meadow' : t < SCENE_POND ? 'wind' : t < SCENE_HILL ? 'pond' : 'hill');

// walkers: each scene starts with the group entering from the left and ends walking off to the right
const groupX = (t: number, home: number): number => {
  if (t < GO0) return home;
  if (t < SCENE_WIND) return home + (W + 500 - home) * EASE_INOUT(prog(t, GO0, GO0 + 3.0));
  if (t < GO1) return -400 + (home + 400) * EASE_OUT(prog(t, SCENE_WIND, SCENE_WIND + 1.6));
  if (t < SCENE_POND) return home + (W + 500 - home) * EASE_INOUT(prog(t, GO1, GO1 + 3.0));
  if (t < GO2) return -400 + (home + 400) * EASE_OUT(prog(t, SCENE_POND, SCENE_POND + 2.0));
  if (t < SCENE_HILL) return home + (W + 500 - home) * EASE_INOUT(prog(t, GO2, GO2 + 1.8));
  return -400 + (home + 400) * EASE_OUT(prog(t, SCENE_HILL, SCENE_HILL + 1.8));
};
const groupMoving = (t: number) =>
  within(t, GO0, GO0 + 3.0) || within(t, SCENE_WIND, SCENE_WIND + 1.6) || within(t, GO1, GO1 + 3.0) ||
  within(t, SCENE_POND, SCENE_POND + 2.0) || within(t, GO2, GO2 + 1.8) || within(t, SCENE_HILL, SCENE_HILL + 1.8);

// Bella's flight (screen space, before the camera)
const nosePt = critterFaceAt(BOBO_X, f, BS);
const BELLA_PATH: KF = [
  [0, BRANCH_X, BRANCH_Y + 150], [REVEAL, BRANCH_X, BRANCH_Y + 150], [REVEAL + 0.6, BRANCH_X, BRANCH_Y + 190],
  [OPEN1 + 0.4, BRANCH_X, BRANCH_Y + 190], [OPEN1 + 1.4, ...BELLA_HOME],
  [S('fact2') + 0.2, ...BELLA_HOME], [S('fact2') + 1.6, FLOWER_X, f - 470], [E('fact3_turn') + 0.2, FLOWER_X, f - 470],
  [S('story') + 1.2, ...BELLA_HOME], [GO0, ...BELLA_HOME], [SCENE_WIND - 0.01, W + 400, 380],
  [SCENE_WIND, -300, 380], [SCENE_WIND + 1.6, 1100, 420], [BLOWN, 1100, 420], [BLOWN + 1.2, FLOWER_X - 10, f - 500],
  [GO1, FLOWER_X - 10, f - 500], [SCENE_POND - 0.01, W + 400, 380],
  [SCENE_POND, -300, 380], [SCENE_POND + 2.0, 1150, 420], [RAIN0 + 0.4, 1150, 420], [LEAF + 1.2, BOBO_X + 60, f - 330],
  [SUN + 1.0, BOBO_X + 60, f - 330], [RAINBOW0 + 0.5, 1150, 420], [GO2, 1150, 420], [SCENE_HILL - 0.01, W + 400, 380],
  [SCENE_HILL, -300, 380], [SCENE_HILL + 2.4, 1150, 470], [NOSE - 0.6, 1150, 470], [NOSE + 0.4, nosePt[0] + 20, nosePt[1] - 150],
  [ACHOO, nosePt[0] + 20, nosePt[1] - 150], [ACHOO + 0.8, 1300, 330], [S('keep') + 0.4, 1150, 470],
  [GARDEN, 1150, 470], [GARDEN + 1.2, 1260, 430],
  [S('lesson'), 1260, 430], [S('again') + 0.6, ...BELLA_HOME],
];

// ── director camera
const WIDE = { z: 1.0, x: 960, y: 540 };
const BELLA_CU = (x: number, y: number) => ({ z: 1.6, x, y: y + 20 });
const BOBO_CU = { z: 1.55, x: BOBO_X, y: f - 280 };
const KID_Y = kidFaceAt(MILA_X, f, KS)[1] + 60;
const MILA_CU = { z: 1.55, x: MILA_X + 40, y: KID_Y };
const LEO_CU = { z: 1.55, x: LEO_X - 30, y: KID_Y };
const HOME_CU = BELLA_CU(...BELLA_HOME);
const SHOTS: Shot[] = [
  { t: 0, ...WIDE, move: 'cut', push: 0.01 },
  { t: WIGGLE - 0.3, z: 1.6, x: BRANCH_X, y: BRANCH_Y + 170, move: 'smooth', dur: 1.4, push: 0.02 },
  { t: S('g3') + 0.3, z: 1.25, x: BRANCH_X - 100, y: 420, move: 'smooth', dur: 0.8 },
  { t: CRACK - 0.1, z: 1.7, x: BRANCH_X, y: BRANCH_Y + 180, move: 'snap', push: 0.01 },
  { t: OPEN0 - 0.2, z: 1.5, x: BRANCH_X, y: BRANCH_Y + 200, move: 'smooth', dur: 2.0, push: 0.02 },
  { t: OPEN1 + 0.6, ...HOME_CU, move: 'smooth', dur: 1.0 },
  { t: S('bobo_hi') - 0.2, ...BOBO_CU, move: 'whip' },
  { t: S('sound_q') - 0.2, ...HOME_CU, move: 'whip', push: 0.01 },
  { t: S('sound_a') - 0.1, z: 1.9, x: BELLA_HOME[0], y: BELLA_HOME[1] + 10, move: 'smooth', dur: 1.2, push: 0.02 },
  { t: S('sound_b') - 0.1, ...HOME_CU, move: 'smooth', dur: 0.6 },
  { t: S('sound_turn') - 0.2, ...WIDE, move: 'smooth', dur: 0.7 },
  { t: S('facts') - 0.2, z: 1.1, x: 960, y: 520, move: 'smooth', dur: 0.7 },
  { t: S('fact1b') - 0.2, z: 1.15, x: 960, y: 470, move: 'smooth', dur: 0.8 },
  { t: S('fact2') - 0.2, z: 1.45, x: FLOWER_X - 80, y: f - 380, move: 'smooth', dur: 1.4, push: 0.02 },
  { t: S('fact3b') - 0.2, z: 1.7, x: FLOWER_X - 40, y: f - 420, move: 'smooth', dur: 1.0, push: 0.02 },
  { t: S('fact3_turn') - 0.2, ...WIDE, move: 'smooth', dur: 0.7 },
  { t: S('story') - 0.2, ...WIDE, move: 'smooth', dur: 0.7 },
  { t: S('want') - 0.1, ...HOME_CU, move: 'snap', push: 0.02 },
  { t: S('far') - 0.2, z: 1.05, x: 1100, y: 500, move: 'smooth', dur: 3.0, push: 0.02 },
  { t: S('mila_in') - 0.1, ...MILA_CU, move: 'whip' },
  { t: S('leo_in') - 0.1, ...LEO_CU, move: 'whip' },
  { t: S('go') - 0.2, ...WIDE, move: 'smooth', dur: 0.8 },
  { t: SCENE_WIND, ...WIDE, move: 'cut' },
  { t: BLOWN - 0.1, z: 1.35, x: 1350, y: 480, move: 'snap', push: 0.01 },
  { t: S('mila_hold') - 0.1, ...MILA_CU, move: 'whip' },
  { t: S('hold') - 0.2, z: 1.55, x: FLOWER_X - 20, y: f - 470, move: 'smooth', dur: 1.0, push: 0.03 },
  { t: CALM - 0.2, ...WIDE, move: 'smooth', dur: 0.8 },
  { t: S('bella_ok') - 0.1, z: 1.6, x: FLOWER_X - 20, y: f - 480, move: 'snap' },
  { t: GO1 - 0.2, ...WIDE, move: 'smooth', dur: 0.8 },
  { t: SCENE_POND, ...WIDE, move: 'cut' },
  { t: S('clouds') - 0.2, z: 1.08, x: 960, y: 470, move: 'smooth', dur: 1.2 },
  { t: S('bella_wet') - 0.1, z: 1.6, x: 1150, y: 440, move: 'snap', push: 0.02 },
  { t: S('q_rain') - 0.2, ...WIDE, move: 'smooth', dur: 0.7 },
  { t: S('leo_guess') - 0.1, ...LEO_CU, move: 'whip' },
  { t: S('mila_no') - 0.1, ...MILA_CU, move: 'whip' },
  { t: S('leo_laugh') - 0.1, ...LEO_CU, move: 'snap' },
  { t: S('bobo_leaf') - 0.1, ...BOBO_CU, move: 'whip' },
  { t: UNDER - 0.2, z: 1.2, x: 700, y: 560, move: 'smooth', dur: 1.0, push: 0.02 },
  { t: S('bella_dry') - 0.1, z: 1.55, x: BOBO_X + 40, y: f - 330, move: 'snap' },
  { t: SUN - 0.2, ...WIDE, move: 'smooth', dur: 1.0 },
  { t: RAINBOW0 - 0.2, z: 1.05, x: 960, y: 470, move: 'smooth', dur: 3.0, push: 0.02 },
  { t: GO2 - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: SCENE_HILL, ...WIDE, move: 'cut' },
  { t: S('tired') - 0.1, z: 1.6, x: 1150, y: 490, move: 'smooth', dur: 0.8, push: 0.02 },
  { t: S('nose') - 0.2, z: 1.45, x: BOBO_X + 80, y: f - 330, move: 'smooth', dur: 1.0, push: 0.02 },
  { t: ACHOO - 0.1, z: 1.2, x: 1000, y: 470, move: 'snap' },
  { t: S('keep') - 0.2, ...WIDE, move: 'smooth', dur: 1.0 },
  { t: GARDEN - 0.1, z: 1.05, x: 1050, y: 500, move: 'snap', push: 0.01 },
  { t: S('count_q') - 0.2, z: 1.1, x: 1300, y: 600, move: 'smooth', dur: 1.0 },
  { t: FRIENDS - 0.2, ...WIDE, move: 'smooth', dur: 0.8 },
  { t: S('bella_happy') - 0.1, ...BELLA_CU(1260, 430), move: 'snap', push: 0.02 },
  { t: S('lesson') - 0.2, ...WIDE, move: 'smooth', dur: 0.8 },
  { t: S('again') - 0.2, ...WIDE, move: 'smooth', dur: 0.8 },
  { t: S('a1') - 0.1, ...HOME_CU, move: 'snap' },
  { t: E('a1') + 0.6, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('a3') - 0.1, ...HOME_CU, move: 'snap' },
  { t: E('a3') + 0.6, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('a4') - 0.1, ...LEO_CU, move: 'snap' },
  { t: E('a4') + 0.6, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('a5') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: S('chant') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('c1') - 0.1, z: 1.3, x: BELLA_HOME[0] - 200, y: 560, move: 'smooth', dur: 0.5, push: 0.02 },
  { t: S('c_turn') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
];
const PUNCHES = [CRACK, OPEN1, BLOWN + 0.2, ACHOO, GARDEN + 0.2, S('c3')];
const HITS: Hit[] = [{ at: CRACK, amp: 6, dur: 0.25 }, { at: ACHOO, amp: 10, dur: 0.35 }, { at: BLOWN, amp: 6, dur: 0.5 }];

// ── Bella the butterfly (a custom rig: big round head with the kit face, 4 wings, curly tongue)
const Bella: React.FC<{
  x: number; y: number; s: number; t: number; expr: KExpr; mouth: number; look?: [number, number];
  open?: number; flap?: number; tilt?: number; tongue?: number; wet?: boolean; facing?: 1 | -1;
}> = ({ x, y, s, t, expr, mouth, look = [0, 0], open = 1, flap = 1, tilt = 0, tongue = 0, wet = false, facing = 1 }) => {
  const k = (0.18 + 0.82 * open) * flap; // wing spread (scaleX)
  const crumple = 1 - open;
  const wingA = wet ? '#9d6fc4' : WING.a;
  const wingB = wet ? '#c77d98' : WING.b;
  const wing = (side: 1 | -1) => (
    <g transform={`scale(${side * k},${1 - crumple * 0.35}) rotate(${crumple * 18})`}>
      <Vol>
        <path d="M 30,-60 Q 300,-330 330,-110 Q 340,10 40,10 Z" fill={wingA} {...kst(8)} />
        <path d="M 30,20 Q 260,40 240,190 Q 200,270 30,90 Z" fill={wingB} {...kst(8)} />
      </Vol>
      <circle cx={220} cy={-150} r={34} fill={WING.dot} {...kst(5)} />
      <circle cx={150} cy={-70} r={20} fill="#ffffff" opacity={0.85} />
      <circle cx={160} cy={120} r={24} fill={WING.dot} {...kst(5)} />
    </g>
  );
  const tongueLen = 40 + 230 * tongue;
  return (
    <g transform={`translate(${x},${y}) rotate(${tilt}) scale(${s * facing},${s})`}>
      {wing(-1)}
      {wing(1)}
      {/* body */}
      <Vol kind="tube"><ellipse cx={0} cy={110} rx={42} ry={130} fill="#5a3d7a" {...kst(7)} /></Vol>
      {[60, 120, 180].map((yy) => <path key={yy} d={`M -36,${yy} Q 0,${yy + 14} 36,${yy}`} fill="none" stroke="#7b5aa6" strokeWidth={8} strokeLinecap="round" />)}
      {/* curly tongue (proboscis) */}
      {tongue > 0 && (
        <path d={`M 0,-40 q ${tongueLen * 0.35},${30} ${tongueLen * 0.7},${60 + 60 * tongue} q ${-30 + 30 * tongue},${30} ${-10 + 40 * tongue},${50}`}
          fill="none" stroke="#ff6fa5" strokeWidth={12} strokeLinecap="round" transform="translate(0,90)" />
      )}
      {/* head */}
      <g transform="translate(0,-90)">
        <path d="M -50,-120 Q -90,-230 -150,-250" fill="none" {...kst(9)} />
        <path d="M 50,-120 Q 90,-230 150,-250" fill="none" {...kst(9)} />
        <circle cx={-150} cy={-250} r={20} fill={WING.dot} {...kst(6)} />
        <circle cx={150} cy={-250} r={20} fill={WING.dot} {...kst(6)} />
        <Vol><circle cx={0} cy={0} r={150} fill="#7b5aa6" {...kst(9)} /></Vol>
        <Face expr={expr} look={look} mouth={mouth} skin="#7b5aa6" iris="#3a0ca3" eyeR={44} eyeDX={62} eyeY={-10} mouthY={70} mouthW={56} lashes
          blink={Math.sin(t * 1.3 + 0.7) > 0.985} brows={false} />
      </g>
      {wet && [-1, 1].map((d) => <ellipse key={d} cx={d * 170} cy={-40} rx={10} ry={16} fill="#a0c4ff" opacity={0.9} />)}
    </g>
  );
};
const Caterpillar: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {[0, 1, 2, 3].map((i) => (
      <Vol key={i}><circle cx={-90 + i * 42} cy={-30 - Math.abs(Math.sin(t * 6 + i)) * 10} r={30} fill={i % 2 ? '#8ac926' : '#52b788'} {...kst(5)} /></Vol>
    ))}
    <Vol><circle cx={80} cy={-46} r={38} fill="#8ac926" {...kst(5)} /></Vol>
    <circle cx={70} cy={-56} r={6} fill={KINK} /><circle cx={94} cy={-56} r={6} fill={KINK} />
    <path d="M 68,-34 Q 82,-24 96,-34" fill="none" {...kst(4)} />
  </g>
);
const Chrysalis: React.FC<{ s?: number; crack?: number }> = ({ s = 1, crack = 0 }) => (
  <g transform={`scale(${s})`}>
    <path d="M 0,-110 L 0,-80" {...kst(6)} />
    <Vol><path d="M 0,-80 Q 60,-40 46,40 Q 30,110 0,120 Q -30,110 -46,40 Q -60,-40 0,-80 Z" fill="#74c69d" {...kst(7)} /></Vol>
    <path d="M -30,0 Q 0,14 30,0 M -34,40 Q 0,54 34,40" fill="none" stroke="#40916c" strokeWidth={6} strokeLinecap="round" />
    {crack > 0 && <path d={`M -20,-40 l 14,22 l -12,18 l 16,20`} fill="none" stroke={KINK} strokeWidth={6} strokeLinecap="round" opacity={crack} />}
  </g>
);
const Egg: React.FC = () => <Vol><ellipse cx={0} cy={-30} rx={30} ry={38} fill="#fff3d6" {...kst(5)} /></Vol>;
const MiniFly: React.FC<{ c: string; t: number; seed: number; s?: number }> = ({ c, t, seed, s = 1 }) => {
  const fl = 0.3 + 0.7 * Math.abs(Math.sin(t * 12 + seed));
  return (
    <g transform={`scale(${s})`}>
      <g transform={`scale(${fl},1)`}>
        <Vol>
          <path d="M 0,-6 Q -70,-90 -62,-14 Q -66,10 0,4 Z" fill={c} {...kst(5)} />
          <path d="M 0,-6 Q 70,-90 62,-14 Q 66,10 0,4 Z" fill={c} {...kst(5)} />
          <path d="M 0,4 Q -48,52 -30,20 Z" fill={c} {...kst(5)} />
          <path d="M 0,4 Q 48,52 30,20 Z" fill={c} {...kst(5)} />
        </Vol>
      </g>
      <ellipse cx={0} cy={0} rx={7} ry={26} fill={KINK} />
      <circle cx={0} cy={-28} r={10} fill={KINK} />
    </g>
  );
};
const Flower: React.FC<{ x: number; y: number; c: string; t: number; i: number; s?: number }> = ({ x, y, c, t, i, s = 1 }) => (
  <g>
    <path d={`M ${x},${y + 20} Q ${x + Math.sin(t + i) * 6},${(y + f) / 2} ${x},${f + 10}`} fill="none" stroke="#3a8d3a" strokeWidth={12 * s} strokeLinecap="round" />
    <path d={`M ${x},${(y + f) / 2 + 30} q -50,-30 -60,-60 q 40,0 60,50 Z`} fill="#52b788" {...kst(4)} />
    <g transform={`translate(${x},${y}) scale(${s}) rotate(${Math.sin(t * 1.2 + i) * 4})`}>
      <Vol>
        {[0, 60, 120, 180, 240, 300].map((a) => <ellipse key={a} cx={Math.cos((a * Math.PI) / 180) * 40} cy={Math.sin((a * Math.PI) / 180) * 26} rx={30} ry={22} fill={c} {...kst(4)} />)}
        <ellipse cx={0} cy={0} rx={26} ry={18} fill="#ffd166" {...kst(4)} />
      </Vol>
    </g>
  </g>
);
const Branch: React.FC<{ t: number; wig: number; crack: number; gone: boolean }> = ({ t, wig, crack, gone }) => (
  <g>
    <path d={`M ${W + 40},${BRANCH_Y - 80} Q ${BRANCH_X + 300},${BRANCH_Y - 40} ${BRANCH_X - 120},${BRANCH_Y + 10}`} fill="none" stroke="#8d5a3b" strokeWidth={34} strokeLinecap="round" />
    <path d={`M ${W + 40},${BRANCH_Y - 80} Q ${BRANCH_X + 300},${BRANCH_Y - 40} ${BRANCH_X - 120},${BRANCH_Y + 10}`} fill="none" {...kst(6)} opacity={0.5} />
    {[[BRANCH_X + 220, -30, 30], [BRANCH_X - 60, 10, -30], [BRANCH_X + 480, -60, 20]].map(([x, dy, r], i) => (
      <Vol key={i}><ellipse cx={x} cy={BRANCH_Y + dy - 30} rx={60} ry={30} fill="#52b788" transform={`rotate(${r} ${x} ${BRANCH_Y + dy - 30})`} {...kst(5)} /></Vol>
    ))}
    {!gone && (
      <g transform={`translate(${BRANCH_X},${BRANCH_Y + 110}) rotate(${Math.sin(t * 18) * 8 * wig})`}>
        <Chrysalis s={0.9} crack={crack} />
      </g>
    )}
    {gone && (
      <g transform={`translate(${BRANCH_X},${BRANCH_Y + 110}) scale(0.9)`}>
        <path d="M 0,-110 L 0,-80" {...kst(6)} />
        <path d="M -40,-60 Q 0,-90 40,-60 Q 30,0 0,10 Q -30,0 -40,-60 Z" fill="#b7e4c7" {...kst(6)} />
      </g>
    )}
  </g>
);
const BigLeaf: React.FC = () => (
  <g>
    <path d="M 0,0 L 0,330" stroke="#3a8d3a" strokeWidth={14} strokeLinecap="round" />
    <Vol><path d="M -330,10 Q 0,-170 330,10 Q 0,-40 -330,10 Z" fill="#52b788" {...kst(7)} /></Vol>
    <path d="M -300,8 Q 0,-110 300,8" fill="none" stroke="#2d6a4f" strokeWidth={6} />
  </g>
);
const Cloud: React.FC<{ x: number; y: number; s: number; c: string }> = ({ x, y, s, c }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <Vol>
      <path d="M -160,40 Q -200,-30 -110,-40 Q -90,-120 0,-90 Q 80,-140 120,-50 Q 210,-40 170,40 Z" fill={c} {...kst(6)} />
    </Vol>
  </g>
);
const Pond: React.FC = () => (
  <g>
    <ellipse cx={1480} cy={f + 70} rx={380} ry={70} fill="#4cc9f0" {...kst(6)} />
    <ellipse cx={1420} cy={f + 60} rx={220} ry={30} fill="#a0e7ff" opacity={0.7} />
    {[1250, 1700].map((x) => <path key={x} d={`M ${x},${f + 40} q 10,-120 30,-150 M ${x + 20},${f + 40} q 0,-90 -20,-120`} fill="none" stroke="#3a8d3a" strokeWidth={10} strokeLinecap="round" />)}
  </g>
);
const Hill: React.FC = () => (
  <path d={`M -100,${f + 140} Q 500,${f - 160} 1100,${f - 40} Q 1600,${f + 40} ${W + 100},${f + 140} Z`} fill="#95d5b2" opacity={0.55} />
);
const Rainbow: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {RAINBOW_C.map((c, i) => {
      const at = word('rainbow', 2 + i);
      const p = prog(t, at - 0.1, at + 0.5);
      if (p <= 0) return null;
      const r = 760 - i * 38;
      const len = Math.PI * r;
      return (
        <path key={c} d={`M ${960 - r},${f + 60} A ${r},${r} 0 0 1 ${960 + r},${f + 60}`} fill="none" stroke={c} strokeWidth={40}
          strokeDasharray={len} strokeDashoffset={len * (1 - EASE_OUT(p))} opacity={0.85} />
      );
    })}
  </g>
);

const STAGES = [
  { word: 0, label: 'EGG', node: () => <Egg /> },
  { word: 1, label: 'CATERPILLAR', node: (t: number) => <g transform="scale(0.8)"><Caterpillar t={t} /></g> },
  { word: 2, label: 'CHRYSALIS', node: () => <g transform="translate(0,-60) scale(0.55)"><Chrysalis /></g> },
  { word: 3, label: 'BUTTERFLY', node: (t: number) => <g transform="translate(0,-30)"><MiniFly c={WING.a} t={t} seed={1} s={1.1} /></g> },
];
const GARDEN_FLOWERS: [number, number, string, number][] = [
  [180, f - 230, '#ff595e', 1], [420, f - 300, '#c77dff', 1.1], [690, f - 210, '#ffca3a', 0.9], [1520, f - 280, '#ff6fa5', 1.1],
  [1760, f - 220, '#4cc9f0', 1], [1100, f - 160, '#ff924c', 0.8], [60, f - 180, '#8ac926', 0.9], [1880, f - 300, '#ffca3a', 1],
];
const COUNT_FLOWERS: [number, string][] = [[1180, '#ff595e'], [1390, '#ffca3a'], [1600, '#c77dff']];

export default function KidsAnimals067() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const shake = shakeOf(t, HITS);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const scene = sceneAt(t);
  const chantHop = within(t, S('c1'), E('c_turn') + 0.4);
  const raining = within(t, RAIN0, SUN + 1.0);
  const dim = scene === 'pond' ? 0.35 * prog(t, S('clouds') - 0.4, S('clouds') + 0.8) * (1 - prog(t, SUN, SUN + 1.4)) : 0;

  // ── Bella
  const [bx0, by0] = lerp2(t, BELLA_PATH);
  const windJit = within(t, BLOWN, CALM) ? Math.sin(t * 19) * 14 : 0;
  const bx = bx0 + windJit;
  const by = by0 + (moving(t, BELLA_PATH) || t < REVEAL ? 0 : Math.sin(t * 2.4) * 14);
  const bDir = heading(t, BELLA_PATH);
  const open = t < OPEN0 ? 0 : prog(t, OPEN0, OPEN1);
  const onFlower = within(t, S('fact2') + 1.6, E('fact3_turn') + 0.2) || within(t, BLOWN + 1.2, GO1);
  const resting = within(t, NOSE + 0.4, ACHOO);
  const flap = !open ? 1 : onFlower || resting || within(t, LEAF + 1.2, SUN + 1.0) ? 0.8 + 0.2 * Math.abs(Math.sin(t * 2)) : 0.35 + 0.65 * Math.abs(Math.sin(t * 9));
  const tongue = within(t, word('fact3b', 1), E('fact3_turn')) ? prog(t, word('fact3b', 1), word('fact3b', 2) + 0.2) : 0;
  const bellaExpr: KExpr =
    t < OPEN0 ? 'sleepy'
    : within(t, OPEN1 - 0.3, OPEN1 + 1.4) ? 'wow'
    : within(t, BLOWN, CALM) ? 'oops'
    : within(t, S('bella_wet'), UNDER) ? 'sad'
    : within(t, S('tired'), NOSE + 0.4) ? 'sleepy'
    : within(t, ACHOO - 0.4, ACHOO + 0.8) ? 'surprised'
    : within(t, S('sound_a'), S('sound_b')) ? 'wink'
    : within(t, word('fact2b', 9), E('fact2b') + 0.3) || within(t, GARDEN, E('bella_happy') + 0.5) || chantHop ? 'laugh'
    : within(t, S('q_rain'), S('leo_guess')) ? 'think'
    : talks('bella') ? 'happy' : 'smile';
  const bellaTilt = within(t, BLOWN, CALM) ? 24 + Math.sin(t * 13) * 8 : within(t, ACHOO, ACHOO + 0.8) ? -30 + 360 * prog(t, ACHOO, ACHOO + 0.8) : bDir * 8;
  const bellaMouth = Math.max(lipSync(VO, 'bella', t), tongue > 0 ? 0.3 : 0);

  // ── Bobo + kids (they join on 'mila_in')
  const kidsIn = t >= S('mila_in') - 1.2;
  const kidsEnter = (home: number) => (t < S('mila_in') + 0.4 ? -300 + (home + 300) * EASE_OUT(prog(t, S('mila_in') - 1.2, S('mila_in') + 0.4)) : groupX(t, home));
  const ix = kidsEnter(MILA_X);
  const ex = kidsEnter(LEO_X);
  const ox = groupX(t, BOBO_X);
  const walking = groupMoving(t) || within(t, S('mila_in') - 1.2, S('mila_in') + 0.4);
  const holdsLeaf = within(t, LEAF, SUN + 1.2);
  const boboExpr: KExpr =
    within(t, S('tickle'), ACHOO) ? 'laugh'
    : within(t, ACHOO, ACHOO + 1.0) ? 'surprised'
    : within(t, LEAF, LEAF + 1.4) ? 'proud'
    : within(t, BLOWN, CALM) || within(t, RAIN0, LEAF) ? 'oops'
    : within(t, OPEN1, OPEN1 + 1.6) ? 'wow'
    : chantHop || within(t, GARDEN, E('bella_happy')) ? 'laugh'
    : talks('bobo') ? 'happy' : 'smile';
  const boboArms: CArm = holdsLeaf ? 'up' : within(t, S('sound_turn'), E('sound_turn') + 2) ? 'wave' : talks('bobo') ? 'wave' : chantHop ? 'up' : t >= S('bye') ? 'wave' : 'down';
  const flutterTurn = within(t, S('sound_turn'), E('sound_turn') + 2.5) || chantHop;
  const kidFlap: KArm = { a: 60 + Math.sin(t * 9) * 35, b: 10 };
  const leoExpr: KExpr =
    within(t, S('leo_guess'), E('leo_guess')) ? 'proud'
    : within(t, S('mila_no'), E('leo_laugh') + 0.6) || within(t, S('a4'), E('a4') + 0.4) ? 'oops'
    : within(t, RAIN0, UNDER) || within(t, BLOWN, CALM) ? 'surprised'
    : chantHop || within(t, GARDEN, E('bella_happy')) || within(t, RAINBOW0, E('rainbow')) ? 'laugh'
    : talks('leo') ? 'happy' : 'smile';
  const leoArm: KArm = within(t, S('leo_guess'), E('leo_guess')) ? 'up' : flutterTurn ? kidFlap : t >= S('bye') ? 'wave' : talks('leo') ? 'present' : within(t, RAINBOW0, E('rainbow')) ? 'point' : 'down';
  const milaExpr: KExpr =
    within(t, BLOWN, CALM) ? 'surprised'
    : within(t, S('bella_wet'), UNDER) ? 'sad'
    : chantHop || within(t, GARDEN, E('bella_happy')) || within(t, RAINBOW0, E('rainbow')) ? 'laugh'
    : talks('mila') ? 'happy' : 'smile';
  const milaArm: KArm = within(t, S('mila_no'), E('mila_no')) || within(t, S('mila_hold'), E('mila_hold')) ? 'point' : flutterTurn ? kidFlap : t >= S('bye') ? 'wave' : talks('mila') ? 'wave' : within(t, S('count'), E('count') + 1) ? 'count' : 'down';

  const showFlowerHome = scene === 'meadow' || scene === 'wind';
  const gardenP = (i: number) => popIn(t, GARDEN + 0.1 + i * 0.12, 0.4);

  return (
    <>
      <ActionStage cam={cam} shake={shake} blur={cam.blur}>
        <Backdrop place="meadow" w={W} h={H} t={t} fx={scene === 'pond' ? (raining ? ['rain'] : []) : scene === 'hill' && t >= GARDEN ? ['butterflies'] : ['birds']}
          dim={dim} variant={scene === 'hill' ? 1 : 0} />
        {scene === 'pond' && (
          <g>
            <Pond />
            {dim > 0.02 && [[500, 160, 1.2], [1100, 120, 1.4], [1650, 180, 1.1]].map(([x, y, s], i) => (
              <g key={i} opacity={Math.min(1, dim * 3)}><Cloud x={x + Math.sin(t * 0.5 + i) * 20} y={y} s={s} c="#adb5bd" /></g>
            ))}
            {t >= RAINBOW0 - 0.2 && <Rainbow t={t} />}
          </g>
        )}
        {scene === 'hill' && <Hill />}
        {scene === 'meadow' && <Branch t={t} wig={within(t, WIGGLE, CRACK) ? 1 : 0} crack={prog(t, CRACK - 0.2, CRACK + 0.3)} gone={t >= REVEAL} />}
        {/* sun rays drying Bella's wings */}
        {within(t, S('dry') + 0.6, OPEN1 + 0.6) && (
          <g transform={`translate(${BRANCH_X - 520},140) rotate(${t * 12})`} opacity={0.9}>
            {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-8} y={-170} width={16} height={60} rx={8} fill="#ffd166" transform={`rotate(${i * 36})`} />)}
            <circle r={90} fill="#ffd166" {...kst(6)} />
          </g>
        )}
        {/* the flower (fact 2 / the wind) */}
        {showFlowerHome && <Flower x={FLOWER_X} y={f - 330} c="#ff6fa5" t={t} i={2} s={1.4} />}
        {/* the Rainbow Garden */}
        {scene === 'hill' && t >= GARDEN && GARDEN_FLOWERS.map(([x, y, c, s], i) => (
          <g key={i} transform={`translate(${x},${f}) scale(${gardenP(i)}) translate(${-x},${-f})`}><Flower x={x} y={y} c={c} t={t} i={i} s={s} /></g>
        ))}
        {scene === 'hill' && COUNT_FLOWERS.map(([x, c], i) => {
          const at = word('count', i * 2);
          if (t < at - 0.05) return null;
          return <g key={i} transform={`translate(${x},${f}) scale(${popIn(t, at)}) translate(${-x},${-f})`}><Flower x={x} y={f - 380} c={c} t={t} i={i + 3} s={1.5} /></g>;
        })}
        {/* the life-cycle strip (fact 1) */}
        {within(t, S('fact1b') - 0.3, S('fact2') - 0.1) && STAGES.map((st, i) => {
          const at = i === 0 ? word('fact1b', 4) : i === 1 ? word('fact1b', 13) : i === 2 ? word('fact1c', 5) : word('fact1d', 3);
          if (t < at) return null;
          const x = 360 + i * 400;
          const hl = within(t, word('fact1d', i), word('fact1d', i) + 0.6);
          return (
            <g key={i} transform={`translate(${x},${330}) scale(${popIn(t, at) * (hl ? 1.15 : 1)})`}>
              <rect x={-150} y={-150} width={300} height={260} rx={36} fill="#ffffff" opacity={0.92} {...kst(7)} />
              <g transform="translate(0,20)">{st.node(t)}</g>
              <text y={90} textAnchor="middle" fontSize={34} fontWeight={900} fill={KINK}>{st.label}</text>
              {i < 3 && <path d="M 170,-20 l 50,0 m -18,-18 l 18,18 l -18,18" fill="none" {...kst(8)} />}
            </g>
          );
        })}
        {/* butterfly friends in the garden */}
        {scene === 'hill' && t >= FRIENDS && ['#ff595e', '#ffca3a', '#4cc9f0', '#8ac926', '#ff924c'].map((c, i) => {
          const p = prog(t, FRIENDS + i * 0.3, FRIENDS + i * 0.3 + 2.0);
          const x = -100 + (500 + i * 280 - -100) * EASE_OUT(p) + Math.sin(t * 1.4 + i) * 40;
          const y = 240 + (i % 2) * 120 + Math.sin(t * 2 + i * 2) * 30;
          return <g key={c} transform={`translate(${x},${y})`}><MiniFly c={c} t={t} seed={i} s={1.1} /></g>;
        })}
        {/* Mila & Leo */}
        {kidsIn && (
          <>
            <Kid spec={MILA_HERO} x={ix} y={f} scale={KS} expr={milaExpr} look={[0.6, -0.2]} mouth={lipSync(VO, 'mila', t)}
              armL={milaArm === 'point' ? 'down' : milaArm} armR={milaArm} legs={walking ? 'walk' : 'stand'} walk={t * 2}
              hop={bounce(chantHop, t, 1, 22)} />
            <Kid spec={LEO_HERO} x={ex} y={f} scale={KS} expr={leoExpr} look={[0.6, -0.2]} mouth={lipSync(VO, 'leo', t)}
              armL={leoArm} armR={leoArm} legs={walking ? 'walk' : 'stand'} walk={t * 2}
              hop={bounce(chantHop || within(t, S('leo_guess'), E('leo_guess')), t, 3, 22)} />
          </>
        )}
        {/* Bobo (+ the leaf umbrella) */}
        <Critter spec={BOBO_HERO} x={ox} y={f} scale={BS} expr={boboExpr} look={resting ? [0.3, -1] : [0.6, -0.2]} mouth={lipSync(VO, 'bobo', t)}
          armL={boboArms} armR={boboArms} walking={walking} walk={t * 2.2}
          hop={bounce(chantHop, t, 2, 22) + arc(t, ACHOO, ACHOO + 0.5, 40)} tilt={within(t, ACHOO, ACHOO + 0.5) ? -10 : 0} />
        {holdsLeaf && (
          <g transform={`translate(${ox},${f - 560 + (1 - popIn(t, LEAF)) * 200}) scale(${popIn(t, LEAF)})`}><BigLeaf /></g>
        )}
        {/* Bella */}
        {t >= REVEAL - 0.01 && (
          <Bella x={bx} y={by - arc(t, REVEAL, REVEAL + 0.6, 60)} s={BELLA_S * (scene === 'meadow' && t < OPEN1 + 1.4 ? 0.8 + 0.2 * open : 1)} t={t}
            expr={bellaExpr} mouth={bellaMouth} look={bDir ? [bDir * 0.8, 0] : resting ? [0, 0.8] : [-0.5, 0.2]} open={open} flap={flap}
            tilt={bellaTilt} tongue={tongue} wet={within(t, RAIN0, UNDER + 1.0)} facing={bDir < 0 ? -1 : 1} />
        )}
        {/* wind lines */}
        <MotionLines t={t} from={S('wind')} to={CALM} x={900} y={430} dir={0} n={6} len={260} spread={420} />
        {/* FX + words */}
        <ImpactStar t={t} at={CRACK} x={BRANCH_X + 140} y={BRANCH_Y + 60} s={0.8} />
        <Dust t={t} at={ACHOO} x={nosePt[0] + 60} y={nosePt[1] - 40} s={1.2} />
        <StageWord t={t} at={word('g2', 2)} until={E('g2') + 0.4} text="WIGGLE, WIGGLE!" x={BRANCH_X - 380} y={BRANCH_Y + 120} size={70} color="#52b788" rot={-6} />
        <StageWord t={t} at={CRACK} until={CRACK + 1.3} text="CRACK!" x={BRANCH_X - 300} y={BRANCH_Y + 140} size={100} color="#ffca3a" rot={6} />
        <StageWord t={t} at={OPEN1} until={OPEN1 + 1.6} text="WOW!" x={BRANCH_X - 380} y={BRANCH_Y + 120} size={110} color="#c77dff" rot={-6} />
        <StageWord t={t} at={S('sound_a')} until={S('sound_b')} text="SHHH…" x={BELLA_HOME[0] - 330} y={BELLA_HOME[1] - 120} size={90} color="#a0c4ff" rot={-5} />
        <StageWord t={t} at={word('sound_b', 8)} until={E('sound_b') + 0.4} text="FLUTTER, FLUTTER!" x={BELLA_HOME[0]} y={BELLA_HOME[1] - 280} size={80} color="#c77dff" rot={5} />
        <StageWord t={t} at={word('fact1b', 14)} until={E('fact1b') + 0.4} text="MUNCH! MUNCH!" x={760} y={600} size={80} color="#8ac926" rot={-5} />
        <StageWord t={t} at={word('fact2b', 9)} until={E('fact2b') + 0.6} text="MMM! SWEET!" x={FLOWER_X - 330} y={f - 600} size={80} color="#ff6fa5" rot={-6} />
        <StageWord t={t} at={word('fact3b', 4)} until={E('fact3_turn') + 0.3} text="SIP, SIP, SIP!" x={FLOWER_X - 380} y={f - 600} size={80} color="#ff6fa5" rot={5} />
        <StageWord t={t} at={word('wind', 7)} until={CALM} text="WHOOOSH!" x={760} y={300} size={110} color="#a0c4ff" rot={-6} />
        <StageWord t={t} at={S('hold')} until={CALM} text="HOLD ON…" x={FLOWER_X - 360} y={f - 640} size={80} color="#ffca3a" rot={5} />
        <StageWord t={t} at={word('calm', 3)} until={E('calm') + 0.8} text="PHEW!" x={1000} y={360} size={100} color="#52b788" rot={-5} />
        <StageWord t={t} at={RAIN0} until={E('clouds') + 0.8} text="PITTER, PATTER!" x={960} y={360} size={90} color="#a0c4ff" rot={5} />
        <StageWord t={t} at={ACHOO} until={ACHOO + 1.3} text="ACHOO!" x={nosePt[0] + 220} y={nosePt[1] - 260} size={110} color="#ffca3a" rot={6} />
        <StageWord t={t} at={S('oops')} until={word('oops', 3)} text="WHEEE!" x={1300} y={200} size={90} color="#c77dff" rot={-6} />
        <Reaction kind="?" t={t} at={E('g3') + 0.1} until={CRACK} x={BRANCH_X + 220} y={BRANCH_Y + 40} s={0.7} />
        <Reaction kind="!" t={t} at={REVEAL + 0.2} until={REVEAL + 1.4} x={BOBO_X} y={f - 480} s={0.7} />
        <Reaction kind="heart" t={t} at={S('bobo_hi')} until={E('bobo_hi') + 0.4} x={BOBO_X + 30} y={f - 480} s={0.6} />
        <Reaction kind="sweat" t={t} at={BLOWN} until={CALM} x={bx + 120} y={by - 200} s={0.6} />
        <Reaction kind="cloud" t={t} at={S('bella_wet')} until={LEAF} x={bx + 60} y={by - 260} s={0.6} />
        <Reaction kind="idea" t={t} at={S('leo_guess')} until={E('leo_guess')} x={ex} y={f - 560} s={0.7} />
        <Reaction kind="stars" t={t} at={S('leo_laugh')} until={E('leo_laugh') + 0.8} x={ex} y={f - 560} s={0.7} />
        <Reaction kind="idea" t={t} at={S('bobo_leaf')} until={LEAF + 0.6} x={ox + 40} y={f - 500} s={0.7} />
        <Reaction kind="heart" t={t} at={S('bella_dry')} until={E('bella_dry') + 0.5} x={bx + 80} y={by - 240} s={0.6} />
        <Reaction kind="heart" t={t} at={GARDEN + 0.3} until={E('garden') + 0.8} x={bx + 80} y={by - 260} s={0.7} />
      </ActionStage>

      {/* screen-space */}
      <ThinkTimer t={t} from={onBeat(E('g3') + 0.1)} to={CRACK} x={1760} y={190} r={90} label="WHO?" />
      <PopText t={t} at={REVEAL + 0.3} until={S('dry') - 0.1} text="BELLA THE BUTTERFLY!" y={170} size={110} color="#c77dff" />
      <PopText t={t} at={E('sound_turn') - 0.6} until={S('facts') - 0.1} text="YOUR TURN!" y={170} size={120} color="#ffffff" />
      <PopText t={t} at={S('facts') + 0.2} until={S('fact1') - 0.1} text="3 BUTTERFLY FACTS!" y={170} size={110} color="#c77dff" />
      <PopText t={t} at={S('fact1')} until={S('fact1b') - 0.2} text="1  FROM A CATERPILLAR" y={170} size={96} color="#8ac926" />
      <PopText t={t} at={S('fact2')} until={S('fact3') - 0.2} text="2  THEY TASTE WITH THEIR FEET" y={170} size={84} color="#ff6fa5" />
      <PopText t={t} at={S('fact3')} until={S('fact3_turn') - 0.1} text="3  A TONGUE LIKE A STRAW" y={170} size={90} color="#ff924c" />
      <PopText t={t} at={S('fact3_turn')} until={S('story') - 0.2} text="YOUR TURN! SIP, SIP!" y={170} size={100} color="#ffffff" />
      <PopText t={t} at={word('want', 6)} until={S('far') - 0.1} text="THE RAINBOW GARDEN!" y={170} size={110} color="#ffca3a" />
      <PopText t={t} at={S('go')} until={SCENE_WIND} text="OFF WE GO!" y={170} size={120} color="#52b788" />
      <PopText t={t} at={word('bella_ok', 2)} until={GO1} text="HOLD ON AND WAIT" y={170} size={100} color="#ffca3a" />
      <ThinkTimer t={t} from={onBeat(E('q_rain') + 0.1)} to={S('leo_guess') - 0.1} x={1760} y={190} r={90} label="THINK!" />
      <PopText t={t} at={S('leo_guess') + 0.8} until={S('mila_no')} text="BETWEEN THE RAINDROPS?" y={170} size={90} color="#4cc9f0" />
      <AnswerMark t={t} at={S('mila_no') + 0.2} until={E('leo_laugh') + 0.8} ok={false} x={1760} y={190} />
      <PopText t={t} at={LEAF} until={E('bella_dry') + 0.2} text="A LEAF UMBRELLA!" y={170} size={110} color="#52b788" />
      <PopText t={t} at={RAINBOW0 + 0.2} until={E('rainbow') + 0.6} text="A RAINBOW!" y={170} size={130} color="#ffca3a" />
      <PopText t={t} at={word('tired', 9)} until={S('nose') - 0.1} text="REST…" y={170} size={120} color="#a0c4ff" />
      <PopText t={t} at={S('keep')} until={S('arrive') - 0.1} text="LITTLE BY LITTLE!" y={170} size={110} color="#c77dff" />
      <PopText t={t} at={GARDEN + 0.2} until={S('count_q') - 0.1} text="I MADE IT!" y={170} size={130} color="#ffca3a" />
      {COUNT_FLOWERS.map(([, c], i) => {
        const at = word('count', i * 2);
        return <PopText key={i} t={t} at={at} until={i < 2 ? word('count', i * 2 + 2) - 0.05 : E('count') + 1.4} text={`${i + 1}  ${['RED', 'YELLOW', 'PURPLE'][i]}!`} y={170} size={120} color={c} />;
      })}
      <PopText t={t} at={S('lesson')} until={S('your_q') - 0.1} text="REST · AND KEEP GOING!" y={170} size={96} color="#c77dff" />
      <PopText t={t} at={S('again') + 0.2} until={S('q1') - 0.1} text="LET'S REMEMBER!" y={170} size={110} color="#ffca3a" />
      {(['q1', 'q2', 'q3', 'q4', 'q5'] as const).map((q) => {
        const a = ({ q1: 'a1', q2: 'a2', q3: 'a3', q4: 'a4', q5: 'a5' } as const)[q];
        return <ThinkTimer key={q} t={t} from={onBeat(E(q) + 0.1)} to={S(a) - 0.1} x={1760} y={190} r={90} label="THINK!" />;
      })}
      <PopText t={t} at={S('a1')} until={S('q2') - 0.2} text="A CATERPILLAR!" y={170} size={120} color="#8ac926" />
      <PopText t={t} at={S('a2')} until={S('q3') - 0.2} text="THEIR FEET!" y={170} size={130} color="#ff6fa5" />
      <PopText t={t} at={S('a3')} until={S('q4') - 0.2} text="HOLD ON AND WAIT!" y={170} size={110} color="#ffca3a" />
      <PopText t={t} at={S('a4')} until={S('q5') - 0.2} text="NO! A LEAF UMBRELLA!" y={170} size={100} color="#52b788" />
      <PopText t={t} at={S('a5')} until={S('chant') - 0.2} text="ON BOBO'S NOSE!" y={170} size={120} color="#ff924c" />
      <PopText t={t} at={S('c1')} until={S('c2') - 0.1} text="FLUTTER!" y={170} size={130} color="#c77dff" />
      <PopText t={t} at={S('c2')} until={S('c3') - 0.1} text="REST!" y={170} size={130} color="#a0c4ff" />
      <PopText t={t} at={S('c3')} until={S('c_turn') - 0.1} text="KEEP GOING!" y={170} size={120} color="#52b788" />
      <PopText t={t} at={E('c_turn') - 0.2} until={S('bye') - 0.1} text="YOUR TURN!" y={170} size={120} color="#ffffff" />
      <PopText t={t} at={S('bye')} until={END_IRIS} text="SEE YOU NEXT TIME!" y={170} size={100} color="#c77dff" />
      <Confetti t={t} at={OPEN1} y={420} />
      <Confetti t={t} at={GARDEN + 0.2} y={420} />
      <Confetti t={t} at={S('c3')} y={420} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <SparksIntro t={t} at={0} cast={{ kids: [MILA_HERO, LEO_HERO], buddy: BOBO_HERO }} />
      <StarWipe t={t} at={END_IRIS} dur={0.5} hold={5} color="#c77dff" x={W / 2} y={H * 0.45} />
    </>
  );
}
