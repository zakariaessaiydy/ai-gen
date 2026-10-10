// TINY SPARKS · Day 6 · 🧩 Puzzles #1 — "Find the Missing Number" (Short 9:16)
// kids-shorts/tiny-sparks/puzzles/day-006-find-the-missing-number. Cues from VO via K (keys.gen.ts).
// 3 puzzles on the chalkboard: 1 2 ? 4 → 5 6 7 ? → ? 2 3 4 (super). Each: SHOW (tiles + counting dots)
// → Hoot counts + asks → 5 s THINK timer (silence) → Leo's guess (✗ on 1–2, ✓ on the super puzzle)
// → reveal (dots appear, tiles light up as Hoot counts) → a star on the YOU score strip.
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { kidFaceAt } from '../../lib/kids/kid';
import { CAPTION_COLORS, HOOT, LEO } from '../../lib/kids/cast/tiny-sparks';
import { Classroom, FLOOR } from '../../lib/kids/sets';
import { AnswerMark, Bubble, Confetti, FONT_TOON, KidsCaptions, KidsStage, PopText, RAINBOW, Star, ThinkTimer, TitleCard, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsPuzzles006', durationInSeconds: 84.6, fps: 30, width: 1080, height: 1920 };

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
const TILE_Y = 600;
const TILE_X = (i: number) => 225 + i * 210;

type Puzzle = { nums: number[]; miss: number; intro: Key; count: Key; q: Key; leo: Key; ans: Key; next: Key; guess: string; ok: boolean; label: string; countFrom: number };
const PUZ: Puzzle[] = [
  { nums: [1, 2, 3, 4], miss: 2, intro: 'p1_intro', count: 'p1_count', q: 'p1_q', leo: 'p1_leo', ans: 'p1_ans', next: 'p2_intro', guess: '5', ok: false, label: 'PUZZLE 1', countFrom: 2 },
  { nums: [5, 6, 7, 8], miss: 3, intro: 'p2_intro', count: 'p2_count', q: 'p2_q', leo: 'p2_leo', ans: 'p2_ans', next: 'p3_intro', guess: '9', ok: false, label: 'PUZZLE 2', countFrom: 0 },
  { nums: [1, 2, 3, 4], miss: 0, intro: 'p3_intro', count: 'p3_count', q: 'p3_q', leo: 'p3_leo', ans: 'p3_ans', next: 'end', guess: '1', ok: true, label: 'SUPER PUZZLE!', countFrom: -1 },
];
// the moment Leo's guess appears in his bubble (on the number, after "I know this one!")
const guessAt = (p: Puzzle) => {
  const w = timeWords(VO[K[p.leo]]);
  return w[w.length - 1].start;
};

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

const Tile: React.FC<{ t: number; at: number; x: number; n: number; shown: boolean; color: string; lit: boolean; q: boolean }> = ({ t, at, x, n, shown, color, lit, q }) => {
  const s = EASE_OUT(prog(t, at, at + 0.35)) * (lit ? 1.12 : 1) * (q && !shown ? 1 + 0.05 * Math.sin(t * 6) : 1);
  return (
    <g transform={`translate(${x},${TILE_Y}) scale(${s})`}>
      <rect x={-88} y={-100} width={176} height={200} rx={34} fill={shown ? color : '#ffffff'} {...kst(8)} />
      <text y={46} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={140} fill={shown ? '#ffffff' : '#adb5bd'} stroke={shown ? KINK : 'none'} strokeWidth={6} paintOrder="stroke">
        {shown ? n : '?'}
      </text>
      {/* counting dots: as many as the number */}
      {shown &&
        Array.from({ length: n }).map((_, i) => (
          <circle key={i} cx={-60 + (i % 4) * 40} cy={150 + Math.floor(i / 4) * 40} r={15} fill="#ffd166" {...kst(4)} />
        ))}
    </g>
  );
};

export default function KidsPuzzles006() {
  const t = useT();
  const cam = camAt(t, CAM);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const pi = PUZ.findIndex((p) => within(t, S(p.intro) - 0.2, S(p.next) - 0.3));
  const p = pi >= 0 ? PUZ[pi] : null;
  const thinking = p ? within(t, E(p.q), guessAt(p)) : false;
  const solved = p ? t >= S(p.ans) : false;
  const wrongNow = p && !p.ok ? within(t, guessAt(p), S(p.ans)) : false;

  // which tile is lit while Hoot counts the answer line
  let lit = -1;
  if (p && p.countFrom >= 0 && within(t, S(p.ans), E(p.ans) + 0.3)) {
    const w = timeWords(VO[K[p.ans]]);
    for (let i = 0; i < 4; i++) if (w[p.countFrom + i] && t >= w[p.countFrom + i].start) lit = i;
  }
  if (p && p.ok && within(t, S(p.ans), S(p.ans) + 1.5)) lit = p.miss;
  const stars = PUZ.filter((q) => t >= S(q.ans) + 0.3).length;

  const leoExpr =
    p && thinking ? 'think'
    : p && within(t, guessAt(p), S(p.ans)) ? (p.ok || t < E(p.leo) + 0.4 ? 'laugh' : 'oops')
    : t >= S('end') ? 'laugh'
    : 'happy';

  return (
    <>
      <KidsStage cam={cam}>
        <Classroom w={W} h={H} />
        {/* score strip */}
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
        {p && (
          <g>
            {p.nums.map((n, i) => (
              <Tile key={`${pi}-${i}`} t={t} at={S(p.intro) + 0.4 + i * 0.15} x={TILE_X(i)} n={n} shown={i !== p.miss || solved}
                color={RAINBOW[(n - 1) % RAINBOW.length]} lit={lit === i} q={i === p.miss} />
            ))}
            {solved && <AnswerMark t={t} at={S(p.ans)} until={S(p.next) - 0.3} ok x={TILE_X(p.miss) + 70} y={TILE_Y - 110} size={0.6} />}
          </g>
        )}
        {/* Leo's guess bubble */}
        {p && within(t, guessAt(p) - 0.1, S(p.ans) + (p.ok ? 1.5 : 0)) && (
          <g>
            <Bubble x={LEO_X - 260} y={lfy - 170} w={200} h={160} tx={lfx - 120} ty={lfy - 40} text={p.guess} size={110} />
            {wrongNow && t >= guessAt(p) + 0.6 && <AnswerMark t={t} at={guessAt(p) + 0.6} ok={false} x={LEO_X - 180} y={lfy - 250} size={0.55} />}
            {p.ok && <AnswerMark t={t} at={S(p.ans)} ok x={LEO_X - 180} y={lfy - 250} size={0.55} />}
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
      <TitleCard t={t} from={0} to={1.2} title="1 2 ? 4" sub="Find the missing number!" />
      {PUZ.map((q) => (
        <PopText key={q.label} t={t} at={S(q.intro)} until={S(q.count) - 0.2} text={q.label} y={1000} size={q.ok ? 110 : 130} color={q.ok ? '#ff595e' : '#ffca3a'} />
      ))}
      {PUZ.map((q) => (
        <ThinkTimer key={q.label} t={t} from={E(q.q) + 0.1} to={guessAt(q) - 0.2} x={540} y={980} label="THINK!" />
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
