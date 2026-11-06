// TINY SPARKS · Day 52 · 🔤 English/French Words #8 — "Toys in English and French" (LONG 16:9)
// kids-shorts/tiny-sparks/words/day-052-toys-english-french. Cues from VO via K (keys.gen.ts).
// ENERGY LAYER standard: ident → the playroom toy box (Spark Girl + Super Bobo) → 10 TOYS, one word loop each:
// the toy pops out of the box onto a big WordCard (picture first) → English ×2 + "your turn" → French with its article
// (narrator_fr, ff_siwis) ×2 → use it (the toy plays: the ball bounces, the car drives, the kite flies…) →
// a quiz every 3 toys (3 cards, think timer, ✓) → THE FRENCH ROUND: all 10 cards in a grid, each said in French (repeat
// after me) → FRENCH QUIZ ("Où est la poupée ?" · "Où est le train ?") → put the toys away, bye + star iris.
// Words: ball/le ballon · doll/la poupée · teddy bear/le nounours · car/la voiture · train/le train · kite/le
// cerf-volant · blocks/les cubes · drum/le tambour · robot/le robot · spinning top/la toupie.
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO, BOBO_HERO, CAPTION_COLORS, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR } from '../../lib/kids/sets';
import { Backdrop } from '../../lib/kids/places';
import { AnswerMark, Ball, Confetti, FONT_TOON, KidsCaptions, PopText, ThinkTimer, WordCard, lipSync, useT } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, ImpactStar, SparksIntro, StageWord, StarWipe, directorCam, onBeat, type Shot } from '../../lib/kids/energy';
import { EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsWords052', durationInSeconds: 301.4, fps: 30, width: 1920, height: 1080 };

const W = 1920;
const H = 1080;
const f = FLOOR(H);
type Key = keyof typeof K;
const S = (k: Key) => VO[K[k]].start;
const E = (k: Key) => VO[K[k]].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;
const word = (k: Key, i: number) => {
  const w = timeWords(VO[K[k]]);
  return (w[Math.min(i, w.length - 1)] ?? { start: S(k) }).start;
};
const k = (s: string) => s as Key;
const COLORS = { ...CAPTION_COLORS, narrator_fr: '#ffca3a' };
const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (EASE_OUT(p) - 1) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};

const TOYS: { en: string; fr: string; c: string }[] = [
  { en: 'ball', fr: 'le ballon', c: '#ff595e' },
  { en: 'doll', fr: 'la poupée', c: '#ff6fa5' },
  { en: 'teddy bear', fr: 'le nounours', c: '#e9a35b' },
  { en: 'car', fr: 'la voiture', c: '#4cc9f0' },
  { en: 'train', fr: 'le train', c: '#52b788' },
  { en: 'kite', fr: 'le cerf-volant', c: '#b388ff' },
  { en: 'blocks', fr: 'les cubes', c: '#ffca3a' },
  { en: 'drum', fr: 'le tambour', c: '#ff924c' },
  { en: 'robot', fr: 'le robot', c: '#8d99ae' },
  { en: 'spinning top', fr: 'la toupie', c: '#f15bb5' },
];
const QUIZ: Record<number, { choices: number[]; ans: number }> = { 2: { choices: [0, 1, 2], ans: 1 }, 5: { choices: [3, 4, 5], ans: 5 }, 8: { choices: [6, 7, 8], ans: 6 } };

// ── the toys (origin = centre, ~260 px; `play` = 0..1 while it is being used)
const Toy: React.FC<{ i: number; t: number; play?: number }> = ({ i, t, play = 0 }) => {
  const st = kst(7);
  switch (i) {
    case 0: return <g transform={`translate(0,${-Math.abs(Math.sin(t * 6)) * 80 * play}) rotate(${t * 90 * play})`}><Ball r={95} /></g>;
    case 1: return ( // a doll
      <g transform={`rotate(${Math.sin(t * 3) * 6 * play})`}>
        <Vol><path d="M -80,120 L 0,-20 L 80,120 Z" fill="#ff6fa5" {...st} /></Vol>
        <Vol><circle cx={0} cy={-60} r={58} fill="#ffd6b8" {...st} /></Vol>
        <path d="M -60,-80 Q 0,-150 60,-80 Q 70,-40 56,-20 Q 40,-90 -40,-90 Q -58,-50 -56,-20 Q -72,-50 -60,-80 Z" fill="#8d5a3b" {...kst(5)} />
        <circle cx={-20} cy={-58} r={7} fill={KINK} /><circle cx={20} cy={-58} r={7} fill={KINK} />
        <path d="M -16,-34 Q 0,-22 16,-34" fill="none" {...kst(5)} />
        <circle cx={-34} cy={-40} r={9} fill="#ff8fab" opacity={0.6} /><circle cx={34} cy={-40} r={9} fill="#ff8fab" opacity={0.6} />
      </g>
    );
    case 2: return <g transform="translate(0,150)"><Critter spec={BOBO} x={0} y={0} scale={0.5} expr="happy" idle={false} shadow={false} armL={play > 0 ? 'wave' : 'down'} /></g>;
    case 3: return ( // a car
      <g transform={`translate(${Math.sin(t * 2.5) * 70 * play},0)`}>
        <Vol><path d="M -120,30 L -120,-10 Q -110,-30 -80,-30 L -50,-80 L 60,-80 L 90,-30 Q 120,-30 120,0 L 120,30 Z" fill="#4cc9f0" {...st} /></Vol>
        <path d="M -40,-70 L -40,-34 L 0,-34 L 0,-70 Z M 14,-70 L 14,-34 L 60,-34 Z" fill="#dff4ff" {...kst(4)} />
        {[-70, 70].map((x) => <g key={x} transform={`translate(${x},34) rotate(${t * 400 * play})`}><Vol><circle r={30} fill={KINK} {...kst(4)} /></Vol><circle r={10} fill="#ced4da" /><path d="M -22,0 L 22,0" stroke="#ced4da" strokeWidth={4} /></g>)}
      </g>
    );
    case 4: return ( // a train engine
      <g transform={`translate(${Math.sin(t * 2) * 50 * play},0)`}>
        <Vol><rect x={-130} y={-40} width={170} height={90} rx={14} fill="#52b788" {...st} /></Vol>
        <Vol><rect x={20} y={-110} width={100} height={160} rx={14} fill="#ff595e" {...st} /></Vol>
        <Vol><rect x={-100} y={-100} width={40} height={60} rx={8} fill={KINK} {...kst(4)} /></Vol>
        <rect x={40} y={-90} width={60} height={50} rx={8} fill="#dff4ff" {...kst(4)} />
        {[-90, -20, 70].map((x) => <g key={x} transform={`translate(${x},56) rotate(${t * 300 * play})`}><Vol><circle r={26} fill="#ffca3a" {...kst(4)} /></Vol><path d="M -18,0 L 18,0" stroke={KINK} strokeWidth={4} /></g>)}
        {play > 0 && [0, 1, 2].map((j) => { const p = (t * 0.8 + j / 3) % 1; return <circle key={j} cx={-80 - p * 40} cy={-120 - p * 100} r={16 + p * 24} fill="#ffffff" opacity={0.8 * (1 - p)} {...kst(3)} />; })}
      </g>
    );
    case 5: return ( // a kite
      <g transform={`translate(0,${-Math.sin(t * 2) * 30 * play - 20}) rotate(${Math.sin(t * 2) * 8})`}>
        <Vol><path d="M 0,-120 L 90,-10 L 0,120 L -90,-10 Z" fill="#b388ff" {...st} /></Vol>
        <path d="M 0,-120 L 0,120 M -90,-10 L 90,-10" stroke="#ffffff" strokeWidth={8} />
        <path d={`M 0,120 Q ${-30 + Math.sin(t * 3) * 12},150 0,180 Q 30,210 -10,240`} fill="none" stroke={KINK} strokeWidth={5} />
        {[150, 200].map((y, j) => <path key={y} d={`M -14,${y} l 14,10 l 14,-10`} fill={['#ffca3a', '#ff6fa5'][j]} {...kst(3)} />)}
      </g>
    );
    case 6: return ( // blocks
      <g>
        {[[-70, 60, 'A', '#ff595e'], [70, 60, 'B', '#4cc9f0'], [0, -60, 'C', '#ffca3a']].map(([x, y, l, c], j) => (
          <g key={j} transform={`translate(${x},${(y as number) - (j === 2 ? Math.max(0, 1 - play * 3) * 0 : 0)})`}>
            <Vol><rect x={-58} y={-58} width={116} height={116} rx={14} fill={c as string} {...st} /></Vol>
            <text y={26} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={80} fill="#ffffff" stroke={KINK} strokeWidth={5} paintOrder="stroke">{l}</text>
          </g>
        ))}
      </g>
    );
    case 7: return ( // a drum
      <g transform={`scale(${1 + Math.abs(Math.sin(t * 8)) * 0.05 * play})`}>
        <Vol kind="tube"><rect x={-110} y={-50} width={220} height={130} rx={20} fill="#ff924c" {...st} /></Vol>
        <Vol><ellipse cx={0} cy={-50} rx={110} ry={34} fill="#fff3e0" {...st} /></Vol>
        {[-80, -30, 30, 80].map((x) => <path key={x} d={`M ${x},-30 L ${x + 20},70`} stroke="#ffffff" strokeWidth={6} />)}
        {[-1, 1].map((s) => <g key={s} transform={`translate(${s * 60},${-110 + (play > 0 ? Math.abs(Math.sin(t * 8 + s)) * 40 : 0)}) rotate(${s * 30})`}><rect x={-6} y={-70} width={12} height={90} rx={6} fill="#a0673c" {...kst(4)} /><circle cx={0} cy={-70} r={14} fill="#ffca3a" {...kst(4)} /></g>)}
      </g>
    );
    case 8: return ( // a robot
      <g transform={`rotate(${Math.sin(t * 4) * 5 * play})`}>
        <Vol><rect x={-80} y={-20} width={160} height={130} rx={20} fill="#8d99ae" {...st} /></Vol>
        <Vol><rect x={-64} y={-130} width={128} height={100} rx={20} fill="#adb5bd" {...st} /></Vol>
        <circle cx={-26} cy={-84} r={16} fill={play > 0 && Math.sin(t * 6) > 0 ? '#ffca3a' : '#4cc9f0'} {...kst(4)} />
        <circle cx={26} cy={-84} r={16} fill={play > 0 && Math.sin(t * 6) > 0 ? '#ffca3a' : '#4cc9f0'} {...kst(4)} />
        <rect x={-30} y={-56} width={60} height={12} rx={6} fill={KINK} />
        <path d="M 0,-130 L 0,-160" stroke={KINK} strokeWidth={6} /><circle cx={0} cy={-166} r={12} fill="#ff595e" {...kst(4)} />
        <rect x={-36} y={10} width={72} height={40} rx={8} fill="#ffca3a" {...kst(4)} />
      </g>
    );
    default: return ( // a spinning top
      <g transform={`rotate(${Math.sin(t * 12) * 6 * play})`}>
        <Vol><path d="M -110,-20 Q 0,-110 110,-20 L 0,120 Z" fill="#f15bb5" {...st} /></Vol>
        <path d={`M -90,-30 Q 0,${-70 + Math.sin(t * 20 * play) * 10} 90,-30`} fill="none" stroke="#ffffff" strokeWidth={10} />
        <rect x={-10} y={-120} width={20} height={60} rx={8} fill="#ffca3a" {...kst(4)} />
      </g>
    );
  }
};
const MiniCard: React.FC<{ i: number; t: number; on?: number; label?: string }> = ({ i, t, on = 0, label }) => (
  <g transform={`scale(${1 + on * 0.1})`}>
    <rect x={-150} y={-170} width={300} height={340} rx={36} fill={on ? '#fff3b0' : '#ffffff'} {...kst(on ? 10 : 7)} />
    <g transform="translate(0,-30) scale(0.75)"><Toy i={i} t={t} /></g>
    {label && <text y={140} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={label.length > 11 ? 30 : 38} fill={KINK}>{label}</text>}
  </g>
);

// ── timeline
const WORD0 = (i: number) => S(k(`w${i}a`)) - 0.6;
const WORD1 = (i: number) => (i < 9 ? (QUIZ[i] ? S(k(`q${i}`)) : WORD0(i + 1)) : S('fr_round')) - 0.3;
const FR0 = S('fr_round') - 0.3;
const MILA_X = 300;
const BOBO_X = 1650;
const CARD: [number, number] = [960, 500];
const SHOTS: Shot[] = [
  { t: 0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.01 },
  { t: S('intro') - 0.2, z: 1.5, x: MILA_X + 60, y: 560, move: 'smooth', dur: 0.8 },
  { t: S('intro2') - 0.2, z: 1.5, x: BOBO_X - 40, y: 600, move: 'whip' },
  { t: S('what') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
];
for (let i = 0; i < 10; i++) {
  SHOTS.push({ t: WORD0(i) + 0.3, z: 1.15, x: CARD[0], y: CARD[1] + 20, move: 'snap', push: 0.012 });
  SHOTS.push({ t: S(k(`w${i}u`)) - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 });
}
SHOTS.push({ t: FR0, z: 1.0, x: 960, y: 540, move: 'cut' });
SHOTS.sort((a, b) => a.t - b.t);
const PUNCHES = Array.from({ length: 10 }, (_, i) => WORD0(i) + 0.4);

export default function KidsWords052() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const wi = TOYS.findIndex((_, i) => within(t, WORD0(i), WORD1(i)));
  const qi = [2, 5, 8].find((i) => within(t, S(k(`q${i}`)) - 0.3, WORD0(i + 1)));
  const using = wi >= 0 && t >= S(k(`w${wi}u`)) - 0.1;
  const yay = (qi !== undefined && t >= S(k(`q${qi}a`))) || t >= S('bye') || within(t, S('frq1a'), S('frq2')) || t >= S('frq2a');
  const milaExpr: KExpr = yay ? 'laugh' : talks('mila') ? 'happy' : 'smile';
  const boboExpr: KExpr = yay ? 'laugh' : talks('bobo') ? 'happy' : using ? 'laugh' : 'smile';
  const ri = TOYS.findIndex((_, i) => within(t, S(k(`r${i}`)), i < 9 ? S(k(`r${i + 1}`)) : S('frq')));
  const frQuiz = t >= S('frq1') - 0.3 && t < S('fav') - 0.3;
  const frFirst = t < S('frq2') - 0.3;

  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
        <Backdrop place="playroom" w={W} h={H} t={t} dim={0.1} />
        {/* the toy box */}
        <g transform={`translate(960,${f + 70})`}>
          <Vol><rect x={-200} y={-120} width={400} height={150} rx={20} fill="#ff924c" {...kst(8)} /></Vol>
          <Vol><rect x={-210} y={-150} width={420} height={44} rx={16} fill="#ffca3a" {...kst(7)} /></Vol>
        </g>

        {/* the word card */}
        {wi >= 0 && (
          <g key={wi}>
            <WordCard t={t} at={WORD0(wi)} until={WORD1(wi)} x={CARD[0]} y={CARD[1]} w={540} color={TOYS[wi].c}
              word={TOYS[wi].en} word2={t >= S(k(`w${wi}f`)) ? TOYS[wi].fr : undefined}>
              <g transform="scale(1.12)"><Toy i={wi} t={t} play={using ? 1 : 0} /></g>
            </WordCard>
            <ImpactStar t={t} at={WORD0(wi) + 0.1} x={CARD[0]} y={CARD[1] - 100} s={0.6} color="#fff3b0" />
          </g>
        )}
        {/* quiz every 3 toys */}
        {qi !== undefined && QUIZ[qi].choices.map((c, j) => {
          const a = QUIZ[qi].ans;
          const ans = t >= S(k(`q${qi}a`)) - 0.05;
          return (
            <g key={`${qi}${c}`} transform={`translate(${600 + j * 360},450) scale(${popIn(t, S(k(`q${qi}`)) - 0.2 + j * 0.1)})`}>
              <MiniCard i={c} t={t} on={ans && c === a ? 1 : 0} label={ans ? TOYS[c].en : undefined} />
              {c === a && <AnswerMark t={t} at={S(k(`q${qi}a`))} ok x={120} y={-150} size={0.6} />}
            </g>
          );
        })}
        {/* the French round: all 10 cards */}
        {t >= FR0 && t < S('great') - 0.1 && TOYS.map((toy, i) => (
          <g key={i} transform={`translate(${540 + (i % 5) * 210},${300 + Math.floor(i / 5) * 270}) scale(${0.64 * popIn(t, FR0 + 0.1 + i * 0.06)})`}>
            <MiniCard i={i} t={t} on={ri === i ? 1 : 0} label={toy.fr} />
          </g>
        ))}
        {within(t, S('fav_b') - 0.2, S('bye') - 0.3) && [2, 5].map((c, j) => (
          <g key={`fav${c}`} transform={`translate(${760 + j * 400},450) scale(${popIn(t, (j ? S('fav_m') : S('fav_b')) - 0.1)})`}>
            <MiniCard i={c} t={t} on={1} label={TOYS[c].en} />
          </g>
        ))}
        {/* the French quiz */}
        {frQuiz && (frFirst ? [0, 1, 3] : [5, 4, 8]).map((c, j) => {
          const a = frFirst ? 1 : 4;
          const at = frFirst ? S('frq1a') : S('frq2a');
          return (
            <g key={`f${frFirst}${c}`} transform={`translate(${600 + j * 360},450) scale(${popIn(t, (frFirst ? S('frq1') : S('frq2')) - 0.2 + j * 0.1)})`}>
              <MiniCard i={c} t={t} on={t >= at && c === a ? 1 : 0} label={t >= at ? TOYS[c].fr : undefined} />
              {c === a && <AnswerMark t={t} at={at} ok x={120} y={-150} size={0.6} />}
            </g>
          );
        })}

        <Kid spec={MILA_HERO} x={MILA_X} y={f} scale={0.6} expr={milaExpr} look={[0.6, -0.2]} mouth={lipSync(VO, 'mila', t)}
          armR={talks('mila') && (wi >= 0 || qi !== undefined) ? 'point' : yay ? 'up' : talks('mila') ? 'present' : 'down'} armL={yay ? 'up' : 'down'}
          hop={yay ? Math.abs(Math.sin(t * 7)) * 22 : 0} />
        <Critter spec={BOBO_HERO} x={BOBO_X} y={f} scale={0.62} expr={boboExpr} look={[-0.6, -0.2]} mouth={lipSync(VO, 'bobo', t)}
          armL={talks('bobo') ? 'point' : yay ? 'up' : 'down'} armR={yay || using ? 'up' : 'down'} hop={yay ? Math.abs(Math.sin(t * 7 + 1)) * 22 : 0} />
        {wi >= 0 && using && (
          <StageWord t={t} at={S(k(`w${wi}u`))} until={WORD1(wi)}
            text={['BOING!', 'SO SOFT!', 'HUG!', 'VROOM!', 'CHOO CHOO!', 'WHOOSH!', 'TALL!', 'BOOM BOOM!', 'BEEP BOOP!', 'SPIN!'][wi]}
            x={CARD[0] + 330} y={CARD[1] - 260} size={70} color={TOYS[wi].c} rot={8} />
        )}
      </ActionStage>

      {/* screen-space */}
      <PopText t={t} at={S('intro2') + 0.2} until={S('what') - 0.1} text="TOYS · LES JOUETS" y={130} size={100} color="#ffca3a" />
      {TOYS.map((_, i) => <PopText key={i} t={t} at={E(k(`w${i}c`)) - 0.6} until={S(k(`w${i}f`)) - 0.1} text="YOUR TURN!" y={130} size={100} color="#ffffff" />)}
      {TOYS.map((_, i) => <PopText key={`fr${i}`} t={t} at={S(k(`w${i}f`))} until={S(k(`w${i}u`)) - 0.1} text="EN FRANÇAIS" y={130} size={90} color="#ffca3a" />)}
      {[2, 5, 8].map((i) => <ThinkTimer key={i} t={t} from={onBeat(E(k(`q${i}`)) + 0.1)} to={S(k(`q${i}a`)) - 0.1} x={1760} y={190} r={90} label="THINK!" />)}
      {[2, 5, 8].map((i) => <PopText key={`q${i}`} t={t} at={S(k(`q${i}`))} until={S(k(`q${i}a`)) - 0.1} text={`WHERE IS THE ${TOYS[QUIZ[i].ans].en.toUpperCase()}?`} y={130} size={84} color="#ffffff" />)}
      <PopText t={t} at={S('fr_round')} until={S('r0') - 0.1} text="NOW IN FRENCH!" y={110} size={100} color="#ffca3a" />
      <PopText t={t} at={S('frq')} until={S('frq1') - 0.1} text="FRENCH QUIZ!" y={130} size={110} color="#ffca3a" />
      <PopText t={t} at={S('frq1')} until={S('frq2') - 0.3} text="OÙ EST LA POUPÉE ?" y={130} size={90} color="#ffffff" />
      <PopText t={t} at={S('frq2')} until={S('frq2a') - 0.1} text="OÙ EST LE TRAIN ?" y={130} size={90} color="#ffffff" />
      <ThinkTimer t={t} from={onBeat(E('frq1') + 0.1)} to={S('frq1a') - 0.1} x={1760} y={190} r={90} label="THINK!" />
      <ThinkTimer t={t} from={onBeat(E('frq2') + 0.1)} to={S('frq2a') - 0.1} x={1760} y={190} r={90} label="THINK!" />
      <PopText t={t} at={S('great')} until={S('frq') - 0.1} text="GREAT JOB!" y={130} size={120} color="#ffca3a" />
      <PopText t={t} at={S('fav')} until={S('fav_b') - 0.1} text="YOUR FAVORITE TOY?" y={130} size={100} color="#ffffff" />
      <PopText t={t} at={S('bye')} until={E('bye2') + 0.6} text="AU REVOIR ! BYE-BYE!" y={130} size={100} color="#ffca3a" />
      {[2, 5, 8].map((i) => <Confetti key={i} t={t} at={S(k(`q${i}a`)) + 0.2} y={420} />)}
      <Confetti t={t} at={S('frq2a') + 0.2} y={420} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <SparksIntro t={t} at={0} cast={{ kids: [MILA_HERO, LEO_HERO], buddy: BOBO_HERO }} />
      <StarWipe t={t} at={E('bye2') + 0.6} dur={0.5} hold={5} color="#3b2a4a" x={W / 2} y={H * 0.45} />
    </>
  );
}
