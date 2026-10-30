// TINY SPARKS · Day 49 · 🎵 Educational Songs #7 — "Months of the Year Song" (LONG 16:9, 5:47, original song)
// kids-shorts/tiny-sparks/songs/day-049-months-of-the-year-song. Song = song.json → tools/gen_song.py (chant), 104 bpm.
// ENERGY LAYER: the channel ident on the jingle (0–3.7 s), then the song (all song times + INTRO_S).
// THE YEAR WHEEL (12 rainbow slices, JAN → DEC) turns so the month being sung sits under the pointer; the meadow's
// weather follows the season (snow · butterflies · rain in April · birds · falling leaves). Form: CHORUS (the sung
// month pops big; "twelve months" = 12 dots) → 12 month verses ("January, January! / Snowy, cold and white!" — a month
// card: number, name, a picture, then a YOUR TURN rest bar) → CHORUS → 4 quiz questions (what comes after March / June
// / August / December — "the year starts again!"; a THINK ring through 3 rest bars, the answer pops) → CHORUS →
// BIRTHDAY bridge ("When's your birthday? Shout your month!") → KARAOKE chorus ("NOW YOU SING!") → SLOW pass (each
// month alone, then YOUR TURN) → CHORUS → "You know the 12 months!". Spark Girl sings; Captain Leo, Professor Hoot,
// Super Bobo dance.
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO_HERO, HOOT_HERO, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Sun } from '../../lib/kids/sets';
import { Backdrop, type PlaceFx } from '../../lib/kids/places';
import { Confetti, FONT_TOON, PopText, SingAlong, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, INTRO_S, SparksIntro, StarWipe, directorCam, type Shot } from '../../lib/kids/energy';
import { EASE_INOUT, EASE_OUT, prog, timeWords, type VoLine } from '../../lib/shorts';
import { SONG as SONG0, SONG_BEAT, SONG_DURATION } from './song.gen';

export const compositionConfig = { id: 'KidsSongs049', durationInSeconds: 346.6, fps: 30, width: 1920, height: 1080 };

const W = 1920;
const H = 1080;
const f = FLOOR(H);
const OFF = INTRO_S;
const shift = (l: VoLine, d: number): VoLine => ({ ...l, start: l.start + d, end: l.end + d, words: (l.words ?? []).map((w) => ({ ...w, start: w.start + d, end: w.end + d })) });
const SONG: VoLine[] = SONG0.map((l) => shift(l, OFF));
const S = (i: number) => SONG[i].start;
const E = (i: number) => SONG[i].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;
const BAR = SONG_BEAT * 4;
const END = SONG_DURATION + OFF - 2.0;

// ── the song map (line indices from song.gen.ts)
const CHORUS = [0, 40, 52, 71];
const VERSE0 = 4; // month i: lines 4 + 3i (name), 5 + 3i (name!), 6 + 3i (the picture line)
const QUIZ0 = 44; // question k: lines 44 + 2k (question), 45 + 2k (answer)
const BDAY0 = 56;
const KAR0 = S(BDAY0) + 4 * BAR; // the karaoke chorus = the 8 instrumental bars after the birthday bridge
const KARAOKE: VoLine[] = SONG.slice(0, 4).map((l) => shift(l, KAR0 - S(0)));
const SLOW0 = 58; // "Let's say them slowly!" then 59..70 = January..December
const LAST = SONG.length - 1;

const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
const MC = (i: number) => ['#4cc9f0', '#ff6fa5', '#52b788', '#1982c4', '#f15bb5', '#ffca3a', '#ff924c', '#e9a35b', '#ff595e', '#e76f51', '#8d6e63', '#6a4c93'][i];
const ORD = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const QUIZ: { known: number; ans: number }[] = [{ known: 2, ans: 3 }, { known: 5, ans: 6 }, { known: 7, ans: 8 }, { known: 11, ans: 0 }];
const fxOf = (m: number): PlaceFx[] =>
  m === 11 || m <= 1 ? ['snow'] : m === 3 ? ['rain'] : m <= 4 ? ['butterflies', 'birds'] : m <= 7 ? ['birds', 'twinkles'] : ['leaves'];

// ── the year wheel
const WHEEL: [number, number] = [470, 350];
const WR = 250;
const arcPath = (a0: number, a1: number, r: number) => {
  const p = (a: number) => `${(Math.cos((a * Math.PI) / 180) * r).toFixed(1)},${(Math.sin((a * Math.PI) / 180) * r).toFixed(1)}`;
  return `M 0,0 L ${p(a0)} A ${r},${r} 0 0 1 ${p(a1)} Z`;
};
const YearWheel: React.FC<{ rot: number; lit: (i: number) => number; t: number }> = ({ rot, lit, t }) => (
  <g transform={`translate(${WHEEL[0]},${WHEEL[1]})`}>
    <circle r={WR + 18} fill="#ffffff" {...kst(9)} />
    <g transform={`rotate(${rot})`}>
      {MONTHS.map((m, i) => {
        const a = -90 + i * 30;
        const l = lit(i);
        return (
          <g key={m}>
            <path d={arcPath(a - 15, a + 15, WR + (l >= 1 ? 10 : 0))} fill={MC(i)} opacity={l > 0 ? 1 : 0.75} {...kst(5)} />
            <g transform={`rotate(${a + 90}) translate(0,${-WR * 0.72})`}>
              <text y={12} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={l >= 1 ? 40 : 34} fill="#ffffff" stroke={KINK} strokeWidth={5} paintOrder="stroke">{m.slice(0, 3)}</text>
            </g>
          </g>
        );
      })}
    </g>
    <Vol><circle r={70} fill="#ffffff" {...kst(7)} /></Vol>
    <Sun x={0} y={0} r={46} t={t} />
    {/* the pointer */}
    <path d={`M -30,${-WR - 60} L 30,${-WR - 60} L 0,${-WR - 10} Z`} fill="#ffca3a" {...kst(6)} />
  </g>
);

// ── the month pictures (origin = centre, ~260 px)
const MonthPic: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  const st = kst(7);
  switch (i) {
    case 0: return ( // a snowflake
      <g transform={`rotate(${t * 20})`}>
        {[0, 60, 120].map((a) => <rect key={a} x={-12} y={-110} width={24} height={220} rx={12} fill="#4cc9f0" {...st} transform={`rotate(${a})`} />)}
        {[0, 60, 120, 180, 240, 300].map((a) => <path key={a} d="M -30,-80 L 0,-60 L 30,-80" fill="none" stroke="#ffffff" strokeWidth={10} strokeLinecap="round" transform={`rotate(${a})`} />)}
      </g>
    );
    case 1: return <g transform={`scale(${1 + Math.sin(t * 6) * 0.05})`}><Vol><path d="M 0,90 C -150,0 -110,-110 -50,-104 C -20,-100 0,-80 0,-56 C 0,-80 20,-100 50,-104 C 110,-110 150,0 0,90 Z" fill="#ff6fa5" {...st} /></Vol></g>;
    case 2: return ( // a kite
      <g transform={`translate(0,${Math.sin(t * 2) * 10}) rotate(${Math.sin(t * 2) * 8})`}>
        <Vol><path d="M 0,-110 L 80,-10 L 0,110 L -80,-10 Z" fill="#52b788" {...st} /></Vol>
        <path d="M 0,-110 L 0,110 M -80,-10 L 80,-10" stroke="#ffffff" strokeWidth={8} />
        <path d={`M 0,110 Q ${-30 + Math.sin(t * 3) * 14},150 0,190 Q 30,230 -10,270`} fill="none" stroke={KINK} strokeWidth={5} />
      </g>
    );
    case 3: return ( // an umbrella in the rain
      <g>
        <Vol><path d="M -130,10 Q -120,-120 0,-124 Q 120,-120 130,10 Q 90,-20 44,10 Q 0,-20 -44,10 Q -90,-20 -130,10 Z" fill="#1982c4" {...st} /></Vol>
        <rect x={-6} y={0} width={12} height={110} rx={6} fill="#8d6e63" {...kst(4)} />
        {[[-150, -150], [-60, -170], [80, -160], [150, -100]].map(([x, y], k) => {
          const p = (t * 0.9 + k * 0.27) % 1;
          return <path key={k} d={`M ${x},${y + p * 200} c 8,12 12,18 12,24 a 12,12 0 0 1 -24,0 c 0,-6 4,-12 12,-24 z`} fill="#4cc9f0" {...kst(3)} opacity={1 - p} />;
        })}
      </g>
    );
    case 4: return ( // flowers
      <g>
        {[-80, 0, 80].map((x, k) => (
          <g key={x} transform={`translate(${x},${60 - (k === 1 ? 50 : 0)}) rotate(${Math.sin(t * 1.6 + k) * 6})`}>
            <rect x={-5} y={0} width={10} height={90} fill="#3a8d3a" />
            <Vol>
              {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 26} cy={Math.sin((a * Math.PI) / 180) * 26} r={20} fill={['#f15bb5', '#ffca3a', '#b388ff'][k]} {...kst(4)} />)}
              <circle r={16} fill="#ffd166" {...kst(4)} />
            </Vol>
          </g>
        ))}
      </g>
    );
    case 5: return <Sun x={0} y={0} r={100} t={t} />;
    case 6: return ( // a swim ring on blue water
      <g>
        <path d={`M -150,60 q 37,-20 75,0 q 37,20 75,0 q 37,-20 75,0 q 37,20 75,0`} fill="none" stroke="#4cc9f0" strokeWidth={14} strokeLinecap="round" />
        <g transform={`translate(0,${Math.sin(t * 2) * 8})`}>
          <Vol><circle r={90} fill="#ff924c" {...st} /></Vol>
          <circle r={42} fill="#bfefff" {...kst(6)} />
          {[0, 90, 180, 270].map((a) => <rect key={a} x={-14} y={-90} width={28} height={48} fill="#ffffff" transform={`rotate(${a + 45})`} />)}
        </g>
      </g>
    );
    case 7: return ( // a sand pail + spade
      <g>
        <Vol><path d="M -80,-60 L 80,-60 L 60,90 L -60,90 Z" fill="#e9a35b" {...st} /></Vol>
        <path d="M -76,-60 Q 0,-170 76,-60" fill="none" stroke={KINK} strokeWidth={8} />
        <rect x={-80} y={-70} width={160} height={24} rx={10} fill="#ffca3a" {...kst(5)} />
        <g transform="translate(110,0) rotate(20)"><rect x={-6} y={-90} width={12} height={110} fill="#ff595e" {...kst(4)} /><Vol><path d="M -30,20 L 30,20 L 20,80 L -20,80 Z" fill="#ff595e" {...kst(5)} /></Vol></g>
      </g>
    );
    case 8: return ( // a school bag
      <g>
        <path d="M -50,-90 Q 0,-150 50,-90" fill="none" stroke={KINK} strokeWidth={12} />
        <Vol><rect x={-100} y={-90} width={200} height={190} rx={40} fill="#ff595e" {...st} /></Vol>
        <Vol><rect x={-64} y={10} width={128} height={70} rx={20} fill="#ff924c" {...kst(6)} /></Vol>
        <rect x={-100} y={-40} width={200} height={14} fill={KINK} opacity={0.2} />
      </g>
    );
    case 9: return ( // falling leaves
      <g>
        {[[-60, 0, '#e76f51'], [50, -40, '#ffca3a'], [10, 70, '#8d5a3b']].map(([x, y, c], k) => (
          <g key={k} transform={`translate(${(x as number) + Math.sin(t * 1.5 + k) * 20},${y}) rotate(${Math.sin(t * 2 + k) * 30})`}>
            <Vol><path d="M 0,-70 Q 60,-20 0,70 Q -60,-20 0,-70 Z" fill={c as string} {...kst(6)} /></Vol>
            <path d="M 0,-60 L 0,70" stroke={KINK} strokeWidth={5} />
          </g>
        ))}
      </g>
    );
    case 10: return ( // a cosy sweater
      <g>
        <Vol><path d="M -70,-100 L 70,-100 L 140,-30 L 110,10 L 80,-10 L 80,110 L -80,110 L -80,-10 L -110,10 L -140,-30 Z" fill="#8d6e63" {...st} /></Vol>
        <path d="M -30,-100 Q 0,-70 30,-100" fill="none" stroke={KINK} strokeWidth={7} />
        {[-40, 0, 40].map((x) => <path key={x} d={`M ${x - 16},30 L ${x},10 L ${x + 16},30`} fill="none" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" />)}
      </g>
    );
    default: return ( // twinkly lights on a string
      <g>
        <path d="M -150,-40 Q 0,40 150,-40" fill="none" stroke={KINK} strokeWidth={6} />
        {[-120, -60, 0, 60, 120].map((x, k) => {
          const y = -40 + (1 - Math.pow(x / 150, 2)) * 40;
          const on = Math.sin(t * 4 + k * 1.3) > 0;
          return (
            <g key={x} transform={`translate(${x},${y + 24})`}>
              <circle r={36} fill={['#ff595e', '#ffca3a', '#52b788', '#4cc9f0', '#f15bb5'][k]} opacity={on ? 0.35 : 0.1} />
              <Vol><ellipse rx={18} ry={26} fill={['#ff595e', '#ffca3a', '#52b788', '#4cc9f0', '#f15bb5'][k]} {...kst(4)} /></Vol>
            </g>
          );
        })}
      </g>
    );
  }
};
const Cake: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Vol><rect x={-140} y={-20} width={280} height={120} rx={24} fill="#ffb3c6" {...kst(7)} /></Vol>
    <Vol><rect x={-100} y={-100} width={200} height={90} rx={20} fill="#fff3b0" {...kst(7)} /></Vol>
    {[-50, 0, 50].map((x, k) => (
      <g key={x} transform={`translate(${x},-100)`}>
        <rect x={-8} y={-50} width={16} height={50} rx={6} fill={['#4cc9f0', '#ff595e', '#8ac926'][k]} {...kst(3)} />
        <path d={`M 0,${-80 + Math.sin(t * 9 + k) * 3} q 12,14 0,26 q -12,-12 0,-26 Z`} fill="#ffca3a" />
      </g>
    ))}
  </g>
);

const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (EASE_OUT(p) - 1) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};

// ── camera: gentle — a soft push on each card, wide in the choruses
const SHOTS: Shot[] = [{ t: 0, z: 1.0, x: 960, y: 540, move: 'cut' }];
for (let i = 0; i < 12; i++) {
  SHOTS.push({ t: S(VERSE0 + i * 3) - 0.3, z: 1.05, x: 980, y: 520, move: 'snap', push: 0.004 }, { t: E(VERSE0 + i * 3 + 2) + 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 });
}
for (let k = 0; k < 4; k++) {
  SHOTS.push({ t: S(QUIZ0 + k * 2) - 0.3, z: 1.03, x: 980, y: 520, move: 'smooth', dur: 0.6, push: 0.003 }, { t: S(QUIZ0 + k * 2 + 1) - 0.05, z: 1.08, x: 1000, y: 500, move: 'snap' }, { t: E(QUIZ0 + k * 2 + 1) + 0.4, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 });
}
SHOTS.sort((a, b) => a.t - b.t);
const PUNCHES = Array.from({ length: 4 }, (_, k) => S(QUIZ0 + k * 2 + 1));

// the wheel turns so the month being sung sits under the pointer: keyframes from the song map, eased the short way
const ROT_KEYS: [number, number][] = (() => {
  const k: [number, number][] = [];
  for (let i = 0; i < 12; i++) k.push([S(VERSE0 + i * 3) - 0.3, i], [S(SLOW0 + 1 + i) - 0.2, i]);
  QUIZ.forEach((q, i) => k.push([S(QUIZ0 + i * 2) - 0.3, q.known], [S(QUIZ0 + i * 2 + 1) - 0.05, q.ans]));
  const map: [number, number, number][] = [[0, 0, 0], [0, 1, 1], [0, 2, 2], [0, 4, 3], [1, 0, 4], [1, 2, 5], [1, 4, 6], [1, 5, 7], [2, 0, 8], [2, 1, 9], [2, 2, 10], [2, 3, 11]];
  const bases: [VoLine[], number][] = [...CHORUS.map((c) => [SONG, c] as [VoLine[], number]), [KARAOKE, 0]];
  for (const [lines, base] of bases) for (const [li, wi, m] of map) k.push([timeWords(lines[base + li])[wi].start, m]);
  return k.sort((x, y) => x[0] - y[0]);
})();
const wheelRot = (t: number) => {
  let i = -1;
  while (i + 1 < ROT_KEYS.length && ROT_KEYS[i + 1][0] <= t) i++;
  if (i < 0) return 0;
  const cur = -ROT_KEYS[i][1] * 30;
  const prev = i > 0 ? -ROT_KEYS[i - 1][1] * 30 : 0;
  let d = cur - prev;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return prev + d * EASE_INOUT(prog(t, ROT_KEYS[i][0], ROT_KEYS[i][0] + 0.4));
};

// card + cast layout
const CARD: [number, number] = [1390, 320];
const CARD_W = 560;
const CARD_H = 420;

export default function KidsSongs049() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const beat = Math.abs(Math.sin(((t - OFF) / SONG_BEAT) * Math.PI));
  const bar = Math.floor((t - OFF) / BAR);
  const dance = (phase: number, amp = 26) => (t < OFF ? 0 : Math.abs(Math.sin(((t - OFF) / SONG_BEAT) * Math.PI + phase)) * amp);
  const armSwap = bar % 2 === 0;
  const singing = SONG.some((l) => t >= l.start && t < l.end);

  // which part of the song
  let vi = -1;
  for (let i = 0; i < 12; i++) if (within(t, S(VERSE0 + i * 3) - 0.3, (i < 11 ? S(VERSE0 + (i + 1) * 3) : S(CHORUS[1])) - 0.3)) vi = i;
  const yourTurn = vi >= 0 && within(t, E(VERSE0 + vi * 3 + 2) + 0.1, (vi < 11 ? S(VERSE0 + (vi + 1) * 3) : S(CHORUS[1])) - 0.4);
  let qi = -1;
  for (let k = 0; k < 4; k++) if (within(t, S(QUIZ0 + k * 2) - 0.3, (k < 3 ? S(QUIZ0 + (k + 1) * 2) : S(CHORUS[2])) - 0.3)) qi = k;
  const chorusIdx = CHORUS.findIndex((c) => within(t, S(c) - 0.4, E(c + 3) + 0.4));
  const karaoke = within(t, KAR0 - 0.3, S(SLOW0) - 0.3);
  const bday = within(t, S(BDAY0) - 0.3, KAR0 - 0.3);
  let si = -1;
  for (let i = 0; i < 12; i++) if (within(t, S(SLOW0 + 1 + i) - 0.2, (i < 11 ? S(SLOW0 + 2 + i) : S(CHORUS[3])) - 0.3)) si = i;
  const slowIntro = within(t, S(SLOW0) - 0.3, S(SLOW0 + 1) - 0.2);
  const slowTurn = si >= 0 && t >= E(SLOW0 + 1 + si) + 0.1;
  const end = t >= E(LAST) + 0.2;

  // the month being sung in a chorus line
  const [chorusM, chorusMAt] = (() => {
    const lines = karaoke ? KARAOKE : SONG;
    const base = karaoke ? 0 : chorusIdx >= 0 ? CHORUS[chorusIdx] : -1;
    if (base < 0) return [-1, 0];
    const map: [number, number, number][] = [[0, 0, 0], [0, 1, 1], [0, 2, 2], [0, 4, 3], [1, 0, 4], [1, 2, 5], [1, 4, 6], [1, 5, 7], [2, 0, 8], [2, 1, 9], [2, 2, 10], [2, 3, 11]];
    let d: [number, number] = [-1, 0];
    for (const [li, wi, m] of map) {
      const l = lines[base + li];
      const w = timeWords(l);
      if (w[wi] && t >= w[wi].start && t < (li === 2 && wi === 3 ? l.end : w[wi].end + 0.15)) d = [m, w[wi].start];
    }
    return d;
  })();
  const twelveOn = (() => {
    const lines = karaoke ? KARAOKE : SONG;
    const base = karaoke ? 0 : chorusIdx >= 0 ? CHORUS[chorusIdx] : -1;
    return base >= 0 && within(t, lines[base + 3].start, lines[base + 3].end + 0.4);
  })();
  const quizAns = qi >= 0 && t >= S(QUIZ0 + qi * 2 + 1) ? QUIZ[qi].ans : -1;
  const active = vi >= 0 ? vi : si >= 0 ? si : chorusM >= 0 ? chorusM : quizAns >= 0 ? quizAns : qi >= 0 ? QUIZ[qi].known : -1;
  const lit = (i: number) => (i === active ? 1 : twelveOn || end ? 0.6 : 0);

  const rot = wheelRot(t);
  const seasonM = active >= 0 ? active : 0;

  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
        <Backdrop place="meadow" w={W} h={H} t={t} fx={fxOf(seasonM)} />
        {(seasonM === 11 || seasonM <= 1) && <rect width={W} height={H} fill="#e6f6ff" opacity={0.25} />}
        {seasonM >= 8 && seasonM <= 10 && <rect width={W} height={H} fill="#ffb067" opacity={0.12} />}

        <g transform={`translate(0,${-dance(0.3, 4)})`}><YearWheel rot={rot} lit={lit} t={t} /></g>

        {/* chorus: the sung month pops big; "twelve months" = 12 dots */}
        {(chorusIdx >= 0 || karaoke) && chorusM >= 0 && (
          <g key={`cm${chorusM}`} transform={`translate(${CARD[0]},${CARD[1] + 40}) scale(${popIn(t, chorusMAt, 0.25)})`}>
            <text y={40} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={MONTHS[chorusM].length > 7 ? 100 : 130} fill={MC(chorusM)} stroke={KINK} strokeWidth={13} paintOrder="stroke">{MONTHS[chorusM]}</text>
          </g>
        )}
        {(chorusIdx >= 0 || karaoke) && twelveOn && (
          <g transform={`translate(${CARD[0]},${CARD[1] + 20})`}>
            {MONTHS.map((_, i) => (
              <g key={i} transform={`translate(${((i % 6) - 2.5) * 96},${Math.floor(i / 6) * 110 - 55 - Math.abs(Math.sin(t * 5 + i * 0.6)) * 18}) scale(${popIn(t, (karaoke ? KARAOKE : SONG)[(karaoke ? 0 : CHORUS[chorusIdx]) + 3].start + i * 0.06)})`}>
                <Vol><circle r={42} fill={MC(i)} {...kst(6)} /></Vol>
                <text y={15} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={42} fill="#ffffff" stroke={KINK} strokeWidth={5} paintOrder="stroke">{i + 1}</text>
              </g>
            ))}
          </g>
        )}

        {/* verse: the month card */}
        {vi >= 0 && (
          <g transform={`translate(${CARD[0]},${CARD[1]}) scale(${EASE_OUT(prog(t, S(VERSE0 + vi * 3) - 0.3, S(VERSE0 + vi * 3)))}) rotate(-2)`}>
            <rect x={-CARD_W / 2} y={-CARD_H / 2} width={CARD_W} height={CARD_H} rx={50} fill="#ffffff" {...kst(10)} />
            <rect x={-CARD_W / 2 + 24} y={-CARD_H / 2 + 24} width={CARD_W - 48} height={230} rx={36} fill={MC(vi)} opacity={0.18} />
            <g transform={`translate(${-CARD_W / 2 + 60},${-CARD_H / 2 + 60})`}>
              <circle r={40} fill={MC(vi)} {...kst(6)} />
              <text y={15} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={vi >= 9 ? 36 : 44} fill="#ffffff" stroke={KINK} strokeWidth={4} paintOrder="stroke">{vi + 1}</text>
            </g>
            <g transform={`translate(0,-70) scale(${0.72 * popIn(t, S(VERSE0 + vi * 3) + 0.4)})`}><MonthPic i={vi} t={t} /></g>
            <text y={118 + Math.sin(t * 3) * 3} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={MONTHS[vi].length > 7 ? 70 : 84} fill={MC(vi)} stroke={KINK} strokeWidth={7} paintOrder="stroke">{MONTHS[vi]}</text>
            <text y={178} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={36} fill={KINK}>{ORD[vi]} month</text>
          </g>
        )}

        {/* quiz: known month → ? */}
        {qi >= 0 && (() => {
          const Q = QUIZ[qi];
          const L = QUIZ0 + qi * 2;
          const done = t >= S(L + 1) - 0.05;
          const Pill: React.FC<{ m: number; q?: boolean; on?: boolean }> = ({ m, q, on }) => (
            <g>
              <rect x={-120} y={-60} width={240} height={120} rx={30} fill={q ? '#ffffff' : MC(m)} {...kst(on ? 10 : 7)} stroke={on ? '#ffca3a' : KINK} />
              <text y={18} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={q ? 80 : MONTHS[m].length > 7 ? 40 : 50} fill={q ? KINK : '#ffffff'} stroke={KINK} strokeWidth={q ? 0 : 5} paintOrder="stroke">{q ? '?' : MONTHS[m]}</text>
            </g>
          );
          return (
            <g transform={`translate(${CARD[0]},${CARD[1]}) scale(${EASE_OUT(prog(t, S(L) - 0.3, S(L) + 0.2))})`}>
              <rect x={-CARD_W / 2 - 20} y={-CARD_H / 2} width={CARD_W + 40} height={CARD_H} rx={50} fill="#ffffff" {...kst(10)} />
              <text y={-120} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={50} fill={KINK}>WHAT COMES AFTER?</text>
              <path d="M -30,30 L 30,30 M 6,6 L 30,30 L 6,54" fill="none" stroke={KINK} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
              <g transform="translate(-160,30)"><Pill m={Q.known} /></g>
              <g transform={`translate(160,30) scale(${done ? popIn(t, S(L + 1) - 0.05) : 1})`}>{done ? <Pill m={Q.ans} on /> : <Pill m={Q.ans} q />}</g>
            </g>
          );
        })()}

        {/* birthday bridge */}
        {bday && (
          <g transform={`translate(${CARD[0]},${CARD[1]}) scale(${EASE_OUT(prog(t, S(BDAY0) - 0.3, S(BDAY0) + 0.2))})`}>
            <rect x={-CARD_W / 2} y={-CARD_H / 2} width={CARD_W} height={CARD_H} rx={50} fill="#ffffff" {...kst(10)} />
            <g transform="translate(0,20)"><Cake t={t} /></g>
            <text y={-140} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={50} fill="#ff6fa5" stroke={KINK} strokeWidth={4} paintOrder="stroke">YOUR BIRTHDAY?</text>
            <text y={180} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill={KINK}>Shout your month!</text>
          </g>
        )}

        {/* slow pass: one big month at a time */}
        {si >= 0 && (
          <g key={`s${si}`} transform={`translate(${CARD[0]},${CARD[1] + 60}) scale(${popIn(t, S(SLOW0 + 1 + si) - 0.2)})`}>
            <text y={40} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={MONTHS[si].length > 7 ? 104 : 140} fill={MC(si)} stroke={KINK} strokeWidth={14} paintOrder="stroke">{MONTHS[si]}</text>
          </g>
        )}

        {/* the cast */}
        <Critter spec={BOBO_HERO} x={260} y={f} scale={0.46} expr="laugh" look={[0.4, -0.2]}
          armL={beat > 0.5 ? 'clap' : 'up'} armR={beat > 0.5 ? 'clap' : 'up'} hop={dance(1.8, 22)} />
        <Kid spec={MILA_HERO} x={860} y={f} scale={0.55} expr={end ? 'laugh' : 'happy'} look={[0.3, -0.2]}
          mouth={lipSync(SONG, 'mila', t)}
          armL={end ? 'up' : karaoke ? 'wave' : armSwap ? 'up' : 'wave'}
          armR={end ? 'up' : (vi >= 0 && !yourTurn) || (qi >= 0 && singing) ? 'present' : armSwap ? 'wave' : 'up'}
          hop={singing ? dance(0, 10) : dance(0, 18)} />
        <Critter spec={HOOT_HERO} x={1180} y={f} scale={0.42} expr={yourTurn || slowTurn ? 'happy' : 'laugh'} look={[-0.2, -0.2]}
          armL={armSwap ? 'up' : 'wave'} armR={armSwap ? 'wave' : 'up'} hop={dance(1.2, 22)} />
        <Kid spec={LEO_HERO} x={1580} y={f} scale={0.52} expr={yourTurn || slowTurn ? 'happy' : 'laugh'} look={[-0.4, -0.2]}
          armL={armSwap ? 'wave' : 'up'} armR={armSwap ? 'up' : 'clap'} hop={dance(0.6, 26)} />
      </ActionStage>

      {chorusIdx >= 0 && <PopText t={t} at={S(CHORUS[chorusIdx])} until={S(CHORUS[chorusIdx]) + 2.0} text="SING WITH ME!" y={90} size={80} color="#ffffff" />}
      {karaoke && <PopText t={t} at={KAR0 - 0.3} until={KAR0 + 2.4} text="NOW YOU SING!" y={90} size={100} color="#ff6fa5" />}
      {yourTurn && <PopText t={t} at={E(VERSE0 + vi * 3 + 2) + 0.1} text="YOUR TURN!" x={CARD[0]} y={600} size={76} color="#ffca3a" />}
      {slowIntro && <PopText t={t} at={S(SLOW0)} text="NICE AND SLOW..." x={CARD[0]} y={380} size={90} color="#ffffff" />}
      {slowTurn && <PopText t={t} at={E(SLOW0 + 1 + si) + 0.1} text="YOUR TURN!" x={CARD[0]} y={560} size={76} color="#ffca3a" />}
      {bday && t >= E(BDAY0) && t < S(BDAY0 + 1) && <PopText t={t} at={E(BDAY0) + 0.1} text="SAY IT!" x={CARD[0]} y={600} size={76} color="#ffca3a" />}
      {bday && t >= E(BDAY0 + 1) && <PopText t={t} at={E(BDAY0 + 1) + 0.1} text="HIP HIP HOORAY!" x={CARD[0]} y={600} size={70} color="#ff6fa5" />}
      {qi >= 0 && <ThinkTimer t={t} from={E(QUIZ0 + qi * 2) + 0.1} to={S(QUIZ0 + qi * 2 + 1) - 0.1} x={1790} y={110} r={80} label="THINK!" />}
      {qi === 3 && t >= S(QUIZ0 + 7) && <PopText t={t} at={S(QUIZ0 + 7) + 0.6} until={S(CHORUS[2]) - 0.4} text="THE YEAR STARTS AGAIN!" x={CARD[0]} y={600} size={60} color="#ff595e" />}
      {CHORUS.map((c) => <Confetti key={c} t={t} at={E(c + 3)} y={400} dur={1.4} />)}
      {Array.from({ length: 4 }, (_, k) => <Confetti key={k} t={t} at={S(QUIZ0 + k * 2 + 1) + 0.2} y={400} dur={1.1} />)}
      <Confetti t={t} at={E(BDAY0 + 1)} y={400} dur={1.4} />
      {end && <PopText t={t} at={E(LAST) + 0.2} until={END + 1.5} text="YOU KNOW THE 12 MONTHS!" y={540} size={96} color="#ffca3a" />}
      <SingAlong t={t} lines={karaoke ? KARAOKE : SONG} ball={karaoke ? '#ff6fa5' : '#ff595e'} />
      <SparksIntro t={t} at={0} cast={{ kids: [MILA_HERO, LEO_HERO], buddy: BOBO_HERO }} />
      <StarWipe t={t} at={END + 1.4} dur={0.5} hold={5} color="#3b2a4a" x={W / 2} y={H * 0.45} />
    </>
  );
}
