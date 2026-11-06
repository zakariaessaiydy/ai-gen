// TINY SPARKS · Day 72 · 🔢 Numbers & Math #11 — "Learn Number 1" (LONG 16:9)
// kids-shorts/tiny-sparks/numbers/day-072-learn-number-1. Cues from VO via K (keys.gen.ts).
// COLD OPEN (no ident): in the art room, Spark Girl holds up ONE finger at frame 0 — "Look! One finger! One!" → the big
// numeral 1 pops on the easel ("this is how we write it") → ONE premise line → tall + straight like a stick → say it ×2 →
// your turn → show one finger → PAINT a 1 (start at the top, straight down — the brush draws it) → draw it in the air →
// Leo paints a wiggly worm ✗ → again, straight ✓ → things that come in ONE (sun · moon · nose (think) · mouth · Bobo's
// tail (think) · a cake with one candle — Bobo blows) → French: un → FIND THE 1 game (Leo ✗ the 7 — "seven has a hat") ·
// one or many (one duck · Leo ✗ "one!" → count the 5 balloons) · the plate with one apple (Bobo eats it) → remember (5)
// → the number-one rhyme → next time: number two → bye + star iris.
import React from 'react';
import { Kid, kidFaceAt, type KArm } from '../../lib/kids/kid';
import { Critter, critterFaceAt, type CArm } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, HOOT_HERO, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { Backdrop, PlaceLight, standY } from '../../lib/kids/places';
import { AnswerMark, Apple, Balloon, Confetti, FONT_TOON, KidsCaptions, PopText, RAINBOW, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, Reaction, StageWord, StarWipe, directorCam, hopAt, onBeat, type Shot } from '../../lib/kids/energy';
import { exprAt, lookAt, poseAt, type Keys } from '../../lib/kids/smooth';
import { voKeys, wordHops, type Span } from '../../lib/kids/cues';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsNumbers072', durationInSeconds: 314.1, fps: 30, width: 1920, height: 1080 };

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
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff', narrator_fr: '#4cc9f0' };
const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (EASE_OUT(p) - 1) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};
const beat = (x: number) => onBeat(x, 0);

// ── place + blocking: the easel in the middle, the kids on the left, Bobo + Hoot on the right
const PLACE = 'art-room' as const;
const KS = 0.52;
const CS = 0.54;
const X = { leo: 200, mila: 400, bobo: 1540, hoot: 1750 };
const yAt = (x: number, s: number) => standY(PLACE, x, W, H, { halfW: 150 * s });
const EZ: [number, number] = [960, 410]; // the easel paper centre
const PW = 820;
const PH = 560;

// ── what the easel shows (in time order)
type Panel = 'hand' | 'paint' | 'leo' | 'sun' | 'moon' | 'nose' | 'mouth' | 'tail' | 'cake' | 'fr' | 'gA' | 'gB' | 'gB2' | 'gC' | 'gC2' | 'gD' | 'gE' | 'r6'
  | 'r1' | 'r2' | 'r3' | 'r4' | 'r5' | 'rhyme' | 'two' | 'bye';
const PANELS: [number, Panel][] = [
  [0, 'hand'], [S('draw') - 0.3, 'paint'], [S('leo_draw') - 0.2, 'leo'],
  [S('o_sun') - 0.2, 'sun'], [S('o_moon') - 0.2, 'moon'], [S('o_nose') - 0.2, 'nose'], [S('o_mouth') - 0.2, 'mouth'], [S('o_tail') - 0.2, 'tail'],
  [S('o_cake') - 0.2, 'cake'], [S('fr_q') - 0.2, 'fr'], [S('gA') - 0.3, 'gA'], [S('gB') - 0.3, 'gB'], [S('gB2') - 0.3, 'gB2'], [S('gC') - 0.3, 'gC'], [S('gC2') - 0.3, 'gC2'], [S('gD') - 0.3, 'gD'],
  [S('gE') - 0.3, 'gE'], [S('rq1') - 0.2, 'r1'], [S('rq2') - 0.2, 'r2'], [S('rq3') - 0.2, 'r3'], [S('rq4') - 0.2, 'r4'], [S('rq6') - 0.2, 'r6'], [S('rq5') - 0.2, 'r5'],
  [S('chant') - 0.2, 'rhyme'], [S('next') - 0.2, 'two'], [S('bye') - 0.2, 'bye'],
];
const panelAt = (t: number): [Panel, number] => {
  let p = PANELS[0];
  for (const x of PANELS) if (t >= x[0]) p = x;
  return [p[1], p[0]];
};
const BIG1 = word('n1b', 7); // "Number one!" — the big 1 pops
const PAINT: [number, number] = [word('draw2', 0), E('draw2') - 0.4]; // the brush goes straight down
const PAINT2: [number, number] = [word('draw_again', 3), E('draw_again2') - 0.4]; // once more, slowly
const WIGGLE: [number, number] = [word('leo_draw', 3), E('leo_draw') + 0.5];
const FIX: [number, number] = [word('leo_fix', 2), word('leo_fix', 6)];
const BALLOON_AT = [2, 3, 4, 5, 6].map((i) => word('gD_no', i));
const END_IRIS = E('bye2') + 0.6;

// ── arms, fingers, faces
const BYE: Span<KArm> = [S('bye'), 999, 'wave'];
const RHYME: Span<KArm> = [S('c1'), E('c_turn') + 0.3, 'cheer'];
const MILA_R = voKeys<KArm>(VO, 'mila', 'present', 'down', [
  [0, E('n1') + 0.6, 'count'], [S('fingers'), E('fingers_b') + 0.4, 'count'], [S('draw_turn'), E('draw_turn') + 0.4, 'point'],
  [S('o_sun_c'), E('o_sun_c'), 'point'], [S('o_mouth'), E('o_mouth'), 'cheeks'], [S('o_cake_a'), E('o_cake_a'), 'point'], [S('draw_again2'), E('draw_again2'), 'point'], [S('ra6'), E('ra6'), 'point'],
  [S('gA_no'), E('gA_no'), 'point'], [S('gC_a'), E('gC_a'), 'point'], [S('rq5'), E('ra5') + 0.4, 'count'], RHYME, BYE,
]);
const MILA_L = voKeys<KArm>(VO, null, 'down', 'down', [[S('o_mouth'), E('o_mouth'), 'cheeks'], [S('gE_b'), E('gE_b'), 'cover'], RHYME, BYE]);
const MILA_E = voKeys<KExpr>(VO, 'mila', 'happy', 'smile', [
  [0, E('n1') + 0.4, 'wow'], [S('leo_wig'), E('leo_wig'), 'laugh'], [S('o_mouth'), E('o_mouth') + 0.4, 'laugh'], [S('gE_b'), E('gE_b'), 'laugh'],
  [S('c1'), 999, 'laugh'],
]);
const LEO_R = voKeys<KArm>(VO, 'leo', 'present', 'down', [
  [S('fingers'), E('fingers_b') + 0.6, 'count'], [S('draw_turn'), E('draw_turn') + 0.4, 'point'], [WIGGLE[0] - 0.3, E('leo_draw') + 0.6, { to: [-150, -40] }],
  [FIX[0] - 0.3, FIX[1] + 0.3, { to: [-150, -60] }], [S('o_nose_a'), E('o_nose_a'), 'point'], [S('fr_q'), E('fr_q'), 'think'],
  [S('gA_leo'), E('gA_leo'), 'point'], [S('gB2_a'), E('gB2_a'), 'point'], [S('gD_leo'), E('gD_leo') + 0.3, 'point'], [S('gD_b'), E('gD_b'), 'cheeks'], [S('ra1'), E('ra1'), 'present'],
  [S('rq5'), E('ra5') + 0.4, 'count'], RHYME, BYE,
]);
const LEO_L = voKeys<KArm>(VO, null, 'down', 'down', [[S('leo_wig'), E('leo_wig'), 'cover'], [S('gD_b'), E('gD_b'), 'cheeks'], RHYME, BYE]);
const fingers = (t: number): number => (within(t, 0, E('n1') + 0.6) || within(t, S('fingers'), E('fingers_b') + 0.6) || within(t, S('rq5'), E('ra5') + 0.4) ? 1 : 0);
const LEO_E = voKeys<KExpr>(VO, 'leo', 'happy', 'smile', [
  [S('leo_draw'), E('leo_draw'), 'proud'], [S('leo_wig'), E('leo_wig') + 0.3, 'oops'], [S('leo_yay'), E('leo_yay'), 'laugh'],
  [S('gA_leo'), E('gA_leo'), 'proud'], [E('gA_leo'), S('gA_no') + 0.8, 'oops'], [S('gD_leo'), E('gD_leo'), 'proud'], [E('gD_leo'), E('gD_no'), 'think'],
  [S('gD_b'), E('gD_b') + 0.4, 'surprised'], [S('c1'), 999, 'laugh'],
]);
const BOBO_A = voKeys<CArm>(VO, 'bobo', 'wave', 'down', [
  [S('n1b'), E('n1b'), 'point'], [S('leo_wig'), E('leo_wig'), 'point'], [S('o_moon_c'), E('o_moon_c'), 'wave'], [S('o_cake_b'), E('o_cake_b') + 0.3, 'cheer'],
  [S('gB_a'), E('gB_a'), 'point'], [S('gC2_a'), E('gC2_a'), 'cheer'], [S('gE_a'), E('gE_a'), 'point'], [S('gE_c'), E('gE_c') + 0.6, 'hold'], [S('ra3'), E('ra3'), 'cheer'], [S('c1'), E('c_turn') + 0.3, 'cheer'], [S('bye'), 999, 'wave'],
]);
const BOBO_E = voKeys<KExpr>(VO, 'bobo', 'happy', 'smile', [
  [S('leo_wig'), E('leo_wig'), 'laugh'], [S('o_moon_c'), E('o_moon_c'), 'sleepy'], [S('o_tail_a'), E('o_tail_a'), 'laugh'], [S('o_cake_b'), E('o_cake_b'), 'laugh'],
  [S('gE_a'), E('gE_a'), 'wow'], [S('gE_c'), E('gE_c') + 0.6, 'laugh'], [S('c1'), 999, 'laugh'],
]);
const HOOT_A = voKeys<CArm>(VO, 'hoot', 'point', 'down', [[S('c1'), E('c_turn') + 0.3, 'cheer'], [S('bye'), 999, 'wave']]);
const HOOT_E = voKeys<KExpr>(VO, 'hoot', 'happy', 'smile', [[S('leo_yay'), E('leo_yay'), 'laugh'], [S('c1'), 999, 'laugh']]);
const looks = (base: [number, number]): Keys<[number, number]> => [
  [0, [0, 0]], [E('n1') + 0.4, base], [S('say_turn'), [0, 0]], [E('fingers_b') + 0.4, base], [S('draw_turn'), [0, 0]], [E('draw_turn') + 0.3, base],
  [S('ra5'), [0, 0]], [E('ra5'), base], [S('c_turn'), [0, 0]], [S('next'), base], [S('bye'), [0, 0]],
];
const LOOK_L = looks([0.6, -0.3]);
const LOOK_R = looks([-0.6, -0.3]);
const HOPS = [...wordHops(VO, [K.c1, K.c2, K.c3], 2), S('leo_yay') + 0.2, S('o_cake_b') + 0.2, S('ra5') + 0.2];

// ── camera
const WIDE = { z: 1.0, x: 960, y: 540 };
const EASEL = { z: 1.12, x: 960, y: 470 };
const kFace = (x: number) => kidFaceAt(x, yAt(x, KS), KS)[1] + 80;
const cFace = (x: number) => critterFaceAt(x, yAt(x, CS), CS)[1] + 80;
const MILA_CU = { z: 1.6, x: X.mila + 60, y: kFace(X.mila) };
const LEO_CU = { z: 1.6, x: X.leo + 140, y: kFace(X.leo) };
const BOBO_CU = { z: 1.5, x: X.bobo - 80, y: cFace(X.bobo) };
const SHOTS: Shot[] = [
  { t: 0, ...MILA_CU, move: 'cut', push: 0.012 },
  { t: S('n1b') - 0.1, ...EASEL, move: 'smooth', dur: 0.7, push: 0.01 },
  { t: S('premise') - 0.1, ...WIDE, move: 'smooth', dur: 0.7, push: 0.01 },
  { t: S('look') - 0.1, ...EASEL, move: 'smooth', dur: 0.6, push: 0.012 },
  { t: S('say_turn') - 0.1, ...MILA_CU, move: 'snap' },
  { t: S('fingers') - 0.1, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('fingers_b') - 0.1, ...LEO_CU, move: 'snap' },
  { t: S('draw') - 0.3, ...EASEL, move: 'smooth', dur: 0.6, push: 0.015 },
  { t: S('draw_turn') - 0.1, ...MILA_CU, move: 'snap' },
  { t: S('leo_draw') - 0.2, ...EASEL, move: 'smooth', dur: 0.6 },
  { t: S('leo_wig') - 0.1, ...BOBO_CU, move: 'whip' },
  { t: S('leo_fix') - 0.1, ...EASEL, move: 'whip' },
  { t: S('leo_yay') - 0.1, ...WIDE, move: 'smooth', dur: 0.5 },
  { t: S('ones') - 0.1, ...EASEL, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('o_moon_c') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: S('o_nose') - 0.2, ...EASEL, move: 'smooth', dur: 0.5, push: 0.01 },
  { t: S('o_nose_a') - 0.1, ...LEO_CU, move: 'snap' },
  { t: S('o_mouth') - 0.2, ...MILA_CU, move: 'smooth', dur: 0.5 },
  { t: S('o_tail') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('o_tail_a') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: S('o_cake') - 0.2, ...EASEL, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('o_cake_b') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: S('fr_q') - 0.2, ...LEO_CU, move: 'smooth', dur: 0.5 },
  { t: S('fr') - 0.1, ...EASEL, move: 'snap', push: 0.01 },
  { t: S('game') - 0.2, ...WIDE, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('gA') - 0.3, ...EASEL, move: 'smooth', dur: 0.5, push: 0.01 },
  { t: S('gA_leo') - 0.1, ...LEO_CU, move: 'whip' },
  { t: S('gA_no') - 0.1, ...EASEL, move: 'whip' },
  { t: S('gB') - 0.3, ...EASEL, move: 'cut', push: 0.01 },
  { t: S('gB2') - 0.3, ...EASEL, move: 'cut', push: 0.01 },
  { t: S('gB2_a') - 0.1, ...LEO_CU, move: 'snap' },
  { t: S('gC') - 0.3, ...EASEL, move: 'smooth', dur: 0.5, push: 0.01 },
  { t: S('gC2') - 0.3, ...EASEL, move: 'cut', push: 0.01 },
  { t: S('gC2_a') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: S('gD') - 0.3, ...EASEL, move: 'smooth', dur: 0.5, push: 0.01 },
  { t: S('gD_leo') - 0.1, ...LEO_CU, move: 'snap' },
  { t: S('gD_no') - 0.1, ...EASEL, move: 'smooth', dur: 0.4 },
  { t: S('gE') - 0.3, ...EASEL, move: 'cut', push: 0.01 },
  { t: S('gE_a') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: S('gE_b') - 0.1, ...WIDE, move: 'smooth', dur: 0.5 },
  { t: S('gE_c') - 0.1, ...BOBO_CU, move: 'snap' },
  { t: S('rem') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: S('rq1') - 0.2, ...EASEL, move: 'smooth', dur: 0.5, push: 0.008 },
  { t: S('rq5') - 0.2, ...WIDE, move: 'smooth', dur: 0.5, push: 0.01 },
  { t: S('chant') - 0.2, z: 1.06, x: 960, y: 560, move: 'smooth', dur: 0.6, push: 0.02 },
  { t: S('next') - 0.2, ...EASEL, move: 'smooth', dur: 0.6 },
  { t: S('bye') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
];
SHOTS.sort((a, b) => a.t - b.t);
const PUNCHES = [BIG1, S('gA_no') + 1.0, S('gB_a'), S('gB2_a'), S('gC_a'), S('gC2_a'), S('gD_b'), S('gE_a')];

// ── drawings (easel coords, origin = paper centre)
const STAR = Array.from({ length: 10 }).map((_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5; const r = i % 2 ? 22 : 48; return `${i ? 'L' : 'M'} ${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`; }).join(' ') + ' Z';
const ONE_PATH = 'M -70,-120 L 10,-200 L 10,200'; // the flag, then straight down
const BigOne: React.FC<{ s?: number; c?: string; face?: boolean; t?: number }> = ({ s = 1, c = '#ff595e', face = true, t = 0 }) => (
  <g transform={`scale(${s})`}>
    <Vol><path d="M -80,-130 L 20,-220 L 70,-220 L 70,180 L 120,180 L 120,230 L -60,230 L -60,180 L 10,180 L 10,-120 L -50,-80 Z" fill={c} {...kst(10)} strokeLinejoin="round" /></Vol>
    {face && (
      <g transform={`translate(40,${-30 + Math.sin(t * 3) * 3})`}>
        <ellipse cx={-14} cy={0} rx={7} ry={10} fill={KINK} /><ellipse cx={14} cy={0} rx={7} ry={10} fill={KINK} />
        <circle cx={-12} cy={-4} r={3} fill="#ffffff" /><circle cx={16} cy={-4} r={3} fill="#ffffff" />
        <path d="M -12,22 Q 0,34 12,22" fill="none" {...kst(4)} />
      </g>
    )}
  </g>
);
const Hand1: React.FC = () => (
  <g>
    <Vol tone="skin">
      <rect x={-60} y={-10} width={120} height={130} rx={44} fill="#f7c59f" {...kst(6)} />
      <rect x={-18} y={-170} width={40} height={180} rx={20} fill="#f7c59f" {...kst(6)} />
    </Vol>
    {[-40, -14, 12, 38].map((x, k) => k > 0 && <path key={k} d={`M ${x},10 q 12,-14 24,0`} fill="none" {...kst(4)} />)}
    <path d="M -60,40 q -30,-10 -40,-50 q 10,-14 26,-4 q 14,26 14,54" fill="#f7c59f" {...kst(5)} />
  </g>
);
const Sun: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {Array.from({ length: 12 }).map((_, k) => <rect key={k} x={-8} y={-170} width={16} height={46} rx={8} fill="#ffca3a" transform={`rotate(${k * 30 + t * 12})`} />)}
    <Vol><circle r={110} fill="#ffd23f" {...kst(7)} /></Vol>
    <circle cx={-34} cy={-10} r={11} fill={KINK} /><circle cx={34} cy={-10} r={11} fill={KINK} /><path d="M -30,34 Q 0,58 30,34" fill="none" {...kst(6)} />
  </g>
);
const Moon: React.FC = () => (
  <g>
    <Vol><path d="M 30,-120 A 120,120 0 1 0 90,60 A 96,96 0 1 1 30,-120 Z" fill="#fff3b0" {...kst(7)} /></Vol>
    <path d="M -40,10 Q -30,20 -20,10" fill="none" {...kst(5)} />
  </g>
);
const FaceCard: React.FC<{ ring?: 'nose' | 'mouth'; t: number; at: number }> = ({ ring, t, at }) => (
  <g>
    <Vol tone="skin"><circle r={170} fill="#f7c59f" {...kst(7)} /></Vol>
    <path d="M -170,-30 Q -150,-200 0,-196 Q 150,-200 170,-30 Q 90,-120 -170,-30 Z" fill="#6b4226" {...kst(6)} />
    <circle cx={-60} cy={-10} r={18} fill={KINK} /><circle cx={60} cy={-10} r={18} fill={KINK} />
    <Vol tone="skin"><ellipse cx={0} cy={36} rx={22} ry={18} fill="#f4a582" {...kst(5)} /></Vol>
    <path d="M -50,90 Q 0,130 50,90" fill="none" {...kst(7)} />
    {ring && t >= at && (
      <g transform={`translate(0,${ring === 'nose' ? 36 : 104}) scale(${popIn(t, at)})`}>
        <circle r={ring === 'nose' ? 50 : 70} fill="none" stroke="#ff595e" strokeWidth={10} strokeDasharray="18 12" transform={`rotate(${t * 60})`} />
      </g>
    )}
  </g>
);
const BearBack: React.FC<{ t: number; at: number }> = ({ t, at }) => (
  <g>
    <Vol>
      <circle cx={-90} cy={-170} r={40} fill="#a0663f" {...kst(6)} /><circle cx={90} cy={-170} r={40} fill="#a0663f" {...kst(6)} />
      <circle cx={0} cy={-110} r={110} fill="#a0663f" {...kst(7)} />
      <ellipse cx={0} cy={90} rx={150} ry={140} fill="#a0663f" {...kst(7)} />
    </Vol>
    <rect x={-140} y={-30} width={280} height={40} rx={20} fill="#e63946" {...kst(5)} />
    <g transform={`translate(0,180) rotate(${t >= at ? Math.sin(t * 14) * 18 : 0})`}><Vol><circle r={34} fill="#c98f5f" {...kst(5)} /></Vol></g>
    {t >= at && <circle cx={0} cy={180} r={60} fill="none" stroke="#ff595e" strokeWidth={10} strokeDasharray="18 12" transform={`rotate(${t * 60} 0 180)`} />}
  </g>
);
const Cake: React.FC<{ t: number; out: number }> = ({ t, out }) => (
  <g>
    <Vol><rect x={-200} y={-40} width={400} height={200} rx={30} fill="#ffd6e5" {...kst(7)} /></Vol>
    <path d="M -200,10 Q -160,50 -120,10 Q -80,50 -40,10 Q 0,50 40,10 Q 80,50 120,10 Q 160,50 200,10" fill="none" stroke="#ffffff" strokeWidth={22} />
    {[-140, -70, 0, 70, 140].map((x, k) => <circle key={k} cx={x} cy={100} r={12} fill={RAINBOW[k]} />)}
    <rect x={-14} y={-150} width={28} height={110} rx={10} fill="#4cc9f0" {...kst(5)} />
    {t < out && <path d={`M 0,-210 Q ${22 + Math.sin(t * 9) * 4},-176 0,-158 Q ${-22 + Math.sin(t * 9) * 4},-176 0,-210 Z`} fill="#ffca3a" {...kst(4)} />}
    {t >= out && t < out + 1.2 && <path d={`M 0,-160 q 20,-40 0,-70 q -20,-30 0,-60`} fill="none" stroke="#adb5bd" strokeWidth={8} opacity={1 - prog(t, out, out + 1.2)} />}
  </g>
);
const NumCard: React.FC<{ n: number; x: number; ok?: boolean; at?: number; t: number }> = ({ n, x, t, ok, at = 1e9 }) => (
  <g transform={`translate(${x},0) scale(${ok && t >= at ? 1 + 0.12 * Math.sin(Math.min(1, (t - at) / 0.6) * Math.PI) : 1})`}>
    <rect x={-110} y={-150} width={220} height={300} rx={30} fill="#ffffff" stroke={ok && t >= at ? '#52b788' : KINK} strokeWidth={ok && t >= at ? 14 : 7} />
    <text y={70} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={210} fill={RAINBOW[n % RAINBOW.length]} stroke={KINK} strokeWidth={7} paintOrder="stroke">{n}</text>
  </g>
);
const Duck: React.FC = () => (
  <g>
    <Vol><ellipse cx={0} cy={30} rx={110} ry={70} fill="#ffd23f" {...kst(6)} /><circle cx={-70} cy={-50} r={56} fill="#ffd23f" {...kst(6)} /></Vol>
    <path d="M -120,-46 L -164,-36 L -120,-26 Z" fill="#ff924c" {...kst(4)} /><circle cx={-82} cy={-62} r={9} fill={KINK} />
    <path d="M 10,10 Q 50,0 70,30" fill="none" {...kst(5)} />
  </g>
);
const Plate: React.FC<{ n: number }> = ({ n }) => (
  <g>
    <Vol kind="slope"><ellipse rx={170} ry={70} fill="#ffffff" {...kst(6)} /></Vol>
    <ellipse rx={130} ry={48} fill="none" stroke="#bde0fe" strokeWidth={6} />
    {Array.from({ length: n }).map((_, k) => <g key={k} transform={`translate(${(k - (n - 1) / 2) * 80},-40) scale(0.62)`}><Apple /></g>)}
  </g>
);
const Panel: React.FC<{ p: Panel; t: number; since: number }> = ({ p, t, since }) => {
  switch (p) {
    case 'hand': return (
      <g>
        <g transform={`translate(-170,30) scale(1.1)`}><Hand1 /></g>
        {t >= BIG1 && <g transform={`translate(170,0) scale(${popIn(t, BIG1, 0.45)})`}><BigOne t={t} /></g>}
        {within(t, S('look'), S('say1')) && (
          <g transform={`translate(330,10) rotate(4) scale(${popIn(t, word('look', 7))})`}>
            <Vol kind="tube"><rect x={-16} y={-200} width={32} height={400} rx={14} fill="#8d5a3b" {...kst(5)} /></Vol>
          </g>
        )}
      </g>
    );
    case 'paint': {
      const again = t >= PAINT2[0];
      const p = again ? EASE_INOUT(prog(t, word('draw_again2', 0), PAINT2[1])) : EASE_INOUT(prog(t, PAINT[0], PAINT[1]));
      const flag = again ? prog(t, PAINT2[0], word('draw_again2', 0)) : prog(t, word('draw', 4), PAINT[0]);
      const len = flag * 0.22 + p * 0.78;
      const tip: [number, number] = len < 0.22 ? [-70 + (len / 0.22) * 80, -120 - (len / 0.22) * 80] : [10, -200 + ((len - 0.22) / 0.78) * 400];
      const guide = t >= S('draw_turn') && t < S('draw_again');
      return (
        <g>
          <circle cx={-70} cy={-120} r={22} fill="#52b788" {...kst(4)} />
          <path d={ONE_PATH} fill="none" stroke="#e9ecef" strokeWidth={50} strokeLinecap="round" strokeLinejoin="round" />
          <path d={ONE_PATH} fill="none" stroke="#ff595e" strokeWidth={50} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${len} 2`} />
          {guide && <path d="M 120,-180 L 120,160" fill="none" stroke="#1982c4" strokeWidth={12} strokeDasharray="22 16" markerEnd="" />}
          {guide && <path d="M 96,140 L 120,180 L 144,140" fill="none" stroke="#1982c4" strokeWidth={12} strokeLinecap="round" />}
          {len > 0 && len < 1 && <Brush x={tip[0]} y={tip[1]} c="#ff595e" />}
        </g>
      );
    }
    case 'leo': {
      const w = prog(t, WIGGLE[0], WIGGLE[1]);
      const f = EASE_INOUT(prog(t, FIX[0], FIX[1]));
      const wig = 'M -200,-180 Q -160,-140 -220,-90 Q -280,-40 -200,10 Q -130,60 -220,110 Q -290,160 -200,190';
      const crossed = t >= S('leo_fix');
      return (
        <g>
          <path d={wig} fill="none" stroke="#8ac926" strokeWidth={40} strokeLinecap="round" pathLength={1} strokeDasharray={`${w} 2`} opacity={crossed ? 0.35 : 1} />
          {t >= S('leo_wig') && t < S('leo_fix') && <g transform="translate(-170,-200)"><circle r={10} fill={KINK} /><circle cx={-24} r={10} fill={KINK} /></g>}
          {crossed && <AnswerMark t={t} at={S('leo_fix')} ok={false} x={-210} y={0} size={0.7} />}
          <g transform="translate(160,0)">
            <path d={ONE_PATH} fill="none" stroke="#1982c4" strokeWidth={50} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${f} 2`} />
            {f > 0 && f < 1 && <Brush x={f < 0.22 ? -70 + (f / 0.22) * 80 : 10} y={f < 0.22 ? -120 - (f / 0.22) * 80 : -200 + ((f - 0.22) / 0.78) * 400} c="#1982c4" />}
            {t >= S('leo_yay') && <AnswerMark t={t} at={S('leo_yay')} ok x={150} y={-160} size={0.7} />}
          </g>
          {w > 0 && w < 1 && <Brush x={-200} y={-180 + w * 370} c="#8ac926" />}
        </g>
      );
    }
    case 'sun': return <g><g transform="translate(-130,0)"><Sun t={t} /></g><g transform={`translate(230,0) scale(${popIn(t, S('o_sun_c'))})`}><BigOne s={0.8} c="#ffca3a" face={false} /></g></g>;
    case 'moon': return <g><rect x={-PW / 2} y={-PH / 2} width={PW} height={PH} fill="#2b2d6e" />{Array.from({ length: 24 }).map((_, k) => <circle key={k} cx={-PW / 2 + ((k * 211) % PW)} cy={-PH / 2 + ((k * 97) % PH)} r={3} fill="#ffffff" opacity={0.6} />)}<g transform="translate(-130,0)"><Moon /></g><g transform={`translate(230,0) scale(${popIn(t, S('o_moon_c'))})`}><BigOne s={0.8} c="#fff3b0" face={false} /></g></g>;
    case 'nose': return <g><g transform="translate(-120,10) scale(1.2)"><FaceCard ring="nose" t={t} at={S('o_nose_a')} /></g>{t >= S('o_nose_a') && <g transform={`translate(240,0) scale(${popIn(t, S('o_nose_a'))})`}><BigOne s={0.8} c="#ff924c" face={false} /></g>}</g>;
    case 'mouth': return <g><g transform="translate(-120,10) scale(1.2)"><FaceCard ring="mouth" t={t} at={S('o_mouth') + 0.3} /></g><g transform={`translate(240,0) scale(${popIn(t, S('o_mouth') + 0.3)})`}><BigOne s={0.8} c="#ff6fa5" face={false} /></g></g>;
    case 'tail': return <g><g transform="translate(-120,0) scale(1.1)"><BearBack t={t} at={S('o_tail_a')} /></g>{t >= S('o_tail_a') && <g transform={`translate(240,0) scale(${popIn(t, S('o_tail_a'))})`}><BigOne s={0.8} c="#c98f5f" face={false} /></g>}</g>;
    case 'cake': return <g><g transform="translate(-110,60)"><Cake t={t} out={word('o_cake_b', 5)} /></g>{t >= S('o_cake_a') && <g transform={`translate(260,0) scale(${popIn(t, S('o_cake_a'))})`}><BigOne s={0.8} c="#4cc9f0" face={false} /></g>}</g>;
    case 'fr': return (
      <g>
        <g transform="translate(-170,0)"><BigOne t={t} /></g>
        <text x={40} y={30} fontFamily={FONT_TOON} fontWeight={700} fontSize={110} fill={KINK}>=</text>
        {t >= S('fr') && (
          <g transform={`translate(250,40) scale(${popIn(t, S('fr'))})`}>
            <text textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={190} fill="#4cc9f0" stroke={KINK} strokeWidth={8} paintOrder="stroke">un</text>
            <g transform="translate(-60,60)">{['#1982c4', '#ffffff', '#ff595e'].map((c, k) => <rect key={c} x={k * 40} y={0} width={40} height={60} fill={c} {...kst(3)} />)}</g>
          </g>
        )}
      </g>
    );
    case 'gA': return <g>{[1, 4, 7].map((n, k) => <NumCard key={n} n={n} x={(k - 1) * 260} t={t} ok={n === 1} at={E('gA_no') - 0.4} />)}<AnswerMark t={t} at={E('gA_leo') + 0.1} until={S('gA_no') + 1.6} ok={false} x={260 + 90} y={-140} size={0.6} />{t >= word('gA_no', 2) && t < E('gA_no') && <path d="M 200,-120 L 330,-120" stroke="#ff595e" strokeWidth={14} strokeLinecap="round" opacity={0.85} />}</g>;
    case 'gB': return <g>{[3, 5, 1].map((n, k) => <NumCard key={n} n={n} x={(k - 1) * 260} t={t} ok={n === 1} at={S('gB_a')} />)}</g>;
    case 'gB2': return <g>{[2, 1, 7, 4].map((n, k) => <g key={n} transform="scale(0.82)"><NumCard n={n} x={(k - 1.5) * 250} t={t} ok={n === 1} at={S('gB2_a')} /></g>)}</g>;
    case 'gC2': return (
      <g>
        <rect x={-PW / 2} y={-PH / 2} width={PW} height={PH} fill="#2b2d6e" />
        {[[-300, -170], [-140, -60], [40, -190], [220, -90], [330, 120], [-280, 140], [-40, 150], [140, 60], [-200, -10], [300, -200]].map(([x, y], k) => (
          <g key={k} transform={`translate(${x},${y}) scale(${0.8 + 0.12 * Math.sin(t * 3 + k)})`}><Vol><path d={STAR} fill="#ffd23f" {...kst(4)} strokeLinejoin="round" /></Vol></g>
        ))}
      </g>
    );
    case 'r6': return <g><g transform="translate(0,60)"><Cake t={t} out={1e9} /></g>{t >= S('ra6') && <circle cx={0} cy={-120} r={90} fill="none" stroke="#ff595e" strokeWidth={10} strokeDasharray="18 12" transform={`rotate(${t * 60} 0 -120)`} />}</g>;
    case 'gC': return <g><g transform={`translate(0,30) rotate(${Math.sin(t * 2) * 3})`}><Duck /></g>{t >= S('gC_a') && <g transform={`translate(270,-40) scale(${popIn(t, S('gC_a'))})`}><BigOne s={0.6} c="#ffca3a" face={false} /></g>}</g>;
    case 'gD': return (
      <g>
        {[-280, -140, 0, 140, 280].map((x, k) => (
          <g key={k} transform={`translate(${x},${-20 + Math.sin(t * 2 + k) * 10}) scale(0.9)`}>
            <Balloon c={RAINBOW[k]} />
            {t >= BALLOON_AT[k] && <g transform={`translate(0,-130) scale(${popIn(t, BALLOON_AT[k])})`}><circle r={30} fill={RAINBOW[k]} {...kst(4)} /><text y={12} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={36} fill="#ffffff">{k + 1}</text></g>}
          </g>
        ))}
        <AnswerMark t={t} at={E('gD_leo') + 0.1} until={S('gD_no') + 0.6} ok={false} x={0} y={160} size={0.6} />
      </g>
    );
    case 'gE': {
      const eaten = t >= word('gE_c', 0);
      return (
        <g>
          <g transform="translate(-200,60)"><Plate n={3} /></g>
          <g transform="translate(200,60)"><Plate n={eaten || t >= S('gE_b') + 0.6 ? 0 : 1} /></g>
          {t >= S('gE_a') && <circle cx={200} cy={40} r={120} fill="none" stroke="#52b788" strokeWidth={12} strokeDasharray="22 14" transform={`rotate(${t * 60} 200 40)`} />}
        </g>
      );
    }
    case 'r1': return <g><g transform="translate(-60,0)"><path d={ONE_PATH} fill="none" stroke="#ff595e" strokeWidth={50} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${t >= S('ra1') ? EASE_INOUT(prog(t, S('ra1'), E('ra1'))) : 0} 2`} /><circle cx={-70} cy={-120} r={22} fill="#52b788" {...kst(4)} /></g>{t < S('ra1') && <text x={160} y={40} fontFamily={FONT_TOON} fontWeight={700} fontSize={200} fill="#adb5bd">?</text>}</g>;
    case 'r2': return <g><g transform="translate(-100,0) scale(0.9)"><Sun t={t} /></g>{t >= S('ra2') && <g transform={`translate(240,0) scale(${popIn(t, S('ra2'))})`}><BigOne s={0.8} c="#ffca3a" face={false} /></g>}</g>;
    case 'r3': return <g><g transform="translate(-100,10) scale(1.1)"><FaceCard ring="nose" t={t} at={S('ra3')} /></g>{t >= S('ra3') && <g transform={`translate(240,0) scale(${popIn(t, S('ra3'))})`}><BigOne s={0.8} c="#ff924c" face={false} /></g>}</g>;
    case 'r4': return <g><g transform="translate(-170,0) scale(0.9)"><BigOne t={t} /></g><text x={30} y={30} fontFamily={FONT_TOON} fontWeight={700} fontSize={110} fill={KINK}>=</text><text x={250} y={70} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={190} fill={t >= S('ra4') ? '#4cc9f0' : '#adb5bd'} stroke={KINK} strokeWidth={8} paintOrder="stroke">{t >= S('ra4') ? 'un' : '?'}</text></g>;
    case 'r5': return <g><g transform="translate(-60,40) scale(1.3)"><Hand1 /></g></g>;
    case 'rhyme': return <g transform={`translate(0,${20 - Math.abs(Math.sin((t - since) * 4.2)) * 26})`}><BigOne s={0.92} t={t} /></g>;
    case 'two': return (
      <g>
        <g transform="translate(-180,0) scale(0.8)"><BigOne t={t} /></g>
        <g transform={`translate(200,20) scale(${popIn(t, word('next', 4))})`}>
          <text textAnchor="middle" y={110} fontFamily={FONT_TOON} fontWeight={700} fontSize={330} fill="#8ac926" stroke={KINK} strokeWidth={10} paintOrder="stroke">2</text>
          <text textAnchor="middle" y={-170} fontFamily={FONT_TOON} fontWeight={700} fontSize={50} fill="#adb5bd">NEXT TIME!</text>
        </g>
      </g>
    );
    case 'bye': return <g transform={`rotate(${Math.sin(t * 5) * 6})`}><BigOne s={0.95} t={t} /></g>;
    default: return null;
  }
};
const Brush: React.FC<{ x: number; y: number; c: string }> = ({ x, y, c }) => (
  <g transform={`translate(${x},${y}) rotate(-30)`}>
    <Vol kind="tube"><rect x={-9} y={-170} width={18} height={130} rx={8} fill="#c98f5f" {...kst(4)} /></Vol>
    <rect x={-11} y={-48} width={22} height={24} rx={4} fill="#adb5bd" {...kst(3)} />
    <path d="M -12,-26 Q -14,0 0,10 Q 14,0 12,-26 Z" fill={c} {...kst(3)} />
  </g>
);

export default function KidsNumbers072() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const hop = hopAt(t, HOPS, { h: 50 });
  const [panel, since] = panelAt(t);
  const yay = (k: number) => (within(t, S('o_cake_b'), E('o_cake_b') + 0.4) || within(t, S('leo_yay'), E('leo_yay')) ? Math.abs(Math.sin(t * 7 + k)) * 22 : 0);
  const wag = within(t, S('o_tail_a'), E('o_tail_a') + 0.3) ? Math.sin(t * 16) * 8 : 0;
  const chew = within(t, word('gE_c', 0), E('gE_c') + 0.3);
  const fresh = panel !== 'hand' && panel !== 'paint' && panel !== 'leo' && panel !== 'rhyme' && panel !== 'bye';

  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
        <Backdrop place={PLACE} w={W} h={H} t={t} fx={false} />
        {/* the easel */}
        <g transform={`translate(${EZ[0]},${EZ[1]})`}>
          <rect x={-40} y={PH / 2 - 20} width={26} height={340} rx={8} fill="#c98f5f" {...kst(5)} transform="rotate(10)" />
          <rect x={14} y={PH / 2 - 20} width={26} height={340} rx={8} fill="#c98f5f" {...kst(5)} transform="rotate(-10)" />
          <rect x={-PW / 2 - 24} y={PH / 2 - 6} width={PW + 48} height={30} rx={10} fill="#c98f5f" {...kst(5)} />
          <rect x={-PW / 2} y={-PH / 2} width={PW} height={PH} rx={18} fill="#fffdf7" {...kst(8)} />
          <defs><clipPath id="d72paper"><rect x={-PW / 2} y={-PH / 2} width={PW} height={PH} rx={18} /></clipPath></defs>
          <g clipPath="url(#d72paper)">
            <g transform={`scale(${fresh ? popIn(t, since + 0.05, 0.4) : 1})`}><Panel p={panel} t={t} since={since} /></g>
          </g>
          {[[-PW / 2 + 30, -PH / 2 + 10], [PW / 2 - 30, -PH / 2 + 10]].map(([x, y], k) => <circle key={k} cx={x} cy={y} r={12} fill="#ff595e" {...kst(3)} />)}
        </g>
        <PlaceLight place={PLACE}>
          <Critter spec={HOOT_HERO} x={X.hoot} y={yAt(X.hoot, CS)} scale={CS} expr={exprAt(t, HOOT_E)} look={lookAt(t, LOOK_R)} mouth={lipSync(VO, 'hoot', t)}
            armL={poseAt(t, HOOT_A)} armR={poseAt(t, HOOT_A)} facing={-1} hop={hop.hop} squash={hop.squash} />
          <Critter spec={BOBO_HERO} x={X.bobo} y={yAt(X.bobo, CS)} scale={CS} expr={exprAt(t, BOBO_E)} look={lookAt(t, LOOK_R)}
            mouth={chew ? 0.5 + 0.5 * Math.sin(t * 16) : lipSync(VO, 'bobo', t)} armL={poseAt(t, BOBO_A)} armR={poseAt(t, BOBO_A)} facing={-1}
            hop={hop.hop + yay(2)} squash={hop.squash} tilt={wag} holdR={within(t, S('gE_b') + 0.6, word('gE_c', 0) + 0.3) ? <g transform="scale(0.6)"><Apple /></g> : undefined} />
          <Kid spec={LEO_HERO} x={X.leo} y={yAt(X.leo, KS)} scale={KS} expr={exprAt(t, LEO_E)} look={lookAt(t, LOOK_L)} mouth={lipSync(VO, 'leo', t)}
            armL={poseAt(t, LEO_L)} armR={poseAt(t, LEO_R)} fingersR={within(t, S('fingers_b'), E('fingers_b') + 0.6) || within(t, S('rq5'), E('ra5') + 0.4) ? 1 : 0}
            hop={hop.hop + yay(1)} squash={hop.squash} />
          <Kid spec={MILA_HERO} x={X.mila} y={yAt(X.mila, KS)} scale={KS} expr={exprAt(t, MILA_E)} look={lookAt(t, LOOK_L)} mouth={lipSync(VO, 'mila', t)}
            armL={poseAt(t, MILA_L)} armR={poseAt(t, MILA_R)} fingersR={fingers(t)} hop={hop.hop + yay(0)} squash={hop.squash} />
        </PlaceLight>
        <StageWord t={t} at={word('o_nose_a', 2)} until={E('o_nose_a') + 0.3} text="BEEP!" x={X.leo + 40} y={yAt(X.leo, KS) - 520} size={80} color="#ff924c" rot={-6} />
        <StageWord t={t} at={word('o_tail_a', 3)} until={E('o_tail_a') + 0.3} text="WIGGLE!" x={X.bobo - 80} y={yAt(X.bobo, CS) - 540} size={80} color="#c98f5f" rot={5} />
        <StageWord t={t} at={word('o_cake_b', 5)} until={E('o_cake_b') + 0.3} text="WHOO!" x={X.bobo - 80} y={yAt(X.bobo, CS) - 540} size={80} color="#4cc9f0" rot={-5} />
        <StageWord t={t} at={word('gE_c', 0)} until={E('gE_c') + 0.4} text="CRUNCH!" x={X.bobo - 80} y={yAt(X.bobo, CS) - 540} size={84} color="#ff595e" rot={5} />
        <Reaction kind="sweat" t={t} at={S('leo_wig')} until={E('leo_wig') + 0.2} x={X.leo + 60} y={yAt(X.leo, KS) - 400} s={0.5} />
        <Reaction kind="?" t={t} at={E('gA_leo') + 0.1} until={S('gA_no') + 1.0} x={X.leo} y={yAt(X.leo, KS) - 470} s={0.5} />
        <Reaction kind="!" t={t} at={S('gD_b')} until={E('gD_b') + 0.3} x={X.leo} y={yAt(X.leo, KS) - 470} s={0.55} />
        <Reaction kind="heart" t={t} at={S('gE_c')} until={E('gE_c') + 0.5} x={X.bobo} y={yAt(X.bobo, CS) - 470} s={0.55} />
        <Reaction kind="idea" t={t} at={S('fr_q')} until={E('fr_q') + 0.2} x={X.leo} y={yAt(X.leo, KS) - 470} s={0.5} />
      </ActionStage>

      {/* screen-space */}
      <PopText t={t} at={0.3} until={S('n1b') - 0.1} text="NUMBER ONE!" y={110} size={110} color="#ff595e" />
      <PopText t={t} at={S('premise')} until={S('look') - 0.1} text="LET'S LEARN 1!" y={110} size={110} color="#ffca3a" />
      <PopText t={t} at={word('look', 4)} until={S('say1') - 0.1} text="TALL + STRAIGHT" y={110} size={100} color="#8d5a3b" />
      <PopText t={t} at={S('say1')} until={S('say_turn') - 0.1} text="ONE!" y={110} size={140} color="#ff595e" />
      <PopText t={t} at={S('say_turn')} until={S('fingers') - 0.1} text="🗣️ YOUR TURN!" y={110} size={100} color="#ffffff" />
      <PopText t={t} at={S('fingers')} until={S('draw') - 0.2} text="☝️ ONE FINGER!" y={110} size={100} color="#ffca3a" />
      <PopText t={t} at={S('draw')} until={S('draw_turn') - 0.1} text="TOP… STRAIGHT DOWN!" y={110} size={96} color="#ff595e" />
      <PopText t={t} at={S('draw_turn')} until={S('draw_again') - 0.1} text="☝️ DRAW IT IN THE AIR!" y={110} size={90} color="#ffffff" />
      <PopText t={t} at={S('draw_again')} until={S('leo_draw') - 0.1} text="SLOWLY… TOP… DOWN!" y={110} size={96} color="#ff595e" />
      <PopText t={t} at={S('leo_yay')} until={S('ones') - 0.1} text="PERFECT!" y={110} size={120} color="#52b788" />
      <PopText t={t} at={S('ones')} until={S('o_sun') - 0.1} text="THINGS THAT COME IN ONE!" y={110} size={84} color="#ffca3a" />
      <PopText t={t} at={S('o_sun_c')} until={S('o_moon') - 0.1} text="1 SUN" y={110} size={130} color="#ffca3a" />
      <PopText t={t} at={S('o_moon_c')} until={S('o_nose') - 0.1} text="1 MOON" y={110} size={130} color="#fff3b0" />
      <PopText t={t} at={S('o_nose_a')} until={S('o_mouth') - 0.1} text="1 NOSE" y={110} size={130} color="#ff924c" />
      <PopText t={t} at={S('o_mouth')} until={S('o_tail') - 0.1} text="1 MOUTH" y={110} size={130} color="#ff6fa5" />
      <PopText t={t} at={S('o_tail_a')} until={S('o_cake') - 0.1} text="1 TAIL" y={110} size={130} color="#c98f5f" />
      <PopText t={t} at={S('o_cake_a')} until={S('fr_q') - 0.1} text="1 CANDLE" y={110} size={130} color="#4cc9f0" />
      <PopText t={t} at={S('fr')} until={S('game') - 0.1} text="🇫🇷 UN!" y={110} size={130} color="#4cc9f0" />
      <PopText t={t} at={S('game')} until={beat(E('gA') + 0.1)} text="FIND THE 1!" y={110} size={120} color="#ffca3a" />
      <PopText t={t} at={word('gA_no', 2)} until={S('gB') - 0.2} text="7 HAS A HAT!" y={110} size={110} color="#ff595e" />
      <PopText t={t} at={S('gC')} until={beat(E('gC') + 0.1)} text="ONE OR MANY?" y={110} size={110} color="#ffffff" />
      <PopText t={t} at={S('gB2_a')} until={S('gC') - 0.2} text="NO HAT. STRAIGHT!" y={110} size={110} color="#52b788" />
      <PopText t={t} at={S('gC2')} until={beat(E('gC2') + 0.1)} text="ONE OR MANY?" y={110} size={110} color="#ffffff" />
      <PopText t={t} at={S('gC2_a')} until={S('gD') - 0.2} text="MANY STARS!" y={110} size={120} color="#ffd23f" />
      <PopText t={t} at={S('gC_a')} until={S('gC2') - 0.2} text="ONE DUCK!" y={110} size={120} color="#ffca3a" />
      <PopText t={t} at={S('gD')} until={beat(E('gD') + 0.1)} text="ONE OR MANY?" y={110} size={110} color="#ffffff" />
      <PopText t={t} at={S('gD_b')} until={S('gE') - 0.2} text="MANY!" y={110} size={130} color="#4cc9f0" />
      <PopText t={t} at={S('gE_a')} until={S('rem') - 0.2} text="ONE APPLE!" y={110} size={120} color="#ff595e" />
      <PopText t={t} at={S('rem')} until={S('rq1') - 0.1} text="LET'S REMEMBER!" y={110} size={110} color="#ffca3a" />
      <PopText t={t} at={S('ra1')} until={S('rq2') - 0.2} text="TOP → DOWN!" y={110} size={120} color="#ff595e" />
      <PopText t={t} at={S('ra2')} until={S('rq3') - 0.2} text="1 SUN!" y={110} size={130} color="#ffca3a" />
      <PopText t={t} at={S('ra3')} until={S('rq4') - 0.2} text="1 NOSE!" y={110} size={130} color="#ff924c" />
      <PopText t={t} at={S('ra4')} until={S('rq6') - 0.2} text="UN!" y={110} size={140} color="#4cc9f0" />
      <PopText t={t} at={S('ra6')} until={S('rq5') - 0.2} text="THE CAKE!" y={110} size={130} color="#ff6fa5" />
      <PopText t={t} at={S('rq5')} until={S('chant') - 0.2} text="☝️ SHOW ME ONE!" y={110} size={110} color="#ffffff" />
      <PopText t={t} at={S('c1')} until={S('c2') - 0.05} text="ONE, ONE, NUMBER ONE!" y={110} size={96} color="#ff595e" />
      <PopText t={t} at={S('c2')} until={S('c3') - 0.05} text="TOP TO BOTTOM, NOW IT'S DONE!" y={110} size={80} color="#1982c4" />
      <PopText t={t} at={S('c3')} until={S('c_turn') - 0.05} text="ONE, ONE, NUMBER ONE!" y={110} size={96} color="#ff595e" />
      <PopText t={t} at={S('c_turn')} until={S('next') - 0.1} text="🗣️ YOUR TURN!" y={110} size={110} color="#ffffff" />
      <PopText t={t} at={S('bye')} until={END_IRIS} text="SEE YOU NEXT TIME!" y={110} size={100} color="#ffca3a" />
      {(['o_nose', 'o_tail', 'gA', 'gB', 'gB2', 'gC', 'gC2', 'gD', 'gE', 'rq1', 'rq2', 'rq3', 'rq4', 'rq6'] as const).map((q) => (
        <ThinkTimer key={q} t={t} from={beat(E(q) + 0.1)} to={VO[K[q] + 1].start - 0.1} x={1780} y={170} r={84} />
      ))}
      <Confetti t={t} at={BIG1} y={380} />
      <Confetti t={t} at={S('leo_yay')} y={380} />
      <Confetti t={t} at={word('o_cake_b', 5)} y={380} />
      <Confetti t={t} at={S('gD_b')} y={380} />
      <Confetti t={t} at={S('ra5')} y={380} />
      <Confetti t={t} at={E('c3')} y={380} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <StarWipe t={t} at={END_IRIS} dur={0.5} hold={5} color="#ff595e" x={W / 2} y={H * 0.45} />
    </>
  );
}
