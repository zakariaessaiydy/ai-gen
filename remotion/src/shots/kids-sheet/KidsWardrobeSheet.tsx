// TINY SPARKS · WARDROBE SHEET (1080x1920) — every outfit in cast/wardrobe.tsx on the four cast members,
// one row per outfit. The QA board for the wardrobe and the reference for picking an outfit
// (→ kids-shorts/tiny-sparks/wardrobe.png).
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { dress, OUTFITS, type Who } from '../../lib/kids/cast/wardrobe';
import { FONT_TOON } from '../../lib/kids/kit';
import { K3DDefs } from '../../lib/kids/depth';
import { KINK } from '../../lib/kids/face';

export const compositionConfig = { id: 'KidsWardrobeSheet', durationInSeconds: 2, fps: 30, width: 1080, height: 1920 };

const WHO: Who[] = ['mila', 'leo', 'bobo', 'hoot'];
const ROW_H = 222;
const TOP = 150;
const COLS = [330, 520, 710, 900];
const FILLS = ['#d6f0ff', '#fff3c4', '#e9f5c9', '#ffe3ec'];

export default function KidsWardrobeSheet() {
  return (
    <AbsoluteFill style={{ background: '#fff8e7' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <K3DDefs />
        <text x={540} y={92} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={78} fill="#ffca3a" stroke={KINK} strokeWidth={12} paintOrder="stroke">
          WARDROBE
        </text>
        {OUTFITS.map((o, r) => {
          const y0 = TOP + r * ROW_H;
          const feet = y0 + ROW_H - 18;
          return (
            <g key={o}>
              <rect x={20} y={y0 + 6} width={1040} height={ROW_H - 12} rx={28} fill={FILLS[r % FILLS.length]} />
              <text x={130} y={y0 + ROW_H / 2 + 14} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={40} fill={KINK}>
                {o}
              </text>
              {WHO.map((w, c) => {
                if (w === 'mila' || w === 'leo') {
                  const d = dress(w, o);
                  return <Kid key={w} spec={d.spec} wear={d.wear} x={COLS[c]} y={feet} scale={0.235} idle={false} blink={false} />;
                }
                const d = dress(w, o);
                return <Critter key={w} spec={d.spec} wear={d.wear} x={COLS[c]} y={feet} scale={0.27} idle={false} blink={false} />;
              })}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
}
