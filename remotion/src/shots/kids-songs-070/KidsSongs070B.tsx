// Day 070 · take B = kidspop-seed2036.wav (lyric match 82%) — one video per ACE-Step take.
// Audio: kids-shorts/tiny-sparks/songs/day-070-counting-backwards-song/song-B.mp3 (muxed after the render).
import { makeSong070 } from './Song070';
import { SONG, SONG_BEAT, SONG_DURATION, SONG_FORM } from './song.B.gen';

export const compositionConfig = { id: 'KidsSongs070B', durationInSeconds: 303.33, fps: 30, width: 1920, height: 1080 };

export default makeSong070(SONG, SONG_BEAT, SONG_DURATION, SONG_FORM);
