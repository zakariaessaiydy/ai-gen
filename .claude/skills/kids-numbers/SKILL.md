---
name: kids-numbers
description: 🔢 Learning NUMBERS and early MATH for kids (ages 2–7) on Tiny Sparks — counting 1–10/1–20, number recognition, finger counting, more/less, shapes, simple addition/subtraction with objects, skip counting. Shorts and long videos built on CountRow, PopText, finger counting (Kid fingersL/R) and ThinkTimer. Use for "counting video", "numbers for kids", "math for toddlers", "learn to count", "addition for kids". Read make-kids first.
---

# kids-numbers — count it, see it, say it

Read `.claude/skills/make-kids/SKILL.md` first.

## The loop: CONCRETE → PICTURE → SYMBOL

Always objects first (apples, balloons, Bobo's honey pots), then the numeral, then the word.
Every number is shown **three ways at once**: N objects popping in (`CountRow` with rainbow
badges), the big numeral (`PopText`), and a character holding up N fingers (`fingersR={N}` with
`armR="count"`). The voice says the number as the object pops — sync each `times[i]` to the
word time of the number in vo.gen.ts.

## Short (9:16, 30–60 s) — "Count with Bobo: 5 Apples"

| t | beat |
|---|---|
| 0–2 s | Bobo holds up a basket: "How many apples?" (`think`) |
| 2–4 | ThinkTimer 3-2-1 (the child guesses) |
| 4–14 | apples pop one by one, everyone counts aloud: "One! Two! Three! Four! Five!" |
| 14–18 | PopText "5" + Mila shows 5 fingers: "FIVE apples!" |
| 18–26 | twist: Bobo eats one (oops face) → "Now how many?" → ThinkTimer → "FOUR!" (5−1 seen) |
| 26–32 | Confetti + recap "5 take away 1 is 4" with the objects still on screen |

## Long (16:9, MIN 5 min, 5–7 min)

Count 1→10 (one object type per number, a mini-gag every 3 numbers), a counting song in the
middle (`kids-songs`: "Count With Bobo"), then a "find the number" game (3 numerals on cards,
ThinkTimer, AnswerMark), then 10→1 rocket countdown blast-off in Space (`Space` set).

## Rules

- **The count on screen must equal the number said.** QA it frame by frame — a wrong count is
  a factual error parents WILL report.
- One new number per beat; never more than 10 objects on screen at once (use 2 rows of 5:
  `perRow={5}`).
- Say the number, pause ~0.4 s, show it: let the child say it first.
- Addition/subtraction ONLY with visible objects: join two groups (slide together) for +, one
  leaves (Bobo eats, a balloon floats away) for −.
- Use the RAINBOW order for badges consistently (1 red, 2 orange, 3 yellow…) — kids learn the
  colours with the numbers across episodes.
- French version: same video, `lang: "fr"` lines (un, deux, trois…) — see kids-words.

## Idea bank

Count to 5 with Bobo's apples · Count to 10 balloons · 10 little stars (bedtime count) · Rocket
countdown 10→1 · How many legs? (animals: 2 or 4) · Shapes hunt (circle, square, triangle in the
Meadow) · Bigger or smaller? · More or less (two plates of cookies) · Count by 2s with socks ·
Bobo's 1+1 picnic · Number 0 = nothing left · Find the missing number · Counting fingers & toes ·
The 100th day (long, compilation).

## Title / description / tags

`Count to 10 with Bobo 🍎 | Learn Numbers for Toddlers | Tiny Sparks` · description lists what's
counted + "Ages 2–5" · tags: counting, numbers for kids, learn to count, 123, toddler learning,
preschool math, Tiny Sparks.

## Niche QA

Objects = number said (every beat) · numeral glyph big and centred · fingers shown = number ·
badges in rainbow order · no maths without visible objects.
