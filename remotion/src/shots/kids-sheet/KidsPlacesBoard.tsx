// QA board for the PAINTED PLACES (lib/kids/places.tsx + media/library/backgrounds/): every place at
// 16:9 with Mila + Bobo standing on FLOOR, fx running — checks scale, the floor line and the style
// match between the vector cast and the paintings. Frame it after adding a background.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO, MILA } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR } from '../../lib/kids/sets';
import { Backdrop, PLACE_IDS } from '../../lib/kids/places';
import { FONT_TOON, useT } from '../../lib/kids/kit';

export const compositionConfig = { id: 'KidsPlacesBoard', durationInSeconds: 4, fps: 30, width: 1920, height: 1080 };

const W = 1920;
const H = 1080;
const f = FLOOR(H);
const COLS = 6;

export default function KidsPlacesBoard() {
  const t = useT();
  const cw = 1920 / COLS; // the board canvas is 1920 wide
  const ch = cw * (H / W);
  return (
    <AbsoluteFill style={{ background: '#3b2a4a' }}>
      {PLACE_IDS.map((p, i) => (
        <div key={p} style={{ position: 'absolute', left: (i % COLS) * cw, top: Math.floor(i / COLS) * (ch + 36) + 20, width: cw, textAlign: 'center' }}>
          <svg width={cw - 8} height={ch - 4} viewBox={`0 0 ${W} ${H}`}>
            <Backdrop place={p} w={W} h={H} t={t} />
            <Kid spec={MILA} x={760} y={f} scale={0.6} expr="happy" armL="wave" />
            <Critter spec={BOBO} x={1160} y={f} scale={0.56} expr="laugh" />
          </svg>
          <div style={{ fontFamily: FONT_TOON, fontWeight: 700, fontSize: 24, color: '#ffffff', marginTop: -4 }}>{p}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
}
