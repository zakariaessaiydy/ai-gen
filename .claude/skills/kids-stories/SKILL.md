---
name: kids-stories
description: 🧠 Educational STORIES for kids (ages 3–7) on the Tiny Sparks channel — a short adventure with the locked cast where the plot itself teaches ONE thing (brushing teeth, why we wash hands, how plants grow, days of the week, sharing a toy, being brave at the doctor). Shorts (45–60 s) and long episodes (3–6 min). Use when the user asks for an "educational story", "story video for kids", "learning story", "adventure that teaches". Read make-kids first. Not for fables with a moral (kids-morals) or pure facts (kids-science).
---

# kids-stories — a story that teaches one thing

Read `.claude/skills/make-kids/SKILL.md` first (cast, style, voices, music, YouTube rules).

## The loop (every episode)

**WANT → TRY → OOPS → LEARN → DO IT → CELEBRATE → RECAP**
A character wants something real, tries the wrong way (funny, safe), a friend or Prof. Hoot
shows the right way in 3 simple steps, they succeed, everyone celebrates, and the 3 steps are
repeated as a tiny recap the child can copy.

## Short (9:16, 45–60 s)

| t | beat | on screen |
|---|---|---|
| 0–3 s | HOOK: the want/problem, in action | Bobo's tummy rumbles / Leo's tooth hurts / Mila can't find her shoe — close-up, `oops` face |
| 3–10 | TRY (wrong, funny) | Leo tries the silly way; it doesn't work (`surprised`) |
| 10–30 | LEARN: 3 steps | each step = one big PopText word + an action + a sound; say the step word twice |
| 30–42 | DO IT | the character does the 3 steps successfully; kid copies along ("Your turn!") |
| 42–52 | CELEBRATE + RECAP | Confetti, "1, 2, 3!" recap with icons, everybody `happy` |
| 52–60 | loop | a wave that cuts back to frame 0's pose |

## Long (16:9, MIN 5 min, 5–7 min)

TitleCard (1.2 s) → 2–3 scenes in different sets → the same loop but with a mid-story
complication (the first fix almost works) → a short song or chant of the 3 steps
(`kids-songs`) → recap → goodbye wave "See you next time, friends!".

## Writing rules

- ONE learning goal, stated as 3 kid-sized steps ("Wet. Soap. Scrub for a song!").
- Lines ≤ 8 words. Present tense. Name the feeling ("Leo feels frustrated").
- The child is invited at least twice ("Can you help Bobo?", "Show me your bubbly hands!").
- Safe behaviours only — the "wrong way" is silly, never dangerous or gross.
- The narrator (`af_heart`) bridges scenes; characters speak most lines.

## Visual devices

`PopText` for each step word · numbered step icons (CountRow with custom items) · `Bubble` for
thoughts · a progress strip of the 3 steps that fills in · `Confetti` on success · set changes
for time passing ("The next morning…" over Bedroom → Meadow).

## Idea bank (track status in kids-shorts/tiny-sparks/IDEAS.md)

Bobo learns to wash his paws · Leo brushes his teeth (2 minutes is a song!) · Mila's first day at
school · Days of the week with Bobo's lunchbox · How a seed becomes a flower · Leo is scared of
the dark (the night light) · Going to the doctor · Tidy-up time race · Crossing the road safely
(stop, look, listen) · Bobo learns to tie his scarf · Sleepy Bobo's bedtime routine · Rainy-day
clothes (what to wear for the weather).

## Title / description / tags

- Title: `Bobo Learns to Wash His Paws 🧼 | Tiny Sparks Kids Stories` (character + verb + the
  learning, ≤ 60 chars before the pipe).
- Description: 2 lines of what kids learn + "Perfect for ages 3–6." + the 3 steps as a list.
- Tags: kids stories, educational cartoon, learning for toddlers, <topic>, preschool, Tiny Sparks.

## Niche QA

The 3 steps are visible AND said · the wrong try is safe · the recap matches the steps exactly ·
the child is addressed directly ≥2 times · total on-screen text per frame ≤ 1 word/phrase.
