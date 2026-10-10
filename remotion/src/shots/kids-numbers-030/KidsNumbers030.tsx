// TINY SPARKS · Day 30 · 🔢 Numbers & Math #5 — "Count the Colorful Fish" (Short 9:16)
// kids-shorts/tiny-sparks/numbers/day-030-count-the-colorful-fish. Cues from VO via K (keys.gen.ts).
// First episode with the new FISH rig (lib/kids/sea.tsx). Under the sea (Spark Girl + Super Bobo in bubble
// helmets): 10 fish swim in one by one on each spoken number (badge, big numeral, Mila's fingers) — every one a
// different colour/pattern → "Can you find the blue fish?" (think timer, it spins) → "How many fish have
// stripes?" (5 s think timer) → 3 → the striped ones hop 1, 2, 3 → a fast recount 1–10 → "Great counting!" →
// the fish swim away (the sea is empty again, like frame 0).
import React from 'react';
import { Kid, kidFaceAt } from '../../lib/kids/kid';
import { Critter, critterFaceAt } from '../../lib/kids/critter';
import { Bubbles, Fish, type FishSpec } from '../../lib/kids/sea';
import { BOBO_HERO, CAPTION_COLORS, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Underwater } from '../../lib/kids/sets';
import { Confetti, FONT_TOON, KidsCaptions, KidsStage, PopText, RAINBOW, ThinkTimer, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsNumbers030', durationInSeconds: 85.6, fps: 30, width: 1080, height: 1920 };

const W = 1080;
const H = 1920;
const f = FLOOR(H);
type Key = keyof typeof K;
const S = (k: Key) => VO[K[k]].start;
const E = (k: Key) => VO[K[k]].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;
const C = (n: number) => S(`c${n}` as Key);
const word = (k: Key, i: number) => {
  const w = timeWords(VO[K[k]]);
  return (w[Math.min(i, w.length - 1)] ?? { start: S(k) }).start;
};
const WORDS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN'];

const FISH: FishSpec[] = [
  { id: 'f-red', body: '#ff595e', belly: '#ffd6d6', fin: '#c1121f' },
  { id: 'f-orange', body: '#ff924c', belly: '#ffe1c7', fin: '#e8590c' },
  { id: 'f-yellow', body: '#ffd60a', belly: '#fff7c2', fin: '#f4a261', pattern: 'stripes', patternColor: '#e76f51' },
  { id: 'f-green', body: '#52b788', belly: '#d8f3dc', fin: '#2d6a4f' },
  { id: 'f-blue', body: '#1d72d8', belly: '#cfe3ff', fin: '#0b4fa0', pattern: 'stripes', patternColor: '#ffffff' },
  { id: 'f-purple', body: '#9d4edd', belly: '#ead9ff', fin: '#6a1fb0' },
  { id: 'f-pink', body: '#ff6fa5', belly: '#ffe0ec', fin: '#d63a7a', bow: '#ffffff' },
  { id: 'f-white', body: '#ffffff', belly: '#f1f3f5', fin: '#adb5bd', pattern: 'stripes', patternColor: '#3d405b' },
  { id: 'f-spots', body: '#e9c46a', belly: '#fff3d6', fin: '#c98f5f', pattern: 'spots', patternColor: '#8d5a3b' },
  { id: 'f-rainbow', body: '#ffffff', belly: '#ffffff', fin: '#ff6fa5', pattern: 'rainbow' },
];
const STRIPED = [2, 4, 7];
const BLUE = 4;
const SPOT = (i: number): [number, number] => [130 + (i % 5) * 205, 560 + Math.floor(i / 5) * 250];
const FS = 0.6;
const LEAVE = E('yay') + 0.3;

const MILA_X = 200;
const BOBO_X = 880;
const KID_S = 0.64;
const BOBO_S = 0.66;
const [mfx, mfy] = kidFaceAt(MILA_X, f, KID_S);
const [bfx, bfy] = critterFaceAt(BOBO_X, f, BOBO_S);

// a glass bubble helmet (stage space)
const Helmet: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#ffffff" opacity={0.12} />
    <circle cx={x} cy={y} r={r} fill="none" stroke="#ffffff" strokeWidth={7} opacity={0.75} />
    <path d={`M ${x - r * 0.62},${y - r * 0.45} A ${r * 0.8},${r * 0.8} 0 0 1 ${x - r * 0.1},${y - r * 0.78}`} fill="none" stroke="#ffffff" strokeWidth={12} strokeLinecap="round" opacity={0.7} />
  </g>
);

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

export default function KidsNumbers030() {
  const t = useT();
  const cam = camAt(t, CAM);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  let n = 0;
  for (let k = 1; k <= 10; k++) if (t >= C(k) - 0.1) n = k;
  const counting = n > 0 && t < S('ten');
  // fast recount: which fish is said right now
  let fastLit = -1;
  if (within(t, S('fast'), E('fast') + 0.3)) for (let k = 0; k < 10; k++) if (t >= word('fast', k) - 0.05) fastLit = k;
  // stripes check: which striped fish is counted (1, 2, 3)
  let chk = -1;
  if (within(t, S('check'), S('again') - 0.3)) for (let k = 0; k < 3; k++) if (t >= word('check', 2 + k) - 0.05) chk = k;
  const fingers = within(t, S('ans'), S('again')) ? (chk >= 0 ? chk + 1 : 3) : fastLit >= 0 ? fastLit + 1 : counting || within(t, S('ten'), S('find')) ? n : 0;
  const fL = Math.min(5, fingers);
  const fR = Math.max(0, fingers - 5);
  const yay = t >= S('yay');
  const think1 = within(t, E('find') + 0.1, S('find_a') - 0.1);
  const think2 = within(t, E('stripes') + 0.1, S('ans') - 0.1);
  const bigN = counting ? n : 0;

  return (
    <>
      <KidsStage cam={cam}>
        <Underwater w={W} h={H} t={t} life={false} />
        {/* the fish */}
        {FISH.map((spec, i) => {
          if (n < i + 1) return null;
          const [gx, gy] = SPOT(i);
          const arrive = C(i + 1) + 0.25;
          const p = EASE_OUT(prog(t, arrive - 1.3, arrive));
          let x = -220 + (gx + 220) * p;
          let y = gy + Math.sin(p * Math.PI) * -60;
          let facing: 1 | -1 = 1;
          let swimming = p < 1;
          // swim away at the end (to the right)
          if (t >= LEAVE) {
            const q = EASE_INOUT(prog(t, LEAVE + i * 0.08, LEAVE + 1.4 + i * 0.08));
            x = gx + (1350 - gx) * q;
            y = gy - Math.sin(q * Math.PI) * 80;
            swimming = q > 0 && q < 1;
          }
          const blueSpin = i === BLUE && within(t, S('find_a') - 0.1, S('stripes') - 0.3);
          const striped = STRIPED.indexOf(i);
          const chkOn = striped >= 0 && striped <= chk;
          const glowStripe = striped >= 0 && within(t, S('three'), E('three') + 0.6);
          const hop =
            fastLit === i ? 46
            : chkOn && striped === chk ? 50
            : yay && t < LEAVE ? Math.abs(Math.sin(t * 6 + i)) * 26
            : 0;
          const tilt = blueSpin ? EASE_INOUT(prog(t, S('find_a') - 0.1, S('find_a') + 1.2)) * 360 : 0;
          if (i % 2 && t < LEAVE && p >= 1 && !blueSpin) facing = Math.sin(t * 0.5 + i) > 0.92 ? -1 : 1;
          const happyNow = (p >= 1 && t < arrive + 1.2) || blueSpin || chkOn || glowStripe || fastLit === i || yay;
          return (
            <g key={spec.id}>
              {(blueSpin || glowStripe || (chkOn && within(t, S('check'), S('again')))) && (
                <circle cx={x} cy={y - hop} r={112 + 6 * Math.sin(t * 8)} fill="#fff3b0" opacity={0.45} stroke={blueSpin ? '#ff595e' : '#52b788'} strokeWidth={8} />
              )}
              <Fish spec={spec} x={x} y={y - hop} scale={FS} facing={facing} swimming={swimming} expr={happyNow ? 'laugh' : think1 || think2 ? 'smile' : 'happy'} tilt={tilt} />
              {/* number badge */}
              {t < LEAVE && p >= 1 && (
                <g transform={`translate(${x},${y - hop - 112}) scale(${EASE_OUT(prog(t, arrive - 0.05, arrive + 0.3))})`}>
                  <circle r={30} fill={fastLit === i ? '#ffffff' : RAINBOW[i % RAINBOW.length]} {...kst(5)} />
                  <text y={13} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={i === 9 ? 32 : 38} fill={fastLit === i ? KINK : '#ffffff'} stroke={KINK} strokeWidth={fastLit === i ? 0 : 3} paintOrder="stroke">{i + 1}</text>
                </g>
              )}
              {/* stripes check badge (1, 2, 3) */}
              {chkOn && within(t, S('check'), S('again') - 0.3) && (
                <g transform={`translate(${x + 82},${y - hop - 62}) scale(${EASE_OUT(prog(t, word('check', 2 + striped) - 0.05, word('check', 2 + striped) + 0.3))})`}>
                  <circle r={30} fill="#52b788" {...kst(5)} />
                  <text y={13} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={38} fill="#ffffff">{striped + 1}</text>
                </g>
              )}
              {p >= 1 && t < LEAVE && <Bubbles t={t + i} x={x + 70} y={y - 40} n={2} h={140} />}
            </g>
          );
        })}
        <Kid spec={MILA_HERO} x={MILA_X} y={f} scale={KID_S} expr={yay ? 'laugh' : think1 || think2 ? 'think' : counting ? 'happy' : 'happy'} look={[0.5, -0.5]}
          mouth={lipSync(VO, 'mila', t)} armL={fingers > 0 && !yay ? 'count' : yay ? 'up' : 'wave'}
          armR={fR > 0 && !yay ? 'count' : yay ? 'up' : within(t, S('find'), E('find')) ? 'point' : 'hip'} fingersL={fL} fingersR={fR}
          hop={yay ? Math.abs(Math.sin((t - S('yay')) * 6)) * 40 : 0} />
        <Helmet x={mfx} y={mfy - 10} r={178} />
        <Critter spec={BOBO_HERO} x={BOBO_X} y={f} scale={BOBO_S} expr={talks('bobo') || yay ? 'laugh' : think1 || think2 ? 'think' : 'happy'}
          look={[-0.5, -0.5]} mouth={lipSync(VO, 'bobo', t)}
          armL={within(t, S('hook'), E('hook')) || within(t, S('find_a'), E('find_a')) ? 'point' : yay ? 'wave' : 'down'}
          armR={yay || within(t, S('ten'), E('ten')) ? 'up' : 'down'}
          hop={yay || within(t, S('ten'), E('ten') + 0.3) ? Math.abs(Math.sin(t * 6 + 1)) * 36 : 0} />
        <Helmet x={bfx} y={bfy - 20} r={160} />
        <Bubbles t={t} x={mfx + 150} y={mfy - 160} n={3} h={260} />
        <Bubbles t={t + 0.7} x={bfx - 140} y={bfy - 150} n={3} h={260} />
      </KidsStage>
      <PopText t={t} at={0.2} until={C(1) - 0.3} text="COUNT THE FISH!" y={300} size={110} color="#ffca3a" />
      {bigN > 0 && <PopText key={`n${bigN}`} t={t} at={C(bigN) - 0.1} text={String(bigN)} x={540} y={250} size={170} color={RAINBOW[(bigN - 1) % RAINBOW.length]} />}
      {bigN > 0 && <PopText key={`w${bigN}`} t={t} at={C(bigN) + 0.15} text={WORDS[bigN - 1]} x={540} y={370} size={64} color="#ffffff" rot={2} />}
      <PopText t={t} at={S('ten') + 0.1} until={S('find') - 0.2} text="10 FISH!" y={300} size={140} color="#ffca3a" />
      <ThinkTimer t={t} from={E('find') + 0.1} to={S('find_a') - 0.1} x={540} y={1080} label="FIND IT!" />
      <PopText t={t} at={S('stripes') + 0.5} until={S('ans') - 0.1} text="STRIPES?" y={300} size={130} color="#ffffff" />
      <ThinkTimer t={t} from={E('stripes') + 0.1} to={S('ans') - 0.1} x={540} y={1080} label="HOW MANY?" />
      <PopText t={t} at={S('ans')} until={S('again') - 0.2} text="3" y={290} size={190} color="#52b788" />
      <PopText t={t} at={S('again') + 0.3} until={S('fast') - 0.1} text="FAST COUNT!" y={300} size={120} color="#ff924c" />
      {fastLit >= 0 && <PopText key={`f${fastLit}`} t={t} at={word('fast', fastLit) - 0.05} text={String(fastLit + 1)} y={290} size={170} color={RAINBOW[fastLit % RAINBOW.length]} />}
      <PopText t={t} at={S('yay') + 0.2} text="GREAT COUNTING!" y={300} size={110} color="#ffd166" />
      <Confetti t={t} at={S('ten')} y={600} dur={1.4} />
      <Confetti t={t} at={S('three')} y={600} dur={1.2} />
      <Confetti t={t} at={S('yay')} y={600} />
      <KidsCaptions lines={VO} t={t} colors={CAPTION_COLORS} />
    </>
  );
}
