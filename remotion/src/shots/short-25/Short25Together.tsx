import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, PauseCard, ProgressBar, ShortsBackdrop, Stamp, prog } from '../../lib/shorts';
import {
  Block,
  ColumnTag,
  DayAxis,
  EASE_INOUT,
  EASE_OUT,
  Iv,
  Marker,
  OV,
  Person,
  Pill,
  Readout,
  Scale,
  SharedWash,
  SourcePlate,
  Strip,
  complement,
  hm,
  intersect2,
  intersectAll,
  mix,
  totalMin,
} from '../../lib/overlap';
import { FONT_BODY } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short25Together',
  durationInSeconds: 43.0,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = OV.accent;
const F = (s: number) => Math.round(s * 30);
const DUR = 43.0;
const END = F(DUR); // 1290

// =============================================================================
// THE MODEL — one ordinary weekday, 07:00 to 22:00, in minutes from 07:00.
//
// These blocks are the ONLY authored numbers in the video. Nothing else is typed: every free
// total is the COMPLEMENT of a person's blocks, every shared window is the INTERSECTION of
// those complements, and both are recomputed from the blocks that are actually DRAWN on the
// current frame. Slide a block and the arithmetic follows it, mid-slide, continuously.
//
// The schedule is a plausible household, not sourced data — exactly as short-19's five games
// were the lengths of the games. The video's claim about it is only that these sets intersect
// the way set intersection says they do. The SOURCED claims are the twist's two findings and
// the shape of an ordinary working day (see beats.json.facts).
// =============================================================================
const LO = 0;
const HI = 900; // 15 hours
const DAY_START = 420; // 07:00
const S: Scale = { x: 175, w: 730, lo: LO, hi: HI };

const C_WORK = OV.indigo;
const C_ACT = OV.violet;
const C_TASK = '#5f6f8c';
const C_SLEEP = '#39445a';

const PEOPLE: Person[] = [
  {
    id: 'dad',
    label: 'DAD',
    sub: '',
    blocks: [{ id: 'd-work', a: 15, b: 690, label: 'WORK + COMMUTE', color: C_WORK }],
  },
  {
    id: 'mum',
    label: 'MUM',
    sub: '',
    blocks: [
      { id: 'm-work', a: 45, b: 570, label: 'WORK', color: C_WORK },
      { id: 'm-adm', a: 780, b: 840, label: 'ADMIN', color: C_TASK },
    ],
  },
  {
    id: 'teen',
    label: 'TEEN',
    sub: '14',
    blocks: [
      { id: 't-school', a: 40, b: 510, label: 'SCHOOL', color: C_WORK },
      { id: 't-train', a: 660, b: 780, label: 'TRAINING', color: C_ACT },
      { id: 't-hw', a: 810, b: 885, label: 'HOMEWORK', color: C_TASK },
    ],
  },
  {
    id: 'kid',
    label: 'KID',
    sub: '9',
    blocks: [
      { id: 'k-school', a: 80, b: 495, label: 'SCHOOL', color: C_WORK },
      { id: 'k-club', a: 510, b: 585, label: 'CLUB', color: C_ACT },
      { id: 'k-sleep', a: 810, b: 900, label: 'ASLEEP', color: C_SLEEP, textColor: OV.dim },
    ],
  },
];

const CULPRIT = 't-train'; // the one block that sits where everyone else is free
const TRAIN_A = 660; // 18:00
const TRAIN_B = 780; // 20:00
const MOVED_A = 540; // 16:00 — the same two hours, two hours earlier
const MOVED_B = 660;
const MUM_END = 570; // 16:30
const MUM_EARLY = 510; // 15:30 — a whole extra hour off, spent in the wrong place

// =============================================================================
// THE THREE STATES, EVALUATED ONCE — the title, the ratio and the twist all read off these,
// so a change to the schedule above re-argues the whole video instead of desynchronising it.
// =============================================================================
const stateAt = (slide: number, mumExtra: number): Block[][] => [
  PEOPLE[0].blocks,
  [{ ...PEOPLE[1].blocks[0], b: mix(MUM_END, MUM_EARLY, mumExtra) }, PEOPLE[1].blocks[1]],
  [
    PEOPLE[2].blocks[0],
    { ...PEOPLE[2].blocks[1], a: mix(TRAIN_A, MOVED_A, slide), b: mix(TRAIN_B, MOVED_B, slide) },
    PEOPLE[2].blocks[2],
  ],
  PEOPLE[3].blocks,
];
const freeSetsOf = (bs: Block[][]): Iv[][] => bs.map((b) => complement(b, LO, HI));

const FREE_REAL = freeSetsOf(stateAt(0, 0));
const SHARED_REAL = totalMin(intersectAll(FREE_REAL)); // 15  — 07:00-07:15, the scramble
const SHARED_MOVED = totalMin(intersectAll(freeSetsOf(stateAt(1, 0)))); // 105
const SHARED_MUM_HOUR = totalMin(intersectAll(freeSetsOf(stateAt(0, 1)))); // 15 — unmoved
// HOUSE FREE = 1095 min = 18:15 and the best pair (MUM+KID) = 240 min = 4:00 are not consts:
// both are recomputed on screen every frame, by the right-hand readout and by the twist band.
const RATIO = Math.round(SHARED_MOVED / SHARED_REAL); // 7
const GAINED = SHARED_MUM_HOUR - SHARED_REAL; // 0 — an hour of free time buys nothing

// =============================================================================
// LAYOUT — one column. Nothing critical below y1420 or right of x920.
// =============================================================================
const ROW_TOP = [496, 640, 784, 928];
const ROW_H = 90;
const WASH_TOP = 476;
const WASH_BOT = 1026;
const PAIR_TOP = 616; // the wash brackets MUM..KID when only those two are lit
const MARK_Y = 432; // the shared markers' caret line, clear of the first row's header
const TAG_Y = 366; // the culprit column's name, one line ABOVE the shared markers
const AXIS_Y = 1044;
const LEGEND_Y = 1136;
const READ_Y = 1252;
const STAMP_Y = 300; // in the band the title vacates — never over a strip

// =============================================================================
// CUES — GLOBAL frames. Inside a <Sequence> the frame is LOCAL, so Canvas is handed its
// sequence's `from` and adds it back before comparing against anything below.
// Estimated word times for now; re-placed against the real ones after gen_voice.
// =============================================================================
const HOOK_OUT = F(5.1); // 153
const SETUP_OUT = F(18.78); // 563
const QUIZ_OUT = F(21.55); // 647
const REVEAL_OUT = F(29.1); // 873
const TWIST_OUT = F(38.85); // 1166

// EVERY cue below is a REAL word time out of beats.json, not an estimate. The comment on each
// line is the word it lands on.
const FILL_OUT_A = 138; //  4.60  the four FREE totals rewind in the gap after the hook line
const FILL_OUT_B = 158; //  5.27  empty as "This one day" (5.28) starts
const FILL_IN = 160; //  5.33  and refill 9 frames apart, the last landing under "hours" (6.63)
const RING_OUT_A = 158; //  5.27  the culprit ring lets go, so the quiz is not given away
const RING_OUT_B = 190; //  6.33
const TITLE_OUT_A = 200; //  6.67  the title clears the band the card and the plate will use
const TITLE_OUT_B = 244; //  8.13
const MUM_IN_A = 372; // 12.40  "extra" (12.57) — her work block gives an hour back
const MUM_IN_B = 400; // 13.33  lands on "hour off" (12.93-13.23)
const GAIN_IN = 418; // 13.93  the stamp lands on "changes." (14.01)
const GAIN_OUT = 484; // 16.13
const MUM_OUT_A = 462; // 15.40  the hour goes back before the question
const MUM_OUT_B = 492; // 16.40
const MK_A_OUT_A = 630; // 21.00  the 07:00 marker clears before the picture changes
const MK_A_OUT_B = 652; // 21.73
const RING_IN_A = 640; // 21.33  and the ring comes back as the answer, on "training" (22.18)
const RING_IN_B = 668; // 22.27
const SLIDE_A = 668; // 22.27  "training" (22.18)
const SLIDE_B = 712; // 23.73  lands just after "earlier," (23.02-23.39) — the band blooms AS it slides
const SAME_IN = 726; // 24.20  "SAME FREE TIME" on "a minute." (24.21)
const SAME_OUT = 792; // 26.40
const MK_B_IN_A = 726; // 24.20  the new evening window gets its clock label
const MK_B_IN_B = 752; // 25.07
const RATIO_IN = 812; // 27.07  "7 TIMES MORE" under "an hour forty five" (27.19-27.85)
const RATIO_OUT = 868; // 28.93
const MK_B_OUT_A = 880; // 29.33
const MK_B_OUT_B = 902; // 30.07
const DIM_A = 896; // 29.87  "You never needed all four" (29.51) — DAD and TEEN step back
const DIM_B = 928; // 30.93
const FOUR_OUT_A = 900; // 30.00
const FOUR_OUT_B = 922; // 30.73
const PAIR_SWITCH = 924; // 30.80  swapped while every band is at zero opacity
const PAIR_IN_A = 928; // 30.93
const PAIR_IN_B = 958; // 31.93  fully lit just before "Two of them" (32.02)
const MK_C_IN_A = 966; // 32.20  the 16:45-20:00 marker, under "already share" (32.58-32.98)
const MK_C_IN_B = 996; // 33.20
const PLATE_IN = 1056; // 35.20  the findings arrive under "Group time" (35.60)
const PLATE_FULL = 1086; // 36.20  pill 1 lands on "fades," (36.20)
const PILL2_IN = 1096; // 36.53  pill 2 lands on "one on one time" (36.72-37.21)
const PILL2_FULL = 1120; // 37.33
const PLATE_OUT_A = 1136; // 37.87
const PLATE_OUT_B = 1158; // 38.60
const MK_C_OUT_A = 1140; // 38.00
const MK_C_OUT_B = 1158; // 38.60
const PAIR_OUT_A = 1144; // 38.13
const PAIR_OUT_B = 1164; // 38.80
const UNDIM_A = 1150; // 38.33  everyone relights
const UNDIM_B = 1182; // 39.40
const BACK_SWITCH = 1166; // 38.87
const FOUR_IN_A = 1168; // 38.93
const FOUR_IN_B = 1194; // 39.80
const SLIDE_BACK_A = 1212; // 40.40  the block travels home under "Move one block." (40.50-41.00)
const SLIDE_BACK_B = 1252; // 41.73
const TITLE_IN_A = 1210; // 40.33
const TITLE_IN_B = 1266; // 42.20
const MK_A_IN_A = 1244; // 41.47
const MK_A_IN_B = 1280; // 42.67
const PUNCH_A = 1218; // 40.60

// =============================================================================
// STATE AS A FUNCTION OF THE GLOBAL FRAME. Every one of these is 0 (or 1) at BOTH f=0 and
// f=END-1 by construction — short-13's loop rule applied at authoring time, not debugged in.
// =============================================================================
const slideAt = (f: number) =>
  EASE_INOUT(prog(f, SLIDE_A, SLIDE_B)) * (1 - EASE_INOUT(prog(f, SLIDE_BACK_A, SLIDE_BACK_B)));

const mumExtraAt = (f: number) =>
  EASE_INOUT(prog(f, MUM_IN_A, MUM_IN_B)) * (1 - EASE_INOUT(prog(f, MUM_OUT_A, MUM_OUT_B)));

/**
 * Each person's FREE total is always the truth — a label that read 0:00 beside a visibly
 * half-empty track would be the picture contradicting itself. What rewinds is the HOUSE total,
 * which is a SUM being built: it drops to zero and the four rows are added back one at a time,
 * each row flashing its own edge as it goes in.
 */
const fillAt = (f: number, i: number) =>
  Math.max(
    1 - EASE_INOUT(prog(f, FILL_OUT_A, FILL_OUT_B)),
    EASE_OUT(prog(f, FILL_IN + 9 * i, FILL_IN + 22 + 9 * i))
  );

/** The row's own "counted in" flash, on for about half a second as its share lands. */
const pulseAt = (f: number, i: number) => {
  const a = FILL_IN + 9 * i;
  return EASE_OUT(prog(f, a, a + 8)) * (1 - EASE_INOUT(prog(f, a + 22, a + 38)));
};

const dimAt = (f: number, i: number) =>
  i === 1 || i === 3 ? 1 : 1 - EASE_INOUT(prog(f, DIM_A, DIM_B)) * (1 - EASE_INOUT(prog(f, UNDIM_A, UNDIM_B)));

const fourOpAt = (f: number) =>
  1 - EASE_INOUT(prog(f, FOUR_OUT_A, FOUR_OUT_B)) * (1 - EASE_INOUT(prog(f, FOUR_IN_A, FOUR_IN_B)));

const pairOpAt = (f: number) =>
  EASE_OUT(prog(f, PAIR_IN_A, PAIR_IN_B)) * (1 - EASE_INOUT(prog(f, PAIR_OUT_A, PAIR_OUT_B)));

const ringOpAt = (f: number) =>
  1 - EASE_INOUT(prog(f, RING_OUT_A, RING_OUT_B)) + EASE_OUT(prog(f, RING_IN_A, RING_IN_B));

const titleOpAt = (f: number) =>
  1 - EASE_INOUT(prog(f, TITLE_OUT_A, TITLE_OUT_B)) + EASE_OUT(prog(f, TITLE_IN_A, TITLE_IN_B));

/** A readout dip: 1 -> 0 -> 1, so the value can be swapped while nothing is on screen. */
const dip = (f: number, a: number, b: number, c: number, d: number) =>
  1 - EASE_INOUT(prog(f, a, b)) * (1 - EASE_INOUT(prog(f, c, d)));

const readOpAt = (f: number) => dip(f, 902, 920, 924, 950) * dip(f, 1148, 1164, 1166, 1190);
const pairModeAt = (f: number) => f >= PAIR_SWITCH && f < BACK_SWITCH;

// =============================================================================
// THE CANVAS — the whole video is this one persistent panel; the beats only switch things on.
// =============================================================================
const Canvas: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame() + from; // GLOBAL frame

  // ---- the model, re-solved on this frame from the blocks that are actually drawn ----------
  const blocks = stateAt(slideAt(f), mumExtraAt(f));
  const free = freeSetsOf(blocks);
  const shared4 = intersectAll(free);
  const pair = intersect2(free[1], free[3]);
  const pairMode = pairModeAt(f);
  const shown = pairMode ? pair : shared4;

  const house = free.reduce((t, fr, i) => t + totalMin(fr) * fillAt(f, i), 0);
  const ringOp = ringOpAt(f);
  const train: Iv = { a: blocks[2][1].a, b: blocks[2][1].b };
  const bandOp = pairMode ? pairOpAt(f) : fourOpAt(f);
  const washY0 = mix(WASH_TOP, PAIR_TOP, pairMode ? EASE_OUT(prog(f, PAIR_IN_A, PAIR_IN_B)) : 0);

  const mkA = 1 - EASE_INOUT(prog(f, MK_A_OUT_A, MK_A_OUT_B)) + EASE_OUT(prog(f, MK_A_IN_A, MK_A_IN_B));
  const mkB = EASE_OUT(prog(f, MK_B_IN_A, MK_B_IN_B)) * (1 - EASE_INOUT(prog(f, MK_B_OUT_A, MK_B_OUT_B)));
  const mkC = EASE_OUT(prog(f, MK_C_IN_A, MK_C_IN_B)) * (1 - EASE_INOUT(prog(f, MK_C_OUT_A, MK_C_OUT_B)));
  const plateOp = EASE_OUT(prog(f, PLATE_IN, PLATE_FULL)) * (1 - EASE_INOUT(prog(f, PLATE_OUT_A, PLATE_OUT_B)));
  const pill2Op = EASE_OUT(prog(f, PILL2_IN, PILL2_FULL));

  // Punch: settles out of the hook and runs BACKWARDS into the wrap, landing on frame 0's scale.
  const punch =
    f < 400 ? mix(1.04, 1.0, EASE_OUT(prog(f, 0, 84))) : mix(1.0, 1.04, EASE_INOUT(prog(f, PUNCH_A, END - 1)));

  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', left: 0, top: 0 }}>
      <g transform={`translate(540 780) scale(${punch}) translate(-540 -780)`}>
        {/* ---- THE CULPRIT CASTS A COLUMN TOO, so the block the video is about and the window
             it is standing in can be read against each other in one glance ------------------ */}
        <SharedWash shared={[train]} s={S} y0={WASH_TOP} y1={WASH_BOT} opacity={Math.min(1, ringOp) * 0.85} color={OV.pink} />

        {/* ---- THE INTERSECTION, AS A COLUMN OF LIGHT THROUGH EVERY STRIP AT ONCE --------- */}
        <SharedWash shared={shown} s={S} y0={washY0} y1={WASH_BOT} opacity={bandOp} />

        {/* ---- THE FOUR DAYS -------------------------------------------------------------- */}
        {PEOPLE.map((p, i) => (
          <Strip
            key={p.id}
            person={p}
            blocks={blocks[i]}
            shared={pairMode && !(i === 1 || i === 3) ? [] : shown}
            s={S}
            y={ROW_TOP[i]}
            h={ROW_H}
            freeMin={totalMin(free[i])}
            pulse={pulseAt(f, i)}
            dim={dimAt(f, i)}
            sharedOpacity={bandOp}
            ring={CULPRIT}
            ringOp={i === 2 ? ringOp : 0}
          />
        ))}

        {/* ---- WHERE THE SHARED WINDOWS ACTUALLY ARE, ON THE CLOCK ------------------------ */}
        {shared4.length > 0 && mkA > 0.01 ? (
          <Marker iv={shared4[0]} s={S} y={MARK_Y} dayStart={DAY_START} opacity={Math.min(1, mkA)} />
        ) : null}
        {shared4.length > 1 && mkB > 0.01 ? (
          <Marker iv={shared4[1]} s={S} y={MARK_Y} dayStart={DAY_START} opacity={mkB} />
        ) : null}
        {pair.length > 1 && mkC > 0.01 ? (
          <Marker iv={pair[1]} s={S} y={MARK_Y} dayStart={DAY_START} opacity={mkC} />
        ) : null}
        <ColumnTag iv={train} s={S} y={TAG_Y} text="TRAINING" opacity={Math.min(1, ringOp)} />

        <DayAxis s={S} y={AXIS_Y} dayStart={DAY_START} stepMin={120} />
        <text
          x={540}
          y={LEGEND_Y}
          fill={OV.dim}
          fontFamily={FONT_BODY}
          fontSize={26}
          fontWeight={500}
          letterSpacing={3}
          textAnchor="middle"
        >
          EMPTY = FREE
          <tspan fill={ACCENT}>{'    ·    TEAL = FREE AT THE SAME TIME'}</tspan>
        </text>

        {/* ---- THE TWO NUMBERS THE WHOLE VIDEO IS ABOUT ----------------------------------- */}
        <Readout
          minutes={totalMin(shown)}
          x={S.x}
          y={READ_Y}
          note={pairMode ? 'SHARED · MUM + KID' : 'SHARED · ALL FOUR'}
          size={118}
          opacity={readOpAt(f)}
        />
        <Readout
          minutes={house}
          x={585}
          y={READ_Y}
          note="FREE IN THE HOUSE"
          size={118}
          color={OV.text}
          opacity={1}
        />

        {/* ---- THE TWIST'S TWO FINDINGS, IN THE BAND THE TITLE VACATED -------------------- */}
        {plateOp > 0.01 ? (
          <g opacity={plateOp}>
            <Pill text="GROUP TIME FALLS THROUGH ADOLESCENCE" x={S.x} y={160} w={S.w} size={28} color={OV.dim} />
            <Pill text="ONE ON ONE TIME PEAKS IN IT" x={S.x} y={244} w={S.w} size={28} color={ACCENT} opacity={pill2Op} />
            <SourcePlate
              lines={[
                'LAM, McHALE & CROUTER 2012 · CHILD DEVELOPMENT 83(6)',
                '188 FAMILIES · AGES 8-18 · NIGHTLY PHONE INTERVIEWS',
              ]}
              x={540}
              y={330}
            />
          </g>
        ) : null}
      </g>
    </svg>
  );
};

// =============================================================================
// THE TITLE — on at frame 0 (the hook rule), out of the way for the card and the plate, and
// back for the wrap. `warm` pre-rolls BigTitle's own entrance so only this opacity moves.
// =============================================================================
const TitleLayer: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: Math.min(1, titleOpAt(f)) }}>
      <BigTitle
        warm
        y={140}
        size={72}
        lines={[{ text: 'FOUR PEOPLE, ONE HOUSE' }, { text: `${hm(SHARED_REAL)} TOGETHER ALL DAY`, color: ACCENT }]}
      />
    </div>
  );
};

// =============================================================================
// THE SHOT
// =============================================================================
export default function Short25Together() {
  return (
    <AbsoluteFill style={{ background: OV.stage }}>
      <ShortsBackdrop />

      {/* HOOK — frame 0 fully composed: four real days, the 15-minute column already lit and
          marked at 07:00, and the block that costs them the evening already ringed. */}
      <Sequence from={0} durationInFrames={HOOK_OUT}>
        <Canvas from={0} />
      </Sequence>

      {/* SETUP — the FREE totals rewind and count back up, then a whole extra hour is handed
          to one person and the shared readout does not move. */}
      <Sequence from={HOOK_OUT} durationInFrames={SETUP_OUT - HOOK_OUT}>
        <Canvas from={HOOK_OUT} />
        <Stamp
          text={`${hm(GAINED)} GAINED`}
          at={GAIN_IN - HOOK_OUT}
          until={GAIN_OUT - HOOK_OUT}
          x={540}
          y={STAMP_Y}
          size={66}
          color={OV.pink}
        />
      </Sequence>

      {/* QUIZ — the card sits in the title's old band so the whole panel stays visible; the
          answer is on screen, in the one block standing where three people are free. */}
      <Sequence from={SETUP_OUT} durationInFrames={QUIZ_OUT - SETUP_OUT}>
        <Canvas from={SETUP_OUT} />
        <PauseCard
          subtitle="which block is costing them the evening?"
          durSec={(QUIZ_OUT - SETUP_OUT) / 30}
          y={250}
          accent={ACCENT}
        />
      </Sequence>

      {/* REVEAL — the training block slides two hours earlier. Nobody's free time changes;
          the intersection is recomputed every frame, so the evening column blooms AS it moves. */}
      <Sequence from={QUIZ_OUT} durationInFrames={REVEAL_OUT - QUIZ_OUT}>
        <Canvas from={QUIZ_OUT} />
        <Stamp
          text="SAME FREE TIME"
          at={SAME_IN - QUIZ_OUT}
          until={SAME_OUT - QUIZ_OUT}
          x={540}
          y={STAMP_Y}
          size={62}
          color={OV.warn}
        />
        <Stamp
          text={`${RATIO} TIMES MORE`}
          at={RATIO_IN - QUIZ_OUT}
          until={RATIO_OUT - QUIZ_OUT}
          x={540}
          y={STAMP_Y}
          size={62}
          color={ACCENT}
        />
      </Sequence>

      {/* TWIST — the hardest window in the house is the four-way one. Two of them already
          share four hours, and the pair is the part the research says holds up. */}
      <Sequence from={REVEAL_OUT} durationInFrames={TWIST_OUT - REVEAL_OUT}>
        <Canvas from={REVEAL_OUT} />
      </Sequence>

      {/* LOOP — everyone relights, the block travels home, the punch runs backwards onto
          frame 0. The last frame is the first frame, block for block. No CTA. */}
      <Sequence from={TWIST_OUT} durationInFrames={END - TWIST_OUT}>
        <Canvas from={TWIST_OUT} />
      </Sequence>

      {/* GLOBAL */}
      <TitleLayer />
      <Captions lines={VO} y={1400} accent={ACCENT} plate />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
