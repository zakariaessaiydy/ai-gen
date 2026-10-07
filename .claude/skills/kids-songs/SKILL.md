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
- **Structure**: intro (2 bars) → verse → chorus → verse 2 → chorus → (bridge with an action:
  "clap clap!") → chorus → outro. 45–75 s for a Short, 2–3 min for a long song.
- **Actions** in the lyrics (clap, jump, spin, touch your nose) — kids dance along; the cast
  does the action on the beat.
- **Counting/lists** escalate verse by verse (1 duck, 2 ducks…).
- Chords: I–V–vi–IV or I–IV–V (C, G, Am, F) — happy, familiar, original as a combination.
- Never borrow a modern song's melody or lyrics. Public-domain melodies are fine with
  traditional or NEW lyrics (Twinkle Twinkle → our "Twinkle Twinkle Little Planet").

## 2. Make it (free, local)

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
- Reuse: a channel song's `bed.mp3` is the bed for its theme's other videos (`build_short.py
  --music <bed.mp3>`), and the chorus is the intro sting.

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
