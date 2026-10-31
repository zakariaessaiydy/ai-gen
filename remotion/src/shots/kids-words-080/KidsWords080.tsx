// TINY SPARKS · Day 80 · 🔤 English/French Words #12 — "Wild Animals in English and French" (Short 9:16, 1:27)
// kids-shorts/tiny-sparks/words/day-080-wild-animals-english-french. Line indices from plan.gen.ts.
// ENERGY LAYER standard (Short: no ident, the hook starts in frame 0): Spark Girl is on a jungle safari — "Shh!
// Something is in the bush!" — the bush rustles, two little eyes peek out → 4 word loops (the bush rustles, the
// animal hops out of it onto its card · "Lion." · "Lion!" → YOUR TURN → French → a sentence with a gag: the lion
// ROARS, the elephant sprays water with its trunk, the monkey munches a banana, the tiger plays peekaboo behind a
// bush) → QUIZ (where is the monkey? think timer) → recap EN then FR → all four wave goodbye + star iris.
// Words: lion/le lion · elephant/l'éléphant · monkey/le singe · tiger/le tigre (the new tiger Critter, Day 80).
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter, type CritterSpec } from '../../lib/kids/critter';
import { CAPTION_COLORS, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR } from '../../lib/kids/sets';
import { Backdrop } from '../../lib/kids/places';
import { AnswerMark, Confetti, FONT_TOON, KidsCaptions, PopText, ThinkTimer, WordCard, lipSync, useT } from '../../lib/kids/kit';
import { ActionStage, Dust, ImpactStar, MotionLines, Reaction, StageWord, StarWipe, directorCam, onBeat, shakeOf, type Shot } from '../../lib/kids/energy';
import { KINK, kst } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { PLAN } from './plan.gen';

export const compositionConfig = { id: 'KidsWords080', durationInSeconds: 86.8, fps: 30, width: 1080, height: 1920 };

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
const segStart = (k: number) => S(CL[k].en1) - 1.6;
const segEnd = (k: number) => E(CL[k].say) + 0.9;
const POP = (k: number) => segStart(k) + 1.15; // the card pops (the animal lands in it)
const SAY_GAG: Record<string, string> = { lion: 'ROAR!', elephant: 'SPLASH!', monkey: 'YUM!', tiger: 'BOO!' };
const RECAP0 = S(PLAN.recapEn[0]) - 1.2;
const BYE0 = S(PLAN.bye) - 0.4;
const QZ = PLAN.quiz[0];
const CARD_Y = 640;
const BUSH: [number, number] = [820, f + 10];

// ── the four wild animals (one-off specs; the tiger is the new Critter species)
const ANIMALS: Record<string, CritterSpec> = {
  lion: { id: 'lion80', species: 'lion', fur: '#ffc857', fur2: '#fff1d0', dark: '#d1782a' },
  elephant: { id: 'ele80', species: 'elephant', fur: '#a9b8cc', fur2: '#f6c7d3', dark: '#5c677d' },
  monkey: { id: 'monk80', species: 'monkey', fur: '#9c6644', fur2: '#f2d0a9', dark: '#6f4518' },
  tiger: { id: 'tig80', species: 'tiger', fur: '#ff9f1c', fur2: '#fff4e0', dark: '#3d2b3d' },
};

// ── a leafy bush (3D look), shake = 0..1 rustle
const Bush: React.FC<{ t: number; shake?: number; s?: number }> = ({ t, shake = 0, s = 1 }) => {
  const wob = shake * Math.sin(t * 38);
  const puffs: [number, number, number, string][] = [
    [-190, -90, 120, '#3a9d5d'], [190, -90, 120, '#3a9d5d'], [-100, -190, 140, '#52b788'], [100, -190, 140, '#52b788'],
    [0, -250, 150, '#74c69d'], [-230, -30, 90, '#2d8a4e'], [230, -30, 90, '#2d8a4e'], [0, -80, 160, '#52b788'],
  ];
  return (
    <g transform={`scale(${s}) rotate(${wob * 3} 0 0)`}>
      {/* one ink silhouette under the union of the puffs, then the fills (no inner outlines) */}
      {puffs.map(([x, y, r], i) => (
        <circle key={`o${i}`} cx={x + wob * 10 * (i % 2 ? 1 : -1)} cy={y} r={r + 6} fill={KINK} />
      ))}
      {puffs.map(([x, y, r, c], i) => (
        <circle key={i} cx={x + wob * 10 * (i % 2 ? 1 : -1)} cy={y} r={r} fill={c} />
      ))}
      {/* ONE light for the whole bush: a soft top-left sheen on each puff + a shaded base (per-puff Vol read as glass bubbles) */}
      {puffs.map(([x, y, r], i) => (
        <ellipse key={`h${i}`} cx={x - r * 0.35 + wob * 10 * (i % 2 ? 1 : -1)} cy={y - r * 0.4} rx={r * 0.38} ry={r * 0.22} fill="#ffffff" opacity={0.18} transform={`rotate(-30 ${x - r * 0.35} ${y - r * 0.4})`} />
      ))}
      <ellipse cx={0} cy={-20} rx={290} ry={70} fill="#1b4332" opacity={0.25} />
      {/* leaf veins + a few flowers */}
      {[[-120, -200], [80, -260], [150, -110], [-40, -100]].map(([x, y], i) => (
        <path key={i} d={`M ${x - 30},${y + 10} Q ${x},${y - 14} ${x + 30},${y + 10}`} fill="none" stroke="#2d6a4f" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
      ))}
      {[[-60, -280, '#ff6fa5'], [170, -170, '#ffca3a'], [-200, -130, '#ffffff']].map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x},${y})`}>
          {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 16} cy={Math.sin((a * Math.PI) / 180) * 16} r={13} fill={c as string} {...kst(3)} />)}
          <circle r={9} fill="#ffb703" />
        </g>
      ))}
    </g>
  );
};

// ── the gag props
const Banana: React.FC<{ bites?: number }> = ({ bites = 0 }) => (
  <g transform="rotate(-30)">
    <Vol kind="tube">
      <path d="M -70,-20 Q 0,70 80,-30 Q 70,10 30,30 Q -30,50 -70,-20 Z" fill="#ffd166" {...kst(6)} />
    </Vol>
    <path d="M -76,-28 L -64,-14" stroke="#6f4518" strokeWidth={10} strokeLinecap="round" />
    {/* bite marks eat the right end */}
    {bites >= 1 && <circle cx={78} cy={-24} r={24} fill="#fff4e0" {...kst(4)} />}
    {bites >= 2 && <circle cx={46} cy={6} r={26} fill="#fff4e0" {...kst(4)} />}
  </g>
);

// a full animal in a card's picture area (feet on the picture's floor)
const CardAnimal: React.FC<{ obj: string; s?: number; expr?: 'smile' | 'happy' | 'wow' | 'laugh' | 'surprised'; mouth?: number; armL?: 'down' | 'wave' | 'up' | 'hold'; armR?: 'down' | 'wave' | 'up' | 'hold'; holdR?: React.ReactNode; dy?: number; hop?: number }> = ({
  obj, s = 0.42, expr = 'happy', mouth = 0, armL = 'down', armR = 'down', holdR, dy = 0, hop = 0,
}) => <Critter spec={ANIMALS[obj]} x={0} y={165 + dy} scale={s} expr={expr} mouth={mouth} look={[0, 0]} armL={armL} armR={armR} holdR={holdR} hop={hop} shadow />;

// ── shots
const HOOK_END = S(PLAN.intro) - 0.1;
const shots = (): Shot[] => {
  const s: Shot[] = [
    { t: 0, z: 1.1, x: 540, y: 1150, move: 'cut', push: 0.02 }, // Mila + the rustling bush
    { t: HOOK_END, z: 1.0, x: 540, y: 960, move: 'snap' },
  ];
  CL.forEach((c, k) => {
    s.push({ t: segStart(k), z: 1.3, x: 760, y: 1300, move: 'snap', push: 0.01 }); // the bush rustles
    s.push({ t: POP(k) - 0.05, z: 1.15, x: 540, y: 780, move: 'snap', push: 0.01 }); // punch in on the card
    s.push({ t: S(c.say) - 0.2, z: 1.0, x: 540, y: 960, move: 'smooth', dur: 0.5 });
  });
  s.push(
    { t: S(QZ.ask) - 0.3, z: 1.0, x: 540, y: 960, move: 'cut' },
    { t: S(QZ.ans) - 0.05, z: 1.2, x: 220 + QZ.correct * 320, y: 700, move: 'snap' },
    { t: RECAP0 - 0.1, z: 1.0, x: 540, y: 960, move: 'smooth', dur: 0.5 },
    { t: BYE0, z: 1.05, x: 560, y: 1150, move: 'smooth', dur: 0.6, push: 0.01 },
  );
  return s;
};
const SHOTS = shots();
const ROAR_T = word(CL[0].say, 3);
const BOO_T = word(CL[3].say, 4);
const PUNCHES = [...CL.map((_, k) => POP(k)), ROAR_T, BOO_T, S(QZ.ans)];
const RUSTLES = [0.3, 1.9, 3.5, ...CL.map((_, k) => segStart(k) + 0.05)];
const rustleOf = (t: number) => Math.max(0, ...RUSTLES.map((r) => (t >= r && t < r + 0.8 ? Math.sin(((t - r) / 0.8) * Math.PI) : 0)));

export default function KidsWords080() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const shake = shakeOf(t, [{ at: ROAR_T, amp: 10, dur: 0.35 }, { at: BOO_T, amp: 6, dur: 0.25 }]);
  const hook = t < segStart(0);
  const k = CL.findIndex((_, i) => t >= segStart(i) && t < segEnd(i));
  const recap = t >= RECAP0 && t < BYE0;
  const quiz = t >= S(QZ.ask) - 0.3 && t < RECAP0;
  const bye = t >= BYE0;
  const c = k >= 0 ? CL[k] : null;
  const yourTurn = c ? t >= E(c.en2) + 0.2 && t < S(c.fr1) - 0.1 : false;
  const milaTalks = VO.some((l) => l.speaker === 'mila' && t >= l.start && t < l.end);

  // the hook: two little eyes peek out of the bush between the rustles
  const peek = hook ? prog(t, 2.6, 2.9) * (1 - prog(t, 4.6, 4.9)) : 0;

  // per-word gags (on the card)
  const gag = c ? prog(t, S(c.say) + 0.1, E(c.say)) : 0;
  const roar = c?.obj === 'lion' && t >= ROAR_T && t < ROAR_T + 1.1;
  const sprayA = c?.obj === 'elephant' ? word(c.say, 6) : 1e9;
  const spray = t >= sprayA && t < E(CL[1].say) + 0.6;
  const bites = c?.obj === 'monkey' ? (t >= word(c.say, 5) ? 2 : t >= word(c.say, 4) ? 1 : 0) : 0;
  const bananaIn = c?.obj === 'monkey' && t >= word(c.say, 3) - 0.2;
  const hideA = c?.obj === 'tiger' ? word(c.say, 2) : 1e9;
  const tigerDown = c?.obj === 'tiger' ? EASE_INOUT(prog(t, hideA, hideA + 0.35)) * (1 - EASE_OUT(prog(t, BOO_T - 0.05, BOO_T + 0.2))) : 0;

  const said = (lines: readonly number[], name: (i: number) => string, per: number) => {
    for (let r = lines.length - 1; r >= 0; r--) {
      const li = lines[r];
      if (t < S(li)) continue;
      if (t > E(li) + 0.6) return -1;
      const w = timeWords(VO[li]);
      let wi = 0;
      let item = -1;
      for (let n = 0; n < per && wi < w.length; n++) {
        if (t >= w[wi].start) item = r * per + n;
        wi += name(r * per + n).split(' ').length;
      }
      return item;
    }
    return -1;
  };
  const enItem = recap ? said(PLAN.recapEn, (i) => CL[i].en, 4) : -1;
  const frItem = recap ? said(PLAN.recapFr, (i) => CL[i].fr, 4) : -1;
  const frStarted = t >= S(PLAN.recapFr[0]) - 0.2;

  // the animal in flight from the bush to its card
  const flying = CL.map((cc, i) => ({ cc, i, p: prog(t, segStart(i) + 0.7, POP(i) + 0.05) })).find((x) => x.p > 0 && x.p < 1);

  return (
    <>
      <ActionStage cam={cam} shake={shake} blur={cam.blur}>
        <Backdrop place="jungle" w={W} h={H} t={t} dim={recap || quiz ? 0.25 : 0} />
        {/* the bush (+ peeking eyes in the hook) */}
        {!bye && (
          <g transform={`translate(${BUSH[0]},${BUSH[1]})`}>
            <Bush t={t} shake={rustleOf(t)} s={0.95} />
            {peek > 0 && (
              <g transform={`translate(-20,${-200 + (1 - peek) * 40})`} opacity={peek}>
                {[-1, 1].map((s2) => (
                  <g key={s2} transform={`translate(${s2 * 34},0)`}>
                    <ellipse rx={24} ry={(t * 30) % 70 < 4 ? 3 : 28} fill="#ffffff" {...kst(5)} />
                    <circle cx={-6} cy={4} r={11} fill={KINK} />
                    <circle cx={-10} cy={-2} r={4} fill="#ffffff" />
                  </g>
                ))}
              </g>
            )}
          </g>
        )}
        {hook && <Reaction kind="?" t={t} at={0.5} until={2.4} x={BUSH[0]} y={BUSH[1] - 420} s={0.7} />}
        {RUSTLES.map((r, i) => (
          <StageWord key={i} t={t} at={r} until={r + 0.8} text="RUSTLE!" x={BUSH[0] - 40 + (i % 2) * 60} y={BUSH[1] - 440 - (i % 2) * 40} size={56} color="#8ac926" rot={-8 + (i % 2) * 14} />
        ))}
        {/* the word card */}
        {c && (
          <g>
            <ImpactStar t={t} at={POP(k)} x={W / 2} y={CARD_Y} s={1.4} color={c.hex} />
            <WordCard t={t} at={POP(k)} until={segEnd(k)} x={W / 2} y={CARD_Y} w={600} word={c.en} word2={t >= S(c.fr1) ? c.fr : undefined} color={c.hex}>
              <g>
                {c.obj === 'lion' && (
                  <g transform={`scale(${roar ? 1 + 0.06 * Math.sin(prog(t, ROAR_T, ROAR_T + 1.1) * Math.PI) : 1})`}>
                    <CardAnimal obj="lion" expr={roar ? 'wow' : 'happy'} mouth={roar ? 1 : 0} armL={roar ? 'up' : 'down'} armR={roar ? 'up' : 'down'} />
                  </g>
                )}
                {c.obj === 'elephant' && (
                  <g>
                    <CardAnimal obj="elephant" expr={spray ? 'laugh' : 'happy'} />
                    {/* a fountain of water from the trunk tip, drops arcing out to both sides */}
                    {spray && Array.from({ length: 14 }).map((_, j) => {
                      const u = ((t - sprayA) * 1.6 + j / 14) % 1;
                      const side = j % 2 ? 1 : -1;
                      const x = 25 + side * u * (120 + (j % 5) * 22);
                      const y = 75 - 300 * u + 340 * u * u;
                      return <ellipse key={j} cx={x} cy={y} rx={10} ry={14} fill="#4cc9f0" opacity={0.9 * (1 - u * 0.6)} {...kst(3)} />;
                    })}
                  </g>
                )}
                {c.obj === 'monkey' && (
                  <CardAnimal obj="monkey" expr={bites ? 'laugh' : 'happy'} mouth={bites && Math.sin(t * 16) > 0 ? 0.6 : 0} armR={bananaIn ? 'hold' : 'down'} holdR={bananaIn ? <g transform="scale(2.2)"><Banana bites={bites} /></g> : undefined} />
                )}
                {c.obj === 'tiger' && (
                  <g>
                    <clipPath id="pic80"><rect x={-270} y={-188} width={540} height={376} rx={32} /></clipPath>
                    <g clipPath="url(#pic80)">
                    <CardAnimal obj="tiger" dy={tigerDown * 260} hop={t >= BOO_T && t < BOO_T + 0.6 ? Math.sin(((t - BOO_T) / 0.6) * Math.PI) * 120 : 0} expr={t >= BOO_T ? 'laugh' : 'happy'} mouth={t >= BOO_T && t < BOO_T + 0.5 ? 1 : 0} armL={t >= BOO_T && t < BOO_T + 1.2 ? 'up' : 'down'} armR={t >= BOO_T && t < BOO_T + 1.2 ? 'up' : 'down'} />
                    {/* the little peekaboo bush in the card */}
                    {t >= hideA - 0.4 && (
                      <g transform={`translate(0,${215 + (1 - EASE_OUT(prog(t, hideA - 0.4, hideA))) * 200 + EASE_INOUT(prog(t, BOO_T + 0.6, BOO_T + 1.0)) * 220}) scale(0.62,0.5)`}>
                        <Bush t={t} shake={t >= BOO_T && t < BOO_T + 0.5 ? 1 : 0} />
                      </g>
                    )}
                    </g>
                  </g>
                )}
              </g>
            </WordCard>
            {SAY_GAG[c.obj] && (
              <StageWord t={t} at={c.obj === 'lion' ? ROAR_T : c.obj === 'tiger' ? BOO_T : c.obj === 'elephant' ? sprayA : word(c.say, 4)} until={E(c.say) + 0.8} text={SAY_GAG[c.obj]} x={W / 2 + 150} y={1040} size={90} color="#ffca3a" rot={-6} />
            )}
          </g>
        )}
        {/* the animal hops out of the bush and up into its card */}
        {flying && (() => {
          const u = EASE_OUT(flying.p);
          const x0 = BUSH[0];
          const y0 = BUSH[1] - 120;
          const x1 = W / 2;
          const y1 = CARD_Y - 118 + 165; // the card's picture floor (WordCard w=600: picture centre at -118)
          return (
            <g>
              <MotionLines t={t} from={segStart(flying.i) + 0.7} to={POP(flying.i)} x={x0 + (x1 - x0) * u} y={y0 + (y1 - y0) * u} dir={-120} s={0.7} />
              <Critter spec={ANIMALS[flying.cc.obj]} x={x0 + (x1 - x0) * u} y={y0 + (y1 - y0) * u - Math.sin(flying.p * Math.PI) * 200} scale={0.24 + 0.18 * u} expr="wow" idle={false} armL="up" armR="up" shadow={false} />
            </g>
          );
        })()}
        {/* quiz: 3 cards — where is the monkey? */}
        {quiz && QZ.options.map((o, j) => {
          const x = 220 + j * 320;
          const ok = j === QZ.correct;
          const done = t >= S(QZ.ans);
          const s = EASE_OUT(prog(t, S(QZ.ask) - 0.2 + j * 0.12, S(QZ.ask) + 0.2 + j * 0.12)) * (done && ok ? 1.12 + 0.04 * Math.sin(t * 6) : 1);
          return (
            <g key={o} transform={`translate(${x},640) scale(${s})`} opacity={done && !ok ? 0.4 : 1}>
              <rect x={-140} y={-170} width={280} height={340} rx={36} fill={done && ok ? '#fff3b0' : '#ffffff'} stroke={done && ok ? '#52b788' : KINK} strokeWidth={done && ok ? 12 : 7} />
              <Critter spec={ANIMALS[CL[o].obj]} x={0} y={110} scale={0.34} expr={done && ok ? 'laugh' : 'smile'} look={[0, 0]} armL={done && ok ? 'wave' : 'down'} />
              <circle cx={-110} cy={-140} r={30} fill={['#ff595e', '#ffca3a', '#4cc9f0'][j]} {...kst(5)} />
              <text x={-110} y={-127} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={36} fill="#ffffff">{j + 1}</text>
              {done && ok && <text y={150} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={34} fill={KINK}>{CL[o].en.toLowerCase()}</text>}
            </g>
          );
        })}
        {quiz && t >= S(QZ.ans) && <AnswerMark t={t} at={S(QZ.ans) + 0.1} ok x={220 + QZ.correct * 320 + 100} y={480} size={0.5} />}
        {/* recap grid: the 4 animals, lit as they are said */}
        {recap &&
          CL.map((cc, i) => {
            const x = 290 + (i % 2) * 500;
            const y = 290 + Math.floor(i / 2) * 430;
            const on = frStarted ? i === frItem : i === enItem;
            const s = EASE_OUT(prog(t, RECAP0 + i * 0.1, RECAP0 + i * 0.1 + 0.3)) * (on ? 1.1 : 1);
            return (
              <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
                <rect x={-210} y={-200} width={420} height={410} rx={40} fill={on ? '#fff3b0' : '#ffffff'} {...kst(on ? 9 : 6)} />
                <Critter spec={ANIMALS[cc.obj]} x={0} y={90} scale={on ? 0.36 : 0.32} expr={on ? 'laugh' : 'smile'} look={[0, 0]} armR={on ? 'wave' : 'down'} />
                <text y={160} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={52} fill={KINK}>{cc.en.toLowerCase()}</text>
                {frStarted && (frItem >= i || t > E(PLAN.recapFr[0])) && (
                  <text y={205} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill="#1982c4">{cc.fr}</text>
                )}
              </g>
            );
          })}
        {/* bye: all four come out to wave */}
        {bye && CL.map((cc, i) => {
          const a = BYE0 + 0.2 + i * 0.25;
          const u = EASE_OUT(prog(t, a, a + 0.4));
          return (
            <g key={cc.obj}>
              <Critter spec={ANIMALS[cc.obj]} x={470 + i * 170} y={f + (1 - u) * 400} scale={0.4} expr="laugh" look={[0, 0]} armR="wave" armL={i % 2 ? 'up' : 'down'} hop={Math.abs(Math.sin(t * 5 + i)) * 14} />
              <Dust t={t} at={a + 0.4} x={470 + i * 170} y={f} s={0.6} />
            </g>
          );
        })}
        <Kid spec={MILA_HERO} x={200} y={f} scale={0.66}
          expr={bye ? 'laugh' : yourTurn ? 'smile' : hook ? (t < 2.4 ? 'think' : 'wow') : roar ? 'surprised' : spray ? 'laugh' : 'happy'}
          look={bye || yourTurn ? [0, 0] : hook ? [0.8, 0.2] : [0.5, -0.5]}
          mouth={lipSync(VO, 'mila', t)}
          armR={bye ? 'wave' : hook && t < 2.4 ? 'think' : c && t < E(c.en2) ? 'point' : milaTalks ? 'present' : 'down'}
          armL={bye ? 'up' : hook ? 'hip' : roar ? 'up' : 'hip'} />
        <Reaction kind="!" t={t} at={POP(0) + 0.05} until={POP(0) + 1.2} x={200} y={f - 560} s={0.6} />
        <Reaction kind="!" t={t} at={ROAR_T} until={ROAR_T + 1.0} x={200} y={f - 560} s={0.6} />
        <Reaction kind="heart" t={t} at={word(CL[2].say, 3)} until={E(CL[2].say) + 0.6} x={200} y={f - 560} s={0.6} />
        <Reaction kind="?" t={t} at={hideA + 0.3} until={BOO_T - 0.1} x={200} y={f - 560} s={0.6} />
      </ActionStage>
      <PopText t={t} at={S(PLAN.intro)} until={segStart(0)} text="WILD ANIMALS!" y={300} size={130} color="#ff924c" />
      <PopText t={t} at={S(PLAN.intro) + 0.4} until={segStart(0)} text="English & French" y={450} size={70} color="#ffffff" rot={2} />
      <ThinkTimer t={t} from={onBeat(E(QZ.ask) + 0.1, 0)} to={S(QZ.ans) - 0.1} x={540} y={1000} label="THINK!" />
      <PopText t={t} at={S(QZ.ask)} until={E(QZ.ask) + 0.1} text="QUIZ TIME!" y={300} size={120} color="#ff595e" />
      <PopText t={t} at={S(QZ.ansFr)} until={RECAP0} text="LE SINGE !" y={300} size={110} color="#4cc9f0" />
      <PopText t={t} at={RECAP0 + 0.2} until={S(PLAN.recapEn[0]) + 0.6} text="ALL TOGETHER!" y={150} size={90} color="#ffca3a" />
      {c && yourTurn && <PopText t={t} at={E(c.en2) + 0.2} text="YOUR TURN!" y={200} size={110} color="#ffca3a" />}
      <Confetti t={t} at={S(QZ.ans)} y={500} dur={1.4} />
      <Confetti t={t} at={BYE0} x={W / 2} y={600} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <StarWipe t={t} at={E(PLAN.aurevoir) + 0.4} dur={0.5} hold={5} color="#3b2a4a" x={W / 2} y={H * 0.4} />
    </>
  );
}
