// Channel banner for "BRO THINKS HE'S HIM" (YouTube 2560x1440; everything that matters inside the
// 1546x423 centre safe area that shows on every device). Still.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Toon } from '../../lib/toon/rig';
import { BRO, DEE } from '../../lib/toon/series/bro';
import { FONT_PUNCH, FONT_TOON } from '../../lib/toon/comedy';

export const compositionConfig = { id: 'BroChannelBanner', durationInSeconds: 1, fps: 30, width: 2560, height: 1440 };

export default function BroChannelBanner() {
  return (
    <AbsoluteFill style={{ background: '#e63946' }}>
      <svg width={2560} height={1440} viewBox="0 0 2560 1440" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="bglow" cx="50%" cy="50%" r="55%">
            <stop offset="0" stopColor="#ffd23f" />
            <stop offset="0.5" stopColor="#ff8c42" />
            <stop offset="1" stopColor="#e63946" />
          </radialGradient>
        </defs>
        <rect width={2560} height={1440} fill="url(#bglow)" />
        {Array.from({ length: 24 }).map((_, i) => (
          <path key={i} d="M 1280,720 L 1240,-1400 L 1320,-1400 Z" fill="#ffffff" opacity={0.1} transform={`rotate(${i * 15} 1280 720)`} />
        ))}
        {/* Bro (right of the title) and Dee (left), heads + shoulders inside the safe band */}
        <Toon spec={DEE} x={400} y={1560} scale={0.95} expr="side-eye" look={[0.8, 0]} armL="cross" armR="cross" shadow={false} />
        <Toon spec={BRO} x={2160} y={1560} scale={0.95} expr="smug" armL="gun" armR="hip" shadow={false} />
      </svg>
      <div style={{ position: 'absolute', top: 548, width: '100%', textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_PUNCH, fontSize: 190, lineHeight: 1, color: '#ffd23f', WebkitTextStroke: '18px #160e09', paintOrder: 'stroke fill', transform: 'rotate(-2deg)', letterSpacing: 4 }}>
          BRO THINKS HE&apos;S HIM
        </div>
        <div style={{ marginTop: 22, display: 'inline-block', background: '#160e09', color: '#ffffff', fontFamily: FONT_TOON, fontWeight: 700, fontSize: 50, padding: '10px 34px', borderRadius: 16 }}>
          NEW EPISODE EVERY WEEK · “Trust me. I got this.”
        </div>
      </div>
    </AbsoluteFill>
  );
}
