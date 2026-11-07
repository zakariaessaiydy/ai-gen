// TINY SPARKS · Day 9 · 🔢 Numbers & Math #2 — "Counting 1–20 with Balloons" (Short 9:16)
// kids-shorts/tiny-sparks/numbers/day-009-counting-1-20-with-balloons. Cues from VO via K (keys.gen.ts).
// 1–10: a balloon pops up on each spoken number (numbered, rainbow order), Mila counts on her fingers.
// The ten get TIED into one bunch with a "10" tag (never more than 10 loose objects on screen).
// 11–20: new balloons next to the bunch, shown as "10 + k" (Mila's fingers = k). "Ten and ten make
// twenty", then one balloon POPS (subtraction you can see) → "Now how many?" think timer → 19.
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO, CAPTION_COLORS, MILA } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { Confetti, FONT_TOON, KidsCaptions, KidsStage, PopText, RAINBOW, ThinkTimer, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { EASE_INOUT, EASE_OUT, prog } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsNumbers009', durationInSeconds: 77.4, fps: 30, width: 1080, height: 1920 };

const W = 1080;
const H = 1920;
const f = FLOOR(H);
type Key = keyof typeof K;
const S = (k: Key) => VO[K[k]].start;
const E = (k: Key) => VO[K[k]].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;
const C = (n: number) => S(`c${n}` as Key); // when number n is said
const WORDS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN', 'TWENTY'];

const TIE0 = S('tie') + 1.4;
const TIE1 = TIE0 + 1.3;
const POP = S('pop') - 0.15; // balloon 20 bursts
const gridA = (i: number): [number, number] => [540 + ((i % 5) - 2) * 180, 420 + Math.floor(i / 5) * 240];
const CLUSTER: [number, number][] = [[-70, -40], [0, -80], [70, -40], [-95, 40], [-25, 10], [45, 20], [105, 55], [-60, 110], [20, 95], [85, 135]];
const BUNDLE: [number, number] = [190, 470];
const gridB = (j: number): [number, number] => [665 + ((j % 5) - 2) * 142, 430 + Math.floor(j / 5) * 240];

const Bal: React.FC<{ x: number; y: number; s: number; c: string; n?: number; string?: boolean }> = ({ x, y, s, c, n, string = true }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {string && <path d="M 0,70 Q -10,110 6,150" fill="none" stroke={KINK} strokeWidth={5} />}
    <ellipse cx={0} cy={0} rx={62} ry={74} fill={c} {...kst(7)} />
    <path d="M -8,72 L 8,72 L 0,62 Z" fill={c} {...kst(5)} />
    <ellipse cx={-24} cy={-30} rx={11} ry={18} fill="#ffffff" opacity={0.5} />
    {n !== undefined && (
      <text y={20} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={n >= 10 ? 52 : 62} fill="#ffffff" stroke={KINK} strokeWidth={5} paintOrder="stroke">{n}</text>
    )}
  </g>
);

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

export default function KidsNumbers009() {
  const t = useT();
  const cam = camAt(t, CAM);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  // the number on screen now
  let n = 0;
  for (let k = 1; k <= 20; k++) if (t >= C(k) - 0.1) n = k;
  const popped = t >= POP;
  const shownN = popped ? 19 : n;
  const tie = EASE_INOUT(prog(t, TIE0, TIE1));
  const bob = (i: number) => Math.sin(t * 2 + i * 1.3) * 8;
  const ones = shownN > 10 ? shownN - 10 : shownN;
  const fingers = n === 0 ? 0 : t >= S('make') && !popped ? 10 : ones === 0 && n === 10 ? 10 : ones;
  const fL = Math.min(5, fingers);
  const fR = Math.max(0, fingers - 5);
  const counting = n > 0 && t < S('make');
  const showBig = (n > 0 && t < S('make') - 0.2 && !within(t, S('ten') - 0.2, C(11) - 0.1)) || t >= S('ans');

  return (
    <>
      <KidsStage cam={cam}>
        <Meadow w={W} h={H} t={t} sun={false} />
        {/* 1–10, then tied into a bunch of ten */}
        {Array.from({ length: Math.min(10, n) }).map((_, i) => {
          const [ax, ay] = gridA(i);
          const [cx, cy] = [BUNDLE[0] + CLUSTER[i][0], BUNDLE[1] + CLUSTER[i][1]];
          const s = EASE_OUT(prog(t, C(i + 1) - 0.1, C(i + 1) + 0.3));
          const x = ax + (cx - ax) * tie;
          const y = ay + (cy - ay) * tie + bob(i);
          return <Bal key={i} x={x} y={y} s={s * (1 - 0.32 * tie)} c={RAINBOW[i % RAINBOW.length]} n={tie < 0.5 ? i + 1 : undefined} string={tie < 0.9} />;
        })}
        {tie > 0.85 && (
          <g opacity={EASE_OUT(prog(t, TIE1 - 0.2, TIE1 + 0.3))}>
            {CLUSTER.map(([dx, dy], i) => (
              <line key={i} x1={BUNDLE[0] + dx} y1={BUNDLE[1] + dy + 50} x2={BUNDLE[0]} y2={BUNDLE[1] + 330} stroke={KINK} strokeWidth={4} />
            ))}
            <g transform={`translate(${BUNDLE[0]},${BUNDLE[1] + 330})`}>
              <path d="M 0,0 L -34,-20 L -34,20 Z M 0,0 L 34,-20 L 34,20 Z" fill="#ff595e" {...kst(5)} />
              <g transform="translate(0,90)">
                <rect x={-70} y={-48} width={140} height={96} rx={22} fill="#ffffff" {...kst(7)} />
                <text y={30} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={84} fill="#ff595e">10</text>
              </g>
            </g>
          </g>
        )}
        {/* 11–20 next to the bunch */}
        {Array.from({ length: Math.max(0, n - 10) }).map((_, j) => {
          if (popped && j === 9) return null;
          const [x, y] = gridB(j);
          const s = EASE_OUT(prog(t, C(j + 11) - 0.1, C(j + 11) + 0.3));
          return <Bal key={j} x={x} y={y + bob(j + 10)} s={s * 0.78} c={RAINBOW[j % RAINBOW.length]} n={j + 11} />;
        })}
        {within(t, POP, POP + 0.5) && (
          <g transform={`translate(${gridB(9)[0]},${gridB(9)[1]}) scale(${EASE_OUT(prog(t, POP, POP + 0.25))})`} opacity={1 - prog(t, POP + 0.2, POP + 0.5)}>
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={i} x1={0} y1={-50} x2={0} y2={-110} stroke={RAINBOW[9]} strokeWidth={12} strokeLinecap="round" transform={`rotate(${i * 45})`} />
            ))}
          </g>
        )}
        <Kid spec={MILA} x={200} y={f} scale={0.72} expr={t >= S('yay') ? 'laugh' : within(t, S('pop'), S('ans')) ? 'surprised' : 'happy'} look={[0.5, -0.6]}
          mouth={lipSync(VO, 'mila', t)} armL={counting || t >= S('ans') || within(t, S('make'), POP) ? 'count' : t >= S('yay') ? 'up' : 'wave'}
          armR={fR > 0 ? 'count' : t >= S('yay') ? 'up' : 'hip'} fingersL={fL} fingersR={fR}
          hop={t >= S('yay') ? Math.abs(Math.sin((t - S('yay')) * 6)) * 40 : 0} />
        <Critter spec={BOBO} x={880} y={f} scale={0.66} expr={within(t, S('pop'), S('ans')) ? 'oops' : talks('bobo') || t >= S('yay') ? 'laugh' : 'happy'} look={[-0.5, -0.6]}
          mouth={lipSync(VO, 'bobo', t)} armL={talks('bobo') && t < S('tie') ? 'up' : within(t, S('tie'), TIE1) ? 'hold' : t >= S('yay') ? 'wave' : 'down'}
          armR={t >= S('yay') ? 'wave' : within(t, S('pop'), S('howmany')) ? 'hug' : 'down'}
          hop={t >= S('yay') ? Math.abs(Math.sin((t - S('yay')) * 6 + 1)) * 40 : 0} />
      </KidsStage>
      {t < C(1) - 0.2 && <PopText t={t} at={0.2} text="1 → 20" y={560} size={210} color="#ffca3a" />}
      {showBig && <PopText key={`n${shownN}`} t={t} at={t >= S('ans') ? S('ans') : C(n) - 0.1} text={String(shownN)} y={1010} size={200} color={RAINBOW[(shownN - 1) % RAINBOW.length]} />}
      {showBig && <PopText key={`w${shownN}`} t={t} at={t >= S('ans') ? S('ans') + 0.2 : C(n) + 0.15} text={WORDS[shownN - 1]} y={1150} size={70} color="#ffffff" rot={2} />}
      {showBig && shownN > 10 && <PopText key={`p${shownN}`} t={t} at={t >= S('ans') ? S('ans') + 0.3 : C(n) + 0.3} text={`10 + ${shownN - 10}`} y={880} size={70} color="#ffffff" rot={-2} />}
      <PopText t={t} at={S('ten')} until={S('more')} text="A BUNCH OF 10!" y={1030} size={96} color="#ff595e" />
      <PopText t={t} at={S('make')} until={S('pop') - 0.3} text="10 + 10 = 20" y={1010} size={130} color="#ffca3a" />
      <ThinkTimer t={t} from={E('howmany') + 0.1} to={S('ans') - 0.2} x={540} y={1030} label="HOW MANY?" />
      <Confetti t={t} at={S('make') + 0.3} y={600} dur={1.4} />
      <Confetti t={t} at={S('yay')} y={600} />
      <KidsCaptions lines={VO} t={t} colors={CAPTION_COLORS} />
    </>
  );
}
