// KIDS KIT — SMOOTH MOTION (user request, Nov 2026: "move smoothly like the other cartoons").
// A frame is rendered on its own, so a rig can't remember the pose it had a moment ago. These helpers
// turn a tiny TIMELINE into "blend from A to B, p% of the way", which <Kid> and <Critter> then
// animate with cartoon timing: arms overshoot and settle (the forearm trails = follow-through),
// faces blink through an eye change and the mouth shrinks through a mouth change, with a little
// squash "pop" on every expression change. Plain poses/expressions still work exactly as before.
//
//   armR={poseAt(t, [[0, 'down'], [1.0, 'wave'], [2.8, 'down']])}
//   expr={exprAt(t, [[0, 'smile'], [1.0, 'happy'], [2.8, 'smile']])}
//   look={lookAt(t, [[0, [0, 0]], [10, [1, 0]]])}
//   const w = walkPath(t, [[6.8, 8.0, 290, 470]]);  → x={w.x} legs={w.walking ? 'walk' : 'stand'} walk={w.walk} lean={w.lean}
//   hops: hopAt() from energy.tsx (anticipation, stretch, squash, rebound) · head follow-through: settleAt()
import { EASE_INOUT, prog } from '../shorts';

export type Blend<T> = { blend: [T, T, number] }; // from, to, linear progress 0..1
export type Keys<T> = [number, T][]; // [time in s, value], times ascending

export const SMOOTH = { arm: 0.34, expr: 0.24, look: 0.25 }; // seconds a change takes

export const isBlend = <T>(v: unknown): v is Blend<T> => typeof v === 'object' && v !== null && 'blend' in (v as object);

// back-out: shoots ~10 % past the target and settles (the cartoon overshoot)
export const easeOutBack = (p: number) => {
  const q = Math.max(0, Math.min(1, p));
  const c1 = 1.9;
  return 1 + (c1 + 1) * Math.pow(q - 1, 3) + c1 * Math.pow(q - 1, 2);
};

const keyIndex = <T>(t: number, keys: Keys<T>) => {
  let i = 0;
  for (let k = 0; k < keys.length; k++) if (t >= keys[k][0]) i = k;
  return i;
};

// the pose at time t — a plain value once settled, a Blend while changing
export const poseAt = <T>(t: number, keys: Keys<T>, dur = SMOOTH.arm): T | Blend<T> => {
  const i = keyIndex(t, keys);
  if (i === 0 || t >= keys[i][0] + dur) return keys[i][1];
  return { blend: [keys[i - 1][1], keys[i][1], prog(t, keys[i][0], keys[i][0] + dur)] };
};
export const exprAt = <T>(t: number, keys: Keys<T>, dur = SMOOTH.expr) => poseAt(t, keys, dur);

// the value a rig should use for "which pose is this" questions (layering, tail wag, sparkles)
export const settled = <T>(v: T | Blend<T>): T => (isBlend<T>(v) ? (v.blend[2] < 0.5 ? v.blend[0] : v.blend[1]) : v);

// eased eye target
export const lookAt = (t: number, keys: Keys<[number, number]>, dur = SMOOTH.look): [number, number] => {
  const i = keyIndex(t, keys);
  const to = keys[i][1];
  if (i === 0) return to;
  const from = keys[i - 1][1];
  const e = EASE_INOUT(prog(t, keys[i][0], keys[i][0] + dur));
  return [from[0] + (to[0] - from[0]) * e, from[1] + (to[1] - from[1]) * e];
};

// a walk that eases in and out, steps locked to the distance (no sliding feet), leaning into the move.
// legs = [t0, t1, x0, x1] in order; stride = px per step cycle at scale 1 (multiply by the rig scale).
export const walkPath = (t: number, legs: [number, number, number, number][], stride = 120) => {
  const xAt = (tt: number) => {
    for (const [t0, t1, x0, x1] of legs) {
      if (tt < t0) return x0;
      if (tt <= t1) return x0 + (x1 - x0) * EASE_INOUT(prog(tt, t0, t1));
    }
    return legs[legs.length - 1][3];
  };
  const x = xAt(t);
  const dx = xAt(t + 1 / 30) - x;
  let dist = 0;
  for (const [t0, t1, x0, x1] of legs) dist += Math.abs(x1 - x0) * EASE_INOUT(prog(t, t0, t1));
  const walking = legs.some(([t0, t1]) => t > t0 && t < t1);
  return { x, walking, walk: dist / stride, lean: Math.max(-6, Math.min(6, dx * 1.4)) };
};

// a damped wobble after an event (head follow-through after a landing, a stop, a bump)
export const settleAt = (t: number, at: number, amp: number, dur = 0.9) =>
  t < at || t > at + dur ? 0 : amp * Math.sin(((t - at) / dur) * Math.PI * 3) * (1 - (t - at) / dur);
