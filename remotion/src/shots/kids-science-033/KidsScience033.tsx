// TINY SPARKS · Day 33 · 🚀 Science for Kids #5 — "Why Do Seasons Change?" (Short 9:16)
// kids-shorts/tiny-sparks/science/day-033-why-do-seasons-change. Cues from VO via K (keys.gen.ts).
// HOOK: 4 season tiles pop on "summer, fall, winter, spring" → GUESS (Leo: the Sun comes closer in summer — the
// real misconception; the Sun in his bubble grows / shrinks) → MODEL in space (perspective orbit): Earth goes
// around the Sun in one year · Earth is TILTED (axis drawn on, the ONE word, your turn) · our side leans toward
// the Sun = strong sunshine + long days = SUMMER · leans away = weak sunshine + short days = WINTER (snow) · FALL
// and SPRING in between → lean like the Earth (the cast leans) → SEE IT with a grown-up: a flashlight straight
// down = small bright spot, tilted = big weak spot → "It's the tilt!" → summer on our side = winter on the other
// side → RECAP → WOW: every birthday you've travelled around the Sun → back to the meadow (loops).
import React from 'react';
import { Kid, kidFaceAt } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { CAPTION_COLORS, HOOT_HERO, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { AirTwinkles, FLOOR, Meadow, Sun } from '../../lib/kids/sets';
import { Bubble, Confetti, FONT_TOON, KidsCaptions, KidsStage, PopText, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { EASE_INOUT, EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsScience033', durationInSeconds: 110.5, fps: 30, width: 1080, height: 1920 };

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

const MILA_X = 190;
const HOOT_X = 540;
const LEO_X = 890;
const KID_S = 0.62;
const [lfx, lfy] = kidFaceAt(LEO_X, f, KID_S);

// ── scene windows
const SPACE0 = S('around') - 0.4;
const C0 = S('torch') - 0.3; // flashlight demo
const C1 = S('leo_wow') - 0.3; // big Earth: summer here, winter there
const R0 = S('recap') - 0.3;
const WOW0 = S('wow') - 0.3;
const END0 = S('end') - 0.5;

// ── the orbit (perspective ellipse): θ = π left (SUMMER for us), π/2 front (FALL), 0 right (WINTER), −π/2 back (SPRING)
const SUN_XY: [number, number] = [540, 700];
const ORX = 400;
const ORY = 210;
const ER = 118;
const TILT = 24; // axis tilt in degrees: the top always leans to screen-right (fixed in space, like the real axis)
const PI = Math.PI;
const THETA: KF = [
  [S('around') + 0.3, PI], [E('around') - 0.2, -PI], // one whole year
  [S('lean_in'), -PI], [S('lean_out') + 0.2, -PI], [word('lean_out', 4), -2 * PI], // summer → fall → winter
  [S('between'), -2 * PI], [word('between', 7), -2.5 * PI], [E('between') + 0.8, -3 * PI], // → spring → summer
];
const thetaAt = (t: number) => {
  if (t < S('lean_turn')) return lerpKF(t, THETA);
  if (t < C0) return -3 * PI - (t - S('lean_turn')) * 0.5;
  return -PI - Math.max(0, t - (S('wow') + 0.8)) * ((2 * PI) / 3.4); // wow: one more lap
};
const orbitXY = (th: number): [number, number] => [SUN_XY[0] + ORX * Math.cos(th), SUN_XY[1] + ORY * Math.sin(th)];

// ── art
const SpaceBg: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <defs>
      <linearGradient id="kSpace33" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#14143d" />
        <stop offset="1" stopColor="#3d2a78" />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#kSpace33)" />
    {Array.from({ length: 46 }).map((_, i) => (
      <circle key={i} cx={(i * 263 + 30) % W} cy={(i * 419 + 50) % (f - 120)} r={2.5 + (i % 3) * 2} fill="#ffffff" opacity={0.45 + 0.45 * Math.sin(t * 1.8 + i)} />
    ))}
    <AirTwinkles t={t} w={W} y0={80} y1={f - 400} n={6} c="#fff3b0" />
    <path d={`M 0,${f} Q ${W / 2},${f - 90} ${W},${f} L ${W},${H} L 0,${H} Z`} fill="#b8b8d1" {...kst(7)} />
    {[[0.2, 70, 40], [0.55, 140, 32], [0.86, 80, 50]].map(([cx, dy, r], i) => (
      <ellipse key={i} cx={W * cx} cy={f + dy} rx={r} ry={r * 0.45} fill="#9c9cbd" {...kst(5)} />
    ))}
  </g>
);

const Flake: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o} stroke="#ffffff" strokeWidth={5} strokeLinecap="round">
    {[0, 60, 120].map((a) => <line key={a} x1={-16} y1={0} x2={16} y2={0} transform={`rotate(${a})`} />)}
  </g>
);

// a tree in one season: 0 summer · 1 fall · 2 winter · 3 spring
const SeasonTree: React.FC<{ season: number; t: number }> = ({ season, t }) => {
  const canopy = ['#55b84a', '#ff924c', 'none', '#7bd162'][season];
  return (
    <g>
      <rect x={-18} y={-150} width={36} height={150} rx={10} fill="#a0673c" {...kst(5)} />
      {season === 2 ? (
        <g>
          {[[-60, -230, -10, -140], [60, -230, 10, -140], [0, -260, 0, -150], [-90, -180, -14, -110], [90, -180, 14, -110]].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a0673c" strokeWidth={12} strokeLinecap="round" />
          ))}
          {[[-60, -236], [60, -236], [0, -266]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={22} ry={9} fill="#ffffff" {...kst(3)} />)}
        </g>
      ) : (
        <g>
          {[[-60, -190], [0, -235], [60, -190], [-30, -140], [35, -140]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={62} fill={season === 1 && i % 2 ? '#ffca3a' : canopy} {...kst(5)} />
          ))}
          {season === 0 && [[-30, -190], [30, -220], [50, -150]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={11} fill="#ff4d6d" {...kst(3)} />)}
          {season === 3 && [[-50, -200], [10, -240], [55, -180], [-20, -150], [35, -130], [-70, -150]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x},${y})`}>
              {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={Math.cos((a * PI) / 180) * 7} cy={Math.sin((a * PI) / 180) * 7} r={6} fill="#ffc8dd" />)}
              <circle r={4} fill="#ff6fa5" />
            </g>
          ))}
        </g>
      )}
      {season === 1 && [0, 1, 2].map((k) => {
        const p = (t * 0.5 + k / 3) % 1;
        return <path key={k} d="M 0,-10 Q 10,0 0,10 Q -10,0 0,-10 Z" fill={k % 2 ? '#ff924c' : '#e76f51'} transform={`translate(${-60 + k * 60 + Math.sin(t * 3 + k) * 14},${-150 + p * 150}) rotate(${p * 360})`} />;
      })}
    </g>
  );
};
const SEASONS = [
  { name: 'SUMMER', bg: '#8fd3ff', ground: '#7bd162', c: '#ffca3a' },
  { name: 'FALL', bg: '#ffe0b3', ground: '#c9a227', c: '#ff924c' },
  { name: 'WINTER', bg: '#dbe9ff', ground: '#ffffff', c: '#4cc9f0' },
  { name: 'SPRING', bg: '#d8f3dc', ground: '#95d5b2', c: '#ff6fa5' },
];
const SeasonTile: React.FC<{ season: number; t: number; w?: number }> = ({ season, t, w = 300 }) => {
  const s = SEASONS[season];
  const h = w;
  return (
    <g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={34} fill={s.bg} {...kst(8)} />
      <path d={`M ${-w / 2 + 4},${h * 0.18} Q 0,${h * 0.1} ${w / 2 - 4},${h * 0.18} L ${w / 2 - 4},${h / 2 - 30} Q ${w / 2 - 4},${h / 2 - 4} ${w / 2 - 30},${h / 2 - 4} L ${-w / 2 + 30},${h / 2 - 4} Q ${-w / 2 + 4},${h / 2 - 4} ${-w / 2 + 4},${h / 2 - 30} Z`} fill={s.ground} />
      {season === 0 && <g transform={`translate(${w * 0.3},${-h * 0.3}) scale(0.32)`}><Sun x={0} y={0} r={90} t={t} /></g>}
      {season === 2 && [0, 1, 2, 3, 4].map((k) => <Flake key={k} x={-w * 0.38 + k * w * 0.19} y={-h * 0.36 + ((t * 30 + k * 40) % (h * 0.5))} s={0.55} />)}
      <g transform={`translate(0,${h * 0.22}) scale(${w / 520})`}><SeasonTree season={season} t={t} /></g>
      <text y={h / 2 - 22} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={w * 0.15} fill={s.c} stroke={KINK} strokeWidth={5} paintOrder="stroke">{s.name}</text>
    </g>
  );
};

// top-down-ish Earth: tilted axis, our (north) half tinted warm (summer) or cold (winter), night side shaded
const BLOBS = [
  'M -1,0 Q -0.95,-0.85 0,-0.75 Q 0.9,-0.95 1,0 Q 0.85,0.9 0,0.8 Q -0.8,0.75 -1,0 Z',
  'M -0.9,0 Q -1,-0.7 -0.2,-0.9 Q 0.6,-0.6 1,-0.1 Q 0.7,0.8 0,0.9 Q -0.7,0.6 -0.9,0 Z',
];
const Earth: React.FC<{ id: string; r: number; tilt: number; sunAng: number; warm: number; axis?: number; houses?: boolean; t: number }> = ({ id, r, tilt, sunAng, warm, axis = 1, houses = false, t }) => {
  const north = warm >= 0 ? '#ffd166' : '#a0c4ff';
  const south = warm >= 0 ? '#a0c4ff' : '#ffd166';
  const a = Math.abs(warm);
  return (
    <g>
      <defs>
        <clipPath id={`e33${id}`}><circle r={r} /></clipPath>
      </defs>
      <circle r={r + r * 0.12} fill="none" stroke="#bde0fe" strokeWidth={r * 0.08} opacity={0.4} />
      <circle r={r} fill="#3aa6e8" />
      <g clipPath={`url(#e33${id})`}>
        <g transform={`rotate(${tilt})`}>
          {[[-0.35, -0.45, 0.42, 0], [0.4, -0.15, 0.36, 1], [-0.2, 0.42, 0.4, 1], [0.5, 0.5, 0.25, 0]].map(([x, y, s, b], i) => (
            <path key={i} d={BLOBS[b]} transform={`translate(${x * r},${y * r}) scale(${s * r})`} fill={i % 2 ? '#52b788' : '#8ac926'} stroke={KINK} strokeWidth={4 / (s * r)} />
          ))}
          <ellipse cx={0} cy={-r * 0.92} rx={r * 0.5} ry={r * 0.16} fill="#ffffff" />
          <ellipse cx={0} cy={r * 0.92} rx={r * 0.5} ry={r * 0.16} fill="#ffffff" />
          {a > 0 && <rect x={-r} y={-r} width={r * 2} height={r} fill={north} opacity={0.5 * a} />}
          {a > 0 && <rect x={-r} y={0} width={r * 2} height={r} fill={south} opacity={0.5 * a} />}
          <ellipse cx={0} cy={0} rx={r} ry={r * 0.22} fill="none" stroke="#ffffff" strokeWidth={r * 0.035} strokeDasharray={`${r * 0.08} ${r * 0.08}`} opacity={0.75} />
        </g>
        <g transform={`rotate(${(sunAng * 180) / PI})`}>
          <rect x={-r} y={-r} width={r * 0.95} height={r * 2} fill="#0b1033" opacity={0.45} />
        </g>
      </g>
      <circle r={r} fill="none" {...kst(Math.max(5, r * 0.07))} />
      <ellipse cx={-r * 0.42} cy={-r * 0.5} rx={r * 0.24} ry={r * 0.1} fill="#ffffff" opacity={0.3} transform={`rotate(-35 ${-r * 0.42} ${-r * 0.5})`} />
      {/* the axis: a stick through the poles */}
      {axis > 0 && (
        <g transform={`rotate(${tilt})`} opacity={Math.min(1, axis * 1.5)}>
          <line x1={0} y1={-r - r * 0.45 * axis} x2={0} y2={-r} stroke="#ff595e" strokeWidth={r * 0.08} strokeLinecap="round" />
          <line x1={0} y1={r} x2={0} y2={r + r * 0.45 * axis} stroke="#ff595e" strokeWidth={r * 0.08} strokeLinecap="round" />
          <circle cx={0} cy={-r - r * 0.45 * axis} r={r * 0.1} fill="#ffca3a" {...kst(Math.max(3, r * 0.03))} />
        </g>
      )}
      {houses && (
        <g transform={`rotate(${tilt})`}>
          {[-1, 1].map((k) => (
            <g key={k} transform={`translate(${-r * 0.08},${k * r * 0.52}) rotate(${-tilt}) scale(${r / 230})`}>
              <rect x={-30} y={-52} width={60} height={52} fill="#ffffff" {...kst(6)} />
              <path d="M -42,-48 L 0,-86 L 42,-48 Z" fill="#ff595e" {...kst(6)} />
              <rect x={-8} y={-22} width={16} height={22} fill="#a0673c" {...kst(3)} />
              {k < 0 ? (
                <g transform="translate(70,-90)"><circle r={26} fill="#ffd166" {...kst(4)} />{Array.from({ length: 8 }).map((_, i) => <line key={i} x1={0} y1={-34} x2={0} y2={-46} stroke="#ffb703" strokeWidth={6} strokeLinecap="round" transform={`rotate(${i * 45 + t * 20})`} />)}</g>
              ) : (
                <g>{[0, 1, 2].map((i) => <Flake key={i} x={-40 + i * 50} y={-120 + ((t * 40 + i * 30) % 60)} s={0.9} />)}<path d="M -44,-50 L 0,-90 L 44,-50 Q 0,-70 -44,-50 Z" fill="#ffffff" {...kst(4)} /></g>
              )}
            </g>
          ))}
        </g>
      )}
    </g>
  );
};

const Rays: React.FC<{ from: [number, number]; to: [number, number]; r: number; t: number; o: number }> = ({ from, to, r, t, o }) => {
  const ang = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const nx = -Math.sin(ang);
  const ny = Math.cos(ang);
  return (
    <g opacity={o}>
      {[-0.6, 0, 0.6].map((k, i) => {
        const sx = from[0] + Math.cos(ang) * 120 + nx * k * 60;
        const sy = from[1] + Math.sin(ang) * 120 + ny * k * 60;
        const ex = to[0] - Math.cos(ang) * r * 1.05 + nx * k * r * 0.8;
        const ey = to[1] - Math.sin(ang) * r * 1.05 + ny * k * r * 0.8;
        const q = (t * 0.9 + i / 3) % 1;
        return (
          <g key={i}>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="#ffd166" strokeWidth={10} strokeLinecap="round" opacity={0.75} />
            <circle cx={sx + (ex - sx) * q} cy={sy + (ey - sy) * q} r={9} fill="#ffffff" />
          </g>
        );
      })}
    </g>
  );
};

const Flashlight: React.FC = () => (
  <g>
    <rect x={-30} y={-150} width={60} height={110} rx={14} fill="#1982c4" {...kst(6)} />
    <path d="M -30,-40 L -46,10 L 46,10 L 30,-40 Z" fill="#4cc9f0" {...kst(6)} />
    <rect x={-12} y={-120} width={24} height={30} rx={6} fill="#ffca3a" {...kst(4)} />
  </g>
);
// one torch panel: the flashlight at angle `ang` (0 = straight down) over a sheet of paper
const TorchPanel: React.FC<{ ang: number; on: number; glow: boolean; t: number }> = ({ ang, on, glow, t }) => {
  const rad = (ang * PI) / 180;
  const hx = Math.sin(rad) * -170;
  const hy = -170 * Math.cos(rad) - 20;
  const spotW = 70 / Math.max(0.35, Math.cos(rad));
  const bright = Math.cos(rad);
  return (
    <g>
      <path d="M -170,110 L 170,110 L 150,170 L -150,170 Z" fill="#c9cfe0" {...kst(5)} />
      {on > 0 && (
        <g opacity={on}>
          <path d={`M ${hx - 22 * Math.cos(rad)},${hy + 10} L ${-spotW},140 L ${spotW},140 L ${hx + 22 * Math.cos(rad)},${hy + 10} Z`} fill="#fff3b0" opacity={0.42 * bright + 0.1} />
          <ellipse cx={0} cy={140} rx={spotW} ry={22} fill={bright > 0.9 ? '#ffd60a' : '#fff3b0'} opacity={0.3 + 0.7 * bright * bright} />
          {glow && <ellipse cx={0} cy={140} rx={spotW + 14 + 4 * Math.sin(t * 8)} ry={34} fill="none" stroke="#ffca3a" strokeWidth={6} />}
        </g>
      )}
      <g transform={`translate(${hx},${hy}) rotate(${ang})`}><Flashlight /></g>
    </g>
  );
};

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

export default function KidsScience033() {
  const t = useT();
  const cam = camAt(t, CAM);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);

  const meadow = t < SPACE0 || t >= END0;
  const space = !meadow && !within(t, C0, C1);
  const orbitOn = space && (t < C1 || t >= WOW0) && !within(t, C1, R0) && !within(t, R0, WOW0);
  const torchOn = within(t, C0, C1);
  const otherOn = within(t, C1, R0);
  const recapOn = within(t, R0, WOW0);

  // orbit state
  const th = thetaAt(t);
  const [ex, ey] = orbitXY(th);
  const sunAng = Math.atan2(SUN_XY[1] - ey, SUN_XY[0] - ex);
  const axisIn = EASE_OUT(prog(t, word('tilt', 5) - 0.2, word('tilt', 5) + 0.6));
  // north leans toward the Sun when the Sun is to the right (θ near ±π): warm = −cos θ
  const seasonOn = t >= S('lean_in') - 0.2;
  const warm = seasonOn ? -Math.cos(th) : 0;
  const yearArc = within(t, S('around'), S('tilt') - 0.2);
  // which season label is lit
  const lbl = (k: number) => {
    const at = [word('lean_in', 17), word('between', 5), word('lean_out', 16), word('between', 7)][k];
    return t >= at - 0.1;
  };
  const LBL_XY: [number, number][] = [[150, 400], [180, 935], [930, 400], [540, 245]];
  const brrr = within(t, word('lean_out', 14) - 0.1, S('between'));
  const leaning = within(t, S('lean_turn'), E('lean_turn') + 0.6);
  const lean = leaning ? Math.sin((t - S('lean_turn')) * 2.6) * 16 : 0;
  const hootTilt = within(t, word('tilt', 7), S('say')) ? -24 : leaning ? lean : 0;

  // torch
  const straightOn = EASE_OUT(prog(t, word('torch', 8) - 0.1, word('torch', 8) + 0.4));
  const tiltAng = EASE_INOUT(prog(t, word('torch', 11) - 0.1, word('torch', 11) + 0.8)) * 55;
  const glowL = within(t, word('see', 4) - 0.1, word('see', 7) - 0.1);
  const glowR = within(t, word('see', 10) - 0.1, E('see') + 0.8);
  // guess bubble: the Sun near (big) then far (small)
  const gBig = EASE_OUT(prog(t, word('guess', 6) - 0.1, word('guess', 6) + 0.4));
  const gSmall = EASE_OUT(prog(t, word('guess', 11) - 0.1, word('guess', 11) + 0.5));
  const gSun = 0.35 + gBig * 0.55 - gSmall * 0.7;
  const gWinter = t >= word('guess', 9) - 0.1;

  const lookUp: [number, number] = space || torchOn ? [0.2, -0.9] : [0, 0];
  const endOn = t >= END0;

  return (
    <>
      <KidsStage cam={cam}>
        {meadow && <Meadow w={W} h={H} t={t} />}
        {/* HOOK: the four seasons, one tile per spoken season */}
        {t < S('guess') + 0.2 && [0, 1, 2, 3].map((k) => {
          const at = word('why', 4 + k);
          const s = EASE_OUT(prog(t, at - 0.05, at + 0.35)) * (1 - EASE_INOUT(prog(t, S('guess') - 0.2, S('guess') + 0.2)));
          if (s <= 0) return null;
          return (
            <g key={k} transform={`translate(${360 + (k % 2) * 360},${520 + Math.floor(k / 2) * 360}) scale(${s}) rotate(${(k % 2 ? 3 : -3)})`}>
              <SeasonTile season={k} t={t} w={320} />
            </g>
          );
        })}
        {/* Leo's wrong guess: the Sun comes closer in summer, goes far away in winter */}
        {within(t, S('guess') + 0.2, SPACE0) && (
          <g opacity={EASE_OUT(prog(t, S('guess') + 0.2, S('guess') + 0.6))}>
            <Bubble x={600} y={740} w={480} h={360} tx={lfx - 60} ty={lfy - 250}>
              <g transform="translate(600,720)">
                <g transform={`translate(${-60 + (1 - gSmall) * 0 + gSmall * -60},0) scale(${Math.max(0.12, gSun)})`}><Sun x={0} y={0} r={90} t={t} /></g>
                <g transform="translate(140,30)">
                  <circle r={30} fill="#3aa6e8" {...kst(5)} />
                  <path d="M -16,-10 Q -4,-22 10,-12 Q 6,4 -10,6 Z" fill="#8ac926" />
                </g>
                <text x={0} y={140} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={44} fill={gWinter ? '#4cc9f0' : '#ff924c'}>{gWinter ? 'WINTER: far?' : 'SUMMER: close?'}</text>
              </g>
            </Bubble>
          </g>
        )}

        {/* SPACE */}
        {space && <SpaceBg t={t} />}
        {orbitOn && (() => {
          const behind = Math.sin(th) < 0; // the back half of the orbit is behind the Sun
          const earth = (
            <g transform={`translate(${ex},${ey}) scale(${EASE_OUT(prog(t, SPACE0, SPACE0 + 0.7))})`}>
              <Earth id="o" r={ER} tilt={TILT} sunAng={sunAng} warm={warm * EASE_OUT(prog(t, word('lean_in', 8), word('lean_in', 10)))} axis={t >= WOW0 ? 1 : axisIn} t={t} />
            </g>
          );
          return (
            <g>
              <ellipse cx={SUN_XY[0]} cy={SUN_XY[1]} rx={ORX} ry={ORY} fill="none" stroke="#ffffff" strokeWidth={6} strokeDasharray="18 16" opacity={0.55} />
              {yearArc && (
                <path d={`M ${SUN_XY[0] - ORX},${SUN_XY[1]} A ${ORX},${ORY} 0 1 0 ${SUN_XY[0] + ORX},${SUN_XY[1]} A ${ORX},${ORY} 0 1 0 ${SUN_XY[0] - ORX},${SUN_XY[1]}`}
                  fill="none" stroke="#ffca3a" strokeWidth={10} pathLength={1} strokeDasharray={`${EASE_INOUT(prog(t, S('around') + 0.3, E('around') - 0.2))} 1`} />
              )}
              {behind && earth}
              {within(t, S('lean_in'), C0) && <Rays from={SUN_XY} to={[ex, ey]} r={ER} t={t} o={0.85} />}
              <g transform={`translate(${SUN_XY[0]},${SUN_XY[1]})`}><Sun x={0} y={0} r={135} t={t} /></g>
              {!behind && earth}
              {brrr && [0, 1, 2, 3, 4].map((k) => <Flake key={k} x={ex - 130 + k * 65} y={ey - 170 + ((t * 50 + k * 37) % 130)} s={1.3} o={0.95} />)}
              {/* season labels around the orbit */}
              {seasonOn && t < S('lean_turn') && [0, 1, 2, 3].map((k) => {
                if (!lbl(k)) return null;
                const [lx, ly] = LBL_XY[k];
                const at = [word('lean_in', 17), word('between', 5), word('lean_out', 16), word('between', 7)][k];
                return (
                  <g key={k} transform={`translate(${lx},${ly}) scale(${EASE_OUT(prog(t, at - 0.1, at + 0.3))})`}>
                    <SeasonTile season={k} t={t} w={230} />
                  </g>
                );
              })}
            </g>
          );
        })()}
        {/* the flashlight demo */}
        {torchOn && (
          <g>
            <rect width={W} height={f} fill="#2e2a5c" />
            <rect y={f} width={W} height={H - f} fill="#4a3f7a" />
            <line x1={0} y1={f} x2={W} y2={f} {...kst(7)} />
            <g transform={`translate(${W / 2},640) scale(${EASE_OUT(prog(t, C0, C0 + 0.5))})`}>
              <rect x={-480} y={-370} width={960} height={680} rx={44} fill="#1d2156" {...kst(8)} />
              <g transform="translate(-235,0)"><TorchPanel ang={0} on={straightOn} glow={glowL} t={t} /></g>
              {t >= word('torch', 11) - 0.2 && <g transform="translate(235,0)"><TorchPanel ang={tiltAng} on={straightOn} glow={glowR} t={t} /></g>}
              <line x1={0} y1={-340} x2={0} y2={280} stroke="#ffffff" strokeWidth={4} strokeDasharray="14 12" opacity={0.4} />
              {t >= word('see', 4) - 0.1 && (
                <g>
                  <g transform="translate(-370,236) scale(0.6)"><Sun x={0} y={0} r={40} t={t} /></g>
                  <text x={-210} y={252} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill="#ffca3a">SUMMER</text>
                </g>
              )}
              {t >= word('see', 10) - 0.1 && (
                <g>
                  <Flake x={110} y={238} s={0.9} />
                  <text x={260} y={252} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill="#4cc9f0">WINTER</text>
                </g>
              )}
            </g>
          </g>
        )}
        {/* summer on our side, winter on the other side */}
        {otherOn && (
          <g>
            <Rays from={[60, 640]} to={[620, 640]} r={250} t={t} o={0.85} />
            <g transform="translate(20,640)"><Sun x={0} y={0} r={150} t={t} /></g>
            <g transform={`translate(620,640) scale(${EASE_OUT(prog(t, C1, C1 + 0.6))})`}>
              <Earth id="b" r={250} tilt={-TILT} sunAng={PI} warm={1} houses={t >= S('other') + 0.3} t={t} />
            </g>
            {t >= word('other', 4) - 0.1 && (
              <g transform={`translate(860,330) scale(${EASE_OUT(prog(t, word('other', 4) - 0.1, word('other', 4) + 0.3))})`}>
                <rect x={-120} y={-44} width={240} height={80} rx={28} fill="#ffd166" {...kst(6)} />
                <text y={18} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={50} fill={KINK}>SUMMER</text>
              </g>
            )}
            {t >= word('other', 12) - 0.1 && (
              <g transform={`translate(860,960) scale(${EASE_OUT(prog(t, word('other', 12) - 0.1, word('other', 12) + 0.3))})`}>
                <rect x={-120} y={-44} width={240} height={80} rx={28} fill="#a0c4ff" {...kst(6)} />
                <text y={18} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={50} fill={KINK}>WINTER</text>
              </g>
            )}
          </g>
        )}
        {/* recap cards */}
        {recapOn && (['r1', 'r2', 'r3'] as const).map((k, i) => {
          const s = EASE_OUT(prog(t, S(k) - 0.1, S(k) + 0.35));
          if (s <= 0) return null;
          return (
            <g key={k} transform={`translate(${200 + i * 340},640) scale(${s})`}>
              <rect x={-150} y={-170} width={300} height={370} rx={40} fill="#ffffff" {...kst(8)} />
              <g transform="translate(0,-20)">
                {i === 0 && (
                  <g>
                    <ellipse rx={110} ry={44} fill="none" stroke="#adb5bd" strokeWidth={5} strokeDasharray="10 8" />
                    <Sun x={0} y={0} r={42} t={t} />
                    <g transform={`translate(${Math.cos(t * 1.5) * 110},${Math.sin(t * 1.5) * 44})`}><circle r={22} fill="#3aa6e8" {...kst(4)} /></g>
                  </g>
                )}
                {i === 1 && <Earth id="r2" r={80} tilt={TILT} sunAng={0} warm={0} axis={1} t={t} />}
                {i === 2 && (
                  <g>
                    <g transform="translate(-62,-30)"><Earth id="r3a" r={52} tilt={-TILT} sunAng={PI} warm={1} axis={0.8} t={t} /></g>
                    <g transform="translate(-62,58) scale(0.3)"><Sun x={0} y={0} r={90} t={t} /></g>
                    <g transform="translate(62,-30)"><Earth id="r3b" r={52} tilt={TILT} sunAng={PI} warm={-1} axis={0.8} t={t} /></g>
                    <Flake x={62} y={58} s={1.1} />
                    <Flake x={62} y={58} s={1.1} />
                  </g>
                )}
              </g>
              <circle cx={-130} cy={-150} r={36} fill={['#ffca3a', '#ff595e', '#4cc9f0'][i]} {...kst(5)} />
              <text x={-130} y={-136} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill="#ffffff">{i + 1}</text>
              <text y={160} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={i === 2 ? 34 : 38} fill={KINK}>{['goes around', 'is tilted', 'lean in / away'][i]}</text>
            </g>
          );
        })}
        {/* wow: a birthday cake rides along for one more lap */}
        {t >= WOW0 && t < END0 && t >= word('wow', 3) - 0.1 && (
          <g transform={`translate(${ex},${ey - ER - 90}) scale(${EASE_OUT(prog(t, word('wow', 3) - 0.1, word('wow', 3) + 0.4))})`}>
            <rect x={-50} y={-10} width={100} height={54} rx={10} fill="#ff8fab" {...kst(5)} />
            <rect x={-50} y={-10} width={100} height={16} fill="#ffffff" opacity={0.75} />
            {[-24, 0, 24].map((x) => <g key={x}><rect x={x - 5} y={-40} width={10} height={30} fill="#4cc9f0" {...kst(3)} /><path d={`M ${x},-42 q -7,-10 0,-20 q 7,10 0,20`} fill="#ffca3a" /></g>)}
          </g>
        )}

        <Kid spec={MILA_HERO} x={MILA_X} y={f} scale={KID_S} lean={lean}
          expr={t < S('guess') ? 'wow' : endOn || leaning ? 'laugh' : within(t, S('see'), S('leo_wow')) ? 'wow' : space || torchOn ? 'happy' : 'smile'}
          look={t < S('guess') ? [0.4, -0.7] : lookUp} mouth={lipSync(VO, 'mila', t)}
          armL={endOn ? 'wave' : t < S('guess') ? 'think' : leaning ? 'up' : 'down'}
          armR={within(t, S('see'), E('see')) ? 'point' : within(t, S('r1'), E('r3')) ? 'up' : endOn || leaning ? 'up' : 'hip'}
          hop={endOn ? Math.abs(Math.sin((t - END0) * 6)) * 30 : 0} />
        <Critter spec={HOOT_HERO} x={HOOT_X} y={f} scale={0.55} tilt={hootTilt}
          expr={talks('hoot') ? 'happy' : t >= S('leo_wow') || leaning ? 'laugh' : 'smile'}
          look={(space || torchOn) && !talks('hoot') ? [0.2, -0.8] : [0, 0]} mouth={lipSync(VO, 'hoot', t)}
          armR={talks('hoot') && (space || torchOn) ? 'point' : endOn ? 'wave' : leaning ? 'up' : 'down'} armL={within(t, S('say'), E('say')) || leaning ? 'up' : 'down'} />
        <Kid spec={LEO_HERO} x={LEO_X} y={f} scale={KID_S} lean={-lean}
          expr={within(t, S('guess'), E('good')) ? (t < S('good') ? 'laugh' : 'oops') : t >= S('leo_wow') || leaning ? 'laugh' : space ? 'wow' : 'happy'}
          look={lookUp} mouth={lipSync(VO, 'leo', t)}
          armL={within(t, S('guess'), E('guess')) || within(t, S('leo_say'), E('leo_say')) || leaning ? 'up' : endOn ? 'wave' : 'down'}
          armR={within(t, S('leo_wow'), E('leo_wow')) || leaning ? 'up' : endOn ? 'wave' : 'hip'}
          hop={within(t, S('leo_wow'), E('leo_wow') + 0.5) ? Math.abs(Math.sin((t - S('leo_wow')) * 7)) * 40 : 0} />
      </KidsStage>
      <PopText t={t} at={S('why') + 0.2} until={S('guess') - 0.2} text="4 SEASONS!" y={200} size={120} color="#ffca3a" />
      <PopText t={t} at={word('around', 12)} until={S('tilt') - 0.2} text="1 TRIP = 1 YEAR!" y={190} size={96} color="#ffca3a" />
      <PopText t={t} at={word('tilt', 5)} until={E('say') + 0.1} text="TILT!" y={190} size={150} color="#ff595e" />
      <PopText t={t} at={E('say') + 0.1} until={S('leo_say') - 0.1} text="YOUR TURN!" y={190} size={120} color="#ffffff" />
      <PopText t={t} at={word('lean_in', 8)} until={word('lean_in', 12)} text="STRONG SUNSHINE" y={170} size={84} color="#ffd166" />
      <PopText t={t} at={word('lean_in', 12)} until={word('lean_in', 17) - 0.1} text="LONG DAYS" y={170} size={96} color="#ffd166" />
      <PopText t={t} at={word('lean_out', 7)} until={word('lean_out', 10)} text="WEAK SUNSHINE" y={170} size={84} color="#a0c4ff" />
      <PopText t={t} at={word('lean_out', 10)} until={word('lean_out', 14)} text="SHORT DAYS" y={170} size={96} color="#a0c4ff" />
      <PopText t={t} at={word('lean_out', 14)} until={word('lean_out', 16) - 0.1} text="BRRR!" y={170} size={140} color="#ffffff" />
      <PopText t={t} at={S('lean_turn') + 0.3} until={E('lean_turn') + 0.6} text="LEAN, LEAN!" y={190} size={120} color="#ffca3a" />
      <PopText t={t} at={S('torch') + 0.2} until={word('torch', 8) - 0.2} text="WITH A GROWN-UP!" y={250} size={96} color="#ff924c" />
      <PopText t={t} at={S('leo_wow') + 0.3} until={S('other') - 0.2} text="IT'S THE TILT!" y={190} size={120} color="#ffca3a" />
      <PopText t={t} at={S('recap')} until={S('r1') - 0.2} text="LET'S REMEMBER!" y={360} size={110} color="#ffca3a" />
      <PopText t={t} at={word('wow', 3)} until={END0} text="HAPPY TRIP AROUND THE SUN!" y={190} size={76} color="#ff8fab" />
      <Confetti t={t} at={S('leo_wow')} y={600} />
      <Confetti t={t} at={word('wow', 3)} y={400} />
      <Confetti t={t} at={S('end')} y={500} />
      <KidsCaptions lines={VO} t={t} colors={CAPTION_COLORS} />
    </>
  );
}
