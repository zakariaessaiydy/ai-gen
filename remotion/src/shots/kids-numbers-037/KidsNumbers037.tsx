// TINY SPARKS · Day 37 · 🔢 Numbers & Math #6 — "Numbers 1–20 with Dinosaurs" (LONG 16:9, 6:30, ages 6–8)
// kids-shorts/tiny-sparks/numbers/day-037-numbers-1-20-with-dinosaurs. Cues from VO via K (keys.gen.ts).
// FIRST episode with the ENERGY LAYER as the standard (make-kids) and the new DINO rig (lib/kids/dino.tsx):
// ident on the jingle → STOMP hook, Rexy the T-rex jumps out → count 10 dinosaurs (each pops in, rainbow badge,
// big numeral + word, Spark Girl's fingers; back row 5 + front row 5 = 10) → Mama's two nests = place value:
// a full nest of TEN + one more egg per number ("ten and one make eleven") → 20 eggs hatch in pairs (count by
// twos) → find the number on the rocks (×3, think timers) + "11–19 all start with a one = one ten" → missing
// footprint numbers (×2) → count to 20 together as Rexy hops along 20 numbered footprints → your turn (silent
// lights on the beat) → bye + star iris. Director camera, reactions, StageWords, SFX on every action.
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR } from '../../lib/kids/sets';
import { AnswerMark, Confetti, FONT_TOON, KidsCaptions, PopText, RAINBOW, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import {
  ActionStage, Dust, FocusLines, ImpactStar, MotionLines, Reaction, SparksIntro, StageWord, StarWipe, directorCam, hopAt, onBeat, shakeOf,
  type Hit, type Shot,
} from '../../lib/kids/energy';
import { Dino, DinoEgg, DinoValley, EggNest, Footprint, NumStone, type DinoSpec } from '../../lib/kids/dino';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsNumbers037', durationInSeconds: 389.3, fps: 30, width: 1920, height: 1080 };

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
const key = (s: string) => s as Key;
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff', rexy: '#8ac926' };
const NUMW = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN', 'TWENTY'];
const pulse = (t: number, at: number, d = 0.35) => (t < at || t > at + d ? 0 : Math.sin(((t - at) / d) * Math.PI));

// ── cast
const REXY: DinoSpec = { id: 'rexy', kind: 'rex', body: '#7bd389', belly: '#fff3c4', accent: '#ff924c', spots: '#52b788' };
const MAMA: DinoSpec = { id: 'mama', kind: 'neck', body: '#ff9ec7', belly: '#ffe3ef', accent: '#ffd166', spots: '#ff6fa5', bow: '#ffca3a' };
const DINOS: DinoSpec[] = [
  { id: 'd1', kind: 'tops', body: '#ff9f68', belly: '#ffe5c9', accent: '#ffca3a' },
  { id: 'd2', kind: 'stego', body: '#b39ddb', belly: '#efe6ff', accent: '#ff6fa5' },
  { id: 'd3', kind: 'neck', body: '#64b5f6', belly: '#dff1ff', accent: '#ffd166', spots: '#4a90d9' },
  { id: 'd4', kind: 'rex', body: '#ff8fab', belly: '#ffe3ec', accent: '#ffd166', spots: '#ff6f91' },
  { id: 'd5', kind: 'tops', body: '#ffd166', belly: '#fff3c4', accent: '#ff924c' },
  { id: 'd6', kind: 'stego', body: '#4ecdc4', belly: '#dcfaf6', accent: '#ffca3a' },
  { id: 'd7', kind: 'neck', body: '#8ac926', belly: '#efffd6', accent: '#ff924c', spots: '#6aa61c' },
  { id: 'd8', kind: 'rex', body: '#ff7b7b', belly: '#ffe2d6', accent: '#ffd166' },
  { id: 'd9', kind: 'tops', body: '#7fd3ff', belly: '#e3f6ff', accent: '#b388ff' },
  { id: 'd10', kind: 'baby', body: '#ffb3c6', belly: '#fff0f5', accent: '#ff6fa5', spots: '#8ac926' },
];
// back row 1-5, front row 6-10: [x, feet y, scale]
const POS: [number, number, number][] = [
  [800, f - 30, 0.38], [1020, f - 30, 0.38], [1240, f - 30, 0.38], [1460, f - 30, 0.38], [1680, f - 30, 0.38],
  [910, f + 90, 0.45], [1130, f + 90, 0.45], [1350, f + 90, 0.45], [1570, f + 90, 0.45], [1790, f + 90, 0.45],
];
const BUSH_X = 1800;
const REX_X = 650;
const TALL: Record<string, number> = { rex: 520, tops: 380, stego: 400, neck: 600, baby: 300 };
const BABY_COLORS = ['#ffb3c6', '#a0e7e5', '#ffd166', '#b4f8c8', '#cdb4db', '#ffc09f'];

// ── timeline anchors (all from the real word times)
const INTRO_END = 3.6;
const STOMPS = [word('stomp', 0), word('stomp', 1), word('stomp', 2)];
const REX_OUT = S('rex_hi') - 0.7; // Rexy jumps out from behind the big bush …
const REX_AIR = 0.7; // … and lands on "Roar!"
const ARR: number[] = [
  word('n1', 4) - 0.15, word('n2', 2) - 0.15, word('n3', 1) - 0.2, word('n4', 0) - 0.1, word('n5', 0) - 0.1,
  word('n6', 0) - 0.1, word('n7', 0) - 0.1, word('n8', 0) - 0.1, word('n9', 0) - 0.1, word('n10', 5) - 0.12,
];
const EGG10 = word('n10', 2) - 0.1; // the 10th is an egg first ("the littlest one…"), it hatches on "baby"
const SNEEZE = word('n6', 4);
const YAWN = word('n8', 4);
const CNT = Array.from({ length: 10 }, (_, i) => S(key(`c${i + 1}`)));
const ROW_BACK = word('ten', 2); // "Five in the back"
const ROW_FRONT = word('ten', 7);
const MAKE_TEN = word('ten', 14); // "… make ten!"
const EGG_STOMPS = [word('egg_go', 7), word('egg_go', 8)];
const DROP = Array.from({ length: 10 }, (_, k) => word(key(`e${11 + k}`), 2) - 0.38); // eggs fall, land on "one/two/…"
const LAND = DROP.map((d) => d + 0.38);
const SAY = Array.from({ length: 10 }, (_, k) => word(key(`e${11 + k}`), 4)); // "eleven", "twelve" …
const HATCH = Array.from({ length: 10 }, (_, j) => S(key(`s${2 * (j + 1)}`)) - 0.12); // a pair hatches per number
const CRACKS = [word('hatch', 1), word('hatch', 2)];
const ROUNDS = [
  { q: 'q1', a: 'a1', stones: ['12', '15', '18'], ok: 1, by: 'mila' },
  { q: 'q2', a: 'a2', stones: ['20', '12', '2'], ok: 1, by: 'bobo' },
  { q: 'q3', a: 'a3', stones: ['9', '16', '19'], ok: 2, by: 'mila' },
] as const;
const STEPS = [
  { q: 'm1q', a: 'm1a', nums: ['16', '17', '?', '19'], ans: '18' },
  { q: 'm2q', a: 'm2a', nums: ['10', '11', '12', '?', '14'], ans: '13' },
] as const;
const KS = Array.from({ length: 20 }, (_, j) => S(key(`k${j + 1}`)));
const TURN0 = onBeat(E('turn') + 0.5); // your turn: the footprints light ON the theme bed's beat, one every 0.5 s
const TURN = Array.from({ length: 20 }, (_, j) => TURN0 + j * 0.5);

const NEST_A = 1010;
const NEST_B = 1500;
const STEP_X = [[830, 1110, 1390, 1670], [790, 1020, 1250, 1480, 1710]];

// scene changes (star iris): close dur 0.45 + hold 0.15 + open 0.45; the swap happens mid-hold
const WIPES = [E('egg_go') + 0.2, E('game') + 0.15, E('path') + 0.2, E('m2a') + 0.6];
const SWAP = WIPES.map((w) => w + 0.525);
const END_IRIS = E('bye2') + 0.4;
type Scene = 'count' | 'nest' | 'rocks' | 'steps' | 'path';
const sceneAt = (t: number): Scene => (t < SWAP[0] ? 'count' : t < SWAP[1] ? 'nest' : t < SWAP[2] ? 'rocks' : t < SWAP[3] ? 'steps' : 'path');

// path footprints (count to 20): two rows of 10
// the number trail: a sandy path in the mid-ground (above the captions band), a snake: 1→10, then 11→20 back
const TRAIL = { x0: 300, x1: 1660, y0: f - 134, y1: f - 4 };
const PATH = Array.from({ length: 20 }, (_, j) => [358 + (j < 10 ? j : 19 - j) * 138, j < 10 ? f - 102 : f - 38] as [number, number]);

// ── director camera
const SHOTS: Shot[] = (() => {
  const s: Shot[] = [
    { t: 0, z: 1.12, x: 760, y: 600, move: 'cut', push: 0.004 },
    { t: STOMPS[0] - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 },
    { t: S('who') - 0.2, z: 1.4, x: 1240, y: 640, move: 'smooth', dur: 1.6, push: 0.015 }, // looking at the big bush
    { t: REX_OUT + REX_AIR - 0.05, z: 1.25, x: 600, y: 620, move: 'snap', push: 0.01 }, // Rexy lands by the kids
    { t: S('mila_hi') - 0.2, z: 1.55, x: 300, y: 600, move: 'whip' }, // the kids
    { t: S('rex_ask') - 0.25, z: 1.5, x: 650, y: 560, move: 'whip', push: 0.012 }, // Rexy asks
    { t: S('goal') - 0.3, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 1.0 },
    { t: S('fingers') - 0.2, z: 1.7, x: 300, y: 560, move: 'snap', push: 0.01 }, // Spark Girl's ten fingers
  ];
  for (let i = 0; i < 10; i++) {
    const [px, py] = POS[i];
    const tall = TALL[DINOS[i].kind] * POS[i][2];
    const near = i === 8 ? { t: ARR[i] - 0.2, z: 1.5, x: 1500, y: py - tall * 0.5, move: 'whip' as const } : { t: (i === 9 ? EGG10 : ARR[i]) - 0.25, z: i === 2 ? 1.45 : 1.75, x: px, y: py - tall * (i === 2 ? 0.7 : 0.45), move: (i % 3 === 1 ? 'whip' : 'snap') as Shot['move'], push: 0.02 };
    s.push(near);
    s.push({ t: CNT[i] - 0.35, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.5 }); // WIDE on the count: dinos + badges + Mila's fingers
  }
  s.push(
    { t: S('ten') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
    { t: S('ten_turn') - 0.2, z: 1.7, x: 300, y: 560, move: 'snap', push: 0.01 }, // your turn: show ten fingers
    { t: S('egg_go') - 0.2, z: 1.4, x: 650, y: 560, move: 'whip' },
    // the nest scene (the cut hides under the star iris)
    { t: SWAP[0], z: 1.0, x: 960, y: 540, move: 'cut', push: 0.004 },
    { t: S('egg_more') - 0.2, z: 1.4, x: 1350, y: 800, move: 'smooth', dur: 1.0 },
  );
  for (let k = 0; k < 10; k++) {
    s.push({ t: DROP[k] - 0.3, z: 1.45, x: NEST_B, y: 820, move: 'smooth', dur: 0.5, push: 0.01 }); // the egg lands
    s.push({ t: S(key(`m${11 + k}`)) - 0.3, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.5 }); // wide: Mila's 10 + fingers
  }
  s.push(
    { t: S('egg20') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
    { t: S('egg20_b') - 0.15, z: 1.6, x: 300, y: 560, move: 'whip' },
    { t: S('hatch') - 0.2, z: 1.15, x: 1180, y: 700, move: 'whip', push: 0.01 },
    { t: S('by2') - 0.2, z: 1.45, x: 560, y: 600, move: 'snap' },
    { t: HATCH[0] - 0.3, z: 1.5, x: NEST_A, y: 830, move: 'smooth', dur: 0.6, push: 0.01 },
    { t: HATCH[5] - 0.3, z: 1.5, x: NEST_B, y: 830, move: 'smooth', dur: 0.7, push: 0.01 },
    { t: S('babies') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
    { t: S('game') - 0.2, z: 1.5, x: 650, y: 580, move: 'snap' },
    // rocks
    { t: SWAP[1], z: 1.06, x: 960, y: 580, move: 'cut', push: 0.003 },
  );
  ROUNDS.forEach((r, i) => {
    const ok = 960 + r.ok * 340;
    s.push({ t: S(r.a as Key) - 0.15, z: 1.55, x: ok, y: 760, move: 'snap', push: 0.01 });
    s.push({ t: E(r.a as Key) + 0.6, z: 1.06, x: 960, y: 580, move: 'smooth', dur: 0.7, push: 0.003 });
    void i;
  });
  s.push(
    { t: S('tip') - 0.2, z: 1.25, x: 1300, y: 720, move: 'smooth', dur: 0.8, push: 0.01 },
    { t: S('path') - 0.2, z: 1.45, x: 650, y: 580, move: 'whip' },
    // steps
    { t: SWAP[2], z: 1.06, x: 960, y: 580, move: 'cut', push: 0.003 },
    { t: S('m1a') - 0.1, z: 1.5, x: STEP_X[0][2], y: 800, move: 'snap' },
    { t: E('m1a') + 0.8, z: 1.06, x: 960, y: 580, move: 'smooth', dur: 0.7 },
    { t: S('m2a') - 0.1, z: 1.5, x: STEP_X[1][3], y: 800, move: 'snap' },
    // the path (count to 20)
    { t: SWAP[3], z: 1.0, x: 960, y: 540, move: 'cut', push: 0.002 },
    { t: S('great') - 0.2, z: 1.3, x: 1400, y: 720, move: 'smooth', dur: 0.8, push: 0.01 },
    { t: S('bye') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 },
  );
  return s;
})();
const PUNCHES = [...STOMPS, REX_OUT + REX_AIR, ...CNT, SNEEZE, ...LAND, ...HATCH.map((h) => h + 0.1), ...KS.map((k) => k + 0.05), ...EGG_STOMPS];
const HITS: Hit[] = [
  ...STOMPS.map((s, i) => ({ at: s, amp: 6 + i * 4, dur: 0.3 })),
  { at: REX_OUT + REX_AIR, amp: 14, dur: 0.38 },
  { at: SNEEZE, amp: 9, dur: 0.3 },
  ...EGG_STOMPS.map((s) => ({ at: s, amp: 8, dur: 0.28 })),
];

// a rainbow number badge (stage space)
const Badge: React.FC<{ n: number | string; x: number; y: number; s: number; c: string }> = ({ n, x, y, s, c }) =>
  s <= 0 ? null : (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <circle r={34} fill={c} {...kst(5)} />
      <circle r={26} fill="none" stroke="#ffffff" strokeWidth={4} opacity={0.8} />
      <text y={13} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={String(n).length > 1 ? 32 : 38} fill="#ffffff" stroke={KINK} strokeWidth={5} paintOrder="stroke">{n}</text>
    </g>
  );
const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (EASE_OUT(p) - 1) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};

// a big foreground bush (Rexy hides behind it in the hook)
const BigBush: React.FC<{ x: number }> = ({ x }) => (
  <g transform={`translate(${x},${f + 6})`}>
    {[[-120, -60, 90], [-30, -110, 110], [90, -70, 95], [0, -40, 100]].map(([bx, by, r], i) => (
      <circle key={i} cx={bx} cy={by} r={r} fill={i % 2 ? '#40916c' : '#52b788'} {...kst(7)} />
    ))}
    {[[-120, -60, 90], [-30, -110, 110], [90, -70, 95], [0, -40, 100]].map(([bx, by, r], i) => (
      <circle key={`f${i}`} cx={bx} cy={by} r={r - 4} fill={i % 2 ? '#40916c' : '#52b788'} />
    ))}
    {[[-60, -120], [40, -150], [110, -80]].map(([fx, fy], i) => <circle key={i} cx={fx} cy={fy} r={10} fill={['#ff6fa5', '#ffca3a', '#ffffff'][i]} />)}
  </g>
);

// a flat footprint on the ground with its number inside (lit = rainbow)
const StepPrint: React.FC<{ x: number; y: number; n: string; lit: number; c: string; s?: number }> = ({ x, y, n, lit, c, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s * (1 + lit * 0.12)})`}>
    <g transform="scale(1,0.55) rotate(-90)">
      <Footprint c={lit > 0 ? c : '#a9845f'} s={1.15} />
    </g>
    <text y={15} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={n.length > 1 ? 40 : 46} fill="#ffffff" stroke={KINK} strokeWidth={7} paintOrder="stroke">{n}</text>
  </g>
);

export default function KidsNumbers037() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const shake = shakeOf(t, HITS);
  const scene = sceneAt(t);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);

  // ── counting state
  const nDinos = ARR.filter((a, i) => t >= (i === 9 ? EGG10 : a)).length; // on screen (count scene)
  const nSaid = CNT.filter((c) => t >= c).length; // counted aloud
  const nB = LAND.filter((l) => t >= l).length; // eggs in nest B
  const hatched = HATCH.filter((h) => t >= h + 0.25).length; // pairs hatched
  const pathLit = within(t, KS[0], S('turn')) ? KS.filter((k) => t >= k).length : t >= TURN[0] - 0.01 && t < S('great') ? TURN.filter((k) => t >= k).length : t >= S('great') ? 20 : 0;

  // Mila's fingers (three ways: objects, numeral, fingers)
  let fingers = 0;
  let tenTag = false;
  if (scene === 'count') {
    if (within(t, S('fingers') + 0.4, E('fingers') + 0.2) || within(t, S('ten_turn'), S('egg_go'))) fingers = 10;
    else if (within(t, CNT[0], S('ten_turn'))) fingers = nSaid;
  } else if (scene === 'nest' && within(t, LAND[0], S('hatch'))) {
    fingers = nB;
    tenTag = true;
  } else if (scene === 'path' && pathLit > 0 && t < S('great')) {
    fingers = pathLit > 10 ? pathLit - 10 : pathLit;
    tenTag = pathLit > 10;
  }
  const fL = Math.min(5, fingers);
  const fR = Math.max(0, fingers - 5);

  // cast placement per scene
  const castX = scene === 'path' ? { mila: 150, bobo: 1790 } : { mila: 170, bobo: 460 };
  const yay = within(t, S('babies'), S('game')) || within(t, S('cnt_yay'), S('turn')) || within(t, CNT[9], CNT[9] + 1.5) || t >= S('bye');
  const milaExpr: KExpr = yay ? 'laugh' : within(t, STOMPS[0], REX_OUT + REX_AIR + 0.4) ? 'surprised' : talks('mila') ? 'happy' : within(t, S('who'), REX_OUT) ? 'think' : 'smile';
  const boboExpr: KExpr = yay ? 'laugh' : within(t, S('bobo_hi'), E('bobo_hi')) || within(t, S('egg20_b'), E('egg20_b')) ? 'wow' : within(t, STOMPS[0], REX_OUT + REX_AIR + 0.4) ? 'surprised' : talks('bobo') ? 'happy' : 'smile';
  const pointing = ROUNDS.some((r) => within(t, S(r.a as Key), E(r.a as Key) + 0.4) && r.by === 'mila');
  const boboPoint = ROUNDS.some((r) => within(t, S(r.a as Key), E(r.a as Key) + 0.4) && r.by === 'bobo');
  const boboHop = scene === 'nest' && within(t, HATCH[0] - 0.1, S('babies')) ? hopAt(t, HATCH, { h: 40, air: 0.3, pre: 0.05, land: 0.12 }) : yay ? { hop: Math.abs(Math.sin(t * 7)) * 26, squash: 0, inAir: false } : { hop: 0, squash: 0, inAir: false };

  // Rexy
  const rexPos = ((): { x: number; y: number; s: number; facing: 1 | -1 } => {
    if (scene === 'count') {
      if (t < REX_OUT) return { x: BUSH_X, y: f + 30, s: 0.7, facing: -1 };
      if (t < REX_OUT + REX_AIR) {
        const p = EASE_INOUT(prog(t, REX_OUT, REX_OUT + REX_AIR));
        return { x: BUSH_X + (REX_X - BUSH_X) * p, y: f, s: 0.7, facing: -1 };
      }
      return { x: REX_X, y: f, s: 0.7, facing: 1 };
    }
    if (scene === 'nest') return { x: REX_X, y: f, s: 0.62, facing: 1 };
    if (scene === 'rocks' || scene === 'steps') return { x: REX_X, y: f, s: 0.66, facing: 1 };
    // path: hops along the footprints while counting / in the your-turn
    const steps = within(t, KS[0] - 0.4, S('turn')) ? KS : within(t, TURN[0] - 0.4, S('great')) ? TURN : null;
    if (steps) {
      const j = steps.filter((k) => t >= k - 0.3).length; // footprint being reached
      if (j === 0) return { x: 250, y: f - 102, s: 0.45, facing: 1 };
      const from = j === 1 ? [250, f - 102] : PATH[j - 2];
      const to = PATH[j - 1];
      const p = EASE_INOUT(prog(t, steps[j - 1] - 0.3, steps[j - 1] + 0.05));
      return { x: from[0] + (to[0] - from[0]) * p, y: from[1] + (to[1] - from[1]) * p, s: 0.45, facing: j <= 10 ? 1 : -1 };
    }
    return t >= S('turn') && t < TURN[0] - 0.4 ? { x: 250, y: f - 102, s: 0.45, facing: 1 } : { x: PATH[19][0], y: PATH[19][1], s: 0.45, facing: -1 };
  })();
  const rexHop = (() => {
    if (scene === 'count' && within(t, REX_OUT - 0.1, REX_OUT + REX_AIR + 0.3)) return hopAt(t, [REX_OUT], { h: 300, air: REX_AIR, pre: 0.1, land: 0.25 });
    if (scene === 'count' && t < REX_OUT) return { hop: within(t, S('who') + 1.4, REX_OUT) ? Math.max(0, Math.sin((t - S('who') - 1.4) * 4)) * 40 - 40 : -120, squash: 0, inAir: false };
    if (scene === 'count') return hopAt(t, EGG_STOMPS, { h: 50, air: 0.3, pre: 0.06, land: 0.14 });
    if (scene === 'path') {
      const steps = within(t, KS[0] - 0.4, S('turn')) ? KS : within(t, TURN[0] - 0.4, S('great')) ? TURN : [];
      return hopAt(t, steps.map((k) => k - 0.3), { h: steps === TURN ? 40 : 70, air: steps === TURN ? 0.3 : 0.35, pre: 0.05, land: 0.1 });
    }
    return { hop: 0, squash: 0, inAir: false };
  })();
  const rexExpr: KExpr = within(t, S('rex_hi'), word('rex_hi', 1)) ? 'laugh' : within(t, S('rex_ask'), E('rex_ask')) ? 'happy' : talks('rexy') ? 'happy' : yay ? 'laugh' : 'smile';
  const rexMouth = within(t, word('rex_hi', 0), word('rex_hi', 1)) ? 0.95 : lipSync(VO, 'rexy', t);

  // stone + step rounds
  const round = ROUNDS.findIndex((r, i) => t < (i < 2 ? S(ROUNDS[i + 1].q as Key) - 0.3 : SWAP[2]));
  const step = t < S('m2q') - 0.4 ? 0 : 1;

  return (
    <>
      <ActionStage cam={cam} shake={shake} blur={cam.blur}>
        <DinoValley t={t} floor={f} />

        {/* ── HOOK + COUNT 1–10 ─────────────────────────────────────────── */}
        {scene === 'count' && (
          <g>
            {/* giant footprints coming closer on each stomp */}
            {STOMPS.map((s, i) => t >= s && t < S('ten') && (
              <g key={i} transform={`translate(${1500 - i * 220},${f + 60 + (i % 2) * 22}) scale(${popIn(t, s, 0.25)},${0.55 * popIn(t, s, 0.25)}) rotate(-90)`}>
                <Footprint c="#a9845f" s={1.0 + i * 0.12} />
              </g>
            ))}
            {STOMPS.map((s, i) => <Dust key={i} t={t} at={s} x={1500 - i * 220} y={f + 40} s={0.8 + i * 0.2} />)}
            {/* Rexy behind the big bush, then out */}
            {t < REX_OUT && (
              <Dino spec={REXY} x={rexPos.x} y={rexPos.y} scale={rexPos.s} facing={rexPos.facing} expr={within(t, S('who') + 1.4, REX_OUT) ? 'wow' : 'happy'} look={[-0.6, 0]} hop={rexHop.hop} squash={rexHop.squash} />
            )}
            <BigBush x={BUSH_X} />
            {/* the ten dinosaurs */}
            {DINOS.map((d, i) => {
              const at = i === 9 ? EGG10 : ARR[i];
              if (t < at) return null;
              const [px, py, ps] = POS[i];
              const run = i === 8 && t < ARR[i] + 0.9;
              const x = run ? 2150 + (px - 2150) * EASE_OUT(prog(t, ARR[i], ARR[i] + 0.9)) : px;
              const pop = i === 8 ? 1 : popIn(t, at, 0.35);
              const rowHop = within(t, ROW_BACK - 0.1, ROW_FRONT - 0.1) ? (i < 5 ? [ROW_BACK] : []) : within(t, ROW_FRONT - 0.1, MAKE_TEN + 1.0) ? (i >= 5 ? [ROW_FRONT] : []) : [];
              const hp = rowHop.length ? hopAt(t, rowHop, { h: 70, air: 0.34, pre: 0.08, land: 0.2 }) : i === 8 ? { hop: 0, squash: 0 } : hopAt(t, [at + 0.02], { h: 60, air: 0.3, pre: 0.02, land: 0.2 });
              const sneezing = i === 5 && within(t, SNEEZE - 0.9, SNEEZE + 0.3);
              const yawning = i === 7 && within(t, YAWN - 0.1, YAWN + 1.0);
              const munching = i === 6 && within(t, ARR[i] + 0.3, E('n7'));
              const expr: KExpr = yay && i < 9 ? 'laugh' : sneezing ? (t < SNEEZE ? 'oops' : 'surprised') : yawning ? 'sleepy' : i === 7 && t < CNT[8] ? 'sleepy' : t - at < 1.2 ? 'wow' : 'happy';
              const mouth = sneezing && t >= SNEEZE ? 0.9 : yawning ? 0.95 * Math.sin(prog(t, YAWN - 0.1, YAWN + 1.0) * Math.PI) : munching ? Math.abs(Math.sin(t * 9)) * 0.5 : 0;
              const showBaby = i !== 9 || t >= ARR[9];
              return (
                <g key={d.id}>
                  {i === 9 && t < ARR[9] + 0.2 && (
                    <g transform={`translate(${px},${py}) scale(${ps * 1.6 * popIn(t, EGG10)})`}>
                      <DinoEgg c="#fff6e4" spots="#ff6fa5" crack={prog(t, ARR[9] - 0.6, ARR[9])} wobble={Math.sin(t * 22) * 6 * prog(t, EGG10 + 0.6, ARR[9])} />
                    </g>
                  )}
                  {showBaby && (
                    <g transform={`translate(${x},${py}) scale(${pop}) translate(${-x},${-py})`}>
                      <Dino spec={d} x={x} y={py} scale={ps * (d.kind === 'baby' ? 1.25 : 1)} expr={expr} mouth={mouth} look={[-0.5, 0.1]} facing={-1}
                        walking={run} walk={t * 3} hop={hp.hop} squash={hp.squash + (sneezing && t >= SNEEZE ? -0.6 * pulse(t, SNEEZE, 0.3) : 0)} wave={i === 9 || yay} />
                    </g>
                  )}
                  {i === 8 && <MotionLines t={t} from={ARR[i]} to={ARR[i] + 0.9} x={x + 60} y={py - 80} dir={180} n={3} len={90} spread={34} />}
                  <Badge n={i + 1} x={px} y={py - TALL[d.kind] * ps * (d.kind === 'baby' ? 1.25 : 1) - 40} s={popIn(t, CNT[i], 0.3) * (within(t, ROW_BACK, ROW_FRONT) && i < 5 ? 1.25 : within(t, ROW_FRONT, MAKE_TEN) && i >= 5 ? 1.25 : 1)} c={RAINBOW[i % RAINBOW.length]} />
                  {i !== 9 && <Dust t={t} at={at + 0.32} x={px} y={py} s={0.7} />}
                  <Reaction kind="!" t={t} at={at + 0.05} until={at + 0.9} x={px + (i === 2 ? 70 : 0)} y={py - TALL[d.kind] * ps - (i === 2 ? 30 : 10)} s={0.45} />
                </g>
              );
            })}
            <StageWord t={t} at={SNEEZE} until={SNEEZE + 1.1} text="ACHOO!" x={POS[5][0] - 40} y={POS[5][1] - 230} size={78} color="#4cc9f0" rot={-8} />
            <StageWord t={t} at={YAWN} until={YAWN + 1.2} text="YAWN!" x={POS[7][0] - 30} y={POS[7][1] - 250} size={70} color="#b388ff" rot={6} />
            {/* Rexy (out of the bush) */}
            {t >= REX_OUT && (
              <Dino spec={REXY} x={rexPos.x} y={rexPos.y} scale={rexPos.s} facing={rexPos.facing} expr={t < REX_OUT + REX_AIR ? 'laugh' : rexExpr} mouth={t < REX_OUT + REX_AIR ? 0.5 : rexMouth}
                look={[0.5, -0.1]} hop={rexHop.hop} squash={rexHop.squash} wave={within(t, S('rex_hi'), E('rex_hi'))} />
            )}
            <MotionLines t={t} from={REX_OUT} to={REX_OUT + REX_AIR} x={rexPos.x + 100} y={rexPos.y - rexHop.hop * 0.72 - 200} dir={180} n={4} len={120} spread={46} />
            <Dust t={t} at={REX_OUT + REX_AIR} x={REX_X} y={f} s={1.2} />
            <StageWord t={t} at={word('rex_hi', 0)} until={word('rex_hi', 2)} text="ROAR!" x={760} y={330} size={110} color="#ff924c" rot={8} />
            {STOMPS.map((s, i) => <StageWord key={i} t={t} at={s} until={s + 0.8} text="STOMP!" x={1560 - i * 220} y={560 - i * 40} size={66 + i * 14} color="#ff924c" rot={(i - 1) * 8} />)}
            {EGG_STOMPS.map((s, i) => <StageWord key={i} t={t} at={s} until={s + 0.7} text="STOMP!" x={700 + i * 140} y={420} size={70} color="#ff924c" rot={(i - 0.5) * 10} />)}
          </g>
        )}

        {/* ── MAMA'S NESTS (11–20) + HATCHING ─────────────────────────────── */}
        {scene === 'nest' && (
          <g>
            <Dino spec={MAMA} x={1840} y={f - 10} scale={0.56} facing={-1} expr={hatched > 0 ? 'laugh' : 'happy'} look={[-0.6, 0.3]} />
            {[0, 1].map((nest) => {
              const cx = nest === 0 ? NEST_A : NEST_B;
              const n = nest === 0 ? 10 : nB;
              const glow = nest === 0 ? within(t, word('egg_ten', 6), E('egg_more')) || within(t, S('egg20'), E('egg20') + 0.6) : within(t, word('egg_more', 6), E('egg_more') + 0.3) || within(t, S('egg20'), E('egg20') + 0.6);
              return (
                <g key={nest} transform={`translate(${cx},${f - 4})`}>
                  <EggNest n={n} s={0.78} glow={glow} label={nest === 0 ? (t >= word('egg_ten', 6) ? '10' : undefined) : nB > 0 ? String(nB) : undefined}
                    eggs={(i) => {
                      const idx = nest * 10 + i; // 0..19
                      const pair = Math.floor(idx / 2);
                      const hat = t >= HATCH[pair] + 0.25;
                      const crk = t >= HATCH[pair] - 0.1 ? 1 : within(t, CRACKS[0], HATCH[pair]) ? 0.35 + 0.1 * Math.sin(idx) : 0;
                      const wob = within(t, S('hatch') + 0.3, HATCH[pair] + 0.25) ? Math.sin(t * 18 + idx) * (4 + (t >= HATCH[pair] - 0.3 ? 8 : 0)) : 0;
                      if (nest === 1 && i === nB - 1 && t < LAND[i] + 0.2) {
                        // the newest egg lands with a squash
                        const sq = pulse(t, LAND[i], 0.2);
                        return <g transform={`scale(${1 + sq * 0.12},${1 - sq * 0.15})`}><DinoEgg c="#f2fbff" spots="#4cc9f0" /></g>;
                      }
                      if (!hat) return <DinoEgg c={nest === 0 ? '#fff6e4' : '#f2fbff'} spots={nest === 0 ? '#8ac926' : '#4cc9f0'} crack={crk} wobble={wob} />;
                      const b: DinoSpec = { id: `b${idx}`, kind: 'baby', body: BABY_COLORS[idx % 6], belly: '#fffaf0', accent: '#ff6fa5', spots: '#8ac926' };
                      const p = popIn(t, HATCH[pair] + 0.25, 0.3);
                      return (
                        <g transform={`translate(0,-10) scale(${0.68 * p})`}>
                          <Dino spec={b} x={0} y={10} scale={0.85} expr={yay ? 'laugh' : 'happy'} wave={within(t, S('babies'), S('game'))} shadow={false} />
                        </g>
                      );
                    }}
                  />
                </g>
              );
            })}
            {/* the falling egg (into nest B) */}
            {DROP.map((d, k) => {
              if (t < d || t >= LAND[k]) return null;
              const cell = 120 * 0.78;
              const cx = NEST_B + ((k % 5) - 2) * cell;
              const cy = f - 4 + (Math.floor(k / 5) - 0.5) * cell + 30 * 0.78;
              const p = prog(t, d, LAND[k]);
              return <g key={k} transform={`translate(${cx},${cy - (1 - p * p) * 420}) scale(${0.78 * 0.62})`}><DinoEgg c="#f2fbff" spots="#4cc9f0" /></g>;
            })}
            {LAND.map((l, k) => <Dust key={k} t={t} at={l} x={NEST_B + ((k % 5) - 2) * 93.6} y={f - 4 + (Math.floor(k / 5) - 0.5) * 93.6 + 20} s={0.45} />)}
            {/* hatch bursts + shells flying */}
            {HATCH.map((h, j) => [0, 1].map((q) => {
              const idx = j * 2 + q;
              const nest = idx < 10 ? 0 : 1;
              const i = idx % 10;
              const cx = (nest === 0 ? NEST_A : NEST_B) + ((i % 5) - 2) * 93.6;
              const cy = f - 4 + (Math.floor(i / 5) - 0.5) * 93.6;
              const p = prog(t, h + 0.2, h + 0.9);
              return (
                <g key={`${j}${q}`}>
                  <ImpactStar t={t} at={h + 0.2} x={cx} y={cy - 30} s={0.38} color={BABY_COLORS[idx % 6]} />
                  {p > 0 && p < 1 && (
                    <path d="M -30,0 L -20,-14 L -8,0 L 4,-16 L 16,0 L 30,-12 C 26,-40 -26,-40 -30,0 Z" fill="#fff6e4" {...kst(4)}
                      transform={`translate(${cx + (q ? 40 : -40) * p},${cy - 60 - Math.sin(p * Math.PI) * 90}) rotate(${(q ? 1 : -1) * p * 200}) scale(0.9)`} opacity={1 - p} />
                  )}
                </g>
              );
            }))}
            {CRACKS.map((c, i) => <StageWord key={i} t={t} at={c} until={c + 0.9} text="CRACK!" x={i ? NEST_B : NEST_A} y={600 - i * 30} size={74} color="#ffca3a" rot={(i ? 8 : -8)} />)}
            {within(t, S('babies'), S('game')) && [0, 1].map((nest) => <Reaction key={nest} kind="heart" t={t} at={S('babies') + nest * 0.2} until={S('game')} x={nest === 0 ? NEST_A : NEST_B} y={f - 190} s={0.9} />)}
            <Dino spec={REXY} x={rexPos.x} y={rexPos.y} scale={rexPos.s} facing={1} expr={rexExpr} mouth={lipSync(VO, 'rexy', t)} look={[0.6, 0.1]} wave={within(t, S('by2'), E('by2'))} />
          </g>
        )}

        {/* ── FIND THE NUMBER ON THE ROCKS ───────────────────────────────── */}
        {scene === 'rocks' && (
          <g>
            {t < S('tip') - 0.2 && round >= 0 && ROUNDS[round].stones.map((n, i) => {
              const r = ROUNDS[round];
              const start = round === 0 ? SWAP[1] - 0.4 : S(r.q as Key) - 0.4;
              const ans = t >= S(r.a as Key);
              const ok = i === r.ok;
              const sx = 960 + i * 340;
              const hop = ans && ok ? Math.abs(Math.sin((t - S(r.a as Key)) * 7)) * 30 * Math.max(0, 1 - (t - S(r.a as Key)) / 2.2) : 0;
              return (
                <g key={`${round}${i}`} opacity={ans && !ok ? 0.4 : 1}>
                  <g transform={`translate(${sx},${f + 40 - hop}) scale(${popIn(t, start + i * 0.12)})`}>
                    <NumStone n={n} s={1.05} c={ans && ok ? '#ffd166' : '#b8c0cc'} />
                  </g>
                  {ok && <AnswerMark t={t} at={S(r.a as Key) + 0.2} until={round < 2 ? S(ROUNDS[round + 1].q as Key) - 0.4 : S('tip') - 0.2} ok x={sx + 70} y={f - 170} size={0.55} />}
                </g>
              );
            })}
            {/* the tip: 15, 12, 19 — the first digit is ONE group of ten */}
            {t >= S('tip') - 0.2 && ['15', '12', '19'].map((n, i) => {
              const sx = 960 + i * 340;
              const hi = t >= word('tip', 10); // "… start with a ONE"
              const nest = t >= word('tip', 14) - 0.1;
              return (
                <g key={n}>
                  <g transform={`translate(${sx},${f + 40}) scale(${popIn(t, S('tip') - 0.2 + i * 0.12)})`}><NumStone n={n} s={1.05} hiFirst={hi} /></g>
                  {nest && <g transform={`translate(${sx - 34},${f - 210}) scale(${0.22 * popIn(t, word('tip', 14) - 0.1 + i * 0.12)})`}><EggNest n={10} /></g>}
                </g>
              );
            })}
            <Dino spec={REXY} x={rexPos.x} y={rexPos.y} scale={rexPos.s} facing={1} expr={rexExpr} mouth={lipSync(VO, 'rexy', t)} look={[0.6, 0]} />
          </g>
        )}

        {/* ── MISSING FOOTPRINT NUMBERS ──────────────────────────────────── */}
        {scene === 'steps' && (
          <g>
            {STEPS[step].nums.map((n, i) => {
              const st = STEPS[step];
              const sx = STEP_X[step][i];
              const missing = n === '?';
              const solved = missing && t >= S(st.a as Key);
              const start = step === 0 ? SWAP[2] - 0.3 : S('m2q') - 0.4;
              const label = solved ? st.ans : n;
              const c = missing ? (solved ? '#52b788' : '#ffca3a') : RAINBOW[(Number(n) - 1) % RAINBOW.length];
              const pr = popIn(t, start + i * 0.15);
              const wob = missing && !solved ? Math.sin(t * 5) * 0.06 : 0;
              return (
                <g key={`${step}${i}`}>
                  <g transform={`translate(${sx},${f + 104}) scale(${pr}) rotate(-90) scale(0.62,1)`}><Footprint c={missing ? '#e9c46a' : '#a9845f'} s={1.9} /></g>
                  <Badge n={label} x={sx} y={f - 40} s={pr * (2.1 + wob + (solved ? 0.3 * pulse(t, S(st.a as Key), 0.4) : 0))} c={c} />
                </g>
              );
            })}
            <Dino spec={REXY} x={rexPos.x} y={rexPos.y} scale={rexPos.s} facing={1} expr={rexExpr} mouth={lipSync(VO, 'rexy', t)} look={[0.6, 0.2]} />
          </g>
        )}

        {/* ── COUNT TO 20 ALONG THE FOOTPRINT PATH ───────────────────────── */}
        {scene === 'path' && (
          <g>
            <path d={`M ${TRAIL.x0 - 70},${TRAIL.y1} Q ${TRAIL.x0 - 80},${TRAIL.y0} ${TRAIL.x0 + 40},${TRAIL.y0} L ${TRAIL.x1 - 40},${TRAIL.y0} Q ${TRAIL.x1 + 80},${TRAIL.y0} ${TRAIL.x1 + 70},${TRAIL.y1} Z`}
              fill="#f3d9a4" {...kst(6)} />
            <path d={`M ${TRAIL.x0},${TRAIL.y0 + 14} L ${TRAIL.x1},${TRAIL.y0 + 14}`} stroke="#ffffff" strokeWidth={6} opacity={0.45} strokeLinecap="round" />
            {PATH.map(([px, py], j) => {
              const lit = j < pathLit ? 1 : 0;
              const litAt = within(t, KS[0], S('turn')) ? KS[j] : TURN[j];
              return <StepPrint key={j} x={px} y={py} n={String(j + 1)} lit={lit} c={RAINBOW[j % RAINBOW.length]} s={0.92 + 0.14 * pulse(t, litAt, 0.3) * lit} />;
            })}
            <Dino spec={REXY} x={rexPos.x} y={rexPos.y} scale={rexPos.s} facing={rexPos.facing} expr={rexExpr} mouth={lipSync(VO, 'rexy', t)} look={[0.5, 0.3]}
              hop={rexHop.hop} squash={rexHop.squash} wave={t >= S('bye')} />
            {[...KS, ...TURN].map((k, i) => <Dust key={i} t={t} at={k + 0.05} x={PATH[i % 20][0]} y={PATH[i % 20][1]} s={0.5} />)}
          </g>
        )}

        {/* ── the kids (every scene) ─────────────────────────────────────── */}
        <Critter spec={BOBO_HERO} x={castX.bobo} y={f} scale={0.62} expr={boboExpr} look={scene === 'path' ? [-0.6, 0] : [0.7, 0]} mouth={lipSync(VO, 'bobo', t)}
          facing={scene === 'path' ? -1 : 1} armL={yay ? 'up' : boboPoint ? 'point' : talks('bobo') ? 'wave' : 'down'} armR={yay ? 'up' : 'down'}
          hop={boboHop.hop} squash={boboHop.squash} />

        <Kid spec={MILA_HERO} x={castX.mila} y={f} scale={0.62} expr={milaExpr} look={[0.7, 0]} mouth={lipSync(VO, 'mila', t)}
          armL={fingers > 0 ? 'count' : pointing ? 'point' : yay ? 'up' : within(t, S('mila_hi'), E('mila_hi')) ? 'wave' : 'down'}
          armR={fR > 0 ? 'count' : yay ? 'up' : 'hip'} fingersL={fL} fingersR={fR} hop={yay ? Math.abs(Math.sin(t * 7 + 1)) * 24 : 0} />
        {tenTag && fingers > 0 && (
          <g transform={`translate(${castX.mila},${f - 520}) scale(${popIn(t, scene === 'nest' ? LAND[0] : KS[10])})`}>
            <rect x={-74} y={-34} width={148} height={64} rx={30} fill="#ffca3a" {...kst(5)} />
            <text y={14} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill={KINK}>10 +</text>
          </g>
        )}
        {/* reactions on the kids */}
        <Reaction kind="!" t={t} at={STOMPS[0] + 0.05} until={STOMPS[2] + 0.8} x={castX.mila + 10} y={f - 520} s={0.6} />
        <Reaction kind="?" t={t} at={E('who') + 0.1} until={REX_OUT} x={castX.bobo + 30} y={f - 420} s={0.6} />
        <Reaction kind="heart" t={t} at={S('bobo_hi') + 0.6} until={E('bobo_hi') + 0.4} x={castX.bobo} y={f - 420} s={0.7} />
        <Reaction kind="idea" t={t} at={word('egg20', 6)} until={E('egg20') + 0.6} x={castX.mila} y={f - 560} s={0.7} />
        <Reaction kind="?" t={t} at={E('m1q') + 0.1} until={S('m1a')} x={castX.mila + 20} y={f - 540} s={0.55} />
        <Reaction kind="?" t={t} at={E('m2q') + 0.1} until={S('m2a')} x={castX.bobo + 20} y={f - 420} s={0.55} />
      </ActionStage>

      {/* ── screen-space ─────────────────────────────────────────────────── */}
      <PopText t={t} at={INTRO_END + 0.15} until={STOMPS[2] + 0.4} text="NUMBERS 1–20" y={150} size={120} color="#ffca3a" />
      <PopText t={t} at={INTRO_END + 0.45} until={STOMPS[2] + 0.4} text="with DINOSAURS" y={270} size={70} color="#ffffff" rot={2} />
      <ThinkTimer t={t} from={E('who') + 0.1} to={REX_OUT} x={1760} y={190} r={90} label="WHO?" />
      <FocusLines t={t} from={REX_OUT + REX_AIR - 0.05} to={REX_OUT + REX_AIR + 1.0} x={W * 0.35} y={H * 0.5} r={H * 0.36} />
      <PopText t={t} at={word('goal', 6)} until={E('goal') + 0.8} text="COUNT TO 20!" y={170} size={120} color="#ffca3a" />
      {/* 1–10: the big numeral + its word on each count */}
      {CNT.map((c, i) => (
        <React.Fragment key={i}>
          <PopText t={t} at={c - 0.05} until={i < 9 ? ARR[i + 1] - 0.25 : S('ten') - 0.2} text={String(i + 1)} x={W / 2} y={150} size={170} color={RAINBOW[i % RAINBOW.length]} />
          <PopText t={t} at={c + 0.15} until={i < 9 ? ARR[i + 1] - 0.25 : S('ten') - 0.2} text={NUMW[i]} x={W / 2} y={285} size={64} color="#ffffff" rot={2} />
        </React.Fragment>
      ))}
      <PopText t={t} at={ROW_BACK} until={ROW_FRONT - 0.05} text="5" x={W / 2} y={160} size={160} color="#ffca3a" />
      <PopText t={t} at={ROW_FRONT} until={MAKE_TEN - 0.05} text="5 + 5" x={W / 2} y={160} size={150} color="#ff6fa5" />
      <PopText t={t} at={MAKE_TEN} until={E('ten') + 1.0} text="5 + 5 = 10" x={W / 2} y={160} size={150} color="#ffca3a" />
      <PopText t={t} at={E('ten_turn') - 0.6} until={S('egg_go') - 0.1} text="YOUR TURN!" y={180} size={120} color="#ffffff" />
      {/* 11–20: numeral + "10 + k" */}
      {SAY.map((s, k) => (
        <React.Fragment key={k}>
          <PopText t={t} at={s - 0.05} until={k < 9 ? DROP[k + 1] - 0.2 : S('egg20') - 0.2} text={String(11 + k)} x={W / 2} y={150} size={170} color={RAINBOW[(10 + k) % RAINBOW.length]} />
          <PopText t={t} at={s + 0.15} until={k < 9 ? DROP[k + 1] - 0.2 : S('egg20') - 0.2} text={`10 + ${k + 1}`} x={W / 2} y={285} size={64} color="#ffffff" rot={2} />
        </React.Fragment>
      ))}
      <PopText t={t} at={word('egg_ten', 6)} until={S('egg_more') - 0.2} text="10" x={W / 2} y={160} size={170} color="#ffca3a" />
      <PopText t={t} at={word('egg20', 6)} until={E('egg20_b') + 0.6} text="10 + 10 = 20" x={W / 2} y={160} size={140} color="#ffca3a" />
      {/* count by twos */}
      {HATCH.map((h, j) => (
        <PopText key={j} t={t} at={h + 0.12} until={j < 9 ? HATCH[j + 1] + 0.05 : S('babies') - 0.1} text={String(2 * (j + 1))} x={W / 2} y={150} size={170} color={RAINBOW[(2 * j + 1) % RAINBOW.length]} />
      ))}
      <PopText t={t} at={S('by2') + 0.4} until={HATCH[0] + 0.05} text="COUNT BY 2s!" y={170} size={110} color="#ff924c" />
      <PopText t={t} at={S('babies') + 0.2} until={S('game') - 0.2} text="20 BABY DINOS!" y={170} size={110} color="#ff6fa5" />
      {/* the rock game + the steps game */}
      {ROUNDS.map((r) => (
        <ThinkTimer key={r.q} t={t} from={E(r.q as Key) + 0.1} to={S(r.a as Key) - 0.1} x={1760} y={190} r={90} label="FIND IT!" />
      ))}
      {ROUNDS.map((r, i) => (
        <PopText key={r.a} t={t} at={S(r.a as Key) + 0.2} until={i < 2 ? S(ROUNDS[i + 1].q as Key) - 0.4 : S('tip') - 0.2} text={r.stones[r.ok]} x={W / 2} y={160} size={160} color="#52b788" />
      ))}
      <PopText t={t} at={word('tip', 14) - 0.1} until={E('tip') + 0.8} text="1 = ONE TEN" y={160} size={110} color="#ffca3a" />
      {STEPS.map((st) => (
        <ThinkTimer key={st.q} t={t} from={E(st.q as Key) + 0.1} to={S(st.a as Key) - 0.1} x={1760} y={190} r={90} label="WHICH?" />
      ))}
      {STEPS.map((st) => (
        <PopText key={st.a} t={t} at={S(st.a as Key) + 0.1} until={st.a === 'm1a' ? S('m2q') - 0.4 : SWAP[3] - 0.4} text={st.ans} x={W / 2} y={160} size={170} color="#52b788" />
      ))}
      {/* count to 20 together + your turn */}
      {KS.map((k, j) => (
        <PopText key={j} t={t} at={k - 0.03} until={j < 19 ? KS[j + 1] - 0.03 : S('cnt_yay')} text={String(j + 1)} x={W / 2} y={150} size={160} color={RAINBOW[j % RAINBOW.length]} />
      ))}
      <PopText t={t} at={S('cnt_yay') + 0.1} until={S('turn') - 0.2} text="YOU DID IT!" y={170} size={120} color="#ffca3a" />
      <PopText t={t} at={word('turn', 0)} until={TURN[0] - 0.05} text="YOUR TURN!" y={170} size={130} color="#ffffff" />
      {TURN.map((k, j) => (
        <PopText key={j} t={t} at={k - 0.02} until={j < 19 ? TURN[j + 1] - 0.02 : TURN[19] + 0.9} text={String(j + 1)} x={W / 2} y={150} size={150} color={RAINBOW[j % RAINBOW.length]} />
      ))}
      <PopText t={t} at={S('bye')} until={END_IRIS} text="SEE YOU NEXT TIME!" y={170} size={100} color="#ffca3a" />
      <Confetti t={t} at={CNT[9]} y={420} />
      <Confetti t={t} at={word('egg20', 6)} y={420} />
      <Confetti t={t} at={S('babies')} y={420} />
      <Confetti t={t} at={S('cnt_yay')} y={420} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <SparksIntro t={t} at={0} cast={{ kids: [MILA_HERO, LEO_HERO], buddy: BOBO_HERO }} />
      {WIPES.map((w, i) => <StarWipe key={i} t={t} at={w} dur={0.45} hold={0.15} color={['#ffca3a', '#4cc9f0', '#ff6fa5', '#8ac926'][i]} />)}
      <StarWipe t={t} at={END_IRIS} dur={0.5} hold={5} color="#3b2a4a" x={W / 2} y={H * 0.5} />
    </>
  );
}
