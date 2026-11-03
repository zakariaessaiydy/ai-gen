// TINY SPARKS — the LOCKED recurring cast of the kids channel. Episodes import these specs and
// never edit them (same iron rule as the Bro series): a kid recognises a friend by the exact
// colours and silhouette. One-off characters are new specs in the episode file.
import type { KidSpec } from '../kid';
import type { CritterSpec } from '../critter';

// MILA (6) — the curious one who asks "why?". Yellow dress, two hair puffs, pink bow.
export const MILA: KidSpec = {
  id: 'mila',
  skin: '#9c6542',
  hair: 'puffs',
  hairColor: '#3a2419',
  top: 'dress',
  topColor: '#f6c435',
  topColor2: '#fbf3e4',
  pants: '#9c6542',
  shoes: '#e0607e',
  bow: '#e8629c',
  iris: '#6b4226',
  lashes: true,
  knit: true,
};

// LEO (6) — the brave, silly one who tries first and gets it wrong (kids LOVE correcting him).
// Blue stripes, tousled ginger hair, green eyes.
export const LEO: KidSpec = {
  id: 'leo',
  skin: '#f4c9a8',
  hair: 'tousled',
  hairColor: '#e07a3a',
  top: 'stripes',
  topColor: '#5aa7d4',
  topColor2: '#f7fbfd',
  pants: '#3e5f8c',
  shoes: '#7cc35a',
  iris: '#4f9a4a',
};

// BOBO — the little bear buddy: hungry, clumsy, huge heart. Red scarf.
export const BOBO: CritterSpec = {
  id: 'bobo',
  species: 'bear',
  fur: '#a8703f',
  fur2: '#dcb286',
  dark: '#5b3a22',
  iris: '#4f9a4a',
  scarf: '#c8373a',
};

// PROFESSOR HOOT — the wise owl who explains science and sets the puzzles. Glasses + grad cap.
export const HOOT: CritterSpec = {
  id: 'hoot',
  species: 'owl',
  fur: '#8b735f',
  fur2: '#d2c1ad',
  dark: '#6e5848',
  glasses: true,
  hat: 'grad',
  iris: '#5a86b4',
};

export const CAPTION_COLORS: Record<string, string> = {
  mila: '#ffca3a',
  leo: '#4cc9f0',
  bobo: '#ff924c',
  hoot: '#b197fc',
  narrator: '#ffffff',
};

export const CHANNEL = {
  name: 'Tiny Sparks',
  tagline: 'Learn, laugh and sing with Mila, Leo & Bobo!',
  accent: '#ff595e',
};

// ── TINY SPARKS HEROES — the cast's ORIGINAL superhero outfits (user request, Day 23+). Same faces,
// same hair, same colours family, so kids still recognise them; capes / masks / emblems are our
// own designs (never a real franchise's costume or logo). Use these specs instead of the everyday
// ones for every episode from now on (or only for hero episodes if the user changes their mind).
export const MILA_HERO: KidSpec = {
  ...MILA,
  id: 'mila-hero',
  top: 'tee',
  topColor: '#ffca3a', // yellow suit
  pants: '#ff6fa5',
  shoes: '#ff6fa5',
  hero: { cape: '#ff6fa5', capeIn: '#ffd6e7', mask: '#ff6fa5', emblem: 'spark', emblemColor: '#ff6fa5', emblemInk: '#fff3b0', belt: '#ffffff' },
}; // "SPARK GIRL"
export const LEO_HERO: KidSpec = {
  ...LEO,
  id: 'leo-hero',
  top: 'tee',
  topColor: '#4cc9f0', // sky-blue suit
  pants: '#1d4e89',
  shoes: '#ff595e',
  hero: { cape: '#ff595e', capeIn: '#ffb3b3', mask: '#1d4e89', emblem: 'star', emblemColor: '#ffca3a', emblemInk: '#ff595e', belt: '#1d4e89' },
}; // "CAPTAIN LEO"
export const BOBO_HERO: CritterSpec = {
  ...BOBO,
  id: 'bobo-hero',
  scarf: undefined,
  hero: { cape: '#ff595e', capeIn: '#ffb3b3', mask: '#2b2d42', emblem: 'honey', emblemColor: '#ffca3a', emblemInk: '#ff924c', belt: '#2b2d42' },
}; // "SUPER BOBO"
export const HOOT_HERO: CritterSpec = {
  ...HOOT,
  id: 'hoot-hero',
  hero: { cape: '#7b2cbf', capeIn: '#d0b3ff', emblem: 'gear', emblemColor: '#8ac926', emblemInk: '#ffffff', belt: '#ffd166' },
}; // "PROFESSOR HOOT" (glasses instead of a mask)
export const HERO_NAMES: Record<string, string> = { mila: 'Spark Girl', leo: 'Captain Leo', bobo: 'Super Bobo', hoot: 'Professor Hoot' };
