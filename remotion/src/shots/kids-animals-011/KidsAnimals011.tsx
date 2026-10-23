// TINY SPARKS · Day 11 · 🦁 Animal Stories #2 — "Benny the Rabbit and the Lost Carrot" (LONG 16:9)
// kids-shorts/tiny-sparks/animals/day-011-benny-the-rabbit-and-the-lost-carrot. Cues from VO via K.
// GUESS WHO (long ears in a burrow) → MEET Benny → SOUND (rabbits THUMP their feet, your turn) → 3 TRUE
// FACTS (turning ears · grass & hay, carrots = treat · the binky) → STORY: the special carrot goes missing
// (Pip the mouse sneaks it into the tall grass — observant kids see it) → Bobo helps look (bush? rock?) →
// Benny's big ears hear CRUNCH → Pip is sorry → Benny SHARES → picnic for three → "Friends help each
// other" → LET'S REMEMBER (thump turns, fact quiz with timers, binky turn, say-it-together) → bye.
import React from 'react';
import { Critter, critterFaceAt, type CritterSpec } from '../../lib/kids/critter';
import { BOBO, CAPTION_COLORS } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { FONT_TOON, KidsCaptions, KidsStage, PopText, ThinkTimer, TitleCard, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { EASE_INOUT, EASE_OUT, prog } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsAnimals011', durationInSeconds: 253.6, fps: 30, width: 1920, height: 1080 };

const W = 1920;
const H = 1080;
const f = FLOOR(H);
type Key = keyof typeof K;
const S = (k: Key) => VO[K[k]].start;
const E = (k: Key) => VO[K[k]].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;
const COLORS = { ...CAPTION_COLORS, benny: '#ff924c', pip: '#b8a1e3', narrator: '#ffffff' };

const BENNY: CritterSpec = { id: 'benny', species: 'bunny', fur: '#d8c3b0', fur2: '#fff5ee', dark: '#8d6e63' };
const PIP: CritterSpec = { id: 'pip', species: 'mouse', fur: '#c9cdd4', fur2: '#f1f3f5', dark: '#868e96' };

const HOLE_X = 330;
const BENNY_X = 1060;
const BOBO_X = 660;
const BUSH_X = 1400;
const ROCK_X = 470;
const GRASS_X = 1740;
const CARROT_SPOT: [number, number] = [250, f + 10];
const TITLE_END = 1.6;
const REVEAL = S('reveal') + 0.9;
const AWAY0 = E('hide') + 0.2; // Benny hops off for the blanket…
const AWAY1 = AWAY0 + 1.6;
const BACK0 = S('gone') - 1.8; // …and back
const SNEAK0 = AWAY1 + 0.6; // Pip scurries in, takes the carrot into the tall grass
const SNEAK1 = BACK0 - 0.4;
const PICNIC = S('picnic') - 0.2;

const bennyX = (t: number) => {
  if (t < REVEAL) return HOLE_X;
  let x = HOLE_X + (BENNY_X - HOLE_X) * EASE_INOUT(prog(t, REVEAL + 0.3, S('hello') - 0.2));
  x += (2150 - BENNY_X) * EASE_INOUT(prog(t, AWAY0, AWAY1));
  x -= (2150 - BENNY_X) * EASE_INOUT(prog(t, BACK0, S('gone') - 0.1));
  return x;
};
const pipX = (t: number) => {
  // left edge → carrot → tall grass; at the picnic → next to the blanket
  if (t < SNEAK0) return -200;
  if (t < PICNIC) {
    const a = EASE_INOUT(prog(t, SNEAK0, SNEAK0 + 1.4));
    const b = EASE_INOUT(prog(t, SNEAK0 + 1.8, SNEAK1));
    return -200 + (CARROT_SPOT[0] + 40 + 200) * a + (GRASS_X - CARROT_SPOT[0] - 40) * b;
  }
  return GRASS_X + (1420 - GRASS_X) * EASE_INOUT(prog(t, PICNIC, PICNIC + 1.6));
};
const [bfx, bfy] = critterFaceAt(BENNY_X, f, 0.75);

const closeOn = (z = 1.45): Omit<CamKey, 't'> => ({ z, x: bfx, y: bfy + 120 });
const WIDE = { z: 1, x: W / 2, y: H / 2 };
const shot = (a: number, b: number, c: Omit<CamKey, 't'>): CamKey[] => [
  { t: a, ...WIDE },
  { t: a, ...c, cut: true },
  { t: b, ...c },
  { t: b, ...WIDE, cut: true },
];
const CAM: CamKey[] = [
  { t: 0, ...WIDE },
  { t: S('guess') - 0.4, z: 1.4, x: HOLE_X + 120, y: 650, cut: true },
  { t: REVEAL, z: 1.4, x: HOLE_X + 120, y: 650 },
  { t: S('hello') - 0.2, ...WIDE },
  ...shot(S('thump2') - 0.3, E('thump2') + 1.0, closeOn()),
  ...shot(S('gone') + 1.0, E('sad') + 0.8, closeOn(1.35)),
  ...shot(S('ears') - 0.2, E('found') + 0.3, closeOn(1.3)),
  ...shot(S('t_a') - 0.3, E('t_b') + 0.8, closeOn()),
];

const Carrot: React.FC<{ bite?: number; s?: number }> = ({ bite = 0, s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M -10,-40 Q -30,-80 -20,-100 M 0,-40 Q 0,-90 10,-110 M 10,-40 Q 30,-80 40,-90" fill="none" stroke="#52b788" strokeWidth={12} strokeLinecap="round" />
    <path d={`M -34,-40 Q 0,-52 34,-40 L ${4 - bite * 10},${110 - bite * 70} Q 0,${118 - bite * 70} ${-4 + bite * 10},${110 - bite * 70} Z`} fill="#ff8c1a" {...kst(6)} />
    {[-10, 20, 50].map((y) => <path key={y} d={`M -22,${y} L -8,${y + 4}`} fill="none" {...kst(4)} />)}
  </g>
);

const Bush: React.FC<{ x: number }> = ({ x }) => (
  <g transform={`translate(${x},${f + 10})`}>
    {[[-80, -60, 80], [0, -100, 100], [80, -60, 80]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill="#55b84a" {...kst(6)} />)}
    <circle cx={-30} cy={-120} r={10} fill="#ff4d6d" /><circle cx={50} cy={-90} r={10} fill="#ff4d6d" />
  </g>
);

const TallGrass: React.FC<{ x: number; t: number; part: number; wiggle: number }> = ({ x, t, part, wiggle }) => (
  <g transform={`translate(${x},${f + 20})`}>
    {Array.from({ length: 11 }).map((_, i) => {
      const dx = (i - 5) * 26;
      const side = dx < 0 ? -1 : 1;
      const sway = Math.sin(t * 2 + i) * 4 + wiggle * Math.sin(t * 22 + i) * 6 + side * part * 90;
      return <path key={i} d={`M ${dx},0 Q ${dx + sway * 0.5},-120 ${dx + sway},-${220 + (i % 3) * 30}`} fill="none" stroke={i % 2 ? '#6cc551' : '#4f9d2f'} strokeWidth={18} strokeLinecap="round" />;
    })}
  </g>
);

const FactCard: React.FC<{ t: number; at: number; until: number; n: number; text: string; children?: React.ReactNode }> = ({ t, at, until, n, text, children }) => {
  if (t < at || t >= until) return null;
  const s = EASE_OUT(prog(t, at, at + 0.4));
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <g transform={`translate(${W / 2},172) scale(${s * 0.85})`}>
        <rect x={-460} y={-150} width={920} height={300} rx={40} fill="#ffffff" {...kst(9)} />
        <circle cx={-400} cy={-150} r={52} fill="#ff595e" {...kst(7)} />
        <text x={-400} y={-132} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={56} fill="#ffffff">{n}</text>
        <g transform="translate(-290,10) scale(1.5)">{children}</g>
        <text x={130} y={26} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={64} fill={KINK}>{text}</text>
      </g>
    </svg>
  );
};
const EarsIcon = () => (
  <g>
    <ellipse cx={-30} cy={-30} rx={22} ry={70} fill="#d8c3b0" {...kst(5)} transform="rotate(-15)" />
    <ellipse cx={30} cy={-30} rx={22} ry={70} fill="#d8c3b0" {...kst(5)} transform="rotate(25)" />
    {[50, 80].map((r) => <path key={r} d={`M ${70 + r * 0.3},${-r} A ${r},${r} 0 0,1 ${70 + r * 0.3},${r * 0.4}`} fill="none" stroke="#4cc9f0" strokeWidth={8} strokeLinecap="round" />)}
  </g>
);
const GrassIcon = () => (
  <g>
    {[-60, -30, 0].map((x) => <path key={x} d={`M ${x},60 Q ${x - 10},0 ${x + 10},-50`} fill="none" stroke="#52b788" strokeWidth={12} strokeLinecap="round" />)}
    <rect x={10} y={10} width={80} height={50} rx={10} fill="#e9c46a" {...kst(5)} />
    <g transform="translate(60,-40) rotate(30) scale(0.4)"><Carrot /></g>
    <text x={60} y={-95} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={22} fill="#ff8c1a">treat</text>
  </g>
);
const BinkyIcon = () => (
  <g>
    <path d="M -90,60 Q 0,-120 90,60" fill="none" stroke="#adb5bd" strokeWidth={6} strokeDasharray="12 12" />
    <g transform="translate(0,-10) rotate(-20) scale(0.3)"><Critter spec={BENNY} x={0} y={150} expr="laugh" shadow={false} /></g>
  </g>
);

export default function KidsAnimals011() {
  const t = useT();
  const cam = camAt(t, CAM);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const showBenny = t >= REVEAL;
  const bx = bennyX(t);
  const hopping = (t >= REVEAL + 0.3 && t < S('hello') - 0.2) || within(t, AWAY0, AWAY1) || within(t, BACK0, S('gone') - 0.1);
  const thumpLine = (['thump1', 'thump2', 't_a', 't_b'] as const).find((k) => within(t, S(k), E(k) + 0.3));
  const thump = thumpLine ? Math.abs(Math.sin((t - S(thumpLine)) * 12)) : 0;
  const binky = (['binky', 'benny_happy', 'b_jump'] as const).find((k) => within(t, S(k), S(k) + 1.4));
  const binkyP = binky ? prog(t, S(binky), S(binky) + 1.2) : 0;
  const sad = within(t, S('gone') + 0.8, S('bobo_help') + 1.0);
  const listening = within(t, S('ears'), E('found'));
  const carrotHeld = within(t, S('story') + 0.6, S('hide') + 1.4);
  const carrotDown = t >= S('hide') + 1.4 && t < SNEAK0 + 1.4;
  const pipHasCarrot = t >= SNEAK0 + 1.4 && t < S('share') + 1.0;
  const grassPart = EASE_OUT(prog(t, S('mouse') - 0.4, S('mouse') + 0.4)) * (1 - prog(t, PICNIC, PICNIC + 0.6));
  const pipVisible = t >= SNEAK0 && (t < SNEAK1 || t >= S('mouse') - 0.3);
  const picnic = t >= PICNIC && t < S('again');

  const bennyExpr: KExpr =
    !showBenny ? 'smile'
    : thumpLine ? 'laugh'
    : binky ? 'laugh'
    : sad ? 'sad'
    : within(t, S('gone'), S('gone') + 0.8) ? 'surprised'
    : listening ? (t >= S('crunch') ? 'wow' : 'think')
    : within(t, S('mouse'), S('share')) ? 'surprised'
    : 'happy';

  return (
    <>
      <KidsStage cam={cam}>
        <Meadow w={W} h={H} t={t} />
        <Bush x={BUSH_X} />
        {/* the rock */}
        <g transform={`translate(${ROCK_X},${f + 14})`}><path d="M -90,0 Q -100,-80 -20,-100 Q 70,-110 95,-30 Q 100,0 90,0 Z" fill="#adb5bd" {...kst(6)} /></g>
        {/* the burrow */}
        <ellipse cx={HOLE_X} cy={f + 10} rx={130} ry={40} fill="#8d5a3b" {...kst(6)} />
        <ellipse cx={HOLE_X} cy={f + 16} rx={90} ry={24} fill="#3b2a4a" />
        {/* guess who: two long ears wiggling out of the hole */}
        {!showBenny && t >= S('guess') - 0.4 && (
          <g transform={`translate(${HOLE_X},${f + 6})`}>
            {[-1, 1].map((sd) => (
              <g key={sd} transform={`rotate(${sd * 12 + Math.sin(t * 5 + sd) * 8})`}>
                <ellipse cx={sd * 26} cy={-90} rx={26} ry={90} fill={BENNY.fur} {...kst(6)} />
                <ellipse cx={sd * 26} cy={-90} rx={12} ry={66} fill="#ffb3c6" />
              </g>
            ))}
          </g>
        )}
        {/* the carrot by the tree, then in Pip's paws */}
        {carrotDown && <g transform={`translate(${CARROT_SPOT[0]},${CARROT_SPOT[1] - 20}) rotate(80)`}><Carrot s={0.8} /></g>}
        {/* picnic blanket + carrot pieces */}
        {picnic && (
          <g opacity={EASE_OUT(prog(t, PICNIC, PICNIC + 0.6))}>
            <ellipse cx={1080} cy={f + 50} rx={420} ry={60} fill="#ff595e" {...kst(6)} />
            {Array.from({ length: 7 }).map((_, i) => <line key={i} x1={720 + i * 110} y1={f + 2} x2={740 + i * 110} y2={f + 100} stroke="#ffffff" strokeWidth={14} opacity={0.6} />)}
            {[960, 1080, 1200].map((x, i) => <g key={x} transform={`translate(${x},${f + 40}) rotate(${80 + i * 10})`}><Carrot s={0.35} /></g>)}
          </g>
        )}
        <Critter spec={BOBO} x={BOBO_X} y={f} scale={0.68} expr={sad ? 'sad' : talks('bobo') ? 'laugh' : 'happy'} look={within(t, S('look1'), S('look2')) ? [0.9, 0] : within(t, S('look2'), S('ears')) ? [-0.9, 0] : [0.6, -0.2]}
          mouth={lipSync(VO, 'bobo', t)} armL={within(t, S('bobo_help'), E('bobo_help')) ? 'hug' : t >= S('bye') ? 'wave' : talks('bobo') ? 'up' : 'down'}
          armR={within(t, S('look1'), E('look1')) ? 'point' : within(t, S('look2'), E('look2')) ? { a: -150 } : t >= S('bye') ? 'wave' : 'down'} />
        {pipVisible && (
          <Critter spec={PIP} x={pipX(t)} y={f} scale={0.45} expr={within(t, S('mouse'), S('share')) ? 'oops' : talks('pip') ? 'happy' : 'smile'} look={[-0.6, -0.1]}
            mouth={lipSync(VO, 'pip', t)} walking={within(t, SNEAK0, SNEAK1) || within(t, PICNIC, PICNIC + 1.6)} walk={t * 3}
            holdR={pipHasCarrot ? <g transform="rotate(60)"><Carrot s={0.45} bite={t >= S('mouse') ? 0.6 : 0} /></g> : undefined} armR={pipHasCarrot ? 'hold' : 'down'}
            armL={t >= S('bye') ? 'wave' : 'down'} />
        )}
        <TallGrass x={GRASS_X} t={t} part={grassPart} wiggle={within(t, S('crunch'), S('mouse')) ? 1 : 0} />
        {showBenny && (
          <Critter spec={BENNY} x={bx} y={f} scale={0.75} expr={bennyExpr} look={listening ? [0.9, -0.2] : sad ? [0, 0.5] : [-0.4, -0.2]}
            mouth={lipSync(VO, 'benny', t)} walking={hopping} walk={t * 2}
            hop={t >= REVEAL && t < REVEAL + 0.4 ? Math.sin(prog(t, REVEAL, REVEAL + 0.4) * Math.PI) * 90 : hopping ? Math.abs(Math.sin(t * 7)) * 40 : binky ? Math.sin(binkyP * Math.PI) * 180 : thump * 14}
            tilt={binky ? Math.sin(binkyP * Math.PI * 2) * 25 : 0}
            squash={sad ? 0.12 : 0}
            holdR={carrotHeld ? <g transform="rotate(-20)"><Carrot s={0.5} /></g> : undefined}
            armR={carrotHeld ? 'hold' : within(t, S('found'), E('found')) ? 'point' : t >= S('bye') ? 'wave' : within(t, S('hello'), E('hello')) ? 'wave' : 'down'}
            armL={listening ? 'think' : t >= S('bye') ? 'wave' : binky ? 'up' : within(t, S('share'), E('share')) ? 'hug' : 'down'} />
        )}
        {/* thump ripples at Benny's feet */}
        {thumpLine && showBenny && [0, 1].map((i) => {
          const p = ((t - S(thumpLine)) * 2 + i / 2) % 1;
          return <ellipse key={i} cx={bx} cy={f + 6} rx={60 + p * 200} ry={12 + p * 30} fill="none" stroke="#ffffff" strokeWidth={10 * (1 - p)} opacity={1 - p} />;
        })}
        {/* listening: sound arcs from the tall grass to Benny's ears */}
        {within(t, S('crunch'), S('mouse')) && [0, 1, 2].map((i) => {
          const p = ((t - S('crunch')) * 1.2 + i / 3) % 1;
          return <path key={i} d={`M ${GRASS_X - 120 - p * 380},${f - 260 - i * 6} q -30,40 0,80`} fill="none" stroke="#4cc9f0" strokeWidth={10} strokeLinecap="round" opacity={1 - p} />;
        })}
      </KidsStage>
      <TitleCard t={t} from={0} to={TITLE_END} title="BENNY THE RABBIT" sub="and the lost carrot" />
      <ThinkTimer t={t} from={E('guess2') + 0.2} to={S('reveal') - 0.2} label="WHO?" />
      {(['thump1', 'thump2', 't_a', 't_b'] as const).map((k) => (
        <PopText key={k} t={t} at={S(k)} until={E(k) + 1.0} text="THUMP! THUMP!" y={200} size={140} color="#ff924c" />
      ))}
      <PopText t={t} at={E('your_turn') - 0.4} until={S('thump2') - 0.1} text="YOUR TURN!" y={200} size={120} color="#ffca3a" />
      <FactCard t={t} at={S('fact1') - 0.2} until={S('fact2') - 0.4} n={1} text="ears turn to listen"><EarsIcon /></FactCard>
      <FactCard t={t} at={S('fact2') - 0.2} until={S('fact3') - 0.4} n={2} text="grass & hay!"><GrassIcon /></FactCard>
      <FactCard t={t} at={S('fact3') - 0.2} until={S('story') - 0.6} n={3} text="BINKY = happy jump!"><BinkyIcon /></FactCard>
      <PopText t={t} at={S('sad') + 0.2} until={S('bobo_help')} text="SAD" y={200} size={130} color="#4cc9f0" />
      <PopText t={t} at={S('look1') + 1.2} until={S('look2') - 0.2} text="NO..." x={BUSH_X} y={320} size={90} color="#ffffff" />
      <PopText t={t} at={S('look2') + 1.2} until={S('ears') - 0.2} text="NO..." x={ROCK_X + 60} y={320} size={90} color="#ffffff" />
      <PopText t={t} at={S('crunch')} until={S('mouse') - 0.2} text="CRUNCH! CRUNCH!" y={200} size={120} color="#ff8c1a" />
      <PopText t={t} at={S('share') + 1.0} until={S('picnic') - 0.2} text="LET'S SHARE!" y={200} size={130} color="#ffca3a" />
      <PopText t={t} at={S('lesson') + 0.2} until={S('again') - 0.4} text="FRIENDS HELP EACH OTHER!" y={200} size={100} color="#ffca3a" />
      {/* ── LET'S REMEMBER ── */}
      <PopText t={t} at={S('again')} until={S('t_q') - 0.3} text="LET'S REMEMBER!" y={200} size={130} color="#ffca3a" />
      <ThinkTimer t={t} from={E('t_q') + 0.2} to={S('t_a') - 0.2} label="HOW?" />
      <PopText t={t} at={E('t_turn') - 0.4} until={S('t_b') - 0.1} text="YOUR TURN!" y={330} size={110} color="#ffca3a" />
      <ThinkTimer t={t} from={E('q1') + 0.2} to={S('a1') - 0.2} label="WHAT?" />
      <ThinkTimer t={t} from={E('q2') + 0.2} to={S('a2') - 0.2} label="WHAT?" />
      <ThinkTimer t={t} from={E('q3') + 0.2} to={S('a3') - 0.2} label="WHAT?" />
      <FactCard t={t} at={S('a1') - 0.2} until={S('q2') - 0.4} n={2} text="grass & hay!"><GrassIcon /></FactCard>
      <FactCard t={t} at={S('a2') - 0.2} until={S('q3') - 0.4} n={1} text="ears turn to listen"><EarsIcon /></FactCard>
      <FactCard t={t} at={S('a3') - 0.2} until={S('b_turn') + 0.6} n={3} text="BINKY = happy jump!"><BinkyIcon /></FactCard>
      <PopText t={t} at={E('b_turn') - 0.3} until={S('b_jump') - 0.1} text="YOUR TURN: BINKY!" y={330} size={100} color="#ffca3a" />
      <PopText t={t} at={S('l1')} until={S('l_turn')} text="FRIENDS HELP EACH OTHER!" y={200} size={100} color="#ffca3a" />
      <PopText t={t} at={E('l_turn') - 0.3} until={S('l2') - 0.1} text="YOUR TURN!" y={200} size={120} color="#ffca3a" />
      <PopText t={t} at={S('l2')} until={S('bye') - 0.3} text="FRIENDS HELP EACH OTHER!" y={200} size={100} color="#ffca3a" />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
    </>
  );
}
