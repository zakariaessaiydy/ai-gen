// PLACEHOLDER — estimated windows only, so the shot renders for QA before the voice exists.
// tools/gen_voice.py --emit-ts overwrites this file with the REAL ElevenLabs word alignment.
import type { VoLine } from '../../lib/shorts';

export const VO: VoLine[] = [
  { text: 'Earth has never made new water.', start: 0.4, end: 2.75 },
  { text: 'The rain that fell on the dinosaurs still falls today.', start: 2.95, end: 7.0 },
  { text: 'Watch. The sun warms the sea,', start: 7.45, end: 9.85 },
  { text: 'and the water floats up as invisible vapour.', start: 10.05, end: 13.15 },
  { text: "Up high it's cold, so it turns into millions of tiny droplets.", start: 13.4, end: 18.15 },
  { text: "That's a cloud.", start: 18.35, end: 19.6 },
  { text: 'Pause. What happens when it gets too heavy?', start: 19.95, end: 23.15 },
  { text: 'It rains. The drops land on the mountains and run into rivers,', start: 24.1, end: 28.85 },
  { text: 'and every river carries them home to the sea.', start: 29.05, end: 32.6 },
  { text: 'Count the drops. Not one was added. Not one was lost.', start: 33.15, end: 37.5 },
  { text: 'About nine days in the sky. Then round again.', start: 37.9, end: 41.45 },
];
