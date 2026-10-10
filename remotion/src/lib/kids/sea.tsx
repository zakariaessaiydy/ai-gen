// KIDS KIT — <Fish>: the chibi FISH rig (added Day 30). A round friendly fish in 3/4 view: body + belly, a
// wagging tail fan, a top fin, a flapping side fin and the SAME face as <Kid>/<Critter> (face.tsx — glossy
// eyes, blush, every expression, lip-sync), so fish act in the channel's emotional language.
// Origin = the body centre; ~260×200 px at scale 1, facing RIGHT (facing={-1} mirrors).
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Face, HeadSparkles, KINK, kst, type KExpr } from './face';

export type FishSpec = {
  id: string;
  body: string;
  belly: string;
  fin: string;
  pattern?: 'none' | 'stripes' | 'spots' | 'rainbow';
  patternColor?: string;
  iris?: string;
  bow?: string;
};

export type FishProps = {
  spec: FishSpec;
  x: number;
  y: number;
  scale?: number;
  expr?: KExpr;
  look?: [number, number];
  mouth?: number;
  facing?: 1 | -1;
  swim?: number; // swim phase (pass t * 2…4); tail + fins wag faster while swimming
  swimming?: boolean;
  tilt?: number;
  blink?: boolean;
  idle?: boolean;
};

const hashStr = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
  return h;
};

const BODY = 'M -118,0 C -118,-70 -50,-98 20,-96 C 92,-94 128,-48 128,0 C 128,50 92,94 20,96 C -50,98 -118,70 -118,0 Z';
const RAIN = ['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#4cc9f0', '#7b2cbf'];

export const Fish: React.FC<FishProps> = ({
  spec, x, y, scale = 1, expr = 'happy', look = [0.3, 0], mouth = 0, facing = 1, swim, swimming = false, tilt = 0, blink = true, idle = true,
}) => {
  const frame = useCurrentFrame();
  const h = hashStr(spec.id);
  const ph = swim ?? (frame + h) / 30;
  const fast = swimming ? 2.6 : 1;
  const wag = Math.sin(ph * Math.PI * 2 * fast) * (swimming ? 16 : 9);
  const flap = Math.sin(ph * Math.PI * 2 * fast + 1) * (swimming ? 0.45 : 0.25);
  const bob = idle ? Math.sin((frame + h * 3) / 20) * 6 : 0;
  const sway = idle ? Math.sin((frame + h) / 26) * 3 : 0;
  const closed = blink && (frame + h * 5) % 110 < 4;
  const id = `fish-${spec.id}`;
  const pat = spec.pattern ?? 'none';
  const pc = spec.patternColor ?? KINK;
  return (
    <g transform={`translate(${x},${y + bob}) scale(${scale * facing},${scale}) rotate(${tilt + sway})`}>
      {/* tail fan */}
      <g transform={`rotate(${wag} -108 0)`}>
        <path d="M -104,0 C -150,-30 -170,-78 -196,-82 C -186,-40 -176,-14 -176,0 C -176,14 -186,40 -196,82 C -170,78 -150,30 -104,0 Z" fill={spec.fin} {...kst(7)} />
        <path d="M -128,-6 L -172,-50 M -128,6 L -172,50" fill="none" stroke={KINK} strokeWidth={4} opacity={0.35} strokeLinecap="round" />
      </g>
      {/* top fin */}
      <path d={`M -40,-88 C -20,-150 50,-150 74,-${118 + Math.sin(ph * 6) * 4} C 62,-104 40,-96 30,-94 Z`} fill={spec.fin} {...kst(7)} />
      {/* bottom fin */}
      <path d="M -10,90 C 0,124 34,130 52,118 C 40,108 34,98 30,92 Z" fill={spec.fin} {...kst(6)} />
      {/* body + belly + pattern */}
      <defs>
        <clipPath id={id}>
          <path d={BODY} />
        </clipPath>
      </defs>
      <path d={BODY} fill={spec.body} />
      <g clipPath={`url(#${id})`}>
        {pat === 'rainbow' && RAIN.map((c, i) => <rect key={c} x={-130} y={-100 + i * 34} width={270} height={36} fill={c} />)}
        <ellipse cx={14} cy={70} rx={110} ry={46} fill={spec.belly} opacity={pat === 'rainbow' ? 0.5 : 1} />
        {pat === 'stripes' && [-60, -14, 32].map((sx) => (
          <path key={sx} d={`M ${sx},-110 Q ${sx + 18},0 ${sx},110 L ${sx + 22},110 Q ${sx + 40},0 ${sx + 22},-110 Z`} fill={pc} opacity={0.85} />
        ))}
        {pat === 'spots' && [[-70, -30, 14], [-40, 30, 11], [-20, -60, 10], [0, 10, 12], [-80, 40, 9], [30, -55, 9], [-50, -5, 8]].map(([sx, sy, r], i) => (
          <circle key={i} cx={sx} cy={sy} r={r} fill={pc} opacity={0.85} />
        ))}
        {/* scale hints */}
        {[[-70, 10], [-50, 40], [-80, -20]].map(([sx, sy], i) => <path key={i} d={`M ${sx},${sy} q 10,-12 20,0`} fill="none" stroke="#ffffff" strokeWidth={4} opacity={0.35} strokeLinecap="round" />)}
        <ellipse cx={-30} cy={-58} rx={46} ry={18} fill="#ffffff" opacity={0.3} transform="rotate(-12 -30 -58)" />
      </g>
      <path d={BODY} fill="none" {...kst(8)} />
      {/* gill line */}
      <path d="M 20,-56 Q 2,0 20,56" fill="none" stroke={KINK} strokeWidth={5} opacity={0.4} strokeLinecap="round" />
      {/* side fin (flaps) */}
      <g transform={`translate(-6,26) scale(1,${1 - flap})`}>
        <path d="M 0,0 C -30,-10 -54,10 -50,34 C -30,34 -10,22 0,0 Z" fill={spec.fin} {...kst(5)} />
      </g>
      {/* face (shared kids face, scaled to the fish) */}
      <g transform="translate(60,-6) scale(0.62)">
        <Face expr={expr} look={look} mouth={mouth} blink={closed} skin={spec.body} iris={spec.iris ?? '#3a2a4a'} eyeR={40} eyeDX={52} eyeY={-14} mouthY={54} mouthW={36} cheeks brows={false} nose={<g />} />
      </g>
      {spec.bow && (
        <g transform="translate(10,-92) rotate(-12) scale(0.8)">
          <path d="M 0,0 L -50,-30 Q -62,0 -50,30 Z" fill={spec.bow} {...kst(7)} />
          <path d="M 0,0 L 50,-30 Q 62,0 50,30 Z" fill={spec.bow} {...kst(7)} />
          <circle r={14} fill={spec.bow} {...kst(7)} />
        </g>
      )}
      <g transform="translate(40,0)"><HeadSparkles frame={frame} r={110} on={expr === 'wow' || expr === 'proud'} /></g>
    </g>
  );
};

// a rising bubble stream (stage space)
export const Bubbles: React.FC<{ t: number; x: number; y: number; n?: number; h?: number }> = ({ t, x, y, n = 4, h = 300 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const p = (t * 0.45 + i / n) % 1;
      return <circle key={i} cx={x + Math.sin(t * 3 + i * 2) * 10} cy={y - p * h} r={6 + (i % 3) * 3} fill="none" stroke="#ffffff" strokeWidth={4} opacity={1 - p} />;
    })}
  </g>
);
