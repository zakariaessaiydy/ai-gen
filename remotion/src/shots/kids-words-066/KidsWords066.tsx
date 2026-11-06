// TINY SPARKS · Day 66 · 🔤 English/French Words #10 — "Body Parts in English and French" (LONG 16:9)
// kids-shorts/tiny-sparks/words/day-066-body-parts-english-french. Cues from VO via K (keys.gen.ts).
// COLD OPEN (no ident): the HEAD card + a ring on Spark Girl's head at frame 0 — "Look! What is this? Head!" → ONE premise
// line (Leo) → 10 words, one loop each (picture card + a ring on Mila's body → English ×2 → your turn → French WITH its
// article ×2 → use it: Bobo or Leo does it): head/la tête · eyes/les yeux · ears/les oreilles · nose/le nez · mouth/la
// bouche · hands/les mains · arms/les bras · tummy/le ventre · legs/les jambes · feet/les pieds — a quiz every 3 (eyes ·
// nose · hands) → the French round (all 10 cards in a grid) → Simon says (touch your head, nose, tummy, clap, wiggle your
// feet) → French quiz (Où est le nez ? · Où sont les pieds ?) → remember (3) → chant → bye (au revoir) + star iris.
import React from 'react';
import { Kid, type KArm } from '../../lib/kids/kid';
import { Critter, critterFaceAt, type CArm } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, HOOT_HERO, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { Backdrop, PlaceLight, standY } from '../../lib/kids/places';
import { Apple, Confetti, FONT_TOON, KidsCaptions, PopText, ThinkTimer, WordCard, lipSync, useT } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, Reaction, StageWord, StarWipe, directorCam, hopAt, onBeat, type Shot } from '../../lib/kids/energy';
import { exprAt, poseAt } from '../../lib/kids/smooth';
import { voKeys, wordHops, type Span } from '../../lib/kids/cues';
import { EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsWords066', durationInSeconds: 336.2, fps: 30, width: 1920, height: 1080 };

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
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff', narrator_fr: '#4cc9f0' };
const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (EASE_OUT(p) - 1) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};
const beat = (x: number) => onBeat(x, 0);

// ── place + blocking: Mila is the big model in the middle, the card on the left, Bobo + Leo on the right
const PLACE = 'playroom' as const;
const MS = 0.86;
const MX = 940;
const BS = 0.6;
const LS = 0.55;
const X = { bobo: 1440, leo: 1720, hoot: 330 };
const yAt = (x: number, s: number) => standY(PLACE, x, W, H, { halfW: 150 * s });
const MY = yAt(MX, MS);
const at = (dx: number, dy: number): [number, number] => [MX + dx * MS, MY + dy * MS];

type Word = { k: string; en: string; fr: string; c: string; rings: [number, number, number][] };
const WORDS: Word[] = [
  { k: 'head', en: 'head', fr: 'la tête', c: '#ff595e', rings: [[0, -560, 215]] },
  { k: 'eyes', en: 'eyes', fr: 'les yeux', c: '#4cc9f0', rings: [[-68, -540, 58], [68, -540, 58]] },
  { k: 'ears', en: 'ears', fr: 'les oreilles', c: '#ff924c', rings: [[-180, -540, 52], [180, -540, 52]] },
  { k: 'nose', en: 'nose', fr: 'le nez', c: '#ff6fa5', rings: [[0, -505, 40]] },
  { k: 'mouth', en: 'mouth', fr: 'la bouche', c: '#f15bb5', rings: [[0, -470, 56]] },
  { k: 'hands', en: 'hands', fr: 'les mains', c: '#ffca3a', rings: [[-252, -448, 64], [252, -448, 64]] },
  { k: 'arms', en: 'arms', fr: 'les bras', c: '#8ac926', rings: [[-168, -395, 96], [168, -395, 96]] },
  { k: 'tummy', en: 'tummy', fr: 'le ventre', c: '#c77dff', rings: [[0, -250, 110]] },
  { k: 'legs', en: 'legs', fr: 'les jambes', c: '#1982c4', rings: [[-42, -100, 70], [42, -100, 70]] },
  { k: 'feet', en: 'feet', fr: 'les pieds', c: '#52b788', rings: [[-50, -18, 62], [50, -18, 62]] },
];
const startOf = (i: number) => (i === 0 ? 0 : S(kk(`${WORDS[i].k}_pic`)) - 0.2);
const QUIZ: Record<string, { after: number; ring: number }> = { ears: { after: 2, ring: 1 }, hands: { after: 5, ring: 3 }, tummy: { after: 7, ring: 5 } };
const quizSpan = (k: string): [number, number] => [S(kk(`quiz_${k}`)) - 0.2, E(kk(`quiz_${k}_a`)) + 1.0];
const inQuiz = (t: number) => Object.keys(QUIZ).find((k) => within(t, ...quizSpan(k)));
const FR0 = S('fr_round') - 0.3;
const GAME0 = S('game') - 0.3;
const FRQ0 = S('frq0') - 0.3;
const REM0 = S('rem') - 0.3;
const END_IRIS = E('bye2') + 0.6;
const wordAt = (t: number) => {
  if (t >= FR0) return -1;
  if (inQuiz(t)) return -1;
  let w = 0;
  for (let i = 0; i < WORDS.length; i++) if (t >= startOf(i)) w = i;
  return w;
};

// ── arms + faces
const BYE: Span<KArm> = [S('bye'), 999, 'wave'];
const GAME_K: Span<KArm>[] = [
  [S('game') + 1.0, S('game2'), 'up'], [S('game2') + 0.5, S('game3'), 'cover'], [S('game3') + 0.5, S('game4'), 'hug'], [S('game4') + 0.4, S('game5'), 'clap'],
];
const MILA_R = voKeys<KArm>(VO, 'mila', 'present', 'down', [
  [startOf(5), startOf(6), { to: [-170, -70] }], [startOf(6), startOf(7) - 0.4, { to: [-185, -40] }], ...GAME_K, [S('frq_a'), E('frq_a2'), 'cover'], [S('ra2'), E('ra2'), 'cover'],
  [S('chant'), E('chant2'), 'cheer'], BYE,
]);
const MILA_L = voKeys<KArm>(VO, null, 'down', 'down', [
  [startOf(5), startOf(6), { to: [-170, -70] }], [startOf(6), startOf(7) - 0.4, { to: [-185, -40] }], ...GAME_K, [S('frq_a'), E('frq_a2'), 'cover'], [S('ra2'), E('ra2'), 'cover'],
  [S('chant'), E('chant2'), 'cheer'], BYE,
]);
const MILA_E = voKeys<KExpr>(VO, 'mila', 'happy', 'smile', [[0, E('w0_pic'), 'wow'], [S('game_yay'), E('game_yay'), 'laugh'], [S('chant'), 999, 'laugh']]);
const LEO_R = voKeys<KArm>(VO, 'leo', 'present', 'down', [
  [S('nose_use'), E('nose_use'), 'hold'], [S('hands_use'), E('hands_use') + 0.3, 'clap'], [S('feet_use'), E('feet_use'), 'cheer'], [S('fr_yay'), E('fr_yay'), 'cheer'],
  ...GAME_K, [S('frq2_a2'), E('frq2_a2'), 'point'], [S('chant'), E('chant2'), 'cheer'], BYE,
]);
const LEO_L = voKeys<KArm>(VO, null, 'down', 'down', [[S('hands_use'), E('hands_use') + 0.3, 'clap'], [S('feet_use'), E('feet_use'), 'cheer'], ...GAME_K, [S('chant'), E('chant2'), 'cheer'], BYE]);
const LEO_E = voKeys<KExpr>(VO, 'leo', 'happy', 'smile', [
  [S('premise'), E('premise'), 'wow'], [word('eyes_use', 4), word('eyes_use', 5), 'wink'], [word('eyes_use', 5) + 0.2, word('eyes_use', 5) + 0.5, 'wink'],
  [word('nose_use', 8), E('nose_use'), 'happy'], [S('fr_yay'), E('fr_yay'), 'wow'], [S('chant'), 999, 'laugh'],
]);
const CGAME: Span<CArm>[] = [
  [S('game') + 1.0, S('game2'), 'up'], [S('game2') + 0.5, S('game3'), 'cheeks'], [S('game3') + 0.5, S('game4'), 'hug'], [S('game4') + 0.4, S('game5'), 'clap'],
];
const BOBO_A = voKeys<CArm>(VO, 'bobo', 'wave', 'down', [
  [S('mouth_use'), E('mouth_use'), 'hold'], [S('arms_use'), E('arms_use') + 0.6, 'up'], [S('tummy_use'), E('tummy_use') + 0.3, 'hug'],
  ...CGAME, [S('chant'), E('chant2'), 'cheer'], [S('bye'), 999, 'wave'],
]);
const BOBO_E = voKeys<KExpr>(VO, 'bobo', 'happy', 'smile', [
  [S('mouth_use'), E('mouth_use'), 'laugh'], [S('tummy_use'), E('tummy_use'), 'oops'], [S('game_yay'), E('game_yay'), 'laugh'], [S('chant'), 999, 'laugh'],
]);
const HOOT_A = voKeys<CArm>(VO, 'hoot', 'point', 'down', [[S('bye'), 999, 'wave']]);
const hootOn = (t: number) => !!inQuiz(t) || within(t, GAME0, S('rem') + 99);
const HOPS = [...wordHops(VO, [K.legs_use], 1).slice(4, 7), ...wordHops(VO, [K.chant, K.chant2]), S('fr_yay') + 0.2, S('game_yay')];
const NODS = [word('head_use', 4), E('head_use') - 0.2];

// ── camera
const WIDE = { z: 1.0, x: 960, y: 540 };
const FACE = { z: 1.3, x: 760, y: MY - 470 * MS };
const SHOTS: Shot[] = [{ t: 0, z: 1.06, x: 900, y: 500, move: 'cut', push: 0.012 }];
WORDS.forEach((w, i) => {
  const a = startOf(i) + 0.2;
  const face = i >= 1 && i <= 4;
  SHOTS.push({ t: a, ...(face ? FACE : { z: 1.06, x: 900, y: 500 }), move: i ? 'smooth' : 'cut', dur: 0.8, push: 0.012 });
  const use = S(kk(`${w.k}_use`));
  const who = VO[K[kk(`${w.k}_use`)]].speaker === 'leo' ? X.leo : X.bobo;
  SHOTS.push({ t: use - 0.1, z: 1.25, x: Math.min(who - 200, W - W / 2.5), y: Math.min(560, critterFaceAt(who, yAt(who, BS), BS)[1] + 160), move: 'whip', push: 0.01 });
  SHOTS.push({ t: E(kk(`${w.k}_use`)) + 0.6, z: 1.06, x: 900, y: 500, move: 'smooth', dur: 0.6 });
});
Object.keys(QUIZ).forEach((k) => SHOTS.push({ t: quizSpan(k)[0], ...WIDE, move: 'smooth', dur: 0.6, push: 0.01 }));
SHOTS.push(
  { t: FR0, ...WIDE, move: 'smooth', dur: 0.6, push: 0.006 },
  { t: GAME0, ...WIDE, move: 'smooth', dur: 0.6, push: 0.01 },
  { t: FRQ0, ...WIDE, move: 'cut', push: 0.01 },
  { t: S('frq_a') - 0.1, ...FACE, move: 'snap' },
  { t: S('frq2_fr') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
  { t: REM0, ...WIDE, move: 'cut', push: 0.01 },
  { t: S('chant') - 0.1, z: 1.06, x: 960, y: 560, move: 'smooth', dur: 0.6, push: 0.02 },
  { t: S('bye') - 0.2, ...WIDE, move: 'smooth', dur: 0.6 },
);
SHOTS.sort((a, b) => a.t - b.t);
const PUNCHES = WORDS.map((_, i) => startOf(i) + 0.2).slice(1);

// ── card pictures (the card's picture slot, origin = centre)
const SKIN = '#f7c59f';
const Icon: React.FC<{ k: string }> = ({ k }) => {
  switch (k) {
    case 'head': return <g><Vol tone="skin"><circle r={92} fill={SKIN} {...kst(6)} /></Vol><circle cx={-30} cy={-6} r={10} fill={KINK} /><circle cx={30} cy={-6} r={10} fill={KINK} /><path d="M -26,32 Q 0,52 26,32" fill="none" {...kst(5)} /><path d="M -92,-20 Q -80,-110 0,-104 Q 80,-110 92,-20 Q 40,-70 -92,-20 Z" fill="#6b4226" {...kst(5)} /></g>;
    case 'eyes': return <g>{[-70, 70].map((x) => <g key={x} transform={`translate(${x},0)`}><ellipse rx={56} ry={44} fill="#ffffff" {...kst(6)} /><circle r={26} fill="#6b4226" /><circle r={12} fill={KINK} /><circle cx={-8} cy={-10} r={7} fill="#ffffff" /></g>)}</g>;
    case 'ears': return <g>{[-80, 80].map((x) => <g key={x} transform={`translate(${x},0) scale(${x < 0 ? -1 : 1},1)`}><Vol tone="skin"><path d="M -20,-70 Q 50,-80 50,0 Q 50,70 -10,70 Q -30,40 -10,20 Q 10,0 -20,-20 Z" fill={SKIN} {...kst(6)} /></Vol><path d="M 0,-40 Q 26,-36 24,4" fill="none" {...kst(4)} /></g>)}</g>;
    case 'nose': return <g><Vol tone="skin"><path d="M -10,-80 Q 10,-20 50,30 Q 30,60 0,50 Q -30,60 -50,30 Q -10,-20 -10,-80 Z" fill={SKIN} {...kst(6)} /></Vol><circle cx={-18} cy={40} r={7} fill={KINK} opacity={0.6} /><circle cx={18} cy={40} r={7} fill={KINK} opacity={0.6} /></g>;
    case 'mouth': return <g><Vol><path d="M -90,-10 Q 0,-40 90,-10 Q 60,70 0,70 Q -60,70 -90,-10 Z" fill="#ff6fa5" {...kst(6)} /></Vol><path d="M -70,0 Q 0,20 70,0 L 60,16 Q 0,30 -60,16 Z" fill="#ffffff" /></g>;
    case 'hands': return <g>{[-70, 70].map((x) => <g key={x} transform={`translate(${x},10) scale(${x < 0 ? -1 : 1},1)`}><Vol tone="skin"><rect x={-34} y={-20} width={68} height={74} rx={26} fill={SKIN} {...kst(5)} />
      {[-24, -8, 8, 24].map((fx, j) => <rect key={j} x={fx - 7} y={-66 + Math.abs(fx) * 0.5} width={14} height={52} rx={7} fill={SKIN} {...kst(4)} />)}
      <rect x={30} y={-6} width={14} height={40} rx={7} fill={SKIN} {...kst(4)} transform="rotate(-40 36 10)" /></Vol></g>)}</g>;
    case 'arms': return <g><Vol tone="skin"><path d="M -100,40 L -20,40 Q 10,40 20,0 L 50,-70 Q 60,-90 80,-80 Q 100,-70 90,-50 L 60,30 Q 40,80 -20,80 L -100,80 Z" fill={SKIN} {...kst(6)} /></Vol><path d="M 0,40 Q 20,10 40,20" fill="none" {...kst(4)} /></g>;
    case 'tummy': return <g><Vol><ellipse rx={100} ry={86} fill="#ffd6a5" {...kst(6)} /></Vol><path d="M -8,6 Q 0,16 8,6" fill="none" {...kst(4)} /></g>;
    case 'legs': return <g>{[-40, 40].map((x) => <g key={x} transform={`translate(${x},0)`}><Vol kind="tube"><rect x={-24} y={-90} width={48} height={150} rx={22} fill="#1982c4" {...kst(5)} /></Vol><Vol><ellipse cx={x < 0 ? -10 : 10} cy={70} rx={40} ry={22} fill="#ff595e" {...kst(5)} /></Vol></g>)}</g>;
    case 'feet': return <g>{[-60, 60].map((x) => <g key={x} transform={`translate(${x},10) scale(${x < 0 ? -1 : 1},1)`}><Vol tone="skin"><path d="M -30,-50 L 20,-50 L 26,10 Q 70,14 70,40 Q 70,60 40,60 L -30,60 Q -40,0 -30,-50 Z" fill={SKIN} {...kst(5)} /></Vol>
      {[0, 1, 2, 3, 4].map((j) => <circle key={j} cx={40 - j * 13 + 20} cy={44 - j * 2} r={6 - j * 0.6} fill={SKIN} {...kst(2.5)} />)}</g>)}</g>;
    default: return null;
  }
};
const Flower: React.FC = () => (
  <g transform="translate(0,-60)">
    <rect x={-4} y={0} width={8} height={70} rx={4} fill="#52b788" {...kst(3)} />
    <Vol>{[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 18} cy={Math.sin((a * Math.PI) / 180) * 18} r={14} fill="#ff6fa5" {...kst(3)} />)}<circle r={10} fill="#ffd23f" {...kst(3)} /></Vol>
  </g>
);
const Rings: React.FC<{ t: number; rings: [number, number, number][]; from: number; c: string }> = ({ t, rings, from, c }) => (
  <g>
    {rings.map(([dx, dy, r], j) => {
      const [x, y] = at(dx, dy);
      const s = popIn(t, from + j * 0.15);
      return (
        <g key={j} transform={`translate(${x},${y}) scale(${s})`}>
          <circle r={r * MS + 10} fill="none" stroke="#ffffff" strokeWidth={14} opacity={0.8} />
          <circle r={r * MS + 10} fill="none" stroke={c} strokeWidth={9} strokeDasharray="20 12" transform={`rotate(${t * 50})`} />
        </g>
      );
    })}
  </g>
);

export default function KidsWords066() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const wi = wordAt(t);
  const w = wi >= 0 ? WORDS[wi] : null;
  const q = inQuiz(t);
  const hop = hopAt(t, HOPS, { h: 60 });
  const nod = within(t, NODS[0], NODS[1]) ? Math.sin((t - NODS[0]) * 12) * 8 : 0;
  const wiggle = within(t, word('ears_use', 5), E('ears_use')) ? Math.sin(t * 18) * 6 : 0;
  const stomp = within(t, word('feet_use', 4), E('feet_use'));
  const wiggleFeet = within(t, S('game5'), E('game5') + 2.2);
  const chew = within(t, word('mouth_use', 6), E('mouth_use') + 0.4);
  const frIdx = within(t, FR0, GAME0) ? WORDS.findIndex((x, i) => within(t, S(kk(`frr_${x.k}`)), i < 9 ? S(kk(`frr_${WORDS[i + 1].k}`)) : S('fr_yay'))) : -1;
  const remRing = within(t, S('ra1'), S('rq2') - 0.2) ? 1 : within(t, S('ra2'), S('rq3') - 0.2) ? 3 : -1;
  const frqRing = within(t, S('frq_a'), S('frq2_fr') - 0.2) ? 3 : within(t, S('frq2_a'), REM0) ? 9 : -1;

  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
        <Backdrop place={PLACE} w={W} h={H} t={t} fx={false} />
        {/* the word card (left) */}
        {w && (
          <WordCard t={t} at={startOf(wi) + (wi ? 0.15 : -1)} x={400} y={430} w={520} word={w.en.toUpperCase()} word2={t >= S(kk(`${w.k}_fr`)) ? w.fr : undefined} color={w.c}>
            <g transform="scale(1.05)"><Icon k={w.k} /></g>
          </WordCard>
        )}
        <PlaceLight place={PLACE}>
          {hootOn(t) && (
            <Critter spec={HOOT_HERO} x={X.hoot} y={yAt(X.hoot, 0.6)} scale={0.6} expr={talksHoot(t) ? 'happy' : 'smile'} look={[0.6, -0.2]} mouth={lipSync(VO, 'hoot', t)}
              armL={poseAt(t, HOOT_A)} armR={poseAt(t, HOOT_A)} hop={popHop(t)} />
          )}
          <Critter spec={BOBO_HERO} x={X.bobo} y={yAt(X.bobo, BS)} scale={BS} expr={exprAt(t, BOBO_E)} look={[-0.6, -0.1]} mouth={chew ? 0.5 + 0.5 * Math.sin(t * 16) : lipSync(VO, 'bobo', t)}
            armL={poseAt(t, BOBO_A)} armR={poseAt(t, BOBO_A)} facing={-1} hop={hop.hop + (wiggleFeet ? Math.abs(Math.sin(t * 10)) * 14 : 0)} squash={hop.squash} tilt={nod + wiggle}
            holdR={within(t, S('mouth_use'), word('mouth_use', 6)) ? <g transform="scale(0.7)"><Apple /></g> : undefined} />
          <Kid spec={LEO_HERO} x={X.leo} y={yAt(X.leo, LS)} scale={LS} expr={exprAt(t, LEO_E)} look={[-0.6, -0.1]} mouth={lipSync(VO, 'leo', t)}
            armL={poseAt(t, LEO_L)} armR={poseAt(t, LEO_R)} legs={stomp || wiggleFeet ? 'walk' : 'stand'} walk={t * 3}
            holdR={within(t, S('nose_use'), E('nose_use')) ? <Flower /> : undefined} hop={hop.hop} squash={hop.squash + (stomp ? Math.abs(Math.sin(t * 9)) * 0.3 : 0)} />
          <Kid spec={MILA_HERO} x={MX} y={MY} scale={MS} expr={exprAt(t, MILA_E)} look={[0, 0]} mouth={lipSync(VO, 'mila', t)}
            armL={poseAt(t, MILA_L)} armR={poseAt(t, MILA_R)} legs={wiggleFeet ? 'walk' : 'stand'} walk={t * 3} hop={hop.hop} squash={hop.squash} />
        </PlaceLight>
        {/* rings on Mila's body */}
        {w && <Rings t={t} rings={w.rings} from={startOf(wi) + (wi ? 0.4 : -1)} c={w.c} />}
        {q && t >= S(kk(`quiz_${q}_a`)) && <Rings t={t} rings={WORDS[QUIZ[q].ring].rings} from={S(kk(`quiz_${q}_a`))} c={WORDS[QUIZ[q].ring].c} />}
        {remRing >= 0 && <Rings t={t} rings={WORDS[remRing].rings} from={remRing === 1 ? S('ra1') : S('ra2')} c={WORDS[remRing].c} />}
        {frqRing >= 0 && <Rings t={t} rings={WORDS[frqRing].rings} from={frqRing === 3 ? S('frq_a') : S('frq2_a')} c={WORDS[frqRing].c} />}
        {/* the French round: all 10 cards */}
        {within(t, FR0, GAME0) && (
          <g transform={`translate(960,430) scale(${popIn(t, FR0)})`}>
            <rect x={-860} y={-330} width={1720} height={640} rx={44} fill="#fff8e7" opacity={0.97} {...kst(8)} />
            {WORDS.map((x, i) => {
              const cx = ((i % 5) - 2) * 330;
              const cy = i < 5 ? -150 : 160;
              const on = i === frIdx;
              return (
                <g key={x.k} transform={`translate(${cx},${cy}) scale(${on ? 1.12 : 0.95})`}>
                  <rect x={-150} y={-140} width={300} height={280} rx={30} fill="#ffffff" stroke={on ? x.c : KINK} strokeWidth={on ? 12 : 6} />
                  <g transform="translate(0,-30) scale(0.75)"><Icon k={x.k} /></g>
                  <text y={104} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={x.fr.length > 10 ? 36 : 44} fill={x.c} stroke={KINK} strokeWidth={4} paintOrder="stroke">{x.fr}</text>
                </g>
              );
            })}
          </g>
        )}
        {/* the remember card: hands → les mains */}
        {within(t, S('rq3') - 0.2, S('chant') - 0.2) && (
          <WordCard t={t} at={S('rq3') - 0.2} x={400} y={430} w={520} word="HANDS" word2={t >= S('ra3') ? 'les mains' : '?'} color="#ffca3a">
            <Icon k="hands" />
          </WordCard>
        )}
        <StageWord t={t} at={NODS[0]} until={E('head_use') + 0.2} text="NOD, NOD!" x={X.bobo} y={yAt(X.bobo, BS) - 560} size={70} color="#ff595e" rot={-5} />
        <StageWord t={t} at={word('eyes_use', 4)} until={E('eyes_use') + 0.3} text="BLINK!" x={X.leo} y={yAt(X.leo, LS) - 520} size={70} color="#4cc9f0" rot={5} />
        <StageWord t={t} at={word('ears_use', 5)} until={E('ears_use') + 0.3} text="WIGGLE!" x={X.bobo} y={yAt(X.bobo, BS) - 560} size={70} color="#ff924c" rot={-5} />
        <StageWord t={t} at={word('nose_use', 7)} until={E('nose_use') + 0.3} text="SNIFF!" x={X.leo} y={yAt(X.leo, LS) - 520} size={70} color="#ff6fa5" rot={5} />
        <StageWord t={t} at={word('mouth_use', 9)} until={E('mouth_use') + 0.5} text="CRUNCH!" x={X.bobo} y={yAt(X.bobo, BS) - 560} size={80} color="#ff595e" rot={-5} />
        <StageWord t={t} at={word('hands_use', 4)} until={E('hands_use') + 0.4} text="CLAP!" x={X.leo} y={yAt(X.leo, LS) - 520} size={80} color="#ffca3a" rot={5} />
        <StageWord t={t} at={word('arms_use', 7)} until={E('arms_use') + 0.6} text="STRETCH!" x={X.bobo} y={yAt(X.bobo, BS) - 600} size={70} color="#8ac926" rot={-5} />
        <StageWord t={t} at={word('tummy_use', 3)} until={E('tummy_use') + 0.3} text="RUMBLE!" x={X.bobo} y={yAt(X.bobo, BS) - 560} size={70} color="#c77dff" rot={5} />
        <StageWord t={t} at={word('legs_use', 4)} until={E('legs_use') + 0.3} text="HOP, HOP!" x={X.bobo} y={yAt(X.bobo, BS) - 600} size={70} color="#1982c4" rot={-5} />
        <StageWord t={t} at={word('feet_use', 4)} until={E('feet_use') + 0.3} text="STOMP!" x={X.leo} y={yAt(X.leo, LS) - 520} size={80} color="#52b788" rot={5} />
        <Reaction kind="heart" t={t} at={word('nose_use', 9)} until={E('nose_use') + 0.4} x={X.leo} y={yAt(X.leo, LS) - 470} s={0.5} />
        <Reaction kind="sweat" t={t} at={word('tummy_use', 3)} until={E('tummy_use')} x={X.bobo + 70} y={yAt(X.bobo, BS) - 450} s={0.55} />
        <Reaction kind="stars" t={t} at={S('fr_yay')} until={E('fr_yay') + 0.4} x={X.leo} y={yAt(X.leo, LS) - 470} s={0.5} />
      </ActionStage>

      {/* screen-space */}
      {WORDS.map((x, i) => (
        <React.Fragment key={x.k}>
          <PopText t={t} at={S(kk(`${x.k}_turn`))} until={S(kk(`${x.k}_fr`)) - 0.1} text="🗣️ YOUR TURN!" y={110} size={90} color="#ffffff" />
          <PopText t={t} at={S(kk(`${x.k}_fr`))} until={S(kk(`${x.k}_use`)) - 0.1} text={`🇫🇷 ${x.fr}`} y={110} size={100} color={x.c} />
        </React.Fragment>
      ))}
      <PopText t={t} at={S('premise') + 0.2} until={S('head_2') - 0.1} text="ENGLISH + FRENCH!" y={110} size={100} color="#ffca3a" />
      {Object.keys(QUIZ).map((k) => (
        <React.Fragment key={k}>
          <PopText t={t} at={S(kk(`quiz_${k}`))} until={beat(E(kk(`quiz_${k}`)) + 0.1)} text="QUIZ TIME!" y={110} size={110} color="#ffca3a" />
          <ThinkTimer t={t} from={beat(E(kk(`quiz_${k}`)) + 0.1)} to={S(kk(`quiz_${k}_a`)) - 0.1} x={1780} y={170} r={84} />
          <PopText t={t} at={S(kk(`quiz_${k}_a`))} until={quizSpan(k)[1]} text={WORDS[QUIZ[k].ring].en.toUpperCase() + '!'} y={110} size={120} color={WORDS[QUIZ[k].ring].c} />
        </React.Fragment>
      ))}
      <PopText t={t} at={S('fr_round')} until={S('frr_head') - 0.1} text="ALL IN FRENCH!" y={90} size={90} color="#4cc9f0" />
      <PopText t={t} at={S('fr_yay')} until={GAME0} text="BRAVO!" y={90} size={120} color="#ffca3a" />
      {(['game', 'game2', 'game3', 'game4', 'game5'] as const).map((g, i) => (
        <PopText key={g} t={t} at={S(g) + (i ? 0 : 0.8)} until={i < 4 ? S((['game2', 'game3', 'game4', 'game5'] as const)[i]) - 0.1 : S('game_yay') - 0.1}
          text={['TOUCH YOUR HEAD!', 'TOUCH YOUR NOSE!', 'TOUCH YOUR TUMMY!', 'CLAP YOUR HANDS!', 'WIGGLE YOUR FEET!'][i]} y={110} size={96} color={['#ff595e', '#ff6fa5', '#c77dff', '#ffca3a', '#52b788'][i]} />
      ))}
      <PopText t={t} at={S('game')} until={S('game') + 0.8} text="SIMON SAYS!" y={110} size={110} color="#ffffff" />
      <PopText t={t} at={S('frq0')} until={S('frq_fr') - 0.05} text="FRENCH QUIZ!" y={110} size={110} color="#4cc9f0" />
      <PopText t={t} at={S('frq_fr')} until={S('frq_a') - 0.1} text="OÙ EST LE NEZ ?" y={110} size={100} color="#ff6fa5" />
      <PopText t={t} at={S('frq2_fr')} until={S('frq2_a') - 0.1} text="OÙ SONT LES PIEDS ?" y={110} size={96} color="#52b788" />
      <ThinkTimer t={t} from={beat(E('frq') + 0.1)} to={S('frq_a') - 0.1} x={1780} y={170} r={84} />
      <ThinkTimer t={t} from={beat(E('frq2') + 0.1)} to={S('frq2_a') - 0.1} x={1780} y={170} r={84} />
      <PopText t={t} at={S('frq_a')} until={S('frq2_fr') - 0.1} text="LE NEZ!" y={110} size={120} color="#ff6fa5" />
      <PopText t={t} at={S('frq2_a')} until={REM0} text="LES PIEDS!" y={110} size={120} color="#52b788" />
      <PopText t={t} at={S('rem')} until={S('rq1') - 0.1} text="LET'S REMEMBER!" y={110} size={110} color="#ffca3a" />
      {[1, 2, 3].map((n) => <ThinkTimer key={n} t={t} from={beat(E(kk(`rq${n}`)) + 0.1)} to={S(kk(`ra${n}`)) - 0.1} x={1780} y={170} r={84} />)}
      <PopText t={t} at={S('ra1')} until={S('rq2') - 0.2} text="OUR EYES!" y={110} size={120} color="#4cc9f0" />
      <PopText t={t} at={S('ra2')} until={S('rq3') - 0.2} text="OUR NOSE!" y={110} size={120} color="#ff6fa5" />
      <PopText t={t} at={S('ra3')} until={S('chant') - 0.2} text="LES MAINS!" y={110} size={120} color="#ffca3a" />
      <PopText t={t} at={S('chant')} until={S('chant2') - 0.05} text="HEAD, EYES, EARS & NOSE!" y={110} size={90} color="#ff595e" />
      <PopText t={t} at={S('chant2')} until={S('bye') - 0.1} text="HANDS, ARMS, TUMMY, TOES!" y={110} size={90} color="#8ac926" />
      <PopText t={t} at={S('bye')} until={END_IRIS} text="AU REVOIR!" y={110} size={120} color="#4cc9f0" />
      <Confetti t={t} at={S('fr_yay')} y={420} />
      <Confetti t={t} at={S('game_yay')} y={420} />
      <Confetti t={t} at={E('chant2')} y={420} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <StarWipe t={t} at={END_IRIS} dur={0.5} hold={5} color="#4cc9f0" x={W / 2} y={H * 0.45} />
    </>
  );
}
const talksHoot = (t: number) => VO.some((l) => l.speaker === 'hoot' && t >= l.start && t < l.end);
const popHop = (t: number) => {
  const firsts = [...Object.keys(QUIZ).map((k) => quizSpan(k)[0]), GAME0];
  const a = firsts.find((f) => within(t, f, f + 0.5));
  return a !== undefined ? Math.sin(prog(t, a, a + 0.5) * Math.PI) * 60 : 0;
};
