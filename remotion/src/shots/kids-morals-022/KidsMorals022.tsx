// TINY SPARKS · Day 22 · 📚 Moral Stories #2 — "The Girl Who Learned to Share" (LONG 16:9)
// kids-shorts/tiny-sparks/morals/day-022-the-girl-who-learned-to-share. Cues from VO via K.
// WANT (Mila's new box of blocks) → WRONG CHOICE ("No! MY blocks") → FEELING (Leo & Bobo sad, far away;
// Mila builds alone → the tower FALLS → playing alone isn't fun → LONELY, the word named, close-up) →
// CHOICE (think timer) → SHARE ("Let's share the blocks!") → the friends build the tallest castle together
// → MORAL "Sharing makes everyone happy." → LET'S REMEMBER (3 cards · feelings quiz LONELY / HAPPY with
// close-ups + timers · say-it-with-me + YOUR TURN) → "What can YOU share?" → bye.
import React from 'react';
import { Kid, kidFaceAt } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO, CAPTION_COLORS, LEO, MILA } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Sun } from '../../lib/kids/sets';
import { Confetti, FONT_TOON, KidsCaptions, KidsStage, PopText, ThinkTimer, TitleCard, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { EASE_INOUT, EASE_OUT, prog } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsMorals022', durationInSeconds: 156.9, fps: 30, width: 1920, height: 1080 };

const W = 1920;
const H = 1080;
const f = FLOOR(H);
type Key = keyof typeof K;
const S = (k: Key) => VO[K[k]].start;
const E = (k: Key) => VO[K[k]].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff' };
const KID_S = 0.75;

const MILA_X = 820;
const TOWER_X = 1060; // where blocks are stacked
const BLOCK = 92;
const BCOL = ['#e63946', '#ffd60a', '#1d72d8'];

// friends: near Mila at first, then sit far away (sad), then come back to build
const AWAY0 = E('m_no') + 0.4;
const BACK0 = E('leo_yay') - 0.2;
const leoX = (t: number) => 1330 + (1590 - 1330) * EASE_INOUT(prog(t, AWAY0, AWAY0 + 1.4)) - (1590 - 1520) * EASE_INOUT(prog(t, BACK0, BACK0 + 1.4));
const boboX = (t: number) => 1560 + (1790 - 1560) * EASE_INOUT(prog(t, AWAY0, AWAY0 + 1.4)) - (1790 - 1310) * EASE_INOUT(prog(t, BACK0, BACK0 + 1.4));
const awayWalk = (t: number) => within(t, AWAY0, AWAY0 + 1.4) || within(t, BACK0, BACK0 + 1.4);

// stacking: alone tower (5 blocks, wobbles, falls on 'crash'); shared castle (9 blocks, 3 wide)
const ALONE_T0 = S('build') - 0.2;
const CRASH = S('crash') + 0.3;
const CASTLE_T0 = S('together') - 0.2;
const CASTLE_N = 12;

const [mfx, mfy] = kidFaceAt(MILA_X, f, KID_S);
const WIDE = { z: 1, x: W / 2, y: H / 2 };
const shot = (a: number, b: number, x: number, y: number, z = 1.45): CamKey[] => [
  { t: a, ...WIDE },
  { t: a, z, x, y: y + 70, cut: true },
  { t: b, z, x, y: y + 70 },
  { t: b, ...WIDE, cut: true },
];
const CAM: CamKey[] = [
  { t: 0, ...WIDE },
  ...shot(S('lonely') - 0.2, E('word') + 0.6, mfx, mfy),
  ...shot(S('quiz1') - 0.2, S('quiz2') - 0.4, mfx, mfy),
];

const Block: React.FC<{ c: string; letter?: string }> = ({ c, letter }) => (
  <g>
    <rect x={-BLOCK / 2} y={-BLOCK} width={BLOCK} height={BLOCK} rx={12} fill={c} {...kst(6)} />
    <rect x={-BLOCK / 2 + 12} y={-BLOCK + 12} width={BLOCK - 24} height={BLOCK - 24} rx={8} fill="#ffffff" opacity={0.25} />
    {letter && <text y={-28} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={52} fill="#ffffff" stroke={KINK} strokeWidth={4} paintOrder="stroke">{letter}</text>}
  </g>
);

const Playroom: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect width={W} height={f} fill="#e7f0ff" />
    <rect y={f - 150} width={W} height={150} fill="#d6e4ff" />
    <line x1={0} y1={f - 150} x2={W} y2={f - 150} {...kst(5)} />
    <g transform="translate(1400,120)">
      <rect width={420} height={320} rx={20} fill="#9ad8ff" {...kst(7)} />
      <g transform="translate(300,100) scale(0.55)"><Sun x={0} y={0} t={t} /></g>
      <line x1={210} y1={0} x2={210} y2={320} {...kst(6)} />
      <line x1={0} y1={160} x2={420} y2={160} {...kst(6)} />
    </g>
    {/* toy shelf */}
    <g transform="translate(200,240)">
      <rect width={360} height={22} rx={8} fill="#a0673c" {...kst(5)} />
      <circle cx={70} cy={-40} r={40} fill="#ff6fa5" {...kst(5)} />
      <rect x={150} y={-70} width={60} height={70} rx={10} fill="#8ac926" {...kst(5)} />
      <path d="M 260,0 L 300,-80 L 340,0 Z" fill="#ffca3a" {...kst(5)} />
    </g>
    <rect x={0} y={f} width={W} height={H - f} fill="#c98f5f" />
    <line x1={0} y1={f} x2={W} y2={f} {...kst(7)} />
    <ellipse cx={1080} cy={f + 60} rx={600} ry={70} fill="#b8a1e3" opacity={0.7} {...kst(5)} />
  </g>
);

const RecapCard: React.FC<{ t: number; at: number; until: number; x: number; n: number; label: string; children: React.ReactNode }> = ({ t, at, until, x, n, label, children }) => {
  if (t < at || t >= until) return null;
  const s = EASE_OUT(prog(t, at, at + 0.4));
  return (
    <g transform={`translate(${x},215) scale(${s * 0.72})`}>
      <rect x={-170} y={-170} width={340} height={340} rx={40} fill="#ffffff" {...kst(8)} />
      <circle cx={-150} cy={-150} r={40} fill="#ff595e" {...kst(6)} />
      <text x={-150} y={-134} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={46} fill="#ffffff">{n}</text>
      {children}
      <text y={140} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill={KINK}>{label}</text>
    </g>
  );
};

export default function KidsMorals022() {
  const t = useT();
  const cam = camAt(t, CAM);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const sadFriends = within(t, E('m_no') + 0.2, S('leo_yay'));
  const lonely = within(t, S('m_oh'), S('m_share'));
  const recap = within(t, S('rem1') - 0.2, S('quiz1') - 0.4);

  // the box of blocks by Mila (until the castle is built)
  const boxOn = t < CASTLE_T0 + 4;
  // alone tower
  const aloneN = within(t, ALONE_T0, CASTLE_T0) ? Math.min(5, Math.floor(prog(t, ALONE_T0, ALONE_T0 + 3.2) * 5) + 1) : 0;
  const wobble = within(t, S('crash') - 0.8, CRASH) ? Math.sin(t * 18) * 6 * prog(t, S('crash') - 0.8, CRASH) : 0;
  const fallP = prog(t, CRASH, CRASH + 0.9);
  // castle
  const castleN = t >= CASTLE_T0 && t < S('rem') - 0.3 ? Math.min(CASTLE_N, Math.floor(prog(t, CASTLE_T0, S('tall') + 1.2) * CASTLE_N) + 1) : 0;
  const castlePos = (i: number): [number, number] => {
    // 3-wide base (2 rows), 2-wide, then a 1-wide tower: 3+3+2+2+1+1 = 12
    const rows = [3, 3, 2, 2, 1, 1];
    let r = 0;
    let k = i;
    while (k >= rows[r]) { k -= rows[r]; r++; }
    const n = rows[r];
    return [TOWER_X + (k - (n - 1) / 2) * BLOCK, f - r * BLOCK];
  };
  const castleDone = castleN >= CASTLE_N;

  const milaExpr: KExpr =
    within(t, S('m_wow'), S('leo_ask')) ? 'wow'
    : within(t, S('m_no'), S('sad')) ? 'proud'
    : within(t, S('build'), S('crash')) ? 'happy'
    : within(t, S('crash'), S('m_share')) ? (t < S('m_oh') ? 'surprised' : 'sad')
    : within(t, S('quiz1') - 0.2, S('quiz2') - 0.4) ? 'sad'
    : 'laugh';
  const friendExpr: KExpr = sadFriends ? 'sad' : within(t, S('leo_ask'), S('m_no')) ? 'happy' : 'laugh';

  return (
    <>
      <KidsStage cam={cam}>
        <Playroom t={t} />
        {/* the box of blocks */}
        {boxOn && (
          <g transform={`translate(${TOWER_X - 470},${f})`}>
            <path d="M -90,0 L -80,-110 L 80,-110 L 90,0 Z" fill="#ffca3a" {...kst(7)} />
            {[-40, 0, 40].map((x, i) => <rect key={x} x={x - 22} y={-150} width={44} height={44} rx={8} fill={BCOL[i]} {...kst(4)} />)}
            <text y={-40} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill={KINK}>BLOCKS</text>
          </g>
        )}
        {/* alone tower: stacks, wobbles, falls */}
        {aloneN > 0 &&
          Array.from({ length: aloneN }).map((_, i) => {
            const fall = EASE_OUT(fallP) * (0.4 + i * 0.25);
            const x = TOWER_X + Math.sin(i * 1.7) * 6 + fall * (i % 2 ? 1 : -1) * (80 + i * 50);
            const y = f - i * BLOCK * (1 - EASE_OUT(fallP));
            const rot = (wobble * i) / 2 + Math.min(1, fall) * (i % 2 ? 1 : -1) * 70;
            return <g key={i} transform={`translate(${x},${y}) rotate(${rot})`}><Block c={BCOL[i % 3]} /></g>;
          })}
        {/* shared castle */}
        {castleN > 0 &&
          Array.from({ length: castleN }).map((_, i) => {
            const [x, y] = castlePos(i);
            return <g key={i} transform={`translate(${x},${y})`}><Block c={BCOL[i % 3]} letter={i === CASTLE_N - 1 ? '★' : undefined} /></g>;
          })}
        {castleDone && (
          <g transform={`translate(${TOWER_X},${f - 6 * BLOCK})`}>
            <line x1={0} y1={0} x2={0} y2={-90} {...kst(6)} />
            <path d={`M 0,-90 L ${70 + Math.sin(t * 6) * 6},-70 L 0,-50 Z`} fill="#ff595e" {...kst(5)} />
          </g>
        )}
        <Kid spec={MILA} x={MILA_X} y={f} scale={KID_S} expr={milaExpr} look={within(t, S('lonely'), S('m_share')) ? [0.9, 0] : [0.5, -0.2]} mouth={lipSync(VO, 'mila', t)}
          armL={within(t, S('m_no'), E('m_no')) ? 'hug' : lonely ? 'down' : t >= S('bye') ? 'wave' : within(t, S('m_share'), E('m_share')) ? 'present' : 'down'}
          armR={within(t, S('build'), S('crash')) || within(t, CASTLE_T0, S('tall')) ? 'up' : within(t, S('m_wow'), E('m_wow')) ? 'up' : t >= S('bye') ? 'wave' : 'hip'} />
        <Kid spec={LEO} x={leoX(t)} y={f} scale={KID_S} expr={friendExpr} look={[-0.7, -0.1]} mouth={lipSync(VO, 'leo', t)}
          legs={awayWalk(t) ? 'walk' : 'stand'} walk={t * 2}
          armL={within(t, CASTLE_T0, S('tall')) ? 'up' : t >= S('bye') ? 'wave' : within(t, S('say2'), E('say2')) ? 'up' : 'down'}
          armR={within(t, S('leo_ask'), E('leo_ask')) ? 'wave' : within(t, S('leo_yay'), E('leo_yay')) ? 'up' : t >= S('bye') ? 'wave' : 'hip'} />
        <Critter spec={BOBO} x={boboX(t)} y={f} scale={0.62} expr={friendExpr} look={[-0.7, -0.1]} mouth={lipSync(VO, 'bobo', t)}
          walking={awayWalk(t)} walk={t * 2}
          armL={within(t, CASTLE_T0, S('tall') + 1) ? 'hold' : t >= S('bye') ? 'wave' : talks('bobo') ? 'up' : 'down'}
          armR={within(t, CASTLE_T0, S('tall') + 1) ? 'hold' : t >= S('bye') ? 'wave' : 'down'} />

        {/* LET'S REMEMBER: 3 cards */}
        {recap && (
          <g>
            <RecapCard t={t} at={S('rem1') - 0.1} until={S('quiz1') - 0.4} x={660} n={1} label="Mila played alone">
              <g transform="translate(0,40)"><Block c={BCOL[0]} /></g>
              <text y={-70} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={60} fill="#4cc9f0">:(</text>
            </RecapCard>
            <RecapCard t={t} at={S('rem2') - 0.1} until={S('quiz1') - 0.4} x={960} n={2} label="Mila shared">
              {[-60, 0, 60].map((x, i) => <g key={x} transform={`translate(${x},${40 - (i === 1 ? 20 : 0)}) scale(0.7)`}><Block c={BCOL[i]} /></g>)}
              <path d="M -90,-80 Q 0,-140 90,-80" fill="none" stroke="#ff6fa5" strokeWidth={10} strokeLinecap="round" />
            </RecapCard>
            <RecapCard t={t} at={S('rem3') - 0.1} until={S('quiz1') - 0.4} x={1260} n={3} label="a big castle!">
              {[[-50, 60], [0, 60], [50, 60], [-25, 10], [25, 10], [0, -40]].map(([x, y], i) => <g key={i} transform={`translate(${x},${y}) scale(0.54)`}><Block c={BCOL[i % 3]} /></g>)}
            </RecapCard>
          </g>
        )}
      </KidsStage>
      <TitleCard t={t} from={0} to={1.6} title="LET'S SHARE!" sub="a Tiny Sparks story" />
      <PopText t={t} at={S('m_no') + 0.4} until={S('sad') - 0.2} text="MY BLOCKS!" y={170} size={120} color="#ff595e" />
      <PopText t={t} at={S('crash')} until={S('m_oh') - 0.2} text="CRASH!" y={170} size={150} color="#ff924c" />
      <PopText t={t} at={S('word') + 1.4} until={S('choice') - 0.2} text="LONELY" y={170} size={150} color="#4cc9f0" />
      <ThinkTimer t={t} from={E('choice') + 0.1} to={S('m_share') - 0.2} label="WHAT?" />
      <PopText t={t} at={S('m_share') + 2.0} until={S('leo_yay') + 0.2} text="LET'S SHARE!" y={170} size={130} color="#ffca3a" />
      <PopText t={t} at={S('tall')} until={S('m_happy') - 0.2} text="UP, UP, UP!" y={170} size={120} color="#8ac926" />
      <Confetti t={t} at={S('tall') + 1.0} y={300} />
      <PopText t={t} at={S('moral') + 0.2} until={S('rem') - 0.4} text="SHARING MAKES EVERYONE HAPPY!" y={170} size={84} color="#ffca3a" />
      <PopText t={t} at={S('rem')} until={S('rem1') - 0.3} text="LET'S REMEMBER!" y={170} size={120} color="#ffca3a" />
      <ThinkTimer t={t} from={E('quiz1') + 0.1} to={S('quiz1_a') - 0.2} label="HOW?" />
      <PopText t={t} at={S('quiz1_a')} until={S('quiz2') - 0.4} text="LONELY" y={170} size={150} color="#4cc9f0" />
      <ThinkTimer t={t} from={E('quiz2') + 0.1} to={S('quiz2_a') - 0.2} label="HOW?" />
      <PopText t={t} at={S('quiz2_a')} until={S('say') - 0.4} text="HAPPY!" y={170} size={150} color="#ffca3a" />
      <PopText t={t} at={S('say1')} until={S('ask_you') - 0.3} text="SHARING MAKES EVERYONE HAPPY!" y={170} size={84} color="#ffca3a" />
      <PopText t={t} at={E('turn') + 0.1} until={S('say2') - 0.1} text="YOUR TURN!" y={310} size={120} color="#ff924c" />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
    </>
  );
}
