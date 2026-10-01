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
export const Kitchen: React.FC<{ doorOpen?: number; beeping?: boolean; t?: number; char?: number }> = ({
  doorOpen = 0,
  beeping = false,
  t = 0,
  char = 0,
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
