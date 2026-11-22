// TINY SPARKS · Day 17 · 🔤 English/French Words #3 — "Numbers 1–20 in English and French" (LONG 16:9)
// kids-shorts/tiny-sparks/words/day-017-numbers-1-20-english-french. Line indices from plan.gen.ts.
// Same word loop as Day 10 (PACING rule, ≈11 s per number): the number card pops on a splash with N objects
// to count (apples / balloons / stars, rows of 5) + the numeral badge → Mila "Three." · "Three!" → YOUR TURN
// → French "Trois." · "Trois !" → a counting sentence ("Three stars!"). Quiz after every 5 (3 number cards,
// think timer, ✓). Recap: 1–20 in a 5×4 grid, lit as they are said, EN then FR. Goodbye.
import React from 'react';
import { Kid, type KArm } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO, CAPTION_COLORS, MILA } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { AnswerMark, Apple, Balloon, Confetti, FONT_TOON, KidsCaptions, KidsStage, PopText, Star, ThinkTimer, TitleCard, WordCard, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { PLAN } from './plan.gen';

export const compositionConfig = { id: 'KidsWords017', durationInSeconds: 351.2, fps: 30, width: 1920, height: 1080 };

const W = 1920;
const H = 1080;
const f = FLOOR(H);
const S = (i: number) => VO[i].start;
const E = (i: number) => VO[i].end;
const COLORS = { ...CAPTION_COLORS, narrator_fr: '#4cc9f0' };
const CL = PLAN.colors;
const QUIZ = PLAN.quiz;
const TITLE_END = 1.4;
const segStart = (k: number) => S(CL[k].en1) - 0.8;
const segEnd = (k: number) => E(CL[k].say) + 1.2;
const quizStart = (j: number) => S(QUIZ[j].ask) - 0.3;
const quizEnd = (j: number) => E(QUIZ[j].ansFr) + 0.6;
const RECAP0 = S(PLAN.recapEn[0]) - 2.4;
const BYE0 = S(PLAN.bye) - 0.4;


// N objects to count (rows of 5), centred in the card's picture area
const CountIcons: React.FC<{ n: number; kind: string; t: number }> = ({ n, kind, t }) => {
  const rows = Math.ceil(n / 5);
  const sc = n <= 3 ? 1.6 : n <= 5 ? 1.05 : n <= 10 ? 1 : 0.8;
  return (
    <g transform={`scale(${sc})`}>
      {Array.from({ length: n }).map((_, i) => {
        const r = Math.floor(i / 5);
        const inRow = Math.min(5, n - r * 5);
        const x = ((i % 5) - (inRow - 1) / 2) * 92;
        const y = (r - (rows - 1) / 2) * 92 + Math.sin(t * 3 + i) * 3;
        return (
          <g key={i} transform={`translate(${x},${y})`}>
            {kind === 'apple' && <g transform="scale(0.42)"><Apple /></g>}
            {kind === 'balloon' && <g transform="translate(0,-8) scale(0.4)"><Balloon c={['#ff595e', '#4cc9f0', '#ffca3a', '#8ac926', '#b8a1e3'][i % 5]} /></g>}
            {kind === 'star' && <g transform="scale(0.62)"><Star /></g>}
          </g>
        );
      })}
    </g>
  );
};

// paint-splash blob behind the card
const Splash: React.FC<{ c: string; s: number; t: number }> = ({ c, s, t }) => (
  <g transform={`scale(${s}) rotate(${t * 4})`}>
    <path d="M 0,-420 C 160,-430 220,-300 330,-280 C 470,-250 460,-60 420,40 C 380,150 470,280 330,350 C 200,420 90,330 -20,410 C -150,500 -300,380 -330,260 C -360,140 -480,60 -420,-80 C -360,-220 -300,-260 -200,-330 C -120,-390 -80,-415 0,-420 Z"
      fill={c} opacity={0.9} {...kst(8)} />
    {[[480, -200, 40], [-470, 230, 34], [380, 380, 26], [-300, -420, 30]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={c} {...kst(6)} />)}
  </g>
);

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

export default function KidsWords010() {
  const t = useT();
  const cam = camAt(t, CAM);
  const k = CL.findIndex((_, i) => t >= segStart(i) && t < segEnd(i));
  const q = QUIZ.findIndex((_, j) => t >= quizStart(j) && t < quizEnd(j));
  const recap = t >= RECAP0 && t < BYE0;
  const bye = t >= BYE0;
  const c = k >= 0 ? CL[k] : null;
  const yourTurn = c ? t >= E(c.en2) + 0.2 && t < S(c.fr1) - 0.1 : false;

  const milaTalks = VO.some((l) => l.speaker === 'mila' && t >= l.start && t < l.end);
  const boboTalks = VO.some((l) => l.speaker === 'bobo' && t >= l.start && t < l.end);
  const milaArm: KArm = bye ? 'wave' : c && t < E(c.en2) ? 'point' : q >= 0 ? 'think' : milaTalks ? 'present' : 'down';

  // recap: which swatch is being said. EN lines: words per colour = words in its name; FR likewise.
  const said = (lines: readonly number[], name: (i: number) => string) => {
    for (let r = lines.length - 1; r >= 0; r--) {
      const li = lines[r];
      if (t < S(li)) continue;
      if (t > E(li) + 0.6) return -1;
      const w = timeWords(VO[li]);
      let wi = 0;
      let item = -1;
      for (let n = 0; n < 5 && wi < w.length; n++) {
        if (t >= w[wi].start) item = r * 5 + n;
        wi += name(r * 5 + n).split(' ').length;
      }
      return item;
    }
    return -1;
  };
  const enItem = recap ? said(PLAN.recapEn, (i) => CL[i].en) : -1;
  const frItem = recap ? said(PLAN.recapFr, (i) => CL[i].fr) : -1;
  const frStarted = t >= S(PLAN.recapFr[0]) - 0.2;

  return (
    <>
      <KidsStage cam={cam}>
        <Meadow w={W} h={H} t={t} />
        <Kid spec={MILA} x={250} y={f} scale={0.6} expr={bye || (q >= 0 && t >= S(QUIZ[q].ans)) ? 'laugh' : q >= 0 ? 'think' : yourTurn ? 'smile' : 'happy'}
          look={bye || yourTurn ? [0, 0] : [0.7, -0.3]} mouth={lipSync(VO, 'mila', t)} armR={milaArm} armL={bye ? 'wave' : 'hip'} />
        <Critter spec={BOBO} x={1680} y={f} scale={0.55} expr={boboTalks || bye ? 'laugh' : 'smile'} look={yourTurn ? [0, 0] : [-0.7, -0.3]}
          mouth={lipSync(VO, 'bobo', t)} armL={boboTalks ? 'up' : bye ? 'wave' : 'down'} armR={bye ? 'wave' : 'down'}
          hop={boboTalks ? Math.abs(Math.sin(t * 8)) * 20 : 0} />

        {/* the colour card on a paint splash */}
        {c && (
          <g>
            <g transform={`translate(${W / 2},470)`}>
              <Splash c={c.hex} s={EASE_OUT(prog(t, segStart(k), segStart(k) + 0.5)) * (1 - prog(t, segEnd(k) - 0.4, segEnd(k)))} t={t} />
            </g>
            <WordCard t={t} at={segStart(k) + 0.2} until={segEnd(k)} x={W / 2} y={470} w={560} word={c.en}
              word2={t >= S(c.fr1) ? c.fr : undefined} color={c.hex}>
              <CountIcons n={k + 1} kind={c.obj} t={t} />
              <g transform="translate(215,-170)">
                <circle r={58} fill={c.hex} {...kst(7)} />
                <text y={24} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={k >= 9 ? 56 : 70} fill="#ffffff" stroke={KINK} strokeWidth={5} paintOrder="stroke">{k + 1}</text>
              </g>
            </WordCard>
          </g>
        )}

        {/* quiz: three paint pots */}
        {q >= 0 &&
          QUIZ[q].options.map((ci, i) => {
            const x = 600 + i * 360;
            const right = i === QUIZ[q].correct;
            const reveal = t >= S(QUIZ[q].ans);
            const s = EASE_OUT(prog(t, quizStart(q) + i * 0.15, quizStart(q) + i * 0.15 + 0.35));
            return (
              <g key={i} transform={`translate(${x},560) scale(${s * (reveal && right ? 1.15 : 1)})`} opacity={reveal && !right ? 0.35 : 1}>
                <rect x={-130} y={-150} width={260} height={300} rx={36} fill="#ffffff" {...kst(8)} />
                <text y={60} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={ci >= 9 ? 150 : 180} fill={CL[ci].hex} stroke={KINK} strokeWidth={7} paintOrder="stroke">{ci + 1}</text>
                {reveal && right && <AnswerMark t={t} at={S(QUIZ[q].ans)} ok x={110} y={-170} size={0.7} />}
              </g>
            );
          })}

        {/* recap grid: 20 swatches, lit as they are said */}
        {recap &&
          CL.map((cc, i) => {
            const col = i % 5;
            const row = Math.floor(i / 5);
            const x = 560 + col * 200;
            const y = 195 + row * 180;
            const on = frStarted ? i === frItem : i === enItem;
            const s = EASE_OUT(prog(t, RECAP0 + i * 0.05, RECAP0 + i * 0.05 + 0.3)) * (on ? 1.18 : 1);
            return (
              <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
                <rect x={-88} y={-80} width={176} height={165} rx={26} fill={on ? '#fff3b0' : '#ffffff'} {...kst(on ? 9 : 6)} />
                <text y={2} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={70} fill={cc.hex} stroke={KINK} strokeWidth={5} paintOrder="stroke">{i + 1}</text>
                <text y={50} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={cc.en.length > 7 ? 26 : 32} fill={KINK}>{cc.en}</text>
                {frStarted && (frItem >= i || t > E(PLAN.recapFr[3])) && (
                  <text y={76} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={cc.fr.length > 8 ? 20 : 24} fill="#1982c4">{cc.fr}</text>
                )}
              </g>
            );
          })}
      </KidsStage>
      <TitleCard t={t} from={0} to={TITLE_END} title="1 TO 20" sub="in English & French" />
      {c && yourTurn && <PopText t={t} at={E(c.en2) + 0.2} text="YOUR TURN!" x={1500} y={240} size={84} color="#ffca3a" />}
      {QUIZ.map((qq, j) => (
        <ThinkTimer key={j} t={t} from={E(qq.ask) + 0.1} to={S(qq.ans) - 0.1} label="WHICH?" />
      ))}
      {QUIZ.map((qq, j) => (
        <Confetti key={j} t={t} at={S(qq.ans)} x={W / 2} y={400} dur={1.4} />
      ))}
      <Confetti t={t} at={BYE0} x={W / 2} y={300} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
    </>
  );
}
