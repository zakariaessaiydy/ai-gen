// BRO THINKS HE'S HIM · EP 5 — "Bro started his own crypto coin"
// toon-shorts/bro/ep-05-crypto. Every cue derives from the VO line times (S(i)/E(i)).
// Room + desk + laptop chart: to the moon · "...Me. And my mom." · -99.9% · "It's resting." ·
// the chart spills out of the laptop onto the floor · "Buy the dip." · MOM sold · bro math · tag.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Toon, faceAt, type ArmPose } from '../../lib/toon/rig';
import { BRO, DEE, SERIES, SPEAKER_COLORS } from '../../lib/toon/series/bro';
import { Desk, Laptop, Room } from '../../lib/toon/sets';
import {
  BroMath,
  Cut,
  DialogueCaptions,
  Notification,
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
import { VO } from './vo.gen';

export const compositionConfig = {
  id: 'Bro05Crypto',
  durationInSeconds: 34.7,
  fps: 30,
  width: 1080,
  height: 1920,
};

// 0 made my own coin · 1 don't know what crypto is · 2 nobody does · 3 trust me · 4 to the moon ·
// 5 who bought it · 6 ...Me. · 7 and my mom · 8 it crashed · 9 it's resting · 10 buy the dip ·
// 11 never a real investor · 12 own 100% · 13 of nothing · 14 exclusive community · 15 I got this
const S = (i: number) => VO[i].start;
const E = (i: number) => VO[i].end;

const RISE: [number, number] = [S(4), S(4) + 1.4];
const BUZZ1: [number, number] = [E(7) + 0.3, E(9) + 0.1];
const PLUNGE: [number, number] = [E(9) + 0.4, E(9) + 0.9];
const SPILL: [number, number] = [E(9) + 0.95, E(9) + 2.3];
const STARE: [number, number] = [S(10) - 0.45, E(10) + 0.4];
const BUZZ2: [number, number] = [E(10) + 0.4, E(11) + 0.3];
const SIG = E(14) + 0.6;
const TOTAL = compositionConfig.durationInSeconds;

const BRO_AT = { x: 420, y: 1490 };
const DEE_AT = { x: 170, y: 1490, s: 0.95 };
const DESK = { x: 790, y: 1480 };
const LAPTOP = { x: 790, y: DESK.y - 280 };

const [bfx, bfy] = faceAt(BRO_AT.x, BRO_AT.y);

type F = { z: number; x: number; y: number; rot?: number };
const shot = (t1: number, t2: number, a: F, b: F = a): CamKey[] => [
  { t: t1, ...a, cut: true },
  { t: t2 - 0.01, ...b },
];
const WIDE: F = { z: 1, x: 540, y: 960 };
const SCREEN: F = { z: 2.6, x: LAPTOP.x, y: LAPTOP.y - 140 };
const MATH: F = { z: 1.2, x: bfx, y: bfy + 160 };

const CAM: CamKey[] = [
  ...shot(0, S(1) - 0.05, { z: 1.75, x: bfx, y: bfy + 70 }, { z: 1.84, x: bfx, y: bfy + 70 }),
  ...shot(S(1) - 0.05, S(2) - 0.05, WIDE),
  ...shot(S(2) - 0.05, S(3) - 0.1, { z: 1.45, x: bfx + 30, y: bfy + 200 }, { z: 1.5, x: bfx + 30, y: bfy + 200 }),
  ...shot(S(3) - 0.1, S(4) - 0.1, { z: 1.62, x: bfx, y: bfy + 170 }, { z: 1.7, x: bfx, y: bfy + 170 }),
  ...shot(S(4) - 0.1, S(5) - 0.1, SCREEN, { ...SCREEN, z: 2.75 }),
  ...shot(S(5) - 0.1, S(6) - 0.35, WIDE),
  ...shot(S(6) - 0.35, BUZZ1[0], { z: 1.75, x: bfx, y: bfy + 90 }, { z: 1.84, x: bfx, y: bfy + 90 }),
  ...shot(BUZZ1[0], S(9) - 0.1, WIDE, { z: 1.05, x: 540, y: 960 }),
  ...shot(S(9) - 0.1, PLUNGE[0] - 0.2, { z: 1.5, x: bfx, y: bfy + 200 }),
  ...shot(PLUNGE[0] - 0.2, SPILL[0], SCREEN),
  ...shot(SPILL[0], STARE[0], { z: 1.3, x: 760, y: 1250 }, { z: 1.36, x: 760, y: 1270 }),
  ...shot(STARE[0], STARE[1], { z: 2.05, x: bfx, y: bfy + 70 }, { z: 2.2, x: bfx, y: bfy + 70 }),
  ...shot(STARE[1], S(12) - 0.2, { z: 1.5, x: bfx, y: bfy + 200 }),
  ...shot(S(12) - 0.2, S(13) - 0.05, MATH, { ...MATH, z: 1.26 }),
  ...shot(S(13) - 0.05, S(14) - 0.2, WIDE),
  ...shot(S(14) - 0.2, SIG, { z: 1.6, x: bfx, y: bfy + 120 }, { z: 1.7, x: bfx, y: bfy + 120 }),
  { t: SIG, z: 1.6, x: bfx, y: bfy + 160, cut: true },
  { t: SIG + 0.9, z: 1.85, x: bfx, y: bfy + 120 },
  { t: TOTAL, z: 1.95, x: bfx, y: bfy + 120 },
];

const TEMPLE: ArmPose = { to: [-30, -245] };

export default function Bro05Crypto() {
  const t = useT();
  const cam = camAt(t, CAM);
  const shake = [shakeAt(t, S(3) - 0.1, 16), shakeAt(t, PLUNGE[0], 12), shakeAt(t, STARE[0], 10)].reduce(
    (a, b) => [a[0] + b[0], a[1] + b[1]] as [number, number],
    [0, 0] as [number, number],
  );

  const phase =
    t < S(1) - 0.05 ? 'claim'
    : t < S(2) - 0.05 ? 'nojob'
    : t < S(3) - 0.1 ? 'nobody'
    : t < S(5) - 0.1 ? 'catch'
    : t < S(6) - 0.35 ? 'who'
    : t < BUZZ1[0] ? 'me'
    : t < S(9) - 0.1 ? 'buzz'
    : t < STARE[0] ? 'resting'
    : t < STARE[1] ? 'stare'
    : t < S(12) - 0.2 ? 'mom'
    : t < S(13) - 0.05 ? 'math'
    : t < S(14) - 0.2 ? 'nothing'
    : t < SIG ? 'tag'
    : 'sig';
  const broExpr =
    phase === 'stare' || phase === 'sig' ? 'deadpan'
    : phase === 'buzz' ? 'shock'
    : phase === 'mom' ? 'side-eye'
    : phase === 'claim' || phase === 'nojob' || phase === 'math' || phase === 'tag' || phase === 'resting' ? 'smug'
    : phase === 'nothing' ? 'neutral'
    : 'confident';
  const broArmR: ArmPose =
    phase === 'nobody' || phase === 'catch' ? 'gun' : phase === 'me' ? 'thumb' : phase === 'resting' ? 'shrug' : phase === 'stare' || phase === 'mom' || phase === 'sig' ? 'cross' : phase === 'tag' ? 'present' : 'hip';
  const broArmL: ArmPose =
    phase === 'math' ? TEMPLE : phase === 'resting' ? 'shrug' : phase === 'stare' || phase === 'mom' || phase === 'sig' ? 'cross' : 'hip';
  const broLook: [number, number] =
    phase === 'nojob' || phase === 'who' || phase === 'nothing' ? [-0.9, 0] : phase === 'buzz' ? [0.9, 0.3] : phase === 'resting' ? [-0.7, 0] : phase === 'mom' ? [0.7, -0.2] : [0, 0];

  const crashed = t >= PLUNGE[0];
  // during the laptop inserts his arms stay home (a reaching arm would cross the screen)
  const insert = (t >= S(4) - 0.1 && t < S(5) - 0.1) || (t >= PLUNGE[0] - 0.2 && t < STARE[0]);

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Stage cam={cam} shake={shake} filter={signatureFilter(t, SIG)}>
        <Room poster="HODL" />
        <Desk x={DESK.x} y={DESK.y} w={480} />
        <Laptop
          x={LAPTOP.x}
          y={LAPTOP.y}
          t={t}
          rise={RISE}
          crash={PLUNGE}
          spill={SPILL}
          price={crashed ? '$0.0001' : '$1.00'}
          priceColor={crashed ? '#ff3b30' : '#2dc653'}
          moon
        />
        <Rays x={bfx} y={bfy + 60} t={t} from={S(14) - 0.2} to={SIG} color="#fff3b0" />
        <Toon
          spec={DEE}
          x={DEE_AT.x}
          y={DEE_AT.y}
          scale={DEE_AT.s}
          expr={phase === 'buzz' ? 'shock' : phase === 'me' || phase === 'tag' ? 'side-eye' : 'annoyed'}
          look={phase === 'buzz' ? [0.9, 0.2] : [0.8, 0]}
          mouth={lipSync(VO, 'dee', t)}
          armL="cross"
          armR={phase === 'buzz' ? 'point' : talking(VO, 'dee', t) ? 'shrug' : 'cross'}
          sweat={phase === 'buzz'}
        />
        <Toon
          spec={BRO}
          x={BRO_AT.x}
          y={BRO_AT.y}
          expr={broExpr}
          look={broLook}
          mouth={lipSync(VO, 'bro', t)}
          armL={insert ? 'down' : broArmL}
          armR={insert ? 'down' : broArmR}
          handL={phase === 'math' ? 'point' : undefined}
          sweat={phase === 'buzz'}
          tilt={phase === 'mom' ? 7 : phase === 'math' ? 4 : phase === 'nobody' ? 5 : 0}
        />
        <Sparkles x={bfx + 40} y={bfy - 20} t={t} at={S(3) + 0.5} spread={190} />
        <BroMath
          x={bfx}
          y={bfy}
          t={t}
          to={S(13) - 0.05}
          size={38}
          lines={[
            { text: 'MOM: SOLD', dx: -250, dy: -130, at: S(12) + 0.2, rot: -6 },
            { text: 'ME: 100%', dx: 290, dy: -60, at: S(12) + 0.8, rot: 5 },
            { text: '= #1 HOLDER', dx: 0, dy: 235, at: S(12) + 1.4, rot: -3, color: '#ffd23f' },
          ]}
        />
        <Sparkles x={bfx} y={bfy + 235} t={t} at={S(12) + 1.4} spread={170} />
      </Stage>
      <Notification at={BUZZ1[0]} until={BUZZ1[1]} app="BROCOIN" title="BROCOIN -99.9%" body="Portfolio: $0.0001" />
      <Notification at={BUZZ2[0]} until={BUZZ2[1]} app="BROCOIN" title="MOM sold 1 BROCOIN" body="Holders: 1" />
      <Cut from={0} to={SIG}>
        <TitleBar title="Bro started his own crypto coin" series={SERIES.name} ep={5} accent={SERIES.accent} />
      </Cut>
      <SignatureStamp at={SIG} stampAt={S(15) + 0.25} text="I GOT THIS." accent={SERIES.accent} />
      {t < SIG && <DialogueCaptions lines={VO} colors={SPEAKER_COLORS} y={1385} />}
    </AbsoluteFill>
  );
}
