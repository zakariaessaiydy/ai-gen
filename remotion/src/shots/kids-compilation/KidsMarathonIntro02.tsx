// The intro for MARATHON #2 (Days 46–49: penguin story, rain science, shape puzzles, months song) — same ident + cast.
import React from 'react';
import { MarathonIntro } from './KidsMarathonIntro';

export const compositionConfig = { id: 'KidsMarathonIntro02', durationInSeconds: 9, fps: 30, width: 1920, height: 1080 };

export default function KidsMarathonIntro02() {
  return <MarathonIntro title="KIDS CARTOON MARATHON!" sub="4 new episodes · 21 minutes of fun" />;
}
