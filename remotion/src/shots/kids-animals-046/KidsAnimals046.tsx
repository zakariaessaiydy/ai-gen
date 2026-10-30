// TINY SPARKS · Day 46 · 🦁 Animal Stories #7 — "Coco the Penguin Finds a Friend" (LONG 16:9, 5:07)
// kids-shorts/tiny-sparks/animals/day-046-coco-the-penguin-finds-a-friend. Cues from VO via K (keys.gen.ts).
// ENERGY LAYER standard: ident on the jingle → GUESS WHO (footprints lead to a snow pile, a little tail wags out of
// it, think timer) → the pile bursts: Coco the penguin (new 'penguin' species in critter.tsx) → MEET Super Bobo
// (brrr!) → SOUND "squawk" (your turn) → WADDLE together (short legs) → 3 TRUE FACTS (birds that can't fly but SWIM —
// underwater cut · slide on their tummies — Bobo tries and bonks into the snowbank · emperor dads keep the egg warm on
// their feet) → STORY (value: friendship): the other penguins play, Coco is lonely and shy → think timer → Bobo:
// "Say hello! Can I play with you?" → Pip slides in, his snow tower keeps falling → Coco takes a big breath (your turn)
// → "Hello! Can I play?" → they build the tower together (1, 2, 3 blocks) → the wind blows Pip's scarf into the water
// → who is a super swimmer? → Coco dives (underwater cut) and brings it back → best friends → they slide together,
// Bobo too → LET'S REMEMBER (5 questions, think timers) → chant "Say hello · Play together · Help each other" → waddle
// → bye + star iris.
import React from 'react';
import { Critter, type CArm, type CritterSpec } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Sun, Underwater } from '../../lib/kids/sets';
import { Bubbles } from '../../lib/kids/sea';
import { Confetti, KidsCaptions, PopText, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import {
  ActionStage, Dust, ImpactStar, MotionLines, Reaction, SparksIntro, StageWord, StarWipe, directorCam, onBeat, shakeOf,
  type Hit, type Shot,
} from '../../lib/kids/energy';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsAnimals046', durationInSeconds: 306.9, fps: 30, width: 1920, height: 1080 };

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
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff', coco: '#ff8fab', pip: '#4cc9f0' };
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
const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (EASE_OUT(p) - 1) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};
const arc = (t: number, a: number, b: number, h: number) => (within(t, a, b) ? Math.sin(prog(t, a, b) * Math.PI) * h : 0);

// ── cast
const COCO: CritterSpec = { id: 'coco', species: 'penguin', fur: '#2b3a67', fur2: '#ffffff', dark: '#ff9f1c', bow: '#ff6fa5', iris: '#3a2a1a' };
const PIP_SCARF: CritterSpec = { id: 'pip', species: 'penguin', fur: '#45507a', fur2: '#ffffff', dark: '#ffb703', scarf: '#4cc9f0' };
const PIP_BARE: CritterSpec = { ...PIP_SCARF, scarf: undefined };
const DAD: CritterSpec = { id: 'dad', species: 'penguin', fur: '#3d405b', fur2: '#ffffff', dark: '#ffb703' };
const KIDS: CritterSpec[] = [
  { id: 'pg1', species: 'penguin', fur: '#2b3a67', fur2: '#ffffff', dark: '#ff9f1c', scarf: '#ffca3a' },
  { id: 'pg2', species: 'penguin', fur: '#3d405b', fur2: '#ffffff', dark: '#ff9f1c', bow: '#8ac926' },
  { id: 'pg3', species: 'penguin', fur: '#45507a', fur2: '#ffffff', dark: '#ff9f1c', scarf: '#ff595e' },
];
const PS = 0.5; // Coco's scale
const PIPS = 0.46;
const BS = 0.62; // Bobo
const BOBO_X = 620;
const COCO_X = 900;
const PIP_X = 1210;
const TOWER_X = 1020;
const EDGE = 1450; // where the ice ends and the sea begins
const SNOWBANK: [number, number] = [50, f + 10];
const SCARF_WATER: [number, number] = [1720, f - 4];
const SURF = f - 6; // sea surface

// ── timeline anchors
const REVEAL = word('reveal', 2) - 0.05; // "penguin!"
const PRINTS0 = word('guess2', 8); // "walks like this"
const GROUP0 = S('home');
const SWIM_A0 = S('fact1b') - 0.25;
const SWIM_A1 = S('fact2') - 0.25;
const SLIDE_C = word('fact2', 4); // Coco slides
const BOBO_SLIDE = word('bobo_slide', 4); // "Wheee!"
const BONK = word('bobo_slide', 5); // "Oops!"
const EGG0 = S('fact3') - 0.25;
const EGG1 = S('story') - 0.3;
const PIP_IN = word('pip_in', 4);
const FALLS = word('pip_hm', 10); // "falling"
const BLOCKS = [word('build', 7), word('build2', 0), word('build3', 0)];
const WIND = word('wind', 1); // "whoosh!"
const SCARF_LAND = WIND + 1.7;
const WALK_EDGE = S('coco_go') + 0.6;
const DIVE = word('dive', 5) - 0.35; // "Splash!"
const SWIM_B0 = DIVE + 0.6;
const SWIM_B1 = S('got_it') - 0.5;
const GIVE = word('got_it', 2); // scarf handed over
const SLIDE_ALL = word('slide_all', 6) - 0.3; // "Wheee!"
const BOBO_JOIN = word('bobo_join', 3) - 0.2;
const WADDLE_END = S('end_waddle');
const END_IRIS = E('bye2') + 0.6;

type Scene = 'ice' | 'swim' | 'egg';
const sceneAt = (t: number): Scene =>
  within(t, SWIM_A0, SWIM_A1) || within(t, SWIM_B0, SWIM_B1) ? 'swim' : within(t, EGG0, EGG1) ? 'egg' : 'ice';

// Coco's feet path on the ice
const COCO_PATH: KF = [
  [0, COCO_X, f], [SLIDE_C - 0.1, COCO_X, f], [SLIDE_C + 1.6, 1330, f], [S('bobo_slide'), 1330, f], [S('bobo_slide') + 2.2, COCO_X, f],
  [WALK_EDGE, COCO_X, f], [WALK_EDGE + 1.8, 1400, f], [DIVE, 1400, f], [DIVE + 0.55, 1560, f + 40],
  [SWIM_B1, 1420, f], [S('got_it') + 0.2, 1420, f], [GIVE - 0.05, 1410, f], [S('lesson') + 0.4, 1410, f],
  [SLIDE_ALL - 0.4, 640, f], [SLIDE_ALL, 640, f], [SLIDE_ALL + 1.8, 1180, f], [S('again') - 0.5, 1180, f], [S('again') + 0.6, COCO_X, f],
];
const PIP_PATH: KF = [
  [0, 2200, f], [PIP_IN - 0.05, 2200, f], [PIP_IN + 1.6, PIP_X, f],
  [SLIDE_ALL - 0.4, PIP_X, f], [SLIDE_ALL - 0.2, PIP_X, f], [SLIDE_ALL + 1.8, 1400, f], [S('again') - 0.5, 1400, f], [S('again') + 0.6, PIP_X, f],
];
const BOBO_PATH: KF = [
  [0, BOBO_X, f], [BOBO_SLIDE - 0.1, BOBO_X, f], [BONK, 250, f], [S('fact3'), 250, f], [EGG0 + 0.01, BOBO_X, f],
  [BOBO_JOIN, BOBO_X, f], [BOBO_JOIN + 1.4, 920, f], [S('again') - 0.4, 920, f], [S('again') + 0.6, BOBO_X, f],
];
// who is lying on the tummy (sliding)?
const cocoLaid = (t: number) => within(t, SLIDE_C - 0.1, SLIDE_C + 2.0) || within(t, SLIDE_ALL - 0.1, SLIDE_ALL + 2.1) || within(t, S('a2'), E('a2') + 0.8);
const pipLaid = (t: number) => within(t, PIP_IN - 0.05, PIP_IN + 1.8) || within(t, SLIDE_ALL - 0.1, SLIDE_ALL + 2.1);
const boboLaid = (t: number) => within(t, BOBO_SLIDE - 0.1, BONK + 0.15) || within(t, BOBO_JOIN - 0.05, BOBO_JOIN + 1.6);

// ── director camera
const COCO_CU = { z: 1.6, x: COCO_X, y: f - 250 };
const BOBO_CU = { z: 1.5, x: BOBO_X + 30, y: f - 300 };
const PIP_CU = { z: 1.6, x: PIP_X, y: f - 240 };
const TWO_CP = { z: 1.3, x: (COCO_X + PIP_X) / 2, y: f - 260 };
const SHOTS: Shot[] = [
  { t: 0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.01 },
  { t: PRINTS0 - 0.2, z: 1.3, x: 760, y: f - 200, move: 'smooth', dur: 1.6, push: 0.02 },
  { t: REVEAL - 0.05, ...COCO_CU, move: 'snap', push: 0.01 },
  { t: S('bobo_hi') - 0.2, ...BOBO_CU, move: 'whip' },
  { t: S('home') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8, push: 0.015 },
  { t: S('sound_q') - 0.2, ...COCO_CU, move: 'whip', push: 0.01 },
  { t: S('sound_turn') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('sound_b') - 0.2, ...COCO_CU, move: 'snap' },
  { t: S('waddle_q') - 0.2, z: 1.15, x: 760, y: 600, move: 'smooth', dur: 0.8, push: 0.02 },
  { t: S('facts') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.7 },
  { t: S('fact1') + 1.0, ...COCO_CU, move: 'smooth', dur: 0.8 },
  { t: S('fly_try') - 0.1, ...BOBO_CU, move: 'whip' },
  { t: SWIM_A0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.02 },
  { t: SWIM_A1, z: 1.0, x: 960, y: 540, move: 'cut' },
  { t: S('bobo_slide') - 0.2, z: 1.2, x: 600, y: 600, move: 'smooth', dur: 0.6 },
  { t: BONK - 0.05, z: 1.5, x: 360, y: f - 240, move: 'snap' },
  { t: EGG0, z: 1.0, x: 960, y: 540, move: 'cut' },
  { t: word('fact3', 9), z: 1.5, x: 960, y: f - 160, move: 'smooth', dur: 1.0, push: 0.02 },
  { t: S('wow') - 0.2, z: 1.5, x: 560, y: f - 300, move: 'whip' },
  { t: EGG1, z: 1.0, x: 960, y: 540, move: 'cut' },
  { t: S('problem') - 0.2, ...COCO_CU, move: 'smooth', dur: 1.2, push: 0.03 },
  { t: S('bobo_ask') - 0.2, ...BOBO_CU, move: 'whip' },
  { t: S('shy') - 0.2, ...COCO_CU, move: 'whip' },
  { t: S('ask') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.7 },
  { t: S('idea') - 0.2, ...BOBO_CU, move: 'whip', push: 0.01 },
  { t: S('pip_in') - 0.2, z: 1.1, x: 1150, y: 560, move: 'smooth', dur: 0.8 },
  { t: S('pip_hm') - 0.2, ...PIP_CU, move: 'snap', push: 0.01 },
  { t: FALLS - 0.4, z: 1.3, x: TOWER_X + 60, y: f - 230, move: 'smooth', dur: 0.5 },
  { t: S('breath') - 0.2, ...COCO_CU, move: 'smooth', dur: 0.8, push: 0.03 },
  { t: S('breath_turn') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.7 },
  { t: S('coco_hello') - 0.2, ...TWO_CP, move: 'smooth', dur: 0.8 },
  { t: S('pip_yes') - 0.2, ...PIP_CU, move: 'snap' },
  { t: S('build') - 0.2, z: 1.3, x: TOWER_X, y: f - 260, move: 'smooth', dur: 0.8, push: 0.02 },
  { t: S('tower') - 0.2, ...PIP_CU, move: 'snap' },
  { t: S('wind') - 0.2, z: 1.0, x: 1180, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('pip_sad') - 0.2, ...PIP_CU, move: 'whip' },
  { t: S('help_q') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.7 },
  { t: S('coco_go') - 0.2, ...COCO_CU, move: 'snap' },
  { t: WALK_EDGE, z: 1.2, x: 1360, y: 600, move: 'smooth', dur: 1.4 },
  { t: SWIM_B0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.02 },
  { t: SWIM_B1, z: 1.2, x: 1300, y: 620, move: 'cut' },
  { t: S('pip_yay') - 0.2, z: 1.45, x: 1330, y: f - 250, move: 'smooth', dur: 0.6 },
  { t: S('lesson') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 },
  { t: S('bobo_join') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.4 },
  { t: S('again') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 },
  { t: S('a4') - 0.1, ...COCO_CU, move: 'snap' },
  { t: E('a4') + 0.6, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('a5') - 0.1, ...COCO_CU, move: 'snap' },
  { t: E('a5') + 0.6, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('c1') - 0.1, ...TWO_CP, move: 'smooth', dur: 0.6, push: 0.02 },
  { t: S('c_turn') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
];
const PUNCHES = [REVEAL, BONK, ...BLOCKS, DIVE + 0.5, GIVE, S('coco_yay')];
const HITS: Hit[] = [{ at: BONK, amp: 12, dur: 0.35 }, { at: REVEAL, amp: 8, dur: 0.3 }];

// ── the ICE set (drawn here: no painted place has snow) — sky, far icebergs, the ice shelf, the sea, falling snow
const Snow: React.FC<{ t: number; n?: number }> = ({ t, n = 36 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const sp = 26 + (i % 4) * 9;
      const y = ((i * 211 + t * sp) % (H + 40)) - 20;
      const x = ((i * 347) % W) + Math.sin(t * 0.7 + i) * 26;
      return <circle key={i} cx={x} cy={y} r={4 + (i % 3) * 2.5} fill="#ffffff" opacity={0.85} />;
    })}
  </g>
);
const IceSet: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <defs>
      <linearGradient id="d46sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#9fd8ff" />
        <stop offset="0.6" stopColor="#d4efff" />
        <stop offset="1" stopColor="#f2fbff" />
      </linearGradient>
      <linearGradient id="d46sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4cc9f0" />
        <stop offset="1" stopColor="#1971b8" />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#d46sky)" />
    <Sun x={250} y={160} r={70} t={t} />
    {/* far icebergs + the sea at the horizon */}
    <rect x={0} y={f - 210} width={W} height={260} fill="#7fd0f2" />
    <Vol kind="slope">
      <path d={`M 380,${f - 200} L 520,${f - 420} L 600,${f - 360} L 700,${f - 470} L 880,${f - 200} Z`} fill="#e6f6ff" {...kst(6)} />
      <path d={`M 1300,${f - 200} L 1440,${f - 380} L 1560,${f - 330} L 1720,${f - 200} Z`} fill="#dcf2ff" {...kst(6)} />
    </Vol>
    <path d={`M 520,${f - 420} L 560,${f - 300} L 600,${f - 360}`} fill="none" stroke="#ffffff" strokeWidth={8} opacity={0.7} />
    {/* the sea on the right */}
    <rect x={EDGE - 40} y={SURF} width={W - EDGE + 40} height={H - SURF} fill="url(#d46sea)" />
    <path d={`M ${EDGE - 40},${SURF} ` + Array.from({ length: 10 }).map((_, i) => `q 24,${-10 + Math.sin(t * 2 + i) * 4} 48,0`).join(' ')} fill="none" stroke="#ffffff" strokeWidth={6} opacity={0.75} />
    <g transform={`translate(1820,${SURF + Math.sin(t * 1.3) * 5})`}>
      <Vol kind="slope"><path d="M -90,0 L -40,-80 L 30,-60 L 90,0 Z" fill="#f2fbff" {...kst(6)} /></Vol>
    </g>
    {/* the ice shelf */}
    <Vol kind="slope">
      <path d={`M -20,${f - 50} Q 400,${f - 80} 900,${f - 60} Q 1250,${f - 50} ${EDGE},${f - 30} L ${EDGE + 30},${H + 20} L -20,${H + 20} Z`} fill="#f4fbff" {...kst(7)} />
    </Vol>
    <path d={`M ${EDGE},${f - 30} L ${EDGE + 30},${H + 20}`} stroke="#9fd8ff" strokeWidth={14} opacity={0.6} />
    {[[300, f + 70], [760, f + 110], [1180, f + 80]].map(([x, y], i) => (
      <ellipse key={i} cx={x} cy={y} rx={120} ry={14} fill="#cdeaff" opacity={0.7} />
    ))}
    {/* the snowbank (Bobo's soft landing) */}
    <Vol>
      <ellipse cx={SNOWBANK[0]} cy={SNOWBANK[1]} rx={170} ry={130} fill="#ffffff" {...kst(7)} />
    </Vol>
  </g>
);
const Block: React.FC<{ x: number; y: number; rot?: number; s?: number }> = ({ x, y, rot = 0, s = 1 }) =>
  s <= 0 ? null : (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
      <Vol><rect x={-60} y={-80} width={120} height={80} rx={14} fill="#eaf7ff" {...kst(6)} /></Vol>
      <path d="M -40,-58 L 10,-58" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.9} />
    </g>
  );
const Egg: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <Vol><ellipse cx={0} cy={-46} rx={38} ry={48} fill="#fff8e7" {...kst(6)} /></Vol>
  </g>
);
const Scarf: React.FC<{ x: number; y: number; rot?: number; s?: number }> = ({ x, y, rot = 0, s = 1 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <Vol>
      <path d="M -80,-14 Q 0,10 80,-14 L 84,14 Q 0,40 -84,14 Z" fill="#4cc9f0" {...kst(6)} />
      <path d="M 30,16 L 52,80 L 22,74 L 12,20 Z" fill="#4cc9f0" {...kst(6)} />
    </Vol>
  </g>
);
// lay a Critter on its tummy (rot +80 = head to the right)
const Laid: React.FC<{ on: boolean; x: number; y: number; s: number; rot: number; children: React.ReactNode }> = ({ on, x, y, s, rot, children }) =>
  on ? <g transform={`translate(0,${120 * s}) rotate(${rot} ${x} ${y - 200 * s})`}>{children}</g> : <>{children}</>;

export default function KidsAnimals046() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const shake = shakeOf(t, HITS);
  const scene = sceneAt(t);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);

  // waddle-in-place moments (everyone)
  const waddling = within(t, word('waddle_q', 6), E('waddle_why') + 0.6) || within(t, WADDLE_END, E('end_waddle') + 1.0);
  const waddleDX = (k: number) => (waddling ? Math.sin(t * 2.4 + k) * 46 : 0);

  // ── Coco
  const [cx0, cy0] = lerp2(t, COCO_PATH);
  const cx = cx0 + waddleDX(0);
  const cocoWalk = (moving(t, COCO_PATH) && !cocoLaid(t)) || waddling;
  const revealHop = arc(t, REVEAL, REVEAL + 0.6, 170);
  const diveArc = arc(t, DIVE, DIVE + 0.55, 120);
  const outHop = arc(t, SWIM_B1, SWIM_B1 + 0.5, 110);
  const happyHop = within(t, S('coco_yay'), E('coco_yay') + 0.4) || within(t, S('c1'), E('c3') + 0.4) ? Math.abs(Math.sin(t * 7)) * 24 : 0;
  const cy = cy0 - revealHop - diveArc - outHop;
  const cocoHidden = t < REVEAL || within(t, DIVE + 0.5, SWIM_B1);
  const lonely = within(t, S('problem'), S('idea')) || within(t, S('breath'), S('coco_hello'));
  const flapC = within(t, word('fact1', 4), S('fly_try') + 0.4) || within(t, S('a1'), E('a1')) || within(t, S('bye'), E('bye'));
  const cocoArm: CArm = flapC ? { a: 100 + Math.sin(t * 16) * 40 } : within(t, S('hello'), E('hello')) || t >= S('bye') ? 'wave'
    : within(t, BLOCKS[0] - 0.3, E('build3')) ? 'hold' : within(t, S('coco_go'), E('coco_go')) || happyHop > 0 ? 'up' : 'down';
  const cocoExpr: KExpr =
    lonely ? (within(t, S('feel'), S('idea')) ? 'sad' : within(t, S('breath'), S('coco_hello')) ? 'oops' : 'sad')
    : t < REVEAL + 0.8 ? 'surprised'
    : within(t, S('breath'), S('coco_hello')) ? 'think'
    : within(t, S('sound_a'), E('sound_a')) || within(t, S('sound_b'), E('sound_b')) || within(t, S('a5'), E('a5')) ? 'laugh'
    : cocoLaid(t) || happyHop > 0 ? 'laugh'
    : within(t, S('wind'), S('coco_go')) ? 'surprised'
    : talks('coco') ? 'happy' : 'smile';
  const breathing = within(t, S('breath'), E('breath_turn') + 1.5) ? Math.sin(((t - S('breath')) / 3.0) * Math.PI * 2) * 0.12 : 0;
  const cocoLook: [number, number] = within(t, S('problem'), S('bobo_ask')) ? [-1, -0.2] : within(t, PIP_IN, S('lesson')) ? [0.8, 0] : [0, 0.1];

  // ── Pip
  const [px0, py] = lerp2(t, PIP_PATH);
  const px = px0 + waddleDX(1.4);
  const hasScarf = t < WIND + 0.1 || t >= GIVE + 0.3;
  const pipExpr: KExpr =
    within(t, S('pip_hm'), S('coco_hello')) ? (t > FALLS ? 'sad' : 'think')
    : within(t, S('pip_sad'), S('got_it')) ? 'sad'
    : within(t, S('wind'), S('pip_sad')) ? 'surprised'
    : within(t, S('tower'), E('tower') + 0.5) || within(t, S('pip_yay'), E('coco_yay') + 0.5) || pipLaid(t) ? 'laugh'
    : talks('pip') ? 'happy' : 'smile';
  const pipArm: CArm = within(t, BLOCKS[0] - 0.3, E('build3')) ? 'hold' : within(t, S('tower'), E('tower')) || within(t, S('pip_yay'), E('coco_yay')) ? 'up'
    : within(t, S('pip_sad'), E('pip_sad')) ? 'up' : t >= S('bye') ? 'wave' : talks('pip') ? 'wave' : 'down';
  const pipHop = within(t, S('c1'), E('c3') + 0.4) || within(t, S('coco_yay'), E('coco_yay') + 0.4) ? Math.abs(Math.sin(t * 7 + 1)) * 24 : 0;

  // ── Bobo
  const [bx0, by] = lerp2(t, BOBO_PATH);
  const bx = bx0 + waddleDX(2.8);
  const shiver = within(t, word('bobo_hi', 5), E('bobo_hi') + 0.3) ? Math.sin(t * 60) * 4 : 0;
  const boboExpr: KExpr =
    within(t, BONK, BONK + 1.8) ? 'oops'
    : within(t, S('fly_try'), E('fly_try')) ? 'surprised'
    : within(t, S('wow'), E('wow') + 0.5) ? 'wow'
    : boboLaid(t) ? 'laugh'
    : within(t, S('problem'), S('bobo_ask')) ? 'sad'
    : within(t, S('pip_yay'), E('coco_yay') + 0.5) || within(t, S('c1'), E('c3') + 0.4) ? 'laugh'
    : talks('bobo') ? 'happy' : 'smile';
  const boboArmR: CArm = within(t, S('idea'), E('idea')) ? 'point' : talks('bobo') ? 'wave' : within(t, S('coco_yay'), E('coco_yay') + 0.5) ? 'up' : 'down';
  const boboArmL: CArm = shiver ? 'hug' : within(t, S('coco_yay'), E('coco_yay') + 0.5) ? 'up' : 'down';
  const boboHop = within(t, S('c1'), E('c3') + 0.4) ? Math.abs(Math.sin(t * 7 + 2)) * 22 : 0;

  // the snow pile (hook) + the footprints
  const pileS = t < REVEAL ? 1 : 1 - prog(t, REVEAL, REVEAL + 0.25);
  const prints = Array.from({ length: 7 }).map((_, i) => ({ x: 330 + i * 80, y: f + 26 + (i % 2) * 18, at: PRINTS0 + i * 0.28 }));

  // the snow tower: Pip's wobbly 2-block try, then 3 blocks built together
  const fallP = prog(t, FALLS - 0.2, FALLS + 0.5);

  // the scarf in the world
  const scarfFly = within(t, WIND, SCARF_LAND);
  const scarfOnWater = within(t, SCARF_LAND, DIVE + 0.5);
  const scarfHeld = within(t, SWIM_B1, GIVE + 0.3);

  return (
    <>
      <ActionStage cam={cam} shake={shake} blur={cam.blur}>
        {scene === 'swim' ? (
          <g>
            <Underwater w={W} h={H} t={t} />
            {/* the bright surface overhead */}
            <rect x={0} y={0} width={W} height={60} fill="#bff0ff" opacity={0.6} />
            {(() => {
              // fact 1 (swim across twice) · the dive (swim up to the scarf on the surface)
              const a = t < SWIM_A1 ? SWIM_A0 : SWIM_B0;
              const b = t < SWIM_A1 ? SWIM_A1 : SWIM_B1;
              const p = prog(t, a, b);
              const fact = t < SWIM_A1;
              const x = fact ? -200 + p * 2300 : 200 + EASE_INOUT(Math.min(1, p * 1.4)) * 1300;
              const y = fact ? 560 + Math.sin(t * 2.4) * 110 : 760 - EASE_INOUT(Math.min(1, p * 1.4)) * 560;
              const rot = fact ? 80 + Math.cos(t * 2.4) * 14 : 70 - EASE_INOUT(Math.min(1, p * 1.4)) * 40;
              const grabbed = !fact && p > 0.72;
              return (
                <g>
                  {!fact && !grabbed && <Scarf x={1560} y={60} rot={Math.sin(t * 2) * 6} />}
                  <Bubbles t={t} x={x - 160} y={y + 60} n={6} h={260} />
                  <MotionLines t={t} from={a} to={b} x={x - 200} y={y} dir={180} n={3} len={90} spread={40} />
                  <g transform={`rotate(${rot} ${x} ${y})`}>
                    <Critter spec={COCO} x={x} y={y + 200 * PS} scale={PS} expr="laugh" mouth={lipSync(VO, 'coco', t)} armL={{ a: 60 + Math.sin(t * 14) * 30 }} armR={{ a: 60 + Math.sin(t * 14 + 1) * 30 }} shadow={false} idle={false} />
                  </g>
                  {grabbed && <Scarf x={x + 60} y={y - 40} rot={rot - 90} s={0.8} />}
                </g>
              );
            })()}
            <StageWord t={t} at={word('fact1b', 9)} until={SWIM_A1} text="SWISH! SWISH!" x={960} y={200} size={90} color="#ffca3a" rot={-6} />
            <StageWord t={t} at={word('dive', 6)} until={SWIM_B1} text="SWISH! SWISH!" x={700} y={220} size={90} color="#ffca3a" rot={6} />
          </g>
        ) : (
          <g>
            <IceSet t={t} />
            {/* the other penguins playing at the back (hop · slide · hop) */}
            {t >= GROUP0 && scene === 'ice' && (
              <g opacity={prog(t, GROUP0, GROUP0 + 0.6)}>
                {KIDS.map((k, i) => {
                  const gx = 250 + i * 110 + (i === 1 ? Math.sin(t * 0.9) * 80 : 0);
                  return (
                    <Critter key={k.id} spec={k} x={gx} y={f - 100} scale={0.22} expr={i === 1 ? 'laugh' : 'happy'} hop={Math.abs(Math.sin(t * 3 + i * 1.7)) * (i === 1 ? 0 : 40)}
                      armL={{ a: 120 + Math.sin(t * 8 + i) * 30 }} armR={{ a: 120 + Math.sin(t * 8 + i + 1) * 30 }} walking={i === 1} walk={t * 2} />
                  );
                })}
              </g>
            )}
            {scene === 'egg' ? (
              <g>
                {/* the emperor dad with the egg on his feet */}
                <Critter spec={DAD} x={960} y={f} scale={0.8} expr="smile" look={[0, 0.6]} armL="hug" armR="hug" />
                <Egg x={960} y={f - 18} s={0.9} />
                <path d={`M ${960 - 70},${f - 70} Q 960,${f - 110} ${960 + 70},${f - 70}`} fill="#ffffff" {...kst(6)} />
                <Reaction kind="heart" t={t} at={word('fact3', 8)} until={EGG1} x={1080} y={f - 600} s={0.8} />
                <Critter spec={BOBO_HERO} x={560} y={f} scale={BS} expr={boboExpr} look={[0.6, 0.2]} mouth={lipSync(VO, 'bobo', t)} armL={within(t, S('wow'), E('wow')) ? 'up' : 'down'} armR="point" />
                <Critter spec={COCO} x={1380} y={f} scale={PS} expr="happy" look={[-0.6, 0.2]} />
              </g>
            ) : (
              <g>
                {/* footprints + the snow pile hiding Coco (the hook) */}
                {t < REVEAL + 0.4 && prints.map((p, i) => t >= p.at && (
                  <g key={i} transform={`translate(${p.x},${p.y})`} opacity={1 - prog(t, REVEAL, REVEAL + 0.4)}>
                    {[-12, 0, 12].map((a) => <path key={a} d={`M 0,0 l ${a},-26`} stroke="#9fb7d0" strokeWidth={7} strokeLinecap="round" />)}
                  </g>
                ))}
                {/* Pip's tower (behind the cast) */}
                {t >= PIP_IN + 1.4 && t < BLOCKS[0] - 0.2 && (
                  <g>
                    <Block x={TOWER_X} y={f} s={popIn(t, PIP_IN + 1.4)} />
                    {t < FALLS + 0.5 ? (
                      <Block x={TOWER_X + fallP * 110} y={f - 80 + fallP * 80} rot={Math.sin(t * 8) * (t > FALLS - 1.2 ? 6 : 0) + fallP * 80} s={popIn(t, PIP_IN + 1.6)} />
                    ) : (
                      <Block x={TOWER_X + 130} y={f} rot={80} />
                    )}
                  </g>
                )}
                {t >= BLOCKS[0] - 0.2 && t < S('again') - 0.6 && (
                  <g>
                    {BLOCKS.map((at, i) => <Block key={i} x={TOWER_X} y={f - i * 80} s={popIn(t, at)} />)}
                    {t >= BLOCKS[2] + 0.4 && <g transform={`translate(${TOWER_X},${f - 260})`}><path d="M 0,0 L 0,-80" stroke={KINK} strokeWidth={6} /><path d="M 0,-80 L 60,-64 L 0,-48 Z" fill="#ff595e" {...kst(5)} /></g>}
                  </g>
                )}
                {/* Bobo */}
                <Laid on={boboLaid(t)} x={bx} y={by} s={BS} rot={bx0 > BOBO_X - 1 && t > BOBO_JOIN - 0.1 ? 80 : -80}>
                  <Critter spec={BOBO_HERO} x={bx + shiver} y={by} scale={BS} expr={boboExpr} look={[0.6, -0.1]} mouth={lipSync(VO, 'bobo', t)}
                    armL={boboLaid(t) ? { a: 160 } : boboArmL} armR={boboLaid(t) ? { a: 160 } : boboArmR} hop={boboHop}
                    walking={(moving(t, BOBO_PATH) && !boboLaid(t)) || waddling} walk={t * 2.2} shadow={!boboLaid(t)} idle={!boboLaid(t)} />
                </Laid>
                {/* Pip */}
                {px < W + 200 && (
                  <Laid on={pipLaid(t)} x={px} y={py} s={PIPS} rot={t < PIP_IN + 2 ? -80 : 80}>
                    <Critter spec={hasScarf ? PIP_SCARF : PIP_BARE} x={px} y={py} scale={PIPS} expr={pipExpr} look={within(t, S('wind'), S('pip_sad')) ? [1, 0.2] : [-0.7, 0]} mouth={lipSync(VO, 'pip', t)}
                      armL={pipLaid(t) ? { a: 160 } : pipArm} armR={pipLaid(t) ? { a: 160 } : pipArm} hop={pipHop} walking={waddling} walk={t * 2.2 + 0.5} shadow={!pipLaid(t)} idle={!pipLaid(t)} />
                  </Laid>
                )}
                {/* Coco */}
                {!cocoHidden && (
                  <Laid on={cocoLaid(t)} x={cx} y={cy} s={PS} rot={80}>
                    <Critter spec={COCO} x={cx} y={cy} scale={PS} expr={cocoExpr} look={cocoLook} mouth={lipSync(VO, 'coco', t)}
                      armL={cocoLaid(t) ? { a: 160 } : cocoArm} armR={cocoLaid(t) ? { a: 160 } : within(t, GIVE - 0.6, GIVE + 0.3) ? 'point' : cocoArm}
                      hop={happyHop} squash={breathing} walking={cocoWalk} walk={t * 2.2} shadow={!cocoLaid(t) && !within(t, DIVE, SWIM_B1 + 0.5)} idle={!cocoLaid(t)} />
                  </Laid>
                )}
                {t < REVEAL + 0.25 && (
                  <g>
                    {/* Coco's little tail wags out of the pile */}
                    {t >= word('guess2', 11) && <path d={`M ${COCO_X + 150},${f - 40} L ${COCO_X + 200 + Math.sin(t * 9) * 14},${f - 20} L ${COCO_X + 150},${f - 4} Z`} fill={COCO.fur} {...kst(5)} />}
                    <g transform={`translate(${COCO_X},${f + 30}) scale(${pileS})`}>
                      <Vol><path d="M -220,0 Q -230,-200 -90,-300 Q 0,-360 90,-300 Q 230,-200 220,0 Z" fill="#ffffff" {...kst(8)} /></Vol>
                      <ellipse cx={-80} cy={-240} rx={40} ry={18} fill="#ffffff" opacity={0.8} transform="rotate(-30 -80 -240)" />
                    </g>
                  </g>
                )}
                {/* the scarf: blown away · floating · in Coco's flipper */}
                {scarfFly && (() => {
                  const p = prog(t, WIND, SCARF_LAND);
                  const x = PIP_X + (SCARF_WATER[0] - PIP_X) * EASE_INOUT(p);
                  const y = f - 250 - Math.sin(p * Math.PI) * 220 + p * 246;
                  return <Scarf x={x} y={y} rot={p * 540} s={0.7} />;
                })()}
                {scarfOnWater && <Scarf x={SCARF_WATER[0]} y={SCARF_WATER[1] + Math.sin(t * 2.2) * 5} rot={Math.sin(t * 1.6) * 6} s={0.7} />}
                {scarfHeld && <Scarf x={cx + 70} y={cy - 170} rot={-20} s={0.6} />}
                {/* a front sea layer: Coco sinks behind it when she dives */}
                <rect x={EDGE} y={SURF + 20} width={W - EDGE} height={H - SURF - 20} fill="#1f88c9" opacity={0.55} />
                {/* the egg in the remember round */}
                {within(t, S('q3'), S('q4') - 0.3) && <Egg x={cx + 70} y={f} s={0.55 * popIn(t, S('q3'))} />}
              </g>
            )}
            <Snow t={t} />
          </g>
        )}
        {/* FX (stage space) */}
        <Dust t={t} at={REVEAL} x={COCO_X} y={f} s={1.6} />
        <ImpactStar t={t} at={REVEAL} x={COCO_X} y={f - 200} s={0.9} />
        <Dust t={t} at={BONK} x={SNOWBANK[0] + 120} y={f - 40} s={1.3} />
        <Dust t={t} at={DIVE + 0.5} x={1560} y={SURF} s={1.4} />
        <Dust t={t} at={SWIM_B1} x={1450} y={SURF} s={1.2} />
        {BLOCKS.map((at, i) => <Dust key={i} t={t} at={at} x={TOWER_X} y={f - i * 80} s={0.6} />)}
        <Dust t={t} at={FALLS + 0.3} x={TOWER_X + 130} y={f} s={0.7} />
        {scene === 'ice' && (
          <g>
            <MotionLines t={t} from={SLIDE_C} to={SLIDE_C + 1.6} x={cx - 160} y={cy - 60} dir={180} n={3} len={90} spread={30} />
            <MotionLines t={t} from={BOBO_SLIDE} to={BONK} x={bx + 200} y={by - 70} dir={0} n={3} len={90} spread={30} />
            <MotionLines t={t} from={WIND - 0.2} to={WIND + 1.2} x={1000} y={f - 330} dir={180} n={4} len={140} spread={60} />
            <MotionLines t={t} from={SLIDE_ALL} to={SLIDE_ALL + 1.8} x={cx - 160} y={cy - 60} dir={180} n={3} len={90} spread={30} />
            <MotionLines t={t} from={BOBO_JOIN} to={BOBO_JOIN + 1.4} x={bx - 200} y={by - 70} dir={180} n={3} len={90} spread={30} />
            <StageWord t={t} at={word('bobo_hi', 5)} until={E('bobo_hi') + 0.3} text="BRRR!" x={BOBO_X + 30} y={f - 500} size={80} color="#4cc9f0" rot={-8} />
            <StageWord t={t} at={word('sound_a', 0)} until={E('sound_a') + 0.5} text="SQUAWK!" x={COCO_X + 10} y={f - 450} size={80} color="#ff9f1c" rot={-6} />
            <StageWord t={t} at={word('sound_b', 0)} until={E('sound_b') + 0.6} text="SQUAWK!" x={COCO_X + 10} y={f - 450} size={80} color="#ff9f1c" rot={6} />
            <StageWord t={t} at={word('a5', 0)} until={E('a5') + 0.6} text="SQUAWK!" x={COCO_X + 10} y={f - 450} size={80} color="#ff9f1c" rot={6} />
            <StageWord t={t} at={word('waddle_q', 6)} until={S('waddle_turn') - 0.1} text="WADDLE! WADDLE!" x={760} y={f - 520} size={80} color="#ffca3a" rot={-5} />
            <StageWord t={t} at={SLIDE_C + 0.2} until={SLIDE_C + 2.0} text="WHEEE!" x={1150} y={f - 330} size={100} color="#ffca3a" rot={-6} />
            <StageWord t={t} at={BONK} until={BONK + 1.3} text="BONK!" x={420} y={f - 380} size={100} color="#ff595e" rot={-8} />
            <StageWord t={t} at={WIND} until={WIND + 1.4} text="WHOOSH!" x={1250} y={f - 520} size={100} color="#4cc9f0" rot={-6} />
            <StageWord t={t} at={DIVE + 0.45} until={DIVE + 0.65} text="SPLASH!" x={1560} y={f - 300} size={100} color="#4cc9f0" rot={6} />
            <StageWord t={t} at={SWIM_B1} until={SWIM_B1 + 1.2} text="SPLASH!" x={1460} y={f - 380} size={100} color="#4cc9f0" rot={-6} />
            <StageWord t={t} at={SLIDE_ALL + 0.1} until={SLIDE_ALL + 2.0} text="WHEEE!" x={900} y={f - 330} size={100} color="#ffca3a" rot={-6} />
            <StageWord t={t} at={BOBO_JOIN + 0.1} until={BOBO_JOIN + 1.8} text="WHEEE!" x={700} y={f - 420} size={90} color="#ff9f1c" rot={6} />
            <StageWord t={t} at={S('end_waddle')} until={E('end_waddle') + 0.8} text="WADDLE! WADDLE!" x={900} y={f - 560} size={80} color="#ffca3a" rot={-5} />
            {/* reactions */}
            <Reaction kind="?" t={t} at={E('guess2') + 0.1} until={REVEAL} x={COCO_X + 230} y={f - 420} s={0.7} />
            <Reaction kind="!" t={t} at={REVEAL + 0.1} until={REVEAL + 1.4} x={BOBO_X} y={f - 560} s={0.7} />
            <Reaction kind="!" t={t} at={S('fly_try')} until={E('fly_try') + 0.6} x={BOBO_X} y={f - 560} s={0.7} />
            <Reaction kind="stars" t={t} at={BONK} until={BONK + 1.8} x={250} y={f - 330} s={0.8} />
            <Reaction kind="cloud" t={t} at={S('feel')} until={S('idea')} x={COCO_X} y={f - 480} s={0.6} />
            <Reaction kind="idea" t={t} at={S('idea')} until={E('idea') + 0.4} x={BOBO_X} y={f - 580} s={0.8} />
            <Reaction kind="sweat" t={t} at={S('breath')} until={S('coco_hello')} x={COCO_X - 80} y={f - 400} s={0.6} />
            <Reaction kind="cloud" t={t} at={FALLS + 0.2} until={S('coco_hello')} x={PIP_X} y={f - 440} s={0.55} />
            <Reaction kind="!" t={t} at={WIND + 0.1} until={S('help_q')} x={PIP_X} y={f - 440} s={0.6} />
            <Reaction kind="heart" t={t} at={S('pip_yay')} until={E('coco_yay') + 0.6} x={1330} y={f - 470} s={0.8} />
          </g>
        )}
      </ActionStage>

      {/* screen-space */}
      <ThinkTimer t={t} from={E('guess2') + 0.1} to={REVEAL - 0.05} x={1760} y={190} r={90} label="WHO?" />
      <PopText t={t} at={REVEAL + 0.15} until={S('hello')} text="A PENGUIN!" y={170} size={140} color="#4cc9f0" />
      <PopText t={t} at={E('sound_turn') - 0.6} until={S('sound_b') - 0.1} text="YOUR TURN!" y={170} size={120} color="#ffffff" />
      <PopText t={t} at={S('waddle_turn')} until={S('waddle_why') - 0.1} text="WADDLE WITH US!" y={170} size={100} color="#ffca3a" />
      <PopText t={t} at={S('facts') + 0.2} until={S('fact1') - 0.1} text="3 PENGUIN FACTS!" y={170} size={110} color="#4cc9f0" />
      <PopText t={t} at={S('fact1')} until={SWIM_A1} text="1  THEY SWIM, NOT FLY" y={170} size={90} color="#4cc9f0" />
      <PopText t={t} at={S('fact2')} until={S('bobo_slide') - 0.1} text="2  TUMMY SLIDES" y={170} size={90} color="#ffca3a" />
      <PopText t={t} at={S('fact3')} until={E('wow') + 0.4} text="3  EGG ON DAD'S FEET" y={170} size={90} color="#ff8fab" />
      <PopText t={t} at={S('feel') + 0.4} until={S('bobo_ask') - 0.1} text="LONELY" y={170} size={120} color="#a0c4ff" />
      <ThinkTimer t={t} from={onBeat(E('ask') + 0.1)} to={S('idea') - 0.1} x={1760} y={190} r={90} label="HOW?" />
      <PopText t={t} at={word('idea', 3)} until={E('idea') + 0.8} text="HELLO! CAN I PLAY?" y={170} size={100} color="#ff8fab" />
      <PopText t={t} at={E('breath_turn') - 1.6} until={S('coco_hello') - 0.1} text="BREATHE IN… AND OUT" y={170} size={90} color="#ffffff" />
      {BLOCKS.map((at, i) => (
        <PopText key={i} t={t} at={at - 0.05} until={i < 2 ? BLOCKS[i + 1] - 0.05 : S('tower')} text={String(i + 1)} y={170} size={170} color={['#ff595e', '#ffca3a', '#4cc9f0'][i]} />
      ))}
      <PopText t={t} at={S('tower')} until={E('tower') + 1.0} text="TOGETHER!" y={170} size={120} color="#52b788" />
      <ThinkTimer t={t} from={onBeat(E('help_q') + 0.1)} to={S('coco_go') - 0.1} x={1760} y={190} r={90} label="WHO?" />
      <PopText t={t} at={S('pip_yay')} until={E('coco_yay') + 0.6} text="BEST FRIENDS!" y={170} size={120} color="#ff8fab" />
      <PopText t={t} at={word('lesson', 4)} until={S('slide_all') - 0.2} text="HELLO · PLAY · HELP" y={170} size={100} color="#ffca3a" />
      <PopText t={t} at={S('again') + 0.2} until={S('q1') - 0.1} text="LET'S REMEMBER!" y={170} size={110} color="#ffca3a" />
      {(['q1', 'q2', 'q3', 'q4', 'q5'] as const).map((q) => {
        const a = ({ q1: 'a1', q2: 'a2', q3: 'a3', q4: 'a4', q5: 'a5' } as const)[q];
        return <ThinkTimer key={q} t={t} from={onBeat(E(q) + 0.1)} to={S(a) - 0.1} x={1760} y={190} r={90} label="THINK!" />;
      })}
      <PopText t={t} at={S('a1')} until={S('q2') - 0.2} text="NO! THEY SWIM!" y={170} size={120} color="#4cc9f0" />
      <PopText t={t} at={S('a2')} until={S('q3') - 0.2} text="ON THEIR TUMMIES!" y={170} size={110} color="#ffca3a" />
      <PopText t={t} at={S('a3')} until={S('q4') - 0.2} text="ON THEIR FEET!" y={170} size={120} color="#ff8fab" />
      <PopText t={t} at={S('a4')} until={S('q5') - 0.2} text="HELLO! CAN I PLAY?" y={170} size={100} color="#ff8fab" />
      <PopText t={t} at={S('a5')} until={S('chant') - 0.2} text="SQUAWK!" y={170} size={140} color="#ff9f1c" />
      <PopText t={t} at={S('c1')} until={S('c2') - 0.1} text="SAY HELLO!" y={170} size={120} color="#ff8fab" />
      <PopText t={t} at={S('c2')} until={S('c3') - 0.1} text="PLAY TOGETHER!" y={170} size={120} color="#ffca3a" />
      <PopText t={t} at={S('c3')} until={S('c_turn') - 0.1} text="HELP EACH OTHER!" y={170} size={110} color="#52b788" />
      <PopText t={t} at={E('c_turn') - 0.2} until={S('end_waddle') - 0.1} text="YOUR TURN!" y={170} size={120} color="#ffffff" />
      <PopText t={t} at={S('bye')} until={END_IRIS} text="SEE YOU NEXT TIME!" y={170} size={100} color="#4cc9f0" />
      <Confetti t={t} at={REVEAL + 0.1} y={420} />
      <Confetti t={t} at={S('tower')} y={420} />
      <Confetti t={t} at={S('coco_yay')} y={420} />
      <Confetti t={t} at={S('c3')} y={420} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <SparksIntro t={t} at={0} cast={{ kids: [MILA_HERO, LEO_HERO], buddy: BOBO_HERO }} />
      <StarWipe t={t} at={END_IRIS} dur={0.5} hold={5} color="#2b3a67" x={W / 2} y={H * 0.45} />
    </>
  );
}
