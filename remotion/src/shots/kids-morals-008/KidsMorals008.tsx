// TINY SPARKS · Day 8 · 📚 Moral Stories #1 — "The Boy Who Always Told the Truth" (LONG 16:9)
// kids-shorts/tiny-sparks/morals/day-008-the-boy-who-always-told-the-truth. Cues from VO via K.
// WANT (Leo loves ball; Mila's sunflower) → WRONG CHOICE (one little kick inside → the pot breaks;
// Bobo: "say the wind did it?") → FEELING (wobbly tummy = GUILTY, close-up) → CHOICE ("What should Leo
// do?" think timer) → TRUTH ("it was me, I'm sorry") → FIX together (blue bucket) → MORAL "Telling the
// truth feels good." → LET'S REMEMBER (3 cards, feelings quiz with close-ups, say-it-with-me) → bye.
import React from 'react';
import { Kid, kidFaceAt } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO, CAPTION_COLORS, LEO, MILA } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Sun } from '../../lib/kids/sets';
import { Ball, FONT_TOON, KidsCaptions, KidsStage, PopText, ThinkTimer, TitleCard, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { EASE_INOUT, EASE_OUT, prog } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsMorals008', durationInSeconds: 177.3, fps: 30, width: 1920, height: 1080 };

const W = 1920;
const H = 1080;
const f = FLOOR(H);
type Key = keyof typeof K;
const S = (k: Key) => VO[K[k]].start;
const E = (k: Key) => VO[K[k]].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff' };

const BOBO_X = 300;
const LEO_X = 640;
const MILA_HOME = 1500;
const TABLE_X = 1180;
const TABLE_TOP = f - 190;
const KID_S = 0.8;
const [lfx, lfy] = kidFaceAt(LEO_X, f, KID_S);
const [mfx, mfy] = kidFaceAt(MILA_HOME, f, KID_S);

const KICK = E('bobo_care') + 0.25; // the ball leaves Leo's foot
const HIT = KICK + 0.6; // …and hits the pot
const FIXED = S('fix') + 1.6; // the bucket appears
const TITLE_END = 1.6;

// Mila walks out after "I'll be right back!" and comes back on "I'm back!"
const milaX = (t: number) => {
  const out = EASE_INOUT(prog(t, E('mila_go') + 0.3, E('mila_go') + 1.9));
  const back = EASE_INOUT(prog(t, S('mila_back') - 1.8, S('mila_back') - 0.1));
  return MILA_HOME + (2250 - MILA_HOME) * (out - back);
};

const closeOn = (x: number, y: number, z = 1.45): Omit<CamKey, 't'> => ({ z, x, y: y + 70 });
const WIDE = { z: 1, x: W / 2, y: H / 2 };
const shot = (a: number, b: number, c: Omit<CamKey, 't'>): CamKey[] => [
  { t: a, ...WIDE },
  { t: a, ...c, cut: true },
  { t: b, ...c },
  { t: b, ...WIDE, cut: true },
];
const CAM: CamKey[] = [
  { t: 0, ...WIDE },
  ...shot(S('tummy') - 0.3, E('leo_think') + 0.8, closeOn(lfx, lfy)),
  ...shot(S('mila_sad') - 0.2, E('mila_sad') + 1.0, closeOn(mfx, mfy)),
  ...shot(S('truth') - 0.3, E('truth') + 0.8, closeOn(lfx, lfy, 1.35)),
  ...shot(S('quiz1') - 0.2, S('quiz2') - 0.4, closeOn(mfx, mfy)),
  ...shot(S('quiz2') - 0.2, S('say') - 0.4, closeOn(lfx, lfy)),
];

const Sunflower: React.FC<{ t: number; rot?: number }> = ({ t, rot = 0 }) => (
  <g transform={`rotate(${rot + Math.sin(t * 1.5) * 2})`}>
    <path d="M 0,0 Q 8,-90 0,-190" fill="none" stroke="#4f9d2f" strokeWidth={14} strokeLinecap="round" />
    <path d="M 2,-80 Q 50,-110 70,-80 Q 40,-62 2,-80 Z" fill="#6cc551" {...kst(5)} />
    <g transform="translate(0,-200)">
      {Array.from({ length: 12 }).map((_, i) => (
        <ellipse key={i} cx={0} cy={-46} rx={18} ry={32} fill="#ffca3a" {...kst(4)} transform={`rotate(${i * 30})`} />
      ))}
      <circle r={36} fill="#8d5a3b" {...kst(5)} />
      <circle cx={-12} cy={-6} r={5} fill={KINK} />
      <circle cx={12} cy={-6} r={5} fill={KINK} />
      <path d="M -12,10 Q 0,20 12,10" fill="none" {...kst(4)} />
    </g>
  </g>
);

const Pot: React.FC = () => (
  <g>
    <path d="M -70,-110 L 70,-110 L 52,0 L -52,0 Z" fill="#e07a3f" {...kst(6)} />
    <rect x={-80} y={-130} width={160} height={30} rx={8} fill="#f08c4f" {...kst(6)} />
  </g>
);

const Bucket: React.FC = () => (
  <g>
    <path d="M -80,-120 L 80,-120 L 62,0 L -62,0 Z" fill="#4cc9f0" {...kst(6)} />
    <path d="M -80,-120 Q 0,-210 80,-120" fill="none" {...kst(6)} />
    <rect x={-84} y={-128} width={168} height={22} rx={8} fill="#1982c4" {...kst(5)} />
  </g>
);

const LivingRoom: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect width={W} height={f} fill="#ffe8d6" />
    <rect y={f - 150} width={W} height={150} fill="#ffd8be" />
    <line x1={0} y1={f - 150} x2={W} y2={f - 150} {...kst(5)} />
    {/* window with a sunny sky */}
    <g transform="translate(1380,130)">
      <rect width={420} height={330} rx={20} fill="#9ad8ff" {...kst(7)} />
      <g transform="translate(300,100) scale(0.55)"><Sun x={0} y={0} t={t} /></g>
      <ellipse cx={130} cy={210} rx={80} ry={34} fill="#ffffff" />
      <line x1={210} y1={0} x2={210} y2={330} {...kst(6)} />
      <line x1={0} y1={165} x2={420} y2={165} {...kst(6)} />
    </g>
    {/* a framed drawing of a sun and a house */}
    <g transform="translate(330,170)">
      <rect width={250} height={190} rx={12} fill="#ffffff" {...kst(7)} />
      <path d="M 60,150 L 60,100 L 110,60 L 160,100 L 160,150 Z" fill="#ff8fab" {...kst(4)} />
      <circle cx={200} cy={50} r={22} fill="#ffd166" {...kst(4)} />
    </g>
    <rect x={0} y={f} width={W} height={H - f} fill="#c98f5f" />
    <line x1={0} y1={f} x2={W} y2={f} {...kst(7)} />
    <ellipse cx={760} cy={f + 60} rx={520} ry={70} fill="#ff8fab" opacity={0.75} {...kst(5)} />
    {/* little table */}
    <g transform={`translate(${TABLE_X},${f})`}>
      <rect x={-130} y={-200} width={260} height={30} rx={10} fill="#a0673c" {...kst(6)} />
      <rect x={-110} y={-170} width={24} height={170} fill="#a0673c" {...kst(5)} />
      <rect x={86} y={-170} width={24} height={170} fill="#a0673c" {...kst(5)} />
    </g>
  </g>
);

// the ball: bounced by Leo, then at his foot, then kicked into the pot, then resting on the floor
const ballAt = (t: number): [number, number, number] => {
  const foot: [number, number] = [LEO_X + 120, f - 42];
  if (t < S('rule')) return [foot[0], foot[1] - Math.abs(Math.sin(t * 3.2)) * 150, t * 120];
  if (t < KICK) return [foot[0], foot[1], 0];
  if (t < HIT) {
    const p = prog(t, KICK, HIT);
    return [foot[0] + (TABLE_X - 30 - foot[0]) * p, foot[1] + (TABLE_TOP - 80 - foot[1]) * p - Math.sin(p * Math.PI) * 220, p * 720];
  }
  const p = EASE_OUT(prog(t, HIT, HIT + 0.9));
  return [TABLE_X - 30 + 260 * p, TABLE_TOP - 80 + (f - 42 - TABLE_TOP + 80) * p - Math.sin(p * Math.PI) * 120, 720 + p * 360];
};

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

export default function KidsMorals008() {
  const t = useT();
  const cam = camAt(t, CAM);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const broken = t >= HIT && t < FIXED;
  const fixed = t >= FIXED;
  const [bx, by, brot] = ballAt(t);
  const showBall = t < S('fix');
  const mx = milaX(t);
  const milaWalking = (t > E('mila_go') + 0.3 && t < E('mila_go') + 1.9) || (t > S('mila_back') - 1.8 && t < S('mila_back') - 0.1);
  const recap = within(t, S('rem1') - 0.2, S('quiz1') - 0.4);

  const leoExpr: KExpr =
    t < S('leo_kick') ? 'happy'
    : t < HIT ? 'laugh'
    : t < S('leo_oh') ? 'surprised'
    : t < S('bobo_whisper') ? 'oops'
    : t < S('tummy') ? 'think'
    : t < S('leo_think') ? 'oops'
    : t < S('mila_back') ? 'think'
    : t < S('truth') ? 'oops'
    : t < S('mila_thanks') ? 'sad'
    : t < S('leo_feel') ? 'happy'
    : within(t, S('quiz2') - 0.2, S('say')) ? 'proud'
    : 'laugh';
  const milaExpr: KExpr =
    t < S('mila_back') ? 'happy'
    : t < S('mila_sad') ? 'surprised'
    : t < S('mila_thanks') ? 'sad'
    : within(t, S('quiz1') - 0.2, S('quiz2') - 0.4) ? 'sad'
    : t < S('mila_yes') ? 'smile'
    : 'happy';
  const boboExpr: KExpr =
    within(t, S('bobo_care'), S('bobo_whisper')) ? 'surprised'
    : within(t, S('bobo_whisper'), S('tummy')) ? 'think'
    : within(t, S('mila_back'), S('mila_thanks')) ? 'oops'
    : talks('bobo') ? 'laugh'
    : 'happy';
  const wobble = within(t, S('tummy'), E('feeling') + 0.6) ? Math.sin(t * 9) * 3 : 0;

  return (
    <>
      <KidsStage cam={cam}>
        <LivingRoom t={t} />
        {/* the pot + sunflower on the table → broken on the floor → the new blue bucket */}
        {!broken && !fixed && (
          <g transform={`translate(${TABLE_X},${TABLE_TOP})`}><Pot /><g transform="translate(0,-110)"><Sunflower t={t} /></g></g>
        )}
        {broken && (
          <g>
            {[[-90, 10, -30], [-20, 22, 50], [60, 8, 110], [130, 18, -70]].map(([dx, dy, r], i) => (
              <path key={i} d="M -30,-20 L 30,-14 L 18,20 L -24,16 Z" fill="#e07a3f" {...kst(5)}
                transform={`translate(${TABLE_X + dx * EASE_OUT(prog(t, HIT, HIT + 0.5))},${f - 20 + dy}) rotate(${r})`} />
            ))}
            <ellipse cx={TABLE_X - 10} cy={f - 6} rx={90} ry={22} fill="#7a4a2a" {...kst(5)} />
            <g transform={`translate(${TABLE_X - 40},${f - 20})`}><Sunflower t={0} rot={-78 * EASE_OUT(prog(t, HIT, HIT + 0.5))} /></g>
          </g>
        )}
        {fixed && (
          <g transform={`translate(${TABLE_X},${TABLE_TOP}) scale(${EASE_OUT(prog(t, FIXED, FIXED + 0.5))})`}>
            <Bucket /><g transform="translate(0,-120)"><Sunflower t={t} /></g>
          </g>
        )}
        {within(t, HIT, HIT + 0.5) && (
          <g transform={`translate(${TABLE_X},${TABLE_TOP - 90}) scale(${EASE_OUT(prog(t, HIT, HIT + 0.3))})`} opacity={1 - prog(t, HIT + 0.2, HIT + 0.5)}>
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={i} x1={0} y1={-60} x2={0} y2={-120} {...kst(10)} transform={`rotate(${i * 45})`} />
            ))}
          </g>
        )}
        {showBall && <g transform={`translate(${bx},${by})`}><Ball r={42} rot={brot} /></g>}

        <Critter spec={BOBO} x={BOBO_X} y={f} scale={0.68} expr={boboExpr} look={[0.6, -0.1]} mouth={lipSync(VO, 'bobo', t)}
          armL={within(t, S('bobo_whisper'), E('bobo_whisper')) ? 'think' : t >= S('bye') ? 'wave' : talks('bobo') ? 'up' : 'down'}
          armR={t >= S('bye') ? 'wave' : within(t, S('bobo_care'), E('bobo_care')) ? 'point' : 'down'} />
        <Kid spec={LEO} x={LEO_X} y={f} scale={KID_S} expr={leoExpr} look={t < S('mila_back') ? [0.6, 0] : [0.7, -0.1]} mouth={lipSync(VO, 'leo', t)}
          tilt={wobble}
          armL={t >= S('bye') ? 'wave' : within(t, S('tummy'), E('feeling') + 0.6) ? 'hug' : within(t, S('truth'), E('truth')) ? 'down' : within(t, S('leo_feel'), E('leo_feel')) || within(t, S('say2'), E('say2')) ? 'up' : 'down'}
          armR={t >= S('bye') ? 'wave' : within(t, S('leo_think'), E('leo_think')) ? 'think' : within(t, S('leo_fix'), E('leo_fix')) ? 'present' : within(t, S('leo_feel'), E('leo_feel')) || within(t, S('say2'), E('say2')) ? 'up' : 'hip'} />
        <Kid spec={MILA} x={mx} y={f} scale={KID_S} expr={milaExpr} look={t < S('mila_go') ? [-0.6, -0.4] : [-0.7, -0.1]} mouth={lipSync(VO, 'mila', t)}
          legs={milaWalking ? 'walk' : 'stand'} walk={t * 2}
          armL={t >= S('bye') ? 'wave' : within(t, S('mila_love'), E('mila_love')) ? 'present' : within(t, S('mila_sad'), S('truth')) ? 'hug' : within(t, S('mila_thanks'), E('mila_thanks')) ? 'hug' : 'down'}
          armR={t >= S('bye') ? 'wave' : within(t, S('mila_go'), E('mila_go')) ? 'wave' : within(t, S('mila_yes'), E('mila_yes')) ? 'up' : 'hip'} />

        {/* the wobbly-tummy swirl (the guilty feeling) */}
        {within(t, S('tummy') + 0.3, E('feeling') + 0.6) && (
          <g transform={`translate(${LEO_X},${lfy + 230}) rotate(${t * 200}) scale(${EASE_OUT(prog(t, S('tummy') + 0.3, S('tummy') + 0.8))})`}>
            <path d="M 0,0 m -6,0 a 6,6 0 1,1 12,0 a 14,14 0 1,1 -28,0 a 22,22 0 1,1 44,0" fill="none" stroke="#8ac926" strokeWidth={7} strokeLinecap="round" />
          </g>
        )}

        {/* LET'S REMEMBER: the story in 3 cards */}
        {recap && (
          <g>
            <RecapCard t={t} at={S('rem1') - 0.1} until={S('quiz1') - 0.4} x={660} n={1} label="the ball broke it">
              <g transform="translate(-40,40)"><Pot /></g>
              <g transform="translate(70,-60)"><Ball r={34} /></g>
            </RecapCard>
            <RecapCard t={t} at={S('rem2') - 0.1} until={S('quiz1') - 0.4} x={960} n={2} label="Leo told the truth">
              <rect x={-120} y={-100} width={240} height={130} rx={50} fill="#4cc9f0" {...kst(6)} />
              <path d="M -30,28 L -60,80 L 10,28 Z" fill="#4cc9f0" {...kst(6)} />
              <text y={-16} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={42} fill="#ffffff">It was me.</text>
            </RecapCard>
            <RecapCard t={t} at={S('rem3') - 0.1} until={S('quiz1') - 0.4} x={1260} n={3} label="fixed together!">
              <g transform="translate(0,90) scale(0.7)"><Bucket /><g transform="translate(0,-120)"><Sunflower t={t} /></g></g>
            </RecapCard>
          </g>
        )}
      </KidsStage>
      <TitleCard t={t} from={0} to={TITLE_END} title="TELL THE TRUTH" sub="a Tiny Sparks story" />
      <PopText t={t} at={S('rule') + 1.0} until={S('leo_kick') - 0.2} text="NO BALLS INSIDE!" y={170} size={110} color="#ff595e" />
      <PopText t={t} at={S('feeling') + 2.0} until={S('leo_think') - 0.2} text="GUILTY" y={170} size={140} color="#8ac926" />
      <ThinkTimer t={t} from={E('ask') + 0.1} to={S('truth') - 0.2} label="WHAT?" />
      <PopText t={t} at={S('truth') + 2.6} until={S('mila_thanks') - 0.2} text="SORRY!" y={170} size={130} color="#4cc9f0" />
      <PopText t={t} at={S('moral') + 0.2} until={S('rem') - 0.4} text="TELLING THE TRUTH FEELS GOOD!" y={190} size={86} color="#ffca3a" />
      <PopText t={t} at={S('rem')} until={S('rem1') - 0.3} text="LET'S REMEMBER!" y={170} size={120} color="#ffca3a" />
      <ThinkTimer t={t} from={E('quiz1') + 0.1} to={S('quiz1_a') - 0.2} label="HOW?" />
      <PopText t={t} at={S('quiz1_a')} until={S('quiz2') - 0.4} text="SAD" y={170} size={150} color="#4cc9f0" />
      <ThinkTimer t={t} from={E('quiz2') + 0.1} to={S('quiz2_a') - 0.2} label="HOW?" />
      <PopText t={t} at={S('quiz2_a')} until={S('say') - 0.4} text="HAPPY & PROUD!" y={170} size={120} color="#ffca3a" />
      <PopText t={t} at={S('say1')} until={S('ask_you') - 0.3} text="TELLING THE TRUTH FEELS GOOD!" y={190} size={86} color="#ffca3a" />
      <PopText t={t} at={E('turn') + 0.1} until={S('say2') - 0.1} text="YOUR TURN!" y={330} size={120} color="#ff924c" />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
    </>
  );
}
