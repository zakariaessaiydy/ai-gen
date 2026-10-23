// TINY SPARKS · Day 42 · 🎵 Educational Songs #6 — "Days of the Week Song" (LONG 16:9, 5:08, original song)
// kids-shorts/tiny-sparks/songs/day-042-days-of-the-week-song. Song = song.json → tools/gen_song.py (chant), 100 bpm.
// ENERGY LAYER: the channel ident on the jingle (0–3.6 s), then the song (all song times + INTRO_S).
// THE WEEK TRAIN rides along the top: an engine + 7 rainbow cars (Sunday → Saturday); the car of the day being sung
// lights up and bounces. Form: CHORUS (the sung day pops big in its colour) → 7 day verses ("Sunday, Sunday! /
// Shiny, sunny day!" — a day card with a picture + a YOUR TURN echo bar) → CHORUS → 5 TRAIN QUIZ questions (what
// comes after / before…? two cars + a "?", a THINK ring through the 2 rest bars, the answer car rolls in) → CHORUS →
// WEEKEND bridge (a 7-box week: 5 school days + 2 play days) → KARAOKE chorus ("NOW YOU SING!") → SLOW pass (each day
// alone, then YOUR TURN) → CHORUS → end + star iris. Spark Girl sings; Captain Leo, Professor Hoot, Super Bobo dance.
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO_HERO, HOOT_HERO, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow, Sun } from '../../lib/kids/sets';
import { Ball, Confetti, FONT_TOON, PopText, RAINBOW, SingAlong, Star, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, INTRO_S, SparksIntro, StarWipe, directorCam, type Shot } from '../../lib/kids/energy';
import { EASE_OUT, prog, timeWords, type VoLine } from '../../lib/shorts';
import { SONG as SONG0, SONG_BEAT, SONG_DURATION } from './song.gen';

export const compositionConfig = { id: 'KidsSongs042', durationInSeconds: 308.1, fps: 30, width: 1920, height: 1080 };

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
const CHORUS = [0, 18, 32, 48];
const VERSE0 = 4; // day i: lines 4 + 2i (day name) and 5 + 2i (the sentence)
const QUIZ0 = 22; // question k: lines 22 + 2k (question) and 23 + 2k (answer)
const WEEKEND0 = 36;
const KAR0 = E(39); // the karaoke chorus = the 8 instrumental bars after the weekend bridge
const KARAOKE: VoLine[] = SONG.slice(0, 4).map((l) => shift(l, KAR0 - S(0)));
const SLOW0 = 40; // "Let's say them slowly!" then 41..47 = Sunday..Saturday
const LAST = SONG.length - 1;

const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DC = (i: number) => ['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ff6fa5'][i];
const QUIZ: { known: number; ans: number; before: boolean }[] = [
  { known: 1, ans: 2, before: false },
  { known: 3, ans: 4, before: false },
  { known: 5, ans: 6, before: false },
  { known: 6, ans: 0, before: false }, // the week starts again!
  { known: 3, ans: 2, before: true },
];

// ── the week train
const CAR_X = (i: number) => 430 + i * 212;
const TRACK_Y = 300;
const Car: React.FC<{ i: number; lit: number; wheel: number; label?: string; q?: boolean }> = ({ i, lit, wheel, label, q }) => (
  <g>
    <Vol kind="slope"><rect x={-96} y={-120} width={192} height={110} rx={20} fill={q ? '#ffffff' : DC(i)} {...kst(7)} /></Vol>
    <rect x={-80} y={-104} width={160} height={52} rx={12} fill="#ffffff" opacity={q ? 1 : 0.9} {...kst(4)} />
    <text y={-66} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={(label ?? DAYS[i]).length > 7 ? 26 : 32} fill={q ? KINK : DC(i)} stroke={KINK} strokeWidth={q ? 0 : 2}>{label ?? DAYS[i]}</text>
    {[-52, 52].map((x) => (
      <g key={x} transform={`translate(${x},-6) rotate(${wheel})`}>
        <Vol><circle r={24} fill="#3b2a4a" {...kst(5)} /></Vol>
        <circle r={9} fill="#ced4da" />
        <path d="M -20,0 L 20,0 M 0,-20 L 0,20" stroke="#ced4da" strokeWidth={4} />
      </g>
    ))}
    {lit > 0 && <rect x={-104} y={-128} width={208} height={126} rx={26} fill="none" stroke="#ffd166" strokeWidth={10} opacity={lit} />}
  </g>
);
const Engine: React.FC<{ t: number; wheel: number }> = ({ t, wheel }) => (
  <g>
    {[0, 1, 2].map((k) => {
      const p = (t * 0.6 + k / 3) % 1;
      return <circle key={k} cx={58 - p * 40} cy={-200 - p * 120} r={18 + p * 26} fill="#ffffff" opacity={0.8 * (1 - p)} {...kst(3)} />;
    })}
    <Vol kind="tube"><rect x={36} y={-196} width={44} height={70} rx={8} fill="#2b2d42" {...kst(6)} /></Vol>
    <Vol><rect x={-110} y={-200} width={110} height={190} rx={18} fill="#ff595e" {...kst(7)} /></Vol>
    <rect x={-92} y={-180} width={74} height={60} rx={10} fill="#bde0fe" {...kst(4)} />
    <Vol kind="slope"><rect x={-10} y={-130} width={130} height={120} rx={24} fill="#1982c4" {...kst(7)} /></Vol>
    <circle cx={112} cy={-70} r={14} fill="#ffd166" {...kst(4)} />
    <text x={40} y={-56} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={30} fill="#ffffff">7</text>
    {[-70, 0, 70].map((x) => (
      <g key={x} transform={`translate(${x},-6) rotate(${wheel})`}>
        <Vol><circle r={x === -70 ? 34 : 26} fill="#3b2a4a" {...kst(5)} /></Vol>
        <path d="M -20,0 L 20,0 M 0,-20 L 0,20" stroke="#ced4da" strokeWidth={4} />
      </g>
    ))}
  </g>
);

// ── the day pictures (~300 px box)
const DayPic: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  switch (i) {
    case 0: return <Sun x={0} y={0} r={110} t={t} />;
    case 1: return ( // a school backpack
      <g transform={`rotate(${Math.sin(t * 2) * 4})`}>
        <path d="M -60,-120 Q 0,-170 60,-120" fill="none" stroke="#2b2d42" strokeWidth={16} strokeLinecap="round" />
        <Vol><rect x={-110} y={-120} width={220} height={250} rx={46} fill="#ff924c" {...kst(8)} /></Vol>
        <Vol><rect x={-80} y={20} width={160} height={90} rx={22} fill="#ffca3a" {...kst(6)} /></Vol>
        <path d="M -60,46 L 60,46" stroke="#e8590c" strokeWidth={8} strokeLinecap="round" />
        <rect x={-40} y={-90} width={80} height={60} rx={10} fill="#ffffff" {...kst(4)} />
        <text y={-48} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={38} fill="#1982c4">ABC</text>
      </g>
    );
    case 2: return ( // a paint palette + brush
      <g transform={`rotate(${-8 + Math.sin(t * 1.6) * 4})`}>
        <Vol><path d="M -150,0 C -150,-110 -20,-150 70,-120 C 160,-90 170,10 110,40 C 70,60 90,110 40,130 C -60,160 -150,90 -150,0 Z" fill="#e9c46a" {...kst(8)} /></Vol>
        <circle cx={60} cy={70} r={22} fill="#f3d9a4" {...kst(5)} />
        {[[-90, -10, '#ff595e'], [-50, -80, '#ffca3a'], [20, -90, '#8ac926'], [80, -40, '#1982c4'], [-80, 70, '#6a4c93']].map(([x, y, c], k) => (
          <circle key={k} cx={x as number} cy={y as number} r={26} fill={c as string} {...kst(4)} />
        ))}
        <g transform="translate(110,-130) rotate(35)">
          <rect x={-10} y={-10} width={20} height={150} rx={8} fill="#a0673c" {...kst(4)} />
          <path d="M -12,-10 Q 0,-60 12,-10 Z" fill="#ff6fa5" {...kst(4)} />
        </g>
      </g>
    );
    case 3: return ( // the middle of the week: 7 dots, the 4th glows
      <g>
        {Array.from({ length: 7 }).map((_, k) => {
          const mid = k === 3;
          return (
            <g key={k} transform={`translate(${(k - 3) * 52},${mid ? -10 - Math.abs(Math.sin(t * 4)) * 12 : 0}) scale(${mid ? 1.5 : 1})`}>
              <Vol><circle r={20} fill={DC(k)} {...kst(4)} /></Vol>
            </g>
          );
        })}
        <path d="M -30,90 L 0,50 L 30,90" fill="none" stroke={KINK} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
        <text y={140} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={46} fill="#8ac926" stroke={KINK} strokeWidth={4} paintOrder="stroke">MIDDLE!</text>
      </g>
    );
    case 4: return ( // dance: bouncing music notes
      <g>
        {[[-80, 0, '#1982c4'], [10, -60, '#ff6fa5'], [100, 10, '#ffca3a']].map(([x, y, c], k) => (
          <g key={k} transform={`translate(${x},${(y as number) - Math.abs(Math.sin(t * 4 + k)) * 30}) rotate(${Math.sin(t * 3 + k) * 12})`}>
            <Vol><ellipse cx={0} cy={60} rx={30} ry={22} fill={c as string} {...kst(5)} transform="rotate(-20 0 60)" /></Vol>
            <rect x={22} y={-50} width={10} height={110} rx={4} fill={KINK} />
            <path d="M 32,-50 Q 70,-30 60,10" fill="none" stroke={KINK} strokeWidth={9} strokeLinecap="round" />
          </g>
        ))}
      </g>
    );
    case 5: return ( // a pizza slice
      <g transform={`rotate(${Math.sin(t * 2) * 5})`}>
        <Vol><path d="M -110,-110 Q 0,-150 110,-110 L 0,140 Z" fill="#ffd166" {...kst(8)} /></Vol>
        <path d="M -110,-110 Q 0,-150 110,-110 L 100,-88 Q 0,-124 -100,-88 Z" fill="#e9a35b" {...kst(6)} />
        {[[-40, -60], [30, -50], [0, 10], [-15, 70]].map(([x, y], k) => <Vol key={k}><circle cx={x} cy={y} r={20} fill="#e63946" {...kst(4)} /></Vol>)}
      </g>
    );
    default: return ( // play outside: a ball + a kite
      <g>
        <g transform={`translate(-70,${60 - Math.abs(Math.sin(t * 3)) * 60}) rotate(${t * 120})`}><Ball r={70} /></g>
        <g transform={`translate(90,${-80 + Math.sin(t * 2) * 10}) rotate(${Math.sin(t * 2) * 8})`}>
          <Vol><path d="M 0,-80 L 60,0 L 0,80 L -60,0 Z" fill="#4cc9f0" {...kst(6)} /></Vol>
          <path d="M 0,-80 L 0,80 M -60,0 L 60,0" stroke="#ffffff" strokeWidth={6} />
          <path d={`M 0,80 Q ${-20 + Math.sin(t * 3) * 10},120 0,160 Q 20,200 -10,240`} fill="none" stroke={KINK} strokeWidth={4} />
        </g>
      </g>
    );
  }
};

const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (EASE_OUT(p) - 1) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};

// ── director camera (a song: gentle — a soft push on each card, wide in the choruses)
const SHOTS: Shot[] = [{ t: 0, z: 1.0, x: 960, y: 540, move: 'cut' }];
for (let i = 0; i < 7; i++) {
  SHOTS.push({ t: S(VERSE0 + i * 2) - 0.3, z: 1.05, x: 960, y: 540, move: 'snap', push: 0.003 }, { t: E(VERSE0 + i * 2 + 1) + 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 });
}
for (let k = 0; k < 5; k++) {
  SHOTS.push({ t: S(QUIZ0 + k * 2) - 0.3, z: 1.03, x: 960, y: 540, move: 'smooth', dur: 0.6, push: 0.003 }, { t: S(QUIZ0 + k * 2 + 1) - 0.05, z: 1.08, x: 960, y: 540, move: 'snap' }, { t: E(QUIZ0 + k * 2 + 1) + 0.4, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 });
}
SHOTS.sort((a, b) => a.t - b.t);
const PUNCHES = [...Array.from({ length: 5 }, (_, k) => S(QUIZ0 + k * 2 + 1))];

export default function KidsSongs042() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const beat = Math.abs(Math.sin(((t - OFF) / SONG_BEAT) * Math.PI));
  const bar = Math.floor((t - OFF) / BAR);
  const dance = (phase: number, amp = 26) => (t < OFF ? 0 : Math.abs(Math.sin(((t - OFF) / SONG_BEAT) * Math.PI + phase)) * amp);
  const armSwap = bar % 2 === 0;
  const singing = SONG.some((l) => t >= l.start && t < l.end);
  const wheel = (t - OFF) * 140;

  // which part of the song
  let vi = -1;
  for (let i = 0; i < 7; i++) if (within(t, S(VERSE0 + i * 2) - 0.3, (i < 6 ? S(VERSE0 + (i + 1) * 2) : S(CHORUS[1])) - 0.3)) vi = i;
  const yourTurn = vi >= 0 && within(t, E(VERSE0 + vi * 2 + 1) + 0.1, (vi < 6 ? S(VERSE0 + (vi + 1) * 2) : S(CHORUS[1])) - 0.4);
  let qi = -1;
  for (let k = 0; k < 5; k++) if (within(t, S(QUIZ0 + k * 2) - 0.3, (k < 4 ? S(QUIZ0 + (k + 1) * 2) : S(CHORUS[2])) - 0.3)) qi = k;
  const chorusIdx = CHORUS.findIndex((c) => within(t, S(c) - 0.4, E(c + 3) + 0.4));
  const karaoke = within(t, KAR0 - 0.3, S(SLOW0) - 0.3);
  const weekend = within(t, S(WEEKEND0) - 0.3, KAR0 - 0.3);
  let si = -1;
  for (let i = 0; i < 7; i++) if (within(t, S(SLOW0 + 1 + i) - 0.2, (i < 6 ? S(SLOW0 + 2 + i) : S(CHORUS[3])) - 0.3)) si = i;
  const slowIntro = within(t, S(SLOW0) - 0.3, S(SLOW0 + 1) - 0.2);
  const slowTurn = si >= 0 && t >= E(SLOW0 + 1 + si) + 0.1;
  const end = t >= E(LAST) + 0.2;

  // the day being sung in a chorus line (for the train + the big word)
  const [chorusDay, chorusDayAt] = (() => {
    const lines = karaoke ? KARAOKE : SONG;
    const base = karaoke ? 0 : chorusIdx >= 0 ? CHORUS[chorusIdx] : -1;
    if (base < 0) return [-1, 0];
    const map: [number, number, number][] = [[0, 0, 0], [0, 1, 1], [0, 2, 2], [1, 0, 3], [1, 1, 4], [2, 0, 5], [2, 1, 6]];
    let d: [number, number] = [-1, 0];
    for (const [li, wi, day] of map) {
      const l = lines[base + li];
      const w = timeWords(l);
      if (w[wi] && t >= w[wi].start && t < (li === 2 && wi === 1 ? l.end : w[wi].end + 0.15)) d = [day, w[wi].start];
    }
    return d;
  })();
  const sevenOn = (() => {
    const lines = karaoke ? KARAOKE : SONG;
    const base = karaoke ? 0 : chorusIdx >= 0 ? CHORUS[chorusIdx] : -1;
    return base >= 0 && within(t, lines[base + 3].start, lines[base + 3].end + 0.4);
  })();
  const trainLit = (i: number) => {
    if (vi === i) return 1;
    if (si === i) return 1;
    if (chorusDay === i) return 1;
    if (qi >= 0 && t >= S(QUIZ0 + qi * 2 + 1) && QUIZ[qi].ans === i) return 1;
    if (weekend && (i === 0 || i === 6) && t >= S(WEEKEND0)) return 0.8;
    if (sevenOn || end) return 0.6;
    return 0;
  };

  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
        <Meadow w={W} h={H} t={t} sun={false} />
        {/* the week train on its track */}
        <g>
          <rect x={0} y={TRACK_Y + 16} width={W} height={14} fill="#8d5a3b" {...kst(4)} />
          {Array.from({ length: 24 }).map((_, k) => <rect key={k} x={k * 82 + ((wheel / 6) % 82) - 82} y={TRACK_Y + 8} width={20} height={34} rx={4} fill="#a0673c" />)}
          <g transform={`translate(${200 + Math.sin(t * 2) * 4},${TRACK_Y + 12 - dance(0.3, 6)})`}><Engine t={t} wheel={wheel} /></g>
          {DAYS.map((_, i) => {
            const lit = trainLit(i);
            const hop = lit >= 1 ? 18 + beat * 10 : dance(i * 0.5, 6);
            return (
              <g key={i} transform={`translate(${CAR_X(i)},${TRACK_Y + 12 - hop}) scale(${1 + (lit >= 1 ? 0.12 : 0)})`}>
                <Car i={i} lit={lit} wheel={wheel} />
              </g>
            );
          })}
          {/* couplings */}
          {DAYS.map((_, i) => <rect key={i} x={CAR_X(i) - 118} y={TRACK_Y - 20} width={24} height={10} rx={4} fill={KINK} />)}
        </g>

        {/* chorus: the sung day pops big; "seven days" = 7 dots */}
        {(chorusIdx >= 0 || karaoke) && chorusDay >= 0 && (
          <g key={`cd${chorusDay}`} transform={`translate(${W / 2},${600}) scale(${popIn(t, chorusDayAt, 0.25)})`}>
            <text y={50} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={150} fill={DC(chorusDay)} stroke={KINK} strokeWidth={14} paintOrder="stroke">{DAYS[chorusDay]}</text>
          </g>
        )}
        {(chorusIdx >= 0 || karaoke) && sevenOn && (
          <g transform={`translate(${W / 2},${600})`}>
            {DAYS.map((_, i) => (
              <g key={i} transform={`translate(${(i - 3) * 120},${-Math.abs(Math.sin(t * 5 + i * 0.6)) * 24}) scale(${popIn(t, (karaoke ? KARAOKE : SONG)[(karaoke ? 0 : CHORUS[chorusIdx]) + 3].start + i * 0.08)})`}>
                <Vol><circle r={44} fill={DC(i)} {...kst(6)} /></Vol>
                <text y={16} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={46} fill="#ffffff" stroke={KINK} strokeWidth={5} paintOrder="stroke">{i + 1}</text>
              </g>
            ))}
          </g>
        )}

        {/* verse: the day card */}
        {vi >= 0 && (
          <g transform={`translate(${W / 2},${640}) scale(${EASE_OUT(prog(t, S(VERSE0 + vi * 2) - 0.3, S(VERSE0 + vi * 2)))}) rotate(-2)`}>
            <rect x={-420} y={-240} width={840} height={480} rx={50} fill="#ffffff" {...kst(10)} />
            <rect x={-390} y={-210} width={380} height={420} rx={36} fill={DC(vi)} opacity={0.18} />
            <g transform="translate(-200,-150)">
              <circle r={42} fill={DC(vi)} {...kst(6)} />
              <text y={16} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={46} fill="#ffffff" stroke={KINK} strokeWidth={4} paintOrder="stroke">{vi + 1}</text>
            </g>
            <text x={-200} y={30 + Math.sin(t * 3) * 4} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={DAYS[vi].length > 7 ? 64 : 78} fill={DC(vi)} stroke={KINK} strokeWidth={7} paintOrder="stroke">{DAYS[vi]}</text>
            <text x={-200} y={130} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={36} fill={KINK}>{['1st', '2nd', '3rd', '4th', '5th', '6th', '7th'][vi]} day</text>
            <g transform={`translate(200,0) scale(${popIn(t, S(VERSE0 + vi * 2) + 0.5)})`}><DayPic i={vi} t={t} /></g>
          </g>
        )}

        {/* quiz: known car → ? (or ? → known car) */}
        {qi >= 0 && (() => {
          const Q = QUIZ[qi];
          const L = QUIZ0 + qi * 2;
          const done = t >= S(L + 1) - 0.05;
          const roll = EASE_OUT(prog(t, S(L + 1) - 0.05, S(L + 1) + 0.5));
          const knownX = Q.before ? 225 : -225;
          const ansX = Q.before ? -225 : 225;
          return (
            <g transform={`translate(${W / 2},${700}) scale(${EASE_OUT(prog(t, S(L) - 0.3, S(L) + 0.2))})`}>
              <rect x={-470} y={-250} width={940} height={430} rx={50} fill="#ffffff" {...kst(10)} />
              <text y={-170} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={56} fill={KINK}>{Q.before ? 'WHAT COMES BEFORE?' : 'WHAT COMES AFTER?'}</text>
              <path d="M -60,0 L 50,0 M 20,-30 L 60,0 L 20,30" fill="none" stroke={KINK} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
              <g transform={`translate(${knownX},90) scale(1.45)`}><Car i={Q.known} lit={0} wheel={wheel} /></g>
              <g transform={`translate(${ansX},${90 - (done ? (1 - roll) * 220 : 0)}) scale(1.45)`}>
                {done ? <Car i={Q.ans} lit={1} wheel={wheel} /> : <Car i={Q.ans} lit={0} wheel={0} label="?" q />}
              </g>
            </g>
          );
        })()}

        {/* weekend: the 7-box week — 5 school days + 2 play days */}
        {weekend && (() => {
          const schoolOn = t >= S(WEEKEND0 + 2) - 0.1;
          return (
            <g transform={`translate(${W / 2},${650}) scale(${EASE_OUT(prog(t, S(WEEKEND0) - 0.3, S(WEEKEND0) + 0.2))})`}>
              <rect x={-490} y={-210} width={980} height={400} rx={46} fill="#ffffff" {...kst(10)} />
              {DAYS.map((d, i) => {
                const we = i === 0 || i === 6;
                const x = (i - 3) * 134;
                return (
                  <g key={d} transform={`translate(${x},0) scale(${we && t >= S(WEEKEND0) ? 1.08 + beat * 0.04 : 1})`}>
                    <rect x={-60} y={-150} width={120} height={250} rx={22} fill={we ? '#fff3b0' : '#f1f3f5'} stroke={we && t >= S(WEEKEND0 + 1) ? '#ffca3a' : KINK} strokeWidth={we && t >= S(WEEKEND0 + 1) ? 10 : 5} />
                    <rect x={-60} y={-150} width={120} height={56} rx={22} fill={DC(i)} />
                    <text y={-110} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={22} fill="#ffffff" stroke={KINK} strokeWidth={3} paintOrder="stroke">{d}</text>
                    {schoolOn && (we
                      ? <g transform={`translate(0,0) scale(${popIn(t, S(WEEKEND0 + 2) + 0.6)})`}><Star c="#ffd166" s={0.5} /></g>
                      : <g transform={`translate(0,-10) scale(${0.32 * popIn(t, S(WEEKEND0 + 2) - 0.1 + i * 0.06)})`}><DayPic i={1} t={0} /></g>)}
                    {schoolOn && <text y={78} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={28} fill={we ? '#ff924c' : '#1982c4'}>{we ? 'PLAY' : 'SCHOOL'}</text>}
                  </g>
                );
              })}
              {t >= S(WEEKEND0 + 1) && (
                <g transform={`translate(0,-260) scale(${popIn(t, S(WEEKEND0 + 1) + 0.6)})`}>
                  <rect x={-220} y={-50} width={440} height={96} rx={46} fill="#ffca3a" {...kst(7)} />
                  <text y={20} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={60} fill="#ffffff" stroke={KINK} strokeWidth={6} paintOrder="stroke">WEEKEND!</text>
                </g>
              )}
            </g>
          );
        })()}

        {/* slow pass: one big day at a time */}
        {si >= 0 && (
          <g key={`s${si}`} transform={`translate(${W / 2},${600}) scale(${popIn(t, S(SLOW0 + 1 + si) - 0.2)})`}>
            <text y={60} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={170} fill={DC(si)} stroke={KINK} strokeWidth={16} paintOrder="stroke">{DAYS[si]}</text>
          </g>
        )}

        <Kid spec={MILA_HERO} x={190} y={f} scale={0.6} expr={end ? 'laugh' : karaoke || yourTurn || slowTurn ? 'smile' : singing ? 'happy' : 'happy'} look={[0.4, -0.2]}
          mouth={lipSync(SONG, 'mila', t)}
          armL={end ? 'up' : karaoke ? 'wave' : armSwap ? 'up' : 'wave'}
          armR={end ? 'up' : (vi >= 0 && !yourTurn) || (qi >= 0 && singing) ? 'present' : armSwap ? 'wave' : 'up'}
          hop={singing ? dance(0, 10) : dance(0, 18)} />
        <Critter spec={HOOT_HERO} x={385} y={f} scale={0.42} expr={yourTurn || slowTurn ? 'happy' : 'laugh'} look={[0.4, -0.2]}
          armL={armSwap ? 'up' : 'wave'} armR={armSwap ? 'wave' : 'up'} hop={dance(1.2, 22)} />
        <Kid spec={LEO_HERO} x={1560} y={f} scale={0.55} expr={yourTurn || slowTurn ? 'happy' : 'laugh'} look={[-0.4, -0.2]}
          armL={armSwap ? 'wave' : 'up'} armR={armSwap ? 'up' : 'clap'} hop={dance(0.6, 26)} />
        <Critter spec={BOBO_HERO} x={1770} y={f} scale={0.5} expr="laugh" look={[-0.4, -0.2]}
          armL={beat > 0.5 ? 'clap' : 'up'} armR={beat > 0.5 ? 'clap' : 'up'} hop={dance(1.8, 22)} />
      </ActionStage>

      {chorusIdx >= 0 && <PopText t={t} at={S(CHORUS[chorusIdx])} until={S(CHORUS[chorusIdx]) + 2.0} text="SING WITH ME!" y={470} size={80} color="#ffffff" />}
      {karaoke && <PopText t={t} at={KAR0 - 0.3} until={KAR0 + 2.4} text="NOW YOU SING!" y={470} size={100} color="#ff6fa5" />}
      {yourTurn && <PopText t={t} at={E(VERSE0 + vi * 2 + 1) + 0.1} text="YOUR TURN!" x={1560} y={460} size={76} color="#ffca3a" />}
      {slowIntro && <PopText t={t} at={S(SLOW0)} text="NICE AND SLOW..." y={600} size={110} color="#ffffff" />}
      {slowTurn && <PopText t={t} at={E(SLOW0 + 1 + si) + 0.1} text="YOUR TURN!" y={800} size={80} color="#ffca3a" />}
      {qi >= 0 && <ThinkTimer t={t} from={E(QUIZ0 + qi * 2) + 0.1} to={S(QUIZ0 + qi * 2 + 1) - 0.1} x={1690} y={430} r={84} label="THINK!" />}
      {qi === 3 && t >= S(QUIZ0 + 7) && <PopText t={t} at={S(QUIZ0 + 7) + 0.6} until={S(QUIZ0 + 8) - 0.4} text="THE WEEK STARTS AGAIN!" y={430} size={66} color="#ff595e" />}
      {CHORUS.map((c) => <Confetti key={c} t={t} at={E(c + 3)} y={500} dur={1.4} />)}
      {Array.from({ length: 5 }, (_, k) => <Confetti key={k} t={t} at={S(QUIZ0 + k * 2 + 1) + 0.2} y={560} dur={1.1} />)}
      {end && <PopText t={t} at={E(LAST) + 0.2} until={END + 1.5} text="YOU KNOW THE 7 DAYS!" y={620} size={100} color="#ffca3a" />}
      <SingAlong t={t} lines={karaoke ? KARAOKE : SONG} ball={karaoke ? '#ff6fa5' : '#ff595e'} />
      <SparksIntro t={t} at={0} cast={{ kids: [MILA_HERO, LEO_HERO], buddy: BOBO_HERO }} />
      <StarWipe t={t} at={END + 1.4} dur={0.5} hold={5} color="#3b2a4a" x={W / 2} y={H * 0.45} />
    </>
  );
}
