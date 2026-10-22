// Energy demo (lab): the "AFTER" title card of the before/after comparison video.
import React from 'react';
import { TitleCard, useT } from '../../lib/kids/kit';

export const compositionConfig = { id: 'KidsEnergyCardAfter', durationInSeconds: 2.6, fps: 30, width: 1920, height: 1080 };

export default function KidsEnergyCardAfter() {
  const t = useT();
  return <TitleCard t={t} from={0} to={2.6} title="AFTER" sub="jingle · theme music · sound effects · camera · reactions" color="#ffca3a" />;
}
