// TINY SPARKS · Day 36 · 📚 Moral Stories #3 — "The Greedy Little Monkey" (LONG 16:9, 5:07)
// kids-shorts/tiny-sparks/morals/day-036-the-greedy-little-monkey. Cues from VO via K (keys.gen.ts).
// The classic "hand in the nut jar" fable (Aesop's boy and the filberts — public domain), retold with our cast:
// WANT (Momo the monkey finds a jar of nuts: "I want them ALL!") → WRONG CHOICE ("No! Mine, mine, mine!" to Bella
// the bunny + Super Bobo, who feel sad) → he grabs a huge handful and his fist is STUCK in the jar (pulls, hops,
// boing) → FEELING (upset, a bit sorry) + the word GREEDY → "Can you help Momo?" → Bobo: let go of some, take
// just a few → POP, free → KIND CHOICE ("I'm sorry I was greedy. Let's share!") → nuts fly onto three leaf plates
// (one for Bella, one for Bobo, one for me ×3, count along) → picnic (carrots + honey + nuts) → what else can we
// share (toys, crayons, hugs) → MORAL "Take a little, share a lot!" → remember round (story cards + 4 questions)
// → your turn: share 6 bananas → chant ×3 → bye. 3D kit (<Vol>) for every new prop.
import React from 'react';
import { Critter, type CArm, type CritterSpec } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR } from '../../lib/kids/sets';
import { Ball, Confetti, FONT_TOON, KidsCaptions, KidsStage, PopText, ThinkTimer, TitleCard, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsMorals036', durationInSeconds: 306.6, fps: 30, width: 1920, height: 1080 };

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
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff', momo: '#ff924c', bella: '#ff8fab' };
type KF = [number, number][];
const lerpKF = (t: number, kf: KF) => {
  if (t <= kf[0][0]) return kf[0][1];
  for (let i = 1; i < kf.length; i++) {
    if (t <= kf[i][0]) {
      const [t0, v0] = kf[i - 1];
      const [t1, v1] = kf[i];
      return v0 + (v1 - v0) * EASE_INOUT((t - t0) / Math.max(1e-6, t1 - t0));
    }
  }
  return kf[kf.length - 1][1];
};
const moving = (t: number, kf: KF) => kf.some(([t1, v1], i) => i > 0 && t > kf[i - 1][0] && t < t1 && Math.abs(v1 - kf[i - 1][1]) > 4);

// ── cast
const MOMO: CritterSpec = { id: 'momo', species: 'monkey', fur: '#b5651d', fur2: '#f6d5b0', dark: '#7a3e12' };
const BELLA: CritterSpec = { id: 'bella', species: 'bunny', fur: '#ffffff', fur2: '#ffe3ec', dark: '#ff8fab', bow: '#ff6fa5' };
const SC = 0.82;
const JAR_X = 900;
const JAR_S = 0.85;

// ── timeline anchors
const GRAB = word('grab', 8) - 0.1; // "grabs"
const FREE = S('out') + 0.1; // "Pop!"
const MOMO_X: KF = [
  [0, 620], [S('grab') + 0.4, 620], [S('grab') + 1.8, 730],
  [S('hop'), 730], [S('hop') + 1.0, 520], [S('hop') + 2.0, 820], [S('hop') + 3.2, 700],
  [FREE + 0.4, 700], [FREE + 1.6, 620],
];
const BELLA_X: KF = [
  [0, 2150], [S('bella') - 1.4, 2150], [S('bella') + 0.4, 1280], [S('sad'), 1280], [S('sad') + 1.6, 1520],
  [S('kind') - 0.2, 1520], [S('kind') + 1.4, 1300],
];
const BOBO_X: KF = [
  [0, 2350], [S('bella') - 1.0, 2350], [S('bobo') + 0.2, 1580], [S('sad'), 1580], [S('sad') + 1.6, 1780],
  [S('kind') - 0.6, 1780], [S('kind') + 1.0, 1060], [FREE + 1.2, 1060], [FREE + 2.6, 1600],
];
// leaf plates (counting): Bella · Bobo · Momo
const PLATES: [number, number][] = [[1300, 200], [1600, 200], [620, 200]];
const PLATES_ON0 = S('count_go') - 0.2;
const PLATES_OFF0 = S('picnic') - 0.2;
const BAN0 = S('ban_go') + 0.4;
const BAN1 = S('chant') - 0.2;

// ── props
const Nut: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <Vol><ellipse cx={0} cy={4} rx={17} ry={20} fill="#c98f5f" {...kst(4)} /></Vol>
    <Vol><path d="M -19,-6 Q -18,-24 0,-24 Q 18,-24 19,-6 Q 0,0 -19,-6 Z" fill="#7f5539" {...kst(4)} /></Vol>
    <rect x={-2} y={-32} width={4} height={9} rx={2} fill="#7f5539" />
  </g>
);
const NUT_SLOTS: [number, number][] = [[-50, -28], [0, -26], [50, -28], [-26, -62], [26, -62], [-60, -96], [-8, -96], [44, -96], [-30, -130], [22, -132], [62, -128], [-62, -60]];
// the glass nut jar (origin = bottom centre, ~190 × 244)
const Jar: React.FC<{ n: number }> = ({ n }) => (
  <g>
    <rect x={-95} y={-190} width={190} height={190} rx={44} fill="#e3f6ff" opacity={0.55} />
    {NUT_SLOTS.slice(0, n).map(([x, y], i) => <g key={i} transform={`translate(${x},${y}) rotate(${(i * 47) % 60 - 30})`}><Nut s={1.1} /></g>)}
    <rect x={-95} y={-190} width={190} height={190} rx={44} fill="none" {...kst(7)} />
    <rect x={-52} y={-232} width={104} height={48} rx={12} fill="#e3f6ff" opacity={0.6} {...kst(6)} />
    <Vol kind="tube"><rect x={-62} y={-248} width={124} height={22} rx={9} fill="#c0874f" {...kst(5)} /></Vol>
    <rect x={-74} y={-170} width={16} height={130} rx={8} fill="#ffffff" opacity={0.6} />
    <rect x={-46} y={-224} width={10} height={30} rx={5} fill="#ffffff" opacity={0.6} />
  </g>
);
const Banana: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <Vol><path d="M -40,-18 Q -10,40 44,14 Q 54,8 50,0 Q 0,22 -30,-26 Q -38,-30 -40,-18 Z" fill="#ffd60a" {...kst(4)} /></Vol>
    <path d="M -40,-18 L -46,-30 L -36,-32 Z" fill="#6b4226" {...kst(3)} />
  </g>
);
const Plate: React.FC<{ who: string; c: string }> = ({ who, c }) => (
  <g>
    <Vol kind="slope"><path d="M -110,0 Q -100,-60 0,-62 Q 100,-60 110,0 Q 100,46 0,50 Q -100,46 -110,0 Z" fill="#52b788" {...kst(6)} /></Vol>
    <path d="M -96,0 L 96,0" stroke="#2d6a4f" strokeWidth={5} strokeLinecap="round" opacity={0.6} />
    <rect x={-70} y={52} width={140} height={44} rx={22} fill="#ffffff" {...kst(4)} />
    <text y={84} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={30} fill={c}>{who}</text>
  </g>
);
const Carrot: React.FC = () => (
  <g transform="rotate(-30)">
    <Vol><path d="M -14,-40 L 14,-40 L 0,40 Z" fill="#ff924c" {...kst(4)} /></Vol>
    <path d="M -6,-40 L -14,-62 M 0,-40 L 0,-66 M 6,-40 L 14,-62" stroke="#52b788" strokeWidth={7} strokeLinecap="round" />
  </g>
);
const HoneyPot: React.FC = () => (
  <g>
    <Vol><path d="M -44,-50 Q -60,10 -40,40 L 40,40 Q 60,10 44,-50 Z" fill="#ffca3a" {...kst(5)} /></Vol>
    <Vol kind="tube"><rect x={-50} y={-62} width={100} height={18} rx={8} fill="#c0874f" {...kst(4)} /></Vol>
    <text y={10} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={22} fill="#8d5a3b">HONEY</text>
  </g>
);

const Jungle: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <defs>
      <linearGradient id="jSky36" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8fe3c9" />
        <stop offset="1" stopColor="#e2f8ea" />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#jSky36)" />
    {Array.from({ length: 12 }).map((_, i) => (
      <Vol key={i}><circle cx={i * 180} cy={f - 40} r={130 + (i % 3) * 30} fill={i % 2 ? '#52b788' : '#40916c'} /></Vol>
    ))}
    {/* the big tree (the jar sits under it) */}
    <g>
      <Vol kind="tube"><rect x={440} y={160} width={110} height={f - 160} rx={20} fill="#8d5a3b" {...kst(7)} /></Vol>
      {[[380, 170, 150], [560, 130, 160], [700, 220, 130], [300, 260, 110]].map(([x, y, r], i) => (
        <Vol key={i}><circle cx={x} cy={y} r={r} fill={i % 2 ? '#2d9a5a' : '#38b26b'} {...kst(6)} /></Vol>
      ))}
      {[620, 760].map((x, i) => <path key={x} d={`M ${x},280 Q ${x + 10 + Math.sin(t + i) * 8},${450} ${x},${600}`} fill="none" stroke="#2d9a5a" strokeWidth={10} strokeLinecap="round" />)}
    </g>
    {/* palm on the right */}
    <g>
      <Vol kind="tube"><rect x={1790} y={240} width={70} height={f - 240} rx={20} fill="#a0673c" {...kst(6)} /></Vol>
      {[-150, -110, -60, -20, 30].map((a, i) => (
        <path key={i} d="M 0,0 Q 120,-60 230,20 Q 120,-20 0,0 Z" fill={i % 2 ? '#2d9a5a' : '#52b788'} {...kst(5)} transform={`translate(1825,240) rotate(${a + 90 + Math.sin(t * 0.8 + i) * 3})`} />
      ))}
    </g>
    <Vol kind="slope"><rect x={0} y={f} width={W} height={H - f} fill="#7cc576" /></Vol>
    <line x1={0} y1={f} x2={W} y2={f} {...kst(7)} />
    {[150, 1120, 1650].map((x, i) => (
      <g key={x} transform={`translate(${x},${f + 30 + (i % 2) * 40})`}>
        {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 12} cy={Math.sin((a * Math.PI) / 180) * 12 - 20} r={10} fill={['#ff6fa5', '#ffca3a', '#b388ff'][i]} />)}
        <circle cy={-20} r={7} fill="#ffd166" />
      </g>
    ))}
  </g>
);

// flying object along an arc from a → b during [t0, t0 + d]
const flyAt = (t: number, t0: number, a: [number, number], b: [number, number], d = 0.7): [number, number] | null => {
  if (t < t0) return null;
  const p = EASE_INOUT(Math.min(1, (t - t0) / d));
  return [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p - Math.sin(p * Math.PI) * 160];
};

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

export default function KidsMorals036() {
  const t = useT();
  const cam = camAt(t, CAM);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);

  const mx = lerpKF(t, MOMO_X);
  const bx = lerpKF(t, BELLA_X);
  const ox = lerpKF(t, BOBO_X);
  const stuck = within(t, GRAB + 0.3, FREE);
  const reaching = within(t, S('grab') + 1.8, GRAB + 0.3) || within(t, S('try'), FREE);
  const pulling = within(t, S('pull'), S('hop'));
  const hopping = within(t, S('hop'), S('upset'));
  // jar nuts: full → shared out (9 nuts leave during the count)
  const counts = ['c1', 'c2', 'c3'] as const;
  const nutTimes: { at: number; to: number }[] = counts.flatMap((k) => [2, 5, 8].map((wi, j) => ({ at: word(k, wi) - 0.05, to: j })));
  const given = nutTimes.filter((n) => t >= n.at).length;
  const jarN = Math.max(3, 12 - given);
  const plates = within(t, PLATES_ON0, PLATES_OFF0) || within(t, BAN0, BAN1);
  const banTimes = (['b1', 'b2'] as const).flatMap((k) => [2, 5, 8].map((wi, j) => ({ at: word(k, wi) - 0.05, to: j })));

  // Momo's arms, face and hops
  const momoArmR: CArm = stuck
    ? (pulling ? { a: 100 + Math.sin(t * 9) * 18 } : hopping ? { a: 140 + Math.sin(t * 6) * 10 } : { a: 115 })
    : reaching ? { a: 60 } : within(t, FREE, S('think')) ? 'hold' : talks('momo') ? 'up' : t >= S('bye') ? 'wave' : 'down';
  const momoArmL: CArm = pulling ? { a: -30 + Math.sin(t * 9) * 10 } : within(t, S('want'), E('want')) ? 'up' : within(t, S('no'), E('no')) ? 'hug' : within(t, S('picnic'), S('moral')) || chantOn(t) ? 'wave' : t >= S('bye') ? 'wave' : 'down';
  const momoExpr: KExpr =
    within(t, S('want'), E('want')) ? 'wow'
    : within(t, S('no'), E('no')) ? 'proud'
    : within(t, GRAB + 0.3, S('pull')) ? 'surprised'
    : within(t, S('pull'), S('feel')) ? 'oops'
    : within(t, S('feel'), S('kind')) ? 'sad'
    : within(t, S('but'), E('but')) ? 'think'
    : within(t, S('try'), FREE) ? 'think'
    : within(t, FREE, S('think')) ? 'laugh'
    : within(t, S('think'), S('sorry') + 1.0) ? 'sad'
    : within(t, S('a1'), S('a1') + 0.01) ? 'smile'
    : talks('momo') ? 'happy' : t >= S('yay') ? 'laugh' : 'smile';
  const momoHop = hopping ? Math.abs(Math.sin((t - S('hop')) * 6)) * 70 : within(t, FREE, FREE + 1.2) ? Math.abs(Math.sin((t - FREE) * 8)) * 40 : within(t, S('hi'), E('hi')) ? Math.abs(Math.sin(t * 7)) * 26 : 0;
  const friendsSad = within(t, S('no') + 0.6, S('kind'));
  const friendExpr = (who: string): KExpr => (friendsSad ? 'sad' : within(t, S('stuck'), S('kind')) ? 'surprised' : talks(who) ? 'happy' : t >= S('yay') ? 'laugh' : 'smile');
  const holdingNuts = within(t, FREE, S('think'));
  const jarInHand = stuck;
  const jarFront = reaching && !stuck;

  const groundJar = !jarInHand && (
    <g transform={`translate(${JAR_X},${f}) scale(${JAR_S})`}>
      <Jar n={jarN} />
    </g>
  );

  return (
    <>
      <KidsStage cam={cam}>
        <Jungle t={t} />
        {/* the picnic blanket */}
        {t >= S('picnic') && t < S('rem') - 0.3 && (
          <g transform={`translate(1000,${f + 30}) scale(${EASE_OUT(prog(t, S('picnic'), S('picnic') + 0.6))})`}>
            <Vol kind="slope"><ellipse rx={260} ry={46} fill="#ff6fa5" {...kst(6)} /></Vol>
            {[-180, -90, 0, 90, 180].map((x) => <rect key={x} x={x - 20} y={-40} width={40} height={80} fill="#ffffff" opacity={0.35} />)}
            {t >= word('picnic', 3) && <g transform="translate(-130,-30) scale(0.8)"><Carrot /><g transform="translate(40,10)"><Carrot /></g></g>}
            {t >= word('picnic', 9) && <g transform="translate(130,-36) scale(0.75)"><HoneyPot /></g>}
            {[-30, 0, 30].map((x) => <g key={x} transform={`translate(${x},-24) scale(0.8)`}><Nut /></g>)}
          </g>
        )}
        {!jarFront && groundJar}
        <Critter spec={BELLA} x={bx} y={f} scale={SC * 0.95} expr={friendExpr('bella')} look={[-0.6, -0.1]} mouth={lipSync(VO, 'bella', t)}
          walking={moving(t, BELLA_X)} walk={t * 2} facing={-1}
          armL={talks('bella') ? 'up' : chantOn(t) || t >= S('bye') ? 'wave' : within(t, S('s3'), S('moral')) ? 'hug' : 'down'} armR={within(t, S('s3'), S('moral')) ? 'hug' : 'down'}
          hop={within(t, S('yay'), E('yay') + 0.3) ? Math.abs(Math.sin(t * 7)) * 30 : 0} squash={friendsSad ? 0.08 : 0} />
        <Critter spec={BOBO_HERO} x={ox} y={f} scale={SC} expr={friendExpr('bobo')} look={[-0.6, -0.1]} mouth={lipSync(VO, 'bobo', t)}
          walking={moving(t, BOBO_X)} walk={t * 2}
          armL={within(t, S('tip'), E('tip')) ? 'point' : chantOn(t) || t >= S('bye') ? 'wave' : within(t, S('s3'), S('moral')) ? 'hug' : 'down'}
          armR={talks('bobo') ? 'up' : within(t, S('s3'), S('moral')) ? 'hug' : 'down'}
          hop={within(t, S('even'), E('even')) ? Math.abs(Math.sin(t * 7)) * 30 : 0} squash={friendsSad ? 0.08 : 0} />
        <Critter spec={MOMO} x={mx} y={f} scale={SC} expr={momoExpr} look={within(t, S('jar'), S('bella')) || reaching ? [0.8, 0.4] : [0.4, -0.1]}
          mouth={lipSync(VO, 'momo', t)} walking={moving(t, MOMO_X) && !hopping} walk={t * 2}
          armR={momoArmR} armL={momoArmL}
          holdR={jarInHand ? <g transform={`scale(${JAR_S / SC}) translate(0,${180})`}><Jar n={12} /></g> : holdingNuts ? <g transform="scale(1.4)">{[-20, 0, 20].map((x) => <g key={x} transform={`translate(${x},${-Math.abs(x) * 0.4})`}><Nut /></g>)}</g> : undefined}
          hop={momoHop} tilt={pulling ? Math.sin(t * 9) * 8 : 0} />
        {jarFront && groundJar}
        {/* nuts / bananas flying to the plates */}
        {plates && (
          <g>
            {PLATES.map(([x, y], j) => {
              const isBan = t >= BAN0 - 0.2;
              const list = isBan ? banTimes : nutTimes;
              const mine = list.filter((n) => n.to === j && t >= n.at + 0.7).length;
              return (
                <g key={j} transform={`translate(${x},${y}) scale(${EASE_OUT(prog(t, (isBan ? BAN0 : PLATES_ON0) + j * 0.1, (isBan ? BAN0 : PLATES_ON0) + 0.4 + j * 0.1))})`}>
                  <Plate who={['BELLA', 'BOBO', 'MOMO'][j]} c={['#ff6fa5', '#e63946', '#b5651d'][j]} />
                  {Array.from({ length: mine }).map((_, k) => (
                    <g key={k} transform={`translate(${(k - (mine - 1) / 2) * 52},-22)`}>{isBan ? <Banana s={0.9} /> : <Nut s={1.2} />}</g>
                  ))}
                  {mine > 0 && within(t, isBan ? BAN0 : PLATES_ON0, isBan ? BAN1 : PLATES_OFF0) && (
                    <g transform="translate(96,-60)">
                      <circle r={26} fill="#ffca3a" {...kst(4)} />
                      <text y={11} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={32} fill={KINK}>{mine}</text>
                    </g>
                  )}
                </g>
              );
            })}
            {(t >= BAN0 - 0.2 ? banTimes : nutTimes).map((n, i) => {
              const from: [number, number] = t >= BAN0 - 0.2 ? [960, 150] : [JAR_X, f - 210];
              const p = flyAt(t, n.at, from, [PLATES[n.to][0], PLATES[n.to][1] - 22]);
              if (!p || t > n.at + 0.7) return null;
              return <g key={i} transform={`translate(${p[0]},${p[1]})`}>{t >= BAN0 - 0.2 ? <Banana /> : <Nut s={1.2} />}</g>;
            })}
            {/* the banana bunch shrinks as they're shared */}
            {within(t, BAN0, BAN1) && (
              <g transform="translate(960,150)">
                {Array.from({ length: Math.max(0, 6 - banTimes.filter((n) => t >= n.at).length) }).map((_, k) => (
                  <g key={k} transform={`rotate(${(k - 2.5) * 14}) translate(0,10)`}><Banana s={1.1} /></g>
                ))}
              </g>
            )}
          </g>
        )}
        {/* what else can we share: toys, crayons, hugs */}
        {within(t, S('s1') - 0.1, S('moral')) && (
          <g>
            <g transform={`translate(640,250) scale(${EASE_OUT(prog(t, S('s1'), S('s1') + 0.4))})`}><Ball r={70} /></g>
            {t >= S('s2') && (
              <g transform={`translate(960,250) scale(${EASE_OUT(prog(t, S('s2'), S('s2') + 0.4))})`}>
                {['#ff595e', '#1d72d8', '#ffca3a', '#52b788'].map((c, k) => (
                  <g key={c} transform={`translate(${(k - 1.5) * 44},0) rotate(${(k - 1.5) * 8})`}>
                    <Vol kind="tube"><rect x={-14} y={-70} width={28} height={130} rx={8} fill={c} {...kst(4)} /></Vol>
                    <path d="M -14,-70 L 0,-100 L 14,-70 Z" fill={c} {...kst(4)} />
                  </g>
                ))}
              </g>
            )}
            {t >= S('s3') && [0, 1, 2].map((k) => {
              const p = ((t - S('s3')) * 0.6 + k / 3) % 1;
              return <path key={k} d="M 0,24 C -44,-4 -36,-36 -14,-36 C -4,-36 0,-26 0,-18 C 0,-26 4,-36 14,-36 C 36,-36 44,-4 0,24 Z" transform={`translate(${1280 + (k - 1) * 60},${280 - p * 120}) scale(${1.4 + p * 0.4})`} fill="#ff6fa5" {...kst(3)} opacity={1 - p * 0.8} />;
            })}
          </g>
        )}
        {/* remember: 3 story cards */}
        {within(t, S('rem1') - 0.2, S('q1') - 0.3) && (['rem1', 'rem2', 'rem3'] as const).map((k, i) => {
          if (t < S(k) - 0.1) return null;
          return (
            <g key={k} transform={`translate(${560 + i * 400},210) scale(${0.82 * EASE_OUT(prog(t, S(k) - 0.1, S(k) + 0.35))})`}>
              <rect x={-170} y={-160} width={340} height={320} rx={40} fill="#ffffff" {...kst(8)} />
              <circle cx={-150} cy={-140} r={32} fill={['#ff924c', '#ff595e', '#52b788'][i]} {...kst(5)} />
              <text x={-150} y={-128} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={36} fill="#ffffff">{i + 1}</text>
              <g transform="translate(0,10)">
                {i === 0 && <g><g transform="translate(-40,90) scale(0.55)"><Jar n={12} /></g><text x={70} y={0} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={46} fill="#ff595e">MINE!</text></g>}
                {i === 1 && <g><g transform="translate(0,100) scale(0.55)"><Jar n={12} /></g><Vol kind="tube"><rect x={-16} y={-120} width={32} height={110} rx={14} fill="#b5651d" {...kst(5)} /></Vol><text x={0} y={-130} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={34} fill={KINK}>STUCK!</text></g>}
                {i === 2 && [-80, 0, 80].map((x) => <g key={x} transform={`translate(${x},20) scale(0.6)`}><Nut s={1.4} /><g transform="translate(0,40)"><Nut s={1.4} /></g></g>)}
              </g>
              <text y={130} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={36} fill={KINK}>{['wanted it all', 'took too many', 'said sorry + shared'][i]}</text>
            </g>
          );
        })}
      </KidsStage>
      <TitleCard t={t} from={0} to={1.4} title="THE GREEDY MONKEY" sub="a story about sharing" />
      <PopText t={t} at={word('want', 6)} until={S('bella') - 0.2} text="ALL MINE!" y={240} size={120} color="#ff924c" />
      <PopText t={t} at={S('sad') + 0.3} until={S('sad_q') - 0.1} text="SAD..." y={240} size={110} color="#a0c4ff" />
      <ThinkTimer t={t} from={E('sad_q') + 0.1} to={S('grab') - 0.2} x={1740} y={210} r={90} label="THINK!" />
      <PopText t={t} at={S('stuck') + 0.3} until={S('pull') - 0.1} text="STUCK!" y={240} size={150} color="#ff595e" />
      <PopText t={t} at={word('pull', 1)} until={S('hop') - 0.1} text="PULL! PULL!" y={240} size={110} color="#ffca3a" />
      {[0, 1, 2].map((k) => (
        <PopText key={k} t={t} at={word('hop', 9 + k)} until={k < 2 ? word('hop', 10 + k) : S('upset')} text="BOING!" x={760 + (k - 1) * 260} y={260 + (k % 2) * 50} size={100} color="#ffca3a" rot={(k - 1) * 8} />
      ))}
      <PopText t={t} at={S('feel') + 0.3} until={S('word') - 0.1} text="UPSET" y={240} size={120} color="#a0c4ff" />
      <PopText t={t} at={word('word', 2)} until={E('word') + 0.6} text="GREEDY" y={210} size={130} color="#ff924c" />
      <PopText t={t} at={word('word', 3)} until={E('word') + 0.6} text="= wanting everything just for you" y={330} size={56} color="#ffffff" rot={0} />
      <ThinkTimer t={t} from={E('ask') + 0.1} to={S('kind') - 0.2} x={1740} y={210} r={90} label="HOW?" />
      <PopText t={t} at={word('tip', 9)} until={S('but') - 0.1} text="JUST A FEW!" y={240} size={120} color="#52b788" />
      <PopText t={t} at={FREE} until={S('think') - 0.1} text="POP!" y={240} size={160} color="#ff6fa5" />
      <PopText t={t} at={word('sorry', 0)} until={S('yay') - 0.1} text="I'M SORRY" y={240} size={120} color="#ffffff" />
      <PopText t={t} at={S('even') + 0.2} until={S('picnic') - 0.2} text="3 EACH!" y={180} size={110} color="#ffca3a" />
      {[0, 1, 2].map((k) => (
        <PopText key={k} t={t} at={word('c_turn', 5 + k)} until={k < 2 ? word('c_turn', 6 + k) : S('even')} text={String(k + 1)} y={180} size={150} color={['#ff595e', '#ffca3a', '#4cc9f0'][k]} />
      ))}
      <PopText t={t} at={S('picnic') + 0.5} until={S('happy') - 0.1} text="PICNIC TIME!" y={240} size={120} color="#ff6fa5" />
      <ThinkTimer t={t} from={E('share_q') + 0.1} to={S('s1') - 0.1} x={1740} y={210} r={90} label="THINK!" />
      <PopText t={t} at={S('moral')} until={S('rem') - 0.3} text="TAKE A LITTLE, SHARE A LOT!" y={260} size={96} color="#ffca3a" />
      <PopText t={t} at={S('rem')} until={S('rem1') - 0.2} text="LET'S REMEMBER!" y={240} size={110} color="#ffca3a" />
      {(['q1', 'q2', 'q3', 'q4'] as const).map((q, k) => {
        const a = (['a1', 'a2', 'a3', 'a4'] as const)[k];
        return <ThinkTimer key={q} t={t} from={E(q) + 0.1} to={S(a) - 0.1} x={1740} y={210} r={90} label="THINK!" />;
      })}
      <PopText t={t} at={S('a1')} until={S('q2') - 0.1} text="TOO MANY NUTS!" y={240} size={110} color="#ff924c" />
      <PopText t={t} at={S('a2')} until={S('q3') - 0.1} text="SAD" y={240} size={130} color="#a0c4ff" />
      <PopText t={t} at={S('a3')} until={S('q4') - 0.1} text="HAPPY!" y={240} size={130} color="#ffca3a" />
      <PopText t={t} at={S('a4')} until={S('ban_go') - 0.1} text="I'M SORRY!" y={240} size={120} color="#ff6fa5" />
      <PopText t={t} at={S('ban_go') + 0.2} until={BAN0 + 0.6} text="YOUR TURN!" y={420} size={110} color="#ffffff" />
      <ThinkTimer t={t} from={E('ban_ask') + 0.1} to={S('ban_a') - 0.1} x={1740} y={210} r={90} label="HOW MANY?" />
      <PopText t={t} at={S('ban_a')} until={S('chant') - 0.1} text="2 EACH!" y={460} size={120} color="#ffca3a" />
      <PopText t={t} at={S('ch1')} until={S('ch_turn') - 0.1} text="TAKE A LITTLE, SHARE A LOT!" y={260} size={96} color="#ffca3a" />
      <PopText t={t} at={E('ch_turn') + 0.1} until={S('ch2') - 0.1} text="YOUR TURN!" y={260} size={120} color="#ffffff" />
      <PopText t={t} at={S('ch3')} until={S('bye') - 0.1} text="TAKE A LITTLE, SHARE A LOT!" y={260} size={96} color="#52b788" />
      <PopText t={t} at={S('bye')} text="SEE YOU NEXT TIME!" y={260} size={100} color="#ffca3a" />
      <Confetti t={t} at={FREE} x={840} y={500} dur={1.2} />
      <Confetti t={t} at={S('even')} y={400} />
      <Confetti t={t} at={S('moral')} y={400} />
      <Confetti t={t} at={S('bye')} y={400} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
    </>
  );
}

function chantOn(t: number) {
  return (['ch1', 'ch2', 'ch3'] as const).some((k) => within(t, S(k), E(k)));
}
