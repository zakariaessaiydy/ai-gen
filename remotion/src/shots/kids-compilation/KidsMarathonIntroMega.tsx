// The cover for the MEGA MARATHON (Days 46–61: Marathons #2–#5 in one video). Used for its thumbnail.
import React from 'react';
import { MarathonIntro } from './KidsMarathonIntro';

export const compositionConfig = { id: 'KidsMarathonIntroMega', durationInSeconds: 9, fps: 30, width: 1920, height: 1080 };

export default function KidsMarathonIntroMega() {
  return <MarathonIntro title="KIDS CARTOON MARATHON!" sub="16 episodes · over 1 hour of fun" />;
}
