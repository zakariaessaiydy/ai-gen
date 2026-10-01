// BRO THINKS HE'S HIM · EP 1 — "Bro thought he could get rich in ONE day"
// toon-shorts/bro/ep-01-business. All cues are GLOBAL seconds (toon convention: no nested
// Sequences). Scenes: ROOM 0–8.4 · STREET 8.4–20.5 · card 20.5–22 · SUNSET 22–26.5 · SIGNATURE.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Toon, faceAt } from '../../lib/toon/rig';
import { BRO, DEE, extra, SERIES, SPEAKER_COLORS } from '../../lib/toon/series/bro';
import { Bottle, Crate, Room, Street, Table } from '../../lib/toon/sets';
import {
  Cut,
  DialogueCaptions,
  Flash,
  Rays,
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
import { prog } from '../../lib/shorts';
import { VO } from './vo.gen';

export const compositionConfig = {
  id: 'Bro01Business',
  durationInSeconds: 30,
  fps: 30,
  width: 1080,
  height: 1920,
};

const CUSTOMER = extra('customer', {
  hair: 'bald',
  hairColor: '#b8b1a8',
  top: 'shirt',
  topColor: '#d8c3a5',
  topShade: '#b9a385',
  tie: '#3a5a8c',
  beard: 'mustache',
  glasses: true,
});

const COLORS = { ...SPEAKER_COLORS, customer: '#ffb4a2' };

// scene boundaries
const ROOM_END = 8.4;
const CARD = [20.5, 22.0] as const;
const SUNSET = 22.0;
const SIG = 26.5;

// placements (feet, stage px)
const ROOM_BRO = { x: 650, y: 1490 };
const ROOM_DEE = { x: 250, y: 1490, s: 0.95 };
const ST_BRO = { x: 330, y: 1480 };
const SIT_BRO = { x: 600, y: 1490 };
const SUN_DEE = { x: 230, y: 1490, s: 0.95 };

const [bfx, bfy] = faceAt(ROOM_BRO.x, ROOM_BRO.y);
const [sfx, sfy] = faceAt(ST_BRO.x, ST_BRO.y);
const [cfx, cfy] = faceAt(SIT_BRO.x, SIT_BRO.y, 1, 'sit');

const CAM: CamKey[] = [
  // ROOM
  { t: 0, z: 1.75, x: bfx, y: bfy + 70 },
  { t: 2.3, z: 1.84, x: bfx, y: bfy + 70 },
  { t: 2.45, z: 1.0, x: 540, y: 960, cut: true },
  { t: 3.95, z: 1.0, x: 540, y: 960 },
  { t: 3.96, z: 1.62, x: bfx, y: bfy + 170, cut: true },
  { t: 6.3, z: 1.7, x: bfx, y: bfy + 170 },
  { t: 6.31, z: 1.22, x: 620, y: 930, rot: -5, cut: true },
  { t: 8.39, z: 1.34, x: 640, y: 900, rot: -6 },
  // STREET
  { t: 8.4, z: 1.0, x: 540, y: 960, cut: true },
  { t: 11.6, z: 1.06, x: 520, y: 960 },
  { t: 11.61, z: 1.15, x: 560, y: 1000, cut: true },
  { t: 12.75, z: 1.15, x: 560, y: 1000 },
  { t: 12.76, z: 1.72, x: sfx, y: sfy + 115, cut: true },
  { t: 14.3, z: 1.78, x: sfx, y: sfy + 115 },
  { t: 14.31, z: 1.25, x: 640, y: 1000, cut: true },
  { t: 15.0, z: 1.25, x: 640, y: 1000 },
  { t: 15.6, z: 1.85, x: 935, y: 990 },
  { t: 16.3, z: 1.9, x: 935, y: 990 },
  { t: 16.31, z: 1.0, x: 540, y: 960, cut: true },
  { t: 18.0, z: 1.0, x: 540, y: 960 },
  { t: 18.01, z: 2.05, x: sfx, y: sfy + 70, cut: true },
  { t: 20.5, z: 2.2, x: sfx, y: sfy + 70 },
  // SUNSET
  { t: 22.0, z: 1.08, x: 450, y: 1000, cut: true },
  { t: 24.2, z: 1.1, x: 450, y: 1000 },
  { t: 24.21, z: 1.55, x: cfx, y: cfy + 170, cut: true },
  { t: SIG, z: 1.6, x: cfx, y: cfy + 160 },
  // SIGNATURE — the push into THE STARE
  { t: SIG + 0.9, z: 1.85, x: cfx, y: cfy + 120 },
  { t: 30, z: 1.95, x: cfx, y: cfy + 120 },
];

// customer path: walks in 10.3–11.6, walks out 16.3–17.7
const customerX = (t: number) => {
  if (t < 16.3) return 1300 - 540 * prog(t, 10.3, 11.6);
  return 760 + 560 * prog(t, 16.3, 17.7);
};
const customerWalking = (t: number) => (t >= 10.3 && t < 11.6) || (t >= 16.3 && t < 17.7);

const RoomScene: React.FC<{ t: number }> = ({ t }) => {
  const m = lipSync(VO, 'bro', t);
  const deeTalks = talking(VO, 'dee', t);
  const phase = t < 2.45 ? 'hook' : t < 3.96 ? 'ask' : t < 6.31 ? 'catch' : 'plan';
  return (
    <>
      <Room />
      <Rays x={bfx} y={bfy} t={t} from={6.31} to={ROOM_END} />
      <Toon
        spec={DEE}
        x={ROOM_DEE.x}
        y={ROOM_DEE.y}
        scale={ROOM_DEE.s}
        expr={phase === 'plan' ? 'side-eye' : 'annoyed'}
        look={phase === 'plan' ? [0.6, -0.3] : [0.7, 0]}
        mouth={lipSync(VO, 'dee', t)}
        armL="cross"
        armR={deeTalks ? 'shrug' : 'cross'}
      />
      <Toon
        spec={BRO}
        x={ROOM_BRO.x}
        y={ROOM_BRO.y}
        expr={phase === 'hook' ? 'smug' : phase === 'ask' ? 'smug' : 'confident'}
        look={phase === 'ask' ? [-0.9, 0] : [0, 0]}
        mouth={m}
        armL={phase === 'catch' ? 'hip' : phase === 'plan' ? 'hip' : 'hip'}
        armR={phase === 'catch' ? 'gun' : phase === 'plan' ? 'point-up' : 'hip'}
        tilt={phase === 'plan' ? -4 : 0}
      />
      <Sparkles x={bfx + 40} y={bfy - 20} t={t} at={4.5} spread={190} />
    </>
  );
};

const StreetScene: React.FC<{ t: number }> = ({ t }) => {
  const m = lipSync(VO, 'bro', t);
  const cx = customerX(t);
  const shock = t >= 16.3 && t < 18.0;
  const stare = t >= 18.0;
  const presenting = t >= 8.9 && t < 10.6;
  const proud = t >= 12.76 && t < 14.31;
  return (
    <>
      <Street deal="WATER $1" />
      <Toon
        spec={BRO}
        x={ST_BRO.x}
        y={ST_BRO.y}
        expr={stare ? 'deadpan' : shock ? 'shock' : proud ? 'smug' : 'confident'}
        look={stare ? [0, 0] : shock ? [1, 0] : t >= 11.0 ? [0.9, 0] : [0, 0]}
        mouth={m}
        armL={presenting ? 'present' : stare ? 'cross' : 'hip'}
        armR={presenting ? 'present' : proud ? 'thumb' : stare ? 'cross' : shock ? 'shrug' : 'hip'}
        sweat={shock}
      />
      {/* a tall stand: its sign must sit ABOVE the caption band in the wide shot */}
      <Table x={ST_BRO.x} y={1140} w={340} sign="WATER $10" />
      <Bottle x={ST_BRO.x + 90} y={1142} level={1} />
      <Sparkles x={ST_BRO.x + 90} y={1040} t={t} at={9.2} spread={90} />
      <Toon
        spec={CUSTOMER}
        x={cx}
        y={1490}
        scale={0.97}
        expr={t >= 14.31 ? 'annoyed' : 'side-eye'}
        look={[-0.9, 0]}
        mouth={lipSync(VO, 'customer', t)}
        legs={customerWalking(t) ? 'walk' : 'stand'}
        walk={t * 1.8}
        armR={t >= 14.9 && t < 16.3 ? 'point' : 'down'}
        armL="down"
      />
    </>
  );
};

const SunsetScene: React.FC<{ t: number }> = ({ t }) => {
  const drinking = t < 24.2;
  const level = drinking ? 0.6 - 0.6 * prog(t, SUNSET + 0.2, 24.0) : 0;
  const sig = t >= SIG;
  return (
    <>
      <Street deal="WATER $1" sunset={1} />
      <Table x={880} y={1230} w={300} sign="WATER $10" />
      <Crate x={SIT_BRO.x} y={SIT_BRO.y} h={250} />
      <Toon
        spec={DEE}
        x={SUN_DEE.x}
        y={SUN_DEE.y}
        scale={SUN_DEE.s}
        expr="annoyed"
        look={[0.8, 0.1]}
        mouth={lipSync(VO, 'dee', t)}
        armL="cross"
        armR={talking(VO, 'dee', t) ? 'shrug' : 'cross'}
      />
      <Toon
        spec={BRO}
        x={SIT_BRO.x}
        y={SIT_BRO.y}
        legs="sit"
        expr={sig ? 'deadpan' : drinking ? 'happy' : 'smug'}
        look={sig ? [0, 0] : [-0.6, 0]}
        mouth={lipSync(VO, 'bro', t)}
        armL={sig ? 'down' : 'hip'}
        armR={drinking ? 'drink' : 'hold'}
        holdR={<Bottle anchor="center" level={level} />}
        holdRotR={drinking ? -55 : 0}
        tilt={drinking ? -7 : 0}
      />
    </>
  );
};

export default function Bro01Business() {
  const t = useT();
  const cam = camAt(t, CAM);
  const shake = [shakeAt(t, 4.0, 16), shakeAt(t, ROOM_END, 22), shakeAt(t, 18.01, 10)].reduce(
    (a, b) => [a[0] + b[0], a[1] + b[1]] as [number, number],
    [0, 0] as [number, number],
  );
  const inCard = t >= CARD[0] && t < CARD[1];
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {!inCard && (
        <Stage cam={cam} shake={shake} filter={signatureFilter(t, SIG)}>
          {t < ROOM_END && <RoomScene t={t} />}
          {t >= ROOM_END && t < CARD[0] && <StreetScene t={t} />}
          {t >= SUNSET && <SunsetScene t={t} />}
        </Stage>
      )}
      <TimeCard from={CARD[0]} to={CARD[1]} text="3 HOURS LATER" />
      <Flash at={ROOM_END} />
      <Flash at={SUNSET} dur={0.1} />
      <Cut from={0} to={SIG}>
        <TitleBar title="Bro thought he could get rich in ONE day" series={SERIES.name} ep={1} accent={SERIES.accent} />
      </Cut>
      <SignatureStamp at={SIG} stampAt={27.35} text="I GOT THIS." accent={SERIES.accent} />
      {/* the signature line is carried by the stamp — no caption over it */}
      {!inCard && t < SIG && <DialogueCaptions lines={VO} colors={COLORS} y={1385} />}
    </AbsoluteFill>
  );
}
