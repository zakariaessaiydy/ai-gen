// Tiny Sparks channel avatar (800x800, YouTube crops to a circle): Bobo + Mila + Leo peeking over a
// rainbow spark, name on a ribbon. Everything important sits inside the circle.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO, LEO, MILA } from '../../lib/kids/cast/tiny-sparks';
import { FONT_TOON, RAINBOW, Star } from '../../lib/kids/kit';
import { KINK } from '../../lib/kids/face';

export const compositionConfig = { id: 'KidsChannelLogo', durationInSeconds: 1, fps: 30, width: 800, height: 800 };

export default function KidsChannelLogo() {
  return (
    <AbsoluteFill style={{ background: '#7ec8f8' }}>
      <svg width={800} height={800} viewBox="0 0 800 800" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="lg" cx="50%" cy="42%" r="60%">
            <stop offset="0" stopColor="#fff3b0" />
            <stop offset="0.55" stopColor="#9be0ff" />
            <stop offset="1" stopColor="#5fb4f0" />
          </radialGradient>
        </defs>
        <rect width={800} height={800} fill="url(#lg)" />
        {RAINBOW.slice(0, 6).map((c, i) => (
          <path key={i} d={`M ${110 + i * 26},560 A ${290 - i * 26},${290 - i * 26} 0 0,1 ${690 - i * 26},560`} fill="none" stroke={c} strokeWidth={26} />
        ))}
        <g transform="translate(400,190) rotate(-8)"><Star c="#ffd166" s={0.9} /></g>
        <g transform="translate(205,250) rotate(14)"><Star c="#ff6fa5" s={0.38} /></g>
        <g transform="translate(600,255) rotate(-14)"><Star c="#8ac926" s={0.38} /></g>
        <Kid spec={MILA} x={225} y={890} scale={0.62} expr="happy" armL="wave" blink={false} shadow={false} />
        <Kid spec={LEO} x={575} y={890} scale={0.62} expr="laugh" armR="wave" blink={false} shadow={false} />
        <Critter spec={BOBO} x={400} y={840} scale={0.66} expr="laugh" armL="up" armR="up" blink={false} shadow={false} />
        <g transform="translate(400,640) rotate(-4)">
          <path d="M -290,-46 L 290,-46 L 270,0 L 290,46 L -290,46 L -270,0 Z" fill="#ff595e" stroke={KINK} strokeWidth={10} strokeLinejoin="round" />
          <text y={30} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={82} fill="#ffffff" stroke={KINK} strokeWidth={10} paintOrder="stroke">
            TINY SPARKS
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
}
