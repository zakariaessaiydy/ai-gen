import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, Stamp, prog, timeWords } from '../../lib/shorts';
import { EASE_INOUT, EASE_OUT, Formula, PU, Readout, SliceBar, mix, perUse, usd, wholeUses } from '../../lib/peruse';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short43Peruse',
  durationInSeconds: 43.3,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = PU.accent;
const F = (s: number) => Math.round(s * 30);
const END = F(43.3);

// every cue is a spoken word — retimes itself when the real voice lands in vo.gen.ts
const key = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
const wAt = (line: number, word: string, nth = 0) => {
  const w = timeWords(VO[line]).filter((x) => key(x.w) === word)[nth];
  if (!w) throw new Error(`Short43Peruse: no word "${word}" (#${nth}) in VO line ${line} ("${VO[line].text}")`);
  return F(w.start);
};

// =============================================================================
// THE ITEMS — one price each, and the uses it lasts. Every per-use $ is price / slices drawn.
// =============================================================================
const CHEAP = { price: 50, life: 25, label: '$50 BOOTS', color: PU.pink };
const GOOD = { price: 200, life: 400, label: '$200 BOOTS', color: PU.teal };
const GYM = { price: 50, uses: 2, label: 'GYM · 1 MONTH', color: PU.violet };
const TIE = CHEAP.price / CHEAP.life; // $2.00 — the good pair matches it at wear 100

// the script's arithmetic must be the model's arithmetic
if (GOOD.price / TIE !== 100) throw new Error('Short43Peruse: break-even should be wear 100');
if (TIE / (GOOD.price / GOOD.life) !== 4) throw new Error('Short43Peruse: good pair should be 4x cheaper per wear');
if (GYM.price / GYM.uses !== 25) throw new Error('Short43Peruse: gym should be $25 a workout');

// =============================================================================
// THE CUES
// =============================================================================
const REW = wAt(1, 'two');
const REW_END = REW + 20;
const FIFTY = wAt(1, 'fifty');
const TWOH = wAt(1, 'twohundred');
const GRAB = wAt(2, 'grabs');
const QUIZ_FROM = F(VO[3].start) - 4;
const QUIZ_TO = F(VO[4].start) - 3;
const SPLIT = wAt(4, 'split');
const W25_A = wAt(5, 'cheap');
const W25_B = Math.max(W25_A + 30, wAt(5, 'wears'));
const DOLLARS = wAt(6, 'two');
const G100_A = wAt(7, 'hits');
const G100_B = Math.max(G100_A + 20, wAt(7, 'onehundred'));
const G400_A = wAt(8, 'keeps');
const G400_B = Math.max(G400_A + 30, wAt(8, 'fourhundred') + 8);
const CENTS = wAt(8, 'fifty');
const FOURX = wAt(9, 'four');
const TWIST = wAt(10, 'it');
const GYM_IN = TWIST + 14; // arrives as the boots leave — no empty stage
const USED = wAt(11, 'used');
const TWICE = wAt(11, 'twice');
const TWENTY = wAt(12, 'twentyfive');
const PAY = wAt(13, 'price');
const LOOP = Math.min(END - 30, F(VO[13].end + 0.45));
const LOOP_SET = LOOP + 18;

// wears on each pair — the one scalar the bars, cracks and readouts are all drawn from
const ramp = (f: number, a: number, b: number, from: number, to: number) => mix(from, to, EASE_INOUT(prog(f, a, b)));
const wearsCheap = (f: number) => {
  if (f < REW_END) return ramp(f, REW, REW_END, CHEAP.life, 0);
  return ramp(f, W25_A, W25_B, 0, CHEAP.life);
};
const wearsGood = (f: number) => {
  if (f < REW_END) return ramp(f, REW, REW_END, GOOD.life, 0);
  if (f < G100_A) return ramp(f, W25_A, W25_B, 0, CHEAP.life); // worn side by side, day for day
  if (f < G400_A) return ramp(f, G100_A, G100_B, CHEAP.life, GOOD.price / TIE);
  return ramp(f, G400_A, G400_B, GOOD.price / TIE, GOOD.life);
};
const gymUses = (f: number) => (f < USED ? 0 : f < TWICE ? 1 : 2);
// the cheap pair splits when its last wear lands; the rewind heals it
const cracked = (f: number) => (f < REW_END ? 1 - prog(f, REW, REW + 10) : prog(f, W25_B - 2, W25_B + 8));

// =============================================================================
// THE CANVAS — two bars on one baseline, the whole video.
// =============================================================================
const BASE = 1330;
const PX = 3.4; // px per dollar, shared by every bar
const X_CHEAP = 320;
const X_GOOD = 740;
const X_GYM = 540;
const topOf = (price: number) => BASE - price * PX;

const Canvas: React.FC = () => {
  const f = useCurrentFrame();

  // hook punch-in settles 1.06 -> 1; the loop grows it back so frame END == frame 0
  const scale = f < LOOP ? mix(1.06, 1, EASE_OUT(prog(f, 0, 30))) : mix(1, 1.06, EASE_INOUT(prog(f, LOOP_SET, END)));

  const quizDim = 1 - 0.7 * Math.min(prog(f, QUIZ_FROM, QUIZ_FROM + 8), 1 - prog(f, QUIZ_TO - 6, QUIZ_TO));
  const grab = Math.min(prog(f, GRAB, GRAB + 8), 1 - prog(f, SPLIT, SPLIT + 10)); // "everyone grabs the fifty"
  const away = Math.min(prog(f, TWIST, TWIST + 12), 1 - prog(f, PAY + 6, PAY + 18)); // boots step back for the gym
  const bootsO = quizDim * (1 - away); // fully clear: the gym takes the centre column

  const nC = wearsCheap(f);
  const nG = wearsGood(f);
  const brk = cracked(f);

  const tagOf = (price: number, uses: number, life: number, broke: number) => {
    const pu = perUse(price, uses);
    const n = wholeUses(uses);
    if (pu === null) return { label: 'PRICE TAG', value: usd(price, false), sub: 'not worn yet' };
    const sub = `${n} wear${n === 1 ? '' : 's'}${broke > 0.5 ? ' · split' : n >= life ? ' · still going' : ''}`;
    return { label: 'PER WEAR', value: usd(pu), sub };
  };
  const tc = tagOf(CHEAP.price, nC, CHEAP.life, brk);
  const tg = tagOf(GOOD.price, nG, 1e9, 0);

  const pulse = (a: number) => Math.max(0, 1 - Math.abs(f - a - 6) / 14);
  const popC = Math.max(pulse(FIFTY), pulse(DOLLARS), pulse(W25_B));
  const popG = Math.max(pulse(TWOH), pulse(G100_B), pulse(CENTS));

  // the gym: same $50 as the cheap boots, cut into only two slices
  const gymO = Math.min(EASE_OUT(prog(f, GYM_IN - 4, GYM_IN + 10)), 1 - prog(f, PAY - 4, PAY + 6));
  const gymLift = EASE_OUT(prog(f, GYM_IN - 4, GYM_IN + 14));
  const gU = gymUses(f);
  const gPU = perUse(GYM.price, gU);

  return (
    <AbsoluteFill style={{ transform: `scale(${scale})` }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <line x1={150} x2={930} y1={BASE} y2={BASE} stroke={PU.base} strokeWidth={3} opacity={quizDim} />

        <SliceBar x={X_CHEAP} base={BASE} price={CHEAP.price} pxPer={PX} uses={nC} color={CHEAP.color} label={CHEAP.label} broken={brk} opacity={bootsO} />
        <SliceBar x={X_GOOD} base={BASE} price={GOOD.price} pxPer={PX} uses={nG} color={GOOD.color} label={GOOD.label} opacity={bootsO * mix(1, 0.35, grab)} />

        <Readout x={X_CHEAP} bottom={topOf(CHEAP.price) - 26} {...tc} color={CHEAP.color} opacity={bootsO} pop={popC} />
        <Readout x={X_GOOD} bottom={topOf(GOOD.price) - 26} {...tg} color={GOOD.color} opacity={bootsO * mix(1, 0.35, grab)} pop={popG} />

        <SliceBar x={X_GYM} base={BASE} price={GYM.price} pxPer={PX} uses={gU} color={GYM.color} label={GYM.label} lift={gymLift} opacity={gymO} />
        <Readout
          x={X_GYM}
          bottom={topOf(GYM.price) - 26}
          label={gPU === null ? 'PRICE TAG' : 'PER WORKOUT'}
          value={gPU === null ? usd(GYM.price, false) : usd(gPU)}
          sub={`${gU} visit${gU === 1 ? '' : 's'}`}
          color={GYM.color}
          opacity={gymO}
          pop={Math.max(pulse(TWICE), pulse(TWENTY))}
        />
      </svg>
    </AbsoluteFill>
  );
};

// =============================================================================
// THE SHOT
// =============================================================================
const HookTitle: React.FC<{ opacity: number }> = ({ opacity }) => (
  <AbsoluteFill style={{ opacity }}>
    <BigTitle warm y={210} size={80} lines={[{ text: 'The $200 boots' }, { text: 'were the cheap ones', color: PU.teal }]} />
  </AbsoluteFill>
);

export default function Short43Peruse() {
  const f = useCurrentFrame();
  const titleO = f < LOOP ? 1 - prog(f, REW - 4, REW + 6) : EASE_OUT(prog(f, LOOP, LOOP_SET));
  const ruleO = Math.min(EASE_OUT(prog(f, SPLIT, SPLIT + 10)), 1 - prog(f, TWIST - 8, TWIST));
  const payO = Math.min(EASE_OUT(prog(f, PAY + 20, PAY + 32)), 1 - prog(f, LOOP - 4, LOOP + 8));
  return (
    <AbsoluteFill style={{ background: PU.stage }}>
      <ShortsBackdrop base={PU.stage} glow="#1a1f33" />
      <Canvas />
      <HookTitle opacity={titleO} />

      <Formula y={282} opacity={ruleO} parts={[{ t: 'PRICE' }, { t: '÷', color: PU.dim }, { t: 'WEARS', color: ACCENT }]} />
      <Formula
        y={300}
        size={50}
        opacity={payO}
        parts={[{ t: 'COST', color: ACCENT }, { t: '=', color: PU.dim }, { t: 'PRICE' }, { t: '÷', color: PU.dim }, { t: 'USES', color: ACCENT }]}
      />

      {/* beat labels — mounted at the root, so every `at` is a GLOBAL frame */}
      <Kicker text="Two pairs of boots" at={REW_END} until={QUIZ_FROM} />
      <Kicker text="Cost per wear" at={SPLIT} until={TWIST} />
      <Kicker text="It works backwards" color={PU.violet} at={TWIST} until={PAY} />
      <Kicker text="The real price" at={PAY} until={LOOP} />

      <Stamp text="Tie at 100 wears" at={G100_B} until={G400_A} y={440} size={64} rotate={-4} color={ACCENT} />
      <Stamp text="4× cheaper" at={FOURX} until={TWIST} y={440} size={76} rotate={-5} color={PU.teal} />
      <Stamp text="$25 a workout" at={TWENTY} until={PAY} y={440} size={72} rotate={-5} color={PU.pink} />

      {/* QUIZ — the pause gate */}
      <Sequence from={QUIZ_FROM} durationInFrames={QUIZ_TO - QUIZ_FROM}>
        <PauseCard subtitle="$50 or $200 boots?" durSec={(QUIZ_TO - QUIZ_FROM) / 30} y={880} />
      </Sequence>

      {/* GLOBAL — mounted at the root so their time is the video's time, not a scene's. */}
      <Captions lines={VO} accent={ACCENT} y={1500} />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
