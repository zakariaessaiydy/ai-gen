// TINY SPARKS · Day 29 · 🧠 Educational Stories #3 — "Bobo Learns to Clean His Room" (LONG 16:9, 5:03)
// kids-shorts/tiny-sparks/stories/day-029-bobo-learns-to-clean-his-room. Cues from VO via K (keys.gen.ts).
// Super Bobo's messy room (toys, books, clothes on the floor; his red ball is lost) → I-SPY (duck, blue book)
// → Spark Girl + Captain Leo knock → WRONG TRY: everything pushed under the bed → BOING, it all pops out
// messier → "Can you help Bobo?" → 3 STEPS (toys → toy box · books → shelf · clothes → basket; each item flies
// home on its spoken number, YOUR TURN after each) → the lost ball is under the hat! → "When my room is tidy, I
// can find my things!" → they play ball → messy again → TIDY-UP RACE 10…1 (one item per number) → chant ×3 →
// let's remember (6 think timers) → tip + bye. Hero outfits.
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR } from '../../lib/kids/sets';
import { Ball, Confetti, FONT_TOON, KidsCaptions, KidsStage, PopText, ThinkTimer, TitleCard, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsStories029', durationInSeconds: 303.5, fps: 30, width: 1920, height: 1080 };

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
type KF = [number, number][];
const lerpKF = (t: number, kf: KF) => {
  if (t <= kf[0][0]) return kf[0][1];
  for (let i = 1; i < kf.length; i++) {
    if (t <= kf[i][0]) {
      const [t0, v0] = kf[i - 1];
      const [t1, v1] = kf[i];
      return v0 + (v1 - v0) * EASE_INOUT((t - t0) / Math.max(1e-6, t1 - t0));
    }
  }
  return kf[kf.length - 1][1];
};
const moving = (t: number, kf: KF) => kf.some(([t1, v1], i) => i > 0 && t > kf[i - 1][0] && t < t1 && v1 !== kf[i - 1][1]);

// ── the room
const BOX: [number, number] = [155, f - 150]; // toy box rim
const SHELF_Y = 452;
const BASKET: [number, number] = [1770, f - 130];
const BED_X = 1270;
const DOOR_X = 370;

const Room: React.FC<{ t: number; doorOpen: number; glow: number[] }> = ({ t, doorOpen, glow }) => (
  <g>
    <rect width={W} height={f} fill="#fff1c9" />
    {Array.from({ length: 70 }).map((_, i) => (
      <circle key={i} cx={(i % 14) * 140 + (Math.floor(i / 14) % 2) * 70 + 30} cy={Math.floor(i / 14) * 150 + 60} r={10} fill="#ffe08a" />
    ))}
    <rect y={f - 26} width={W} height={26} fill="#e9c46a" {...kst(5)} />
    {/* window */}
    <g transform="translate(1300,305)">
      <rect x={-150} y={-115} width={300} height={230} rx={18} fill="#8fd3ff" {...kst(8)} />
      <circle cx={70} cy={-50} r={34} fill="#ffd166" {...kst(5)} />
      <g transform={`translate(${-60 + Math.sin(t * 0.5) * 20},10)`} fill="#ffffff" {...kst(4)}><path d="M -50,14 Q -56,-10 -36,-14 Q -30,-36 -4,-32 Q 14,-48 36,-30 Q 58,-30 56,-8 Q 66,10 48,16 Z" /></g>
      <line x1={0} y1={-115} x2={0} y2={115} {...kst(7)} />
      <line x1={-150} y1={0} x2={150} y2={0} {...kst(7)} />
      <path d="M -170,-130 Q -150,0 -175,125 L -120,125 Q -135,0 -110,-130 Z" fill="#ff8fab" {...kst(5)} />
      <path d="M 170,-130 Q 150,0 175,125 L 120,125 Q 135,0 110,-130 Z" fill="#ff8fab" {...kst(5)} />
    </g>
    {/* Bobo's honey picture */}
    <g transform="translate(170,300) rotate(-3)">
      <rect x={-80} y={-70} width={160} height={140} rx={10} fill="#ffffff" stroke="#c0874f" strokeWidth={12} />
      <path d="M -36,-10 Q -40,40 0,44 Q 40,40 36,-10 Z" fill="#ffca3a" {...kst(4)} />
      <rect x={-40} y={-24} width={80} height={16} rx={6} fill="#ff924c" {...kst(4)} />
    </g>
    {/* shelf (glows when it's the answer) */}
    <g>
      {glow[1] > 0 && <rect x={670} y={SHELF_Y - 150} width={250} height={170} rx={30} fill="#fff3b0" opacity={glow[1] * 0.8} />}
      <rect x={690} y={SHELF_Y} width={210} height={20} rx={6} fill="#c0874f" {...kst(5)} />
      <path d={`M 710,${SHELF_Y + 20} l 20,40 M 880,${SHELF_Y + 20} l -20,40`} {...kst(7)} />
    </g>
    {/* door */}
    <g transform={`translate(${DOOR_X},${f})`}>
      <rect x={-75} y={-330} width={150} height={330} fill="#7f5539" {...kst(7)} />
      <g transform={`translate(-75,0) scale(${1 - doorOpen * 0.75},1) translate(75,0)`}>
        <rect x={-75} y={-330} width={150} height={330} fill="#c98f5f" {...kst(7)} />
        <rect x={-50} y={-300} width={100} height={110} rx={10} fill="none" {...kst(5)} />
        <rect x={-50} y={-160} width={100} height={120} rx={10} fill="none" {...kst(5)} />
        <circle cx={50} cy={-165} r={10} fill="#ffd166" {...kst(4)} />
      </g>
    </g>
    {/* bed */}
    <g transform={`translate(${BED_X},${f})`}>
      <rect x={-200} y={-300} width={40} height={300} rx={14} fill="#c0874f" {...kst(6)} />
      <rect x={160} y={-200} width={40} height={200} rx={14} fill="#c0874f" {...kst(6)} />
      <rect x={-170} y={-60} width={340} height={30} fill="#3b2a4a" opacity={0.5} />
      <rect x={-180} y={-170} width={360} height={110} rx={26} fill="#4cc9f0" {...kst(7)} />
      {[-110, -30, 50, 130].map((x) => <circle key={x} cx={x} cy={-120} r={14} fill="#ffd166" {...kst(3)} />)}
      <ellipse cx={-120} cy={-180} rx={60} ry={30} fill="#ffffff" {...kst(5)} />
    </g>
    {/* toy box back + basket back (fronts drawn after the items) */}
    <g>
      {glow[0] > 0 && <ellipse cx={BOX[0]} cy={f - 80} rx={150} ry={130} fill="#fff3b0" opacity={glow[0] * 0.8} />}
      <path d={`M ${BOX[0] - 95},${BOX[1]} L ${BOX[0] - 80},${BOX[1] - 120} L ${BOX[0] + 100},${BOX[1] - 110} L ${BOX[0] + 95},${BOX[1]} Z`} fill="#ffca3a" {...kst(6)} />
      <rect x={BOX[0] - 95} y={BOX[1] - 10} width={190} height={20} fill="#c1121f" {...kst(5)} />
    </g>
    <g>
      {glow[2] > 0 && <ellipse cx={BASKET[0]} cy={f - 70} rx={140} ry={120} fill="#fff3b0" opacity={glow[2] * 0.8} />}
      <ellipse cx={BASKET[0]} cy={BASKET[1]} rx={90} ry={22} fill="#a0673c" {...kst(5)} />
    </g>
    {/* floor */}
    <rect y={f} width={W} height={H - f} fill="#e0a96d" />
    {Array.from({ length: 9 }).map((_, i) => <line key={i} x1={i * 240 - 40} y1={f} x2={i * 240 - 120} y2={H} stroke="#c98f5f" strokeWidth={5} />)}
    <line x1={0} y1={f} x2={W} y2={f} {...kst(6)} />
    <ellipse cx={960} cy={1000} rx={560} ry={52} fill="#b8a1e3" opacity={0.55} />
  </g>
);
const BoxFront: React.FC = () => (
  <g>
    <rect x={BOX[0] - 100} y={BOX[1]} width={200} height={150} rx={14} fill="#ff595e" {...kst(7)} />
    <path d="M 0,-26 L 7,-8 L 26,-8 L 11,4 L 16,22 L 0,11 L -16,22 L -11,4 L -26,-8 L -7,-8 Z" transform={`translate(${BOX[0]},${BOX[1] + 70}) scale(1.4)`} fill="#ffd166" {...kst(4)} />
    <text x={BOX[0]} y={BOX[1] + 136} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={30} fill="#ffffff">TOYS</text>
  </g>
);
const BasketFront: React.FC = () => (
  <g>
    <path d={`M ${BASKET[0] - 92},${BASKET[1]} L ${BASKET[0] + 92},${BASKET[1]} L ${BASKET[0] + 72},${f} L ${BASKET[0] - 72},${f} Z`} fill="#d4a373" {...kst(7)} />
    {[-50, -16, 18, 52].map((x) => <line key={x} x1={BASKET[0] + x} y1={BASKET[1] + 6} x2={BASKET[0] + x * 0.8} y2={f - 6} stroke="#a0673c" strokeWidth={6} />)}
    {[40, 80].map((y) => <line key={y} x1={BASKET[0] - 86 + y * 0.12} y1={BASKET[1] + y} x2={BASKET[0] + 86 - y * 0.12} y2={BASKET[1] + y} stroke="#a0673c" strokeWidth={6} />)}
  </g>
);

// ── the things on the floor
type Kind = 'car' | 'sock' | 'book' | 'blocks' | 'shirt' | 'duck' | 'hat' | 'ball';
const Thing: React.FC<{ kind: Kind; c?: string; t: number }> = ({ kind, c, t }) => {
  switch (kind) {
    case 'car': return (
      <g>
        <path d="M -60,10 L -56,-14 L -26,-16 L -12,-40 L 28,-40 L 44,-16 L 60,-12 L 62,10 Z" fill="#e63946" {...kst(5)} />
        <path d="M -8,-34 L 22,-34 L 34,-16 L -20,-16 Z" fill="#a0e7ff" {...kst(3)} />
        {[-34, 36].map((x) => <g key={x}><circle cx={x} cy={12} r={15} fill={KINK} /><circle cx={x} cy={12} r={6} fill="#dee2e6" /></g>)}
      </g>
    );
    case 'sock': return (
      <g>
        <path d="M -20,-50 L 18,-50 L 18,10 Q 18,34 -4,36 L -44,36 Q -60,34 -58,18 Q -56,6 -40,4 L -20,4 Z" fill="#ffffff" {...kst(5)} />
        {[-38, -22].map((y) => <rect key={y} x={-20} y={y} width={38} height={8} fill="#ff6fa5" />)}
        <path d="M -20,-50 L 18,-50 L 18,10 Q 18,34 -4,36 L -44,36 Q -60,34 -58,18 Q -56,6 -40,4 L -20,4 Z" fill="none" {...kst(5)} />
      </g>
    );
    case 'book': return (
      <g>
        <rect x={-55} y={-16} width={110} height={32} rx={5} fill={c} {...kst(5)} />
        <rect x={-49} y={6} width={98} height={7} fill="#ffffff" />
        <rect x={-14} y={-12} width={28} height={10} rx={3} fill="#ffffff" opacity={0.7} />
      </g>
    );
    case 'blocks': return (
      <g>
        {[[-24, 0, '#4cc9f0', 'A'], [24, 0, '#8ac926', 'B'], [0, -46, '#ffca3a', 'C']].map(([x, y, cc, l]) => (
          <g key={l as string} transform={`translate(${x},${y})`}>
            <rect x={-22} y={-22} width={44} height={44} rx={6} fill={cc as string} {...kst(4)} />
            <text y={11} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={30} fill="#ffffff" stroke={KINK} strokeWidth={3} paintOrder="stroke">{l}</text>
          </g>
        ))}
      </g>
    );
    case 'shirt': return <path d="M -24,-44 Q 0,-30 24,-44 L 60,-24 L 46,4 L 32,-4 L 32,40 L -32,40 L -32,-4 L -46,4 L -60,-24 Z" fill="#52b788" {...kst(5)} />;
    case 'duck': return (
      <g transform={`rotate(${Math.sin(t * 3) * 4})`}>
        <ellipse cx={0} cy={6} rx={44} ry={28} fill="#ffd60a" {...kst(5)} />
        <circle cx={22} cy={-26} r={22} fill="#ffd60a" {...kst(5)} />
        <path d="M 40,-24 L 60,-18 L 40,-12 Z" fill="#ff924c" {...kst(3)} />
        <circle cx={28} cy={-30} r={4} fill={KINK} />
        <path d="M -20,0 Q -6,-10 6,4" fill="none" {...kst(3)} />
      </g>
    );
    case 'hat': return (
      <g>
        <path d="M -44,10 Q -44,-46 0,-46 Q 44,-46 44,10 Z" fill="#ff924c" {...kst(5)} />
        <path d="M 30,6 L 84,8 Q 86,20 60,20 L 30,18 Z" fill="#ff924c" {...kst(5)} />
        <circle cx={0} cy={-46} r={7} fill="#ffca3a" {...kst(3)} />
      </g>
    );
    default: return <Ball r={34} colors={['#e63946', '#ff6b6b', '#e63946', '#ffffff']} rot={t * 120} />;
  }
};

type Pos = { x: number; y: number; r: number; s?: number; v?: number };
type Item = { kind: Kind; c?: string; a: Pos; b: Pos; home: Pos };
const ITEMS: Item[] = [
  { kind: 'car', a: { x: 200, y: 934, r: -10, s: 1.3 }, b: { x: 260, y: 947, r: 25, s: 1.3 }, home: { x: BOX[0] - 45, y: BOX[1] - 10, r: -20 } },
  { kind: 'sock', a: { x: 330, y: 940, r: 20, s: 1.3 }, b: { x: 300, y: 932, r: -30, s: 1.3 }, home: { x: BASKET[0] - 40, y: BASKET[1] - 12, r: -20 } },
  { kind: 'book', c: '#1d72d8', a: { x: 480, y: 937, r: -8, s: 1.3 }, b: { x: 520, y: 947, r: 30, s: 1.3 }, home: { x: 750, y: SHELF_Y - 55, r: -90 } },
  { kind: 'blocks', a: { x: 640, y: 957, r: 0, s: 1.3 }, b: { x: 1180, y: f - 160, r: -15 }, home: { x: BOX[0] + 10, y: BOX[1] - 22, r: 0, s: 0.8 } },
  { kind: 'shirt', a: { x: 790, y: 944, r: -12, s: 1.3 }, b: { x: 720, y: 937, r: 40, s: 1.3 }, home: { x: BASKET[0], y: BASKET[1] - 20, r: 10 } },
  { kind: 'book', c: '#52b788', a: { x: 1060, y: 937, r: 10, s: 1.3 }, b: { x: 1000, y: 950, r: -35, s: 1.3 }, home: { x: 800, y: SHELF_Y - 55, r: -90 } },
  { kind: 'duck', a: { x: 1200, y: 944, r: 0, s: 1.3 }, b: { x: 1360, y: f - 168, r: 20 }, home: { x: BOX[0] + 55, y: BOX[1] - 16, r: 10, s: 0.9 } },
  { kind: 'book', c: '#7b2cbf', a: { x: 1340, y: 934, r: -14, s: 1.3 }, b: { x: 1420, y: 950, r: 20, s: 1.3 }, home: { x: 850, y: SHELF_Y - 55, r: -90 } },
  { kind: 'hat', a: { x: 1490, y: 947, r: -6, s: 1.3 }, b: { x: 1560, y: 942, r: 25, s: 1.3 }, home: { x: BASKET[0] + 42, y: BASKET[1] - 18, r: 15 } },
];
const BALL_FLOOR: Pos = { x: 1090, y: 947, r: 0, s: 1.3 };
const BALL_HOME: Pos = { x: BOX[0] - 5, y: BOX[1] - 26, r: 0 };
const UNDER = (i: number): Pos => ({ x: BED_X - 120 + i * 30, y: f - 45, r: 0, s: 0.5, v: 0 });

type Move = { at: number; to: Pos; dur?: number; arc?: number };
const posAt = (t: number, start: Pos, moves: Move[]): Pos => {
  let prev = start;
  for (const m of moves) {
    const dur = m.dur ?? 0.6;
    if (t < m.at - dur) return prev;
    if (t < m.at) {
      const p = EASE_INOUT((t - (m.at - dur)) / dur);
      const arc = (m.arc ?? 140) * Math.sin(p * Math.PI);
      const s0 = prev.s ?? 1;
      const s1 = m.to.s ?? 1;
      const v0 = prev.v ?? 1;
      const v1 = m.to.v ?? 1;
      return { x: prev.x + (m.to.x - prev.x) * p, y: prev.y + (m.to.y - prev.y) * p - arc, r: prev.r + (m.to.r - prev.r) * p + Math.sin(p * Math.PI) * 180, s: s0 + (s1 - s0) * p, v: v0 + (v1 - v0) * p };
    }
    prev = m.to;
  }
  return prev;
};

// timeline of every item
const TOY_IDX = [0, 3, 6];
const BOOK_IDX = [2, 5, 7];
const CLOTH_IDX = [1, 4, 8];
const MESSY = word('after', 7) - 0.1; // "messy"
const PLAY0 = E('play') + 0.2;
const tidyAt = (i: number) => {
  const tk = TOY_IDX.indexOf(i);
  if (tk >= 0) return word('s1_do', 5 + tk);
  const bk = BOOK_IDX.indexOf(i);
  if (bk >= 0) return word('s2_do', 3 + bk);
  if (i === 1) return word('s3_do', 4);
  if (i === 4) return word('s3_do', 6);
  return S('ball') - 0.1; // the hat flies to the basket when the ball is found
};
const HAT_LIFT = word('s3_do', 9);
const raceAt = (k: number) => word('count', k);
const movesOf = (i: number): Move[] => {
  const it = ITEMS[i];
  return [
    { at: S('whoosh') + 0.4 + i * 0.12, to: UNDER(i), arc: 30, dur: 0.5 },
    { at: word('boing', 2 + Math.floor(i / 3)) + 0.3 + (i % 3) * 0.1, to: it.b, arc: 260, dur: 0.6 },
    ...(i === 8 ? [{ at: HAT_LIFT + 0.4, to: { ...it.b, y: it.b.y - 50, r: -10 }, arc: 10, dur: 0.4 }] : []),
    { at: tidyAt(i), to: it.home, arc: 220, dur: 0.7 },
    { at: MESSY + i * 0.1 + 0.5, to: it.a, arc: 220, dur: 0.6 },
    { at: raceAt(i), to: it.home, arc: 200, dur: 0.45 },
  ];
};

// ball: hidden under the hat → found → in Bobo's paw → played with → dropped → raced into the toy box
const BALL_FOUND = S('ball') + 0.5;
const BOBO_X0 = 900;
const PASS = 1.15;
const CATCH = [BOBO_X0, 1520, 560, BOBO_X0, 1520, 560, BOBO_X0];

const playBall = (t: number): Pos => {
  const k = Math.max(0, Math.min(CATCH.length - 2, Math.floor((t - PLAY0) / PASS)));
  const p = Math.max(0, Math.min(1, (t - PLAY0 - k * PASS) / PASS));
  const x0 = CATCH[k] + 70;
  const x1 = CATCH[k + 1] + 70;
  return { x: x0 + (x1 - x0) * p, y: f - 260 - Math.sin(p * Math.PI) * 300, r: p * 400 };
};

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

export default function KidsStories029() {
  const t = useT();
  const cam = camAt(t, CAM);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);

  // cast placement
  const friendsIn = t >= S('mila_hi') - 1.2;
  const doorOpen = EASE_OUT(prog(t, S('knock') + 0.8, S('knock') + 1.4)) * (1 - EASE_OUT(prog(t, S('leo_hi') + 0.6, S('leo_hi') + 1.4)));
  const MILA_X: KF = [[S('mila_hi') - 1.2, DOOR_X], [S('mila_hi') + 0.4, 560]];
  const LEO_X: KF = [[S('mila_hi') + 0.2, DOOR_X], [S('leo_hi') + 0.4, 1520]];
  const BOBO_X: KF = [[0, BOBO_X0], [S('whoosh') - 0.2, BOBO_X0], [S('whoosh') + 1.0, 1060], [S('boing'), 1060], [S('boing') + 1.2, BOBO_X0]];
  const mx = lerpKF(t, MILA_X);
  const lx = lerpKF(t, LEO_X);
  const bx = lerpKF(t, BOBO_X);

  // the ball
  const holding = within(t, BALL_FOUND, PLAY0);
  let ball: Pos | null = null;
  if (within(t, S('look') + 0.4, S('ball') - 0.1)) ball = { x: ITEMS[8].b.x, y: ITEMS[8].b.y + 6, r: 0, s: 0.9 };
  else if (within(t, S('ball') - 0.1, BALL_FOUND)) {
    const p = EASE_INOUT(prog(t, S('ball') - 0.1, BALL_FOUND));
    ball = { x: ITEMS[8].b.x + (BOBO_X0 + 70 - ITEMS[8].b.x) * p, y: ITEMS[8].b.y + (f - 190 - ITEMS[8].b.y) * p - Math.sin(p * Math.PI) * 220, r: p * 360 };
  } else if (within(t, PLAY0, MESSY + 0.4)) {
    ball = playBall(t);
  } else if (t >= MESSY + 0.4) {
    ball = posAt(t, BALL_FLOOR, [{ at: raceAt(9), to: BALL_HOME, arc: 200, dur: 0.45 }]);
    if (t < MESSY + 1.0) {
      const d = playBall(MESSY + 0.4);
      const p = EASE_OUT(prog(t, MESSY + 0.4, MESSY + 1.0));
      ball = { x: d.x + (BALL_FLOOR.x - d.x) * p, y: d.y + (BALL_FLOOR.y - d.y) * p - Math.sin(p * Math.PI) * 120, r: p * 300 };
    }
  }
  // who is catching right now (play)
  const playK = within(t, PLAY0, MESSY + 0.4) ? Math.min(CATCH.length - 1, Math.round((t - PLAY0) / PASS)) : -1;
  const catcher = playK >= 0 ? CATCH[playK] : -1;

  // glow on a destination (step lines, chant, quiz answers)
  const glowFor = (k: number) => {
    const spans: [Key, Key][][] = [
      [['s1', 's1_leo'], ['c1', 'c1'], ['d1', 'd1'], ['e1', 'e1'], ['a1', 'a1'], ['a5', 'a5']],
      [['s2', 's2_leo'], ['c2', 'c2'], ['d2', 'd2'], ['e2', 'e2'], ['a2', 'a2']],
      [['s3', 's3_leo'], ['c3', 'c3'], ['d3', 'd3'], ['e3', 'e3'], ['a3', 'a3'], ['a4', 'a4']],
    ];
    return spans[k].some(([a, b]) => within(t, S(a) - 0.1, E(b) + 0.4)) ? 0.6 + 0.4 * Math.abs(Math.sin(t * 4)) : 0;
  };
  const glow = [glowFor(0), glowFor(1), glowFor(2)];
  const stepsShown = [S('s1'), S('s2'), S('s3')].filter((x) => t >= x).length;

  const itemsNow = ITEMS.map((it, i) => ({ i, it, p: posAt(t, it.a, movesOf(i)) }));
  const drawItem = ({ i, it, p }: { i: number; it: Item; p: Pos }) => {
    if ((p.v ?? 1) <= 0.02) return null;
    const ring = (i === 6 && within(t, S('spy_a') - 0.1, S('spy2') - 0.2)) || (i === 2 && within(t, S('spy2_a') - 0.1, S('want') - 0.2));
    return (
      <g key={i} transform={`translate(${p.x},${p.y})`} opacity={p.v ?? 1}>
        {ring && <circle r={78 + 6 * Math.sin(t * 8)} fill="none" stroke="#ff595e" strokeWidth={10} />}
        <g transform={`rotate(${p.r}) scale(${(p.s ?? 1) * (ring ? 1.15 : 1)})`}><Thing kind={it.kind} c={it.c} t={t} /></g>
      </g>
    );
  };
  const back = itemsNow.filter(({ p }) => p.y < f + 8);
  const front = itemsNow.filter(({ p }) => p.y >= f + 8);

  // expressions
  const boboExpr: KExpr =
    within(t, S('want'), E('want')) ? 'think'
    : within(t, S('cant'), E('cant') + 0.3) || within(t, S('sad'), S('tidy')) ? 'sad'
    : within(t, S('idea'), E('idea')) ? 'wow'
    : within(t, S('tada'), S('boing')) ? 'proud'
    : within(t, S('boing'), E('leo_oops')) ? 'surprised'
    : within(t, S('look'), S('ball')) ? 'wow'
    : talks('bobo') || t >= S('ball') ? 'laugh'
    : 'happy';
  const boboHop =
    within(t, S('tada'), E('tada') + 0.3) || within(t, S('ball'), E('ball') + 0.6) || within(t, S('yay'), E('yay')) || within(t, S('did'), E('did') + 0.5)
      ? Math.abs(Math.sin(t * 7)) * 40
      : catcher === BOBO_X0 ? 30 : 0;
  const singLine = (k: Key[]) => k.some((x) => within(t, S(x), E(x)));
  const chanting = singLine(['c1', 'c2', 'c3', 'c4', 'd1', 'd2', 'd3', 'd4', 'e1', 'e2', 'e3', 'e4']);
  const dance = (ph: number) => (chanting ? Math.abs(Math.sin(t * 5 + ph)) * 28 : 0);
  const countN = (() => {
    if (!within(t, S('count') - 0.1, E('count') + 0.8)) return -1;
    let n = -1;
    for (let k = 0; k < 10; k++) if (t >= word('count', k) - 0.05) n = k;
    return n;
  })();

  return (
    <>
      <KidsStage cam={cam}>
        <Room t={t} doorOpen={doorOpen} glow={glow} />
        {back.map(drawItem)}
        {ball && ball.y < f + 8 && !holding && <g transform={`translate(${ball.x},${ball.y}) rotate(${ball.r}) scale(${ball.s ?? 1})`}><Thing kind="ball" t={t} /></g>}
        <BoxFront />
        <BasketFront />
        {friendsIn && (
          <Kid spec={MILA_HERO} x={mx} y={f} scale={0.6} legs={moving(t, MILA_X) ? 'walk' : 'stand'} walk={t * 2}
            expr={within(t, S('leo_hi'), E('leo_hi')) ? 'surprised' : talks('mila') ? 'happy' : chanting || t >= S('clean') ? 'laugh' : 'happy'}
            look={[0.4, -0.2]} mouth={lipSync(VO, 'mila', t)}
            armL={catcher === 560 ? 'up' : chanting ? 'up' : within(t, S('mila_hi'), E('mila_hi')) ? 'wave' : 'down'}
            armR={talks('mila') && !chanting ? 'point' : catcher === 560 ? 'up' : chanting ? 'wave' : t >= S('bye') ? 'wave' : 'hip'}
            hop={catcher === 560 ? 30 : dance(0)} />
        )}
        <Critter spec={BOBO_HERO} x={bx} y={f} scale={0.6} walking={moving(t, BOBO_X)} walk={t * 2} expr={boboExpr}
          look={within(t, S('look'), S('ball')) ? [0.8, 0.4] : [0, 0]} mouth={lipSync(VO, 'bobo', t)}
          armL={within(t, S('whoosh'), E('whoosh') + 0.4) ? 'hold' : within(t, S('s1_do'), E('s1_do')) || within(t, S('s3_do'), E('s3_do')) ? (Math.sin(t * 6) > 0 ? 'up' : 'hold') : chanting || t >= S('bye') ? 'wave' : talks('bobo') ? 'up' : 'down'}
          armR={holding ? 'hold' : catcher === BOBO_X0 ? 'up' : within(t, S('s1_do'), E('s1_do')) ? 'up' : chanting ? 'up' : 'down'}
          holdR={holding ? <Thing kind="ball" t={0} /> : undefined}
          hop={boboHop + dance(1)} squash={within(t, S('sad'), S('tidy')) ? 0.08 : 0} />
        {friendsIn && t >= S('mila_hi') + 0.2 && (
          <Kid spec={LEO_HERO} x={lx} y={f} scale={0.6} legs={moving(t, LEO_X) ? 'walk' : 'stand'} walk={t * 2}
            expr={within(t, S('leo_hi'), E('leo_hi')) || within(t, S('leo_oops'), E('leo_oops')) ? 'surprised' : talks('leo') ? 'laugh' : 'happy'}
            look={[-0.4, -0.2]} mouth={lipSync(VO, 'leo', t)}
            armL={catcher === 1520 ? 'up' : within(t, S('s2_do'), E('s2_do')) ? (Math.sin(t * 6) > 0 ? 'up' : 'hold') : chanting ? 'up' : 'down'}
            armR={catcher === 1520 ? 'up' : talks('leo') ? 'up' : chanting ? 'wave' : t >= S('bye') ? 'wave' : 'hip'}
            hop={catcher === 1520 ? 30 : within(t, S('did'), E('did') + 0.4) ? Math.abs(Math.sin(t * 7)) * 36 : dance(2)} />
        )}
        {ball && ball.y >= f + 8 && !holding && <g transform={`translate(${ball.x},${ball.y}) rotate(${ball.r}) scale(${ball.s ?? 1})`}><Thing kind="ball" t={t} /></g>}
        {front.map(drawItem)}
        {/* clean & tidy: sparkles on the furniture */}
        {within(t, S('clean') - 0.4, S('after')) && [0, 1, 2, 3, 4].map((k) => {
          const p = ((t - S('clean') + k * 0.3) % 1.5) / 1.5;
          const xy = [[BOX[0], f - 230], [800, 400], [BASKET[0], f - 220], [BED_X, f - 260], [960, 250]][k];
          return <path key={k} d="M 0,-24 Q 3,-3 24,0 Q 3,3 0,24 Q -3,3 -24,0 Q -3,-3 0,-24 Z" transform={`translate(${xy[0]},${xy[1]}) scale(${Math.sin(p * Math.PI) * 1.4})`} fill="#ffffff" stroke={KINK} strokeWidth={3} />;
        })}
        {/* the 3-step strip */}
        {stepsShown > 0 && (
          <g>
            {[['TOYS', '#ff595e'], ['BOOKS', '#1d72d8'], ['CLOTHES', '#52b788']].slice(0, stepsShown).map(([l, c], k) => {
              const at = [S('s1'), S('s2'), S('s3')][k];
              const s = EASE_OUT(prog(t, at, at + 0.4)) * (glow[k] > 0 ? 1.12 : 1);
              return (
                <g key={l} transform={`translate(${660 + k * 300},92) scale(${s})`}>
                  <rect x={-130} y={-58} width={260} height={116} rx={30} fill="#ffffff" stroke={glow[k] > 0 ? c : KINK} strokeWidth={glow[k] > 0 ? 12 : 7} />
                  <circle cx={-92} cy={0} r={32} fill={c} {...kst(5)} />
                  <text x={-92} y={14} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill="#ffffff">{k + 1}</text>
                  <text x={22} y={16} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={l.length > 5 ? 38 : 46} fill={KINK}>{l}</text>
                </g>
              );
            })}
          </g>
        )}
      </KidsStage>
      <TitleCard t={t} from={0} to={1.4} title="TIDY UP!" sub="Bobo cleans his room" />
      <PopText t={t} at={S('mess') + 0.4} until={S('see') - 0.1} text="WHAT A MESS!" y={330} size={120} color="#ff595e" />
      <ThinkTimer t={t} from={E('spy') + 0.1} to={S('spy_a') - 0.1} x={1720} y={210} r={90} label="FIND IT!" />
      <ThinkTimer t={t} from={E('spy2') + 0.1} to={S('spy2_a') - 0.1} x={1720} y={210} r={90} label="FIND IT!" />
      <PopText t={t} at={S('knock')} until={S('mila_hi') - 0.2} text="KNOCK KNOCK!" x={DOOR_X + 60} y={300} size={80} color="#ffffff" />
      <PopText t={t} at={S('whoosh') + 0.2} until={S('tada') - 0.2} text="SWOOSH!" x={1150} y={350} size={110} color="#4cc9f0" />
      {[2, 3, 4].map((k) => (
        <PopText key={k} t={t} at={word('boing', k)} until={k < 4 ? word('boing', k + 1) : S('leo_oops')} text="BOING!" x={1050 + (k - 2) * 220} y={330 + (k % 2) * 60} size={100} color="#ffca3a" rot={(k - 3) * 8} />
      ))}
      <ThinkTimer t={t} from={E('ask1') + 0.1} to={S('tidy') - 0.1} x={1720} y={300} r={90} label="THINK!" />
      <PopText t={t} at={S('s1') + 0.6} until={S('s1_do') - 0.1} text="TOYS IN THE BOX!" y={330} size={96} color="#ff595e" />
      <PopText t={t} at={S('s2') + 0.6} until={S('s2_do') - 0.1} text="BOOKS ON THE SHELF!" y={330} size={90} color="#4cc9f0" />
      <PopText t={t} at={S('s3') + 0.6} until={S('s3_do') - 0.1} text="CLOTHES IN THE BASKET!" y={330} size={84} color="#8ac926" />
      {(['s1', 's2', 's3'] as const).map((k) => {
        const turn = `${k}_turn` as Key;
        const leo = `${k}_leo` as Key;
        return <PopText key={k} t={t} at={E(turn) + 0.1} until={S(leo) - 0.1} text="YOUR TURN!" y={330} size={110} color="#ffffff" />;
      })}
      {(['s1_do', 's2_do'] as const).map((k) => [0, 1, 2].map((n) => {
        const at = word(k, (k === 's1_do' ? 5 : 3) + n);
        return <PopText key={`${k}${n}`} t={t} at={at} until={at + 0.9} text={String(n + 1)} x={960 + (n - 1) * 160} y={330} size={160} color={['#ff595e', '#ffca3a', '#4cc9f0'][n]} />;
      }))}
      <ThinkTimer t={t} from={E('ball_q') + 0.1} to={S('ball') - 0.1} x={1720} y={300} r={90} label="GUESS!" />
      <PopText t={t} at={S('ball') + 0.2} until={S('learn') - 0.1} text="FOUND IT!" y={330} size={120} color="#ff595e" />
      <PopText t={t} at={S('clean') + 0.3} until={S('play') - 0.1} text="CLEAN & TIDY!" y={330} size={110} color="#8ac926" />
      <PopText t={t} at={MESSY} until={S('uhoh') - 0.1} text="UH-OH!" y={330} size={120} color="#ff924c" />
      <ThinkTimer t={t} from={E('ask2') + 0.1} to={S('ans2') - 0.1} x={1720} y={300} r={90} label="THINK!" />
      <PopText t={t} at={S('race') + 0.5} until={S('count') - 0.1} text="TIDY-UP RACE!" y={330} size={120} color="#ffca3a" />
      {countN >= 0 && <PopText key={`n${countN}`} t={t} at={word('count', countN)} text={String(10 - countN)} y={330} size={200} color={['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#4cc9f0', '#1d72d8', '#7b2cbf', '#ff6fa5', '#52b788', '#ffd166'][countN]} />}
      <PopText t={t} at={E('c_turn') + 0.1} until={S('d1') - 0.1} text="YOUR TURN!" y={330} size={110} color="#ffffff" />
      <PopText t={t} at={S('e_turn') + 0.2} until={S('e1') - 0.1} text="ALL TOGETHER!" y={330} size={110} color="#ffca3a" />
      <PopText t={t} at={S('rem')} until={S('q1') - 0.1} text="LET'S REMEMBER!" y={330} size={110} color="#ffca3a" />
      {(['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'why'] as const).map((q, k) => {
        const a = (['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'why_a'] as const)[k];
        return <ThinkTimer key={q} t={t} from={E(q) + 0.1} to={S(a) - 0.1} x={1720} y={300} r={90} label="THINK!" />;
      })}
      <PopText t={t} at={S('tip') + 0.2} until={S('bye') - 0.1} text="A LITTLE EVERY DAY!" y={330} size={96} color="#ffca3a" />
      <PopText t={t} at={S('bye')} text="SEE YOU NEXT TIME!" y={330} size={100} color="#ffca3a" />
      <Confetti t={t} at={S('ball') + 0.1} x={BOBO_X0} y={500} dur={1.4} />
      <Confetti t={t} at={S('clean')} y={400} />
      <Confetti t={t} at={S('did')} y={400} />
      <Confetti t={t} at={S('bye')} y={400} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} y={1046} />
    </>
  );
}
