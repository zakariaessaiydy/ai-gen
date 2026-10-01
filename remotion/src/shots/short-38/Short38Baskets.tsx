import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, PauseCard, ProgressBar, Stamp, prog, timeWords } from '../../lib/shorts';
import {
  Basket,
  CR,
  Chip,
  EASE_INOUT,
  EASE_OUT,
  Floor,
  Glyph,
  HOUSE,
  HouseSection,
  Pulse,
  Shelf,
  Tally,
  Thing,
  Walker,
  WrongRing,
  XY,
  along,
  clamp01,
  floorY,
  hop,
  hopPath,
  inBasket,
  mix,
  pathLen,
} from '../../lib/carry';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short38Baskets',
  durationInSeconds: 38.6,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = CR.good;
const F = (s: number) => Math.round(s * 30);
const END = F(38.6);

// every cue is a spoken word — retimes itself when the real voice lands in vo.gen.ts
const key = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
const wAt = (line: number, word: string, nth = 0) => {
  const w = timeWords(VO[line]).filter((x) => key(x.w) === word)[nth];
  if (!w) throw new Error(`Short38Baskets: no word "${word}" (#${nth}) in VO line ${line} ("${VO[line].text}")`);
  return F(w.start);
};
const bump = (f: number, a: number, dur: number) => Math.sin(Math.PI * prog(f, a, a + dur));

// =============================================================================
// THE HOUSE — twelve things out of place, coloured by the floor they BELONG on.
// Six stand on their own floor (wrong room, a few steps away). Six stand on the WRONG
// floor, and each of those costs a whole stair trip — which is why they are still there.
// "Half" in the hook is 6 of these 12, counted off the states below, not asserted.
// =============================================================================
const H = HOUSE;
type Def = { g: Glyph; home: Floor; at: Floor; x: number; rot: number };
const DEFS: Def[] = [
  // upstairs
  { g: 'shoe', home: 'down', at: 'up', x: 128, rot: -7 },
  { g: 'shirt', home: 'up', at: 'up', x: 216, rot: 5 },
  { g: 'mug', home: 'down', at: 'up', x: 300, rot: 8 },
  { g: 'block', home: 'up', at: 'up', x: 376, rot: -9 },
  { g: 'book', home: 'up', at: 'up', x: 442, rot: 6 },
  { g: 'ball', home: 'down', at: 'up', x: 884, rot: 0 },
  // downstairs
  { g: 'bag', home: 'down', at: 'down', x: 125, rot: 5 },
  { g: 'sock', home: 'up', at: 'down', x: 505, rot: -8 },
  { g: 'keys', home: 'down', at: 'down', x: 594, rot: 10 },
  { g: 'towel', home: 'up', at: 'down', x: 684, rot: 4 },
  { g: 'bowl', home: 'down', at: 'down', x: 772, rot: -5 },
  { g: 'pillow', home: 'up', at: 'down', x: 862, rot: 7 },
];
const colorOf = (fl: Floor) => (fl === 'up' ? CR.up : CR.down);
const slotOf = (d: Def): XY => ({ x: d.x, y: floorY(H, d.at) });

// the two baskets, parked where the trips already happen
const STATION: Record<Floor, XY> = { up: { x: 250, y: H.downFloor }, down: { x: 790, y: H.upFloor } };
// the two homes: a shelf on each floor
const SHELF: Record<Floor, { x0: number; x1: number; y: number; slots: number[] }> = {
  up: { x0: 758, x1: 972, y: 780, slots: [800, 864, 930] },
  down: { x0: 96, x1: 318, y: 1150, slots: [140, 210, 280] },
};
const THING_S = 1.2; // a thing's scale where it lies
const SHELF_S = 0.85;
const IN_S = 0.62; // a thing's scale inside a basket
const CARRY_S = 0.74; // a basket's scale in someone's hands

const WRONG = DEFS.map((d, i) => ({ d, i })).filter(({ d }) => d.home !== d.at);
// k-th wrong thing going each way: its place in the basket AND on the shelf
const rankIn = (i: number) => {
  const d = DEFS[i];
  return WRONG.filter((w) => w.d.home === d.home).findIndex((w) => w.i === i);
};

// =============================================================================
// THE TIMELINE — every cue a spoken word.
// =============================================================================
const LOOK = wAt(1, 'look');
const ROOM = wAt(2, 'room');
const FLOOR = wAt(2, 'floor');
const SOCK = wAt(3, 'sock');
const NEVER = wAt(3, 'never');
const TRIP = wAt(3, 'trip');
const QUIZ_FROM = F(13.7);
const QUIZ_DUR = F(2.5);
const UP_LIT = wAt(4, 'basket');
const UP_ARCS = wAt(4, 'up');
const DOWN_LIT = wAt(5, 'top');
const DOWN_ARCS = wAt(5, 'down');
const DROP_UP = wAt(6, 'drop'); // things going up hop into the UP basket
const DROP_DOWN = wAt(6, 'walk'); // things going down hop into the DOWN basket
const WHO = wAt(7, 'whoever');
const TAKE = wAt(7, 'takes');
const CLIMBS = wAt(8, 'climbs');
const LOOP_A = wAt(9, 'nobody');

const FLY = 18;
const dropAt = (i: number) => (DEFS[i].home === 'up' ? DROP_UP : DROP_DOWN) + rankIn(i) * 6;

// the walkers: whoever takes the stairs next takes the basket
const PATH_A: XY[] = [{ x: 185, y: H.downFloor }, H.foot, H.top, { x: 805, y: H.upFloor }]; // carries UP
const PATH_B: XY[] = [{ x: 885, y: H.upFloor }, H.top, H.foot, { x: 245, y: H.downFloor }]; // carries DOWN
const PX_PER_F = 9; // one walking pace, stairs or floor
const WALK: Record<Floor, { path: XY[]; from: number; to: number }> = {
  up: { path: PATH_A, from: TAKE, to: TAKE + Math.round(pathLen(PATH_A) / PX_PER_F) },
  down: { path: PATH_B, from: TAKE + 10, to: TAKE + 10 + Math.round(pathLen(PATH_B) / PX_PER_F) },
};
const deliverAt = (i: number) => WALK[DEFS[i].home].to + 4 + rankIn(i) * 5;
const LAST_DELIVERY = Math.max(...WRONG.map((w) => deliverAt(w.i) + FLY));
const WALK_OUT = LAST_DELIVERY + 8; // walkers leave, baskets go back to their posts
const REWIND = 24;
const rewindAt = (i: number) => LOOP_A + WRONG.findIndex((w) => w.i === i) * 5;

// the trips that happen anyway — ghosts on the stairs, nothing in their hands
const GHOSTS = 5;
const GHOST_GAP = 16;
const GHOST_DUR = 40;
const ghostFrom = (k: number) => CLIMBS + k * GHOST_GAP;
const GHOST_UP: XY[] = [{ x: 262, y: H.downFloor }, H.foot, H.top, { x: 770, y: H.upFloor }];

// =============================================================================
// STATE — where every thing is this frame. The tally counts these; nothing is typed.
// =============================================================================
type Where = 'slot' | 'basket' | 'shelf';

const walkerAt = (fl: Floor, f: number) => {
  const w = WALK[fl];
  const u = prog(f, w.from, w.to);
  return along(w.path, EASE_INOUT(u) * 0.12 + u * 0.88); // a gentle start, then a steady pace
};

/** A basket: parked at its post, or in a walker's hands (with a short hand-off either way). */
const basketAt = (fl: Floor, f: number): { p: XY; s: number } => {
  const w = walkerAt(fl, f);
  const held = { x: w.x + w.dir * 36, y: w.y - 14 };
  const grab = EASE_OUT(prog(f, WALK[fl].from - 8, WALK[fl].from + 4));
  return {
    p: { x: mix(STATION[fl].x, held.x, grab), y: mix(STATION[fl].y, held.y, grab) },
    s: mix(1, CARRY_S, grab),
  };
};

const shelfSpot = (i: number): XY => ({ x: SHELF[DEFS[i].home].slots[rankIn(i)], y: SHELF[DEFS[i].home].y });

const whereAt = (i: number, f: number): Where => {
  const d = DEFS[i];
  if (d.home === d.at) return 'slot';
  if (f < dropAt(i) + FLY / 2) return 'slot';
  if (f < deliverAt(i) + FLY / 2) return 'basket';
  if (f < rewindAt(i) + REWIND / 2) return 'shelf';
  return 'slot';
};

type Pose = { p: XY; s: number; rot: number; inBasket: boolean };
const poseAt = (i: number, f: number): Pose => {
  const d = DEFS[i];
  const slot = slotOf(d);
  const rest: Pose = { p: slot, s: THING_S, rot: d.rot, inBasket: false };
  if (d.home === d.at) return rest;
  const k = rankIn(i);
  const bk = (ff: number) => {
    const b = basketAt(d.home, ff);
    return inBasket(b.p.x, b.p.y, k, b.s);
  };
  const shelf = shelfSpot(i);
  const d0 = dropAt(i);
  const e0 = deliverAt(i);
  const r0 = rewindAt(i);
  if (f < d0) return rest;
  if (f < d0 + FLY) {
    const u = EASE_INOUT(prog(f, d0, d0 + FLY));
    return { p: hop(slot, bk(d0 + FLY), u, 80), s: mix(THING_S, IN_S, u), rot: mix(d.rot, 0, u), inBasket: false };
  }
  if (f < e0) {
    const b = basketAt(d.home, f);
    return { p: bk(f), s: IN_S * (b.s / 1), rot: 0, inBasket: true };
  }
  if (f < e0 + FLY) {
    const u = EASE_INOUT(prog(f, e0, e0 + FLY));
    const from = bk(e0);
    const bs = basketAt(d.home, e0).s;
    return { p: hop(from, shelf, u, 70), s: mix(IN_S * bs, SHELF_S, u), rot: 0, inBasket: false };
  }
  if (f < r0) return { p: shelf, s: SHELF_S, rot: 0, inBasket: false };
  // the loop: tomorrow's mess, drifting back to exactly where frame 0 had it
  const u = EASE_INOUT(prog(f, r0, r0 + REWIND));
  return { p: hop(shelf, slot, u, 40), s: mix(SHELF_S, THING_S, u), rot: mix(0, d.rot, u), inBasket: false };
};

const countAt = (f: number) => {
  const w = DEFS.map((_, i) => whereAt(i, f));
  const out = w.filter((x) => x !== 'shelf').length;
  const wrong = WRONG.filter(({ i }) => w[i] !== 'shelf').length;
  const extra = WRONG.filter(({ i }) => w[i] === 'slot').length;
  return { out, wrong, extra };
};

// the claims, checked at module load — if the house changes, the video refuses to render a lie
{
  const at0 = countAt(0);
  const mid = countAt(LOOP_A - 1);
  const last = countAt(END - 1);
  if (DEFS.length !== 12 || WRONG.length !== 6) throw new Error('the house must have 12 things out of place, 6 on the wrong floor');
  if (at0.out !== 12 || at0.wrong !== 6 || at0.extra !== 6) throw new Error(`frame 0 must read 12 / 6 / 6 (got ${JSON.stringify(at0)})`);
  if (mid.out * 2 !== at0.out || mid.wrong !== 0 || mid.extra !== 0)
    throw new Error(`after the baskets the mess must be exactly HALF with no wrong floor (got ${JSON.stringify(mid)})`);
  if (JSON.stringify(last) !== JSON.stringify(at0)) throw new Error('the last frame must count the same as frame 0 — the loop');
  for (const { d, i } of WRONG) {
    // a thing only ever goes in the basket on ITS floor that is headed to ITS home
    if (floorY(H, d.at) !== STATION[d.home].y) throw new Error(`${d.g} would have to cross floors to reach its basket`);
    if (deliverAt(i) < WALK[d.home].to) throw new Error(`${d.g} leaves the basket before the basket arrives`);
    if (dropAt(i) + FLY > WALK[d.home].from - 8) throw new Error(`${d.g} is still in the air when the basket is picked up`);
  }
  if (LAST_DELIVERY >= CLIMBS) throw new Error('the delivery must land before the twist');
  if (rewindAt(WRONG[WRONG.length - 1].i) + REWIND >= END - 20) throw new Error('the rewind must settle before the last frame');
}

// =============================================================================
// THE BAND — one headline at a time; each runs until the next one starts.
// =============================================================================
const HOOK_LINES = [{ text: '2 BASKETS.' }, { text: 'HALF THE MESS.', color: CR.good }];
const HEADS: { a: number; lines: { text: string; color?: string }[] }[] = [
  { a: -30, lines: HOOK_LINES },
  { a: LOOK, lines: [{ text: 'THIS HOUSE:' }, { text: '12 THINGS OUT OF PLACE', color: CR.warn }] },
  { a: wAt(2, 'its'), lines: [{ text: '6 OF THEM ARE ON' }, { text: 'THE WRONG FLOOR.', color: CR.mess }] },
  { a: SOCK, lines: [{ text: 'ONE SOCK.' }, { text: 'ONE WHOLE STAIR TRIP.', color: CR.mess }] },
  { a: UP_LIT, lines: [{ text: 'BOTTOM OF THE STAIRS:' }, { text: 'GOING UP', color: CR.up }] },
  { a: DOWN_LIT, lines: [{ text: 'TOP OF THE STAIRS:' }, { text: 'GOING DOWN', color: CR.down }] },
  { a: DROP_UP, lines: [{ text: 'DROP IT IN' }, { text: 'AS YOU PASS.', color: CR.good }] },
  { a: TAKE, lines: [{ text: 'NEXT ONE ON THE STAIRS' }, { text: 'TAKES THE BASKET.', color: CR.good }] },
  { a: LAST_DELIVERY - 6, lines: [{ text: '0 EXTRA TRIPS.' }, { text: 'HALF THE MESS, GONE.', color: CR.good }] },
  { a: CLIMBS, lines: [{ text: 'YOU CLIMB THEM ALL DAY.' }, { text: 'EMPTY-HANDED.', color: CR.mess }] },
  { a: LOOP_A, lines: HOOK_LINES },
];

export default function Short38Baskets() {
  const f = useCurrentFrame();

  const punch = f < LOOP_A ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 30)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP_A, END));
  const { out, wrong, extra } = countAt(f);

  // the tally and the headline step aside for the quiz card
  const bandOn = clamp01(1 - prog(f, QUIZ_FROM - 6, QUIZ_FROM + 4) + prog(f, QUIZ_FROM + QUIZ_DUR - 4, QUIZ_FROM + QUIZ_DUR + 6));

  // the hook diagram (rings, arcs, lit baskets) is on at frame 0, steps back while the
  // video builds it, and is back at exactly its frame-0 strength when the loop closes
  const hookOn = 1 - prog(f, LOOK - 10, LOOK + 2);
  const ringsBack = prog(f, FLOOR, FLOOR + 8);
  const basketLit = (fl: Floor) => Math.max(0.3 * (1 - hookOn) + hookOn, prog(f, fl === 'up' ? UP_LIT : DOWN_LIT, (fl === 'up' ? UP_LIT : DOWN_LIT) + 10));

  // "one sock is never worth a trip" — the trip, drawn
  const sock = DEFS.findIndex((d) => d.g === 'sock');
  const sockRoute: XY[] = [
    { x: DEFS[sock].x - 40, y: H.downFloor - 12 },
    { x: H.foot.x, y: H.foot.y - 12 },
    { x: H.top.x, y: H.top.y - 12 },
    { x: 850, y: H.upFloor - 12 },
  ];
  const routeLen = pathLen(sockRoute);
  const routeDraw = EASE_OUT(prog(f, SOCK + 4, TRIP + 12));
  const routeOn = prog(f, SOCK, SOCK + 6) * (1 - prog(f, QUIZ_FROM - 10, QUIZ_FROM));
  const tripGlow = prog(f, TRIP, TRIP + 8) * (1 - prog(f, QUIZ_FROM - 10, QUIZ_FROM));

  // walkers
  const walkOn = prog(f, WHO - 4, WHO + 8) * (1 - prog(f, WALK_OUT, WALK_OUT + 12));
  const handBack = prog(f, WALK_OUT, WALK_OUT + 16); // held basket fades, parked one returns

  // trips taken anyway (the twist)
  const ghostsDone = Array.from({ length: GHOSTS }, (_, k) => f >= ghostFrom(k) + GHOST_DUR).filter(Boolean).length;
  const ghostChipOn = prog(f, CLIMBS, CLIMBS + 8) * (1 - prog(f, LOOP_A - 4, LOOP_A + 6));

  const things = DEFS.map((d, i) => ({ d, i, pose: poseAt(i, f), where: whereAt(i, f) }));

  const drawThing = (t: (typeof things)[number]) => (
    <Thing key={t.i} g={t.d.g} x={t.pose.p.x} y={t.pose.p.y} s={t.pose.s} rot={t.pose.rot} color={colorOf(t.d.home)} />
  );

  const basketLayer = (fl: Floor) => {
    const held = basketAt(fl, f);
    const inside = things.filter((t) => t.pose.inBasket && t.d.home === fl).map(drawThing);
    const carried = f >= WALK[fl].from - 8;
    return (
      <g key={fl}>
        {carried ? (
          <Basket x={held.p.x} y={held.p.y} s={held.s} way={fl} color={colorOf(fl)} lit={1} opacity={1 - handBack}>
            {inside}
          </Basket>
        ) : null}
        <Basket
          x={STATION[fl].x}
          y={STATION[fl].y}
          way={fl}
          color={colorOf(fl)}
          lit={basketLit(fl)}
          opacity={carried ? handBack : 1}
        >
          {carried ? null : inside}
        </Basket>
      </g>
    );
  };

  return (
    <AbsoluteFill style={{ background: CR.stage }}>
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <AbsoluteFill
          style={{ background: 'radial-gradient(ellipse 72% 42% at 50% 52%, rgba(143,162,255,0.08), rgba(11,14,20,0) 70%)' }}
        />
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          <Tally
            y={300}
            opacity={bandOn}
            cols={[
              {
                label: 'OUT OF PLACE',
                value: `${out}`,
                color: wrong > 0 ? CR.mess : CR.warn,
                sub: `${wrong} ON THE WRONG FLOOR`,
              },
              {
                label: 'EXTRA STAIR TRIPS',
                value: `${extra}`,
                color: extra > 0 ? CR.mess : CR.good,
                sub: extra > 0 ? 'ONE WHOLE TRIP EACH' : 'THEY RIDE ALONG',
                glow: tripGlow,
              },
            ]}
          />

          <HouseSection />
          <Shelf {...SHELF.up} />
          <Shelf {...SHELF.down} />

          {/* where each wrong-floor thing is going: the hook diagram, then the reveal's plan */}
          {WRONG.map(({ d, i }) => {
            const planned = prog(f, d.home === 'up' ? UP_ARCS : DOWN_ARCS, (d.home === 'up' ? UP_ARCS : DOWN_ARCS) + 12);
            const gone = prog(f, dropAt(i), dropAt(i) + 6);
            const back = prog(f, rewindAt(i) + REWIND - 4, rewindAt(i) + REWIND + 8);
            const op = Math.max(0.55 * hookOn, 0.8 * planned * (1 - gone), 0.55 * back);
            if (op <= 0.01) return null;
            const s = slotOf(d);
            const b = inBasket(STATION[d.home].x, STATION[d.home].y, rankIn(i), 1);
            return (
              <path
                key={`arc${i}`}
                d={hopPath({ x: s.x, y: s.y - 36 }, b, 80)}
                fill="none"
                stroke={colorOf(d.home)}
                strokeWidth={4}
                strokeDasharray="10 10"
                opacity={op}
              />
            );
          })}

          {/* one sock, one whole trip */}
          {routeOn > 0.01 ? (
            <g opacity={routeOn}>
              <path
                d={sockRoute.map((p, k) => `${k ? 'L' : 'M'}${p.x},${p.y}`).join('')}
                fill="none"
                stroke={CR.mess}
                strokeWidth={6}
                strokeLinejoin="round"
                strokeDasharray={`${routeLen * routeDraw} ${routeLen}`}
              />
              {routeDraw > 0.97 ? (
                <path
                  d={`M${sockRoute[3].x + 14},${sockRoute[3].y}l-22,-13l0,26Z`}
                  fill={CR.mess}
                  opacity={prog(routeDraw, 0.97, 1)}
                />
              ) : null}
            </g>
          ) : null}
          <Chip x={540} y={1404} text="1 SOCK = 1 WHOLE TRIP. SO IT STAYS." color={CR.mess} opacity={prog(f, NEVER, NEVER + 8) * (1 - prog(f, QUIZ_FROM - 10, QUIZ_FROM))} size={30} />

          {/* the things themselves (the ones in a basket are drawn inside it) */}
          {things.map((t) => {
            if (t.pose.inBasket) return null;
            const wrongFloor = t.d.home !== t.d.at;
            const onSlot = t.where === 'slot' && t.pose.p.y === slotOf(t.d).y && t.pose.p.x === t.d.x;
            const order = [...DEFS].map((d, j) => ({ j, k: d.x + (d.at === 'down' ? 1200 : 0) })).sort((a, b) => a.k - b.k).findIndex((o) => o.j === t.i);
            const look = bump(f, LOOK + order * 3, 16);
            const room = wrongFloor ? 0 : bump(f, ROOM + order * 2, 16);
            const sockGlow = t.d.g === 'sock' ? prog(f, SOCK, SOCK + 6) * (1 - prog(f, QUIZ_FROM - 10, QUIZ_FROM)) : 0;
            const ring = wrongFloor && onSlot ? Math.max(hookOn, ringsBack * (f < LOOP_A ? 1 : 0), f >= LOOP_A ? 1 : 0) : 0;
            return (
              <g key={t.i}>
                <Pulse x={t.pose.p.x} y={t.pose.p.y} k={Math.max(look, room)} s={THING_S} />
                <Pulse x={t.pose.p.x} y={t.pose.p.y} k={sockGlow} color={CR.warn} s={THING_S} />
                {drawThing(t)}
                <WrongRing x={t.d.x} y={slotOf(t.d).y} way={t.d.home} opacity={ring} s={THING_S} />
              </g>
            );
          })}

          {/* the trips that were happening anyway — nothing in their hands */}
          {Array.from({ length: GHOSTS }, (_, k) => {
            const u = prog(f, ghostFrom(k), ghostFrom(k) + GHOST_DUR);
            if (u <= 0 || u >= 1) return null;
            const path = k % 2 === 0 ? GHOST_UP : [...GHOST_UP].reverse();
            const p = along(path, EASE_INOUT(u) * 0.2 + u * 0.8);
            const op = 0.55 * Math.min(prog(u, 0, 0.12), 1 - prog(u, 0.88, 1));
            return <Walker key={`g${k}`} x={p.x} y={p.y} dist={p.dist} opacity={op} />;
          })}

          {/* whoever takes the stairs next */}
          {(['up', 'down'] as Floor[]).map((fl) => {
            const w = walkerAt(fl, f);
            return <Walker key={`w${fl}`} x={w.x} y={w.y} dist={w.dist} opacity={walkOn} />;
          })}

          {basketLayer('up')}
          {basketLayer('down')}

          <Chip
            x={540}
            y={1404}
            text={`STAIR TRIPS TAKEN ANYWAY: ${ghostsDone}`}
            color={CR.text}
            opacity={ghostChipOn}
            size={30}
          />
        </svg>

        <Stamp text="HALF GONE" at={LAST_DELIVERY} until={wAt(8, 'emptyhanded')} color={CR.good} x={290} y={760} size={58} rotate={-6} />

        {HEADS.map((h, k) => {
          const next = HEADS[k + 1];
          const b = next ? next.a : END + 30;
          const op = Math.min(prog(f, h.a + 2, h.a + 9), 1 - prog(f, b - 7, b)) * bandOn;
          if (op <= 0.01) return null;
          return (
            <div key={k} style={{ opacity: op }}>
              <BigTitle lines={h.lines} y={120} size={58} warm />
            </div>
          );
        })}
      </AbsoluteFill>

      <Sequence from={QUIZ_FROM} durationInFrames={QUIZ_DUR}>
        <PauseCard title="PAUSE" subtitle="wrong floor, zero extra trips. how?" durSec={QUIZ_DUR / 30} accent={ACCENT} y={300} />
      </Sequence>

      <Captions lines={VO} y={1510} accent={ACCENT} plate />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
