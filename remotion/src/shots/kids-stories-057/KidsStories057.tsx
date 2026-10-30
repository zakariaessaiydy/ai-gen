// TINY SPARKS · Day 57 · 🧠 Educational Stories #5 — "Leo Learns Why We Must Listen" (LONG 16:9)
// kids-shorts/tiny-sparks/stories/day-057-leo-learns-why-we-must-listen. Cues from VO via K (keys.gen.ts).
// ENERGY LAYER standard: ident → baking cookies in Professor Hoot's kitchen → PROBLEM: Hoot reads the recipe but Leo
// plays "spoon rocket" and doesn't listen → 2 cups of flour (Mila counts) · "just ONE little spoon of salt" — Leo
// didn't hear: shake, shake, shake! · sugar, mix → the oven (a grown-up) → Bobo tastes: BLEH, so salty! → "Why?" (think
// timer) → Leo owns it and says sorry (feeling: sad) → Hoot, kindly: everyone makes mistakes; when we listen, we learn
// what to do → THE LISTENING RULES (4 cards: ears open · eyes looking · mouth quiet · hands still — do it with us) →
// the "HOOT SAYS" game (touch your nose · flap · jump? no! · clap · sit? no! · hug) — Bobo falls for one, Leo doesn't →
// TRY AGAIN: Leo listens to every step (1 spoon of salt) → yum, the best cookies → LESSON "When we listen, we learn"
// (say it) → remember (4 questions) → bye + star iris. Oven work is done by "a grown-up" (safety).
import React from 'react';
import { Kid, kidFaceAt, type KArm } from '../../lib/kids/kid';
import { Critter, critterFaceAt, type CArm } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, HOOT_HERO, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR } from '../../lib/kids/sets';
import { Backdrop } from '../../lib/kids/places';
import { Confetti, FONT_TOON, KidsCaptions, PopText, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, ImpactStar, Reaction, SparksIntro, StageWord, StarWipe, directorCam, onBeat, type Shot } from '../../lib/kids/energy';
import { EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsStories057', durationInSeconds: 304.8, fps: 30, width: 1920, height: 1080 };

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
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff' };
const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (EASE_OUT(p) - 1) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};

// ── layout: a counter with the mixing bowl in front of the cast
const X = { mila: 420, leo: 760, hoot: 1460, bobo: 1730 };
const KS = 0.58;
const BOWL: [number, number] = [960, 700];
const face = (x: number) => kidFaceAt(x, f, KS);

// ── anchors
const FLOUR = [word('flour', 0), word('flour', 1)];
const POUR0 = word('leo_salt', 9);
const SHAKE = word('pour', 3);
const MIX = word('step3', 7);
const DING = word('oven', 11);
const CRUNCH = word('taste', 4);
const BLEH = S('yuck');
const RULES = (['r1', 'r2', 'r3', 'r4'] as const).map((k) => S(k));
const GAME = (['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8'] as const);
const FLOUR2 = S('b1');
const SALT2 = S('b2');
const MIX2 = S('b3');
const DING2 = word('ding', 0);
const YUM = word('yum', 4);
const batch2 = (t: number) => t >= S('bake2') - 0.3;

const SHOTS: Shot[] = [
  { t: 0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.01 },
  { t: S('yay') - 0.2, z: 1.5, x: X.bobo, y: f - 300, move: 'whip' },
  { t: S('hoot1') - 0.2, z: 1.5, x: X.hoot, y: f - 280, move: 'whip', push: 0.01 },
  { t: S('not') - 0.2, z: 1.6, x: X.leo, y: face(X.leo)[1] + 40, move: 'smooth', dur: 0.8, push: 0.02 },
  { t: S('step1') - 0.2, z: 1.3, x: BOWL[0], y: BOWL[1] - 140, move: 'smooth', dur: 0.8 },
  { t: S('step2') - 0.2, z: 1.5, x: X.hoot, y: f - 280, move: 'snap' },
  { t: S('leo_salt') - 0.2, z: 1.4, x: (X.leo + BOWL[0]) / 2, y: BOWL[1] - 200, move: 'smooth', dur: 0.8 },
  { t: S('oven') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 },
  { t: S('taste') - 0.2, z: 1.6, x: X.bobo, y: f - 300, move: 'snap', push: 0.02 },
  { t: S('what') - 0.2, z: 1.6, x: X.mila, y: face(X.mila)[1] + 40, move: 'whip' },
  { t: S('ask') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.7 },
  { t: S('oops') - 0.2, z: 1.6, x: X.leo, y: face(X.leo)[1] + 40, move: 'smooth', dur: 1.0, push: 0.03 },
  { t: S('kind') - 0.2, z: 1.5, x: X.hoot, y: f - 280, move: 'smooth', dur: 0.8 },
  { t: S('rules') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.7 },
  { t: S('game') - 0.2, z: 1.5, x: X.hoot, y: f - 280, move: 'snap' },
  { t: S('g1') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('g3b') - 0.1, z: 1.55, x: X.bobo, y: f - 300, move: 'whip' },
  { t: E('g3b') + 0.3, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('g5b') - 0.1, z: 1.6, x: X.leo, y: face(X.leo)[1] + 40, move: 'whip' },
  { t: E('g5b') + 0.3, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('bake2') - 0.2, z: 1.3, x: BOWL[0] - 100, y: BOWL[1] - 160, move: 'smooth', dur: 0.8 },
  { t: S('yum') - 0.2, z: 1.6, x: X.bobo, y: f - 300, move: 'snap', push: 0.02 },
  { t: S('proud') - 0.2, z: 1.6, x: X.leo, y: face(X.leo)[1] + 40, move: 'whip' },
  { t: S('lesson') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 },
  { t: S('a1') - 0.1, z: 1.55, x: X.leo, y: face(X.leo)[1] + 40, move: 'snap' },
  { t: E('a1') + 0.6, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('a4') - 0.1, z: 1.5, x: X.bobo, y: f - 300, move: 'snap' },
  { t: E('a4') + 0.6, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
];
const PUNCHES = [BLEH, DING, DING2, YUM, ...RULES];

// ── props
const Counter: React.FC = () => (
  <g>
    <Vol kind="slope"><rect x={560} y={BOWL[1] + 30} width={800} height={50} rx={18} fill="#ffd6a5" {...kst(7)} /></Vol>
    <Vol><rect x={600} y={BOWL[1] + 76} width={720} height={f - BOWL[1] - 60} rx={16} fill="#a8dadc" {...kst(7)} /></Vol>
  </g>
);
const Bowl: React.FC<{ fill: number; mixing: boolean; t: number }> = ({ fill, mixing, t }) => (
  <g transform={`translate(${BOWL[0]},${BOWL[1]})`}>
    {fill > 0 && <ellipse cx={0} cy={-40} rx={110 * Math.min(1, 0.6 + fill * 0.4)} ry={24} fill="#fff3e0" {...kst(4)} />}
    {mixing && <path d={`M ${-60 + Math.sin(t * 10) * 40},-60 L ${-20 + Math.sin(t * 10) * 40},-150`} stroke="#a0673c" strokeWidth={14} strokeLinecap="round" />}
    <Vol><path d="M -140,-40 Q -130,60 0,60 Q 130,60 140,-40 Z" fill="#ff6fa5" {...kst(7)} /></Vol>
    <ellipse cx={0} cy={-40} rx={140} ry={26} fill="none" {...kst(6)} />
  </g>
);
const Spoon: React.FC = () => (
  <g><rect x={-6} y={-100} width={12} height={110} rx={6} fill="#ced4da" {...kst(4)} /><Vol><ellipse cx={0} cy={-110} rx={22} ry={30} fill="#ced4da" {...kst(4)} /></Vol></g>
);
const Shaker: React.FC = () => (
  <g>
    <Vol><rect x={-30} y={-70} width={60} height={90} rx={14} fill="#ffffff" {...kst(5)} /></Vol>
    <rect x={-30} y={-80} width={60} height={20} rx={8} fill="#adb5bd" {...kst(4)} />
    <text y={-10} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={24} fill={KINK}>SALT</text>
  </g>
);
const Cookies: React.FC<{ salty: boolean; n?: number }> = ({ salty, n = 5 }) => (
  <g>
    <Vol><ellipse cx={0} cy={0} rx={170} ry={36} fill="#ffffff" {...kst(6)} /></Vol>
    {Array.from({ length: n }).map((_, i) => (
      <g key={i} transform={`translate(${-100 + i * 50},${-16 - (i % 2) * 12})`}>
        <Vol><circle r={32} fill="#e9a35b" {...kst(4)} /></Vol>
        {[[-10, -6], [8, 4], [-2, 12]].map(([x, y], j) => <circle key={j} cx={x} cy={y} r={5} fill={salty ? '#ffffff' : '#6d4c41'} />)}
      </g>
    ))}
  </g>
);
const RuleCard: React.FC<{ i: number; on: number }> = ({ i, on }) => {
  const label = ['EARS OPEN', 'EYES LOOKING', 'MOUTH QUIET', 'HANDS STILL'][i];
  const c = ['#ffca3a', '#4cc9f0', '#ff6fa5', '#52b788'][i];
  return (
    <g transform={`scale(${1 + on * 0.12})`}>
      <rect x={-150} y={-150} width={300} height={300} rx={40} fill={on ? '#fff3b0' : '#ffffff'} {...kst(on ? 10 : 7)} />
      <circle cx={-120} cy={-120} r={34} fill={c} {...kst(5)} />
      <text x={-120} y={-106} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill="#ffffff">{i + 1}</text>
      <g transform="translate(0,-30)">
        {i === 0 && <g><Vol><path d="M -30,-60 Q 50,-70 50,0 Q 50,40 10,60 Q -10,70 -20,40 Q 20,20 0,0 Q -20,-20 -30,-60 Z" fill="#ffd6b8" {...kst(6)} /></Vol>{[0, 1, 2].map((k) => <path key={k} d={`M ${-60 - k * 18},-20 q -14,20 0,40`} fill="none" stroke={c} strokeWidth={6} strokeLinecap="round" />)}</g>}
        {i === 1 && <g>{[-45, 45].map((x) => <g key={x}><Vol><ellipse cx={x} cy={0} rx={36} ry={44} fill="#ffffff" {...kst(6)} /></Vol><circle cx={x} cy={4} r={18} fill="#1982c4" /><circle cx={x - 6} cy={-4} r={6} fill="#ffffff" /></g>)}</g>}
        {i === 2 && <g><Vol><circle r={60} fill="#ffd6b8" {...kst(6)} /></Vol><path d="M -26,20 Q 0,34 26,20" fill="none" {...kst(6)} /><rect x={-8} y={-60} width={16} height={90} rx={8} fill="#ffd6b8" {...kst(5)} /></g>}
        {i === 3 && <g>{[-40, 40].map((x) => <Vol key={x}><rect x={x - 28} y={-40} width={56} height={80} rx={26} fill="#ffd6b8" {...kst(6)} /></Vol>)}</g>}
      </g>
      <text y={120} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={label.length > 10 ? 34 : 40} fill={KINK}>{label}</text>
    </g>
  );
};

export default function KidsStories057() {
  const t = useT();
  const cam = directorCam(t, SHOTS, [...PUNCHES]);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);

  // which "Hoot says" command is active (the cast acts during the command + its gap)
  const gi = GAME.findIndex((g, i) => within(t, S(g) + 0.8, i < 7 ? S(GAME[i + 1]) : S('great')));
  const act = gi < 0 ? '' : ['nose', 'flap', 'nojump', 'clap', 'nosit', 'hug', 'wiggle', 'nostomp'][gi];
  const rulesOn = within(t, S('rules'), S('safe') - 0.1);
  const ri = RULES.findIndex((r, i) => within(t, r, i < 3 ? RULES[i + 1] : S('r_turn') + 4));
  const yay = within(t, S('yum'), E('proud') + 0.6) || t >= S('bye') || within(t, S('great'), E('great') + 0.4);
  const sad = within(t, S('oops'), S('kind'));

  // Leo
  const leoArm = (): KArm =>
    act === 'wiggle' ? 'count' : within(t, S('not'), E('rocket') + 0.4) ? 'up' : act === 'nose' ? 'think' : act === 'flap' ? (Math.sin(t * 12) > 0 ? 'up' : 'down') : act === 'clap' ? 'clap' : act === 'hug' ? 'hug'
    : ri === 0 ? 'think' : ri === 3 ? 'down' : within(t, S('b1'), E('b3')) ? 'present' : yay ? 'up' : talks('leo') ? 'present' : 'down';
  const leoExpr: KExpr = sad ? 'sad' : within(t, S('not'), E('pour') + 0.5) ? 'laugh' : within(t, S('g5b'), E('g5b')) ? 'proud' : yay ? 'laugh' : talks('leo') ? 'happy' : 'smile';
  const rocketY = within(t, S('not'), E('rocket') + 0.4) ? Math.sin(t * 5) * 60 : 0;
  // Bobo
  const boboExpr: KExpr = within(t, BLEH, E('yuck') + 0.6) ? 'oops' : within(t, S('g3b'), E('g3b')) ? 'oops' : within(t, S('yum'), E('yum') + 0.5) ? 'laugh' : talks('bobo') ? 'happy' : yay ? 'laugh' : 'smile';
  const boboArm: CArm = act === 'flap' ? (Math.sin(t * 12) > 0 ? 'up' : 'down') : act === 'clap' ? 'clap' : act === 'hug' ? 'hug' : act === 'nose' ? 'think' : within(t, S('g3'), E('g3b')) ? 'up' : yay ? 'up' : 'down';
  const boboHop = within(t, word('g3', 0), word('g3', 0) + 0.7) ? Math.sin(prog(t, word('g3', 0), word('g3', 0) + 0.7) * Math.PI) * 80 : yay ? Math.abs(Math.sin(t * 7)) * 22 : 0;
  // Mila
  const milaArm = (): KArm => (act === 'nose' ? 'think' : act === 'flap' ? (Math.sin(t * 12 + 1) > 0 ? 'up' : 'down') : act === 'clap' ? 'clap' : act === 'hug' ? 'hug' : ri === 0 ? 'think' : within(t, S('flour'), E('flour')) ? 'count' : yay ? 'up' : talks('mila') ? 'present' : 'down');
  const fingersMila = within(t, FLOUR[0], E('flour') + 0.5) ? (t >= FLOUR[1] ? 2 : 1) : 0;
  // Hoot reading the recipe
  const hootArm: CArm = talks('hoot') ? 'point' : act === 'flap' ? (Math.sin(t * 12) > 0 ? 'up' : 'down') : act === 'hug' ? 'hug' : 'down';

  // the batter
  const bowlFill = batch2(t) ? (t >= FLOUR2 ? 1 : 0) : t >= FLOUR[0] && t < S('oven') ? 1 : 0;
  const mixing = within(t, MIX, E('step3')) || within(t, MIX2 + 1, E('b3'));
  const salting = within(t, POUR0, E('pour') + 0.3);
  const cookiesOut = within(t, DING, S('bake2') - 0.3) || t >= DING2;
  const shakerAt: [number, number] = [BOWL[0] - 120, BOWL[1] - 160];

  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
        <Backdrop place="kitchen" w={W} h={H} t={t} fx={false} />
        {/* the cast behind the counter */}
        <Kid spec={MILA_HERO} x={X.mila} y={f} scale={KS} expr={yay ? 'laugh' : within(t, S('what'), E('what')) ? 'surprised' : talks('mila') ? 'happy' : 'smile'} look={[0.6, -0.1]} mouth={lipSync(VO, 'mila', t)}
          armL={act === 'hug' ? 'hug' : act === 'clap' ? 'clap' : act === 'flap' ? (Math.sin(t * 12 + 1) > 0 ? 'down' : 'up') : yay ? 'up' : 'down'} armR={milaArm()} fingersR={fingersMila || undefined}
          legs={act === 'nosit' ? 'stand' : 'stand'} hop={yay ? Math.abs(Math.sin(t * 7 + 1)) * 22 : 0} />
        <Kid spec={LEO_HERO} x={X.leo} y={f} scale={KS} expr={leoExpr} look={within(t, S('not'), E('rocket')) ? [0, -0.9] : [0.4, -0.1]} mouth={lipSync(VO, 'leo', t)}
          armL={act === 'hug' ? 'hug' : act === 'clap' ? 'clap' : act === 'flap' ? (Math.sin(t * 12) > 0 ? 'down' : 'up') : within(t, POUR0, E('pour')) ? 'present' : yay ? 'up' : 'down'} armR={leoArm()}
          holdR={within(t, S('not'), E('rocket') + 0.4) ? <g transform={`translate(0,${rocketY}) rotate(${Math.sin(t * 6) * 20})`}><Spoon /></g> : undefined}
          squash={sad ? 0.1 : 0} tilt={sad ? -8 : 0} hop={yay ? Math.abs(Math.sin(t * 7)) * 22 : 0} />
        <Critter spec={HOOT_HERO} x={X.hoot} y={f} scale={0.52} expr={talks('hoot') ? 'happy' : yay ? 'laugh' : within(t, BLEH, E('yuck')) ? 'surprised' : 'smile'} look={[-0.6, -0.2]} mouth={lipSync(VO, 'hoot', t)}
          armL={hootArm} armR={act === 'clap' ? 'clap' : act === 'hug' ? 'hug' : 'down'} facing={-1} />
        <Critter spec={BOBO_HERO} x={X.bobo} y={f} scale={0.6} expr={boboExpr} look={[-0.6, -0.2]} mouth={lipSync(VO, 'bobo', t) + (within(t, BLEH, BLEH + 0.8) ? 0.9 : 0)}
          armL={boboArm} armR={within(t, CRUNCH - 0.8, BLEH) || within(t, YUM - 0.8, YUM + 0.5) ? 'hold' : boboArm} hop={boboHop}
          holdR={within(t, CRUNCH - 0.8, BLEH) || within(t, YUM - 0.8, YUM + 0.5) ? <g transform="scale(1.6)"><Vol><circle r={32} fill="#e9a35b" {...kst(4)} /></Vol></g> : undefined} />

        {/* the counter + bowl + props (in front) */}
        <Counter />
        <Bowl fill={bowlFill} mixing={mixing} t={t} />
        {/* flour cups */}
        {[FLOUR[0], FLOUR[1], FLOUR2, FLOUR2 + 0.6].map((a, i) => within(t, a - 0.1, a + 0.9) && (
          <g key={i} transform={`translate(${BOWL[0] + 40},${BOWL[1] - 120 - (1 - prog(t, a, a + 0.5)) * 60}) rotate(${-60 * prog(t, a, a + 0.5)})`}>
            <Vol><rect x={-34} y={-40} width={68} height={70} rx={12} fill="#a0c4ff" {...kst(5)} /></Vol>
            <ellipse cx={0} cy={-40} rx={30} ry={8} fill="#ffffff" />
          </g>
        ))}
        {/* the salt shaker: lots (first batch) vs one spoon (second batch) */}
        {salting && (
          <g transform={`translate(${shakerAt[0]},${shakerAt[1] + Math.sin(t * 20) * 14}) rotate(150)`}>
            <Shaker />
          </g>
        )}
        {salting && Array.from({ length: 14 }).map((_, i) => {
          const p = (t * 1.8 + i / 14) % 1;
          return <circle key={i} cx={shakerAt[0] + 30 + (i % 4) * 8} cy={shakerAt[1] + 40 + p * 100} r={4} fill="#ffffff" stroke={KINK} strokeWidth={1.5} />;
        })}
        {within(t, SALT2, SALT2 + 2) && (
          <g transform={`translate(${BOWL[0] - 60},${BOWL[1] - 120 - Math.sin(prog(t, SALT2, SALT2 + 2) * Math.PI) * 30}) rotate(-30)`}>
            <Spoon />
            <ellipse cx={0} cy={-114} rx={16} ry={10} fill="#ffffff" />
          </g>
        )}
        {/* cookies */}
        {cookiesOut && (
          <g transform={`translate(${BOWL[0] + 300},${BOWL[1] + 10}) scale(${0.85 * popIn(t, t < S('bake2') ? DING : DING2)})`}>
            <Cookies salty={!batch2(t)} n={t >= CRUNCH && !batch2(t) ? 4 : t >= YUM && batch2(t) ? 4 : 5} />
          </g>
        )}
        {/* the listening rules */}
        {rulesOn && RULES.map((r, i) => t >= r - 0.1 && (
          <g key={i} transform={`translate(${480 + i * 320},300) scale(${0.8 * popIn(t, r - 0.1)})`}><RuleCard i={i} on={ri === i ? 1 : 0} /></g>
        ))}

        {/* FX + words */}
        <StageWord t={t} at={S('rocket')} until={E('rocket') + 0.4} text="ZOOM! ZOOM!" x={X.leo + 140} y={face(X.leo)[1] - 240} size={80} color="#4cc9f0" rot={-8} />
        <StageWord t={t} at={SHAKE} until={E('pour') + 0.4} text="SHAKE! SHAKE!" x={BOWL[0] - 120} y={BOWL[1] - 330} size={80} color="#ffffff" rot={6} />
        <StageWord t={t} at={DING} until={DING + 1.2} text="DING!" x={BOWL[0] + 330} y={BOWL[1] - 200} size={90} color="#ffca3a" rot={-6} />
        <StageWord t={t} at={DING2} until={DING2 + 1.2} text="DING!" x={BOWL[0] + 330} y={BOWL[1] - 200} size={90} color="#ffca3a" rot={6} />
        <StageWord t={t} at={BLEH} until={E('yuck') + 0.5} text="BLEH! SALTY!" x={X.bobo} y={f - 520} size={80} color="#8ac926" rot={-6} />
        <StageWord t={t} at={YUM} until={E('yum') + 0.5} text="YUM!" x={X.bobo} y={f - 520} size={100} color="#ff6fa5" rot={6} />
        <StageWord t={t} at={word('g3', 0)} until={E('g3b') + 0.3} text="OOPS!" x={X.bobo} y={f - 540} size={80} color="#ff924c" rot={6} />
        <ImpactStar t={t} at={BLEH} x={X.bobo} y={f - 380} s={0.7} color="#c7f2d4" />
        <ImpactStar t={t} at={YUM} x={X.bobo} y={f - 380} s={0.7} />
        <Reaction kind="!" t={t} at={S('not')} until={S('step1')} x={X.leo} y={face(X.leo)[1] - 200} s={0.6} />
        <Reaction kind="?" t={t} at={S('what')} until={S('oops')} x={X.mila} y={face(X.mila)[1] - 200} s={0.7} />
        <Reaction kind="cloud" t={t} at={S('feel')} until={S('kind')} x={X.leo} y={face(X.leo)[1] - 220} s={0.6} />
        <Reaction kind="heart" t={t} at={S('kind')} until={E('why') + 0.4} x={X.hoot} y={f - 480} s={0.7} />
        <Reaction kind="stars" t={t} at={S('g3b')} until={E('g3b') + 0.4} x={X.bobo} y={f - 470} s={0.6} />
        <Reaction kind="heart" t={t} at={S('proud')} until={E('proud') + 0.6} x={X.leo} y={face(X.leo)[1] - 200} s={0.7} />
      </ActionStage>

      {/* screen-space */}
      <PopText t={t} at={S('intro') + 0.3} until={S('yay') - 0.1} text="BAKING COOKIES!" y={150} size={110} color="#ffca3a" />
      <PopText t={t} at={S('not')} until={S('step1') - 0.1} text="LEO IS NOT LISTENING" y={150} size={90} color="#ff924c" />
      <PopText t={t} at={S('step1')} until={S('step2') - 0.1} text="1  TWO CUPS OF FLOUR" y={150} size={90} color="#ffffff" />
      <PopText t={t} at={S('step2')} until={S('step3') - 0.1} text="2  ONE SPOON OF SALT" y={150} size={90} color="#4cc9f0" />
      <PopText t={t} at={S('step3')} until={S('oven') - 0.1} text="3  SUGAR, MIX!" y={150} size={90} color="#ff6fa5" />
      <PopText t={t} at={word('oven', 2)} until={DING} text="(A GROWN-UP USES THE OVEN)" y={150} size={60} color="#ffffff" />
      <ThinkTimer t={t} from={onBeat(E('ask') + 0.1)} to={S('oops') - 0.1} x={1760} y={190} r={90} label="WHY?" />
      <PopText t={t} at={word('why', 2)} until={S('rules') - 0.1} text="WHEN WE LISTEN, WE LEARN!" y={150} size={90} color="#52b788" />
      <PopText t={t} at={S('rules')} until={S('r1') - 0.1} text="THE LISTENING RULES" y={130} size={100} color="#ffca3a" />
      <PopText t={t} at={S('r_turn')} until={S('safe') - 0.1} text="YOUR TURN!" y={600} size={100} color="#ffffff" />
      <PopText t={t} at={word('game', 9)} until={S('g1') - 0.1} text="HOOT SAYS!" y={150} size={130} color="#ffca3a" />
      {GAME.map((g, i) => (
        <PopText key={g} t={t} at={S(g)} until={i < 7 ? S(GAME[i + 1]) - 0.1 : S('great') - 0.1}
          text={['HOOT SAYS: TOUCH YOUR NOSE', 'HOOT SAYS: FLAP!', 'JUMP? (HOOT DIDN’T SAY!)', 'HOOT SAYS: CLAP!', 'SIT? (HOOT DIDN’T SAY!)', 'HOOT SAYS: BIG HUG!', 'HOOT SAYS: WIGGLE YOUR FINGERS!', 'STOMP? (HOOT DIDN’T SAY!)'][i]}
          y={150} size={i === 2 || i === 4 || i === 7 ? 70 : 76} color={i === 2 || i === 4 || i === 7 ? '#ff924c' : '#ffffff'} />
      ))}
      <PopText t={t} at={S('bake2')} until={S('ding') - 0.1} text="LEO LISTENS!" y={150} size={110} color="#4cc9f0" />
      <PopText t={t} at={S('lesson')} until={S('rem') - 0.2} text="WHEN WE LISTEN, WE LEARN!" y={150} size={90} color="#ffca3a" />
      <PopText t={t} at={E('lesson_turn') - 0.6} until={S('rem') - 0.2} text="YOUR TURN!" y={280} size={100} color="#ffffff" />
      <PopText t={t} at={S('rem') + 0.1} until={S('q1') - 0.1} text="LET'S REMEMBER!" y={150} size={110} color="#ffca3a" />
      {(['q1', 'q2', 'q3', 'q4', 'q5'] as const).map((q, i) => (
        <ThinkTimer key={q} t={t} from={onBeat(E(q) + 0.1)} to={S((['a1', 'a2', 'a3', 'a4', 'a5'] as const)[i]) - 0.1} x={1760} y={190} r={90} label="THINK!" />
      ))}
      <PopText t={t} at={S('a1')} until={S('q2') - 0.2} text="SPOON ROCKET!" y={150} size={110} color="#4cc9f0" />
      <PopText t={t} at={S('a2')} until={S('q3') - 0.2} text="TOO MUCH SALT!" y={150} size={110} color="#8ac926" />
      <PopText t={t} at={S('a3')} until={S('q4') - 0.2} text="EARS · EYES · MOUTH · HANDS" y={150} size={80} color="#ffca3a" />
      <PopText t={t} at={S('a4')} until={S('q5') - 0.2} text="HOOT SAYS!" y={150} size={120} color="#ff6fa5" />
      <PopText t={t} at={S('a5')} until={S('bye') - 0.2} text="HE LISTENED!" y={150} size={120} color="#4cc9f0" />
      <PopText t={t} at={word('safe', 3)} until={S('game') - 0.3} text="LISTENING KEEPS US SAFE ✋" y={150} size={86} color="#ff595e" />
      <PopText t={t} at={S('bye')} until={E('bye2') + 0.6} text="SEE YOU NEXT TIME!" y={150} size={100} color="#ffca3a" />
      <Confetti t={t} at={S('great')} y={420} />
      <Confetti t={t} at={YUM} y={420} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <SparksIntro t={t} at={0} cast={{ kids: [MILA_HERO, LEO_HERO], buddy: BOBO_HERO }} />
      <StarWipe t={t} at={E('bye2') + 0.6} dur={0.5} hold={5} color="#3b2a4a" x={W / 2} y={H * 0.45} />
    </>
  );
}
