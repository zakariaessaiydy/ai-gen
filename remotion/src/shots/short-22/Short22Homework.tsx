import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import {
  ASKED,
  Chip,
  ConfBars,
  Cross,
  CROSS_HOURS,
  EASE_INOUT,
  EASE_OUT,
  EndLabel,
  Gap,
  Geom,
  LossBars,
  Panel,
  Playhead,
  PointLabel,
  RECALL_COLORS,
  RecallDefs,
  SHOWN,
  Source,
  Track,
  mix,
  uAt,
  CROSS_DAY,
} from '../../lib/recall';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short22Homework',
  durationInSeconds: 43.0,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = RECALL_COLORS.accent;
const F = (s: number) => Math.round(s * 30);
const DUR = 43.0;
const END = F(DUR); // 1290

// The panel. x is log time (tonight -> test day), y is how much is left.
const G: Geom = { x: 140, w: 740, y: 620, h: 560, rMin: 0.3, rMax: 0.92 };

// The band the title vacates: everything that is neither the chart nor the title lives here,
// one thing at a time.
const BAND_Y = 404;

// =============================================================================
// CUES — global seconds from beats.json, converted ONCE. Every element below reads the GLOBAL
// frame (the canvas is mounted outside any <Sequence> precisely so that it does), which is
// what makes the loop structural: frame END-1 and frame 0 evaluate the same sweep.
// =============================================================================
const TITLE_OA = 114; //  3.80  the hook line has landed; the title clears and the band opens
const TITLE_OB = 138; //  4.60
const TITLE_IA = 1230; // 41.00  ...and comes back for the wrap, with the frame to itself
const TITLE_IB = 1272; // 42.40

const REW_A = 130; //  4.33  the rewind, on "There are two ways" (f132)
const REW_B = 178; //  5.93  ...and done as "You" lands (f180)

const WAYS_A = 178; //  5.93  "You say it, or they do"
const WAYS_B = 212;
const WAYS_OA = 520; // 17.33  the two ways stay up until the sweep is under way
const WAYS_OB = 552;

const NOW_A = 263; //  8.77  on "Being shown wins tonight" (f261), so both numbers are already
const NOW_B = 299; //        up when he names them: "Eighty-three" is f326
const NOW_OA = 476; // 15.87  the -12 bracket clears BEFORE the crossing rings: both label
const NOW_OB = 500; //        in the same corner, and the crossing is the one that matters now
const VALS_OA = 506; // 16.87  ...but 83/71 hold on until the lines start moving over them
const VALS_OB = 536;

const QUIZ_IN = 406; // 13.53  the card; the line runs f412-464, leaving 1.2s of real silence
const QUIZ_OUT = 500; // 16.67

const PLAY1_A = 507; // 16.90  time runs, under "By tomorrow lunchtime, the lead is gone"
const PLAY1_B = 545; // 18.17
const PLAY1_U = 0.31;
const CROSS_A = 538; // 17.93  the solved crossing rings itself ON "gone." (f551)
const CROSS_B = 558;

const PLAY2_A = 588; // 19.60  and on to test day, under "And a week later..."
const PLAY2_B = 624; // 20.80
const ENDL_A = 616; // 20.53  ...so 40% is on screen as he says "forty percent" (f622/f631)
const ENDL_B = 644;
const GAP7_A = 650; // 21.67  and the gap reopens on "Against sixty-one" (f653)
const GAP7_B = 682;

const LOSS_A = 704; // 23.47  the same two curves, re-read as loss, over lines 6 and 7
const LOSS_B = 740;
const LOSS_SA = 716; // 23.87  the bars fill from "Four readings" (f716)
const LOSS_SB = 800;
const LOSS_OA = 948; // 31.60
const LOSS_OB = 984;

const GLOWS_A = 710; // 23.67  "Four readings. It kept less than half."
const GLOWS_B = 734;
const GLOWS_OA = 800;
const GLOWS_OB = 824;
const GLOWA_A = 841; // 28.03  "Three recalls, no answers. It kept eighty-six."
const GLOWA_B = 865;
const GLOWA_OA = 950;
const GLOWA_OB = 974;

const CONF_A = 986; // 32.87  the twist, in the same band, just before "And the ones..." (f1001)
const CONF_B = 1022;
const CONF_SA = 1001;
const CONF_SB = 1075;
const CONF_OA = 1088; // 36.27
const CONF_OB = 1124;

const SAY_A = 1140; // 38.00  what to say instead — up before "Ask" (f1195), gone before the title
const SAY_B = 1176;
const SAY_OA = 1218; // 40.60
const SAY_OB = 1246;

/**
 * The frame-0 rule, as a function. Anything that belongs to the OPENING FRAME is on at f=0,
 * clears while the argument is being built, and returns for the wrap — so frame END-1 is
 * frame 0 by construction rather than by eye.
 */
const warm = (f: number, outA: number, outB: number, inA: number, inB: number) =>
  f < inA ? 1 - prog(f, outA, outB) : prog(f, inA, inB);

/** ...and its opposite: anything that belongs only to the middle. */
const only = (f: number, inA: number, inB: number, outA: number, outB: number) =>
  prog(f, inA, inB) * (1 - prog(f, outA, outB));

// =============================================================================
// THE CANVAS — the panel, and the ONE scalar that is the whole video.
//
// `u` is the sweep: 0 = five minutes after the homework, 1 = the test a week later. Both fits
// are drawn out to it, the playhead sits on it, and the gap, the crossing and the end numbers
// are all read back off the same two functions. Nothing here is keyframed twice.
// =============================================================================
const Canvas: React.FC = () => {
  const f = useCurrentFrame();

  // ---- the scalar ------------------------------------------------------------
  const u =
    f < REW_A
      ? 1
      : f < REW_B
        ? mix(1, 0, EASE_INOUT(prog(f, REW_A, REW_B)))
        : f < PLAY1_A
          ? 0
          : f < PLAY1_B
            ? mix(0, PLAY1_U, EASE_INOUT(prog(f, PLAY1_A, PLAY1_B)))
            : f < PLAY2_A
              ? PLAY1_U
              : mix(PLAY1_U, 1, EASE_INOUT(prog(f, PLAY2_A, PLAY2_B)));

  // ---- what is lit -----------------------------------------------------------
  const crossO = warm(f, TITLE_OA, TITLE_OA + 30, CROSS_A, CROSS_B);
  const gap7 = warm(f, TITLE_OA, TITLE_OA + 30, GAP7_A, GAP7_B);
  const ends = warm(f, TITLE_OA, TITLE_OA + 30, ENDL_A, ENDL_B);

  const ways = only(f, WAYS_A, WAYS_B, WAYS_OA, WAYS_OB);
  const now = only(f, NOW_A, NOW_B, NOW_OA, NOW_OB);
  const vals = only(f, NOW_A, NOW_B, VALS_OA, VALS_OB);
  const loss = only(f, LOSS_A, LOSS_B, LOSS_OA, LOSS_OB);
  const conf = only(f, CONF_A, CONF_B, CONF_OA, CONF_OB);
  const say = only(f, SAY_A, SAY_B, SAY_OA, SAY_OB);

  const glowS = only(f, GLOWS_A, GLOWS_B, GLOWS_OA, GLOWS_OB);
  const glowA = only(f, GLOWA_A, GLOWA_B, GLOWA_OA, GLOWA_OB);

  // The crossing cannot be marked before the sweep has reached it — the marker is pinned to a
  // solved day, so this is the one place the two have to agree.
  const reached = u >= uAt(CROSS_DAY) - 0.001 ? 1 : 0;

  const cam = 1 + 0.05 * (1 - EASE_OUT(prog(f, 0, 120)) + EASE_INOUT(prog(f, TITLE_IA, END - 1)));

  return (
    <AbsoluteFill style={{ transform: `scale(${cam})` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <RecallDefs />
        <Panel g={G} />

        <Track c={SHOWN} g={G} u={u} glow={glowS} />
        <Track c={ASKED} g={G} u={u} glow={glowA} />
        <Playhead g={G} u={u} />

        {/* TONIGHT — being shown really is ahead, and that is the trap, not the error. The two
            numbers the narration says out loud are read straight off the fits at t=0. */}
        <PointLabel c={SHOWN} g={G} t={0} opacity={vals} />
        <PointLabel c={ASKED} g={G} t={0} opacity={vals} />
        <Gap g={G} t={0} opacity={now} side="right" caption="POINTS AHEAD" dx={214} />

        {/* THE CROSSING — solved from the four anchors, and labelled as the fit it is. */}
        <Cross g={G} opacity={crossO * reached} />

        {/* TEST DAY — measured between the two lines exactly as drawn. */}
        <Gap g={G} t={7} opacity={gap7} side="left" caption="POINTS" />
        <EndLabel c={ASKED} g={G} lx={846} opacity={ends} />
        <EndLabel c={SHOWN} g={G} lx={700} opacity={ends} />

        <Source x={540} y={1288} opacity={0.9} />

        {/* THE BAND — one thing at a time, in the room the title leaves behind. */}
        <Chip
          x={140}
          y={BAND_Y - 12}
          w={358}
          lines={['YOU SAY IT', SHOWN.sub]}
          color={SHOWN.color}
          opacity={ways}
        />
        <Chip
          x={522}
          y={BAND_Y - 12}
          w={358}
          lines={['THEY SAY IT', ASKED.sub]}
          color={ASKED.color}
          opacity={ways}
        />

        <LossBars x={318} y={BAND_Y} w={392} opacity={loss} show={prog(f, LOSS_SA, LOSS_SB)} />
        <ConfBars x={318} y={BAND_Y} w={392} opacity={conf} show={prog(f, CONF_SA, CONF_SB)} />

        <Chip
          x={140}
          y={BAND_Y - 18}
          w={740}
          lines={['WHAT TO SAY INSTEAD', 'Show me how you would start.', 'Now say it back without looking.']}
          color={ASKED.color}
          opacity={say}
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
  const o = warm(f, TITLE_OA, TITLE_OB, TITLE_IA, TITLE_IB);
  if (o <= 0.01) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o }}>
      <BigTitle
        warm
        y={164}
        size={68}
        lines={[{ text: 'TELL THEM THE ANSWER' }, { text: `IT WORKS FOR ${Math.round(CROSS_HOURS)} HOURS`, color: ACCENT }]}
        subtitle="two ways to help, measured"
      />
    </div>
  );
};

// =============================================================================
// THE SHOT
// =============================================================================
export default function Short22Homework() {
  return (
    <AbsoluteFill style={{ background: RECALL_COLORS.stage }}>
      <ShortsBackdrop base={RECALL_COLORS.stage} glow="#16202b" />

      {/* ONE canvas, on GLOBAL time, for the whole video. */}
      <Canvas />
      <Title />

      <Kicker text="TWO WAYS TO HELP" y={212} at={186} until={400} />
      <Kicker text="THE LEAD EXPIRES" y={212} at={528} until={660} color={ACCENT} />
      <Kicker text="AND THEY WERE SURE" y={212} at={996} until={1120} color={RECALL_COLORS.shown} />

      {/* QUIZ — both dots are stacked on the TONIGHT rule with the empty week beside them. */}
      <Sequence from={QUIZ_IN} durationInFrames={QUIZ_OUT - QUIZ_IN}>
        <PauseCard
          title="PAUSE"
          subtitle="who is ahead in a week?"
          durSec={(QUIZ_OUT - QUIZ_IN) / 30}
          y={1000}
          accent={ACCENT}
        />
      </Sequence>

      {/* GLOBAL */}
      <Captions lines={VO} y={1400} accent={ACCENT} plate />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
