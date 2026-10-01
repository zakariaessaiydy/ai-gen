import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, PauseCard, ProgressBar, prog, timeWords } from '../../lib/shorts';
import {
  CUT,
  Col,
  DayColumn,
  DrawnCut,
  EASE_INOUT,
  EASE_OUT,
  SideTag,
  SourcePlate,
  StretchLabel,
  Tally,
  clamp01,
  clock,
  hm,
  measure,
  mix,
  mulberry32,
} from '../../lib/cuts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short35Batch',
  durationInSeconds: 44.1,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = CUT.focus;
const F = (s: number) => Math.round(s * 30);
const END = F(44.1);

// every cue is a spoken word — retimes itself when the real voice lands in vo.gen.ts
const key = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
const wAt = (line: number, word: string) => {
  const w = timeWords(VO[line]).find((x) => key(x.w) === word);
  if (!w) throw new Error(`Short35Batch: no word "${word}" in VO line ${line} ("${VO[line].text}")`);
  return F(w.start);
};

// =============================================================================
// THE MODEL — one day, 07:00–21:30, eighteen pings. A ping is DUR minutes of answering.
// Three placements of the SAME eighteen pings (plus "off"), and every number on screen is
// `measure()` run on whatever is drawn this frame.
// =============================================================================
const DAY_LO = 7 * 60;
const DAY_HI = 21 * 60 + 30;
const DUR = 3; // minutes to answer one ping
const JOIN = 6; // cuts closer than this are one pull away
const N = 18;
const BATCH_AT = [9 * 60, 15 * 60, 21 * 60]; // the trial's schedule: 9am, 3pm, 9pm

const rnd = mulberry32(35);
// arrivals ~48 min apart with a little jitter — an illustrative day, not data
const ARRIVE = Array.from({ length: N }, (_, i) => 435 + 48 * i + Math.round((rnd() - 0.5) * 10));

type P = { t: number; alpha: number };
const stack = (slotOf: (t: number) => number): P[] => {
  const seen = new Map<number, number>();
  return ARRIVE.map((t) => {
    const s = slotOf(t);
    const k = seen.get(s) ?? 0;
    seen.set(s, k + 1);
    return { t: s + k * DUR, alpha: 1 };
  });
};
const batchOf = (t: number) => {
  const b = BATCH_AT.find((x) => x >= t);
  if (b === undefined) throw new Error(`Short35Batch: ping at ${clock(t)} has no later batch`);
  return b;
};
const GROUP = ARRIVE.map((t) => BATCH_AT.indexOf(batchOf(t)));

const SCATTER: P[] = ARRIVE.map((t) => ({ t, alpha: 1 }));
const BATCHED: P[] = stack(batchOf);
const HOURLY: P[] = stack((t) => Math.ceil(t / 60) * 60);
const OFF: P[] = HOURLY.map((p) => ({ t: p.t, alpha: 0.13 }));

const counted = (ps: P[]) => ps.filter((p) => p.alpha > 0.5).map((p) => ({ a: p.t, b: p.t + DUR }));
const M = (ps: P[]) => measure(counted(ps), DAY_LO, DAY_HI, JOIN);

// the claims, checked at module load — if the model changes, the video refuses to render a lie
{
  const s = M(SCATTER);
  const b = M(BATCHED);
  if (s.pulls.length !== 18 || s.bestMin >= 60) throw new Error(`scattered must be 18 pulls, longest < 1h (got ${s.pulls.length}, ${hm(s.bestMin)})`);
  if (b.pulls.length !== 3 || b.bestMin <= 300) throw new Error(`batched must be 3 pulls, longest > 5h (got ${b.pulls.length}, ${hm(b.bestMin)})`);
  if (M(OFF).pulls.length !== 0) throw new Error('off must count no pulls');
  if (BATCHED.some((p, i) => p.t < ARRIVE[i])) throw new Error('a ping cannot be answered before it arrives');
  if (HOURLY.some((p, i) => p.t < ARRIVE[i])) throw new Error('hourly: a ping cannot be answered before it arrives');
}

// =============================================================================
// THE TIMELINE — segments between placements; each ping has its own window in a segment.
// =============================================================================
type Seg = { from: P[]; to: P[]; win: (i: number) => [number, number] };
const REWIND_A = wAt(1, 'answers');
const G_WORDS = ['morning', 'afternoon', 'evening'];
const SEGS: Seg[] = [
  // "This one ANSWERS eighteen pings the moment they arrive" — each ping slides up to its arrival
  { from: BATCHED, to: SCATTER, win: (i) => [REWIND_A + Math.round(i * 1.2), REWIND_A + Math.round(i * 1.2) + 22] },
  // each batch lands on its own word: pings only ever slide DOWN, waiting for the batch
  {
    from: SCATTER,
    to: BATCHED,
    win: (i) => {
      const a = wAt(4, G_WORDS[GROUP[i]]) - 4;
      const k = ARRIVE.filter((_, j) => j < i && GROUP[j] === GROUP[i]).length;
      return [a + k, a + k + 20];
    },
  },
  { from: BATCHED, to: HOURLY, win: () => [wAt(8, 'hourly'), wAt(8, 'hourly') + 14] }, // one step: a stagger would flash a fake long stretch mid-move
  { from: HOURLY, to: OFF, win: (i) => [wAt(8, 'turning') + 6, wAt(8, 'turning') + 22] },
  { from: OFF, to: BATCHED, win: (i) => [wAt(9, 'an') + Math.round(i * 0.8), wAt(9, 'an') + Math.round(i * 0.8) + 26] },
];
const LOOP_A = SEGS[SEGS.length - 1].win(0)[0];

const pingAt = (i: number, f: number): P => {
  let cur = SEGS[0].from[i];
  for (const s of SEGS) {
    const [a, b] = s.win(i);
    if (f < a) return cur;
    if (f < b) {
      const u = EASE_INOUT(prog(f, a, b));
      return { t: mix(s.from[i].t, s.to[i].t, u), alpha: mix(s.from[i].alpha, s.to[i].alpha, u) };
    }
    cur = s.to[i];
  }
  return cur;
};

// =============================================================================
// THE BAND — one headline at a time; each runs until the next one starts.
// =============================================================================
const HOOK_LINES = [{ text: 'SAME DAY. SAME PINGS.' }, { text: 'ONE FEELS ORGANIZED.', color: CUT.focus }];
const HEADS: { a: number; lines: { text: string; color?: string }[] }[] = [
  { a: -30, lines: HOOK_LINES },
  { a: wAt(1, 'this'), lines: [{ text: '18 PINGS,' }, { text: 'ANSWERED ON ARRIVAL.', color: CUT.ping }] },
  { a: wAt(3, 'dont'), lines: [{ text: "DON'T ANSWER FEWER." }, { text: 'ANSWER TOGETHER.', color: CUT.focus }] },
  { a: wAt(5, 'same'), lines: [{ text: 'SAME 18 PINGS.' }, { text: 'GROUPED INTO 3.', color: CUT.focus }] },
  { a: wAt(7, 'batching'), lines: [{ text: '3 BATCHES A DAY:' }, { text: 'LESS STRESS', color: CUT.focus }] },
  { a: wAt(8, 'hourly'), lines: [{ text: 'HOURLY BATCHES:' }, { text: 'NO DIFFERENCE', color: CUT.dim }] },
  { a: wAt(8, 'turning'), lines: [{ text: 'ALL OFF:' }, { text: 'MORE ANXIETY', color: CUT.ping }] },
  { a: wAt(9, 'an'), lines: HOOK_LINES },
];

const QUIZ_FROM = F(13.5);
const QUIZ_DUR = F(2.7);

const COL: Col = { x: 300, w: 480, y: 540, h: 830, lo: DAY_LO, hi: DAY_HI };
const TICKS = [7, 9, 11, 13, 15, 17, 19, 21].map((h) => h * 60);

export default function Short35Batch() {
  const f = useCurrentFrame();

  const punch = f < LOOP_A ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 30)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP_A, END));

  const ps = Array.from({ length: N }, (_, i) => pingAt(i, f));
  const m = M(ps);

  // "Each one PULLS you out" — a sweep runs down the day lighting every cut it passes
  const sweepA = wAt(2, 'pulls');
  const sweepP = prog(f, sweepA, sweepA + 66);
  const sweepOn = f >= sweepA && f < sweepA + 72 ? 1 : 0;
  const sweepM = mix(DAY_LO, DAY_HI, EASE_INOUT(sweepP));
  const cuts: DrawnCut[] = ps.map((p) => ({
    a: p.t,
    b: p.t + DUR,
    alpha: p.alpha,
    glow: sweepOn * clamp01(1 - Math.abs(p.t - sweepM) / 45),
  }));

  // batch tags appear with their batch, and leave when the batches do
  const tagOn = (g: number) => {
    const a = wAt(4, G_WORDS[g]);
    const inA = f < LOOP_A ? prog(f, a, a + 10) * (1 - prog(f, wAt(8, 'hourly'), wAt(8, 'hourly') + 10)) : 0;
    const base = 1 - prog(f, REWIND_A, REWIND_A + 10); // on at frame 0 (the hook is the batched day)
    const back = prog(f, LOOP_A + 20, LOOP_A + 36);
    return Math.max(inA, f < REWIND_A + 10 ? base : 0, back);
  };

  const tallyOn = 1 - prog(f, QUIZ_FROM - 6, QUIZ_FROM + 4) + prog(f, QUIZ_FROM + QUIZ_DUR - 4, QUIZ_FROM + QUIZ_DUR + 6);
  const srcOn = prog(f, wAt(7, 'trial'), wAt(7, 'trial') + 10) * (1 - prog(f, wAt(9, 'an') - 10, wAt(9, 'an')));
  const pulls = m.pulls.length;

  return (
    <AbsoluteFill style={{ background: CUT.stage }}>
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <AbsoluteFill
          style={{ background: 'radial-gradient(ellipse 70% 45% at 50% 52%, rgba(77,184,168,0.10), rgba(11,14,20,0) 70%)' }}
        />
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          <Tally
            y={372}
            opacity={clamp01(tallyOn)}
            cols={[
              { label: 'PULLED AWAY', value: `${pulls}×`, color: pulls === 0 ? CUT.text : pulls > 3 ? CUT.ping : CUT.focus },
              { label: 'LONGEST STRETCH', value: hm(m.bestMin), color: pulls === 0 ? CUT.text : m.bestMin >= 300 ? CUT.focus : CUT.ping },
            ]}
          />

          <DayColumn c={COL} cuts={cuts} pieces={m.pieces} best={m.best} ticks={TICKS} />
          <StretchLabel c={COL} best={m.best} />

          {BATCH_AT.map((b, g) => (
            <SideTag key={b} c={COL} m={b + 9} text={clock(b)} color={CUT.ping} opacity={tagOn(g)} />
          ))}

          <SourcePlate y={1418} opacity={srcOn} lines={['FITZ ET AL. 2019 · RCT · N = 237 · 2 WEEKS']} />
        </svg>

        {HEADS.map((h, k) => {
          const next = HEADS[k + 1];
          const b = next ? next.a : END + 30;
          const op = Math.min(prog(f, h.a + 2, h.a + 9), 1 - prog(f, b - 7, b)) * clamp01(tallyOn);
          if (op <= 0.01) return null;
          return (
            <div key={k} style={{ opacity: op }}>
              <BigTitle lines={h.lines} y={130} size={64} warm />
            </div>
          );
        })}
      </AbsoluteFill>

      <Sequence from={QUIZ_FROM} durationInFrames={QUIZ_DUR}>
        <PauseCard
          title="PAUSE"
          subtitle="answer all 18, and still get hours of focus?"
          durSec={QUIZ_DUR / 30}
          accent={ACCENT}
          y={330}
        />
      </Sequence>

      <Captions lines={VO} y={1510} accent={ACCENT} plate />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
