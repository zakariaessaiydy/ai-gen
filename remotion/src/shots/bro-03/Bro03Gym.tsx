// BRO THINKS HE'S HIM · EP 3 — "Bro tried to impress her at the gym"
// toon-shorts/bro/ep-03-gym. Every cue derives from the VO line times (S(i)/E(i)).
// One set (the gym): the clock plant · the 20lb bar · Jess lifts it one-handed · bro math → "first date".
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Toon, faceAt, type ArmPose } from '../../lib/toon/rig';
import { BRO, DEE, extra, SERIES, SPEAKER_COLORS } from '../../lib/toon/series/bro';
import { Barbell, Gym, SquatRack } from '../../lib/toon/sets';
import {
  BroMath,
  Cut,
  DialogueCaptions,
  Rays,
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
  id: 'Bro03Gym',
  durationInSeconds: 34.4,
  fps: 30,
  width: 1080,
  height: 1920,
};

// JESS — gym regular, unbothered, stronger than everyone. Episode extra.
const JESS = extra('jess', {
  skin: '#c68863',
  skinShade: '#a06a47',
  hair: 'bun',
  hairColor: '#3b2416',
  top: 'tank',
  topColor: '#ff5d8f',
  topShade: '#e04476',
  pants: '#2d3142',
  shoes: '#fbfaf6',
  shoeAccent: '#ff5d8f',
  lashes: true,
  bodyW: 0.92,
});
const COLORS = { ...SPEAKER_COLORS, jess: '#ff9ecb' };

// 0 looking at me · 1 the clock · 2 counting the seconds · 3 trust me · 4 lift two hundred ·
// 5 warming it up · 6 are you done · 7 just finished · 8 it's twenty · 9 I let her win ·
// 10 didn't even lift it · 11 warmed it / she lifted · 12 we lifted it together · 13 that's not— ·
// 14 first date · 15 I got this
const S = (i: number) => VO[i].start;
const E = (i: number) => VO[i].end;

const STRAIN: [number, number] = [E(4) + 0.2, S(5) - 0.15];
const JESS_IN: [number, number] = [E(5) + 0.05, S(6) - 0.1];
const LIFT: [number, number] = [E(7) + 0.15, E(7) + 0.75];
const JESS_OUT: [number, number] = [E(8) + 0.25, E(8) + 1.25];
const STARE = S(9) - 0.45;
const SIG = E(14) + 0.6;
const TOTAL = compositionConfig.durationInSeconds;

const BRO_AT = { x: 560, y: 1490 };
const DEE_AT = { x: 190, y: 1490, s: 0.95 };
const JESS_REST = 990; // background, by the dumbbells
const JESS_STOP = 840;
const HOOK_Y = BRO_AT.y - 402; // bar height = Bro's chest grip
const CLOCK: [number, number] = [800, 600];

const [bfx, bfy] = faceAt(BRO_AT.x, BRO_AT.y);

type F = { z: number; x: number; y: number; rot?: number };
const shot = (t1: number, t2: number, a: F, b: F = a): CamKey[] => [
  { t: t1, ...a, cut: true },
  { t: t2 - 0.01, ...b },
];
const WIDE: F = { z: 1, x: 540, y: 960 };
const TWO: F = { z: 1.12, x: 420, y: 1000 };
const MATH: F = { z: 1.2, x: bfx, y: bfy + 160 };

const CAM: CamKey[] = [
  ...shot(0, S(1) - 0.05, { z: 1.75, x: bfx, y: bfy + 70 }, { z: 1.84, x: bfx, y: bfy + 70 }),
  ...shot(S(1) - 0.05, S(2) - 0.05, WIDE),
  ...shot(S(2) - 0.05, S(3) - 0.1, { z: 1.45, x: bfx + 20, y: bfy + 200 }, { z: 1.5, x: bfx + 20, y: bfy + 200 }),
  ...shot(S(3) - 0.1, S(4) - 0.05, { z: 1.62, x: bfx, y: bfy + 170 }, { z: 1.7, x: bfx, y: bfy + 170 }),
  ...shot(S(4) - 0.05, STRAIN[0], { z: 1.2, x: 560, y: 1000 }),
  ...shot(STRAIN[0], S(5) - 0.15, { z: 1.35, x: 560, y: 980 }, { z: 1.5, x: 560, y: 960 }),
  ...shot(S(5) - 0.15, JESS_IN[0], { z: 1.75, x: bfx, y: bfy + 120 }),
  ...shot(JESS_IN[0], S(7) - 0.1, { z: 1.1, x: 600, y: 1000 }),
  ...shot(S(7) - 0.1, LIFT[0] - 0.05, { z: 1.45, x: bfx, y: bfy + 200 }, { z: 1.52, x: bfx, y: bfy + 200 }),
  ...shot(LIFT[0] - 0.05, STARE, { z: 1.08, x: 600, y: 980 }),
  ...shot(STARE, S(10) - 0.1, { z: 2.05, x: bfx, y: bfy + 70 }, { z: 2.2, x: bfx, y: bfy + 70 }),
  ...shot(S(10) - 0.1, S(11) - 0.1, TWO),
  ...shot(S(11) - 0.1, S(13) - 0.05, MATH, { ...MATH, z: 1.26 }),
  ...shot(S(13) - 0.05, S(14) - 0.02, TWO),
  ...shot(S(14) - 0.02, SIG, MATH, { ...MATH, z: 1.26 }),
  { t: SIG, z: 1.6, x: bfx, y: bfy + 160, cut: true },
  { t: SIG + 0.9, z: 1.85, x: bfx, y: bfy + 120 },
  { t: TOTAL, z: 1.95, x: bfx, y: bfy + 120 },
];

// both hands on the bar, shoulder-width-plus (IK targets relative to each shoulder)
const GRIP: ArmPose = { to: [-60, 188] };
const TEMPLE: ArmPose = { to: [-30, -245] };

const jessX = (t: number) =>
  t < JESS_IN[0] ? JESS_REST : t < JESS_OUT[0] ? JESS_REST + 140 + (JESS_STOP - JESS_REST - 140) * prog(t, JESS_IN[0], JESS_IN[1]) : JESS_STOP + 700 * prog(t, JESS_OUT[0], JESS_OUT[1]);

export default function Bro03Gym() {
  const t = useT();
  const cam = camAt(t, CAM);
  const straining = t >= STRAIN[0] && t < STRAIN[1];
  const shake = [
    shakeAt(t, S(3) - 0.1, 16),
    straining ? [Math.sin(t * 70) * 5, Math.cos(t * 57) * 4] as [number, number] : [0, 0] as [number, number],
    shakeAt(t, LIFT[1], 12),
    shakeAt(t, STARE, 10),
  ].reduce((a, b) => [a[0] + b[0], a[1] + b[1]] as [number, number], [0, 0] as [number, number]);

  // phases for Bro
  const gripping = t >= S(4) - 0.05 && t < S(7) - 0.1;
  const flex = t >= S(7) - 0.1 && t < LIFT[0];
  const shocked = t >= LIFT[0] && t < STARE;
  const stare = t >= STARE && t < S(10) - 0.1;
  const math = (t >= S(11) - 0.1 && t < S(13) - 0.05) || (t >= S(14) - 0.02 && t < SIG);
  const sig = t >= SIG;
  const broExpr = sig || stare ? 'deadpan' : straining ? 'annoyed' : shocked ? 'shock' : math ? 'smug' : t < S(3) - 0.1 ? 'smug' : 'confident';
  const broArmL: ArmPose = gripping ? GRIP : flex ? 'flex' : shocked ? 'shrug' : math ? TEMPLE : sig || stare ? 'cross' : 'hip';
  const broArmR: ArmPose = gripping ? GRIP : flex ? 'flex' : shocked ? 'shrug' : t >= S(3) - 0.1 && t < S(4) - 0.05 ? 'gun' : sig || stare ? 'cross' : 'hip';
  const broLook: [number, number] =
    t < S(1) - 0.05 ? [0.9, -0.2] : t < S(2) - 0.05 ? [0.9, -0.2] : straining ? [0, 0.9] : shocked ? [1, -0.4] : t >= S(10) - 0.1 && t < S(11) - 0.1 ? [-0.8, 0] : t >= S(13) - 0.05 && t < S(14) - 0.02 ? [-0.8, 0] : [0, 0];

  // the bar: on the hooks until Jess lifts it, then in her hand
  const barInHand = t >= LIFT[0];
  // arm out on the lift, back down (bar at her side) as she walks off
  const lp = EASE_INOUT(prog(t, LIFT[0], LIFT[1])) * (1 - EASE_INOUT(prog(t, JESS_OUT[0], JESS_OUT[0] + 0.35)));
  // she holds the bar straight out ONE-HANDED, right in front of his face (a lever no human
  // could hold — that's the joke), plates reading 10 / 10
  const jessArm: ArmPose = barInHand ? { a: 9 + 91 * lp, b: 5 - 1 * lp } : 'down';
  const jessWalking = (t >= JESS_IN[0] && t < JESS_IN[1]) || (t >= JESS_OUT[0] && t < JESS_OUT[1]);

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Stage cam={cam} shake={shake} filter={signatureFilter(t, SIG)}>
        <Gym clockAt={CLOCK} />
        <SquatRack x={BRO_AT.x} y={BRO_AT.y} hookY={HOOK_Y} />
        <Rays x={bfx} y={bfy + 60} t={t} from={S(7) - 0.1} to={LIFT[0]} />
        <Toon
          spec={DEE}
          x={DEE_AT.x}
          y={DEE_AT.y}
          scale={DEE_AT.s}
          expr={t >= S(14) - 0.02 ? 'side-eye' : 'annoyed'}
          look={[0.8, 0]}
          mouth={lipSync(VO, 'dee', t)}
          armL="cross"
          armR={t >= S(13) && t < E(13) + 0.1 ? 'point' : talking(VO, 'dee', t) ? 'shrug' : 'cross'}
        />
        <Toon
          spec={BRO}
          x={BRO_AT.x}
          y={BRO_AT.y}
          expr={broExpr}
          look={broLook}
          mouth={lipSync(VO, 'bro', t)}
          armL={broArmL}
          armR={broArmR}
          handL={math ? 'point' : undefined}
          squash={straining ? 0.35 + 0.25 * Math.sin(t * 40) : 0}
          tilt={straining ? Math.sin(t * 33) * 3 : flex ? -3 : math ? 4 : 0}
          sweat={straining || t >= S(5) - 0.15 && t < E(5) + 0.4 || shocked}
        />
        {!barInHand && <Barbell x={BRO_AT.x} y={HOOK_Y} w={560} label="10" />}
        <Toon
          spec={JESS}
          x={jessX(t)}
          y={1490}
          scale={0.95}
          expr={t >= S(8) - 0.2 ? 'side-eye' : 'neutral'}
          look={t < JESS_IN[0] ? [-0.4, -0.8] : [-0.9, 0]}
          mouth={lipSync(VO, 'jess', t)}
          legs={jessWalking ? 'walk' : 'stand'}
          walk={t * 1.8}
          armL={jessArm}
          handL="fist"
          holdL={barInHand ? <Barbell w={460} label="10" /> : undefined}
          armR={t < JESS_IN[0] ? 'hip' : barInHand ? 'hip' : 'down'}
        />
        <Sparkles x={bfx + 40} y={bfy - 20} t={t} at={S(3) + 0.5} spread={190} />
        <Sparkles x={bfx} y={bfy + 260} t={t} at={S(7) + 0.4} spread={150} />
        <BroMath
          x={bfx}
          y={bfy}
          t={t}
          to={S(13) - 0.05}
          size={36}
          lines={[
            { text: 'I WARMED IT UP', dx: -290, dy: -120, at: S(11) + 0.15, rot: -6 },
            { text: '+ SHE LIFTED IT', dx: 300, dy: -60, at: S(11) + 0.85, rot: 5 },
            { text: '= WE LIFTED IT', dx: 0, dy: 235, at: S(12) + 1.3, rot: -3, color: '#ffd23f' },
          ]}
        />
        <BroMath
          x={bfx}
          y={bfy}
          t={t}
          to={SIG}
          size={44}
          lines={[{ text: '= FIRST DATE', dx: 0, dy: 235, at: S(14) + 0.85, rot: -4, color: '#ff9ecb' }]}
        />
        <Sparkles x={bfx} y={bfy + 220} t={t} at={S(14) + 0.9} spread={200} color="#ffb3d1" />
      </Stage>
      <Cut from={0} to={SIG}>
        <TitleBar title="Bro tried to impress her at the gym" series={SERIES.name} ep={3} accent={SERIES.accent} />
      </Cut>
      <SignatureStamp at={SIG} stampAt={S(15) + 0.25} text="I GOT THIS." accent={SERIES.accent} />
      {t < SIG && <DialogueCaptions lines={VO} colors={COLORS} y={1385} />}
    </AbsoluteFill>
  );
}
