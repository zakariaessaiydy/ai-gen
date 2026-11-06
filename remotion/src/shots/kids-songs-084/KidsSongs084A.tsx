// Day 084 · take A = sunshine-seed23.wav (lyric match 121%) — one video per ACE-Step take.
// Audio: kids-shorts/tiny-sparks/songs/day-084-subtraction-song/song-A.mp3 (muxed after the render).
import { makeSong084 } from './Song084';
import { SONG, SONG_BEAT, SONG_DURATION, SONG_FORM } from './song.A.gen';

export const compositionConfig = { id: 'KidsSongs084A', durationInSeconds: 321.60, fps: 30, width: 1920, height: 1080 };

export default makeSong084(SONG, SONG_BEAT, SONG_DURATION, SONG_FORM);
