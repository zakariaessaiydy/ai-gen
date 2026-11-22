// TINY SPARKS · Day 54 · 🚀 Science for Kids #8 — "How Does Snow Form?" (LONG 16:9)
// kids-shorts/tiny-sparks/science/day-054-how-does-snow-form. Cues from VO via K (keys.gen.ts).
// ENERGY LAYER standard: ident → WHY? (Mila in the falling snow) → GUESS (Leo: a giant polar bear shakes a bag of
// sugar! — Hoot: good guess, but snow is frozen water) → Drippy the raindrop (Day 47) is back → 3 QUESTIONS on a sky
// cross-section: 1 how does Drippy become snow? (up into a cold winter cloud, colder than a freezer; holds a speck of
// dust and FREEZES → the one word: ICE CRYSTAL, your turn) · 2 how does a snowflake grow? (water freezes on, it grows
// its arms one by one — count them: SIX; show six fingers) · 3 why snow and not rain? (cold air all the way down; warm
// air near the ground → it melts into rain) → lands on a mitten → millions cover everything → WOW: almost every
// snowflake looks a little different → MAKE IT with a grown-up: a paper snowflake (fold, fold, cut, open — six arms) →
// snowman → what happens in the sun? (it melts, back to the water cycle) → remember (5 questions) → chant → bye.
// Facts: snow crystals form when supercooled droplets freeze onto ice nuclei (dust/pollen) and grow by vapour
// deposition; ice crystals are hexagonal → six-fold snowflakes (NOAA/NWS, Met Office); snow reaches the ground when the
// air stays below freezing; "no two alike" said as "almost every snowflake looks a little bit different".
import React from 'react';
import { Kid, kidFaceAt, type KArm } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, HOOT_HERO, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Sun } from '../../lib/kids/sets';
import { Backdrop } from '../../lib/kids/places';
import { Bubble, Confetti, FONT_TOON, KidsCaptions, PopText, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { Face, KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, Dust, ImpactStar, MotionLines, Reaction, SparksIntro, StageWord, StarWipe, directorCam, onBeat, type Shot } from '../../lib/kids/energy';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsScience054', durationInSeconds: 302.4, fps: 30, width: 1920, height: 1080 };

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
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff', drippy: '#4cc9f0' };
const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (EASE_OUT(p) - 1) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};

const Drippy: React.FC<{ x: number; y: number; s: number; expr: KExpr; mouth?: number; faint?: number; t: number; squash?: number; look?: [number, number] }> = ({
  x, y, s, expr, mouth = 0, faint = 0, t, squash = 0, look = [0, 0.1],
}) => {
  const blink = (t * 30) % 96 < 4;
  return (
    <g transform={`translate(${x},${y}) scale(${s * (1 + squash * 0.12)},${s * (1 - squash * 0.16)})`} opacity={1 - faint * 0.75}>
      <ellipse cx={0} cy={6} rx={92} ry={16} fill="#3b2a4a" opacity={0.15 * (1 - faint)} />
      {faint > 0.5 ? (
        <path d="M 0,-270 C 40,-200 110,-140 110,-90 A 110,110 0 0 1 -110,-90 C -110,-140 -40,-200 0,-270 Z" fill="none" stroke="#ffffff" strokeWidth={10} strokeDasharray="4 22" strokeLinecap="round" />
      ) : (
        <>
          <Vol>
            <path d="M 0,-270 C 40,-200 110,-140 110,-90 A 110,110 0 0 1 -110,-90 C -110,-140 -40,-200 0,-270 Z" fill="#4cc9f0" {...kst(8)} />
          </Vol>
          <ellipse cx={-50} cy={-150} rx={16} ry={30} fill="#ffffff" opacity={0.6} transform="rotate(25 -50 -150)" />
          <g transform="translate(0,-92) scale(0.62)">
            <Face expr={expr} look={look} mouth={mouth} blink={blink} skin="#4cc9f0" iris="#1b4f8a" eyeR={42} eyeDX={62} eyeY={-10} mouthY={70} mouthW={44} brows={false} nose={<g />} />
          </g>
        </>
      )}
    </g>
  );
};
const MiniDrop: React.FC<{ s?: number; c?: string }> = ({ s = 1, c = '#4cc9f0' }) => (
  <g transform={`scale(${s})`}>
    <path d="M 0,-30 C 12,-10 20,4 20,14 A 20,20 0 0 1 -20,14 C -20,4 -12,-10 0,-30 Z" fill={c} {...kst(5)} />
    <ellipse cx={-6} cy={8} rx={5} ry={8} fill="#ffffff" opacity={0.7} />
  </g>
);
const Cloud: React.FC<{ s?: number; grey?: number; t: number; expr?: 'happy' | 'wow' }> = ({ s = 1, grey = 0, t, expr = 'happy' }) => {
  const c = `rgb(${255 - grey * 80},${255 - grey * 70},${255 - grey * 45})`;
  return (
    <g transform={`scale(${s})`}>
      <Vol>
        <path d="M -260,70 Q -320,70 -320,10 Q -320,-60 -240,-66 Q -228,-160 -120,-160 Q -70,-230 24,-208 Q 108,-240 166,-160 Q 270,-170 282,-70 Q 340,-46 330,24 Q 318,70 260,70 Z" fill={c} {...kst(9)} />
      </Vol>
      <g transform="translate(0,-60)">
        {[-56, 56].map((x) => (expr === 'happy'
          ? <path key={x} d={`M ${x - 16},6 Q ${x},-14 ${x + 16},6`} fill="none" {...kst(7)} />
          : <circle key={x} cx={x} cy={0} r={12} fill={KINK} />))}
        <path d={`M -26,30 Q 0,${54 + Math.sin(t * 3) * 4} 26,30`} fill="#ff7aa2" {...kst(6)} />
      </g>
    </g>
  );
};
// a snowflake: `arms` 0..6 grown, optional face (Drippy as a snowflake)
const Flake: React.FC<{ arms: number; s?: number; c?: string; face?: KExpr; mouth?: number; t?: number; rot?: number }> = ({ arms, s = 1, c = '#bfefff', face, mouth = 0, t = 0, rot = 0 }) => (
  <g transform={`rotate(${rot}) scale(${s})`}>
    {Array.from({ length: 6 }).map((_, i) => {
      const g = Math.max(0, Math.min(1, arms - i));
      if (g <= 0) return null;
      return (
        <g key={i} transform={`rotate(${i * 60}) scale(${g})`}>
          <rect x={-11} y={-150} width={22} height={150} rx={11} fill={c} {...kst(5)} />
          <path d="M 0,-70 L -34,-104 M 0,-70 L 34,-104 M 0,-110 L -24,-134 M 0,-110 L 24,-134" stroke={c} strokeWidth={14} strokeLinecap="round" />
          <path d="M 0,-70 L -34,-104 M 0,-70 L 34,-104 M 0,-110 L -24,-134 M 0,-110 L 24,-134" stroke={KINK} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
        </g>
      );
    })}
    <Vol><polygon points={Array.from({ length: 6 }).map((_, i) => `${Math.cos(((i * 60 - 90) * Math.PI) / 180) * 62},${Math.sin(((i * 60 - 90) * Math.PI) / 180) * 62}`).join(' ')} fill={c} {...kst(6)} /></Vol>
    {face && (
      <g transform={`rotate(${-rot}) scale(0.5)`}>
        <Face expr={face} look={[0, 0.1]} mouth={mouth} blink={(t * 30) % 96 < 4} skin={c} iris="#1b4f8a" eyeR={34} eyeDX={46} eyeY={-14} mouthY={44} mouthW={36} brows={false} nose={<g />} />
      </g>
    )}
  </g>
);
const SnowGround: React.FC = () => (
  <g>
    <Vol kind="slope"><path d={`M -20,${f - 40} Q 300,${f - 90} 700,${f - 50} Q 1200,${f - 10} 1500,${f - 60} Q 1750,${f - 90} ${W + 20},${f - 40} L ${W + 20},${H + 20} L -20,${H + 20} Z`} fill="#f4fbff" {...kst(7)} /></Vol>
    {[[260, f + 60], [900, f + 90], [1500, f + 70]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={140} ry={14} fill="#cdeaff" opacity={0.7} />)}
  </g>
);
const SugarBag: React.FC = () => (
  <g>
    <Vol><path d="M -70,-70 L 70,-70 L 86,90 L -86,90 Z" fill="#ffffff" {...kst(7)} /></Vol>
    <rect x={-50} y={-10} width={100} height={44} rx={8} fill="#ff6fa5" {...kst(4)} />
    <text y={22} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={26} fill="#ffffff">SUGAR</text>
    {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={-40 + i * 20} cy={110 + (i % 2) * 20} r={6} fill="#ffffff" {...kst(2)} />)}
  </g>
);
const Thermo: React.FC<{ warm: boolean; label: string }> = ({ warm, label }) => (
  <g>
    <rect x={-160} y={-260} width={320} height={460} rx={30} fill="#ffffff" opacity={0.9} {...kst(6)} />
    <rect x={-120} y={-230} width={240} height={200} rx={16} fill="#a0c4ff" />
    <rect x={-120} y={-30} width={240} height={200} rx={16} fill={warm ? '#ffb3a7' : '#a0c4ff'} />
    <text y={240} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill={KINK}>{label}</text>
    <text x={0} y={-120} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={34} fill="#1982c4">COLD</text>
    <text x={0} y={80} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={34} fill={warm ? '#e63946' : '#1982c4'}>{warm ? 'WARM' : 'COLD'}</text>
  </g>
);

// ── scenes
const MODEL0 = S('q1') - 0.3;
const LAB0 = S('craft') - 0.3;
const PLAY0 = S('play') - 0.3;
type Scene = 'snowy' | 'model' | 'lab';
const sceneAt = (t: number): Scene => (t < MODEL0 ? 'snowy' : t < LAB0 ? 'model' : t < PLAY0 ? 'lab' : 'snowy');
const ST = { mila: 560, leo: 860, hoot: 1360, drippy: 1100 };
const KS = 0.6;
const face = (x: number) => kidFaceAt(x, f, KS);
const CLOUD: [number, number] = [960, 230];
const FREEZE = word('freeze', 1);
const ARMS = [1, 2, 3, 4, 5, 6].map((i) => word('count_arms', 3 + i));
const FALL = word('fall', 3);
const LAND = S('land');
const LAB = { mila: 450, hoot: 1430 };
const FOLD1 = word('c1', 6);
const FOLD2 = word('c1', 10);
const CUT = word('c2', 6);
const OPEN = word('c3', 4);
const SNOWMAN = [word('snowman', 1), word('snowman', 5), word('snowman', 11), word('snowman', 14)];

const SHOTS: Shot[] = [
  { t: 0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.01 },
  { t: S('why') - 0.2, z: 1.6, x: ST.mila, y: face(ST.mila)[1] + 60, move: 'smooth', dur: 1.0, push: 0.02 },
  { t: S('guess') - 0.2, z: 1.3, x: ST.leo + 40, y: 420, move: 'whip' },
  { t: S('good') - 0.2, z: 1.55, x: ST.hoot, y: f - 260, move: 'whip', push: 0.01 },
  { t: S('how') - 0.2, z: 1.6, x: ST.leo, y: face(ST.leo)[1] + 60, move: 'whip' },
  { t: S('meet') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.7 },
  { t: S('drippy_hi') - 0.1, z: 1.7, x: ST.drippy, y: f - 140, move: 'snap', push: 0.02 },
  { t: MODEL0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.01 },
  { t: S('dust') - 0.2, z: 1.6, x: CLOUD[0], y: CLOUD[1] + 120, move: 'smooth', dur: 1.0, push: 0.02 },
  { t: S('word_turn') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('grow') - 0.2, z: 1.6, x: CLOUD[0], y: CLOUD[1] + 140, move: 'smooth', dur: 0.8, push: 0.01 },
  { t: S('six_turn') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('heavy') - 0.2, z: 1.4, x: CLOUD[0], y: CLOUD[1] + 160, move: 'smooth', dur: 0.6 },
  { t: FALL, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 1.2 },
  { t: S('land') - 0.1, z: 1.7, x: 960, y: 640, move: 'snap', push: 0.01 },
  { t: S('many') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 },
  { t: S('wow_b') - 0.2, z: 1.0, x: 960, y: 540, move: 'cut' },
  { t: LAB0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.01 },
  { t: S('c1') - 0.2, z: 1.4, x: 960, y: 470, move: 'smooth', dur: 0.8, push: 0.02 },
  { t: S('c4') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: PLAY0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.01 },
  { t: S('melt_q') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('ra1') - 0.1, z: 1.55, x: ST.leo, y: face(ST.leo)[1] + 60, move: 'snap' },
  { t: E('ra1') + 0.6, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('ra3') - 0.1, z: 1.6, x: ST.drippy, y: f - 160, move: 'snap' },
  { t: E('ra3') + 0.6, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('ch1') - 0.1, z: 1.2, x: 940, y: 560, move: 'smooth', dur: 0.6, push: 0.02 },
  { t: S('ch_turn') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
];
const PUNCHES = [S('drippy_hi'), FREEZE, ...ARMS, OPEN];

export default function KidsScience054() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const scene = sceneAt(t);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const yay = within(t, S('c4'), E('c4') + 0.6) || within(t, S('ch1'), E('ch4') + 0.5) || t >= S('bye_d') || within(t, S('wow_b'), E('wow_b') + 0.4);
  const hopOf = (k: number) => (yay ? Math.abs(Math.sin(t * 7 + k)) * 24 : 0);
  const milaExpr: KExpr = within(t, S('why'), E('why')) ? 'wow' : yay ? 'laugh' : talks('mila') ? 'happy' : 'smile';
  const leoExpr: KExpr = within(t, S('guess'), E('guess')) ? 'laugh' : within(t, S('how'), E('how')) ? 'think' : yay ? 'laugh' : talks('leo') ? 'happy' : 'smile';
  const hootExpr: KExpr = within(t, S('wow'), E('wow')) ? 'wow' : talks('hoot') ? 'happy' : yay ? 'laugh' : 'smile';
  const drMouth = lipSync(VO, 'drippy', t);
  const drExpr: KExpr = within(t, FREEZE, E('freeze')) ? 'surprised' : within(t, FALL, LAND) ? 'laugh' : yay ? 'laugh' : talks('drippy') ? 'happy' : 'smile';
  const mArm = (): KArm => (within(t, S('why'), E('why')) ? 'point' : yay ? 'up' : talks('mila') ? 'present' : 'down');
  const lArm = (): KArm => (within(t, S('guess'), E('guess')) ? 'up' : within(t, S('how'), E('how')) ? 'shrug' : yay ? 'up' : talks('leo') ? 'present' : 'down');

  // ── Drippy's path in the model: puddle → up → cloud → (freeze) → grows → falls (zig-zag) → lands
  const up = EASE_INOUT(prog(t, word('up', 3), word('up', 3) + 2.4));
  let dx = 960;
  let dy = f - 40 + (CLOUD[1] + 100 - (f - 40)) * up;
  const fallP = prog(t, FALL, FALL + 4.2);
  if (t >= FALL) { dy = CLOUD[1] + 100 + (f - 120 - CLOUD[1] - 100) * EASE_INOUT(fallP); dx = 960 + Math.sin(fallP * Math.PI * 3) * 140; }
  const isFlake = t >= FREEZE;
  const arms = t < S('grow') ? 0 : ARMS.filter((a) => t >= a).length + (t >= ARMS[0] ? prog(t, ARMS.filter((a) => t >= a).slice(-1)[0] ?? 0, (ARMS.filter((a) => t >= a).slice(-1)[0] ?? 0) + 0.3) - 1 : 0);
  const flakeS = within(t, FREEZE, S('grow')) ? 0.5 : t < S('heavy') ? 0.55 : 0.6;
  const raining = within(t, S('many'), LAB0);
  const cold = scene === 'model' ? prog(t, S('cold'), S('cold') + 1) : 0;

  // craft
  const fold = t < FOLD1 ? 0 : t < FOLD2 ? 1 : 2;
  const opened = t >= OPEN;

  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
        {/* ── SNOWY MEADOW ── */}
        {scene === 'snowy' && (
          <g>
            <Backdrop place="meadow" w={W} h={H} t={t} fx={t >= S('melt_a') && t < S('rem') ? ['birds'] : ['snow']} />
            <rect width={W} height={H} fill="#e6f6ff" opacity={t >= word('melt_a', 3) && t < S('rem') ? 0.1 : 0.32} />
            <g opacity={t >= word('melt_a', 3) && t < S('rem') ? 1 - prog(t, word('melt_a', 3), word('melt_a', 3) + 2) : 1}><SnowGround /></g>
            {t >= word('melt_a', 3) && t < S('rem') && <Sun x={1700} y={160} r={80} t={t} />}
            {/* the snowman (built during "snowman", melts in the sun) */}
            {t >= SNOWMAN[0] - 0.2 && (
              <g transform={`translate(1600,${f}) scale(${1 - 0.5 * prog(t, word('melt_a', 3), word('melt_a', 3) + 3) * (t < S('rem') ? 1 : 0)},${1 - 0.6 * prog(t, word('melt_a', 3), word('melt_a', 3) + 3) * (t < S('rem') ? 1 : 0)})`}>
                <g transform={`scale(${popIn(t, SNOWMAN[0])})`}><Vol><circle cx={0} cy={-90} r={95} fill="#ffffff" {...kst(7)} /></Vol></g>
                {t >= SNOWMAN[1] && <g transform={`translate(0,-230) scale(${popIn(t, SNOWMAN[1])})`}><Vol><circle r={70} fill="#ffffff" {...kst(7)} /></Vol>{[-20, 10, 40].map((y) => <circle key={y} cx={0} cy={y - 10} r={8} fill={KINK} />)}</g>}
                {t >= SNOWMAN[2] && (
                  <g transform={`translate(0,-340) scale(${popIn(t, SNOWMAN[2])})`}>
                    <Vol><circle r={52} fill="#ffffff" {...kst(7)} /></Vol>
                    <circle cx={-18} cy={-10} r={7} fill={KINK} /><circle cx={18} cy={-10} r={7} fill={KINK} />
                    {t >= SNOWMAN[3] && <path d="M 0,2 L 50,12 L 0,16 Z" fill="#ff924c" {...kst(3)} />}
                    {t >= SNOWMAN[3] && <path d="M -20,24 Q 0,40 20,24" fill="none" {...kst(5)} />}
                  </g>
                )}
              </g>
            )}
            <Kid spec={MILA_HERO} x={ST.mila} y={f} scale={KS} expr={milaExpr} look={within(t, S('why'), E('why')) ? [0.2, -0.9] : [0.5, -0.2]} mouth={lipSync(VO, 'mila', t)} armR={mArm()} armL={yay ? 'up' : 'down'} hop={hopOf(0)} />
            <Kid spec={LEO_HERO} x={ST.leo} y={f} scale={KS} expr={leoExpr} look={[-0.2, -0.3]} mouth={lipSync(VO, 'leo', t)} armL={lArm()} armR={within(t, S('play'), E('snowman')) ? 'point' : yay ? 'up' : 'down'} hop={hopOf(1)} />
            <Critter spec={HOOT_HERO} x={ST.hoot} y={f} scale={0.55} expr={hootExpr} look={[-0.5, -0.3]} mouth={lipSync(VO, 'hoot', t)} armL={talks('hoot') ? 'point' : 'down'} armR={yay ? 'up' : 'down'} facing={-1} />
            {(t >= word('meet', 9) && t < MODEL0) || t >= S('rem') ? (
              <g transform={`translate(${ST.drippy},${f - 120 - (yay ? Math.abs(Math.sin(t * 7 + 2)) * 30 : 0)}) scale(${t < MODEL0 ? popIn(t, word('meet', 9)) : 1})`}>
                {t < MODEL0 ? (
                  <g transform="translate(0,120) scale(0.55)">
                    <path d="M 0,-270 C 40,-200 110,-140 110,-90 A 110,110 0 0 1 -110,-90 C -110,-140 -40,-200 0,-270 Z" fill="#4cc9f0" {...kst(8)} />
                    <g transform="translate(0,-92) scale(0.62)"><Face expr={talks('drippy') ? 'happy' : 'laugh'} look={[0, 0.1]} mouth={drMouth} blink={(t * 30) % 96 < 4} skin="#4cc9f0" iris="#1b4f8a" eyeR={42} eyeDX={62} eyeY={-10} mouthY={70} mouthW={44} brows={false} nose={<g />} /></g>
                  </g>
                ) : <Flake arms={6} s={0.55} face={drExpr} mouth={drMouth} t={t} rot={Math.sin(t) * 10} />}
              </g>
            ) : null}
            {within(t, word('guess', 4), word('good', 9)) && (
              <g transform={`translate(${ST.leo + 120},${f - 760}) scale(${popIn(t, word('guess', 4))})`}>
                <Bubble x={0} y={0} w={420} h={320} tx={-60} ty={260}><g transform="translate(0,-20) scale(0.9)"><SugarBag /></g></Bubble>
              </g>
            )}
            <Reaction kind="?" t={t} at={S('how')} until={E('how') + 0.4} x={ST.leo} y={f - 640} s={0.7} />
            <Reaction kind="idea" t={t} at={S('wow_b')} until={E('wow_b') + 0.3} x={ST.leo} y={f - 640} s={0.7} />
          </g>
        )}

        {/* ── MODEL ── */}
        {scene === 'model' && (
          <g>
            <defs>
              <linearGradient id="d54sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8fb6d9" /><stop offset="1" stopColor="#e8f4ff" /></linearGradient>
            </defs>
            <rect width={W} height={H} fill="url(#d54sky)" />
            <rect width={W} height={420} fill="#ffffff" opacity={0.35 * cold} />
            {cold > 0 && <text x={60} y={400} fontFamily={FONT_TOON} fontWeight={700} fontSize={54} fill="#1982c4" opacity={cold}>COLD! ❄</text>}
            <SnowGround />
            {/* the grey winter cloud */}
            <g transform={`translate(${CLOUD[0]},${CLOUD[1] + Math.sin(t * 1.4) * 6})`}>
              <Vol><path d="M -380,90 Q -460,90 -450,10 Q -440,-80 -330,-80 Q -300,-200 -150,-190 Q -80,-270 40,-240 Q 160,-280 230,-180 Q 380,-190 400,-70 Q 470,-40 450,40 Q 430,90 360,90 Z" fill="#c9d6e3" {...kst(9)} /></Vol>
            </g>
            {/* the dust speck */}
            {within(t, word('dust', 6), FREEZE + 0.5) && <g transform={`translate(${dx + 30},${dy - 40})`}><circle r={10} fill="#8d6e63" {...kst(3)} /><circle r={26} fill="none" stroke="#ffca3a" strokeWidth={4} strokeDasharray="6 6" /></g>}
            {/* water cycle hint: up arrows */}
            {within(t, word('up', 3), word('up', 3) + 2.6) && [0, 1, 2].map((i) => <path key={i} d={`M ${820 + i * 140},${f - 120} l 0,-160 m -26,30 l 26,-30 l 26,30`} fill="none" stroke="#ffffff" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />)}
            {/* Drippy → ice crystal → snowflake */}
            {t < LAB0 && t < S('many') + 0.3 && (
              <g transform={`translate(${dx},${dy})`}>
                {!isFlake ? (
                  <g transform="translate(0,90) scale(0.42)">
                    <path d="M 0,-270 C 40,-200 110,-140 110,-90 A 110,110 0 0 1 -110,-90 C -110,-140 -40,-200 0,-270 Z" fill="#4cc9f0" {...kst(8)} />
                    <g transform="translate(0,-92) scale(0.62)"><Face expr={within(t, S('cold'), E('cold')) ? 'surprised' : 'happy'} look={[0, 0.1]} mouth={drMouth} blink={(t * 30) % 96 < 4} skin="#4cc9f0" iris="#1b4f8a" eyeR={42} eyeDX={62} eyeY={-10} mouthY={70} mouthW={44} brows={false} nose={<g />} /></g>
                  </g>
                ) : (
                  <g transform={`scale(${popIn(t, FREEZE, 0.4)})`}>
                    <Flake arms={arms} s={flakeS} face={drExpr} mouth={drMouth} t={t} rot={t >= FALL ? Math.sin(t * 1.5) * 25 : 0} />
                    {/* arm badges while counting */}
                    {within(t, ARMS[0], S('six_turn') + 2) && ARMS.map((a, i) => t >= a && (
                      <g key={i} transform={`rotate(${i * 60}) translate(0,${-170 * flakeS - 30}) rotate(${-i * 60}) scale(${popIn(t, a) * 0.5})`}>
                        <circle r={34} fill={['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'][i]} {...kst(5)} />
                        <text y={14} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill="#ffffff">{i + 1}</text>
                      </g>
                    ))}
                  </g>
                )}
              </g>
            )}
            {/* cold air vs warm air */}
            {within(t, S('cold_air'), S('land') - 0.2) && (
              <g>
                <g transform={`translate(420,560) scale(${popIn(t, S('cold_air'))})`}>
                  <Thermo warm={false} label="SNOW ❄" />
                  <g transform="translate(0,-60)"><Flake arms={6} s={0.25} /></g>
                </g>
                {t >= S('warm') && (
                  <g transform={`translate(1500,560) scale(${popIn(t, S('warm'))})`}>
                    <Thermo warm label="RAIN 💧" />
                    <g transform="translate(0,-160)"><Flake arms={6} s={0.2} /></g>
                    <g transform="translate(0,80) scale(0.9)"><path d="M 0,-30 C 12,-10 20,4 20,14 A 20,20 0 0 1 -20,14 C -20,4 -12,-10 0,-30 Z" fill="#4cc9f0" {...kst(5)} /></g>
                  </g>
                )}
              </g>
            )}
            {/* the mitten */}
            {within(t, S('land'), S('many')) && (
              <g transform={`translate(960,${f - 40}) scale(${popIn(t, S('land'))})`}>
                <Vol><path d="M -140,120 L -140,-60 Q -140,-160 -40,-160 Q 60,-160 60,-60 L 60,-20 Q 120,-60 150,-10 Q 170,30 110,60 L 60,90 L 60,120 Z" fill="#ff595e" {...kst(8)} /></Vol>
                <rect x={-150} y={110} width={220} height={50} rx={16} fill="#ffffff" {...kst(6)} />
                <g transform="translate(-40,-60)"><Flake arms={6} s={0.4} face={drExpr} mouth={drMouth} t={t} /></g>
              </g>
            )}
            {/* millions of snowflakes */}
            {raining && Array.from({ length: 40 }).map((_, i) => {
              const p = ((t - S('many')) * (0.12 + (i % 5) * 0.02) + i * 0.071) % 1;
              return <g key={i} transform={`translate(${(i * 197) % W + Math.sin(t + i) * 30},${-60 + p * (H + 80)})`}><Flake arms={6} s={0.1 + (i % 3) * 0.03} rot={t * 30 + i * 20} /></g>;
            })}
            {raining && t >= S('wow') && (
              <g>
                {[0, 1, 2].map((i) => (
                  <g key={i} transform={`translate(${560 + i * 400},500) scale(${popIn(t, word('wow', 4) + i * 0.3)})`}>
                    <circle r={150} fill="#ffffff" opacity={0.85} {...kst(6)} />
                    <Flake arms={6} s={0.7} c={['#bfefff', '#d4c4ff', '#c7f2d4'][i]} rot={i * 20} />
                  </g>
                ))}
              </g>
            )}
            <Critter spec={HOOT_HERO} x={1790} y={f} scale={0.36} expr={hootExpr} look={[-0.7, -0.2]} mouth={lipSync(VO, 'hoot', t)} armL={talks('hoot') ? 'point' : 'down'} armR="down" facing={-1} />
            <ImpactStar t={t} at={FREEZE} x={dx} y={dy} s={0.8} color="#bfefff" />
            <MotionLines t={t} from={FALL} to={FALL + 4.2} x={dx} y={dy - 120} dir={-90} n={3} len={60} spread={30} />
            <StageWord t={t} at={word('cold', 9)} until={E('cold') + 0.4} text="BRRR!" x={1300} y={420} size={90} color="#1982c4" rot={-6} />
            <StageWord t={t} at={FREEZE} until={FREEZE + 1.6} text="FREEZE!" x={CLOUD[0] + 300} y={CLOUD[1] + 220} size={80} color="#4cc9f0" rot={6} />
            <StageWord t={t} at={word('fall', 8)} until={word('fall', 8) + 1.5} text="WHEEE!" x={1300} y={520} size={90} color="#ffca3a" rot={-6} />
          </g>
        )}

        {/* ── LAB: the paper snowflake ── */}
        {scene === 'lab' && (
          <g>
            <Backdrop place="science-lab" w={W} h={H} t={t} fx={false} />
            <Vol kind="slope"><rect x={660} y={640} width={600} height={46} rx={18} fill="#ffd6a5" {...kst(7)} /></Vol>
            {[700, 1220].map((x) => <Vol key={x} kind="tube"><rect x={x - 14} y={680} width={28} height={f - 680} rx={12} fill="#e8b17a" {...kst(6)} /></Vol>)}
            <g transform="translate(960,470)">
              {!opened ? (
                <g transform={`scale(${popIn(t, S('craft') + 0.3)})`}>
                  {fold === 0 && <rect x={-140} y={-140} width={280} height={280} fill="#4cc9f0" {...kst(7)} />}
                  {fold === 1 && <path d="M -150,100 L 150,100 L 0,-160 Z" fill="#4cc9f0" {...kst(7)} />}
                  {fold === 2 && (
                    <g>
                      <path d="M -90,110 L 90,110 L 0,-150 Z" fill="#4cc9f0" {...kst(7)} />
                      {t >= CUT && [[-50, 40], [40, 0], [-20, -60], [10, 80]].map(([x, y], i) => t >= CUT + i * 0.4 && <path key={i} d={`M ${x - 14},${y} l 14,-18 l 14,18 Z`} fill="#fff3e0" {...kst(3)} />)}
                    </g>
                  )}
                  {within(t, CUT - 0.3, OPEN) && (
                    <g transform={`translate(${130 + Math.sin(t * 6) * 6},${-30}) rotate(${-30 + Math.sin(t * 10) * 8})`}>
                      <circle cx={-40} cy={40} r={22} fill="none" stroke="#ff595e" strokeWidth={10} />
                      <circle cx={-12} cy={54} r={22} fill="none" stroke="#ff595e" strokeWidth={10} />
                      <path d="M -26,30 L 60,-60 M -10,40 L 64,-50" stroke="#adb5bd" strokeWidth={10} strokeLinecap="round" />
                    </g>
                  )}
                </g>
              ) : (
                <g transform={`scale(${popIn(t, OPEN, 0.6) * 1.4}) rotate(${(t - OPEN) * 10})`}>
                  <Flake arms={6} s={1} c="#4cc9f0" />
                  {[0, 60, 120, 180, 240, 300].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 90} cy={Math.sin((a * Math.PI) / 180) * 90} r={12} fill="#fff3e0" {...kst(3)} />)}
                </g>
              )}
            </g>
            <Kid spec={MILA_HERO} x={LAB.mila} y={f} scale={KS} expr={milaExpr} look={[0.6, -0.2]} mouth={lipSync(VO, 'mila', t)} armR={mArm()} armL={yay ? 'up' : 'hip'} hop={hopOf(0)} />
            <Critter spec={HOOT_HERO} x={LAB.hoot} y={f} scale={0.55} expr={hootExpr} look={[-0.6, -0.2]} mouth={lipSync(VO, 'hoot', t)} armL={talks('hoot') ? 'point' : 'down'} armR="down" facing={-1} />
            <StageWord t={t} at={OPEN} until={OPEN + 1.6} text="TA-DA!" x={1260} y={250} size={90} color="#ffca3a" rot={8} />
          </g>
        )}
      </ActionStage>

      {/* screen-space */}
      <PopText t={t} at={S('why') + 0.4} until={S('guess') - 0.2} text="WHERE DOES SNOW COME FROM?" y={150} size={84} color="#ffffff" />
      <PopText t={t} at={word('good', 14)} until={E('how') + 0.3} text="FROZEN WATER!" y={150} size={120} color="#4cc9f0" />
      <PopText t={t} at={S('q1') + 0.1} until={S('q2') - 0.3} text="1  HOW DOES DRIPPY BECOME SNOW?" y={120} size={70} color="#ffffff" />
      <PopText t={t} at={word('word', 8)} until={E('word_turn') + 0.8} text="ICE CRYSTAL" y={260} size={110} color="#4cc9f0" />
      <PopText t={t} at={E('word_turn') - 0.4} until={S('q2') - 0.1} text="YOUR TURN!" y={380} size={90} color="#ffffff" />
      <PopText t={t} at={S('q2') + 0.1} until={S('q3') - 0.3} text="2  HOW DOES A SNOWFLAKE GROW?" y={120} size={70} color="#ffca3a" />
      {ARMS.map((a, i) => <PopText key={i} t={t} at={a - 0.05} until={i < 5 ? ARMS[i + 1] - 0.05 : S('six_turn') - 0.1} text={String(i + 1)} y={260} size={160} color={['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'][i]} />)}
      <PopText t={t} at={S('six_turn')} until={S('heavy') - 0.1} text="SHOW 6 FINGERS! 🖐☝" y={150} size={86} color="#ffffff" />
      <PopText t={t} at={S('q3') + 0.1} until={S('land') - 0.3} text="3  WHY SNOW, NOT RAIN?" y={120} size={76} color="#52b788" />
      <PopText t={t} at={S('wow')} until={S('wow_b') - 0.1} text="WOW FACT!" y={130} size={110} color="#ffca3a" />
      <PopText t={t} at={S('craft')} until={S('c1') - 0.1} text="PAPER SNOWFLAKE!" y={150} size={110} color="#4cc9f0" />
      <PopText t={t} at={word('craft', 6)} until={S('c1') - 0.1} text="with a grown-up" y={270} size={64} color="#ff6fa5" rot={2} />
      <PopText t={t} at={S('c1')} until={S('c2') - 0.1} text="1  FOLD, FOLD" y={150} size={90} color="#4cc9f0" />
      <PopText t={t} at={S('c2')} until={S('c3') - 0.1} text="2  CUT (A GROWN-UP HELPS)" y={150} size={80} color="#ff924c" />
      <PopText t={t} at={S('c3')} until={S('c4') - 0.1} text="3  OPEN IT UP!" y={150} size={90} color="#52b788" />
      <ThinkTimer t={t} from={onBeat(E('melt_q') + 0.1)} to={S('melt_a') - 0.1} x={1760} y={190} r={90} label="THINK!" />
      <PopText t={t} at={word('melt_a', 3)} until={S('rem') - 0.2} text="IT MELTS!" y={150} size={120} color="#ff924c" />
      <PopText t={t} at={S('rem') + 0.1} until={S('rq1') - 0.1} text="LET'S REMEMBER!" y={150} size={110} color="#ffca3a" />
      {(['rq1', 'rq2', 'rq3', 'rq4', 'rq5'] as const).map((q, i) => (
        <ThinkTimer key={q} t={t} from={onBeat(E(q) + 0.1)} to={S((['ra1', 'ra2', 'ra3', 'ra4', 'ra5'] as const)[i]) - 0.1} x={1760} y={190} r={90} label="THINK!" />
      ))}
      <PopText t={t} at={S('ra1')} until={S('rq2') - 0.2} text="FROZEN WATER!" y={150} size={110} color="#4cc9f0" />
      <PopText t={t} at={S('ra2')} until={S('rq3') - 0.2} text="AN ICE CRYSTAL!" y={150} size={110} color="#4cc9f0" />
      <PopText t={t} at={S('ra3')} until={S('rq4') - 0.2} text="SIX!" y={150} size={150} color="#6a4c93" />
      <PopText t={t} at={S('ra4')} until={S('rq5') - 0.2} text="COLD AIR ALL THE WAY DOWN!" y={150} size={80} color="#1982c4" />
      <PopText t={t} at={S('ra5')} until={S('chant') - 0.2} text="IT MELTS!" y={150} size={120} color="#ff924c" />
      <PopText t={t} at={S('ch1')} until={S('ch2') - 0.05} text="COLD CLOUD!" y={150} size={120} color="#ffffff" />
      <PopText t={t} at={S('ch2')} until={S('ch3') - 0.05} text="ICE CRYSTAL!" y={150} size={120} color="#4cc9f0" />
      <PopText t={t} at={S('ch3')} until={S('ch4') - 0.05} text="SIX LITTLE ARMS!" y={150} size={110} color="#b388ff" />
      <PopText t={t} at={S('ch4')} until={S('ch_turn') - 0.1} text="SNOW IS FALLING DOWN!" y={150} size={100} color="#ffffff" />
      <PopText t={t} at={S('ch_turn')} until={S('bye_d') - 0.2} text="YOUR TURN!" y={150} size={120} color="#ffffff" />
      <PopText t={t} at={S('bye')} until={E('bye') + 0.6} text="SEE YOU NEXT TIME!" y={150} size={100} color="#4cc9f0" />
      <Confetti t={t} at={S('drippy_hi')} y={420} />
      <Confetti t={t} at={OPEN} y={420} />
      <Confetti t={t} at={S('ch4')} y={420} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <SparksIntro t={t} at={0} cast={{ kids: [MILA_HERO, LEO_HERO], buddy: BOBO_HERO }} />
      <StarWipe t={t} at={E('bye') + 0.6} dur={0.5} hold={5} color="#1d3b6e" x={W / 2} y={H * 0.45} />
    </>
  );
}
