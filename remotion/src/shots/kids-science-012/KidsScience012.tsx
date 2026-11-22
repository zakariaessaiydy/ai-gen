// TINY SPARKS · Day 12 · 🚀 Science for Kids #2 — "Why Does the Sun Shine?" (Short 9:16)
// kids-shorts/tiny-sparks/science/day-012-why-does-the-sun-shine. Cues from VO via K (keys.gen.ts).
// WHY? (Mila) → GUESS (Leo: a giant light bulb) → MODEL (Hoot: the Sun is a STAR, a giant ball of very hot
// gas · cutaway: tiny bits squeeze together in the core → light + heat burst out → the light travels to a
// little Earth) → the ONE word STAR (your-turn pause) → SAFETY (never look right at the Sun) → RECAP
// (3 cards) → WOW (about a million Earths fit inside the Sun) → "Keep asking why!".
import React from 'react';
import { Kid, kidFaceAt } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { CAPTION_COLORS, HOOT, LEO, MILA } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { Bubble, Confetti, FONT_TOON, KidsCaptions, KidsStage, PopText, TitleCard, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { EASE_INOUT, EASE_OUT, prog } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsScience012', durationInSeconds: 79.8, fps: 30, width: 1080, height: 1920 };

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
const SUN: [number, number] = [540, 600];

const Bulb: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <circle r={90} fill="#fff59d" opacity={0.35 + 0.15 * Math.sin(t * 8)} />
    <path d="M -60,-10 A 60,60 0 1,1 60,-10 Q 40,30 34,60 L -34,60 Q -40,30 -60,-10 Z" fill="#fff3b0" {...kst(6)} />
    <rect x={-34} y={60} width={68} height={40} rx={8} fill="#adb5bd" {...kst(5)} />
    <path d="M -16,40 L -8,0 L 0,30 L 8,0 L 16,40" fill="none" stroke="#ff924c" strokeWidth={6} strokeLinejoin="round" />
  </g>
);

// the big Sun: a hot gas ball with a wobbly glowing edge; `cut` opens a cutaway of the core
const BigSun: React.FC<{ t: number; r: number; cut: number; squeeze: number }> = ({ t, r, cut, squeeze }) => {
  const edge = Array.from({ length: 48 }, (_, i) => {
    const a = (i / 48) * Math.PI * 2;
    const rr = r * (1 + 0.05 * Math.sin(a * 6 + t * 3) + 0.03 * Math.sin(a * 11 - t * 4));
    return `${i ? 'L' : 'M'} ${Math.cos(a) * rr},${Math.sin(a) * rr}`;
  }).join(' ') + ' Z';
  return (
    <g>
      <circle r={r * 1.35} fill="#ffd166" opacity={0.25} />
      <path d={edge} fill="#ffb703" {...kst(8)} />
      <circle r={r * 0.82} fill="#ffd166" />
      {cut > 0 && (
        <g opacity={cut}>
          <circle r={r * 0.62} fill="#ff924c" {...kst(6)} />
          <circle r={r * 0.34} fill="#ff595e" {...kst(6)} />
          {/* tiny bits squeezing together in the core */}
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2 + t * 0.6;
            const d = r * 0.28 * (1 - 0.65 * squeeze * (0.5 + 0.5 * Math.sin(t * 6 + i)));
            return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={14} fill="#ffffff" {...kst(4)} />;
          })}
          {squeeze > 0.5 && <circle r={r * 0.12 * (0.7 + 0.3 * Math.sin(t * 10))} fill="#ffffff" opacity={0.9} />}
        </g>
      )}
    </g>
  );
};

const Earth: React.FC<{ r?: number }> = ({ r = 50 }) => (
  <g>
    <circle r={r} fill="#4cc9f0" {...kst(6)} />
    <path d={`M ${-r * 0.6},${-r * 0.2} q ${r * 0.3},${-r * 0.5} ${r * 0.6},${-r * 0.1} q ${r * 0.1},${r * 0.4} ${-r * 0.3},${r * 0.5} Z`} fill="#52b788" />
    <path d={`M ${r * 0.1},${r * 0.3} q ${r * 0.4},${-r * 0.2} ${r * 0.6},${r * 0.1} q ${-r * 0.2},${r * 0.4} ${-r * 0.5},${r * 0.2} Z`} fill="#52b788" />
  </g>
);

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

export default function KidsScience012() {
  const t = useT();
  const cam = camAt(t, CAM);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const explaining = within(t, S('star') - 0.3, S('recap'));
  const lookUp: [number, number] = explaining ? [0.1, -0.9] : [0, 0];

  const sunOn = within(t, S('star') - 0.3, S('recap') - 0.2) || within(t, S('wow') - 0.2, S('end') - 0.2);
  const sunScale = EASE_OUT(prog(t, S('star') - 0.3, S('star') + 0.5));
  const cut = EASE_INOUT(prog(t, S('inside') - 0.2, S('inside') + 0.8)) * (1 - EASE_INOUT(prog(t, S('travel'), S('travel') + 0.6)));
  const squeeze = EASE_INOUT(prog(t, S('inside') + 1.5, S('inside') + 3.0));
  const burst = within(t, S('energy'), S('travel') + 0.2) ? prog(t, S('energy'), S('energy') + 0.8) : 0;
  const travel = within(t, S('travel') - 0.2, S('recap') - 0.2);
  const sunR = travel ? 200 - 60 * EASE_INOUT(prog(t, S('travel'), S('travel') + 0.8)) : 200;
  const sunXY: [number, number] = travel ? [SUN[0] + 230 * EASE_INOUT(prog(t, S('travel'), S('travel') + 0.8)), SUN[1] - 180 * EASE_INOUT(prog(t, S('travel'), S('travel') + 0.8))] : SUN;
  const safety = within(t, S('safety') - 0.2, S('recap') - 0.2);
  const recapOn = within(t, S('r1') - 0.2, S('wow') - 0.3);
  const wowOn = within(t, S('wow') - 0.2, S('end') - 0.2);

  return (
    <>
      <KidsStage cam={cam}>
        <Meadow w={W} h={H} t={t} sun={!sunOn && !recapOn} />
        {/* Leo's wrong guess: a giant light bulb */}
        {within(t, S('guess') + 0.3, S('good') + 1.2) && (
          <g opacity={EASE_OUT(prog(t, S('guess') + 0.3, S('guess') + 0.7))}>
            <Bubble x={640} y={560} w={420} h={320} tx={lfx - 40} ty={lfy - 260}>
              <g transform="translate(640,550)"><Bulb t={t} /></g>
            </Bubble>
          </g>
        )}
        {/* the model */}
        {sunOn && !wowOn && (
          <g transform={`translate(${sunXY[0]},${sunXY[1]}) scale(${sunScale})`} opacity={safety ? 0.55 : 1}>
            {burst > 0 &&
              Array.from({ length: 12 }).map((_, i) => {
                const a = (i / 12) * Math.PI * 2;
                const r0 = sunR * 1.05;
                const r1 = sunR * (1.1 + 0.9 * burst);
                const wav = Array.from({ length: 7 }, (_, j) => {
                  const rr = r0 + ((r1 - r0) * j) / 6;
                  const off = Math.sin(j * 1.8 + t * 8) * 10;
                  return `${j ? 'L' : 'M'} ${Math.cos(a) * rr - Math.sin(a) * off},${Math.sin(a) * rr + Math.cos(a) * off}`;
                }).join(' ');
                return <path key={i} d={wav} fill="none" stroke={i % 2 ? '#ff595e' : '#ffd166'} strokeWidth={12} strokeLinecap="round" />;
              })}
            <BigSun t={t} r={sunR} cut={cut} squeeze={squeeze} />
          </g>
        )}
        {travel && (
          <g>
            <g transform={`translate(220,${SUN[1] + 300}) scale(${EASE_OUT(prog(t, S('travel') + 0.4, S('travel') + 1.0))})`}><Earth r={70} /></g>
            {[0, 1, 2].map((i) => {
              const p = ((t - S('travel') - 0.8) * 0.7 + i / 3) % 1;
              if (t < S('travel') + 0.8) return null;
              const x0 = sunXY[0] - 120;
              const y0 = sunXY[1] + 120;
              const x = x0 + (300 - x0) * p;
              const y = y0 + (SUN[1] + 240 - y0) * p;
              return <path key={i} d={`M ${x},${y} l 40,-30`} stroke="#ffd166" strokeWidth={16} strokeLinecap="round" opacity={1 - p * 0.3} />;
            })}
          </g>
        )}
        {safety && (
          <g transform={`translate(${W / 2},${SUN[1] + 150}) scale(${EASE_OUT(prog(t, S('safety') - 0.2, S('safety') + 0.3))})`}>
            <circle r={130} fill="#ffffff" {...kst(8)} />
            <path d="M -80,0 Q 0,-70 80,0 Q 0,70 -80,0 Z" fill="#ffffff" {...kst(7)} />
            <circle r={30} fill="#3a7d44" {...kst(5)} />
            <circle r={12} fill={KINK} />
            <circle r={130} fill="none" stroke="#ff595e" strokeWidth={22} />
            <line x1={-92} y1={-92} x2={92} y2={92} stroke="#ff595e" strokeWidth={22} strokeLinecap="round" />
          </g>
        )}
        {/* recap cards */}
        {recapOn &&
          (['r1', 'r2', 'r3'] as const).map((k, i) => {
            const s = EASE_OUT(prog(t, S(k) - 0.1, S(k) + 0.35));
            if (s <= 0) return null;
            return (
              <g key={k} transform={`translate(${200 + i * 340},620) scale(${s})`}>
                <rect x={-140} y={-150} width={280} height={330} rx={40} fill="#ffffff" {...kst(8)} />
                {i === 0 && <g transform="translate(0,-20) scale(0.4)"><BigSun t={t} r={200} cut={0} squeeze={0} /></g>}
                {i === 1 && <g transform="translate(0,-20) scale(0.45)"><BigSun t={t} r={200} cut={1} squeeze={1} /></g>}
                {i === 2 && <g transform="translate(0,-20)">{Array.from({ length: 8 }).map((_, j) => <line key={j} x1={0} y1={-36} x2={0} y2={-100} stroke={j % 2 ? '#ff595e' : '#ffd166'} strokeWidth={14} strokeLinecap="round" transform={`rotate(${j * 45})`} />)}<circle r={34} fill="#ffd166" {...kst(5)} /></g>}
                <circle cx={-120} cy={-130} r={36} fill={['#ffca3a', '#ff924c', '#ff595e'][i]} {...kst(5)} />
                <text x={-120} y={-116} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill="#ffffff">{i + 1}</text>
                <text y={150} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={38} fill={KINK}>{['a star', 'squeeze', 'light + heat'][i]}</text>
              </g>
            );
          })}
        {/* wow: the Sun next to a tiny Earth */}
        {wowOn && (
          <g>
            <g transform={`translate(560,640) scale(${EASE_OUT(prog(t, S('wow') - 0.2, S('wow') + 0.6))})`}><BigSun t={t} r={330} cut={0} squeeze={0} /></g>
            <g transform="translate(980,330)"><Earth r={16} /></g>
            <path d="M 960,350 Q 900,420 860,430" fill="none" stroke="#ffffff" strokeWidth={6} strokeDasharray="10 10" />
          </g>
        )}

        <Kid spec={MILA} x={MILA_X} y={f} scale={KID_S} expr={t < S('guess') ? 'wow' : t >= S('leo_wow') ? 'laugh' : explaining ? 'wow' : 'happy'}
          look={t < S('guess') ? [0.3, -0.6] : lookUp} mouth={lipSync(VO, 'mila', t)}
          armL={t >= S('end') ? 'wave' : t < S('guess') ? 'think' : safety ? 'hug' : 'down'} armR={within(t, S('r1'), E('r3')) ? 'up' : t >= S('end') ? 'wave' : 'hip'}
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
      <TitleCard t={t} from={0} to={1.2} title="SUNSHINE!" sub="Why does the Sun shine?" />
      <PopText t={t} at={S('why') + 0.2} until={S('guess') - 0.2} text="?" y={620} size={360} color="#ffca3a" />
      <PopText t={t} at={S('star') + 0.6} until={S('inside') - 0.3} text="STAR!" y={300} size={160} color="#ffca3a" />
      <PopText t={t} at={E('say') + 0.1} until={S('leo_say') - 0.1} text="YOUR TURN!" y={1000} size={110} color="#ffffff" />
      <PopText t={t} at={S('energy') + 0.6} until={S('travel') - 0.2} text="LIGHT + HEAT!" y={1000} size={110} color="#ff924c" />
      <PopText t={t} at={S('safety') + 0.4} until={S('recap') - 0.3} text="DON'T LOOK AT THE SUN!" y={300} size={80} color="#ff595e" />
      <PopText t={t} at={S('recap')} until={S('r1') - 0.2} text="LET'S REMEMBER!" y={360} size={110} color="#ffca3a" />
      <PopText t={t} at={S('wow')} until={S('end') - 0.3} text="1,000,000 EARTHS!" y={250} size={100} color="#ffffff" />
      <Confetti t={t} at={S('leo_wow')} y={600} />
      <Confetti t={t} at={S('end')} y={500} />
      <KidsCaptions lines={VO} t={t} colors={CAPTION_COLORS} />
    </>
  );
}
