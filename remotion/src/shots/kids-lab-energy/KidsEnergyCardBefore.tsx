// Energy demo (lab): the "BEFORE" title card of the before/after comparison video.
import React from 'react';
import { TitleCard, useT } from '../../lib/kids/kit';

export const compositionConfig = { id: 'KidsEnergyCardBefore', durationInSeconds: 2.2, fps: 30, width: 1920, height: 1080 };

export default function KidsEnergyCardBefore() {
  const t = useT();
  return <TitleCard t={t} from={0} to={2.2} title="BEFORE" sub="Day 36 as published" color="#a0c4ff" />;
}
