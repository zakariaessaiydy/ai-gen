// Day 070 · take A = kidspop-seed52.wav (lyric match 87%) — one video per ACE-Step take.
// Audio: kids-shorts/tiny-sparks/songs/day-070-counting-backwards-song/song-A.mp3 (muxed after the render).
import { makeSong070 } from './Song070';
import { SONG, SONG_BEAT, SONG_DURATION, SONG_FORM } from './song.A.gen';

export const compositionConfig = { id: 'KidsSongs070A', durationInSeconds: 321.60, fps: 30, width: 1920, height: 1080 };

export default makeSong070(SONG, SONG_BEAT, SONG_DURATION, SONG_FORM);
