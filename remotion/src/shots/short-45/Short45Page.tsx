import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, ProgressBar, ShortsBackdrop, Stamp, prog, timeWords } from '../../lib/shorts';
import {
  AreaBox,
  EASE_INOUT,
  EASE_OUT,
  Geo,
  Head,
  LoopChip,
  PG,
  Paper,
  StepPills,
  Tally,
  hash,
  lerpGeo,
  mix,
  seed,
} from '../../lib/page';
import { FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short45Page',
  durationInSeconds: 43.5,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = PG.yellow;
const F = (s: number) => Math.round(s * 30);
const END = F(43.5);

// every cue is a spoken word — retimes itself when the real voice lands in vo.gen.ts
const key = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
const wAt = (line: number, word: string, nth = 0) => {
  const w = timeWords(VO[line]).filter((x) => key(x.w) === word)[nth];
  if (!w) throw new Error(`Short45Page: no word "${word}" (#${nth}) in VO line ${line} ("${VO[line].text}")`);
  return F(w.start);
};

// =============================================================================
// THIS LIFE — six areas, four open loops each. Item 0 of every area is its NEXT action.
// Illustrative, not a survey: the page says THIS LIFE.
// =============================================================================
const AREAS = [
  { label: 'Work', color: PG.indigo, items: ['Finish the deck', 'Reply to boss', 'Update CV', 'Book a 1:1'] },
  { label: 'Money', color: PG.teal, items: ['Pay the rent', 'Cancel the gym', 'File taxes', 'Start saving'] },
  { label: 'Health', color: PG.pink, items: ['Book dentist', 'Refill meds', 'Walk daily', 'Bed by 11'] },
  { label: 'People', color: '#9b7cc4', items: ['Call Mom', 'Text Sam', 'Gift for Ana', 'Plan a dinner'] },
  { label: 'Home', color: '#e0a458', items: ['Fix the tap', 'Laundry', 'Clear the desk', 'Renew lease'] },
  { label: 'You', color: '#d4b13c', items: ['Read 10 pages', 'Learn Spanish', 'Journal', 'Plan a trip'] },
];
// interleaved, so the head and the dump are a mix of areas, never a sorted list
const CHIPS = Array.from({ length: 24 }, (_, i) => {
  const a = i % 6;
  const k = Math.floor(i / 6);
  return { i, a, k, label: AREAS[a].items[k], color: AREAS[a].color, isNext: k === 0, lateIdx: k === 0 ? -1 : a * 3 + (k - 1) };
});
const N_NEXT = CHIPS.filter((c) => c.isNext).length;
const N_LATER = CHIPS.length - N_NEXT;
if (CHIPS.length !== 24 || N_NEXT !== 6 || N_LATER !== 18) throw new Error('Short45Page: VO says 24 loops = 6 next + 18 later');

// =============================================================================
// CUES — all spoken words.
// =============================================================================
const REW = wAt(1, 'right');
const SHOUT = wAt(2, 'shouting');
const STEP1 = wAt(3, 'step');
const DUMP = wAt(3, 'dump');
const SMALL = wAt(3, 'small');
const STEP2 = wAt(4, 'step');
const SORT = wAt(4, 'sort');
const AREA_AT = ['work', 'money', 'health', 'people', 'home', 'you'].map((w) => wAt(5, w));
const STEP3 = wAt(6, 'step');
const CIRCLE = wAt(6, 'circle');
const LATER = wAt(7, 'later');
const SIX = wAt(7, 'six');
const NOT24 = wAt(7, 'twentyfour');
const DONE = wAt(8, 'done');
const STUDIES = wAt(9, 'studies');
const QUIET = wAt(9, 'quieted');
const WRITTEN = wAt(10, 'written');
const LOOP = Math.min(END - 36, F(VO[10].end + 0.3));
const LOOP_SET = LOOP + 12;

// dump: 24 chips pour out between "dump" and just after "small"
const DUMP_DUR = 14;
const DUMP_STEP = (SMALL + 6 - DUMP - DUMP_DUR) / 23;

// =============================================================================
// LAYOUT
// =============================================================================
const PX = 70;
const PY = 440;
const PW = 860;
const PH = 940;
const BOX_W = 398;
const BOX_H = 196;
const boxXY = (a: number) => ({ x: PX + 24 + (a % 2) * (BOX_W + 16), y: PY + 84 + Math.floor(a / 2) * (BOX_H + 14) });
const LATER_Y = PY + 84 + 3 * (BOX_H + 14) + 2; // top of the LATER strip
const LATER_COL = 812 / 6;

const HEAD_BIG = { cx: 540, cy: 860, s: 1.3 };
const TALLY_Y = 190;
const HEAD_ICON = { cx: 70 + 64, cy: TALLY_Y + 66, s: 0.17 };

const headGeo = (i: number, hx: number, hy: number, s: number): Geo => {
  const p = seed(i, 24, 215, 205);
  const k = s * 0.62;
  return { x: hx + p.x * s, y: hy + p.y * s, w: 182 * k, h: 52 * k, fs: 20 * k, rot: (hash(i, 7) - 0.5) * 16 };
};
const dumpGeo = (i: number): Geo => {
  const cell = (i * 7) % 24; // 7 is coprime to 24 — a shuffle that never collides
  const c = cell % 4;
  const r = Math.floor(cell / 4);
  return {
    x: PX + 24 + (c + 0.5) * 203 + (hash(i, 1) - 0.5) * 56,
    y: PY + 90 + (r + 0.5) * 102 + (hash(i, 2) - 0.5) * 36,
    w: 182,
    h: 52,
    fs: 20,
    rot: (hash(i, 3) - 0.5) * 22,
  };
};
const slotGeo = (a: number, k: number): Geo => {
  const b = boxXY(a);
  return { x: b.x + 107 + (k % 2) * 194, y: b.y + 80 + Math.floor(k / 2) * 64, w: 182, h: 52, fs: 20, rot: 0 };
};
const nextGeo = (a: number): Geo => {
  const b = boxXY(a);
  return { x: b.x + BOX_W / 2, y: b.y + 104, w: 366, h: 80, fs: 31, rot: 0 };
};
const waitGeo = (a: number, k: number): Geo => {
  const b = boxXY(a);
  return { x: b.x + 73 + (k - 1) * 126, y: b.y + 170, w: 118, h: 30, fs: 12, rot: 0 };
};
const laterGeo = (a: number, k: number): Geo => ({
  x: PX + 24 + (a + 0.5) * LATER_COL,
  y: LATER_Y + 68 + (k - 1) * 42,
  w: 128,
  h: 34,
  fs: 14.5,
  rot: 0,
});

// =============================================================================
// PER-CHIP PROGRESS — the single source for both the drawing and the tallies.
// =============================================================================
const headPose = (f: number) => {
  const hs = EASE_INOUT(prog(f, STEP1, STEP1 + 22));
  return { cx: mix(HEAD_BIG.cx, HEAD_ICON.cx, hs), cy: mix(HEAD_BIG.cy, HEAD_ICON.cy, hs), s: mix(HEAD_BIG.s, HEAD_ICON.s, hs) };
};
const uRew = (f: number, i: number) => EASE_INOUT(prog(f, REW + (i % 8) * 1.5, REW + (i % 8) * 1.5 + 22));
const uDump = (f: number, i: number) => EASE_OUT(prog(f, DUMP + i * DUMP_STEP, DUMP + i * DUMP_STEP + DUMP_DUR));
const uSort = (f: number, i: number) => EASE_INOUT(prog(f, SORT + i * 0.8, SORT + i * 0.8 + 16));
const uPick = (f: number, a: number) => EASE_INOUT(prog(f, CIRCLE + a * 4, CIRCLE + a * 4 + 16));
const uLater = (f: number, j: number) => EASE_INOUT(prog(f, LATER - 4 + j, LATER - 4 + j + 16));
// area colour: fully on for the finished page, reset by the rewind, relit on its spoken word
const tintOf = (f: number, a: number) => (f < STEP1 ? 1 - prog(f, REW, REW + 12) : EASE_OUT(prog(f, AREA_AT[a], AREA_AT[a] + 8)));
const markOf = (f: number, a: number) => (f < STEP1 ? 1 - prog(f, REW, REW + 12) : EASE_OUT(prog(f, CIRCLE + a * 4 + 8, CIRCLE + a * 4 + 22)));

const chipState = (f: number, c: (typeof CHIPS)[number]) => {
  const hp = headPose(f);
  const final = c.isNext ? nextGeo(c.a) : laterGeo(c.a, c.k);
  const ur = uRew(f, c.i);
  const ud = uDump(f, c.i);
  let g = lerpGeo(final, headGeo(c.i, hp.cx, hp.cy, hp.s), ur);
  const dg = dumpGeo(c.i);
  g = lerpGeo(g, dg, ud);
  g = { ...g, y: g.y - Math.sin(Math.PI * ud) * 110 * (ud < 1 ? 1 : 0) }; // pour out in an arc
  g = lerpGeo(g, slotGeo(c.a, c.k), uSort(f, c.i));
  const up = uPick(f, c.a);
  if (c.isNext) {
    g = lerpGeo(g, nextGeo(c.a), up);
  } else {
    g = lerpGeo(g, waitGeo(c.a, c.k), up);
    g = lerpGeo(g, laterGeo(c.a, c.k), uLater(f, c.lateIdx));
  }
  const inHead = ur >= 0.5 && ud < 0.5;
  const later = c.isNext ? false : f < STEP1 ? ur < 0.5 : uLater(f, c.lateIdx) >= 0.5;
  const picked = c.isNext && markOf(f, c.a) >= 0.5;
  return { g, ur, ud, inHead, later, picked };
};

const tallies = (f: number) => {
  const st = CHIPS.map((c) => chipState(f, c));
  const inHead = st.filter((s) => s.inHead).length;
  return {
    inHead,
    onPage: CHIPS.length - inHead,
    next: st.filter((s) => s.picked).length,
    later: st.filter((s) => s.later).length,
    done: 0, // nothing on this page is ticked — that is the twist
  };
};

// module-load assertions: the VO's numbers are the page's numbers
{
  const t0 = tallies(0);
  if (t0.inHead !== 0 || t0.next !== 6 || t0.later !== 18) throw new Error(`Short45Page: frame 0 must read 0 / 6 / 18, got ${JSON.stringify(t0)}`);
  const tShout = tallies(SHOUT);
  if (tShout.inHead !== 24) throw new Error(`Short45Page: "twenty-four open loops" but ${tShout.inHead} in the head`);
  const tSmall = tallies(SMALL + 12);
  if (tSmall.inHead !== 0) throw new Error(`Short45Page: dump must empty the head by "small", ${tSmall.inHead} left`);
  const tSix = tallies(SIX);
  if (tSix.next !== 6 || tSix.later !== 18) throw new Error(`Short45Page: "six things" must read 6 next / 18 later, got ${JSON.stringify(tSix)}`);
  const tEnd = tallies(END - 1);
  if (tEnd.inHead !== t0.inHead || tEnd.next !== t0.next || tEnd.later !== t0.later) throw new Error('Short45Page: last frame must count like frame 0');
}

// =============================================================================
// THE SHOT — one sheet of paper, one head, 24 loops. No cuts.
// =============================================================================
export default function Short45Page() {
  const f = useCurrentFrame();
  const t = tallies(f);
  const hp = headPose(f);

  // punch-in: frame 0 is at 1.06 and settles; the loop grows back to 1.06 so the wrap is seamless
  const scale = f < LOOP ? mix(1.06, 1, EASE_OUT(prog(f, 0, 30))) : mix(1, 1.06, EASE_INOUT(prog(f, LOOP, END - 1)));

  const titleO = f < LOOP ? 1 - prog(f, REW - 4, REW + 6) : EASE_OUT(prog(f, LOOP, LOOP_SET));
  const outro = 1 - prog(f, LOOP, LOOP_SET);
  const pageIn = EASE_OUT(prog(f, STEP1 + 4, STEP1 + 20));
  const pageO = f < STEP1 ? 1 - prog(f, REW + 4, REW + 18) : pageIn;
  const boxO = f < STEP1 ? pageO : prog(f, SORT - 6, SORT + 6);
  const laterO = f < STEP1 ? pageO : prog(f, LATER - 10, LATER);
  const stepLit = [STEP1, STEP2, STEP3].map((s) => (f < STEP1 ? 1 - prog(f, REW, REW + 10) : prog(f, s, s + 8)));

  const headO = prog(f, REW, REW + 12) * outro;
  const tallyO = prog(f, REW + 6, REW + 18) * outro;
  const shoutK = prog(f, SHOUT - 4, SHOUT + 4) * (1 - prog(f, STEP1, STEP1 + 10));
  const noise = (t.inHead / 24) * (0.35 + 0.65 * shoutK);
  const calm = EASE_OUT(prog(f, QUIET, QUIET + 14)) * outro;
  const doneK = f >= DONE ? 1 : 0;
  const ring = Math.sin(Math.PI * prog(f, DONE, DONE + 30));
  const citeO = prog(f, STUDIES - 4, STUDIES + 8) * outro;

  return (
    <AbsoluteFill style={{ background: '#0f1216' }}>
      <ShortsBackdrop />

      {/* THE PAGE + its chips — the canvas the whole video happens on */}
      <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: '500px 910px' }}>
        <Paper x={PX} y={PY} w={PW} h={PH} opacity={pageO} lift={f < STEP1 ? 0 : (1 - pageIn) * 70}>
          <StepPills x={24} y={22} steps={['Dump', 'Sort', 'Pick one']} lit={stepLit} />
          <div
            style={{
              position: 'absolute',
              right: 28,
              top: 34,
              fontFamily: FONT_MONO,
              fontWeight: 500,
              fontSize: 20,
              letterSpacing: 2,
              color: PG.muted,
            }}
          >
            THIS LIFE · 1 PAGE
          </div>
        </Paper>
        {AREAS.map((ar, a) => {
          const b = boxXY(a);
          return <AreaBox key={a} x={b.x} y={b.y} w={BOX_W} h={BOX_H} label={ar.label} color={ar.color} lit={tintOf(f, a)} opacity={boxO} />;
        })}
        {laterO > 0.01 ? (
          <div
            style={{
              position: 'absolute',
              left: PX + 24,
              top: LATER_Y,
              width: 812,
              height: 196,
              opacity: laterO,
              borderRadius: 14,
              background: PG.cream,
              border: `1.5px solid ${PG.line}`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 18,
                top: 12,
                fontFamily: FONT_MONO,
                fontWeight: 700,
                fontSize: 24,
                letterSpacing: 3,
                color: PG.muted,
              }}
            >
              {`LATER · ${t.later}`}
            </div>
          </div>
        ) : null}

        {/* chips: LATER ones first so the NEXT actions always sit on top */}
        {[...CHIPS]
          .sort((x, y) => Number(x.isNext) - Number(y.isNext))
          .map((c) => {
            const s = chipState(f, c);
            const inHeadK = s.ur * (1 - s.ud);
            const amp = inHeadK * (1.5 + 7 * shoutK) * (hp.s / HEAD_BIG.s);
            const jx = Math.sin(f * (0.35 + 0.5 * shoutK) + c.i * 1.9) * amp;
            const jy = Math.cos(f * (0.31 + 0.5 * shoutK) + c.i * 2.7) * amp;
            const waitDim = c.isNext ? 1 : 1 - 0.35 * uPick(f, c.a) * (1 - uLater(f, c.lateIdx));
            return (
              <LoopChip
                key={c.i}
                g={s.g}
                label={c.label}
                color={c.color}
                tint={tintOf(f, c.a)}
                pick={c.isNext ? markOf(f, c.a) : 0}
                ring={c.isNext ? ring : 0}
                opacity={waitDim}
                jx={jx}
                jy={jy}
              />
            );
          })}
      </AbsoluteFill>

      {/* THE HEAD — big in the setup, then it shrinks into its own tally */}
      <Tally x={70} y={TALLY_Y} w={330} label="In your head" value={String(t.inHead)} padLeft={132}
        color={calm > 0.5 ? PG.teal : t.inHead > 0 ? PG.pink : '#ffffff'} opacity={tallyO} glow={calm} />
      <Head cx={hp.cx} cy={hp.cy} s={hp.s} opacity={headO} noise={noise} calm={calm} t={f} />
      <Tally x={412} y={TALLY_Y} w={250} label="On the page" value={String(t.onPage)} opacity={tallyO * prog(f, STEP1 + 4, STEP1 + 14) * (1 - 0.5 * prog(f, NOT24, NOT24 + 8))} />
      <Tally
        x={674}
        y={TALLY_Y}
        w={252}
        label={doneK ? 'Done' : 'Next'}
        value={doneK ? `${t.done} / ${t.next}` : String(t.next)}
        color={doneK ? PG.pink : ACCENT}
        opacity={tallyO * prog(f, CIRCLE - 4, CIRCLE + 6)}
        pop={Math.sin(Math.PI * prog(f, SIX, SIX + 12)) + Math.sin(Math.PI * prog(f, DONE, DONE + 12))}
      />
      {citeO > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            left: 70,
            width: 860,
            top: 344,
            textAlign: 'center',
            opacity: citeO,
            fontFamily: FONT_MONO,
            fontSize: 22,
            letterSpacing: 1,
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          Masicampo &amp; Baumeister, J. Pers. Soc. Psych. (2011)
        </div>
      ) : null}

      <Stamp text="Written, not done" at={WRITTEN - 2} until={LOOP + 10} color={PG.teal} x={500} y={860} size={68} rotate={-6} />

      {/* HOOK / LOOP title — the same words on frame 0 and the last frame */}
      <div style={{ position: 'absolute', inset: 0, opacity: titleO }}>
        <BigTitle warm size={84} y={200} lines={[{ text: 'Your whole life' }, { text: 'on one page', color: ACCENT }]} />
      </div>

      <Captions lines={VO} accent={ACCENT} y={1500} />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
