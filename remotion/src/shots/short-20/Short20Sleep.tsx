import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import {
  ALARM,
  AlarmColumn,
  Bracket,
  Chip,
  ClockAxis,
  EASE_INOUT,
  EASE_OUT,
  GhostBed,
  Geom,
  Ladder,
  NEED,
  NIGHTS,
  ONSET0,
  PHASE_COLORS,
  PhaseDefs,
  Readout,
  ROWS,
  SCHOOL_ROW,
  START_EARLY,
  START_LATE,
  STEP,
  SchoolDivider,
  TO_CLOSE,
  ZONE,
  clamp,
  debtOf,
  dividerY,
  dur,
  ladderAt,
  ladderBottom,
  mix,
  xOf,
} from '../../lib/phase';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short20Sleep',
  durationInSeconds: 45.5,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = PHASE_COLORS.accent;
const F = (s: number) => Math.round(s * 30);
const DUR = 45.5;
const END = F(DUR); // 1365

// The ladder. 12 nights down, one evening-to-morning across.
const G: Geom = { x: 130, w: 760, y: 444, rowH: 56, barH: 26, split: 54, t0: 20.5, t1: 33.5 };

// =============================================================================
// CUES — global seconds from beats.json, converted ONCE. Every scene below reads the GLOBAL
// frame (the canvas is mounted outside any <Sequence> precisely so that it does), which is
// also what makes the loop structural: frame END-1 and frame 0 are the same two scalars.
// =============================================================================
const HOOK_OUT = F(4.9); // 147

// Every cue below was RE-DERIVED from Liam's measured word times, not from the estimates: the
// slice lands in the 0.65s hole between two lines, the post appears on "two hours early", the
// staircase runs under "the alarm cuts every one short", and the readout arrives in the gap
// before "five hours" so the number is on screen when he names it.
const REWIND_A = 150; //  5.00  the staircase un-steps back onto the summer phase
const REWIND_B = 230; //  7.67
const TIME_A = 236; //  7.87  the summer night prints itself: 11:30 PM - 8:30 AM, nine hours
const TIME_B = 258;
const TIME_OA = 264;
const TIME_OB = 282;
const SLICE_A = 268; //  8.93  the alarm arrives, in the silence between two lines
const SLICE_B = 292; //  9.73
const GHOST_A = 310; // 10.33  on "bed two hours early" - the post a parent aims at
const GHOST_B = 334;
const GHOST_OA = 560;
const GHOST_OB = 590;

const QUIZ_IN = F(12.5); // 375
const QUIZ_OUT = F(16.2); // 486

const DEMO_A = 510; // 17.00  the attempt is worth exactly one step
const DEMO_B = 555; // 18.50
const ZONE_A = 516; // 17.20  ...because it landed inside the zone
const ZONE_B = 561;
const ZB_A = 606; // 20.20  the zone, measured
const ZB_B = 710;
const SB_A = 730; // 24.33  the step, measured - and the count derived from it
const SB_B = 858;
const CHIP1_A = 730;
const CHIP1_B = 852;
const CHIP1_OB = 876;
const STAIR_A = 840; // 28.00  the seven steps, taken during school
const STAIR_B = 948; // 31.60
const ZALL_A = 846;
const ZALL_B = 900;
const RO_A = 952; // 31.73  the readout arrives once every row has stepped, at 5h 00m
const RO_B = 982;
const PULSE_A = 966; // 32.20  "five hours"
const PULSE_B = 990;
const PULSE_OA = 1060;
const PULSE_OB = 1085;

const TWIST_A = 1080; // 36.00  the same staircase, seven rows earlier
const TWIST_B = 1170; // 39.00
const TAKEN2_B = 1110;
const ZOUT_A = 1074;
const ZOUT_B = 1134;

const CHIP2_A = 1206; // 40.20  what actually moves a clock, then gone before the last frame
const CHIP2_B = 1236;
const CHIP2_OA = 1300;
const CHIP2_OB = 1332;
const TITLE_OA = 150;
const TITLE_OB = 186;
const TITLE_IA = 1230;
const TITLE_IB = 1300;

// =============================================================================
// THE CANVAS — the ladder, and the two scalars that are the whole argument.
//
// `start` is the row before the first stepped night; `taken` is how far the run has got. The
// reveal runs the staircase from START_LATE, the twist slides that one number to START_EARLY,
// and every wedge, every clock face and the debt readout follow from it. Nothing here is
// keyframed twice, so nothing here can disagree with itself.
// =============================================================================
const Canvas: React.FC = () => {
  const f = useCurrentFrame();

  // ---- the two scalars -------------------------------------------------------
  const slide = EASE_INOUT(prog(f, TWIST_A, TWIST_B));
  const start = f < TIME_A ? START_EARLY : mix(START_LATE, START_EARLY, slide);

  const taken =
    f < REWIND_A
      ? NIGHTS
      : f < REWIND_B
        ? mix(NIGHTS, 0, EASE_INOUT(prog(f, REWIND_A, REWIND_B)))
        : f < DEMO_A
          ? 0
          : f < DEMO_B
            ? EASE_OUT(prog(f, DEMO_A, DEMO_B))
            : f < STAIR_A
              ? 1
              : f < STAIR_B
                ? mix(1, 5, prog(f, STAIR_A, STAIR_B))
                : f < TWIST_A
                  ? 5
                  : mix(5, NIGHTS, EASE_OUT(prog(f, TWIST_A, TAKEN2_B)));

  // The alarm is a fact of the school week, so it is on screen at frame 0 — but it only BITES
  // once the rewind has put the clock back where the summer left it, which is the one event in
  // the setup and the reason the wedges tear open all at once.
  const bite = f < REWIND_A ? 1 : EASE_OUT(prog(f, SLICE_A + 6, SLICE_B));
  const drop = f < REWIND_A ? 1 : Math.max(1 - prog(f, REWIND_A, REWIND_A + 40), EASE_OUT(prog(f, SLICE_A, SLICE_B - 4)));

  const nights = ladderAt(start, taken, bite);
  const lost = debtOf(nights); // the wedges just drawn, added back up

  // ---- what is lit ----------------------------------------------------------
  const hot = prog(f, DEMO_A - 15, DEMO_A + 5) * (1 - prog(f, PULSE_OA, PULSE_OB));
  const hotRow = f < STAIR_A ? SCHOOL_ROW : clamp(SCHOOL_ROW + Math.floor(taken - 1), SCHOOL_ROW, ROWS - 1);

  const zFade = 1 - prog(f, ZOUT_A, ZOUT_B);
  const zSolo = prog(f, ZONE_A, ZONE_B) * zFade;
  const zAll = prog(f, ZALL_A, ZALL_B) * zFade;
  const zoneOf = (n: { i: number; school: boolean }) =>
    n.i === SCHOOL_ROW ? Math.max(zSolo, zAll) : n.school ? zAll * 0.45 : 0;

  const showTime = prog(f, TIME_A, TIME_B) * (1 - prog(f, TIME_OA, TIME_OB));
  const ghost = prog(f, GHOST_A, GHOST_B) * (1 - prog(f, GHOST_OA, GHOST_OB));

  // the row the demo happens on, so the brackets track the bar rather than a guessed x
  const demo = nights[SCHOOL_ROW];
  const readout = f < TITLE_OA ? 1 - prog(f, TITLE_OA - 30, TITLE_OA) : prog(f, RO_A, RO_B);
  const pulse = prog(f, PULSE_A, PULSE_B) * (1 - prog(f, PULSE_OA, PULSE_OB));

  const cam = 1 + 0.05 * (1 - EASE_OUT(prog(f, 0, 120)) + EASE_INOUT(prog(f, TITLE_IA, END - 1)));

  return (
    <AbsoluteFill style={{ transform: `scale(${cam})` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <PhaseDefs />
        <ClockAxis g={G} />
        <SchoolDivider g={G} labelX={G.x + 360} />
        <AlarmColumn g={G} drop={drop} />

        <Ladder nights={nights} g={G} hotRow={hotRow} hot={hot} zoneOf={zoneOf} timeRow={3} showTime={showTime} />

        {/* THE COLUMN OF LOSS — the five wedges, drawn as the one thing they add up to. */}
        {pulse > 0.01 ? (
          <rect
            x={xOf(ALARM, G) - 4}
            y={dividerY(G) + 10}
            width={xOf(ONSET0 + NEED, G) - xOf(ALARM, G) + 8}
            height={ladderBottom(G) - dividerY(G) - 22}
            rx={16}
            fill="none"
            stroke={PHASE_COLORS.lost}
            strokeWidth={3}
            opacity={pulse * 0.9}
          />
        ) : null}

        {/* THE ATTEMPT — a post two hours early, and the bracket that says so. */}
        <GhostBed g={G} row={SCHOOL_ROW} at={ONSET0 - 2} opacity={ghost} />
        <Bracket
          g={G}
          row={SCHOOL_ROW}
          from={ONSET0}
          to={ONSET0 - 2}
          label="2 H EARLIER"
          opacity={prog(f, GHOST_A, GHOST_B) * (1 - prog(f, DEMO_A, DEMO_A + 20))}
        />

        {/* THE ZONE, MEASURED — and it is anchored to the bar, so it travels with the clock. */}
        <Bracket
          g={G}
          row={SCHOOL_ROW}
          from={demo.onset - ZONE}
          to={demo.onset}
          label={`${ZONE} H`}
          opacity={prog(f, ZB_A, ZB_A + 20) * (1 - prog(f, ZB_B, ZB_B + 16))}
        />

        {/* THE STEP, MEASURED — what the two-hour attempt was actually worth. */}
        <Bracket
          g={G}
          row={SCHOOL_ROW}
          from={ONSET0}
          to={demo.onset}
          label={`${Math.round(STEP * 60)} MIN`}
          color={PHASE_COLORS.full}
          opacity={prog(f, SB_A, SB_A + 20) * (1 - prog(f, SB_B, SB_B + 20))}
        />

        {/* THE COUNT, DERIVED — 1h45 of phase over a 15-minute bite. */}
        <Chip
          x={G.x}
          y={ladderBottom(G) + 18}
          w={560}
          color={PHASE_COLORS.full}
          lines={[
            'THE WHOLE MOVE',
            `${dur(TO_CLOSE)} at ${Math.round(STEP * 60)} min a night`,
            `= ${NIGHTS} nights`,
          ]}
          opacity={prog(f, CHIP1_A, CHIP1_A + 22) * (1 - prog(f, CHIP1_B, CHIP1_OB))}
        />

        <Readout lost={lost} x={G.x} y={ladderBottom(G) + 80} opacity={readout} />

        {/* THE MECHANISM — what actually moves a clock, and gone before the last frame. */}
        <Chip
          x={G.x + 430}
          y={ladderBottom(G) + 14}
          w={340}
          color={PHASE_COLORS.full}
          lines={['WHAT MOVES IT', 'A held wake time,', 'and morning light.']}
          opacity={prog(f, CHIP2_A, CHIP2_B) * (1 - prog(f, CHIP2_OA, CHIP2_OB))}
        />
      </svg>
    </AbsoluteFill>
  );
};

// =============================================================================
// THE TITLE — one instance, at the root, so frame 0 and frame END-1 cannot differ. `warm`
// pre-rolls BigTitle's own entrance; only this wrapper's opacity ever moves.
// =============================================================================
const Title: React.FC = () => {
  const f = useCurrentFrame();
  const o = f < TITLE_IA ? 1 - prog(f, TITLE_OA, TITLE_OB) : prog(f, TITLE_IA, TITLE_IB);
  if (o <= 0.01) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o }}>
      <BigTitle
        warm
        y={158}
        size={74}
        lines={[{ text: 'SCHOOL STARTS' }, { text: `${NIGHTS} NIGHTS EARLY`, color: ACCENT }]}
        subtitle="the one thing you cannot buy on Sunday"
      />
    </div>
  );
};

// =============================================================================
// THE SHOT
// =============================================================================
export default function Short20Sleep() {
  return (
    <AbsoluteFill style={{ background: PHASE_COLORS.stage }}>
      <ShortsBackdrop base={PHASE_COLORS.stage} glow="#171d2b" />

      {/* ONE canvas, on GLOBAL time, for the whole video: the ladder is the continuity, and the
          loop closes because frame END-1 evaluates the same two scalars as frame 0. */}
      <Canvas />
      <Title />

      <Kicker text="THE SUMMER PHASE" at={REWIND_A + 50} until={SLICE_A} />
      <Kicker text="THE FORBIDDEN ZONE" at={ZB_A} until={ZB_B + 16} />
      <Kicker text="FIFTEEN MINUTES A NIGHT" at={SB_A} until={SB_B} color={PHASE_COLORS.full} />
      <Kicker text="STARTING ON DAY ONE" at={SB_B + 10} until={PULSE_OB} color={PHASE_COLORS.lost} />
      <Kicker text={`${NIGHTS} DAYS EARLIER`} at={TWIST_A + 8} until={TITLE_IA - 20} color={PHASE_COLORS.full} />

      {/* QUIZ — the ghost post is already standing on the row the question is about. */}
      <Sequence from={QUIZ_IN} durationInFrames={QUIZ_OUT - QUIZ_IN}>
        <PauseCard
          title="PAUSE"
          subtitle="bed two hours early: how much sleep?"
          durSec={(QUIZ_OUT - QUIZ_IN) / 30}
          y={636}
          accent={ACCENT}
        />
      </Sequence>

      {/* GLOBAL */}
      <Captions lines={VO} y={1400} accent={ACCENT} plate />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
