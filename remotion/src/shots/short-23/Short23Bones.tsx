import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import {
  ADULT_COUNT,
  AgeAxis,
  BIRTH_COUNT,
  BONE_COLORS,
  Callout,
  CountRow,
  EASE_INOUT,
  EASE_OUT,
  G,
  Note,
  PlateArrows,
  Skeleton,
  Source,
  ageOf,
  femurOf,
  figureAt,
  mix,
  pOf,
} from '../../lib/bone';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short23Bones',
  durationInSeconds: 43.5,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = BONE_COLORS.accent;
const END = 1305; // 43.5s @ 30

// The figure's box. Everything above it (title, count) and below it (rail, source, captions)
// is INSTRUMENTATION and never moves — only the figure is ever zoomed.
const FIG_TOP = 520;
const FIG_H = 630;
const VIEW_CY = FIG_TOP + FIG_H / 2; // 835

// =============================================================================
// CUES — global seconds from beats.json, converted ONCE. Every element reads the GLOBAL
// frame (nothing that matters is mounted inside a <Sequence>), which is what makes the loop
// structural: frame 1349 evaluates the same age, the same camera and the same count as
// frame 0, rather than being dissolved into looking like it.
// =============================================================================
const TITLE_OA = 100; //  3.33  L1 has landed; the title clears and the readout has the band
const TITLE_OB = 126;
const TITLE_IA = 1188; // 39.60  ...and comes back over the last line, for the wrap
const TITLE_IB = 1234;

// THE SWEEP. u is the rail: 0 = the day you were born, 1 = twenty-five.
const REW_A = 158; //  5.27  the rewind, under "none disappeared" (f162-216) — the finished
const REW_B = 216; //  7.20  skeleton comes apart backwards into the ~300 it arrived in
const U1 = pOf(1); // 0.136  one year
const U2 = 0.8; //     ~17.4 years
const SW1_A = 830; // 27.67  "Two of them fused before you could walk."  -> age 1
const SW1_B = 918;
const SW2_A = 936; // 31.20  "Five in your lower spine became one."      -> the teens
const SW2_B = 1024;
const SW3_A = 1055; // 35.17 "...and it closes around twenty-five."      -> 25, and 206
const SW3_B = 1158; //       lands exactly on the words (f1124-1160)

// THE SKULL BEATS, both at age 0 — a newborn skull is the subject, not a stage of the sweep.
const FOLD_A = 644; // 21.47  "...that had to fold to be born" (f664-704)
const FOLD_B = 674;
const FOLD_OA = 692;
const FOLD_OB = 724;
const BRAIN_A = 752; // 25.07 "Then your brain doubled in a year." (f734-800)
const BRAIN_B = 812;
const BRAIN_ON = 726;
const BRAIN_OFF_A = 850;
const BRAIN_OFF_B = 890;

// THE ANNOTATIONS
const PLATE_A = 284; //  9.47  the growth plate, while the camera is inside a femur
const PLATE_B = 314;
const PLATE_OA = 316; // ...and gone BEFORE the camera pulls back at f330, or it smears
const PLATE_OB = 336;
const FRO_A = 832; // 27.73
const FRO_B = 862;
const FRO_OA = 922;
const FRO_OB = 946;
const SAC_A = 940; // 31.33
const SAC_B = 970;
const SAC_OA = 1000;
const SAC_OB = 1018;
const CLA_A = 1070; // 35.67  after the camera has landed, on "collarbone," (f1065)
const CLA_B = 1098;
const CLA_OA = 1154;
const CLA_OB = 1176;

const QUIZ_IN = 533; // 17.77  the card; L4 runs f463-533, so the 2.60s under it is real
const QUIZ_OUT = 611; // 20.37

/**
 * The frame-0 rule, as a function (short-22's helper, unchanged). Anything that belongs to the
 * OPENING FRAME is on at f=0, clears while the argument is built, and returns for the wrap.
 */
const warm = (f: number, outA: number, outB: number, inA: number, inB: number) =>
  f < inA ? 1 - prog(f, outA, outB) : prog(f, inA, inB);

/** ...and its opposite: anything that belongs only to the middle. */
const only = (f: number, inA: number, inB: number, outA: number, outB: number) =>
  prog(f, inA, inB) * (1 - prog(f, outA, outB));

// =============================================================================
// THE CAMERA — one rig over one figure. There are no cuts in this video; the reveals are
// moves. A state is "put this point of the figure in the middle of the viewport at this
// scale", so the keyframes below are places, not transforms.
// =============================================================================
type Cam = { s: number; fx: number; fy: number };
const FULL: Cam = { s: 1, fx: 540, fy: VIEW_CY };

// The subjects, measured off the SAME proportion function the figure is drawn with, so a
// change to the model moves the camera with it instead of leaving it pointing at nothing.
const NB = figureAt(0, 540, FIG_TOP, FIG_H); // newborn
const AD = figureAt(25, 540, FIG_TOP, FIG_H); // finished
// The camera sits ON the newborn femur, close enough that the pelvis is only a lid at the top
// of the frame and the two growth plates are the subject. Both the framing and the arrows are
// read off femurOf(), so neither can point at somewhere the bone was not drawn.
const NB_FEMUR = femurOf(NB, 1);
const PLATE_PT = NB_FEMUR.seams[0]; // the proximal plate, at the hip end
const FEMUR: Cam = { s: 3.0, fx: 540, fy: (NB_FEMUR.y1 + NB_FEMUR.y2) / 2 + 25 };
const SKULL: Cam = { s: 2.1, fx: 540, fy: NB.headCy };
const PELVIS: Cam = { s: 2.6, fx: 540, fy: NB.pelvisTop + NB.pelvisH * 0.25 };
const CLAV: Cam = { s: 3.1, fx: 540, fy: AD.shoulderY + AD.torsoH * 0.055 };

const CAMS: { f: number; c: Cam }[] = [
  { f: 0, c: FULL },
  { f: 236, c: FULL },
  { f: 280, c: FEMUR }, // ...landing before "lengthen at a gap" (f275-290)
  { f: 330, c: FEMUR },
  { f: 372, c: FULL },
  { f: 595, c: FULL },
  { f: 640, c: SKULL },
  { f: 906, c: SKULL },
  { f: 950, c: PELVIS },
  { f: 1018, c: PELVIS },
  { f: 1066, c: CLAV },
  { f: 1176, c: CLAV },
  { f: 1240, c: FULL },
  { f: END, c: FULL },
];

const camAt = (f: number): Cam => {
  let i = 0;
  while (i < CAMS.length - 2 && f >= CAMS[i + 1].f) i += 1;
  const a = CAMS[i];
  const b = CAMS[i + 1];
  const t = EASE_INOUT(prog(f, a.f, b.f));
  return {
    s: mix(a.c.s, b.c.s, t),
    fx: mix(a.c.fx, b.c.fx, t),
    fy: mix(a.c.fy, b.c.fy, t),
  };
};

// =============================================================================
// THE CANVAS — one skeleton, one age, and the instruments that read it.
// =============================================================================
const Canvas: React.FC = () => {
  const f = useCurrentFrame();

  // ---- the scalar ------------------------------------------------------------
  const u =
    f < REW_A
      ? 1
      : f < REW_B
        ? mix(1, 0, EASE_INOUT(prog(f, REW_A, REW_B)))
        : f < SW1_A
          ? 0
          : f < SW1_B
            ? mix(0, U1, EASE_INOUT(prog(f, SW1_A, SW1_B)))
            : f < SW2_A
              ? U1
              : f < SW2_B
                ? mix(U1, U2, EASE_INOUT(prog(f, SW2_A, SW2_B)))
                : f < SW3_A
                  ? U2
                  : mix(U2, 1, EASE_INOUT(prog(f, SW3_A, SW3_B)));

  const age = ageOf(u);

  // ---- the two things that happen to a newborn skull, and then un-happen ------
  const fold = prog(f, FOLD_A, FOLD_B) * (1 - prog(f, FOLD_OA, FOLD_OB));
  const brainOn = prog(f, BRAIN_ON, BRAIN_ON + 30) * (1 - prog(f, BRAIN_OFF_A, BRAIN_OFF_B));
  const brain = prog(f, BRAIN_A, BRAIN_B) * (1 - prog(f, BRAIN_OFF_A, BRAIN_OFF_B));

  const cam = camAt(f);
  const lit =
    f >= FRO_A && f < FRO_OB ? 'frontal' : f >= SAC_A && f < SAC_OB ? 'sacrum' : f >= CLA_A && f < CLA_OB ? 'clavicle' : undefined;

  const plate = only(f, PLATE_A, PLATE_B, PLATE_OA, PLATE_OB);
  const fro = only(f, FRO_A, FRO_B, FRO_OA, FRO_OB);
  const sac = only(f, SAC_A, SAC_B, SAC_OA, SAC_OB);
  const cla = only(f, CLA_A, CLA_B, CLA_OA, CLA_OB);

  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <clipPath id="fig-view">
            <rect x={0} y={FIG_TOP - 8} width={1080} height={FIG_H + 16} />
          </clipPath>
        </defs>

        {/* THE FIGURE — the only thing the camera touches. */}
        <g clipPath="url(#fig-view)">
          <g transform={`translate(${540 - cam.fx * cam.s} ${VIEW_CY - cam.fy * cam.s}) scale(${cam.s})`}>
            <Skeleton
              age={age}
              id="sk"
              top={FIG_TOP}
              H={FIG_H}
              fold={fold}
              brain={brain}
              brainOn={brainOn}
              glow={plate}
            />

            {/* the growth plate, marked on the femur the camera is sitting inside */}
            {plate > 0.01 ? (
              <g opacity={plate}>
                <PlateArrows x={PLATE_PT.x + NB_FEMUR.w * 1.2} y={PLATE_PT.y} len={NB_FEMUR.L * 0.46} opacity={plate} />
              </g>
            ) : null}
          </g>
        </g>

        {/* THE INSTRUMENTS — outside the camera group, so they never move. */}
        <CountRow age={age} y={340} />
        <AgeAxis age={age} y={1219} lit={lit} />
        <Source y={1310} />

        {/* THE ANNOTATIONS — placed where the zoomed subject is not. */}
        <Note
          x={290}
          y={975}
          w={500}
          label="GROWTH PLATE"
          big="the gap IS the growth"
          sub="a bone lengthens here, or nowhere"
          opacity={plate}
        />
        <Callout x={290} y={958} w={500} group={G('frontal')} note="the metopic suture" opacity={fro} />
        <Callout x={290} y={975} w={500} group={G('sacrum')} note="five vertebrae, one bone" opacity={sac} />
        <Callout
          x={290}
          y={958}
          w={500}
          group={G('clavicle')}
          note="the last epiphysis in the body"
          opacity={cla}
          color={BONE_COLORS.fused}
        />
      </svg>
    </AbsoluteFill>
  );
};

// =============================================================================
// THE TITLE — one instance, at the root, so frame 0 and frame 1349 cannot differ. Both
// numbers in it are read off the model, not typed into the copy.
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
        size={58}
        lines={[{ text: `BORN IN ${BIRTH_COUNT} PIECES` }, { text: `FINISHED AT 25`, color: ACCENT }]}
        subtitle={`nothing went missing — you have ${ADULT_COUNT}`}
      />
    </div>
  );
};

// =============================================================================
// THE SHOT
// =============================================================================
export default function Short23Bones() {
  const f = useCurrentFrame();
  // The hook's punch-in, reversed at the wrap: 1.05 at frame 0 AND at frame 1349.
  const punch = 1 + 0.05 * (1 - EASE_OUT(prog(f, 0, 120)) + EASE_INOUT(prog(f, TITLE_IA, END - 1)));

  return (
    <AbsoluteFill style={{ background: BONE_COLORS.stage }}>
      <ShortsBackdrop base={BONE_COLORS.stage} glow="#182231" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <Canvas />
        <Title />

        <Kicker text="BORN IN PIECES" y={214} at={250} until={440} />
        <Kicker text="WHY IT IS OPEN" y={214} at={618} until={850} color={BONE_COLORS.brain} />
        <Kicker text="THE COUNT FALLS" y={214} at={930} until={1026} />
        <Kicker text="THE LAST ONE" y={214} at={1038} until={1174} color={BONE_COLORS.fused} />
      </AbsoluteFill>

      {/* QUIZ — the whole newborn skeleton is on screen with every seam open behind it. */}
      <Sequence from={QUIZ_IN} durationInFrames={QUIZ_OUT - QUIZ_IN}>
        <PauseCard
          title="PAUSE"
          subtitle="when does the last gap close?"
          durSec={(QUIZ_OUT - QUIZ_IN) / 30}
          y={1010}
          accent={ACCENT}
        />
      </Sequence>

      {/* GLOBAL */}
      <Captions lines={VO} y={1400} accent={ACCENT} plate />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
