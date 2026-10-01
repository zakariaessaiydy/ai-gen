import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog, timeWords } from '../../lib/shorts';
import {
  AWAKE,
  DEEP,
  EASE_INOUT,
  EASE_OUT,
  HY,
  Hypnogram,
  LIGHT,
  Lane,
  Plot,
  REM,
  Seg,
  clamp01,
  cycles,
  dy,
  hoursIn,
  hx,
  mix,
  spikes,
} from '../../lib/hypno';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short44Wake',
  durationInSeconds: 44,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = HY.warn;
const F = (s: number) => Math.round(s * 30);
const END = F(44);

// every cue is a spoken word — retimes itself when the real voice lands in vo.gen.ts
const key = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
const wAt = (line: number, word: string, nth = 0) => {
  const w = timeWords(VO[line]).filter((x) => key(x.w) === word)[nth];
  if (!w) throw new Error(`Short44Wake: no word "${word}" (#${nth}) in VO line ${line} ("${VO[line].text}")`);
  return F(w.start);
};

// =============================================================================
// THE NIGHT — lights-out 22:30, ~90-minute cycles, so the boundaries land on 00:00, 01:30,
// 03:00, 04:30, 06:00. Schematic: deep sleep only in the first two cycles, REM lengthening
// toward morning. `worry` (hours) stretches the 03:00 awakening into the light sleep after it.
// =============================================================================
const LIGHTS_OUT = 22 * 60 + 30;
const THREE_AM = 4.5; // hours after lights-out
const night = (worry = 0): Seg[] => [
  { a: 0, b: 0.1, s: AWAKE },
  { a: 0.1, b: 0.35, s: LIGHT },
  { a: 0.35, b: 1.05, s: DEEP },
  { a: 1.05, b: 1.28, s: LIGHT },
  { a: 1.28, b: 1.47, s: REM },
  { a: 1.47, b: 1.53, s: AWAKE },
  { a: 1.53, b: 1.8, s: LIGHT },
  { a: 1.8, b: 2.4, s: DEEP },
  { a: 2.4, b: 2.72, s: LIGHT },
  { a: 2.72, b: 2.97, s: REM },
  { a: 2.97, b: 3.03, s: AWAKE },
  { a: 3.03, b: 3.95, s: LIGHT },
  { a: 3.95, b: 4.46, s: REM },
  { a: 4.46, b: 4.56 + worry, s: AWAKE },
  { a: 4.56 + worry, b: 5.2, s: LIGHT },
  { a: 5.2, b: 5.97, s: REM },
  { a: 5.97, b: 6.03, s: AWAKE },
  { a: 6.03, b: 6.75, s: LIGHT },
  { a: 6.75, b: 7.47, s: REM },
  { a: 7.47, b: 7.53, s: AWAKE },
  { a: 7.53, b: 8, s: LIGHT },
];
const NIGHT = night();
const WORRY_MAX = 0.6;
const isThree = (g: Seg) => g.a <= THREE_AM && g.b + 0.05 >= THREE_AM;

// everything the VO claims, checked against the model it is drawn from
const DEEP_BEFORE = hoursIn(NIGHT, DEEP, -Infinity, THREE_AM) / hoursIn(NIGHT, DEEP);
const CYC = cycles(NIGHT);
if (spikes(NIGHT).filter(isThree).length !== 1) throw new Error('Short44Wake: exactly one spike must sit at 03:00');
if (Math.abs(CYC[1].b - CYC[0].b - 1.5) > 0.1) throw new Error('Short44Wake: cycles should be ~90 min');
if (spikes(night(WORRY_MAX)).length !== spikes(NIGHT).length) throw new Error('Short44Wake: worry must not eat a segment');

// sleep pressure (Process S) decays exponentially in sleep, tau ~4.2 h (Daan, Beersma & Borbely 1984)
const pressure = (t: number) => Math.exp(-t / 4.2);
// cortisol: flat low through the first half, climbing from ~02:00 toward its post-waking peak
const cortisol = (t: number) => 0.1 + 0.84 * Math.pow(clamp01((t - 3.5) / 5), 1.5);

// =============================================================================
// THE CUES
// =============================================================================
const REW = wAt(1, 'sleep');
const REW_END = REW + 16;
const NINETY = wAt(1, 'ninety');
const SURFACE1 = wAt(2, 'surface');
const BRIEFLY = wAt(2, 'briefly');
const FORGET = wAt(3, 'forget');
const QUIZ_FROM = F(VO[4].start) - 2;
const QUIZ_TO = wAt(5, 'one') - 2;
const ONE = wAt(5, 'one');
const DEEP_AT = wAt(5, 'deep');
const EARLY = wAt(5, 'early');
const TWO = wAt(6, 'two');
const PRESS = wAt(6, 'sleep');
const DRAINED = wAt(6, 'drained');
const THREE = wAt(7, 'three');
const CORT = wAt(7, 'cortisol');
const RISING = wAt(7, 'rising');
const SURF = wAt(8, 'surface');
const HIGHER = wAt(8, 'higher');
const WAKING = wAt(9, 'waking');
const CLOCK = wAt(9, 'clock');
const WORRY = wAt(10, 'worry');
const UP = wAt(10, 'up');
const DONT = wAt(10, 'dont');
const LOOP = Math.min(END - 30, F(VO[10].end + 0.3));
const LOOP_SET = LOOP + 10;

// the pen: hours of the night drawn
const pen = (f: number) => {
  if (f < REW) return 8;
  if (f < REW_END) return 8 * (1 - EASE_INOUT(prog(f, REW, REW_END)));
  if (f < BRIEFLY) return 1.58 * EASE_INOUT(prog(f, REW_END + 4, SURFACE1 + 4));
  return mix(1.58, 8, EASE_INOUT(prog(f, BRIEFLY, FORGET - 4)));
};
const worry = (f: number) =>
  WORRY_MAX * Math.min(EASE_INOUT(prog(f, WORRY, UP + 8)), 1 - EASE_INOUT(prog(f, DONT, DONT + 24)));

// =============================================================================
// THE CANVAS
// =============================================================================
const P: Plot = { x: 160, y: 590, w: 760, h: 480, t0: 0, t1: 8 };
const TICKS = [0, 1.5, 3, 4.5, 6, 7.5];
const LANE1_Y = 1150;
const LANE2_Y = 1284;
const LANE_H = 116;

const Canvas: React.FC = () => {
  const f = useCurrentFrame();
  const pn = pen(f);
  const w = worry(f);
  const segs = night(w);
  const x3 = hx(P, THREE_AM);

  // hook punch-in settles 1.06 -> 1; the loop grows it back so frame END == frame 0
  const scale = f < LOOP ? mix(1.06, 1, EASE_OUT(prog(f, 0, 30))) : mix(1, 1.06, EASE_INOUT(prog(f, LOOP, END - 1)));

  const quizDim = 1 - 0.6 * Math.min(prog(f, QUIZ_FROM, QUIZ_FROM + 8), 1 - prog(f, QUIZ_TO - 6, QUIZ_TO));
  // "which one you remember": outside the redraw, 03:00 is the only lit spike
  const singled = f < REW || f >= FORGET ? 1 : 0;
  const pickK = f < REW ? 1 : f >= LOOP ? 1 : EASE_OUT(prog(f, FORGET, FORGET + 12));
  const spikeStyle = (g: Seg) => {
    const passing = 1 - clamp01(Math.abs(pn - g.b) / 0.25); // flares as the pen crosses it
    if (isThree(g)) {
      const k = singled * pickK;
      return { color: k > 0.5 ? HY.wake : HY.text, alpha: 1, glow: Math.max(k, passing * 0.6) };
    }
    return { color: HY.text, alpha: mix(1, 0.28, singled * pickK), glow: passing * 0.6 * (1 - singled) };
  };

  const deepFill = Math.min(EASE_OUT(prog(f, DEEP_AT, DEEP_AT + 20)), 1 - prog(f, WAKING, WAKING + 15));
  const floor = Math.min(prog(f, SURF, HIGHER + 24), 1 - prog(f, WAKING, WAKING + 15));
  const tip = Math.min(prog(f, REW_END, REW_END + 6), 1 - prog(f, FORGET + 4, FORGET + 14));

  const lanesOut = 1 - prog(f, LOOP, LOOP_SET);
  const laneDim = mix(1, 0.3, prog(f, WAKING, WAKING + 15));
  const lane1 = EASE_OUT(prog(f, TWO, TWO + 10)) * lanesOut * laneDim * quizDim;
  const lane2 = EASE_OUT(prog(f, THREE, THREE + 10)) * lanesOut * laneDim;
  const guide = Math.min(prog(f, QUIZ_TO, QUIZ_TO + 10), 1 - prog(f, LOOP, LOOP_SET));

  // the 03:00 tag in the hook/loop; the clock chip in the twist
  const tagO = f < REW ? 1 - prog(f, REW - 4, REW + 4) : prog(f, LOOP, LOOP_SET);
  const clockO = Math.min(EASE_OUT(prog(f, CLOCK, CLOCK + 10)), 1 - prog(f, DONT + 4, DONT + 16));
  const worryO = clamp01(w / 0.25) * clockO;
  const floorRise = CYC.findIndex((c, i) => i > 0 && c.floor < CYC[i - 1].floor);

  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: '50% 45%' }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {/* the 03:00 guide through chart and lanes */}
        {guide > 0.01 && (
          <line x1={x3} x2={x3} y1={P.y - 20} y2={LANE2_Y + LANE_H + 10} stroke={HY.wake} strokeWidth={3} strokeDasharray="6 10" opacity={0.55 * guide} />
        )}

        <Hypnogram
          id="night"
          p={P}
          segs={segs}
          pen={pn}
          startMin={LIGHTS_OUT}
          ticks={TICKS}
          hot={THREE_AM}
          deepFill={deepFill}
          floor={floor}
          spikeStyle={spikeStyle}
          dim={quizDim}
          tip={tip}
        />

        {/* ~90 min bracket over the first cycle */}
        {(() => {
          const o = Math.min(EASE_OUT(prog(f, NINETY, NINETY + 10)), 1 - prog(f, FORGET, FORGET + 10));
          if (o <= 0.01) return null;
          const xa = hx(P, 0.02);
          const xb = hx(P, CYC[0].b + 0.03);
          const y = P.y - 46;
          return (
            <g opacity={o}>
              <path d={`M${xa},${y + 14}L${xa},${y}L${xb},${y}L${xb},${y + 14}`} fill="none" stroke={HY.warn} strokeWidth={4} />
              <text x={(xa + xb) / 2} y={y - 16} textAnchor="middle" fontFamily={FONT_MONO} fontWeight={700} fontSize={30} fill={HY.warn}>
                ≈ 90 MIN
              </text>
            </g>
          );
        })()}

        {/* the floor steps up at 03:00 */}
        {floorRise > 0 && (() => {
          const o = Math.min(EASE_OUT(prog(f, HIGHER, HIGHER + 12)), 1 - prog(f, WAKING, WAKING + 15));
          if (o <= 0.01) return null;
          const c = CYC[floorRise];
          return (
            <text x={hx(P, c.a) + 14} y={dy(P, c.floor) + 62} fontFamily={FONT_BODY} fontWeight={700} fontSize={28} letterSpacing={2} fill={HY.floor} opacity={o}>
              FLOOR RISES ↑
            </text>
          );
        })()}

        {/* the worry stretch label */}
        {worryO > 0.01 && (
          <text x={hx(P, 4.51 + w / 2)} y={dy(P, 0.62)} textAnchor="middle" fontFamily={FONT_BODY} fontWeight={700} fontSize={28} letterSpacing={3} fill={HY.wake} opacity={worryO}>
            WORRY
          </text>
        )}

        <Lane
          id="press"
          p={P}
          y={LANE1_Y}
          h={LANE_H}
          label="SLEEP PRESSURE"
          color={HY.rem}
          fn={pressure}
          draw={EASE_INOUT(prog(f, PRESS, DRAINED + 6))}
          markT={THREE_AM}
          mark={EASE_OUT(prog(f, DRAINED, DRAINED + 10))}
          read={(v) => `${Math.round(v * 100)}% left`}
          opacity={lane1}
        />
        <Lane
          id="cort"
          p={P}
          y={LANE2_Y}
          h={LANE_H}
          label="CORTISOL"
          color={HY.warn}
          fn={cortisol}
          draw={EASE_INOUT(prog(f, CORT, RISING + 16))}
          markT={THREE_AM}
          mark={EASE_OUT(prog(f, RISING, RISING + 10))}
          read={() => 'rising ↑'}
          opacity={lane2}
        />
      </svg>

      {/* 03:00 tag — hook and loop */}
      {tagO > 0.01 && <Tag x={x3} y={P.y - 64} opacity={tagO} text="03:00" sub="awake" />}
      {/* the clock you check */}
      {clockO > 0.01 && <ClockChip x={x3} y={P.y - 70} opacity={clockO} text={`03:${String(4 + Math.round(w * 60)).padStart(2, '0')}`} />}

      {/* ONE: the deep-sleep share, computed from the segments */}
      {(() => {
        const o = Math.min(EASE_OUT(prog(f, EARLY, EARLY + 10)), 1 - prog(f, TWO - 4, TWO + 6));
        if (o <= 0.01) return null;
        return (
          <div style={{ position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 52, color: HY.text, textAlign: 'center', lineHeight: 1.15 }}>
              <span style={{ color: HY.deep }}>{Math.round(DEEP_BEFORE * 100)}%</span> of deep sleep
              <br />
              is over by <span style={{ color: HY.wake }}>3 AM</span>
            </div>
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};

const Tag: React.FC<{ x: number; y: number; opacity: number; text: string; sub: string }> = ({ x, y, opacity, text, sub }) => (
  <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', opacity, display: 'flex', alignItems: 'baseline', gap: 12, padding: '10px 22px', borderRadius: 999, background: 'rgba(12,14,20,0.9)', border: `2px solid ${HY.wake}88`, whiteSpace: 'nowrap' }}>
    <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 34, color: HY.wake }}>{text}</span>
    <span style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 24, letterSpacing: 2, color: HY.dim, textTransform: 'uppercase' }}>{sub}</span>
  </div>
);

const ClockChip: React.FC<{ x: number; y: number; opacity: number; text: string }> = ({ x, y, opacity, text }) => (
  <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${0.9 + 0.1 * opacity})`, opacity, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', borderRadius: 18, background: 'rgba(12,14,20,0.94)', border: `2px solid ${HY.wake}`, boxShadow: `0 0 40px ${HY.wake}55`, whiteSpace: 'nowrap' }}>
    <svg width={40} height={40} viewBox="0 0 40 40">
      <circle cx={20} cy={20} r={16} fill="none" stroke={HY.wake} strokeWidth={4} />
      <line x1={20} y1={20} x2={20} y2={10} stroke={HY.wake} strokeWidth={4} strokeLinecap="round" />
      <line x1={20} y1={20} x2={27} y2={23} stroke={HY.wake} strokeWidth={4} strokeLinecap="round" />
    </svg>
    <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 40, color: HY.text }}>{text}</span>
  </div>
);

// =============================================================================
// THE SHOT
// =============================================================================
const HookTitle: React.FC<{ opacity: number }> = ({ opacity }) => (
  <AbsoluteFill style={{ opacity }}>
    <BigTitle warm y={200} lines={[{ text: 'Why do you wake' }, { text: 'at 3 AM?', color: HY.wake }]} />
  </AbsoluteFill>
);

export default function Short44Wake() {
  const f = useCurrentFrame();
  const titleO = f < LOOP ? 1 - prog(f, REW - 4, REW + 6) : EASE_OUT(prog(f, LOOP, LOOP_SET));
  return (
    <AbsoluteFill style={{ background: HY.stage }}>
      <ShortsBackdrop base={HY.stage} glow="#161a2e" />
      <Canvas />
      <HookTitle opacity={titleO} />

      {/* beat labels — mounted at the root, so every `at` is a GLOBAL frame */}
      <Kicker text="One night of sleep" at={REW_END} until={FORGET} />
      <Kicker text="You forget these" color={HY.dim} at={FORGET} until={QUIZ_FROM} />
      <Kicker text="1 · Deep sleep is done" color={HY.deep} at={ONE} until={TWO} />
      <Kicker text="2 · Pressure drained" color={HY.rem} at={TWO} until={THREE} />
      <Kicker text="3 · Cortisol rising" color={HY.warn} at={THREE} until={SURF} />
      <Kicker text="Closer to the surface" color={HY.floor} at={SURF} until={WAKING} />
      <Kicker text="Waking is normal" color={HY.floor} at={WAKING} until={CLOCK - 4} />
      <Kicker text="The clock is the problem" color={HY.wake} at={CLOCK - 4} until={LOOP} />

      {/* QUIZ — the pause gate */}
      <Sequence from={QUIZ_FROM} durationInFrames={QUIZ_TO - QUIZ_FROM}>
        <PauseCard subtitle="why this one?" durSec={(QUIZ_TO - QUIZ_FROM) / 30} y={1260} accent={HY.wake} />
      </Sequence>

      {/* GLOBAL — mounted at the root so their time is the video's time, not a scene's. */}
      <Captions lines={VO} accent={ACCENT} y={1500} />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
