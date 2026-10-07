// KIDS KIT — <Critter>: one parametric chibi ANIMAL rig (bear, bunny, cat, fox, lion, mouse,
// panda, pig, owl, frog). Same face/expressions as <Kid> (face.tsx), so animals and kids act in
// the same language. Origin = between the feet; ~620px tall at scale 1 (a buddy, smaller than a kid).
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Face, KINK, kst, type KExpr } from './face';

export type Species = 'bear' | 'bunny' | 'cat' | 'fox' | 'lion' | 'mouse' | 'panda' | 'pig' | 'owl' | 'frog';

export type CritterSpec = {
  id: string;
  species: Species;
  fur: string;
  fur2: string; // belly / muzzle / inner ears
  dark: string; // patches, brows, mane, nose
  iris?: string;
  scarf?: string;
  bow?: string;
  glasses?: boolean;
  hat?: 'none' | 'grad' | 'party' | 'crown';
};

export type CArm = 'down' | 'wave' | 'up' | 'hold' | 'point' | 'hug' | 'clap' | 'think' | { a: number };

export type CritterProps = {
  spec: CritterSpec;
  x: number;
  y: number;
  scale?: number;
  expr?: KExpr;
  look?: [number, number];
  mouth?: number;
  armL?: CArm;
  armR?: CArm;
  holdL?: React.ReactNode;
  holdR?: React.ReactNode;
  walk?: number; // walk phase (cycles) — waddle
  walking?: boolean;
  hop?: number;
  tilt?: number;
  squash?: number;
  facing?: 1 | -1; // -1 mirrors the whole animal (tail side swaps)
  shadow?: boolean;
  blink?: boolean;
};

const HEAD_Y = -420;
const SH: [number, number] = [96, -250];

const hashStr = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
  return h;
};

const armAngle = (p: CArm, frame: number): number => {
  if (typeof p === 'object') return p.a;
  switch (p) {
    case 'wave':
      return 140 + Math.sin(frame / 3.2) * 22;
    case 'up':
      return 165;
    case 'hold':
      return -40;
    case 'point':
      return 96;
    case 'hug':
      return -62;
    case 'clap':
      return -40 - ((Math.sin(frame / 2.4) + 1) / 2) * 30;
    case 'think':
      return -150;
    default:
      return 14;
  }
};

const Ears: React.FC<{ s: CritterSpec; layer: 'back' | 'front' }> = ({ s, layer }) => {
  const st = kst();
  if (layer === 'front') {
    if (s.species === 'pig')
      return (
        <g>
          {[-1, 1].map((k) => (
            <path key={k} d={`M ${k * 90},-130 L ${k * 160},-150 L ${k * 140},-70 Z`} fill={s.fur} {...st} />
          ))}
        </g>
      );
    return null;
  }
  switch (s.species) {
    case 'bear':
    case 'panda':
    case 'lion':
      return (
        <g>
          {[-1, 1].map((k) => (
            <g key={k}>
              <circle cx={k * 118} cy={-118} r={52} fill={s.species === 'panda' ? s.dark : s.fur} {...st} />
              <circle cx={k * 118} cy={-118} r={26} fill={s.species === 'panda' ? '#55505e' : s.fur2} />
            </g>
          ))}
        </g>
      );
    case 'mouse':
      return (
        <g>
          {[-1, 1].map((k) => (
            <g key={k}>
              <circle cx={k * 140} cy={-120} r={80} fill={s.fur} {...st} />
              <circle cx={k * 140} cy={-120} r={48} fill="#ffb3c6" />
            </g>
          ))}
        </g>
      );
    case 'bunny':
      return (
        <g>
          {[-1, 1].map((k) => (
            <g key={k} transform={`rotate(${k * 10} ${k * 60} -120)`}>
              <ellipse cx={k * 60} cy={-250} rx={44} ry={130} fill={s.fur} {...st} />
              <ellipse cx={k * 60} cy={-240} rx={20} ry={96} fill="#ffb3c6" />
            </g>
          ))}
        </g>
      );
    case 'cat':
    case 'fox':
      return (
        <g>
          {[-1, 1].map((k) => (
            <g key={k}>
              <path d={`M ${k * 50},-140 L ${k * (s.species === 'fox' ? 150 : 140)},${s.species === 'fox' ? -280 : -250} L ${k * 160},-80 Z`} fill={s.fur} {...st} />
              <path d={`M ${k * 78},-138 L ${k * 136},-220 L ${k * 142},-112 Z`} fill={s.species === 'fox' ? s.dark : '#ffb3c6'} />
            </g>
          ))}
        </g>
      );
    case 'owl':
      return (
        <g>
          {[-1, 1].map((k) => (
            <path key={k} d={`M ${k * 70},-150 L ${k * 130},-230 L ${k * 150},-110 Z`} fill={s.dark} {...st} />
          ))}
        </g>
      );
    case 'frog':
      return (
        <g>
          {[-1, 1].map((k) => (
            <circle key={k} cx={k * 70} cy={-120} r={70} fill={s.fur} {...st} />
          ))}
        </g>
      );
    default:
      return null;
  }
};

const Tail: React.FC<{ s: CritterSpec; frame: number }> = ({ s, frame }) => {
  const st = kst();
  const wag = Math.sin(frame / 6) * 8;
  switch (s.species) {
    case 'bunny':
    case 'bear':
    case 'panda':
      return <circle cx={118} cy={-110} r={s.species === 'bunny' ? 42 : 30} fill={s.species === 'bunny' ? '#ffffff' : s.species === 'panda' ? s.dark : s.fur} {...st} />;
    case 'cat':
    case 'mouse':
      return <path d={`M 100,-90 Q 220,-80 210,${-200 + wag} Q 200,-280 250,${-300 + wag}`} fill="none" stroke={KINK} strokeWidth={s.species === 'mouse' ? 22 : 40} strokeLinecap="round" />;
    case 'fox':
      return (
        <g transform={`rotate(${wag} 100 -100)`}>
          <path d="M 90,-80 Q 260,-60 280,-230 Q 220,-170 150,-170 Q 100,-150 90,-80 Z" fill={s.fur} {...st} />
          <path d="M 280,-230 Q 250,-190 220,-182 Q 250,-150 270,-196 Z" fill="#ffffff" />
        </g>
      );
    case 'lion':
      return (
        <g>
          <path d={`M 100,-90 Q 230,-60 230,${-180 + wag}`} fill="none" stroke={KINK} strokeWidth={22} strokeLinecap="round" />
          <circle cx={230} cy={-190 + wag} r={30} fill={s.dark} {...st} />
        </g>
      );
    case 'pig':
      return <path d="M 110,-110 q 40,-10 30,-40 q -10,-30 -30,-10 q -10,30 30,20" fill="none" stroke={KINK} strokeWidth={14} strokeLinecap="round" />;
    default:
      return null;
  }
};

export const Critter: React.FC<CritterProps> = ({
  spec, x, y, scale = 1, expr = 'smile', look = [0, 0], mouth = 0, armL = 'down', armR = 'down', holdL, holdR,
  walk = 0, walking = false, hop = 0, tilt = 0, squash = 0, facing = 1, shadow = true, blink = true,
}) => {
  const frame = useCurrentFrame();
  const s = spec;
  const hh = hashStr(s.id);
  const breath = Math.sin((frame + hh) / 12);
  const closed = blink && (frame + hh * 5) % 100 < 4;
  const step = walking ? Math.sin(walk * Math.PI * 2) : 0;
  const waddle = walking ? step * 6 : 0;
  const bob = walking ? -Math.abs(step) * 12 : 0;
  const st = kst();
  const owl = s.species === 'owl';
  const frog = s.species === 'frog';

  const arm = (p: CArm, side: -1 | 1, hold?: React.ReactNode) => {
    const a = armAngle(p, frame) * -side; // outward-positive, mirrored for the right arm
    return (
      <g key={side} transform={`translate(${side * SH[0]},${SH[1]}) rotate(${a})`}>
        {owl ? (
          <path d="M -30,0 Q -10,140 0,150 Q 26,130 30,0 Z" fill={s.dark} {...st} />
        ) : (
          <g>
            <line x1={0} y1={0} x2={0} y2={120} stroke={KINK} strokeWidth={60} strokeLinecap="round" />
            <line x1={0} y1={0} x2={0} y2={120} stroke={s.species === 'panda' ? s.dark : s.fur} strokeWidth={46} strokeLinecap="round" />
          </g>
        )}
        {hold && <g transform={`translate(0,140) rotate(${-a})`}>{hold}</g>}
      </g>
    );
  };
  const front = (p: CArm) => p === 'hold' || p === 'hug' || p === 'clap';

  const muzzle = () => {
    if (owl)
      return (
        <g>
          <ellipse cx={-64} cy={6} rx={84} ry={88} fill={s.fur2} />
          <ellipse cx={64} cy={6} rx={84} ry={88} fill={s.fur2} />
        </g>
      );
    if (frog) return null;
    if (s.species === 'pig') return null;
    const w = s.species === 'fox' ? 150 : s.species === 'mouse' || s.species === 'cat' ? 92 : 104;
    return <ellipse cx={0} cy={64} rx={w} ry={70} fill={s.fur2} />;
  };

  const nose = () => {
    switch (s.species) {
      case 'owl':
        return <path d="M -20,34 L 20,34 L 0,70 Z" fill="#ffb703" {...kst(6)} />;
      case 'pig':
        return (
          <g>
            <ellipse cx={0} cy={44} rx={50} ry={34} fill="#ffb3c6" {...kst(7)} />
            <ellipse cx={-16} cy={44} rx={8} ry={12} fill={KINK} />
            <ellipse cx={16} cy={44} rx={8} ry={12} fill={KINK} />
          </g>
        );
      case 'frog':
        return <g />;
      case 'cat':
      case 'mouse':
      case 'bunny':
        return (
          <g>
            <path d="M -16,30 L 16,30 L 0,46 Z" fill="#ff8fab" {...kst(6)} />
            {s.species !== 'bunny' && (
              <g {...kst(4)}>
                {[-1, 1].map((k) => [0, 1].map((i) => <line key={`${k}${i}`} x1={k * 70} y1={48 + i * 16} x2={k * 150} y2={36 + i * 30} />))}
              </g>
            )}
          </g>
        );
      default:
        return <ellipse cx={0} cy={34} rx={24} ry={16} fill={s.dark === s.fur ? KINK : KINK} {...kst(5)} />;
    }
  };

  const headEl = (
    <g transform={`translate(0,${HEAD_Y + breath * 2}) rotate(${tilt} 0 120)`}>
      {s.species === 'lion' && (
        <g>
          {Array.from({ length: 14 }).map((_, i) => {
            const a = (i / 14) * Math.PI * 2;
            return <circle key={i} cx={Math.cos(a) * 170} cy={Math.sin(a) * 160} r={62} fill={s.dark} {...st} />;
          })}
        </g>
      )}
      <Ears s={s} layer="back" />
      <ellipse cx={0} cy={0} rx={frog ? 190 : 172} ry={frog ? 140 : 160} fill={s.fur} {...kst(9)} />
      {s.species === 'panda' && (
        <g fill={s.dark}>
          <ellipse cx={-66} cy={4} rx={56} ry={66} transform="rotate(20 -66 4)" />
          <ellipse cx={66} cy={4} rx={56} ry={66} transform="rotate(-20 66 4)" />
        </g>
      )}
      {muzzle()}
      <Ears s={s} layer="front" />
      <g transform={`translate(0,${frog ? -110 : 0})`}>
        <Face
          expr={expr}
          look={look}
          mouth={frog ? 0 : mouth}
          blink={closed}
          skin={s.fur}
          iris={s.iris ?? '#4a2c1a'}
          eyeR={frog ? 44 : 40}
          eyeDX={frog ? 70 : 64}
          eyeY={-8}
          mouthY={frog ? 220 : 78}
          mouthW={frog ? 80 : 40}
          cheeks
          brows={owl || frog ? false : s.dark}
          nose={nose()}
        />
      </g>
      {frog && <path d={`M -110,60 Q 0,${100 + mouth * 60} 110,60`} fill={mouth > 0.1 ? '#7a2d4a' : 'none'} {...kst(8)} />}
      {s.glasses && (
        <g fill="rgba(255,255,255,0.2)" {...kst(8)}>
          <circle cx={-64} cy={-8} r={54} />
          <circle cx={64} cy={-8} r={54} />
          <path d="M -10,-12 Q 0,-20 10,-12" fill="none" />
        </g>
      )}
      {s.hat === 'grad' && (
        <g transform="translate(0,-150)">
          <path d="M -60,0 L 60,0 L 54,-50 L -54,-50 Z" fill="#2b2d42" {...st} />
          <path d="M -150,-50 L 0,-100 L 150,-50 L 0,-10 Z" fill="#2b2d42" {...st} />
          <path d="M 100,-55 Q 130,-30 124,20" fill="none" stroke="#ffd166" strokeWidth={8} />
        </g>
      )}
      {s.hat === 'party' && <path d="M -60,-130 L 0,-290 L 60,-130 Z" fill="#ff006e" {...st} />}
      {s.hat === 'crown' && <path d="M -80,-130 L -80,-210 L -40,-170 L 0,-230 L 40,-170 L 80,-210 L 80,-130 Z" fill="#ffd166" {...st} />}
      {s.bow && (
        <g transform="translate(-100,-130) rotate(-20)">
          <path d="M 0,0 L -50,-30 Q -62,0 -50,30 Z" fill={s.bow} {...kst(7)} />
          <path d="M 0,0 L 50,-30 Q 62,0 50,30 Z" fill={s.bow} {...kst(7)} />
          <circle r={14} fill={s.bow} {...kst(7)} />
        </g>
      )}
    </g>
  );

  return (
    <g transform={`translate(${x},${y}) scale(${scale * facing},${scale})`}>
      {shadow && <ellipse cx={0} cy={6} rx={140 * (1 - Math.min(0.5, hop / 600))} ry={20} fill="rgba(40,20,60,0.16)" />}
      <g transform={`translate(0,${-hop + bob}) rotate(${waddle} 0 0) scale(${1 + squash * 0.08},${1 - squash * 0.14})`}>
        <Tail s={s} frame={frame} />
        {/* feet */}
        {[-1, 1].map((k) => (
          <ellipse key={k} cx={k * 62} cy={-24 - (walking ? Math.max(0, k * step) * 26 : 0)} rx={58} ry={34} fill={owl || frog ? '#ffb703' : s.species === 'panda' ? s.dark : s.fur} {...st} />
        ))}
        {!front(armL) && arm(armL, -1, holdL)}
        {!front(armR) && arm(armR, 1, holdR)}
        {/* body */}
        <ellipse cx={0} cy={-160} rx={130} ry={140} fill={s.fur} {...kst(9)} />
        <ellipse cx={0} cy={-140} rx={84} ry={96} fill={s.fur2} />
        {s.scarf && (
          <g>
            <path d="M -110,-280 Q 0,-240 110,-280 L 116,-246 Q 0,-200 -116,-246 Z" fill={s.scarf} {...kst(7)} />
            <path d="M 40,-240 L 70,-150 L 30,-160 L 16,-236 Z" fill={s.scarf} {...kst(7)} />
          </g>
        )}
        {front(armL) && arm(armL, -1, holdL)}
        {front(armR) && arm(armR, 1, holdR)}
        {headEl}
      </g>
    </g>
  );
};

export const critterFaceAt = (x: number, y: number, scale = 1): [number, number] => [x, y + HEAD_Y * scale];
