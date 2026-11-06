// VO → TIMELINES (Nov 2026). Builds the smooth-motion key lists (smooth.ts poseAt / exprAt) straight from the
// voice: a character takes `talk` while it speaks and `rest` otherwise, and a scene can override any span.
//   const MILA_R = voKeys(VO, 'mila', 'present', 'down', [[S('c1'), E('c3'), 'count'], [S('bye'), 99, 'wave']]);
//   <Kid armR={poseAt(t, MILA_R)} expr={exprAt(t, voKeys(VO, 'mila', 'happy', 'smile', EXPR_OVER))} … />
// Overrides are [from, to, value]; the LAST one covering a moment wins. Equal neighbours collapse, so the rig only
// moves when the value really changes. Build the lists once at module level (they are pure functions of VO).
import type { VoLine } from '../shorts';
import type { Keys } from './smooth';

export type Span<T> = [number, number, T];

export const voKeys = <T>(vo: VoLine[], who: string | null, talk: T, rest: T, over: Span<T>[] = [], hang = 0.15): Keys<T> => {
  const lines = who ? vo.filter((l) => l.speaker === who) : [];
  const valueAt = (t: number): T => {
    for (let i = over.length - 1; i >= 0; i--) if (t >= over[i][0] && t < over[i][1]) return over[i][2];
    return lines.some((l) => t >= l.start && t < l.end + hang) ? talk : rest;
  };
  const marks = new Set<number>([0]);
  for (const l of lines) {
    marks.add(l.start);
    marks.add(l.end + hang);
  }
  for (const [a, b] of over) {
    marks.add(Math.max(0, a));
    marks.add(Math.max(0, b));
  }
  const keys: Keys<T> = [];
  for (const m of [...marks].sort((a, b) => a - b)) {
    const v = valueAt(m);
    const last = keys[keys.length - 1];
    if (!last || JSON.stringify(last[1]) !== JSON.stringify(v)) keys.push([m, v]);
  }
  return keys;
};

// hop take-offs on every word of the given lines (a chant, a cheer) — feed to hopAt()
export const wordHops = (vo: VoLine[], idx: number[], every = 1): number[] =>
  idx.flatMap((i) => (vo[i].words ?? []).filter((_, j) => j % every === 0).map((w) => w.start - 0.05));
