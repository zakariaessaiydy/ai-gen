// TINY SPARKS · Day 3 · 🔤 English/French Words #1 — "10 Animals in English & French" (LONG 16:9)
// kids-shorts/tiny-sparks/words/day-003-20-animals-in-english-and-french. Line indices come from
// plan.gen.ts (written by the pack script); every cue derives from VO times.
// Word loop per animal: the animal pops on a flash card → Mila says it ×3 → the French narrator adds
// "le lion" (word + article on the card) → a tiny sentence with the animal's sound/action.
// Quiz after 3, 6 and 9 animals (3 choices, think timer, ✓). Recap grid EN then FR. Goodbye wave.
import React from 'react';
import { Kid, type KArm } from '../../lib/kids/kid';
import { Critter, type CritterSpec, type Species } from '../../lib/kids/critter';
import { BOBO, CAPTION_COLORS, MILA } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { AnswerMark, Confetti, FONT_TOON, KidsCaptions, KidsStage, RAINBOW, ThinkTimer, TitleCard, WordCard, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { PLAN } from './plan.gen';

export const compositionConfig = { id: 'KidsWords003', durationInSeconds: 118.7, fps: 30, width: 1920, height: 1080 };

const W = 1920;
const H = 1080;
const f = FLOOR(H);
const S = (i: number) => VO[i].start;
const E = (i: number) => VO[i].end;
const COLORS = { ...CAPTION_COLORS, narrator_fr: '#4cc9f0' };

const LOOK: Record<string, [string, string, string]> = {
  lion: ['#ffc857', '#fff1c1', '#d2691e'],
  pig: ['#ffb3c6', '#ffd6e0', '#e5738f'],
  cat: ['#ffb26b', '#fff1e0', '#d9772b'],
  fox: ['#ff8c42', '#ffffff', '#7a3b12'],
  bunny: ['#f8f9fa', '#ffe5ec', '#adb5bd'],
  mouse: ['#c9cdd4', '#f1f3f5', '#868e96'],
  panda: ['#ffffff', '#ffffff', '#2b2d42'],
  owl: ['#9c7a64', '#f5e6d3', '#6d4c41'],
  frog: ['#8ac926', '#e9f5c9', '#4f7d17'],
  bear: ['#c98f5f', '#f3dcc0', '#7a4a2a'],
};
const spec = (sp: string, id = sp): CritterSpec => ({ id, species: sp as Species, fur: LOOK[sp][0], fur2: LOOK[sp][1], dark: LOOK[sp][2] });

const ANIMALS = PLAN.animals;
const QUIZ = PLAN.quiz;
const TITLE_END = 1.4;
const segStart = (k: number) => S(ANIMALS[k].enLine) - 0.7; // card pops before Mila says it
const segEnd = (k: number) => E(ANIMALS[k].sayLine) + 0.5;
const quizStart = (j: number) => S(QUIZ[j].ask) - 0.3;
const quizEnd = (j: number) => E(QUIZ[j].ans) + 0.4;
const RECAP0 = S(PLAN.recapEn) - 0.4;
const BYE0 = S(PLAN.bye) - 0.3;

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

export default function KidsWords003() {
  const t = useT();
  const cam = camAt(t, CAM);
  const k = ANIMALS.findIndex((_, i) => t >= segStart(i) && t < segEnd(i));
  const q = QUIZ.findIndex((_, j) => t >= quizStart(j) && t < quizEnd(j));
  const recap = t >= RECAP0 && t < BYE0;
  const bye = t >= BYE0;
  const a = k >= 0 ? ANIMALS[k] : null;

  const milaTalks = VO.some((l) => l.speaker === 'mila' && t >= l.start && t < l.end);
  const milaArm: KArm = bye ? 'wave' : a && t < E(a.enLine) ? 'point' : q >= 0 ? 'think' : milaTalks ? 'present' : 'down';
  const boboTalks = VO.some((l) => l.speaker === 'bobo' && t >= l.start && t < l.end);

  // recap: which card is being said (EN line, then FR line)
  const recapIdx = (line: number) => {
    const w = timeWords(VO[line]);
    const skip = line === PLAN.recapEn ? 4 : 3; // "Let's say them all!" / "Et en français :"
    // FR items are "le lion" (2 words) except "l'ours" (1): map word index → item
    let item = -1;
    let wi = skip;
    for (let n = 0; n < 10 && wi < w.length; n++) {
      const len = line === PLAN.recapEn ? 1 : ANIMALS[n].fr.split(' ').length;
      if (t >= w[wi].start) item = n;
      wi += len;
    }
    return item;
  };
  const enItem = recap ? recapIdx(PLAN.recapEn) : -1;
  const frItem = recap && t >= S(PLAN.recapFr) ? recapIdx(PLAN.recapFr) : -1;

  return (
    <>
      <KidsStage cam={cam}>
        <Meadow w={W} h={H} t={t} />
        <Kid spec={MILA} x={250} y={f} scale={0.6} expr={bye || (q >= 0 && t >= S(QUIZ[q].ans)) ? 'laugh' : q >= 0 ? 'think' : 'happy'}
          look={bye ? [0, 0] : [0.7, -0.3]} mouth={lipSync(VO, 'mila', t)} armR={milaArm} armL={bye ? 'wave' : 'hip'} />
        <Critter spec={BOBO} x={1680} y={f} scale={0.55} expr={boboTalks || bye ? 'laugh' : 'smile'} look={[-0.7, -0.3]}
          mouth={lipSync(VO, 'bobo', t)} armL={boboTalks ? 'up' : bye ? 'wave' : 'down'} armR={bye ? 'wave' : 'down'}
          hop={boboTalks ? Math.abs(Math.sin(t * 8)) * 20 : 0} />

        {/* the flash card for the current animal */}
        {a && (
          <WordCard t={t} at={segStart(k)} until={segEnd(k)} x={W / 2} y={455} w={560} word={a.en}
            word2={t >= S(a.frLine) ? a.fr : undefined} color={RAINBOW[k % RAINBOW.length]}>
            <Critter spec={spec(a.species, `card${k}`)} x={0} y={150} scale={0.47} expr={t >= S(a.sayLine) ? 'laugh' : 'happy'} shadow={false}
              mouth={t >= S(a.sayLine) && t < E(a.sayLine) ? Math.abs(Math.sin(t * 14)) : 0} />
          </WordCard>
        )}

        {/* quiz: three animals, which one is it? */}
        {q >= 0 &&
          QUIZ[q].options.map((sp, i) => {
            const x = 600 + i * 360;
            const right = i === QUIZ[q].correct;
            const reveal = t >= S(QUIZ[q].ans);
            const s = EASE_OUT(prog(t, quizStart(q) + i * 0.15, quizStart(q) + i * 0.15 + 0.35));
            return (
              <g key={i} transform={`translate(${x},640) scale(${s * (reveal && right ? 1.12 : 1)})`} opacity={reveal && !right ? 0.4 : 1}>
                <circle r={150} fill="#ffffff" {...kst(8)} />
                <Critter spec={spec(sp, `q${q}${i}`)} x={0} y={120} scale={0.32} expr={reveal && right ? 'laugh' : 'smile'} shadow={false} />
                {reveal && right && <AnswerMark t={t} at={S(QUIZ[q].ans)} ok x={110} y={-120} size={0.7} />}
              </g>
            );
          })}

        {/* recap grid: the 10 cards, highlighted as they're said */}
        {recap &&
          ANIMALS.map((an, i) => {
            const col = i % 5;
            const row = Math.floor(i / 5);
            const x = 520 + col * 220;
            const y = 300 + row * 330;
            const on = i === enItem && frItem < 0 ? true : i === frItem;
            const s = EASE_OUT(prog(t, RECAP0 + i * 0.06, RECAP0 + i * 0.06 + 0.3)) * (on ? 1.15 : 1);
            return (
              <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
                <rect x={-95} y={-130} width={190} height={270} rx={26} fill={on ? '#fff3b0' : '#ffffff'} {...kst(on ? 9 : 6)} />
                <Critter spec={spec(an.species, `r${i}`)} x={0} y={50} scale={0.24} expr={on ? 'laugh' : 'smile'} shadow={false} />
                <text y={92} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={34} fill={KINK}>{an.en}</text>
                {t >= S(PLAN.recapFr) && i <= Math.max(frItem, -1) && (
                  <text y={126} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={26} fill="#1982c4">{an.fr}</text>
                )}
              </g>
            );
          })}
      </KidsStage>
      <TitleCard t={t} from={0} to={TITLE_END} title="10 ANIMALS" sub="in English & French" />
      {QUIZ.map((qq, j) => (
        <ThinkTimer key={j} t={t} from={E(qq.ask) + 0.1} to={S(qq.ans) - 0.1} label="WHERE?" />
      ))}
      {QUIZ.map((qq, j) => (
        <Confetti key={j} t={t} at={S(qq.ans)} x={W / 2} y={400} dur={1.4} />
      ))}
      <Confetti t={t} at={BYE0} x={W / 2} y={300} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
    </>
  );
}
