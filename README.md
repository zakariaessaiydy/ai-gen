# claude-faceless-shorts-creator

**A faceless YouTube-Shorts factory you drive with [Claude Code](https://claude.com/claude-code).**
Five production tracks in one repo — you just describe the video, and the right pipeline runs:

| You say… | Track | The pixels |
|---|---|---|
| *"make a short about the ×11 trick"* | **TSX** (`/make-short`) | 100% code — a [Remotion](https://remotion.dev) composition, no footage, no stock |
| *"make an AI video short with blue-man"* | **Generative** (`/make-ai-short`) | a fal video model animating a **locked recurring character** |
| *"make a vox-style short about coffee"* | **Collage** (`/make-vox`) | Vox-documentary paper collage — AI-image layers, die-cuts, a traveling camera |
| *"new Bro episode"* | **Cartoon series** (`/make-toon`) | a 100%-TSX 2D cartoon rig with a locked recurring cast, dialogue and lip-sync |
| *"kids video about sharing"* · *"video of the day"* | **Kids channel** (`/make-kids` + 8 niche skills, `/video-of-the-day`) | the Tiny Sparks kids kit — Shorts and 16:9 long videos, driven by an 800-video calendar |

Every track shares the same backbone: TTS voice (ElevenLabs, or free Kokoro / Edge / Azure)
with **word-exact synced captions**,
frame-by-frame QA at phone scale, a reusable self-growing SFX/music library, seamless
frame-0==last-frame loops, and no dated engagement-CTA outros.

## 📖 Read the guide

I wrote up the whole system on my site, including the six-beat grammar that decides whether a
40-second short is worth finishing:
**[Make Faceless YouTube Shorts With Claude Code](https://learnwithhasan.com/guide/how-to-make-faceless-youtube-shorts-with-claude-code/?utm_source=github&utm_medium=readme&utm_campaign=claude-faceless-shorts-creator&utm_content=body)**

Free to read, no login. More build guides at
**[learnwithhasan.com/guides](https://learnwithhasan.com/guides/?utm_source=github&utm_medium=readme&utm_campaign=claude-faceless-shorts-creator&utm_content=body)**.

## The example videos (more coming)

**TSX shorts** — every composition is committed in `remotion/src/shots/short-N/` and renders the
exact video (`node scripts/render-all.mjs Short5Monty`); `shorts/` holds the full project
folders (script, beats contract, SFX cue sheet) for the latest ones. A sample of the series:

| # | Niche | Title / hook |
|---|---|---|
| 1 | Chess | The 4-Move Checkmate — Punished |
| 2 | Math | The ×11 Trick |
| 3 | Algorithms | Bubble vs Quick: The Race |
| 4 | Dev tips | `git reflog` undoes any mistake |
| 5 | Probability | Monty Hall, Finally Intuitive |
| 6 | Excel | Excel Reads Your Mind (Flash Fill / Ctrl+E) |
| 7 | Kids story | Little Pip (AI-image storybook, ages 4–6) |
| 8 | Cybersecurity | The URL That Isn't PayPal |
| 9 | Music theory | The 4 Chords In Every Hit |
| 10 | Money math | The 1% Fee That Eats 24% Of Your Retirement |
| 11 | Geography | The Map Lied To You |
| 12 | Physics | Astronauts Aren't Weightless. They're Falling. |

**Generative** (`ai-shorts/blue-man/`) — *The Door*: a clay-render character walking through
doors across worlds, thesis "arrival is a myth". Includes the **locked character sheet**
(`character.json` + reference PNG), the model bake-off records (Seedance vs Kling vs Veo, with
derived per-second costs), and the six generated clips — committed, because video-model pixels
are not reproducible.

**Collage** (`vox-shorts/vox-1-coffee/`) — a Vox-style documentary short on coffee's journey:
generated map/archival/cutout layers (committed), a camera choreographed across scenes, and
`DESIGN.md` — the full visual-language spec of the collage engine.

**Cartoon series** (`toon-shorts/bro/`) — *Bro Thinks He's Him*: twelve episodes on one locked
cast (`series.json` is the bible). **Kids channel** (`kids-shorts/tiny-sparks/`) — the Tiny
Sparks bible, cast sheet, free generated songs and the first story episodes; `publishing/ideas/`
feeds `TINY-SPARKS-CALENDAR.xlsx`, which `/video-of-the-day` walks through one video at a time.

Rendered videos aren't committed (they're reproducible from the repo); links to published
versions will be added here as they go live.

## How a short gets made

```
topic ──▶ script.md + beats.json      the beat grammar: HOOK (frame 0 = the thumbnail)
                │                      → SETUP → QUIZ → REVEAL → TWIST → seamless LOOP
                ▼
        the visuals                    TSX composition / video-model clips / collage layers
                │                      (per track — but always ONE Remotion timeline)
                ▼
        frame-by-frame QA              Claude renders PNGs at phone scale and READS them
                │
                ▼
        gen_voice.py                   TTS per line → REAL per-word timestamps
                │                      → captions highlight on the exact spoken word
                │                      (no key? `--engine kokoro` = free LOCAL TTS, or
                │                       `--engine edge` = free Edge Neural TTS)
                ▼
        sfx-plan.json + mix_sfx.py     library-first sound design, audition mix, your ear
                │                      is the final gate (optional music bed: mix_music.py)
                ▼
        <track>/<project>/output/*-sfx.mp4
```

Claude Code **skills** encode the craft (the main ones below; `.claude/skills/` has all 16):

- **`/make-short`** — the TSX pipeline: hook grammar, no-CTA outros, caption safe areas,
  Sequence-local frame math, loop-into-intro endings.
- **`/make-ai-short`** — the generative pipeline and its three iron rules: never regenerate a
  locked character from text, state the cost before spending it, loop by end-frame constraint.
- **`/make-vox`** — scene dissection into layers, cheapest-source layer production
  (gen_image + rembg cutouts, HTML→PNG, SVG-in-TSX), CollageBoard camera choreography.
- **`/make-toon`** — recurring-character cartoon episodes: locked cast, dialogue, poses,
  lip-sync, the series' signature ending.
- **`/make-kids`** — the kids-channel backbone (style bible, cast, Made-for-Kids rules) that the
  eight `kids-*` niche skills build on; **`/video-of-the-day`** makes the next calendar video.
- **`/vidtsx-2d-generator`** — the TSX authoring rules that keep Remotion renders from crashing.
- **`/suggest-sfx`** — taste-encoded sound design: function-first cues, layered hero moments,
  measured audibility (RMS-diff, not hope), a library that compounds across videos.

`brand.md` is the style contract (palette, type, motion, SFX taste) — swap it for your own
brand and every future short follows it.

## Quickstart

Requirements: [Claude Code](https://claude.com/claude-code) · Node 18+ · Python 3.10+ ·
`ffmpeg` on PATH · an [ElevenLabs](https://elevenlabs.io) key (voice/SFX/music) — or no key at
all with the free local Kokoro voice (`pip install kokoro-onnx && python tools/setup_kokoro.py`).
For the generative track add a [fal.ai](https://fal.ai) key. The core pipeline is stdlib-only;
the optional extras per feature (Kokoro, Edge TTS, collage layers, the kids calendar, songs) are
listed in `requirements-optional.txt`.

```bash
git clone https://github.com/hassancs91/claude-faceless-shorts-creator
cd claude-faceless-shorts-creator
cp .env.example .env          # add your keys
cd remotion && npm install && npm run gen && cd ..

claude                        # open the repo in Claude Code, then:
```

> **make a short about &lt;your topic&gt;** · **make an AI video short about &lt;idea&gt;** ·
> **make a vox-style short about &lt;story&gt;**

…or rebuild an example: *"re-render short-5 and regenerate its voice"*.

To just explore the compositions visually: `cd remotion && npm run studio`.

### Driving it by hand

The three drivers Claude uses are ordinary CLI tools — run them yourself if you prefer:

```bash
python tools/new_short.py salt "Why the ocean is salty"   # scaffold; renders immediately
python tools/check_short.py shorts/short-15-salt          # preflight, ~1s
cd remotion && node scripts/frames.mjs Short15Salt --auto  # QA frames + contact sheets, ~12s
python tools/build_short.py shorts/short-15-salt          # voice → render → mux, ~55s
python tools/build_short.py shorts/short-15-salt --draft  # half-scale motion check
```

`frames.mjs` and `render-all.mjs` refresh the shot registry themselves (`npm run gen:check`
verifies it is committed up to date; `npm run typecheck` runs `tsc`).

`build_short.py` runs the stages in the only correct order (the voice writes the word times the
captions render from, so the video is rendered **once**), skips a render when nothing that feeds
it changed, and prints a per-stage timing table. `check_short.py` catches the render-crashing
mistakes — non-deterministic hooks, non-monotonic `interpolate` ranges, a composition length
that disagrees with `beats.json` — in a second instead of 45 seconds into a render.

## Repo layout

```
.claude/skills/   the skills (this is where the "editor" lives)
tools/            Python: new_short, check_short, build_short (the pipeline drivers) +
                  gen_voice (+ setup_kokoro), gen_sfx, gen_music, mix_sfx, mix_music,
                  gen_image, gen_clip, bakeoff_clip, cutout, capture_web, gen_chords,
                  gen_song, next_video, loop_diff, audit_sfx · common.py (shared helpers)
remotion/         the Remotion project — shared kits in src/lib/ (incl. collage.tsx),
                  one folder per video in src/shots/
media/library/    reusable assets: SFX clips + music beds (catalogued, loudness-normalized)
media/projects/   media for one specific video — incl. committed AI clips & collage layers
shorts/           TSX project folders (script, beats.json, sfx-plan.json)
ai-shorts/        the generative track: blue-man/ (locked character) + IDEAS.md (cost tables)
vox-shorts/       the collage track: vox-1-coffee/ + DESIGN.md (the visual language)
toon-shorts/      cartoon series: bro/ (series.json bible + episodes)
kids-shorts/      the Tiny Sparks kids channel (channel.json bible, songs, episodes)
publishing/       ideas/<niche>.txt — the source of the kids calendar
brand.md          the style contract — make it yours
IDEAS.md          the TSX-shorts niche/idea bank
```

## License

MIT — see [LICENSE](LICENSE). Bundled SFX/music clips and example AI media were generated by
the repo author (ElevenLabs / fal / Gemini) and are redistributed here; per-clip provenance is
recorded in `media/library/*/catalog.json` and the per-shot `.json` sidecars.

<!-- lwh-footer -->

---

## 📘 The free book

This repo is one thing I built with AI. The book is the system underneath it.

**[Vibe Engineering Blocks](https://learnwithhasan.com/blocks/?utm_source=github&utm_medium=readme&utm_campaign=claude-faceless-shorts-creator&utm_content=footer)** is my free 74-page book.
47 building blocks for shipping real apps with AI. One block per page, each with the exact
prompt to hand your AI.

Built by **[Hasan Aboul Hasan](https://learnwithhasan.com/?utm_source=github&utm_medium=readme&utm_campaign=claude-faceless-shorts-creator&utm_content=footer)**. I build real products with AI and
write down exactly how.
[Guides](https://learnwithhasan.com/guides/?utm_source=github&utm_medium=readme&utm_campaign=claude-faceless-shorts-creator&utm_content=footer) &nbsp;·&nbsp;
[YouTube](https://www.youtube.com/@HasanAboulHasan) &nbsp;·&nbsp;
[Community](https://learnwithhasan.com/community/?utm_source=github&utm_medium=readme&utm_campaign=claude-faceless-shorts-creator&utm_content=footer)
