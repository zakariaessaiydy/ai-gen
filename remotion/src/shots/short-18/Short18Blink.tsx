import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import {
  EASE_INOUT,
  EASE_OUT,
  Gap,
  Leaders,
  Loupe,
  TAPE_COLORS,
  TAU,
  Tape,
  TapeLabel,
  TapeNote,
  countBefore,
  gapSchedule,
  mix,
  occlusionAt,
  totalLost,
} from '../../lib/tape';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short18Blink',
  durationInSeconds: 43.0,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = TAPE_COLORS.accent;
const F = (s: number) => Math.round(s * 30);
const END = F(43.0); // 1290

// =============================================================================
// THE MODEL — two constants, and every number on screen falls out of them.
//
// Both are the FLOOR of their published range, so every claim this video makes is a lower
// bound: spontaneous blinking runs 15-20/min in adults, and the blackout a blink produces is
// 100-150 ms. We take 15 and 0.100 and say "about". Nothing below is a number chosen because it
// sounded good, and nothing on screen is typed twice: the marks are `SCHED.length`, the block
// widths are `totalLost() x cut`, the counters read those widths back.
// =============================================================================
const RATE = 15; // blinks per minute — floor of the documented 15-20
const BLACKOUT = 0.1; // seconds of lost vision per blink — floor of the documented 100-150 ms
const WAKING = 16; // hours awake in a day

const MINUTE = 60;
const SCHED: Gap[] = gapSchedule(20260902, MINUTE, RATE, BLACKOUT); // 15 real events
const N_MIN = SCHED.length; // 15
const LOST_MIN = totalLost(SCHED); // 1.5 s
const KEPT_MIN = MINUTE - LOST_MIN; // 58.5 s — the twist's whole argument

const DAY_SPAN = WAKING * 3600; // 57,600 s of waking
const N_DAY = N_MIN * 60 * WAKING; // 14,400 blinks
const LOST_DAY = N_DAY * BLACKOUT; // 1,440 s = 24 min
const YEAR_DAYS = Math.floor((LOST_DAY * 365) / 86400); // 6 whole days a year

// The eye is not the tape: it blinks in REAL time, on its own schedule at the same rate, so an
// eye watched for 43 seconds does 11 blinks and the arithmetic on screen is the arithmetic on
// the face. Its span is the composition, so `occlusionAt` returns 0 at both ends and the lid
// cannot be caught half-shut at the wrap.
const VIDEO_SEC = 43.0;
const EYE_SCHED: Gap[] = gapSchedule(90210, VIDEO_SEC, RATE, BLACKOUT); // 11 events

// =============================================================================
// GEOMETRY — one column, three instruments: the eye, the minute, the day.
// =============================================================================
const TX = 80;
const TW = 840; // 80..920 — clear of the right-hand rail (160px)
const TH = 88;
const SRC_SCALE = TW / MINUTE; // 14 px per tape-second — what makes a blink 1.4px wide

const D_LABEL_Y = 800;
const D_TAPE_Y = 824;
const D_NOTE_Y = 956;
const Y_LABEL_Y = 1058;
const Y_TAPE_Y = 1082;
const Y_NOTE_Y = 1276;

const EYE = { cx: 540, cy: 568, hw: 302, hh: 172 };

// the gap the loupe goes after, and the window it reads it in
const LOUPE_G = SCHED[7];
const LOUPE_WIN = 1.2;

// =============================================================================
// CUES — global frames. Inside a <Sequence> the frame is LOCAL, so every scene is handed its
// `from` and adds it back before comparing against anything here.
// =============================================================================
const HOOK_OUT = F(4.4); // 132
const SETUP_OUT = F(17.4); // 522
const QUIZ_OUT = F(20.0); // 600
const REVEAL_OUT = F(31.8); // 954
const TWIST_OUT = F(40.6); // 1218

const UNPACK_A = 138; //  4.60s — the collected block scatters back into 15 marks
const UNPACK_B = 162; //  5.40s
const WIPE_A = 168; //  5.60s — and the minute rewinds to an empty rail
const WIPE_B = 198; //  6.60s
const REC_A = 204; //  6.80s — recorded again, live, one mark per blink
const REC_B = 324; // 10.80s — lands the count on "...times a minute" (11.55)
const LOUPE_A = 372; // 12.40s — the loupe opens on "Each" (12.30)
const LOUPE_B = 402; // 13.40s — and is fully there before the number it exists to show
const LOUPE_V = 417; // 13.90s — 0.1 s lands on "tenth" (13.89) and is up through "a second"
const LOUPE_OUT_A = 576; // 19.20s
const LOUPE_OUT_B = 600; // 20.00s
const DAY_IN_A = 612; // 20.40s — a deliberate 12-frame gap after the loupe: two instruments
const DAY_IN_B = 642; // 21.40s   sharing one band must not cross-fade into each other
const DAY_N = 651; // 21.70s — 14,400 lands under "thousand four hundred" (21.85-22.50)
const CUT_A = 747; // 24.90s — the minute collects, starting on "Stack" (24.85) ...
const CUT_B = 801; // 26.70s   ... and landing on "together" (26.48)
const DCUT_A = 861; // 28.70s — the day block eats leftward from "Twenty" (28.70) ...
const DCUT_B = 891; // 29.70s   ... to 24 MIN on the end of "minutes." (29.65)
const YEAR_A = 897; // 29.90s — up through "days a year" (30.06-30.39)
const UNPACK2_A = 990; // 33.00s — THE SPLICE, part one: the block is taken away, on "never seen"
const UNPACK2_B = 1020; // 34.00s
const STRETCH_A = 1026; // 34.20s — part two: the minute closes up and refills its own width, on "them."
const STRETCH_B = 1086; // 36.20s   landing BEFORE the voice explains it (36.95) — picture first
const SEAM_AT = 1092; // 36.40s — and says what it now is, under "Your visual cortex" (36.95)
const DIM_A = 1026; // 34.20s — the day dims while the splice happens; the loss does not leave
const DIM_B = 1062; // 35.40s
const SEAM_OUT = 1230; // 41.00s — the last caption cleared at 1224; the loop takes the frame back
const UNSTRETCH_A = 1236; // 41.20s
const UNSTRETCH_B = 1272; // 42.40s
const REPACK_A = 1254; // 41.80s
const REPACK_B = 1286; // 42.87s

// =============================================================================
// THE CHOREOGRAPHY — four scalars drive the whole video, and each returns to its frame-0 value
// by the last frame. Read them as one column: what the minute is doing, and what the day is.
// =============================================================================

/** How much of every gap has been removed from the minute. */
const cutDAt = (f: number) => {
  if (f <= UNPACK_A) return 1;
  if (f < UNPACK_B) return 1 - EASE_INOUT(prog(f, UNPACK_A, UNPACK_B));
  if (f <= CUT_A) return 0;
  if (f < CUT_B) return EASE_INOUT(prog(f, CUT_A, CUT_B));
  return 1;
};

/** Whether the removed time is shown as a block. COLLECT sets it; the SPLICE takes it away. */
const packDAt = (f: number) => {
  if (f <= UNPACK_A) return 1;
  if (f < UNPACK_B) return 1 - EASE_INOUT(prog(f, UNPACK_A, UNPACK_B));
  if (f <= CUT_A) return 0;
  if (f < UNPACK2_A) return EASE_OUT(prog(f, CUT_A + 18, CUT_B));
  if (f < REPACK_A) return 1 - EASE_INOUT(prog(f, UNPACK2_A, UNPACK2_B));
  return EASE_OUT(prog(f, REPACK_A, REPACK_B));
};

/** The refill — the one move that makes 58.5 seconds look like 60. */
const stretchDAt = (f: number) => {
  if (f <= STRETCH_A) return 0;
  if (f < STRETCH_B) return EASE_INOUT(prog(f, STRETCH_A, STRETCH_B));
  if (f <= UNSTRETCH_A) return 1;
  return 1 - EASE_INOUT(prog(f, UNSTRETCH_A, UNSTRETCH_B));
};

/** The recording playhead, in tape-seconds. */
const uptoAt = (f: number) => {
  if (f <= WIPE_A) return MINUTE;
  if (f < WIPE_B) return mix(MINUTE, 0, EASE_INOUT(prog(f, WIPE_A, WIPE_B)));
  if (f <= REC_A) return 0;
  if (f < REC_B) return mix(0, MINUTE, EASE_INOUT(prog(f, REC_A, REC_B)));
  return MINUTE;
};

/**
 * The day's aggregate, 0..1. 14,400 marks cannot be drawn, so the day tape carries the SUM
 * instead of the events — and it grows by lengthening the gap itself, which means the block's
 * width is still `totalLost x (w/span)` and its label is still that width read back in minutes.
 * A summary, drawn to scale, saying so.
 */
const dayGAt = (f: number) => {
  if (f <= UNPACK_B) return 1;
  if (f <= DCUT_A) return 0;
  if (f < DCUT_B) return EASE_INOUT(prog(f, DCUT_A, DCUT_B));
  return 1;
};

const dayOpAt = (f: number) => {
  if (f <= UNPACK_A) return 1;
  if (f < UNPACK_B) return 1 - EASE_INOUT(prog(f, UNPACK_A, UNPACK_B));
  if (f <= DAY_IN_A) return 0;
  return EASE_OUT(prog(f, DAY_IN_A, DAY_IN_B));
};

/** Focus, not a cut: the day recedes while the minute is spliced, and comes back for the loop. */
const dayDimAt = (f: number) => {
  if (f <= DIM_A) return 1;
  if (f < DIM_B) return mix(1, 0.34, EASE_INOUT(prog(f, DIM_A, DIM_B)));
  if (f <= UNSTRETCH_A) return 0.34;
  return mix(0.34, 1, EASE_INOUT(prog(f, UNSTRETCH_A, UNSTRETCH_B)));
};

// =============================================================================
// THE EYE — the only thing on screen that is not a chart, and the one doing the blinking.
//
// It is driven by EYE_SCHED through the same `occlusionAt` the tape's gaps use, so the lid is
// shut for exactly the 0.1 s the strip draws black. The ramps either side are the shutter
// MOVING (about 90 ms down, 170 ms up — closing is roughly twice as fast as opening), which is
// why a real blink reads as a third of a second while costing a tenth.
// =============================================================================
const almondPath = () => {
  const { cx, cy, hw, hh } = EYE;
  return `M ${cx - hw} ${cy} Q ${cx} ${cy - hh * 2.02} ${cx + hw} ${cy} Q ${cx} ${cy + hh * 1.58} ${cx - hw} ${cy} Z`;
};

const STRIAE = Array.from({ length: 46 }, (_, i) => {
  const a = (i / 46) * TAU;
  const len = 0.62 + 0.3 * ((i * 7) % 5) / 5;
  return { a, len };
});

const Eye: React.FC<{ occl: number; f: number; pulse: number; ring: number }> = ({ occl, f, pulse, ring }) => {
  const { cx, cy, hw, hh } = EYE;
  // gaze drift on integer cycles (loop-safe), plus Bell's phenomenon: the globe rolls UP behind
  // a closing lid, which is why a blink is not the same thing as a shutter.
  const gx = cx + 9 * Math.sin(TAU * (f / END));
  const gy = cy + 5 * Math.cos(TAU * 2 * (f / END)) - occl * 30;
  const pr = 48 + 3 * pulse;
  const lidY = mix(cy - hh - 8, cy + 8, occl);
  const lidSag = mix(8, 40, occl);
  const lowY = mix(cy + hh + 16, cy + 2, occl);
  const L = cx - hw - 40;
  const R = cx + hw + 40;

  return (
    <g>
      <defs>
        <clipPath id="eye-clip">
          <path d={almondPath()} />
        </clipPath>
        <radialGradient id="eye-sclera" cx="0.5" cy="0.42" r="0.72">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.62" stopColor="#eef1f8" />
          <stop offset="1" stopColor="#c3ccdf" />
        </radialGradient>
        <radialGradient id="eye-iris" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#3b3f8f" />
          <stop offset="0.42" stopColor="#6366F1" />
          <stop offset="0.86" stopColor="#9b7cc4" />
          <stop offset="1" stopColor="#4a4a86" />
        </radialGradient>
        <radialGradient id="eye-socket" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#6366F1" stopOpacity="0.30" />
          <stop offset="1" stopColor="#6366F1" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="eye-lid-up" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a5674" />
          <stop offset="1" stopColor="#2c3548" />
        </linearGradient>
        <linearGradient id="eye-lid-low" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b3448" />
          <stop offset="1" stopColor="#47536e" />
        </linearGradient>
      </defs>

      {/* socket glow */}
      <ellipse cx={cx} cy={cy} rx={hw * 1.85} ry={hh * 2.3} fill="url(#eye-socket)" />

      <g clipPath="url(#eye-clip)">
        <ellipse cx={cx} cy={cy} rx={hw * 0.99} ry={hh * 1.2} fill="url(#eye-sclera)" />

        <g transform={`translate(${gx} ${gy})`}>
          <circle r={118} fill="url(#eye-iris)" />
          <g opacity={0.22} stroke="#ffffff" strokeWidth={2} strokeLinecap="round">
            {STRIAE.map((s, i) => (
              <line
                key={i}
                x1={Math.cos(s.a) * 56}
                y1={Math.sin(s.a) * 56}
                x2={Math.cos(s.a) * 114 * s.len + Math.cos(s.a) * 56 * (1 - s.len)}
                y2={Math.sin(s.a) * 114 * s.len + Math.sin(s.a) * 56 * (1 - s.len)}
              />
            ))}
          </g>
          <circle r={118} fill="none" stroke="#141830" strokeWidth={8} opacity={0.85} />
          <circle r={pr} fill="#04060a" />
          <circle r={pr} fill="none" stroke="#000000" strokeWidth={4} opacity={0.5} />
          <circle cx={-41} cy={-43} r={27} fill="#ffffff" opacity={0.9} />
          <circle cx={31} cy={36} r={11} fill="#ffffff" opacity={0.4} />
        </g>

        {/* the lids. Clipped by the almond, so they never draw a corner that is not an eye. */}
        <path
          d={`M ${L} ${cy - hh - 160} L ${R} ${cy - hh - 160} L ${R} ${lidY} Q ${cx} ${lidY + lidSag} ${L} ${lidY} Z`}
          fill="url(#eye-lid-up)"
        />
        {/* the crease — it only exists once there is enough lid down to fold */}
        <path
          d={`M ${cx - hw * 0.78} ${lidY - 52} Q ${cx} ${lidY - 52 + lidSag * 1.5} ${cx + hw * 0.78} ${lidY - 52}`}
          fill="none"
          stroke="#4d5975"
          strokeWidth={3}
          opacity={occl * 0.8}
        />
        <path
          d={`M ${R} ${lidY} Q ${cx} ${lidY + lidSag} ${L} ${lidY}`}
          fill="none"
          stroke="#6b7b9c"
          strokeWidth={7}
          strokeLinecap="round"
        />
        <path
          d={`M ${L} ${cy + hh + 180} L ${R} ${cy + hh + 180} L ${R} ${lowY} Q ${cx} ${lowY - 14} ${L} ${lowY} Z`}
          fill="url(#eye-lid-low)"
        />
        <path
          d={`M ${R} ${lowY} Q ${cx} ${lowY - 14} ${L} ${lowY}`}
          fill="none"
          stroke="#6b7b9c"
          strokeWidth={6}
          strokeLinecap="round"
        />
      </g>

      {/* the lash line — the almond itself, drawn last so it reads as one shape */}
      <path d={almondPath()} fill="none" stroke="#4c5872" strokeWidth={7} strokeLinejoin="round" />

      {/* the twist's one annotation: the suppression is upstream of the lid */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={hw * 1.14 + 22 * ring}
        ry={hh * 1.34 + 22 * ring}
        fill="none"
        stroke={TAPE_COLORS.indigo}
        strokeWidth={3}
        strokeDasharray="10 14"
        opacity={ring * 0.38}
      />
    </g>
  );
};

// =============================================================================
// THE CANVAS — one column for the whole video. It is never cut to; it is rewound, re-recorded,
// magnified, collected and spliced. Frame 0 and frame END-1 evaluate to the same state.
// =============================================================================
const Canvas: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame() + from; // GLOBAL frame

  const cutD = cutDAt(f);
  const packD = packDAt(f);
  const stretchD = stretchDAt(f);
  const upto = uptoAt(f);
  const dayG = dayGAt(f);
  const dayOp = dayOpAt(f);
  const dayDim = dayDimAt(f);

  // the eye, in real seconds, on its own real-time schedule
  const occl = occlusionAt(EYE_SCHED, f / 30);
  const pulse = 0.5 + 0.5 * Math.sin(TAU * 2 * (f / END)); // integer cycles — the wrap is a frame step
  const ring = EASE_OUT(prog(f, STRETCH_A, STRETCH_A + 30)) * (1 - prog(f, SEAM_OUT, SEAM_OUT + 24));

  // Punch: settles out of the hook and runs backwards into the wrap, so the last frame lands on
  // frame 0's scale exactly.
  const punch = f < 200 ? mix(1.05, 1.0, EASE_OUT(prog(f, 0, 90))) : mix(1.0, 1.05, EASE_INOUT(prog(f, 1206, END - 1)));

  // the day's aggregate gap: a summary event whose LENGTH is the day's lost time
  const dayGaps: Gap[] = [{ at: DAY_SPAN - LOST_DAY * dayG, dur: LOST_DAY * dayG }];

  // every printed number below is a width this frame just drew, read back
  const liveCount = countBefore(SCHED, upto);
  const liveLost = LOST_MIN * cutD;
  const dayLostMin = Math.round((LOST_DAY * dayG) / 60);

  const loupeOp = EASE_OUT(prog(f, LOUPE_A, LOUPE_B)) * (1 - EASE_INOUT(prog(f, LOUPE_OUT_A, LOUPE_OUT_B)));
  const seamOp = EASE_OUT(prog(f, SEAM_AT, SEAM_AT + 24)) * (1 - EASE_INOUT(prog(f, SEAM_OUT, SEAM_OUT + 22)));
  const yearOp = EASE_OUT(prog(f, YEAR_A, YEAR_A + 22)) * (1 - EASE_INOUT(prog(f, SEAM_OUT - 24, SEAM_OUT)));
  const dayNOp = f <= UNPACK_B ? 1 : EASE_OUT(prog(f, DAY_N, DAY_N + 22));

  // where the magnified gap actually sits on the minute, so the leaders point at the truth
  const gx1 = TX + LOUPE_G.at * SRC_SCALE;
  const gx2 = TX + (LOUPE_G.at + LOUPE_G.dur) * SRC_SCALE;

  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <g transform={`translate(540 900) scale(${punch}) translate(-540 -900)`}>
          <Eye occl={occl} f={f} pulse={pulse} ring={ring} />

          {/* THE MINUTE — 15 real events, drawn at 14 px per second, so a blink is 1.4px. */}
          <TapeLabel x={TX} y={D_LABEL_Y} w={TW} left="a normal minute" right={`${liveCount} BLINKS`} />
          <Tape
            id="d"
            x={TX}
            y={D_TAPE_Y}
            w={TW}
            h={TH}
            span={MINUTE}
            gaps={SCHED}
            upto={upto}
            cut={cutD}
            pack={packD}
            stretch={stretchD}
            blockLabel={`${liveLost.toFixed(1)} s`}
            showHead={f > WIPE_A && f < REC_B + 8}
            glow={0.85 + 0.15 * pulse}
          />
          <TapeNote
            x={TX}
            y={D_NOTE_Y}
            w={TW}
            text={`${KEPT_MIN.toFixed(1)} s of picture. it felt like ${MINUTE}.`}
            opacity={seamOp}
          />

          {/* THE LOUPE — the mark is honestly 1.4px wide, so magnify it and print the power. */}
          <Leaders
            fromX1={gx1 - 4}
            fromX2={gx2 + 4}
            fromY={D_TAPE_Y + TH}
            toX1={TX}
            toX2={TX + TW}
            toY={Y_TAPE_Y}
            opacity={loupeOp}
          />
          <Loupe
            id="lp"
            x={TX}
            y={Y_TAPE_Y}
            w={TW}
            h={TH}
            gaps={SCHED}
            centerT={LOUPE_G.at + LOUPE_G.dur / 2}
            windowT={LOUPE_WIN}
            srcScale={SRC_SCALE}
            opacity={loupeOp}
            label="one blink, magnified"
            value={`${BLACKOUT.toFixed(1)} s OF NOTHING`}
            valueOpacity={EASE_OUT(prog(f, LOUPE_V, LOUPE_V + 20))}
          />

          {/* THE DAY — 14,400 marks cannot be drawn, so this strip carries their SUM, to scale. */}
          <g opacity={dayOp * dayDim}>
            <TapeLabel
              x={TX}
              y={Y_LABEL_Y}
              w={TW}
              left={`${WAKING} waking hours`}
              right={`${N_DAY.toLocaleString('en-US')} BLINKS`}
              rightOpacity={dayNOp}
            />
            <Tape
              id="y"
              x={TX}
              y={Y_TAPE_Y}
              w={TW}
              h={TH}
              span={DAY_SPAN}
              gaps={dayGaps}
              cut={1}
              pack={1}
              blockLabel={`${dayLostMin} MIN`}
              glow={0.85 + 0.15 * pulse}
            />
            <TapeNote x={TX} y={Y_NOTE_Y} w={TW} text={`= ${YEAR_DAYS} whole days a year`} opacity={yearOp} size={38} />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/**
 * The loop's title. It holds off until the twist's own labels have left — a title arriving over
 * the payoff would make the frame the whole video is for the busiest one in it.
 */
const LoopTitle: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame() + from;
  return (
    <AbsoluteFill style={{ opacity: EASE_OUT(prog(f, SEAM_OUT + 18, SEAM_OUT + 54)) }}>
      <BigTitle
        y={100}
        size={80}
        lines={[{ text: 'YOU WENT BLIND' }, { text: 'FOR 24 MINUTES', color: ACCENT }]}
        subtitle="today. you never saw one of them."
      />
    </AbsoluteFill>
  );
};

// =============================================================================
// THE SHOT
// =============================================================================
export default function Short18Blink() {
  return (
    <AbsoluteFill style={{ background: '#0f1216' }}>
      <ShortsBackdrop />

      {/* HOOK — frame 0 is the END of the reveal, already composed (short-10's rewind trick). */}
      <Sequence from={0} durationInFrames={HOOK_OUT}>
        <Canvas from={0} />
        <BigTitle
          warm
          y={100}
          size={80}
          lines={[{ text: 'YOU WENT BLIND' }, { text: 'FOR 24 MINUTES', color: ACCENT }]}
          subtitle="today. you never saw one of them."
        />
      </Sequence>

      {/* SETUP — the minute is rewound, re-recorded live, then one mark is magnified. */}
      <Sequence from={HOOK_OUT} durationInFrames={SETUP_OUT - HOOK_OUT}>
        <Canvas from={HOOK_OUT} />
        <Kicker text="WHAT ONE BLINK COSTS" at={REC_A - HOOK_OUT} />
      </Sequence>

      {/* QUIZ */}
      <Sequence from={SETUP_OUT} durationInFrames={QUIZ_OUT - SETUP_OUT}>
        <Canvas from={SETUP_OUT} />
        <PauseCard
          subtitle="how long is that over a whole day?"
          durSec={(QUIZ_OUT - SETUP_OUT) / 30}
          y={1330}
          accent={ACCENT}
        />
      </Sequence>

      {/* REVEAL — the day, then both strips collect their losses into a block. */}
      <Sequence from={QUIZ_OUT} durationInFrames={REVEAL_OUT - QUIZ_OUT}>
        <Canvas from={QUIZ_OUT} />
        <Kicker text="ONE WAKING DAY" at={DAY_IN_A - QUIZ_OUT} />
      </Sequence>

      {/* TWIST — the same cut, read the other way: the gaps are removed and nothing shows it. */}
      <Sequence from={REVEAL_OUT} durationInFrames={TWIST_OUT - REVEAL_OUT}>
        <Canvas from={REVEAL_OUT} />
        <Kicker text="WHY YOU NEVER SEE IT" at={UNPACK2_A - REVEAL_OUT} color={TAPE_COLORS.indigo} />
      </Sequence>

      {/* LOOP — the splice is undone, the block returns, the punch runs backwards onto frame 0. */}
      <Sequence from={TWIST_OUT} durationInFrames={END - TWIST_OUT}>
        <Canvas from={TWIST_OUT} />
        <LoopTitle from={TWIST_OUT} />
      </Sequence>

      {/* GLOBAL */}
      <Captions lines={VO} y={1420} accent={ACCENT} plate />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
