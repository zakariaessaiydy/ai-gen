import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, ProgressBar, ShortsBackdrop, prog, timeWords } from '../../lib/shorts';
import { Tally } from '../../lib/page';
import {
  AP,
  AutoChart,
  EASE_INOUT,
  EASE_OUT,
  FlipCard,
  Link,
  LinkPulse,
  Pill,
  Plot,
  Schedule,
  autoAt,
  dayReaching,
  hexMix,
  mix,
  tauFor,
} from '../../lib/autopilot';
import { FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short47Autopilot',
  durationInSeconds: 41.6,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = AP.gold;
const F = (s: number) => Math.round(s * 30);
const END = F(41.6);

// every cue is a spoken word — retimes itself when the real voice lands in vo.gen.ts
const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const wAt = (line: number, word: string, nth = 0) => {
  const w = timeWords(VO[line]).filter((x) => key(x.w) === word)[nth];
  if (!w) throw new Error(`Short47Autopilot: no word "${word}" (#${nth}) in VO line ${line} ("${VO[line].text}")`);
  return F(w.start);
};

// =============================================================================
// CUES — all spoken words.
// =============================================================================
const REW = wAt(1, 'most');
const MOTIV = wAt(1, 'motivation');
const DECIDE_CUES = [wAt(2, 'every'), wAt(2, 'day'), wAt(2, 'again')];
const COSTS = wAt(3, 'costs');
const AUTO_W = wAt(4, 'automatic');
const SKIP = wAt(4, 'skip');
const CUE = wAt(5, 'cue');
const PLACE = wAt(5, 'place');
const TIME = wAt(5, 'time');
const AFTER = wAt(5, 'after');
const EVERY = wAt(6, 'every');
const ALONE = wAt(6, 'alone');
const BUT = wAt(7, 'but');
const DAYS21 = wAt(7, 'days');
const STUDY = wAt(8, 'study');
const D66 = wAt(8, '66');
const MISSING = wAt(9, 'missing');
const DIDNT = wAt(9, 'didnt');
const SO = wAt(10, 'so');
const CUE2 = wAt(10, 'cue');
const REPEAT = wAt(10, 'repeat');
const LOOP = Math.min(END - 30, F(VO[10].end + 0.3));

// =============================================================================
// THE HABIT — one schedule, one curve. Day 24 is missed.
// =============================================================================
const PLATEAU = 66; // Lally et al. 2010: median days to 95% of the plateau
const MISSED = 24;
const SCHED: Schedule = { days: PLATEAU, missed: [MISSED] };
const TAU = tauFor(SCHED, PLATEAU);
const PLOT: Plot = { x: 200, y: 850, w: 640, h: 400, maxDay: 70 };

// the run: days 0 → 66 from "Every repeat" to "alone" — slow first days, then it accelerates
const RUN_A = EVERY;
const RUN_B = ALONE + 6;
const RUN_POW = 1.7;
const runDay = (f: number) => PLATEAU * Math.pow(prog(f, RUN_A, RUN_B), RUN_POW);
const dayFrame = (d: number) => RUN_A + (RUN_B - RUN_A) * Math.pow(d / PLATEAU, 1 / RUN_POW);

// the day drawn: the finished habit on the hook, rewound on "Most", re-run on "Every", held after
const REW_LEN = 22;
const dayShown = (f: number) => {
  if (f < REW) return PLATEAU;
  if (f < REW + REW_LEN) return PLATEAU * (1 - EASE_INOUT(prog(f, REW, REW + REW_LEN)));
  if (f < RUN_A) return 0;
  return runDay(f);
};

// decisions in motivation mode: a pulse to the gate per cue, the gate flashes when it lands
const TO_GATE = 9;
const decisionsMade = (f: number) => DECIDE_CUES.filter((c) => f >= c + TO_GATE).length;

// module-load assertions: the VO's claims are the picture's numbers
{
  const at66 = Math.round(autoAt(SCHED, TAU, PLATEAU) * 100);
  if (at66 !== 95) throw new Error(`Short47Autopilot: day 66 must read 95%, got ${at66}`);
  if (dayReaching(SCHED, TAU, 0.95) !== PLATEAU) throw new Error('Short47Autopilot: 95% must first land on day 66');
  if (runDay(DAYS21) < PLATEAU - 1e-6) throw new Error('Short47Autopilot: the run must be finished before "21 days" is struck');
  if (decisionsMade(COSTS) !== 3) throw new Error(`Short47Autopilot: 3 decisions by "costs", got ${decisionsMade(COSTS)}`);
  if (dayFrame(3) - RUN_A < 12) throw new Error('Short47Autopilot: the first days must be individually visible');
}

// =============================================================================
// THE SHOT — one link, one curve. No cuts.
// =============================================================================
const CARD_Y = 390;
const CARD_H = 170;
const LINK_Y = CARD_Y + CARD_H / 2;
const L_CARD = { x: 70, w: 320 };
const R_CARD = { x: 610, w: 310 };

export default function Short47Autopilot() {
  const f = useCurrentFrame();
  const day = dayShown(f);
  const auto = autoAt(SCHED, TAU, day);

  // punch-in: frame 0 is at 1.06 and settles; the loop grows back to 1.06 so the wrap is seamless
  const scale = f < LOOP ? mix(1.06, 1, EASE_OUT(prog(f, 0, 30))) : mix(1, 1.06, EASE_INOUT(prog(f, LOOP, END - 1)));
  const titleO = f < LOOP ? 1 - prog(f, REW - 4, REW + 6) : EASE_OUT(prog(f, LOOP, LOOP + 12));
  const outro = 1 - prog(f, LOOP, LOOP + 12);

  // --- the cue card: CUE on the hook, flipped to MOTIVATION by the rewind, back on "cue" --------
  const flip = f < CUE ? 1 - EASE_INOUT(prog(f, REW + 4, REW + 18)) : EASE_INOUT(prog(f, CUE - 4, CUE + 10));
  const hookOn = 1 - prog(f, REW, REW + 10);
  const placeLit = Math.max(hookOn, prog(f, PLACE, PLACE + 5));
  const timeLit = Math.max(hookOn, prog(f, TIME, TIME + 5));
  const afterLit = Math.max(hookOn, prog(f, AFTER, AFTER + 8));
  const cueGlow = Math.max(0.6 * auto, Math.sin(Math.PI * prog(f, CUE2 - 2, CUE2 + 22)));
  const wobble = 0.5 + 0.32 * Math.sin(f / 6.5) + 0.14 * Math.sin(f / 2.9 + 1);

  // --- the gate: present while automaticity is low -----------------------------------------
  const gate = Math.max(0, 1 - auto / 0.8);
  const gateFlash = DECIDE_CUES.reduce((m, c) => Math.max(m, Math.sin(Math.PI * prog(f, c + TO_GATE - 2, c + TO_GATE + 12))), 0);
  const gateHeat = EASE_OUT(prog(f, COSTS, COSTS + 10)) * (1 - prog(f, SKIP, SKIP + 14));

  // --- pulses ------------------------------------------------------------------------------
  const pulses: LinkPulse[] = [];
  DECIDE_CUES.forEach((c) => {
    const u = prog(f, c, c + TO_GATE);
    if (f >= c && f < c + TO_GATE + 8) pulses.push({ u: 0.5 * EASE_OUT(u), color: AP.pink });
  });
  for (let d = 1; d <= PLATEAU; d++) {
    if (d === MISSED) continue;
    const s = dayFrame(d - 1);
    const u = prog(f, s, s + 12);
    if (u > 0 && u < 1) pulses.push({ u, color: ACCENT });
  }
  [0, 9, 18].forEach((o) => {
    const u = prog(f, REPEAT + o, REPEAT + o + 12);
    if (u > 0 && u < 1) pulses.push({ u, color: ACCENT });
  });
  const habitGlow = Math.max(auto * 0.6, ...pulses.filter((p) => p.color === ACCENT).map((p) => (p.u > 0.85 ? 1 : 0)));

  // --- chart + twist overlays ----------------------------------------------------------------
  const chartO = mix(0.35, 1, Math.max(hookOn, EASE_OUT(prog(f, AUTO_W, SKIP + 8))));
  const m66 = Math.max(hookOn, EASE_OUT(prog(f, D66 - 4, D66 + 8)));
  const m21 = EASE_OUT(prog(f, BUT, BUT + 10)) * outro;
  const strike21 = EASE_OUT(prog(f, DAYS21 + 4, DAYS21 + 14));
  const missPing = Math.sin(Math.PI * prog(f, MISSING, MISSING + 24)) * outro;
  const ghostDraw = EASE_INOUT(prog(f, MISSING + 6, DIDNT - 2));
  const ghostO = 0.9 * (1 - EASE_OUT(prog(f, DIDNT + 2, DIDNT + 16))) * outro;
  const noResetO = EASE_OUT(prog(f, DIDNT + 2, DIDNT + 12)) * (1 - prog(f, SO - 6, SO + 4));
  const citeO = prog(f, STUDY - 4, STUDY + 8) * outro;

  // --- readouts -----------------------------------------------------------------------------
  const inDecide = f >= DECIDE_CUES[0] - 6 && f < AUTO_W;
  const tallyO = 1;
  const dayPop = Math.sin(Math.PI * prog(f, RUN_B - 6, RUN_B + 8));

  return (
    <AbsoluteFill style={{ background: AP.ink }}>
      <ShortsBackdrop glow={hexMix('#1d2430', '#2b2a1c', auto)} />

      <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: '540px 860px' }}>
        {/* THE LINK — cue → (decide?) → habit */}
        <Link x1={L_CARD.x + L_CARD.w} x2={R_CARD.x} y={LINK_Y} auto={auto} gate={gate} gateFlash={gateFlash} gateHeat={gateHeat} pulses={pulses} />
        <FlipCard
          x={L_CARD.x}
          y={CARD_Y}
          w={L_CARD.w}
          h={CARD_H}
          flip={flip}
          glow={flip > 0.5 ? cueGlow : 0}
          front={{
            kicker: 'Motivation',
            main: 'If I feel like it',
            color: AP.pink,
            body: (
              <div style={{ marginTop: 8, height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{ width: `${wobble * 100}%`, height: '100%', background: AP.pink, borderRadius: 6 }} />
              </div>
            ),
          }}
          back={{
            kicker: 'The cue',
            main: 'After coffee',
            color: ACCENT,
            body: (
              <div style={{ display: 'flex', gap: 8, marginTop: 8, opacity: mix(0.6, 1, afterLit) }}>
                <Pill text="same place" lit={placeLit} color={AP.teal} />
                <Pill text="same time" lit={timeLit} color={AP.teal} />
              </div>
            ),
          }}
        />
        <FlipCard
          x={R_CARD.x}
          y={CARD_Y}
          w={R_CARD.w}
          h={CARD_H}
          glow={habitGlow}
          front={{ kicker: 'The habit', main: '10 push-ups', color: hexMix('#9aa4b2', ACCENT, auto) }}
        />

        {/* THE CURVE — automaticity read off the repetitions */}
        <AutoChart
          plot={PLOT}
          s={SCHED}
          tau={TAU}
          upTo={day}
          opacity={chartO}
          color={ACCENT}
          missPing={missPing}
          ghostFrom={MISSED}
          ghostDraw={ghostDraw}
          ghostO={ghostO}
          markers={[
            { day: 21, label: '21 days?', color: AP.pink, opacity: m21, strike: strike21, value: 1, lift: 0 },
            { day: PLATEAU, label: '66 days', color: AP.teal, opacity: m66, value: 1, lift: 0 },
          ]}
        />
        {noResetO > 0.01 ? (
          <div
            style={{
              position: 'absolute',
              left: mix(PLOT.x, PLOT.x + PLOT.w, MISSED / PLOT.maxDay),
              top: PLOT.y + PLOT.h * 0.42,
              transform: `translate(24px, 0) translateY(${(1 - noResetO) * 12}px)`,
              opacity: noResetO,
              fontFamily: FONT_MONO,
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: 2,
              color: AP.ink,
              background: AP.teal,
              borderRadius: 999,
              padding: '8px 20px',
              whiteSpace: 'nowrap',
            }}
          >
            ✓ NO RESET
          </div>
        ) : null}
      </AbsoluteFill>

      {/* readouts — both counted off the same schedule */}
      <Tally
        x={70}
        y={640}
        w={420}
        padLeft={30}
        label={inDecide ? 'Decisions made' : 'Day'}
        value={inDecide ? `×${decisionsMade(f)}` : String(Math.floor(day + 1e-6))}
        color={inDecide ? AP.pink : '#ffffff'}
        opacity={tallyO}
        pop={dayPop + (inDecide ? gateFlash * 0.6 : 0)}
      />
      <Tally
        x={510}
        y={640}
        w={410}
        padLeft={30}
        label="Automatic"
        value={`${Math.round(auto * 100)}%`}
        color={hexMix('#9aa4b2', ACCENT, auto)}
        opacity={tallyO}
        glow={auto > 0.9 ? 1 : 0}
      />

      {citeO > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            left: 70,
            width: 860,
            top: 1350,
            textAlign: 'center',
            opacity: citeO,
            fontFamily: FONT_MONO,
            fontSize: 22,
            letterSpacing: 1,
            color: 'rgba(255,255,255,0.62)',
          }}
        >
          Lally et al. 2010 · median 66 days, range 18–254
        </div>
      ) : null}

      {/* the mode, named as the narration names it */}
      <Kicker text="Motivation mode" color={AP.pink} y={170} at={MOTIV - 4} until={AUTO_W} />
      <Kicker text="Autopilot" color={ACCENT} y={170} at={AUTO_W} until={BUT} />
      <Kicker text="The 21-day myth" color={AP.pink} y={170} at={BUT} until={MISSING} />
      <Kicker text="Missed a day?" color={AP.teal} y={170} at={MISSING} until={SO} />
      <Kicker text="One cue. Repeat." color={ACCENT} y={170} at={SO} until={LOOP} />

      {/* HOOK / LOOP title — the same words on frame 0 and the last frame */}
      <div style={{ position: 'absolute', inset: 0, opacity: titleO }}>
        <BigTitle warm size={80} y={150} lines={[{ text: 'Make habits' }, { text: 'feel automatic', color: ACCENT }]} />
      </div>

      <Captions lines={VO} accent={ACCENT} y={1500} />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
