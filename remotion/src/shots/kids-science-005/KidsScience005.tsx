// TINY SPARKS · Day 5 · 🚀 Science for Kids #1 — "Why Is the Sky Blue?" (Short 9:16)
// kids-shorts/tiny-sparks/science/day-005-why-is-the-sky-blue. Cues from VO via K (keys.gen.ts).
// WHY? (Mila) → GUESS (Leo: someone painted it) → MODEL (Hoot: white sunlight = every colour → bumps
// tiny bits of air → blue bounces everywhere; the sky fades pale then fills blue again) → the ONE word
// SCATTER + your-turn pause → RECAP (3 icons) → WOW (blue sunsets on Mars) → "Keep asking why!".
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { kidFaceAt } from '../../lib/kids/kid';
import { CAPTION_COLORS, HOOT, LEO, MILA } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow, Sun } from '../../lib/kids/sets';
import { Bubble, Confetti, FONT_TOON, KidsCaptions, KidsStage, PopText, RAINBOW, TitleCard, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { EASE_INOUT, EASE_OUT, prog } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsScience005', durationInSeconds: 75.1, fps: 30, width: 1080, height: 1920 };

const W = 1080;
const H = 1920;
const f = FLOOR(H);
const S = (k: keyof typeof K) => VO[K[k]].start;
const E = (k: keyof typeof K) => VO[K[k]].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;

const MILA_X = 190;
const HOOT_X = 540;
const LEO_X = 890;
const KID_S = 0.62;
const SUN: [number, number] = [W * 0.8, H * 0.2];
const TITLE_END = 1.2;
const [mfx, mfy] = kidFaceAt(MILA_X, f, KID_S);
const [lfx, lfy] = kidFaceAt(LEO_X, f, KID_S);

// the tiny bits of air (deterministic scatter over the sky)
const AIR = Array.from({ length: 34 }, (_, i) => [70 + ((i * 397) % 940), 200 + ((i * 233) % 720)] as [number, number]);
// blue light bounces off the air bits: little blue bursts in every direction
const BURST = AIR.filter((_, i) => i % 3 === 0);

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

const Brush: React.FC<{ t: number }> = ({ t }) => {
  const sw = Math.sin(t * 6) * 60;
  return (
    <g>
      <path d="M -170,40 Q -60,-10 40,30 T 180,10" fill="none" stroke="#4cc9f0" strokeWidth={46} strokeLinecap="round" opacity={0.9} />
      <g transform={`translate(${sw},-40) rotate(-30)`}>
        <rect x={-12} y={-110} width={24} height={110} rx={10} fill="#ff924c" {...kst(5)} />
        <rect x={-20} y={0} width={40} height={30} fill="#adb5bd" {...kst(5)} />
        <path d="M -20,30 L 20,30 L 10,70 L -10,70 Z" fill="#4cc9f0" {...kst(5)} />
      </g>
    </g>
  );
};

export default function KidsScience005() {
  const t = useT();
  const cam = camAt(t, CAM);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const explaining = within(t, S('white') - 0.3, S('recap'));
  const lookUp: [number, number] = explaining ? [0.2, -0.9] : [0, 0];

  // the sky goes pale while Hoot explains, then fills blue again when blue light reaches our eyes
  const pale = EASE_INOUT(prog(t, S('white') - 0.3, S('white') + 0.8)) * (1 - EASE_INOUT(prog(t, S('eyes'), S('eyes') + 1.8)));
  const beam = EASE_OUT(prog(t, S('white'), S('white') + 1.0));
  const fan = EASE_OUT(prog(t, S('rainbow') + 0.6, S('rainbow') + 1.6));
  const air = EASE_OUT(prog(t, S('air') + 1.0, S('air') + 2.2));
  const zig = prog(t, S('bounce') + 0.4, S('bounce') + 2.6);
  const modelOn = within(t, S('white'), S('word') - 0.2);
  const recapOn = within(t, S('r1') - 0.2, S('leo_wow') - 0.2);
  const marsOn = within(t, S('wow') - 0.2, S('end') - 0.2);

  return (
    <>
      <KidsStage cam={cam}>
        <Meadow w={W} h={H} t={t} />
        <rect width={W} height={f - 260} fill="#f4f1ea" opacity={0.85 * pale} />

        {/* the model: white beam → rainbow fan → air bits → blue bounces */}
        {modelOn && (
          <g>
            {fan < 1 && (
              <line x1={SUN[0]} y1={SUN[1]} x2={SUN[0] + (300 - SUN[0]) * beam} y2={SUN[1] + (900 - SUN[1]) * beam}
                stroke="#ffffff" strokeWidth={46} strokeLinecap="round" opacity={1 - fan} style={{ filter: 'drop-shadow(0 0 12px #fff8d6)' }} />
            )}
            {fan > 0 &&
              RAINBOW.slice(0, 7).map((c, i) => {
                const a = (-14 + i * 6) * (Math.PI / 180) * fan;
                const dx = 300 - SUN[0];
                const dy = 900 - SUN[1];
                const ex = SUN[0] + dx * Math.cos(a) - dy * Math.sin(a);
                const ey = SUN[1] + dx * Math.sin(a) + dy * Math.cos(a);
                const dim = zig > 0 && c !== '#1982c4' ? 0.35 : 1;
                return <line key={c} x1={SUN[0]} y1={SUN[1]} x2={ex} y2={ey} stroke={c} strokeWidth={16} strokeLinecap="round" opacity={dim} />;
              })}
            {air > 0 &&
              AIR.map(([x, y], i) => (
                <circle key={i} cx={x + Math.sin(t * 2 + i) * 8} cy={y + Math.cos(t * 1.7 + i) * 8} r={13 * air} fill="#ffffff" {...kst(4)} />
              ))}
            {zig > 0 &&
              BURST.map(([x, y], i) => {
                const p = EASE_OUT(prog(zig, i * 0.06, i * 0.06 + 0.3));
                if (p <= 0) return null;
                const pulse = 1 + 0.15 * Math.sin(t * 5 + i);
                return (
                  <g key={i} transform={`translate(${x},${y}) rotate(${i * 23}) scale(${p * pulse})`}>
                    {[0, 60, 120, 180, 240, 300].map((a) => (
                      <line key={a} x1={20} y1={0} x2={62} y2={0} stroke="#1982c4" strokeWidth={10} strokeLinecap="round" transform={`rotate(${a})`} />
                    ))}
                  </g>
                );
              })}
            {t >= S('eyes') &&
              [AIR[4], AIR[12], AIR[21], AIR[26], AIR[8], AIR[33]].map(([x, y], i) => {
                const [tx, ty] = i % 2 ? [lfx, lfy] : [mfx, mfy];
                const p = EASE_OUT(prog(t, S('eyes') + 0.3 + i * 0.12, S('eyes') + 1.2 + i * 0.12));
                const ex = x + (tx - x) * 0.82 * p;
                const ey = y + (ty - 60 - y) * 0.82 * p;
                return <line key={i} x1={x} y1={y} x2={ex} y2={ey} stroke="#1982c4" strokeWidth={12} strokeLinecap="round" strokeDasharray="2 26" />;
              })}
          </g>
        )}

        {/* recap: 3 icons in order */}
        {recapOn &&
          (['r1', 'r2', 'r3'] as const).map((k, i) => {
            const s = EASE_OUT(prog(t, S(k) - 0.1, S(k) + 0.35));
            if (s <= 0) return null;
            const x = 200 + i * 340;
            return (
              <g key={k} transform={`translate(${x},620) scale(${s})`}>
                <rect x={-140} y={-150} width={280} height={330} rx={40} fill="#ffffff" {...kst(8)} />
                {i === 0 && <g transform="scale(0.6)"><Sun x={0} y={-20} t={t} /></g>}
                {i === 0 && RAINBOW.slice(0, 5).map((c, j) => <rect key={c} x={-90 + j * 38} y={70} width={28} height={28} rx={8} fill={c} />)}
                {i === 1 && AIR.slice(0, 9).map(([ax, ay], j) => <circle key={j} cx={-80 + (j % 3) * 80} cy={-80 + Math.floor(j / 3) * 70} r={16} fill="#e9f5ff" {...kst(4)} />)}
                {i === 1 && <line x1={-120} y1={110} x2={110} y2={-110} stroke="#ffca3a" strokeWidth={12} strokeLinecap="round" />}
                {i === 2 && <path d="M -100,-80 L -30,40 L 20,-70 L 70,50 L 110,-20" fill="none" stroke="#1982c4" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />}
                <circle cx={-120} cy={-130} r={36} fill={RAINBOW[i * 2]} {...kst(5)} />
                <text x={-120} y={-116} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill="#ffffff">{i + 1}</text>
                <text y={150} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill={KINK}>{['sunlight', 'air', 'blue bounces'][i]}</text>
              </g>
            );
          })}

        {/* wow: a window onto Mars with its blue sunset */}
        {marsOn && (
          <g transform={`translate(${W / 2},640) scale(${EASE_OUT(prog(t, S('wow') - 0.2, S('wow') + 0.4))})`}>
            <defs>
              <radialGradient id="marsSky" cx="0.5" cy="0.78" r="0.7">
                <stop offset="0" stopColor="#bfe3ff" />
                <stop offset="0.28" stopColor="#5fa8d3" />
                <stop offset="0.6" stopColor="#c9835a" />
                <stop offset="1" stopColor="#a65532" />
              </radialGradient>
              <clipPath id="marsClip"><circle r={300} /></clipPath>
            </defs>
            <g clipPath="url(#marsClip)">
              <rect x={-300} y={-300} width={600} height={600} fill="url(#marsSky)" />
              <circle cx={0} cy={110} r={26} fill="#ffffff" />
              <path d="M -300,150 Q -150,100 0,150 T 300,140 L 300,300 L -300,300 Z" fill="#b5532a" {...kst(6)} />
            </g>
            <circle r={300} fill="none" {...kst(12)} />
            <rect x={-110} y={-350} width={220} height={80} rx={30} fill="#ff595e" {...kst(6)} />
            <text y={-293} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={52} fill="#ffffff">MARS</text>
          </g>
        )}

        {/* Leo's wrong guess: a giant paintbrush */}
        {within(t, S('guess') + 0.3, S('good') + 1.2) && (
          <g transform={`translate(0,0) scale(1)`} opacity={EASE_OUT(prog(t, S('guess') + 0.3, S('guess') + 0.7))}>
            <Bubble x={640} y={560} w={560} h={320} tx={lfx - 40} ty={lfy - 260}>
              <g transform="translate(640,570)"><Brush t={t} /></g>
            </Bubble>
          </g>
        )}

        <Kid spec={MILA} x={MILA_X} y={f} scale={KID_S} expr={t < S('guess') ? 'wow' : t >= S('leo_wow') ? 'laugh' : explaining ? 'wow' : 'happy'}
          look={t < S('guess') ? [0.3, -0.6] : lookUp} mouth={lipSync(VO, 'mila', t)}
          armL={t >= S('end') ? 'wave' : t < S('guess') ? 'think' : 'down'} armR={within(t, S('mila_say'), E('mila_say')) || within(t, S('r1'), E('r3')) ? 'up' : t >= S('end') ? 'wave' : 'hip'}
          hop={t >= S('end') ? Math.abs(Math.sin((t - S('end')) * 6)) * 30 : 0} />
        <Critter spec={HOOT} x={HOOT_X} y={f} scale={0.55} expr={talks('hoot') ? 'happy' : t >= S('leo_wow') ? 'laugh' : 'smile'}
          look={explaining && !talks('hoot') ? [0.3, -0.8] : [0, 0]} mouth={lipSync(VO, 'hoot', t)}
          armR={talks('hoot') && explaining ? 'point' : t >= S('end') ? 'wave' : 'down'} armL={within(t, S('word'), E('word')) ? 'up' : 'down'} />
        <Kid spec={LEO} x={LEO_X} y={f} scale={KID_S}
          expr={within(t, S('guess'), E('good')) ? (t < S('good') ? 'laugh' : 'oops') : t >= S('leo_wow') ? 'laugh' : explaining ? 'wow' : 'happy'}
          look={lookUp} mouth={lipSync(VO, 'leo', t)}
          armL={within(t, S('guess'), E('guess')) || within(t, S('leo_say'), E('leo_say')) ? 'up' : t >= S('end') ? 'wave' : 'down'}
          armR={within(t, S('leo_wow'), E('leo_wow')) ? 'up' : t >= S('end') ? 'wave' : 'hip'}
          hop={within(t, S('leo_wow'), E('leo_wow') + 0.5) ? Math.abs(Math.sin((t - S('leo_wow')) * 7)) * 40 : 0} />
      </KidsStage>
      <TitleCard t={t} from={0} to={TITLE_END} title="BLUE SKY?" sub="Why is the sky blue?" />
      <PopText t={t} at={S('why') + 0.2} until={S('guess') - 0.2} text="?" y={620} size={360} color="#4cc9f0" />
      <PopText t={t} at={S('rainbow') + 1.2} until={S('air') - 0.3} text="ALL THE COLORS!" y={1060} size={90} color="#ffca3a" />
      <PopText t={t} at={S('word') + 1.2} until={S('recap') - 0.3} text="SCATTER!" y={360} size={160} color="#1982c4" />
      <PopText t={t} at={S('word') + 1.5} until={S('recap') - 0.3} text="= bouncing all around" y={500} size={64} color="#ffffff" rot={2} />
      <PopText t={t} at={E('mila_say') + 0.1} until={S('leo_say') - 0.1} text="YOUR TURN!" y={760} size={120} color="#ffca3a" />
      <PopText t={t} at={S('recap')} until={S('r1') - 0.2} text="LET'S REMEMBER!" y={360} size={110} color="#ffca3a" />
      <PopText t={t} at={S('wow')} until={S('wow') + 1.4} text="WOW!" y={250} size={150} color="#ff924c" />
      <Confetti t={t} at={S('leo_wow')} y={600} />
      <Confetti t={t} at={S('end')} y={500} />
      <KidsCaptions lines={VO} t={t} colors={CAPTION_COLORS} />
    </>
  );
}
