// TINY SPARKS · Day 53 · 🦁 Animal Stories #8 — "Max the Dog Saves the Day" (LONG 16:9)
// kids-shorts/tiny-sparks/animals/day-053-max-the-dog-saves-the-day. Cues from VO via K (keys.gen.ts).
// ENERGY LAYER standard: ident → GUESS WHO (a black nose sniffs out of a bush, a tail wags behind it, think timer) →
// Max the puppy hops out → MEET Super Bobo (picnic!) → SOUND "woof" (your turn) → 3 TRUE FACTS (a super nose — scent
// swirls from the sandwich basket · a fast, wiggly tail often means happy · puppies are born with their eyes closed —
// three sleepy puppies in a basket) → STORY (value: friendship): at the picnic Bella counts her friends — Kiki the
// kitten is missing (worried, not scary) → "Who has a super nose?" (think timer) → Max follows Kiki's paw prints:
// past the flowers (sniff with Max, your turn), past the pond, to a hollow log → Kiki was playing hide and seek and
// fell asleep → found! hugs → "Max saved the day!" → friends look out for each other + "we stay close" → picnic with a
// doggy treat → LET'S REMEMBER (4 questions, think timers) → chant "Sniff, sniff! Wag, wag! Max saves the day!" → bye.
import React from 'react';
import { Critter, critterFaceAt, type CArm, type CritterSpec } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR } from '../../lib/kids/sets';
import { Backdrop } from '../../lib/kids/places';
import { Confetti, KidsCaptions, PopText, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, Dust, ImpactStar, MotionLines, Reaction, SparksIntro, StageWord, StarWipe, directorCam, onBeat, type Shot } from '../../lib/kids/energy';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsAnimals053', durationInSeconds: 303.3, fps: 30, width: 1920, height: 1080 };

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
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff', max: '#ff924c', bella: '#ff8fab', kiki: '#ffb067' };
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
const MAX: CritterSpec = { id: 'max', species: 'dog', fur: '#e9a35b', fur2: '#fff3e0', dark: '#8d5a3b', scarf: '#ff595e' };
const KIKI: CritterSpec = { id: 'kiki', species: 'cat', fur: '#ffb067', fur2: '#fff3e0', dark: '#e07a2f', bow: '#ff6fa5' };
const BELLA: CritterSpec = { id: 'bella', species: 'bunny', fur: '#ffffff', fur2: '#ffe3ec', dark: '#ff8fab', bow: '#ff6fa5' };
const PUP = (i: number): CritterSpec => ({ id: `pup${i}`, species: 'dog', fur: ['#e9a35b', '#c8a27a', '#f3e3d3'][i], fur2: '#fff3e0', dark: '#8d5a3b' });
const XS = 0.52;
const BS = 0.6;
const BELS = 0.55;
const KS = 0.38;

// ── scenes
const TRAIL0 = S('trail1') - 0.3;
const BACK0 = S('lesson') - 0.3; // back at the picnic
type Scene = 'park' | 'trail';
const sceneAt = (t: number): Scene => (t >= TRAIL0 && t < BACK0 ? 'trail' : 'park');

// park layout
const BUSH: [number, number] = [1300, f];
const BOBO_X = 520;
const BELLA_X = 760;
const MAX_HOME = 1100;
const BASKET: [number, number] = [880, f + 20];
// trail layout
const FLOWERS_X = 520;
const POND_X = 980;
const LOG_X = 1500;

// ── anchors
const REVEAL = word('reveal', 2) - 0.05;
const SNIFF1 = S('sniff');
const PUPS0 = word('fact3', 4);
const MISSING = word('bella_q', 3);
const GO = word('max_go', 4);
const PEEK = S('peek');
const KIKI_OUT = word('kiki', 3);
const ARRIVE = S('found') - 0.6;
const HUG = word('kiki2', 7);

const MAX_X: KF = [
  [0, BUSH[0]], [REVEAL, BUSH[0]], [REVEAL + 0.6, MAX_HOME],
  [GO, MAX_HOME], [TRAIL0 - 0.05, 2100],
  [TRAIL0, 160], [S('trail1') + 0.3, 160], [S('trail1') + 2.6, FLOWERS_X + 80], [S('trail2'), FLOWERS_X + 80], [S('trail2') + 1.6, POND_X - 330],
  [S('trail3'), POND_X - 330], [S('trail3') + 2.0, LOG_X - 260], [BACK0, LOG_X - 260],
  [BACK0 + 0.01, MAX_HOME],
];

// ── camera
const maxFace = (x: number) => critterFaceAt(x, f, XS);
const boboFace = critterFaceAt(BOBO_X, f, BS);
const bellaFace = critterFaceAt(BELLA_X, f, BELS);
const SHOTS: Shot[] = [
  { t: 0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.01 },
  { t: S('guess') - 0.3, z: 1.5, x: BUSH[0], y: f - 200, move: 'smooth', dur: 1.6, push: 0.02 },
  { t: REVEAL - 0.05, z: 1.5, x: MAX_HOME, y: maxFace(MAX_HOME)[1] + 80, move: 'snap', push: 0.01 },
  { t: S('bobo_hi') - 0.2, z: 1.5, x: BOBO_X + 30, y: boboFace[1] + 100, move: 'whip' },
  { t: S('max_yes') - 0.2, z: 1.5, x: MAX_HOME, y: maxFace(MAX_HOME)[1] + 80, move: 'whip' },
  { t: S('sound_turn') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('sound_b') - 0.2, z: 1.55, x: MAX_HOME, y: maxFace(MAX_HOME)[1] + 80, move: 'snap' },
  { t: S('sounds') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('yip') - 0.2, z: 1.55, x: MAX_HOME, y: maxFace(MAX_HOME)[1] + 80, move: 'snap' },
  { t: S('facts') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.7 },
  { t: S('sniff') - 0.2, z: 1.35, x: (BASKET[0] + MAX_HOME) / 2, y: f - 200, move: 'smooth', dur: 0.8 },
  { t: S('fact2') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('wag') - 0.2, z: 1.4, x: MAX_HOME + 40, y: f - 200, move: 'snap' },
  { t: S('fact3') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: PUPS0 + 0.3, z: 1.6, x: 1500, y: f - 120, move: 'smooth', dur: 1.0, push: 0.02 },
  { t: S('wow') - 0.2, z: 1.5, x: BOBO_X + 30, y: boboFace[1] + 100, move: 'whip' },
  { t: S('tricks') - 0.2, z: 1.35, x: MAX_HOME, y: f - 230, move: 'smooth', dur: 0.8, push: 0.02 },
  { t: S('trick_turn') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('picnic') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 },
  { t: S('bella_q') - 0.2, z: 1.6, x: BELLA_X, y: bellaFace[1] + 80, move: 'smooth', dur: 0.8, push: 0.02 },
  { t: S('worried') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 },
  { t: S('max_go') - 0.2, z: 1.55, x: MAX_HOME, y: maxFace(MAX_HOME)[1] + 80, move: 'snap' },
  { t: TRAIL0, z: 1.1, x: 600, y: 600, move: 'cut', push: 0.01 },
  { t: S('trail2') - 0.2, z: 1.1, x: 1000, y: 600, move: 'smooth', dur: 1.6 },
  { t: S('trail3') - 0.2, z: 1.1, x: 1300, y: 600, move: 'smooth', dur: 2.0 },
  { t: S('peek') - 0.2, z: 1.5, x: LOG_X - 120, y: f - 200, move: 'smooth', dur: 0.8, push: 0.02 },
  { t: KIKI_OUT - 0.1, z: 1.6, x: LOG_X + 60, y: f - 160, move: 'snap' },
  { t: S('found') - 0.2, z: 1.0, x: 1100, y: 560, move: 'smooth', dur: 0.8 },
  { t: S('kiki_hi') - 0.2, z: 1.6, x: LOG_X - 30, y: f - 160, move: 'snap' },
  { t: S('laugh') - 0.2, z: 1.0, x: 1100, y: 560, move: 'smooth', dur: 0.6 },
  { t: S('hero') - 0.2, z: 1.3, x: 1150, y: f - 280, move: 'smooth', dur: 0.8 },
  { t: BACK0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.01 },
  { t: S('rule') - 0.2, z: 1.6, x: BELLA_X, y: bellaFace[1] + 80, move: 'snap' },
  { t: S('feast') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 },
  { t: S('a1') - 0.1, z: 1.55, x: MAX_HOME, y: maxFace(MAX_HOME)[1] + 80, move: 'snap' },
  { t: E('a1') + 0.6, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('a3') - 0.1, z: 1.55, x: MAX_HOME, y: maxFace(MAX_HOME)[1] + 80, move: 'snap' },
  { t: E('a3') + 0.6, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('a4') - 0.1, z: 1.55, x: BELLA_X, y: bellaFace[1] + 80, move: 'snap' },
  { t: E('a4') + 0.6, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('c1') - 0.1, z: 1.2, x: 960, y: 580, move: 'smooth', dur: 0.6, push: 0.02 },
  { t: S('c_turn') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
];
const PUNCHES = [REVEAL, KIKI_OUT, S('hero')];

// ── props
const Bush: React.FC<{ x: number; t: number }> = ({ x, t }) => (
  <g>
    {[-120, 120, 0].map((dx, i) => (
      <Vol key={dx}><circle cx={x + dx} cy={f - 110 - (dx === 0 ? 30 : 0) + Math.sin(t * 2 + i) * 2} r={dx === 0 ? 150 : 125} fill={dx === 0 ? '#74c69d' : '#52b788'} {...kst(7)} /></Vol>
    ))}
    {[[-150, -170], [60, -230], [150, -120]].map(([dx, dy], i) => <circle key={i} cx={x + dx} cy={f + dy} r={14} fill="#ff6fa5" {...kst(4)} />)}
  </g>
);
const PicnicBasket: React.FC = () => (
  <g>
    <path d="M -90,-60 Q 0,-170 90,-60" fill="none" stroke="#a0673c" strokeWidth={12} />
    <Vol><path d="M -100,-60 L 100,-60 L 80,30 L -80,30 Z" fill="#d9a066" {...kst(7)} /></Vol>
    <Vol><path d="M -70,-60 L 70,-60 L 50,-90 L -50,-90 Z" fill="#ffffff" {...kst(5)} /></Vol>
    <path d="M -40,-75 L 40,-75" stroke="#ff8fab" strokeWidth={10} />
  </g>
);
const Blanket: React.FC = () => (
  <g>
    <Vol kind="slope"><path d={`M 380,${f - 30} L 1520,${f - 30} L 1600,${f + 90} L 300,${f + 90} Z`} fill="#4cc9f0" {...kst(7)} /></Vol>
    {Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M ${430 + i * 150},${f - 30} L ${390 + i * 160},${f + 90}`} stroke="#ffffff" strokeWidth={14} opacity={0.55} />)}
  </g>
);
const Pond: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Vol kind="slope"><ellipse cx={POND_X} cy={f + 80} rx={240} ry={50} fill="#4cc9f0" {...kst(7)} /></Vol>
    {[0, 1].map((i) => <ellipse key={i} cx={POND_X - 60 + i * 120} cy={f + 80} rx={40 + ((t * 30 + i * 20) % 40)} ry={10 + ((t * 8 + i * 5) % 10)} fill="none" stroke="#ffffff" strokeWidth={4} opacity={0.6} />)}
    <Vol><ellipse cx={POND_X + 140} cy={f + 70} rx={40} ry={14} fill="#52b788" {...kst(4)} /></Vol>
  </g>
);
const HollowLog: React.FC = () => (
  <g>
    <Vol kind="tube"><rect x={LOG_X - 150} y={f - 160} width={360} height={170} rx={80} fill="#a0673c" {...kst(8)} /></Vol>
    <Vol><ellipse cx={LOG_X - 150} cy={f - 75} rx={56} ry={86} fill="#e9c19a" {...kst(7)} /></Vol>
    <ellipse cx={LOG_X - 150} cy={f - 75} rx={36} ry={62} fill="#3b2a4a" />
  </g>
);
const Treat: React.FC = () => (
  <Vol><path d="M -40,-10 a 14,14 0 1 1 10,-14 L 30,-24 a 14,14 0 1 1 10,14 a 14,14 0 1 1 -10,14 L -30,4 a 14,14 0 1 1 -10,-14 Z" fill="#e9c19a" {...kst(5)} /></Vol>
);
const Scent: React.FC<{ t: number; from: [number, number]; to: [number, number] }> = ({ t, from, to }) => (
  <g>
    {[0, 1, 2].map((i) => {
      const p = (t * 0.6 + i / 3) % 1;
      const x = from[0] + (to[0] - from[0]) * p;
      const y = from[1] + (to[1] - from[1]) * p - Math.sin(p * Math.PI) * 60;
      return <path key={i} d={`M ${x},${y} q 15,-20 0,-40 q -15,-20 0,-40`} fill="none" stroke="#b388ff" strokeWidth={8} strokeLinecap="round" opacity={0.8 * Math.sin(p * Math.PI)} />;
    })}
  </g>
);
const Paw: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} fill="#8d6e63" opacity={0.7}>
    <ellipse cx={0} cy={6} rx={12} ry={9} />
    {[-12, -4, 4, 12].map((dx) => <circle key={dx} cx={dx} cy={-8 - Math.abs(dx) * 0.2} r={4.5} />)}
  </g>
);

export default function KidsAnimals053() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const scene = sceneAt(t);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);

  const mx = lerpKF(t, MAX_X);
  const walking = moving(t, MAX_X);
  const sniffing = within(t, S('sniff'), E('sniff')) || within(t, S('trail1'), S('peek')) || within(t, S('max_go'), TRAIL0) || within(t, S('c1'), E('c1')) || within(t, S('a3'), E('a3'));
  const wagging = within(t, S('wag'), E('wag') + 0.5) || within(t, S('c2'), E('c2'));
  const yay = within(t, S('hero'), E('hero') + 0.8) || within(t, S('c1'), E('c3') + 0.5) || t >= S('bye') || within(t, S('feast'), E('feast'));
  const worried = within(t, MISSING, S('max_go')) || (scene === 'trail' && t < KIKI_OUT && t > TRAIL0);
  const sitting = within(t, word('tricks', 7), S('trick2'));
  const paw = within(t, S('trick2'), S('trick3'));
  const spinning = within(t, word('trick3', 3), E('trick3') + 0.4) || within(t, word('trick_turn', 3), E('trick_turn') + 2.0);
  const maxExpr: KExpr = t < REVEAL + 0.6 ? 'surprised' : within(t, S('peek'), KIKI_OUT) ? 'think' : wagging || yay ? 'laugh' : sniffing ? 'happy' : talks('max') ? 'happy' : 'smile';
  const maxHop = (t >= REVEAL && t < REVEAL + 0.6 ? Math.sin(prog(t, REVEAL, REVEAL + 0.6) * Math.PI) * 160 : 0) + (walking ? Math.abs(Math.sin(t * 8)) * 18 : 0) + (yay && !walking ? Math.abs(Math.sin(t * 7)) * 22 : 0);
  const kikiVisible = (scene === 'trail' && t >= KIKI_OUT) || (scene === 'park' && t >= BACK0);
  const kikiX = scene === 'trail' ? LOG_X - 150 + EASE_OUT(prog(t, KIKI_OUT, KIKI_OUT + 1.0)) * 120 : 1340;
  const friendsIn = scene === 'trail' && t >= ARRIVE;
  const bellaX = scene === 'trail' ? lerpKF(t, [[ARRIVE, -200], [ARRIVE + 1.6, 1000]]) : BELLA_X;
  const boboX = scene === 'trail' ? lerpKF(t, [[ARRIVE, -400], [ARRIVE + 1.8, 760]]) : BOBO_X;
  const friendExpr = (who: string): KExpr => (worried ? 'sad' : within(t, S('wow'), E('wow') + 0.4) && who === 'bobo' ? 'wow' : yay || within(t, S('found'), E('kiki2') + 0.5) ? 'laugh' : talks(who) ? 'happy' : 'smile');
  const friendArm = (who: string): CArm => (yay ? 'up' : talks(who) ? 'wave' : within(t, HUG, HUG + 1.5) && who === 'bella' ? 'hug' : 'down');

  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
        {scene === 'trail' ? <Backdrop place="forest" w={W} h={H} t={t} /> : <Backdrop place="meadow" w={W} h={H} t={t} fx={['butterflies', 'birds']} />}

        {scene === 'park' && (
          <g>
            {t >= S('picnic') - 0.5 && <Blanket />}
            {t < S('picnic') - 0.5 && <g transform={`translate(${BASKET[0]},${BASKET[1]})`}><PicnicBasket /></g>}
            {t >= S('picnic') - 0.5 && <g transform={`translate(${BASKET[0] + 60},${f + 10})`}><PicnicBasket /></g>}
            {/* the three sleepy puppies (fact 3) */}
            {within(t, PUPS0, S('picnic') - 0.3) && (
              <g transform={`translate(1500,${f}) scale(${popIn(t, PUPS0)})`}>
                {[-90, 0, 90].map((dx, i) => <Critter key={i} spec={PUP(i)} x={dx} y={-30} scale={0.2} expr="sleepy" idle={false} shadow={false} />)}
                <Vol><path d="M -170,-40 L 170,-40 L 140,30 L -140,30 Z" fill="#d9a066" {...kst(6)} /></Vol>
                <path d="M -150,-40 Q 0,-10 150,-40" fill="#ffffff" opacity={0.6} />
              </g>
            )}
            {t < REVEAL + 0.5 && <Bush x={BUSH[0]} t={t} />}
            {/* the hook: a nose sniffing out of the bush, a tail wagging behind it */}
            {t < REVEAL && (
              <g>
                <path d={`M ${BUSH[0] + 200},${f - 150} q ${30 + Math.sin(t * 14) * 30},-40 ${40 + Math.sin(t * 14) * 30},-90`} fill="none" stroke={MAX.fur} strokeWidth={30} strokeLinecap="round" />
                {t >= word('guess', 3) && <g transform={`translate(${BUSH[0] - 220 + Math.sin(t * 6) * 6},${f - 140})`}><ellipse rx={30} ry={22} fill={KINK} /><ellipse cx={-8} cy={-8} rx={8} ry={5} fill="#ffffff" opacity={0.6} /></g>}
              </g>
            )}
            {/* Bobo + Bella */}
            {t >= S('bobo_hi') - 2 && (
              <g>
                <Critter spec={BOBO_HERO} x={BOBO_X} y={f} scale={BS} expr={friendExpr('bobo')} look={[0.6, -0.1]} mouth={lipSync(VO, 'bobo', t)} armL={friendArm('bobo')} armR={friendArm('bobo')} hop={yay ? Math.abs(Math.sin(t * 7 + 1)) * 22 : 0} />
                {t >= S('picnic') - 0.5 && (
                  <Critter spec={BELLA} x={BELLA_X} y={f} scale={BELS} expr={friendExpr('bella')} look={within(t, MISSING, S('worried') + 2) ? [Math.sin(t * 2), -0.2] : [0.6, -0.2]} mouth={lipSync(VO, 'bella', t)} armL={friendArm('bella')} armR={within(t, S('picnic'), MISSING) ? 'point' : friendArm('bella')} hop={yay ? Math.abs(Math.sin(t * 7 + 2)) * 22 : 0} />
                )}
              </g>
            )}
            {kikiVisible && <Critter spec={KIKI} x={kikiX} y={f} scale={KS} expr={yay ? 'laugh' : 'happy'} look={[-0.6, -0.2]} hop={yay ? Math.abs(Math.sin(t * 7 + 3)) * 20 : 0} armL={yay ? 'up' : 'down'} armR={yay ? 'up' : 'down'} />}
            {/* scent swirls (fact 1) */}
            {within(t, S('fact1') + 1.0, E('sniff') + 0.5) && <Scent t={t} from={[BASKET[0], f - 120]} to={[MAX_HOME - 80, maxFace(MAX_HOME)[1] + 40]} />}
          </g>
        )}

        {scene === 'trail' && (
          <g>
            {/* Kiki's paw prints leading to the log */}
            {Array.from({ length: 12 }).map((_, i) => <Paw key={i} x={260 + i * 105} y={f + 50 + (i % 2) * 18} s={0.9} />)}
            <g>
              {[-120, -40, 40, 120].map((dx, i) => (
                <g key={i} transform={`translate(${FLOWERS_X + dx},${f})`}>
                  <path d="M 0,0 L 0,-110" stroke="#3a8d3a" strokeWidth={8} />
                  <Vol>{[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 20} cy={-120 + Math.sin((a * Math.PI) / 180) * 20} r={16} fill={['#ff6fa5', '#ffca3a', '#b388ff', '#ff924c'][i]} {...kst(4)} />)}<circle cx={0} cy={-120} r={12} fill="#ffd166" {...kst(4)} /></Vol>
                </g>
              ))}
            </g>
            <Pond t={t} />
            <g transform={`translate(330,${f - 40})`}><Vol><circle r={44} fill="#ff595e" {...kst(6)} /></Vol><path d="M -44,0 Q 0,20 44,0" fill="none" stroke="#ffffff" strokeWidth={8} /></g>
            <HollowLog />
            {kikiVisible && (
              <Critter spec={KIKI} x={kikiX} y={f} scale={KS} expr={t < S('found') ? 'sleepy' : within(t, HUG, HUG + 1.5) ? 'laugh' : 'happy'} look={[-0.6, -0.2]}
                mouth={within(t, word('kiki2', 2), word('kiki2', 4)) || within(t, S('kiki_hi'), word('kiki_hi', 1)) ? 0.9 : lipSync(VO, 'kiki', t)} armL={within(t, HUG, HUG + 1.5) ? 'hug' : 'down'} armR={within(t, HUG, HUG + 1.5) ? 'hug' : 'down'} />
            )}
            {friendsIn && (
              <g>
                <Critter spec={BOBO_HERO} x={boboX} y={f} scale={BS} expr={friendExpr('bobo')} look={[0.6, -0.1]} mouth={lipSync(VO, 'bobo', t)} armL={friendArm('bobo')} armR={friendArm('bobo')}
                  walking={moving(t, [[ARRIVE, -400], [ARRIVE + 1.8, 760]])} walk={t * 2} hop={yay ? Math.abs(Math.sin(t * 7 + 1)) * 22 : 0} />
                <Critter spec={BELLA} x={bellaX} y={f} scale={BELS} expr={friendExpr('bella')} look={[0.6, -0.2]} mouth={lipSync(VO, 'bella', t)} armL={friendArm('bella')} armR={friendArm('bella')}
                  hop={moving(t, [[ARRIVE, -200], [ARRIVE + 1.6, 1000]]) ? Math.abs(Math.sin(t * 9)) * 50 : yay ? Math.abs(Math.sin(t * 7 + 2)) * 22 : 0} />
              </g>
            )}
            {/* sniff swirls at Max's nose */}
            {sniffing && <Scent t={t} from={[mx + 260, f - 40]} to={[mx + 90, maxFace(mx)[1] + 40]} />}
          </g>
        )}

        {/* Max */}
        {t >= REVEAL && (
          <Critter spec={MAX} x={mx} y={f} scale={XS} expr={maxExpr} look={sniffing ? [0.6, 0.6] : [0, 0.1]} mouth={lipSync(VO, 'max', t)}
            armL={yay ? 'up' : talks('max') && !sniffing && !paw ? 'wave' : 'down'} armR={yay ? 'up' : paw ? 'point' : 'down'} holdR={within(t, word('feast', 8), BACK0 + 999) && t < S('again') ? <Treat /> : undefined}
            walking={walking} walk={t * 2.4} hop={maxHop + (spinning ? Math.abs(Math.sin(t * 6)) * 30 : 0)} tilt={sniffing ? 10 + Math.sin(t * 10) * 4 : 0}
            squash={sitting ? 0.3 : 0} facing={spinning && Math.sin(t * 9) < 0 ? -1 : 1} />
        )}

        {/* FX */}
        <ImpactStar t={t} at={REVEAL} x={BUSH[0]} y={f - 220} s={0.9} />
        <Dust t={t} at={REVEAL + 0.6} x={MAX_HOME} y={f} s={1.1} />
        <ImpactStar t={t} at={KIKI_OUT} x={LOG_X - 150} y={f - 120} s={0.8} color="#fff3b0" />
        <MotionLines t={t} from={GO} to={TRAIL0} x={mx - 150} y={f - 160} dir={180} n={3} len={90} spread={30} />
        <StageWord t={t} at={word('sound_a', 0)} until={E('sound_a') + 0.5} text="WOOF! WOOF!" x={MAX_HOME} y={f - 470} size={80} color="#ff924c" rot={-6} />
        <StageWord t={t} at={word('sound_b', 0)} until={E('sound_b') + 0.6} text="WOOF! WOOF!" x={MAX_HOME} y={f - 470} size={80} color="#ff924c" rot={6} />
        <StageWord t={t} at={S('sniff')} until={E('sniff') + 0.3} text="SNIFF! SNIFF!" x={(BASKET[0] + MAX_HOME) / 2} y={f - 430} size={70} color="#b388ff" rot={-6} />
        <StageWord t={t} at={S('wag')} until={E('wag') + 0.5} text="WAG! WAG!" x={MAX_HOME + 140} y={f - 430} size={80} color="#ffca3a" rot={8} />
        {scene === 'trail' && <StageWord t={t} at={S('trail_turn')} until={E('trail_turn') + 1.5} text="SNIFF! SNIFF!" x={mx + 60} y={f - 440} size={80} color="#b388ff" rot={-6} />}
        {scene === 'trail' && <StageWord t={t} at={KIKI_OUT + 0.3} until={KIKI_OUT + 2.4} text="ZZZ..." x={LOG_X - 40} y={f - 300} size={70} color="#a0c4ff" rot={-6} />}
        <Reaction kind="?" t={t} at={E('guess2') + 0.1} until={REVEAL} x={BUSH[0]} y={f - 400} s={0.7} />
        {scene === 'trail' && <StageWord t={t} at={word('achoo', 2)} until={word('achoo', 2) + 1.2} text="ACHOO!" x={mx + 60} y={f - 440} size={90} color="#4cc9f0" rot={8} />}
        <StageWord t={t} at={S('yip')} until={E('yip') + 0.4} text="YIP! YIP!" x={MAX_HOME} y={f - 470} size={80} color="#ffca3a" rot={-6} />
        <StageWord t={t} at={word('tricks', 7)} until={S('trick2')} text="SIT!" x={MAX_HOME + 160} y={f - 420} size={80} color="#52b788" rot={6} />
        <StageWord t={t} at={S('trick2')} until={S('trick3')} text="PAW!" x={MAX_HOME + 160} y={f - 420} size={80} color="#ff924c" rot={-6} />
        <StageWord t={t} at={word('trick3', 3)} until={E('trick3') + 0.4} text="SPIN!" x={MAX_HOME + 160} y={f - 420} size={80} color="#b388ff" rot={6} />
        <Reaction kind="!" t={t} at={MISSING} until={S('help_q')} x={BELLA_X} y={f - 520} s={0.7} />
        <Reaction kind="cloud" t={t} at={S('worried')} until={S('max_go')} x={BOBO_X} y={f - 560} s={0.6} />
        <Reaction kind="idea" t={t} at={S('max_go')} until={E('max_go') + 0.3} x={MAX_HOME} y={f - 480} s={0.7} />
        <Reaction kind="?" t={t} at={S('peek')} until={KIKI_OUT} x={LOG_X - 260} y={f - 480} s={0.6} />
        <Reaction kind="heart" t={t} at={HUG} until={HUG + 1.8} x={LOG_X - 100} y={f - 360} s={0.8} />
      </ActionStage>

      {/* screen-space */}
      <ThinkTimer t={t} from={onBeat(E('guess2') + 0.1)} to={REVEAL - 0.05} x={1760} y={190} r={90} label="WHO?" />
      <PopText t={t} at={REVEAL + 0.15} until={S('hello')} text="A DOG!" y={150} size={140} color="#ff924c" />
      <PopText t={t} at={E('sound_turn') - 0.6} until={S('sound_b') - 0.1} text="YOUR TURN!" y={150} size={120} color="#ffffff" />
      <PopText t={t} at={E('yip') - 0.6} until={S('facts') - 0.1} text="YOUR TURN!" y={150} size={120} color="#ffffff" />
      <PopText t={t} at={S('tricks')} until={S('trick_turn') - 0.1} text="DOGGY TRICKS!" y={150} size={110} color="#ff924c" />
      <PopText t={t} at={S('trick_turn') + 0.6} until={S('picnic') - 0.1} text="YOUR TURN: SPIN!" y={150} size={110} color="#ffffff" />
      <PopText t={t} at={S('facts') + 0.2} until={S('fact1') - 0.1} text="3 DOG FACTS!" y={150} size={120} color="#ff924c" />
      <PopText t={t} at={S('fact1')} until={S('fact2') - 0.2} text="1  A SUPER NOSE" y={150} size={90} color="#b388ff" />
      <PopText t={t} at={S('fact2')} until={S('fact3') - 0.2} text="2  WAGGY TAIL = HAPPY" y={150} size={90} color="#ffca3a" />
      <PopText t={t} at={S('fact3')} until={E('wow') + 0.4} text="3  PUPPIES: EYES CLOSED" y={150} size={90} color="#4cc9f0" />
      <PopText t={t} at={S('worried') + 0.3} until={S('help_q') - 0.1} text="WHERE IS KIKI?" y={150} size={110} color="#a0c4ff" />
      <ThinkTimer t={t} from={onBeat(E('help_q') + 0.1)} to={S('max_go') - 0.1} x={1760} y={190} r={90} label="WHO?" />
      <PopText t={t} at={E('trail_turn') - 0.4} until={S('trail2') - 0.1} text="YOUR TURN!" y={150} size={110} color="#ffffff" />
      <PopText t={t} at={S('found')} until={S('kiki_hi') - 0.1} text="FOUND HER!" y={150} size={120} color="#ffca3a" />
      <PopText t={t} at={S('hero')} until={S('lesson') - 0.2} text="MAX SAVED THE DAY!" y={150} size={100} color="#ff924c" />
      <PopText t={t} at={word('lesson', 0)} until={S('rule') - 0.2} text="FRIENDS LOOK OUT FOR EACH OTHER" y={150} size={70} color="#52b788" />
      <PopText t={t} at={S('rule') + 1.0} until={S('feast') - 0.2} text="STAY CLOSE!" y={150} size={110} color="#ff8fab" />
      <PopText t={t} at={S('again') + 0.2} until={S('q1') - 0.1} text="LET'S REMEMBER!" y={150} size={110} color="#ffca3a" />
      {(['q1', 'q2', 'q3', 'q4', 'q5'] as const).map((q, i) => (
        <ThinkTimer key={q} t={t} from={onBeat(E(q) + 0.1)} to={S((['a1', 'a2', 'a3', 'a4', 'a5'] as const)[i]) - 0.1} x={1760} y={190} r={90} label="THINK!" />
      ))}
      <PopText t={t} at={S('a1')} until={S('q2') - 0.2} text="WOOF! WOOF!" y={150} size={130} color="#ff924c" />
      <PopText t={t} at={S('a2')} until={S('q3') - 0.2} text="HAPPY!" y={150} size={140} color="#ffca3a" />
      <PopText t={t} at={S('a3')} until={S('q4') - 0.2} text="A SUPER NOSE!" y={150} size={120} color="#b388ff" />
      <PopText t={t} at={S('a4')} until={S('q5') - 0.2} text="IN A HOLLOW LOG!" y={150} size={110} color="#a0673c" />
      <PopText t={t} at={S('a5')} until={S('chant') - 0.2} text="EYES CLOSED!" y={150} size={120} color="#4cc9f0" />
      <PopText t={t} at={S('c1')} until={S('c2') - 0.1} text="SNIFF, SNIFF!" y={150} size={120} color="#b388ff" />
      <PopText t={t} at={S('c2')} until={S('c3') - 0.1} text="WAG, WAG!" y={150} size={120} color="#ffca3a" />
      <PopText t={t} at={S('c3')} until={S('c_turn') - 0.1} text="MAX SAVES THE DAY!" y={150} size={100} color="#ff924c" />
      <PopText t={t} at={E('c_turn') - 0.6} until={S('bye') - 0.1} text="YOUR TURN!" y={150} size={120} color="#ffffff" />
      <PopText t={t} at={S('bye')} until={E('bye2') + 0.6} text="SEE YOU NEXT TIME!" y={150} size={100} color="#ff924c" />
      <Confetti t={t} at={REVEAL + 0.1} y={420} />
      <Confetti t={t} at={S('hero')} y={420} />
      <Confetti t={t} at={S('c3')} y={420} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <SparksIntro t={t} at={0} cast={{ kids: [MILA_HERO, LEO_HERO], buddy: BOBO_HERO }} />
      <StarWipe t={t} at={E('bye2') + 0.6} dur={0.5} hold={5} color="#3b2a4a" x={W / 2} y={H * 0.45} />
    </>
  );
}
