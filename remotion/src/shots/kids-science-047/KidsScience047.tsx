// TINY SPARKS · Day 47 · 🚀 Science for Kids #7 — "How Does Rain Form?" (LONG 16:9, 5:05)
// kids-shorts/tiny-sparks/science/day-047-how-does-rain-form. Cues from VO via K (keys.gen.ts).
// ENERGY LAYER standard: ident → WHY? (Mila under her umbrella on the rainy street) → GUESS (Leo: a giant with a big
// watering can! — Hoot: good guess, but rain comes from the clouds) → MODEL = Drippy the raindrop's journey on a
// cross-section (sea · sky · cloud · hill · river), in 3 questions: 1 how does water get up? (the warm sun, it floats
// up invisible, high up it is cold → a tiny drop → many drops = a cloud) · 2 why does rain fall? (drops BUMP and join →
// bigger → big and heavy → they fall) · 3 where does rain go? (the hill, plants drink, the river, back to the sea) →
// the ONE word: WATER CYCLE (your turn) → SEE IT in Hoot's lab with a grown-up: rain in a jar (warm water, a plate
// with ice → drops under the plate grow and drip) → WOW: raindrops aren't pointy — small ones are round, big ones look
// like a tiny bun → the sun comes out: a rainbow (sunlight through raindrops) → LET'S REMEMBER (6 questions, think
// timers) → chant "Up, up, up! Cloud! Rain! And round again!" → bye + star iris.
// Facts: water cycle (NASA Climate Kids / Met Office) · raindrop shape: small drops are spheres, large ones flatten into
// a "hamburger bun" (USGS Water Science School) · rainbows = sunlight refracted in raindrops (Met Office).
import React from 'react';
import { Kid, kidFaceAt, type KArm } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, HOOT_HERO, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Rainbow, Sun } from '../../lib/kids/sets';
import { Backdrop } from '../../lib/kids/places';
import { AnswerMark, Bubble, Confetti, FONT_TOON, KidsCaptions, PopText, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { Face, KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import {
  ActionStage, Dust, ImpactStar, MotionLines, Reaction, SparksIntro, StageWord, StarWipe, directorCam, onBeat, shakeOf,
  type Hit, type Shot,
} from '../../lib/kids/energy';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsScience047', durationInSeconds: 305.0, fps: 30, width: 1920, height: 1080 };

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
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff', drippy: '#4cc9f0' };
type KF = [number, number, number][];
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
const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (EASE_OUT(p) - 1) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};
const pulse = (t: number, at: number, d = 0.35) => (t < at || t > at + d ? 0 : Math.sin(((t - at) / d) * Math.PI));

// ── scenes
const MODEL0 = S('q1') - 0.3;
const CAST0 = S('cycle_turn') - 0.3;
const LAB0 = S('see') - 0.3;
const MEADOW0 = S('rainbow_q') - 0.3;
type Scene = 'street' | 'model' | 'lab' | 'meadow';
const sceneAt = (t: number): Scene => (t < MODEL0 ? 'street' : t < CAST0 ? 'model' : t < LAB0 ? 'street' : t < MEADOW0 ? 'lab' : 'meadow');

// ── the model (cross-section)
const SEA_Y = 790;
const CLOUD: [number, number] = [1000, 230];
const HILL_TOP: [number, number] = [1500, 520];
const LANDING: [number, number] = [1330, 600];
const RIVER: [number, number][] = [[1330, 600], [1230, 660], [1110, 690], [1000, 740], [880, 790]];
const UP0 = word('up', 4); // "float up"
const GONE = word('up', 10); // "can't see me now"
const BRRR = word('cold', 6);
const GATHER = S('cloud') + 0.3;
const BUMPS = [word('bigger', 0), word('bigger', 4), word('bigger', 6)];
const GROWS = [word('bigger', 3), word('bigger', 5), word('bigger', 7)];
const BUMP_T = word('bump_turn', 4);
const FALL = word('fall', 4) - 0.1; // "go!"
const SPLASH = word('land', 0);
const SLIDE0 = word('land', 9); // "slide down"
const AGAIN_UP = word('again', 10); // "up, up, up"
const DRIPPY_PATH: KF = [
  [0, 450, SEA_Y], [UP0, 450, SEA_Y], [UP0 + 2.4, 700, 330], [BRRR, 700, 330], [GATHER, 700, 330], [GATHER + 1.6, CLOUD[0], CLOUD[1] + 70],
  [FALL, CLOUD[0], CLOUD[1] + 70], [FALL + 1.2, LANDING[0], LANDING[1]],
  [SLIDE0, LANDING[0], LANDING[1]], [SLIDE0 + 0.8, RIVER[1][0], RIVER[1][1]], [SLIDE0 + 1.6, RIVER[2][0], RIVER[2][1]],
  [S('river') + 0.6, RIVER[3][0], RIVER[3][1]], [S('river') + 1.6, RIVER[4][0], RIVER[4][1]], [E('river') + 0.4, 560, SEA_Y],
  [AGAIN_UP, 560, SEA_Y], [AGAIN_UP + 1.8, 640, 460], [E('again') + 0.6, 560, SEA_Y],
];

// ── the lab (rain in a jar)
const JAR: [number, number] = [960, 640]; // the jar's bottom centre (on the table)
const JAR_H = 240;
const POUR = word('j1', 4);
const PLATE = word('j2', 4);
const ICE = word('j2', 9);
const DROPS0 = word('j4', 1);
const DRIP = word('j4', 10);
const JAR_OUT = S('fact_q') - 0.4;

// ── the cast positions per scene
const ST = { mila: 560, leo: 860, hoot: 1360, drippy: 1100 }; // street
const LB = { mila: 450, hoot: 1430, leo: 1720 }; // lab
const MD = { mila: 520, leo: 800, drippy: 1080, hoot: 1360 }; // meadow
const KS = 0.6;
const HS = 0.55;
const face = (x: number) => kidFaceAt(x, f, KS);

// ── director camera
const SHOTS: Shot[] = [
  { t: 0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.01 },
  { t: S('why') - 0.2, z: 1.6, x: ST.mila, y: face(ST.mila)[1] + 60, move: 'smooth', dur: 1.0, push: 0.02 },
  { t: S('guess') - 0.2, z: 1.3, x: ST.leo + 40, y: 420, move: 'whip' },
  { t: S('good') - 0.2, z: 1.55, x: ST.hoot, y: f - 260, move: 'whip', push: 0.01 },
  { t: S('how') - 0.2, z: 1.6, x: ST.leo, y: face(ST.leo)[1] + 60, move: 'whip' },
  { t: S('meet') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.7 },
  { t: S('drippy_hi') - 0.1, z: 1.7, x: ST.drippy, y: f - 140, move: 'snap', push: 0.02 },
  { t: MODEL0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.01 },
  { t: S('sun') - 0.2, z: 1.5, x: 450, y: SEA_Y - 120, move: 'smooth', dur: 0.8, push: 0.02 },
  { t: UP0 + 0.2, z: 1.2, x: 640, y: 480, move: 'smooth', dur: 2.0 },
  { t: S('up_turn') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('cold') - 0.2, z: 1.5, x: 700, y: 360, move: 'smooth', dur: 0.8 },
  { t: S('cloud') - 0.2, z: 1.2, x: 860, y: 360, move: 'smooth', dur: 1.0, push: 0.02 },
  { t: S('q2') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('bump') - 0.2, z: 1.55, x: CLOUD[0], y: CLOUD[1] + 80, move: 'smooth', dur: 0.9, push: 0.01 },
  { t: S('heavy') - 0.2, z: 1.3, x: CLOUD[0], y: CLOUD[1] + 130, move: 'smooth', dur: 0.6 },
  { t: FALL - 0.05, z: 1.0, x: 1100, y: 460, move: 'smooth', dur: 1.0 },
  { t: S('q3') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('land') - 0.2, z: 1.45, x: LANDING[0], y: LANDING[1] - 60, move: 'snap' },
  { t: S('plants') - 0.2, z: 1.3, x: 1250, y: 560, move: 'smooth', dur: 0.8 },
  { t: S('river') - 0.2, z: 1.2, x: 900, y: 650, move: 'smooth', dur: 1.2, push: 0.02 },
  { t: S('again') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8, push: 0.01 },
  { t: CAST0, z: 1.0, x: 960, y: 540, move: 'cut' },
  { t: S('cycle_turn') + 0.1, z: 1.6, x: ST.mila, y: face(ST.mila)[1] + 60, move: 'smooth', dur: 0.6 },
  { t: S('leo_wow') - 0.2, z: 1.6, x: ST.leo, y: face(ST.leo)[1] + 60, move: 'whip' },
  { t: S('hoot_yes') - 0.2, z: 1.55, x: ST.hoot, y: f - 260, move: 'whip', push: 0.01 },
  { t: LAB0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.01 },
  { t: S('j1') - 0.2, z: 1.35, x: JAR[0], y: JAR[1] - 160, move: 'smooth', dur: 0.8, push: 0.02 },
  { t: S('j4') - 0.2, z: 1.6, x: JAR[0], y: JAR[1] - 190, move: 'smooth', dur: 0.8, push: 0.01 },
  { t: S('mila_yay') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('fact_q') - 0.2, z: 1.55, x: LB.leo - 60, y: face(LB.leo)[1] + 80, move: 'whip' },
  { t: S('fact_a') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('leo_bun') - 0.2, z: 1.6, x: LB.leo - 40, y: face(LB.leo)[1] + 60, move: 'whip' },
  { t: MEADOW0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.01 },
  { t: S('thanks') - 0.2, z: 1.55, x: MD.leo, y: face(MD.leo)[1] + 60, move: 'snap' },
  { t: S('rem') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('ra1') - 0.1, z: 1.5, x: MD.leo, y: face(MD.leo)[1] + 60, move: 'snap' },
  { t: E('ra1') + 0.6, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('ra4') - 0.1, z: 1.6, x: MD.drippy, y: f - 160, move: 'snap' },
  { t: E('ra4') + 0.6, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('ra6') - 0.1, z: 1.5, x: MD.leo, y: face(MD.leo)[1] + 60, move: 'snap' },
  { t: E('ra6') + 0.6, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('ch1') - 0.1, z: 1.2, x: 940, y: 560, move: 'smooth', dur: 0.6, push: 0.02 },
  { t: S('ch_turn') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
];
const PUNCHES = [S('drippy_hi'), GATHER + 1.7, ...BUMPS, BUMP_T, SPLASH, DRIP, word('fact_b', 9), S('ra1'), S('ra4')];
const HITS: Hit[] = [{ at: SPLASH, amp: 8, dur: 0.3 }];

// ── drawing helpers
const Drippy: React.FC<{ x: number; y: number; s: number; expr: KExpr; mouth?: number; faint?: number; t: number; squash?: number; look?: [number, number] }> = ({
  x, y, s, expr, mouth = 0, faint = 0, t, squash = 0, look = [0, 0.1],
}) => {
  const blink = (t * 30) % 96 < 4;
  return (
    <g transform={`translate(${x},${y}) scale(${s * (1 + squash * 0.12)},${s * (1 - squash * 0.16)})`} opacity={1 - faint * 0.75}>
      <ellipse cx={0} cy={6} rx={92} ry={16} fill="#3b2a4a" opacity={0.15 * (1 - faint)} />
      {faint > 0.5 ? (
        <path d="M 0,-270 C 40,-200 110,-140 110,-90 A 110,110 0 0 1 -110,-90 C -110,-140 -40,-200 0,-270 Z" fill="none" stroke="#ffffff" strokeWidth={10} strokeDasharray="4 22" strokeLinecap="round" />
      ) : (
        <>
          <Vol>
            <path d="M 0,-270 C 40,-200 110,-140 110,-90 A 110,110 0 0 1 -110,-90 C -110,-140 -40,-200 0,-270 Z" fill="#4cc9f0" {...kst(8)} />
          </Vol>
          <ellipse cx={-50} cy={-150} rx={16} ry={30} fill="#ffffff" opacity={0.6} transform="rotate(25 -50 -150)" />
          <g transform="translate(0,-92) scale(0.62)">
            <Face expr={expr} look={look} mouth={mouth} blink={blink} skin="#4cc9f0" iris="#1b4f8a" eyeR={42} eyeDX={62} eyeY={-10} mouthY={70} mouthW={44} brows={false} nose={<g />} />
          </g>
        </>
      )}
    </g>
  );
};
const MiniDrop: React.FC<{ s?: number; c?: string }> = ({ s = 1, c = '#4cc9f0' }) => (
  <g transform={`scale(${s})`}>
    <path d="M 0,-30 C 12,-10 20,4 20,14 A 20,20 0 0 1 -20,14 C -20,4 -12,-10 0,-30 Z" fill={c} {...kst(5)} />
    <ellipse cx={-6} cy={8} rx={5} ry={8} fill="#ffffff" opacity={0.7} />
  </g>
);
const Cloud: React.FC<{ s?: number; grey?: number; t: number; expr?: 'happy' | 'wow' }> = ({ s = 1, grey = 0, t, expr = 'happy' }) => {
  const c = `rgb(${255 - grey * 80},${255 - grey * 70},${255 - grey * 45})`;
  return (
    <g transform={`scale(${s})`}>
      <Vol>
        <path d="M -260,70 Q -320,70 -320,10 Q -320,-60 -240,-66 Q -228,-160 -120,-160 Q -70,-230 24,-208 Q 108,-240 166,-160 Q 270,-170 282,-70 Q 340,-46 330,24 Q 318,70 260,70 Z" fill={c} {...kst(9)} />
      </Vol>
      <g transform="translate(0,-60)">
        {[-56, 56].map((x) => (expr === 'happy'
          ? <path key={x} d={`M ${x - 16},6 Q ${x},-14 ${x + 16},6`} fill="none" {...kst(7)} />
          : <circle key={x} cx={x} cy={0} r={12} fill={KINK} />))}
        <path d={`M -26,30 Q 0,${54 + Math.sin(t * 3) * 4} 26,30`} fill="#ff7aa2" {...kst(6)} />
      </g>
    </g>
  );
};
const Umbrella: React.FC<{ c: string; c2: string }> = ({ c, c2 }) => (
  <g>
    <rect x={-7} y={-560} width={14} height={600} rx={7} fill="#8d6e63" {...kst(5)} />
    <path d="M 7,40 q 0,40 -30,40 q -24,0 -24,-24" fill="none" stroke="#8d6e63" strokeWidth={14} strokeLinecap="round" />
    <Vol>
      <path d="M -330,-520 Q -300,-800 0,-820 Q 300,-800 330,-520 Q 280,-560 220,-520 Q 165,-560 110,-520 Q 55,-560 0,-520 Q -55,-560 -110,-520 Q -165,-560 -220,-520 Q -280,-560 -330,-520 Z" fill={c} {...kst(9)} />
    </Vol>
    <path d="M 0,-820 Q -110,-700 -110,-520 M 0,-820 Q 110,-700 110,-520" fill="none" stroke={c2} strokeWidth={8} opacity={0.7} />
    <circle cx={0} cy={-830} r={16} fill={c2} {...kst(5)} />
  </g>
);
const WateringCan: React.FC = () => (
  <g>
    <Vol>
      <rect x={-90} y={-60} width={170} height={130} rx={30} fill="#8ac926" {...kst(7)} />
      <path d="M 70,-20 L 170,-110 L 190,-90 L 90,10 Z" fill="#8ac926" {...kst(6)} />
    </Vol>
    <path d="M -80,-60 Q -20,-140 60,-60" fill="none" stroke={KINK} strokeWidth={12} />
    <ellipse cx={182} cy={-102} rx={22} ry={12} transform="rotate(-45 182 -102)" fill="#5a9e1c" {...kst(5)} />
    {[0, 1, 2].map((i) => <g key={i} transform={`translate(${200 + i * 18},${-60 + i * 40})`}><MiniDrop s={0.6} /></g>)}
  </g>
);
const Rain: React.FC<{ t: number; n?: number; o?: number; box?: [number, number, number, number] }> = ({ t, n = 40, o = 0.6, box = [0, 0, W, H] }) => (
  <g opacity={o}>
    {Array.from({ length: n }).map((_, i) => {
      const [x0, y0, x1, y1] = box;
      const p = (t * (0.9 + (i % 5) * 0.08) + (i * 0.137) % 1) % 1;
      const x = x0 + ((i * 97) % (x1 - x0));
      const y = y0 + p * (y1 - y0);
      return <path key={i} d={`M ${x},${y} l -6,26`} stroke="#ffffff" strokeWidth={5} strokeLinecap="round" />;
    })}
  </g>
);
const ModelSet: React.FC<{ t: number; cold: number; grow: number }> = ({ t, cold, grow }) => (
  <g>
    <defs>
      <linearGradient id="d47sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6fb6f2" />
        <stop offset="0.7" stopColor="#c9ecff" />
        <stop offset="1" stopColor="#fff4d6" />
      </linearGradient>
      <linearGradient id="d47cold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.75" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#d47sky)" />
    <rect width={W} height={420} fill="url(#d47cold)" opacity={cold} />
    {cold > 0 && [[160, 90], [480, 60], [1300, 80], [1660, 140], [880, 110]].map(([x, y], i) => (
      <g key={i} opacity={cold} transform={`translate(${x},${y}) rotate(${t * 20 + i * 30})`}>
        {[0, 60, 120].map((a) => <path key={a} d="M 0,-20 L 0,20" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" transform={`rotate(${a})`} />)}
      </g>
    ))}
    <Sun x={230} y={180} r={92} t={t} />
    {/* the sea */}
    <Vol kind="slope"><rect x={0} y={SEA_Y} width={1000} height={H - SEA_Y} fill="#1d9bf0" /></Vol>
    {Array.from({ length: 5 }).map((_, i) => (
      <path key={i} d={`M ${-30 + i * 190 + Math.sin(t * 1.2 + i) * 20},${SEA_Y + 60 + (i % 3) * 60} q 40,-24 80,0 q 40,24 80,0`} fill="none" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.7} />
    ))}
    <path d={`M 0,${SEA_Y} ${Array.from({ length: 11 }).map((_, i) => `Q ${i * 90 + 45},${SEA_Y - 14 + Math.sin(t * 2 + i) * 6} ${(i + 1) * 90},${SEA_Y}`).join(' ')}`} fill="none" {...kst(8)} />
    {/* the hill + the river */}
    <Vol kind="slope">
      <path d={`M 860,${H + 20} L 860,${SEA_Y + 20} Q 1100,700 ${HILL_TOP[0] - 120},${HILL_TOP[1] + 20} Q ${HILL_TOP[0]},${HILL_TOP[1] - 30} ${HILL_TOP[0] + 140},${HILL_TOP[1] + 30} Q 1800,590 ${W + 20},560 L ${W + 20},${H + 20} Z`} fill="#8ac926" {...kst(8)} />
    </Vol>
    <path d={`M ${HILL_TOP[0] - 40},${HILL_TOP[1] + 30} Q 1400,560 ${RIVER[0][0]},${RIVER[0][1]} ` + RIVER.slice(1).map(([x, y]) => `L ${x},${y}`).join(' ')} fill="none" stroke="#4cc9f0" strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
    <path d={`M ${HILL_TOP[0] - 40},${HILL_TOP[1] + 30} Q 1400,560 ${RIVER[0][0]},${RIVER[0][1]} ` + RIVER.slice(1).map(([x, y]) => `L ${x},${y}`).join(' ')} fill="none" stroke="#ffffff" strokeWidth={6} strokeDasharray="20 30" strokeDashoffset={-t * 60} opacity={0.7} />
    {/* trees + flowers on the hill (they grow when the rain gives them a drink) */}
    {[[1620, 560, 1], [1760, 590, 0.85]].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x},${y}) scale(${s * (0.9 + grow * 0.15)})`}>
        <Vol kind="tube"><rect x={-14} y={-120} width={28} height={124} rx={12} fill="#a0673c" {...kst(5)} /></Vol>
        <Vol><circle cx={0} cy={-160} r={80} fill="#52b788" {...kst(6)} /></Vol>
      </g>
    ))}
    {[[1180, 690, '#ff6fa5'], [1260, 650, '#ffca3a'], [1420, 590, '#b388ff'], [1080, 735, '#ff924c']].map(([x, y, c], i) => (
      <g key={i} transform={`translate(${x},${y}) scale(${0.55 + grow * 0.45})`}>
        <path d="M 0,0 L 0,-60" stroke="#3a8d3a" strokeWidth={8} strokeLinecap="round" />
        <Vol>
          {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 18} cy={-70 + Math.sin((a * Math.PI) / 180) * 18} r={14} fill={c as string} {...kst(4)} />)}
          <circle cx={0} cy={-70} r={11} fill="#ffd166" {...kst(4)} />
        </Vol>
      </g>
    ))}
  </g>
);
const ShapeCard: React.FC<{ s: number; label: string; children: React.ReactNode }> = ({ s, label, children }) =>
  s <= 0 ? null : (
    <g transform={`scale(${s})`}>
      <rect x={-170} y={-180} width={340} height={360} rx={40} fill="#ffffff" {...kst(8)} />
      <g transform="translate(0,-20)">{children}</g>
      <text y={140} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={46} fill={KINK}>{label}</text>
    </g>
  );

export default function KidsScience047() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const shake = shakeOf(t, HITS);
  const scene = sceneAt(t);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const yay = within(t, S('mila_yay'), E('mila_yay') + 0.6) || within(t, S('ch1'), E('ch4') + 0.5) || t >= S('bye_d');
  const hopOf = (k: number) => (yay ? Math.abs(Math.sin(t * 7 + k)) * 24 : 0);

  // ── expressions
  const milaExpr: KExpr = within(t, S('why'), E('why')) ? 'wow' : within(t, S('rainbow_q'), E('rainbow_q') + 0.5) ? 'wow' : yay ? 'laugh' : talks('mila') ? 'happy' : 'smile';
  const leoExpr: KExpr =
    within(t, S('guess'), E('guess')) ? 'laugh' : within(t, S('how'), E('how')) ? 'think' : within(t, S('leo_wow'), E('leo_wow')) ? 'wow'
    : within(t, S('fact_q'), E('fact_q')) ? 'think' : within(t, S('fact_b'), E('leo_bun') + 0.6) ? 'laugh' : yay ? 'laugh' : talks('leo') ? 'happy' : 'smile';
  const hootExpr: KExpr = within(t, S('fact_b'), E('fact_b')) ? 'wow' : talks('hoot') ? 'happy' : yay ? 'laugh' : 'smile';
  const drExpr: KExpr =
    within(t, BRRR, E('cold')) ? 'surprised' : within(t, S('heavy'), FALL) ? 'oops' : within(t, FALL, SPLASH + 0.6) ? 'laugh'
    : within(t, BUMPS[0], E('bump_turn') + 0.3) ? 'laugh' : within(t, S('sun'), E('sun')) ? 'happy' : yay ? 'laugh' : talks('drippy') ? 'happy' : 'smile';
  const drMouth = lipSync(VO, 'drippy', t);

  // ── Drippy in the model
  const [dx, dy] = lerp2(t, DRIPPY_PATH);
  const grownS = within(t, BUMPS[0], SPLASH + 0.4) ? 0.32 + GROWS.reduce((a, g) => a + (t >= g ? 0.1 : 0), 0) : 0.32;
  const dS = t < UP0 ? 0.42 : t < BRRR ? 0.42 : grownS;
  const faint = within(t, GONE - 0.4, BRRR) ? prog(t, GONE - 0.4, GONE) : within(t, AGAIN_UP + 0.6, E('again') + 0.2) ? 0.7 : 0;
  const bob = t < UP0 || within(t, E('river') + 0.4, AGAIN_UP) ? Math.sin(t * 2.5) * 8 : within(t, GATHER + 1.6, FALL) ? Math.sin(t * 1.6) * 6 : 0;
  const bumpSq = Math.max(...BUMPS.map((b) => pulse(t, b, 0.3)), pulse(t, BUMP_T, 0.3), pulse(t, word('bump_turn', 5), 0.3));
  const heavySq = within(t, S('heavy'), FALL) ? 0.25 + Math.sin(t * 8) * 0.08 : 0;
  const cold = scene === 'model' ? prog(t, S('cold'), S('cold') + 1.0) * (1 - prog(t, S('q2'), S('q2') + 1.0)) : 0;
  const cloudS = t < GATHER ? 0 : EASE_OUT(prog(t, GATHER + 0.4, GATHER + 1.8));
  const grey = prog(t, S('heavy'), S('heavy') + 1.0) * (1 - prog(t, S('again'), S('again') + 1.0));
  const raining = within(t, FALL, S('again'));
  const grow = prog(t, word('plants', 5), word('plants', 9) + 0.6);

  // the lab jar state
  const water = prog(t, POUR, POUR + 2.2);
  const plateIn = popIn(t, PLATE);
  const jarOn = t < JAR_OUT + 0.3;
  const jarS = jarOn ? 1 - prog(t, JAR_OUT, JAR_OUT + 0.3) : 0;

  const mArm = (): KArm => (within(t, S('why'), E('why')) ? 'point' : within(t, S('cycle_turn'), E('cycle_turn')) ? 'present' : within(t, S('rainbow_q'), E('rainbow_q')) ? 'point' : yay ? 'up' : talks('mila') ? 'present' : 'down');
  const lArm = (): KArm => (within(t, S('guess'), E('guess')) ? 'up' : within(t, S('how'), E('how')) ? 'shrug' : within(t, S('fact_q'), E('fact_q')) ? 'point' : yay || within(t, S('leo_wow'), E('leo_wow')) ? 'up' : talks('leo') ? 'present' : 'down');

  return (
    <>
      <ActionStage cam={cam} shake={shake} blur={cam.blur}>
        {/* ── STREET (rain) ── */}
        {scene === 'street' && (
          <g>
            <Backdrop place="rainy-street" w={W} h={H} t={t} />
            <Kid spec={MILA_HERO} x={ST.mila} y={f} scale={KS} expr={milaExpr} look={within(t, S('why'), E('why')) ? [0.2, -0.9] : [0.5, -0.2]} mouth={lipSync(VO, 'mila', t)}
              armL="hold" holdL={<Umbrella c="#ff6fa5" c2="#ffb3c6" />} armR={mArm()} hop={hopOf(0)} />
            <Kid spec={LEO_HERO} x={ST.leo} y={f} scale={KS} expr={leoExpr} look={[-0.2, -0.3]} mouth={lipSync(VO, 'leo', t)}
              armR="hold" holdR={<Umbrella c="#ffca3a" c2="#fff3b0" />} armL={lArm()} hop={hopOf(1)} />
            <Critter spec={HOOT_HERO} x={ST.hoot} y={f} scale={HS} expr={hootExpr} look={[-0.5, -0.3]} mouth={lipSync(VO, 'hoot', t)}
              armL={talks('hoot') ? 'point' : 'down'} armR={within(t, S('hoot_yes'), E('hoot_yes')) ? 'up' : 'down'} facing={-1} />
            {t >= word('meet', 8) && t < MODEL0 && (
              <Drippy x={ST.drippy} y={f + 10 - Math.abs(Math.sin((t - word('meet', 8)) * 6)) * 40 * (1 - prog(t, word('meet', 8), word('meet', 8) + 1.5))} s={0.55 * popIn(t, word('meet', 8))} expr={talks('drippy') ? 'happy' : 'laugh'} mouth={drMouth} t={t} />
            )}
            {/* Leo's wrong guess: a giant's watering can */}
            {within(t, word('guess', 3), word('good', 9)) && (
              <g transform={`translate(${ST.leo + 120},${f - 760}) scale(${popIn(t, word('guess', 3))})`}>
                <Bubble x={0} y={0} w={440} h={300} tx={-60} ty={250}>
                  <g transform="translate(-30,10) scale(0.9)"><WateringCan /></g>
                </Bubble>
              </g>
            )}
            <Rain t={t} n={50} o={0.55} />
            <Reaction kind="?" t={t} at={S('how')} until={E('how') + 0.4} x={ST.leo} y={f - 640} s={0.7} />
            <Reaction kind="idea" t={t} at={S('leo_wow')} until={E('leo_wow') + 0.3} x={ST.leo} y={f - 640} s={0.7} />
            <ImpactStar t={t} at={word('meet', 8)} x={ST.drippy} y={f - 100} s={0.6} color="#4cc9f0" />
          </g>
        )}

        {/* ── MODEL (Drippy's journey) ── */}
        {scene === 'model' && (
          <g>
            <ModelSet t={t} cold={cold} grow={grow} />
            {/* sun rays onto the sea */}
            {within(t, word('sun', 7), GONE) && [0, 1, 2].map((i) => {
              const p = (t * 0.8 + i / 3) % 1;
              return <path key={i} d={`M ${300 + p * 120},${260 + p * 460} l 20,40`} stroke="#ffca3a" strokeWidth={14} strokeLinecap="round" opacity={1 - p} />;
            })}
            {/* invisible water going up */}
            {within(t, UP0 - 0.2, BRRR + 0.5) && Array.from({ length: 6 }).map((_, i) => {
              const p = (t * 0.35 + i / 6) % 1;
              const x = 260 + i * 90 + Math.sin(t * 2 + i) * 20;
              return <path key={i} d={`M ${x},${SEA_Y - 20 - p * 420} q 20,-30 0,-60 q -20,-30 0,-60`} fill="none" stroke="#ffffff" strokeWidth={10} strokeLinecap="round" strokeDasharray="2 22" opacity={0.6 * Math.sin(p * Math.PI)} />;
            })}
            {(within(t, S('up_turn'), E('up_turn') + 1.5) || within(t, AGAIN_UP, AGAIN_UP + 2.5)) && [0, 1, 2].map((i) => (
              <path key={i} d={`M ${380 + i * 140},${SEA_Y - 110} l 0,-160 m -26,30 l 26,-30 l 26,30`} fill="none" stroke="#ffffff" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round"
                opacity={0.9 * Math.min(1, prog(t, (t < AGAIN_UP ? S('up_turn') : AGAIN_UP) + i * 0.25, (t < AGAIN_UP ? S('up_turn') : AGAIN_UP) + 0.4 + i * 0.25))} />
            ))}
            {/* many tiny drops gather into the cloud */}
            {t >= word('cloud', 3) && Array.from({ length: 20 }).map((_, i) => {
              const sx = 520 + ((i * 137) % 900);
              const sy = 120 + ((i * 89) % 260);
              const g = EASE_INOUT(prog(t, GATHER + (i % 6) * 0.1, GATHER + 1.3 + (i % 6) * 0.1));
              const x = sx + (CLOUD[0] - sx) * g;
              const y = sy + (CLOUD[1] - sy) * g;
              const s = popIn(t, word('cloud', 3) + (i % 8) * 0.06) * (1 - g * 0.6) * 0.7;
              return g < 1 ? <g key={i} transform={`translate(${x},${y})`}><MiniDrop s={s} /></g> : null;
            })}
            {cloudS > 0 && (
              <g transform={`translate(${CLOUD[0]},${CLOUD[1] + Math.sin(t * 1.5) * 6})`}>
                <Cloud s={0.9 * cloudS} t={t} grey={grey} expr={raining ? 'wow' : 'happy'} />
              </g>
            )}
            {/* the bumping drops (question two) */}
            {within(t, S('bump'), FALL) && [-1, 1].map((k) => {
              const all = [...BUMPS, BUMP_T];
              const next = all.find((b) => b > t - 0.05) ?? all[all.length - 1];
              const near = Math.max(0, 1 - Math.abs(next - t) / 0.9);
              return (
                <g key={k} transform={`translate(${dx + k * (200 - near * 120)},${dy - 80 + Math.sin(t * 3 + k) * 10})`}>
                  <MiniDrop s={0.9} />
                </g>
              );
            })}
            {/* rain from the cloud */}
            {raining && Array.from({ length: 18 }).map((_, i) => {
              const p = ((t - FALL) * 1.0 + i / 18) % 1;
              const x0 = CLOUD[0] - 260 + (i % 9) * 65;
              return <g key={i} transform={`translate(${x0 + p * 40},${CLOUD[1] + 80 + p * 520})`} opacity={within(t, S('plants'), S('again')) ? 0.6 : 0.9}><MiniDrop s={0.55} /></g>;
            })}
            {/* the water cycle loop (drawn on during "cycle") */}
            {within(t, S('cycle'), CAST0) && (() => {
              const stations: [number, number, string, number][] = [
                [470, 560, 'UP!', word('cycle', 0)], [CLOUD[0], CLOUD[1] - 180, 'CLOUD', word('cycle', 1)],
                [1450, 420, 'RAIN', word('cycle', 2)], [700, 850, 'BACK TO THE SEA', word('cycle', 4)],
              ];
              const loopP = prog(t, word('cycle', 0), word('cycle', 7));
              return (
                <g>
                  <path d={`M 470,700 Q 420,360 760,230 Q 1000,120 1260,240 Q 1520,380 1300,620 Q 1100,820 700,840 Q 480,840 470,700`} fill="none" stroke="#ffca3a" strokeWidth={16}
                    strokeDasharray="3000" strokeDashoffset={3000 * (1 - loopP)} strokeLinecap="round" opacity={0.95} />
                  {stations.map(([x, y, txt, at], i) => t >= at && (
                    <g key={i} transform={`translate(${x},${y}) scale(${popIn(t, at)})`}>
                      <rect x={-txt.length * 19 - 30} y={-44} width={txt.length * 38 + 60} height={80} rx={40} fill="#ffffff" {...kst(6)} />
                      <text y={18} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={50} fill="#1982c4">{txt}</text>
                    </g>
                  ))}
                </g>
              );
            })()}
            {/* Drippy */}
            <Drippy x={dx} y={dy + bob} s={dS} expr={drExpr} mouth={drMouth} faint={faint} t={t} squash={bumpSq * 0.5 + heavySq} look={within(t, FALL, SPLASH) ? [0, 1] : [0, 0.1]} />
            {/* Hoot explains from the hilltop */}
            <Critter spec={HOOT_HERO} x={1790} y={600} scale={0.36} expr={hootExpr} look={[-0.7, -0.2]} mouth={lipSync(VO, 'hoot', t)}
              armL={talks('hoot') ? 'point' : 'down'} armR="down" facing={-1} />
            {/* FX */}
            <ImpactStar t={t} at={GATHER + 1.7} x={CLOUD[0]} y={CLOUD[1]} s={0.8} color="#ffffff" />
            {[...BUMPS, BUMP_T].map((b, i) => <ImpactStar key={i} t={t} at={b} x={dx + (i % 2 ? -110 : 110)} y={dy - 90} s={0.4} color="#4cc9f0" />)}
            <Dust t={t} at={SPLASH} x={LANDING[0]} y={LANDING[1]} s={0.9} />
            <MotionLines t={t} from={FALL} to={FALL + 1.2} x={dx - 40} y={dy - 220} dir={-120} n={3} len={80} spread={30} />
            <MotionLines t={t} from={SLIDE0} to={S('river') + 1.6} x={dx + 90} y={dy - 60} dir={-20} n={3} len={70} spread={24} />
            <StageWord t={t} at={BRRR} until={E('cold') + 0.4} text="BRRR!" x={900} y={260} size={80} color="#1982c4" rot={-6} />
            {BUMPS.map((b, i) => <StageWord key={i} t={t} at={b} until={b + 0.9} text="BUMP!" x={dx + (i - 1) * 220} y={dy + 150} size={70} color="#ffca3a" rot={(i - 1) * 8} />)}
            <StageWord t={t} at={BUMP_T} until={BUMP_T + 1.0} text="BUMP!" x={dx} y={dy + 150} size={80} color="#ffca3a" rot={-6} />
            <StageWord t={t} at={word('fall', 5)} until={FALL + 1.4} text="WHEEE!" x={1250} y={380} size={90} color="#ffca3a" rot={-6} />
            <StageWord t={t} at={SPLASH} until={SPLASH + 1.2} text="SPLASH!" x={LANDING[0]} y={LANDING[1] - 230} size={90} color="#4cc9f0" rot={6} />
            <Reaction kind="sweat" t={t} at={S('heavy') + 0.5} until={FALL} x={dx + 80} y={dy - 220} s={0.6} />
          </g>
        )}

        {/* ── LAB (rain in a jar) + the wow fact ── */}
        {scene === 'lab' && (
          <g>
            <Backdrop place="science-lab" w={W} h={H} t={t} fx={false} />
            {/* the table */}
            <Vol kind="slope"><rect x={660} y={JAR[1]} width={600} height={46} rx={18} fill="#ffd6a5" {...kst(7)} /></Vol>
            {[700, 1220].map((x) => <Vol key={x} kind="tube"><rect x={x - 14} y={JAR[1] + 40} width={28} height={f - JAR[1] - 40} rx={12} fill="#e8b17a" {...kst(6)} /></Vol>)}
            {jarS > 0 && (
              <g transform={`translate(${JAR[0]},${JAR[1]}) scale(${jarS})`}>
                {/* water + steam */}
                <rect x={-96} y={-water * 110} width={192} height={water * 110} fill="#4cc9f0" opacity={0.8} />
                {water > 0.3 && t < DROPS0 + 2 && [0, 1, 2].map((i) => {
                  const p = (t * 0.5 + i / 3) % 1;
                  return <path key={i} d={`M ${-50 + i * 50},${-120 - p * 90} q 14,-20 0,-40 q -14,-20 0,-40`} fill="none" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" strokeDasharray="2 18" opacity={0.7 * Math.sin(p * Math.PI)} />;
                })}
                {/* drops under the plate grow, then drip */}
                {t >= DROPS0 && Array.from({ length: 7 }).map((_, i) => {
                  const g = popIn(t, DROPS0 + i * 0.1) * (0.5 + prog(t, DROPS0 + 0.6, DRIP) * 0.6);
                  const x = -78 + i * 26;
                  const drip = t >= DRIP && i % 2 === 0 ? ((t - DRIP - i * 0.15 + 3) % 1.4) / 1.4 : -1;
                  return (
                    <g key={i}>
                      <circle cx={x} cy={-JAR_H + 12} r={7 * g} fill="#4cc9f0" {...kst(2)} />
                      {drip >= 0 && drip < 0.9 && <g transform={`translate(${x},${-JAR_H + 20 + drip * (JAR_H - 120)})`}><MiniDrop s={0.45} /></g>}
                    </g>
                  );
                })}
                {/* the glass jar */}
                <rect x={-104} y={-JAR_H} width={208} height={JAR_H} rx={26} fill="#dff4ff" opacity={0.35} {...kst(7)} />
                <path d={`M -70,${-JAR_H + 30} L -70,-30`} stroke="#ffffff" strokeWidth={12} strokeLinecap="round" opacity={0.8} />
                {/* the plate + ice cubes */}
                {plateIn > 0 && (
                  <g transform={`translate(0,${-JAR_H - (1 - Math.min(1, plateIn)) * 120})`}>
                    <Vol kind="slope"><ellipse cx={0} cy={0} rx={150} ry={22} fill="#ffffff" {...kst(6)} /></Vol>
                    {[-60, 0, 60].map((x, i) => t >= ICE + i * 0.25 && (
                      <g key={x} transform={`translate(${x},-36) scale(${popIn(t, ICE + i * 0.25)})`}>
                        <Vol><rect x={-26} y={-26} width={52} height={52} rx={10} fill="#bfefff" {...kst(5)} /></Vol>
                        <path d="M -14,-12 L 4,-12" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" />
                      </g>
                    ))}
                  </g>
                )}
              </g>
            )}
            {/* the wow fact: 3 shape cards */}
            {t >= S('fact_q') && (
              <g>
                <g transform="translate(600,380)">
                  <ShapeCard s={popIn(t, word('fact_q', 4))} label="pointy?">
                    <path d="M 0,-110 C 20,-70 60,-30 60,10 A 60,60 0 0 1 -60,10 C -60,-30 -20,-70 0,-110 Z" fill="#4cc9f0" {...kst(7)} />
                  </ShapeCard>
                </g>
                <g transform="translate(960,380)">
                  <ShapeCard s={popIn(t, word('fact_a', 10))} label="small: round">
                    <Vol><circle cx={0} cy={-20} r={62} fill="#4cc9f0" {...kst(7)} /></Vol>
                  </ShapeCard>
                </g>
                <g transform="translate(1320,380)">
                  <ShapeCard s={popIn(t, word('fact_b', 4))} label="big: a bun!">
                    <Vol><path d="M -90,10 Q -90,-90 0,-90 Q 90,-90 90,10 Q 60,30 0,30 Q -60,30 -90,10 Z" fill="#4cc9f0" {...kst(7)} /></Vol>
                  </ShapeCard>
                </g>
                <AnswerMark t={t} at={word('fact_a', 5)} ok={false} x={710} y={260} size={0.8} />
                <AnswerMark t={t} at={word('fact_a', 10) + 0.4} ok={true} x={1070} y={260} size={0.8} />
                <AnswerMark t={t} at={word('fact_b', 9)} ok={true} x={1430} y={260} size={0.8} />
              </g>
            )}
            <Kid spec={MILA_HERO} x={LB.mila} y={f} scale={KS} expr={milaExpr} look={[0.6, -0.2]} mouth={lipSync(VO, 'mila', t)} armR={mArm()} armL={yay ? 'up' : 'hip'} hop={hopOf(0)} />
            <Critter spec={HOOT_HERO} x={LB.hoot} y={f} scale={HS} expr={hootExpr} look={[-0.6, -0.2]} mouth={lipSync(VO, 'hoot', t)}
              armL={talks('hoot') ? 'point' : 'down'} armR={within(t, S('fact_b'), E('fact_b')) ? 'up' : 'down'} facing={-1} />
            <Kid spec={LEO_HERO} x={LB.leo} y={f} scale={KS} expr={leoExpr} look={[-0.6, -0.2]} mouth={lipSync(VO, 'leo', t)} armL={lArm()} armR={within(t, S('leo_bun'), E('leo_bun')) ? 'hug' : 'down'} hop={hopOf(1)} />
            <StageWord t={t} at={DRIP} until={DRIP + 1.6} text="DRIP! DRIP!" x={JAR[0] + 240} y={JAR[1] - 330} size={80} color="#4cc9f0" rot={8} />
            <StageWord t={t} at={POUR} until={POUR + 1.6} text="WARM!" x={JAR[0] - 230} y={JAR[1] - 300} size={70} color="#ff924c" rot={-8} />
            <StageWord t={t} at={ICE} until={ICE + 1.6} text="ICE!" x={JAR[0] + 230} y={JAR[1] - 340} size={70} color="#4cc9f0" rot={8} />
            <Reaction kind="heart" t={t} at={S('mila_yay')} until={E('mila_yay') + 0.6} x={LB.mila} y={f - 640} s={0.7} />
            <Reaction kind="?" t={t} at={S('fact_q')} until={E('fact_q') + 0.4} x={LB.leo} y={f - 640} s={0.7} />
          </g>
        )}

        {/* ── MEADOW (the rainbow + the remember round) ── */}
        {scene === 'meadow' && (
          <g>
            <Backdrop place="meadow" w={W} h={H} t={t} fx={['butterflies', 'birds']} />
            <g opacity={prog(t, word('rainbow_q', 7), word('rainbow_q', 7) + 1.2)}>
              <Rainbow x={960} y={760} r={700} o={0.85} />
            </g>
            {/* the colours, one dot each as they are said */}
            {within(t, S('colors'), S('rem') - 0.3) && ['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#4cc9f0', '#6a4c93'].map((c, i) => {
              const at = word('colors', i < 5 ? i : 6);
              return t >= at && <g key={c} transform={`translate(${560 + i * 160},280) scale(${popIn(t, at) * 0.9})`}><Vol><circle r={56} fill={c} {...kst(7)} /></Vol></g>;
            })}
            <Kid spec={MILA_HERO} x={MD.mila} y={f} scale={KS} expr={milaExpr} look={within(t, S('rainbow_q'), S('rainbow')) ? [0.3, -0.9] : [0.4, -0.2]} mouth={lipSync(VO, 'mila', t)} armR={mArm()} armL={yay ? 'up' : 'down'} hop={hopOf(0)} />
            <Kid spec={LEO_HERO} x={MD.leo} y={f} scale={KS} expr={leoExpr} look={[0.2, -0.2]} mouth={lipSync(VO, 'leo', t)} armL={lArm()} armR={within(t, S('thanks'), E('thanks')) ? 'wave' : yay ? 'up' : 'down'} hop={hopOf(1)} />
            <Drippy x={MD.drippy} y={f + 10 - (yay ? Math.abs(Math.sin(t * 7 + 2)) * 30 : 0)} s={0.5} expr={drExpr} mouth={drMouth} t={t} />
            <Critter spec={HOOT_HERO} x={MD.hoot} y={f} scale={HS} expr={hootExpr} look={[-0.5, -0.3]} mouth={lipSync(VO, 'hoot', t)}
              armL={talks('hoot') ? 'point' : t >= S('bye_d') ? 'wave' : 'down'} armR={yay ? 'up' : 'down'} facing={-1} />
            <Reaction kind="heart" t={t} at={S('thanks')} until={E('thanks') + 0.6} x={MD.leo} y={f - 640} s={0.7} />
          </g>
        )}
      </ActionStage>

      {/* screen-space */}
      <PopText t={t} at={S('why') + 0.4} until={S('guess') - 0.2} text="WHERE DOES RAIN COME FROM?" y={170} size={84} color="#ffffff" />
      <PopText t={t} at={word('good', 11)} until={E('how') + 0.3} text="THE CLOUDS!" y={170} size={130} color="#ffffff" />
      <PopText t={t} at={S('q1') + 0.1} until={S('q2') - 0.3} text="1  HOW DOES WATER GO UP?" y={130} size={76} color="#ffca3a" />
      <PopText t={t} at={E('up_turn') - 0.6} until={S('cold') - 0.1} text="YOUR TURN! ☝️" y={260} size={100} color="#ffffff" />
      <PopText t={t} at={S('q2') + 0.1} until={S('q3') - 0.3} text="2  WHY DOES RAIN FALL?" y={130} size={76} color="#ff924c" />
      <PopText t={t} at={E('bump_turn') - 0.6} until={S('heavy') - 0.1} text="YOUR TURN!" y={260} size={100} color="#ffffff" />
      <PopText t={t} at={S('q3') + 0.1} until={S('cycle') - 0.3} text="3  WHERE DOES RAIN GO?" y={130} size={76} color="#52b788" />
      <PopText t={t} at={word('cycle', 15)} until={E('cycle_turn') + 0.8} text="THE WATER CYCLE" y={170} size={110} color="#ffca3a" />
      <PopText t={t} at={E('cycle_turn') - 0.4} until={S('leo_wow') - 0.1} text="YOUR TURN!" y={300} size={100} color="#ffffff" />
      <PopText t={t} at={S('see')} until={S('j1') - 0.1} text="RAIN IN A JAR!" y={150} size={110} color="#4cc9f0" />
      <PopText t={t} at={word('see', 7)} until={S('j1') - 0.1} text="with a grown-up" y={270} size={64} color="#ff6fa5" rot={2} />
      <PopText t={t} at={S('j1')} until={S('j2') - 0.1} text="1  WARM WATER" y={150} size={90} color="#ff924c" />
      <PopText t={t} at={S('j2')} until={S('j3') - 0.1} text="2  PLATE + ICE" y={150} size={90} color="#4cc9f0" />
      <ThinkTimer t={t} from={onBeat(E('j3') + 0.1)} to={S('j4') - 0.1} x={1760} y={190} r={90} label="WAIT…" />
      <PopText t={t} at={DRIP} until={E('mila_yay') + 0.6} text="RAIN!" y={150} size={150} color="#1982c4" />
      <PopText t={t} at={S('fact_a')} until={S('leo_bun') - 0.1} text="WOW FACT!" y={110} size={90} color="#ffca3a" />
      <PopText t={t} at={word('rainbow', 5)} until={S('colors') - 0.1} text="SUN + RAINDROPS = RAINBOW" y={150} size={80} color="#ffffff" />
      <PopText t={t} at={S('rem') + 0.1} until={S('rq1') - 0.1} text="LET'S REMEMBER!" y={170} size={110} color="#ffca3a" />
      {(['rq1', 'rq2', 'rq3', 'rq4', 'rq5', 'rq6'] as const).map((q, i) => {
        const a = (['ra1', 'ra2', 'ra3', 'ra4', 'ra5', 'ra6'] as const)[i];
        return <ThinkTimer key={q} t={t} from={onBeat(E(q) + 0.1)} to={S(a) - 0.1} x={1760} y={190} r={90} label="THINK!" />;
      })}
      <PopText t={t} at={S('ra1')} until={S('rq2') - 0.2} text="FROM THE CLOUDS!" y={170} size={110} color="#ffffff" />
      <PopText t={t} at={S('ra2')} until={S('rq3') - 0.2} text="THE WARM SUN!" y={170} size={110} color="#ffca3a" />
      <PopText t={t} at={S('ra3')} until={S('rq4') - 0.2} text="BIG AND HEAVY!" y={170} size={110} color="#4cc9f0" />
      <PopText t={t} at={S('ra4')} until={S('rq5') - 0.2} text="BACK TO THE SEA!" y={170} size={110} color="#1982c4" />
      <PopText t={t} at={S('ra5')} until={S('rq6') - 0.2} text="THE WATER CYCLE!" y={170} size={110} color="#ffca3a" />
      <PopText t={t} at={S('ra6')} until={S('chant') - 0.2} text="A RAINBOW!" y={170} size={130} color="#ff6fa5" />
      <PopText t={t} at={S('ch1')} until={S('ch2') - 0.05} text="UP, UP, UP!" y={170} size={120} color="#ffffff" />
      <PopText t={t} at={S('ch2')} until={S('ch3') - 0.05} text="CLOUD!" y={170} size={130} color="#ffffff" />
      <PopText t={t} at={S('ch3')} until={S('ch4') - 0.05} text="RAIN!" y={170} size={130} color="#4cc9f0" />
      <PopText t={t} at={S('ch4')} until={S('ch_turn') - 0.1} text="AND ROUND AGAIN!" y={170} size={110} color="#ffca3a" />
      <PopText t={t} at={S('ch_turn')} until={S('bye_d') - 0.2} text="YOUR TURN!" y={170} size={120} color="#ffffff" />
      <PopText t={t} at={S('bye')} until={E('bye') + 0.6} text="SEE YOU NEXT TIME!" y={170} size={100} color="#4cc9f0" />
      <Confetti t={t} at={S('drippy_hi')} y={420} />
      <Confetti t={t} at={S('mila_yay')} y={420} />
      <Confetti t={t} at={word('rainbow_q', 7)} y={420} />
      <Confetti t={t} at={S('ch4')} y={420} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <SparksIntro t={t} at={0} cast={{ kids: [MILA_HERO, LEO_HERO], buddy: BOBO_HERO }} />
      <StarWipe t={t} at={E('bye') + 0.6} dur={0.5} hold={5} color="#1d3b6e" x={W / 2} y={H * 0.45} />
    </>
  );
}
