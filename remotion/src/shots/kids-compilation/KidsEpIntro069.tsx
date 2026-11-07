// The intro for Day 69 on its own (from Marathon #9): the channel ident on the jingle, then the cast waves under the
// episode's title. tools/kids_singles.py joins it in front of the episode.
import React from 'react';
import { MarathonIntro } from './KidsMarathonIntro';

export const compositionConfig = { id: 'KidsEpIntro069', durationInSeconds: 9, fps: 30, width: 1920, height: 1080 };

export default function KidsEpIntro069() {
  return <MarathonIntro title="FIND THE HIDDEN HEART 💖" titleSize={119} sub="🧩 Puzzles for kids · Tiny Sparks" />;
}
