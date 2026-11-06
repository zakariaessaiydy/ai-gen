// TINY SPARKS · Day 64 · 📚 Moral Stories #5 — "The Lion Who Learned Humility" (LONG 16:9, 5:08)
// kids-shorts/tiny-sparks/morals/day-064-the-lion-who-learned-humility. Cues from VO via K (keys.gen.ts).
// WANT → WRONG CHOICE → FEELING → KIND CHOICE → HAPPY ENDING → THE MORAL. An original retelling of the lion-and-the-
// mouse fable (public domain) in the jungle painting: Sunny the lion boasts (roar, your turn) and won't play hide and seek
// — "you're too small, little mouse" → Pippa feels left out (close-up) → think timer: was Sunny kind? → he struts off,
// nose up, into a sticky tangly bush → stuck by the mane → Bobo pulls (heave, ho), Kiki swings down — too tight → think
// timer: who could help? → Pippa nibbles the vines, one, two, three (count with her) → snap, free → the sorry feeling →
// "I'm sorry … thank you" → humble = you don't have to be the best → hide and seek for everyone (Pippa behind a flower,
// Sunny behind a TINY leaf, Kiki up the tree, Bobo's ears over a rock) → the moral "Big or small, we need each other"
// → LET'S REMEMBER (5 questions) → chant → bye + star iris.
import React from 'react';
import { Critter, type CArm, type CritterSpec } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR } from '../../lib/kids/sets';
import { Backdrop } from '../../lib/kids/places';
import { AnswerMark, Confetti, KidsCaptions, PopText, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import {
  ActionStage, Dust, ImpactStar, MotionLines, Reaction, SparksIntro, StageWord, StarWipe, StrainLines, directorCam, onBeat, shakeOf,
  type Hit, type Shot,
} from '../../lib/kids/energy';
import { EASE_INOUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsMorals064', durationInSeconds: 308.1, fps: 30, width: 1920, height: 1080 };

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
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff', sunny: '#ffc857', pippa: '#ff8fab', kiki: '#8ac926' };
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
const arc = (t: number, a: number, b: number, h: number) => (within(t, a, b) ? Math.sin(prog(t, a, b) * Math.PI) * h : 0);
const bounce = (on: boolean, t: number, k = 0, h = 24) => (on ? Math.abs(Math.sin(t * 7 + k)) * h : 0);

// ── cast
const SUNNY: CritterSpec = { id: 'sunny', species: 'lion', fur: '#ffc857', fur2: '#fff1c1', dark: '#d2691e', iris: '#7a4a1a' };
const PIPPA: CritterSpec = { id: 'pippa', species: 'mouse', fur: '#c9cdd4', fur2: '#ffe3ec', dark: '#868e96', bow: '#ff6fa5' };
const KIKI: CritterSpec = { id: 'kiki', species: 'monkey', fur: '#b5651d', fur2: '#f6d5b0', dark: '#7a3e12', bow: '#8ac926' };
const SS = 0.68;
const PS = 0.3;
const KS = 0.5;
const BS = 0.56;
const SUNNY_X = 1250;
const KIKI_X = 380;
const BOBO_X = 630;
const PIP_X = 860;
const BUSH_X = 1600;
const FLOWER_X = 150;
const ROCK_X = 480;
const TREE: [number, number] = [1720, f - 430];
const HIDE_X = 1100;

// ── timeline anchors
const ALONE = S('alone');
const INTO = S('bush') + 2.6; // walks into the bush
const STUCK = INTO;
const PULL_B = S('bobo_try') + 1.6;
const SWING = S('kiki_try') + 0.4;
const CUTS = [word('nibble', 5), word('nibble', 7), word('nibble', 9)];
const FREE = word('free', 0);
const PLAY = S('play');
const SEEK = S('seek');
const PIP_HIDE = SEEK + 0.6;
const KIKI_UP = S('kiki_hide') + 0.2;
const BOBO_ROCK = S('bobo_hide') - 0.2;
const LINE_UP = S('remember') - 0.4;
const END_IRIS = E('bye2') + 0.6;

const SUNNY_PATH: KF = [
  [0, SUNNY_X, f], [ALONE, SUNNY_X, f], [INTO, BUSH_X, f], [FREE, BUSH_X, f], [FREE + 0.8, 1380, f],
  [PLAY, 1380, f], [PLAY + 2.0, HIDE_X, f],
];
const BOBO_PATH: KF = [
  [0, BOBO_X, f], [S('bobo_try'), BOBO_X, f], [PULL_B, 1380, f], [FREE + 0.8, 1380, f], [FREE + 1.6, 1180, f],
  [PLAY, 1180, f], [PLAY + 2.0, BOBO_X, f], [BOBO_ROCK - 1.6, BOBO_X, f], [BOBO_ROCK, ROCK_X, f], [LINE_UP, ROCK_X, f], [LINE_UP + 1.4, BOBO_X, f],
];
const KIKI_PATH: KF = [
  [0, KIKI_X, f], [SWING, KIKI_X, f], [SWING + 0.01, 1830, f - 640], [SWING + 1.4, 1830, f], [FREE + 1.6, 1830, f],
  [PLAY, 1830, f], [PLAY + 2.2, KIKI_X, f], [KIKI_UP, KIKI_X, f], [KIKI_UP + 0.01, TREE[0], TREE[1]], [LINE_UP, TREE[0], TREE[1]],
  [LINE_UP + 0.01, KIKI_X, f],
];
const PIP_PATH: KF = [
  [0, PIP_X, f], [S('pip_come'), PIP_X, f], [S('pip_help') + 0.2, BUSH_X - 140, f], [FREE + 1.0, BUSH_X - 140, f], [FREE + 1.8, 1500, f],
  [PLAY, 1500, f], [PLAY + 2.2, PIP_X, f], [PIP_HIDE, PIP_X, f], [PIP_HIDE + 1.6, FLOWER_X + 20, f], [LINE_UP, FLOWER_X + 20, f], [LINE_UP + 1.4, PIP_X, f],
];

// ── director camera
const WIDE = { z: 1.0, x: 960, y: 540 };
const cu = (x: number, y: number, z = 1.6) => ({ z, x, y });
const SUN_CU = cu(SUNNY_X, f - 320, 1.5);
const STUCK_CU = cu(BUSH_X - 40, f - 320, 1.45);
const PIP_CU = (x: number) => cu(x, f - 150, 2.1);
const KIKI_CU = cu(KIKI_X, f - 240);
const BOBO_CU = cu(BOBO_X, f - 270);
const SHOTS: Shot[] = [
  { t: 0, ...WIDE, move: 'cut', push: 0.015 },
  { t: S('sunny_hi') - 0.1, ...SUN_CU, move: 'snap', push: 0.01 },
  { t: S('roar_turn') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('brag1') - 0.1, ...SUN_CU, move: 'snap', push: 0.02 },
  { t: S('friends') - 0.2, z: 1.25, x: 640, y: f - 280, move: 'smooth', dur: 1.0, push: 0.01 },
  { t: S('kiki') - 0.1, ...KIKI_CU, move: 'whip' },
  { t: S('sunny_no') - 0.1, ...SUN_CU, move: 'whip' },
  { t: S('pip_ask') - 0.1, ...PIP_CU(PIP_X), move: 'whip' },
  { t: S('sunny_laugh') - 0.1, ...SUN_CU, move: 'whip' },
  { t: S('pip_sad') - 0.1, ...PIP_CU(PIP_X), move: 'snap', push: 0.03 },
  { t: S('q_kind') - 0.2, ...WIDE, move: 'smooth', dur: 0.8 },
  { t: ALONE - 0.2, z: 1.2, x: 1400, y: 600, move: 'smooth', dur: 1.2, push: 0.01 },
  { t: STUCK - 0.05, ...STUCK_CU, move: 'snap', push: 0.01 },
  { t: S('pull') + 0.3, z: 1.2, x: 1500, y: 600, move: 'smooth', dur: 0.8 },
  { t: S('strain') - 0.1, ...STUCK_CU, move: 'snap', push: 0.02 },
  { t: S('bobo_try') - 0.2, z: 1.0, x: 1100, y: 540, move: 'smooth', dur: 0.7 },
  { t: PULL_B, z: 1.25, x: 1480, y: 600, move: 'smooth', dur: 0.6, push: 0.02 },
  { t: S('kiki_try') - 0.2, z: 1.05, x: 1400, y: 520, move: 'smooth', dur: 0.6 },
  { t: S('kiki_pull') - 0.1, ...cu(1780, f - 240, 1.5), move: 'snap' },
  { t: S('q_who') - 0.2, ...WIDE, move: 'smooth', dur: 0.8 },
  { t: S('pip_help') - 0.1, ...WIDE, move: 'smooth', dur: 0.4 },
  { t: S('sunny_doubt') - 0.1, ...STUCK_CU, move: 'snap' },
  { t: S('pip_teeth') - 0.1, ...PIP_CU(BUSH_X - 140), move: 'whip' },
  { t: S('nibble') - 0.2, z: 1.35, x: BUSH_X - 60, y: f - 280, move: 'smooth', dur: 0.8, push: 0.02 },
  { t: S('count_turn') - 0.2, z: 1.15, x: 1450, y: 600, move: 'smooth', dur: 0.6 },
  { t: FREE - 0.1, z: 1.0, x: 1200, y: 540, move: 'snap' },
  { t: S('sunny_free') - 0.1, ...cu(1380, f - 320, 1.5), move: 'snap' },
  { t: S('sorry_feel') - 0.2, ...cu(1380, f - 320, 1.7), move: 'smooth', dur: 1.4, push: 0.03 },
  { t: S('pip_ok') - 0.1, ...PIP_CU(1500), move: 'whip' },
  { t: S('humble') - 0.2, z: 1.1, x: 1300, y: 580, move: 'smooth', dur: 1.0, push: 0.015 },
  { t: PLAY - 0.2, ...WIDE, move: 'smooth', dur: 0.8 },
  { t: S('sunny_ask') - 0.1, ...cu(HIDE_X, f - 320, 1.5), move: 'snap' },
  { t: S('all_yes') - 0.1, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('hide_q') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('found_pip') - 0.1, z: 1.5, x: FLOWER_X + 60, y: f - 200, move: 'snap' },
  { t: S('big_hide') - 0.2, z: 1.3, x: HIDE_X, y: f - 280, move: 'smooth', dur: 0.8, push: 0.02 },
  { t: S('kiki_hide') - 0.2, ...WIDE, move: 'smooth', dur: 0.8 },
  { t: S('kiki_found') - 0.1, ...cu(TREE[0] - 40, TREE[1] - 220, 1.5), move: 'snap' },
  { t: S('bobo_hide') - 0.2, z: 1.5, x: ROCK_X + 60, y: f - 220, move: 'smooth', dur: 0.8 },
  { t: S('moral') - 0.2, ...WIDE, move: 'smooth', dur: 0.8, push: 0.01 },
  { t: S('remember') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('a1') - 0.1, ...PIP_CU(PIP_X), move: 'snap' },
  { t: E('a1') + 0.6, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('a3') - 0.1, ...PIP_CU(PIP_X), move: 'snap' },
  { t: E('a3') + 0.6, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('a4') - 0.1, ...cu(HIDE_X, f - 320, 1.5), move: 'snap' },
  { t: E('a4') + 0.6, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('a5') - 0.1, ...cu(HIDE_X, f - 320, 1.5), move: 'snap' },
  { t: S('chant') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('c1') - 0.1, z: 1.25, x: (HIDE_X + PIP_X) / 2, y: f - 280, move: 'smooth', dur: 0.5, push: 0.02 },
  { t: S('c_turn') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
];
const PUNCHES = [STUCK, ...CUTS, FREE, S('found_pip'), S('c2')];
const HITS: Hit[] = [{ at: STUCK, amp: 10, dur: 0.3 }, { at: FREE, amp: 8, dur: 0.3 }];

// ── props
const TangleBush: React.FC<{ t: number; wob: number }> = ({ t, wob }) => (
  <g transform={`translate(${BUSH_X + Math.sin(t * 24) * 5 * wob},${f + 20})`}>
    <Vol>
      <path d="M -260,0 Q -300,-160 -180,-230 Q -150,-360 -10,-350 Q 130,-390 200,-260 Q 320,-200 270,0 Z" fill="#2d6a4f" {...kst(7)} />
    </Vol>
    {[[-180, -150], [-60, -280], [90, -300], [180, -150], [10, -120]].map(([x, y], i) => (
      <g key={i} transform={`translate(${x},${y})`}>
        {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={0} cy={-12} rx={8} ry={13} fill="#c77dff" transform={`rotate(${a})`} {...kst(3)} />)}
        <circle r={6} fill="#ffca3a" />
      </g>
    ))}
  </g>
);
// the sticky vines over Sunny's mane: each one is snapped by Pippa at CUTS[i]
const Vines: React.FC<{ t: number; on: boolean }> = ({ t, on }) => {
  if (!on) return null;
  const ends = [[-120, -380], [0, -470], [120, -390]];
  return (
    <g transform={`translate(${BUSH_X},${f})`}>
      {ends.map(([ex, ey], i) => {
        const cut = t >= CUTS[i];
        const drop = cut ? prog(t, CUTS[i], CUTS[i] + 0.5) : 0;
        if (drop >= 1) return null;
        const sway = Math.sin(t * 3 + i) * 6;
        return (
          <g key={i} opacity={1 - drop} transform={`translate(0,${drop * 120})`}>
            <path d={`M ${-150 + i * 150},-40 Q ${ex - 80 + sway},${ey + 140} ${ex},${ey} Q ${ex + 60},${ey - 40} ${ex + 90 + sway},${ey + 60}`}
              fill="none" stroke="#52b788" strokeWidth={18} strokeLinecap="round" />
            <path d={`M ${-150 + i * 150},-40 Q ${ex - 80 + sway},${ey + 140} ${ex},${ey}`} fill="none" stroke="#95d5b2" strokeWidth={6} strokeLinecap="round" />
            {[0.3, 0.6].map((k) => <ellipse key={k} cx={(-150 + i * 150) * (1 - k) + ex * k} cy={-40 * (1 - k) + ey * k} rx={20} ry={10} fill="#74c69d" {...kst(3)} />)}
          </g>
        );
      })}
    </g>
  );
};
const BigFlower: React.FC = () => (
  <g transform={`translate(${FLOWER_X},${f + 10})`}>
    <Vol kind="tube"><rect x={-10} y={-200} width={20} height={200} rx={10} fill="#52b788" {...kst(5)} /></Vol>
    <Vol><ellipse cx={-50} cy={-80} rx={50} ry={20} fill="#74c69d" {...kst(5)} transform="rotate(-30 -50 -80)" /></Vol>
    <g transform="translate(0,-230)">
      <Vol>{[0, 60, 120, 180, 240, 300].map((a) => <ellipse key={a} cx={0} cy={-70} rx={46} ry={70} fill="#ff6fa5" transform={`rotate(${a})`} {...kst(5)} />)}</Vol>
      <Vol><circle r={44} fill="#ffca3a" {...kst(5)} /></Vol>
    </g>
  </g>
);
const TinyLeaf: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x},${y}) rotate(-20)`}>
    <Vol><ellipse cx={0} cy={0} rx={70} ry={34} fill="#8ac926" {...kst(5)} /></Vol>
    <path d="M -60,0 L 60,0" stroke="#52b788" strokeWidth={5} strokeLinecap="round" />
  </g>
);
const Rock: React.FC = () => (
  <g transform={`translate(${ROCK_X},${f + 16})`}>
    <Vol><path d="M -170,0 Q -190,-170 -40,-200 Q 120,-220 170,-110 Q 200,-40 170,0 Z" fill="#adb5bd" {...kst(7)} /></Vol>
  </g>
);
const Branch: React.FC = () => (
  <g>
    <Vol kind="tube"><rect x={TREE[0] - 220} y={TREE[1] - 10} width={500} height={40} rx={20} fill="#8d5a2b" {...kst(6)} /></Vol>
    {[-160, -20, 140].map((x) => <Vol key={x}><ellipse cx={TREE[0] + x} cy={TREE[1] - 30} rx={70} ry={30} fill="#52b788" {...kst(5)} /></Vol>)}
  </g>
);

export default function KidsMorals064() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const shake = shakeOf(t, HITS);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const party = within(t, S('all_yes'), E('all_yes') + 0.6) || within(t, S('c1'), E('c_turn') + 0.4) || within(t, FREE, E('sunny_free') + 0.6);

  // ── Sunny
  const [sx, sy] = lerp2(t, SUNNY_PATH);
  const sDir = heading(t, SUNNY_PATH);
  const stuck = within(t, STUCK, FREE);
  const freeHop = arc(t, FREE, FREE + 0.8, 150);
  const counting = within(t, SEEK, E('seek') + 0.3);
  const sunnyExpr: KExpr =
    stuck ? (within(t, S('pip_help'), FREE) ? 'think' : within(t, S('strain'), E('strain') + 0.3) ? 'oops' : within(t, S('sunny_help'), S('q_who') + 4) ? 'sad' : 'surprised')
    : within(t, FREE, E('sunny_free') + 0.4) ? 'wow'
    : within(t, S('sorry_feel'), E('sunny_sorry') + 0.5) ? 'sad'
    : within(t, S('sunny_laugh'), E('sunny_laugh')) || within(t, S('sunny_no'), E('sunny_no')) ? 'wink'
    : within(t, 0, S('pip_ask')) || within(t, ALONE, INTO) ? 'proud'
    : counting ? 'sleepy'
    : within(t, S('big_hide'), E('sunny_laugh2') + 0.5) || party ? 'laugh'
    : talks('sunny') ? 'happy' : 'smile';
  const sunnyArm: CArm = counting ? 'think' : stuck ? (within(t, S('sunny_help'), E('sunny_help')) ? 'up' : { a: 40 + Math.sin(t * 5) * 10 })
    : within(t, S('brag1'), E('brag2')) ? 'up' : within(t, S('sunny_laugh'), E('sunny_laugh')) ? 'point' : party ? 'up' : t >= S('bye') ? 'wave' : talks('sunny') ? 'wave' : 'down';
  const sunnyTilt = within(t, ALONE, INTO) ? -12 : stuck ? Math.sin(t * 6) * 4 : 0;

  // ── Pippa
  const [px] = lerp2(t, PIP_PATH);
  const pDir = heading(t, PIP_PATH);
  const pipSad = within(t, S('pip_sad'), S('alone') + 1) || within(t, S('a2'), E('a2') + 0.4);
  const nibbling = within(t, S('nibble'), E('count_turn'));
  const pipExpr: KExpr = pipSad ? 'sad' : nibbling ? 'proud' : within(t, S('pip_help'), E('pip_teeth')) ? 'proud' : party || within(t, S('found_pip'), E('found_pip') + 0.5) ? 'laugh' : talks('pippa') ? 'happy' : 'smile';
  const pipHidden = within(t, PIP_HIDE + 1.6, S('found_pip'));

  // ── Kiki
  const [kx, ky] = lerp2(t, KIKI_PATH);
  const kDir = heading(t, KIKI_PATH);
  const kikiExpr: KExpr = within(t, S('pip_sad'), S('alone')) ? 'sad' : within(t, S('kiki_pull'), E('kiki_pull') + 0.3) ? 'oops' : party ? 'laugh' : talks('kiki') ? 'happy' : 'smile';
  const kikiArm: CArm = within(t, SWING, SWING + 1.4) || within(t, KIKI_UP, LINE_UP) ? 'up' : within(t, SWING + 1.4, FREE) ? { a: 60 } : party ? 'up' : t >= S('bye') ? 'wave' : talks('kiki') ? 'wave' : 'down';

  // ── Bobo
  const [bx] = lerp2(t, BOBO_PATH);
  const bDir = heading(t, BOBO_PATH);
  const pulling = within(t, PULL_B, S('q_who'));
  const boboExpr: KExpr = within(t, S('pip_sad'), S('alone')) ? 'sad' : pulling ? 'oops' : party || within(t, S('bobo_giggle'), E('bobo_giggle') + 0.4) ? 'laugh' : talks('bobo') ? 'happy' : 'smile';
  const boboArm: CArm = pulling ? { a: 70 } : party ? 'up' : t >= S('bye') ? 'wave' : talks('bobo') ? 'wave' : 'down';
  const boboDuck = within(t, BOBO_ROCK, LINE_UP) ? 0.35 : 0;

  return (
    <>
      <ActionStage cam={cam} shake={shake} blur={cam.blur}>
        <Backdrop place="jungle" w={W} h={H} t={t} />
        {t >= KIKI_UP - 0.5 && t < LINE_UP + 0.5 && <Branch />}
        <TangleBush t={t} wob={within(t, STUCK - 0.2, FREE + 0.2) ? (pulling || within(t, S('pull'), E('strain')) ? 1 : 0.3) : 0} />
        {/* Kiki */}
        <Critter spec={KIKI} x={kx} y={ky} scale={KS} expr={kikiExpr} look={kDir ? [kDir * 0.8, 0] : within(t, KIKI_UP, LINE_UP) ? [-0.5, 0.4] : [0.4, 0]} mouth={lipSync(VO, 'kiki', t)}
          armL={kikiArm} armR={kikiArm} walking={moving(t, KIKI_PATH) && ky >= f - 1} walk={t * 2.4} facing={kDir < 0 ? -1 : 1}
          hop={bounce(party, t, 1, 22)} shadow={ky >= f - 1} />
        {/* Bobo */}
        <Critter spec={BOBO_HERO} x={bx} y={f} scale={BS} expr={boboExpr} look={bDir ? [bDir * 0.8, 0] : pulling ? [1, 0] : [0.4, 0]} mouth={lipSync(VO, 'bobo', t)}
          armL={boboArm} armR={boboArm} walking={moving(t, BOBO_PATH)} walk={t * 2.4} facing={bDir < 0 ? -1 : 1} squash={boboDuck}
          hop={bounce(party, t, 2, 22)} />
        {t >= BOBO_ROCK - 0.6 && t < LINE_UP + 0.6 && <Rock />}
        {/* Pippa (behind the big flower while she hides) */}
        {!pipHidden && (
          <Critter spec={PIPPA} x={px} y={f} scale={PS} expr={pipExpr} look={pDir ? [pDir * 0.8, 0] : within(t, S('sunny_laugh'), S('alone')) ? [1, -0.4] : [0.5, -0.3]} mouth={lipSync(VO, 'pippa', t) || (nibbling ? Math.abs(Math.sin(t * 16)) * 0.6 : 0)}
            armL={nibbling ? 'hold' : party ? 'up' : t >= S('bye') ? 'wave' : talks('pippa') ? 'wave' : 'down'} armR={nibbling ? 'hold' : party ? 'up' : 'down'}
            walking={moving(t, PIP_PATH)} walk={t * 3} facing={pDir < 0 ? -1 : 1} hop={bounce(party || within(t, S('pip_ok'), E('pip_ok')), t, 3, 18)} />
        )}
        {pipHidden && <g transform={`translate(${FLOWER_X + 70},${f - 30})`}><path d="M 0,0 Q 40,-10 60,-50" fill="none" stroke={PIPPA.dark} strokeWidth={8} strokeLinecap="round" /></g>}
        {t >= SEEK - 0.5 && t < LINE_UP + 0.6 && <BigFlower />}
        {/* Sunny */}
        <Critter spec={SUNNY} x={sx} y={sy} scale={SS} expr={sunnyExpr} look={sDir ? [sDir * 0.8, -0.2] : stuck ? [-0.4, 0] : within(t, S('sunny_laugh'), E('sunny_laugh')) ? [-1, 0.4] : [-0.2, 0.1]}
          mouth={lipSync(VO, 'sunny', t)} armL={sunnyArm} armR={sunnyArm === 'point' ? 'down' : sunnyArm} hop={freeHop + bounce(party, t, 4, 22)}
          tilt={sunnyTilt} walking={moving(t, SUNNY_PATH)} walk={t * 2} facing={sDir < 0 ? -1 : 1} />
        <Vines t={t} on={within(t, STUCK - 0.1, FREE + 0.1)} />
        {within(t, S('big_hide') - 0.4, E('sunny_laugh2') + 0.6) && <TinyLeaf x={HIDE_X} y={f - 300} />}
        {/* FX + words */}
        <StrainLines t={t} from={S('pull')} to={E('strain')} x={BUSH_X} y={f - 330} r={120} />
        <StrainLines t={t} from={PULL_B} to={E('bobo_pull')} x={bx} y={f - 300} r={80} />
        <MotionLines t={t} from={SWING} to={SWING + 1.4} x={1830} y={f - 400} dir={-90} n={3} len={120} spread={40} />
        <Dust t={t} at={SWING + 1.4} x={1830} y={f} s={0.9} />
        <Dust t={t} at={FREE + 0.8} x={1380} y={f} s={1.3} />
        <ImpactStar t={t} at={FREE} x={BUSH_X - 100} y={f - 380} s={0.9} />
        {CUTS.map((c, i) => <Dust key={i} t={t} at={c} x={BUSH_X - 150 + i * 150} y={f - 60} s={0.5} />)}
        <StageWord t={t} at={word('sunny_hi', 0)} until={E('sunny_hi') + 0.4} text="ROAR!" x={SUNNY_X} y={f - 640} size={110} color="#ff924c" rot={-6} />
        <StageWord t={t} at={word('sunny_sing', 4)} until={E('sunny_sing') + 0.3} text="LA LA LA ♪" x={1400} y={f - 640} size={80} color="#ffca3a" rot={6} />
        <StageWord t={t} at={STUCK} until={STUCK + 1.4} text="STUCK!" x={BUSH_X - 60} y={f - 640} size={100} color="#52b788" rot={-6} />
        <StageWord t={t} at={word('bobo_try', 7)} until={E('bobo_pull') + 0.3} text="HEAVE, HO!" x={1380} y={f - 540} size={80} color="#ff924c" rot={-5} />
        <StageWord t={t} at={S('kiki_pull')} until={E('kiki_pull') + 0.3} text="OO-OO!" x={1830} y={f - 460} size={80} color="#8ac926" rot={6} />
        <StageWord t={t} at={S('nibble')} until={CUTS[0]} text="NIBBLE NIBBLE!" x={BUSH_X - 160} y={f - 220} size={64} color="#ff8fab" rot={-6} />
        <StageWord t={t} at={FREE} until={FREE + 1.3} text="SNAP!" x={BUSH_X - 100} y={f - 620} size={110} color="#ffca3a" rot={6} />
        <Reaction kind="cloud" t={t} at={S('pip_sad')} until={S('q_kind')} x={PIP_X} y={f - 230} s={0.45} />
        <Reaction kind="!" t={t} at={STUCK} until={STUCK + 1.4} x={BUSH_X} y={f - 560} s={0.8} />
        <Reaction kind="sweat" t={t} at={S('strain')} until={S('q_who')} x={BUSH_X + 90} y={f - 520} s={0.7} />
        <Reaction kind="idea" t={t} at={S('pip_help')} until={E('pip_help') + 0.4} x={px} y={f - 240} s={0.55} />
        <Reaction kind="?" t={t} at={S('sunny_doubt')} until={E('sunny_doubt') + 0.3} x={BUSH_X + 60} y={f - 560} s={0.7} />
        <Reaction kind="heart" t={t} at={S('pip_ok')} until={E('pip_ok') + 0.8} x={1440} y={f - 560} s={0.8} />
        <Reaction kind="cloud" t={t} at={S('sorry_feel')} until={S('sunny_sorry')} x={1380} y={f - 560} s={0.6} />
        <Reaction kind="?" t={t} at={E('hide_q') + 0.1} until={S('found_pip')} x={FLOWER_X + 140} y={f - 420} s={0.6} />
        <Reaction kind="?" t={t} at={E('kiki_hide') + 0.1} until={S('kiki_found')} x={TREE[0] - 200} y={TREE[1] - 260} s={0.6} />
        <Reaction kind="stars" t={t} at={S('sunny_laugh2')} until={E('sunny_laugh2') + 0.6} x={HIDE_X} y={f - 560} s={0.7} />
      </ActionStage>

      {/* screen-space */}
      <PopText t={t} at={S('roar_turn')} until={S('brag1') - 0.1} text="ROOOAR!" y={170} size={140} color="#ff924c" />
      <PopText t={t} at={S('feel') + 0.6} until={S('q_kind') - 0.1} text="LEFT OUT" y={170} size={130} color="#a0c4ff" />
      <ThinkTimer t={t} from={onBeat(E('q_kind') + 0.1)} to={S('not_kind') - 0.1} x={1760} y={190} r={90} label="KIND?" />
      <AnswerMark t={t} at={S('not_kind') + 0.1} until={E('not_kind') + 1.0} ok={false} x={1760} y={190} />
      <PopText t={t} at={word('not_kind', 4)} until={S('alone') - 0.1} text="TOO PROUD" y={170} size={130} color="#ff924c" />
      <PopText t={t} at={S('sunny_help') + 0.3} until={S('bobo_try') - 0.1} text="HELP!" y={170} size={140} color="#ff595e" />
      <ThinkTimer t={t} from={onBeat(E('q_who') + 0.1)} to={S('pip_come') - 0.1} x={1760} y={190} r={90} label="WHO?" />
      {CUTS.map((at, i) => (
        <PopText key={i} t={t} at={at - 0.05} until={i < 2 ? CUTS[i + 1] - 0.05 : S('count_turn')} text={String(i + 1)} y={170} size={170} color={['#ff595e', '#ffca3a', '#4cc9f0'][i]} />
      ))}
      {[word('count_turn', 6), word('count_turn', 7), word('count_turn', 8)].map((at, i, a) => (
        <PopText key={`c${i}`} t={t} at={at - 0.05} until={i < 2 ? a[i + 1] - 0.05 : S('free') - 0.1} text={String(i + 1)} y={170} size={170} color={['#ff595e', '#ffca3a', '#4cc9f0'][i]} />
      ))}
      <PopText t={t} at={S('sunny_free')} until={S('sorry_feel') - 0.1} text="FREE!" y={170} size={150} color="#52b788" />
      <PopText t={t} at={word('sorry_feel', 16)} until={S('sunny_sorry') - 0.1} text="SORRY FEELING" y={170} size={110} color="#a0c4ff" />
      <PopText t={t} at={word('sunny_thanks', 6)} until={E('pip_ok') + 0.4} text="THANK YOU!" y={170} size={130} color="#ff8fab" />
      <PopText t={t} at={word('humble2', 0)} until={S('play') - 0.1} text="BE HUMBLE" y={170} size={130} color="#ffca3a" />
      <ThinkTimer t={t} from={onBeat(E('hide_q') + 0.1)} to={S('found_pip') - 0.1} x={1760} y={190} r={90} label="WHERE?" />
      <ThinkTimer t={t} from={onBeat(E('kiki_hide') + 0.1)} to={S('kiki_found') - 0.1} x={1760} y={190} r={90} label="WHERE?" />
      <PopText t={t} at={S('moral')} until={S('your_q') - 0.1} text="BIG OR SMALL, WE NEED EACH OTHER" y={170} size={74} color="#ffca3a" />
      <PopText t={t} at={S('remember') + 0.2} until={S('q1') - 0.1} text="LET'S REMEMBER!" y={170} size={110} color="#ffca3a" />
      {(['q1', 'q2', 'q3', 'q4', 'q5'] as const).map((q) => {
        const a = ({ q1: 'a1', q2: 'a2', q3: 'a3', q4: 'a4', q5: 'a5' } as const)[q];
        return <ThinkTimer key={q} t={t} from={onBeat(E(q) + 0.1)} to={S(a) - 0.1} x={1760} y={190} r={90} label="THINK!" />;
      })}
      <PopText t={t} at={S('a1')} until={S('q2') - 0.2} text="“TOO SMALL!”" y={170} size={120} color="#ff924c" />
      <PopText t={t} at={S('a2')} until={S('q3') - 0.2} text="SAD · LEFT OUT" y={170} size={120} color="#a0c4ff" />
      <PopText t={t} at={S('a3')} until={S('q4') - 0.2} text="NIBBLE, NIBBLE!" y={170} size={120} color="#ff8fab" />
      <PopText t={t} at={S('a4')} until={S('q5') - 0.2} text="SORRY + THANK YOU" y={170} size={110} color="#52b788" />
      <PopText t={t} at={S('a5')} until={S('chant') - 0.2} text="BE A GOOD FRIEND" y={170} size={110} color="#ffca3a" />
      <PopText t={t} at={S('c1')} until={S('c2') - 0.1} text="BIG OR SMALL…" y={170} size={120} color="#ffc857" />
      <PopText t={t} at={S('c2')} until={S('c_turn') - 0.1} text="WE NEED EACH OTHER!" y={170} size={100} color="#ff8fab" />
      <PopText t={t} at={E('c_turn') - 0.2} until={S('bye') - 0.1} text="YOUR TURN!" y={170} size={120} color="#ffffff" />
      <PopText t={t} at={S('bye')} until={END_IRIS} text="SEE YOU NEXT TIME!" y={170} size={100} color="#ffc857" />
      <Confetti t={t} at={FREE} y={420} />
      <Confetti t={t} at={S('all_yes')} y={420} />
      <Confetti t={t} at={S('c2')} y={420} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <SparksIntro t={t} at={0} cast={{ kids: [MILA_HERO, LEO_HERO], buddy: BOBO_HERO }} />
      <StarWipe t={t} at={END_IRIS} dur={0.5} hold={5} color="#2d6a4f" x={W / 2} y={H * 0.45} />
    </>
  );
}
