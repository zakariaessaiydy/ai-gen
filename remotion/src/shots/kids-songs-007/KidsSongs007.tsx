// TINY SPARKS · Day 7 · 🎵 Educational Songs #1 — "Count from 1 to 10 Song" (LONG 16:9, original song)
// kids-shorts/tiny-sparks/songs/day-007-count-from-1-to-10-song. Song = song.json → tools/gen_song.py
// (xylophone + ukulele + Mila's chant on the beat); every cue reads SONG line/word times.
// Form: CHORUS (numerals 1–10 pop on the sung words) → numbers 1–5 → CHORUS → 6–10 → CHORUS.
// Each number: "Number N!" (big numeral + word, Mila's fingers) · YOUR TURN bar · "N little <animals>…"
// (N animals pop in) · YOUR TURN bar. The tenth bear is Bobo (he leaves his spot to join the row).
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter, type CritterSpec, type Species } from '../../lib/kids/critter';
import { BOBO, HOOT, LEO, MILA } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { Confetti, CountRow, FONT_TOON, KidsStage, PopText, RAINBOW, SingAlong, TitleCard, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { SONG, SONG_BEAT } from './song.gen';

export const compositionConfig = { id: 'KidsSongs007', durationInSeconds: 165.2, fps: 30, width: 1920, height: 1080 };

const W = 1920;
const H = 1080;
const f = FLOOR(H);
const S = (i: number) => SONG[i].start;
const E = (i: number) => SONG[i].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;
const WORDS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN'];

// line indices: chorus = 4 lines; each number = 2 lines ("Number N!", the animal line)
const CHORUS = [0, 14, 28];
const numLine = (n: number) => (n <= 5 ? 4 + (n - 1) * 2 : 18 + (n - 6) * 2);

const zoo: [Species, string, string, string][] = [
  ['lion', '#ffc857', '#fff1c1', '#d2691e'],
  ['pig', '#ffb3c6', '#ffd6e0', '#e5738f'],
  ['cat', '#ffb26b', '#fff1e0', '#d9772b'],
  ['fox', '#ff8c42', '#ffffff', '#7a3b12'],
  ['bunny', '#f8f9fa', '#ffe5ec', '#adb5bd'],
  ['mouse', '#c9cdd4', '#f1f3f5', '#868e96'],
  ['panda', '#ffffff', '#ffffff', '#2b2d42'],
  ['owl', '#9c7a64', '#f5e6d3', '#6d4c41'],
  ['frog', '#8ac926', '#e9f5c9', '#4f7d17'],
  ['bear', '#c98f5f', '#f3dcc0', '#7a4a2a'],
];
const specOf = (n: number, i: number): CritterSpec => {
  if (n === 10 && i === 9) return BOBO;
  const [species, fur, fur2, dark] = zoo[n - 1];
  return { id: `${species}${i}`, species, fur, fur2, dark };
};

const MILA_X = 230;
const HOOT_X = 450;
const LEO_X = 1480;
const BOBO_X = 1700;

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

export default function KidsSongs007() {
  const t = useT();
  const cam = camAt(t, CAM);
  const beat = Math.abs(Math.sin((t / SONG_BEAT) * Math.PI));
  const bar = Math.floor(t / (SONG_BEAT * 4));

  // which number section is on (1..10), else 0
  let n = 0;
  for (let k = 1; k <= 10; k++) if (within(t, S(numLine(k)) - 0.3, S(numLine(k) + 2) - 0.3)) n = k;
  const ci = CHORUS.findIndex((c) => within(t, S(c) - 0.4, E(c + 3) + 0.6));
  const L0 = n ? numLine(n) : -1;
  // "your turn" windows: the rest bar after each line of a number section
  const yourTurn = n > 0 && (within(t, E(L0) + 0.15, S(L0 + 1) - 0.15) || within(t, E(L0 + 1) + 0.15, S(L0 + 2) - 0.4));
  const animals = n > 0 && t >= S(L0 + 1) - 0.1;
  const popTimes = n > 0 ? Array.from({ length: n }, (_, i) => S(L0 + 1) + i * Math.min(0.24, 1.9 / n)) : [];
  const fL = n ? Math.min(5, n) : 0;
  const fR = n > 5 ? n - 5 : 0;
  const singing = SONG.some((l) => t >= l.start && t < l.end);
  const end = t >= E(31) + 0.2;
  const boboInRow = n === 10 && animals;

  // chorus: numerals pop on the sung words of its first two lines
  const chorusTimes = ci >= 0 ? [...timeWords(SONG[CHORUS[ci]]), ...timeWords(SONG[CHORUS[ci] + 1])].map((w) => w.start) : [];
  const chorusAll = ci >= 0 && t >= S(CHORUS[ci] + 2);

  const dance = (phase: number, amp = 26) => Math.abs(Math.sin((t / SONG_BEAT) * Math.PI + phase)) * amp;
  const armSwap = bar % 2 === 0;

  return (
    <>
      <KidsStage cam={cam}>
        <Meadow w={W} h={H} t={t} />
        {/* chorus: the rainbow numerals 1–10 */}
        {ci >= 0 && (
          <CountRow t={t} times={chorusTimes} x={W / 2} y={420} gap={150} perRow={5} badges={false}
            item={(i) => (
              <g transform={`translate(0,${chorusAll ? -beat * 18 * (i % 2 ? 1 : 0.4) : 0})`}>
                <circle r={62} fill={RAINBOW[i % RAINBOW.length]} {...kst(8)} />
                <text y={28} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={80} fill="#ffffff" stroke={KINK} strokeWidth={6} paintOrder="stroke">{i + 1}</text>
              </g>
            )} />
        )}
        {/* number section: N animals */}
        {animals && (
          <CountRow key={n} t={t} times={popTimes} x={W / 2} y={n <= 5 ? 640 : 620} gap={n <= 5 ? 210 : 170} perRow={5}
            item={(i) => (
              <g transform={`translate(0,${620 * (n <= 5 ? 0.38 : 0.3) * 0.5})`}>
                <Critter spec={specOf(n, i)} x={0} y={0} scale={n <= 5 ? 0.38 : 0.3} expr={i % 3 === 0 ? 'laugh' : 'happy'} shadow={false}
                  hop={Math.abs(Math.sin((t / SONG_BEAT) * Math.PI + i * 0.7)) * 12} />
              </g>
            )} />
        )}
        <Kid spec={MILA} x={MILA_X} y={f} scale={0.6} expr={end ? 'laugh' : singing ? 'happy' : yourTurn ? 'smile' : 'happy'} look={[0.4, -0.2]}
          mouth={lipSync(SONG, 'mila', t)} armL={n ? 'count' : end ? 'up' : armSwap ? 'up' : 'wave'} armR={n > 5 ? 'count' : end ? 'up' : n ? 'hip' : armSwap ? 'wave' : 'up'}
          fingersL={fL} fingersR={fR} hop={singing ? dance(0, 10) : dance(0, 18)} />
        <Critter spec={HOOT} x={HOOT_X} y={f} scale={0.42} expr={yourTurn ? 'happy' : 'laugh'} look={[0.4, -0.2]}
          armL={armSwap ? 'up' : 'wave'} armR={armSwap ? 'wave' : 'up'} hop={dance(1.2, 22)} />
        <Kid spec={LEO} x={LEO_X} y={f} scale={0.55} expr={yourTurn ? 'happy' : 'laugh'} look={[-0.4, -0.2]}
          armL={armSwap ? 'wave' : 'up'} armR={armSwap ? 'up' : 'clap'} hop={dance(0.6, 26)} />
        {!boboInRow && (
          <Critter spec={BOBO} x={BOBO_X} y={f} scale={0.5} expr="laugh" look={[-0.4, -0.2]}
            armL={beat > 0.5 ? 'clap' : 'up'} armR={beat > 0.5 ? 'clap' : 'up'} hop={dance(1.8, 22)} />
        )}
      </KidsStage>
      <TitleCard t={t} from={0} to={1.4} title="COUNT 1 TO 10" sub="a Tiny Sparks song" />
      {ci >= 0 && <PopText t={t} at={S(CHORUS[ci] + 2)} until={E(CHORUS[ci] + 3) + 0.4} text="COUNT WITH ME!" y={130} size={96} color="#ffca3a" />}
      {n > 0 && <PopText t={t} at={S(L0) - 0.1} until={S(L0 + 2) - 0.3} text={String(n)} y={150} size={200} color={RAINBOW[(n - 1) % RAINBOW.length]} />}
      {n > 0 && <PopText t={t} at={S(L0) + 0.5} until={S(L0 + 2) - 0.3} text={WORDS[n - 1]} y={290} size={84} color="#ffffff" rot={2} />}
      {yourTurn && <PopText t={t} at={within(t, E(L0) + 0.15, S(L0 + 1)) ? E(L0) + 0.15 : E(L0 + 1) + 0.15} text="YOUR TURN!" x={1500} y={330} size={84} color="#ffca3a" />}
      {CHORUS.map((c) => <Confetti key={c} t={t} at={S(c + 1) + 2.4} y={300} dur={1.4} />)}
      <Confetti t={t} at={E(31)} y={300} />
      {end && <PopText t={t} at={E(31) + 0.2} text="YOU DID IT!" y={260} size={150} color="#ffca3a" />}
      <SingAlong t={t} lines={SONG} />
    </>
  );
}
