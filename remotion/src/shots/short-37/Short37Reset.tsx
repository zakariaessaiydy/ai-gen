import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { FONT_BODY } from '../../fonts';
import { BigTitle, Captions, PauseCard, ProgressBar, Stamp, prog, timeWords } from '../../lib/shorts';
import {
  AvgLine,
  Backlog,
  Chip,
  DrawnSession,
  EASE_INOUT,
  People,
  Plot,
  RT,
  Session,
  SourcePlate,
  Tally,
  WeekGrid,
  WorkBars,
  above,
  clamp01,
  ex,
  ey,
  mins,
  mix,
  simulate,
} from '../../lib/rate';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short37Reset',
  durationInSeconds: 44.5,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = RT.work;
const F = (s: number) => Math.round(s * 30);
const END = F(44.5);

// every cue is a spoken word — retimes itself when the real voice lands in vo.gen.ts
const key = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
const wAt = (line: number, word: string) => {
  const w = timeWords(VO[line]).find((x) => key(x.w) === word);
  if (!w) throw new Error(`Short37Reset: no word "${word}" in VO line ${line} ("${VO[line].text}")`);
  return F(w.start);
};

// =============================================================================
// THE MODEL — one week, a backlog of TIDYING MINUTES, and the same minutes spent twice.
//
// Two premises, printed on screen as premises (see beats.json `facts`):
//   a house makes 28 person-minutes of tidying a day, and 4 people live in it.
// Everything else is arithmetic:
//   28 / 4 = 7 min each a day      <- the title's number is DERIVED, not chosen
//   7 x 28 = 196 min a week        <- the same either way
//   196 / 4 = 49 min each a week   <- "an hour", once, on Saturday
// =============================================================================
const N = 7; // days, and therefore sessions
const PEOPLE = 4;
const DAY_MIN = 28; // person-minutes of tidying a house makes per day
const EACH_DAY = DAY_MIN / PEOPLE; // 7
const WEEK_MIN = DAY_MIN * N; // 196
const EACH_WEEK = WEEK_MIN / PEOPLE; // 49
const RATE = DAY_MIN / 24; // minutes of tidying arriving per hour
const LO = 0;
const HI = 24 * N; // 168 hours
const HOUR = 60; // "an hour of tidying waiting" — the threshold the title is about
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// The SAME seven sessions, placed two ways. A session carries its minutes wherever it goes,
// so no schedule can change the total — the invariant is structural, not asserted.
const DAILY: Session[] = Array.from({ length: N }, (_, i) => ({ t: 24 * (i + 1), minutes: DAY_MIN }));
const WEEKLY: Session[] = Array.from({ length: N }, () => ({ t: HI, minutes: DAY_MIN })); // all stacked on Saturday

const RUN_DAILY = simulate(DAILY, RATE, LO, HI);
const RUN_WEEKLY = simulate(WEEKLY, RATE, LO, HI);
const AVG_WEEKLY = RUN_WEEKLY.avg;
const RATIO = AVG_WEEKLY / RUN_DAILY.avg;

// the claims, checked at module load — if the model changes, the video refuses to render a lie
{
  const near = (a: number, b: number, eps = 0.01) => Math.abs(a - b) < eps;
  if (!near(EACH_DAY, 7) || !near(EACH_WEEK, 49) || !near(WEEK_MIN, 196))
    throw new Error(`the derived minutes must be 7 / 49 / 196 (got ${EACH_DAY} / ${EACH_WEEK} / ${WEEK_MIN})`);
  if (!near(RUN_DAILY.total, WEEK_MIN) || !near(RUN_WEEKLY.total, WEEK_MIN))
    throw new Error(`both schedules must spend ${WEEK_MIN} min (got ${RUN_DAILY.total} / ${RUN_WEEKLY.total})`);
  if (!near(RUN_WEEKLY.peak, 196) || !near(AVG_WEEKLY, 98))
    throw new Error(`weekly must peak 196 and average 98 (got ${RUN_WEEKLY.peak} / ${AVG_WEEKLY})`);
  if (!near(RUN_DAILY.peak, 28) || !near(RUN_DAILY.avg, 14))
    throw new Error(`daily must peak 28 and average 14 (got ${RUN_DAILY.peak} / ${RUN_DAILY.avg})`);
  if (!near(RATIO, N)) throw new Error(`the average must drop exactly ${N}x (got ${RATIO.toFixed(3)}x)`);
  if (above(RUN_DAILY, HOUR) > 0.001) throw new Error('the daily reset must never leave an hour of tidying waiting');
  if (above(RUN_WEEKLY, HOUR) < 100) throw new Error('the weekly clean must leave an hour+ waiting for most of the week');
  if (DAILY.some((s, i) => s.t > WEEKLY[i].t)) throw new Error('the reveal may only move a session EARLIER — you clean sooner, never later');
}

// =============================================================================
// THE TIMELINE — the sessions are the only thing that moves. Everything printed is
// simulate() run on where they are THIS frame.
// =============================================================================
const STACK_A = wAt(2, 'save'); // "SAVE it for Saturday" — the seven slide right and pile up
const SPLIT_A = wAt(5, 'split'); // "...SPLIT across seven days" — they unstack, earliest first
const LOOP_A = wAt(9, 'your');

type Seg = { from: Session[]; to: Session[]; win: (i: number) => [number, number] };
const SEGS: Seg[] = [
  { from: DAILY, to: WEEKLY, win: (i) => [STACK_A + (N - 1 - i) * 4, STACK_A + (N - 1 - i) * 4 + 26] },
  { from: WEEKLY, to: DAILY, win: (i) => [SPLIT_A + i * 5, SPLIT_A + i * 5 + 22] },
];
const SPLIT_END = SEGS[1].win(N - 1)[1];

const sessionAt = (i: number, f: number): DrawnSession => {
  let cur = SEGS[0].from[i];
  for (const s of SEGS) {
    const [a, b] = s.win(i);
    if (f < a) return { ...cur, glow: 0 };
    if (f < b) {
      const u = EASE_INOUT(prog(f, a, b));
      return { t: mix(s.from[i].t, s.to[i].t, u), minutes: s.from[i].minutes, glow: Math.sin(u * Math.PI) };
    }
    cur = s.to[i];
  }
  return { ...cur, glow: 0 };
};

// =============================================================================
// THE BAND — one headline at a time; each runs until the next one starts.
// =============================================================================
const HOOK_LINES = [{ text: 'SAME MINUTES.' }, { text: '7× LESS MESS.', color: RT.work }];
const HEADS: { a: number; lines: { text: string; color?: string }[] }[] = [
  { a: -30, lines: HOOK_LINES },
  { a: wAt(1, 'makes'), lines: [{ text: '28 MIN OF TIDYING A DAY' }, { text: '÷ 4 PEOPLE = 7 MIN EACH', color: RT.work }] },
  { a: STACK_A, lines: [{ text: 'ALL OF IT ON SATURDAY:' }, { text: '49 MIN EACH, ONCE.', color: RT.mess }] },
  { a: wAt(3, 'you'), lines: [{ text: 'ONE CLEAN DAY.' }, { text: 'YOU LIVE IN THE OTHER SIX.', color: RT.mess }] },
  { a: wAt(4, 'sooner'), lines: [{ text: "DON'T CLEAN MORE." }, { text: 'CLEAN SOONER.', color: RT.work }] },
  { a: wAt(5, 'same'), lines: [{ text: 'THE SAME 49 MIN EACH,' }, { text: 'SPLIT ACROSS 7 DAYS.', color: RT.work }] },
  { a: wAt(7, 'nothing'), lines: [{ text: 'NOTHING STACKS UP.' }, { text: '7× LESS, ON AVERAGE.', color: RT.work }] },
  { a: wAt(8, 'spouses'), lines: [{ text: 'FLATTER STRESS CURVE.' }, { text: 'MOOD FELL ALL DAY.', color: RT.mess }] },
  { a: LOOP_A, lines: HOOK_LINES },
];

const QUIZ_FROM = F(17.8);
const QUIZ_DUR = F(2.7);

const P: Plot = { x: 90, w: 900, y: 540, h: 545, tLo: LO, tHi: HI, vTop: 205 };
const BAR_PX = 0.95; // px of bar depth per scheduled minute
const LIT_DAY = 3; // the day band that lights while the VO states the rate

export default function Short37Reset() {
  const f = useCurrentFrame();

  const punch = f < LOOP_A ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 30)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP_A, END));

  const sessions = Array.from({ length: N }, (_, i) => sessionAt(i, f));
  const run = simulate(sessions, RATE, LO, HI);
  const hrs = above(run, HOUR);

  // the ghost of the OTHER week: the payoff picture at frame 0, gone while the video builds
  // it, back for the twist — and back at exactly its frame-0 strength, so the loop closes.
  const ghost =
    0.24 * Math.max(1 - prog(f, F(4.3), F(5.6)), prog(f, wAt(8, 'spouses'), wAt(8, 'spouses') + 14));

  // the weekly average, frozen as a reference line the moment the live one starts falling
  // away from it — before that the two coincide and there is nothing to compare.
  const refOn = prog(f, SPLIT_A, SPLIT_A + 14) * (1 - prog(f, LOOP_A + 10, LOOP_A + 26));

  const litOn = prog(f, wAt(1, 'half'), wAt(1, 'half') + 8) * (1 - prog(f, STACK_A - 8, STACK_A));

  // "you get ONE clean day" — the single instant the backlog is actually zero
  const markOn = prog(f, wAt(3, 'one'), wAt(3, 'one') + 10) * (1 - prog(f, wAt(4, 'so'), wAt(4, 'so') + 10));

  // the tally and the headline step aside for the quiz card
  const tallyOn = clamp01(1 - prog(f, QUIZ_FROM - 6, QUIZ_FROM + 4) + prog(f, QUIZ_FROM + QUIZ_DUR - 4, QUIZ_FROM + QUIZ_DUR + 6));
  const srcOn = prog(f, wAt(8, 'cluttered'), wAt(8, 'cluttered') + 10) * (1 - prog(f, LOOP_A - 14, LOOP_A - 6));

  // the chip under the bars says who does how much, how often — it swaps as they land
  const weekly = clamp01(prog(f, STACK_A + 14, STACK_A + 30) - prog(f, SPLIT_A + 10, SPLIT_A + 30));
  const chipText = weekly > 0.5 ? `× ${EACH_WEEK} MIN · ONCE A WEEK` : `× ${EACH_DAY} MIN · EVERY DAY`;
  const chipColor = weekly > 0.5 ? RT.mess : RT.work;
  // the chip leaves on "spouses" and the citation arrives on "cluttered" — they share the
  // slot under the bars, so they must never cross in it
  const chipOn =
    tallyOn *
    Math.max(1 - prog(f, wAt(8, 'spouses'), wAt(8, 'spouses') + 10), prog(f, LOOP_A - 6, LOOP_A + 8));
  // lit at frame 0 (the hook rule — the payoff is already on), dimmed while the video
  // builds the Saturday version, lit again on "Four people" so the loop closes on it.
  const peopleLit =
    weekly > 0.5
      ? 1 - prog(f, SPLIT_A, SPLIT_A + 10)
      : Math.max(1 - prog(f, F(4.0), F(5.2)), clamp01(prog(f, wAt(6, 'four'), wAt(6, 'four') + 12)));

  return (
    <AbsoluteFill style={{ background: RT.stage }}>
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <AbsoluteFill
          style={{ background: 'radial-gradient(ellipse 72% 42% at 50% 46%, rgba(77,184,168,0.10), rgba(11,14,20,0) 70%)' }}
        />
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          <Tally
            y={300}
            opacity={tallyOn}
            cols={[
              {
                label: 'MESS WAITING · AVG',
                value: `${mins(run.avg)} MIN`,
                color: run.avg > 40 ? RT.mess : RT.work,
                sub: `PEAK ${mins(run.peak)} MIN`,
              },
              {
                label: 'AN HOUR+ WAITING',
                value: `${Math.round(hrs)} H`,
                color: hrs > 1 ? RT.mess : RT.work,
                sub: `OF ${HI} H A WEEK`,
              },
            ]}
          />

          <WeekGrid p={P} days={DAYS} litDay={LIT_DAY} litOn={litOn} />

          {/* the other schedule, ghosted: the mountain you are not living under */}
          <Backlog p={P} run={weekly > 0.5 ? RUN_DAILY : RUN_WEEKLY} opacity={ghost} dashed width={4} fill="rgba(232,135,159,0.07)" />
          <WorkBars
            p={P}
            sessions={weekly > 0.5 ? DAILY : WEEKLY}
            pxPerMin={BAR_PX}
            gap={50}
            barW={22}
            align="end"
            opacity={ghost * 0.9}
          />

          {/* the frozen weekly average — the line the reveal has to get under */}
          <AvgLine
            p={P}
            v={AVG_WEEKLY}
            color={RT.mess}
            opacity={refOn * 0.6}
            side="right"
            label={`WEEKLY AVG ${mins(AVG_WEEKLY)}`}
          />

          <Backlog p={P} run={run} />
          {/* no label on the live line — the tally already prints it, and the sawtooth
              teeth sit right where a label next to it would go */}
          <AvgLine p={P} v={run.avg} color={RT.warn} />

          {/* the one instant the backlog is actually zero */}
          {markOn > 0.01 ? (
            <g opacity={markOn}>
              <line x1={ex(P, HI)} y1={ey(P, 0)} x2={ex(P, HI)} y2={ey(P, 0) - 54} stroke={RT.work} strokeWidth={4} />
              <circle cx={ex(P, HI)} cy={ey(P, 0)} r={11} fill={RT.work} />
              <text
                x={ex(P, HI) - 16}
                y={ey(P, 0) - 66}
                fill={RT.work}
                fontFamily={FONT_BODY}
                fontSize={26}
                fontWeight={700}
                letterSpacing={3}
                textAnchor="end"
              >
                CLEAN
              </text>
            </g>
          ) : null}

          <WorkBars p={P} sessions={sessions} pxPerMin={BAR_PX} gap={50} barW={46} align="end" />

          {/* who does how much, how often — the citation borrows this slot for the twist */}
          <People cx={352} y={1374} n={PEOPLE} lit={peopleLit} color={chipColor} s={0.82} opacity={chipOn} />
          <Chip x={452} y={1400} text={chipText} color={chipColor} anchor="start" opacity={chipOn} size={31} />

          <SourcePlate y={1400} opacity={srcOn} lines={['SAXBE & REPETTI 2010 · 60 SPOUSES · CORRELATIONAL']} />
        </svg>

        <Stamp
          text={`${RATIO.toFixed(1)}× LOWER`}
          at={wAt(7, 'average')}
          until={wAt(8, 'spouses')}
          color={RT.work}
          x={690}
          y={930}
          size={64}
          rotate={-6}
        />

        {HEADS.map((h, k) => {
          const next = HEADS[k + 1];
          const b = next ? next.a : END + 30;
          const op = Math.min(prog(f, h.a + 2, h.a + 9), 1 - prog(f, b - 7, b)) * tallyOn;
          if (op <= 0.01) return null;
          return (
            <div key={k} style={{ opacity: op }}>
              <BigTitle lines={h.lines} y={120} size={62} warm />
            </div>
          );
        })}
      </AbsoluteFill>

      <Sequence from={QUIZ_FROM} durationInFrames={QUIZ_DUR}>
        <PauseCard title="PAUSE" subtitle="same minutes, same mess. where does 7× come from?" durSec={QUIZ_DUR / 30} accent={ACCENT} y={300} />
      </Sequence>

      <Captions lines={VO} y={1510} accent={ACCENT} plate />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
