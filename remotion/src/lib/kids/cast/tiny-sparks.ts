// TINY SPARKS — the LOCKED recurring cast of the kids channel. Episodes import these specs and
// never edit them (same iron rule as the Bro series): a kid recognises a friend by the exact
// colours and silhouette. One-off characters are new specs in the episode file.
import type { KidSpec } from '../kid';
import type { CritterSpec } from '../critter';

// MILA (6) — the curious one who asks "why?". Yellow dress, two hair puffs, pink bow.
export const MILA: KidSpec = {
  id: 'mila',
  skin: '#c98b62',
  hair: 'puffs',
  hairColor: '#3b2219',
  top: 'dress',
  topColor: '#ffca3a',
  topColor2: '#ffffff',
  pants: '#c98b62',
  shoes: '#ff595e',
  bow: '#ff6fa5',
  lashes: true,
};

// LEO (6) — the brave, silly one who tries first and gets it wrong (kids LOVE correcting him).
// Blue stripes, ginger hair, freckles.
export const LEO: KidSpec = {
  id: 'leo',
  skin: '#f6d0b1',
  hair: 'short',
  hairColor: '#e07a3f',
  top: 'stripes',
  topColor: '#4cc9f0',
  topColor2: '#ffffff',
  pants: '#3a5a8c',
  shoes: '#8ac926',
  iris: '#3a7d44',
  freckles: true,
};

// BOBO — the little bear buddy: hungry, clumsy, huge heart. Red scarf.
export const BOBO: CritterSpec = {
  id: 'bobo',
  species: 'bear',
  fur: '#b07947',
  fur2: '#f1d1a8',
  dark: '#6b4226',
  scarf: '#ff595e',
};

// PROFESSOR HOOT — the wise owl who explains science and sets the puzzles. Glasses + grad cap.
export const HOOT: CritterSpec = {
  id: 'hoot',
  species: 'owl',
  fur: '#9c7a64',
  fur2: '#f5e6d3',
  dark: '#6d4c41',
  glasses: true,
  hat: 'grad',
  iris: '#2b6cb0',
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
