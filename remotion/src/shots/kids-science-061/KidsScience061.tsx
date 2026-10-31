// TINY SPARKS · Day 61 · 🚀 Science for Kids #9 — "How Do Rainbows Appear?" (LONG 16:9)
// kids-shorts/tiny-sparks/science/day-061-how-do-rainbows-appear. Cues from VO via K (keys.gen.ts).
// ENERGY LAYER standard: ident → WHY? (a rainbow draws itself over the wet meadow) → GUESS (Leo: a giant painter with a
// huge paintbrush! — Hoot: good guess, but it's sunlight + raindrops) → Drippy the raindrop (Days 47, 54) is back →
// 3 QUESTIONS: 1 what is sunlight made of? (white light through a prism fans out — say the 7 colours, 7 fingers;
// colours all around us: apple, orange, banana, leaf, sky, night sky, flower) · 2 how does a raindrop make a rainbow?
// (light goes in, bends and bounces, the colours spread out — millions of drops together → one big rainbow) · 3 where
// do we look? (sun behind you, rain in front — think-timer game) → WOW: a rainbow is really a circle (seen from a plane)
// → double rainbow (colours upside down) → no sun, no rainbow (night) → MAKE IT with a grown-up: a glass of water in a
// sunny window throws a little rainbow on white paper → colour games (after yellow? on top?) → remember (5) → chant → bye.
// Facts: rainbows form by refraction + internal reflection of sunlight in raindrops, with the sun behind the observer
// (Met Office, NOAA); the full rainbow is a circle (visible from aircraft); the secondary bow has reversed colours; red
// is on the outside (top) of the primary bow.
import React from 'react';
import { Kid, kidFaceAt, type KArm } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, HOOT_HERO, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Sun } from '../../lib/kids/sets';
import { Backdrop } from '../../lib/kids/places';
import { AnswerMark, Bubble, Confetti, FONT_TOON, KidsCaptions, PopText, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { Face, KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { ActionStage, Dust, ImpactStar, MotionLines, Reaction, SparksIntro, StageWord, StarWipe, directorCam, onBeat, type Shot } from '../../lib/kids/energy';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsScience061', durationInSeconds: 318.1, fps: 30, width: 1920, height: 1080 };

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
const k = (s: string) => s as Key;
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
const RB = ['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#1982c4', '#4b3f9e', '#9d4edd'];
const RB_NAMES = ['RED', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE', 'INDIGO', 'VIOLET'];
// a rainbow: 7 bands on an arc (top half) or a full circle; `reveal` 0..1 draws it on; `rev` = colours upside down
const Rainbow: React.FC<{ cx: number; cy: number; r: number; band?: number; reveal?: number; rev?: boolean; full?: boolean; op?: number; lit?: number }> = ({
  cx, cy, r, band = 26, reveal = 1, rev, full, op = 1, lit = -1,
}) => (
  <g opacity={op}>
    {RB.map((c, i) => {
      const k = rev ? 6 - i : i;
      const rr = r - k * band;
      const sw = band + 1 + (lit === i ? 10 : 0);
      return full
        ? <circle key={i} cx={cx} cy={cy} r={rr} fill="none" stroke={c} strokeWidth={sw} pathLength={1} strokeDasharray={`${reveal} 1`} transform={`rotate(180 ${cx} ${cy})`} />
        : <path key={i} d={`M ${cx - rr},${cy} A ${rr},${rr} 0 0 1 ${cx + rr},${cy}`} fill="none" stroke={c} strokeWidth={sw} pathLength={1} strokeDasharray={`${reveal} 1`} />;
    })}
  </g>
);
const Prism: React.FC = () => (
  <g>
    <Vol><path d="M 0,-170 L 150,100 L -150,100 Z" fill="#dff4ff" opacity={0.85} {...kst(8)} /></Vol>
    <path d="M -40,-60 L -90,40" stroke="#ffffff" strokeWidth={12} strokeLinecap="round" opacity={0.8} />
  </g>
);
// the colour things (cards) for "rainbow colours all around us"
const Thing: React.FC<{ i: number }> = ({ i }) => {
  switch (i) {
    case 0: return <g><Vol><circle cx={0} cy={10} r={56} fill={RB[0]} {...kst(6)} /></Vol><path d="M 0,-44 L 4,-66" stroke="#8d5a3b" strokeWidth={8} strokeLinecap="round" /><path d="M 6,-60 Q 34,-80 44,-56 Q 20,-46 6,-60 Z" fill="#52b788" {...kst(4)} /></g>;
    case 1: return <g><Vol><circle cx={0} cy={6} r={58} fill={RB[1]} {...kst(6)} /></Vol>{[[-20, -10], [16, 20], [24, -20], [-14, 30]].map(([x, y], j) => <circle key={j} cx={x} cy={y} r={4} fill="#e8590c" />)}<path d="M -6,-52 Q 10,-74 30,-60 Q 12,-46 -6,-52 Z" fill="#52b788" {...kst(4)} /></g>;
    case 2: return <g transform="rotate(-20)"><Vol><path d="M -70,-20 Q 0,90 70,-30 Q 50,-10 0,10 Q -40,10 -70,-20 Z" fill={RB[2]} {...kst(6)} /></Vol><path d="M 70,-30 l 10,-14" stroke="#8d5a3b" strokeWidth={8} strokeLinecap="round" /></g>;
    case 3: return <g transform="rotate(-30)"><Vol><path d="M 0,-70 Q 60,-20 0,70 Q -60,-20 0,-70 Z" fill={RB[3]} {...kst(6)} /></Vol><path d="M 0,-50 L 0,80" stroke="#3a8d3a" strokeWidth={6} /></g>;
    case 4: return <g><rect x={-70} y={-60} width={140} height={120} rx={18} fill={RB[4]} {...kst(6)} /><Vol><path d="M -40,20 Q -50,-6 -20,-8 Q -10,-30 14,-20 Q 40,-28 42,0 Q 56,20 30,22 Z" fill="#ffffff" {...kst(4)} /></Vol></g>;
    case 5: return <g><rect x={-70} y={-60} width={140} height={120} rx={18} fill={RB[5]} {...kst(6)} /><path d="M 10,-36 A 28,28 0 1 0 30,10 A 22,22 0 1 1 10,-36 Z" fill="#fff3b0" />{[[-40, -30], [-30, 30], [40, 34]].map(([x, y], j) => <circle key={j} cx={x} cy={y} r={5} fill="#ffffff" />)}</g>;
    default: return <g><path d="M 0,20 L 0,80" stroke="#3a8d3a" strokeWidth={8} /><Vol>{[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 30} cy={Math.sin((a * Math.PI) / 180) * 30} r={26} fill={RB[6]} {...kst(4)} />)}<circle r={16} fill="#ffd166" {...kst(4)} /></Vol></g>;
  }
};
const Plane: React.FC = () => (
  <g>
    <Vol><path d="M -90,0 Q -90,-22 -60,-22 L 80,-14 Q 104,-10 104,0 Q 104,10 80,14 L -60,22 Q -90,22 -90,0 Z" fill="#ffffff" {...kst(5)} /></Vol>
    <path d="M -10,-14 L -40,-70 L -10,-70 L 30,-14 Z M -10,14 L -40,64 L -10,64 L 30,14 Z M -80,-14 L -100,-50 L -80,-50 L -62,-16 Z" fill="#4cc9f0" {...kst(4)} />
    {[0, 26, 52].map((x) => <circle key={x} cx={x} cy={-2} r={6} fill="#4cc9f0" {...kst(2)} />)}
  </g>
);
const Glass: React.FC<{ fill: number }> = ({ fill }) => (
  <g>
    <rect x={-60} y={-80 + 150 * (1 - fill)} width={120} height={150 * fill} fill="#a0e1ff" opacity={0.8} />
    <path d="M -64,-90 L -56,74 Q 0,84 56,74 L 64,-90" fill="none" {...kst(6)} />
    <path d="M -40,-70 L -36,50" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.7} />
  </g>
);

// ── scenes
const MODEL0 = S('q1') - 0.3;
const SKY0 = S('wow') - 0.3;
const LAB0 = S('craft') - 0.3;
const OUT0 = S('rem') - 0.3;
type Scene = 'meadow' | 'model' | 'sky' | 'lab';
const sceneAt = (t: number): Scene => (t < MODEL0 ? 'meadow' : t < SKY0 ? 'model' : t < LAB0 ? 'sky' : t < OUT0 ? 'lab' : 'meadow');
const ST = { mila: 560, leo: 860, hoot: 1360, drippy: 1100 };
const KS = 0.6;
const face = (x: number) => kidFaceAt(x, f, KS);
const COL_AT = RB.map((_, i) => S(k(`c${i}`)));
const OBJ_AT = RB.map((_, i) => S(k(`o${i}`)));
const PRISM: [number, number] = [860, 540];
const BEND0 = S('in');
const DROP: [number, number] = [1000, 640];
const LAB = { mila: 380, hoot: 1560 };
const FILL = word('e1', 4);
const WINDOW = word('e2', 4);
const PAPER = word('e3', 4);
const TADA = S('e4');

const SHOTS: Shot[] = [
  { t: 0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.01 },
  { t: S('why') - 0.2, z: 1.0, x: 960, y: 500, move: 'smooth', dur: 1.2, push: 0.01 },
  { t: S('guess') - 0.2, z: 1.3, x: ST.leo + 40, y: 420, move: 'whip' },
  { t: S('good') - 0.2, z: 1.55, x: ST.hoot, y: f - 260, move: 'whip', push: 0.01 },
  { t: S('how') - 0.2, z: 1.6, x: ST.leo, y: face(ST.leo)[1] + 60, move: 'whip' },
  { t: S('meet') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.7 },
  { t: S('drippy_hi') - 0.1, z: 1.7, x: ST.drippy, y: f - 140, move: 'snap', push: 0.02 },
  { t: MODEL0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.004 },
  { t: S('seven') - 0.1, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.004 },
  { t: S('around') - 0.2, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.004 },
  { t: S('q2') - 0.2, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.004 },
  { t: S('in') - 0.2, z: 1.35, x: DROP[0] - 80, y: DROP[1] - 140, move: 'smooth', dur: 0.8, push: 0.01 },
  { t: S('millions') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 1.0, push: 0.004 },
  { t: S('q3') - 0.2, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.004 },
  { t: SKY0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.004 },
  { t: S('wow_b') - 0.1, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.004 },
  { t: S('night_q') - 0.2, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.004 },
  { t: LAB0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.006 },
  { t: S('e1') - 0.2, z: 1.35, x: 960, y: 520, move: 'smooth', dur: 0.8, push: 0.01 },
  { t: S('game') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: OUT0, z: 1.0, x: 960, y: 540, move: 'cut', push: 0.004 },
  { t: S('ra1') - 0.1, z: 1.55, x: ST.leo, y: face(ST.leo)[1] + 60, move: 'snap' },
  { t: E('ra1') + 0.6, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('ra3') - 0.1, z: 1.6, x: ST.drippy, y: f - 160, move: 'snap' },
  { t: E('ra3') + 0.6, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
  { t: S('ch1') - 0.1, z: 1.2, x: 940, y: 560, move: 'smooth', dur: 0.6, push: 0.02 },
  { t: S('ch_turn') - 0.2, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.6 },
];
SHOTS.sort((a, b) => a.t - b.t);
const PUNCHES = [S('drippy_hi'), ...COL_AT, TADA];

export default function KidsScience061() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const scene = sceneAt(t);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const yay = within(t, S('e4'), E('e4') + 0.6) || within(t, S('ch1'), E('ch4') + 0.5) || t >= S('bye_d') || within(t, S('wow_b'), E('wow_b') + 0.4) || within(t, S('seven'), E('seven') + 0.4);
  const hopOf = (n: number) => (yay ? Math.abs(Math.sin(t * 7 + n)) * 24 : 0);
  const milaExpr: KExpr = within(t, S('why'), E('why')) ? 'wow' : yay ? 'laugh' : talks('mila') ? 'happy' : 'smile';
  const leoExpr: KExpr = within(t, S('guess'), E('guess')) ? 'laugh' : within(t, S('how'), E('how')) ? 'think' : yay ? 'laugh' : talks('leo') ? 'happy' : 'smile';
  const hootExpr: KExpr = within(t, S('wow'), E('wow')) ? 'wow' : talks('hoot') ? 'happy' : yay ? 'laugh' : 'smile';
  const drMouth = lipSync(VO, 'drippy', t);
  const drExpr: KExpr = within(t, word('bend', 2), E('bend') + 0.4) ? 'laugh' : yay ? 'laugh' : talks('drippy') ? 'happy' : 'smile';
  const mArm = (): KArm => (within(t, S('why'), E('why')) ? 'point' : yay ? 'up' : talks('mila') ? 'present' : 'down');
  const lArm = (): KArm => (within(t, S('guess'), E('guess')) ? 'up' : within(t, S('how'), E('how')) ? 'shrug' : yay ? 'up' : talks('leo') ? 'present' : 'down');
  const colLit = COL_AT.reduce((n, a, i) => (t >= a ? i : n), -1);
  const sevenFingers = within(t, S('seven'), S('around') - 0.2);
  const rbReveal = prog(t, S('why') + 0.2, S('why') + 2.2);

  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
        {/* ── MEADOW (after the rain) ── */}
        {scene === 'meadow' && (
          <g>
            <Backdrop place="meadow" w={W} h={H} t={t} fx={['birds']} />
            <Sun x={260} y={150} r={70} t={t} />
            <Rainbow cx={1180} cy={f - 120} r={620} band={24} reveal={t < OUT0 ? rbReveal : 1} op={0.9} />
            {[[420, f + 70], [1250, f + 90]].map(([x, y], i) => <Vol key={i} kind="slope"><ellipse cx={x} cy={y} rx={150} ry={22} fill="#a0e1ff" {...kst(5)} /></Vol>)}
            <Kid spec={MILA_HERO} x={ST.mila} y={f} scale={KS} expr={milaExpr} look={within(t, S('why'), E('why')) ? [0.6, -0.9] : [0.5, -0.2]} mouth={lipSync(VO, 'mila', t)} armR={mArm()} armL={yay ? 'up' : 'down'} hop={hopOf(0)} />
            <Kid spec={LEO_HERO} x={ST.leo} y={f} scale={KS} expr={leoExpr} look={[-0.2, -0.3]} mouth={lipSync(VO, 'leo', t)} armL={lArm()} armR={yay ? 'up' : 'down'} hop={hopOf(1)} />
            <Critter spec={HOOT_HERO} x={ST.hoot} y={f} scale={0.55} expr={hootExpr} look={[-0.5, -0.3]} mouth={lipSync(VO, 'hoot', t)} armL={talks('hoot') ? 'point' : 'down'} armR={yay ? 'up' : 'down'} facing={-1} />
            {((t >= word('meet', 8) && t < MODEL0) || t >= OUT0) && (
              <g transform={`translate(${ST.drippy},${f - (yay ? Math.abs(Math.sin(t * 7 + 2)) * 30 : 0)}) scale(${t < MODEL0 ? popIn(t, word('meet', 8)) : 1})`}>
                <Drippy x={0} y={0} s={0.55} expr={drExpr} mouth={drMouth} t={t} />
              </g>
            )}
            {within(t, word('guess', 4), word('good', 9)) && (
              <g transform={`translate(${ST.leo + 140},${f - 760}) scale(${popIn(t, word('guess', 4))})`}>
                <Bubble x={0} y={0} w={440} h={320} tx={-60} ty={260}>
                  <g transform="translate(-20,40)">
                    <Rainbow cx={0} cy={60} r={160} band={18} reveal={prog(t, word('guess', 10), word('guess', 10) + 1.5)} />
                    <g transform={`translate(${-150 + 300 * prog(t, word('guess', 10), word('guess', 10) + 1.5)},${-60}) rotate(30)`}>
                      <rect x={-8} y={-10} width={16} height={110} rx={8} fill="#a0673c" {...kst(4)} />
                      <path d="M -14,-10 L 14,-10 L 10,-46 Q 0,-60 -10,-46 Z" fill={RB[0]} {...kst(4)} />
                    </g>
                  </g>
                </Bubble>
              </g>
            )}
            <Reaction kind="?" t={t} at={S('how')} until={E('how') + 0.4} x={ST.leo} y={f - 640} s={0.7} />
          </g>
        )}

        {/* ── MODEL: light, prism, colours, a raindrop, where to look ── */}
        {scene === 'model' && (
          <g>
            <defs>
              <linearGradient id="d61sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7fc8f8" /><stop offset="1" stopColor="#e8f7ff" /></linearGradient>
            </defs>
            <rect width={W} height={H} fill="url(#d61sky)" />
            {/* 1: white light → prism → seven colours */}
            {t < S('around') - 0.2 && (
              <g>
                <Sun x={170} y={170} r={80} t={t} />
                <path d={`M 230,230 L ${PRISM[0] - 70},${PRISM[1] - 10}`} stroke="#ffffff" strokeWidth={34} strokeLinecap="round" opacity={0.95} />
                <path d={`M 230,230 L ${PRISM[0] - 70},${PRISM[1] - 10}`} stroke="#fff3b0" strokeWidth={14} strokeLinecap="round" />
                <g transform={`translate(${PRISM[0]},${PRISM[1]}) scale(${popIn(t, S('prism') - 0.2)})`}><Prism /></g>
                {t >= word('prism', 8) && RB.map((c, i) => {
                  const p = prog(t, word('prism', 8) + i * 0.08, word('prism', 8) + 0.8 + i * 0.08);
                  const y1 = 420 + i * 70;
                  const x1 = PRISM[0] + 70 + (1500 - PRISM[0] - 70) * p;
                  const lit = colLit === i && t < S('seven');
                  return (
                    <g key={i}>
                      <path d={`M ${PRISM[0] + 60},${PRISM[1] + 10 + i * 4} L ${x1},${PRISM[1] + 10 + (y1 - PRISM[1] - 10) * p}`} stroke={c} strokeWidth={lit ? 34 : 22} strokeLinecap="round" />
                      {t >= COL_AT[i] && (
                        <g transform={`translate(1560,${y1}) scale(${popIn(t, COL_AT[i]) * (lit ? 1.15 : 0.9)})`}>
                          <rect x={-16} y={-30} width={240} height={60} rx={30} fill={c} {...kst(5)} />
                          <text x={104} y={14} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={36} fill="#ffffff" stroke={KINK} strokeWidth={3} paintOrder="stroke">{RB_NAMES[i]}</text>
                        </g>
                      )}
                    </g>
                  );
                })}
                <Kid spec={MILA_HERO} x={300} y={f + 40} scale={0.42} expr={milaExpr} look={[0.6, -0.3]} mouth={lipSync(VO, 'mila', t)} armL={sevenFingers ? 'count' : yay ? 'up' : 'down'} armR={sevenFingers ? 'count' : 'down'}
                  fingersL={sevenFingers ? 5 : undefined} fingersR={sevenFingers ? 2 : undefined} hop={hopOf(0)} />
              </g>
            )}
            {/* colours all around us */}
            {within(t, S('around') - 0.2, S('q2') - 0.3) && RB.map((c, i) => t >= OBJ_AT[i] - 0.1 && (
              <g key={i} transform={`translate(${330 + i * 210},${500 + (i % 2) * 30}) scale(${popIn(t, OBJ_AT[i] - 0.1) * (within(t, OBJ_AT[i], (OBJ_AT[i + 1] ?? S('q2')) - 0.2) ? 1.12 : 0.95)})`}>
                <rect x={-95} y={-120} width={190} height={250} rx={28} fill="#ffffff" {...kst(7)} />
                <rect x={-95} y={70} width={190} height={60} rx={0} fill={c} />
                <rect x={-95} y={-120} width={190} height={250} rx={28} fill="none" {...kst(7)} />
                <g transform="translate(0,-20) scale(0.9)"><Thing i={i} /></g>
                <text y={112} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={30} fill="#ffffff" stroke={KINK} strokeWidth={3} paintOrder="stroke">{RB_NAMES[i]}</text>
              </g>
            ))}
            {/* 2: inside a raindrop */}
            {within(t, S('q2') - 0.3, S('q3') - 0.3) && (
              <g>
                <Sun x={170} y={170} r={80} t={t} />
                {t < S('millions') - 0.2 ? (
                  <g>
                    {t >= BEND0 && <path d={`M 240,240 L ${DROP[0] - 60},${DROP[1] - 150}`} stroke="#ffffff" strokeWidth={30} strokeLinecap="round" />}
                    <Drippy x={DROP[0]} y={DROP[1]} s={1.0} expr={drExpr} mouth={drMouth} t={t} />
                    {t >= word('bend', 3) && (
                      <g>
                        <path d={`M ${DROP[0] - 60},${DROP[1] - 150} Q ${DROP[0] + 40},${DROP[1] - 110} ${DROP[0] + 70},${DROP[1] - 70}`} stroke="#ffffff" strokeWidth={14} fill="none" strokeDasharray="10 10" opacity={0.9} />
                        {t >= word('bend', 5) && RB.map((c, i) => {
                          const p = prog(t, word('bend', 9), word('bend', 9) + 0.8);
                          const ex = DROP[0] - 90 - 420 * p;
                          const ey = DROP[1] - 40 + (i - 3) * 30 * p + 60 * p;
                          return <path key={i} d={`M ${DROP[0] + 70},${DROP[1] - 70} Q ${DROP[0] - 20},${DROP[1] - 10} ${ex},${ey}`} stroke={c} strokeWidth={14} fill="none" strokeLinecap="round" opacity={p > 0 ? 1 : 0} />;
                        })}
                      </g>
                    )}
                  </g>
                ) : (
                  <g>
                    <Rainbow cx={1100} cy={f} r={640} band={26} reveal={prog(t, S('millions') + 0.4, S('millions') + 2.6)} />
                    {Array.from({ length: 36 }).map((_, i) => {
                      const p = ((t - S('millions')) * (0.25 + (i % 4) * 0.05) + i * 0.083) % 1;
                      return <g key={i} transform={`translate(${500 + ((i * 173) % 1300)},${-40 + p * (f + 40)})`}><MiniDrop s={0.5} /><circle cx={10} cy={-10} r={4} fill={RB[i % 7]} /></g>;
                    })}
                    <g transform={`translate(${ST.drippy - 500},${f - 30})`}><Drippy x={0} y={0} s={0.5} expr={drExpr} mouth={drMouth} t={t} /></g>
                  </g>
                )}
              </g>
            )}
            {/* 3: sun behind you, rain in front */}
            {t >= S('q3') - 0.3 && (
              <g>
                <Sun x={240} y={260} r={90} t={t} />
                <g transform={`translate(1500,220)`}><Vol><path d="M -260,70 Q -320,70 -320,10 Q -320,-60 -240,-66 Q -228,-160 -120,-160 Q -70,-230 24,-208 Q 108,-240 166,-160 Q 270,-170 282,-70 Q 340,-46 330,24 Q 318,70 260,70 Z" fill="#c9d6e3" {...kst(8)} /></Vol></g>
                {Array.from({ length: 18 }).map((_, i) => {
                  const p = (t * 0.8 + i * 0.13) % 1;
                  return <path key={i} d={`M ${1260 + (i * 37) % 500},${300 + p * (f - 300)} l -6,24`} stroke="#4cc9f0" strokeWidth={6} strokeLinecap="round" />;
                })}
                <Rainbow cx={1450} cy={f} r={420} band={20} reveal={prog(t, word('behind', 10), word('behind', 10) + 1.6)} op={0.9} />
                <Kid spec={LEO_HERO} x={760} y={f} scale={0.55} expr={leoExpr} look={[0.8, -0.6]} mouth={lipSync(VO, 'leo', t)} armL="down" armR={t >= word('behind', 14) ? 'point' : 'down'} hop={within(t, S('sun_a'), E('sun_a') + 0.4) ? Math.abs(Math.sin(t * 7)) * 20 : 0} />
                {t >= word('behind', 2) && <g transform={`translate(480,${f - 520}) scale(${popIn(t, word('behind', 2))})`}><path d="M 140,0 L -60,0 M -30,-30 L -64,0 L -30,30" fill="none" stroke="#ffca3a" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" /><text x={40} y={-30} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={44} fill="#ffffff" stroke={KINK} strokeWidth={4} paintOrder="stroke">BEHIND</text></g>}
                {t >= word('behind', 10) && <g transform={`translate(1040,${f - 520}) scale(${popIn(t, word('behind', 10))})`}><path d="M -140,0 L 60,0 M 30,-30 L 64,0 L 30,30" fill="none" stroke="#4cc9f0" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" /><text x={-40} y={-30} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={44} fill="#ffffff" stroke={KINK} strokeWidth={4} paintOrder="stroke">IN FRONT</text></g>}
                <AnswerMark t={t} at={S('sun_a')} ok x={240} y={130} size={0.7} />
              </g>
            )}
            <Critter spec={HOOT_HERO} x={1800} y={f} scale={0.36} expr={hootExpr} look={[-0.7, -0.2]} mouth={lipSync(VO, 'hoot', t)} armL={talks('hoot') ? 'point' : 'down'} armR="down" facing={-1} />
            {within(t, S('around') - 0.2, S('q3') - 0.3) && <Kid spec={LEO_HERO} x={140} y={f + 40} scale={0.42} expr={leoExpr} look={[0.6, -0.3]} mouth={lipSync(VO, 'leo', t)} armL="down" armR={talks('leo') ? 'present' : 'down'} />}
            {within(t, S('around') - 0.2, S('q2') - 0.3) && <Kid spec={MILA_HERO} x={1600} y={f + 40} scale={0.42} expr={milaExpr} look={[-0.6, -0.3]} mouth={lipSync(VO, 'mila', t)} armL="down" armR={talks('mila') ? 'present' : 'down'} />}
            <StageWord t={t} at={word('bend', 12)} until={E('bend') + 1.2} text="TA-DA!" x={600} y={360} size={90} color="#ffca3a" rot={-6} />
            <StageWord t={t} at={S('drippy_yay')} until={E('drippy_yay') + 1.0} text="TEAMWORK!" x={600} y={380} size={80} color="#4cc9f0" rot={6} />
          </g>
        )}

        {/* ── SKY: the rainbow circle, the double rainbow, no rainbow at night ── */}
        {scene === 'sky' && (
          <g>
            <defs>
              <linearGradient id="d61sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5fb3f0" /><stop offset="1" stopColor="#dff4ff" /></linearGradient>
            </defs>
            <rect width={W} height={H} fill="url(#d61sky2)" />
            {t < S('double') - 0.2 && (
              <g>
                <Rainbow cx={960} cy={560} r={360} band={22} full reveal={prog(t, word('wow', 6), word('wow', 6) + 2.0)} />
                <g transform={`translate(${-200 + ((t - S('wow')) * 160) % 2400},${200 + Math.sin(t) * 10})`}><Plane /></g>
              </g>
            )}
            {within(t, S('double') - 0.2, S('night_q') - 0.3) && (
              <g>
                <Vol kind="slope"><path d={`M -20,${f - 40} Q 600,${f - 100} 1200,${f - 50} Q 1600,${f - 20} ${W + 20},${f - 60} L ${W + 20},${H + 20} L -20,${H + 20} Z`} fill="#8ac926" {...kst(7)} /></Vol>
                <Rainbow cx={960} cy={f - 40} r={560} band={22} />
                <Rainbow cx={960} cy={f - 40} r={760} band={18} rev op={0.6} reveal={prog(t, word('double', 10), word('double', 10) + 1.6)} />
              </g>
            )}
            {t >= S('night_q') - 0.3 && (
              <g>
                <rect width={W} height={H} fill="#1d1a4a" opacity={0.85 * prog(t, S('night_q') - 0.3, S('night_q') + 0.6)} />
                {Array.from({ length: 30 }).map((_, i) => <circle key={i} cx={(i * 263) % W} cy={(i * 131) % 600 + 40} r={3 + (i % 3)} fill="#ffffff" opacity={0.5 + 0.5 * Math.sin(t * 2 + i)} />)}
                <path d="M 1580,120 A 70,70 0 1 0 1640,240 A 56,56 0 1 1 1580,120 Z" fill="#fff3b0" />
                <g opacity={t >= S('night_a') ? 0.35 : 0.15}><Rainbow cx={960} cy={f} r={500} band={22} /></g>
                {t >= word('night_a', 1) && <g transform={`translate(960,${f - 300}) scale(${popIn(t, word('night_a', 1))})`}><path d="M -110,-110 L 110,110 M 110,-110 L -110,110" stroke="#ff595e" strokeWidth={36} strokeLinecap="round" /></g>}
              </g>
            )}
            <Kid spec={MILA_HERO} x={300} y={f} scale={0.5} expr={milaExpr} look={[0.6, -0.6]} mouth={lipSync(VO, 'mila', t)} armR={mArm()} armL={yay ? 'up' : 'down'} hop={hopOf(0)} />
            <Kid spec={LEO_HERO} x={1620} y={f} scale={0.5} expr={leoExpr} look={[-0.6, -0.6]} mouth={lipSync(VO, 'leo', t)} armL={lArm()} armR={yay ? 'up' : 'down'} hop={hopOf(1)} />
            <Critter spec={HOOT_HERO} x={1820} y={f} scale={0.36} expr={hootExpr} look={[-0.7, -0.2]} mouth={lipSync(VO, 'hoot', t)} armL={talks('hoot') ? 'point' : 'down'} armR="down" facing={-1} />
            {within(t, S('wow_b'), E('wow_b') + 0.8) && (
              <g transform={`translate(960,560) scale(${popIn(t, word('wow_b', 7))})`}>
                <Vol><circle r={150} fill="#f4a261" {...kst(8)} /></Vol>
                <circle r={150} fill="none" stroke="#ff6fa5" strokeWidth={60} opacity={0.9} />
                {RB.map((c, i) => <rect key={i} x={Math.cos(i) * 110 - 6} y={Math.sin(i * 1.7) * 110 - 3} width={14} height={6} rx={3} fill={c} transform={`rotate(${i * 50} ${Math.cos(i) * 110} ${Math.sin(i * 1.7) * 110})`} />)}
                <circle r={50} fill="url(#d61sky2)" {...kst(6)} />
              </g>
            )}
          </g>
        )}

        {/* ── LAB: a rainbow in a glass ── */}
        {scene === 'lab' && (
          <g>
            <Backdrop place="science-lab" w={W} h={H} t={t} fx={false} />
            {/* the sunny window + its light */}
            <g transform="translate(560,300)">
              <rect x={-150} y={-180} width={300} height={260} rx={16} fill="#bde0fe" {...kst(8)} />
              <path d="M 0,-180 L 0,80 M -150,-50 L 150,-50" stroke="#ffffff" strokeWidth={14} />
              <Sun x={-60} y={-110} r={40} t={t} />
            </g>
            <Vol kind="slope"><rect x={660} y={600} width={600} height={46} rx={18} fill="#ffd6a5" {...kst(7)} /></Vol>
            {[700, 1220].map((x) => <Vol key={x} kind="tube"><rect x={x - 14} y={640} width={28} height={f - 640} rx={12} fill="#e8b17a" {...kst(6)} /></Vol>)}
            {t >= WINDOW && <path d={`M 640,230 L 900,520 L 980,520 L 700,230 Z`} fill="#fff3b0" opacity={0.45} />}
            {t >= TADA - 0.6 && <path d="M 960,540 L 1010,580 L 1200,580 L 980,520 Z" fill="#fff3b0" opacity={0.5 * prog(t, TADA - 0.6, TADA + 0.2)} />}
            <g transform={`translate(${t >= WINDOW ? 940 : 1100},510) scale(${popIn(t, S('e1') + 0.3)})`}><Glass fill={prog(t, FILL, FILL + 1.4)} /></g>
            {t >= PAPER && (
              <g transform={`translate(1110,${600}) scale(${popIn(t, PAPER)})`}>
                <Vol kind="slope"><path d="M -110,-20 L 110,-20 L 130,20 L -130,20 Z" fill="#ffffff" {...kst(6)} /></Vol>
                {t >= TADA - 0.6 && RB.map((c, i) => <path key={i} d={`M ${-80 + i * 24},12 L ${-64 + i * 24},-12`} stroke={c} strokeWidth={18} strokeLinecap="round" opacity={prog(t, TADA - 0.6, TADA + 0.2)} />)}
              </g>
            )}
            {/* colour games */}
            {within(t, S('game') - 0.2, OUT0) && (() => {
              const first = t < S('game2') - 0.2;
              const at = first ? S('game_a') : S('game2_a');
              return (
                <g key={first ? 'g1' : 'g2'} transform={`translate(960,400) scale(${popIn(t, (first ? S('game') : S('game2')) - 0.1)}) translate(-960,-400)`}>
                  <rect x={560} y={120} width={800} height={460} rx={40} fill="#ffffff" opacity={0.95} {...kst(8)} />
                  {first ? (
                    <g>
                      {[2, 3].map((ci, j) => (
                        <g key={ci} transform={`translate(${780 + j * 360},350)`}>
                          <circle r={110} fill={j === 1 && t < at ? '#e9ecef' : RB[ci]} {...kst(7)} />
                          <text y={j === 1 && t < at ? 40 : 14} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={j === 1 && t < at ? 130 : 44} fill="#ffffff" stroke={KINK} strokeWidth={4} paintOrder="stroke">{j === 1 && t < at ? '?' : RB_NAMES[ci]}</text>
                        </g>
                      ))}
                      <path d="M 900,350 L 1010,350 M 980,320 L 1012,350 L 980,380" fill="none" stroke={KINK} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  ) : (
                    <g>
                      <Rainbow cx={960} cy={540} r={330} band={30} />
                      {t < at && <path d={`M ${960 - 330},540 A 330,330 0 0 1 ${960 + 330},540`} fill="none" stroke="#e9ecef" strokeWidth={32} />}
                      {t < at && <text x={960} y={250} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={80} fill="#ffffff" stroke={KINK} strokeWidth={5} paintOrder="stroke">?</text>}
                    </g>
                  )}
                  <AnswerMark t={t} at={at} ok x={1300} y={170} size={0.6} />
                </g>
              );
            })()}
            <Kid spec={MILA_HERO} x={LAB.mila} y={f} scale={KS} expr={milaExpr} look={[0.6, -0.2]} mouth={lipSync(VO, 'mila', t)} armR={mArm()} armL={yay ? 'up' : 'hip'} hop={hopOf(0)} />
            <Critter spec={HOOT_HERO} x={LAB.hoot} y={f} scale={0.55} expr={hootExpr} look={[-0.6, -0.2]} mouth={lipSync(VO, 'hoot', t)} armL={talks('hoot') ? 'point' : 'down'} armR="down" facing={-1} />
            {t >= S('game') - 0.2 && <Kid spec={LEO_HERO} x={1300} y={f} scale={0.5} expr={leoExpr} look={[-0.4, -0.3]} mouth={lipSync(VO, 'leo', t)} armL={lArm()} armR="down" />}
            <StageWord t={t} at={TADA} until={TADA + 1.8} text="TA-DA!" x={1300} y={300} size={90} color="#ffca3a" rot={8} />
          </g>
        )}
      </ActionStage>

      {/* screen-space */}
      <PopText t={t} at={S('why') + 1.2} until={S('guess') - 0.2} text="HOW DOES A RAINBOW GET THERE?" y={150} size={80} color="#ffffff" />
      <PopText t={t} at={word('good', 12)} until={E('how') + 0.3} text="SUNLIGHT + RAINDROPS!" y={150} size={100} color="#ffca3a" />
      <PopText t={t} at={S('q1') + 0.1} until={S('prism') - 0.1} text="1  WHAT IS SUNLIGHT MADE OF?" y={120} size={74} color="#ffffff" />
      <PopText t={t} at={S('prism')} until={S('c0') - 0.1} text="ALL THE COLORS!" y={120} size={100} color="#ffca3a" />
      {COL_AT.map((a, i) => <PopText key={i} t={t} at={a - 0.05} until={i < 6 ? COL_AT[i + 1] - 0.05 : S('seven') - 0.1} text={RB_NAMES[i]} y={120} size={130} color={RB[i]} />)}
      <PopText t={t} at={S('seven')} until={S('around') - 0.2} text="7 COLORS! 🖐✌" y={120} size={110} color="#ffffff" />
      <PopText t={t} at={S('around')} until={S('o0') - 0.1} text="COLORS ALL AROUND US!" y={120} size={90} color="#ffffff" />
      <PopText t={t} at={S('q2') + 0.1} until={S('millions') - 0.3} text="2  HOW DOES A RAINDROP MAKE A RAINBOW?" y={120} size={62} color="#4cc9f0" />
      <PopText t={t} at={S('q3') + 0.1} until={S('sun_q') - 0.1} text="3  WHERE DO WE LOOK?" y={120} size={80} color="#52b788" />
      <PopText t={t} at={S('sun_q')} until={S('sun_a') - 0.1} text="WHERE IS THE SUN?" y={120} size={100} color="#ffffff" />
      <ThinkTimer t={t} from={onBeat(E('sun_q') + 0.1)} to={S('sun_a') - 0.1} x={1760} y={190} r={90} label="THINK!" />
      <PopText t={t} at={S('sun_a')} until={SKY0} text="SUN BEHIND YOU!" y={120} size={110} color="#ffca3a" />
      <PopText t={t} at={S('wow')} until={S('wow_b') - 0.1} text="WOW FACT: A RAINBOW IS A CIRCLE!" y={120} size={70} color="#ffffff" />
      <PopText t={t} at={S('double')} until={S('night_q') - 0.2} text="DOUBLE RAINBOW!" y={120} size={110} color="#ffca3a" />
      <ThinkTimer t={t} from={onBeat(E('night_q') + 0.1)} to={S('night_a') - 0.1} x={1760} y={190} r={90} label="THINK!" />
      <PopText t={t} at={S('night_a')} until={LAB0} text="NO SUN, NO RAINBOW!" y={120} size={100} color="#fff3b0" />
      <PopText t={t} at={S('craft')} until={S('e1') - 0.1} text="MAKE A RAINBOW!" y={150} size={110} color="#ffca3a" />
      <PopText t={t} at={word('craft', 6)} until={S('e1') - 0.1} text="with a grown-up" y={270} size={64} color="#ff6fa5" rot={2} />
      <PopText t={t} at={S('e1')} until={S('e2') - 0.1} text="1  A GLASS OF WATER" y={150} size={90} color="#4cc9f0" />
      <PopText t={t} at={S('e2')} until={S('e3') - 0.1} text="2  IN A SUNNY WINDOW" y={150} size={90} color="#ffca3a" />
      <PopText t={t} at={S('e3')} until={S('e4') - 0.1} text="3  WHITE PAPER BELOW" y={150} size={90} color="#52b788" />
      <ThinkTimer t={t} from={onBeat(E('game') + 0.1)} to={S('game_a') - 0.1} x={1760} y={190} r={90} label="THINK!" />
      <ThinkTimer t={t} from={onBeat(E('game2') + 0.1)} to={S('game2_a') - 0.1} x={1760} y={190} r={90} label="THINK!" />
      <PopText t={t} at={S('game2_a')} until={OUT0} text="RED IS ON TOP!" y={80} size={90} color={RB[0]} />
      <PopText t={t} at={S('rem') + 0.1} until={S('rq1') - 0.1} text="LET'S REMEMBER!" y={150} size={110} color="#ffca3a" />
      {(['rq1', 'rq2', 'rq3', 'rq4', 'rq5'] as const).map((q, i) => (
        <ThinkTimer key={q} t={t} from={onBeat(E(q) + 0.1)} to={S((['ra1', 'ra2', 'ra3', 'ra4', 'ra5'] as const)[i]) - 0.1} x={1760} y={190} r={90} label="THINK!" />
      ))}
      <PopText t={t} at={S('ra1')} until={S('rq2') - 0.2} text="SUNLIGHT + RAINDROPS!" y={150} size={100} color="#ffca3a" />
      <PopText t={t} at={S('ra2')} until={S('rq3') - 0.2} text="SEVEN!" y={150} size={150} color={RB[5]} />
      <PopText t={t} at={S('ra3')} until={S('rq4') - 0.2} text="BEHIND YOU!" y={150} size={120} color="#ffca3a" />
      <PopText t={t} at={S('ra4')} until={S('rq5') - 0.2} text="RED!" y={150} size={150} color={RB[0]} />
      <PopText t={t} at={S('ra5')} until={S('chant') - 0.2} text="A CIRCLE!" y={150} size={130} color={RB[4]} />
      <PopText t={t} at={S('ch1')} until={S('ch2') - 0.05} text="SUN BEHIND!" y={150} size={120} color="#ffca3a" />
      <PopText t={t} at={S('ch2')} until={S('ch3') - 0.05} text="RAIN IN FRONT!" y={150} size={120} color="#4cc9f0" />
      <PopText t={t} at={S('ch3')} until={S('ch4') - 0.05} text="SEVEN COLORS!" y={150} size={120} color="#b388ff" />
      <PopText t={t} at={S('ch4')} until={S('ch_turn') - 0.1} text="RAINBOW BRIGHT!" y={150} size={120} color="#ff924c" />
      <PopText t={t} at={S('ch_turn')} until={S('bye_d') - 0.2} text="YOUR TURN!" y={150} size={120} color="#ffffff" />
      <PopText t={t} at={S('bye')} until={E('bye') + 0.6} text="SEE YOU NEXT TIME!" y={150} size={100} color="#ffca3a" />
      <Confetti t={t} at={S('drippy_hi')} y={420} />
      <Confetti t={t} at={S('seven')} y={420} />
      <Confetti t={t} at={TADA} y={420} />
      <Confetti t={t} at={S('ch4')} y={420} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <SparksIntro t={t} at={0} cast={{ kids: [MILA_HERO, LEO_HERO], buddy: BOBO_HERO }} />
      <StarWipe t={t} at={E('bye') + 0.6} dur={0.5} hold={5} color="#1d3b6e" x={W / 2} y={H * 0.45} />
    </>
  );
}
