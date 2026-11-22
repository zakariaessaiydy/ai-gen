// BRO THINKS HE'S HIM · EP 4 — "Bro thinks he can cook"
// toon-shorts/bro/ep-04-cook. Every cue derives from the VO line times (S(i)/E(i)).
// Kitchen: the claim · the dial insert (snaps off) · smoke + alarm · FWOOSH · slow-mo action walk ·
// "...Experienced." · pizza at the door · bro math · "Free sauna." · SIGNATURE.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Toon, faceAt, type ArmPose } from '../../lib/toon/rig';
import { BRO, DEE, extra, SERIES, SPEAKER_COLORS } from '../../lib/toon/series/bro';
import { Counter, Flames, Kitchen, Pan, Phone, PizzaBox, STOVE_DIAL, Smoke } from '../../lib/toon/sets';
import {
  BroMath,
  Cut,
  DialogueCaptions,
  Flash,
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
  id: 'Bro04Cook',
  durationInSeconds: 38,
  fps: 30,
  width: 1080,
  height: 1920,
};

const DELIVERY = extra('delivery', {
  hair: 'short',
  hairColor: '#1b1310',
  skin: '#a46a45',
  skinShade: '#7f4f31',
  top: 'tee',
  topColor: '#ffb703',
  topShade: '#e09f00',
  pants: '#264653',
  beard: 'stubble',
});
const COLORS = { ...SPEAKER_COLORS, delivery: '#ffb703' };

// 0 five-star dinner · 1 burned cereal · 2 experienced with fire · 3 trust me · 4 three hours ·
// 5 turn it up · 6 the alarm! · 7 cheering for me · 8 ...Experienced. · 9 pizza for Bro? ·
// 10 you ordered pizza? · 11 before I started · 12 bro math · 13 burned the kitchen · 14 free sauna ·
// 15 I got this
const S = (i: number) => VO[i].start;
const E = (i: number) => VO[i].end;

const DIAL: [number, number] = [E(5) + 0.1, E(5) + 1.45]; // the insert shot
const TURN: [number, number] = [DIAL[0] + 0.1, DIAL[0] + 0.85];
const SNAP = DIAL[0] + 1.1;
const SMOKE0 = DIAL[1];
const BEEP0 = SMOKE0 + 0.6;
const FWOOSH = E(7) + 0.4;
const ACTION: [number, number] = [FWOOSH + 0.5, S(8) - 0.45];
const STARE: [number, number] = [S(8) - 0.45, E(8) + 0.5];
const DING = STARE[1];
const DOOR: [number, number] = [DING + 0.35, DING + 0.75];
const HANDOFF = S(11) - 0.3;
const DELIVERY_OUT: [number, number] = [E(11) + 0.2, E(11) + 1.0];
const SIG = E(14) + 0.6;
const TOTAL = compositionConfig.durationInSeconds;

const COOK = { x: 445, y: 1490 }; // behind the counter, at the stove
const DEE_AT = { x: 900, y: 1500, s: 0.95 };
const FRONT = { x: 560, y: 1500 }; // after the fire he's in front of the counter
const DOOR_GUY = { x: 150, y: 1490, s: 0.95 };
const WALK_FROM = { x: 540, y: 1420, s: 0.95 };
const WALK_TO = { x: 540, y: 1640, s: 1.25 };

const [bfx, bfy] = faceAt(COOK.x, COOK.y);
const [pfx, pfy] = faceAt(FRONT.x, FRONT.y);
const [afx, afy] = faceAt(WALK_TO.x, WALK_TO.y, WALK_TO.s);

type F = { z: number; x: number; y: number; rot?: number };
const shot = (t1: number, t2: number, a: F, b: F = a): CamKey[] => [
  { t: t1, ...a, cut: true },
  { t: t2 - 0.01, ...b },
];
const WIDE: F = { z: 1, x: 540, y: 960 };

const CAM: CamKey[] = [
  ...shot(0, S(1) - 0.05, { z: 1.75, x: bfx, y: bfy + 70 }, { z: 1.84, x: bfx, y: bfy + 70 }),
  ...shot(S(1) - 0.05, S(2) - 0.05, WIDE),
  ...shot(S(2) - 0.05, S(3) - 0.1, { z: 1.45, x: bfx + 30, y: bfy + 200 }, { z: 1.5, x: bfx + 30, y: bfy + 200 }),
  ...shot(S(3) - 0.1, S(4) - 0.05, { z: 1.62, x: bfx, y: bfy + 170 }, { z: 1.7, x: bfx, y: bfy + 170 }),
  ...shot(S(4) - 0.05, DIAL[0], { z: 1.5, x: bfx, y: bfy + 250 }, { z: 1.56, x: bfx, y: bfy + 250 }),
  ...shot(DIAL[0], DIAL[1], { z: 4.2, x: STOVE_DIAL[0], y: STOVE_DIAL[1] - 10 }, { z: 4.5, x: STOVE_DIAL[0], y: STOVE_DIAL[1] - 10 }),
  ...shot(DIAL[1], S(7) - 0.1, WIDE, { z: 1.05, x: 560, y: 960 }),
  ...shot(S(7) - 0.1, FWOOSH, { z: 1.5, x: bfx, y: bfy + 200 }),
  ...shot(FWOOSH, ACTION[0], WIDE),
  ...shot(ACTION[0], ACTION[1], { z: 1.05, x: 540, y: 1150 }, { z: 1.15, x: 540, y: 1180 }),
  ...shot(STARE[0], STARE[1], { z: 1.7, x: afx, y: afy + 90 }, { z: 1.82, x: afx, y: afy + 90 }),
  ...shot(DING, HANDOFF, WIDE),
  ...shot(HANDOFF, S(12) - 0.2, { z: 1.3, x: 420, y: 1010 }),
  ...shot(S(12) - 0.2, S(13) - 0.05, { z: 1.2, x: pfx, y: pfy + 160 }, { z: 1.26, x: pfx, y: pfy + 160 }),
  ...shot(S(13) - 0.05, S(14) - 0.2, WIDE),
  ...shot(S(14) - 0.2, SIG, { z: 1.6, x: pfx, y: pfy + 120 }, { z: 1.7, x: pfx, y: pfy + 120 }),
  { t: SIG, z: 1.6, x: pfx, y: pfy + 160, cut: true },
  { t: SIG + 0.9, z: 1.85, x: pfx, y: pfy + 120 },
  { t: TOTAL, z: 1.95, x: pfx, y: pfy + 120 },
];

const TEMPLE: ArmPose = { to: [-30, -245] };

// the knob: sweeps to MAX, keeps being forced, snaps off and flies away
const DialHand: React.FC<{ t: number }> = ({ t }) => {
  if (t >= SNAP) {
    const p = prog(t, SNAP, SNAP + 0.35);
    return (
      <g transform={`translate(${STOVE_DIAL[0] + 160 * p},${STOVE_DIAL[1] - 220 * p + 260 * p * p}) rotate(${p * 540})`}>
        <circle r={24} fill="#e9ecef" stroke="#22160f" strokeWidth={5} />
        <rect x={-4} y={-24} width={8} height={20} rx={3} fill="#e63946" />
      </g>
    );
  }
  const turn = dialTurn(t);
  return (
    <g transform={`translate(${STOVE_DIAL[0]},${STOVE_DIAL[1]}) rotate(${-135 + 270 * turn})`}>
      <ellipse cx={0} cy={-34} rx={30} ry={18} fill={BRO.skin} stroke="#22160f" strokeWidth={5} />
      <ellipse cx={-26} cy={-14} rx={11} ry={16} fill={BRO.skin} stroke="#22160f" strokeWidth={5} />
    </g>
  );
};
const dialTurn = (t: number) => {
  const sweep = EASE_INOUT(prog(t, TURN[0], TURN[1]));
  const force = prog(t, TURN[1], SNAP) * 0.18 + (t > TURN[1] && t < SNAP ? Math.sin(t * 60) * 0.02 : 0);
  return sweep + force;
};

export default function Bro04Cook() {
  const t = useT();
  const cam = camAt(t, CAM);
  const shake = [
    shakeAt(t, S(3) - 0.1, 16),
    shakeAt(t, SNAP, 10),
    shakeAt(t, FWOOSH, 26, 0.5),
    shakeAt(t, STARE[0], 8),
  ].reduce((a, b) => [a[0] + b[0], a[1] + b[1]] as [number, number], [0, 0] as [number, number]);

  const smoke = t < SMOKE0 ? 0 : t < FWOOSH ? 0.25 + 0.75 * prog(t, SMOKE0, FWOOSH) : t < DING ? 1 : 0.45 + (t >= S(14) - 0.2 ? 0.35 : 0);
  const beeping = t >= BEEP0 && t < DING;
  const fireSize = t < FWOOSH ? 0 : t < DING ? 1.3 * EASE_OUT(prog(t, FWOOSH, FWOOSH + 0.25)) : 0;
  const inFront = t >= ACTION[0]; // after the fire, Bro stands in front of the counter
  const action = t >= ACTION[0] && t < STARE[1];
  const sig = t >= SIG;

  // Bro, cooking (behind the counter)
  const ck =
    t < S(1) - 0.05 ? 'claim' : t < S(2) - 0.05 ? 'cereal' : t < S(3) - 0.1 ? 'fire' : t < S(4) - 0.05 ? 'catch' : t < DIAL[0] ? 'phone' : t < S(7) - 0.1 ? 'smoke' : t < FWOOSH ? 'relax' : 'boom';
  const cookArmR: ArmPose = ck === 'phone' ? 'hold' : ck === 'catch' || ck === 'fire' ? 'gun' : ck === 'boom' ? 'shrug' : 'hip';
  const cookArmL: ArmPose = ck === 'boom' ? 'shrug' : 'hip';

  // after the fire: walking, staring, pizza, math
  const wp = EASE_INOUT(prog(t, ACTION[0], ACTION[1]));
  const walkX = WALK_FROM.x + (WALK_TO.x - WALK_FROM.x) * wp;
  const walkY = WALK_FROM.y + (WALK_TO.y - WALK_FROM.y) * wp;
  const walkS = WALK_FROM.s + (WALK_TO.s - WALK_FROM.s) * wp;
  const hasBox = t >= HANDOFF;
  const math = t >= S(12) - 0.2 && t < S(13) - 0.05;
  const sauna = t >= S(14) - 0.2 && !sig;
  const doorOpen = t < DOOR[0] ? 0 : t < DELIVERY_OUT[1] ? EASE_OUT(prog(t, DOOR[0], DOOR[1])) : 1 - EASE_OUT(prog(t, DELIVERY_OUT[1], DELIVERY_OUT[1] + 0.3));
  const guyX = t < DELIVERY_OUT[0] ? DOOR_GUY.x : DOOR_GUY.x - 380 * prog(t, DELIVERY_OUT[0], DELIVERY_OUT[1]);

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Stage cam={cam} shake={shake} filter={signatureFilter(t, SIG)}>
        <Kitchen beeping={beeping} t={t} char={t >= FWOOSH ? Math.min(1, prog(t, FWOOSH, FWOOSH + 1.5)) : 0} doorOpen={doorOpen} />
        {action ? (
          // ACTION SHOT: no counter in this angle — fire roaring behind, shades down, slow-mo walk
          <>
            <Flames x={445} y={1240} size={2.3} t={t} />
            <Smoke x={445} y={1000} t={t} amount={1} />
            <Toon
              spec={BRO}
              x={walkX}
              y={walkY}
              scale={walkS}
              expr={t >= STARE[0] ? 'deadpan' : 'smug'}
              mouth={lipSync(VO, 'bro', t)}
              legs={t < ACTION[1] ? 'walk' : 'stand'}
              walk={t * 0.8}
              armL={t >= STARE[0] ? 'cross' : 'down'}
              armR={t >= STARE[0] ? 'cross' : 'down'}
              shadesDown
              shadow={false}
            />
          </>
        ) : (
          <>
            {inFront && <Smoke x={445} y={1150} t={t} amount={0.5} />}
            {!inFront && (
              <Toon
                spec={BRO}
                x={COOK.x}
                y={COOK.y}
                expr={ck === 'claim' || ck === 'cereal' ? 'smug' : ck === 'phone' ? 'neutral' : ck === 'relax' ? 'smug' : ck === 'boom' ? 'shock' : 'confident'}
                look={ck === 'cereal' || ck === 'relax' ? [0.9, 0] : ck === 'phone' ? [0.3, 0.8] : [0, 0]}
                mouth={lipSync(VO, 'bro', t)}
                armL={cookArmL}
                armR={cookArmR}
                holdR={ck === 'phone' ? <Phone scale={0.9} /> : undefined}
                sweat={ck === 'boom'}
              />
            )}
            <Pan x={445} y={1172} />
            {!inFront && <Smoke x={445} y={1120} t={t} amount={smoke} />}
            {!inFront && <Flames x={445} y={1165} size={fireSize} t={t} />}
            <Counter dial={dialTurn(t)} dialGone={t >= SNAP} />
            {t >= DIAL[0] && t < DIAL[1] && <DialHand t={t} />}
            {inFront && (
              <Toon
                spec={BRO}
                x={FRONT.x}
                y={FRONT.y}
                expr={sig ? 'deadpan' : sauna ? 'happy' : math ? 'smug' : t >= S(13) ? 'neutral' : 'smug'}
                look={math || sauna || sig ? [0, 0] : t < HANDOFF ? [-0.9, 0] : [0.9, 0]}
                mouth={lipSync(VO, 'bro', t)}
                armL={hasBox && !sig ? 'hold' : sig ? 'cross' : 'hip'}
                holdL={hasBox && !sig ? <PizzaBox scale={0.9} /> : undefined}
                armR={math ? TEMPLE : sig ? 'cross' : 'hip'}
                handR={math ? 'point' : undefined}
                sweat={sauna}
                tilt={math ? -4 : sauna ? -5 : 0}
              />
            )}
            {inFront && t < DELIVERY_OUT[1] && (
              <Toon
                spec={DELIVERY}
                x={guyX}
                y={DOOR_GUY.y}
                scale={DOOR_GUY.s}
                expr={t >= S(10) ? 'side-eye' : 'neutral'}
                look={[0.9, 0]}
                mouth={lipSync(VO, 'delivery', t)}
                legs={t >= DELIVERY_OUT[0] ? 'walk' : 'stand'}
                walk={t * 1.8}
                armR={!hasBox ? 'hold' : 'down'}
                holdR={!hasBox ? <PizzaBox scale={0.9} /> : undefined}
                armL="down"
              />
            )}
            <Toon
              spec={DEE}
              x={DEE_AT.x}
              y={DEE_AT.y}
              scale={DEE_AT.s}
              expr={t >= S(6) - 0.3 && t < DING ? 'shock' : t >= S(13) ? 'annoyed' : 'annoyed'}
              look={inFront ? [-0.8, 0] : [-0.8, 0]}
              mouth={lipSync(VO, 'dee', t)}
              armL="cross"
              armR={t >= S(6) - 0.1 && t < E(6) + 0.3 ? 'point-up' : talking(VO, 'dee', t) ? 'shrug' : 'cross'}
              sweat={t >= S(6) - 0.3 && t < DING}
            />
            <BroMath
              x={pfx}
              y={pfy}
              t={t}
              to={S(13) - 0.05}
              size={38}
              lines={[
                { text: 'RESTAURANT: $80', dx: -265, dy: -130, at: S(12) + 0.2, rot: -6 },
                { text: 'PIZZA: $20', dx: 300, dy: -60, at: S(12) + 1.3, rot: 5 },
                { text: '= SAVED $60', dx: 0, dy: 240, at: S(12) + 2.4, rot: -3, color: '#ffd23f' },
              ]}
            />
            <Sparkles x={pfx} y={pfy + 240} t={t} at={S(12) + 2.4} spread={170} />
          </>
        )}
        {/* the smoke haze sits over everything (characters included) */}
        {smoke > 0 && <rect x={0} y={0} width={1080} height={1920} fill="#6c6c6c" opacity={0.22 * smoke} />}
        {action && <rect x={0} y={0} width={1080} height={1920} fill="#ff7b00" opacity={0.14} />}
      </Stage>
      <Flash at={FWOOSH} dur={0.2} color="#ffb703" />
      <Cut from={0} to={SIG}>
        <TitleBar title="Bro thinks he can cook" series={SERIES.name} ep={4} accent={SERIES.accent} />
      </Cut>
      <SignatureStamp at={SIG} stampAt={S(15) + 0.25} text="I GOT THIS." accent={SERIES.accent} />
      {t < SIG && t < DIAL[0] || (t >= DIAL[1] && t < SIG) ? <DialogueCaptions lines={VO} colors={COLORS} y={1385} /> : null}
    </AbsoluteFill>
  );
}
