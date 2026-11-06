// TINY SPARKS · Day 1 · 🧠 Educational Stories #1 — "Leo Learns Why We Should Share" (Short 9:16)
// kids-shorts/tiny-sparks/stories/day-001-leo-learns-why-we-should-share. Cues derive from VO (S/E).
// WANT (his new ball, "mine!") → TRY (plays alone, it rolls away) → OOPS (lonely) → LEARN (1 ask,
// 2 take turns, 3 play together) → DO IT (passes) → CELEBRATE (confetti) → RECAP → "who will YOU share with?"
import React from 'react';
import { Kid, kidFaceAt, type KArm } from '../../lib/kids/kid';
import { Critter, critterFaceAt, type CArm } from '../../lib/kids/critter';
import { BOBO, CAPTION_COLORS, LEO, MILA } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import type { KExpr } from '../../lib/kids/face';
import { Ball, Confetti, KidsCaptions, KidsStage, PopText, ThinkTimer, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { EASE_INOUT, prog } from '../../lib/shorts';
import { VO } from './vo.gen';

export const compositionConfig = { id: 'KidsStories001', durationInSeconds: 42, fps: 30, width: 1080, height: 1920 };

// 0 brand new ball · 1 mine · 2 can we play · 3 pleeease · 4 no, by myself · 5 alone is boring ·
// 6 lonely, what can Leo do · 7 first, ask · 8 want to play with me · 9 yes yay · 10 take turns ·
// 11 your turn Bobo · 12 thank you · 13 play together · 14 sharing is more fun · 15 recap · 16 who will you share with
const S = (i: number) => VO[i].start;
const E = (i: number) => VO[i].end;

const f = FLOOR(1920);
const KS = 0.9;
const LEO_X = 540;
const MILA_X = 215;
const BOBO_X = 865;
const BS = 0.85;
const R = 66; // ball radius
const HOLD_KID = f - 285 * KS; // ball height held in front of a kid's tummy
const HOLD_BOBO = f - 175 * BS;
const GROUND = f - R + 4;

const BOUNCE0 = E(4) + 0.15;
const ROLL_OFF = BOUNCE0 + 1.4;
const SIT = ROLL_OFF + 0.9;
const THINK: [number, number] = [E(6) + 0.15, S(7) - 0.1];
const PASS1 = E(10) + 0.1; // Leo → Mila
const PASS2 = PASS1 + 0.85; // Mila → Leo
const PASS3 = S(11) + 0.35; // Leo → Bobo
const PLAY = E(13) + 0.1; // everybody: Bobo → Mila → Leo → Bobo → Leo
const CONFETTI = PLAY + 0.4;

const [lfx, lfy] = kidFaceAt(LEO_X, f, KS);
const [, lsy] = kidFaceAt(LEO_X, f, KS, 'sit');
const [mfx, mfy] = kidFaceAt(MILA_X, f, KS);
const [bfx, bfy] = critterFaceAt(BOBO_X, f, BS);

type Fr = { z: number; x: number; y: number };
const shot = (t1: number, t2: number, a: Fr, b: Fr = a): CamKey[] => [
  { t: t1, ...a, cut: true },
  { t: t2 - 0.01, ...b },
];
const MED: Fr = { z: 1.12, x: 540, y: 1150 };
const CAM: CamKey[] = [
  ...shot(0, S(2) - 0.1, { z: 1.65, x: lfx, y: lfy + 200 }, { z: 1.75, x: lfx, y: lfy + 200 }),
  ...shot(S(2) - 0.1, S(4) - 0.1, MED),
  ...shot(S(4) - 0.1, E(4) + 0.1, { z: 1.6, x: lfx, y: lfy + 200 }),
  ...shot(E(4) + 0.1, S(5) - 0.1, { z: 1.25, x: 640, y: 1180 }),
  ...shot(S(5) - 0.1, S(6) - 0.1, { z: 1.7, x: lfx, y: lsy + 170 }),
  ...shot(S(6) - 0.1, S(7) - 0.1, MED),
  ...shot(S(7) - 0.1, S(8) - 0.1, { z: 1.6, x: mfx + 60, y: mfy + 200 }),
  ...shot(S(8) - 0.1, S(9) - 0.1, { z: 1.45, x: lfx, y: lfy + 230 }),
  ...shot(S(9) - 0.1, S(10) - 0.1, { z: 1.6, x: bfx - 40, y: bfy + 160 }),
  ...shot(S(10) - 0.1, E(10) + 0.05, { z: 1.6, x: mfx + 60, y: mfy + 200 }),
  ...shot(E(10) + 0.05, S(13) - 0.1, MED),
  ...shot(S(13) - 0.1, S(14) - 0.1, { z: 1.05, x: 540, y: 1100 }),
  ...shot(S(14) - 0.1, S(15) - 0.1, { z: 1.65, x: lfx, y: lfy + 200 }),
  ...shot(S(15) - 0.1, S(16) - 0.1, MED),
  ...shot(S(16) - 0.1, 42, { z: 1.6, x: mfx + 60, y: mfy + 200 }, { z: 1.7, x: mfx + 60, y: mfy + 200 }),
];

type P = [number, number];
const hands = { leo: [LEO_X, HOLD_KID] as P, mila: [MILA_X + 40, HOLD_KID] as P, bobo: [BOBO_X - 30, HOLD_BOBO] as P };
const arc = (t: number, t0: number, a: P, b: P, h = 260, dur = 0.6): P | null => {
  if (t < t0 || t > t0 + dur) return null;
  const p = EASE_INOUT(prog(t, t0, t0 + dur));
  return [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p - Math.sin(p * Math.PI) * h];
};

// where the ball is, who holds it, and its spin
const ballAt = (t: number): { p: P; holder: 'leo' | 'mila' | 'bobo' | null; rot: number } => {
  // bounce alone: two bounces in his hands, the third gets away and rolls off screen
  if (t >= BOUNCE0 && t < ROLL_OFF) {
    const k = (t - BOUNCE0) / 0.45;
    const n = Math.floor(k);
    const ph = k - n;
    const y = GROUND - (GROUND - HOLD_KID) * Math.abs(Math.cos(ph * Math.PI));
    return { p: [LEO_X + n * 30, y], holder: null, rot: t * 90 };
  }
  if (t >= ROLL_OFF && t < THINK[0]) {
    const p = prog(t, ROLL_OFF, ROLL_OFF + 1.1);
    return { p: [LEO_X + 90 + p * 700, GROUND], holder: null, rot: p * 900 };
  }
  // it rolls back in during the think pause, Leo picks it up when he asks
  if (t >= THINK[0] && t < S(8) - 0.2) {
    const p = EASE_INOUT(prog(t, THINK[0] + 0.3, THINK[1]));
    return { p: [1300 - p * 620, GROUND], holder: null, rot: -p * 800 };
  }
  if (t >= S(8) - 0.2 && t < S(8) + 0.2) {
    const p = EASE_INOUT(prog(t, S(8) - 0.2, S(8) + 0.2));
    return { p: [680 - p * 140, GROUND + (HOLD_KID - GROUND) * p], holder: null, rot: 0 };
  }
  const passes: [number, P, P, 'leo' | 'mila' | 'bobo'][] = [
    [PASS1, hands.leo, hands.mila, 'mila'],
    [PASS2, hands.mila, hands.leo, 'leo'],
    [PASS3, hands.leo, hands.bobo, 'bobo'],
    [PLAY, hands.bobo, hands.mila, 'mila'],
    [PLAY + 0.55, hands.mila, hands.leo, 'leo'],
    [PLAY + 1.1, hands.leo, hands.bobo, 'bobo'],
    [PLAY + 1.65, hands.bobo, hands.leo, 'leo'],
  ];
  for (const [t0, a, b] of passes) {
    const q = arc(t, t0, a, b, 240, 0.5);
    if (q) return { p: q, holder: null, rot: (t - t0) * 600 };
  }
  let holder: 'leo' | 'mila' | 'bobo' = 'leo';
  for (const [t0, , , to] of passes) if (t >= t0 + 0.5) holder = to;
  if (t < PASS1) holder = 'leo';
  return { p: hands[holder], holder, rot: 0 };
};

export default function KidsStories001() {
  const t = useT();
  const cam = camAt(t, CAM);
  const ball = ballAt(t);
  const party = t >= PLAY && t < S(14) - 0.1;
  const hopOf = (ph: number) => (party ? Math.abs(Math.sin((t - PLAY) * 5 + ph)) * 40 : 0);

  const ph =
    t < S(2) - 0.1 ? 'mine'
    : t < S(4) - 0.1 ? 'ask'
    : t < E(4) + 0.1 ? 'no'
    : t < SIT ? 'alone'
    : t < S(8) - 0.2 ? 'lonely'
    : t < E(9) ? 'asks'
    : t < PLAY ? 'turns'
    : t < S(14) - 0.1 ? 'party'
    : t < S(15) - 0.1 ? 'fun'
    : 'recap';

  const leoExpr: KExpr =
    ph === 'mine' ? 'proud' : ph === 'no' ? 'proud' : ph === 'alone' ? (t >= ROLL_OFF ? 'oops' : 'happy') : ph === 'lonely' ? 'sad'
    : ph === 'party' || ph === 'fun' ? 'laugh' : 'happy';
  const leoHolds = ball.holder === 'leo';
  const leoArmL: KArm = leoHolds ? (ph === 'mine' || ph === 'ask' || ph === 'no' ? 'hug' : 'hold') : ph === 'alone' && t < ROLL_OFF ? { to: [40, 80] } : ph === 'party' ? 'up' : ph === 'recap' ? 'wave' : 'down';
  const leoArmR: KArm = leoHolds ? (ph === 'mine' || ph === 'ask' || ph === 'no' ? 'hug' : 'hold') : ph === 'alone' && t < ROLL_OFF ? { to: [40, 80] } : ph === 'party' ? 'up' : 'down';

  const milaExpr: KExpr = ph === 'ask' ? 'happy' : ph === 'no' || (ph === 'lonely' && t < S(7) - 0.1) ? 'sad' : ph === 'party' ? 'laugh' : 'happy';
  const milaArm: KArm = ball.holder === 'mila' ? 'hold' : ph === 'party' ? 'up' : t >= S(16) - 0.1 ? 'wave' : t >= S(7) && t < E(7) ? 'point' : 'down';
  const boboExpr: KExpr = ph === 'no' || ph === 'lonely' ? 'sad' : ph === 'ask' ? 'happy' : 'laugh';
  const boboArm: CArm = ball.holder === 'bobo' ? 'hold' : ph === 'party' || (t >= S(9) && t < E(9) + 0.3) ? 'up' : ph === 'ask' ? 'clap' : 'down';

  const leoLegs = t >= SIT && t < S(8) - 0.2 ? 'sit' : 'stand';

  return (
    <>
      <KidsStage cam={cam}>
        <Meadow t={t} />
        <Kid spec={MILA} x={MILA_X} y={f} scale={KS} expr={milaExpr} look={ph === 'lonely' ? [0.8, 0.3] : t >= S(16) - 0.1 ? [0, 0] : [0.7, 0]}
          mouth={lipSync(VO, 'mila', t)} armL={t >= S(16) - 0.1 ? 'wave' : milaArm === 'hold' ? 'hold' : 'down'} armR={milaArm} hop={hopOf(0)} />
        <Critter spec={BOBO} x={BOBO_X} y={f} scale={BS} expr={boboExpr} look={[-0.7, 0]} mouth={lipSync(VO, 'bobo', t)}
          armL={boboArm} armR={boboArm === 'clap' ? 'clap' : boboArm} hop={hopOf(1.5) + (t >= S(9) && t < E(9) + 0.3 ? Math.abs(Math.sin((t - S(9)) * 9)) * 50 : 0)} />
        <Kid spec={LEO} x={LEO_X} y={f} scale={KS} expr={leoExpr} legs={leoLegs}
          look={ph === 'no' ? [-0.4, -0.5] : ph === 'alone' ? [0.4, 0.8] : ph === 'turns' && ball.holder !== 'leo' ? [0.6, 0] : [0, 0]}
          tilt={ph === 'no' ? -8 : 0} mouth={lipSync(VO, 'leo', t)} armL={leoArmL} armR={leoArmR} hop={hopOf(3)} />
        <g transform={`translate(${ball.p[0]},${ball.p[1]})`}>
          <Ball r={R} rot={ball.rot} />
        </g>
      </KidsStage>
      {/* the three steps, each held until the next */}
      <PopText t={t} at={S(7) + 0.9} until={E(9) + 0.2} text="1 · ASK" y={250} size={140} color="#ffca3a" />
      <PopText t={t} at={S(10) + 0.3} until={S(13) - 0.1} text="2 · TAKE TURNS" y={250} size={120} color="#4cc9f0" />
      <PopText t={t} at={S(13) + 0.3} until={S(14) - 0.1} text="3 · PLAY TOGETHER" y={250} size={110} color="#8ac926" />
      {/* recap list */}
      <PopText t={t} at={S(15)} until={S(16) - 0.1} text="1 · ASK" y={300} size={100} color="#ffca3a" />
      <PopText t={t} at={S(15) + 0.55} until={S(16) - 0.1} text="2 · TAKE TURNS" y={430} size={100} color="#4cc9f0" rot={2} />
      <PopText t={t} at={S(15) + 1.15} until={S(16) - 0.1} text="3 · PLAY TOGETHER" y={560} size={90} color="#8ac926" />
      <ThinkTimer t={t} from={THINK[0]} to={THINK[1]} label="THINK!" />
      <Confetti t={t} at={CONFETTI} y={700} />
      <KidsCaptions lines={VO} t={t} colors={CAPTION_COLORS} />
    </>
  );
}
