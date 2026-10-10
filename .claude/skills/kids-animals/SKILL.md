---
name: kids-animals
description: 🦁 Animated ANIMAL stories for kids (ages 2–7) on Tiny Sparks — meet an animal (its sound, home, food, one amazing fact) and watch a tiny story starring it, using the Critter rig (bear, bunny, cat, fox, lion, mouse, panda, pig, owl, frog, monkey, dog, elephant, turtle) + the Fish rig and the Meadow/Forest/Underwater sets. Use for "animal video for kids", "animal sounds", "story with animals", "farm/jungle/sea animals for kids". Read make-kids first.
---

# kids-animals — meet them, hear them, love them

Read `.claude/skills/make-kids/SKILL.md` first.

## The loop

**GUESS WHO → MEET → SOUND → 3 FACTS → TINY STORY → GOODBYE**

1. **Guess who** (hook): a silhouette, a tail poking out, or footprints — "Who's hiding?" + a
   ThinkTimer. The reveal is a pop + the animal's happy face.
2. **Meet**: the animal waves and says its name (a voice that fits: a pitched-up `af_bella`
   for a bunny, a deep `am_onyx` -2 for a lion who is actually gentle).
3. **Sound**: the real sound as a word kids repeat ("The lion says ROAR!") — repeat it 2×,
   invite the child ("Can you roar?"). Use library SFX if available; otherwise the voice.
4. **3 facts** (true, simple, kid-checkable): where it lives, what it eats, one WOW fact
   ("A frog can jump 20 times its body!"). Each fact = one visual (home set, food prop, action).
5. **Tiny story** (Shorts: 10–15 s, long: 1–3 min): the animal has a small problem that its
   special ability solves (the bunny's big ears hear the lost kitten).
6. **Goodbye**: wave, sound once more, Confetti.

## Species on the rig (Critter)

bear · bunny · cat · fox · lion · mouse · panda · pig · owl · frog · monkey (added Day 18) · dog (added Day 23) · elephant (added Day 25) · turtle (added Day 32: fur = skin, fur2 = plastron, dark = shell; `tuck={0..1}` hides the head + paws in the shell — works on any Critter) — colour each with
fur/fur2/dark; accessories (bow, scarf, party hat) for personality. FISH (added Day 30) is its own rig:
`<Fish spec={{id, body, belly, fin, pattern: 'none'|'stripes'|'spots'|'rainbow', patternColor, bow}} …/>` in
`lib/kids/sea.tsx` (same face/expressions, wagging tail, flapping fins, `swimming`, `facing`) + `<Bubbles>`; use
`<Underwater life={false}>` when an episode COUNTS fish (no ambient extras). Other animals (elephant,
giraffe, fish, duck…) need a new species in `critter.tsx` first (same face, new ears/body
details) — add it to the model sheet zoo and re-render character.png.

## Rules

- Facts must be TRUE (no "owls turn their heads all the way around" — it's ~270°). Keep a
  source note per fact in script.md.
- Animals are friendly and never threatening; predators eat "fish" or "berries" on screen, never
  other cute animals.
- Animals face the camera to talk; `facing` only for walking in/out.
- Pair Bobo (the recurring buddy) with the guest animal so every episode keeps a familiar face.

## Formats

Short (9:16, 40–60 s): one animal, full loop compressed. Long (16:9, MIN 5 min, 5–7 min): 4–6 animals of
one habitat (farm, forest, sea, jungle) with a running mini-story (Bobo visits the farm); then
compilations ("Animal Sounds for Kids | 20 min").

## Idea bank

Who says moo? (farm sounds) · Lion's gentle roar · Bunny's big ears save the day · Frog's big
jump · Panda's bamboo lunch · Fox and the lost acorn · Owl is awake at night (why?) · Mouse and
the cheese map · Pig loves mud (to stay cool!) · Cat's 9 naps · Ocean friends (needs a fish
species) · Baby animals and their mums.

## Title / description / tags

`Meet the Lion! 🦁 Animal Sounds & Facts for Kids | Tiny Sparks` · description: the 3 facts as
bullets · tags: animals for kids, animal sounds, learn animals, toddler animals, zoo, Tiny Sparks.

## Niche QA

Facts true + sourced · the sound said 2× with an invite · the animal's face readable in close-up
· no threatening poses · habitat set matches the animal.
