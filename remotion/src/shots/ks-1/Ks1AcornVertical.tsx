import React from 'react';
import { VerticalCut } from '../../lib/kids';
import { CUT, SHOTS } from './shots.gen';
import { VO } from './vo.gen';

// The 9:16 teaser carved from Ks1Acorn (beats.json "shortCut"). durationInSeconds MUST equal
// shortCut.end - shortCut.start — check_short.py verifies it.
export const compositionConfig = {
  id: 'Ks1AcornVertical',
  durationInSeconds: 34,
  fps: 30,
  width: 1080,
  height: 1920,
};

const Ks1AcornVertical: React.FC = () => <VerticalCut shots={SHOTS} vo={VO} cut={CUT} />;

export default Ks1AcornVertical;
