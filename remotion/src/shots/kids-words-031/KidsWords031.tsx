// TINY SPARKS · Day 31 · 🔤 English/French Words #5 — "Fruits in English and French" (Short 9:16)
// kids-shorts/tiny-sparks/words/day-031-fruits-english-french. Line indices from plan.gen.ts.
// Word loop (PACING rule): the fruit pops on a word card with a splash → Mila "Apple." · "Apple!" → YOUR TURN
// pause → French "La pomme." · "La pomme !" (FR word added on the card) → a tiny sentence. Then a QUIZ (3 fruit
// cards, think timer, ✓ on the strawberry), a 3×2 recap grid lit as each fruit is said, EN then FR. Hero outfits.
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { AnswerMark, Apple, Confetti, FONT_TOON, KidsCaptions, KidsStage, PopText, ThinkTimer, TitleCard, WordCard, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { PLAN } from './plan.gen';

export const compositionConfig = { id: 'KidsWords031', durationInSeconds: 131.7, fps: 30, width: 1080, height: 1920 };

const W = 1080;
const H = 1920;
const f = FLOOR(H);
const S = (i: number) => VO[i].start;
const E = (i: number) => VO[i].end;
const COLORS = { ...CAPTION_COLORS, narrator_fr: '#4cc9f0' };
const CL = PLAN.colors;
const FR_SHOW: Record<string, string> = {};
const fr = (s: string) => FR_SHOW[s] ?? s;
const segStart = (k: number) => S(CL[k].en1) - 0.8;
const segEnd = (k: number) => E(CL[k].say) + 1.2;
const RECAP0 = S(PLAN.recapEn[0]) - 2.4;
const BYE0 = S(PLAN.bye) - 0.4;
const QZ = PLAN.quiz[0];

// the fruit, drawn ~300px around (0,0)
const Fruit: React.FC<{ kind: string; t: number; s?: number }> = ({ kind, t, s = 1 }) => {
  const g = (el: React.ReactNode) => <g transform={`scale(${s})`}>{el}</g>;
  switch (kind) {
    case 'apple': return g(<g transform="scale(1.9)"><Apple /></g>);
    case 'banana': return g(
      <g transform={`rotate(${-20 + Math.sin(t * 2) * 4})`}>
        <path d="M -130,-40 Q -60,120 120,60 Q 150,50 140,20 Q 0,60 -100,-60 Q -120,-70 -130,-40 Z" fill="#ffd60a" {...kst(8)} />
        <path d="M -100,-40 Q -20,70 120,40" fill="none" stroke="#e9b10a" strokeWidth={8} strokeLinecap="round" />
        <path d="M -128,-44 L -140,-70 L -116,-74 L -108,-56 Z" fill="#6b4226" {...kst(5)} />
        <path d="M 138,22 L 156,30 L 146,42 Z" fill="#6b4226" {...kst(4)} />
      </g>,
    );
    case 'orange': return g(
      <g>
        <circle r={120} fill="#ff924c" {...kst(8)} />
        {[[-40, -30], [20, -60], [50, 20], [-20, 40], [-60, 20], [10, 0], [60, -20]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5} fill="#e8590c" opacity={0.6} />)}
        <ellipse cx={-40} cy={-55} rx={30} ry={16} fill="#ffffff" opacity={0.35} transform="rotate(-30 -40 -55)" />
        <path d="M 0,-118 Q 10,-150 0,-160" fill="none" stroke="#6b4226" strokeWidth={10} strokeLinecap="round" />
        <path d="M 4,-140 Q 60,-180 80,-130 Q 40,-120 4,-140 Z" fill="#52b788" {...kst(5)} />
      </g>,
    );
    case 'strawberry': return g(
      <g transform="scale(1.35)">
        <path d="M 0,120 C -110,60 -120,-60 -60,-80 C -30,-90 -10,-80 0,-70 C 10,-80 30,-90 60,-80 C 120,-60 110,60 0,120 Z" fill="#e63946" {...kst(7)} />
        {[[-40, -30], [0, -40], [40, -30], [-50, 20], [-10, 10], [30, 20], [-20, 60], [20, 60]].map(([x, y], k) => <ellipse key={k} cx={x} cy={y} rx={5} ry={8} fill="#ffe066" />)}
        <path d="M -50,-80 L -20,-110 L 0,-84 L 20,-110 L 50,-80 Q 0,-66 -50,-80 Z" fill="#52b788" {...kst(5)} />
      </g>,
    );
    case 'grapes': return g(
      <g transform="scale(1.25)">
        {[[0, -70], [-45, -30], [45, -30], [-70, 15], [0, 10], [70, 15], [-40, 55], [40, 55], [0, 95]].map(([x, y], k) => (
          <g key={k}><circle cx={x} cy={y} r={38} fill="#7b2cbf" {...kst(6)} /><circle cx={x - 12} cy={y - 12} r={8} fill="#ffffff" opacity={0.4} /></g>
        ))}
        <path d="M 0,-110 Q 10,-140 40,-150" fill="none" stroke="#6b4226" strokeWidth={10} strokeLinecap="round" />
        <path d="M 10,-125 Q 60,-150 70,-110 Q 40,-100 10,-125 Z" fill="#52b788" {...kst(4)} />
      </g>,
    );
    default: return g(
      <g transform="translate(0,40)">
        <path d="M -170,-40 A 170,170 0 0,0 170,-40 Z" fill="#52b788" {...kst(8)} />
        <path d="M -148,-40 A 148,148 0 0,0 148,-40 Z" fill="#d8f3dc" />
        <path d="M -134,-40 A 134,134 0 0,0 134,-40 Z" fill="#ff595e" />
        {[-80, -40, 0, 40, 80].map((x, k) => <ellipse key={x} cx={x} cy={0 + (k % 2) * 30} rx={7} ry={11} fill={KINK} />)}
        <path d="M -170,-40 L 170,-40" {...kst(8)} />
      </g>,
    );
  }
};

const Splash: React.FC<{ c: string; s: number }> = ({ c, s }) => (
  <g transform={`scale(${s})`}>
    <path d="M 0,-300 C 120,-310 160,-170 260,-150 C 330,-120 300,20 280,80 C 260,190 160,300 30,280 C -80,330 -220,260 -250,140 C -330,80 -320,-80 -240,-150 C -170,-260 -100,-300 0,-300 Z" fill={c} opacity={0.85} {...kst(8)} />
  </g>
);

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

export default function KidsWords031() {
  const t = useT();
  const cam = camAt(t, CAM);
  const k = CL.findIndex((_, i) => t >= segStart(i) && t < segEnd(i));
  const recap = t >= RECAP0 && t < BYE0;
  const quiz = t >= S(QZ.ask) - 0.3 && t < RECAP0;
  const bye = t >= BYE0;
  const c = k >= 0 ? CL[k] : null;
  const yourTurn = c ? t >= E(c.en2) + 0.2 && t < S(c.fr1) - 0.1 : false;
  const milaTalks = VO.some((l) => l.speaker === 'mila' && t >= l.start && t < l.end);
  const boboTalks = VO.some((l) => l.speaker === 'bobo' && t >= l.start && t < l.end);

  const said = (lines: readonly number[], name: (i: number) => string) => {
    for (let r = lines.length - 1; r >= 0; r--) {
      const li = lines[r];
      if (t < S(li)) continue;
      if (t > E(li) + 0.6) return -1;
      const w = timeWords(VO[li]);
      let wi = li === PLAN.recapFr[0] || li === PLAN.recapEn[0] ? 0 : 0;
      let item = -1;
      for (let n = 0; n < 3 && wi < w.length; n++) {
        if (t >= w[wi].start) item = r * 3 + n;
        wi += name(r * 3 + n).split(' ').length;
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
        {/* the family-member card on a heart */}
        {c && (
          <g>
            <g transform={`translate(${W / 2},640)`}>
              <g transform={`rotate(${t * 8})`}><Splash c={c.hex} s={1.32 * EASE_OUT(prog(t, segStart(k), segStart(k) + 0.5)) * (1 - prog(t, segEnd(k) - 0.4, segEnd(k)))} /></g>
            </g>
            <WordCard t={t} at={segStart(k) + 0.2} until={segEnd(k)} x={W / 2} y={640} w={600} word={c.en} word2={t >= S(c.fr1) ? fr(c.fr) : undefined} color={c.hex}>
              <g transform={`translate(0,${10 + (t >= S(c.say) ? -Math.abs(Math.sin(t * 6)) * 14 : 0)}) rotate(${Math.sin(t * 2) * 3})`}><Fruit kind={c.obj} t={t} s={0.95} /></g>
            </WordCard>
          </g>
        )}
        {/* quiz: 3 fruit cards — which one is the strawberry? */}
        {quiz && QZ.options.map((o, j) => {
          const x = 220 + j * 320;
          const ok = j === QZ.correct;
          const done = t >= S(QZ.ans);
          const s = EASE_OUT(prog(t, S(QZ.ask) - 0.2 + j * 0.12, S(QZ.ask) + 0.2 + j * 0.12)) * (done && ok ? 1.12 + 0.04 * Math.sin(t * 6) : 1);
          return (
            <g key={o} transform={`translate(${x},640) scale(${s})`} opacity={done && !ok ? 0.4 : 1}>
              <rect x={-140} y={-170} width={280} height={340} rx={36} fill={done && ok ? '#fff3b0' : '#ffffff'} stroke={done && ok ? '#52b788' : KINK} strokeWidth={done && ok ? 12 : 7} />
              <g transform="translate(0,-20) scale(0.6)"><Fruit kind={CL[o].obj} t={t} /></g>
              <circle cx={-110} cy={-140} r={30} fill={['#ff595e', '#ffca3a', '#4cc9f0'][j]} {...kst(5)} />
              <text x={-110} y={-127} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={36} fill="#ffffff">{j + 1}</text>
              {done && ok && <text y={145} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={34} fill={KINK}>{CL[o].en.toLowerCase()}</text>}
            </g>
          );
        })}
        {quiz && t >= S(QZ.ans) && <AnswerMark t={t} at={S(QZ.ans) + 0.1} ok x={220 + QZ.correct * 320 + 100} y={480} size={0.5} />}
        {/* recap grid: the 6 family members, lit as they are said */}
        {recap &&
          CL.map((cc, i) => {
            const x = 210 + (i % 3) * 330;
            const y = 340 + Math.floor(i / 3) * 385;
            const on = frStarted ? i === frItem : i === enItem;
            const s = EASE_OUT(prog(t, RECAP0 + i * 0.08, RECAP0 + i * 0.08 + 0.3)) * (on ? 1.12 : 1);
            return (
              <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
                <rect x={-150} y={-180} width={300} height={370} rx={34} fill={on ? '#fff3b0' : '#ffffff'} {...kst(on ? 9 : 6)} />
                <g transform={`translate(0,-30) scale(${on ? 0.62 : 0.55})`}><Fruit kind={cc.obj} t={t} /></g>
                <text y={140} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={44} fill={KINK}>{cc.en.toLowerCase()}</text>
                {frStarted && (frItem >= i || t > E(PLAN.recapFr[1])) && (
                  <text y={178} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={34} fill="#1982c4">{fr(cc.fr)}</text>
                )}
              </g>
            );
          })}
        <Kid spec={MILA_HERO} x={200} y={f} scale={0.66} expr={bye ? 'laugh' : yourTurn ? 'smile' : 'happy'} look={bye || yourTurn ? [0, 0] : [0.5, -0.5]}
          mouth={lipSync(VO, 'mila', t)} armR={bye ? 'hug' : c && t < E(c.en2) ? 'point' : milaTalks ? 'present' : 'down'} armL={bye ? 'hug' : 'hip'} />
        <Critter spec={BOBO_HERO} x={880} y={f} scale={0.6} expr={boboTalks || bye ? 'laugh' : 'smile'} look={yourTurn ? [0, 0] : [-0.5, -0.5]}
          mouth={lipSync(VO, 'bobo', t)} armL={bye ? 'hug' : boboTalks ? 'up' : 'down'} armR={bye ? 'hug' : 'down'}
          hop={boboTalks ? Math.abs(Math.sin(t * 8)) * 20 : 0} />
      </KidsStage>
      <TitleCard t={t} from={0} to={1.4} title="FRUITS!" sub="in English & French" />
      <ThinkTimer t={t} from={E(QZ.ask) + 0.1} to={S(QZ.ans) - 0.1} x={540} y={1000} label="THINK!" />
      <PopText t={t} at={S(QZ.ask)} until={E(QZ.ask) + 0.1} text="QUIZ TIME!" y={300} size={120} color="#ff595e" />
      <PopText t={t} at={S(QZ.ansFr)} until={RECAP0} text="LA FRAISE !" y={300} size={110} color="#4cc9f0" />
      {c && yourTurn && <PopText t={t} at={E(c.en2) + 0.2} text="YOUR TURN!" y={200} size={110} color="#ffca3a" />}
      <Confetti t={t} at={BYE0} x={W / 2} y={600} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
    </>
  );
}
