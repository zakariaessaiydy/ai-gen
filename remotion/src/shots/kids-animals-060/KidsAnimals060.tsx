// TINY SPARKS · Day 60 · 🦁 Animal Stories #9 — "Luna the Cat and the Missing Ball" (LONG 16:9)
// kids-shorts/tiny-sparks/animals/day-060-luna-the-cat-and-the-missing-ball. Cues from VO via K (keys.gen.ts).
// ENERGY LAYER standard: ident → GUESS WHO (pointy ears + whiskers peek over a bush, a tail curls behind it, think
// timer) → Luna the kitten hops out → MEET Super Bobo + her red ball with a bell inside (jingle!) → SOUND "meow" + purr
// (your turn) → 3 TRUE FACTS (super ears that turn to listen — sound rings · whiskers feel things, even in the dark ·
// cats sleep more than half the day — three sleepy kittens in a basket) → PLAY: stretch · pounce · chase her tail
// (your turn: stretch) → STORY (value: giving back + playing together): Bobo kicks the ball too hard, it rolls into the
// forest → "How can Luna find it? It has a bell!" (think timer) → Luna listens for the jingle: tiptoe past the flowers
// (your turn), past the pond (a frog — ribbit — not the ball!), louder and louder, to a hollow log → Max the puppy
// (Day 53) kept the ball safe → he gives it back, "play together?" → back in the meadow, catch with three friends → cat
// nap → LET'S REMEMBER (5 questions, think timers) → chant "Listen, listen! Jingle, jingle! Luna finds the ball!" → bye.
import React from 'react';
import { Critter, critterFaceAt, type CArm, type CritterSpec } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR } from '../../lib/kids/sets';
import { Backdrop } from '../../lib/kids/places';
import { Ball, Confetti, KidsCaptions, PopText, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, Dust, ImpactStar, MotionLines, Reaction, SparksIntro, StageWord, StarWipe, directorCam, onBeat, type Shot } from '../../lib/kids/energy';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsAnimals060', durationInSeconds: 300.6, fps: 30, width: 1920, height: 1080 };

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
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff', luna: '#b388ff', max: '#ff924c' };
type KF = [number, number][];
const lerpKF = (t: number, kf: KF) => {
  if (t <= kf[0][0]) return kf[0][1];
  for (let i = 1; i < kf.length; i++) {
    if (t <= kf[i][0]) {
      const [t0, v0] = kf[i - 1];
      const [t1, v1] = kf[i];
      return v0 + (v1 - v0) * EASE_INOUT((t - t0) / Math.max(1e-6, t1 - t0));
    }
  }
  return kf[kf.length - 1][1];
};
const moving = (t: number, kf: KF) => kf.some(([t1, v1], i) => i > 0 && t > kf[i - 1][0] && t < t1 && Math.abs(v1 - kf[i - 1][1]) > 4);
const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (EASE_OUT(p) - 1) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};

// ── cast
const LUNA: CritterSpec = { id: 'luna', species: 'cat', fur: '#b8c0cc', fur2: '#ffffff', dark: '#6c757d', bow: '#b388ff' };
const MAX: CritterSpec = { id: 'max', species: 'dog', fur: '#e9a35b', fur2: '#fff3e0', dark: '#8d5a3b', scarf: '#ff595e' };
const KIT = (i: number): CritterSpec => ({ id: `kit${i}`, species: 'cat', fur: ['#ffb067', '#b8c0cc', '#f3e3d3'][i], fur2: '#ffffff', dark: '#6c757d' });
const FROG: CritterSpec = { id: 'frog', species: 'frog', fur: '#80c96b', fur2: '#d8f3c8', dark: '#3a8d3a' };
const LS = 0.5;
const BS = 0.6;
const XS = 0.5;
const BALL_COLORS = ['#ff595e', '#ffca3a', '#ff595e', '#ffca3a'];

// ── scenes
const TRAIL0 = S('jingle1') - 0.3;
const BACK0 = S('lesson') - 0.3; // back in the meadow
type Scene = 'park' | 'trail';
const sceneAt = (t: number): Scene => (t >= TRAIL0 && t < BACK0 ? 'trail' : 'park');

// park layout
const BUSH: [number, number] = [1300, f];
const BOBO_X = 520;
const LUNA_HOME = 1100;
const MAX_PARK = 1480;
// trail layout
const FLOWERS_X = 520;
const POND_X = 980;
const LOG_X = 1500;

// ── anchors
const REVEAL = word('reveal', 2) - 0.05;
const JINGLE = word('luna_ball', 10);
const KICK = word('kick', 4);
const KITS0 = word('fact3', 4);
const MAXOUT = word('max', 3);
const GIVE = word('max_give', 5);
const FROG0 = word('ribbit', 8);

const LUNA_X: KF = [
  [0, BUSH[0]], [REVEAL, BUSH[0]], [REVEAL + 0.6, LUNA_HOME],
  [S('luna_go') + 1.0, LUNA_HOME], [TRAIL0 - 0.05, 2100],
  [TRAIL0, 160], [S('jingle1') + 0.3, 160], [S('jingle1') + 2.6, FLOWERS_X + 80], [S('trail2'), FLOWERS_X + 80], [S('trail2') + 1.6, POND_X - 330],
  [S('trail3'), POND_X - 330], [S('trail3') + 3.0, LOG_X - 330], [BACK0, LOG_X - 330],
  [BACK0 + 0.01, 1000],
];

// ── camera
const lunaFace = (x: number) => critterFaceAt(x, f, LS);
const boboFace = critterFaceAt(BOBO_X, f, BS);
const SHOTS: Shot[] = [
  { t: 0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.01 },
  { t: S('guess') - 0.3, z: 1.5, x: BUSH[0], y: f - 200, move: 'smooth', dur: 1.6, push: 0.02 },
  { t: REVEAL - 0.05, z: 1.5, x: LUNA_HOME, y: lunaFace(LUNA_HOME)[1] + 80, move: 'snap', push: 0.01 },
  { t: S('bobo_hi') - 0.2, z: 1.5, x: BOBO_X + 30, y: boboFace[1] + 100, move: 'whip' },
  { t: S('luna_ball') - 0.2, z: 1.4, x: LUNA_HOME + 40, y: lunaFace(LUNA_HOME)[1] + 120, move: 'whip' },
  { t: S('sound_turn') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('sound_b') - 0.2, z: 1.55, x: LUNA_HOME, y: lunaFace(LUNA_HOME)[1] + 80, move: 'snap' },
  { t: S('sounds') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('purr') - 0.2, z: 1.55, x: LUNA_HOME, y: lunaFace(LUNA_HOME)[1] + 80, move: 'snap' },
  { t: S('facts') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.7 },
  { t: S('listen') - 0.2, z: 1.5, x: LUNA_HOME, y: lunaFace(LUNA_HOME)[1] + 80, move: 'smooth', dur: 0.8 },
  { t: S('fact2') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('whisk') - 0.2, z: 1.7, x: LUNA_HOME, y: lunaFace(LUNA_HOME)[1] + 40, move: 'snap' },
  { t: S('fact3') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: KITS0 + 0.3, z: 1.6, x: 1520, y: f - 120, move: 'smooth', dur: 1.0, push: 0.02 },
  { t: S('wow') - 0.2, z: 1.5, x: BOBO_X + 30, y: boboFace[1] + 100, move: 'whip' },
  { t: S('tricks') - 0.2, z: 1.35, x: LUNA_HOME, y: f - 200, move: 'smooth', dur: 0.8, push: 0.02 },
  { t: S('trick_turn') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('play') - 0.2, z: 1.0, x: 860, y: 540, move: 'smooth', dur: 0.8 },
  { t: KICK - 0.1, z: 1.0, x: 1060, y: 520, move: 'smooth', dur: 1.2 },
  { t: S('luna_sad') - 0.2, z: 1.6, x: LUNA_HOME, y: lunaFace(LUNA_HOME)[1] + 80, move: 'smooth', dur: 0.8, push: 0.02 },
  { t: S('help_q') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 },
  { t: S('luna_go') - 0.2, z: 1.55, x: LUNA_HOME, y: lunaFace(LUNA_HOME)[1] + 80, move: 'snap' },
  { t: TRAIL0, z: 1.1, x: 600, y: 600, move: 'cut', push: 0.01 },
  { t: S('trail2') - 0.2, z: 1.1, x: 1000, y: 600, move: 'smooth', dur: 1.6 },
  { t: FROG0 - 0.2, z: 1.5, x: POND_X + 60, y: f - 120, move: 'snap' },
  { t: E('ribbit') + 0.4, z: 1.1, x: 1000, y: 600, move: 'smooth', dur: 0.6 },
  { t: S('trail3') - 0.2, z: 1.1, x: 1300, y: 600, move: 'smooth', dur: 2.0 },
  { t: S('peek') - 0.2, z: 1.5, x: LOG_X - 160, y: f - 200, move: 'smooth', dur: 0.8, push: 0.02 },
  { t: MAXOUT - 0.1, z: 1.5, x: LOG_X - 60, y: f - 180, move: 'snap' },
  { t: S('luna_thx') - 0.2, z: 1.15, x: 1300, y: 600, move: 'smooth', dur: 0.8 },
  { t: S('together') - 0.2, z: 1.5, x: LOG_X - 330, y: lunaFace(LOG_X - 330)[1] + 80, move: 'snap' },
  { t: S('max_yes') - 0.2, z: 1.15, x: 1300, y: 600, move: 'smooth', dur: 0.6 },
  { t: BACK0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.006 },
  { t: S('yawn') - 0.2, z: 1.5, x: 1000, y: lunaFace(1000)[1] + 80, move: 'smooth', dur: 0.8 },
  { t: S('again') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('a1') - 0.1, z: 1.55, x: 1000, y: lunaFace(1000)[1] + 80, move: 'snap' },
  { t: E('a1') + 0.6, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('a3') - 0.1, z: 1.55, x: 1000, y: lunaFace(1000)[1] + 80, move: 'snap' },
  { t: E('a3') + 0.6, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('a4') - 0.1, z: 1.55, x: MAX_PARK, y: critterFaceAt(MAX_PARK, f, XS)[1] + 80, move: 'snap' },
  { t: E('a4') + 0.6, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('c1') - 0.1, z: 1.2, x: 960, y: 580, move: 'smooth', dur: 0.6, push: 0.02 },
  { t: S('c_turn') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
];
const PUNCHES = [REVEAL, MAXOUT, S('luna_thx')];

// ── props
const Bush: React.FC<{ x: number; t: number }> = ({ x, t }) => (
  <g>
    {[-120, 120, 0].map((dx, i) => (
      <Vol key={dx}><circle cx={x + dx} cy={f - 110 - (dx === 0 ? 30 : 0) + Math.sin(t * 2 + i) * 2} r={dx === 0 ? 150 : 125} fill={dx === 0 ? '#74c69d' : '#52b788'} {...kst(7)} /></Vol>
    ))}
    {[[-150, -170], [60, -230], [150, -120]].map(([dx, dy], i) => <circle key={i} cx={x + dx} cy={f + dy} r={14} fill="#ff6fa5" {...kst(4)} />)}
  </g>
);
const Pond: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Vol kind="slope"><ellipse cx={POND_X} cy={f + 80} rx={240} ry={50} fill="#4cc9f0" {...kst(7)} /></Vol>
    {[0, 1].map((i) => <ellipse key={i} cx={POND_X - 60 + i * 120} cy={f + 80} rx={40 + ((t * 30 + i * 20) % 40)} ry={10 + ((t * 8 + i * 5) % 10)} fill="none" stroke="#ffffff" strokeWidth={4} opacity={0.6} />)}
    <Vol><ellipse cx={POND_X + 140} cy={f + 70} rx={60} ry={18} fill="#52b788" {...kst(4)} /></Vol>
  </g>
);
const HollowLog: React.FC = () => (
  <g>
    <Vol kind="tube"><rect x={LOG_X - 150} y={f - 160} width={360} height={170} rx={80} fill="#a0673c" {...kst(8)} /></Vol>
    <Vol><ellipse cx={LOG_X - 150} cy={f - 75} rx={56} ry={86} fill="#e9c19a" {...kst(7)} /></Vol>
    <ellipse cx={LOG_X - 150} cy={f - 75} rx={36} ry={62} fill="#3b2a4a" />
  </g>
);
// jingle notes travelling from the ball's direction to Luna's ear
const Jingle: React.FC<{ t: number; from: [number, number]; to: [number, number]; loud?: number }> = ({ t, from, to, loud = 1 }) => (
  <g>
    {[0, 1, 2].map((i) => {
      const p = (t * 0.5 + i / 3) % 1;
      const x = from[0] + (to[0] - from[0]) * p;
      const y = from[1] + (to[1] - from[1]) * p - Math.sin(p * Math.PI) * 50;
      return (
        <g key={i} transform={`translate(${x},${y}) scale(${0.8 + 0.5 * loud})`} opacity={Math.sin(p * Math.PI)}>
          <path d="M -10,-18 Q 0,-30 10,-18 L 12,6 L -12,6 Z" fill="#ffca3a" {...kst(3)} />
          <circle cy={10} r={5} fill="#ffca3a" {...kst(2)} />
        </g>
      );
    })}
  </g>
);
// sound rings at an ear (fact 1)
const Rings: React.FC<{ t: number; x: number; y: number; dir: 1 | -1 }> = ({ t, x, y, dir }) => (
  <g>
    {[0, 1, 2].map((i) => {
      const p = (t * 0.9 + i / 3) % 1;
      const r = 20 + p * 70;
      return <path key={i} d={`M ${x + dir * r * 0.5},${y - r} Q ${x + dir * r * 1.1},${y} ${x + dir * r * 0.5},${y + r}`} fill="none" stroke="#b388ff" strokeWidth={7} strokeLinecap="round" opacity={1 - p} />;
    })}
  </g>
);
const RedBall: React.FC<{ s?: number; rot?: number }> = ({ s = 1, rot = 0 }) => (
  <g transform={`scale(${s})`}><Ball r={40} rot={rot} colors={BALL_COLORS} /></g>
);
const arc = (a: [number, number], b: [number, number], p: number, hgt: number): [number, number] => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p - Math.sin(p * Math.PI) * hgt];

export default function KidsAnimals060() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const scene = sceneAt(t);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);

  const lx = lerpKF(t, LUNA_X);
  const walking = moving(t, LUNA_X);
  const tiptoe = scene === 'trail' && walking;
  const listening = within(t, S('listen'), E('listen')) || within(t, S('luna_go'), TRAIL0) || (scene === 'trail' && t < MAXOUT) || within(t, S('c1'), E('c1')) || within(t, S('a3'), E('a3'));
  const yay = within(t, S('luna_thx'), E('luna_thx') + 0.8) || within(t, S('max_yes'), E('max_yes') + 0.5) || within(t, S('c1'), E('c3') + 0.5) || t >= S('bye');
  const sad = within(t, word('rolled', 10), S('luna_go'));
  const stretching = within(t, word('tricks', 7), S('trick2')) || within(t, word('trick_turn', 6), E('trick_turn') + 2.0);
  const pounce = within(t, S('trick2') + 0.3, S('trick2') + 1.1);
  const spinning = within(t, word('trick3', 4), E('trick3') + 0.4);
  const napping = within(t, word('yawn', 1), S('again'));
  const lunaExpr: KExpr = t < REVEAL + 0.6 ? 'surprised' : napping ? 'sleepy' : sad ? 'sad' : within(t, S('peek'), MAXOUT) ? 'think' : within(t, FROG0, FROG0 + 1.4) ? 'surprised' : yay ? 'laugh' : talks('luna') ? 'happy' : 'smile';
  const lunaHop = (t >= REVEAL && t < REVEAL + 0.6 ? Math.sin(prog(t, REVEAL, REVEAL + 0.6) * Math.PI) * 160 : 0) + (walking && !tiptoe ? Math.abs(Math.sin(t * 8)) * 18 : 0)
    + (tiptoe ? Math.abs(Math.sin(t * 5)) * 8 : 0) + (pounce ? Math.sin(prog(t, S('trick2') + 0.3, S('trick2') + 1.1) * Math.PI) * 140 : 0) + (yay && !walking ? Math.abs(Math.sin(t * 7)) * 22 : 0);
  const maxIn = (scene === 'trail' && t >= MAXOUT) || (scene === 'park' && t >= BACK0);
  const maxX = scene === 'trail' ? LOG_X - 150 + EASE_OUT(prog(t, MAXOUT, MAXOUT + 1.0)) * 150 : MAX_PARK;
  const boboExpr: KExpr = sad ? 'sad' : within(t, KICK, KICK + 1.6) ? 'oops' : within(t, S('wow'), E('wow') + 0.4) ? 'wow' : yay ? 'laugh' : talks('bobo') ? 'happy' : 'smile';
  const boboArm: CArm = yay ? 'up' : within(t, KICK - 0.3, KICK + 0.6) ? 'point' : talks('bobo') ? 'wave' : 'down';

  // ── where is the ball?
  const PLAY0 = S('play') + 0.4;
  const B_BOBO: [number, number] = [BOBO_X + 120, f - 150];
  const B_LUNA: [number, number] = [LUNA_HOME - 110, f - 120];
  let ball: [number, number] | null = null;
  let ballRot = t * 200;
  const lunaHolds = (t >= JINGLE - 0.6 && t < PLAY0) || (scene === 'trail' && t >= GIVE + 0.8) || within(t, S('yawn'), BACK0 + 999);
  const maxHolds = scene === 'trail' && t >= MAXOUT && t < GIVE;
  if (scene === 'park' && within(t, PLAY0, KICK)) {
    const p = ((t - PLAY0) / 1.4) % 2;
    ball = p < 1 ? arc(B_LUNA, B_BOBO, p, 220) : arc(B_BOBO, B_LUNA, p - 1, 220);
  } else if (scene === 'park' && within(t, KICK, KICK + 2.2)) {
    const p = prog(t, KICK, KICK + 2.2);
    ball = [B_BOBO[0] + (2200 - B_BOBO[0]) * p, f - 60 - Math.abs(Math.sin(p * Math.PI * 3)) * 260 * (1 - p)];
    ballRot = t * 900;
  } else if (scene === 'trail' && within(t, GIVE, GIVE + 0.8)) {
    ball = arc([maxX + 70, f - 120], [lx + 90, f - 120], prog(t, GIVE, GIVE + 0.8), 120);
  } else if (scene === 'park' && within(t, BACK0, S('yawn'))) {
    // catch with three friends: Bobo → Luna → Max → Bobo …
    const P: [number, number][] = [[BOBO_X + 110, f - 150], [1000 - 90, f - 120], [MAX_PARK - 90, f - 120]];
    const q = (t - BACK0) / 1.5;
    const i = Math.floor(q) % 3;
    ball = arc(P[i], P[(i + 1) % 3], q - Math.floor(q), 200);
  }
  const bell = (s = 1) => <g transform={`translate(0,0) scale(${s})`}><RedBall s={1} rot={ballRot} /></g>;

  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
        {scene === 'trail' ? <Backdrop place="forest" w={W} h={H} t={t} /> : <Backdrop place="meadow" w={W} h={H} t={t} fx={['butterflies', 'birds']} />}

        {scene === 'park' && (
          <g>
            {/* the three sleepy kittens (fact 3) */}
            {within(t, KITS0, S('tricks') - 0.3) && (
              <g transform={`translate(1520,${f}) scale(${popIn(t, KITS0)})`}>
                {[-90, 0, 90].map((dx, i) => <Critter key={i} spec={KIT(i)} x={dx} y={-30} scale={0.2} expr="sleepy" idle={false} shadow={false} />)}
                <Vol><path d="M -170,-40 L 170,-40 L 140,30 L -140,30 Z" fill="#d9a066" {...kst(6)} /></Vol>
                <path d="M -150,-40 Q 0,-10 150,-40" fill="#ffffff" opacity={0.6} />
                <StageWord t={t} at={KITS0 + 0.6} until={S('tricks') - 0.3} text="ZZZ..." x={120} y={-200} size={60} color="#a0c4ff" rot={-6} />
              </g>
            )}
            {t < REVEAL + 0.5 && <Bush x={BUSH[0]} t={t} />}
            {/* the hook: pointy ears + whiskers over the bush, a tail curling behind it */}
            {t < REVEAL && (
              <g>
                <path d={`M ${BUSH[0] + 200},${f - 150} q ${40 + Math.sin(t * 3) * 20},-60 ${10 + Math.sin(t * 3) * 30},-140 q -10,-30 20,-30`} fill="none" stroke={LUNA.fur} strokeWidth={28} strokeLinecap="round" />
                {t >= word('guess', 4) && (
                  <g transform={`translate(${BUSH[0] + Math.sin(t * 2) * 8},${f - 300})`}>
                    <path d="M -70,10 L -50,-60 L -10,-10 Z M 70,10 L 50,-60 L 10,-10 Z" fill={LUNA.fur} {...kst(5)} />
                    <path d="M -40,-2 L -50,-40 L -24,-12 Z M 40,-2 L 50,-40 L 24,-12 Z" fill="#ffc8dd" />
                  </g>
                )}
                {t >= word('guess', 7) && [-1, 1].map((sx) => (
                  <g key={sx} transform={`translate(${BUSH[0] + sx * 150},${f - 210})`}>
                    {[-14, 0, 14].map((dy) => <path key={dy} d={`M 0,${dy} l ${sx * (60 + Math.sin(t * 4) * 6)},${dy * 0.6}`} stroke={KINK} strokeWidth={4} strokeLinecap="round" />)}
                  </g>
                ))}
              </g>
            )}
            {/* Bobo */}
            {t >= S('bobo_hi') - 2 && (
              <Critter spec={BOBO_HERO} x={BOBO_X} y={f} scale={BS} expr={boboExpr} look={[0.6, -0.1]} mouth={lipSync(VO, 'bobo', t)} armL={boboArm} armR={yay ? 'up' : within(t, PLAY0, KICK + 0.4) ? 'up' : boboArm}
                hop={yay ? Math.abs(Math.sin(t * 7 + 1)) * 22 : 0} />
            )}
            {/* sound rings at Luna's ears (fact 1) */}
            {within(t, word('fact1', 4), E('listen') + 0.4) && (
              <g>
                <Rings t={t} x={lx - 90} y={lunaFace(lx)[1] - 60} dir={-1} />
                <Rings t={t} x={lx + 90} y={lunaFace(lx)[1] - 60} dir={1} />
              </g>
            )}
            {/* whisker glow (fact 2) */}
            {within(t, word('fact2', 5), E('whisk') + 0.4) && [-1, 1].map((sx) => (
              <g key={sx} transform={`translate(${lx + sx * 70},${lunaFace(lx)[1] + 30})`} opacity={0.6 + 0.4 * Math.sin(t * 8)}>
                {[-12, 0, 12].map((dy) => <path key={dy} d={`M 0,${dy} l ${sx * 90},${dy * 0.8}`} stroke="#fff3b0" strokeWidth={10} strokeLinecap="round" />)}
              </g>
            ))}
            {/* jingle at the reveal of the ball */}
            {within(t, JINGLE, JINGLE + 1.6) && <StageWord t={t} at={JINGLE} until={JINGLE + 1.6} text="JINGLE!" x={LUNA_HOME + 200} y={f - 380} size={70} color="#ffca3a" rot={8} />}
            {/* luna listens for the bell (park, before leaving) */}
            {within(t, word('luna_go', 7), TRAIL0) && <Jingle t={t} from={[2000, f - 200]} to={[lx + 60, lunaFace(lx)[1] - 40]} loud={0.3} />}
          </g>
        )}

        {scene === 'trail' && (
          <g>
            <g>
              {[-120, -40, 40, 120].map((dx, i) => (
                <g key={i} transform={`translate(${FLOWERS_X + dx},${f})`}>
                  <path d="M 0,0 L 0,-110" stroke="#3a8d3a" strokeWidth={8} />
                  <Vol>{[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 20} cy={-120 + Math.sin((a * Math.PI) / 180) * 20} r={16} fill={['#ff6fa5', '#ffca3a', '#b388ff', '#ff924c'][i]} {...kst(4)} />)}<circle cx={0} cy={-120} r={12} fill="#ffd166" {...kst(4)} /></Vol>
                </g>
              ))}
            </g>
            <Pond t={t} />
            {t >= FROG0 - 0.2 && <Critter spec={FROG} x={POND_X + 140} y={f + 66} scale={0.22 * popIn(t, FROG0 - 0.2)} expr="happy" mouth={within(t, FROG0, FROG0 + 0.8) ? 0.9 : 0} hop={within(t, FROG0, FROG0 + 0.8) ? Math.sin(prog(t, FROG0, FROG0 + 0.8) * Math.PI) * 40 : 0} shadow={false} />}
            <HollowLog />
            {maxIn && (
              <Critter spec={MAX} x={maxX} y={f} scale={XS} expr={yay ? 'laugh' : 'happy'} look={[-0.6, -0.2]} mouth={lipSync(VO, 'max', t)}
                armL={yay ? 'up' : talks('max') ? 'wave' : 'down'} armR={maxHolds ? 'hold' : yay ? 'up' : 'down'} holdR={maxHolds ? bell(1.8) : undefined}
                hop={yay ? Math.abs(Math.sin(t * 7 + 2)) * 22 : 0} />
            )}
            {/* the jingle, louder as Luna gets closer */}
            {t < MAXOUT && <Jingle t={t} from={[LOG_X - 150, f - 100]} to={[lx + 60, lunaFace(lx)[1] - 40]} loud={prog(t, TRAIL0, S('peek'))} />}
          </g>
        )}
        {scene === 'park' && maxIn && (
          <Critter spec={MAX} x={MAX_PARK} y={f} scale={XS} expr={yay || t < S('yawn') ? 'laugh' : 'happy'} look={[-0.6, -0.2]} mouth={lipSync(VO, 'max', t)}
            armL={yay || t < S('yawn') ? 'up' : talks('max') ? 'wave' : 'down'} armR={yay || t < S('yawn') ? 'up' : 'down'} hop={yay || t < S('yawn') ? Math.abs(Math.sin(t * 6 + 2)) * 18 : 0} />
        )}

        {/* Luna */}
        {t >= REVEAL && (
          <Critter spec={LUNA} x={lx} y={f} scale={LS} expr={lunaExpr} look={listening ? [0.7, -0.4] : [0, 0.1]} mouth={lipSync(VO, 'luna', t)}
            armL={yay || stretching ? 'up' : talks('luna') && !listening ? 'wave' : 'down'} armR={lunaHolds ? 'hold' : yay || stretching ? 'up' : pounce ? 'point' : 'down'}
            holdR={lunaHolds ? bell(1.8) : undefined}
            walking={walking} walk={t * (tiptoe ? 1.4 : 2.4)} hop={lunaHop + (spinning ? Math.abs(Math.sin(t * 6)) * 24 : 0)} tilt={listening ? 8 + Math.sin(t * 3) * 6 : 0}
            squash={napping ? 0.4 : stretching ? -0.5 : 0} facing={spinning && Math.sin(t * 9) < 0 ? -1 : 1} />
        )}
        {/* the ball in flight */}
        {ball && <g transform={`translate(${ball[0]},${ball[1]})`}><RedBall rot={ballRot} /></g>}

        {/* FX */}
        <ImpactStar t={t} at={REVEAL} x={BUSH[0]} y={f - 220} s={0.9} />
        <Dust t={t} at={REVEAL + 0.6} x={LUNA_HOME} y={f} s={1.1} />
        <ImpactStar t={t} at={MAXOUT} x={LOG_X - 150} y={f - 120} s={0.8} color="#fff3b0" />
        <ImpactStar t={t} at={KICK} x={B_BOBO[0]} y={B_BOBO[1]} s={0.6} />
        <MotionLines t={t} from={S('luna_go') + 1.0} to={TRAIL0} x={lx - 150} y={f - 140} dir={180} n={3} len={90} spread={30} />
        <StageWord t={t} at={word('sound_a', 0)} until={E('sound_a') + 0.5} text="MEOW! MEOW!" x={LUNA_HOME} y={f - 440} size={80} color="#b388ff" rot={-6} />
        <StageWord t={t} at={word('sound_b', 0)} until={E('sound_b') + 0.6} text="MEOW! MEOW!" x={LUNA_HOME} y={f - 440} size={80} color="#b388ff" rot={6} />
        <StageWord t={t} at={S('purr')} until={E('purr') + 0.4} text="PURRRR..." x={LUNA_HOME} y={f - 440} size={80} color="#ff8fab" rot={-6} />
        <StageWord t={t} at={S('whisk')} until={E('whisk') + 0.4} text="BOING! BOING!" x={LUNA_HOME + 250} y={f - 300} size={70} color="#ffca3a" rot={8} />
        <StageWord t={t} at={word('tricks', 7)} until={S('trick2')} text="STRETCH!" x={LUNA_HOME + 280} y={f - 320} size={80} color="#52b788" rot={6} />
        <StageWord t={t} at={S('trick2')} until={S('trick3')} text="POUNCE!" x={LUNA_HOME + 280} y={f - 320} size={80} color="#ff924c" rot={-6} />
        <StageWord t={t} at={word('trick3', 4)} until={E('trick3') + 0.4} text="ROUND & ROUND!" x={LUNA_HOME + 280} y={f - 320} size={70} color="#b388ff" rot={6} />
        <StageWord t={t} at={word('play', 9)} until={KICK} text="BOUNCE!" x={800} y={f - 470} size={70} color="#ff595e" rot={-6} />
        <StageWord t={t} at={KICK} until={KICK + 1.4} text="OOPS!" x={BOBO_X + 120} y={f - 470} size={90} color="#ff924c" rot={8} />
        {scene === 'trail' && <StageWord t={t} at={S('tiptoe')} until={E('tiptoe') + 1.0} text="TIPTOE..." x={lx + 60} y={f - 420} size={80} color="#b388ff" rot={-6} />}
        {scene === 'trail' && <StageWord t={t} at={FROG0} until={FROG0 + 1.4} text="RIBBIT!" x={POND_X + 160} y={f - 260} size={80} color="#52b788" rot={8} />}
        {scene === 'trail' && <StageWord t={t} at={word('trail3', 5)} until={S('peek') - 0.2} text="JINGLE! JINGLE!" x={LOG_X - 120} y={f - 380} size={80} color="#ffca3a" rot={-6} />}
        <Reaction kind="?" t={t} at={E('guess2') + 0.1} until={REVEAL} x={BUSH[0]} y={f - 420} s={0.7} />
        <Reaction kind="cloud" t={t} at={word('rolled', 10)} until={S('help_q')} x={LUNA_HOME} y={f - 480} s={0.6} />
        <Reaction kind="idea" t={t} at={S('luna_go')} until={E('luna_go') + 0.3} x={LUNA_HOME} y={f - 460} s={0.7} />
        <Reaction kind="?" t={t} at={S('peek')} until={MAXOUT} x={LOG_X - 330} y={f - 460} s={0.6} />
        <Reaction kind="heart" t={t} at={GIVE + 0.8} until={GIVE + 2.6} x={(LOG_X - 330 + maxX) / 2} y={f - 380} s={0.8} />
        {napping && <StageWord t={t} at={word('yawn', 1)} until={S('again')} text="ZZZ..." x={1080} y={f - 400} size={70} color="#a0c4ff" rot={-6} />}
      </ActionStage>

      {/* screen-space */}
      <ThinkTimer t={t} from={onBeat(E('guess2') + 0.1)} to={REVEAL - 0.05} x={1760} y={190} r={90} label="WHO?" />
      <PopText t={t} at={REVEAL + 0.15} until={S('hello')} text="A CAT!" y={150} size={140} color="#b388ff" />
      <PopText t={t} at={E('sound_turn') - 0.6} until={S('sound_b') - 0.1} text="YOUR TURN!" y={150} size={120} color="#ffffff" />
      <PopText t={t} at={E('purr') - 0.6} until={S('facts') - 0.1} text="YOUR TURN!" y={150} size={120} color="#ffffff" />
      <PopText t={t} at={S('facts') + 0.2} until={S('fact1') - 0.1} text="3 CAT FACTS!" y={150} size={120} color="#b388ff" />
      <PopText t={t} at={S('fact1')} until={S('fact2') - 0.2} text="1  SUPER EARS" y={150} size={100} color="#b388ff" />
      <PopText t={t} at={S('fact2')} until={S('fact3') - 0.2} text="2  WHISKERS FEEL THINGS" y={150} size={90} color="#ffca3a" />
      <PopText t={t} at={S('fact3')} until={E('wow') + 0.4} text="3  CATS SLEEP A LOT" y={150} size={90} color="#4cc9f0" />
      <PopText t={t} at={S('tricks')} until={S('trick_turn') - 0.1} text="KITTY PLAY!" y={150} size={110} color="#b388ff" />
      <PopText t={t} at={S('trick_turn') + 0.6} until={S('play') - 0.1} text="YOUR TURN: STRETCH!" y={150} size={100} color="#ffffff" />
      <PopText t={t} at={word('rolled', 10)} until={S('help_q') - 0.1} text="WHERE IS THE BALL?" y={150} size={100} color="#a0c4ff" />
      <ThinkTimer t={t} from={onBeat(E('help_q') + 0.1)} to={S('luna_go') - 0.1} x={1760} y={190} r={90} label="THINK!" />
      <PopText t={t} at={S('luna_go') + 1.0} until={TRAIL0} text="LISTEN..." y={150} size={120} color="#ffca3a" />
      <PopText t={t} at={E('tiptoe') - 0.4} until={S('trail2') - 0.1} text="YOUR TURN!" y={150} size={110} color="#ffffff" />
      <PopText t={t} at={S('luna_thx')} until={S('max_give') - 0.1} text="FOUND IT!" y={150} size={120} color="#ffca3a" />
      <PopText t={t} at={S('together')} until={S('lesson') - 0.2} text="PLAY TOGETHER!" y={150} size={110} color="#ff924c" />
      <PopText t={t} at={word('lesson', 0)} until={S('safe') - 0.2} text="GIVE IT BACK · PLAY TOGETHER" y={150} size={76} color="#52b788" />
      <PopText t={t} at={S('safe') + 0.2} until={S('catch') - 0.2} text="ASK A GROWN-UP!" y={150} size={100} color="#ff8fab" />
      <PopText t={t} at={S('again') + 0.2} until={S('q1') - 0.1} text="LET'S REMEMBER!" y={150} size={110} color="#ffca3a" />
      {(['q1', 'q2', 'q3', 'q4', 'q5'] as const).map((q, i) => (
        <ThinkTimer key={q} t={t} from={onBeat(E(q) + 0.1)} to={S((['a1', 'a2', 'a3', 'a4', 'a5'] as const)[i]) - 0.1} x={1760} y={190} r={90} label="THINK!" />
      ))}
      <PopText t={t} at={S('a1')} until={S('q2') - 0.2} text="MEOW! MEOW!" y={150} size={130} color="#b388ff" />
      <PopText t={t} at={S('a2')} until={S('q3') - 0.2} text="HAPPY & COZY!" y={150} size={120} color="#ff8fab" />
      <PopText t={t} at={S('a3')} until={S('q4') - 0.2} text="SUPER EARS!" y={150} size={120} color="#b388ff" />
      <PopText t={t} at={S('a4')} until={S('q5') - 0.2} text="MAX THE PUPPY!" y={150} size={110} color="#ff924c" />
      <PopText t={t} at={S('a5')} until={S('chant') - 0.2} text="WHISKERS!" y={150} size={130} color="#ffca3a" />
      <PopText t={t} at={S('c1')} until={S('c2') - 0.1} text="LISTEN, LISTEN!" y={150} size={120} color="#b388ff" />
      <PopText t={t} at={S('c2')} until={S('c3') - 0.1} text="JINGLE, JINGLE!" y={150} size={120} color="#ffca3a" />
      <PopText t={t} at={S('c3')} until={S('c_turn') - 0.1} text="LUNA FINDS THE BALL!" y={150} size={100} color="#b388ff" />
      <PopText t={t} at={E('c_turn') - 0.6} until={S('bye') - 0.1} text="YOUR TURN!" y={150} size={120} color="#ffffff" />
      <PopText t={t} at={S('bye')} until={E('bye2') + 0.6} text="SEE YOU NEXT TIME!" y={150} size={100} color="#b388ff" />
      <Confetti t={t} at={REVEAL + 0.1} y={420} />
      <Confetti t={t} at={S('luna_thx')} y={420} />
      <Confetti t={t} at={S('c3')} y={420} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <SparksIntro t={t} at={0} cast={{ kids: [MILA_HERO, LEO_HERO], buddy: BOBO_HERO }} />
      <StarWipe t={t} at={E('bye2') + 0.6} dur={0.5} hold={5} color="#3b2a4a" x={W / 2} y={H * 0.45} />
    </>
  );
}
