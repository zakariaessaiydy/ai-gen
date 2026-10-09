// KIDS KIT — the shared FACE (eyes, brows, mouth, cheeks) used by <Kid> and <Critter>, so every
// character on a kids channel emotes the same way. Big glossy eyes + rosy cheeks + a soft ink
// (not black) outline: the "preschool cartoon" look that reads at phone size.
import React from 'react';

export const KINK = '#3b2a4a'; // soft plum ink — friendlier than black
export const kst = (w = 8) => ({ stroke: KINK, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });

export type KExpr =
  | 'smile' // default: soft closed smile
  | 'happy' // ^^ eyes + big open smile
  | 'laugh' // ^^ eyes + huge mouth
  | 'wow' // sparkly wide eyes + O mouth
  | 'think' // eyes up-side, mouth to one side
  | 'sad' // tilted brows, little frown
  | 'surprised' // wide eyes, raised brows, small o
  | 'sleepy' // half lids
  | 'wink' // one eye ^
  | 'oops' // worried brows, wobbly mouth
  | 'proud'; // closed-eye smug smile, chin up

type Cfg = { lid: number; happy?: boolean; wide?: number; brow: number; browTilt: number; sparkle?: boolean; wink?: boolean };
const CFG: Record<KExpr, Cfg> = {
  smile: { lid: 0, brow: 0, browTilt: 0 },
  happy: { lid: 0, happy: true, brow: -6, browTilt: 0 },
  laugh: { lid: 0, happy: true, brow: -10, browTilt: 0 },
  wow: { lid: 0, wide: 1.12, brow: -22, browTilt: 0, sparkle: true },
  think: { lid: 0.15, brow: -8, browTilt: 8 },
  sad: { lid: 0.2, brow: 4, browTilt: -16 },
  surprised: { lid: 0, wide: 1.15, brow: -26, browTilt: 0 },
  sleepy: { lid: 0.62, brow: 4, browTilt: 0 },
  wink: { lid: 0, brow: -4, browTilt: 0, wink: true },
  oops: { lid: 0.1, brow: -6, browTilt: -14 },
  proud: { lid: 0, happy: true, brow: -2, browTilt: 4 },
};

// mouth shape for an expression + lip-sync openness 0..1
const Mouth: React.FC<{ expr: KExpr; open: number; y: number; w: number; tongue?: string }> = ({ expr, open, y, w, tongue = '#ff7aa2' }) => {
  const o = Math.max(0, Math.min(1, open));
  const big = expr === 'laugh' || expr === 'happy';
  if (expr === 'wow' || expr === 'surprised') {
    const r = (expr === 'wow' ? 26 : 18) + o * 10;
    return <ellipse cx={0} cy={y + 6} rx={r * 0.8} ry={r} fill="#7a2d4a" {...kst(7)} />;
  }
  if (o < 0.08 && !big) {
    if (expr === 'sad') return <path d={`M ${-w * 0.5},${y + 14} Q 0,${y - 10} ${w * 0.5},${y + 14}`} fill="none" {...kst(8)} />;
    if (expr === 'think') return <path d={`M ${-w * 0.1},${y + 4} Q ${w * 0.35},${y + 14} ${w * 0.6},${y - 6}`} fill="none" {...kst(8)} />;
    if (expr === 'oops')
      return <path d={`M ${-w * 0.5},${y + 6} q ${w * 0.25},-12 ${w * 0.5},0 t ${w * 0.5},0`} fill="none" {...kst(8)} />;
    if (expr === 'sleepy') return <ellipse cx={0} cy={y + 4} rx={10} ry={7} fill="#7a2d4a" {...kst(6)} />;
    return <path d={`M ${-w * 0.55},${y - 4} Q 0,${y + 30} ${w * 0.55},${y - 4}`} fill="none" {...kst(8)} />;
  }
  // worried / sad talking: a small round mouth, never a happy D
  if (expr === 'sad' || expr === 'oops' || expr === 'sleepy') {
    return <ellipse cx={0} cy={y + 8} rx={w * 0.22 + o * 6} ry={8 + o * 16} fill="#7a2d4a" {...kst(6)} />;
  }
  // open smile: D shape whose depth follows the voice
  const d = (big ? 46 : 18) + o * 34;
  const ww = big ? w * 0.75 : w * 0.55;
  return (
    <g>
      <path d={`M ${-ww},${y - 6} Q 0,${y - 14} ${ww},${y - 6} Q ${ww * 0.8},${y + d} 0,${y + d} Q ${-ww * 0.8},${y + d} ${-ww},${y - 6} Z`} fill="#7a2d4a" {...kst(7)} />
      <clipPath id={`m${Math.round(ww)}${Math.round(d)}`}>
        <path d={`M ${-ww},${y - 6} Q 0,${y - 14} ${ww},${y - 6} Q ${ww * 0.8},${y + d} 0,${y + d} Q ${-ww * 0.8},${y + d} ${-ww},${y - 6} Z`} />
      </clipPath>
      <g clipPath={`url(#m${Math.round(ww)}${Math.round(d)})`}>
        <ellipse cx={0} cy={y + d} rx={ww * 0.6} ry={d * 0.45} fill={tongue} />
        <rect x={-ww} y={y - 14} width={ww * 2} height={12} fill="#ffffff" />
      </g>
    </g>
  );
};

// One eye. r = eye radius. Glossy: dark iris, two white highlights.
const Eye: React.FC<{ x: number; y: number; r: number; look: [number, number]; lid: number; happy?: boolean; iris: string; wide: number; sparkle?: boolean; blinkClosed?: boolean; lidColor: string }> = ({
  x, y, r, look, lid, happy, iris, wide, sparkle, blinkClosed, lidColor,
}) => {
  if (happy || blinkClosed) {
    return <path d={`M ${x - r * 0.8},${y + (blinkClosed ? 2 : 6)} Q ${x},${y - r * (blinkClosed ? 0.1 : 0.75)} ${x + r * 0.8},${y + (blinkClosed ? 2 : 6)}`} fill="none" {...kst(9)} />;
  }
  const rx = r * 0.78 * wide;
  const ry = r * wide;
  const px = x + look[0] * r * 0.28;
  const py = y + look[1] * r * 0.28;
  const id = `eye${Math.round(x)}_${Math.round(y)}_${Math.round(r)}`;
  return (
    <g>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#ffffff" {...kst(7)} />
      <clipPath id={id}>
        <ellipse cx={x} cy={y} rx={rx} ry={ry} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <circle cx={px} cy={py + r * 0.08} r={r * 0.62} fill={iris} />
        {/* glossy iris: a lighter lower crescent + pupil + three highlights (the "sparkly toon eye") */}
        <ellipse cx={px} cy={py + r * 0.44} rx={r * 0.46} ry={r * 0.22} fill="#ffffff" opacity={0.28} />
        <circle cx={px} cy={py + r * 0.1} r={r * 0.36} fill="#1d1426" />
        <circle cx={px - r * 0.2} cy={py - r * 0.2} r={r * 0.24} fill="#ffffff" />
        <circle cx={px + r * 0.24} cy={py + r * 0.3} r={r * 0.1} fill="#ffffff" />
        <circle cx={px + r * 0.12} cy={py - r * 0.34} r={r * 0.07} fill="#ffffff" opacity={0.85} />
        {sparkle && <path d={`M ${px + r * 0.25},${py - r * 0.42} l 6,14 14,6 -14,6 -6,14 -6,-14 -14,-6 14,-6 Z`} fill="#ffffff" />}
        {lid > 0 && <rect x={x - rx - 4} y={y - ry - 4} width={rx * 2 + 8} height={ry * 2 * lid + 4} fill={lidColor} />}
      </g>
      {lid > 0 && <line x1={x - rx} y1={y - ry + ry * 2 * lid} x2={x + rx} y2={y - ry + ry * 2 * lid} {...kst(7)} />}
    </g>
  );
};

export type FaceProps = {
  expr: KExpr;
  look?: [number, number];
  mouth?: number;
  blink?: boolean; // closed this frame
  skin: string; // eyelid colour
  iris?: string;
  eyeR?: number;
  eyeDX?: number;
  eyeY?: number;
  mouthY?: number;
  mouthW?: number;
  cheeks?: boolean;
  brows?: string | false; // brow colour, or false for none (animals)
  nose?: React.ReactNode; // species nose (critters) — default kid button nose
  lashes?: boolean;
  freckles?: boolean;
};

export const Face: React.FC<FaceProps> = ({
  expr, look = [0, 0], mouth = 0, blink = false, skin, iris = '#6b4226', eyeR = 40, eyeDX = 66, eyeY = 0, mouthY = 70, mouthW = 50,
  cheeks = true, brows = KINK, nose, lashes, freckles,
}) => {
  const c = CFG[expr];
  const lk: [number, number] = expr === 'think' ? [0.7, -0.8] : look;
  const wide = c.wide ?? 1;
  return (
    <g>
      {cheeks && (
        <g>
          <ellipse cx={-eyeDX - 18} cy={eyeY + 52} rx={32} ry={19} fill="#ff8fab" opacity={0.68} />
          <ellipse cx={eyeDX + 18} cy={eyeY + 52} rx={32} ry={19} fill="#ff8fab" opacity={0.68} />
          <circle cx={-eyeDX - 28} cy={eyeY + 46} r={5} fill="#ffffff" opacity={0.7} />
          <circle cx={eyeDX + 8} cy={eyeY + 46} r={5} fill="#ffffff" opacity={0.7} />
        </g>
      )}
      {freckles && (
        <g fill="#c98a5e">
          {[-1, 1].map((s) => [0, 1, 2].map((i) => <circle key={`${s}${i}`} cx={s * (eyeDX + 4 + i * 12)} cy={eyeY + 44 + (i % 2) * 8} r={4} />))}
        </g>
      )}
      <Eye x={-eyeDX} y={eyeY} r={eyeR} look={lk} lid={c.lid} happy={c.happy} iris={iris} wide={wide} sparkle={c.sparkle} blinkClosed={blink} lidColor={skin} />
      <Eye x={eyeDX} y={eyeY} r={eyeR} look={lk} lid={c.lid} happy={c.happy || c.wink} iris={iris} wide={wide} sparkle={c.sparkle} blinkClosed={blink && !c.wink} lidColor={skin} />
      {lashes && !c.happy && !blink && (
        <g {...kst(6)}>
          <path d={`M ${-eyeDX - eyeR * 0.7},${eyeY - eyeR * 0.6} l -16,-12`} />
          <path d={`M ${eyeDX + eyeR * 0.7},${eyeY - eyeR * 0.6} l 16,-12`} />
        </g>
      )}
      {brows !== false && (
        <g stroke={brows} strokeWidth={10} strokeLinecap="round" fill="none">
          <path d={`M ${-eyeDX - 26},${eyeY - eyeR - 22 + c.brow - c.browTilt * 0.5} Q ${-eyeDX},${eyeY - eyeR - 34 + c.brow} ${-eyeDX + 26},${eyeY - eyeR - 22 + c.brow + c.browTilt * 0.5}`} />
          <path d={`M ${eyeDX - 26},${eyeY - eyeR - 22 + c.brow + c.browTilt * 0.5} Q ${eyeDX},${eyeY - eyeR - 34 + c.brow} ${eyeDX + 26},${eyeY - eyeR - 22 + c.brow - c.browTilt * 0.5}`} />
        </g>
      )}
      {nose ?? <path d={`M -8,${eyeY + 34} Q 0,${eyeY + 44} 8,${eyeY + 34}`} fill="none" {...kst(7)} />}
      <Mouth expr={expr} open={mouth} y={mouthY} w={mouthW} />
    </g>
  );
};

// ── shared BEHAVIOUR (Kid + Critter): characters are never statues. A slow idle sway + head tilt,
// a head-bob while talking, a happy bounce on 'laugh', and twinkles on 'wow' / 'proud'. All
// gentle (≤ 2.5° / ≤ 12 px) so a pose set by the episode still reads exactly as authored.
export const idleMotion = (frame: number, seed: number, expr: KExpr, mouth: number, moving: boolean) => {
  const sway = moving ? 0 : Math.sin((frame + seed) / 22) * 1.4;
  const tilt = Math.sin((frame + seed * 3) / 31) * 2.2 + (mouth > 0.08 ? Math.sin(frame / 3.1) * mouth * 3 : 0);
  const nod = mouth > 0.08 ? -mouth * 7 : 0;
  const bounce = !moving && expr === 'laugh' ? Math.abs(Math.sin((frame + seed) / 5)) * 10 : 0;
  return { sway, tilt, nod, bounce };
};

// 4-point twinkle star
export const Twinkle: React.FC<{ x: number; y: number; s: number; c?: string; o?: number }> = ({ x, y, s, c = '#ffffff', o = 1 }) => (
  <path
    d="M 0,-30 Q 4,-4 30,0 Q 4,4 0,30 Q -4,4 -30,0 Q -4,-4 0,-30 Z"
    transform={`translate(${x},${y}) scale(${s})`}
    fill={c}
    stroke={KINK}
    strokeWidth={4 / Math.max(0.2, s)}
    opacity={o}
  />
);

// twinkles that circle a happy head (wow / proud) — r = head radius in rig px
export const HeadSparkles: React.FC<{ frame: number; r: number; on: boolean }> = ({ frame, r, on }) => {
  if (!on) return null;
  return (
    <g>
      {[0, 1, 2].map((i) => {
        const ph = ((frame / 30) * 1.2 + i / 3) % 1;
        const a = -2.4 + i * 1.2;
        const s = Math.sin(ph * Math.PI);
        return <Twinkle key={i} x={Math.cos(a) * (r + 40)} y={Math.sin(a) * (r + 30) - 20} s={0.5 + s * 0.6} c={['#ffd166', '#ffffff', '#ff8fab'][i]} o={s} />;
      })}
    </g>
  );
};
