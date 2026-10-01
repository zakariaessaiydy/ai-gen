import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, PauseCard, ProgressBar, prog } from '../../lib/shorts';
import {
  Bars,
  Budget,
  CountHero,
  EASE_INOUT,
  EASE_OUT,
  HOURS_MESSY,
  HOURS_TIDY,
  IDENTITY,
  LOOKS_MESSY,
  LOST_HOURS,
  Ledger,
  Line,
  LookMeter,
  N,
  NOT_TIDY_STR,
  ORDER_COLORS,
  Place,
  ROOM,
  RoomStage,
  SEARCHES_PER_DAY,
  SEC_PER_LOOK,
  SEEN_FRAC,
  SPACE,
  SwapCounter,
  Thing,
  UNIVERSE_S,
  Vignette,
  clamp01,
  group,
  mix,
  mulberry32,
  shufflePerm,
  slotXY,
  sortStates,
} from '../../lib/order';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short16Room',
  durationInSeconds: 43.0,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = ORDER_COLORS.accent;
const F = (s: number) => Math.round(s * 30);
const END = F(43.0); // 1290

// =============================================================================
// THE MODEL — one permutation of 20 things over 20 places, and everything read off it.
//
// Nothing below is a number chosen to be impressive. The state space is 20! by long
// multiplication; the mess is a seeded Fisher-Yates shuffle; and the DISTANCE back to tidy is
// the length of the real cycle-sort, so the "16" on screen is counted, not asserted. Edit the
// seed and every number in the video follows it.
// =============================================================================
const MESS = shufflePerm(18); // 4 cycles, no fixed points — nothing starts where it belongs
const STATES = sortStates(MESS); // states[k][i] = where thing i is after k put-backs
const SWAPS = STATES.length - 1; // 16 = N - cycles(MESS), counted from the sort itself

// The search. In a messy room you do not scan shelf by shelf, you look in a haphazard order —
// so the order IS a shuffle, and the target is picked as the thing that order happens to reach
// on the eleventh look, which is the closest whole number to the (N+1)/2 = 10.5 expectation.
const SEARCH_ORDER = shufflePerm(5);
const LOOKS_SHOWN = 11;
const TARGET = (() => {
  for (let i = 0; i < N; i++) if (SEARCH_ORDER.indexOf(MESS[i]) === LOOKS_SHOWN - 1) return i;
  return 0;
})();

// deterministic per-thing jitter: a thing dumped in a place is not centred in it
const rnd = mulberry32(99);
const NOISE = Array.from({ length: N }, () => [rnd(), rnd(), rnd(), rnd()]);

// =============================================================================
// CUES — every band change is timed against the REAL word times in vo.gen.ts.
// =============================================================================
const HOOK_OUT = F(5.7); // "Twenty things" @ 5.90
const TIDY_A = 168; //  5.60s — the room snaps to the one arrangement, on "Twenty things"
const TIDY_B = 258;
const SCAT_A = 285; //  9.50s — it scatters again on "Shuffle" @ 9.45
const SCAT_B = 420;
const QUIZ_FROM = F(17.55);
const QUIZ_DUR = F(2.65);
const SEARCH_A = 612; // 20.4s — eleven places in 93 frames, so the hit lands ON "half." @23.2
const SEARCH_B = 705;
const SORT_A = 995; // 33.2s — the 16 real put-backs, from "distance" @33.1 to "put-backs" @36.0
const SORT_B = 1128;
const DRIFT_A = 1206; // 40.2s — entropy, on "Everything else drifts"; lands on frame 0
const DRIFT_B = 1272;

const sci = (x: number) => {
  const e = Math.floor(Math.log10(x));
  return `${(x / Math.pow(10, e)).toFixed(1)}e${e}`;
};

// -----------------------------------------------------------------------------
// A pose is a place plus how badly the thing was dumped into it. jit = 0 is dead centre and
// square; jit = 1 is off-centre and tilted. The PLACE is the model, the jitter is the mess.
// -----------------------------------------------------------------------------
type Pose = { x: number; y: number; rot: number };
const poseOf = (i: number, slot: number, jit: number): Pose => {
  const [bx, by] = slotXY(slot);
  const n = NOISE[i];
  return {
    x: bx + (n[0] - 0.5) * 62 * jit,
    y: by + (n[1] - 0.5) * 54 * jit,
    rot: (n[2] - 0.5) * 30 * jit,
  };
};

/** Blend two poses with a per-thing stagger and a small lift, so a move is a carry, not a slide. */
const blendPose = (i: number, a: Pose, b: Pose, u: number, moved: boolean): Pose => {
  const e = EASE_INOUT(clamp01(u));
  return {
    x: mix(a.x, b.x, e),
    y: mix(a.y, b.y, e) - (moved ? Math.sin(Math.PI * e) * 30 : 0),
    rot: mix(a.rot, b.rot, e),
  };
};

const stagger = (i: number, p: number, spread = 0.5) =>
  clamp01(p * (1 + spread) - spread * NOISE[i][3]);

// =============================================================================
// THE ROOM OVER TIME — one function, four transitions, and the last frame is the first.
// mess -> tidy (the rewind that sets up the model) -> mess (the state space) -> tidy (the 16
// put-backs) -> mess (the drift, landing on exactly frame 0's arrangement).
// =============================================================================
const roomAt = (f: number) => {
  const out: { pose: Pose; home: number }[] = [];
  const still = (slots: number[], jit: number) =>
    IDENTITY.forEach((_, i) => out.push({ pose: poseOf(i, slots[i], jit), home: 1 - jit }));

  if (f < TIDY_A) still(MESS, 1);
  else if (f < TIDY_B) {
    const p = prog(f, TIDY_A, TIDY_B);
    IDENTITY.forEach((_, i) => {
      const u = stagger(i, p);
      out.push({
        pose: blendPose(i, poseOf(i, MESS[i], 1), poseOf(i, i, 0), u, MESS[i] !== i),
        home: EASE_OUT(u),
      });
    });
  } else if (f < SCAT_A) still(IDENTITY, 0);
  else if (f < SCAT_B) {
    const p = prog(f, SCAT_A, SCAT_B);
    IDENTITY.forEach((_, i) => {
      const u = stagger(i, p, 0.75);
      out.push({
        pose: blendPose(i, poseOf(i, i, 0), poseOf(i, MESS[i], 1), u, MESS[i] !== i),
        home: 1 - EASE_OUT(u),
      });
    });
  } else if (f < SORT_A) still(MESS, 1);
  else if (f < SORT_B) {
    // THE SORT IS REPLAYED, NOT ANIMATED. states[k] is the room after k put-backs; the frame
    // picks k and how far into the (k+1)th it is, so the tiles and the counter are the same data.
    const kf = (prog(f, SORT_A, SORT_B) * SWAPS * 1.0001);
    const k = Math.min(SWAPS - 1, Math.floor(kf));
    const t = clamp01(kf - k);
    const A = STATES[k];
    const B = STATES[k + 1];
    IDENTITY.forEach((_, i) => {
      const moved = A[i] !== B[i];
      const jA = A[i] === i ? 0 : 1;
      const jB = B[i] === i ? 0 : 1;
      out.push({
        pose: blendPose(i, poseOf(i, A[i], jA), poseOf(i, B[i], jB), moved ? t : 0, moved),
        home: mix(1 - jA, 1 - jB, moved ? EASE_OUT(t) : 0),
      });
    });
  } else if (f < DRIFT_A) still(IDENTITY, 0);
  else if (f < DRIFT_B) {
    const p = prog(f, DRIFT_A, DRIFT_B);
    IDENTITY.forEach((_, i) => {
      const u = stagger(i, p, 0.8);
      out.push({
        pose: blendPose(i, poseOf(i, i, 0), poseOf(i, MESS[i], 1), u, MESS[i] !== i),
        home: 1 - EASE_OUT(u),
      });
    });
  } else still(MESS, 1);

  return out;
};

const Short16Room: React.FC = () => {
  const f = useCurrentFrame();

  // the loop reverses the hook's punch-in, so the wrap has no scale step in it
  const punch =
    f < DRIFT_A ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 30)) : 1.0 + 0.05 * EASE_INOUT(prog(f, DRIFT_A, END));

  const things = roomAt(f);
  const homeOf = things.map((t) => t.home);
  const messiness = 1 - homeOf.reduce((a, b) => a + b, 0) / N;

  // ---- the search sweep: one place every ~12.7 frames, in the haphazard order ----
  const searching = f >= SEARCH_A && f < SEARCH_B + 70;
  const lookIdx = Math.min(LOOKS_SHOWN - 1, Math.floor(prog(f, SEARCH_A, SEARCH_B) * LOOKS_SHOWN));
  const found = f >= SEARCH_B - 12;

  // ---- band opacities. Nothing shares the band with anything else, ever (short-15's lesson) ----
  const heroOp = Math.min(1, 1 - prog(f, HOOK_OUT, HOOK_OUT + 18) + prog(f, 1198, 1250));
  const titleOp = heroOp;
  const modelOp = prog(f, 196, 214) * (1 - prog(f, 278, 294));
  const barsOp = prog(f, 300, 318) * (1 - prog(f, 420, 436));
  const claimOp = prog(f, 440, 458) * (1 - prog(f, 505, 521));
  const lookOp = prog(f, 614, 630) * (1 - prog(f, 752, 766));
  const timeOp = prog(f, 774, 792) * (1 - prog(f, 862, 876));
  const budgetOp = prog(f, 884, 900) * (1 - prog(f, 975, 991));
  const swapOp = prog(f, 1002, 1020) * (1 - prog(f, 1174, 1190));

  // the sort's counter reads the same k the tiles do
  const swapsDone = f < SORT_A ? 0 : f >= SORT_B ? SWAPS : Math.floor(prog(f, SORT_A, SORT_B) * SWAPS * 1.0001);

  // attention: the grid dims while one fixed budget is cut twenty ways
  const dimAll = budgetOp * 0.45;

  return (
    <AbsoluteFill style={{ background: ORDER_COLORS.stage }}>
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          <RoomStage messiness={messiness} />

          {/* ---- the twenty places, each showing the one thing that belongs in it ---- */}
          {IDENTITY.map((s) => (
            <Place key={`p${s}`} s={s} filled={homeOf[s]} />
          ))}

          {/* ---- the twenty things, wherever they currently are ---- */}
          {things.map((t, i) => (
            <Thing
              key={`t${i}`}
              i={i}
              x={t.pose.x}
              y={t.pose.y}
              rot={t.pose.rot}
              home={t.home}
              fade={1 - dimAll * (i === TARGET ? 0 : 1)}
            />
          ))}

          {/* ---- the search, drawn OVER the things: a ring under a tile is not a ring ----
              Every place already checked keeps a dim ring, so the count on the meter is
              legible on the grid itself; the one being checked is bright, and it turns teal on
              the eleventh, which is where the thing actually was. */}
          {searching
            ? SEARCH_ORDER.slice(0, lookIdx + 1).map((s, k) => {
                const [cx, cy] = slotXY(s);
                const half = ROOM.cell / 2 + 4;
                const cur = k === lookIdx;
                const hit = cur && found;
                const col = hit ? ORDER_COLORS.tidy : ORDER_COLORS.mess;
                return (
                  <rect
                    key={`s${s}`}
                    x={cx - half}
                    y={cy - half}
                    width={half * 2}
                    height={half * 2}
                    rx={20}
                    fill={col}
                    fillOpacity={cur ? 0.1 : 0.03}
                    stroke={col}
                    strokeWidth={cur ? 7 : 3}
                    opacity={(cur ? 1 : 0.45) * lookOp}
                  />
                );
              })
            : null}

          {/* the diagram says what it is, for the whole video */}
          <Line
            x={540}
            y={1300}
            text={`YOUR ROOM · ${N} THINGS · ${N} PLACES`}
            size={30}
            color={ORDER_COLORS.dim}
            weight={600}
            spacing={5}
          />

          {/* ================= THE BAND ================= */}
          <CountHero on={heroOp} />

          {/* the model, stated once, in the frame where the room is actually tidy */}
          <Ledger
            y={270}
            on={modelOp}
            color={ORDER_COLORS.tidy}
            rows={[
              { label: `${N} THINGS · ${N} PLACES · ${N}!`, value: group(String(SPACE)), color: ORDER_COLORS.tidy, size: 40 },
            ]}
          />

          {/* one shuffle a second for the age of the universe, against the whole space */}
          <Bars
            y={270}
            on={barsOp}
            note={`YOU WOULD HAVE SEEN ${(SEEN_FRAC * 100).toFixed(1)}% OF THEM`}
            rows={[
              {
                label: 'ONE SHUFFLE A SECOND SINCE THE BIG BANG',
                value: sci(UNIVERSE_S),
                frac: SEEN_FRAC,
                color: ACCENT,
              },
              { label: 'WAYS THIS ROOM CAN LOOK', value: sci(SPACE), frac: 1, color: ORDER_COLORS.indigo },
            ]}
          />

          {/* the arithmetic, with the losing side counted exactly */}
          <Ledger
            y={270}
            on={claimOp}
            color={ORDER_COLORS.mess}
            rows={[
              { label: 'ARRANGEMENTS THAT ARE TIDY', value: '1', color: ORDER_COLORS.tidy, size: 44 },
              { label: 'ARRANGEMENTS THAT ARE NOT', value: group(NOT_TIDY_STR), color: ORDER_COLORS.mess, size: 32 },
            ]}
          />

          <LookMeter
            y={270}
            on={lookOp}
            looks={lookIdx + 1}
            label="LOOKING FOR ONE THING"
            compare={found ? `TIDY: 1 LOOK` : undefined}
          />

          <Bars
            y={270}
            on={timeOp}
            note={`${Math.round(LOST_HOURS)} HOURS A YEAR, JUST LOOKING`}
            rows={[
              {
                label: `MESSY · ${LOOKS_MESSY} PLACES × ${SEARCHES_PER_DAY} SEARCHES × ${SEC_PER_LOOK}s`,
                value: `${HOURS_MESSY.toFixed(1)} h`,
                frac: 1,
                color: ORDER_COLORS.mess,
              },
              {
                label: 'TIDY · 1 PLACE',
                value: `${HOURS_TIDY.toFixed(1)} h`,
                frac: HOURS_TIDY / HOURS_MESSY,
                color: ORDER_COLORS.tidy,
              },
            ]}
          />

          <Budget y={270} on={budgetOp} lit={prog(f, 900, 950)} />

          <SwapCounter y={270} on={swapOp} done={swapsDone} total={SWAPS} />
        </svg>

        <Vignette amount={0.44} />

        {/* NO SCRIM over the band. The wall behind the headline is a flat #141a24 with nothing
            on it, so a scrim buys no legibility — and being an AbsoluteFill it sat OVER the
            SVG, which is where the hero number lives, turning a #f5d76e number olive at frame
            0 (QA f0). The thumbnail's brightest element was being dimmed to protect type that
            was already perfectly legible. */}
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'YOUR ROOM HAS', color: '#ffffff' },
              { text: 'ONE TIDY STATE.', color: ORDER_COLORS.tidy },
            ]}
            y={150}
            size={54}
            warm
          />
        </div>
      </AbsoluteFill>

      {/* the quiz sits in the band, over a room that has not been sorted yet */}
      <Sequence from={QUIZ_FROM} durationInFrames={QUIZ_DUR}>
        <PauseCard title="PAUSE" subtitle={`how far is this from tidy?`} durSec={2.65} accent={ACCENT} y={362} />
      </Sequence>

      <Captions lines={VO} y={1400} accent={ACCENT} plate />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
};

export default Short16Room;
