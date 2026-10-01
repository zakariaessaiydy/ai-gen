import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import {
  BUDGET_COLORS,
  Block,
  Callout,
  EASE_INOUT,
  EASE_OUT,
  GuidanceArc,
  Hatch,
  Hub,
  Overlay,
  Ring,
  TAU,
  Ticks,
  fmtHM,
  layout,
  midOf,
  mix,
  remaining,
  spent,
} from '../../lib/budget';
import { FONT_BODY } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short17Screen',
  durationInSeconds: 43.0,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = BUDGET_COLORS.accent;
const F = (s: number) => Math.round(s * 30);
const END = F(43.0); // 1290

// =============================================================================
// THE MODEL — one table, and every number on screen is read back off it.
//
// Nothing below is a number chosen to look good; each is a published recommendation or a
// measured average (sources in beats.json.facts). LEFT and SLIVER are never typed as literals
// anywhere — they are the table subtracted from the day, so the hub, the callouts and the arcs
// cannot disagree with each other. Change SCHOOL to 6.5 and the video re-argues itself.
// =============================================================================
const DAY = 24;
const BLOCKS: Block[] = [
  { id: 'sleep', label: 'SLEEP', units: 10, color: BUDGET_COLORS.violet }, // AASM/AAP: 9-12h, ages 6-12
  { id: 'school', label: 'SCHOOL', units: 6.7, color: BUDGET_COLORS.indigo }, // NCES elementary average
  { id: 'move', label: 'MOVING', units: 1, color: BUDGET_COLORS.teal }, // WHO 2020: >= 60 min/day, ages 5-17
];
const SEGS = layout(BLOCKS);
const USED = BLOCKS.reduce((a, b) => a + b.units, 0); // 17.7
const LEFT = DAY - USED; // 6.3 -> "6h 18m"
const SCREEN = 5 + 33 / 60; // 5h33m — Common Sense Census, tweens 8-12, entertainment only
const SLIVER = LEFT - SCREEN; // 0.75 -> "45m"

// dial geometry — one place, so the callouts hang themselves off the same numbers the ring uses
const CX = 540;
const CY = 840;
const R_IN = 192;
const R_OUT = 272;
const R_LEAD = 284; // where a callout's leader starts
const LEAD = 44; // callout leader length — sized so the left-hand labels clear SAFE.left (60)

// =============================================================================
// CUES — global frames. Every arc lands on a spoken word (see beats.json), and the hub is
// derived from the arcs, so retiming a cue retimes its number for free (short-10's lesson).
// Inside a <Sequence> the frame is LOCAL: the Canvas is handed its `from` and adds it back,
// so everything below is compared against a GLOBAL frame.
// =============================================================================
const HOOK_OUT = F(4.8); // 144
const SETUP_OUT = F(16.6); // 498
const QUIZ_OUT = F(19.2); // 576
const REVEAL_OUT = F(31.4); // 942
const TWIST_OUT = F(38.5); // 1155

const REWIND_A = 147; //  4.90s — "Under two" wipes the finished day away
const REWIND_B = 171; //  5.70s — the ring is empty before the marker needs its spot
const G1 = 173; //  5.77s — fades over 14f so the stop at zero is LANDED on "none" (6.10-6.50)
const G2 = 300; // 10.00s — the 1-hour arc is landed mid-"hour" (10.56-10.76)
const G3 = 470; // 15.67s — the arc with no length, on "stops" (15.69)
const G_OUT = 576; // 19.20s — the guidance clears for the subtraction
const SLEEP_A = 648; // 21.60s — in the gap after "yourself" (ends 21.21)
const SLEEP_B = 700; // 23.33s — lands on "hours" (23.31)
const SCHOOL_A = 768; // 25.60s — starts on "School" (25.60)
const SCHOOL_B = 804; // 26.80s — lands on "more" (26.71)
const MOVE_A = 861; // 28.70s — starts on "hour" (28.74)
const MOVE_B = 883; // 29.43s — lands on "moving" (29.02-29.45), the word the arc means
const GLOW_A = 948; // 31.60s — the remainder lights on "Six" ...
const GLOW_B = 983; // 32.77s — ... and is fully lit by the end of "eighteen" (32.75)
const SCR_A = 1053; // 35.10s — starts on "average" (35.10)
const SCR_B = 1096; // 36.53s — lands on "half" (36.51)
const SLIVER_AT = 1180; // 39.33s — the sliver lands on "forty five" (39.33-39.87)
const LBL_OUT_A = 1242; // 41.40s — the twist's labels leave FIRST (the last caption clears here)...
const LBL_OUT_B = 1272; // 42.40s
const OVER_OUT_A = 1242; // ...the hatched arc with them
const OVER_OUT_B = 1278; // 42.60s
const LEFT_BACK_A = 1272; // 42.40s — ...and only then does LEFT OVER come back to its spot.
const LEFT_BACK_B = 1288; // 42.93s   Two labels cross-fading in one place is a smudge, not a cut.

// =============================================================================
// THE CANVAS — one dial for the whole video. It is never cut to; it is rewound, redrawn and
// overlaid. `filled` is the single scalar that choreographs it: the pen's position around the
// ring, in hours. Frame 0 and frame END-1 both evaluate to filled = USED, glow = 1.
// =============================================================================
const filledAt = (f: number) => {
  if (f <= REWIND_A) return USED;
  if (f < REWIND_B) return mix(USED, 0, EASE_INOUT(prog(f, REWIND_A, REWIND_B)));
  if (f <= SLEEP_A) return 0;
  if (f < SLEEP_B) return mix(0, SEGS[0].to, EASE_OUT(prog(f, SLEEP_A, SLEEP_B)));
  if (f <= SCHOOL_A) return SEGS[0].to;
  if (f < SCHOOL_B) return mix(SEGS[0].to, SEGS[1].to, EASE_OUT(prog(f, SCHOOL_A, SCHOOL_B)));
  if (f <= MOVE_A) return SEGS[1].to;
  if (f < MOVE_B) return mix(SEGS[1].to, SEGS[2].to, EASE_OUT(prog(f, MOVE_A, MOVE_B)));
  return USED;
};

const glowAt = (f: number) => {
  if (f < REWIND_A) return 1;
  if (f < REWIND_B) return 1 - EASE_INOUT(prog(f, REWIND_A, REWIND_B));
  if (f < GLOW_A) return 0;
  return EASE_OUT(prog(f, GLOW_A, GLOW_B));
};

/** A block's callout: on at frame 0, wiped by the rewind, redrawn as its own arc lands. */
const blockOpAt = (f: number, at: number) => {
  if (f < REWIND_A) return 1;
  if (f < REWIND_B) return 1 - EASE_INOUT(prog(f, REWIND_A, REWIND_B));
  return EASE_OUT(prog(f, at, at + 24));
};

/**
 * The loop's title. It cannot simply mount with the loop sequence: the 45-minute payoff is still
 * on screen until LBL_OUT, and a title arriving over it makes the one frame the whole video is
 * for the busiest in the video. So it holds off and takes over as the twist's labels leave.
 */
const LoopTitle: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame() + from;
  return (
    <AbsoluteFill style={{ opacity: EASE_OUT(prog(f, LBL_OUT_A - 24, LBL_OUT_B - 12)) }}>
      <BigTitle
        y={116}
        size={86}
        lines={[{ text: 'HOW MUCH SCREEN' }, { text: 'TIME IS OK?', color: ACCENT }]}
        subtitle="the honest answer is a subtraction"
      />
    </AbsoluteFill>
  );
};

const Canvas: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame() + from; // GLOBAL frame
  const filled = filledAt(f);
  const glow = glowAt(f);
  const used = spent(BLOCKS, filled);
  const left = remaining(DAY, BLOCKS, filled); // the hub's digits ARE the arcs

  // Punch: settles 1.06 -> 1.00 out of the hook, and runs backwards into the wrap so the last
  // frame lands exactly on frame 0's scale.
  const punch =
    f < 200 ? mix(1.06, 1.0, EASE_OUT(prog(f, 0, 90))) : mix(1.0, 1.06, EASE_INOUT(prog(f, 1200, END - 1)));

  // The only ambient term in the shot, and it is an INTEGER number of cycles over END, so the
  // wrap is a plain frame step (short-13's lesson: never leave a raw phase running).
  const breathe = 0.5 + 0.5 * Math.sin(TAU * 2 * (f / END));

  // guidance marks — one at a time, in the ring's own band
  const g1 = EASE_OUT(prog(f, G1, G1 + 14)) * (1 - prog(f, G2, G2 + 14));
  const g2 = EASE_OUT(prog(f, G2, G2 + 14)) * (1 - prog(f, G3, G3 + 14));
  const g3 = EASE_OUT(prog(f, G3, G3 + 14)) * (1 - prog(f, G_OUT, G_OUT + 24));

  // hubs. The budget hub owns the dial except while the guidance does.
  const hubBudget = f < 400 ? 1 - EASE_OUT(prog(f, 150, REWIND_B)) : EASE_OUT(prog(f, G_OUT + 12, G_OUT + 30));
  // Arcs may dissolve into each other; HUB TEXT may not — cross-fading two words in the same
  // 200px box reads as a smudge, not a transition. So the hubs hand over with a 4-frame gap.
  const hubG1 = EASE_OUT(prog(f, G1, G1 + 12)) * (1 - prog(f, G2 - 10, G2));
  const hubG2 = EASE_OUT(prog(f, G2 + 4, G2 + 16)) * (1 - prog(f, G3 - 10, G3));
  const hubG3 = EASE_OUT(prog(f, G3 + 4, G3 + 16)) * (1 - prog(f, G_OUT, G_OUT + 20)); // holds through the quiz

  // the twist overlay: measured screen use, laid over the ring in the ring's own units
  const scr = mix(USED, USED + SCREEN, EASE_OUT(prog(f, SCR_A, SCR_B)));
  const overOut = 1 - EASE_INOUT(prog(f, OVER_OUT_A, OVER_OUT_B));
  const lblOut = 1 - EASE_INOUT(prog(f, LBL_OUT_A, LBL_OUT_B));
  const scrOp = EASE_OUT(prog(f, SCR_A, SCR_A + 18)) * overOut;
  const scrLabel = EASE_OUT(prog(f, SCR_A + 24, SCR_A + 48)) * lblOut;
  const sliverOp = EASE_OUT(prog(f, SLIVER_AT, SLIVER_AT + 24)) * lblOut;

  // "LEFT OVER" steps aside for the overlay and comes back as it clears — that crossfade IS the
  // loop beat, and it returns to exactly 1 at the last frame.
  const leftOp =
    f < SCR_A - 12
      ? glow
      : f < LEFT_BACK_A
        ? 1 - EASE_INOUT(prog(f, SCR_A - 12, SCR_A + 18))
        : EASE_OUT(prog(f, LEFT_BACK_A, LEFT_BACK_B));

  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <Hatch id="scr-hatch" color={BUDGET_COLORS.pink} />
        <g transform={`translate(${CX} ${CY}) scale(${punch}) translate(${-CX} ${-CY})`}>
          <Ticks cx={CX} cy={CY} r={R_OUT + 4} total={DAY} step={1} major={6} />
          <Ring
            cx={CX}
            cy={CY}
            rIn={R_IN}
            rOut={R_OUT}
            total={DAY}
            blocks={BLOCKS}
            filled={filled}
            glow={glow * (0.92 + 0.08 * breathe)}
            glowColor={ACCENT}
          />

          {/* what the guidelines actually say, drawn in the day's own units */}
          <GuidanceArc cx={CX} cy={CY} rIn={R_IN} rOut={R_OUT} total={DAY} units={0} color={BUDGET_COLORS.pink} opacity={g1} />
          <GuidanceArc cx={CX} cy={CY} rIn={R_IN} rOut={R_OUT} total={DAY} units={1} color={BUDGET_COLORS.teal} opacity={g2} />
          <GuidanceArc
            cx={CX}
            cy={CY}
            rIn={R_IN}
            rOut={R_OUT}
            total={DAY}
            units={0}
            unknown
            color={BUDGET_COLORS.pink}
            opacity={g3}
            pulse={breathe}
          />

          {/* the measured average, over the remainder it has to fit inside */}
          <Overlay
            cx={CX}
            cy={CY}
            rIn={R_IN + 12}
            rOut={R_OUT - 12}
            total={DAY}
            from={USED}
            to={scr}
            color={BUDGET_COLORS.pink}
            opacity={scrOp}
            hatch="scr-hatch"
          />

          {/* callouts — each hangs itself off its own segment, no measured coordinates */}
          {SEGS.map((s, i) => (
            <Callout
              key={s.block.id}
              cx={CX}
              cy={CY}
              r={R_LEAD}
              a={midOf(s.from, s.to)}
              total={DAY}
              text={s.block.label}
              value={fmtHM(s.block.units)}
              color={s.block.color}
              lead={LEAD}
              opacity={blockOpAt(f, [SLEEP_B, SCHOOL_B, MOVE_B][i])}
            />
          ))}
          <Callout
            cx={CX}
            cy={CY}
            r={R_LEAD}
            a={midOf(used, DAY)}
            total={DAY}
            text="LEFT OVER"
            value={fmtHM(left)}
            color={ACCENT}
            lead={LEAD}
            opacity={leftOp}
          />
          <Callout
            cx={CX}
            cy={CY}
            r={R_LEAD}
            a={midOf(USED, USED + SCREEN)}
            total={DAY}
            text="SCREENS"
            value={fmtHM(SCREEN)}
            color={BUDGET_COLORS.pink}
            lead={LEAD}
            opacity={scrLabel}
          />
          <Callout
            cx={CX}
            cy={CY}
            r={R_LEAD}
            a={midOf(USED + SCREEN, DAY)}
            total={DAY}
            text={fmtHM(SLIVER)}
            value="everything else"
            color={ACCENT}
            lead={116}
            opacity={sliverOp}
          />

          {/* the hub — always a value the geometry just produced */}
          <Hub cx={CX} cy={CY} value={fmtHM(left)} label="LEFT OVER" sub="of a 24 hour day" color={ACCENT} size={88} opacity={hubBudget} />
          <Hub cx={CX} cy={CY} value="NONE" label="UNDER 2" sub="video calls don't count" color={BUDGET_COLORS.pink} size={96} opacity={hubG1} />
          <Hub cx={CX} cy={CY} value="1 HOUR" label="AGES 2 - 5" sub="a day. less is better" color={BUDGET_COLORS.teal} size={96} opacity={hubG2} />
          <Hub cx={CX} cy={CY} value="?" label="AGE 6 AND UP" sub="no official number" color={BUDGET_COLORS.pink} size={96} opacity={hubG3} />
        </g>
      </svg>

      {/* the sliver is 11 degrees wide — say out loud what has to fit in it */}
      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 60,
          top: 1240,
          textAlign: 'center',
          opacity: sliverOp,
          fontFamily: FONT_BODY,
          fontSize: 34,
          letterSpacing: 3,
          color: BUDGET_COLORS.dim,
          textTransform: 'uppercase',
        }}
      >
        eat · wash · homework · family
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// THE SHOT
// =============================================================================
export default function Short17Screen() {
  return (
    <AbsoluteFill style={{ background: '#0f1216' }}>
      <ShortsBackdrop />

      {/* HOOK — frame 0 is the END of the reveal, already composed (short-10's rewind trick). */}
      <Sequence from={0} durationInFrames={HOOK_OUT}>
        <Canvas from={0} />
        <BigTitle
          warm
          y={116}
          size={86}
          lines={[{ text: 'HOW MUCH SCREEN' }, { text: 'TIME IS OK?', color: ACCENT }]}
          subtitle="the honest answer is a subtraction"
        />
      </Sequence>

      {/* SETUP — the day is wiped, and the published guidance is drawn on the same ring. */}
      <Sequence from={HOOK_OUT} durationInFrames={SETUP_OUT - HOOK_OUT}>
        <Canvas from={HOOK_OUT} />
        <Kicker text="WHAT THE GUIDELINES SAY" at={G1 - HOOK_OUT} />
      </Sequence>

      {/* QUIZ */}
      <Sequence from={SETUP_OUT} durationInFrames={QUIZ_OUT - SETUP_OUT}>
        <Canvas from={SETUP_OUT} />
        <PauseCard
          subtitle="how many hours are actually free?"
          durSec={(QUIZ_OUT - SETUP_OUT) / 30}
          y={1240}
          accent={ACCENT}
        />
      </Sequence>

      {/* REVEAL — the subtraction, one arc per spoken number. */}
      <Sequence from={QUIZ_OUT} durationInFrames={REVEAL_OUT - QUIZ_OUT}>
        <Canvas from={QUIZ_OUT} />
        <Kicker text="ONE TEN YEAR OLD'S DAY" at={12} />
      </Sequence>

      {/* TWIST — the measured average, laid over the remainder it has to fit inside. */}
      <Sequence from={REVEAL_OUT} durationInFrames={TWIST_OUT - REVEAL_OUT}>
        <Canvas from={REVEAL_OUT} />
        <Kicker text="WHAT ACTUALLY HAPPENS" at={GLOW_A - REVEAL_OUT} color={BUDGET_COLORS.pink} />
      </Sequence>

      {/* LOOP — the overlay clears, the wedge returns, the punch runs backwards onto frame 0. */}
      <Sequence from={TWIST_OUT} durationInFrames={END - TWIST_OUT}>
        <Canvas from={TWIST_OUT} />
        <LoopTitle from={TWIST_OUT} />
      </Sequence>

      {/* GLOBAL */}
      <Captions lines={VO} y={1400} accent={ACCENT} plate />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
