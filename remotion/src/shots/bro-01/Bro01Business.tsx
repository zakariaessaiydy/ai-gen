// BRO THINKS HE'S HIM · EP 1 — "Bro thought he could get rich in ONE day"
// toon-shorts/bro/ep-01-business. Every cue is derived from the VO line times (S(i)/E(i) = start/end
// of line i in vo.gen.ts), so re-voicing or re-timing a line moves its animation with it.
// Scenes: ROOM (hook + plan) · STREET (the stand) · 3 HOURS LATER · SUNSET (bro math) · SIGNATURE.
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
  durationInSeconds: 39.4,
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

// line i of the script (see beats.json vo[]): 0 quit · 1 no job · 2 how fast · 3 trust me ·
// 4 millionaire · 5 phase one · 6 ten dollars? · 7 premium · 8 what makes it · 9 the price ·
// 10 one dollar there · 11 do they have ME · 12 that's why · 13 hater · 14 how much ·
// 15 saved ten · 16 bought it for a dollar · 17 up nine · 18 I got this
const S = (i: number) => VO[i].start;
const E = (i: number) => VO[i].end;

const ROOM_END = E(4) + 0.35;
const CUST_IN: [number, number] = [E(5) + 0.15, S(6) - 0.1];
const CUST_OUT: [number, number] = [E(12) + 0.15, E(12) + 1.3];
const STARE = S(13) - 0.45;
const CARD: [number, number] = [E(13) + 0.5, E(13) + 1.9];
const SUNSET = CARD[1];
const SIG = E(17) + 0.6;
const TOTAL = compositionConfig.durationInSeconds;

// placements (feet, stage px)
const ROOM_BRO = { x: 650, y: 1490 };
const ROOM_DEE = { x: 250, y: 1490, s: 0.95 };
const ST_BRO = { x: 330, y: 1480 };
const SIT_BRO = { x: 600, y: 1490 };
const SUN_DEE = { x: 230, y: 1490, s: 0.95 };

const [bfx, bfy] = faceAt(ROOM_BRO.x, ROOM_BRO.y);
const [sfx, sfy] = faceAt(ST_BRO.x, ST_BRO.y);
const [cfx, cfy] = faceAt(SIT_BRO.x, SIT_BRO.y, 1, 'sit');

// one camera shot: hard cut in at t1, slow drift until t2
type F = { z: number; x: number; y: number; rot?: number };
const shot = (t1: number, t2: number, a: F, b: F = a): CamKey[] => [
  { t: t1, ...a, cut: true },
  { t: t2 - 0.01, ...b },
];
const WIDE: F = { z: 1, x: 540, y: 960 };

const CAM: CamKey[] = [
  // ROOM
  ...shot(0, S(1) - 0.05, { z: 1.75, x: bfx, y: bfy + 70 }, { z: 1.84, x: bfx, y: bfy + 70 }),
  ...shot(S(1) - 0.05, S(2) - 0.05, WIDE),
  ...shot(S(2) - 0.05, S(3) - 0.1, { z: 1.45, x: bfx - 20, y: bfy + 200 }, { z: 1.5, x: bfx - 20, y: bfy + 200 }),
  ...shot(S(3) - 0.1, S(4) - 0.05, { z: 1.62, x: bfx, y: bfy + 170 }, { z: 1.7, x: bfx, y: bfy + 170 }),
  ...shot(S(4) - 0.05, ROOM_END, { z: 1.22, x: 620, y: 930, rot: -5 }, { z: 1.34, x: 640, y: 900, rot: -6 }),
  // STREET
  ...shot(ROOM_END, S(6) - 0.05, WIDE, { z: 1.06, x: 520, y: 960 }),
  ...shot(S(6) - 0.05, S(9) - 0.35, { z: 1.15, x: 560, y: 1000 }, { z: 1.18, x: 560, y: 1000 }),
  ...shot(S(9) - 0.35, S(10) - 0.05, { z: 1.72, x: sfx, y: sfy + 115 }, { z: 1.82, x: sfx, y: sfy + 115 }),
  { t: S(10) - 0.05, z: 1.25, x: 640, y: 1000, cut: true },
  { t: S(10) + 0.5, z: 1.25, x: 640, y: 1000 },
  { t: S(10) + 1.1, z: 1.85, x: 935, y: 990 },
  { t: S(11) - 0.21, z: 1.88, x: 935, y: 990 },
  ...shot(S(11) - 0.2, S(12) - 0.1, { z: 1.45, x: sfx + 40, y: sfy + 190 }, { z: 1.55, x: sfx + 40, y: sfy + 190 }),
  ...shot(S(12) - 0.1, STARE, WIDE),
  ...shot(STARE, CARD[0], { z: 2.05, x: sfx, y: sfy + 70 }, { z: 2.2, x: sfx, y: sfy + 70 }),
  // SUNSET
  ...shot(SUNSET, S(15) - 0.15, { z: 1.08, x: 450, y: 1000 }, { z: 1.1, x: 450, y: 1000 }),
  ...shot(S(15) - 0.15, S(16) - 0.1, { z: 1.55, x: cfx, y: cfy + 170 }, { z: 1.6, x: cfx, y: cfy + 170 }),
  ...shot(S(16) - 0.1, S(17) - 0.35, { z: 1.08, x: 450, y: 1000 }, { z: 1.1, x: 450, y: 1000 }),
  ...shot(S(17) - 0.35, SIG, { z: 1.6, x: cfx, y: cfy + 150 }, { z: 1.68, x: cfx, y: cfy + 150 }),
  // SIGNATURE — the push into THE STARE
  { t: SIG, z: 1.6, x: cfx, y: cfy + 160, cut: true },
  { t: SIG + 0.9, z: 1.85, x: cfx, y: cfy + 120 },
  { t: TOTAL, z: 1.95, x: cfx, y: cfy + 120 },
];

const customerX = (t: number) =>
  t < CUST_OUT[0] ? 1300 - 540 * prog(t, CUST_IN[0], CUST_IN[1]) : 760 + 560 * prog(t, CUST_OUT[0], CUST_OUT[1]);
const customerWalking = (t: number) => (t >= CUST_IN[0] && t < CUST_IN[1]) || (t >= CUST_OUT[0] && t < CUST_OUT[1]);

// hand to the temple — the "big brain" tap (IK target relative to the shoulder)
const TEMPLE = { to: [-30, -245] as [number, number] };

const RoomScene: React.FC<{ t: number }> = ({ t }) => {
  const phase = t < S(1) - 0.05 ? 'quit' : t < S(2) - 0.05 ? 'nojob' : t < S(3) - 0.1 ? 'fast' : t < S(4) - 0.05 ? 'catch' : 'plan';
  return (
    <>
      <Room />
      <Rays x={bfx} y={bfy} t={t} from={S(4) - 0.05} to={ROOM_END} />
      <Toon
        spec={DEE}
        x={ROOM_DEE.x}
        y={ROOM_DEE.y}
        scale={ROOM_DEE.s}
        expr={phase === 'plan' || phase === 'fast' ? 'side-eye' : 'annoyed'}
        look={[0.7, 0]}
        mouth={lipSync(VO, 'dee', t)}
        armL="cross"
        armR={talking(VO, 'dee', t) ? 'shrug' : 'cross'}
      />
      <Toon
        spec={BRO}
        x={ROOM_BRO.x}
        y={ROOM_BRO.y}
        expr={phase === 'quit' || phase === 'nojob' ? 'smug' : 'confident'}
        look={phase === 'nojob' ? [-0.9, 0] : [0, 0]}
        mouth={lipSync(VO, 'bro', t)}
        armL="hip"
        armR={phase === 'fast' || phase === 'catch' ? 'gun' : phase === 'plan' ? 'point-up' : 'hip'}
        handL={phase === 'fast' ? 'gun' : undefined}
        tilt={phase === 'plan' ? -4 : phase === 'fast' ? 5 : 0}
      />
      <Sparkles x={bfx + 40} y={bfy - 20} t={t} at={S(3) + 0.5} spread={190} />
    </>
  );
};

const StreetScene: React.FC<{ t: number }> = ({ t }) => {
  const stare = t >= STARE;
  const shock = t >= S(12) - 0.1 && !stare;
  const flex = t >= S(11) - 0.2 && t < S(12) - 0.1;
  const proud = t >= S(9) - 0.35 && t < S(10) - 0.05;
  const pitching = (t >= ROOM_END + 0.2 && t < CUST_IN[0] + 0.4) || (t >= S(7) && t < E(7) + 0.2);
  return (
    <>
      <Street deal="WATER $1" />
      <Rays x={sfx} y={sfy + 60} t={t} from={S(11) - 0.2} to={S(12) - 0.1} />
      <Toon
        spec={BRO}
        x={ST_BRO.x}
        y={ST_BRO.y}
        expr={stare ? 'deadpan' : shock ? 'shock' : proud ? 'smug' : flex ? 'confident' : 'confident'}
        look={stare || proud || flex ? [0, 0] : shock ? [1, 0] : t >= CUST_IN[0] ? [0.9, 0] : [0, 0]}
        mouth={lipSync(VO, 'bro', t)}
        armL={flex ? 'flex' : pitching ? 'present' : stare ? 'cross' : 'hip'}
        armR={flex ? 'flex' : pitching ? 'present' : proud ? 'thumb' : stare ? 'cross' : shock ? 'shrug' : 'hip'}
        sweat={shock}
      />
      {/* a tall stand: its sign must sit ABOVE the caption band in the wide shot */}
      <Table x={ST_BRO.x} y={1140} w={340} sign="WATER $10" />
      <Bottle x={ST_BRO.x + 90} y={1142} level={1} />
      <Sparkles x={ST_BRO.x + 90} y={1040} t={t} at={S(5) + 0.1} spread={90} />
      <Sparkles x={sfx} y={sfy + 300} t={t} at={S(11) + 0.75} spread={120} />
      <Toon
        spec={CUSTOMER}
        x={customerX(t)}
        y={1490}
        scale={0.97}
        expr={t >= S(12) - 0.1 ? 'annoyed' : t >= S(10) - 0.05 ? 'side-eye' : t >= S(8) ? 'side-eye' : 'shock'}
        look={[-0.9, 0]}
        mouth={lipSync(VO, 'customer', t)}
        legs={customerWalking(t) ? 'walk' : 'stand'}
        walk={t * 1.8}
        armR={t >= S(10) + 0.35 && t < S(11) - 0.2 ? 'point' : t >= S(6) && t < E(6) + 0.2 ? 'shrug' : 'down'}
        armL="down"
      />
    </>
  );
};

const SunsetScene: React.FC<{ t: number }> = ({ t }) => {
  const drinking = t < S(15) - 0.15;
  const level = drinking ? 0.6 - 0.6 * prog(t, SUNSET + 0.2, E(14)) : 0;
  const sig = t >= SIG;
  const brain = t >= S(17) - 0.35 && !sig;
  const deeTalks = talking(VO, 'dee', t);
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
        expr={t >= S(17) ? 'side-eye' : 'annoyed'}
        look={[0.8, 0.1]}
        mouth={lipSync(VO, 'dee', t)}
        armL="cross"
        armR={t >= S(16) && t < E(16) + 0.2 ? 'point' : deeTalks ? 'shrug' : 'cross'}
      />
      <Toon
        spec={BRO}
        x={SIT_BRO.x}
        y={SIT_BRO.y}
        legs="sit"
        expr={sig ? 'deadpan' : drinking ? 'happy' : brain ? 'smug' : 'confident'}
        look={sig || brain ? [0, 0] : [-0.6, 0]}
        mouth={lipSync(VO, 'bro', t)}
        armL={brain ? TEMPLE : sig ? 'down' : 'hip'}
        handL={brain ? 'point' : undefined}
        armR={drinking ? 'drink' : 'hold'}
        holdR={<Bottle anchor="center" level={level} />}
        holdRotR={drinking ? -55 : 0}
        tilt={drinking ? -7 : brain ? 4 : 0}
      />
      <Sparkles x={cfx - 170} y={cfy - 60} t={t} at={E(17) - 0.1} spread={110} color="#ffe066" />
    </>
  );
};

export default function Bro01Business() {
  const t = useT();
  const cam = camAt(t, CAM);
  const shake = [
    shakeAt(t, S(3) - 0.1, 16),
    shakeAt(t, ROOM_END, 22),
    shakeAt(t, S(9) - 0.35, 8),
    shakeAt(t, STARE, 10),
  ].reduce((a, b) => [a[0] + b[0], a[1] + b[1]] as [number, number], [0, 0] as [number, number]);
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
      <SignatureStamp at={SIG} stampAt={S(18) + 0.25} text="I GOT THIS." accent={SERIES.accent} />
      {/* the signature line is carried by the stamp — no caption over it */}
      {!inCard && t < SIG && <DialogueCaptions lines={VO} colors={COLORS} y={1385} />}
    </AbsoluteFill>
  );
}
