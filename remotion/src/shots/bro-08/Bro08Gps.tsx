// BRO THINKS HE'S HIM · EP 8 — "Bro said he doesn't need GPS"
// toon-shorts/bro/ep-08-gps. Every cue derives from the VO line times (S(i)/E(i)).
// The car (front view): "GPS is for tourists" · Turn left → he turns right (×2) · the GPS gives
// up · the route map spins round the same block · 2 HOURS LATER · six gas stations · they're
// home · "Scenic route." · "Zero traffic." · GPS: "You have arrived... tourist."
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Toon, type ArmPose } from '../../lib/toon/rig';
import { BRO, DEE, SERIES, SPEAKER_COLORS } from '../../lib/toon/series/bro';
import { CarFront, CarInterior, CityMap, GPS_PHONE, House, RoadBackdrop } from '../../lib/toon/sets';
import {
  Cut,
  DialogueCaptions,
  SignatureStamp,
  Sparkles,
  Stage,
  TimeCard,
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
  id: 'Bro08Gps',
  durationInSeconds: 38.2,
  fps: 30,
  width: 1080,
  height: 1920,
};

const COLORS = { ...SPEAKER_COLORS, gps: '#b8f2e6' };

// 0 the mall · 1 put on the GPS · 2 GPS is for tourists · 3 trust me · 4 turn left · 5 recalculating ·
// 6 turn left · 7 recalculating... · 8 I give up · 9 six times · 10 six gas stations · 11 your house ·
// 12 scenic route · 13 didn't go anywhere · 14 zero traffic · 15 arrived... tourist · 16 I got this
const S = (i: number) => VO[i].start;
const E = (i: number) => VO[i].end;

const SWERVE1 = E(4) + 0.1;
const SWERVE2 = E(6) + 0.1;
const GPS_IN: [number, number] = [S(8) - 0.35, E(8) + 0.3];
const MAP: [number, number] = [E(8) + 0.3, E(8) + 2.7];
const CARD: [number, number] = [MAP[1], MAP[1] + 1.3];
const HOME = E(10) + 0.3;
const STARE: [number, number] = [S(12) - 0.45, S(13) - 0.05];
const SIG = E(15) + 0.6;
const TOTAL = compositionConfig.durationInSeconds;

const BRO_AT = { x: 700, y: 1596, s: 0.9 }; // driver (viewer's right), legs hidden by the hood
const DEE_AT = { x: 380, y: 1560, s: 0.85 };
const FACE_Y = 950;

type F = { z: number; x: number; y: number; rot?: number };
const shot = (t1: number, t2: number, a: F, b: F = a): CamKey[] => [
  { t: t1, ...a, cut: true },
  { t: t2 - 0.01, ...b },
];
const CAR_WIDE: F = { z: 1, x: 540, y: 1100 };
const BRO_CU: F = { z: 1.7, x: BRO_AT.x, y: FACE_Y + 100 };
const PHONE: F = { z: 3.4, x: GPS_PHONE[0], y: GPS_PHONE[1] };

const CAM: CamKey[] = [
  ...shot(0, S(1) - 0.05, BRO_CU, { ...BRO_CU, z: 1.78 }),
  ...shot(S(1) - 0.05, S(2) - 0.05, CAR_WIDE),
  ...shot(S(2) - 0.05, S(3) - 0.1, { z: 1.45, x: BRO_AT.x - 20, y: FACE_Y + 130 }, { z: 1.5, x: BRO_AT.x - 20, y: FACE_Y + 130 }),
  ...shot(S(3) - 0.1, S(4) - 0.05, { z: 1.62, x: BRO_AT.x, y: FACE_Y + 110 }, { z: 1.7, x: BRO_AT.x, y: FACE_Y + 110 }),
  ...shot(S(4) - 0.05, GPS_IN[0], { z: 1.05, x: 540, y: 1150 }),
  ...shot(GPS_IN[0], MAP[0], PHONE, { ...PHONE, z: 3.6 }),
  ...shot(MAP[0], CARD[0], { z: 1, x: 540, y: 960 }),
  ...shot(CARD[1], S(10) - 0.05, { z: 1.25, x: 540, y: 1100 }),
  ...shot(S(10) - 0.05, HOME, BRO_CU),
  ...shot(HOME, STARE[0], { z: 1, x: 540, y: 1060 }),
  ...shot(STARE[0], STARE[1], { z: 2.0, x: BRO_AT.x, y: FACE_Y + 50 }, { z: 2.15, x: BRO_AT.x, y: FACE_Y + 50 }),
  ...shot(S(13) - 0.05, S(14) - 0.05, { z: 1.4, x: DEE_AT.x + 40, y: FACE_Y + 130 }),
  ...shot(S(14) - 0.05, S(15) - 0.1, BRO_CU),
  ...shot(S(15) - 0.1, SIG, PHONE, { ...PHONE, z: 3.6 }),
  { t: SIG, z: 1.6, x: BRO_AT.x, y: FACE_Y + 60, cut: true },
  { t: SIG + 0.9, z: 1.85, x: BRO_AT.x, y: FACE_Y + 30 },
  { t: TOTAL, z: 1.95, x: BRO_AT.x, y: FACE_Y + 30 },
];

// a swerve: the car lurches, holds, rights itself (deg)
const swerveAt = (t: number, at: number) => {
  if (t < at || t > at + 1.0) return 0;
  const p = (t - at) / 1.0;
  return Math.sin(p * Math.PI) * 9 * (1 - p * 0.3);
};

const gpsText = (t: number): [string, string] => {
  if (t < S(4)) return ['MALL · 12 MIN', '#2dc653'];
  if (t < S(5)) return ['TURN LEFT', '#2dc653'];
  if (t < S(6)) return ['RECALCULATING', '#ffd23f'];
  if (t < S(7)) return ['TURN LEFT', '#2dc653'];
  if (t < S(8)) return ['RECALCULATING', '#ff9f1c'];
  if (t < MAP[0]) return ['I GIVE UP', '#ff3b30'];
  if (t < S(15)) return ['NO ROUTE', '#ff3b30'];
  return ['ARRIVED. TOURIST.', '#2dc653'];
};

export default function Bro08Gps() {
  const t = useT();
  const cam = camAt(t, CAM);
  const sw = swerveAt(t, SWERVE1) - swerveAt(t, SWERVE2) * -1;
  const shake = [shakeAt(t, S(3) - 0.1, 16), shakeAt(t, SWERVE1, 14), shakeAt(t, SWERVE2, 14), shakeAt(t, STARE[0], 10)].reduce(
    (a, b) => [a[0] + b[0], a[1] + b[1]] as [number, number],
    [0, 0] as [number, number],
  );
  const inMap = t >= MAP[0] && t < MAP[1];
  const inCard = t >= CARD[0] && t < CARD[1];
  const home = t >= HOME;
  const driving = !home;
  const bob = driving ? Math.sin(t * 9) * 4 : 0;
  const drift = -sw * 40 + (driving ? Math.sin(t * 0.7) * 30 : 0);
  const [gps, gpsColor] = gpsText(t);
  const later = t >= CARD[1] && !home;

  const bp =
    t < S(1) - 0.05 ? 'mall'
    : t < S(2) - 0.05 ? 'gps'
    : t < S(3) - 0.1 ? 'tourists'
    : t < S(4) - 0.05 ? 'catch'
    : t < MAP[0] ? 'turns'
    : later ? 'later'
    : t < STARE[0] ? 'house'
    : t < STARE[1] ? 'stare'
    : t < S(14) - 0.05 ? 'nowhere'
    : t < SIG ? 'traffic'
    : 'sig';
  const wheel: ArmPose = 'hold';
  const broArmR: ArmPose = bp === 'catch' || bp === 'tourists' ? 'gun' : bp === 'traffic' ? 'present' : bp === 'stare' || bp === 'sig' ? 'cross' : wheel;
  const broArmL: ArmPose = bp === 'stare' || bp === 'sig' ? 'cross' : wheel;
  const broExpr =
    bp === 'stare' || bp === 'sig' ? 'deadpan'
    : bp === 'turns' ? (t >= S(8) - 0.35 ? 'shock' : 'confident')
    : bp === 'later' ? 'smug'
    : bp === 'house' ? 'neutral'
    : bp === 'traffic' ? 'smug'
    : bp === 'catch' || bp === 'tourists' ? 'confident'
    : 'smug';
  const deeExpr = bp === 'later' ? 'annoyed' : bp === 'turns' ? 'side-eye' : bp === 'house' || bp === 'nowhere' ? 'annoyed' : 'annoyed';

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {!inCard && (
        <Stage cam={cam} shake={shake} filter={signatureFilter(t, SIG)}>
          {inMap ? (
            <CityMap p={EASE_INOUT(prog(t, MAP[0] + 0.1, MAP[1] - 0.15))} loops={6} />
          ) : (
            <>
              {home ? <House name="BRO" /> : <RoadBackdrop t={t} drift={drift} speed={later ? 0.6 : 1} />}
              <g transform={`translate(${-sw * 6},${bob}) rotate(${sw} 540 1700)`}>
                <CarInterior />
                <Toon
                  spec={DEE}
                  x={DEE_AT.x}
                  y={DEE_AT.y}
                  scale={DEE_AT.s}
                  legs="sit"
                  shadow={false}
                  expr={deeExpr}
                  look={bp === 'turns' && t > SWERVE1 ? [0.9, 0] : [0.8, 0]}
                  mouth={lipSync(VO, 'dee', t)}
                  armL="cross"
                  armR={bp === 'house' && talking(VO, 'dee', t) ? 'point' : talking(VO, 'dee', t) ? 'shrug' : 'cross'}
                  lean={-sw * 1.2}
                  tilt={bp === 'later' ? -8 : 0}
                />
                <Toon
                  spec={BRO}
                  x={BRO_AT.x}
                  y={BRO_AT.y}
                  scale={BRO_AT.s}
                  legs="sit"
                  shadow={false}
                  expr={broExpr}
                  look={bp === 'gps' || bp === 'nowhere' ? [-0.9, 0] : bp === 'house' ? [-0.5, -0.4] : [0, 0]}
                  mouth={lipSync(VO, 'bro', t)}
                  armL={broArmL}
                  armR={broArmR}
                  lean={-sw * 1.2}
                  sweat={bp === 'turns' && t >= S(8) - 0.35}
                />
                <CarFront gps={gps} gpsColor={gpsColor} />
              </g>
              <Sparkles x={BRO_AT.x + 40} y={FACE_Y - 20} t={t} at={S(3) + 0.5} spread={180} />
            </>
          )}
        </Stage>
      )}
      <TimeCard from={CARD[0]} to={CARD[1]} text="2 HOURS LATER" />
      <Cut from={0} to={SIG}>
        <TitleBar title="Bro said he doesn't need GPS" series={SERIES.name} ep={8} accent={SERIES.accent} />
      </Cut>
      <SignatureStamp at={SIG} stampAt={S(16) + 0.25} text="I GOT THIS." accent={SERIES.accent} />
      {!inCard && !inMap && t < SIG && <DialogueCaptions lines={VO} colors={COLORS} y={1385} />}
    </AbsoluteFill>
  );
}
