// TINY SPARKS · Day 38 · 🔤 English/French Words #6 — "Vegetables in English and French" (Short 9:16, 2:16)
// kids-shorts/tiny-sparks/words/day-038-vegetables-english-french. Line indices from plan.gen.ts.
// ENERGY LAYER standard (Short: no ident, the hook starts in frame 0): Bobo finds something growing in the garden,
// pulls… pulls… POP! a giant carrot → 6 word loops (the veggie POPS onto its card with a burst + snap zoom, Mila
// "Carrot." · "Carrot!" → YOUR TURN → French ×2 → a tiny sentence with a gag: crunch, popcorn, peas in a pod) →
// QUIZ (which one is the broccoli? think timer + tick-tock) → recap grid EN then FR → bye + star iris.
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { AnswerMark, Confetti, FONT_TOON, KidsCaptions, PopText, ThinkTimer, WordCard, lipSync, useT } from '../../lib/kids/kit';
import { ActionStage, Dust, ImpactStar, Reaction, StageWord, StarWipe, StrainLines, directorCam, hopAt, shakeOf, type Shot } from '../../lib/kids/energy';
import { KINK, kst } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { PLAN } from './plan.gen';

export const compositionConfig = { id: 'KidsWords038', durationInSeconds: 135.7, fps: 30, width: 1080, height: 1920 };

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
const SAY_GAG: Record<string, string> = { carrot: 'CRUNCH!', corn: 'POP! POP!', peas: '1, 2, 3, 4, 5!' };
const segEnd = (k: number) => E(CL[k].say) + 1.2;
const RECAP0 = S(PLAN.recapEn[0]) - 2.4;
const BYE0 = S(PLAN.bye) - 0.4;
const QZ = PLAN.quiz[0];

// the vegetable, drawn ~300px around (0,0), 3D look
const Veg: React.FC<{ kind: string; t: number; s?: number }> = ({ kind, t, s = 1 }) => {
  const g = (el: React.ReactNode) => <g transform={`scale(${s})`}>{el}</g>;
  switch (kind) {
    case 'carrot': return g(
      <g transform="rotate(-25)">
        {[-30, 0, 30].map((a) => <path key={a} d="M 0,-120 Q -16,-190 0,-230 Q 16,-190 0,-120 Z" fill="#52b788" {...kst(6)} transform={`rotate(${a + Math.sin(t * 3 + a) * 4} 0 -120)`} />)}
        <Vol><path d="M -62,-120 Q 0,-140 62,-120 Q 40,40 0,170 Q -40,40 -62,-120 Z" fill="#ff924c" {...kst(8)} /></Vol>
        {[-60, -10, 40, 90].map((y, i) => <path key={y} d={`M ${i % 2 ? 8 : -40},${y} q 20,8 34,0`} fill="none" stroke="#e8590c" strokeWidth={6} strokeLinecap="round" />)}
      </g>,
    );
    case 'tomato': return g(
      <g>
        <Vol><path d="M 0,-100 C 100,-110 140,-30 130,30 C 120,110 50,130 0,128 C -50,130 -120,110 -130,30 C -140,-30 -100,-110 0,-100 Z" fill="#e63946" {...kst(8)} /></Vol>
        <path d="M -60,-104 L -20,-90 L 0,-130 L 20,-90 L 60,-104 L 30,-70 L 0,-84 L -30,-70 Z" fill="#52b788" {...kst(5)} />
        <ellipse cx={-55} cy={-40} rx={28} ry={16} fill="#ffffff" opacity={0.4} transform="rotate(-30 -55 -40)" />
      </g>,
    );
    case 'broccoli': return g(
      <g>
        <Vol kind="tube"><path d="M -34,30 L 34,30 L 26,150 L -26,150 Z" fill="#95d5b2" {...kst(7)} /></Vol>
        <Vol>{[[-80, -10, 62], [80, -10, 62], [-40, -70, 66], [40, -70, 66], [0, -120, 60], [0, -20, 70]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? '#2d9a5a' : '#38b26b'} {...kst(7)} />)}</Vol>
        {[[-70, -20], [50, -80], [10, -130], [70, 0], [-30, -90]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={9} fill="#1b7a43" opacity={0.6} />)}
      </g>,
    );
    case 'corn': return g(
      <g transform="rotate(15)">
        <path d="M -20,150 Q -110,60 -80,-90 Q -60,10 -10,120 Z" fill="#52b788" {...kst(6)} />
        <path d="M 20,150 Q 110,60 80,-90 Q 60,10 10,120 Z" fill="#40916c" {...kst(6)} />
        <Vol><ellipse cx={0} cy={-10} rx={56} ry={150} fill="#ffca3a" {...kst(8)} /></Vol>
        {Array.from({ length: 24 }).map((_, i) => <circle key={i} cx={(i % 3 - 1) * 28} cy={-130 + Math.floor(i / 3) * 34} r={12} fill="#ffe066" stroke="#e9b10a" strokeWidth={3} />)}
      </g>,
    );
    case 'potato': return g(
      <g>
        <Vol><path d="M -140,-10 C -150,-90 -40,-110 40,-96 C 140,-80 160,0 130,60 C 100,110 -30,120 -90,90 C -130,70 -136,30 -140,-10 Z" fill="#c98f5f" {...kst(8)} /></Vol>
        {[[-60, -40], [30, -50], [80, 20], [-20, 40], [-90, 30]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={9} ry={6} fill="#8d5a3b" />)}
      </g>,
    );
    default: return g(
      <g transform="rotate(-15)">
        <Vol><path d="M -170,0 Q 0,-110 170,0 Q 0,80 -170,0 Z" fill="#52b788" {...kst(8)} /></Vol>
        {[-110, -55, 0, 55, 110].map((x, i) => <g key={x}><Vol><circle cx={x} cy={-8 + Math.abs(x) * 0.12} r={34} fill="#8ac926" {...kst(6)} /></Vol><circle cx={x - 10} cy={-18 + Math.abs(x) * 0.12} r={8} fill="#ffffff" opacity={0.5} /></g>)}
        <path d="M -170,0 Q 0,-70 170,0" fill="none" stroke="#2d6a4f" strokeWidth={8} strokeLinecap="round" />
        <path d="M 170,0 q 30,-10 40,-40" fill="none" stroke="#2d6a4f" strokeWidth={8} strokeLinecap="round" />
      </g>,
    );
  }
};

const Splash: React.FC<{ c: string; s: number }> = ({ c, s }) => (
  <g transform={`scale(${s})`}>
    <path d="M 0,-300 C 120,-310 160,-170 260,-150 C 330,-120 300,20 280,80 C 260,190 160,300 30,280 C -80,330 -220,260 -250,140 C -330,80 -320,-80 -240,-150 C -170,-260 -100,-300 0,-300 Z" fill={c} opacity={0.85} {...kst(8)} />
  </g>
);

const HOOK = PLAN.hook;
const PULL = PLAN.pull;
const POP_T = (() => { const w = timeWords(VO[PULL]); return w[w.length - 1].start; })();
const PULLS = (() => { const w = timeWords(VO[PULL]); return [w[0].start, w[1].start]; })();
const shots = (): Shot[] => {
  const s: Shot[] = [
    { t: 0, z: 1.35, x: 760, y: 1250, move: 'cut', push: 0.02 }, // Bobo + the leaves in the garden
    { t: POP_T - 0.05, z: 1.0, x: 540, y: 960, move: 'snap' },
  ];
  CL.forEach((c, k) => {
    s.push({ t: segStart(k) + 0.15, z: 1.18, x: 540, y: 760, move: 'snap', push: 0.01 }); // punch in on the card
    s.push({ t: S(c.say) - 0.2, z: 1.0, x: 540, y: 960, move: 'smooth', dur: 0.5 });
  });
  s.push({ t: S(QZ.ask) - 0.3, z: 1.0, x: 540, y: 960, move: 'cut' }, { t: S(QZ.ans) - 0.05, z: 1.2, x: 220 + QZ.correct * 320, y: 700, move: 'snap' },
    { t: RECAP0 - 0.1, z: 1.0, x: 540, y: 960, move: 'smooth', dur: 0.5 });
  return s;
};
const SHOTS = shots();
const PUNCHES = [POP_T, ...CL.map((_, k) => segStart(k) + 0.2), S(QZ.ans)];

export default function KidsWords038() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const shake = shakeOf(t, [{ at: POP_T, amp: 12, dur: 0.35 }]);
  const hook = t < segStart(0);
  const pulling = t >= PULLS[0] - 0.1 && t < POP_T;
  const tug = pulling ? Math.sin((t - PULLS[0]) * 14) : 0;
  const boboHook = hopAt(t, [POP_T], { h: 60, air: 0.35, pre: 0.05, land: 0.2 });
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
      <ActionStage cam={cam} shake={shake} blur={cam.blur}>
        <Meadow w={W} h={H} t={t} />
        {/* the hook: a veggie patch, Bobo pulls a giant carrot out — POP! */}
        {t < segStart(0) + 0.4 && (
          <g>
            <ellipse cx={720} cy={f + 40} rx={260} ry={46} fill="#8d5a3b" {...kst(6)} />
            {[620, 820].map((x) => <g key={x} transform={`translate(${x},${f + 20})`}>{[-30, 0, 30].map((a) => <path key={a} d="M 0,0 Q -14,-60 0,-90 Q 14,-60 0,0 Z" fill="#52b788" {...kst(5)} transform={`rotate(${a})`} />)}</g>)}
            {t < POP_T ? (
              <g transform={`translate(720,${f + 10 - (pulling ? 10 + tug * 8 : 0)}) rotate(${tug * 5})`}>
                {[-30, 0, 30].map((a) => <path key={a} d="M 0,0 Q -20,-90 0,-140 Q 20,-90 0,0 Z" fill="#52b788" {...kst(6)} transform={`rotate(${a + Math.sin(t * 3 + a) * 5})`} />)}
                <Reaction kind="?" t={t} at={0.3} until={PULLS[0] - 0.1} x={0} y={-180} s={0.7} />
              </g>
            ) : (
              <g transform={`translate(${720 - 180 * EASE_OUT(prog(t, POP_T, POP_T + 0.5))},${f - 80 - 520 * Math.sin(Math.min(1, prog(t, POP_T, POP_T + 0.7)) * Math.PI * 0.6) + Math.sin(t * 3) * 12}) rotate(${Math.min(t - POP_T, 0.9) * 400 + Math.sin(t * 2) * 8}) scale(${(0.9 + 0.3 * prog(t, POP_T, POP_T + 0.5)) * (1 - EASE_OUT(prog(t, segStart(0) - 0.7, segStart(0) - 0.1)))})`}>
                <Veg kind="carrot" t={t} />
              </g>
            )}
            <StrainLines t={t} from={PULLS[0]} to={POP_T} x={720} y={f - 120} r={110} />
            <ImpactStar t={t} at={POP_T} x={720} y={f - 40} s={1.1} text="POP!" />
            <Dust t={t} at={POP_T} x={720} y={f + 30} s={1.3} />
          </g>
        )}
        {/* the veggie card on a splash */}
        {c && (
          <g>
            <g transform={`translate(${W / 2},640)`}>
              <g transform={`rotate(${t * 8})`}><Splash c={c.hex} s={1.32 * EASE_OUT(prog(t, segStart(k), segStart(k) + 0.5)) * (1 - prog(t, segEnd(k) - 0.4, segEnd(k)))} /></g>
            </g>
            <ImpactStar t={t} at={segStart(k) + 0.2} x={W / 2} y={640} s={1.4} color={c.hex} />
            <WordCard t={t} at={segStart(k) + 0.2} until={segEnd(k)} x={W / 2} y={640} w={600} word={c.en} word2={t >= S(c.fr1) ? fr(c.fr) : undefined} color={c.hex}>
              <g transform={`translate(0,${10 + (t >= S(c.say) ? -Math.abs(Math.sin(t * 6)) * 14 : 0)}) rotate(${Math.sin(t * 2) * 3})`}><Veg kind={c.obj} t={t} s={0.95} /></g>
            </WordCard>
            {SAY_GAG[c.obj] && <StageWord t={t} at={S(c.say) + 0.3} until={E(c.say) + 0.9} text={SAY_GAG[c.obj]} x={W / 2 + 120} y={1060} size={90} color="#ffca3a" rot={-6} />}
          </g>
        )}
        {/* quiz: 3 veggie cards — which one is the broccoli? */}
        {quiz && QZ.options.map((o, j) => {
          const x = 220 + j * 320;
          const ok = j === QZ.correct;
          const done = t >= S(QZ.ans);
          const s = EASE_OUT(prog(t, S(QZ.ask) - 0.2 + j * 0.12, S(QZ.ask) + 0.2 + j * 0.12)) * (done && ok ? 1.12 + 0.04 * Math.sin(t * 6) : 1);
          return (
            <g key={o} transform={`translate(${x},640) scale(${s})`} opacity={done && !ok ? 0.4 : 1}>
              <rect x={-140} y={-170} width={280} height={340} rx={36} fill={done && ok ? '#fff3b0' : '#ffffff'} stroke={done && ok ? '#52b788' : KINK} strokeWidth={done && ok ? 12 : 7} />
              <g transform="translate(0,-20) scale(0.6)"><Veg kind={CL[o].obj} t={t} /></g>
              <circle cx={-110} cy={-140} r={30} fill={['#ff595e', '#ffca3a', '#4cc9f0'][j]} {...kst(5)} />
              <text x={-110} y={-127} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={36} fill="#ffffff">{j + 1}</text>
              {done && ok && <text y={145} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={34} fill={KINK}>{CL[o].en.toLowerCase()}</text>}
            </g>
          );
        })}
        {quiz && t >= S(QZ.ans) && <AnswerMark t={t} at={S(QZ.ans) + 0.1} ok x={220 + QZ.correct * 320 + 100} y={480} size={0.5} />}
        {/* recap grid: the 6 veggies, lit as they are said */}
        {recap &&
          CL.map((cc, i) => {
            const x = 210 + (i % 3) * 330;
            const y = 340 + Math.floor(i / 3) * 385;
            const on = frStarted ? i === frItem : i === enItem;
            const s = EASE_OUT(prog(t, RECAP0 + i * 0.08, RECAP0 + i * 0.08 + 0.3)) * (on ? 1.12 : 1);
            return (
              <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
                <rect x={-150} y={-180} width={300} height={370} rx={34} fill={on ? '#fff3b0' : '#ffffff'} {...kst(on ? 9 : 6)} />
                <g transform={`translate(0,-30) scale(${on ? 0.62 : 0.55})`}><Veg kind={cc.obj} t={t} /></g>
                <text y={140} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={44} fill={KINK}>{cc.en.toLowerCase()}</text>
                {frStarted && (frItem >= i || t > E(PLAN.recapFr[1])) && (
                  <text y={178} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={34} fill="#1982c4">{fr(cc.fr)}</text>
                )}
              </g>
            );
          })}
        <Kid spec={MILA_HERO} x={200} y={f} scale={0.66} expr={bye ? 'laugh' : yourTurn ? 'smile' : 'happy'} look={bye || yourTurn ? [0, 0] : [0.5, -0.5]}
          mouth={lipSync(VO, 'mila', t)} armR={bye ? 'hug' : c && t < E(c.en2) ? 'point' : milaTalks ? 'present' : 'down'} armL={bye ? 'hug' : 'hip'} />
        <Critter spec={BOBO_HERO} x={hook ? 900 : 880} y={f} scale={0.6} expr={pulling ? 'oops' : hook && t >= POP_T ? 'wow' : boboTalks || bye ? 'laugh' : 'smile'}
          look={hook ? [-0.7, 0.4] : yourTurn ? [0, 0] : [-0.5, -0.5]} mouth={lipSync(VO, 'bobo', t)}
          armL={pulling ? { a: -40 + tug * 10 } : hook && t >= POP_T ? 'up' : bye ? 'hug' : boboTalks ? 'up' : 'down'} armR={pulling ? { a: -20 + tug * 10 } : hook && t >= POP_T ? 'up' : bye ? 'hug' : 'down'}
          tilt={pulling ? -10 + tug * 4 : 0} squash={boboHook.squash} hop={boboHook.hop + (boboTalks && !hook ? Math.abs(Math.sin(t * 8)) * 20 : 0)} />
        <Reaction kind="!" t={t} at={POP_T + 0.05} until={POP_T + 1.2} x={hook ? 900 : 880} y={f - 470} s={0.6} />
        <Reaction kind="heart" t={t} at={S(CL[0].say) + 0.2} until={E(CL[0].say) + 0.6} x={880} y={f - 470} s={0.7} />
      </ActionStage>
      <PopText t={t} at={POP_T + 0.2} until={segStart(0)} text="VEGGIES!" y={300} size={150} color="#52b788" />
      <PopText t={t} at={POP_T + 0.5} until={segStart(0)} text="English & French" y={450} size={70} color="#ffffff" rot={2} />
      <ThinkTimer t={t} from={E(QZ.ask) + 0.1} to={S(QZ.ans) - 0.1} x={540} y={1000} label="THINK!" />
      <PopText t={t} at={S(QZ.ask)} until={E(QZ.ask) + 0.1} text="QUIZ TIME!" y={300} size={120} color="#ff595e" />
      <PopText t={t} at={S(QZ.ansFr)} until={RECAP0} text="LE BROCOLI !" y={300} size={110} color="#4cc9f0" />
      {c && yourTurn && <PopText t={t} at={E(c.en2) + 0.2} text="YOUR TURN!" y={200} size={110} color="#ffca3a" />}
      <Confetti t={t} at={BYE0} x={W / 2} y={600} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <StarWipe t={t} at={E(PLAN.byeBobo) + 0.4} dur={0.5} hold={5} color="#3b2a4a" x={W / 2} y={H * 0.4} />
    </>
  );
}
