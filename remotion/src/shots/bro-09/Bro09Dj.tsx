// BRO THINKS HE'S HIM · EP 9 — "Bro tried to be the DJ"
// toon-shorts/bro/ep-09-dj. Every cue derives from the VO line times (S(i)/E(i)).
// Party room: "I am the music" · make some noise → crickets · drop the beat → the laptop's
// STARTUP CHIME · the drop → LOW BATTERY · everyone leaves, the last guest kills the lights ·
// "Private event." · "...I am the music." · "Boots and cats and boots and cats."
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Toon, faceAt, type ArmPose, type Expr } from '../../lib/toon/rig';
import { BRO, DEE, extra, SERIES, SPEAKER_COLORS } from '../../lib/toon/series/bro';
import { DJBooth, DJ_BUTTON, PARTY_SWITCH, PartyRoom } from '../../lib/toon/sets';
import {
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
import { prog } from '../../lib/shorts';
import { VO } from './vo.gen';

export const compositionConfig = {
  id: 'Bro09Dj',
  durationInSeconds: 34.7,
  fps: 30,
  width: 1080,
  height: 1920,
};

// party guests — episode extras
const G1 = extra('guest1', { hair: 'bun', hairColor: '#5e2b0b', skin: '#e0ac69', top: 'tank', topColor: '#06d6a0', topShade: '#05a57c', pants: '#22223b', lashes: true, bodyW: 0.92 });
const G2 = extra('guest2', { hair: 'curly', hairColor: '#e85d04', skin: '#f1c9a5', top: 'tee', topColor: '#ff006e', topShade: '#c9005a', pants: '#3a5a8c', beard: 'none' });
const G3 = extra('guest3', { hair: 'short', hairColor: '#1b1310', skin: '#8d5a3b', top: 'hoodie', topColor: '#ffbe0b', topShade: '#e09f00', pants: '#2b2d42', beard: 'goatee' });

// 0 I'm the DJ · 1 no music · 2 I am the music · 3 trust me · 4 make some noise · 5 take that as a yes ·
// 6 drop the beat · 7 that was the intro · 8 here comes the drop · 9 everyone left · 10 private event ·
// 11 just us, no music · 12 I am the music · 13 boots and cats · 14 I got this
const S = (i: number) => VO[i].start;
const E = (i: number) => VO[i].end;

const SILENCE: [number, number] = [E(4) + 0.1, S(5) - 0.1];
const PRESS1 = S(6) + 0.45;
const CHIME = PRESS1 + 0.1;
const PRESS2 = E(8) + 0.05;
const BATTERY: [number, number] = [E(8) + 0.15, E(8) + 1.5];
const DIE = E(8) + 0.9;
const LEAVE0 = DIE + 0.4;
const SWITCH_AT = LEAVE0 + 2.3;
const STARE: [number, number] = [S(10) - 0.45, S(11) - 0.05];
const SIG = E(13) + 0.6;
const TOTAL = compositionConfig.durationInSeconds;

const BOOTH = { x: 560, y: 1180 };
const BRO_AT = { x: 560, y: 1490 };
const DEE_AT = { x: 150, y: 1520, s: 0.95 };
const GUESTS = [
  { spec: G1, x: 880, y: 1650, s: 0.82, out: [LEAVE0 + 1.2, LEAVE0 + 3.0] as [number, number] },
  { spec: G2, x: 1000, y: 1620, s: 0.8, out: [LEAVE0 + 0.6, LEAVE0 + 1.5] as [number, number] },
  { spec: G3, x: 1110, y: 1680, s: 0.86, out: [LEAVE0, LEAVE0 + 0.8] as [number, number] },
];

const [bfx, bfy] = faceAt(BRO_AT.x, BRO_AT.y);

type F = { z: number; x: number; y: number; rot?: number };
const shot = (t1: number, t2: number, a: F, b: F = a): CamKey[] => [
  { t: t1, ...a, cut: true },
  { t: t2 - 0.01, ...b },
];
const WIDE: F = { z: 1, x: 540, y: 960 };
const CU: F = { z: 1.75, x: bfx, y: bfy + 90 };

const CAM: CamKey[] = [
  ...shot(0, S(1) - 0.05, { z: 1.75, x: bfx, y: bfy + 70 }, { z: 1.84, x: bfx, y: bfy + 70 }),
  ...shot(S(1) - 0.05, S(2) - 0.05, WIDE),
  ...shot(S(2) - 0.05, S(3) - 0.1, { z: 1.45, x: bfx, y: bfy + 200 }, { z: 1.5, x: bfx, y: bfy + 200 }),
  ...shot(S(3) - 0.1, S(4) - 0.05, { z: 1.62, x: bfx, y: bfy + 170 }, { z: 1.7, x: bfx, y: bfy + 170 }),
  ...shot(S(4) - 0.05, SILENCE[0], { z: 1.15, x: 560, y: 1000, rot: -3 }),
  ...shot(SILENCE[0], S(5) - 0.1, WIDE, { z: 1.06, x: 580, y: 980 }),
  ...shot(S(5) - 0.1, S(6) - 0.05, CU),
  ...shot(S(6) - 0.05, S(7) - 0.1, { z: 1.1, x: 600, y: 1000 }),
  ...shot(S(7) - 0.1, S(8) - 0.05, CU),
  ...shot(S(8) - 0.05, LEAVE0, { z: 1.15, x: 560, y: 1000 }),
  ...shot(LEAVE0, S(9) - 0.1, WIDE, { z: 1.04, x: 600, y: 980 }),
  ...shot(S(9) - 0.1, STARE[0], WIDE),
  ...shot(STARE[0], STARE[1], { z: 2.05, x: bfx, y: bfy + 70 }, { z: 2.2, x: bfx, y: bfy + 70 }),
  ...shot(S(11) - 0.05, S(12) - 0.1, { z: 1.3, x: 330, y: 1060 }),
  ...shot(S(12) - 0.1, SIG, { z: 1.6, x: bfx, y: bfy + 120 }, { z: 1.7, x: bfx, y: bfy + 120 }),
  { t: SIG, z: 1.6, x: bfx, y: bfy + 160, cut: true },
  { t: SIG + 0.9, z: 1.85, x: bfx, y: bfy + 120 },
  { t: TOTAL, z: 1.95, x: bfx, y: bfy + 120 },
];

const BUTTON_REACH: ArmPose = { to: [-(DJ_BUTTON[0] - (BRO_AT.x + 116)), DJ_BUTTON[1] - (BRO_AT.y - 590)] };

export default function Bro09Dj() {
  const t = useT();
  const cam = camAt(t, CAM);
  const shake = [shakeAt(t, S(3) - 0.1, 16), shakeAt(t, PRESS1, 10), shakeAt(t, DIE, 12), shakeAt(t, STARE[0], 10)].reduce(
    (a, b) => [a[0] + b[0], a[1] + b[1]] as [number, number],
    [0, 0] as [number, number],
  );
  const party = t < SWITCH_AT;
  const laptopOn = t < DIE;
  const pressing = (t >= PRESS1 - 0.15 && t < PRESS1 + 0.25) || (t >= PRESS2 - 0.15 && t < PRESS2 + 0.25);
  const beatbox = t >= S(13) && t < SIG;

  const bp =
    t < S(1) - 0.05 ? 'dj'
    : t < S(2) - 0.05 ? 'nomusic'
    : t < S(3) - 0.1 ? 'iam'
    : t < S(4) - 0.05 ? 'catch'
    : t < SILENCE[0] ? 'noise'
    : t < S(5) - 0.1 ? 'silence'
    : t < S(6) - 0.05 ? 'yes'
    : t < S(7) - 0.1 ? 'beat'
    : t < S(8) - 0.05 ? 'intro'
    : t < DIE ? 'drop'
    : t < S(9) - 0.1 ? 'leaving'
    : t < STARE[0] ? 'left'
    : t < STARE[1] ? 'stare'
    : t < S(12) - 0.1 ? 'nomusic2'
    : t < S(13) ? 'iam2'
    : t < SIG ? 'beatbox'
    : 'sig';
  const broExpr: Expr =
    bp === 'stare' || bp === 'sig' || bp === 'iam2' || beatbox ? 'deadpan'
    : bp === 'silence' ? 'neutral'
    : bp === 'leaving' ? 'shock'
    : bp === 'dj' || bp === 'nomusic' || bp === 'yes' || bp === 'intro' ? 'smug'
    : 'confident';
  const broArmR: ArmPose =
    pressing ? BUTTON_REACH
    : bp === 'noise' || bp === 'silence' ? 'point-up'
    : bp === 'iam' ? 'thumb'
    : bp === 'catch' ? 'gun'
    : bp === 'drop' ? 'point-up'
    : beatbox ? { a: 40 + Math.sin(t * 12) * 10, b: -100 }
    : bp === 'stare' || bp === 'sig' || bp === 'iam2' ? 'cross'
    : bp === 'leaving' ? 'shrug'
    : 'hip';
  const broArmL: ArmPose =
    bp === 'noise' || bp === 'silence' ? 'point-up'
    : bp === 'stare' || bp === 'sig' || bp === 'iam2' ? 'cross'
    : bp === 'leaving' ? 'shrug'
    : beatbox ? { a: 40 - Math.sin(t * 12) * 10, b: -100 }
    : 'hip';

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Stage cam={cam} shake={shake} filter={signatureFilter(t, SIG)}>
        <PartyRoom t={t} party={party} />
        <Rays x={bfx} y={bfy + 60} t={t} from={S(4) - 0.05} to={SILENCE[0]} />
        <Toon
          spec={BRO}
          x={BRO_AT.x}
          y={BRO_AT.y}
          expr={broExpr}
          look={bp === 'nomusic' || bp === 'nomusic2' ? [-0.9, 0] : bp === 'leaving' ? [1, 0] : [0, 0]}
          mouth={lipSync(VO, 'bro', t)}
          armL={broArmL}
          armR={broArmR}
          sweat={bp === 'leaving' || bp === 'silence'}
          tilt={beatbox ? Math.sin(t * 12) * 7 : bp === 'iam' ? -4 : 0}
        />
        <DJBooth x={BOOTH.x} y={BOOTH.y} t={t} laptopOn={laptopOn} pressed={pressing} />
        <Toon
          spec={DEE}
          x={DEE_AT.x}
          y={DEE_AT.y}
          scale={DEE_AT.s}
          expr={bp === 'beatbox' ? 'side-eye' : 'annoyed'}
          look={[0.8, 0]}
          mouth={lipSync(VO, 'dee', t)}
          armL={talking(VO, 'dee', t) ? 'shrug' : 'cross'}
          armR="cross"
        />
        {GUESTS.map((g, i) => {
          if (t >= g.out[1]) return null;
          const walking = t >= g.out[0];
          const isLast = i === 0;
          const stopX = PARTY_SWITCH[0] - 30;
          // the last guest walks to the switch, kills the lights, then leaves
          const x = !walking
            ? g.x
            : isLast
              ? t < SWITCH_AT
                ? g.x + (stopX - g.x) * prog(t, g.out[0], SWITCH_AT - 0.15)
                : stopX + 400 * prog(t, SWITCH_AT + 0.25, g.out[1])
              : g.x + 450 * prog(t, g.out[0], g.out[1]);
          const reaching = isLast && t >= SWITCH_AT - 0.2 && t < SWITCH_AT + 0.25;
          const lookAtEachOther = t >= CHIME && t < S(7) - 0.1;
          return (
            <Toon
              key={i}
              spec={g.spec}
              x={x}
              y={g.y}
              scale={g.s}
              expr={t >= DIE ? 'annoyed' : bp === 'silence' ? 'neutral' : lookAtEachOther ? 'side-eye' : 'neutral'}
              look={lookAtEachOther ? [i % 2 ? -1 : 1, 0] : [-0.9, 0]}
              legs={walking && !reaching ? 'walk' : 'stand'}
              walk={t * 1.8}
              armL="down"
              armR={reaching ? 'point-up' : 'down'}
              blink
            />
          );
        })}
        <Sparkles x={bfx + 40} y={bfy - 20} t={t} at={S(3) + 0.5} spread={190} />
      </Stage>
      <Notification at={BATTERY[0]} until={BATTERY[1]} app="BATTERY" title="LOW BATTERY 1%" body="Shutting down..." color="#ff3b30" />
      <Cut from={0} to={SIG}>
        <TitleBar title="Bro tried to be the DJ" series={SERIES.name} ep={9} accent={SERIES.accent} />
      </Cut>
      <SignatureStamp at={SIG} stampAt={S(14) + 0.25} text="I GOT THIS." accent={SERIES.accent} />
      {t < SIG && <DialogueCaptions lines={VO} colors={SPEAKER_COLORS} y={1385} />}
    </AbsoluteFill>
  );
}
