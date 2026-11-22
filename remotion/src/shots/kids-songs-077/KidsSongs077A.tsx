// Day 077 · take A = campfire-seed53.wav (lyric match 112%) — one video per ACE-Step take.
// Audio: kids-shorts/tiny-sparks/songs/day-077-addition-song/song-A.mp3 (muxed after the render).
import { makeSong077 } from './Song077';
import { SONG, SONG_BEAT, SONG_DURATION, SONG_FORM } from './song.A.gen';

export const compositionConfig = { id: 'KidsSongs077A', durationInSeconds: 321.60, fps: 30, width: 1920, height: 1080 };

export default makeSong077(SONG, SONG_BEAT, SONG_DURATION, SONG_FORM);
