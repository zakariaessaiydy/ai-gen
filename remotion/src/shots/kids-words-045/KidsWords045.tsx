// TINY SPARKS · Day 45 · 🔤 English/French Words #7 — "School Objects in English and French" (Short 9:16, 2:19)
// kids-shorts/tiny-sparks/words/day-045-school-objects-english-french. Line indices from plan.gen.ts.
// ENERGY LAYER standard (Short: no ident, the hook starts in frame 0): Super Bobo's backpack is SO full it wiggles —
// zip… zip… POP! everything bursts out → 6 word loops (each object flies out of the open backpack onto its card:
// Mila "Pencil." · "Pencil!" → YOUR TURN → French ×2 → a tiny sentence with a gag: the pencil draws a sun, the book
// opens, the ruler draws a line, the eraser rubs a scribble away, glue sticks a star and a heart, and finally the
// backpack itself — everything flies back in, ZIP!) → QUIZ (which one is the ruler? think timer) → recap EN then FR
// → bye + star iris. Words: pencil/le crayon · book/le livre · ruler/la règle · eraser/la gomme · glue/la colle ·
// backpack/le sac à dos (TTS reads "dos" as English, so its lines carry tts "dô").
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { AnswerMark, Confetti, FONT_TOON, KidsCaptions, PopText, ThinkTimer, WordCard, lipSync, useT } from '../../lib/kids/kit';
import { ActionStage, Dust, ImpactStar, Reaction, StageWord, StarWipe, directorCam, onBeat, shakeOf, type Shot } from '../../lib/kids/energy';
import { KINK, kst } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { PLAN } from './plan.gen';

export const compositionConfig = { id: 'KidsWords045', durationInSeconds: 139.0, fps: 30, width: 1080, height: 1920 };

const W = 1080;
const H = 1920;
const f = FLOOR(H);
const S = (i: number) => VO[i].start;
const E = (i: number) => VO[i].end;
const word = (i: number, n: number) => {
  const w = timeWords(VO[i]);
  return (w[Math.min(n, w.length - 1)] ?? { start: S(i) }).start;
};
const COLORS = { ...CAPTION_COLORS, narrator_fr: '#4cc9f0' };
const CL = PLAN.words;
const segStart = (k: number) => S(CL[k].en1) - 0.8;
const segEnd = (k: number) => E(CL[k].say) + 1.2;
const SAY_GAG: Record<string, string> = { book: 'FLIP! FLIP!', eraser: 'RUB! RUB!', glue: 'STICK!', backpack: 'ZIP!' };
const RECAP0 = S(PLAN.recapEn[0]) - 2.4;
const BYE0 = S(PLAN.bye) - 0.4;
const QZ = PLAN.quiz[0];
const CARD_Y = 640;
const PIC_Y = CARD_Y - 118; // the picture area of a w=600 WordCard
const BAG: [number, number] = [620, f]; // the backpack on the ground (hook + word loops 1–5)
const BAG_S = 0.62;
const BAG_MOUTH: [number, number] = [BAG[0], BAG[1] - 300 * BAG_S];

// ── the school things, drawn ~300px around (0,0), 3D look
const Pencil: React.FC = () => (
  <g transform="rotate(-35)">
    <Vol kind="tube"><rect x={-34} y={-150} width={68} height={250} rx={8} fill="#ffca3a" {...kst(7)} /></Vol>
    <path d="M -12,-150 L -12,100 M 12,-150 L 12,100" stroke="#e9a23b" strokeWidth={5} opacity={0.7} />
    <path d="M -34,100 L 34,100 L 0,182 Z" fill="#f3d3a4" {...kst(7)} />
    <path d="M -10,158 L 10,158 L 0,182 Z" fill="#3d3247" />
    <Vol kind="tube"><rect x={-36} y={-190} width={72} height={44} rx={6} fill="#c0c7d1" {...kst(6)} /></Vol>
    <Vol><rect x={-34} y={-238} width={68} height={52} rx={18} fill="#ff8fab" {...kst(7)} /></Vol>
  </g>
);
const Book: React.FC<{ open?: number }> = ({ open = 0 }) =>
  open < 0.5 ? (
    <g transform="rotate(-6)">
      <rect x={-118} y={-150} width={236} height={300} rx={10} fill="#ffffff" {...kst(7)} transform="translate(12,10)" />
      <Vol><rect x={-130} y={-160} width={240} height={300} rx={16} fill="#1982c4" {...kst(8)} /></Vol>
      <rect x={-130} y={-160} width={42} height={300} rx={12} fill="#0f5f94" />
      <path d="M 10,-80 L 26,-46 L 64,-42 L 36,-16 L 44,22 L 10,4 L -24,22 L -16,-16 L -44,-42 L -6,-46 Z" fill="#ffd166" {...kst(5)} />
    </g>
  ) : (
    <g>
      <Vol><path d="M 0,-110 Q -90,-140 -190,-110 L -190,130 Q -90,100 0,130 Z" fill="#ffffff" {...kst(8)} /></Vol>
      <Vol><path d="M 0,-110 Q 90,-140 190,-110 L 190,130 Q 90,100 0,130 Z" fill="#ffffff" {...kst(8)} /></Vol>
      <path d="M -190,130 Q -90,104 0,138 Q 90,104 190,130 L 190,150 Q 90,124 0,158 Q -90,124 -190,150 Z" fill="#1982c4" {...kst(6)} />
      {[-70, -35, 0, 35].map((y) => <path key={y} d={`M -160,${y} Q -90,${y - 18} -30,${y}`} fill="none" stroke="#adb5bd" strokeWidth={6} strokeLinecap="round" />)}
      <circle cx={100} cy={-20} r={44} fill="#ffd166" {...kst(5)} />
      <path d="M 50,80 L 90,30 L 120,60 L 150,20 L 170,80 Z" fill="#52b788" {...kst(5)} />
    </g>
  );
const Ruler: React.FC = () => (
  <g transform="rotate(-18)">
    <Vol kind="slope"><rect x={-200} y={-46} width={400} height={92} rx={12} fill="#8ac926" {...kst(8)} /></Vol>
    {Array.from({ length: 21 }).map((_, i) => <line key={i} x1={-180 + i * 18} y1={-46} x2={-180 + i * 18} y2={i % 5 === 0 ? -12 : -26} stroke={KINK} strokeWidth={4} />)}
    {[1, 2, 3, 4].map((n) => <text key={n} x={-180 + n * 90} y={30} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={30} fill={KINK}>{n}</text>)}
  </g>
);
const Eraser: React.FC = () => (
  <g transform="rotate(-12)">
    <Vol><rect x={-140} y={-70} width={280} height={140} rx={30} fill="#ff8fab" {...kst(8)} /></Vol>
    <Vol kind="slope"><rect x={-20} y={-74} width={164} height={148} rx={14} fill="#4cc9f0" {...kst(7)} /></Vol>
    <path d="M 10,-30 L 110,-30 M 10,0 L 90,0" stroke="#ffffff" strokeWidth={10} strokeLinecap="round" opacity={0.8} />
  </g>
);
const Glue: React.FC = () => (
  <g>
    <Vol><rect x={-90} y={-110} width={180} height={250} rx={40} fill="#ffffff" {...kst(8)} /></Vol>
    <rect x={-90} y={-30} width={180} height={90} fill="#ff924c" />
    <rect x={-90} y={-30} width={180} height={90} fill="none" {...kst(5)} />
    <text y={30} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={50} fill="#ffffff" stroke={KINK} strokeWidth={4} paintOrder="stroke">GLUE</text>
    <Vol kind="tube"><path d="M -50,-110 L 50,-110 L 30,-170 L -30,-170 Z" fill="#ff924c" {...kst(7)} /></Vol>
    <Vol kind="tube"><path d="M -14,-170 L 14,-170 L 6,-226 L -6,-226 Z" fill="#ff924c" {...kst(6)} /></Vol>
  </g>
);
// the backpack. open 0..1 = the zip opens (a dark mouth on top) · zip 0..1 = where the zipper pull is · bulge = wiggle
const Backpack: React.FC<{ open?: number; zip?: number; bulge?: number }> = ({ open = 0, zip = 0, bulge = 0 }) => (
  <g transform={`scale(${1 + bulge * 0.06},${1 - bulge * 0.04})`}>
    <path d="M -60,-290 Q 0,-360 60,-290" fill="none" stroke="#c1121f" strokeWidth={22} strokeLinecap="round" />
    <path d="M -60,-290 Q 0,-360 60,-290" fill="none" {...kst(5)} />
    <Vol><path d="M -150,-20 Q -160,-280 0,-300 Q 160,-280 150,-20 Q 150,0 120,0 L -120,0 Q -150,0 -150,-20 Z" fill="#ff595e" {...kst(9)} /></Vol>
    {open > 0.02 && <path d={`M -110,-250 Q 0,${-290 + 60 * open} 110,-250 Q 0,${-250 + 40 * open} -110,-250 Z`} fill="#4a2c3a" />}
    <path d="M -110,-250 Q 0,-300 110,-250" fill="none" stroke="#ffd166" strokeWidth={8} strokeDasharray="10 8" />
    <g transform={`translate(${-100 + 200 * zip},${-262 - Math.sin(zip * Math.PI) * 14})`}>
      <rect x={-9} y={-6} width={18} height={34} rx={6} fill="#ffd166" {...kst(4)} />
    </g>
    <Vol kind="slope"><rect x={-100} y={-150} width={200} height={120} rx={30} fill="#e63946" {...kst(7)} /></Vol>
    <path d="M -80,-120 L 80,-120" stroke="#ffd166" strokeWidth={7} strokeDasharray="10 8" />
    <circle cx={0} cy={-80} r={20} fill="#ffd166" {...kst(4)} />
  </g>
);
const Thing: React.FC<{ kind: string; open?: number }> = ({ kind, open = 0 }) => {
  switch (kind) {
    case 'pencil': return <Pencil />;
    case 'book': return <Book open={open} />;
    case 'ruler': return <Ruler />;
    case 'eraser': return <Eraser />;
    case 'glue': return <Glue />;
    default: return <g transform="translate(0,150)"><Backpack open={open} zip={open > 0.5 ? 0 : 1} /></g>;
  }
};

const Splash: React.FC<{ c: string; s: number }> = ({ c, s }) => (
  <g transform={`scale(${s})`}>
    <path d="M 0,-300 C 120,-310 160,-170 260,-150 C 330,-120 300,20 280,80 C 260,190 160,300 30,280 C -80,330 -220,260 -250,140 C -330,80 -320,-80 -240,-150 C -170,-260 -100,-300 0,-300 Z" fill={c} opacity={0.85} {...kst(8)} />
  </g>
);

// ── the hook: zip… zip… POP!
const HOOK = PLAN.hook;
const ZIP = PLAN.zip;
const ZIPS = [word(ZIP, 0), word(ZIP, 1)];
const POP_T = word(ZIP, 2);
const shots = (): Shot[] => {
  const s: Shot[] = [
    { t: 0, z: 1.35, x: 760, y: 1250, move: 'cut', push: 0.02 }, // Bobo + the wiggling backpack
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
const FLY = 0.5; // an object flies from the backpack to its card in the 0.5 s before the card pops

export default function KidsWords045() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const shake = shakeOf(t, [{ at: POP_T, amp: 12, dur: 0.35 }]);
  const hook = t < segStart(0);
  const k = CL.findIndex((_, i) => t >= segStart(i) && t < segEnd(i));
  const recap = t >= RECAP0 && t < BYE0;
  const quiz = t >= S(QZ.ask) - 0.3 && t < RECAP0;
  const bye = t >= BYE0;
  const c = k >= 0 ? CL[k] : null;
  const yourTurn = c ? t >= E(c.en2) + 0.2 && t < S(c.fr1) - 0.1 : false;
  const milaTalks = VO.some((l) => l.speaker === 'mila' && t >= l.start && t < l.end);
  const boboTalks = VO.some((l) => l.speaker === 'bobo' && t >= l.start && t < l.end);

  // the ground backpack: wiggles (hook), zips open, POPs, stays open; it flies onto its own card for word 6
  const bagWord = CL.length - 1;
  const bagOnGround = t < segStart(bagWord) - FLY;
  const zipP = t < ZIPS[0] ? 0 : t < ZIPS[1] ? 0.35 * EASE_OUT(prog(t, ZIPS[0], ZIPS[0] + 0.3)) : 0.35 + 0.35 * EASE_OUT(prog(t, ZIPS[1], ZIPS[1] + 0.3)) + 0.3 * prog(t, POP_T - 0.15, POP_T);
  const bagOpen = t < POP_T ? 0 : 1;
  const bulge = t < POP_T ? Math.sin(t * 9) * (0.6 + 0.4 * prog(t, 0, POP_T)) : 0;

  // per-word gags (on the card, in its picture area)
  const gag = c ? prog(t, S(c.say) + 0.1, E(c.say)) : 0;
  const bookOpen = c?.obj === 'book' && t >= word(c.say, 0) ? 1 : 0;
  const packOpen = c?.obj === 'backpack' ? (t < word(c.say, 6) ? 1 : 0) : 0;

  const said = (lines: readonly number[], name: (i: number) => string) => {
    for (let r = lines.length - 1; r >= 0; r--) {
      const li = lines[r];
      if (t < S(li)) continue;
      if (t > E(li) + 0.6) return -1;
      const w = timeWords(VO[li]);
      let wi = 0;
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

  // the thing in flight from the backpack to the card
  const flying = CL.map((cc, i) => ({ cc, i, p: prog(t, segStart(i) - FLY + 0.2, segStart(i) + 0.2) })).find((x) => x.p > 0 && x.p < 1);

  return (
    <>
      <ActionStage cam={cam} shake={shake} blur={cam.blur}>
        <Meadow w={W} h={H} t={t} />
        {/* the backpack on the ground */}
        {bagOnGround && (
          <g transform={`translate(${BAG[0]},${BAG[1]}) scale(${BAG_S})`}>
            <Backpack open={bagOpen} zip={zipP} bulge={bulge} />
          </g>
        )}
        {hook && <Reaction kind="?" t={t} at={0.4} until={ZIPS[0] - 0.1} x={BAG[0]} y={BAG[1] - 260} s={0.7} />}
        {ZIPS.map((z, i) => <StageWord key={i} t={t} at={z} until={z + 0.7} text="ZIP!" x={BAG[0] - 150 + i * 60} y={BAG[1] - 300 - i * 60} size={60} color="#ffca3a" rot={-8 + i * 12} />)}
        <ImpactStar t={t} at={POP_T} x={BAG[0]} y={BAG[1] - 200} s={1.1} text="POP!" />
        <Dust t={t} at={POP_T} x={BAG[0]} y={BAG[1]} s={1.2} />
        {/* POP: everything bursts out of the backpack */}
        {t >= POP_T && t < POP_T + 1.4 && CL.slice(0, 5).map((cc, i) => {
          const u = prog(t, POP_T, POP_T + 1.3);
          const dx = (i - 2) * 170;
          return (
            <g key={cc.obj} transform={`translate(${BAG_MOUTH[0] + dx * u * 1.4},${BAG_MOUTH[1] - 900 * u + 700 * u * u}) rotate(${u * (i % 2 ? 300 : -300)}) scale(${0.3 + 0.15 * u})`} opacity={1 - prog(t, POP_T + 1.0, POP_T + 1.3)}>
              <Thing kind={cc.obj} />
            </g>
          );
        })}
        {/* the word card on a splash */}
        {c && (
          <g>
            <g transform={`translate(${W / 2},${CARD_Y})`}>
              <g transform={`rotate(${t * 8})`}><Splash c={c.hex} s={1.32 * EASE_OUT(prog(t, segStart(k), segStart(k) + 0.5)) * (1 - prog(t, segEnd(k) - 0.4, segEnd(k)))} /></g>
            </g>
            <ImpactStar t={t} at={segStart(k) + 0.2} x={W / 2} y={CARD_Y} s={1.4} color={c.hex} />
            <WordCard t={t} at={segStart(k) + 0.2} until={segEnd(k)} x={W / 2} y={CARD_Y} w={600} word={c.en} word2={t >= S(c.fr1) ? c.fr : undefined} color={c.hex}>
              <g transform={`translate(0,10) rotate(${Math.sin(t * 2) * 3})`}>
                {c.obj === 'pencil' && (
                  <g>
                    <g transform={`translate(${-90 + (gag > 0 && gag < 1 ? Math.sin(t * 20) * 10 : 0)},0) scale(0.7)`}><Pencil /></g>
                    {/* the happy sun it draws, ray by ray */}
                    {gag > 0 && (
                      <g transform="translate(120,-20)">
                        <circle r={46} fill="#ffd166" opacity={Math.min(1, gag * 3)} {...kst(5)} />
                        {Array.from({ length: 8 }).map((_, j) => j / 8 < gag * 1.3 - 0.2 && (
                          <line key={j} x1={Math.cos((j * Math.PI) / 4) * 62} y1={Math.sin((j * Math.PI) / 4) * 62} x2={Math.cos((j * Math.PI) / 4) * 92} y2={Math.sin((j * Math.PI) / 4) * 92} stroke="#ffb703" strokeWidth={10} strokeLinecap="round" />
                        ))}
                        {gag > 0.7 && <path d="M -18,8 Q 0,26 18,8" fill="none" {...kst(5)} />}
                        {gag > 0.7 && <g fill={KINK}><circle cx={-14} cy={-10} r={5} /><circle cx={14} cy={-10} r={5} /></g>}
                      </g>
                    )}
                  </g>
                )}
                {c.obj === 'book' && <g transform={`scale(${bookOpen ? 0.85 : 0.9})`}><Book open={bookOpen} /></g>}
                {c.obj === 'ruler' && (
                  <g>
                    <g transform="translate(0,-30) scale(0.9)"><Ruler /></g>
                    {gag > 0 && <path d={`M -180,${80 + 0} L ${-180 + 360 * EASE_INOUT(Math.min(1, gag * 1.4))},${80 - 116 * EASE_INOUT(Math.min(1, gag * 1.4))}`} stroke="#1982c4" strokeWidth={10} strokeLinecap="round" />}
                  </g>
                )}
                {c.obj === 'eraser' && (
                  <g>
                    {/* the scribble (a mistake) is rubbed away */}
                    <path d="M -150,60 q 30,-60 60,0 t 60,0 t 60,0 t 60,0" fill="none" stroke="#3d3247" strokeWidth={10} strokeLinecap="round" opacity={1 - prog(t, word(c.say, 4), E(c.say) - 0.3)} />
                    <g transform={`translate(${gag > 0 ? Math.sin(t * 14) * 90 * (gag < 0.95 ? 1 : 0) : 0},${gag > 0 ? -20 : -40}) scale(0.62)`}><Eraser /></g>
                  </g>
                )}
                {c.obj === 'glue' && (
                  <g>
                    <g transform="translate(-100,0) scale(0.7)"><Glue /></g>
                    {t >= word(c.say, 4) && (
                      <g transform={`translate(80,-60) scale(${EASE_OUT(prog(t, word(c.say, 4), word(c.say, 4) + 0.3))}) rotate(-10)`}>
                        <Vol><path d="M 0,-50 L 14,-16 L 50,-14 L 22,8 L 30,44 L 0,24 L -30,44 L -22,8 L -50,-14 L -14,-16 Z" fill="#ffca3a" {...kst(5)} /></Vol>
                      </g>
                    )}
                    {t >= word(c.say, 5) && (
                      <g transform={`translate(110,60) scale(${EASE_OUT(prog(t, word(c.say, 5), word(c.say, 5) + 0.3))}) rotate(8)`}>
                        <Vol><path d="M 0,40 C -60,0 -50,-50 0,-26 C 50,-50 60,0 0,40 Z" fill="#ff6fa5" {...kst(5)} /></Vol>
                      </g>
                    )}
                  </g>
                )}
                {c.obj === 'backpack' && (
                  <g>
                    <g transform="translate(0,140) scale(0.85)"><Backpack open={packOpen} zip={packOpen ? 0.5 : 1} /></g>
                    {/* everything flies back in */}
                    {CL.slice(0, 5).map((cc, i) => {
                      const a0 = word(c.say, 1) + i * 0.22;
                      const u = EASE_INOUT(prog(t, a0, a0 + 0.55));
                      if (u <= 0 || u >= 1) return null;
                      const sx = (i - 2) * 150;
                      return <g key={cc.obj} transform={`translate(${sx * (1 - u)},${-150 * (1 - u) + 20 * u}) scale(${0.3 * (1 - u) + 0.05})`}><Thing kind={cc.obj} /></g>;
                    })}
                  </g>
                )}
              </g>
            </WordCard>
            {SAY_GAG[c.obj] && <StageWord t={t} at={S(c.say) + 0.3} until={E(c.say) + 0.9} text={SAY_GAG[c.obj]} x={W / 2 + 120} y={1060} size={90} color="#ffca3a" rot={-6} />}
          </g>
        )}
        {/* the next thing comes back down (it burst out of the backpack on POP) — the backpack itself hops up from the ground */}
        {flying && (() => {
          const bag = flying.cc.obj === 'backpack';
          const [x0, y0] = bag ? BAG_MOUTH : [W / 2 + (flying.i - 2) * 220, -220];
          const u = EASE_OUT(flying.p);
          return (
            <g transform={`translate(${x0 + (W / 2 - x0) * u},${y0 + (PIC_Y - y0) * u - (bag ? Math.sin(flying.p * Math.PI) * 220 : 0)}) rotate(${(1 - flying.p) * (bag ? 60 : 200)}) scale(${bag ? 0.6 : 0.3 + 0.45 * flying.p})`}>
              <Thing kind={flying.cc.obj} open={bag ? 1 : 0} />
            </g>
          );
        })()}
        {/* quiz: 3 cards — which one is the ruler? */}
        {quiz && QZ.options.map((o, j) => {
          const x = 220 + j * 320;
          const ok = j === QZ.correct;
          const done = t >= S(QZ.ans);
          const s = EASE_OUT(prog(t, S(QZ.ask) - 0.2 + j * 0.12, S(QZ.ask) + 0.2 + j * 0.12)) * (done && ok ? 1.12 + 0.04 * Math.sin(t * 6) : 1);
          return (
            <g key={o} transform={`translate(${x},640) scale(${s})`} opacity={done && !ok ? 0.4 : 1}>
              <rect x={-140} y={-170} width={280} height={340} rx={36} fill={done && ok ? '#fff3b0' : '#ffffff'} stroke={done && ok ? '#52b788' : KINK} strokeWidth={done && ok ? 12 : 7} />
              <g transform="translate(0,-20) scale(0.55)"><Thing kind={CL[o].obj} /></g>
              <circle cx={-110} cy={-140} r={30} fill={['#ff595e', '#ffca3a', '#4cc9f0'][j]} {...kst(5)} />
              <text x={-110} y={-127} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={36} fill="#ffffff">{j + 1}</text>
              {done && ok && <text y={145} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={34} fill={KINK}>{CL[o].en.toLowerCase()}</text>}
            </g>
          );
        })}
        {quiz && t >= S(QZ.ans) && <AnswerMark t={t} at={S(QZ.ans) + 0.1} ok x={220 + QZ.correct * 320 + 100} y={480} size={0.5} />}
        {/* recap grid: the 6 things, lit as they are said */}
        {recap &&
          CL.map((cc, i) => {
            const x = 210 + (i % 3) * 330;
            const y = 340 + Math.floor(i / 3) * 385;
            const on = frStarted ? i === frItem : i === enItem;
            const s = EASE_OUT(prog(t, RECAP0 + i * 0.08, RECAP0 + i * 0.08 + 0.3)) * (on ? 1.12 : 1);
            return (
              <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
                <rect x={-150} y={-180} width={300} height={370} rx={34} fill={on ? '#fff3b0' : '#ffffff'} {...kst(on ? 9 : 6)} />
                <g transform={`translate(0,-30) scale(${on ? 0.5 : 0.44})`}><Thing kind={cc.obj} /></g>
                <text y={140} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={44} fill={KINK}>{cc.en.toLowerCase()}</text>
                {frStarted && (frItem >= i || t > E(PLAN.recapFr[1])) && (
                  <text y={178} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={cc.fr.length > 10 ? 30 : 34} fill="#1982c4">{cc.fr}</text>
                )}
              </g>
            );
          })}
        <Kid spec={MILA_HERO} x={200} y={f} scale={0.66} expr={bye ? 'laugh' : yourTurn ? 'smile' : hook && t >= POP_T ? 'wow' : 'happy'} look={bye || yourTurn ? [0, 0] : [0.5, -0.5]}
          mouth={lipSync(VO, 'mila', t)} armR={bye ? 'hug' : c && t < E(c.en2) ? 'point' : milaTalks ? 'present' : 'down'} armL={bye ? 'hug' : hook && t >= POP_T ? 'up' : 'hip'} />
        <Critter spec={BOBO_HERO} x={880} y={f} scale={0.6} expr={hook && t < POP_T ? (t >= ZIPS[0] ? 'think' : 'oops') : hook ? 'wow' : boboTalks || bye ? 'laugh' : 'smile'}
          look={hook ? [-0.7, 0.4] : yourTurn ? [0, 0] : [-0.5, -0.5]} mouth={lipSync(VO, 'bobo', t)}
          armL={hook && t < POP_T ? (t >= ZIPS[0] ? { a: 60 + Math.sin(t * 10) * 6 } : 'point') : hook ? 'up' : bye ? 'hug' : boboTalks ? 'up' : 'down'}
          armR={hook && t >= POP_T ? 'up' : bye ? 'hug' : 'down'} hop={boboTalks && !hook ? Math.abs(Math.sin(t * 8)) * 20 : 0} />
        <Reaction kind="!" t={t} at={POP_T + 0.05} until={POP_T + 1.2} x={880} y={f - 470} s={0.6} />
        <Reaction kind="idea" t={t} at={S(CL[0].say) + 0.2} until={E(CL[0].say) + 0.6} x={200} y={f - 560} s={0.6} />
        <Reaction kind="sweat" t={t} at={S(CL[3].say)} until={word(CL[3].say, 3)} x={880} y={f - 470} s={0.6} />
      </ActionStage>
      <PopText t={t} at={POP_T + 0.2} until={segStart(0)} text="SCHOOL THINGS!" y={300} size={130} color="#ff595e" />
      <PopText t={t} at={POP_T + 0.5} until={segStart(0)} text="English & French" y={450} size={70} color="#ffffff" rot={2} />
      <ThinkTimer t={t} from={onBeat(E(QZ.ask) + 0.1, 0)} to={S(QZ.ans) - 0.1} x={540} y={1000} label="THINK!" />
      <PopText t={t} at={S(QZ.ask)} until={E(QZ.ask) + 0.1} text="QUIZ TIME!" y={300} size={120} color="#ff595e" />
      <PopText t={t} at={S(QZ.ansFr)} until={RECAP0} text="LA RÈGLE !" y={300} size={110} color="#4cc9f0" />
      {c && yourTurn && <PopText t={t} at={E(c.en2) + 0.2} text="YOUR TURN!" y={200} size={110} color="#ffca3a" />}
      <Confetti t={t} at={S(QZ.ans)} y={500} dur={1.4} />
      <Confetti t={t} at={BYE0} x={W / 2} y={600} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <StarWipe t={t} at={E(PLAN.byeBobo) + 0.4} dur={0.5} hold={5} color="#3b2a4a" x={W / 2} y={H * 0.4} />
    </>
  );
}
