// TINY SPARKS · Day 41 · 🧩 Puzzles #6 — "Find the Different Animal" (Short 9:16, 1:32)
// kids-shorts/tiny-sparks/puzzles/day-041-find-the-different-animal. Cues from VO via K (keys.gen.ts).
// OBSERVATION: 4 animals of the SAME kind stand on a little stage; ONE detail is different (big, phone-readable).
// P1 kittens — one is orange (colour) · P2 bunnies — one wears a crown, the others bows (accessory) · SUPER: four
// bears — which is Bobo? only one wears the red scarf. Each: animals hop in → "Which one is different?" → 5 s THINK
// (tick-tock, silence) → Leo's guess (marker over the animal he picks; ✗ on 1–2, ✓ on the super puzzle) → a clue →
// the odd one hops + glows + ✓, the detail gets a callout → a star on the score strip. Energy layer (Short: no ident).
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter, type CritterSpec } from '../../lib/kids/critter';
import { CAPTION_COLORS, HOOT_HERO, LEO_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { AnswerMark, Confetti, FONT_TOON, KidsCaptions, PopText, Star, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, ImpactStar, StageWord, StarWipe, directorCam, hopAt, onBeat, type Shot } from '../../lib/kids/energy';
import { EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsPuzzles041', durationInSeconds: 92.2, fps: 30, width: 1080, height: 1920 };

const W = 1080;
const H = 1920;
const f = FLOOR(H);
type Key = keyof typeof K;
const S = (k: Key) => VO[K[k]].start;
const E = (k: Key) => VO[K[k]].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;
const word = (k: Key, i: number) => {
  const w = timeWords(VO[K[k]]);
  return (w[Math.min(i, w.length - 1)] ?? { start: S(k) }).start;
};
const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (EASE_OUT(p) - 1) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};

const ROW = 900; // the animals' feet
const AX = (i: number) => W / 2 + (i - 1.5) * 238;
const AS = 0.48;
const HOOT_X = 210;
const LEO_X = 860;

// ── the animals (same kind, ONE big difference)
const CAT: CritterSpec = { id: 'k', species: 'cat', fur: '#b8c0cc', fur2: '#f1f3f5', dark: '#6c757d' };
const CAT_ODD: CritterSpec = { ...CAT, fur: '#ff924c', fur2: '#ffe5c9', dark: '#c2570c' };
const BUN: CritterSpec = { id: 'b', species: 'bunny', fur: '#ffffff', fur2: '#ffe3ec', dark: '#ff8fab', bow: '#ff6fa5' };
const BUN_ODD: CritterSpec = { ...BUN, bow: undefined, hat: 'crown' };
const BEAR: CritterSpec = { id: 'r', species: 'bear', fur: '#b07947', fur2: '#f1d1a8', dark: '#6b4226' };
const BOBO: CritterSpec = { ...BEAR, scarf: '#ff595e' };

type Puzzle = { a: CritterSpec; odd: CritterSpec; oddI: number; guess: number; ok: boolean; intro: Key; q: Key; leo: Key; no?: Key; ans: Key; next: Key; label: string; call: string; callC: string; clue: string };
const PUZ: Puzzle[] = [
  { a: CAT, odd: CAT_ODD, oddI: 2, guess: 1, ok: false, intro: 'p1_intro', q: 'p1_q', leo: 'p1_leo', no: 'p1_no', ans: 'p1_ans', next: 'p2_intro', label: 'PUZZLE 1', call: 'ORANGE!', callC: '#ff924c', clue: 'LOOK AT THE COLORS!' },
  { a: BUN, odd: BUN_ODD, oddI: 0, guess: 3, ok: false, intro: 'p2_intro', q: 'p2_q', leo: 'p2_leo', no: 'p2_no', ans: 'p2_ans', next: 'p3_intro', label: 'PUZZLE 2', call: 'A CROWN!', callC: '#ffca3a', clue: 'LOOK AT THEIR HEADS!' },
  { a: BEAR, odd: BOBO, oddI: 3, guess: 3, ok: true, intro: 'p3_intro', q: 'p3_q', leo: 'p3_leo', ans: 'p3_ans', next: 'end', label: 'SUPER PUZZLE!', call: 'RED SCARF!', callC: '#ff595e', clue: '' },
];
const guessAt = (p: Puzzle) => (p.ok ? word(p.leo, 3) - 0.05 : word(p.leo, 0) - 0.05); // "red" / "This…"
const thinkFrom = (p: Puzzle) => onBeat(E(p.q) + 0.1, 0);

// ── director camera
const SHOTS: Shot[] = [
  { t: 0, z: 1.0, x: 540, y: 960, move: 'cut', push: 0.004 },
];
PUZ.forEach((p) => {
  SHOTS.push(
    { t: S(p.intro) - 0.2, z: 1.0, x: 540, y: 960, move: 'smooth', dur: 0.5 },
    { t: E(p.q) + 0.05, z: 1.22, x: 540, y: 800, move: 'smooth', dur: 1.2, push: 0.012 }, // lean in while we think
    { t: guessAt(p), z: 1.0, x: 540, y: 960, move: 'whip' },
    { t: S(p.ans) - 0.05, z: 1.35, x: (AX(p.oddI) + 540) / 2, y: ROW - 230, move: 'snap', push: 0.01 }, // the answer
    { t: E(p.ans) + 0.2, z: 1.0, x: 540, y: 960, move: 'smooth', dur: 0.6 },
  );
});
SHOTS.push({ t: S('p3_bobo') - 0.1, z: 1.45, x: (AX(3) + 540) / 2, y: ROW - 230, move: 'snap' }, { t: E('p3_bobo') + 0.3, z: 1.0, x: 540, y: 960, move: 'smooth', dur: 0.6 });
const PUNCHES = PUZ.map((p) => S(p.ans) + 0.05);

const Stage: React.FC = () => (
  <g>
    <Vol kind="slope"><path d={`M 40,${ROW + 6} Q 60,${ROW - 40} 140,${ROW - 44} L 940,${ROW - 44} Q 1020,${ROW - 40} 1040,${ROW + 6} L 1040,${ROW + 70} L 40,${ROW + 70} Z`} fill="#ffd6a5" {...kst(7)} /></Vol>
    <path d={`M 60,${ROW + 10} L 1020,${ROW + 10}`} stroke="#ffffff" strokeWidth={8} opacity={0.5} strokeLinecap="round" />
  </g>
);

export default function KidsPuzzles041() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const pi = PUZ.findIndex((p) => within(t, S(p.intro) - 0.3, p.ok ? 1e9 : S(p.next) - 0.4)); // the bears stay to the end
  const p = pi >= 0 ? PUZ[pi] : null;
  const thinking = p ? within(t, E(p.q), S(p.leo)) : false;
  const solved = p ? t >= S(p.ans) : false;
  const stars = PUZ.filter((q) => t >= S(q.ans) + 0.3).length;
  const yay = within(t, S('p1_yay'), E('p1_yay') + 0.4) || within(t, S('p2_yay'), E('p2_yay') + 0.4) || t >= S('end');

  const leoExpr: KExpr =
    thinking ? 'think'
    : p && within(t, guessAt(p), S(p.ans)) ? (p.ok || t < E(p.leo) + 0.3 ? 'laugh' : 'oops')
    : yay ? 'laugh' : talks('leo') ? 'happy' : 'smile';

  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
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
        <Stage />
        {p && solved && <ImpactStar t={t} at={S(p.ans) + 0.05} x={AX(p.oddI)} y={ROW - 150} s={0.9} color={p.callC} />}
        {/* the four animals */}
        {p && [0, 1, 2, 3].map((i) => {
          const spec = i === p.oddI ? p.odd : p.a;
          const at = S(p.intro) + 0.9 + i * 0.18;
          if (t < at) return null;
          const isOdd = i === p.oddI;
          const hop = hopAt(t, [at, ...(solved && isOdd ? [S(p.ans) + 0.15, S(p.ans) + 0.75] : [])], { h: 60, air: 0.32, pre: 0.04, land: 0.18 });
          const dim = solved && !isOdd ? 0.55 : 1;
          const leave = !p.ok && t >= S(p.next) - 0.9 ? EASE_OUT(prog(t, S(p.next) - 0.9, S(p.next) - 0.5)) : 0;
          const expr: KExpr = solved && isOdd ? 'laugh' : 'happy';
          const boboTalk = p.ok && isOdd && (talks('bobo') || t >= S('bye'));
          return (
            <g key={`${pi}-${i}`} opacity={dim * (1 - leave)} transform={`translate(0,${leave * 60})`}>
              {solved && isOdd && <ellipse cx={AX(i)} cy={ROW + 4} rx={120} ry={26} fill="#ffd166" opacity={0.85} />}
              <g transform={`translate(${AX(i)},${ROW}) scale(${popIn(t, at)}) translate(${-AX(i)},${-ROW})`}>
                <Critter spec={{ ...spec, id: `${spec.id}${i}` }} x={AX(i)} y={ROW} scale={AS} expr={boboTalk ? 'laugh' : expr} look={thinking ? [0, 0.1] : [0, 0]}
                  mouth={boboTalk ? lipSync(VO, 'bobo', t) : 0} hop={hop.hop} squash={hop.squash} blink={false}
                  armL={boboTalk || (solved && isOdd && within(t, S(p.ans), E(p.ans) + 1.0)) ? 'wave' : 'down'} armR="down" />
              </g>
              {/* number tag */}
              <g transform={`translate(${AX(i)},${ROW + 46}) scale(${popIn(t, at + 0.1)})`}>
                <circle r={26} fill={['#ff595e', '#ffca3a', '#4cc9f0', '#8ac926'][i]} {...kst(5)} />
                <text y={11} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={32} fill="#ffffff" stroke={KINK} strokeWidth={4} paintOrder="stroke">{i + 1}</text>
              </g>
            </g>
          );
        })}
        {/* Leo's pick: a blue marker over the animal he chooses */}
        {p && within(t, guessAt(p), p.ok ? S('end') - 0.3 : (p.no ? S(p.no) + 0.8 : S(p.ans))) && (
          <g transform={`translate(${AX(p.guess)},${ROW - 330 + Math.sin(t * 6) * 8}) scale(${popIn(t, guessAt(p))})`}>
            <path d="M -40,-40 L 40,-40 L 40,10 L 14,10 L 0,34 L -14,10 L -40,10 Z" fill="#4cc9f0" {...kst(6)} />
            <text y={-4} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={30} fill="#ffffff" stroke={KINK} strokeWidth={4} paintOrder="stroke">LEO</text>
          </g>
        )}
        {p && !p.ok && <AnswerMark t={t} at={guessAt(p) + 0.6} until={p.no ? S(p.no) + 0.8 : S(p.ans)} ok={false} x={AX(p.guess) + 70} y={ROW - 250} size={0.45} />}
        {p && solved && <AnswerMark t={t} at={S(p.ans) + 0.2} until={p.ok ? S('end') : S(p.next) - 0.6} ok x={AX(p.oddI) + 80} y={ROW - 260} size={0.5} />}
        {p && <StageWord t={t} at={S(p.ans) + 0.6} until={p.ok ? S('end') - 0.3 : S(p.next) - 0.6} text={p.call} x={(AX(p.oddI) + 540) / 2} y={ROW - 420} size={96} color={p.callC} rot={-4} />}

        <Critter spec={HOOT_HERO} x={HOOT_X} y={f} scale={0.62} expr={talks('hoot') ? 'happy' : yay ? 'laugh' : 'smile'}
          look={thinking ? [0, 0] : [0.6, -0.5]} mouth={lipSync(VO, 'hoot', t)}
          armR={talks('hoot') && !!p ? 'point' : t >= S('bye') ? 'wave' : 'down'} armL={t >= S('end') ? 'up' : thinking ? 'think' : 'down'} />
        <Kid spec={LEO_HERO} x={LEO_X} y={f} scale={0.66} expr={leoExpr} look={thinking ? [0, 0] : [-0.6, -0.5]} mouth={lipSync(VO, 'leo', t)}
          armL={thinking ? 'think' : t >= S('bye') ? 'wave' : yay ? 'clap' : 'down'}
          armR={p && within(t, S(p.leo), E(p.leo)) ? 'point' : t >= S('bye') ? 'wave' : yay ? 'clap' : 'hip'}
          hop={yay || (p?.ok && within(t, S(p.ans), S(p.ans) + 1.2)) ? Math.abs(Math.sin(t * 7)) * 30 : 0} />
      </ActionStage>

      <PopText t={t} at={0.4} until={S('p1_intro') - 0.2} text="FIND THE DIFFERENT ONE!" y={480} size={86} color="#ffca3a" />
      {PUZ.map((q) => (
        <PopText key={q.label} t={t} at={S(q.intro)} until={S(q.intro) + 1.4} text={q.label} y={480} size={q.ok ? 110 : 130} color={q.ok ? '#ff595e' : '#ffca3a'} />
      ))}
      {PUZ.map((q) => (
        <ThinkTimer key={q.label} t={t} from={thinkFrom(q)} to={S(q.leo) - 0.2} x={540} y={1180} r={100} label="THINK!" />
      ))}
      {PUZ.filter((q) => q.clue).map((q) => (
        <PopText key={q.clue} t={t} at={word(q.no!, q.no === 'p2_no' ? 8 : 3)} until={S(q.ans) - 0.1} text={q.clue} y={480} size={80} color="#4cc9f0" />
      ))}
      {PUZ.map((q) => <Confetti key={q.label} t={t} at={S(q.ans) + 0.2} y={600} dur={1.4} />)}
      <PopText t={t} at={S('end')} until={E('bye') + 0.6} text="SUPER LOOKING EYES!" y={480} size={90} color="#ffd166" />
      <Confetti t={t} at={S('end')} y={500} />
      <KidsCaptions lines={VO} t={t} colors={CAPTION_COLORS} />
      <StarWipe t={t} at={E('bye') + 0.6} dur={0.5} hold={5} color="#3b2a4a" x={W / 2} y={H * 0.45} />
    </>
  );
}
