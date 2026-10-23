// Channel avatar for "BRO THINKS HE'S HIM" (YouTube profile picture, 800x800, shown as a circle).
// Bro's head doing THE STARE on the series red, the cap breaking out of the circle. Still.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Toon, faceAt } from '../../lib/toon/rig';
import { BRO } from '../../lib/toon/series/bro';
import { FONT_PUNCH } from '../../lib/toon/comedy';

export const compositionConfig = { id: 'BroChannelLogo', durationInSeconds: 1, fps: 30, width: 800, height: 800 };

const S = 1.05;
const [, fy] = faceAt(0, 0, S);

export default function BroChannelLogo() {
  return (
    <AbsoluteFill style={{ background: '#e63946' }}>
      <svg width={800} height={800} viewBox="0 0 800 800" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="glow" cx="50%" cy="45%" r="60%">
            <stop offset="0" stopColor="#ffd23f" />
            <stop offset="0.55" stopColor="#ff8c42" />
            <stop offset="1" stopColor="#e63946" />
          </radialGradient>
        </defs>
        <rect width={800} height={800} fill="url(#glow)" />
        {Array.from({ length: 16 }).map((_, i) => (
          <path key={i} d="M 400,370 L 380,-200 L 420,-200 Z" fill="#ffffff" opacity={0.12} transform={`rotate(${i * 22.5} 400 370)`} />
        ))}
        <Toon spec={BRO} x={400} y={360 - fy} scale={S} expr="deadpan" armL="cross" armR="cross" shadow={false} />
      </svg>
      <div
        style={{
          position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', fontFamily: FONT_PUNCH, fontSize: 118,
          color: '#ffd23f', WebkitTextStroke: '14px #160e09', paintOrder: 'stroke fill', transform: 'rotate(-4deg)', letterSpacing: 2,
        }}
      >
        BRO
      </div>
    </AbsoluteFill>
  );
}
