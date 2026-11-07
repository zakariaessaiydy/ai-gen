// The intro for Day 62 on its own (from Marathon #8): the channel ident on the jingle, then the cast waves under the
// episode's title. tools/kids_singles.py joins it in front of the episode.
import React from 'react';
import { MarathonIntro } from './KidsMarathonIntro';

export const compositionConfig = { id: 'KidsEpIntro062', durationInSeconds: 9, fps: 30, width: 1920, height: 1080 };

export default function KidsEpIntro062() {
  return <MarathonIntro title="FIND THE HIDDEN STAR ⭐" titleSize={120} sub="🧩 Puzzles for kids · Tiny Sparks" />;
}
