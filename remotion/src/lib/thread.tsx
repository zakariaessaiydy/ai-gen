// =============================================================================
// lib/thread.tsx — THE CONVERSATION TREE ENGINE
//
// The subject is not a quantity, a schedule or a configuration: it is a GRAPH with a
// termination rule. A conversation is a chain of turns, and a child's answer is not measured
// by its LENGTH but by its HOOKS — the fragments inside it that can themselves be asked about.
//
// A hookless answer ("Fine.") is a TERMINAL NODE. The chain cannot continue through it, so the
// next question has to be invented from nothing, which is why the parent ends up doing most of
// the talking. An answer carrying hooks is an INTERNAL node: every hook is a next question the
// parent did not have to think of, and the chain walks itself.
//
// Nothing on screen is keyframed and no total is typed. `countWords`, `countHooks` and
// `sharePct` run every frame over the bubbles that are ACTUALLY DRAWN on that frame, so the
// readouts climb as the thread builds and a mis-authored exchange shows a wrong number instead
// of hiding behind a hand-animated counter. The echo link ("you say their words back") is not
// a flag either — `echoOf` finds it by matching the question's words against the previous
// answer's hooks. Same ethos as overlap.tsx's set algebra and cycle.tsx's conserved particles.
//
// Generic for a series: any "why did this conversation die" question is a new pair of threads,
// not a new engine — an interview that goes nowhere, a standup, a sales call, a therapy
// session, a code review that gets "looks good".
// =============================================================================
import React from 'react';
import { Easing } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const TH = {
  stage: '#0b0e14',
  text: '#e8ecf5',
  dim: '#8b93a7',
  faint: 'rgba(232,236,245,0.40)',
  edge: 'rgba(255,255,255,0.13)',
  live: '#4db8a8', // the thread that keeps going
  dead: '#e8879f', // the thread that terminates
  warn: '#f5d76e',
  indigo: '#6366F1',
  parentBg: 'rgba(255,255,255,0.045)',
  parentEdge: 'rgba(255,255,255,0.13)',
  ink: '#0b0e14',
} as const;

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// =============================================================================
// THE MODEL
// =============================================================================
export type Exchange = { parent: string; child: string; hooks: string[] };
export type Tone = 'dead' | 'live';
export type Thread = { id: string; head: string; exchanges: Exchange[]; tone: Tone };

export const toneColor = (t: Tone) => (t === 'live' ? TH.live : TH.dead);

// =============================================================================
// THE ALGEBRA — every number the video shows comes out of these five functions, evaluated
// against the VISIBLE slice of the thread on the current frame.
//
// `shown` counts BUBBLES, not exchanges: bubble 2i is exchange i's question, 2i+1 its answer.
// It is fractional, so a bubble that is half faded-in contributes half its words and the
// counters climb continuously instead of stepping.
// =============================================================================
export const bubbleCount = (ex: Exchange[]) => ex.length * 2;

/** How much of bubble `bi` is on screen right now. */
export const visOf = (shown: number, bi: number) => clamp01(shown - bi);

export const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

const weigh = (ex: Exchange[], shown: number, pick: (e: Exchange, kind: 'p' | 'c') => number) => {
  let t = 0;
  for (let i = 0; i < ex.length; i++) {
    t += pick(ex[i], 'p') * visOf(shown, i * 2);
    t += pick(ex[i], 'c') * visOf(shown, i * 2 + 1);
  }
  return t;
};

/** Words said by one side of the drawn conversation. */
export const countWords = (ex: Exchange[], shown: number, who: 'p' | 'c') =>
  Math.round(weigh(ex, shown, (e, k) => (k === who ? wordCount(k === 'p' ? e.parent : e.child) : 0)));

/** Hooks currently on the board — the number of next questions the parent gets for free. */
export const countHooks = (ex: Exchange[], shown: number) =>
  Math.round(weigh(ex, shown, (e, k) => (k === 'c' ? e.hooks.length : 0)));

/** The parent's share of the drawn words. 0 when nothing is drawn — never NaN. */
export const sharePct = (ex: Exchange[], shown: number) => {
  const p = weigh(ex, shown, (e, k) => (k === 'p' ? wordCount(e.parent) : 0));
  const c = weigh(ex, shown, (e, k) => (k === 'c' ? wordCount(e.child) : 0));
  return p + c < 0.5 ? 0 : Math.round((p / (p + c)) * 100);
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * DERIVED, NOT DECLARED: which hook of the previous answer this question is made of.
 * "Only big kids." is hook #2 verbatim; "Not fair." is contained in "that's not fair".
 * Returns the hook's index, or -1 when the parent had to invent the question from nothing.
 */
export const echoOf = (parent: string, prevHooks: string[]) => {
  const p = norm(parent);
  if (!p) return -1;
  for (let i = 0; i < prevHooks.length; i++) {
    const h = norm(prevHooks[i]);
    if (h && (h.indexOf(p) >= 0 || p.indexOf(h) >= 0)) return i;
  }
  return -1;
};

// =============================================================================
// TEXT METRICS — deterministic, because measuring the DOM would need an effect and effects are
// banned in a Remotion frame. Every line is wrapped HERE, so the estimated height IS the
// rendered height and a column can be pre-scaled to fit its rail exactly.
// =============================================================================
const CHAR_W = 0.55; // Inter 500, conservative

export const cplFor = (widthPx: number, fontSize: number) =>
  Math.max(8, Math.floor((widthPx * 0.97) / (fontSize * CHAR_W)));

export const wrap = (text: string, cpl: number): string[] => {
  const out: string[] = [];
  let line = '';
  for (const w of text.split(/\s+/).filter(Boolean)) {
    if (!line) line = w;
    else if (line.length + 1 + w.length <= cpl) line += ' ' + w;
    else {
      out.push(line);
      line = w;
    }
  }
  if (line) out.push(line);
  return out.length ? out : [''];
};

const chipW = (s: string, size: number) => Math.round(s.length * size * 0.62) + size * 1.35;

/** Greedy chip packing — returns how many rows the hook row takes at this width. */
export const chipRows = (hooks: string[], width: number, size: number) => {
  if (!hooks.length) return 1; // the empty socket still takes a row
  let rows = 1;
  let x = 0;
  for (const h of hooks) {
    const w = chipW(h, size);
    if (x > 0 && x + 8 + w > width) {
      rows++;
      x = w;
    } else x += (x > 0 ? 8 : 0) + w;
  }
  return rows;
};

// =============================================================================
// LAYOUT — a pure function of the model and the column width. The rail is then scaled by
// railH/total, so editing the dialogue re-fits the column instead of overflowing it.
// =============================================================================
export type Metrics = {
  gutter: number;
  pad: number;
  pFont: number;
  pLh: number;
  cFont: number;
  cLh: number;
  chip: number;
  chipH: number;
  gap: number;
  stubGap: number;
};

export const M: Metrics = {
  gutter: 26,
  pad: 14,
  pFont: 23,
  pLh: 30,
  cFont: 26,
  cLh: 34,
  chip: 19,
  chipH: 32,
  gap: 14,
  stubGap: 22,
};

export type Node = {
  kind: 'p' | 'c';
  bi: number; // bubble index — what `shown` is measured in
  ei: number; // exchange index
  lines: string[];
  hooks: string[];
  terminal: boolean; // a hookless answer: the chain stops here
  echo: number; // index of the hook in the PREVIOUS answer this question reuses, or -1
  lineUp: boolean;
  lineDown: boolean;
  h: number;
  gapAfter: number;
};

export type Layout = { nodes: Node[]; total: number; bubbleW: number; textW: number };

export const layoutThread = (th: Thread, colW: number, m: Metrics = M): Layout => {
  const bubbleW = colW - m.gutter;
  const textW = bubbleW - m.pad * 2;
  const pCpl = cplFor(textW, m.pFont);
  const cCpl = cplFor(textW, m.cFont);
  const nodes: Node[] = [];
  let total = 0;

  th.exchanges.forEach((e, ei) => {
    const prev = ei > 0 ? th.exchanges[ei - 1] : null;
    const prevOpen = !!prev && prev.hooks.length > 0;
    const last = ei === th.exchanges.length - 1;

    const pLines = wrap(e.parent, pCpl);
    const pH = m.pad * 2 + pLines.length * m.pLh;
    nodes.push({
      kind: 'p',
      bi: ei * 2,
      ei,
      lines: pLines,
      hooks: [],
      terminal: false,
      echo: prev ? echoOf(e.parent, prev.hooks) : -1,
      lineUp: prevOpen,
      lineDown: true,
      h: pH,
      gapAfter: m.gap,
    });

    const cLines = wrap(e.child, cCpl);
    const rows = chipRows(e.hooks, textW, m.chip);
    const cH = m.pad * 2 + cLines.length * m.cLh + 10 + rows * m.chipH + (rows - 1) * 8;
    const terminal = e.hooks.length === 0;
    const gapAfter = last ? 0 : terminal ? m.stubGap : m.gap;
    nodes.push({
      kind: 'c',
      bi: ei * 2 + 1,
      ei,
      lines: cLines,
      hooks: e.hooks,
      terminal,
      echo: -1,
      lineUp: true,
      lineDown: !terminal && !last,
      h: cH,
      gapAfter,
    });

    total += pH + m.gap + cH + gapAfter;
  });

  return { nodes, total, bubbleW, textW };
};

// =============================================================================
// THE SPINE — each node draws its own piece of it, so the chain assembles and breaks with the
// bubbles instead of needing a measured path. A terminal answer gets a cap, not a line.
// =============================================================================
const DOT_Y = 24; // the node dot sits on the first line of text, not the middle of the bubble

const Spine: React.FC<{ node: Node; color: string; gap: number }> = ({ node, color, gap }) => {
  const filled = node.kind === 'c';
  return (
    <div style={{ position: 'relative', width: M.gutter, flex: '0 0 auto' }}>
      {node.lineUp ? (
        <div
          style={{
            position: 'absolute',
            left: 12,
            top: -gap,
            width: 2,
            height: gap + DOT_Y - 6,
            background: color + '55',
          }}
        />
      ) : null}
      {node.lineDown ? (
        <div
          style={{
            position: 'absolute',
            left: 12,
            top: DOT_Y + 6,
            bottom: -gap,
            width: 2,
            background: color + '55',
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: 6,
          top: DOT_Y - 6,
          width: 12,
          height: 12,
          borderRadius: 12,
          background: filled ? color : 'transparent',
          border: '2px solid ' + (filled ? color : color + '88'),
          boxSizing: 'border-box',
        }}
      />
      {node.terminal ? (
        <div style={{ position: 'absolute', left: 3, bottom: 10, width: 18, height: 2, background: color + 'aa' }} />
      ) : null}
    </div>
  );
};

// =============================================================================
// HOOK CHIPS — one per askable fragment. A hookless answer shows the empty socket instead:
// a dashed outline with nothing in it, which is the whole argument in one shape.
// =============================================================================
export type Sweep = { pos: number; amt: number } | null;

const Chips: React.FC<{ hooks: string[]; color: string; lit: number; ring: number; sweep: Sweep }> = ({
  hooks,
  color,
  lit,
  ring,
  sweep,
}) => {
  if (!hooks.length)
    return (
      <div style={{ marginTop: 10, display: 'flex' }}>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontWeight: 600,
            fontSize: M.chip,
            letterSpacing: 2,
            color: color + 'cc',
            border: '2px dashed ' + color + '66',
            borderRadius: M.chipH,
            padding: '0 ' + M.chip + 'px',
            height: M.chipH,
            lineHeight: M.chipH - 4 + 'px',
            boxSizing: 'border-box',
          }}
        >
          NOTHING TO ASK
        </div>
      </div>
    );
  return (
    <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {hooks.map((h, i) => {
        const on = clamp01(lit - i * 0.34);
        const ringed = i === ring ? 1 : 0;
        const glow = sweep ? sweep.amt * clamp01(1 - Math.abs(sweep.pos - i)) : 0;
        return (
          <div
            key={i}
            style={{
              fontFamily: FONT_BODY,
              fontWeight: 600,
              fontSize: M.chip,
              letterSpacing: 1.2,
              color: TH.ink,
              background: color,
              borderRadius: M.chipH,
              padding: '0 ' + Math.round(M.chip * 0.72) + 'px',
              height: M.chipH,
              lineHeight: M.chipH + 'px',
              opacity: 0.35 + 0.65 * on,
              transform: 'scale(' + (0.9 + 0.1 * EASE_OUT(on) + 0.05 * ringed + 0.06 * glow) + ')',
              boxShadow:
                ringed || glow > 0.01
                  ? '0 0 0 ' + Math.round(4 * ringed + 5 * glow) + 'px ' + color + '66'
                  : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {h.toUpperCase()}
          </div>
        );
      })}
    </div>
  );
};

// =============================================================================
// A BUBBLE
// =============================================================================
const Bubble: React.FC<{ node: Node; color: string; w: number; vis: number; ring: number; sweep: Sweep }> = ({
  node,
  color,
  w,
  vis,
  ring,
  sweep,
}) => {
  const isP = node.kind === 'p';
  const e = EASE_OUT(vis);
  return (
    <div
      style={{
        position: 'relative',
        width: w,
        boxSizing: 'border-box',
        padding: M.pad,
        borderRadius: 16,
        background: isP ? TH.parentBg : 'rgba(12,17,25,0.92)',
        border: '2px solid ' + (isP ? TH.parentEdge : color + '66'),
        borderLeft: isP ? '2px solid ' + TH.parentEdge : '6px solid ' + color,
        transform: 'translateY(' + (1 - e) * 12 + 'px)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -9,
          left: 12,
          padding: '0 6px',
          background: TH.stage,
          fontFamily: FONT_BODY,
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: 2.4,
          color: isP ? TH.dim : color,
        }}
      >
        {isP ? 'YOU' : 'THEM'}
      </div>
      {node.echo >= 0 ? (
        <div
          style={{
            position: 'absolute',
            top: -9,
            right: 12,
            padding: '0 6px',
            background: TH.stage,
            fontFamily: FONT_BODY,
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: 2,
            color,
          }}
        >
          THEIR WORDS
        </div>
      ) : null}
      <div
        style={{
          fontFamily: FONT_BODY,
          fontWeight: 500,
          fontSize: isP ? M.pFont : M.cFont,
          lineHeight: (isP ? M.pLh : M.cLh) + 'px',
          color: isP ? TH.dim : TH.text,
          whiteSpace: 'pre-wrap',
        }}
      >
        {node.lines.join('\n')}
      </div>
      {node.kind === 'c' ? (
        <Chips hooks={node.hooks} color={color} lit={clamp01((vis - 0.3) / 0.5) * 3} ring={ring} sweep={sweep} />
      ) : null}
    </div>
  );
};

// =============================================================================
// THE COLUMN — header and rail, nothing else. The rail is scaled to fit its slot, and every
// bubble keeps its place whether it is drawn or not, so a thread building itself never
// reflows the ones below it.
// =============================================================================
export const ThreadColumn: React.FC<{
  thread: Thread;
  layout: Layout;
  x: number;
  w: number;
  headY: number;
  railY: number;
  railH: number;
  shown: number;
  dim?: number;
  headOpacity?: number;
  ringChip?: { bi: number; i: number } | null;
  /** A light travelling across the thread's hooks, indexed over the WHOLE thread, not a bubble. */
  sweep?: Sweep;
}> = ({
  thread,
  layout,
  x,
  w,
  headY,
  railY,
  railH,
  shown,
  dim = 1,
  headOpacity = 1,
  ringChip = null,
  sweep = null,
}) => {
  const color = toneColor(thread.tone);
  const scale = Math.min(1, railH / Math.max(1, layout.total));
  let hookBase = 0; // running index so `sweep.pos` addresses the thread's hooks end to end
  return (
    <>
      <div style={{ position: 'absolute', left: x, top: headY, width: w, opacity: dim * headOpacity }}>
        <div style={{ height: 4, width: 46, background: color, borderRadius: 4 }} />
        <div
          style={{
            marginTop: 10,
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 27,
            letterSpacing: 1.4,
            lineHeight: '32px',
            color: TH.text,
            textTransform: 'uppercase',
          }}
        >
          {thread.head}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: railY,
          width: w,
          opacity: dim,
          transform: 'scale(' + scale + ')',
          transformOrigin: '0% 0%',
        }}
      >
        <div style={{ width: w / scale, display: 'flex', flexDirection: 'column' }}>
          {layout.nodes.map((n) => {
            const base = hookBase;
            hookBase += n.hooks.length;
            // The node's own piece of the spine fades WITH it — a chain link with no bubble on
            // it would be a connection the conversation has not made yet.
            return (
              <div
                key={n.bi}
                style={{ display: 'flex', marginBottom: n.gapAfter, opacity: visOf(shown, n.bi) }}
              >
                <Spine node={n} color={color} gap={n.gapAfter || M.gap} />
                <Bubble
                  node={n}
                  color={color}
                  w={w / scale - M.gutter}
                  vis={visOf(shown, n.bi)}
                  ring={ringChip && ringChip.bi === n.bi ? ringChip.i : -1}
                  sweep={sweep ? { pos: sweep.pos - base, amt: sweep.amt } : null}
                />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

// =============================================================================
// THE FOOTER READOUTS — the counters. Nothing here is a constant.
// =============================================================================
export const HookReadout: React.FC<{
  n: number;
  x: number;
  y: number;
  color: string;
  size?: number;
  opacity?: number;
  pulse?: number;
}> = ({ n, x, y, color, size = 96, opacity = 1, pulse = 0 }) => (
  <div style={{ position: 'absolute', left: x, top: y, opacity }}>
    <div
      style={{
        fontFamily: FONT_DISPLAY,
        fontWeight: 700,
        fontSize: size,
        lineHeight: size + 'px',
        letterSpacing: -2,
        color,
        transform: 'scale(' + (1 + 0.07 * pulse) + ')',
        transformOrigin: '0% 50%',
      }}
    >
      {n}
    </div>
    <div
      style={{ marginTop: 6, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 21, letterSpacing: 2.4, color: TH.dim }}
    >
      HOOKS TO ASK ABOUT
    </div>
  </div>
);

export const WordsRow: React.FC<{
  you: number;
  them: number;
  x: number;
  y: number;
  color: string;
  opacity?: number;
  pulse?: number;
}> = ({ you, them, x, y, color, opacity = 1, pulse = 0 }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      opacity,
      display: 'flex',
      alignItems: 'baseline',
      gap: 9,
      fontFamily: FONT_MONO,
      fontWeight: 500,
      fontSize: 24,
      letterSpacing: 0.5,
      whiteSpace: 'nowrap',
    }}
  >
    <span style={{ color: TH.dim }}>{you} YOU</span>
    <span style={{ color: TH.faint }}>/</span>
    <span
      style={{
        color,
        fontWeight: 700,
        display: 'inline-block',
        transform: 'scale(' + (1 + 0.12 * pulse) + ')',
      }}
    >
      {them} THEM
    </span>
  </div>
);

/** Two segments that always sum to the drawn conversation — the share is not a bar we set. */
export const ShareBar: React.FC<{
  pct: number;
  x: number;
  y: number;
  w: number;
  color: string;
  opacity?: number;
  lit?: number;
}> = ({ pct, x, y, w, color, opacity = 1, lit = 0 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, opacity }}>
    <div
      style={{
        display: 'flex',
        height: 20,
        borderRadius: 20,
        overflow: 'hidden',
        border: '2px solid ' + TH.edge,
        boxSizing: 'border-box',
        boxShadow: lit > 0.01 ? '0 0 0 ' + Math.round(7 * lit) + 'px ' + color + '33' : 'none',
      }}
    >
      <div style={{ width: pct + '%', background: TH.dim }} />
      <div style={{ width: 100 - pct + '%', background: color }} />
    </div>
    <div
      style={{
        marginTop: 8,
        fontFamily: FONT_BODY,
        fontWeight: 600,
        fontSize: 22,
        letterSpacing: 2.2,
        color: pct >= 50 ? TH.text : color,
        whiteSpace: 'nowrap',
      }}
    >
      {'YOU SAID ' + pct + '%'}
    </div>
  </div>
);

// =============================================================================
// THE BAND — the strip the title vacates. The wait demonstration and every sourced finding
// happen here, so the two threads are never covered by the thing that is talking about them.
// =============================================================================
export const FactPlate: React.FC<{
  headline: string;
  source: string[];
  y: number;
  color?: string;
  opacity?: number;
}> = ({ headline, source, y, color = TH.warn, opacity = 1 }) => (
  <div style={{ position: 'absolute', left: 60, right: 160, top: y, opacity, textAlign: 'center' }}>
    <div
      style={{
        display: 'inline-block',
        fontFamily: FONT_DISPLAY,
        fontWeight: 700,
        fontSize: 34,
        letterSpacing: 1.2,
        color,
        background: 'rgba(12,16,24,0.86)',
        border: '2px solid ' + color + '55',
        borderRadius: 40,
        padding: '13px 28px',
      }}
    >
      {headline}
    </div>
    {source.map((s, i) => (
      <div
        key={i}
        style={{
          marginTop: i === 0 ? 12 : 4,
          fontFamily: FONT_MONO,
          fontWeight: 500,
          fontSize: 20,
          letterSpacing: 1.3,
          color: i === 0 ? TH.faint : TH.dim,
        }}
      >
        {s}
      </div>
    ))}
  </div>
);

/**
 * THE WAIT. Three real seconds in which the video does the thing it just told you to do:
 * the counter is the only thing on screen that moves.
 */
export const WaitMeter: React.FC<{
  secs: number;
  total: number;
  y: number;
  opacity?: number;
  color?: string;
}> = ({ secs, total, y, opacity = 1, color = TH.warn }) => {
  const p = clamp01(secs / total);
  return (
    <div style={{ position: 'absolute', left: 170, right: 270, top: y, opacity, textAlign: 'center' }}>
      <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 24, letterSpacing: 6, color: TH.dim }}>
        SAY NOTHING
      </div>
      <div
        style={{
          marginTop: 2,
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 88,
          lineHeight: '92px',
          letterSpacing: -2,
          color,
        }}
      >
        {secs.toFixed(1)}s
      </div>
      <div style={{ marginTop: 4, height: 12, borderRadius: 12, background: 'rgba(255,255,255,0.09)', overflow: 'hidden' }}>
        <div style={{ width: p * 100 + '%', height: '100%', background: color }} />
      </div>
    </div>
  );
};

/** The illustration warrant — on screen for the whole video, not only the beat that needs it. */
export const Disclaimer: React.FC<{ y: number; text: string; opacity?: number }> = ({ y, text, opacity = 1 }) => (
  <div
    style={{
      position: 'absolute',
      left: 60,
      right: 160,
      top: y,
      opacity,
      textAlign: 'center',
      fontFamily: FONT_MONO,
      fontWeight: 500,
      fontSize: 19,
      letterSpacing: 1.5,
      color: TH.faint,
    }}
  >
    {text}
  </div>
);
