# CLAUDE.md — claude-faceless-shorts-creator

A **faceless-shorts factory** driven by Claude Code. Four production tracks, one repo — the
right skill is picked automatically from the request:

| The user asks for… | Skill | Pixels come from | Projects live in |
|---|---|---|---|
| "make a short about X" (default) | `/make-short` | 100% TSX (Remotion animation) | `shorts/short-N-<niche>/` |
| "make an AI video short", "blue-man video" | `/make-ai-short` | a fal video model (locked recurring character) | `ai-shorts/<series>/` |
| "vox style / documentary / explainer short" | `/make-vox` | layered paper-collage (AI images + cutouts) | `vox-shorts/vox-N-<topic>/` |
| "cartoon / character series / new Bro episode" | `/make-toon` | 100% TSX 2D cartoon rig (LOCKED recurring cast, dialogue) | `toon-shorts/<series>/ep-NN-<slug>/` |

All four share the same backbone: a `beats.json` contract, ElevenLabs voice with word-exact
captions (`gen_voice.py`), frame-by-frame QA at phone scale, library-first SFX (`/suggest-sfx`),
optional music bed, seamless frame-0==last-frame loops, no CTA outros. TSX crash rules live in
`/vidtsx-2d-generator`.

## Layout

```
tools/            Python tools. Pipeline drivers: new_short (scaffold), check_short (preflight),
                  build_short (voice→render→mux→sfx→music in one command).
                  Media: gen_voice, gen_sfx, gen_music, mix_sfx, mix_music, gen_chords,
                  gen_image, gen_clip, bakeoff_clip, cutout, capture_web, ffmpeg_path
remotion/         the Remotion project — src/lib/ (shared + niche kits incl. collage.tsx),
                  src/shots/{short-N, ai-N, vox-N}/
media/            Remotion's public root: library/ (reusable: sfx, music, logos)
                  + projects/<proj>/ (media for ONE video — incl. committed AI clips & layers)
shorts/           TSX shorts: script.md, beats.json, sfx-plan.json each
ai-shorts/        generative shorts: + character.json (LOCKED reference), shot sidecars, IDEAS.md
vox-shorts/       collage shorts: + DESIGN.md (the visual language — read before any vox work)
toon-shorts/      cartoon series: <series>/series.json (bible) + character.png + IDEAS.md + ep-NN-*/
brand.md          the style contract every skill reads (palette, motion, safe areas, SFX taste)
IDEAS.md          the TSX-shorts idea bank + niche ranking
.claude/skills/   make-short, make-ai-short, make-vox, make-toon, vidtsx-2d-generator, suggest-sfx
```

## Conventions (hard rules)

- **Run everything from the repo root.** Tools resolve engine paths (media/library, catalogs)
  against their own location, but project paths (`shorts/...`) against the CWD.
- **Python:** any Python 3.10+ — the core pipeline is stdlib-only. Only vox layer production
  needs extras: `pip install pillow rembg` (cutout.py) and `pip install playwright &&
  playwright install chromium` (capture_web.py). `ffmpeg`/`ffprobe` and `node`/`npx` on PATH.
- **API keys** live in `.env` at the repo root (copy `.env.example`). Never commit `.env`.
  ELEVENLABS_API_KEY = voice/SFX/music · FAL_KEY = AI clips + images · GEMINI_API_KEY = images.
  Voice has a keyless fallback: `gen_voice.py --engine edge` (free Edge Neural TTS, still
  word-exact) — needs `pip install edge-tts`.
- **Registry is generated:** after adding/renaming a shot, `cd remotion && npm run gen`
  (frames.mjs/render-all.mjs do NOT run it themselves).
- **Media rules:** `media/library/` is for CROSS-VIDEO reusable assets only (each with a
  catalog). Anything generated FOR ONE video (story frames, AI clips, collage layers) goes in
  `media/projects/<proj>/`, referenced as `staticFile('projects/<proj>/x')`. Reuse before you
  generate — check the catalogs first.
- **Committed vs gitignored media:** AI-generated clips and collage layers in
  `media/projects/` ARE committed (paid, non-reproducible pixels). `*/voice/` and `*/output/`
  are gitignored everywhere (regenerable); `ai-shorts/*/shots/*.mp4` working copies too — the
  canonical clip lives in `media/projects/<name>/`.
- **Costs (ai-shorts only):** state the derived generation cost BEFORE spending it, and never
  regenerate a locked character from text (see /make-ai-short's iron rules).
- **QA is not optional:** render frames at phone scale and READ them before any full render.
- **Use the drivers, not the raw steps.** `python tools/new_short.py <niche> "<title>"` to
  scaffold, `check_short.py <project>` to preflight (~1s; catches the crashes a render would
  find 45s in), `node scripts/frames.mjs <Id> --auto` for QA (derives frames from beats.json,
  writes labelled contact sheets), `build_short.py <project>` to build. The build order is
  **voice → render → mux**: gen_voice writes the real word times into `vo.gen.ts` that the
  composition imports, so rendering first means rendering twice.
- **Caches you can trust:** the Remotion bundle (`remotion/out/.bundles/`, keyed on src+media),
  the render (skipped when the shot, libs and vo.gen.ts are unchanged — `--force` overrides),
  and TTS lines (keyed on engine+voice+text). Nothing re-bills or re-renders without a reason.
