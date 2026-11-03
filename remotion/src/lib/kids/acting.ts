// KIDS KIT — ACTING (user request, Nov 2026: "better acting"). Lips that match the words: speechAt() walks
// through the letters of the word being said (the VO's word times from gen_voice) and returns the mouth
// openness + the VISEME (mouth shape) for that sound. Pass both to the rig with acting on:
//
//   const sp = speechAt(VO, 'mila', t);
//   <Kid … mouth={sp.mouth} viseme={sp.viseme} acting />
//
// `acting` also lifts the brows with the voice. Replaces lipSync(VO, speaker, t) (which only wobbled the
// mouth open and shut) — same inputs, so an episode swaps one call.
import type { VoLine } from '../shorts';
import { timeWords } from '../shorts';
import type { Viseme } from './face';

// sound → mouth shape. Digraphs first (they are one sound), then single letters.
const DIGRAPHS: [string, Viseme][] = [
  ['oo', 'U'], ['ou', 'O'], ['ow', 'O'], ['ee', 'E'], ['ea', 'E'], ['th', 'E'], ['sh', 'U'], ['ch', 'U'], ['ph', 'F'], ['qu', 'U'], ['wh', 'U'],
];
const LETTER: Record<string, Viseme> = {
  a: 'A', i: 'A', h: 'A', e: 'E', y: 'E', o: 'O', u: 'U', w: 'U', q: 'U', r: 'U',
  m: 'M', b: 'M', p: 'M', f: 'F', v: 'F',
  s: 'E', z: 'E', t: 'E', d: 'E', n: 'E', l: 'E', c: 'E', k: 'E', g: 'E', j: 'U', x: 'E',
};
const OPEN: Record<Viseme, number> = { A: 0.9, E: 0.5, O: 0.75, U: 0.4, M: 0, F: 0.25 };

const sounds = (word: string): Viseme[] => {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  const out: Viseme[] = [];
  for (let i = 0; i < w.length; ) {
    const dg = DIGRAPHS.find(([d]) => w.startsWith(d, i));
    if (dg) {
      out.push(dg[1]);
      i += 2;
      continue;
    }
    // a silent final 'e' (make, cake) is not a sound
    if (!(w[i] === 'e' && i === w.length - 1 && w.length > 2)) out.push(LETTER[w[i]] ?? 'E');
    i += 1;
  }
  return out.length ? out : ['A'];
};

export const speechAt = (vo: VoLine[], speaker: string, t: number): { mouth: number; viseme?: Viseme } => {
  for (const line of vo) {
    if (line.speaker !== speaker || t < line.start - 0.05 || t > line.end + 0.05) continue;
    for (const w of timeWords(line)) {
      if (t >= w.start && t < w.end) {
        const ss = sounds(w.w);
        const p = (t - w.start) / Math.max(0.01, w.end - w.start);
        const i = Math.min(ss.length - 1, Math.floor(p * ss.length));
        const v = ss[i];
        // a little life inside each sound so a held vowel is not a frozen picture
        const local = p * ss.length - i;
        const open = OPEN[v] * (0.8 + 0.2 * Math.sin(local * Math.PI));
        return { mouth: v === 'M' ? 0.1 : Math.max(0.12, open), viseme: v };
      }
    }
    return { mouth: 0.06, viseme: 'M' }; // between words: lips together
  }
  return { mouth: 0 };
};
