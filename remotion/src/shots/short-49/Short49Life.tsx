import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, ProgressBar, ShortsBackdrop, prog, timeWords } from '../../lib/shorts';
import {
  Chip,
  EASE_INOUT,
  EASE_OUT,
  H_FROZEN,
  LF,
  LIFE,
  MEDIAN_AGELESS,
  N_PEOPLE,
  PeopleGrid,
  SurvivalChart,
  YearsBar,
  aliveCount,
  mix,
  survival,
  yearsLeft,
} from '../../lib/life';
import { FONT_BODY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short49Life',
  durationInSeconds: 37.6,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = LF.gold;
const F = (s: number) => Math.round(s * 30);
const END = F(37.6);

// every cue is a spoken word — retimes itself when the real voice lands in vo.gen.ts
const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const word = (line: number, w: string, nth = 0) => {
  const x = timeWords(VO[line]).filter((y) => key(y.w) === w)[nth];
  if (!x) throw new Error(`Short49Life: no word "${w}" (#${nth}) in VO line ${line} ("${VO[line].text}")`);
  return x;
};
const wAt = (line: number, w: string, nth = 0) => F(word(line, w, nth).start);
const wEnd = (line: number, w: string, nth = 0) => F(word(line, w, nth).end);

// =============================================================================
// CUES — all spoken words.
// =============================================================================
const RIGHT = wAt(1, 'right');
const DOUBLES = wAt(1, 'doubles');
const CRASHES = wAt(2, 'crashes');
const HUNDRED_END = wEnd(2, 'hundred');
const NOW = wAt(3, 'now');
const OFF = wAt(3, 'off');
const TWENTY_END = wEnd(3, 'twenty');
const FREEZES = wAt(3, 'freezes');
const THOUSAND_END = wEnd(3, 'thousand');
const OVER = wAt(4, 'over');
const UP_END = wEnd(4, 'up');
const ONLY = wAt(5, 'only');
const SIX = wAt(5, 'six');
const HALF = wAt(5, 'half');
const SEVEN_END = wEnd(5, 'hundred');
const AND = wAt(6, 'and');
const OLD = wAt(6, 'old');
const ACCIDENTS = wAt(6, 'accidents');
const SO = wAt(7, 'so');
const CENTURIES = wAt(7, 'centuries');
const YOUD = wAt(8, 'youd');
const LOOP = Math.min(END - 30, F(VO[8].end + 0.25));

// =============================================================================
// THE NUMBERS — computed by the engine, checked against what the VO says.
// =============================================================================
const HOOK_YR = 500;
const ALIVE_500 = aliveCount(survival(HOOK_YR, true)); // "about six in ten"
const ALIVE_100 = aliveCount(survival(100, false)); // "crashes before a hundred"
const LEFT_TODAY = yearsLeft(30, false);
const LEFT_AGELESS = yearsLeft(30, true); // "centuries on the line"
const round10 = (v: number) => Math.round(v / 10) * 10;

// =============================================================================
// THE STATE — one chart, rewound on "Right now", rebuilt on "switch it off".
// =============================================================================
const REW = RIGHT - 4;
const REW_END = REW + 20;

// the cursor's age
const yrAt = (f: number) => {
  if (f < REW) return HOOK_YR;
  if (f < REW_END) return mix(HOOK_YR, 0, EASE_INOUT(prog(f, REW, REW_END)));
  if (f < NOW) return mix(0, 100, EASE_INOUT(prog(f, REW_END, HUNDRED_END)));
  if (f < OVER) return mix(100, LIFE.freezeAt, EASE_INOUT(prog(f, NOW, TWENTY_END)));
  if (f < HALF) return mix(LIFE.freezeAt, HOOK_YR, EASE_INOUT(prog(f, OVER, UP_END)));
  if (f < YOUD) return mix(HOOK_YR, MEDIAN_AGELESS, EASE_INOUT(prog(f, HALF, SEVEN_END)));
  return mix(MEDIAN_AGELESS, HOOK_YR, EASE_INOUT(prog(f, YOUD, LOOP)));
};
// which world the cursor lives in — switched only where both curves agree (age ≤ 20)
const agelessAt = (f: number) => f < REW_END || f >= TWENTY_END;
const spanAt = (f: number) => {
  if (f < FREEZES) return mix(1000, 120, EASE_INOUT(prog(f, REW, REW_END)));
  return mix(120, 1000, EASE_INOUT(prog(f, FREEZES, THOUSAND_END)));
};
const todayToAt = (f: number) => {
  if (f < REW) return 130;
  if (f < REW_END) return Math.min(130, yrAt(f));
  if (f < NOW) return mix(yrAt(f), 130, EASE_OUT(prog(f, HUNDRED_END, HUNDRED_END + 12)));
  return 130;
};
const agelessToAt = (f: number) => {
  if (f < REW) return 1000;
  if (f < TWENTY_END) return mix(1000, LIFE.freezeAt, EASE_INOUT(prog(f, REW, REW_END)));
  if (f < SEVEN_END) return Math.max(LIFE.freezeAt, yrAt(f));
  return mix(MEDIAN_AGELESS, 1000, EASE_INOUT(prog(f, SEVEN_END, SEVEN_END + 24)));
};
const survAt = (f: number) => survival(yrAt(f), agelessAt(f));

// module-load assertions: the VO's claims are the picture's numbers
{
  if (ALIVE_500 < 55 || ALIVE_500 > 65) throw new Error(`Short49Life: "about six in ten" but ${ALIVE_500} alive at 500`);
  if (ALIVE_100 > 5) throw new Error(`Short49Life: "crashes before a hundred" but ${ALIVE_100} alive at 100`);
  if (Math.abs(MEDIAN_AGELESS - 700) > 40) throw new Error(`Short49Life: "around year seven hundred" but the median is ${MEDIAN_AGELESS.toFixed(0)}`);
  if (H_FROZEN < 0.0008 || H_FROZEN > 0.0012) throw new Error(`Short49Life: "one in a thousand" but h(20) = ${H_FROZEN}`);
  if (LEFT_AGELESS < 300) throw new Error(`Short49Life: "centuries on the line" but only ${LEFT_AGELESS.toFixed(0)} years left`);
  if (aliveCount(survAt(0)) !== ALIVE_500 || aliveCount(survAt(END - 1)) !== ALIVE_500) throw new Error('Short49Life: first and last frame must show the year-500 count');
  if (Math.abs(yrAt(TWENTY_END) - LIFE.freezeAt) > 1e-6) throw new Error('Short49Life: aging must switch off exactly at twenty');
}

// =============================================================================
// THE SHOT — one chart, one crowd. No cuts.
// =============================================================================
const BOX = { x: 150, y: 440, w: 830, h: 540 };
const GRID = { x: 100, y: 1150, cols: 20, cell: 44 };
const CHIP_Y = BOX.y + BOX.h * 0.7;

export default function Short49Life() {
  const f = useCurrentFrame();
  const hk = 1 - prog(f, REW, REW + 10);
  const lp = EASE_INOUT(prog(f, YOUD, LOOP)); // the loop's glide back to the hook

  // punch-in: frame 0 is at 1.06 and settles; the loop grows back to 1.06 so the wrap is seamless
  const scale = f < LOOP ? mix(1.06, 1, EASE_OUT(prog(f, 0, 30))) : mix(1, 1.06, EASE_INOUT(prog(f, LOOP, END - 1)));
  const titleO = f < LOOP ? 1 - prog(f, REW - 4, REW + 6) : EASE_OUT(prog(f, LOOP, LOOP + 12));

  const yr = yrAt(f);
  const ageless = agelessAt(f);
  const s = survAt(f);
  const alive = aliveCount(s);

  // --- overlays on the chart -------------------------------------------------------------------
  const pinO = f < NOW ? hk : EASE_OUT(prog(f, OFF - 2, OFF + 8));
  const medianO = EASE_OUT(prog(f, SEVEN_END - 6, SEVEN_END + 6)) * (1 - lp);
  const riskO = EASE_OUT(prog(f, DOUBLES - 2, DOUBLES + 8)) * (1 - prog(f, NOW - 6, NOW + 2));
  const frozenO = EASE_OUT(prog(f, FREEZES - 2, FREEZES + 8)) * (1 - prog(f, ONLY - 6, ONLY + 2));
  const oldO = EASE_OUT(prog(f, OLD - 2, OLD + 8)) * (1 - prog(f, SO - 6, SO + 2));
  const crashPop = Math.sin(Math.PI * prog(f, CRASHES, CRASHES + 24));
  const sixPop = Math.sin(Math.PI * prog(f, SIX - 2, SIX + 26));
  const deadTint = EASE_OUT(prog(f, ACCIDENTS, ACCIDENTS + 10)) * (1 - lp);

  // --- the stakes: chart dims, two bars ---------------------------------------------------------
  const stakeO = EASE_OUT(prog(f, SO - 2, SO + 10)) * (1 - prog(f, YOUD, YOUD + 12));
  const chartO = mix(1, 0.1, stakeO);
  const agelessFill = EASE_OUT(prog(f, CENTURIES - 6, CENTURIES + 14));
  const centPop = Math.sin(Math.PI * prog(f, CENTURIES, CENTURIES + 24));

  const countColor = ageless && yr > LIFE.freezeAt ? LF.ageless : LF.today;

  return (
    <AbsoluteFill style={{ background: LF.bg }}>
      <ShortsBackdrop base={LF.bg} glow="#16202b" />

      <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: '540px 800px' }}>
        <SurvivalChart
          box={BOX}
          span={spanAt(f)}
          todayTo={todayToAt(f)}
          agelessTo={agelessToAt(f)}
          cursor={yr}
          cursorAgeless={ageless}
          pinO={pinO}
          medianO={medianO}
          opacity={chartO}
          tag="MODEL · GOMPERTZ"
        />

        {/* the crowd: 100 people, each dies at their own survival quantile */}
        <div style={{ position: 'absolute', left: GRID.x, width: GRID.cols * GRID.cell, top: GRID.y - 58, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 24, letterSpacing: 4, color: 'rgba(255,255,255,0.6)' }}>{N_PEOPLE} PEOPLE</span>
          <span
            style={{
              fontFamily: FONT_MONO,
              fontWeight: 700,
              fontSize: 40,
              color: countColor,
              transform: `scale(${1 + 0.08 * Math.max(sixPop, crashPop)})`,
              transformOrigin: 'right center',
              textShadow: sixPop > 0.01 ? `0 0 ${24 * sixPop}px ${countColor}` : undefined,
            }}
          >
            {alive} ALIVE
          </span>
        </div>
        <PeopleGrid x={GRID.x} y={GRID.y} cols={GRID.cols} cell={GRID.cell} s={s} color={countColor} deadTint={deadTint} tintColor={LF.today} />
      </AbsoluteFill>

      {/* chips — the rule of each world, pinned over the chart */}
      <Chip x={BOX.x + 140} y={CHIP_Y} text="RISK ×2 EVERY 8 YEARS" color={LF.today} opacity={riskO} />
      <Chip x={BOX.x + 140} y={CHIP_Y} text="RISK FROZEN · 1 IN 1,000 / YR" color={LF.ageless} opacity={frozenO} />
      <Chip x={BOX.x + 140} y={CHIP_Y} text="DEATHS FROM OLD AGE: 0" color={ACCENT} opacity={oldO} />

      {/* the stakes: what one bad crash costs */}
      {stakeO > 0.01 ? (
        <div style={{ position: 'absolute', inset: 0, opacity: stakeO }}>
          <div style={{ position: 'absolute', left: 70, width: 940, top: BOX.y - 30, height: BOX.h + 60, borderRadius: 24, background: 'rgba(13,17,23,0.94)', border: '1px solid rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: BOX.y + 40, textAlign: 'center', fontFamily: FONT_BODY, fontWeight: 600, fontSize: 28, letterSpacing: 4, color: 'rgba(255,255,255,0.7)' }}>
            EXPECTED YEARS LEFT AT 30
          </div>
          <YearsBar x={110} y={BOX.y + 170} w={860} label="Today" value={`${Math.round(LEFT_TODAY)}`} fill={LEFT_TODAY / LEFT_AGELESS} color={LF.today} />
          <YearsBar
            x={110}
            y={BOX.y + 350}
            w={860}
            label="Ageless"
            value={`~${round10(LEFT_AGELESS * agelessFill).toLocaleString('en-US')}`}
            fill={agelessFill}
            color={LF.ageless}
            glow={centPop}
          />
        </div>
      ) : null}

      {/* the world, named as the narration names it */}
      <Kicker text="Today: aging on" color={LF.today} y={170} at={RIGHT + 2} until={NOW} />
      <Kicker text="Aging: off" color={LF.ageless} y={170} at={NOW} until={OVER} />
      <Kicker text="Five centuries later" color={ACCENT} y={170} at={OVER} until={AND} />
      <Kicker text="What kills you" color={LF.today} y={170} at={AND} until={SO} />
      <Kicker text="What's at stake" color={ACCENT} y={170} at={SO} until={YOUD} />
      <Kicker text="Still mortal" color={LF.ageless} y={170} at={YOUD} until={LOOP} />

      {/* HOOK / LOOP title — the same words on frame 0 and the last frame */}
      <div style={{ position: 'absolute', inset: 0, opacity: titleO }}>
        <BigTitle warm size={84} y={150} lines={[{ text: 'Live for' }, { text: '500 years?', color: ACCENT }]} />
      </div>

      <Captions lines={VO} accent={ACCENT} y={1500} />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
