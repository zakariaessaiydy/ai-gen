import React from 'react';
import { StoryPlayer } from '../../lib/kids';
import { SHOTS } from './shots.gen';
import { VO } from './vo.gen';

// =============================================================================
// Sammy and the Rolling Acorn — kids-stories episode. The picture is DATA: edit "shots" in
// kids-stories/ks-1-acorn/beats.json, not this file. New scenes / characters / actions go in
// lib/kids.tsx so every episode gets them.
// =============================================================================
export const compositionConfig = {
  id: 'Ks1Acorn',
  durationInSeconds: 150.0,
  fps: 30,
  width: 1920,
  height: 1080,
};

const Ks1Acorn: React.FC = () => <StoryPlayer shots={SHOTS} vo={VO} series="Sammy & Friends" />;

export default Ks1Acorn;
