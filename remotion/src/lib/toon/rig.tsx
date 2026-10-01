// Toon rig — ONE parametric 2D cartoon body that every character in every toon series is drawn
// with. A character is a ToonSpec (palette + hair/outfit/accessory choices); an episode only
// ever changes the POSE (expression, arms, legs, mouth, look). That split is what keeps a
// recurring character pixel-identical across episodes: the spec is locked in the series'
// cast file, the episode never touches it.
//
// Coordinates: character-local SVG units, origin at the FEET centre, up is -y. Standing height
// is ~930 units (head top ≈ -930). Place with x/y (feet, in stage px) and scale.
// Frame-driven only (idle breathing + blinks read useCurrentFrame) — no state, no timers.
import React from 'react';
import { useCurrentFrame } from 'remotion';

export type Expr =
  | 'neutral' | 'smug' | 'confident' | 'shock' | 'deadpan' | 'sad' | 'happy' | 'annoyed' | 'side-eye';
export type ArmPose =
  | 'down' | 'hip' | 'point' | 'point-up' | 'wave' | 'gun' | 'hold' | 'shrug' | 'cross' | 'flex'
  | 'drink' | 'facepalm' | 'thumb' | 'present'
  | { a: number; b: number } // explicit (upper, fore) degrees, outward-positive
  | { to: [number, number] }; // IK: hand target relative to that shoulder, mirrored for the right arm
export type Hand = 'fist' | 'open' | 'point' | 'gun' | 'thumb';
export type Legs = 'stand' | 'wide' | 'walk' | 'sit';

export type ToonSpec = {
  id: string;
  ink: string;
  skin: string;
  skinShade: string;
  hair: 'cap-back' | 'short' | 'curly' | 'bald' | 'bun';
  hairColor: string;
  cap?: string; // cap colour (hair: 'cap-back')
  top: 'tank' | 'tee' | 'hoodie' | 'shirt';
  topColor: string;
  topShade: string;
  tie?: string;
  pants: string;
  shoes: string;
  shoeAccent?: string;
  chain?: boolean;
  shadesOnHead?: boolean;
  glasses?: boolean;
  beard?: 'goatee' | 'stubble' | 'mustache' | 'none';
  bodyW?: number; // shoulder/hip width multiplier (1 = default build)
};

export type ToonProps = {
  spec: ToonSpec;
  x: number;
  y: number;
  scale?: number;
  expr?: Expr;
  look?: [number, number]; // pupils, -1..1 each (x: screen left/right, y: up/down)
  mouth?: number; // 0..1 open — drive from lipSync()
  armL?: ArmPose; // screen-LEFT arm
  armR?: ArmPose; // screen-RIGHT arm
  handL?: Hand;
  handR?: Hand;
  holdL?: React.ReactNode; // drawn at the hand, kept upright
  holdR?: React.ReactNode;
  holdRotL?: number;
  holdRotR?: number;
  legs?: Legs;
  walk?: number; // walk phase in cycles (legs: 'walk') — pass t * steps-per-second
  tilt?: number; // head tilt, degrees
  lean?: number; // whole-body lean, degrees
  squash?: number; // 0..1 vertical squash (landings, gasps)
  sweat?: boolean;
  shadow?: boolean;
  blink?: boolean;
};

const U = 165; // upper arm
const F = 150; // forearm
const SHOULDER_Y = -590;
const HEAD_Y = -790;
const HEAD_S = 1.12; // head drawn 12% big — faces must read at phone scale

const deg = Math.PI / 180;

// arm presets, (upper, fore) degrees, outward-positive, for the screen-left arm (right mirrors)
const ARM: Record<string, [number, number] | [number, number, 'ik']> = {
  down: [9, 5],
  hip: [40, -106],
  point: [92, 4],
  'point-up': [150, 2],
  wave: [128, 30],
  gun: [78, -16],
  hold: [10, -90],
  shrug: [50, 88],
  cross: [-6, -84],
  flex: [92, 92],
  thumb: [40, -60],
  present: [60, -40],
  drink: [100, -110, 'ik'],
  facepalm: [104, -200, 'ik'],
};

// 2-bone IK in the outward-positive convention: direction angle θ of v=(vx,vy) is
// atan2(-vx, vy). Picks the solution whose elbow hangs LOWER (natural for reaches).
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

const armAngles = (pose: ArmPose): [number, number] => {
  if (typeof pose === 'object') {
    if ('to' in pose) return ik(pose.to[0], pose.to[1]);
    return [pose.a, pose.b];
  }
  const p = ARM[pose] ?? ARM.down;
  if (p.length === 3) return ik(p[0], p[1]);
  return [p[0], p[1]];
};

// expressions: brow tilt (+ = angry, inner end down) and raise (− = up) per side, eyelid
// cover 0..1, pupil scale, mouth shape, mouth width when talking
type ExprDef = {
  tilt: [number, number];
  raise: [number, number];
  lid: number;
  pupil: number;
  mouth: 'smile' | 'grin' | 'smirk' | 'flat' | 'o' | 'frown';
  happyEyes?: boolean;
  lookX?: number;
};
const EXPR: Record<Expr, ExprDef> = {
  neutral: { tilt: [0, 0], raise: [0, 0], lid: 0.12, pupil: 1, mouth: 'smile' },
  smug: { tilt: [8, -10], raise: [6, -16], lid: 0.42, pupil: 1, mouth: 'smirk' },
  confident: { tilt: [-6, -6], raise: [-8, -8], lid: 0.08, pupil: 1, mouth: 'grin' },
  shock: { tilt: [-10, -10], raise: [-26, -26], lid: 0, pupil: 0.55, mouth: 'o' },
  deadpan: { tilt: [4, -12], raise: [4, -22], lid: 0.5, pupil: 0.9, mouth: 'flat' },
  sad: { tilt: [-18, -18], raise: [-6, -6], lid: 0.3, pupil: 1.05, mouth: 'frown' },
  happy: { tilt: [-6, -6], raise: [-12, -12], lid: 0, pupil: 1, mouth: 'grin', happyEyes: true },
  annoyed: { tilt: [16, 16], raise: [6, 6], lid: 0.36, pupil: 0.9, mouth: 'flat' },
  'side-eye': { tilt: [6, -4], raise: [2, -6], lid: 0.44, pupil: 0.95, mouth: 'flat', lookX: 0.85 },
};

const hashStr = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
  return h;
};

// --- hands ------------------------------------------------------------------------------
const HandShape: React.FC<{ kind: Hand; skin: string; ink: string }> = ({ kind, skin, ink }) => {
  const st = { fill: skin, stroke: ink, strokeWidth: 7, strokeLinejoin: 'round' as const };
  return (
    <g>
      {(kind === 'point' || kind === 'gun') && <rect x={-9} y={10} width={18} height={50} rx={9} {...st} />}
      {(kind === 'gun' || kind === 'thumb') && <rect x={14} y={-22} width={18} height={38} rx={9} {...st} transform="rotate(-20 23 -3)" />}
      {kind === 'open' && <rect x={14} y={-12} width={17} height={34} rx={8.5} {...st} transform="rotate(-35 22 5)" />}
      <circle cx={0} cy={6} r={31} {...st} />
    </g>
  );
};

// --- one arm (drawn for the screen-left side; the right arm is the same group mirrored) ----
const Arm: React.FC<{
  spec: ToonSpec;
  pose: ArmPose;
  hand: Hand;
  mirror: boolean;
  sx: number;
  hold?: React.ReactNode;
  holdRot?: number;
}> = ({ spec, pose, hand, mirror, sx, hold, holdRot = 0 }) => {
  const [a1, a2] = armAngles(pose);
  const sleeve = spec.top === 'hoodie' || spec.top === 'shirt' ? 'long' : spec.top === 'tee' ? 'short' : 'none';
  const st = { stroke: spec.ink, strokeWidth: 7, strokeLinejoin: 'round' as const };
  const skinArm = sleeve === 'long' ? spec.topColor : spec.skin;
  return (
    <g transform={`${mirror ? 'scale(-1,1) ' : ''}translate(${-sx},${SHOULDER_Y}) rotate(${a1})`}>
      <rect x={-27} y={-14} width={54} height={U + 28} rx={27} fill={skinArm} {...st} />
      {sleeve === 'short' && <rect x={-33} y={-24} width={66} height={92} rx={30} fill={spec.topColor} {...st} />}
      <g transform={`translate(0,${U}) rotate(${a2})`}>
        <rect x={-25} y={-18} width={50} height={F + 18} rx={25} fill={skinArm} {...st} />
        {sleeve === 'long' && <rect x={-28} y={F - 38} width={56} height={22} rx={10} fill={spec.topShade} {...st} />}
        <g transform={`translate(0,${F})`}>
          <HandShape kind={hand} skin={spec.skin} ink={spec.ink} />
          {hold && (
            <g transform={`rotate(${-(a1 + a2)})${mirror ? ' scale(-1,1)' : ''} rotate(${holdRot})`}>{hold}</g>
          )}
        </g>
      </g>
    </g>
  );
};

// --- legs ---------------------------------------------------------------------------------
const LegsShape: React.FC<{ spec: ToonSpec; legs: Legs; walk: number; hw: number }> = ({ spec, legs, walk, hw }) => {
  const st = { stroke: spec.ink, strokeWidth: 7, strokeLinejoin: 'round' as const };
  const shoe = (x: number, y: number, flip: number) => (
    <g transform={`translate(${x},${y})`}>
      <path d={`M ${-50 * flip},8 Q ${-54 * flip},-26 ${-6 * flip},-26 L ${30 * flip},-24 Q ${62 * flip},-20 ${58 * flip},8 Z`} fill={spec.shoes} {...st} />
      <rect x={-56} y={2} width={116} height={14} rx={7} fill="#d9d4cc" {...st} />
      {spec.shoeAccent && <path d={`M ${-26 * flip},-10 Q ${4 * flip},-2 ${26 * flip},-16`} fill="none" stroke={spec.shoeAccent} strokeWidth={8} strokeLinecap="round" />}
    </g>
  );
  if (legs === 'sit') {
    const hipY = -250;
    return (
      <g>
        {[-1, 1].map((s) => {
          const hx = s * 46 * hw;
          const kx = hx + s * 40;
          return (
            <g key={s}>
              <rect x={kx - 37} y={-180} width={74} height={160} rx={30} fill={spec.pants} {...st} />
              <path d={`M ${hx - 40},${hipY - 10} L ${hx + 40},${hipY - 10} L ${kx + 42},-170 L ${kx - 42},-170 Z`} fill={spec.pants} {...st} />
              <ellipse cx={kx} cy={-176} rx={46} ry={30} fill={spec.pants} {...st} />
              {shoe(kx + s * 8, -12, s)}
            </g>
          );
        })}
      </g>
    );
  }
  const swing = legs === 'walk' ? Math.sin(walk * Math.PI * 2) * 20 : 0;
  const spread = legs === 'wide' ? 8 : 2;
  return (
    <g>
      {[-1, 1].map((s) => {
        const ang = s * spread + (s === -1 ? swing : -swing);
        return (
          <g key={s} transform={`translate(${s * 46 * hw},-322) rotate(${ang})`}>
            <rect x={-37} y={-10} width={74} height={300} rx={30} fill={spec.pants} {...st} />
            <rect x={-39} y={252} width={78} height={30} rx={12} fill={spec.pants} {...st} />
            {shoe(s * 8, 304, s)}
          </g>
        );
      })}
    </g>
  );
};

// --- head -------------------------------------------------------------------------------
const Face: React.FC<{
  spec: ToonSpec;
  e: ExprDef;
  look: [number, number];
  mouth: number;
  blinkLid: number;
  clipId: string;
}> = ({ spec, e, look, mouth, blinkLid, clipId }) => {
  const ink = spec.ink;
  const lid = Math.max(e.lid, blinkLid);
  const lx = (look[0] + (e.lookX ?? 0)) * 11;
  const ly = look[1] * 9;
  const eyes = [-56, 56].map((cx, i) => {
    if (e.happyEyes) {
      return <path key={i} d={`M ${cx - 28},2 Q ${cx},-38 ${cx + 28},2`} fill="none" stroke={ink} strokeWidth={10} strokeLinecap="round" />;
    }
    const cover = lid * 76;
    return (
      <g key={i}>
        <clipPath id={`${clipId}-e${i}`}>
          <ellipse cx={cx} cy={-8} rx={30} ry={37} />
        </clipPath>
        <ellipse cx={cx} cy={-8} rx={30} ry={37} fill="#ffffff" />
        <g clipPath={`url(#${clipId}-e${i})`}>
          <circle cx={cx + lx} cy={-4 + ly} r={15 * e.pupil} fill={ink} />
          <circle cx={cx + lx + 5} cy={-10 + ly} r={4.5 * e.pupil} fill="#ffffff" />
          {cover > 0 && <rect x={cx - 34} y={-48} width={68} height={cover + 3} fill={spec.skin} />}
        </g>
        <ellipse cx={cx} cy={-8} rx={30} ry={37} fill="none" stroke={ink} strokeWidth={6} />
        {cover > 2 && <line x1={cx - 31} x2={cx + 31} y1={-45 + cover} y2={-45 + cover} stroke={ink} strokeWidth={7} strokeLinecap="round" />}
      </g>
    );
  });
  // mouth: talking opens a dark oval sized by `mouth`; closed = the expression's shape
  const my = 80;
  let mouthEl: React.ReactNode;
  if (mouth > 0.06) {
    const w = e.mouth === 'grin' ? 50 : e.mouth === 'smirk' ? 38 : 34;
    const h = 7 + 40 * mouth;
    const ox = e.mouth === 'smirk' ? 8 : 0;
    mouthEl = (
      <g>
        <ellipse cx={ox} cy={my + 4} rx={w} ry={h} fill="#4a1414" stroke={ink} strokeWidth={6} />
        {h > 16 && <ellipse cx={ox} cy={my + 4 + h * 0.55} rx={w * 0.55} ry={h * 0.35} fill="#d9606a" />}
        {h > 14 && <rect x={ox - w * 0.7} y={my + 4 - h + 3} width={w * 1.4} height={Math.min(10, h * 0.3)} rx={4} fill="#ffffff" />}
      </g>
    );
  } else if (e.mouth === 'grin') {
    mouthEl = (
      <g>
        <path d={`M -54,${my - 12} Q 0,${my + 52} 54,${my - 12} Z`} fill="#4a1414" stroke={ink} strokeWidth={7} strokeLinejoin="round" />
        <path d={`M -46,${my - 9} L 46,${my - 9} Q 40,${my + 4} 0,${my + 6} Q -40,${my + 4} -46,${my - 9} Z`} fill="#ffffff" />
      </g>
    );
  } else if (e.mouth === 'o') {
    mouthEl = <ellipse cx={0} cy={my + 6} rx={17} ry={22} fill="#4a1414" stroke={ink} strokeWidth={7} />;
  } else {
    const d =
      e.mouth === 'smile' ? `M -34,${my - 4} Q 0,${my + 22} 34,${my - 4}`
      : e.mouth === 'smirk' ? `M -30,${my + 6} Q 12,${my + 12} 40,${my - 14}`
      : e.mouth === 'frown' ? `M -30,${my + 14} Q 0,${my - 8} 30,${my + 14}`
      : `M -27,${my + 4} L 27,${my + 4}`;
    mouthEl = <path d={d} fill="none" stroke={ink} strokeWidth={8} strokeLinecap="round" />;
  }

  return (
    <g>
      {spec.beard === 'stubble' && (
        <path d="M -128,40 Q -112,152 0,158 Q 112,152 128,40 Q 0,124 -128,40 Z" fill={spec.skinShade} opacity={0.55} />
      )}
      {eyes}
      <path d="M -4,18 Q 16,38 -2,48" fill="none" stroke={ink} strokeWidth={6} strokeLinecap="round" />
      {mouthEl}
      {spec.beard === 'goatee' && <path d="M -18,118 Q 0,148 18,118 Q 0,128 -18,118 Z" fill={spec.hairColor} stroke={ink} strokeWidth={4} />}
      {spec.beard === 'mustache' && (
        <path d="M -44,64 Q -22,44 0,58 Q 22,44 44,64 Q 22,72 0,66 Q -22,72 -44,64 Z" fill={spec.hairColor} stroke={ink} strokeWidth={4} />
      )}
      {spec.glasses && (
        <g fill="rgba(255,255,255,0.12)" stroke={ink} strokeWidth={7}>
          <circle cx={-56} cy={-8} r={44} />
          <circle cx={56} cy={-8} r={44} />
          <path d="M -12,-12 Q 0,-20 12,-12" fill="none" />
        </g>
      )}
    </g>
  );
};

// brows are their own layer, drawn OVER hair/caps — they carry most of the comedy and must
// never be hidden by a hat brim
const Brows: React.FC<{ spec: ToonSpec; e: ExprDef }> = ({ spec, e }) => (
  <g>
    {[-1, 1].map((s, i) => {
      const cx = s * 56;
      const y = -70 + e.raise[i];
      return (
        <line
          key={i}
          x1={cx - 32}
          x2={cx + 32}
          y1={y}
          y2={y}
          stroke={spec.hair === 'bald' ? '#8a7d72' : spec.hairColor}
          strokeWidth={15}
          strokeLinecap="round"
          /* +tilt = angry: the INNER end drops (clockwise on the left brow, counter on the right) */
          transform={`rotate(${s === -1 ? e.tilt[i] : -e.tilt[i]} ${cx} ${y})`}
        />
      );
    })}
  </g>
);

const Hair: React.FC<{ spec: ToonSpec; layer: 'back' | 'front' }> = ({ spec, layer }) => {
  const st = { stroke: spec.ink, strokeWidth: 7, strokeLinejoin: 'round' as const };
  if (spec.hair === 'cap-back') {
    const cap = spec.cap ?? '#e63946';
    if (layer === 'back') {
      // the backwards brim peeks out behind the head — the silhouette tell
      return <ellipse cx={112} cy={-150} rx={100} ry={25} fill={cap} {...st} transform="rotate(-18 112 -150)" />;
    }
    return (
      <g>
        <rect x={-150} y={-84} width={22} height={100} rx={8} fill={spec.hairColor} />
        <rect x={128} y={-84} width={22} height={100} rx={8} fill={spec.hairColor} />
        <path d="M -154,-70 C -158,-160 -82,-188 0,-188 C 82,-188 158,-160 154,-70 Q 0,-100 -154,-70 Z" fill={cap} {...st} />
        <path d="M -38,-84 Q -38,-134 0,-134 Q 38,-134 38,-84 Z" fill={spec.hairColor} {...st} />
        <rect x={-40} y={-96} width={80} height={12} rx={5} fill="#2b2b2b" />
        <path d="M 0,-186 L 0,-136" stroke="rgba(0,0,0,0.25)" strokeWidth={6} />
        <path d="M -100,-166 Q -88,-120 -86,-80" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth={6} />
        <path d="M 100,-166 Q 88,-120 86,-80" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth={6} />
        <circle cx={0} cy={-186} r={10} fill={cap} {...st} />
        {spec.shadesOnHead && (
          <g transform="translate(0,-150) scale(0.9)">
            <rect x={-92} y={-22} width={78} height={46} rx={20} fill="#16181d" {...st} />
            <rect x={14} y={-22} width={78} height={46} rx={20} fill="#16181d" {...st} />
            <path d="M -14,-6 Q 0,-14 14,-6" fill="none" stroke={spec.ink} strokeWidth={7} />
            <path d="M -78,-10 L -58,-10" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
            <path d="M 28,-10 L 48,-10" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
          </g>
        )}
      </g>
    );
  }
  if (layer === 'back') {
    if (spec.hair === 'bun') return <circle cx={0} cy={-190} r={46} fill={spec.hairColor} {...st} />;
    return null;
  }
  if (spec.hair === 'bald') {
    return (
      <g fill={spec.hairColor} {...st}>
        <ellipse cx={-140} cy={-40} rx={24} ry={40} />
        <ellipse cx={140} cy={-40} rx={24} ry={40} />
      </g>
    );
  }
  if (spec.hair === 'curly') {
    const pts = [-130, -95, -55, -15, 25, 65, 105, 135].map((x, i) => {
      const y = -150 + Math.pow(x / 140, 2) * 90 - (i % 2) * 12;
      return <circle key={i} cx={x} cy={y} r={44} />;
    });
    return <g fill={spec.hairColor} {...st}>{pts}</g>;
  }
  // short (and bun's front)
  return (
    <path
      d="M -152,-36 C -154,-150 -72,-176 0,-176 C 72,-176 154,-150 152,-36 Q 128,-96 66,-108 Q 10,-90 -30,-112 Q -110,-100 -152,-36 Z"
      fill={spec.hairColor}
      {...st}
    />
  );
};

// --- the character --------------------------------------------------------------------------
export const Toon: React.FC<ToonProps> = ({
  spec,
  x,
  y,
  scale = 1,
  expr = 'neutral',
  look = [0, 0],
  mouth = 0,
  armL = 'down',
  armR = 'down',
  handL,
  handR,
  holdL,
  holdR,
  holdRotL = 0,
  holdRotR = 0,
  legs = 'stand',
  walk = 0,
  tilt = 0,
  lean = 0,
  squash = 0,
  sweat = false,
  shadow = true,
  blink = true,
}) => {
  const frame = useCurrentFrame();
  const h = hashStr(spec.id);
  const e = EXPR[expr];
  const bw = spec.bodyW ?? 1;
  const S = 108 * bw;
  const H = 88 * bw;
  const ink = spec.ink;
  const st = { stroke: ink, strokeWidth: 7, strokeLinejoin: 'round' as const };

  const breath = Math.sin((frame + h) / 14);
  const bob = legs === 'walk' ? -Math.abs(Math.sin(walk * Math.PI * 2)) * 10 : 0;
  const upperShift = legs === 'sit' ? 72 : 0;
  const cyc = (frame + h * 7) % 104;
  const blinkLid = blink && !e.happyEyes && cyc < 4 ? 1 : 0;
  const nod = mouth * 5;

  const defaultHand = (pose: ArmPose): Hand =>
    pose === 'point' || pose === 'point-up' ? 'point' : pose === 'gun' ? 'gun' : pose === 'thumb' ? 'thumb' : pose === 'shrug' || pose === 'wave' || pose === 'present' ? 'open' : 'fist';
  const hL = handL ?? defaultHand(armL);
  const hR = handR ?? defaultHand(armR);
  // arm layer: behind the torso (default), over the torso (arms crossing the chest), or over
  // the head (hands that reach the face)
  const layer = (p: ArmPose): 'back' | 'torso' | 'head' => {
    if (p === 'drink' || p === 'facepalm' || (typeof p === 'object' && 'to' in p && p.to[1] < -40)) return 'head';
    if (p === 'cross' || p === 'hold' || p === 'thumb') return 'torso';
    return 'back';
  };
  const armLEl = <Arm spec={spec} pose={armL} hand={hL} mirror={false} sx={S} hold={holdL} holdRot={holdRotL} />;
  const armREl = <Arm spec={spec} pose={armR} hand={hR} mirror sx={S} hold={holdR} holdRot={holdRotR} />;

  const clipId = `tc-${spec.id}-${Math.round(x)}-${Math.round(y)}`;

  const torsoD = `M ${-S + 12},-616 Q 0,-632 ${S - 12},-616 Q ${S + 16},-602 ${S + 6},-540 L ${H + 4},-300 Q 0,-284 ${-H - 4},-300 L ${-S - 6},-540 Q ${-S - 16},-602 ${-S + 12},-616 Z`;
  const tankD = `M -84,-618 L -48,-618 Q -40,-560 0,-552 Q 40,-560 48,-618 L 84,-618 Q 86,-540 ${S - 4},-506 L ${H + 4},-300 Q 0,-284 ${-H - 4},-300 L ${-S + 4},-506 Q -86,-540 -84,-618 Z`;

  const head = (
    <g transform={`translate(0,${HEAD_Y + nod + breath * 1.5}) rotate(${tilt} 0 150) scale(${HEAD_S})`}>
      {spec.top === 'hoodie' && <ellipse cx={0} cy={118} rx={128} ry={50} fill={spec.topShade} {...st} />}
      <Hair spec={spec} layer="back" />
      <circle cx={-150} cy={6} r={30} fill={spec.skin} {...st} />
      <circle cx={150} cy={6} r={30} fill={spec.skin} {...st} />
      <ellipse cx={0} cy={0} rx={150} ry={160} fill={spec.skin} {...st} />
      <Face spec={spec} e={e} look={look} mouth={mouth} blinkLid={blinkLid} clipId={clipId} />
      <Hair spec={spec} layer="front" />
      <Brows spec={spec} e={e} />
      {sweat && (
        <path d="M 150,-90 Q 172,-50 162,-36 Q 146,-26 140,-44 Q 138,-60 150,-90 Z" fill="#8fd3ff" stroke={ink} strokeWidth={5} />
      )}
    </g>
  );

  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {shadow && <ellipse cx={0} cy={6} rx={150 * bw} ry={20} fill="rgba(0,0,0,0.18)" />}
      <g transform={`rotate(${lean} 0 0) translate(0,${bob}) scale(1,${1 - squash * 0.12})`}>
        <LegsShape spec={spec} legs={legs} walk={walk} hw={bw} />
        <g transform={`translate(0,${upperShift})`}>
          <g transform={`translate(0,-310) scale(1,${1 + breath * 0.008}) translate(0,310)`}>
            {/* waistband */}
            <rect x={-H - 6} y={-338} width={2 * H + 12} height={46} rx={14} fill={spec.pants} {...st} />
            {layer(armL) === 'back' && armLEl}
            {layer(armR) === 'back' && armREl}
            <rect x={-34} y={-664} width={68} height={70} fill={spec.skin} {...st} />
            {spec.top === 'tank' ? (
              <>
                <path d={torsoD} fill={spec.skin} {...st} />
                <path d={tankD} fill={spec.topColor} {...st} />
              </>
            ) : (
              <path d={torsoD} fill={spec.topColor} {...st} />
            )}
            {spec.top === 'hoodie' && (
              <g stroke={ink} strokeWidth={6} strokeLinecap="round">
                <line x1={-26} y1={-600} x2={-30} y2={-520} />
                <line x1={26} y1={-600} x2={30} y2={-520} />
                <path d={`M ${-H + 10},-420 L ${H - 10},-420 L ${H - 22},-340 L ${-H + 22},-340 Z`} fill={spec.topShade} />
              </g>
            )}
            {spec.top === 'shirt' && (
              <g {...st}>
                <path d="M -40,-622 L 0,-580 L -18,-560 L -56,-606 Z" fill="#f5f2ea" />
                <path d="M 40,-622 L 0,-580 L 18,-560 L 56,-606 Z" fill="#f5f2ea" />
                {spec.tie && <path d="M -14,-582 L 14,-582 L 22,-420 L 0,-396 L -22,-420 Z" fill={spec.tie} />}
              </g>
            )}
            {spec.top === 'tee' && <path d="M -46,-618 Q 0,-580 46,-618" fill="none" stroke={ink} strokeWidth={7} />}
            {spec.chain && (
              <g>
                <path d="M -50,-612 Q -40,-520 0,-508 Q 40,-520 50,-612" fill="none" stroke="#e9b44c" strokeWidth={10} strokeLinecap="round" />
                <path d="M -50,-612 Q -40,-520 0,-508 Q 40,-520 50,-612" fill="none" stroke="#b07d1e" strokeWidth={3} strokeDasharray="6 8" />
                <circle cx={0} cy={-492} r={22} fill="#f2c14e" stroke={ink} strokeWidth={6} />
                <circle cx={-6} cy={-498} r={6} fill="#fff6d8" />
              </g>
            )}
            {layer(armL) === 'torso' && armLEl}
            {layer(armR) === 'torso' && armREl}
            {head}
            {layer(armL) === 'head' && armLEl}
            {layer(armR) === 'head' && armREl}
          </g>
        </g>
      </g>
    </g>
  );
};

// Where a character's face is on stage — aim the camera here for close-ups.
export const faceAt = (x: number, y: number, scale = 1, legs: Legs = 'stand'): [number, number] => [
  x,
  y + (HEAD_Y + (legs === 'sit' ? 72 : 0)) * scale,
];
