// Day 063 · take A = nursery-seed2035.wav (lyric match 92%) — one video per ACE-Step take.
// Audio: kids-shorts/tiny-sparks/songs/day-063-numbers-1-100-song/song-A.mp3 (muxed after the render).
import { makeSong063 } from './Song063';
import { SONG, SONG_BEAT, SONG_DURATION, SONG_FORM } from './song.A.gen';

export const compositionConfig = { id: 'KidsSongs063A', durationInSeconds: 373.80, fps: 30, width: 1920, height: 1080 };

export default makeSong063(SONG, SONG_BEAT, SONG_DURATION, SONG_FORM);
