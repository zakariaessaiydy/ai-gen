---
name: make-kids-story
description: Build a 16:9 KIDS STORY episode (1920×1080, 2–4 min) for a preschool channel end-to-end — the locked recurring cast (Sammy the turtle, Oliver the owl, Mila the bunny) acting out a data-driven shot list in Remotion, a hook that is already moving at frame 0, per-character voices with word-synced captions, a spoken next-episode tease instead of end screens, an auto-cropped 9:16 teaser Short, and stitching episodes into long themed compilations with YouTube chapters. Use when the user wants a "kids story", "kids episode", "Tiny Sparks video", "Sammy / Oliver / Mila episode", "animal story for kids", "bedtime story compilation", or a "kids compilation / marathon". Not for vertical-only shorts (make-short), video-model pixels (make-ai-short) or collage (make-vox).
---

# make-kids-story — 16:9 kids episodes, Shorts teasers, compilations

Built from the channel's own analytics: viewers left at **~25–40 s** of 3–5 min videos, almost
**no one came back**, and **compilations held ~8 min per view**. Every rule here targets one of those.

Run everything from the **repo root**. Read `kids-stories/CAST.md` before writing a story.

## Artifact contract

```
kids-stories/ks-N-<slug>/
  beats.json   THE contract: track, format 1920x1080, vo[] (+ "speaker"), beats[], shots[],
               shortCut {start,end}, voices {engine: {castId: voice}}
  script.md    the beat sheet
  voice/ output/                                                    [gitignored]
remotion/src/shots/ks-N/
  KsN<Slug>.tsx          <StoryPlayer> — NO drawing code; it plays shots.gen.ts
  KsN<Slug>Vertical.tsx  <VerticalCut> — 1080x1920 teaser, durationInSeconds == cut length
  shots.gen.ts           emitted from beats.json by build_short's gen stage — never hand-edit
  vo.gen.ts              script estimates until the voice stage writes real word times
kids-stories/compilations/<name>.json  →  output/<id>.mp4 + <id>-chapters.txt
```

Kit: `remotion/src/lib/kids.tsx` — CAST (the locked model sheet), Scene (meadow / forest / pond /
night / home), Character (actions idle / walk / hop / fly / sleep / cheer / shake; moods),
Prop (acorn / apple / ball / star / sprout), QuestionBubble, SeriesChip, NextUp, StoryPlayer,
VerticalCut. **New scenes, characters, props or actions go in the kit**, so every episode gets them,
and they must be added to the single-line `as const` arrays that `tools/kids_lib.py` parses.

## Stage 0 — scaffold

```
python tools/new_kids_story.py sammy "Sammy and the Rolling Acorn" --friend oliver --duration 150
```
It renders as-is. Then replace the TODOs in `beats.json`.

## Stage 1 — the story (beats.json)

Grammar: **HOOK** (0–3 s) → SETUP → PROBLEM → TRY (alone, fails) → HELP (a friend) → SUCCESS →
LESSON (one sentence, said twice) → **NEXT** (last ~8 s).

- **HOOK.** The hero is already mid-action at frame 0, with a question bubble already up
  (`ask`, `askAt: 0`). The first VO word lands by 0.5 s and is a question or exclamation. No logo,
  no title card, no "hi friends".
- **A new picture every ≤ 8 s**: a cut, a camera move (`zoom`, `pan`) or a new action. Kids notice
  stillness.
- **Narration ≤ 2.2–2.4 words/sec.** Short sentences, words a 4-year-old knows, repeat the key
  words, and ask the viewer to take part ("Can you see the acorn too?").
- **Characters speak in their own voices**: put `"speaker": "sammy"` on the line, and their mouth
  moves only while their words are spoken.
- **NEXT.** A shot with `next: {title, cast}` shows the drawn card while the narrator says the
  tease. Made for Kids videos have no end screens, cards or comments, so this card and the
  playlists are what keep viewers watching the next episode. **Never** "subscribe / comment / like".
- **shortCut.** The 20–40 s window that works alone as a teaser (usually hook + setup, ending on
  the cliffhanger). Keep the `Vertical.tsx` `durationInSeconds` equal to its length.

## Stage 2 — preflight + QA

```
python tools/check_short.py kids-stories/ks-N-<slug>          # kids rules + crash rules, ~1s
python tools/build_short.py kids-stories/ks-N-<slug> --stages gen   # re-emit shots.gen.ts / vo.gen.ts
cd remotion && node scripts/frames.mjs KsN<Slug> --auto        # READ the contact sheets
cd remotion && node scripts/frames.mjs KsN<Slug>Vertical 0,150,450,900
```
Check frame 0 (hero and bubble, no fade), that every shot's cast is on screen, that the bubble
does not cover faces, that the NEXT card is legible, and that the vertical crop keeps the lead in
frame. On a machine where Remotion cannot download its browser, set
`REMOTION_BROWSER_EXECUTABLE` to an installed Chrome or Chromium.

## Stage 3 — build

```
python tools/build_short.py kids-stories/ks-N-<slug>                 # voice → render → mux → sfx → music → short
python tools/build_short.py kids-stories/ks-N-<slug> --engine edge   # free voice, no key
```
`voicePlan` sets the narrator, and `voices.<engine>` casts the characters. The `short` stage
renders the vertical cut and muxes the matching slice of the richest audio available (music mix
before SFX mix before voice). For SFX taste and the library-first flow, use `/suggest-sfx`.
A soft music bed (`--music <bed>`) suits this audience.

## Stage 4 — compilations (the watch-time engine)

```json
// kids-stories/compilations/animal-stories-1.json
{ "id": "animal-stories-1", "title": "Animal Stories for Kids | 20 Minutes | Tiny Sparks",
  "episodes": ["kids-stories/ks-1-acorn", "kids-stories/ks-2-stars", "kids-stories/ks-3-..."] }
```
```
python tools/compile_kids.py kids-stories/compilations/animal-stories-1.json [--dry-run]
```
It trims each episode's NEXT tease except on the last one, normalises the video and audio, and
writes a chapters file to paste into the description (≥ 3 chapters, first at 0:00). Aim for
15–60 min, with one theme per compilation.

## Publishing notes (tell the user; do not automate)
- Upload the episode, its vertical teaser (as a Short), and add the episode to its **series
  playlist** plus a themed playlist. Playlists keep autoplay on the channel now that end screens
  are gone.
- Thumbnail: one big character face with a clear emotion, 2–3 large words, the same layout for
  the whole series.
- Every episode needs its own real story and lesson. Template-only variations count as
  "repetitive/mass-produced" content under YouTube's kids quality and monetization policies.
