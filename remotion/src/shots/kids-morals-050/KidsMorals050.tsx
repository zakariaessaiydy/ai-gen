// TINY SPARKS · Day 50 · 📚 Moral Stories #4 — "The Kind Little Rabbit" (LONG 16:9)
// kids-shorts/tiny-sparks/morals/day-050-the-kind-little-rabbit. Cues from VO via K (keys.gen.ts).
// ENERGY LAYER standard: ident → WANT (Ruby the rabbit fills her basket with 5 carrots for Bobo's picnic — count
// along — and wants to be FIRST) → WRONG CHOICE (Milo the mouse is hungry: "Sorry, I'm in a hurry!", she hops away)
// → FEELING (her tummy feels funny, ears droop: the word SORRY) → "What should Ruby do?" (think timer) → KIND CHOICE
// (she hops back: "I'm sorry — have a carrot!") → kindness again: Tilly the little bird is caught in a bush (think
// timer, Ruby frees her gently) · Tom the slow turtle will miss the party (he rides in her basket) → Ruby arrives
// LAST with only 4 carrots → SURPRISE: her friends saved her the best seat, Milo brings berries, Tilly a flower crown
// → everyone shares → MORAL "Kindness always comes back" (say it with me) → remember (4 questions, think timers) →
// "When were YOU kind?" → bye + star iris. No scolding, nobody is bad: Ruby makes a mistake and repairs it.
import React from 'react';
import { Critter, critterFaceAt, type CArm, type CritterSpec } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR } from '../../lib/kids/sets';
import { Backdrop } from '../../lib/kids/places';
import { Confetti, CountRow, KidsCaptions, PopText, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, Dust, ImpactStar, MotionLines, Reaction, SparksIntro, StageWord, StarWipe, directorCam, onBeat, type Shot } from '../../lib/kids/energy';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsMorals050', durationInSeconds: 303.8, fps: 30, width: 1920, height: 1080 };

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
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff', ruby: '#ff8fab', milo: '#ffca3a', tilly: '#4cc9f0', tom: '#8ac926' };
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
const RUBY: CritterSpec = { id: 'ruby', species: 'bunny', fur: '#f3e3d3', fur2: '#ffffff', dark: '#ff8fab', bow: '#ff595e' };
const MILO: CritterSpec = { id: 'milo', species: 'mouse', fur: '#b8b8c8', fur2: '#ffe3ec', dark: '#6c6c80' };
const TILLY: CritterSpec = { id: 'tilly', species: 'chick', fur: '#ffd166', fur2: '#fff3b0', dark: '#ff924c' };
const TOM: CritterSpec = { id: 'tom', species: 'turtle', fur: '#8ac926', fur2: '#fff3b0', dark: '#2d9a5a' };
const RS = 0.56;
const MS = 0.4;
const TS = 0.34;
const TOMS = 0.42;
const BS = 0.6;

// ── scenes
const MOUSE0 = S('mouse') - 0.3;
const BIRD0 = S('bird') - 0.3;
const TURTLE0 = S('turtle') - 0.3;
const PARTY0 = S('late') - 0.3;
type Scene = 'home' | 'mouse' | 'bird' | 'turtle' | 'party';
const sceneAt = (t: number): Scene => (t < MOUSE0 ? 'home' : t < BIRD0 ? 'mouse' : t < TURTLE0 ? 'bird' : t < PARTY0 ? 'turtle' : 'party');

// ── anchors
const COUNT = [5, 6, 7, 8, 9].map((i) => word('count', i));
const GIVE = word('sorry', 9); // "Here, have a carrot!"
const FREE = word('free', 6); // "very gently" → free
const INTO = word('carry', 2); // Tom climbs into the basket
const CROWN = word('tilly2', 5);
const BERRIES = word('milo2', 6);

// Ruby's x per scene (a single keyframe track; scene cuts hide the jumps)
const RUBY_X: KF = [
  [0, 900], [word('want', 10), 900], [MOUSE0 - 0.05, 2200],
  [MOUSE0, -200], [S('mouse') + 0.4, -200], [S('mouse') + 2.2, 960], [S('rush2'), 960], [S('rush2') + 2.0, 1520], [S('back') + 0.3, 1520], [E('back') + 0.6, 900],
  [BIRD0, -200], [S('bird') + 0.2, -200], [S('bird') + 2.4, 860],
  [TURTLE0, -200], [S('turtle') + 0.1, -200], [S('turtle') + 2.4, 820], [S('hop') + 0.3, 820], [S('hop') + 2.6, 2200],
  [PARTY0, -200], [S('late') + 0.1, -200], [S('late') + 2.2, 640],
];
const MILO_HOME = 640;
const BUSH_X = 1180;
const TOM_X = 1180;
const PARTY = { bobo: 1060, milo: 1300, tilly: 1480, tom: 1690 };

// ── camera
const rubyFace = (x: number) => critterFaceAt(x, f, RS);
const SHOTS: Shot[] = [
  { t: 0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.01 },
  { t: S('ruby_hi') - 0.2, z: 1.6, x: 900, y: rubyFace(900)[1] + 80, move: 'smooth', dur: 0.8, push: 0.02 },
  { t: S('basket') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.7 },
  { t: S('want') - 0.2, z: 1.5, x: 900, y: rubyFace(900)[1] + 80, move: 'snap' },
  { t: word('want', 10), z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: MOUSE0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.01 },
  { t: S('milo') - 0.2, z: 1.6, x: MILO_HOME, y: f - 220, move: 'smooth', dur: 0.8, push: 0.02 },
  { t: S('rush') - 0.1, z: 1.5, x: 960, y: rubyFace(960)[1] + 80, move: 'whip' },
  { t: S('rush2') - 0.1, z: 1.0, x: 1000, y: 540, move: 'smooth', dur: 0.8 },
  { t: S('feel') - 0.2, z: 1.6, x: 1520, y: rubyFace(1520)[1] + 80, move: 'smooth', dur: 1.2, push: 0.03 },
  { t: S('ask') - 0.2, z: 1.0, x: 1000, y: 540, move: 'smooth', dur: 0.8 },
  { t: S('back') - 0.1, z: 1.15, x: 1100, y: 600, move: 'smooth', dur: 1.0 },
  { t: S('sorry') - 0.2, z: 1.4, x: 780, y: f - 260, move: 'smooth', dur: 0.8 },
  { t: S('milo_yay') - 0.2, z: 1.6, x: MILO_HOME, y: f - 220, move: 'snap' },
  { t: S('kind') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 },
  { t: BIRD0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.01 },
  { t: S('tilly') - 0.2, z: 1.55, x: BUSH_X, y: f - 260, move: 'whip', push: 0.01 },
  { t: S('help_q') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.7 },
  { t: S('help') - 0.2, z: 1.3, x: 1020, y: f - 280, move: 'smooth', dur: 0.8 },
  { t: S('tilly_yay') - 0.2, z: 1.55, x: BUSH_X, y: f - 260, move: 'snap' },
  { t: TURTLE0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.01 },
  { t: S('tom') - 0.2, z: 1.6, x: TOM_X, y: f - 180, move: 'smooth', dur: 0.8 },
  { t: S('think') - 0.2, z: 1.55, x: 820, y: rubyFace(820)[1] + 80, move: 'whip' },
  { t: S('carry') - 0.2, z: 1.3, x: 1000, y: f - 280, move: 'smooth', dur: 0.8 },
  { t: S('hop') - 0.1, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: PARTY0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.01 },
  { t: S('ruby_sad') - 0.2, z: 1.6, x: 640, y: rubyFace(640)[1] + 80, move: 'smooth', dur: 0.8, push: 0.02 },
  { t: S('surprise') - 0.1, z: 1.0, x: 1060, y: 540, move: 'snap' },
  { t: S('gifts') - 0.2, z: 1.5, x: PARTY.bobo, y: f - 290, move: 'whip' },
  { t: S('milo2') - 0.2, z: 1.6, x: PARTY.milo, y: f - 220, move: 'whip' },
  { t: S('tilly2') - 0.2, z: 1.6, x: PARTY.tilly, y: f - 200, move: 'whip' },
  { t: S('tom2') - 0.2, z: 1.6, x: PARTY.tom, y: f - 200, move: 'whip' },
  { t: S('share') - 0.2, z: 1.0, x: 1060, y: 540, move: 'smooth', dur: 0.7 },
  { t: S('i1') - 0.1, z: 1.55, x: 640, y: rubyFace(640)[1] + 80, move: 'snap' },
  { t: S('i2') - 0.1, z: 1.6, x: PARTY.milo, y: f - 220, move: 'whip' },
  { t: S('i3') - 0.1, z: 1.6, x: PARTY.tilly, y: f - 200, move: 'whip' },
  { t: S('i4') - 0.1, z: 1.6, x: PARTY.tom, y: f - 200, move: 'whip' },
  { t: S('i5') - 0.1, z: 1.5, x: PARTY.bobo, y: f - 290, move: 'whip' },
  { t: S('chant') - 0.2, z: 1.0, x: 1060, y: 540, move: 'smooth', dur: 0.7 },
  { t: S('a1') - 0.1, z: 1.55, x: PARTY.milo, y: f - 220, move: 'snap' },
  { t: E('a1') + 0.6, z: 1.0, x: 1060, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('a2') - 0.1, z: 1.55, x: 640, y: rubyFace(640)[1] + 80, move: 'snap' },
  { t: E('a2') + 0.6, z: 1.0, x: 1060, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('a3') - 0.1, z: 1.55, x: PARTY.tom, y: f - 200, move: 'snap' },
  { t: E('a3') + 0.6, z: 1.0, x: 1060, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('a4') - 0.1, z: 1.55, x: PARTY.tilly, y: f - 200, move: 'snap' },
  { t: E('a4') + 0.6, z: 1.0, x: 1060, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('a5') - 0.1, z: 1.55, x: 640, y: rubyFace(640)[1] + 80, move: 'snap' },
  { t: E('a5') + 0.6, z: 1.0, x: 1060, y: 540, move: 'smooth', dur: 0.6 },
];
const PUNCHES = [...COUNT, GIVE, FREE, S('surprise'), CROWN];

// ── props (3D-shaded)
const Carrot: React.FC<{ s?: number; rot?: number }> = ({ s = 1, rot = 0 }) => (
  <g transform={`rotate(${rot}) scale(${s})`}>
    <Vol kind="tube"><path d="M -22,-40 Q 0,-52 22,-40 L 4,70 Q 0,78 -4,70 Z" fill="#ff924c" {...kst(5)} /></Vol>
    {[-20, -6, 8].map((y) => <path key={y} d={`M -14,${y} l 10,2`} stroke="#e76f51" strokeWidth={4} strokeLinecap="round" />)}
    {[-12, 0, 12].map((x) => <path key={x} d={`M ${x * 0.5},-44 Q ${x},-80 ${x * 1.6},-92`} fill="none" stroke="#52b788" strokeWidth={9} strokeLinecap="round" />)}
  </g>
);
const Basket: React.FC<{ n: number; tom?: boolean; t: number }> = ({ n, tom, t }) => (
  <g transform="translate(0,90)">
    {/* carrots sticking out */}
    {Array.from({ length: n }).map((_, i) => <g key={i} transform={`translate(${-60 + i * 30},-60)`}><Carrot s={0.75} rot={-12 + i * 6} /></g>)}
    {tom && (
      <g transform={`translate(10,${-40 + Math.sin(t * 3) * 3})`}>
        <Vol><ellipse cx={0} cy={0} rx={56} ry={40} fill={TOM.dark} {...kst(6)} /></Vol>
        <Vol><circle cx={58} cy={-24} r={26} fill={TOM.fur} {...kst(6)} /></Vol>
        <circle cx={66} cy={-30} r={5} fill={KINK} />
        <path d="M 58,-12 q 8,6 16,0" fill="none" {...kst(4)} />
      </g>
    )}
    <path d="M -100,-30 Q 0,-170 100,-30" fill="none" stroke="#a0673c" strokeWidth={14} />
    <Vol><path d="M -110,-30 L 110,-30 L 86,60 L -86,60 Z" fill="#d9a066" {...kst(7)} /></Vol>
    {[-6, 18, 42].map((y) => <path key={y} d={`M ${-104 + y * 0.3},${y - 10} L ${104 - y * 0.3},${y - 10}`} stroke="#a0673c" strokeWidth={5} />)}
  </g>
);
const Bush: React.FC<{ x: number; open: number; layer: 'back' | 'front'; t: number }> = ({ x, open, layer, t }) =>
  layer === 'back' ? (
    <Vol><ellipse cx={x} cy={f - 120} rx={220} ry={150} fill="#2d9a5a" {...kst(7)} /></Vol>
  ) : (
    <g>
      {[-130, -40, 50, 140].map((dx, i) => {
        const away = (i < 2 ? -1 : 1) * open * 90;
        return <Vol key={dx}><circle cx={x + dx + away} cy={f - 70 + Math.sin(t * 2 + i) * 3} r={95} fill={i % 2 ? '#40916c' : '#52b788'} {...kst(7)} /></Vol>;
      })}
      {[[-90, -60], [60, -90], [130, -20]].map(([dx, dy], i) => <circle key={i} cx={x + dx + (dx < 0 ? -1 : 1) * open * 90} cy={f + dy} r={14} fill="#ff6fa5" {...kst(4)} />)}
    </g>
  );
const Log: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <Vol kind="tube"><rect x={x - 170} y={f - 70} width={340} height={80} rx={40} fill="#a0673c" {...kst(7)} /></Vol>
    <Vol><ellipse cx={x + 170} cy={f - 30} rx={28} ry={40} fill="#e9c19a" {...kst(6)} /></Vol>
    <ellipse cx={x + 170} cy={f - 30} rx={12} ry={18} fill="none" stroke="#a0673c" strokeWidth={4} />
  </g>
);
const Blanket: React.FC = () => (
  <g>
    <Vol kind="slope"><path d={`M 520,${f - 30} L 1820,${f - 30} L 1900,${f + 90} L 440,${f + 90} Z`} fill="#ff8fab" {...kst(7)} /></Vol>
    {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M ${560 + i * 150},${f - 30} L ${530 + i * 160},${f + 90}`} stroke="#ffffff" strokeWidth={14} opacity={0.6} />)}
  </g>
);
const Berries: React.FC = () => (
  <g>
    <Vol><path d="M -70,0 Q 0,70 70,0 Z" fill="#ffffff" {...kst(6)} /></Vol>
    <Vol>{[[-36, -8], [0, -18], [36, -8], [-16, -34], [18, -34]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={18} fill={i % 2 ? '#6a4c93' : '#e63946'} {...kst(4)} />)}</Vol>
  </g>
);
const Crown: React.FC = () => (
  <g>
    {[-90, -45, 0, 45, 90].map((x, i) => (
      <g key={x} transform={`translate(${x},${Math.abs(x) * 0.25})`}>
        <Vol>
          {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 16} cy={Math.sin((a * Math.PI) / 180) * 16} r={13} fill={['#ff6fa5', '#ffca3a', '#b388ff', '#4cc9f0', '#ff924c'][i]} {...kst(3)} />)}
          <circle r={10} fill="#ffd166" {...kst(3)} />
        </Vol>
      </g>
    ))}
  </g>
);

export default function KidsMorals050() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const scene = sceneAt(t);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);

  // Ruby
  const rx = lerpKF(t, RUBY_X);
  const hopping = moving(t, RUBY_X);
  const rhop = hopping ? Math.abs(Math.sin(t * 9)) * 70 : 0;
  const sad = within(t, S('feel'), S('back')) || within(t, S('ruby_sad'), S('surprise'));
  const carrots = t < GIVE ? 5 : 4;
  const carrotsShown = t < S('basket') ? 0 : t < COUNT[4] + 0.2 ? COUNT.filter((c) => t >= c).length || (t >= word('basket', 5) ? 5 : 0) : carrots;
  const party = scene === 'party';
  const yay = within(t, S('share'), E('share') + 0.8) || t >= S('bye') || within(t, S('milo_yay'), E('happy')) || within(t, S('chant'), E('chant_turn') + 0.6);
  const rubyExpr: KExpr =
    sad ? 'sad' : within(t, S('rush'), E('rush')) ? 'oops' : within(t, S('think'), E('think')) ? 'think' : within(t, S('ask'), S('back')) ? 'think' : within(t, S('surprise'), S('gifts') + 0.3) ? 'surprised'
    : within(t, S('gifts'), E('tom2')) ? 'wow' : yay || hopping ? 'laugh' : talks('ruby') ? 'happy' : 'smile';
  const rubyArmL: CArm = within(t, S('help'), FREE + 0.4) ? 'point' : within(t, S('share'), E('share')) || t >= S('bye') ? 'wave' : 'down';
  const hasBasket = !(party && t > S('share') - 0.2) && t >= S('basket') - 0.1;
  const rubyArmR: CArm = hasBasket ? 'hold' : 'up';
  const crownOn = t >= CROWN;

  // Milo
  const miloX = party ? PARTY.milo : MILO_HOME;
  const miloHas = t >= GIVE && t < BIRD0;
  const miloExpr: KExpr = within(t, S('milo'), GIVE) ? 'sad' : within(t, S('rush'), S('back')) ? 'sad' : talks('milo') ? 'laugh' : party ? (yay ? 'laugh' : 'happy') : 'smile';
  // Tilly
  const tillyOut = t >= FREE;
  const tillyX = party ? PARTY.tilly : BUSH_X + (tillyOut ? 0 : 0);
  const tillyHop = scene === 'bird' && tillyOut ? Math.abs(Math.sin(t * 6)) * 40 * (1 - prog(t, E('tilly_yay'), E('tilly_yay') + 1)) : 0;
  // Tom
  const tomIn = within(t, INTO + 0.6, PARTY0 + 2.5);
  const tomPartyIn = t >= S('surprise');

  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
        {party ? <Backdrop place="meadow" w={W} h={H} t={t} fx={['butterflies', 'birds']} /> : <Backdrop place="forest" w={W} h={H} t={t} />}

        {/* ── scene props (behind) ── */}
        {scene === 'mouse' && <Log x={MILO_HOME - 60} />}
        {scene === 'bird' && <Bush x={BUSH_X} open={prog(t, FREE - 0.4, FREE + 0.3)} layer="back" t={t} />}
        {party && <Blanket />}
        {party && t >= S('share') && (
          <g>
            {[[860, f + 20], [1200, f + 30], [1580, f + 30]].map(([x, y], i) => <g key={i} transform={`translate(${x},${y}) scale(${popIn(t, S('share') + i * 0.15)})`}><Carrot s={0.8} rot={70} /></g>)}
            <g transform={`translate(1040,${f + 40}) scale(${popIn(t, S('share') + 0.5) * 0.9})`}><Berries /></g>
          </g>
        )}

        {/* ── Milo ── */}
        {(scene === 'mouse' || party) && (
          <Critter spec={MILO} x={miloX} y={party ? f : f - 60} scale={MS} expr={miloExpr} look={party ? [-0.6, -0.2] : [0.7, -0.2]} mouth={lipSync(VO, 'milo', t)}
            armL={within(t, S('milo'), E('milo')) ? 'point' : 'down'} armR={miloHas ? 'hold' : party && within(t, S('milo2'), E('milo2') + 0.5) ? 'hold' : party && yay ? 'up' : 'down'}
            holdR={miloHas ? <Carrot s={1.1} rot={-20} /> : party && within(t, BERRIES - 0.2, S('share')) ? <g transform="scale(1.6)"><Berries /></g> : undefined}
            squash={within(t, S('milo'), GIVE) ? 0.1 : 0} hop={party && yay ? Math.abs(Math.sin(t * 7 + 1)) * 22 : 0} />
        )}
        {/* ── Tilly (in the bush, then free) ── */}
        {(scene === 'bird' || party) && (
          <Critter spec={TILLY} x={tillyX} y={party ? f : f - (tillyOut ? 0 : 90)} scale={TS} expr={within(t, S('tilly'), FREE) ? 'sad' : talks('tilly') ? 'laugh' : 'happy'} look={[-0.6, -0.2]} mouth={lipSync(VO, 'tilly', t)}
            armL={{ a: within(t, S('tilly'), FREE) ? 90 + Math.sin(t * 20) * 20 : tillyHop > 0 || (party && yay) ? 120 + Math.sin(t * 16) * 40 : 20 }} armR={{ a: within(t, S('tilly'), FREE) ? 30 : tillyHop > 0 || (party && yay) ? 120 + Math.sin(t * 16 + 1) * 40 : 20 }}
            hop={tillyHop + (party && yay ? Math.abs(Math.sin(t * 7 + 2)) * 22 : 0)} />
        )}
        {scene === 'bird' && <Bush x={BUSH_X} open={prog(t, FREE - 0.4, FREE + 0.3)} layer="front" t={t} />}
        {/* ── Tom ── */}
        {scene === 'turtle' && !tomIn && (
          <Critter spec={TOM} x={TOM_X - prog(t, S('turtle'), S('tom')) * 60} y={f} scale={TOMS} expr={within(t, S('tom'), S('carry')) ? 'sad' : 'happy'} look={[-0.6, 0]} mouth={lipSync(VO, 'tom', t)}
            walking={within(t, S('turtle'), S('tom'))} walk={t * 0.8} facing={-1} />
        )}
        {party && tomPartyIn && (
          <Critter spec={TOM} x={PARTY.tom} y={f} scale={TOMS} expr={talks('tom') ? 'happy' : yay ? 'laugh' : 'smile'} look={[-0.6, -0.1]} mouth={lipSync(VO, 'tom', t)}
            hop={yay ? Math.abs(Math.sin(t * 7 + 3)) * 18 : 0} />
        )}
        {/* ── Bobo at the party ── */}
        {party && (
          <Critter spec={BOBO_HERO} x={PARTY.bobo} y={f} scale={BS} expr={talks('bobo') ? 'happy' : yay || t >= S('surprise') ? 'laugh' : 'smile'} look={[-0.6, -0.2]} mouth={lipSync(VO, 'bobo', t)}
            armL={within(t, S('gifts'), E('gifts')) ? 'point' : yay ? 'up' : 'down'} armR={talks('bobo') ? 'wave' : yay ? 'up' : 'down'} hop={yay ? Math.abs(Math.sin(t * 7)) * 22 : 0} />
        )}

        {/* ── Ruby ── */}
        <Critter spec={RUBY} x={rx} y={f} scale={RS} expr={rubyExpr} look={scene === 'mouse' && t < S('rush2') ? [-0.7, 0] : [0, -0.1]} mouth={lipSync(VO, 'ruby', t)}
          armL={rubyArmL} armR={rubyArmR} holdR={hasBasket ? <Basket n={carrotsShown} tom={tomIn} t={t} /> : undefined}
          hop={rhop + (yay && !hopping ? Math.abs(Math.sin(t * 7 + 0.5)) * 22 : 0)} squash={sad ? 0.12 : 0} tilt={sad ? -8 : 0}
          facing={within(t, S('back') - 0.1, E('back') + 0.6) ? -1 : 1} />
        {crownOn && (() => {
          const [hx, hy] = critterFaceAt(rx, f, RS);
          return <g transform={`translate(${hx},${hy - 150 * RS - (yay ? Math.abs(Math.sin(t * 7 + 0.5)) * 22 : 0)}) scale(${RS * popIn(t, CROWN)})`}><Crown /></g>;
        })()}

        {/* ── FX ── */}
        <MotionLines t={t} from={S('rush2')} to={S('rush2') + 2.0} x={rx - 130} y={f - 200} dir={180} n={3} len={90} spread={30} />
        <Dust t={t} at={E('back') + 0.6} x={900} y={f} s={0.8} />
        <ImpactStar t={t} at={GIVE} x={MILO_HOME + 60} y={f - 260} s={0.6} color="#ffca3a" />
        <ImpactStar t={t} at={FREE} x={BUSH_X} y={f - 200} s={0.8} color="#fff3b0" />
        <ImpactStar t={t} at={S('surprise')} x={1060} y={f - 400} s={1.0} />
        <StageWord t={t} at={word('want', 11)} until={word('want', 11) + 1.6} text="HOP! HOP!" x={1100} y={f - 480} size={80} color="#ff8fab" rot={-6} />
        <StageWord t={t} at={word('milo_yay', 3)} until={E('milo_yay') + 0.4} text="CRUNCH!" x={MILO_HOME + 120} y={f - 400} size={80} color="#ff924c" rot={6} />
        <StageWord t={t} at={word('tilly', 0)} until={word('tilly', 2)} text="PEEP!" x={BUSH_X + 150} y={f - 420} size={70} color="#4cc9f0" rot={8} />
        <StageWord t={t} at={S('surprise')} until={S('gifts')} text="SURPRISE!" x={1060} y={f - 560} size={110} color="#ffca3a" rot={-5} />
        <Reaction kind="cloud" t={t} at={S('milo') + 0.6} until={GIVE} x={MILO_HOME} y={f - 360} s={0.5} />
        <Reaction kind="sweat" t={t} at={S('feel')} until={S('back')} x={1520 - 90} y={f - 500} s={0.6} />
        <Reaction kind="cloud" t={t} at={S('word')} until={S('back')} x={1520} y={f - 560} s={0.6} />
        <Reaction kind="heart" t={t} at={S('kind')} until={E('kind') + 0.5} x={rx} y={f - 560} s={0.8} />
        <Reaction kind="!" t={t} at={S('tilly')} until={S('help')} x={BUSH_X} y={f - 420} s={0.6} />
        <Reaction kind="heart" t={t} at={S('tilly_yay')} until={E('tilly_yay') + 0.6} x={BUSH_X} y={f - 300} s={0.7} />
        <Reaction kind="sweat" t={t} at={S('tom')} until={S('think')} x={TOM_X - 60} y={f - 260} s={0.5} />
        <Reaction kind="?" t={t} at={S('think')} until={word('think', 10)} x={820} y={f - 560} s={0.6} />
        <Reaction kind="idea" t={t} at={word('think', 10)} until={S('carry')} x={820} y={f - 560} s={0.7} />
        <Reaction kind="cloud" t={t} at={S('ruby_sad')} until={S('surprise')} x={640} y={f - 560} s={0.6} />
        <Reaction kind="heart" t={t} at={S('tom2')} until={E('tom2') + 0.6} x={PARTY.tom} y={f - 300} s={0.6} />
      </ActionStage>

      {/* screen-space */}
      <CountRow t={t} times={COUNT} item={() => <Carrot s={1.1} rot={10} />} x={960} y={330} gap={170} perRow={5} until={S('want') - 0.1} />
      <PopText t={t} at={COUNT[4] + 0.3} until={S('want') - 0.1} text="5 CARROTS!" y={130} size={110} color="#ff924c" />
      <PopText t={t} at={S('rush') + 0.3} until={S('feel') - 0.2} text="IN A HURRY!" y={150} size={100} color="#ffffff" />
      <PopText t={t} at={word('word', 6)} until={S('ask') - 0.1} text="FEELING SORRY" y={150} size={110} color="#a0c4ff" />
      <ThinkTimer t={t} from={onBeat(E('ask') + 0.1)} to={S('back') - 0.1} x={1760} y={190} r={90} label="THINK!" />
      <PopText t={t} at={word('sorry', 2)} until={S('milo_yay') - 0.1} text="I'M SORRY!" y={150} size={110} color="#ff8fab" />
      <PopText t={t} at={word('kind', 7)} until={BIRD0} text="BEING KIND FEELS GOOD!" y={150} size={90} color="#52b788" />
      <ThinkTimer t={t} from={onBeat(E('help_q') + 0.1)} to={S('help') - 0.1} x={1760} y={190} r={90} label="THINK!" />
      <PopText t={t} at={S('ruby_sad') + 0.6} until={S('surprise') - 0.1} text="4 CARROTS" y={150} size={110} color="#ff924c" />
      <PopText t={t} at={S('moral')} until={S('ideas') - 0.2} text="KINDNESS ALWAYS COMES BACK" y={150} size={84} color="#ffca3a" />
      <PopText t={t} at={E('moral_turn') - 0.6} until={S('ideas') - 0.2} text="YOUR TURN!" y={280} size={100} color="#ffffff" />
      <PopText t={t} at={S('rem') + 0.1} until={S('q1') - 0.1} text="LET'S REMEMBER!" y={150} size={110} color="#ffca3a" />
      {(['q1', 'q2', 'q3', 'q4', 'q5'] as const).map((q, i) => (
        <ThinkTimer key={q} t={t} from={onBeat(E(q) + 0.1)} to={S((['a1', 'a2', 'a3', 'a4', 'a5'] as const)[i]) - 0.1} x={1760} y={190} r={90} label="THINK!" />
      ))}
      <PopText t={t} at={S('a1')} until={S('q2') - 0.2} text="MILO THE MOUSE!" y={150} size={110} color="#ffca3a" />
      <PopText t={t} at={S('a2')} until={S('q3') - 0.2} text="SORRY" y={150} size={130} color="#a0c4ff" />
      <PopText t={t} at={S('a3')} until={S('q4') - 0.2} text="TOM THE TURTLE!" y={150} size={110} color="#8ac926" />
      <PopText t={t} at={S('a4')} until={S('q5') - 0.2} text="A FLOWER CROWN!" y={150} size={110} color="#ff6fa5" />
      <PopText t={t} at={S('a5')} until={S('talk') - 0.2} text="IT COMES BACK!" y={150} size={110} color="#ffca3a" />
      <PopText t={t} at={S('ideas')} until={S('i1') - 0.1} text="KIND THINGS WE CAN DO" y={150} size={90} color="#ffffff" />
      <PopText t={t} at={S('i1')} until={S('i2') - 0.1} text="🍪 SHARE" y={150} size={120} color="#ff924c" />
      <PopText t={t} at={S('i2')} until={S('i3') - 0.1} text="🧹 HELP" y={150} size={120} color="#ffca3a" />
      <PopText t={t} at={S('i3')} until={S('i4') - 0.1} text="💬 NICE WORDS" y={150} size={110} color="#4cc9f0" />
      <PopText t={t} at={S('i4')} until={S('i5') - 0.1} text="🐢 WAIT FOR A FRIEND" y={150} size={90} color="#8ac926" />
      <PopText t={t} at={S('i5')} until={S('chant') - 0.1} text="🤗 A BIG HUG" y={150} size={120} color="#ff6fa5" />
      <PopText t={t} at={S('chant')} until={S('chant_turn') - 0.1} text="HELP A FRIEND! SHARE A SNACK!" y={150} size={80} color="#ffca3a" />
      <PopText t={t} at={S('chant_turn')} until={S('rem') - 0.1} text="YOUR TURN!" y={150} size={120} color="#ffffff" />
      <PopText t={t} at={S('talk') + 0.3} until={S('bye') - 0.2} text="WHEN WERE YOU KIND?" y={150} size={100} color="#ffffff" />
      <PopText t={t} at={S('bye')} until={E('bye2') + 0.6} text="SEE YOU NEXT TIME!" y={150} size={100} color="#ff8fab" />
      <Confetti t={t} at={S('milo_yay')} y={420} />
      <Confetti t={t} at={S('tilly_yay')} y={420} />
      <Confetti t={t} at={S('surprise')} y={420} />
      <Confetti t={t} at={S('share')} y={420} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <SparksIntro t={t} at={0} cast={{ kids: [MILA_HERO, LEO_HERO], buddy: BOBO_HERO }} />
      <StarWipe t={t} at={E('bye2') + 0.6} dur={0.5} hold={5} color="#3b2a4a" x={W / 2} y={H * 0.45} />
    </>
  );
}
