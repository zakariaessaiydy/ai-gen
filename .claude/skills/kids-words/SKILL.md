---
name: kids-words
description: 🔤 English and French VOCABULARY for children (ages 2–7) on Tiny Sparks — picture flash cards, one word at a time, said 3 times, then in French (or French first for a FR channel), then used in a tiny sentence. Themes: colours, animals, fruit, body parts, clothes, family, weather, feelings, opposites, the alphabet/phonics. Bilingual voices via Kokoro (af_heart / ff_siwis, `lang: "fr"` lines). Use for "vocabulary for kids", "learn English/French", "first words", "ABC", "bilingual kids video". Read make-kids first.
---

# kids-words — see it, hear it, say it (twice, in two languages)

Read `.claude/skills/make-kids/SKILL.md` first.

## The word loop (≈10–12 s per word — see make-kids PACING: separate repetitions, pauses, 2.5 s between words)

1. **Picture first** — the object appears big (a prop drawing, a Critter, a set element) with a
   pop + sound. A character points at it (`armR="point"`).
2. **English ×3** — "Apple." (pause) "Apple!" (character says it, excited) "A-pple." (slow,
   syllables). `WordCard` shows the word, with the first letter in the theme colour.
3. **French** — the narrator in French (`speaker: "narrator_fr"`, `lang: "fr"`, voice
   `ff_siwis`): "En français : la pomme !" — WordCard's second line shows `la pomme` (always
   WITH its article: le/la/l'/un/une — gender is learnt with the word).
4. **Use it** — one tiny sentence with action: "Bobo eats the apple! Crunch!"
5. Every 3 words: a **mini-quiz** ("Where is the… banana?" 3 items, ThinkTimer, AnswerMark ✓).

A FRENCH-first channel flips steps 2/3 (French ×3, then English). Keep ONE language
primary per channel/playlist; the second language is the bonus.

## Short (9:16, 30–50 s) — 4 words of one theme

Hook (0–2 s: Mila holds a mystery box, "What's inside?") → 4 word loops → quiz on one of them →
Confetti → loop.

## Long (16:9, MIN 5 min, 5–8 min)

TitleCard → 10–12 words of a theme in a matching set (fruit = Meadow picnic, sea animals =
Underwater, space words = Space) → a quiz every 3 words → a recap montage (all cards in a grid,
each says its word) → goodbye.

## Rules

- Concrete nouns before abstract words; one theme per video.
- Correct French spelling WITH accents (é, è, ç, à, ê) and correct articles — QA every card.
- Pronunciation: Kokoro reads French with `lang: "fr"`. If a word sounds wrong, give a phonetic
  `tts` variant on the line (the `text` stays correct for captions).
- English: use American spelling by default (color) unless the user picks British.
- Never more than ONE new word on screen at a time.
- Alphabet/phonics: letter shape → its SOUND ("A says /a/") → 2 words starting with it.

## Idea bank

Colours (EN/FR) · Fruit · Farm animals · Sea animals · My body (head, eyes, nose…) · Clothes
(Bobo gets dressed) · Family words · Weather · Feelings (happy, sad, angry, scared) · Opposites
(big/small, hot/cold) · In the classroom · ABC phonics A–E (series) · Numbers in French (un→dix,
links to kids-numbers) · Toys · Food at breakfast · Transport (car, bus, train, plane).

## Title / description / tags

`Learn Colors in English & French 🎨 | First Words for Kids | Tiny Sparks` · description: the
word list in BOTH languages (parents search it) · tags: vocabulary for kids, learn English,
learn French, apprendre l'anglais, bilingual kids, first words, flashcards, Tiny Sparks.

## Niche QA

Each word: picture visible BEFORE the word is said · WordCard spelling + accents + article ·
French line uses the French voice · quiz answer matches · ≤ 1 new word on screen.
