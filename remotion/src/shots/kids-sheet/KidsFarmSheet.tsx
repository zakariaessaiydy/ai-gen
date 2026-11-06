// Model sheet for the FARM (lib/kids/farm.tsx + the farm species in critter.tsx, Day 44): cow, pig, sheep, duck,
// chick, hen in front of the red barn (doors half open) with the fence and a hay bale.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Critter } from '../../lib/kids/critter';
import { KidsStage } from '../../lib/kids/kit';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { Barn, CHICK, COW, DUCK, Fence, HEN, HayBale, PIG, SHEEP } from '../../lib/kids/farm';

export const compositionConfig = { id: 'KidsFarmSheet', durationInSeconds: 2, fps: 30, width: 1920, height: 1080 };

const f = FLOOR(1080);

export default function KidsFarmSheet() {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <KidsStage cam={{ z: 1, x: 960, y: 540, rot: 0 }}>
      <Meadow w={1920} h={1080} t={t} tree={false} />
      <Fence x0={0} x1={640} y={600} s={0.8} />
      <Fence x0={1280} x1={1920} y={600} s={0.8} />
      <Barn x={960} y={620} s={0.85} open={0.6} />
      <HayBale x={1500} y={640} s={0.8} />
      <Critter spec={COW} x={200} y={f} scale={0.5} expr="happy" />
      <Critter spec={PIG} x={510} y={f} scale={0.5} expr="laugh" mouth={0.5} />
      <Critter spec={SHEEP} x={820} y={f} scale={0.5} expr="smile" armL="wave" />
      <Critter spec={DUCK} x={1120} y={f} scale={0.46} expr="happy" mouth={0.6} />
      <Critter spec={CHICK} x={1400} y={f} scale={0.36} expr="wow" />
      <Critter spec={HEN} x={1700} y={f} scale={0.44} expr="smile" facing={-1} />
    </KidsStage>
  );
}
