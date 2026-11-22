// BRO THINKS HE'S HIM · EP 11 — "Bro became a fitness coach"
// toon-shorts/bro/ep-11-coach. Every cue derives from the VO line times (S(i)/E(i)).
// Gym: "$50 a session" · "I save my energy for my clients" · Dee's twenty in a dust cloud ·
// "Coaches inspire" · Bro's ONE push-up: plank, sink, shake, collapse, REPS -1 ·
// "...Advanced technique." · bro math (team average 10) · "Price went up."
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Toon, faceAt, type ArmPose, type Expr } from '../../lib/toon/rig';
import { BRO, DEE, SERIES, SPEAKER_COLORS } from '../../lib/toon/series/bro';
import { Clipboard, Gym } from '../../lib/toon/sets';
import {
  BroMath,
  Cut,
  DialogueCaptions,
  DustCloud,
  RepCounter,
  SignatureStamp,
  Sparkles,
  Stage,
  TitleBar,
  camAt,
  lipSync,
  shakeAt,
  signatureFilter,
  talking,
  useT,
  type CamKey,
} from '../../lib/toon/comedy';
import { EASE_INOUT, prog } from '../../lib/shorts';
import { VO } from './vo.gen';

export const compositionConfig = {
  id: 'Bro11Coach',
  durationInSeconds: 36.6,
  fps: 30,
  width: 1080,
  height: 1920,
};

// 0 bro fitness $50 · 1 don't work out · 2 save my energy · 3 trust me · 4 drop and give me twenty ·
// 5 done, now you · 6 coaches inspire · 7 one push-up · 8 advanced technique · 9 paid $50 ·
// 10 team average · 11 price went up · 12 I got this
const S = (i: number) => VO[i].start;
const E = (i: number) => VO[i].end;

const DUST: [number, number] = [E(4) + 0.1, S(5) - 0.2];
const A0 = E(7) + 0.2; // the attempt
const COLLAPSE = A0 + 2.0;
const STARE: [number, number] = [S(8) - 0.45, E(8) + 0.4];
const SIG = E(11) + 0.6;
const TOTAL = compositionConfig.durationInSeconds;

const BRO_AT = { x: 600, y: 1490 };
const DEE_AT = { x: 230, y: 1500, s: 0.95 };
const LIE = { x: 130, s: 0.9 }; // feet of the face-down Bro (lean +90: head to the RIGHT)
const FLOOR_HAND = 1700;
const PLANK_Y = 1313;
const FLAT_Y = 1600;

const [bfx, bfy] = faceAt(BRO_AT.x, BRO_AT.y);
const LIE_HEAD_X = LIE.x + 790 * LIE.s;

type F = { z: number; x: number; y: number; rot?: number };
const shot = (t1: number, t2: number, a: F, b: F = a): CamKey[] => [
  { t: t1, ...a, cut: true },
  { t: t2 - 0.01, ...b },
];
const WIDE: F = { z: 1, x: 540, y: 960 };
const MATH: F = { z: 1.15, x: bfx + 60, y: bfy + 40 };

const CAM: CamKey[] = [
  ...shot(0, S(1) - 0.05, { z: 1.75, x: bfx, y: bfy + 70 }, { z: 1.84, x: bfx, y: bfy + 70 }),
  ...shot(S(1) - 0.05, S(2) - 0.05, WIDE),
  ...shot(S(2) - 0.05, S(3) - 0.1, { z: 1.45, x: bfx + 20, y: bfy + 200 }, { z: 1.5, x: bfx + 20, y: bfy + 200 }),
  ...shot(S(3) - 0.1, S(4) - 0.05, { z: 1.62, x: bfx, y: bfy + 170 }, { z: 1.7, x: bfx, y: bfy + 170 }),
  ...shot(S(4) - 0.05, DUST[0], { z: 1.2, x: 480, y: 1000 }),
  ...shot(DUST[0], S(5) - 0.1, { z: 1.15, x: 400, y: 1050 }),
  ...shot(S(5) - 0.1, S(6) - 0.05, WIDE),
  ...shot(S(6) - 0.05, S(7) - 0.05, { z: 1.75, x: bfx, y: bfy + 90 }),
  ...shot(S(7) - 0.05, A0, WIDE),
  ...shot(A0, STARE[0], { z: 1.12, x: 540, y: 1300 }, { z: 1.2, x: 560, y: 1330 }),
  ...shot(STARE[0], STARE[1], { z: 1.7, x: LIE_HEAD_X - 60, y: FLAT_Y + 50 }, { z: 1.8, x: LIE_HEAD_X - 60, y: FLAT_Y + 50 }),
  ...shot(STARE[1], S(10) - 0.1, WIDE),
  ...shot(S(10) - 0.1, S(11) - 0.1, MATH, { ...MATH, z: 1.2 }),
  ...shot(S(11) - 0.1, SIG, { z: 1.4, x: bfx, y: bfy + 230 }, { z: 1.42, x: bfx, y: bfy + 235 }),
  { t: SIG, z: 1.6, x: bfx, y: bfy + 160, cut: true },
  { t: SIG + 0.9, z: 1.85, x: bfx, y: bfy + 120 },
  { t: TOTAL, z: 1.95, x: bfx, y: bfy + 120 },
];

// body height during the push-up attempt: plank → sink → struggle → splat
const bodyY = (t: number) => {
  if (t < A0 + 0.5) return PLANK_Y + Math.sin(t * 40) * 4;
  if (t < A0 + 1.1) return PLANK_Y + (1470 - PLANK_Y) * EASE_INOUT(prog(t, A0 + 0.5, A0 + 1.1));
  if (t < COLLAPSE) return 1470 + Math.sin(t * 45) * 12;
  return 1470 + (FLAT_Y - 1470) * Math.min(1, prog(t, COLLAPSE, COLLAPSE + 0.12));
};

export default function Bro11Coach() {
  const t = useT();
  const cam = camAt(t, CAM);
  const shake = [shakeAt(t, S(3) - 0.1, 16), shakeAt(t, COLLAPSE + 0.1, 18), shakeAt(t, STARE[0], 8)].reduce(
    (a, b) => [a[0] + b[0], a[1] + b[1]] as [number, number],
    [0, 0] as [number, number],
  );
  const inDust = t >= DUST[0] && t < DUST[1];
  const lying = t >= A0 && t < STARE[1];
  const reps = Math.round(1 + 19 * prog(t, DUST[0] + 0.1, DUST[1] - 0.3));

  const bp =
    t < S(1) - 0.05 ? 'welcome'
    : t < S(2) - 0.05 ? 'nowork'
    : t < S(3) - 0.1 ? 'energy'
    : t < S(4) - 0.05 ? 'catch'
    : t < S(5) - 0.1 ? 'drop'
    : t < S(6) - 0.05 ? 'done'
    : t < S(7) - 0.05 ? 'inspire'
    : t < A0 ? 'one'
    : t < STARE[1] ? 'lying'
    : t < S(10) - 0.1 ? 'paid'
    : t < S(11) - 0.1 ? 'math'
    : t < SIG ? 'price'
    : 'sig';
  const holdsBoard = bp === 'welcome' || bp === 'nowork' || bp === 'energy' || bp === 'price';
  const broExpr: Expr = bp === 'sig' ? 'deadpan' : bp === 'done' || bp === 'one' ? 'shock' : bp === 'catch' || bp === 'drop' ? 'confident' : bp === 'paid' ? 'neutral' : 'smug';
  const broArmR: ArmPose = holdsBoard ? 'hold' : bp === 'catch' ? 'gun' : bp === 'drop' ? { a: 35, b: 0 } : bp === 'inspire' ? 'present' : bp === 'math' ? 'hip' : bp === 'sig' ? 'cross' : 'hip';
  const broArmL: ArmPose = bp === 'math' ? { to: [-30, -245] } : bp === 'energy' ? 'thumb' : bp === 'sig' ? 'cross' : 'hip';

  // the push-up body + its IK arm (hand planted on the floor)
  const by = bodyY(t);
  const D = FLOOR_HAND - (by + 104); // shoulder → floor, world px
  const plantArm: ArmPose = t >= COLLAPSE ? 'shrug' : { to: [-Math.max(60, D) / LIE.s, 0] };
  // the far arm (top side of the rotated body) reaches across the torso to the same floor
  const farArm: ArmPose = t >= COLLAPSE ? 'down' : { to: [Math.max(60, D) / LIE.s + 216, 20] };
  const lieExpr: Expr = t >= STARE[0] ? 'deadpan' : t >= COLLAPSE ? 'shock' : t >= A0 + 0.5 ? 'annoyed' : 'confident';

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Stage cam={cam} shake={shake} filter={signatureFilter(t, SIG)}>
        <Gym clockAt={[800, 600]} poster="NO PAIN NO GAIN" />
        {!inDust && (
          <Toon
            spec={DEE}
            x={DEE_AT.x}
            y={DEE_AT.y}
            scale={DEE_AT.s}
            expr={bp === 'done' ? 'happy' : bp === 'lying' ? 'side-eye' : 'annoyed'}
            look={bp === 'lying' ? [0.8, 0.6] : [0.8, 0]}
            mouth={lipSync(VO, 'dee', t)}
            armL="cross"
            armR={bp === 'done' ? 'point' : talking(VO, 'dee', t) ? 'shrug' : 'cross'}
          />
        )}
        <DustCloud x={DEE_AT.x + 40} y={1360} t={t} from={DUST[0]} to={DUST[1]} />
        {!lying ? (
          <Toon
            spec={BRO}
            x={BRO_AT.x}
            y={BRO_AT.y}
            expr={broExpr}
            look={bp === 'nowork' || bp === 'done' || bp === 'one' || bp === 'paid' ? [-0.9, 0] : bp === 'drop' ? [-0.5, 0.6] : [0, 0]}
            mouth={lipSync(VO, 'bro', t)}
            armL={broArmL}
            armR={broArmR}
            holdR={holdsBoard ? <Clipboard lines={bp === 'price' ? ['PLAN:', 'PUSH-UPS', '$100'] : undefined} /> : undefined}
            handL={bp === 'math' ? 'point' : undefined}
            tilt={bp === 'energy' ? 5 : bp === 'math' ? 4 : 0}
            sweat={bp === 'one'}
          />
        ) : (
          <Toon
            spec={BRO}
            x={LIE.x}
            y={by}
            scale={LIE.s}
            lean={90}
            shadow={false}
            expr={lieExpr}
            look={t >= STARE[0] ? [0, 0] : [0, 0.6]}
            mouth={lipSync(VO, 'bro', t)}
            armR={plantArm}
            armL={farArm}
            sweat={t >= A0 + 0.5 && t < STARE[0]}
            squash={t >= COLLAPSE && t < COLLAPSE + 0.3 ? 0.4 : 0}
          />
        )}
        <BroMath
          x={bfx}
          y={bfy}
          t={t}
          to={S(11) - 0.1}
          size={58}
          lines={[
            { text: '20 + 0', dx: -170, dy: -340, at: S(10) + 0.2, rot: -6 },
            { text: '÷ 2', dx: 250, dy: -300, at: S(10) + 1.4, rot: 5 },
            { text: '= 10 AVG', dx: 280, dy: -110, at: S(10) + 2.3, rot: 4 },
            { text: 'GREAT COACH', dx: 0, dy: 240, at: S(10) + 3.4, rot: -3, color: '#ffd23f' },
          ]}
        />
        <Sparkles x={bfx} y={bfy + 240} t={t} at={S(10) + 3.4} spread={170} />
        <Sparkles x={bfx + 40} y={bfy - 20} t={t} at={S(3) + 0.5} spread={190} />
      </Stage>
      <RepCounter from={DUST[0]} to={S(6) - 0.05} value={Math.min(20, reps)} />
      <RepCounter from={A0 + 0.3} to={STARE[1]} value={t >= COLLAPSE + 0.35 ? -1 : 0} color={t >= COLLAPSE + 0.35 ? '#ff3b30' : '#adb5bd'} />
      <Cut from={0} to={SIG}>
        <TitleBar title="Bro became a fitness coach" series={SERIES.name} ep={11} accent={SERIES.accent} />
      </Cut>
      <SignatureStamp at={SIG} stampAt={S(12) + 0.25} text="I GOT THIS." accent={SERIES.accent} />
      {t < SIG && <DialogueCaptions lines={VO} colors={SPEAKER_COLORS} y={t >= STARE[0] && t < STARE[1] ? 720 : 1385} />}
    </AbsoluteFill>
  );
}
