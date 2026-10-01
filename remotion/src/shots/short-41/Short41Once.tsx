import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, PauseCard, ProgressBar, Stamp, prog, timeWords } from '../../lib/shorts';
import { CR, Chip, EASE_INOUT, Glyph, Pulse, Tally, Thing, Walker, XY, clamp01, hop, mix } from '../../lib/carry';
import {
  BED_TOP,
  Bed,
  CUSHION,
  Chair,
  FrontDoor,
  Hamper,
  KeyHook,
  MailTray,
  RoomsLayout,
  RoomsSection,
  SEAT_H,
  SlotMark,
  Sofa,
  TABLE_H,
  Table,
  TouchBadge,
} from '../../lib/rooms';
import { FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short41Once',
  durationInSeconds: 43.3,
  fps: 30,
  width: 1080,
  height: 1920,
};

const HALL = '#b5dd6a'; // the hall, and everything that lives by the front door
const ACCENT = HALL;
const F = (s: number) => Math.round(s * 30);
const END = F(43.3);

// every cue is a spoken word — retimes itself when the real voice lands in vo.gen.ts
const key = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
const wAt = (line: number, word: string, nth = 0) => {
  const w = timeWords(VO[line]).filter((x) => key(x.w) === word)[nth];
  if (!w) throw new Error(`Short41Once: no word "${word}" (#${nth}) in VO line ${line} ("${VO[line].text}")`);
  return F(w.start);
};
const bump = (f: number, a: number, dur: number) => Math.sin(Math.PI * prog(f, a, a + dur));

// =============================================================================
// THE HOUSE — one floor, three rooms, the front door on the right. A thing is filled with the
// colour of the room it BELONGS in: the shirt is bedroom-blue, the mail and keys hall-green.
// Nothing belongs in the living room — which is exactly where everything gets put down.
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
    { id: 'hall', label: 'HALL', color: HALL, x0: 700, x1: 1010 },
  ],
};
const FL = H.floor;
const DOOR_X = 1010;
const OUTSIDE = 1190;
const WS = 1.5;
const HAND_S = 0.6;

const HAMPER_X = 306;
const CHAIR_X = 238;
const TRAY = { x: 835, y: FL - 150 };
const HOOK = { x: 930, y: FL - 170 };

type Place = 'table' | 'sofa' | 'chair' | 'bed' | 'tray' | 'hook' | 'hamper';
const MAIL = 0;
const SHIRT = 1;
const KEYS = 2;
type Item = { g: Glyph; name: string; color: string; home: Place; tall: number };
const ITEMS: Item[] = [
  { g: 'mail', name: 'mail', color: HALL, home: 'tray', tall: 38 },
  { g: 'shirt', name: 'shirt', color: CR.up, home: 'hamper', tall: 52 },
  { g: 'keys', name: 'keys', color: HALL, home: 'hook', tall: 30 },
];

// where the walker stands to use a place, and where each thing sits on it
type Spot = { label: string; stop: number; at: XY[]; rot?: number[]; behind?: boolean[] };
const PLACES: Record<Place, Spot> = {
  // the table is where it all gets dumped: shirt at the bottom, mail on top of it, keys beside
  table: { label: 'TABLE', stop: 722, at: [{ x: 626, y: FL - TABLE_H - 40 }, { x: 628, y: FL - TABLE_H }, { x: 674, y: FL - TABLE_H }], rot: [-5, 0, 0] },
  sofa: {
    label: 'SOFA',
    stop: 572,
    at: [{ x: 425, y: FL - CUSHION }, { x: 498, y: FL - CUSHION }, { x: 468, y: FL - 38 }],
    rot: [-6, 0, 28],
    behind: [false, false, true], // lost down the back of the cushions
  },
  chair: { label: 'CHAIR', stop: 205, at: [{ x: CHAIR_X - 12, y: FL - SEAT_H - 8 }, { x: CHAIR_X, y: FL - SEAT_H - 8 }, { x: CHAIR_X, y: FL - SEAT_H - 8 }], rot: [8, 0, 0] },
  bed: { label: 'BED', stop: 180, at: [{ x: 140, y: FL - BED_TOP }, { x: 150, y: FL - BED_TOP }, { x: 160, y: FL - BED_TOP }], rot: [0, -8, 0] },
  tray: { label: 'TRAY', stop: 772, at: [TRAY, TRAY, TRAY] },
  hook: { label: 'HOOK', stop: 872, at: [0, 1, 2].map(() => ({ x: HOOK.x + 16, y: HOOK.y + 38 })) },
  hamper: { label: 'HAMPER', stop: 366, at: [0, 1, 2].map(() => ({ x: HAMPER_X, y: FL - 50 })) },
};
const HOME_X = PLACES.hamper.stop; // frame 0: the walker has just dropped the shirt in the hamper

// =============================================================================
// THE CUES
// =============================================================================
const REW1 = wAt(1, 'heres');
const REW2 = wAt(6, 'the');
const RESET1 = REW1 + 10;
const RESET2 = REW2 + 10;
const QUIZ_FROM = F(VO[5].end + 0.25);
const QUIZ_DUR = F(VO[6].start - 0.25) - QUIZ_FROM;
const ELEVEN = wAt(5, 'eleven');
const DONE = wAt(8, 'done');
const TWIST = wAt(9, 'because');
const AGAIN = wAt(9, 'picking');
const LOOP_A = wAt(10, 'dont');
const AWAY = wAt(10, 'put', 1);
const ONCE = wAt(0, 'once');

// what happens, in order — each put-down LANDS on the word that names it
type Order = { i: number; to: Place; cue: number };
const BEFORE: Order[] = [
  { i: SHIRT, to: 'table', cue: wAt(1, 'put') },
  { i: MAIL, to: 'table', cue: wAt(1, 'all') },
  { i: KEYS, to: 'table', cue: wAt(1, 'down') },
  { i: MAIL, to: 'sofa', cue: wAt(2, 'sofa') },
  { i: MAIL, to: 'chair', cue: wAt(2, 'chair') },
  { i: MAIL, to: 'tray', cue: wAt(2, 'tray') },
  { i: SHIRT, to: 'bed', cue: wAt(3, 'bed') },
  { i: SHIRT, to: 'chair', cue: wAt(3, 'chair') },
  { i: SHIRT, to: 'hamper', cue: wAt(3, 'hamper') },
  { i: KEYS, to: 'sofa', cue: wAt(4, 'sofa') },
  { i: KEYS, to: 'hook', cue: wAt(4, 'hook') },
];
const AFTER: Order[] = [
  { i: KEYS, to: 'hook', cue: wAt(7, 'hook') },
  { i: MAIL, to: 'tray', cue: wAt(7, 'tray') },
  { i: SHIRT, to: 'hamper', cue: wAt(7, 'hamper') },
];

// =============================================================================
// THE WALKER'S DAY — orders become walks, pick-ups and put-downs. To move a thing the walker
// walks to it, picks it up, walks to where it goes and sets it down; every set-down is ONE
// TOUCH. Walks run at a steady pace (fast-forward, VMIN..VMAX px/frame) and any spare time is
// spent standing still first, so each put-down lands on its word.
// =============================================================================
const HOP = 7;
const VMIN = 7;
const VMAX = 18;
type Station = { at: 'hand' } | { at: Place };
type Move = { a: number; dur: number; to: Station; lift: number };
type Leg = { xa: number; xb: number; from: number; to: number };
type Track = ({ kind: 'leg' } & Leg) | { kind: 'jump'; at: number; x: number };

const TRACK: Track[] = [];
const MOVES: Move[][] = ITEMS.map(() => []);
const LANDS: { i: number; to: Place; at: number; cue: number; phase: number }[] = [];
const runPhase = (orders: Order[], reset: number) => {
  // rewind: everyone's back outside the front door, arms full
  TRACK.push({ kind: 'jump', at: reset, x: OUTSIDE });
  ITEMS.forEach((_, i) => MOVES[i].push({ a: reset, dur: 0, to: { at: 'hand' }, lift: 0 }));
  const where: Station[] = ITEMS.map(() => ({ at: 'hand' }));
  let t = reset + 2;
  let x = OUTSIDE;
  const walk = (xb: number, frames: number) => {
    if (xb === x) return;
    TRACK.push({ kind: 'leg', xa: x, xb, from: t, to: t + frames });
    t += frames;
    x = xb;
  };
  orders.forEach((o) => {
    const st = where[o.i];
    const pick = st.at !== 'hand';
    const s1 = st.at !== 'hand' ? PLACES[st.at].stop : x;
    const s2 = PLACES[o.to].stop;
    const d1 = Math.abs(s1 - x);
    const d2 = Math.abs(s2 - s1);
    const px = d1 + d2;
    const avail = o.cue - t - (pick ? HOP : 0) - HOP;
    const walkF = px === 0 ? 0 : Math.max(px / VMAX, Math.min(avail, px / VMIN));
    t += Math.max(0, avail - walkF);
    walk(s1, px ? (walkF * d1) / px : 0);
    if (pick) {
      MOVES[o.i].push({ a: t, dur: HOP, to: { at: 'hand' }, lift: 34 });
      t += HOP;
    }
    walk(s2, px ? (walkF * d2) / px : 0);
    MOVES[o.i].push({ a: t, dur: HOP, to: { at: o.to }, lift: 44 });
    t += HOP;
    LANDS.push({ i: o.i, to: o.to, at: t, cue: o.cue, phase: reset });
    where[o.i] = { at: o.to };
  });
  return { x, t };
};
const END_BEFORE = runPhase(BEFORE, RESET1);
const END_AFTER = runPhase(AFTER, RESET2);

const easeLeg = (u: number) => EASE_INOUT(u) * 0.3 + u * 0.7;
const legX = (l: Leg, f: number) => mix(l.xa, l.xb, easeLeg(prog(f, l.from, l.to)));
const walkerAt = (f: number): XY & { dir: number; dist: number } => {
  let x = HOME_X;
  let dir = -1;
  let dist = 0;
  for (const e of TRACK) {
    if (e.kind === 'jump') {
      if (f < e.at) break;
      x = e.x;
      dir = -1;
      dist = 0;
      continue;
    }
    if (f < e.from) break;
    x = legX(e, f);
    dir = Math.sign(e.xb - e.xa);
    const len = Math.abs(e.xb - e.xa);
    const strides = Math.max(1, Math.round(len / (11 * WS * Math.PI)));
    dist = f >= e.to ? 0 : (Math.abs(x - e.xa) / len) * strides * 11 * Math.PI;
  }
  return { x, y: FL, dir, dist };
};
const LEGS = TRACK.filter((e): e is { kind: 'leg' } & Leg => e.kind === 'leg');
/** The frames the walker comes in through the front door. */
const DOOR_CROSS = LEGS.filter((l) => l.xa === OUTSIDE).map((l) => {
  for (let f = Math.ceil(l.from); f <= l.to; f += 1) if (legX(l, f) <= DOOR_X) return f;
  return l.to;
});

// =============================================================================
// THE THINGS — every thing is always at one station (a place, or the walker's arms) or hopping
// between two. The badges and the tally count the stations; nothing is keyframed.
// =============================================================================
const stationAt = (i: number, f: number): { st: Station; moving: boolean } => {
  let st: Station = { at: ITEMS[i].home };
  for (const m of MOVES[i]) {
    if (f < m.a) break;
    if (f < m.a + m.dur) return { st: m.to, moving: true };
    st = m.to;
  }
  return { st, moving: false };
};
/** Things in the arms stack up in a fixed order: mail at the bottom, then keys, then the shirt. */
const STACK = [MAIL, KEYS, SHIRT];
const handAt = (f: number, i: number): XY => {
  const w = walkerAt(f);
  const k = STACK.filter((j) => STACK.indexOf(j) < STACK.indexOf(i) && stationAt(j, f).st.at === 'hand' && !stationAt(j, f).moving).length;
  return { x: w.x + w.dir * 34, y: FL - 60 * WS - k * 24 };
};
const placeXY = (i: number, p: Place): XY => PLACES[p].at[i];
const stationXY = (i: number, s: Station, f: number): XY => (s.at === 'hand' ? handAt(f, i) : placeXY(i, s.at));
const stationS = (s: Station) => (s.at === 'hand' ? HAND_S : 1);
const stationRot = (i: number, s: Station) => (s.at === 'hand' ? 0 : PLACES[s.at].rot?.[i] ?? 0);

type Pose = { p: XY; s: number; rot: number; st: Station; moving: boolean };
const poseAt = (i: number, f: number): Pose => {
  let st: Station = { at: ITEMS[i].home };
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
// THE COUNT — a touch is one set-down. Before the first rewind the house is in its frame-0
// state: everything home, touched once.
// =============================================================================
const touchesAt = (i: number, f: number) => {
  const phase = f >= RESET2 ? RESET2 : f >= RESET1 ? RESET1 : null;
  if (phase === null) return 1;
  return LANDS.filter((l) => l.i === i && l.phase === phase && l.at <= f).length;
};
const lastLandAt = (i: number, f: number) => LANDS.filter((l) => l.i === i && l.at <= f).pop()?.at ?? -99;
const tallyAt = (f: number) => {
  const per = ITEMS.map((_, i) => touchesAt(i, f));
  const st = ITEMS.map((_, i) => stationAt(i, f));
  const down = st.filter((s) => !s.moving && s.st.at !== 'hand' && !ITEMS.some((it) => it.home === s.st.at)).length;
  const away = st.filter((s, i) => !s.moving && s.st.at === ITEMS[i].home).length;
  return { per, touches: per.reduce((a, b) => a + b, 0), down, away };
};

// the "for now" spots of the before-run: every put-down that wasn't home
const GHOSTS = LANDS.filter((l) => l.phase === RESET1 && l.to !== ITEMS[l.i].home);
const BEFORE_TOUCHES = BEFORE.length;
const AFTER_TOUCHES = AFTER.length;
const route = (i: number) => BEFORE.filter((o) => o.i === i).map((o) => PLACES[o.to].label).join(' → ');

// the claims, checked at module load — if the model changes, the video refuses to render a lie
{
  const n2w = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
  const say5 = VO[5].text.toLowerCase();
  if (!say5.includes(`${n2w[ITEMS.length]} things`)) throw new Error(`VO says "${VO[5].text}" but the model has ${ITEMS.length} things`);
  if (!say5.includes(`${n2w[BEFORE_TOUCHES]} touches`)) throw new Error(`VO says "${VO[5].text}" but the before-run is ${BEFORE_TOUCHES} touches`);
  if (!VO[8].text.toLowerCase().includes(`${n2w[AFTER_TOUCHES]} touches`)) throw new Error(`VO says "${VO[8].text}" but the after-run is ${AFTER_TOUCHES} touches`);
  if (GHOSTS.length !== BEFORE_TOUCHES - AFTER_TOUCHES) throw new Error('every extra touch must be a "for now" spot');
  ITEMS.forEach((it, i) => {
    const b = BEFORE.filter((o) => o.i === i);
    const a = AFTER.filter((o) => o.i === i);
    if (b[b.length - 1].to !== it.home || b.slice(0, -1).some((o) => o.to === it.home)) throw new Error(`${it.name}: the before-run must end home, and only then`);
    if (a.length !== 1 || a[0].to !== it.home) throw new Error(`${it.name}: the rule is one touch, straight home`);
    for (let k = 1; k < MOVES[i].length; k += 1) if (MOVES[i][k].a < MOVES[i][k - 1].a + MOVES[i][k - 1].dur) throw new Error(`${it.name}: moves overlap`);
  });
  LANDS.forEach((l) => {
    if (l.at - l.cue > 6) throw new Error(`${ITEMS[l.i].name} -> ${l.to} lands ${l.at - l.cue} frames after its word`);
  });
  if (END_BEFORE.t > REW2 - 30) throw new Error('the before-run must be over before the rewind');
  if (END_AFTER.x !== HOME_X) throw new Error('the walker must end where frame 0 has them');
  if (END_AFTER.t > DONE) throw new Error('the after-run must be over by "done"');
  for (let k = 1; k < LEGS.length; k += 1) if (LEGS[k].from < LEGS[k - 1].to - 0.01) throw new Error('walks overlap');
  const a = tallyAt(0);
  const b = tallyAt(END - 1);
  if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`the last frame must count the same as frame 0 (${JSON.stringify(a)} vs ${JSON.stringify(b)})`);
  if (a.touches !== AFTER_TOUCHES || a.away !== ITEMS.length) throw new Error('frame 0 is the payoff: everything home, one touch each');
  ITEMS.forEach((_, i) => {
    const p0 = poseAt(i, 0);
    const p1 = poseAt(i, END - 1);
    if (Math.hypot(p0.p.x - p1.p.x, p0.p.y - p1.p.y) > 0.5 || p1.moving) throw new Error(`${ITEMS[i].name} must end where frame 0 has it`);
  });
}

// =============================================================================
// THE BAND — one headline at a time; each runs until the next one starts.
// =============================================================================
const n = (x: number) => `${x}`;
const HOOK_LINES = [{ text: 'THE ONE-TOUCH RULE' }, { text: 'TOUCH IT ONCE.', color: HALL }];
const HEADS: { a: number; lines: { text: string; color?: string }[] }[] = [
  { a: -30, lines: HOOK_LINES },
  { a: REW1, lines: [{ text: 'WHAT REALLY HAPPENS:' }, { text: 'IT ALL GETS PUT DOWN.', color: CR.warn }] },
  { a: wAt(2, 'the'), lines: [{ text: 'THE MAIL' }, { text: route(MAIL), color: CR.mess }] },
  { a: wAt(3, 'the'), lines: [{ text: 'THE SHIRT' }, { text: route(SHIRT), color: CR.mess }] },
  { a: wAt(4, 'the'), lines: [{ text: 'THE KEYS' }, { text: route(KEYS), color: CR.mess }] },
  { a: wAt(5, 'three'), lines: [{ text: `${n(ITEMS.length)} THINGS.` }, { text: `${n(BEFORE_TOUCHES)} TOUCHES.`, color: CR.mess }] },
  { a: REW2, lines: [{ text: 'THE FIRST TIME YOU TOUCH IT,' }, { text: 'IT GOES HOME.', color: HALL }] },
  { a: wAt(8, 'three'), lines: [{ text: `${n(ITEMS.length)} THINGS.` }, { text: `${n(AFTER_TOUCHES)} TOUCHES.`, color: HALL }] },
  { a: TWIST, lines: [{ text: 'PUT DOWN “FOR NOW”' }, { text: '= PICKED UP AGAIN.', color: CR.mess }] },
  { a: LOOP_A, lines: HOOK_LINES },
];

const badgeColor = (i: number, count: number, home: boolean) => (count > 1 ? CR.mess : home ? ITEMS[i].color : CR.warn);

export default function Short41Once() {
  const f = useCurrentFrame();

  const punch = f < LOOP_A ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 30)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP_A, END));
  const w = walkerAt(f);
  const tally = tallyAt(f);

  // the band and tally step aside for the quiz card
  const quizOff = clamp01(1 - prog(f, QUIZ_FROM - 6, QUIZ_FROM + 4) + prog(f, QUIZ_FROM + QUIZ_DUR - 4, QUIZ_FROM + QUIZ_DUR + 6));

  // rewinds: the whole scene fades out, then it's the front door again
  const rewOut = (a: number) => (f >= a && f < a + 10 ? 1 - prog(f, a, a + 8) : 1);
  const sceneOn = Math.min(rewOut(REW1), rewOut(REW2));
  const rewChip = Math.max(bump(f, REW1 - 2, 28), bump(f, REW2 - 2, 28));

  // the homes glow: on at frame 0, on each straight-home landing, back for the last frame
  const afterLands = LANDS.filter((l) => l.phase === RESET2);
  const homeGlow = (place: Place) =>
    Math.max(
      1 - prog(f, REW1 - 6, REW1 + 4),
      ...afterLands.filter((l) => l.to === place).map((l) => bump(f, l.at - 4, 26)),
      prog(f, AWAY - 4, END - 12),
    );
  const doorGlow = Math.max(...DOOR_CROSS.map((c) => bump(f, c - 8, 22)));

  const poses = ITEMS.map((_, i) => poseAt(i, f));
  const resting = (i: number, p: Place) => poses[i].st.at === p && !poses[i].moving;
  const isHome = (i: number) => resting(i, ITEMS[i].home);

  const ghostOn = prog(f, TWIST, TWIST + 8) * (1 - prog(f, AWAY - 6, AWAY + 6));
  const ghostPulse = bump(f, AGAIN - 2, 24);

  const drawThing = (i: number, k: string) => (
    <Thing key={k} g={ITEMS[i].g} x={poses[i].p.x} y={poses[i].p.y} s={poses[i].s} rot={poses[i].rot} color={ITEMS[i].color} opacity={sceneOn} />
  );

  return (
    <AbsoluteFill style={{ background: CR.stage }}>
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 72% 40% at 50% 55%, rgba(181,221,106,0.06), rgba(11,14,20,0) 70%)' }} />
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          <Tally
            y={330}
            opacity={quizOff}
            cols={[
              {
                label: 'TOUCHES',
                value: `${tally.touches}`,
                color: tally.touches > ITEMS.length ? CR.mess : tally.away === ITEMS.length ? HALL : CR.text,
                sub: tally.touches > 0 ? tally.per.join(' + ') : '',
              },
              { label: 'PUT DOWN', value: `${tally.down}`, color: tally.down > 0 ? CR.warn : CR.text, sub: tally.down > 0 ? '“FOR NOW”' : '' },
              {
                label: 'PUT AWAY',
                value: `${tally.away}/${ITEMS.length}`,
                color: tally.away === ITEMS.length ? HALL : CR.text,
                sub: tally.away === ITEMS.length ? 'ALL HOME' : '',
              },
            ]}
          />
          <text x={540} y={515} fill={CR.faint} fontFamily={FONT_MONO} fontSize={21} fontWeight={500} letterSpacing={1.2} textAnchor="middle" opacity={quizOff}>
            THIS HOUSE · 1 TOUCH = PICK IT UP, SET IT DOWN
          </text>
          {ghostOn > 0.01 ? (
            <text x={540} y={588} fill={CR.mess} fontFamily={FONT_MONO} fontSize={26} fontWeight={700} letterSpacing={1.5} textAnchor="middle" opacity={ghostOn}>
              {`${GHOSTS.length} × “FOR NOW” = ${GHOSTS.length} EXTRA PICK-UPS`}
            </text>
          ) : null}

          <RoomsSection h={H} />
          <FrontDoor x={DOOR_X} floor={FL} h={H.doorH} glow={doorGlow} color={HALL} />

          {/* things lost down the back of the sofa sit BEHIND it */}
          {ITEMS.map((_, i) => (resting(i, 'sofa') && PLACES.sofa.behind?.[i] ? drawThing(i, `b${i}`) : null))}
          <Bed x0={80} x1={200} floor={FL} />
          <Chair x={CHAIR_X} floor={FL} />
          <Sofa x0={380} x1={550} floor={FL} />
          <Table x0={590} x1={692} floor={FL} />

          {/* the homes, with what lives in them drawn inside */}
          <Hamper x={HAMPER_X} floor={FL} color={ITEMS[SHIRT].color} glow={homeGlow('hamper')}>
            {resting(SHIRT, 'hamper') ? drawThing(SHIRT, 'hs') : null}
          </Hamper>
          <MailTray x={TRAY.x} y={TRAY.y} color={HALL} glow={homeGlow('tray')}>
            {resting(MAIL, 'tray') ? drawThing(MAIL, 'hm') : null}
          </MailTray>
          <KeyHook x={HOOK.x} y={HOOK.y} color={HALL} glow={homeGlow('hook')} />
          <SlotMark x={TRAY.x} y={TRAY.y - 2} color={HALL} s={1.1} opacity={f >= RESET1 && !resting(MAIL, 'tray') ? 1 : 0} />
          <SlotMark x={HOOK.x + 10} y={HOOK.y + 40} color={HALL} s={0.9} opacity={f >= RESET1 && !resting(KEYS, 'hook') ? 1 : 0} />

          {/* the twist: every "for now" spot, as a ghost */}
          {GHOSTS.map((g, k) => {
            const on = ghostOn * prog(f, TWIST + k * 3, TWIST + k * 3 + 6);
            if (on <= 0.01) return null;
            const p = placeXY(g.i, g.to);
            return (
              <g key={`g${k}`} opacity={on}>
                <Thing g={ITEMS[g.i].g} x={p.x} y={p.y} rot={PLACES[g.to].rot?.[g.i] ?? 0} color={ITEMS[g.i].color} opacity={0.4} />
                <circle cx={p.x} cy={p.y - ITEMS[g.i].tall / 2} r={36 + 6 * ghostPulse} fill="none" stroke={CR.mess} strokeWidth={4} strokeDasharray="8 7" />
              </g>
            );
          })}

          {/* everything else resting on a surface, or in the air */}
          {ITEMS.map((_, i) => {
            const p = poses[i];
            if (p.st.at === 'hand' && !p.moving) return null;
            if (!p.moving && (isHome(i) && ITEMS[i].home !== 'hook')) return null;
            if (!p.moving && p.st.at === 'sofa' && PLACES.sofa.behind?.[i]) return null;
            return drawThing(i, `t${i}`);
          })}

          <Walker x={w.x} y={w.y} dist={w.dist} s={WS} opacity={sceneOn} />
          {ITEMS.map((_, i) => (poses[i].st.at === 'hand' && !poses[i].moving ? drawThing(i, `a${i}`) : null))}

          {/* how many times each thing has been touched */}
          {ITEMS.map((it, i) => {
            const p = poses[i];
            if (p.moving || p.st.at === 'hand') return null;
            const c = touchesAt(i, f);
            const land = lastLandAt(i, f);
            const pulse = bump(f, ONCE - 2, 22);
            return (
              <g key={`n${i}`}>
                {isHome(i) && f < REW1 ? <Pulse x={p.p.x} y={p.p.y} k={pulse} color={it.color} /> : null}
                <TouchBadge x={p.p.x + 24} y={p.p.y - it.tall - 24} n={c} color={badgeColor(i, c, isHome(i))} pop={prog(f, land, land + 9)} opacity={sceneOn * (1 - ghostOn * 0.6)} />
              </g>
            );
          })}
        </svg>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 880, opacity: rewChip }}>
          <svg width={1080} height={80}>
            <Chip x={540} y={52} text="↺ REWIND" color={CR.text} size={40} />
          </svg>
        </div>

        <Stamp text={`${BEFORE_TOUCHES} TOUCHES`} at={ELEVEN} until={QUIZ_FROM} color={CR.mess} x={540} y={930} size={56} rotate={-5} />
        <Stamp text="ONE TOUCH EACH" at={DONE} until={TWIST} color={HALL} x={540} y={930} size={56} rotate={-5} />

        {HEADS.map((h, k) => {
          const next = HEADS[k + 1];
          const b = next ? next.a : END + 30;
          const op = Math.min(prog(f, h.a + 2, h.a + 9), 1 - prog(f, b - 7, b)) * quizOff;
          if (op <= 0.01) return null;
          return (
            <div key={k} style={{ opacity: op }}>
              <BigTitle lines={h.lines} y={110} size={Math.max(...h.lines.map((l) => l.text.length)) > 22 ? 52 : 58} warm />
            </div>
          );
        })}
      </AbsoluteFill>

      <Sequence from={QUIZ_FROM} durationInFrames={QUIZ_DUR}>
        <PauseCard title="PAUSE" subtitle={`${BEFORE_TOUCHES} touches → ${AFTER_TOUCHES}. how?`} durSec={QUIZ_DUR / 30} accent={ACCENT} y={300} />
      </Sequence>

      <Captions lines={VO} y={1510} accent={ACCENT} plate />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
