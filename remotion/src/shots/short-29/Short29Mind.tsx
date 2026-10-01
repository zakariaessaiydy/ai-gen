import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import {
  EASE_INOUT,
  EASE_OUT,
  FrontMark,
  Head,
  LOOP_COLORS as C,
  LoopDefs,
  NextStep,
  Notepad,
  PadBox,
  Ring,
  RingHalf,
  Thought,
  ThoughtChip,
  comebacks,
  flight,
  mix,
  orbitPose,
  padHeight,
  slotPt,
} from '../../lib/loops';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short29Mind',
  durationInSeconds: 44.0,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = C.accent;
const F = (s: number) => Math.round(s * 30);
const END = F(compositionConfig.durationInSeconds); // 1320

// =============================================================================
// CUES — read from the REAL word times in vo.gen.ts, never typed. Re-placing a VO line moves
// every cue that belongs to it. A key that is not in its line throws, so a script edit that
// drops a cue word fails loudly instead of silently landing on the line start.
// =============================================================================
const key = (w: string) => w.toLowerCase().replace(/’/g, "'").replace(/[^a-z0-9'-]/g, '');
const wAt = (line: number, word: string, edge: 'start' | 'end' = 'start') => {
  const l = VO[line];
  if (!l.words || l.words.length === 0) return F(l.start);
  const w = l.words.find((x) => key(x.w).startsWith(word));
  if (!w) throw new Error(`Short29Mind: no word "${word}" in VO line ${line} ("${l.text}")`);
  return F(w[edge]);
};
const lineStart = (i: number) => F(VO[i].start);
const lineEnd = (i: number) => F(VO[i].end);

// VO lines: 0 hook · 1 unfinished/night · 2 stop · 3 write · 4 next step · 5 the list · 6 plan ·
//           7 sleep lab · 8 already done · 9 specific · 10 page
const REOPEN_A = wAt(1, 'unfinished') - 4; // the list un-writes and the thoughts lift off the paper
const FLY = 20;
const STAG = 6;
const REOPEN_B = REOPEN_A + 3 * STAG + FLY; // all four back in orbit
const HOOK_OUT = REOPEN_A - 6;
const FRONT_A = wAt(1, 'coming'); // FRONT OF MIND, on "coming back"
const STOP_A = wAt(2, 'stop');
const CLOSE_W = wAt(2, 'close');
const QUIZ_A = lineEnd(2);
const QUIZ_B = lineStart(3) - 3;
const WRITE_A = wAt(3, 'write'); // the paper lights
const CLOSE_AT = [wAt(5, 'email'), wAt(5, 'rent'), wAt(5, 'dentist'), wAt(5, 'slides')];
const PLATE_A = lineStart(7);
const TODO_W = wAt(7, 'to-do');
const NINE_W = wAt(7, 'nine');
const HELP_W = wAt(8, 'didn');
const PLATE_B = lineStart(9) - 2;
const SPEC_W = wAt(9, 'specific');
const TITLE_A = lineStart(10) - 8;
const PAGE_W = wAt(10, 'page');
const PUNCH_A = lineStart(10);

// =============================================================================
// THE MODEL — four open loops on four tilted rings inside one head.
//
// Laps are INTEGERS over the composition, so every orbit is where it started at the wrap. Each
// phase0 is SOLVED, not chosen: the thought is at the front of its ring on the frame its own name
// is spoken in the reveal, so it is written down at the moment it comes back.
// =============================================================================
const RINGS: Ring[] = [
  { cx: 520, cy: 515, rx: 215, ry: 52, tilt: -6 },
  { cx: 530, cy: 600, rx: 235, ry: 60, tilt: 4 },
  { cx: 520, cy: 685, rx: 210, ry: 52, tilt: -5 },
  { cx: 530, cy: 765, rx: 175, ry: 42, tilt: 6 },
];
const BASE = [
  { id: 'email', text: 'the email to Sam', time: '9:00', step: 'reply in two lines', ring: 1, laps: 6, color: C.indigo },
  { id: 'rent', text: 'rent is due', time: 'Fri', step: 'pay it at lunch', ring: 0, laps: 8, color: C.pink },
  { id: 'dentist', text: 'call the dentist', time: '12:30', step: 'book a check-up', ring: 2, laps: 7, color: C.teal },
  { id: 'slides', text: 'slides for Monday', time: '8:30', step: 'slide 3 first', ring: 3, laps: 9, color: C.violet },
];
const frac = (x: number) => x - Math.floor(x);
const THOUGHTS: Thought[] = BASE.map((b, i) => ({ ...b, phase0: frac(0.25 - (b.laps * CLOSE_AT[i]) / END) }));
THOUGHTS.forEach((t) => {
  if (!Number.isInteger(t.laps)) throw new Error(`Short29Mind: ${t.id} laps must be an integer (loop safety)`);
});

const PAD: PadBox = { x: 100, y: 990, w: 800, head: 58, rowH: 60, col2: 410 };
/** The whole head + paper sit 30px lower than their drawn coordinates, clearing the title. */
const DY = 30;

// The twist's two published means (Scullin et al. 2018, Table 1). The gap is computed, not typed.
const DONE_MIN = 25.09;
const TODO_MIN = 15.82;
const GAP_MIN = DONE_MIN - TODO_MIN;

// =============================================================================
// THE SCALARS — each is the same value at frame 0 and frame END-1 by construction.
// =============================================================================
/** 1 = on paper, 0 = circling. 1 at both ends: frame 0 is the closed list, the setup re-opens it. */
const closedAt = (i: number, f: number) => {
  const a = REOPEN_A + i * STAG;
  if (f < a + FLY) return 1 - EASE_INOUT(prog(f, a, a + FLY));
  const c = CLOSE_AT[i] - 4;
  return EASE_INOUT(prog(f, c, c + FLY));
};
/** How much of the next step is written. Un-writes just before the lift, re-writes after landing. */
const writeAt = (i: number, f: number) => {
  const a = REOPEN_A + i * STAG;
  if (f < a + FLY) return 1 - prog(f, a - 10, a + 2);
  const c = CLOSE_AT[i] - 4 + FLY;
  return prog(f, c - 2, c + 22);
};
const isOpen = (i: number) => (f: number) => closedAt(i, f) < 0.5;
const bump = (f: number, a: number, b: number) => Math.sin(Math.PI * prog(f, a, b));

// =============================================================================
// THE CANVAS — one head, one sheet of paper, on GLOBAL time.
// =============================================================================
const Canvas: React.FC = () => {
  const f = useCurrentFrame();
  const poses = THOUGHTS.map((th, i) => {
    const o = orbitPose(th, RINGS[th.ring], f, END);
    const c = closedAt(i, f);
    const slot = slotPt(PAD, i, th.text);
    const p = c <= 0 ? o : c >= 1 ? slot : flight(o, slot, c);
    return {
      th,
      i,
      c,
      x: p.x,
      y: p.y,
      scale: mix(o.scale, 1, c),
      opacity: mix(o.opacity, 1, c),
      glow: o.front * (1 - c),
      z: mix(o.depth, 3, c),
    };
  });
  const busy = poses.reduce((s, p) => s + (1 - p.c), 0) / poses.length;
  const pulse = Math.max(0, ...poses.map((p) => p.glow));
  const ringOp = (r: number) => {
    const p = poses.find((q) => q.th.ring === r);
    return 0.16 + 0.62 * (p ? 1 - p.c : 0);
  };
  const frontOp = EASE_OUT(prog(f, FRONT_A, FRONT_A + 12)) * (1 - prog(f, QUIZ_B - 10, QUIZ_B));
  const padGlow = bump(f, WRITE_A - 4, WRITE_A + 26) + bump(f, PAGE_W - 4, PAGE_W + 36);
  const stopOp = EASE_OUT(prog(f, STOP_A, STOP_A + 8)) * (1 - prog(f, CLOSE_W + 22, CLOSE_W + 34));
  const strike = EASE_OUT(prog(f, CLOSE_W, CLOSE_W + 8));

  const punch =
    f < 150 ? 1.06 + (1.0 - 1.06) * EASE_OUT(prog(f, 0, 90)) : 1.0 + (1.06 - 1.0) * EASE_INOUT(prog(f, PUNCH_A, END - 1));
  const cx = 540;
  const cy = 820;
  const sorted = [...poses].sort((a, b) => a.z - b.z);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <LoopDefs />
        <g transform={`translate(${cx} ${cy}) scale(${punch}) translate(${-cx} ${-cy + DY})`}>
          <Head busy={busy} pulse={pulse} />
          {RINGS.map((r, i) => (
            <RingHalf key={`b${i}`} ring={r} half="back" opacity={ringOp(i)} />
          ))}
          {RINGS.map((r, i) => (
            <RingHalf key={`f${i}`} ring={r} half="front" opacity={ringOp(i)} />
          ))}
          {RINGS.map((r, i) => (
            <FrontMark key={`m${i}`} ring={r} opacity={frontOp} label={i === RINGS.length - 1 ? 'FRONT OF MIND' : undefined} />
          ))}

          {/* SETUP — telling it to stop: the sign sits in the head and the loops go straight through it */}
          <g opacity={stopOp}>
            <text
              x={520}
              y={630}
              textAnchor="middle"
              style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 120, letterSpacing: 8, fill: C.pink, opacity: 0.85 }}
            >
              STOP
            </text>
            <line x1={370} y1={592} x2={370 + 300 * strike} y2={592} stroke={C.text} strokeWidth={10} strokeLinecap="round" />
          </g>

          <Notepad pad={PAD} rows={THOUGHTS.length} title="TOMORROW" glow={Math.min(1, padGlow)} />
          {THOUGHTS.map((th, i) => (
            <NextStep key={th.id} pad={PAD} i={i} th={th} write={writeAt(i, f)} timeGlow={bump(f, SPEC_W + i * 4, SPEC_W + i * 4 + 40)} />
          ))}

          {sorted.map((p) => (
            <ThoughtChip
              key={p.th.id}
              x={p.x}
              y={p.y}
              text={p.th.text}
              color={p.th.color}
              scale={p.scale}
              opacity={p.opacity}
              glow={p.glow}
              onPaper={p.c}
            />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** SETUP: passes of the front of the mind, counted off the orbits. REVEAL: loops still open. */
const Readout: React.FC = () => {
  const f = useCurrentFrame();
  const aOp = EASE_OUT(prog(f, REOPEN_B, REOPEN_B + 12)) * (1 - prog(f, WRITE_A - 10, WRITE_A - 4));
  const bOp = EASE_OUT(prog(f, WRITE_A, WRITE_A + 12)) * (1 - prog(f, PLATE_A - 12, PLATE_A));
  const op = Math.max(aOp, bOp);
  if (op <= 0.01) return null;
  const setup = aOp > 0.01;
  const big = setup
    ? `×${THOUGHTS.reduce((s, th, i) => s + comebacks(th, REOPEN_B, f, END, isOpen(i)), 0)}`
    : `${THOUGHTS.filter((_, i) => isOpen(i)(f)).length}`;
  const color = setup ? C.pink : ACCENT;
  return (
    <div style={{ position: 'absolute', top: 262, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: op }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          background: 'rgba(12,14,20,0.84)',
          border: `2px solid ${color}44`,
          borderRadius: 22,
          padding: '8px 32px',
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color, lineHeight: 1, minWidth: 80, textAlign: 'center' }}>
          {big}
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 28, color: C.text, lineHeight: 1.1 }}>
          {setup ? (
            <>
              BACK AT THE
              <br />
              FRONT OF YOUR MIND
            </>
          ) : (
            <>
              OPEN
              <br />
              LOOPS
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/** TWIST — the sleep-lab result, drawn as the two measured means. */
const Evidence: React.FC = () => {
  const f = useCurrentFrame();
  const op = EASE_OUT(prog(f, PLATE_A, PLATE_A + 14)) * (1 - prog(f, PLATE_B - 12, PLATE_B));
  if (op <= 0.01) return null;
  const PX = 21.5; // px per minute
  const X0 = 262;
  const doneW = DONE_MIN * PX * EASE_OUT(prog(f, PLATE_A + 6, PLATE_A + 24));
  const todoW = TODO_MIN * PX * EASE_OUT(prog(f, TODO_W, TODO_W + 18));
  const gapOp = EASE_OUT(prog(f, NINE_W, NINE_W + 10));
  const help = bump(f, HELP_W, HELP_W + 30);
  const y1 = 14;
  const y2 = 74;
  const bh = 40;
  const lbl = { fontFamily: FONT_BODY, fontWeight: 700, fontSize: 20, letterSpacing: 0.5 } as const;
  const val = { fontFamily: FONT_MONO, fontWeight: 700, fontSize: 20, fill: C.ink } as const;
  return (
    <div
      style={{
        position: 'absolute',
        top: 262,
        left: 70,
        right: 150,
        opacity: op,
        transform: `translateY(${(1 - op) * 12}px)`,
        background: 'rgba(12,14,20,0.93)',
        border: `2px solid ${C.teal}66`,
        borderLeft: `10px solid ${C.teal}`,
        borderRadius: 18,
        padding: '14px 24px 12px',
      }}
    >
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 29, color: C.text, lineHeight: 1.1 }}>
        5 MINUTES OF WRITING, THEN LIGHTS OUT
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 19, color: C.dim, marginTop: 4 }}>minutes to fall asleep · measured in the lab</div>
      <svg width={816} height={150} viewBox="0 0 816 150" style={{ display: 'block', marginTop: 8 }}>
        <text x={0} y={y1 + 28} style={{ ...lbl, fill: C.pink }}>
          WHAT THEY'D DONE
        </text>
        <rect x={X0} y={y1} width={doneW} height={bh} rx={8} fill={C.pink} opacity={0.85 + 0.15 * help} />
        {help > 0.01 ? <rect x={X0} y={y1} width={doneW} height={bh} rx={8} fill={C.pink} opacity={0.5 * help} filter="url(#loopGlow)" /> : null}
        {doneW > 120 ? (
          <text x={X0 + doneW - 12} y={y1 + 27} textAnchor="end" style={val}>
            {DONE_MIN.toFixed(1)} min
          </text>
        ) : null}

        <text x={0} y={y2 + 28} style={{ ...lbl, fill: C.teal }}>
          TO-DO LIST
        </text>
        <rect x={X0} y={y2} width={todoW} height={bh} rx={8} fill={C.teal} />
        {todoW > 120 ? (
          <text x={X0 + todoW - 12} y={y2 + 27} textAnchor="end" style={val}>
            {TODO_MIN.toFixed(1)} min
          </text>
        ) : null}

        <g opacity={gapOp}>
          <line x1={X0 + TODO_MIN * PX + 6} y1={y2 + bh / 2} x2={X0 + DONE_MIN * PX} y2={y2 + bh / 2} stroke={ACCENT} strokeWidth={3} strokeDasharray="6 6" />
          <line x1={X0 + DONE_MIN * PX} y1={y1 + bh + 2} x2={X0 + DONE_MIN * PX} y2={y2 + bh} stroke={ACCENT} strokeWidth={3} />
          <text
            x={X0 + ((TODO_MIN + DONE_MIN) / 2) * PX + 3}
            y={y2 + bh + 26}
            textAnchor="middle"
            style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 24, fill: ACCENT }}
          >
            {GAP_MIN.toFixed(1)} MIN FASTER
          </text>
        </g>
      </svg>
      <div style={{ fontFamily: FONT_BODY, fontSize: 19, color: C.dim, marginTop: 2 }}>
        Scullin et al. 2018 · J Exp Psychol Gen · 57 adults, 18–30 · one sleep-lab night
      </div>
    </div>
  );
};

const Title: React.FC = () => {
  const f = useCurrentFrame();
  const op = f < TITLE_A ? 1 - prog(f, HOOK_OUT - 10, HOOK_OUT) : EASE_OUT(prog(f, TITLE_A, TITLE_A + 20));
  if (op <= 0.01) return null;
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <BigTitle
        warm
        y={92}
        size={78}
        lines={[{ text: 'STOP OVERTHINKING' }, { text: 'AT NIGHT', color: ACCENT }]}
        subtitle="close the loop. on paper."
      />
    </AbsoluteFill>
  );
};

// =============================================================================
// THE SHOT
// =============================================================================
export default function Short29Mind() {
  return (
    <AbsoluteFill style={{ background: C.stage }}>
      <ShortsBackdrop base={C.stage} glow={C.glow} />
      <Canvas />
      <Readout />
      <Evidence />
      <Title />

      <Sequence from={HOOK_OUT} durationInFrames={QUIZ_A - HOOK_OUT}>
        <Kicker text="WHY IT KEEPS COMING BACK" at={6} color={C.pink} />
      </Sequence>

      <Sequence from={QUIZ_A} durationInFrames={QUIZ_B - QUIZ_A}>
        <PauseCard subtitle="what closes a loop?" durSec={(QUIZ_B - QUIZ_A) / 30} y={PAD.y + DY + padHeight(PAD, THOUGHTS.length) / 2} accent={ACCENT} />
      </Sequence>

      <Sequence from={QUIZ_B} durationInFrames={PLATE_A - QUIZ_B}>
        <Kicker text="CLOSE IT ON PAPER" at={6} />
      </Sequence>

      <Sequence from={PLATE_A} durationInFrames={TITLE_A - PLATE_A}>
        <Kicker text="MEASURED IN A SLEEP LAB" at={6} until={PLATE_B - PLATE_A} color={C.teal} />
      </Sequence>

      {/* GLOBAL */}
      <Captions lines={VO} y={1400} accent={ACCENT} plate />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
