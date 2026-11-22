// TINY SPARKS · Day 75 · 🚀 Science for Kids #11 — "What Is Thunder?" (Short 9:16, 1:31)
// kids-shorts/tiny-sparks/science/day-075-what-is-thunder. Cues from VO via K (keys.gen.ts).
// COLD OPEN in the cosy kitchen while a storm flashes in the window: BOOM at 0.05 s → "What was that big boom?" →
// Bobo: "Who's knocking on the sky?" → Leo's guess (giants bowling in the clouds, STRIKE!) → Hoot: that's THUNDER (your
// turn) → THE MODEL on Hoot's board: thunder is the SOUND of lightning · lightning is super hot, it heats the air · the
// hot air pushes out really fast → BOOM (rings) · a bit like a giant clap → everyone claps, Bobo's clap goes BOOM →
// flash first? light ZOOMS, sound comes after (a race) · far = rumble, rumble · close = CRACK → QUIZ flash or boom first?
// (think timer, Leo ✗ "the boom") → the flash ✓ → when thunder roars, go indoors (we're inside: safe and cozy) → Bobo's
// tummy rumbles — the gag that loops back to the first boom.
// Facts (NOAA / NWS JetStream "Thunder", National Geographic Kids): thunder is the sound lightning makes; lightning heats
// the air around it extremely fast (hotter than the surface of the Sun) and the air expands explosively → the boom;
// light travels far faster than sound, so the flash is seen first; nearby thunder is a sharp crack/clap, distant thunder
// a low rumble; NWS "When thunder roars, go indoors". Different from Day 68 (what lightning IS, storm safety game).
import React from 'react';
import { Kid, kidFaceAt, type KArm } from '../../lib/kids/kid';
import { Critter, critterFaceAt, type CArm } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, HOOT_HERO, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { Backdrop, PlaceLight, standY, type Place } from '../../lib/kids/places';
import { AnswerMark, Bubble, Confetti, FONT_TOON, KidsCaptions, PopText, ThinkTimer, useT } from '../../lib/kids/kit';
import { speechAt } from '../../lib/kids/acting';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, Dust, ImpactStar, MotionLines, Reaction, StageWord, directorCam, hopAt, onBeat, shakeOf, type Hit, type Shot } from '../../lib/kids/energy';
import { exprAt, poseAt } from '../../lib/kids/smooth';
import { voKeys, type Span } from '../../lib/kids/cues';
import { EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsScience075', durationInSeconds: 91.0, fps: 30, width: 1080, height: 1920 };

const W = 1080;
const H = 1920;
type Key = keyof typeof K;
const S = (k: Key) => VO[K[k]].start;
const E = (k: Key) => VO[K[k]].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;
const word = (k: Key, i: number) => {
  const w = timeWords(VO[K[k]]);
  return (w[Math.min(i, w.length - 1)] ?? { start: S(k) }).start;
};
const lastWord = (k: Key) => {
  const w = timeWords(VO[K[k]]);
  return w.length ? w[w.length - 1].start : S(k);
};
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff' };
const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (EASE_OUT(p) - 1) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};
const beat = (x: number) => onBeat(x, 0); // the bed starts at 0 s (Short)

// ── place + blocking (feet on the painted floor)
const KITCHEN: Place = 'kitchen';
const KS = 0.56;
const BS = 0.6;
const HS = 0.56;
const X = { hoot: 120, mila: 300, leo: 480, bobo: 660 }; // all on the main floor (the right side is the counter)
const yAt = (x: number, s: number) => standY(KITCHEN, x, W, H, { halfW: 150 * s });

// ── timeline anchors
const BOOM0 = 0.05; // the opening thunder
const BOARD_IN = S('what') - 0.4;
const BOARD_OUT = S('clap1') - 0.3; // the clap is acted by the cast, board away
const BOARD2_IN = S('why') + 1.2;
const BOARD2_OUT = S('rule') - 0.2;
const PUSH_BOOM = lastWord('push');
const BOBO_BOOM = word('clap3', 1);
const ZOOM = word('fast', 4);
const CRACK = lastWord('near');
const QUIZ_ANS = S('quiz_a');
// window flashes (never more than ~1 per second, soft: no full-screen white)
const FLASHES = [BOOM0, word('good', 10) - 0.4, PUSH_BOOM, ZOOM - 0.1, CRACK - 0.05, word('rule', 2)];

// ── arms + faces from the VO (smooth timelines)
const CLAP_ALL: Span<KArm> = [S('clap1') - 0.2, E('clap3') + 0.6, 'clap'];
const CLAP_C: Span<CArm> = [S('clap1') - 0.2, E('clap3') + 0.6, 'clap'];
const MILA_R = voKeys<KArm>(VO, 'mila', 'present', 'down', [
  [0, E('open') + 0.3, 'cheeks'], [S('word2'), E('word2') + 1.8, 'cheer'], CLAP_ALL, [S('why'), E('why'), 'think'],
  [S('quiz_a'), E('quiz_a'), 'point'], [S('rule_a'), E('rule_a') + 0.6, 'cheer'], [S('tummy') + 1.4, 99, 'cover'],
]);
const MILA_L = voKeys<KArm>(VO, null, 'down', 'down', [[0, E('open') + 0.3, 'cheeks'], CLAP_ALL, [S('rule_a'), E('rule_a') + 0.6, 'cheer'], [S('tummy') + 1.4, 99, 'cover']]);
const MILA_E = voKeys<KExpr>(VO, 'mila', 'happy', 'smile', [
  [0, E('open') + 0.4, 'wow'], [S('why'), E('why'), 'think'], [S('quiz_a'), E('quiz_a'), 'proud'], [S('tummy') + 1.4, 99, 'laugh'],
]);
const LEO_R = voKeys<KArm>(VO, 'leo', 'present', 'down', [
  [S('guess'), word('guess', 7), 'point'], [word('guess', 7), E('guess') + 0.3, 'cheer'], CLAP_ALL,
  [S('quiz_leo'), E('quiz_leo') + 0.2, 'up'], [E('quiz_leo') + 0.3, S('quiz_ok'), 'cheeks'], [S('cozy'), E('cozy'), 'thumbs'], [S('tummy') + 1.4, 99, 'cover'],
]);
const LEO_L = voKeys<KArm>(VO, null, 'down', 'down', [[E('quiz_leo') + 0.3, S('quiz_ok'), 'cheeks'], CLAP_ALL, [S('tummy') + 1.4, 99, 'cover']]);
const LEO_E = voKeys<KExpr>(VO, 'leo', 'happy', 'smile', [
  [0, E('open') + 0.3, 'surprised'], [S('guess'), E('guess'), 'laugh'], [S('good'), S('word'), 'surprised'],
  [S('quiz_leo'), E('quiz_leo'), 'proud'], [E('quiz_leo') + 0.3, S('quiz_ok'), 'oops'], [S('tummy') + 1.4, 99, 'laugh'],
]);
const BOBO_A = voKeys<CArm>(VO, 'bobo', 'wave', 'down', [
  [0, E('eek') + 0.3, 'cheeks'], [S('clap1') - 0.2, BOBO_BOOM - 0.15, 'clap'], [BOBO_BOOM - 0.15, E('clap3') + 1.2, 'up'],
  [S('rule_a'), E('rule_a') + 0.6, 'cheer'], [S('tummy'), word('tummy', 2), 'hug'], [word('tummy', 2), 99, 'cheeks'],
]);
const BOBO_E = voKeys<KExpr>(VO, 'bobo', 'happy', 'smile', [
  [0, E('eek') + 0.3, 'surprised'], [BOBO_BOOM, E('clap3') + 1.4, 'laugh'], [S('tummy'), word('tummy', 2), 'think'],
  [word('tummy', 2), word('tummy', 3), 'oops'], [word('tummy', 3), 99, 'laugh'],
]);
const HOOT_A = voKeys<CArm>(VO, 'hoot', 'point', 'down', [CLAP_C, [S('tummy') + 1.4, 99, 'cheeks']]);
const HOOT_R = voKeys<CArm>(VO, null, 'down', 'down', [CLAP_C, [S('tummy') + 1.4, 99, 'cheeks']]);
const HOOT_E = voKeys<KExpr>(VO, 'hoot', 'happy', 'smile', [[S('good'), word('good', 4), 'laugh'], [S('quiz_ok'), E('quiz_ok'), 'proud'], [S('tummy') + 1.4, 99, 'laugh']]);
const YAY_HOPS = [BOBO_BOOM + 0.05, S('quiz_ok') + 0.1, E('rule_a') + 0.1];

// ── camera
const WIDE = { z: 1.0, x: 540, y: 1130 };
const face = (x: number, s: number) => kidFaceAt(x, yAt(x, s), s)[1] + 60;
const cFace = (x: number, s: number) => critterFaceAt(x, yAt(x, s), s)[1] + 60;
const BOARD = { z: 1.0, x: 540, y: 960 };
const SHOTS: Shot[] = [
  { t: 0, z: 1.04, x: 540, y: 1110, move: 'cut', push: 0.02 }, // the window + the kids
  { t: S('eek') - 0.15, z: 1.6, x: X.bobo, y: cFace(X.bobo, BS), move: 'whip' },
  { t: S('guess') - 0.15, z: 1.5, x: X.leo + 60, y: face(X.leo, KS) - 60, move: 'whip', push: 0.01 },
  { t: S('good') - 0.15, z: 1.6, x: X.hoot + 80, y: cFace(X.hoot, HS), move: 'whip', push: 0.01 },
  { t: S('word2') - 0.1, z: 1.7, x: X.mila + 20, y: face(X.mila, KS), move: 'snap', push: 0.01 },
  { t: BOARD_IN, ...BOARD, move: 'smooth', dur: 0.7, push: 0.01 },
  { t: S('clap_q') + 1.6, ...WIDE, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: BOBO_BOOM - 0.1, z: 1.5, x: X.bobo, y: cFace(X.bobo, BS), move: 'snap' },
  { t: S('why') - 0.2, z: 1.6, x: X.mila + 20, y: face(X.mila, KS), move: 'smooth', dur: 0.6 },
  { t: BOARD2_IN, ...BOARD, move: 'smooth', dur: 0.7, push: 0.01 },
  { t: S('quiz_leo') - 0.1, z: 1.6, x: X.leo + 40, y: face(X.leo, KS), move: 'snap' },
  { t: S('quiz_a') - 0.1, ...BOARD, move: 'smooth', dur: 0.5 },
  { t: S('rule') - 0.2, ...WIDE, move: 'smooth', dur: 0.7, push: 0.01 },
  { t: S('tummy') - 0.1, z: 1.65, x: X.bobo, y: cFace(X.bobo, BS) + 40, move: 'snap', push: 0.02 },
  { t: S('tummy') + 1.6, z: 1.04, x: 540, y: 1110, move: 'smooth', dur: 0.8 }, // back to the opening framing (loop)
];
const PUNCHES = [PUSH_BOOM, BOBO_BOOM, CRACK, S('word')];
const HITS: Hit[] = [{ at: BOOM0, amp: 9, dur: 0.3 }, { at: PUSH_BOOM, amp: 8, dur: 0.3 }, { at: BOBO_BOOM, amp: 10, dur: 0.3 }, { at: CRACK, amp: 8, dur: 0.3 }];

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
const Bolt: React.FC<{ d: string; p?: number; fade?: number; w?: number }> = ({ d, p = 1, fade = 0, w = 14 }) => (
  <g opacity={1 - fade}>
    <path d={d} fill="none" stroke="#fff59d" strokeWidth={w * 3} strokeLinejoin="round" strokeLinecap="round" opacity={0.35} pathLength={1} strokeDasharray={`${p} 1`} />
    <path d={d} fill="none" stroke="#ffe066" strokeWidth={w * 1.6} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} />
    <path d={d} fill="none" stroke="#ffffff" strokeWidth={w * 0.7} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} />
  </g>
);
const CLOUD_D = 'M -260,70 Q -320,70 -320,10 Q -320,-60 -240,-66 Q -228,-160 -120,-160 Q -70,-230 24,-208 Q 108,-240 166,-160 Q 270,-170 282,-70 Q 340,-46 330,24 Q 318,70 260,70 Z';
const Cloud: React.FC<{ w: number; fill?: string; glow?: number }> = ({ w, fill = '#9d8fc4', glow = 0 }) => {
  const s = w / 600;
  return (
    <g transform={`scale(${s})`}>
      <Vol><path d={CLOUD_D} fill={fill} {...kst(8 / s)} /></Vol>
      {glow > 0 && <path d={CLOUD_D} fill="#fff8c4" opacity={glow * 0.3} />}
    </g>
  );
};
const flashAt = (t: number) => {
  const fl = FLASHES.find((a) => within(t, a, a + 0.5));
  return fl === undefined ? { glow: 0, fl: undefined } : { glow: 1 - prog(t, fl, fl + 0.5), fl };
};

// the storm in the kitchen window (two panes) + new little pots on the sill (the painted ones are under the storm)
const PANES = [{ x: 410, w: 143 }, { x: 582, w: 145 }];
const WIN_Y = 425;
const WIN_H = 380;
const WindowStorm: React.FC<{ t: number }> = ({ t }) => {
  const { glow, fl } = flashAt(t);
  const boltOn = fl !== undefined && t < fl + 0.35;
  const bx = fl !== undefined ? 470 + ((fl * 997) % 200) : 0;
  return (
    <g>
      <defs>
        <clipPath id="d75win">{PANES.map((p, i) => <rect key={i} x={p.x} y={WIN_Y} width={p.w} height={WIN_H} rx={10} />)}</clipPath>
        <linearGradient id="d75sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f3570" />
          <stop offset="1" stopColor="#6c63a6" />
        </linearGradient>
      </defs>
      <g clipPath="url(#d75win)">
        <rect x={400} y={WIN_Y} width={340} height={WIN_H} fill="url(#d75sky)" />
        <rect x={400} y={WIN_Y} width={340} height={WIN_H} fill="#fff8c4" opacity={glow * 0.45} />
        {[[470, 500, 300], [650, 470, 320], [560, 560, 260]].map(([x, y, w], i) => (
          <g key={i} transform={`translate(${x + Math.sin(t * 0.3 + i) * 8},${y})`}><Cloud w={w} fill={i % 2 ? '#7d6fb0' : '#8a7dbd'} glow={glow} /></g>
        ))}
        {boltOn && <Bolt d={zig(bx, 560, bx + 30, 760, 5, 18, fl)} p={prog(t, fl!, fl! + 0.1)} w={7} />}
        {/* rain streaks */}
        {Array.from({ length: 26 }).map((_, i) => {
          const x = 405 + ((i * 53) % 330);
          const y = WIN_Y + ((t * 520 + i * 97) % (WIN_H + 40)) - 20;
          return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 26} stroke="#c9d6ff" strokeWidth={3} strokeLinecap="round" opacity={0.6} />;
        })}
        {/* a dark lawn at the bottom of the window */}
        <path d={`M 400,${WIN_Y + WIN_H - 70} Q 560,${WIN_Y + WIN_H - 100} 740,${WIN_Y + WIN_H - 75} L 740,${WIN_Y + WIN_H} L 400,${WIN_Y + WIN_H} Z`} fill="#4f7a5a" />
      </g>
      {/* little pots back on the sill */}
      {[438, 500, 640, 700].map((x, i) => (
        <g key={i} transform={`translate(${x},812)`}>
          <Vol><path d="M -26,-28 L 26,-28 L 20,12 L -20,12 Z" fill="#e8916a" {...kst(4)} /></Vol>
          <Vol>
            {[-14, 0, 14].map((dx, j) => <ellipse key={j} cx={dx} cy={-44 - (j % 2) * 10} rx={16} ry={22} fill={i % 2 ? '#79b65a' : '#8bc34a'} {...kst(3.5)} />)}
          </Vol>
        </g>
      ))}
    </g>
  );
};

// Hoot's board: a big panel above the cast; each beat draws its own picture inside
const PX = 540;
const PY = 620;
const PW = 920;
const PH = 500;
const BowlingThought: React.FC<{ t: number }> = ({ t }) => {
  const roll = prog(t, word('guess', 4), word('guess', 7));
  const strike = t >= word('guess', 7);
  return (
    <g>
      <g transform="translate(0,-20)"><Cloud w={300} fill="#c9c1ea" /></g>
      {[[-70, -10], [-40, -30], [-10, -10], [20, -30]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x + 40},${y}) rotate(${strike ? (i % 2 ? 40 : -35) * EASE_OUT(prog(t, word('guess', 7), word('guess', 7) + 0.3)) : 0})`}>
          <Vol><path d="M 0,-34 C 10,-34 12,-22 8,-14 C 14,-4 14,14 8,20 L -8,20 C -14,14 -14,-4 -8,-14 C -12,-22 -10,-34 0,-34 Z" fill="#ffffff" {...kst(4)} /></Vol>
          <rect x={-8} y={-18} width={16} height={5} fill="#ff595e" />
        </g>
      ))}
      <g transform={`translate(${-130 + roll * 150},10)`}><Vol><circle r={26} fill="#6a4c93" {...kst(4)} /></Vol></g>
    </g>
  );
};

const Board: React.FC<{ t: number }> = ({ t }) => {
  const on1 = within(t, BOARD_IN, BOARD_OUT);
  const on2 = within(t, BOARD2_IN, BOARD2_OUT);
  if (!on1 && !on2) return null;
  const at = on1 ? BOARD_IN : BOARD2_IN;
  const until = on1 ? BOARD_OUT : BOARD2_OUT;
  const sc = popIn(t, at) * (1 - prog(t, until - 0.25, until));
  const inner = (() => {
    // 1. thunder = the sound of lightning
    if (t < S('hot')) {
      const p = popIn(t, word('what', 2));
      return (
        <g>
          <g transform="translate(-220,0)"><Bolt d={zig(-30, -150, 30, 150, 5, 40, 2)} w={14} /></g>
          <text x={0} y={30} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={120} fill={KINK}>=</text>
          <g transform={`translate(230,0) scale(${p})`}>
            <Vol><path d="M -70,-40 L -30,-40 L 30,-100 L 30,100 L -30,40 L -70,40 Z" fill="#4cc9f0" {...kst(6)} /></Vol>
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M ${60 + i * 34},-${50 + i * 25} Q ${90 + i * 40},0 ${60 + i * 34},${50 + i * 25}`} fill="none" stroke={KINK} strokeWidth={9} strokeLinecap="round"
                opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 4 - i))} />
            ))}
          </g>
        </g>
      );
    }
    // 2. super hot → the air around it heats up → pushes out → BOOM (rings)
    if (t < S('clap_q')) {
      const heat = prog(t, S('hot'), E('hot'));
      const pushP = prog(t, S('push'), PUSH_BOOM + 0.6);
      const boomK = within(t, PUSH_BOOM, PUSH_BOOM + 1.2) ? 1 : 0;
      return (
        <g>
          {/* air bits around the bolt: jiggle when hot, fly outward on the push */}
          {Array.from({ length: 22 }).map((_, i) => {
            const a = (i / 22) * Math.PI * 2;
            const r = 120 + (i % 3) * 40 + pushP * 260 + Math.sin(t * (6 + heat * 14) + i) * (4 + heat * 10);
            return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r * 0.6} r={12} fill={heat > 0.3 ? '#ff924c' : '#a0c4ff'} opacity={1 - prog(t, PUSH_BOOM + 0.2, PUSH_BOOM + 0.8)} {...kst(3)} />;
          })}
          {[0, 1, 2].map((i) => {
            const p = prog(t, PUSH_BOOM + i * 0.15, PUSH_BOOM + 0.9 + i * 0.15);
            return p > 0 && p < 1 ? <ellipse key={i} rx={80 + p * 420} ry={50 + p * 250} fill="none" stroke="#ffca3a" strokeWidth={16 * (1 - p)} /> : null;
          })}
          <Bolt d={zig(-30, -170, 30, 170, 5, 40, 3)} w={14} />
          <circle r={70 + heat * 30} fill="#ffca3a" opacity={0.25 * heat} />
          {/* thermometer */}
          <g transform="translate(330,-30)">
            <rect x={-22} y={-150} width={44} height={260} rx={22} fill="#ffffff" {...kst(6)} />
            <rect x={-12} y={100 - 230 * heat} width={24} height={230 * heat} rx={12} fill="#ff595e" />
            <Vol><circle cx={0} cy={130} r={38} fill="#ff595e" {...kst(6)} /></Vol>
          </g>
          {boomK > 0 && <text x={-260} y={-140} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={110} fill="#ffca3a" stroke={KINK} strokeWidth={10} paintOrder="stroke"
            transform={`rotate(-8,-260,-140) scale(${popIn(t, PUSH_BOOM)})`}>BOOM!</text>}
        </g>
      );
    }
    // 3. a bit like a giant clap
    if (t < BOARD_OUT) {
      const c = Math.abs(Math.sin((t - S('clap_q')) * 5));
      return (
        <g>
          {[-1, 1].map((s) => (
            <g key={s} transform={`translate(${s * (30 + c * 90)},0) rotate(${s * 12}) scale(${s},1)`}>
              <Vol><path d="M -60,-90 Q -70,-140 -40,-140 L -40,-70 Q -40,-160 -10,-160 Q 10,-160 10,-70 L 10,-150 Q 10,-180 35,-180 Q 60,-180 60,-70 L 60,90 Q 60,140 0,140 Q -70,140 -70,60 Z"
                fill="#ffd3b0" {...kst(6)} /></Vol>
            </g>
          ))}
          {c < 0.2 && <text x={0} y={-200} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={90} fill="#ffca3a" stroke={KINK} strokeWidth={9} paintOrder="stroke">CLAP!</text>}
        </g>
      );
    }
    // 4. the race: the flash zooms, the boom comes after
    if (t < S('far')) {
      const flashX = -190 + 560 * EASE_OUT(prog(t, ZOOM - 0.2, ZOOM + 0.35));
      const boomX = -150 + 470 * prog(t, S('slow') + 0.3, E('slow') + 1.2);
      return (
        <g>
          {[-90, 110].map((y, i) => (
            <g key={i}>
              <rect x={-250} y={y - 60} width={680} height={120} rx={60} fill={i ? '#ffe5d0' : '#e3f6ff'} {...kst(5)} />
              <line x1={400} y1={y - 60} x2={400} y2={y + 60} stroke={KINK} strokeWidth={8} strokeDasharray="14 12" />
              <text x={-270} y={y + 16} textAnchor="end" fontFamily={FONT_TOON} fontWeight={700} fontSize={48} fill={i ? '#ff924c' : '#1982c4'}>{i ? 'SOUND' : 'LIGHT'}</text>
            </g>
          ))}
          <g transform={`translate(${flashX},-90)`}>
            <Bolt d={zig(-10, -45, 10, 45, 4, 16, 4)} w={8} />
            {t > ZOOM - 0.2 && t < ZOOM + 0.4 && [0, 1, 2].map((i) => <line key={i} x1={-60 - i * 10} y1={-20 + i * 20} x2={-140 - i * 30} y2={-20 + i * 20} stroke="#4cc9f0" strokeWidth={6} strokeLinecap="round" />)}
          </g>
          {t > S('slow') && (
            <g transform={`translate(${boomX},110)`}>
              <text textAnchor="middle" y={22} fontFamily={FONT_TOON} fontWeight={700} fontSize={64} fill="#ff924c" stroke={KINK} strokeWidth={7} paintOrder="stroke"
                transform={`rotate(${Math.sin(t * 6) * 4})`}>BOOM</text>
            </g>
          )}
        </g>
      );
    }
    // 5. far = rumble, rumble · close = CRACK
    if (t < S('quiz')) {
      const close = t >= S('near');
      return (
        <g>
          {!close ? (
            <g>
              <rect x={-460} y={60} width={920} height={190} fill="#8bc34a" />
              <g transform="translate(240,-30)"><Cloud w={200} fill="#8a7dbd" /><g opacity={Math.abs(Math.sin(t * 3))}><Bolt d={zig(0, 30, 10, 110, 3, 10, 5)} w={5} /></g></g>
              <g transform="translate(-250,40)"><Vol><path d="M -90,0 L 0,-80 L 90,0 L 90,110 L -90,110 Z" fill="#ffd166" {...kst(6)} /></Vol></g>
              <path d={`M -80,-120 Q -40,${-150 + Math.sin(t * 5) * 10} 0,-120 T 80,-120 T 160,-120`} fill="none" stroke="#6a4c93" strokeWidth={10} strokeLinecap="round" />
              <text x={-60} y={-170} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={60} fill="#6a4c93">rumble, rumble…</text>
              <text x={240} y={150} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill={KINK}>far away</text>
            </g>
          ) : (
            <g>
              <rect x={-460} y={60} width={920} height={190} fill="#8bc34a" />
              <g transform="translate(60,-140)"><Cloud w={560} fill="#7d6fb0" glow={within(t, CRACK - 0.05, CRACK + 0.5) ? 1 : 0.2} /></g>
              {t > CRACK - 0.05 && <Bolt d={zig(40, -80, 120, 160, 5, 40, 6)} w={12} fade={prog(t, CRACK + 0.5, CRACK + 0.9)} />}
              <g transform="translate(-280,60)"><Vol><path d="M -90,0 L 0,-80 L 90,0 L 90,110 L -90,110 Z" fill="#ffd166" {...kst(6)} /></Vol></g>
              {t > CRACK && <text x={-170} y={-150} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={130} fill="#ffe066" stroke={KINK} strokeWidth={12} paintOrder="stroke"
                transform={`rotate(-6,-170,-150) scale(${popIn(t, CRACK)})`}>CRACK!</text>}
              <text x={260} y={210} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill={KINK}>close by</text>
            </g>
          )}
        </g>
      );
    }
    // 6. quiz: the flash or the boom?
    const done = t >= QUIZ_ANS;
    return (
      <g>
        {[0, 1].map((i) => {
          const x = i ? 220 : -220;
          const win = i === 0 && done;
          return (
            <g key={i} transform={`translate(${x},0) scale(${popIn(t, S('quiz') + 0.3 + i * 0.3) * (win ? 1.08 : 1)})`}>
              <rect x={-180} y={-190} width={360} height={380} rx={40} fill={i ? '#ffe5d0' : '#e3f6ff'} {...kst(7)} />
              {i === 0 ? <Bolt d={zig(-20, -120, 20, 70, 4, 34, 7)} w={12} /> : (
                <g transform="translate(0,-30)">
                  <Vol><path d={Array.from({ length: 16 }).map((_, j) => { const a = (j / 16) * Math.PI * 2; const r = j % 2 ? 60 : 115; return `${j ? 'L' : 'M'} ${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`; }).join(' ') + ' Z'}
                    fill="#ff924c" {...kst(6)} /></Vol>
                  {[0, 1, 2].map((j) => <path key={j} d={`M ${130 + j * 22},-${30 + j * 14} Q ${146 + j * 26},0 ${130 + j * 22},${30 + j * 14}`} fill="none" stroke={KINK} strokeWidth={6} strokeLinecap="round" />)}
                </g>
              )}
              <text y={160} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={56} fill={KINK}>{i ? 'BOOM' : 'FLASH'}</text>
            </g>
          );
        })}
      </g>
    );
  })();
  return (
    <g transform={`translate(${PX},${PY}) scale(${sc})`}>
      <defs><clipPath id="d75board"><rect x={-PW / 2} y={-PH / 2} width={PW} height={PH} rx={36} /></clipPath></defs>
      <rect x={-PW / 2 - 20} y={-PH / 2 - 20} width={PW + 40} height={PH + 40} rx={52} fill="#b8a4e3" {...kst(8)} />
      <rect x={-PW / 2} y={-PH / 2} width={PW} height={PH} rx={36} fill="#fffaf0" />
      <g clipPath="url(#d75board)">{inner}</g>
      <rect x={-PW / 2} y={-PH / 2} width={PW} height={PH} rx={36} fill="none" {...kst(6)} />
    </g>
  );
};

export default function KidsScience075() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const shake = shakeOf(t, HITS);
  const yay = hopAt(t, YAY_HOPS, { h: 70 });
  const { glow } = flashAt(t);
  const look: [number, number] = within(t, BOARD_IN, BOARD_OUT) || within(t, BOARD2_IN, BOARD2_OUT) ? [0, -0.8] : t < E('open') + 0.4 ? [0.4, -0.7] : [0, -0.1];
  const [bfx, bfy] = critterFaceAt(X.bobo, yAt(X.bobo, BS), BS);

  return (
    <>
      <ActionStage cam={cam} shake={shake} blur={cam.blur}>
        <Backdrop place={KITCHEN} w={W} h={H} t={t} fx={false} dim={0.12} />
        <WindowStorm t={t} />
        {/* the whole room glows a little on a flash (soft, never a white screen) */}
        <rect width={W} height={H} fill="#fff8c4" opacity={glow * 0.12} />
        <PlaceLight place={KITCHEN}>
          <Critter polish acting spec={HOOT_HERO} x={X.hoot} y={yAt(X.hoot, HS)} scale={HS} expr={exprAt(t, HOOT_E)} look={[0.6, -0.3]}
            {...speechAt(VO, 'hoot', t)} armL={poseAt(t, HOOT_R)} armR={poseAt(t, HOOT_A)}
            facing={1} hop={yay.hop} squash={yay.squash} />
          <Critter polish acting spec={BOBO_HERO} x={X.bobo} y={yAt(X.bobo, BS)} scale={BS} expr={exprAt(t, BOBO_E)} look={within(t, S('tummy'), 99) ? [0, 0.6] : look}
            {...speechAt(VO, 'bobo', t)} armL={poseAt(t, BOBO_A)} armR={poseAt(t, BOBO_A)} facing={-1}
            hop={yay.hop} squash={yay.squash} tilt={within(t, 0, E('eek')) ? Math.sin(t * 22) * 3 * (1 - prog(t, 0, 1.2)) : 0} />
          <Kid polish acting spec={LEO_HERO} x={X.leo} y={yAt(X.leo, KS)} scale={KS} expr={exprAt(t, LEO_E)} look={look} {...speechAt(VO, 'leo', t)}
            armL={poseAt(t, LEO_L)} armR={poseAt(t, LEO_R)} hop={yay.hop} squash={yay.squash} />
          <Kid polish acting spec={MILA_HERO} x={X.mila} y={yAt(X.mila, KS)} scale={KS} expr={exprAt(t, MILA_E)} look={look} {...speechAt(VO, 'mila', t)}
            armL={poseAt(t, MILA_L)} armR={poseAt(t, MILA_R)} hop={yay.hop} squash={yay.squash} />
        </PlaceLight>
        <Board t={t} />
        {/* Leo's wrong guess: giants bowling in the clouds */}
        {within(t, word('guess', 2), S('good') + 1.0) && (
          <g transform={`translate(${X.leo + 270},${face(X.leo, KS) - 330}) scale(${popIn(t, word('guess', 2)) * 0.9})`}>
            <Bubble x={0} y={0} w={420} h={300} tx={-170} ty={230}>
              <BowlingThought t={t} />
            </Bubble>
          </g>
        )}
        {/* FX */}
        <ImpactStar t={t} at={BOOM0} x={575} y={520} s={0.8} text="BOOM!" />
        <StageWord t={t} at={word('guess', 7)} until={S('good') - 0.2} text="STRIKE!" x={X.leo + 270} y={face(X.leo, KS) - 560} size={80} color="#ff595e" rot={-6} />
        <StageWord t={t} at={S('clap1')} until={S('clap2') - 0.1} text="CLAP!" x={X.mila} y={face(X.mila, KS) - 260} size={80} color="#4cc9f0" rot={-6} />
        <StageWord t={t} at={S('clap2')} until={S('clap3') - 0.1} text="CLAP!" x={X.leo} y={face(X.leo, KS) - 260} size={80} color="#8ac926" rot={5} />
        <ImpactStar t={t} at={BOBO_BOOM} x={X.bobo} y={bfy - 260} s={0.9} text="BOOM!" />
        <StageWord t={t} at={BOBO_BOOM + 0.5} until={S('why') - 0.3} text="BOOM!" x={X.bobo + 40} y={bfy - 290} size={110} color="#ffca3a" rot={-6} />
        <Dust t={t} at={BOBO_BOOM + 0.6} x={X.bobo} y={yAt(X.bobo, BS)} s={0.8} />
        <MotionLines t={t} from={BOBO_BOOM} to={BOBO_BOOM + 0.5} x={X.bobo} y={bfy} dir={90} n={4} len={140} spread={220} />
        <StageWord t={t} at={word('tummy', 0)} until={word('tummy', 2)} text="rumble…" x={bfx + 30} y={bfy + 200} size={60} color="#a07850" rot={4} />
        <Reaction kind="!" t={t} at={0.2} until={E('eek') + 0.3} x={X.bobo + 30} y={bfy - 150} s={0.75} />
        <Reaction kind="?" t={t} at={S('why')} until={E('why') + 0.3} x={X.mila} y={face(X.mila, KS) - 240} s={0.7} />
        <Reaction kind="sweat" t={t} at={E('quiz_leo') + 0.3} until={S('quiz_ok')} x={X.leo + 60} y={face(X.leo, KS) - 220} s={0.7} />
        <Reaction kind="heart" t={t} at={S('cozy')} until={E('cozy') + 0.6} x={X.leo} y={face(X.leo, KS) - 240} s={0.75} />
        <Reaction kind="sweat" t={t} at={word('tummy', 2)} until={word('tummy', 4)} x={bfx + 90} y={bfy - 180} s={0.7} />
      </ActionStage>

      {/* screen-space */}
      <PopText t={t} at={0.4} until={S('eek') - 0.1} text="WHAT WAS THAT?" y={170} size={110} color="#ffe066" />
      <PopText t={t} at={S('word')} until={S('what') - 0.1} text="⚡ THUNDER ⚡" y={170} size={130} color="#ffe066" />
      <PopText t={t} at={E('word2') + 0.1} until={S('what') - 0.1} text="🗣️ Your turn!" y={1420} size={80} color="#ffffff" rot={2} />
      <PopText t={t} at={word('what', 3)} until={S('hot') - 0.1} text="THE SOUND OF LIGHTNING!" y={150} size={84} color="#ffffff" />
      <PopText t={t} at={word('hot', 1)} until={S('push') - 0.1} text="SUPER HOT!" y={150} size={120} color="#ff595e" />
      <PopText t={t} at={S('push')} until={S('clap_q') - 0.1} text="THE AIR PUSHES OUT!" y={150} size={96} color="#4cc9f0" />
      <PopText t={t} at={S('clap_q')} until={S('why') - 0.2} text="LIKE A GIANT CLAP!" y={170} size={100} color="#ffca3a" />
      <PopText t={t} at={S('why')} until={BOARD2_IN} text="FLASH FIRST? 🤔" y={170} size={110} color="#ffffff" />
      <PopText t={t} at={word('fast', 1)} until={S('slow') - 0.1} text="LIGHT IS SUPER FAST!" y={150} size={96} color="#4cc9f0" />
      <PopText t={t} at={S('slow')} until={S('far') - 0.1} text="SOUND COMES AFTER" y={150} size={96} color="#ff924c" />
      <PopText t={t} at={S('far')} until={S('near') - 0.1} text="FAR = RUMBLE" y={150} size={110} color="#b8a4e3" />
      <PopText t={t} at={S('near')} until={S('quiz') - 0.1} text="CLOSE = CRACK!" y={150} size={110} color="#ffe066" />
      <PopText t={t} at={S('quiz') + 0.1} until={QUIZ_ANS - 0.1} text="WHAT COMES FIRST?" y={150} size={100} color="#ffffff" />
      <ThinkTimer t={t} from={beat(E('quiz') + 0.1)} to={S('quiz_leo') - 0.1} x={940} y={1150} r={100} />
      <AnswerMark t={t} at={E('quiz_leo') + 0.2} until={BOARD2_OUT} ok={false} x={PX + 220} y={PY - 140} />
      <AnswerMark t={t} at={word('quiz_a', 4)} until={BOARD2_OUT} ok x={PX - 220} y={PY - 140} />
      <PopText t={t} at={S('quiz_ok')} until={S('rule') - 0.1} text="FLASH, THEN BOOM!" y={150} size={100} color="#ffe066" />
      <PopText t={t} at={word('rule', 1)} until={S('cozy') - 0.1} text="WHEN THUNDER ROARS, GO INDOORS!" y={200} size={54} color="#ffffff" />
      <PopText t={t} at={S('cozy')} until={S('tummy') - 0.1} text="SAFE AND COZY 💛" y={200} size={100} color="#ffca3a" />
      <Confetti t={t} at={S('quiz_ok')} y={600} />
      <Confetti t={t} at={E('rule_a')} y={600} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} y={1590} />
    </>
  );
}
