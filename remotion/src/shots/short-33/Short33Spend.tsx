import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import {
  BigTitle,
  Captions,
  Kicker,
  PauseCard,
  ProgressBar,
  ShortsBackdrop,
  prog,
  EASE_OUT,
} from '../../lib/shorts';
import {
  Band,
  COHORT,
  ChoiceCard,
  Cohort,
  CohortGeom,
  ColumnReadout,
  EffectBar,
  SourceNote,
  countLeft,
  lerp,
} from '../../lib/choice';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short33Spend',
  durationInSeconds: 40.5,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = '#6366F1'; // indigo — captions / progress / kicker
const BOUGHT = '#e8879f'; // pink — option A, the purchase
const KEPT = '#4db8a8'; // teal — option B, the money kept

const F = (s: number) => Math.round(s * 30);
const END = F(compositionConfig.durationInSeconds); // 1215

// =============================================================================
// THE MODEL — the only authored content. Everything else is read back off it.
// Frederick et al. 2009, Study 1a: 75% bought when option B was blank, 55% when it
// named the opportunity cost. The band that migrates is therefore [55, 75) — twenty
// agents — and "twenty" is BAND.hi - BAND.lo, never typed.
// =============================================================================
const A_BLANK = 75;
const A_FILLED = 55;
const BAND: Band = { lo: A_FILLED, hi: A_BLANK };
const MOVED = BAND.hi - BAND.lo; // 20

// The stimulus's exact wording. The VO says "six words", so the count is asserted.
const FILL_WORDS = ['Keep', 'the', '$14.99', 'for', 'other', 'purchases'];

const MID_X = 540;
const OPEN: CohortGeom = { leftX: 320, rightX: 760, baseline: 1090, cell: 30, cols: 6 };
const TIGHT: CohortGeom = { leftX: 405, rightX: 675, baseline: 640, cell: 14, cols: 6 };

// How spread out the twenty are in time while crossing. At 0.5 half the band is airborne at
// once and the arcs overlap into a smudge; at 0.82 each agent is in flight for ~18% of the
// move, so they read as a stream of individuals — which is the whole point of drawing people.
const STAGGER = 0.82;

// The picture must agree with the paper before a single frame renders.
if (FILL_WORDS.length !== 6) {
  throw new Error(`Short33Spend: VO says "six words" but FILL_WORDS has ${FILL_WORDS.length}`);
}
for (const [label, cross, want] of [['blank', 0, A_BLANK], ['filled', 1, A_FILLED]] as const) {
  const got = countLeft(OPEN, BAND, cross, MID_X, STAGGER);
  if (got !== want) throw new Error(`Short33Spend: cohort ${label} counts ${got}, expected ${want}`);
}
if (countLeft(OPEN, BAND, 0, MID_X, STAGGER) - countLeft(OPEN, BAND, 1, MID_X, STAGGER) !== MOVED) {
  throw new Error(`Short33Spend: the VO says twenty walk away but the band moves ${MOVED}`);
}

// =============================================================================
// CUES — read from the REAL word times in vo.gen.ts, never typed. A missing key throws,
// so a script edit that drops a cue word fails loudly instead of desyncing silently.
// VO lines: 0 hook · 1 setup (the card) · 2 setup (the 75) · 3 quiz ·
//           4 reveal (the words land) · 5 reveal (twenty walk) ·
//           6 twist (outlier) · 7 twist (the pooled effect) · 8 loop (payoff)
// =============================================================================
const key = (w: string) => w.toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9'-]/g, '');
const wAt = (line: number, word: string, edge: 'start' | 'end' = 'start') => {
  const l = VO[line];
  if (!l.words || l.words.length === 0) return F(edge === 'end' ? l.end : l.start);
  const w = l.words.find((x) => key(x.w).startsWith(word));
  if (!w) throw new Error(`Short33Spend: no word "${word}" in VO line ${line} ("${l.text}")`);
  return F(w[edge]);
};
const lineStart = (i: number) => F(VO[i].start);
const lineEnd = (i: number) => F(VO[i].end);

const HOOK_OUT = lineStart(1) - 6;
const SETUP_OUT = lineEnd(2) + 6;
const QUIZ_IN = SETUP_OUT;
const QUIZ_OUT = lineStart(4) - 6;
const REVEAL_IN = QUIZ_OUT;
const REVEAL_OUT = lineEnd(5) + 6;
// The board compacts only once the twist line is actually starting — closing this gap is
// what stops the frame sitting empty between the reveal settling and the first bar.
const TWIST_IN = lineStart(6) - 8;
const LOOP_IN = lineStart(8) - 12;

// THE SIX WORDS EACH LAND ON THEIR OWN SPOKEN WORD. The bracket text and the narration are
// the same sentence, so nothing here is a guess — every word is `wAt` on the word it is.
const FILL_WORD_F = [
  wAt(4, 'keep'),
  wAt(4, 'the'),
  wAt(4, 'fourteen'), // the track says "fourteen ninety-nine", the card shows "$14.99"
  wAt(4, 'for'),
  wAt(4, 'other'),
  wAt(4, 'purchases'),
];
// The twenty cross during line 5 and land on "away"; they walk back and the count reads
// 75 again exactly on "again".
const CROSS_A = lineStart(5);
const CROSS_B = wAt(5, 'away', 'end');
const BACK_A = wAt(8, 'away');
const BACK_B = wAt(8, 'again', 'end');

// =============================================================================
// THE SCALARS — each one is 0 at BOTH f=0 and f=END-1 by construction, which is what
// makes the loop structural rather than choreographed (short-25's rule).
// =============================================================================
// `fill` is "how many words are showing", normalised — ChoiceCard paints word i at
// opacity (fill*n - i), so the SAME scalar writes left-to-right as it rises and backspaces
// right-to-left as it falls. One scalar, both directions (vote.tsx's rule).
const NW = FILL_WORDS.length;
const WORD_IN = 6;
const fillAt = (f: number): number => {
  if (f < FILL_WORD_F[0]) return 0;
  if (f < BACK_A) {
    let v = 0;
    for (let i = 0; i < NW; i++) v += EASE_OUT(prog(f, FILL_WORD_F[i], FILL_WORD_F[i] + WORD_IN));
    return v / NW;
  }
  const step = Math.max(2, Math.floor((BACK_B - BACK_A) / NW));
  let v = 0;
  for (let i = 0; i < NW; i++) {
    const a = BACK_A + (NW - 1 - i) * step;
    v += 1 - EASE_OUT(prog(f, a, a + WORD_IN));
  }
  return v / NW;
};

const crossAt = (f: number): number => {
  if (f < CROSS_A) return 0;
  if (f < CROSS_B) return prog(f, CROSS_A, CROSS_B);
  if (f < BACK_A) return 1;
  if (f < BACK_B) return 1 - prog(f, BACK_A, BACK_B);
  return 0;
};

const COMPACT_DUR = 16;
const compactAt = (f: number): number => {
  if (f < TWIST_IN) return 0;
  if (f < TWIST_IN + COMPACT_DUR) return EASE_OUT(prog(f, TWIST_IN, TWIST_IN + COMPACT_DUR));
  if (f < LOOP_IN) return 1;
  if (f < LOOP_IN + COMPACT_DUR) return 1 - EASE_OUT(prog(f, LOOP_IN, LOOP_IN + COMPACT_DUR));
  return 0;
};

// Attention on the empty bracket while the setup names it. A SINE of the phase, not the
// phase itself (short-13's bug), and zero outside the setup window, so it cannot drift.
const pulseAt = (f: number): number => {
  if (f < HOOK_OUT || f > QUIZ_IN) return 0;
  const ramp = Math.min(prog(f, HOOK_OUT, HOOK_OUT + 12), 1 - prog(f, QUIZ_IN - 12, QUIZ_IN));
  return ramp * (0.5 + 0.5 * Math.sin((f - HOOK_OUT) * 0.16));
};

// =============================================================================
// THE CANVAS — the card and the cohort. ONE persistent component on GLOBAL time whose
// timeline evolves: full size for hook/setup/quiz/reveal, compacted to a top recap for
// the twist (freeing the frame for the EffectBars), expanded back before the loop closes.
// =============================================================================
const Board: React.FC = () => {
  const f = useCurrentFrame(); // GLOBAL — no <Sequence> around this component
  const fill = fillAt(f);
  const cross = crossAt(f);
  const compact = compactAt(f);

  const geom: CohortGeom = {
    leftX: lerp(OPEN.leftX, TIGHT.leftX, compact),
    rightX: lerp(OPEN.rightX, TIGHT.rightX, compact),
    baseline: lerp(OPEN.baseline, TIGHT.baseline, compact),
    cell: lerp(OPEN.cell, TIGHT.cell, compact),
    cols: OPEN.cols,
  };

  // COUNTED off the dots actually rendered this frame — the readout ticks because bodies
  // cross the midline, not because a number was keyframed.
  const nLeft = countLeft(geom, BAND, cross, MID_X, STAGGER);
  const nRight = COHORT - nLeft;

  const readoutY = lerp(1120, 670, compact);
  const readoutSize = lerp(40, 24, compact);

  return (
    <AbsoluteFill>
      <ChoiceCard
        y={lerp(380, 150, compact)}
        scale={lerp(1, 0.6, compact)}
        optionA="Buy this entertaining video"
        priceA="$14.99"
        optionB="Not buy this entertaining video"
        fillWords={FILL_WORDS}
        fill={fill}
        colorA={BOUGHT}
        colorB={KEPT}
        pulse={pulseAt(f)}
      />
      <Cohort geom={geom} band={BAND} cross={cross} colorA={BOUGHT} colorB={KEPT} r={lerp(11, 5, compact)} stagger={STAGGER} />
      <ColumnReadout x={geom.leftX} y={readoutY} n={nLeft} label="bought it" color={BOUGHT} size={readoutSize} />
      <ColumnReadout x={geom.rightX} y={readoutY} n={nRight} label="kept it" color={KEPT} size={readoutSize} />
    </AbsoluteFill>
  );
};

const TITLE = [{ text: 'YOU NEVER' }, { text: 'CHOSE IT', color: BOUGHT }];
const SUBTITLE = 'it only beat nothing';

// =============================================================================
// THE SHOT
// =============================================================================
export default function Short33Spend() {
  return (
    <AbsoluteFill style={{ background: '#0f1216' }}>
      <ShortsBackdrop />

      {/* The canvas runs on global time under every beat — the continuity IS the video. */}
      <Board />

      {/* HOOK — frame 0 fully composed: blank option B, 75 bought, 25 kept. */}
      <Sequence from={0} durationInFrames={HOOK_OUT}>
        <BigTitle warm lines={TITLE} subtitle={SUBTITLE} y={150} size={70} />
      </Sequence>

      {/* SETUP — the blank is named, and it breathes. */}
      <Sequence from={HOOK_OUT} durationInFrames={SETUP_OUT - HOOK_OUT}>
        <Kicker text="EVERY PURCHASE IS THIS CARD" at={0} />
      </Sequence>

      {/* QUIZ — the gate. Sits on the READOUTS, never on the card the viewer must read. */}
      <Sequence from={QUIZ_IN} durationInFrames={QUIZ_OUT - QUIZ_IN}>
        <PauseCard
          subtitle={`how many of the ${COHORT} change their mind?`}
          durSec={(QUIZ_OUT - QUIZ_IN) / 30}
          y={230}
          accent={ACCENT}
        />
      </Sequence>

      {/* TWIST — the cohort is a top recap; the honest size of the effect fills the frame. */}
      <Sequence from={TWIST_IN} durationInFrames={LOOP_IN - TWIST_IN}>
        <EffectBar
          x={90}
          y={800}
          w={900}
          label="That one experiment, 2009"
          sub={`N = 150 students · ${A_BLANK}% → ${A_FILLED}%`}
          lo={0.45}
          hi={0.85}
          axisMax={1.0}
          color={BOUGHT}
          at={wAt(6, 'experiment') - TWIST_IN}
        />
        <EffectBar
          x={90}
          y={980}
          w={900}
          label="39 experiments, pooled"
          sub="N = 12,093 · 5 countries · published + unpublished"
          value={0.22}
          axisMax={1.0}
          color={KEPT}
          at={wAt(7, 'studies') - TWIST_IN}
        />
        <SourceNote
          y={1150}
          text="Frederick et al. 2009, J. Consumer Research 36(4) — Maguire 2023, J. Economic Science Association. Effect sizes as Cohen's d."
          at={wAt(7, 'smaller') - TWIST_IN}
        />
      </Sequence>

      {/* LOOP — the words erase, the twenty walk back, and 75 is frame 0 again. */}
      <Sequence from={LOOP_IN} durationInFrames={END - LOOP_IN}>
        <BigTitle lines={TITLE} subtitle={SUBTITLE} y={150} size={70} />
      </Sequence>

      {/* GLOBAL — mounted at the root so their time is the video's time, not a scene's. */}
      <Captions lines={VO} accent={ACCENT} y={1345} size={54} maxWords={3} />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
