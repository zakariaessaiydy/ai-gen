// TINY SPARKS · Day 73 · 🔤 English/French Words #11 — "Farm Animals in English and French" (LONG 16:9)
// kids-shorts/tiny-sparks/words/day-073-farm-animals-english-french. Cues from VO via K (keys.gen.ts).
// COLD OPEN (no ident): on the farm, the cow is already in the yard at frame 0 — "Moo! Moo!" → "Who says moo? A cow!" →
// ONE premise line (Leo) → 8 animals, one loop each: the animal hops into the yard and makes its sound (speech bubble) →
// the word card (EN) → word ×2 → your turn → French WITH its article ×2 → THE TWIST: "what does a French cow say?" →
// the French sound (meuh · groin-groin · bêê · coin-coin · cot-cot-codet · ouaf · miaou · couic) → one fact/action
// (milk · mud · wool · pond · an egg · good dog · nap in the hay · the barn mouse) — a quiz after 3, 5 and 8 → the French
// round (all 8 cards) → guess-who from the French sound (Leo ✗ the cat for coin-coin) → remember (3) → chant → the
// animals say goodbye → bye (au revoir) + star iris.
import React from 'react';
import { Kid, type KArm } from '../../lib/kids/kid';
import { Critter, critterFaceAt, type CArm, type CritterSpec } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, HOOT_HERO, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { COW, DUCK, HEN, PIG, SHEEP } from '../../lib/kids/farm';
import { Backdrop, PlaceLight, standY } from '../../lib/kids/places';
import { Bubble, Confetti, FONT_TOON, KidsCaptions, PopText, ThinkTimer, WordCard, lipSync, useT } from '../../lib/kids/kit';
import { speechAt } from '../../lib/kids/acting';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, Dust, Reaction, StageWord, StarWipe, directorCam, hopAt, onBeat, type Shot } from '../../lib/kids/energy';
import { exprAt, poseAt } from '../../lib/kids/smooth';
import { voKeys, wordHops, type Span } from '../../lib/kids/cues';
import { EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsWords073', durationInSeconds: 342.4, fps: 30, width: 1920, height: 1080 };

const W = 1920;
const H = 1080;
type Key = keyof typeof K;
const S = (k: Key) => VO[K[k]].start;
const E = (k: Key) => VO[K[k]].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;
const word = (k: Key, i: number) => {
  const w = timeWords(VO[K[k]]);
  return (w[Math.min(i, w.length - 1)] ?? { start: S(k) }).start;
};
const kk = (s: string) => s as Key;
const COLORS = {
  ...CAPTION_COLORS, narrator: '#ffffff', narrator_fr: '#4cc9f0',
  cow: '#ffffff', pig: '#ffafcc', sheep: '#fff3e0', duck: '#ffd23f', hen: '#f3d3b0', dog: '#e0a96d', cat: '#ff9f43', mouse: '#d6d6e2',
};
const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (EASE_OUT(p) - 1) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};
const beat = (x: number) => onBeat(x, 0);

// ── the animals
const DOG: CritterSpec = { id: 'dog', species: 'dog', fur: '#e0a96d', fur2: '#fff1e0', dark: '#8d5a3b', iris: '#5a3e2b' };
const CAT: CritterSpec = { id: 'cat', species: 'cat', fur: '#ff9f43', fur2: '#fff3e0', dark: '#c0611b', iris: '#52b788' };
const MOUSE: CritterSpec = { id: 'mouse', species: 'mouse', fur: '#c9c9d6', fur2: '#ffe0ec', dark: '#7d7d92' };
type Animal = { k: string; spec: CritterSpec; en: string; fr: string; snd: string; frSnd: string; c: string; s: number };
const ANIMALS: Animal[] = [
  { k: 'cow', spec: COW, en: 'cow', fr: 'la vache', snd: 'MOO!', frSnd: 'MEUH !', c: '#ff6fa5', s: 0.8 },
  { k: 'pig', spec: PIG, en: 'pig', fr: 'le cochon', snd: 'OINK!', frSnd: 'GROIN, GROIN !', c: '#ff8fab', s: 0.72 },
  { k: 'sheep', spec: SHEEP, en: 'sheep', fr: 'le mouton', snd: 'BAA!', frSnd: 'BÊÊ !', c: '#c77dff', s: 0.72 },
  { k: 'duck', spec: DUCK, en: 'duck', fr: 'le canard', snd: 'QUACK!', frSnd: 'COIN-COIN !', c: '#ffca3a', s: 0.62 },
  { k: 'hen', spec: HEN, en: 'hen', fr: 'la poule', snd: 'CLUCK!', frSnd: 'COT, COT, CODET !', c: '#ff924c', s: 0.62 },
  { k: 'dog', spec: DOG, en: 'dog', fr: 'le chien', snd: 'WOOF!', frSnd: 'OUAF ! OUAF !', c: '#8d5a3b', s: 0.7 },
  { k: 'cat', spec: CAT, en: 'cat', fr: 'le chat', snd: 'MEOW!', frSnd: 'MIAOU !', c: '#ff9f43', s: 0.62 },
  { k: 'mouse', spec: MOUSE, en: 'mouse', fr: 'la souris', snd: 'SQUEAK!', frSnd: 'COUIC, COUIC !', c: '#7d7d92', s: 0.5 },
];
const byK = (k: string) => ANIMALS.find((a) => a.k === k)!;

// ── place + blocking: the word card on the left, the animal in the middle of the yard, the cast on the right
const PLACE = 'farm' as const;
const KS = 0.5;
const CS = 0.52;
const AX = 900;
const X = { mila: 1310, leo: 1490, bobo: 1690, hoot: 330 };
const yAt = (x: number, s: number) => standY(PLACE, x, W, H, { halfW: 150 * s });

const startOf = (i: number) => (i === 0 ? 0 : S(kk(`${ANIMALS[i].k}_snd`)) - 0.5);
const QUIZ: Record<string, string> = { sheep: 'cow', hen: 'duck', mouse: 'dog' }; // after → answer
const quizSpan = (k: string): [number, number] => [S(kk(`quiz_${k}`)) - 0.3, E(kk(`quiz_${k}_a`)) + 1.4];
const inQuiz = (t: number) => Object.keys(QUIZ).find((k) => within(t, ...quizSpan(k)));
const FR0 = S('fr_round') - 0.3;
const GAME0 = S('game') - 0.3;
const REM0 = S('rem') - 0.3;
const CHANT0 = S('chant') - 0.3;
const END_IRIS = E('bye2') + 0.6;
const animalAt = (t: number) => {
  if (t >= FR0 || inQuiz(t)) return -1;
  let w = 0;
  for (let i = 0; i < ANIMALS.length; i++) if (t >= startOf(i)) w = i;
  return w;
};
const GAME: { s: Key; q: Key; a: Key; k: string }[] = [
  { s: 'gA_s', q: 'gA', a: 'gA_a', k: 'duck' }, { s: 'gB_s', q: 'gB', a: 'gB_a', k: 'cow' }, { s: 'gC_s', q: 'gC', a: 'gC_a', k: 'cat' },
];
const gameAt = (t: number) => (t >= GAME0 && t < REM0 ? GAME.reduce((g, x, i) => (t >= S(x.s) - 0.3 ? i : g), 0) : -1);
const REM: { q: Key; a: Key; k: string }[] = [{ q: 'rq1', a: 'ra1', k: 'cow' }, { q: 'rq2', a: 'ra2', k: 'sheep' }, { q: 'rq3', a: 'ra3', k: 'dog' }];
const remAt = (t: number) => (t >= REM0 && t < CHANT0 ? REM.reduce((g, x, i) => (t >= S(x.q) - 0.3 ? i : g), 0) : -1);

// ── arms + faces
const BYE: Span<KArm> = [S('bye'), 999, 'wave'];
const CHANT: Span<KArm> = [S('chant'), E('all3') + 0.3, 'cheer'];
const useOf = (k: string, who: string): Span<KArm>[] =>
  VO[K[kk(`${k}_use`)]].speaker === who ? [[S(kk(`${k}_use`)), E(kk(`${k}_use`)) + 0.2, 'point']] : [];
const MILA_R = voKeys<KArm>(VO, 'mila', 'present', 'down', [
  [S('cow_q'), E('cow_q'), 'point'], ...Object.keys(QUIZ).map((k): Span<KArm> => [S(kk(`quiz_${k}_a`)), E(kk(`quiz_${k}_a`)), 'point']),
  [S('gA_a'), E('gA_a'), 'point'], CHANT, BYE,
]);
const MILA_L = voKeys<KArm>(VO, null, 'down', 'down', [CHANT, BYE]);
const MILA_E = voKeys<KExpr>(VO, 'mila', 'happy', 'smile', [[0, E('cow_q'), 'wow'], [S('chant'), 999, 'laugh']]);
const LEO_R = voKeys<KArm>(VO, 'leo', 'present', 'down', [
  ...ANIMALS.flatMap((a) => useOf(a.k, 'leo')), [S('premise'), E('premise'), 'wave'], [S('fr_yay'), E('fr_yay'), 'cheer'], [S('gA_leo'), E('gA_leo'), 'point'],
  [S('gC_a'), E('gC_a') + 0.3, 'cheer'], CHANT, BYE,
]);
const LEO_L = voKeys<KArm>(VO, null, 'down', 'down', [[S('fr_yay'), E('fr_yay'), 'cheer'], [S('gC_a'), E('gC_a') + 0.3, 'cheer'], [E('gA_leo') + 0.1, S('gA_a') + 1, 'cover'], CHANT, BYE]);
const LEO_E = voKeys<KExpr>(VO, 'leo', 'happy', 'smile', [
  [S('premise'), E('premise'), 'wow'], [S('gA_leo'), E('gA_leo'), 'proud'], [E('gA_leo'), S('gA_a') + 1, 'oops'], [S('gC_a'), E('gC_a') + 0.6, 'laugh'],
  [S('chant'), 999, 'laugh'],
]);
const BOBO_A = voKeys<CArm>(VO, 'bobo', 'wave', 'down', [
  ...ANIMALS.filter((a) => VO[K[kk(`${a.k}_use`)]].speaker === 'bobo').map((a): Span<CArm> => [S(kk(`${a.k}_use`)), E(kk(`${a.k}_use`)) + 0.2, 'point']),
  [S('gB_a'), E('gB_a'), 'point'], [S('ra2'), E('ra2'), 'cheer'], [S('chant'), E('all3') + 0.3, 'cheer'], [S('bye'), 999, 'wave'],
]);
const BOBO_E = voKeys<KExpr>(VO, 'bobo', 'happy', 'smile', [[S('pig_use'), E('pig_use'), 'laugh'], [S('chant'), 999, 'laugh']]);
const HOOT_A = voKeys<CArm>(VO, 'hoot', 'point', 'down', [[S('bye'), 999, 'wave']]);
const hootOn = (t: number) => !!inQuiz(t) || t >= GAME0;
const HOPS = [...wordHops(VO, [K.chant, K.chant2], 2), S('fr_yay') + 0.2, S('gC_a') + 0.3];

// ── camera
const WIDE = { z: 1.0, x: 960, y: 540 };
const YARD = { z: 1.08, x: 760, y: 500 };
const SHOTS: Shot[] = [{ t: 0, z: 1.25, x: AX - 40, y: 520, move: 'cut', push: 0.012 }];
ANIMALS.forEach((a, i) => {
  if (i) SHOTS.push({ t: startOf(i) + 0.2, z: 1.25, x: AX - 40, y: 520, move: 'smooth', dur: 0.7, push: 0.012 });
  SHOTS.push({ t: S(kk(`${a.k}_2`)) - 0.2, ...YARD, move: 'smooth', dur: 0.6, push: 0.01 });
  SHOTS.push({ t: S(kk(`${a.k}_frs`)) - 0.1, z: 1.4, x: AX, y: 470, move: 'snap' });
  SHOTS.push({ t: S(kk(`${a.k}_use`)) - 0.1, ...WIDE, move: 'smooth', dur: 0.5, push: 0.01 });
});
SHOTS.push({ t: S('premise') - 0.1, ...WIDE, move: 'smooth', dur: 0.6 });
SHOTS.push({ t: S('cow_2') - 0.2, ...YARD, move: 'smooth', dur: 0.6, push: 0.01 });
Object.keys(QUIZ).forEach((k) => SHOTS.push({ t: quizSpan(k)[0], ...WIDE, move: 'smooth', dur: 0.6, push: 0.01 }));
SHOTS.push(
  { t: FR0, ...WIDE, move: 'smooth', dur: 0.6, push: 0.006 },
  { t: GAME0, ...WIDE, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: S('gA_leo') - 0.1, z: 1.45, x: X.leo - 120, y: 560, move: 'whip' },
  { t: S('gA_a') - 0.1, ...WIDE, move: 'whip' },
  { t: REM0, ...WIDE, move: 'cut', push: 0.01 },
  { t: CHANT0, z: 1.04, x: 960, y: 560, move: 'smooth', dur: 0.6, push: 0.015 },
  { t: S('bye') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
);
SHOTS.sort((a, b) => a.t - b.t);
const PUNCHES = ANIMALS.map((a, i) => (i ? S(kk(`${a.k}_snd`)) : 99999)).filter((x) => x < 99999);

// ── props
const MilkBottle: React.FC = () => (
  <g>
    <Vol><path d="M -26,-60 L 26,-60 L 26,-40 Q 40,-30 40,0 L 40,70 Q 0,84 -40,70 L -40,0 Q -40,-30 -26,-40 Z" fill="#ffffff" {...kst(5)} /></Vol>
    <rect x={-30} y={-78} width={60} height={20} rx={6} fill="#4cc9f0" {...kst(4)} />
    <rect x={-40} y={10} width={80} height={30} fill="#bde0fe" />
  </g>
);
const Egg: React.FC = () => <Vol><ellipse rx={34} ry={44} fill="#fff8e7" {...kst(5)} /></Vol>;
const Nest: React.FC = () => (
  <Vol kind="slope"><path d="M -110,0 Q -100,60 0,64 Q 100,60 110,0 Q 60,24 0,24 Q -60,24 -110,0 Z" fill="#d4a373" {...kst(5)} /></Vol>
);
const Mini: React.FC<{ a: Animal; t: number; s?: number; expr?: KExpr }> = ({ a, s = 1, expr = 'happy' }) => (
  <Critter polish acting spec={a.spec} x={0} y={170 * s * (a.k === 'mouse' ? 0.9 : 1)} scale={0.3 * s * (0.8 / Math.max(0.6, a.s))} expr={expr} idle={false} shadow={false} />
);

export default function KidsWords073() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const ai = animalAt(t);
  const a = ai >= 0 ? ANIMALS[ai] : null;
  const q = inQuiz(t);
  const g = gameAt(t);
  const r = remAt(t);
  const hop = hopAt(t, HOPS, { h: 60 });
  const inHop = a && ai > 0 ? hopAt(t, [S(kk(`${a.k}_snd`)) - 0.45], { h: 120, air: 0.45 }) : { hop: 0, squash: 0 };
  const talk = a ? lipSync(VO, a.k, t) : 0;
  const useK = a ? kk(`${a.k}_use`) : null;
  const using = !!useK && within(t, S(useK), E(useK) + 1.2);
  const sleepy = a?.k === 'cat' && using;
  const parade = t >= CHANT0;
  const frIdx = within(t, FR0, GAME0) ? ANIMALS.findIndex((x, i) => within(t, S(kk(`frr_${x.k}`)), i < 7 ? S(kk(`frr_${ANIMALS[i + 1].k}`)) : S('fr_yay'))) : -1;

  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
        <Backdrop place={PLACE} w={W} h={H} t={t} fx={['butterflies']} />
        {/* the word card */}
        {a && (
          <WordCard t={t} at={ai ? S(kk(`${a.k}_q`)) : -1} x={380} y={430} w={500} word={a.en.toUpperCase()} word2={t >= S(kk(`${a.k}_fr`)) ? a.fr : undefined} color={a.c}>
            <g transform="translate(0,-10)"><Mini a={a} t={t} /></g>
          </WordCard>
        )}
        {/* the use-it props */}
        {a && using && a.k === 'pig' && <g transform={`translate(${AX},${yAt(AX, a.s) + 10})`}><Vol kind="slope"><ellipse rx={200} ry={40} fill="#8d5a3b" {...kst(5)} /></Vol></g>}
        {a && using && a.k === 'duck' && <g transform={`translate(${AX},${yAt(AX, a.s) + 10})`}><Vol kind="slope"><ellipse rx={220} ry={46} fill="#48cae4" {...kst(5)} /></Vol></g>}
        {a && using && a.k === 'hen' && <g transform={`translate(${AX + 170},${yAt(AX, a.s) - 30})`}><Nest />{t >= word('hen_use', 8) && <g transform={`translate(0,-20) scale(${popIn(t, word('hen_use', 8))})`}><Egg /></g>}</g>}
        {a && using && a.k === 'cat' && <g transform={`translate(${AX},${yAt(AX, a.s) + 4})`}><Vol kind="slope"><path d="M -220,10 Q -200,-60 0,-70 Q 200,-60 220,10 Z" fill="#f6d365" {...kst(5)} /></Vol></g>}
        <PlaceLight place={PLACE}>
          {/* the animal of the moment */}
          {a && (
            <Critter polish acting spec={a.spec} x={AX} y={yAt(AX, a.s) + (a.k === 'cat' && using ? -30 : 0)} scale={a.s}
              expr={sleepy ? 'sleepy' : talk > 0.05 ? 'happy' : within(t, S(kk(`${a.k}_use`)), E(kk(`${a.k}_use`))) ? 'laugh' : 'smile'}
              look={[0.3, -0.1]} mouth={talk} viseme={a ? speechAt(VO, a.k, t).viseme : undefined} armL={talk > 0.05 ? 'wave' : 'down'} armR={a.k === 'cow' && using ? 'hold' : 'down'}
              holdR={a.k === 'cow' && using ? <g transform="scale(0.7)"><MilkBottle /></g> : undefined}
              hop={inHop.hop + (a.k === 'dog' && using ? Math.abs(Math.sin(t * 8)) * 40 : 0) + (a.k === 'pig' && using ? Math.abs(Math.sin(t * 6)) * 20 : 0)}
              squash={inHop.squash} walking={a.k === 'duck' && using} walk={t * 2} facing={1} />
          )}
          {/* quiz: every animal met so far in a row */}
          {q && (() => {
            const upto = ANIMALS.findIndex((x) => x.k === q);
            const row = ANIMALS.slice(0, upto + 1);
            return row.map((x, i) => {
              const xx = 850 + (i - (row.length - 1) / 2) * (820 / Math.max(3, row.length));
              const hit = t >= S(kk(`quiz_${q}_a`)) && x.k === QUIZ[q];
              return (
                <g key={x.k} transform={`translate(${xx},${yAt(xx, 0.5)}) scale(${popIn(t, quizSpan(q)[0] + i * 0.08)}) translate(${-xx},${-yAt(xx, 0.5)})`}>
                  <Critter polish acting spec={x.spec} x={xx} y={yAt(xx, 0.5)} scale={x.s * 0.62} expr={hit ? 'laugh' : 'smile'} hop={hit ? Math.abs(Math.sin(t * 7)) * 30 : 0}
                    mouth={hit && within(t, S(kk(`quiz_${q}_a`)), E(kk(`quiz_${q}_a`)) + 0.6) ? 0.5 + 0.5 * Math.sin(t * 14) : 0} />
                </g>
              );
            });
          })()}
          {/* the guess-who game + remember: the answer animal pops up in the yard */}
          {(g >= 0 || r >= 0) && (() => {
            const ans = g >= 0 ? GAME[g] : REM[r];
            const at = S(ans.a);
            if (t < at) return null;
            const x = byK(ans.k);
            return (
              <g transform={`translate(${AX},${yAt(AX, x.s)}) scale(${popIn(t, at)}) translate(${-AX},${-yAt(AX, x.s)})`}>
                <Critter polish acting spec={x.spec} x={AX} y={yAt(AX, x.s)} scale={x.s} expr="laugh" hop={Math.abs(Math.sin((t - at) * 6)) * 24} />
              </g>
            );
          })()}
          {/* the finale parade */}
          {parade && ANIMALS.map((x, i) => {
            const xx = 470 + i * 98;
            const talking = (x.k === 'cow' && within(t, S('all'), E('all'))) || (x.k === 'duck' && within(t, S('all2'), E('all2'))) || (x.k === 'dog' && within(t, S('all3'), E('all3')));
            return (
              <Critter polish acting key={x.k} spec={x.spec} x={xx} y={yAt(xx, 0.4) + 10} scale={x.s * 0.5} expr={talking ? 'laugh' : 'happy'} mouth={talking ? lipSync(VO, x.k, t) : 0} viseme={talking ? speechAt(VO, x.k, t).viseme : undefined}
                hop={Math.abs(Math.sin(t * 5 + i)) * 18} armL={t >= S('bye') ? 'wave' : 'down'} />
            );
          })}
          {hootOn(t) && (
            <Critter polish acting spec={HOOT_HERO} x={X.hoot} y={yAt(X.hoot, 0.56)} scale={0.56} expr={lipSync(VO, 'hoot', t) > 0.05 ? 'happy' : 'smile'} look={[0.6, -0.2]} {...speechAt(VO, 'hoot', t)}
              armL={poseAt(t, HOOT_A)} armR={poseAt(t, HOOT_A)} hop={popHop(t)} />
          )}
          <Critter polish acting spec={BOBO_HERO} x={X.bobo} y={yAt(X.bobo, CS)} scale={CS} expr={exprAt(t, BOBO_E)} look={[-0.6, -0.1]} {...speechAt(VO, 'bobo', t)}
            armL={poseAt(t, BOBO_A)} armR={poseAt(t, BOBO_A)} facing={-1} hop={hop.hop} squash={hop.squash} />
          <Kid polish acting spec={LEO_HERO} x={X.leo} y={yAt(X.leo, KS)} scale={KS} expr={exprAt(t, LEO_E)} look={[-0.6, -0.1]} {...speechAt(VO, 'leo', t)}
            armL={poseAt(t, LEO_L)} armR={poseAt(t, LEO_R)} hop={hop.hop} squash={hop.squash} />
          <Kid polish acting spec={MILA_HERO} x={X.mila} y={yAt(X.mila, KS)} scale={KS} expr={exprAt(t, MILA_E)} look={[-0.6, -0.1]} {...speechAt(VO, 'mila', t)}
            armL={poseAt(t, MILA_L)} armR={poseAt(t, MILA_R)} hop={hop.hop} squash={hop.squash} />
        </PlaceLight>
        {a && ai > 0 && <Dust t={t} at={S(kk(`${a.k}_snd`)) - 0.02} x={AX} y={yAt(AX, a.s)} s={0.8} />}
        {/* sound bubbles: English (white) and French (blue, with a flag) */}
        {a && (() => {
          const [fx, fy] = critterFaceAt(AX, yAt(AX, a.s), a.s);
          const en = within(t, S(kk(`${a.k}_snd`)), E(kk(`${a.k}_snd`)) + 0.8);
          const fr = within(t, S(kk(`${a.k}_frs`)), E(kk(`${a.k}_frs`)) + 1.0);
          if (!en && !fr) return null;
          const txt = en ? a.snd : a.frSnd;
          const w = Math.max(260, txt.length * 34 + 60);
          const s = popIn(t, en ? S(kk(`${a.k}_snd`)) : S(kk(`${a.k}_frs`)));
          const bx = AX + 300;
          const by = fy - 160;
          return (
            <g transform={`translate(${bx},${by}) scale(${s}) translate(${-bx},${-by})`}>
              <Bubble x={bx} y={by} w={w} h={120} tx={fx + 90} ty={fy - 40} text={txt} size={txt.length > 10 ? 44 : 56} />
              {fr && <g transform={`translate(${bx - w / 2 + 10},${by - 70})`}>{['#1982c4', '#ffffff', '#ff595e'].map((c, k) => <rect key={c} x={k * 22} y={0} width={22} height={34} fill={c} {...kst(2)} />)}</g>}
            </g>
          );
        })()}
        {/* the French round: all 8 cards */}
        {within(t, FR0, GAME0) && (
          <g transform={`translate(960,430) scale(${popIn(t, FR0)})`}>
            <rect x={-860} y={-330} width={1720} height={640} rx={44} fill="#fff8e7" opacity={0.97} {...kst(8)} />
            {ANIMALS.map((x, i) => {
              const cx = ((i % 4) - 1.5) * 400;
              const cy = i < 4 ? -150 : 160;
              const on = i === frIdx;
              return (
                <g key={x.k} transform={`translate(${cx},${cy}) scale(${on ? 1.12 : 0.95})`}>
                  <rect x={-180} y={-140} width={360} height={280} rx={30} fill="#ffffff" stroke={on ? x.c : KINK} strokeWidth={on ? 12 : 6} />
                  <g transform="translate(0,-40) scale(0.85)"><Mini a={x} t={t} /></g>
                  <text y={110} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={48} fill={x.c} stroke={KINK} strokeWidth={4} paintOrder="stroke">{x.fr}</text>
                </g>
              );
            })}
          </g>
        )}
        {/* the game: the French sound in a big bubble */}
        {g >= 0 && t < S(GAME[g].a) + 1.8 && (
          <g transform={`translate(760,330) scale(${popIn(t, S(GAME[g].s))})`}>
            <rect x={-330} y={-90} width={660} height={180} rx={70} fill="#ffffff" {...kst(8)} />
            <text y={28} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={84} fill="#1982c4">{byK(GAME[g].k).frSnd}</text>
            <g transform="translate(-300,-120)">{['#1982c4', '#ffffff', '#ff595e'].map((c, k) => <rect key={c} x={k * 30} y={0} width={30} height={46} fill={c} {...kst(3)} />)}</g>
            {t < S(GAME[g].a) && <text y={170} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={110} fill="#ffffff" stroke={KINK} strokeWidth={8} paintOrder="stroke">?</text>}
          </g>
        )}
        <StageWord t={t} at={word('pig_use', 9)} until={E('pig_use') + 0.6} text="SPLASH!" x={AX} y={yAt(AX, 0.7) - 560} size={84} color="#8d5a3b" rot={-5} />
        <StageWord t={t} at={word('duck_use', 6)} until={E('duck_use') + 0.6} text="PADDLE!" x={AX} y={yAt(AX, 0.6) - 500} size={80} color="#48cae4" rot={5} />
        <StageWord t={t} at={word('dog_use', 5)} until={E('dog_use') + 0.6} text="GOOD DOG!" x={AX} y={yAt(AX, 0.7) - 560} size={80} color="#e0a96d" rot={-4} />
        <StageWord t={t} at={word('cat_use', 6)} until={E('cat_use') + 1.0} text="ZZZ…" x={AX + 140} y={yAt(AX, 0.6) - 480} size={84} color="#c77dff" rot={6} />
        <StageWord t={t} at={word('cow_use', 5)} until={E('cow_use') + 0.6} text="YUM!" x={AX + 60} y={yAt(AX, 0.8) - 640} size={84} color="#4cc9f0" rot={-6} />
        <Reaction kind="heart" t={t} at={S('sheep_use')} until={E('sheep_use') + 0.6} x={AX} y={yAt(AX, 0.72) - 560} s={0.6} />
        <Reaction kind="heart" t={t} at={S('mouse_use')} until={E('mouse_use') + 0.6} x={AX} y={yAt(AX, 0.5) - 420} s={0.5} />
        <Reaction kind="?" t={t} at={E('gA_leo')} until={S('gA_a') + 0.6} x={X.leo} y={yAt(X.leo, KS) - 470} s={0.5} />
        <Reaction kind="stars" t={t} at={S('fr_yay')} until={E('fr_yay') + 0.4} x={X.leo} y={yAt(X.leo, KS) - 470} s={0.5} />
      </ActionStage>

      {/* screen-space */}
      {ANIMALS.map((x) => (
        <React.Fragment key={x.k}>
          <PopText t={t} at={S(kk(`${x.k}_turn`))} until={S(kk(`${x.k}_fr`)) - 0.1} text="🗣️ YOUR TURN!" y={110} size={90} color="#ffffff" />
          <PopText t={t} at={S(kk(`${x.k}_fr`))} until={S(kk(`${x.k}_frs_q`)) - 0.1} text={`🇫🇷 ${x.fr}`} y={110} size={100} color={x.c} />
          <PopText t={t} at={S(kk(`${x.k}_frs_q`))} until={S(kk(`${x.k}_use`)) - 0.1} text="A FRENCH SOUND!" y={110} size={90} color="#4cc9f0" />
        </React.Fragment>
      ))}
      <PopText t={t} at={S('premise') + 0.2} until={S('cow_2') - 0.1} text="ENGLISH + FRENCH!" y={110} size={100} color="#ffca3a" />
      {Object.keys(QUIZ).map((k) => (
        <React.Fragment key={k}>
          <PopText t={t} at={S(kk(`quiz_${k}`))} until={beat(E(kk(`quiz_${k}`)) + 0.1)} text="QUIZ TIME!" y={110} size={110} color="#ffca3a" />
          <ThinkTimer t={t} from={beat(E(kk(`quiz_${k}`)) + 0.1)} to={S(kk(`quiz_${k}_a`)) - 0.1} x={1780} y={170} r={84} />
          <PopText t={t} at={S(kk(`quiz_${k}_a`))} until={quizSpan(k)[1]} text={`THE ${QUIZ[k].toUpperCase()}!`} y={110} size={120} color={byK(QUIZ[k]).c} />
        </React.Fragment>
      ))}
      <PopText t={t} at={S('fr_round')} until={S('frr_cow') - 0.1} text="ALL IN FRENCH!" y={90} size={90} color="#4cc9f0" />
      <PopText t={t} at={S('fr_yay')} until={GAME0} text="BRAVO!" y={90} size={120} color="#ffca3a" />
      <PopText t={t} at={S('game')} until={S('gA_s') - 0.1} text="WHO IS IT?" y={110} size={120} color="#ffffff" />
      {GAME.map((x) => (
        <React.Fragment key={x.q}>
          <ThinkTimer t={t} from={beat(E(x.q) + 0.1)} to={VO[K[x.q] + 1].start - 0.1} x={1780} y={170} r={84} />
          <PopText t={t} at={S(x.a)} until={S(x.a) + 2.6} text={`${byK(x.k).en.toUpperCase()} · ${byK(x.k).fr}`} y={110} size={96} color={byK(x.k).c} />
        </React.Fragment>
      ))}
      <PopText t={t} at={S('rem')} until={S('rq1') - 0.1} text="LET'S REMEMBER!" y={110} size={110} color="#ffca3a" />
      {REM.map((x) => <ThinkTimer key={x.q} t={t} from={beat(E(x.q) + 0.1)} to={S(x.a) - 0.1} x={1780} y={170} r={84} />)}
      <PopText t={t} at={S('ra1')} until={S('rq2') - 0.2} text="THE COW!" y={110} size={120} color="#ff6fa5" />
      <PopText t={t} at={S('ra2')} until={S('rq3') - 0.2} text="THE SHEEP!" y={110} size={120} color="#c77dff" />
      <PopText t={t} at={S('ra3')} until={CHANT0} text="LE CHIEN!" y={110} size={120} color="#8d5a3b" />
      <PopText t={t} at={S('chant')} until={S('chant2') - 0.05} text="COW, PIG, SHEEP & DUCK!" y={110} size={90} color="#ff6fa5" />
      <PopText t={t} at={S('chant2')} until={S('bye') - 0.1} text="HEN, DOG, CAT & MOUSE!" y={110} size={90} color="#ff924c" />
      <PopText t={t} at={S('bye')} until={END_IRIS} text="AU REVOIR!" y={110} size={120} color="#4cc9f0" />
      <Confetti t={t} at={S('fr_yay')} y={420} />
      <Confetti t={t} at={S('gC_a')} y={420} />
      <Confetti t={t} at={E('chant2')} y={420} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <StarWipe t={t} at={END_IRIS} dur={0.5} hold={5} color="#8ac926" x={W / 2} y={H * 0.45} />
    </>
  );
}
const popHop = (t: number) => {
  const firsts = [...Object.keys(QUIZ).map((k) => quizSpan(k)[0]), GAME0];
  const a = firsts.find((f) => within(t, f, f + 0.5));
  return a !== undefined ? Math.sin(prog(t, a, a + 0.5) * Math.PI) * 60 : 0;
};
