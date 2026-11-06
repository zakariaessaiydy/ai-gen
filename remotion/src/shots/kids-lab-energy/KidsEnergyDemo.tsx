// TINY SPARKS · ENERGY DEMO (lab, 16:9) — Day 36's "Momo stuck in the jar" scene (KidsMorals036 25.6–67.6 s)
// re-staged with the ENERGY layer (lib/kids/energy.tsx) for a before/after: the channel ident on the jingle,
// a director camera (whip pans, snap zooms, zoom punches, shakes, slow push-ins), reactions over heads
// (! ? rain clouds, sweat, steam), squash-and-stretch hops with dust, motion + strain lines, comic words in
// the world, a star iris to end. SAME story + words as the original, tighter gaps, livelier voices.
// kids-shorts/tiny-sparks/lab/energy-demo. Cues from VO via K (keys.gen.ts).
import React from 'react';
import { Critter, type CArm, type CritterSpec } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR } from '../../lib/kids/sets';
import { KidsCaptions, PopText, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { kst, type KExpr } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import {
  ActionStage, Dust, FocusLines, ImpactStar, MotionLines, Reaction, SparksIntro, StageWord, StarWipe, StrainLines,
  directorCam, hopAt, shakeOf, type Hit, type Shot,
} from '../../lib/kids/energy';
import { EASE_INOUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsEnergyDemo', durationInSeconds: 41.4, fps: 30, width: 1920, height: 1080 };

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
const bump = (t: number, at: number, d: number) => (t < at || t > at + d ? 0 : Math.sin(((t - at) / d) * Math.PI));

// ── cast (same specs as Day 36)
const MOMO: CritterSpec = { id: 'momo', species: 'monkey', fur: '#b5651d', fur2: '#f6d5b0', dark: '#7a3e12' };
const BELLA: CritterSpec = { id: 'bella', species: 'bunny', fur: '#ffffff', fur2: '#ffe3ec', dark: '#ff8fab', bow: '#ff6fa5' };
const SC = 0.82;
const JAR_X = 900;
const JAR_S = 0.85;
// stage position of a Critter's RIGHT hand for arm angle A (deg) — to aim FX at the jar
const handAt = (x: number, A: number, hop = 0): [number, number] => {
  const r = (A * Math.PI) / 180;
  return [x + (96 + 140 * Math.sin(r)) * SC, f - hop * SC + (-250 + 140 * Math.cos(r)) * SC];
};

// ── timeline anchors (all from the real word times)
const NO = word('no', 0);
const MINE = [word('no', 4), word('no', 5), word('no', 6)];
const SAD_W = word('sad', 4);
const SIT = word('sad', 6);
const Q = S('sad_q');
const QE = E('sad_q');
const INTO = word('grab', 4);
const GRABS = word('grab', 8);
const LIFT = E('grab') + 0.3; // he tries to take his hand out… the jar comes too
const HUH = S('stuck');
const STUCK = word('stuck', 4);
const PULLS = [word('pull', 1), word('pull', 3), word('pull', 5)];
const P2 = S('pull2');
const HOPS = [word('hop', 1), word('hop', 1) + 0.75, word('hop', 1) + 1.5]; // travel hops ("He hops around…")
const BOINGS = [word('hop', 9), word('hop', 10), word('hop', 11)];
const HELP = S('upset');
const SLUMP = E('upset') + 0.25; // the sad trombone (wah-wah-wah-waaah: notes every 0.47 s)
const WAH = [0, 0.47, 0.94, 1.41].map((d) => SLUMP + d);
const IRIS = 40.25;
const BIG_HOP = { h: 210, air: 0.5, pre: 0.1, land: 0.26 };
const STOMP = { h: 34, air: 0.17, pre: 0.05, land: 0.12 };
const TRAVEL = { h: 150, air: 0.5, pre: 0.08, land: 0.17 };
const BOING = { h: 95, air: 0.26, pre: 0.04, land: 0.05 };

const MOMO_X: KF = [
  [0, 780], [NO, 780], [NO + BIG_HOP.air, 1060], // the big hop over the jar, to block his friends
  [Q - 0.2, 1060], [QE + 0.3, 720], // turns away and walks back to his jar during the question
  [INTO - 0.6, 720], [INTO, 745],
  [HOPS[0], 745], [HOPS[0] + TRAVEL.air, 560], [HOPS[1], 560], [HOPS[1] + TRAVEL.air, 980], [HOPS[2], 980], [HOPS[2] + TRAVEL.air, 770],
];
const BELLA_X: KF = [[0, 1400], [SIT - 0.2, 1400], [SIT + 1.2, 1570]];
const BOBO_X: KF = [[0, 1690], [SIT - 0.1, 1690], [SIT + 1.3, 1800]];

// ── director camera
const SHOTS: Shot[] = [
  { t: 0, z: 1.55, x: 880, y: 590, move: 'cut', push: 0.012 }, // under the ident: Momo hugging the jar
  { t: NO - 0.05, z: 1.35, x: 990, y: 560, move: 'smooth', dur: 0.4, push: 0.015 }, // follow the hop over the jar
  { t: E('no') + 0.12, z: 1.45, x: 1330, y: 540, move: 'whip', push: 0.01 }, // whip → the friends
  { t: Q - 0.35, z: 1.8, x: 1450, y: 590, move: 'smooth', dur: 1.3, push: 0.02 }, // "How would YOU feel?" push in
  { t: S('grab') - 0.3, z: 1.7, x: 830, y: 620, move: 'whip', push: 0.015 }, // whip back to Momo + the jar
  { t: GRABS - 0.06, z: 2.15, x: 840, y: 650, move: 'snap', push: 0.02 }, // "grabs!" punch-in
  { t: HUH - 0.15, z: 1.85, x: 800, y: 600, move: 'smooth', dur: 0.5 }, // "Huh?"
  { t: STUCK - 0.05, z: 2.5, x: 790, y: 560, move: 'snap' }, // "STUCK!" snap zoom
  { t: S('pull') - 0.2, z: 1.7, x: 780, y: 610, move: 'smooth', dur: 0.45 }, // pulls
  { t: P2 - 0.05, z: 1.7, x: 790, y: 600, move: 'smooth', dur: 0.4, push: 0.06 }, // won't come out: creeping push
  { t: S('hop') - 0.1, z: 1.2, x: 860, y: 560, move: 'smooth', dur: 0.6 }, // hops around: wide
  { t: BOINGS[0] - 0.12, z: 1.5, x: 800, y: 590, move: 'snap' }, // boing boing boing
  { t: HELP - 0.06, z: 2.1, x: 800, y: 575, move: 'snap', push: 0.03 }, // "Help!"
  { t: SLUMP, z: 2.15, x: 790, y: 575, move: 'smooth', dur: 2.6, push: 0.035 }, // slump + sad trombone
];
const PUNCHES = [NO + BIG_HOP.air, ...MINE.map((m) => m + 0.06), ...PULLS.map((p) => p + 0.12), ...BOINGS.map((b) => b + 0.26), ...WAH.slice(0, 3)];
const HITS: Hit[] = [
  { at: NO + BIG_HOP.air, amp: 12, dur: 0.3 },
  { at: STUCK, amp: 16, dur: 0.42 },
  ...PULLS.map((p) => ({ at: p + 0.12, amp: 7, dur: 0.25 })),
  ...HOPS.map((h) => ({ at: h + TRAVEL.air, amp: 9, dur: 0.25 })),
];

// ── props (same as Day 36)
const Nut: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <Vol><ellipse cx={0} cy={4} rx={17} ry={20} fill="#c98f5f" {...kst(4)} /></Vol>
    <Vol><path d="M -19,-6 Q -18,-24 0,-24 Q 18,-24 19,-6 Q 0,0 -19,-6 Z" fill="#7f5539" {...kst(4)} /></Vol>
    <rect x={-2} y={-32} width={4} height={9} rx={2} fill="#7f5539" />
  </g>
);
const NUT_SLOTS: [number, number][] = [[-50, -28], [0, -26], [50, -28], [-26, -62], [26, -62], [-60, -96], [-8, -96], [44, -96], [-30, -130], [22, -132], [62, -128], [-62, -60]];
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

const Jungle: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <defs>
      <linearGradient id="jSkyE" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8fe3c9" />
        <stop offset="1" stopColor="#e2f8ea" />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#jSkyE)" />
    {Array.from({ length: 12 }).map((_, i) => (
      <Vol key={i}><circle cx={i * 180} cy={f - 40} r={130 + (i % 3) * 30} fill={i % 2 ? '#52b788' : '#40916c'} /></Vol>
    ))}
    <g>
      <Vol kind="tube"><rect x={440} y={160} width={110} height={f - 160} rx={20} fill="#8d5a3b" {...kst(7)} /></Vol>
      {[[380, 170, 150], [560, 130, 160], [700, 220, 130], [300, 260, 110]].map(([x, y, r], i) => (
        <Vol key={i}><circle cx={x} cy={y} r={r} fill={i % 2 ? '#2d9a5a' : '#38b26b'} {...kst(6)} /></Vol>
      ))}
      {[620, 760].map((x, i) => <path key={x} d={`M ${x},280 Q ${x + 10 + Math.sin(t + i) * 8},${450} ${x},${600}`} fill="none" stroke="#2d9a5a" strokeWidth={10} strokeLinecap="round" />)}
    </g>
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

export default function KidsEnergyDemo() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const shake = shakeOf(t, HITS);

  const mx = lerpKF(t, MOMO_X);
  const bx = lerpKF(t, BELLA_X);
  const ox = lerpKF(t, BOBO_X);

  // Momo's body: the big hop, the "mine" stomps, travel hops, boings — squash and stretch throughout
  const hops = [
    hopAt(t, [NO], BIG_HOP), hopAt(t, MINE, STOMP), hopAt(t, HOPS, TRAVEL), hopAt(t, BOINGS, BOING),
  ].find((h) => h.hop > 0 || h.squash !== 0) ?? { hop: 0, squash: 0, inAir: false };
  const yank = Math.max(...PULLS.map((p) => bump(t, p - 0.02, 0.5)));
  const slump = within(t, SLUMP, 1e9) ? 0.35 + 0.12 * Math.max(...WAH.map((w) => bump(t, w, 0.3))) : 0;
  const deflate = within(t, SAD_W, S('grab')) ? 0.6 * prog(t, SAD_W, SAD_W + 0.4) : 0;

  const reaching = within(t, INTO - 0.5, LIFT);
  const jarInHand = t >= LIFT;
  const holding = within(t, LIFT, LIFT + 0.4) ? 60 + 55 * EASE_INOUT(prog(t, LIFT, LIFT + 0.4)) : 115;
  const momoA =
    reaching ? 14 + 46 * EASE_INOUT(prog(t, INTO - 0.5, INTO))
    : !jarInHand ? 0
    : within(t, STUCK, STUCK + 0.5) ? 115 + 30 * bump(t, STUCK, 0.5)
    : within(t, S('pull') - 0.2, P2) ? 100 + 30 * yank
    : within(t, P2, S('hop') - 0.1) ? 115 + Math.sin(t * 14) * 16
    : within(t, S('hop') - 0.1, HELP) ? 140 + Math.sin(t * 6) * 10
    : within(t, HELP, SLUMP) ? 150 + Math.sin(t * 10) * 15
    : t >= SLUMP ? 115 - 50 * EASE_INOUT(prog(t, SLUMP, SLUMP + 1.6))
    : holding;
  const blocking = within(t, NO + BIG_HOP.air - 0.05, E('no') + 0.1);
  const stompArm = 105 + 35 * Math.max(...MINE.map((m) => bump(t, m - 0.05, 0.3)));
  const momoArmR: CArm =
    t < NO ? 'hug'
    : within(t, NO, NO + BIG_HOP.air) ? 'up'
    : blocking ? { a: stompArm }
    : within(t, E('no') + 0.1, Q - 0.2) ? 'hug'
    : reaching || jarInHand ? { a: momoA }
    : 'down';
  const momoArmL: CArm =
    t < NO ? 'hug'
    : within(t, NO, NO + BIG_HOP.air) ? 'up'
    : blocking ? { a: stompArm }
    : within(t, E('no') + 0.1, Q - 0.2) ? 'hug'
    : within(t, S('pull') - 0.2, P2) ? { a: -30 + 22 * yank }
    : within(t, HELP, SLUMP) ? 'wave'
    : 'down';
  const momoExpr: KExpr =
    t < NO ? 'happy'
    : within(t, NO, E('no') + 0.1) ? 'proud'
    : within(t, E('no') + 0.1, Q - 0.2) ? 'proud'
    : within(t, Q - 0.2, INTO - 0.6) ? 'smile'
    : within(t, INTO - 0.6, GRABS) ? 'wow'
    : within(t, GRABS, LIFT + 0.2) ? 'happy'
    : within(t, LIFT + 0.2, STUCK) ? 'surprised'
    : within(t, STUCK, SLUMP) ? 'oops'
    : 'sad';
  const momoLook: [number, number] =
    t < NO ? [0.6, 0.4]
    : blocking ? [0.8, 0]
    : within(t, SAD_W - 0.3, QE) ? [0.7, 0.1]
    : reaching ? [0.8, 0.5]
    : within(t, LIFT, STUCK) ? [0.9, 0.2]
    : t >= SLUMP ? [0, 0.15]
    : [0.4, -0.1];
  const momoTilt = -12 * yank + (within(t, P2, S('hop') - 0.1) ? Math.sin(t * 14) * 4 : 0);

  const friendsSad = within(t, SAD_W - 0.2, S('grab'));
  const friendExpr = (who: string): KExpr =>
    friendsSad ? 'sad' : within(t, NO + 0.1, SAD_W - 0.2) ? 'surprised' : within(t, HUH, 1e9) ? 'surprised' : talksAt(who, t) ? 'happy' : 'smile';
  const friendLook: [number, number] = within(t, Q - 0.2, S('grab')) ? [-0.1, 0.15] : [-0.6, -0.1];

  const jarFront = reaching;
  const groundJar = !jarInHand && (
    <g transform={`translate(${JAR_X},${f}) scale(${JAR_S})`}>
      <Jar n={12} />
    </g>
  );
  const momoHop = hops.hop;
  const momoX = mx - 38 * yank;
  const [hx, hy] = handAt(momoX, momoA, momoHop);

  return (
    <>
      <ActionStage cam={cam} shake={shake} blur={cam.blur}>
        <Jungle t={t} />
        {!jarFront && groundJar}
        {/* the friends */}
        <Critter spec={BELLA} x={bx} y={f} scale={SC * 0.95} expr={friendExpr('bella')} look={friendLook}
          walking={moving(t, BELLA_X)} walk={t * 2} facing={-1} armL="down" armR="down" squash={deflate} />
        <Critter spec={BOBO_HERO} x={ox} y={f} scale={SC} expr={friendExpr('bobo')} look={friendLook}
          walking={moving(t, BOBO_X)} walk={t * 2} armL="down" armR="down" squash={deflate} />
        {/* the impact burst sits BEHIND the jar */}
        <ImpactStar t={t} at={STUCK} x={hx} y={hy + 40} s={1.15} />
        <Critter spec={MOMO} x={momoX} y={f} scale={SC} expr={momoExpr} look={momoLook}
          mouth={lipSync(VO, 'momo', t)} walking={moving(t, MOMO_X) && !hops.inAir && momoHop === 0} walk={t * 2}
          armR={momoArmR} armL={momoArmL}
          holdR={jarInHand ? <g transform={`scale(${JAR_S / SC}) translate(0,${180})`}><Jar n={12} /></g> : undefined}
          hop={momoHop} squash={hops.squash - 0.5 * yank + slump} tilt={momoTilt} />
        {jarFront && groundJar}

        {/* action FX in the world */}
        <MotionLines t={t} from={NO} to={NO + BIG_HOP.air} x={mx} y={f - momoHop - 300} dir={-25} n={4} len={110} spread={46} />
        {HOPS.map((h, i) => (
          <MotionLines key={i} t={t} from={h} to={h + TRAVEL.air} x={mx} y={f - momoHop - 280} dir={i === 1 ? 0 : 180} n={3} len={100} spread={50} />
        ))}
        <Dust t={t} at={NO + BIG_HOP.air} x={1060} y={f} s={1.1} />
        {MINE.map((m, i) => <Dust key={i} t={t} at={m + STOMP.air} x={1060} y={f} s={0.6} />)}
        {HOPS.map((h, i) => <Dust key={i} t={t} at={h + TRAVEL.air} x={[560, 980, 770][i]} y={f} s={0.95} />)}
        {BOINGS.map((b, i) => <Dust key={i} t={t} at={b + BOING.air} x={770} y={f} s={0.75} />)}
        {PULLS.map((p, i) => <StrainLines key={i} t={t} from={p} to={p + 0.5} x={hx} y={hy + 50} r={120} />)}

        {/* reactions */}
        <Reaction kind="!" t={t} at={NO + 0.12} until={E('no') - 0.2} x={bx - 10} y={330} s={0.75} />
        <Reaction kind="!" t={t} at={NO + 0.2} until={E('no') - 0.2} x={ox} y={392} s={0.75} />
        <Reaction kind="cloud" t={t} at={SAD_W} until={Q + 0.3} x={bx} y={262} s={0.8} />
        <Reaction kind="cloud" t={t} at={SAD_W + 0.15} until={Q + 0.3} x={ox} y={318} s={0.8} />
        <Reaction kind="?" t={t} at={HUH} until={STUCK - 0.05} x={mx + 165} y={480} s={0.6} />
        <Reaction kind="!" t={t} at={STUCK} until={STUCK + 1.1} x={mx - 175} y={525} s={0.6} />
        <Reaction kind="sweat" t={t} at={P2} until={E('pull2') + 0.6} x={mx - 105} y={490} s={0.9} />
        <Reaction kind="steam" t={t} at={HELP + 0.25} until={E('upset')} x={mx} y={520} s={0.9} />
        <Reaction kind="cloud" t={t} at={WAH[1]} until={1e9} x={mx} y={448} s={0.55} />

        {/* comic words in the world */}
        {MINE.map((m, i) => (
          <StageWord key={i} t={t} at={m} until={i < 2 ? MINE[i + 1] : E('no') + 0.1} text="MINE!" x={[860, 1020, 1180][i]} y={[390, 320, 390][i]} size={82} color="#ff924c" rot={[-10, 0, 10][i]} />
        ))}
        {PULLS.map((p, i) => (
          <StageWord key={i} t={t} at={p} until={i < 2 ? PULLS[i + 1] : P2 - 0.05} text="PULL!" x={[580, 1020, 600][i]} y={[420, 390, 440][i]} size={86} color="#ffca3a" rot={[-12, 10, -6][i]} />
        ))}
        {BOINGS.map((b, i) => (
          <StageWord key={i} t={t} at={b} until={i < 2 ? BOINGS[i + 1] + 0.12 : HELP - 0.1} text="BOING!" x={[560, 780, 1000][i]} y={[410, 350, 410][i]} size={84} color="#ffca3a" rot={[-12, 0, 12][i]} />
        ))}
        <StageWord t={t} at={HELP} until={SLUMP} text="HELP!" x={1010} y={380} size={92} color="#ff595e" rot={8} />
      </ActionStage>

      {/* screen-space */}
      <FocusLines t={t} from={STUCK - 0.05} to={STUCK + 1.15} x={W / 2} y={H * 0.48} r={H * 0.36} />
      <PopText t={t} at={STUCK + 0.05} until={S('pull') - 0.15} text="STUCK!" x={1440} y={230} size={140} color="#ff595e" rot={6} />
      <ThinkTimer t={t} from={QE + 0.1} to={S('grab') - 0.35} x={300} y={230} r={95} label="THINK!" />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
      <SparksIntro t={t} at={0} cast={{ kids: [MILA_HERO, LEO_HERO], buddy: BOBO_HERO }} />
      <StarWipe t={t} at={IRIS} dur={0.45} hold={5} color="#3b2a4a" x={W / 2 - 20} y={H * 0.44} />
    </>
  );
}

function talksAt(who: string, t: number) {
  return VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
}
