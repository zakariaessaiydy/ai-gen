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
  id: 'Short21School',
  durationInSeconds: 42.0,
  fps: 30,
  width: 1080,
  height: 1920,
};

const F = (s: number) => Math.round(s * 30);
const DUR = 42.0;
const END = F(DUR); // 1260

const PINK = AVOID_COLORS.rescue;
const TEAL = AVOID_COLORS.stay;

// The two numbers under the two replies. MEASURED off the sampled curves, once, here.
const MULT_RESCUE = fmtMultiple(multipleOf('rescue')); // ×2.0
const MULT_STAY = fmtMultiple(multipleOf('stay')); // ×0.5

// How far along a branch's own drawn extent the crest sits — the teal curve is drawn in two
// segments so the crest can land on the word "peaks" and the settle on "falls by itself".
const CREST_S = CREST_U / (1 - DOOR);

// =============================================================================
// CUES — global seconds from beats.json, converted ONCE, and every one of them RE-DERIVED from
// the measured word times rather than from the estimates. Every scene reads the GLOBAL frame
// (there is no <Sequence> around the canvas, precisely so that it does), which is what makes
// the loop structural: frame END-1 evaluates the same scalars as frame 0.
// =============================================================================
const TITLE_OA = 158; //  5.27  the title clears as the rewind starts ("worse." ends f166)
const TITLE_OB = 194;
const REW_A = 172; //  5.73  the rewind: ten curves erase, four mornings leave, row 0 grows
const REW_B = 252; //  8.40

const QUAL_A = 226; //  7.53  the qualifier lands on "one ordinary morning" (f216-252)
const QUAL_B = 250;
const QUAL_OA = 492; // 16.40  ...and stays up through the whole quiz
const QUAL_OB = 516;
const RISE_A = 252; //  8.40  the shared climb draws, arriving exactly on "door." (f303-315)
const RISE_B = 312; // 10.40
const DOORL_A = 256; //  8.53
const DOORL_B = 286;
const REPLY1_A = 348; // 11.60  the pink reply lands on "okay," (f351)
const REPLY1_B = 372;

const QUIZ_IN = 408; // 13.60
const QUIZ_OUT = 492; // 16.40

const CLIFF_A = 498; // 16.60  the drop, under "vanishes." (f504-525)
const CLIFF_B = 534;
const RLF_A = 534; // 17.80  the relief, measured
const RLF_B = 558;
const RLF_OA = 624;
const RLF_OB = 648;
const ARR_A = 562; // 18.73  the reward arrow draws under "a reward for escaping" (f568-608)
const ARR_B = 604;
const ARR_OA = 624;
const ARR_OB = 652;

const GEO_A = 636; // 21.20  "So tomorrow starts higher" — the hero plot shrinks into row 0
const GEO_B = 684;
const WEEK1_A = 692; // 23.07  "Do it all week" — mornings 2-5 arrive, each peak taller
const WEEK1_STEP = 8;
const MULT1_A = 720; // 24.00  ...and the multiple lands on "doubles." (f718-734)
const MULT1_B = 744;

const TEAL_CARD_A = 760; // 25.33  the other reply appears just before "Stay," (f768)
const TEAL_CARD_B = 784;
const STAY_S1_A = 772; // 25.73  door -> crest, landing on "peaks," (f804-820)
const STAY_S1_B = 812;
const STAY_S2_A = 812; // 27.07  crest -> settled, under "then falls by itself" (f825-862)
const STAY_S2_B = 866;
const WEEK2_A = 858; // 28.60  mornings 2-5 arrive teal, in the hole before line 7 (f895)
const WEEK2_STEP = 8;
const MULT2_A = 906; // 30.20  under "the morning that teaches" (f903-931)
const MULT2_B = 930;

const GAP_A = 930; // 31.00  the brace between the two Fridays, on "teaches something."
const GAP_B = 960;
const GAP_OA = 986;
const GAP_OB = 1010;

const FALSE_A = 986; // 32.87  "So do not promise" (f987-1008)
const FALSE_B = 1014;
const STRIKE_A = 1016; // 33.87  the strike draws under "nothing bad will happen" (f1013-1043)
const STRIKE_B = 1046;
const TIE_A = 1030;
const TIE_B = 1056;
const FALSE_OA = 1062;
const FALSE_OB = 1090;

const LIT_A = 1094; // 36.47  the teal card lights while he says its first half (f1099-1130)
const LIT_B = 1120;
const LIT_OA = 1130;
const LIT_OB = 1152;
const HALF2_A = 1136; // 37.87  the second half fills in on "and" (f1137) and completes on
const HALF2_B = 1188; //        "handle it." (f1173-1187) — the sentence needs both
const TITLE_IA = 1176; // 39.20
const TITLE_IB = 1240;

const W1 = (i: number) => WEEK1_A + (i - 1) * WEEK1_STEP;
const W2 = (i: number) => WEEK2_A + (i - 1) * WEEK2_STEP;

// =============================================================================
// THE CANVAS — one week, on global time.
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

  // ---- morning 1: one climb, two answers ------------------------------------
  const rise0 = Math.max(1 - rewR, EASE_OUT(prog(f, RISE_A, RISE_B)));
  const resc0 = Math.max(1 - rewB, EASE_OUT(prog(f, CLIFF_A, CLIFF_B)));
  const stayDraw =
    f < STAY_S2_A
      ? CREST_S * EASE_OUT(prog(f, STAY_S1_A, STAY_S1_B))
      : mix(CREST_S, 1, EASE_OUT(prog(f, STAY_S2_A, STAY_S2_B)));
  const stay0 = Math.max(1 - rewB, stayDraw);

  // ---- mornings 2-5 ---------------------------------------------------------
  const rowOn = (i: number) => Math.max(1 - rewRow, prog(f, W1(i) - 6, W1(i) + 8));
  const rescN = (i: number) => Math.max(1 - rewB, EASE_OUT(prog(f, W1(i), W1(i) + 20)));
  const stayN = (i: number) => Math.max(1 - rewB, EASE_OUT(prog(f, W2(i), W2(i) + 22)));

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
        />
        <MorningAxis g={g} row={0} o={hero} />

        {/* MORNING 1 — the only row with a shared climb, because it is the only row where the
            two answers have the same peak. The fork is one point in time, and this is it. */}
        <MorningRow i={0} g={g} shared rise={rise0} rescue={resc0} stay={stay0} />

        {/* MORNINGS 2-5 — the map, run forward. Nothing here is choreographed: each peak is
            peakAt(i, branch), so the pink stack grows and the teal stack shrinks because the
            two lines of arithmetic in lib/avoid.tsx say they do. */}
        {[1, 2, 3, 4].map((i) => (
          <MorningRow key={i} i={i} g={g} o={rowOn(i)} rescue={rescN(i)} stay={stayN(i)} />
        ))}

        <ReliefMeasure g={g} row={0} o={relief * hero} />
        <RewardArrow g={g} row={0} draw={arrowDraw} o={arrowO * hero} />
        <FridayGap g={g} o={gap * spread} />
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
      <BigTitle warm y={150} size={76} lines={[{ text: 'TWO ANSWERS.' }, { text: 'ONE MAKES IT WORSE.', color: PINK }]} />
    </div>
  );
};

// =============================================================================
// THE SHOT
// =============================================================================
export default function Short21School() {
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
        <ModelTag />

        <ReplyCard
          x={76}
          y={1072}
          w={396}
          color={PINK}
          head="you say"
          line1="&ldquo;okay, stay home&rdquo;"
          line2={' '}
          value={MULT_RESCUE}
          valueO={mult1}
          o={pinkCard}
        />
        <ReplyCard
          x={488}
          y={1072}
          w={516}
          color={TEAL}
          head="you say"
          line1="&ldquo;i know it feels scary&hellip;"
          line2="&hellip;and i know you can handle it&rdquo;"
          line2o={half2}
          value={MULT_STAY}
          valueO={mult2}
          lit={lit}
          o={tealCard}
        />

        <SourceLine />
        <Qualifier o={qual} />
        <FalseComfort
          y={660}
          strike={EASE_OUT(prog(f, STRIKE_A, STRIKE_B))}
          tie={prog(f, TIE_A, TIE_B)}
          o={falseO}
        />
      </AbsoluteFill>

      <Kicker text="ONE MORNING" at={258} until={400} />
      <Kicker text="THE RELIEF IS THE REWARD" at={500} until={630} color={PINK} />
      <Kicker text="FIVE MORNINGS OF IT" at={640} until={752} color={PINK} />
      <Kicker text="THE SAME FEAR, NOT ESCAPED" at={766} until={922} color={TEAL} />
      <Kicker text="ONE OF THEM TEACHES" at={932} until={1000} color={AVOID_COLORS.warn} />
      <Kicker text="SAY BOTH HALVES" at={1098} until={1174} color={TEAL} />

      {/* QUIZ — the curve is frozen exactly at the door with nothing drawn past it, so the
          question has something to point at and the answer is not already on screen. */}
      <Sequence from={QUIZ_IN} durationInFrames={QUIZ_OUT - QUIZ_IN}>
        <PauseCard
          title="PAUSE"
          subtitle="the fear drops to zero. what did that teach?"
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
