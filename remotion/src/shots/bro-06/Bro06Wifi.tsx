// BRO THINKS HE'S HIM · EP 6 — "Bro tried to fix the WiFi"
// toon-shorts/bro/ep-06-wifi. Every cue derives from the VO line times (S(i)/E(i)).
// Room: "basically an engineer" · "the important half" · YANK — the lamp dies · the CITY blacks
// out in a wave · eyes in the dark: "...Reset complete." · neighbor's WiFi twist · the password
// reveal (StopUsingMyWifiBro) · "He knows my name. That's basically fame."
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Toon, faceAt, type ArmPose } from '../../lib/toon/rig';
import { BRO, DEE, SERIES, SPEAKER_COLORS } from '../../lib/toon/series/bro';
import { CordBundle, Desk, Lamp, Phone, PowerStrip, Room, Skyline, WifiPhone } from '../../lib/toon/sets';
import {
  Cut,
  DialogueCaptions,
  EyesInDark,
  Flash,
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
import { prog } from '../../lib/shorts';
import { VO } from './vo.gen';

export const compositionConfig = {
  id: 'Bro06Wifi',
  durationInSeconds: 36.7,
  fps: 30,
  width: 1080,
  height: 1920,
};

// 0 stand back · 1 call someone? · 2 basically an engineer · 3 half a tutorial · 4 important half ·
// 5 trust me · 6 unplug everything · 7 Bro. · 8 reset complete · 9 still no wifi · 10 neighbor's wifi ·
// 11 changed the password · 12 to what? · 13 Stop using my WiFi Bro · 14 basically fame · 15 I got this
const S = (i: number) => VO[i].start;
const E = (i: number) => VO[i].end;

const YANK = E(6) + 0.25;
const LIGHTS_OUT = E(6) + 0.5;
const SKY: [number, number] = [E(6) + 0.9, E(6) + 3.0];
const EYES: [number, number] = [SKY[1], E(8) + 0.5];
const POWER = EYES[1];
const INSERT: [number, number] = [E(12) + 0.2, S(14) - 0.45];
const STARE = INSERT[1];
const SIG = E(14) + 0.6;
const TOTAL = compositionConfig.durationInSeconds;

const BRO_AT = { x: 520, y: 1490 };
const DEE_AT = { x: 200, y: 1490, s: 0.95 };
const DESK = { x: 860, y: 1480 };
const STRIP = { x: 760, y: 1540 };

const [bfx, bfy] = faceAt(BRO_AT.x, BRO_AT.y);

type F = { z: number; x: number; y: number; rot?: number };
const shot = (t1: number, t2: number, a: F, b: F = a): CamKey[] => [
  { t: t1, ...a, cut: true },
  { t: t2 - 0.01, ...b },
];
const WIDE: F = { z: 1, x: 540, y: 960 };

const CAM: CamKey[] = [
  ...shot(0, S(1) - 0.05, { z: 1.75, x: bfx, y: bfy + 70 }, { z: 1.84, x: bfx, y: bfy + 70 }),
  ...shot(S(1) - 0.05, S(2) - 0.05, WIDE),
  ...shot(S(2) - 0.05, S(3) - 0.05, { z: 1.45, x: bfx + 20, y: bfy + 200 }, { z: 1.5, x: bfx + 20, y: bfy + 200 }),
  ...shot(S(3) - 0.05, S(4) - 0.1, WIDE),
  ...shot(S(4) - 0.1, S(5) - 0.1, { z: 1.75, x: bfx, y: bfy + 90 }, { z: 1.84, x: bfx, y: bfy + 90 }),
  ...shot(S(5) - 0.1, S(6) - 0.05, { z: 1.62, x: bfx, y: bfy + 170 }, { z: 1.7, x: bfx, y: bfy + 170 }),
  ...shot(S(6) - 0.05, SKY[0], { z: 1.12, x: 620, y: 1080 }, { z: 1.16, x: 620, y: 1080 }),
  ...shot(SKY[0], EYES[0], WIDE, { z: 1.04, x: 540, y: 1000 }),
  ...shot(POWER, S(10) - 0.05, { z: 1.5, x: bfx, y: bfy + 200 }),
  ...shot(S(10) - 0.05, S(11) - 0.1, WIDE),
  ...shot(S(11) - 0.1, S(12) - 0.05, { z: 1.75, x: bfx, y: bfy + 90 }),
  ...shot(S(12) - 0.05, INSERT[0], WIDE),
  ...shot(INSERT[0], STARE, { z: 1.3, x: 540, y: 980 }, { z: 1.4, x: 540, y: 960 }),
  ...shot(STARE, SIG, { z: 2.05, x: bfx, y: bfy + 70 }, { z: 2.2, x: bfx, y: bfy + 70 }),
  { t: SIG, z: 1.6, x: bfx, y: bfy + 160, cut: true },
  { t: SIG + 0.9, z: 1.85, x: bfx, y: bfy + 120 },
  { t: TOTAL, z: 1.95, x: bfx, y: bfy + 120 },
];

export default function Bro06Wifi() {
  const t = useT();
  const cam = camAt(t, CAM);
  const shake = [shakeAt(t, S(5) - 0.1, 16), shakeAt(t, YANK, 18), shakeAt(t, STARE, 10)].reduce(
    (a, b) => [a[0] + b[0], a[1] + b[1]] as [number, number],
    [0, 0] as [number, number],
  );

  const yanked = t >= YANK;
  const dark = t >= LIGHTS_OUT && t < POWER;
  const lightsOutLevel = t < LIGHTS_OUT || t >= POWER ? 0 : Math.min(1, prog(t, LIGHTS_OUT, LIGHTS_OUT + 0.08));
  const inSky = t >= SKY[0] && t < SKY[1];
  const inInsert = t >= INSERT[0] && t < INSERT[1];

  const phase =
    t < S(1) - 0.05 ? 'standback'
    : t < S(2) - 0.05 ? 'call'
    : t < S(3) - 0.05 ? 'engineer'
    : t < S(4) - 0.1 ? 'tutorial'
    : t < S(5) - 0.1 ? 'half'
    : t < S(6) - 0.05 ? 'catch'
    : t < POWER ? 'yank'
    : t < S(10) - 0.05 ? 'phone'
    : t < S(11) - 0.1 ? 'neighbor'
    : t < S(12) - 0.05 ? 'password'
    : t < STARE ? 'towhat'
    : t < SIG ? 'fame'
    : 'sig';
  const broExpr =
    phase === 'fame' || phase === 'sig' ? 'deadpan'
    : phase === 'yank' && yanked ? 'shock'
    : phase === 'phone' ? 'annoyed'
    : phase === 'neighbor' ? 'shock'
    : phase === 'password' ? 'side-eye'
    : phase === 'catch' || phase === 'engineer' ? 'confident'
    : 'smug';
  const broArmR: ArmPose =
    phase === 'standback' ? 'present'
    : phase === 'engineer' || phase === 'catch' ? 'gun'
    : phase === 'half' ? 'point-up'
    : phase === 'yank' ? (yanked ? 'point-up' : 'down')
    : phase === 'phone' || phase === 'neighbor' || phase === 'password' || phase === 'towhat' ? 'hold'
    : phase === 'fame' || phase === 'sig' ? 'cross'
    : 'hip';
  const broArmL: ArmPose = phase === 'fame' || phase === 'sig' ? 'cross' : phase === 'yank' && yanked ? 'shrug' : 'hip';
  const broLook: [number, number] =
    phase === 'call' || phase === 'tutorial' || phase === 'neighbor' || phase === 'towhat' ? [-0.9, 0]
    : phase === 'yank' && !yanked ? [0.8, 0.8]
    : phase === 'phone' || phase === 'password' ? [0.3, 0.7]
    : [0, 0];

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Stage cam={cam} shake={shake} filter={signatureFilter(t, SIG)}>
        {inSky ? (
          <Skyline t={t} outAt={SKY[0] + 0.35} wave={1.1} />
        ) : inInsert ? (
          <>
            <Room />
            <rect x={0} y={0} width={1080} height={1920} fill="#000" opacity={0.45} />
            <WifiPhone
              x={540}
              y={1000}
              network="NEIGHBOR_WIFI"
              status={t < S(13) - 0.1 ? 'Incorrect password' : undefined}
              password={t >= S(13) - 0.1 ? 'StopUsingMyWifiBro' : undefined}
              typed={prog(t, S(13), E(13) - 0.2)}
            />
          </>
        ) : (
          <>
            <Room />
            <Desk x={DESK.x} y={DESK.y} w={380} />
            <Lamp x={DESK.x + 40} y={DESK.y - 280} on={!dark} />
            <PowerStrip x={STRIP.x} y={STRIP.y} plugged={!yanked} toX={DESK.x + 20} toY={DESK.y - 290} />
            <Rays x={bfx} y={bfy + 60} t={t} from={S(14) + 1.0} to={SIG} />
            <Toon
              spec={DEE}
              x={DEE_AT.x}
              y={DEE_AT.y}
              scale={DEE_AT.s}
              expr={phase === 'neighbor' ? 'annoyed' : phase === 'fame' ? 'side-eye' : 'annoyed'}
              look={[0.8, 0]}
              mouth={lipSync(VO, 'dee', t)}
              armL="cross"
              armR={phase === 'neighbor' ? 'point' : talking(VO, 'dee', t) ? 'shrug' : 'cross'}
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
              holdR={phase === 'yank' && yanked ? <CordBundle t={t} swing={1} /> : broArmR === 'hold' ? <Phone lines={['Wi-Fi', 'NONE']} scale={0.9} /> : undefined}
              sweat={phase === 'yank' && yanked}
              tilt={phase === 'engineer' ? 5 : phase === 'half' ? -4 : 0}
            />
            <Sparkles x={bfx + 40} y={bfy - 20} t={t} at={S(5) + 0.5} spread={190} />
            <Sparkles x={STRIP.x} y={STRIP.y - 30} t={t} at={YANK} spread={80} color="#ffd60a" />
            <Sparkles x={bfx} y={bfy - 40} t={t} at={S(14) + 1.0} spread={210} />
            {lightsOutLevel > 0 && <rect x={0} y={0} width={1080} height={1920} fill="#000" opacity={0.92 * lightsOutLevel} />}
          </>
        )}
      </Stage>
      <EyesInDark
        from={EYES[0]}
        to={EYES[1]}
        pairs={[
          { x: 320, y: 920, glasses: true, lid: 0.35, look: 0.7, blinkPhase: 0.4 },
          { x: 760, y: 920, lid: 0.5, look: 0, blinkPhase: 1.3 },
        ]}
      />
      <Flash at={POWER} dur={0.15} />
      <Cut from={0} to={SIG}>
        <TitleBar title="Bro tried to fix the WiFi" series={SERIES.name} ep={6} accent={SERIES.accent} />
      </Cut>
      <SignatureStamp at={SIG} stampAt={S(15) + 0.25} text="I GOT THIS." accent={SERIES.accent} />
      {t < SIG && !inSky && <DialogueCaptions lines={VO} colors={SPEAKER_COLORS} y={1385} />}
    </AbsoluteFill>
  );
}
