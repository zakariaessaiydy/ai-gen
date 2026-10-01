import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import {
  ADULTS,
  AxisTitle,
  Bar,
  CHILDREN,
  CHILD_OVER_ADULT,
  EASE_INOUT,
  EASE_OUT,
  EFFECT_COLORS,
  FEW,
  Geom,
  MANY,
  ONCE,
  Panel,
  REWARD,
  Source,
  Tag,
  ZeroLine,
} from '../../lib/effect';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short24Reading',
  durationInSeconds: 43.0,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = EFFECT_COLORS.accent;
const END = 1290; // 43.0s @ 30

// ONE axis for the whole video. Every bar in every beat is drawn against this same d scale and
// this same zero line, which is what lets the viewer compare a bar in the setup against a bar
// in the twist without re-calibrating.
const G: Geom = { x: 150, w: 830, y: 470, h: 560, dMin: -0.18, dMax: 0.82 };

// =============================================================================
// CUES — derived from the MEASURED word frames in beats.json.vo, not from guesses. Every bar
// grows on the word that names it. Everything reads the GLOBAL frame (nothing that matters is
// inside a <Sequence>), which is what makes the loop structural: frame 1289 evaluates the same
// bars, at the same heights, as frame 0.
// =============================================================================
const TITLE_OA = 128; //  4.27  L0 has landed ("...then you reward them.", f100-121)
const TITLE_OB = 154;
const TITLE_IA = 1166; // 38.87  ...and comes back over the last line, for the wrap
const TITLE_IB = 1212;

// THE FRAME-0 SET leaves, so the argument can be built from nothing.
const C_OA = 118; //  3.93
const C_OB = 142;

// PHASE A — a child against an adult, on the same axis. L1 f146-214.
const A_IA = 146; //  4.87  "It works twice as well on them as on you."
const A_IB = 172;
const A_GA = 150; //        both bars rise together; "twice" lands at f159
const A_GB = 200;
const TAG_A = 162; //  5.40  MORE THAN DOUBLE, on the word
const TAG_B = 186;
const A_OA = 222; //  7.40  (L1 ends f214)
const A_OB = 246;

// PHASE B — the three frequency bars mount as EMPTY SLOTS under "But more choice is not
// better." (L2, f241-307), so the inverted U is a question before it is an answer.
const B_IA = 250; //  8.33
const B_IB = 274;
const ONCE_GA = 340; // 11.33  L3 "Offered once, it barely moves." ("once," f345)
const ONCE_GB = 392;
const FEW_GA = 438; // 14.60  L4 "...it nearly triples."          ("triples." f472)
const FEW_GB = 490;
const MANY_GA = 534; // 17.80 L5 "...it falls back."              ("back." f579)
const MANY_GB = 592;

const QUIZ_IN = 694; // 23.13  the card; L6 ends f694, L7 starts f772 -> 2.60s of real silence
const QUIZ_OUT = 772; // 25.73

// PHASE C — the fourth bar arrives in the slot that has been empty since f250.
const R_IA = 686; // 22.87  the slot is LABELLED before the card arrives, so the question the
const R_IB = 712; //        card asks has something on screen to point at. It is still empty:
//                          at grow = 0 a Bar draws its axis labels and nothing else.
const R_GA = 778;
const R_GB = 822;
const ZERO_A = 780; // 26.00  ...and the zero line lights, because that is where it landed
const ZERO_B = 826;

// THE TWIST — only the peak and the null are lit. L10 f1011-1131.
const DIM_A = 1014; // 33.80
const DIM_B = 1044;
const DIM_OA = 1120;
const DIM_OB = 1150;

/** short-22's helper: on at frame 0, gone while the argument is built, back for the wrap. */
const warm = (f: number, outA: number, outB: number, inA: number, inB: number) =>
  f < inA ? 1 - prog(f, outA, outB) : prog(f, inA, inB);

/** ...and its opposite: anything that belongs only to the middle. */
const only = (f: number, inA: number, inB: number, outA: number, outB: number) =>
  prog(f, inA, inB) * (1 - prog(f, outA, outB));

/**
 * A bar's height. It is 1 at frame 0 — the opening frame shows the finished argument — and only
 * becomes a ramp once the frame-0 set has faded out, so bars fade away at FULL height rather
 * than shrinking back into the axis on their way off.
 */
const growOf = (f: number, a: number, b: number) => (f < 160 ? 1 : EASE_OUT(prog(f, a, b)));

// =============================================================================
// THE CANVAS — one panel, one zero line, bars entering and leaving on it.
// =============================================================================
const Canvas: React.FC = () => {
  const f = useCurrentFrame();

  // ---- what is on the axis ---------------------------------------------------
  const phaseA = only(f, A_IA, A_IB, A_OA, A_OB);
  const bars = warm(f, C_OA, C_OB, B_IA, B_IB); // the three frequency bars
  const rewardO = warm(f, C_OA, C_OB, R_IA, R_IB);
  const zeroLit = warm(f, C_OA, C_OB, ZERO_A, ZERO_B);

  // the twist dims everything that is not the peak or the null
  const dim = only(f, DIM_A, DIM_B, DIM_OA, DIM_OB);

  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <Panel g={G} />

        {/* PHASE A — the reason this video is about children and not about people. */}
        <Bar est={ADULTS} g={G} i={0} n={2} grow={growOf(f, A_GA, A_GB)} opacity={phaseA} />
        <Bar est={CHILDREN} g={G} i={1} n={2} grow={growOf(f, A_GA, A_GB)} opacity={phaseA} focus={1} />
        <Tag
          g={G}
          i={1}
          n={2}
          text={`${CHILD_OVER_ADULT.toFixed(1)}× — MORE THAN DOUBLE`}
          color={EFFECT_COLORS.strong}
          opacity={only(f, TAG_A, TAG_B, A_OA, A_OB)}
        />

        {/* PHASE B/C — four slots from the moment the second one appears, so the empty fourth
            IS the question the pause card asks, and nothing slides when it is finally filled. */}
        <Bar est={ONCE} g={G} i={0} n={4} grow={growOf(f, ONCE_GA, ONCE_GB)} opacity={bars * (1 - 0.72 * dim)} />
        <Bar est={FEW} g={G} i={1} n={4} grow={growOf(f, FEW_GA, FEW_GB)} opacity={bars} focus={dim} />
        <Bar est={MANY} g={G} i={2} n={4} grow={growOf(f, MANY_GA, MANY_GB)} opacity={bars * (1 - 0.72 * dim)} />
        <Bar est={REWARD} g={G} i={3} n={4} grow={growOf(f, R_GA, R_GB)} opacity={rewardO} />

        {/* drawn last so a bar can never paint over the line it is measured from */}
        <ZeroLine g={G} lit={zeroLit} />

        <AxisTitle
          y={396}
          text="EFFECT OF LETTING THEM CHOOSE"
          sub="on wanting to do it again"
        />
        <Source y={1215} />
      </svg>
    </AbsoluteFill>
  );
};

// =============================================================================
// THE TITLE — one instance at the root, so frame 0 and frame 1289 cannot differ.
// =============================================================================
const Title: React.FC = () => {
  const f = useCurrentFrame();
  const o = warm(f, TITLE_OA, TITLE_OB, TITLE_IA, TITLE_IB);
  if (o <= 0.01) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o }}>
      <BigTitle
        warm
        y={150}
        size={62}
        lines={[{ text: 'LET THEM PICK' }, { text: 'SKIP THE CHART', color: ACCENT }]}
        subtitle="the reward does not add to the choice"
      />
    </div>
  );
};

// =============================================================================
// THE SHOT
// =============================================================================
export default function Short24Reading() {
  const f = useCurrentFrame();
  // The hook's punch-in, reversed at the wrap: 1.05 at frame 0 AND at frame 1289.
  const punch = 1 + 0.05 * (1 - EASE_OUT(prog(f, 0, 120)) + EASE_INOUT(prog(f, TITLE_IA, END - 1)));

  return (
    <AbsoluteFill style={{ background: EFFECT_COLORS.stage }}>
      <ShortsBackdrop base={EFFECT_COLORS.stage} glow="#16202b" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <Canvas />
        <Title />

        <Kicker text="A CHILD, NOT AN ADULT" y={214} at={168} until={240} color={EFFECT_COLORS.strong} />
        <Kicker text="HOW OFTEN YOU OFFER IT" y={214} at={262} until={640} />
        <Kicker text="IT REPLACES IT" y={214} at={1068} until={1150} color={EFFECT_COLORS.null} />
      </AbsoluteFill>

      {/* QUIZ — the three bars are up and the fourth slot is empty. That IS the question. */}
      <Sequence from={QUIZ_IN} durationInFrames={QUIZ_OUT - QUIZ_IN}>
        <PauseCard
          title="PAUSE"
          subtitle="what does a reward add?"
          durSec={(QUIZ_OUT - QUIZ_IN) / 30}
          // ...in the band the title vacated, NOT over the chart: the card asks what a reward
          // adds, and the thing it is asking about is the empty labelled fourth slot below it.
          y={255}
          accent={ACCENT}
        />
      </Sequence>

      {/* GLOBAL */}
      <Captions lines={VO} y={1400} accent={ACCENT} plate />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
