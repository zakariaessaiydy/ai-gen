// KIDS KIT — backgrounds. Every set takes the stage size (w,h) so the SAME set serves a 9:16 Short
// (1080x1920) and a 16:9 long video (1920x1080). The ground line is FLOOR(h) — stand characters
// there. Soft pastel-bright colours, gentle idle motion (clouds, bubbles, twinkles) driven by `t`,
// never strobing (kids content: no more than gentle movement in the background).
import React from 'react';
import { KINK, kst } from './face';
import { K3DDefs, KIDS_3D, Vol } from './depth';
import { FONT_TOON } from '../toon/comedy';

export const FLOOR = (h: number) => Math.round(h * (h > 1400 ? 0.79 : 0.84));
type SetProps = { w?: number; h?: number; t?: number };

const FAR = (w: number, h: number, farY: number) =>
  `M 0,${farY - h * 0.03} Q ${w * 0.18},${farY - h * 0.13} ${w * 0.42},${farY - h * 0.05} Q ${w * 0.7},${farY - h * 0.16} ${w},${farY - h * 0.06} L ${w},${h} L 0,${h} Z`;
const CLOUD = 'M -110,30 Q -130,-20 -80,-30 Q -70,-80 -10,-74 Q 30,-110 80,-70 Q 130,-70 126,-20 Q 150,20 110,34 Z';
const Cloud: React.FC<{ x: number; y: number; s?: number; face?: boolean; t?: number }> = ({ x, y, s = 1, face = false, t = 0 }) => {
  const shut = face && (t * 30 + 70) % 140 < 5; // the sleepy-happy cloud blinks
  return (
    <g transform={`translate(${x},${y + Math.sin(t * 0.9 + x * 0.01) * 6}) scale(${s})`}>
      <Vol>
        <path d={CLOUD} fill="#ffffff" {...kst(6)} />
      </Vol>
      <path d="M -104,22 Q -20,44 104,24 Q 120,30 110,34 L -110,30 Z" fill="#dcefff" />
      {face && (
        <g>
          {shut ? (
            <g {...kst(5)} fill="none"><path d="M -40,-14 L -20,-14" /><path d="M 20,-14 L 40,-14" /></g>
          ) : (
            <g fill={KINK}><ellipse cx={-30} cy={-16} rx={7} ry={9} /><ellipse cx={30} cy={-16} rx={7} ry={9} /></g>
          )}
          <path d="M -16,0 Q 0,14 16,0" fill="none" {...kst(5)} />
          <ellipse cx={-52} cy={0} rx={13} ry={7} fill="#ff8fab" opacity={0.6} />
          <ellipse cx={52} cy={0} rx={13} ry={7} fill="#ff8fab" opacity={0.6} />
        </g>
      )}
    </g>
  );
};

// ── AMBIENT LIFE — small things that move on their own so a set never feels frozen. Kept in the
// background layer (drawn before characters/cards), slow and soft: never strobing, never fast.

// fluttering butterflies on lazy figure-8 paths inside a box [x0,y0]-[x1,y1]
export const Butterflies: React.FC<{ t: number; box: [number, number, number, number]; n?: number; s?: number }> = ({ t, box, n = 3, s = 1 }) => {
  const [x0, y0, x1, y1] = box;
  const cols: [string, string][] = [['#ff6fa5', '#ffd166'], ['#b388ff', '#4cc9f0'], ['#ffca3a', '#ff924c'], ['#8ac926', '#ffffff']];
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const ph = t * (0.16 + i * 0.03) + i * 2.1;
        const x = x0 + (x1 - x0) * (0.5 + 0.45 * Math.sin(ph));
        const y = y0 + (y1 - y0) * (0.5 + 0.4 * Math.sin(ph * 2 + i));
        const dir = Math.cos(ph) >= 0 ? 1 : -1;
        const flap = 0.25 + 0.75 * Math.abs(Math.sin(t * 9 + i * 1.7));
        const [a, b] = cols[i % cols.length];
        return (
          <g key={i} transform={`translate(${x},${y}) scale(${s * dir},${s})`}>
            <g transform={`scale(${flap},1)`}>
              <path d="M 0,0 Q -46,-50 -34,-6 Q -40,26 0,4 Z" fill={a} {...kst(4)} />
              <path d="M 0,0 Q 46,-50 34,-6 Q 40,26 0,4 Z" fill={a} {...kst(4)} />
              <circle cx={-22} cy={-16} r={7} fill={b} />
              <circle cx={22} cy={-16} r={7} fill={b} />
            </g>
            <ellipse cx={0} cy={0} rx={5} ry={18} fill={KINK} />
            <path d="M -2,-16 Q -10,-30 -14,-32 M 2,-16 Q 10,-30 14,-32" fill="none" {...kst(3)} />
          </g>
        );
      })}
    </g>
  );
};

// a little flock of birds gliding across the sky (wrap-around), wings flapping
export const Birds: React.FC<{ t: number; w: number; y: number; n?: number }> = ({ t, w, y, n = 3 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const x = ((t * 46 + i * 70 + w * 0.3) % (w + 400)) - 200;
      const yy = y + i * 34 + Math.sin(t * 1.3 + i) * 12;
      const fl = Math.sin(t * 7 + i * 1.3) * 12;
      return <path key={i} d={`M ${x - 24},${yy - fl * 0.4} Q ${x - 12},${yy - 14 - fl} ${x},${yy} Q ${x + 12},${yy - 14 - fl} ${x + 24},${yy - fl * 0.4}`} fill="none" {...kst(5)} />;
    })}
  </g>
);

// soft twinkles floating in the air
export const AirTwinkles: React.FC<{ t: number; w: number; y0: number; y1: number; n?: number; c?: string }> = ({ t, w, y0, y1, n = 7, c = '#ffffff' }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const o = Math.max(0, Math.sin(t * 1.4 + i * 1.9));
      const x = ((i * 337 + 90) % (w - 120)) + 60;
      const y = y0 + ((i * 211) % Math.max(1, y1 - y0)) - t * 6 * ((i % 3) + 1) % 40;
      return <path key={i} d="M 0,-14 Q 2,-2 14,0 Q 2,2 0,14 Q -2,2 -14,0 Q -2,-2 0,-14 Z" transform={`translate(${x},${y}) scale(${0.6 + o * 0.6})`} fill={c} opacity={o * 0.9} />;
    })}
  </g>
);

// a soft rainbow arc (behind the hills)
export const Rainbow: React.FC<{ x: number; y: number; r: number; o?: number }> = ({ x, y, r, o = 0.55 }) => (
  <g opacity={o}>
    {['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#4cc9f0', '#6a4c93'].map((c, i) => (
      <path key={c} d={`M ${x - r + i * 22},${y} A ${r - i * 22},${r - i * 22} 0 0 1 ${x + r - i * 22},${y}`} fill="none" stroke={c} strokeWidth={22} />
    ))}
  </g>
);

const Flower: React.FC<{ x: number; y: number; c: string; s?: number; t?: number }> = ({ x, y, c, s = 1, t = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s}) rotate(${Math.sin(t * 1.6 + x * 0.05) * 6})`}>
    <path d="M 0,-24 Q -22,-40 -26,-24 Q -18,-14 0,-24 Z" fill="#55b84a" {...kst(3)} />
    <line x1={0} y1={0} x2={0} y2={-60} stroke="#3a8d3a" strokeWidth={8} />
    <Vol>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 18} cy={-70 + Math.sin((a * Math.PI) / 180) * 18} r={14} fill={c} {...kst(4)} />
      ))}
      <circle cx={0} cy={-70} r={11} fill="#ffd166" {...kst(4)} />
    </Vol>
    <circle cx={-3} cy={-73} r={3} fill="#ffffff" opacity={0.8} />
  </g>
);

// smiling sun — a friendly recurring motif
export const Sun: React.FC<{ x: number; y: number; r?: number; t?: number }> = ({ x, y, r = 90, t = 0 }) => {
  const shut = (t * 30 + 60) % 120 < 5;
  return (
  <g transform={`translate(${x},${y})`}>
    <defs>
      <radialGradient id="kSunGlow">
        <stop offset="0.45" stopColor="#fff3b0" stopOpacity={0.75} />
        <stop offset="1" stopColor="#fff3b0" stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle r={r * (2.1 + Math.sin(t * 1.5) * 0.08)} fill="url(#kSunGlow)" />
    <g transform={`rotate(${t * 12})`}>
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={-10} y={-r - (i % 2 ? 44 : 60) - Math.sin(t * 3 + i) * 4} width={20} height={i % 2 ? 28 : 44} rx={10} fill={i % 2 ? '#ffca3a' : '#ffb703'} transform={`rotate(${i * 30})`} />
      ))}
    </g>
    <Vol>
      <circle r={r} fill="#ffd166" {...kst(7)} />
    </Vol>
    <ellipse cx={-r * 0.38} cy={-r * 0.45} rx={r * 0.28} ry={r * 0.14} fill="#ffffff" opacity={0.45} transform={`rotate(-30 ${-r * 0.38} ${-r * 0.45})`} />
    {shut ? (
      <g fill="none" {...kst(6)}><path d="M -38,-10 L -18,-10" /><path d="M 18,-10 L 38,-10" /></g>
    ) : (
      <g>
        <circle cx={-28} cy={-10} r={9} fill={KINK} />
        <circle cx={28} cy={-10} r={9} fill={KINK} />
        <circle cx={-25} cy={-13} r={3} fill="#ffffff" />
        <circle cx={31} cy={-13} r={3} fill="#ffffff" />
      </g>
    )}
    <path d="M -30,22 Q 0,46 30,22" fill="none" {...kst(7)} />
    <ellipse cx={-48} cy={18} rx={14} ry={8} fill="#ff8fab" opacity={0.6} />
    <ellipse cx={48} cy={18} rx={14} ry={8} fill="#ff8fab" opacity={0.6} />
  </g>
  );
};

// MEADOW — the channel's home set. Layers back→front: 3-stop sky, sun glow, rainbow, smiling
// cloud + cloud, birds, far/mid/near hills (bushes on the mid hill), swaying tree, ground patches,
// swaying flowers + grass tufts, butterflies, air twinkles. `rainbow` / `life` turn the extras off
// (e.g. a colour lesson where a rainbow would confuse, or a quiet bedtime-ish beat).
export const Meadow: React.FC<SetProps & { sun?: boolean; rainbow?: boolean; life?: boolean; tree?: boolean }> = ({
  w = 1080, h = 1920, t = 0, sun = true, rainbow = true, life = true, tree = true,
}) => {
  const f = FLOOR(h);
  const wide = w > h;
  const farY = f - h * 0.12;
  return (
    <g>
      <defs>
        <linearGradient id="kSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5ab8f5" />
          <stop offset="0.55" stopColor="#a8dcff" />
          <stop offset="1" stopColor="#e9f8ff" />
        </linearGradient>
      </defs>
      <K3DDefs />
      <rect width={w} height={h} fill="url(#kSky)" />
      {sun && <Sun x={w * 0.8} y={h * 0.2} t={t} />}
      {rainbow && <Rainbow x={w * (wide ? 0.34 : 0.3)} y={farY + 30} r={wide ? h * 0.42 : w * 0.36} />}
      <Cloud x={((w * 0.2 + t * 18) % (w + 300)) - 150} y={h * 0.16} s={1.1} face t={t} />
      <Cloud x={((w * 0.65 + t * 11) % (w + 300)) - 150} y={h * 0.3} s={0.8} t={t} />
      {wide && <Cloud x={((w * 0.95 + t * 14) % (w + 300)) - 150} y={h * 0.1} s={0.65} t={t} />}
      {life && <Birds t={t} w={w} y={h * (wide ? 0.12 : 0.1)} />}
      {/* hazy blue mountains far away (deepest layer, peeking over the far hill) */}
      <path d={`M 0,${farY - h * 0.12} L ${w * 0.12},${farY - h * 0.24} L ${w * 0.26},${farY - h * 0.15} L ${w * 0.4},${farY - h * 0.29} L ${w * 0.56},${farY - h * 0.16} L ${w * 0.7},${farY - h * 0.25} L ${w * 0.86},${farY - h * 0.14} L ${w},${farY - h * 0.21} L ${w},${farY} L 0,${farY} Z`} fill="#b3d6f2" stroke="#a3c8e8" strokeWidth={4} strokeLinejoin="round" />
      {[[0.12, 0.24], [0.4, 0.29], [0.7, 0.25]].map(([px, py], i) => (
        <path key={`snow${i}`} d={`M ${w * px - h * 0.03},${farY - h * (py - 0.03)} L ${w * px},${farY - h * py} L ${w * px + h * 0.03},${farY - h * (py - 0.03)} L ${w * px + h * 0.012},${farY - h * (py - 0.022)} L ${w * px},${farY - h * (py - 0.032)} L ${w * px - h * 0.014},${farY - h * (py - 0.02)} Z`} fill="#ffffff" opacity={0.85} />
      ))}
      <rect x={0} y={farY - h * 0.3} width={w} height={h * 0.3} fill="#e9f8ff" opacity={0.2} />
      {/* far hill (in 3D: hazed towards the sky — aerial perspective) */}
      <Vol kind="slope">
        <path d={FAR(w, h, farY)} fill="#c2ecaa" {...kst(5)} />
      </Vol>
      {KIDS_3D && <path d={FAR(w, h, farY)} fill="#e9f8ff" opacity={0.35} />}
      {[0.08, 0.17, 0.62, 0.78, 0.9].map((sx, i) => (
        <g key={`ft${i}`} transform={`translate(${w * sx},${farY - h * (0.06 + (i % 2) * 0.03)})`}>
          <rect x={-4} y={-6} width={8} height={22} fill="#8fae7c" />
          <circle cx={0} cy={-18} r={18} fill="#9fd08a" />
        </g>
      ))}
      <Vol kind="slope">
        <path d={`M 0,${f - h * 0.12} Q ${w * 0.3},${f - h * 0.22} ${w * 0.6},${f - h * 0.12} T ${w},${f - h * 0.14} L ${w},${h} L 0,${h} Z`} fill="#9be27a" {...kst(6)} />
      </Vol>
      {/* little round bushes on the mid hill */}
      {[0.22, 0.5, 0.72, 0.93].map((sx, i) => (
        <g key={i} transform={`translate(${w * sx},${f - h * (0.15 + (i % 2) * 0.012)})`}>
          <Vol>
            <circle cx={-18} cy={0} r={26} fill="#5cbf4a" {...kst(4)} />
            <circle cx={14} cy={-8} r={30} fill="#6cc955" {...kst(4)} />
          </Vol>
          <circle cx={-6} cy={-16} r={4} fill="#ff6fa5" />
        </g>
      ))}
      <Vol kind="slope">
        <path d={`M 0,${f - h * 0.04} Q ${w * 0.5},${f - h * 0.1} ${w},${f - h * 0.03} L ${w},${h} L 0,${h} Z`} fill="#7bd162" {...kst(6)} />
      </Vol>
      <rect x={0} y={f} width={w} height={h - f} fill="#6cc551" />
      {KIDS_3D && <rect x={0} y={f} width={w} height={h - f} fill="url(#k3d-floor)" />}
      {/* ground patches */}
      {[0.12, 0.4, 0.66, 0.9].map((sx, i) => (
        <ellipse key={i} cx={w * sx} cy={f + (h - f) * (0.3 + (i % 2) * 0.35)} rx={w * 0.08} ry={(h - f) * 0.1} fill="#7fd665" opacity={0.7} />
      ))}
      {/* tree — the canopy sways gently */}
      {tree && (
        <g transform={`translate(${w * 0.1},${f - h * 0.05})`}>
          <Vol kind="tube">
            <rect x={-26} y={-260} width={52} height={260} rx={14} fill="#a0673c" {...kst(6)} />
          </Vol>
          <g transform={`rotate(${Math.sin(t * 0.8) * 1.6} 0 -200)`}>
            <Vol>
              {[[-80, -300], [0, -360], [80, -300], [-40, -230], [50, -230]].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r={95} fill="#55b84a" {...kst(6)} />
              ))}
            </Vol>
            <ellipse cx={-30} cy={-400} rx={50} ry={24} fill="#ffffff" opacity={0.22} />
            {[[-40, -300], [40, -340], [70, -250], [-90, -250]].map(([cx, cy], i) => (
              <g key={i}>
                <Vol>
                  <circle cx={cx} cy={cy} r={14} fill="#ff4d6d" {...kst(4)} />
                </Vol>
                <circle cx={cx - 4} cy={cy - 4} r={4} fill="#ffffff" opacity={0.8} />
              </g>
            ))}
          </g>
        </g>
      )}
      {/* grass tufts */}
      {Array.from({ length: Math.round(w / 180) }).map((_, i) => {
        const gx = 100 + i * 180 + (i % 3) * 20;
        const gy = f + 30 + ((i * 37) % 3) * ((h - f) * 0.25);
        const sw = Math.sin(t * 1.8 + i) * 4;
        return <path key={i} d={`M ${gx - 16},${gy} Q ${gx - 18 + sw},${gy - 24} ${gx - 22 + sw},${gy - 36} M ${gx},${gy} Q ${gx + sw},${gy - 30} ${gx + sw},${gy - 46} M ${gx + 16},${gy} Q ${gx + 18 + sw},${gy - 24} ${gx + 24 + sw},${gy - 34}`} fill="none" stroke="#3a8d3a" strokeWidth={7} strokeLinecap="round" />;
      })}
      {Array.from({ length: Math.round(w / 140) }).map((_, i) => (
        <Flower key={i} x={60 + i * 140 + (i % 2) * 30} y={f + 60 + (i % 3) * 70} c={['#ff6fa5', '#b388ff', '#ffffff', '#ff9f43'][i % 4]} s={0.9} t={t} />
      ))}
      {life && <Butterflies t={t} box={[w * 0.08, h * (wide ? 0.32 : 0.4), w * 0.92, f - h * 0.08]} n={wide ? 3 : 2} s={wide ? 0.9 : 1} />}
      {life && <AirTwinkles t={t} w={w} y0={h * 0.08} y1={h * 0.45} n={wide ? 8 : 6} />}
    </g>
  );
};

// ── shared set helpers ──────────────────────────────────────────────────────────────────────────
// deterministic scatter (no Math.random in a render: every frame must draw the same set)
const rnd = (i: number, s = 1) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// a soft darkening of the frame edges — pulls the eye to the centre where the cast stands
const Vignette: React.FC<{ w: number; h: number; o?: number; id: string }> = ({ w, h, o = 0.22, id }) =>
  KIDS_3D ? (
    <g>
      <defs>
        <radialGradient id={id} cx="0.5" cy="0.48" r="0.75">
          <stop offset="0.55" stopColor="#24123a" stopOpacity={0} />
          <stop offset="1" stopColor="#24123a" stopOpacity={o} />
        </radialGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#${id})`} />
    </g>
  ) : null;

// planks on a floor plane, converging towards the middle of the horizon (cheap perspective)
const Planks: React.FC<{ w: number; h: number; f: number; c: string; step?: number }> = ({ w, h, f, c, step = 150 }) => (
  <g>
    {Array.from({ length: Math.ceil(w / step) + 3 }).map((_, i) => {
      const x = (i - 1) * step;
      return <line key={i} x1={x} y1={f} x2={w / 2 + (x - w / 2) * 1.9} y2={h} stroke={c} strokeWidth={5} />;
    })}
    {[0.3, 0.62].map((k) => (
      <line key={k} x1={0} y1={f + (h - f) * k} x2={w} y2={f + (h - f) * k} stroke={c} strokeWidth={4} opacity={0.6} />
    ))}
  </g>
);

// a soft beam of window light falling onto the floor
const Beam: React.FC<{ pts: string; c?: string; o?: number; t?: number }> = ({ pts, c = '#fffbe0', o = 0.14, t = 0 }) => (
  <polygon points={pts} fill={c} opacity={o + Math.sin(t * 0.6) * 0.02} />
);

const Book: React.FC<{ x: number; y: number; bw: number; bh: number; c: string; tilt?: number }> = ({ x, y, bw, bh, c, tilt = 0 }) => (
  <g transform={`rotate(${tilt} ${x} ${y})`}>
    <Vol kind="tube">
      <rect x={x} y={y - bh} width={bw} height={bh} rx={4} fill={c} {...kst(3)} />
    </Vol>
    <rect x={x + 3} y={y - bh * 0.75} width={bw - 6} height={5} fill="#ffffff" opacity={0.6} />
  </g>
);

// a low bookshelf standing on the floor (left edge of a room): books, a globe on top
const Bookshelf: React.FC<{ x: number; base: number; sw: number; sh: number; globe?: boolean }> = ({ x, base, sw, sh, globe = true }) => {
  const rows = 3;
  const rh = (sh - 30) / rows;
  const cols = ['#ff6b6b', '#4dabf7', '#ffd43b', '#69db7c', '#b197fc', '#ff9f43', '#f783ac'];
  return (
    <g>
      {KIDS_3D && <ellipse cx={x + sw / 2} cy={base + 4} rx={sw * 0.6} ry={16} fill="url(#k3d-ground)" />}
      <Vol kind="slope">
        <rect x={x} y={base - sh} width={sw} height={sh} rx={12} fill="#c0874f" {...kst(6)} />
      </Vol>
      {Array.from({ length: rows }).map((_, r) => {
        const y0 = base - sh + 15 + r * rh;
        let bx = x + 16;
        const books: React.ReactNode[] = [];
        for (let i = 0; bx < x + sw - 30; i++) {
          const bw = 16 + rnd(i + r * 9, 3) * 14;
          const bh = rh * (0.62 + rnd(i + r * 9, 4) * 0.28);
          books.push(<Book key={i} x={bx} y={y0 + rh - 6} bw={Math.min(bw, x + sw - 16 - bx)} bh={bh} c={cols[(i + r * 3) % cols.length]} tilt={i === 3 && r === 1 ? -12 : 0} />);
          bx += bw + 4;
        }
        return (
          <g key={r}>
            <rect x={x + 10} y={y0} width={sw - 20} height={rh - 4} rx={6} fill="#8d5a3b" />
            {books}
            <rect x={x + 6} y={y0 + rh - 8} width={sw - 12} height={10} rx={4} fill="#d99a5e" {...kst(3)} />
          </g>
        );
      })}
      {globe && (
        <g transform={`translate(${x + sw * 0.62},${base - sh})`}>
          <path d="M -26,0 L 26,0 L 14,-14 L -14,-14 Z" fill="#8d5a3b" {...kst(4)} />
          <line x1={0} y1={-14} x2={0} y2={-30} {...kst(5)} />
          <Vol>
            <circle cx={0} cy={-70} r={42} fill="#4dabf7" {...kst(5)} />
          </Vol>
          <path d="M -24,-88 Q -6,-100 6,-86 Q 0,-72 -16,-74 Z M 6,-62 Q 22,-66 26,-52 Q 12,-40 2,-50 Z" fill="#69db7c" />
          <path d="M -46,-70 A 46,46 0 0 1 46,-70" fill="none" stroke="#ffd43b" strokeWidth={6} />
        </g>
      )}
    </g>
  );
};

// a potted plant with big swaying leaves (indoor corners)
const Plant: React.FC<{ x: number; base: number; s?: number; t?: number; pot?: string }> = ({ x, base, s = 1, t = 0, pot = '#ff8c69' }) => (
  <g transform={`translate(${x},${base}) scale(${s})`}>
    {KIDS_3D && <ellipse cx={0} cy={4} rx={80} ry={14} fill="url(#k3d-ground)" />}
    <g transform={`rotate(${Math.sin(t * 0.9) * 2.5} 0 -110)`}>
      <Vol>
        {[[-70, -230, -30], [60, -250, 28], [-20, -290, -6], [30, -200, 18], [-50, -170, -40]].map(([lx, ly, r], i) => (
          <ellipse key={i} cx={lx} cy={ly} rx={34} ry={70} fill={i % 2 ? '#55b84a' : '#6cc955'} transform={`rotate(${r} ${lx} ${ly})`} {...kst(5)} />
        ))}
      </Vol>
    </g>
    <Vol kind="tube">
      <path d="M -60,-120 L 60,-120 L 46,0 L -46,0 Z" fill={pot} {...kst(6)} />
    </Vol>
    <rect x={-66} y={-132} width={132} height={22} rx={8} fill={pot} {...kst(5)} />
  </g>
);

// a friendly wall clock (hands turn slowly with t)
const WallClock: React.FC<{ x: number; y: number; r?: number; t?: number }> = ({ x, y, r = 60, t = 0 }) => (
  <g transform={`translate(${x},${y})`}>
    <Vol>
      <circle r={r} fill="#ff8fab" {...kst(6)} />
    </Vol>
    <circle r={r * 0.78} fill="#ffffff" {...kst(4)} />
    {Array.from({ length: 12 }).map((_, i) => (
      <circle key={i} cx={Math.cos((i * Math.PI) / 6) * r * 0.62} cy={Math.sin((i * Math.PI) / 6) * r * 0.62} r={i % 3 ? 3 : 6} fill={KINK} />
    ))}
    <line x1={0} y1={0} x2={0} y2={-r * 0.42} {...kst(6)} transform={`rotate(${t * 3 + 300})`} />
    <line x1={0} y1={0} x2={0} y2={-r * 0.6} {...kst(4)} transform={`rotate(${t * 36})`} />
    <circle r={6} fill={KINK} />
  </g>
);

// ── CLASSROOM — numbers, words, puzzles. The chalkboard geometry is unchanged (episodes write on it);
// the room around it is dressed: striped wallpaper + chair rail, a window with a drifting cloud and a
// light beam (wide), a wall clock, a bookshelf with a globe, a plant, a plank floor and a round rug.
export const Classroom: React.FC<SetProps & { board?: string[]; boardColor?: string }> = ({ w = 1080, h = 1920, t = 0, board = [], boardColor = '#ffffff' }) => {
  const f = FLOOR(h);
  const wide = w > h;
  const bw = Math.min(w * 0.8, 1300);
  const bx = (w - bw) / 2;
  const by = h * (h > 1400 ? 0.22 : 0.12);
  const bh = h * (h > 1400 ? 0.24 : 0.42);
  const side = bx - 24; // wall left of the board frame
  const winW = Math.min(220, side - 50);
  const winX = bx + bw + 24 + (side - winW) / 2;
  const winY = by + 10;
  const winH = bh * 0.72;
  return (
    <g>
      <K3DDefs />
      <defs>
        <linearGradient id="kClassSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5ab8f5" />
          <stop offset="1" stopColor="#d6f0ff" />
        </linearGradient>
        <clipPath id="kClassWin">
          <rect x={winX} y={winY} width={winW} height={winH} rx={12} />
        </clipPath>
      </defs>
      <rect width={w} height={f} fill="#ffe8b8" />
      {/* wallpaper stripes */}
      {Array.from({ length: Math.ceil(w / 90) }).map((_, i) => (
        <rect key={i} x={i * 90 + 20} y={0} width={40} height={f - 120} fill="#fff3d6" opacity={0.7} />
      ))}
      {KIDS_3D && <rect width={w} height={f} fill="url(#k3d-room)" />}
      <rect y={f - 120} width={w} height={120} fill="#ffd38a" />
      <rect y={f - 132} width={w} height={14} rx={4} fill="#e8b86a" {...kst(4)} />
      {/* alphabet bunting on a string */}
      <path d={`M 0,${h * 0.04 - 4} Q ${w / 2},${h * 0.04 + 22} ${w},${h * 0.04 - 4}`} fill="none" {...kst(4)} />
      {Array.from({ length: Math.floor(w / 90) }).map((_, i) => (
        <g key={i} transform={`translate(${30 + i * 90},${h * 0.04 + Math.sin(i) * 8}) rotate(${Math.sin(t * 1.2 + i) * 2} 35 0)`}>
          <Vol>
            <path d="M 0,0 L 70,0 L 35,70 Z" fill={['#ff6b6b', '#4dabf7', '#ffd43b', '#69db7c', '#b197fc'][i % 5]} {...kst(5)} />
          </Vol>
          <text x={35} y={36} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={30} fill={KINK}>
            {String.fromCharCode(65 + (i % 26))}
          </text>
        </g>
      ))}
      {/* window (wide: the wall right of the board has room) */}
      {wide && side > 200 && (
        <g>
          <Beam pts={`${winX},${winY + winH} ${winX + winW},${winY + winH} ${winX - w * 0.05},${f + (h - f) * 0.6} ${winX - w * 0.25},${f + (h - f) * 0.6}`} t={t} />
          <Vol kind="slope">
            <rect x={winX - 16} y={winY - 16} width={winW + 32} height={winH + 32} rx={18} fill="#ffffff" {...kst(6)} />
          </Vol>
          <rect x={winX} y={winY} width={winW} height={winH} rx={12} fill="url(#kClassSky)" />
          <g clipPath="url(#kClassWin)">
            <Cloud x={winX + ((t * 14 + 60) % (winW + 200)) - 60} y={winY + winH * 0.3} s={0.5} t={t} />
            <path d={`M ${winX},${winY + winH} Q ${winX + winW * 0.4},${winY + winH * 0.72} ${winX + winW},${winY + winH * 0.8} L ${winX + winW},${winY + winH} Z`} fill="#9be27a" />
          </g>
          <line x1={winX + winW / 2} y1={winY} x2={winX + winW / 2} y2={winY + winH} stroke="#ffffff" strokeWidth={10} />
          <line x1={winX} y1={winY + winH / 2} x2={winX + winW} y2={winY + winH / 2} stroke="#ffffff" strokeWidth={10} />
          <rect x={winX - 30} y={winY + winH + 14} width={winW + 60} height={18} rx={6} fill="#e8b86a" {...kst(4)} />
          <Plant x={winX + winW * 0.75} base={winY + winH + 14} s={0.32} t={t} pot="#4dabf7" />
        </g>
      )}
      {/* wall clock: left of the board (wide) or above it (tall) */}
      {wide && side > 200 ? <WallClock x={side / 2} y={by + 80} t={t} /> : <WallClock x={w - 120} y={(h * 0.04 + 90 + by - 24) / 2} r={52} t={t} />}
      {/* shapes poster under the clock (wide) */}
      {wide && side > 200 && (
        <g transform={`translate(${side / 2},${by + bh * 0.62})`}>
          <rect x={-80} y={-90} width={160} height={180} rx={14} fill="#ffffff" {...kst(5)} />
          <circle cx={-34} cy={-40} r={26} fill="#ff6b6b" {...kst(3)} />
          <rect x={10} y={-64} width={48} height={48} rx={6} fill="#4dabf7" {...kst(3)} />
          <path d="M -34,20 L -6,66 L -62,66 Z" fill="#ffd43b" {...kst(3)} />
          <path d="M 34,16 L 42,36 L 64,36 L 46,50 L 54,72 L 34,58 L 14,72 L 22,50 L 4,36 L 26,36 Z" fill="#69db7c" {...kst(3)} />
        </g>
      )}
      {/* chalkboard */}
      {KIDS_3D && <rect x={bx - 10} y={by + 6} width={bw + 48} height={bh + 48} rx={20} fill="#24123a" opacity={0.14} />}
      <Vol kind="slope">
        <rect x={bx - 24} y={by - 24} width={bw + 48} height={bh + 48} rx={20} fill="#c0874f" {...kst(7)} />
      </Vol>
      <rect x={bx} y={by} width={bw} height={bh} rx={10} fill="#2f6b52" {...kst(6)} />
      {/* faint old chalk smudges */}
      {[[0.2, 0.3, 0.12], [0.75, 0.7, 0.1], [0.55, 0.2, 0.08]].map(([sx, sy, r], i) => (
        <ellipse key={i} cx={bx + bw * sx} cy={by + bh * sy} rx={bw * r} ry={bh * r * 0.5} fill="#ffffff" opacity={0.05} />
      ))}
      {KIDS_3D && <rect x={bx} y={by} width={bw} height={bh} rx={10} fill="url(#k3d-board)" />}
      {/* chalk tray with chalk + eraser */}
      <rect x={bx - 10} y={by + bh + 22} width={bw + 20} height={16} rx={6} fill="#a8703f" {...kst(4)} />
      <rect x={bx + bw * 0.12} y={by + bh + 12} width={44} height={12} rx={6} fill="#ffffff" {...kst(3)} />
      <rect x={bx + bw * 0.12 + 56} y={by + bh + 12} width={36} height={12} rx={6} fill="#ffafcc" {...kst(3)} />
      <rect x={bx + bw * 0.82} y={by + bh + 2} width={70} height={22} rx={6} fill="#4dabf7" {...kst(4)} />
      <rect x={bx + bw * 0.82} y={by + bh + 16} width={70} height={8} rx={3} fill="#e9ecef" />
      {board.map((l, i) => (
        <text key={i} x={w / 2} y={by + bh * ((i + 1) / (board.length + 1)) + 30} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={Math.min(110, bh / (board.length + 1))} fill={boardColor}>
          {l}
        </text>
      ))}
      {/* floor: planks + a round rug */}
      <rect x={0} y={f} width={w} height={h - f} fill="#d9a066" />
      <Planks w={w} h={h} f={f} c="#c48a52" />
      <g transform={`translate(${w / 2},${f + (h - f) * 0.56})`}>
        <ellipse rx={w * (wide ? 0.3 : 0.4)} ry={(h - f) * 0.3} fill="#4dabf7" {...kst(5)} />
        <ellipse rx={w * (wide ? 0.26 : 0.35)} ry={(h - f) * 0.24} fill="#8ecae6" />
        <ellipse rx={w * (wide ? 0.2 : 0.27)} ry={(h - f) * 0.17} fill="none" stroke="#ffd43b" strokeWidth={8} strokeDasharray="22 16" />
      </g>
      {KIDS_3D && <rect x={0} y={f} width={w} height={h - f} fill="url(#k3d-floor)" />}
      <line x1={0} y1={f} x2={w} y2={f} {...kst(7)} />
      {/* furniture at the edges, standing just behind the floor line */}
      <Bookshelf x={-20} base={f - 4} sw={Math.min(w * 0.2, 280)} sh={wide ? 290 : 330} />
      <Plant x={w - (wide ? 110 : 80)} base={f - 4} s={wide ? 0.9 : 0.85} t={t} />
      <Vignette w={w} h={h} o={0.16} id="kClassVig" />
    </g>
  );
};

// ── BEDROOM — bedtime & moral stories. Night room: star wallpaper, a window with curtains, the moon,
// twinkling stars and a drifting cloud, moonlight on the floor, a shelf with books + a teddy, a
// nightstand LAMP (its warm glow is the `lamp` prop), a made bed with a quilt, a striped rug, toys.
export const Bedroom: React.FC<SetProps & { lamp?: boolean }> = ({ w = 1080, h = 1920, t = 0, lamp = true }) => {
  const f = FLOOR(h);
  const wide = w > h;
  const wx = w * 0.62;
  const wy = h * 0.14;
  const ww = w * 0.3;
  const wh = h * 0.22;
  const head = w * 0.5 - w * 0.36; // the bed's headboard x
  const nsW = Math.min(150, head - 16);
  const nsX = head - nsW - 6;
  const nsH = 150;
  const lampX = nsX + nsW / 2;
  const lampY = f - nsH - 70; // the middle of the lamp shade
  const shelfX = w * (wide ? 0.04 : 0.06);
  const shelfW = w * (wide ? 0.2 : 0.34);
  const shelfY = h * (wide ? 0.4 : 0.36);
  return (
    <g>
      <K3DDefs />
      <defs>
        <linearGradient id="kBedSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d2156" />
          <stop offset="1" stopColor="#3a3f8f" />
        </linearGradient>
        <clipPath id="kBedWin">
          <rect x={wx} y={wy} width={ww} height={wh} rx={20} />
        </clipPath>
        <radialGradient id="kLampGlow">
          <stop offset="0" stopColor="#ffd166" stopOpacity={0.55} />
          <stop offset="0.5" stopColor="#ffd166" stopOpacity={0.18} />
          <stop offset="1" stopColor="#ffd166" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={w} height={f} fill="#3d3577" />
      {/* star-and-dot wallpaper */}
      {Array.from({ length: Math.ceil(f / 120) }).map((_, r) =>
        Array.from({ length: Math.ceil(w / 120) + 1 }).map((_, c) => {
          const x = c * 120 + (r % 2) * 60;
          const y = r * 120 + 40;
          return (r + c) % 2 ? (
            <circle key={`${r}-${c}`} cx={x} cy={y} r={6} fill="#5a50a0" opacity={0.6} />
          ) : (
            <path key={`${r}-${c}`} d="M 0,-12 L 3.5,-3.5 L 12,0 L 3.5,3.5 L 0,12 L -3.5,3.5 L -12,0 L -3.5,-3.5 Z" transform={`translate(${x},${y})`} fill="#5a50a0" opacity={0.6} />
          );
        }),
      )}
      {KIDS_3D && <rect width={w} height={f} fill="url(#k3d-room)" />}
      <rect y={f - 140} width={w} height={140} fill="#352e69" />
      <rect y={f - 150} width={w} height={14} rx={4} fill="#4a4290" {...kst(4)} />
      {/* moonlight falling from the window onto the floor */}
      <Beam pts={`${wx},${wy + wh} ${wx + ww},${wy + wh} ${wx + ww * 0.4},${h} ${wx - ww * 0.9},${h}`} c="#bcd4ff" o={0.08} t={t} />
      {/* window: frame, night sky, moon, stars, a passing cloud */}
      <Vol kind="slope">
        <rect x={wx - 18} y={wy - 18} width={ww + 36} height={wh + 36} rx={26} fill="#8e7cc3" {...kst(7)} />
      </Vol>
      <rect x={wx} y={wy} width={ww} height={wh} rx={20} fill="url(#kBedSky)" />
      <g clipPath="url(#kBedWin)">
        {Array.from({ length: 9 }).map((_, i) => (
          <circle key={i} cx={wx + ww * rnd(i, 1)} cy={wy + wh * rnd(i, 2)} r={3 + 2 * Math.max(0, Math.sin(t * 2 + i))} fill="#ffffff" />
        ))}
        <circle cx={wx + w * 0.2} cy={wy + h * 0.07} r={46} fill="#fff3b0" />
        <circle cx={wx + w * 0.2 + 22} cy={wy + h * 0.07 - 12} r={42} fill="url(#kBedSky)" />
        <g opacity={0.5}>
          <Cloud x={wx + ((t * 10 + ww * 0.3) % (ww + 260)) - 130} y={wy + wh * 0.82} s={0.45} t={t} />
        </g>
      </g>
      <line x1={wx + w * 0.15} y1={wy} x2={wx + w * 0.15} y2={wy + wh} {...kst(6)} />
      <rect x={wx - 34} y={wy + wh + 14} width={ww + 68} height={20} rx={8} fill="#8e7cc3" {...kst(5)} />
      {/* curtains on a rod */}
      <line x1={wx - 90} y1={wy - 40} x2={wx + ww + 90} y2={wy - 40} stroke="#c0874f" strokeWidth={12} strokeLinecap="round" />
      {[-1, 1].map((d) => {
        const x0 = d < 0 ? wx - 80 : wx + ww + 80;
        const x1 = d < 0 ? wx + 26 : wx + ww - 26;
        const sw = Math.sin(t * 0.7 + d) * 6;
        return (
          <g key={d}>
            <Vol kind="slope">
              <path d={`M ${x0},${wy - 46} L ${x1},${wy - 46} Q ${x1 - d * 40 + sw},${wy + wh * 0.5} ${x1 - d * 70},${wy + wh * 0.62} Q ${x1 + sw},${wy + wh + 40} ${x1 - d * 10 + sw},${wy + wh + 90} L ${x0 + sw},${wy + wh + 90} Z`} fill="#f7a1c4" {...kst(6)} />
            </Vol>
            <path d={`M ${(x0 + x1) / 2},${wy - 40} Q ${(x0 + x1) / 2 - d * 10 + sw},${wy + wh * 0.5} ${(x0 + x1) / 2 + sw},${wy + wh + 86}`} fill="none" stroke="#e57fa8" strokeWidth={5} />
            <ellipse cx={x1 - d * 62} cy={wy + wh * 0.62} rx={16} ry={10} fill="#ffd166" {...kst(4)} />
          </g>
        );
      })}
      {/* glow-in-the-dark stars on the wall */}
      {[[0.1, 0.1], [0.3, 0.06], [0.45, 0.18], [0.2, 0.26]].map(([sx, sy], i) => (
        <path key={i} d="M 0,-20 L 6,-6 L 20,-6 L 9,4 L 13,18 L 0,10 L -13,18 L -9,4 L -20,-6 L -6,-6 Z" fill="#fff3b0" opacity={0.7 + 0.3 * Math.sin(t * 1.5 + i)} transform={`translate(${w * sx},${h * sy}) scale(1.4)`} />
      ))}
      {/* wall shelf: books, a teddy, a star night-light */}
      <g>
        {Array.from({ length: 5 }).map((_, i) => (
          <Book key={i} x={shelfX + 14 + i * 26} y={shelfY} bw={22} bh={70 + rnd(i, 7) * 30} c={['#ff8fab', '#8ecae6', '#ffd166', '#b197fc', '#69db7c'][i]} tilt={i === 4 ? 14 : 0} />
        ))}
        <g transform={`translate(${shelfX + shelfW * 0.72},${shelfY})`}>
          <Vol>
            <circle cx={0} cy={-34} r={32} fill="#c8814f" {...kst(4)} />
            <circle cx={0} cy={-84} r={28} fill="#c8814f" {...kst(4)} />
            <circle cx={-22} cy={-106} r={11} fill="#c8814f" {...kst(3)} />
            <circle cx={22} cy={-106} r={11} fill="#c8814f" {...kst(3)} />
          </Vol>
          <ellipse cx={0} cy={-76} rx={13} ry={9} fill="#f3d3b0" />
          <circle cx={-9} cy={-90} r={4} fill={KINK} />
          <circle cx={9} cy={-90} r={4} fill={KINK} />
          <ellipse cx={0} cy={-30} rx={18} ry={16} fill="#f3d3b0" />
        </g>
        <Vol kind="slope">
          <rect x={shelfX} y={shelfY} width={shelfW} height={18} rx={6} fill="#c0874f" {...kst(5)} />
        </Vol>
      </g>
      {/* nightstand + lamp (its glow is the `lamp` prop) */}
      {lamp && <ellipse cx={lampX} cy={lampY + 20} rx={300} ry={260} fill="url(#kLampGlow)" />}
      <g>
        {KIDS_3D && <ellipse cx={lampX} cy={f + 2} rx={nsW * 0.65} ry={14} fill="url(#k3d-ground)" />}
        <Vol kind="slope">
          <rect x={nsX} y={f - nsH} width={nsW} height={nsH} rx={14} fill="#c0874f" {...kst(6)} />
        </Vol>
        <rect x={nsX + 14} y={f - nsH + 24} width={nsW - 28} height={44} rx={8} fill="#a8703f" {...kst(4)} />
        <circle cx={lampX} cy={f - nsH + 46} r={6} fill="#ffd166" {...kst(3)} />
        <rect x={lampX - 26} y={f - nsH - 14} width={52} height={14} rx={6} fill="#8ecae6" {...kst(4)} />
        <rect x={lampX - 5} y={lampY + 20} width={10} height={f - nsH - 14 - lampY - 20} fill="#8ecae6" {...kst(3)} />
        <Vol kind="tube">
          <path d={`M ${lampX - 30},${lampY - 30} L ${lampX + 30},${lampY - 30} L ${lampX + 50},${lampY + 24} L ${lampX - 50},${lampY + 24} Z`} fill={lamp ? '#ffe08a' : '#c9b6e4'} {...kst(5)} />
        </Vol>
      </g>
      {/* bed: frame, mattress, quilt, pillow */}
      <g transform={`translate(${w * 0.5},${f})`}>
        {KIDS_3D && <ellipse cx={0} cy={0} rx={w * 0.42} ry={30} fill="url(#k3d-ground)" />}
        <Vol kind="tube">
          <rect x={-w * 0.36} y={-300} width={46} height={300} rx={18} fill="#c0874f" {...kst(7)} />
          <rect x={w * 0.36 - 46} y={-200} width={46} height={200} rx={18} fill="#c0874f" {...kst(7)} />
        </Vol>
        <Vol kind="slope">
          <rect x={-w * 0.36 + 30} y={-90} width={w * 0.72 - 60} height={70} rx={14} fill="#c0874f" {...kst(6)} />
        </Vol>
        <rect x={-w * 0.36 + 34} y={-150} width={w * 0.72 - 68} height={64} rx={20} fill="#ffffff" {...kst(5)} />
        <Vol>
          <ellipse cx={-w * 0.25} cy={-178} rx={w * 0.08 + 30} ry={42} fill="#ffffff" {...kst(6)} />
        </Vol>
        <Vol kind="slope" shape={<path d={`M ${-w * 0.16},${-176} L ${w * 0.36 - 40},${-176} Q ${w * 0.36 - 16},${-176} ${w * 0.36 - 20},${-130} L ${w * 0.36 - 26},${-40} L ${-w * 0.16},${-40} Z`} />}>
          <path d={`M ${-w * 0.16},${-176} L ${w * 0.36 - 40},${-176} Q ${w * 0.36 - 16},${-176} ${w * 0.36 - 20},${-130} L ${w * 0.36 - 26},${-40} L ${-w * 0.16},${-40} Z`} fill="#8ecae6" {...kst(6)} />
          {Array.from({ length: 5 }).map((_, i) => (
            <rect key={i} x={-w * 0.16 + 40 + i * ((w * 0.52 - 80) / 5)} y={-150} width={(w * 0.52 - 80) / 5 - 18} height={80} rx={10} fill={i % 2 ? '#b8e0f2' : '#a3d5ec'} />
          ))}
        </Vol>
        <rect x={-w * 0.16 - 10} y={-180} width={42} height={142} rx={14} fill="#ffffff" {...kst(5)} />
      </g>
      {/* floor: planks, striped rug, a ball and blocks */}
      <rect x={0} y={f} width={w} height={h - f} fill="#5a4b8a" />
      <Planks w={w} h={h} f={f} c="#4d3f7a" />
      <g transform={`translate(${w / 2},${f + (h - f) * 0.58})`}>
        {['#ff8fab', '#ffd6e5', '#ff8fab', '#ffd6e5'].map((c, i) => (
          <ellipse key={i} rx={w * (wide ? 0.28 : 0.38) * (1 - i * 0.2)} ry={(h - f) * 0.28 * (1 - i * 0.2)} fill={c} {...(i === 0 ? kst(5) : {})} />
        ))}
      </g>
      {KIDS_3D && <rect x={0} y={f} width={w} height={h - f} fill="url(#k3d-floor)" />}
      <line x1={0} y1={f} x2={w} y2={f} {...kst(7)} />
      <g transform={`translate(${w * 0.9},${f + (h - f) * 0.42})`}>
        {KIDS_3D && <ellipse cx={0} cy={30} rx={46} ry={10} fill="url(#k3d-ground)" />}
        <Vol>
          <circle r={34} fill="#ff6b6b" {...kst(5)} />
        </Vol>
        <path d="M -34,0 Q 0,18 34,0" fill="none" stroke="#ffffff" strokeWidth={8} />
      </g>
      {[['#ffd43b', 0], ['#69db7c', 52], ['#4dabf7', 26]].map(([c, dx], i) => (
        <g key={i} transform={`translate(${w * 0.06 + Number(dx)},${f + (h - f) * 0.5 - (i === 2 ? 48 : 0)})`}>
          <Vol>
            <rect x={-24} y={-24} width={48} height={48} rx={8} fill={String(c)} {...kst(4)} />
          </Vol>
        </g>
      ))}
      <Vignette w={w} h={h} o={0.3} id="kBedVig" />
    </g>
  );
};

// four-point sparkle star (space, magic)
const Sparkle: React.FC<{ x: number; y: number; s: number; o: number; c?: string }> = ({ x, y, s, o, c = '#ffffff' }) => (
  <path d="M 0,-18 Q 3,-3 18,0 Q 3,3 0,18 Q -3,3 -18,0 Q -3,-3 0,-18 Z" transform={`translate(${x},${y}) scale(${s})`} fill={c} opacity={o} />
);

// ── SPACE — science. A deep 3-stop sky with breathing nebulae, stars in three sizes + sparkles, a
// shooting star, a small Earth (continents drift past), a striped ringed planet (ring passes behind
// and in front), a little grey moon and a far red planet, a far ridge, the moon ground with craters,
// rocks and pastel crystals at the edges.
export const Space: React.FC<SetProps> = ({ w = 1080, h = 1920, t = 0 }) => {
  const f = FLOOR(h);
  const wide = w > h;
  const ex = w * 0.2;
  const ey = h * (wide ? 0.26 : 0.3);
  const er = wide ? 62 : 58;
  const px = w * 0.78;
  const py = h * 0.18;
  return (
    <g>
      <defs>
        <linearGradient id="kSpace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f0c3a" />
          <stop offset="0.55" stopColor="#2a1d6b" />
          <stop offset="1" stopColor="#5a2f8f" />
        </linearGradient>
        <radialGradient id="kNebPink">
          <stop offset="0" stopColor="#ff6fd8" stopOpacity={0.35} />
          <stop offset="1" stopColor="#ff6fd8" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="kNebTeal">
          <stop offset="0" stopColor="#4cc9f0" stopOpacity={0.3} />
          <stop offset="1" stopColor="#4cc9f0" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="kAtmo">
          <stop offset="0.7" stopColor="#9be0ff" stopOpacity={0.5} />
          <stop offset="1" stopColor="#9be0ff" stopOpacity={0} />
        </radialGradient>
        <clipPath id="kEarthClip"><circle cx={ex} cy={ey} r={er} /></clipPath>
        <clipPath id="kRingedClip"><circle cx={px} cy={py} r={90} /></clipPath>
      </defs>
      <K3DDefs />
      <rect width={w} height={h} fill="url(#kSpace)" />
      <ellipse cx={w * 0.3} cy={h * 0.18} rx={w * 0.5} ry={h * 0.16} fill="url(#kNebPink)" transform={`scale(${1 + Math.sin(t * 0.4) * 0.03})`} />
      <ellipse cx={w * 0.75} cy={h * 0.42} rx={w * 0.45} ry={h * 0.14} fill="url(#kNebTeal)" />
      {/* stars: many tiny, some medium, a few sparkles */}
      {Array.from({ length: 70 }).map((_, i) => (
        <circle key={i} cx={rnd(i, 1) * w} cy={rnd(i, 2) * (f - 60)} r={1.5 + rnd(i, 3) * 2.5} fill="#ffffff" opacity={0.4 + 0.6 * Math.abs(Math.sin(t * (0.8 + rnd(i, 4)) + i))} />
      ))}
      {Array.from({ length: wide ? 7 : 5 }).map((_, i) => (
        <Sparkle key={i} x={rnd(i, 5) * w} y={rnd(i, 6) * f * 0.6} s={0.7 + 0.5 * Math.max(0, Math.sin(t * 1.2 + i * 2))} o={0.5 + 0.5 * Math.max(0, Math.sin(t * 1.2 + i * 2))} c={i % 2 ? '#fff3b0' : '#ffffff'} />
      ))}
      {(() => {
        const p = (t % 7) / 1.2; // a shooting star every 7 s
        if (p > 1) return null;
        const sx = w * (0.15 + 0.5 * p);
        const sy = h * (0.08 + 0.12 * p);
        return (
          <g opacity={Math.sin(p * Math.PI)}>
            <line x1={sx - 160} y1={sy - 40} x2={sx} y2={sy} stroke="#fff3b0" strokeWidth={8} strokeLinecap="round" opacity={0.6} />
            <Sparkle x={sx} y={sy} s={1} o={1} />
          </g>
        );
      })()}
      {/* far red planet + little moon */}
      <Vol><circle cx={w * 0.52} cy={h * 0.1} r={20} fill="#ff8a65" {...kst(4)} /></Vol>
      <Vol><circle cx={px - 150} cy={py + 110} r={26} fill="#c9c9de" {...kst(4)} /></Vol>
      <circle cx={px - 158} cy={py + 104} r={6} fill="#a5a5c4" />
      {/* Earth: ocean, drifting continents, clouds, atmosphere glow */}
      <circle cx={ex} cy={ey} r={er * 1.35} fill="url(#kAtmo)" />
      <Vol><circle cx={ex} cy={ey} r={er} fill="#4dabf7" {...kst(6)} /></Vol>
      <g clipPath="url(#kEarthClip)">
        <g transform={`translate(${((t * 6) % (er * 4)) - er * 2},0)`}>
          {[-er * 4, 0, er * 4].map((ox) => (
            <g key={ox} transform={`translate(${ex + ox},${ey})`} fill="#69db7c">
              <path d={`M ${-er * 0.7},${-er * 0.3} Q ${-er * 0.3},${-er * 0.8} ${er * 0.1},${-er * 0.4} Q ${-er * 0.1},${er * 0.1} ${-er * 0.5},${er * 0.2} Z`} />
              <path d={`M ${er * 0.3},${er * 0.1} Q ${er * 0.9},${-er * 0.1} ${er * 0.8},${er * 0.5} Q ${er * 0.4},${er * 0.8} ${er * 0.2},${er * 0.5} Z`} />
              <path d={`M ${er * 1.3},${-er * 0.5} Q ${er * 1.7},${-er * 0.6} ${er * 1.8},${-er * 0.2} Q ${er * 1.5},${er * 0.1} ${er * 1.3},${-er * 0.5} Z`} />
            </g>
          ))}
        </g>
        <ellipse cx={ex + Math.sin(t * 0.3) * 10} cy={ey - er * 0.15} rx={er * 0.5} ry={er * 0.1} fill="#ffffff" opacity={0.7} />
      </g>
      {KIDS_3D && <circle cx={ex} cy={ey} r={er} fill="url(#k3d-ball)" />}
      {/* ringed planet: back half of the ring, the striped planet, the front half */}
      <g transform={`rotate(-18 ${px} ${py})`}>
        <path d={`M ${px - 150},${py} A 150,32 0 0 1 ${px + 150},${py}`} fill="none" stroke="#ffd166" strokeWidth={14} opacity={0.8} />
      </g>
      <Vol><circle cx={px} cy={py} r={90} fill="#ff9f43" {...kst(7)} /></Vol>
      <g clipPath="url(#kRingedClip)" opacity={0.55}>
        <rect x={px - 100} y={py - 40} width={200} height={18} fill="#ffd166" transform={`rotate(-18 ${px} ${py})`} />
        <rect x={px - 100} y={py + 18} width={200} height={26} fill="#e8833a" transform={`rotate(-18 ${px} ${py})`} />
      </g>
      {KIDS_3D && <circle cx={px} cy={py} r={90} fill="url(#k3d-ball)" />}
      <g transform={`rotate(-18 ${px} ${py})`}>
        <path d={`M ${px - 150},${py} A 150,32 0 0 0 ${px + 150},${py}`} fill="none" stroke="#ffd166" strokeWidth={14} />
      </g>
      {/* far ridge, then the moon ground */}
      <Vol kind="slope">
        <path d={`M 0,${f - h * 0.05} Q ${w * 0.15},${f - h * 0.09} ${w * 0.3},${f - h * 0.05} Q ${w * 0.55},${f - h * 0.1} ${w * 0.75},${f - h * 0.045} Q ${w * 0.9},${f - h * 0.08} ${w},${f - h * 0.05} L ${w},${h} L 0,${h} Z`} fill="#8f8fb8" {...kst(5)} />
      </Vol>
      <Vol kind="slope">
        <path d={`M 0,${f} Q ${w / 2},${f - 90} ${w},${f} L ${w},${h} L 0,${h} Z`} fill="#c3c3dc" {...kst(7)} />
      </Vol>
      {KIDS_3D && <path d={`M 0,${f} Q ${w / 2},${f - 90} ${w},${f} L ${w},${h} L 0,${h} Z`} fill="url(#k3d-floor)" />}
      {/* craters are dents: light on the far rim, shadow on the near one (the ball shading flipped) */}
      {[[0.2, 60, 40], [0.55, 110, 30], [0.85, 70, 50], [0.38, 150, 24]].map(([cx, dy, r], i) => (
        <g key={i} transform={`rotate(180 ${w * cx} ${f + dy})`}>
          <Vol>
            <ellipse cx={w * cx} cy={f + dy} rx={r} ry={r * 0.45} fill="#9c9cbd" {...kst(5)} />
          </Vol>
        </g>
      ))}
      {[[0.1, 0.5, 22], [0.7, 0.62, 16], [0.95, 0.4, 26]].map(([sx, sy, r], i) => (
        <Vol key={i}>
          <ellipse cx={w * sx} cy={f + (h - f) * sy} rx={r} ry={r * 0.7} fill="#a9a9c9" {...kst(4)} />
        </Vol>
      ))}
      {/* pastel crystals at the edges */}
      {[[0.04, -1, '#b197fc'], [0.96, 1, '#4cc9f0']].map(([sx, d, c], i) => (
        <g key={i} transform={`translate(${w * Number(sx)},${f + 10}) scale(${Number(d)},1)`}>
          <Vol>
            <path d="M 0,0 L -10,-90 L 14,-130 L 30,-80 L 24,0 Z" fill={String(c)} {...kst(5)} />
            <path d="M 20,0 L 34,-60 L 54,-74 L 60,-30 L 50,0 Z" fill={String(c)} {...kst(5)} />
          </Vol>
          <path d="M 4,-90 L 12,-120" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
        </g>
      ))}
      <Vignette w={w} h={h} o={0.3} id="kSpaceVig" />
    </g>
  );
};

// ── UNDERWATER — animals, science. Sunlit shallow sea: a shimmering surface, swaying light rays,
// hazy reef silhouettes far away, rising bubbles, a rippled sand floor with drifting caustics, rocks,
// corals (branching, brain, fan, tube sponges) and leafy kelp at the edges (the centre stays open),
// a starfish and shells; little fish swim across unless life={false} (episodes that COUNT fish).
export const Underwater: React.FC<SetProps & { life?: boolean }> = ({ w = 1080, h = 1920, t = 0, life = true }) => {
  const f = FLOOR(h);
  const wide = w > h;
  const reef = (y: number, amp: number, k: number) =>
    `M 0,${h} L 0,${y} ` + Array.from({ length: 9 }).map((_, i) => `Q ${(w * (i + 0.5)) / 8},${y - amp * (0.5 + rnd(i, k))} ${(w * (i + 1)) / 8},${y}`).join(' ') + ` L ${w},${h} Z`;
  return (
    <g>
      <defs>
        <linearGradient id="kSea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6fdcf0" />
          <stop offset="0.45" stopColor="#2bb3d9" />
          <stop offset="1" stopColor="#0a6fae" />
        </linearGradient>
        <linearGradient id="kSeaRay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.3} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="kSand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7e0a3" />
          <stop offset="1" stopColor="#e8c77e" />
        </linearGradient>
      </defs>
      <K3DDefs />
      <rect width={w} height={h} fill="url(#kSea)" />
      {/* the surface shimmering overhead */}
      {Array.from({ length: 4 }).map((_, i) => (
        <path key={i} d={`M 0,${20 + i * 26} ` + Array.from({ length: 8 }).map((_, k) => `Q ${(w * (k + 0.5)) / 8},${20 + i * 26 + Math.sin(t * 1.5 + k + i) * 10} ${(w * (k + 1)) / 8},${20 + i * 26}`).join(' ')} fill="none" stroke="#ffffff" strokeWidth={4} opacity={0.3 - i * 0.06} />
      ))}
      {/* light rays, gently swaying */}
      {Array.from({ length: 6 }).map((_, i) => {
        const x = w * (0.08 + i * 0.17);
        const sw = Math.sin(t * 0.5 + i) * w * 0.02;
        return <path key={i} d={`M ${x - 30},0 L ${x + 40},0 L ${x + w * 0.06 + sw},${h * 0.75} L ${x - w * 0.08 + sw},${h * 0.75} Z`} fill="url(#kSeaRay)" />;
      })}
      {/* hazy reef silhouettes far away */}
      <path d={reef(f - h * 0.1, h * 0.06, 3)} fill="#3fa9cf" opacity={0.6} />
      <path d={reef(f - h * 0.05, h * 0.05, 5)} fill="#2a93bf" opacity={0.6} />
      {/* rising bubbles */}
      {Array.from({ length: 14 }).map((_, i) => {
        const y = h - ((t * 90 + i * 211) % (h + 100));
        return <circle key={i} cx={((i * 157) % w) + Math.sin(t * 2 + i) * 12} cy={y} r={8 + (i % 4) * 5} fill="#ffffff" fillOpacity={0.08} stroke="#ffffff" strokeWidth={4} opacity={0.6} />;
      })}
      {/* sand floor with ripples + drifting caustics */}
      <rect x={0} y={f} width={w} height={h - f} fill="url(#kSand)" />
      <path d={`M 0,${f} Q ${w * 0.25},${f - 30} ${w * 0.5},${f} T ${w},${f} L ${w},${f + 40} L 0,${f + 40} Z`} fill="#f7e0a3" {...kst(6)} />
      {Array.from({ length: 7 }).map((_, i) => (
        <path key={i} d={`M ${w * rnd(i, 1) - 60},${f + (h - f) * (0.2 + rnd(i, 2) * 0.7)} q 30,-14 60,0 q 30,14 60,0`} fill="none" stroke="#e3c47c" strokeWidth={5} strokeLinecap="round" />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <ellipse key={i} cx={(w * rnd(i, 3) + t * 20) % w} cy={f + (h - f) * (0.25 + rnd(i, 4) * 0.6)} rx={50 + Math.sin(t + i) * 12} ry={12} fill="#ffffff" opacity={0.18} />
      ))}
      {KIDS_3D && <rect x={0} y={f} width={w} height={h - f} fill="url(#k3d-floor)" />}
      {/* rocks */}
      {[[0.03, 70], [0.97, 90], [0.88, 50]].map(([sx, r], i) => (
        <g key={i}>
          <Vol>
            <ellipse cx={w * sx} cy={f + 6} rx={r * 1.3} ry={r} fill="#8e9ab5" {...kst(5)} />
          </Vol>
          <ellipse cx={w * sx - r * 0.3} cy={f - r * 0.7} rx={r * 0.5} ry={r * 0.18} fill="#69c08a" opacity={0.8} />
        </g>
      ))}
      {/* kelp at the edges, leafy, swaying */}
      {[0.06, 0.18, 0.82, 0.94].map((sx, i) => {
        const tall = (wide ? 0.45 : 0.32) * h * (0.8 + rnd(i, 6) * 0.4);
        const sw = (y: number) => Math.sin(t * 1.1 + i + y * 0.01) * 14 * (y / tall);
        const x0 = w * sx;
        return (
          <g key={i}>
            <path d={`M ${x0},${f} Q ${x0 + sw(tall * 0.5) - 20},${f - tall * 0.5} ${x0 + sw(tall)},${f - tall}`} fill="none" stroke="#2a9d8f" strokeWidth={14} strokeLinecap="round" />
            {Array.from({ length: 6 }).map((_, k) => {
              const y = tall * (0.15 + k * 0.15);
              const d = k % 2 ? 1 : -1;
              return <ellipse key={k} cx={x0 + sw(y) - 10 + d * 26} cy={f - y} rx={30} ry={12} fill={k % 2 ? '#3fbf9f' : '#2fae8e'} transform={`rotate(${d * -30} ${x0 + sw(y) - 10 + d * 26} ${f - y})`} {...kst(3)} />;
            })}
          </g>
        );
      })}
      {/* corals */}
      <g transform={`translate(${w * 0.12},${f + 4})`}>
        {[[-40, -110], [-10, -150], [26, -120], [50, -80]].map(([x, y], i) => (
          <g key={i}>
            <path d={`M 0,0 Q ${x * 0.4},${y * 0.5} ${x},${y}`} fill="none" stroke={KINK} strokeWidth={26} strokeLinecap="round" />
            <path d={`M 0,0 Q ${x * 0.4},${y * 0.5} ${x},${y}`} fill="none" stroke="#ff7aa8" strokeWidth={18} strokeLinecap="round" />
          </g>
        ))}
      </g>
      <g transform={`translate(${w * 0.86},${f + 8})`}>
        <Vol>
          <path d="M -70,0 Q -70,-90 0,-92 Q 70,-90 70,0 Z" fill="#ffb347" {...kst(5)} />
        </Vol>
        <path d="M -48,-20 Q -30,-60 0,-66 Q 30,-60 46,-22 M -26,-12 Q -10,-40 18,-40" fill="none" stroke="#e8902f" strokeWidth={5} strokeLinecap="round" />
      </g>
      <g transform={`translate(${w * 0.26},${f + 6})`}>
        <Vol>
          <path d="M 0,0 L -70,-150 Q 0,-200 70,-150 Z" fill="#b388ff" {...kst(5)} />
        </Vol>
        <path d="M 0,0 L -40,-160 M 0,0 L 0,-176 M 0,0 L 40,-160" stroke="#8f6bdc" strokeWidth={5} />
      </g>
      <g transform={`translate(${w * 0.74},${f + 6})`}>
        {[[-26, 110], [0, 150], [26, 90]].map(([x, th], i) => (
          <g key={i}>
            <Vol kind="tube">
              <rect x={x - 14} y={-th} width={28} height={th} rx={14} fill="#ff924c" {...kst(4)} />
            </Vol>
            <ellipse cx={x} cy={-th + 8} rx={9} ry={5} fill="#b85a1f" />
          </g>
        ))}
      </g>
      {/* starfish + shells */}
      <g transform={`translate(${w * 0.38},${f + (h - f) * 0.5}) rotate(12)`}>
        <Vol>
          <path d="M 0,-34 L 9,-11 L 33,-10 L 14,5 L 21,29 L 0,15 L -21,29 L -14,5 L -33,-10 L -9,-11 Z" fill="#ff6b6b" {...kst(4)} />
        </Vol>
      </g>
      {[[0.62, 0.62, '#ffd6e5'], [0.5, 0.78, '#fff3d6']].map(([sx, sy, c], i) => (
        <g key={i} transform={`translate(${w * Number(sx)},${f + (h - f) * Number(sy)})`}>
          <Vol>
            <path d="M -18,0 Q -20,-26 0,-28 Q 20,-26 18,0 Z" fill={String(c)} {...kst(3)} />
          </Vol>
          <path d="M 0,0 L 0,-24 M -8,0 L -12,-20 M 8,0 L 12,-20" stroke="#d9a0b0" strokeWidth={3} />
        </g>
      ))}
      {/* little fish swimming across (life={false} when the episode COUNTS fish — no extras) */}
      {life && [0, 1, 2].map((i) => {
        const dir = i % 2 ? -1 : 1;
        const p = ((t * (40 + i * 12) + i * 400) % (w + 300)) - 150;
        const x = dir > 0 ? p : w - p;
        const y = h * (0.22 + i * 0.13) + Math.sin(t * 1.5 + i) * 18;
        const c = ['#ff924c', '#ffca3a', '#ff6fa5'][i];
        return (
          <g key={i} transform={`translate(${x},${y}) scale(${dir * 0.8},0.8)`}>
            <Vol>
              <path d={`M -40,0 L -70,${-22 + Math.sin(t * 8 + i) * 6} L -70,${22 + Math.sin(t * 8 + i) * 6} Z`} fill={c} {...kst(5)} />
              <ellipse cx={0} cy={0} rx={48} ry={30} fill={c} {...kst(5)} />
            </Vol>
            <circle cx={22} cy={-6} r={8} fill="#ffffff" {...kst(3)} />
            <circle cx={24} cy={-6} r={4} fill={KINK} />
            <path d="M 34,10 Q 40,14 44,8" fill="none" {...kst(3)} />
          </g>
        );
      })}
      <Vignette w={w} h={h} o={0.28} id="kSeaVig" />
    </g>
  );
};

// a rounded leafy tree (forest mid-ground and the framing trees)
const LeafyTree: React.FC<{ x: number; base: number; s: number; c1: string; c2: string; t?: number; trunk?: string }> = ({ x, base, s, c1, c2, t = 0, trunk = '#8d5a3b' }) => (
  <g transform={`translate(${x},${base}) scale(${s})`}>
    <Vol kind="tube">
      <path d="M -26,0 Q -18,-120 -20,-240 L 20,-240 Q 18,-120 26,0 Z" fill={trunk} {...kst(6)} />
    </Vol>
    <g transform={`rotate(${Math.sin(t * 0.7 + x) * 1.5} 0 -240)`}>
      <Vol>
        {[[-80, -280, 80], [0, -350, 100], [80, -280, 80], [-40, -230, 70], [50, -220, 70]].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? c2 : c1} {...kst(6)} />
        ))}
      </Vol>
      <ellipse cx={-30} cy={-400} rx={46} ry={20} fill="#ffffff" opacity={0.2} />
    </g>
  </g>
);

// a tiered pine silhouette (the far, hazy tree line)
const pinePath = (x: number, base: number, ht: number, wd: number) =>
  `M ${x - wd * 0.5},${base} L ${x - wd * 0.18},${base - ht * 0.38} L ${x - wd * 0.36},${base - ht * 0.38} L ${x - wd * 0.1},${base - ht * 0.7} L ${x - wd * 0.24},${base - ht * 0.7} L ${x},${base - ht} L ${x + wd * 0.24},${base - ht * 0.7} L ${x + wd * 0.1},${base - ht * 0.7} L ${x + wd * 0.36},${base - ht * 0.38} L ${x + wd * 0.18},${base - ht * 0.38} L ${x + wd * 0.5},${base} Z`;

// ── FOREST — animal stories. A sunlit clearing in layers: soft sky + sun glow, a hazy far pine line,
// round leafy mid trees, a grassy clearing with a winding dirt path, big framing trunks at both edges
// with canopy in the top corners, golden light shafts, bushes with berries, ferns, a mossy log,
// mushrooms, flowers; butterflies + floating pollen unless life={false}.
export const Forest: React.FC<SetProps & { life?: boolean }> = ({ w = 1080, h = 1920, t = 0, life = true }) => {
  const f = FLOOR(h);
  const wide = w > h;
  const backY = f - h * (wide ? 0.11 : 0.09); // where the woods meet the clearing
  const k = wide ? 1 : 1.35; // tree scale (a tall frame shows more sky — taller trees)
  return (
    <g>
      <defs>
        <linearGradient id="kForestSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fd3f4" />
          <stop offset="0.6" stopColor="#c9efe0" />
          <stop offset="1" stopColor="#eefbe0" />
        </linearGradient>
        <radialGradient id="kForestSun">
          <stop offset="0" stopColor="#fffbe0" stopOpacity={0.9} />
          <stop offset="1" stopColor="#fffbe0" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="kForestRay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffbe0" stopOpacity={0.75} />
          <stop offset="1" stopColor="#fffbe0" stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <K3DDefs />
      <rect width={w} height={h} fill="url(#kForestSky)" />
      <circle cx={w * 0.7} cy={h * 0.12} r={h * 0.18} fill="url(#kForestSun)" />
      {/* far pine line (hazed — aerial perspective) */}
      {Array.from({ length: Math.ceil(w / 80) + 2 }).map((_, i) => {
        const ht = h * (0.15 + rnd(i, 1) * 0.07) * (wide ? 1 : 1.2);
        return <path key={i} d={pinePath(i * 80 - 30 + rnd(i, 2) * 30, backY - h * 0.01, ht, ht * 0.5)} fill={i % 2 ? '#8cc9b0' : '#9dd4bb'} />;
      })}
      <rect x={0} y={backY - h * 0.2} width={w} height={h * 0.2} fill="#eefbe0" opacity={0.25} />
      {/* mid leafy trees */}
      {Array.from({ length: Math.ceil(w / 260) + 1 }).map((_, i) => (
        <LeafyTree key={i} x={i * 260 + 60 + rnd(i, 3) * 60} base={backY + 10} s={(0.62 + rnd(i, 4) * 0.2) * k} c1={i % 2 ? '#4fae6a' : '#5fbf74'} c2={i % 2 ? '#5fbf74' : '#6fcb80'} t={t} />
      ))}
      <rect x={0} y={0} width={w} height={backY + 10} fill="#eefbe0" opacity={0.12} />
      {/* clearing */}
      <Vol kind="slope">
        <path d={`M 0,${backY} Q ${w * 0.3},${backY - h * 0.02} ${w * 0.55},${backY} T ${w},${backY - h * 0.01} L ${w},${h} L 0,${h} Z`} fill="#8fd27a" {...kst(6)} />
      </Vol>
      {/* bushes with berries along the edge of the woods */}
      {[0.05, 0.3, 0.68, 0.95].map((sx, i) => (
        <g key={i} transform={`translate(${w * sx},${backY + 14})`}>
          <Vol>
            <circle cx={-34} cy={0} r={40} fill="#4fae6a" {...kst(5)} />
            <circle cx={16} cy={-16} r={48} fill="#5fbf74" {...kst(5)} />
            <circle cx={56} cy={4} r={34} fill="#4fae6a" {...kst(5)} />
          </Vol>
          {[[-30, -14], [10, -40], [40, -10]].map(([bx, by], j) => <circle key={j} cx={bx} cy={by} r={7} fill="#ff4d6d" />)}
        </g>
      ))}
      <rect x={0} y={f} width={w} height={h - f} fill="#7cc576" />
      {/* the winding dirt path, narrow far away, wide in front */}
      <path d={`M ${w * 0.47},${backY + 4} Q ${w * 0.56},${backY + (f - backY) * 0.5} ${w * 0.44},${f} Q ${w * 0.3},${f + (h - f) * 0.5} ${w * 0.26},${h} L ${w * 0.74},${h} Q ${w * 0.7},${f + (h - f) * 0.5} ${w * 0.58},${f} Q ${w * 0.62},${backY + (f - backY) * 0.5} ${w * 0.53},${backY + 4} Z`} fill="#e9cf9a" {...kst(5)} />
      {[[0.5, 0.3], [0.62, 0.7], [0.4, 0.82]].map(([sx, sy], i) => (
        <ellipse key={i} cx={w * sx} cy={f + (h - f) * sy} rx={14} ry={7} fill="#cfb27a" />
      ))}
      {KIDS_3D && <rect x={0} y={backY} width={w} height={h - backY} fill="url(#k3d-floor)" />}
      <line x1={0} y1={f} x2={w} y2={f} stroke="#5aa955" strokeWidth={4} opacity={0.5} />
      {/* light shafts */}
      {Array.from({ length: 4 }).map((_, i) => {
        const x = w * (0.2 + i * 0.2);
        return <path key={i} d={`M ${x},0 L ${x + w * 0.06},0 L ${x - w * 0.02},${f} L ${x - w * 0.12},${f} Z`} fill="url(#kForestRay)" opacity={0.6 + Math.sin(t * 0.7 + i) * 0.15} />;
      })}
      {/* mossy log (right) */}
      <g transform={`translate(${w * (wide ? 0.8 : 0.84)},${f + (h - f) * 0.2})`}>
        {KIDS_3D && <ellipse cx={0} cy={28} rx={130} ry={16} fill="url(#k3d-ground)" />}
        <Vol kind="tube">
          <rect x={-120} y={-30} width={220} height={60} rx={30} fill="#a0673c" {...kst(6)} />
        </Vol>
        <ellipse cx={100} cy={0} rx={22} ry={30} fill="#d9a066" {...kst(5)} />
        <ellipse cx={100} cy={0} rx={10} ry={16} fill="none" stroke="#a0673c" strokeWidth={4} />
        <path d="M -110,-26 Q -60,-46 -10,-28 Q 20,-40 60,-26" fill="#6cc955" {...kst(3)} />
      </g>
      {/* mushrooms + ferns + flowers */}
      {[[0.15, 0.4, 1], [0.66, 0.75, 0.8], [0.9, 0.6, 0.9]].map(([sx, sy, s], i) => (
        <g key={i} transform={`translate(${w * sx},${f + (h - f) * sy}) scale(${s})`}>
          <Vol kind="tube">
            <rect x={-14} y={-50} width={28} height={50} rx={10} fill="#fff4e0" {...kst(5)} />
          </Vol>
          <Vol>
            <path d="M -50,-46 Q 0,-110 50,-46 Z" fill="#ff595e" {...kst(5)} />
          </Vol>
          <circle cx={-14} cy={-70} r={8} fill="#ffffff" />
          <circle cx={16} cy={-62} r={6} fill="#ffffff" />
        </g>
      ))}
      {[0.08, 0.92].map((sx, i) => (
        <g key={i} transform={`translate(${w * sx},${f + 20})`}>
          {[-50, -20, 10, 40].map((a, j) => (
            <path key={j} d={`M 0,0 Q ${a * 1.4},-60 ${a * 2.6 + Math.sin(t * 1.4 + j) * 6},-110`} fill="none" stroke="#3a8d3a" strokeWidth={10} strokeLinecap="round" />
          ))}
        </g>
      ))}
      {Array.from({ length: Math.round(w / 220) }).map((_, i) => (
        <Flower key={i} x={80 + i * 220 + rnd(i, 8) * 60} y={f + (h - f) * (0.55 + (i % 3) * 0.15)} c={['#ff6fa5', '#b388ff', '#ffffff', '#ffd166'][i % 4]} s={0.7} t={t} />
      ))}
      {/* framing trees at both edges, canopy in the top corners */}
      {[-1, 1].map((d) => {
        const x = d < 0 ? w * 0.02 : w * 0.98;
        const tw = wide ? 70 : 56;
        const sw = Math.sin(t * 0.6 + d) * 1.2;
        return (
          <g key={d}>
            <Vol kind="tube">
              <path d={`M ${x - tw},${h} Q ${x - tw * 0.7},${h * 0.5} ${x - tw * 0.6},0 L ${x + tw * 0.6},0 Q ${x + tw * 0.7},${h * 0.5} ${x + tw},${h} Z`} fill="#7a4a2e" {...kst(7)} />
            </Vol>
            {[0.3, 0.55, 0.75].map((ky, j) => (
              <path key={j} d={`M ${x - tw * 0.3},${h * ky} q ${tw * 0.2},${-30} 0,${-60}`} fill="none" stroke="#5c3720" strokeWidth={5} strokeLinecap="round" />
            ))}
            <g transform={`rotate(${sw} ${x} 0)`}>
              <Vol>
                {[[0, -0.02, 1], [d * -0.12, 0.04, 0.8], [d * -0.24, -0.01, 0.7], [d * 0.04, 0.12, 0.7]].map(([ox, oy, r], j) => (
                  <circle key={j} cx={x + w * Number(ox)} cy={h * Number(oy)} r={(wide ? 170 : 190) * Number(r)} fill={j % 2 ? '#3f9a5a' : '#4fae6a'} {...kst(6)} />
                ))}
              </Vol>
            </g>
          </g>
        );
      })}
      {life && <Butterflies t={t} box={[w * 0.12, h * 0.35, w * 0.88, f - h * 0.08]} n={2} />}
      {/* floating pollen in the light */}
      {life && Array.from({ length: 10 }).map((_, i) => {
        const p = (t * (0.03 + rnd(i, 9) * 0.03) + rnd(i, 10)) % 1;
        return <circle key={i} cx={w * (0.15 + 0.7 * rnd(i, 11)) + Math.sin(t + i) * 20} cy={f - p * h * 0.5} r={4} fill="#fff59d" opacity={Math.sin(p * Math.PI) * 0.8} />;
      })}
      <Vignette w={w} h={h} o={0.18} id="kForestVig" />
    </g>
  );
};
