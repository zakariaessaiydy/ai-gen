// =============================================================================
// lib/kids.tsx — THE KIDS-STORIES KIT (16:9 episodes, 1920x1080, 2–5 min)
//
// One episode = one SHOT LIST (beats.json "shots", emitted into shots.gen.ts) played by
// <StoryPlayer>. A shot is data — scene, who is in it, where they go, how they feel — so a new
// episode is a new table plus a new script, never new drawing code. That is what keeps the
// recurring characters LOCKED: Sammy is the same SVG in every episode because there is only one
// Sammy component, the way a cartoon studio has one model sheet.
//
// Rules this kit enforces by construction (and tools/kids_lib.py checks on the beats):
//   - frame 0 is fully composed (first shot never fades in, its question bubble is already up)
//   - there is ALWAYS motion: every shot has a slow camera push and idle animation, so nothing on
//     screen is ever a still frame (preschool attention resets on stillness)
//   - a character's mouth only moves while the VO line they `speaker` is actually being spoken
//   - no end screen: the final shot carries a spoken + drawn NEXT-UP card instead, because Made
//     for Kids videos cannot have end screens, cards or comments
//
// GEOMETRY: characters are drawn in their own SVG viewBox (-200,-400)–(200,0): x centred, feet
// at y=0. A cast member's `x` is 0..1 of the frame width; `size` is its height in px.
//
// SCENE_KINDS / CAST_IDS / ACTIONS / MOODS / PROP_KINDS are parsed by tools/kids_lib.py to validate
// beats.json — keep each a single-line `as const` array.
// =============================================================================
import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { FONT_KIDS } from '../fonts';
import { Captions, VoLine, prog } from './shorts';

export const KS = { W: 1920, H: 1080, FPS: 30 } as const;
/** Floor line every scene puts its ground at — characters stand on it. */
export const GROUND = 900;

export const SCENE_KINDS = ['meadow', 'forest', 'night', 'pond', 'home'] as const;
export const CAST_IDS = ['sammy', 'oliver', 'mila'] as const;
export const ACTIONS = ['idle', 'walk', 'hop', 'fly', 'sleep', 'cheer', 'shake'] as const;
export const MOODS = ['happy', 'sad', 'surprised', 'sleepy', 'worried', 'proud'] as const;
export const PROP_KINDS = ['acorn', 'apple', 'ball', 'star', 'sprout'] as const;

export type SceneKind = (typeof SCENE_KINDS)[number];
export type CastId = (typeof CAST_IDS)[number];
export type Action = (typeof ACTIONS)[number];
export type Mood = (typeof MOODS)[number];
export type PropKind = (typeof PROP_KINDS)[number];

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const TAU = Math.PI * 2;
const F = (s: number) => Math.round(s * KS.FPS);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
/** deterministic 0..1 noise — never Math.random() in a render */
const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// =============================================================================
// THE CAST — the locked model sheet. Change a colour here and it changes in every episode,
// which is the point. Personality + voice notes live in kids-stories/CAST.md.
// =============================================================================
export const CAST: Record<CastId, { name: string; species: string; color: string; accent: string }> = {
  sammy: { name: 'Sammy', species: 'turtle', color: '#5bb35a', accent: '#f2c14e' },
  oliver: { name: 'Oliver', species: 'owl', color: '#a0703f', accent: '#f2a03d' },
  mila: { name: 'Mila', species: 'bunny', color: '#f3eaf6', accent: '#ff7eb6' },
};

export const KIDS_COLORS = {
  ink: '#2d2340',
  paper: '#fffaf0',
  cheek: '#ff9eb0',
  sun: '#ffd34d',
  accent: '#ff8a3d',
} as const;

// =============================================================================
// FACE — shared eyes/mouth/cheeks so every character emotes the same readable way.
// talk 0..1 opens the mouth; blink 0..1 closes the eyes.
// =============================================================================
const Eye: React.FC<{ cx: number; cy: number; r: number; blink: number; look: number; mood: Mood }> = ({
  cx, cy, r, blink, look, mood,
}) => {
  const closed = mood === 'sleepy' ? Math.max(blink, 0.75) : blink;
  if (closed > 0.85) {
    return <path d={`M ${cx - r} ${cy} Q ${cx} ${cy + r * 0.55} ${cx + r} ${cy}`} stroke={KIDS_COLORS.ink} strokeWidth={r * 0.28} fill="none" strokeLinecap="round" />;
  }
  const ry = r * (1 - closed);
  const pupil = mood === 'surprised' ? r * 0.42 : r * 0.55;
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={r} ry={ry} fill="#fff" stroke={KIDS_COLORS.ink} strokeWidth={r * 0.14} />
      <ellipse cx={cx + look * r * 0.3} cy={cy + r * 0.08} rx={pupil} ry={Math.min(pupil, ry * 0.9)} fill={KIDS_COLORS.ink} />
      <circle cx={cx + look * r * 0.3 + pupil * 0.35} cy={cy - pupil * 0.35} r={pupil * 0.32} fill="#fff" />
    </g>
  );
};

const Face: React.FC<{
  cx: number; cy: number; s: number; mood: Mood; blink: number; talk: number; look?: number; mouth?: boolean;
}> = ({ cx, cy, s, mood, blink, talk, look = 0.3, mouth = true }) => {
  const ex = 26 * s;
  const ey = cy - 10 * s;
  const er = 17 * s;
  const my = cy + 24 * s;
  const brow = mood === 'worried' || mood === 'sad';
  let mouthEl: React.ReactNode = null;
  if (mouth) {
    if (talk > 0.05) {
      mouthEl = <ellipse cx={cx} cy={my + 2 * s} rx={11 * s} ry={(3 + 11 * talk) * s} fill="#7a2e3a" stroke={KIDS_COLORS.ink} strokeWidth={3 * s} />;
    } else if (mood === 'surprised') {
      mouthEl = <ellipse cx={cx} cy={my + 2 * s} rx={8 * s} ry={10 * s} fill="#7a2e3a" stroke={KIDS_COLORS.ink} strokeWidth={3 * s} />;
    } else if (mood === 'sad' || mood === 'worried') {
      mouthEl = <path d={`M ${cx - 14 * s} ${my + 8 * s} Q ${cx} ${my - 4 * s} ${cx + 14 * s} ${my + 8 * s}`} stroke={KIDS_COLORS.ink} strokeWidth={4.5 * s} fill="none" strokeLinecap="round" />;
    } else {
      const w = mood === 'proud' ? 20 : 16;
      mouthEl = <path d={`M ${cx - w * s} ${my - 2 * s} Q ${cx} ${my + 16 * s} ${cx + w * s} ${my - 2 * s}`} stroke={KIDS_COLORS.ink} strokeWidth={4.5 * s} fill="none" strokeLinecap="round" />;
    }
  }
  return (
    <g>
      <ellipse cx={cx - ex - 8 * s} cy={cy + 14 * s} rx={10 * s} ry={6 * s} fill={KIDS_COLORS.cheek} opacity={0.7} />
      <ellipse cx={cx + ex + 8 * s} cy={cy + 14 * s} rx={10 * s} ry={6 * s} fill={KIDS_COLORS.cheek} opacity={0.7} />
      <Eye cx={cx - ex} cy={ey} r={er} blink={blink} look={look} mood={mood} />
      <Eye cx={cx + ex} cy={ey} r={er} blink={blink} look={look} mood={mood} />
      {brow && (
        <g stroke={KIDS_COLORS.ink} strokeWidth={4 * s} strokeLinecap="round">
          <line x1={cx - ex - 14 * s} y1={ey - 22 * s} x2={cx - ex + 10 * s} y2={ey - 28 * s} />
          <line x1={cx + ex + 14 * s} y1={ey - 22 * s} x2={cx + ex - 10 * s} y2={ey - 28 * s} />
        </g>
      )}
      {mouthEl}
    </g>
  );
};

// =============================================================================
// MOTION — every action is a pure function of (time, seed). `phase` is in cycles.
// =============================================================================
type Motion = { lift: number; legs: number; wing: number; squash: number; jitter: number; blink: number };

const motionOf = (action: Action, t: number, seed: number): Motion => {
  // blink: ~every 3.4s, 0.16s long, offset per character so the cast never blinks in unison
  const bp = (t + seed * 1.37) % 3.4;
  const blink = bp < 0.16 ? Math.sin((bp / 0.16) * Math.PI) : 0;
  const breathe = Math.sin(TAU * t * 0.5 + seed);
  switch (action) {
    case 'walk': {
      const p = t / 0.6;
      return { lift: Math.abs(Math.sin(TAU * p * 0.5)) * 10, legs: Math.sin(TAU * p), wing: 0.1 * Math.sin(TAU * p), squash: 0, jitter: 0, blink };
    }
    case 'hop': {
      const p = (t / 0.7) % 1;
      const h = Math.sin(Math.PI * p);
      return { lift: h * 70, legs: 0.6 * (1 - h), wing: 0.4 * h, squash: p < 0.12 || p > 0.88 ? 0.08 : -0.04 * h, jitter: 0, blink };
    }
    case 'fly':
      return { lift: 140 + Math.sin(TAU * t * 0.8) * 18, legs: 0.3, wing: Math.sin(TAU * t / 0.32), squash: 0, jitter: 0, blink };
    case 'cheer': {
      const p = (t / 0.5) % 1;
      const h = Math.sin(Math.PI * p);
      return { lift: h * 26, legs: 0.3 * h, wing: 0.9, squash: -0.03 * h, jitter: 0, blink };
    }
    case 'shake':
      return { lift: 0, legs: 0, wing: 0.15, squash: 0, jitter: Math.sin(TAU * t * 7) * 5, blink };
    case 'sleep':
      return { lift: 0, legs: 0, wing: 0, squash: 0.025 * breathe, jitter: 0, blink: 1 };
    default:
      return { lift: 0, legs: 0, wing: 0.08 * breathe, squash: 0.012 * breathe, jitter: 0, blink };
  }
};

// =============================================================================
// THE CHARACTERS — drawn facing RIGHT; the wrapper mirrors them for facing -1.
// =============================================================================
const STROKE = { stroke: KIDS_COLORS.ink, strokeWidth: 7, strokeLinejoin: 'round' as const };

const Sammy: React.FC<{ m: Motion; mood: Mood; talk: number }> = ({ m, mood, talk }) => {
  const c = CAST.sammy;
  const leg = (x: number, ph: number, back: boolean) => (
    <ellipse cx={x + m.legs * 14 * ph} cy={-28 + (ph * m.legs > 0 ? -Math.abs(m.legs) * 8 : 0)} rx={28} ry={34} fill={back ? '#3f8f40' : c.color} {...STROKE} />
  );
  return (
    <g>
      {leg(-95, -1, true)}
      {leg(55, 1, true)}
      <path d="M -165 -70 L -200 -52 L -160 -48 Z" fill={c.color} {...STROKE} />
      {/* neck + head */}
      <path d="M 70 -110 Q 120 -150 135 -190 L 175 -160 Q 150 -110 105 -70 Z" fill={c.color} {...STROKE} />
      <circle cx={160} cy={-205} r={66} fill={c.color} {...STROKE} />
      <Face cx={168} cy={-210} s={1.05} mood={mood} blink={m.blink} talk={talk} look={0.45} />
      {/* shell */}
      <path d="M -170 -60 Q -165 -270 -20 -272 Q 120 -270 125 -60 Z" fill="#8a5a2b" {...STROKE} />
      <path d="M -140 -66 Q -136 -240 -22 -242 Q 92 -240 96 -66 Z" fill={c.accent} opacity={0.95} />
      {[[-80, -150], [20, -150], [-30, -205], [-120, -95], [60, -95], [-30, -100]].map(([x, y], i) => (
        <path key={i} d={`M ${x - 26} ${y} l 13 -22 h 26 l 13 22 l -13 22 h -26 Z`} fill="#d99a2b" stroke="#8a5a2b" strokeWidth={5} />
      ))}
      <rect x={-182} y={-74} width={320} height={26} rx={13} fill="#6e4521" {...STROKE} />
      {leg(-60, 1, false)}
      {leg(90, -1, false)}
    </g>
  );
};

const Oliver: React.FC<{ m: Motion; mood: Mood; talk: number }> = ({ m, mood, talk }) => {
  const c = CAST.oliver;
  const flap = m.wing; // -1..1
  const wing = (side: 1 | -1) => (
    <g transform={`rotate(${side * (-12 - flap * 48)} ${side * 98} -230)`}>
      <ellipse cx={side * 128} cy={-160} rx={44} ry={98} fill="#7d5530" {...STROKE} />
      {[0, 1, 2].map((k) => (
        <path key={k} d={`M ${side * (104 + k * 14)} -110 q ${side * 8} 30 ${side * 18} 40`} stroke="#5a3b1e" strokeWidth={5} fill="none" strokeLinecap="round" />
      ))}
    </g>
  );
  const beakOpen = talk * 12;
  return (
    <g>
      {wing(-1)}
      {wing(1)}
      {/* feet */}
      {[-40, 40].map((x) => (
        <g key={x} transform={`translate(${x} ${-6 - m.legs * 6})`}>
          {[-14, 0, 14].map((d) => (
            <line key={d} x1={0} y1={-14} x2={d} y2={4} stroke={c.accent} strokeWidth={10} strokeLinecap="round" />
          ))}
        </g>
      ))}
      <path d="M -88 -332 L -60 -270 L -110 -280 Z" fill="#7d5530" {...STROKE} />
      <path d="M 88 -332 L 60 -270 L 110 -280 Z" fill="#7d5530" {...STROKE} />
      <ellipse cx={0} cy={-175} rx={122} ry={160} fill={c.color} {...STROKE} />
      <ellipse cx={0} cy={-120} rx={80} ry={98} fill="#f1dcb8" />
      {[0, 1, 2].map((row) =>
        [-1, 0, 1].map((col) => (
          <path key={`${row}${col}`} d={`M ${col * 36 - 14 + (row % 2) * 18} ${-150 + row * 34} q 14 14 28 0`} stroke="#c9a978" strokeWidth={5} fill="none" strokeLinecap="round" />
        )),
      )}
      {/* eye discs */}
      <circle cx={-48} cy={-238} r={52} fill="#f6e3c0" {...STROKE} />
      <circle cx={48} cy={-238} r={52} fill="#f6e3c0" {...STROKE} />
      <g transform="translate(0 -232) scale(1.7) translate(0 232)">
        <Face cx={0} cy={-226} s={1} mood={mood} blink={m.blink} talk={0} look={0.15} mouth={false} />
      </g>
      {/* beak: the mouth — opens while Oliver's line is spoken */}
      <path d={`M -18 -198 L 18 -198 L 0 ${-172 - beakOpen * 0.2} Z`} fill={c.accent} {...STROKE} strokeWidth={5} />
      {beakOpen > 1 && <path d={`M -14 -192 L 14 -192 L 0 ${-170 + beakOpen} Z`} fill="#e07f22" {...STROKE} strokeWidth={5} />}
    </g>
  );
};

const Mila: React.FC<{ m: Motion; mood: Mood; talk: number }> = ({ m, mood, talk }) => {
  const c = CAST.mila;
  const earTilt = m.wing * 10;
  return (
    <g>
      {[-1, 1].map((side) => (
        <g key={side} transform={`rotate(${side * (8 + earTilt)} ${side * 34} -290)`}>
          <ellipse cx={side * 38} cy={-372} rx={26} ry={78} fill={c.color} {...STROKE} />
          <ellipse cx={side * 38} cy={-366} rx={12} ry={56} fill="#ffc2da" />
        </g>
      ))}
      <ellipse cx={-48} cy={-14 - Math.max(0, m.legs) * 10} rx={40} ry={20} fill={c.color} {...STROKE} />
      <ellipse cx={48} cy={-14 - Math.max(0, -m.legs) * 10} rx={40} ry={20} fill={c.color} {...STROKE} />
      <ellipse cx={0} cy={-112} rx={88} ry={98} fill={c.color} {...STROKE} />
      <ellipse cx={0} cy={-96} rx={52} ry={62} fill="#fff" />
      {/* arms */}
      {[-1, 1].map((side) => (
        <ellipse key={side} cx={side * 80} cy={-130 - m.wing * 40} rx={18} ry={36} fill={c.color} {...STROKE} transform={`rotate(${side * (20 + m.wing * 50)} ${side * 80} -150)`} />
      ))}
      <circle cx={0} cy={-250} r={84} fill={c.color} {...STROKE} />
      {/* bow */}
      <g transform="translate(40 -322)">
        <path d="M 0 0 L -34 -20 L -34 20 Z M 0 0 L 34 -20 L 34 20 Z" fill={c.accent} {...STROKE} strokeWidth={5} />
        <circle r={10} fill={c.accent} {...STROKE} strokeWidth={5} />
      </g>
      <Face cx={0} cy={-246} s={1.15} mood={mood} blink={m.blink} talk={talk} look={0.2} />
      <ellipse cx={0} cy={-232} rx={9} ry={7} fill="#ff8fb8" />
    </g>
  );
};

const DRAW: Record<CastId, React.FC<{ m: Motion; mood: Mood; talk: number }>> = { sammy: Sammy, oliver: Oliver, mila: Mila };
const SEED: Record<CastId, number> = { sammy: 0, oliver: 1, mila: 2 };

/** One cast member, positioned with its FEET at (x, y). */
export const Character: React.FC<{
  id: CastId;
  x: number; // px, feet centre
  y?: number; // px, feet line (default GROUND)
  size?: number; // px tall
  mood?: Mood;
  action?: Action;
  facing?: 1 | -1;
  talk?: number;
  t: number; // seconds — global time, so motion never restarts at a cut
}> = ({ id, x, y = GROUND, size = 400, mood = 'happy', action = 'idle', facing = 1, talk = 0, t }) => {
  const m = motionOf(action, t, SEED[id]);
  const Draw = DRAW[id];
  const k = size / 400;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2 + m.jitter,
        top: y - size - m.lift * k,
        width: size,
        height: size,
        transform: `scaleX(${facing}) scaleY(${1 - m.squash}) scaleX(${1 + m.squash})`,
        transformOrigin: '50% 100%',
      }}
    >
      {/* soft contact shadow — shrinks while airborne */}
      <div
        style={{
          position: 'absolute',
          left: '15%',
          right: '15%',
          bottom: -m.lift * k - size * 0.03,
          height: size * 0.07,
          borderRadius: '50%',
          background: 'rgba(30,40,20,0.22)',
          transform: `scale(${1 / (1 + m.lift / 200)})`,
        }}
      />
      <svg viewBox="-210 -440 420 450" width={size} height={size} style={{ overflow: 'visible' }}>
        <Draw m={m} mood={mood} talk={talk} />
      </svg>
      {action === 'sleep' &&
        [0, 1, 2].map((i) => {
          const p = ((t + i * 0.8) % 2.4) / 2.4;
          return (
            <div key={i} style={{ position: 'absolute', left: size * (0.7 + p * 0.25), top: size * (0.15 - p * 0.35), transform: `scaleX(${facing})`, opacity: Math.sin(Math.PI * p), fontFamily: FONT_KIDS, fontWeight: 700, fontSize: size * (0.1 + p * 0.06), color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.35)' }}>
              z
            </div>
          );
        })}
    </div>
  );
};

// =============================================================================
// SCENES — layered SVG backdrops with built-in ambient motion (clouds drift, stars twinkle,
// water ripples). `pan` (px) slides the layers at parallax rates so a camera move has depth.
// =============================================================================
const Cloud: React.FC<{ x: number; y: number; s: number; o?: number }> = ({ x, y, s, o = 0.95 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <ellipse cx={0} cy={0} rx={90} ry={44} fill="#fff" />
    <ellipse cx={-60} cy={12} rx={60} ry={34} fill="#fff" />
    <ellipse cx={64} cy={10} rx={66} ry={36} fill="#fff" />
    <ellipse cx={14} cy={-30} rx={56} ry={40} fill="#fff" />
  </g>
);

const Tree: React.FC<{ x: number; y: number; s: number; tone?: string }> = ({ x, y, s, tone = '#3f9a4a' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-22} y={-170} width={44} height={170} rx={14} fill="#8a5a2b" />
    <circle cx={0} cy={-230} r={110} fill={tone} />
    <circle cx={-80} cy={-170} r={70} fill={tone} />
    <circle cx={80} cy={-175} r={74} fill={tone} />
    <circle cx={-30} cy={-270} r={50} fill="rgba(255,255,255,0.10)" />
  </g>
);

const Flowers: React.FC<{ n: number; y0: number; seed: number; t: number }> = ({ n, y0, seed, t }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const x = -200 + rnd(seed + i) * 2400;
      const y = y0 + rnd(seed + i * 3) * 150;
      const col = ['#ff7eb6', '#ffd34d', '#ffffff', '#b28dff'][i % 4];
      const sway = Math.sin(TAU * (t * 0.4 + rnd(i))) * 3;
      return (
        <g key={i} transform={`translate(${x} ${y}) rotate(${sway})`}>
          <line x1={0} y1={0} x2={0} y2={-26} stroke="#3c8a3a" strokeWidth={4} />
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 9} cy={-30 + Math.sin((a * Math.PI) / 180) * 9} r={7} fill={col} />
          ))}
          <circle cx={0} cy={-30} r={6} fill="#ffb02e" />
        </g>
      );
    })}
  </g>
);

const Layer: React.FC<{ pan: number; rate: number; children: React.ReactNode }> = ({ pan, rate, children }) => (
  <g transform={`translate(${-pan * rate} 0)`}>{children}</g>
);

export const Scene: React.FC<{ kind: SceneKind; t: number; pan?: number }> = ({ kind, t, pan = 0 }) => {
  const night = kind === 'night';
  const sky = night ? ['#1d2557', '#4a4a8f'] : kind === 'forest' ? ['#9fdcf5', '#e8f7ff'] : ['#7fcbff', '#e3f5ff'];
  const drift = (i: number, speed: number) => ((t * speed + i * 640) % 2700) - 400;

  if (kind === 'home') {
    return (
      <AbsoluteFill>
        <svg viewBox="0 0 1920 1080" width="100%" height="100%">
          <rect width={1920} height={1080} fill="#f7d9a8" />
          <Layer pan={pan} rate={0.4}>
            {Array.from({ length: 14 }, (_, i) => (
              <rect key={i} x={i * 160 - 100} y={0} width={70} height={GROUND} fill="#f2cd93" />
            ))}
            {/* round window to the sky */}
            <circle cx={1380} cy={330} r={170} fill="#8a5a2b" />
            <circle cx={1380} cy={330} r={146} fill="#9fd8ff" />
            <Cloud x={1330 + Math.sin(t * 0.3) * 30} y={300} s={0.7} />
            <path d="M 1234 330 H 1526 M 1380 184 V 476" stroke="#8a5a2b" strokeWidth={14} />
            {/* shelf + lamp */}
            <rect x={300} y={360} width={420} height={22} rx={8} fill="#8a5a2b" />
            {[340, 420, 500].map((x, i) => (
              <rect key={x} x={x} y={260 + i * 8} width={56} height={100 - i * 8} rx={6} fill={['#ff7eb6', '#6cc4ff', '#ffd34d'][i]} />
            ))}
          </Layer>
          <rect x={0} y={GROUND - 20} width={1920} height={200} fill="#c8935a" />
          <ellipse cx={960 - pan * 0.9} cy={GROUND + 60} rx={620} ry={70} fill="#ff9eb0" opacity={0.75} />
          <ellipse cx={960 - pan * 0.9} cy={GROUND + 60} rx={500} ry={52} fill="#ffc2d1" opacity={0.75} />
        </svg>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        <defs>
          <linearGradient id={`sky-${kind}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={sky[0]} />
            <stop offset="1" stopColor={sky[1]} />
          </linearGradient>
        </defs>
        <rect width={1920} height={1080} fill={`url(#sky-${kind})`} />

        {/* sky layer: sun or moon + stars, clouds */}
        <Layer pan={pan} rate={0.08}>
          {night ? (
            <g>
              {Array.from({ length: 70 }, (_, i) => {
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(TAU * (t * 0.35 + rnd(i * 7))));
                return <circle key={i} cx={rnd(i) * 2100 - 90} cy={rnd(i + 99) * 560} r={1.5 + rnd(i + 5) * 3} fill="#fff7c2" opacity={tw} />;
              })}
              <circle cx={1560} cy={200} r={95} fill="#fff4c4" />
              <circle cx={1600} cy={180} r={86} fill={sky[0]} />
            </g>
          ) : (
            <g transform={`translate(1600 180) rotate(${t * 6})`}>
              {Array.from({ length: 12 }, (_, i) => (
                <rect key={i} x={-8} y={-160} width={16} height={46} rx={8} fill={KIDS_COLORS.sun} opacity={0.7} transform={`rotate(${i * 30})`} />
              ))}
              <circle r={92} fill={KIDS_COLORS.sun} />
            </g>
          )}
          {!night && [0, 1, 2].map((i) => <Cloud key={i} x={drift(i, 14 + i * 4)} y={150 + i * 70} s={0.9 + 0.3 * rnd(i)} />)}
        </Layer>

        {/* far hills */}
        <Layer pan={pan} rate={0.25}>
          <ellipse cx={300} cy={GROUND + 40} rx={760} ry={300} fill={night ? '#2c4a5e' : '#9ad57a'} />
          <ellipse cx={1500} cy={GROUND + 60} rx={900} ry={330} fill={night ? '#284459' : '#8ccf6e'} />
          {kind === 'forest' && [0, 1, 2, 3, 4, 5, 6].map((i) => <Tree key={i} x={i * 340 - 60} y={GROUND - 60} s={0.75} tone="#5aae5a" />)}
        </Layer>

        {/* mid layer */}
        <Layer pan={pan} rate={0.6}>
          <ellipse cx={960} cy={GROUND + 120} rx={1500} ry={260} fill={night ? '#1f3a46' : '#6dbb55'} />
          {(kind === 'forest' || kind === 'night') &&
            [0, 1, 2, 3].map((i) => <Tree key={i} x={i * 620 - 120 + (i % 2) * 120} y={GROUND + 10} s={1.05} tone={night ? '#24524a' : '#3f9a4a'} />)}
          {kind === 'meadow' && <Tree x={180} y={GROUND + 10} s={1.1} />}
        </Layer>

        {/* the ground the cast stands on */}
        <rect x={0} y={GROUND - 4} width={1920} height={1080 - GROUND + 4} fill={night ? '#1a3238' : '#5aa845'} />
        <path d={`M 0 ${GROUND} ${Array.from({ length: 49 }, (_, i) => `L ${i * 40} ${GROUND - 8 - (i % 2) * 10}`).join(' ')} L 1920 ${GROUND} Z`} fill={night ? '#1a3238' : '#5aa845'} />
        {/* pond water drawn over the ground, still behind the cast (cast are DOM above the SVG) */}
        {kind === 'pond' && (
          <g transform={`translate(${-pan * 0.9} 0)`}>
            <ellipse cx={1340} cy={GROUND + 70} rx={620} ry={120} fill="#4fb6e8" />
            <ellipse cx={1340} cy={GROUND + 60} rx={560} ry={96} fill="#74ccf2" />
            {[0, 1, 2].map((i) => {
              const p = ((t * 0.5 + i / 3) % 1);
              return <ellipse key={i} cx={1300 + i * 90} cy={GROUND + 64} rx={40 + p * 160} ry={8 + p * 30} fill="none" stroke="#fff" strokeWidth={4} opacity={0.6 * (1 - p)} />;
            })}
            {[[1080, 960], [1560, 990], [1450, 925]].map(([x, y], i) => (
              <path key={i} d={`M ${x} ${y} a 46 20 0 1 1 1 0 Z`} fill="#3fa24a" transform={`rotate(${Math.sin(t + i) * 4} ${x} ${y})`} />
            ))}
          </g>
        )}

        {!night && (
          <Layer pan={pan} rate={1}>
            <Flowers n={kind === 'forest' ? 16 : 28} y0={GROUND + 20} seed={kind.length * 11} t={t} />
          </Layer>
        )}
        {night &&
          Array.from({ length: 14 }, (_, i) => {
            const x = (rnd(i) * 1920 + Math.sin(t * 0.6 + i) * 60 - pan * 0.6 + 1920) % 1920;
            const y = 420 + rnd(i + 30) * 420 + Math.cos(t * 0.8 + i * 2) * 30;
            return <circle key={i} cx={x} cy={y} r={6} fill="#fff59a" opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i))} />;
          })}
      </svg>
    </AbsoluteFill>
  );
};

// =============================================================================
// OVERLAYS
// =============================================================================

/** The hook device: a big question bubble ("Where is the acorn going?"). at = seconds into shot. */
export const QuestionBubble: React.FC<{ text: string; x: number; y: number; local: number; at?: number }> = ({ text, x, y, local, at = 0 }) => {
  // at 0 it is ALREADY up at frame 0 (thumbnail rule); later it pops in
  const p = at <= 0 ? 1 : EASE_OUT(prog(local, at, at + 0.35));
  if (p <= 0) return null;
  const pop = at <= 0 ? 1 : 0.6 + 0.4 * p + Math.sin(Math.PI * p) * 0.12;
  const bob = Math.sin(TAU * local * 0.6) * 6;
  const left = Math.max(60, Math.min(KS.W - 760, x - 350));
  return (
    <div style={{ position: 'absolute', left, top: y - 190 + bob, width: 700, display: 'flex', justifyContent: 'center', transform: `scale(${pop})`, transformOrigin: '50% 100%', opacity: p }}>
      <div style={{ position: 'relative', background: '#fff', borderRadius: 48, padding: '26px 44px', border: `7px solid ${KIDS_COLORS.ink}`, boxShadow: '0 14px 40px rgba(0,0,0,0.18)', fontFamily: FONT_KIDS, fontWeight: 700, fontSize: 60, lineHeight: 1.1, color: KIDS_COLORS.ink, textAlign: 'center' }}>
        {text}
        <div style={{ position: 'absolute', left: '50%', bottom: -34, width: 0, height: 0, borderLeft: '26px solid transparent', borderRight: '26px solid transparent', borderTop: `36px solid ${KIDS_COLORS.ink}`, transform: 'translateX(-50%)' }} />
      </div>
    </div>
  );
};

/** Small series chip, top-left — brands the series without a title card eating the hook. */
export const SeriesChip: React.FC<{ text: string; t: number; from?: number; until?: number }> = ({ text, t, from = 3.2, until = 9 }) => {
  const a = prog(t, from, from + 0.4) * (1 - prog(t, until - 0.4, until));
  if (a <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 70, top: 56, transform: `translateY(${(1 - EASE_OUT(a)) * -30}px)`, opacity: a, fontFamily: FONT_KIDS, fontWeight: 600, fontSize: 38, color: '#fff', background: 'rgba(45,35,64,0.78)', padding: '12px 30px', borderRadius: 999 }}>
      {text}
    </div>
  );
};

/** The end-screen replacement: drawn + spoken tease for the next episode. */
export const NextUp: React.FC<{ title: string; cast: CastId; local: number; t: number }> = ({ title, cast, local, t }) => {
  const a = EASE_OUT(prog(local, 0.2, 0.8));
  return (
    <div style={{ position: 'absolute', right: 80, top: 90, width: 640, transform: `translateX(${(1 - a) * 760}px) rotate(${(1 - a) * 6}deg)`, background: KIDS_COLORS.paper, border: `8px solid ${KIDS_COLORS.ink}`, borderRadius: 44, padding: '28px 36px 30px', boxShadow: '0 20px 50px rgba(0,0,0,0.22)' }}>
      <div style={{ fontFamily: FONT_KIDS, fontWeight: 600, fontSize: 36, color: KIDS_COLORS.accent, letterSpacing: 1 }}>Next time…</div>
      <div style={{ fontFamily: FONT_KIDS, fontWeight: 700, fontSize: 56, lineHeight: 1.05, color: KIDS_COLORS.ink, marginTop: 6, maxWidth: 360, minHeight: 190 }}>{title}</div>
      <div style={{ position: 'absolute', right: 14, bottom: 18 }}>
        <div style={{ position: 'relative', width: 200, height: 200 }}>
          <Character id={cast} x={100} y={200} size={200} action="cheer" mood="happy" t={t} />
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// PROPS — the objects a story is about. A moving prop ROLLS (spin = distance / radius), so an
// acorn crossing the frame turns the right number of times. `sprout` grows in over 1.5s.
// =============================================================================
const PROP_DRAW: Record<PropKind, React.FC> = {
  acorn: () => (
    <g>
      <ellipse cx={0} cy={18} rx={40} ry={46} fill="#c9853f" {...STROKE} />
      <path d="M -50 -6 Q 0 -54 50 -6 Q 0 8 -50 -6 Z" fill="#7a4e24" {...STROKE} />
      <rect x={-5} y={-62} width={10} height={22} rx={5} fill="#7a4e24" />
      <ellipse cx={-14} cy={10} rx={8} ry={14} fill="rgba(255,255,255,0.35)" />
    </g>
  ),
  apple: () => (
    <g>
      <circle cx={0} cy={6} r={50} fill="#ef4b4b" {...STROKE} />
      <rect x={-4} y={-62} width={8} height={22} rx={4} fill="#7a4e24" />
      <ellipse cx={20} cy={-52} rx={20} ry={10} fill="#4fb24a" transform="rotate(-25 20 -52)" />
      <ellipse cx={-18} cy={-10} rx={10} ry={16} fill="rgba(255,255,255,0.35)" />
    </g>
  ),
  ball: () => (
    <g>
      <circle r={52} fill="#4aa8ff" {...STROKE} />
      <path d="M -52 0 Q 0 30 52 0" stroke="#fff" strokeWidth={12} fill="none" />
      <path d="M 0 -52 Q -30 0 0 52" stroke="#ffd34d" strokeWidth={12} fill="none" />
    </g>
  ),
  star: () => (
    <path d="M 0 -56 L 15 -18 L 55 -17 L 23 8 L 34 48 L 0 24 L -34 48 L -23 8 L -55 -17 L -15 -18 Z" fill="#ffd34d" {...STROKE} />
  ),
  sprout: () => (
    <g>
      <path d="M 0 56 Q -4 10 2 -30" stroke="#3c8a3a" strokeWidth={10} fill="none" strokeLinecap="round" />
      <ellipse cx={-26} cy={-30} rx={28} ry={14} fill="#5cc254" {...STROKE} strokeWidth={5} transform="rotate(25 -26 -30)" />
      <ellipse cx={28} cy={-42} rx={30} ry={15} fill="#5cc254" {...STROKE} strokeWidth={5} transform="rotate(-25 28 -42)" />
      <ellipse cx={0} cy={60} rx={56} ry={14} fill="#8a5a2b" />
    </g>
  ),
};

export type PropSpec = { kind: PropKind; x: number | [number, number]; size?: number; lift?: number };

export const Prop: React.FC<{ spec: PropSpec; p: number; local: number; t: number }> = ({ spec, p, local, t }) => {
  const size = spec.size ?? 110;
  const x = castX(spec, p) * KS.W;
  const travelled = Array.isArray(spec.x) ? (spec.x[1] - spec.x[0]) * KS.W * EASE_INOUT(p) : 0;
  const spin = spec.kind === 'sprout' || spec.kind === 'star' ? 0 : (travelled / (size / 2)) * (180 / Math.PI);
  const grow = spec.kind === 'sprout' ? EASE_OUT(prog(local, 0, 1.5)) : 1;
  const bob = spec.kind === 'star' ? Math.sin(TAU * t * 0.7) * 10 : 0;
  return (
    <div style={{ position: 'absolute', left: x - size / 2, top: GROUND - (spec.lift ?? 0) - size + bob, width: size, height: size }}>
      <svg viewBox="-64 -64 128 128" width={size} height={size} style={{ overflow: 'visible', transform: `rotate(${spin}deg) scale(${grow})`, transformOrigin: spec.kind === 'sprout' ? '50% 100%' : '50% 50%' }}>
        {React.createElement(PROP_DRAW[spec.kind])}
      </svg>
    </div>
  );
};

// =============================================================================
// STORY PLAYER — plays a shot list. Shots are GLOBAL seconds, straight from beats.json.
// =============================================================================
export type CastSpec = {
  id: CastId;
  x: number | [number, number]; // 0..1 of frame width; [from, to] walks across the shot
  mood?: Mood;
  action?: Action;
  facing?: 1 | -1; // default: toward where they are going, else right
  size?: number; // px tall (default 400)
  lift?: number; // px above the ground line (on a branch, a rock…)
};

export type Shot = {
  start: number;
  end: number;
  beat?: string;
  scene: SceneKind;
  cast: CastSpec[];
  props?: PropSpec[]; // drawn behind the cast
  zoom?: [number, number]; // camera push, default alternates 1→1.06 / 1.06→1
  pan?: [number, number]; // px of parallax travel across the shot
  ask?: string; // question bubble over the first cast member
  askAt?: number; // seconds into the shot (0 = already up)
  next?: { title: string; cast: CastId }; // the NEXT-UP card
};

export type Cut = { start: number; end: number };

const XFADE = 8; // frames each shot overlaps the next — a soft cut, never a gap

const castX = (c: { x: number | [number, number] }, p: number) => (Array.isArray(c.x) ? mix(c.x[0], c.x[1], EASE_INOUT(p)) : c.x);

/** 0..1 open amount for `id`'s mouth at time t — only while one of their words is spoken. */
const talkOf = (vo: VoLine[], id: CastId, t: number) => {
  for (const line of vo) {
    if (line.speaker !== id || t < line.start || t > line.end) continue;
    const ws = line.words ?? [];
    const speaking = ws.length ? ws.some((w) => t >= w.start && t <= w.end + 0.04) : true;
    return speaking ? 0.35 + 0.65 * Math.abs(Math.sin(t * 17)) : 0;
  }
  return 0;
};

/** Where the action is at time t (0..1 of width) — the vertical cut follows it. */
export const focusAt = (shots: Shot[], t: number, leadWeighted = false) => {
  const s = shots.find((x) => t >= x.start && t < x.end) ?? shots[shots.length - 1];
  const things: { x: number | [number, number] }[] = s ? [...s.cast, ...(s.props ?? [])] : [];
  if (leadWeighted && s?.cast.length) things.unshift(s.cast[0]); // the lead counts twice
  if (!things.length) return 0.5;
  const p = prog(t, s.start, s.end);
  return things.reduce((a, c) => a + castX(c, p), 0) / things.length;
};

const ShotView: React.FC<{ shot: Shot; index: number; vo: VoLine[] }> = ({ shot, index, vo }) => {
  const local = useCurrentFrame() / KS.FPS; // seconds into this shot
  const t = shot.start + local; // global seconds
  const dur = shot.end - shot.start;
  const p = prog(local, 0, dur);
  const zoom = shot.zoom ?? (index % 2 === 0 ? [1, 1.06] : [1.06, 1]);
  const z = mix(zoom[0], zoom[1], EASE_INOUT(p));
  const pan = shot.pan ? mix(shot.pan[0], shot.pan[1], EASE_INOUT(p)) : 0;
  const fx = shot.cast.length ? shot.cast.reduce((a, c) => a + castX(c, p), 0) / shot.cast.length : 0.5;
  const fade = index === 0 ? 1 : prog(local, 0, XFADE / KS.FPS);
  const lead = shot.cast[0];

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: `${fx * 100}% 70%` }}>
        <Scene kind={shot.scene} t={t} pan={pan} />
        {(shot.props ?? []).map((pr, i) => <Prop key={`p${i}`} spec={pr} p={p} local={local} t={t} />)}
        {shot.cast.map((c, i) => {
          const x = castX(c, p);
          const moving = Array.isArray(c.x) ? Math.sign(c.x[1] - c.x[0]) : 0;
          const facing = c.facing ?? (moving < 0 ? -1 : 1);
          return (
            <Character key={`${c.id}-${i}`} id={c.id} x={x * KS.W} y={GROUND - (c.lift ?? 0)} size={c.size ?? 400} mood={c.mood} action={c.action ?? (moving ? 'walk' : 'idle')} facing={facing} talk={talkOf(vo, c.id, t)} t={t} />
          );
        })}
        {shot.ask && lead && <QuestionBubble text={shot.ask} x={castX(lead, p) * KS.W} y={GROUND - (lead.lift ?? 0) - (lead.size ?? 400) * (lead.action === 'fly' ? 1.4 : 1) - 30} local={local} at={shot.askAt ?? 0} />}
      </AbsoluteFill>
      {shot.next && <NextUp title={shot.next.title} cast={shot.next.cast} local={local} t={t} />}
    </AbsoluteFill>
  );
};

/** Captions placement for the 16:9 frame: low, sentence case, rounded font. */
export const KidsCaptions: React.FC<{ vo: VoLine[]; y?: number; size?: number; accent?: string }> = ({ vo, y = 985, size = 58, accent = KIDS_COLORS.sun }) => (
  <Captions lines={vo} y={y} size={size} accent={accent} maxWords={6} plate upper={false} font={FONT_KIDS} />
);

export const StoryPlayer: React.FC<{
  shots: Shot[];
  vo: VoLine[];
  series?: string;
  captions?: boolean;
}> = ({ shots, vo, series, captions = true }) => {
  const t = useCurrentFrame() / KS.FPS;
  return (
    <AbsoluteFill style={{ background: '#7fcbff' }}>
      {shots.map((s, i) => {
        const last = i === shots.length - 1;
        const from = F(s.start);
        const dur = F(s.end) - from + (last ? 0 : XFADE);
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, dur)}>
            <ShotView shot={s} index={i} vo={vo} />
          </Sequence>
        );
      })}
      {series && <SeriesChip text={series} t={t} />}
      {captions && <KidsCaptions vo={vo} />}
    </AbsoluteFill>
  );
};

// =============================================================================
// VERTICAL CUT — a 1080x1920 Short carved out of the episode. The 16:9 stage is scaled ×1.2 (so a
// 400px character is ~half the frame width, not cropped in half) and lifted so the ground sits
// at y≈1450 — above the Shorts title/description overlay. The sky and ground colours of the
// current scene are extended to fill the rest of the frame, and the crop window FOLLOWS the cast
// (focusAt — lead weighted double, smoothed over ±0.6s). Captions move up into the open sky.
// =============================================================================
const SKY_TOP: Record<SceneKind, string> = { meadow: '#7fcbff', forest: '#9fdcf5', pond: '#7fcbff', night: '#1d2557', home: '#f7d9a8' };
const GROUND_FILL: Record<SceneKind, string> = { meadow: '#5aa845', forest: '#5aa845', pond: '#5aa845', night: '#1a3238', home: '#c8935a' };
const V_SCALE = 1.2;
const V_GROUND = 1450;

export const VerticalCut: React.FC<{ shots: Shot[]; vo: VoLine[]; cut: Cut }> = ({ shots, vo, cut }) => (
  <AbsoluteFill>
    <Sequence from={-F(cut.start)}>
      <VerticalInner shots={shots} vo={vo} />
    </Sequence>
  </AbsoluteFill>
);

const VerticalInner: React.FC<{ shots: Shot[]; vo: VoLine[] }> = ({ shots, vo }) => {
  const { width } = useVideoConfig();
  const t = useCurrentFrame() / KS.FPS; // global episode seconds (the Sequence is offset)
  const shot = shots.find((x) => t >= x.start && t < x.end) ?? shots[shots.length - 1];
  const kind = shot?.scene ?? 'meadow';
  const samples = [-0.6, -0.3, 0, 0.3, 0.6].map((d) => focusAt(shots, Math.max(0, t + d), true));
  const fx = samples.reduce((a, b) => a + b, 0) / samples.length;
  const stageW = KS.W * V_SCALE;
  const left = Math.max(width - stageW, Math.min(0, width / 2 - fx * stageW));
  const top = V_GROUND - GROUND * V_SCALE;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${SKY_TOP[kind]} 0, ${SKY_TOP[kind]} ${top + 10}px, ${GROUND_FILL[kind]} ${top + 10}px)` }}>
      <div style={{ position: 'absolute', left, top, width: KS.W, height: KS.H, transform: `scale(${V_SCALE})`, transformOrigin: '0 0' }}>
        <StoryPlayer shots={shots} vo={vo} captions={false} />
      </div>
      <Captions lines={vo} y={330} size={62} accent={KIDS_COLORS.sun} maxWords={4} plate upper={false} font={FONT_KIDS} />
    </AbsoluteFill>
  );
};
