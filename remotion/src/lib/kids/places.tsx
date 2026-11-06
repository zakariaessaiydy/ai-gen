// KIDS KIT — PAINTED PLACES. The hand-made sets in sets.tsx are drawn in code; these are painted
// soft-3D backgrounds (media/library/backgrounds/, listed in its catalog.json) for the places the
// calendar needs beyond the meadow and the classroom: beach, farm, jungle, rainy street, camp, cave,
// space, kitchen, library, party… Same contract as a set: <Backdrop place="beach" w h t /> goes first
// inside KidsStage, characters stand on standY(place, x, w, h) (the painting's measured floor), and the place's ambient fx (rain, fireflies, birds…)
// are drawn on top in code, so a still painting never reads as a frozen frame.
import React, { useEffect, useState } from 'react';
import { cancelRender, continueRender, delayRender, staticFile } from 'remotion';
import catalog from '../../../../media/library/backgrounds/catalog.json';
import { AirTwinkles, Birds, Butterflies, FLOOR } from './sets';

export type PlaceFx = 'butterflies' | 'birds' | 'twinkles' | 'stars' | 'motes' | 'fireflies' | 'rain' | 'snow' | 'bubbles' | 'leaves';
type PlaceEntry = { wide: string[]; tall: string[]; fx: string[]; use: string };
const PLACES = catalog.places as Record<string, PlaceEntry>;
export type Place = keyof typeof catalog.places;
export const PLACE_IDS = Object.keys(PLACES) as Place[];

// the file for a stage shape: the matching orientation if the place has one, else a centre crop of
// the other (wide image in a tall frame keeps its middle third — fine for most places until the real
// 9:16 file is painted; see catalog.json)
export const placeFile = (place: Place, w: number, h: number, variant = 0): string => {
  const p = PLACES[place];
  const [want, other] = w > h ? [p.wide, p.tall] : [p.tall, p.wide];
  const list = want.length ? want : other;
  return list[Math.min(variant, list.length - 1)];
};

// ── STAND ON THE FLOOR (user request, Nov 2026: "put the characters always on the floor").
// Every painting has a measured floor (catalog.json "floors": where the CLEAR floor starts in its left /
// middle / right third, below counters, beds, plants…). standY() = the y a character's feet should go at
// stage x: the usual FLOOR(h) when that is already on clear floor, lower when the painting has furniture
// there (a counter coming down to 0.94 in the kitchen's corners), never below the usable bottom.
// halfW = half the character's footprint in stage px (≈150 * scale for a Kid, 140 * scale for a Critter).
//   <Kid x={x} y={standY('kitchen', x, W, H, { halfW: 150 * s })} scale={s} … />
const FLOORS = (catalog as unknown as { floors: Record<string, number[]> }).floors;
export const standY = (place: Place, x: number, w: number, h: number, o: { variant?: number; halfW?: number; margin?: number } = {}): number => {
  const file = placeFile(place, w, h, o.variant ?? 0);
  const fl = FLOORS[file];
  if (!fl) return FLOOR(h);
  const [iw, ih] = file.includes('-916') ? [768, 1376] : [1376, 768];
  const sc = Math.max(w / iw, h / ih); // cover fit, centred (preserveAspectRatio slice)
  const ox = (w - iw * sc) / 2;
  const oy = (h - ih * sc) / 2;
  const toU = (sx: number) => (sx - ox) / (iw * sc);
  const halfW = o.halfW ?? 0;
  const u0 = toU(x - halfW);
  const u1 = toU(x + halfW);
  const zones: [number, number, number][] = [[-1, 0.3, fl[0]], [0.3, 0.7, fl[1]], [0.7, 2, fl[2]]];
  const top = Math.max(...zones.filter(([a, b]) => u1 > a && u0 < b).map(([, , v]) => v)); // the whole footprint on clear floor
  // the painting's usable bottom — and never below the visible frame (a crop can cut the painting's bottom off)
  const bottom = Math.min(fl[3] ?? 0.97, (h * 0.985 - oy) / (ih * sc));
  const usual = (FLOOR(h) - oy) / (ih * sc);
  const v = Math.min(bottom, Math.max(usual, top + (o.margin ?? 0.02)));
  return Math.round(oy + v * ih * sc);
};

// the painting must be decoded before the frame is captured (an SVG <image> is not awaited by
// Remotion the way <Img> is). Loading only — every animated value below is still a pure function of t.
const useImageReady = (src: string) => {
  const [handle] = useState(() => delayRender(`backdrop ${src}`));
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      img.decode().catch(() => undefined).finally(() => continueRender(handle));
    };
    img.onerror = () => cancelRender(new Error(`Backdrop: cannot load ${src}`));
    img.src = src;
  }, [src, handle]);
};

const hash = (i: number, s = 1) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ── AMBIENT FX — slow, soft, never strobing (kids content) ───────────────────────────────────────

// rain: thin slanted streaks falling on a loop + little splash rings on the ground
export const Rain: React.FC<{ t: number; w: number; h: number; floor: number; n?: number }> = ({ t, w, h, floor, n = 70 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const sp = 0.9 + hash(i, 2) * 0.5; // screens per second
      const y = ((t * sp + hash(i, 3)) % 1) * (h + 200) - 100;
      const x = hash(i, 1) * (w + 200) - 100 - y * 0.18;
      const len = 34 + hash(i, 4) * 30;
      return <line key={i} x1={x} y1={y} x2={x - len * 0.18} y2={y + len} stroke="#ffffff" strokeWidth={3 + hash(i, 5) * 2} strokeLinecap="round" opacity={0.35 + hash(i, 6) * 0.25} />;
    })}
    {Array.from({ length: 8 }).map((_, i) => {
      const p = (t * 0.9 + hash(i, 7)) % 1;
      const x = hash(i, 8) * w;
      const y = floor + (h - floor) * (0.15 + hash(i, 9) * 0.7);
      return <ellipse key={`s${i}`} cx={x} cy={y} rx={10 + p * 46} ry={3 + p * 12} fill="none" stroke="#ffffff" strokeWidth={3} opacity={(1 - p) * 0.5} />;
    })}
  </g>
);

// fireflies: warm glowing dots drifting on slow loops, pulsing softly
export const Fireflies: React.FC<{ t: number; w: number; y0: number; y1: number; n?: number; c?: string }> = ({ t, w, y0, y1, n = 12, c = '#fff59d' }) => (
  <g>
    <defs>
      <radialGradient id="kFirefly">
        <stop offset="0" stopColor={c} stopOpacity={0.9} />
        <stop offset="0.35" stopColor={c} stopOpacity={0.35} />
        <stop offset="1" stopColor={c} stopOpacity={0} />
      </radialGradient>
    </defs>
    {Array.from({ length: n }).map((_, i) => {
      const ph = t * (0.12 + hash(i, 1) * 0.1) + hash(i, 2) * 6.28;
      const x = w * (0.05 + 0.9 * hash(i, 3)) + Math.sin(ph * 2.1) * 60;
      const y = y0 + (y1 - y0) * hash(i, 4) + Math.cos(ph * 1.7) * 40;
      const o = 0.35 + 0.65 * Math.max(0, Math.sin(t * 1.3 + i * 1.7));
      return (
        <g key={i} opacity={o}>
          <circle cx={x} cy={y} r={30} fill="url(#kFirefly)" />
          <circle cx={x} cy={y} r={5} fill="#ffffff" />
        </g>
      );
    })}
  </g>
);

// motes: tiny dust specks floating up through indoor light
export const Motes: React.FC<{ t: number; w: number; h: number; n?: number; c?: string }> = ({ t, w, h, n = 22, c = '#fff6d6' }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const p = (t * (0.025 + hash(i, 1) * 0.03) + hash(i, 2)) % 1;
      const x = w * hash(i, 3) + Math.sin(t * 0.6 + i) * 24;
      const y = h * (0.85 - p * 0.75);
      return <circle key={i} cx={x} cy={y} r={3 + hash(i, 4) * 4} fill={c} opacity={Math.sin(p * Math.PI) * 0.7} />;
    })}
  </g>
);

// snow: soft round flakes drifting down and swaying
export const Snow: React.FC<{ t: number; w: number; h: number; n?: number }> = ({ t, w, h, n = 45 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const y = ((t * (0.05 + hash(i, 2) * 0.05) + hash(i, 3)) % 1) * (h + 60) - 30;
      const x = hash(i, 1) * w + Math.sin(t * 0.8 + i) * 30;
      return <circle key={i} cx={x} cy={y} r={4 + hash(i, 4) * 7} fill="#ffffff" opacity={0.6 + hash(i, 5) * 0.35} />;
    })}
  </g>
);

// bubbles: rings rising from the floor, wobbling
export const RisingBubbles: React.FC<{ t: number; w: number; h: number; floor: number; n?: number }> = ({ t, w, h, floor, n = 16 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const p = (t * (0.06 + hash(i, 2) * 0.05) + hash(i, 3)) % 1;
      const x = hash(i, 1) * w + Math.sin(t * 2 + i) * 14;
      const y = floor - p * (floor + 80);
      const r = 8 + hash(i, 4) * 16;
      return (
        <g key={i} opacity={Math.min(1, (1 - p) * 3) * 0.7}>
          <circle cx={x} cy={y} r={r} fill="#ffffff" fillOpacity={0.12} stroke="#ffffff" strokeWidth={3} />
          <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.22} fill="#ffffff" />
        </g>
      );
    })}
  </g>
);

// leaves: autumn leaves tumbling down
export const Leaves: React.FC<{ t: number; w: number; h: number; n?: number }> = ({ t, w, h, n = 12 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const y = ((t * (0.06 + hash(i, 2) * 0.04) + hash(i, 3)) % 1) * (h + 80) - 40;
      const x = hash(i, 1) * w + Math.sin(t * 1.1 + i) * 60;
      const c = ['#ff924c', '#ffca3a', '#e85d4a', '#f4a259'][i % 4];
      return (
        <g key={i} transform={`translate(${x},${y}) rotate(${t * 60 * (i % 2 ? 1 : -1) + i * 40}) scale(${0.8 + hash(i, 4) * 0.6})`}>
          <path d="M 0,-18 Q 14,-6 0,18 Q -14,-6 0,-18 Z" fill={c} />
          <path d="M 0,-14 L 0,16" stroke="#a0522d" strokeWidth={2} opacity={0.6} />
        </g>
      );
    })}
  </g>
);

const Fx: React.FC<{ fx: PlaceFx; t: number; w: number; h: number; floor: number }> = ({ fx, t, w, h, floor }) => {
  const wide = w > h;
  switch (fx) {
    case 'butterflies':
      return <Butterflies t={t} box={[w * 0.06, h * (wide ? 0.3 : 0.38), w * 0.94, floor - h * 0.1]} n={2} s={wide ? 0.8 : 0.9} />;
    case 'birds':
      return <Birds t={t} w={w} y={h * (wide ? 0.1 : 0.08)} />;
    case 'twinkles':
      return <AirTwinkles t={t} w={w} y0={h * 0.08} y1={h * 0.5} n={wide ? 7 : 6} />;
    case 'stars':
      return <AirTwinkles t={t * 0.8} w={w} y0={h * 0.03} y1={h * 0.35} n={wide ? 9 : 7} c="#fff3b0" />;
    case 'motes':
      return <Motes t={t} w={w} h={h} />;
    case 'fireflies':
      return <Fireflies t={t} w={w} y0={h * 0.35} y1={floor} />;
    case 'rain':
      return <Rain t={t} w={w} h={h} floor={floor} />;
    case 'snow':
      return <Snow t={t} w={w} h={h} />;
    case 'bubbles':
      return <RisingBubbles t={t} w={w} h={h} floor={floor} />;
    case 'leaves':
      return <Leaves t={t} w={w} h={h} />;
    default:
      return null;
  }
};

// <Backdrop place="beach" w={W} h={H} t={t} /> — the painting cover-fitted to the stage + its fx.
// fx={false} for a calm beat (or when the episode COUNTS things in the air); fx={['rain']} to pick.
// dim (0–1) darkens it a touch to push a busy painting back behind teaching cards.
export const Backdrop: React.FC<{ place: Place; w?: number; h?: number; t?: number; variant?: number; fx?: boolean | PlaceFx[]; dim?: number }> = ({
  place, w = 1080, h = 1920, t = 0, variant = 0, fx = true, dim = 0,
}) => {
  const src = staticFile(`library/backgrounds/${placeFile(place, w, h, variant)}`);
  useImageReady(src);
  const floor = FLOOR(h);
  const list = (fx === true ? PLACES[place].fx : fx === false ? [] : fx) as PlaceFx[];
  return (
    <g>
      <image href={src} x={0} y={0} width={w} height={h} preserveAspectRatio="xMidYMid slice" />
      {dim > 0 && <rect width={w} height={h} fill="#24123a" opacity={dim * 0.5} />}
      {list.map((k) => <Fx key={k} fx={k} t={t} w={w} h={h} floor={floor} />)}
    </g>
  );
};

// ── SCENE LIGHT (user request, Nov 2026: "add the scene light to the characters") ──────────────────
// Characters take the painting's light so they sit IN the place, not on top of it: a colour tint (cool at
// night, golden on the beach, warm in a kitchen) + a soft rim of light on the side the light comes from.
// Wrap the WORLD layer (characters + their props) — never captions, PopText or teaching cards:
//   <Backdrop place="kitchen" w={W} h={H} t={t} />
//   <PlaceLight place="kitchen">{…characters…}</PlaceLight>
export type SceneLight = {
  tint: [number, number, number]; // per-channel multiply, 1 = unchanged
  rim: string; // rim-light colour
  rimO: number; // rim strength 0..1
  dir: [number, number]; // where the light comes FROM (screen direction); the rim is on that side
};
const L = (tint: [number, number, number], rim: string, rimO: number, dir: [number, number]): SceneLight => ({ tint, rim, rimO, dir });
const SUN = L([1.04, 1.0, 0.92], '#fff3c4', 0.8, [0.6, -1]); // outdoor sunshine
const SOFT_SUN = L([1.02, 1.0, 0.95], '#fff6d8', 0.65, [0.3, -1]); // open sky, gentler
const LEAFY = L([1.0, 1.02, 0.92], '#f4ffc9', 0.7, [0.3, -1]); // sun through leaves
const NIGHT = L([0.8, 0.85, 1.02], '#ffd59e', 0.7, [-1, -0.35]); // a warm lamp / fire in a cool night
const WARM_IN = L([1.03, 0.99, 0.93], '#fff0d0', 0.65, [0, -1]); // cosy room, window/ceiling light
const COOL_IN = L([0.98, 1.0, 1.04], '#eef6ff', 0.6, [0, -1]); // bright clinical / tech room
const SPACE = L([0.86, 0.88, 1.04], '#c9e6ff', 0.75, [0.6, -1]);
const WATER = L([0.88, 0.98, 1.05], '#d6fbff', 0.7, [0, -1]);
export const PLACE_LIGHT: Record<Place, SceneLight> = {
  meadow: SUN, farm: SUN, beach: SUN, 'tropical-island': SUN, park: SUN, zoo: SUN, schoolyard: SUN, 'dino-valley': SUN,
  'construction-site': SUN, 'bus-station': SOFT_SUN, 'train-station': SOFT_SUN, airport: SOFT_SUN, market: SOFT_SUN, greenhouse: SOFT_SUN,
  forest: LEAFY, jungle: LEAFY,
  'rainy-street': L([0.9, 0.93, 1.03], '#eaf2ff', 0.55, [0, -1]),
  'camp-night': L([0.8, 0.84, 1.0], '#ffc58a', 0.75, [1, -0.3]), bedroom: NIGHT, cave: L([0.94, 0.92, 1.04], '#e9d6ff', 0.65, [0, -1]),
  'space-moon': SPACE, spaceship: SPACE, planetarium: SPACE,
  underwater: WATER, aquarium: WATER,
  kitchen: WARM_IN, bakery: WARM_IN, cafe: WARM_IN, classroom: WARM_IN, playroom: WARM_IN, library: WARM_IN, 'music-room': WARM_IN,
  'art-room': WARM_IN, party: WARM_IN, 'ice-cream-shop': WARM_IN, 'sweet-shop': WARM_IN, 'flower-shop': WARM_IN, 'pet-shop': WARM_IN,
  'post-office': WARM_IN, 'fire-station': WARM_IN, supermarket: WARM_IN,
  clinic: COOL_IN, 'science-lab': COOL_IN, 'police-station': COOL_IN,
};

export const PlaceLight: React.FC<{ place: Place; children: React.ReactNode; on?: boolean; rimW?: number; light?: SceneLight }> = ({ place, children, on = true, rimW = 9, light }) => {
  const l = light ?? PLACE_LIGHT[place];
  if (!on || !l) return <>{children}</>;
  const id = `plight-${place}`;
  const [r, g, b] = l.tint;
  return (
    <g>
      <defs>
        <filter id={id} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values={`${r} 0 0 0 0  0 ${g} 0 0 0  0 0 ${b} 0 0  0 0 0 1 0`} result="tint" />
          <feOffset in="SourceAlpha" dx={-l.dir[0] * rimW} dy={-l.dir[1] * rimW} result="off" />
          <feComposite in="SourceAlpha" in2="off" operator="out" result="edge" />
          <feGaussianBlur in="edge" stdDeviation={rimW * 0.45} result="edgeB" />
          <feComposite in="edgeB" in2="SourceAlpha" operator="in" result="edgeIn" />
          <feFlood floodColor={l.rim} floodOpacity={l.rimO} />
          <feComposite in2="edgeIn" operator="in" result="rimC" />
          <feMerge>
            <feMergeNode in="tint" />
            <feMergeNode in="rimC" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#${id})`}>{children}</g>
    </g>
  );
};
