// Model sheet for "BRO THINKS HE'S HIM" — the locked look of every recurring character, in the
// series' core expressions/poses. Render a still of it as toon-shorts/bro/character.png (the
// reference the skill checks every new pose against). Not an episode.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Toon, type ToonProps } from '../../lib/toon/rig';
import { BRO, DEE, extra } from '../../lib/toon/series/bro';
import { Bottle } from '../../lib/toon/sets';
import { FONT_PUNCH, FONT_TOON } from '../../lib/toon/comedy';

export const compositionConfig = {
  id: 'BroModelSheet',
  durationInSeconds: 2,
  fps: 30,
  width: 1080,
  height: 1920,
};

const CUSTOMER = extra('customer', { hair: 'bald', hairColor: '#b8b1a8', top: 'shirt', topColor: '#d8c3a5', topShade: '#b9a385', tie: '#3a5a8c', beard: 'mustache', glasses: true });

type Cell = { label: string; p: Omit<ToonProps, 'x' | 'y' | 'scale'> };
const CELLS: Cell[] = [
  { label: 'neutral', p: { spec: BRO } },
  { label: 'smug', p: { spec: BRO, expr: 'smug', armL: 'hip', armR: 'hip' } },
  { label: 'confident · gun', p: { spec: BRO, expr: 'confident', armL: 'gun', armR: 'gun' } },
  { label: 'shock', p: { spec: BRO, expr: 'shock', armL: 'shrug', armR: 'shrug', sweat: true } },
  { label: 'THE STARE', p: { spec: BRO, expr: 'deadpan', armL: 'cross', armR: 'cross' } },
  { label: 'drink · sit', p: { spec: BRO, expr: 'happy', armR: 'drink', legs: 'sit', holdR: <Bottle anchor="center" level={0.4} />, holdRotR: -55, tilt: -6 } },
  { label: 'talking · point-up', p: { spec: BRO, expr: 'confident', mouth: 0.8, armR: 'point-up' } },
  { label: 'DEE', p: { spec: DEE, expr: 'annoyed', armL: 'cross', armR: 'cross' } },
  { label: 'extra (customer)', p: { spec: CUSTOMER, expr: 'side-eye', armR: 'point' } },
];

export default function BroModelSheet() {
  return (
    <AbsoluteFill style={{ background: '#f4efe6' }}>
      <div style={{ position: 'absolute', top: 40, width: '100%', textAlign: 'center', fontFamily: FONT_PUNCH, fontSize: 84, color: '#e63946', WebkitTextStroke: '10px #160e09', paintOrder: 'stroke fill' }}>
        BRO THINKS HE&apos;S HIM
      </div>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        {CELLS.map((c, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const x = 180 + col * 360;
          const y = 600 + row * 580;
          return (
            <g key={i}>
              <rect x={x - 170} y={y - 440} width={340} height={540} rx={20} fill="#ffffff" stroke="#d8cfc2" strokeWidth={4} />
              <Toon {...c.p} x={x} y={y + 30} scale={0.4} />
              <text x={x} y={y + 85} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={30} fill="#22160f">{c.label}</text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
}
