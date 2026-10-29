// The marathon intro for PART 3 of the split upload (same ident + cast, its own subtitle).
import React from 'react';
import { MarathonIntro } from './KidsMarathonIntro';

export const compositionConfig = { id: 'KidsMarathonIntroP3', durationInSeconds: 9, fps: 30, width: 1920, height: 1080 };

export default function KidsMarathonIntroP3() {
  return <MarathonIntro title="KIDS CARTOON MARATHON!" sub="Part 3 · 4 episodes · 22 minutes of fun" />;
}
