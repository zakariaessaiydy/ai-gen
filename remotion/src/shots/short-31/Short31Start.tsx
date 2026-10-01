import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import {
  AVOID_COLORS,
  AvoidDefs,
  BIG,
  CREST_U,
  DOOR,
  DoorLine,
  EASE_INOUT,
  EASE_OUT,
  FalseComfort,
  FridayGap,
  MORNINGS,
  ModelTag,
  MorningAxis,
  MorningRow,
  Qualifier,
  ReliefMeasure,
  ReplyCard,
  RewardArrow,
  STACK,
  SourceLine,
  baseY,
  fmtMultiple,
  mix,
  mixGeom,
  multipleOf,
} from '../../lib/avoid';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short31Start',
  durationInSeconds: 42.0,
  fps: 30,
  width: 1080,
  height: 1920,
};

const F = (s: number) => Math.round(s * 30);
const DUR = 42.0;
const END = F(DUR); // 1260

const PINK = AVOID_COLORS.rescue; // avoid — put it off
const TEAL = AVOID_COLORS.stay; // start — just ten seconds

// Row labels — five attempts at the same task, not a literal week.
const ROW_LABELS = ['TRY 1', 'TRY 2', 'TRY 3', 'TRY 4', 'TRY 5'];

// The two numbers under the two replies. MEASURED off the sampled curves, once, here.
const MULT_AVOID = fmtMultiple(multipleOf('rescue')); // ×2.0
const MULT_START = fmtMultiple(multipleOf('stay')); // ×0.5

// How far along a branch's own drawn extent the crest sits.
const CREST_S = CREST_U / (1 - DOOR);

// =============================================================================
// CUES — global seconds from beats.json, converted ONCE, and every one of them re-derived from
// the measured word times after the voice stage (see build notes). Every scene reads the GLOBAL
// frame (there is no <Sequence> around the canvas, precisely so that it does), which is what
// makes the loop structural: frame END-1 evaluates the same scalars as frame 0.
// =============================================================================
// Retimed against the REAL ElevenLabs word times (gen_voice's second pass) — every number below
// lands on a specific word, not an estimate. See shorts/short-31-start/beats.json.vo for the
// source timestamps.
const TITLE_OA = 158; //  5.27  the title clears as the rewind starts
const TITLE_OB = 194;
const REW_A = 168; //  5.60  the rewind: ten curves erase, four tries leave, row 0 grows
const REW_B = 245; //  8.17  ...finishing right as "avoiding." ends (8.102)

const QUAL_A = 246; //  8.20  the qualifier lands right after the rewind
const QUAL_B = 276;
const QUAL_OA = 489; // 16.30  ...and stays up through the whole quiz
const QUAL_OB = 504;
const RISE_A = 261; //  8.71  the shared climb draws under "Resistance climbs as you sit"
const RISE_B = 326; // 10.87  ...arriving exactly on "down." (10.865)
const DOORL_A = 300; // 10.00
const DOORL_B = 330;
const REPLY1_A = 364; // 12.13  the pink reply lands as "phone" lands
const REPLY1_B = 396; // 13.20  ("instead." ends 13.165)

const QUIZ_IN = 408; // 13.60
const QUIZ_OUT = 492; // 16.40

const CLIFF_A = 498; // 16.60  the drop, under "vanishes."
const CLIFF_B = 522; // 17.40  ("vanishes." ends 17.405)
const RLF_A = 524; // 17.47  the relief, measured, landing on "relief"
const RLF_B = 550;
const RLF_OA = 580;
const RLF_OB = 600;
const ARR_A = 558; // 18.60  the reward arrow draws under "rewards avoiding it."
const ARR_B = 605; // 20.17  ("it." ends 20.15)
const ARR_OA = 612;
const ARR_OB = 636;

const GEO_A = 606; // 20.20  "So next time starts worse" — the hero plot shrinks into row 0
const GEO_B = 650; // 21.65  ("worse." ends 21.651)
const WEEK1_A = 668; // 22.26  "Avoid it all week" — tries 2-5 arrive, each peak taller
const WEEK1_STEP = 14;
const MULT1_A = 712; // 23.73  ...and the multiple lands on "doubles."
const MULT1_B = 734; // 24.45

const TEAL_CARD_A = 735; // 24.50  the other reply appears right on "Start,"
const TEAL_CARD_B = 759;
const STAY_S1_A = 749; // 24.97  door -> crest, landing on "peaks," (25.875-26.287)
const STAY_S1_B = 789;
const STAY_S2_A = 789; // 26.30  crest -> settled, under "then falls by itself" (ends 28.35)
const STAY_S2_B = 851;
const WEEK2_A = 855; // 28.50  tries 2-5 arrive teal, in the hole before line 8
const WEEK2_STEP = 14;
const MULT2_A = 903; // 30.10  under "teaches something." (30.118-31.419)
const MULT2_B = 943;

const GAP_A = 920; // 30.67  the brace between the two attempt-5 curves
const GAP_B = 950;
const GAP_OA = 972;
const GAP_OB = 990;

const FALSE_A = 975; // 32.50  "I'll start when I feel motivated" rises
const FALSE_B = 1005;
const STRIKE_A = 1006; // 33.53  the strike draws under "feel motivated." (33.742-35.054)
const STRIKE_B = 1052;
const TIE_A = 1030;
const TIE_B = 1052;
const FALSE_OA = 1060;
const FALSE_OB = 1074;

const LIT_A = 1077; // 35.90  the teal card lights while he says "I don't need motivation."
const LIT_B = 1111; // (37.038-37.711)
const LIT_OA = 1131;
const LIT_OB = 1150;
const HALF2_A = 1137; // 37.90  the second half fills in on the second "I" (37.885)
const HALF2_B = 1180; //        and completes on "seconds." (39.337) — the sentence needs both
const TITLE_IA = 1190; // 39.67
const TITLE_IB = 1248;

const W1 = (i: number) => WEEK1_A + (i - 1) * WEEK1_STEP;
const W2 = (i: number) => WEEK2_A + (i - 1) * WEEK2_STEP;

// =============================================================================
// THE CANVAS — five tries at the same task, on global time.
//
// `spread` is the whole layout: 1 = the five-row stack, 0 = row 0 grown into a hero plot. The
// hook opens at 1 (it is the END of the video), the rewind takes it to 0, and the reveal puts
// it back. Everything else is a draw extent in a branch's own u, so a curve ARRIVES by being
// drawn rather than by fading in — and erases the same way.
// =============================================================================
const Canvas: React.FC = () => {
  const f = useCurrentFrame();

  // ---- the layout scalar ----------------------------------------------------
  const spread = Math.max(1 - EASE_INOUT(prog(f, REW_A + 24, REW_B)), EASE_INOUT(prog(f, GEO_A, GEO_B)));
  const g = mixGeom(BIG, STACK, spread);

  // ---- the rewind: branches erase first, then the climb underneath them ------
  const rewB = prog(f, REW_A, REW_A + 38);
  const rewR = prog(f, REW_A + 26, REW_B);
  const rewRow = prog(f, REW_A, REW_A + 22);

  // ---- try 1: one climb, two answers ----------------------------------------
  const rise0 = Math.max(1 - rewR, EASE_OUT(prog(f, RISE_A, RISE_B)));
  const avoid0 = Math.max(1 - rewB, EASE_OUT(prog(f, CLIFF_A, CLIFF_B)));
  const startDraw =
    f < STAY_S2_A
      ? CREST_S * EASE_OUT(prog(f, STAY_S1_A, STAY_S1_B))
      : mix(CREST_S, 1, EASE_OUT(prog(f, STAY_S2_A, STAY_S2_B)));
  const start0 = Math.max(1 - rewB, startDraw);

  // ---- tries 2-5 --------------------------------------------------------------
  const rowOn = (i: number) => Math.max(1 - rewRow, prog(f, W1(i) - 6, W1(i) + 8));
  const avoidN = (i: number) => Math.max(1 - rewB, EASE_OUT(prog(f, W1(i), W1(i) + 20)));
  const startN = (i: number) => Math.max(1 - rewB, EASE_OUT(prog(f, W2(i), W2(i) + 22)));

  const hero = 1 - spread; // the furniture that only exists at hero scale
  const relief = prog(f, RLF_A, RLF_B) * (1 - prog(f, RLF_OA, RLF_OB));
  const arrowDraw = EASE_OUT(prog(f, ARR_A, ARR_B));
  const arrowO = prog(f, ARR_A, ARR_A + 8) * (1 - prog(f, ARR_OA, ARR_OB));
  const gap = prog(f, GAP_A, GAP_B) * (1 - prog(f, GAP_OA, GAP_OB));

  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <AvoidDefs />

        <DoorLine
          g={g}
          top={g.y}
          bottom={mix(baseY(0, g), baseY(MORNINGS - 1, g), spread)}
          label={hero * prog(f, DOORL_A, DOORL_B)}
          text="START"
        />
        <MorningAxis g={g} row={0} o={hero} label="SEE IT" />

        {/* TRY 1 — the only row with a shared climb, because it is the only row where the two
            answers have the same peak. The fork is one point in time, and this is it. */}
        <MorningRow i={0} g={g} shared rise={rise0} rescue={avoid0} stay={start0} label={ROW_LABELS[0]} />

        {/* TRIES 2-5 — the map, run forward. Nothing here is choreographed: each peak is
            peakAt(i, branch), so the pink stack grows and the teal stack shrinks because the
            two lines of arithmetic in lib/avoid.tsx say they do. */}
        {[1, 2, 3, 4].map((i) => (
          <MorningRow key={i} i={i} g={g} o={rowOn(i)} rescue={avoidN(i)} stay={startN(i)} label={ROW_LABELS[i]} />
        ))}

        <ReliefMeasure g={g} row={0} o={relief * hero} />
        <RewardArrow g={g} row={0} draw={arrowDraw} o={arrowO * hero} />
        <FridayGap g={g} o={gap * spread} label="SAME TASK" />
      </svg>
    </AbsoluteFill>
  );
};

// =============================================================================
// THE TITLE — one instance at the root, so frame 0 and frame END-1 cannot differ.
// =============================================================================
const Title: React.FC = () => {
  const f = useCurrentFrame();
  const o = f < TITLE_IA ? 1 - prog(f, TITLE_OA, TITLE_OB) : prog(f, TITLE_IA, TITLE_IB);
  if (o <= 0.01) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o }}>
      <BigTitle warm y={150} size={76} lines={[{ text: 'STOP PROCRASTINATING.' }, { text: 'IN TEN SECONDS.', color: TEAL }]} />
    </div>
  );
};

// =============================================================================
// THE SHOT
// =============================================================================
export default function Short31Start() {
  const f = useCurrentFrame();

  // Everything that is on screen at frame 0 leaves during the rewind and comes back on its own
  // cue — one expression, so the two ends of the video cannot drift apart.
  const back = 1 - prog(f, TITLE_OA, TITLE_OA + 38);
  const pinkCard = Math.max(back, prog(f, REPLY1_A, REPLY1_B));
  const tealCard = Math.max(back, prog(f, TEAL_CARD_A, TEAL_CARD_B));
  const mult1 = Math.max(back, prog(f, MULT1_A, MULT1_B));
  const mult2 = Math.max(back, prog(f, MULT2_A, MULT2_B));
  const half2 = Math.max(back, prog(f, HALF2_A, HALF2_B));
  const lit = prog(f, LIT_A, LIT_B) * (1 - prog(f, LIT_OA, LIT_OB));

  const qual = prog(f, QUAL_A, QUAL_B) * (1 - prog(f, QUAL_OA, QUAL_OB));
  const falseO = prog(f, FALSE_A, FALSE_B) * (1 - prog(f, FALSE_OA, FALSE_OB));

  // The punch, run forwards at the top and backwards at the tail so the wrap is a no-op.
  const cam = 1 + 0.05 * (1 - EASE_OUT(prog(f, 0, 110)) + EASE_INOUT(prog(f, TITLE_IA, END - 1)));

  return (
    <AbsoluteFill style={{ background: AVOID_COLORS.stage }}>
      <ShortsBackdrop base={AVOID_COLORS.stage} glow="#161c28" />

      <AbsoluteFill style={{ transform: `scale(${cam})` }}>
        <Canvas />
        <Title />
        <ModelTag text="MODEL · RESISTANCE, RELATIVE" />

        <ReplyCard
          x={76}
          y={1072}
          w={396}
          color={PINK}
          head="you think"
          line1="&ldquo;just one more scroll&rdquo;"
          line2={' '}
          value={MULT_AVOID}
          valueO={mult1}
          o={pinkCard}
          byLabel="BY TRY 5"
        />
        <ReplyCard
          x={488}
          y={1072}
          w={516}
          color={TEAL}
          head="you say"
          line1="&ldquo;i don&rsquo;t need motivation&hellip;"
          line2="&hellip;i just need ten seconds&rdquo;"
          line2o={half2}
          value={MULT_START}
          valueO={mult2}
          lit={lit}
          o={tealCard}
          byLabel="BY TRY 5"
        />

        <SourceLine text="the &lsquo;act before you feel it&rsquo; idea is behavioral activation · Jacobson et al., JCCP 1996" />
        <Qualifier
          o={qual}
          title="THE ORDINARY DREADED TASK"
          subtitle="not a phobia · not clinical avoidance · just a task you keep putting off"
        />
        <FalseComfort
          y={660}
          strike={EASE_OUT(prog(f, STRIKE_A, STRIKE_B))}
          tie={prog(f, TIE_A, TIE_B)}
          o={falseO}
          quote={<>&ldquo;i&rsquo;ll start when i feel motivated&rdquo;</>}
          tieText="motivation follows action — same avoidance, softer voice"
        />
      </AbsoluteFill>

      <Kicker text="ONE TASK" at={261} until={400} />
      <Kicker text="THE RELIEF IS THE REWARD" at={498} until={636} color={PINK} />
      <Kicker text="FIVE TRIES IN A ROW" at={606} until={759} color={PINK} />
      <Kicker text="THE SAME RESISTANCE, NOT AVOIDED" at={735} until={943} color={TEAL} />
      <Kicker text="ONE OF THEM TEACHES" at={920} until={990} color={AVOID_COLORS.warn} />
      <Kicker text="SAY BOTH HALVES" at={1077} until={1180} color={TEAL} />

      {/* QUIZ — the curve is frozen exactly at the start line with nothing drawn past it, so
          the question has something to point at and the answer is not already on screen. */}
      <Sequence from={QUIZ_IN} durationInFrames={QUIZ_OUT - QUIZ_IN}>
        <PauseCard
          title="PAUSE"
          subtitle="the resistance drops to zero. what did that just teach you?"
          durSec={(QUIZ_OUT - QUIZ_IN) / 30}
          y={620}
          accent={AVOID_COLORS.warn}
        />
      </Sequence>

      {/* GLOBAL */}
      <Captions lines={VO} y={1400} accent={AVOID_COLORS.warn} plate />
      <ProgressBar color={AVOID_COLORS.warn} />
    </AbsoluteFill>
  );
}
