// BRO THINKS HE'S HIM · EP 10 — "Bro thought he could beat a pigeon"
// toon-shorts/bro/ep-10-pigeon. Every cue derives from the VO line times (S(i)/E(i)).
// Park bench: "my kingdom" · "pigeons respect alphas" · western standoff (Bro's eyes / the
// pigeon's eye) · he blinks · the pigeon takes the chips · "I let him have that." · it swoops
// back for the phone · "We're sharing." · SPLAT on the cap · "...It's a crown now."
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Toon, faceAt, type ArmPose, type Expr } from '../../lib/toon/rig';
import { BRO, DEE, SERIES, SPEAKER_COLORS } from '../../lib/toon/series/bro';
import { BENCH_SEAT_Y, Bench, ChipsBag, Park, Phone, Pigeon, Splat } from '../../lib/toon/sets';
import {
  Cut,
  DialogueCaptions,
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
import { EASE_INOUT, EASE_OUT, prog } from '../../lib/shorts';
import { VO } from './vo.gen';

export const compositionConfig = {
  id: 'Bro10Pigeon',
  durationInSeconds: 29.8,
  fps: 30,
  width: 1080,
  height: 1920,
};

// 0 my kingdom · 1 pigeon staring · 2 respect alphas · 3 trust me · 4 blink first, bird ·
// 5 took your chips · 6 I let him have that · 7 took your phone · 8 we're sharing ·
// 9 pooped on your hat · 10 it's a crown now · 11 I got this
const S = (i: number) => VO[i].start;
const E = (i: number) => VO[i].end;

const STAND0 = E(3) + 0.15;
const TEAR: [number, number] = [E(4) - 0.1, E(4) + 0.45];
const BLINK: [number, number] = [E(4) + 0.45, E(4) + 0.7];
const PIG_CU = E(4) + 0.6; // the pigeon's unblinking eye
const WIDE_STEAL = E(4) + 1.0;
const HOP: [number, number] = [E(4) + 1.1, E(4) + 1.5];
const GRAB = E(4) + 1.7;
const FLY1: [number, number] = [E(4) + 1.9, E(4) + 2.7];
const STARE: [number, number] = [S(6) - 0.45, E(6) + 0.3];
const SWOOP: [number, number] = [E(6) + 0.3, E(6) + 1.35];
const SNATCH = E(6) + 0.8;
const FLYOVER: [number, number] = [E(8) + 0.3, E(8) + 1.4];
const DROP: [number, number] = [E(8) + 0.65, E(8) + 0.9];
const SIG = E(10) + 0.6;
const TOTAL = compositionConfig.durationInSeconds;

const BRO_AT = { x: 500, y: 1500 };
const DEE_AT = { x: 150, y: 1530, s: 0.95 };
const BENCH_X = 520;
const CHIPS_AT = { x: 720, y: BENCH_SEAT_Y };
const PIG_GROUND = { x: 900, y: 1600, s: 1.1 };
const PIG_BENCH = { x: 800, y: BENCH_SEAT_Y };

const [bfx, bfy] = faceAt(BRO_AT.x, BRO_AT.y, 1, 'sit');
const PIG_EYE = { x: PIG_GROUND.x - 50 * PIG_GROUND.s, y: PIG_GROUND.y - 136 * PIG_GROUND.s };
const HAND_R = { x: BRO_AT.x, y: BRO_AT.y - 402 + 72 }; // 'hold' hand while sitting
const CAP_TOP = { x: bfx - 20, y: bfy - 190 };

type F = { z: number; x: number; y: number; rot?: number };
const shot = (t1: number, t2: number, a: F, b: F = a): CamKey[] => [
  { t: t1, ...a, cut: true },
  { t: t2 - 0.01, ...b },
];
const WIDE: F = { z: 1, x: 540, y: 960 };
const EYES = (z: number): F => ({ z, x: bfx, y: bfy - 8 });
const PIG = (z: number, rot = 0): F => ({ z, x: PIG_EYE.x, y: PIG_EYE.y, rot });

const CAM: CamKey[] = [
  ...shot(0, S(1) - 0.05, { z: 1.75, x: bfx, y: bfy + 70 }, { z: 1.84, x: bfx, y: bfy + 70 }),
  ...shot(S(1) - 0.05, S(2) - 0.05, WIDE),
  ...shot(S(2) - 0.05, S(3) - 0.1, { z: 1.45, x: bfx + 20, y: bfy + 200 }, { z: 1.5, x: bfx + 20, y: bfy + 200 }),
  ...shot(S(3) - 0.1, STAND0, { z: 1.62, x: bfx, y: bfy + 170 }, { z: 1.7, x: bfx, y: bfy + 170 }),
  // the standoff — tighter every cut
  ...shot(STAND0, STAND0 + 0.5, EYES(3.0), EYES(3.1)),
  ...shot(STAND0 + 0.5, STAND0 + 1.0, PIG(6.0), PIG(6.3)),
  ...shot(STAND0 + 1.0, STAND0 + 1.5, EYES(3.5), EYES(3.6)),
  ...shot(STAND0 + 1.5, S(4) - 0.2, PIG(8.0, -4), PIG(8.4, -5)),
  ...shot(S(4) - 0.2, PIG_CU, EYES(4.0), EYES(4.3)),
  ...shot(PIG_CU, WIDE_STEAL, PIG(10.0), PIG(10.5)),
  ...shot(WIDE_STEAL, S(5) - 0.1, { z: 1.05, x: 600, y: 1100 }),
  ...shot(S(5) - 0.1, STARE[0], WIDE),
  ...shot(STARE[0], STARE[1], { z: 2.05, x: bfx, y: bfy + 70 }, { z: 2.2, x: bfx, y: bfy + 70 }),
  ...shot(SWOOP[0], S(7) - 0.05, { z: 1.12, x: 560, y: 1080 }),
  ...shot(S(7) - 0.05, S(8) - 0.1, WIDE),
  ...shot(S(8) - 0.1, FLYOVER[0], { z: 1.75, x: bfx, y: bfy + 90 }),
  ...shot(FLYOVER[0], S(9) - 0.05, { z: 1.1, x: 540, y: 980 }),
  ...shot(S(9) - 0.05, S(10) - 0.2, WIDE),
  ...shot(S(10) - 0.2, SIG, { z: 1.8, x: bfx, y: bfy + 40 }, { z: 1.92, x: bfx, y: bfy + 40 }),
  { t: SIG, z: 1.6, x: bfx, y: bfy + 120, cut: true },
  { t: SIG + 0.9, z: 1.85, x: bfx, y: bfy + 80 },
  { t: TOTAL, z: 1.95, x: bfx, y: bfy + 80 },
];

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

// where the pigeon is, how it moves, what it carries
const pigeonState = (t: number) => {
  if (t < HOP[0]) return { x: PIG_GROUND.x, y: PIG_GROUND.y, s: PIG_GROUND.s, flap: false, facing: -1 as const, carry: null as null | 'chips' | 'phone' };
  if (t < HOP[1]) {
    const p = EASE_INOUT(prog(t, HOP[0], HOP[1]));
    return { x: lerp(PIG_GROUND.x, PIG_BENCH.x, p), y: lerp(PIG_GROUND.y, PIG_BENCH.y, p) - Math.sin(p * Math.PI) * 140, s: PIG_GROUND.s, flap: true, facing: -1 as const, carry: null };
  }
  if (t < FLY1[0]) return { x: PIG_BENCH.x, y: PIG_BENCH.y, s: PIG_GROUND.s, flap: false, facing: -1 as const, carry: t >= GRAB ? ('chips' as const) : null };
  if (t < FLY1[1]) {
    const p = EASE_INOUT(prog(t, FLY1[0], FLY1[1]));
    return { x: lerp(PIG_BENCH.x, 1350, p), y: lerp(PIG_BENCH.y, 500, p), s: PIG_GROUND.s, flap: true, facing: 1 as const, carry: 'chips' as const };
  }
  if (t >= SWOOP[0] && t < SWOOP[1]) {
    const into = prog(t, SWOOP[0], SNATCH);
    const out = prog(t, SNATCH, SWOOP[1]);
    const x = t < SNATCH ? lerp(1350, HAND_R.x + 60, EASE_OUT(into)) : lerp(HAND_R.x + 60, -300, out);
    const y = t < SNATCH ? lerp(500, HAND_R.y + 40, EASE_OUT(into)) : lerp(HAND_R.y + 40, 450, out);
    return { x, y, s: 1.0, flap: true, facing: -1 as const, carry: t >= SNATCH ? ('phone' as const) : null };
  }
  if (t >= FLYOVER[0] && t < FLYOVER[1]) {
    const p = prog(t, FLYOVER[0], FLYOVER[1]);
    return { x: lerp(-250, 1350, p), y: 430 + Math.sin(p * Math.PI) * -40, s: 0.9, flap: true, facing: 1 as const, carry: null };
  }
  return null;
};

export default function Bro10Pigeon() {
  const t = useT();
  const cam = camAt(t, CAM);
  const shake = [shakeAt(t, S(3) - 0.1, 16), shakeAt(t, DROP[1], 14), shakeAt(t, STARE[0], 10)].reduce(
    (a, b) => [a[0] + b[0], a[1] + b[1]] as [number, number],
    [0, 0] as [number, number],
  );
  const pg = pigeonState(t);
  const standoff = t >= STAND0 && t < WIDE_STEAL;
  const blinking = t >= BLINK[0] && t < BLINK[1];
  const holdingPhone = t >= E(6) + 0.2 && t < SNATCH;
  const splatOn = t >= DROP[1];

  const bp =
    t < S(1) - 0.05 ? 'kingdom'
    : t < S(2) - 0.05 ? 'pigeon'
    : t < S(3) - 0.1 ? 'alphas'
    : t < STAND0 ? 'catch'
    : standoff ? 'standoff'
    : t < S(5) - 0.1 ? 'steal'
    : t < STARE[0] ? 'chips'
    : t < STARE[1] ? 'stare'
    : t < S(7) - 0.05 ? 'swoop'
    : t < FLYOVER[0] ? 'sharing'
    : t < S(10) - 0.2 ? 'poop'
    : t < SIG ? 'crown'
    : 'sig';
  const broExpr: Expr =
    blinking ? 'sleep'
    : bp === 'standoff' ? 'annoyed'
    : bp === 'steal' || bp === 'swoop' ? 'shock'
    : bp === 'stare' || bp === 'crown' || bp === 'sig' ? 'deadpan'
    : bp === 'poop' ? 'shock'
    : bp === 'catch' ? 'confident'
    : 'smug';
  const broArmR: ArmPose = holdingPhone ? 'hold' : bp === 'kingdom' ? 'present' : bp === 'alphas' || bp === 'catch' ? 'gun' : bp === 'stare' || bp === 'crown' || bp === 'sig' ? 'cross' : bp === 'swoop' || bp === 'steal' ? 'shrug' : 'hip';
  const broArmL: ArmPose = bp === 'stare' || bp === 'crown' || bp === 'sig' ? 'cross' : bp === 'swoop' || bp === 'steal' ? 'shrug' : 'hip';
  const broLook: [number, number] =
    bp === 'standoff' ? [0.9, 0.3] : bp === 'pigeon' ? [0.9, 0.4] : bp === 'steal' ? [0.8, -0.3] : bp === 'swoop' ? [-0.8, -0.4] : bp === 'chips' || bp === 'sharing' ? [-0.8, 0] : [0, 0];

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Stage cam={cam} shake={shake} filter={signatureFilter(t, SIG)}>
        <Park />
        <Bench x={BENCH_X} part="back" />
        <Toon
          spec={DEE}
          x={DEE_AT.x}
          y={DEE_AT.y}
          scale={DEE_AT.s}
          expr={bp === 'crown' ? 'side-eye' : 'annoyed'}
          look={bp === 'pigeon' ? [0.9, 0.4] : [0.8, 0]}
          mouth={lipSync(VO, 'dee', t)}
          armL="cross"
          armR={talking(VO, 'dee', t) ? (bp === 'poop' ? 'point-up' : 'point') : 'cross'}
        />
        <Toon
          spec={BRO}
          x={BRO_AT.x}
          y={BRO_AT.y}
          legs="sit"
          expr={broExpr}
          look={broLook}
          mouth={lipSync(VO, 'bro', t)}
          armL={broArmL}
          armR={broArmR}
          holdR={holdingPhone ? <Phone lines={['BRO', ':)']} scale={0.8} /> : undefined}
          sweat={bp === 'standoff' && t > STAND0 + 1.0}
          blink={!standoff}
        />
        <Bench x={BENCH_X} part="seat" />
        {t < GRAB && <ChipsBag x={CHIPS_AT.x} y={CHIPS_AT.y} scale={0.85} />}
        {/* the tear before the blink */}
        {t >= TEAR[0] && t < TEAR[1] && (
          <path
            d="M 0,-14 Q 9,0 0,9 Q -9,0 0,-14 Z"
            fill="#8fd3ff"
            stroke="#22160f"
            strokeWidth={2}
            transform={`translate(${bfx + 62},${bfy + 20 + 70 * prog(t, TEAR[0], TEAR[1])})`}
          />
        )}
        {pg && (
          <Pigeon
            x={pg.x}
            y={pg.y}
            t={t}
            scale={pg.s}
            facing={pg.facing}
            flap={pg.flap}
            bob={!standoff}
            carry={pg.carry === 'chips' ? <ChipsBag scale={0.45} y={60} /> : pg.carry === 'phone' ? <Phone lines={['BRO', ':(']} scale={0.55} /> : undefined}
          />
        )}
        {/* the drop, then the "crown" */}
        {t >= DROP[0] && t < DROP[1] && (
          <circle cx={lerp(560, CAP_TOP.x, prog(t, DROP[0], DROP[1]))} cy={lerp(450, CAP_TOP.y, prog(t, DROP[0], DROP[1]))} r={14} fill="#ffffff" stroke="#22160f" strokeWidth={4} />
        )}
        {splatOn && <Splat x={CAP_TOP.x} y={CAP_TOP.y} scale={1.1} />}
        <Sparkles x={CAP_TOP.x} y={CAP_TOP.y - 20} t={t} at={S(10) + 0.4} spread={110} color="#ffd23f" />
        <Sparkles x={bfx + 40} y={bfy - 20} t={t} at={S(3) + 0.5} spread={180} />
      </Stage>
      <Cut from={0} to={SIG}>
        <TitleBar title="Bro thought he could beat a pigeon" series={SERIES.name} ep={10} accent={SERIES.accent} />
      </Cut>
      <SignatureStamp at={SIG} stampAt={S(11) + 0.25} text="I GOT THIS." accent={SERIES.accent} />
      {t < SIG && <DialogueCaptions lines={VO} colors={SPEAKER_COLORS} y={1385} />}
    </AbsoluteFill>
  );
}
