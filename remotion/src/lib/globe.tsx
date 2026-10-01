// A real-outline Earth in orthographic projection — the "what if Earth…" niche kit.
// Countries are Natural Earth 110m (geo/world.ts), projected and horizon-clipped here, so the
// planet on screen is the planet, not a drawing of one. Ice is a pair of latitude caps whose
// edge `e` (degrees from the equator) slides between 90 (no ice) and 0 (everything frozen);
// every readout about ice and sunlight is that edge read back through a formula.
import React from 'react';
import { WORLD } from './geo/world';
import type { Country, Ring } from './geo/world';
import { inCountry } from './map';
import { FONT_BODY } from '../fonts';

const RAD = Math.PI / 180;

// ---------------------------------------------------------------------------------------------
// PHYSICS (the numbers the VO quotes)
// ---------------------------------------------------------------------------------------------
export const ALBEDO = { ocean: 0.06, snowIce: 0.8 } as const; // NSIDC: open ocean ~0.06, snow on sea ice ~0.8-0.9
// fraction of a sphere's surface poleward of latitude e, both hemispheres together
export const iceFraction = (e: number) => 1 - Math.sin(Math.max(0, Math.min(90, e)) * RAD);
// share of the sunlight reaching the ocean that the ocean keeps
export const oceanAbsorbs = (e: number) => {
  const ice = iceFraction(e);
  return (1 - ice) * (1 - ALBEDO.ocean) + ice * (1 - ALBEDO.snowIce);
};

// ---------------------------------------------------------------------------------------------
// PROJECTION
// ---------------------------------------------------------------------------------------------
export type View = { lon0: number; lat0: number; cx: number; cy: number; R: number };
type V3 = [number, number, number]; // x right, y up, z toward the viewer (unit sphere)

export const toView = (v: View, lon: number, lat: number): V3 => {
  const p = lat * RAD;
  const d = (lon - v.lon0) * RAD;
  const p0 = v.lat0 * RAD;
  return [
    Math.cos(p) * Math.sin(d),
    Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(d),
    Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(d),
  ];
};
// a point on the visible face (unit-disc coords, y up) back to lon/lat
export const fromView = (v: View, x: number, yUp: number): { lon: number; lat: number } => {
  const z = Math.sqrt(Math.max(0, 1 - x * x - yUp * yUp));
  const p0 = v.lat0 * RAD;
  const lat = Math.asin(Math.max(-1, Math.min(1, yUp * Math.cos(p0) + z * Math.sin(p0)))) / RAD;
  const lon = v.lon0 + Math.atan2(x, z * Math.cos(p0) - yUp * Math.sin(p0)) / RAD;
  return { lon: ((((lon + 180) % 360) + 360) % 360) - 180, lat };
};
const scr = (v: View, x: number, yUp: number) => `${(v.cx + x * v.R).toFixed(1)},${(v.cy - yUp * v.R).toFixed(1)}`;
const limbPt = (v: View, psi: number) => scr(v, Math.cos(psi), Math.sin(psi));
const angOf = (a: V3) => Math.atan2(a[1], a[0]);
const cross0 = (a: V3, b: V3): V3 => {
  const t = a[2] / (a[2] - b[2]);
  const x = a[0] + t * (b[0] - a[0]);
  const y = a[1] + t * (b[1] - a[1]);
  const n = Math.hypot(x, y) || 1;
  return [x / n, y / n, 0];
};
// limb arc from angle a to angle b going in direction dir (+1 ccw on screen-with-y-up)
const arc = (v: View, a: number, b: number, dir: 1 | -1): string[] => {
  let span = dir > 0 ? b - a : a - b;
  span = ((span % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const n = Math.max(1, Math.ceil(span / (4 * RAD)));
  return Array.from({ length: n + 1 }, (_, i) => limbPt(v, a + (dir * span * i) / n));
};

// A closed spherical ring, clipped to the visible hemisphere. Each hidden run is replaced by
// the limb arc between where the ring left the face and where it came back; `closeDir` picks
// that arc's direction (default: the shorter way round — right for anything smaller than a
// hemisphere).
const clipRing = (v: View, pts: V3[], closeDir?: (exitPsi: number, entryPsi: number) => 1 | -1): string | null => {
  const n = pts.length;
  if (n < 3) return null;
  const vis = pts.map((p) => p[2] > 0);
  if (vis.every((x) => !x)) return null;
  if (vis.every(Boolean)) return 'M' + pts.map((p) => scr(v, p[0], p[1])).join('L') + 'Z';
  // start on a hidden point so every visible run is contiguous
  const s = vis.findIndex((x) => !x);
  const out: string[] = [];
  let exitPsi: number | null = null;
  let firstEntry: number | null = null;
  for (let k = 0; k < n; k++) {
    const i = (s + k) % n;
    const j = (i + 1) % n;
    const a = pts[i];
    const b = pts[j];
    if (vis[i]) out.push(scr(v, a[0], a[1]));
    if (vis[i] !== vis[j]) {
      const c = cross0(a, b);
      const psi = angOf(c);
      if (!vis[i]) {
        // re-entering the face: close the hidden run along the limb
        if (exitPsi !== null) {
          const dir = closeDir ? closeDir(exitPsi, psi) : shorter(exitPsi, psi);
          out.push(...arc(v, exitPsi, psi, dir));
        } else firstEntry = psi;
        out.push(scr(v, c[0], c[1]));
      } else {
        out.push(scr(v, c[0], c[1]));
        exitPsi = psi;
      }
    }
  }
  if (exitPsi !== null && firstEntry !== null) {
    const dir = closeDir ? closeDir(exitPsi, firstEntry) : shorter(exitPsi, firstEntry);
    out.push(...arc(v, exitPsi, firstEntry, dir));
  }
  return out.length ? 'M' + out.join('L') + 'Z' : null;
};
const shorter = (a: number, b: number): 1 | -1 => {
  const d = (((b - a) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
  return d >= 0 ? 1 : -1;
};

export const ringPath = (v: View, ring: Ring): string | null => clipRing(v, ring.map(([lon, lat]) => toView(v, lon, lat)));
export const countryD = (v: View, c: Country): string =>
  c.rings
    .map((r) => ringPath(v, r))
    .filter(Boolean)
    .join(' ');

const discD = (v: View) =>
  `M${v.cx - v.R},${v.cy}a${v.R},${v.R} 0 1,0 ${2 * v.R},0a${v.R},${v.R} 0 1,0 ${-2 * v.R},0Z`;

// The visible part of the polar cap poleward of latitude e (north or south).
export const capD = (v: View, e: number, north: boolean): string | null => {
  if (e >= 89.9) return null;
  const sign = north ? 1 : -1;
  const edge = Math.max(0.05, e);
  const pts: V3[] = [];
  for (let lon = -180; lon < 180; lon += 3) pts.push(toView(v, lon, sign * edge));
  const pole = toView(v, 0, sign * 90);
  const vis = pts.map((p) => p[2] > 0);
  const ring = 'M' + pts.map((p) => scr(v, p[0], p[1])).join('L') + 'Z';
  if (vis.every(Boolean)) return pole[2] > 0 ? ring : `${discD(v)} ${ring}`;
  if (vis.every((x) => !x)) return pole[2] > 0 ? discD(v) : null;
  // a limb point is inside the cap if its latitude is past the edge
  const p0 = v.lat0 * RAD;
  const inside = (psi: number) => sign * Math.asin(Math.sin(psi) * Math.cos(p0)) / RAD > edge;
  const dirFor = (a: number, b: number): 1 | -1 => {
    const ccw = ((((b - a) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / 2;
    return inside(a + ccw) ? 1 : -1;
  };
  return clipRing(v, pts, dirFor);
};

// what the sunlight lands on at a point of the visible face
export type Surface = 'ocean' | 'ice' | 'land' | 'snow';
const LAND = WORLD.map((c) => {
  let x0 = 180, x1 = -180, y0 = 90, y1 = -90;
  c.rings.forEach((r) => r.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }));
  return { c, x0, x1, y0, y1 };
});
export const isLand = (lon: number, lat: number) =>
  LAND.some((b) => lon >= b.x0 && lon <= b.x1 && lat >= b.y0 && lat <= b.y1 && inCountry(b.c, lon, lat));
// land snow creeps from the poles: at snow s, land poleward of 90·(1−s) is white
export const snowLine = (snow: number) => 90 * (1 - snow);
export const isPermanentIce = (c: Country) => c.name === 'Antarctica' || c.name === 'Greenland';
export const surfaceAt = (lon: number, lat: number, e: number, snow: number): Surface => {
  if (isLand(lon, lat)) return Math.abs(lat) >= Math.min(snowLine(snow), 62) || snow > 0.98 ? 'snow' : 'land';
  return Math.abs(lat) >= e ? 'ice' : 'ocean';
};

// ---------------------------------------------------------------------------------------------
// DRAWING
// ---------------------------------------------------------------------------------------------
const hexMix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const k = Math.max(0, Math.min(1, t));
  return '#' + pa.map((x, i) => Math.round(x + (pb[i] - x) * k).toString(16).padStart(2, '0')).join('');
};
export { hexMix };

// The globe: ocean, sea-ice caps (edge e), land that snows over from the poles (snow 0..1).
export const Globe: React.FC<{ v: View; e: number; snow: number; oceanGlow?: number; id?: string }> = ({ v, e, snow, oceanGlow = 0, id = 'gl' }) => {
  const sl = snowLine(snow);
  const cold = iceFraction(e);
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-sea`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor={hexMix('#2f78c8', '#4aa3ff', oceanGlow)} />
          <stop offset="100%" stopColor="#0c2f63" />
        </radialGradient>
        <radialGradient id={`${id}-shade`} cx="34%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.16} />
          <stop offset="55%" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="100%" stopColor="#02040a" stopOpacity={0.6} />
        </radialGradient>
        <radialGradient id={`${id}-air`}>
          <stop offset="86%" stopColor={hexMix('#4aa3ff', '#cfeaff', cold)} stopOpacity={0.5} />
          <stop offset="100%" stopColor={hexMix('#4aa3ff', '#cfeaff', cold)} stopOpacity={0} />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <circle cx={v.cx} cy={v.cy} r={v.R} />
        </clipPath>
      </defs>
      <circle cx={v.cx} cy={v.cy} r={v.R * 1.16} fill={`url(#${id}-air)`} />
      <circle cx={v.cx} cy={v.cy} r={v.R} fill={`url(#${id}-sea)`} />
      <g clipPath={`url(#${id}-clip)`}>
        {e < 1 ? <circle cx={v.cx} cy={v.cy} r={v.R} fill="#e6f0f8" opacity={1 - e} /> : null}
        {[true, false].map((north) => {
          const d = capD(v, e, north);
          return d ? <path key={String(north)} d={d} fill="#e6f0f8" fillRule="evenodd" stroke="#a9d4f5" strokeWidth={3} strokeOpacity={Math.min(1, e / 6)} /> : null;
        })}
        {WORLD.map((c) => {
          const d = countryD(v, c);
          if (!d) return null;
          // a country whitens as the snow line passes its middle latitude
          const lats = c.rings.flat().map((p) => Math.abs(p[1]));
          const mid = lats.reduce((a, b) => a + b, 0) / lats.length;
          const w = isPermanentIce(c) ? 1 : Math.max(0, Math.min(1, (mid - sl + 12) / 12));
          const fill = hexMix(hexMix('#5f9e5a', '#b39a6a', Math.max(0, 1 - mid / 25) * 0.6), '#f3f7fb', w);
          return <path key={c.name} d={d} fill={fill} fillRule="evenodd" stroke={hexMix('#2e5a33', '#b9cfe0', w)} strokeWidth={1.2} strokeOpacity={0.6} />;
        })}
      </g>
      <circle cx={v.cx} cy={v.cy} r={v.R} fill={`url(#${id}-shade)`} />
      <circle cx={v.cx} cy={v.cy} r={v.R} fill="none" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={2} />
    </g>
  );
};

// Sunlight: streaks that land on the face and either sink in (warm glow) or bounce back to space,
// decided by what is under them the moment they arrive.
export type Ray = { x: number; y: number; phase: number }; // unit-disc hit point (y up) + cycle offset 0..1
export const SunRays: React.FC<{
  v: View;
  rays: Ray[];
  frame: number;
  period: number;
  surface: (lon: number, lat: number, f: number) => Surface;
  o?: number;
}> = ({ v, rays, frame, period, surface, o = 1 }) => {
  if (o <= 0.01) return null;
  const d = [0.55, -0.835]; // travelling down-right (y up)
  const IN = Math.round(period * 0.22);
  const OUT = Math.round(period * 0.3);
  return (
    <g opacity={o}>
      {rays.map((r, i) => {
        const t = (((frame / period + r.phase) % 1) + 1) % 1;
        const local = t * period;
        const hitF = frame - (local - IN);
        const hx = v.cx + r.x * v.R;
        const hy = v.cy - r.y * v.R;
        const g = fromView(v, r.x, r.y);
        const s = surface(g.lon, g.lat, Math.round(hitF));
        const bright = s === 'ice' || s === 'snow';
        if (local < IN) {
          const u = local / IN;
          const L = 300;
          const tipX = hx - d[0] * L * (1 - u);
          const tipY = hy + d[1] * L * (1 - u);
          return (
            <line key={i} x1={tipX - d[0] * 90} y1={tipY + d[1] * 90} x2={tipX} y2={tipY} stroke="#ffe08a" strokeWidth={6} strokeLinecap="round" opacity={Math.min(1, u * 2.5)} />
          );
        }
        const u = Math.min(1, (local - IN) / OUT);
        if (!bright) {
          return <circle key={i} cx={hx} cy={hy} r={10 + 26 * u} fill="#ffb14a" opacity={0.75 * (1 - u)} />;
        }
        // bounce: away from the surface, back up toward space
        const nx = r.x;
        const ny = r.y;
        let bx = nx * 1.0 - d[0] * 0.25;
        let by = ny * 1.0 - d[1] * 0.9;
        const n = Math.hypot(bx, by) || 1;
        bx /= n;
        by /= n;
        const L = 460 * u;
        const tx = hx + bx * L;
        const ty = hy - by * L;
        return (
          <g key={i}>
            <circle cx={hx} cy={hy} r={8 + 14 * u} fill="#ffffff" opacity={0.7 * (1 - u)} />
            <line x1={tx - bx * 90} y1={ty + by * 90} x2={tx} y2={ty} stroke="#fff6d6" strokeWidth={6} strokeLinecap="round" opacity={1 - u} />
          </g>
        );
      })}
    </g>
  );
};

// A volcano on the surface: a red vent and CO2 puffs rising (only while it faces us).
export const Volcano: React.FC<{ v: View; lon: number; lat: number; frame: number; o: number }> = ({ v, lon, lat, frame, o }) => {
  const p = toView(v, lon, lat);
  if (o <= 0.01 || p[2] < 0.12) return null;
  const x = v.cx + p[0] * v.R;
  const y = v.cy - p[1] * v.R;
  const vis = o * Math.min(1, (p[2] - 0.12) / 0.2);
  return (
    <g opacity={vis}>
      {[0, 1, 2].map((k) => {
        const u = ((frame / 36 + k / 3) % 1 + 1) % 1;
        return <circle key={k} cx={x + 10 * Math.sin(u * 5 + lon)} cy={y - 16 - 90 * u} r={9 + 18 * u} fill="#9aa3ad" opacity={0.55 * (1 - u)} />;
      })}
      <circle cx={x} cy={y} r={14} fill="#ff5a36" opacity={0.35} />
      <circle cx={x} cy={y} r={7} fill="#ff7a3d" />
    </g>
  );
};

// A label pill on the SVG canvas (for feedback-loop steps pinned around the globe).
export const LoopLabel: React.FC<{ x: number; y: number; text: string; color: string; o: number; pop?: number }> = ({ x, y, text, color, o, pop = 0 }) =>
  o > 0.01 ? (
    <g opacity={o} transform={`translate(${x} ${y}) scale(${1 + 0.1 * pop})`}>
      <rect x={-text.length * 9.6 - 18} y={-22} width={text.length * 19.2 + 36} height={44} rx={22} fill="#0b0e14" stroke={color} strokeOpacity={0.7} strokeWidth={2} />
      <text y={9} textAnchor="middle" fontFamily={FONT_BODY} fontWeight={600} fontSize={25} letterSpacing={2.5} fill={color}>
        {text}
      </text>
    </g>
  ) : null;
