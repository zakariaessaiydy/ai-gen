// TINY SPARKS · Day 40 · 🚀 Science for Kids #6 — "What Are Clouds?" (Short 9:16, 1:43)
// kids-shorts/tiny-sparks/science/day-040-what-are-clouds. Cues from VO via K (keys.gen.ts).
// ENERGY LAYER (Short: no ident). WHY? (Mila points at the clouds) → GUESS (Leo: cotton candy! — his bubble shows a
// cotton-candy cloud; Hoot: good guess, but… water!) → MODEL by the sea: the warm Sun shines → invisible water goes UP
// (faint dashed wiggles, "you can't see it") → the ONE word EVAPORATION (your turn) → high up it is cold → it turns
// into tiny drops → millions of drops gather = a cloud (drops fly in, the cloud grows) → big heavy drops fall = RAIN
// (splash) → SEE IT at home with a grown-up: breathe on a cold mirror, a tiny cloud of drops → RECAP 4 icons → WOW:
// one big cloud can weigh as much as ~80 elephants (USGS: ~500 t; elephant ~6 t) → bye.
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { CAPTION_COLORS, HOOT_HERO, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Sun } from '../../lib/kids/sets';
import { Bubble, Confetti, FONT_TOON, KidsCaptions, PopText, lipSync, useT } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, Dust, ImpactStar, Reaction, StageWord, StarWipe, directorCam, type Shot } from '../../lib/kids/energy';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsScience040', durationInSeconds: 102.5, fps: 30, width: 1080, height: 1920 };

const W = 1080;
const H = 1920;
const f = FLOOR(H);
type Key = keyof typeof K;
const S = (k: Key) => VO[K[k]].start;
const E = (k: Key) => VO[K[k]].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;
const word = (k: Key, i: number) => {
  const w = timeWords(VO[K[k]]);
  return (w[Math.min(i, w.length - 1)] ?? { start: S(k) }).start;
};
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff' };
const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (EASE_OUT(p) - 1) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};
const SEA_Y = 1180; // the sea surface (model scenes)
const CLOUD: [number, number] = [620, 470];

// timeline
const SEA0 = S('step1') - 0.6; // the model scene starts (sea + sun)
const UP0 = word('step2', 4); // water goes up
const DROPS0 = word('step3', 8); // turns into tiny drops
const GATHER0 = S('step4'); // drops gather into the cloud
const RAIN0 = word('rain', 7); // "fall down"
const MIRROR0 = S('mirror') - 0.3;
const HAAA = word('mirror', 5);
const RECAP0 = S('recap') - 0.3;
const FACT0 = S('fact') - 0.3;
const BYE0 = S('bye') - 0.3;
type Scene = 'meadow' | 'model' | 'mirror' | 'recap' | 'fact';
const sceneAt = (t: number): Scene => (t < SEA0 ? 'meadow' : t < MIRROR0 ? 'model' : t < RECAP0 ? 'mirror' : t < FACT0 ? 'recap' : t < BYE0 ? 'fact' : 'meadow');

const SHOTS: Shot[] = [
  { t: 0, z: 1.0, x: 540, y: 960, move: 'cut', push: 0.004 },
  { t: S('guess') - 0.2, z: 1.35, x: 540, y: 1150, move: 'snap' },
  { t: S('good') - 0.2, z: 1.0, x: 540, y: 960, move: 'smooth', dur: 0.6 },
  { t: word('good', 13), z: 1.2, x: 540, y: 900, move: 'snap' },
  { t: S('water') - 0.1, z: 1.3, x: 640, y: 1250, move: 'whip' },
  { t: SEA0, z: 1.0, x: 540, y: 960, move: 'cut' },
  { t: S('word') - 0.2, z: 1.15, x: 540, y: 900, move: 'smooth', dur: 0.6 },
  { t: S('step3') - 0.2, z: 1.3, x: 620, y: 620, move: 'smooth', dur: 1.0, push: 0.01 },
  { t: GATHER0 + 1.5, z: 1.0, x: 540, y: 960, move: 'smooth', dur: 1.0 },
  { t: S('wow') - 0.15, z: 1.35, x: 640, y: 1250, move: 'snap' },
  { t: S('rain') - 0.2, z: 1.0, x: 540, y: 960, move: 'smooth', dur: 0.6 },
  { t: MIRROR0, z: 1.0, x: 540, y: 960, move: 'cut' },
  { t: HAAA - 0.1, z: 1.3, x: 540, y: 700, move: 'snap' },
  { t: RECAP0, z: 1.0, x: 540, y: 960, move: 'cut' },
];
const PUNCHES = [word('good', 13), UP0, GATHER0 + 2.0, RAIN0, HAAA, S('r1'), S('r2'), S('r3'), S('r4')];

// ── drawing helpers
const Cloud: React.FC<{ s?: number; face?: KExpr; grey?: number; t: number }> = ({ s = 1, face = 'happy', grey = 0, t }) => {
  const c = grey > 0 ? `rgb(${255 - grey * 70},${255 - grey * 60},${255 - grey * 40})` : '#ffffff';
  return (
    <g transform={`scale(${s})`}>
      <Vol>
        <path d="M -220,60 Q -270,60 -270,10 Q -270,-50 -200,-56 Q -190,-140 -100,-140 Q -60,-200 20,-180 Q 90,-210 140,-140 Q 230,-150 240,-60 Q 290,-40 280,20 Q 270,60 220,60 Z" fill={c} {...kst(9)} />
      </Vol>
      <g transform="translate(0,-40)">
        {[-50, 50].map((x) => (
          <g key={x} transform={`translate(${x},0)`}>
            {face === 'happy' || face === 'laugh' ? <path d="M -16,6 Q 0,-14 16,6" fill="none" {...kst(7)} /> : <circle r={11} fill={KINK} />}
          </g>
        ))}
        <path d={`M -26,30 Q 0,${54 + Math.sin(t * 3) * 4} 26,30`} fill="#ff7aa2" {...kst(6)} />
        <ellipse cx={-90} cy={24} rx={26} ry={14} fill="#ff8fab" opacity={0.5} />
        <ellipse cx={90} cy={24} rx={26} ry={14} fill="#ff8fab" opacity={0.5} />
      </g>
    </g>
  );
};
const Drop: React.FC<{ s?: number; c?: string }> = ({ s = 1, c = '#4cc9f0' }) => (
  <g transform={`scale(${s})`}>
    <path d="M 0,-30 C 12,-10 20,4 20,14 A 20,20 0 0 1 -20,14 C -20,4 -12,-10 0,-30 Z" fill={c} {...kst(5)} />
    <ellipse cx={-6} cy={8} rx={5} ry={8} fill="#ffffff" opacity={0.7} />
  </g>
);
const CottonCandy: React.FC = () => (
  <g>
    <rect x={-8} y={20} width={16} height={130} rx={6} fill="#fff3b0" {...kst(5)} />
    <Vol>{[[-50, -10, 60], [40, -20, 66], [0, -70, 64], [-10, 30, 56]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? '#ff8fab' : '#ffb3c6'} {...kst(5)} />)}</Vol>
  </g>
);
const Meadow2: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <defs>
      <linearGradient id="sky40" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7ec8f8" />
        <stop offset="1" stopColor="#d7f2ff" />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#sky40)" />
    <Sun x={900} y={240} r={80} t={t} />
    {[[200, 360, 0.7], [700, 520, 0.9], [330, 760, 0.55]].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${(x + t * 14 * (i + 1)) % (W + 400) - 200},${y})`}><Cloud s={s} t={t + i} face={i === 1 ? 'smile' : 'happy'} /></g>
    ))}
    <Vol kind="slope"><path d={`M 0,${f - 140} Q 300,${f - 260} 620,${f - 170} Q 900,${f - 100} ${W},${f - 180} L ${W},${H} L 0,${H} Z`} fill="#8ac926" {...kst(7)} /></Vol>
    <rect x={0} y={f} width={W} height={H - f} fill="#7cc576" />
    <line x1={0} y1={f} x2={W} y2={f} {...kst(7)} />
  </g>
);
const SeaSet: React.FC<{ t: number; cold: number }> = ({ t, cold }) => (
  <g>
    <defs>
      <linearGradient id="sky40b" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#5fa8e8" />
        <stop offset="0.6" stopColor="#bfe7ff" />
        <stop offset="1" stopColor="#fff1c9" />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#sky40b)" />
    {/* the cold zone up high */}
    <defs>
      <linearGradient id="cold40" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.7" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect width={W} height={760} fill="url(#cold40)" opacity={cold} />
    {cold > 0 && [[120, 120], [420, 90], [960, 160], [760, 300]].map(([x, y], i) => (
      <g key={i} opacity={cold} transform={`translate(${x},${y}) rotate(${t * 20 + i * 30})`}>
        {[0, 60, 120].map((a) => <path key={a} d="M 0,-22 L 0,22" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" transform={`rotate(${a})`} />)}
      </g>
    ))}
    {cold > 0 && <text x={40} y={660} fontFamily={FONT_TOON} fontWeight={700} fontSize={54} fill="#1982c4" opacity={cold}>COLD!</text>}
    <Sun x={880} y={300} r={95} t={t} />
    {/* sea */}
    <Vol kind="slope"><rect x={0} y={SEA_Y} width={W} height={H - SEA_Y} fill="#1d9bf0" /></Vol>
    {Array.from({ length: 7 }).map((_, i) => (
      <path key={i} d={`M ${-40 + i * 170 + Math.sin(t * 1.2 + i) * 20},${SEA_Y + 40 + (i % 3) * 70} q 40,-24 80,0 q 40,24 80,0`} fill="none" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.7} />
    ))}
    <path d={`M 0,${SEA_Y} ${Array.from({ length: 13 }).map((_, i) => `Q ${i * 90 + 45},${SEA_Y - 16 + Math.sin(t * 2 + i) * 6} ${(i + 1) * 90},${SEA_Y}`).join(' ')}`} fill="none" {...kst(8)} />
    {/* little sand beach where the cast stands */}
    <Vol kind="slope"><path d={`M 0,${f - 40} Q 400,${f - 120} 1080,${f - 60} L 1080,${H} L 0,${H} Z`} fill="#f3d9a4" {...kst(7)} /></Vol>
  </g>
);

export default function KidsScience040() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const scene = sceneAt(t);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const cold = scene === 'model' ? prog(t, S('step3'), S('step3') + 1.0) : 0;
  const cloudS = scene === 'model' ? (t < GATHER0 ? 0 : EASE_OUT(prog(t, GATHER0 + 0.6, E('step4') + 0.2))) : 0;
  const raining = within(t, RAIN0 - 0.3, MIRROR0);
  const yay = within(t, S('splash'), E('splash') + 0.4) || t >= S('bye');

  const leoExpr: KExpr = within(t, S('guess'), E('guess')) ? 'laugh' : within(t, S('water'), E('water')) ? 'surprised' : within(t, S('wow'), E('wow')) ? 'wow' : talks('leo') ? 'happy' : yay ? 'laugh' : 'smile';
  const milaExpr: KExpr = within(t, S('why'), E('why')) ? 'wow' : talks('mila') ? 'happy' : yay ? 'laugh' : within(t, S('fact'), E('fact')) ? 'wow' : 'smile';
  const hootExpr: KExpr = talks('hoot') ? 'happy' : within(t, S('fact'), E('fact')) ? 'proud' : 'smile';
  const recapItems = (['r1', 'r2', 'r3', 'r4'] as const);

  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
        {scene === 'meadow' || scene === 'fact' || scene === 'recap' ? <Meadow2 t={t} /> : null}
        {scene === 'model' && <SeaSet t={t} cold={cold} />}

        {/* ── the water cycle model ── */}
        {scene === 'model' && (
          <g>
            {/* sun rays onto the sea */}
            {within(t, word('step1', 4), S('step3')) && [0, 1, 2].map((i) => {
              const p = (t * 0.8 + i / 3) % 1;
              return <path key={i} d={`M ${840 - p * 300},${360 + p * 760} l -40,40`} stroke="#ffca3a" strokeWidth={14} strokeLinecap="round" opacity={1 - p} />;
            })}
            {/* invisible water going up: faint dashed wiggles */}
            {within(t, UP0 - 0.2, DROPS0 + 0.6) && Array.from({ length: 6 }).map((_, i) => {
              const p = (t * 0.35 + i / 6) % 1;
              const x = 260 + i * 110 + Math.sin(t * 2 + i) * 20;
              const op = (t >= word('step2', 12) - 0.2 && t < S('word') ? 0.22 : 0.6) * Math.sin(p * Math.PI);
              return <path key={i} d={`M ${x},${SEA_Y - 20 - p * 600} q 20,-30 0,-60 q -20,-30 0,-60`} fill="none" stroke="#ffffff" strokeWidth={10} strokeLinecap="round" strokeDasharray="2 22" opacity={op} />;
            })}
            {within(t, UP0, S('step3')) && [0, 1, 2].map((i) => (
              <path key={i} d={`M ${400 + i * 140},${SEA_Y - 120} l 0,-160 m -26,30 l 26,-30 l 26,30`} fill="none" stroke="#ffffff" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" opacity={0.85 * Math.min(1, prog(t, UP0 + i * 0.2, UP0 + 0.4 + i * 0.2))} />
            ))}
            {/* tiny drops appear up high, then fly into the cloud */}
            {t >= DROPS0 && Array.from({ length: 22 }).map((_, i) => {
              const sx = 160 + ((i * 137) % 760);
              const sy = 260 + ((i * 89) % 320);
              const g = EASE_INOUT(prog(t, GATHER0 + 0.1 + (i % 6) * 0.12, GATHER0 + 1.4 + (i % 6) * 0.12));
              const x = sx + (CLOUD[0] - sx) * g;
              const y = sy + (CLOUD[1] - sy) * g;
              const s = popIn(t, DROPS0 + (i % 8) * 0.08) * (1 - g * 0.6) * 0.8;
              return g < 1 ? <g key={i} transform={`translate(${x},${y})`}><Drop s={s} /></g> : null;
            })}
            {/* the cloud */}
            {cloudS > 0 && (
              <g transform={`translate(${CLOUD[0]},${CLOUD[1] + Math.sin(t * 1.5) * 8})`}>
                <Cloud s={0.95 * cloudS} t={t} face={raining ? 'surprised' : 'happy'} grey={raining ? 0.5 : prog(t, S('rain'), RAIN0) * 0.5} />
              </g>
            )}
            {/* rain */}
            {raining && Array.from({ length: 16 }).map((_, i) => {
              const p = ((t - RAIN0) * 1.1 + i / 16) % 1;
              if (t < RAIN0) return null;
              return <g key={i} transform={`translate(${CLOUD[0] - 210 + (i % 8) * 60},${CLOUD[1] + 60 + p * (SEA_Y - CLOUD[1] - 60)})`}><Drop s={0.75} /></g>;
            })}
            <ImpactStar t={t} at={GATHER0 + 1.9} x={CLOUD[0]} y={CLOUD[1]} s={0.9} color="#ffffff" />
            {raining && t >= RAIN0 + 0.8 && [0, 1, 2].map((i) => <Dust key={i} t={t} at={RAIN0 + 0.8 + i * 0.5} x={CLOUD[0] - 120 + i * 120} y={SEA_Y} s={0.5} />)}
            <StageWord t={t} at={word('splash', 0)} until={E('splash') + 0.6} text="SPLASH!" x={620} y={SEA_Y - 120} size={96} color="#4cc9f0" rot={-6} />
            <StageWord t={t} at={GATHER0 + 1.9} until={GATHER0 + 3.6} text="A CLOUD!" x={CLOUD[0]} y={CLOUD[1] - 230} size={88} color="#ffca3a" rot={4} />
          </g>
        )}

        {/* ── see it at home: breathe on a cold mirror ── */}
        {scene === 'mirror' && (
          <g>
            <rect width={W} height={H} fill="#fff1f6" />
            <rect x={0} y={f - 60} width={W} height={H - f + 60} fill="#f3d9a4" />
            <g transform={`translate(540,640) scale(${popIn(t, MIRROR0 + 0.2)})`}>
              <rect x={-230} y={-300} width={460} height={600} rx={60} fill="#c0874f" {...kst(9)} />
              <rect x={-196} y={-266} width={392} height={532} rx={44} fill="#dff4ff" {...kst(6)} />
              <path d="M -150,-200 L -60,-250 M -150,-140 L 20,-240" stroke="#ffffff" strokeWidth={14} strokeLinecap="round" opacity={0.8} />
              {/* the breath fog = a tiny cloud of drops */}
              {t >= HAAA && (
                <g opacity={Math.min(1, prog(t, HAAA, HAAA + 0.5)) * (1 - prog(t, RECAP0 - 1.2, RECAP0 - 0.3))}>
                  <ellipse cx={0} cy={60} rx={150 * EASE_OUT(prog(t, HAAA, HAAA + 0.7))} ry={110 * EASE_OUT(prog(t, HAAA, HAAA + 0.7))} fill="#ffffff" opacity={0.75} />
                  {t >= word('mirror', 9) && Array.from({ length: 12 }).map((_, i) => (
                    <circle key={i} cx={-110 + (i % 4) * 70} cy={0 + Math.floor(i / 4) * 55} r={popIn(t, word('mirror', 9) + i * 0.04) * 9} fill="#4cc9f0" {...kst(2)} />
                  ))}
                </g>
              )}
            </g>
            <StageWord t={t} at={HAAA} until={HAAA + 1.4} text="HAAA!" x={760} y={330} size={84} color="#4cc9f0" rot={8} />
          </g>
        )}

        {/* ── recap: 4 icons ── */}
        {scene === 'recap' && recapItems.map((k, i) => {
          const at = S(k) - 0.1;
          if (t < at) return null;
          const x = 290 + (i % 2) * 500;
          const y = 420 + Math.floor(i / 2) * 420;
          const on = within(t, S(k), E(k) + 0.3);
          return (
            <g key={k} transform={`translate(${x},${y}) scale(${popIn(t, at) * (on ? 1.08 : 1)})`}>
              <rect x={-210} y={-180} width={420} height={360} rx={40} fill={on ? '#fff3b0' : '#ffffff'} {...kst(on ? 10 : 7)} />
              <circle cx={-180} cy={-150} r={36} fill={['#ff924c', '#4cc9f0', '#b388ff', '#1982c4'][i]} {...kst(5)} />
              <text x={-180} y={-136} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={42} fill="#ffffff">{i + 1}</text>
              <g transform="translate(0,-30)">
                {i === 0 && <g><Sun x={0} y={-10} r={56} t={t} /><path d="M -120,90 q 60,-30 120,0 q 60,30 120,0" fill="none" stroke="#1d9bf0" strokeWidth={14} strokeLinecap="round" /></g>}
                {i === 1 && [0, 1, 2].map((j) => <path key={j} d={`M ${-80 + j * 80},90 l 0,-150 m -26,30 l 26,-30 l 26,30`} fill="none" stroke="#4cc9f0" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />)}
                {i === 2 && <Cloud s={0.5} t={t} />}
                {i === 3 && <g><Cloud s={0.4} t={t} grey={0.5} />{[-60, 0, 60].map((x) => <g key={x} transform={`translate(${x},80)`}><Drop s={0.8} /></g>)}</g>}
              </g>
              <text y={150} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={44} fill={KINK}>{['sun warms', 'water goes up', 'drops = cloud', 'rain!'][i]}</text>
            </g>
          );
        })}

        {/* ── wow fact: the cloud on a scale vs elephants ── */}
        {scene === 'fact' && (
          <g>
            <g transform={`translate(540,520) scale(${popIn(t, FACT0 + 0.2)})`}><Cloud s={1.15} t={t} face="laugh" /></g>
            <g transform={`translate(540,880) scale(${popIn(t, word('fact', 9))})`}>
              <rect x={-380} y={-70} width={760} height={140} rx={60} fill="#ffffff" {...kst(8)} />
              <text y={24} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={64} fill={KINK}>≈ 80 ELEPHANTS</text>
            </g>
          </g>
        )}

        {/* ── the cast ── */}
        <Kid spec={MILA_HERO} x={190} y={f} scale={0.6} expr={milaExpr} look={[0.5, -0.6]} mouth={lipSync(VO, 'mila', t)}
          armR={within(t, S('why'), E('why')) ? 'point' : yay ? 'up' : talks('mila') ? 'present' : 'down'} armL={yay ? 'up' : 'hip'} hop={yay ? Math.abs(Math.sin(t * 7)) * 24 : 0} />
        <Kid spec={LEO_HERO} x={540} y={f + 30} scale={0.6} expr={leoExpr} look={[0.2, -0.6]} mouth={lipSync(VO, 'leo', t)}
          armL={within(t, S('guess'), E('guess')) ? 'up' : yay ? 'up' : 'down'} armR={within(t, S('wow'), E('wow')) ? 'up' : yay ? 'up' : 'down'} hop={yay ? Math.abs(Math.sin(t * 7 + 1)) * 24 : 0} />
        <Critter spec={HOOT_HERO} x={880} y={f} scale={0.55} expr={hootExpr} look={[-0.5, -0.4]} mouth={lipSync(VO, 'hoot', t)}
          armL={talks('hoot') ? 'point' : 'down'} armR={within(t, S('fact'), E('fact')) ? 'up' : 'down'} facing={-1} />

        {/* Leo's wrong guess */}
        {within(t, word('guess', 2), word('good', 14)) && (
          <g transform={`translate(560,${f - 820}) scale(${popIn(t, word('guess', 2))})`}>
            <Bubble x={0} y={0} w={420} h={300} tx={-20} ty={240}>
              <g transform="translate(0,-10) scale(0.9)"><CottonCandy /></g>
            </Bubble>
          </g>
        )}
        <Reaction kind="?" t={t} at={S('water')} until={E('water') + 0.4} x={560} y={f - 690} s={0.7} />
        <Reaction kind="idea" t={t} at={S('wow')} until={E('wow') + 0.3} x={560} y={f - 700} s={0.7} />
        <Reaction kind="!" t={t} at={word('fact', 10)} until={E('fact') + 0.5} x={190} y={f - 700} s={0.7} />
      </ActionStage>

      <PopText t={t} at={0.3} until={S('guess') - 0.2} text="WHAT ARE CLOUDS?" y={300} size={100} color="#ffffff" />
      <PopText t={t} at={word('good', 14)} until={E('water') + 0.4} text="WATER!" y={300} size={150} color="#4cc9f0" />
      <PopText t={t} at={word('word', 3)} until={E('word_turn') + 0.8} text="EVAPORATION" y={600} size={110} color="#ffca3a" />
      <PopText t={t} at={word('word', 4)} until={E('word_turn') + 0.8} text="= water goes up!" y={730} size={66} color="#ffffff" rot={2} />
      <PopText t={t} at={E('word_turn') - 0.4} until={S('step3') - 0.2} text="YOUR TURN!" y={860} size={100} color="#ffffff" />
      <PopText t={t} at={word('wow', 2)} until={S('rain') - 0.2} text="CLOUD = TINY DROPS" y={300} size={86} color="#ffffff" />
      <PopText t={t} at={word('rain', 11)} until={E('splash') + 0.6} text="RAIN!" y={300} size={150} color="#1982c4" />
      <PopText t={t} at={S('see')} until={HAAA - 0.2} text="TRY IT WITH A GROWN-UP!" y={220} size={70} color="#ff6fa5" />
      <PopText t={t} at={S('recap') + 0.1} until={S('r1') - 0.1} text="LET'S REMEMBER!" y={300} size={100} color="#ffca3a" />
      <PopText t={t} at={S('fact')} until={BYE0} text="WOW FACT!" y={220} size={100} color="#ffca3a" />
      <Confetti t={t} at={S('splash')} y={700} />
      <Confetti t={t} at={S('bye')} y={700} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <StarWipe t={t} at={E('bye') + 0.6} dur={0.5} hold={5} color="#3b2a4a" x={W / 2} y={H * 0.4} />
    </>
  );
}
