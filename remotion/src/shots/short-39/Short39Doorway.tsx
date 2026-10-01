import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, PauseCard, ProgressBar, Stamp, prog, timeWords } from '../../lib/shorts';
import { CR, Chip, EASE_INOUT, Glyph, Pulse, Shelf, Tally, Thing, Walker, XY, clamp01, hop, mix } from '../../lib/carry';
import { RoomsLayout, RoomsSection, SlotMark, Thought, doorX, roomMid } from '../../lib/rooms';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short39Doorway',
  durationInSeconds: 40.6,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = CR.good;
const F = (s: number) => Math.round(s * 30);
const END = F(40.6);

// every cue is a spoken word — retimes itself when the real voice lands in vo.gen.ts
const key = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
const wAt = (line: number, word: string, nth = 0) => {
  const w = timeWords(VO[line]).filter((x) => key(x.w) === word)[nth];
  if (!w) throw new Error(`Short39Doorway: no word "${word}" (#${nth}) in VO line ${line} ("${VO[line].text}")`);
  return F(w.start);
};
const bump = (f: number, a: number, dur: number) => Math.sin(Math.PI * prog(f, a, a + dur));

// =============================================================================
// THE HOUSE — one floor, three rooms, two doorways. A thing is filled with the colour of
// the room it BELONGS in; all twelve start in the wrong room.
// =============================================================================
const BED = 0;
const LIV = 1;
const KIT = 2;
const H: RoomsLayout = {
  ceil: 760,
  apex: 650,
  floor: 1320,
  doorH: 250,
  wall: 18,
  rooms: [
    { id: 'bed', label: 'BEDROOM', color: CR.up, x0: 70, x1: 350 },
    { id: 'liv', label: 'LIVING ROOM', color: CR.down, x0: 350, x1: 730 },
    { id: 'kit', label: 'KITCHEN', color: '#b5dd6a', x0: 730, x1: 1010 },
  ],
};
const colorOf = (room: number) => H.rooms[room].color;

type Def = { g: Glyph; home: number; at: number; x: number; rot: number };
// listed in the order they get carried out of each room (nearest the door first)
const DEFS: Def[] = [
  // bedroom: three living-room things
  { g: 'block', home: LIV, at: BED, x: 305, rot: -8 },
  { g: 'ball', home: LIV, at: BED, x: 250, rot: 0 },
  { g: 'book', home: LIV, at: BED, x: 105, rot: 6 },
  // living room: three bedroom things, three kitchen things
  { g: 'sock', home: BED, at: LIV, x: 390, rot: -7 },
  { g: 'shirt', home: BED, at: LIV, x: 498, rot: 5 },
  { g: 'pillow', home: BED, at: LIV, x: 634, rot: 4 },
  { g: 'towel', home: KIT, at: LIV, x: 688, rot: -4 },
  { g: 'mug', home: KIT, at: LIV, x: 580, rot: 8 },
  { g: 'bowl', home: KIT, at: LIV, x: 444, rot: -5 },
  // kitchen: three living-room things
  { g: 'keys', home: LIV, at: KIT, x: 780, rot: 10 },
  { g: 'bag', home: LIV, at: KIT, x: 838, rot: 5 },
  { g: 'shoe', home: LIV, at: KIT, x: 965, rot: -6 },
];
const THING_S = 1.0;
const SHELF_S = 0.8;
const HAND_S = 0.72;
const WS = 1.35; // walker scale
const STAND = [roomMid(H, BED) - 35, roomMid(H, LIV), roomMid(H, KIT) + 35]; // where the walker stands in each room

// the homes: one shelf per room, a slot per thing that belongs there
const SHELF_Y = 1030;
const SHELF: { x0: number; x1: number; slots: number[] }[] = [
  { x0: 100, x1: 320, slots: [140, 210, 280] },
  { x0: 380, x1: 716, slots: [408, 464, 520, 576, 632, 688] },
  { x0: 760, x1: 980, slots: [800, 870, 940] },
];

// =============================================================================
// THE WALKS — one person, the same lap every time: BED -> LIVING -> KITCHEN -> LIVING -> BED.
// =============================================================================
type Leg = { a: number; b: number; from: number; to: number; phase: 'setup' | 'reveal' | 'twist' | 'loop' };
const LAP = [BED, LIV, KIT, LIV, BED];

const SETUP_A = wAt(2, 'walk');
const SETUP_B = wAt(3, 'cleaning');
const TAKE = wAt(4, 'take');
const AWAY = wAt(7, 'away');
const RULE = wAt(4, 'rule');
const TWIST = wAt(8, 'why');
const DOORWAY = wAt(8, 'doorway');
const FORGET = wAt(8, 'forget');
const LOOP_A = wAt(9, 'mess');
const QUIZ_FROM = F(13.6);
const QUIZ_DUR = F(2.5);

const PICK = 8; // hop from the floor into the hand
const DROP = 9; // hop from the hand onto the shelf
const DROP_U = 0.66; // how far along its leg a thing is dropped (the walker is through the door by then)
// the last thing lands on "away": 11 whole legs + DROP_U of the twelfth + the hop
const LEG_R = (AWAY + 3 - DROP - (TAKE - 4)) / (11 + DROP_U);
const LEG_S = (SETUP_B - SETUP_A) / 4;

const LEGS: Leg[] = [
  ...[0, 1, 2, 3].map((k) => ({ a: LAP[k], b: LAP[k + 1], from: Math.round(SETUP_A + k * LEG_S), to: Math.round(SETUP_A + (k + 1) * LEG_S), phase: 'setup' as const })),
  ...Array.from({ length: 12 }, (_, k) => ({
    a: LAP[k % 4],
    b: LAP[(k % 4) + 1],
    from: Math.round(TAKE - 4 + k * LEG_R),
    to: Math.round(TAKE - 4 + (k + 1) * LEG_R),
    phase: 'reveal' as const,
  })),
  { a: BED, b: LIV, from: DOORWAY - 20, to: DOORWAY + 22, phase: 'twist' },
  { a: LIV, b: BED, from: wAt(9, 'leave') - 22, to: wAt(9, 'leave') + 22, phase: 'loop' },
];

const easeLeg = (u: number) => EASE_INOUT(u) * 0.35 + u * 0.65;
const legX = (l: Leg, f: number) => mix(STAND[l.a], STAND[l.b], easeLeg(prog(f, l.from, l.to)));

/** The walker this frame: position, direction, and a step phase that is 0 whenever they stand still. */
const walkerAt = (f: number): XY & { dir: number; dist: number } => {
  let x = STAND[BED];
  let dir = 1;
  let dist = 0;
  for (const l of LEGS) {
    if (f < l.from) break;
    x = legX(l, f);
    dir = Math.sign(STAND[l.b] - STAND[l.a]);
    const len = Math.abs(STAND[l.b] - STAND[l.a]);
    // whole strides only, so the legs close at the end of every leg
    const strides = Math.max(1, Math.round(len / (11 * WS * Math.PI)));
    dist = f >= l.to ? 0 : (Math.abs(x - STAND[l.a]) / len) * strides * 11 * Math.PI;
  }
  return { x, y: H.floor, dir, dist };
};
const handAt = (f: number): XY => {
  const w = walkerAt(f);
  return { x: w.x + w.dir * 44, y: H.floor - 40 * WS };
};

/** The frame a leg passes through its doorway. */
const crossAt = (l: Leg) => {
  const wall = doorX(H, Math.min(l.a, l.b));
  for (let f = l.from; f <= l.to; f += 1) if ((legX(l, f) - wall) * Math.sign(STAND[l.b] - STAND[l.a]) >= 0) return f;
  return l.to;
};

// =============================================================================
// WHO CARRIES WHAT — each reveal leg takes the next thing in the room it is leaving that
// belongs in the room it is going to. Assigned, then checked: nothing crosses two doors.
// =============================================================================
const REVEAL = LEGS.filter((l) => l.phase === 'reveal');
const carried: number[] = [];
for (const l of REVEAL) carried.push(DEFS.findIndex((d, j) => d.at === l.a && d.home === l.b && !carried.includes(j)));
const legOf = (i: number) => carried.indexOf(i);
const slotOf = (i: number): XY => {
  const k = legOf(i);
  const home = DEFS[i].home;
  const rank = carried.slice(0, k).filter((j) => DEFS[j].home === home).length;
  return { x: SHELF[home].slots[rank], y: SHELF_Y };
};

const pickAt = (i: number) => REVEAL[legOf(i)].from - 2;
const dropAt = (i: number) => {
  const l = REVEAL[legOf(i)];
  return Math.round(l.from + DROP_U * (l.to - l.from));
};
const REWIND = 18;
const rewindAt = (i: number) => LOOP_A + 4 + legOf(i) * 5;
const LAST_DROP = Math.max(...DEFS.map((_, i) => dropAt(i) + DROP));

type Where = 'floor' | 'hand' | 'shelf';
const whereAt = (i: number, f: number): Where => {
  if (f < pickAt(i) + PICK / 2) return 'floor';
  if (f < dropAt(i) + DROP / 2) return 'hand';
  if (f < rewindAt(i) + REWIND / 2) return 'shelf';
  return 'floor';
};

type Pose = { p: XY; s: number; rot: number };
const poseAt = (i: number, f: number): Pose => {
  const d = DEFS[i];
  const spot = { x: d.x, y: H.floor };
  const rest: Pose = { p: spot, s: THING_S, rot: d.rot };
  const p0 = pickAt(i);
  const d0 = dropAt(i);
  const r0 = rewindAt(i);
  const slot = slotOf(i);
  if (f < p0) return rest;
  if (f < p0 + PICK) {
    const u = EASE_INOUT(prog(f, p0, p0 + PICK));
    return { p: hop(spot, handAt(f), u, 50), s: mix(THING_S, HAND_S, u), rot: mix(d.rot, 0, u) };
  }
  if (f < d0) return { p: handAt(f), s: HAND_S, rot: 0 };
  if (f < d0 + DROP) {
    const u = EASE_INOUT(prog(f, d0, d0 + DROP));
    return { p: hop(handAt(d0), slot, u, 40), s: mix(HAND_S, SHELF_S, u), rot: 0 };
  }
  if (f < r0) return { p: slot, s: SHELF_S, rot: 0 };
  // the loop: new mess, arriving one thing at a time, exactly where frame 0 had it
  const u = EASE_INOUT(prog(f, r0, r0 + REWIND));
  return { p: hop(slot, spot, u, 40), s: mix(SHELF_S, THING_S, u), rot: mix(0, d.rot, u) };
};

const countAt = (f: number) => {
  const out = DEFS.filter((_, i) => whereAt(i, f) !== 'shelf').length;
  const phase = f >= LOOP_A || f < SETUP_A ? null : f < RULE ? 'setup' : 'reveal';
  const doors = phase ? LEGS.filter((l) => l.phase === phase && crossAt(l) <= f).length : 0;
  return { out, doors, phase };
};

// the claims, checked at module load — if the house changes, the video refuses to render a lie
{
  if (DEFS.length !== 12) throw new Error('the house must have 12 things out of place');
  if (carried.some((i) => i < 0) || new Set(carried).size !== 12)
    throw new Error(`every reveal leg must carry a different thing that belongs in the next room (got ${carried})`);
  DEFS.forEach((d) => {
    if (d.home === d.at) throw new Error(`${d.g} is already home`);
    if (Math.abs(d.home - d.at) !== 1) throw new Error(`${d.g} would have to cross two doors`);
  });
  const at0 = countAt(0);
  const done = countAt(TWIST);
  const last = countAt(END - 1);
  if (at0.out !== 12 || at0.doors !== 0) throw new Error(`frame 0 must read 12 / 0 (got ${JSON.stringify(at0)})`);
  if (done.out !== 0 || countAt(LOOP_A - 1).doors !== 12) throw new Error('12 doorways must put all 12 things away');
  if (countAt(RULE - 1).doors !== 4 || countAt(RULE - 1).out !== 12) throw new Error('the empty-handed lap must cross 4 doors and move nothing');
  if (last.out !== at0.out || last.doors !== at0.doors) throw new Error('the last frame must count the same as frame 0 — the loop');
  DEFS.forEach((d, i) => {
    const l = REVEAL[legOf(i)];
    if (crossAt(l) > dropAt(i)) throw new Error(`${d.g} is dropped before the walker is through the door`);
  });
  if (LAST_DROP > TWIST) throw new Error('everything must be put away before the twist');
  if (Math.max(...DEFS.map((_, i) => rewindAt(i) + REWIND)) > END - 15) throw new Error('the loop must settle before the last frame');
  if (LEGS[LEGS.length - 1].to > END - 15) throw new Error('the walker must be home before the last frame');
  for (let k = 1; k < LEGS.length; k += 1) {
    if (LEGS[k].from < LEGS[k - 1].to) throw new Error('walks overlap');
    if (LEGS[k].a !== LEGS[k - 1].b) throw new Error('the walker teleports');
  }
}

// =============================================================================
// THE BAND — one headline at a time; each runs until the next one starts.
// =============================================================================
const HOOK_LINES = [{ text: 'THE DOORWAY RULE' }, { text: '1 THING, EVERY DOOR.', color: CR.good }];
const HEADS: { a: number; lines: { text: string; color?: string }[] }[] = [
  { a: -30, lines: HOOK_LINES },
  { a: wAt(1, 'this'), lines: [{ text: 'THIS HOUSE:' }, { text: '12 THINGS, WRONG ROOMS', color: CR.warn }] },
  { a: SETUP_A, lines: [{ text: 'YOU WALK PAST THEM' }, { text: 'ALL DAY.' }] },
  { a: wAt(2, 'emptyhanded'), lines: [{ text: 'EVERY DOORWAY.' }, { text: 'EMPTY-HANDED.', color: CR.mess }] },
  { a: wAt(3, 'wait'), lines: [{ text: 'SO THEY WAIT FOR' }, { text: 'A CLEANING DAY.', color: CR.mess }] },
  { a: RULE, lines: [{ text: 'BEFORE YOU LEAVE A ROOM,' }, { text: 'TAKE ONE THING.', color: CR.good }] },
  { a: wAt(5, 'belongs'), lines: [{ text: 'ONE THAT BELONGS' }, { text: "WHERE YOU'RE GOING.", color: CR.warn }] },
  { a: wAt(6, 'same'), lines: [{ text: 'SAME WALKS.' }, { text: 'NOTHING EXTRA.', color: CR.good }] },
  { a: wAt(7, 'twelve'), lines: [{ text: '12 DOORWAYS.' }, { text: 'ALL PUT AWAY.', color: CR.good }] },
  { a: TWIST, lines: [{ text: 'WHY BEFORE?' }, { text: 'DOORWAYS CAN', color: CR.mess }, { text: 'MAKE YOU FORGET.', color: CR.mess }] },
  { a: LOOP_A, lines: HOOK_LINES },
];

// the hook's payoff diagram: the first thing, the path it takes through the first door
const FIRST = carried[0];
const firstPath = () => {
  const a = { x: DEFS[FIRST].x, y: H.floor - 58 };
  const door = { x: doorX(H, BED), y: H.floor - 120 };
  const s = slotOf(FIRST);
  return `M${a.x},${a.y}Q${a.x + 10},${door.y} ${door.x},${door.y}Q${s.x},${door.y} ${s.x},${s.y + 14}`;
};

export default function Short39Doorway() {
  const f = useCurrentFrame();

  const punch = f < LOOP_A ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 30)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP_A, END));
  const { out, doors, phase } = countAt(f);
  const w = walkerAt(f);

  // the band steps aside for the quiz card and, in the twist, for the source plate
  const quizOff = 1 - prog(f, QUIZ_FROM - 6, QUIZ_FROM + 4) + prog(f, QUIZ_FROM + QUIZ_DUR - 4, QUIZ_FROM + QUIZ_DUR + 6);
  const bandOn = clamp01(quizOff);
  const tallyOn = clamp01(Math.min(quizOff, 1 - prog(f, TWIST - 8, TWIST + 2) + prog(f, LOOP_A, LOOP_A + 10)));
  const plateOn = prog(f, wAt(8, 'studies'), wAt(8, 'studies') + 10) * (1 - prog(f, LOOP_A - 8, LOOP_A + 2));

  // the hook diagram: on at frame 0, steps back as the house is introduced, back for the loop
  const hookOn = Math.max(1 - prog(f, wAt(1, 'this') - 8, wAt(1, 'this') + 4), prog(f, wAt(9, 'leave') + 22, END - 12));

  // doorways light as they are crossed: pink with empty hands, the thing's colour when carrying
  const glow = [0, 0];
  const glowC: string[] = [CR.good, CR.good];
  LEGS.forEach((l) => {
    const c = crossAt(l);
    const b = bump(f, c - 6, 24);
    const door = Math.min(l.a, l.b);
    if (b > glow[door]) {
      glow[door] = l.phase === 'reveal' ? b : 0.7 * b;
      const r = REVEAL.indexOf(l);
      glowC[door] = r >= 0 ? colorOf(DEFS[carried[r]].home) : CR.mess;
    }
  });
  if (hookOn > glow[BED]) {
    glow[BED] = hookOn;
    glowC[BED] = CR.good;
  }

  // the forgetting: an intention in a thought bubble, lost at the door
  const twistLeg = LEGS.find((l) => l.phase === 'twist')!;
  const lost = prog(f, crossAt(twistLeg), crossAt(twistLeg) + 8);
  const thoughtOn = prog(f, wAt(8, 'walking') - 6, wAt(8, 'walking') + 4) * (1 - prog(f, FORGET + 30, FORGET + 42));

  const things = DEFS.map((d, i) => ({ d, i, pose: poseAt(i, f), where: whereAt(i, f) }));

  return (
    <AbsoluteFill style={{ background: CR.stage }}>
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 72% 40% at 50% 55%, rgba(242,180,107,0.07), rgba(11,14,20,0) 70%)' }} />
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          <Tally
            y={330}
            opacity={tallyOn}
            cols={[
              { label: 'OUT OF PLACE', value: `${out}`, color: out > 0 ? CR.warn : CR.good, sub: out > 0 ? 'IN THE WRONG ROOM' : 'EVERYTHING HOME' },
              {
                label: 'DOORWAYS',
                value: `${doors}`,
                color: doors === 0 ? CR.text : phase === 'reveal' ? CR.good : CR.mess,
                sub: doors === 0 ? 'CROSSED SO FAR' : phase === 'reveal' ? 'ONE THING EACH' : 'EMPTY-HANDED',
              },
            ]}
          />
          {plateOn > 0.01 ? (
            <g opacity={plateOn}>
              <text x={540} y={470} fill={CR.dim} fontFamily={FONT_MONO} fontSize={25} fontWeight={600} letterSpacing={1.5} textAnchor="middle">
                RADVANSKY &amp; COPELAND 2006 · VIRTUAL ROOMS
              </text>
              <text x={540} y={512} fill={CR.faint} fontFamily={FONT_MONO} fontSize={22} fontWeight={500} letterSpacing={1.2} textAnchor="middle">
                NOT ALWAYS REPLICATED (McFADYEN ET AL. 2021)
              </text>
            </g>
          ) : null}

          <RoomsSection h={H} doorGlow={glow} doorColor={glowC} />
          {SHELF.map((s, k) => (
            <Shelf key={k} x0={s.x0} x1={s.x1} y={SHELF_Y} />
          ))}

          {/* empty homes: a dashed outline in the room's colour until its thing lands */}
          {things.map((t) => {
            const s = slotOf(t.i);
            const land = prog(f, dropAt(t.i) + DROP - 3, dropAt(t.i) + DROP) * (1 - prog(f, rewindAt(t.i), rewindAt(t.i) + 3));
            return <SlotMark key={`s${t.i}`} x={s.x} y={s.y} color={colorOf(t.d.home)} s={SHELF_S} opacity={1 - land} />;
          })}

          {/* the hook: the first thing's path, through the lit doorway, to its home */}
          {hookOn > 0.01 ? (
            <g opacity={hookOn}>
              <path d={firstPath()} fill="none" stroke={CR.good} strokeWidth={5} strokeDasharray="12 10" strokeLinecap="round" />
              <SlotMark x={slotOf(FIRST).x} y={SHELF_Y} color={CR.good} s={SHELF_S * 1.15} />
              <text x={doorX(H, BED) - 22} y={H.floor - 150} fill={CR.good} fontFamily={FONT_DISPLAY} fontSize={34} fontWeight={700} textAnchor="end">
                1 THING
              </text>
            </g>
          ) : null}

          {/* things on floors and shelves (the one in hand is drawn with the walker) */}
          {things.map((t) => {
            if (t.where === 'hand' && f >= pickAt(t.i) + PICK) return null;
            const sweep = bump(f, wAt(1, 'twelve') + t.i * 2, 16);
            return (
              <g key={t.i}>
                <Pulse x={t.pose.p.x} y={t.pose.p.y} k={sweep} color={colorOf(t.d.home)} s={THING_S} />
                <Thing g={t.d.g} x={t.pose.p.x} y={t.pose.p.y} s={t.pose.s} rot={t.pose.rot} color={colorOf(t.d.home)} />
              </g>
            );
          })}

          <Walker x={w.x} y={w.y} dist={w.dist} s={WS} />
          {things
            .filter((t) => t.where === 'hand' && f >= pickAt(t.i) + PICK)
            .map((t) => (
              <Thing key={`h${t.i}`} g={t.d.g} x={t.pose.p.x} y={t.pose.p.y} s={t.pose.s} color={colorOf(t.d.home)} />
            ))}

          <Thought at={{ x: w.x, y: w.y - 130 * WS }} opacity={thoughtOn}>
            <g opacity={1 - lost}>
              <Thing g="mug" x={-4} y={24} s={0.8} color={colorOf(KIT)} />
            </g>
            <text x={0} y={22} fill={CR.ink} fontFamily={FONT_DISPLAY} fontSize={68} fontWeight={700} textAnchor="middle" opacity={lost}>
              ?
            </text>
          </Thought>

          <Chip x={540} y={1400} text="DECIDE BEFORE THE DOOR." color={CR.good} opacity={prog(f, FORGET, FORGET + 8) * (1 - prog(f, LOOP_A - 6, LOOP_A + 4))} size={32} />
        </svg>

        <Stamp text="ALL PUT AWAY" at={LAST_DROP} until={TWIST} color={CR.good} x={540} y={880} size={56} rotate={-5} />

        {HEADS.map((h, k) => {
          const next = HEADS[k + 1];
          const b = next ? next.a : END + 30;
          const op = Math.min(prog(f, h.a + 2, h.a + 9), 1 - prog(f, b - 7, b)) * bandOn;
          if (op <= 0.01) return null;
          return (
            <div key={k} style={{ opacity: op }}>
              <BigTitle lines={h.lines} y={110} size={h.lines.length > 2 ? 54 : 58} warm />
            </div>
          );
        })}
      </AbsoluteFill>

      <Sequence from={QUIZ_FROM} durationInFrames={QUIZ_DUR}>
        <PauseCard title="PAUSE" subtitle="12 things. no cleaning day. how?" durSec={QUIZ_DUR / 30} accent={ACCENT} y={300} />
      </Sequence>

      <Captions lines={VO} y={1510} accent={ACCENT} plate />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
