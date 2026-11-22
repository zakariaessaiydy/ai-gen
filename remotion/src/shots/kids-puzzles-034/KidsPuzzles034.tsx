// TINY SPARKS · Day 34 · 🧩 Puzzles #5 — "Which Object Doesn't Belong?" (Short 9:16)
// kids-shorts/tiny-sparks/puzzles/day-034-which-object-doesn-t-belong. Cues from VO via K (keys.gen.ts).
// Odd-one-out with everyday THINGS (classifying), on Professor Hoot's classroom chalkboard: 4 picture cards
// per puzzle, each hops as Hoot reads it → "Which one doesn't belong?" → 5 s THINK timer (silence) → Leo's
// guess bubble (✗ on 1–2, ✓ on the super puzzle) → a clue → the odd card pulses + ✓, every card gets its
// group tag → a star on the YOU score strip. P1 FOOD (apple, banana, carrot — and a sock to WEAR) ·
// P2 SKY (plane, kite, balloon fly — the car DRIVES; flyers float up, the car rocks "beep beep") ·
// SUPER: SHAPES (ball, clock, plate are round and spin — the book is a square). Hero outfits. 3D kit (<Vol>).
import React from 'react';
import { Kid, kidFaceAt } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { CAPTION_COLORS, HOOT_HERO, LEO_HERO } from '../../lib/kids/cast/tiny-sparks';
import { Classroom, FLOOR } from '../../lib/kids/sets';
import { AnswerMark, Apple, Ball, Balloon, Bubble, Confetti, FONT_TOON, KidsCaptions, KidsStage, PopText, Star, ThinkTimer, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsPuzzles034', durationInSeconds: 101.3, fps: 30, width: 1080, height: 1920 };

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
const ROW_Y = 640; // the chalkboard's middle (Classroom board: y 422–883 on a 1920-tall stage)
const TILE_X = (i: number) => W / 2 + (i - 1.5) * 222;

// ── the objects (origin = centre, ~150 px; every solid shape in <Vol> so it sits in the 3D world)
const Banana = () => (
  <g transform="rotate(-18)">
    <Vol>
      <path d="M -58,-62 Q -78,46 34,66 Q 72,70 86,40 Q 60,44 30,38 Q -36,24 -34,-58 Z" fill="#ffd60a" {...kst(7)} />
    </Vol>
    <path d="M -46,-34 Q -42,20 20,44" fill="none" stroke="#e0a800" strokeWidth={6} strokeLinecap="round" opacity={0.7} />
    <rect x={-56} y={-82} width={20} height={26} rx={6} fill="#7a5230" {...kst(5)} />
    <circle cx={84} cy={44} r={7} fill="#7a5230" />
  </g>
);
const SOCK = 'M -34,-86 L 34,-86 L 34,24 Q 34,70 -6,72 L -62,72 Q -92,72 -92,44 Q -92,16 -60,10 L -34,4 Z';
const Sock = () => (
  <g transform="translate(18,0)">
    <Vol shape={<path d={SOCK} />}>
      <path d={SOCK} fill="#4cc9f0" {...kst(7)} />
      <g clipPath="url(#p34-sock)">
        <clipPath id="p34-sock">
          <path d={SOCK} />
        </clipPath>
        <rect x={-100} y={-86} width={200} height={28} fill="#ffffff" />
        {[-34, -4].map((y) => <rect key={y} x={-100} y={y} width={200} height={14} fill="#ff6fa5" />)}
        <ellipse cx={-80} cy={50} rx={26} ry={30} fill="#ff6fa5" />
        <ellipse cx={22} cy={52} rx={22} ry={26} fill="#ff6fa5" />
      </g>
      <path d={SOCK} fill="none" {...kst(7)} />
    </Vol>
  </g>
);
const Carrot = () => (
  <g transform="rotate(14)">
    <Vol>
      {[-28, 0, 28].map((a) => <ellipse key={a} cx={0} cy={-80} rx={13} ry={36} fill="#52b788" {...kst(5)} transform={`rotate(${a} 0 -52)`} />)}
    </Vol>
    <Vol kind="tube">
      <path d="M -34,-50 Q 0,-62 34,-50 Q 22,22 0,86 Q -22,22 -34,-50 Z" fill="#ff924c" {...kst(7)} />
    </Vol>
    {[-20, 6, 32].map((y) => <path key={y} d={`M ${-26 + y * 0.25},${y} l 14,4`} stroke="#c2570c" strokeWidth={5} strokeLinecap="round" />)}
  </g>
);
const Car: React.FC<{ rock?: number }> = ({ rock = 0 }) => (
  <g transform={`rotate(${rock}) translate(0,10)`}>
    <Vol>
      <path d="M -52,-24 Q -40,-70 0,-70 Q 40,-70 54,-24 Z" fill="#ff595e" {...kst(7)} />
    </Vol>
    <path d="M -36,-28 Q -28,-58 -4,-58 L -4,-28 Z M 6,-28 L 6,-58 Q 30,-58 40,-28 Z" fill="#bde0fe" {...kst(5)} />
    <Vol kind="slope">
      <rect x={-92} y={-30} width={184} height={58} rx={24} fill="#ff595e" {...kst(7)} />
    </Vol>
    <circle cx={-86} cy={-6} r={9} fill="#ffd166" {...kst(4)} />
    <Vol>
      <circle cx={-52} cy={30} r={26} fill="#3b2a4a" {...kst(6)} />
      <circle cx={52} cy={30} r={26} fill="#3b2a4a" {...kst(6)} />
    </Vol>
    <circle cx={-52} cy={30} r={10} fill="#ced4da" />
    <circle cx={52} cy={30} r={10} fill="#ced4da" />
  </g>
);
const Plane = () => (
  <g transform="rotate(-12)">
    <Vol>
      <path d="M -30,-6 L -6,-80 L 22,-80 L 18,-6 Z" fill="#1982c4" {...kst(6)} />
    </Vol>
    <Vol>
      <path d="M -96,-20 L -76,-58 L -58,-58 L -60,-14 Z" fill="#1982c4" {...kst(6)} />
      <ellipse cx={0} cy={0} rx={100} ry={30} fill="#ffffff" {...kst(7)} />
    </Vol>
    {[-36, -10, 16, 42].map((x) => <circle key={x} cx={x} cy={-6} r={8} fill="#4cc9f0" {...kst(3)} />)}
    <Vol>
      <path d="M -24,8 L 10,72 L 34,72 L 22,8 Z" fill="#1982c4" {...kst(6)} />
    </Vol>
  </g>
);
const Kite: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <path d={`M 0,74 Q ${-30 + Math.sin(t * 3) * 10},104 ${-6},126 Q ${24 + Math.sin(t * 3 + 1) * 10},146 ${-10},170`} fill="none" stroke={KINK} strokeWidth={4} />
    {[[-12, 104, '#ff595e'], [-2, 140, '#ffca3a']].map(([x, y, c]) => (
      <Vol key={String(y)}>
        <path d={`M ${x},${y} l -16,-10 l 0,20 Z M ${x},${y} l 16,-10 l 0,20 Z`} fill={String(c)} {...kst(3)} />
      </Vol>
    ))}
    <Vol shape={<path d="M 0,-84 L 64,-6 L 0,74 L -64,-6 Z" />}>
      <path d="M 0,-84 L 64,-6 L 0,-6 Z" fill="#ff6fa5" />
      <path d="M 0,-84 L -64,-6 L 0,-6 Z" fill="#ffca3a" />
      <path d="M 0,74 L 64,-6 L 0,-6 Z" fill="#4cc9f0" />
      <path d="M 0,74 L -64,-6 L 0,-6 Z" fill="#8ac926" />
      <path d="M 0,-84 L 64,-6 L 0,74 L -64,-6 Z" fill="none" {...kst(7)} />
    </Vol>
    <path d="M 0,-84 L 0,74 M -64,-6 L 64,-6" stroke={KINK} strokeWidth={4} />
  </g>
);
const Book = () => (
  <g>
    <Vol kind="slope">
      <rect x={-62} y={-70} width={136} height={140} rx={10} fill="#fff8e7" {...kst(6)} />
    </Vol>
    <Vol>
      <rect x={-74} y={-76} width={136} height={144} rx={12} fill="#2d9a5a" {...kst(7)} />
    </Vol>
    <rect x={-74} y={-76} width={26} height={144} rx={10} fill="#1f6f41" {...kst(5)} />
    <rect x={-34} y={-46} width={78} height={34} rx={8} fill="#ffffff" {...kst(4)} />
    <Star c="#ffd166" s={0.32} />
  </g>
);
const Clock: React.FC<{ spin: number }> = ({ spin }) => (
  <g transform={`rotate(${spin})`}>
    <Vol>
      <circle r={78} fill="#ff924c" {...kst(7)} />
    </Vol>
    <circle r={60} fill="#ffffff" {...kst(5)} />
    {[0, 90, 180, 270].map((a) => <rect key={a} x={-4} y={-56} width={8} height={14} rx={3} fill={KINK} transform={`rotate(${a})`} />)}
    <path d="M 0,0 L 0,-40 M 0,0 L 26,10" stroke={KINK} strokeWidth={8} strokeLinecap="round" />
    <circle r={7} fill="#ff595e" {...kst(3)} />
  </g>
);
const Plate: React.FC<{ spin: number }> = ({ spin }) => (
  <g transform={`rotate(${spin})`}>
    <Vol>
      <circle r={80} fill="#4cc9f0" {...kst(7)} />
    </Vol>
    <circle r={54} fill="#ffffff" stroke="#1982c4" strokeWidth={5} />
    {Array.from({ length: 8 }).map((_, i) => <circle key={i} cx={0} cy={-67} r={7} fill="#ffffff" transform={`rotate(${i * 45})`} />)}
  </g>
);

type Obj = 'apple' | 'banana' | 'sock' | 'carrot' | 'car' | 'plane' | 'kite' | 'balloon' | 'ball' | 'book' | 'clock' | 'plate';
type Puzzle = {
  objs: Obj[]; odd: number; guess: number; ok: boolean;
  intro: Key; read: Key; q: Key; leo: Key; ans: Key; next: Key; label: string; tags: string[];
};
const PUZ: Puzzle[] = [
  { objs: ['apple', 'banana', 'sock', 'carrot'], odd: 2, guess: 1, ok: false, intro: 'p1_intro', read: 'p1_read', q: 'p1_q', leo: 'p1_leo', ans: 'p1_ans', next: 'p2_intro', label: 'PUZZLE 1', tags: ['EAT', 'EAT', 'WEAR', 'EAT'] },
  { objs: ['car', 'plane', 'kite', 'balloon'], odd: 0, guess: 1, ok: false, intro: 'p2_intro', read: 'p2_read', q: 'p2_q', leo: 'p2_leo', ans: 'p2_ans', next: 'p3_intro', label: 'PUZZLE 2', tags: ['DRIVES', 'FLIES', 'FLIES', 'FLIES'] },
  { objs: ['ball', 'book', 'clock', 'plate'], odd: 1, guess: 1, ok: true, intro: 'p3_intro', read: 'p3_read', q: 'p3_q', leo: 'p3_leo', ans: 'p3_ans', next: 'end', label: 'SUPER PUZZLE!', tags: ['ROUND', 'SQUARE', 'ROUND', 'ROUND'] },
];
// the guess lands on Leo's first word (P1/P2) or on "book" (super puzzle: "I know! The book!")
const guessAt = (p: Puzzle) => {
  const w = timeWords(VO[K[p.leo]]);
  return p.ok ? w[3].start - 0.1 : w[0].start - 0.1;
};
// the clue lands on "Which…" in Hoot's "not quite" line; the wrong-guess bubble clears for it
const clueAt = (p: Puzzle) => {
  const no: Key = p.leo === 'p1_leo' ? 'p1_no' : 'p2_no';
  const w = timeWords(VO[K[no]]);
  return (w.find((x) => x.w.startsWith('Which')) ?? w[0]).start;
};
// which card is being read right now (it hops): "An apple... a banana..." → word 1, 3, 5, 7
const readLit = (t: number, p: Puzzle) => {
  if (!within(t, S(p.read), E(p.read) + 0.4)) return -1;
  const w = timeWords(VO[K[p.read]]);
  let lit = -1;
  for (let i = 0; i < 4; i++) if (w[i * 2 + 1] && t >= w[i * 2 + 1].start - 0.05) lit = i;
  return lit;
};

const ObjView: React.FC<{ o: Obj; t: number; act: number }> = ({ o, t, act }) => {
  // act = seconds since the answer (or -1): flyers float up, the car rocks, round things spin
  const a = Math.max(0, act);
  switch (o) {
    case 'apple': return <g transform="scale(0.95)"><Apple /></g>;
    case 'banana': return <Banana />;
    case 'sock': return <Sock />;
    case 'carrot': return <Carrot />;
    case 'car': return <Car rock={act >= 0 ? Math.sin(a * 9) * 6 : 0} />;
    case 'plane': return <g transform={`translate(0,${act >= 0 ? -Math.sin(a * 2.4) * 22 - 10 : 0})`}><Plane /></g>;
    case 'kite': return <g transform={`translate(0,${act >= 0 ? -Math.sin(a * 2.4 + 1) * 22 - 10 : 0}) scale(0.82) translate(0,-30)`}><Kite t={t} /></g>;
    case 'balloon': return <g transform={`translate(0,${act >= 0 ? -Math.sin(a * 2.4 + 2) * 22 - 10 : 0}) scale(1.05) translate(0,-30)`}><Balloon c="#8ac926" /></g>;
    case 'ball': return <Ball r={70} rot={act >= 0 ? a * 160 : 0} />;
    case 'book': return <Book />;
    case 'clock': return <Clock spin={act >= 0 ? a * 160 : 0} />;
    case 'plate': return <Plate spin={act >= 0 ? -a * 160 : 0} />;
  }
};

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

export default function KidsPuzzles034() {
  const t = useT();
  const cam = camAt(t, CAM);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const pi = PUZ.findIndex((p) => within(t, S(p.intro) - 0.2, S(p.next) - 0.3));
  const p = pi >= 0 ? PUZ[pi] : null;
  const thinking = p ? within(t, E(p.q), S(p.leo)) : false;
  const clue = PUZ.slice(0, 2).some((q) => within(t, clueAt(q), S(q.ans) - 0.1));
  const solved = p ? t >= S(p.ans) : false;
  const wrongNow = p && !p.ok ? within(t, guessAt(p), S(p.ans)) : false;
  const stars = PUZ.filter((q) => t >= S(q.ans) + 0.3).length;
  const lit = p ? readLit(t, p) : -1;
  const yay = within(t, S('p1_yay'), E('p1_yay') + 0.4) || within(t, S('p2_yay'), E('p2_yay') + 0.4);

  const leoExpr =
    p && thinking ? 'think'
    : p && within(t, guessAt(p), S(p.ans)) ? (p.ok || t < E(p.leo) + 0.4 ? 'laugh' : 'oops')
    : yay ? 'laugh'
    : t >= S('end') ? 'laugh'
    : 'happy';

  return (
    <>
      <KidsStage cam={cam}>
        <Classroom w={W} h={H} board={t < S('p1_intro') - 0.2 ? ['ODD ONE OUT?'] : []} />
        {/* score strip (the clue takes its place while it shows) */}
        <g transform="translate(540,272)" opacity={clue ? 0 : 1}>
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
        {/* the four picture cards, pinned on the chalkboard */}
        {p &&
          p.objs.map((o, i) => {
            const isOdd = i === p.odd;
            const pulse = solved && isOdd ? 1 + 0.08 * Math.sin((t - S(p.ans)) * 6) : 1;
            const s = EASE_OUT(prog(t, S(p.intro) + 1.2 + i * 0.15, S(p.intro) + 1.55 + i * 0.15)) * (lit === i ? 1.1 : 1) * pulse;
            const hop = lit === i ? Math.abs(Math.sin((t - S(p.read)) * 7)) * 30 : 0;
            const ring = solved && isOdd;
            const act = solved ? t - S(p.ans) - 0.6 : -1;
            return (
              <g key={`${pi}-${i}`} transform={`translate(${TILE_X(i)},${ROW_Y}) scale(${s})`}>
                <g opacity={solved && !isOdd ? 0.6 : 1}>
                  <Vol kind="slope">
                    <rect x={-100} y={-150} width={200} height={300} rx={30} fill="#fff8e7" stroke={ring ? '#52b788' : KINK} strokeWidth={ring ? 14 : 7} />
                  </Vol>
                  {/* the pin */}
                  <Vol>
                    <circle cx={0} cy={-128} r={12} fill={['#ff595e', '#1982c4', '#ffca3a', '#8ac926'][i]} {...kst(4)} />
                  </Vol>
                  <g transform={`translate(0,${-6 - hop})`}>
                    <ObjView o={o} t={t} act={act} />
                  </g>
                </g>
                {/* the group tag appears with the answer */}
                {solved && (
                  <g transform={`translate(0,${150}) scale(${EASE_OUT(prog(t, S(p.ans) + 0.6 + (isOdd ? 0.6 : 0), S(p.ans) + 1.0 + (isOdd ? 0.6 : 0)))})`}>
                    <rect x={-96} y={-30} width={192} height={60} rx={24} fill={isOdd ? '#52b788' : '#ffffff'} {...kst(5)} />
                    <text y={14} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={p.tags[i].length > 5 ? 34 : 40} fill={isOdd ? '#ffffff' : KINK}>{p.tags[i]}</text>
                  </g>
                )}
              </g>
            );
          })}
        {p && solved && <AnswerMark t={t} at={S(p.ans) + 0.2} until={S(p.next) - 0.3} ok x={TILE_X(p.odd) + 78} y={ROW_Y - 150} size={0.5} />}
        {/* Leo's guess bubble (shows the thing he picks) */}
        {p && within(t, guessAt(p) - 0.1, p.ok ? S(p.ans) + 1.5 : clueAt(p) - 0.05) && (
          <g>
            <Bubble x={LEO_X - 260} y={lfy - 190} w={210} h={210} tx={lfx - 120} ty={lfy - 40}>
              <g transform={`translate(${LEO_X - 260},${lfy - 190}) scale(0.62)`}>
                <ObjView o={p.objs[p.guess]} t={t} act={-1} />
              </g>
            </Bubble>
            {wrongNow && t >= guessAt(p) + 0.6 && <AnswerMark t={t} at={guessAt(p) + 0.6} ok={false} x={LEO_X - 160} y={lfy - 285} size={0.5} />}
            {p.ok && t >= S(p.ans) && <AnswerMark t={t} at={S(p.ans)} ok x={LEO_X - 160} y={lfy - 285} size={0.5} />}
          </g>
        )}
        <Critter spec={HOOT_HERO} x={HOOT_X} y={f} scale={0.78}
          expr={talks('hoot') ? 'happy' : t >= S('end') ? 'laugh' : yay ? 'laugh' : 'smile'}
          look={thinking ? [0, 0] : [0.5, -0.5]} mouth={lipSync(VO, 'hoot', t)}
          armR={talks('hoot') && !!p ? 'point' : t >= S('bye') ? 'wave' : 'down'}
          armL={t >= S('end') ? 'up' : thinking ? 'think' : 'down'} />
        <Kid spec={LEO_HERO} x={LEO_X} y={f} scale={KID_S} expr={leoExpr} look={thinking ? [0, 0] : [-0.5, -0.4]} mouth={lipSync(VO, 'leo', t)}
          armL={thinking ? 'think' : t >= S('bye') ? 'wave' : p && within(t, S(p.leo), E(p.leo)) ? 'up' : yay ? 'clap' : 'down'}
          armR={t >= S('bye') ? 'wave' : yay ? 'clap' : p && within(t, S(p.ans), S(p.next)) && talks('leo') ? 'up' : 'hip'}
          hop={(p && p.ok && within(t, S(p.ans), S(p.ans) + 1.2)) || yay ? Math.abs(Math.sin((t - (yay ? S(pi === 0 ? 'p1_yay' : 'p2_yay') : S(p ? p.ans : 'end'))) * 7)) * 34 : 0} />
      </KidsStage>
      {PUZ.map((q) => (
        <PopText key={q.label} t={t} at={S(q.intro)} until={S(q.intro) + 1.2} text={q.label} y={ROW_Y} size={q.ok ? 110 : 130} color={q.ok ? '#ff595e' : '#ffca3a'} />
      ))}
      {PUZ.map((q) => (
        <ThinkTimer key={q.label} t={t} from={E(q.q) + 0.1} to={S(q.leo) - 0.2} x={540} y={1000} r={100} label="THINK!" />
      ))}
      {PUZ.map((q) => (
        <Confetti key={q.label} t={t} at={S(q.ans) + 0.2} y={600} dur={1.4} />
      ))}
      <PopText t={t} at={clueAt(PUZ[0])} until={S('p1_ans') - 0.1} text="CAN WE EAT IT?" y={272} size={86} color="#ff924c" />
      <PopText t={t} at={clueAt(PUZ[1])} until={S('p2_ans') - 0.1} text="CAN IT FLY?" y={272} size={96} color="#4cc9f0" />
      <PopText t={t} at={S('end')} text="SUPER THINKER!" y={ROW_Y} size={110} color="#ffd166" />
      <Confetti t={t} at={S('end')} y={500} />
      <KidsCaptions lines={VO} t={t} colors={CAPTION_COLORS} />
    </>
  );
}
