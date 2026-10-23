// TINY SPARKS · Day 20 · 🧩 Puzzles #3 — "Find the Missing Color" (Short 9:16)
// kids-shorts/tiny-sparks/puzzles/day-020-find-the-missing-color. Cues from VO via K (keys.gen.ts).
// Colour patterns on the chalkboard: red blue red blue red ? (AB) → yellow yellow green yellow yellow ?
// (AAB) → SUPER: a rainbow with a missing stripe (blue). Each: paint dots light up as Hoot reads them →
// "What color comes next?" → 5 s THINK timer (silence) → Leo's guess bubble (✗ on 1–2, ✓ on the super
// puzzle) → the answer lights the pattern as it is said → a star on the YOU score strip.
import React from 'react';
import { Kid, kidFaceAt } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { CAPTION_COLORS, HOOT, LEO } from '../../lib/kids/cast/tiny-sparks';
import { Classroom, FLOOR } from '../../lib/kids/sets';
import { AnswerMark, Bubble, Confetti, FONT_TOON, KidsCaptions, KidsStage, PopText, Star, ThinkTimer, TitleCard, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsPuzzles020', durationInSeconds: 90.0, fps: 30, width: 1080, height: 1920 };

const W = 1080;
const H = 1920;
const f = FLOOR(H);
type Key = keyof typeof K;
const S = (k: Key) => VO[K[k]].start;
const E = (k: Key) => VO[K[k]].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;

const HOOT_X = 290;
const LEO_X = 810;
const KID_S = 0.8;
const [lfx, lfy] = kidFaceAt(LEO_X, f, KID_S);
const ROW_Y = 640;
const TILE_X = (i: number) => 190 + i * 140;

type Kind = 'red' | 'blue' | 'yellow' | 'green' | 'orange' | 'purple';
const COL: Record<Kind, string> = { red: '#e63946', blue: '#1d72d8', yellow: '#ffd60a', green: '#52b788', orange: '#ff8c1a', purple: '#7b2cbf' };
// a paint splat in one colour
const Shape: React.FC<{ kind: Kind; r?: number }> = ({ kind, r = 52 }) => (
  <g transform={`scale(${r / 52})`}>
    <path d="M 0,-50 C 26,-52 34,-30 48,-26 C 62,-20 54,6 50,18 C 46,34 30,52 6,48 C -14,58 -40,46 -46,26 C -60,14 -58,-12 -44,-26 C -32,-44 -18,-50 0,-50 Z" fill={COL[kind]} {...kst(7)} />
    <ellipse cx={-16} cy={-20} rx={10} ry={14} fill="#ffffff" opacity={0.45} />
  </g>
);
const ARC: Kind[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

type Puzzle = { row: Kind[]; intro: Key; read: Key | null; q: Key; leo: Key; ans: Key; next: Key; guess: Kind; ok: boolean; label: string; ansFrom: number };
const PUZ: Puzzle[] = [
  { row: ['red', 'blue', 'red', 'blue', 'red', 'blue'], intro: 'p1_intro', read: 'p1_read', q: 'p1_q', leo: 'p1_leo', ans: 'p1_ans', next: 'p2_intro', guess: 'red', ok: false, label: 'PUZZLE 1', ansFrom: 2 },
  { row: ['yellow', 'yellow', 'green', 'yellow', 'yellow', 'green'], intro: 'p2_intro', read: 'p2_read', q: 'p2_q', leo: 'p2_leo', ans: 'p2_ans', next: 'p3_intro', guess: 'yellow', ok: false, label: 'PUZZLE 2', ansFrom: 0 },
  { row: [], intro: 'p3_intro', read: 'p3_read', q: 'p3_q', leo: 'p3_leo', ans: 'p3_ans', next: 'end', guess: 'blue', ok: true, label: 'SUPER PUZZLE!', ansFrom: -1 },
];
const guessAt = (p: Puzzle) => {
  const w = timeWords(VO[K[p.leo]]);
  return w[w.length - 1].start - (p.ok ? 0.2 : 0);
};
// which tile is lit by the spoken words of a line (word i → tile i + from)
const litBy = (t: number, k: Key, from: number, n: number) => {
  if (!within(t, S(k), E(k) + 0.3)) return -1;
  const w = timeWords(VO[K[k]]);
  let lit = -1;
  let rainbowLit = -1;
  if (within(t, S('p3_read'), E('p3_read') + 0.3)) {
    const w = timeWords(VO[K.p3_read]);
    const map = [0, 1, 2, 3, -1, 5];
    for (let i = 0; i < w.length && i < 6; i++) if (t >= w[i].start) rainbowLit = map[i];
  }
  for (let i = 0; i < n && i < w.length; i++) if (t >= w[i].start) lit = i + from;
  return lit;
};

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

export default function KidsPuzzles020() {
  const t = useT();
  const cam = camAt(t, CAM);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const pi = PUZ.findIndex((p) => within(t, S(p.intro) - 0.2, S(p.next) - 0.3));
  const p = pi >= 0 ? PUZ[pi] : null;
  const thinking = p ? within(t, E(p.q), guessAt(p)) : false;
  const solved = p ? t >= S(p.ans) : false;
  const wrongNow = p && !p.ok ? within(t, guessAt(p), S(p.ans)) : false;
  const stars = PUZ.filter((q) => t >= S(q.ans) + 0.3).length;

  let lit = -1;
  let rainbowLit = -1;
  if (within(t, S('p3_read'), E('p3_read') + 0.3)) {
    const w = timeWords(VO[K.p3_read]);
    const map = [0, 1, 2, 3, -1, 5];
    for (let i = 0; i < w.length && i < 6; i++) if (t >= w[i].start) rainbowLit = map[i];
  }
  if (p && p.read && p.row.length) lit = Math.max(litBy(t, p.read, 0, 5), -1);
  if (p && p.ansFrom >= 0 && lit < 0) lit = litBy(t, p.ans, p.ansFrom, p.ansFrom === 0 ? 6 : 4);

  const leoExpr =
    p && thinking ? 'think'
    : p && within(t, guessAt(p), S(p.ans)) ? (p.ok || t < E(p.leo) + 0.4 ? 'laugh' : 'oops')
    : t >= S('end') ? 'laugh'
    : 'happy';


  return (
    <>
      <KidsStage cam={cam}>
        <Classroom w={W} h={H} />
        <g transform="translate(540,250)">
          <rect x={-300} y={-62} width={600} height={124} rx={60} fill="#ffffff" {...kst(7)} />
          <text x={-190} y={22} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={60} fill={KINK}>YOU</text>
          {[0, 1, 2].map((i) => {
            const on = i < stars;
            const pop = on ? EASE_OUT(prog(t, S(PUZ[i].ans) + 0.3, S(PUZ[i].ans) + 0.7)) : 0;
            return (
              <g key={i} transform={`translate(${-40 + i * 125},0) scale(${0.62 * (1 + 0.3 * Math.sin(pop * Math.PI))})`}>
                <Star c={on ? '#ffd166' : '#e9ecef'} />
              </g>
            );
          })}
        </g>
        {/* pattern rows */}
        {p && p.row.length > 0 &&
          p.row.map((k, i) => {
            const miss = i === 5;
            const shown = !miss || solved;
            const s = EASE_OUT(prog(t, S(p.intro) + 0.4 + i * 0.15, S(p.intro) + 0.75 + i * 0.15)) * (lit === i ? 1.22 : 1);
            return (
              <g key={`${pi}-${i}`} transform={`translate(${TILE_X(i)},${ROW_Y}) scale(${s})`}>
                <rect x={-62} y={-66} width={124} height={132} rx={24} fill={miss && !shown ? '#ffffff' : '#fff8e7'} {...kst(6)} />
                {shown ? <Shape kind={k} r={44} /> : (
                  <text y={34} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={96} fill="#adb5bd" transform={`scale(${1 + 0.06 * Math.sin(t * 6)})`}>?</text>
                )}
              </g>
            );
          })}
        {p && p.row.length > 0 && solved && <AnswerMark t={t} at={S(p.ans)} until={S(p.next) - 0.3} ok x={TILE_X(5) + 50} y={ROW_Y - 80} size={0.55} />}
        {/* super puzzle: a rainbow with a missing (blue) stripe */}
        {p && p.row.length === 0 && (
          <g transform={`translate(540,790) scale(${EASE_OUT(prog(t, S(p.intro) + 0.3, S(p.intro) + 0.8))})`}>
            {ARC.map((k, i) => {
              const r = 330 - i * 42;
              const miss = k === 'blue';
              const fill = miss ? EASE_OUT(prog(t, S('p3_ans') + 0.2, S('p3_ans') + 0.9)) : 1;
              const lit = rainbowLit === i;
              return (
                <g key={k}>
                  <path d={`M ${-r},0 A ${r},${r} 0 0,1 ${r},0`} fill="none" stroke={KINK} strokeWidth={46} />
                  <path d={`M ${-r},0 A ${r},${r} 0 0,1 ${r},0`} fill="none" stroke={miss ? '#ffffff' : COL[k]} strokeWidth={lit ? 40 : 34} strokeDasharray={miss ? '18 14' : undefined} />
                  {miss && fill > 0 && <path d={`M ${-r},0 A ${r},${r} 0 0,1 ${r},0`} fill="none" stroke={COL.blue} strokeWidth={34} pathLength={1} strokeDasharray={`${fill} 1`} />}
                </g>
              );
            })}
            {[-1, 1].map((k) => (
              <g key={k} transform={`translate(${k * 300},10)`}>
                {[[-40, 0, 46], [0, -20, 56], [44, 0, 44]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#ffffff" {...kst(6)} />)}
              </g>
            ))}
            {!solved && <text x={0} y={-100} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={90} fill="#adb5bd" transform={`scale(${1 + 0.06 * Math.sin(t * 6)})`}>?</text>}
            {t >= S('p3_ans') + 0.9 && <AnswerMark t={t} at={S('p3_ans') + 0.9} until={S('end') - 0.3} ok x={0} y={-160} size={0.6} />}
          </g>
        )}
        {/* Leo's guess bubble (shows the shape he says) */}
        {p && within(t, guessAt(p) - 0.1, S(p.ans) + (p.ok ? 1.5 : 0)) && (
          <g>
            <Bubble x={LEO_X - 260} y={lfy - 170} w={200} h={170} tx={lfx - 120} ty={lfy - 40}>
              <g transform={`translate(${LEO_X - 260},${lfy - 170})`}><Shape kind={p.guess} r={48} /></g>
            </Bubble>
            {wrongNow && t >= guessAt(p) + 0.6 && <AnswerMark t={t} at={guessAt(p) + 0.6} ok={false} x={LEO_X - 180} y={lfy - 255} size={0.55} />}
            {p.ok && t >= S(p.ans) && <AnswerMark t={t} at={S(p.ans)} ok x={LEO_X - 180} y={lfy - 255} size={0.55} />}
          </g>
        )}
        <Critter spec={HOOT} x={HOOT_X} y={f} scale={0.78} expr={talks('hoot') ? 'happy' : t >= S('end') ? 'laugh' : 'smile'}
          look={thinking ? [0, 0] : [0.5, -0.5]} mouth={lipSync(VO, 'hoot', t)}
          armR={talks('hoot') && !!p ? 'point' : t >= S('bye') ? 'wave' : 'down'} armL={t >= S('end') ? 'up' : thinking ? 'think' : 'down'} />
        <Kid spec={LEO} x={LEO_X} y={f} scale={KID_S} expr={leoExpr} look={thinking ? [0, 0] : [-0.5, -0.4]} mouth={lipSync(VO, 'leo', t)}
          armL={thinking ? 'think' : t >= S('bye') ? 'wave' : p && within(t, S(p.leo), E(p.leo)) ? 'up' : 'down'}
          armR={t >= S('bye') ? 'wave' : p && within(t, S(p.ans), S(p.next)) && talks('leo') ? 'up' : 'hip'}
          hop={p && p.ok && within(t, S(p.ans), S(p.ans) + 1.2) ? Math.abs(Math.sin((t - S(p.ans)) * 7)) * 40 : 0} />
      </KidsStage>
      <TitleCard t={t} from={0} to={1.2} title="COLORS!" sub="Find the missing color!" />
      {PUZ.map((q) => (
        <PopText key={q.label} t={t} at={S(q.intro)} until={S(q.read ?? q.q) - 0.2} text={q.label} y={1000} size={q.ok ? 110 : 130} color={q.ok ? '#ff595e' : '#ffca3a'} />
      ))}
      {PUZ.map((q) => (
        <ThinkTimer key={q.label} t={t} from={E(q.q) + 0.1} to={guessAt(q) - 0.2} x={540} y={1000} label="THINK!" />
      ))}
      {PUZ.map((q) => (
        <Confetti key={q.label} t={t} at={S(q.ans) + 0.2} y={600} dur={1.4} />
      ))}
      <PopText t={t} at={S('end')} text="GREAT JOB!" y={610} size={130} color="#ffd166" />
      <Confetti t={t} at={S('end')} y={500} />
      <KidsCaptions lines={VO} t={t} colors={CAPTION_COLORS} />
    </>
  );
}
