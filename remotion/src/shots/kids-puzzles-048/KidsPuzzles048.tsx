// TINY SPARKS · Day 48 · 🧩 Puzzles #7 — "Find the Different Shape" (LONG 16:9, 5:14)
// kids-shorts/tiny-sparks/puzzles/day-048-find-the-different-shape. Cues from VO via K (keys.gen.ts).
// ENERGY LAYER standard: ident → Prof. Hoot hosts in the playroom, Leo ("I'm super fast!") + Mila → 12 puzzles on a
// big board, easy → harder, a think timer on every one (≥ 5.5 s), Leo's confident wrong tries on #1 #2 #6 and the
// super puzzle (✗ + "silly me"), every reveal = the odd shape pulses + ✓ + one line WHY + a star on the strip, the
// shape name to repeat ("say it!"): 1 square among circles · 2 circle among triangles · 3 heart among stars ·
// 4 rectangle among squares · 5 a blue heart (colour) · 6 the little circle (size) → STRETCH break → 7 circle among
// ovals · 8 star among moons · 9 five sides among six (count the sides) · 10 the gift box among round toys → draw a
// circle in the air → 11 the upside-down triangle → SUPER PUZZLE: every shape has a twin but one (the diamond) →
// 12 stars = shape superstar → 3 shape riddles (think timers) → say all the shapes (your turn) → bye + star iris.
import React from 'react';
import { Kid, kidFaceAt, type KArm } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, HOOT_HERO, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR } from '../../lib/kids/sets';
import { Backdrop } from '../../lib/kids/places';
import { AnswerMark, Ball, Confetti, FONT_TOON, KidsCaptions, PopText, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, ImpactStar, Reaction, SparksIntro, StageWord, StarWipe, directorCam, onBeat, shakeOf, type Hit, type Shot } from '../../lib/kids/energy';
import { EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsPuzzles048', durationInSeconds: 313.9, fps: 30, width: 1920, height: 1080 };

const W = 1920;
const H = 1080;
const f = FLOOR(H);
type Key = keyof typeof K;
const S = (k: Key) => VO[K[k]].start;
const E = (k: Key) => VO[K[k]].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;
const word = (k: Key, i: number) => {
  const w = timeWords(VO[K[k]]);
  return (w[Math.min(i, w.length - 1)] ?? { start: S(k) }).start;
};
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff' };
const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (EASE_OUT(p) - 1) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};

// ── shapes
type Kind = 'circle' | 'square' | 'triangle' | 'tridown' | 'star' | 'heart' | 'rect' | 'oval' | 'moon' | 'hex' | 'pent' | 'diamond' | 'ball' | 'orange' | 'clock' | 'gift';
type Item = { k: Kind; c: string; s?: number };
const RED = '#ff595e';
const ORA = '#ff924c';
const YEL = '#ffca3a';
const GRN = '#8ac926';
const BLU = '#4cc9f0';
const PUR = '#b388ff';
const PNK = '#ff6fa5';
const poly = (n: number, r: number, rot = -90) =>
  Array.from({ length: n }).map((_, i) => {
    const a = ((rot + (i * 360) / n) * Math.PI) / 180;
    return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
  }).join(' ');
const starPts = (r: number, r2: number) =>
  Array.from({ length: 10 }).map((_, i) => {
    const a = ((-90 + i * 36) * Math.PI) / 180;
    const rr = i % 2 ? r2 : r;
    return `${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`;
  }).join(' ');
const Shape: React.FC<{ it: Item; t: number }> = ({ it, t }) => {
  const st = kst(7);
  const c = it.c;
  const body = (() => {
    switch (it.k) {
      case 'circle': return <circle r={62} fill={c} {...st} />;
      case 'square': return <rect x={-58} y={-58} width={116} height={116} rx={12} fill={c} {...st} />;
      case 'rect': return <rect x={-74} y={-38} width={148} height={76} rx={12} fill={c} {...st} />;
      case 'triangle': return <polygon points={poly(3, 74)} fill={c} {...st} />;
      case 'tridown': return <polygon points={poly(3, 74, 90)} fill={c} {...st} />;
      case 'star': return <polygon points={starPts(74, 32)} fill={c} {...st} />;
      case 'heart': return <path d="M 0,56 C -90,0 -70,-70 -30,-66 C -12,-64 0,-50 0,-36 C 0,-50 12,-64 30,-66 C 70,-70 90,0 0,56 Z" fill={c} {...st} />;
      case 'oval': return <ellipse rx={44} ry={66} fill={c} {...st} />;
      case 'moon': return <path d="M 20,-62 A 64,64 0 1 0 20,62 A 50,50 0 1 1 20,-62 Z" fill={c} {...st} />;
      case 'hex': return <polygon points={poly(6, 66, 0)} fill={c} {...st} />;
      case 'pent': return <polygon points={poly(5, 68)} fill={c} {...st} />;
      case 'diamond': return <polygon points="0,-74 50,0 0,74 -50,0" fill={c} {...st} />;
      case 'orange': return <g><circle r={60} fill={ORA} {...st} /><path d="M 0,-60 q 10,-20 30,-20" stroke="#52b788" strokeWidth={10} fill="none" strokeLinecap="round" /></g>;
      case 'clock': return <g><circle r={62} fill="#ffffff" {...st} /><path d={`M 0,0 L 0,-40 M 0,0 L ${Math.cos(t) * 30},${Math.sin(t) * 30}`} stroke={KINK} strokeWidth={8} strokeLinecap="round" /></g>;
      case 'gift': return <g><rect x={-58} y={-50} width={116} height={108} rx={10} fill={PNK} {...st} /><rect x={-12} y={-50} width={24} height={108} fill={YEL} /><path d="M 0,-50 q -40,-40 -30,-10 M 0,-50 q 40,-40 30,-10" stroke={YEL} strokeWidth={10} fill="none" strokeLinecap="round" /></g>;
      default: return null;
    }
  })();
  if (it.k === 'ball') return <g transform={`scale(${it.s ?? 1})`}><Ball r={60} rot={t * 20} /></g>;
  return <g transform={`scale(${it.s ?? 1})`}><Vol>{body}</Vol></g>;
};

type Puz = { ask: Key; ans: Key; leo?: number; odd: number; items: Item[]; cols?: number; why?: string };
const rep = (it: Item, n: number) => Array.from({ length: n }).map(() => it);
const P: Puz[] = [
  { ask: 'p1', ans: 'a1', leo: 0, odd: 2, items: [...rep({ k: 'circle', c: RED }, 2), { k: 'square', c: RED }, { k: 'circle', c: RED }], why: 'SQUARE' },
  { ask: 'p2', ans: 'a2', leo: 3, odd: 1, items: [{ k: 'triangle', c: GRN }, { k: 'circle', c: GRN }, ...rep({ k: 'triangle', c: GRN }, 2)], why: 'CIRCLE' },
  { ask: 'p3', ans: 'a3', odd: 3, items: [...rep({ k: 'star', c: YEL }, 3), { k: 'heart', c: YEL }, { k: 'star', c: YEL }], why: 'HEART' },
  { ask: 'p4', ans: 'a4', odd: 1, items: [{ k: 'square', c: BLU }, { k: 'rect', c: BLU }, ...rep({ k: 'square', c: BLU }, 3)], why: 'RECTANGLE' },
  { ask: 'p5', ans: 'a5', odd: 4, items: [...rep({ k: 'heart', c: RED }, 4), { k: 'heart', c: '#1982c4' }, { k: 'heart', c: RED }], why: 'A BLUE HEART' },
  { ask: 'p6', ans: 'a6', leo: 4, odd: 2, items: [...rep({ k: 'circle', c: PUR }, 2), { k: 'circle', c: PUR, s: 0.5 }, ...rep({ k: 'circle', c: PUR }, 3)], why: 'THE LITTLE ONE' },
  { ask: 'p7', ans: 'a7', odd: 3, items: [...rep({ k: 'oval', c: ORA }, 3), { k: 'circle', c: ORA }, { k: 'oval', c: ORA }], why: 'CIRCLE' },
  { ask: 'p8', ans: 'a8', odd: 1, items: [{ k: 'moon', c: YEL }, { k: 'star', c: YEL }, ...rep({ k: 'moon', c: YEL }, 3)], why: 'STAR' },
  { ask: 'p9', ans: 'a9', odd: 4, items: [...rep({ k: 'hex', c: GRN }, 4), { k: 'pent', c: GRN }], why: '5 SIDES!' },
  { ask: 'p10', ans: 'a10', odd: 2, items: [{ k: 'ball', c: RED }, { k: 'orange', c: ORA }, { k: 'gift', c: PNK }, { k: 'clock', c: '#fff' }], why: 'A SQUARE BOX' },
  { ask: 'p11', ans: 'a11', odd: 4, items: [...rep({ k: 'triangle', c: PNK }, 4), { k: 'tridown', c: PNK }, { k: 'triangle', c: PNK }], why: 'UPSIDE DOWN!' },
  {
    ask: 'p12', ans: 'a12', leo: 1, odd: 7, cols: 3, why: 'DIAMOND',
    items: [{ k: 'circle', c: RED }, { k: 'star', c: YEL }, { k: 'square', c: BLU }, { k: 'heart', c: PNK }, { k: 'circle', c: RED }, { k: 'square', c: BLU }, { k: 'heart', c: PNK }, { k: 'diamond', c: PUR }, { k: 'star', c: YEL }],
  },
];
// when each puzzle is on the board
const pFrom = (i: number) => S(P[i].ask) - 0.4;
const pTo = (i: number) => (i + 1 < P.length ? pFrom(i + 1) : S('win') + 0.2);
const LEO_PICK: Partial<Record<number, Key>> = { 0: 'l1', 1: 'l2', 5: 'l6', 11: 'l12' };

// ── layout
const BOARD = { x: 900, y: 430, w: 1060, h: 560 };
const HOOT_X = 210;
const MILA_X = 1560;
const LEO_X = 1770;
const KS = 0.52;
const itemPos = (p: Puz, i: number): [number, number] => {
  const cols = p.cols ?? p.items.length;
  const rows = Math.ceil(p.items.length / cols);
  const cw = Math.min(190, (BOARD.w - 80) / cols);
  const ch = rows > 1 ? 165 : 0;
  const col = i % cols;
  const row = Math.floor(i / cols);
  return [BOARD.x + (col - (cols - 1) / 2) * cw, BOARD.y + 20 + (row - (rows - 1) / 2) * ch];
};
const itemScale = (p: Puz) => (p.cols ? 0.92 : p.items.length >= 6 ? 0.95 : 1.1);

// ── camera
const leoFace = kidFaceAt(LEO_X, f, KS);
const SHOTS: Shot[] = [
  { t: 0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.01 },
  { t: S('intro') - 0.2, z: 1.6, x: HOOT_X + 40, y: f - 230, move: 'smooth', dur: 1.0, push: 0.02 },
  { t: S('intro2') - 0.2, z: 1.6, x: LEO_X - 80, y: leoFace[1] + 60, move: 'whip' },
  { t: S('rules') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.7, push: 0.01 },
];
P.forEach((p, i) => {
  SHOTS.push({ t: pFrom(i) + 0.4, z: 1.12, x: BOARD.x, y: BOARD.y + 40, move: 'smooth', dur: 0.8, push: 0.015 });
  const lk = LEO_PICK[i];
  if (lk) SHOTS.push({ t: S(lk) - 0.2, z: 1.0, x: 1060, y: 540, move: 'smooth', dur: 0.5 });
  SHOTS.push({ t: S(p.ans) - 0.15, z: 1.35, x: itemPos(p, p.odd)[0], y: itemPos(p, p.odd)[1] + 30, move: 'snap', push: 0.01 });
  SHOTS.push({ t: E(p.ans) + 0.5, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.7 });
});
SHOTS.push(
  { t: S('stretch') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.5 },
  { t: S('super') - 0.2, z: 1.5, x: HOOT_X + 40, y: f - 230, move: 'whip' },
  { t: S('p12') - 0.2, z: 1.1, x: BOARD.x, y: BOARD.y + 40, move: 'smooth', dur: 0.8, push: 0.015 },
  { t: S('win') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.7 },
  { t: S('qa1') - 0.1, z: 1.5, x: LEO_X - 80, y: leoFace[1] + 60, move: 'snap' },
  { t: E('qa1') + 0.6, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('qa3') - 0.1, z: 1.5, x: LEO_X - 80, y: leoFace[1] + 60, move: 'snap' },
  { t: E('qa3') + 0.6, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
);
SHOTS.sort((a, b) => a.t - b.t);
const PUNCHES = [...P.map((p) => S(p.ans)), S('super'), S('win')];
const HITS: Hit[] = [{ at: S('super'), amp: 8, dur: 0.3 }];

const Board: React.FC<{ s: number; children?: React.ReactNode; label?: string }> = ({ s, children, label }) =>
  s <= 0 ? null : (
    <g transform={`translate(${BOARD.x},${BOARD.y}) scale(${s}) translate(${-BOARD.x},${-BOARD.y})`}>
      <rect x={BOARD.x - BOARD.w / 2 + 12} y={BOARD.y - BOARD.h / 2 + 16} width={BOARD.w} height={BOARD.h} rx={50} fill={KINK} opacity={0.2} />
      <rect x={BOARD.x - BOARD.w / 2} y={BOARD.y - BOARD.h / 2} width={BOARD.w} height={BOARD.h} rx={50} fill="#ffffff" {...kst(10)} />
      {label && (
        <g>
          <rect x={BOARD.x - 150} y={BOARD.y - BOARD.h / 2 - 40} width={300} height={80} rx={40} fill="#ffca3a" {...kst(7)} />
          <text x={BOARD.x} y={BOARD.y - BOARD.h / 2 + 18} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={50} fill={KINK}>{label}</text>
        </g>
      )}
      {children}
    </g>
  );
const SmallStar: React.FC<{ on: number }> = ({ on }) => (
  <g>
    <polygon points={starPts(24, 11)} fill={on > 0 ? '#ffca3a' : '#ffffff'} {...kst(5)} transform={`scale(${1 + Math.sin(Math.min(1, on) * Math.PI) * 0.4})`} />
  </g>
);

export default function KidsPuzzles048() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const shake = shakeOf(t, HITS);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const pi = P.findIndex((_, i) => within(t, pFrom(i), pTo(i)));
  const p = pi >= 0 ? P[pi] : null;
  const yay = (pi >= 0 && within(t, S(P[pi].ans), E(P[pi].ans) + 0.6)) || within(t, S('win'), E('win') + 0.6) || within(t, S('n1'), E('n5') + 0.4) || t >= S('bye');
  const stretching = within(t, word('stretch', 9), E('wiggle') + 0.6);
  const wiggle = within(t, S('wiggle'), word('wiggle', 4)) ? Math.sin(t * 14) * 8 : 0;
  const drawing = within(t, word('air', 6), E('air') + 1.5);
  const hopOf = (k: number) => (yay ? Math.abs(Math.sin(t * 7 + k)) * 22 : stretching ? Math.abs(Math.sin(t * 5 + k)) * 14 : 0);
  const thinking = pi >= 0 && within(t, E(P[pi].ask), S(LEO_PICK[pi] ?? P[pi].ans));

  // leo's wrong try
  const leoKey = pi >= 0 ? LEO_PICK[pi] : undefined;
  const leoTry = leoKey && p && p.leo !== undefined && within(t, S(leoKey), S(p.ans));
  const leoWrongAt = leoKey ? word(leoKey, 2) : 0;

  const leoExpr: KExpr = leoTry ? (t < leoWrongAt + 0.5 ? 'laugh' : 'oops') : within(t, S('intro2'), E('intro2')) ? 'proud' : thinking ? 'think' : yay ? 'laugh' : talks('leo') ? 'happy' : 'smile';
  const milaExpr: KExpr = thinking ? 'think' : yay ? 'laugh' : talks('mila') ? 'happy' : stretching ? 'laugh' : 'smile';
  const hootExpr: KExpr = within(t, S('super'), E('super')) ? 'wow' : within(t, S('win'), E('win')) ? 'proud' : talks('hoot') ? 'happy' : thinking ? 'think' : 'smile';
  const leoArmR: KArm = leoTry ? 'point' : stretching ? 'up' : drawing ? 'point' : yay ? 'up' : talks('leo') ? 'present' : 'down';
  const milaArm: KArm = stretching ? 'up' : drawing ? 'point' : yay ? 'up' : talks('mila') && pi >= 0 ? 'point' : talks('mila') ? 'present' : 'down';

  // the star strip: one star per solved puzzle
  const solved = P.map((q) => S(q.ans));

  // between puzzles the board flips (scale) — out for the stretch / air breaks
  const boardS = (() => {
    if (pi < 0) {
      if (within(t, S('rules') - 0.2, pFrom(0))) return popIn(t, S('rules') - 0.2);
      return 0;
    }
    const a = pFrom(pi);
    const into = popIn(t, a, 0.4);
    const end = pTo(pi);
    const brk = pi === 5 ? S('stretch') - 0.3 : pi === 9 ? S('air') - 0.3 : pi === 10 ? S('super') - 0.3 : end;
    return Math.min(into, 1 - prog(t, Math.min(brk, end) - 0.3, Math.min(brk, end)));
  })();

  return (
    <>
      <ActionStage cam={cam} shake={shake} blur={cam.blur}>
        <Backdrop place="playroom" w={W} h={H} t={t} dim={0.15} />
        {/* the puzzle board */}
        <Board s={boardS} label={p ? (pi === 11 ? 'SUPER!' : `#${pi + 1}`) : undefined}>
          {p && p.items.map((it, i) => {
            const [x, y] = itemPos(p, i);
            const rev = t >= S(p.ans);
            const isOdd = i === p.odd;
            const pulse = isOdd && rev ? 1 + Math.sin((t - S(p.ans)) * 6) * 0.08 : 1;
            const dim = rev && !isOdd ? 0.45 : 1;
            const hint = pi === 11 && within(t, S('l12b'), S('a12')) && (i === 1 || i === 8) ? 1 : 0;
            return (
              <g key={i} transform={`translate(${x},${y}) scale(${itemScale(p) * pulse * popIn(t, pFrom(pi) + 0.25 + i * 0.07)})`} opacity={dim}>
                {isOdd && rev && <circle r={96} fill="#fff3b0" stroke="#ffca3a" strokeWidth={10} />}
                {hint > 0 && <circle r={92} fill="none" stroke="#4cc9f0" strokeWidth={8} strokeDasharray="12 12" />}
                <Shape it={it} t={t} />
              </g>
            );
          })}
          {/* Leo's pick: ✗, the answer: ✓ */}
          {p && p.leo !== undefined && leoKey && t >= leoWrongAt && (
            <AnswerMark t={t} at={leoWrongAt + 0.3} until={S(p.ans)} ok={false} x={itemPos(p, p.leo)[0] + 60} y={itemPos(p, p.leo)[1] - 70} size={0.55} />
          )}
          {p && <AnswerMark t={t} at={S(p.ans) + 0.1} ok={true} x={itemPos(p, p.odd)[0] + 70} y={itemPos(p, p.odd)[1] - 80} size={0.6} />}
          {p && p.why && t >= S(p.ans) + 0.3 && (
            <g transform={`translate(${BOARD.x},${BOARD.y + BOARD.h / 2 + (p.cols ? 50 : -70)}) scale(${popIn(t, S(p.ans) + 0.3)})`}>
              <rect x={-p.why.length * 19 - 40} y={-42} width={p.why.length * 38 + 80} height={84} rx={42} fill="#52b788" {...kst(6)} />
              <text y={18} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={54} fill="#ffffff">{p.why}</text>
            </g>
          )}
        </Board>
        {/* the riddles + the shape names (after the 12 puzzles) */}
        {within(t, S('q1'), S('n_turn') + 4) && (() => {
          const cards: [Key, Item, string][] = [['qa1', { k: 'triangle', c: GRN }, 'TRIANGLE'], ['qa2', { k: 'circle', c: RED }, 'CIRCLE'], ['qa3', { k: 'heart', c: PNK }, 'HEART']];
          const names: [Key, Item, string][] = [['n1', { k: 'circle', c: RED }, 'circle'], ['n2', { k: 'square', c: BLU }, 'square'], ['n3', { k: 'triangle', c: GRN }, 'triangle'], ['n4', { k: 'star', c: YEL }, 'star'], ['n5', { k: 'heart', c: PNK }, 'heart']];
          const list = t < S('rem') - 0.3 ? cards : names;
          return list.map(([k, it, label], i) => {
            if (t < S(k) - 0.05) return null;
            const x = list.length === 3 ? 560 + i * 380 : 400 + i * 270;
            const on = within(t, S(k), E(k) + 0.6);
            return (
              <g key={k} transform={`translate(${x},420) scale(${popIn(t, S(k) - 0.05) * (on ? 1.3 : 1.15)})`}>
                <rect x={-110} y={-130} width={220} height={260} rx={36} fill={on ? '#fff3b0' : '#ffffff'} {...kst(on ? 9 : 7)} />
                <g transform="translate(0,-20) scale(0.9)"><Shape it={it} t={t} /></g>
                <text y={100} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={label.length > 7 ? 34 : 40} fill={KINK}>{label}</text>
              </g>
            );
          });
        })()}
        {/* the circle drawn in the air */}
        {drawing && (
          <path d="M 960,400 m -170,0 a 170,170 0 1 0 340,0 a 170,170 0 1 0 -340,0" fill="none" stroke="#ffca3a" strokeWidth={18} strokeLinecap="round"
            strokeDasharray="1070" strokeDashoffset={1070 * (1 - ((t - word('air', 6)) % 2.2) / 2.2)} />
        )}
        {/* the cast */}
        <Critter spec={HOOT_HERO} x={HOOT_X} y={f} scale={0.5} expr={hootExpr} look={[0.6, -0.2]} mouth={lipSync(VO, 'hoot', t)}
          armL={stretching ? 'up' : 'down'} armR={stretching ? 'up' : talks('hoot') ? 'point' : within(t, S('win'), E('win')) ? 'up' : 'down'} hop={hopOf(2)} tilt={wiggle} />
        <Kid spec={MILA_HERO} x={MILA_X} y={f} scale={KS} expr={milaExpr} look={[-0.6, -0.3]} mouth={lipSync(VO, 'mila', t)}
          armL={stretching ? 'up' : 'down'} armR={milaArm} hop={hopOf(0)} tilt={wiggle} />
        <Kid spec={LEO_HERO} x={LEO_X} y={f} scale={KS} expr={leoExpr} look={[-0.7, -0.3]} mouth={lipSync(VO, 'leo', t)}
          armL={stretching ? 'up' : leoTry && t > leoWrongAt + 0.6 ? 'shrug' : within(t, S('intro2'), E('intro2')) ? 'hip' : 'down'} armR={leoArmR} hop={hopOf(1)} tilt={-wiggle} />
        {/* reactions + FX */}
        {P.map((q, i) => <ImpactStar key={i} t={t} at={S(q.ans) + 0.05} x={itemPos(q, q.odd)[0]} y={itemPos(q, q.odd)[1]} s={0.6} color="#fff3b0" />)}
        {Object.entries(LEO_PICK).map(([i, k]) => <Reaction key={i} kind="sweat" t={t} at={word(k as Key, 2) + 0.6} until={S(P[+i].ans)} x={LEO_X - 70} y={f - 520} s={0.6} />)}
        <Reaction kind="?" t={t} at={S('p9') + 1.0} until={S('a9')} x={LEO_X} y={f - 560} s={0.6} />
        <Reaction kind="stars" t={t} at={S('win')} until={E('win') + 0.6} x={HOOT_X} y={f - 440} s={0.7} />
        <StageWord t={t} at={S('wiggle')} until={word('wiggle', 4)} text="WIGGLE!" x={960} y={330} size={110} color="#ff6fa5" rot={-6} />
        <StageWord t={t} at={word('stretch', 9)} until={S('wiggle')} text="ARMS UP!" x={960} y={330} size={110} color="#ffca3a" rot={6} />
        <StageWord t={t} at={S('super')} until={E('super') + 0.5} text="SUPER PUZZLE!" x={560} y={430} size={110} color="#ff595e" rot={-4} />
      </ActionStage>

      {/* screen-space */}
      <PopText t={t} at={word('intro', 6)} until={S('intro2') - 0.1} text="FIND THE DIFFERENT SHAPE!" y={150} size={86} color="#ffca3a" />
      {P.map((q, i) => <ThinkTimer key={i} t={t} from={onBeat(E(q.ask) + 0.1)} to={S(LEO_PICK[i] ?? q.ans) - 0.1} x={1760} y={150} r={86} label="THINK!" />)}
      {(['s1', 's2', 's3', 's4', 's7'] as const).map((k) => <PopText key={k} t={t} at={E(k) - 0.3} until={E(k) + 2.0} text="YOUR TURN!" y={940 - 80} size={70} color="#ffffff" />)}
      <PopText t={t} at={word('air', 6)} until={E('air') + 1.4} text="DRAW A CIRCLE! ☝️" y={150} size={86} color="#ffffff" />
      <PopText t={t} at={S('win') + 0.2} until={E('win') + 0.8} text="SHAPE SUPERSTAR!" y={150} size={110} color="#ffca3a" />
      <PopText t={t} at={S('quiz')} until={S('q1') - 0.1} text="SHAPE RIDDLES!" y={150} size={110} color="#4cc9f0" />
      {(['q1', 'q2', 'q3'] as const).map((q, i) => (
        <ThinkTimer key={q} t={t} from={onBeat(E(q) + 0.1)} to={S((['qa1', 'qa2', 'qa3'] as const)[i]) - 0.1} x={1760} y={150} r={86} label="THINK!" />
      ))}
      <PopText t={t} at={E('n_turn') - 2.6} until={S('bye') - 0.1} text="YOUR TURN!" y={150} size={110} color="#ffffff" />
      <PopText t={t} at={S('bye')} until={E('bye2') + 0.6} text="SEE YOU NEXT TIME!" y={150} size={100} color="#ffca3a" />
      {/* the star strip (top left) */}
      {t >= S('p1') - 0.4 && t < S('quiz') && (
        <g transform="translate(70,60)">
          {solved.map((at, i) => <g key={i} transform={`translate(${i * 58},0)`}><SmallStar on={t >= at ? prog(t, at, at + 0.4) + (t >= at + 0.4 ? 1 : 0) : 0} /></g>)}
        </g>
      )}
      {P.map((q, i) => (i === 11 || i % 3 === 2 ? <Confetti key={i} t={t} at={S(q.ans) + 0.2} y={380} /> : null))}
      <Confetti t={t} at={S('win')} y={380} />
      <Confetti t={t} at={S('n5')} y={380} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <SparksIntro t={t} at={0} cast={{ kids: [MILA_HERO, LEO_HERO], buddy: BOBO_HERO }} />
      <StarWipe t={t} at={E('bye2') + 0.6} dur={0.5} hold={5} color="#3b2a4a" x={W / 2} y={H * 0.45} />
    </>
  );
}
