---
name: make-paperdoc
description: Build a DRAWN DOCUMENTARY ("big stories, drawn small") end-to-end from one script — crayon-drawn characters (rough.js line boil), paper-sheet montage, word-timed reveals, charts, timelines, stamps, sources — in the style of money/history explainer channels (Paper Billions, Crayon Capital). 16:9 long videos (5–20 min) or 9:16 Shorts. Use when the user wants a "paper / crayon / drawn documentary", a finance or history explainer with drawn characters, "a video like Paper Billions / Crayon Capital", or a new episode under paper-docs/. Not for the kids channel (make-kids), not for the hand-choreographed vox collage (make-vox).
---

# make-paperdoc — drawn documentaries from one script

**One file in, one video out.** You write `paper-docs/<slug>/doc.json` (a list of scenes, one narration line
each); `python tools/paperdoc.py paper-docs/<slug>` does the rest: voice → timing → composition → SFX plan →
render → mux → SFX → music. The montage is automatic — that is the point of this track.

## The engine (remotion/src/lib/paperdoc/)
- `rough.tsx` — rough.js (MIT) crayon strokes as SVG; `boilSeed(frame)` re-seeds every 4 frames = the line boil
  that makes it read hand-drawn. `CrayonDefs` = paper-tooth crayon texture filter. `CRAYON` palette.
- `doodle.tsx` — the crayon character rig `<Doodle spec pose expr prop talk facing walk />`.
  Cast: `DOODLES.banker trader worker merchant investor kid king narrator` (generic types, never real people).
  Poses: stand wave point cheer shrug think hold facepalm cross present. Expressions: neutral happy grin sad
  shock worried smug angry think. Props: money coin tulip phone briefcase paper chart. Model sheet:
  `PaperDocDoodleSheet`. New one-off characters = a spec object in the scene (`"who": {…}`), not a kit edit.
- `index.tsx` — `<PaperDoc vo scenes captions />` + the `Scene` type. What the engine does by itself:
  each scene arrives as a new paper sheet sliding over the last (right → bottom → left), the camera never
  stops (slow push + drift) and punches in on the key moment, every element appears ON the word the narrator
  says it (`cue`), and everything boils.

## Scene types (one narration line each — keep lines 1–2 sentences, 3–9 s)
| type | fields | use it for |
|---|---|---|
| `title` | kicker, title, sub | cold-open title AFTER the hook, chapter cards, the ending |
| `statement` | text, hl[] | the one sentence on screen; words appear as spoken; `hl` = marker highlight |
| `number` | value, prefix, suffix, decimals, label, cue | a shocking figure counting up |
| `chart` | kind line/bars, points[{label,value}], unit, peak, title | rise and fall, comparisons |
| `timeline` | events[{date,label,cue}] | history in 3–5 dates |
| `compare` | left/right {title,value,icon,color}, cue | price vs value, then vs now |
| `list` | title, items[] | sticky notes, 2–6 items |
| `quote` | text, who | a REAL, sourced quote, typed out |
| `document` | title, lines[], hl, cue | a filing/report, one line highlighted — only real wording |
| `scene` | caption, props[{prop,x,y,s,cue}] | characters acting the story (cast is the star) |
Every scene also takes: `cast[]` (`who x y s pose expr prop facing talk cue enter acts[[cue,pose,expr]]`),
`stamp {text,cue}`, `source` (the trust chip — use it on every fact that could be questioned), `bg`
(paper/kraft/grid/night), `gap` (pause after the line).

## Writing rules (what makes these channels grow)
1. **Hook in the first 5 s:** open on the most shocking number or moment (a `number` or `scene`), THEN the title.
2. **Something changes every 2–3 s** — that's why one scene per sentence; cut long sentences in two.
3. **Simple words** ("explained like you're five"), one idea per line, a character reacting to every big beat.
4. **Facts are sacred:** every figure and claim from a real source, put in `source`. Charts that are
   illustrative say so in their title ("(illustration)"). Never invent quotes or documents; never show a
   real person as a character (generic types only); be careful with living people and companies — stick to
   court records, filings and reputable reporting.
5. **End on the lesson** (a `compare` or `title`), no begging for subscribes.
6. Long videos: 5–20 min = 60–250 scenes; chapters every ~2 min with a `title` card (good for YouTube chapters).

## Run
```
python tools/paperdoc.py paper-docs/<slug> --no-render        # voice + timing + composition + SFX plan
cd remotion && node scripts/frames.mjs <Id> <frames> --scale=0.4   # QA: read the frames (75% into each scene)
python tools/paperdoc.py paper-docs/<slug>                    # full build → paper-docs/<slug>/output/
```
Voice: `doc.json "voice"` is any gen_voice cast entry (Kokoro `bm_george` default; ElevenLabs/Azure if keys are
set — a documentary deserves the best narrator you have). Music: `docu-pluck` or `cinematic-min` beds.
Long renders are chunked and resumable (render-all.mjs), so a crash costs one piece, not the video.

## QA checklist
Words never collide (statement uses native layout) · numbers/labels readable at phone size · each scene's key
element landed by 75% of its window · characters inside the frame · `source` chip on factual claims · the first
5 seconds are the hook.
