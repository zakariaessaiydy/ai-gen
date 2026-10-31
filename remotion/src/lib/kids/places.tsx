// KIDS KIT — PAINTED PLACES. The hand-made sets in sets.tsx are drawn in code; these are painted
// soft-3D backgrounds (media/library/backgrounds/, listed in its catalog.json) for the places the
// calendar needs beyond the meadow and the classroom: beach, farm, jungle, rainy street, camp, cave,
// space, kitchen, library, party… Same contract as a set: <Backdrop place="beach" w h t /> goes first
// inside KidsStage, characters stand on FLOOR(h), and the place's ambient fx (rain, fireflies, birds…)
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
