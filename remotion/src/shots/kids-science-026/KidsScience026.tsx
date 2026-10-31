// TINY SPARKS · Day 26 · 🚀 Science for Kids #4 — "Why Do We Have Day and Night?" (Short 9:16)
// kids-shorts/tiny-sparks/science/day-026-why-do-we-have-day-and-night. Cues from VO via K (keys.gen.ts).
// HOOK: the meadow turns from day to night while Mila asks → GUESS (Leo: the Sun goes to bed) → MODEL in space
// (Hoot: Earth is a ball, the Sun always shines, Earth SPINS; the side facing the Sun = DAY, away = NIGHT —
// top-down diagram, left half lit) → OUR HOUSE rides the spin: a sky window shows "good morning" when it
// crosses into the light and "good night" when it turns away → YOUR TURN: spin like the Earth (the cast spins)
// → SEE IT with a grown-up (flashlight + ball + sticker) → "The Earth spins!" → the other side of the world
// (two houses: day here, night there) → RECAP (3 cards) → WOW (one spin = one day) → sunrise back to the
// day meadow (frame 0 == last frame look). Hero outfits (Spark Girl, Captain Leo, Professor Hoot).
import React from 'react';
import { Kid, kidFaceAt } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { CAPTION_COLORS, HOOT_HERO, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { AirTwinkles, FLOOR, Meadow, Sun } from '../../lib/kids/sets';
import { Bubble, Confetti, FONT_TOON, KidsCaptions, KidsStage, PopText, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { EASE_INOUT, EASE_OUT, prog } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsScience026', durationInSeconds: 112.0, fps: 30, width: 1080, height: 1920 };

const W = 1080;
const H = 1920;
const f = FLOOR(H);
type Key = keyof typeof K;
const S = (k: Key) => VO[K[k]].start;
const E = (k: Key) => VO[K[k]].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;
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
// word start inside a VO line (by index), for "Good morning!" / "Good night!" hits
const wordAt = (k: Key, i: number) => {
  const l = VO[K[k]];
  const w = (l as { words?: { start: number }[] }).words;
  return w && w[i] ? w[i].start : l.end - 1;
};
const mixHex = (a: string, b: string, p: number) => {
  const ca = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const cb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + ca.map((v, i) => Math.round(v + (cb[i] - v) * Math.max(0, Math.min(1, p))).toString(16).padStart(2, '0')).join('');
};

const MILA_X = 190;
const HOOT_X = 540;
const LEO_X = 890;
const KID_S = 0.62;
const [lfx, lfy] = kidFaceAt(LEO_X, f, KID_S);
const EARTH: [number, number] = [620, 650];
const ER = 230;

// ── scene windows
const A_END = S('ball') - 0.4; // intro meadow (day → night) + guess
const C0 = S('torch') - 0.3; // flashlight demo
const C1 = S('leo_wow') - 0.3;
const END0 = S('end') - 0.5; // sunrise back to the day meadow

// Earth rotation (deg, clockwise-positive SVG; the spin is counter-clockwise on screen, so it decreases)
const GM = wordAt('morning', 7) - 0.15; // "Good" of "Good morning!"
const GN = wordAt('evening', 7) - 0.15; // "Good" of "Good night!"
const HOUSE_KF: KF = [
  [S('house') - 0.3, 62],
  [S('morning') + 0.3, 56],
  [GM, 0],
  [S('evening') + 0.2, -90],
  [GN, -180],
  [S('word') - 0.2, -214],
];
const SPIN_V = 48; // deg/s free spin
const houseAngle = (t: number) => {
  if (t < S('house') - 0.3) return 62 + (S('house') - 0.3 - t) * SPIN_V; // spinning in before the house is shown
  if (t <= S('word') - 0.2) return lerpKF(t, HOUSE_KF);
  return -214 - (t - (S('word') - 0.2)) * SPIN_V;
};
const SPIN0 = S('spin') + 0.4;
const earthRot = (t: number) => {
  // before the spin line Earth is still; the continents are glued to the house angle afterwards
  const h0 = houseAngle(SPIN0);
  return t < SPIN0 ? h0 : houseAngle(t);
};

// ── art

const SpaceBg: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <defs>
      <linearGradient id="kSpace26" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#14143d" />
        <stop offset="1" stopColor="#3d2a78" />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#kSpace26)" />
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

const DarkRoom: React.FC = () => (
  <g>
    <rect width={W} height={f} fill="#2e2a5c" />
    <rect y={f - 130} width={W} height={130} fill="#29244f" />
    <rect y={f} width={W} height={H - f} fill="#4a3f7a" />
    <ellipse cx={W / 2} cy={f + 120} rx={380} ry={70} fill="#6a4c93" {...kst(6)} />
    <line x1={0} y1={f} x2={W} y2={f} {...kst(7)} />
  </g>
);

const House: React.FC<{ s?: number; night: number }> = ({ s = 1, night }) => (
  <g transform={`scale(${s})`}>
    <rect x={-30} y={-52} width={60} height={52} fill="#ffffff" {...kst(6)} />
    <path d="M -42,-48 L 0,-86 L 42,-48 Z" fill="#ff595e" {...kst(6)} />
    <rect x={-20} y={-40} width={16} height={16} fill={mixHex('#8ecae6', '#ffd166', night)} {...kst(3)} />
    <rect x={6} y={-40} width={16} height={16} fill={mixHex('#8ecae6', '#ffd166', night)} {...kst(3)} />
    <rect x={-8} y={-20} width={16} height={20} fill="#a0673c" {...kst(3)} />
  </g>
);

// top-down Earth: the Sun is on the LEFT, so the left half is lit (day) and the right half is dark (night)
const CONT: [number, number, number, number][] = [
  [10, 0.55, 0.36, 0], [80, 0.45, 0.3, 1], [150, 0.6, 0.28, 2], [215, 0.5, 0.34, 1], [290, 0.55, 0.3, 0], [0, 0, 0.2, 2],
];
const BLOB = [
  'M -1,0 Q -0.95,-0.85 0,-0.75 Q 0.9,-0.95 1,0 Q 0.85,0.9 0,0.8 Q -0.8,0.75 -1,0 Z',
  'M -1,-0.2 Q -0.6,-1 0.2,-0.8 Q 1,-0.6 0.9,0.2 Q 0.6,1 -0.2,0.8 Q -1,0.6 -1,-0.2 Z',
  'M -0.9,0 Q -1,-0.7 -0.2,-0.9 Q 0.6,-0.6 1,-0.1 Q 0.7,0.8 0,0.9 Q -0.7,0.6 -0.9,0 Z',
];
const Earth: React.FC<{ id: string; r: number; rot: number; houses?: number[]; shade?: number }> = ({ id, r, rot, houses = [], shade = 1 }) => (
  <g>
    <circle r={r + 16} fill="none" stroke="#bde0fe" strokeWidth={12} opacity={0.45} />
    <defs>
      <clipPath id={`ec${id}`}><circle r={r} /></clipPath>
      <linearGradient id={`es${id}`} gradientUnits="userSpaceOnUse" x1={-r * 0.1} y1={0} x2={r * 0.14} y2={0}>
        <stop offset="0" stopColor="#0b1033" stopOpacity={0} />
        <stop offset="1" stopColor="#0b1033" stopOpacity={0.62} />
      </linearGradient>
    </defs>
    <circle r={r} fill="#3aa6e8" />
    <g clipPath={`url(#ec${id})`}>
      <g transform={`rotate(${rot})`}>
        {CONT.map(([a, d, s, b], i) => {
          const rad = (a * Math.PI) / 180;
          return <path key={i} d={BLOB[b]} transform={`translate(${Math.sin(rad) * d * r},${-Math.cos(rad) * d * r}) rotate(${a}) scale(${s * r})`} fill={i % 2 ? '#52b788' : '#8ac926'} stroke={KINK} strokeWidth={5 / (s * r)} />;
        })}
        <ellipse cx={0} cy={0} rx={r * 0.16} ry={r * 0.16} fill="#ffffff" opacity={0.9} />
      </g>
      {shade > 0 && <rect x={-r * 0.1} y={-r} width={r * 1.1} height={r * 2} fill={`url(#es${id})`} opacity={shade} />}
    </g>
    <circle r={r} fill="none" {...kst(8)} />
    <ellipse cx={-r * 0.45} cy={-r * 0.55} rx={r * 0.22} ry={r * 0.1} fill="#ffffff" opacity={0.3} transform={`rotate(-35 ${-r * 0.45} ${-r * 0.55})`} />
    {houses.map((h, i) => {
      const night = Math.max(0, Math.min(1, Math.sin((h * Math.PI) / 180) * 4 + 0.5));
      return (
        <g key={i} transform={`rotate(${h}) translate(0,${-r + 4})`}>
          <House s={r / 230} night={night} />
        </g>
      );
    })}
  </g>
);

// the light wedge from the Sun to Earth's day side
const LightWedge: React.FC<{ sx: number; sy: number; ex: number; ey: number; r: number; o: number; t: number }> = ({ sx, sy, ex, ey, r, o, t }) => (
  <g opacity={o}>
    <path d={`M ${sx},${sy - 120} L ${ex},${ey - r} L ${ex},${ey + r} L ${sx},${sy + 120} Z`} fill="#fff3b0" opacity={0.2} />
    {[0, 1, 2, 3].map((i) => {
      const q = (t * 0.7 + i / 4) % 1;
      const yy = sy + (i - 1.5) * 60;
      const ty = ey + (i - 1.5) * r * 0.5;
      return <circle key={i} cx={sx + (ex - r * 0.9 - sx) * q} cy={yy + (ty - yy) * q} r={10} fill="#fff3b0" opacity={0.9 * Math.sin(q * Math.PI)} />;
    })}
  </g>
);

// what our house sees: a little sky window (day ↔ night)
const SkyWindow: React.FC<{ day: number; t: number }> = ({ day, t }) => (
  <g>
    <rect x={-260} y={-120} width={520} height={240} rx={34} fill={mixHex('#1d2156', '#7ec8f8', day)} {...kst(8)} />
    <g opacity={1 - day}>
      {[[-200, -70], [-120, -30], [-40, -80], [150, -60], [210, -10], [60, -40]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={5} fill="#ffffff" opacity={0.6 + 0.4 * Math.sin(t * 3 + i)} />
      ))}
      <g transform="translate(150,-30)">
        <circle r={38} fill="#fff3b0" {...kst(5)} />
        <circle cx={18} cy={-12} r={34} fill={mixHex('#1d2156', '#7ec8f8', day)} />
      </g>
    </g>
    <g opacity={day} transform={`translate(-150,${-20 + (1 - day) * 60})`}>
      <circle r={44} fill="#ffd166" {...kst(5)} />
      <circle cx={-14} cy={-6} r={5} fill={KINK} />
      <circle cx={14} cy={-6} r={5} fill={KINK} />
      <path d="M -14,10 Q 0,20 14,10" fill="none" {...kst(4)} />
    </g>
    <path d="M -258,70 Q 0,30 258,70 L 258,90 Q 258,118 230,118 L -230,118 Q -258,118 -258,90 Z" fill={mixHex('#2d6a4f', '#7bd162', day)} {...kst(6)} />
    <g transform="translate(20,84)"><House s={0.9} night={1 - day} /></g>
  </g>
);

const SunInBed: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={-150} y={10} width={300} height={70} rx={20} fill="#8ecae6" {...kst(6)} />
    <rect x={-160} y={-30} width={26} height={120} rx={10} fill="#c0874f" {...kst(5)} />
    <rect x={134} y={0} width={26} height={90} rx={10} fill="#c0874f" {...kst(5)} />
    <g transform="translate(-60,-10)">
      <circle r={62} fill="#ffd166" {...kst(6)} />
      <path d="M -26,-4 Q -16,4 -6,-4 M 6,-4 Q 16,4 26,-4" fill="none" {...kst(5)} />
      <path d="M -40,-40 Q 0,-110 50,-60 L 70,-90" fill="#4cc9f0" {...kst(5)} />
      <circle cx={72} cy={-92} r={12} fill="#ffffff" {...kst(4)} />
    </g>
    {[0, 1, 2].map((k) => {
      const p = (t * 0.6 + k / 3) % 1;
      return <text key={k} x={30 + p * 70} y={-50 - p * 80} fontFamily={FONT_TOON} fontWeight={700} fontSize={36 + p * 18} fill="#6a4c93" opacity={1 - p}>z</text>;
    })}
  </g>
);

const Flashlight: React.FC = () => (
  <g>
    <rect x={-110} y={-30} width={150} height={60} rx={14} fill="#1982c4" {...kst(6)} />
    <path d="M 40,-30 L 90,-50 L 90,50 L 40,30 Z" fill="#4cc9f0" {...kst(6)} />
    <rect x={-60} y={-12} width={30} height={24} rx={6} fill="#ffca3a" {...kst(4)} />
  </g>
);

// flashlight + ball (top-down like the Earth diagram): the sticker goes into the light, then into the dark
const TorchDemo: React.FC<{ t: number; on: number; rot: number }> = ({ t, on, rot }) => {
  const r = 120;
  const sx = Math.sin((rot * Math.PI) / 180) * r;
  const sy = -Math.cos((rot * Math.PI) / 180) * r;
  const lit = sx < 0 && on > 0.5;
  return (
    <g>
      <rect x={-430} y={-260} width={860} height={520} rx={44} fill="#1d2156" {...kst(8)} />
      <g transform="translate(-300,0)"><Flashlight /></g>
      {on > 0 && <path d={`M -210,-40 L 230,-${r + 20} L 230,${r + 20} L -210,40 Z`} fill="#fff3b0" opacity={0.25 * on} />}
      <g transform="translate(230,0)">
        <defs>
          <clipPath id="ball26"><circle r={r} /></clipPath>
        </defs>
        <circle r={r} fill="#ff924c" {...kst(7)} />
        <g clipPath="url(#ball26)">
          <path d={`M ${-r},-30 Q 0,-60 ${r},-30 L ${r},10 Q 0,-20 ${-r},10 Z`} fill="#ffca3a" />
          <rect x={0} y={-r} width={r} height={r * 2} fill="#0b1033" opacity={0.55 * on + 0.25} />
          <rect x={-r} y={-r} width={r} height={r * 2} fill="#0b1033" opacity={0.6 * (1 - on)} />
        </g>
        <circle r={r} fill="none" {...kst(7)} />
        {/* the sticker: a little star on the edge */}
        <path d="M 0,-26 L 7,-8 L 26,-8 L 11,4 L 16,22 L 0,11 L -16,22 L -11,4 L -26,-8 L -7,-8 Z" transform={`translate(${sx * 0.9},${sy * 0.9}) rotate(${rot}) scale(1.7)`} fill={lit ? '#ffffff' : '#8d8db0'} {...kst(3)} />
        {lit && <circle cx={sx * 0.9} cy={sy * 0.9} r={60 + 6 * Math.sin(t * 8)} fill="#fff3b0" opacity={0.4} />}
        <path d={`M ${r + 40},-60 A ${r + 40},${r + 40} 0 0 0 ${r + 40},60`} fill="none" stroke="#ffffff" strokeWidth={10} strokeLinecap="round" opacity={0} />
      </g>
      {/* curved "turn it" arrow under the ball */}
      <path d="M 330,170 Q 230,240 130,170" fill="none" stroke="#ffffff" strokeWidth={12} strokeLinecap="round" />
      <path d="M 150,150 L 126,170 L 156,190" fill="none" stroke="#ffffff" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

const SpinArrow: React.FC<{ r: number; c?: string }> = ({ r, c = '#ffffff' }) => (
  <g>
    <path d={`M ${r * 0.7},${-r * 0.75} A ${r},${r} 0 0 0 ${-r * 0.75},${-r * 0.7}`} fill="none" stroke={c} strokeWidth={r * 0.12} strokeLinecap="round" />
    <path d={`M ${-r * 0.95},${-r * 0.9} L ${-r * 0.75},${-r * 0.68} L ${-r * 0.5},${-r * 0.9}`} fill="none" stroke={c} strokeWidth={r * 0.12} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

export default function KidsScience026() {
  const t = useT();
  const cam = camAt(t, CAM);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);

  const sceneA = t < A_END;
  const sceneTorch = within(t, C0, C1);
  const sceneEnd = t >= END0;
  const space = !sceneA && !sceneTorch && !sceneEnd;
  // intro: day → night while Mila asks; the end: night → day (sunrise)
  const nightA = EASE_INOUT(prog(t, S('why') + 0.3, E('why') + 0.4));
  const night = sceneA ? nightA : sceneEnd ? 1 - EASE_INOUT(prog(t, END0 + 0.2, END0 + 1.6)) : 0;
  const sunDrop = night * 520;

  const modelOn = space && t < C0;
  const rot = earthRot(t);
  const hA = houseAngle(t);
  const showHouse = within(t, S('house') - 0.3, C0);
  const lightIn = EASE_OUT(prog(t, S('shine'), S('shine') + 1.0));
  const shade = EASE_INOUT(prog(t, S('dayside') - 0.4, S('dayside') + 0.4));
  const labels = within(t, S('dayside') + 0.2, C0);
  const nightLbl = t >= S('nightside') + 0.2;
  const windowOn = within(t, S('house') + 0.2, S('word') - 0.2);
  const houseDay = Math.max(0, Math.min(1, -Math.sin((hA * Math.PI) / 180) * 4 + 0.5));
  const spinning = within(t, E('word') - 0.6, E('leo_say') + 0.4);
  const yourTurn = within(t, E('word') + 0.1, S('leo_say') - 0.1);
  const spinScale = (seed: number) => (spinning ? Math.cos((t - (E('word') - 0.6)) * Math.PI * 2 * 0.9 + seed * 0) : 1);

  // flashlight demo
  const beam = EASE_INOUT(prog(t, S('torch') + 1.6, S('torch') + 2.3));
  // the sticker turns in from the dark, enters the light on "light", and turns back into the dark on "dark"
  const DARK = E('see') + 0.8; // a slow half-turn after "light" (the words come fast; the eyes need time)
  const ballKF: KF = [[S('torch') + 2.6, 100], [S('see') - 0.6, 60], [wordAt('see', 6) - 0.1, -15], [DARK, -195]];
  const ballRot = t <= DARK ? lerpKF(t, ballKF) : -195 - (t - DARK) * 40;

  // leo_wow + other: two houses (day here, night there)
  const otherOn = within(t, C1, S('recap') - 0.3);
  const twoHouses = t >= S('other') - 0.2;
  const recapOn = within(t, S('recap') - 0.3, S('wow') - 0.3);
  const wowOn = within(t, S('wow') - 0.3, END0);
  const wowRot = -90 - EASE_INOUT(prog(t, S('wow') + 1.2, S('wow') + 4.6)) * 360;

  const lookUp: [number, number] = space || sceneTorch ? [0.2, -0.9] : [0, 0];
  const spinG = (x: number, el: React.ReactNode, seed: number) => (
    <g transform={`translate(${x},0) scale(${spinScale(seed)},1) translate(${-x},0)`}>{el}</g>
  );

  return (
    <>
      <KidsStage cam={cam}>
        {/* A + END: the meadow, with a night veil (stars + moon) that fades in / out */}
        {(sceneA || sceneEnd) && (
          <g>
            <Meadow w={W} h={H} t={t} sun={false} life={night < 0.5} />
            <g transform={`translate(0,${sunDrop})`} opacity={1 - night * 0.8}><Sun x={W * 0.8} y={H * 0.2} t={t} /></g>
            <rect width={W} height={H} fill="#141a4a" opacity={night * 0.72} />
            <g opacity={night}>
              {Array.from({ length: 26 }).map((_, i) => (
                <circle key={i} cx={(i * 263 + 40) % W} cy={(i * 389 + 60) % (H * 0.5)} r={3 + (i % 3) * 2} fill="#ffffff" opacity={0.5 + 0.4 * Math.sin(t * 1.6 + i)} />
              ))}
              <g transform={`translate(${W * 0.22},${H * 0.16 + (1 - night) * 200})`}>
                <circle r={84} fill="#fff3b0" opacity={0.25} />
                <circle r={64} fill="#fff3b0" {...kst(6)} />
                <circle cx={30} cy={-20} r={58} fill="#202660" />
              </g>
            </g>
          </g>
        )}
        {/* Leo's wrong guess: the Sun goes to bed */}
        {within(t, S('guess') + 0.3, S('good') + 1.4) && (
          <g opacity={EASE_OUT(prog(t, S('guess') + 0.3, S('guess') + 0.7))}>
            <Bubble x={620} y={720} w={440} h={330} tx={lfx - 60} ty={lfy - 250}>
              <g transform="translate(640,740)"><SunInBed t={t} /></g>
            </Bubble>
          </g>
        )}

        {/* SPACE: the model, the house, spin, the other side, recap, wow */}
        {space && <SpaceBg t={t} />}
        {modelOn && (
          <g>
            <g opacity={EASE_OUT(prog(t, A_END, A_END + 0.8))}>
              <g transform={`translate(${EARTH[0]},${EARTH[1]}) scale(${EASE_OUT(prog(t, S('ball') - 0.2, S('ball') + 0.6))})`}>
                <Earth id="m" r={ER} rot={rot} houses={showHouse ? [hA] : []} shade={shade} />
                {within(t, S('spin'), S('dayside')) && <g opacity={EASE_OUT(prog(t, S('spin'), S('spin') + 0.5))}><SpinArrow r={ER + 70} /></g>}
                {spinning && <SpinArrow r={ER + 70} c="#ffca3a" />}
              </g>
            </g>
            {lightIn > 0 && (
              <g>
                <LightWedge sx={40} sy={EARTH[1]} ex={EARTH[0]} ey={EARTH[1]} r={ER} o={lightIn} t={t} />
                <g transform={`translate(${20 + (1 - lightIn) * -300},${EARTH[1]})`}><Sun x={0} y={0} r={150} t={t} /></g>
              </g>
            )}
            {labels && (
              <g>
                <g transform={`translate(${EARTH[0] - 150},${EARTH[1] + ER + 92}) scale(${EASE_OUT(prog(t, S('dayside') + 0.2, S('dayside') + 0.6))})`}>
                  <rect x={-110} y={-48} width={220} height={86} rx={30} fill="#ffd166" {...kst(6)} />
                  <text y={20} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={58} fill={KINK}>DAY</text>
                </g>
                {nightLbl && (
                  <g transform={`translate(${EARTH[0] + 150},${EARTH[1] + ER + 92}) scale(${EASE_OUT(prog(t, S('nightside') + 0.2, S('nightside') + 0.6))})`}>
                    <rect x={-130} y={-48} width={260} height={86} rx={30} fill="#3d2a78" {...kst(6)} />
                    <text y={20} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={58} fill="#fff3b0">NIGHT</text>
                  </g>
                )}
              </g>
            )}
            {windowOn && (
              <g transform={`translate(${W / 2 + 60},165) scale(${EASE_OUT(prog(t, S('house') + 0.2, S('house') + 0.7))})`}>
                <SkyWindow day={houseDay} t={t} />
              </g>
            )}
          </g>
        )}
        {/* the flashlight demo in a dark room */}
        {sceneTorch && (
          <g>
            <DarkRoom />
            <g transform={`translate(${W / 2},620) scale(${EASE_OUT(prog(t, C0, C0 + 0.5))})`}>
              <TorchDemo t={t} on={beam} rot={ballRot} />
            </g>
          </g>
        )}
        {/* the other side of the world: day here, night there */}
        {otherOn && (
          <g>
            <LightWedge sx={40} sy={EARTH[1]} ex={EARTH[0]} ey={EARTH[1]} r={ER} o={1} t={t} />
            <g transform={`translate(20,${EARTH[1]})`}><Sun x={0} y={0} r={150} t={t} /></g>
            <g transform={`translate(${EARTH[0]},${EARTH[1]})`}>
              <Earth id="o" r={ER} rot={twoHouses ? -90 : rot} houses={twoHouses ? [-90, 90] : []} shade={1} />
              {!twoHouses && <SpinArrow r={ER + 70} c="#ffca3a" />}
            </g>
            {twoHouses && (
              <g>
                <g transform={`translate(${EARTH[0] - 130},${EARTH[1] - ER - 70}) scale(${EASE_OUT(prog(t, S('other') + 1.4, S('other') + 1.8))})`}>
                  <rect x={-120} y={-44} width={240} height={80} rx={28} fill="#ffd166" {...kst(6)} />
                  <text y={18} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={48} fill={KINK}>DAY</text>
                </g>
                <g transform={`translate(${EARTH[0] + 200},${EARTH[1] - ER - 70}) scale(${EASE_OUT(prog(t, S('other') + 0.5, S('other') + 0.9))})`}>
                  <rect x={-120} y={-44} width={240} height={80} rx={28} fill="#3d2a78" {...kst(6)} />
                  <text y={18} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={48} fill="#fff3b0">NIGHT</text>
                </g>
              </g>
            )}
          </g>
        )}
        {/* recap cards */}
        {recapOn &&
          (['r1', 'r2', 'r3'] as const).map((k, i) => {
            const s = EASE_OUT(prog(t, S(k) - 0.1, S(k) + 0.35));
            if (s <= 0) return null;
            return (
              <g key={k} transform={`translate(${200 + i * 340},620) scale(${s})`}>
                <rect x={-150} y={-160} width={300} height={350} rx={40} fill="#ffffff" {...kst(8)} />
                <g transform="translate(0,-20)">
                  {i === 0 && (
                    <g>
                      <Earth id="r1" r={80} rot={-((t * 60) % 360)} shade={0} />
                      <SpinArrow r={112} c="#ff924c" />
                    </g>
                  )}
                  {i === 1 && (
                    <g>
                      <g transform="translate(-85,-70)"><Sun x={0} y={0} r={40} t={t} /></g>
                      <g transform="translate(20,20)"><Earth id="r2" r={80} rot={-90} houses={[-90]} shade={1} /></g>
                    </g>
                  )}
                  {i === 2 && (
                    <g>
                      <g transform="translate(-10,20)"><Earth id="r3" r={80} rot={90} houses={[90]} shade={1} /></g>
                      <g transform="translate(90,-80)">
                        <circle r={34} fill="#fff3b0" {...kst(5)} />
                        <circle cx={16} cy={-10} r={30} fill="#ffffff" />
                      </g>
                    </g>
                  )}
                </g>
                <circle cx={-130} cy={-140} r={36} fill={['#ff924c', '#ffca3a', '#6a4c93'][i]} {...kst(5)} />
                <text x={-130} y={-126} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill="#ffffff">{i + 1}</text>
                <text y={160} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={i === 0 ? 44 : 38} fill={KINK}>{['Earth spins', 'Sun side = day', 'away = night'][i]}</text>
              </g>
            );
          })}
        {/* wow: one whole spin = one whole day */}
        {wowOn && (
          <g>
            <g transform={`translate(20,${EARTH[1]})`}><Sun x={0} y={0} r={150} t={t} /></g>
            <g transform={`translate(${EARTH[0]},${EARTH[1]}) scale(${EASE_OUT(prog(t, S('wow') - 0.3, S('wow') + 0.4))})`}>
              <Earth id="w" r={ER} rot={wowRot} houses={[wowRot]} shade={1} />
              <SpinArrow r={ER + 70} c="#ffca3a" />
            </g>
          </g>
        )}

        {spinG(MILA_X,
          <Kid spec={MILA_HERO} x={MILA_X} y={f} scale={KID_S}
            expr={t < S('guess') ? 'wow' : within(t, S('house'), E('house')) || spinning || sceneEnd ? 'laugh' : within(t, S('see'), E('see')) ? 'wow' : space || sceneTorch ? 'happy' : 'smile'}
            look={t < S('guess') ? [0.4, -0.7] : lookUp} mouth={lipSync(VO, 'mila', t)}
            armL={sceneEnd ? 'wave' : t < S('guess') ? 'think' : spinning ? 'up' : 'down'}
            armR={within(t, S('house'), E('house')) || within(t, S('see'), E('see')) ? 'point' : within(t, S('r1'), E('r3')) ? 'up' : sceneEnd || spinning ? 'up' : 'hip'}
            hop={sceneEnd ? Math.abs(Math.sin((t - END0) * 6)) * 30 : 0} />, 0)}
        {spinG(HOOT_X,
          <Critter spec={HOOT_HERO} x={HOOT_X} y={f} scale={0.55} expr={talks('hoot') ? 'happy' : spinning || t >= S('leo_wow') ? 'laugh' : 'smile'}
            look={(space || sceneTorch) && !talks('hoot') ? [0.2, -0.8] : [0, 0]} mouth={lipSync(VO, 'hoot', t)}
            armR={talks('hoot') && (space || sceneTorch) ? 'point' : sceneEnd ? 'wave' : spinning ? 'up' : 'down'} armL={spinning ? 'up' : 'down'} />, 1)}
        {spinG(LEO_X,
          <Kid spec={LEO_HERO} x={LEO_X} y={f} scale={KID_S}
            expr={within(t, S('guess'), E('good')) ? (t < S('good') ? 'laugh' : 'oops') : spinning || t >= S('leo_wow') ? 'laugh' : space ? 'wow' : 'happy'}
            look={lookUp} mouth={lipSync(VO, 'leo', t)}
            armL={within(t, S('guess'), E('guess')) || spinning || within(t, S('leo_wow'), E('leo_wow')) ? 'up' : sceneEnd ? 'wave' : 'down'}
            armR={spinning || within(t, S('leo_wow'), E('leo_wow')) ? 'up' : sceneEnd ? 'wave' : 'hip'}
            hop={within(t, S('leo_wow'), E('leo_wow') + 0.5) ? Math.abs(Math.sin((t - S('leo_wow')) * 7)) * 40 : 0} />, 2)}
      </KidsStage>
      <PopText t={t} at={S('why') + 0.2} until={S('guess') - 0.2} text="DAY & NIGHT?" y={300} size={130} color="#ffca3a" />
      <PopText t={t} at={S('spin') + 0.6} until={S('dayside') - 0.2} text="SPIN!" y={170} size={150} color="#ffca3a" />
      <PopText t={t} at={GM} until={GM + 2.2} text="GOOD MORNING!" y={345} size={84} color="#ffd166" />
      <PopText t={t} at={GN} until={S('word') - 0.2} text="GOOD NIGHT!" y={345} size={84} color="#b8a1e3" />
      <PopText t={t} at={S('word') + 0.3} until={E('word') + 0.1} text="SPIN LIKE EARTH!" y={170} size={100} color="#ffca3a" />
      <PopText t={t} at={E('word') + 0.1} until={S('leo_say') - 0.1} text="YOUR TURN!" y={170} size={120} color="#ffffff" />
      <PopText t={t} at={S('torch') + 0.2} until={S('see') - 0.3} text="WITH A GROWN-UP!" y={250} size={96} color="#ff924c" />
      <PopText t={t} at={S('leo_wow') + 0.3} until={S('other') - 0.2} text="THE EARTH SPINS!" y={190} size={100} color="#ffca3a" />
      <PopText t={t} at={S('recap')} until={S('r1') - 0.2} text="LET'S REMEMBER!" y={360} size={110} color="#ffca3a" />
      <PopText t={t} at={S('wow') + 1.0} until={END0} text="1 SPIN = 1 DAY!" y={190} size={110} color="#ffd166" />
      <Confetti t={t} at={S('leo_wow')} y={600} />
      <Confetti t={t} at={S('end')} y={500} />
      <KidsCaptions lines={VO} t={t} colors={CAPTION_COLORS} />
    </>
  );
}
