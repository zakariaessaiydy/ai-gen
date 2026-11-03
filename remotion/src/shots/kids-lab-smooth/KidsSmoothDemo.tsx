// TINY SPARKS · SMOOTH-MOTION TEST (lab, 16:9) — a side-by-side for the user: the SAME choreography of
// Leo + Bobo twice. LEFT = how the rigs move today (poses switch in one frame, hops with no weight,
// walks at a fixed speed with sliding feet). RIGHT = cartoon timing done with the rigs' existing props
// only (no rig code changed): poses blend over ~10 frames with an overshoot + settle, hops get an
// anticipation crouch / stretch / squash on landing, walks ease in and out with the step phase tied to
// the distance (no foot sliding) and a lean into the move, the head follows through after a landing,
// eyes glide to a new look target. If the user likes the right side, the blending moves into the rigs.
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
import { EASE_INOUT, prog } from '../../lib/shorts';

export const compositionConfig = { id: 'KidsSmoothDemo', durationInSeconds: 12.5, fps: 30, width: 1920, height: 1080 };

const PW = 960; // one panel
const H = 1080;
const f = FLOOR(H);
const SC = 0.78;

// ── timing helpers
const easeOutBack = (p: number) => {
  const c1 = 1.9; // overshoot amount
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
};
type Keys<T> = [number, T][];
const at = <T,>(t: number, keys: Keys<T>): { i: number } => {
  let i = 0;
  for (let k = 0; k < keys.length; k++) if (t >= keys[k][0]) i = k;
  return { i };
};
const bump = (t: number, a: number, d: number) => (t < a || t > a + d ? 0 : Math.sin(((t - a) / d) * Math.PI));
const settle = (t: number, a: number, amp: number, d = 0.9) => (t < a || t > a + d ? 0 : amp * Math.sin(((t - a) / d) * Math.PI * 3) * (1 - (t - a) / d));

// ── KID arm poses as angles (the rig's own preset numbers), wave = base + wiggle amplitude
type KPose = 'down' | 'wave' | 'up' | 'point';
const KANG: Record<KPose, [number, number, number]> = { down: [12, 6, 0], wave: [138, 34, 20], up: [130, 10, 0], point: [96, 0, 0] };
// forward kinematics (the rig's arm: upper 100, fore 92) → an IK target, so a raised hand is drawn
// IN FRONT of the head like the rig's own 'wave' preset (an {a,b} arm always sits behind the body)
const fk = (a: number, b: number): [number, number] => {
  const r = Math.PI / 180;
  return [-100 * Math.sin(a * r) - 92 * Math.sin((a + b) * r), 100 * Math.cos(a * r) + 92 * Math.cos((a + b) * r)];
};
const BLEND = 0.34; // seconds a pose change takes

const kidArm = (t: number, frame: number, keys: Keys<KPose>, smooth: boolean): KArm => {
  const { i } = at(t, keys);
  if (!smooth) return keys[i][1];
  const cur = KANG[keys[i][1]];
  const prev = KANG[keys[Math.max(0, i - 1)][1]];
  const p = i === 0 ? 1 : prog(t, keys[i][0], keys[i][0] + BLEND);
  const e = easeOutBack(p);
  const amp = prev[2] + (cur[2] - prev[2]) * Math.min(1, p * 1.4);
  const wig = Math.sin(frame / 3.2) * amp;
  // the forearm trails the upper arm a little (follow-through): it reaches its angle a beat later
  const e2 = easeOutBack(prog(t, keys[i][0] + 0.06, keys[i][0] + BLEND + 0.08));
  return { to: fk(prev[0] + (cur[0] - prev[0]) * e, prev[1] + (cur[1] - prev[1]) * (i === 0 ? 1 : e2) + wig) };
};

// ── CRITTER arm poses (one angle)
type CPose = 'down' | 'cheer';
const CANG: Record<CPose, [number, number]> = { down: [14, 0], cheer: [124, 14] };
const critArm = (t: number, frame: number, keys: Keys<CPose>, smooth: boolean): CArm => {
  const { i } = at(t, keys);
  if (!smooth) return { a: CANG[keys[i][1]][0] + Math.sin(frame / 3.2) * CANG[keys[i][1]][1] };
  const cur = CANG[keys[i][1]];
  const prev = CANG[keys[Math.max(0, i - 1)][1]];
  const p = i === 0 ? 1 : prog(t, keys[i][0], keys[i][0] + BLEND);
  const amp = prev[1] + (cur[1] - prev[1]) * Math.min(1, p * 1.4);
  return { a: prev[0] + (cur[0] - prev[0]) * easeOutBack(p) + Math.sin(frame / 3.2) * amp };
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

const leoX = (t: number, smooth: boolean) => {
  for (const [t0, t1, x0, x1] of WALK) {
    if (t < t0) return x0;
    if (t <= t1) return x0 + (x1 - x0) * (smooth ? EASE_INOUT(prog(t, t0, t1)) : prog(t, t0, t1));
  }
  return WALK[WALK.length - 1][3];
};
const walking = (t: number) => WALK.some(([t0, t1]) => t > t0 && t < t1);

const Panel: React.FC<{ smooth: boolean; t: number; frame: number }> = ({ smooth, t, frame }) => {
  // hop
  const h = smooth ? hopAt(t, [HOP_AT], { h: 150 }) : (() => {
    const p = prog(t, HOP_AT, HOP_AT + 0.42);
    return { hop: t > HOP_AT && t < HOP_AT + 0.42 ? 150 * 4 * p * (1 - p) : 0, squash: 0 };
  })();
  // walk
  const x = leoX(t, smooth);
  const dx = leoX(t + 1 / 30, smooth) - x;
  const isWalk = walking(t);
  const walkPhase = smooth ? Math.abs(x - LEO_X0) / 95 : t * 2; // smooth: steps follow the distance
  const lean = smooth ? Math.max(-6, Math.min(6, dx * 1.4)) : 0;
  // head follow-through after the landing + a little pop when the expression changes
  const exprI = at(t, LEO_EXPR).i;
  const tilt = smooth ? settle(t, HOP_AT + 0.42, 5) : 0;
  const pop = smooth ? -0.12 * bump(t, LEO_EXPR[exprI][0], 0.22) : 0;
  const bExprI = at(t, BOBO_EXPR).i;
  const bPop = smooth ? -0.14 * bump(t, BOBO_EXPR[bExprI][0], 0.22) : 0;
  // eyes: Leo looks at Bobo while pointing, Bobo looks back
  const lookOn = (a: number, b: number) => (smooth ? EASE_INOUT(prog(t, a, a + 0.25)) * (1 - EASE_INOUT(prog(t, b, b + 0.25))) : t >= a && t < b ? 1 : 0);
  const lk = lookOn(10.0, 11.5);
  const bk = lookOn(10.2, 11.5);
  // Bobo bounces once when he cheers (smooth side gets the weight)
  const bh = smooth ? hopAt(t, [5.05], { h: 70 }) : { hop: t > 5.05 && t < 5.47 ? 70 * 4 * prog(t, 5.05, 5.47) * (1 - prog(t, 5.05, 5.47)) : 0, squash: 0 };

  return (
    <g>
      <Meadow w={PW} h={H} t={t} rainbow={false} />
      <Critter
        spec={BOBO}
        x={BOBO_X}
        y={f}
        scale={SC}
        expr={BOBO_EXPR[bExprI][1]}
        mouth={0}
        look={[-bk, 0]}
        armL={critArm(t, frame, BOBO_ARMS, smooth)}
        armR={critArm(t, frame, BOBO_ARMS, smooth)}
        hop={bh.hop}
        squash={bh.squash + bPop}
        tilt={smooth ? -bk * 6 : t >= 10.2 && t < 11.5 ? -6 : 0}
      />
      <Kid
        spec={LEO}
        x={x}
        y={f}
        scale={SC}
        expr={LEO_EXPR[exprI][1]}
        look={[lk, 0]}
        armR={kidArm(t, frame, LEO_ARM_R, smooth)}
        legs={isWalk ? 'walk' : 'stand'}
        walk={walkPhase}
        hop={h.hop}
        squash={h.squash + pop}
        lean={lean}
        tilt={tilt}
      />
      {/* label */}
      <g>
        <rect x={PW / 2 - 250} y={36} width={500} height={92} rx={46} fill={smooth ? '#8ac926' : '#ffffff'} stroke={KINK} strokeWidth={6} />
        <text x={PW / 2} y={100} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={52} fill={KINK}>
          {smooth ? 'AFTER · smooth' : 'BEFORE · today'}
        </text>
      </g>
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
          <Panel smooth={false} t={t} frame={frame} />
        </svg>
        <svg x={PW} y={0} width={PW} height={H} viewBox={`0 0 ${PW} ${H}`} overflow="hidden">
          <Panel smooth t={t} frame={frame} />
        </svg>
        <rect x={PW - 5} y={0} width={10} height={H} fill={KINK} />
      </svg>
    </AbsoluteFill>
  );
}
