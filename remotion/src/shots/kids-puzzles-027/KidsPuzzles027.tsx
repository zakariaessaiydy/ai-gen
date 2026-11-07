// TINY SPARKS · Day 27 · 🧩 Puzzles #4 — "Which Animal Doesn't Belong?" (Short 9:16)
// kids-shorts/tiny-sparks/puzzles/day-027-which-animal-doesn-t-belong. Cues from VO via K (keys.gen.ts).
// Odd-one-out with animals (classifying): 4 animal tiles per puzzle, each hops as Hoot reads it →
// "Which one doesn't belong?" → 5 s THINK timer (silence) → Leo's guess bubble (✗ on 1–2, ✓ on the super
// puzzle) → the odd tile pulses + ✓, every tile gets its group tag (CAT/DOG · FUR/FEATHERS · WATER/LAND) →
// a star on the YOU score strip. P1 by SOUND (3 cats meow, the dog says woof) · P2 by BODY (fur vs
// feathers + wings: the owl — "just like you, Professor Hoot!") · SUPER under the sea (3 fish + a lion).
// Hero outfits (Captain Leo, Professor Hoot).
import React from 'react';
import { Kid, kidFaceAt } from '../../lib/kids/kid';
import { Critter, type CritterSpec } from '../../lib/kids/critter';
import { CAPTION_COLORS, HOOT_HERO, LEO_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { AnswerMark, Bubble, Confetti, FONT_TOON, KidsCaptions, KidsStage, PopText, Star, ThinkTimer, TitleCard, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsPuzzles027', durationInSeconds: 98.2, fps: 30, width: 1080, height: 1920 };

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
const ROW_Y = 650;
const TILE_X = (i: number) => 180 + i * 240;

// ── the animals
const CATS: CritterSpec[] = [
  { id: 'cat-o', species: 'cat', fur: '#f4a261', fur2: '#fff1e0', dark: '#9c5a2b', iris: '#3a7d44' },
  { id: 'cat-w', species: 'cat', fur: '#ffffff', fur2: '#ffe3ec', dark: '#adb5bd', iris: '#1d72d8' },
  { id: 'cat-g', species: 'cat', fur: '#adb5bd', fur2: '#f1f3f5', dark: '#495057', iris: '#e0a458' },
];
const DOG: CritterSpec = { id: 'dog-b', species: 'dog', fur: '#c98f5f', fur2: '#f3dcc0', dark: '#6b4226' };
const BEAR: CritterSpec = { id: 'bear-z', species: 'bear', fur: '#a0673c', fur2: '#e9c9a8', dark: '#5a3a22' };
const OWL: CritterSpec = { id: 'owl-s', species: 'owl', fur: '#c98f5f', fur2: '#f3dcc0', dark: '#7f5539', iris: '#ffb703' };
const PIG: CritterSpec = { id: 'pig-p', species: 'pig', fur: '#ffb3c6', fur2: '#ffd6e2', dark: '#e07a9a' };
const BUNNY: CritterSpec = { id: 'bunny-c', species: 'bunny', fur: '#f1f3f5', fur2: '#ffffff', dark: '#adb5bd' };
const LION: CritterSpec = { id: 'lion-l', species: 'lion', fur: '#ffca3a', fur2: '#fff3b0', dark: '#e07a1f' };

const FISH_C = ['#ff924c', '#4cc9f0', '#ff6fa5'];
const Fish: React.FC<{ c: string; t: number; i: number }> = ({ c, t, i }) => (
  <g transform={`translate(0,${Math.sin(t * 2 + i) * 8})`}>
    <path d={`M -60,0 L -104,${-34 + Math.sin(t * 8 + i) * 8} L -104,${34 + Math.sin(t * 8 + i) * 8} Z`} fill={c} {...kst(6)} />
    <ellipse cx={0} cy={0} rx={72} ry={46} fill={c} {...kst(6)} />
    <path d="M -10,-44 Q 10,-74 34,-40" fill={c} {...kst(5)} />
    <circle cx={34} cy={-10} r={13} fill="#ffffff" {...kst(4)} />
    <circle cx={37} cy={-9} r={7} fill={KINK} />
    <circle cx={34} cy={-13} r={3} fill="#ffffff" />
    <path d="M 50,14 Q 58,20 64,10" fill="none" {...kst(4)} />
    <ellipse cx={-20} cy={-16} rx={18} ry={8} fill="#ffffff" opacity={0.35} />
  </g>
);

type Cell = { kind: 'critter'; spec: CritterSpec } | { kind: 'fish'; c: string };
type Puzzle = {
  cells: Cell[]; odd: number; guess: number; ok: boolean; water?: boolean;
  intro: Key; read: Key; q: Key; leo: Key; ans: Key; next: Key; label: string; tags: string[]; wordOf: (i: number) => number;
};
const PUZ: Puzzle[] = [
  {
    cells: [{ kind: 'critter', spec: CATS[0] }, { kind: 'critter', spec: CATS[1] }, { kind: 'critter', spec: DOG }, { kind: 'critter', spec: CATS[2] }],
    odd: 2, guess: 1, ok: false, intro: 'p1_intro', read: 'p1_read', q: 'p1_q', leo: 'p1_leo', ans: 'p1_ans', next: 'p2_intro',
    label: 'PUZZLE 1', tags: ['MEOW', 'MEOW', 'WOOF!', 'MEOW'], wordOf: (i) => i + 1,
  },
  {
    cells: [{ kind: 'critter', spec: BEAR }, { kind: 'critter', spec: OWL }, { kind: 'critter', spec: PIG }, { kind: 'critter', spec: BUNNY }],
    odd: 1, guess: 2, ok: false, intro: 'p2_intro', read: 'p2_read', q: 'p2_q', leo: 'p2_leo', ans: 'p2_ans', next: 'p3_intro',
    label: 'PUZZLE 2', tags: ['FUR', 'FEATHERS', 'FUR', 'FUR'], wordOf: (i) => i * 2 + 1,
  },
  {
    cells: [{ kind: 'fish', c: FISH_C[0] }, { kind: 'critter', spec: LION }, { kind: 'fish', c: FISH_C[1] }, { kind: 'fish', c: FISH_C[2] }],
    odd: 1, guess: 1, ok: true, water: true, intro: 'p3_intro', read: 'p3_read', q: 'p3_q', leo: 'p3_leo', ans: 'p3_ans', next: 'end',
    label: 'SUPER PUZZLE!', tags: ['WATER', 'LAND', 'WATER', 'WATER'], wordOf: (i) => i * 2 + 1,
  },
];
const guessAt = (p: Puzzle) => {
  const w = timeWords(VO[K[p.leo]]);
  // P1/P2: the guess lands on Leo's first words; SUPER: on "lion"
  return p.ok ? w[3].start - 0.1 : w[0].start - 0.1;
};
// which tile is being read right now (it hops)
const readLit = (t: number, p: Puzzle) => {
  if (!within(t, S(p.read), E(p.read) + 0.4)) return -1;
  const w = timeWords(VO[K[p.read]]);
  let lit = -1;
  for (let i = 0; i < 4; i++) {
    const wi = p.wordOf(i);
    if (w[wi] && t >= w[wi].start - 0.05) lit = i;
  }
  return lit;
};

const Cellview: React.FC<{ cell: Cell; t: number; i: number; hop: number; happy: boolean; dim: boolean }> = ({ cell, t, i, hop, happy, dim }) => {
  if (cell.kind === 'fish') return <g transform={`translate(0,${-110 - hop}) scale(1.2)`} opacity={dim ? 0.55 : 1}><Fish c={cell.c} t={t} i={i} /></g>;
  const tall = cell.spec.species === 'bunny' ? 0.28 : 0.35;
  return (
    <g opacity={dim ? 0.55 : 1}>
      <Critter spec={cell.spec} x={0} y={0} scale={tall} expr={happy ? 'laugh' : 'happy'} look={[0, 0]} hop={hop / tall} shadow={false} />
    </g>
  );
};

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

export default function KidsPuzzles027() {
  const t = useT();
  const cam = camAt(t, CAM);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const pi = PUZ.findIndex((p) => within(t, S(p.intro) - 0.2, S(p.next) - 0.3));
  const p = pi >= 0 ? PUZ[pi] : null;
  const thinking = p ? within(t, E(p.q), guessAt(p)) : false;
  const solved = p ? t >= S(p.ans) : false;
  const wrongNow = p && !p.ok ? within(t, guessAt(p), S(p.ans)) : false;
  const stars = PUZ.filter((q) => t >= S(q.ans) + 0.3).length;
  const lit = p ? readLit(t, p) : -1;

  const leoExpr =
    p && thinking ? 'think'
    : p && within(t, guessAt(p), S(p.ans)) ? (p.ok || t < E(p.leo) + 0.4 ? 'laugh' : 'oops')
    : t >= S('end') ? 'laugh'
    : 'happy';

  return (
    <>
      <KidsStage cam={cam}>
        <Meadow w={W} h={H} t={t} />
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
        {/* the four animal tiles */}
        {p &&
          p.cells.map((cell, i) => {
            const isOdd = i === p.odd;
            const pulse = solved && isOdd ? 1 + 0.08 * Math.sin((t - S(p.ans)) * 6) : 1;
            const s = EASE_OUT(prog(t, S(p.intro) + 0.4 + i * 0.15, S(p.intro) + 0.75 + i * 0.15)) * (lit === i ? 1.12 : 1) * pulse;
            const hop = lit === i ? Math.abs(Math.sin((t - S(p.read)) * 7)) * 40 : solved && isOdd ? Math.abs(Math.sin((t - S(p.ans)) * 5)) * 24 : 0;
            const ring = solved && isOdd;
            return (
              <g key={`${pi}-${i}`} transform={`translate(${TILE_X(i)},${ROW_Y}) scale(${s})`}>
                <defs>
                  <linearGradient id={`wt${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#7fd3f7" />
                    <stop offset="1" stopColor="#1d8fd1" />
                  </linearGradient>
                </defs>
                <rect x={-110} y={-165} width={220} height={330} rx={34} fill={p.water ? `url(#wt${i})` : '#fff8e7'} stroke={ring ? '#52b788' : KINK} strokeWidth={ring ? 14 : 7} />
                {p.water && (
                  <g>
                    <path d="M -108,112 Q -50,96 0,112 Q 50,128 108,110 L 108,130 Q 108,163 78,163 L -78,163 Q -108,163 -108,130 Z" fill="#f4d58d" />
                    <path d={`M -70,140 q ${-12 + Math.sin(t + i) * 6},-30 0,-60 q ${12 + Math.sin(t + i) * 6},-30 0,-60`} fill="none" stroke="#2a9d8f" strokeWidth={12} strokeLinecap="round" />
                    {[0, 1].map((k) => {
                      const q = ((t * 0.5 + k * 0.5 + i * 0.3) % 1);
                      return <circle key={k} cx={60 - k * 20} cy={120 - q * 250} r={8 + k * 3} fill="none" stroke="#ffffff" strokeWidth={4} opacity={1 - q} />;
                    })}
                  </g>
                )}
                <g transform="translate(0,150)">
                  <Cellview cell={cell} t={t} i={i} hop={hop} happy={lit === i || (solved && isOdd)} dim={solved && !isOdd} />
                </g>
                {/* the group tag appears with the answer */}
                {solved && (
                  <g transform={`translate(0,${206}) scale(${EASE_OUT(prog(t, S(p.ans) + 0.6 + (isOdd ? 0.6 : 0), S(p.ans) + 1.0 + (isOdd ? 0.6 : 0)))})`}>
                    <rect x={-104} y={-30} width={208} height={60} rx={24} fill={isOdd ? '#52b788' : '#ffffff'} {...kst(5)} />
                    <text y={14} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={p.tags[i].length > 6 ? 30 : 38} fill={isOdd ? '#ffffff' : KINK}>{p.tags[i]}</text>
                  </g>
                )}
                {/* a big ? wobbles over all four while you think */}
              </g>
            );
          })}
        {p && solved && <AnswerMark t={t} at={S(p.ans) + 0.2} until={S(p.next) - 0.3} ok x={TILE_X(p.odd) + 80} y={ROW_Y - 165} size={0.5} />}
        {/* Leo's guess bubble (shows the animal he picks) */}
        {p && within(t, guessAt(p) - 0.1, S(p.ans) + (p.ok ? 1.5 : 0)) && (
          <g>
            <Bubble x={LEO_X - 260} y={lfy - 190} w={210} h={210} tx={lfx - 120} ty={lfy - 40}>
              <g transform={`translate(${LEO_X - 260},${lfy - 120})`}>
                {p.cells[p.guess].kind === 'critter' ? (
                  <Critter spec={(p.cells[p.guess] as { spec: CritterSpec }).spec} x={0} y={0} scale={0.24} expr="happy" shadow={false} idle={false} />
                ) : null}
              </g>
            </Bubble>
            {wrongNow && t >= guessAt(p) + 0.6 && <AnswerMark t={t} at={guessAt(p) + 0.6} ok={false} x={LEO_X - 160} y={lfy - 285} size={0.5} />}
            {p.ok && t >= S(p.ans) && <AnswerMark t={t} at={S(p.ans)} ok x={LEO_X - 160} y={lfy - 285} size={0.5} />}
          </g>
        )}
        <Critter spec={HOOT_HERO} x={HOOT_X} y={f} scale={0.78}
          expr={within(t, S('p2_yay'), E('p2_yay') + 0.6) ? 'proud' : talks('hoot') ? 'happy' : t >= S('end') ? 'laugh' : 'smile'}
          look={thinking ? [0, 0] : [0.5, -0.5]} mouth={lipSync(VO, 'hoot', t)}
          armR={talks('hoot') && !!p ? 'point' : t >= S('bye') ? 'wave' : 'down'}
          armL={t >= S('end') || within(t, S('p2_yay'), E('p2_yay') + 0.6) ? 'up' : thinking ? 'think' : 'down'} />
        <Kid spec={LEO_HERO} x={LEO_X} y={f} scale={KID_S} expr={leoExpr} look={thinking ? [0, 0] : [-0.5, -0.4]} mouth={lipSync(VO, 'leo', t)}
          armL={thinking ? 'think' : t >= S('bye') ? 'wave' : p && within(t, S(p.leo), E(p.leo)) ? 'up' : 'down'}
          armR={t >= S('bye') ? 'wave' : within(t, S('p2_yay'), E('p2_yay')) ? 'point' : p && within(t, S(p.ans), S(p.next)) && talks('leo') ? 'up' : 'hip'}
          hop={p && p.ok && within(t, S(p.ans), S(p.ans) + 1.2) ? Math.abs(Math.sin((t - S(p.ans)) * 7)) * 40 : 0} />
      </KidsStage>
      <TitleCard t={t} from={0} to={1.2} title="ODD ONE OUT!" sub="Which animal doesn't belong?" />
      {PUZ.map((q) => (
        <PopText key={q.label} t={t} at={S(q.intro)} until={S(q.read) - 0.2} text={q.label} y={1000} size={q.ok ? 110 : 130} color={q.ok ? '#ff595e' : '#ffca3a'} />
      ))}
      {PUZ.map((q) => (
        <ThinkTimer key={q.label} t={t} from={E(q.q) + 0.1} to={guessAt(q) - 0.2} x={540} y={1000} label="THINK!" />
      ))}
      {PUZ.map((q) => (
        <Confetti key={q.label} t={t} at={S(q.ans) + 0.2} y={600} dur={1.4} />
      ))}
      <PopText t={t} at={S('p2_no') + 1.6} until={S('p2_ans') - 0.1} text="WHO HAS WINGS?" y={460} size={90} color="#ffffff" />
      <PopText t={t} at={S('end')} text="GREAT JOB!" y={610} size={130} color="#ffd166" />
      <Confetti t={t} at={S('end')} y={500} />
      <KidsCaptions lines={VO} t={t} colors={CAPTION_COLORS} />
    </>
  );
}
