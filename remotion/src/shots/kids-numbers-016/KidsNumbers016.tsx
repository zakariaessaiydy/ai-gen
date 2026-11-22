// TINY SPARKS · Day 16 · 🔢 Numbers & Math #3 — "Counting Apples 1–10" (Short 9:16)
// kids-shorts/tiny-sparks/numbers/day-016-counting-apples-1-10. Cues from VO via K (keys.gen.ts).
// Bobo picked apples → "How many?" guess timer → count 1–10 together (an apple pops on each spoken number,
// rainbow badge, big numeral + word, Mila's fingers) → Bobo EATS one (subtraction you can see) → "Now how
// many?" think timer → 9 → "10 take away 1 is 9" → recount 1–9 (apples light up on the words) → yummy!
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter, critterFaceAt } from '../../lib/kids/critter';
import { BOBO, CAPTION_COLORS, MILA } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { Apple, Confetti, FONT_TOON, KidsCaptions, KidsStage, PopText, RAINBOW, ThinkTimer, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsNumbers016', durationInSeconds: 63.0, fps: 30, width: 1080, height: 1920 };

const W = 1080;
const H = 1920;
const f = FLOOR(H);
type Key = keyof typeof K;
const S = (k: Key) => VO[K[k]].start;
const E = (k: Key) => VO[K[k]].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;
const C = (n: number) => S(`c${n}` as Key);
const WORDS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN'];
const BOBO_X = 880;
const [bfx, bfy] = critterFaceAt(BOBO_X, f, 0.66);
const grid = (i: number): [number, number] => [540 + ((i % 5) - 2) * 185, 560 + Math.floor(i / 5) * 240];
const EAT0 = S('crunch') - 0.5;
const EAT1 = S('crunch') + 0.2;

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

export default function KidsNumbers016() {
  const t = useT();
  const cam = camAt(t, CAM);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  let n = 0;
  for (let k = 1; k <= 10; k++) if (t >= C(k) - 0.1) n = k;
  const eaten = t >= EAT1;
  const shown = eaten ? 9 : n;
  const fingers = t >= S('ans') ? 9 : n;
  const fL = Math.min(5, fingers);
  const fR = Math.max(0, fingers - 5);
  // recount: which apple is lit by the spoken word ("Let's check! One, two, …")
  let lit = -1;
  if (within(t, S('check'), E('check') + 0.3)) {
    const w = timeWords(VO[K.check]);
    for (let i = 0; i < 9; i++) if (w[i + 2] && t >= w[i + 2].start) lit = i;
  }
  const counting = n > 0 && t < S('crunch');
  const bigN = counting ? n : t >= S('ans') && t < S('eq') ? 9 : 0;

  return (
    <>
      <KidsStage cam={cam}>
        <Meadow w={W} h={H} t={t} sun={false} />
        {/* all ten apples are there from the start (faded) — counting lights them up one by one */}
        {Array.from({ length: 10 }).map((_, i) => (i < n ? null : (
          <g key={`g${i}`} transform={`translate(${grid(i)[0]},${grid(i)[1]})`} opacity={EASE_OUT(prog(t, 0.3 + i * 0.08, 0.7 + i * 0.08))}><Apple c="#f6cccc" /></g>
        )))}
        {/* the apples */}
        {Array.from({ length: n }).map((_, i) => {
          const [gx, gy] = grid(i);
          const s = EASE_OUT(prog(t, C(i + 1) - 0.1, C(i + 1) + 0.3));
          if (i === 9 && t >= EAT0) {
            if (eaten) return null;
            const p = EASE_INOUT(prog(t, EAT0, EAT1));
            return <g key={i} transform={`translate(${gx + (bfx - 40 - gx) * p},${gy + (bfy + 60 - gy) * p}) scale(${1 - 0.5 * p})`}><Apple c={RAINBOW[0]} /></g>;
          }
          return (
            <g key={i} transform={`translate(${gx},${gy}) scale(${s * (lit === i ? 1.18 : 1)})`}>
              <Apple c={lit === i ? '#ff8c42' : '#ff595e'} />
              <g transform="translate(0,-108)">
                <circle r={34} fill={RAINBOW[i % RAINBOW.length]} {...kst(6)} />
                <text y={15} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={i === 9 ? 36 : 44} fill="#ffffff" stroke={KINK} strokeWidth={3} paintOrder="stroke">{i + 1}</text>
              </g>
            </g>
          );
        })}
        {/* crumbs after the crunch */}
        {within(t, EAT1, EAT1 + 1.2) &&
          [0, 1, 2, 3, 4].map((i) => {
            const p = prog(t, EAT1, EAT1 + 1.2);
            return <circle key={i} cx={bfx - 40 + Math.cos(i * 1.3) * 80 * p} cy={bfy + 70 + p * 120 + Math.sin(i) * 20} r={8} fill="#ffe5b4" opacity={1 - p} {...kst(3)} />;
          })}
        <Kid spec={MILA} x={200} y={f} scale={0.72} expr={t >= S('yay') ? 'laugh' : within(t, S('crunch'), S('ans')) ? 'surprised' : 'happy'} look={[0.5, -0.5]}
          mouth={lipSync(VO, 'mila', t)} armL={fingers > 0 && t < S('yay') ? 'count' : t >= S('yay') ? 'up' : 'wave'}
          armR={fR > 0 && t < S('yay') ? 'count' : t >= S('yay') ? 'up' : 'hip'} fingersL={fL} fingersR={fR}
          hop={t >= S('yay') ? Math.abs(Math.sin((t - S('yay')) * 6)) * 40 : 0} />
        <Critter spec={BOBO} x={BOBO_X} y={f} scale={0.66} expr={within(t, S('crunch'), S('oops')) ? 'laugh' : within(t, S('oops'), S('ans')) ? 'oops' : talks('bobo') || t >= S('yay') ? 'laugh' : 'happy'}
          look={[-0.5, -0.5]} mouth={within(t, EAT1, S('crunch') + 1.5) ? Math.abs(Math.sin(t * 14)) * 0.8 : lipSync(VO, 'bobo', t)}
          armL={within(t, EAT0, EAT1 + 0.4) ? 'hold' : within(t, S('hook'), E('hook')) ? 'up' : t >= S('yay') ? 'wave' : 'down'}
          armR={t >= S('yay') ? 'wave' : within(t, S('oops'), S('ans')) ? 'hug' : 'down'}
          hop={t >= S('yay') ? Math.abs(Math.sin((t - S('yay')) * 6 + 1)) * 40 : 0} />
      </KidsStage>
      {t < C(1) - 0.2 && <PopText t={t} at={0.2} text="HOW MANY?" y={300} size={140} color="#ff595e" />}
      <ThinkTimer t={t} from={E('hook') + 0.2} to={S('go') - 0.2} x={540} y={900} label="GUESS!" />
      {bigN > 0 && <PopText key={`n${bigN}`} t={t} at={counting ? C(n) - 0.1 : S('ans')} text={String(bigN)} y={1080} size={190} color={RAINBOW[(bigN - 1) % RAINBOW.length]} />}
      {bigN > 0 && <PopText key={`w${bigN}`} t={t} at={counting ? C(n) + 0.15 : S('ans') + 0.2} text={WORDS[bigN - 1]} y={1220} size={70} color="#ffffff" rot={2} />}
      <PopText t={t} at={S('crunch')} until={S('oops') - 0.1} text="CRUNCH!" y={300} size={140} color="#ff924c" />
      <ThinkTimer t={t} from={E('oops') + 0.1} to={S('ans') - 0.2} x={540} y={1080} label="HOW MANY?" />
      <PopText t={t} at={S('eq')} until={S('check') - 0.2} text="10 − 1 = 9" y={945} size={120} color="#ffca3a" />
      <Confetti t={t} at={S('ten')} y={700} dur={1.4} />
      <Confetti t={t} at={S('yay')} y={600} />
      <KidsCaptions lines={VO} t={t} colors={CAPTION_COLORS} />
    </>
  );
}
