// Toon sets + props — flat cartoon backgrounds on the 1080x1920 stage, same ink/stroke language
// as the rig. Floor line: characters stand with feet at y≈1480–1500. The top ~420px sits under
// the TitleBar and the band y≈1260–1420 under the captions — keep set details that MATTER
// (signs, jokes) between y 450 and 1250.
import React from 'react';
import { FONT_TOON } from './comedy';
import { prog } from '../shorts';

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

// ---------------------------------------------------------------------------------------------
// GYM — mirror wall, motivational poster, dumbbell rack, and a big WALL CLOCK (a joke slot:
// `clockAt` = its position, so a character can be "looking at the clock behind you").
// Floor line y 1460, rubber floor.
// ---------------------------------------------------------------------------------------------
export const Gym: React.FC<{ clockAt?: [number, number]; poster?: string }> = ({ clockAt = [800, 600], poster = 'NO PAIN NO GAIN' }) => (
  <g>
    <rect x={0} y={0} width={1080} height={1460} fill="#d9e2ec" />
    <rect x={0} y={880} width={1080} height={110} fill="#f77f00" />
    <rect x={0} y={990} width={1080} height={24} fill="#22160f" opacity={0.15} />
    {/* mirror */}
    <rect x={330} y={420} width={420} height={430} fill="#bde0fe" {...st} />
    <path d="M 380,460 L 460,460 L 380,560 Z M 480,460 L 520,460 L 400,620 L 380,620 Z" fill="#ffffff" opacity={0.55} />
    {/* poster */}
    <g transform="rotate(-3 160 600)">
      <rect x={50} y={430} width={230} height={330} fill="#22223b" {...st} />
      {poster.split(' ').reduce<string[][]>((rows, w, i) => (i % 2 ? (rows[rows.length - 1].push(w), rows) : [...rows, [w]]), []).map((r, i) => (
        <text key={i} x={165} y={520 + i * 80} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={44} fill={i === 1 ? '#f77f00' : '#ffffff'}>
          {r.join(' ')}
        </text>
      ))}
    </g>
    {/* wall clock */}
    <g transform={`translate(${clockAt[0]},${clockAt[1]})`}>
      <circle r={78} fill="#ffffff" {...st} />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1={0} y1={-62} x2={0} y2={-50} stroke={INK} strokeWidth={6} transform={`rotate(${i * 30})`} />
      ))}
      <line x1={0} y1={0} x2={0} y2={-46} stroke={INK} strokeWidth={9} strokeLinecap="round" transform="rotate(95)" />
      <line x1={0} y1={0} x2={0} y2={-60} stroke="#e63946" strokeWidth={6} strokeLinecap="round" transform="rotate(10)" />
      <circle r={8} fill={INK} />
    </g>
    {/* dumbbell rack */}
    <rect x={820} y={1150} width={240} height={30} fill="#5c677d" {...st} />
    <rect x={840} y={1180} width={20} height={280} fill="#5c677d" {...st} />
    <rect x={1020} y={1180} width={20} height={280} fill="#5c677d" {...st} />
    {[860, 940, 1020].map((x) => (
      <g key={x}>
        <rect x={x - 30} y={1110} width={16} height={40} rx={4} fill="#2b2d42" {...st} />
        <rect x={x - 14} y={1124} width={34} height={12} fill="#8d99ae" />
        <rect x={x + 20} y={1110} width={16} height={40} rx={4} fill="#2b2d42" {...st} />
      </g>
    ))}
    {/* rubber floor */}
    <rect x={0} y={1460} width={1080} height={460} fill="#3d405b" />
    {[0, 270, 540, 810].map((x) => (
      <rect key={x} x={x} y={1460} width={270} height={460} fill="none" stroke="#2f3248" strokeWidth={6} />
    ))}
    <line x1={0} y1={1460} x2={1080} y2={1460} stroke={INK} strokeWidth={7} />
  </g>
);

// barbell; origin = bar centre. Plates carry a readable weight `label` (the joke slot).
export const Barbell: React.FC<{ x?: number; y?: number; w?: number; label?: string; rot?: number }> = ({ x = 0, y = 0, w = 560, label = '10', rot = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <rect x={-w / 2} y={-9} width={w} height={18} rx={9} fill="#adb5bd" {...st} />
    {[-1, 1].map((s) => (
      <g key={s} transform={`translate(${s * (w / 2 - 70)},0)`}>
        <rect x={-26} y={-74} width={52} height={148} rx={12} fill="#2b2d42" {...st} />
        <text x={0} y={14} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill="#ffd23f">
          {label}
        </text>
      </g>
    ))}
  </g>
);

// squat rack uprights + J-hooks; origin = floor centre, hooks at `hookY` (absolute stage y)
export const SquatRack: React.FC<{ x: number; y: number; hookY: number; w?: number }> = ({ x, y, hookY, w = 600 }) => (
  <g>
    {[-1, 1].map((s) => (
      <g key={s}>
        <rect x={x + s * (w / 2) - 18} y={hookY - 330} width={36} height={y - hookY + 330} fill="#5c677d" {...st} />
        <path d={`M ${x + s * (w / 2) - s * 18},${hookY + 4} L ${x + s * (w / 2) - s * 58},${hookY + 4} L ${x + s * (w / 2) - s * 58},${hookY - 24}`} fill="none" stroke="#22160f" strokeWidth={12} strokeLinejoin="round" />
      </g>
    ))}
    <rect x={x - w / 2 - 18} y={hookY - 350} width={w + 36} height={30} fill="#5c677d" {...st} />
  </g>
);

// ---------------------------------------------------------------------------------------------
// KITCHEN — door (left, `doorOpen` for a delivery), upper cabinets, SMOKE ALARM (joke slot,
// `beeping` + t blinks it), fridge (right), backsplash, `char` 0..1 scorch above the stove.
// Draw <Kitchen>, then whoever stands BEHIND the counter, then <Counter> (it hides their legs).
// ---------------------------------------------------------------------------------------------
export const SMOKE_ALARM: [number, number] = [930, 540];
export const Kitchen: React.FC<{ doorOpen?: number; beeping?: boolean; t?: number; char?: number; fridgeOpen?: boolean }> = ({
  doorOpen = 0,
  beeping = false,
  t = 0,
  char = 0,
  fridgeOpen = false,
}) => {
  const led = beeping && Math.sin(t * 18) > 0;
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1460} fill="#ffe8a3" />
      {/* door */}
      <rect x={30} y={620} width={230} height={840} fill="#3d2a1e" {...st} />
      <g transform={`translate(30,620) scale(${1 - 0.75 * doorOpen},1)`}>
        <rect x={0} y={0} width={230} height={840} fill="#bc8a5f" {...st} />
        <rect x={30} y={40} width={170} height={300} rx={8} fill="none" stroke={INK} strokeWidth={5} opacity={0.5} />
        <rect x={30} y={400} width={170} height={380} rx={8} fill="none" stroke={INK} strokeWidth={5} opacity={0.5} />
        <circle cx={200} cy={440} r={12} fill="#f2c14e" stroke={INK} strokeWidth={5} />
      </g>
      {/* upper cabinets */}
      {[290, 530].map((x) => (
        <g key={x}>
          <rect x={x} y={440} width={240} height={260} fill="#81b29a" {...st} />
          <circle cx={x + 120 + (x === 290 ? 90 : -90)} cy={660} r={9} fill={INK} />
        </g>
      ))}
      {/* backsplash */}
      <rect x={270} y={960} width={520} height={220} fill="#ffffff" {...st} />
      {[1015, 1070, 1125].map((y) => (
        <line key={y} x1={270} y1={y} x2={790} y2={y} stroke="#cfd8dc" strokeWidth={4} />
      ))}
      {[340, 410, 480, 550, 620, 690, 760].map((x) => (
        <line key={x} x1={x} y1={960} x2={x} y2={1180} stroke="#cfd8dc" strokeWidth={4} />
      ))}
      {char > 0 && <ellipse cx={445} cy={980} rx={190} ry={260} fill="#1a1a1a" opacity={0.55 * char} />}
      {/* smoke alarm */}
      <g transform={`translate(${SMOKE_ALARM[0]},${SMOKE_ALARM[1]})`}>
        <circle r={44} fill="#ffffff" {...st} />
        <circle r={24} fill="none" stroke="#cfd8dc" strokeWidth={5} />
        <circle cx={22} cy={-20} r={8} fill={led ? '#ff3b30' : '#7a1f1f'} />
        {beeping &&
          [1, 2].map((k) => (
            <path key={k} d={`M ${-60 - k * 22},${-30} Q ${-75 - k * 22},0 ${-60 - k * 22},30`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" opacity={led ? 1 : 0.3} />
          ))}
      </g>
      {/* fridge */}
      <rect x={800} y={640} width={260} height={820} rx={18} fill="#e9ecef" {...st} />
      <line x1={800} y1={960} x2={1060} y2={960} {...st} />
      <rect x={820} y={700} width={14} height={180} rx={6} fill="#adb5bd" />
      <rect x={820} y={1000} width={14} height={220} rx={6} fill="#adb5bd" />
      {fridgeOpen && (
        <g>
          {/* the open fridge: lit interior, sad shelves, door swung out to the right */}
          <rect x={815} y={655} width={230} height={790} rx={10} fill="#fff9db" {...st} />
          {[860, 1060, 1260].map((y) => (
            <line key={y} x1={815} y1={y} x2={1045} y2={y} stroke="#cfd8dc" strokeWidth={8} />
          ))}
          <rect x={850} y={790} width={40} height={70} rx={8} fill="#2dc653" stroke={INK} strokeWidth={4} />
          <rect x={930} y={1180} width={70} height={80} rx={10} fill="#e63946" stroke={INK} strokeWidth={4} />
          <path d="M 1045,650 L 1080,610 L 1080,1500 L 1045,1460 Z" fill="#dee2e6" {...st} />
        </g>
      )}
      <rect x={0} y={1460} width={1080} height={460} fill="#b08968" />
      {[1540, 1640, 1760].map((y) => (
        <line key={y} x1={0} y1={y} x2={1080} y2={y} stroke="#9c6644" strokeWidth={6} />
      ))}
      <line x1={0} y1={1460} x2={1080} y2={1460} stroke={INK} strokeWidth={7} />
    </g>
  );
};

// counter + stove front (draw AFTER the character behind it). STOVE_DIAL = the joke knob.
export const STOVE_DIAL: [number, number] = [445, 1262];
export const Counter: React.FC<{ dial?: number; dialGone?: boolean }> = ({ dial = 0, dialGone = false }) => (
  <g>
    <rect x={260} y={1180} width={540} height={36} fill="#8d99ae" {...st} />
    <rect x={270} y={1216} width={520} height={244} fill="#f1faee" {...st} />
    {/* stove front */}
    <rect x={330} y={1216} width={230} height={244} fill="#2b2d42" {...st} />
    <rect x={355} y={1300} width={180} height={120} rx={12} fill="#11131f" stroke="#8d99ae" strokeWidth={5} />
    {[370, 520].map((x) => (
      <circle key={x} cx={x} cy={1262} r={16} fill="#adb5bd" stroke={INK} strokeWidth={5} />
    ))}
    <StoveDial x={STOVE_DIAL[0]} y={STOVE_DIAL[1]} turn={dial} gone={dialGone} />
    <line x1={665} y1={1216} x2={665} y2={1460} {...st} />
    <circle cx={640} cy={1330} r={9} fill={INK} />
    <circle cx={690} cy={1330} r={9} fill={INK} />
  </g>
);

// the knob: turn 0..1 sweeps OFF→MAX (0..270°); past 1 it keeps going (he forces it); gone = snapped off
export const StoveDial: React.FC<{ x: number; y: number; turn?: number; gone?: boolean }> = ({ x, y, turn = 0, gone }) => (
  <g transform={`translate(${x},${y})`}>
    {[
      ['OFF', -135],
      ['LOW', -45],
      ['HIGH', 45],
      ['MAX', 135],
    ].map(([l, a]) => (
      <text
        key={l as string}
        x={Math.sin(((a as number) * Math.PI) / 180) * 44}
        y={-Math.cos(((a as number) * Math.PI) / 180) * 44 + 5}
        textAnchor="middle"
        fontFamily={FONT_TOON}
        fontWeight={700}
        fontSize={14}
        fill={l === 'MAX' ? '#ff6b6b' : '#ffffff'}
      >
        {l}
      </text>
    ))}
    {gone ? (
      <circle r={8} fill="#11131f" stroke="#8d99ae" strokeWidth={4} />
    ) : (
      <g transform={`rotate(${-135 + 270 * turn})`}>
        <circle r={24} fill="#e9ecef" stroke={INK} strokeWidth={5} />
        <rect x={-4} y={-24} width={8} height={20} rx={3} fill="#e63946" />
      </g>
    )}
  </g>
);

// frying pan on a burner; origin = pan centre
export const Pan: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={70} y={-12} width={140} height={22} rx={10} fill="#2b2b2b" {...st} />
    <path d="M -95,-14 L 95,-14 L 80,22 L -80,22 Z" fill="#3a3a3a" {...st} />
    <ellipse cx={0} cy={-14} rx={95} ry={16} fill="#1f1f1f" {...st} />
  </g>
);

// flickering cartoon flames; origin = base centre, size 0..n
export const Flames: React.FC<{ x: number; y: number; size: number; t: number }> = ({ x, y, size, t }) => {
  if (size <= 0) return null;
  const tongues = [-0.55, -0.2, 0.15, 0.5, 0];
  return (
    <g transform={`translate(${x},${y}) scale(${size})`}>
      {tongues.map((dx, i) => {
        const h = 150 + 60 * Math.sin(t * 13 + i * 1.7) + (i === 4 ? 70 : 0);
        const w = 70 + (i === 4 ? 30 : 0);
        const px = dx * 160;
        return (
          <g key={i}>
            <path d={`M ${px - w},0 Q ${px - w},${-h * 0.55} ${px + Math.sin(t * 9 + i) * 20},${-h} Q ${px + w},${-h * 0.55} ${px + w},0 Z`} fill="#ff7b00" stroke={INK} strokeWidth={6} />
            <path d={`M ${px - w * 0.5},0 Q ${px - w * 0.5},${-h * 0.35} ${px + Math.sin(t * 11 + i) * 12},${-h * 0.62} Q ${px + w * 0.5},${-h * 0.35} ${px + w * 0.5},0 Z`} fill="#ffd60a" />
          </g>
        );
      })}
    </g>
  );
};

// rising smoke puffs from a source; amount 0..1 thickens it. Pair with a grey haze overlay.
export const Smoke: React.FC<{ x: number; y: number; t: number; amount: number }> = ({ x, y, t, amount }) => {
  if (amount <= 0) return null;
  return (
    <g opacity={Math.min(1, amount * 1.2)}>
      {Array.from({ length: 9 }).map((_, i) => {
        const p = (t * 0.35 + i / 9) % 1;
        const r = 50 + p * 140 * (0.6 + amount);
        return (
          <circle
            key={i}
            cx={x + Math.sin(i * 2.3 + p * 4) * 80 * p}
            cy={y - p * 700}
            r={r}
            fill={i % 2 ? '#8d8d8d' : '#a8a8a8'}
            opacity={0.55 * (1 - p)}
          />
        );
      })}
    </g>
  );
};

// phone with a screen; origin = centre
export const Phone: React.FC<{ lines?: string[]; scale?: number }> = ({ lines = ['RECIPE', '3 HRS'], scale = 1 }) => (
  <g transform={`scale(${scale})`}>
    <rect x={-42} y={-78} width={84} height={156} rx={14} fill="#22223b" {...st} />
    <rect x={-32} y={-62} width={64} height={120} rx={6} fill="#e0fbfc" />
    {lines.map((l, i) => (
      <text key={i} x={0} y={-30 + i * 34} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={18} fill={INK}>
        {l}
      </text>
    ))}
  </g>
);

// pizza box (held flat); origin = centre
export const PizzaBox: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <g transform={`scale(${scale})`}>
    <rect x={-130} y={-24} width={260} height={48} rx={6} fill="#e9c46a" {...st} />
    <rect x={-130} y={-24} width={260} height={14} fill="#d4a373" stroke={INK} strokeWidth={5} />
    <text x={0} y={18} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={24} fill="#e63946">
      PIZZA
    </text>
  </g>
);

// ---------------------------------------------------------------------------------------------
// DESK + LAPTOP with a live price CHART — the chart is the joke slot: it rises (dash-reveal),
// crashes, and can SPILL — the crash line breaks out of the bottom of the screen and pours
// onto the desk and the floor (a silent visual punchline).
// Desk origin = floor centre, top at y-280. Laptop origin = base centre (sits on the desk top).
// ---------------------------------------------------------------------------------------------
export const Desk: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 520 }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-w / 2} y={-280} width={w} height={34} fill="#9c6644" {...st} />
    <rect x={-w / 2 + 20} y={-246} width={30} height={246} fill="#7f5539" {...st} />
    <rect x={w / 2 - 50} y={-246} width={30} height={246} fill="#7f5539" {...st} />
    <rect x={w / 2 - 210} y={-246} width={160} height={120} fill="#b08968" {...st} />
  </g>
);

export const LAPTOP_SCREEN = { w: 360, h: 230 }; // screen size; top-left = (x - w/2, y - h - 24)
export const Laptop: React.FC<{
  x: number;
  y: number;
  t: number;
  rise: [number, number]; // chart draws itself up
  crash?: [number, number]; // the plunge
  spill?: [number, number]; // the line pours out of the screen to the floor
  floorY?: number;
  price: string;
  priceColor?: string;
  moon?: boolean; // "TO THE MOON" + rocket at the top of the rise
  spillLeft?: number; // how far left of the laptop centre the line goes over the desk edge
}> = ({ x, y, t, rise, crash, spill, floorY = 1460, price, priceColor = '#2dc653', moon, spillLeft = 190 }) => {
  const { w, h } = LAPTOP_SCREEN;
  const sx = x - w / 2;
  const sy = y - h - 24;
  const rp = prog(t, rise[0], rise[1]);
  const cp = crash ? prog(t, crash[0], crash[1]) : 0;
  const pp = spill ? prog(t, spill[0], spill[1]) : 0;
  const up = 'M 20,200 L 60,170 L 95,185 L 135,130 L 170,145 L 215,85 L 250,100 L 300,40 L 330,26';
  const down = 'M 330,26 L 336,120 L 342,250';
  // where the plunge exits the screen bottom, in stage coords, then down the desk, onto the floor
  const ex = sx + 341;
  // spills LEFT, toward the middle of the frame: down the screen, along the desk top, over the
  // desk's front edge to the floor, where it coils (rightwards, in front of the desk)
  const lx = x - spillLeft;
  const spillD = `M ${ex},${sy + h} L ${ex + 4},${y + 2} L ${lx},${y + 6} L ${lx - 12},${floorY + 10} Q ${lx - 10},${floorY + 40} ${lx + 50},${floorY + 34} Q ${lx + 120},${floorY + 24} ${lx + 85},${floorY + 54} Q ${lx + 50},${floorY + 78} ${lx + 160},${floorY + 68}`;
  const clipId = `laptop-${Math.round(x)}-${Math.round(y)}`;
  return (
    <g>
      {/* lid + screen */}
      <rect x={sx - 18} y={sy - 18} width={w + 36} height={h + 36} rx={16} fill="#2b2d42" {...st} />
      <clipPath id={clipId}>
        <rect x={sx} y={sy} width={w} height={h} />
      </clipPath>
      <rect x={sx} y={sy} width={w} height={h} fill="#0b132b" />
      <g clipPath={`url(#${clipId})`}>
        {[60, 120, 180].map((gy) => (
          <line key={gy} x1={sx} y1={sy + gy} x2={sx + w} y2={sy + gy} stroke="#1c2541" strokeWidth={3} />
        ))}
        <g transform={`translate(${sx},${sy})`}>
          <path d={up} fill="none" stroke="#2dc653" strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - rp} />
          {crash && cp > 0 && (
            <path d={down} fill="none" stroke="#ff3b30" strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - cp} />
          )}
          {moon && rp >= 1 && cp === 0 && (
            <g transform="translate(296,58) rotate(35)">
              <path d="M 0,-34 Q 16,-10 12,18 L -12,18 Q -16,-10 0,-34 Z" fill="#e9ecef" stroke={INK} strokeWidth={4} />
              <circle cx={0} cy={-6} r={6} fill="#4cc9f0" stroke={INK} strokeWidth={3} />
              <path d="M -8,18 L 0,34 L 8,18 Z" fill="#ff7b00" />
            </g>
          )}
        </g>
        <text x={sx + 16} y={sy + 34} fontFamily={FONT_TOON} fontWeight={700} fontSize={24} fill="#e0fbfc">
          BROCOIN
        </text>
        <text x={sx + w - 14} y={sy + 34} textAnchor="end" fontFamily={FONT_TOON} fontWeight={700} fontSize={26} fill={priceColor}>
          {price}
        </text>
        {moon && rp >= 1 && cp === 0 && (
          <text x={sx + 20} y={sy + h - 18} fontFamily={FONT_TOON} fontWeight={700} fontSize={26} fill="#ffd23f">
            TO THE MOON
          </text>
        )}
      </g>
      {/* base */}
      <path d={`M ${sx - 40},${y - 6} L ${sx + w + 40},${y - 6} L ${sx + w + 20},${y} L ${sx - 20},${y} Z`} fill="#8d99ae" {...st} />
      {spill && pp > 0 && (
        <path d={spillD} fill="none" stroke="#ff3b30" strokeWidth={13} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - pp} />
      )}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------
// WIFI KIT — router (red = down / green = up / off = no power), power strip with its cords
// running up to the router, the cord bundle he yanks out (held), the night skyline that
// blacks out in a wave, and a big phone insert with the Wi-Fi screen (password reveal).
// ---------------------------------------------------------------------------------------------
// router; origin = bottom centre (sits on a desk top)
export const Router: React.FC<{ x: number; y: number; state: 'red' | 'green' | 'off'; t: number }> = ({ x, y, state, t }) => {
  const blink = Math.sin(t * 14) > 0;
  const led = state === 'off' ? '#2b2b2b' : state === 'red' ? (blink ? '#ff3b30' : '#5a1414') : '#2dc653';
  return (
    <g transform={`translate(${x},${y})`}>
      <line x1={-70} y1={-56} x2={-95} y2={-170} stroke={INK} strokeWidth={12} strokeLinecap="round" />
      <line x1={70} y1={-56} x2={95} y2={-170} stroke={INK} strokeWidth={12} strokeLinecap="round" />
      <rect x={-110} y={-62} width={220} height={62} rx={16} fill="#3d405b" {...st} />
      {[-60, -20, 20, 60].map((lx) => (
        <circle key={lx} cx={lx} cy={-31} r={9} fill={led} stroke={INK} strokeWidth={3} />
      ))}
    </g>
  );
};

// power strip on the floor; plugged → cords curve up to (toX, toY)
export const PowerStrip: React.FC<{ x: number; y: number; plugged: boolean; toX: number; toY: number }> = ({ x, y, plugged, toX, toY }) => (
  <g>
    {plugged &&
      [-60, -20, 20, 60].map((dx, i) => (
        <path
          key={dx}
          d={`M ${x + dx},${y - 20} C ${x + dx},${y - 160 - i * 20} ${toX - 60 + i * 30},${toY + 120} ${toX - 60 + i * 40},${toY}`}
          fill="none"
          stroke={['#22160f', '#3a3a3a', '#555', '#22160f'][i]}
          strokeWidth={8}
          strokeLinecap="round"
        />
      ))}
    <rect x={x - 130} y={y - 22} width={260} height={44} rx={12} fill="#f1faee" {...st} />
    {[-60, -20, 20, 60].map((dx) => (
      <g key={dx}>
        <circle cx={x + dx} cy={y} r={13} fill="#adb5bd" stroke={INK} strokeWidth={4} />
        {plugged && <rect x={x + dx - 12} y={y - 30} width={24} height={26} rx={5} fill="#2b2d42" stroke={INK} strokeWidth={4} />}
      </g>
    ))}
    <circle cx={x + 110} cy={y} r={7} fill={plugged ? '#ff3b30' : '#5a1414'} />
  </g>
);

// a fistful of yanked plugs with cords dangling; origin = the fist
export const CordBundle: React.FC<{ t: number; swing?: number }> = ({ t, swing = 0 }) => (
  <g>
    {[-1, 0, 1].map((i) => {
      const sway = Math.sin(t * 6 + i) * 18 * (0.3 + swing);
      return (
        <g key={i}>
          <path d={`M ${i * 14},0 Q ${i * 40 + sway},90 ${i * 30 + sway * 1.6},170`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
          <rect x={i * 30 + sway * 1.6 - 14} y={168} width={28} height={30} rx={6} fill="#2b2d42" stroke={INK} strokeWidth={4} />
          <line x1={i * 30 + sway * 1.6 - 6} y1={198} x2={i * 30 + sway * 1.6 - 6} y2={212} stroke="#adb5bd" strokeWidth={5} />
          <line x1={i * 30 + sway * 1.6 + 6} y1={198} x2={i * 30 + sway * 1.6 + 6} y2={212} stroke="#adb5bd" strokeWidth={5} />
        </g>
      );
    })}
  </g>
);

// night skyline; every window goes dark in a wave from `outAt` (left → right over `wave` s)
export const Skyline: React.FC<{ t: number; outAt: number; wave?: number }> = ({ t, outAt, wave = 1.1 }) => {
  const blds = [
    { x: 0, w: 200, h: 760 },
    { x: 190, w: 170, h: 1020 },
    { x: 350, w: 230, h: 640 },
    { x: 570, w: 180, h: 1180 },
    { x: 740, w: 200, h: 820 },
    { x: 930, w: 170, h: 980 },
  ];
  const ground = 1560;
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1920} fill="#0b1640" />
      <circle cx={830} cy={520} r={70} fill="#fff3c4" />
      <circle cx={805} cy={505} r={62} fill="#0b1640" />
      {[[120, 470], [320, 560], [520, 450], [960, 640], [700, 600]].map(([sx, sy]) => (
        <circle key={`${sx}`} cx={sx} cy={sy} r={4} fill="#ffffff" />
      ))}
      {blds.map((b, bi) => (
        <g key={bi}>
          <rect x={b.x} y={ground - b.h} width={b.w} height={b.h} fill={['#1d2a52', '#243461', '#1a2549'][bi % 3]} {...st} />
          {Array.from({ length: Math.floor((b.h - 80) / 90) }).map((_, r) =>
            Array.from({ length: Math.floor((b.w - 30) / 60) }).map((__, c) => {
              const wx = b.x + 24 + c * 60;
              const wy = ground - b.h + 40 + r * 90;
              const jitter = ((bi * 7 + r * 3 + c * 5) % 10) / 10;
              const off = t >= outAt + (wx / 1080) * wave + jitter * 0.15;
              return <rect key={`${r}-${c}`} x={wx} y={wy} width={34} height={46} rx={4} fill={off ? '#111a3a' : '#ffd166'} />;
            }),
          )}
        </g>
      ))}
      <rect x={0} y={ground} width={1080} height={1920 - ground} fill="#0a0f26" />
    </g>
  );
};

// big phone insert with the Wi-Fi screen; origin = phone centre (≈ 520 × 900)
export const WifiPhone: React.FC<{ x: number; y: number; network: string; status?: string; password?: string; typed?: number }> = ({
  x,
  y,
  network,
  status,
  password,
  typed = 1,
}) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-260} y={-450} width={520} height={900} rx={60} fill="#22223b" {...st} />
    <rect x={-228} y={-400} width={456} height={800} rx={30} fill="#f8f9fa" />
    <text x={-196} y={-320} fontFamily={FONT_TOON} fontWeight={700} fontSize={56} fill={INK}>
      Wi-Fi
    </text>
    <rect x={110} y={-358} width={88} height={48} rx={24} fill="#2dc653" />
    <circle cx={174} cy={-334} r={20} fill="#ffffff" />
    <line x1={-200} y1={-270} x2={200} y2={-270} stroke="#dee2e6" strokeWidth={4} />
    <text x={-196} y={-200} fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill={INK}>
      {network}
    </text>
    {/* lock + signal */}
    <rect x={120} y={-228} width={30} height={26} rx={5} fill={INK} />
    <path d="M 125,-228 L 125,-240 Q 135,-254 145,-240 L 145,-228" fill="none" stroke={INK} strokeWidth={5} />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={164 + i * 12} y={-212 - i * 10} width={8} height={12 + i * 10} rx={2} fill={INK} />
    ))}
    {status && (
      <text x={-196} y={-140} fontFamily={FONT_TOON} fontWeight={700} fontSize={34} fill="#e63946">
        {status}
      </text>
    )}
    {password !== undefined && (
      <g>
        <text x={-196} y={-60} fontFamily={FONT_TOON} fontWeight={600} fontSize={32} fill="#6c757d">
          Password:
        </text>
        <rect x={-200} y={-30} width={400} height={84} rx={16} fill="#ffffff" stroke="#adb5bd" strokeWidth={4} />
        <text x={-186} y={26} fontFamily={FONT_TOON} fontWeight={700} fontSize={34} fill={INK}>
          {password.slice(0, Math.round(password.length * Math.max(0, Math.min(1, typed))))}
        </text>
      </g>
    )}
  </g>
);

// desk lamp; origin = base centre (on a desk top). on → warm glow cone.
export const Lamp: React.FC<{ x: number; y: number; on: boolean }> = ({ x, y, on }) => (
  <g transform={`translate(${x},${y})`}>
    {on && <path d="M -40,-200 L -170,0 L 110,0 L 40,-200 Z" fill="#fff3b0" opacity={0.45} />}
    <ellipse cx={0} cy={-8} rx={70} ry={14} fill="#3d405b" {...st} />
    <line x1={0} y1={-12} x2={-40} y2={-150} stroke={INK} strokeWidth={14} strokeLinecap="round" />
    <line x1={-40} y1={-150} x2={10} y2={-230} stroke={INK} strokeWidth={14} strokeLinecap="round" />
    <path d="M -30,-250 L 60,-250 L 90,-190 L -60,-190 Z" fill="#e63946" {...st} transform="rotate(14 15 -220)" />
    {on && <circle cx={22} cy={-186} r={18} fill="#fff9db" />}
  </g>
);

// ---------------------------------------------------------------------------------------------
// DIET KIT — celery (the sad diet), ketchup packet (held: origin = centre), a pile of empty
// packets on the floor, a wall light switch, the fridge-light glow cone, ketchup on a face.
// ---------------------------------------------------------------------------------------------
export const Celery: React.FC<{ bite?: number }> = ({ bite = 0 }) => (
  <g>
    <rect x={-12} y={-150 + bite * 40} width={24} height={170 - bite * 40} rx={10} fill="#95d5b2" {...st} />
    <line x1={-3} y1={-140 + bite * 40} x2={-3} y2={10} stroke="#52b788" strokeWidth={4} />
    {bite === 0 &&
      [-20, 0, 20].map((dx) => <ellipse key={dx} cx={dx} cy={-160} rx={16} ry={22} fill="#52b788" stroke={INK} strokeWidth={4} />)}
  </g>
);

export const KetchupPacket: React.FC<{ squeezed?: number; rot?: number }> = ({ squeezed = 0, rot = 0 }) => (
  <g transform={`rotate(${rot})`}>
    <rect x={-34} y={-24 + squeezed * 8} width={68} height={48 - squeezed * 16} rx={6} fill="#e63946" {...st} />
    <text x={0} y={8} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={16} fill="#ffffff">
      KETCHUP
    </text>
  </g>
);

// a heap of squeezed-empty packets around (x, y); n grows over time to show the damage
export const KetchupPile: React.FC<{ x: number; y: number; n: number }> = ({ x, y, n }) => (
  <g>
    {Array.from({ length: Math.max(0, Math.floor(n)) }).map((_, i) => {
      const a = (i * 137.5 * Math.PI) / 180;
      const r = 30 + (i % 7) * 22;
      return (
        <g key={i} transform={`translate(${x + Math.cos(a) * r * 1.8},${y + Math.sin(a) * r * 0.35}) rotate(${(i * 47) % 360}) scale(0.8)`}>
          <rect x={-34} y={-10} width={68} height={20} rx={5} fill="#c1121f" stroke={INK} strokeWidth={5} />
        </g>
      );
    })}
  </g>
);

export const LightSwitch: React.FC<{ x: number; y: number; on: boolean }> = ({ x, y, on }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-30} y={-46} width={60} height={92} rx={8} fill="#f8f9fa" {...st} />
    <rect x={-10} y={on ? -30 : 0} width={20} height={30} rx={5} fill="#adb5bd" stroke={INK} strokeWidth={4} />
  </g>
);

// cone of fridge light spilling left onto whoever stands in front of it
export const FridgeGlow: React.FC = () => (
  <path d="M 815,660 L 220,1460 L 220,1920 L 1080,1920 L 1045,1450 Z" fill="#fff3b0" opacity={0.28} />
);

// ketchup smeared round a mouth; (x, y) = face centre, s = the character's scale × head scale
export const KetchupFace: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1.12 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} fill="#d00000" opacity={0.9}>
    <ellipse cx={-52} cy={92} rx={22} ry={12} transform="rotate(-20 -52 92)" />
    <ellipse cx={46} cy={70} rx={16} ry={10} transform="rotate(25 46 70)" />
    <ellipse cx={10} cy={128} rx={12} ry={18} />
    <circle cx={64} cy={104} r={7} />
  </g>
);

// ---------------------------------------------------------------------------------------------
// CAR KIT — front-view car with both seats visible through the windshield. Draw order:
//   <RoadBackdrop|House> → <CarInterior> → passengers (legs:'sit') → <CarFront> (wheel, dash +
//   GPS phone, glass, body). Driver sits on the viewer's RIGHT (x≈700), passenger left (x≈380).
// GPS_PHONE = the dashboard phone (zoom here for an insert; its `gps` text is the joke slot).
// ---------------------------------------------------------------------------------------------
export const GPS_PHONE: [number, number] = [540, 1206];
const CAR = '#ffbe0b';
const CAR_DARK = '#e09f00';

export const RoadBackdrop: React.FC<{ t: number; drift?: number; speed?: number }> = ({ t, drift = 0, speed = 1 }) => {
  const hx = 540 + drift * 0.4;
  return (
    <g>
      <defs>
        <linearGradient id="roadsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7cc6f2" />
          <stop offset="1" stopColor="#d7f0fc" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={1080} height={1000} fill="url(#roadsky)" />
      <g transform={`translate(${drift},0)`}>
        {[-400, -150, 60, 300, 560, 820, 1060, 1300].map((x, i) => (
          <rect key={x} x={x} y={1000 - [220, 300, 180, 340, 240, 280, 200, 320][i]} width={190} height={[220, 300, 180, 340, 240, 280, 200, 320][i]} fill={['#adb5bd', '#ced4da', '#a3b1c2'][i % 3]} {...st} />
        ))}
      </g>
      <rect x={0} y={1000} width={1080} height={920} fill="#74c69d" />
      <path d={`M ${hx - 60},1000 L ${hx + 60},1000 L ${540 + 760},1920 L ${540 - 760},1920 Z`} fill="#495057" />
      {Array.from({ length: 6 }).map((_, k) => {
        const z = 1 - ((t * 0.9 * speed + k / 6) % 1); // 1 near the car → 0 at the horizon
        const y = 1000 + 920 * z * z;
        const x = hx + (540 - hx) * z;
        const w = 6 + 26 * z;
        const h = 10 + 90 * z * z;
        return <rect key={k} x={x - w / 2} y={y - h} width={w} height={h} fill="#fefae0" />;
      })}
    </g>
  );
};

// house facade (the punchline destination); mailbox reads `name`
export const House: React.FC<{ name?: string }> = ({ name = 'BRO' }) => (
  <g>
    <rect x={0} y={0} width={1080} height={1000} fill="#a9def9" />
    <rect x={0} y={1000} width={1080} height={920} fill="#74c69d" />
    <rect x={0} y={1280} width={1080} height={640} fill="#6c757d" />
    <path d="M 120,640 L 540,330 L 960,640 Z" fill="#9d0208" {...st} />
    <rect x={170} y={640} width={740} height={640} fill="#ffe8d6" {...st} />
    <rect x={460} y={900} width={160} height={380} rx={10} fill="#6f4518" {...st} />
    <circle cx={590} cy={1100} r={10} fill="#f2c14e" />
    {[250, 700].map((x) => (
      <g key={x}>
        <rect x={x} y={720} width={130} height={130} fill="#bde0fe" {...st} />
        <line x1={x + 65} y1={720} x2={x + 65} y2={850} {...st} />
      </g>
    ))}
    <rect x={930} y={1050} width={20} height={230} fill="#6f4518" {...st} />
    <rect x={880} y={990} width={120} height={70} rx={20} fill="#3a86ff" {...st} />
    <text x={940} y={1038} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={34} fill="#ffffff">
      {name}
    </text>
  </g>
);

export const CarInterior: React.FC = () => (
  <g>
    <path d="M 260,840 L 820,840 L 920,1260 L 160,1260 Z" fill="#22223b" />
    <rect x={260} y={930} width={240} height={330} rx={60} fill="#3d405b" {...st} />
    <rect x={580} y={930} width={240} height={330} rx={60} fill="#3d405b" {...st} />
  </g>
);

export const CarFront: React.FC<{ gps: string; gpsColor?: string }> = ({ gps, gpsColor = '#2dc653' }) => (
  <g>
    {/* steering wheel (driver = viewer's right) */}
    <ellipse cx={712} cy={1212} rx={118} ry={40} fill="none" stroke="#1b1b1b" strokeWidth={22} />
    <rect x={700} y={1218} width={24} height={50} fill="#1b1b1b" />
    {/* dashboard + GPS phone */}
    <rect x={165} y={1236} width={750} height={40} fill="#2b2d42" />
    <g transform={`translate(${GPS_PHONE[0]},${GPS_PHONE[1]})`}>
      <rect x={-12} y={20} width={24} height={20} fill="#1b1b1b" />
      <rect x={-72} y={-42} width={144} height={66} rx={10} fill="#111" stroke={INK} strokeWidth={5} />
      <rect x={-64} y={-35} width={128} height={52} rx={6} fill="#0b132b" />
      <text x={0} y={-2} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={gps.length > 12 ? 13 : 17} fill={gpsColor}>
        {gps}
      </text>
    </g>
    {/* glass + glare */}
    <path d="M 260,840 L 820,840 L 920,1260 L 160,1260 Z" fill="#cfe8ff" opacity={0.14} />
    <path d="M 300,860 L 380,860 L 250,1240 L 190,1240 Z" fill="#ffffff" opacity={0.18} />
    {/* roof + pillars + frame */}
    <path d="M 230,850 Q 260,740 360,730 L 720,730 Q 820,740 850,850 Z" fill={CAR} {...st} />
    <path d="M 260,840 L 820,840 L 920,1260 L 160,1260 Z" fill="none" stroke={CAR} strokeWidth={30} strokeLinejoin="round" />
    <path d="M 245,825 L 835,825 L 940,1272 L 140,1272 Z" fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M 275,855 L 805,855 L 900,1248 L 180,1248 Z" fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    {/* mirrors */}
    <ellipse cx={110} cy={1110} rx={50} ry={36} fill={CAR} {...st} />
    <ellipse cx={970} cy={1110} rx={50} ry={36} fill={CAR} {...st} />
    {/* hood, grille, lights, bumper, wheels */}
    <path d="M 140,1272 L 940,1272 L 1000,1480 L 80,1480 Z" fill={CAR} {...st} />
    <path d="M 540,1290 L 540,1470" stroke={CAR_DARK} strokeWidth={8} />
    <rect x={70} y={1480} width={940} height={130} rx={24} fill={CAR_DARK} {...st} />
    <rect x={380} y={1500} width={320} height={70} rx={14} fill="#2b2d42" {...st} />
    {[400, 440, 480, 520, 560, 600, 640, 680].map((x) => (
      <line key={x} x1={x} y1={1505} x2={x} y2={1565} stroke="#5c677d" strokeWidth={5} />
    ))}
    <circle cx={200} cy={1540} r={46} fill="#fff3b0" {...st} />
    <circle cx={880} cy={1540} r={46} fill="#fff3b0" {...st} />
    <rect x={60} y={1600} width={960} height={50} rx={20} fill="#adb5bd" {...st} />
    <rect x={460} y={1606} width={160} height={40} rx={6} fill="#ffffff" stroke={INK} strokeWidth={4} />
    <text x={540} y={1636} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={28} fill={INK}>
      BRO 1
    </text>
    <rect x={110} y={1650} width={140} height={80} rx={20} fill="#1b1b1b" {...st} />
    <rect x={830} y={1650} width={140} height={80} rx={20} fill="#1b1b1b" {...st} />
  </g>
);

// top-down city map; the route leaves HOME, circles the GAS block `loops` times, comes home.
// p 0..1 = how much of the route is drawn (the car dot rides its head)
export const CityMap: React.FC<{ p: number; loops?: number }> = ({ p, loops = 6 }) => {
  const pts: [number, number][] = [[540, 1480], [540, 1210]];
  // each lap a little wider than the last, so the rings visibly pile up
  for (let i = 0; i < loops; i++) {
    const d = i * 26;
    pts.push([540 - d, 940 - d], [810 + d, 940 - d], [810 + d, 1210 + d], [540 - d, 1210 + d]);
  }
  pts.push([540, 1480]);
  const seg = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let left = Math.max(0, Math.min(1, p)) * total;
  const drawn: [number, number][] = [pts[0]];
  for (let i = 0; i < seg.length && left > 0; i++) {
    const k = Math.min(1, left / seg[i]);
    const a = pts[i];
    const b = pts[i + 1];
    drawn.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
    left -= seg[i];
  }
  const head = drawn[drawn.length - 1];
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1920} fill="#f1f3f5" />
      {[0, 270, 540, 810].map((x) =>
        [400, 670, 940, 1210, 1480].map((y) => (
          <rect key={`${x}-${y}`} x={x + 28} y={y + 28} width={214} height={214} rx={18} fill={(x + y) % 540 === 0 ? '#b7e4c7' : '#dee2e6'} />
        )),
      )}
      <polyline points={drawn.map((q) => q.join(',')).join(' ')} fill="none" stroke="#e63946" strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" opacity={0.85} />
      {/* GAS — on the loop's right edge, passed every lap */}
      <g transform="translate(860,1075)">
        <rect x={-34} y={-40} width={68} height={80} rx={10} fill="#ffbe0b" {...st} />
        <text x={0} y={10} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={24} fill={INK}>
          GAS
        </text>
      </g>
      {/* MALL — never reached */}
      <g transform="translate(810,400)">
        <path d="M 0,0 C -40,-50 -40,-100 0,-100 C 40,-100 40,-50 0,0 Z" fill="#e63946" {...st} />
        <circle cx={0} cy={-64} r={14} fill="#ffffff" />
        <text x={0} y={46} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill={INK}>
          MALL
        </text>
      </g>
      {/* HOME */}
      <g transform="translate(540,1480)">
        <path d="M -44,10 L 0,-34 L 44,10 L 44,48 L -44,48 Z" fill="#2dc653" {...st} />
        <text x={0} y={100} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill={INK}>
          HOME
        </text>
      </g>
      <circle cx={head[0]} cy={head[1]} r={24} fill="#ffbe0b" stroke={INK} strokeWidth={6} />
      {/* lap counter: segments drawn after the first two, four per lap */}
      {drawn.length > 3 && (
        <text x={540} y={1760} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={96} fill="#e63946" stroke={INK} strokeWidth={6} paintOrder="stroke">
          LAP {Math.min(loops, Math.ceil((drawn.length - 2) / 4))}
        </text>
      )}
    </g>
  );
};
