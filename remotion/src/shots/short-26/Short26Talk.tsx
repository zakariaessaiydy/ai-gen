import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import {
  Disclaimer,
  EASE_INOUT,
  EASE_OUT,
  Exchange,
  FactPlate,
  HookReadout,
  ShareBar,
  TH,
  Thread,
  ThreadColumn,
  WaitMeter,
  WordsRow,
  clamp01,
  countHooks,
  countWords,
  echoOf,
  layoutThread,
  mix,
  sharePct,
} from '../../lib/thread';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short26Talk',
  durationInSeconds: 45.0,
  fps: 30,
  width: 1080,
  height: 1920,
};

const F = (s: number) => Math.round(s * 30);
const END = F(45.0); // 1350

// =============================================================================
// THE MODEL — two threads, and nothing else authored.
//
// These twelve strings are the ONLY content in the video. Every number on screen — hooks,
// words, talk share — is COUNTED off these arrays by lib/thread.tsx against the bubbles drawn
// on the current frame, never typed here; the echo links ("their words") are found by matching
// each question against the previous answer's hooks. Change a line and the whole video
// re-argues itself instead of desynchronising.
//
// They are an ILLUSTRATION of the shape the three sourced findings predict, not measured
// dialogue, and the plate under the headers says so for the video's entire length.
// The SOURCED claims are the three plates in the band (see beats.json.facts).
// =============================================================================
const DEAD_EX: Exchange[] = [
  { parent: 'How was your day?', child: 'Fine.', hooks: [] },
  { parent: 'Did anything happen at school?', child: 'Nope.', hooks: [] },
  { parent: 'Was it good?', child: 'Yeah.', hooks: [] },
];

const LIVE_EX: Exchange[] = [
  {
    parent: 'Tell me one thing that happened at lunch.',
    child: 'We played tag but Maya said only big kids could be It so I sat on the wall with Sam.',
    hooks: ['tag', 'Maya', 'only big kids', 'sat on the wall', 'Sam'],
  },
  {
    parent: 'Only big kids.',
    child: "She made it a rule at the start and I said that's not fair.",
    hooks: ['made it a rule', 'the start', "that's not fair"],
  },
  {
    parent: 'Not fair.',
    child: "So me and Sam made up our own game on the wall and it's called Wall Ball.",
    hooks: ['me and Sam', 'our own game', 'on the wall', 'Wall Ball'],
  },
];

const DEAD: Thread = { id: 'dead', head: 'Ask about the day', exchanges: DEAD_EX, tone: 'dead' };
const LIVE: Thread = { id: 'live', head: 'Ask about one moment', exchanges: LIVE_EX, tone: 'live' };

// =============================================================================
// LAYOUT — two columns. The dead one is narrow because it has nothing to hold; the live one
// takes the width it needs. Nothing critical below y1360 or right of x920.
// =============================================================================
const L = { x: 60, w: 330 };
const R = { x: 420, w: 500 };
const HEAD_Y = 236;
const DISC_Y = 1380;
const RAIL_Y = 300;
const RAIL_H = 840;
const HOOKS_Y = 1156;
const WORDS_Y = 1274;
const SHARE_Y = 1310;
const SHARE_W = 250;
const BAND_Y = 96; // the strip the title vacates — every plate and the wait meter live here

const LAY_D = layoutThread(DEAD, L.w);
const LAY_L = layoutThread(LIVE, R.w);
const FULL = DEAD_EX.length * 2; // 6 bubbles per thread

// The two echoes are FOUND, not declared: "Only big kids." is a hook of the answer above it,
// and "Not fair." is inside one. -1 would mean the parent had to invent the question.
const ECHO_1 = echoOf(LIVE_EX[1].parent, LIVE_EX[0].hooks);
const ECHO_2 = echoOf(LIVE_EX[2].parent, LIVE_EX[1].hooks);

// =============================================================================
// CUES — GLOBAL frames. Inside a <Sequence> the frame is LOCAL, so Board is handed its
// sequence's `from` and adds it back before comparing against anything below.
//
// Every cue is a REAL word time out of beats.json; the comment is the word it lands on.
// =============================================================================
const HOOK_OUT = F(4.85); // 146
const SETUP_OUT = F(11.0); // 330
const QUIZ_OUT = F(13.8); // 414
const REVEAL_OUT = F(34.0); // 1020
const TWIST_OUT = F(40.95); // 1229

const RESET_A = 128; //  4.27  the hook line has landed; the board empties
const RESET_B = 148; //  4.93
const DEAD_IN_A = 146; //  4.87  "Three" (4.85) — the dead thread walks itself out, one bubble
const DEAD_IN_B = 224; //  7.47  at a time, the last landing under "of the words" (7.10-8.05)

// The live thread rebuilds one bubble per line, each on the word that describes it.
const LIVE_IN: [number, number][] = [
  [424, 448], // 14.13  "Not the day. One moment, and name it." — the anchored invitation
  [543, 575], // 18.10  "pulls three times the detail" — the answer lands, five hooks with it
  [627, 651], // 20.90  "Then stop talking" — the question made of THEIR words
  [793, 829], // 26.43  the three seconds are up: the answer the silence bought
  [891, 915], // 29.70  "Now you never invent another question."
  [952, 990], // 31.73  "You say theirs back." (32.35-33.79) — the twelfth hook lands under it
];

const DIM_A = 414; // 13.80  the dead thread steps back for the reveal
const DIM_B = 452; // 15.07
const UNDIM_A = 1216; // 40.53  and relights for the wrap
const UNDIM_B = 1256; // 41.87

const WAIT_IN = 696; // 23.20  L5 ends at 23.21 and NOTHING is said until 26.45
const WAIT_T0 = 703; // 23.43  the counter starts
const WAIT_T1 = 793; // 26.43  exactly 3.00s later — the wait is real, not illustrated
const WAIT_OUT_A = 795; // 26.50
const WAIT_OUT_B = 812; // 27.07
const HUSH_A = 690; // 23.00  both threads step back so the only moving thing is the counter
const HUSH_B = 706; // 23.53
const HUSH_C = 780; // 26.00
const HUSH_D = 796; // 26.53

const P1_A = 556; // 18.53  Lamb — "An open question pulls three times the detail." (17.85)
const P1_B = 578; // 19.27
const P1_C = 618; // 20.60
const P1_D = 640; // 21.33
const P2_A = 800; // 26.67  Rowe — "The silence is worth more than the question." (26.45)
const P2_B = 822; // 27.40
const P2_C = 872; // 29.07
const P2_D = 894; // 29.80
const P3_A = 1096; // 36.53  Reese & Newcombe — the randomised warrant, over the share flip
const P3_B = 1124; // 37.47
const P3_C = 1196; // 39.87
const P3_D = 1220; // 40.67

const WORDS_L_A = 1024; // 34.14  "Fifty-one" — the live word count is the one being named
const WORDS_D_A = 1054; // 35.14  "not three." (35.14-36.37)
const SHARE_D_A = 1158; // 38.59  "Eighty" (38.59-38.84)
const SHARE_L_A = 1184; // 39.48  "then twenty." (39.48-40.95)

const TITLE_OUT_A = 282; //  9.40  clears the band before the pause card
const TITLE_OUT_B = 316; // 10.53
const TITLE_IN_A = 1238; // 41.27  "Don't ask about the day." (41.19)
const TITLE_IN_B = 1290; // 43.00

const SWEEP_A = 24; //  0.80  the twelve hooks light in turn under the hook line, so the
const SWEEP_B = 116; //  3.87  number in the readout is visibly a COUNT of things on screen

// =============================================================================
// STATE AS A FUNCTION OF THE GLOBAL FRAME.
// Every one of these returns its frame-0 value at f = END-1 by construction — the loop is
// authored, not debugged in afterwards.
// =============================================================================
const deadShownAt = (f: number) =>
  Math.max(FULL * (1 - EASE_INOUT(prog(f, RESET_A, RESET_B))), FULL * prog(f, DEAD_IN_A, DEAD_IN_B));

const liveBuildAt = (f: number) => LIVE_IN.reduce((s, [a, b]) => s + EASE_OUT(prog(f, a, b)), 0);

const liveShownAt = (f: number) =>
  Math.max(FULL * (1 - EASE_INOUT(prog(f, RESET_A, RESET_B))), liveBuildAt(f));

/** The live column's header and readouts are the ANSWER — they leave with the thread, or the
 *  pause card would be asking a question the board has already answered. */
const liveHeadAt = (f: number) =>
  Math.max(1 - EASE_INOUT(prog(f, RESET_A, RESET_B)), EASE_OUT(prog(f, LIVE_IN[0][0], LIVE_IN[0][1])));

const hushAt = (f: number) =>
  1 - 0.4 * EASE_INOUT(prog(f, HUSH_A, HUSH_B)) * (1 - EASE_INOUT(prog(f, HUSH_C, HUSH_D)));

const deadDimAt = (f: number) =>
  (1 - 0.58 * EASE_INOUT(prog(f, DIM_A, DIM_B)) * (1 - EASE_INOUT(prog(f, UNDIM_A, UNDIM_B)))) * hushAt(f);

/** in -> hold -> out, on a plate or a stamp. */
const band = (f: number, a: number, b: number, c: number, d: number) =>
  EASE_OUT(prog(f, a, b)) * (1 - EASE_INOUT(prog(f, c, d)));

const waitOpAt = (f: number) => band(f, WAIT_IN, WAIT_IN + 12, WAIT_OUT_A, WAIT_OUT_B);
const waitSecsAt = (f: number) => Math.max(0, Math.min(3, (f - WAIT_T0) / 30));

const titleOpAt = (f: number) =>
  Math.min(1, 1 - EASE_INOUT(prog(f, TITLE_OUT_A, TITLE_OUT_B)) + EASE_OUT(prog(f, TITLE_IN_A, TITLE_IN_B)));

/** A short pop on a readout the narration has just named. */
const pop = (f: number, at: number) => band(f, at, at + 7, at + 26, at + 44);

/** Which hook of the answer above is the next question made of — on for as long as it is new. */
const ringAt = (f: number): { bi: number; i: number } | null => {
  if (f >= LIVE_IN[2][0] - 4 && f < LIVE_IN[3][0] - 60 && ECHO_1 >= 0) return { bi: 1, i: ECHO_1 };
  if (f >= LIVE_IN[4][0] - 4 && f < LIVE_IN[5][0] + 30 && ECHO_2 >= 0) return { bi: 3, i: ECHO_2 };
  return null;
};

const sweepAt = (f: number) => {
  const amt = band(f, SWEEP_A, SWEEP_A + 10, SWEEP_B - 14, SWEEP_B);
  if (amt < 0.01) return null;
  return { pos: prog(f, SWEEP_A, SWEEP_B) * 13 - 1, amt };
};

/** The whole board breathes 10px between the hook and the wrap, and lands back where it began. */
const driftAt = (f: number) =>
  f < 600 ? mix(-10, 0, EASE_OUT(prog(f, 0, 110))) : mix(0, -10, EASE_INOUT(prog(f, TITLE_IN_A, END - 1)));

// =============================================================================
// THE BOARD — the one persistent thing the whole video happens on. The beats only switch
// pieces of it on; nothing ever cuts.
// =============================================================================
const Board: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame() + from; // GLOBAL frame

  // ---- the model, re-counted on this frame from the bubbles actually drawn ----------------
  const dShown = deadShownAt(f);
  const lShown = liveShownAt(f);
  const dHooks = countHooks(DEAD_EX, dShown);
  const lHooks = countHooks(LIVE_EX, lShown);
  const dYou = countWords(DEAD_EX, dShown, 'p');
  const dThem = countWords(DEAD_EX, dShown, 'c');
  const lYou = countWords(LIVE_EX, lShown, 'p');
  const lThem = countWords(LIVE_EX, lShown, 'c');
  const dPct = sharePct(DEAD_EX, dShown);
  const lPct = sharePct(LIVE_EX, lShown);

  const dDim = deadDimAt(f);
  const lDim = hushAt(f);
  const lHead = liveHeadAt(f);

  return (
    <div style={{ position: 'absolute', inset: 0, transform: 'translateY(' + driftAt(f) + 'px)' }}>
      <ThreadColumn
        thread={DEAD}
        layout={LAY_D}
        x={L.x}
        w={L.w}
        headY={HEAD_Y}
        railY={RAIL_Y}
        railH={RAIL_H}
        shown={dShown}
        dim={dDim}
      />
      <ThreadColumn
        thread={LIVE}
        layout={LAY_L}
        x={R.x}
        w={R.w}
        headY={HEAD_Y}
        railY={RAIL_Y}
        railH={RAIL_H}
        shown={lShown}
        dim={lDim}
        headOpacity={lHead}
        ringChip={ringAt(f)}
        sweep={sweepAt(f)}
      />

      {/* ---- THE COUNTERS. Two columns, the same three readouts, so the comparison is a
           glance and not an argument. None of these six numbers is a constant. ----------- */}
      <HookReadout n={dHooks} x={L.x} y={HOOKS_Y} color={TH.dead} size={78} opacity={dDim} />
      <WordsRow
        you={dYou}
        them={dThem}
        x={L.x}
        y={WORDS_Y}
        color={TH.dead}
        opacity={dDim}
        pulse={pop(f, WORDS_D_A)}
      />
      <ShareBar
        pct={dPct}
        x={L.x}
        y={SHARE_Y}
        w={SHARE_W}
        color={TH.dead}
        opacity={dDim * clamp01(dShown - 0.9)}
        lit={band(f, SHARE_D_A, SHARE_D_A + 10, TWIST_OUT - 8, TWIST_OUT + 10)}
      />

      <HookReadout n={lHooks} x={R.x} y={HOOKS_Y} color={TH.live} size={78} opacity={lDim * lHead} />
      <WordsRow
        you={lYou}
        them={lThem}
        x={R.x}
        y={WORDS_Y}
        color={TH.live}
        opacity={lDim * lHead}
        pulse={pop(f, WORDS_L_A)}
      />
      <ShareBar
        pct={lPct}
        x={R.x}
        y={SHARE_Y}
        w={SHARE_W}
        color={TH.live}
        opacity={lDim * lHead * clamp01(lShown - 0.9)}
        lit={band(f, SHARE_L_A, SHARE_L_A + 10, TWIST_OUT - 8, TWIST_OUT + 10)}
      />
    </div>
  );
};

// =============================================================================
// THE BAND — the title, and everything that borrows its strip: the wait demonstration and the
// three sourced findings. Nothing here ever covers the two threads it is talking about.
// =============================================================================
const BandLayer: React.FC = () => {
  const f = useCurrentFrame(); // GLOBAL — this layer is never inside a Sequence
  const p1 = band(f, P1_A, P1_B, P1_C, P1_D);
  const p2 = band(f, P2_A, P2_B, P2_C, P2_D);
  const p3 = band(f, P3_A, P3_B, P3_C, P3_D);
  const wait = waitOpAt(f);
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, opacity: titleOpAt(f) }}>
        <BigTitle
          warm
          y={104}
          size={60}
          lines={[{ text: '"FINE" IS NOT A SHORT ANSWER' }, { text: 'IT HAS NOTHING TO ASK ABOUT', color: TH.live }]}
        />
      </div>

      {p1 > 0.01 ? (
        <FactPlate
          y={BAND_Y}
          opacity={p1}
          color={TH.live}
          headline="OPEN INVITATION: 3-5x MORE COMES BACK"
          source={[
            'LAMB, ORBACH, HERSHKOWITZ, ESPLIN & HOROWITZ 2007',
            'CHILD ABUSE & NEGLECT 31 · INVESTIGATIVE INTERVIEWS, NOT DINNER TABLES',
          ]}
        />
      ) : null}

      {wait > 0.01 ? <WaitMeter y={BAND_Y + 6} secs={waitSecsAt(f)} total={3} opacity={wait} /> : null}

      {p2 > 0.01 ? (
        <FactPlate
          y={BAND_Y}
          opacity={p2}
          color={TH.warn}
          headline="1s WAIT -> 3s WAIT: ANSWERS +300-700%"
          source={[
            'ROWE 1986 · JOURNAL OF TEACHER EDUCATION 37(1)',
            'SCIENCE CLASSROOMS, NOT DINNER TABLES',
          ]}
        />
      ) : null}

      {p3 > 0.01 ? (
        <FactPlate
          y={BAND_Y}
          opacity={p3}
          color={TH.live}
          headline="MOTHERS RANDOMISED TO TALK THIS WAY"
          source={[
            'REESE & NEWCOMBE 2007 · CHILD DEVELOPMENT 78(4) · N=115',
            'THEIR CHILDREN GAVE RICHER ANSWERS AT BOTH FOLLOW-UPS',
          ]}
        />
      ) : null}
    </>
  );
};

// =============================================================================
// THE SHOT
// =============================================================================
export default function Short26Talk() {
  return (
    <AbsoluteFill style={{ background: TH.stage }}>
      <ShortsBackdrop />

      {/* HOOK — frame 0 fully composed: both threads drawn end to end, three empty sockets
          against twelve hooks, and the two talk shares already sitting at 80 and 20. */}
      <Sequence from={0} durationInFrames={HOOK_OUT}>
        <Board from={0} />
      </Sequence>

      {/* SETUP — the board empties and the dead thread walks itself out: three questions, three
          answers with nothing in them, and the parent's share climbing to 80% as it goes. */}
      <Sequence from={HOOK_OUT} durationInFrames={SETUP_OUT - HOOK_OUT}>
        <Board from={HOOK_OUT} />
      </Sequence>

      {/* QUIZ — the card sits over the half of the board that is empty. The live column's
          header is down with its thread, so the answer is not printed above the question. */}
      <Sequence from={SETUP_OUT} durationInFrames={QUIZ_OUT - SETUP_OUT}>
        <Board from={SETUP_OUT} />
        <PauseCard
          subtitle="what do you ask instead?"
          durSec={(QUIZ_OUT - SETUP_OUT) / 30}
          y={1020}
          accent={TH.live}
        />
      </Sequence>

      {/* REVEAL — the anchored invitation, then THREE REAL SECONDS of nothing while the counter
          runs, then the answer the silence bought. Each following question is a hook off the
          answer above it, ringed as it is reused. The hook count is a count, not a caption. */}
      <Sequence from={QUIZ_OUT} durationInFrames={REVEAL_OUT - QUIZ_OUT}>
        <Board from={QUIZ_OUT} />
      </Sequence>

      {/* TWIST — the two counts, then the two shares, under the one randomised finding: the
          variable that moved was the parent's. */}
      <Sequence from={REVEAL_OUT} durationInFrames={TWIST_OUT - REVEAL_OUT}>
        <Board from={REVEAL_OUT} />
      </Sequence>

      {/* LOOP — the dead thread relights, the title comes back, the board drifts onto frame 0.
          The last frame is the first frame, bubble for bubble. No CTA. */}
      <Sequence from={TWIST_OUT} durationInFrames={END - TWIST_OUT}>
        <Board from={TWIST_OUT} />
      </Sequence>

      {/* GLOBAL */}
      <BandLayer />
      <Disclaimer y={DISC_Y} text="THE TWO THREADS ARE AN ILLUSTRATION, NOT MEASURED DIALOGUE" />
      <Captions lines={VO} y={1462} size={52} accent={TH.live} plate />
      <ProgressBar color={TH.live} />
    </AbsoluteFill>
  );
}
