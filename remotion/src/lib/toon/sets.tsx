// Toon sets + props — flat cartoon backgrounds on the 1080x1920 stage, same ink/stroke language
// as the rig. Floor line: characters stand with feet at y≈1480–1500. The top ~420px sits under
// the TitleBar and the band y≈1260–1420 under the captions — keep set details that MATTER
// (signs, jokes) between y 450 and 1250.
import React from 'react';
import { FONT_TOON } from './comedy';

const INK = '#22160f';
const st = { stroke: INK, strokeWidth: 7, strokeLinejoin: 'round' as const };

// ---------------------------------------------------------------------------------------------
// ROOM — Bro's bedroom: light-blue wall, window, the "GRIND" poster, wood floor.
// ---------------------------------------------------------------------------------------------
// night 0..1: dusk-to-night grade + a moonlit window (draw it, then the characters — they get no
// overlay, so they pop against the dark room)
export const Room: React.FC<{ wall?: string; poster?: string; night?: number }> = ({ wall = '#8ecae6', poster = 'GRIND', night = 0 }) => (
  <g>
    <rect x={0} y={0} width={1080} height={1460} fill={wall} />
    <rect x={0} y={1240} width={1080} height={220} fill="rgba(0,0,0,0.06)" />
    <line x1={0} y1={1240} x2={1080} y2={1240} stroke={INK} strokeWidth={6} opacity={0.35} />
    {/* window */}
    <g>
      <rect x={850} y={470} width={230} height={420} fill="#bde0fe" {...st} />
      <rect x={870} y={760} width={60} height={130} fill="#a2b5cd" />
      <rect x={940} y={700} width={80} height={190} fill="#8d99ae" />
      <rect x={1030} y={740} width={50} height={150} fill="#a2b5cd" />
      <line x1={965} y1={470} x2={965} y2={890} {...st} />
      <line x1={850} y1={680} x2={1080} y2={680} {...st} />
      {night > 0 && (
        <g opacity={night}>
          <rect x={850} y={470} width={230} height={420} fill="#1d2a52" {...st} />
          <circle cx={1010} cy={545} r={34} fill="#fff3c4" />
          <circle cx={996} cy={538} r={30} fill="#1d2a52" />
          {[[880, 520], [930, 610], [900, 760], [1040, 700]].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r={4} fill="#ffffff" />
          ))}
          <line x1={965} y1={470} x2={965} y2={890} {...st} />
          <line x1={850} y1={680} x2={1080} y2={680} {...st} />
        </g>
      )}
    </g>
    {/* poster */}
    <g transform="rotate(-3 470 600)">
      <rect x={385} y={470} width={170} height={240} fill="#14213d" {...st} />
      <path d="M 480,500 L 440,600 L 475,600 L 455,680 L 515,570 L 478,570 L 500,500 Z" fill="#ffd23f" stroke={INK} strokeWidth={4} />
      <text x={470} y={700} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={34} fill="#ffffff">
        {poster}
      </text>
    </g>
    {/* shelf with a trophy */}
    <rect x={60} y={560} width={220} height={18} fill="#a0522d" {...st} />
    <path d="M 140,560 L 132,520 L 170,520 L 162,560 Z" fill="#f2c14e" stroke={INK} strokeWidth={5} />
    <rect x={200} y={500} width={50} height={60} fill="#e76f51" stroke={INK} strokeWidth={5} />
    {/* floor */}
    <rect x={0} y={1460} width={1080} height={460} fill="#c98b5a" />
    {[1530, 1620, 1720, 1830].map((y) => (
      <line key={y} x1={0} y1={y} x2={1080} y2={y} stroke="#a86f45" strokeWidth={6} />
    ))}
    <line x1={0} y1={1460} x2={1080} y2={1460} stroke={INK} strokeWidth={7} />
    <ellipse cx={540} cy={1560} rx={430} ry={70} fill="#e5989b" opacity={0.85} />
    {night > 0 && <rect x={0} y={0} width={1080} height={1920} fill="#0b1640" opacity={0.55 * night} />}
  </g>
);

// ---------------------------------------------------------------------------------------------
// BEDROOM PROPS — bed (headboard on the LEFT), blanket (drawn AFTER a lying character to tuck
// him in), nightstand, alarm clock. Lying pose: <Toon lean={-90}> with its feet at the foot of
// the bed — the body extends LEFT from the feet, head on the pillow.
// ---------------------------------------------------------------------------------------------
// origin = floor under the headboard's outer edge; mattress top at y - 210
export const Bed: React.FC<{ x: number; y: number; w?: number; sheet?: string; frame?: string }> = ({
  x,
  y,
  w = 820,
  sheet = '#f1faee',
  frame = '#8d5a3b',
}) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={20} y={-60} width={30} height={60} fill={frame} {...st} />
    <rect x={w - 50} y={-60} width={30} height={60} fill={frame} {...st} />
    <rect x={0} y={-150} width={w} height={95} rx={16} fill={frame} {...st} />
    <rect x={10} y={-215} width={w - 20} height={75} rx={30} fill={sheet} {...st} />
    <rect x={-10} y={-470} width={70} height={470} rx={22} fill={frame} {...st} />
    <rect x={80} y={-285} width={190} height={80} rx={38} fill="#ffffff" {...st} />
  </g>
);

// origin = left end at the mattress top; covers a lying body from x to x+w
export const Blanket: React.FC<{ x: number; y: number; w?: number; color?: string }> = ({ x, y, w = 520, color = '#457b9d' }) => (
  <g transform={`translate(${x},${y})`}>
    <path d={`M 0,10 Q 10,-120 120,-128 L ${w - 30},-118 Q ${w},-112 ${w},-60 L ${w},70 L 0,70 Z`} fill={color} {...st} />
    <path d={`M 30,-80 Q ${w / 2},-108 ${w - 40},-80`} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={10} strokeLinecap="round" />
    <path d={`M 0,10 Q ${w / 2},-10 ${w},10`} fill="none" stroke={INK} strokeWidth={6} opacity={0.4} />
  </g>
);

// origin = floor centre
export const Nightstand: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-85} y={-230} width={170} height={230} rx={10} fill="#bc8a5f" {...st} />
    <line x1={-85} y1={-120} x2={85} y2={-120} {...st} />
    <circle cx={0} cy={-170} r={9} fill={INK} />
    <circle cx={0} cy={-62} r={9} fill={INK} />
  </g>
);

// origin = bottom centre. ring (0..1 amplitude) + t make it rattle and throw ring lines.
export const AlarmClock: React.FC<{ x: number; y: number; time: string; ring?: number; t?: number; scale?: number }> = ({
  x,
  y,
  time,
  ring = 0,
  t = 0,
  scale = 1,
}) => {
  const wob = ring * Math.sin(t * 60) * 9;
  const hop = ring * Math.abs(Math.sin(t * 30)) * -10;
  return (
    <g transform={`translate(${x},${y + hop}) scale(${scale}) rotate(${wob})`}>
      <circle cx={-55} cy={-118} r={26} fill="#e9c46a" {...st} />
      <circle cx={55} cy={-118} r={26} fill="#e9c46a" {...st} />
      <rect x={-95} y={-110} width={190} height={110} rx={28} fill="#e63946" {...st} />
      <rect x={-72} y={-92} width={144} height={66} rx={10} fill="#111827" stroke={INK} strokeWidth={5} />
      <text x={0} y={-44} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={50} fill="#7CFC7C">
        {time}
      </text>
      {ring > 0 &&
        [-1, 1].map((s) => (
          <g key={s} stroke={INK} strokeWidth={7} strokeLinecap="round" opacity={0.6 + 0.4 * Math.abs(Math.sin(t * 20))}>
            <line x1={s * 120} y1={-120} x2={s * 160} y2={-150} />
            <line x1={s * 128} y1={-80} x2={s * 175} y2={-82} />
            <line x1={s * 120} y1={-40} x2={s * 160} y2={-14} />
          </g>
        ))}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------
// STREET — sidewalk in front of the MINI MART. The window poster is a joke slot
// (`deal`, e.g. "WATER $1") — keep it in frame when the punchline needs it.
// ---------------------------------------------------------------------------------------------
export const Street: React.FC<{ deal?: string; sunset?: number }> = ({ deal = 'WATER $1', sunset = 0 }) => (
  <g>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7cc6f2" />
        <stop offset="1" stopColor="#cdeefd" />
      </linearGradient>
      <linearGradient id="sunsetSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7b2cbf" />
        <stop offset="0.55" stopColor="#f77f00" />
        <stop offset="1" stopColor="#fcbf49" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={1080} height={1460} fill="url(#sky)" />
    {sunset > 0 && <rect x={0} y={0} width={1080} height={1460} fill="url(#sunsetSky)" opacity={sunset} />}
    {/* back buildings */}
    <rect x={-20} y={520} width={300} height={940} fill="#e9c46a" {...st} />
    {[600, 760, 920, 1080].map((y) =>
      [30, 150].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width={80} height={100} fill="#fdf0d5" {...st} />),
    )}
    <rect x={260} y={640} width={400} height={820} fill="#bc6c25" {...st} />
    {[700, 860, 1020].map((y) =>
      [300, 420, 540].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width={80} height={110} fill="#fefae0" {...st} />),
    )}
    {/* MINI MART */}
    <g>
      <rect x={640} y={680} width={460} height={780} fill="#f1faee" {...st} />
      <rect x={640} y={680} width={460} height={120} fill="#e63946" {...st} />
      <text x={870} y={765} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={70} fill="#ffffff" stroke={INK} strokeWidth={3}>
        MINI MART
      </text>
      {/* awning stripes */}
      {Array.from({ length: 8 }).map((_, i) => (
        <path key={i} d={`M ${640 + i * 58},800 L ${698 + i * 58},800 L ${690 + i * 58},850 L ${648 + i * 58},850 Z`} fill={i % 2 ? '#ffffff' : '#e63946'} stroke={INK} strokeWidth={5} />
      ))}
      <rect x={680} y={880} width={380} height={330} fill="#a8dadc" {...st} />
      <rect x={700} y={1230} width={140} height={230} fill="#457b9d" {...st} />
      {/* the deal poster */}
      <g transform="rotate(4 960 990)">
        <rect x={870} y={900} width={180} height={190} fill="#ffd23f" {...st} />
        <text x={960} y={980} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={44} fill={INK}>
          {deal.split(' ')[0]}
        </text>
        <text x={960} y={1055} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={66} fill="#e63946" stroke={INK} strokeWidth={2}>
          {deal.split(' ').slice(1).join(' ')}
        </text>
      </g>
    </g>
    {sunset > 0 && <rect x={0} y={0} width={1080} height={1920} fill="#f77f00" opacity={0.18 * sunset} />}
    {/* sidewalk */}
    <rect x={0} y={1460} width={1080} height={460} fill="#d6d3cd" />
    {[180, 420, 660, 900].map((x) => (
      <line key={x} x1={x} y1={1460} x2={x - 60} y2={1800} stroke="#b9b5ad" strokeWidth={6} />
    ))}
    <line x1={0} y1={1460} x2={1080} y2={1460} stroke={INK} strokeWidth={7} />
    <rect x={0} y={1800} width={1080} height={30} fill="#8d8a84" />
    <rect x={0} y={1830} width={1080} height={90} fill="#4a4e57" />
  </g>
);

// ---------------------------------------------------------------------------------------------
// PROPS (origin noted per prop)
// ---------------------------------------------------------------------------------------------
// folding table; origin = top-centre of the table top. `sign` text is taped to the cloth.
export const Table: React.FC<{ x: number; y: number; w?: number; sign?: string; cloth?: string }> = ({
  x,
  y,
  w = 300,
  sign,
  cloth = '#f4a261',
}) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-w / 2} y={0} width={w} height={26} fill="#8d6e63" {...st} />
    <path d={`M ${-w / 2 + 6},26 L ${w / 2 - 6},26 L ${w / 2 - 16},250 L ${-w / 2 + 16},250 Z`} fill={cloth} {...st} />
    {sign && (
      <g transform="rotate(-4)">
        <rect x={-120} y={40} width={240} height={130} fill="#d4a373" {...st} />
        <text x={0} y={130} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={56} fill={INK}>
          {sign}
        </text>
        <rect x={-110} y={32} width={44} height={18} fill="rgba(255,255,255,0.7)" transform="rotate(-20 -88 41)" />
        <rect x={66} y={32} width={44} height={18} fill="rgba(255,255,255,0.7)" transform="rotate(20 88 41)" />
      </g>
    )}
  </g>
);

// plastic water bottle; origin = bottom centre (anchor 'bottom') or its middle ('center').
export const Bottle: React.FC<{ x?: number; y?: number; level?: number; anchor?: 'bottom' | 'center'; scale?: number }> = ({
  x = 0,
  y = 0,
  level = 0.85,
  anchor = 'bottom',
  scale = 1,
}) => {
  const oy = anchor === 'center' ? 75 : 0;
  const fill = Math.max(0, Math.min(1, level));
  return (
    <g transform={`translate(${x},${y + oy * scale}) scale(${scale})`}>
      <rect x={-28} y={-120} width={56} height={120} rx={14} fill="rgba(220,240,255,0.65)" {...st} />
      {fill > 0 && <rect x={-24} y={-4 - 112 * fill} width={48} height={112 * fill} rx={10} fill="#4cc9f0" opacity={0.8} />}
      <rect x={-28} y={-82} width={56} height={34} fill="#3a86ff" stroke={INK} strokeWidth={5} />
      <path d="M -20,-120 Q -20,-140 -10,-146 L 10,-146 Q 20,-140 20,-120 Z" fill="rgba(220,240,255,0.65)" {...st} />
      <rect x={-12} y={-162} width={24} height={18} rx={4} fill="#1d4ed8" stroke={INK} strokeWidth={5} />
      <path d="M -14,-108 L -14,-92" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" />
    </g>
  );
};

// wooden crate to sit on; origin = bottom centre
export const Crate: React.FC<{ x: number; y: number; w?: number; h?: number }> = ({ x, y, w = 200, h = 240 }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-w / 2} y={-h} width={w} height={h} fill="#c08552" {...st} />
    <line x1={-w / 2} y1={-h / 2} x2={w / 2} y2={-h / 2} {...st} />
    <line x1={-w / 2} y1={-h} x2={w / 2} y2={0} stroke={INK} strokeWidth={6} opacity={0.5} />
  </g>
);
