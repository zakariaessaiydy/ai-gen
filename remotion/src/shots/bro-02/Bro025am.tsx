// BRO THINKS HE'S HIM · EP 2 — "Bro said he'd wake up at 5AM"
// toon-shorts/bro/ep-02-5am. Every cue derives from the VO line times (S(i)/E(i)).
// Scenes: ROOM evening (the claim) · 5:00 AM (slaps the alarm) · 5:01 AM · 2:47 PM (bro math) · SIGNATURE.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Toon, faceAt } from '../../lib/toon/rig';
import { BRO, DEE, SERIES, SPEAKER_COLORS } from '../../lib/toon/series/bro';
import { AlarmClock, Bed, Blanket, Nightstand, Room } from '../../lib/toon/sets';
import {
  BroMath,
  Cut,
  DialogueCaptions,
  Flash,
  Rays,
  SignatureStamp,
  Sparkles,
  Stage,
  TimeCard,
  TitleBar,
  Zzz,
  camAt,
  lipSync,
  shakeAt,
  signatureFilter,
  talking,
  useT,
  type CamKey,
} from '../../lib/toon/comedy';
import { EASE_OUT, prog } from '../../lib/shorts';
import { VO } from './vo.gen';

export const compositionConfig = {
  id: 'Bro025am',
  durationInSeconds: 39.8,
  fps: 30,
  width: 1080,
  height: 1920,
};

// 0 starting tomorrow · 1 you woke up at 3PM · 2 getting earlier · 3 trust me · 4 every millionaire ·
// 5 name one · 6 me. tomorrow · 7 millionaires sleep in · 8 visualizing success · 9 rise and grind ·
// 10 almost three · 11 beat yesterday by 13 · 12 that's not how— · 13 13 min a day · 14 45 days ·
// 15 that's actually right · 16 I got this
const S = (i: number) => VO[i].start;
const E = (i: number) => VO[i].end;

const CARD1: [number, number] = [E(6) + 0.4, E(6) + 1.7];
const SLAP = S(7) - 0.55;
const CARD2: [number, number] = [E(7) + 0.5, E(7) + 1.5];
const CARD3: [number, number] = [E(8) + 0.5, E(8) + 1.8];
const DAY = CARD3[1];
const DEE_IN: [number, number] = [DAY + 0.2, S(10) - 0.15];
const SIG = E(15) + 0.5;
const TOTAL = compositionConfig.durationInSeconds;

// placements
const ROOM_BRO = { x: 650, y: 1490 };
const ROOM_DEE = { x: 250, y: 1490, s: 0.95 };
const BED = { x: 180, y: 1460 };
const LIE = { x: 985, y: 1232, s: 0.8 }; // feet of the lying Bro (lean -90: body extends left)
const SIT_BRO = { x: 640, y: 1500 };
const DAY_DEE = { x: 210, y: 1490, s: 0.95 };

const [bfx, bfy] = faceAt(ROOM_BRO.x, ROOM_BRO.y);
const [cfx, cfy] = faceAt(SIT_BRO.x, SIT_BRO.y, 1, 'sit');
const [dfx, dfy] = faceAt(DAY_DEE.x, DAY_DEE.y, DAY_DEE.s);
const LIE_HEAD = { x: LIE.x - 790 * LIE.s, y: LIE.y }; // rotated -90° about the feet

type F = { z: number; x: number; y: number; rot?: number };
const shot = (t1: number, t2: number, a: F, b: F = a): CamKey[] => [
  { t: t1, ...a, cut: true },
  { t: t2 - 0.01, ...b },
];
const WIDE: F = { z: 1, x: 540, y: 960 };
const BEDWIDE: F = { z: 1.12, x: 520, y: 1130 };
const HEAD: F = { z: 2.0, x: LIE_HEAD.x + 60, y: LIE_HEAD.y - 60 };

const CAM: CamKey[] = [
  // ROOM, evening
  ...shot(0, S(1) - 0.05, { z: 1.75, x: bfx, y: bfy + 70 }, { z: 1.84, x: bfx, y: bfy + 70 }),
  ...shot(S(1) - 0.05, S(2) - 0.05, WIDE),
  ...shot(S(2) - 0.05, S(3) - 0.1, { z: 1.45, x: bfx - 20, y: bfy + 200 }, { z: 1.5, x: bfx - 20, y: bfy + 200 }),
  ...shot(S(3) - 0.1, S(4) - 0.05, { z: 1.62, x: bfx, y: bfy + 170 }, { z: 1.7, x: bfx, y: bfy + 170 }),
  ...shot(S(4) - 0.05, S(5) - 0.05, { z: 1.22, x: 620, y: 930, rot: -5 }, { z: 1.34, x: 640, y: 900, rot: -6 }),
  ...shot(S(5) - 0.05, S(6) - 0.3, WIDE),
  ...shot(S(6) - 0.3, CARD1[0], { z: 1.8, x: bfx, y: bfy + 90 }, { z: 1.9, x: bfx, y: bfy + 90 }),
  // 5:00 AM
  ...shot(CARD1[1], S(7) - 0.25, BEDWIDE, { z: 1.16, x: 520, y: 1130 }),
  ...shot(S(7) - 0.25, CARD2[0], HEAD, { ...HEAD, z: 2.12 }),
  // 5:01 AM
  ...shot(CARD2[1], S(8) - 0.2, BEDWIDE),
  ...shot(S(8) - 0.2, CARD3[0], { ...HEAD, z: 1.85 }, { ...HEAD, z: 1.95 }),
  // 2:47 PM
  ...shot(DAY, S(11) - 0.3, { z: 1.08, x: 520, y: 1000 }, { z: 1.1, x: 520, y: 1000 }),
  ...shot(S(11) - 0.3, S(12) - 0.05, { z: 1.3, x: cfx, y: cfy + 150 }, { z: 1.34, x: cfx, y: cfy + 150 }),
  ...shot(S(12) - 0.05, S(13) - 0.05, { z: 1.08, x: 520, y: 1000 }),
  ...shot(S(13) - 0.05, S(15) - 0.1, { z: 1.3, x: cfx, y: cfy + 150 }, { z: 1.36, x: cfx, y: cfy + 150 }),
  ...shot(S(15) - 0.1, SIG, { z: 1.9, x: dfx + 60, y: dfy + 90 }, { z: 2.02, x: dfx + 60, y: dfy + 90 }),
  // SIGNATURE
  { t: SIG, z: 1.6, x: cfx, y: cfy + 160, cut: true },
  { t: SIG + 0.9, z: 1.85, x: cfx, y: cfy + 120 },
  { t: TOTAL, z: 1.95, x: cfx, y: cfy + 120 },
];

const TEMPLE = { to: [-30, -245] as [number, number] };

const EveningRoom: React.FC<{ t: number }> = ({ t }) => {
  const phase =
    t < S(1) - 0.05 ? 'claim' : t < S(2) - 0.05 ? 'pm' : t < S(3) - 0.1 ? 'earlier' : t < S(4) - 0.05 ? 'catch' : t < S(5) - 0.05 ? 'millionaire' : t < S(6) - 0.3 ? 'name' : 'me';
  return (
    <>
      <Room night={0.35} poster="GRIND" />
      <Rays x={bfx} y={bfy} t={t} from={S(4) - 0.05} to={S(5) - 0.05} />
      <Toon
        spec={DEE}
        x={ROOM_DEE.x}
        y={ROOM_DEE.y}
        scale={ROOM_DEE.s}
        expr={phase === 'earlier' || phase === 'me' ? 'side-eye' : 'annoyed'}
        look={[0.7, 0]}
        mouth={lipSync(VO, 'dee', t)}
        armL="cross"
        armR={talking(VO, 'dee', t) ? 'shrug' : 'cross'}
      />
      <Toon
        spec={BRO}
        x={ROOM_BRO.x}
        y={ROOM_BRO.y}
        expr={phase === 'claim' || phase === 'pm' || phase === 'name' ? 'smug' : 'confident'}
        look={phase === 'pm' || phase === 'name' ? [-0.9, 0] : [0, 0]}
        mouth={lipSync(VO, 'bro', t)}
        armL="hip"
        armR={phase === 'earlier' || phase === 'catch' ? 'gun' : phase === 'millionaire' ? 'point-up' : phase === 'me' ? 'thumb' : 'hip'}
        tilt={phase === 'millionaire' ? -4 : phase === 'earlier' ? 5 : 0}
      />
      <Sparkles x={bfx + 40} y={bfy - 20} t={t} at={S(3) + 0.5} spread={190} />
    </>
  );
};

// Bro asleep. alarm: clock time + whether it's on the nightstand or (after the slap) on the floor
const NightBed: React.FC<{ t: number; time: string; ringFrom: number; ringTo: number; slapAt?: number; clockOnFloor?: boolean; awake?: [number, number] }> = ({
  t,
  time,
  ringFrom,
  ringTo,
  slapAt,
  clockOnFloor,
  awake,
}) => {
  const ring = t >= ringFrom && t < ringTo ? 1 : 0;
  const slapping = slapAt !== undefined && t >= slapAt - 0.12 && t < slapAt + 0.35;
  const knocked = slapAt !== undefined && t >= slapAt;
  const fall = knocked ? EASE_OUT(prog(t, slapAt!, slapAt! + 0.4)) : 0;
  // the clock: on the nightstand, or knocked (an arc) onto the floor where it stays, upright
  const STAND = { x: 95, y: 1230, r: 0 };
  const FLOOR = { x: 150, y: 1545, r: -12 };
  const k = clockOnFloor ? 1 : fall;
  const cx = STAND.x + (FLOOR.x - STAND.x) * k;
  const cy = STAND.y + (FLOOR.y - STAND.y) * k - Math.sin(k * Math.PI) * 120;
  const crot = clockOnFloor ? FLOOR.r : knocked ? (FLOOR.r - 360) * fall : 0; // one full spin on the way down
  const isAwake = awake && t >= awake[0] && t < awake[1];
  return (
    <>
      <Room night={1} poster="GRIND" />
      <Nightstand x={95} y={1460} />
      <Bed x={BED.x} y={BED.y} />
      <Toon
        spec={BRO}
        x={LIE.x}
        y={LIE.y}
        scale={LIE.s}
        lean={-90}
        shadow={false}
        expr={isAwake ? 'deadpan' : 'sleep'}
        look={[0, -0.6]}
        mouth={isAwake ? lipSync(VO, 'bro', t) : ring ? 0 : 0.25 + 0.15 * Math.sin(t * 3)}
        armR={slapping ? 'point-up' : 'cross'}
        armL="cross"
        blink={false}
      />
      <Blanket x={470} y={1248} w={545} />
      <g transform={`rotate(${crot} ${cx} ${cy - 55})`}>
        <AlarmClock x={cx} y={cy} time={time} ring={ring} t={t} scale={0.85} />
      </g>
      {!ring && !isAwake && <Zzz x={LIE_HEAD.x + 40} y={LIE_HEAD.y - 150} t={t} />}
    </>
  );
};

const DayRoom: React.FC<{ t: number }> = ({ t }) => {
  const sig = t >= SIG;
  const stretch = t < S(10) - 0.1;
  const brain = (t >= S(11) - 0.3 && t < S(12) - 0.05) || (t >= S(13) - 0.05 && t < S(15) - 0.1);
  const deeX = -260 + (DAY_DEE.x + 260) * prog(t, DEE_IN[0], DEE_IN[1]);
  const deeStunned = t >= S(15) - 0.1;
  return (
    <>
      <Room poster="GRIND" />
      <Nightstand x={95} y={1460} />
      <Bed x={BED.x} y={BED.y} />
      <Blanket x={470} y={1248} w={545} />
      <g transform="rotate(-12 150 1490)">
        <AlarmClock x={150} y={1545} time="2:47" scale={0.85} />
      </g>
      <Toon
        spec={BRO}
        x={SIT_BRO.x}
        y={SIT_BRO.y}
        legs="sit"
        expr={sig ? 'deadpan' : stretch ? 'happy' : brain ? 'smug' : t >= S(10) ? 'neutral' : 'confident'}
        look={sig || brain ? [0, 0] : [-0.7, 0]}
        mouth={lipSync(VO, 'bro', t)}
        armL={stretch ? 'point-up' : brain ? TEMPLE : sig ? 'cross' : 'hip'}
        armR={stretch ? 'point-up' : sig ? 'cross' : 'hip'}
        handL={brain ? 'point' : stretch ? 'open' : undefined}
        handR={stretch ? 'open' : undefined}
        tilt={stretch ? -6 : brain ? 4 : 0}
      />
      <Toon
        spec={DEE}
        x={deeX}
        y={DAY_DEE.y}
        scale={DAY_DEE.s}
        expr={deeStunned ? 'shock' : 'annoyed'}
        look={deeStunned ? [0, 0] : [0.8, 0]}
        mouth={lipSync(VO, 'dee', t)}
        legs={t >= DEE_IN[0] && t < DEE_IN[1] ? 'walk' : 'stand'}
        walk={t * 1.8}
        armL="cross"
        armR={t >= S(12) && t < E(12) + 0.1 ? 'point' : talking(VO, 'dee', t) ? 'shrug' : 'cross'}
        sweat={deeStunned}
      />
      <BroMath
        x={cfx}
        y={cfy}
        t={t}
        to={S(12) - 0.05}
        size={38}
        lines={[
          { text: '3:00 - 2:47', dx: -280, dy: -130, at: S(11) + 0.7, rot: -6 },
          { text: '= 13 MIN', dx: 300, dy: -60, at: S(11) + 1.3, rot: 5 },
          { text: 'EARLIER!', dx: 0, dy: 235, at: S(11) + 1.8, rot: -4, color: '#ffd23f' },
        ]}
      />
      <BroMath
        x={cfx}
        y={cfy}
        t={t}
        to={S(15) - 0.1}
        size={38}
        lines={[
          { text: '13 MIN / DAY', dx: -275, dy: -140, at: S(13) + 0.15, rot: -5 },
          { text: '2:47 → 5:00', dx: 290, dy: -90, at: S(14) + 0.1, rot: 6 },
          { text: '= 587 MIN', dx: -290, dy: 40, at: S(14) + 0.7, rot: 4 },
          { text: '÷ 13 = 45 DAYS', dx: 0, dy: 235, at: S(14) + 1.3, rot: -3, color: '#ffd23f' },
        ]}
      />
    </>
  );
};

export default function Bro025am() {
  const t = useT();
  const cam = camAt(t, CAM);
  const shake = [shakeAt(t, S(3) - 0.1, 16), shakeAt(t, SLAP, 14), shakeAt(t, S(15) - 0.1, 9)].reduce(
    (a, b) => [a[0] + b[0], a[1] + b[1]] as [number, number],
    [0, 0] as [number, number],
  );
  const cards: [number, number][] = [CARD1, CARD2, CARD3];
  const inCard = cards.some(([a, b]) => t >= a && t < b);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {!inCard && (
        <Stage cam={cam} shake={shake} filter={signatureFilter(t, SIG)}>
          {t < CARD1[0] && <EveningRoom t={t} />}
          {t >= CARD1[1] && t < CARD2[0] && (
            <NightBed t={t} time="5:00" ringFrom={CARD1[1]} ringTo={SLAP} slapAt={SLAP} awake={[S(7) - 0.25, CARD2[0]]} />
          )}
          {t >= CARD2[1] && t < CARD3[0] && <NightBed t={t} time="5:01" ringFrom={CARD2[1]} ringTo={CARD3[0]} clockOnFloor />}
          {t >= DAY && <DayRoom t={t} />}
        </Stage>
      )}
      <TimeCard from={CARD1[0]} to={CARD1[1]} text="5:00 AM" bg="#1d2a52" ray="#26386e" />
      <TimeCard from={CARD2[0]} to={CARD2[1]} text="5:01 AM" bg="#1d2a52" ray="#26386e" />
      <TimeCard from={CARD3[0]} to={CARD3[1]} text="2:47 PM" />
      <Flash at={DAY} dur={0.12} />
      <Cut from={0} to={SIG}>
        <TitleBar title="Bro said he'd wake up at 5AM" series={SERIES.name} ep={2} accent={SERIES.accent} />
      </Cut>
      <SignatureStamp at={SIG} stampAt={S(16) + 0.25} text="I GOT THIS." accent={SERIES.accent} />
      {!inCard && t < SIG && <DialogueCaptions lines={VO} colors={SPEAKER_COLORS} y={1385} />}
    </AbsoluteFill>
  );
}
