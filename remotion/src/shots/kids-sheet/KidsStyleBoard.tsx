// Style board for TINY SPARKS — every kids set at 16:9 with the cast in it, plus the teaching
// overlays (count row, word card, think timer). Proves one kit serves Shorts AND long videos.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO, HOOT, LEO, MILA } from '../../lib/kids/cast/tiny-sparks';
import { Bedroom, Classroom, FLOOR, Forest, Meadow, Space, Underwater } from '../../lib/kids/sets';
import { FONT_TOON } from '../../lib/kids/kit';

export const compositionConfig = { id: 'KidsStyleBoard', durationInSeconds: 2, fps: 30, width: 1920, height: 1080 };

const W = 1920;
const H = 1080;
const f = FLOOR(H);
const cells: [string, React.ReactNode][] = [
  ['Meadow — stories, animals, songs', <>
    <Meadow w={W} h={H} t={1} />
    <Kid spec={MILA} x={700} y={f} scale={0.62} expr="happy" armL="wave" />
    <Critter spec={BOBO} x={1050} y={f} scale={0.6} expr="laugh" armR="up" />
  </>],
  ['Classroom — numbers, words, puzzles', <>
    <Classroom w={W} h={H} board={['1 + 2 = 3']} />
    <Critter spec={HOOT} x={1500} y={f} scale={0.6} expr="smile" armL="point" />
    <Kid spec={LEO} x={380} y={f} scale={0.62} expr="think" armR="think" />
  </>],
  ['Bedroom — bedtime & moral stories', <>
    <Bedroom w={W} h={H} t={1} />
    <Kid spec={MILA} x={1500} y={f} scale={0.6} expr="sleepy" armL="hug" armR="hug" />
  </>],
  ['Space — science', <>
    <Space w={W} h={H} t={1} />
    <Kid spec={LEO} x={800} y={f} scale={0.62} expr="wow" armL="up" armR="up" />
    <Critter spec={HOOT} x={1200} y={f} scale={0.55} expr="happy" armR="point" />
  </>],
  ['Underwater — animals, science', <>
    <Underwater w={W} h={H} t={1} />
    <Critter spec={{ id: 'fr', species: 'frog', fur: '#8ac926', fur2: '#e9f5c9', dark: '#4f7d17' }} x={700} y={f} scale={0.6} expr="happy" />
    <Kid spec={MILA} x={1200} y={f} scale={0.6} expr="surprised" />
  </>],
  ['Forest — animal stories', <>
    <Forest w={W} h={H} t={1} />
    <Critter spec={{ id: 'fx', species: 'fox', fur: '#ff8c42', fur2: '#ffffff', dark: '#7a3b12' }} x={650} y={f} scale={0.6} expr="wink" armL="wave" />
    <Critter spec={{ id: 'bn', species: 'bunny', fur: '#f8f9fa', fur2: '#ffe5ec', dark: '#adb5bd' }} x={1150} y={f} scale={0.6} expr="oops" />
  </>],
];

export default function KidsStyleBoard() {
  return (
    <AbsoluteFill style={{ background: '#3b2a4a' }}>
      {cells.map(([name, node], i) => {
        const cx = (i % 3) * 640;
        const cy = Math.floor(i / 3) * 540;
        return (
          <svg key={i} width={624} height={351} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', left: cx + 8, top: cy + 40 }}>
            {node}
          </svg>
        );
      })}
      {cells.map(([name], i) => (
        <div key={i} style={{ position: 'absolute', left: (i % 3) * 640 + 8, top: Math.floor(i / 3) * 540 + 398, width: 624, textAlign: 'center', fontFamily: FONT_TOON, fontWeight: 700, fontSize: 30, color: '#ffffff' }}>
          {name}
        </div>
      ))}
    </AbsoluteFill>
  );
}
