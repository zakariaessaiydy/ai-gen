// Day 084 · take B = sunshine-seed2038.wav (lyric match 106%) — one video per ACE-Step take.
// Audio: kids-shorts/tiny-sparks/songs/day-084-subtraction-song/song-B.mp3 (muxed after the render).
import { makeSong084 } from './Song084';
import { SONG, SONG_BEAT, SONG_DURATION, SONG_FORM } from './song.B.gen';

export const compositionConfig = { id: 'KidsSongs084B', durationInSeconds: 310.67, fps: 30, width: 1920, height: 1080 };

export default makeSong084(SONG, SONG_BEAT, SONG_DURATION, SONG_FORM);
