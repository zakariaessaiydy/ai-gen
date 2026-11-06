// Style board for the code-drawn kids SETS at 9:16 (the Shorts format) — the six sets side by side with
// the cast standing on FLOOR. Pair of KidsStyleBoard (16:9). Frame it after changing sets.tsx.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO, HOOT, LEO, MILA } from '../../lib/kids/cast/tiny-sparks';
import { Bedroom, Classroom, FLOOR, Forest, Meadow, Space, Underwater } from '../../lib/kids/sets';
import { FONT_TOON, useT } from '../../lib/kids/kit';

export const compositionConfig = { id: 'KidsStyleBoardTall', durationInSeconds: 4, fps: 30, width: 1920, height: 1080 };

const W = 1080;
const H = 1920;
const f = FLOOR(H);

export default function KidsStyleBoardTall() {
  const t = useT() + 1;
  const cells: [string, React.ReactNode][] = [
    ['Meadow', <Meadow w={W} h={H} t={t} />],
    ['Classroom', <Classroom w={W} h={H} t={t} board={['1 + 2 = 3']} />],
    ['Bedroom', <Bedroom w={W} h={H} t={t} />],
    ['Space', <Space w={W} h={H} t={t} />],
    ['Underwater', <Underwater w={W} h={H} t={t} />],
    ['Forest', <Forest w={W} h={H} t={t} />],
  ];
  return (
    <AbsoluteFill style={{ background: '#3b2a4a' }}>
      {cells.map(([name, set], i) => (
        <div key={name} style={{ position: 'absolute', left: i * 320 + 4, top: 20, width: 312, textAlign: 'center' }}>
          <svg width={312} height={555} viewBox={`0 0 ${W} ${H}`}>
            {set}
            <Kid spec={i % 2 ? LEO : MILA} x={300} y={f} expr="happy" armL="wave" />
            {i % 2 ? <Critter spec={HOOT} x={780} y={f} scale={0.9} expr="smile" /> : <Critter spec={BOBO} x={780} y={f} scale={0.9} expr="laugh" />}
          </svg>
          <div style={{ fontFamily: FONT_TOON, fontWeight: 700, fontSize: 30, color: '#ffffff' }}>{name}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
}
