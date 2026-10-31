// TINY SPARKS · Day 51 · 🔢 Numbers & Math #8 — "Count the Butterflies" (LONG 16:9)
// kids-shorts/tiny-sparks/numbers/day-051-count-the-butterflies. Cues from VO via K (keys.gen.ts).
// ENERGY LAYER standard: ident → Bobo's garden: a flower bed of 10 flowers (2 rows of 5) → COUNT 1–10: each
// number is said alone, then a butterfly in the RAINBOW colour of its badge flies in and lands ("One red
// butterfly!") — three ways at once: the butterflies + badge, the big numeral, Spark Girl's fingers (5 + n) →
// gags every 3: Bobo sneezes (they flutter up and land again) · butterfly 6 visits Bobo's nose and comes back (the
// count stays right) · "I need more paws!" → ten butterflies, ten fingers (your turn) → WOW: butterflies taste with
// their feet → GAMES with think timers: more (3 vs 5) · less (4 vs 2) · 2 + 1 · 3 + 2 (they fly in during the
// question) · 5 − 2 (two fly away) · find the number 7 · find 4 → sunset COUNTDOWN 10 → 1 (on each number that
// many butterflies are on the flowers, then one flies home) → goodnight → bye + star iris.
// The ambient set life is OFF (fx={false}): every butterfly on screen is a counted one.
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter, critterFaceAt } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR } from '../../lib/kids/sets';
import { Backdrop } from '../../lib/kids/places';
import { AnswerMark, Confetti, FONT_TOON, KidsCaptions, PopText, RAINBOW, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, ImpactStar, Reaction, SparksIntro, StageWord, StarWipe, directorCam, onBeat, type Shot } from '../../lib/kids/energy';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsNumbers051', durationInSeconds: 300.3, fps: 30, width: 1920, height: 1080 };

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
const NUM = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN'];
const k = (s: string) => s as Key;

// ── layout: the flower bed (2 rows of 5)
const BOBO_X = 250;
const MILA_X = 1680;
const SPOT = (i: number): [number, number] => [560 + (i % 5) * 200, i < 5 ? 430 : 640];
const FLOWER_C = ['#ff6fa5', '#ffca3a', '#b388ff', '#ff924c', '#f15bb5'];

// ── anchors
const ARRIVE = Array.from({ length: 10 }, (_, i) => S(k(`n${i + 1}`)));
const SNEEZE = word('gag1', 3);
const NOSE0 = S('gag2');
const NOSE1 = E('gag2b') + 0.3;
const FACT0 = S('fact') - 0.3;
const GAME0 = S('more_q') - 0.3;
const DOWN0 = S('sun') - 0.3;
const LEAVE = (n: number) => E(k(`d${n}`)) + 0.25; // after "n!", one butterfly flies home
type Scene = 'count' | 'fact' | 'game' | 'down';
const sceneAt = (t: number): Scene => (t < FACT0 ? 'count' : t < GAME0 ? 'fact' : t < DOWN0 ? 'game' : 'down');

// ── camera
const boboFace = critterFaceAt(BOBO_X, f, 0.62);
const SHOTS: Shot[] = [
  { t: 0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.008 },
  { t: S('intro') - 0.2, z: 1.5, x: BOBO_X + 60, y: boboFace[1] + 100, move: 'smooth', dur: 0.8 },
  { t: S('intro2') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8, push: 0.01 },
  { t: SNEEZE - 0.1, z: 1.5, x: BOBO_X + 60, y: boboFace[1] + 100, move: 'snap' },
  { t: E('gag1') + 0.3, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: NOSE0 + 0.6, z: 1.55, x: BOBO_X + 60, y: boboFace[1] + 100, move: 'smooth', dur: 0.8 },
  { t: NOSE1, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('gag3') - 0.1, z: 1.5, x: BOBO_X + 60, y: boboFace[1] + 100, move: 'snap' },
  { t: E('gag3') + 0.3, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('ten') - 0.2, z: 1.45, x: MILA_X - 80, y: 560, move: 'smooth', dur: 0.8, push: 0.02 },
  { t: S('you_count') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: FACT0, z: 1.0, x: 960, y: 540, move: 'cut' },
  { t: S('legs_q') - 0.2, z: 1.45, x: 960, y: 520, move: 'smooth', dur: 0.8 },
  { t: S('legs_a') + 1.5, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('fact_b') - 0.1, z: 1.5, x: BOBO_X + 60, y: boboFace[1] + 100, move: 'whip' },
  { t: GAME0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.006 },
  { t: DOWN0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.006 },
  { t: S('night') - 0.1, z: 1.3, x: 960, y: 560, move: 'smooth', dur: 1.2 },
];
const PUNCHES = [...ARRIVE.map((a) => a + 0.6)];

// ── butterflies (3D wings, rainbow colour = its number badge)
const Butterfly: React.FC<{ c: string; t: number; seed: number; s?: number; flying?: boolean }> = ({ c, t, seed, s = 1, flying }) => {
  const flap = flying ? 0.3 + 0.7 * Math.abs(Math.sin(t * 14 + seed)) : 0.75 + 0.25 * Math.abs(Math.sin(t * 2.2 + seed));
  return (
    <g transform={`scale(${s})`}>
      <g transform={`scale(${flap},1)`}>
        <Vol>
          <path d="M 0,-6 Q -70,-90 -62,-14 Q -66,10 0,4 Z" fill={c} {...kst(5)} />
          <path d="M 0,-6 Q 70,-90 62,-14 Q 66,10 0,4 Z" fill={c} {...kst(5)} />
          <path d="M 0,4 Q -48,52 -30,20 Z" fill={c} {...kst(5)} />
          <path d="M 0,4 Q 48,52 30,20 Z" fill={c} {...kst(5)} />
        </Vol>
        <circle cx={-36} cy={-30} r={10} fill="#ffffff" opacity={0.8} />
        <circle cx={36} cy={-30} r={10} fill="#ffffff" opacity={0.8} />
      </g>
      <ellipse cx={0} cy={0} rx={7} ry={26} fill={KINK} />
      <circle cx={0} cy={-28} r={10} fill={KINK} />
      <circle cx={-3} cy={-30} r={3} fill="#ffffff" />
      <circle cx={4} cy={-30} r={3} fill="#ffffff" />
      <path d="M -3,-36 Q -12,-56 -18,-58 M 3,-36 Q 12,-56 18,-58" fill="none" {...kst(3)} />
    </g>
  );
};
const Flower: React.FC<{ x: number; y: number; c: string; t: number; i: number }> = ({ x, y, c, t, i }) => (
  <g>
    <path d={`M ${x},${y + 20} Q ${x + Math.sin(t + i) * 6},${(y + f) / 2} ${x},${f + 10}`} fill="none" stroke="#3a8d3a" strokeWidth={12} strokeLinecap="round" />
    <path d={`M ${x},${(y + f) / 2 + 30} q -50,-30 -60,-60 q 40,0 60,50 Z`} fill="#52b788" {...kst(4)} />
    <g transform={`translate(${x},${y}) rotate(${Math.sin(t * 1.2 + i) * 4})`}>
      <Vol>
        {[0, 60, 120, 180, 240, 300].map((a) => <ellipse key={a} cx={Math.cos((a * Math.PI) / 180) * 40} cy={Math.sin((a * Math.PI) / 180) * 26} rx={30} ry={22} fill={c} {...kst(4)} />)}
        <ellipse cx={0} cy={0} rx={26} ry={18} fill="#ffd166" {...kst(4)} />
      </Vol>
    </g>
  </g>
);
const Badge: React.FC<{ n: number; s?: number }> = ({ n, s = 1 }) => (
  <g transform={`scale(${s})`}>
    <circle r={32} fill={RAINBOW[(n - 1) % RAINBOW.length]} {...kst(5)} />
    <text y={14} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill="#ffffff" stroke={KINK} strokeWidth={3} paintOrder="stroke">{n}</text>
  </g>
);
const BigFlower: React.FC<{ x: number; t: number; n: number; arrive?: number[]; leave?: number[]; badges?: number; c: string }> = ({ x, t, n, arrive = [], leave = [], badges = 0, c }) => {
  const y = 470;
  return (
    <g>
      <Flower x={x} y={y + 40} c={c} t={t} i={x} />
      <g transform={`translate(${x},${y + 40}) scale(1.6)`}><circle r={0} /></g>
      {Array.from({ length: n }).map((_, j) => {
        const a = arrive[j];
        const l = leave[j];
        const ring = (j / Math.max(1, n)) * Math.PI * 2;
        const hx = x + Math.cos(ring - Math.PI / 2) * 120;
        const hy = y - 60 + Math.sin(ring - Math.PI / 2) * 90;
        let px = hx;
        let py = hy;
        let fly = false;
        if (a !== undefined) {
          if (t < a) return null;
          const p = EASE_INOUT(prog(t, a, a + 0.9));
          px = 2100 + (hx - 2100) * p;
          py = 120 + (hy - 120) * p;
          fly = p < 1;
        }
        if (l !== undefined && t >= l) {
          const p = EASE_INOUT(prog(t, l, l + 1.2));
          if (p >= 1) return null;
          px = hx + (2100 - hx) * p;
          py = hy - 400 * p;
          fly = true;
        }
        return (
          <g key={j} transform={`translate(${px},${py + (fly ? 0 : Math.sin(t * 2 + j) * 4)})`}>
            <Butterfly c={RAINBOW[j % RAINBOW.length]} t={t} seed={j} s={0.9} flying={fly} />
            {badges > j && <g transform="translate(0,-80)"><Badge n={j + 1} s={0.8} /></g>}
          </g>
        );
      })}
    </g>
  );
};
const NumCard: React.FC<{ n: number; on: number }> = ({ n, on }) => (
  <g transform={`scale(${1 + on * 0.12})`}>
    <rect x={-120} y={-150} width={240} height={300} rx={36} fill={on ? '#fff3b0' : '#ffffff'} {...kst(on ? 10 : 8)} />
    <text y={50} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={190} fill={RAINBOW[(n - 1) % RAINBOW.length]} stroke={KINK} strokeWidth={8} paintOrder="stroke">{n}</text>
  </g>
);

export default function KidsNumbers051() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const scene = sceneAt(t);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);

  // how many butterflies are on the bed right now (count + countdown)
  const shownCount = scene === 'count' ? ARRIVE.filter((a) => t >= a - 0.6).length : scene === 'down' ? 10 : 0;
  const counted = scene === 'count' ? ARRIVE.filter((a) => t >= a).length : 0;
  const sneezeLift = within(t, SNEEZE, SNEEZE + 1.4) ? Math.sin(prog(t, SNEEZE, SNEEZE + 1.4) * Math.PI) * 120 : 0;

  // Mila's fingers = the current number (count, ten, countdown)
  let fingers = 0;
  if (scene === 'count') fingers = counted;
  if (within(t, S('ten'), S('you_count'))) fingers = 10;
  const YC = Array.from({ length: 10 }, (_, i) => S(k(`y${i + 1}`)));
  const yi = YC.findIndex((a, i) => within(t, a, i < 9 ? YC[i + 1] : S('great')));
  if (yi >= 0) fingers = yi + 1;
  if (within(t, S('great'), FACT0)) fingers = 10;
  if (scene === 'down') for (let n = 10; n >= 1; n--) if (within(t, S(k(`d${n}`)), LEAVE(n) + 0.6)) fingers = n;
  const fL = fingers > 5 ? 5 : 0;
  const fR = fingers > 5 ? fingers - 5 : fingers;
  const yay = within(t, S('ten'), E('ten') + 0.6) || within(t, S('great'), E('great') + 0.6) || t >= S('night');
  const milaExpr: KExpr = yay ? 'laugh' : talks('mila') ? 'happy' : 'smile';
  const boboExpr: KExpr = within(t, S('gag1'), SNEEZE) ? 'oops' : within(t, SNEEZE, E('gag1') + 0.3) ? 'surprised' : within(t, NOSE0, NOSE1) ? 'laugh'
    : within(t, S('gag3'), E('gag3')) ? 'oops' : within(t, S('fact_b'), E('fact_b')) ? 'wow' : yay ? 'laugh' : talks('bobo') ? 'happy' : 'smile';
  const night = scene === 'down' ? prog(t, S('d5'), S('night')) : 0;

  // games: which one is on
  const game = (q: Key, a: Key, nextQ: Key | null) => within(t, S(q) - 0.3, (nextQ ? S(nextQ) : DOWN0) - 0.3);
  const ANS = (a: Key) => t >= S(a) - 0.05;

  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
        <Backdrop place="meadow" w={W} h={H} t={t} fx={false} />
        {night > 0 && <rect width={W} height={H} fill="#2b1d5c" opacity={0.45 * night} />}

        {/* ── the flower bed (count + countdown) ── */}
        {(scene === 'count' || scene === 'down' || scene === 'fact') && (
          <g opacity={scene === 'fact' ? 0.35 : 1}>
            {Array.from({ length: 10 }).map((_, i) => {
              const [x, y] = SPOT(i);
              return <Flower key={i} x={x} y={y} c={FLOWER_C[i % 5]} t={t} i={i} />;
            })}
            {Array.from({ length: 10 }).map((_, i) => {
              const [hx, hy0] = SPOT(i);
              const hy = hy0 - 46;
              let px = hx;
              let py = hy - (i < counted ? sneezeLift * (0.7 + (i % 3) * 0.15) : 0);
              let fly = sneezeLift > 4;
              if (scene === 'count') {
                const a = ARRIVE[i];
                if (t < a - 0.6) return null;
                const p = EASE_INOUT(prog(t, a - 0.6, a));
                const sx = i % 2 ? 2100 : -180;
                px = sx + (hx - sx) * p;
                py = 80 + (py - 80) * p;
                fly = fly || p < 1;
                if (i === 5 && within(t, NOSE0 + 0.3, NOSE1)) return null; // drawn on top of Bobo (below)
                if (false) {
                  // butterfly 6 visits Bobo's nose, then comes back
                  const go = EASE_INOUT(prog(t, NOSE0 + 0.3, NOSE0 + 1.3));
                  const back = EASE_INOUT(prog(t, NOSE1 - 1.0, NOSE1));
                  const nx = boboFace[0] + 10;
                  const ny = boboFace[1] + 20;
                  px = hx + (nx - hx) * go + (hx - nx) * back;
                  py = hy + (ny - hy) * go + (hy - ny) * back;
                  fly = go < 1 || back > 0;
                }
              } else if (scene === 'down') {
                // butterfly i leaves after the number (i + 1) is said: 10 leaves first... index 9 → after "Ten"
                const n = i + 1;
                const l = LEAVE(n);
                if (t >= l) {
                  const p = EASE_INOUT(prog(t, l, l + 1.4));
                  if (p >= 1) return null;
                  px = hx + (2100 - hx) * p;
                  py = hy - 500 * p;
                  fly = true;
                }
              }
              const badge = scene === 'count' && t >= ARRIVE[i];
              const lit = yi === i;
              return (
                <g key={`b${i}`} transform={`translate(${px},${py + (fly ? Math.sin(t * 8 + i) * 6 : Math.sin(t * 2 + i) * 3)})`}>
                  {lit && <circle r={70} fill="#fff3b0" opacity={0.7} />}
                  <Butterfly c={RAINBOW[i]} t={t} seed={i} s={lit ? 1.05 : 0.85} flying={fly} />
                  {badge && <g transform={`translate(0,-78) scale(${popIn(t, ARRIVE[i])})`}><Badge n={i + 1} s={0.85} /></g>}
                </g>
              );
            })}
          </g>
        )}

        {/* ── wow fact: a big butterfly, its feet on a flower ── */}
        {scene === 'fact' && (
          <g transform={`translate(960,${430}) scale(${2.6 * popIn(t, FACT0 + 0.2)})`}>
            <Flower x={0} y={70} c="#ff6fa5" t={t} i={0} />
            <Butterfly c="#4cc9f0" t={t} seed={3} />
            {[-16, -9, -3, 3, 9, 16].map((x, j) => {
              const on = t >= S('legs_c') && t >= word('legs_c', j);
              return <path key={j} d={`M ${x * 0.4},16 L ${x},42`} stroke={on ? RAINBOW[j] : KINK} strokeWidth={on ? 5 : 3} strokeLinecap="round" />;
            })}
            {t >= word('fact', 6) && [0, 1, 2].map((j) => <circle key={j} cx={-18 + j * 18} cy={52 + Math.sin(t * 6 + j) * 3} r={3} fill="#ffca3a" opacity={0.6 + 0.4 * Math.sin(t * 8 + j)} />)}
          </g>
        )}

        {/* ── games ── */}
        {scene === 'game' && (
          <g>
            {game('more_q', 'more_a', 'less_q') && (
              <g>
                <BigFlower x={620} t={t} n={3} c="#ff6fa5" badges={ANS('more_a') ? 3 : 0} />
                <BigFlower x={1300} t={t} n={5} c="#ffca3a" badges={ANS('more_a') ? 5 : 0} />
                <AnswerMark t={t} at={S('more_a')} ok x={1300} y={240} size={0.7} />
              </g>
            )}
            {game('less_q', 'less_a', 'add_q') && (
              <g>
                <BigFlower x={620} t={t} n={4} c="#b388ff" badges={ANS('less_a') ? 4 : 0} />
                <BigFlower x={1300} t={t} n={2} c="#ff924c" badges={ANS('less_a') ? 2 : 0} />
                <AnswerMark t={t} at={S('less_a')} ok x={1300} y={240} size={0.7} />
              </g>
            )}
            {game('add_q', 'add_a', 'add2_q') && <BigFlower x={960} t={t} n={3} c="#ff6fa5" arrive={[-1, -1, word('add_q', 9)]} badges={ANS('add_a') ? 3 : 0} />}
            {game('add2_q', 'add2_a', 'sub_q') && <BigFlower x={960} t={t} n={5} c="#ffca3a" arrive={[-1, -1, -1, word('add2_q', 3), word('add2_q', 3) + 0.4]} badges={ANS('add2_a') ? 5 : 0} />}
            {game('sub_q', 'sub_a', 'col_q') && <BigFlower x={960} t={t} n={5} c="#b388ff" leave={[1e9, 1e9, 1e9, word('sub_q', 4), word('sub_q', 4) + 0.3]} badges={ANS('sub_a') ? 3 : 0} />}
            {(game('col_q', 'col_a', 'col2_q') || game('col2_q', 'col2_a', 'find_q')) && (() => {
              const first = t < S('col2_q') - 0.3;
              const n = first ? 1 : 5;
              const done = t >= (first ? S('col_a') : S('col2_a')) - 0.05;
              return (
                <g key={n} transform={`translate(960,470) scale(${2.2 * popIn(t, (first ? S('col_q') : S('col2_q')) - 0.2)})`}>
                  <Butterfly c={done ? RAINBOW[n - 1] : '#ced4da'} t={t} seed={n} />
                  <g transform="translate(0,-92)"><Badge n={n} s={0.9} /></g>
                  {!done && <text x={0} y={80} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={60} fill="#ffffff" stroke={KINK} strokeWidth={6} paintOrder="stroke">?</text>}
                </g>
              );
            })()}
            {(game('find_q', 'find_a', 'find2_q') || game('find2_q', 'find2_a', null)) && (() => {
              const first = t < S('find2_q') - 0.3;
              const nums = first ? [5, 7, 2] : [4, 9, 1];
              const ans = first ? 7 : 4;
              const at = first ? S('find_a') : S('find2_a');
              return nums.map((n, j) => (
                <g key={`${first}${n}`} transform={`translate(${620 + j * 340},460) scale(${popIn(t, (first ? S('find_q') : S('find2_q')) - 0.2 + j * 0.1)})`}>
                  <NumCard n={n} on={n === ans && t >= at ? 1 : 0} />
                  {n === ans && <AnswerMark t={t} at={at} ok x={100} y={-140} size={0.6} />}
                </g>
              ));
            })()}
          </g>
        )}

        {/* ── the cast ── */}
        <Critter spec={BOBO_HERO} x={BOBO_X} y={f} scale={0.62} expr={boboExpr} look={[0.6, -0.3]} mouth={lipSync(VO, 'bobo', t)}
          armL={within(t, S('gag3'), E('gag3')) ? 'up' : yay ? 'up' : 'down'} armR={within(t, S('gag3'), E('gag3')) ? 'up' : talks('bobo') ? 'wave' : yay ? 'up' : 'down'}
          squash={within(t, SNEEZE - 0.4, SNEEZE) ? 0.2 : 0} tilt={within(t, SNEEZE, SNEEZE + 0.3) ? 10 : 0}
          hop={yay ? Math.abs(Math.sin(t * 7)) * 22 : 0} />
        <Kid spec={MILA_HERO} x={MILA_X} y={f} scale={0.6} expr={milaExpr} look={[-0.6, -0.2]} mouth={lipSync(VO, 'mila', t)}
          armL={fL ? 'count' : yay ? 'up' : 'down'} armR={fR ? 'count' : talks('mila') ? 'present' : 'down'} fingersL={fL || undefined} fingersR={fR || undefined}
          hop={yay ? Math.abs(Math.sin(t * 7 + 1)) * 22 : 0} />

        {/* butterfly 6 visits Bobo's nose (drawn over Bobo), then flies back */}
        {scene === 'count' && within(t, NOSE0 + 0.3, NOSE1) && (() => {
          const [hx, hy0] = SPOT(5);
          const hy = hy0 - 46;
          const go = EASE_INOUT(prog(t, NOSE0 + 0.3, NOSE0 + 1.3));
          const back = EASE_INOUT(prog(t, NOSE1 - 1.0, NOSE1));
          const nx = boboFace[0] + 10;
          const ny = boboFace[1] + 50;
          const px = hx + (nx - hx) * go + (hx - nx) * back;
          const py = hy + (ny - hy) * go + (hy - ny) * back;
          const sc = 0.85 - 0.3 * go * (1 - back);
          return (
            <g transform={`translate(${px},${py})`}>
              <Butterfly c={RAINBOW[5]} t={t} seed={5} s={sc} flying={go < 1 || back > 0} />
              <g transform={`translate(${70 * go * (1 - back)},${-78 * sc / 0.85})`}><Badge n={6} s={sc} /></g>
            </g>
          );
        })()}
        {/* FX */}
        {ARRIVE.map((a, i) => <ImpactStar key={i} t={t} at={a} x={SPOT(i)[0]} y={SPOT(i)[1] - 50} s={0.45} color="#fff3b0" />)}
        <StageWord t={t} at={SNEEZE} until={SNEEZE + 1.2} text="ACHOO!" x={BOBO_X + 120} y={boboFace[1] - 200} size={90} color="#4cc9f0" rot={-8} />
        <StageWord t={t} at={word('gag2b', 2)} until={NOSE1} text="HEE HEE!" x={BOBO_X + 140} y={boboFace[1] - 200} size={70} color="#ff6fa5" rot={6} />
        <Reaction kind="?" t={t} at={S('gag3')} until={E('gag3') + 0.4} x={BOBO_X} y={boboFace[1] - 230} s={0.6} />
        <Reaction kind="!" t={t} at={S('fact_b')} until={E('fact_b') + 0.4} x={BOBO_X} y={boboFace[1] - 230} s={0.6} />
        {night > 0.3 && <g opacity={night}><circle cx={1700} cy={140} r={70} fill="#fff3b0" /><circle cx={1730} cy={120} r={60} fill="#2b1d5c" opacity={0.0} /></g>}
      </ActionStage>

      {/* screen-space */}
      {ARRIVE.map((a, i) => (
        <PopText key={i} t={t} at={a - 0.05} until={(i < 9 ? ARRIVE[i + 1] - 0.7 : S('ten') - 0.1)} text={`${i + 1}  ${NUM[i]}`} y={130} size={120} color={RAINBOW[i]} />
      ))}
      <PopText t={t} at={S('ten')} until={E('ten') + 0.5} text="10 FINGERS!" y={130} size={120} color="#ffca3a" />
      <PopText t={t} at={E('ten') - 1.2} until={S('you_count') - 0.1} text="YOUR TURN!" y={260} size={90} color="#ffffff" />
      <PopText t={t} at={word('fact', 4)} until={S('legs_q') - 0.1} text="THEY TASTE WITH THEIR FEET!" y={130} size={80} color="#4cc9f0" />
      <PopText t={t} at={S('more_q') + 0.4} until={S('more_a') - 0.1} text="MORE?" y={130} size={120} color="#ffffff" />
      <PopText t={t} at={S('more_a')} until={S('less_q') - 0.2} text="5 IS MORE THAN 3" y={130} size={100} color="#ffca3a" />
      <PopText t={t} at={S('less_q') + 0.4} until={S('less_a') - 0.1} text="LESS?" y={130} size={120} color="#ffffff" />
      <PopText t={t} at={S('less_a')} until={S('add_q') - 0.2} text="2 IS LESS THAN 4" y={130} size={100} color="#ff924c" />
      <PopText t={t} at={word('add_q', 9) + 0.6} until={S('add_a') - 0.1} text="2 + 1 = ?" y={130} size={130} color="#ffffff" />
      <PopText t={t} at={S('add_a')} until={S('add2_q') - 0.2} text="2 + 1 = 3" y={130} size={130} color="#ff6fa5" />
      <PopText t={t} at={word('add2_q', 5)} until={S('add2_a') - 0.1} text="3 + 2 = ?" y={130} size={130} color="#ffffff" />
      <PopText t={t} at={S('add2_a')} until={S('sub_q') - 0.2} text="3 + 2 = 5" y={130} size={130} color="#ffca3a" />
      <PopText t={t} at={word('sub_q', 7)} until={S('sub_a') - 0.1} text="5 − 2 = ?" y={130} size={130} color="#ffffff" />
      <PopText t={t} at={S('sub_a')} until={S('col_q') - 0.2} text="5 − 2 = 3" y={130} size={130} color="#b388ff" />
      <PopText t={t} at={S('col_a')} until={S('col2_q') - 0.2} text="RED!" y={130} size={140} color={RAINBOW[0]} />
      <PopText t={t} at={S('col2_a')} until={S('find_q') - 0.2} text="BLUE!" y={130} size={140} color={RAINBOW[4]} />
      {Array.from({ length: 10 }, (_, i) => (
        <PopText key={`y${i}`} t={t} at={S(k(`y${i + 1}`)) - 0.05} until={i < 9 ? S(k(`y${i + 2}`)) - 0.05 : S('great')} text={String(i + 1)} y={130} size={170} color={RAINBOW[i]} />
      ))}
      <PopText t={t} at={S('you_count')} until={S('y1') - 0.1} text="YOUR TURN TO COUNT!" y={130} size={96} color="#ffffff" />
      <PopText t={t} at={S('legs_a')} until={GAME0} text="6 LEGS!" y={130} size={140} color="#ff924c" />
      {(['more_q', 'less_q', 'add_q', 'add2_q', 'sub_q', 'col_q', 'col2_q', 'find_q', 'find2_q'] as const).map((q, i) => {
        const a = (['more_a', 'less_a', 'add_a', 'add2_a', 'sub_a', 'col_a', 'col2_a', 'find_a', 'find2_a'] as const)[i];
        return <ThinkTimer key={q} t={t} from={onBeat(E(q) + 0.1)} to={S(a) - 0.1} x={1760} y={190} r={90} label="THINK!" />;
      })}
      <PopText t={t} at={word('sun', 13)} until={S('d10') - 0.1} text="COUNT DOWN!" y={130} size={120} color="#ffffff" />
      {Array.from({ length: 10 }, (_, j) => 10 - j).map((n) => (
        <PopText key={n} t={t} at={S(k(`d${n}`)) - 0.05} until={LEAVE(n) + 0.8} text={String(n)} y={130} size={170} color={RAINBOW[n - 1]} />
      ))}
      <PopText t={t} at={S('night')} until={S('bye') - 0.1} text="GOODNIGHT, BUTTERFLIES!" y={130} size={90} color="#fff3b0" />
      <PopText t={t} at={S('bye')} until={E('bye2') + 0.6} text="SEE YOU NEXT TIME!" y={130} size={100} color="#ffca3a" />
      <Confetti t={t} at={S('ten')} y={420} />
      {(['more_a', 'add2_a', 'sub_a', 'find2_a'] as const).map((a) => <Confetti key={a} t={t} at={S(a) + 0.2} y={420} />)}
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <SparksIntro t={t} at={0} cast={{ kids: [MILA_HERO, LEO_HERO], buddy: BOBO_HERO }} />
      <StarWipe t={t} at={E('bye2') + 0.6} dur={0.5} hold={5} color="#2b1d5c" x={W / 2} y={H * 0.45} />
    </>
  );
}
