// KIDS KIT — <Kid>: the chibi child rig every kids-channel human is drawn with. Big head (~45% of
// the height), stubby body, glossy eyes, rosy cheeks, soft plum outline, rounded everything.
// Origin = between the feet (stage px); ~760px tall at scale 1. Separate from the Bro toon rig
// on purpose: a kids channel needs its own, softer silhouette.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Face, KINK, kst, type KExpr } from './face';
import { Belt, Cape, ChestBadge, Mask, type HeroLook } from './hero';

export type KidSpec = {
  id: string;
  skin: string;
  hair: 'puffs' | 'curly' | 'short' | 'ponytail' | 'bob' | 'spiky';
  hairColor: string;
  top: 'tee' | 'dress' | 'overalls' | 'stripes';
  topColor: string;
  topColor2?: string; // stripes / overall bib / dress trim
  pants: string;
  shoes: string;
  iris?: string;
  bow?: string; // hair bow colour
  glasses?: boolean;
  freckles?: boolean;
  lashes?: boolean;
  hero?: HeroLook; // original superhero outfit (cape / mask / emblem / belt) — see hero.tsx
};

// arm pose: preset, (upper, fore) degrees outward-positive (screen-left arm; right mirrors),
// or an IK target {to:[dx,dy]} relative to the shoulder in the screen-left arm's frame
// (negative dx = outward; for armR that means screen RIGHT).
export type KArm =
  | 'down' | 'wave' | 'up' | 'point' | 'hip' | 'hold' | 'clap' | 'think' | 'count' | 'present' | 'hug' | 'shrug'
  | { a: number; b: number }
  | { to: [number, number] };

export type KidProps = {
  spec: KidSpec;
  x: number;
  y: number;
  scale?: number;
  expr?: KExpr;
  look?: [number, number];
  mouth?: number;
  armL?: KArm;
  armR?: KArm;
  fingersL?: number; // 1..5 raised fingers (counting); 0 = mitten
  fingersR?: number;
  holdL?: React.ReactNode; // drawn at the hand, upright
  holdR?: React.ReactNode;
  legs?: 'stand' | 'walk' | 'sit';
  walk?: number; // walk phase in cycles (pass t * 2)
  hop?: number; // px off the ground (jumps) — the shadow stays down
  tilt?: number;
  lean?: number;
  squash?: number;
  shadow?: boolean;
  blink?: boolean;
};

const U = 100; // upper arm
const F = 92; // forearm
const SH_Y = -372; // shoulder height
const SH_X = 74;
const HEAD_Y = -560;
const deg = Math.PI / 180;

const hashStr = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
  return h;
};

const ik = (dx: number, dy: number): [number, number] => {
  const D = Math.min(Math.hypot(dx, dy), U + F - 1);
  const phi = Math.atan2(-dx, dy);
  const alpha = Math.acos(Math.max(-1, Math.min(1, (U * U + D * D - F * F) / (2 * U * D))));
  const solve = (a1: number) => {
    const ex = -U * Math.sin(a1);
    const ey = U * Math.cos(a1);
    const a2 = Math.atan2(-(dx - ex), dy - ey) - a1;
    return { a1, a2, ey };
  };
  const p = solve(phi + alpha);
  const q = solve(phi - alpha);
  const best = p.ey > q.ey ? p : q;
  return [best.a1 / deg, best.a2 / deg];
};

const armAngles = (pose: KArm, frame: number): [number, number] => {
  if (typeof pose === 'object') return 'to' in pose ? ik(pose.to[0], pose.to[1]) : [pose.a, pose.b];
  switch (pose) {
    case 'wave':
      return [138, 28 + Math.sin(frame / 3.2) * 26];
    case 'up':
      return [160, 12];
    case 'point':
      return [96, 0];
    case 'hip':
      return [44, -112];
    case 'hold':
      return [18, -104];
    case 'clap': {
      const open = (Math.sin(frame / 2.4) + 1) / 2; // claps ~2x a second
      return ik(60 - open * 40, 60);
    }
    case 'think':
      return ik(62, -120);
    case 'count':
      return [122, 34];
    case 'present':
      return [70, -36];
    case 'hug':
      return [-8, -98];
    case 'shrug':
      return [52, 96];
    default:
      return [12, 6];
  }
};

// a mitten hand, or a hand showing N raised fingers (always drawn upright in world space)
const Hand: React.FC<{ skin: string; fingers: number; rot: number }> = ({ skin, fingers, rot }) => (
  <g transform={`rotate(${-rot})`}>
    {fingers > 0 &&
      Array.from({ length: Math.min(5, fingers) }).map((_, i) => {
        const n = Math.min(5, fingers);
        const a = (i - (n - 1) / 2) * 20;
        return <rect key={i} x={-9} y={-70} width={18} height={50} rx={9} fill={skin} {...kst(6)} transform={`rotate(${a})`} />;
      })}
    <circle cx={0} cy={0} r={28} fill={skin} {...kst(7)} />
  </g>
);

const Arm: React.FC<{ spec: KidSpec; pose: KArm; mirror: boolean; frame: number; fingers: number; hold?: React.ReactNode }> = ({ spec, pose, mirror, frame, fingers, hold }) => {
  const [a1, a2] = armAngles(pose, frame);
  const sleeve = spec.top === 'dress' || spec.top === 'overalls' || spec.top === 'stripes' ? spec.topColor : spec.topColor;
  const showFingers = fingers || (pose === 'count' ? 0 : 0);
  return (
    <g transform={`${mirror ? 'scale(-1,1) ' : ''}translate(${-SH_X},${SH_Y}) rotate(${a1})`}>
      <line x1={0} y1={0} x2={0} y2={U} stroke={KINK} strokeWidth={46} strokeLinecap="round" />
      <line x1={0} y1={0} x2={0} y2={U} stroke={spec.skin} strokeWidth={32} strokeLinecap="round" />
      <path d={`M -24,-6 L 24,-6 L 22,${U * 0.55} L -22,${U * 0.55} Z`} fill={sleeve} {...kst(7)} />
      <g transform={`translate(0,${U}) rotate(${a2})`}>
        <line x1={0} y1={0} x2={0} y2={F} stroke={KINK} strokeWidth={44} strokeLinecap="round" />
        <line x1={0} y1={0} x2={0} y2={F} stroke={spec.skin} strokeWidth={30} strokeLinecap="round" />
        <g transform={`translate(0,${F + 6})${mirror ? ' scale(-1,1)' : ''}`}>
          <Hand skin={spec.skin} fingers={showFingers} rot={(mirror ? -1 : 1) * (a1 + a2)} />
          {hold && <g transform={`rotate(${-(mirror ? -1 : 1) * (a1 + a2)})`}>{hold}</g>}
        </g>
      </g>
    </g>
  );
};

const HairBack: React.FC<{ spec: KidSpec }> = ({ spec }) => {
  const c = spec.hairColor;
  switch (spec.hair) {
    case 'puffs':
      return (
        <g>
          <circle cx={-178} cy={-92} r={74} fill={c} {...kst()} />
          <circle cx={178} cy={-92} r={74} fill={c} {...kst()} />
        </g>
      );
    case 'curly':
      return (
        <g fill={c} {...kst()}>
          {[-150, -95, -35, 30, 95, 150].map((x, i) => (
            <circle key={i} cx={x} cy={-110 - Math.cos((x / 150) * 1.3) * 60} r={62} />
          ))}
          <circle cx={-172} cy={-20} r={48} />
          <circle cx={172} cy={-20} r={48} />
        </g>
      );
    case 'ponytail':
      return <path d="M 120,-120 Q 260,-100 250,40 Q 240,140 200,170 Q 200,60 150,-20 Z" fill={c} {...kst()} />;
    case 'bob':
      return <path d="M -196,-40 Q -200,-200 0,-196 Q 200,-200 196,-40 L 190,90 Q 140,110 120,80 L -120,80 Q -140,110 -190,90 Z" fill={c} {...kst()} />;
    default:
      return null;
  }
};

const HairFront: React.FC<{ spec: KidSpec }> = ({ spec }) => {
  const c = spec.hairColor;
  switch (spec.hair) {
    case 'short':
      return <path d="M -172,-30 Q -190,-178 -10,-176 Q 168,-176 176,-40 Q 120,-110 40,-104 Q -40,-150 -90,-84 Q -130,-60 -172,-30 Z" fill={c} {...kst()} />;
    case 'spiky':
      return (
        <path d="M -176,-26 L -170,-120 L -120,-110 L -100,-200 L -40,-150 L 0,-226 L 40,-150 L 100,-200 L 120,-110 L 170,-120 L 176,-26 Q 100,-96 0,-92 Q -100,-96 -176,-26 Z" fill={c} {...kst()} />
      );
    default:
      // bangs: a cap over the crown with a scalloped fringe
      return (
        <path
          d="M -174,-34 Q -176,-176 0,-172 Q 176,-176 174,-34 Q 150,-76 116,-70 Q 92,-112 58,-82 Q 30,-118 0,-84 Q -30,-118 -58,-82 Q -92,-112 -116,-70 Q -150,-76 -174,-34 Z"
          fill={c}
          {...kst()}
        />
      );
  }
};

export const Kid: React.FC<KidProps> = ({
  spec, x, y, scale = 1, expr = 'smile', look = [0, 0], mouth = 0, armL = 'down', armR = 'down', fingersL = 0, fingersR = 0,
  holdL, holdR, legs = 'stand', walk = 0, hop = 0, tilt = 0, lean = 0, squash = 0, shadow = true, blink = true,
}) => {
  const frame = useCurrentFrame();
  const h = hashStr(spec.id);
  const breath = Math.sin((frame + h) / 13);
  const cyc = (frame + h * 7) % 96;
  const closed = blink && cyc < 4;
  const step = legs === 'walk' ? Math.sin(walk * Math.PI * 2) : 0;
  const bob = legs === 'walk' ? -Math.abs(step) * 14 : 0;
  const sit = legs === 'sit' ? 118 : 0;
  const fingerL = fingersL || (armL === 'count' ? 0 : 0);
  const pantsLegs = spec.top === 'dress' ? spec.skin : spec.pants;

  const leg = (side: -1 | 1) => {
    const lift = legs === 'walk' ? Math.max(0, side * step) * 34 : 0;
    const swing = legs === 'walk' ? side * step * 14 : 0;
    if (legs === 'sit')
      return (
        <g key={side}>
          <rect x={side * 40 - 36} y={-60} width={72} height={60} rx={30} fill={pantsLegs} {...kst()} />
          <ellipse cx={side * 52} cy={-2} rx={52} ry={34} fill={spec.shoes} {...kst()} />
        </g>
      );
    return (
      <g key={side} transform={`translate(${side * 46 + swing},${-lift})`}>
        <rect x={-34} y={-176} width={68} height={150} rx={30} fill={pantsLegs} {...kst()} />
        <path d={`M ${-44 + side * 14},-4 Q ${-50 + side * 14},-62 ${side * 14},-62 Q ${50 + side * 14},-62 ${44 + side * 14},-4 Z`} fill={spec.shoes} {...kst()} />
        <path d={`M ${-40 + side * 14},-14 L ${40 + side * 14},-14`} stroke="#ffffff" strokeWidth={10} strokeLinecap="round" opacity={0.85} />
      </g>
    );
  };

  // arm layer: behind the body (default), in front of the tummy (holding, clapping, hugging) or
  // over the face (hand on chin / reaching up past the head)
  const layer = (p: KArm): 'back' | 'front' | 'head' => {
    if (p === 'think' || p === 'wave' || p === 'count' || p === 'up' || (typeof p === 'object' && 'to' in p && p.to[1] < -150)) return 'head';
    if (p === 'hold' || p === 'clap' || p === 'hug' || (typeof p === 'object' && 'to' in p && p.to[0] > 20)) return 'front';
    return 'back';
  };
  const aL = <Arm spec={spec} pose={armL} mirror={false} frame={frame} fingers={fingerL} hold={holdL} />;
  const aR = <Arm spec={spec} pose={armR} mirror frame={frame} fingers={fingersR} hold={holdR} />;

  const torso = () => {
    if (spec.top === 'dress')
      return (
        <g>
          <path d="M -80,-400 Q 0,-418 80,-400 L 150,-150 Q 0,-118 -150,-150 Z" fill={spec.topColor} {...kst()} />
          <path d="M -146,-166 Q 0,-136 146,-166 L 150,-150 Q 0,-118 -150,-150 Z" fill={spec.topColor2 ?? '#ffffff'} {...kst(6)} />
        </g>
      );
    return (
      <g>
        <path d="M -84,-402 Q 0,-418 84,-402 Q 112,-330 100,-160 Q 0,-140 -100,-160 Q -112,-330 -84,-402 Z" fill={spec.topColor} {...kst()} />
        {spec.top === 'stripes' && (
          <g clipPath={`url(#torso-${spec.id})`}>
            <clipPath id={`torso-${spec.id}`}>
              <path d="M -84,-402 Q 0,-418 84,-402 Q 112,-330 100,-160 Q 0,-140 -100,-160 Q -112,-330 -84,-402 Z" />
            </clipPath>
            {[-370, -320, -270, -220].map((yy) => (
              <rect key={yy} x={-120} y={yy} width={240} height={22} fill={spec.topColor2 ?? '#ffffff'} />
            ))}
          </g>
        )}
        {spec.hero && (
          <g>
            {spec.hero.belt && <Belt color={spec.hero.belt} y={-176} half={100} />}
            <ChestBadge look={spec.hero} y={-292} r={44} />
          </g>
        )}
        {spec.top === 'overalls' && (
          <g>
            <path d="M -62,-300 L 62,-300 L 100,-160 Q 0,-140 -100,-160 Z" fill={spec.topColor2 ?? spec.pants} {...kst()} />
            <path d="M -62,-300 L -70,-398 M 62,-300 L 70,-398" stroke={spec.topColor2 ?? spec.pants} strokeWidth={22} />
            <circle cx={-46} cy={-282} r={10} fill="#ffd166" {...kst(4)} />
            <circle cx={46} cy={-282} r={10} fill="#ffd166" {...kst(4)} />
            <rect x={-30} y={-246} width={60} height={40} rx={8} fill="none" {...kst(5)} />
          </g>
        )}
        <path d="M -40,-404 Q 0,-378 40,-404" fill="none" {...kst(7)} />
      </g>
    );
  };

  const head = (
    <g transform={`translate(0,${HEAD_Y + breath * 2}) rotate(${tilt} 0 140)`}>
      <HairBack spec={spec} />
      <ellipse cx={-176} cy={20} rx={30} ry={34} fill={spec.skin} {...kst()} />
      <ellipse cx={176} cy={20} rx={30} ry={34} fill={spec.skin} {...kst()} />
      <ellipse cx={0} cy={0} rx={178} ry={168} fill={spec.skin} {...kst(9)} />
      {spec.hero?.mask && <Mask color={spec.hero.mask} y={20} dx={68} r={42} />}
      <g transform="translate(0,26)">
        <Face expr={expr} look={look} mouth={mouth} blink={closed} skin={spec.skin} iris={spec.iris ?? '#6b4226'} eyeR={42} eyeDX={68} eyeY={-6} mouthY={66} mouthW={48} brows={spec.hairColor} lashes={spec.lashes} freckles={spec.freckles} />
      </g>
      <HairFront spec={spec} />
      {spec.glasses && (
        <g fill="none" {...kst(8)}>
          <circle cx={-68} cy={20} r={56} fill="rgba(255,255,255,0.18)" />
          <circle cx={68} cy={20} r={56} fill="rgba(255,255,255,0.18)" />
          <path d="M -12,16 Q 0,8 12,16" />
        </g>
      )}
      {spec.bow && (
        <g transform="translate(-112,-150) rotate(-18)">
          <path d="M 0,0 L -56,-34 Q -70,0 -56,34 Z" fill={spec.bow} {...kst(7)} />
          <path d="M 0,0 L 56,-34 Q 70,0 56,34 Z" fill={spec.bow} {...kst(7)} />
          <circle r={16} fill={spec.bow} {...kst(7)} />
        </g>
      )}
    </g>
  );

  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {shadow && <ellipse cx={0} cy={6} rx={150 * (1 - Math.min(0.5, hop / 600))} ry={22} fill="rgba(40,20,60,0.16)" />}
      <g transform={`translate(0,${-hop + bob}) rotate(${lean} 0 0) scale(${1 + squash * 0.08},${1 - squash * 0.14})`}>
        {spec.hero && <g transform={`translate(0,${sit})`}><Cape look={spec.hero} frame={frame} top={-400} bottom={-50} half={175} lift={hop} /></g>}
        {leg(-1)}
        {leg(1)}
        <g transform={`translate(0,${sit})`}>
          <g transform={`translate(0,-280) scale(1,${1 + breath * 0.01}) translate(0,280)`}>
            {layer(armL) === 'back' && aL}
            {layer(armR) === 'back' && aR}
            {torso()}
            {layer(armL) === 'front' && aL}
            {layer(armR) === 'front' && aR}
            {head}
            {layer(armL) === 'head' && aL}
            {layer(armR) === 'head' && aR}
          </g>
        </g>
      </g>
    </g>
  );
};

export const kidFaceAt = (x: number, y: number, scale = 1, legs: 'stand' | 'walk' | 'sit' = 'stand'): [number, number] => [
  x,
  y + (HEAD_Y + 26 + (legs === 'sit' ? 118 : 0)) * scale,
];
