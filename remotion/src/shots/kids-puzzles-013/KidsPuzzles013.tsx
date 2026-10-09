// TINY SPARKS · Day 13 · 🧩 Puzzles #2 — "Find the Missing Shape" (Short 9:16)
// kids-shorts/tiny-sparks/puzzles/day-013-find-the-missing-shape. Cues from VO via K (keys.gen.ts).
// Patterns on the chalkboard: ● ■ ● ■ ● ? (AB) → ▲ ★ ★ ▲ ★ ? (ABB) → SUPER: which piece fits the hole?
// Each: shapes pop in, light up as Hoot reads them → "What comes next?" → 5 s THINK timer (silence) →
// Leo's guess in a bubble (✗ on 1–2, ✓ on the super puzzle) → the answer lights up the pattern as it is
// said → a star on the YOU score strip. Shape names taught: circle, square, triangle, star, heart.
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

export const compositionConfig = { id: 'KidsPuzzles013', durationInSeconds: 88.1, fps: 30, width: 1080, height: 1920 };

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

type Kind = 'circle' | 'square' | 'triangle' | 'star' | 'heart';
const COL: Record<Kind, string> = { circle: '#ff595e', square: '#1982c4', triangle: '#8ac926', star: '#ffca3a', heart: '#ff6fa5' };

const Shape: React.FC<{ kind: Kind; r?: number; fill?: string; hole?: boolean }> = ({ kind, r = 52, fill, hole }) => {
  const c = fill ?? COL[kind];
  const st = hole ? { fill: '#3b2a4a', stroke: '#2a1d36', strokeWidth: 6 } : { fill: c, ...kst(7) };
  switch (kind) {
    case 'circle': return <circle r={r} {...st} />;
    case 'square': return <rect x={-r * 0.9} y={-r * 0.9} width={r * 1.8} height={r * 1.8} rx={10} {...st} />;
    case 'triangle': return <path d={`M 0,${-r} L ${r * 1.05},${r * 0.8} L ${-r * 1.05},${r * 0.8} Z`} {...st} strokeLinejoin="round" />;
    case 'star': return <g transform={`scale(${r / 52})`}><path d="M 0,-58 L 16,-18 L 58,-16 L 25,10 L 36,52 L 0,28 L -36,52 L -25,10 L -58,-16 L -16,-18 Z" {...st} strokeLinejoin="round" /></g>;
    case 'heart': return <g transform={`scale(${r / 52})`}><path d="M 0,50 C -70,0 -60,-50 -28,-50 C -10,-50 0,-36 0,-26 C 0,-36 10,-50 28,-50 C 60,-50 70,0 0,50 Z" {...st} strokeLinejoin="round" /></g>;
  }
};

type Puzzle = { row: Kind[]; intro: Key; read: Key | null; q: Key; leo: Key; ans: Key; next: Key; guess: Kind; ok: boolean; label: string; ansFrom: number };
const PUZ: Puzzle[] = [
  { row: ['circle', 'square', 'circle', 'square', 'circle', 'square'], intro: 'p1_intro', read: 'p1_read', q: 'p1_q', leo: 'p1_leo', ans: 'p1_ans', next: 'p2_intro', guess: 'triangle', ok: false, label: 'PUZZLE 1', ansFrom: 2 },
  { row: ['triangle', 'star', 'star', 'triangle', 'star', 'star'], intro: 'p2_intro', read: 'p2_read', q: 'p2_q', leo: 'p2_leo', ans: 'p2_ans', next: 'p3_intro', guess: 'triangle', ok: false, label: 'PUZZLE 2', ansFrom: 0 },
  { row: [], intro: 'p3_intro', read: null, q: 'p3_q', leo: 'p3_leo', ans: 'p3_ans', next: 'end', guess: 'heart', ok: true, label: 'SUPER PUZZLE!', ansFrom: -1 },
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
  for (let i = 0; i < n && i < w.length; i++) if (t >= w[i].start) lit = i + from;
  return lit;
};

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];
const OPTS: Kind[] = ['circle', 'heart', 'square'];

export default function KidsPuzzles013() {
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
  if (p && p.read) lit = Math.max(litBy(t, p.read, 0, 5), -1);
  if (p && p.ansFrom >= 0 && lit < 0) lit = litBy(t, p.ans, p.ansFrom, p.ansFrom === 0 ? 6 : 4);

  const leoExpr =
    p && thinking ? 'think'
    : p && within(t, guessAt(p), S(p.ans)) ? (p.ok || t < E(p.leo) + 0.4 ? 'laugh' : 'oops')
    : t >= S('end') ? 'laugh'
    : 'happy';

  // super puzzle: the heart piece flies into the hole on the answer
  const fly = EASE_INOUT(prog(t, S('p3_ans') + 0.2, S('p3_ans') + 1.1));
  const HOLE: [number, number] = [540, 560];

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
        {/* super puzzle: the shape board with a heart-shaped hole + 3 pieces */}
        {p && p.row.length === 0 && (
          <g>
            <g transform={`translate(${HOLE[0]},${HOLE[1]}) scale(${EASE_OUT(prog(t, S(p.intro) + 0.3, S(p.intro) + 0.7))})`}>
              <rect x={-170} y={-120} width={340} height={240} rx={30} fill="#e9c46a" {...kst(8)} />
              <Shape kind="heart" r={66} hole />
            </g>
            {OPTS.map((k, i) => {
              const x0 = 300 + i * 240;
              const y0 = 800;
              const isHeart = k === 'heart';
              const x = isHeart ? x0 + (HOLE[0] - x0) * fly : x0;
              const y = isHeart ? y0 + (HOLE[1] - y0) * fly : y0;
              const s = EASE_OUT(prog(t, S(p.intro) + 0.7 + i * 0.15, S(p.intro) + 1.0 + i * 0.15));
              return (
                <g key={k} transform={`translate(${x},${y}) scale(${s})`} opacity={solved && !isHeart ? 0.4 : 1}>
                  <Shape kind={k} r={isHeart ? 62 : 58} />
                </g>
              );
            })}
            {t >= S('p3_ans') + 1.1 && <AnswerMark t={t} at={S('p3_ans') + 1.1} until={S('end') - 0.3} ok x={HOLE[0] + 150} y={HOLE[1] - 110} size={0.6} />}
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
      <TitleCard t={t} from={0} to={1.2} title="SHAPES!" sub="Find the missing shape!" />
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
