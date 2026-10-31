// TINY SPARKS · Day 58 · 🔢 Numbers & Math #9 — "Counting Cars" (LONG 16:9)
// kids-shorts/tiny-sparks/numbers/day-058-counting-cars. Cues from VO via K (keys.gen.ts).
// ENERGY LAYER standard: ident → Captain Leo's toy-car parking lot in the playroom (10 bays, 2 rows of 5) → COUNT 1–10:
// each number said alone, then a car in the RAINBOW colour of its badge drives in and parks — three ways at once (cars +
// badge, the big numeral, Leo's fingers) → gags every 3: Bobo's tummy goes "beep beep" (the cars bounce) · car 6 gives
// Bobo a ride and comes back (the count stays right) · "I need more paws!" → ten cars, ten fingers (your turn) → WOW:
// electric cars are very quiet · count the 4 wheels → GAMES with think timers: more (3 vs 5) · fewer (4 vs 2) · 2 + 1 ·
// 3 + 2 (they drive in during the question) · 5 − 2 (two drive away) · colour quiz · find 7 · find 4 → bedtime COUNTDOWN
// 10 → 1 (n cars parked when n is said, then one drives home to the garage) → goodnight → bye + star iris.
// The ambient set life is OFF (fx={false}): every car on screen is a counted one.
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

export const compositionConfig = { id: 'KidsNumbers058', durationInSeconds: 303.3, fps: 30, width: 1920, height: 1080 };

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

// ── layout: Leo's toy parking garage (2 decks of 5 bays)
const BOBO_X = 250;
const LEO_X = 1680;
const DECK = [470, 700]; // car ground lines (upper, lower deck)
const SPOT = (i: number): [number, number] => [560 + (i % 5) * 200, DECK[i < 5 ? 0 : 1]];

// ── anchors
const ARRIVE = Array.from({ length: 10 }, (_, i) => S(k(`n${i + 1}`)));
const BEEP = S('gag1') + 0.1;
const RIDE0 = S('gag2');
const RIDE1 = E('gag2b') + 0.3;
const FACT0 = S('fact') - 0.3;
const GAME0 = S('more_q') - 0.3;
const DOWN0 = S('sun') - 0.3;
const LEAVE = (n: number) => E(k(`d${n}`)) + 0.25; // after "n!", one car drives home
type Scene = 'count' | 'fact' | 'game' | 'down';
const sceneAt = (t: number): Scene => (t < FACT0 ? 'count' : t < GAME0 ? 'fact' : t < DOWN0 ? 'game' : 'down');

// ── camera
const boboFace = critterFaceAt(BOBO_X, f, 0.62);
const SHOTS: Shot[] = [
  { t: 0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.008 },
  { t: S('intro') - 0.2, z: 1.45, x: LEO_X - 80, y: 560, move: 'smooth', dur: 0.8 },
  { t: S('intro2') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8, push: 0.01 },
  { t: S('gag1') - 0.1, z: 1.5, x: BOBO_X + 60, y: boboFace[1] + 100, move: 'snap' },
  { t: E('gag1b') + 0.3, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: RIDE0 + 1.0, z: 1.4, x: BOBO_X + 120, y: boboFace[1] + 160, move: 'smooth', dur: 0.8 },
  { t: RIDE1, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('gag3') - 0.1, z: 1.5, x: BOBO_X + 60, y: boboFace[1] + 100, move: 'snap' },
  { t: E('gag3') + 0.3, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('ten') - 0.2, z: 1.45, x: LEO_X - 80, y: 560, move: 'smooth', dur: 0.8, push: 0.02 },
  { t: S('you_count') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: FACT0, z: 1.0, x: 960, y: 540, move: 'cut' },
  { t: S('fact_b') - 0.1, z: 1.5, x: BOBO_X + 60, y: boboFace[1] + 100, move: 'whip' },
  { t: S('legs_q') - 0.2, z: 1.35, x: 960, y: 520, move: 'smooth', dur: 0.8 },
  { t: S('legs_a') + 1.5, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: GAME0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.006 },
  { t: DOWN0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.006 },
  { t: S('night') - 0.1, z: 1.3, x: 960, y: 560, move: 'smooth', dur: 1.2 },
];
// each game question re-anchors the frame (an uncapped push over the whole game block would creep to z 1.5)
for (const q of ['less_q', 'add_q', 'add2_q', 'sub_q', 'col_q', 'col2_q', 'find_q', 'find2_q'] as const) SHOTS.push({ t: S(q) - 0.3, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.004 });
SHOTS.sort((a, b) => a.t - b.t);
const PUNCHES = [...ARRIVE.map((a) => a + 0.1)];

// ── a toy car (side view, faces LEFT; origin = between the wheels on the ground). `farWheels` = the 3/4 view
// with the two far wheels peeking out (for counting 4 wheels); `lit` = which wheel glows (0..3)
const Car: React.FC<{ c: string; t: number; seed: number; s?: number; moving?: boolean; flip?: boolean; farWheels?: boolean; lit?: number }> = ({ c, t, seed, s = 1, moving, flip, farWheels, lit = -1 }) => {
  const spin = moving ? t * 900 : 0;
  const bob = moving ? Math.sin(t * 30 + seed) * 2.5 : Math.sin(t * 2 + seed) * 0.8;
  const wheel = (x: number, y: number, on: boolean, far = false) => (
    <g transform={`translate(${x},${y})`}>
      {on && <circle r={40} fill="#fff3b0" opacity={0.9} />}
      <g transform={`rotate(${-spin})`}>
        <Vol><circle r={26} fill={far ? '#3b3b4f' : KINK} {...kst(4)} /></Vol>
        <circle r={10} fill="#ced4da" {...kst(3)} />
        <path d="M -18,0 L 18,0 M 0,-18 L 0,18" stroke="#ced4da" strokeWidth={4} />
      </g>
    </g>
  );
  return (
    <g transform={`scale(${(flip ? -1 : 1) * s},${s})`}>
      {farWheels && <>{wheel(-30, -14, lit === 2, true)}{wheel(102, -14, lit === 3, true)}</>}
      <g transform={`translate(0,${bob - 26})`}>
        <Vol>
          <path d="M -112,-6 Q -114,-40 -86,-44 L -56,-46 L -32,-92 Q -26,-100 -12,-100 L 52,-100 Q 66,-100 74,-88 L 96,-48 Q 118,-44 118,-20 L 118,-6 Q 118,4 108,4 L -104,4 Q -112,4 -112,-6 Z" fill={c} {...kst(5)} />
        </Vol>
        <path d="M -20,-88 L -38,-52 L 14,-52 L 14,-88 Z" fill="#dff4ff" {...kst(4)} />
        <path d="M 28,-88 L 28,-52 L 82,-52 L 64,-86 Z" fill="#dff4ff" {...kst(4)} />
        <path d="M -16,-82 L -24,-66" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" />
        <ellipse cx={-106} cy={-24} rx={8} ry={10} fill="#fff3b0" {...kst(3)} />
        <rect x={110} y={-34} width={8} height={14} rx={3} fill="#ff595e" {...kst(2)} />
        <path d="M 20,-40 L 36,-40" stroke={KINK} strokeWidth={4} strokeLinecap="round" />
      </g>
      {wheel(-66, -26, lit === 0)}
      {wheel(66, -26, lit === 1)}
    </g>
  );
};
const Badge: React.FC<{ n: number; s?: number }> = ({ n, s = 1 }) => (
  <g transform={`scale(${s})`}>
    <circle r={32} fill={RAINBOW[(n - 1) % RAINBOW.length]} {...kst(5)} />
    <text y={14} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill="#ffffff" stroke={KINK} strokeWidth={3} paintOrder="stroke">{n}</text>
  </g>
);
// the garage: two wooden decks on posts, bay lines, a sign
const Garage: React.FC = () => (
  <g>
    {[450, 1470].map((x) => <Vol key={x}><rect x={x - 18} y={300} width={36} height={f - 300 + 10} rx={10} fill="#c98b55" {...kst(6)} /></Vol>)}
    <Vol><rect x={420} y={286} width={1080} height={40} rx={14} fill="#ff924c" {...kst(6)} /></Vol>
    {DECK.map((y) => (
      <g key={y}>
        <Vol><rect x={420} y={y} width={1080} height={34} rx={10} fill="#8d99ae" {...kst(6)} /></Vol>
        {Array.from({ length: 6 }).map((_, j) => <rect key={j} x={457 + j * 200} y={y + 4} width={6} height={22} rx={3} fill="#ffffff" />)}
      </g>
    ))}
    <path d={`M 1500,${DECK[1] + 30} L 1620,${f + 10}`} stroke="#8d99ae" strokeWidth={30} strokeLinecap="round" />
  </g>
);
// a short road with n car slots (games)
const Road: React.FC<{ x?: number; y: number; t: number; n: number; arrive?: number[]; leave?: number[]; badges?: number; s?: number }> = ({ x = 960, y, t, n, arrive = [], leave = [], badges = 0, s = 0.9 }) => {
  const gap = 230 * s + 30;
  return (
    <g>
      <Vol><rect x={x - 520} y={y - 6} width={1040} height={44} rx={16} fill="#5c6770" {...kst(6)} /></Vol>
      {Array.from({ length: 9 }).map((_, j) => <rect key={j} x={x - 480 + j * 110} y={y + 12} width={50} height={8} rx={4} fill="#ffd166" />)}
      {Array.from({ length: n }).map((_, j) => {
        const hx = x - ((n - 1) / 2) * gap + j * gap;
        let px = hx;
        let moving = false;
        let flip = false;
        const a = arrive[j];
        const l = leave[j];
        if (a !== undefined) {
          if (t < a) return null;
          const p = EASE_INOUT(prog(t, a, a + 0.9));
          px = 2150 + (hx - 2150) * p;
          moving = p < 1;
        }
        if (l !== undefined && t >= l) {
          const p = EASE_INOUT(prog(t, l, l + 1.2));
          if (p >= 1) return null;
          px = hx + (2150 - hx) * p;
          moving = true;
          flip = true;
        }
        return (
          <g key={j} transform={`translate(${px},${y})`}>
            <Car c={RAINBOW[j % RAINBOW.length]} t={t} seed={j} s={s} moving={moving} flip={flip} />
            {badges > j && <g transform={`translate(0,${-150 * s - 40})`}><Badge n={j + 1} s={0.8} /></g>}
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

export default function KidsNumbers058() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const scene = sceneAt(t);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);

  const counted = scene === 'count' ? ARRIVE.filter((a) => t >= a).length : 0;
  const beepHop = within(t, BEEP, BEEP + 1.2) ? Math.abs(Math.sin(prog(t, BEEP, BEEP + 1.2) * Math.PI * 3)) * 28 : 0;

  // Leo's fingers = the current number (count, ten, your turn, countdown)
  let fingers = 0;
  if (scene === 'count') fingers = counted;
  if (within(t, S('ten'), S('you_count'))) fingers = 10;
  const YC = Array.from({ length: 10 }, (_, i) => S(k(`y${i + 1}`)));
  const yi = YC.findIndex((a, i) => within(t, a, i < 9 ? YC[i + 1] : S('great')));
  if (yi >= 0) fingers = yi + 1;
  if (within(t, S('great'), FACT0)) fingers = 10;
  if (within(t, S('legs_c'), GAME0)) fingers = Math.min(4, [0, 1, 2, 3].filter((j) => t >= word('legs_c', j)).length);
  if (scene === 'down') for (let n = 10; n >= 1; n--) if (within(t, S(k(`d${n}`)), LEAVE(n) + 0.6)) fingers = n;
  const fL = fingers > 5 ? 5 : 0;
  const fR = fingers > 5 ? fingers - 5 : fingers;
  const riding = within(t, RIDE0 + 1.0, RIDE1 - 1.0);
  const yay = within(t, S('ten'), E('ten') + 0.6) || within(t, S('great'), E('great') + 0.6) || t >= S('night');
  const leoExpr: KExpr = within(t, S('gag1b'), E('gag1b')) ? 'laugh' : yay ? 'laugh' : talks('leo') ? 'happy' : 'smile';
  const boboExpr: KExpr = within(t, S('gag1'), E('gag1') + 0.3) ? 'oops' : riding ? 'laugh'
    : within(t, S('gag3'), E('gag3')) ? 'oops' : within(t, S('fact_b'), E('fact_b')) ? 'wow' : yay ? 'laugh' : talks('bobo') ? 'happy' : 'smile';
  const night = scene === 'down' ? prog(t, S('d5'), S('night')) : 0;

  const game = (q: Key, nextQ: Key | null) => within(t, S(q) - 0.3, (nextQ ? S(nextQ) : DOWN0) - 0.3);
  const ANS = (a: Key) => t >= S(a) - 0.05;
  const wheelLit = within(t, S('legs_c'), S('honk')) ? [0, 1, 2, 3].filter((j) => t >= word('legs_c', j)).length - 1 : -1;

  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
        <Backdrop place="playroom" w={W} h={H} t={t} fx={false} dim={0.08} />
        {night > 0 && <rect width={W} height={H} fill="#2b1d5c" opacity={0.45 * night} />}

        {/* ── the garage (count + countdown) ── */}
        {(scene === 'count' || scene === 'down' || scene === 'fact') && (
          <g opacity={scene === 'fact' ? 0.3 : 1}>
            <Garage />
            {Array.from({ length: 10 }).map((_, i) => {
              const [hx, hy] = SPOT(i);
              let px = hx;
              const py = hy - (i < counted ? beepHop * (0.7 + (i % 3) * 0.15) : 0);
              let moving = false;
              let flip = false;
              if (scene === 'count') {
                const a = ARRIVE[i];
                if (t < a - 0.9) return null;
                const p = EASE_INOUT(prog(t, a - 0.9, a));
                px = 2150 + (hx - 2150) * p;
                moving = p < 1;
                if (i === 5 && within(t, RIDE0 + 0.2, RIDE1)) return null; // drawn at Bobo's feet (below)
              } else if (scene === 'down') {
                const l = LEAVE(i + 1);
                if (t >= l) {
                  const p = EASE_INOUT(prog(t, l, l + 1.4));
                  if (p >= 1) return null;
                  px = hx + (2150 - hx) * p;
                  moving = true;
                  flip = true;
                }
              } else return null;
              const badge = scene === 'count' && t >= ARRIVE[i];
              const lit = yi === i;
              return (
                <g key={`c${i}`} transform={`translate(${px},${py})`}>
                  {lit && <ellipse cx={0} cy={-50} rx={120} ry={80} fill="#fff3b0" opacity={0.7} />}
                  <Car c={RAINBOW[i]} t={t} seed={i} s={lit ? 0.78 : 0.7} moving={moving} flip={flip} />
                  {badge && <g transform={`translate(0,-128) scale(${popIn(t, ARRIVE[i])})`}><Badge n={i + 1} s={0.8} /></g>}
                </g>
              );
            })}
          </g>
        )}

        {/* ── wow fact: a big quiet electric car, then count its 4 wheels ── */}
        {scene === 'fact' && (
          <g transform={`translate(960,${640}) scale(${2.3 * popIn(t, FACT0 + 0.2)})`}>
            <Car c="#52b788" t={t} seed={3} farWheels={t >= S('legs_q') - 0.2} lit={wheelLit} />
            {t < S('legs_q') - 0.2 && (
              <g>
                <path d="M -8,-120 L -26,-88 L -6,-88 L -20,-58 L 18,-98 L -2,-98 L 10,-120 Z" fill="#ffca3a" {...kst(3)} />
                <path d="M 118,-34 Q 160,-34 160,0 Q 160,20 190,20" fill="none" stroke={KINK} strokeWidth={5} />
                <rect x={186} y={10} width={26} height={20} rx={5} fill="#ffca3a" {...kst(3)} />
                {t >= word('fact', 8) && [0, 1, 2].map((j) => (
                  <text key={j} x={-150 + j * 26} y={-120 - j * 22 + Math.sin(t * 3 + j) * 4} fontFamily={FONT_TOON} fontWeight={700} fontSize={26 - j * 3} fill="#ffffff" stroke={KINK} strokeWidth={3} paintOrder="stroke" opacity={0.6 + 0.4 * Math.sin(t * 4 + j)}>sh</text>
                ))}
              </g>
            )}
          </g>
        )}

        {/* ── games ── */}
        {scene === 'game' && (
          <g>
            {game('more_q', 'less_q') && (
              <g>
                <Road y={430} t={t} n={3} badges={ANS('more_a') ? 3 : 0} s={0.6} />
                <Road y={700} t={t} n={5} badges={ANS('more_a') ? 5 : 0} s={0.6} />
                <AnswerMark t={t} at={S('more_a')} ok x={1520} y={620} size={0.6} />
              </g>
            )}
            {game('less_q', 'add_q') && (
              <g>
                <Road y={430} t={t} n={4} badges={ANS('less_a') ? 4 : 0} s={0.6} />
                <Road y={700} t={t} n={2} badges={ANS('less_a') ? 2 : 0} s={0.6} />
                <AnswerMark t={t} at={S('less_a')} ok x={1520} y={620} size={0.6} />
              </g>
            )}
            {game('add_q', 'add2_q') && <Road y={620} t={t} n={3} arrive={[-1, -1, word('add_q', 9)]} badges={ANS('add_a') ? 3 : 0} />}
            {game('add2_q', 'sub_q') && <Road y={620} t={t} n={5} arrive={[-1, -1, -1, word('add2_q', 3), word('add2_q', 3) + 0.4]} badges={ANS('add2_a') ? 5 : 0} s={0.62} />}
            {game('sub_q', 'col_q') && <Road y={620} t={t} n={5} leave={[1e9, 1e9, 1e9, word('sub_q', 4), word('sub_q', 4) + 0.3]} badges={ANS('sub_a') ? 3 : 0} s={0.62} />}
            {(game('col_q', 'col2_q') || game('col2_q', 'find_q')) && (() => {
              const first = t < S('col2_q') - 0.3;
              const n = first ? 1 : 5;
              const done = t >= (first ? S('col_a') : S('col2_a')) - 0.05;
              return (
                <g key={n} transform={`translate(960,720) scale(${2.0 * popIn(t, (first ? S('col_q') : S('col2_q')) - 0.2)})`}>
                  <Car c={done ? RAINBOW[n - 1] : '#ced4da'} t={t} seed={n} />
                  <g transform="translate(0,-160)"><Badge n={n} s={0.9} /></g>
                  {!done && <text x={0} y={-60} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={60} fill="#ffffff" stroke={KINK} strokeWidth={6} paintOrder="stroke">?</text>}
                </g>
              );
            })()}
            {(game('find_q', 'find2_q') || game('find2_q', null)) && (() => {
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
          armL={within(t, S('gag3'), E('gag3')) || riding ? 'up' : within(t, S('gag1'), E('gag1')) ? 'hug' : yay ? 'up' : 'down'}
          armR={within(t, S('gag3'), E('gag3')) || riding ? 'up' : talks('bobo') ? 'wave' : yay ? 'up' : 'down'}
          hop={yay ? Math.abs(Math.sin(t * 7)) * 22 : riding ? Math.abs(Math.sin(t * 9)) * 30 : 0} />
        <Kid spec={LEO_HERO} x={LEO_X} y={f} scale={0.6} expr={leoExpr} look={[-0.6, -0.2]} mouth={lipSync(VO, 'leo', t)}
          armL={fL ? 'count' : yay ? 'up' : 'down'} armR={fR ? 'count' : talks('leo') ? 'present' : 'down'} fingersL={fL || undefined} fingersR={fR || undefined}
          hop={yay ? Math.abs(Math.sin(t * 7 + 1)) * 22 : 0} />

        {/* car 6 drives over to Bobo, gives him a ride, then drives back (drawn over Bobo) */}
        {scene === 'count' && within(t, RIDE0 + 0.2, RIDE1) && (() => {
          const [hx, hy] = SPOT(5);
          const go = EASE_INOUT(prog(t, RIDE0 + 0.2, RIDE0 + 1.2));
          const back = EASE_INOUT(prog(t, RIDE1 - 1.0, RIDE1));
          const nx = BOBO_X + 200;
          const ny = f + 20;
          const px = hx + (nx - hx) * go + (hx - nx) * back;
          const py = hy + (ny - hy) * go + (hy - ny) * back;
          const sc = 0.7 + 0.15 * go * (1 - back);
          return (
            <g transform={`translate(${px},${py})`}>
              <Car c={RAINBOW[5]} t={t} seed={5} s={sc} moving={go < 1 || back > 0 || riding} flip={back > 0 && back < 1} />
              <g transform={`translate(0,${-128 * sc / 0.7})`}><Badge n={6} s={0.8} /></g>
            </g>
          );
        })()}
        {/* FX */}
        {ARRIVE.map((a, i) => <ImpactStar key={i} t={t} at={a} x={SPOT(i)[0]} y={SPOT(i)[1] - 60} s={0.45} color="#fff3b0" />)}
        <StageWord t={t} at={BEEP} until={BEEP + 1.4} text="BEEP BEEP!" x={BOBO_X + 160} y={boboFace[1] - 200} size={80} color="#ffca3a" rot={-8} />
        <StageWord t={t} at={S('gag2b')} until={RIDE1 - 0.6} text="WHEEE!" x={BOBO_X + 160} y={boboFace[1] - 200} size={80} color="#ff6fa5" rot={6} />
        <Reaction kind="?" t={t} at={S('gag3')} until={E('gag3') + 0.4} x={BOBO_X} y={boboFace[1] - 230} s={0.6} />
        <StageWord t={t} at={word('honk', 4)} until={E('honk') + 0.4} text="BEEP BEEP!" x={LEO_X - 160} y={300} size={80} color="#ffca3a" rot={8} />
        <Reaction kind="!" t={t} at={S('fact_b')} until={E('fact_b') + 0.4} x={BOBO_X} y={boboFace[1] - 230} s={0.6} />
        {night > 0.3 && <g opacity={night}><circle cx={1700} cy={140} r={60} fill="#fff3b0" /></g>}
      </ActionStage>

      {/* screen-space */}
      <PopText t={t} at={S('intro') + 0.6} until={S('how') - 0.1} text="LEO'S GARAGE" y={130} size={110} color="#ff924c" />
      {ARRIVE.map((a, i) => (
        <PopText key={i} t={t} at={a - 0.05} until={(i < 9 ? ARRIVE[i + 1] - 1.0 : S('ten') - 0.1)} text={`${i + 1}  ${NUM[i]}`} y={130} size={120} color={RAINBOW[i]} />
      ))}
      <PopText t={t} at={S('ten')} until={E('ten') + 0.5} text="10 FINGERS!" y={130} size={120} color="#ffca3a" />
      <PopText t={t} at={E('ten') - 1.2} until={S('you_count') - 0.1} text="YOUR TURN!" y={260} size={90} color="#ffffff" />
      <PopText t={t} at={word('fact', 3)} until={S('legs_q') - 0.1} text="ELECTRIC CARS ARE QUIET!" y={130} size={80} color="#52b788" />
      <PopText t={t} at={S('more_q') + 0.4} until={S('more_a') - 0.1} text="MORE?" y={130} size={120} color="#ffffff" />
      <PopText t={t} at={S('more_a')} until={S('less_q') - 0.2} text="5 IS MORE THAN 3" y={130} size={100} color="#ffca3a" />
      <PopText t={t} at={S('less_q') + 0.4} until={S('less_a') - 0.1} text="FEWER?" y={130} size={120} color="#ffffff" />
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
      <PopText t={t} at={S('legs_a')} until={S('honk') - 0.1} text="4 WHEELS!" y={130} size={140} color="#ff924c" />
      {(['more_q', 'less_q', 'add_q', 'add2_q', 'sub_q', 'col_q', 'col2_q', 'find_q', 'find2_q'] as const).map((q, i) => {
        const a = (['more_a', 'less_a', 'add_a', 'add2_a', 'sub_a', 'col_a', 'col2_a', 'find_a', 'find2_a'] as const)[i];
        return <ThinkTimer key={q} t={t} from={onBeat(E(q) + 0.1)} to={S(a) - 0.1} x={1760} y={190} r={90} label="THINK!" />;
      })}
      <PopText t={t} at={word('sun', 12)} until={S('d10') - 0.1} text="COUNT DOWN!" y={130} size={120} color="#ffffff" />
      {Array.from({ length: 10 }, (_, j) => 10 - j).map((n) => (
        <PopText key={n} t={t} at={S(k(`d${n}`)) - 0.05} until={LEAVE(n) + 0.8} text={String(n)} y={130} size={170} color={RAINBOW[n - 1]} />
      ))}
      <PopText t={t} at={S('night')} until={S('bye') - 0.1} text="GOODNIGHT, CARS!" y={130} size={100} color="#fff3b0" />
      <PopText t={t} at={S('bye')} until={E('bye2') + 0.6} text="SEE YOU NEXT TIME!" y={130} size={100} color="#ffca3a" />
      <Confetti t={t} at={S('ten')} y={420} />
      {(['more_a', 'add2_a', 'sub_a', 'find2_a'] as const).map((a) => <Confetti key={a} t={t} at={S(a) + 0.2} y={420} />)}
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <SparksIntro t={t} at={0} cast={{ kids: [MILA_HERO, LEO_HERO], buddy: BOBO_HERO }} />
      <StarWipe t={t} at={E('bye2') + 0.6} dur={0.5} hold={5} color="#2b1d5c" x={W / 2} y={H * 0.45} />
    </>
  );
}
