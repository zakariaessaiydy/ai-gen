// Day 084 · take C = sunshine-seed54.wav (lyric match 95%) — one video per ACE-Step take.
// Audio: kids-shorts/tiny-sparks/songs/day-084-subtraction-song/song-C.mp3 (muxed after the render).
import { makeSong084 } from './Song084';
import { SONG, SONG_BEAT, SONG_DURATION, SONG_FORM } from './song.C.gen';

export const compositionConfig = { id: 'KidsSongs084C', durationInSeconds: 319.99, fps: 30, width: 1920, height: 1080 };

export default makeSong084(SONG, SONG_BEAT, SONG_DURATION, SONG_FORM);
