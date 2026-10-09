// TINY SPARKS · Day 21 · 🎵 Educational Songs #3 — "Alphabet A–Z Song" (LONG 16:9, original song)
// kids-shorts/tiny-sparks/songs/day-021-alphabet-a-z-song. Song = song.json → tools/gen_song.py (chant).
// Form: CHORUS (A–Z grid, each letter pops on its sung word) → 26 phonics verses "A, A, apple!" (big Aa +
// the picture, the A–Z strip at the top fills in) each followed by a silent YOUR TURN bar → CHORUS.
// Lyrics use "A, A, apple" (not "A is for…") because the TTS reads a lone "A is" as "uh is".
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter, type CritterSpec, type Species } from '../../lib/kids/critter';
import { BOBO, HOOT, LEO, MILA } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow, Sun } from '../../lib/kids/sets';
import { Apple, Ball, Confetti, FONT_TOON, KidsStage, PopText, RAINBOW, SingAlong, Star, TitleCard, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { SONG, SONG_BEAT } from './song.gen';

export const compositionConfig = { id: 'KidsSongs021', durationInSeconds: 184.4, fps: 30, width: 1920, height: 1080 };

const W = 1920;
const H = 1080;
const f = FLOOR(H);
const S = (i: number) => SONG[i].start;
const E = (i: number) => SONG[i].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const WORD = ['apple', 'bear', 'cat', 'drum', 'egg', 'fox', 'grapes', 'heart', 'ice cream', 'juice', 'kite', 'lion', 'monkey', 'nest', 'owl', 'pig', 'queen', 'rainbow', 'star', 'tree', 'umbrella', 'volcano', 'watermelon', 'xylophone', 'yo-yo', 'zigzag'];
const CHORUS = [0, 31];
const letterLine = (i: number) => 5 + i;
const LAST = SONG.length - 1;
const col = (i: number) => RAINBOW[i % RAINBOW.length];
const crit = (species: Species, fur: string, fur2: string, dark: string): CritterSpec => ({ id: species, species, fur, fur2, dark });

// one picture per letter, drawn in a ~300px box around (0,0)
const Obj: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  const c = (k: Species, a: string, b: string, d: string) => <Critter spec={crit(k, a, b, d)} x={0} y={150} scale={0.48} expr="happy" shadow={false} />;
  switch (ABC[i]) {
    case 'A': return <g transform="scale(1.5)"><Apple /></g>;
    case 'B': return <Critter spec={BOBO} x={0} y={150} scale={0.48} expr="laugh" shadow={false} />;
    case 'C': return c('cat', '#ffb26b', '#fff1e0', '#d9772b');
    case 'D': return (<g><ellipse cx={0} cy={-60} rx={120} ry={34} fill="#ffffff" {...kst(7)} /><path d="M -120,-60 L -120,60 Q 0,100 120,60 L 120,-60" fill="#ff595e" {...kst(7)} />{[-80, -20, 40, 100].map((x) => <path key={x} d={`M ${x},-50 L ${x + 30},70`} {...kst(5)} />)}<line x1={-60} y1={-150} x2={10} y2={-70} {...kst(10)} /><line x1={70} y1={-150} x2={20} y2={-70} {...kst(10)} /></g>);
    case 'E': return <g><ellipse cx={0} cy={10} rx={95} ry={125} fill="#fff8e7" {...kst(8)} /><ellipse cx={-30} cy={-40} rx={18} ry={28} fill="#ffffff" /></g>;
    case 'F': return c('fox', '#ff8c42', '#ffffff', '#7a3b12');
    case 'G': return (<g>{[[0, -70], [-45, -30], [45, -30], [-70, 15], [0, 10], [70, 15], [-40, 55], [40, 55], [0, 95]].map(([x, y], k) => <circle key={k} cx={x} cy={y} r={38} fill="#7b2cbf" {...kst(6)} />)}<path d="M 0,-110 Q 10,-140 40,-150" fill="none" stroke="#6b4226" strokeWidth={10} strokeLinecap="round" /></g>);
    case 'H': return <g transform={`scale(${2.4 + 0.15 * Math.sin(t * 6)})`}><path d="M 0,50 C -70,0 -60,-50 -28,-50 C -10,-50 0,-36 0,-26 C 0,-36 10,-50 28,-50 C 60,-50 70,0 0,50 Z" fill="#ff595e" {...kst(4)} /></g>;
    case 'I': return (<g><path d="M -70,-20 L 0,150 L 70,-20 Z" fill="#e9c46a" {...kst(7)} /><circle cx={0} cy={-60} r={80} fill="#ff8fab" {...kst(7)} /><circle cx={-20} cy={-130} r={16} fill="#e63946" {...kst(4)} /></g>);
    case 'J': return (<g><path d="M -80,-100 L 80,-100 L 60,120 L -60,120 Z" fill="#ffffff" {...kst(7)} /><path d="M -74,-40 L 74,-40 L 60,120 L -60,120 Z" fill="#ff924c" /><path d="M -80,-100 L 80,-100 L 60,120 L -60,120 Z" fill="none" {...kst(7)} /><line x1={30} y1={-160} x2={10} y2={-60} stroke="#ff595e" strokeWidth={12} strokeLinecap="round" /></g>);
    case 'K': return (<g transform={`rotate(${Math.sin(t * 2) * 8})`}><path d="M 0,-140 L 90,0 L 0,140 L -90,0 Z" fill="#4cc9f0" {...kst(7)} /><path d="M 0,-140 L 0,140 M -90,0 L 90,0" {...kst(5)} /><path d="M 0,140 Q 30,180 0,210 Q -30,240 0,270" fill="none" {...kst(5)} /></g>);
    case 'L': return c('lion', '#ffc857', '#fff1c1', '#d2691e');
    case 'M': return c('monkey', '#a0673c', '#f3d2b3', '#6b4226');
    case 'N': return (<g><path d="M -130,0 Q 0,120 130,0 Z" fill="#a0673c" {...kst(7)} />{[-50, 0, 50].map((x) => <ellipse key={x} cx={x} cy={-20} rx={34} ry={44} fill="#a0c4ff" {...kst(5)} />)}<path d="M -130,0 Q 0,60 130,0" fill="none" stroke="#6b4226" strokeWidth={10} /></g>);
    case 'O': return c('owl', '#9c7a64', '#f5e6d3', '#6d4c41');
    case 'P': return c('pig', '#ffb3c6', '#ffd6e0', '#e5738f');
    case 'Q': return (<g><path d="M -120,60 L -130,-70 L -60,0 L 0,-100 L 60,0 L 130,-70 L 120,60 Z" fill="#ffca3a" {...kst(8)} />{[-60, 0, 60].map((x, k) => <circle key={x} cx={x} cy={30} r={16} fill={['#ff595e', '#4cc9f0', '#8ac926'][k]} {...kst(4)} />)}</g>);
    case 'R': return (<g transform="translate(0,80)">{RAINBOW.slice(0, 5).map((cc, k) => <path key={k} d={`M ${-150 + k * 22},0 A ${150 - k * 22},${150 - k * 22} 0 0,1 ${150 - k * 22},0`} fill="none" stroke={cc} strokeWidth={22} />)}</g>);
    case 'S': return <g transform={`scale(2.6) rotate(${Math.sin(t * 2) * 8})`}><Star /></g>;
    case 'T': return (<g><rect x={-22} y={0} width={44} height={150} fill="#a0673c" {...kst(6)} />{[[-60, -30], [0, -80], [60, -30], [0, 0]].map(([x, y], k) => <circle key={k} cx={x} cy={y} r={80} fill="#55b84a" {...kst(6)} />)}</g>);
    case 'U': return (<g><path d="M -150,0 Q 0,-180 150,0 Q 110,-20 75,0 Q 37,-20 0,0 Q -37,-20 -75,0 Q -110,-20 -150,0 Z" fill="#b8a1e3" {...kst(7)} /><path d="M 0,0 L 0,120 Q 0,150 -30,140" fill="none" {...kst(8)} /></g>);
    case 'V': return (<g><path d="M -150,130 L -40,-90 L 40,-90 L 150,130 Z" fill="#8d5a3b" {...kst(7)} /><path d="M -40,-90 Q 0,-60 40,-90 L 30,-40 L -20,10 L -30,-50 Z" fill="#ff595e" />{[0, 1, 2].map((k) => <circle key={k} cx={(k - 1) * 30} cy={-120 - ((t * 60 + k * 40) % 80)} r={14} fill="#ff924c" opacity={0.8} />)}</g>);
    case 'W': return (<g><path d="M -150,-20 A 150,150 0 0,0 150,-20 Z" fill="#52b788" {...kst(7)} /><path d="M -130,-20 A 130,130 0 0,0 130,-20 Z" fill="#ff595e" />{[-60, -20, 20, 60].map((x, k) => <ellipse key={x} cx={x} cy={30 + (k % 2) * 20} rx={6} ry={10} fill={KINK} />)}</g>);
    case 'X': return (<g>{RAINBOW.slice(0, 6).map((cc, k) => <rect key={k} x={-150 + k * 52} y={-60 + k * 8} width={42} height={160 - k * 16} rx={8} fill={cc} {...kst(5)} />)}<line x1={60} y1={-120} x2={140} y2={-40} {...kst(9)} /><circle cx={140} cy={-40} r={16} fill="#ffffff" {...kst(5)} /></g>);
    case 'Y': return (<g><line x1={0} y1={-160} x2={0} y2={-40 + Math.sin(t * 4) * 30} {...kst(5)} /><g transform={`translate(0,${Math.sin(t * 4) * 30})`}><circle r={70} fill="#ff6fa5" {...kst(7)} /><circle r={18} fill="#ffffff" {...kst(5)} /></g></g>);
    case 'Z': return (<g>{[0, 1, 2].map((k) => <path key={k} d={`M -150,${-110 + k * 90} l 50,-40 l 50,40 l 50,-40 l 50,40 l 50,-40 l 50,40`} fill="none" stroke={['#ff595e', '#ffca3a', '#1982c4'][k]} strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" />)}</g>);
    default: return <Ball />;
  }
};

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

export default function KidsSongs021() {
  const t = useT();
  const cam = camAt(t, CAM);
  const beat = Math.abs(Math.sin((t / SONG_BEAT) * Math.PI));
  const bar = Math.floor(t / (SONG_BEAT * 4));
  let li = -1;
  for (let i = 0; i < 26; i++) {
    const L = letterLine(i);
    if (within(t, S(L) - 0.3, S(L + 1) - 0.3)) li = i;
  }
  const L0 = li >= 0 ? letterLine(li) : -1;
  const yourTurn = li >= 0 && within(t, E(L0) + 0.15, S(L0 + 1) - 0.4);
  const ci = CHORUS.findIndex((c) => within(t, S(c) - 0.4, E(c + 4) + 0.6));
  // chorus: the time each letter is sung (lines 0–3 = 26 words)
  const chorusTimes = ci >= 0 ? [0, 1, 2, 3].flatMap((k) => timeWords(SONG[CHORUS[ci] + k]).map((w) => w.start)) : [];
  // the A–Z strip: how many letters have been sung so far in the verses
  const sungN = li >= 0 ? li + 1 : t >= S(CHORUS[1]) - 0.4 ? 26 : 0;
  const singing = SONG.some((l) => t >= l.start && t < l.end);
  const end = t >= E(LAST) + 0.2;
  const dance = (phase: number, amp = 26) => Math.abs(Math.sin((t / SONG_BEAT) * Math.PI + phase)) * amp;
  const armSwap = bar % 2 === 0;

  return (
    <>
      <KidsStage cam={cam}>
        <Meadow w={W} h={H} t={t} sun={false} />
        {/* A–Z strip across the top (verses) */}
        {ci < 0 && (
          <g>
            {ABC.map((a, i) => {
              const on = i < sungN;
              const cur = i === li;
              return (
                <g key={a} transform={`translate(${135 + i * 66},70) scale(${cur ? 1.35 : 1})`}>
                  <circle r={27} fill={on ? col(i) : '#ffffff'} {...kst(5)} opacity={on ? 1 : 0.8} />
                  <text y={12} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={32} fill={on ? '#ffffff' : '#adb5bd'} stroke={on ? KINK : 'none'} strokeWidth={3} paintOrder="stroke">{a}</text>
                </g>
              );
            })}
          </g>
        )}
        {/* verse: the letter card */}
        {li >= 0 && (
          <g transform={`translate(${W / 2},${460}) scale(${EASE_OUT(prog(t, S(L0) - 0.3, S(L0)))}) rotate(-2)`}>
            <rect x={-420} y={-250} width={840} height={500} rx={50} fill="#ffffff" {...kst(10)} />
            <rect x={-390} y={-220} width={360} height={440} rx={36} fill={col(li)} opacity={0.18} />
            <text x={-210} y={50} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={230} fill={col(li)} stroke={KINK} strokeWidth={9} paintOrder="stroke">{ABC[li]}<tspan fontSize={150}>{ABC[li].toLowerCase()}</tspan></text>
            <text x={-210} y={170} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={56} fill={KINK}>{WORD[li]}</text>
            <g transform="translate(200,10) scale(0.95)"><Obj i={li} t={t} /></g>
          </g>
        )}
        <Kid spec={MILA} x={230} y={f} scale={0.6} expr={end ? 'laugh' : singing ? 'happy' : yourTurn ? 'smile' : 'happy'} look={[0.4, -0.2]}
          mouth={lipSync(SONG, 'mila', t)} armL={end ? 'up' : armSwap ? 'up' : 'wave'} armR={end ? 'up' : li >= 0 && !yourTurn ? 'present' : armSwap ? 'wave' : 'up'}
          hop={singing ? dance(0, 10) : dance(0, 18)} />
        <Critter spec={HOOT} x={450} y={f} scale={0.42} expr={yourTurn ? 'happy' : 'laugh'} look={[0.4, -0.2]}
          armL={armSwap ? 'up' : 'wave'} armR={armSwap ? 'wave' : 'up'} hop={dance(1.2, 22)} />
        <Kid spec={LEO} x={1480} y={f} scale={0.55} expr={yourTurn ? 'happy' : 'laugh'} look={[-0.4, -0.2]}
          armL={armSwap ? 'wave' : 'up'} armR={armSwap ? 'up' : 'clap'} hop={dance(0.6, 26)} />
        <Critter spec={BOBO} x={1700} y={f} scale={0.5} expr="laugh" look={[-0.4, -0.2]}
          armL={beat > 0.5 ? 'clap' : 'up'} armR={beat > 0.5 ? 'clap' : 'up'} hop={dance(1.8, 22)} />
        {/* chorus: the whole alphabet, each letter pops on its sung word */}
        {ci >= 0 &&
          ABC.map((a, i) => {
            const at = chorusTimes[i] ?? 1e9;
            const s = EASE_OUT(prog(t, at - 0.05, at + 0.3));
            if (s <= 0) return null;
            const row = Math.floor(i / 9);
            const inRow = row < 2 ? 9 : 8;
            const x = W / 2 + ((i % 9) - (inRow - 1) / 2) * 140;
            const y = 230 + row * 165 - (t >= S(CHORUS[ci] + 4) ? beat * 14 * (i % 2 ? 1 : 0.4) : 0);
            return (
              <g key={a} transform={`translate(${x},${y}) scale(${s})`}>
                <circle r={62} fill={col(i)} {...kst(7)} />
                <text y={26} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={76} fill="#ffffff" stroke={KINK} strokeWidth={6} paintOrder="stroke">{a}</text>
              </g>
            );
          })}
        {end && <g transform="translate(1720,180) scale(0.8)"><Sun x={0} y={0} t={t} /></g>}
      </KidsStage>
      <TitleCard t={t} from={0} to={1.4} title="A TO Z!" sub="the alphabet song" />
      {ci >= 0 && <PopText t={t} at={S(CHORUS[ci] + 4)} until={E(CHORUS[ci] + 4) + 0.6} text="SING WITH ME!" y={720} size={96} color="#ffca3a" />}
      {yourTurn && <PopText t={t} at={E(L0) + 0.15} text="YOUR TURN!" x={1560} y={250} size={80} color="#ffca3a" />}
      {CHORUS.map((c) => <Confetti key={c} t={t} at={E(c + 3)} y={300} dur={1.4} />)}
      <Confetti t={t} at={E(LAST)} y={300} />
      {end && <PopText t={t} at={E(LAST) + 0.2} text="YOU KNOW YOUR ABC!" y={300} size={110} color="#ffca3a" />}
      <SingAlong t={t} lines={SONG} />
    </>
  );
}
