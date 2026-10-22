// TINY SPARKS · Day 44 · 🔢 Numbers & Math #7 — "Count the Farm Animals" (Short 9:16, 1:29)
// kids-shorts/tiny-sparks/numbers/day-044-count-the-farm-animals. Cues from VO via K (keys.gen.ts).
// First episode with the FARM (lib/kids/farm.tsx + cow/sheep/duck/chick in critter.tsx). Super Bobo knocks on the
// red barn → the doors open and 5 animals walk out one by one, each says its sound (MOO! OINK! BAA! QUACK! CHEEP!)
// then the number is said, its rainbow badge pops, the big numeral pops and Spark Girl holds up the fingers →
// "How many?" (5 s think) → FIVE → a recount → the duck waddles off for a swim (SPLASH), the chick closes the gap →
// "Now how many?" (5 s think) → 1-2-3-4, "five take away one is four" → the duck comes back: "four and one more is
// five" → yay → night-night: the animals walk back into the barn and the doors close (= frame 0, a soft loop).
// Energy layer (Short: no ident, bed from 0).
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter, type CritterSpec } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { Barn, CHICK, COW, DUCK, Fence, FarmYard, PIG, SHEEP } from '../../lib/kids/farm';
import { Confetti, FONT_TOON, KidsCaptions, PopText, RAINBOW, ThinkTimer, lipSync, useT } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { ActionStage, Dust, ImpactStar, StageWord, directorCam, hopAt, onBeat, type Shot } from '../../lib/kids/energy';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsNumbers044', durationInSeconds: 88.6, fps: 30, width: 1080, height: 1920 };

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
const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (EASE_OUT(p) - 1) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};
const pulse = (t: number, at: number, d = 0.35) => (t < at || t > at + d ? 0 : Math.sin(((t - at) / d) * Math.PI));

// ── the farmyard
const YARD_TOP = 600;
const BARN_X = 540;
const BARN_Y = 660;
const BARN_S = 0.6;
const DOOR: [number, number] = [BARN_X, BARN_Y - 4];
const ROW = 990; // the animals' feet
const X5 = (i: number) => W / 2 + (i - 2) * 210;
const X4 = (j: number) => W / 2 + (j - 1.5) * 210;
const KIDS_Y = f + 90; // the kids stand low so the row and its badges stay clear above their heads
const MILA_X = 200;
const BOBO_X = 880;

// ── the animals, in counting order (cow 1 · pig 2 · sheep 3 · duck 4 · chick 5)
type Animal = { spec: CritterSpec; sc: number; line: Key; count: Key; sound: string; color: string };
const ANIMALS: Animal[] = [
  { spec: COW, sc: 0.5, line: 'cow', count: 'c1', sound: 'MOO!', color: '#3d3247' },
  { spec: PIG, sc: 0.5, line: 'pig', count: 'c2', sound: 'OINK!', color: '#ff6fa5' },
  { spec: SHEEP, sc: 0.5, line: 'sheep', count: 'c3', sound: 'BAA!', color: '#9d4edd' },
  { spec: DUCK, sc: 0.46, line: 'duck', count: 'c4', sound: 'QUACK!', color: '#ff9f1c' },
  { spec: CHICK, sc: 0.38, line: 'chick', count: 'c5', sound: 'CHEEP!', color: '#f4a261' },
];
const DUCK_I = 3;
const CHICK_I = 4;
const WALK = 1.2;
const ENT = ANIMALS.map((a) => S(a.line) - 1.55); // leaves the door; lands ~0.35 s before its sound
const DOORS_OPEN = ENT[0] - 0.7;
// the duck goes for a swim, the chick closes the gap (4 in a row); the duck comes back to the END of the row
const DUCK_OFF: [number, number] = [E('duck_go') - 0.5, E('duck_go') + 1.0];
const GAP4: [number, number] = [E('duck_go') + 0.5, E('duck_go') + 1.3];
const DUCK_IN: [number, number] = [S('duck_back') - 1.2, S('duck_back') + 0.1];
const GAP5: [number, number] = [S('duck_back') - 1.0, S('duck_back') + 0.0];
const HOME0 = S('night') + 1.0; // back into the barn, nearest the door first
const HOME_ORDER = [2, 1, 4, 0, 3]; // sheep, pig, chick, cow, duck
const HOME = (i: number) => HOME0 + HOME_ORDER.indexOf(i) * 0.32;
const DOORS_SHUT = HOME0 + 4 * 0.32 + WALK + 0.1;
const ORDER5_AFTER = [0, 1, 2, 4, 3]; // slots after the duck is back: cow, pig, sheep, chick, duck

// slot x of animal i at time t (row layouts: 5 → 4 → 5 again)
const slotX = (i: number, t: number) => {
  const a = X5(i);
  const b = i === DUCK_I ? X5(DUCK_I) : X4([0, 1, 2, -1, 3][i]);
  const c = X5(ORDER5_AFTER.indexOf(i));
  if (t < GAP4[0]) return a;
  if (t < GAP5[0]) return i === DUCK_I ? a : a + (b - a) * EASE_INOUT(prog(t, GAP4[0], GAP4[1]));
  return b + (c - b) * EASE_INOUT(prog(t, GAP5[0], GAP5[1]));
};

type Pose = { x: number; y: number; s: number; vis: number; walking: boolean; facing: 1 | -1 };
const poseOf = (i: number, t: number): Pose => {
  const a = ANIMALS[i];
  const out = (u: number, x1: number): Pose => ({ x: DOOR[0] + (x1 - DOOR[0]) * u, y: DOOR[1] + (ROW - DOOR[1]) * u, s: a.sc * (0.55 + 0.45 * u), vis: 1, walking: u > 0 && u < 1, facing: x1 > DOOR[0] ? -1 : 1 });
  if (t < ENT[i]) return { ...out(0, X5(i)), vis: 0 };
  if (t < ENT[i] + WALK) return out(EASE_INOUT(prog(t, ENT[i], ENT[i] + WALK)), X5(i));
  if (t >= HOME(i)) {
    const u = 1 - EASE_INOUT(prog(t, HOME(i), HOME(i) + WALK));
    const x1 = slotX(i, HOME(i));
    return { ...out(u, x1), vis: u > 0.08 ? 1 : u / 0.08, walking: u > 0 && u < 1, facing: x1 > DOOR[0] ? 1 : -1 };
  }
  if (i === DUCK_I && t >= DUCK_OFF[0]) {
    if (t < DUCK_IN[0]) {
      const u = EASE_INOUT(prog(t, DUCK_OFF[0], DUCK_OFF[1]));
      return { x: X5(DUCK_I) + (1260 - X5(DUCK_I)) * u, y: ROW, s: a.sc, vis: 1, walking: u > 0 && u < 1, facing: -1 };
    }
    const u = EASE_INOUT(prog(t, DUCK_IN[0], DUCK_IN[1]));
    return { x: 1260 + (X5(4) - 1260) * u, y: ROW, s: a.sc, vis: 1, walking: u < 1, facing: 1 };
  }
  const x = slotX(i, t);
  const moving = within(t, GAP4[0], GAP4[1]) || within(t, GAP5[0], GAP5[1]);
  return { x, y: ROW, s: a.sc, vis: 1, walking: moving && Math.abs(x - slotX(i, t + 0.05)) > 0.5, facing: slotX(i, t + 0.05) >= x ? -1 : 1 };
};

// badges under the animals: first count (1..5 left→right), then the re-count after the duck leaves (1..4 + 5 = duck).
// Each pops 0.1 s BEFORE its number is said, so its pop SFX sits in the breath before the word instead of under it.
const LEAD = 0.1;
const BADGE1 = ANIMALS.map((a) => word(a.count, 0) - LEAD);
const RECOUNT = [0, 1, 2, 3, 4].map((j) => word('recount', j) - LEAD);
const A2 = [0, 1, 2, 3].map((j) => word('a2', j) - LEAD); // cow, pig, sheep, chick
const A3_FIVE = word('a3', 5) - LEAD;
const badgeOf = (i: number, t: number): { n: number; at: number } | null => {
  if (t < S('duck_go') + 0.6) return t >= BADGE1[i] ? { n: i + 1, at: BADGE1[i] } : null;
  if (t < A2[0] - 0.1) return null;
  if (t >= HOME0 - 0.2) return null;
  if (i === DUCK_I) return t >= A3_FIVE ? { n: 5, at: A3_FIVE } : null;
  const j = [0, 1, 2, -1, 3][i];
  return t >= A2[j] ? { n: j + 1, at: A2[j] } : null;
};

// ── director camera
const SHOTS: Shot[] = [
  { t: 0, z: 1.0, x: 540, y: 960, move: 'cut', push: 0.004 },
  { t: word('hook', 0) - 0.15, z: 1.25, x: BARN_X, y: 790, move: 'snap', push: 0.01 }, // knock knock
  { t: S('mila_go') - 0.1, z: 1.0, x: 540, y: 960, move: 'smooth', dur: 0.6, push: 0.004 },
  { t: E('q1') + 0.05, z: 1.12, x: 540, y: 900, move: 'smooth', dur: 1.2, push: 0.01 }, // lean in while we think
  { t: S('a1') - 0.05, z: 1.0, x: 540, y: 960, move: 'snap' },
  { t: DUCK_OFF[0], z: 1.2, x: 820, y: 900, move: 'whip' }, // follow the duck
  { t: GAP4[1] + 0.2, z: 1.0, x: 540, y: 960, move: 'smooth', dur: 0.8 },
  { t: E('q2') + 0.05, z: 1.12, x: 540, y: 900, move: 'smooth', dur: 1.2, push: 0.01 },
  { t: S('a2') - 0.05, z: 1.0, x: 540, y: 960, move: 'snap' },
  { t: DUCK_IN[0], z: 1.15, x: 760, y: 900, move: 'whip' }, // here comes the duck
  { t: S('a3') - 0.05, z: 1.0, x: 540, y: 960, move: 'smooth', dur: 0.6 },
  { t: HOME0 - 0.4, z: 1.15, x: BARN_X, y: 820, move: 'smooth', dur: 1.4 }, // back to the barn
  { t: DOORS_SHUT + 0.2, z: 1.0, x: 540, y: 960, move: 'smooth', dur: 1.0 }, // wide again = frame 0
];
const PUNCHES = [...BADGE1, word('a1', 0), word('a2', 4), A3_FIVE];

export default function KidsNumbers044() {
  const t = useT();
  const cam = directorCam(t, SHOTS, PUNCHES);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const doors = t < DOORS_SHUT ? EASE_OUT(prog(t, DOORS_OPEN, DOORS_OPEN + 0.5)) : 1 - EASE_INOUT(prog(t, DOORS_SHUT, DOORS_SHUT + 0.5));
  const think1 = within(t, E('q1'), S('a1'));
  const think2 = within(t, E('q2'), S('a2'));
  const yay = within(t, word('a1', 0), S('again')) || within(t, A3_FIVE, S('night'));

  // Spark Girl's fingers = the number on screen
  const counted = BADGE1.filter((b) => t >= b).length;
  const fingers =
    t < S('q1') ? counted
    : think1 ? 0
    : t < S('recount') ? (t >= word('a1', 0) ? 5 : 0)
    : t < E('duck_go') + 0.4 ? Math.max(1, RECOUNT.filter((b) => t >= b).length)
    : think2 || t < S('a2') ? 0
    : t < A3_FIVE ? Math.max(0, A2.filter((b) => t >= b).length)
    : t < S('yay') ? 5 : 0;
  const milaExpr: KExpr = think1 || think2 ? 'think' : yay ? 'laugh' : within(t, DUCK_OFF[0], S('q2')) ? 'surprised' : talks('mila') ? 'happy' : 'smile';
  const boboExpr: KExpr = think1 || think2 ? 'think' : yay ? 'laugh' : talks('bobo') ? 'happy' : 'smile';

  // the animals, far (near the barn) to near so the ones walking out pass behind the row
  const drawn = ANIMALS.map((a, i) => ({ a, i, p: poseOf(i, t) })).filter((d) => d.p.vis > 0).sort((u, v) => u.p.y - v.p.y);

  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
        <Meadow w={W} h={H} t={t} tree={false} rainbow={false} />
        <FarmYard w={W} h={H} top={YARD_TOP} yardY={ROW - 10} />
        <Fence x0={-20} x1={330} y={740} s={0.75} />
        <Fence x0={750} x1={1100} y={740} s={0.75} />
        <Barn x={BARN_X} y={BARN_Y} s={BARN_S} open={doors} />
        <StageWord t={t} at={word('hook', 0)} until={word('hook', 0) + 0.7} text="KNOCK!" x={BARN_X - 150} y={BARN_Y - 230} size={60} color="#ff924c" rot={-10} />
        <StageWord t={t} at={word('hook', 1)} until={word('hook', 1) + 0.8} text="KNOCK!" x={BARN_X + 160} y={BARN_Y - 180} size={60} color="#ff924c" rot={8} />

        {/* the splash where the duck went for a swim (off to the right) */}
        {within(t, DUCK_OFF[1] - 0.1, DUCK_OFF[1] + 1.1) && [0, 1, 2, 3, 4].map((k) => {
          const u = prog(t, DUCK_OFF[1] - 0.1, DUCK_OFF[1] + 1.0);
          return <circle key={k} cx={1050 - k * 22} cy={ROW - 40 - Math.sin(u * Math.PI) * (90 + k * 26)} r={14 - k} fill="#4cc9f0" opacity={1 - u} {...kst(3)} />;
        })}
        <StageWord t={t} at={DUCK_OFF[1] - 0.05} until={DUCK_OFF[1] + 1.2} text="SPLASH!" x={850} y={ROW - 360} size={64} color="#4cc9f0" rot={-8} />

        <ImpactStar t={t} at={word('a1', 0)} x={540} y={ROW - 170} s={0.9} />
        <ImpactStar t={t} at={A3_FIVE} x={X5(4)} y={ROW - 130} s={0.6} color="#4cc9f0" />
        {drawn.map(({ a, i, p }) => {
          const hop = hopAt(t, [ENT[i] + WALK - 0.08, BADGE1[i], RECOUNT[i], ...(i === DUCK_I ? [A3_FIVE] : i === CHICK_I ? [A2[3]] : i < 3 ? [A2[i]] : [])], { h: 46, air: 0.3, pre: 0.04, land: 0.16 });
          const talking = talks(a.spec.id);
          const expr: KExpr = talking ? 'laugh' : think1 || think2 ? 'smile' : 'happy';
          return (
            <g key={a.spec.id} opacity={p.vis}>
              <Critter spec={a.spec} x={p.x} y={p.y} scale={p.s} expr={expr} mouth={lipSync(VO, a.spec.id, t)} look={[0, 0.1]}
                walking={p.walking} walk={t * 2.2} facing={p.facing} hop={hop.hop} squash={hop.squash}
                armL={talking ? 'wave' : 'down'} armR={i === DUCK_I && within(t, S('duck_back'), E('duck_back')) ? 'wave' : 'down'} />
            </g>
          );
        })}
        {ANIMALS.map((a, i) => <Dust key={i} t={t} at={ENT[i] + WALK + 0.06} x={X5(i)} y={ROW} s={0.5} />)}
        {ANIMALS.map((a, i) => (
          <StageWord key={i} t={t} at={S(a.line)} until={E(a.line) + 0.8} text={a.sound} x={Math.min(900, Math.max(180, X5(i)))} y={ROW - 390} size={i === 3 || i === 4 ? 58 : 66} color={a.color === '#3d3247' ? '#ffffff' : a.color} rot={i % 2 ? 6 : -6} />
        ))}
        <StageWord t={t} at={S('duck_back')} until={E('duck_back') + 0.6} text="QUACK!" x={X5(4) - 40} y={ROW - 360} size={58} color="#ff9f1c" rot={6} />

        {/* number badges at the animals' feet (rainbow order) */}
        {ANIMALS.map((a, i) => {
          const b = badgeOf(i, t);
          if (!b) return null;
          const p = poseOf(i, t);
          const bump = 1 + 0.35 * Math.max(pulse(t, RECOUNT[i], 0.4), pulse(t, BADGE1[i], 0.4));
          return (
            <g key={i} transform={`translate(${p.x},${ROW + 56}) scale(${popIn(t, b.at) * bump})`}>
              <circle r={36} fill={RAINBOW[(b.n - 1) % RAINBOW.length]} {...kst(5)} />
              <text y={13} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill="#ffffff" stroke={KINK} strokeWidth={4} paintOrder="stroke">{b.n}</text>
            </g>
          );
        })}

        {/* the kids */}
        <Kid spec={MILA_HERO} x={MILA_X} y={KIDS_Y} scale={0.66} expr={milaExpr} mouth={lipSync(VO, 'mila', t)} look={[0.4, -0.6]}
          armL={fingers > 0 ? 'count' : think1 || think2 ? 'think' : yay || (t >= S('yay') && t < S('night')) ? 'up' : within(t, S('night'), DOORS_SHUT + 0.3) ? 'wave' : 'down'}
          armR={yay || within(t, S('yay'), S('night')) ? 'up' : within(t, S('mila_go'), E('mila_go')) ? 'present' : 'hip'}
          fingersL={Math.min(5, fingers)} hop={yay ? Math.abs(Math.sin(t * 7)) * 26 : 0} />
        <Critter spec={BOBO_HERO} x={BOBO_X} y={KIDS_Y} scale={0.68} expr={boboExpr} mouth={lipSync(VO, 'bobo', t)} look={[-0.5, -0.6]}
          armL={within(t, S('hook'), E('hook')) || within(t, S('q1'), E('q1')) || within(t, S('q2'), E('q2')) ? 'point' : within(t, S('night'), DOORS_SHUT + 0.3) ? 'wave' : yay ? 'up' : 'down'}
          armR={think1 || think2 ? 'think' : yay ? 'up' : 'down'} hop={yay ? Math.abs(Math.sin(t * 7 + 1)) * 26 : 0} />
      </ActionStage>

      {/* screen space: the ONE thing being taught */}
      <PopText t={t} at={0.4} until={DOORS_OPEN - 0.1} text="COUNT THE FARM ANIMALS!" y={250} size={80} color="#ffca3a" />
      {BADGE1.map((b, i) => <PopText key={i} t={t} at={b - 0.03} until={i < 4 ? ENT[i + 1] + 0.6 : S('q1') - 0.1} text={String(i + 1)} y={260} size={210} color={RAINBOW[i]} />)}
      <ThinkTimer t={t} from={onBeat(E('q1') + 0.1, 0)} to={S('a1') - 0.2} x={540} y={1250} r={90} label="THINK!" />
      <PopText t={t} at={word('a1', 0)} until={S('recount') - 0.1} text="5" y={260} size={230} color={RAINBOW[4]} />
      {RECOUNT.map((b, j) => <PopText key={j} t={t} at={b - 0.03} until={j < 4 ? RECOUNT[j + 1] - 0.03 : S('duck_go') - 0.1} text={String(j + 1)} y={260} size={210} color={RAINBOW[j]} />)}
      <ThinkTimer t={t} from={onBeat(E('q2') + 0.1, 0)} to={S('a2') - 0.2} x={540} y={1250} r={90} label="THINK!" />
      {A2.map((b, j) => <PopText key={j} t={t} at={b - 0.03} until={j < 3 ? A2[j + 1] - 0.03 : S('a2b') - 0.1} text={String(j + 1)} y={260} size={210} color={RAINBOW[j]} />)}
      <PopText t={t} at={S('a2b')} until={DUCK_IN[0]} text="5 − 1 = 4" y={260} size={140} color="#ffca3a" />
      <PopText t={t} at={S('a3')} until={S('yay') - 0.1} text="4 + 1 = 5" y={260} size={140} color="#4cc9f0" />
      <PopText t={t} at={S('yay')} until={S('night') - 0.1} text="GREAT COUNTING!" y={250} size={100} color="#ffca3a" />
      <Confetti t={t} at={word('a1', 0)} y={500} dur={1.6} />
      <Confetti t={t} at={A3_FIVE} y={500} dur={1.6} />
      <Confetti t={t} at={S('yay')} y={500} />
      <KidsCaptions lines={VO} t={t} colors={{ ...CAPTION_COLORS, cow: '#ffffff', pig: '#ff8fab', sheep: '#e0c3fc', duck: '#ffb703', chick: '#ffd60a' }} />
    </>
  );
}
