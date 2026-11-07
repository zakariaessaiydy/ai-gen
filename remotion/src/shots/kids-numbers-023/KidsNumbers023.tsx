// TINY SPARKS · Day 23 · 🔢 Numbers & Math #4 — "Count the Cute Puppies" (Short 9:16)
// kids-shorts/tiny-sparks/numbers/day-023-count-the-cute-puppies. Cues from VO via K (keys.gen.ts).
// First episode with the new 'dog' Critter species. "Who is in the doghouse?" guess timer → puppies hop out
// one by one on each spoken number (badge, numeral + word, Mila's fingers) → ten → two sleepy puppies walk to
// the basket and fall asleep (zzz) → "How many are still awake?" think timer → 8 → "10 − 2 = 8" → recount the
// awake ones (each one hops on its word) → "Woof woof! Great counting!".
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter, type CritterSpec } from '../../lib/kids/critter';
import { BOBO, CAPTION_COLORS, MILA } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { Confetti, FONT_TOON, KidsCaptions, KidsStage, PopText, RAINBOW, ThinkTimer, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsNumbers023', durationInSeconds: 66.8, fps: 30, width: 1080, height: 1920 };

const W = 1080;
const H = 1920;
const f = FLOOR(H);
type Key = keyof typeof K;
const S = (k: Key) => VO[K[k]].start;
const E = (k: Key) => VO[K[k]].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;
const C = (n: number) => S(`c${n}` as Key);
const WORDS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN'];
const COATS: [string, string, string][] = [
  ['#e9c46a', '#fff3d6', '#a0673c'], ['#ffffff', '#ffffff', '#3b2a4a'], ['#c98f5f', '#f3dcc0', '#6b4226'], ['#adb5bd', '#f1f3f5', '#495057'], ['#f4a261', '#fff1e0', '#9c5a2b'],
  ['#2b2d42', '#adb5bd', '#14141f'], ['#ffd6a5', '#ffffff', '#c98f5f'], ['#e9ecef', '#ffffff', '#c98f5f'], ['#b08968', '#ede0d4', '#7f5539'], ['#ffe8a3', '#ffffff', '#e0a458'],
];
const pup = (i: number): CritterSpec => ({ id: `pup${i}`, species: 'dog', fur: COATS[i][0], fur2: COATS[i][1], dark: COATS[i][2] });
const HOUSE: [number, number] = [250, 470];
const grid = (i: number): [number, number] => [600 + ((i % 5) - 2) * 180, 770 + Math.floor(i / 5) * 220];
const BASKET: [number, number] = [830, 520];
const SLEEPERS = [8, 9]; // the last two puppies get sleepy
const GO0 = S('sleep') - 0.2;
const GO1 = GO0 + 1.6;

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

const DogHouse: React.FC = () => (
  <g transform={`translate(${HOUSE[0]},${HOUSE[1]}) scale(0.8)`}>
    <path d="M -170,-10 L 0,-170 L 170,-10 Z" fill="#ff595e" {...kst(8)} />
    <rect x={-140} y={-20} width={280} height={200} fill="#ffca3a" {...kst(8)} />
    <path d="M -60,180 L -60,60 Q 0,0 60,60 L 60,180 Z" fill="#3b2a4a" />
    <rect x={-70} y={-110} width={140} height={44} rx={10} fill="#ffffff" {...kst(5)} />
    <text y={-78} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={34} fill={KINK}>PUPPIES</text>
  </g>
);

export default function KidsNumbers023() {
  const t = useT();
  const cam = camAt(t, CAM);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  let n = 0;
  for (let k = 1; k <= 10; k++) if (t >= C(k) - 0.1) n = k;
  const asleep = t >= GO1;
  const fingers = t >= S('ans') ? 8 : n;
  const fL = Math.min(5, fingers);
  const fR = Math.max(0, fingers - 5);
  let lit = -1;
  if (within(t, S('check'), E('check') + 0.3)) {
    const w = timeWords(VO[K.check]);
    for (let i = 0; i < 8; i++) if (w[i + 2] && t >= w[i + 2].start) lit = i;
  }
  const counting = n > 0 && t < S('sleepy');
  const bigN = counting ? n : t >= S('ans') && t < S('eq') ? 8 : 0;
  const wagAll = t >= S('yay');

  return (
    <>
      <KidsStage cam={cam}>
        <Meadow w={W} h={H} t={t} sun={false} />
        {/* the puppy basket */}
        <g transform={`translate(${BASKET[0]},${BASKET[1]})`}>
          <ellipse cx={0} cy={0} rx={150} ry={50} fill="#8d5a3b" {...kst(7)} />
          <ellipse cx={0} cy={-6} rx={124} ry={34} fill="#ffb3c6" />
        </g>
        {/* puppies hidden in the doghouse peek out before the count */}
        <DogHouse />
        {t < C(1) && t >= S('hook') && (
          <g transform={`translate(${HOUSE[0]},${HOUSE[1] + 96}) scale(0.32)`}>
            {[-1, 1].map((k) => <ellipse key={k} cx={k * 40} cy={0} rx={16} ry={20} fill="#ffffff" {...kst(6)} />)}
            {[-1, 1].map((k) => <circle key={k} cx={k * 40} cy={4} r={9} fill={KINK} />)}
          </g>
        )}
        {Array.from({ length: n }).map((_, i) => {
          const [gx, gy] = grid(i);
          const p = EASE_OUT(prog(t, C(i + 1) - 0.1, C(i + 1) + 0.45));
          let x = HOUSE[0] + (gx - HOUSE[0]) * p;
          let y = HOUSE[1] + 130 + (gy - HOUSE[1] - 130) * p;
          let sc = 0.34 * (0.5 + 0.5 * p);
          const sleeper = SLEEPERS.indexOf(i);
          let expr: 'happy' | 'laugh' | 'sleepy' = i % 3 === 0 ? 'laugh' : 'happy';
          if (sleeper >= 0 && t >= GO0) {
            const q = EASE_INOUT(prog(t, GO0, GO1));
            const bx = BASKET[0] + (sleeper ? 50 : -50);
            x = gx + (bx - gx) * q;
            y = gy + (BASKET[1] + 20 - gy) * q;
            sc = 0.34 - 0.08 * q;
            expr = 'sleepy';
          } else if (sleeper >= 0 && t >= S('sleepy')) expr = 'sleepy';
          const awakeIdx = i;
          const hop = within(t, C(i + 1) - 0.1, C(i + 1) + 0.45) ? Math.sin(p * Math.PI) * 80 : lit === awakeIdx ? 50 : wagAll && sleeper < 0 ? Math.abs(Math.sin(t * 6 + i)) * 30 : 0;
          return (
            <g key={i}>
              <Critter spec={pup(i)} x={x} y={y} scale={sc} expr={expr} look={[0, -0.2]} hop={hop} walking={sleeper >= 0 && within(t, GO0, GO1)} walk={t * 3} shadow={false} />
              {!(sleeper >= 0 && t >= GO0) && (
                <g transform={`translate(${x},${y - 640 * sc - hop})`}>
                  <circle r={30} fill={lit === i ? '#ffffff' : RAINBOW[i % RAINBOW.length]} {...kst(5)} />
                  <text y={13} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={i === 9 ? 32 : 38} fill={lit === i ? KINK : '#ffffff'} stroke={KINK} strokeWidth={lit === i ? 0 : 3} paintOrder="stroke">{i + 1}</text>
                </g>
              )}
            </g>
          );
        })}
        {/* zzz over the sleeping puppies */}
        {asleep && [0, 1, 2].map((k) => {
          const p = ((t - GO1) * 0.5 + k / 3) % 1;
          return <text key={k} x={BASKET[0] + 20 + p * 60} y={BASKET[1] - 140 - p * 120} fontFamily={FONT_TOON} fontWeight={700} fontSize={40 + p * 20} fill="#ffffff" stroke={KINK} strokeWidth={4} paintOrder="stroke" opacity={1 - p}>z</text>;
        })}
        <Kid spec={MILA} x={170} y={f} scale={0.64} expr={t >= S('yay') ? 'laugh' : within(t, S('sleep'), S('ans')) ? 'think' : 'happy'} look={[0.5, -0.5]}
          mouth={lipSync(VO, 'mila', t)} armL={fingers > 0 && t < S('yay') ? 'count' : t >= S('yay') ? 'up' : 'wave'}
          armR={fR > 0 && t < S('yay') ? 'count' : t >= S('yay') ? 'up' : 'hip'} fingersL={fL} fingersR={fR}
          hop={t >= S('yay') ? Math.abs(Math.sin((t - S('yay')) * 6)) * 40 : 0} />
        <Critter spec={BOBO} x={880} y={f} scale={0.66} expr={talks('bobo') || t >= S('yay') ? 'laugh' : within(t, S('sleepy'), S('ans')) ? 'sleepy' : 'happy'}
          look={[-0.5, -0.5]} mouth={lipSync(VO, 'bobo', t)}
          armL={within(t, S('hook'), E('hook')) ? 'point' : t >= S('yay') ? 'wave' : 'down'}
          armR={t >= S('yay') ? 'wave' : within(t, S('sleep'), E('sleep')) ? 'hug' : 'down'}
          hop={t >= S('yay') ? Math.abs(Math.sin((t - S('yay')) * 6 + 1)) * 40 : 0} />
      </KidsStage>
      {t < C(1) - 0.2 && <PopText t={t} at={0.2} text="WHO IS IN THERE?" y={190} size={100} color="#ff595e" />}
      <ThinkTimer t={t} from={E('hook') + 0.2} to={S('go') - 0.2} x={620} y={520} label="GUESS!" />
      {bigN > 0 && <PopText key={`n${bigN}`} t={t} at={counting ? C(n) - 0.1 : S('ans')} text={String(bigN)} x={620} y={300} size={170} color={RAINBOW[(bigN - 1) % RAINBOW.length]} />}
      {bigN > 0 && <PopText key={`w${bigN}`} t={t} at={counting ? C(n) + 0.15 : S('ans') + 0.2} text={WORDS[bigN - 1]} x={620} y={420} size={64} color="#ffffff" rot={2} />}
      <PopText t={t} at={S('sleep') + 0.4} until={S('howmany') - 0.1} text="SHH!" x={880} y={330} size={110} color="#b8a1e3" />
      <ThinkTimer t={t} from={E('howmany') + 0.1} to={S('ans') - 0.2} x={540} y={320} label="HOW MANY?" />
      <PopText t={t} at={S('eq')} until={S('check') - 0.2} text="10 − 2 = 8" y={300} size={130} color="#ffca3a" />
      <Confetti t={t} at={S('ten')} y={700} dur={1.4} />
      <Confetti t={t} at={S('yay')} y={600} />
      <KidsCaptions lines={VO} t={t} colors={CAPTION_COLORS} />
    </>
  );
}
