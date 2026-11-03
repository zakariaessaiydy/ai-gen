// TINY SPARKS · SMOOTH-MOTION TEST (lab, 16:9) — a side-by-side for the user: the SAME choreography of
// Leo + Bobo twice. LEFT = plain props (poses and faces switch in one frame, hops with no weight, walks
// at a fixed speed with sliding feet). RIGHT = the same timeline handed to the rigs' smooth API
// (lib/kids/smooth.ts): poseAt / exprAt / lookAt / walkPath / settleAt + hopAt — arms overshoot and
// settle, faces blink/squeeze through a change, hops crouch / stretch / squash, walks ease in and out
// with distance-locked steps and a lean, eyes glide. The reference for how episodes use the API.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Kid, type KArm } from '../../lib/kids/kid';
import { Critter, type CArm } from '../../lib/kids/critter';
import { BOBO, LEO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { FONT_TOON } from '../../lib/kids/kit';
import { K3DDefs } from '../../lib/kids/depth';
import { KINK, type KExpr } from '../../lib/kids/face';
import { hopAt } from '../../lib/kids/energy';
import { prog } from '../../lib/shorts';
import { exprAt, lookAt, poseAt, settleAt, walkPath } from '../../lib/kids/smooth';

export const compositionConfig = { id: 'KidsSmoothDemo', durationInSeconds: 12.5, fps: 30, width: 1920, height: 1080 };

const PW = 960; // one panel
const H = 1080;
const f = FLOOR(H);
const SC = 0.78;

// ── which key is active at t
type Keys<T> = [number, T][];
const at = <T,>(t: number, keys: Keys<T>): { i: number } => {
  let i = 0;
  for (let k = 0; k < keys.length; k++) if (t >= keys[k][0]) i = k;
  return { i };
};
type KPose = 'down' | 'wave' | 'up' | 'point';

// ── CRITTER arm poses (one angle) — the LEFT side's snap version
type CPose = 'down' | 'cheer';
const CANG: Record<CPose, [number, number]> = { down: [14, 0], cheer: [124, 14] };
const critArm = (t: number, frame: number, keys: Keys<CPose>): CArm => {
  const { i } = at(t, keys);
  return { a: CANG[keys[i][1]][0] + Math.sin(frame / 3.2) * CANG[keys[i][1]][1] };
};

// ── the choreography (identical on both sides)
const LEO_ARM_R: Keys<KPose> = [[0, 'down'], [1.0, 'wave'], [2.8, 'down'], [10.0, 'point'], [11.5, 'down']];
const BOBO_ARMS: Keys<CPose> = [[0, 'down'], [5.0, 'cheer'], [6.4, 'down']];
const LEO_EXPR: Keys<KExpr> = [[0, 'smile'], [1.0, 'happy'], [2.8, 'smile'], [3.4, 'laugh'], [4.8, 'smile'], [10.0, 'happy'], [11.5, 'smile']];
const BOBO_EXPR: Keys<KExpr> = [[0, 'smile'], [3.6, 'wow'], [4.6, 'smile'], [5.0, 'laugh'], [6.4, 'smile'], [10.2, 'wow'], [11.5, 'smile']];
const HOP_AT = 3.6;
const LEO_X0 = 290;
const LEO_X1 = 470;
const WALK: [number, number, number, number][] = [
  // [t0, t1, x0, x1]
  [6.8, 8.0, LEO_X0, LEO_X1],
  [8.6, 9.8, LEO_X1, LEO_X0],
];
const BOBO_X = 700;

const leoX = (t: number) => {
  for (const [t0, t1, x0, x1] of WALK) {
    if (t < t0) return x0;
    if (t <= t1) return x0 + (x1 - x0) * prog(t, t0, t1);
  }
  return WALK[WALK.length - 1][3];
};
const walking = (t: number) => WALK.some(([t0, t1]) => t > t0 && t < t1);

const LEO_LOOK: [number, [number, number]][] = [[0, [0, 0]], [10.0, [1, 0]], [11.5, [0, 0]]];
const BOBO_LOOK: [number, [number, number]][] = [[0, [0, 0]], [10.2, [-1, 0]], [11.5, [0, 0]]];
const BOBO_KEYS: [number, CArm][] = [[0, 'down'], [5.0, { a: 124 }], [6.4, 'down']];

const Label: React.FC<{ smooth: boolean }> = ({ smooth }) => (
  <g>
    <rect x={PW / 2 - 250} y={36} width={500} height={92} rx={46} fill={smooth ? '#8ac926' : '#ffffff'} stroke={KINK} strokeWidth={6} />
    <text x={PW / 2} y={100} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={52} fill={KINK}>
      {smooth ? 'AFTER · smooth' : 'BEFORE · today'}
    </text>
  </g>
);

// LEFT: today's way — plain props that switch in one frame
const PanelBefore: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const p = prog(t, HOP_AT, HOP_AT + 0.42);
  const hop = t > HOP_AT && t < HOP_AT + 0.42 ? 150 * 4 * p * (1 - p) : 0;
  const bp = prog(t, 5.05, 5.47);
  const bhop = t > 5.05 && t < 5.47 ? 70 * 4 * bp * (1 - bp) : 0;
  const pick = <T,>(keys: [number, T][]) => keys[at(t, keys).i][1];
  const lk = t >= 10.0 && t < 11.5 ? 1 : 0;
  const bk = t >= 10.2 && t < 11.5 ? 1 : 0;
  return (
    <g>
      <Meadow w={PW} h={H} t={t} rainbow={false} />
      <Critter spec={BOBO} x={BOBO_X} y={f} scale={SC} expr={pick(BOBO_EXPR)} look={[-bk, 0]} armL={critArm(t, frame, BOBO_ARMS)} armR={critArm(t, frame, BOBO_ARMS)} hop={bhop} tilt={-bk * 6} />
      <Kid spec={LEO} x={leoX(t)} y={f} scale={SC} expr={pick(LEO_EXPR)} look={[lk, 0]} armR={pick(LEO_ARM_R)} legs={walking(t) ? 'walk' : 'stand'} walk={t * 2} hop={hop} />
      <Label smooth={false} />
    </g>
  );
};

// RIGHT: the SAME timeline handed to the rigs' smooth API
const PanelAfter: React.FC<{ t: number }> = ({ t }) => {
  const h = hopAt(t, [HOP_AT], { h: 150 });
  const bh = hopAt(t, [5.05], { h: 70 });
  const w = walkPath(t, WALK, 95);
  const bLook = lookAt(t, BOBO_LOOK);
  return (
    <g>
      <Meadow w={PW} h={H} t={t} rainbow={false} />
      <Critter spec={BOBO} x={BOBO_X} y={f} scale={SC} expr={exprAt(t, BOBO_EXPR)} look={bLook} armL={poseAt(t, BOBO_KEYS)} armR={poseAt(t, BOBO_KEYS)} hop={bh.hop} squash={bh.squash} tilt={bLook[0] * 6} />
      <Kid spec={LEO} x={w.x} y={f} scale={SC} expr={exprAt(t, LEO_EXPR)} look={lookAt(t, LEO_LOOK)} armR={poseAt(t, LEO_ARM_R as [number, KArm][])} legs={w.walking ? 'walk' : 'stand'} walk={w.walk} lean={w.lean} hop={h.hop} squash={h.squash} tilt={settleAt(t, HOP_AT + 0.42, 5)} />
      <Label smooth />
    </g>
  );
};

export default function KidsSmoothDemo() {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill style={{ background: '#fff8e7' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
        <K3DDefs />
        <svg x={0} y={0} width={PW} height={H} viewBox={`0 0 ${PW} ${H}`} overflow="hidden">
          <PanelBefore t={t} frame={frame} />
        </svg>
        <svg x={PW} y={0} width={PW} height={H} viewBox={`0 0 ${PW} ${H}`} overflow="hidden">
          <PanelAfter t={t} />
        </svg>
        <rect x={PW - 5} y={0} width={10} height={H} fill={KINK} />
      </svg>
    </AbsoluteFill>
  );
}
