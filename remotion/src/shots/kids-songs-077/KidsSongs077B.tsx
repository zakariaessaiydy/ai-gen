// Day 077 · take B = campfire-seed22.wav (lyric match 103%) — one video per ACE-Step take.
// Audio: kids-shorts/tiny-sparks/songs/day-077-addition-song/song-B.mp3 (muxed after the render).
import { makeSong077 } from './Song077';
import { SONG, SONG_BEAT, SONG_DURATION, SONG_FORM } from './song.B.gen';

export const compositionConfig = { id: 'KidsSongs077B', durationInSeconds: 321.60, fps: 30, width: 1920, height: 1080 };

export default makeSong077(SONG, SONG_BEAT, SONG_DURATION, SONG_FORM);
