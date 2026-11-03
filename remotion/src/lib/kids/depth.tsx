// KIDS KIT — the 3D LOOK (user request after Day 33: "make the kids videos 3D"). The rigs stay the
// same SVG rigs (every pose, expression, prop and episode keeps working); this file turns their flat
// fills into soft "vinyl toy" volumes, the look of the big 3D kids channels:
//   · <Vol>      shades the shapes inside it like lit 3D objects — a specular hot spot top-left, the
//                base colour, a cool core shadow bottom-right, a little bounce light on the rim — and
//                thins their outline (CG has no thick ink line). kind="tube" for arms/legs/stems.
//   · <Ground>   a soft contact shadow under a character (blurred, not a flat ellipse).
//   · <AO>       ambient occlusion: the soft dark where two volumes touch (under the head, the belly).
//   · K3DDefs    the shared gradients; the rigs and KidsStage render them, so any SVG root works.
// One switch: KIDS_3D = false brings back the flat 2D look everywhere (no episode code changes).
// Light comes from the TOP-LEFT, front — keep new highlights there so a scene reads as one light.
import React from 'react';
import { KINK } from './face';

export const KIDS_3D = true;
const OUTLINE = 0.62; // outline width multiplier inside <Vol> (CG-style thin silhouette line)
const SH = '#24123a'; // core-shadow tint: a cool plum, so shade reads as colour, never as grey dirt
const SH_SKIN = '#6e1f35'; // skin shades warm (light scatters red under skin) — tone="skin"

// ball + tube in one shadow tone (ids k3d-ball / k3d-tube, and k3d-ball-skin / k3d-tube-skin)
const toneDefs = (sh: string, suffix: string) => (
  <>
    {/* a sphere lit from the top-left: hot spot → base colour → core shadow → bounce on the rim */}
    <radialGradient id={`k3d-ball${suffix}`} cx="0.42" cy="0.38" r="0.72" fx="0.3" fy="0.24">
      <stop offset="0" stopColor="#ffffff" stopOpacity={0.62} />
      <stop offset="0.12" stopColor="#ffffff" stopOpacity={0.26} />
      <stop offset="0.34" stopColor="#ffffff" stopOpacity={0} />
      <stop offset="0.58" stopColor={sh} stopOpacity={0.07} />
      <stop offset="0.88" stopColor={sh} stopOpacity={0.36} />
      <stop offset="1" stopColor={sh} stopOpacity={0.26} />
    </radialGradient>
    {/* a cylinder across its width (arms, legs, stems) — nearly symmetric, so mirrored or rotated
        limbs still read as lit from the front */}
    <linearGradient id={`k3d-tube${suffix}`} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor={sh} stopOpacity={0.28} />
      <stop offset="0.3" stopColor="#ffffff" stopOpacity={0.26} />
      <stop offset="0.5" stopColor="#ffffff" stopOpacity={0.04} />
      <stop offset="0.82" stopColor={sh} stopOpacity={0.22} />
      <stop offset="1" stopColor={sh} stopOpacity={0.38} />
    </linearGradient>
  </>
);

export const K3DDefs: React.FC = () =>
  KIDS_3D ? (
    <defs>
      {toneDefs(SH, '')}
      {toneDefs(SH_SKIN, '-skin')}
      {/* big soft shapes (hills, ground, capes): light from the top, shade towards the bottom */}
      <linearGradient id="k3d-slope" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity={0.32} />
        <stop offset="0.28" stopColor="#ffffff" stopOpacity={0} />
        <stop offset="1" stopColor={SH} stopOpacity={0.24} />
      </linearGradient>
      {/* the floor plane: lighter where it meets the horizon, deeper towards the camera */}
      <linearGradient id="k3d-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity={0.18} />
        <stop offset="0.35" stopColor="#ffffff" stopOpacity={0} />
        <stop offset="1" stopColor={SH} stopOpacity={0.2} />
      </linearGradient>
      {/* an indoor wall: lit from a window top-left, falling off into the corners */}
      <radialGradient id="k3d-room" cx="0.3" cy="0.2" r="0.95">
        <stop offset="0" stopColor="#ffffff" stopOpacity={0.16} />
        <stop offset="0.45" stopColor="#ffffff" stopOpacity={0} />
        <stop offset="1" stopColor={SH} stopOpacity={0.22} />
      </radialGradient>
      {/* a sheen across glass / a chalkboard */}
      <linearGradient id="k3d-board" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity={0.14} />
        <stop offset="0.4" stopColor="#ffffff" stopOpacity={0} />
        <stop offset="1" stopColor={SH} stopOpacity={0.22} />
      </linearGradient>
      <radialGradient id="k3d-ground">
        <stop offset="0" stopColor="#28143c" stopOpacity={0.4} />
        <stop offset="0.55" stopColor="#28143c" stopOpacity={0.2} />
        <stop offset="1" stopColor="#28143c" stopOpacity={0} />
      </radialGradient>
      <radialGradient id="k3d-ao">
        <stop offset="0" stopColor={SH} stopOpacity={0.34} />
        <stop offset="1" stopColor={SH} stopOpacity={0} />
      </radialGradient>
      <radialGradient id="k3d-blush">
        <stop offset="0" stopColor="#ff7f9f" stopOpacity={0.85} />
        <stop offset="0.6" stopColor="#ff8fab" stopOpacity={0.45} />
        <stop offset="1" stopColor="#ff8fab" stopOpacity={0} />
      </radialGradient>
      {/* the upper lid's shadow on a glossy eyeball */}
      <linearGradient id="k3d-eye" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={SH} stopOpacity={0.3} />
        <stop offset="0.32" stopColor={SH} stopOpacity={0} />
        <stop offset="0.85" stopColor={SH} stopOpacity={0} />
        <stop offset="1" stopColor={SH} stopOpacity={0.1} />
      </linearGradient>
    </defs>
  ) : null;

type El = React.ReactElement<Record<string, any>>;
const SHAPES = new Set(['ellipse', 'circle', 'path', 'rect', 'polygon']);

// walk the intrinsic SVG tree under `node` (custom components such as <Face> are left untouched)
const walk = (node: React.ReactNode, fill: string | undefined, fn: (el: El, fill: string | undefined) => React.ReactNode): React.ReactNode =>
  React.Children.map(node, (c) => {
    if (!React.isValidElement(c)) return null;
    const el = c as El;
    return fn(el, el.props.fill ?? fill);
  });

// the base drawing with every ink outline thinned (groups recurse; coloured strokes — a strap, a
// shoe stripe — keep their width)
const thin = (node: React.ReactNode): React.ReactNode =>
  walk(node, undefined, (el) => {
    const sw = el.props.strokeWidth;
    const ink = el.props.stroke === KINK || el.props.stroke === undefined;
    const extra = typeof sw === 'number' && ink ? { strokeWidth: sw * OUTLINE } : {};
    if (el.type === 'g' || el.type === React.Fragment) return React.cloneElement(el, extra, thin(el.props.children));
    return typeof el.type === 'string' ? React.cloneElement(el, extra) : el;
  });

// the shading pass: the same silhouettes, painted with a light/shadow gradient instead of colour
const shade = (node: React.ReactNode, paint: string, inherited: string | undefined): React.ReactNode =>
  walk(node, inherited, (el, fill) => {
    if (el.type === 'g') {
      if (fill === 'none') return null;
      return React.cloneElement(el, { fill: paint, stroke: 'none', filter: undefined }, shade(el.props.children, paint, fill));
    }
    if (el.type === React.Fragment) return <>{shade(el.props.children, paint, fill)}</>;
    if (typeof el.type !== 'string' || !SHAPES.has(el.type)) return null;
    // skip see-through decoration (shines, patches drawn with opacity) and stroke-only line art
    if (fill === 'none' || el.props.opacity !== undefined) return null;
    return React.cloneElement(el, { fill: paint, stroke: 'none', strokeWidth: undefined, opacity: undefined });
  });

export type VolKind = 'ball' | 'tube' | 'slope';

// <Vol> — "make this 3D". Wrap solid shapes (a head, a torso, an apple, a hill). Pass `shape` when the
// group has inner details (stripes, a badge) that should sit UNDER one shared shading of the outline.
// tone="skin" = warm shadows for skin (ball/tube only).
export const Vol: React.FC<{ children: React.ReactNode; kind?: VolKind; tone?: 'skin'; shape?: React.ReactNode; flat?: boolean }> = ({ children, kind = 'ball', tone, shape, flat }) => {
  if (!KIDS_3D || flat) return <>{children}</>;
  const id = `k3d-${kind}${tone && kind !== 'slope' ? `-${tone}` : ''}`;
  return (
    <>
      {thin(children)}
      <g>{shade(shape ?? children, `url(#${id})`, undefined)}</g>
    </>
  );
};

// soft contact shadow on the floor (origin = between the feet). `lift` = hop height in px.
export const Ground: React.FC<{ rx: number; ry: number; lift?: number; cy?: number }> = ({ rx, ry, lift = 0, cy = 6 }) => {
  const k = 1 - Math.min(0.5, lift / 600);
  if (!KIDS_3D) return <ellipse cx={0} cy={cy} rx={rx * k} ry={ry} fill="rgba(40,20,60,0.16)" />;
  return <ellipse cx={0} cy={cy} rx={rx * 1.25 * k} ry={ry * 1.5 * k} fill="url(#k3d-ground)" opacity={0.6 + 0.4 * k} />;
};

// ambient occlusion: a soft dark pool where one volume sits on another
export const AO: React.FC<{ cx: number; cy: number; rx: number; ry: number; o?: number }> = ({ cx, cy, rx, ry, o = 1 }) =>
  KIDS_3D ? <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#k3d-ao)" opacity={o} /> : null;
