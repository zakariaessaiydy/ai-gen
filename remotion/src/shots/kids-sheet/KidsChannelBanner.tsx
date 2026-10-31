// Tiny Sparks channel banner (2560x1440). Title + tagline inside the 1546x423 centre safe area that
// shows on every device; the cast stands just outside it, in the Meadow.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO, HOOT, LEO, MILA, CHANNEL } from '../../lib/kids/cast/tiny-sparks';
import { Meadow } from '../../lib/kids/sets';
import { FONT_TOON, Star, Balloon } from '../../lib/kids/kit';
import { KINK } from '../../lib/kids/face';

export const compositionConfig = { id: 'KidsChannelBanner', durationInSeconds: 1, fps: 30, width: 2560, height: 1440 };

export default function KidsChannelBanner() {
  return (
    <AbsoluteFill>
      <svg width={2560} height={1440} viewBox="0 0 2560 1440" style={{ position: 'absolute', inset: 0 }}>
        <Meadow w={2560} h={1440} t={2} />
        <g transform="translate(560,470) rotate(-10)"><Balloon c="#ff6fa5" /></g>
        <g transform="translate(1720,430) rotate(8)"><Balloon c="#ffca3a" /></g>
        <g transform="translate(700,560) rotate(10)"><Star c="#ffd166" s={0.5} /></g>
        <g transform="translate(1600,600) rotate(-10)"><Star c="#4cc9f0" s={0.5} /></g>
        <Kid spec={MILA} x={380} y={1330} scale={0.95} expr="happy" armL="wave" blink={false} />
        <Critter spec={BOBO} x={640} y={1330} scale={0.85} expr="laugh" armR="up" blink={false} />
        <Kid spec={LEO} x={2180} y={1330} scale={0.95} expr="laugh" armR="wave" blink={false} />
        <Critter spec={HOOT} x={1930} y={1330} scale={0.8} expr="smile" armL="wave" blink={false} />
      </svg>
      <div style={{ position: 'absolute', top: 560, width: '100%', textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_TOON, fontWeight: 700, fontSize: 210, lineHeight: 1, color: '#ffca3a', WebkitTextStroke: `22px ${KINK}`, paintOrder: 'stroke fill', textShadow: '0 12px 0 rgba(59,42,74,0.35)', transform: 'rotate(-2deg)' }}>
          TINY SPARKS
        </div>
        <div style={{ marginTop: 26, display: 'inline-block', background: '#ffffff', color: KINK, fontFamily: FONT_TOON, fontWeight: 700, fontSize: 54, padding: '12px 40px', borderRadius: 40, border: `8px solid ${KINK}` }}>
          {CHANNEL.tagline}
        </div>
        <div style={{ marginTop: 18, fontFamily: FONT_TOON, fontWeight: 700, fontSize: 44, color: '#ffffff', WebkitTextStroke: `8px ${KINK}`, paintOrder: 'stroke fill' }}>
          New video every day · Stories · Numbers · Words · Songs
        </div>
      </div>
    </AbsoluteFill>
  );
}
