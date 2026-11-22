// TINY SPARKS · Day 25 · 🦁 Animal Stories #4 — "Emma the Elephant Helps Her Friend" (LONG 16:9, ≥ 5:00)
// kids-shorts/tiny-sparks/animals/day-025-emma-the-elephant-helps-her-friend. Cues from VO via K.
// First episode with the new 'elephant' Critter species; Super Bobo in his hero outfit.
// GUESS WHO (big ears + a trunk behind a bush) → MEET Emma, Super Bobo, Pip → SOUND "Pa-woo!" (trunk-arm
// your turn) → 3 TRUE FACTS (trunk = nose + hand · biggest land animal · ears flap to cool down) + "who is
// bigger?" → STORY 1: Pip's kite stuck in the tall tree → Super Bobo jumps (too short) → Emma's trunk
// stretches up → kite back (stretch-up your turn) → STORY 2: thirsty droopy flowers → Emma fills her trunk at
// the pond → SPLASH → flowers stand up → "Helping my friends makes me happy" → LET'S REMEMBER (sound turns,
// fact quiz with 6 s timers + fact cards, ear-flap turn, "how did Emma help?", say-it ×3).
import React from 'react';
import { Critter, critterFaceAt, type CritterSpec } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { FONT_TOON, KidsCaptions, KidsStage, PopText, ThinkTimer, TitleCard, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { EASE_INOUT, EASE_OUT, prog } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsAnimals025', durationInSeconds: 309.3, fps: 30, width: 1920, height: 1080 };

const W = 1920;
const H = 1080;
const f = FLOOR(H);
type Key = keyof typeof K;
const S = (k: Key) => VO[K[k]].start;
const E = (k: Key) => VO[K[k]].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;
const COLORS = { ...CAPTION_COLORS, emma: '#ff6fa5', pip: '#b8a1e3', narrator: '#ffffff' };

const EMMA: CritterSpec = { id: 'emma', species: 'elephant', fur: '#a9b4c2', fur2: '#f4c2d7', dark: '#6c7a89', bow: '#ff6fa5' };
const PIP: CritterSpec = { id: 'pip', species: 'mouse', fur: '#c9cdd4', fur2: '#f1f3f5', dark: '#868e96' };
const ES = 0.62; // Emma's scale
const TREE_X = 1690;
const KITE_TREE: [number, number] = [1640, 250];
const POND_X = 230;
const FLOWERS_X = 1080;
const BUSH_X = 560;
const REVEAL = S('reveal') + 0.9;

type KF = [number, number];
const lerpKF = (t: number, kf: KF[]): number => {
  if (t <= kf[0][0]) return kf[0][1];
  for (let i = 0; i < kf.length - 1; i++) {
    const [t0, x0] = kf[i];
    const [t1, x1] = kf[i + 1];
    if (t < t1) return x0 + (x1 - x0) * EASE_INOUT(prog(t, t0, t1));
  }
  return kf[kf.length - 1][1];
};
const EMMA_X: KF[] = [
  [REVEAL, BUSH_X], [REVEAL + 1.2, 820],
  [S('emma_help') + 0.4, 820], [S('reach') - 0.2, 1420],
  [S('story2') - 0.6, 1420], [S('story2') + 1.4, 820],
  [S('drink') - 0.2, 820], [S('drink') + 1.6, POND_X + 230], [S('drink') + 3.4, POND_X + 230], [S('drink') + 5.0, FLOWERS_X - 300],
  [S('again') - 1.4, FLOWERS_X - 300], [S('again'), 820],
];
const BOBO_X: KF[] = [[0, 300], [S('bobo_try'), 300], [S('bobo_try') + 1.2, 1460], [S('emma_help') - 0.2, 1460], [S('emma_help') + 0.6, 1200], [S('story2'), 1200], [S('story2') + 1.4, 300]];
const PIP_X: KF[] = [[0, 1180], [S('stuck'), 1180], [S('stuck') + 1.6, 1540], [S('story2') - 0.4, 1540]];
const walking = (t: number, kf: KF[]) => kf.some((k, i) => i < kf.length - 1 && within(t, k[0], kf[i + 1][0]) && k[1] !== kf[i + 1][1]);

const WIDE = { z: 1, x: W / 2, y: H / 2 };
const shot = (a: number, b: number, x: number, y: number, z = 1.4): CamKey[] => [
  { t: a, ...WIDE }, { t: a, z, x, y, cut: true }, { t: b, z, x, y }, { t: b, ...WIDE, cut: true },
];
const [efx, efy] = critterFaceAt(820, f, ES);
const CAM: CamKey[] = [
  { t: 0, ...WIDE },
  { t: S('guess') - 0.4, z: 1.35, x: BUSH_X, y: 640, cut: true },
  { t: REVEAL, z: 1.35, x: BUSH_X, y: 640 },
  { t: S('hello') - 0.2, ...WIDE },
  ...shot(S('sound2') - 0.3, E('sound2') + 1.0, efx, efy + 140, 1.45),
  ...shot(S('pip_sad'), E('sad') + 0.6, 1540, 620, 1.45),
  ...shot(S('s_a') - 0.3, E('s_c') + 0.8, efx, efy + 140, 1.45),
];

const Kite: React.FC<{ t: number }> = ({ t }) => (
  <g transform={`rotate(${Math.sin(t * 2) * 8})`}>
    <path d="M 0,-80 L 60,0 L 0,90 L -60,0 Z" fill="#ff595e" {...kst(7)} />
    <path d="M 0,-80 L 0,90 M -60,0 L 60,0" {...kst(5)} />
    <path d="M 0,-80 L 60,0 L 0,0 Z" fill="#ffca3a" />
    <path d={`M 0,90 Q 30,140 ${Math.sin(t * 3) * 20},190 Q -30,230 0,280`} fill="none" {...kst(4)} />
    {[150, 210, 260].map((y, i) => <path key={y} d={`M -14,${y} L 14,${y - 10}`} stroke={['#4cc9f0', '#8ac926', '#ff6fa5'][i]} strokeWidth={12} strokeLinecap="round" />)}
  </g>
);
const Tree: React.FC = () => (
  <g>
    <rect x={TREE_X - 50} y={200} width={100} height={f - 200} fill="#8d5a3b" {...kst(7)} />
    <path d={`M ${TREE_X - 40},360 Q ${TREE_X - 120},320 ${TREE_X - 170},300`} fill="none" stroke="#8d5a3b" strokeWidth={26} strokeLinecap="round" />
    {[[1600, 220, 130], [1780, 200, 140], [1880, 300, 100], [1690, 110, 130]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? '#2d9a5a' : '#38b26b'} {...kst(6)} />)}
  </g>
);
const Flower: React.FC<{ x: number; c: string; up: number; t: number; i: number }> = ({ x, c, up, t, i }) => {
  const lean = (1 - up) * 70 * (i % 2 ? 1 : -1);
  return (
    <g transform={`translate(${x},${f + 10})`}>
      <g transform={`rotate(${lean + Math.sin(t * 2 + i) * 3 * up})`}>
        <path d="M 0,0 Q 6,-80 0,-160" fill="none" stroke="#52b788" strokeWidth={12} strokeLinecap="round" />
        <g transform="translate(0,-170)">
          {Array.from({ length: 7 }).map((_, k) => <ellipse key={k} cx={0} cy={-34} rx={18} ry={30} fill={c} opacity={0.5 + 0.5 * up} {...kst(4)} transform={`rotate(${k * 51})`} />)}
          <circle r={22} fill="#ffd166" {...kst(5)} />
        </g>
      </g>
    </g>
  );
};
const Pond: React.FC<{ t: number }> = ({ t }) => (
  <g transform={`translate(${POND_X},${f + 60})`}>
    <ellipse rx={240} ry={64} fill="#4cc9f0" {...kst(7)} />
    {[0, 1].map((k) => <ellipse key={k} cx={-60 + k * 100} cy={Math.sin(t * 2 + k) * 4} rx={50} ry={10} fill="#ffffff" opacity={0.5} />)}
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
        <g transform="translate(-290,10) scale(2)">{children}</g>
        <text x={130} y={26} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={60} fill={KINK}>{text}</text>
      </g>
    </svg>
  );
};
const TrunkIcon = () => (
  <g>
    <path d="M -50,-50 Q -60,20 -20,50 Q 10,64 30,40" fill="none" stroke="#a9b4c2" strokeWidth={22} strokeLinecap="round" />
    <path d="M -50,-50 Q -60,20 -20,50 Q 10,64 30,40" fill="none" {...kst(4)} />
    <circle cx={44} cy={30} r={14} fill="#ff595e" {...kst(3)} />
  </g>
);
const SizeIcon = () => (
  <g>
    <rect x={-70} y={-50} width={70} height={100} rx={20} fill="#a9b4c2" {...kst(4)} />
    <rect x={20} y={20} width={24} height={30} rx={8} fill="#c9cdd4" {...kst(3)} />
    <path d="M -80,60 L 70,60" {...kst(3)} />
  </g>
);
const EarIcon = () => (
  <g>
    <ellipse cx={-10} cy={0} rx={40} ry={52} fill="#f4c2d7" {...kst(4)} />
    {[24, 40].map((r) => <path key={r} d={`M ${30 + r * 0.2},${-r} Q ${50 + r * 0.4},0 ${30 + r * 0.2},${r}`} fill="none" stroke="#4cc9f0" strokeWidth={6} strokeLinecap="round" />)}
  </g>
);

export default function KidsAnimals025() {
  const t = useT();
  const cam = camAt(t, CAM);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const showE = t >= REVEAL;
  const ex = showE ? lerpKF(t, EMMA_X) : BUSH_X;
  const bx = lerpKF(t, BOBO_X);
  const px = lerpKF(t, PIP_X);
  const [fx, fy] = critterFaceAt(ex, f, ES);
  const trunkTip: [number, number] = [fx + 26 * ES, fy + 210 * ES];

  // the kite: flying above Pip → blown into the tree → down Emma's trunk → back to Pip
  const kiteOn = t >= S('story') - 0.2 && t < S('story2') + 1.4;
  const flying: [number, number] = [px + 140 + Math.sin(t * 1.3) * 60, 230 + Math.sin(t * 2) * 30];
  const toTree = EASE_INOUT(prog(t, S('stuck'), S('stuck') + 1.4));
  const reachP = EASE_OUT(prog(t, S('reach') + 0.4, S('reach') + 2.4));
  const down = EASE_INOUT(prog(t, S('reach') + 2.6, S('got') + 0.4));
  let kite: [number, number] = [flying[0] + (KITE_TREE[0] - flying[0]) * toTree, flying[1] + (KITE_TREE[1] - flying[1]) * toTree];
  if (t >= S('reach') + 2.6) kite = [KITE_TREE[0] + (px + 70 - KITE_TREE[0]) * down, KITE_TREE[1] + (f - 250 - KITE_TREE[1]) * down];
  const trunkUp = within(t, S('reach') + 0.4, S('got') + 0.4) ? (t < S('reach') + 2.6 ? reachP : 1 - down) : 0;
  // water: trunk filled at the pond, sprayed on the flowers
  const sprayOn = within(t, S('drink') + 5.0, S('bloom') + 0.4);
  const up = EASE_OUT(prog(t, S('drink') + 5.6, S('bloom') + 0.6));
  const flowersUp = t < S('story2') ? 1 : up;

  const emmaExpr: KExpr =
    within(t, S('sound1'), E('sound1') + 0.4) || within(t, S('sound2'), E('sound2') + 0.4) || within(t, S('s_a'), E('s_c') + 0.4) ? 'laugh'
    : within(t, S('pip_sad'), S('emma_help')) ? 'sad'
    : talks('emma') ? 'happy'
    : 'smile';
  const pipExpr: KExpr = within(t, S('pip_sad'), S('got')) || within(t, S('pip_flowers'), S('bloom')) ? 'sad' : talks('pip') ? 'laugh' : 'happy';
  const flapping = within(t, S('flap'), E('flap') + 0.6) || within(t, S('f_go'), E('f_go') + 1.2);

  return (
    <>
      <KidsStage cam={cam}>
        <Meadow w={W} h={H} t={t} sun={!kiteOn} />
        <Tree />
        <Pond t={t} />
        {[0, 1, 2, 3, 4].map((i) => <Flower key={i} x={FLOWERS_X + i * 90} c={['#ff595e', '#ffca3a', '#ff6fa5', '#b8a1e3', '#ff924c'][i]} up={flowersUp} t={t} i={i} />)}
        {/* guess who: big ears + trunk wiggling behind a bush */}
        {!showE && t >= S('guess') - 0.4 && (
          <g transform={`translate(${BUSH_X},${f - 230})`}>
            {[-1, 1].map((k) => <ellipse key={k} cx={k * 150} cy={-60} rx={90} ry={110} fill="#a9b4c2" {...kst(7)} transform={`rotate(${k * Math.sin(t * 5) * 10} ${k * 100} -60)`} />)}
            <path d={`M 20,40 Q 60,${-60 + Math.sin(t * 4) * 20} 0,-120`} fill="none" stroke="#a9b4c2" strokeWidth={40} strokeLinecap="round" />
          </g>
        )}
        <g transform={`translate(${BUSH_X},${f + 10})`} opacity={showE && t > REVEAL + 1.4 ? 0 : 1}>
          {[[-130, -90, 120], [0, -150, 150], [130, -90, 120]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#55b84a" {...kst(6)} />)}
        </g>
        {/* the long trunk stretching to the kite */}
        {trunkUp > 0 && (
          <path d={`M ${trunkTip[0]},${trunkTip[1] - 60} Q ${trunkTip[0] + 80},${trunkTip[1] - 260 * trunkUp} ${trunkTip[0] + (KITE_TREE[0] - trunkTip[0]) * trunkUp},${trunkTip[1] + (KITE_TREE[1] + 90 - trunkTip[1]) * trunkUp}`}
            fill="none" stroke="#a9b4c2" strokeWidth={34} strokeLinecap="round" />
        )}
        {kiteOn && <g transform={`translate(${kite[0]},${kite[1]}) scale(0.9)`}><Kite t={t} /></g>}
        {/* water spray from the trunk to the flowers */}
        {sprayOn &&
          Array.from({ length: 14 }).map((_, i) => {
            const p = ((t - S('drink') - 5.0) * 1.4 + i / 14) % 1;
            const x0 = trunkTip[0] + 30;
            const x1 = FLOWERS_X + 180;
            return <circle key={i} cx={x0 + (x1 - x0) * p} cy={trunkTip[1] - 80 - Math.sin(p * Math.PI) * 220 + p * 60} r={10 + (i % 3) * 3} fill="#4cc9f0" {...kst(2)} opacity={1 - p * 0.3} />;
          })}
        <Critter spec={BOBO_HERO} x={bx} y={f} scale={0.6} expr={talks('bobo') ? 'laugh' : within(t, S('bobo_no'), S('emma_help')) ? 'oops' : 'happy'} look={[0.4, -0.4]}
          mouth={lipSync(VO, 'bobo', t)} walking={walking(t, BOBO_X)} walk={t * 2}
          hop={within(t, S('bobo_try') + 1.2, E('bobo_try') + 0.6) ? Math.abs(Math.sin(t * 7)) * 160 : 0}
          armL={within(t, S('bobo_try'), E('bobo_try') + 0.6) ? 'up' : t >= S('bye') ? 'wave' : talks('bobo') ? 'up' : 'down'}
          armR={within(t, S('bobo_try'), E('bobo_try') + 0.6) ? 'up' : t >= S('bye') ? 'wave' : 'down'} />
        <Critter spec={PIP} x={px} y={f} scale={0.36} expr={pipExpr} look={[-0.4, -0.6]} mouth={lipSync(VO, 'pip', t)} walking={walking(t, PIP_X)} walk={t * 3}
          armL={within(t, S('pip_fly'), S('stuck') + 0.4) ? 'up' : t >= S('bye') ? 'wave' : 'down'} armR={within(t, S('pip_yay'), E('pip_yay')) ? 'up' : 'down'} />
        {showE && (
          <Critter spec={EMMA} x={ex} y={f} scale={ES} expr={emmaExpr} look={trunkUp > 0 ? [0.8, -0.8] : [0, -0.2]} mouth={lipSync(VO, 'emma', t)}
            walking={walking(t, EMMA_X)} walk={t * 2}
            hop={t >= REVEAL && t < REVEAL + 0.5 ? Math.sin(prog(t, REVEAL, REVEAL + 0.5) * Math.PI) * 70 : flapping ? Math.abs(Math.sin(t * 8)) * 16 : 0}
            armL={within(t, S('your_turn'), E('sound2')) || within(t, S('s_turn'), E('s_c')) || within(t, S('stretch_go'), E('stretch_go')) ? 'up' : t >= S('bye') ? 'wave' : talks('emma') ? 'wave' : 'down'}
            armR={within(t, S('stretch_go'), E('stretch_go')) ? 'up' : t >= S('bye') ? 'wave' : 'down'} />
        )}
      </KidsStage>
      <TitleCard t={t} from={0} to={1.6} title="EMMA THE ELEPHANT" sub="helps her friend" />
      <ThinkTimer t={t} from={E('guess2') + 0.2} to={S('reveal') - 0.2} label="WHO?" />
      {(['sound1', 'sound2', 's_a', 's_b', 's_c'] as const).map((k) => (
        <PopText key={k} t={t} at={S(k)} until={E(k) + 1.0} text="PA-WOO!" y={190} size={150} color="#ff6fa5" />
      ))}
      <PopText t={t} at={E('your_turn') - 0.4} until={S('sound2') - 0.1} text="YOUR TURN!" y={190} size={120} color="#ffca3a" />
      <FactCard t={t} at={S('fact1') - 0.2} until={S('fact2') - 0.4} n={1} text="trunk = nose + hand"><TrunkIcon /></FactCard>
      <FactCard t={t} at={S('fact2') - 0.2} until={S('fact3') - 0.4} n={2} text="biggest on land!"><SizeIcon /></FactCard>
      <FactCard t={t} at={S('fact3') - 0.2} until={S('big_q') - 0.4} n={3} text="ears flap to cool"><EarIcon /></FactCard>
      <ThinkTimer t={t} from={E('big_q') + 0.2} to={S('big_a') - 0.2} label="WHO?" />
      <PopText t={t} at={S('big_a')} until={S('story') - 0.4} text="BIG & small" y={190} size={120} color="#ffca3a" />
      <PopText t={t} at={S('sad') + 0.2} until={S('think') - 0.1} text="SAD" x={1300} y={200} size={120} color="#4cc9f0" />
      <ThinkTimer t={t} from={E('think') + 0.2} to={S('bobo_try') - 0.2} label="HOW?" />
      <PopText t={t} at={S('reach')} until={S('got')} text="UP, UP, UP!" y={190} size={120} color="#8ac926" />
      <PopText t={t} at={E('stretch') - 0.3} until={S('stretch_go') - 0.1} text="YOUR TURN: STRETCH!" y={190} size={100} color="#ffca3a" />
      <PopText t={t} at={S('drink') + 5.0} until={S('bloom')} text="SPLASH!" y={190} size={140} color="#4cc9f0" />
      <PopText t={t} at={S('lesson') + 0.2} until={S('again') - 0.4} text="HELPING MAKES EVERYONE HAPPY!" y={190} size={84} color="#ffca3a" />
      {/* ── LET'S REMEMBER ── */}
      <PopText t={t} at={S('again')} until={S('s_q') - 0.3} text="LET'S REMEMBER!" y={190} size={130} color="#ffca3a" />
      <ThinkTimer t={t} from={E('s_q') + 0.2} to={S('s_a') - 0.2} label="WHAT?" />
      <PopText t={t} at={E('s_turn') - 0.4} until={S('s_b') - 0.1} text="YOUR TURN!" y={330} size={110} color="#ffca3a" />
      <ThinkTimer t={t} from={E('q1') + 0.2} to={S('a1') - 0.2} label="WHAT?" />
      <ThinkTimer t={t} from={E('q2') + 0.2} to={S('a2') - 0.2} label="WHO?" />
      <ThinkTimer t={t} from={E('q3') + 0.2} to={S('a3') - 0.2} label="WHY?" />
      <FactCard t={t} at={S('a1') - 0.2} until={S('q2') - 0.4} n={1} text="trunk = nose + hand"><TrunkIcon /></FactCard>
      <FactCard t={t} at={S('a2') - 0.2} until={S('q3') - 0.4} n={2} text="biggest on land!"><SizeIcon /></FactCard>
      <FactCard t={t} at={S('a3') - 0.2} until={S('f_turn') + 0.4} n={3} text="ears flap to cool"><EarIcon /></FactCard>
      <PopText t={t} at={E('f_turn') - 0.3} until={S('f_go') - 0.1} text="YOUR TURN: FLAP!" y={190} size={110} color="#ffca3a" />
      <ThinkTimer t={t} from={E('h_q') + 0.2} to={S('h_a1') - 0.2} label="HOW?" />
      <PopText t={t} at={S('h_a1')} until={S('h_a2')} text="THE KITE!" x={700} y={190} size={110} color="#ff595e" />
      <PopText t={t} at={S('h_a2')} until={S('l_intro') - 0.3} text="THE FLOWERS!" x={1200} y={190} size={110} color="#ff6fa5" />
      <PopText t={t} at={S('l1')} until={S('l_turn')} text="I CAN HELP MY FRIENDS!" y={190} size={100} color="#ffca3a" />
      <PopText t={t} at={E('l_turn') - 0.3} until={S('l2') - 0.1} text="YOUR TURN!" y={190} size={120} color="#ffca3a" />
      <PopText t={t} at={S('l2')} until={S('bye') - 0.3} text="I CAN HELP MY FRIENDS!" y={190} size={100} color="#ffca3a" />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
    </>
  );
}
