// =============================================================================
// lib/wave.tsx — THE WAVEFRONT RACE (a flash and its sound racing to a listener)
//
// First used by short-50 ("What If Sound Traveled as Fast as Light?").
//
// One scene, one physics rule, COMPUTED, never typed:
//   a source (lightning / volcano) fires at frame `at`; its light reaches the listener that same
//   frame, its sound front crawls across at `speed`. Every number on screen is distance / speed.
//
// The panel is drawn in LOCAL px (0..w, 0..h); the ground sits at `groundY`. Rings are clipped to
// the sky, so the sound front reads as a dome rolling over the land toward the listener.
// =============================================================================
import React from 'react';
import { Easing } from 'remotion';
import { FONT_BODY, FONT_MONO } from '../fonts';

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export const WV = {
  bg: '#0d1117',
  sky: '#141b26',
  skyHi: '#1c2433',
  ground: '#2a2f3a',
  sea: '#1d3b52',
  sand: '#c9b27c',
  panelBorder: 'rgba(255,255,255,0.08)',
  dim: '#8b949e',
  air: '#e8879f', // sound as it is today
  fast: '#4ecdc4', // sound at light speed
  light: '#f5d76e', // light
  ink: '#e6edf3',
} as const;

// =============================================================================
// THE PHYSICS
// =============================================================================
export const PHYS = {
  c: 299_792_458, // m/s, exact
  air: 343, // m/s, dry air at 20 °C
  steel: 5_960, // m/s, longitudinal
  cap: 36_000, // m/s, upper bound in condensed matter (Trachenko et al., Sci. Adv. 2020)
} as const;

/** seconds for sound (or light) to cover `meters` */
export const delay = (meters: number, speed: number) => meters / speed;

// deterministic flicker — no Math.random in a render
const frac = (v: number) => v - Math.floor(v);
export const hash = (n: number) => frac(Math.sin(n * 127.1 + 311.7) * 43758.5453);

/** lightning brightness `k` frames after a strike: a double-flicker then a fast decay */
export const boltAt = (k: number) => {
  if (k < 0) return 0;
  if (k < 2) return 1;
  if (k < 4) return 0.35;
  if (k < 6) return 1;
  return Math.max(0, 1 - (k - 6) / 14);
};

// =============================================================================
// SCENE PIECES (local panel coords)
// =============================================================================
export const Cloud: React.FC<{ x: number; y: number; opacity: number; lit: number }> = ({ x, y, opacity, lit }) => (
  <g opacity={opacity} transform={`translate(${x} ${y})`}>
    {[
      [-80, 10, 46],
      [-30, -12, 60],
      [35, -4, 52],
      [85, 14, 40],
      [0, 22, 54],
    ].map(([cx, cy, r], i) => (
      <circle key={i} cx={cx} cy={cy} r={r} fill={`rgb(${mix(58, 190, lit)},${mix(66, 196, lit)},${mix(84, 214, lit)})`} />
    ))}
  </g>
);

// a fixed zig-zag — the same bolt every strike
const BOLT = [
  [0, 0],
  [-26, 90],
  [14, 100],
  [-18, 200],
  [22, 212],
  [-10, 320],
  [8, 330],
  [0, 400],
];
export const Bolt: React.FC<{ x: number; y0: number; y1: number; b: number }> = ({ x, y0, y1, b }) => {
  if (b <= 0.01) return null;
  const sy = (y1 - y0) / 400;
  const pts = BOLT.map(([dx, dy]) => `${x + dx},${y0 + dy * sy}`).join(' ');
  return (
    <g opacity={b}>
      <polyline points={pts} fill="none" stroke={WV.light} strokeWidth={22} strokeOpacity={0.25} strokeLinejoin="round" />
      <polyline points={pts} fill="none" stroke="#fffbe6" strokeWidth={7} strokeLinejoin="round" />
    </g>
  );
};

export const Volcano: React.FC<{ x: number; groundY: number; opacity: number; plume: number }> = ({ x, groundY, opacity, plume }) => {
  if (opacity <= 0.01) return null;
  const top = groundY - 150;
  return (
    <g opacity={opacity}>
      {/* ash plume: puffs rise and swell with `plume` 0..1 */}
      {[0, 1, 2, 3, 4].map((i) => {
        const p = clamp01(plume * 1.4 - i * 0.12);
        if (p <= 0) return null;
        return (
          <circle
            key={i}
            cx={x + (i % 2 ? 18 : -14) * p}
            cy={top - 20 - i * 52 * p}
            r={(22 + i * 12) * p}
            fill={`rgba(120,110,105,${0.75 - i * 0.1})`}
          />
        );
      })}
      <polygon points={`${x - 120},${groundY} ${x - 26},${top} ${x + 26},${top} ${x + 120},${groundY}`} fill="#3a2f2c" />
      <polygon points={`${x - 26},${top} ${x + 26},${top} ${x + 14},${top + 18} ${x - 14},${top + 18}`} fill={WV.air} opacity={0.35 + 0.65 * plume} />
    </g>
  );
};

export const Person: React.FC<{ x: number; groundY: number; color: string }> = ({ x, groundY, color }) => (
  <g>
    <circle cx={x} cy={groundY - 118} r={20} fill={color} />
    <rect x={x - 21} y={groundY - 92} width={42} height={62} rx={18} fill={color} />
    <rect x={x - 16} y={groundY - 44} width={12} height={44} rx={6} fill={color} />
    <rect x={x + 4} y={groundY - 44} width={12} height={44} rx={6} fill={color} />
  </g>
);

/** concentric sound rings: a leading front at `r` and two trailing ones */
export const Rings: React.FC<{ cx: number; cy: number; r: number; color: string; opacity: number }> = ({ cx, cy, r, color, opacity }) => {
  if (opacity <= 0.01 || r <= 0) return null;
  return (
    <g opacity={opacity}>
      {[0, 1, 2].map((i) => {
        const ri = r - i * 46;
        if (ri <= 4) return null;
        return <circle key={i} cx={cx} cy={cy} r={ri} fill="none" stroke={color} strokeWidth={i === 0 ? 7 : 4} strokeOpacity={[1, 0.5, 0.25][i]} />;
      })}
    </g>
  );
};

/** a pill tag in SVG-free HTML space (absolute, centered on x) */
export const Tag: React.FC<{ x: number; y: number; text: string; color: string; opacity: number; pop?: number }> = ({ x, y, text, color, opacity, pop = 0 }) => {
  if (opacity <= 0.01) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 150,
        width: 300,
        top: y,
        display: 'flex',
        justifyContent: 'center',
        opacity,
        transform: `translateY(${(1 - opacity) * 8}px) scale(${1 + 0.1 * pop})`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_MONO,
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: 2,
          color,
          background: 'rgba(13,17,23,0.88)',
          border: `2px solid ${color}88`,
          borderRadius: 999,
          padding: '6px 18px',
          boxShadow: pop > 0.01 ? `0 0 ${30 * pop}px ${color}` : undefined,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** a monospace fact chip (right- or left-anchored) */
export const Chip: React.FC<{ x: number; y: number; text: React.ReactNode; color: string; opacity: number; pop?: number; anchor?: 'left' | 'right'; strike?: number }> = ({
  x,
  y,
  text,
  color,
  opacity,
  pop = 0,
  anchor = 'left',
  strike = 0,
}) => {
  if (opacity <= 0.01) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        ...(anchor === 'left' ? { left: x } : { right: x }),
        opacity,
        transform: `translateY(${(1 - opacity) * 10}px) scale(${1 + 0.06 * pop})`,
        transformOrigin: anchor === 'left' ? 'left center' : 'right center',
      }}
    >
      <div
        style={{
          position: 'relative',
          fontFamily: FONT_MONO,
          fontWeight: 700,
          fontSize: 30,
          color,
          background: 'rgba(13,17,23,0.9)',
          border: `2px solid ${color}66`,
          borderRadius: 14,
          padding: '10px 20px',
          whiteSpace: 'nowrap',
          boxShadow: pop > 0.01 ? `0 0 ${28 * pop}px ${color}88` : '0 8px 32px rgba(0,0,0,0.35)',
        }}
      >
        {text}
        {strike > 0.01 ? (
          <div style={{ position: 'absolute', left: 12, top: '50%', height: 5, borderRadius: 3, width: `calc((100% - 24px) * ${strike})`, background: WV.air }} />
        ) : null}
      </div>
    </div>
  );
};

/** the distance bracket under the ground: |<-- 1 KM -->| */
export const Span: React.FC<{ x0: number; x1: number; y: number; label: string; opacity?: number }> = ({ x0, x1, y, label, opacity = 1 }) => (
  <div style={{ position: 'absolute', left: x0, width: x1 - x0, top: y, height: 40, opacity }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 19, height: 2, background: 'rgba(255,255,255,0.35)' }} />
    <div style={{ position: 'absolute', left: 0, top: 6, width: 2, height: 28, background: 'rgba(255,255,255,0.35)' }} />
    <div style={{ position: 'absolute', right: 0, top: 6, width: 2, height: 28, background: 'rgba(255,255,255,0.35)' }} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', justifyContent: 'center' }}>
      <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 28, color: WV.ink, background: WV.ground, padding: '2px 16px', borderRadius: 8 }}>{label}</div>
    </div>
  </div>
);

/** the big delay readout */
export const Readout: React.FC<{ y: number; label: string; value: string; color: string; opacity: number; pop?: number; note?: string }> = ({
  y,
  label,
  value,
  color,
  opacity,
  pop = 0,
  note,
}) => {
  if (opacity <= 0.01) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity }}>
      <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 28, letterSpacing: 5, color: 'rgba(255,255,255,0.62)' }}>{label}</div>
      <div
        style={{
          marginTop: 6,
          fontFamily: FONT_MONO,
          fontWeight: 700,
          fontSize: 104,
          color,
          transform: `scale(${1 + 0.06 * pop})`,
          textShadow: pop > 0.01 ? `0 0 ${36 * pop}px ${color}` : '0 4px 30px rgba(0,0,0,0.5)',
        }}
      >
        {value}
      </div>
      {note ? <div style={{ marginTop: 2, fontFamily: FONT_MONO, fontWeight: 500, fontSize: 24, letterSpacing: 3, color: WV.dim }}>{note}</div> : null}
    </div>
  );
};

// =============================================================================
// THE SPEED LADDER — one log axis, sound's bar rising into a wall, light far above
// =============================================================================
const PHS_TOP = 1e9; // the ladder's top decade, m/s
export const ladderY = (v: number, bottom: number, perDecade: number, floorExp = 2) => bottom - (Math.log10(v) - floorExp) * perDecade;

export const SpeedLadder: React.FC<{
  w: number;
  h: number;
  level: number; // the bar's current speed, m/s
  wall: number; // 0..1 the cap wall
  gap: number; // 0..1 the gap bracket
  pop: number;
  steelO: number;
}> = ({ w, h, level, wall, gap, pop, steelO }) => {
  const bottom = h - 50;
  const per = (bottom - 110) / (Math.log10(PHS_TOP) - 2);
  const Y = (v: number) => ladderY(v, bottom, per);
  const bx = 250;
  const yLevel = Y(level);
  const yCap = Y(PHYS.cap);
  const yLight = Y(PHYS.c);
  const yAir = Y(PHYS.air);
  const yStl = Y(PHYS.steel);
  const ratio = Math.round(PHYS.c / PHYS.cap / 100) * 100;
  const lbl = (y: number, text: string, color: string, o = 1, left = bx + 70): React.ReactNode =>
    o > 0.01 ? (
      <div style={{ position: 'absolute', left, top: y - 22, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color, opacity: o, whiteSpace: 'nowrap' }}>{text}</div>
    ) : null;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: 40, top: 28, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 24, letterSpacing: 4, color: 'rgba(255,255,255,0.55)' }}>
        SPEED · LOG SCALE
      </div>
      {/* axis + decade ticks */}
      <div style={{ position: 'absolute', left: bx - 2, top: yLight - 30, width: 4, height: bottom - yLight + 30, background: 'rgba(255,255,255,0.18)', borderRadius: 2 }} />
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} style={{ position: 'absolute', left: bx - 16, top: Y(10 ** (i + 2)) - 1, width: 32, height: 2, background: 'rgba(255,255,255,0.2)' }} />
      ))}
      {/* sound's bar */}
      <div
        style={{
          position: 'absolute',
          left: bx - 22,
          width: 44,
          top: yLevel,
          height: bottom - yLevel,
          borderRadius: 12,
          background: `linear-gradient(0deg, ${WV.air}, ${WV.air}cc)`,
          boxShadow: `0 0 ${10 + 30 * pop}px ${WV.air}88`,
        }}
      />
      {lbl(yAir, `AIR  ${PHYS.air} m/s`, WV.air)}
      {lbl(yStl, `STEEL  ~${Math.round(PHYS.steel / 1000)} km/s`, 'rgba(255,255,255,0.75)', steelO)}
      {/* the wall */}
      {wall > 0.01 ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: 60,
              width: (w - 120) * wall,
              top: yCap - 4,
              height: 8,
              borderRadius: 4,
              background: WV.air,
              boxShadow: `0 0 ${16 + 30 * pop}px ${WV.air}`,
            }}
          />
          {lbl(yCap - 36, `MAX FOR SOUND  ${PHYS.cap / 1000} km/s`, WV.air, wall)}
        </>
      ) : null}
      {/* light, far above */}
      <div style={{ position: 'absolute', left: 60, width: w - 120, top: yLight - 3, height: 6, borderRadius: 3, background: WV.light, boxShadow: `0 0 24px ${WV.light}99` }} />
      {lbl(yLight - 36, `LIGHT  ${Math.round(PHYS.c / 1000).toLocaleString('en-US')} km/s`, WV.light)}
      {/* the gap */}
      {gap > 0.01 ? (
        <div style={{ position: 'absolute', left: w - 250, top: yLight + 12, height: (yCap - 12 - (yLight + 12)) * gap, width: 220, opacity: gap }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: WV.ink, opacity: 0.6 }} />
          <div
            style={{
              position: 'absolute',
              left: 22,
              top: '50%',
              transform: 'translateY(-50%)',
              fontFamily: FONT_MONO,
              fontWeight: 700,
              fontSize: 40,
              lineHeight: 1.1,
              color: WV.ink,
            }}
          >
            {ratio.toLocaleString('en-US')}×
            <div style={{ fontSize: 26, color: WV.dim, letterSpacing: 2, whiteSpace: 'nowrap' }}>STILL SLOWER</div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
