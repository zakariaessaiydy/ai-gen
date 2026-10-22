// Model sheet for the DINO rig (lib/kids/dino.tsx, Day 37): every kind + the props on the Dino Valley set.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { KidsStage } from '../../lib/kids/kit';
import { FLOOR } from '../../lib/kids/sets';
import { Dino, DinoEgg, DinoValley, EggNest, Footprint, NumStone, type DinoSpec } from '../../lib/kids/dino';

export const compositionConfig = { id: 'KidsDinoSheet', durationInSeconds: 2, fps: 30, width: 1920, height: 1080 };

const f = FLOOR(1080);
export const DINO_SHEET: DinoSpec[] = [
  { id: 'rexy', kind: 'rex', body: '#7bd389', belly: '#fff3c4', accent: '#ff924c', spots: '#52b788' },
  { id: 'tops1', kind: 'tops', body: '#ff9f68', belly: '#ffe5c9', accent: '#ffca3a' },
  { id: 'stego1', kind: 'stego', body: '#b39ddb', belly: '#efe6ff', accent: '#ff6fa5' },
  { id: 'neck1', kind: 'neck', body: '#64b5f6', belly: '#dff1ff', accent: '#ffd166', spots: '#4a90d9' },
  { id: 'baby1', kind: 'baby', body: '#ffb3c6', belly: '#fff0f5', accent: '#ff6fa5', spots: '#8ac926' },
];

export default function KidsDinoSheet() {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <KidsStage cam={{ z: 1, x: 960, y: 540, rot: 0 }}>
      <DinoValley t={t} floor={f} />
      <Dino spec={DINO_SHEET[3]} x={260} y={f} scale={0.62} expr="happy" />
      <Dino spec={DINO_SHEET[1]} x={640} y={f} scale={0.62} expr="wow" />
      <Dino spec={DINO_SHEET[0]} x={980} y={f} scale={0.62} expr="laugh" mouth={0.6} wave />
      <Dino spec={DINO_SHEET[2]} x={1350} y={f} scale={0.62} expr="smile" facing={-1} />
      <Dino spec={DINO_SHEET[4]} x={1700} y={f} scale={0.62} expr="happy" wave />
      <g transform="translate(960,190) scale(0.5)"><EggNest n={7} label="10" /></g>
      <g transform="translate(1500,330)"><DinoEgg crack={0.7} wobble={8} s={0.8} /></g>
      <g transform="translate(1640,330)"><DinoEgg c="#e3f6ff" spots="#ff6fa5" s={0.8} /></g>
      <g transform="translate(300,330)"><NumStone n="15" s={0.7} /></g>
      {[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${140 + i * 90},${f + 90}) rotate(-90)`}><Footprint s={0.5} /></g>)}
    </KidsStage>
  );
}
