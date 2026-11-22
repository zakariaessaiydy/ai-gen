// KIDS KIT — <Dino>: the chibi DINOSAUR rig (added Day 37). Five friendly kinds in 3/4 side view, all with the
// SAME face as <Kid>/<Critter>/<Fish> (face.tsx: glossy eyes, blush, every expression, lip-sync) and the 3D
// vinyl look (<Vol>):
//   rex    — T-rex: big round head, tiny arms, two stubby legs, thick tail
//   tops   — triceratops: frill + 3 rounded horns, four legs
//   stego  — stegosaurus: a row of back plates, tail bumps
//   neck   — long-neck (sauropod): long neck, little head up high
//   baby   — a hatchling sitting in its half egg shell (arms up)
// Origin = the ground between the feet; facing RIGHT (facing={-1} mirrors). Heights at scale 1: rex ~430,
// tops ~330, stego ~370, neck ~560, baby ~230. Also here: <DinoEgg>, <EggNest> (a 2×5 "ten frame" of egg cups),
// <Footprint>, <NumStone> and the <DinoValley> set.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Face, HeadSparkles, KINK, kst, type KExpr } from './face';
import { AO, Ground, K3DDefs, Vol } from './depth';
import { FONT_TOON } from '../toon/comedy';
import { Sun } from './sets';

export type DinoKind = 'rex' | 'tops' | 'stego' | 'neck' | 'baby';
export type DinoSpec = {
  id: string;
  kind: DinoKind;
  body: string;
  belly: string;
  accent: string; // spikes / plates / horns / frill
  spots?: string; // optional spot colour
  iris?: string;
  bow?: string;
};

export type DinoProps = {
  spec: DinoSpec;
  x: number;
  y: number;
  scale?: number;
  expr?: KExpr;
  look?: [number, number];
  mouth?: number;
  facing?: 1 | -1;
  walk?: number; // walk phase in cycles (pass t * 2)
  walking?: boolean;
  hop?: number;
  squash?: number;
  tilt?: number; // head tilt (deg)
  wave?: boolean; // little arms wave (rex / baby)
  blink?: boolean;
  idle?: boolean;
  shadow?: boolean;
};

const hashStr = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
  return h;
};

// a darker shade of a hex colour (legs on the far side)
const shade = (hex: string, k = 0.82) => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * k);
  const g = Math.round(((n >> 8) & 255) * k);
  const b = Math.round((n & 255) * k);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

// stubby leg: hip at (0,0), foot on the ground at y = len. Rotates around the hip.
const Leg: React.FC<{ x: number; hipY: number; len: number; w: number; a: number; fill: string }> = ({ x, hipY, len, w, a, fill }) => (
  <g transform={`translate(${x},${hipY}) rotate(${a})`}>
    <Vol kind="tube">
      <rect x={-w / 2} y={-10} width={w} height={len + 10} rx={w / 2} fill={fill} {...kst(7)} />
    </Vol>
    <Vol>
      <ellipse cx={w * 0.18} cy={len - 4} rx={w * 0.72} ry={w * 0.36} fill={fill} {...kst(7)} />
    </Vol>
    {[-1, 0, 1].map((k) => <circle key={k} cx={w * 0.18 + k * w * 0.36 + w * 0.3} cy={len - 2} r={w * 0.1} fill="#ffffff" opacity={0.75} />)}
  </g>
);

// the head: a rounded dome with the shared face. (hx, hy) = head centre, r = radius.
const Head: React.FC<{
  s: DinoSpec; r: number; expr: KExpr; look: [number, number]; mouth: number; closed: boolean; frame: number; tilt: number; snout?: boolean;
}> = ({ s, r, expr, look, mouth, closed, frame, tilt, snout = true }) => {
  const k = r / 150;
  return (
    <g transform={`rotate(${tilt} 0 ${r * 0.6})`}>
      <Vol>
        <path
          d={snout
            ? `M ${-r},${0} C ${-r},${-r * 1.05} ${r * 0.9},${-r * 1.08} ${r * 1.02},${-r * 0.1} C ${r * 1.18},${r * 0.2} ${r * 1.12},${r * 0.86} ${r * 0.4},${r * 0.92} C ${-r * 0.2},${r * 0.98} ${-r},${r * 0.8} ${-r},${0} Z`
            : `M ${-r},0 A ${r},${r * 0.94} 0 1 1 ${r},0 A ${r},${r * 0.94} 0 1 1 ${-r},0 Z`}
          fill={s.body}
          {...kst(9)}
        />
      </Vol>
      {s.spots && [[-0.55, -0.45, 0.16], [-0.7, 0.05, 0.12], [-0.25, -0.75, 0.1]].map(([sx, sy, sr], i) => (
        <circle key={i} cx={sx * r} cy={sy * r} r={sr * r} fill={s.spots} opacity={0.9} />
      ))}
      <ellipse cx={-r * 0.5} cy={-r * 0.62} rx={r * 0.26} ry={r * 0.12} fill="#ffffff" opacity={0.32} transform={`rotate(-30 ${-r * 0.5} ${-r * 0.62})`} />
      {snout && (
        <g fill={KINK}>
          <ellipse cx={r * 0.86} cy={r * 0.12} rx={r * 0.045} ry={r * 0.03} />
          <ellipse cx={r * 0.72} cy={r * 0.08} rx={r * 0.045} ry={r * 0.03} />
        </g>
      )}
      <g transform={`translate(${r * 0.18},${-r * 0.08}) scale(${k * 0.98})`}>
        <Face
          expr={expr}
          look={look}
          mouth={mouth}
          blink={closed}
          skin={s.body}
          iris={s.iris ?? '#3a2a4a'}
          eyeR={42}
          eyeDX={62}
          eyeY={-14}
          mouthY={74}
          mouthW={46}
          cheeks
          brows={shade(s.body, 0.6)}
          nose={<g />}
        />
      </g>
      {s.bow && (
        <g transform={`translate(${-r * 0.55},${-r * 0.82}) rotate(-20) scale(${k})`}>
          <Vol>
            <path d="M 0,0 L -50,-30 Q -62,0 -50,30 Z" fill={s.bow} {...kst(7)} />
            <path d="M 0,0 L 50,-30 Q 62,0 50,30 Z" fill={s.bow} {...kst(7)} />
            <circle r={14} fill={s.bow} {...kst(7)} />
          </Vol>
        </g>
      )}
      <HeadSparkles frame={frame} r={r * 1.05} on={expr === 'wow' || expr === 'proud'} />
    </g>
  );
};

export const Dino: React.FC<DinoProps> = ({
  spec, x, y, scale = 1, expr = 'smile', look = [0.4, 0], mouth = 0, facing = 1, walk = 0, walking = false, hop = 0, squash = 0,
  tilt = 0, wave = false, blink = true, idle = true, shadow = true,
}) => {
  const frame = useCurrentFrame();
  const s = spec;
  const h = hashStr(s.id);
  const closed = blink && (frame + h * 5) % 104 < 4;
  const step = walking ? Math.sin(walk * Math.PI * 2) : 0;
  const legA = walking ? step * 18 : 0;
  const bob = walking ? -Math.abs(step) * 10 : idle ? Math.sin((frame + h) / 14) * 3 : 0;
  const tail = Math.sin((frame + h * 3) / (walking ? 6 : 18)) * (walking ? 7 : 4);
  const nod = idle ? Math.sin((frame + h * 7) / 22) * 2.5 - (mouth > 0.08 ? mouth * 5 : 0) : 0;
  const armWave = wave ? Math.sin(frame / 3.2) * 28 : 0;
  const bounce = expr === 'laugh' && !walking && hop === 0 ? Math.abs(Math.sin((frame + h) / 5)) * 10 : 0;
  const B = s.body;
  const far = shade(B, 0.8);
  const st = kst(8);
  const headProps = { s, expr, look, mouth, closed, frame, tilt: tilt + nod };

  let body: React.ReactNode = null;
  let groundW = 140;
  if (s.kind === 'rex') {
    groundW = 120;
    body = (
      <g>
        {/* tail */}
        <g transform={`rotate(${tail} -50 -150)`}>
          <Vol>
            <path d="M -40,-210 C -140,-200 -230,-150 -300,-56 C -230,-80 -150,-96 -40,-110 Z" fill={B} {...st} />
          </Vol>
          {[[-150, -168], [-210, -132], [-262, -96]].map(([sx, sy], i) => (
            <path key={i} d={`M ${sx - 18},${sy + 6} Q ${sx},${sy - 34 + i * 6} ${sx + 18},${sy - 2}`} fill={s.accent} {...kst(6)} />
          ))}
        </g>
        <Leg x={-34} hipY={-120} len={120} w={64} a={-legA} fill={far} />
        {/* body */}
        <Vol shape={<ellipse cx={0} cy={-190} rx={112} ry={128} />}>
          <ellipse cx={0} cy={-190} rx={112} ry={128} fill={B} />
          <ellipse cx={34} cy={-172} rx={62} ry={92} fill={s.belly} />
          {[-120, -160, -200, -240].map((by) => <path key={by} d={`M ${6},${by} Q ${34},${by + 10} ${62},${by}`} fill="none" stroke={shade(s.belly, 0.75)} strokeWidth={4} opacity={0.6} strokeLinecap="round" />)}
          {s.spots && [[-56, -230, 16], [-70, -176, 12], [-40, -120, 10]].map(([sx, sy, sr], i) => <circle key={i} cx={sx} cy={sy} r={sr} fill={s.spots} />)}
          <ellipse cx={0} cy={-190} rx={112} ry={128} fill="none" {...st} />
        </Vol>
        <Leg x={40} hipY={-116} len={116} w={68} a={legA} fill={B} />
        {/* tiny arms */}
        <g transform={`translate(78,-226) rotate(${50 - armWave})`}>
          <Vol kind="tube"><rect x={-13} y={-8} width={26} height={62} rx={13} fill={B} {...kst(6)} /></Vol>
        </g>
        {/* head */}
        <g transform={`translate(54,-372)`}>
          {[[-130, -40], [-118, -96], [-84, -138]].map(([sx, sy], i) => (
            <path key={i} d={`M ${sx - 22},${sy + 14} Q ${sx - 30},${sy - 38} ${sx + 14},${sy - 26} Z`} fill={s.accent} {...kst(6)} transform={`rotate(${-30 + i * 25} ${sx} ${sy})`} />
          ))}
          <Head {...headProps} r={142} />
        </g>
      </g>
    );
  } else if (s.kind === 'tops' || s.kind === 'stego' || s.kind === 'neck') {
    const neck = s.kind === 'neck';
    const stego = s.kind === 'stego';
    const bw = neck ? 186 : 196;
    const bh = neck ? 112 : 112;
    const by = -150;
    groundW = 210;
    body = (
      <g>
        {/* tail */}
        <g transform={`rotate(${tail} ${-bw * 0.8} ${by})`}>
          <Vol>
            <path
              d={neck
                ? `M ${-bw * 0.7},${by - 60} C ${-bw - 120},${by - 40} ${-bw - 200},${by + 40} ${-bw - 250},${by - 30} C ${-bw - 190},${by + 70} ${-bw - 90},${by + 50} ${-bw * 0.6},${by + 40} Z`
                : `M ${-bw * 0.75},${by - 50} C ${-bw - 70},${by - 30} ${-bw - 140},${by + 10} ${-bw - 170},${by + 60} C ${-bw - 100},${by + 50} ${-bw - 40},${by + 50} ${-bw * 0.6},${by + 40} Z`}
              fill={B}
              {...st}
            />
          </Vol>
          {stego && [[-bw - 120, by + 2], [-bw - 150, by + 30]].map(([sx, sy], i) => (
            <path key={i} d={`M ${sx - 14},${sy} Q ${sx - 4},${sy - 50} ${sx + 14},${sy - 4} Z`} fill={s.accent} {...kst(6)} />
          ))}
        </g>
        <Leg x={-bw * 0.52} hipY={by + 40} len={-by - 40} w={58} a={legA} fill={far} />
        <Leg x={bw * 0.42} hipY={by + 40} len={-by - 40} w={58} a={-legA} fill={far} />
        {/* back plates (stego) — behind the body */}
        {stego && [-150, -84, -18, 46, 104].map((px, i) => {
          const ph = [64, 86, 92, 80, 58][i];
          const py = by - bh + 26 + Math.abs(px + 24) * 0.22;
          return (
            <Vol key={px}>
              <path d={`M ${px - ph * 0.42},${py + 20} L ${px - ph * 0.3},${py - ph * 0.55} L ${px},${py - ph} L ${px + ph * 0.3},${py - ph * 0.55} L ${px + ph * 0.42},${py + 20} Z`} fill={s.accent} {...kst(7)} strokeLinejoin="round" />
            </Vol>
          );
        })}
        {/* body */}
        <Vol shape={<ellipse cx={0} cy={by} rx={bw} ry={bh} />}>
          <ellipse cx={0} cy={by} rx={bw} ry={bh} fill={B} />
          <ellipse cx={20} cy={by + 54} rx={bw * 0.78} ry={bh * 0.46} fill={s.belly} />
          {s.spots && [[-90, by - 50, 20], [-30, by - 70, 15], [40, by - 56, 18], [-130, by - 4, 13], [96, by - 30, 12]].map(([sx, sy, sr], i) => <circle key={i} cx={sx} cy={sy} r={sr} fill={s.spots} />)}
          <ellipse cx={0} cy={by} rx={bw} ry={bh} fill="none" {...st} />
        </Vol>
        <Leg x={-bw * 0.36} hipY={by + 46} len={-by - 46} w={62} a={-legA} fill={B} />
        <Leg x={bw * 0.6} hipY={by + 46} len={-by - 46} w={62} a={legA} fill={B} />
        {/* neck + head */}
        {neck ? (
          <g>
            <Vol>
              <path d={`M ${bw * 0.42},${by - 70} C ${bw * 0.7},${by - 180} ${bw * 0.72},${by - 300} ${bw * 0.98},${by - 360} L ${bw * 1.34},${by - 330} C ${bw * 1.06},${by - 260} ${bw * 1.0},${by - 120} ${bw * 0.94},${by + 10} Z`} fill={B} {...st} />
            </Vol>
            <path d={`M ${bw * 0.86},${by - 40} C ${bw * 0.9},${by - 140} ${bw * 0.92},${by - 240} ${bw * 1.1},${by - 320}`} fill="none" stroke={s.belly} strokeWidth={22} strokeLinecap="round" opacity={0.9} />
            <g transform={`translate(${bw * 1.2},${by - 390})`}>
              <Head {...headProps} r={92} />
            </g>
          </g>
        ) : s.kind === 'tops' ? (
          <g transform={`translate(${bw * 0.96},${by - 22})`}>
            {/* frill: a scalloped fan behind the head (shows as a crescent up + back) */}
            <Vol>
              <g>
                {Array.from({ length: 11 }).map((_, i) => {
                  const a = ((150 + i * 21) * Math.PI) / 180;
                  return <circle key={i} cx={-44 + Math.cos(a) * 146} cy={-58 + Math.sin(a) * 146} r={30} fill={s.accent} {...kst(7)} />;
                })}
                <circle cx={-44} cy={-58} r={150} fill={s.accent} />
              </g>
            </Vol>
            {[160, 195, 230, 265, 300].map((a, i) => (
              <circle key={i} cx={-44 + Math.cos((a * Math.PI) / 180) * 112} cy={-58 + Math.sin((a * Math.PI) / 180) * 112} r={13} fill="#ffffff" opacity={0.6} />
            ))}
            <Head {...headProps} r={112} />
            {/* brow horns + nose horn */}
            {[[-26, -104], [40, -100]].map(([hx, hy], i) => (
              <Vol key={i}><path d={`M ${hx - 15},${hy + 12} Q ${hx - 2},${hy - 84} ${hx + 44},${hy - 108} Q ${hx + 24},${hy - 46} ${hx + 17},${hy + 8} Z`} fill="#fff3d6" {...kst(6)} /></Vol>
            ))}
            <Vol><path d="M 96,-22 Q 126,-70 146,-70 Q 134,-34 116,-2 Z" fill="#fff3d6" {...kst(6)} /></Vol>
          </g>
        ) : (
          <g transform={`translate(${bw * 0.98},${by - 4})`}>
            <Head {...headProps} r={96} />
          </g>
        )}
      </g>
    );
  } else {
    // baby — a hatchling in its half shell
    groundW = 90;
    body = (
      <g>
        <g transform={`translate(-58,-150) rotate(${-40 - armWave})`}>
          <Vol kind="tube"><rect x={-13} y={-8} width={26} height={60} rx={13} fill={B} {...kst(6)} /></Vol>
        </g>
        <g transform={`translate(58,-150) rotate(${40 + armWave})`}>
          <Vol kind="tube"><rect x={-13} y={-8} width={26} height={60} rx={13} fill={B} {...kst(6)} /></Vol>
        </g>
        <Vol><ellipse cx={0} cy={-110} rx={70} ry={76} fill={B} {...st} /></Vol>
        <ellipse cx={8} cy={-96} rx={40} ry={50} fill={s.belly} />
        <g transform="translate(6,-206)">
          {[[-72, -44], [-56, -86]].map(([sx, sy], i) => (
            <path key={i} d={`M ${sx - 12},${sy + 8} Q ${sx - 16},${sy - 20} ${sx + 8},${sy - 14} Z`} fill={s.accent} {...kst(5)} />
          ))}
          <Head {...headProps} r={96} />
        </g>
        {/* the half shell (front) */}
        <Vol>
          <path d="M -96,-90 L -70,-70 L -48,-96 L -24,-70 L 0,-98 L 24,-70 L 48,-96 L 70,-70 L 96,-90 C 100,-30 70,6 0,6 C -70,6 -100,-30 -96,-90 Z" fill="#fff6e4" {...kst(7)} strokeLinejoin="round" />
        </Vol>
        {[[-50, -40, 12], [30, -54, 9], [56, -24, 10]].map(([sx, sy, sr], i) => <circle key={i} cx={sx} cy={sy} r={sr} fill={s.spots ?? s.accent} opacity={0.75} />)}
      </g>
    );
  }

  return (
    <g transform={`translate(${x},${y}) scale(${scale * facing},${scale})`}>
      <K3DDefs />
      {shadow && <Ground rx={groundW} ry={20} lift={hop} />}
      <g transform={`translate(0,${-hop + bob - bounce}) scale(${1 + squash * 0.08},${1 - squash * 0.14})`}>{body}</g>
    </g>
  );
};

// ── props ──────────────────────────────────────────────────────────────────────────────────────────
// a spotted dino egg (origin = bottom centre, ~120 × 150 at s=1). crack 0..1 draws the zig-zag crack; wobble = deg
export const DinoEgg: React.FC<{ c?: string; spots?: string; crack?: number; wobble?: number; s?: number }> = ({ c = '#fff6e4', spots = '#8ac926', crack = 0, wobble = 0, s = 1 }) => (
  <g transform={`scale(${s}) rotate(${wobble} 0 0)`}>
    <Vol>
      <path d="M 0,-150 C 52,-150 64,-60 62,-38 C 60,-8 32,4 0,4 C -32,4 -60,-8 -62,-38 C -64,-60 -52,-150 0,-150 Z" fill={c} {...kst(7)} />
    </Vol>
    {[[-24, -96, 13], [20, -112, 10], [26, -56, 15], [-30, -40, 9], [0, -136, 7]].map(([sx, sy, sr], i) => <circle key={i} cx={sx} cy={sy} r={sr} fill={spots} opacity={0.85} />)}
    <ellipse cx={-26} cy={-112} rx={10} ry={20} fill="#ffffff" opacity={0.6} transform="rotate(-18 -26 -112)" />
    {crack > 0 && (
      <path
        d={`M -58,-74 L -38,-${84 + crack * 8} L -18,-70 L 2,-${90 + crack * 10} L 22,-70 L 42,-${86 + crack * 8} L 60,-72`}
        fill="none"
        {...kst(6)}
        strokeDasharray={`${crack * 300} 400`}
      />
    )}
  </g>
);

// a nest "ten frame": 2 rows × 5 egg cups; the first n cups hold eggs (origin = centre of the frame)
export const EggNest: React.FC<{ n: number; label?: string; eggs?: (i: number) => React.ReactNode; s?: number; glow?: boolean }> = ({ n, label, eggs, s = 1, glow = false }) => {
  const cell = 120;
  return (
    <g transform={`scale(${s})`}>
      <Vol kind="slope">
        <rect x={-cell * 2.5 - 34} y={-cell - 26} width={cell * 5 + 68} height={cell * 2 + 52} rx={56} fill="#c98f5f" {...kst(8)} />
      </Vol>
      {/* twigs */}
      {Array.from({ length: 14 }).map((_, i) => (
        <path key={i} d={`M ${-cell * 2.5 - 30 + i * 46},${-cell - 20 + (i % 2) * 6} l 40,${((i % 3) - 1) * 8}`} stroke="#8d5a3b" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
      ))}
      {glow && <rect x={-cell * 2.5 - 34} y={-cell - 26} width={cell * 5 + 68} height={cell * 2 + 52} rx={56} fill="none" stroke="#ffd166" strokeWidth={14} opacity={0.9} />}
      {Array.from({ length: 10 }).map((_, i) => {
        const cx = (i % 5 - 2) * cell;
        const cy = (Math.floor(i / 5) - 0.5) * cell;
        return (
          <g key={i} transform={`translate(${cx},${cy})`}>
            <ellipse cx={0} cy={18} rx={48} ry={34} fill="#8d5a3b" {...kst(5)} />
            <ellipse cx={0} cy={14} rx={36} ry={22} fill="#5e3a22" />
            {i < n && <g transform="translate(0,30) scale(0.62)">{eggs ? eggs(i) : <DinoEgg />}</g>}
          </g>
        );
      })}
      {label && (
        <g transform={`translate(${cell * 2.5 + 40},${-cell - 30})`}>
          <circle r={50} fill="#ffca3a" {...kst(7)} />
          <text y={18} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={52} fill={KINK}>{label}</text>
        </g>
      )}
    </g>
  );
};

// a 3-toed dino footprint (origin = centre)
export const Footprint: React.FC<{ c?: string; s?: number; rot?: number }> = ({ c = '#8d5a3b', s = 1, rot = 0 }) => (
  <g transform={`rotate(${rot}) scale(${s})`}>
    <ellipse cx={0} cy={14} rx={34} ry={30} fill={c} />
    {[-32, 0, 32].map((dx, i) => <ellipse key={i} cx={dx} cy={-30 - (i === 1 ? 10 : 0)} rx={13} ry={24} fill={c} transform={`rotate(${dx * 0.6} ${dx} -30)`} />)}
  </g>
);

// a rounded grey number stone (origin = bottom centre, ~200 wide)
// hiFirst: the first digit in yellow (the "one group of ten" in 11-19)
export const NumStone: React.FC<{ n: string; c?: string; ink?: string; s?: number; hiFirst?: boolean }> = ({ n, c = '#b8c0cc', ink = KINK, s = 1, hiFirst = false }) => (
  <g transform={`scale(${s})`}>
    <Vol>
      <path d="M -100,0 C -116,-60 -90,-150 -10,-160 C 70,-168 118,-110 106,-40 C 100,-8 80,0 60,0 Z" fill={c} {...kst(8)} />
    </Vol>
    <text x={2} y={-46} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={92} fill="#ffffff" stroke={ink} strokeWidth={9} paintOrder="stroke">
      {hiFirst && n.length > 1 ? <><tspan fill="#ffca3a">{n[0]}</tspan>{n.slice(1)}</> : n}
    </text>
  </g>
);

// ── the set ────────────────────────────────────────────────────────────────────────────────────────
// DINO VALLEY: warm sky, far mountains + a friendly volcano with a soft puff, palms, ferns, a lake, grass.
export const DinoValley: React.FC<{ w?: number; h?: number; t?: number; floor: number }> = ({ w = 1920, h = 1080, t = 0, floor }) => {
  const f = floor;
  return (
    <g>
      <defs>
        <linearGradient id="dvSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fd3ff" />
          <stop offset="0.65" stopColor="#c8f0ff" />
          <stop offset="1" stopColor="#fff1c9" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#dvSky)" />
      <Sun x={w * 0.86} y={h * 0.16} r={70} t={t} />
      {/* soft clouds */}
      {[[0.2, 0.14, 1], [0.55, 0.1, 0.8]].map(([cx, cy, cs], i) => (
        <g key={i} transform={`translate(${((cx * w + t * 12 * (i + 1)) % (w + 300)) - 150},${cy * h}) scale(${cs})`}>
          <Vol>
            <path d="M -110,30 Q -130,-10 -80,-20 Q -60,-70 0,-60 Q 50,-90 90,-40 Q 140,-40 130,10 Q 130,30 100,30 Z" fill="#ffffff" {...kst(5)} />
          </Vol>
        </g>
      ))}
      {/* far mountains + the friendly volcano */}
      <path d={`M 0,${f - 150} L ${w * 0.12},${f - 330} L ${w * 0.24},${f - 190} L ${w * 0.34},${f - 280} L ${w * 0.46},${f - 160} L 0,${f - 160} Z`} fill="#a3c4f3" opacity={0.75} />
      <g transform={`translate(${w * 0.66},${f - 140})`}>
        {[0, 1, 2].map((i) => {
          const p = ((t * 0.18 + i / 3) % 1);
          return <circle key={i} cx={Math.sin(p * 6 + i) * 18} cy={-330 - p * 170} r={30 + p * 40} fill="#ffffff" opacity={0.75 * (1 - p)} />;
        })}
        <Vol kind="slope">
          <path d="M -320,140 L -70,-300 L 70,-300 L 320,140 Z" fill="#b08968" {...kst(7)} strokeLinejoin="round" />
        </Vol>
        <path d="M -70,-300 Q 0,-322 70,-300 Q 40,-250 0,-262 Q -40,-250 -70,-300 Z" fill="#ff924c" {...kst(5)} />
        <path d="M -40,-270 Q -60,-180 -90,-120 M 30,-268 Q 50,-200 80,-150" fill="none" stroke="#ff924c" strokeWidth={14} strokeLinecap="round" opacity={0.8} />
      </g>
      {/* bushes / ferns on the horizon */}
      {Array.from({ length: 11 }).map((_, i) => (
        <Vol key={i}><circle cx={i * 190 - 30} cy={f - 30} r={90 + (i % 3) * 26} fill={i % 2 ? '#52b788' : '#40916c'} /></Vol>
      ))}
      {/* palms */}
      {[[w * 0.06, 1.05, 0], [w * 0.95, 0.95, 1.5]].map(([px, ps, ph], i) => (
        <g key={i} transform={`translate(${px},${f}) scale(${ps})`}>
          <Vol kind="tube"><path d="M -24,0 Q -40,-200 10,-420 L 40,-416 Q -6,-200 20,0 Z" fill="#a0673c" {...kst(6)} /></Vol>
          {[-160, -120, -75, -30, 15].map((a, k) => (
            <path key={k} d="M 0,0 Q 120,-60 240,30 Q 120,-14 0,0 Z" fill={k % 2 ? '#2d9a5a' : '#52b788'} {...kst(5)} transform={`translate(26,-418) rotate(${a + 90 + Math.sin(t * 0.8 + k + ph) * 3})`} />
          ))}
        </g>
      ))}
      {/* ground */}
      <Vol kind="slope"><rect x={0} y={f} width={w} height={h - f} fill="#8fd16a" /></Vol>
      <line x1={0} y1={f} x2={w} y2={f} {...kst(7)} />
      {/* ferns + flowers in the grass */}
      {[[0.16, 0], [0.42, 1], [0.6, 2], [0.88, 1]].map(([fx, k], i) => (
        <g key={i} transform={`translate(${fx * w},${f + 40 + (i % 2) * 34})`}>
          {[-40, -15, 15, 40].map((a) => <path key={a} d="M 0,0 Q 10,-40 0,-70" fill="none" stroke="#2d9a5a" strokeWidth={8} strokeLinecap="round" transform={`rotate(${a})`} />)}
          <circle cy={-6} r={10} fill={['#ff6fa5', '#ffca3a', '#b388ff'][k]} />
        </g>
      ))}
      <AO cx={w * 0.5} cy={f + 4} rx={w * 0.5} ry={10} o={0.35} />
    </g>
  );
};
