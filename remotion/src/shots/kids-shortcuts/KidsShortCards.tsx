// Tiny Sparks SHORTS cut from the long videos — the TRANSPARENT overlay card of each Short (1080x1920).
// Frame i = the card of SHORTS[i] (shorts.gen.ts, written by tools/kids_shortcuts.py from
// kids-shorts/tiny-sparks/shortcuts.json): a channel ribbon + the 2-line hook title above the video window,
// and ink lines on the window's edges. The tool lays the long video's window (sharp) over a blurred copy of
// itself, then this card on top. Everything important sits above y=1500 (YouTube's UI covers the bottom).
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FONT_TOON } from '../../lib/kids/kit';
import { KINK } from '../../lib/kids/face';
import { SHORTS, WIN_TOP } from './shorts.gen';

export const compositionConfig = { id: 'KidsShortCards', durationInSeconds: 10, fps: 30, width: 1080, height: 1920 };

export default function KidsShortCards() {
  const i = useCurrentFrame();
  const d = SHORTS[i];
  if (!d) return null;
  const winH = Math.round((1080 * 1080) / d.w);
  const top = WIN_TOP + Math.round((1080 - winH) / 2);
  const size = d.size ?? 96;
  return (
    <AbsoluteFill>
      {/* channel ribbon */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 58, display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 330, height: 72, transform: 'rotate(-2deg)' }}>
          <svg width={330} height={72} style={{ position: 'absolute', inset: 0 }}>
            <path d="M 4,6 L 326,6 L 306,36 L 326,66 L 4,66 L 24,36 Z" fill="#ff595e" stroke={KINK} strokeWidth={6} strokeLinejoin="round" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_TOON, fontWeight: 700, fontSize: 40, color: '#ffffff', WebkitTextStroke: `7px ${KINK}`, paintOrder: 'stroke fill' }}>
            TINY SPARKS
          </div>
        </div>
      </div>
      {/* the hook title, centred in the band above the window */}
      <div style={{ position: 'absolute', left: 24, right: 24, top: 150, height: top - 170, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', transform: 'rotate(-2deg)' }}>
        {d.lines.map((ln, k) => (
          <div key={k} style={{ fontFamily: FONT_TOON, fontWeight: 700, fontSize: size * (d.scales?.[k] ?? 1), lineHeight: 1.02, whiteSpace: 'nowrap', textAlign: 'center',
            color: d.colors?.[k] ?? (k % 2 ? '#ffffff' : '#ffca3a'), WebkitTextStroke: `${size * 0.15}px ${KINK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.08}px 0 rgba(59,42,74,0.6)` }}>
            {ln}
          </div>
        ))}
      </div>
      {/* ink edges of the video window */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: top - 5, height: 10, background: KINK }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: top + winH - 5, height: 10, background: KINK }} />
    </AbsoluteFill>
  );
}
