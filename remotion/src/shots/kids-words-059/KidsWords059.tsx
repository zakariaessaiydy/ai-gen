// TINY SPARKS · Day 59 · 🔤 English/French Words #9 — "Clothes in English and French" (LONG 16:9)
// kids-shorts/tiny-sparks/words/day-059-clothes-english-french. Cues from VO via K (keys.gen.ts).
// ENERGY LAYER standard: ident → the bedroom (Spark Girl + Captain Leo) → 10 CLOTHES, one word loop each: the item pops
// onto a big WordCard (picture first) → English ×2 + "your turn" → French with its article (narrator_fr, ff_siwis) ×2 →
// use it (the hat bounces, the dress twirls, the boots splash…) → a quiz every 3 (3 cards, think timer, ✓) → THE FRENCH
// ROUND: all 10 cards in a grid, each said in French → WEATHER GAME (snow → coat + scarf + gloves · rain → boots) →
// FRENCH QUIZ ("Où est la robe ?" · "Où sont les bottes ?") → favourites → bye + star iris.
// Words: hat/le chapeau · T-shirt/le tee-shirt · dress/la robe · pants/le pantalon · socks/les chaussettes · shoes/les
// chaussures · coat/le manteau · scarf/l'écharpe · gloves/les gants · boots/les bottes.
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { BOBO_HERO, CAPTION_COLORS, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR } from '../../lib/kids/sets';
import { Backdrop } from '../../lib/kids/places';
import { AnswerMark, Confetti, FONT_TOON, KidsCaptions, PopText, ThinkTimer, WordCard, lipSync, useT } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, ImpactStar, SparksIntro, StageWord, StarWipe, directorCam, onBeat, type Shot } from '../../lib/kids/energy';
import { EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsWords059', durationInSeconds: 334.2, fps: 30, width: 1920, height: 1080 };

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

const ITEMS: { en: string; fr: string; c: string }[] = [
  { en: 'hat', fr: 'le chapeau', c: '#ff595e' },
  { en: 'T-shirt', fr: 'le tee-shirt', c: '#4cc9f0' },
  { en: 'dress', fr: 'la robe', c: '#ff6fa5' },
  { en: 'pants', fr: 'le pantalon', c: '#4361ee' },
  { en: 'socks', fr: 'les chaussettes', c: '#52b788' },
  { en: 'shoes', fr: 'les chaussures', c: '#ff924c' },
  { en: 'coat', fr: 'le manteau', c: '#b388ff' },
  { en: 'scarf', fr: "l'écharpe", c: '#f15bb5' },
  { en: 'gloves', fr: 'les gants', c: '#ffca3a' },
  { en: 'boots', fr: 'les bottes', c: '#ffd166' },
];
const QUIZ: Record<number, { choices: number[]; ans: number }> = { 2: { choices: [0, 1, 2], ans: 1 }, 5: { choices: [3, 4, 5], ans: 5 }, 8: { choices: [6, 7, 8], ans: 6 } };

// ── the clothes (origin = centre, ~260 px; `play` = 0..1 while it is being used)
const Item: React.FC<{ i: number; t: number; play?: number }> = ({ i, t, play = 0 }) => {
  const st = kst(7);
  switch (i) {
    case 0: return ( // a hat
      <g transform={`translate(0,${-Math.abs(Math.sin(t * 5)) * 50 * play}) rotate(${Math.sin(t * 5) * 10 * play})`}>
        <Vol><ellipse cx={0} cy={40} rx={140} ry={34} fill="#ff595e" {...st} /></Vol>
        <Vol><path d="M -80,44 Q -86,-80 0,-84 Q 86,-80 80,44 Z" fill="#ff595e" {...st} /></Vol>
        <path d="M -82,10 Q 0,30 82,10 L 81,34 Q 0,54 -81,34 Z" fill="#ffca3a" {...kst(5)} />
        <circle cx={56} cy={18} r={14} fill="#ffffff" {...kst(4)} />
      </g>
    );
    case 1: return ( // a T-shirt with a star
      <g transform={`rotate(${Math.sin(t * 3) * 6 * play})`}>
        <Vol><path d="M -60,-110 Q 0,-80 60,-110 L 140,-60 L 104,0 L 72,-20 L 72,120 L -72,120 L -72,-20 L -104,0 L -140,-60 Z" fill="#4cc9f0" {...st} /></Vol>
        <path d="M -40,-104 Q 0,-70 40,-104" fill="none" {...kst(5)} />
        <path d="M 0,-20 L 14,12 L 48,14 L 22,36 L 30,70 L 0,52 L -30,70 L -22,36 L -48,14 L -14,12 Z" fill="#ffca3a" {...kst(4)} />
      </g>
    );
    case 2: return ( // a dress (twirls)
      <g>
        <Vol><path d="M -44,-110 L 44,-110 L 50,-30 L -50,-30 Z" fill="#ff6fa5" {...st} /></Vol>
        <path d="M -30,-110 L -36,-140 M 30,-110 L 36,-140" stroke={KINK} strokeWidth={8} strokeLinecap="round" />
        <g transform={`scale(${1 + Math.sin(t * 9) * 0.18 * play},1)`}>
          <Vol><path d="M -50,-34 L 50,-34 L 130,120 Q 0,150 -130,120 Z" fill="#ff6fa5" {...st} /></Vol>
          {[-80, -30, 30, 80].map((x) => <circle key={x} cx={x} cy={80 + Math.abs(x) * 0.2} r={10} fill="#ffffff" opacity={0.85} />)}
        </g>
        <rect x={-52} y={-44} width={104} height={18} rx={8} fill="#ffca3a" {...kst(4)} />
      </g>
    );
    case 3: return ( // pants
      <g transform={`rotate(${Math.sin(t * 6) * 8 * play})`}>
        <Vol><path d="M -86,-120 L 86,-120 L 96,130 L 18,130 L 0,-10 L -18,130 L -96,130 Z" fill="#4361ee" {...st} /></Vol>
        <rect x={-88} y={-128} width={176} height={26} rx={8} fill="#3a0ca3" {...kst(5)} />
        <path d="M -60,-60 Q -40,-50 -40,-30 M 60,-60 Q 40,-50 40,-30" fill="none" stroke="#ffffff" strokeWidth={5} opacity={0.7} />
      </g>
    );
    case 4: return ( // socks
      <g>
        {[-1, 1].map((sx) => (
          <g key={sx} transform={`translate(${sx * 70},0) rotate(${Math.sin(t * 8 + sx) * 10 * play})`}>
            <Vol><path d="M -34,-120 L 34,-120 L 34,40 Q 34,60 60,64 L 80,66 Q 110,72 106,104 Q 100,130 70,128 L -10,128 Q -40,126 -38,94 Z" fill="#52b788" {...st} /></Vol>
            {[-90, -50].map((y) => <rect key={y} x={-34} y={y} width={68} height={16} fill="#ffffff" opacity={0.9} />)}
            <rect x={-38} y={-128} width={76} height={22} rx={8} fill="#ffffff" {...kst(4)} />
          </g>
        ))}
      </g>
    );
    case 5: return ( // shoes (run)
      <g>
        {[-1, 1].map((sx) => (
          <g key={sx} transform={`translate(${sx * 80},${sx * 40 - 20 - Math.abs(Math.sin(t * 10 + sx * 1.5)) * 40 * play})`}>
            <Vol><path d="M -90,10 Q -94,-50 -50,-56 L 0,-60 Q 20,-30 60,-24 Q 100,-18 100,10 Z" fill="#ff924c" {...st} /></Vol>
            <rect x={-96} y={6} width={200} height={22} rx={10} fill="#ffffff" {...kst(5)} />
            <path d="M -40,-48 L -10,-40 M -36,-34 L -6,-28" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" />
          </g>
        ))}
      </g>
    );
    case 6: return ( // a coat
      <g transform={`rotate(${Math.sin(t * 2.5) * 5 * play})`}>
        <Vol><path d="M -60,-120 L 60,-120 L 130,-70 L 116,60 L 84,56 L 84,130 L -84,130 L -84,56 L -116,60 L -130,-70 Z" fill="#b388ff" {...st} /></Vol>
        <path d="M -60,-120 L 0,-60 L 60,-120" fill="#9d6bff" {...kst(5)} />
        <path d="M 0,-60 L 0,130" {...kst(5)} />
        {[-20, 30, 80].map((y) => <circle key={y} cx={20} cy={y} r={10} fill="#ffca3a" {...kst(4)} />)}
        <rect x={-74} y={50} width={46} height={34} rx={8} fill="#9d6bff" {...kst(4)} />
      </g>
    );
    case 7: return ( // a scarf (waves)
      <g>
        <Vol><path d={`M -120,-60 Q 0,-110 120,-60 L 120,-20 Q 0,-70 -120,-20 Z`} fill="#f15bb5" {...st} /></Vol>
        <g transform={`rotate(${Math.sin(t * 4) * 8 * (0.4 + play)} 60 -30)`}>
          <Vol><path d={`M 40,-30 L 90,-30 Q ${110 + Math.sin(t * 5) * 14 * play},40 100,120 L 50,120 Q ${60 + Math.sin(t * 5) * 10 * play},40 40,-30 Z`} fill="#f15bb5" {...st} /></Vol>
          {[20, 70].map((y) => <rect key={y} x={50} y={y} width={56} height={14} fill="#ffffff" opacity={0.9} />)}
          {[56, 72, 88].map((x) => <path key={x} d={`M ${x},120 L ${x},140`} stroke="#f15bb5" strokeWidth={6} strokeLinecap="round" />)}
        </g>
        {[-80, -20].map((x) => <rect key={x} x={x} y={-80} width={14} height={50} fill="#ffffff" opacity={0.8} transform={`rotate(-10 ${x} -60)`} />)}
      </g>
    );
    case 8: return ( // gloves (wiggle)
      <g>
        {[-1, 1].map((sx) => (
          <g key={sx} transform={`translate(${sx * 80},0) scale(${sx},1) rotate(${Math.sin(t * 6 + sx) * 8 * play})`}>
            <Vol><path d="M -40,100 L -44,10 Q -70,-10 -64,-40 Q -56,-56 -40,-30 L -38,-80 Q -36,-100 -22,-100 Q -10,-100 -10,-80 L -8,-110 Q -6,-128 8,-128 Q 22,-126 22,-108 L 22,-96 Q 26,-110 38,-108 Q 50,-104 48,-88 L 46,-60 Q 52,-74 62,-70 Q 72,-64 68,-48 L 58,40 L 50,100 Z" fill="#ffca3a" {...st} /></Vol>
            <rect x={-46} y={88} width={102} height={30} rx={10} fill="#ff924c" {...kst(4)} />
          </g>
        ))}
      </g>
    );
    default: return ( // rain boots (jump + splash)
      <g transform={`translate(0,${-Math.abs(Math.sin(t * 5)) * 60 * play})`}>
        {[-1, 1].map((sx) => (
          <g key={sx} transform={`translate(${sx * 70},0)`}>
            <Vol><path d="M -40,-120 L 34,-120 L 34,60 Q 80,62 90,90 L 90,120 L -40,120 Z" fill="#ffd166" {...st} /></Vol>
            <rect x={-44} y={108} width={138} height={18} rx={8} fill="#ff924c" {...kst(4)} />
            <rect x={-44} y={-128} width={82} height={20} rx={8} fill="#ff924c" {...kst(4)} />
          </g>
        ))}
        {play > 0 && [0, 1, 2, 3, 4].map((j) => {
          const p = (t * 1.4 + j / 5) % 1;
          const a = -Math.PI * (0.15 + 0.7 * (j / 4));
          return <circle key={j} cx={Math.cos(a) * 160 * p} cy={140 + Math.sin(a) * 120 * p + 40 * p * p} r={12 * (1 - p) + 4} fill="#4cc9f0" opacity={1 - p} {...kst(2)} />;
        })}
      </g>
    );
  }
};
const MiniCard: React.FC<{ i: number; t: number; on?: number; label?: string; play?: number }> = ({ i, t, on = 0, label, play = 0 }) => (
  <g transform={`scale(${1 + on * 0.1})`}>
    <rect x={-150} y={-170} width={300} height={340} rx={36} fill={on ? '#fff3b0' : '#ffffff'} {...kst(on ? 10 : 7)} />
    <g transform="translate(0,-30) scale(0.75)"><Item i={i} t={t} play={play} /></g>
    {label && <text y={140} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={label.length > 11 ? 30 : 38} fill={KINK}>{label}</text>}
  </g>
);

// ── timeline
const WORD0 = (i: number) => S(k(`w${i}a`)) - 0.6;
const WORD1 = (i: number) => (i < 9 ? (QUIZ[i] ? S(k(`q${i}`)) : WORD0(i + 1)) : S('fr_round')) - 0.3;
const FR0 = S('fr_round') - 0.3;
const MILA_X = 300;
const LEO_X = 1650;
const CARD: [number, number] = [960, 500];
const SHOTS: Shot[] = [
  { t: 0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.01 },
  { t: S('intro') - 0.2, z: 1.5, x: MILA_X + 60, y: 560, move: 'smooth', dur: 0.8 },
  { t: S('intro2') - 0.2, z: 1.5, x: LEO_X - 40, y: 600, move: 'whip' },
  { t: S('what') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
];
for (let i = 0; i < 10; i++) {
  SHOTS.push({ t: WORD0(i) + 0.3, z: 1.15, x: CARD[0], y: CARD[1] + 20, move: 'snap', push: 0.012 });
  SHOTS.push({ t: S(k(`w${i}u`)) - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 });
}
SHOTS.push({ t: FR0, z: 1.0, x: 960, y: 540, move: 'cut' });
SHOTS.sort((a, b) => a.t - b.t);
const PUNCHES = Array.from({ length: 10 }, (_, i) => WORD0(i) + 0.4);

export default function KidsWords059() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const wi = ITEMS.findIndex((_, i) => within(t, WORD0(i), WORD1(i)));
  const qi = [2, 5, 8].find((i) => within(t, S(k(`q${i}`)) - 0.3, WORD0(i + 1)));
  const using = wi >= 0 && t >= S(k(`w${wi}u`)) - 0.1;
  const yay = (qi !== undefined && t >= S(k(`q${qi}a`))) || t >= S('bye') || within(t, S('frq1a'), S('frq2')) || t >= S('frq2a') || within(t, S('cold_a'), S('rain_q')) || within(t, S('rain_a'), S('frq'));
  const milaExpr: KExpr = yay ? 'laugh' : talks('mila') ? 'happy' : 'smile';
  const leoExpr: KExpr = yay ? 'laugh' : within(t, word('w3u', 6), E('w3u')) ? 'oops' : talks('leo') ? 'happy' : using ? 'laugh' : 'smile';
  const ri = ITEMS.findIndex((_, i) => within(t, S(k(`r${i}`)), i < 9 ? S(k(`r${i + 1}`)) : S('frq')));
  const frQuiz = t >= S('frq1') - 0.3 && t < S('fav') - 0.3;
  const frFirst = t < S('frq2') - 0.3;

  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
        <Backdrop place="bedroom" w={W} h={H} t={t} dim={0.1} />
        {/* the word card */}
        {wi >= 0 && (
          <g key={wi}>
            <WordCard t={t} at={WORD0(wi)} until={WORD1(wi)} x={CARD[0]} y={CARD[1]} w={540} color={ITEMS[wi].c}
              word={ITEMS[wi].en} word2={t >= S(k(`w${wi}f`)) ? ITEMS[wi].fr : undefined}>
              <g transform="scale(1.12)"><Item i={wi} t={t} play={using ? 1 : 0} /></g>
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
              <MiniCard i={c} t={t} on={ans && c === a ? 1 : 0} label={ans ? ITEMS[c].en : undefined} />
              {c === a && <AnswerMark t={t} at={S(k(`q${qi}a`))} ok x={120} y={-150} size={0.6} />}
            </g>
          );
        })}
        {/* the French round: all 10 cards */}
        {t >= FR0 && t < S('great') - 0.1 && ITEMS.map((toy, i) => (
          <g key={i} transform={`translate(${540 + (i % 5) * 210},${300 + Math.floor(i / 5) * 270}) scale(${0.64 * popIn(t, FR0 + 0.1 + i * 0.06)})`}>
            <MiniCard i={i} t={t} on={ri === i ? 1 : 0} label={toy.fr} />
          </g>
        ))}
        {within(t, S('fav_b') - 0.2, S('bye') - 0.3) && [9, 2].map((c, j) => (
          <g key={`fav${c}`} transform={`translate(${760 + j * 400},450) scale(${popIn(t, (j ? S('fav_m') : S('fav_b')) - 0.1)})`}>
            <MiniCard i={c} t={t} on={1} label={ITEMS[c].en} />
          </g>
        ))}
        {/* the weather game */}
        {within(t, S('cold_q') - 0.3, S('frq') - 0.3) && (() => {
          const cold = t < S('rain_q') - 0.3;
          const cards = cold ? [6, 1, 7, 8] : [2, 9, 0];
          const ok = cold ? [6, 7, 8] : [9];
          const at = cold ? S('cold_a') : S('rain_a');
          const q0 = cold ? S('cold_q') : S('rain_q');
          const gap = cold ? 290 : 340;
          return (
            <g key={cold ? 'cold' : 'rain'}>
              {Array.from({ length: 40 }).map((_, j) => {
                const p = (t * (cold ? 0.18 : 0.7) + j * 0.137) % 1;
                const x = (j * 211) % W + (cold ? Math.sin(t * 1.5 + j) * 30 : 0);
                return cold
                  ? <circle key={j} cx={x} cy={p * H} r={7 + (j % 3) * 3} fill="#ffffff" opacity={0.9} />
                  : <path key={j} d={`M ${x},${p * H} l -6,26`} stroke="#4cc9f0" strokeWidth={5} strokeLinecap="round" opacity={0.8} />;
              })}
              {cards.map((c, j) => (
                <g key={c} transform={`translate(${960 - ((cards.length - 1) / 2) * gap + j * gap},450) scale(${(cold ? 0.85 : 1) * popIn(t, q0 + 0.2 + j * 0.1)})`}>
                  <MiniCard i={c} t={t} play={t >= at && ok.includes(c) ? 1 : 0} on={t >= at && ok.includes(c) ? 1 : 0} label={t >= at ? ITEMS[c].en : undefined} />
                  {ok.includes(c) && <AnswerMark t={t} at={at + ok.indexOf(c) * 0.5} ok x={120} y={-150} size={0.6} />}
                </g>
              ))}
            </g>
          );
        })()}
        {/* the French quiz */}
        {frQuiz && (frFirst ? [0, 2, 4] : [7, 9, 5]).map((c, j) => {
          const a = frFirst ? 2 : 9;
          const at = frFirst ? S('frq1a') : S('frq2a');
          return (
            <g key={`f${frFirst}${c}`} transform={`translate(${600 + j * 360},450) scale(${popIn(t, (frFirst ? S('frq1') : S('frq2')) - 0.2 + j * 0.1)})`}>
              <MiniCard i={c} t={t} on={t >= at && c === a ? 1 : 0} label={t >= at ? ITEMS[c].fr : undefined} />
              {c === a && <AnswerMark t={t} at={at} ok x={120} y={-150} size={0.6} />}
            </g>
          );
        })}

        <Kid spec={MILA_HERO} x={MILA_X} y={f} scale={0.6} expr={milaExpr} look={[0.6, -0.2]} mouth={lipSync(VO, 'mila', t)}
          armR={talks('mila') && (wi >= 0 || qi !== undefined) ? 'point' : yay ? 'up' : talks('mila') ? 'present' : 'down'} armL={yay ? 'up' : 'down'}
          hop={yay ? Math.abs(Math.sin(t * 7)) * 22 : 0} />
        <Kid spec={LEO_HERO} x={LEO_X} y={f} scale={0.6} expr={leoExpr} look={[-0.6, -0.2]} mouth={lipSync(VO, 'leo', t)}
          armL={talks('leo') ? 'point' : yay ? 'up' : 'down'} armR={yay || using ? 'up' : 'down'} hop={yay ? Math.abs(Math.sin(t * 7 + 1)) * 22 : 0} />
        {wi >= 0 && using && (
          <StageWord t={t} at={S(k(`w${wi}u`))} until={WORD1(wi)}
            text={['SO COOL!', 'A STAR!', 'TWIRL!', 'OOPS!', 'WIGGLE!', 'GO!', 'SO WARM!', 'ROUND & ROUND!', 'WIGGLE!', 'SPLASH!'][wi]}
            x={CARD[0] + 330} y={CARD[1] - 260} size={70} color={ITEMS[wi].c} rot={8} />
        )}
      </ActionStage>

      {/* screen-space */}
      <PopText t={t} at={S('intro2') + 0.2} until={S('what') - 0.1} text="CLOTHES · LES VÊTEMENTS" y={130} size={100} color="#ffca3a" />
      {ITEMS.map((_, i) => <PopText key={i} t={t} at={E(k(`w${i}c`)) - 0.6} until={S(k(`w${i}f`)) - 0.1} text="YOUR TURN!" y={130} size={100} color="#ffffff" />)}
      {ITEMS.map((_, i) => <PopText key={`fr${i}`} t={t} at={S(k(`w${i}f`))} until={S(k(`w${i}u`)) - 0.1} text="EN FRANÇAIS" y={130} size={90} color="#ffca3a" />)}
      {[2, 5, 8].map((i) => <ThinkTimer key={i} t={t} from={onBeat(E(k(`q${i}`)) + 0.1)} to={S(k(`q${i}a`)) - 0.1} x={1760} y={190} r={90} label="THINK!" />)}
      {[2, 5, 8].map((i) => <PopText key={`q${i}`} t={t} at={S(k(`q${i}`))} until={S(k(`q${i}a`)) - 0.1} text={i === 5 ? 'WHERE ARE THE SHOES?' : `WHERE IS THE ${ITEMS[QUIZ[i].ans].en.toUpperCase()}?`} y={130} size={84} color="#ffffff" />)}
      <PopText t={t} at={S('fr_round')} until={S('r0') - 0.1} text="NOW IN FRENCH!" y={110} size={100} color="#ffca3a" />
      <PopText t={t} at={S('cold_q')} until={S('cold_a') - 0.1} text="BRRR! IT'S SNOWING!" y={130} size={96} color="#ffffff" />
      <PopText t={t} at={S('cold_a')} until={S('rain_q') - 0.2} text="COAT · SCARF · GLOVES" y={130} size={96} color="#b388ff" />
      <PopText t={t} at={S('rain_q')} until={S('rain_a') - 0.1} text="IT'S RAINING!" y={130} size={110} color="#4cc9f0" />
      <PopText t={t} at={S('rain_a')} until={S('frq') - 0.2} text="BOOTS! SPLASH!" y={130} size={110} color="#ffd166" />
      <ThinkTimer t={t} from={onBeat(E('cold_q') + 0.1)} to={S('cold_a') - 0.1} x={1760} y={190} r={90} label="THINK!" />
      <ThinkTimer t={t} from={onBeat(E('rain_q') + 0.1)} to={S('rain_a') - 0.1} x={1760} y={190} r={90} label="THINK!" />
      <Confetti t={t} at={S('cold_a') + 0.2} y={420} />
      <PopText t={t} at={S('frq')} until={S('frq1') - 0.1} text="FRENCH QUIZ!" y={130} size={110} color="#ffca3a" />
      <PopText t={t} at={S('frq1')} until={S('frq2') - 0.3} text="OÙ EST LA ROBE ?" y={130} size={90} color="#ffffff" />
      <PopText t={t} at={S('frq2')} until={S('frq2a') - 0.1} text="OÙ SONT LES BOTTES ?" y={130} size={90} color="#ffffff" />
      <ThinkTimer t={t} from={onBeat(E('frq1') + 0.1)} to={S('frq1a') - 0.1} x={1760} y={190} r={90} label="THINK!" />
      <ThinkTimer t={t} from={onBeat(E('frq2') + 0.1)} to={S('frq2a') - 0.1} x={1760} y={190} r={90} label="THINK!" />
      <PopText t={t} at={S('great')} until={S('cold_q') - 0.1} text="GREAT JOB!" y={130} size={120} color="#ffca3a" />
      <PopText t={t} at={S('fav')} until={S('fav_b') - 0.1} text="WHAT DO YOU LIKE TO WEAR?" y={130} size={100} color="#ffffff" />
      <PopText t={t} at={S('bye')} until={E('bye2') + 0.6} text="AU REVOIR ! BYE-BYE!" y={130} size={100} color="#ffca3a" />
      {[2, 5, 8].map((i) => <Confetti key={i} t={t} at={S(k(`q${i}a`)) + 0.2} y={420} />)}
      <Confetti t={t} at={S('frq2a') + 0.2} y={420} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <SparksIntro t={t} at={0} cast={{ kids: [MILA_HERO, LEO_HERO], buddy: BOBO_HERO }} />
      <StarWipe t={t} at={E('bye2') + 0.6} dur={0.5} hold={5} color="#3b2a4a" x={W / 2} y={H * 0.45} />
    </>
  );
}
