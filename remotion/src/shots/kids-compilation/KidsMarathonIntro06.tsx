// The intro for MARATHON #6 (Days 46–61 + Day 80: every episode of marathons #2–#5 plus Wild Animals EN/FR, in one video).
import React from 'react';
import { MarathonIntro } from './KidsMarathonIntro';

export const compositionConfig = { id: 'KidsMarathonIntro06', durationInSeconds: 9, fps: 30, width: 1920, height: 1080 };

export default function KidsMarathonIntro06() {
  return <MarathonIntro title="KIDS CARTOON MARATHON!" sub="17 episodes · over 80 minutes of fun" />;
}
