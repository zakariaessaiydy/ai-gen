// Star systems, top down — the "suns" niche kit.
// Units are the astronomer's: AU, years, solar masses, solar luminosities. In those units
// Kepler's third law is P^2 = a^3 / M and sunlight is L / d^2 (1.0 = what Earth gets today),
// so every number on screen is one of those two formulas read back, never typed.
import React from 'react';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const DAYS_PER_YEAR = 365.25;

// ---------------------------------------------------------------------------------------------
// PHYSICS
// ---------------------------------------------------------------------------------------------
// luminosity from radius (R_sun) and effective temperature (K) — Stefan-Boltzmann, solar-scaled
export const lum = (R: number, T: number) => R * R * Math.pow(T / 5772, 4);
// sunlight at distance a (AU) from total luminosity L, relative to Earth today
export const flux = (L: number, a: number) => L / (a * a);
// the distance at which luminosity L delivers relative flux F
export const distanceFor = (L: number, F = 1) => Math.sqrt(L / F);
// orbital period in years around total mass M (solar masses)
export const periodYears = (a: number, M: number) => Math.sqrt((a * a * a) / M);
export const periodDays = (a: number, M: number) => periodYears(a, M) * DAYS_PER_YEAR;
// Holman & Wiegert (1999) critical circumbinary radius, in units of the binary separation,
// for a circular binary with mass ratio mu = mB / (mA + mB).
export const circumbinaryLimit = (mu: number) => 1.6 + 4.12 * mu - 5.09 * mu * mu;

export type Star = { m: number; L: number; r: number; core: string; glow: string };
// A system state: two stars (B may be absent: presence 0..1), their separation, one planet.
export type Sys = {
  A: Star;
  B: Star;
  bIn: number; // presence of star B, 0..1 — scales its mass, light and visibility
  abin: number; // AU between the stars
  a: number; // AU, planet orbit about the barycentre
};
export const massOf = (s: Sys) => s.A.m + s.B.m * s.bIn;
export const lumOf = (s: Sys) => s.A.L + s.B.L * s.bIn;
export const fluxOf = (s: Sys) => flux(lumOf(s), s.a);
export const yearOf = (s: Sys) => periodDays(s.a, massOf(s));

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpStar = (x: Star, y: Star, t: number): Star => ({
  m: lerp(x.m, y.m, t),
  L: lerp(x.L, y.L, t),
  r: lerp(x.r, y.r, t),
  core: mixHex(x.core, y.core, t),
  glow: mixHex(x.glow, y.glow, t),
});
export const mixSys = (x: Sys, y: Sys, t: number): Sys => ({
  A: lerpStar(x.A, y.A, t),
  B: lerpStar(x.B, y.B, t),
  bIn: lerp(x.bIn, y.bIn, t),
  abin: lerp(x.abin, y.abin, t),
  a: lerp(x.a, y.a, t),
});

// ---------------------------------------------------------------------------------------------
// PHASES — integrated, then quantised to whole laps so the video loops.
// Angular speed is 2*pi/P, so the planet genuinely slows when it moves out and the binary
// genuinely whirls faster than the planet. One time constant is solved so the planet makes
// exactly `planetLaps` over the composition; the binary is rounded to its nearest whole lap
// count (a sub-percent retime) so both return to frame 0's angles on the last frame.
// ---------------------------------------------------------------------------------------------
export type Phases = { planet: number[]; binary: number[]; binaryLaps: number };
export const integratePhases = (sysAt: (f: number) => Sys, frames: number, planetLaps: number): Phases => {
  const wp: number[] = [];
  const wb: number[] = [];
  for (let f = 0; f < frames; f++) {
    const s = sysAt(f);
    wp.push(1 / periodYears(s.a, massOf(s)));
    wb.push(1 / periodYears(s.abin, massOf(s)));
  }
  const sum = (w: number[]) => w.reduce((a, b) => a + b, 0);
  const k = planetLaps / sum(wp); // years per frame
  const binaryLaps = Math.max(1, Math.round(sum(wb) * k));
  const kb = binaryLaps / sum(wb);
  const cum = (w: number[], kk: number) => {
    const out: number[] = [0];
    for (let i = 0; i < w.length; i++) out.push(out[i] + w[i] * kk * 2 * Math.PI);
    return out; // out[frames] === laps * 2pi — the last frame's successor is frame 0
  };
  return { planet: cum(wp, k), binary: cum(wb, kb), binaryLaps };
};

// ---------------------------------------------------------------------------------------------
// COLOUR
// ---------------------------------------------------------------------------------------------
export function mixHex(a: string, b: string, t: number): string {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const x = p(a);
  const y = p(b);
  const c = x.map((v, i) => Math.round(v + (y[i] - v) * Math.max(0, Math.min(1, t))));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------------------------------------
// DRAWING (SVG, one <svg> the size of the frame)
// ---------------------------------------------------------------------------------------------
// deterministic starfield; twinkles run whole cycles over `loop` frames so the wrap is clean
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const Starfield: React.FC<{ frame: number; loop: number; n?: number; w?: number; h?: number }> = ({
  frame,
  loop,
  n = 110,
  w = 1080,
  h = 1920,
}) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const cyc = 1 + Math.floor(hash(i + 7) * 3);
      const tw = 0.55 + 0.45 * Math.sin((2 * Math.PI * cyc * frame) / loop + hash(i + 3) * 6.28);
      return (
        <circle
          key={i}
          cx={hash(i) * w}
          cy={hash(i + 101) * h}
          r={0.8 + hash(i + 55) * 1.7}
          fill="#dfe6f5"
          opacity={(0.15 + 0.45 * hash(i + 9)) * tw}
        />
      );
    })}
  </g>
);

export const SunDisc: React.FC<{ id: string; x: number; y: number; star: Star; o?: number; glowScale?: number }> = ({
  id,
  x,
  y,
  star,
  o = 1,
  glowScale = 3.2,
}) => {
  if (o <= 0.005) return null;
  return (
    <g opacity={o}>
      <defs>
        <radialGradient id={id}>
          <stop offset="0%" stopColor={star.glow} stopOpacity={0.55} />
          <stop offset="35%" stopColor={star.glow} stopOpacity={0.18} />
          <stop offset="100%" stopColor={star.glow} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={star.r * glowScale} fill={`url(#${id})`} />
      <circle cx={x} cy={y} r={star.r} fill={star.core} />
      <circle cx={x} cy={y} r={star.r * 0.62} fill="#ffffff" opacity={0.55} />
    </g>
  );
};

export const OrbitRing: React.FC<{
  cx: number;
  cy: number;
  r: number;
  color: string;
  o?: number;
  dashed?: boolean;
  width?: number;
  label?: string;
  labelAt?: 'top' | 'bottom';
  labelO?: number;
}> = ({ cx, cy, r, color, o = 1, dashed = false, width = 3, label, labelAt = 'top', labelO = 1 }) => {
  if (o <= 0.005) return null;
  const ly = labelAt === 'top' ? cy - r : cy + r;
  return (
    <g opacity={o}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dashed ? '10 12' : undefined} />
      {label ? (
        <g opacity={labelO}>
          <rect x={cx - label.length * 9.5 - 16} y={ly - 19} width={label.length * 19 + 32} height={38} rx={19} fill="#0b0e14" stroke={color} strokeOpacity={0.5} />
          <text x={cx} y={ly + 9} textAnchor="middle" fontFamily={FONT_BODY} fontWeight={600} fontSize={24} letterSpacing={3} fill={color}>
            {label}
          </text>
        </g>
      ) : null}
    </g>
  );
};

// An Earth that bakes: `heat` 0 = oceans and green land, 1 = scorched with a hot halo.
// `giant` 0..1 morphs it into a banded gas giant (circumbinary Saturn-likes, e.g. Kepler-16b).
export const Planet: React.FC<{ x: number; y: number; r: number; heat: number; giant?: number; spin: number }> = ({
  x,
  y,
  r,
  heat,
  giant = 0,
  spin,
}) => {
  const ocean = mixHex(mixHex('#3f7fd0', '#b8633a', heat), '#cdb68f', giant);
  const land = mixHex(mixHex('#5fae6b', '#7a3e24', heat), '#a88c64', giant);
  const clip = `pl-${Math.round(x)}-${Math.round(y)}`;
  const earthO = 1 - giant;
  return (
    <g>
      {heat > 0.01 ? <circle cx={x} cy={y} r={r * (1.7 + 0.5 * heat)} fill="#e8879f" opacity={0.28 * heat} /> : null}
      <defs>
        <clipPath id={clip}>
          <circle cx={x} cy={y} r={r} />
        </clipPath>
      </defs>
      <circle cx={x} cy={y} r={r} fill={ocean} />
      <g clipPath={`url(#${clip})`}>
        {/* continents drift with the planet's own spin */}
        <g opacity={earthO}>
          {[0, 1, 2].map((i) => {
            const u = ((spin / (2 * Math.PI) + i / 3) % 1 + 1) % 1;
            return <ellipse key={i} cx={x - r * 1.4 + u * r * 2.8} cy={y + (i - 1) * r * 0.55} rx={r * 0.42} ry={r * 0.3} fill={land} />;
          })}
        </g>
        <g opacity={giant}>
          {[-0.55, -0.15, 0.3, 0.65].map((b, i) => (
            <rect key={i} x={x - r} y={y + b * r - r * 0.09} width={r * 2} height={r * 0.18} fill="#9c7f58" opacity={0.7} />
          ))}
        </g>
        {/* night side */}
        <circle cx={x + r * 0.45} cy={y + r * 0.35} r={r * 1.05} fill="#05070b" opacity={0.35} />
      </g>
      <circle cx={x} cy={y} r={r} fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={1.5} />
    </g>
  );
};

// ---------------------------------------------------------------------------------------------
// THE GAUGE — sunlight relative to Earth today, with named thresholds.
// ---------------------------------------------------------------------------------------------
export type Mark = { v: number; label: string; color: string; side: 'above' | 'below'; o: number; pop?: number };
export const SunGauge: React.FC<{
  x: number;
  y: number;
  w: number;
  value: number;
  max: number;
  color: string;
  marks: Mark[];
  danger?: { from: number; o: number };
}> = ({ x, y, w, value, max, color, marks, danger }) => {
  const px = (v: number) => (Math.max(0, Math.min(max, v)) / max) * w;
  const H = 26;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: 110 }}>
      <div style={{ position: 'absolute', left: 0, top: 42, width: w, height: H, borderRadius: H / 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        {danger && danger.o > 0.01 ? (
          <div style={{ position: 'absolute', left: px(danger.from), top: 0, bottom: 0, right: 0, background: 'rgba(232,135,159,0.18)', opacity: danger.o }} />
        ) : null}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: px(value), borderRadius: H / 2, background: color, boxShadow: `0 0 24px ${color}` }} />
      </div>
      {marks.map((m, i) =>
        m.o > 0.01 ? (
          <div key={i} style={{ position: 'absolute', left: px(m.v), top: 0, height: 110, opacity: m.o }}>
            <div style={{ position: 'absolute', left: -1.5, top: 34, width: 3, height: H + 16, background: m.color }} />
            <div
              style={{
                position: 'absolute',
                top: m.side === 'above' ? 0 : 84,
                left: 0,
                transform: `translateX(-50%) scale(${1 + 0.12 * (m.pop ?? 0)})`,
                whiteSpace: 'nowrap',
                fontFamily: FONT_BODY,
                fontWeight: 600,
                fontSize: 22,
                letterSpacing: 2,
                color: m.color,
              }}
            >
              {m.label}
            </div>
          </div>
        ) : null,
      )}
    </div>
  );
};

export const Readout: React.FC<{ label: string; value: string; color?: string; pop?: number; w: number }> = ({
  label,
  value,
  color = '#ffffff',
  pop = 0,
  w,
}) => (
  <div style={{ width: w, textAlign: 'center' }}>
    <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 22, letterSpacing: 4, color: 'rgba(255,255,255,0.55)' }}>{label}</div>
    <div
      style={{
        fontFamily: FONT_MONO,
        fontWeight: 700,
        fontSize: 46,
        color,
        marginTop: 4,
        transform: `scale(${1 + 0.1 * pop})`,
        textShadow: pop > 0.05 ? `0 0 ${24 * pop}px ${color}` : undefined,
      }}
    >
      {value}
    </div>
  </div>
);

export const Tag: React.FC<{ x: number; y: number; text: string; color: string; o: number }> = ({ x, y, text, color, o }) =>
  o > 0.01 ? (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        opacity: o,
        whiteSpace: 'nowrap',
        fontFamily: FONT_DISPLAY,
        fontWeight: 700,
        fontSize: 30,
        letterSpacing: 2,
        color,
        padding: '6px 16px',
        borderRadius: 12,
        background: 'rgba(11,14,20,0.85)',
        border: `2px solid ${color}88`,
      }}
    >
      {text}
    </div>
  ) : null;
