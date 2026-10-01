import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, Stamp, prog } from '../../lib/shorts';
import {
  EASE_INOUT,
  EASE_OUT,
  Figure,
  GAITS,
  GaitName,
  KID_COLORS,
  Legend,
  PartLabel,
  Part,
  Rail,
  Readout,
  TalkBadge,
  TalkBand,
  WeekBars,
  Day,
  bandOf,
  clamp01,
  filledMinutes,
  intensity,
  mix,
  totalOf,
} from '../../lib/kid';
import { FONT_BODY } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short19Play',
  durationInSeconds: 44.5,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = KID_COLORS.accent;
const F = (s: number) => Math.round(s * 30);
const DUR = 44.5;
const END = F(DUR); // 1335

// =============================================================================
// THE MODEL — five games, and every number on screen is read back off them.
//
// 62 is never typed anywhere. TOTAL is the table added up; the readout is the RAIL'S DRAWN
// WIDTH converted back to minutes, so a mis-timed chip shows a wrong number instead of hiding
// behind a keyframed counter that happens to look right (short-10's lesson, budget.tsx's
// read-back hub applied to a bar). Change a game's length and the video re-argues itself: the
// chips resize, the counter lands somewhere else, the 60-crossing moves, and Friday moves with
// it, because Friday IS this day.
//
// The minute values are the lengths of the games as a parent would run them, not sourced data.
// The sourced claims are the 60 (WHO 2020), the deleted bout rule (PAG 2nd ed., 2018) and the
// talk test (CDC) — see beats.json.facts.
// =============================================================================
const TARGET = 60;
const SPAN = 70; // minutes the full rail width represents

const GAMES: Part[] = [
  { id: 'dance', label: 'FREEZE DANCE', short: 'DANCE', min: 9, color: KID_COLORS.violet, gait: 'dance' },
  { id: 'lava', label: 'FLOOR IS LAVA', short: 'LAVA', min: 12, color: KID_COLORS.pink, gait: 'leap' },
  { id: 'animal', label: 'ANIMAL WALKS', short: 'WALKS', min: 7, color: KID_COLORS.teal, gait: 'bear' },
  { id: 'balloon', label: 'BALLOON KEEP UP', short: 'BALLOON', min: 14, color: KID_COLORS.green, gait: 'reach' },
  { id: 'hunt', label: 'SCAVENGER SPRINT', short: 'SPRINT', min: 20, color: KID_COLORS.indigo, gait: 'run' },
];
const TOTAL = totalOf(GAMES); // 62 — derived, never written down

// The week the twist opens onto. FRIDAY IS THIS VIDEO'S DAY — it carries TOTAL, so the day we
// just built is on the chart by construction and moves if the games do. WeekBars derives and
// prints the mean (61) off this table, so the "it is an average" claim is also read back.
const DAYS: Day[] = [
  { label: 'MON', min: 45 },
  { label: 'TUE', min: 25 },
  { label: 'WED', min: 15 },
  { label: 'THU', min: 60 },
  { label: 'FRI', min: TOTAL },
  { label: 'SAT', min: 150 },
  { label: 'SUN', min: 105 },
];

// =============================================================================
// GAIT SPEEDS — an INTEGER number of cycles over the whole composition, every one of them.
//
// This is short-13/14/15's loop rule applied at construction rather than debugged in later: a
// gait whose phase is LAPS * (f / END) returns to its own first pose exactly at the wrap, so
// the join is a plain frame step no matter which gait happens to be on screen there.
// =============================================================================
const LAPS: Record<GaitName, number> = {
  stand: 13, //  0.30 Hz — breathing
  slump: 13, //  0.30 Hz
  bear: 26, //  0.60 Hz — the hook's crawl, and the gait at frame 0
  dance: 20, //  0.46 Hz — 3 beats + a freeze per cycle => ~112 bpm while moving
  leap: 40, //  0.92 Hz — a hop every 1.09s
  reach: 48, //  1.10 Hz — a balloon tap every 0.91s
  run: 62, //  1.43 Hz — a stride every 0.70s
  crab: 30, //  0.69 Hz
};
const hz = (g: GaitName) => LAPS[g] / DUR;
const PHASE0: Partial<Record<GaitName, number>> = { bear: 0.3 };
const phaseOf = (g: GaitName, f: number) => LAPS[g] * (f / END) + (PHASE0[g] ?? 0);

// THE MEASUREMENT — the badge reads the animation, not a table of assumptions. `intensity`
// walks each gait around one full cycle through the same forward kinematics that draws it and
// sums how far the hands, feet and head actually travel, per second.
const INTENSITY: Record<GaitName, number> = {
  stand: intensity(GAITS.stand, hz('stand')),
  slump: intensity(GAITS.slump, hz('slump')),
  bear: intensity(GAITS.bear, hz('bear')),
  crab: intensity(GAITS.crab, hz('crab')),
  dance: intensity(GAITS.dance, hz('dance')),
  leap: intensity(GAITS.leap, hz('leap')),
  reach: intensity(GAITS.reach, hz('reach')),
  run: intensity(GAITS.run, hz('run')),
};
const REF = INTENSITY.run;
const bandFor = (g: GaitName): TalkBand => bandOf(INTENSITY[g], REF);

// =============================================================================
// LAYOUT — one column, and nothing critical below y1420 or right of x920.
// =============================================================================
const CX = 540;
const GROUND = 985;
const FIG_S = 2.05;
// the readout sits beside the rail rather than above it, so the whole y400-y985 band belongs
// to the figure — the figure IS the content of this video, not an illustration next to it
const RAIL = { x: 340, y: 1136, w: 650, h: 56 };
const px = (m: number) => (m / SPAN) * RAIL.w;

// =============================================================================
// CUES — global frames. Every chip lands on the word that names its game.
// Inside a <Sequence> the frame is LOCAL, so the Canvas is handed its `from` and adds it back;
// everything below is compared against a GLOBAL frame.
// =============================================================================
const HOOK_OUT = F(5.6); // 168
const SETUP_OUT = F(14.8); // 444
const QUIZ_OUT = F(17.8); // 534
const REVEAL_OUT = F(35.2); // 1056
const TWIST_OUT = F(39.1); // 1173

// EVERY cue below is a REAL word time out of beats.json, not an estimate. The comment on each
// line is the word it lands on.
const REWIND_A = 168; //  5.60  "Fewer" (5.45) — the rail starts un-building
const REWIND_B = 200; //  6.67  empty
const THIRDS_IN = 174; //  5.80  three kids, one of them lit
const THIRDS_OUT = 258; //  8.60  clears before "Everyone" (9.00)
const MONO_IN = 276; //  9.20  lands on "hour" (9.77) — the hour everybody pictures, as ONE block
const MONO_X = 386; // 12.87  struck out on "none" (12.92)
const MONO_OUT = 540; // 18.00  collapses on "In" (18.00)
const TEN_IN = 566; // 18.87  the ten-minute minimum draws in under "ten minute rule" (19.03-19.51)
const TEN_X = 596; // 19.87  struck through on "deleted" (19.89)
const TEN_OUT = 636; // 21.20  clears for "Any length counts" (21.40)

// One chip per spoken game name. The hunt chip is long on purpose: it carries the rail from 42
// to 62, so it CROSSES the 60 tick under "Sixty" (33.34) and finishes on "minutes." (33.93) —
// the crossing is not staged, it is where 18 of the chip's 20 minutes happen to land.
const CHIP: { a: number; b: number }[] = [
  { a: 792, b: 810 }, // 26.40  "Freeze" (26.40)
  { a: 816, b: 834 }, // 27.20  "floor"  (27.20)
  { a: 844, b: 862 }, // 28.13  "animal" (28.12)
  { a: 872, b: 898 }, // 29.07  "balloon" (29.07)
  { a: 962, b: 1020 }, // 32.07 "scavenger" (32.05)
];

const STAMP_IN = 1056; // 35.20  "None of it was exercise" (35.30)
const STAMP_OUT = 1098; // 36.60
const FIG_OUT_A = 1086; // 36.20  the figure steps aside for the week
const FIG_OUT_B = 1110; // 37.00
const WEEK_A = 1092; // 36.40  grows under "And it is an average" (36.86-37.46)
const WEEK_B = 1146; // 38.20
const WEEK_OUT_A = 1182; // 39.40  "The hour was never missing" (39.20)
const WEEK_OUT_B = 1218; // 40.60
const FIG_IN = 1206; // 40.20  the bear crawl returns
const TITLE_IN = 1236; // 41.20  in by "one piece" (41.59)
const PUNCH_A = 1260; // 42.00

// =============================================================================
// THE RAIL'S STATE — one function of the global frame, and everything reads off it.
// =============================================================================

/** Fill parts left-to-right until `keep` minutes are used up. Emptying is the same function. */
const fillTo = (keep: number): number[] => {
  let left = keep;
  return GAMES.map((g) => {
    const t = clamp01(left / g.min);
    left -= g.min * t;
    return t;
  });
};

const fracsAt = (f: number): number[] => {
  if (f < REWIND_A) return GAMES.map(() => 1); // frame 0 is the END of the reveal
  if (f < CHIP[0].a) return fillTo(TOTAL * (1 - EASE_INOUT(prog(f, REWIND_A, REWIND_B))));
  return GAMES.map((g, i) => EASE_OUT(prog(f, CHIP[i].a, CHIP[i].b)));
};

/** Which game the figure is playing. Hard cuts, never crossfades — a swap is a cut. */
const gaitAt = (f: number): GaitName => {
  if (f >= FIG_IN - 40) return 'bear'; // the loop restores frame 0's crawl
  if (f >= CHIP[4].a - 3) return 'run';
  if (f >= CHIP[3].a - 3) return 'reach';
  if (f >= CHIP[2].a - 3) return 'bear';
  if (f >= CHIP[1].a - 3) return 'leap';
  if (f >= CHIP[0].a - 3) return 'dance';
  if (f >= MONO_IN - 24) return 'slump'; // waiting for an hour that never arrives
  if (f >= REWIND_A) return 'stand';
  return 'bear';
};

/** The figure hands the stage to the three-kids row, then to the week bars, then takes it back. */
const quizDim = (f: number) =>
  1 - 0.7 * EASE_INOUT(prog(f, SETUP_OUT - 12, SETUP_OUT + 10)) * (1 - EASE_INOUT(prog(f, QUIZ_OUT - 16, QUIZ_OUT + 6)));

const figOpAt = (f: number): number => {
  if (f < 240) return 1 - EASE_INOUT(prog(f, THIRDS_IN - 18, THIRDS_IN - 2));
  if (f < 1050) return EASE_OUT(prog(f, THIRDS_OUT - 10, THIRDS_OUT + 14));
  if (f < 1160) return 1 - EASE_INOUT(prog(f, FIG_OUT_A, FIG_OUT_B));
  return EASE_OUT(prog(f, FIG_IN, FIG_IN + 30));
};

const activeChip = (f: number): number => {
  for (let i = CHIP.length - 1; i >= 0; i--) if (f >= CHIP[i].a - 3) return i;
  return -1;
};

// =============================================================================
// THE CANVAS — the whole video is this one persistent stage; the beats only change what is
// switched on. Mounted once per <Sequence> and handed that sequence's `from`.
// =============================================================================
const Canvas: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame() + from; // GLOBAL frame

  const fracs = fracsAt(f);
  const minutes = filledMinutes(GAMES, fracs); // the readout IS the drawn width
  const gait = gaitAt(f);
  const figOp = figOpAt(f) * quizDim(f);
  const chip = activeChip(f);

  // Punch: settles 1.06 -> 1.00 out of the hook and runs BACKWARDS into the wrap, so the last
  // frame lands on exactly frame 0's scale.
  const punch =
    f < 400
      ? mix(1.06, 1.0, EASE_OUT(prog(f, 0, 84)))
      : mix(1.0, 1.06, EASE_INOUT(prog(f, PUNCH_A, END - 1)));

  // the swap pop — a gait cut and its label land together
  const cutAt = chip >= 0 && f < REVEAL_OUT ? CHIP[chip].a - 3 : -999;
  const pop = 1 + 0.09 * (1 - EASE_OUT(prog(f, cutAt, cutAt + 12)));

  // three kids, one of whom gets the hour
  const thirdsOp =
    EASE_OUT(prog(f, THIRDS_IN, THIRDS_IN + 16)) * (1 - EASE_INOUT(prog(f, THIRDS_OUT - 16, THIRDS_OUT)));

  // the monolith: the hour everybody pictures, as ONE block
  const monoIn = EASE_OUT(prog(f, MONO_IN, MONO_IN + 20));
  const monoOut = 1 - EASE_INOUT(prog(f, MONO_OUT, MONO_OUT + 26));
  const monoOp = monoIn * monoOut;
  const monoStrike = EASE_OUT(prog(f, MONO_X, MONO_X + 14));
  const monoDead = EASE_OUT(prog(f, MONO_X, MONO_X + 20));

  // the ten-minute minimum, and its deletion
  const tenIn = EASE_OUT(prog(f, TEN_IN, TEN_IN + 18));
  const tenOut = 1 - EASE_INOUT(prog(f, TEN_OUT, TEN_OUT + 22));
  const tenOp = tenIn * tenOut;
  const tenStrike = EASE_OUT(prog(f, TEN_X, TEN_X + 12));

  const badgeOp =
    EASE_OUT(prog(f, CHIP[0].a - 2, CHIP[0].a + 14)) * (1 - EASE_INOUT(prog(f, REVEAL_OUT - 30, REVEAL_OUT)));
  const labelOp = badgeOp;

  // the week: the same minutes, seven times, with the guideline drawn where it belongs
  const weekOp = EASE_OUT(prog(f, WEEK_A, WEEK_A + 20)) * (1 - EASE_INOUT(prog(f, WEEK_OUT_A, WEEK_OUT_B)));
  const weekReveal = EASE_OUT(prog(f, WEEK_A, WEEK_B));

  // the target tick is hidden only while the monolith owns the rail's whole width
  const tickOp = 1 - 0.85 * monoOp;

  return (
    <svg
      width={1080}
      height={1920}
      viewBox="0 0 1080 1920"
      style={{ position: 'absolute', left: 0, top: 0 }}
    >
      <g transform={`translate(${CX} 900) scale(${punch}) translate(${-CX} -900)`}>
        {/* ---- THE STAGE ---------------------------------------------------- */}
        <line x1={90} y1={GROUND} x2={990} y2={GROUND} stroke="rgba(255,255,255,0.22)" strokeWidth={3} />
        <line x1={90} y1={GROUND} x2={990} y2={GROUND} stroke={ACCENT} strokeWidth={3} opacity={0.10} />

        {/* three kids: one of them gets the hour, two do not */}
        {thirdsOp > 0.01
          ? [0, 1, 2].map((i) => {
              const lit = i === 1;
              return (
                <Figure
                  key={i}
                  gait={lit ? 'run' : 'slump'}
                  phase={phaseOf(lit ? 'run' : 'slump', f) + i * 0.31}
                  x={320 + i * 220}
                  y={GROUND}
                  s={1.0}
                  color={lit ? ACCENT : 'rgba(139,147,167,0.75)'}
                  far={lit ? 'rgba(245,215,110,0.45)' : 'rgba(139,147,167,0.34)'}
                  opacity={thirdsOp}
                />
              );
            })
          : null}

        {/* the figure the whole video follows */}
        <g transform={`translate(${CX} ${GROUND}) scale(${pop}) translate(${-CX} ${-GROUND})`}>
          <Figure
            gait={gait}
            phase={phaseOf(gait, f)}
            x={CX}
            y={GROUND}
            s={FIG_S}
            color={KID_COLORS.text}
            opacity={figOp}
          />
        </g>

        {/* the week — the twist's stage */}
        {weekOp > 0.01 ? (
          <WeekBars
            days={DAYS}
            reveal={weekReveal}
            target={TARGET}
            x={140}
            y={GROUND}
            w={800}
            h={330}
            highlight="FRI"
            opacity={weekOp}
          />
        ) : null}

        {/* ---- THE READOUT — the rail's own width, in minutes ----------------- */}
        <Readout value={minutes} x={196} y={1176} size={118} color={ACCENT} note="MINUTES" />

        {/* ---- THE BADGE — measured off the gait on screen -------------------- */}
        <TalkBadge band={bandFor(gait)} x={238} y={330} scale={0.9} opacity={badgeOp} />

        {/* ---- THE ACTIVE GAME ----------------------------------------------- */}
        {chip >= 0 && labelOp > 0.01 ? (
          <PartLabel
            key={GAMES[chip].id}
            label={GAMES[chip].label}
            min={GAMES[chip].min}
            color={GAMES[chip].color}
            x={668}
            y={1058}
            opacity={labelOp}
          />
        ) : null}

        {/* ---- THE RAIL ------------------------------------------------------ */}
        <Rail
          parts={GAMES}
          fracs={fracs}
          span={SPAN}
          target={TARGET}
          targetOpacity={tickOp}
          x={RAIL.x}
          y={RAIL.y}
          w={RAIL.w}
          h={RAIL.h}
        />

        {/* the hour everybody pictures: ONE block, exactly 60 minutes wide */}
        {monoOp > 0.01 ? (
          <g opacity={monoOp}>
            <rect
              x={RAIL.x + 3}
              y={RAIL.y + 3}
              width={px(TARGET) - 6}
              height={RAIL.h - 6}
              rx={8}
              fill={monoDead > 0.5 ? KID_COLORS.pink : KID_COLORS.violet}
              opacity={mix(0.92, 0.86, monoDead)}
            />
            <text
              x={RAIL.x + px(TARGET) / 2}
              y={RAIL.y + RAIL.h / 2 + 11}
              fill="#0b0e14"
              fontFamily={FONT_BODY}
              fontSize={30}
              fontWeight={700}
              letterSpacing={5}
              textAnchor="middle"
            >
              A CLASS · A PRACTICE
            </text>
            <line
              x1={RAIL.x + 10}
              y1={RAIL.y + RAIL.h / 2}
              x2={RAIL.x + 10 + (px(TARGET) - 20) * monoStrike}
              y2={RAIL.y + RAIL.h / 2}
              stroke={KID_COLORS.text}
              strokeWidth={7}
              strokeLinecap="round"
              opacity={monoStrike > 0.01 ? 1 : 0}
            />
          </g>
        ) : null}

        {/* the ten-minute minimum, drawn on the rail and then deleted */}
        {tenOp > 0.01 ? (
          <g opacity={tenOp}>
            <rect
              x={RAIL.x + 3}
              y={RAIL.y + 3}
              width={px(10) - 6}
              height={RAIL.h - 6}
              rx={8}
              fill={KID_COLORS.violet}
              opacity={mix(0.9, 0.4, tenStrike)}
            />
            <line
              x1={RAIL.x + px(10)}
              y1={RAIL.y - 6}
              x2={RAIL.x + px(10) + 30}
              y2={RAIL.y - 86}
              stroke="rgba(232,236,245,0.6)"
              strokeWidth={3}
            />
            <text
              x={RAIL.x + px(10) + 40}
              y={RAIL.y - 90}
              fill={KID_COLORS.text}
              fontFamily={FONT_BODY}
              fontSize={30}
              fontWeight={700}
              letterSpacing={4}
              opacity={mix(1, 0.45, tenStrike)}
            >
              10 MIN MINIMUM
            </text>
            <line
              x1={RAIL.x + px(10) + 36}
              y1={RAIL.y - 100}
              x2={RAIL.x + px(10) + 36 + 296 * tenStrike}
              y2={RAIL.y - 100}
              stroke={KID_COLORS.pink}
              strokeWidth={6}
              strokeLinecap="round"
              opacity={tenStrike > 0.01 ? 1 : 0}
            />
          </g>
        ) : null}

        {/* ---- WHAT IS ALREADY ON THE RAIL ----------------------------------- */}
        <Legend parts={GAMES} fracs={fracs} x={96} y={1290} w={900} cols={GAMES.length} />
      </g>
    </svg>
  );
};

// =============================================================================
// THE LOOP TITLE — the hook's title, faded back in so the last frame IS frame 0.
// `warm` pre-rolls BigTitle's own entrance, so at any frame of this sequence it is already
// fully composed and only this wrapper's opacity is moving.
// =============================================================================
const LoopTitle: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame() + from;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: EASE_OUT(prog(f, TITLE_IN, TITLE_IN + 54)) }}>
      <HookTitle />
    </div>
  );
};

const HookTitle: React.FC = () => (
  <BigTitle
    warm
    y={140}
    size={76}
    lines={[{ text: 'NOBODY HAS' }, { text: 'A SPARE HOUR', color: ACCENT }]}
    subtitle="so stop looking for one"
  />
);

// =============================================================================
// THE SHOT
// =============================================================================
export default function Short19Play() {
  return (
    <AbsoluteFill style={{ background: '#0b0e14' }}>
      <ShortsBackdrop />

      {/* HOOK — frame 0 is the END of the reveal, already composed (short-10's rewind trick):
          the rail is full at 62 and the kid is mid bear-crawl over it. */}
      <Sequence from={0} durationInFrames={HOOK_OUT}>
        <Canvas from={0} />
        <HookTitle />
      </Sequence>

      {/* SETUP — the rail un-builds, three kids show how few get there, and the hour everybody
          pictures lands as one solid block. */}
      <Sequence from={HOOK_OUT} durationInFrames={SETUP_OUT - HOOK_OUT}>
        <Canvas from={HOOK_OUT} />
        <Kicker text="WHAT AN HOUR SOUNDS LIKE" at={MONO_IN - HOOK_OUT} />
        <Stamp text="NOT A CLASS" at={MONO_X - HOOK_OUT} until={SETUP_OUT - HOOK_OUT - 4} x={540} y={860} size={70} />
      </Sequence>

      {/* QUIZ — the monolith is still on the rail, so the question has something to be about. */}
      <Sequence from={SETUP_OUT} durationInFrames={QUIZ_OUT - SETUP_OUT}>
        <Canvas from={SETUP_OUT} />
        <PauseCard
          subtitle="how long does it have to last to count?"
          durSec={(QUIZ_OUT - SETUP_OUT) / 30}
          y={760}
          accent={ACCENT}
        />
      </Sequence>

      {/* REVEAL — the rule is deleted, then five games land one per spoken name. */}
      <Sequence from={QUIZ_OUT} durationInFrames={REVEAL_OUT - QUIZ_OUT}>
        <Canvas from={QUIZ_OUT} />
        <Kicker text="THE RULE THAT WENT AWAY" at={TEN_IN - QUIZ_OUT} until={TEN_OUT - QUIZ_OUT} />
        <Kicker text="ANY LENGTH COUNTS" at={TEN_OUT - QUIZ_OUT + 6} until={REVEAL_OUT - QUIZ_OUT - 20} color={KID_COLORS.teal} />
        <Stamp text="DELETED 2018" at={TEN_X - QUIZ_OUT} until={TEN_OUT - QUIZ_OUT} x={540} y={860} size={68} />
      </Sequence>

      {/* TWIST — none of it was exercise, and the guideline is an average across the week. */}
      <Sequence from={REVEAL_OUT} durationInFrames={TWIST_OUT - REVEAL_OUT}>
        <Canvas from={REVEAL_OUT} />
        <Stamp
          text="NONE OF IT WAS EXERCISE"
          at={STAMP_IN - REVEAL_OUT}
          until={STAMP_OUT - REVEAL_OUT}
          x={540}
          y={300}
          size={44}
          color={KID_COLORS.teal}
        />
        <Kicker text="AVERAGED ACROSS THE WEEK" at={WEEK_A - REVEAL_OUT} color={KID_COLORS.teal} />
      </Sequence>

      {/* LOOP — the week collapses, the crawl comes back, the punch runs backwards onto frame 0. */}
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
