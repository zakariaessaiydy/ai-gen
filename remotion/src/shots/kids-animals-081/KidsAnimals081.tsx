// TINY SPARKS · Day 81 · 🦁 Animal Stories #12 — "The Rabbit and the Wise Owl" (LONG 16:9, 5:59)
// kids-shorts/tiny-sparks/animals/day-081-the-rabbit-and-the-wise-owl. Cues from VO via K (keys.gen.ts).
// ENERGY LAYER standard: ident → GUESS WHO (two long ears + a fluffy tail in the wiggling tall grass, think timer) →
// Rosie the rabbit hops out → MEET Super Bobo → SOUND "sniff, sniff" (wiggle your nose — your turn) → 3 TRUE FACTS
// (teeth never stop growing — munch grass · eyes on the sides = sees almost all around (a vision bubble) · wild rabbits
// live in burrows with tunnels (a cut-away bubble)) → STORY (value: friendship): a race — Rosie zooms off, "too slow!",
// twice → the friends walk away → Rosie alone → the wise owl Willow in the big tree (asleep: owls sleep in the daytime,
// big eyes see in the dark) → "what do your friends see?" "my tail!" → "a good friend waits, and helps" → think timer:
// hop faster or wait? → Leo pops out of the bush: "FASTER!" ✗ → wait ✓ → sorry · forgive → the together race: hop, hop
// (your turn) → Bobo trips on the log → Rosie comes back and helps → all cross the line together → night: Rosie to her
// burrow, "good morning" says the owl → LET'S REMEMBER (5 questions) → chant → bye + star iris.
import React from 'react';
import { Critter, critterFaceAt, type CArm, type CritterSpec } from '../../lib/kids/critter';
import { Kid, kidFaceAt, type KArm } from '../../lib/kids/kid';
import { BOBO_HERO, CAPTION_COLORS, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR } from '../../lib/kids/sets';
import { Backdrop } from '../../lib/kids/places';
import { AnswerMark, Confetti, KidsCaptions, PopText, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { KINK, kst, Twinkle, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import {
  ActionStage, Dust, ImpactStar, MotionLines, Reaction, SparksIntro, StageWord, StarWipe, StrainLines, directorCam, onBeat, shakeOf,
  type Hit, type Shot,
} from '../../lib/kids/energy';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsAnimals081', durationInSeconds: 359.6, fps: 30, width: 1920, height: 1080 };

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
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff', rosie: '#ffafcc', willow: '#cdb4db' };
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
const ROSIE: CritterSpec = { id: 'rosie', species: 'bunny', fur: '#e8cfb4', fur2: '#fff4ea', dark: '#9c7356', bow: '#ff6fa5', iris: '#7b4f2c' };
const WILLOW: CritterSpec = { id: 'willow', species: 'owl', fur: '#a98467', fur2: '#f1e3d3', dark: '#6c4f3d', scarf: '#b197fc', iris: '#ffb703' };
const RS = 0.58;
const BS = 0.6;
const KS = 0.54;
const OS = 0.5;
const GRASS_X = 800;
const ROSIE_X = 880;
const BOBO_X = 520;
const BURROW_X = 220;
const BUSH_X = 1060;
const LOG_X = 770;
const FINISH_X = 1150;
const TREE_X = 1730;
const OWL_X = 1540;
const BRANCH_Y = 470;
const UNDER_OWL = 1330;
// race lines-up (Mila, Leo, Bobo, Rosie)
const LINE = [150, 340, 570, 790];
const SHIFT = 200; // the together hop before the trip
const END_LINE = [1250, 1420, 1810, 1600]; // after the finish (Mila, Leo, Bobo, Rosie)
const MEM = [300, 540, 1140, 860]; // LET'S REMEMBER line-up

// ── timeline anchors
const EARS = word('g2', 4); // "long,"
const TAIL_AT = word('g2', 8); // "fluffy"
const REVEAL = S('reveal') - 0.1;
const SNIFF = [S('sound_a'), E('sound_a')] as const;
const MUNCH = [S('fact1c'), E('fact1c') + 0.4] as const;
const GO = E('ready') - 0.15;
const GO2 = word('again1', 6) + 0.1; // "Go!"
const OFF = E('leo_sad') + 0.2;
const OWL_WAKE = word('owl_wake', 2) - 0.1; // "Oh!"
const PEEK = S('leo_guess') - 0.5;
const PEEK_END = E('owl_no') + 0.5;
const BACK = S('back');
const TOG0 = S('together');
const TOG1 = S('trip') - 0.1;
const TRIP = word('trip', 1); // "Oof!"
const HELP = S('rosie_help');
const UP = S('bobo_up');
const FIN0 = S('finish');
const FIN1 = FIN0 + 3.6;
const RIBBON = FIN0 + 1.6; // the first one under the arch
const NIGHT0 = S('night');
const INTO_BURROW = E('rosie_night') + 0.3;
const MEMO = S('again') - 0.05;
const END_IRIS = E('bye2') + 0.6;

const ROSIE_PATH: KF = [
  [0, GRASS_X, f], [REVEAL, GRASS_X, f], [REVEAL + 0.8, ROSIE_X, f],
  [S('fact3'), ROSIE_X, f], [S('fact3') + 2.0, BURROW_X + 190, f],
  [S('story'), BURROW_X + 190, f], [S('story') + 1.8, LINE[3], f],
  [GO, LINE[3], f], [GO + 1.3, 1450, f],
  [GO2, 1450, f], [GO2 + 1.3, 320, f],
  [S('owl_go'), 320, f], [S('owl_go') + 3.0, UNDER_OWL, f],
  [BACK, UNDER_OWL, f], [BACK + 2.5, LINE[3], f],
  [TOG0, LINE[3], f], [TOG1, LINE[3] + SHIFT + 150, f],
  [S('rosie_stop') + 0.6, LINE[3] + SHIFT + 150, f], [S('rosie_stop') + 1.4, LINE[2] + SHIFT + 150, f],
  [FIN0, LINE[2] + SHIFT + 150, f], [FIN1, END_LINE[3], f],
  [NIGHT0 + 0.5, END_LINE[3], f], [NIGHT0 + 4.5, BURROW_X + 170, f],
  [MEMO, BURROW_X + 170, f], [MEMO + 0.01, MEM[3], f],
];
const BOBO_PATH: KF = [
  [0, BOBO_X, f], [S('fact2c'), BOBO_X, f], [S('fact2c') + 1.2, ROSIE_X - 250, f],
  [S('fact3'), ROSIE_X - 250, f], [S('fact3') + 1.8, 740, f],
  [S('ready') - 1.2, 740, f], [S('ready'), LINE[2], f],
  [GO, LINE[2], f], [S('again1'), 820, f],
  [OFF, 820, f], [OFF + 5.0, -300, f],
  [BACK + 0.5, -300, f], [S('sorry') + 0.3, LINE[2], f],
  [TOG0, LINE[2], f], [TOG1, LINE[2] + SHIFT, f],
  [FIN0, LINE[2] + SHIFT, f], [FIN1, END_LINE[2], f],
  [MEMO, END_LINE[2], f], [MEMO + 0.01, MEM[2], f],
];
const MILA_PATH: KF = [
  [0, -300, f], [S('mila_in') - 1.8, -300, f], [S('mila_in') + 0.2, LINE[0], f],
  [GO, LINE[0], f], [S('again1'), 980, f],
  [OFF, 980, f], [OFF + 5.0, -300, f],
  [BACK + 0.5, -300, f], [S('sorry') + 0.3, LINE[0], f],
  [TOG0, LINE[0], f], [TOG1, LINE[0] + SHIFT, f],
  [FIN0, LINE[0] + SHIFT, f], [FIN1, END_LINE[0], f],
  [MEMO, END_LINE[0], f], [MEMO + 0.01, MEM[0], f],
];
const LEO_PATH: KF = [
  [0, -300, f], [S('leo_in') - 1.8, -300, f], [S('leo_in') + 0.2, LINE[1], f],
  [GO, LINE[1], f], [S('again1'), 1120, f],
  [OFF + 0.4, 1120, f], [OFF + 5.4, -300, f],
  [BACK + 0.5, -300, f], [S('sorry') + 0.3, LINE[1], f],
  [TOG0, LINE[1], f], [TOG1, LINE[1] + SHIFT, f],
  [FIN0, LINE[1] + SHIFT, f], [FIN1, END_LINE[1], f],
  [MEMO, END_LINE[1], f], [MEMO + 0.01, MEM[1], f],
];

// ── director camera
const WIDE = { z: 1.0, x: 960, y: 540 };
const rosieCU = (x: number) => ({ z: 1.6, x, y: f - 270 });
const boboCU = (x: number) => ({ z: 1.55, x, y: f - 280 });
const KID_Y = kidFaceAt(0, f, KS)[1] + 60;
const kidCU = (x: number) => ({ z: 1.55, x: x + 30, y: KID_Y });
const OWL_CU = { z: 1.7, x: OWL_X + 20, y: 330 };
const TWO_OWL = { z: 1.3, x: 1440, y: 560 };
const SHOTS: Shot[] = [
  { t: 0, ...WIDE, move: 'cut', push: 0.01 },
  { t: EARS - 0.4, z: 1.5, x: GRASS_X, y: f - 220, move: 'smooth', dur: 1.2, push: 0.02 },
  { t: REVEAL + 0.8, ...rosieCU(ROSIE_X), move: 'snap', push: 0.01 },
  { t: S('bobo_hi') - 0.2, ...boboCU(BOBO_X), move: 'whip' },
  { t: S('sound_q') - 0.2, z: 1.9, x: ROSIE_X, y: f - 280, move: 'whip', push: 0.01 },
  { t: S('sound_turn') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('sound_b') - 0.2, ...rosieCU(ROSIE_X), move: 'snap' },
  { t: S('sound_why') - 0.2, z: 1.3, x: ROSIE_X, y: f - 240, move: 'smooth', dur: 1.0, push: 0.02 },
  { t: S('facts') - 0.2, z: 1.1, x: 860, y: 580, move: 'smooth', dur: 0.7 },
  { t: S('fact1') - 0.2, ...rosieCU(ROSIE_X), move: 'smooth', dur: 0.8, push: 0.02 },
  { t: S('fact2') - 0.2, z: 1.2, x: ROSIE_X + 120, y: 560, move: 'smooth', dur: 0.8, push: 0.015 },
  { t: S('fact2d') - 0.1, z: 1.45, x: ROSIE_X - 130, y: f - 270, move: 'snap' },
  { t: S('fact3') - 0.2, z: 1.15, x: 640, y: 600, move: 'smooth', dur: 1.8, push: 0.015 },
  { t: S('story') - 0.2, ...WIDE, move: 'smooth', dur: 0.8 },
  { t: S('mila_in') + 0.2, ...kidCU(LINE[0]), move: 'whip' },
  { t: S('leo_in') - 0.1, ...kidCU(LINE[1]), move: 'whip' },
  { t: S('ready') - 0.2, z: 1.15, x: 600, y: 600, move: 'smooth', dur: 0.6, push: 0.02 },
  { t: GO + 0.1, z: 1.05, x: 1050, y: 560, move: 'smooth', dur: 1.0 },
  { t: S('rosie_win') - 0.1, ...rosieCU(1450), move: 'snap' },
  { t: S('bobo_puff') - 0.1, ...boboCU(800), move: 'whip' },
  { t: S('again1') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('rosie_win2') - 0.1, ...rosieCU(320), move: 'snap' },
  { t: S('mila_sad') - 0.1, ...kidCU(980), move: 'whip' },
  { t: S('leo_sad') - 0.1, ...kidCU(1120), move: 'smooth', dur: 0.6 },
  { t: S('walk_off') - 0.3, ...WIDE, move: 'smooth', dur: 1.0, push: 0.015 },
  { t: S('rosie_alone') - 0.2, ...rosieCU(320), move: 'smooth', dur: 1.4, push: 0.03 },
  { t: S('owl_go') - 0.2, ...WIDE, move: 'smooth', dur: 2.0 },
  { t: S('knock') - 0.2, ...TWO_OWL, move: 'smooth', dur: 1.0, push: 0.02 },
  { t: OWL_WAKE - 0.1, ...OWL_CU, move: 'snap', push: 0.01 },
  { t: S('owl_fact2') - 0.2, z: 1.9, x: OWL_X + 20, y: 300, move: 'smooth', dur: 1.0, push: 0.02 },
  { t: S('rosie_tell') - 0.2, ...rosieCU(UNDER_OWL), move: 'smooth', dur: 0.8, push: 0.02 },
  { t: S('owl_ask') - 0.1, ...OWL_CU, move: 'whip' },
  { t: S('rosie_tail') - 0.1, ...rosieCU(UNDER_OWL), move: 'snap' },
  { t: S('owl_tail') - 0.1, ...OWL_CU, move: 'snap' },
  { t: S('owl_wise') - 0.2, ...TWO_OWL, move: 'smooth', dur: 1.0, push: 0.03 },
  { t: S('q_what') - 0.2, ...WIDE, move: 'smooth', dur: 0.8 },
  { t: PEEK + 0.3, ...kidCU(BUSH_X), move: 'whip' },
  { t: S('owl_no') - 0.1, ...OWL_CU, move: 'whip' },
  { t: S('answer') - 0.2, ...TWO_OWL, move: 'smooth', dur: 0.8, push: 0.02 },
  { t: S('rosie_idea') - 0.1, ...rosieCU(UNDER_OWL), move: 'snap' },
  { t: BACK - 0.2, ...WIDE, move: 'smooth', dur: 2.0 },
  { t: S('sorry') - 0.1, ...rosieCU(LINE[3]), move: 'smooth', dur: 0.8, push: 0.02 },
  { t: S('mila_ok') - 0.1, ...kidCU(LINE[0]), move: 'whip' },
  { t: S('bobo_ok') - 0.1, ...boboCU(LINE[2]), move: 'snap' },
  { t: TOG0 - 0.2, z: 1.1, x: 760, y: 590, move: 'smooth', dur: 0.8, push: 0.02 },
  { t: S('trip') - 0.1, z: 1.5, x: LOG_X - 20, y: f - 250, move: 'snap' },
  { t: HELP - 0.2, z: 1.4, x: LINE[2] + SHIFT + 70, y: f - 260, move: 'smooth', dur: 0.8, push: 0.02 },
  { t: UP - 0.1, ...boboCU(LINE[2] + SHIFT), move: 'snap' },
  { t: FIN0 - 0.2, z: 1.05, x: 1150, y: 560, move: 'smooth', dur: 2.0 },
  { t: S('all_win') - 0.1, ...kidCU(END_LINE[1]), move: 'whip' },
  { t: S('owl_proud') - 0.1, ...OWL_CU, move: 'whip' },
  { t: S('lesson') - 0.2, ...WIDE, move: 'smooth', dur: 0.8, push: 0.01 },
  { t: NIGHT0 - 0.2, ...WIDE, move: 'smooth', dur: 0.6, push: 0.015 },
  { t: S('owl_night') - 0.2, ...OWL_CU, move: 'smooth', dur: 1.0, push: 0.02 },
  { t: MEMO, ...WIDE, move: 'cut' },
  { t: S('a1') - 0.1, ...rosieCU(MEM[3]), move: 'snap' },
  { t: E('a1') + 0.6, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('a3') - 0.1, ...rosieCU(MEM[3]), move: 'snap' },
  { t: E('a3') + 0.6, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('a4') - 0.1, ...OWL_CU, move: 'snap' },
  { t: E('a4') + 0.6, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('a5') - 0.1, ...kidCU(MEM[0]), move: 'snap' },
  { t: S('chant') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('c1') - 0.1, z: 1.25, x: 760, y: 600, move: 'smooth', dur: 0.5, push: 0.02 },
  { t: S('c_turn') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
];
const PUNCHES = [REVEAL + 0.3, GO + 0.2, TRIP, RIBBON, S('c3')];
const HITS: Hit[] = [{ at: REVEAL + 0.3, amp: 8, dur: 0.3 }, { at: TRIP, amp: 10, dur: 0.3 }];

// ── props + set pieces
const Grass: React.FC<{ t: number; x: number; wob: number }> = ({ t, x, wob }) => (
  <g transform={`translate(${x},${f + 14})`}>
    {[-170, -130, -95, -60, -25, 10, 45, 80, 115, 150, 180].map((dx, i) => {
      const lean = ((i * 53) % 7 - 3) * 9 + Math.sin(t * 2 + i) * 5 + Math.sin(t * 24 + i * 2) * 9 * wob;
      const hh = 200 + ((i * 41) % 90);
      return (
        <path key={i} d={`M ${dx - 26},0 C ${dx - 22},${-hh * 0.5} ${dx + lean - 10},${-hh * 0.8} ${dx + lean},${-hh} C ${dx + lean * 0.4 + 8},${-hh * 0.65} ${dx + 18},${-hh * 0.3} ${dx + 26},0 Z`}
          fill={i % 3 === 0 ? '#40916c' : i % 3 === 1 ? '#52b788' : '#74c69d'} {...kst(4)} />
      );
    })}
    <Vol kind="slope"><path d="M -220,4 Q -200,-70 -100,-80 Q 0,-96 100,-80 Q 200,-70 220,4 Z" fill="#52b788" {...kst(5)} /></Vol>
  </g>
);
const Bush: React.FC<{ t: number; x: number; shake: number }> = ({ t, x, shake }) => (
  <g transform={`translate(${x + Math.sin(t * 30) * 4 * shake},${f + 16})`}>
    <Vol>
      {[[-120, -90, 100], [0, -150, 125], [120, -95, 100], [-60, -60, 90], [70, -60, 90]].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? '#40916c' : '#52b788'} {...kst(6)} />
      ))}
    </Vol>
    {[[-80, -150], [40, -200], [110, -110]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={12} fill="#ff6fa5" {...kst(3)} />)}
  </g>
);
const BigTree: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Vol kind="tube"><path d={`M ${TREE_X - 80},${f + 10} Q ${TREE_X - 55},500 ${TREE_X - 45},120 L ${TREE_X + 45},120 Q ${TREE_X + 55},500 ${TREE_X + 80},${f + 10} Z`} fill="#8d5a3b" {...kst(7)} /></Vol>
    <ellipse cx={TREE_X + 4} cy={640} rx={34} ry={44} fill="#3b2a4a" {...kst(5)} />
    {/* the owl's branch */}
    <Vol kind="tube"><path d={`M ${TREE_X - 40},${BRANCH_Y + 6} Q ${OWL_X + 40},${BRANCH_Y - 8} ${OWL_X - 140},${BRANCH_Y - 14} L ${OWL_X - 140},${BRANCH_Y + 12} Q ${OWL_X + 40},${BRANCH_Y + 28} ${TREE_X - 40},${BRANCH_Y + 50} Z`} fill="#8d5a3b" {...kst(6)} /></Vol>
    <path d={`M ${OWL_X - 130},${BRANCH_Y - 10} q -30,-30 -20,-60 q 30,10 20,60 Z`} fill="#52b788" {...kst(4)} transform={`rotate(${Math.sin(t * 1.5) * 6} ${OWL_X - 130} ${BRANCH_Y - 10})`} />
    <Vol>
      {[[TREE_X - 170, 120, 150], [TREE_X + 60, 60, 170], [TREE_X + 190, 200, 130], [TREE_X - 30, -20, 130]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? '#2d9a5a' : '#38b26b'} {...kst(6)} />
      ))}
    </Vol>
  </g>
);
const Burrow: React.FC = () => (
  <g transform={`translate(${BURROW_X},${f + 12})`}>
    <Vol kind="slope"><path d="M -170,0 Q -150,-120 0,-130 Q 150,-120 170,0 Z" fill="#b5835a" {...kst(6)} /></Vol>
    <ellipse cx={10} cy={-46} rx={70} ry={52} fill="#4a3428" {...kst(5)} />
    {[[-120, -20], [110, -30], [-60, -100]].map(([x, y], i) => <path key={i} d={`M ${x},${y} q 10,-30 20,0`} fill="none" stroke="#52b788" strokeWidth={6} strokeLinecap="round" />)}
  </g>
);
const Log: React.FC = () => (
  <g transform={`translate(${LOG_X + 50},${f + 8})`}>
    <Vol kind="tube"><rect x={-120} y={-56} width={240} height={56} rx={28} fill="#a0673c" {...kst(6)} /></Vol>
    <ellipse cx={120} cy={-28} rx={20} ry={28} fill="#e0b083" {...kst(5)} />
    <ellipse cx={120} cy={-28} rx={9} ry={13} fill="none" stroke="#a0673c" strokeWidth={4} />
  </g>
);
// the finish arch: two posts + a chequered FINISH banner over the heads; the race passes under it
const FinishArch: React.FC<{ t: number; wave: number }> = ({ t, wave }) => {
  const y = f - 500;
  return (
    <g>
      {[-130, 130].map((dx) => <Vol key={dx} kind="tube"><rect x={FINISH_X + dx - 12} y={y} width={24} height={f + 10 - y} rx={12} fill="#ffffff" {...kst(5)} /></Vol>)}
      <g transform={`translate(${FINISH_X},${y + 10}) rotate(${Math.sin(t * 9) * 3 * wave})`}>
        <Vol kind="slope"><rect x={-170} y={-50} width={340} height={84} rx={18} fill="#ff595e" {...kst(6)} /></Vol>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={-160 + i * 40} y={i % 2 ? -42 : 8} width={40} height={18} fill="#ffffff" opacity={0.9} />)}
        <text x={0} y={2} textAnchor="middle" dominantBaseline="middle" fontSize={44} fontWeight={900} fill="#ffffff" stroke={KINK} strokeWidth={5} paintOrder="stroke">FINISH</text>
      </g>
    </g>
  );
};
const GrassTuft: React.FC = () => (
  <g>
    {[-18, -6, 6, 18].map((dx, i) => <path key={i} d={`M ${dx},20 Q ${dx * 1.6},-10 ${dx * 2},${-40 - (i % 2) * 14}`} fill="none" stroke="#52b788" strokeWidth={8} strokeLinecap="round" />)}
  </g>
);
// fact 2: a top-down bubble — a bunny head with eyes on the sides, seeing almost all the way round
const VisionBubble: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => {
  if (s <= 0) return null;
  const R = 120;
  const gap = 22 * (Math.PI / 180); // the small blind spot right behind
  const a0 = Math.PI / 2 + gap;
  const a1 = Math.PI / 2 - gap + Math.PI * 2;
  const p = (a: number) => `${Math.cos(a) * R},${Math.sin(a) * R}`;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <circle r={168} fill="#ffffff" {...kst(6)} />
      <path d={`M 0,0 L ${p(a0)} A ${R} ${R} 0 1 1 ${p(a1)} Z`} fill="#ffe066" opacity={0.75} />
      {/* top view: head (nose up), ears down the back, an eye on each side */}
      <g transform="scale(1.45)">
        <ellipse cx={-16} cy={52} rx={14} ry={40} fill={ROSIE.fur} {...kst(4)} />
        <ellipse cx={16} cy={52} rx={14} ry={40} fill={ROSIE.fur} {...kst(4)} />
        <ellipse cx={0} cy={0} rx={40} ry={50} fill={ROSIE.fur} {...kst(5)} />
        <circle cx={0} cy={-46} r={8} fill="#ff8fab" {...kst(3)} />
        {[-1, 1].map((sd) => <circle key={sd} cx={sd * 38} cy={-6} r={9} fill={KINK} />)}
      </g>
    </g>
  );
};
// fact 3: a cut-away bubble of the burrow — tunnels and a cosy room under the ground
const BurrowBubble: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) =>
  s <= 0 ? null : (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <circle r={175} fill="#9c6b45" {...kst(6)} />
      <path d="M -175,-70 L 175,-70 A 175 175 0 0 0 -175,-70 Z" fill="#a8dadc" />
      <path d="M -175,-70 Q 0,-90 175,-70" fill="none" stroke="#52b788" strokeWidth={16} />
      <path d="M -60,-74 Q -50,-10 -100,30 Q -130,70 -40,90 Q 40,100 80,40 Q 110,0 60,-30" fill="none" stroke="#4a3428" strokeWidth={34} strokeLinecap="round" />
      <path d="M 60,-30 Q 110,-60 120,-76" fill="none" stroke="#4a3428" strokeWidth={30} strokeLinecap="round" />
      <ellipse cx={-30} cy={88} rx={60} ry={34} fill="#4a3428" />
      <ellipse cx={-30} cy={104} rx={40} ry={12} fill="#ffca3a" opacity={0.8} />
      <g transform="translate(-30,96)">
        <ellipse cx={-14} cy={-30} rx={7} ry={18} fill={ROSIE.fur} transform="rotate(-20 -14 -30)" />
        <ellipse cx={4} cy={-30} rx={7} ry={18} fill={ROSIE.fur} transform="rotate(15 4 -30)" />
        <ellipse cx={0} cy={-6} rx={26} ry={16} fill={ROSIE.fur} />
      </g>
      <circle r={175} fill="none" {...kst(6)} />
    </g>
  );

export default function KidsAnimals081() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const shake = shakeOf(t, HITS);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const chantHop = within(t, S('c1'), E('c_turn') + 0.4);
  const togetherHop = within(t, TOG0, TOG1) || within(t, FIN0, FIN1);
  const nightK = t >= MEMO ? 0 : Math.min(prog(t, NIGHT0, NIGHT0 + 2.0), 1);

  // ── Rosie
  const [rx, ry] = lerp2(t, ROSIE_PATH);
  const rDir = heading(t, ROSIE_PATH);
  const rMoving = moving(t, ROSIE_PATH);
  const racing = within(t, GO, GO + 1.3) || within(t, GO2, GO2 + 1.3);
  const rosieHop = arc(t, REVEAL, REVEAL + 0.8, 220) + (rMoving && t > REVEAL + 0.8 ? Math.abs(Math.sin(t * (racing ? 14 : 8))) * (racing ? 50 : 70) : 0)
    + bounce(chantHop, t, 0, 24) + arc(t, word('fact3c', 5), word('fact3c', 5) + 0.6, 90);
  const rosieGone = within(t, INTO_BURROW + 0.5, MEMO);
  const rosieShrink = within(t, INTO_BURROW, INTO_BURROW + 0.5) ? 1 - prog(t, INTO_BURROW, INTO_BURROW + 0.5) : 1;
  const rosieExpr: KExpr =
    within(t, S('rosie_alone') - 0.6, S('knock')) || within(t, S('rosie_tell'), E('rosie_tell') + 0.4) ? 'sad'
    : within(t, S('mila_sad'), E('walk_off')) ? 'oops'
    : within(t, S('rosie_tail'), E('rosie_tail') + 0.6) ? 'oops'
    : within(t, S('owl_ask'), E('owl_ask') + 0.4) || within(t, S('q_what'), E('answer')) ? 'think'
    : within(t, S('sorry'), E('sorry2')) ? 'sad'
    : within(t, TRIP, HELP) ? 'surprised'
    : within(t, S('rosie_win'), E('rosie_win')) || within(t, S('rosie_win2'), E('rosie_win2')) ? 'proud'
    : within(t, S('rosie_idea'), E('rosie_idea')) ? 'wow'
    : within(t, FIN1 - 1, E('all_win') + 0.6) || chantHop || within(t, MUNCH[0], MUNCH[1]) ? 'laugh'
    : within(t, S('rosie_night'), E('owl_night')) ? 'sleepy'
    : talks('rosie') ? 'happy' : 'smile';
  const sniffing = within(t, SNIFF[0], SNIFF[1]) || within(t, S('sound_turn'), E('sound_turn')) || within(t, word('a1', 5), E('a1')) || within(t, word('bye', 3), E('bye'));
  const rosieTilt = sniffing ? Math.sin(t * 26) * 3 : within(t, S('q_what'), E('q_what') + 2) ? -8 : 0;
  const munching = within(t, MUNCH[0], MUNCH[1]) || within(t, S('fact1b') + 1, E('fact1b'));
  const holdsPaw = within(t, HELP + 0.6, UP + 0.6);
  const rosieArmR: CArm = holdsPaw ? 'hold' : munching ? 'hold' : within(t, S('fact3c'), E('fact3c')) ? 'point' : t >= S('bye') ? 'wave' : chantHop || within(t, S('rosie_win'), E('rosie_win')) ? 'up' : talks('rosie') ? 'wave' : 'down';
  const rosieArmL: CArm = within(t, S('q_what'), E('q_what') + 2) ? 'think' : chantHop ? 'up' : within(t, S('sorry'), E('sorry2')) ? 'hug' : 'down';
  const rosieMouth = Math.max(lipSync(VO, 'rosie', t), munching && !talks('rosie') ? Math.abs(Math.sin(t * 12)) * 0.6 : 0);
  // looking: at Bobo when he is behind her (she doesn't turn — the side eyes), at the owl up in the tree
  const underOwl = within(t, S('owl_go') + 3.0, BACK);
  const rosieLook: [number, number] = rDir ? [rDir * 0.8, 0.1]
    : within(t, S('fact2c'), E('fact2d')) ? [-0.9, 0]
    : underOwl ? [0.6, -0.6]
    : within(t, S('bobo_hi'), S('sound_q')) ? [-0.6, 0] : [0, 0.1];

  // ── Bobo
  const [bx, by] = lerp2(t, BOBO_PATH);
  const bDir = heading(t, BOBO_PATH);
  const fallen = within(t, TRIP, UP + 0.3);
  const boboExpr: KExpr =
    within(t, TRIP - 0.4, HELP) ? 'oops'
    : within(t, S('bobo_puff'), E('bobo_puff') + 0.6) ? 'sad'
    : within(t, S('mila_sad'), E('walk_off')) ? 'sad'
    : within(t, UP, E('bobo_up') + 0.6) || togetherHop || chantHop || within(t, S('bobo_ok'), E('bobo_ok')) ? 'laugh'
    : talks('bobo') ? 'happy' : 'smile';
  const boboArms: CArm = within(t, TRIP, HELP + 0.6) ? { a: 40 } : holdsPaw ? 'hold' : talks('bobo') ? 'wave' : chantHop ? 'up' : t >= S('bye') ? 'wave' : 'down';
  const boboTilt = fallen ? (within(t, TRIP, TRIP + 0.25) ? 45 * prog(t, TRIP - 0.05, TRIP + 0.25) : 45 * (1 - prog(t, UP - 0.2, UP + 0.3))) : 0;
  const boboHop = bounce(togetherHop || chantHop, t, 2, 30) + arc(t, S('bobo_ok'), S('bobo_ok') + 0.6, 80);

  // ── Mila & Leo
  const [ix] = lerp2(t, MILA_PATH);
  const [ex] = lerp2(t, LEO_PATH);
  const peekP = within(t, PEEK, PEEK_END) ? Math.min(popIn(t, PEEK, 0.4), 1 - prog(t, PEEK_END - 0.4, PEEK_END)) : 0;
  const leoExpr: KExpr =
    within(t, S('leo_guess'), E('leo_guess')) ? 'proud'
    : within(t, S('owl_no'), PEEK_END) || within(t, S('a4'), E('a4')) ? 'oops'
    : within(t, S('mila_sad'), E('walk_off')) ? 'sad'
    : within(t, TRIP, HELP) ? 'surprised'
    : chantHop || togetherHop || within(t, S('all_win'), E('all_win') + 0.6) ? 'laugh'
    : talks('leo') ? 'happy' : 'smile';
  const leoArm: KArm = within(t, S('leo_guess'), E('leo_guess')) ? 'up' : t >= S('bye') ? 'wave' : within(t, S('all_win'), E('all_win') + 0.6) ? 'up' : talks('leo') ? 'present' : within(t, S('hop_turn'), E('hop_turn') + 1.5) ? 'clap' : chantHop ? 'up' : 'down';
  const milaExpr: KExpr =
    within(t, S('mila_sad'), E('walk_off')) ? 'sad'
    : within(t, TRIP, HELP) ? 'surprised'
    : chantHop || togetherHop || within(t, FIN1 - 1, E('all_win') + 0.6) ? 'laugh'
    : talks('mila') ? 'happy' : 'smile';
  const milaArm: KArm = t >= S('bye') ? 'wave' : talks('mila') ? 'wave' : within(t, S('hop_turn'), E('hop_turn') + 1.5) ? 'clap' : chantHop || within(t, FIN1 - 1, E('all_win') + 0.6) ? 'up' : 'down';
  const kidHop = (k: number) => bounce(chantHop || togetherHop, t, k, 22);

  // ── the owl
  const owlAsleep = t < OWL_WAKE;
  const owlExpr: KExpr =
    owlAsleep ? 'sleepy'
    : within(t, OWL_WAKE, OWL_WAKE + 1.0) ? 'surprised'
    : within(t, S('owl_tail'), E('owl_tail')) || within(t, S('owl_no'), E('owl_no')) ? 'laugh'
    : within(t, S('owl_ask'), E('owl_ask')) || within(t, S('q_what'), S('leo_guess')) ? 'think'
    : within(t, S('owl_proud'), E('owl_proud') + 0.6) || within(t, S('owl_night'), E('owl_night')) ? 'wow'
    : talks('willow') ? 'happy' : 'smile';
  const owlArm: CArm = owlAsleep ? 'down' : within(t, S('owl_wise'), E('owl_wise2')) ? 'point' : within(t, S('owl_night'), E('owl_night')) ? 'up' : talks('willow') ? 'wave' : t >= S('bye') ? 'wave' : 'down';
  const [ofx, ofy] = critterFaceAt(OWL_X, BRANCH_Y, OS);

  // the teaching bubbles
  const visionS = within(t, S('fact2b'), S('fact2d') - 0.1) ? popIn(t, S('fact2b')) : 0;
  const burrowS = within(t, S('fact3b'), S('story') - 0.2) ? popIn(t, S('fact3b')) * 0.8 : 0;
  const raceSet = t >= S('mila_in') - 2 && t < S('rosie_alone') || t >= BACK && t < MEMO;
  const [rfx, rfy] = critterFaceAt(rx, ry, RS);

  return (
    <>
      <ActionStage cam={cam} shake={shake} blur={cam.blur}>
        <Backdrop place="forest" w={W} h={H} t={t} fx={nightK > 0.5 ? false : ['butterflies']} />
        <BigTree t={t} />
        <Burrow />
        {raceSet && <FinishArch t={t} wave={within(t, RIBBON, RIBBON + 1.2) || within(t, GO + 0.6, GO + 1.6) ? 1 : 0} />}
        {t >= BACK && t < MEMO && <Log />}
        {/* the owl on her branch */}
        <Critter spec={WILLOW} x={OWL_X} y={BRANCH_Y} scale={OS} expr={owlExpr} look={owlAsleep ? [0, 0.3] : within(t, PEEK, PEEK_END) ? [-1, 0.4] : [-0.5, 0.5]}
          mouth={lipSync(VO, 'willow', t)} armL={owlArm === 'point' ? 'down' : owlArm} armR={owlArm} shadow={false}
          hop={arc(t, OWL_WAKE, OWL_WAKE + 0.5, 30) + bounce(within(t, S('owl_night'), E('owl_night')), t, 1, 14)} squash={owlAsleep ? 0.06 + Math.sin(t * 2) * 0.02 : 0} />
        {/* Leo peeks out of the bush */}
        {peekP > 0 && (
          <g>
            <clipPath id="d81-bush"><rect x={0} y={0} width={W} height={f + 10} /></clipPath>
            <g clipPath="url(#d81-bush)">
              <Kid spec={LEO_HERO} x={BUSH_X + 20} y={f + 260 * (1 - peekP)} scale={KS} expr={leoExpr} look={[0.8, -0.2]} mouth={lipSync(VO, 'leo', t)}
                armL="down" armR={leoArm} shadow={false} />
            </g>
          </g>
        )}
        <Bush t={t} x={BUSH_X} shake={within(t, PEEK - 0.4, PEEK + 0.4) || within(t, PEEK_END - 0.4, PEEK_END) ? 1 : 0} />
        {/* Mila & Leo */}
        {ix > -260 && (
          <Kid spec={MILA_HERO} x={ix} y={f} scale={KS} expr={milaExpr} look={within(t, S('owl_proud'), E('owl_proud')) ? [0.6, -0.5] : [0.6, 0]} mouth={lipSync(VO, 'mila', t)}
            armL={milaArm} armR={milaArm} legs={moving(t, MILA_PATH) ? 'walk' : 'stand'} walk={t * 2} hop={kidHop(1)} />
        )}
        {ex > -260 && peekP <= 0 && (
          <Kid spec={LEO_HERO} x={ex} y={f} scale={KS} expr={leoExpr} look={[0.5, 0]} mouth={lipSync(VO, 'leo', t)}
            armL={leoArm} armR={leoArm} legs={moving(t, LEO_PATH) ? 'walk' : 'stand'} walk={t * 2} hop={kidHop(3)} />
        )}
        {/* Bobo */}
        {bx > -260 && (
          <Critter spec={BOBO_HERO} x={bx} y={by} scale={BS} expr={boboExpr} look={bDir ? [bDir * 0.8, 0] : fallen ? [0.6, 0.3] : [0.4, 0]} mouth={lipSync(VO, 'bobo', t)}
            armL={boboArms} armR={boboArms} walking={moving(t, BOBO_PATH)} walk={t * (within(t, GO, S('again1')) ? 1.4 : 2.2)}
            hop={boboHop} tilt={boboTilt} squash={fallen && boboTilt > 25 ? 0.12 : 0} facing={bDir < 0 ? -1 : 1} />
        )}
        {/* Rosie (hidden in the grass for the hook, in her burrow at night) */}
        {t >= REVEAL - 0.01 && !rosieGone && (
          <g transform={rosieShrink < 1 ? `translate(${rx},${ry}) scale(${rosieShrink}) translate(${-rx},${-ry})` : ''}>
            <Critter spec={ROSIE} x={rx} y={ry} scale={RS} expr={rosieExpr} look={rosieLook} mouth={rosieMouth}
              armL={rosieArmL} armR={rosieArmR} holdR={munching ? <GrassTuft /> : undefined}
              hop={rosieHop} tilt={rosieTilt} walking={false} facing={rDir < 0 ? -1 : 1} />
          </g>
        )}
        {t < REVEAL && t >= EARS - 0.3 && (
          <g>
            {[-34, 34].map((dx) => (
              <g key={dx} transform={`translate(${GRASS_X + dx},${f - 250 - arc(t, EARS - 0.3, REVEAL, 16)}) rotate(${dx / 4 + Math.sin(t * 6 + dx) * 4})`}>
                <Vol><ellipse cx={0} cy={-60} rx={26} ry={80} fill={ROSIE.fur} {...kst(5)} /></Vol>
                <ellipse cx={0} cy={-56} rx={12} ry={56} fill="#ffc8dd" />
              </g>
            ))}
          </g>
        )}
        {t < REVEAL && <Grass t={t} x={GRASS_X} wob={within(t, S('g1'), REVEAL) ? 1 : 0} />}
        {t < REVEAL && t >= TAIL_AT && (
          <g transform={`translate(${GRASS_X + 170},${f - 70}) scale(${popIn(t, TAIL_AT)})`}>
            <Vol><circle r={38} fill="#ffffff" {...kst(5)} /></Vol>
          </g>
        )}
        {/* the night sky (tint + moon + stars) */}
        {nightK > 0 && (
          <g opacity={nightK}>
            <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#2b2d6e" opacity={0.5} />
            <g transform="translate(260,150)">
              <circle r={110} fill="#fff3b0" opacity={0.25} />
              <Vol><circle r={70} fill="#fff3b0" {...kst(6)} /></Vol>
            </g>
            {[[520, 90], [820, 160], [1100, 70], [1380, 130], [700, 300], [1000, 260]].map(([x, y], i) => (
              <Twinkle key={i} x={x} y={y} s={0.5 + 0.25 * Math.sin(t * 2 + i)} c="#fff59d" />
            ))}
          </g>
        )}
        {/* the owl's eyes glow a little at night */}
        {nightK > 0.5 && [-1, 1].map((sd) => <circle key={sd} cx={ofx + sd * 30} cy={ofy - 10} r={34} fill="#fff59d" opacity={0.18} />)}
        {/* teaching bubbles */}
        <VisionBubble x={ROSIE_X + 340} y={480} s={visionS} />
        <BurrowBubble x={1060} y={520} s={burrowS} />
        {/* FX + words */}
        <Dust t={t} at={REVEAL + 0.8} x={ROSIE_X} y={f} s={1.2} />
        <ImpactStar t={t} at={REVEAL + 0.3} x={GRASS_X - 200} y={f - 300} s={0.9} />
        <MotionLines t={t} from={GO} to={GO + 1.3} x={rx - 140} y={f - 200} dir={0} n={4} len={160} spread={140} />
        <MotionLines t={t} from={GO2} to={GO2 + 1.3} x={rx + 140} y={f - 200} dir={180} n={4} len={160} spread={140} />
        <Dust t={t} at={GO + 1.3} x={1450} y={f} s={1.1} />
        <Dust t={t} at={GO2 + 1.3} x={320} y={f} s={1.1} />
        <StrainLines t={t} from={S('bobo_puff')} to={E('bobo_puff') + 0.4} x={bx} y={f - 300} />
        <ImpactStar t={t} at={TRIP} x={LOG_X + 130} y={f - 70} s={0.7} />
        <Dust t={t} at={TRIP} x={LOG_X} y={f} s={1.4} />
        <Dust t={t} at={FIN1} x={1630} y={f} s={1.2} />
        {sniffing && [0, 1, 2].map((k) => {
          const ph = (t * 3 + k / 3) % 1;
          return <path key={k} d={`M ${rfx - 70 - ph * 40},${rfy + 30 - k * 18} q -14,-10 -28,0`} fill="none" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={1 - ph} />;
        })}
        <StageWord t={t} at={word('reveal', 0)} until={word('reveal', 2)} text="BOING!" x={ROSIE_X - 330} y={f - 330} size={100} color="#ffafcc" rot={-6} />
        <StageWord t={t} at={word('sound_a', 0)} until={E('sound_a') + 0.5} text="SNIFF! SNIFF!" x={ROSIE_X + 230} y={f - 330} size={56} color="#ffafcc" rot={-6} />
        <StageWord t={t} at={S('fact1c')} until={MUNCH[1]} text="MUNCH! MUNCH!" x={ROSIE_X + 260} y={f - 330} size={60} color="#52b788" rot={6} />
        <StageWord t={t} at={word('fact3c', 5)} until={E('fact3c') + 0.6} text="POP!" x={BURROW_X + 190} y={f - 480} size={100} color="#ffca3a" rot={-6} />
        <StageWord t={t} at={GO + 0.2} until={GO + 1.4} text="ZOOM!" x={1200} y={f - 460} size={90} color="#4cc9f0" rot={6} />
        <StageWord t={t} at={GO2} until={GO2 + 1.4} text="ZOOM!" x={700} y={f - 460} size={90} color="#4cc9f0" rot={-6} />
        <StageWord t={t} at={S('bobo_puff')} until={E('bobo_puff') + 0.3} text="PUFF… PUFF…" x={820} y={f - 330} size={70} color="#a0c4ff" rot={4} />
        <StageWord t={t} at={0} until={OWL_WAKE} text="Z z z" x={OWL_X + 130} y={BRANCH_Y - 280} size={70} color="#a0c4ff" rot={-8} />
        <StageWord t={t} at={word('knock', 0)} until={E('knock')} text="HELLO?" x={UNDER_OWL} y={f - 470} size={70} color="#ffafcc" rot={-5} />
        <StageWord t={t} at={OWL_WAKE} until={OWL_WAKE + 1.2} text="HOO!" x={OWL_X - 170} y={BRANCH_Y - 290} size={80} color="#cdb4db" rot={6} />
        <StageWord t={t} at={S('rosie_tail')} until={E('rosie_tail') + 0.6} text="WIGGLE!" x={UNDER_OWL + 180} y={f - 260} size={64} color="#ffffff" rot={8} />
        <StageWord t={t} at={S('together')} until={TOG1} text="HOP! HOP! HOP!" x={760} y={f - 560} size={80} color="#52b788" rot={-5} />
        <StageWord t={t} at={TRIP} until={TRIP + 1.3} text="OOF!" x={LOG_X + 60} y={f - 450} size={100} color="#ffca3a" rot={6} />
        <StageWord t={t} at={S('owl_night')} until={E('owl_night') + 0.8} text="HOO-HOO!" x={OWL_X - 150} y={BRANCH_Y - 300} size={70} color="#fff3b0" rot={-6} />
        <Reaction kind="?" t={t} at={E('g3') + 0.1} until={REVEAL} x={GRASS_X + 220} y={f - 360} s={0.7} />
        <Reaction kind="!" t={t} at={REVEAL + 0.2} until={REVEAL + 1.4} x={BOBO_X} y={f - 480} s={0.7} />
        <Reaction kind="!" t={t} at={word('fact2d', 0)} until={E('fact2d') + 0.4} x={ROSIE_X - 250} y={f - 480} s={0.6} />
        <Reaction kind="sweat" t={t} at={S('bobo_puff')} until={E('bobo_puff') + 0.6} x={890} y={f - 460} s={0.6} />
        <Reaction kind="cloud" t={t} at={S('mila_sad')} until={E('mila_sad') + 0.4} x={980} y={f - 560} s={0.6} />
        <Reaction kind="cloud" t={t} at={S('rosie_alone')} until={S('owl_go') + 0.5} x={rx} y={f - 470} s={0.6} />
        <Reaction kind="!" t={t} at={OWL_WAKE} until={OWL_WAKE + 1.0} x={OWL_X + 120} y={BRANCH_Y - 260} s={0.6} />
        <Reaction kind="idea" t={t} at={S('leo_guess')} until={E('leo_guess')} x={BUSH_X + 20} y={f - 560} s={0.7} />
        <Reaction kind="idea" t={t} at={S('rosie_idea')} until={E('rosie_idea') + 0.4} x={rx} y={f - 470} s={0.7} />
        <Reaction kind="heart" t={t} at={S('mila_ok')} until={E('mila_ok') + 0.6} x={ix} y={f - 560} s={0.6} />
        <Reaction kind="stars" t={t} at={TRIP + 0.2} until={HELP} x={bx} y={f - 300} s={0.7} />
        <Reaction kind="heart" t={t} at={UP} until={E('bobo_up') + 0.6} x={bx} y={f - 470} s={0.7} />
        <Reaction kind="heart" t={t} at={S('owl_proud')} until={E('owl_proud') + 0.6} x={OWL_X + 120} y={BRANCH_Y - 260} s={0.6} />
      </ActionStage>

      {/* screen-space */}
      <ThinkTimer t={t} from={onBeat(E('g3') + 0.1)} to={REVEAL} x={1760} y={190} r={90} label="WHO?" />
      <PopText t={t} at={REVEAL + 0.3} until={S('hi') + 1.5} text="ROSIE THE RABBIT!" y={170} size={120} color="#ffafcc" />
      <PopText t={t} at={E('sound_turn') - 0.8} until={S('sound_b') - 0.1} text="YOUR TURN!" y={170} size={120} color="#ffffff" />
      <PopText t={t} at={S('facts') + 0.2} until={S('fact1') - 0.1} text="3 RABBIT FACTS!" y={170} size={120} color="#ffafcc" />
      <PopText t={t} at={S('fact1')} until={S('fact2') - 0.2} text="1  TEETH KEEP GROWING" y={170} size={96} color="#ffffff" />
      <PopText t={t} at={S('fact2')} until={S('fact3') - 0.2} text="2  EYES ON THE SIDES" y={170} size={96} color="#ffe066" />
      <PopText t={t} at={S('fact3')} until={S('story') - 0.2} text="3  A HOME UNDERGROUND" y={170} size={96} color="#e0b083" />
      <PopText t={t} at={word('ready', 0)} until={GO + 1.4} text="READY… STEADY… GO!" y={170} size={100} color="#ff595e" />
      <PopText t={t} at={S('rosie_alone') + 0.4} until={S('owl_go') - 0.1} text="ALL ALONE…" y={170} size={110} color="#a0c4ff" />
      <PopText t={t} at={S('owl_fact')} until={S('owl_fact2') - 0.1} text="OWLS SLEEP IN THE DAY" y={170} size={96} color="#cdb4db" />
      <PopText t={t} at={S('owl_fact2')} until={S('rosie_tell') - 0.1} text="BIG EYES SEE IN THE DARK" y={170} size={90} color="#ffb703" />
      <PopText t={t} at={word('owl_wise2', 3)} until={S('q_what') - 0.1} text="WAIT · HELP" x={600} y={170} size={130} color="#ffca3a" />
      <PopText t={t} at={S('q_what') + 0.2} until={S('leo_guess') - 0.1} text="FASTER… OR WAIT?" y={170} size={110} color="#4cc9f0" />
      <ThinkTimer t={t} from={onBeat(E('q_what') + 0.1)} to={S('leo_guess') - 0.1} x={1760} y={190} r={90} label="THINK!" />
      <PopText t={t} at={word('leo_guess', 4)} until={S('owl_no')} text="FASTER?" y={170} size={120} color="#4cc9f0" />
      <AnswerMark t={t} at={S('owl_no') + 0.2} until={S('answer') + 0.2} ok={false} x={1760} y={190} />
      <AnswerMark t={t} at={word('answer', 5)} until={E('answer') + 0.8} ok x={1760} y={190} />
      <PopText t={t} at={word('answer', 5)} until={E('answer') + 1.0} text="WAIT FOR FRIENDS!" x={700} y={170} size={100} color="#52b788" />
      <PopText t={t} at={word('sorry', 4)} until={S('mila_ok') - 0.1} text="SORRY" y={170} size={130} color="#ffafcc" />
      <PopText t={t} at={S('hop_turn')} until={S('trip') - 0.1} text="HOP WITH US!" y={170} size={120} color="#52b788" />
      <PopText t={t} at={S('rosie_help')} until={S('finish') - 0.1} text="FRIENDS HELP!" y={170} size={120} color="#ffca3a" />
      <PopText t={t} at={RIBBON} until={S('owl_proud') - 0.1} text="TOGETHER!" y={170} size={130} color="#ff6fa5" />
      <PopText t={t} at={S('lesson')} until={S('night') - 0.1} text="WAIT · HELP · PLAY TOGETHER" y={170} size={80} color="#ffca3a" />
      <PopText t={t} at={S('again') + 0.2} until={S('q1') - 0.1} text="LET'S REMEMBER!" y={170} size={110} color="#ffca3a" />
      {(['q1', 'q2', 'q3', 'q4', 'q5'] as const).map((q) => {
        const a = ({ q1: 'a1', q2: 'a2', q3: 'a3', q4: 'a4', q5: 'a5' } as const)[q];
        return <ThinkTimer key={q} t={t} from={onBeat(E(q) + 0.1)} to={S(a) - 0.1} x={1760} y={190} r={90} label="THINK!" />;
      })}
      <PopText t={t} at={S('a1')} until={S('q2') - 0.2} text="SNIFF! SNIFF!" y={170} size={130} color="#ffafcc" />
      <PopText t={t} at={S('a2')} until={S('q3') - 0.2} text="GROWING!" y={170} size={130} color="#ffffff" />
      <PopText t={t} at={S('a3')} until={S('q4') - 0.2} text="IN A BURROW!" y={170} size={120} color="#e0b083" />
      <PopText t={t} at={S('a4')} until={S('q5') - 0.2} text="IN THE DAYTIME!" y={170} size={110} color="#cdb4db" />
      <PopText t={t} at={S('a5')} until={S('chant') - 0.2} text="WAIT AND HELP!" y={170} size={120} color="#ffca3a" />
      <PopText t={t} at={S('c1')} until={S('c2') - 0.1} text="WAIT FOR FRIENDS!" y={170} size={110} color="#ffca3a" />
      <PopText t={t} at={S('c2')} until={S('c3') - 0.1} text="HELP FRIENDS!" y={170} size={120} color="#4cc9f0" />
      <PopText t={t} at={S('c3')} until={S('c_turn') - 0.1} text="PLAY TOGETHER!" y={170} size={110} color="#52b788" />
      <PopText t={t} at={E('c_turn') - 0.2} until={S('bye') - 0.1} text="YOUR TURN!" y={170} size={120} color="#ffffff" />
      <PopText t={t} at={S('bye')} until={END_IRIS} text="SEE YOU NEXT TIME!" y={170} size={100} color="#ffafcc" />
      <Confetti t={t} at={REVEAL + 0.3} y={420} />
      <Confetti t={t} at={RIBBON} y={420} />
      <Confetti t={t} at={S('c3')} y={420} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <SparksIntro t={t} at={0} cast={{ kids: [MILA_HERO, LEO_HERO], buddy: BOBO_HERO }} />
      <StarWipe t={t} at={END_IRIS} dur={0.5} hold={5} color="#ffafcc" x={W / 2} y={H * 0.45} />
    </>
  );
}
