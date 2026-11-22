// TINY SPARKS · Day 32 · 🦁 Animal Stories #5 — "Sammy the Turtle Learns Patience" (LONG 16:9, 5:07)
// kids-shorts/tiny-sparks/animals/day-032-sammy-the-turtle-learns-patience. Cues from VO via K (keys.gen.ts).
// First episode with the new TURTLE species (critter.tsx: shell dome + plastron, `tuck` hides the head).
// GUESS WHO (a shell peeks over a bush) → meet Sammy + Super Bobo → turtles are quiet → HIDE IN YOUR SHELL (your
// turn) → 3 FACTS (shell = part of its body · no teeth, a beak · some live 100+ years) → walk slow (your turn) →
// STORY: plant a strawberry seed → "Where are my strawberries?" → tap tap tap → digs the seed up (oops) →
// impatient → 3 WAITING TRICKS (deep breath with a breathing guide · do something fun · say "I can wait!") →
// replant → days pass (day/night, rain, count 1–5) → sprout · leaves · flower · green berry ("deep breath") · RED
// → share → "Good things take time" → LET'S REMEMBER (5 timers + breathing) → chant ×3 → tip + bye.
import React from 'react';
import { Critter, type CritterSpec } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { Ball, Confetti, FONT_TOON, KidsCaptions, KidsStage, PopText, ThinkTimer, TitleCard, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsAnimals032', durationInSeconds: 307.3, fps: 30, width: 1920, height: 1080 };

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
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff', sammy: '#a7c957' };
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
const moving = (t: number, kf: KF) => kf.some(([t1, v1], i) => i > 0 && t > kf[i - 1][0] && t < t1 && v1 !== kf[i - 1][1]);
const mixHex = (a: string, b: string, p: number) => {
  const ca = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const cb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + ca.map((v, i) => Math.round(v + (cb[i] - v) * Math.max(0, Math.min(1, p))).toString(16).padStart(2, '0')).join('');
};

const SAMMY: CritterSpec = { id: 'sammy', species: 'turtle', fur: '#a7c957', fur2: '#fde68a', dark: '#4f772d', scarf: '#ff924c' };
const PATCH = 1010;
const BUSH_X = 960;
const SAMMY_X: KF = [[0, BUSH_X], [S('bobo_hi') - 0.2, BUSH_X], [S('bobo_hi') + 1.4, 700], [S('slow') + 1.2, 700], [E('slow_a'), 500], [S('story') + 0.4, 500], [S('story') + 2.6, 700]];
const BOBO_X0 = 1330;

// ── props
const Bush: React.FC<{ s: number }> = ({ s }) => (
  <g transform={`translate(${BUSH_X},${f}) scale(${s})`}>
    {[[-120, -70, 90], [-40, -130, 110], [70, -120, 105], [140, -60, 80], [0, -50, 100]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? '#52b788' : '#40916c'} {...kst(7)} />)}
    {[[-60, -150], [60, -80], [-110, -40]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={12} fill="#ff6fa5" {...kst(4)} />)}
  </g>
);
const ShellPeek: React.FC<{ t: number }> = ({ t }) => (
  <g transform={`translate(${BUSH_X + 10},${f - 215 + Math.sin(t * 3) * 6})`}>
    <path d="M -110,30 Q -110,-70 0,-76 Q 110,-70 110,30 Z" fill="#4f772d" {...kst(7)} />
    {[-60, 0, 60].map((x) => <path key={x} d={`M ${x - 26},-10 L ${x},-32 L ${x + 26},-10 L ${x + 18},18 L ${x - 18},18 Z`} fill="none" stroke={KINK} strokeWidth={4} opacity={0.45} />)}
  </g>
);
const Can: React.FC = () => (
  <g transform="scale(0.9)">
    <path d="M -40,-30 L 40,-30 L 34,40 L -34,40 Z" fill="#4cc9f0" {...kst(6)} />
    <path d="M 36,-14 L 86,-40 L 92,-30 L 40,4 Z" fill="#4cc9f0" {...kst(5)} />
    <path d="M -30,-30 Q 0,-70 30,-30" fill="none" {...kst(6)} />
  </g>
);
const Strawberry: React.FC<{ c?: string; s?: number }> = ({ c = '#e63946', s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M 0,60 C -55,30 -60,-30 -30,-40 C -15,-45 -5,-40 0,-35 C 5,-40 15,-45 30,-40 C 60,-30 55,30 0,60 Z" fill={c} {...kst(5)} />
    {[[-20, -15], [0, -20], [20, -15], [-25, 10], [-5, 5], [15, 10], [-10, 30], [10, 30]].map(([x, y], k) => <ellipse key={k} cx={x} cy={y} rx={3} ry={5} fill="#ffe066" />)}
    <path d="M -25,-40 L -10,-55 L 0,-42 L 10,-55 L 25,-40 Q 0,-33 -25,-40 Z" fill="#52b788" {...kst(4)} />
  </g>
);
// the strawberry plant: stage 0 (seed underground) → 1 sprout → 2 leaves → 3 flower → 4 green berry; red 0..1
const Plant: React.FC<{ stage: number; red: number; picked: boolean; t: number }> = ({ stage, red, picked, t }) => {
  if (stage <= 0.02) return null;
  const h = 40 + Math.min(1, stage) * 40 + Math.max(0, Math.min(1, stage - 1)) * 70;
  const sw = Math.sin(t * 1.5) * 3;
  return (
    <g transform={`translate(${PATCH},${f - 18}) scale(1.7) rotate(${sw})`}>
      <path d={`M 0,0 Q 6,${-h * 0.5} 0,${-h}`} fill="none" stroke="#2d6a4f" strokeWidth={10} strokeLinecap="round" />
      {[-1, 1].map((k) => (
        <path key={k} d={`M 0,${-h * 0.75} q ${k * 30},-30 ${k * 56},-10 q ${-k * 20},26 ${-k * 56},10 Z`} fill="#52b788" {...kst(4)} transform={`scale(${Math.min(1, stage)})`} />
      ))}
      {stage > 1 && [-1, 1].map((k) => (
        <g key={k} transform={`translate(0,${-h * 0.4}) scale(${Math.min(1, stage - 1)})`}>
          <path d={`M 0,0 q ${k * 50},-46 ${k * 92},-14 q ${-k * 30},40 ${-k * 92},14 Z`} fill="#40916c" {...kst(4)} />
        </g>
      ))}
      {stage > 2 && stage < 4.2 && (
        <g transform={`translate(0,${-h}) scale(${Math.min(1, stage - 2) * (stage > 3.6 ? 1 - (stage - 3.6) / 0.6 : 1)})`}>
          {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 20} cy={Math.sin((a * Math.PI) / 180) * 20} r={16} fill="#ffffff" {...kst(4)} />)}
          <circle r={12} fill="#ffd166" {...kst(4)} />
        </g>
      )}
      {stage >= 4 && !picked && (
        <g transform={`translate(18,${-h + 40}) scale(${Math.min(1, (stage - 4) * 3 + 0.3) * (0.55 + red * 0.25)})`}>
          <Strawberry c={mixHex('#95d5b2', '#e63946', red)} />
        </g>
      )}
    </g>
  );
};
const FactCard: React.FC<{ t: number; at: number; until: number; n: number; text: string; children?: React.ReactNode }> = ({ t, at, until, n, text, children }) => {
  if (t < at || t >= until) return null;
  const s = EASE_OUT(prog(t, at, at + 0.4));
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <g transform={`translate(${W / 2},172) scale(${s * 0.85})`}>
        <rect x={-500} y={-150} width={1000} height={300} rx={40} fill="#ffffff" {...kst(9)} />
        <circle cx={-440} cy={-150} r={52} fill="#52b788" {...kst(7)} />
        <text x={-440} y={-132} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={56} fill="#ffffff">{n}</text>
        <g transform="translate(-320,10) scale(2)">{children}</g>
        <text x={120} y={26} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={56} fill={KINK}>{text}</text>
      </g>
    </svg>
  );
};
const ShellIcon = () => (
  <g>
    <path d="M -60,20 Q -60,-50 0,-54 Q 60,-50 60,20 Z" fill="#4f772d" {...kst(4)} />
    {[-28, 0, 28].map((x) => <path key={x} d={`M ${x - 12},-8 L ${x},-20 L ${x + 12},-8 L ${x + 8},8 L ${x - 8},8 Z`} fill="none" stroke={KINK} strokeWidth={2.5} opacity={0.5} />)}
    <path d="M -10,-54 L 0,-74 L 10,-54" fill="#ff595e" {...kst(3)} />
  </g>
);
const BeakIcon = () => (
  <g>
    <circle cx={-6} cy={0} r={40} fill="#a7c957" {...kst(4)} />
    <circle cx={6} cy={-12} r={8} fill={KINK} />
    <path d="M 26,4 L 52,10 L 28,22 Z" fill="#e9c46a" {...kst(3)} />
    <path d="M 40,-34 L 58,-16 M 58,-34 L 40,-16" stroke="#ff595e" strokeWidth={6} strokeLinecap="round" />
  </g>
);
const CakeIcon = () => (
  <g>
    <rect x={-50} y={-10} width={100} height={50} rx={8} fill="#ff8fab" {...kst(4)} />
    <rect x={-50} y={-10} width={100} height={14} fill="#ffffff" opacity={0.7} />
    {[-25, 0, 25].map((x) => <g key={x}><rect x={x - 4} y={-36} width={8} height={26} fill="#4cc9f0" {...kst(2)} /><path d={`M ${x},-38 q -6,-8 0,-16 q 6,8 0,16`} fill="#ffca3a" /></g>)}
    <text y={64} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={24} fill={KINK}>100+</text>
  </g>
);
// trick icons (the strip at the top)
const BreatheIcon = () => (
  <g>
    {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={-18 + Math.cos((a * Math.PI) / 180) * 12} cy={-6 + Math.sin((a * Math.PI) / 180) * 12} r={10} fill="#ff6fa5" {...kst(3)} />)}
    <circle cx={-18} cy={-6} r={7} fill="#ffd166" />
    <rect x={16} y={-6} width={16} height={34} rx={4} fill="#ffffff" {...kst(3)} />
    <path d="M 24,-8 q -6,-10 0,-18 q 6,8 0,18" fill="#ff924c" />
  </g>
);
const PlayIcon = () => (
  <g>
    <circle cx={-14} cy={6} r={20} fill="#ff595e" {...kst(3)} />
    <path d="M 16,14 L 16,-24 L 36,-28 L 36,8" fill="none" {...kst(5)} />
    <ellipse cx={10} cy={14} rx={8} ry={6} fill={KINK} />
    <ellipse cx={30} cy={8} rx={8} ry={6} fill={KINK} />
  </g>
);
const WaitIcon = () => (
  <g>
    <circle r={28} fill="#ffd166" {...kst(4)} />
    <path d="M 0,-16 L 0,0 L 12,8" fill="none" {...kst(4)} />
  </g>
);

// breathing guide: a soft bubble that grows (breathe in, 2 s) and shrinks (breathe out, 2 s)
const BreathGuide: React.FC<{ t: number; from: number; to: number }> = ({ t, from, to }) => {
  if (t < from || t >= to) return null;
  const p = t - from;
  const inP = Math.min(1, p / 2);
  const r = p < 2 ? 70 + EASE_INOUT(inP) * 130 : 200 - EASE_INOUT(Math.min(1, (p - 2) / 2)) * 130;
  const label = p < 2 ? 'BREATHE IN...' : 'AND OUT!';
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <g transform={`translate(${W / 2},380) scale(${EASE_OUT(prog(t, from, from + 0.3))})`}>
        <circle r={r} fill="#4cc9f0" opacity={0.45} /><circle r={r} fill="none" stroke="#ffffff" strokeWidth={12} /><circle r={r + 8} fill="none" stroke={KINK} strokeWidth={5} opacity={0.6} />
        <text y={20} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={56} fill="#ffffff" stroke={KINK} strokeWidth={8} paintOrder="stroke">{label}</text>
      </g>
    </svg>
  );
};

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

export default function KidsAnimals032() {
  const t = useT();
  const cam = camAt(t, CAM);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);

  // reveal
  const revealed = t >= S('reveal') - 0.2;
  const bushS = 1 - EASE_INOUT(prog(t, S('reveal') - 0.2, S('reveal') + 0.6));
  const sx = lerpKF(t, SAMMY_X);
  // hide in the shell (and again in the remember round)
  const tuck = Math.max(
    EASE_INOUT(prog(t, word('hide', 7) - 0.1, word('hide', 7) + 0.5)) * (1 - EASE_OUT(prog(t, S('peek') - 0.1, S('peek') + 0.35))),
    EASE_INOUT(prog(t, S('r_hide_a') + 0.6, S('r_hide_a') + 1.0)) * (1 - EASE_OUT(prog(t, E('r_hide_a') + 0.6, E('r_hide_a') + 1.0))),
  );
  // soil + seed
  const seedDrop = word('plant', 5);
  const planted = t >= seedDrop + 0.4;
  const dug = within(t, word('oops', 4), S('replant') + 1.4);
  const seedUp = dug;
  // plant growth
  const stage = t < S('sprout') - 0.6 ? 0
    : t < word('leaves', 1) ? EASE_OUT(prog(t, S('sprout') - 0.6, S('sprout') + 0.2))
    : t < word('leaves', 5) ? 1 + EASE_OUT(prog(t, word('leaves', 1), word('leaves', 1) + 0.6))
    : t < S('green') - 0.4 ? 2 + EASE_OUT(prog(t, word('leaves', 5), word('leaves', 5) + 0.6))
    : 3.6 + 0.4 * EASE_OUT(prog(t, S('green') - 0.4, S('green') + 0.4)) + 0.4;
  const red = EASE_INOUT(prog(t, word('red', 4) - 0.2, word('red', 4) + 0.8));
  const picked = t >= S('ready') + 1.0;
  // days passing: night pulses (2 during "days", one per counted number)
  const pulse = (c: number, w = 0.6) => Math.max(0, 1 - Math.abs(t - c) / w);
  let night = Math.max(pulse(S('days') + 0.9, 0.7), pulse(S('days') + 2.4, 0.7));
  for (let k = 0; k < 5; k++) night = Math.max(night, pulse(word('count', 7 + k) + 0.3, 0.35));
  const rain = within(t, word('days', 7) - 0.2, S('count'));

  // Bobo
  const bx = BOBO_X0;
  const watering = within(t, S('water'), E('water') + 0.6);
  // Sammy's mood
  const sammyExpr: KExpr =
    !revealed ? 'smile'
    : within(t, S('reveal'), E('hello')) ? 'laugh'
    : within(t, S('sound_a'), E('sound_a')) ? 'wink'
    : tuck > 0.5 ? 'happy'
    : within(t, S('now'), S('cant')) ? 'think'
    : within(t, S('oops'), S('sad')) ? 'oops'
    : within(t, S('sad'), S('tricks')) ? 'sad'
    : within(t, S('t1_turn'), S('t1_do')) || within(t, E('r_breath'), S('r_breath_a')) ? 'sleepy'
    : within(t, S('green'), S('red')) ? 'think'
    : within(t, S('red'), E('yum') + 1) ? 'wow'
    : talks('sammy') ? 'happy'
    : 'smile';
  const playing = within(t, S('t2_do'), E('t2_do') + 0.8);
  const holdBerry = within(t, S('ready') + 1.0, S('lesson'));
  const trickShown = [S('t1'), S('t2'), S('t3')].filter((x) => t >= x).length;
  const trickGlow = (k: number) => {
    const spans: [Key, Key][][] = [[['t1', 't1_do'], ['a3a', 'a3a'], ['r_breath', 'r_breath_a']], [['t2', 't2_do'], ['a3b', 'a3b']], [['t3', 't3_again'], ['a3c', 'a3c'], ['breath', 'breath']]];
    return spans[k].some(([a, b]) => within(t, S(a) - 0.1, E(b) + 0.3));
  };
  const chanting = ['c1', 'c2', 'c3'].some((k) => within(t, S(k as Key), E(k as Key)));

  return (
    <>
      <KidsStage cam={cam}>
        <Meadow w={W} h={H} t={t} />
        {/* day/night pulses while the seed grows */}
        {night > 0 && (
          <g opacity={night}>
            <rect width={W} height={H} fill="#141a4a" opacity={0.6} />
            <g transform="translate(400,170)"><circle r={60} fill="#fff3b0" /><circle cx={24} cy={-16} r={54} fill="#3a3f74" /></g>
            {Array.from({ length: 18 }).map((_, i) => <circle key={i} cx={(i * 263 + 40) % W} cy={(i * 131 + 40) % 420} r={4} fill="#ffffff" />)}
          </g>
        )}
        {rain && Array.from({ length: 40 }).map((_, i) => {
          const y = ((t * 900 + i * 97) % 760) + 60;
          return <line key={i} x1={(i * 211) % W} y1={y} x2={(i * 211) % W - 10} y2={y + 34} stroke="#4cc9f0" strokeWidth={5} strokeLinecap="round" opacity={0.7} />;
        })}
        {/* the garden patch */}
        <g transform={`translate(${PATCH},${f})`}>
          <ellipse cx={0} cy={-4} rx={190} ry={36} fill="#8d5a3b" {...kst(6)} />
          {planted && !dug && <path d="M -70,-14 Q 0,-46 70,-14 Z" fill="#a0673c" {...kst(5)} />}
          {dug && <ellipse cx={0} cy={-8} rx={44} ry={12} fill="#3b2a1a" />}
          {/* the little sign */}
          <g transform="translate(-190,-26)">
            <rect x={-6} y={-70} width={12} height={70} fill="#c0874f" {...kst(4)} />
            <rect x={-46} y={-110} width={92} height={50} rx={8} fill="#fff3d6" {...kst(4)} />
            <g transform="translate(0,-85) scale(0.42)"><Strawberry /></g>
          </g>
        </g>
        {/* the seed: falling into the hole, or dug up */}
        {within(t, seedDrop - 0.4, seedDrop + 0.4) && (
          <ellipse cx={PATCH} cy={f - 200 + EASE_INOUT(prog(t, seedDrop - 0.4, seedDrop + 0.4)) * 180} rx={12} ry={16} fill="#6b4226" {...kst(3)} />
        )}
        {seedUp && (
          <g transform={`translate(${PATCH + 60},${f - 30 - Math.sin(Math.min(1, prog(t, word('oops', 4), word('oops', 4) + 0.6)) * Math.PI) * 120})`}>
            <ellipse rx={12} ry={16} fill="#6b4226" {...kst(3)} />
          </g>
        )}
        <Plant stage={stage} red={red} picked={picked} t={t} />
        {/* water drops */}
        {watering && Array.from({ length: 8 }).map((_, i) => {
          const p = ((t - S('water')) * 1.4 + i / 8) % 1;
          return <circle key={i} cx={1170 - p * 150 + (i % 3) * 12} cy={f - 250 + p * 220} r={8} fill="#4cc9f0" {...kst(2)} />;
        })}
        {/* guess who: a shell peeks over the bush */}
        {!revealed && <ShellPeek t={t} />}
        {bushS > 0 && <Bush s={bushS} />}
        {revealed && (
          <Critter spec={SAMMY} x={sx} y={f} scale={0.74} expr={sammyExpr} look={within(t, S('now'), S('cant')) || within(t, S('sprout'), S('ready')) ? [0.6, 0.5] : [0.3, -0.2]}
            mouth={lipSync(VO, 'sammy', t)} walking={moving(t, SAMMY_X)} walk={t * (within(t, S('slow'), E('slow_a')) ? 0.9 : 2)} tuck={tuck}
            armL={within(t, S('plant'), E('plant')) || within(t, S('oops'), E('oops')) ? (Math.sin(t * 7) > 0 ? 'hold' : 'down') : chanting || t >= S('bye') ? 'wave' : talks('sammy') ? 'up' : 'down'}
            armR={playing ? 'hold' : holdBerry ? 'hold' : chanting ? 'up' : within(t, S('hello'), E('hello')) ? 'wave' : 'down'}
            holdR={playing ? <Ball r={30} rot={t * 200} /> : holdBerry ? <Strawberry s={0.7} /> : undefined}
            hop={within(t, S('tap'), E('tap')) ? Math.abs(Math.sin(t * 9)) * 10 : within(t, S('reveal'), S('reveal') + 1) || within(t, S('ready'), E('ready')) || playing ? Math.abs(Math.sin(t * 7)) * 30 : 0}
            squash={within(t, S('sad'), S('tricks')) ? 0.08 : within(t, S('t1_turn'), S('t1_do')) ? 0.04 * Math.sin((t - E('t1_turn')) * 1.6) : 0} />
        )}
        <Critter spec={BOBO_HERO} x={bx} y={f} scale={0.74}
          expr={!revealed ? 'think' : within(t, S('bobo_oh'), E('bobo_oh')) ? 'oops' : talks('bobo') || within(t, S('yum'), S('lesson')) ? 'laugh' : 'happy'}
          look={!revealed ? [-0.8, 0.2] : [-0.5, -0.2]} mouth={lipSync(VO, 'bobo', t)}
          armL={watering ? 'hold' : within(t, S('t1'), E('t3')) ? 'up' : chanting || t >= S('bye') ? 'wave' : 'down'}
          armR={talks('bobo') && !watering ? 'point' : chanting ? 'up' : 'down'}
          holdL={watering ? <Can /> : undefined}
          hop={within(t, S('yum'), E('yum')) || within(t, S('wow'), E('wow')) ? Math.abs(Math.sin(t * 7)) * 30 : 0} />
        {/* music notes while Sammy sings and plays */}
        {playing && [0, 1, 2].map((k) => {
          const p = ((t - S('t2_do')) * 0.6 + k / 3) % 1;
          return <text key={k} x={sx - 60 + k * 50 + p * 30} y={f - 360 - p * 120} fontFamily={FONT_TOON} fontWeight={700} fontSize={54} fill="#7b2cbf" opacity={1 - p}>♪</text>;
        })}
        {/* hearts when they share */}
        {within(t, S('share'), S('lesson')) && [0, 1, 2].map((k) => {
          const p = ((t - S('share')) * 0.5 + k / 3) % 1;
          return <path key={k} d="M 0,14 C -24,-2 -20,-20 -8,-20 C -2,-20 0,-14 0,-10 C 0,-14 2,-20 8,-20 C 20,-20 24,-2 0,14 Z" transform={`translate(${1010 + (k - 1) * 70},${f - 380 - p * 140}) scale(2)`} fill="#ff6fa5" {...kst(2)} opacity={1 - p} />;
        })}
        {/* the 3 waiting tricks strip */}
        {trickShown > 0 && [['BREATHE', '#4cc9f0', <BreatheIcon key="b" />], ['PLAY', '#ff924c', <PlayIcon key="p" />], ['I CAN WAIT!', '#8ac926', <WaitIcon key="w" />]].slice(0, trickShown).map(([l, c, icon], k) => {
          const at = [S('t1'), S('t2'), S('t3')][k];
          const g = trickGlow(k);
          const s = EASE_OUT(prog(t, at, at + 0.4)) * (g ? 1.12 : 1);
          if (within(t, S('fact1') - 0.3, S('wow'))) return null;
          return (
            <g key={l as string} transform={`translate(${660 + k * 300},92) scale(${s})`}>
              <rect x={-135} y={-58} width={270} height={116} rx={30} fill="#ffffff" stroke={g ? (c as string) : KINK} strokeWidth={g ? 12 : 7} />
              <g transform="translate(-82,0) scale(1.2)">{icon}</g>
              <text x={30} y={14} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={(l as string).length > 6 ? 30 : 40} fill={KINK}>{l as string}</text>
            </g>
          );
        })}
      </KidsStage>
      <TitleCard t={t} from={0} to={1.4} title="WHO'S HIDING?" sub="an animal story" />
      <ThinkTimer t={t} from={E('guess2') + 0.2} to={S('reveal') - 0.2} label="WHO?" />
      <ThinkTimer t={t} from={E('sound_q') + 0.2} to={S('sound_a') - 0.2} label="LISTEN!" />
      <PopText t={t} at={S('sound_a')} until={S('hide') - 0.1} text="SHHH..." y={300} size={130} color="#ffffff" />
      <PopText t={t} at={E('hide_turn') + 0.1} until={S('peek') - 0.1} text="YOUR TURN!" y={300} size={120} color="#ffca3a" />
      <PopText t={t} at={S('peek')} until={E('peek') + 0.5} text="PEEKABOO!" y={300} size={120} color="#a7c957" />
      <FactCard t={t} at={S('fact1')} until={S('fact2') - 0.1} n={1} text="A HOUSE ON ITS BACK!"><ShellIcon /></FactCard>
      <FactCard t={t} at={S('fact2')} until={S('fact3') - 0.1} n={2} text="NO TEETH — A BEAK!"><BeakIcon /></FactCard>
      <FactCard t={t} at={S('fact3')} until={S('wow') + 1.2} n={3} text="100+ YEARS!"><CakeIcon /></FactCard>
      {[0, 1, 2].map((k) => (
        <PopText key={k} t={t} at={word('slow', 9 + k)} until={k < 2 ? word('slow', 10 + k) : S('slow_a')} text="STEP..." x={500 + k * 220} y={300 + (k % 2) * 40} size={80} color="#ffffff" />
      ))}
      <PopText t={t} at={S('slow_a')} until={E('slow_a') + 0.6} text="SLOW AND STEADY!" y={300} size={100} color="#a7c957" />
      <PopText t={t} at={word('plant', 7)} until={S('water') - 0.1} text="PAT! PAT! PAT!" y={300} size={100} color="#c0874f" />
      <PopText t={t} at={S('water') + 1.2} until={S('now') - 0.1} text="SPLASH!" y={300} size={110} color="#4cc9f0" />
      <PopText t={t} at={word('tap', 4)} until={S('cant') - 0.1} text="TAP, TAP, TAP..." y={300} size={100} color="#ffffff" />
      <PopText t={t} at={S('feel')} until={S('ask') - 0.1} text="IMPATIENT!" y={300} size={110} color="#ff595e" />
      <ThinkTimer t={t} from={E('ask') + 0.1} to={S('tricks') - 0.2} label="HOW?" />
      <BreathGuide t={t} from={E('t1_turn') + 0.05} to={S('t1_do') - 0.05} />
      <PopText t={t} at={S('t3') + 0.6} until={S('t3_you') - 0.1} text="I CAN WAIT!" y={330} size={120} color="#8ac926" />
      <PopText t={t} at={E('t3_you') + 0.1} until={S('t3_again') - 0.1} text="YOUR TURN!" y={330} size={120} color="#ffca3a" />
      {[0, 1, 2, 3, 4].map((k) => (
        <PopText key={k} t={t} at={word('count', 7 + k)} until={k < 4 ? word('count', 8 + k) : S('sprout') - 0.1} text={`DAY ${k + 1}`} y={300} size={110} color="#ffd166" />
      ))}
      <PopText t={t} at={S('breath')} until={S('red') - 0.1} text="DEEP BREATH..." y={300} size={100} color="#4cc9f0" />
      <PopText t={t} at={S('ready')} until={S('share') - 0.1} text="IT'S READY!" y={300} size={120} color="#e63946" />
      <PopText t={t} at={S('lesson')} until={S('again') - 0.2} text="GOOD THINGS TAKE TIME!" y={300} size={96} color="#ffca3a" />
      <PopText t={t} at={S('again')} until={S('r_hide') - 0.1} text="LET'S REMEMBER!" y={300} size={110} color="#ffca3a" />
      {(['r_hide', 'q1', 'q2', 'q3'] as const).map((q, k) => {
        const a = (['r_hide_a', 'a1', 'a2', 'a3a'] as const)[k];
        return <ThinkTimer key={q} t={t} from={E(q) + 0.2} to={S(a) - 0.2} label="THINK!" />;
      })}
      <BreathGuide t={t} from={E('r_breath') + 0.1} to={S('r_breath_a') - 0.05} />
      <PopText t={t} at={S('a1') + 0.3} until={S('q2') - 0.1} text="NO TEETH!" y={300} size={110} color="#ffffff" />
      <PopText t={t} at={S('a2') + 0.3} until={S('r_breath') - 0.1} text="100+ YEARS!" y={300} size={120} color="#ffd166" />
      <PopText t={t} at={S('c1')} until={S('c_turn') - 0.1} text="GOOD THINGS TAKE TIME!" y={300} size={96} color="#ffca3a" />
      <PopText t={t} at={E('c_turn') + 0.1} until={S('c2') - 0.1} text="YOUR TURN!" y={300} size={120} color="#ffffff" />
      <PopText t={t} at={S('c3')} until={S('tip') - 0.1} text="GOOD THINGS TAKE TIME!" y={300} size={96} color="#a7c957" />
      <PopText t={t} at={S('bye')} text="SEE YOU NEXT TIME!" y={300} size={100} color="#ffca3a" />
      <Confetti t={t} at={S('reveal')} y={400} dur={1.2} />
      <Confetti t={t} at={S('ready')} y={400} />
      <Confetti t={t} at={S('bye')} y={400} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
    </>
  );
}
