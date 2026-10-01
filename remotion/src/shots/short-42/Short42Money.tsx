import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, Stamp, prog, timeWords } from '../../lib/shorts';
import { BUDGET_COLORS as BC, Block, Chip, EASE_INOUT, EASE_OUT, Hub, Ring, clamp01, mix, spent } from '../../lib/budget';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short42Money',
  durationInSeconds: 42.5,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = BC.accent;
const F = (s: number) => Math.round(s * 30);
const END = F(42.5);

// every cue is a spoken word — retimes itself when the real voice lands in vo.gen.ts
const key = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
const wAt = (line: number, word: string, nth = 0) => {
  const w = timeWords(VO[line]).filter((x) => key(x.w) === word)[nth];
  if (!w) throw new Error(`Short42Money: no word "${word}" (#${nth}) in VO line ${line} ("${VO[line].text}")`);
  return F(w.start);
};

// =============================================================================
// THE MONTH — $600 of spending money. One considered purchase, then three small habits,
// each bought once a day for 30 days. Every $ on screen is read back off the drawn arcs.
// =============================================================================
const TOTAL = 600;
const DAYS = 30;
type Cat = { id: string; label: string; price: number; n: number; color: string };
const CATS: Cat[] = [
  { id: 'jacket', label: 'JACKET', price: 120, n: 1, color: BC.indigo },
  { id: 'coffee', label: 'COFFEE', price: 5, n: DAYS, color: BC.pink },
  { id: 'snack', label: 'SNACK', price: 3, n: DAYS, color: BC.violet },
  { id: 'delivery', label: 'DELIVERY', price: 8, n: DAYS, color: BC.teal },
];
const BLOCKS: Block[] = CATS.flatMap((c) =>
  Array.from({ length: c.n }, (_, i) => ({ id: `${c.id}-${i}`, label: c.label, units: c.price, color: c.color }))
);
// where each category starts along the ring, in dollars
const FROM: Record<string, number> = {};
CATS.reduce((at, c) => ((FROM[c.id] = at), at + c.price * c.n), 0);
const catSpent = (c: Cat, pen: number) => clamp01((pen - FROM[c.id]) / (c.price * c.n)) * c.price * c.n;
const JACKET = CATS[0];
const COFFEE = CATS[1];
const SMALL = CATS.slice(1).reduce((a, c) => a + c.price * c.n, 0); // 480

// the script's arithmetic must be the model's arithmetic
if (BLOCKS.reduce((a, b) => a + b.units, 0) !== TOTAL) throw new Error('Short42Money: blocks must fill the month');
if (SMALL !== 4 * JACKET.price) throw new Error('Short42Money: small stuff should be 4x the jacket');

// =============================================================================
// THE CUES
// =============================================================================
const REW = wAt(1, 'heres');
const REW_END = REW + 24;
const JACKET_AT = wAt(2, 'jacket');
const QUIZ_FROM = F(VO[3].start);
const QUIZ_TO = F(VO[4].start) - 3;
const COFFEE_A = wAt(4, 'thirty');
const COFFEE_B = Math.max(COFFEE_A + 30, wAt(4, 'dollars') + 6);
const MORE = wAt(5, 'more');
const NOW = wAt(6, 'now');
const SNACK_A = wAt(6, 'snack') - 4;
const SNACK_B = SNACK_A + 24;
const DEL_A = Math.max(SNACK_B + 2, wAt(6, 'delivery'));
const DEL_B = Math.max(DEL_A + 30, wAt(7, 'sixteen') + 6);
const FOUR = wAt(7, 'four');
const WHY = wAt(8, 'your');
const ISOLATE = wAt(8, 'every');
const TWIST = wAt(9, 'so');
const ASK = wAt(9, 'ask');
const MONTH = wAt(9, 'month');
const LOOP = Math.min(END - 36, F(VO[9].end + 0.7));
const LOOP_SET = LOOP + 18;

// the pen: how many dollars of the block table are drawn. Taps snap in one at a time.
const taps = (f: number, a: number, b: number, from: number, n: number, price: number) => {
  const x = clamp01((f - a) / (b - a)) * n;
  const whole = Math.min(n, Math.floor(x));
  const part = whole >= n ? 0 : Math.min(1, (x - whole) * 3);
  return from + price * (whole + EASE_OUT(part));
};
const pen = (f: number) => {
  if (f < REW) return TOTAL;
  if (f < JACKET_AT) return TOTAL * (1 - EASE_INOUT(prog(f, REW, REW_END)));
  if (f < COFFEE_A) return JACKET.price * EASE_OUT(prog(f, JACKET_AT, JACKET_AT + 16));
  if (f < SNACK_A) return taps(f, COFFEE_A, COFFEE_B, FROM.coffee, DAYS, 5);
  if (f < DEL_A) return taps(f, SNACK_A, SNACK_B, FROM.snack, DAYS, 3);
  return taps(f, DEL_A, DEL_B, FROM.delivery, DAYS, 8);
};

// how many coffee slivers are lit in the twist ("what it costs a month")
const lit = (f: number) => (f < ASK ? 1 : 1 + Math.round((DAYS - 1) * EASE_INOUT(prog(f, ASK + 6, MONTH + 8))));

// =============================================================================
// THE CANVAS — one ring, the whole video.
// =============================================================================
const CX = 540;
const CY = 860;
const R_IN = 236;
const R_OUT = 322;

const Canvas: React.FC = () => {
  const f = useCurrentFrame();
  const p = pen(f);
  const rem = TOTAL - spent(BLOCKS, p);

  // hook punch-in settles 1.06 -> 1; the loop grows it back so frame END == frame 0
  const scale = f < LOOP ? mix(1.06, 1, EASE_OUT(prog(f, 0, 30))) : mix(1, 1.06, EASE_INOUT(prog(f, LOOP_SET, END)));

  // block dimming: quiz dims everything; the "why" isolates one tap; the twist lights a month of them
  const quizDim = 1 - 0.62 * Math.min(prog(f, QUIZ_FROM, QUIZ_FROM + 8), 1 - prog(f, QUIZ_TO - 6, QUIZ_TO));
  const iso = Math.min(prog(f, ISOLATE, ISOLATE + 10), 1 - prog(f, LOOP, LOOP_SET));
  const nLit = lit(f);
  const alphaOf = (b: Block) => {
    const [cat, idx] = b.id.split('-');
    const on = cat === 'coffee' && Number(idx) < nLit;
    return quizDim * mix(1, on ? 1 : 0.14, iso);
  };

  // hub: one number at a time, dipping out as its meaning changes
  const dip = (a: number) => Math.min(1, Math.abs(f - a) / 5);
  const hubO = Math.min(dip(ISOLATE), dip(ASK), dip(LOOP + 6)) * quizDim;
  const coffeeDays = Math.round(catSpent(COFFEE, p) / COFFEE.price);
  let hub: { value: string; label: string; sub: string; color: string };
  if (f >= ISOLATE && f < ASK) {
    const pct = ((COFFEE.price / TOTAL) * 100).toFixed(1);
    hub = f < TWIST
      ? { value: `$${COFFEE.price}`, label: 'ONE TAP', sub: `${pct}% of the month`, color: BC.pink }
      : { value: `$${COFFEE.price}`, label: 'PRICE TAG', sub: 'what it costs', color: BC.pink };
  } else if (f >= ASK && f < LOOP + 6) {
    hub = { value: `$${nLit * COFFEE.price}`, label: 'PER MONTH', sub: 'same coffee', color: BC.pink };
  } else {
    const inCoffee = f >= COFFEE_A && f < SNACK_A;
    hub = {
      value: `$${Math.round(rem)}`,
      label: 'LEFT TO SPEND',
      sub: inCoffee ? `day ${coffeeDays} of ${DAYS}` : `of $${TOTAL}`,
      color: rem < 0.5 ? BC.pink : BC.text,
    };
  }

  // the one tap, breathing while it is alone
  const firstTap = FROM.coffee;
  const tapPulse = iso * (f < ASK ? 0.5 + 0.5 * Math.sin((f - ISOLATE) / 5) : 0);

  return (
    <AbsoluteFill style={{ transform: `scale(${scale})` }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <Ring
          cx={CX}
          cy={CY}
          rIn={R_IN}
          rOut={R_OUT}
          total={TOTAL}
          blocks={BLOCKS}
          filled={p}
          glow={1}
          glowColor={BC.dim}
          gap={0.9}
          alphaOf={alphaOf}
        />
        {tapPulse > 0.01 && (
          <circle
            cx={CX + (R_OUT + 26) * Math.sin(((firstTap + 2.5) / TOTAL) * Math.PI * 2)}
            cy={CY - (R_OUT + 26) * Math.cos(((firstTap + 2.5) / TOTAL) * Math.PI * 2)}
            r={10 + 6 * tapPulse}
            fill={BC.pink}
            opacity={0.35 + 0.5 * tapPulse}
          />
        )}
        <Hub cx={CX} cy={CY} value={hub.value} label={hub.label} sub={hub.sub} color={hub.color} size={150} opacity={hubO} />
      </svg>

      {/* the legend — each value is the arcs of that category actually drawn this frame */}
      {CATS.map((c, i) => {
        const s = catSpent(c, p);
        const n = Math.round(s / c.price);
        const o = clamp01(s / c.price) * quizDim * mix(1, c.id === 'coffee' ? 1 : 0.35, iso);
        const strong = c.id === 'coffee' ? f >= MORE && f < NOW + 20 : false;
        return (
          <Chip
            key={c.id}
            x={i % 2 === 0 ? 270 : 710}
            y={1222 + Math.floor(i / 2) * 82}
            w={420}
            label={c.n > 1 ? `${c.label} ×${n}` : c.label}
            value={`$${Math.round(s)}`}
            color={c.color}
            opacity={o}
            strong={strong}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// =============================================================================
// THE SHOT
// =============================================================================
const HookTitle: React.FC<{ opacity: number }> = ({ opacity }) => (
  <AbsoluteFill style={{ opacity }}>
    <BigTitle warm y={200} lines={[{ text: 'No big purchases.' }, { text: 'Still broke.', color: BC.pink }]} />
  </AbsoluteFill>
);

export default function Short42Money() {
  const f = useCurrentFrame();
  const titleO = f < LOOP ? 1 - prog(f, REW - 4, REW + 6) : EASE_OUT(prog(f, LOOP, LOOP_SET));
  return (
    <AbsoluteFill style={{ background: BC.stage }}>
      <ShortsBackdrop base={BC.stage} glow="#1a1f33" />
      <Canvas />
      <HookTitle opacity={titleO} />

      {/* beat labels — mounted at the root, so every `at` is a GLOBAL frame */}
      <Kicker text="Your month: $600" at={REW_END} until={QUIZ_FROM} />
      <Kicker text="One coffee a day" color={BC.pink} at={COFFEE_A - 6} until={NOW} />
      <Kicker text="+ snack + delivery" color={BC.teal} at={NOW} until={WHY} />
      <Kicker text="Why you miss it" at={WHY} until={TWIST} />
      <Kicker text="The fix" color={BC.teal} at={TWIST} until={LOOP} />

      <Stamp text="$150 > $120" at={MORE} until={NOW} y={420} size={80} rotate={-5} color={BC.pink} />
      <Stamp text="4× the jacket" at={FOUR} until={WHY} y={420} size={76} rotate={-5} color={BC.pink} />

      {/* QUIZ — the pause gate */}
      <Sequence from={QUIZ_FROM} durationInFrames={QUIZ_TO - QUIZ_FROM}>
        <PauseCard subtitle="the jacket, or $5 a day?" durSec={(QUIZ_TO - QUIZ_FROM) / 30} y={860} />
      </Sequence>

      {/* GLOBAL — mounted at the root so their time is the video's time, not a scene's. */}
      <Captions lines={VO} accent={ACCENT} y={1500} />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
