import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, PauseCard, ProgressBar, prog, timeWords } from '../../lib/shorts';
import { FONT_BODY } from '../../fonts';
import {
  BathMark,
  BodyGlyph,
  DeltaChip,
  EASE_INOUT,
  EASE_OUT,
  Plot,
  HeadStart,
  SleepMark,
  SourcePlate,
  TH,
  Tally,
  TempChart,
  TimeRule,
  WaitBar,
  WindowBand,
  clamp01,
  clock,
  coreT,
  crossing,
  dayRange,
  mix,
  pathOf,
  wedgeOf,
  px,
  py,
  smooth,
  solveBoost,
} from '../../lib/thermo';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short36Cool',
  durationInSeconds: 44.2,
  fps: 30,
  width: 1080,
  height: 1920,
};

const F = (s: number) => Math.round(s * 30);
const END = F(44.2);

// every cue is a spoken word — retimes itself when the real voice lands in vo.gen.ts
const key = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
const wAt = (line: number, word: string) => {
  const w = timeWords(VO[line]).find((x) => key(x.w) === word);
  if (!w) throw new Error(`Short36Cool: no word "${word}" in VO line ${line} ("${VO[line].text}")`);
  return F(w.start);
};

// =============================================================================
// THE MODEL — one evening, and the two ways it can go.
//
// Three constants drive every number on screen: when you go to bed, how long you lie
// there tonight, and the one published effect size. The bath's cooling depth is SOLVED
// so the warmed curve crosses the sleep gate exactly `SOL_WARM` after lights out — so
// the bend is a consequence of the 36%, not a drawing.
// =============================================================================
const BED = 22 * 60 + 30; // 22:30 — this evening's premise
const SOL_BASE = 28; // minutes you lie there tonight — stated out loud as a premise
const EFFECT = 0.36; // Haghayegh et al. 2019: pooled sleep-onset-latency reduction
const SOL_WARM = SOL_BASE * (1 - EFFECT);
const BATH_AT = 21 * 60; // 90 minutes before bed, inside the trials' window
const BATH_MIN = 10;
const WIN_A = BED - 120; // the band the evidence covers: 1-2 h before bed
const WIN_B = BED - 60;

const GATE = coreT(BED + SOL_BASE); // the crossing the plain descent makes on its own
const ramp = (m: number) => smooth((m - (BATH_AT + BATH_MIN)) / 100);
const BOOST = solveBoost(coreT, ramp, GATE, BED + SOL_WARM);
const warmT = (m: number) => coreT(m) - BOOST * ramp(m);

const DAY = dayRange(coreT);

/** The minute of steepest decline, SCANNED off the curve (it is not typed as 22:00). */
const steepest = (() => {
  let best = BED - 120;
  let drop = 0;
  for (let m = BED - 150; m <= BED + 90; m += 1) {
    const d = coreT(m - 5) - coreT(m + 5);
    if (d > drop) {
      drop = d;
      best = m;
    }
  }
  return best;
})();

const P: Plot = { x: 170, w: 730, y: 720, h: 400, lo: BED - 125, hi: BED + 50, tLo: 36.44, tHi: 36.95 };
const PXM = 13; // the wait bars' own scale: px per minute
const BAR_X = 300;

// the claims, checked at module load — if the model changes, the video refuses to render a lie
const M_BASE = crossing(coreT, GATE, P.lo, P.hi);
const M_WARM = crossing(warmT, GATE, P.lo, P.hi);
{
  if (M_BASE === null || M_WARM === null) throw new Error('both curves must reach the sleep gate inside the plotted window');
  if (Math.abs(M_BASE - (BED + SOL_BASE)) > 0.2) throw new Error(`plain descent must cross at bed+${SOL_BASE} (got ${M_BASE - BED})`);
  if (Math.abs(M_WARM - (BED + SOL_WARM)) > 0.2) throw new Error(`warmed descent must cross at bed+${SOL_WARM} (got ${M_WARM - BED})`);
  if (Math.abs(DAY.range - 1.0) > 0.001) throw new Error(`the day range the video says is ~1C measured ${DAY.range}`);
  if (steepest < BED - 40 || steepest > BED + 10) throw new Error(`steepest fall landed at ${clock(steepest)}, nowhere near bedtime`);
  if (BATH_AT < WIN_A || BATH_AT > WIN_B) throw new Error('the bath has to sit inside the window the trials used');
  const t = [coreT(P.lo), coreT(P.hi), warmT(P.hi)];
  if (t.some((x) => x > P.tHi || x < P.tLo)) throw new Error(`a curve leaves the plot: ${t.map((x) => x.toFixed(3)).join(', ')}`);
}

const SAVED = Math.round(SOL_BASE) - Math.round(SOL_WARM); // 28 - 18, the two numbers as PRINTED

// =============================================================================
// THE TIMELINE
// =============================================================================
const REWIND_A = wAt(1, 'every');
const DEG_A = wAt(1, 'degree');
const HAND_A = wAt(2, 'hands');
const FEET_A = wAt(2, 'feet');
const SLOPE_A = wAt(3, 'quicker');
const QUIZ_FROM = F(15.0);
const QUIZ_DUR = F(2.6);
const BATH_A = wAt(4, 'bath');
const VENT_A = wAt(5, 'vents');
const DRAW_A = wAt(6, 'pours');
const GAP_A = wAt(7, 'ninety');
const GHOST_A = wAt(8, 'right');
const SRC_A = wAt(9, 'thirteen');
const NUM_A = wAt(10, 'eighteen');
const LOOP_A = wAt(11, 'stop');

// the ghost bath: out of the window, held there, then back where it belongs
const ghostM = (f: number) => {
  if (f < GHOST_A) return BATH_AT;
  const out = EASE_INOUT(prog(f, GHOST_A, GHOST_A + 34));
  const back = EASE_INOUT(prog(f, GHOST_A + 80, GHOST_A + 106));
  return mix(BATH_AT, BED, out * (1 - back));
};

const HOOK_LINES = [{ text: `ASLEEP ${SAVED} MINUTES` }, { text: 'SOONER TONIGHT', color: TH.gate }];
const HEADS: { a: number; lines: { text: string; color?: string }[] }[] = [
  { a: -30, lines: HOOK_LINES },
  { a: REWIND_A, lines: [{ text: 'YOUR CORE FALLS' }, { text: `${DAY.range.toFixed(1)}°C EVERY NIGHT`, color: TH.cool }] },
  { a: wAt(2, 'dump'), lines: [{ text: 'THE HEAT LEAVES' }, { text: 'HANDS AND FEET', color: TH.heat }] },
  { a: BATH_A, lines: [{ text: 'A HOT BATH' }, { text: 'COOLS YOU FASTER', color: TH.gate }] },
  { a: wAt(7, 'not'), lines: [{ text: 'NOT AT BEDTIME.' }, { text: '90 MINUTES BEFORE', color: TH.warn }] },
  { a: SRC_A, lines: [{ text: '13 TRIALS:' }, { text: `${Math.round(EFFECT * 100)}% LESS WAITING`, color: TH.gate }] },
  { a: LOOP_A, lines: HOOK_LINES },
];

export default function Short36Cool() {
  const f = useCurrentFrame();

  const punch = f < LOOP_A ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 30)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP_A, END));

  // ---- the two scalars the whole canvas hangs off -------------------------------
  // warmed descent: on at frame 0, un-draws into the bath point on the rewind, redrawn on "pours"
  const draw = f < REWIND_A ? 1 : Math.max(0, 1 - EASE_INOUT(prog(f, REWIND_A, REWIND_A + 30))) + EASE_OUT(prog(f, DRAW_A, DRAW_A + 42));
  const drawn = clamp01(draw);
  // the vents: open at frame 0, closed through the setup, opened again on "vents"
  const vent = clamp01(
    (f < REWIND_A ? 1 : 1 - EASE_INOUT(prog(f, REWIND_A, REWIND_A + 26))) + EASE_OUT(prog(f, VENT_A, VENT_A + 26)),
  );
  // warm skin: 0.55 at frame 0, gone on the rewind, spiking on the bath, settling back to 0.55
  const flush = clamp01(
    (f < REWIND_A ? 0.55 : 0.55 * (1 - EASE_INOUT(prog(f, REWIND_A, REWIND_A + 26)))) +
      EASE_OUT(prog(f, BATH_A, BATH_A + 20)) -
      0.45 * EASE_INOUT(prog(f, DRAW_A + 10, DRAW_A + 70)),
  );

  // ---- what the chart is showing this frame ------------------------------------
  const baseCross = crossing(coreT, GATE, P.lo, P.hi);
  const warmAt = (m: number) => mix(coreT(m), warmT(m), drawn);
  const warmCross = drawn > 0.995 ? crossing(warmAt, GATE, P.lo, P.hi) : null;
  const waitBase = baseCross === null ? 0 : Math.round(baseCross - BED);
  const waitWarm = warmCross === null ? 0 : Math.round(warmCross - BED);

  const barsOn = clamp01((f < REWIND_A ? 1 : 1 - prog(f, REWIND_A, REWIND_A + 18)) + prog(f, DRAW_A + 16, DRAW_A + 34));
  const warmBarOn = barsOn * (f < REWIND_A ? 1 : prog(f, DRAW_A + 24, DRAW_A + 42));
  const tallyOn = clamp01(prog(f, REWIND_A + 14, REWIND_A + 30) - prog(f, QUIZ_FROM - 16, QUIZ_FROM - 2));

  const gh = ghostM(f);
  const ghostOn = clamp01(prog(f, GHOST_A, GHOST_A + 10) - prog(f, GHOST_A + 96, GHOST_A + 112));
  const bandOn = clamp01(prog(f, GAP_A, GAP_A + 14) - prog(f, LOOP_A, LOOP_A + 16));
  const live = 1 - smooth((gh - WIN_B) / 30); // greys itself as the ghost leaves the window
  const gapOn = clamp01(prog(f, GAP_A, GAP_A + 14) - prog(f, LOOP_A, LOOP_A + 16));
  const srcOn = clamp01(prog(f, SRC_A, SRC_A + 12) - prog(f, LOOP_A, LOOP_A + 14));
  const slopeOn = clamp01(prog(f, SLOPE_A, SLOPE_A + 12) - prog(f, QUIZ_FROM - 16, QUIZ_FROM - 2));
  const bathOn = clamp01(f < REWIND_A ? 1 - prog(f, REWIND_A - 30, REWIND_A - 12) : prog(f, BATH_A, BATH_A + 14));
  const numPulse = Math.max(prog(f, NUM_A, NUM_A + 8) - prog(f, NUM_A + 8, NUM_A + 30), 0);
  const limbGlow = Math.max(
    prog(f, HAND_A, HAND_A + 8) - prog(f, HAND_A + 10, HAND_A + 30),
    prog(f, FEET_A, FEET_A + 8) - prog(f, FEET_A + 12, FEET_A + 40),
  );

  const gapMid = (px(P, BATH_AT) + px(P, BED)) / 2;
  const bathDropY = f < REWIND_A ? P.y + 56 : mix(P.y - 60, P.y + 56, EASE_OUT(prog(f, BATH_A, BATH_A + 18)));

  return (
    <AbsoluteFill style={{ background: TH.stage }}>
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <AbsoluteFill
          style={{ background: 'radial-gradient(ellipse 72% 42% at 50% 30%, rgba(99,102,241,0.13), rgba(11,14,20,0) 70%)' }}
        />

        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          <BodyGlyph cx={540} cy={460} vent={vent} flush={flush} limbGlow={limbGlow} f={f} opacity={0.85} />

          <TempChart p={P} ticks={[BED - 90, BED - 30, BED + 30]} degrees={[36.5, 36.7, 36.9]} gate={GATE} />

          <WindowBand p={P} a={WIN_A} b={WIN_B} label="1-2 H BEFORE BED" opacity={bandOn} live={live} />

          {/* the descent you get anyway */}
          <path d={pathOf(P, coreT, P.lo, P.hi)} stroke={TH.plain} strokeWidth={4} fill="none" strokeLinecap="round" />

          {/* the heat that left early — the whole argument, as an area */}
          {drawn > 0.01 ? (
            <path d={wedgeOf(P, coreT, warmT, BATH_AT + BATH_MIN, P.hi, drawn)} fill={TH.gate} opacity={0.55} />
          ) : null}
          {/* the stretch where it falls fastest — scanned, then lit */}
          {slopeOn > 0.01 ? (
            <g opacity={slopeOn}>
              <path
                d={pathOf(P, coreT, steepest - 26, steepest + 26)}
                stroke={TH.warn}
                strokeWidth={9}
                fill="none"
                strokeLinecap="round"
              />
              <text
                x={px(P, steepest)}
                y={py(P, coreT(steepest)) - 26}
                fill={TH.warn}
                fontFamily={FONT_BODY}
                fontSize={24}
                fontWeight={700}
                letterSpacing={2}
                textAnchor="middle"
              >
                STEEPEST FALL
              </text>
            </g>
          ) : null}

          {/* what the bath buys: drawn from the bath forward */}
          {drawn > 0.01 ? (
            <path
              d={pathOf(P, warmT, BATH_AT + BATH_MIN, P.hi, drawn)}
              stroke={TH.gate}
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
            />
          ) : null}

          <TimeRule p={P} m={BED} label={`BED ${clock(BED)}`} color={TH.text} labelY={P.y - 16} />
          <TimeRule p={P} m={BATH_AT} label={`BATH ${clock(BATH_AT)}`} color={TH.heat} dash opacity={bathOn} labelY={P.y - 16} />

          {baseCross !== null ? <SleepMark p={P} m={baseCross} gate={GATE} color={TH.plain} pulse={slopeOn * 0.6} /> : null}
          {warmCross !== null ? <SleepMark p={P} m={warmCross} gate={GATE} color={TH.gate} opacity={warmBarOn} /> : null}
          {warmCross !== null && baseCross !== null ? (
            <HeadStart p={P} a={warmCross} b={baseCross} gate={GATE} text={`${waitBase - waitWarm} MIN`} opacity={warmBarOn} />
          ) : null}

          {/* the 90 minutes that do the work */}
          {gapOn > 0.01 ? (
            <g opacity={gapOn}>
              <line x1={px(P, BATH_AT)} y1={P.y + P.h - 44} x2={px(P, BED)} y2={P.y + P.h - 44} stroke={TH.warn} strokeWidth={3} />
              <line x1={px(P, BATH_AT)} y1={P.y + P.h - 58} x2={px(P, BATH_AT)} y2={P.y + P.h - 30} stroke={TH.warn} strokeWidth={3} />
              <line x1={px(P, BED)} y1={P.y + P.h - 58} x2={px(P, BED)} y2={P.y + P.h - 30} stroke={TH.warn} strokeWidth={3} />
              <text
                x={gapMid}
                y={P.y + P.h - 58}
                fill={TH.warn}
                fontFamily={FONT_BODY}
                fontSize={30}
                fontWeight={700}
                letterSpacing={2}
                textAnchor="middle"
              >
                {BED - BATH_AT} MIN
              </text>
            </g>
          ) : null}

          <BathMark x={px(P, BATH_AT)} y={bathDropY} opacity={bathOn} />
          {ghostOn > 0.01 ? (
            <g opacity={ghostOn}>
              <BathMark x={px(P, gh)} y={P.y + 56} ghost />
              <text
                x={Math.min(px(P, gh), P.x + P.w - 30)}
                y={P.y + 140}
                fill={TH.dim}
                fontFamily={FONT_BODY}
                fontSize={24}
                fontWeight={700}
                letterSpacing={2}
                textAnchor="middle"
                opacity={1 - live}
              >
                STILL WARM
              </text>
            </g>
          ) : null}

          {/* the readout zone: the day's swing during the setup, the two waits after it */}
          <Tally
            y={1196}
            opacity={tallyOn}
            cols={[
              { label: "TODAY'S PEAK", value: `${DAY.hi.toFixed(1)}°`, color: TH.heat },
              { label: "TONIGHT'S FLOOR", value: `${DAY.lo.toFixed(1)}°`, color: TH.cool },
              { label: 'THE FALL', value: `${DAY.range.toFixed(1)}°`, color: TH.warn, pulse: prog(f, DEG_A, DEG_A + 8) - prog(f, DEG_A + 10, DEG_A + 34) },
            ]}
          />

          <WaitBar
            x0={BAR_X}
            w={waitBase * PXM}
            y={1204}
            label="USUAL"
            value={`${waitBase} MIN`}
            color={TH.plain}
            opacity={barsOn}
            pulse={numPulse}
          />
          <WaitBar
            x0={BAR_X}
            w={waitWarm * PXM}
            y={1268}
            label="AFTER A BATH"
            value={`${waitWarm} MIN`}
            color={TH.gate}
            opacity={warmBarOn}
            pulse={numPulse}
          />
          <DeltaChip
            xa={BAR_X + waitWarm * PXM}
            xb={BAR_X + waitBase * PXM}
            y={1312}
            text={`${waitBase - waitWarm} MIN SOONER`}
            opacity={warmBarOn}
          />

          <SourcePlate
            y={1408}
            opacity={srcOn}
            lines={['HAGHAYEGH ET AL. 2019 · META-ANALYSIS · 13 TRIALS · 40-42.5°C, 10 MIN']}
          />
        </svg>

        {HEADS.map((h, k) => {
          const next = HEADS[k + 1];
          const b = next ? next.a : END + 30;
          const op = Math.min(prog(f, h.a + 2, h.a + 9), 1 - prog(f, b - 7, b));
          if (op <= 0.01) return null;
          return (
            <div key={k} style={{ opacity: op }}>
              <BigTitle lines={h.lines} y={130} size={62} warm />
            </div>
          );
        })}
      </AbsoluteFill>

      <Sequence from={QUIZ_FROM} durationInFrames={QUIZ_DUR}>
        <PauseCard
          title="PAUSE"
          subtitle="cold shower, or hot bath?"
          durSec={QUIZ_DUR / 30}
          accent={TH.gate}
          y={392}
        />
      </Sequence>

      <Captions lines={VO} y={1510} accent={TH.warn} plate />
      <ProgressBar color={TH.cool} />
    </AbsoluteFill>
  );
}
