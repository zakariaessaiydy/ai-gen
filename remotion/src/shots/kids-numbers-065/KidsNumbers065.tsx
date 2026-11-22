// TINY SPARKS · Day 65 · 🔢 Numbers & Math #10 — "Count the Stars" (LONG 16:9)
// kids-shorts/tiny-sparks/numbers/day-065-count-the-stars. Cues from VO via K (keys.gen.ts).
// COLD OPEN (no ident): night at the camp, the first star pops at 0.3 s — "Look! A star! One!" → premise (count all the
// stars before bedtime) → 1→10, every number THREE ways (a star with a rainbow badge pops in 2 rows of 5 · the big
// numeral · Mila's fingers), gags: Bobo wants to eat the cookie-star (3) · Hoot: stars are giant balls of light, the Sun
// is a star · a cloud hides the stars — peekaboo, still 6 · Bobo gets sleepy (9) → recount 1→10 together → the CARD
// GAME (sky stars hidden so only the card counts): find 5 (Bobo ✗ 8) · find 7 · how many? 4 · find 3 · how many? 6 · which
// cloud has more? 5 > 2 → STAR STICKERS: 2 + 3 = 5 (the groups slide together) · 5 − 2 = 3 (a cloud covers two) →
// remember (5) → bedtime countdown 10→1 (each star closes its eyes) → goodnight → bye + star iris.
// Facts: stars are huge balls of glowing gas, very far away; the Sun is a star (NASA Space Place).
import React from 'react';
import { Kid, kidFaceAt, type KArm } from '../../lib/kids/kid';
import { Critter, critterFaceAt, type CArm } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, HOOT_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { Backdrop, PlaceLight, standY } from '../../lib/kids/places';
import { AnswerMark, Bubble, Confetti, FONT_TOON, KidsCaptions, PopText, ThinkTimer, useT } from '../../lib/kids/kit';
import { speechAt } from '../../lib/kids/acting';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, Reaction, StageWord, StarWipe, directorCam, hopAt, onBeat, type Shot } from '../../lib/kids/energy';
import { exprAt, lookAt, poseAt, type Keys } from '../../lib/kids/smooth';
import { voKeys, wordHops, type Span } from '../../lib/kids/cues';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsNumbers065', durationInSeconds: 317.9, fps: 30, width: 1920, height: 1080 };

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
const beat = (x: number) => onBeat(x, 0);
const k = (s: string) => s as Key;
const RB = ['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ff6fa5', '#4cc9f0', '#52b788', '#f15bb5'];
const NUM_WORDS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN'];

// ── place + blocking
const PLACE = 'camp-night' as const;
const KS = 0.55;
const BS = 0.6;
const HS = 0.5;
const X = { mila: 600, bobo: 1300, hoot: 1720 };
const yAt = (x: number, s: number) => standY(PLACE, x, W, H, { halfW: 150 * s });
// the 10 sky stars: 2 rows of 5
const SKY: [number, number][] = Array.from({ length: 10 }).map((_, i) => [520 + (i % 5) * 220, i < 5 ? 215 : 400]);
const STAR_AT = [S('s1') + 0.15, S('s2') + 0.9, S('s3'), S('s4'), S('s5'), S('s6'), S('s7'), S('s8'), S('s9'), word('s10', 2)];
const RE_AT = Array.from({ length: 10 }).map((_, i) => S(k(`r${i + 1}`)));
const SLEEP_AT = Array.from({ length: 10 }).map((_, i) => S(k(`d${i + 1}`)));
const GAME0 = S('game') - 0.3;
const NIGHT0 = S('night') - 0.3;
const REM0 = S('rem') - 0.3;
const skyOn = (t: number) => t < GAME0 || t >= NIGHT0;
const CLOUD6 = [S('gag6') - 0.2, S('gag6') + 1.4, S('gag6a') - 0.1, S('gag6a') + 1.4]; // in · covered · out
const END_IRIS = E('bye2') + 0.6;

// ── arms, faces, eyes
const nAt = (t: number) => STAR_AT.filter((a) => t >= a).length;
const COUNTING: [number, number] = [S('s1'), S('recount') - 0.2];
const BYE: Span<KArm> = [S('bye'), 999, 'wave'];
const MILA_R = voKeys<KArm>(VO, 'mila', 'present', 'down', [
  [COUNTING[0], COUNTING[1], 'count'], [S('gag3a'), E('gag3a'), 'present'], [S('gag6a'), word('gag6a', 1), 'cheeks'],
  [S('gA_no'), E('gA_no'), 'point'], [S('gC_a'), E('gC_a'), 'count'], [S('gF_a'), E('gF_a'), 'point'], [S('sub_a'), E('sub_a'), 'count'],
  [S('ra2'), E('ra2'), 'cheer'], [S('ra4'), E('ra4'), 'count'], [NIGHT0, S('gn'), 'count'], [S('gn'), S('bye'), 'down'], BYE,
]);
const MILA_L = voKeys<KArm>(VO, null, 'down', 'down', [
  [STAR_AT[5] - 0.3, COUNTING[1], 'count'], [S('gag6a'), word('gag6a', 1), 'cheeks'], [S('ra4'), E('ra4'), 'count'],
  [NIGHT0, SLEEP_AT[4], 'count'], BYE,
]);
const fingersR = (t: number): number => {
  if (within(t, COUNTING[0], COUNTING[1])) { const n = nAt(t); return n > 5 ? Math.max(1, n - 5) : Math.max(1, n); }
  if (within(t, S('gC_a'), E('gC_a'))) return Math.max(1, timeWords(VO[K.gC_a]).filter((w, j) => j < 4 && t >= w.start).length);
  if (within(t, S('sub_a'), E('sub_a'))) return Math.max(1, timeWords(VO[K.sub_a]).filter((w, j) => j < 3 && t >= w.start).length);
  if (within(t, S('ra4'), E('ra4'))) return 5;
  if (within(t, NIGHT0, S('gn'))) { const left = 10 - SLEEP_AT.filter((a) => t >= a).length; return left > 5 ? left - 5 : Math.max(1, left); }
  return 0;
};
const fingersL = (t: number): number => {
  if (within(t, COUNTING[0], COUNTING[1]) && nAt(t) > 5) return 5;
  if (within(t, S('ra4'), E('ra4'))) return 5;
  if (within(t, NIGHT0, S('gn'))) { const left = 10 - SLEEP_AT.filter((a) => t >= a).length; return left > 5 ? 5 : 0; }
  return 0;
};
const MILA_E = voKeys<KExpr>(VO, 'mila', 'happy', 'smile', [
  [0, E('s1') + 0.4, 'wow'], [S('gag3a'), E('gag3a'), 'laugh'], [S('gag6'), S('gag6a'), 'surprised'], [S('gag6a'), E('gag6a') + 0.4, 'laugh'],
  [S('s10b'), E('s10b') + 0.6, 'laugh'], [NIGHT0, 999, 'smile'],
]);
const BOBO_A = voKeys<CArm>(VO, 'bobo', 'wave', 'down', [
  [S('gag3'), E('gag3') + 0.3, 'up'], [S('s5b'), E('s5b'), 'wave'], [S('gag6'), S('gag6a'), 'cheeks'], [S('s9b'), E('s9b'), 'cheeks'],
  [S('s10b'), E('s10b') + 0.4, 'cheer'], [S('gA_bobo'), E('gA_bobo'), 'point'], [S('gB_a'), E('gB_a'), 'point'], [S('gD_a'), E('gD_a'), 'point'],
  [S('add_a'), E('add_a'), 'point'], [S('gn'), E('gn'), 'hug'], [S('bye'), 999, 'wave'],
]);
const BOBO_E = voKeys<KExpr>(VO, 'bobo', 'happy', 'smile', [
  [S('gag3'), E('gag3') + 0.3, 'happy'], [S('gag3a'), E('gag3a'), 'oops'], [S('gag6'), S('gag6a'), 'surprised'], [S('gag6a'), E('gag6a') + 0.4, 'laugh'],
  [S('s9b'), E('s9b') + 0.6, 'sleepy'], [S('s10b'), E('s10b') + 0.6, 'laugh'], [E('gA_bobo'), S('gB'), 'oops'], [S('gn'), 999, 'sleepy'], [S('bye2'), 999, 'happy'],
]);
const HOOT_A = voKeys<CArm>(VO, 'hoot', 'point', 'down', [[S('bye'), 999, 'wave']]);
const HOOT_E = voKeys<KExpr>(VO, 'hoot', 'happy', 'smile', [[S('fact'), E('fact'), 'wow'], [NIGHT0, 999, 'smile']]);
const UP: [number, number] = [0, -0.9];
const LOOK_M: Keys<[number, number]> = [[0, UP], [S('premise'), [0.6, -0.2]], [S('s2'), UP], [S('fact'), [0.8, -0.1]], [S('s4'), UP], [GAME0, [0.4, -0.7]], [NIGHT0, UP], [S('bye'), [0, 0]]];
const LOOK_B: Keys<[number, number]> = [[0, UP], [S('premise'), [-0.6, -0.2]], [S('s2'), UP], [S('fact'), [0.8, -0.1]], [S('s4'), UP], [GAME0, [-0.4, -0.7]], [NIGHT0, UP], [S('bye'), [0, 0]]];
const HOPS = [S('s10b') + 0.1, S('s10b') + 0.6, S('r_yay') + 0.2, ...wordHops(VO, [K.add_r, K.ra5])];
const GRAB = [word('gag3', 9), word('gag3', 9) + 0.7];

// ── camera
const WIDE = { z: 1.0, x: 960, y: 540 };
const SKYCAM = { z: 1.08, x: 960, y: 470 };
const mFace = kidFaceAt(X.mila, yAt(X.mila, KS), KS)[1] + 70;
const bFace = critterFaceAt(X.bobo, yAt(X.bobo, BS), BS)[1] + 70;
const hFace = critterFaceAt(X.hoot, yAt(X.hoot, HS), HS)[1] + 60;
const SHOTS: Shot[] = [
  { t: 0, ...SKYCAM, move: 'cut', push: 0.02 },
  { t: S('premise') - 0.1, z: 1.45, x: X.bobo - 40, y: bFace, move: 'snap', push: 0.01 },
  { t: S('s2') - 0.2, ...SKYCAM, move: 'smooth', dur: 0.8, push: 0.015 },
  { t: S('s2t') - 0.1, z: 1.55, x: X.mila + 40, y: mFace, move: 'snap' },
  { t: S('s3') - 0.2, ...SKYCAM, move: 'smooth', dur: 0.6, push: 0.015 },
  { t: S('gag3') - 0.1, z: 1.2, x: X.bobo - 150, y: 470, move: 'smooth', dur: 0.8 },
  { t: S('fact') - 0.1, z: 1.5, x: X.hoot - 120, y: hFace - 60, move: 'whip', push: 0.01 },
  { t: S('s4') - 0.2, ...SKYCAM, move: 'whip', push: 0.015 },
  { t: S('s5t') - 0.1, z: 1.55, x: X.mila + 40, y: mFace, move: 'snap' },
  { t: S('s6') - 0.2, ...SKYCAM, move: 'smooth', dur: 0.6, push: 0.015 },
  { t: S('gag6') - 0.1, ...WIDE, move: 'smooth', dur: 0.8, push: 0.01 },
  { t: S('s7') - 0.2, ...SKYCAM, move: 'smooth', dur: 0.6, push: 0.015 },
  { t: S('s9b') - 0.1, z: 1.45, x: X.bobo - 40, y: bFace, move: 'snap' },
  { t: S('s10') - 0.1, ...SKYCAM, move: 'smooth', dur: 0.6 },
  { t: S('s10b') - 0.1, ...WIDE, move: 'smooth', dur: 0.8, push: 0.01 },
  { t: S('recount') - 0.1, ...SKYCAM, move: 'smooth', dur: 0.8, push: 0.02 },
  { t: GAME0, ...SKYCAM, move: 'cut', push: 0.01 },
  { t: S('gA_bobo') - 0.1, z: 1.45, x: X.bobo - 40, y: bFace, move: 'snap' },
  { t: S('gA_no') - 0.1, ...SKYCAM, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('math') - 0.2, ...SKYCAM, move: 'cut', push: 0.01 },
  { t: REM0, ...SKYCAM, move: 'cut', push: 0.006 },
  { t: S('ra1') - 0.1, z: 1.45, x: X.bobo - 40, y: bFace, move: 'snap' },
  { t: E('ra1') + 0.6, ...SKYCAM, move: 'smooth', dur: 0.6 },
  { t: S('ra4') - 0.1, z: 1.5, x: X.mila + 40, y: mFace, move: 'snap' },
  { t: E('ra4') + 0.6, ...SKYCAM, move: 'smooth', dur: 0.6 },
  { t: NIGHT0, ...WIDE, move: 'smooth', dur: 1.2, push: 0.012 },
  { t: S('gn') - 0.2, z: 1.15, x: 960, y: 560, move: 'smooth', dur: 2.0, push: 0.01 },
  { t: S('bye') - 0.2, ...WIDE, move: 'smooth', dur: 0.8 },
];
SHOTS.sort((a, b) => a.t - b.t);
const PUNCHES = [...STAR_AT, S('s10b')];

// ── drawings
const starPath = (r: number, ri = r * 0.48) =>
  Array.from({ length: 10 }).map((_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? ri : r;
    return `${i ? 'L' : 'M'} ${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`;
  }).join(' ') + ' Z';
const HStar: React.FC<{ r?: number; sleepy?: boolean; c?: string; face?: boolean; t?: number; glow?: number }> = ({ r = 56, sleepy, c = '#ffd23f', face = true, t = 0, glow = 1 }) => (
  <g>
    <circle r={r * 1.3} fill="#fff59d" opacity={0.18 * glow + 0.06 * Math.sin(t * 2)} />
    <Vol><path d={starPath(r)} fill={c} {...kst(5)} strokeLinejoin="round" /></Vol>
    {face && (
      <g transform={`scale(${r / 56})`}>
        {sleepy ? (
          <path d="M -20,-4 Q -13,2 -6,-4 M 6,-4 Q 13,2 20,-4" fill="none" {...kst(3.5)} />
        ) : (
          <g><ellipse cx={-12} cy={-4} rx={5} ry={7} fill={KINK} /><ellipse cx={12} cy={-4} rx={5} ry={7} fill={KINK} />
            <circle cx={-10} cy={-7} r={2} fill="#ffffff" /><circle cx={14} cy={-7} r={2} fill="#ffffff" /></g>
        )}
        <path d={sleepy ? 'M -5,11 Q 0,14 5,11' : 'M -8,10 Q 0,17 8,10'} fill="none" {...kst(3.5)} />
        <ellipse cx={-22} cy={8} rx={6} ry={4} fill="#ff8fab" opacity={0.6} /><ellipse cx={22} cy={8} rx={6} ry={4} fill="#ff8fab" opacity={0.6} />
      </g>
    )}
  </g>
);
const Badge: React.FC<{ n: number; s?: number }> = ({ n, s = 1 }) => (
  <g transform={`scale(${s})`}>
    <circle r={28} fill={RB[(n - 1) % 10]} {...kst(4)} />
    <text y={11} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={n > 9 ? 28 : 34} fill="#ffffff">{n}</text>
  </g>
);
const NightCloud: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <Vol><path d="M -260,70 Q -320,70 -320,10 Q -320,-60 -240,-66 Q -228,-160 -120,-160 Q -70,-230 24,-208 Q 108,-240 166,-160 Q 270,-170 282,-70 Q 340,-46 330,24 Q 318,70 260,70 Z" fill="#a99bd6" {...kst(8)} /></Vol>
    <circle cx={-60} cy={-40} r={8} fill={KINK} /><circle cx={40} cy={-40} r={8} fill={KINK} /><path d="M -30,-6 Q -10,10 10,-6" fill="none" {...kst(5)} />
  </g>
);
const Card: React.FC<{ w?: number; h?: number; children?: React.ReactNode }> = ({ w = 240, h = 300, children }) => (
  <g>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={30} fill="#ffffff" {...kst(7)} />
    {children}
  </g>
);
const Numeral: React.FC<{ n: number | string; c?: string; size?: number }> = ({ n, c = '#ffca3a', size = 170 }) => (
  <text y={size * 0.36} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={size} fill={c} stroke={KINK} strokeWidth={10} paintOrder="stroke">{n}</text>
);
const SunIcon: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={-7} y={-102} width={14} height={28} rx={7} fill="#ffca3a" transform={`rotate(${i * 36 + t * 12})`} />)}
    <Vol><circle r={66} fill="#ffd23f" {...kst(6)} /></Vol>
    <circle cx={-20} cy={-10} r={7} fill={KINK} /><circle cx={20} cy={-10} r={7} fill={KINK} /><path d="M -18,16 Q 0,30 18,16" fill="none" {...kst(5)} />
  </g>
);

// the game / sticker board in the sky (stage space)
const GAME_Y = 300;
const cardsFor = (t: number): { nums: string[]; good: number; bad?: number; q: Key; a: number } | null => {
  if (within(t, S('gA') - 0.3, S('gB') - 0.3)) return { nums: ['8', '5', '2'], good: 1, bad: 0, q: 'gA', a: word('gA_no', 6) };
  if (within(t, S('gB') - 0.3, S('gC') - 0.3)) return { nums: ['1', '4', '7'], good: 2, q: 'gB', a: word('gB_a', 3) };
  if (within(t, S('gD') - 0.3, S('gE') - 0.3)) return { nums: ['6', '3', '9'], good: 1, q: 'gD', a: S('gD_a') };
  return null;
};
const GameBoard: React.FC<{ t: number }> = ({ t }) => {
  const c = cardsFor(t);
  if (c) {
    return (
      <g>
        {c.nums.map((n, i) => {
          const x = 660 + i * 300;
          const ok = i === c.good && t >= c.a;
          return (
            <g key={n + i} transform={`translate(${x},${GAME_Y}) scale(${popIn(t, S(c.q) - 0.3 + i * 0.12) * (ok ? 1 + 0.08 * Math.sin(Math.min(1, (t - c.a) / 0.6) * Math.PI) : 1)})`}>
              <Card><Numeral n={n} c={RB[(Number(n) - 1) % 10]} /></Card>
            </g>
          );
        })}
        {c.bad !== undefined && <AnswerMark t={t} at={E(k(`${c.q}_bobo`)) + 0.1} until={S(c.q === 'gA' ? 'gB' : 'gC') - 0.3} ok={false} x={660 + c.bad * 300 + 90} y={GAME_Y - 120} size={0.55} />}
        <AnswerMark t={t} at={c.a} ok x={660 + c.good * 300 + 90} y={GAME_Y - 120} size={0.55} />
      </g>
    );
  }
  // how many stars on the card? (4, then 6)
  const many = within(t, S('gC') - 0.3, S('gD') - 0.3) ? { n: 4, q: 'gC' as Key, a: 'gC_a' as Key } : within(t, S('gE') - 0.3, S('gF') - 0.3) ? { n: 6, q: 'gE' as Key, a: 'gE_a' as Key } : null;
  if (many) {
    const ws = timeWords(VO[K[many.a]]);
    return (
      <g transform={`translate(960,${GAME_Y}) scale(${popIn(t, S(many.q) - 0.3)})`}>
        <Card w={620} h={360}>
          {Array.from({ length: many.n }).map((_, i) => {
            const cols = many.n === 4 ? 2 : 3;
            const x = (i % cols - (cols - 1) / 2) * 170;
            const y = (Math.floor(i / cols) - 0.5) * 140;
            const at = ws[i]?.start ?? 1e9;
            return (
              <g key={i} transform={`translate(${x},${y})`}>
                <g transform={`scale(${t >= at && t < at + 0.4 ? 1.2 : 1})`}><HStar r={52} t={t} /></g>
                {t >= at && <g transform={`translate(44,-44) scale(${popIn(t, at)})`}><Badge n={i + 1} s={0.8} /></g>}
              </g>
            );
          })}
        </Card>
      </g>
    );
  }
  // which cloud has more stars?
  if (within(t, S('gF') - 0.3, S('math') - 0.3)) {
    const ok = t >= S('gF_a');
    return (
      <g>
        {[2, 5].map((n, ci) => (
          <g key={n} transform={`translate(${ci ? 1240 : 680},${GAME_Y + 160}) scale(${popIn(t, S('gF') - 0.3 + ci * 0.15) * (ci && ok ? 1.08 : 1)})`}>
            <NightCloud s={0.75} />
            {Array.from({ length: n }).map((_, i) => <g key={i} transform={`translate(${(i - (n - 1) / 2) * 90},${-60 - (i % 2) * 30})`}><HStar r={38} t={t} face={false} /></g>)}
          </g>
        ))}
        <AnswerMark t={t} at={S('gF_a')} ok x={1480} y={GAME_Y + 20} size={0.6} />
      </g>
    );
  }
  return null;
};
// the sticker board: 2 + 3 = 5 · 5 − 2 = 3
const Stickers: React.FC<{ t: number }> = ({ t }) => {
  const add = within(t, S('math') - 0.2, S('sub_q') - 0.3);
  const sub = within(t, S('sub_q') - 0.3, REM0);
  if (!add && !sub) return null;
  const board = (
    <rect x={460} y={110} width={1000} height={380} rx={40} fill="#fff8e7" {...kst(8)} />
  );
  if (add) {
    const in3 = EASE_OUT(prog(t, word('add_q', 3), word('add_q', 3) + 0.6));
    const join = EASE_INOUT(prog(t, E('add_q') + 0.1, E('add_q') + 1.0));
    const ws = timeWords(VO[K.add_a]);
    const xs = (i: number) => (i < 2 ? 600 + i * 140 + join * 60 : 1000 + (i - 2) * 140 - join * 80 + (1 - in3) * 700);
    return (
      <g transform={`translate(960,300) scale(${popIn(t, S('math') - 0.2)}) translate(-960,-300)`}>
        {board}
        {Array.from({ length: 5 }).map((_, i) => {
          if (i >= 2 && t < word('add_q', 3)) return null;
          const at = ws[i]?.start ?? 1e9;
          return (
            <g key={i} transform={`translate(${xs(i)},300)`}>
              <HStar r={54} t={t} c={i < 2 ? '#ffd23f' : '#ffca3a'} />
              {t >= at && <g transform={`translate(44,-50) scale(${popIn(t, at)})`}><Badge n={i + 1} s={0.8} /></g>}
            </g>
          );
        })}
        {t < E('add_q') + 0.1 && t >= word('add_q', 3) && <text x={890} y={320} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={90} fill={KINK}>+</text>}
        {t >= S('add_r') && <g transform={`translate(960,450) scale(${popIn(t, S('add_r'))})`}><text textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={64} fill="#1982c4" stroke={KINK} strokeWidth={6} paintOrder="stroke">2 + 3 = 5</text></g>}
      </g>
    );
  }
  const cover = EASE_OUT(prog(t, word('sub_q', 6), word('sub_q', 6) + 0.8));
  const ws = timeWords(VO[K.sub_a]);
  return (
    <g transform={`translate(960,300) scale(${popIn(t, S('sub_q') - 0.3)}) translate(-960,-300)`}>
      {board}
      {Array.from({ length: 5 }).map((_, i) => {
        const at = ws[i]?.start ?? 1e9;
        return (
          <g key={i} transform={`translate(${620 + i * 170},290)`}>
            <HStar r={54} t={t} />
            {i < 3 && t >= at && <g transform={`translate(44,-50) scale(${popIn(t, at)})`}><Badge n={i + 1} s={0.8} /></g>}
          </g>
        );
      })}
      <g transform={`translate(${1700 - (1700 - 1210) * cover},300)`}><NightCloud s={0.62} /></g>
      {t >= S('sub_r') && <g transform={`translate(960,455) scale(${popIn(t, S('sub_r'))})`}><text textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={64} fill="#6a4c93" stroke={KINK} strokeWidth={6} paintOrder="stroke">5 − 2 = 3</text></g>}
    </g>
  );
};
// remember round pictures
const RemPic: React.FC<{ t: number }> = ({ t }) => {
  if (!within(t, REM0, NIGHT0)) return null;
  const q = t < S('rq2') - 0.2 ? 1 : t < S('rq3') - 0.2 ? 2 : t < S('rq4') - 0.2 ? 3 : t < S('rq5') - 0.2 ? 4 : 5;
  const at = S(k(`rq${q}`)) - 0.2;
  const ans = S(k(`ra${q}`));
  return (
    <g key={q} transform={`translate(960,300) scale(${popIn(t, at)})`}>
      <Card w={760} h={380}>
        {q === 1 && <g><text y={40} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={130} fill={t >= ans ? RB[4] : '#adb5bd'}>{t >= ans ? '5' : '?'}</text>
          <text x={-230} y={40} textAnchor="middle" fontSize={130}>✋</text></g>}
        {q === 2 && <g><g transform="translate(-170,0)"><SunIcon t={t} /></g><text x={40} y={30} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={110} fill={KINK}>=</text>
          <g transform="translate(210,0)">{t >= ans ? <HStar r={90} t={t} /> : <text y={40} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={130} fill="#adb5bd">?</text>}</g></g>}
        {q === 3 && <g>{[0, 1].map((i) => <g key={i} transform={`translate(${-290 + i * 90},-30)`}><HStar r={36} t={t} face={false} /></g>)}
          <text x={-120} y={-10} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={70} fill={KINK}>+</text>
          {[0, 1, 2].map((i) => <g key={i} transform={`translate(${-30 + i * 90},-30)`}><HStar r={36} t={t} face={false} /></g>)}
          <text x={0} y={130} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={100} fill={t >= ans ? RB[4] : '#adb5bd'}>{t >= ans ? '= 5' : '= ?'}</text></g>}
        {q === 4 && <g><text x={-150} y={50} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={170} fill={RB[8]} stroke={KINK} strokeWidth={8} paintOrder="stroke">9</text>
          <text x={0} y={30} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={100} fill={KINK}>→</text>
          <text x={170} y={50} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={170} fill={t >= ans ? RB[9] : '#adb5bd'} stroke={KINK} strokeWidth={8} paintOrder="stroke">{t >= ans ? '10' : '?'}</text></g>}
        {q === 5 && <g>{Array.from({ length: 10 }).map((_, i) => <g key={i} transform={`translate(${(i % 5 - 2) * 120},${i < 5 ? -70 : 70})`}><HStar r={40} t={t} face={false} />
          {t >= ans && <g transform="translate(34,-34)"><Badge n={i + 1} s={0.6} /></g>}</g>)}</g>}
      </Card>
    </g>
  );
};

export default function KidsNumbers065() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const hop = hopAt(t, HOPS, { h: 60 });
  const grab = hopAt(t, GRAB, { h: 110 });
  const nStars = nAt(t);
  const cloudX = t < CLOUD6[0] ? -700 : t < CLOUD6[1] ? -700 + (960 + 700) * EASE_OUT(prog(t, CLOUD6[0], CLOUD6[1])) : t < CLOUD6[2] ? 960 + Math.sin(t) * 10 : 960 + 1700 * EASE_INOUT(prog(t, CLOUD6[2], CLOUD6[3]));
  const sleepy = (i: number) => t >= SLEEP_AT[i];

  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
        <Backdrop place={PLACE} w={W} h={H} t={t} fx={false} />
        {/* soften the painted pin-prick stars, so only OUR stars count */}
        <defs><linearGradient id="d65sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#14183f" stopOpacity={0.5} /><stop offset="0.75" stopColor="#14183f" stopOpacity={0.3} /><stop offset="1" stopColor="#14183f" stopOpacity={0} /></linearGradient></defs>
        <rect width={W} height={680} fill="url(#d65sky)" />
        {/* the moon (calm) */}
        <g transform="translate(1600,140)"><circle r={90} fill="#fff8c4" opacity={0.15} /><path d="M 10,-60 A 60,60 0 1 0 50,30 A 48,48 0 1 1 10,-60 Z" fill="#fff3b0" {...kst(4)} /></g>
        {/* the 10 sky stars */}
        {skyOn(t) && SKY.map(([x, y], i) => {
          const at = STAR_AT[i];
          if (t < at) return null;
          const re = RE_AT[i];
          const bounce = within(t, re, re + 0.45) ? 1 + 0.25 * Math.sin(prog(t, re, re + 0.45) * Math.PI) : 1;
          const tw = 1 + 0.04 * Math.sin(t * 3 + i);
          return (
            <g key={i} transform={`translate(${x},${y + Math.sin(t * 1.2 + i) * 5}) scale(${popIn(t, at, 0.45) * bounce * tw})`}>
              <HStar r={68} t={t} sleepy={sleepy(i)} glow={sleepy(i) ? 0.3 : 1} />
              <g transform="translate(58,58)"><Badge n={i + 1} s={0.95} /></g>
            </g>
          );
        })}
        {/* the peekaboo cloud */}
        {within(t, CLOUD6[0], CLOUD6[3]) && <g transform={`translate(${cloudX},250)`}><NightCloud s={1.9} /></g>}
        <GameBoard t={t} />
        <Stickers t={t} />
        <RemPic t={t} />
        <PlaceLight place={PLACE}>
          <Critter polish acting spec={HOOT_HERO} x={X.hoot} y={yAt(X.hoot, HS)} scale={HS} expr={exprAt(t, HOOT_E)} look={[-0.6, -0.4]} {...speechAt(VO, 'hoot', t)}
            armL={poseAt(t, HOOT_A)} armR="down" facing={-1} />
          <Critter polish acting spec={BOBO_HERO} x={X.bobo} y={yAt(X.bobo, BS)} scale={BS} expr={exprAt(t, BOBO_E)} look={lookAt(t, LOOK_B)} {...speechAt(VO, 'bobo', t)}
            armL={poseAt(t, BOBO_A)} armR={poseAt(t, BOBO_A)} facing={-1} hop={hop.hop + grab.hop} squash={hop.squash + grab.squash} />
          <Kid polish acting spec={MILA_HERO} x={X.mila} y={yAt(X.mila, KS)} scale={KS} expr={exprAt(t, MILA_E)} look={lookAt(t, LOOK_M)} {...speechAt(VO, 'mila', t)}
            armL={poseAt(t, MILA_L)} armR={poseAt(t, MILA_R)} fingersR={fingersR(t)} fingersL={fingersL(t)} hop={hop.hop} squash={hop.squash} />
        </PlaceLight>
        {/* Hoot's "the Sun is a star" bubble */}
        {within(t, word('fact', 9), E('fact') + 1.2) && (
          <g transform={`translate(${X.hoot - 330},${yAt(X.hoot, HS) - 560}) scale(${popIn(t, word('fact', 9)) * 0.85})`}>
            <Bubble x={0} y={0} w={420} h={300} tx={160} ty={200}>
              <g transform="translate(-90,0) scale(0.8)"><SunIcon t={t} /></g>
              <text x={30} y={20} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={60} fill={KINK}>=</text>
              <g transform="translate(120,0)"><HStar r={60} t={t} /></g>
            </Bubble>
          </g>
        )}
        <StageWord t={t} at={word('gag3', 9)} until={E('gag3') + 0.5} text="YUM?" x={X.bobo - 60} y={yAt(X.bobo, BS) - 600} size={80} color="#d4a373" rot={-5} />
        <StageWord t={t} at={S('gag6a')} until={E('gag6a') + 0.3} text="PEEKABOO!" x={960} y={500} size={100} color="#ffca3a" rot={-4} />
        <StageWord t={t} at={word('s9b', 3)} until={E('s9b') + 0.4} text="YAWN…" x={X.bobo - 40} y={yAt(X.bobo, BS) - 580} size={80} color="#c77dff" rot={5} />
        <Reaction kind="!" t={t} at={S('gag6')} until={S('gag6a')} x={X.mila} y={yAt(X.mila, KS) - 500} s={0.6} />
        <Reaction kind="?" t={t} at={S('gag6') + 0.6} until={S('gag6a')} x={X.bobo} y={yAt(X.bobo, BS) - 520} s={0.6} />
        <Reaction kind="sweat" t={t} at={E('gA_bobo') + 0.1} until={S('gB')} x={X.bobo + 70} y={yAt(X.bobo, BS) - 440} s={0.55} />
        <Reaction kind="heart" t={t} at={S('gn')} until={E('gn') + 1} x={X.bobo} y={yAt(X.bobo, BS) - 520} s={0.6} />
      </ActionStage>

      {/* screen-space: the big numeral for each number (count · recount · countdown) */}
      {STAR_AT.map((a, i) => (
        <PopText key={`n${i}`} t={t} at={a} until={i < 9 ? Math.min(STAR_AT[i + 1] - 0.1, a + 4.5) : S('recount') - 0.1} text={`${i + 1}`} y={610} size={190} color={RB[i]} rot={0} />
      ))}
      {STAR_AT.map((a, i) => (
        <PopText key={`w${i}`} t={t} at={a + 0.5} until={i < 9 ? Math.min(STAR_AT[i + 1] - 0.1, a + 4.5) : S('recount') - 0.1} text={NUM_WORDS[i]} y={740} size={70} color="#ffffff" rot={0} />
      ))}
      {RE_AT.map((a, i) => <PopText key={`r${i}`} t={t} at={a} until={i < 9 ? RE_AT[i + 1] - 0.05 : S('r_yay') + 1} text={`${i + 1}`} y={610} size={190} color={RB[i]} rot={0} />)}
      {SLEEP_AT.map((a, i) => <PopText key={`d${i}`} t={t} at={a} until={i > 0 ? SLEEP_AT[i - 1] - 0.05 : S('gn') - 0.1} text={`${i + 1}`} y={610} size={180} color={RB[i]} rot={0} />)}
      <PopText t={t} at={S('premise') + 0.2} until={S('s2') - 0.1} text="COUNT THE STARS!" y={130} size={110} color="#ffca3a" />
      <PopText t={t} at={S('s2t')} until={S('s3') - 0.1} text="🗣️ YOUR TURN! ✌️" y={130} size={96} color="#ffffff" />
      <PopText t={t} at={S('s5t')} until={S('s6') - 0.1} text="HIGH FIVE! ✋" y={130} size={110} color="#ffffff" />
      <PopText t={t} at={S('gag6a')} until={S('s7') - 0.1} text="STILL 6!" y={130} size={110} color={RB[5]} />
      <PopText t={t} at={S('s10b')} until={S('recount') - 0.1} text="TEN STARS!" y={130} size={120} color={RB[9]} />
      <PopText t={t} at={S('game')} until={S('gA') - 0.1} text="STAR NUMBER GAME!" y={110} size={100} color="#ffca3a" />
      {(['gA', 'gB', 'gC', 'gD', 'gE', 'gF', 'add_q', 'sub_q'] as const).map((q) => (
        <ThinkTimer key={q} t={t} from={beat(E(q) + 0.1)} to={VO[K[q] + 1].start - 0.1} x={1780} y={170} r={84} />
      ))}
      <PopText t={t} at={S('gA') + 0.1} until={beat(E('gA') + 0.1)} text="FIND 5!" y={110} size={110} color={RB[4]} />
      <PopText t={t} at={S('gB') + 0.1} until={beat(E('gB') + 0.1)} text="FIND 7!" y={110} size={110} color={RB[6]} />
      <PopText t={t} at={S('gD') + 0.1} until={beat(E('gD') + 0.1)} text="FIND 3!" y={110} size={110} color={RB[2]} />
      <PopText t={t} at={S('gC') + 0.1} until={beat(E('gC') + 0.1)} text="HOW MANY?" y={110} size={110} color="#ffffff" />
      <PopText t={t} at={S('gE') + 0.1} until={beat(E('gE') + 0.1)} text="HOW MANY?" y={110} size={110} color="#ffffff" />
      <PopText t={t} at={S('gF') + 0.1} until={beat(E('gF') + 0.1)} text="WHICH HAS MORE?" y={110} size={100} color="#ffffff" />
      <PopText t={t} at={S('gF_a') + 0.3} until={S('math') - 0.1} text="5 IS MORE THAN 2!" y={110} size={96} color="#ffca3a" />
      <PopText t={t} at={S('math')} until={S('add_q') - 0.1} text="STAR STICKERS!" y={110} size={110} color="#ffca3a" />
      <PopText t={t} at={S('rem')} until={S('rq1') - 0.1} text="LET'S REMEMBER!" y={110} size={110} color="#ffca3a" />
      {[1, 2, 3, 4, 5].map((q) => <ThinkTimer key={q} t={t} from={beat(E(k(`rq${q}`)) + 0.1)} to={S(k(`ra${q}`)) - 0.1} x={1780} y={170} r={84} />)}
      <PopText t={t} at={S('night')} until={SLEEP_AT[9] - 0.1} text="GOODNIGHT, STARS!" y={130} size={100} color="#c77dff" />
      <PopText t={t} at={S('bye')} until={END_IRIS} text="SWEET DREAMS!" y={130} size={110} color="#ffca3a" />
      <Confetti t={t} at={S('s10b')} y={420} />
      <Confetti t={t} at={S('r_yay')} y={420} />
      <Confetti t={t} at={S('add_r')} y={420} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <StarWipe t={t} at={END_IRIS} dur={0.5} hold={5} color="#14183f" x={W / 2} y={H * 0.45} />
    </>
  );
}
