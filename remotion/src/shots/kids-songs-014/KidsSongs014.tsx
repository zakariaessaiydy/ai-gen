// TINY SPARKS · Day 14 · 🎵 Educational Songs #2 — "Count from 1 to 20 Song" (LONG 16:9, original song)
// kids-shorts/tiny-sparks/songs/day-014-count-from-1-to-20-song. Song = song.json → tools/gen_song.py
// (xylophone + ukulele + Mila's chant on the beat); every cue reads SONG line/word times.
// Form: CHORUS A (1–10, numerals pop on the sung words) → teens 11–15 → CHORUS B (11–20) → teens 16–20 →
// A → B. Each teen: "Ten and k make N!" — the bunch-of-ten balloons (Day 9) + k numbered balloons, the big
// numeral and "10 + k", Mila's fingers = k — then a silent YOUR TURN bar.
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO, HOOT, LEO, MILA } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { Confetti, CountRow, FONT_TOON, KidsStage, PopText, RAINBOW, SingAlong, TitleCard, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { SONG, SONG_BEAT } from './song.gen';

export const compositionConfig = { id: 'KidsSongs014', durationInSeconds: 136.4, fps: 30, width: 1920, height: 1080 };

const W = 1920;
const H = 1080;
const f = FLOOR(H);
const S = (i: number) => SONG[i].start;
const E = (i: number) => SONG[i].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;
const WORDS = ['ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN', 'TWENTY'];

// line indices: A = 4 lines (1–10), B = 4 lines (11–20), each teen = 1 line
const CHORUS: { at: number; from: number }[] = [{ at: 0, from: 1 }, { at: 9, from: 11 }, { at: 18, from: 1 }, { at: 22, from: 11 }];
const teenLine = (n: number) => (n <= 15 ? 4 + (n - 11) : 13 + (n - 16));
const LAST = SONG.length - 1;

const MILA_X = 230;
const HOOT_X = 450;
const LEO_X = 1480;
const BOBO_X = 1700;
const BUNDLE: [number, number] = [720, 470];
const CLUSTER: [number, number][] = [[-70, -40], [0, -80], [70, -40], [-95, 40], [-25, 10], [45, 20], [105, 55], [-60, 110], [20, 95], [85, 135]];

const Bal: React.FC<{ x: number; y: number; s: number; c: string; n?: number; string?: boolean }> = ({ x, y, s, c, n, string = true }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {string && <path d="M 0,70 Q -10,110 6,150" fill="none" stroke={KINK} strokeWidth={5} />}
    <ellipse cx={0} cy={0} rx={62} ry={74} fill={c} {...kst(7)} />
    <path d="M -8,72 L 8,72 L 0,62 Z" fill={c} {...kst(5)} />
    <ellipse cx={-24} cy={-30} rx={11} ry={18} fill="#ffffff" opacity={0.5} />
    {n !== undefined && <text y={20} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={52} fill="#ffffff" stroke={KINK} strokeWidth={5} paintOrder="stroke">{n}</text>}
  </g>
);

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

export default function KidsSongs014() {
  const t = useT();
  const cam = camAt(t, CAM);
  const beat = Math.abs(Math.sin((t / SONG_BEAT) * Math.PI));
  const bar = Math.floor(t / (SONG_BEAT * 4));

  let n = 0;
  for (let k = 11; k <= 20; k++) {
    const L = teenLine(k);
    const next = L + 1 <= LAST ? S(L + 1) : E(L) + 2.4;
    if (within(t, S(L) - 0.3, next - 0.3)) n = k;
  }
  const L0 = n ? teenLine(n) : -1;
  const k = n ? n - 10 : 0;
  const yourTurn = n > 0 && within(t, E(L0) + 0.15, S(L0 + 1) - 0.4);
  const ci = CHORUS.findIndex((c) => within(t, S(c.at) - 0.4, E(c.at + 3) + 0.6));
  const ch = ci >= 0 ? CHORUS[ci] : null;
  const chorusTimes = ch ? [...timeWords(SONG[ch.at]), ...timeWords(SONG[ch.at + 1])].map((w) => w.start) : [];
  const chorusAll = ch ? t >= S(ch.at + 2) : false;
  const singing = SONG.some((l) => t >= l.start && t < l.end);
  const end = t >= E(LAST) + 0.2;
  const fL = Math.min(5, k);
  const fR = Math.max(0, k - 5);
  const dance = (phase: number, amp = 26) => Math.abs(Math.sin((t / SONG_BEAT) * Math.PI + phase)) * amp;
  const armSwap = bar % 2 === 0;
  const bob = (i: number) => Math.sin(t * 2 + i * 1.3) * 8;

  return (
    <>
      <KidsStage cam={cam}>
        <Meadow w={W} h={H} t={t} sun={false} />
        {/* chorus: the rainbow numerals (1–10 or 11–20) pop on the sung words */}
        {ch && (
          <CountRow key={ci} t={t} times={chorusTimes} x={W / 2} y={420} gap={150} perRow={5} badges={false}
            item={(i) => (
              <g transform={`translate(0,${chorusAll ? -beat * 18 * (i % 2 ? 1 : 0.4) : 0})`}>
                <circle r={62} fill={RAINBOW[(ch.from - 1 + i) % RAINBOW.length]} {...kst(8)} />
                <text y={26} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={ch.from + i >= 10 ? 66 : 80} fill="#ffffff" stroke={KINK} strokeWidth={6} paintOrder="stroke">{ch.from + i}</text>
              </g>
            )} />
        )}
        {/* teens: a bunch of ten + k numbered balloons */}
        {n > 0 && (
          <g>
            <g opacity={EASE_OUT(prog(t, S(L0) - 0.3, S(L0)))}>
              {CLUSTER.map(([dx, dy], i) => (
                <line key={`s${i}`} x1={BUNDLE[0] + dx} y1={BUNDLE[1] + dy + 40} x2={BUNDLE[0]} y2={BUNDLE[1] + 260} stroke={KINK} strokeWidth={4} />
              ))}
              {CLUSTER.map(([dx, dy], i) => <Bal key={i} x={BUNDLE[0] + dx * 0.8} y={BUNDLE[1] + dy * 0.8 + bob(i)} s={0.62} c={RAINBOW[i % RAINBOW.length]} string={false} />)}
              <g transform={`translate(${BUNDLE[0]},${BUNDLE[1] + 300})`}>
                <rect x={-62} y={-42} width={124} height={84} rx={20} fill="#ffffff" {...kst(6)} />
                <text y={26} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={70} fill="#ff595e">10</text>
              </g>
            </g>
            {Array.from({ length: k }).map((_, j) => {
              const x = 900 + (j % 5) * 112;
              const y = 360 + Math.floor(j / 5) * 210;
              const at = S(L0) + 0.1 + j * Math.min(0.18, 1.2 / k);
              return <Bal key={j} x={x} y={y + bob(j + 10)} s={0.7 * EASE_OUT(prog(t, at, at + 0.3))} c={RAINBOW[j % RAINBOW.length]} n={11 + j} />;
            })}
          </g>
        )}
        <Kid spec={MILA} x={MILA_X} y={f} scale={0.6} expr={end ? 'laugh' : singing ? 'happy' : yourTurn ? 'smile' : 'happy'} look={[0.4, -0.2]}
          mouth={lipSync(SONG, 'mila', t)} armL={n ? 'count' : end ? 'up' : armSwap ? 'up' : 'wave'} armR={fR > 0 ? 'count' : end ? 'up' : n ? 'hip' : armSwap ? 'wave' : 'up'}
          fingersL={fL} fingersR={fR} hop={singing ? dance(0, 10) : dance(0, 18)} />
        <Critter spec={HOOT} x={HOOT_X} y={f} scale={0.42} expr={yourTurn ? 'happy' : 'laugh'} look={[0.4, -0.2]}
          armL={armSwap ? 'up' : 'wave'} armR={armSwap ? 'wave' : 'up'} hop={dance(1.2, 22)} />
        <Kid spec={LEO} x={LEO_X} y={f} scale={0.55} expr={yourTurn ? 'happy' : 'laugh'} look={[-0.4, -0.2]}
          armL={armSwap ? 'wave' : 'up'} armR={armSwap ? 'up' : 'clap'} hop={dance(0.6, 26)} />
        <Critter spec={BOBO} x={BOBO_X} y={f} scale={0.5} expr="laugh" look={[-0.4, -0.2]}
          armL={beat > 0.5 ? 'clap' : 'up'} armR={beat > 0.5 ? 'clap' : 'up'} hop={dance(1.8, 22)} />
      </KidsStage>
      <TitleCard t={t} from={0} to={1.4} title="COUNT TO 20" sub="a Tiny Sparks song" />
      {ch && <PopText t={t} at={S(ch.at + 2)} until={E(ch.at + 3) + 0.4} text={ch.from === 1 ? "NOW LET'S GO TO 20!" : 'COUNT WITH ME!'} y={130} size={90} color="#ffca3a" />}
      {n > 0 && <PopText key={`n${n}`} t={t} at={S(L0) - 0.1} until={S(L0 + 1) - 0.3} text={String(n)} x={400} y={190} size={190} color={RAINBOW[(n - 1) % RAINBOW.length]} />}
      {n > 0 && <PopText key={`p${n}`} t={t} at={S(L0) + 0.4} until={S(L0 + 1) - 0.3} text={`10 + ${k}`} x={400} y={340} size={80} color="#ffffff" rot={2} />}
      {n > 0 && <PopText key={`w${n}`} t={t} at={S(L0) + 0.8} until={S(L0 + 1) - 0.3} text={WORDS[n - 11]} x={W / 2} y={790} size={64} color="#ffffff" rot={-2} />}
      {yourTurn && <PopText t={t} at={E(L0) + 0.15} text="YOUR TURN!" x={1500} y={170} size={84} color="#ffca3a" />}
      {CHORUS.map((c) => <Confetti key={c.at} t={t} at={S(c.at + 1) + 2.4} y={300} dur={1.4} />)}
      <Confetti t={t} at={E(LAST)} y={300} />
      {end && <PopText t={t} at={E(LAST) + 0.2} text="YOU CAN COUNT TO 20!" y={260} size={110} color="#ffca3a" />}
      <SingAlong t={t} lines={SONG} />
    </>
  );
}
