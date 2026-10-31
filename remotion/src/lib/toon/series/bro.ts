// "BRO THINKS HE'S HIM" — the LOCKED cast. Mirror of toon-shorts/bro/series.json.
// NEVER edit a locked spec inside an episode: a recurring character is only recognisable if
// every pixel of him is identical across episodes. New one-off characters are added here as
// new specs (or derived with `extra(...)`), never by tweaking BRO.
import type { ToonSpec } from '../rig';

const INK = '#22160f';

// THE BRO — red backwards cap with the brim peeking out, shades parked on the cap, white tank,
// gold chain with the medallion, grey joggers, white kicks with red swoosh, goatee.
export const BRO: ToonSpec = {
  id: 'bro',
  ink: INK,
  skin: '#e3a374',
  skinShade: '#b97d52',
  hair: 'cap-back',
  hairColor: '#2a1a12',
  cap: '#e63946',
  top: 'tank',
  topColor: '#fbfaf6',
  topShade: '#dcd8cf',
  pants: '#6b7280',
  shoes: '#fbfaf6',
  shoeAccent: '#e63946',
  chain: true,
  shadesOnHead: true,
  beard: 'goatee',
  bodyW: 1.08,
};

// DEE — the best friend / voice of reason. Teal hoodie, round glasses, curly hair.
export const DEE: ToonSpec = {
  id: 'dee',
  ink: INK,
  skin: '#8d5a3b',
  skinShade: '#6e4329',
  hair: 'curly',
  hairColor: '#1b1310',
  top: 'hoodie',
  topColor: '#2a9d8f',
  topShade: '#21796e',
  pants: '#3a5a8c',
  shoes: '#2b2d33',
  shoeAccent: '#f4d35e',
  glasses: true,
  beard: 'none',
};

// one-off extras are derived from a base so the art style stays the series'
export const extra = (id: string, patch: Partial<ToonSpec>): ToonSpec => ({
  id,
  ink: INK,
  skin: '#f1c9a5',
  skinShade: '#d6a57d',
  hair: 'short',
  hairColor: '#5a4636',
  top: 'tee',
  topColor: '#9aa5b1',
  topShade: '#7d8794',
  pants: '#4b5563',
  shoes: '#3b3b3b',
  beard: 'none',
  ...patch,
});

// the series' caption colour per speaker (narration lines without a speaker use NARRATOR)
export const SPEAKER_COLORS: Record<string, string> = {
  bro: '#ffd23f',
  dee: '#7fe7dc',
};
export const NARRATOR_COLOR = '#ffffff';

export const SERIES = {
  name: "BRO THINKS HE'S HIM",
  catchphrase: 'I got this.',
  accent: '#e63946',
};
