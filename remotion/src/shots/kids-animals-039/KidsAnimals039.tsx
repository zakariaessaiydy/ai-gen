// TINY SPARKS · Day 39 · 🦁 Animal Stories #6 — "Oliver the Owl's First Flight" (LONG 16:9, 5:01)
// kids-shorts/tiny-sparks/animals/day-039-oliver-the-owl-s-first-flight. Cues from VO via K (keys.gen.ts).
// ENERGY LAYER standard: ident on the jingle → GUESS WHO (two big eyes blink in a dark tree hole) → reveal: Oliver
// hops out onto the high branch → MEET (Bobo + Bella) → SOUND "hoo-hoo" (your turn) → 3 TRUE FACTS (awake at night ·
// turns the head very far, ~270° — never "all the way" · soft feathers = quiet flight) → STORY (value: friendship):
// Oliver is scared to fly → "Friends help friends! One step at a time": 1 flap your wings (your turn) · 2 a little hop
// from the low branch into Bobo's leaf pile (BOING) · 3 count to three and FLY → he flies over the forest → Bella's
// balloon gets stuck in a tall tree → Oliver flies up and brings it back → night falls (owls are awake!) → LET'S
// REMEMBER (5 questions, think timers) → chant "Friends help friends!" ×3 → flap and fly → bye + star iris.
import React from 'react';
import { Critter, type CArm, type CritterSpec } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Forest } from '../../lib/kids/sets';
import { Balloon, Confetti, FONT_TOON, KidsCaptions, PopText, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { KINK, kst, Twinkle, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import {
  ActionStage, Dust, ImpactStar, MotionLines, Reaction, SparksIntro, StageWord, StarWipe, directorCam, hopAt, onBeat, shakeOf,
  type Hit, type Shot,
} from '../../lib/kids/energy';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsAnimals039', durationInSeconds: 301.2, fps: 30, width: 1920, height: 1080 };

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
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff', oliver: '#ffca3a', bella: '#ff8fab' };
type KF = [number, number, number][]; // [t, x, y]
const lerp2 = (t: number, kf: KF): [number, number] => {
  if (t <= kf[0][0]) return [kf[0][1], kf[0][2]];
  for (let i = 1; i < kf.length; i++) {
    if (t <= kf[i][0]) {
      const [t0, x0, y0] = kf[i - 1];
      const [t1, x1, y1] = kf[i];
      const p = EASE_INOUT((t - t0) / Math.max(1e-6, t1 - t0));
      return [x0 + (x1 - x0) * p, y0 + (y1 - y0) * p];
    }
  }
  const l = kf[kf.length - 1];
  return [l[1], l[2]];
};
const pulse = (t: number, at: number, d = 0.35) => (t < at || t > at + d ? 0 : Math.sin(((t - at) / d) * Math.PI));

// ── cast
const OLIVER: CritterSpec = { id: 'oliver', species: 'owl', fur: '#c8a27a', fur2: '#fff3e0', dark: '#8d6e63', iris: '#3a86ff' };
const BELLA: CritterSpec = { id: 'bella', species: 'bunny', fur: '#ffffff', fur2: '#ffe3ec', dark: '#ff8fab', bow: '#ff6fa5' };
const BOBO_X = 600;
const BELLA_X = 830;
const OS = 0.42; // Oliver's scale
// the big oak (right) and the tall round tree (left)
const OAK = 1400;
const HIGH: [number, number] = [1210, 430]; // the high branch (feet)
const LOW: [number, number] = [1230, 700]; // the low branch
const PILE: [number, number] = [1110, f + 34]; // Bobo's leaf pile
const HOLE: [number, number] = [OAK, 560];
const TALL = 400;
const STUCK: [number, number] = [520, 230]; // where the balloon gets stuck
const BELLA_HAND: [number, number] = [BELLA_X + 150, f - 470];

// ── timeline anchors
const REVEAL = word('reveal', 2) - 0.05; // "owl!"
const LOOKS = [word('look', 1), word('look', 3), word('look', 5)]; // left · right · behind
const DOWN0 = S('step2') + 0.9; // flutter down to the low branch
const HOP = word('hop', 3) - 0.05; // "hop!"
const HOP_AIR = 0.6;
const UP0 = word('step3', 4); // back up on the big branch
const NUMS = [word('count', 3), word('count', 4), word('count', 5)];
const FLY = S('fly') - 0.1;
const FLOAT0 = word('balloon', 4); // the balloon floats away
const GET0 = S('get') + 0.2;
const GRAB = word('get', 5); // "gets the balloon"
const GIVE0 = S('give') - 0.6;
const HANDED = S('bella_yay') - 0.2;
const LAND = HANDED + 0.6;
const NIGHT0 = S('night') - 0.3;
const NIGHT1 = S('again') + 0.4;
const HEAD_Q = [word('q3', 8), word('q3', 10)]; // "left" · "right"
const FLAP_END = S('flap_end');
const END_IRIS = E('ask_end') + 0.6;

// Oliver's path (feet position) — on branches, hopping, flying
const PATH: KF = [
  [0, HOLE[0], HOLE[1] + 70], [REVEAL, HOLE[0], HOLE[1] + 70], [REVEAL + 0.6, HIGH[0], HIGH[1]],
  [DOWN0, HIGH[0], HIGH[1]], [DOWN0 + 1.0, LOW[0], LOW[1]],
  [HOP, LOW[0], LOW[1]], [HOP + HOP_AIR, PILE[0], PILE[1]],
  [UP0, PILE[0], PILE[1]], [UP0 + 1.3, HIGH[0], HIGH[1]],
  [FLY, HIGH[0], HIGH[1]], [FLY + 1.6, 1000, 560], [FLY + 3.2, 720, 520], [FLY + 4.8, 560, 590], [S('soar') + 1.0, 660, 500],
  [S('soar') + 3.0, 900, 470], [S('thanks') - 0.3, 1040, 520],
  [GET0, 1040, 520], [GRAB, STUCK[0] + 40, STUCK[1] + 210],
  [GIVE0, STUCK[0] + 40, STUCK[1] + 210], [GIVE0 + 1.4, BELLA_X + 190, f - 290],
  [HANDED, BELLA_X + 190, f - 290], [LAND, 1090, f],
  [FLAP_END + 0.6, 1090, f], [FLAP_END + 1.6, 1090, f - 260], [FLAP_END + 3.2, 1090, f - 300], [FLAP_END + 4.2, 1090, f],
];
// is Oliver in the air (wings flapping)?
const flyingAt = (t: number) =>
  within(t, DOWN0, DOWN0 + 1.0) || within(t, UP0, UP0 + 1.3) || within(t, FLY, LAND) || within(t, FLAP_END + 0.6, FLAP_END + 4.2);

// ── director camera
const SHOTS: Shot[] = [
  { t: 0, z: 1.0, x: 960, y: 540, move: 'cut' },
  { t: S('guess') - 0.3, z: 1.55, x: HOLE[0], y: HOLE[1], move: 'smooth', dur: 2.2, push: 0.02 },
  { t: REVEAL - 0.05, z: 1.4, x: HIGH[0] + 60, y: HIGH[1] - 110, move: 'snap', push: 0.01 },
  { t: S('bobo_hi') - 0.2, z: 1.5, x: BOBO_X + 40, y: 640, move: 'whip' },
  { t: S('bella_hi') - 0.2, z: 1.5, x: BELLA_X, y: 640, move: 'whip' },
  { t: S('sound_q') - 0.2, z: 1.5, x: HIGH[0] + 40, y: HIGH[1] - 110, move: 'whip', push: 0.01 },
  { t: S('sound_turn') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('sound_b') - 0.2, z: 1.5, x: HIGH[0] + 40, y: HIGH[1] - 110, move: 'snap' },
  { t: S('facts') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.7 },
  { t: S('yawn') - 0.2, z: 1.6, x: HIGH[0] + 30, y: HIGH[1] - 110, move: 'snap' },
  { t: S('fact2') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('look') - 0.2, z: 1.7, x: HIGH[0] + 30, y: HIGH[1] - 110, move: 'snap' },
  { t: S('fact3') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('wow') - 0.2, z: 1.5, x: BOBO_X + 40, y: 640, move: 'whip' },
  { t: S('story') - 0.2, z: 1.15, x: 1150, y: 520, move: 'smooth', dur: 1.0 },
  { t: S('problem') - 0.2, z: 1.55, x: HIGH[0] + 30, y: HIGH[1] - 110, move: 'smooth', dur: 1.2, push: 0.03 },
  { t: S('ask') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 },
  { t: S('idea') - 0.2, z: 1.5, x: BELLA_X, y: 640, move: 'whip', push: 0.01 },
  { t: S('step1') - 0.2, z: 1.45, x: HIGH[0] + 30, y: HIGH[1] - 110, move: 'whip' },
  { t: S('flap_turn') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('flap_do') - 0.2, z: 1.45, x: HIGH[0] + 30, y: HIGH[1] - 110, move: 'snap' },
  { t: S('step2') - 0.2, z: 1.2, x: 1150, y: 640, move: 'smooth', dur: 0.8 },
  { t: S('leaves') - 0.2, z: 1.5, x: BOBO_X + 200, y: 720, move: 'whip' },
  { t: S('hop') - 0.2, z: 1.3, x: 1180, y: 700, move: 'whip' },
  { t: HOP + HOP_AIR - 0.05, z: 1.6, x: PILE[0], y: PILE[1] - 160, move: 'snap' },
  { t: S('step3') - 0.2, z: 1.15, x: 1100, y: 600, move: 'smooth', dur: 0.8 },
  { t: S('count') - 0.2, z: 1.45, x: HIGH[0] + 30, y: HIGH[1] - 110, move: 'smooth', dur: 1.0, push: 0.02 },
  { t: FLY + 0.1, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 1.2 },
  { t: S('thanks') - 0.2, z: 1.35, x: 1000, y: 560, move: 'smooth', dur: 0.8 },
  { t: S('balloon') - 0.2, z: 1.0, x: 960, y: 540, move: 'whip' },
  { t: S('bella_sad') - 0.2, z: 1.5, x: BELLA_X, y: 640, move: 'whip' },
  { t: S('help_q') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.7 },
  { t: S('oliver_go') - 0.2, z: 1.4, x: 1040, y: 520, move: 'snap' },
  { t: S('get') - 0.2, z: 1.1, x: 760, y: 470, move: 'smooth', dur: 1.2 },
  { t: S('give') - 0.2, z: 1.3, x: 900, y: 600, move: 'smooth', dur: 0.8 },
  { t: S('lesson') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 },
  { t: S('night_o') - 0.2, z: 1.45, x: 1090, y: 690, move: 'snap' },
  { t: S('again') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 },
  { t: S('a1') - 0.1, z: 1.4, x: 1090, y: 690, move: 'snap' },
  { t: E('a1') + 0.6, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('a2') - 0.1, z: 1.4, x: BELLA_X, y: 640, move: 'snap' },
  { t: E('a2') + 0.6, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('a5') - 0.1, z: 1.4, x: BELLA_X + 100, y: 660, move: 'snap' },
  { t: E('a5') + 0.6, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
];
const PUNCHES = [REVEAL, HOP + HOP_AIR, ...NUMS, FLY, GRAB, HANDED];
const HITS: Hit[] = [{ at: HOP + HOP_AIR, amp: 12, dur: 0.35 }, { at: REVEAL, amp: 8, dur: 0.3 }];

// ── props + set pieces
const Oak: React.FC<{ t: number; night: number }> = ({ t }) => (
  <g>
    <Vol kind="tube"><path d={`M ${OAK - 70},${f} Q ${OAK - 50},400 ${OAK - 40},200 L ${OAK + 40},200 Q ${OAK + 50},400 ${OAK + 70},${f} Z`} fill="#8d5a3b" {...kst(7)} /></Vol>
    {/* the tree hole */}
    <ellipse cx={HOLE[0]} cy={HOLE[1]} rx={62} ry={78} fill="#3b2a4a" {...kst(6)} />
    {/* high + low branches */}
    <Vol kind="tube"><path d={`M ${OAK - 40},${HIGH[1] + 30} Q ${HIGH[0] + 40},${HIGH[1] + 10} ${HIGH[0] - 130},${HIGH[1] - 4} L ${HIGH[0] - 130},${HIGH[1] + 22} Q ${HIGH[0] + 40},${HIGH[1] + 40} ${OAK - 40},${HIGH[1] + 70} Z`} fill="#8d5a3b" {...kst(6)} /></Vol>
    <Vol kind="tube"><path d={`M ${OAK - 50},${LOW[1] + 20} Q ${LOW[0] + 40},${LOW[1] + 4} ${LOW[0] - 110},${LOW[1] - 2} L ${LOW[0] - 110},${LOW[1] + 22} Q ${LOW[0] + 40},${LOW[1] + 34} ${OAK - 50},${LOW[1] + 60} Z`} fill="#8d5a3b" {...kst(6)} /></Vol>
    {[[HIGH[0] - 120, HIGH[1] - 10], [LOW[0] - 100, LOW[1] - 6]].map(([x, y], i) => (
      <path key={i} d={`M ${x},${y} q -30,-30 -20,-60 q 30,10 20,60 Z`} fill="#52b788" {...kst(4)} transform={`rotate(${Math.sin(t * 1.5 + i) * 6} ${x} ${y})`} />
    ))}
    <Vol>
      {[[OAK - 160, 170, 150], [OAK + 70, 120, 170], [OAK + 200, 240, 130], [OAK - 40, 30, 120]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? '#2d9a5a' : '#38b26b'} {...kst(6)} />
      ))}
    </Vol>
  </g>
);
const TallTree: React.FC = () => (
  <g>
    <Vol kind="tube"><rect x={TALL - 36} y={300} width={72} height={f - 300} rx={18} fill="#a0673c" {...kst(6)} /></Vol>
    <Vol>
      {[[TALL - 110, 250, 120], [TALL + 90, 240, 125], [TALL, 150, 140], [TALL - 20, 320, 110]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? '#40916c' : '#52b788'} {...kst(6)} />
      ))}
    </Vol>
  </g>
);
const LeafPile: React.FC<{ s: number; burst: number }> = ({ s, burst }) =>
  s <= 0 ? null : (
    <g transform={`translate(${PILE[0]},${PILE[1] + 10}) scale(${s})`}>
      <Vol kind="slope"><path d="M -170,0 Q -150,-90 -60,-110 Q 0,-140 60,-110 Q 150,-90 170,0 Z" fill="#ff924c" {...kst(6)} /></Vol>
      {[[-110, -40, '#ffca3a'], [-40, -80, '#ff595e'], [40, -70, '#ffca3a'], [110, -30, '#e76f51'], [0, -30, '#ff6fa5']].map(([x, y, c], i) => (
        <path key={i} d="M 0,-22 Q 22,0 0,22 Q -22,0 0,-22 Z" fill={c as string} {...kst(3)} transform={`translate(${x},${(y as number) - burst * (60 + i * 25)}) rotate(${i * 40 + burst * 200})`} />
      ))}
    </g>
  );
const Feather: React.FC<{ x: number; y: number; rot: number; s?: number }> = ({ x, y, rot, s = 1 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <Vol><path d="M 0,-110 Q 60,-40 20,90 Q 0,110 -10,90 Q -60,-30 0,-110 Z" fill="#f5e6d3" {...kst(6)} /></Vol>
    <path d="M 0,-100 Q 6,0 -2,110" fill="none" stroke="#8d6e63" strokeWidth={6} strokeLinecap="round" />
    {[-60, -30, 0, 30].map((y) => <path key={y} d={`M 0,${y} l 24,-16 M 0,${y + 10} l -24,-16`} stroke="#c8a27a" strokeWidth={4} strokeLinecap="round" />)}
  </g>
);
const StepCard: React.FC<{ n: number; label: string; c: string; s: number; children: React.ReactNode }> = ({ n, label, c, s, children }) =>
  s <= 0 ? null : (
    <g transform={`scale(${s})`}>
      <rect x={-150} y={-170} width={300} height={330} rx={36} fill="#ffffff" {...kst(8)} />
      <circle cx={-130} cy={-150} r={34} fill={c} {...kst(5)} />
      <text x={-130} y={-137} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill="#ffffff">{n}</text>
      <g transform="translate(0,-20)">{children}</g>
      <text y={130} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill={KINK}>{label}</text>
    </g>
  );
const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (EASE_OUT(p) - 1) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};

export default function KidsAnimals039() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const shake = shakeOf(t, HITS);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const night = Math.min(prog(t, NIGHT0, NIGHT0 + 1.5), 1 - prog(t, NIGHT1 - 0.8, NIGHT1));

  // Oliver
  const [ox, oyRaw] = lerp2(t, PATH);
  const flying = flyingAt(t);
  const bob = flying ? Math.sin(t * 6) * 10 : 0;
  const hopArc = within(t, HOP, HOP + HOP_AIR) ? Math.sin(prog(t, HOP, HOP + HOP_AIR) * Math.PI) * 160 : 0;
  const oy = oyRaw - hopArc + bob;
  const flapping = flying || within(t, S('step1') + 1.0, E('flap_do') + 0.3) || within(t, word('fly', 0), FLY + 0.2);
  const wing: CArm = flapping ? { a: 105 + Math.sin(t * 17) * 45 } : within(t, S('hello'), E('hello')) || within(t, S('bye'), E('bye')) ? 'wave' : 'down';
  const scared = within(t, S('problem'), S('idea')) || within(t, S('ready'), S('count'));
  const oExpr: KExpr =
    t < REVEAL ? 'smile'
    : within(t, S('yawn'), E('yawn')) ? 'sleepy'
    : scared ? (within(t, S('feel'), S('idea')) ? 'oops' : 'sad')
    : within(t, HOP, HOP + HOP_AIR) ? 'surprised'
    : within(t, FLY, S('soar') + 3) || within(t, S('hop_ok'), E('hop_ok')) ? 'laugh'
    : within(t, S('night'), NIGHT1) ? 'wow'
    : talks('oliver') ? 'happy' : 'smile';
  const headTilt = within(t, LOOKS[0], LOOKS[1]) ? -24 : within(t, LOOKS[1], LOOKS[2]) ? 24 : within(t, LOOKS[2], E('look') + 0.4) ? 8 * Math.sin(t * 6)
    : within(t, HEAD_Q[0], HEAD_Q[1]) ? -24 : within(t, HEAD_Q[1], E('q3') + 0.8) ? 24 : 0;
  const lookDir: [number, number] = within(t, LOOKS[0], LOOKS[1]) || within(t, HEAD_Q[0], HEAD_Q[1]) ? [-1, 0] : within(t, LOOKS[1], LOOKS[2]) || within(t, HEAD_Q[1], E('q3') + 0.8) ? [1, 0] : t < LAND ? [-0.5, 0.3] : [-0.3, 0];
  const landSquash = hopAt(t, [HOP + HOP_AIR - 0.01], { h: 0, air: 0.01, pre: 0.01, land: 0.3 }).squash;
  const holdsBalloon = within(t, GRAB, HANDED);

  // the balloon: in Bella's hand → floats away → stuck → in Oliver's claws → back to Bella
  const balloon: [number, number] | null = (() => {
    if (t < S('story') - 1) return null;
    if (t < FLOAT0) return BELLA_HAND;
    if (t < FLOAT0 + 3.0) {
      const p = EASE_INOUT(prog(t, FLOAT0, FLOAT0 + 3.0));
      return [BELLA_HAND[0] + (STUCK[0] - BELLA_HAND[0]) * p + Math.sin(t * 3) * 30 * (1 - p), BELLA_HAND[1] + (STUCK[1] - BELLA_HAND[1]) * p];
    }
    if (t < GRAB) return STUCK;
    if (t < HANDED) return [ox + 10, oy - 190];
    return BELLA_HAND;
  })();
  const balloonWob = within(t, FLOAT0 + 3.0, GRAB) ? Math.sin(t * 5) * 6 : Math.sin(t * 1.7) * 4;

  // friends
  const bellaSad = within(t, S('balloon'), S('give'));
  const yay = within(t, S('cheer'), E('cheer') + 0.6) || within(t, S('bella_yay'), E('bella_yay') + 0.6) || within(t, S('c1'), E('c3') + 0.4) || t >= S('bye');
  const friendExpr = (who: string): KExpr =>
    yay ? 'laugh' : who === 'bella' && bellaSad ? 'sad' : within(t, HOP, HOP + 1.0) ? 'surprised' : within(t, FLY, S('soar')) ? 'wow' : talks(who) ? 'happy' : 'smile';
  const chantHop = (k: number) => (within(t, S('c1'), E('c3') + 0.4) || within(t, S('cheer'), E('cheer')) ? Math.abs(Math.sin(t * 7 + k)) * 26 : 0);
  const friendsFlap = within(t, FLAP_END, FLAP_END + 4.4);
  const friendArm = (k: number): CArm => (friendsFlap ? { a: 110 + Math.sin(t * 12 + k) * 40 } : yay ? 'up' : 'down');

  const pileS = t >= S('leaves') + 0.1 && t < S('balloon') ? popIn(t, S('leaves') + 0.1) : 0;
  const burst = prog(t, HOP + HOP_AIR, HOP + HOP_AIR + 0.7);

  return (
    <>
      <ActionStage cam={cam} shake={shake} blur={cam.blur}>
        <Forest w={W} h={H} t={t} />
        <TallTree />
        <Oak t={t} night={night} />
        {/* the night sky (tint + moon + stars) */}
        {night > 0 && (
          <g opacity={night}>
            <rect width={W} height={H} fill="#1d2b5c" opacity={0.55} />
            <g transform="translate(1700,150)">
              <circle r={110} fill="#fff3b0" opacity={0.25} />
              <Vol><circle r={72} fill="#fff3b0" {...kst(6)} /></Vol>
            </g>
            {[[200, 110], [520, 70], [820, 140], [1100, 80], [1450, 120], [1850, 300], [320, 330]].map(([x, y], i) => (
              <Twinkle key={i} x={x} y={y} s={0.5 + 0.25 * Math.sin(t * 2 + i)} c="#fff59d" />
            ))}
          </g>
        )}
        {/* the two eyes in the tree hole (the hook) */}
        {t < REVEAL && (
          <g>
            {[-24, 24].map((dx) => {
              const blink = (t * 30) % 70 < 4 ? 0.15 : 1;
              return (
                <g key={dx} transform={`translate(${HOLE[0] + dx},${HOLE[1] - 6}) scale(1,${blink})`}>
                  <circle r={18} fill="#ffffff" {...kst(4)} />
                  <circle cx={2} cy={2} r={10} fill="#3a86ff" />
                  <circle cx={-3} cy={-4} r={4} fill="#ffffff" />
                </g>
              );
            })}
          </g>
        )}
        <LeafPile s={pileS} burst={burst} />
        {/* Bobo + Bella */}
        <Critter spec={BOBO_HERO} x={BOBO_X} y={f} scale={0.62} expr={friendExpr('bobo')} look={[0.6, -0.2]} mouth={lipSync(VO, 'bobo', t)}
          armL={friendArm(0)} armR={within(t, S('leaves'), E('leaves')) ? 'point' : friendsFlap ? friendArm(1) : talks('bobo') ? 'wave' : yay ? 'up' : 'down'}
          hop={chantHop(0)} />
        <Critter spec={BELLA} x={BELLA_X} y={f} scale={0.6} expr={friendExpr('bella')} look={t >= FLOAT0 && t < HANDED ? [-0.6, -0.8] : [0.6, -0.3]} mouth={lipSync(VO, 'bella', t)}
          armL={friendArm(2)} armR={balloon && (t < FLOAT0 || t >= HANDED) ? 'up' : within(t, S('bella_sad'), E('bella_sad')) ? 'up' : friendsFlap ? friendArm(3) : talks('bella') ? 'wave' : 'down'}
          hop={chantHop(1)} squash={bellaSad ? 0.08 : 0} />
        {/* the balloon + its string */}
        {balloon && (
          <g>
            {(t < FLOAT0 || t >= HANDED) && <path d={`M ${balloon[0]},${balloon[1] + 70} Q ${balloon[0] - 20},${balloon[1] + 160} ${BELLA_X + 70},${f - 300}`} fill="none" stroke={KINK} strokeWidth={4} />}
            {holdsBalloon && <path d={`M ${balloon[0]},${balloon[1] + 70} L ${ox + 10},${oy - 90}`} fill="none" stroke={KINK} strokeWidth={4} />}
            {t >= FLOAT0 && t < HANDED && !holdsBalloon && <path d={`M ${balloon[0]},${balloon[1] + 70} q 20,60 -10,120`} fill="none" stroke={KINK} strokeWidth={4} />}
            <g transform={`translate(${balloon[0]},${balloon[1]}) rotate(${balloonWob}) scale(0.9)`}><Balloon c="#ff595e" /></g>
          </g>
        )}
        {/* Oliver */}
        {t >= REVEAL && (
          <Critter spec={OLIVER} x={ox} y={oy} scale={OS} expr={oExpr} look={lookDir} mouth={lipSync(VO, 'oliver', t) + (within(t, S('yawn'), word('yawn', 1)) ? 0.9 : 0)}
            armL={wing} armR={wing} tilt={headTilt} squash={landSquash + (scared ? 0.1 : 0)} shadow={!flying && t >= LAND} blink idle={!flying} />
        )}
        {/* FX */}
        <ImpactStar t={t} at={REVEAL} x={HOLE[0]} y={HOLE[1]} s={0.9} />
        <MotionLines t={t} from={FLY} to={FLY + 4.8} x={ox + 80} y={oy - 140} dir={200} n={3} len={90} spread={30} />
        <MotionLines t={t} from={GIVE0} to={GIVE0 + 1.4} x={ox - 70} y={oy - 140} dir={20} n={3} len={80} spread={30} />
        <Dust t={t} at={HOP + HOP_AIR} x={PILE[0]} y={PILE[1]} s={1.2} />
        <ImpactStar t={t} at={GRAB} x={STUCK[0]} y={STUCK[1]} s={0.6} color="#ff6fa5" />
        <StageWord t={t} at={HOP + HOP_AIR} until={HOP + HOP_AIR + 1.2} text="BOING!" x={PILE[0] + 40} y={PILE[1] - 330} size={100} color="#ffca3a" rot={-8} />
        <StageWord t={t} at={word('step1', 6)} until={E('step1') + 0.5} text="FLAP!" x={HIGH[0] - 170} y={HIGH[1] - 230} size={80} color="#4cc9f0" rot={-10} />
        <StageWord t={t} at={S('flap_do')} until={E('flap_do') + 0.5} text="FLAP! FLAP!" x={HIGH[0] - 40} y={HIGH[1] - 260} size={80} color="#4cc9f0" rot={8} />
        <StageWord t={t} at={word('fly', 4)} until={word('fly', 4) + 1.4} text="WHEEE!" x={900} y={180} size={100} color="#ffca3a" rot={-6} />
        <StageWord t={t} at={word('sound_a', 0)} until={E('sound_a') + 0.5} text="HOO-HOO!" x={HIGH[0] - 40} y={HIGH[1] - 250} size={80} color="#ffca3a" rot={-6} />
        <StageWord t={t} at={word('sound_b', 0)} until={E('sound_b') + 0.6} text="HOO-HOO!" x={HIGH[0] - 40} y={HIGH[1] - 250} size={80} color="#ffca3a" rot={6} />
        <StageWord t={t} at={word('night_o', 0)} until={E('night_o') + 0.6} text="HOO-HOO!" x={1090} y={f - 330} size={70} color="#fff3b0" rot={-6} />
        {/* fact 3: a soft feather drifts down */}
        {within(t, word('fact3', 4), E('wow') + 0.5) && (
          <Feather x={700 + Math.sin(t * 1.4) * 120} y={160 + prog(t, word('fact3', 4), E('wow') + 0.5) * 520} rot={Math.sin(t * 1.6) * 30} s={0.9} />
        )}
        {/* reactions */}
        <Reaction kind="?" t={t} at={E('guess2') + 0.1} until={REVEAL} x={HOLE[0] + 130} y={HOLE[1] - 120} s={0.7} />
        <Reaction kind="sweat" t={t} at={S('problem') + 1.0} until={S('idea')} x={ox - 70} y={oy - 230} s={0.8} />
        <Reaction kind="cloud" t={t} at={S('feel')} until={S('idea')} x={ox} y={oy - 330} s={0.6} />
        <Reaction kind="idea" t={t} at={S('idea')} until={E('idea') + 0.4} x={BELLA_X} y={f - 480} s={0.8} />
        <Reaction kind="sweat" t={t} at={S('ready')} until={S('count')} x={ox - 70} y={oy - 230} s={0.7} />
        <Reaction kind="!" t={t} at={FLOAT0 + 0.2} until={S('help_q')} x={BELLA_X} y={f - 470} s={0.7} />
        <Reaction kind="cloud" t={t} at={S('bella_sad')} until={S('oliver_go')} x={BELLA_X} y={f - 520} s={0.6} />
        <Reaction kind="heart" t={t} at={S('bella_yay')} until={E('bella_yay') + 0.8} x={BELLA_X} y={f - 470} s={0.8} />
        <Reaction kind="heart" t={t} at={S('thanks')} until={E('thanks') + 0.5} x={ox} y={oy - 280} s={0.7} />
        <Reaction kind="stars" t={t} at={HOP + HOP_AIR} until={HOP + HOP_AIR + 1.5} x={PILE[0]} y={PILE[1] - 230} s={0.8} />
        {/* the remember round: 3 step cards */}
        {within(t, S('a4a') - 0.1, S('q5') - 0.3) && (
          <g>
            <g transform="translate(560,300)"><StepCard n={1} label="flap!" c="#ff595e" s={popIn(t, S('a4a'))}><path d="M -70,0 Q -30,-70 0,-10 Q 30,-70 70,0" fill="none" stroke="#c8a27a" strokeWidth={20} strokeLinecap="round" /></StepCard></g>
            <g transform="translate(960,300)"><StepCard n={2} label="hop!" c="#ffca3a" s={popIn(t, S('a4b'))}><path d="M -70,40 Q 0,-110 70,40" fill="none" stroke="#ff924c" strokeWidth={12} strokeDasharray="20 16" strokeLinecap="round" /></StepCard></g>
            <g transform="translate(1360,300)"><StepCard n={3} label="1, 2, 3!" c="#4cc9f0" s={popIn(t, S('a4c'))}><text y={30} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={90} fill="#52b788">123</text></StepCard></g>
          </g>
        )}
      </ActionStage>

      {/* screen-space */}
      <ThinkTimer t={t} from={E('guess2') + 0.1} to={REVEAL - 0.05} x={1760} y={190} r={90} label="WHO?" />
      <PopText t={t} at={REVEAL + 0.15} until={S('hello')} text="AN OWL!" y={170} size={140} color="#ffca3a" />
      <PopText t={t} at={E('sound_turn') - 0.6} until={S('sound_b') - 0.1} text="YOUR TURN!" y={170} size={120} color="#ffffff" />
      <PopText t={t} at={S('facts') + 0.2} until={S('fact1') - 0.1} text="3 OWL FACTS!" y={170} size={120} color="#ffca3a" />
      <PopText t={t} at={S('fact1')} until={S('fact2') - 0.2} text="1  AWAKE AT NIGHT" y={170} size={90} color="#b388ff" />
      <PopText t={t} at={S('fact2')} until={S('fact3') - 0.2} text="2  HEAD TURNS FAR" y={170} size={90} color="#4cc9f0" />
      <PopText t={t} at={S('fact3')} until={E('wow') + 0.3} text="3  QUIET FLYING" y={170} size={90} color="#52b788" />
      <PopText t={t} at={S('feel') + 0.4} until={S('ask') - 0.1} text="SCARED" y={170} size={120} color="#a0c4ff" />
      <ThinkTimer t={t} from={E('ask') + 0.1} to={S('idea') - 0.1} x={1760} y={190} r={90} label="HOW?" />
      <PopText t={t} at={word('idea', 2)} until={E('idea') + 0.6} text="FRIENDS HELP FRIENDS!" y={170} size={100} color="#ff6fa5" />
      <PopText t={t} at={S('step1')} until={S('flap_turn') - 0.1} text="STEP 1: FLAP!" y={170} size={110} color="#ff595e" />
      <PopText t={t} at={E('flap_turn') - 0.6} until={S('flap_do') - 0.1} text="YOUR TURN!" y={170} size={120} color="#ffffff" />
      <PopText t={t} at={S('step2')} until={S('hop') - 0.1} text="STEP 2: HOP!" y={170} size={110} color="#ffca3a" />
      <PopText t={t} at={S('step3')} until={S('ready') - 0.1} text="STEP 3: 1, 2, 3, FLY!" y={170} size={100} color="#4cc9f0" />
      {NUMS.map((n, i) => (
        <PopText key={i} t={t} at={n - 0.05} until={i < 2 ? NUMS[i + 1] - 0.05 : FLY + 0.2} text={String(i + 1)} y={170} size={180} color={['#ff595e', '#ffca3a', '#4cc9f0'][i]} />
      ))}
      <PopText t={t} at={FLY + 0.2} until={S('soar')} text="HE CAN FLY!" y={170} size={120} color="#ffca3a" />
      <ThinkTimer t={t} from={E('help_q') + 0.1} to={S('oliver_go') - 0.1} x={1760} y={190} r={90} label="WHO?" />
      <PopText t={t} at={S('lesson')} until={NIGHT0} text="FRIENDS HELP FRIENDS!" y={170} size={100} color="#ff6fa5" />
      <PopText t={t} at={S('again') + 0.2} until={S('q1') - 0.1} text="LET'S REMEMBER!" y={170} size={110} color="#ffca3a" />
      {(['q1', 'q2', 'q3', 'q4', 'q5'] as const).map((q) => {
        const a = ({ q1: 'a1', q2: 'a2', q3: 'a3', q4: 'a4a', q5: 'a5' } as const)[q];
        const from = onBeat(E(q) + 0.1);
        return <ThinkTimer key={q} t={t} from={from} to={S(a) - 0.1} x={1760} y={190} r={90} label="THINK!" />;
      })}
      <PopText t={t} at={S('a1')} until={S('q2') - 0.2} text="AT NIGHT!" y={170} size={120} color="#b388ff" />
      <PopText t={t} at={S('a2')} until={S('q3') - 0.2} text="SOFT FEATHERS!" y={170} size={110} color="#52b788" />
      <PopText t={t} at={S('a5')} until={S('chant') - 0.2} text="OLIVER!" y={170} size={140} color="#ffca3a" />
      <PopText t={t} at={S('c1')} until={S('c_turn') - 0.1} text="FRIENDS HELP FRIENDS!" y={170} size={100} color="#ff6fa5" />
      <PopText t={t} at={E('c_turn') + 0.1} until={S('c2') - 0.1} text="YOUR TURN!" y={170} size={120} color="#ffffff" />
      <PopText t={t} at={S('c3')} until={S('flap_end') - 0.2} text="FRIENDS HELP FRIENDS!" y={170} size={100} color="#52b788" />
      <PopText t={t} at={S('bye')} until={END_IRIS} text="SEE YOU NEXT TIME!" y={170} size={100} color="#ffca3a" />
      <Confetti t={t} at={S('cheer')} y={420} />
      <Confetti t={t} at={S('bella_yay')} y={420} />
      <Confetti t={t} at={S('c3')} y={420} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <SparksIntro t={t} at={0} cast={{ kids: [MILA_HERO, LEO_HERO], buddy: BOBO_HERO }} />
      <StarWipe t={t} at={END_IRIS} dur={0.5} hold={5} color="#3b2a4a" x={W / 2} y={H * 0.45} />
    </>
  );
}
