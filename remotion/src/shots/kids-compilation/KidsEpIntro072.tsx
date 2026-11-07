// The intro for Day 72 on its own (from Marathon #9): the channel ident on the jingle, then the cast waves under the
// episode's title. tools/kids_singles.py joins it in front of the episode.
import React from 'react';
import { MarathonIntro } from './KidsMarathonIntro';

export const compositionConfig = { id: 'KidsEpIntro072', durationInSeconds: 9, fps: 30, width: 1920, height: 1080 };

export default function KidsEpIntro072() {
  return <MarathonIntro title="LEARN NUMBER 1 ☝️" titleSize={120} sub="🔢 Numbers & counting · Tiny Sparks" />;
}
