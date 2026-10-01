import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, PauseCard, ProgressBar, prog } from '../../lib/shorts';
import {
  EASE_INOUT,
  EASE_OUT,
  HUES,
  IDENTITY,
  Line,
  N,
  ORDER_COLORS,
  Place,
  RoomLayout,
  RoomStage,
  THINGS,
  Tally,
  Thing,
  Vignette,
  clamp01,
  mix,
  mulberry32,
  slotXY,
} from '../../lib/order';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short34Clutter',
  durationInSeconds: 43.5,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = ORDER_COLORS.accent;
const F = (s: number) => Math.round(s * 30);
const END = F(43.5);

// =============================================================================
// THE MODEL — short-16's room (20 things, 20 places) plus what short-16 never allowed:
// MORE THINGS THAN PLACES. A thing is somewhere: a home (0..19), a floor spot (FLOOR+j),
// or outside the door. Every count on screen is read off these arrays, per frame:
//   THINGS   = how many things are not outside
//   ON FLOOR = how many things are on a floor spot
// so "tidying never subtracts" is not asserted — the swap animation replays it and the
// floor count visibly refuses to move. Pigeonhole: 26 things over 20 homes leave >= 6 homeless
// in EVERY arrangement, so the number of tidy states is zero.
// =============================================================================
const L: RoomLayout = { cols: 5, rows: 4, cell: 150, gap: 20, y0: 490 };
const FLOOR_Y = 1180; // wall/floor seam
const FLOOR = 100;
const OUT_L = -1; // the door things come in by
const OUT_R = -2; // the door things leave by

// Six arrivals, each a second copy of something the room already has a home for.
// Homes 10, 1, 8 are the mug, the book and the box ("a gift") the narration names.
const ARRIVAL_HOME = [10, 1, 8, 13, 5, 14];
const K = ARRIVAL_HOME.length;
const TOTAL = N + K; // 26
const FLOOR_OF = [2, 4, 0, 5, 1, 3]; // which floor spot each arrival drops to — a pile, not a queue
const LOOK = (id: number) =>
  id < N
    ? THINGS[id]
    : { glyph: THINGS[ARRIVAL_HOME[id - N]].glyph, color: HUES[(ARRIVAL_HOME[id - N] * 3 + 3) % HUES.length] };

const ALL = Array.from({ length: TOTAL }, (_, i) => i);
const state = (fn: (id: number) => number) => ALL.map(fn);

const FULL = state((id) => (id < N ? id : FLOOR + FLOOR_OF[id - N])); // frame 0 and the last frame
const BASE = state((id) => (id < N ? id : OUT_L));
// "tidying": put an arrival in its home, and the thing living there takes its floor spot
const tryPut = (from: number[], k: number) => {
  const s = from.slice();
  const h = ARRIVAL_HOME[k];
  s[N + k] = h;
  s[h] = from[N + k];
  return s;
};
const TRY1 = tryPut(FULL, 0);
const TRY2 = tryPut(TRY1, 1);
// one in, one out: the arrival takes the home, the old one leaves by the other door
const RULE = state((id) => {
  if (id >= N) return ARRIVAL_HOME[id - N];
  return ARRIVAL_HOME.includes(id) ? OUT_R : id;
});

const countOf = (s: number[], pred: (w: number) => boolean) => s.filter(pred).length;
const inRoom = (w: number) => w >= 0;
const onFloor = (w: number) => w >= FLOOR;
// the claims, checked at module load — if the model changes, the video refuses to render a lie
if (countOf(FULL, inRoom) !== 26 || countOf(FULL, onFloor) !== 6) throw new Error('FULL must be 26 things, 6 on floor');
if (countOf(TRY2, inRoom) !== 26 || countOf(TRY2, onFloor) !== 6) throw new Error('tidying must not change the count');
if (countOf(RULE, inRoom) !== N || countOf(RULE, onFloor) !== 0) throw new Error('one in one out must hold at 20');

// deterministic per-thing jitter: a thing on the floor is dropped, not placed
const rnd = mulberry32(34);
const NOISE = ALL.map(() => [rnd(), rnd(), rnd(), rnd()]);

type Pose = { x: number; y: number; rot: number };
const poseOf = (id: number, w: number): Pose => {
  const n = NOISE[id];
  if (w === OUT_L) return { x: -150, y: 1270, rot: -10 };
  if (w === OUT_R) return { x: 1240, y: 700 + n[1] * 200, rot: 12 };
  if (w >= FLOOR) {
    const j = w - FLOOR;
    return { x: 140 + 160 * j + (n[0] - 0.5) * 14, y: 1272 + (n[1] - 0.5) * 30, rot: (n[2] - 0.5) * 22 };
  }
  const [x, y] = slotXY(w, L);
  return { x, y, rot: 0 };
};

// =============================================================================
// THE TIMELINE — segments between states. Each thing has its own u in [0,1]; its pose blends
// from -> to, and its COUNTED location flips at u = 0.5. Things that swap share one u, so a
// swap can never be counted as two things in one place or zero things in two.
// =============================================================================
type Seg = { a: number; b: number; from: number[]; to: number[]; step?: number; span?: number };
const SEGS: Seg[] = [
  { a: F(4.2), b: F(5.4), from: FULL, to: BASE }, // the rewind: "it started with twenty things"
  { a: F(9.3), b: F(15.0), from: BASE, to: FULL, step: 1, span: 0.36 }, // arrivals 0.72s apart: refusals land on "mug" 10.42, "book" 11.14, "gift" 11.86
  { a: F(19.4), b: F(20.6), from: FULL, to: TRY1 }, // tidying, attempt 1 — lands on "moves" @19.49
  { a: F(21.0), b: F(22.2), from: TRY1, to: TRY2 }, // tidying, attempt 2
  { a: F(28.4), b: F(29.8), from: TRY2, to: BASE }, // back to the start, to try the rule
  { a: F(31.9), b: F(36.4), from: BASE, to: RULE, step: 1, span: 0.3 }, // one in, one out ×6
  { a: F(40.6), b: F(42.6), from: RULE, to: FULL }, // on "and this room comes back" @40.84 — // skip the rule: the room comes back = frame 0
];

/** Which arrival (0..K-1) a thing belongs to in a stepped segment; originals follow their arrival. */
const stepIndex = (id: number) => (id >= N ? id - N : ARRIVAL_HOME.indexOf(id));

const uOf = (seg: Seg, id: number, f: number) => {
  const p = prog(f, seg.a, seg.b);
  if (seg.step) {
    const k = stepIndex(id);
    if (k < 0) return p >= 1 ? 1 : 0;
    const span = seg.span ?? 0.3;
    const t0 = (k / (K - 1)) * (1 - span);
    return clamp01((p - t0) / span);
  }
  return clamp01(p * 1.4 - 0.4 * NOISE[id][3]);
};

type Live = { pose: Pose; home: number; where: number; u: number; seg: Seg | null };
const roomAt = (f: number): Live[] => {
  // the state we are in or moving through
  let seg: Seg | null = null;
  let still = FULL;
  for (const s of SEGS) {
    if (f < s.a) break;
    if (f < s.b) {
      seg = s;
      break;
    }
    still = s.to;
  }
  return ALL.map((id) => {
    if (!seg) {
      const w = still[id];
      return { pose: poseOf(id, w), home: w >= 0 && w < FLOOR ? 1 : 0, where: w, u: 0, seg: null };
    }
    const wa = seg.from[id];
    const wb = seg.to[id];
    const u = wa === wb ? 0 : uOf(seg, id, f);
    const A = poseOf(id, wa);
    const B = poseOf(id, wb);
    const refused = seg.from === BASE && seg.to === FULL && id >= N; // arrivals try their home first
    let pose: Pose;
    if (refused) {
      const hover = { ...poseOf(id, ARRIVAL_HOME[id - N]), rot: 6 };
      hover.y -= 26;
      if (u < 0.5) {
        const e = EASE_INOUT(u / 0.5);
        pose = { x: mix(A.x, hover.x, e), y: mix(A.y, hover.y, e) - Math.sin(Math.PI * e) * 60, rot: mix(A.rot, hover.rot, e) };
      } else if (u < 0.68) {
        const shake = Math.sin(((u - 0.5) / 0.18) * Math.PI * 4) * 10;
        pose = { ...hover, x: hover.x + shake };
      } else {
        const e = EASE_INOUT((u - 0.68) / 0.32);
        pose = { x: mix(hover.x, B.x, e), y: mix(hover.y, B.y, e), rot: mix(hover.rot, B.rot, e) };
      }
    } else {
      const e = EASE_INOUT(u);
      pose = { x: mix(A.x, B.x, e), y: mix(A.y, B.y, e) - (wa !== wb ? Math.sin(Math.PI * e) * 40 : 0), rot: mix(A.rot, B.rot, e) };
    }
    const hA = wa >= 0 && wa < FLOOR ? 1 : 0;
    const hB = wb >= 0 && wb < FLOOR ? 1 : 0;
    // a refused arrival counts as "in the room" once it is through the door, "on the floor" once it drops
    const flip = refused ? 0.2 : 0.5;
    let where = u >= flip ? wb : wa;
    if (refused && u >= 0.2 && u < 0.8) where = 50; // through the door, not yet on the floor: counted in the room, in no home
    return { pose, home: mix(hA, hB, EASE_OUT(u)), where, u, seg };
  });
};

// =============================================================================
// THE BAND — one headline at a time (short-15's lesson: nothing shares the band).
// =============================================================================
type Head = { a: number; b: number; lines: { text: string; color?: string }[] };
const HOOK_LINES = [
  { text: 'NO AMOUNT OF CLEANING' },
  { text: 'MAKES THIS ROOM TIDY.', color: ORDER_COLORS.mess },
];
const HEADS: Head[] = [
  { a: -30, b: F(4.3), lines: HOOK_LINES },
  { a: F(4.6), b: F(9.0), lines: [{ text: '20 THINGS.' }, { text: '20 HOMES.', color: ORDER_COLORS.tidy }] },
  { a: F(9.2), b: F(15.5), lines: [{ text: 'THEN NEW THINGS' }, { text: 'COME IN.', color: ACCENT }] },
  { a: F(18.4), b: F(23.0), lines: [{ text: 'TIDYING MOVES THINGS.' }, { text: 'IT NEVER SUBTRACTS.', color: ORDER_COLORS.mess }] },
  { a: F(23.2), b: F(27.9), lines: [{ text: '26 THINGS − 20 HOMES' }, { text: '= 6 WITH NO HOME', color: ORDER_COLORS.mess }] },
  { a: F(28.1), b: F(35.6), lines: [{ text: 'THE ONE RULE:' }, { text: 'ONE IN, ONE OUT.', color: ORDER_COLORS.tidy }] },
  { a: F(35.8), b: F(39.7), lines: [{ text: 'THE COUNT STAYS 20.' }, { text: 'EVERY THING HAS A HOME.', color: ORDER_COLORS.tidy }] },
  { a: F(39.9), b: F(41.7), lines: [{ text: 'SKIP THE RULE…' }] },
  { a: F(41.9), b: END + 30, lines: HOOK_LINES },
];

const QUIZ_FROM = F(15.6);
const QUIZ_DUR = F(2.7);
const PIGEON_A = F(23.2);
const PIGEON_B = F(27.9);

const Short34Clutter: React.FC = () => {
  const f = useCurrentFrame();

  // the loop reverses the hook's punch-in, so the wrap has no scale step in it
  const LOOP_A = SEGS[SEGS.length - 1].a;
  const punch = f < LOOP_A ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 30)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP_A, END));

  const live = roomAt(f);
  const things = countOf(live.map((t) => t.where), inRoom);
  const floor = countOf(live.map((t) => t.where), onFloor);
  const homeFill = IDENTITY.map((s) => (live.some((t) => t.where === s && t.home > 0.5) ? 1 : 0));

  // refusal rings: an arrival hovering over a home that is already taken
  const alarms = live
    .map((t, id) => {
      if (id < N || !t.seg || t.seg.to !== FULL || t.seg.from !== BASE) return null;
      const a = Math.sin(clamp01((t.u - 0.42) / 0.36) * Math.PI);
      return a > 0.01 ? { s: ARRIVAL_HOME[id - N], a } : null;
    })
    .filter((x): x is { s: number; a: number } => x !== null);

  const pigeon = f >= PIGEON_A && f < PIGEON_B ? 0.5 - 0.5 * Math.cos(((f - PIGEON_A) / 18) * Math.PI) : 0;
  const pigeonOn = prog(f, PIGEON_A, PIGEON_A + 10) * (1 - prog(f, PIGEON_B - 10, PIGEON_B));
  const doorsOn = prog(f, F(31.6), F(32.0)) * (1 - prog(f, F(36.8), F(37.3)));
  const tallyOn = 1 - prog(f, QUIZ_FROM - 6, QUIZ_FROM + 4) + prog(f, QUIZ_FROM + QUIZ_DUR - 4, QUIZ_FROM + QUIZ_DUR + 6);
  const messiness = floor / K;

  return (
    <AbsoluteFill style={{ background: ORDER_COLORS.stage }}>
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          <RoomStage messiness={messiness} floorY={FLOOR_Y} glowY={820} />

          {IDENTITY.map((s) => (
            <Place key={`p${s}`} s={s} filled={homeFill[s]} layout={L} />
          ))}

          {/* the floor spots, lit while the video is counting what can never get a home */}
          {Array.from({ length: K }, (_, j) => (
            <ellipse
              key={`fl${j}`}
              cx={140 + 160 * j}
              cy={1330}
              rx={66}
              ry={14}
              fill={ORDER_COLORS.mess}
              opacity={0.08 + 0.3 * pigeonOn * (0.5 + 0.5 * pigeon)}
            />
          ))}

          {live.map((t, id) => (
            <Thing
              key={`t${id}`}
              i={id}
              x={t.pose.x}
              y={t.pose.y}
              rot={t.pose.rot}
              home={t.home}
              cell={L.cell}
              look={LOOK(id)}
            />
          ))}

          {alarms.map(({ s, a }) => {
            const [cx, cy] = slotXY(s, L);
            const h = L.cell / 2 + 8;
            return (
              <rect
                key={`al${s}`}
                x={cx - h}
                y={cy - h}
                width={h * 2}
                height={h * 2}
                rx={22}
                fill="none"
                stroke={ORDER_COLORS.mess}
                strokeWidth={7}
                opacity={a}
              />
            );
          })}

          {/* the two doors of the rule */}
          {doorsOn > 0.01 ? (
            <g opacity={doorsOn}>
              <Line x={40} y={1226} text="IN →" size={30} color={ORDER_COLORS.tidy} weight={700} anchor="start" spacing={2} />
              <Line x={1040} y={1226} text="→ OUT" size={30} color={ORDER_COLORS.mess} weight={700} anchor="end" spacing={2} />
            </g>
          ) : null}

          <Line x={540} y={1400} text="THE FLOOR · NO HOME" size={24} color={ORDER_COLORS.dim} weight={600} spacing={5} />

          <Tally
            y={300}
            on={clamp01(tallyOn)}
            color={floor > 0 ? ORDER_COLORS.mess : ORDER_COLORS.tidy}
            cols={[
              { label: 'THINGS', value: `${things}`, color: things > N ? ORDER_COLORS.mess : ORDER_COLORS.tidy },
              { label: 'HOMES', value: `${N}`, color: ORDER_COLORS.text },
              { label: 'ON THE FLOOR', value: `${floor}`, color: floor > 0 ? ORDER_COLORS.mess : ORDER_COLORS.tidy, pulse: pigeon * pigeonOn },
            ]}
          />
        </svg>

        <Vignette amount={0.42} />

        {HEADS.map((h, k) => {
          const op = Math.min(prog(f, h.a, h.a + 9), 1 - prog(f, h.b - 9, h.b));
          if (op <= 0.01) return null;
          return (
            <div key={k} style={{ opacity: op }}>
              <BigTitle lines={h.lines} y={140} size={60} warm />
            </div>
          );
        })}
      </AbsoluteFill>

      <Sequence from={QUIZ_FROM} durationInFrames={QUIZ_DUR}>
        <PauseCard title="PAUSE" subtitle="how many put-backs until it's tidy?" durSec={QUIZ_DUR / 30} accent={ACCENT} y={330} />
      </Sequence>

      <Captions lines={VO} y={1500} accent={ACCENT} plate />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
};

export default Short34Clutter;
