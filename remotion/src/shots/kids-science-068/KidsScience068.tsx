// TINY SPARKS · Day 68 · 🚀 Science for Kids #10 — "What Is Lightning?" (LONG 16:9)
// kids-shorts/tiny-sparks/science/day-068-what-is-lightning. Cues from VO via K (keys.gen.ts).
// COLD OPEN (no ident): a flash over the rainy street at 0.3 s + Mila's question → Leo's guess (a dragon taking a photo)
// → Hoot: a giant spark of ELECTRICITY → the thunder makes Bobo jump → the storm rule "when thunder roars, go indoors!" →
// everyone runs inside → the LAB, Hoot's screen: 3 QUESTIONS — 1 inside a storm cloud (ice + drops bump, the cloud fills
// with electricity, ZAP; cloud→ground and cloud→cloud; straight or zigzag? think timer, Leo ✗) · 2 a baby spark with a
// balloon (with a grown-up: Bobo rubs it on his fur → the fur stands up, the balloon sticks to the wall, the door-handle
// snap) · 3 why the flash comes before the boom (light vs sound race; count flash → 1, 2, 3 → boom; bigger number = farther)
// → WOW: hotter than the outside of the Sun; flashes on Earth many times every second → STORM SAFETY GAME (tree or house?
// Leo ✗ · the pool · Bobo is scared → a hug) → the storm is over → remember (5) → chant → bye + star iris.
// Facts: lightning is a giant electrical spark from charge built up as ice + water bump in storm clouds; it goes cloud→
// ground or cloud→cloud; ~30,000 °C, about 5× the Sun's surface; light is far faster than sound, so the flash comes first,
// and a longer count means a farther storm; NWS "When thunder roars, go indoors"; stay out of water, not under trees;
// lightning strikes Earth dozens of times every second (NOAA / NWS / National Geographic Kids).
import React from 'react';
import { Kid, kidFaceAt, type KArm } from '../../lib/kids/kid';
import { Critter, critterFaceAt, type CArm } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, HOOT_HERO, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { Backdrop, PlaceLight, standY, type Place } from '../../lib/kids/places';
import { AnswerMark, Balloon, Bubble, Confetti, FONT_TOON, KidsCaptions, PopText, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, ImpactStar, MotionLines, Reaction, StageWord, StarWipe, directorCam, hopAt, onBeat, shakeOf, type Hit, type Shot } from '../../lib/kids/energy';
import { exprAt, poseAt, walkPath } from '../../lib/kids/smooth';
import { voKeys, wordHops, type Span } from '../../lib/kids/cues';
import { EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsScience068', durationInSeconds: 350.9, fps: 30, width: 1920, height: 1080 };

const W = 1920;
const H = 1080;
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
const beat = (x: number) => onBeat(x, 0); // the bed starts at 0 s (cold open)

// ── places + blocking
const STORM: Place = 'rainy-street';
const LAB: Place = 'science-lab';
const KS = 0.55;
const BS = 0.6;
const HS = 0.55;
const LS = 0.5; // in the lab (smaller: the screen is the star)
const LBS = 0.55;
const XS = { mila: 560, leo: 820, bobo: 1110, hoot: 1390 };
const XL = { mila: 210, leo: 420, bobo: 1520, hoot: 1730 };
const yAt = (place: Place, x: number, s: number) => standY(place, x, W, H, { halfW: 150 * s });

// ── timeline anchors
const RUN0 = word('indoors', 5);
const LAB0 = S('safe') - 0.6;
const ZAP = word('zap', 6);
const BOLT_G = word('path', 7);
const BOLT_C = word('path', 14);
const RACE = word('race', 6);
const SND0 = S('sound');
const BALLOON_IN = S('rub');
const RUB0 = S('rub_b');
const POOF = E('rub_b') + 0.05;
const LETGO = word('stick', 8);
const HUG0 = S('g3_a');
const SUNNY = S('over');
const END_IRIS = E('bye2') + 0.6;
const FLASHES = [0.3, word('good', 10), S('rumble') - 0.5, word('rule', 4), LAB0 + 1.6, S('three') + 0.4, S('q1') - 0.6];

// walks: everybody runs inside; Bobo to the middle for the balloon and back; Mila to Bobo for the hug and back
const runAt = (t: number, x: number, d: number) => walkPath(t, [[RUN0 + d, RUN0 + d + 1.5, x, x + 1300]], 120 * KS);
const BOBO_LAB: [number, number, number, number][] = [
  [S('bobo_try') - 0.1, S('bobo_try') + 1.6, XL.bobo, 960], [S('q3') - 0.2, S('q3') + 1.6, 960, XL.bobo],
];
const MILA_LAB: [number, number, number, number][] = [[HUG0 - 0.2, HUG0 + 1.4, XL.mila, XL.bobo - 190], [SUNNY - 0.6, SUNNY + 1.2, XL.bobo - 190, XL.mila]];

// ── arms + faces from the VO (smooth timelines)
const CHANT: Span<KArm> = [S('ch1'), E('ch_a') + 0.3, 'cheer'];
const BYE: Span<KArm> = [S('bye'), 999, 'wave'];
const MILA_R = voKeys<KArm>(VO, 'mila', 'present', 'down', [
  [0, E('open'), 'point'], [S('bump_turn'), E('bump_turn'), 'clap'], [S('shape_a'), E('shape_a'), 'point'],
  [S('c1'), S('far') + 2, 'count'], [HUG0 + 1.2, SUNNY - 0.6, 'hug'], [S('ra5'), E('ra5'), 'cheer'], CHANT, BYE,
]);
const MILA_L = voKeys<KArm>(VO, null, 'down', 'down', [[HUG0 + 1.2, SUNNY - 0.6, 'hug'], [S('ra5'), E('ra5'), 'cheer'], CHANT, BYE]);
const MILA_E = voKeys<KExpr>(VO, 'mila', 'happy', 'smile', [
  [0, E('open'), 'wow'], [S('poof'), E('poof') + 0.4, 'laugh'], [S('g3_a'), SUNNY, 'happy'], [S('ch1'), 999, 'laugh'],
]);
const LEO_R = voKeys<KArm>(VO, 'leo', 'present', 'down', [
  [S('guess'), E('guess'), 'thumbs'], [S('indoors'), E('indoors') + 1.6, 'point'], [S('zap_name'), E('zap_name'), 'cheer'],
  [S('shape_leo'), E('shape_leo'), 'point'], [S('stuck'), E('stuck'), 'cheeks'], [S('wow_leo'), E('wow_leo'), 'cheeks'],
  [S('g1_leo'), E('g1_leo'), 'point'], [S('ra4'), E('ra4'), 'up'], CHANT, BYE,
]);
const LEO_L = voKeys<KArm>(VO, null, 'down', 'down', [[S('stuck'), E('stuck'), 'cheeks'], [S('wow_leo'), E('wow_leo'), 'cheeks'], CHANT, BYE]);
const LEO_E = voKeys<KExpr>(VO, 'leo', 'happy', 'smile', [
  [S('guess'), E('guess'), 'laugh'], [S('good'), S('word'), 'surprised'], [S('shape_leo'), E('shape_leo'), 'proud'],
  [E('shape_leo'), S('q2'), 'oops'], [S('stuck'), E('stuck'), 'wow'], [S('wow_leo'), E('wow_leo'), 'wow'],
  [S('g1_leo'), E('g1_leo'), 'proud'], [E('g1_leo'), S('g2'), 'oops'], [S('ch1'), 999, 'laugh'],
]);
const BOBO_A = voKeys<CArm>(VO, 'bobo', 'wave', 'down', [
  [S('rumble'), E('rumble') + 0.4, 'cheeks'], [S('bobo_try'), E('bobo_try'), 'up'], [S('boom'), E('boom') + 0.3, 'cheeks'],
  [S('g3'), HUG0 + 1.2, 'cheeks'], [HUG0 + 1.2, SUNNY - 0.6, 'hug'], [S('ra3'), E('ra3'), 'cheer'], [S('ch1'), E('ch_a') + 0.3, 'cheer'], [S('bye'), 999, 'wave'],
]);
const BOBO_E = voKeys<KExpr>(VO, 'bobo', 'happy', 'smile', [
  [S('rumble'), E('rumble') + 0.4, 'surprised'], [S('rub_b'), E('poof') + 0.4, 'laugh'], [S('bobo_snap'), E('bobo_snap'), 'laugh'],
  [S('boom'), E('boom') + 0.4, 'surprised'], [S('g3'), HUG0, 'sad'], [HUG0, SUNNY, 'happy'], [S('ch1'), 999, 'laugh'],
]);
const HOOT_A = voKeys<CArm>(VO, 'hoot', 'point', 'down', [[S('ch1'), E('ch_a') + 0.3, 'cheer'], [S('bye'), 999, 'wave']]);
const HOOT_R = voKeys<CArm>(VO, null, 'down', 'down', [[S('ch1'), E('ch_a') + 0.3, 'cheer'], [S('bye'), 999, 'wave']]);
const HOOT_E = voKeys<KExpr>(VO, 'hoot', 'happy', 'smile', [[S('wow'), E('wow'), 'wow'], [S('ch1'), 999, 'laugh']]);
const CHANT_HOPS = wordHops(VO, [K.ch1, K.ch2, K.ch3, K.ch4, K.ch_a]);
const YAY_HOPS = [E('zap_name') + 0.2, E('g3_bobo') + 0.2, S('over') + 0.8];

// ── camera
const WIDE = { z: 1.0, x: 960, y: 540 };
const sFace = (x: number, s = KS) => kidFaceAt(x, yAt(STORM, x, s), s)[1] + 70;
const lFace = (x: number, s = LS) => kidFaceAt(x, yAt(LAB, x, s), s)[1] + 70;
const bFace = (x: number) => critterFaceAt(x, yAt(LAB, x, LBS), LBS)[1] + 60;
const SCREEN = { z: 1.14, x: 960, y: 450 };
const SHOTS: Shot[] = [
  { t: 0, z: 1.12, x: 960, y: 420, move: 'cut', push: 0.02 },
  { t: S('guess') - 0.15, z: 1.4, x: XS.leo + 150, y: sFace(XS.leo) - 40, move: 'whip' },
  { t: S('good') - 0.15, z: 1.45, x: XS.hoot - 40, y: critterFaceAt(XS.hoot, yAt(STORM, XS.hoot, HS), HS)[1] + 80, move: 'whip', push: 0.01 },
  { t: S('word2') - 0.1, z: 1.6, x: XS.mila, y: sFace(XS.mila), move: 'snap' },
  { t: S('rumble') - 0.1, z: 1.5, x: XS.bobo, y: critterFaceAt(XS.bobo, yAt(STORM, XS.bobo, BS), BS)[1] + 90, move: 'snap', push: 0.02 },
  { t: S('rule') - 0.2, ...WIDE, move: 'smooth', dur: 0.8, push: 0.01 },
  { t: LAB0, ...WIDE, move: 'cut', push: 0.006 },
  { t: S('q1') - 0.1, ...SCREEN, move: 'smooth', dur: 0.8, push: 0.01 },
  { t: S('zap_name') - 0.1, z: 1.6, x: XL.leo, y: lFace(XL.leo), move: 'whip' },
  { t: S('path') - 0.2, ...SCREEN, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('q2') - 0.2, ...WIDE, move: 'smooth', dur: 0.6, push: 0.006 },
  { t: S('rub_b') - 0.1, z: 1.5, x: 960, y: bFace(960) - 40, move: 'snap', push: 0.02 },
  { t: S('stick') - 0.1, z: 1.15, x: 900, y: 480, move: 'smooth', dur: 0.8 },
  { t: S('static') - 0.2, ...WIDE, move: 'smooth', dur: 0.8, push: 0.006 },
  { t: S('bobo_snap') - 0.1, z: 1.5, x: 960, y: bFace(960) - 40, move: 'snap' },
  { t: S('q3') - 0.2, ...SCREEN, move: 'smooth', dur: 0.8, push: 0.01 },
  { t: S('c0') - 0.2, z: 1.15, x: 820, y: 480, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('far') - 0.2, ...SCREEN, move: 'smooth', dur: 0.6 },
  { t: S('wow') - 0.1, ...SCREEN, move: 'cut', push: 0.01 },
  { t: S('wow_leo') - 0.1, z: 1.6, x: XL.leo, y: lFace(XL.leo), move: 'whip' },
  { t: S('wow2') - 0.1, ...SCREEN, move: 'whip', push: 0.01 },
  { t: S('game') - 0.2, ...WIDE, move: 'smooth', dur: 0.6, push: 0.006 },
  { t: S('g1') - 0.1, ...SCREEN, move: 'smooth', dur: 0.6, push: 0.006 },
  { t: S('g1_leo') - 0.1, z: 1.6, x: XL.leo, y: lFace(XL.leo), move: 'snap' },
  { t: S('g1_a') - 0.1, ...SCREEN, move: 'smooth', dur: 0.6 },
  { t: S('g3') - 0.1, z: 1.45, x: XL.bobo - 60, y: bFace(XL.bobo), move: 'snap', push: 0.02 },
  { t: HUG0 + 0.2, z: 1.2, x: XL.bobo - 140, y: 600, move: 'smooth', dur: 1.2, push: 0.02 },
  { t: SUNNY - 0.2, ...WIDE, move: 'smooth', dur: 0.8, push: 0.006 },
  { t: S('ra1') - 0.1, z: 1.6, x: XL.leo, y: lFace(XL.leo), move: 'snap' },
  { t: E('ra1') + 0.6, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('ra3') - 0.1, z: 1.5, x: XL.bobo, y: bFace(XL.bobo), move: 'snap' },
  { t: E('ra3') + 0.6, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('ch1') - 0.1, z: 1.08, x: 960, y: 560, move: 'smooth', dur: 0.6, push: 0.02 },
  { t: S('bye') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
];
SHOTS.sort((a, b) => a.t - b.t);
const PUNCHES = [ZAP, S('boom'), S('word'), POOF];
const HITS: Hit[] = [{ at: word('rumble', 2), amp: 8, dur: 0.3 }, { at: ZAP, amp: 7, dur: 0.3 }, { at: S('boom'), amp: 8, dur: 0.3 }];

// ── drawings
const zig = (x0: number, y0: number, x1: number, y1: number, n: number, amp: number, seed = 1) => {
  const pts: [number, number][] = [[x0, y0]];
  for (let i = 1; i < n; i++) {
    const p = i / n;
    const off = (i % 2 ? 1 : -1) * amp * (0.6 + 0.4 * Math.abs(Math.sin(i * 12.9898 + seed)));
    pts.push([x0 + (x1 - x0) * p + off, y0 + (y1 - y0) * p]);
  }
  pts.push([x1, y1]);
  return 'M ' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L ');
};
// a lightning bolt: draws on fast (p 0..1), then glows; fade = 0..1 (1 = gone)
const Bolt: React.FC<{ d: string; p?: number; fade?: number; w?: number }> = ({ d, p = 1, fade = 0, w = 14 }) => (
  <g opacity={1 - fade}>
    <path d={d} fill="none" stroke="#fff59d" strokeWidth={w * 3} strokeLinejoin="round" strokeLinecap="round" opacity={0.35} pathLength={1} strokeDasharray={`${p} 1`} />
    <path d={d} fill="none" stroke="#ffe066" strokeWidth={w * 1.6} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} />
    <path d={d} fill="none" stroke="#ffffff" strokeWidth={w * 0.7} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} />
  </g>
);
const boltLife = (t: number, at: number, hold = 0.55) => (t < at || t > at + hold + 0.3 ? null : { p: prog(t, at, at + 0.12), fade: prog(t, at + hold, at + hold + 0.3) });
const Cloud: React.FC<{ w: number; fill?: string; glow?: number }> = ({ w, fill = '#9d8fc4', glow = 0 }) => {
  const s = w / 600;
  return (
    <g transform={`scale(${s})`}>
      <Vol>
        <path d="M -260,70 Q -320,70 -320,10 Q -320,-60 -240,-66 Q -228,-160 -120,-160 Q -70,-230 24,-208 Q 108,-240 166,-160 Q 270,-170 282,-70 Q 340,-46 330,24 Q 318,70 260,70 Z" fill={fill} {...kst(8 / s)} />
      </Vol>
      {glow > 0 && <path d="M -260,70 Q -320,70 -320,10 Q -320,-60 -240,-66 Q -228,-160 -120,-160 Q -70,-230 24,-208 Q 108,-240 166,-160 Q 270,-170 282,-70 Q 340,-46 330,24 Q 318,70 260,70 Z" fill="#fff8c4" opacity={glow * 0.28} />}
    </g>
  );
};
const House: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <Vol><rect x={-90} y={-70} width={180} height={140} rx={10} fill="#ffd6a5" {...kst(6)} /></Vol>
    <Vol><path d="M -120,-60 L 0,-160 L 120,-60 Z" fill="#ff6fa5" {...kst(6)} /></Vol>
    <rect x={-24} y={0} width={48} height={70} rx={8} fill="#8d5a3b" {...kst(5)} />
    <rect x={36} y={-40} width={40} height={36} rx={6} fill="#fff59d" {...kst(4)} />
    <rect x={-76} y={-40} width={40} height={36} rx={6} fill="#fff59d" {...kst(4)} />
  </g>
);
const Tree: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <Vol kind="tube"><rect x={-22} y={-60} width={44} height={140} rx={14} fill="#8d5a3b" {...kst(6)} /></Vol>
    <Vol><circle cx={0} cy={-120} r={90} fill="#52b788" {...kst(6)} /><circle cx={-60} cy={-70} r={60} fill="#40916c" {...kst(6)} /><circle cx={60} cy={-70} r={60} fill="#74c69d" {...kst(6)} /></Vol>
  </g>
);
const Sun: React.FC<{ r?: number; t: number }> = ({ r = 60, t }) => (
  <g>
    {Array.from({ length: 10 }).map((_, i) => (
      <rect key={i} x={-6} y={-r - 34} width={12} height={24} rx={6} fill="#ffca3a" transform={`rotate(${i * 36 + t * 12})`} />
    ))}
    <Vol><circle r={r} fill="#ffd23f" {...kst(6)} /></Vol>
  </g>
);
const Drop: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}><Vol><path d="M 0,-30 C 12,-10 20,4 20,14 A 20,20 0 0 1 -20,14 C -20,4 -12,-10 0,-30 Z" fill="#4cc9f0" {...kst(5)} /></Vol></g>
);
const Ice: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}><Vol><path d="M 0,-24 L 21,-12 L 21,12 L 0,24 L -21,12 L -21,-12 Z" fill="#e8f7ff" {...kst(5)} /></Vol></g>
);
const Card: React.FC<{ w: number; h: number; label?: string; color?: string; children?: React.ReactNode }> = ({ w, h, label, color = '#ffca3a', children }) => (
  <g>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={34} fill="#ffffff" {...kst(7)} />
    {children}
    {label && <text y={h / 2 - 26} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={44} fill={color} stroke={KINK} strokeWidth={6} paintOrder="stroke">{label}</text>}
  </g>
);
const Thermo: React.FC<{ fill: number; c: string }> = ({ fill, c }) => (
  <g>
    <rect x={-34} y={-200} width={68} height={300} rx={34} fill="#ffffff" {...kst(6)} />
    <rect x={-20} y={-186 + 272 * (1 - fill)} width={40} height={272 * fill + 10} rx={20} fill={c} />
    <Vol><circle cy={130} r={56} fill={c} {...kst(6)} /></Vol>
  </g>
);
const Earth: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Vol><circle r={170} fill="#4cc9f0" {...kst(7)} /></Vol>
    <g transform={`rotate(${t * 6})`}>
      <path d="M -120,-60 Q -60,-120 0,-90 Q 30,-40 -20,-10 Q -80,20 -120,-60 Z M 40,30 Q 110,10 130,70 Q 90,130 40,100 Q 20,60 40,30 Z M -60,80 Q -20,60 0,110 Q -40,140 -60,80 Z" fill="#8ac926" {...kst(5)} />
    </g>
  </g>
);
const Camera: React.FC = () => (
  <g>
    <Vol><rect x={-90} y={-56} width={180} height={112} rx={20} fill="#6c757d" {...kst(6)} /></Vol>
    <rect x={-40} y={-80} width={60} height={30} rx={8} fill="#6c757d" {...kst(5)} />
    <Vol><circle r={40} fill="#3b2a4a" {...kst(5)} /></Vol>
    <circle r={18} fill="#4cc9f0" />
    <circle cx={62} cy={-34} r={10} fill="#fff59d" {...kst(3)} />
  </g>
);
const Door: React.FC<{ spark: number }> = ({ spark }) => (
  <g>
    <Vol><rect x={-110} y={-160} width={220} height={320} rx={16} fill="#c98f5f" {...kst(7)} /></Vol>
    <rect x={-80} y={-130} width={160} height={110} rx={10} fill="none" stroke="#8d5a3b" strokeWidth={6} />
    <Vol><circle cx={70} cy={20} r={16} fill="#ffd23f" {...kst(5)} /></Vol>
    {spark > 0 && <g transform={`translate(50,20) scale(${spark})`}><Bolt d={zig(-40, -30, 0, 0, 3, 8)} w={6} /><Bolt d={zig(-40, 30, 0, 0, 3, 8, 3)} w={6} /></g>}
  </g>
);

// the screen in the lab (stage space): what it shows at time t
type ScreenMode = 'storm' | 'cloud' | 'shape' | 'race' | 'count' | 'hot' | 'earth' | 'g1' | 'g2' | 'sunny' | 'r1' | 'r2' | 'r3' | 'r4' | 'r5' | 'none';
const screenAt = (t: number): ScreenMode => {
  if (t < LAB0 || t < S('q1') - 0.3) return 'storm';
  if (t < S('shape_q') - 0.2) return 'cloud';
  if (t < S('q2') - 0.3) return 'shape';
  if (t < S('q3') - 0.3) return 'none';
  if (t < S('count_how') - 0.2) return 'race';
  if (t < S('wow') - 0.2) return 'count';
  if (t < S('wow2') - 0.2) return 'hot';
  if (t < S('game') - 0.2) return 'earth';
  if (t < S('g2') - 0.2) return 'g1';
  if (t < S('g3') - 0.2) return 'g2';
  if (t < SUNNY - 0.2) return 'none';
  if (t < S('rq1') - 0.2) return 'sunny';
  if (t < S('rq2') - 0.2) return 'r1';
  if (t < S('rq3') - 0.2) return 'r2';
  if (t < S('rq4') - 0.2) return 'r3';
  if (t < S('rq5') - 0.2) return 'r4';
  if (t < S('chant') - 0.2) return 'r5';
  return 'sunny';
};
const modeStart = (t: number): number => {
  const m = screenAt(t);
  let a = t;
  while (a > 0 && screenAt(a - 1 / 30) === m) a -= 1 / 30;
  return a;
};
const PX = 960;
const PY = 420;
const PW = 860;
const PH = 500;

const Screen: React.FC<{ t: number }> = ({ t }) => {
  const mode = screenAt(t);
  if (mode === 'none') return null;
  const m0 = modeStart(t);
  const sc = mode === 'storm' ? popIn(t, LAB0 + 0.3) : 1;
  const inner = (() => {
    switch (mode) {
      case 'storm':
      case 'sunny': {
        const sunny = mode === 'sunny';
        const fl = FLASHES.find((a) => within(t, a, a + 0.45));
        return (
          <g>
            <rect x={-PW / 2} y={-PH / 2} width={PW} height={PH} fill={sunny ? '#8fd3ff' : '#5b5a8c'} />
            {sunny && <g transform="translate(-260,-120)"><Sun t={t} r={64} /></g>}
            {sunny && [0, 1, 2, 3, 4, 5].map((i) => (
              <path key={i} d={`M ${-160 - i * 22},${PH / 2} A ${360 + i * 22},${300 + i * 22} 0 0 1 ${560 + i * 22},${PH / 2}`} fill="none"
                stroke={['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#4cc9f0', '#9d4edd'][i]} strokeWidth={22} opacity={0.85}
                pathLength={1} strokeDasharray={`${prog(t, SUNNY + 0.6, SUNNY + 2.4)} 1`} />
            ))}
            {!sunny && <g transform="translate(-120,-150)"><Cloud w={520} fill="#7d6fb0" glow={fl !== undefined ? 1 - prog(t, fl, fl + 0.45) : 0} /></g>}
            {!sunny && fl !== undefined && <Bolt d={zig(-100, -100, -40, 200, 6, 30, fl)} p={prog(t, fl, fl + 0.1)} fade={prog(t, fl + 0.25, fl + 0.45)} w={10} />}
            {!sunny && Array.from({ length: 40 }).map((_, i) => {
              const p = (t * 0.9 + i * 0.137) % 1;
              return <path key={i} d={`M ${-PW / 2 + ((i * 97) % PW)},${-PH / 2 + p * PH} l -8,26`} stroke="#bde0fe" strokeWidth={5} strokeLinecap="round" opacity={0.8} />;
            })}
            <rect x={-PW / 2} y={PH / 2 - 60} width={PW} height={60} fill={sunny ? '#8ac926' : '#4f7a4a'} />
            {/* window bars: it is the lab window, we are inside */}
            <path d={`M 0,${-PH / 2} L 0,${PH / 2} M ${-PW / 2},0 L ${PW / 2},0`} stroke="#ffffff" strokeWidth={16} />
          </g>
        );
      }
      case 'cloud': {
        const amp = 4 + 18 * prog(t, S('bump'), word('bump', 6));
        const charge = t >= ZAP ? 0 : prog(t, word('charge', 3), E('charge'));
        const items = Array.from({ length: 14 }).map((_, i) => {
          const x = -230 + (i % 7) * 76;
          const y = -110 + Math.floor(i / 7) * 80;
          return { x: x + Math.sin(t * (5 + i) + i) * amp * 0.6, y: y + Math.sin(t * (7 + (i % 3)) + i * 2) * amp, ice: i % 2 === 0 };
        });
        const zapB = boltLife(t, ZAP, 0.9);
        const bg = boltLife(t, BOLT_G, 0.8);
        const bc = boltLife(t, BOLT_C, 0.8);
        return (
          <g>
            <rect x={-PW / 2} y={-PH / 2} width={PW} height={PH} fill="#c9e7ff" />
            <rect x={-PW / 2} y={PH / 2 - 60} width={PW} height={60} fill="#8ac926" />
            <g transform="translate(-70,-70)">
              <Cloud w={680} fill="#a99bd6" glow={zapB ? 1 - zapB.fade : 0} />
              {t >= S('inside') - 0.1 && items.map((it, i) => (
                <g key={i} transform={`translate(${it.x},${it.y}) scale(${popIn(t, S('inside') + i * 0.06)})`}>{it.ice ? <Ice s={0.9} /> : <Drop s={0.9} />}</g>
              ))}
              {charge > 0 && Array.from({ length: 6 }).map((_, i) => (
                <g key={i} opacity={charge * (0.5 + 0.5 * Math.sin(t * 9 + i * 2))} transform={`translate(${-220 + i * 90},${30 + (i % 2) * 20})`}>
                  <Bolt d={zig(0, -16, 6, 16, 3, 6)} w={4} />
                </g>
              ))}
            </g>
            {/* the electricity meter */}
            {t >= word('charge', 3) - 0.2 && (
              <g transform={`translate(${PW / 2 - 70},-20) scale(${popIn(t, word('charge', 3) - 0.2)})`}>
                <rect x={-34} y={-150} width={68} height={300} rx={18} fill="#ffffff" {...kst(6)} />
                <rect x={-22} y={-138 + 276 * (1 - charge)} width={44} height={276 * charge} rx={12} fill="#ffd23f" />
                <path d="M 6,-40 L -14,8 L 2,8 L -6,44 L 16,-6 L 0,-6 Z" fill="#ffffff" stroke={KINK} strokeWidth={4} strokeLinejoin="round" />
              </g>
            )}
            {zapB && <Bolt d={zig(-60, -10, 10, PH / 2 - 50, 6, 34, 1)} p={zapB.p} fade={zapB.fade} />}
            {bg && <Bolt d={zig(-140, -10, -100, PH / 2 - 50, 6, 28, 2)} p={bg.p} fade={bg.fade} />}
            {t >= BOLT_C - 0.5 && <g transform={`translate(300,-170) scale(${popIn(t, BOLT_C - 0.5) * 0.9})`}><Cloud w={260} fill="#a99bd6" /></g>}
            {bc && <Bolt d={zig(120, -110, 240, -160, 5, 18, 3)} p={bc.p} fade={bc.fade} w={10} />}
          </g>
        );
      }
      case 'shape':
        return (
          <g>
            <rect x={-PW / 2} y={-PH / 2} width={PW} height={PH} fill="#fff8e7" />
            <g transform={`translate(-210,-10) scale(${popIn(t, m0 + 0.1)})`}>
              <Card w={320} h={380} label="STRAIGHT" color="#4cc9f0"><rect x={-12} y={-150} width={24} height={230} rx={12} fill="#ffd23f" {...kst(5)} /></Card>
            </g>
            <g transform={`translate(210,-10) scale(${popIn(t, m0 + 0.3) * (t >= S('shape_a') ? 1.08 : 1)})`}>
              <Card w={320} h={380} label="ZIGZAG" color="#ffca3a"><Bolt d={zig(-40, -150, 30, 80, 5, 50)} w={9} p={t >= S('shape_a') ? prog(t, word('shape_a', 4), word('shape_a', 9)) || 1 : 1} /></Card>
            </g>
            <AnswerMark t={t} at={S('shape_a') - 0.2} ok={false} x={-90} y={-160} size={0.6} />
            <AnswerMark t={t} at={S('shape_a') + 0.3} ok x={330} y={-160} size={0.6} />
          </g>
        );
      case 'race': {
        const lp = EASE_OUT(prog(t, RACE, RACE + 0.6));
        const sp = prog(t, SND0, SND0 + 4.4);
        return (
          <g>
            <rect x={-PW / 2} y={-PH / 2} width={PW} height={PH} fill="#fff8e7" />
            {[-90, 100].map((y, i) => <rect key={y} x={-380} y={y - 46} width={760} height={92} rx={46} fill={i ? '#ffd6a5' : '#bde0fe'} {...kst(5)} />)}
            <rect x={330} y={-170} width={16} height={340} fill={KINK} />
            {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={346} y={-170 + i * 28} width={28} height={28} fill={i % 2 ? '#ffffff' : KINK} />)}
            <text x={-370} y={-160} fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill="#1982c4">LIGHT</text>
            <text x={-370} y={196} fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill="#e8590c">SOUND</text>
            <g transform={`translate(${-320 + 610 * lp},-90)`}><Bolt d={zig(-14, -36, 14, 36, 3, 14)} w={8} /></g>
            {lp > 0 && lp < 1 && <MotionLines t={t} from={RACE} to={RACE + 0.6} x={-320 + 610 * lp - 60} y={-90} dir={180} n={3} len={90} spread={50} />}
            <g transform={`translate(${-310 + 590 * sp},100) rotate(${Math.sin(t * 6) * 4})`}>
              <text textAnchor="middle" y={18} fontFamily={FONT_TOON} fontWeight={700} fontSize={52} fill="#ff924c" stroke={KINK} strokeWidth={6} paintOrder="stroke">BOOM</text>
            </g>
            {t >= RACE + 0.6 && <g transform={`translate(240,-90) scale(${popIn(t, RACE + 0.6)})`}><text textAnchor="middle" y={-50} fontFamily={FONT_TOON} fontWeight={700} fontSize={48} fill="#52b788" stroke={KINK} strokeWidth={6} paintOrder="stroke">1st!</text></g>}
          </g>
        );
      }
      case 'count': {
        const n = t >= S('c3') ? 3 : t >= S('c2') ? 2 : t >= S('c1') ? 1 : 0;
        const fl = boltLife(t, S('c0') - 0.05, 0.4);
        const boom = within(t, S('boom') - 0.05, S('far'));
        return (
          <g>
            <rect x={-PW / 2} y={-PH / 2} width={PW} height={PH} fill="#8e9ad6" />
            <rect x={-PW / 2} y={PH / 2 - 60} width={PW} height={60} fill="#5f9c5a" />
            <g transform={`translate(-300,${PH / 2 - 60}) scale(0.55)`}><g transform="translate(0,-70)"><House /></g></g>
            <g transform="translate(250,-150)"><Cloud w={300} fill="#7d6fb0" glow={fl ? 1 - fl.fade : 0} /></g>
            {fl && <Bolt d={zig(250, -110, 290, PH / 2 - 60, 5, 20, 4)} p={fl.p} fade={fl.fade} w={8} />}
            {n > 0 && <g key={n} transform={`translate(0,-10) scale(${popIn(t, S(n === 1 ? 'c1' : n === 2 ? 'c2' : 'c3'))})`}>
              <text textAnchor="middle" y={70} fontFamily={FONT_TOON} fontWeight={700} fontSize={220} fill={['#ff595e', '#ff924c', '#ffca3a'][n - 1]} stroke={KINK} strokeWidth={14} paintOrder="stroke">{n}</text>
            </g>}
            {boom && <g transform={`translate(250,-20) scale(${popIn(t, S('boom') - 0.05)})`}><text textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={90} fill="#ff924c" stroke={KINK} strokeWidth={10} paintOrder="stroke">BOOM!</text></g>}
            {t >= S('far') && (
              <g opacity={prog(t, S('far'), S('far') + 0.4)}>
                <path d={`M -240,150 L 180,150 M 150,128 L 186,150 L 150,172`} fill="none" stroke="#ffffff" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
                <text x={-30} y={130} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={56} fill="#ffffff" stroke={KINK} strokeWidth={6} paintOrder="stroke">3 = FAR</text>
              </g>
            )}
          </g>
        );
      }
      case 'hot':
        return (
          <g>
            <rect x={-PW / 2} y={-PH / 2} width={PW} height={PH} fill="#fff1e6" />
            <g transform="translate(-170,30)">
              <Thermo fill={0.12 + 0.3 * prog(t, word('wow', 7), word('wow', 7) + 1.2)} c="#ff924c" />
              <g transform="translate(0,-260) scale(0.6)"><Sun t={t} /></g>
            </g>
            <g transform="translate(170,30)">
              <Thermo fill={0.12 + 0.84 * prog(t, word('wow', 7) + 0.8, word('wow', 7) + 2.4)} c="#ff595e" />
              <g transform="translate(0,-260)"><Bolt d={zig(-14, -50, 14, 50, 3, 16)} w={8} /></g>
            </g>
            {t >= word('wow', 7) + 2.4 && <g transform={`translate(330,-140) scale(${popIn(t, word('wow', 7) + 2.4)})`}><text textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={70} fill="#ff595e" stroke={KINK} strokeWidth={8} paintOrder="stroke">HOT!</text></g>}
          </g>
        );
      case 'earth':
        return (
          <g>
            <rect x={-PW / 2} y={-PH / 2} width={PW} height={PH} fill="#1d1a4a" />
            {Array.from({ length: 30 }).map((_, i) => <circle key={i} cx={-PW / 2 + ((i * 263) % PW)} cy={-PH / 2 + ((i * 131) % PH)} r={2 + (i % 3)} fill="#ffffff" opacity={0.4 + 0.4 * Math.sin(t * 2 + i)} />)}
            <g transform={`scale(${popIn(t, m0 + 0.1)})`}><Earth t={t} /></g>
            {t >= S('wow2') + 0.3 && Array.from({ length: 12 }).map((_, i) => {
              const cyc = 1.1;
              const ph = ((t - S('wow2') + i * 0.37) % cyc) / cyc;
              if (ph > 0.3) return null;
              const a = i * 2.4 + Math.floor((t - S('wow2') + i * 0.37) / cyc) * 1.3;
              return <g key={i} transform={`translate(${Math.cos(a) * 140},${Math.sin(a) * 140}) scale(${1 - ph * 2})`}><Bolt d={zig(-6, -20, 6, 20, 3, 6)} w={4} /></g>;
            })}
          </g>
        );
      case 'g1':
        return (
          <g>
            <rect x={-PW / 2} y={-PH / 2} width={PW} height={PH} fill="#fff8e7" />
            <g transform={`translate(-210,-10) scale(${popIn(t, m0 + 0.1)})`}><Card w={320} h={380} label="TREE" color="#52b788"><g transform="translate(0,20) scale(0.95)"><Tree /></g></Card></g>
            <g transform={`translate(210,-10) scale(${popIn(t, m0 + 0.3) * (t >= word('g1_a', 11) ? 1.08 : 1)})`}><Card w={320} h={380} label="HOUSE" color="#ff6fa5"><g transform="translate(0,30) scale(0.95)"><House /></g></Card></g>
            <AnswerMark t={t} at={S('g1_a')} ok={false} x={-90} y={-160} size={0.6} />
            <AnswerMark t={t} at={word('g1_a', 11)} ok x={330} y={-160} size={0.6} />
          </g>
        );
      case 'g2':
        return (
          <g>
            <rect x={-PW / 2} y={-PH / 2} width={PW} height={PH} fill="#fff8e7" />
            <g transform={`translate(-210,-10) scale(${popIn(t, m0 + 0.1)})`}>
              <Card w={320} h={380} label="POOL" color="#4cc9f0">
                <Vol kind="slope"><rect x={-120} y={-30} width={240} height={110} rx={30} fill="#4cc9f0" {...kst(6)} /></Vol>
                {[0, 1, 2].map((i) => <path key={i} d={`M ${-90 + i * 60},${10 + Math.sin(t * 3 + i) * 6} q 15,-12 30,0`} fill="none" stroke="#ffffff" strokeWidth={6} />)}
                <g transform="translate(40,-110) scale(0.35)"><Cloud w={500} fill="#7d6fb0" /></g>
              </Card>
            </g>
            <g transform={`translate(210,-10) scale(${popIn(t, m0 + 0.3) * (t >= S('g2_a') ? 1.08 : 1)})`}><Card w={320} h={380} label="INSIDE" color="#ff6fa5"><g transform="translate(0,30) scale(0.95)"><House /></g></Card></g>
            <AnswerMark t={t} at={S('g2_a')} ok={false} x={-90} y={-160} size={0.6} />
            <AnswerMark t={t} at={word('g2_a', 8)} ok x={330} y={-160} size={0.6} />
          </g>
        );
      default: {
        // the remember round: one picture per question
        const r = mode;
        return (
          <g>
            <rect x={-PW / 2} y={-PH / 2} width={PW} height={PH} fill="#fff8e7" />
            <g transform={`scale(${popIn(t, m0 + 0.1)})`}>
              {r === 'r1' && <g><g transform="translate(-60,-80)"><Cloud w={420} fill="#a99bd6" /></g><Bolt d={zig(-60, -20, 0, 200, 6, 30)} /></g>}
              {r === 'r2' && <g>
                <g transform="translate(-180,0)"><rect x={-12} y={-150} width={24} height={300} rx={12} fill="#ffd23f" {...kst(5)} /></g>
                <g transform="translate(180,0)"><Bolt d={zig(-30, -150, 30, 150, 6, 50)} w={9} /></g>
                <text x={0} y={30} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={90} fill="#adb5bd">?</text>
              </g>}
              {r === 'r3' && <g>
                <g transform="translate(-180,-20)"><Bolt d={zig(-20, -110, 20, 110, 5, 26)} w={10} /></g>
                <text x={180} y={20} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={110} fill="#ff924c" stroke={KINK} strokeWidth={10} paintOrder="stroke">BOOM</text>
                <text x={0} y={20} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={90} fill="#adb5bd">?</text>
              </g>}
              {r === 'r4' && <g>
                <g transform="translate(-160,-30) scale(1.4)"><Balloon c="#ff6fa5" /></g>
                <g transform="translate(160,20)">
                  <Vol><circle r={110} fill={BOBO_HERO.fur} {...kst(6)} /></Vol>
                  {Array.from({ length: 13 }).map((_, i) => {
                    const a = (-170 + i * 13) * (Math.PI / 180);
                    return <path key={i} d={zig(Math.cos(a) * 100, Math.sin(a) * 100, Math.cos(a) * 170, Math.sin(a) * 170, 3, 8, i)} fill="none" stroke={BOBO_HERO.fur} strokeWidth={10} strokeLinecap="round" />;
                  })}
                  <text y={30} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={90} fill="#ffffff">?</text>
                </g>
              </g>}
              {r === 'r5' && <g>
                <g transform="translate(-180,-120) scale(0.5)"><Cloud w={600} fill="#7d6fb0" /></g>
                <g transform="translate(150,60)"><House /></g>
                <text x={-180} y={140} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={70} fill="#ff924c" stroke={KINK} strokeWidth={8} paintOrder="stroke">ROAR!</text>
              </g>}
            </g>
          </g>
        );
      }
    }
  })();
  return (
    <g transform={`translate(${PX},${PY}) scale(${sc})`}>
      <defs><clipPath id="d68scr"><rect x={-PW / 2} y={-PH / 2} width={PW} height={PH} rx={30} /></clipPath></defs>
      <rect x={-PW / 2 - 22} y={-PH / 2 - 22} width={PW + 44} height={PH + 44} rx={44} fill="#b8a4e3" {...kst(8)} />
      <g clipPath="url(#d68scr)">{inner}</g>
      <rect x={-PW / 2} y={-PH / 2} width={PW} height={PH} rx={30} fill="none" {...kst(6)} />
    </g>
  );
};

// the stormy sky over the rainy street
const StormSky: React.FC<{ t: number }> = ({ t }) => {
  const fl = FLASHES.filter((a) => a < LAB0).find((a) => within(t, a, a + 0.5));
  const glow = fl !== undefined ? 1 - prog(t, fl, fl + 0.5) : 0;
  const bolt = fl !== undefined ? boltLife(t, fl, 0.3) : null;
  const bx = fl !== undefined ? 700 + ((fl * 997) % 700) : 0;
  return (
    <g>
      <defs>
        <linearGradient id="d68sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f3570" stopOpacity={0.92} />
          <stop offset="0.6" stopColor="#5e5596" stopOpacity={0.7} />
          <stop offset="1" stopColor="#6c63a6" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect width={W} height={620} fill="url(#d68sky)" />
      <rect width={W} height={620} fill="#fff8c4" opacity={glow * 0.22} />
      {[[220, 120, 640], [760, 70, 760], [1330, 130, 700], [1800, 90, 520], [1060, 330, 820], [1500, 300, 560]].map(([x, y, w], i) => (
        <g key={i} transform={`translate(${x + Math.sin(t * 0.2 + i) * 12},${y})`}><Cloud w={w} fill={i % 2 ? '#7d6fb0' : '#8a7dbd'} glow={glow} /></g>
      ))}
      {bolt && <Bolt d={zig(bx, 400, bx + 70, 640, 6, 34, fl)} p={bolt.p} fade={bolt.fade} />}
    </g>
  );
};

export default function KidsScience068() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const shake = shakeOf(t, HITS);
  const inLab = t >= LAB0;
  const place = inLab ? LAB : STORM;
  const chant = hopAt(t, CHANT_HOPS, { h: 50 });
  const yay = hopAt(t, YAY_HOPS, { h: 80 });
  const hop = chant.hop > 0 || chant.squash !== 0 ? chant : yay;

  // positions
  const s = inLab ? LS : KS;
  const sb = inLab ? LBS : BS;
  const mW = inLab ? walkPath(t, MILA_LAB, 120 * s) : runAt(t, XS.mila, 0.15);
  const lW = inLab ? { x: XL.leo, walking: false, walk: 0, lean: 0 } : runAt(t, XS.leo, 0);
  const bW = inLab ? walkPath(t, BOBO_LAB, 140 * sb) : runAt(t, XS.bobo, 0.3);
  const hW = inLab ? { x: XL.hoot, walking: false, walk: 0, lean: 0 } : runAt(t, XS.hoot, 0.45);
  const yK = (x: number, sc: number) => yAt(place, x, sc);
  const bY = yK(bW.x, sb);
  const [bfx, bfy] = critterFaceAt(bW.x, bY, sb);

  // Bobo's balloon: appears → rubbed on his head → let go → sticks to the wall
  const WALL: [number, number] = [790, 330];
  const balloonOn = within(t, BALLOON_IN, S('q3') - 0.3);
  const rubbing = within(t, RUB0, E('rub_b'));
  const toWall = prog(t, word('stick', 1), LETGO + 0.6);
  const headB: [number, number] = [bfx + 150 * sb + (rubbing ? Math.sin(t * 16) * 26 : 0), bfy - 120 * sb + (rubbing ? Math.cos(t * 16) * 18 : 0)];
  const bal: [number, number] = t < word('stick', 1) ? headB : [headB[0] + (WALL[0] - headB[0]) * EASE_OUT(toWall), headB[1] + (WALL[1] - headB[1]) * EASE_OUT(toWall) + (t > LETGO + 0.6 ? Math.sin(t * 2) * 4 : 0)];
  const poofOn = within(t, POOF, S('q3'));
  const boboArms: CArm | ReturnType<typeof poseAt<CArm>> = rubbing ? { a: 140 + Math.sin(t * 16) * 22 } : poseAt(t, BOBO_A);

  const kidsLook: [number, number] = inLab ? [0.6, -0.25] : t < E('open') + 0.5 ? [0.2, -0.9] : [0, -0.1];

  return (
    <>
      <ActionStage cam={cam} shake={shake} blur={cam.blur}>
        {!inLab ? (
          <g>
            <Backdrop place={STORM} w={W} h={H} t={t} fx={['rain']} dim={0.4} />
            <StormSky t={t} />
          </g>
        ) : (
          <Backdrop place={LAB} w={W} h={H} t={t} fx={false} />
        )}
        {inLab && <Screen t={t} />}
        {/* the balloon on the wall + the door-handle snap */}
        {balloonOn && (
          <g transform={`translate(${bal[0]},${bal[1]}) rotate(${t < LETGO ? -15 : Math.sin(t * 2) * 3})`}>
            <Balloon c="#ff6fa5" />
            {t > LETGO + 0.6 && [0, 1, 2].map((i) => (
              <path key={i} d={zig(-80 + i * 80, -90, -70 + i * 80, -60, 3, 6, i)} fill="none" stroke="#ffd23f" strokeWidth={5} opacity={0.5 + 0.5 * Math.sin(t * 8 + i)} />
            ))}
          </g>
        )}
        {within(t, S('snap') - 0.2, S('q3') - 0.3) && (
          <g transform={`translate(1180,360) scale(${popIn(t, S('snap') - 0.2) * 0.8})`}>
            <Door spark={within(t, word('snap', 13), word('snap', 13) + 0.6) ? 1 : 0} />
          </g>
        )}
        <PlaceLight place={place}>
          {/* Hoot */}
          {hW.x < W + 200 && (
            <Critter spec={HOOT_HERO} x={hW.x} y={yK(hW.x, inLab ? LS + 0.05 : HS)} scale={inLab ? LS + 0.05 : HS} expr={exprAt(t, HOOT_E)} look={inLab ? [-0.6, -0.2] : [-0.3, -0.3]}
              mouth={lipSync(VO, 'hoot', t)} armL={poseAt(t, HOOT_A)} armR={poseAt(t, HOOT_R)}
              facing={-1} walking={hW.walking} walk={hW.walk} hop={hop.hop} squash={hop.squash} />
          )}
          {/* Bobo */}
          {bW.x < W + 200 && (
            <Critter spec={BOBO_HERO} x={bW.x} y={bY} scale={sb} expr={exprAt(t, BOBO_E)} look={inLab ? (bW.walking ? [-0.8, 0] : [-0.5, -0.2]) : [-0.2, -0.4]}
              mouth={lipSync(VO, 'bobo', t)} armL={boboArms} armR={rubbing ? { a: 30 } : boboArms} walking={bW.walking} walk={bW.walk}
              facing={inLab && bW.walking && t > S('q3') - 0.3 ? 1 : -1} hop={hop.hop} squash={hop.squash} />
          )}
          {poofOn && (
            <g opacity={prog(t, POOF, POOF + 0.2)}>
              {Array.from({ length: 15 }).map((_, i) => {
                const a = (-172 + i * 12) * (Math.PI / 180);
                const r0 = 150 * sb;
                const r1 = (215 + (i % 2) * 18) * sb + Math.sin(t * 9 + i) * 4;
                return <path key={i} d={zig(bfx + Math.cos(a) * r0, bfy + Math.sin(a) * r0, bfx + Math.cos(a) * r1, bfy + Math.sin(a) * r1, 3, 6, i)}
                  fill="none" stroke={BOBO_HERO.fur} strokeWidth={9} strokeLinecap="round" />;
              })}
            </g>
          )}
          {/* Leo */}
          {lW.x < W + 200 && (
            <Kid spec={LEO_HERO} x={lW.x} y={yK(lW.x, s)} scale={s} expr={exprAt(t, LEO_E)} look={kidsLook} mouth={lipSync(VO, 'leo', t)}
              armL={poseAt(t, LEO_L)} armR={poseAt(t, LEO_R)} legs={lW.walking ? 'walk' : 'stand'} walk={lW.walk} lean={lW.lean}
              hop={hop.hop} squash={hop.squash} />
          )}
          {/* Mila */}
          {mW.x < W + 200 && (
            <Kid spec={MILA_HERO} x={mW.x} y={yK(mW.x, s)} scale={s} expr={exprAt(t, MILA_E)} look={mW.walking ? [0.8, 0] : kidsLook} mouth={lipSync(VO, 'mila', t)}
              armL={poseAt(t, MILA_L)} armR={poseAt(t, MILA_R)} fingersR={within(t, S('c1'), S('far') + 2) ? (t >= S('c3') ? 3 : t >= S('c2') ? 2 : 1) : 0}
              legs={mW.walking ? 'walk' : 'stand'} walk={mW.walk} lean={mW.lean} hop={hop.hop} squash={hop.squash} />
          )}
        </PlaceLight>
        {/* Leo's wrong guess: a dragon with a camera */}
        {within(t, word('guess', 2), S('good') + 1.2) && (
          <g transform={`translate(${XS.leo + 300},${sFace(XS.leo) - 150}) scale(${popIn(t, word('guess', 2)) * 0.75})`}>
            <Bubble x={0} y={0} w={380} h={280} tx={-150} ty={220}>
              <g transform="translate(0,10)"><Camera /></g>
              {within(t, word('guess', 9), word('guess', 9) + 0.5) && <circle cx={0} cy={10} r={120} fill="#fff59d" opacity={0.6 * (1 - prog(t, word('guess', 9), word('guess', 9) + 0.5))} />}
            </Bubble>
          </g>
        )}
        {/* FX */}
        <ImpactStar t={t} at={word('rumble', 2)} x={XS.bobo + 120} y={yAt(STORM, XS.bobo, BS) - 560} s={0.7} text="BOOM!" />
        <MotionLines t={t} from={RUN0} to={RUN0 + 1.8} x={1100} y={yAt(STORM, 1000, KS) - 200} dir={180} n={5} len={200} spread={260} />
        <StageWord t={t} at={word('rub_b', 0)} until={E('rub_b') + 0.2} text="RUB, RUB, RUB!" x={960} y={bfy - 300} size={80} color="#ff6fa5" rot={-5} />
        <StageWord t={t} at={POOF} until={POOF + 1.4} text="POOF!" x={bfx + 220} y={bfy - 200} size={100} color="#ffca3a" rot={6} />
        <StageWord t={t} at={LETGO + 0.6} until={LETGO + 2.2} text="STUCK!" x={WALL[0]} y={WALL[1] - 170} size={80} color="#4cc9f0" rot={-4} />
        <StageWord t={t} at={word('snap', 13)} until={word('snap', 13) + 1.2} text="SNAP!" x={1180} y={140} size={80} color="#ffca3a" rot={5} />
        <Reaction kind="!" t={t} at={word('rumble', 2)} until={E('rumble') + 0.4} x={XS.bobo} y={yAt(STORM, XS.bobo, BS) - 500} s={0.6} />
        <Reaction kind="?" t={t} at={S('safe') + 1.6} until={E('safe')} x={XL.mila} y={yAt(LAB, XL.mila, LS) - 470} s={0.55} />
        <Reaction kind="stars" t={t} at={POOF} until={E('poof') + 0.4} x={bfx} y={bfy - 230} s={0.6} />
        <Reaction kind="sweat" t={t} at={S('g3')} until={HUG0 + 0.8} x={XL.bobo + 70} y={yAt(LAB, XL.bobo, LBS) - 400} s={0.6} />
        <Reaction kind="heart" t={t} at={HUG0 + 1.3} until={SUNNY - 0.3} x={XL.bobo - 95} y={yAt(LAB, XL.bobo, LBS) - 470} s={0.7} />
        <Reaction kind="idea" t={t} at={S('wow_leo')} until={E('wow_leo') + 0.3} x={XL.leo} y={yAt(LAB, XL.leo, LS) - 470} s={0.55} />
      </ActionStage>

      {/* screen-space */}
      <PopText t={t} at={0.5} until={S('guess') - 0.1} text="WHAT IS LIGHTNING?" y={130} size={110} color="#ffe066" />
      <PopText t={t} at={word('good', 10)} until={S('word') - 0.05} text="A GIANT SPARK!" y={130} size={110} color="#ffe066" />
      <PopText t={t} at={S('word')} until={S('rumble') - 0.1} text="⚡ ELECTRICITY ⚡" y={130} size={110} color="#ffe066" />
      <PopText t={t} at={word('rule', 9)} until={LAB0} text="WHEN THUNDER ROARS, GO INDOORS!" y={130} size={76} color="#ffffff" />
      <PopText t={t} at={S('three')} until={S('q1') - 0.1} text="3 QUESTIONS" y={110} size={100} color="#ffca3a" />
      <PopText t={t} at={S('q1') + 0.1} until={S('bump_turn') - 0.1} text="1  INSIDE A STORM CLOUD" y={90} size={70} color="#ffffff" />
      <PopText t={t} at={S('bump_turn')} until={S('charge') - 0.1} text="BUMP! BUMP! BUMP!" y={90} size={90} color="#4cc9f0" />
      <PopText t={t} at={word('zap', 6)} until={S('path') - 0.1} text="ZAP! LIGHTNING!" y={90} size={100} color="#ffe066" />
      <PopText t={t} at={S('shape_q')} until={S('shape_a') - 0.1} text="STRAIGHT OR ZIGZAG?" y={90} size={84} color="#ffffff" />
      <ThinkTimer t={t} from={beat(E('shape_q') + 0.1)} to={S('shape_leo') - 0.1} x={1780} y={180} r={86} />
      <PopText t={t} at={S('shape_a') + 0.3} until={S('q2') - 0.1} text="ZIGZAG!" y={90} size={120} color="#ffe066" />
      <PopText t={t} at={S('q2') + 0.1} until={S('rub') - 0.1} text="2  A BABY SPARK" y={110} size={84} color="#ff6fa5" />
      <PopText t={t} at={word('yes', 4)} until={S('rub') - 0.1} text="with a grown-up" y={220} size={60} color="#ffffff" rot={2} />
      <PopText t={t} at={S('static')} until={S('snap') - 0.1} text="⚡ ELECTRICITY ⚡" y={110} size={100} color="#ffe066" />
      <PopText t={t} at={S('q3') + 0.1} until={S('race') + 0.4} text="3  FLASH FIRST, BOOM AFTER?" y={90} size={70} color="#ffffff" />
      <PopText t={t} at={word('race', 6)} until={S('sound') - 0.1} text="LIGHT IS SUPER FAST!" y={90} size={90} color="#4cc9f0" />
      <PopText t={t} at={S('sound')} until={S('count_how') - 0.1} text="SOUND IS SLOWER" y={90} size={90} color="#ff924c" />
      <PopText t={t} at={S('still')} until={S('wow') - 0.1} text="STAY INSIDE!" y={90} size={110} color="#ff6fa5" />
      <PopText t={t} at={S('wow')} until={S('wow2') - 0.1} text="WOW FACT!" y={90} size={110} color="#ffca3a" />
      <PopText t={t} at={S('game')} until={S('g1') - 0.1} text="STORM SAFETY GAME!" y={110} size={100} color="#ffca3a" />
      {(['g1', 'g2', 'g3'] as const).map((g, i) => (
        <ThinkTimer key={g} t={t} from={beat(E(g) + 0.1)} to={S((['g1_leo', 'g2_a', 'g3_a'] as const)[i]) - 0.1} x={1780} y={180} r={86} />
      ))}
      <PopText t={t} at={S('g1') + 0.1} until={S('g1_leo') - 0.1} text="TREE OR HOUSE?" y={90} size={100} color="#ffffff" />
      <PopText t={t} at={word('g1_a', 11)} until={S('g2') - 0.1} text="INSIDE A HOUSE!" y={90} size={100} color="#ff6fa5" />
      <PopText t={t} at={S('g2_a')} until={S('g3') - 0.1} text="OUT OF THE WATER!" y={90} size={100} color="#4cc9f0" />
      <PopText t={t} at={word('g3_a', 4)} until={SUNNY - 0.1} text="A BIG HUG!" y={110} size={110} color="#ff6fa5" />
      <PopText t={t} at={SUNNY + 0.3} until={S('rem') - 0.1} text="THE STORM IS OVER!" y={90} size={96} color="#ffca3a" />
      <PopText t={t} at={S('rem')} until={S('rq1') - 0.1} text="LET'S REMEMBER!" y={110} size={110} color="#ffca3a" />
      {(['rq1', 'rq2', 'rq3', 'rq4', 'rq5'] as const).map((q, i) => (
        <ThinkTimer key={q} t={t} from={beat(E(q) + 0.1)} to={S((['ra1', 'ra2', 'ra3', 'ra4', 'ra5'] as const)[i]) - 0.1} x={1780} y={180} r={86} />
      ))}
      <PopText t={t} at={S('ra1')} until={S('rq2') - 0.2} text="A GIANT SPARK!" y={90} size={110} color="#ffe066" />
      <PopText t={t} at={S('ra2')} until={S('rq3') - 0.2} text="ZIGZAG!" y={90} size={130} color="#ffe066" />
      <PopText t={t} at={S('ra3')} until={S('rq4') - 0.2} text="THE FLASH!" y={90} size={120} color="#4cc9f0" />
      <PopText t={t} at={S('ra4')} until={S('rq5') - 0.2} text="POOF! IT STOOD UP!" y={90} size={100} color="#ff6fa5" />
      <PopText t={t} at={S('ra5')} until={S('chant') - 0.2} text="GO INDOORS!" y={90} size={130} color="#ffca3a" />
      <PopText t={t} at={S('ch1')} until={S('ch2') - 0.05} text="LIGHTNING IS A SPARK!" y={110} size={96} color="#ffe066" />
      <PopText t={t} at={S('ch2')} until={S('ch3') - 0.05} text="THE FLASH COMES FIRST!" y={110} size={96} color="#4cc9f0" />
      <PopText t={t} at={S('ch3')} until={S('ch4') - 0.05} text="THE BOOM COMES LAST!" y={110} size={96} color="#ff924c" />
      <PopText t={t} at={S('ch4')} until={S('ch_turn') - 0.1} text="GO INDOORS!" y={110} size={130} color="#ff6fa5" />
      <PopText t={t} at={S('ch_turn')} until={S('bye') - 0.1} text="YOUR TURN!" y={110} size={120} color="#ffffff" />
      <PopText t={t} at={S('bye')} until={END_IRIS} text="SEE YOU NEXT TIME!" y={110} size={100} color="#ffca3a" />
      <Confetti t={t} at={E('zap_name') + 0.1} y={420} />
      <Confetti t={t} at={LETGO + 0.6} y={420} />
      <Confetti t={t} at={E('g3_bobo') + 0.1} y={420} />
      <Confetti t={t} at={S('ch4')} y={420} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <StarWipe t={t} at={END_IRIS} dur={0.5} hold={5} color="#4a3f7a" x={W / 2} y={H * 0.45} />
    </>
  );
}
