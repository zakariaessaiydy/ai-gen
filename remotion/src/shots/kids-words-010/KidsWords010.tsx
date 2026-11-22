// TINY SPARKS · Day 10 · 🔤 English/French Words #2 — "20 Colors in English and French" (LONG 16:9)
// kids-shorts/tiny-sparks/words/day-010-20-colors-in-english-and-french. Line indices from plan.gen.ts.
// Word loop (PACING rule, ≈11 s per colour): the colour card pops with a paint splash + an object in that
// colour → Mila "Red." · "Red!" → YOUR TURN pause → French "Rouge." · "Rouge !" (word added on the card)
// → a tiny sentence ("A red apple!"). Quiz after every 5 colours (3 paint pots, ≥4 s think timer, ✓).
// Recap: the 20 swatches in a 5×4 grid, lit as they are said, EN then FR. Goodbye.
import React from 'react';
import { Kid, type KArm } from '../../lib/kids/kid';
import { Critter, type CritterSpec } from '../../lib/kids/critter';
import { BOBO, CAPTION_COLORS, MILA } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { AnswerMark, Apple, Balloon, Confetti, FONT_TOON, KidsCaptions, KidsStage, PopText, Star, ThinkTimer, TitleCard, WordCard, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { PLAN } from './plan.gen';

export const compositionConfig = { id: 'KidsWords010', durationInSeconds: 359.0, fps: 30, width: 1920, height: 1080 };

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

const critter = (id: string, species: CritterSpec['species'], fur: string, fur2: string, dark: string): CritterSpec => ({ id, species, fur, fur2, dark });

// one object per colour, drawn in a ~300px box around (0,0)
const Obj: React.FC<{ kind: string; c: string; t: number }> = ({ kind, c, t }) => {
  switch (kind) {
    case 'apple': return <g transform="scale(1.4)"><Apple c={c} /></g>;
    case 'orange': return (
      <g><circle r={100} fill={c} {...kst(8)} /><path d="M 0,-100 Q 20,-140 50,-130 Q 30,-100 0,-100 Z" fill="#52b788" {...kst(5)} />
        {[[-40, -20], [30, 10], [-10, 40], [45, -40]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5} fill="#e07a0c" />)}</g>
    );
    case 'sun': return (
      <g transform={`rotate(${t * 10})`}>
        {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={-10} y={-140} width={20} height={36} rx={10} fill="#ffb703" transform={`rotate(${i * 30})`} />)}
        <circle r={95} fill={c} {...kst(7)} />
      </g>
    );
    case 'frog': return <Critter spec={critter('frog', 'frog', c, '#e9f5c9', '#2d6a4f')} x={0} y={158} scale={0.52} expr="happy" shadow={false} />;
    case 'balloon': return <g transform="translate(0,-30) scale(1.5)"><Balloon c={c} /></g>;
    case 'grapes': return (
      <g>{[[0, -70], [-45, -30], [45, -30], [-70, 15], [0, 10], [70, 15], [-40, 55], [40, 55], [0, 95]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={38} fill={c} {...kst(6)} />)}
        <path d="M 0,-110 Q 10,-140 40,-150" fill="none" stroke="#6b4226" strokeWidth={10} strokeLinecap="round" /></g>
    );
    case 'pig': return <Critter spec={critter('pig', 'pig', c, '#ffd6e0', '#e5738f')} x={0} y={158} scale={0.52} expr="happy" shadow={false} />;
    case 'bear': return <Critter spec={BOBO} x={0} y={158} scale={0.52} expr="laugh" shadow={false} />;
    case 'cat': return <Critter spec={critter('cat', 'cat', c, '#4a4e69', '#14141f')} x={0} y={158} scale={0.52} expr="happy" shadow={false} />;
    case 'cloud': return (
      <g><rect x={-160} y={-140} width={320} height={260} rx={30} fill="#87cefa" />
        {[[-70, 10, 70], [0, -30, 90], [80, 10, 70]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={c} {...kst(7)} />)}
        <rect x={-140} y={10} width={290} height={70} rx={35} fill={c} /></g>
    );
    case 'mouse': return <Critter spec={critter('mouse', 'mouse', c, '#f1f3f5', '#5c636a')} x={0} y={158} scale={0.52} expr="happy" shadow={false} />;
    case 'star': return <g transform={`scale(2.2) rotate(${Math.sin(t * 2) * 8})`}><Star c={c} /></g>;
    case 'key': return (
      <g transform="rotate(-30)"><circle cx={-70} cy={0} r={60} fill={c} {...kst(8)} /><circle cx={-70} cy={0} r={22} fill="#ffffff" {...kst(5)} />
        <rect x={-15} y={-18} width={170} height={36} rx={10} fill={c} {...kst(7)} /><rect x={110} y={18} width={22} height={40} fill={c} {...kst(5)} /><rect x={70} y={18} width={22} height={30} fill={c} {...kst(5)} />
        <path d="M -100,-30 L -80,-20" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" /></g>
    );
    case 'fish': return (
      <g transform={`translate(${Math.sin(t * 2) * 15},0)`}><path d="M 100,0 L 170,-60 L 170,60 Z" fill={c} {...kst(7)} />
        <ellipse rx={120} ry={80} fill={c} {...kst(8)} /><circle cx={-60} cy={-15} r={14} fill={KINK} /><path d="M -10,-50 Q 10,0 -10,50" fill="none" {...kst(5)} /></g>
    );
    case 'sky': return (
      <g><rect x={-170} y={-140} width={340} height={260} rx={30} fill={c} {...kst(7)} />
        {[[-60, 20, 50], [0, -5, 64], [60, 20, 50]].map(([x, y, r], i) => <circle key={i} cx={x + Math.sin(t) * 10} cy={y} r={r} fill="#ffffff" />)}
        <circle cx={110} cy={-80} r={32} fill="#ffd166" {...kst(5)} /></g>
    );
    case 'leaf': return (
      <g transform="rotate(-20)"><path d="M 0,-140 Q 120,-40 0,140 Q -120,-40 0,-140 Z" fill={c} {...kst(8)} />
        <path d="M 0,-120 L 0,170" fill="none" {...kst(6)} />{[-60, -10, 40].map((y) => <path key={y} d={`M 0,${y} L 50,${y - 40} M 0,${y} L -50,${y - 40}`} fill="none" {...kst(4)} />)}</g>
    );
    case 'boat': return (
      <g transform={`rotate(${Math.sin(t * 2) * 4})`}><path d="M -160,20 L 160,20 L 110,100 L -110,100 Z" fill={c} {...kst(8)} />
        <rect x={-6} y={-150} width={12} height={170} fill="#8d5a3b" {...kst(4)} /><path d="M 10,-140 L 120,0 L 10,0 Z" fill="#ffffff" {...kst(6)} /></g>
    );
    case 'peach': return (
      <g><circle r={105} fill={c} {...kst(8)} /><path d="M 0,-100 Q -20,0 0,100" fill="none" stroke="#f08c5a" strokeWidth={7} />
        <path d="M 0,-104 Q 40,-150 80,-120 Q 40,-95 0,-104 Z" fill="#52b788" {...kst(5)} /><ellipse cx={-45} cy={-40} rx={20} ry={28} fill="#ffffff" opacity={0.4} /></g>
    );
    case 'flower': return (
      <g><path d="M 0,40 Q 10,110 0,170" fill="none" stroke="#52b788" strokeWidth={14} strokeLinecap="round" />
        {Array.from({ length: 8 }).map((_, i) => <ellipse key={i} cx={0} cy={-60} rx={34} ry={56} fill={c} {...kst(5)} transform={`rotate(${i * 45})`} />)}
        <circle r={40} fill="#ffd166" {...kst(6)} /></g>
    );
    case 'cookie': return (
      <g><circle r={110} fill={c} {...kst(8)} />{[[-40, -30], [35, -50], [10, 20], [-50, 45], [55, 40]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={14} fill="#6b4226" />)}</g>
    );
    default: return <circle r={100} fill={c} {...kst(8)} />;
  }
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
              word2={t >= S(c.fr1) ? c.fr : undefined} color={c.hex === '#ffffff' ? '#adb5bd' : c.hex}>
              <g transform="scale(1.02)"><Obj kind={c.obj} c={c.hex} t={t} /></g>
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
                <ellipse cx={0} cy={-120} rx={130} ry={40} fill={CL[ci].hex} {...kst(7)} />
                <path d="M -130,-120 L -110,130 Q 0,170 110,130 L 130,-120" fill="#ffffff" {...kst(8)} />
                <path d="M -126,-80 L -114,60 Q 0,100 114,60 L 126,-80 Z" fill={CL[ci].hex} />
                <path d="M -60,-120 Q -70,-40 -50,-20" fill="none" stroke={CL[ci].hex} strokeWidth={26} strokeLinecap="round" />
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
                <circle cx={0} cy={-22} r={42} fill={cc.hex} {...kst(5)} />
                <text y={50} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={cc.en.length > 7 ? 26 : 32} fill={KINK}>{cc.en}</text>
                {frStarted && (frItem >= i || t > E(PLAN.recapFr[3])) && (
                  <text y={76} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={cc.fr.length > 8 ? 20 : 24} fill="#1982c4">{cc.fr}</text>
                )}
              </g>
            );
          })}
      </KidsStage>
      <TitleCard t={t} from={0} to={TITLE_END} title="20 COLORS" sub="in English & French" />
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
