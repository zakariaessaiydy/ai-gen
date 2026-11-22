// PAPERDOC · ROUGH — hand-drawn (crayon / marker) shapes for the drawn-documentary engine.
// rough.js (MIT) turns any shape into sketchy strokes; we render its paths as plain SVG so
// everything stays frame-deterministic in Remotion.
//
// "Line boil": hand-drawn animation redraws every drawing a few times a second, so the lines
// wobble slightly even when nothing moves. boilSeed(frame) changes the rough.js seed every
// BOIL frames — that one trick is most of the "drawn by hand" feeling.
import React, { useMemo } from 'react';
import rough from 'roughjs';
import type { Options } from 'roughjs/bin/core';

export const INK = '#2b2620';
export const CRAYON = {
  ink: INK,
  red: '#d2453a',
  orange: '#ee8a2e',
  yellow: '#f2c230',
  green: '#4f9a4a',
  teal: '#2f8a86',
  blue: '#3f6fc4',
  purple: '#7d55b8',
  pink: '#e77fa6',
  brown: '#8a5a35',
  skin: '#f3c9a0',
  money: '#6fae5a',
  paper: '#f4ecd8',
  paperDark: '#e6d9bb',
  white: '#fffdf6',
} as const;

const GEN = rough.generator();
export const BOIL = 4; // frames per redraw (≈7.5 drawings a second at 30 fps)
export const boilSeed = (frame: number, base = 1) => base * 97 + Math.floor(frame / BOIL) * 13 + 1;

export type RoughOpts = Options;
export const DEFAULT: Options = {
  roughness: 1.4,
  bowing: 1.2,
  strokeWidth: 4,
  stroke: INK,
  fillStyle: 'hachure', // crayon-like scribble fill
  hachureGap: 7,
  fillWeight: 2.6,
  hachureAngle: -41,
};

type Shape =
  | { k: 'rect'; x: number; y: number; w: number; h: number }
  | { k: 'circle'; x: number; y: number; d: number }
  | { k: 'ellipse'; x: number; y: number; w: number; h: number }
  | { k: 'line'; x1: number; y1: number; x2: number; y2: number }
  | { k: 'path'; d: string }
  | { k: 'poly'; pts: [number, number][] }
  | { k: 'curve'; pts: [number, number][] };

const draw = (s: Shape, o: Options) => {
  switch (s.k) {
    case 'rect':
      return GEN.rectangle(s.x, s.y, s.w, s.h, o);
    case 'circle':
      return GEN.circle(s.x, s.y, s.d, o);
    case 'ellipse':
      return GEN.ellipse(s.x, s.y, s.w, s.h, o);
    case 'line':
      return GEN.line(s.x1, s.y1, s.x2, s.y2, o);
    case 'path':
      return GEN.path(s.d, o);
    case 'poly':
      return GEN.polygon(s.pts, o);
    case 'curve':
      return GEN.curve(s.pts, o);
  }
};

// One rough shape → SVG paths. `seed` makes it deterministic; pass boilSeed(frame, n) to boil.
export const Rough: React.FC<{ shape: Shape; seed: number; o?: Options; opacity?: number }> = ({ shape, seed, o, opacity }) => {
  const key = JSON.stringify(shape) + '|' + seed + '|' + JSON.stringify(o ?? {});
  const paths = useMemo(() => GEN.toPaths(draw(shape, { ...DEFAULT, ...o, seed })), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <g opacity={opacity}>
      {paths.map((p, i) => (
        <path key={i} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill={p.fill ?? 'none'} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </g>
  );
};

// convenience wrappers
export const RRect: React.FC<{ x: number; y: number; w: number; h: number; seed: number; o?: Options }> = ({ x, y, w, h, seed, o }) => (
  <Rough shape={{ k: 'rect', x, y, w, h }} seed={seed} o={o} />
);
export const RCircle: React.FC<{ x: number; y: number; d: number; seed: number; o?: Options }> = ({ x, y, d, seed, o }) => (
  <Rough shape={{ k: 'circle', x, y, d }} seed={seed} o={o} />
);
export const REllipse: React.FC<{ x: number; y: number; w: number; h: number; seed: number; o?: Options }> = ({ x, y, w, h, seed, o }) => (
  <Rough shape={{ k: 'ellipse', x, y, w, h }} seed={seed} o={o} />
);
export const RLine: React.FC<{ x1: number; y1: number; x2: number; y2: number; seed: number; o?: Options }> = ({ x1, y1, x2, y2, seed, o }) => (
  <Rough shape={{ k: 'line', x1, y1, x2, y2 }} seed={seed} o={o} />
);
export const RPath: React.FC<{ d: string; seed: number; o?: Options }> = ({ d, seed, o }) => <Rough shape={{ k: 'path', d }} seed={seed} o={o} />;
export const RPoly: React.FC<{ pts: [number, number][]; seed: number; o?: Options }> = ({ pts, seed, o }) => <Rough shape={{ k: 'poly', pts }} seed={seed} o={o} />;
export const RCurve: React.FC<{ pts: [number, number][]; seed: number; o?: Options }> = ({ pts, seed, o }) => <Rough shape={{ k: 'curve', pts }} seed={seed} o={o} />;

// Crayon texture: a soft paper-tooth breakup over strokes. Mount <CrayonDefs/> once per SVG,
// then wrap drawings in <g filter="url(#crayon)">.
export const CrayonDefs: React.FC<{ id?: string; seed?: number }> = ({ id = 'crayon', seed = 3 }) => (
  <defs>
    <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={2.2} xChannelSelector="R" yChannelSelector="G" result="d" />
      <feComponentTransfer in="n" result="tooth">
        <feFuncA type="discrete" tableValues="1 1 1 0.75 1 1 0.85 1" />
      </feComponentTransfer>
      <feComposite in="d" in2="tooth" operator="in" />
    </filter>
  </defs>
);
