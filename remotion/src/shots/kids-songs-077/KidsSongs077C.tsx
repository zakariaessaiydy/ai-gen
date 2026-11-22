// Day 077 · take C = campfire-seed2037.wav (lyric match 96%) — one video per ACE-Step take.
// Audio: kids-shorts/tiny-sparks/songs/day-077-addition-song/song-C.mp3 (muxed after the render).
import { makeSong077 } from './Song077';
import { SONG, SONG_BEAT, SONG_DURATION, SONG_FORM } from './song.C.gen';

export const compositionConfig = { id: 'KidsSongs077C', durationInSeconds: 312.95, fps: 30, width: 1920, height: 1080 };

export default makeSong077(SONG, SONG_BEAT, SONG_DURATION, SONG_FORM);
