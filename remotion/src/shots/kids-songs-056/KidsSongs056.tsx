// TINY SPARKS · Day 56 · 🎵 Educational Songs #8 — "Four Seasons Song" (LONG 16:9, original song)
// kids-shorts/tiny-sparks/songs/day-056-four-seasons-song. Song = song.json → tools/gen_song.py (chant), 100 bpm.
// ENERGY LAYER: the channel ident on the jingle (0–3.7 s), then the song (all song times + INTRO_S).
// THE SEASON WHEEL (winter · spring · summer · autumn) turns so the season being sung sits under the pointer, and THE
// SEASON TREE in the middle changes with it (snowy branches · pink blossoms · full green with apples · orange leaves
// falling); the meadow's weather follows (snow · butterflies · birds + sun · leaves). Form: CHORUS → winter + spring
// verses (a season card with a picture) → CHORUS → summer + autumn → CHORUS → QUIZ ×4 (what comes after winter /
// summer, when does snow fall, when do flowers grow — a THINK ring through the rest bars) → CHORUS → ACTIONS (shiver,
// hop, swim, float down — the cast does them) → KARAOKE chorus → SLOW pass (each season alone, then YOUR TURN) →
// CHORUS → "You know the four seasons!". Spark Girl sings; Captain Leo, Professor Hoot, Super Bobo dance.
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

export const compositionConfig = { id: 'KidsSongs056', durationInSeconds: 312.1, fps: 30, width: 1920, height: 1080 };

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
const CHORUS = [0, 12, 24, 36, 49];
const VERSES = [4, 8, 16, 20]; // winter, spring, summer, autumn (4 lines each)
const QUIZ0 = 28; // question k: 28 + 2k, answer 29 + 2k
const ACT0 = 40; // shiver · hop · swim · float
const KAR0 = S(ACT0) + 8 * BAR;
const KARAOKE: VoLine[] = SONG.slice(0, 4).map((l) => shift(l, KAR0 - S(0)));
const SLOW0 = 44; // 45..48 = Winter, Spring, Summer, Autumn
const LAST = SONG.length - 1;

const SEASONS = ['WINTER', 'SPRING', 'SUMMER', 'AUTUMN'];
const SC = ['#4cc9f0', '#ff6fa5', '#ffca3a', '#ff924c'];
const QUIZ: { known?: number; icon?: 'snow' | 'flower'; ans: number }[] = [{ known: 0, ans: 1 }, { known: 2, ans: 3 }, { icon: 'snow', ans: 0 }, { icon: 'flower', ans: 1 }];
const fxOf = (s: number): PlaceFx[] => (s === 0 ? ['snow'] : s === 1 ? ['butterflies', 'birds'] : s === 2 ? ['birds', 'twinkles'] : ['leaves']);

// ── the season wheel
const WHEEL: [number, number] = [430, 340];
const WR = 230;
const arcPath = (a0: number, a1: number, r: number) => {
  const p = (a: number) => `${(Math.cos((a * Math.PI) / 180) * r).toFixed(1)},${(Math.sin((a * Math.PI) / 180) * r).toFixed(1)}`;
  return `M 0,0 L ${p(a0)} A ${r},${r} 0 0 1 ${p(a1)} Z`;
};
const SeasonWheel: React.FC<{ rot: number; lit: (i: number) => number; t: number }> = ({ rot, lit, t }) => (
  <g transform={`translate(${WHEEL[0]},${WHEEL[1]})`}>
    <circle r={WR + 18} fill="#ffffff" {...kst(9)} />
    <g transform={`rotate(${rot})`}>
      {SEASONS.map((s, i) => {
        const a = -90 + i * 90;
        const l = lit(i);
        return (
          <g key={s}>
            <path d={arcPath(a - 45, a + 45, WR + (l >= 1 ? 10 : 0))} fill={SC[i]} opacity={l > 0 ? 1 : 0.75} {...kst(5)} />
            <g transform={`rotate(${a + 90}) translate(0,${-WR * 0.62})`}>
              <text y={14} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={l >= 1 ? 44 : 38} fill="#ffffff" stroke={KINK} strokeWidth={5} paintOrder="stroke">{s}</text>
            </g>
          </g>
        );
      })}
    </g>
    <Vol><circle r={62} fill="#ffffff" {...kst(7)} /></Vol>
    <Sun x={0} y={0} r={40} t={t} />
    <path d={`M -30,${-WR - 60} L 30,${-WR - 60} L 0,${-WR - 10} Z`} fill="#ffca3a" {...kst(6)} />
  </g>
);

// ── the season tree (centre) — snow · blossoms · green + apples · orange leaves
const SeasonTree: React.FC<{ s: number; t: number }> = ({ s, t }) => {
  const x = 960;
  const crown = s === 0 ? null : s === 1 ? '#ffb3c6' : s === 2 ? '#52b788' : '#ff924c';
  return (
    <g>
      <Vol kind="tube"><path d={`M ${x - 40},${f} Q ${x - 30},${f - 200} ${x - 20},${f - 330} L ${x + 20},${f - 330} Q ${x + 30},${f - 200} ${x + 40},${f} Z`} fill="#8d5a3b" {...kst(7)} /></Vol>
      {[[-1, -260, -90], [1, -300, 80], [-1, -340, -40], [1, -360, 50]].map(([d, y, len], i) => (
        <path key={i} d={`M ${x},${f + (y as number)} q ${(d as number) * 40},-30 ${len},-70`} fill="none" stroke="#8d5a3b" strokeWidth={16} strokeLinecap="round" />
      ))}
      {crown ? (
        <g>
          {[[-120, -420, 110], [110, -430, 115], [-40, -360, 100], [70, -350, 95], [0, -500, 130]].map(([dx, dy, r], i) => (
            <Vol key={i}><circle cx={x + dx} cy={f + dy} r={r} fill={crown} {...kst(6)} /></Vol>
          ))}
        </g>
      ) : (
        <g>
          {[[-90, -400], [80, -420], [0, -470], [-40, -340], [60, -340]].map(([dx, dy], i) => <ellipse key={i} cx={x + dx} cy={f + dy} rx={60} ry={20} fill="#ffffff" {...kst(4)} />)}
        </g>
      )}
      {s === 1 && [[-120, -440], [90, -470], [10, -540], [-60, -380], [120, -380]].map(([dx, dy], i) => <circle key={i} cx={x + dx} cy={f + dy} r={14} fill="#ffffff" {...kst(3)} />)}
      {s === 2 && [[-100, -420], [90, -440], [0, -520], [60, -360]].map(([dx, dy], i) => <Vol key={i}><circle cx={x + dx} cy={f + dy} r={18} fill="#ff595e" {...kst(4)} /></Vol>)}
      {s === 3 && [0, 1, 2, 3, 4].map((i) => {
        const p = (t * 0.25 + i / 5) % 1;
        return <path key={i} d="M 0,-14 Q 14,0 0,14 Q -14,0 0,-14 Z" fill={['#ff924c', '#ffca3a', '#e76f51'][i % 3]} {...kst(3)} transform={`translate(${x - 150 + i * 70 + Math.sin(t * 2 + i) * 30},${f - 420 + p * 420}) rotate(${t * 90 + i * 40})`} />;
      })}
    </g>
  );
};

// ── the season pictures (origin = centre, ~240 px)
const SeasonPic: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  switch (i) {
    case 0: return ( // a snowman + a mitten
      <g>
        <Vol><circle cx={0} cy={60} r={70} fill="#ffffff" {...kst(6)} /></Vol>
        <Vol><circle cx={0} cy={-40} r={50} fill="#ffffff" {...kst(6)} /></Vol>
        <circle cx={-16} cy={-48} r={6} fill={KINK} /><circle cx={16} cy={-48} r={6} fill={KINK} />
        <path d="M 0,-38 L 40,-30 L 0,-26 Z" fill="#ff924c" {...kst(3)} />
        <rect x={-50} y={-110} width={100} height={26} rx={8} fill="#ff595e" {...kst(4)} /><rect x={-34} y={-150} width={68} height={44} rx={8} fill="#ff595e" {...kst(4)} />
      </g>
    );
    case 1: return ( // a flower + a bunny ear peek
      <g transform={`rotate(${Math.sin(t * 1.6) * 5})`}>
        <path d="M 0,120 L 0,0" stroke="#3a8d3a" strokeWidth={12} />
        <Vol>{[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 44} cy={-20 + Math.sin((a * Math.PI) / 180) * 44} r={34} fill="#ff6fa5" {...kst(5)} />)}<circle cx={0} cy={-20} r={28} fill="#ffd166" {...kst(5)} /></Vol>
      </g>
    );
    case 2: return ( // an ice cream cone + the sun
      <g>
        <g transform="translate(80,-80) scale(0.6)"><Sun x={0} y={0} r={70} t={t} /></g>
        <Vol><path d="M -50,0 L 50,0 L 0,140 Z" fill="#e9a35b" {...kst(6)} /></Vol>
        <Vol><circle cx={0} cy={-30} r={56} fill="#ffb3c6" {...kst(6)} /></Vol>
        <circle cx={-14} cy={-50} r={6} fill="#ff595e" />
      </g>
    );
    default: return ( // a pumpkin + falling leaves
      <g>
        <Vol><ellipse cx={0} cy={40} rx={100} ry={74} fill="#ff924c" {...kst(6)} /></Vol>
        {[-40, 0, 40].map((x) => <path key={x} d={`M ${x},-30 Q ${x * 1.3},40 ${x},110`} fill="none" stroke="#e76f51" strokeWidth={6} />)}
        <path d="M 0,-34 q 6,-30 24,-36" stroke="#52b788" strokeWidth={12} fill="none" strokeLinecap="round" />
        {[0, 1].map((k) => <path key={k} d="M 0,-14 Q 14,0 0,14 Q -14,0 0,-14 Z" fill={['#ffca3a', '#e76f51'][k]} {...kst(3)} transform={`translate(${-80 + k * 160},${-90 + ((t * 30 + k * 40) % 60)}) rotate(${t * 60})`} />)}
      </g>
    );
  }
};

const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (EASE_OUT(p) - 1) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};

// wheel keyframes: verses, slow pass, quiz, chorus words (Winter, spring, summer, fall)
const ROT_KEYS: [number, number][] = (() => {
  const k: [number, number][] = [];
  VERSES.forEach((v, i) => k.push([S(v) - 0.3, i]));
  for (let i = 0; i < 4; i++) k.push([S(SLOW0 + 1 + i) - 0.2, i]);
  QUIZ.forEach((q, i) => k.push([S(QUIZ0 + i * 2 + 1) - 0.05, q.ans]));
  QUIZ.forEach((q, i) => q.known !== undefined && k.push([S(QUIZ0 + i * 2) - 0.3, q.known]));
  for (let i = 0; i < 4; i++) k.push([S(ACT0 + i) - 0.1, i]);
  const bases: [VoLine[], number][] = [...CHORUS.map((c) => [SONG, c] as [VoLine[], number]), [KARAOKE, 0]];
  for (const [lines, base] of bases) for (let i = 0; i < 4; i++) k.push([timeWords(lines[base])[i].start, i]);
  return k.sort((x, y) => x[0] - y[0]);
})();
const seasonAt = (t: number) => {
  let i = -1;
  while (i + 1 < ROT_KEYS.length && ROT_KEYS[i + 1][0] <= t) i++;
  return i < 0 ? 0 : ROT_KEYS[i][1];
};
const wheelRot = (t: number) => {
  let i = -1;
  while (i + 1 < ROT_KEYS.length && ROT_KEYS[i + 1][0] <= t) i++;
  if (i < 0) return 0;
  const cur = -ROT_KEYS[i][1] * 90;
  const prev = i > 0 ? -ROT_KEYS[i - 1][1] * 90 : 0;
  let d = cur - prev;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return prev + d * EASE_INOUT(prog(t, ROT_KEYS[i][0], ROT_KEYS[i][0] + 0.4));
};

const SHOTS: Shot[] = [{ t: 0, z: 1.0, x: 960, y: 540, move: 'cut' }];
VERSES.forEach((v) => SHOTS.push({ t: S(v) - 0.3, z: 1.05, x: 980, y: 520, move: 'snap', push: 0.004 }, { t: E(v + 3) + 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 }));
for (let k = 0; k < 4; k++) SHOTS.push({ t: S(QUIZ0 + k * 2 + 1) - 0.05, z: 1.08, x: 1000, y: 500, move: 'snap' }, { t: E(QUIZ0 + k * 2 + 1) + 0.4, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 });
SHOTS.sort((a, b) => a.t - b.t);
const PUNCHES = Array.from({ length: 4 }, (_, k) => S(QUIZ0 + k * 2 + 1));
const CARD: [number, number] = [1450, 320];
const CARD_W = 520;
const CARD_H = 400;

export default function KidsSongs056() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const beat = Math.abs(Math.sin(((t - OFF) / SONG_BEAT) * Math.PI));
  const bar = Math.floor((t - OFF) / BAR);
  const dance = (phase: number, amp = 26) => (t < OFF ? 0 : Math.abs(Math.sin(((t - OFF) / SONG_BEAT) * Math.PI + phase)) * amp);
  const armSwap = bar % 2 === 0;
  const singing = SONG.some((l) => t >= l.start && t < l.end);

  const vi = VERSES.findIndex((v, i) => within(t, S(v) - 0.3, (i === 1 ? S(CHORUS[1]) : i === 3 ? S(CHORUS[2]) : S(VERSES[i + 1])) - 0.3));
  let qi = -1;
  for (let k = 0; k < 4; k++) if (within(t, S(QUIZ0 + k * 2) - 0.3, (k < 3 ? S(QUIZ0 + (k + 1) * 2) : S(CHORUS[3])) - 0.3)) qi = k;
  const chorusIdx = CHORUS.findIndex((c) => within(t, S(c) - 0.4, E(c + 3) + 0.4));
  const karaoke = within(t, KAR0 - 0.3, S(SLOW0) - 0.3);
  const ai = [0, 1, 2, 3].findIndex((i) => within(t, S(ACT0 + i), i < 3 ? S(ACT0 + i + 1) : KAR0 - 0.3));
  let si = -1;
  for (let i = 0; i < 4; i++) if (within(t, S(SLOW0 + 1 + i) - 0.2, (i < 3 ? S(SLOW0 + 2 + i) : S(CHORUS[4])) - 0.3)) si = i;
  const slowIntro = within(t, S(SLOW0) - 0.3, S(SLOW0 + 1) - 0.2);
  const slowTurn = si >= 0 && t >= E(SLOW0 + 1 + si) + 0.1;
  const end = t >= E(LAST) + 0.2;
  const season = seasonAt(t);
  const fourOn = (() => {
    const lines = karaoke ? KARAOKE : SONG;
    const base = karaoke ? 0 : chorusIdx >= 0 ? CHORUS[chorusIdx] : -1;
    return base >= 0 && within(t, lines[base + 1].start, lines[base + 1].end + 0.3);
  })();
  const chorusS = (() => {
    const lines = karaoke ? KARAOKE : SONG;
    const base = karaoke ? 0 : chorusIdx >= 0 ? CHORUS[chorusIdx] : -1;
    if (base < 0) return [-1, 0];
    const w = timeWords(lines[base]);
    for (let i = 3; i >= 0; i--) if (t >= w[i].start && t < lines[base].end + 0.2) return [i, w[i].start];
    return [-1, 0];
  })();
  const lit = (i: number) => (i === season ? 1 : fourOn || end ? 0.6 : 0);

  // the actions: shiver · hop · swim · float
  const shiver = ai === 0 ? Math.sin(t * 50) * 6 : 0;
  const hopA = ai === 1 ? Math.abs(Math.sin(t * 6)) * 60 : 0;
  const swim = ai === 2;
  const floatA = ai === 3 ? Math.sin(t * 2) * 16 : 0;
  const armsFor = (k: number): ['up' | 'wave' | 'hug' | 'down', 'up' | 'wave' | 'hug' | 'down'] => {
    if (ai === 0) return ['hug', 'hug'];
    if (swim) return Math.sin(t * 6 + k) > 0 ? ['up', 'down'] : ['down', 'up'];
    if (ai === 3) return ['up', 'up'];
    return armSwap ? ['up', 'wave'] : ['wave', 'up'];
  };

  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
        <Backdrop place="meadow" w={W} h={H} t={t} fx={fxOf(season)} />
        {season === 0 && <rect width={W} height={H} fill="#e6f6ff" opacity={0.3} />}
        {season === 3 && <rect width={W} height={H} fill="#ffb067" opacity={0.12} />}
        {season === 0 && <Vol kind="slope"><path d={`M -20,${f - 30} Q 600,${f - 70} 1200,${f - 40} Q 1600,${f - 20} ${W + 20},${f - 40} L ${W + 20},${H + 20} L -20,${H + 20} Z`} fill="#f4fbff" opacity={0.95} {...kst(6)} /></Vol>}
        <SeasonTree s={season} t={t} />
        <g transform={`translate(0,${-dance(0.3, 4)})`}><SeasonWheel rot={wheelRot(t)} lit={lit} t={t} /></g>

        {/* chorus: the sung season pops big · "four seasons" = 4 dots */}
        {(chorusIdx >= 0 || karaoke) && chorusS[0] >= 0 && !fourOn && (
          <g key={`cs${chorusS[0]}`} transform={`translate(${CARD[0]},${CARD[1] + 40}) scale(${popIn(t, chorusS[1], 0.25)})`}>
            <text y={40} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={120} fill={SC[chorusS[0]]} stroke={KINK} strokeWidth={13} paintOrder="stroke">{SEASONS[chorusS[0]]}</text>
          </g>
        )}
        {(chorusIdx >= 0 || karaoke) && fourOn && (
          <g transform={`translate(${CARD[0]},${CARD[1] + 20})`}>
            {SEASONS.map((_, i) => (
              <g key={i} transform={`translate(${(i - 1.5) * 120},${-Math.abs(Math.sin(t * 5 + i * 0.6)) * 18}) scale(${popIn(t, (karaoke ? KARAOKE : SONG)[(karaoke ? 0 : CHORUS[chorusIdx]) + 1].start + i * 0.1)})`}>
                <Vol><circle r={48} fill={SC[i]} {...kst(6)} /></Vol>
                <text y={16} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={46} fill="#ffffff" stroke={KINK} strokeWidth={5} paintOrder="stroke">{i + 1}</text>
              </g>
            ))}
          </g>
        )}

        {/* verse: the season card */}
        {vi >= 0 && (
          <g transform={`translate(${CARD[0]},${CARD[1]}) scale(${EASE_OUT(prog(t, S(VERSES[vi]) - 0.3, S(VERSES[vi])))}) rotate(-2)`}>
            <rect x={-CARD_W / 2} y={-CARD_H / 2} width={CARD_W} height={CARD_H} rx={50} fill="#ffffff" {...kst(10)} />
            <rect x={-CARD_W / 2 + 24} y={-CARD_H / 2 + 24} width={CARD_W - 48} height={240} rx={36} fill={SC[vi]} opacity={0.2} />
            <g transform={`translate(0,-60) scale(${0.75 * popIn(t, S(VERSES[vi]) + 0.4)})`}><SeasonPic i={vi} t={t} /></g>
            <text y={150} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={86} fill={SC[vi]} stroke={KINK} strokeWidth={7} paintOrder="stroke">{SEASONS[vi]}</text>
          </g>
        )}

        {/* quiz */}
        {qi >= 0 && (() => {
          const Q = QUIZ[qi];
          const L = QUIZ0 + qi * 2;
          const done = t >= S(L + 1) - 0.05;
          const Pill: React.FC<{ m: number; q?: boolean; on?: boolean }> = ({ m, q, on }) => (
            <g>
              <rect x={-120} y={-60} width={240} height={120} rx={30} fill={q ? '#ffffff' : SC[m]} {...kst(on ? 10 : 7)} stroke={on ? '#ffca3a' : KINK} />
              <text y={18} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={q ? 80 : 46} fill={q ? KINK : '#ffffff'} stroke={KINK} strokeWidth={q ? 0 : 5} paintOrder="stroke">{q ? '?' : SEASONS[m]}</text>
            </g>
          );
          return (
            <g transform={`translate(${CARD[0]},${CARD[1]}) scale(${EASE_OUT(prog(t, S(L) - 0.3, S(L) + 0.2))})`}>
              <rect x={-CARD_W / 2 - 20} y={-CARD_H / 2} width={CARD_W + 40} height={CARD_H} rx={50} fill="#ffffff" {...kst(10)} />
              <text y={-110} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={46} fill={KINK}>{Q.known !== undefined ? 'WHAT COMES AFTER?' : Q.icon === 'snow' ? 'WHEN DOES IT SNOW?' : 'WHEN DO FLOWERS GROW?'}</text>
              {Q.known !== undefined ? (
                <g>
                  <path d="M -30,30 L 30,30 M 6,6 L 30,30 L 6,54" fill="none" stroke={KINK} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
                  <g transform="translate(-150,30)"><Pill m={Q.known} /></g>
                  <g transform={`translate(150,30) scale(${done ? popIn(t, S(L + 1) - 0.05) : 1})`}>{done ? <Pill m={Q.ans} on /> : <Pill m={Q.ans} q />}</g>
                </g>
              ) : (
                <g>
                  <g transform="translate(-130,40) scale(0.55)"><SeasonPic i={Q.icon === 'snow' ? 0 : 1} t={t} /></g>
                  <g transform={`translate(130,40) scale(${done ? popIn(t, S(L + 1) - 0.05) : 1})`}>{done ? <Pill m={Q.ans} on /> : <Pill m={Q.ans} q />}</g>
                </g>
              )}
            </g>
          );
        })()}

        {/* actions + slow pass: the season word */}
        {(ai >= 0 || si >= 0) && (
          <g key={`a${ai}s${si}`} transform={`translate(${CARD[0]},${CARD[1] + 60}) scale(${popIn(t, ai >= 0 ? S(ACT0 + ai) : S(SLOW0 + 1 + si) - 0.2)})`}>
            <text y={40} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={ai >= 0 ? 100 : 140} fill={SC[ai >= 0 ? ai : si]} stroke={KINK} strokeWidth={14} paintOrder="stroke">
              {ai >= 0 ? ['SHIVER! BRRR!', 'HOP! HOP!', 'SWIM! SPLASH!', 'FLOAT DOWN…'][ai] : SEASONS[si]}
            </text>
          </g>
        )}

        {/* the cast */}
        <Critter spec={BOBO_HERO} x={220 + shiver} y={f - floatA} scale={0.44} expr="laugh" look={[0.4, -0.2]}
          armL={ai >= 0 ? armsFor(0)[0] : beat > 0.5 ? 'clap' : 'up'} armR={ai >= 0 ? armsFor(0)[1] : beat > 0.5 ? 'clap' : 'up'} hop={hopA || dance(1.8, 22)} />
        <Kid spec={MILA_HERO} x={640 + shiver} y={f - floatA} scale={0.52} expr={end ? 'laugh' : 'happy'} look={[0.3, -0.2]} mouth={lipSync(SONG, 'mila', t)}
          armL={ai >= 0 ? armsFor(1)[0] : end ? 'up' : armSwap ? 'up' : 'wave'} armR={ai >= 0 ? armsFor(1)[1] : (vi >= 0 || (qi >= 0 && singing)) ? 'present' : armSwap ? 'wave' : 'up'}
          hop={hopA || (singing ? dance(0, 10) : dance(0, 18))} />
        <Critter spec={HOOT_HERO} x={1290 + shiver} y={f - floatA} scale={0.4} expr={slowTurn ? 'happy' : 'laugh'} look={[-0.2, -0.2]}
          armL={ai >= 0 ? armsFor(2)[0] : armSwap ? 'up' : 'wave'} armR={ai >= 0 ? armsFor(2)[1] : armSwap ? 'wave' : 'up'} hop={hopA || dance(1.2, 22)} />
        <Kid spec={LEO_HERO} x={1700 + shiver} y={f - floatA} scale={0.52} expr={slowTurn ? 'happy' : 'laugh'} look={[-0.4, -0.2]}
          armL={ai >= 0 ? armsFor(3)[0] : armSwap ? 'wave' : 'up'} armR={ai >= 0 ? armsFor(3)[1] : armSwap ? 'up' : 'clap'} hop={hopA || dance(0.6, 26)} />
      </ActionStage>

      {chorusIdx >= 0 && <PopText t={t} at={S(CHORUS[chorusIdx])} until={S(CHORUS[chorusIdx]) + 2.0} text="SING WITH ME!" y={90} size={80} color="#ffffff" />}
      {karaoke && <PopText t={t} at={KAR0 - 0.3} until={KAR0 + 2.4} text="NOW YOU SING!" y={90} size={100} color="#ff6fa5" />}
      {ai >= 0 && <PopText t={t} at={S(ACT0)} until={KAR0 - 0.3} text="DO IT WITH US!" y={90} size={90} color="#ffffff" />}
      {slowIntro && <PopText t={t} at={S(SLOW0)} text="NICE AND SLOW..." x={CARD[0]} y={380} size={86} color="#ffffff" />}
      {slowTurn && <PopText t={t} at={E(SLOW0 + 1 + si) + 0.1} text="YOUR TURN!" x={CARD[0]} y={560} size={76} color="#ffca3a" />}
      {qi >= 0 && <ThinkTimer t={t} from={E(QUIZ0 + qi * 2) + 0.1} to={S(QUIZ0 + qi * 2 + 1) - 0.1} x={1790} y={110} r={80} label="THINK!" />}
      {CHORUS.map((c) => <Confetti key={c} t={t} at={E(c + 3)} y={400} dur={1.4} />)}
      {Array.from({ length: 4 }, (_, k) => <Confetti key={k} t={t} at={S(QUIZ0 + k * 2 + 1) + 0.2} y={400} dur={1.1} />)}
      {end && <PopText t={t} at={E(LAST) + 0.2} until={END + 1.5} text="YOU KNOW THE 4 SEASONS!" y={540} size={96} color="#ffca3a" />}
      <SingAlong t={t} lines={karaoke ? KARAOKE : SONG} ball={karaoke ? '#ff6fa5' : '#ff595e'} />
      <SparksIntro t={t} at={0} cast={{ kids: [MILA_HERO, LEO_HERO], buddy: BOBO_HERO }} />
      <StarWipe t={t} at={END + 1.4} dur={0.5} hold={5} color="#3b2a4a" x={W / 2} y={H * 0.45} />
    </>
  );
}
