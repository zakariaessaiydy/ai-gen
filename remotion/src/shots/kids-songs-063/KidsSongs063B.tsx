// Day 063 · take B = nursery-seed51.wav (lyric match 78%) — one video per ACE-Step take.
// Audio: kids-shorts/tiny-sparks/songs/day-063-numbers-1-100-song/song-B.mp3 (muxed after the render).
import { makeSong063 } from './Song063';
import { SONG, SONG_BEAT, SONG_DURATION, SONG_FORM } from './song.B.gen';

export const compositionConfig = { id: 'KidsSongs063B', durationInSeconds: 369.83, fps: 30, width: 1920, height: 1080 };

export default makeSong063(SONG, SONG_BEAT, SONG_DURATION, SONG_FORM);
