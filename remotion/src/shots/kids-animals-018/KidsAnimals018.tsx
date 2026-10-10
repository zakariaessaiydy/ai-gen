// TINY SPARKS · Day 18 · 🦁 Animal Stories #3 — "Charlie the Monkey's Big Adventure" (LONG 16:9)
// kids-shorts/tiny-sparks/animals/day-018-charlie-the-monkey-s-big-adventure. Cues from VO via K.
// First episode with the new 'monkey' Critter species. GUESS WHO (a curly tail hanging from the leaves) →
// MEET Charlie → SOUND ("Ooh ooh! Ah ah!", your turn) → 3 TRUE FACTS (tails that hold branches · fruit,
// leaves & seeds · friends groom each other) → STORY: climb the tallest tree for a mango → stuck below a
// high branch (sad close-up) → Bobo lifts him → the top! → share the mango → groom Bobo ("I like you") →
// "Good friends help each other" → LET'S REMEMBER (sound turns, fact quiz with timers, hug turn, say it ×2).
import React from 'react';
import { Critter, critterFaceAt, type CritterSpec } from '../../lib/kids/critter';
import { BOBO, CAPTION_COLORS } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR } from '../../lib/kids/sets';
import { FONT_TOON, KidsCaptions, KidsStage, PopText, ThinkTimer, TitleCard, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { EASE_INOUT, EASE_OUT, prog } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsAnimals018', durationInSeconds: 215.9, fps: 30, width: 1920, height: 1080 };

const W = 1920;
const H = 1080;
const f = FLOOR(H);
type Key = keyof typeof K;
const S = (k: Key) => VO[K[k]].start;
const E = (k: Key) => VO[K[k]].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;
const COLORS = { ...CAPTION_COLORS, charlie: '#ff924c', narrator: '#ffffff' };

const CHARLIE: CritterSpec = { id: 'charlie', species: 'monkey', fur: '#a0673c', fur2: '#f3d2b3', dark: '#6b4226' };
const TREE_X = 1660;
const LOW_Y = 770;
const MID_Y = 600;
const TOP_Y = 440;
const MANGO: [number, number] = [1590, 340];
const REVEAL = S('reveal') + 0.9;
const SC = 0.6;

// keyframed path helper: [t, x, y] → eased position
type KF = [number, number, number];
const path = (t: number, kf: KF[]): [number, number] => {
  if (t <= kf[0][0]) return [kf[0][1], kf[0][2]];
  for (let i = 0; i < kf.length - 1; i++) {
    const [t0, x0, y0] = kf[i];
    const [t1, x1, y1] = kf[i + 1];
    if (t < t1) {
      const p = EASE_INOUT(prog(t, t0, t1));
      return [x0 + (x1 - x0) * p, y0 + (y1 - y0) * p];
    }
  }
  const l = kf[kf.length - 1];
  return [l[1], l[2]];
};
const CHARLIE_KF: KF[] = [
  [REVEAL, 470, 340],
  [REVEAL + 0.6, 760, f],
  [S('climb'), 760, f],
  [S('climb') + 1.2, 1460, f],
  [S('climb') + 2.4, 1510, LOW_Y],
  [S('up'), 1510, LOW_Y],
  [S('up') + 1.8, 1480, TOP_Y],
  [S('top') - 0.2, 1480, TOP_Y],
  [S('top') + 1.4, 1500, TOP_Y],
  [S('groom') - 1.8, 1530, TOP_Y],
  [S('groom') - 0.6, 1250, f],
  [S('lesson') + 0.4, 1250, f],
  [S('again') - 0.4, 760, f],
];
const BOBO_KF: KF[] = [
  [0, 1180, f],
  [S('bobo_help'), 1180, f],
  [E('bobo_help') + 0.2, 1440, f],
  [S('groom') - 0.6, 1440, f],
  [S('again') - 0.4, 1180, f],
];
const climbing = (t: number) => within(t, S('climb') + 1.2, S('climb') + 2.4) || within(t, S('up'), S('up') + 1.8) || within(t, S('top') - 0.2, S('top') + 1.4);
const walkingC = (t: number) => within(t, S('climb'), S('climb') + 1.2) || within(t, S('lesson') + 0.4, S('again') - 0.4);

const [gfx, gfy] = critterFaceAt(760, f, SC);
const WIDE = { z: 1, x: W / 2, y: H / 2 };
const shot = (a: number, b: number, c: Omit<CamKey, 't'>): CamKey[] => [
  { t: a, ...WIDE },
  { t: a, ...c, cut: true },
  { t: b, ...c },
  { t: b, ...WIDE, cut: true },
];
const CAM: CamKey[] = [
  { t: 0, ...WIDE },
  { t: S('guess') - 0.4, z: 1.35, x: 520, y: 420, cut: true },
  { t: REVEAL, z: 1.35, x: 520, y: 420 },
  { t: S('hello') - 0.2, ...WIDE },
  ...shot(S('sound2') - 0.3, E('sound2') + 1.0, { z: 1.45, x: gfx, y: gfy + 130 }),
  ...shot(S('stuck') - 0.2, E('sad') + 0.6, { z: 1.4, x: 1480, y: 640 }),
  ...shot(S('s_a') - 0.3, E('s_b') + 0.8, { z: 1.45, x: gfx, y: gfy + 130 }),
];

const Jungle: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <defs>
      <linearGradient id="jSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8fe3c9" />
        <stop offset="1" stopColor="#d8f5e4" />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#jSky)" />
    {/* far bushes */}
    {Array.from({ length: 12 }).map((_, i) => <circle key={i} cx={i * 180} cy={f - 40} r={130 + (i % 3) * 30} fill={i % 2 ? '#52b788' : '#40916c'} />)}
    {/* left tree with a branch (where the tail hangs) */}
    <g>
      <rect x={200} y={180} width={90} height={f - 180} fill="#8d5a3b" {...kst(7)} />
      <path d="M 270,330 Q 420,300 600,330" fill="none" stroke="#8d5a3b" strokeWidth={30} strokeLinecap="round" />
      {[[150, 170, 140], [300, 120, 150], [440, 220, 120], [560, 290, 90]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? '#2d9a5a' : '#38b26b'} {...kst(6)} />)}
      {[330, 470].map((x, i) => <path key={x} d={`M ${x},300 Q ${x + 10 + Math.sin(t + i) * 8},${470} ${x},${640}`} fill="none" stroke="#2d9a5a" strokeWidth={10} strokeLinecap="round" />)}
    </g>
    {/* the tallest tree */}
    <g>
      <rect x={TREE_X - 60} y={120} width={120} height={f - 120} fill="#8d5a3b" {...kst(7)} />
      {[[LOW_Y, 1440], [TOP_Y, 1420]].map(([y, x]) => <path key={y} d={`M ${TREE_X - 50},${y + 20} Q ${(TREE_X + x) / 2},${y - 10} ${x},${y}`} fill="none" stroke="#8d5a3b" strokeWidth={34} strokeLinecap="round" />)}
      {[[1540, 220, 130], [1740, 200, 150], [1870, 300, 110], [1660, 120, 130]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? '#2d9a5a' : '#38b26b'} {...kst(6)} />)}
    </g>
    <rect x={0} y={f} width={W} height={H - f} fill="#7cc576" />
    <line x1={0} y1={f} x2={W} y2={f} {...kst(7)} />
  </g>
);

const Mango: React.FC<{ s?: number; half?: boolean }> = ({ s = 1, half }) => (
  <g transform={`scale(${s})`}>
    <path d={half ? 'M -40,-10 Q 0,-60 40,-10 Q 0,0 -40,-10 Z' : 'M -46,0 Q -40,-60 10,-56 Q 56,-46 50,4 Q 40,56 -4,54 Q -50,46 -46,0 Z'} fill="#ffb703" {...kst(6)} />
    {!half && <path d="M -10,-40 Q 0,-8 30,10" fill="none" stroke="#ff924c" strokeWidth={8} strokeLinecap="round" />}
    {!half && <path d="M 4,-56 Q 30,-90 60,-74 Q 30,-58 4,-56 Z" fill="#52b788" {...kst(5)} />}
  </g>
);

const FactCard: React.FC<{ t: number; at: number; until: number; n: number; text: string; children?: React.ReactNode }> = ({ t, at, until, n, text, children }) => {
  if (t < at || t >= until) return null;
  const s = EASE_OUT(prog(t, at, at + 0.4));
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <g transform={`translate(${W / 2 - 120},172) scale(${s * 0.85})`}>
        <rect x={-460} y={-150} width={920} height={300} rx={40} fill="#ffffff" {...kst(9)} />
        <circle cx={-400} cy={-150} r={52} fill="#ff595e" {...kst(7)} />
        <text x={-400} y={-132} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={56} fill="#ffffff">{n}</text>
        <g transform="translate(-290,10) scale(2.2)">{children}</g>
        <text x={130} y={26} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={60} fill={KINK}>{text}</text>
      </g>
    </svg>
  );
};
const TailIcon = () => (
  <g>
    <path d="M -90,-50 L 90,-50" stroke="#8d5a3b" strokeWidth={20} strokeLinecap="round" />
    <path d="M 0,60 Q -10,0 10,-30 Q 30,-60 0,-62 Q -24,-60 -16,-40" fill="none" stroke="#6b4226" strokeWidth={12} strokeLinecap="round" />
  </g>
);
const FoodIcon = () => (
  <g>
    <g transform="translate(-40,0) scale(0.8)"><Mango /></g>
    <path d="M 30,30 Q 60,-50 100,-10 Q 70,40 30,30 Z" fill="#52b788" {...kst(5)} />
    {[[40, 50], [60, 60], [80, 48]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={8} ry={5} fill="#c98f5f" {...kst(3)} />)}
  </g>
);
const FriendsIcon = () => (
  <g>
    {[-1, 1].map((k) => <path key={k} d="M 0,30 C -40,0 -36,-30 -16,-30 C -6,-30 0,-22 0,-16 C 0,-22 6,-30 16,-30 C 36,-30 40,0 0,30 Z" fill="#ff6fa5" {...kst(5)} transform={`translate(${k * 40},${k * -6}) scale(${k > 0 ? 1 : 0.8})`} />)}
  </g>
);

export default function KidsAnimals018() {
  const t = useT();
  const cam = camAt(t, CAM);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const showC = t >= REVEAL;
  const [cx, cy] = path(t, CHARLIE_KF);
  const [bx] = path(t, BOBO_KF);
  const soundLine = (['sound1', 'sound2', 's_a', 's_b'] as const).some((k) => within(t, S(k), E(k) + 0.3));
  const sad = within(t, S('stuck') + 0.6, S('bobo_help') + 0.8);
  const gotMango = t >= S('top') + 1.6 && t < S('share') + 1.2;
  const mangoOnTree = t < S('top') + 1.6;
  const mangoHalf = within(t, S('share') + 1.2, S('again'));
  const hugTurn = within(t, S('h_go'), E('h_go') + 1.4) || within(t, S('groom'), E('groom') + 0.6);
  const bLift = within(t, S('up'), S('up') + 1.8);

  const cExpr: KExpr =
    !showC ? 'smile'
    : soundLine ? 'laugh'
    : sad ? 'sad'
    : within(t, S('stuck'), S('stuck') + 0.6) ? 'surprised'
    : within(t, S('reach'), S('top') + 2) ? 'wow'
    : 'happy';

  return (
    <>
      <KidsStage cam={cam}>
        <Jungle t={t} />
        {/* the mango at the top of the tallest tree */}
        {mangoOnTree && (
          <g transform={`translate(${MANGO[0]},${MANGO[1] + Math.sin(t * 2) * 4})`}>
            <line x1={0} y1={-90} x2={0} y2={-46} {...kst(5)} />
            <Mango s={1.1} />
            {within(t, S('plan'), E('plan') + 1) && <circle r={90} fill="none" stroke="#ffffff" strokeWidth={8} opacity={0.6 + 0.4 * Math.sin(t * 8)} />}
          </g>
        )}
        {/* guess who: a curly tail hanging from the leaves */}
        {!showC && t >= S('guess') - 0.4 && (
          <g transform={`translate(470,330) rotate(${Math.sin(t * 3) * 10})`}>
            <path d="M 0,0 Q -10,120 20,160 Q 60,200 30,230 Q 0,250 -10,220" fill="none" stroke="#6b4226" strokeWidth={22} strokeLinecap="round" />
          </g>
        )}
        {/* half a mango in Bobo's paw after sharing */}
        <Critter spec={BOBO} x={bx} y={f} scale={0.6} expr={talks('bobo') || hugTurn ? 'laugh' : sad ? 'oops' : 'happy'} look={[t > S('climb') && t < S('groom') ? 0.4 : -0.5, t > S('climb') && t < S('groom') ? -0.8 : -0.2]}
          mouth={lipSync(VO, 'bobo', t)} walking={within(t, S('bobo_help'), E('bobo_help') + 0.2) || within(t, S('lesson') + 0.4, S('again') - 0.4)} walk={t * 2}
          holdR={mangoHalf ? <Mango s={0.5} half /> : undefined}
          armL={bLift ? 'up' : hugTurn ? 'hug' : t >= S('bye') ? 'wave' : talks('bobo') ? 'up' : 'down'}
          armR={bLift ? 'up' : mangoHalf ? 'hold' : t >= S('bye') ? 'wave' : 'down'} />
        {showC && (
          <Critter spec={CHARLIE} x={cx} y={cy} scale={SC} expr={cExpr} look={within(t, S('plan'), S('stuck')) ? [0.6, -0.8] : sad ? [0, 0.5] : [-0.4, -0.2]}
            mouth={lipSync(VO, 'charlie', t)} walking={walkingC(t)} walk={t * 2}
            hop={t >= REVEAL && t < REVEAL + 0.6 ? Math.sin(prog(t, REVEAL, REVEAL + 0.6) * Math.PI) * 60 : soundLine ? Math.abs(Math.sin(t * 9)) * 20 : 0}
            squash={sad ? 0.1 : 0}
            holdR={gotMango ? <Mango s={0.55} /> : undefined}
            armR={gotMango ? 'hold' : climbing(t) ? 'up' : within(t, S('hello'), E('hello')) ? 'wave' : t >= S('bye') ? 'wave' : soundLine ? 'up' : 'down'}
            armL={climbing(t) || within(t, S('stuck'), E('stuck')) ? 'up' : hugTurn ? 'hug' : t >= S('bye') ? 'wave' : soundLine ? 'up' : 'down'} />
        )}
      </KidsStage>
      <TitleCard t={t} from={0} to={1.6} title="CHARLIE THE MONKEY" sub="a big adventure" />
      <ThinkTimer t={t} from={E('guess2') + 0.2} to={S('reveal') - 0.2} label="WHO?" />
      {(['sound1', 'sound2', 's_a', 's_b'] as const).map((k) => (
        <PopText key={k} t={t} at={S(k)} until={E(k) + 1.0} text="OOH OOH! AH AH!" y={180} size={110} color="#ff924c" />
      ))}
      <PopText t={t} at={E('your_turn') - 0.4} until={S('sound2') - 0.1} text="YOUR TURN!" y={180} size={120} color="#ffca3a" />
      <FactCard t={t} at={S('fact1') - 0.2} until={S('fact2') - 0.4} n={1} text="tails hold branches"><TailIcon /></FactCard>
      <FactCard t={t} at={S('fact2') - 0.2} until={S('fact3') - 0.4} n={2} text="fruit, leaves, seeds"><FoodIcon /></FactCard>
      <FactCard t={t} at={S('fact3') - 0.2} until={S('story') - 0.6} n={3} text="friends clean fur"><FriendsIcon /></FactCard>
      <PopText t={t} at={S('sad') + 0.2} until={S('bobo_help')} text="STUCK!" x={760} y={200} size={120} color="#4cc9f0" />
      <PopText t={t} at={S('up')} until={E('reach')} text="UP, UP, UP!" x={760} y={200} size={110} color="#ffca3a" />
      <PopText t={t} at={S('share') + 1.0} until={S('groom') - 0.2} text="LET'S SHARE!" x={760} y={200} size={120} color="#ffca3a" />
      <PopText t={t} at={S('lesson') + 0.2} until={S('again') - 0.4} text="FRIENDS HELP EACH OTHER!" x={760} y={200} size={90} color="#ffca3a" />
      {/* ── LET'S REMEMBER ── */}
      <PopText t={t} at={S('again')} until={S('s_q') - 0.3} text="LET'S REMEMBER!" y={180} size={130} color="#ffca3a" />
      <ThinkTimer t={t} from={E('s_q') + 0.2} to={S('s_a') - 0.2} label="WHAT?" />
      <PopText t={t} at={E('s_turn') - 0.4} until={S('s_b') - 0.1} text="YOUR TURN!" y={330} size={110} color="#ffca3a" />
      <ThinkTimer t={t} from={E('q1') + 0.2} to={S('a1') - 0.2} label="WHAT?" />
      <ThinkTimer t={t} from={E('q2') + 0.2} to={S('a2') - 0.2} label="WHAT?" />
      <ThinkTimer t={t} from={E('q3') + 0.2} to={S('a3') - 0.2} label="HOW?" />
      <FactCard t={t} at={S('a1') - 0.2} until={S('q2') - 0.4} n={1} text="tails hold branches"><TailIcon /></FactCard>
      <FactCard t={t} at={S('a2') - 0.2} until={S('q3') - 0.4} n={2} text="fruit, leaves, seeds"><FoodIcon /></FactCard>
      <FactCard t={t} at={S('a3') - 0.2} until={S('h_turn') + 0.4} n={3} text="friends clean fur"><FriendsIcon /></FactCard>
      <PopText t={t} at={E('h_turn') - 0.3} until={S('h_go') - 0.1} text="YOUR TURN: HUG!" y={330} size={100} color="#ff6fa5" />
      <PopText t={t} at={S('l1')} until={S('l_turn')} text="FRIENDS HELP EACH OTHER!" y={180} size={100} color="#ffca3a" />
      <PopText t={t} at={E('l_turn') - 0.3} until={S('l2') - 0.1} text="YOUR TURN!" y={180} size={120} color="#ffca3a" />
      <PopText t={t} at={S('l2')} until={S('bye') - 0.3} text="FRIENDS HELP EACH OTHER!" y={180} size={100} color="#ffca3a" />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
    </>
  );
}
