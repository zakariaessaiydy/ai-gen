// KIDS KIT — <Critter>: one parametric chibi ANIMAL rig (bear, bunny, cat, fox, lion, mouse,
// panda, pig, owl, frog). Same face/expressions as <Kid> (face.tsx), so animals and kids act in
// the same language. Origin = between the feet; ~620px tall at scale 1 (a buddy, smaller than a kid).
import React from 'react';
import { Belt, Cape, ChestBadge, Mask, type HeroLook } from './hero';
import { useCurrentFrame } from 'remotion';
import { Face, HeadSparkles, KINK, idleMotion, kst, type KExpr } from './face';

export type Species = 'bear' | 'bunny' | 'cat' | 'fox' | 'lion' | 'mouse' | 'panda' | 'pig' | 'owl' | 'frog' | 'monkey' | 'dog' | 'elephant' | 'turtle';

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
  hero?: HeroLook; // original superhero outfit — see hero.tsx
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
  idle?: boolean; // auto idle behaviour (sway, head tilt, talk nod, laugh bounce, ear perk) — default on
  tuck?: number; // 0..1 — pull the head (and paws) in, like a turtle hiding in its shell
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
    case 'elephant':
      return (
        <g>
          {[-1, 1].map((k) => (
            <g key={k}>
              <ellipse cx={k * 190} cy={-10} rx={120} ry={150} fill={s.fur} {...st} />
              <ellipse cx={k * 196} cy={-6} rx={78} ry={108} fill={s.fur2} />
            </g>
          ))}
        </g>
      );
    case 'dog':
      return (
        <g>
          {[-1, 1].map((k) => (
            <path key={k} d={`M ${k * 120},-120 Q ${k * 230},-120 ${k * 210},60 Q ${k * 190},120 ${k * 150},70 Q ${k * 130},-20 ${k * 100},-90 Z`} fill={s.dark} {...st} />
          ))}
        </g>
      );
    case 'monkey':
      return (
        <g>
          {[-1, 1].map((k) => (
            <g key={k}>
              <circle cx={k * 176} cy={-6} r={58} fill={s.fur} {...st} />
              <circle cx={k * 176} cy={-6} r={32} fill={s.fur2} />
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

const Tail: React.FC<{ s: CritterSpec; frame: number; happy?: boolean }> = ({ s, frame, happy }) => {
  const st = kst();
  const wag = happy ? Math.sin(frame / 2.6) * 14 : Math.sin(frame / 6) * 8; // happy animals wag fast
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
    case 'elephant':
      return (
        <g>
          <path d={`M 110,-120 Q 180,-110 ${190 + wag},${-30 + wag * 0.5}`} fill="none" stroke={KINK} strokeWidth={18} strokeLinecap="round" />
          <circle cx={190 + wag} cy={-24 + wag * 0.5} r={16} fill={s.dark} {...st} />
        </g>
      );
    case 'dog':
      return <path d={`M 100,-100 Q 200,-120 ${210 + wag * 2},${-220 + wag}`} fill="none" stroke={s.fur} strokeWidth={34} strokeLinecap="round" />;
    case 'monkey':
      return <path d={`M 100,-80 Q 260,-40 250,${-200 + wag} Q 240,-300 170,${-290 + wag} Q 120,-270 150,${-230 + wag}`} fill="none" stroke={s.dark} strokeWidth={22} strokeLinecap="round" />;
    case 'pig':
      return <path d="M 110,-110 q 40,-10 30,-40 q -10,-30 -30,-10 q -10,30 30,20" fill="none" stroke={KINK} strokeWidth={14} strokeLinecap="round" />;
    case 'turtle':
      return <path d={`M 120,-70 L ${176 + wag},${-50 + wag * 0.3} L 124,-34 Z`} fill={s.fur} {...st} />;
    default:
      return null;
  }
};

export const Critter: React.FC<CritterProps> = ({
  spec, x, y, scale = 1, expr = 'smile', look = [0, 0], mouth = 0, armL = 'down', armR = 'down', holdL, holdR,
  walk = 0, walking = false, hop = 0, tilt = 0, squash = 0, facing = 1, shadow = true, blink = true, idle = true, tuck = 0,
}) => {
  const frame = useCurrentFrame();
  const s = spec;
  const hh = hashStr(s.id);
  const breath = Math.sin((frame + hh) / 12);
  const closed = blink && (frame + hh * 5) % 100 < 4;
  const im = idle ? idleMotion(frame, hh, expr, mouth, walking || hop > 0) : { sway: 0, tilt: 0, nod: 0, bounce: 0 };
  // ear perk: a quick twitch every ~3.5 s
  const ec = (frame + hh * 11) % 105;
  const perk = idle && ec < 8 ? Math.sin((ec / 8) * Math.PI) : 0;
  const happy = expr === 'happy' || expr === 'laugh' || expr === 'proud';
  const step = walking ? Math.sin(walk * Math.PI * 2) : 0;
  const waddle = walking ? step * 6 : 0;
  const bob = walking ? -Math.abs(step) * 12 : 0;
  const st = kst();
  const owl = s.species === 'owl';
  const frog = s.species === 'frog';
  const turtle = s.species === 'turtle';

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
    if (s.species === 'monkey')
      return (
        <g fill={s.fur2}>
          <ellipse cx={-58} cy={-18} rx={72} ry={80} />
          <ellipse cx={58} cy={-18} rx={72} ry={80} />
          <ellipse cx={0} cy={58} rx={118} ry={76} />
        </g>
      );
    if (owl)
      return (
        <g>
          <ellipse cx={-64} cy={6} rx={84} ry={88} fill={s.fur2} />
          <ellipse cx={64} cy={6} rx={84} ry={88} fill={s.fur2} />
        </g>
      );
    if (frog) return null;
    if (s.species === 'pig' || s.species === 'elephant' || s.species === 'turtle') return null;
    const w = s.species === 'fox' ? 150 : s.species === 'mouse' || s.species === 'cat' ? 92 : 104;
    return <ellipse cx={0} cy={64} rx={w} ry={70} fill={s.fur2} />;
  };

  const nose = () => {
    switch (s.species) {
      case 'owl':
        return <path d="M -20,34 L 20,34 L 0,70 Z" fill="#ffb703" {...kst(6)} />;
      case 'elephant':
        return (
          <g>
            <path d="M -38,-30 Q -46,90 -30,150 Q -20,200 20,214 Q 52,222 60,196 Q 30,190 22,160 Q 14,110 38,-30 Z" fill={s.fur} />
            <path d="M -38,-10 Q -46,90 -30,150 Q -20,200 20,214 Q 52,222 60,196 Q 30,190 22,160 Q 14,110 38,-10" fill="none" {...kst(8)} />
            {[60, 100, 140].map((y) => <path key={y} d={`M ${-36 + (y - 60) * 0.06},${y} Q ${-4},${y + 8} ${26 - (y - 60) * 0.05},${y}`} fill="none" {...kst(4)} />)}
          </g>
        );
      case 'turtle':
        return (
          <g fill={KINK}>
            <ellipse cx={-12} cy={36} rx={5} ry={4} />
            <ellipse cx={12} cy={36} rx={5} ry={4} />
          </g>
        );
      case 'dog':
        return (
          <g>
            <ellipse cx={0} cy={30} rx={38} ry={26} fill={KINK} />
            <ellipse cx={-10} cy={22} rx={10} ry={6} fill="#ffffff" opacity={0.5} />
          </g>
        );
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
    <g transform={`translate(0,${HEAD_Y + breath * 2 + im.nod + tuck * 210}) rotate(${tilt + im.tilt} 0 120)`}>
      {s.species === 'lion' && (
        <g>
          {Array.from({ length: 14 }).map((_, i) => {
            const a = (i / 14) * Math.PI * 2;
            return <circle key={i} cx={Math.cos(a) * 170} cy={Math.sin(a) * 160} r={62} fill={s.dark} {...st} />;
          })}
        </g>
      )}
      <g transform={`translate(0,-100) scale(${1 + perk * 0.03},${1 + perk * 0.07}) translate(0,100)`}>
        <Ears s={s} layer="back" />
      </g>
      <ellipse cx={0} cy={0} rx={frog ? 190 : 172} ry={frog ? 140 : 160} fill={s.fur} {...kst(9)} />
      {/* soft fur shine */}
      <ellipse cx={-92} cy={-92} rx={40} ry={20} fill="#ffffff" opacity={0.3} transform="rotate(-32 -92 -92)" />
      {s.species === 'panda' && (
        <g fill={s.dark}>
          <ellipse cx={-66} cy={4} rx={56} ry={66} transform="rotate(20 -66 4)" />
          <ellipse cx={66} cy={4} rx={56} ry={66} transform="rotate(-20 66 4)" />
        </g>
      )}
      {muzzle()}
      <Ears s={s} layer="front" />
      {s.hero?.mask && <Mask color={s.hero.mask} y={-8} dx={64} r={40} />}
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
          mouthW={frog ? 80 : s.species === 'elephant' ? 74 : 40}
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
      <HeadSparkles frame={frame} r={172} on={expr === 'wow' || expr === 'proud'} />
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
      <g transform={`translate(0,${-hop + bob - im.bounce}) rotate(${waddle + im.sway} 0 0) scale(${1 + squash * 0.08},${1 - squash * 0.14})`}>
        {s.hero && <Cape look={s.hero} frame={frame} top={-290} bottom={-40} half={170} lift={hop} />}
        <Tail s={s} frame={frame} happy={happy} />
        {/* feet */}
        {[-1, 1].map((k) => (
          <ellipse key={k} cx={k * 62} cy={-24 - (walking ? Math.max(0, k * step) * 26 : 0)} rx={58} ry={34} fill={owl || frog ? '#ffb703' : s.species === 'panda' ? s.dark : s.fur} {...st} />
        ))}
        {tuck < 0.5 && !front(armL) && arm(armL, -1, holdL)}
        {tuck < 0.5 && !front(armR) && arm(armR, 1, holdR)}
        {turtle && tuck > 0.02 && headEl}
        {/* body */}
        {turtle ? (
          <g>
            {/* shell: a dome with scutes around the edge, the yellow plastron in front */}
            <ellipse cx={0} cy={-170} rx={162} ry={158} fill={s.dark} {...kst(9)} />
            {[-150, -110, -60, 60, 110, 150].map((a) => {
              const r = (a * Math.PI) / 180;
              return <path key={a} d={`M ${Math.sin(r) * 112},${-170 - Math.cos(r) * 112} L ${Math.sin(r) * 160},${-170 - Math.cos(r) * 156}`} stroke={KINK} strokeWidth={5} opacity={0.45} />;
            })}
            <ellipse cx={0} cy={-170} rx={140} ry={136} fill="none" stroke="#ffffff" strokeWidth={6} opacity={0.18} />
            <ellipse cx={0} cy={-150} rx={104} ry={122} fill={s.fur2} {...kst(7)} />
            {[-210, -160, -110].map((y) => <path key={y} d={`M ${-92 + Math.abs(y + 150) * 0.12},${y} Q 0,${y + 8} ${92 - Math.abs(y + 150) * 0.12},${y}`} fill="none" stroke={KINK} strokeWidth={5} opacity={0.4} />)}
            <line x1={0} y1={-262} x2={0} y2={-34} stroke={KINK} strokeWidth={5} opacity={0.3} />
            <ellipse cx={-62} cy={-262} rx={34} ry={14} fill="#ffffff" opacity={0.3} transform="rotate(-30 -62 -262)" />
          </g>
        ) : (
          <g>
            <ellipse cx={0} cy={-160} rx={130} ry={140} fill={s.fur} {...kst(9)} />
            <ellipse cx={0} cy={-140} rx={84} ry={96} fill={s.fur2} />
          </g>
        )}
        <ellipse cx={-70} cy={-232} rx={30} ry={14} fill="#ffffff" opacity={0.25} transform="rotate(-30 -70 -232)" />
        {s.hero && (
          <g>
            {s.hero.belt && <Belt color={s.hero.belt} y={-70} half={118} />}
            <ChestBadge look={s.hero} y={-170} r={46} />
          </g>
        )}
        {s.scarf && (
          <g>
            <path d="M -110,-280 Q 0,-240 110,-280 L 116,-246 Q 0,-200 -116,-246 Z" fill={s.scarf} {...kst(7)} />
            <path d="M 40,-240 L 70,-150 L 30,-160 L 16,-236 Z" fill={s.scarf} {...kst(7)} />
          </g>
        )}
        {tuck < 0.5 && front(armL) && arm(armL, -1, holdL)}
        {tuck < 0.5 && front(armR) && arm(armR, 1, holdR)}
        {!(turtle && tuck > 0.02) && headEl}
      </g>
    </g>
  );
};

export const critterFaceAt = (x: number, y: number, scale = 1): [number, number] => [x, y + HEAD_Y * scale];
