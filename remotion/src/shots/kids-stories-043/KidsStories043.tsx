// TINY SPARKS · Day 43 · 🧠 Educational Stories #4 — "The Day Mila Learned Patience" (LONG 16:9, 5:07)
// kids-shorts/tiny-sparks/stories/day-043-the-day-mila-learned-patience. Cues from VO via K (keys.gen.ts).
// ENERGY LAYER (ident, director camera, reactions, StageWords, SFX, theme bed). Life skill: PATIENCE — the WAITING GAME
// in 3 steps: 1 ask nicely · 2 count to ten (Bobo's sand timer) · 3 find something fun to do.
// SCENE 1 the playground: Leo swings high, Mila wants it NOW ("hurry, hurry!", stomp stomp — steam), the word
// IMPATIENT = it's hard to wait → Bobo's waiting game: she asks nicely (your turn) → the sand timer drains while
// everyone counts 1–10 (numbers pop, the sand falls) → Leo hops off, Mila swings — wheee.
// SCENE 2 the classroom (star wipe): Mila paints a rainbow and lifts it too fast — drip, drip, the colours run →
// paint a new one + step 3: she sings while it dries, Leo builds a block tower, the sun moves across the window → dry!
// → hang it up. SCENE 3 the meadow: recap (3 step cards), 5 questions with think timers, chant ×3, YOUR TURN: count
// to ten alone while the sand runs (numbers light on the beat), bye + star iris.
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { Classroom, FLOOR, Meadow } from '../../lib/kids/sets';
import { Confetti, FONT_TOON, KidsCaptions, PopText, RAINBOW, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import {
  ActionStage, Dust, ImpactStar, MotionLines, Reaction, SparksIntro, StageWord, StarWipe, directorCam, hopAt, onBeat, shakeOf,
  type Hit, type Shot,
} from '../../lib/kids/energy';
import { EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsStories043', durationInSeconds: 306.8, fps: 30, width: 1920, height: 1080 };

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
const key = (s: string) => s as Key;
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff' };
const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (EASE_OUT(p) - 1) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};
const pulse = (t: number, at: number, d = 0.35) => (t < at || t > at + d ? 0 : Math.sin(((t - at) / d) * Math.PI));

// ── timeline
const KS = Array.from({ length: 10 }, (_, j) => S(key(`k${j + 1}`)));
const SAND0 = S('timer') + 1.0; // the timer flips, the sand starts
const SAND1 = E('k10'); // empty on "ten"
const SWAP_SWING = S('leo_off') + 0.6; // Leo hops off, Mila gets on
const WIPE1 = E('happy') + 0.5;
const SCN2 = WIPE1 + 0.525;
const LIFT = word('oops', 2); // "lifts"
const DRIPS = [word('oops', 6), word('oops', 7)];
const NEW_PAINT = S('try_again') + 1.0;
const DRY0 = S('s3_mila');
const DRY1 = E('dry');
const HANG = word('touch', 5);
const WIPE2 = E('lesson') + 0.5;
const SCN3 = WIPE2 + 0.525;
const TURN0 = onBeat(E('count_turn') + 0.4); // your turn: numbers light on the theme-bed beat, 1 per second
const TURN = Array.from({ length: 10 }, (_, j) => TURN0 + j * 1.0);
const END_IRIS = E('ask_end') + 0.8;
type Scene = 'playground' | 'class' | 'meadow';
const sceneAt = (t: number): Scene => (t < SCN2 ? 'playground' : t < SCN3 ? 'class' : 'meadow');

// ── positions
const SW_X = 1380; // swing pivot x
const SW_Y = 250; // top bar
const ROPE = 440;
const MILA_X = 640;
const BOBO_X = 280;
const LEO_STAND = 1010;
const EASEL_X = 1000;
const TOWER_X = 1680;

// ── director camera
const SHOTS: Shot[] = [
  { t: 0, z: 1.0, x: 960, y: 540, move: 'cut' },
  { t: S('see') - 0.2, z: 1.3, x: SW_X, y: 560, move: 'whip', push: 0.01 },
  { t: S('want') - 0.2, z: 1.45, x: MILA_X, y: 600, move: 'whip', push: 0.012 },
  { t: S('leo_sad') - 0.2, z: 1.35, x: SW_X, y: 600, move: 'whip' },
  { t: S('feel') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 },
  { t: word('feel', 9), z: 1.4, x: MILA_X, y: 640, move: 'snap' },
  { t: S('ask') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 },
  { t: S('bobo_hi') - 0.2, z: 1.45, x: BOBO_X + 120, y: 620, move: 'whip' },
  { t: S('s1_mila') - 0.2, z: 1.3, x: (MILA_X + SW_X) / 2, y: 600, move: 'smooth', dur: 0.7 },
  { t: S('s1_turn') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 },
  { t: S('timer') - 0.2, z: 1.35, x: 880, y: 520, move: 'snap', push: 0.01 },
  { t: S('s2_done') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.7 },
  { t: S('swing') - 0.2, z: 1.3, x: SW_X, y: 560, move: 'smooth', dur: 0.8, push: 0.01 },
  { t: S('happy') + 1.0, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 1.0 },
  { t: SCN2, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.003 },
  { t: S('paint') - 0.2, z: 1.3, x: EASEL_X - 120, y: 560, move: 'smooth', dur: 0.8 },
  { t: LIFT - 0.1, z: 1.55, x: EASEL_X - 200, y: 520, move: 'snap' },
  { t: S('try_again') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 },
  { t: S('s3_leo') - 0.2, z: 1.35, x: TOWER_X - 120, y: 600, move: 'whip' },
  { t: S('dry') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 1.0 },
  { t: S('touch') - 0.2, z: 1.15, x: 760, y: 480, move: 'snap', push: 0.01 },
  { t: S('lesson') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 },
  { t: SCN3, z: 1.0, x: 960, y: 540, move: 'cut' },
];
const PUNCHES = [...KS.map((k) => k + 0.05), DRIPS[0], HANG];
const STOMPS = [word('feel', 10), word('feel', 11), word('feel', 12)];
const HITS: Hit[] = STOMPS.map((s) => ({ at: s, amp: 7, dur: 0.22 }));

// ── props
const SandTimer: React.FC<{ p: number; flip: number; s?: number }> = ({ p, flip, s = 1 }) => {
  // p = 0 full top → 1 empty top; flip = 0..1 turning-over animation
  const top = 1 - p;
  return (
    <g transform={`scale(${s}) rotate(${(1 - flip) * 180})`}>
      <Vol kind="tube"><rect x={-90} y={-150} width={180} height={26} rx={10} fill="#c0874f" {...kst(6)} /></Vol>
      <Vol kind="tube"><rect x={-90} y={124} width={180} height={26} rx={10} fill="#c0874f" {...kst(6)} /></Vol>
      <path d="M -70,-124 L 70,-124 Q 70,-40 10,0 Q 70,40 70,124 L -70,124 Q -70,40 -10,0 Q -70,-40 -70,-124 Z" fill="#e3f6ff" opacity={0.7} {...kst(6)} />
      {/* sand: top (shrinks downward), bottom (grows), the falling stream */}
      {top > 0.01 && <path d={`M ${-58 * top},${-110 + (1 - top) * 90} L ${58 * top},${-110 + (1 - top) * 90} L 6,-6 L -6,-6 Z`} fill="#ffca3a" />}
      <path d={`M -62,118 L 62,118 L ${62 - 50 * p},${118 - 90 * p} L ${-62 + 50 * p},${118 - 90 * p} Z`} fill="#ffca3a" opacity={p > 0.01 ? 1 : 0} />
      {flip >= 1 && top > 0.01 && top < 0.999 && <rect x={-3} y={-6} width={6} height={124 - 90 * p} fill="#ffca3a" />}
      <path d="M -50,-110 Q -54,-60 -20,-30" fill="none" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.6} />
    </g>
  );
};
const SwingFrame: React.FC = () => (
  <g>
    <Vol kind="tube"><path d={`M ${SW_X - 300},${f} L ${SW_X - 220},${SW_Y} L ${SW_X - 200},${SW_Y} L ${SW_X - 260},${f} Z`} fill="#ff595e" {...kst(6)} /></Vol>
    <Vol kind="tube"><path d={`M ${SW_X + 300},${f} L ${SW_X + 220},${SW_Y} L ${SW_X + 200},${SW_Y} L ${SW_X + 260},${f} Z`} fill="#ff595e" {...kst(6)} /></Vol>
    <Vol kind="tube"><rect x={SW_X - 250} y={SW_Y - 24} width={500} height={34} rx={14} fill="#1982c4" {...kst(6)} /></Vol>
  </g>
);
const Seat: React.FC<{ a: number; children?: React.ReactNode }> = ({ a, children }) => (
  <g transform={`rotate(${a} ${SW_X} ${SW_Y})`}>
    {[-70, 70].map((dx) => <line key={dx} x1={SW_X + dx} y1={SW_Y} x2={SW_X + dx} y2={SW_Y + ROPE} stroke="#6b4226" strokeWidth={8} />)}
    {children}
    <Vol kind="slope"><rect x={SW_X - 95} y={SW_Y + ROPE - 8} width={190} height={28} rx={12} fill="#ffca3a" {...kst(6)} /></Vol>
  </g>
);
const Easel: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <g>
    <path d={`M ${EASEL_X - 150},${f} L ${EASEL_X - 40},${f - 560} M ${EASEL_X + 150},${f} L ${EASEL_X + 40},${f - 560} M ${EASEL_X},${f} L ${EASEL_X},${f - 520}`} stroke="#a0673c" strokeWidth={22} strokeLinecap="round" />
    <path d={`M ${EASEL_X - 150},${f} L ${EASEL_X - 40},${f - 560} M ${EASEL_X + 150},${f} L ${EASEL_X + 40},${f - 560}`} fill="none" {...kst(5)} />
    <Vol kind="tube"><rect x={EASEL_X - 190} y={f - 250} width={380} height={24} rx={8} fill="#c0874f" {...kst(5)} /></Vol>
    {children}
  </g>
);
// a painting (origin = its top-left on the easel). drip 0..1 = colours running down
const Painting: React.FC<{ drip: number; wet: number }> = ({ drip, wet }) => (
  <g>
    <rect x={0} y={0} width={340} height={260} rx={10} fill="#ffffff" {...kst(7)} />
    {RAINBOW.slice(0, 6).map((c, i) => {
      const r = 130 - i * 18;
      return (
        <g key={c}>
          <path d={`M ${170 - r},210 A ${r},${r} 0 0,1 ${170 + r},210`} fill="none" stroke={c} strokeWidth={17} />
          {drip > 0 && [0.15, 0.5, 0.85].map((u, k) => {
            const x = 170 + Math.cos(Math.PI * (1 - u)) * r;
            const y = 210 - Math.sin(Math.PI * (1 - u)) * r;
            const len = drip * (40 + ((i * 3 + k) % 4) * 22);
            return <path key={k} d={`M ${x},${y} L ${x},${y + len}`} stroke={c} strokeWidth={9} strokeLinecap="round" />;
          })}
        </g>
      );
    })}
    {wet > 0 && [[60, 40], [280, 60], [150, 30]].map(([x, y], k) => <circle key={k} cx={x} cy={y} r={7} fill="#ffffff" opacity={0.8 * wet} />)}
  </g>
);
const Block: React.FC<{ c: string; letter: string }> = ({ c, letter }) => (
  <g>
    <Vol><rect x={-55} y={-110} width={110} height={110} rx={14} fill={c} {...kst(6)} /></Vol>
    <text y={-36} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={64} fill="#ffffff" stroke={KINK} strokeWidth={5} paintOrder="stroke">{letter}</text>
  </g>
);
const StepCard: React.FC<{ n: number; label: string; c: string; s: number; children: React.ReactNode }> = ({ n, label, c, s, children }) =>
  s <= 0 ? null : (
    <g transform={`scale(${s})`}>
      <rect x={-170} y={-170} width={340} height={330} rx={36} fill="#ffffff" {...kst(8)} />
      <circle cx={-150} cy={-150} r={34} fill={c} {...kst(5)} />
      <text x={-150} y={-137} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill="#ffffff">{n}</text>
      <g transform="translate(0,-30)">{children}</g>
      <text y={128} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={label.length > 12 ? 32 : 40} fill={KINK}>{label}</text>
    </g>
  );

export default function KidsStories043() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const shake = shakeOf(t, HITS);
  const scene = sceneAt(t);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);

  // ── scene 1 state
  const leoSwinging = t < SWAP_SWING - 0.6;
  const milaOnSwing = scene === 'playground' && t >= SWAP_SWING;
  const swingA = leoSwinging
    ? (within(t, S('leo_sad'), S('bobo_hi')) ? 10 : 26) * Math.sin(t * 2.4)
    : milaOnSwing ? 28 * Math.sin((t - SWAP_SWING) * 2.4) * Math.min(1, prog(t, SWAP_SWING, SWAP_SWING + 2)) : 4 * Math.sin(t * 2.4);
  const stomping = within(t, S('want'), E('feel'));
  const stomp = hopAt(t, [...STOMPS, word('want', 0), word('want', 2), word('hurry', 0), word('hurry', 4)], { h: 26, air: 0.16, pre: 0.04, land: 0.12 });
  const sandP = prog(t, SAND0, SAND1);
  const flip = prog(t, S('timer') + 0.2, SAND0);
  const sandP2 = prog(t, TURN[0] - 0.2, TURN[9] + 0.3);
  const counted = KS.filter((k) => t >= k).length;

  // ── scene 2 state
  const lifted = within(t, LIFT, NEW_PAINT);
  const drip = prog(t, DRIPS[0] - 0.2, DRIPS[1] + 1.2);
  const second = t >= NEW_PAINT;
  const dryP = prog(t, DRY0, DRY1);
  const hung = t >= HANG;
  const blocks = within(t, S('s3_leo'), WIPE2 + 0.6) ? [word('s3_leo', 6), word('s3_leo', 8), word('s3_leo', 10)].filter((b) => t >= b).length : 0;

  // ── expressions
  const milaExpr: KExpr =
    scene === 'playground'
      ? within(t, S('want'), S('ask')) ? (within(t, S('feel'), S('ask')) ? 'oops' : 'proud')
      : within(t, S('ask'), S('s1')) ? 'sad'
      : within(t, KS[0], SAND1 + 0.4) ? 'think'
      : milaOnSwing ? 'laugh' : talks('mila') ? 'happy' : 'smile'
      : scene === 'class'
        ? within(t, LIFT, S('try_again')) ? (t >= DRIPS[0] ? 'sad' : 'surprised')
        : within(t, S('sing'), E('sing')) ? 'laugh' : within(t, S('touch'), E('proud') + 0.5) ? 'laugh' : talks('mila') ? 'happy' : 'smile'
        : talks('mila') ? 'happy' : t >= S('bye') ? 'laugh' : 'smile';
  const leoExpr: KExpr = within(t, S('hurry'), S('bobo_hi')) ? 'sad' : leoSwinging && scene === 'playground' ? 'laugh' : within(t, S('wow'), E('wow')) ? 'wow' : talks('leo') ? 'happy' : 'smile';
  const boboExpr: KExpr = within(t, S('bobo_wait'), E('bobo_wait')) ? 'surprised' : talks('bobo') ? 'happy' : within(t, KS[0], SAND1) ? 'happy' : 'smile';

  // cast positions per scene
  const milaX = scene === 'playground' ? MILA_X : scene === 'class' ? (lifted || hung ? EASEL_X - 330 : EASEL_X - 300) : 520;
  const boboX = scene === 'playground' ? BOBO_X + (t < S('bobo_hi') ? -400 + 400 * EASE_OUT(prog(t, S('bobo_hi') - 1.2, S('bobo_hi'))) : 0) : scene === 'class' ? 330 : 860;
  const leoX = scene === 'playground' ? LEO_STAND : scene === 'class' ? TOWER_X - 250 : 1200;
  const yay = within(t, S('swing'), E('happy')) || within(t, S('wow'), E('proud') + 0.5) || within(t, S('ch3'), E('ch3') + 0.4) || within(t, S('great'), E('great') + 0.6) || t >= S('bye');
  const chantHop = (ph: number) => (within(t, S('ch1'), E('ch3') + 0.4) || yay ? Math.abs(Math.sin(t * 7 + ph)) * 24 : 0);

  return (
    <>
      <ActionStage cam={cam} shake={shake} blur={cam.blur}>
        {scene !== 'class' ? <Meadow w={W} h={H} t={t} /> : <Classroom w={W} h={H} board={[]} />}

        {/* ─── SCENE 1: the playground ─── */}
        {scene === 'playground' && (
          <g>
            <SwingFrame />
            <Seat a={swingA}>
              {leoSwinging && <Kid spec={LEO_HERO} x={SW_X} y={SW_Y + ROPE + 70} scale={0.5} legs="sit" expr={leoExpr} mouth={lipSync(VO, 'leo', t)} look={[-0.5, 0]} armL="up" armR="up" shadow={false} idle={false} />}
              {milaOnSwing && <Kid spec={MILA_HERO} x={SW_X} y={SW_Y + ROPE + 70} scale={0.5} legs="sit" expr="laugh" mouth={lipSync(VO, 'mila', t)} look={[0.4, -0.2]} armL="up" armR="up" shadow={false} idle={false} />}
            </Seat>
            <MotionLines t={t} from={S('leo_wee')} to={E('leo_wee') + 0.8} x={SW_X} y={SW_Y + ROPE} dir={swingA > 0 ? 200 : -20} n={3} len={80} spread={30} />
            <MotionLines t={t} from={S('swing') + 0.6} to={E('happy')} x={SW_X} y={SW_Y + ROPE} dir={swingA > 0 ? 200 : -20} n={3} len={80} spread={30} />
            {/* Leo standing (after he hops off) */}
            {!leoSwinging && <Kid spec={LEO_HERO} x={LEO_STAND + 60} y={f} scale={0.6} expr={leoExpr} mouth={lipSync(VO, 'leo', t)} look={[0.6, -0.3]} armR={talks('leo') ? 'present' : yay ? 'up' : 'down'} armL={yay ? 'up' : 'down'} hop={chantHop(1)} />}
            {/* the sand timer on a tree stump */}
            {t >= S('s2') && (
              <g transform={`translate(880,${f - 70}) scale(${popIn(t, S('s2') + 0.3)})`}>
                <Vol kind="tube"><rect x={-80} y={0} width={160} height={70} rx={14} fill="#a0673c" {...kst(6)} /></Vol>
                <g transform="translate(0,-160)"><SandTimer p={sandP} flip={flip} s={0.9} /></g>
              </g>
            )}
            {/* counting numbers above the timer */}
            {KS.map((k, j) => t >= k && t < SAND1 + 1.6 && (
              <g key={j} transform={`translate(${880 + (j - 4.5) * 72},360) scale(${popIn(t, k)})`}>
                <circle r={32} fill={RAINBOW[j % RAINBOW.length]} {...kst(5)} />
                <text y={15} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={j === 9 ? 32 : 38} fill="#ffffff" stroke={KINK} strokeWidth={4} paintOrder="stroke">{j + 1}</text>
              </g>
            ))}
            <StageWord t={t} at={word('leo_wee', 0)} until={E('leo_wee') + 0.6} text="WHEEE!" x={SW_X + 30} y={290} size={90} color="#4cc9f0" rot={-6} />
            {STOMPS.map((s, i) => <StageWord key={i} t={t} at={s} until={s + 0.7} text="STOMP!" x={MILA_X + [-250, 250, -230][i]} y={f - [170, 230, 330][i]} size={64} color="#ff924c" rot={[-10, 8, -4][i]} />)}
            {STOMPS.map((s, i) => <Dust key={i} t={t} at={s + 0.16} x={MILA_X} y={f} s={0.6} />)}
            <StageWord t={t} at={word('hurry', 2)} until={E('hurry') + 0.5} text="HURRY!" x={MILA_X + 230} y={f - 600} size={78} color="#ff595e" rot={8} />
            <StageWord t={t} at={word('swing', 3)} until={E('swing') + 1.2} text="WHEEE!" x={SW_X + 30} y={290} size={96} color="#ff6fa5" rot={6} />
            <ImpactStar t={t} at={SAND1} x={880} y={f - 230} s={0.9} />
          </g>
        )}

        {/* ─── SCENE 2: the classroom ─── */}
        {scene === 'class' && (
          <g>
            {/* the window: the sun moves across while the paint dries */}
            <g>
              <rect x={1360} y={130} width={420} height={300} rx={20} fill="#bde0fe" {...kst(7)} />
              <circle cx={1420 + 300 * dryP} cy={250 - Math.sin(dryP * Math.PI) * 70} r={50} fill="#ffd166" {...kst(5)} />
              <path d="M 1570,130 L 1570,430 M 1360,280 L 1780,280" stroke="#c0874f" strokeWidth={14} />
              <rect x={1360} y={130} width={420} height={300} rx={20} fill="none" {...kst(7)} />
            </g>
            {/* the clothesline where the dry painting is hung */}
            <path d="M 240,170 Q 700,230 1200,170" fill="none" stroke="#6b4226" strokeWidth={6} />
            <Easel>
              {/* first painting: on the easel, then lifted (drips) — the second: on the easel until hung */}
              {!second && (
                <g transform={lifted ? `translate(${EASEL_X - 300},${f - 590 - 50 * EASE_OUT(prog(t, LIFT, LIFT + 0.4))}) rotate(-6)` : `translate(${EASEL_X - 170},${f - 500})`}>
                  <Painting drip={drip} wet={1} />
                </g>
              )}
              {second && !hung && (
                <g transform={`translate(${EASEL_X - 170},${f - 500}) scale(${popIn(t, NEW_PAINT)})`}>
                  <Painting drip={0} wet={1 - dryP} />
                </g>
              )}
            </Easel>
            {hung && (
              <g transform={`translate(560,${190 - 30 * (1 - EASE_OUT(prog(t, HANG, HANG + 0.6)))}) rotate(2) scale(0.9)`}>
                <Painting drip={0} wet={0} />
                <rect x={60} y={-14} width={18} height={40} rx={4} fill="#ff6fa5" {...kst(3)} />
                <rect x={262} y={-14} width={18} height={40} rx={4} fill="#ff6fa5" {...kst(3)} />
              </g>
            )}
            {/* Leo's block tower */}
            {Array.from({ length: blocks }).map((_, i) => (
              <g key={i} transform={`translate(${TOWER_X},${f - i * 110}) scale(${popIn(t, [word('s3_leo', 6), word('s3_leo', 8), word('s3_leo', 10)][i])})`}>
                <Block c={['#ff595e', '#ffca3a', '#4cc9f0'][i]} letter={['A', 'B', 'C'][i]} />
              </g>
            ))}
            {/* singing notes */}
            {within(t, S('sing'), E('sing') + 0.6) && [0, 1, 2].map((i) => {
              const p = ((t - S('sing')) * 0.6 + i / 3) % 1;
              return <text key={i} x={milaX + 80 + i * 40} y={f - 560 - p * 160} fontFamily={FONT_TOON} fontWeight={700} fontSize={70} fill={['#ff6fa5', '#4cc9f0', '#ffca3a'][i]} stroke={KINK} strokeWidth={4} paintOrder="stroke" opacity={1 - p}>♪</text>;
            })}
            <StageWord t={t} at={DRIPS[0]} until={DRIPS[1] + 1.0} text="DRIP!" x={EASEL_X + 170} y={f - 520} size={70} color="#4cc9f0" rot={-8} />
            <StageWord t={t} at={DRIPS[1]} until={DRIPS[1] + 1.2} text="DRIP!" x={EASEL_X + 260} y={f - 400} size={70} color="#ff6fa5" rot={8} />
            <StageWord t={t} at={word('touch', 1)} until={E('touch') + 0.6} text="DRY!" x={EASEL_X} y={f - 640} size={90} color="#ffca3a" rot={-6} />
          </g>
        )}

        {/* ─── SCENE 3: the meadow (recap, questions, chant, your turn) ─── */}
        {scene === 'meadow' && (
          <g>
            {within(t, S('r1') - 0.2, S('q1') - 0.3) && (
              <g>
                <g transform="translate(560,290)"><StepCard n={1} label="ask nicely" c="#ff595e" s={popIn(t, S('r1'))}><text y={30} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={70} fill="#ff6fa5">please?</text></StepCard></g>
                <g transform="translate(960,290)"><StepCard n={2} label="count to ten" c="#ffca3a" s={popIn(t, S('r2'))}><SandTimer p={0.5} flip={1} s={0.55} /></StepCard></g>
                <g transform="translate(1360,290)"><StepCard n={3} label="find something fun" c="#4cc9f0" s={popIn(t, S('r3'))}><text y={40} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={100} fill="#ff6fa5">♪</text></StepCard></g>
              </g>
            )}
            {/* your turn: the sand timer + 10 numbers lighting on the beat */}
            {t >= S('count_turn') && t < S('bye') && (
              <g>
                <g transform={`translate(960,340) scale(${popIn(t, S('count_turn'))})`}><SandTimer p={sandP2} flip={prog(t, S('count_turn') + 0.2, S('count_turn') + 1.0)} s={0.75} /></g>
                {TURN.map((k, j) => {
                  const lit = t >= k;
                  const x = j < 5 ? 400 + j * 100 : 1120 + (j - 5) * 100;
                  return (
                    <g key={`n${j}`} transform={`translate(${x},310) scale(${lit ? 1 + 0.3 * pulse(t, k, 0.3) : 0.85})`}>
                      <circle r={40} fill={lit ? RAINBOW[j % RAINBOW.length] : '#ffffff'} {...kst(5)} />
                      <text y={15} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={j === 9 ? 38 : 44} fill={lit ? '#ffffff' : '#adb5bd'} stroke={lit ? KINK : 'none'} strokeWidth={4} paintOrder="stroke">{j + 1}</text>
                    </g>
                  );
                })}
              </g>
            )}
          </g>
        )}

        {/* ─── the cast ─── */}
        {scene === 'playground' && !milaOnSwing && (
          <Kid spec={MILA_HERO} x={milaX} y={f} scale={0.62} expr={milaExpr} mouth={lipSync(VO, 'mila', t)} look={[0.7, -0.2]}
            armL={stomping ? 'hip' : within(t, S('s1_mila'), E('s1_mila')) ? 'present' : within(t, KS[0], SAND1) ? 'count' : 'down'}
            armR={stomping ? (within(t, S('want'), E('hurry')) ? 'point' : 'hip') : within(t, KS[0], SAND1) ? 'count' : talks('mila') ? 'present' : 'down'}
            fingersL={within(t, KS[0], SAND1 + 0.6) ? Math.min(5, counted) : 0} fingersR={within(t, KS[0], SAND1 + 0.6) ? Math.max(0, counted - 5) : 0}
            hop={stomp.hop} squash={stomp.squash} />
        )}
        {scene !== 'playground' && (
          <Kid spec={MILA_HERO} x={milaX} y={f} scale={0.62} expr={milaExpr} mouth={lipSync(VO, 'mila', t)} look={scene === 'class' ? [0.7, -0.2] : [0.3, -0.2]}
            armL={lifted ? 'up' : within(t, S('sing'), E('sing')) ? 'wave' : chantHop(0) > 0 ? 'up' : 'down'}
            armR={lifted ? 'up' : hung && within(t, HANG, E('proud')) ? 'up' : talks('mila') ? 'present' : chantHop(0) > 0 ? 'up' : 'down'}
            hop={chantHop(0)} />
        )}
        <Critter spec={BOBO_HERO} x={boboX} y={f} scale={0.6} expr={boboExpr} look={[0.6, -0.2]} mouth={lipSync(VO, 'bobo', t)}
          walking={scene === 'playground' && within(t, S('bobo_hi') - 1.2, S('bobo_hi'))} walk={t * 2}
          armL={within(t, S('bobo_wait'), E('bobo_wait')) ? 'up' : talks('bobo') ? 'point' : yay ? 'up' : 'down'} armR={within(t, S('timer'), S('k1')) ? 'point' : yay ? 'up' : 'down'}
          hop={chantHop(2)} />
        {scene !== 'playground' && (
          <Kid spec={LEO_HERO} x={leoX} y={f} scale={0.6} expr={leoExpr} mouth={lipSync(VO, 'leo', t)} look={[-0.6, -0.2]}
            armL={within(t, S('s3_leo'), E('s3_leo')) ? 'present' : yay ? 'up' : 'down'} armR={within(t, S('wow'), E('wow')) ? 'point' : yay ? 'up' : 'down'} hop={chantHop(1)} />
        )}

        {/* reactions */}
        <Reaction kind="steam" t={t} at={word('feel', 6)} until={E('feel') + 0.4} x={MILA_X} y={f - 480} s={1.0} />
        <Reaction kind="sweat" t={t} at={S('hurry')} until={E('leo_sad') + 0.6} x={SW_X + 120} y={330} s={0.7} />
        <Reaction kind="idea" t={t} at={S('bobo_hi') + 0.4} until={E('bobo_hi') + 0.3} x={BOBO_X} y={f - 470} s={0.7} />
        <Reaction kind="heart" t={t} at={S('s1_leo')} until={E('s1_leo') + 0.5} x={LEO_STAND + 300} y={330} s={0.7} />
        <Reaction kind="!" t={t} at={S('bobo_wait')} until={E('bobo_wait') + 0.3} x={330} y={f - 470} s={0.6} />
        <Reaction kind="cloud" t={t} at={S('sad2')} until={S('try_again') + 0.4} x={EASEL_X - 330} y={f - 640} s={0.6} />
        <Reaction kind="idea" t={t} at={S('s3_mila')} until={E('s3_mila') + 0.3} x={EASEL_X - 300} y={f - 660} s={0.6} />
        <Reaction kind="heart" t={t} at={S('proud')} until={E('proud') + 0.6} x={EASEL_X - 330} y={f - 640} s={0.7} />
      </ActionStage>

      {/* screen-space */}
      <PopText t={t} at={3.9} until={S('mila_hi') - 0.1} text="THE WAITING GAME" y={150} size={110} color="#ffca3a" />
      <PopText t={t} at={word('word', 0)} until={E('word') + 0.8} text="IMPATIENT" y={150} size={130} color="#ff924c" />
      <PopText t={t} at={word('word', 2)} until={E('word') + 0.8} text="= it's hard to wait" y={270} size={64} color="#ffffff" rot={2} />
      <ThinkTimer t={t} from={onBeat(E('ask') + 0.1)} to={S('bobo_hi') - 0.1} x={1760} y={190} r={90} label="HOW?" />
      <PopText t={t} at={S('s1')} until={S('s1_turn') - 0.1} text="STEP 1: ASK NICELY" y={150} size={96} color="#ff595e" />
      <PopText t={t} at={E('s1_turn') - 0.6} until={S('s2') - 0.1} text="YOUR TURN!" y={150} size={120} color="#ffffff" />
      <PopText t={t} at={S('s2')} until={KS[0] - 0.1} text="STEP 2: COUNT TO TEN" y={150} size={96} color="#ffca3a" />
      {KS.map((k, j) => <PopText key={j} t={t} at={k - 0.03} until={j < 9 ? KS[j + 1] - 0.03 : S('leo_off')} text={String(j + 1)} y={150} size={160} color={RAINBOW[j % RAINBOW.length]} />)}
      <PopText t={t} at={S('s3')} until={S('s3_turn') + 0.4} text="STEP 3: FIND SOMETHING FUN" y={150} size={84} color="#4cc9f0" />
      <ThinkTimer t={t} from={onBeat(E('s3_turn') + 0.1)} to={S('s3_mila') - 0.1} x={1760} y={190} r={90} label="THINK!" />
      <PopText t={t} at={S('lesson')} until={WIPE2} text="PLAY THE WAITING GAME!" y={150} size={96} color="#ffca3a" />
      <PopText t={t} at={S('again') + 0.1} until={S('r1') - 0.1} text="LET'S REMEMBER!" y={150} size={110} color="#ffca3a" />
      {(['q1', 'q2', 'q3', 'q4', 'q5'] as const).map((q) => {
        const a = ({ q1: 'a1', q2: 'a2', q3: 'a3', q4: 'a4', q5: 'a5' } as const)[q];
        return <ThinkTimer key={q} t={t} from={onBeat(E(q) + 0.1)} to={S(a) - 0.1} x={1760} y={190} r={90} label="THINK!" />;
      })}
      <PopText t={t} at={S('a1')} until={S('q2') - 0.2} text="IT'S HARD TO WAIT!" y={180} size={96} color="#ff924c" />
      <PopText t={t} at={S('a2')} until={S('q3') - 0.2} text="NEXT TURN, PLEASE?" y={180} size={96} color="#ff6fa5" />
      <PopText t={t} at={S('a3')} until={S('q4') - 0.2} text="STILL WET!" y={180} size={110} color="#4cc9f0" />
      <PopText t={t} at={S('a5')} until={S('chant') - 0.2} text="10!" y={180} size={170} color="#ffca3a" />
      <PopText t={t} at={S('ch1')} until={S('ch_turn') - 0.1} text="ASK · COUNT · PLAY!" y={150} size={100} color="#ffca3a" />
      <PopText t={t} at={E('ch_turn') + 0.1} until={S('ch2') - 0.1} text="YOUR TURN!" y={150} size={120} color="#ffffff" />
      <PopText t={t} at={S('ch3')} until={S('count_turn') - 0.1} text="ASK · COUNT · PLAY!" y={150} size={100} color="#52b788" />
      <PopText t={t} at={word('count_turn', 0)} until={TURN[0] - 0.05} text="YOUR TURN!" y={150} size={120} color="#ffffff" />
      {TURN.map((k, j) => <PopText key={j} t={t} at={k - 0.02} until={j < 9 ? TURN[j + 1] - 0.02 : S('great') - 0.1} text={String(j + 1)} y={150} size={150} color={RAINBOW[j % RAINBOW.length]} />)}
      <PopText t={t} at={S('bye')} until={END_IRIS} text="SEE YOU NEXT TIME!" y={150} size={100} color="#ffca3a" />
      <Confetti t={t} at={S('swing')} y={420} />
      <Confetti t={t} at={S('wow')} y={420} />
      <Confetti t={t} at={S('great')} y={420} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <SparksIntro t={t} at={0} cast={{ kids: [MILA_HERO, LEO_HERO], buddy: BOBO_HERO }} />
      <StarWipe t={t} at={WIPE1} dur={0.45} hold={0.15} color="#ffca3a" />
      <StarWipe t={t} at={WIPE2} dur={0.45} hold={0.15} color="#4cc9f0" />
      <StarWipe t={t} at={END_IRIS} dur={0.5} hold={5} color="#3b2a4a" x={W / 2} y={H * 0.45} />
    </>
  );
}
