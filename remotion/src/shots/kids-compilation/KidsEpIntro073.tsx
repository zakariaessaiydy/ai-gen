// The intro for Day 73 on its own (from Marathon #9): the channel ident on the jingle, then the cast waves under the
// episode's title. tools/kids_singles.py joins it in front of the episode.
import React from 'react';
import { MarathonIntro } from './KidsMarathonIntro';

export const compositionConfig = { id: 'KidsEpIntro073', durationInSeconds: 9, fps: 30, width: 1920, height: 1080 };

export default function KidsEpIntro073() {
  return <MarathonIntro title="FARM ANIMALS IN ENGLISH & FRENCH 🐮" titleSize={80} sub="🔤 English & French words · Tiny Sparks" />;
}
