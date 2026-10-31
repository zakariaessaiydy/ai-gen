// TINY SPARKS · Day 35 · 🎵 Educational Songs #5 — "The Shapes Song" (LONG 16:9, 5:02, original song)
// kids-shorts/tiny-sparks/songs/day-035-shapes-song. Song = song.json → tools/gen_song.py (chant), 96 bpm.
// Form: CHORUS (10 shapes bounce like balloons; circle/square/triangle light on "Circle, square, and triangle")
// → 10 shape verses "Circle, circle! / Round like the sun!" (big shape card + the thing; the shape strip fills)
// each with a 2-bar YOUR TURN echo → CHORUS → BUILD bridge (triangle on a square = a house · circle on a triangle
// = ice cream · three circles = a snowman: the shapes fly in and stack, then the details pop on) → CHORUS →
// SHAPE QUIZ in the song (clock, pizza slice, window, door, egg, kite + 3 shape choices, a THINK bar, the
// answer's outline traces the object) → KARAOKE chorus ("NOW YOU SING!") → CHORUS → end. 3D kit (<Vol>).
// Hero outfits: Spark Girl sings, Captain Leo, Professor Hoot and Super Bobo dance.
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO_HERO, HOOT_HERO, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow, Sun } from '../../lib/kids/sets';
import { AnswerMark, Confetti, FONT_TOON, KidsStage, PopText, SingAlong, Star, ThinkTimer, TitleCard, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { EASE_INOUT, EASE_OUT, prog, timeWords, type VoLine } from '../../lib/shorts';
import { SONG, SONG_BEAT } from './song.gen';

export const compositionConfig = { id: 'KidsSongs035', durationInSeconds: 302.0, fps: 30, width: 1920, height: 1080 };

const W = 1920;
const H = 1080;
const f = FLOOR(H);
const S = (i: number) => SONG[i].start;
const E = (i: number) => SONG[i].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;
const BAR = SONG_BEAT * 4;

// ── the song map (line indices from song.gen.ts)
const CHORUS = [0, 24, 34, 50];
const verseLine = (i: number) => 4 + i * 2; // + 1 = "Round like the sun!"
const BUILD0 = 28;
const QUIZ0 = 38;
const KAR0 = S(50) - 8 * BAR; // the karaoke chorus = 8 instrumental bars before the last chorus
const KAR_OFF = KAR0 - S(0);
const KARAOKE: VoLine[] = SONG.slice(0, 4).map((l) => ({
  ...l, speaker: 'you', start: l.start + KAR_OFF, end: l.end + KAR_OFF,
  words: (l.words ?? []).map((w) => ({ ...w, start: w.start + KAR_OFF, end: w.end + KAR_OFF })),
}));
const LAST = SONG.length - 1;

// ── the shapes
type Kind = 'circle' | 'square' | 'triangle' | 'rectangle' | 'oval' | 'star' | 'heart' | 'diamond' | 'crescent' | 'hexagon';
const SHAPES: { kind: Kind; name: string; hex: string }[] = [
  { kind: 'circle', name: 'CIRCLE', hex: '#ff595e' },
  { kind: 'square', name: 'SQUARE', hex: '#1d72d8' },
  { kind: 'triangle', name: 'TRIANGLE', hex: '#52b788' },
  { kind: 'rectangle', name: 'RECTANGLE', hex: '#9d4edd' },
  { kind: 'oval', name: 'OVAL', hex: '#ff924c' },
  { kind: 'star', name: 'STAR', hex: '#ffd60a' },
  { kind: 'heart', name: 'HEART', hex: '#ff6fa5' },
  { kind: 'diamond', name: 'DIAMOND', hex: '#4cc9f0' },
  { kind: 'crescent', name: 'CRESCENT', hex: '#fde68a' },
  { kind: 'hexagon', name: 'HEXAGON', hex: '#f4a261' },
];
const KI = (k: Kind) => SHAPES.findIndex((s) => s.kind === k);

// the outline path of a shape, about 2r across (origin = centre)
const shapeD = (kind: Kind, r: number): string => {
  const pts = (p: [number, number][]) => 'M ' + p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L ') + ' Z';
  switch (kind) {
    case 'circle': return `M ${-r},0 A ${r},${r} 0 1 0 ${r},0 A ${r},${r} 0 1 0 ${-r},0 Z`;
    case 'square': return pts([[-r * 0.9, -r * 0.9], [r * 0.9, -r * 0.9], [r * 0.9, r * 0.9], [-r * 0.9, r * 0.9]]);
    case 'triangle': return pts([[0, -r * 1.05], [r * 1.05, r * 0.78], [-r * 1.05, r * 0.78]]);
    case 'rectangle': return pts([[-r * 0.62, -r], [r * 0.62, -r], [r * 0.62, r], [-r * 0.62, r]]);
    case 'oval': return `M ${-r * 0.74},0 A ${r * 0.74},${r} 0 1 0 ${r * 0.74},0 A ${r * 0.74},${r} 0 1 0 ${-r * 0.74},0 Z`;
    case 'star': {
      const p: [number, number][] = [];
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const rr = i % 2 ? r * 0.46 : r * 1.05;
        p.push([Math.cos(a) * rr, Math.sin(a) * rr + r * 0.08]);
      }
      return pts(p);
    }
    case 'heart': return `M 0,${r * 0.95} C ${-r * 1.45},${r * 0.05} ${-r * 1.15},${-r * 1.05} ${-r * 0.52},${-r * 1.0} C ${-r * 0.2},${-r * 0.98} 0,${-r * 0.7} 0,${-r * 0.5} C 0,${-r * 0.7} ${r * 0.2},${-r * 0.98} ${r * 0.52},${-r * 1.0} C ${r * 1.15},${-r * 1.05} ${r * 1.45},${r * 0.05} 0,${r * 0.95} Z`;
    case 'diamond': return pts([[0, -r * 1.12], [r * 0.78, 0], [0, r * 1.12], [-r * 0.78, 0]]);
    case 'crescent': {
      // outer circle (r) minus an inner circle (0.85r) pushed right → a moon crescent opening to the right
      const d = r * 0.45;
      const r2 = r * 0.85;
      const x = (r * r - r2 * r2 + d * d) / (2 * d);
      const y = Math.sqrt(r * r - x * x);
      return `M ${x.toFixed(1)},${(-y).toFixed(1)} A ${r},${r} 0 1 0 ${x.toFixed(1)},${y.toFixed(1)} A ${r2},${r2} 0 1 1 ${x.toFixed(1)},${(-y).toFixed(1)} Z`;
    }
    default: {
      const p: [number, number][] = [];
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 3;
        p.push([Math.cos(a) * r, Math.sin(a) * r]);
      }
      return pts(p);
    }
  }
};
// a solid, 3D-shaded shape with a little shine
const Shape: React.FC<{ kind: Kind; r: number; c?: string; face?: boolean; t?: number }> = ({ kind, r, c, face = false, t = 0 }) => {
  const hex = c ?? SHAPES[KI(kind)].hex;
  const blink = face && (t * 30 + KI(kind) * 17) % 110 < 4;
  return (
    <g>
      <Vol>
        <path d={shapeD(kind, r)} fill={hex} {...kst(Math.max(5, r * 0.08))} />
      </Vol>
      {face && (
        <g transform={`translate(${kind === 'crescent' ? -r * 0.45 : 0},${kind === 'triangle' ? r * 0.25 : kind === 'heart' ? -r * 0.15 : 0}) scale(${r / 100})`}>
          {blink ? (
            <g fill="none" {...kst(6)}><path d="M -38,-6 L -18,-6" /><path d="M 18,-6 L 38,-6" /></g>
          ) : (
            <g>
              <ellipse cx={-28} cy={-6} rx={10} ry={13} fill={KINK} />
              <ellipse cx={28} cy={-6} rx={10} ry={13} fill={KINK} />
              <circle cx={-31} cy={-11} r={4} fill="#ffffff" />
              <circle cx={25} cy={-11} r={4} fill="#ffffff" />
            </g>
          )}
          <path d="M -18,16 Q 0,32 18,16" fill="none" {...kst(6)} />
          <ellipse cx={-50} cy={14} rx={12} ry={7} fill="#ff8fab" opacity={0.65} />
          <ellipse cx={50} cy={14} rx={12} ry={7} fill="#ff8fab" opacity={0.65} />
        </g>
      )}
    </g>
  );
};
// the dashed outline of a shape (traced on in the quiz answer)
const Outline: React.FC<{ kind: Kind; r: number; p: number; c: string }> = ({ kind, r, p, c }) => (
  <path d={shapeD(kind, r)} fill="none" stroke={c} strokeWidth={12} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} />
);

// ── verse pictures (~300 px box around 0,0)
const VerseObj: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  switch (SHAPES[i].kind) {
    case 'circle': return <Sun x={0} y={0} r={110} t={t} />;
    case 'square': return (
      <g>
        <Vol><rect x={-140} y={-140} width={280} height={280} rx={16} fill="#c0874f" {...kst(8)} /></Vol>
        <rect x={-118} y={-118} width={236} height={236} rx={8} fill="#8fd3ff" {...kst(5)} />
        <g transform={`translate(${-40 + Math.sin(t * 0.6) * 20},-40)`} fill="#ffffff" {...kst(4)}><path d="M -50,14 Q -56,-10 -36,-14 Q -30,-36 -4,-32 Q 14,-48 36,-30 Q 58,-30 56,-8 Q 66,10 48,16 Z" /></g>
        <rect x={-10} y={-118} width={20} height={236} fill="#c0874f" {...kst(4)} />
        <rect x={-118} y={-10} width={236} height={20} fill="#c0874f" {...kst(4)} />
      </g>
    );
    case 'triangle': return (
      <g transform="translate(0,20)">
        <Vol><path d="M 0,-150 L 170,120 L -170,120 Z" fill="#52b788" {...kst(8)} /></Vol>
        <path d="M 0,-20 L 60,120 L -60,120 Z" fill="#2d6a4f" {...kst(6)} />
        <path d="M 0,-150 L 0,-190 L 50,-175 L 0,-160" fill="#ff595e" {...kst(5)} />
      </g>
    );
    case 'rectangle': return (
      <g>
        <Vol><rect x={-95} y={-160} width={190} height={320} rx={12} fill="#9d4edd" {...kst(8)} /></Vol>
        <rect x={-70} y={-135} width={140} height={110} rx={10} fill="none" stroke="#ffffff" strokeWidth={6} opacity={0.5} />
        <rect x={-70} y={-5} width={140} height={140} rx={10} fill="none" stroke="#ffffff" strokeWidth={6} opacity={0.5} />
        <Vol><circle cx={60} cy={10} r={14} fill="#ffd166" {...kst(4)} /></Vol>
      </g>
    );
    case 'oval': return (
      <g transform={`rotate(${Math.sin(t * 2) * 5})`}>
        <Vol><ellipse rx={100} ry={136} fill="#fff8e7" {...kst(8)} /></Vol>
        {[[-30, -40], [35, 10], [-10, 60]].map(([x, y], k) => <circle key={k} cx={x} cy={y} r={9} fill="#e9c46a" opacity={0.7} />)}
      </g>
    );
    case 'star': return (
      <g>
        <Vol><rect x={-160} y={-150} width={320} height={300} rx={36} fill="#22223b" {...kst(8)} /></Vol>
        {[[-110, -100], [110, -90], [-120, 100], [120, 110], [-40, 120]].map(([x, y], k) => (
          <circle key={k} cx={x} cy={y} r={5} fill="#ffffff" opacity={0.5 + 0.5 * Math.sin(t * 3 + k)} />
        ))}
        <g transform={`scale(${2.6 + 0.15 * Math.sin(t * 4)})`}><Star /></g>
      </g>
    );
    case 'heart': return (
      <g transform={`scale(${1 + 0.06 * Math.sin(t * 6)})`}>
        <Shape kind="heart" r={130} c="#ff6fa5" />
        <path d="M -60,-50 Q -40,-70 -20,-60" fill="none" stroke="#ffffff" strokeWidth={10} strokeLinecap="round" opacity={0.7} />
      </g>
    );
    case 'diamond': return (
      <g transform={`rotate(${Math.sin(t * 2) * 8})`}>
        <Vol><path d="M 0,-160 L 110,0 L 0,160 L -110,0 Z" fill="#4cc9f0" {...kst(8)} /></Vol>
        <path d="M 0,-160 L 0,160 M -110,0 L 110,0" fill="none" {...kst(5)} />
        <path d={`M 0,160 Q 40,200 ${10 + Math.sin(t * 3) * 10},240 Q -30,280 0,320`} fill="none" {...kst(5)} transform="scale(0.8) translate(0,-30)" />
        {[0, 1, 2].map((k) => <path key={k} d="M -12,0 L 0,-10 L 12,0 L 0,10 Z" transform={`translate(${Math.sin(t * 3 + k) * 8},${215 + k * 28}) scale(0.9)`} fill={['#ff595e', '#ffca3a', '#8ac926'][k]} {...kst(3)} />)}
      </g>
    );
    case 'crescent': return (
      <g>
        <Vol><rect x={-160} y={-150} width={320} height={300} rx={36} fill="#1d2156" {...kst(8)} /></Vol>
        {[[-110, -100], [110, -110], [-120, 100], [110, 100], [60, -40]].map(([x, y], k) => (
          <circle key={k} cx={x} cy={y} r={5} fill="#ffffff" opacity={0.5 + 0.5 * Math.sin(t * 3 + k)} />
        ))}
        <g transform="translate(-10,0)"><Shape kind="crescent" r={110} c="#fde68a" /></g>
      </g>
    );
    default: return (
      <g>
        {[[0, 0], [-104, -60], [104, -60], [-104, 60], [104, 60], [0, -120], [0, 120]].map(([x, y], k) => (
          <g key={k} transform={`translate(${x * 0.95},${y * 0.95})`}><Shape kind="hexagon" r={66} c={k ? '#ffca3a' : '#f4a261'} /></g>
        ))}
        <path d={`M 20,60 Q 26,${110 + Math.sin(t * 2) * 10} 20,${130 + Math.sin(t * 2) * 12}`} fill="none" stroke="#f4a261" strokeWidth={18} strokeLinecap="round" />
      </g>
    );
  }
};

// ── quiz pictures (always in colour; the answer's outline traces them)
type Quiz = { ans: Kind; choices: Kind[]; obj: string };
const QUIZ: Quiz[] = [
  { obj: 'clock', ans: 'circle', choices: ['square', 'circle', 'triangle'] },
  { obj: 'pizza', ans: 'triangle', choices: ['triangle', 'oval', 'square'] },
  { obj: 'window', ans: 'square', choices: ['circle', 'heart', 'square'] },
  { obj: 'door', ans: 'rectangle', choices: ['rectangle', 'star', 'circle'] },
  { obj: 'egg', ans: 'oval', choices: ['oval', 'diamond', 'heart'] },
  { obj: 'kite', ans: 'diamond', choices: ['hexagon', 'diamond', 'crescent'] },
];
const QuizObj: React.FC<{ obj: string; t: number }> = ({ obj, t }) => {
  switch (obj) {
    case 'clock': return (
      <g>
        <Vol><circle r={140} fill="#ff595e" {...kst(8)} /></Vol>
        <circle r={112} fill="#ffffff" {...kst(5)} />
        {Array.from({ length: 12 }).map((_, k) => <rect key={k} x={-4} y={-104} width={8} height={18} rx={4} fill={KINK} transform={`rotate(${k * 30})`} />)}
        <rect x={-6} y={-70} width={12} height={76} rx={6} fill={KINK} transform={`rotate(${t * 6})`} />
        <rect x={-5} y={-50} width={10} height={56} rx={5} fill="#ff595e" transform={`rotate(${t * 40})`} />
        <circle r={10} fill={KINK} />
      </g>
    );
    case 'pizza': return (
      <g transform="translate(0,10)">
        <Vol><path d="M 0,150 L -140,-120 Q 0,-170 140,-120 Z" fill="#ffca3a" {...kst(8)} /></Vol>
        <path d="M -140,-120 Q 0,-170 140,-120 L 128,-98 Q 0,-142 -128,-98 Z" fill="#e9a35b" {...kst(5)} />
        {[[-40, -60], [40, -50], [0, 10], [-15, 70], [30, -100]].map(([x, y], k) => <Vol key={k}><circle cx={x} cy={y} r={20} fill="#e63946" {...kst(4)} /></Vol>)}
      </g>
    );
    case 'window': return (
      <g>
        <Vol><rect x={-140} y={-140} width={280} height={280} rx={14} fill="#c0874f" {...kst(8)} /></Vol>
        <rect x={-118} y={-118} width={236} height={236} rx={8} fill="#8fd3ff" {...kst(5)} />
        <rect x={-10} y={-118} width={20} height={236} fill="#c0874f" {...kst(4)} />
        <rect x={-118} y={-10} width={236} height={20} fill="#c0874f" {...kst(4)} />
        <circle cx={60} cy={-60} r={26} fill="#ffd166" />
      </g>
    );
    case 'door': return (
      <g>
        <Vol><rect x={-95} y={-160} width={190} height={320} rx={10} fill="#a0673c" {...kst(8)} /></Vol>
        <rect x={-68} y={-130} width={136} height={110} rx={10} fill="none" stroke="#ffffff" strokeWidth={6} opacity={0.45} />
        <rect x={-68} y={0} width={136} height={130} rx={10} fill="none" stroke="#ffffff" strokeWidth={6} opacity={0.45} />
        <Vol><circle cx={60} cy={10} r={14} fill="#ffd166" {...kst(4)} /></Vol>
      </g>
    );
    case 'egg': return (
      <g transform={`rotate(${Math.sin(t * 3) * 6})`}>
        <Vol><ellipse rx={104} ry={140} fill="#fff8e7" {...kst(8)} /></Vol>
        <path d="M -100,0 l 30,-24 l 30,24 l 30,-24 l 30,24 l 30,-24 l 30,24" fill="none" stroke="#ff6fa5" strokeWidth={10} strokeLinejoin="round" />
        {[[-40, -60], [30, -80], [-30, 70], [40, 60]].map(([x, y], k) => <circle key={k} cx={x} cy={y} r={10} fill={['#4cc9f0', '#ffca3a', '#8ac926', '#ff924c'][k]} />)}
      </g>
    );
    default: return (
      <g transform={`rotate(${Math.sin(t * 2) * 8})`}>
        <Vol><path d="M 0,-150 L 105,0 L 0,150 L -105,0 Z" fill="#ff924c" {...kst(8)} /></Vol>
        <path d="M 0,-150 L 0,150 M -105,0 L 105,0" fill="none" {...kst(5)} />
        <path d="M 0,-150 L 105,0 L 0,0 Z" fill="#ffca3a" />
        <path d="M 0,0 L -105,0 L 0,150 Z" fill="#ffca3a" />
        <path d="M 0,-150 L 105,0 L 0,150 L -105,0 Z" fill="none" {...kst(8)} />
        <path d={`M 0,150 Q 30,190 ${Math.sin(t * 3) * 14},230 Q -30,270 0,300`} fill="none" {...kst(5)} />
      </g>
    );
  }
};

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

export default function KidsSongs035() {
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
  let bi = -1;
  for (let j = 0; j < 3; j++) if (within(t, S(BUILD0 + j * 2) - 0.3, (j < 2 ? S(BUILD0 + (j + 1) * 2) : S(CHORUS[2])) - 0.3)) bi = j;
  let qi = -1;
  for (let k = 0; k < 6; k++) if (within(t, S(QUIZ0 + k * 2) - 0.3, (k < 5 ? S(QUIZ0 + (k + 1) * 2) : KAR0) - 0.3)) qi = k;
  const end = t >= E(LAST) + 0.2;
  const floaters = chorusIdx >= 0 || karaoke || end;

  const sungN = vi >= 0 ? vi + 1 : t >= S(CHORUS[1]) - 0.4 ? 10 : 0;
  // chorus line 3 ("Circle, square, and triangle") lights those three shapes
  const lineLit = (() => {
    const lines = karaoke ? KARAOKE : SONG;
    const base = karaoke ? 0 : chorusIdx >= 0 ? CHORUS[chorusIdx] : -1;
    if (base < 0) return -1;
    const l = lines[base + 2];
    if (!within(t, l.start, l.end + 0.3)) return -1;
    const w = timeWords(l);
    const map: Record<number, number> = { 0: 0, 1: 1, 3: 2 };
    let lit = -1;
    for (const k of [0, 1, 3]) if (w[k] && t >= w[k].start) lit = map[k];
    return lit;
  })();

  return (
    <>
      <KidsStage cam={cam}>
        <Meadow w={W} h={H} t={t} sun={false} />
        {/* the shape strip across the top (verses) */}
        {vi >= 0 && (
          <g>
            {SHAPES.map((s, i) => {
              const on = i < sungN;
              const cur = i === vi;
              return (
                <g key={s.kind} transform={`translate(${510 + i * 100},74) scale(${cur ? 1.3 + beat * 0.08 : 1})`} opacity={on ? 1 : 0.5}>
                  <Shape kind={s.kind} r={34} c={on ? s.hex : '#ffffff'} />
                </g>
              );
            })}
          </g>
        )}
        {/* verse: the shape card */}
        {vi >= 0 && (
          <g transform={`translate(${W / 2},${455}) scale(${EASE_OUT(prog(t, S(verseLine(vi)) - 0.3, S(verseLine(vi))))}) rotate(-2)`}>
            <rect x={-420} y={-250} width={840} height={500} rx={50} fill="#ffffff" {...kst(10)} />
            <rect x={-390} y={-220} width={360} height={440} rx={36} fill={SHAPES[vi].hex} opacity={0.16} />
            <g transform={`translate(-210,-40) rotate(${Math.sin(t * 2) * 4}) scale(${1 + beat * 0.04})`}><Shape kind={SHAPES[vi].kind} r={120} face t={t} /></g>
            <text x={-210} y={190} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={SHAPES[vi].name.length > 7 ? 54 : 64} fill={SHAPES[vi].hex} stroke={KINK} strokeWidth={6} paintOrder="stroke">{SHAPES[vi].name}</text>
            <g transform="translate(200,10)"><VerseObj i={vi} t={t} /></g>
          </g>
        )}
        {/* build bridge: shapes fly in and stack into a picture */}
        {bi >= 0 && (() => {
          const L = BUILD0 + bi * 2;
          const w = timeWords(SONG[L]);
          const appear = EASE_OUT(prog(t, S(L) - 0.3, S(L) + 0.2));
          const done = EASE_OUT(prog(t, S(L + 1) - 0.1, S(L + 1) + 0.5));
          const fly = (k: number, fromX: number) => {
            const at = w[Math.min(w.length - 1, [[4, 1], [4, 1], [2, 3, 4]][bi][k] ?? 0)]?.start ?? S(L);
            const p = EASE_INOUT(prog(t, at - 0.1, at + 0.7));
            return { dx: fromX * (1 - p), dy: -Math.sin(p * Math.PI) * 60, s: (0.6 + 0.4 * p) * (p > 0 ? 1 : 0) };
          };
          const parts: { kind: Kind; c: string; x: number; y: number; r: number; rot?: number; from: number }[] =
            bi === 0
              ? [{ kind: 'square', c: '#ffca3a', x: 0, y: 60, r: 120, from: 290 }, { kind: 'triangle', c: '#ff595e', x: 0, y: -125, r: 132, from: -290 }]
              : bi === 1
                ? [{ kind: 'triangle', c: '#e9a35b', x: 0, y: 70, r: 110, rot: 180, from: 290 }, { kind: 'circle', c: '#ff6fa5', x: 0, y: -80, r: 92, from: -290 }]
                : [{ kind: 'circle', c: '#ffffff', x: 0, y: 110, r: 100, from: 290 }, { kind: 'circle', c: '#ffffff', x: 0, y: -40, r: 72, from: -290 }, { kind: 'circle', c: '#ffffff', x: 0, y: -150, r: 52, from: 290 }];
          const label = ['A HOUSE!', 'ICE CREAM!', 'A SNOWMAN!'][bi];
          return (
            <g transform={`translate(${W / 2},${470}) scale(${appear})`}>
              <rect x={-420} y={-280} width={840} height={540} rx={50} fill="#ffffff" {...kst(10)} />
              {parts.map((p, k) => {
                const m = fly(k, p.from);
                return (
                  <g key={k} transform={`translate(${p.x + m.dx},${p.y + m.dy}) scale(${m.s}) rotate(${p.rot ?? 0})`}>
                    <Shape kind={p.kind} r={p.r} c={p.c} />
                  </g>
                );
              })}
              {/* the details pop on with "Now we have…" */}
              {done > 0 && (
                <g opacity={done}>
                  {bi === 0 && (
                    <g>
                      <rect x={-30} y={70} width={60} height={92} rx={8} fill="#a0673c" {...kst(5)} />
                      <rect x={-92} y={10} width={46} height={46} rx={6} fill="#8fd3ff" {...kst(4)} />
                      <rect x={46} y={10} width={46} height={46} rx={6} fill="#8fd3ff" {...kst(4)} />
                    </g>
                  )}
                  {bi === 1 && [[-30, -110], [20, -70], [40, -120], [-50, -60], [0, -140]].map(([x, y], k) => (
                    <rect key={k} x={x} y={y} width={18} height={7} rx={3} fill={['#4cc9f0', '#ffd60a', '#8ac926', '#ffffff', '#9d4edd'][k]} transform={`rotate(${k * 35} ${x} ${y})`} />
                  ))}
                  {bi === 1 && <Vol><circle cx={0} cy={-178} r={16} fill="#e63946" {...kst(4)} /></Vol>}
                  {bi === 2 && (
                    <g>
                      <circle cx={-18} cy={-158} r={6} fill={KINK} />
                      <circle cx={18} cy={-158} r={6} fill={KINK} />
                      <path d="M -4,-146 L 34,-140 L -4,-134 Z" fill="#ff924c" {...kst(3)} />
                      <rect x={-46} y={-236} width={92} height={42} rx={6} fill="#22223b" {...kst(4)} />
                      <rect x={-64} y={-200} width={128} height={12} rx={6} fill="#22223b" {...kst(4)} />
                      {[-60, 0, 60].map((y, k) => <circle key={k} cx={0} cy={-20 + k * 50 + (k ? 20 : 0)} r={8} fill={KINK} />)}
                      <path d="M -70,-50 L -150,-110 M 70,-50 L 150,-110" stroke="#8d5a3b" strokeWidth={10} strokeLinecap="round" />
                    </g>
                  )}
                  <text y={235} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={64} fill={KINK}>{label}</text>
                </g>
              )}
            </g>
          );
        })()}
        {/* quiz: an object + 3 shape choices; the answer's outline traces the object */}
        {qi >= 0 && (() => {
          const L = QUIZ0 + qi * 2;
          const Q = QUIZ[qi];
          const done = t >= S(L + 1);
          const trace = EASE_INOUT(prog(t, S(L + 1) - 0.1, S(L + 1) + 0.9));
          return (
            <g transform={`translate(${W / 2},${450}) scale(${EASE_OUT(prog(t, S(L) - 0.3, S(L) + 0.2))})`}>
              <rect x={-440} y={-260} width={880} height={520} rx={50} fill="#ffffff" {...kst(10)} />
              <g transform="translate(-180,0)">
                <QuizObj obj={Q.obj} t={t} />
                {done && <g transform={`scale(${Q.ans === 'rectangle' ? 1.6 : Q.ans === 'triangle' ? 1.45 : 1.45}) ${Q.ans === 'triangle' ? 'rotate(180) translate(0,-14)' : ''}`}><Outline kind={Q.ans} r={Q.ans === 'oval' ? 102 : 100} p={trace} c="#ffca3a" /></g>}
              </g>
              {Q.choices.map((c, k) => {
                const ok = c === Q.ans;
                const y = -165 + k * 165;
                return (
                  <g key={c} transform={`translate(170,${y}) scale(${done && ok ? 1.12 + beat * 0.04 : 1})`} opacity={done && !ok ? 0.35 : 1}>
                    <g transform="translate(-60,0)"><Shape kind={c} r={50} /></g>
                    <text x={10} y={15} fontFamily={FONT_TOON} fontWeight={700} fontSize={42} fill={KINK}>{c}</text>
                  </g>
                );
              })}
              {done && <AnswerMark t={t} at={S(L + 1) + 0.1} ok x={60} y={-165 + Q.choices.indexOf(Q.ans) * 165 - 40} size={0.42} />}
            </g>
          );
        })()}
        {/* chorus / karaoke / end: ten shapes bounce on the beat */}
        {floaters &&
          SHAPES.map((s, i) => {
            const at = (chorusIdx >= 0 ? S(CHORUS[chorusIdx]) : karaoke ? KAR0 : E(LAST)) + i * 0.08 - 0.3;
            const sc = EASE_OUT(prog(t, at, at + 0.4)) * (lineLit === i ? 1.3 : 1);
            const x = W / 2 + (i - 4.5) * 150;
            const y = 300 + Math.abs(i - 4.5) * 18 - Math.abs(Math.sin((t / SONG_BEAT) * Math.PI + i * 0.6)) * 26;
            return (
              <g key={s.kind} transform={`translate(${x},${y}) scale(${sc}) rotate(${Math.sin(t * 2 + i) * 6})`}>
                <Shape kind={s.kind} r={56} face t={t} />
              </g>
            );
          })}
        <Kid spec={MILA_HERO} x={230} y={f} scale={0.6} expr={end ? 'laugh' : karaoke ? 'smile' : singing ? 'happy' : yourTurn ? 'smile' : 'happy'} look={[0.4, -0.2]}
          mouth={lipSync(SONG, 'mila', t)}
          armL={end ? 'up' : karaoke ? 'wave' : armSwap ? 'up' : 'wave'}
          armR={end ? 'up' : (vi >= 0 && !yourTurn) || karaoke || (qi >= 0 && singing) || bi >= 0 ? 'present' : armSwap ? 'wave' : 'up'}
          hop={singing ? dance(0, 10) : dance(0, 18)} />
        <Critter spec={HOOT_HERO} x={450} y={f} scale={0.42} expr={yourTurn ? 'happy' : 'laugh'} look={[0.4, -0.2]}
          armL={armSwap ? 'up' : 'wave'} armR={armSwap ? 'wave' : 'up'} hop={dance(1.2, 22)} />
        <Kid spec={LEO_HERO} x={1480} y={f} scale={0.55} expr={yourTurn ? 'happy' : 'laugh'} look={[-0.4, -0.2]}
          armL={armSwap ? 'wave' : 'up'} armR={armSwap ? 'up' : 'clap'} hop={dance(0.6, 26)} />
        <Critter spec={BOBO_HERO} x={1700} y={f} scale={0.5} expr="laugh" look={[-0.4, -0.2]}
          armL={beat > 0.5 ? 'clap' : 'up'} armR={beat > 0.5 ? 'clap' : 'up'} hop={dance(1.8, 22)} />
        {end && <g transform="translate(1720,180) scale(0.8)"><Sun x={0} y={0} t={t} /></g>}
      </KidsStage>
      <TitleCard t={t} from={0} to={1.4} title="SHAPES!" sub="the shapes song" />
      {chorusIdx >= 0 && <PopText t={t} at={S(CHORUS[chorusIdx] + 3)} until={E(CHORUS[chorusIdx] + 3) + 0.4} text="SING WITH ME!" y={560} size={90} color="#ffca3a" />}
      {karaoke && <PopText t={t} at={KAR0 - 0.4} text="NOW YOU SING!" y={560} size={110} color="#ff6fa5" />}
      {yourTurn && vi >= 0 && <PopText t={t} at={E(verseLine(vi) + 1) + 0.15} text="YOUR TURN!" x={1560} y={250} size={80} color="#ffca3a" />}
      {qi >= 0 && <ThinkTimer t={t} from={E(QUIZ0 + qi * 2) + 0.1} to={S(QUIZ0 + qi * 2 + 1) - 0.1} x={1700} y={190} r={100} label="THINK!" />}
      {bi >= 0 && <Confetti t={t} at={S(BUILD0 + bi * 2 + 1)} y={400} dur={1.2} />}
      {CHORUS.map((c) => <Confetti key={c} t={t} at={E(c + 3)} y={300} dur={1.4} />)}
      <Confetti t={t} at={E(LAST)} y={300} />
      {end && <PopText t={t} at={E(LAST) + 0.2} text="YOU KNOW YOUR SHAPES!" y={560} size={100} color="#ffca3a" />}
      <SingAlong t={t} lines={karaoke ? KARAOKE : SONG} ball={karaoke ? '#ff6fa5' : '#ff595e'} />
    </>
  );
}
