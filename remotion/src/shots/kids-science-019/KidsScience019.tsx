// TINY SPARKS · Day 19 · 🚀 Science for Kids #3 — "Why Does the Moon Glow?" (Short 9:16)
// kids-shorts/tiny-sparks/science/day-019-why-does-the-moon-glow. Cues from VO via K (keys.gen.ts).
// WHY? (Mila) → GUESS (Leo: a night-light inside the Moon) → MODEL (Hoot: the Moon has no light of its own ·
// the Sun appears · sunlight shines on the Moon and bounces back to us) → the ONE word REFLECT (your-turn
// pause) → SEE IT (with a grown-up: a flashlight on a ball in a dark room) → "moonlight is really sunlight!"
// → RECAP (3 cards) → WOW (the Moon is really dark grey, like an old road) → "Keep asking why!".
import React from 'react';
import { Kid, kidFaceAt } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { CAPTION_COLORS, HOOT, LEO, MILA } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Sun } from '../../lib/kids/sets';
import { Ball, Bubble, Confetti, FONT_TOON, KidsCaptions, KidsStage, PopText, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { EASE_INOUT, EASE_OUT, prog } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsScience019', durationInSeconds: 75.5, fps: 30, width: 1080, height: 1920 };

const W = 1080;
const H = 1920;
const f = FLOOR(H);
type Key = keyof typeof K;
const S = (k: Key) => VO[K[k]].start;
const E = (k: Key) => VO[K[k]].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;

const MILA_X = 190;
const HOOT_X = 540;
const LEO_X = 890;
const KID_S = 0.62;
const [lfx, lfy] = kidFaceAt(LEO_X, f, KID_S);
const MOON: [number, number] = [720, 640];
const SUN_XY: [number, number] = [200, 470];

const mixHex = (a: string, b: string, p: number) => {
  const ca = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const cb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + ca.map((v, i) => Math.round(v + (cb[i] - v) * p).toString(16).padStart(2, '0')).join('');
};

// cosy night set: purple sky, twinkling stars, a soft grassy hill
const NightHill: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <defs>
      <linearGradient id="kNight19" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2b2766" />
        <stop offset="1" stopColor="#6a4c93" />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#kNight19)" />
    {Array.from({ length: 34 }).map((_, i) => (
      <circle key={i} cx={(i * 263 + 40) % W} cy={(i * 389 + 60) % (f - 260)} r={3 + (i % 3) * 2} fill="#ffffff" opacity={0.45 + 0.4 * Math.sin(t * 1.6 + i)} />
    ))}
    <path d={`M 0,${f - 60} Q ${W * 0.3},${f - 170} ${W * 0.6},${f - 80} T ${W},${f - 90} L ${W},${H} L 0,${H} Z`} fill="#3a7d44" {...kst(7)} />
    <rect y={f} width={W} height={H - f} fill="#2d6a4f" />
    <line x1={0} y1={f} x2={W} y2={f} {...kst(7)} />
  </g>
);

// the Moon: dark grey rock (lit = 0) → glowing pale yellow (lit = 1), with craters
const Moon: React.FC<{ r: number; lit: number; t: number }> = ({ r, lit, t }) => (
  <g>
    {lit > 0 && <circle r={r * (1.35 + 0.04 * Math.sin(t * 3))} fill="#fff3b0" opacity={0.22 * lit} />}
    <circle r={r} fill={mixHex('#6c6c7e', '#fff3b0', lit)} {...kst(8)} />
    {[[-0.35, -0.3, 0.22], [0.3, 0.1, 0.16], [-0.1, 0.42, 0.13], [0.42, -0.42, 0.1]].map(([cx, cy, cr], i) => (
      <circle key={i} cx={cx * r} cy={cy * r} r={cr * r} fill={mixHex('#55556a', '#ead98b', lit)} {...kst(4)} />
    ))}
  </g>
);

const NightLight: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <circle r={110} fill="#fff3b0" opacity={0.3 + 0.1 * Math.sin(t * 6)} />
    <rect x={-60} y={-90} width={120} height={150} rx={50} fill="#ffe08a" {...kst(6)} />
    <rect x={-70} y={60} width={140} height={34} rx={12} fill="#8ecae6" {...kst(5)} />
    <rect x={-20} y={94} width={14} height={26} fill="#adb5bd" {...kst(4)} />
    <rect x={8} y={94} width={14} height={26} fill="#adb5bd" {...kst(4)} />
  </g>
);

// sunlight ray: a dashed beam from a to b, drawn on with p, little dots running along it
const Ray: React.FC<{ a: [number, number]; b: [number, number]; p: number; t: number; color?: string }> = ({ a, b, p, t, color = '#ffd166' }) => {
  if (p <= 0) return null;
  const x = a[0] + (b[0] - a[0]) * p;
  const y = a[1] + (b[1] - a[1]) * p;
  const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={x} y2={y} stroke={color} strokeWidth={18} strokeLinecap="round" opacity={0.85} />
      {p >= 1 && [0, 1, 2].map((i) => {
        const q = (t * 0.8 + i / 3) % 1;
        return <circle key={i} cx={a[0] + (b[0] - a[0]) * q} cy={a[1] + (b[1] - a[1]) * q} r={14} fill="#ffffff" />;
      })}
      <path d="M -26,-22 L 10,0 L -26,22" fill="none" stroke={color} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" transform={`translate(${x},${y}) rotate(${ang})`} />
    </g>
  );
};

const Flashlight: React.FC = () => (
  <g>
    <rect x={-110} y={-30} width={150} height={60} rx={14} fill="#1982c4" {...kst(6)} />
    <path d="M 40,-30 L 90,-50 L 90,50 L 40,30 Z" fill="#4cc9f0" {...kst(6)} />
    <rect x={-60} y={-12} width={30} height={24} rx={6} fill="#ffca3a" {...kst(4)} />
  </g>
);

// see-it panel: a dark room, a flashlight shining a beam on a ball that lights up
const TorchDemo: React.FC<{ t: number; on: number }> = ({ t, on }) => (
  <g>
    <rect x={-420} y={-250} width={840} height={500} rx={44} fill="#1d2156" {...kst(8)} />
    <g transform="translate(-280,40)"><Flashlight /></g>
    {on > 0 && <path d={`M -190,10 L 210,-140 L 210,200 L -190,70 Z`} fill="#fff3b0" opacity={0.28 * on} />}
    <g transform="translate(230,30)">
      {on > 0 && <circle r={130} fill="#fff3b0" opacity={0.25 * on * (0.85 + 0.15 * Math.sin(t * 4))} />}
      <g opacity={0.35 + 0.65 * on}><Ball r={90} /></g>
    </g>
  </g>
);

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

export default function KidsScience019() {
  const t = useT();
  const cam = camAt(t, CAM);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const explaining = within(t, S('nolight') - 0.3, S('recap'));
  const lookUp: [number, number] = explaining ? [0.2, -0.9] : [0, 0];

  // the model (nolight → leo_say): dark Moon, then the Sun, then the light bounces
  const modelOn = within(t, S('nolight') - 0.3, S('torch') - 0.2);
  const sunIn = EASE_OUT(prog(t, S('sun') - 0.1, S('sun') + 0.6));
  const ray1 = EASE_INOUT(prog(t, S('bounce') + 0.1, S('bounce') + 1.2));
  const lit = EASE_INOUT(prog(t, S('bounce') + 1.0, S('bounce') + 1.6));
  const ray2 = EASE_INOUT(prog(t, S('bounce') + 1.8, S('bounce') + 2.9));
  // intro + guess: the Moon already glowing in the sky
  const introMoon = t < S('nolight') - 0.3;
  const moonLit = introMoon ? 1 : modelOn ? (t < S('bounce') ? 1 - EASE_INOUT(prog(t, S('nolight') - 0.3, S('nolight') + 0.5)) : lit) : 1;
  const torchOn = within(t, S('torch') - 0.2, S('recap') - 0.2);
  const beam = EASE_INOUT(prog(t, S('torch') + 2.0, S('torch') + 2.6));
  const recapOn = within(t, S('r1') - 0.2, S('wow') - 0.3);
  const wowOn = within(t, S('wow') - 0.2, S('end') - 0.2);
  const endOn = t >= S('end') - 0.2;

  return (
    <>
      <KidsStage cam={cam}>
        <NightHill t={t} />
        {/* the Moon in the sky (intro/guess + the model + the ending) */}
        {(introMoon || modelOn || endOn) && (
          <g transform={`translate(${MOON[0]},${introMoon || endOn ? 420 : MOON[1]})`}>
            <Moon r={introMoon || endOn ? 150 : 170} lit={moonLit} t={t} />
          </g>
        )}
        {/* Leo's wrong guess: a night-light inside the Moon */}
        {within(t, S('guess') + 0.3, S('good') + 1.2) && (
          <g opacity={EASE_OUT(prog(t, S('guess') + 0.3, S('guess') + 0.7))}>
            <Bubble x={640} y={800} w={380} h={320} tx={lfx - 60} ty={lfy - 260}>
              <g transform="translate(640,790)"><NightLight t={t} /></g>
            </Bubble>
          </g>
        )}
        {modelOn && within(t, S('nolight') + 0.4, S('sun') - 0.1) && (
          <text x={MOON[0]} y={MOON[1] + 30} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={130} fill="#ffffff" stroke={KINK} strokeWidth={8} paintOrder="stroke">?</text>
        )}
        {modelOn && sunIn > 0 && (
          <g>
            <g transform={`translate(${SUN_XY[0]},${SUN_XY[1]}) scale(${sunIn})`}><Sun x={0} y={0} r={110} t={t} /></g>
            <Ray a={[SUN_XY[0] + 110, SUN_XY[1] + 40]} b={[MOON[0] - 180, MOON[1] - 40]} p={ray1} t={t} />
            <Ray a={[MOON[0] - 40, MOON[1] + 180]} b={[MOON[0] - 190, MOON[1] + 440]} p={ray2} t={t} color="#fff3b0" />
          </g>
        )}
        {/* see it: flashlight + ball in a dark room */}
        {torchOn && (
          <g transform={`translate(${W / 2},640) scale(${EASE_OUT(prog(t, S('torch') - 0.2, S('torch') + 0.4))})`}>
            <TorchDemo t={t} on={beam} />
          </g>
        )}
        {/* recap cards */}
        {recapOn &&
          (['r1', 'r2', 'r3'] as const).map((k, i) => {
            const s = EASE_OUT(prog(t, S(k) - 0.1, S(k) + 0.35));
            if (s <= 0) return null;
            return (
              <g key={k} transform={`translate(${200 + i * 340},620) scale(${s})`}>
                <rect x={-150} y={-150} width={300} height={330} rx={40} fill="#ffffff" {...kst(8)} />
                {i === 0 && <g transform="translate(0,-10)"><Sun x={0} y={0} r={70} t={t} /></g>}
                {i === 1 && (
                  <g transform="translate(0,-10)">
                    <line x1={-110} y1={-80} x2={-30} y2={-30} stroke="#ffca3a" strokeWidth={14} strokeLinecap="round" />
                    <g transform="translate(30,10)"><Moon r={62} lit={1} t={t} /></g>
                  </g>
                )}
                {i === 2 && (
                  <g transform="translate(0,-10)">
                    <g transform="translate(20,-40)"><Moon r={46} lit={1} t={t} /></g>
                    <line x1={0} y1={10} x2={-60} y2={80} stroke="#fff3b0" strokeWidth={14} strokeLinecap="round" />
                    <path d="M -84,56 L -64,86 L -30,74" fill="none" stroke="#ffca3a" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                )}
                <circle cx={-130} cy={-130} r={36} fill={['#ffca3a', '#ff924c', '#4cc9f0'][i]} {...kst(5)} />
                <text x={-130} y={-116} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill="#ffffff">{i + 1}</text>
                <text y={150} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill={KINK}>{['Sun shines', 'hits the Moon', 'bounces to us'][i]}</text>
              </g>
            );
          })}
        {/* wow: the Moon is really dark grey, like an old road */}
        {wowOn && (
          <g>
            <g transform={`translate(${W / 2},470) scale(${EASE_OUT(prog(t, S('wow') - 0.2, S('wow') + 0.6))})`}>
              <Moon r={230} lit={1 - EASE_INOUT(prog(t, S('wow') + 1.4, S('wow') + 2.2))} t={t} />
            </g>
            <g opacity={EASE_OUT(prog(t, S('wow') + 2.4, S('wow') + 2.9))} transform="translate(0,830)">
              <rect x={140} y={-50} width={800} height={100} rx={20} fill="#5c5c6e" {...kst(7)} />
              {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={180 + i * 160} y={-8} width={90} height={16} rx={8} fill="#ffffff" />)}
            </g>
          </g>
        )}

        <Kid spec={MILA} x={MILA_X} y={f} scale={KID_S} expr={t < S('guess') ? 'wow' : within(t, S('see'), S('recap')) ? 'laugh' : explaining ? 'wow' : 'happy'}
          look={t < S('guess') ? [0.4, -0.7] : lookUp} mouth={lipSync(VO, 'mila', t)}
          armL={t >= S('end') ? 'wave' : t < S('guess') ? 'think' : 'down'}
          armR={within(t, S('see'), E('see')) ? 'point' : within(t, S('r1'), E('r3')) ? 'up' : t >= S('end') ? 'wave' : 'hip'}
          hop={t >= S('end') ? Math.abs(Math.sin((t - S('end')) * 6)) * 30 : 0} />
        <Critter spec={HOOT} x={HOOT_X} y={f} scale={0.55} expr={talks('hoot') ? 'happy' : t >= S('leo_wow') ? 'laugh' : 'smile'}
          look={explaining && !talks('hoot') ? [0.2, -0.8] : [0, 0]} mouth={lipSync(VO, 'hoot', t)}
          armR={talks('hoot') && explaining ? 'point' : t >= S('end') ? 'wave' : 'down'} armL={within(t, S('say'), E('say')) ? 'up' : 'down'} />
        <Kid spec={LEO} x={LEO_X} y={f} scale={KID_S}
          expr={within(t, S('guess'), E('good')) ? (t < S('good') ? 'laugh' : 'oops') : t >= S('leo_wow') ? 'laugh' : explaining ? 'wow' : 'happy'}
          look={lookUp} mouth={lipSync(VO, 'leo', t)}
          armL={within(t, S('guess'), E('guess')) || within(t, S('leo_say'), E('leo_say')) ? 'up' : t >= S('end') ? 'wave' : 'down'}
          armR={within(t, S('leo_wow'), E('leo_wow')) ? 'up' : t >= S('end') ? 'wave' : 'hip'}
          hop={within(t, S('leo_wow'), E('leo_wow') + 0.5) ? Math.abs(Math.sin((t - S('leo_wow')) * 7)) * 40 : 0} />
      </KidsStage>
      <PopText t={t} at={S('why') + 0.2} until={S('guess') - 0.2} text="?" y={760} size={300} color="#ffca3a" />
      <PopText t={t} at={S('nolight') + 0.4} until={S('sun') - 0.1} text="NO LIGHT OF ITS OWN" y={250} size={76} color="#ffffff" />
      <PopText t={t} at={S('word') + 0.9} until={S('torch') - 0.3} text="REFLECT!" y={250} size={150} color="#ffca3a" />
      <PopText t={t} at={E('say') + 0.1} until={S('leo_say') - 0.1} text="YOUR TURN!" y={1000} size={110} color="#ffffff" />
      <PopText t={t} at={S('torch') + 0.2} until={S('see') - 0.3} text="WITH A GROWN-UP!" y={250} size={96} color="#ff924c" />
      <PopText t={t} at={S('leo_wow') + 0.3} until={S('recap') - 0.3} text="MOONLIGHT = SUNLIGHT!" y={250} size={82} color="#fff3b0" />
      <PopText t={t} at={S('recap')} until={S('r1') - 0.2} text="LET'S REMEMBER!" y={360} size={110} color="#ffca3a" />
      <PopText t={t} at={S('wow') + 2.4} until={S('end') - 0.3} text="GREY LIKE A ROAD!" y={170} size={96} color="#ffffff" />
      <Confetti t={t} at={S('leo_wow')} y={600} />
      <Confetti t={t} at={S('end')} y={500} />
      <KidsCaptions lines={VO} t={t} colors={CAPTION_COLORS} />
    </>
  );
}
