// TINY SPARKS · Day 28 · 🎵 Educational Songs #4 — "The Colors Song" (LONG 16:9, 5:08, original song)
// kids-shorts/tiny-sparks/songs/day-028-colors-song. Song = song.json → tools/gen_song.py (chant), 94 bpm.
// Form: CHORUS (10 colour balloons bounce; red/blue/yellow light on "Red and blue and yellow too") → 10 colour
// verses "Red, red, red! / Red like an apple!" (big colour card + the thing; the paint-drop strip fills) each
// with a 2-bar YOUR TURN echo → CHORUS → MIXING bridge (red+yellow=orange, blue+yellow=green, red+blue=purple:
// two paint splats swirl together) → CHORUS → COLOUR QUIZ in the song (6 grey pictures + 3 paint choices, a
// THINK bar, the answer colours the picture in) → KARAOKE chorus ("NOW YOU SING!", no vocal) → CHORUS → end.
// Hero outfits: Spark Girl sings, Captain Leo, Professor Hoot and Super Bobo dance.
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter, type CritterSpec } from '../../lib/kids/critter';
import { BOBO, BOBO_HERO, HOOT_HERO, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow, Sun } from '../../lib/kids/sets';
import { AnswerMark, Apple, Confetti, FONT_TOON, KidsStage, PopText, SingAlong, ThinkTimer, TitleCard, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { EASE_INOUT, EASE_OUT, prog, timeWords, type VoLine } from '../../lib/shorts';
import { SONG, SONG_BEAT } from './song.gen';

export const compositionConfig = { id: 'KidsSongs028', durationInSeconds: 308.4, fps: 30, width: 1920, height: 1080 };

const W = 1920;
const H = 1080;
const f = FLOOR(H);
const S = (i: number) => SONG[i].start;
const E = (i: number) => SONG[i].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;
const BAR = SONG_BEAT * 4;
const mixHex = (a: string, b: string, p: number) => {
  const ca = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const cb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + ca.map((v, i) => Math.round(v + (cb[i] - v) * Math.max(0, Math.min(1, p))).toString(16).padStart(2, '0')).join('');
};

// ── the song map (line indices from song.gen.ts)
const CHORUS = [0, 24, 34, 50];
const verseLine = (i: number) => 4 + i * 2; // + 1 = "<colour> like a …"
const MIX0 = 28;
const QUIZ0 = 38;
const KAR0 = S(50) - 8 * BAR; // the karaoke chorus = 8 instrumental bars before the last chorus
const KAR_OFF = KAR0 - S(0);
const KARAOKE: VoLine[] = SONG.slice(0, 4).map((l) => ({
  ...l, speaker: 'you', start: l.start + KAR_OFF, end: l.end + KAR_OFF,
  words: (l.words ?? []).map((w) => ({ ...w, start: w.start + KAR_OFF, end: w.end + KAR_OFF })),
}));
const LAST = SONG.length - 1;

type Col = { name: string; hex: string; ink: string };
const COLS: Col[] = [
  { name: 'RED', hex: '#e63946', ink: '#ffffff' }, { name: 'ORANGE', hex: '#ff8c1a', ink: '#ffffff' }, { name: 'YELLOW', hex: '#ffd60a', ink: KINK },
  { name: 'GREEN', hex: '#52b788', ink: '#ffffff' }, { name: 'BLUE', hex: '#1d72d8', ink: '#ffffff' }, { name: 'PURPLE', hex: '#7b2cbf', ink: '#ffffff' },
  { name: 'PINK', hex: '#ff6fa5', ink: '#ffffff' }, { name: 'BROWN', hex: '#8d5a3b', ink: '#ffffff' }, { name: 'BLACK', hex: '#22223b', ink: '#ffffff' },
  { name: 'WHITE', hex: '#ffffff', ink: KINK },
];
const CI = (n: string) => COLS.findIndex((c) => c.name === n);

const Splat: React.FC<{ c: string; r?: number }> = ({ c, r = 52 }) => (
  <g transform={`scale(${r / 52})`}>
    <path d="M 0,-50 C 26,-52 34,-30 48,-26 C 62,-20 54,6 50,18 C 46,34 30,52 6,48 C -14,58 -40,46 -46,26 C -60,14 -58,-12 -44,-26 C -32,-44 -18,-50 0,-50 Z" fill={c} {...kst(7 * (52 / r))} />
    <ellipse cx={-16} cy={-20} rx={10} ry={14} fill="#ffffff" opacity={0.45} />
  </g>
);
const Balloon: React.FC<{ c: string }> = ({ c }) => (
  <g>
    <path d="M 0,58 Q -8,90 6,120" fill="none" {...kst(4)} />
    <ellipse cx={0} cy={0} rx={50} ry={60} fill={c} {...kst(6)} />
    <path d="M -8,58 L 8,58 L 0,48 Z" fill={c} {...kst(4)} />
    <ellipse cx={-18} cy={-22} rx={10} ry={16} fill="#ffffff" opacity={0.5} />
  </g>
);
const crit = (id: string, species: CritterSpec['species'], fur: string, fur2: string, dark: string): CritterSpec => ({ id, species, fur, fur2, dark });

// ── verse pictures (~300px box around 0,0)
const VerseObj: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  switch (i) {
    case 0: return <g transform="scale(1.7)"><Apple /></g>;
    case 1: return (
      <g transform={`rotate(${-20 + Math.sin(t * 2) * 4})`}>
        {[-24, 0, 24].map((a) => <path key={a} d="M 0,-110 Q -14,-170 0,-200 Q 14,-170 0,-110 Z" fill="#52b788" {...kst(5)} transform={`rotate(${a} 0 -110)`} />)}
        <path d="M -52,-110 Q 0,-130 52,-110 Q 30,40 0,150 Q -30,40 -52,-110 Z" fill="#ff8c1a" {...kst(7)} />
        {[-60, -10, 40].map((y) => <path key={y} d={`M ${-30 + y * 0.12},${y} l 22,4`} {...kst(4)} />)}
      </g>
    );
    case 2: return <Sun x={0} y={0} r={110} t={t} />;
    case 3: return <Critter spec={crit('frog28', 'frog', '#52b788', '#d8f3a0', '#2d6a4f')} x={0} y={150} scale={0.52} expr="laugh" shadow={false} />;
    case 4: return (
      <g>
        <rect x={-170} y={-140} width={340} height={280} rx={40} fill="#4cc9f0" {...kst(7)} />
        {[[-60, -40, 1], [70, 40, 0.8]].map(([x, y, s], k) => (
          <g key={k} transform={`translate(${x + Math.sin(t + k) * 10},${y}) scale(${s})`} fill="#ffffff" {...kst(5)}>
            <path d="M -70,20 Q -80,-14 -50,-20 Q -44,-50 -6,-46 Q 20,-70 50,-44 Q 82,-44 80,-12 Q 96,14 70,22 Z" />
          </g>
        ))}
        <path d={`M 20,-90 q 12,${-10 - Math.sin(t * 7) * 8} 24,0 q 12,${-10 - Math.sin(t * 7) * 8} 24,0`} fill="none" {...kst(5)} />
      </g>
    );
    case 5: return (<g>{[[0, -70], [-45, -30], [45, -30], [-70, 15], [0, 10], [70, 15], [-40, 55], [40, 55], [0, 95]].map(([x, y], k) => <circle key={k} cx={x} cy={y} r={38} fill="#7b2cbf" {...kst(6)} />)}<path d="M 0,-110 Q 10,-140 40,-150" fill="none" stroke="#6b4226" strokeWidth={10} strokeLinecap="round" /><path d="M 10,-125 Q 60,-150 70,-110 Q 40,-100 10,-125 Z" fill="#52b788" {...kst(4)} /></g>);
    case 6: return <Critter spec={crit('pig28', 'pig', '#ffb3c6', '#ffd6e0', '#e5738f')} x={0} y={150} scale={0.5} expr="laugh" shadow={false} />;
    case 7: return <Critter spec={BOBO} x={0} y={150} scale={0.48} expr="laugh" shadow={false} />;
    case 8: return (
      <g>
        <rect x={-170} y={-140} width={340} height={280} rx={40} fill="#22223b" {...kst(7)} />
        <circle cx={60} cy={-30} r={60} fill="#fff3b0" />
        <circle cx={88} cy={-48} r={54} fill="#22223b" />
        {[[-110, -90], [-60, 30], [-120, 80], [20, 90], [120, 70], [-20, -100]].map(([x, y], k) => (
          <circle key={k} cx={x} cy={y} r={6 + (k % 2) * 3} fill="#ffffff" opacity={0.6 + 0.4 * Math.sin(t * 3 + k)} />
        ))}
      </g>
    );
    default: return (
      <g>
        <rect x={-170} y={-140} width={340} height={280} rx={40} fill="#8ecae6" {...kst(7)} />
        <g transform={`translate(0,${10 + Math.sin(t * 1.5) * 8}) scale(1.6)`} fill="#ffffff" {...kst(4)}>
          <path d="M -70,20 Q -80,-14 -50,-20 Q -44,-50 -6,-46 Q 20,-70 50,-44 Q 82,-44 80,-12 Q 96,14 70,22 Z" />
        </g>
        <g transform={`translate(0,${10 + Math.sin(t * 1.5) * 8})`}>
          <circle cx={-22} cy={-4} r={7} fill={KINK} /><circle cx={22} cy={-4} r={7} fill={KINK} />
          <path d="M -12,12 Q 0,22 12,12" fill="none" {...kst(4)} />
        </g>
      </g>
    );
  }
};

// ── quiz pictures, coloured in by p (0 = grey outline picture, 1 = full colour)
type Quiz = { ans: string; choices: string[] };
const QUIZ: Quiz[] = [
  { ans: 'BLUE', choices: ['GREEN', 'BLUE', 'RED'] },
  { ans: 'GREEN', choices: ['GREEN', 'PURPLE', 'YELLOW'] },
  { ans: 'YELLOW', choices: ['BLUE', 'PINK', 'YELLOW'] },
  { ans: 'RED', choices: ['RED', 'BLUE', 'BROWN'] },
  { ans: 'WHITE', choices: ['ORANGE', 'WHITE', 'GREEN'] },
  { ans: 'PINK', choices: ['YELLOW', 'BLACK', 'PINK'] },
];
const G = '#dee2e6';
const QuizObj: React.FC<{ i: number; p: number; t: number }> = ({ i, p, t }) => {
  const m = (c: string) => mixHex(G, c, p);
  switch (i) {
    case 0: return (
      <g>
        <rect x={-180} y={-150} width={360} height={300} rx={40} fill={m('#4cc9f0')} {...kst(7)} />
        <g transform="translate(-40,-20)" fill="#ffffff" {...kst(5)}><path d="M -70,20 Q -80,-14 -50,-20 Q -44,-50 -6,-46 Q 20,-70 50,-44 Q 82,-44 80,-12 Q 96,14 70,22 Z" /></g>
        <g transform="translate(80,70) scale(0.7)" fill="#ffffff" {...kst(5)}><path d="M -70,20 Q -80,-14 -50,-20 Q -44,-50 -6,-46 Q 20,-70 50,-44 Q 82,-44 80,-12 Q 96,14 70,22 Z" /></g>
      </g>
    );
    case 1: return (
      <g>
        <rect x={-180} y={-150} width={360} height={300} rx={40} fill="#ffffff" {...kst(7)} />
        <path d="M -176,40 Q 0,0 176,40 L 176,110 Q 176,146 140,146 L -140,146 Q -176,146 -176,110 Z" fill={m('#52b788')} {...kst(6)} />
        {Array.from({ length: 9 }).map((_, k) => {
          const x = -150 + k * 37;
          return <path key={k} d={`M ${x},40 l 8,-50 l 8,48 l 8,-34 l 6,36`} fill={m('#52b788')} {...kst(4)} />;
        })}
      </g>
    );
    case 2: return (
      <g>
        <g transform={`rotate(${t * 12})`}>
          {Array.from({ length: 12 }).map((_, k) => <rect key={k} x={-12} y={-176} width={24} height={44} rx={12} fill={m('#ffb703')} {...kst(4)} transform={`rotate(${k * 30})`} />)}
        </g>
        <circle r={115} fill={m('#ffd166')} {...kst(8)} />
        <circle cx={-34} cy={-12} r={10} fill={KINK} /><circle cx={34} cy={-12} r={10} fill={KINK} />
        <path d="M -36,26 Q 0,56 36,26" fill="none" {...kst(7)} />
      </g>
    );
    case 3: return (
      <g transform="scale(1.25)">
        <path d="M 0,120 C -110,60 -120,-60 -60,-80 C -30,-90 -10,-80 0,-70 C 10,-80 30,-90 60,-80 C 120,-60 110,60 0,120 Z" fill={m('#e63946')} {...kst(7)} />
        {[[-40, -30], [0, -40], [40, -30], [-50, 20], [-10, 10], [30, 20], [-20, 60], [20, 60]].map(([x, y], k) => <ellipse key={k} cx={x} cy={y} rx={5} ry={8} fill={p > 0.5 ? '#ffe066' : '#ffffff'} />)}
        <path d="M -50,-80 L -20,-110 L 0,-84 L 20,-110 L 50,-80 Q 0,-66 -50,-80 Z" fill={m('#52b788')} {...kst(5)} />
      </g>
    );
    case 4: return (
      <g>
        <rect x={-180} y={-150} width={360} height={300} rx={40} fill="#8ecae6" {...kst(7)} />
        <circle cx={0} cy={80} r={70} fill={m('#ffffff')} {...kst(6)} />
        <circle cx={0} cy={-20} r={50} fill={m('#ffffff')} {...kst(6)} />
        <circle cx={-16} cy={-28} r={6} fill={KINK} /><circle cx={16} cy={-28} r={6} fill={KINK} />
        <path d="M 0,-16 L 26,-10 L 0,-6 Z" fill="#ff924c" {...kst(3)} />
        {[[-130, -100], [-90, -40], [120, -110], [140, 0], [-140, 40], [90, -60]].map(([x, y], k) => (
          <circle key={k} cx={x} cy={y + ((t * 30 + k * 20) % 60)} r={8} fill="#ffffff" {...kst(3)} />
        ))}
      </g>
    );
    default: return <Critter spec={crit('pigq', 'pig', m('#ffb3c6'), m('#ffd6e0'), m('#e5738f'))} x={0} y={160} scale={0.52} expr={p > 0.5 ? 'laugh' : 'happy'} shadow={false} idle={false} />;
  }
};

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

export default function KidsSongs028() {
  const t = useT();
  const cam = camAt(t, CAM);
  const beat = Math.abs(Math.sin((t / SONG_BEAT) * Math.PI));
  const bar = Math.floor(t / BAR);
  const dance = (phase: number, amp = 26) => Math.abs(Math.sin((t / SONG_BEAT) * Math.PI + phase)) * amp;
  const armSwap = bar % 2 === 0;
  const singing = SONG.some((l) => t >= l.start && t < l.end);

  // which part of the song
  let vi = -1;
  for (let i = 0; i < 10; i++) {
    const L = verseLine(i);
    const next = i < 9 ? S(verseLine(i + 1)) : S(CHORUS[1]);
    if (within(t, S(L) - 0.3, next - 0.3)) vi = i;
  }
  const yourTurn = vi >= 0 && within(t, E(verseLine(vi) + 1) + 0.15, (vi < 9 ? S(verseLine(vi + 1)) : S(CHORUS[1])) - 0.4);
  const chorusIdx = CHORUS.findIndex((c) => within(t, S(c) - 0.4, E(c + 3) + 0.4));
  const karaoke = within(t, KAR0 - 0.4, S(50) - 0.4);
  let mi = -1;
  for (let j = 0; j < 3; j++) if (within(t, S(MIX0 + j * 2) - 0.3, (j < 2 ? S(MIX0 + (j + 1) * 2) : S(CHORUS[2])) - 0.3)) mi = j;
  let qi = -1;
  for (let k = 0; k < 6; k++) if (within(t, S(QUIZ0 + k * 2) - 0.3, (k < 5 ? S(QUIZ0 + (k + 1) * 2) : KAR0) - 0.3)) qi = k;
  const end = t >= E(LAST) + 0.2;
  const balloons = chorusIdx >= 0 || karaoke || end;

  // paint-drop strip: colours sung so far (verses), all after the verses
  const sungN = vi >= 0 ? vi + 1 : t >= S(CHORUS[1]) - 0.4 ? 10 : 0;
  // chorus line 3 ("Red and blue and yellow too") lights those three balloons
  const lineLit = (() => {
    const lines = karaoke ? KARAOKE : SONG;
    const base = karaoke ? 0 : chorusIdx >= 0 ? CHORUS[chorusIdx] : -1;
    if (base < 0) return -1;
    const l = lines[base + 2];
    if (!within(t, l.start, l.end + 0.3)) return -1;
    const w = timeWords(l);
    const map: Record<number, number> = { 0: 0, 2: 4, 4: 2 };
    let lit = -1;
    for (const k of [0, 2, 4]) if (w[k] && t >= w[k].start) lit = map[k];
    return lit;
  })();

  return (
    <>
      <KidsStage cam={cam}>
        <Meadow w={W} h={H} t={t} sun={false} />
        {/* paint-drop strip across the top (verses) */}
        {vi >= 0 && (
          <g>
            {COLS.map((c, i) => {
              const on = i < sungN;
              const cur = i === vi;
              return (
                <g key={c.name} transform={`translate(${510 + i * 100},72) scale(${cur ? 1.3 + beat * 0.08 : 1})`} opacity={on ? 1 : 0.55}>
                  <Splat c={on ? c.hex : '#ffffff'} r={36} />
                </g>
              );
            })}
          </g>
        )}
        {/* verse: the colour card */}
        {vi >= 0 && (
          <g transform={`translate(${W / 2},${450}) scale(${EASE_OUT(prog(t, S(verseLine(vi)) - 0.3, S(verseLine(vi))))}) rotate(-2)`}>
            <rect x={-420} y={-250} width={840} height={500} rx={50} fill="#ffffff" {...kst(10)} />
            <g transform={`translate(-210,-30) rotate(${Math.sin(t * 2) * 4})`}><Splat c={COLS[vi].hex} r={150 + beat * 6} /></g>
            <text x={-210} y={-10} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={COLS[vi].name.length > 5 ? 64 : 76} fill={COLS[vi].ink} stroke={KINK} strokeWidth={COLS[vi].ink === KINK ? 0 : 6} paintOrder="stroke">{COLS[vi].name}</text>
            <text x={-210} y={190} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={52} fill={KINK}>{COLS[vi].name.toLowerCase()}</text>
            <g transform="translate(200,10)"><VerseObj i={vi} t={t} /></g>
          </g>
        )}
        {/* mixing bridge: two splats swirl together into a new colour */}
        {mi >= 0 && (() => {
          const pairs: [string, string, string][] = [['RED', 'YELLOW', 'ORANGE'], ['BLUE', 'YELLOW', 'GREEN'], ['RED', 'BLUE', 'PURPLE']];
          const [a, b, r] = pairs[mi];
          const L = MIX0 + mi * 2;
          const w = timeWords(SONG[L]);
          const mixFrom = w.find((x) => x.w.toLowerCase().startsWith('mix'))?.start ?? S(L) + 1.5;
          const q = EASE_INOUT(prog(t, mixFrom, S(L + 1)));
          const res = EASE_OUT(prog(t, S(L + 1) - 0.1, S(L + 1) + 0.5));
          const ang = q * Math.PI * 3;
          const d = 240 * (1 - q);
          const appear = EASE_OUT(prog(t, S(L) - 0.3, S(L) + 0.2));
          return (
            <g transform={`translate(${W / 2},${430})`}>
              <g transform={`scale(${appear})`}>
                <rect x={-420} y={-250} width={840} height={500} rx={50} fill="#ffffff" {...kst(10)} />
                {res < 1 && (
                  <g opacity={1 - res}>
                    <g transform={`translate(${-Math.cos(ang) * d},${Math.sin(ang) * d * 0.4 - 30})`}><Splat c={COLS[CI(a)].hex} r={110} /></g>
                    <g transform={`translate(${Math.cos(ang) * d},${-Math.sin(ang) * d * 0.4 - 30})`}><Splat c={COLS[CI(b)].hex} r={110} /></g>
                    {q <= 0 && <text y={10} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={110} fill={KINK}>+</text>}
                  </g>
                )}
                {res > 0 && <g transform={`translate(0,-40) scale(${res}) rotate(${Math.sin(t * 2) * 5})`}><Splat c={COLS[CI(r)].hex} r={150} /></g>}
                <text y={200} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={58} fill={KINK}>
                  <tspan fill={COLS[CI(a)].hex} stroke={KINK} strokeWidth={a === 'YELLOW' ? 4 : 0} paintOrder="stroke">{a}</tspan> + <tspan fill={COLS[CI(b)].hex} stroke={KINK} strokeWidth={b === 'YELLOW' ? 4 : 0} paintOrder="stroke">{b}</tspan>
                  {res > 0 && <tspan> = </tspan>}
                  {res > 0 && <tspan fill={COLS[CI(r)].hex}>{r}</tspan>}
                </text>
              </g>
            </g>
          );
        })()}
        {/* quiz: a grey picture + 3 paint choices; the answer colours it in */}
        {qi >= 0 && (() => {
          const L = QUIZ0 + qi * 2;
          const Q = QUIZ[qi];
          const p = EASE_INOUT(prog(t, S(L + 1) - 0.1, S(L + 1) + 0.7));
          return (
            <g transform={`translate(${W / 2},${440}) scale(${EASE_OUT(prog(t, S(L) - 0.3, S(L) + 0.2))})`}>
              <rect x={-440} y={-260} width={880} height={520} rx={50} fill="#ffffff" {...kst(10)} />
              <g transform="translate(-170,0)"><QuizObj i={qi} p={p} t={t} /></g>
              {Q.choices.map((c, k) => {
                const ok = c === Q.ans;
                const y = -160 + k * 160;
                const done = t >= S(L + 1);
                return (
                  <g key={c} transform={`translate(240,${y}) scale(${done && ok ? 1.15 + beat * 0.05 : 1})`} opacity={done && !ok ? 0.35 : 1}>
                    <g transform="translate(-80,0)"><Splat c={COLS[CI(c)].hex} r={54} /></g>
                    <text x={-10} y={18} fontFamily={FONT_TOON} fontWeight={700} fontSize={50} fill={KINK}>{c.toLowerCase()}</text>
                  </g>
                );
              })}
              {t >= S(L + 1) && <AnswerMark t={t} at={S(L + 1) + 0.1} ok x={150} y={-160 + Q.choices.indexOf(Q.ans) * 160 - 50} size={0.42} />}
            </g>
          );
        })()}
        {/* chorus / karaoke / end: ten colour balloons bounce on the beat */}
        {balloons &&
          COLS.map((c, i) => {
            const at = (chorusIdx >= 0 ? S(CHORUS[chorusIdx]) : karaoke ? KAR0 : E(LAST)) + i * 0.08 - 0.3;
            const s = EASE_OUT(prog(t, at, at + 0.4)) * (lineLit === i ? 1.25 : 1);
            const x = W / 2 + (i - 4.5) * 150;
            const y = 300 + Math.abs(i - 4.5) * 18 - Math.abs(Math.sin((t / SONG_BEAT) * Math.PI + i * 0.6)) * 26;
            return (
              <g key={c.name} transform={`translate(${x},${y}) scale(${s}) rotate(${Math.sin(t * 2 + i) * 5})`}>
                <Balloon c={c.hex} />
              </g>
            );
          })}
        <Kid spec={MILA_HERO} x={230} y={f} scale={0.6} expr={end ? 'laugh' : karaoke ? 'smile' : singing ? 'happy' : yourTurn ? 'smile' : 'happy'} look={[0.4, -0.2]}
          mouth={lipSync(SONG, 'mila', t)}
          armL={end ? 'up' : karaoke ? 'wave' : armSwap ? 'up' : 'wave'}
          armR={end ? 'up' : (vi >= 0 && !yourTurn) || karaoke || (qi >= 0 && singing) ? 'present' : armSwap ? 'wave' : 'up'}
          hop={singing ? dance(0, 10) : dance(0, 18)} />
        <Critter spec={HOOT_HERO} x={450} y={f} scale={0.42} expr={yourTurn ? 'happy' : 'laugh'} look={[0.4, -0.2]}
          armL={armSwap ? 'up' : 'wave'} armR={armSwap ? 'wave' : 'up'} hop={dance(1.2, 22)} />
        <Kid spec={LEO_HERO} x={1480} y={f} scale={0.55} expr={yourTurn ? 'happy' : 'laugh'} look={[-0.4, -0.2]}
          armL={armSwap ? 'wave' : 'up'} armR={armSwap ? 'up' : 'clap'} hop={dance(0.6, 26)} />
        <Critter spec={BOBO_HERO} x={1700} y={f} scale={0.5} expr="laugh" look={[-0.4, -0.2]}
          armL={beat > 0.5 ? 'clap' : 'up'} armR={beat > 0.5 ? 'clap' : 'up'} hop={dance(1.8, 22)} />
        {end && <g transform="translate(1720,180) scale(0.8)"><Sun x={0} y={0} t={t} /></g>}
      </KidsStage>
      <TitleCard t={t} from={0} to={1.4} title="COLORS!" sub="the colors song" />
      {chorusIdx >= 0 && <PopText t={t} at={S(CHORUS[chorusIdx] + 3)} until={E(CHORUS[chorusIdx] + 3) + 0.4} text="SING WITH ME!" y={560} size={90} color="#ffca3a" />}
      {karaoke && <PopText t={t} at={KAR0 - 0.4} text="NOW YOU SING!" y={560} size={110} color="#ff6fa5" />}
      {yourTurn && vi >= 0 && (
        <>
          <PopText t={t} at={E(verseLine(vi) + 1) + 0.15} text="YOUR TURN!" x={1560} y={250} size={80} color="#ffca3a" />
        </>
      )}
      {qi >= 0 && (
        <ThinkTimer t={t} from={E(QUIZ0 + qi * 2) + 0.1} to={S(QUIZ0 + qi * 2 + 1) - 0.1} x={1700} y={190} r={100} label="THINK!" />
      )}
      {mi >= 0 && <Confetti t={t} at={S(MIX0 + mi * 2 + 1)} y={400} dur={1.2} />}
      {CHORUS.map((c) => <Confetti key={c} t={t} at={E(c + 3)} y={300} dur={1.4} />)}
      <Confetti t={t} at={E(LAST)} y={300} />
      {end && <PopText t={t} at={E(LAST) + 0.2} text="YOU KNOW YOUR COLORS!" y={560} size={100} color="#ffca3a" />}
      <SingAlong t={t} lines={karaoke ? KARAOKE : SONG} ball={karaoke ? '#ff6fa5' : '#ff595e'} />
    </>
  );
}
