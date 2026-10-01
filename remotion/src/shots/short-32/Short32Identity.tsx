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
  CompareBar,
  IdentityLabel,
  Side,
  TallyReadout,
  VoteStack,
  leaderOf,
  voteSeries,
} from '../../lib/vote';
import { FONT_BODY } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short32Identity',
  durationInSeconds: 37.0,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = '#6366F1'; // indigo — captions/progress/kicker
const LEFT_COLOR = '#e8879f'; // pink — the identity being left behind
const RIGHT_COLOR = '#4db8a8'; // teal — the identity being built

const F = (s: number) => Math.round(s * 30);
const END = F(compositionConfig.durationInSeconds); // 1200

// The only authored content the whole video runs on: a week of small actions.
// Mon, Tue = skip. Wed..Sun = run. Every count on screen is voteSeries() read at some index.
const SCHEDULE: Side[] = ['left', 'left', 'right', 'right', 'right', 'right', 'right'];
const TALLY = voteSeries(SCHEDULE); // TALLY[7] = { left: 2, right: 5 }

// =============================================================================
// CUES — read from the REAL word times in vo.gen.ts, never typed. A key not in its line
// throws, so a script edit that drops a cue word fails loudly instead of landing silently.
// VO lines: 0 hook · 1 setup (mechanic) · 2 setup (mon/tue) · 3 quiz · 4 reveal ·
//           5 twist (favor) · 6 twist (percentages) · 7 twist (thesis) · 8 loop (payoff)
// =============================================================================
const key = (w: string) => w.toLowerCase().replace(/’/g, "'").replace(/[^a-z0-9'-]/g, '');
const wAt = (line: number, word: string, edge: 'start' | 'end' = 'start') => {
  const l = VO[line];
  if (!l.words || l.words.length === 0) return F(l.start);
  const w = l.words.find((x) => key(x.w).startsWith(word));
  if (!w) throw new Error(`Short32Identity: no word "${word}" in VO line ${line} ("${l.text}")`);
  return F(w[edge]);
};
const lineStart = (i: number) => F(VO[i].start);
const lineEnd = (i: number) => F(VO[i].end);

const HOOK_OUT = lineStart(1) - 6;
const SETUP_OUT = lineEnd(2) + 6;
const QUIZ_IN = SETUP_OUT;
const QUIZ_OUT = lineStart(4) - 6;
const REVEAL_IN = QUIZ_OUT;
const REVEAL_OUT = lineEnd(4) + 6;
const TWIST_IN = REVEAL_OUT;
const LOOP_IN = lineStart(8) - 6;

// The seven vote-landing frames, in schedule order — read off the words that name them.
const LAND = [
  wAt(2, 'monday'),
  wAt(2, 'tuesday'),
  wAt(4, 'wednesday'),
  wAt(4, 'thursday'),
  wAt(4, 'friday'),
  wAt(4, 'flip'),
  wAt(4, 'sunday'),
];
const REWIND_END = LAND[0] - 10;
const LAND_DUR = 10;

// A single continuous scalar drives both directions: rising, it casts votes in schedule
// order; falling (the rewind), it un-casts them in the exact reverse order — the same
// interpolation between adjacent cumulative states either way. Nothing is animated twice.
const revealCountAt = (f: number): number => {
  if (f <= HOOK_OUT) return SCHEDULE.length;
  if (f < REWIND_END) return SCHEDULE.length * (1 - EASE_OUT(prog(f, HOOK_OUT, REWIND_END)));
  for (let i = 0; i < LAND.length; i++) {
    if (f < LAND[i]) return i + EASE_OUT(prog(f, LAND[i] - LAND_DUR, LAND[i]));
  }
  return LAND.length;
};

const COMPACT_DUR = 14;
const compactAt = (f: number): number => {
  if (f < TWIST_IN) return 0;
  if (f < TWIST_IN + COMPACT_DUR) return EASE_OUT(prog(f, TWIST_IN, TWIST_IN + COMPACT_DUR));
  if (f < LOOP_IN) return 1;
  if (f < LOOP_IN + COMPACT_DUR) return 1 - EASE_OUT(prog(f, LOOP_IN, LOOP_IN + COMPACT_DUR));
  return 0;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// =============================================================================
// THE CANVAS — the ledger. ONE persistent component whose timeline evolves: full-size for
// hook/setup/quiz/reveal, shrunk to a top recap for twist (freeing the frame for the
// CompareBars) and expanded back before the loop closes, so frame END-1 matches frame 0.
// =============================================================================
const Ledger: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame() + from; // GLOBAL frame
  const revealCount = revealCountAt(f);
  const compact = compactAt(f);

  const base = Math.min(SCHEDULE.length, Math.floor(revealCount));
  const landing = revealCount - base;
  const counts = TALLY[base];
  const leftCount = counts.left;
  const rightCount = counts.right;
  // The next chip about to land/un-land belongs to schedule[base] — it's added on top of
  // the count for its own side, not the other one.
  const nextSide = SCHEDULE[Math.min(SCHEDULE.length - 1, base)];
  const leftLanding = nextSide === 'left' ? landing : 0;
  const rightLanding = nextSide === 'right' ? landing : 0;
  const leader = leaderOf(counts);

  const labelY = lerp(560, 300, compact);
  const baseline = lerp(1120, 540, compact);
  const chipW = lerp(176, 62, compact);
  const gap = lerp(12, 4, compact);
  const dx = lerp(320, 130, compact);
  const tallyY = lerp(1175, 610, compact);
  const labelSize = lerp(48, 22, compact);
  const underOpacity = 1 - compact;

  return (
    <AbsoluteFill>
      <IdentityLabel
        x={540}
        y={labelY}
        leftText="A SKIPPER"
        rightText="A RUNNER"
        neutralText="UNDECIDED"
        leader={leader}
        leftColor={LEFT_COLOR}
        rightColor={RIGHT_COLOR}
        size={labelSize}
      />
      <VoteStack x={540 - dx} baseline={baseline} count={leftCount} landing={leftLanding} color={LEFT_COLOR} chipW={chipW} gap={gap} />
      <VoteStack x={540 + dx} baseline={baseline} count={rightCount} landing={rightLanding} color={RIGHT_COLOR} chipW={chipW} gap={gap} />
      <div
        style={{
          position: 'absolute',
          left: 540 - dx,
          top: baseline + 28,
          transform: 'translateX(-50%)',
          fontFamily: FONT_BODY,
          fontWeight: 600,
          fontSize: lerp(30, 16, compact),
          letterSpacing: 3,
          color: LEFT_COLOR,
          opacity: underOpacity,
        }}
      >
        SKIPS
      </div>
      <div
        style={{
          position: 'absolute',
          left: 540 + dx,
          top: baseline + 28,
          transform: 'translateX(-50%)',
          fontFamily: FONT_BODY,
          fontWeight: 600,
          fontSize: lerp(30, 16, compact),
          letterSpacing: 3,
          color: RIGHT_COLOR,
          opacity: underOpacity,
        }}
      >
        RUNS
      </div>
      <TallyReadout x={540} y={tallyY} left={leftCount} right={rightCount} leftColor={LEFT_COLOR} rightColor={RIGHT_COLOR} size={lerp(34, 22, compact)} />
    </AbsoluteFill>
  );
};

const TITLE = [{ text: 'ONE MORE VOTE' }, { text: 'CHANGES THE COUNT', color: RIGHT_COLOR }];
const SUBTITLE = 'become who you act like';

// =============================================================================
// THE SHOT
// =============================================================================
export default function Short32Identity() {
  return (
    <AbsoluteFill style={{ background: '#0f1216' }}>
      <ShortsBackdrop />

      {/* HOOK — frame 0 fully composed: the finished ledger, 2-5, "A RUNNER". */}
      <Sequence from={0} durationInFrames={HOOK_OUT}>
        <Ledger from={0} />
        <BigTitle warm lines={TITLE} subtitle={SUBTITLE} />
      </Sequence>

      {/* SETUP — the ledger rewinds to empty, then Monday/Tuesday cast the first two votes. */}
      <Sequence from={HOOK_OUT} durationInFrames={SETUP_OUT - HOOK_OUT}>
        <Ledger from={HOOK_OUT} />
        <Kicker text="EVERY DAY, A VOTE" at={4} />
      </Sequence>

      {/* QUIZ — the pause gate, frozen at 2-0. */}
      <Sequence from={QUIZ_IN} durationInFrames={QUIZ_OUT - QUIZ_IN}>
        <Ledger from={QUIZ_IN} />
        <PauseCard subtitle="which side wins by Sunday?" durSec={(QUIZ_OUT - QUIZ_IN) / 30} y={780} />
      </Sequence>

      {/* REVEAL — five RUN votes land; the label flips the instant the majority does. */}
      <Sequence from={REVEAL_IN} durationInFrames={REVEAL_OUT - REVEAL_IN}>
        <Ledger from={REVEAL_IN} />
      </Sequence>

      {/* TWIST — the ledger shrinks to a recap; the real evidence for the mechanism. */}
      <Sequence from={TWIST_IN} durationInFrames={LOOP_IN - TWIST_IN}>
        <Ledger from={TWIST_IN} />
        <Kicker text="THE PROOF" at={4} until={LOOP_IN - TWIST_IN - 10} />
        <CompareBar
          x={130}
          y={720}
          w={820}
          pct={76}
          color={RIGHT_COLOR}
          label="After one small yes"
          at={wAt(6, 'seventy-six') - TWIST_IN}
        />
        <CompareBar
          x={130}
          y={920}
          w={820}
          pct={17}
          color={LEFT_COLOR}
          label="Asked cold"
          at={wAt(6, 'seventeen') - TWIST_IN}
        />
        <div
          style={{
            position: 'absolute',
            left: 60,
            right: 60,
            top: 1120,
            textAlign: 'center',
            fontFamily: FONT_BODY,
            fontWeight: 500,
            fontSize: 26,
            letterSpacing: 1,
            color: 'rgba(255,255,255,0.5)',
            opacity: prog(useCurrentFrame(), wAt(6, 'seventeen') - TWIST_IN + 20, wAt(6, 'seventeen') - TWIST_IN + 40),
          }}
        >
          Freedman &amp; Fraser, 1966 — Journal of Personality and Social Psychology
        </div>
      </Sequence>

      {/* LOOP — the ledger expands back to full size, landing on frame 0's exact state. */}
      <Sequence from={LOOP_IN} durationInFrames={END - LOOP_IN}>
        <Ledger from={LOOP_IN} />
        <BigTitle lines={TITLE} subtitle={SUBTITLE} />
      </Sequence>

      {/* GLOBAL — mounted at the root so their time is the video's time, not a scene's. */}
      <Captions lines={VO} accent={ACCENT} />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
