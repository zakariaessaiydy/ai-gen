// Model sheet for the TINY SPARKS kids channel — the locked cast, Mila's expressions, the
// animal lineup the Critter rig can play. Render it into kids-shorts/tiny-sparks/character.png.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Kid } from '../../lib/kids/kid';
import { Critter, type Species } from '../../lib/kids/critter';
import { BOBO, HOOT, LEO, MILA, CHANNEL } from '../../lib/kids/cast/tiny-sparks';
import { FONT_TOON } from '../../lib/kids/kit';
import { KINK } from '../../lib/kids/face';
import type { KExpr } from '../../lib/kids/face';

export const compositionConfig = { id: 'KidsModelSheet', durationInSeconds: 2, fps: 30, width: 1080, height: 1920 };

const EXPRS: KExpr[] = ['smile', 'happy', 'wow', 'think', 'sad', 'surprised', 'laugh', 'oops'];
const ZOO: [Species, string, string, string][] = [
  ['bunny', '#f8f9fa', '#ffe5ec', '#adb5bd'],
  ['cat', '#ffb26b', '#fff1e0', '#d9772b'],
  ['fox', '#ff8c42', '#ffffff', '#7a3b12'],
  ['lion', '#ffc857', '#fff1c1', '#d2691e'],
  ['mouse', '#c9cdd4', '#f1f3f5', '#868e96'],
  ['panda', '#ffffff', '#ffffff', '#2b2d42'],
  ['pig', '#ffb3c6', '#ffd6e0', '#e5738f'],
  ['frog', '#8ac926', '#e9f5c9', '#4f7d17'],
];

const label = (x: number, y: number, s: string, size = 34) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={size} fill={KINK}>
    {s}
  </text>
);

export default function KidsModelSheet() {
  return (
    <AbsoluteFill style={{ background: '#fff7e6' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <text x={540} y={110} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={96} fill="#ffca3a" stroke={KINK} strokeWidth={14} paintOrder="stroke">
          {CHANNEL.name.toUpperCase()}
        </text>
        {label(540, 165, 'the locked cast', 36)}
        {/* main cast */}
        <rect x={20} y={190} width={1040} height={640} rx={36} fill="#d6f0ff" />
        <Kid spec={MILA} x={180} y={760} scale={0.66} expr="happy" armL="wave" armR="hip" />
        <Kid spec={LEO} x={440} y={760} scale={0.66} expr="smile" armL="hip" armR="point" />
        <Critter spec={BOBO} x={690} y={760} scale={0.62} expr="laugh" armL="wave" armR="down" />
        <Critter spec={HOOT} x={910} y={760} scale={0.62} expr="smile" armL="down" armR="point" />
        {label(180, 810, 'MILA')}
        {label(440, 810, 'LEO')}
        {label(690, 810, 'BOBO')}
        {label(910, 810, 'PROF. HOOT')}
        {/* expressions */}
        {EXPRS.map((e, i) => {
          const x = 140 + (i % 4) * 267;
          const y = 1090 + Math.floor(i / 4) * 300;
          return (
            <g key={e}>
              <clipPath id={`cell${i}`}>
                <rect x={x - 120} y={y - 220} width={240} height={250} rx={24} />
              </clipPath>
              <rect x={x - 120} y={y - 220} width={240} height={250} rx={24} fill="#ffffff" stroke="#f1d9b5" strokeWidth={4} />
              <g clipPath={`url(#cell${i})`}>
                <Kid spec={i % 2 ? LEO : MILA} x={x} y={y - 100 + 534 * 0.5} scale={0.5} expr={e} shadow={false} blink={false} />
              </g>
              {label(x, y + 70, e, 32)}
            </g>
          );
        })}
        {/* counting hand + the zoo */}
        <rect x={20} y={1520} width={1040} height={380} rx={36} fill="#e9f5c9" />
        {ZOO.map(([sp, fur, fur2, dark], i) => {
          const x = 90 + i * 128;
          return (
            <g key={sp}>
              <Critter spec={{ id: sp, species: sp, fur, fur2, dark }} x={x} y={1830} scale={0.3} expr={i % 3 === 0 ? 'happy' : 'smile'} blink={false} />
              {label(x, 1880, sp, 26)}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
}
