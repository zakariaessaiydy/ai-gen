// BRO THINKS HE'S HIM · EP 7 — "Bro went on a diet"
// toon-shorts/bro/ep-07-diet. Every cue derives from the VO line times (S(i)/E(i)).
// Kitchen: "yesterday was practice" · ONE celery stick · 4 MINUTES LATER (dying on the floor) ·
// 3:00 AM by the fridge light: ketchup packets · lights on · "vegetables. technically." ·
// bro math (40 tomatoes = salad) · "Tomorrow I start my diet. Today was practice."
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Toon, faceAt, type ArmPose } from '../../lib/toon/rig';
import { BRO, DEE, SERIES, SPEAKER_COLORS } from '../../lib/toon/series/bro';
import { Celery, Counter, FridgeGlow, KetchupFace, KetchupPacket, KetchupPile, Kitchen, LightSwitch } from '../../lib/toon/sets';
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
  id: 'Bro07Diet',
  durationInSeconds: 35.8,
  fps: 30,
  width: 1080,
  height: 1920,
};

// 0 on a diet · 1 said that yesterday · 2 yesterday was practice · 3 trust me · 4 just... this ·
// 5 tell my mom · 6 four minutes · 7 four years · 8 Bro. · 9 vegetables, technically ·
// 10 forty packets · 11 basically a salad · 12 today was practice · 13 I got this
const S = (i: number) => VO[i].start;
const E = (i: number) => VO[i].end;

const CRUNCH = E(4) - 0.05;
const CARD1: [number, number] = [E(4) + 0.5, E(4) + 1.8];
const CARD2: [number, number] = [E(7) + 0.5, E(7) + 1.8];
const NIGHT = CARD2[1];
const LIGHTS = S(8) - 0.3;
const STARE = S(12) - 0.45;
const SIG = E(12) + 0.6;
const TOTAL = compositionConfig.durationInSeconds;

const DAY_BRO = { x: 470, y: 1500 };
const DAY_DEE = { x: 900, y: 1500, s: 0.95 };
const LIE = { x: 1010, y: 1640, s: 0.85 }; // feet of the collapsed Bro (head ends up at the left)
const LIE_HEAD = { x: LIE.x - 790 * LIE.s, y: LIE.y };
const STAND_DEE = { x: 560, y: 1480, s: 0.95 };
const NIGHT_BRO = { x: 700, y: 1500 };
const DOOR_DEE = { x: 190, y: 1490, s: 0.95 };
const SWITCH = { x: 330, y: 980 };

const [bfx, bfy] = faceAt(DAY_BRO.x, DAY_BRO.y);
const [nfx, nfy] = faceAt(NIGHT_BRO.x, NIGHT_BRO.y);

type F = { z: number; x: number; y: number; rot?: number };
const shot = (t1: number, t2: number, a: F, b: F = a): CamKey[] => [
  { t: t1, ...a, cut: true },
  { t: t2 - 0.01, ...b },
];
const WIDE: F = { z: 1, x: 540, y: 960 };

const CAM: CamKey[] = [
  ...shot(0, S(1) - 0.05, { z: 1.75, x: bfx, y: bfy + 70 }, { z: 1.84, x: bfx, y: bfy + 70 }),
  ...shot(S(1) - 0.05, S(2) - 0.05, WIDE),
  ...shot(S(2) - 0.05, S(3) - 0.1, { z: 1.45, x: bfx + 20, y: bfy + 200 }, { z: 1.5, x: bfx + 20, y: bfy + 200 }),
  ...shot(S(3) - 0.1, S(4) - 0.05, { z: 1.62, x: bfx, y: bfy + 170 }, { z: 1.7, x: bfx, y: bfy + 170 }),
  ...shot(S(4) - 0.05, CARD1[0], { z: 1.25, x: bfx + 40, y: bfy + 220, rot: -4 }, { z: 1.35, x: bfx + 40, y: bfy + 200, rot: -5 }),
  // 4 MINUTES LATER
  ...shot(CARD1[1], S(6) - 0.05, { z: 1.7, x: LIE_HEAD.x + 120, y: LIE_HEAD.y - 140 }, { z: 1.8, x: LIE_HEAD.x + 120, y: LIE_HEAD.y - 140 }),
  ...shot(S(6) - 0.05, S(7) - 0.1, { z: 1.05, x: 600, y: 1200 }),
  ...shot(S(7) - 0.1, CARD2[0], { z: 1.9, x: LIE_HEAD.x + 100, y: LIE_HEAD.y - 100 }),
  // 3:00 AM
  ...shot(NIGHT, LIGHTS, { z: 1.15, x: 640, y: 1150 }, { z: 1.3, x: nfx, y: nfy + 220 }),
  ...shot(LIGHTS, S(9) - 0.1, WIDE),
  ...shot(S(9) - 0.1, S(10) - 0.05, { z: 1.7, x: nfx, y: nfy + 100 }, { z: 1.78, x: nfx, y: nfy + 100 }),
  ...shot(S(10) - 0.05, S(11) - 0.1, WIDE),
  ...shot(S(11) - 0.1, STARE, { z: 1.2, x: nfx, y: nfy + 160 }, { z: 1.26, x: nfx, y: nfy + 160 }),
  ...shot(STARE, SIG, { z: 2.0, x: nfx, y: nfy + 80 }, { z: 2.15, x: nfx, y: nfy + 80 }),
  { t: SIG, z: 1.6, x: nfx, y: nfy + 160, cut: true },
  { t: SIG + 0.9, z: 1.85, x: nfx, y: nfy + 120 },
  { t: TOTAL, z: 1.95, x: nfx, y: nfy + 120 },
];

export default function Bro07Diet() {
  const t = useT();
  const cam = camAt(t, CAM);
  const shake = [shakeAt(t, S(3) - 0.1, 16), shakeAt(t, CRUNCH, 8), shakeAt(t, LIGHTS, 12), shakeAt(t, STARE, 10)].reduce(
    (a, b) => [a[0] + b[0], a[1] + b[1]] as [number, number],
    [0, 0] as [number, number],
  );
  const cards: [number, number][] = [CARD1, CARD2];
  const inCard = cards.some(([a, b]) => t >= a && t < b);
  const day = t < CARD1[0];
  const collapsed = t >= CARD1[1] && t < CARD2[0];
  const night = t >= NIGHT;
  const dark = night && t < LIGHTS;

  // DAY phases
  const dp = t < S(1) - 0.05 ? 'claim' : t < S(2) - 0.05 ? 'yesterday' : t < S(3) - 0.1 ? 'practice' : t < S(4) - 0.05 ? 'catch' : 'celery';
  const bite = t >= CRUNCH ? 1 : 0;

  // NIGHT phases
  const squeezing = night && t < LIGHTS;
  const frozen = t >= LIGHTS && t < S(9) - 0.1;
  const math = t >= S(11) - 0.1 && t < STARE;
  const tag = t >= STARE && t < SIG;
  const sig = t >= SIG;
  const pileN = night ? 3 + 37 * prog(t, NIGHT + 0.2, LIGHTS - 0.2) : 0;
  const nightArmR: ArmPose = squeezing || frozen ? 'drink' : math ? 'hip' : tag || sig ? 'cross' : 'hold';
  const TEMPLE: ArmPose = { to: [-30, -245] };

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {!inCard && (
        <Stage cam={cam} shake={shake} filter={signatureFilter(t, SIG)}>
          <Kitchen fridgeOpen={night} />
          <Counter />
          {day && (
            <>
              <Rays x={bfx} y={bfy + 40} t={t} from={S(4) - 0.05} to={CARD1[0]} />
              <Toon
                spec={DEE}
                x={DAY_DEE.x}
                y={DAY_DEE.y}
                scale={DAY_DEE.s}
                expr={dp === 'practice' || dp === 'celery' ? 'side-eye' : 'annoyed'}
                look={[-0.8, 0]}
                mouth={lipSync(VO, 'dee', t)}
                armL="cross"
                armR={talking(VO, 'dee', t) ? 'shrug' : 'cross'}
              />
              <Toon
                spec={BRO}
                x={DAY_BRO.x}
                y={DAY_BRO.y}
                expr={dp === 'celery' ? (bite ? 'happy' : 'confident') : dp === 'catch' ? 'confident' : 'smug'}
                look={dp === 'yesterday' ? [0.9, 0] : [0, 0]}
                mouth={t >= CRUNCH && t < CRUNCH + 0.4 ? 0.5 + 0.5 * Math.abs(Math.sin(t * 30)) : lipSync(VO, 'bro', t)}
                armL={dp === 'practice' || dp === 'catch' ? 'gun' : 'hip'}
                armR={dp === 'celery' ? 'point-up' : 'hold'}
                handR="fist"
                holdR={<Celery bite={bite} />}
                tilt={dp === 'practice' ? 5 : dp === 'celery' ? -4 : 0}
              />
              <Sparkles x={bfx + 40} y={bfy - 20} t={t} at={S(3) + 0.5} spread={190} />
              <Sparkles x={bfx + 200} y={bfy - 150} t={t} at={S(4) + 1.2} spread={110} color="#b7e4c7" />
            </>
          )}
          {collapsed && (
            <>
              <Toon
                spec={DEE}
                x={STAND_DEE.x}
                y={STAND_DEE.y}
                scale={STAND_DEE.s}
                expr="annoyed"
                look={[-0.4, 0.8]}
                mouth={lipSync(VO, 'dee', t)}
                armL="cross"
                armR={talking(VO, 'dee', t) ? 'shrug' : 'cross'}
              />
              <g transform={`translate(${LIE_HEAD.x + 60},${LIE.y + 120}) rotate(70)`}>
                <Celery bite={1} />
              </g>
              <Toon
                spec={BRO}
                x={LIE.x}
                y={LIE.y}
                scale={LIE.s}
                lean={-90}
                shadow={false}
                expr="sad"
                look={[0, -0.8]}
                mouth={lipSync(VO, 'bro', t)}
                armR={{ a: 92 + Math.sin(t * 3) * 6, b: 8 }}
                handR="open"
                armL="down"
              />
            </>
          )}
          {night && (
            <>
              {dark && (
                <>
                  <defs>
                    <mask id="fridge-light">
                      <rect x={0} y={0} width={1080} height={1920} fill="#ffffff" />
                      <rect x={815} y={655} width={230} height={790} fill="#000000" />
                      <path d="M 815,660 L 220,1460 L 220,1920 L 1080,1920 L 1045,1450 Z" fill="#555555" />
                    </mask>
                  </defs>
                  <rect x={0} y={0} width={1080} height={1920} fill="#06091a" opacity={0.88} mask="url(#fridge-light)" />
                  <FridgeGlow />
                </>
              )}
              {t >= LIGHTS && (
                <>
                  <LightSwitch x={SWITCH.x} y={SWITCH.y} on />
                  <Toon
                    spec={DEE}
                    x={DOOR_DEE.x}
                    y={DOOR_DEE.y}
                    scale={DOOR_DEE.s}
                    expr={t < S(9) ? 'annoyed' : t >= S(12) - 0.45 ? 'side-eye' : 'annoyed'}
                    look={[0.9, 0]}
                    mouth={lipSync(VO, 'dee', t)}
                    armL="cross"
                    armR={t < S(9) ? 'point' : talking(VO, 'dee', t) ? 'shrug' : 'cross'}
                  />
                </>
              )}
              <KetchupPile x={NIGHT_BRO.x} y={NIGHT_BRO.y + 30} n={pileN} />
              <Toon
                spec={BRO}
                x={NIGHT_BRO.x}
                y={NIGHT_BRO.y}
                expr={squeezing ? 'happy' : frozen ? 'shock' : tag || sig ? 'deadpan' : math ? 'smug' : 'smug'}
                look={frozen ? [-1, 0] : [0, 0]}
                mouth={squeezing ? 0.3 + 0.3 * Math.abs(Math.sin(t * 9)) : lipSync(VO, 'bro', t)}
                armR={nightArmR}
                holdR={!tag && !sig && !math ? <KetchupPacket squeezed={squeezing ? Math.abs(Math.sin(t * 6)) : 0.6} /> : undefined}
                holdRotR={squeezing || frozen ? -60 : 0}
                armL={math ? TEMPLE : tag || sig ? 'cross' : 'hip'}
                handL={math ? 'point' : undefined}
                sweat={frozen}
              />
              {t >= NIGHT + 0.6 && <KetchupFace x={nfx} y={nfy} />}
              <BroMath
                x={nfx}
                y={nfy}
                t={t}
                to={STARE}
                size={38}
                lines={[
                  { text: '1 PACKET', dx: -290, dy: -130, at: S(11) + 0.1, rot: -6 },
                  { text: '= 1 TOMATO', dx: 250, dy: -150, at: S(11) + 0.6, rot: 5 },
                  { text: '× 40', dx: -300, dy: 50, at: S(11) + 1.0, rot: 4 },
                  { text: '= SALAD', dx: 0, dy: 240, at: S(11) + 1.6, rot: -3, color: '#80ed99' },
                ]}
              />
              <Sparkles x={nfx} y={nfy + 240} t={t} at={S(11) + 1.6} spread={160} color="#b7e4c7" />
            </>
          )}
        </Stage>
      )}
      <TimeCard from={CARD1[0]} to={CARD1[1]} text="4 MINUTES LATER" />
      <TimeCard from={CARD2[0]} to={CARD2[1]} text="3:00 AM" bg="#1d2a52" ray="#26386e" />
      <Flash at={LIGHTS} dur={0.15} />
      <Cut from={0} to={SIG}>
        <TitleBar title="Bro went on a diet" series={SERIES.name} ep={7} accent={SERIES.accent} />
      </Cut>
      <SignatureStamp at={SIG} stampAt={S(13) + 0.25} text="I GOT THIS." accent={SERIES.accent} />
      {!inCard && t < SIG && <DialogueCaptions lines={VO} colors={SPEAKER_COLORS} y={1385} />}
    </AbsoluteFill>
  );
}
