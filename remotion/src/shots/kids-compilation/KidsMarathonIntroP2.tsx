// The marathon intro for PART 2 of the split upload (same ident + cast, its own subtitle).
import React from 'react';
import { MarathonIntro } from './KidsMarathonIntro';

export const compositionConfig = { id: 'KidsMarathonIntroP2', durationInSeconds: 9, fps: 30, width: 1920, height: 1080 };

export default function KidsMarathonIntroP2() {
  return <MarathonIntro title="KIDS CARTOON MARATHON!" sub="Part 2 · 5 episodes · 25 minutes of fun" />;
}
