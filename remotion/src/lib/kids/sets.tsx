// KIDS KIT — backgrounds. Every set takes the stage size (w,h) so the SAME set serves a 9:16 Short
// (1080x1920) and a 16:9 long video (1920x1080). The ground line is FLOOR(h) — stand characters
// there. Soft pastel-bright colours, gentle idle motion (clouds, bubbles, twinkles) driven by `t`,
// never strobing (kids content: no more than gentle movement in the background).
import React from 'react';
import { KINK, kst } from './face';
import { FONT_TOON } from '../toon/comedy';

export const FLOOR = (h: number) => Math.round(h * (h > 1400 ? 0.79 : 0.84));
type SetProps = { w?: number; h?: number; t?: number };

const Cloud: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} fill="#ffffff" {...kst(6)}>
    <path d="M -110,30 Q -130,-20 -80,-30 Q -70,-80 -10,-74 Q 30,-110 80,-70 Q 130,-70 126,-20 Q 150,20 110,34 Z" />
  </g>
);

const Flower: React.FC<{ x: number; y: number; c: string; s?: number }> = ({ x, y, c, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <line x1={0} y1={0} x2={0} y2={-60} stroke="#3a8d3a" strokeWidth={8} />
    {[0, 72, 144, 216, 288].map((a) => (
      <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 18} cy={-70 + Math.sin((a * Math.PI) / 180) * 18} r={14} fill={c} {...kst(4)} />
    ))}
    <circle cx={0} cy={-70} r={11} fill="#ffd166" {...kst(4)} />
  </g>
);

// smiling sun — a friendly recurring motif
export const Sun: React.FC<{ x: number; y: number; r?: number; t?: number }> = ({ x, y, r = 90, t = 0 }) => (
  <g transform={`translate(${x},${y})`}>
    <g transform={`rotate(${t * 12})`}>
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={-10} y={-r - 52} width={20} height={36} rx={10} fill="#ffb703" transform={`rotate(${i * 30})`} />
      ))}
    </g>
    <circle r={r} fill="#ffd166" {...kst(7)} />
    <circle cx={-28} cy={-10} r={8} fill={KINK} />
    <circle cx={28} cy={-10} r={8} fill={KINK} />
    <path d="M -30,22 Q 0,46 30,22" fill="none" {...kst(7)} />
    <ellipse cx={-48} cy={18} rx={14} ry={8} fill="#ff8fab" opacity={0.6} />
    <ellipse cx={48} cy={18} rx={14} ry={8} fill="#ff8fab" opacity={0.6} />
  </g>
);

export const Meadow: React.FC<SetProps & { sun?: boolean }> = ({ w = 1080, h = 1920, t = 0, sun = true }) => {
  const f = FLOOR(h);
  return (
    <g>
      <defs>
        <linearGradient id="kSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7ec8f8" />
          <stop offset="1" stopColor="#d6f0ff" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#kSky)" />
      {sun && <Sun x={w * 0.8} y={h * 0.2} t={t} />}
      <Cloud x={((w * 0.2 + t * 18) % (w + 300)) - 150} y={h * 0.16} s={1.1} />
      <Cloud x={((w * 0.65 + t * 11) % (w + 300)) - 150} y={h * 0.3} s={0.8} />
      <path d={`M 0,${f - h * 0.12} Q ${w * 0.3},${f - h * 0.22} ${w * 0.6},${f - h * 0.12} T ${w},${f - h * 0.14} L ${w},${h} L 0,${h} Z`} fill="#9be27a" {...kst(6)} />
      <path d={`M 0,${f - h * 0.04} Q ${w * 0.5},${f - h * 0.1} ${w},${f - h * 0.03} L ${w},${h} L 0,${h} Z`} fill="#7bd162" {...kst(6)} />
      <rect x={0} y={f} width={w} height={h - f} fill="#6cc551" />
      {/* tree */}
      <g transform={`translate(${w * 0.1},${f - h * 0.05})`}>
        <rect x={-26} y={-260} width={52} height={260} rx={14} fill="#a0673c" {...kst(6)} />
        {[[-80, -300], [0, -360], [80, -300], [-40, -230], [50, -230]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={95} fill="#55b84a" {...kst(6)} />
        ))}
        <circle cx={-40} cy={-300} r={14} fill="#ff4d6d" {...kst(4)} />
        <circle cx={40} cy={-340} r={14} fill="#ff4d6d" {...kst(4)} />
      </g>
      {Array.from({ length: Math.round(w / 140) }).map((_, i) => (
        <Flower key={i} x={60 + i * 140 + (i % 2) * 30} y={f + 60 + (i % 3) * 70} c={['#ff6fa5', '#b388ff', '#ffffff', '#ff9f43'][i % 4]} s={0.9} />
      ))}
    </g>
  );
};

export const Classroom: React.FC<SetProps & { board?: string[]; boardColor?: string }> = ({ w = 1080, h = 1920, board = [], boardColor = '#ffffff' }) => {
  const f = FLOOR(h);
  const bw = Math.min(w * 0.8, 1300);
  const bx = (w - bw) / 2;
  const by = h * (h > 1400 ? 0.22 : 0.12);
  const bh = h * (h > 1400 ? 0.24 : 0.42);
  return (
    <g>
      <rect width={w} height={f} fill="#ffe8b8" />
      <rect y={f - 120} width={w} height={120} fill="#ffd38a" />
      {/* alphabet bunting */}
      {Array.from({ length: Math.floor(w / 90) }).map((_, i) => (
        <g key={i} transform={`translate(${30 + i * 90},${h * 0.04 + Math.sin(i) * 8})`}>
          <path d="M 0,0 L 70,0 L 35,70 Z" fill={['#ff6b6b', '#4dabf7', '#ffd43b', '#69db7c', '#b197fc'][i % 5]} {...kst(5)} />
          <text x={35} y={36} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={30} fill={KINK}>
            {String.fromCharCode(65 + (i % 26))}
          </text>
        </g>
      ))}
      {/* chalkboard */}
      <rect x={bx - 24} y={by - 24} width={bw + 48} height={bh + 48} rx={20} fill="#c0874f" {...kst(7)} />
      <rect x={bx} y={by} width={bw} height={bh} rx={10} fill="#2f6b52" {...kst(6)} />
      {board.map((l, i) => (
        <text key={i} x={w / 2} y={by + bh * ((i + 1) / (board.length + 1)) + 30} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={Math.min(110, bh / (board.length + 1))} fill={boardColor}>
          {l}
        </text>
      ))}
      <rect x={0} y={f} width={w} height={h - f} fill="#d9a066" />
      {Array.from({ length: Math.ceil(w / 160) }).map((_, i) => (
        <line key={i} x1={i * 160} y1={f} x2={i * 160 - 60} y2={h} stroke="#c48a52" strokeWidth={6} />
      ))}
      <line x1={0} y1={f} x2={w} y2={f} {...kst(7)} />
    </g>
  );
};

export const Bedroom: React.FC<SetProps & { lamp?: boolean }> = ({ w = 1080, h = 1920, t = 0, lamp = true }) => {
  const f = FLOOR(h);
  const wx = w * 0.62;
  const wy = h * 0.14;
  return (
    <g>
      <rect width={w} height={f} fill="#3d3577" />
      <rect y={f - 140} width={w} height={140} fill="#352e69" />
      {/* window with moon + stars */}
      <rect x={wx} y={wy} width={w * 0.3} height={h * 0.22} rx={20} fill="#1d2156" {...kst(7)} />
      <circle cx={wx + w * 0.2} cy={wy + h * 0.07} r={46} fill="#fff3b0" />
      <circle cx={wx + w * 0.2 + 22} cy={wy + h * 0.07 - 12} r={42} fill="#1d2156" />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={wx + 30 + i * (w * 0.055)} cy={wy + 40 + (i % 2) * 90 + 60} r={5 + 2 * Math.sin(t * 2 + i)} fill="#ffffff" />
      ))}
      <line x1={wx + w * 0.15} y1={wy} x2={wx + w * 0.15} y2={wy + h * 0.22} {...kst(6)} />
      {/* glow-in-the-dark stars on the wall */}
      {[[0.1, 0.1], [0.3, 0.06], [0.45, 0.18], [0.2, 0.26]].map(([sx, sy], i) => (
        <path key={i} d="M 0,-20 L 6,-6 L 20,-6 L 9,4 L 13,18 L 0,10 L -13,18 L -9,4 L -20,-6 L -6,-6 Z" fill="#fff3b0" opacity={0.7 + 0.3 * Math.sin(t * 1.5 + i)} transform={`translate(${w * sx},${h * sy}) scale(1.4)`} />
      ))}
      {lamp && <ellipse cx={w * 0.15} cy={f - 220} rx={260} ry={200} fill="#ffd166" opacity={0.18} />}
      {/* bed */}
      <g transform={`translate(${w * 0.5},${f})`}>
        <rect x={-w * 0.36} y={-170} width={w * 0.72} height={150} rx={30} fill="#8ecae6" {...kst(7)} />
        <rect x={-w * 0.36} y={-260} width={40} height={260} rx={12} fill="#c0874f" {...kst(7)} />
        <rect x={w * 0.36 - 40} y={-200} width={40} height={200} rx={12} fill="#c0874f" {...kst(7)} />
        <ellipse cx={-w * 0.24} cy={-180} rx={90} ry={44} fill="#ffffff" {...kst(6)} />
      </g>
      <rect x={0} y={f} width={w} height={h - f} fill="#5a4b8a" />
      <line x1={0} y1={f} x2={w} y2={f} {...kst(7)} />
    </g>
  );
};

export const Space: React.FC<SetProps> = ({ w = 1080, h = 1920, t = 0 }) => {
  const f = FLOOR(h);
  return (
    <g>
      <defs>
        <linearGradient id="kSpace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b1b4b" />
          <stop offset="1" stopColor="#4b2c83" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#kSpace)" />
      {Array.from({ length: 40 }).map((_, i) => {
        const x = (i * 263) % w;
        const y = (i * 419) % (f - 80);
        return <circle key={i} cx={x} cy={y} r={3 + (i % 3) * 2} fill="#ffffff" opacity={0.5 + 0.5 * Math.sin(t * 2 + i)} />;
      })}
      <g transform={`translate(${w * 0.78},${h * 0.18})`}>
        <circle r={90} fill="#ff9f43" {...kst(7)} />
        <ellipse rx={150} ry={32} fill="none" stroke="#ffd166" strokeWidth={14} transform="rotate(-18)" />
      </g>
      <circle cx={w * 0.2} cy={h * 0.3} r={50} fill="#4dabf7" {...kst(6)} />
      <path d={`M 0,${f} Q ${w / 2},${f - 90} ${w},${f} L ${w},${h} L 0,${h} Z`} fill="#b8b8d1" {...kst(7)} />
      {[[0.2, 60, 40], [0.55, 110, 30], [0.85, 70, 50]].map(([cx, dy, r], i) => (
        <ellipse key={i} cx={w * cx} cy={f + dy} rx={r} ry={r * 0.45} fill="#9c9cbd" {...kst(5)} />
      ))}
    </g>
  );
};

export const Underwater: React.FC<SetProps> = ({ w = 1080, h = 1920, t = 0 }) => {
  const f = FLOOR(h);
  return (
    <g>
      <defs>
        <linearGradient id="kSea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#48cae4" />
          <stop offset="1" stopColor="#0077b6" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#kSea)" />
      {Array.from({ length: 6 }).map((_, i) => (
        <path key={i} d={`M ${w * (0.1 + i * 0.17)},0 L ${w * (0.05 + i * 0.17)},${h * 0.6} L ${w * (0.15 + i * 0.17)},${h * 0.6} Z`} fill="#ffffff" opacity={0.06} />
      ))}
      {Array.from({ length: 14 }).map((_, i) => {
        const y = h - (((t * 90 + i * 211) % (h + 100)));
        return <circle key={i} cx={(i * 157) % w + Math.sin(t * 2 + i) * 12} cy={y} r={8 + (i % 4) * 5} fill="none" stroke="#ffffff" strokeWidth={4} opacity={0.6} />;
      })}
      <rect x={0} y={f} width={w} height={h - f} fill="#f4d58d" />
      <path d={`M 0,${f} Q ${w * 0.25},${f - 30} ${w * 0.5},${f} T ${w},${f}`} fill="#f4d58d" {...kst(6)} />
      {[0.08, 0.3, 0.72, 0.92].map((sx, i) => (
        <path key={i} d={`M ${w * sx},${f} q ${-30 + Math.sin(t + i) * 10},-80 0,-160 q ${30 + Math.sin(t + i) * 10},-80 0,-160`} fill="none" stroke="#2a9d8f" strokeWidth={22} strokeLinecap="round" />
      ))}
    </g>
  );
};

export const Forest: React.FC<SetProps> = ({ w = 1080, h = 1920, t = 0 }) => {
  const f = FLOOR(h);
  return (
    <g>
      <rect width={w} height={h} fill="#c7f0d8" />
      {Array.from({ length: Math.ceil(w / 220) + 1 }).map((_, i) => (
        <g key={i} transform={`translate(${i * 220 - 40},${f - 60})`}>
          <rect x={-22} y={-200} width={44} height={200} fill="#8d5a3b" {...kst(6)} />
          <path d="M -130,-160 L 0,-520 L 130,-160 Z" fill={i % 2 ? '#2d9a5a' : '#38b26b'} {...kst(6)} />
          <path d="M -110,-320 L 0,-620 L 110,-320 Z" fill={i % 2 ? '#38b26b' : '#2d9a5a'} {...kst(6)} />
        </g>
      ))}
      <rect x={0} y={f} width={w} height={h - f} fill="#7cc576" />
      <line x1={0} y1={f} x2={w} y2={f} {...kst(7)} />
      {[0.15, 0.6, 0.88].map((sx, i) => (
        <g key={i} transform={`translate(${w * sx},${f + 90 + i * 30})`}>
          <rect x={-14} y={-50} width={28} height={50} rx={10} fill="#fff4e0" {...kst(5)} />
          <path d="M -50,-46 Q 0,-110 50,-46 Z" fill="#ff595e" {...kst(5)} />
          <circle cx={-14} cy={-70} r={8} fill="#ffffff" />
          <circle cx={16} cy={-62} r={6} fill="#ffffff" />
        </g>
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <circle key={i} cx={(i * 233 + t * 30) % w} cy={h * 0.3 + Math.sin(t * 2 + i) * 30 + i * 60} r={6} fill="#fff59d" opacity={0.7} />
      ))}
    </g>
  );
};
