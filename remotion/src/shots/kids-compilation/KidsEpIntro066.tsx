// The intro for Day 66 on its own (from Marathon #8): the channel ident on the jingle, then the cast waves under the
// episode's title. tools/kids_singles.py joins it in front of the episode.
import React from 'react';
import { MarathonIntro } from './KidsMarathonIntro';

export const compositionConfig = { id: 'KidsEpIntro066', durationInSeconds: 9, fps: 30, width: 1920, height: 1080 };

export default function KidsEpIntro066() {
  return <MarathonIntro title="BODY PARTS IN ENGLISH & FRENCH 👀" titleSize={85} sub="🔤 English & French words · Tiny Sparks" />;
}
