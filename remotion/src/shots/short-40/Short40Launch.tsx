import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, PauseCard, ProgressBar, Stamp, prog, timeWords } from '../../lib/shorts';
import { CR, EASE_INOUT, Glyph, Pulse, Tally, Thing, Walker, XY, clamp01, hop, mix } from '../../lib/carry';
import {
  BED_TOP,
  Bed,
  Bin,
  CUSHION,
  Chair,
  FrontDoor,
  Heap,
  LaunchPad,
  PAD_BENCH,
  PAD_HOOK,
  RoomsLayout,
  RoomsSection,
  SEAT_H,
  Say,
  SlotMark,
  Sofa,
  SpotTag,
  TABLE_H,
  TOYBOX_H,
  Table,
  TagState,
  ToyBox,
} from '../../lib/rooms';
import { FONT_BODY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short40Launch',
  durationInSeconds: 42.0,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ESS = '#b5dd6a'; // the launch pad, and everything that belongs on it
const ACCENT = ESS;
const F = (s: number) => Math.round(s * 30);
const END = F(42.0);

// every cue is a spoken word — retimes itself when the real voice lands in vo.gen.ts
const key = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
const wAt = (line: number, word: string, nth = 0) => {
  const w = timeWords(VO[line]).filter((x) => key(x.w) === word)[nth];
  if (!w) throw new Error(`Short40Launch: no word "${word}" (#${nth}) in VO line ${line} ("${VO[line].text}")`);
  return F(w.start);
};
const bump = (f: number, a: number, dur: number) => Math.sin(Math.PI * prog(f, a, a + dur));
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// =============================================================================
// THE MODEL — a stated premise, printed on screen. The clock is never keyframed: it is the
// kid's walked distance at WALK m/s plus CHECK_S for every place looked in, or GRAB_S for
// every thing picked straight off the pad.
// =============================================================================
const PX_PER_M = 60;
const WALK = 1; // m/s
const CHECK_S = 25; // one place looked in: under it, behind it, through it, "have you seen my…?"
const GRAB_S = 2; // one thing taken off a hook or a bench

// =============================================================================
// THE HOUSE — one floor, three rooms, the front door on the right.
// =============================================================================
const H: RoomsLayout = {
  ceil: 760,
  apex: 650,
  floor: 1320,
  doorH: 250,
  wall: 18,
  rooms: [
    { id: 'bed', label: 'BEDROOM', color: CR.up, x0: 70, x1: 360 },
    { id: 'liv', label: 'LIVING ROOM', color: CR.down, x0: 360, x1: 700 },
    { id: 'hall', label: 'HALL', color: ESS, x0: 700, x1: 1010 },
  ],
};
const FL = H.floor;
const DOOR_X = 1010;
const PAD = { x0: 805, x1: 945, hooks: [842, 915] };
const KID_X = 755; // where the kid stands at the pad
const WS = 1.05; // a kid, not an adult
const HAND_S = 0.55;

type Item = { g: Glyph; name: string; pad: XY; hide: XY; rot: number };
// in the order the VO names them
const ITEMS: Item[] = [
  { g: 'shoe', name: 'shoes', pad: { x: 872, y: FL }, hide: { x: 135, y: FL }, rot: 0 },
  { g: 'bag', name: 'bag', pad: { x: 915, y: FL - PAD_HOOK + 64 }, hide: { x: 562, y: FL }, rot: 8 },
  { g: 'coat', name: 'coat', pad: { x: 842, y: FL - PAD_HOOK + 84 }, hide: { x: 314, y: FL - SEAT_H - 8 }, rot: -6 },
  { g: 'bottle', name: 'bottle', pad: { x: 890, y: FL - PAD_BENCH }, hide: { x: 455, y: FL - 30 }, rot: 14 },
];
const SHOE = 0;
const BAG = 1;
const COAT = 2;
const BOTTLE = 3;

// the nine places, in the order they get searched; `has` is the thing hiding there, if any
type Spot = { id: string; x: number; tag: XY; stop: number; has: number | null };
const SPOTS: Spot[] = [
  { id: 'heap', x: 860, tag: { x: 860, y: FL - 82 }, stop: 815, has: null },
  { id: 'bin', x: 972, tag: { x: 972, y: FL - 92 }, stop: 930, has: null },
  { id: 'table', x: 645, tag: { x: 645, y: FL - TABLE_H - 40 }, stop: 690, has: null },
  { id: 'sofa-back', x: 562, tag: { x: 566, y: FL - 108 }, stop: 605, has: BAG },
  { id: 'cushions', x: 455, tag: { x: 455, y: FL - CUSHION - 62 }, stop: 500, has: BOTTLE },
  { id: 'chair', x: 314, tag: { x: 300, y: FL - 196 }, stop: 363, has: COAT },
  { id: 'toybox', x: 232, tag: { x: 232, y: FL - TOYBOX_H - 44 }, stop: 277, has: null },
  { id: 'bed', x: 140, tag: { x: 118, y: FL - BED_TOP - 50 }, stop: 185, has: null },
  { id: 'under-bed', x: 135, tag: { x: 168, y: FL - 42 }, stop: 185, has: SHOE },
];

// =============================================================================
// THE CUES
// =============================================================================
const TEST = wAt(1, 'test');
const NAMED = ITEMS.map((it) => wAt(1, key(it.name)));
const SCATTER = wAt(2, 'wherever');
const CLUTTER_ON = wAt(2, 'dropped');
const TAGS_ON = wAt(3, 'so');
const SEARCH_A = wAt(3, 'every');
const SEARCH_B = wAt(4, 'minutes') + 3; // the kid is back at the door
const QUIZ_FROM = F(19.7);
const QUIZ_DUR = F(2.5);
const FIX = wAt(5, 'fix');
const PAD_ON = wAt(5, 'one');
const FRONT = wAt(5, 'front');
const OUT_A = wAt(6, 'leaves');
const IN_A = wAt(6, 'goes');
const NEXT = wAt(7, 'next');
const RUN_A = wAt(7, 'one');
const RUN_B = wAt(7, 'seconds') + 2; // the last thing is in hand
const TWIST = wAt(8, 'but');
const ALONE = wAt(8, 'whether');
const EXIT = wAt(8, 'without');
const LOOP_A = wAt(9, 'things');

const CHK = 11; // frames spent looking in one place
const RESULT = 6; // ...and the frame inside that the answer shows
const HOP = 8;
const LEG_F = 20; // a walk through the front door

// =============================================================================
// THE SEARCH — walk to a place, look, walk to the next. Screen time is fast-forwarded (the
// clock is not): the walks share what is left of the window after the looks.
// =============================================================================
type Seg = { kind: 'walk'; xa: number; xb: number } | { kind: 'check'; k: number };
type Timed = Seg & { f0: number; f1: number; m0: number; m1: number };
const SEARCH: Timed[] = (() => {
  const plan: (Seg & { m: number; px?: number })[] = [];
  let x = KID_X;
  SPOTS.forEach((s, k) => {
    if (s.stop !== x) plan.push({ kind: 'walk', xa: x, xb: s.stop, m: Math.abs(s.stop - x) / PX_PER_M / WALK, px: Math.abs(s.stop - x) });
    plan.push({ kind: 'check', k, m: CHECK_S });
    x = s.stop;
  });
  plan.push({ kind: 'walk', xa: x, xb: KID_X, m: Math.abs(KID_X - x) / PX_PER_M / WALK, px: Math.abs(KID_X - x) });
  const walkPx = plan.reduce((a, p) => a + (p.px ?? 0), 0);
  const v = walkPx / (SEARCH_B - SEARCH_A - SPOTS.length * CHK); // px per frame
  let f = SEARCH_A;
  let m = 0;
  return plan.map((p) => {
    const dur = p.kind === 'walk' ? (p.px ?? 0) / v : CHK;
    const seg = { ...p, f0: f, f1: f + dur, m0: m, m1: m + p.m } as Timed;
    f += dur;
    m += p.m;
    return seg;
  });
})();
const SEARCH_S = SEARCH[SEARCH.length - 1].m1;
const CHECKS = SEARCH.filter((s): s is Timed & { kind: 'check'; k: number } => s.kind === 'check');
const resultAt = (k: number) => Math.round(CHECKS[k].f0 + RESULT);
const MISSES = SPOTS.filter((s) => s.has === null).length;
const searchClock = (f: number) => {
  if (f < SEARCH_A) return 0;
  const s = SEARCH.find((x) => f < x.f1);
  return s ? mix(s.m0, s.m1, prog(f, s.f0, s.f1)) : SEARCH_S;
};

// found things go into the kid's arms in the order they turn up
const FOUND_ORDER = CHECKS.filter((c) => SPOTS[c.k].has !== null).map((c) => SPOTS[c.k].has as number);
const foundAt = (i: number) => resultAt(SPOTS.findIndex((s) => s.has === i)) - 1;

// the evening: out through the front door, back in, everything onto the pad (top of the pile first)
const EVE = [...FOUND_ORDER].reverse();
const eveDropAt = (i: number) => IN_A + LEG_F + 1 + EVE.indexOf(i) * 6;
// the morning: four grabs, straight off the pad, the last in hand on "seconds"
const GRAB_ORDER = [COAT, BAG, BOTTLE, SHOE];
const GRAB_GAP = (RUN_B - HOP - RUN_A) / (ITEMS.length - 1);
const grabAt = (i: number) => Math.round(RUN_A + GRAB_ORDER.indexOf(i) * GRAB_GAP);
const RUN_S = ITEMS.length * GRAB_S;
const runClock = (f: number) => GRAB_S * ITEMS.reduce((a, _, i) => a + prog(f, grabAt(i), grabAt(i) + HOP), 0);
// the loop: back in through the door, everything back on the pad (top of the pile first)
const LOOP_IN = LOOP_A - 2;
const LOOP_DROP = [...GRAB_ORDER].reverse();
const loopDropAt = (i: number) => LOOP_IN + LEG_F + 2 + LOOP_DROP.indexOf(i) * 7;
const LAST_LOOP_DROP = Math.max(...ITEMS.map((_, i) => loopDropAt(i) + HOP + 1));

// =============================================================================
// THE KID — legs are the search walks plus four trips through the front door.
// =============================================================================
const OUTSIDE = 1130;
type Leg = { xa: number; xb: number; from: number; to: number };
const LEGS: Leg[] = [
  ...SEARCH.filter((s): s is Timed & { kind: 'walk' } => s.kind === 'walk').map((s) => ({ xa: s.xa, xb: s.xb, from: s.f0, to: s.f1 })),
  { xa: KID_X, xb: OUTSIDE, from: OUT_A, to: OUT_A + LEG_F },
  { xa: OUTSIDE, xb: KID_X, from: IN_A, to: IN_A + LEG_F },
  { xa: KID_X, xb: OUTSIDE, from: EXIT, to: EXIT + LEG_F },
  { xa: OUTSIDE, xb: KID_X, from: LOOP_IN, to: LOOP_IN + LEG_F },
];
const easeLeg = (u: number) => EASE_INOUT(u) * 0.3 + u * 0.7;
const legX = (l: Leg, f: number) => mix(l.xa, l.xb, easeLeg(prog(f, l.from, l.to)));
/** The frames the kid goes through the front door. */
const DOOR_CROSS = LEGS.filter((l) => l.xa === OUTSIDE || l.xb === OUTSIDE).map((l) => {
  for (let f = Math.ceil(l.from); f <= l.to; f += 1) if ((legX(l, f) - DOOR_X) * Math.sign(l.xb - l.xa) >= 0) return f;
  return l.to;
});

const kidAt = (f: number): XY & { dir: number; dist: number } => {
  let x = KID_X;
  let dir = 1;
  let dist = 0;
  for (const l of LEGS) {
    if (f < l.from) break;
    x = legX(l, f);
    dir = Math.sign(l.xb - l.xa);
    const len = Math.abs(l.xb - l.xa);
    const strides = Math.max(1, Math.round(len / (11 * WS * Math.PI)));
    dist = f >= l.to ? 0 : (Math.abs(x - l.xa) / len) * strides * 11 * Math.PI;
  }
  // looking in a place: face it
  const c = CHECKS.find((s) => f >= s.f0 && f < s.f1);
  if (c) dir = Math.sign(SPOTS[c.k].x - SPOTS[c.k].stop) || -1;
  if (x === KID_X && dist === 0) dir = 1;
  return { x, y: FL, dir, dist };
};
const handAt = (f: number, k: number): XY => {
  const w = kidAt(f);
  return { x: w.x + w.dir * 32, y: FL - 44 - k * 30 };
};

// =============================================================================
// THE THINGS — every thing is always at one station (pad, hiding place, or in the kid's
// arms) or hopping between two. The tallies count stations; nothing is keyframed.
// =============================================================================
type Station = { at: 'pad' } | { at: 'hide' } | { at: 'hand'; k: number };
type Move = { a: number; dur: number; to: Station; lift: number };
const MOVES: Move[][] = ITEMS.map((_, i) => [
  { a: SCATTER + i * 6, dur: 16, to: { at: 'hide' }, lift: 170 },
  { a: foundAt(i), dur: HOP, to: { at: 'hand', k: FOUND_ORDER.indexOf(i) }, lift: 40 },
  { a: eveDropAt(i), dur: HOP + 1, to: { at: 'pad' }, lift: 40 },
  { a: grabAt(i), dur: HOP, to: { at: 'hand', k: GRAB_ORDER.indexOf(i) }, lift: 30 },
  { a: loopDropAt(i), dur: HOP + 1, to: { at: 'pad' }, lift: 40 },
]);
const stationXY = (i: number, s: Station, f: number): XY => (s.at === 'pad' ? ITEMS[i].pad : s.at === 'hide' ? ITEMS[i].hide : handAt(f, s.k));
const stationS = (s: Station) => (s.at === 'hand' ? HAND_S : 1);
const stationRot = (i: number, s: Station) => (s.at === 'hide' ? ITEMS[i].rot : 0);

type Pose = { p: XY; s: number; rot: number; st: Station; moving: boolean };
const poseAt = (i: number, f: number): Pose => {
  let st: Station = { at: 'pad' };
  for (const m of MOVES[i]) {
    if (f < m.a) break;
    if (f < m.a + m.dur) {
      const u = EASE_INOUT(prog(f, m.a, m.a + m.dur));
      return {
        p: hop(stationXY(i, st, m.a), stationXY(i, m.to, f), u, m.lift),
        s: mix(stationS(st), stationS(m.to), u),
        rot: mix(stationRot(i, st), stationRot(i, m.to), u),
        st: m.to,
        moving: true,
      };
    }
    st = m.to;
  }
  return { p: stationXY(i, st, f), s: stationS(st), rot: stationRot(i, st), st, moving: false };
};

// =============================================================================
// THE TALLY — three readouts, all derived: the frame-0 payoff, the search, the pad morning.
// =============================================================================
const tallyAt = (f: number) => {
  if (f < TEST) return { t: RUN_S, places: 1, asked: 0, done: true };
  if (f < NEXT) {
    const t = searchClock(f);
    const places = CHECKS.filter((_, k) => resultAt(k) <= f).length;
    const asked = CHECKS.filter((c, k) => SPOTS[c.k].has === null && resultAt(k) <= f).length;
    return { t, places, asked, done: false };
  }
  const t = runClock(f);
  return { t, places: f >= RUN_A ? 1 : 0, asked: 0, done: t >= RUN_S };
};

// the claims, checked at module load — if the model changes, the video refuses to render a lie
{
  const n2w = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  const say4 = VO[4].text.toLowerCase();
  if (!say4.includes(`${n2w[ITEMS.length]} things`)) throw new Error(`VO says "${VO[4].text}" but the model has ${ITEMS.length} things`);
  if (!say4.includes(`${n2w[SPOTS.length]} places`)) throw new Error(`VO says "${VO[4].text}" but the model has ${SPOTS.length} places`);
  if (!say4.includes(`over ${n2w[Math.floor(SEARCH_S / 60)]} minutes`)) throw new Error(`VO says "${VO[4].text}" but the search takes ${clock(SEARCH_S)}`);
  if (!VO[7].text.toLowerCase().includes(`${n2w[RUN_S]} seconds`)) throw new Error(`VO says "${VO[7].text}" but the pad run takes ${RUN_S}s`);
  if (RUN_S >= 10) throw new Error('the pad run must pass the 10-second test');
  if (SEARCH_S <= 10) throw new Error('the search must fail the 10-second test');
  if (FOUND_ORDER.length !== ITEMS.length || new Set(FOUND_ORDER).size !== ITEMS.length) throw new Error('every thing must be found exactly once');
  if (MISSES !== SPOTS.length - ITEMS.length) throw new Error('misses + finds must equal places');
  if (Math.abs(SEARCH[SEARCH.length - 1].f1 - SEARCH_B) > 0.01) throw new Error('the search must end on its cue');
  ITEMS.forEach((_, i) => {
    if (MOVES[i][0].a + MOVES[i][0].dur > SEARCH_A) throw new Error(`${ITEMS[i].name} must be hidden before the search`);
    if (MOVES[i][2].a + MOVES[i][2].dur > NEXT) throw new Error(`${ITEMS[i].name} must be back on the pad before the morning`);
    if (MOVES[i][2].a < IN_A + LEG_F) throw new Error(`${ITEMS[i].name} is dropped before the kid is back in`);
    if (MOVES[i][4].a < LOOP_IN + LEG_F) throw new Error(`${ITEMS[i].name} is dropped before the kid is back in (loop)`);
    for (let k = 1; k < MOVES[i].length; k += 1) if (MOVES[i][k].a < MOVES[i][k - 1].a + MOVES[i][k - 1].dur) throw new Error(`${ITEMS[i].name}: moves overlap`);
  });
  const a = tallyAt(0);
  const b = tallyAt(END - 1);
  if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`the last frame must count the same as frame 0 (${JSON.stringify(a)} vs ${JSON.stringify(b)})`);
  ITEMS.forEach((_, i) => {
    const p0 = poseAt(i, 0);
    const p1 = poseAt(i, END - 1);
    if (Math.hypot(p0.p.x - p1.p.x, p0.p.y - p1.p.y) > 0.5 || p1.moving) throw new Error(`${ITEMS[i].name} must end where frame 0 has it`);
  });
  if (kidAt(END - 1).x !== kidAt(0).x || kidAt(END - 1).dist !== 0) throw new Error('the kid must end where frame 0 has them');
  if (LAST_LOOP_DROP > END - 15) throw new Error('the loop must settle before the last frame');
  for (let k = 1; k < LEGS.length; k += 1) {
    if (LEGS[k].from < LEGS[k - 1].to - 0.01) throw new Error('walks overlap');
    if (LEGS[k].xa !== LEGS[k - 1].xb) throw new Error('the kid teleports');
  }
  if (EXIT < RUN_B + 10) throw new Error('the kid leaves before the run is done');
}

// =============================================================================
// THE BAND — one headline at a time; each runs until the next one starts.
// =============================================================================
const n = (x: number) => ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN'][x] ?? `${x}`;
const HOOK_LINES = [{ text: 'THE 10-SECOND' }, { text: 'MORNING TEST', color: ESS }];
const HEADS: { a: number; lines: { text: string; color?: string }[] }[] = [
  { a: -30, lines: HOOK_LINES },
  { a: TEST, lines: [{ text: 'THE TEST: FIND' }, { text: 'SHOES · BAG · COAT · BOTTLE', color: ESS }] },
  { a: SCATTER, lines: [{ text: 'WHEREVER IT GOT' }, { text: 'DROPPED LAST NIGHT.', color: CR.mess }] },
  { a: SEARCH_A, lines: [{ text: 'EVERY PLACE IT MIGHT BE' }, { text: 'GETS CHECKED.', color: CR.warn }] },
  { a: wAt(4, 'four'), lines: [{ text: `${ITEMS.length} THINGS · ${SPOTS.length} PLACES` }, { text: `OVER ${n(Math.floor(SEARCH_S / 60))} MINUTES.`, color: CR.mess }] },
  { a: FIX, lines: [{ text: 'ONE FIXED SPOT,' }, { text: 'BY THE FRONT DOOR.', color: ESS }] },
  { a: wAt(6, 'everything'), lines: [{ text: 'EVERYTHING THAT LEAVES' }, { text: 'LIVES THERE.', color: ESS }] },
  { a: IN_A, lines: [{ text: 'AND GOES BACK' }, { text: 'WHEN YOU WALK IN.', color: ESS }] },
  { a: NEXT, lines: [{ text: 'NEXT MORNING:' }, { text: `1 PLACE. ${n(RUN_S)} SECONDS.`, color: ESS }] },
  { a: TWIST, lines: [{ text: 'NOT A SPEED TEST.' }, { text: 'A DO-IT-ALONE TEST.', color: ESS }] },
  { a: LOOP_A, lines: HOOK_LINES },
];

const TAG_COLORS: Record<TagState, string> = { open: CR.warn, miss: CR.mess, hit: ESS };

export default function Short40Launch() {
  const f = useCurrentFrame();

  const punch = f < LOOP_A ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 30)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP_A, END));
  const kid = kidAt(f);
  const tally = tallyAt(f);

  // the band and tally step aside for the quiz card
  const quizOff = clamp01(1 - prog(f, QUIZ_FROM - 6, QUIZ_FROM + 4) + prog(f, QUIZ_FROM + QUIZ_DUR - 4, QUIZ_FROM + QUIZ_DUR + 6));

  // the before-world: no pad, a heap and a bin in the hall, tags on every place it might be
  const padOn = Math.max(1 - prog(f, SCATTER + 36, SCATTER + 48), prog(f, PAD_ON, PAD_ON + 10));
  const clutterOn = prog(f, CLUTTER_ON, CLUTTER_ON + 10) * (1 - prog(f, FIX, FIX + 10));
  const tagsOff = 1 - prog(f, FIX, FIX + 10);
  // the payoff highlight: on at frame 0, back for the reveal, back for the last frame
  const hookOn = Math.max(
    1 - prog(f, TEST - 6, TEST + 6),
    bump(f, PAD_ON, 40) * 0.8,
    bump(f, wAt(6, 'lives'), 30) * 0.8,
    prog(f, LAST_LOOP_DROP, END - 12),
  );

  // the front door lights whenever someone goes through it (and when it is named)
  const doorGlow = Math.max(bump(f, FRONT - 2, 30), ...DOOR_CROSS.map((c) => bump(f, c - 8, 22)));

  const ffRatio = f < NEXT ? SEARCH_S / ((SEARCH_B - SEARCH_A) / 30) : RUN_S / ((RUN_B - RUN_A) / 30);
  const ffOn = f < NEXT ? prog(f, SEARCH_A, SEARCH_A + 6) * (1 - prog(f, SEARCH_B, SEARCH_B + 8)) : prog(f, RUN_A, RUN_A + 6) * (1 - prog(f, RUN_B, RUN_B + 8));
  const askedOn = prog(f, ALONE, ALONE + 8) * (1 - prog(f, LOOP_A - 6, LOOP_A + 4));

  const poses = ITEMS.map((_, i) => poseAt(i, f));
  const inArms = (i: number) => poses[i].st.at === 'hand';

  // "where's my…?" — the last miss, said out loud
  const lastMiss = CHECKS.map((c, k) => ({ c, k }))
    .filter(({ c, k }) => SPOTS[c.k].has === null && resultAt(k) <= f)
    .pop();
  const sayOn = lastMiss ? 1 - prog(f, resultAt(lastMiss.k) + 12, resultAt(lastMiss.k) + 18) : 0;

  const clockColor = tally.t > 10 ? CR.mess : tally.done ? ESS : CR.text;
  const clockSub = tally.t > 10 ? 'OVER 10 SECONDS' : tally.done ? 'UNDER 10 SECONDS' : 'READY. GO.';

  return (
    <AbsoluteFill style={{ background: CR.stage }}>
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 72% 40% at 50% 55%, rgba(181,221,106,0.06), rgba(11,14,20,0) 70%)' }} />
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          <Tally
            y={330}
            opacity={quizOff}
            cols={[
              { label: 'CLOCK', value: clock(tally.t), color: clockColor, sub: clockSub },
              {
                label: 'PLACES CHECKED',
                value: `${tally.places}`,
                color: tally.done ? ESS : tally.places > 0 ? CR.warn : CR.text,
                sub: tally.done ? 'ONE SPOT' : tally.places > 1 ? 'ALL OVER THE HOUSE' : '',
              },
              {
                label: 'ASKED YOU',
                value: `${tally.asked}`,
                color: tally.asked > 0 ? CR.mess : tally.done ? ESS : CR.text,
                sub: tally.asked > 0 ? '"WHERE\'S MY…?"' : tally.done ? 'DID IT ALONE' : '',
                glow: askedOn,
              },
            ]}
          />
          <text x={540} y={515} fill={CR.faint} fontFamily={FONT_MONO} fontSize={21} fontWeight={500} letterSpacing={1.2} textAnchor="middle" opacity={quizOff}>
            {`MODEL · WALK ${WALK} M/S · ${CHECK_S} S A PLACE · ${GRAB_S} S A GRAB`}
          </text>
          {ffOn > 0.01 ? (
            <text x={540} y={588} fill={CR.warn} fontFamily={FONT_BODY} fontSize={28} fontWeight={700} letterSpacing={3} textAnchor="middle" opacity={ffOn}>
              {`▶▶ FAST-FORWARD ×${Math.round(ffRatio)}`}
            </text>
          ) : null}
          {askedOn > 0.01 ? (
            <text x={540} y={588} fill={CR.mess} fontFamily={FONT_BODY} fontSize={28} fontWeight={700} letterSpacing={3} textAnchor="middle" opacity={askedOn}>
              {`THE SEARCH: ASKED YOU ${MISSES} TIMES`}
            </text>
          ) : null}

          <RoomsSection h={H} />
          <FrontDoor x={DOOR_X} floor={FL} h={H.doorH} glow={doorGlow} color={ESS} />

          {/* the launch pad and its empty slots */}
          <LaunchPad x0={PAD.x0} x1={PAD.x1} floor={FL} hooks={PAD.hooks} color={ESS} opacity={padOn} glow={hookOn} />
          {ITEMS.map((it, i) => (
            <SlotMark
              key={`s${i}`}
              x={it.pad.x}
              y={it.pad.y}
              color={ESS}
              s={0.9}
              opacity={padOn * (poses[i].st.at === 'pad' && !poses[i].moving ? 0 : 1) * prog(f, PAD_ON, PAD_ON + 10)}
            />
          ))}
          {padOn > 0.01 ? (
            <text x={(PAD.x0 + PAD.x1) / 2} y={FL + 44} fill={ESS} fontFamily={FONT_MONO} fontSize={24} fontWeight={700} letterSpacing={2.5} textAnchor="middle" opacity={padOn}>
              LAUNCH PAD
            </text>
          ) : null}
          <Heap x={SPOTS[0].x} floor={FL} opacity={clutterOn} />
          <Bin x={SPOTS[1].x} floor={FL} opacity={clutterOn} />

          {/* hidden things sit BEHIND the furniture; everything else in front of it */}
          {ITEMS.map((it, i) =>
            poses[i].st.at === 'hide' && !poses[i].moving ? (
              <Thing key={`h${i}`} g={it.g} x={poses[i].p.x} y={poses[i].p.y} s={poses[i].s} rot={poses[i].rot} color={ESS} />
            ) : null,
          )}
          <Bed x0={80} x1={200} floor={FL} />
          <ToyBox x={232} floor={FL} />
          <Chair x={318} floor={FL} />
          <Sofa x0={380} x1={540} floor={FL} />
          <Table x0={598} x1={692} floor={FL} />

          {ITEMS.map((it, i) => {
            if ((poses[i].st.at === 'hide' && !poses[i].moving) || (inArms(i) && !poses[i].moving)) return null;
            const named = bump(f, NAMED[i] - 2, 18);
            return (
              <g key={`t${i}`}>
                <Pulse x={poses[i].p.x} y={poses[i].p.y} k={named} color={ESS} />
                <Thing g={it.g} x={poses[i].p.x} y={poses[i].p.y} s={poses[i].s} rot={poses[i].rot} color={ESS} />
              </g>
            );
          })}

          {/* the places to check */}
          {SPOTS.map((s, k) => {
            const on = prog(f, TAGS_ON + k * 2, TAGS_ON + k * 2 + 6) * tagsOff;
            const r = resultAt(k);
            const state: TagState = f < r ? 'open' : s.has === null ? 'miss' : 'hit';
            const look = f >= CHECKS[k].f0 && f < r ? 0.5 + 0.5 * Math.sin((f - CHECKS[k].f0) * 1.1) : 0;
            return <SpotTag key={s.id} x={s.tag.x} y={s.tag.y} state={state} pop={Math.max(prog(f, r, r + 8), look * 0.4)} opacity={on} colors={TAG_COLORS} />;
          })}

          <Walker x={kid.x} y={kid.y} dist={kid.dist} s={WS} />
          {ITEMS.map((it, i) =>
            inArms(i) && !poses[i].moving ? <Thing key={`a${i}`} g={it.g} x={poses[i].p.x} y={poses[i].p.y} s={poses[i].s} color={ESS} /> : null,
          )}
          <Say at={{ x: kid.x, y: FL - 118 * WS }} text="WHERE'S MY…?" color={CR.mess} opacity={sayOn} size={22} />
        </svg>

        <Stamp text="TEST FAILED" at={SEARCH_B} until={QUIZ_FROM} color={CR.mess} x={540} y={900} size={56} rotate={-5} />
        <Stamp text="TEST PASSED" at={RUN_B} until={ALONE} color={ESS} x={540} y={900} size={56} rotate={-5} />

        {HEADS.map((h, k) => {
          const next = HEADS[k + 1];
          const b = next ? next.a : END + 30;
          const op = Math.min(prog(f, h.a + 2, h.a + 9), 1 - prog(f, b - 7, b)) * quizOff;
          if (op <= 0.01) return null;
          return (
            <div key={k} style={{ opacity: op }}>
              <BigTitle lines={h.lines} y={110} size={h.lines[1].text.length > 22 ? 52 : 58} warm />
            </div>
          );
        })}
      </AbsoluteFill>

      <Sequence from={QUIZ_FROM} durationInFrames={QUIZ_DUR}>
        <PauseCard title="PAUSE" subtitle={`${clock(SEARCH_S)} → under 10 s. how?`} durSec={QUIZ_DUR / 30} accent={ACCENT} y={300} />
      </Sequence>

      <Captions lines={VO} y={1510} accent={ACCENT} plate />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
