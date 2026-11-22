---
name: kids-songs
description: 🎵 ORIGINAL educational SONGS for kids on Tiny Sparks — counting songs, ABC/phonics songs, colours, days of the week, brushing teeth, clean-up, animals, planets, lullabies — written as song.json, produced FREE with tools/gen_song.py (ukulele/xylophone/bass/drums + Kokoro chant or experimental sung vocal), and animated as a sing-along (SingAlong bouncing ball, dancing cast on the beatmap). Also public-domain nursery rhymes in our own arrangement. Use for "kids song", "nursery rhyme", "educational song", "sing-along", "lullaby", "free music for kids videos". Read make-kids first.
---

# kids-songs — write it, make it, sing along

Read `.claude/skills/make-kids/SKILL.md` first (especially **Music** — what is free and legal).

## 1. Write the song (the hit formula for preschool songs)

- **One idea, one hook line** repeated 3–4× (the chorus IS the lesson: "Wash, wash, wash your
  paws!").
- **Simple melody**: stays within ~6 notes (C4–A4), mostly stepwise, repeats, ends on the home
  note (C). Range a child can sing. 4/4, **90–120 bpm** (lullabies 60–75).
- **Structure**: `"introBars": 0` and open on the CHORUS (the hook, at ≤ 0.5 s) → verse → chorus → verse 2 → chorus → (bridge with an action:
  "clap clap!") → chorus → outro. 45–75 s for a Short; a 16:9 long video is MIN 5 min — the song (2–3 min) + a 2nd round / karaoke "now you sing!" repeat / a slower learning verse until ≥ 5:00.
- **Actions** in the lyrics (clap, jump, spin, touch your nose) — kids dance along; the cast
  does the action on the beat.
- **Counting/lists** escalate verse by verse (1 duck, 2 ducks…).
- Chords: I–V–vi–IV or I–IV–V (C, G, Am, F) — happy, familiar, original as a combination.
- Never borrow a modern song's melody or lyrics. Public-domain melodies are fine with
  traditional or NEW lyrics (Twinkle Twinkle → our "Twinkle Twinkle Little Planet").

## 2a. Sing it for real — ACE-Step on Kaggle (STANDARD from Nov 2026, free)

The user rejected the chanted Kokoro vocal (it sounds robotic) and approved ACE-Step 1.5 takes
("I love the voice, all of them"). Every published song now uses real AI vocals. The user's PC has no NVIDIA
GPU, so the singing runs on a free Kaggle T4:
```
python tools/song_to_ace.py [<song dir> ...]       # → tools/notebooks/ace_step_songs.ipynb (all jobs inside)
#   Kaggle: Import Notebook · GPU T4 x2 · Internet ON · Run All · download ace_songs.zip
#   unzip ace_songs.zip at the REPO ROOT  → kids-shorts/tiny-sparks/songs/<song>/ace/<style>-seed<N>.wav
python tools/align_song.py kids-shorts/tiny-sparks/songs/<song>   # best take → song.mp3 + song.gen.ts
```
- **When a video needs a song, hand the user ONLY the notebook (user rule, Nov 2026):** write song.json, run
  `song_to_ace.py` for just the song(s) needed, commit + push the `.ipynb`, and tell the user its path (one line: import on
  Kaggle, GPU T4, Run All, send back `ace_songs.zip`). Don't explain ACE-Step, don't ask them to pick styles or seeds. Build
  everything that doesn't need the song meanwhile; when the zip arrives, unzip it at the repo root and continue with
  align_song / align_sung below.
- **One video per take (user rule, Nov 2026)** — 2–3 takes → 2–3 videos. Long takes do NOT follow song.json's form
  (they skip verses, repeat choruses, add "ooh" bars), so use `python tools/align_sung.py <song dir>`: it maps the
  sections in the order they were SUNG and writes `song.A/B/C.gen.ts` (SONG + SONG_FORM) + `song-A/B/C.mp3`. Build the
  composition on `lib/kids/song-show.tsx` (shared routine: quiz, actions, karaoke in the take's longest gap, slow pass,
  dance breaks) as `SongNNN.tsx` + wrappers `KidsSongsNNN{A,B,C}.tsx` (see kids-songs-063…084). Render `--scale=1`,
  mux each with its `song-<L>.mp3` → `output/day-NNN-take-<L>.mp4`. Visuals must key on words/slots that exist
  (`show.at(seg, k)` falls back when the take skipped a line).
- Still write `song.json` exactly as below (form, sections, lyrics, bpm): it is the lyric source for ACE-Step
  AND the line list the composition indexes. Run `gen_song.py` once too: it gives the beatmap/length and a
  draft track for timing the animation while the Kaggle run happens.
- **Style rotation, no picking:** `songs/ace-styles.json` holds the bank (nursery, kidspop = user-approved;
  campfire, sunshine). Each new song gets the next style plus its seeds, written into its song.json `"ace"`. The user
  wants the melody/style to VARY between songs. Two takes per song; align_song keeps the one whose
  lyrics matched best (its score is in `ace/align.json`). Under 60 % = listen before using it.
- align_song writes the same `SONG / SONG_BEAT / SONG_DURATION` module gen_song wrote, so the composition
  doesn't change. Set `durationInSeconds` to the new `SONG_DURATION`, and re-check any cue computed in bars
  (e.g. a karaoke window `S(i) - 8 * BAR`): the AI's instrumental breaks aren't exactly N bars.
- What align_song already handles: ACE-Step plays a 4–10 s instrumental intro, so the tool CUTS it (the audio starts 0.25 s
  before the first sung word; `--no-trim` keeps it). The AI repeats or reorders lines, so the matching is ordered
  (a chorus can't jump to another chorus). It also handles UK spellings ('colour'), digits ('7' = seven), Whisper's
  stray words in the intro, and caches transcripts (`ace/*.words.json`) so a re-run is instant.
- Karaoke: the AI does NOT leave the instrumental bars song.json asked for. Compute the window from the take
  (`KAR0 = max(E(prev) + 0.5, …)`) and guard it with `KAR_ON` (the gap must fit the whole chorus, else no karaoke);
  anything else that reads KARAOKE (e.g. the 049 wheel keys) must respect KAR_ON too.
- Weak take (a card shows before its line is sung, score < 75 %): re-run with `--model medium.en`.
- The T4 gotchas are already handled in the notebook: float16 overflows → float32 patch; XL needs ~16 GB in
  float32, so use the 2B `acestep-v15-turbo` (or `-sft`); cuDNN off; models in /kaggle/tmp.

## 2. Make it (free, local) — the draft track + beatmap

```
kids-shorts/tiny-sparks/songs/<slug>/song.json      # bpm, chords, melody, lyrics, instruments, vocal
python tools/gen_song.py kids-shorts/tiny-sparks/songs/<slug>/song.json --vocal chant \
       --emit-ts remotion/src/shots/kids-songs-NN/song.gen.ts
```
- Melody: `NOTE:beats` tokens (`C4:1 E4:0.5 R:1`), `|` between bars (validated: each section's
  melody beats must equal its bars × beatsPerBar — fix the warnings).
- Lyrics: one syllable per sung note (`twin-kle`), `/` starts a new caption line, `_` holds the
  previous syllable over an extra note.
- `--vocal chant` (default, clear) / `--vocal sing` (EXPERIMENTAL toy-singer: syllables pitched
  onto the melody — audition with the user) / no vocal (instrumental for a karaoke version).
- Instruments: `lead` xylophone (bright, counting) · musicbox (lullaby) · whistle (silly);
  `chords` ukulele (happy strum) · piano (soft); `drums` soft|none; `leadWithVocal` doubles the
  melody so kids hear the tune even with chanting.
- Outputs: `song.mp3` (the track), `bed.mp3` (background for other videos), `beatmap.json`
  (chords, notes, syllable times), `song.gen.ts` (lyrics with word times).
- Reuse: a channel song's `bed.mp3` can be the bed for a calm episode of its theme (`build_short.py
  --music <bed.mp3>`). Song videos (long AND Shorts) have NO ident and NO instrumental intro: the
  chorus starts at ≤ 0.5 s (make-kids THE FIRST 10 SECONDS: the Colors Song lost 48 % of viewers at 9 s,
  right before its first sung word).

## 3. Animate the sing-along

- `<SingAlong t lines={SONG} />` — lyric bar with a bouncing ball on the current word.
- Lip-sync the singer: `mouth={lipSync(SONG, 'mila', t)}`.
- **Dance on the beat**: from `SONG_BEAT` (seconds per beat) → `hop = Math.abs(Math.sin(t / SONG_BEAT
  * Math.PI)) * 30`, arms alternate `up`/`wave` every bar, Bobo `clap`s on 2 and 4.
- Teach visually on the hook line: the counted objects pop with each number (`CountRow` times =
  the syllable times from beatmap.json), the colour fills, the planet zooms.
- Chorus = same staging every time (kids learn the choreography); verses change the scene.
- Shorts: hook = the chorus first (0–2 s), then a verse, chorus, loop. Long: full song + a
  "now sing it yourself!" karaoke repeat (instrumental + lyrics, no vocal).
- Audio: the song is the voice track — mux `song.mp3` as the audio (build with the song as
  the VO, or mux manually with ffmpeg), no extra music bed.

## Idea bank

Count With Bobo (1–10, ✅ demo song) · Wash Your Paws (handwashing) · The Colours Song (EN/FR) ·
Days of the Week · Brush Brush Brush (2-minute toothbrushing timer song) · Clean-Up Time · The
Planets Song · Animal Sounds Song (farm) · Shapes Song · Twinkle Twinkle Little Planet (PD melody,
new lyrics) · Goodnight Lullaby (Bobo's) · Head, Shoulders, Knees and Toes (PD) · Feelings Song ·
ABC phonics song (original melody — the classic ABC tune is PD too).

## Title / description / tags

`Count With Bobo 🐻 | Counting Song for Kids | Tiny Sparks Nursery Rhymes` · description: the
full lyrics (parents sing along; it's also search text) + "Original song by Tiny Sparks" ·
tags: kids songs, nursery rhymes, counting song, songs for toddlers, sing along, educational
songs, Tiny Sparks.

## Niche QA

Melody/chord warnings from gen_song = 0 · lyrics on screen match the voice word for word ·
bouncing ball on the sung word · dance moves on the beat (check 3 frames per bar) · the
lesson is VISIBLE on the hook line · song.mp3 loudness ~-16 LUFS (gen_song does it).
