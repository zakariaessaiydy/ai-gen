---
name: make-kids
description: The KIDS CHANNEL backbone — style bible, locked cast (Tiny Sparks: Mila, Leo, Bobo the bear, Prof. Hoot), the kids art kit (chibi Kid rig, Critter animal rig, bright sets, teaching overlays), kid voices (Kokoro pitched + French), FREE music (tools/gen_song.py + legal free sources), YouTube "Made for Kids" rules, and the Shorts (9:16) + long-video (16:9) formats. Use for ANY children's cartoon video request ("kids video", "video for children", "cartoon for kids", "nursery", "preschool", "Tiny Sparks") and ALWAYS read it before a niche skill — kids-stories, kids-numbers, kids-words, kids-animals, kids-science, kids-puzzles, kids-morals, kids-songs. Not for the adult comedy series (make-toon).
---

# make-kids — the kids channel backbone

A kids channel wins on three things: **trust** (parents let it autoplay), **recognition** (a
3-year-old shouts "BOBO!" at the thumbnail) and **watch time** (long, calm, repeatable videos).
Everything here serves those three. The niche skills (table at the end) add the format for ONE
topic; this file is the shared rulebook — read it first, every time.

Run everything from the **repo root**.

## The files

```
remotion/src/lib/kids/
  face.tsx        shared FACE for every character: glossy eyes, rosy cheeks, soft plum ink (KINK)
                  expressions (KExpr): smile · happy · laugh · wow · think · sad · surprised ·
                  sleepy · wink · oops · proud
  kid.tsx         <Kid> chibi child rig (~760px tall at scale 1, big head, stubby body)
                  arms (KArm): down · wave(animated) · up · point · hip · hold · clap(animated) ·
                  think(hand on chin) · count · present · hug · shrug · {a,b} · {to:[dx,dy]} IK
                  fingersL/R = 1..5 raised fingers (COUNTING!) · holdL/R props · legs stand|walk|sit
                  · walk phase · hop(px) · tilt · lean · squash · kidFaceAt() for close-ups
  critter.tsx     <Critter> ONE parametric animal rig: bear · bunny · cat · fox · lion · mouse ·
                  panda · pig · owl · frog (fur/fur2/dark colours, scarf/bow/glasses/hat grad|
                  party|crown), same face + expressions, arms down|wave|up|hold|point|hug|clap|think,
                  walking (waddle), hop, facing ±1, critterFaceAt()
  sets.tsx        Meadow(smiling Sun, drifting clouds) · Classroom(board lines) · Bedroom(night,
                  moon, glow stars) · Space · Underwater(bubbles) · Forest — every set takes (w,h,t)
                  so ONE set serves 1080x1920 AND 1920x1080; stand characters on FLOOR(h)
  kit.tsx         KidsStage(any size camera) · KidsCaptions(word-by-word, big) · PopText(the ONE
                  thing being taught) · CountRow(objects pop in with rainbow number badges) ·
                  Confetti(reward) · ThinkTimer(3-2-1 pause ring) · AnswerMark(✓/✗) · WordCard
                  (picture + EN word + FR word) · SingAlong(bouncing-ball lyrics) · TitleCard(long
                  videos only) · Bubble · props Apple/Star/Balloon · RAINBOW palette
                  re-exports camAt/lipSync/talking/useT/Cut from the toon kit
  cast/tiny-sparks.ts   the LOCKED cast + CAPTION_COLORS + CHANNEL
remotion/src/shots/kids-sheet/  KidsModelSheet (→ character.png), KidsStyleBoard (→ style-board.png)
remotion/src/shots/kids-<niche>-NN/  one episode composition (+ vo.gen.ts, song.gen.ts)
kids-shorts/tiny-sparks/
  channel.json        THE BIBLE (audience, cast roles, voices, rules) — read before writing
  character.png       the model sheet · style-board.png the sets · voice-audition.mp3
  IDEAS.md            idea bank per niche with status (✅ made · 🟡 next · blank)
  songs/<slug>/       song.json → gen_song → song.mp3 (mix), bed.mp3 (bed), beatmap.json
  <niche>/ep-NN-<slug>/  script.md · beats.json · sfx-plan.json (+ song.json) ; voice/ output/ ignored
tools/gen_song.py     FREE local song maker (see "Music")
```

## The cast (LOCKED — never edit a spec inside an episode)

| who | role in every niche | voice (Kokoro) |
|---|---|---|
| **Mila** (6, yellow dress, puffs, pink bow) | the curious asker ("Why?"), sings lead | `af_sky`, rate -4% |
| **Leo** (6, blue stripes, ginger, freckles) | the brave/silly one who tries first and gets it WRONG — kids love correcting him | blend `am_puck:0.5+af_nova:0.5`, rate -2% |
| **Bobo** (bear cub, red scarf) | the buddy: hungry, clumsy, funny, huge heart; the comic relief | blend `am_fenrir:0.5+am_puck:0.5`, rate -4% |
| **Prof. Hoot** (owl, glasses, grad cap) | explains science, sets puzzles, never mocks a wrong answer | `bm_george` / `bm_fable`, pitch 0 |
| **Narrator** | stories and bedtime | `af_heart` (EN) · `ff_siwis` (FR) |

**Voices are LOCKED (user's pick from voice-audition-3): full-precision Kokoro (`python tools/setup_kokoro.py --full`), pitch 0, kid voices via voice BLENDS — never pitch-shift (it sounded unclean to the user).** Copy the cast entries verbatim from channel.json.
Voices come from the beats.json `cast` (see `kids-shorts/tiny-sparks/channel.json` for the exact
entries). Kid voices are made by **pitch-shifting** an adult Kokoro voice (`"pitch": 4` in the
cast entry — gen_voice uses ffmpeg rubberband in quality mode + de-ess/compress clean-up, duration preserved, word times unchanged). Keep shifts small (≤ +2): +4 sounded chipmunk/artificial to the user. A voice with pitch 0 is the cleanest.
`"formant": true` keeps the adult timbre (less chipmunk). French lines: `"lang": "fr"` on the
line + a `"kokoro_fr": "ff_siwis"` voice in the speaker's cast entry. The user picks voices by
ear from `voice-audition.mp3`; record the choice in channel.json.

**Real child voices (preferred): Azure Speech free tier** — `en-US-AnaNeural` (US girl),
`en-GB-MaisieNeural` (UK girl), `fr-FR-EloiseNeural` (French girl), via a per-speaker cast entry
`{"engine": "azure", "azure": "en-US-AnaNeural", "azure_pitch": "-8%", "azure_style": "cheerful", "rate": "-4%"}`
(pitch/rate applied server-side = clean). Needs AZURE_SPEECH_KEY/REGION in .env and
`<region>.tts.speech.microsoft.com` allowed in the cloud environment. Non-kid characters stay on
Kokoro with pitch 0. Audition: `python tools/gen_voice.py --beats kids-shorts/tiny-sparks/voice-audition-3.beats.json --engine kokoro`.

One-off characters (the fox in a story, a teacher) are new specs in the EPISODE file:
`{ id:'fox1', species:'fox', fur:'#ff8c42', fur2:'#ffffff', dark:'#7a3b12' }` — never edits to
the cast file. New recurring characters = a channel decision → cast file + model sheet re-render.

## TINY SPARKS HEROES — the cast wears ORIGINAL superhero outfits (user request, from Day 24)

Use `MILA_HERO` (Spark Girl), `LEO_HERO` (Captain Leo), `BOBO_HERO` (Super Bobo) and `HOOT_HERO` (Professor Hoot)
from `cast/tiny-sparks.ts` in every new episode instead of the everyday specs (same faces, voices and names in the
dialogue). Outfits = cape + domino mask + chest emblem + belt (`lib/kids/hero.tsx`; any Kid/Critter takes `hero`).
Model sheet: `kids-shorts/tiny-sparks/channel/tiny-sparks-heroes.png`.
**Never** dress anyone as Spider-Man, Batman, Superman, Teen Titans or any real franchise hero (costume, logo,
colour scheme): trademark/copyright claims + YouTube's Made-for-Kids crackdown on famous characters can
demonetise or remove the channel. New heroes = new original emblems/colours.

## ALIVE BY DEFAULT — characters + sets animate themselves (user request after Day 25: "more attractive")
The kit now does the "cute" work automatically — don't fight it, build on it:
- **Characters (`Kid`, `Critter`):** glossy 3-highlight eyes, brighter blush with a shine dot, hair/fur
  shine, auto double-blinks, a slow idle sway + head tilt, a head-bob while talking (from `mouth`), a happy
  bounce on `expr="laugh"`, twinkles circling the head on `wow` / `proud`, faster tail wag when happy,
  ear perks every few seconds. `idle={false}` turns it off (a frozen pose for a still, a held prop that must
  not drift). `armL/armR="up"` is a cheering fist BESIDE the head (it used to cover the face).
- **Sets (`Meadow`):** 3-stop sky, glowing blinking sun, soft rainbow, a smiling cloud, gliding birds,
  far hill + bushes, swaying tree and flowers, grass tufts, butterflies, air twinkles. Props:
  `rainbow={false}` (colour lessons where a rainbow would confuse), `life={false}` (no birds/butterflies/
  twinkles — calm or bedtime beats), `tree={false}` (episodes that draw their own tree), `sun={false}`.
  `Forest` got sunbeams + glowing fireflies + butterflies, `Underwater` swimming fish, `Space` twinkles + a
  shooting star every 7 s. The pieces are exported for any set/episode: `Butterflies`, `Birds`,
  `AirTwinkles`, `Rainbow` (sets.tsx), `Twinkle`, `HeadSparkles`, `idleMotion` (face.tsx).
- Still the rule: background motion stays slow and soft (no strobing, nothing fast behind a lesson).
  When a card/grid teaches, it is drawn ABOVE the set, so the ambient life never covers the lesson.

## LONG-VIDEO LENGTH — every 16:9 video is at least 5:00 (user rule)

The user's rule: **a 16:9 long video is never shorter than 5 minutes.** Plan the script for ≥ 5:00 BEFORE voicing
(after `pack`, if the total is < 300 s, add content — never just pad with silence):
- a "Let's remember" round (repeat the key moments: your-turn repeats, quiz with think timers, say-it-together) —
  this is what kids memorize from, so it is the first thing to grow;
- more items (more words/numbers/puzzles/facts) or a second scene of the story;
- songs: a second full round, a karaoke "now YOU sing!" pass (instrumental + lyrics), or a slow learning verse.
Shorts (9:16) are unaffected.

## PACING — slower than you think (user feedback after Day 3: "too fast, add empty seconds")

Kids need silent time to hear, look and repeat. Every episode's packing MUST use at least these gaps
(they are minimums — when unsure, add more):
- **Between two items** (animal → next animal, number → next number, step → next step): **≥ 2.5 s** of
  quiet with the picture still on screen before the next one appears.
- **After a new word / number / fact is said**: **≥ 1.2 s** before the next line.
- **Repetitions are separate lines with pauses** ("Lion." · 1.0 s · "Lion!" · 1.0 s · "Li-on."), never one
  fast line "Lion. Lion! Lion.".
- **"Your turn" pause**: after the key word, a **1.5–2 s** silent pause (character looking at the
  camera, mouth closed) so the child can say it — add a small "🗣️ Your turn!" PopText.
- **Questions / quizzes**: ThinkTimer **≥ 4 s**.
- Voice rate for teaching lines: **-8 % to -12 %** (kids' cast rate entries stay locked; add the slower
  rate as a per-line `"tts"` text with commas, or use the narrator for the slow teaching line).
- A long (16:9) video should feel calm: aim for ~8–12 s per vocabulary item, not 5.

## Style rules (what makes kids watch — and parents trust it)

1. **One idea per screen.** One number, one word, one animal fact. Big, centred, held long
   enough to read twice (≥2 s). Clutter loses preschoolers instantly.
2. **Faces carry the video.** Characters look at the camera and talk TO the child. Close-ups
   (z 1.6–2.0 on `kidFaceAt`) for emotions, wides for actions. Expressions change on every line.
3. **Gentle motion.** Eases, bounces and pops; slow push-ins. No whip pans, no shake bigger than
   a giggle, **no flashing** (never > 3 flashes/s, never a full-screen white flash), no
   strobing backgrounds. Cuts every 3–6 s in Shorts, 5–10 s in long videos.
4. **Bright, warm, round.** RAINBOW palette, pastel skies, soft plum outlines (never black),
   rounded shapes only. Night scenes are cosy purple, never dark/scary.
5. **Repetition is a feature.** Say the key word 3 times (rule of three), repeat the song
   chorus, reuse the same intro sting and the same reward (Confetti + "Yay!").
6. **Interaction pauses.** Ask, then WAIT: a 2–3 s `ThinkTimer` gap with a character looking at
   the camera, then the answer. ("Can you count with me?", "What colour is it?")
7. **Leo is wrong first.** The silly wrong answer → kids shout the right one → reward. It's the
   most watchable beat in kids TV.
8. **A reward every 15–20 s** in long videos (Confetti, a song sting, Bobo's dance).
9. **Captions support, never lead.** Most viewers can't read; captions help parents/muted
   viewing and early readers. Max 4 words, big type (KidsCaptions).
10. **Safe content only:** no violence, no scary monsters/jump-scares, no dangerous imitable
    acts (no climbing shelves, no touching the stove, no putting things in mouths), no
    gross-out, no mean teasing (Leo's mistakes are laughed WITH), no brands, no ads, no
    "smash that like button". Feelings are named and resolved kindly.

## Formats

| | Short (9:16, 1080x1920) | Long (16:9, 1920x1080) |
|---|---|---|
| length | 30–60 s (Shorts may run to ~90 s with the PACING gaps) | **MIN 5:00** (user rule) — episode 5–8 min · compilation 20–60 min |
| opening | ON the action in frame 0 (a question, a surprise, a character waving) — no title card | 1–1.5 s `TitleCard` with the episode name, then straight in |
| ending | a reward + a soft loop back to frame 0 | goodbye song/wave + "see you next time!" (no CTA beg) |
| captions | KidsCaptions at ~71% height | KidsCaptions at ~88% height |
| characters | scale ~0.9–1.0, feet on FLOOR(1920) | scale ~0.55–0.65, feet on FLOOR(1080) |

The SAME composition code runs at both sizes: read `useVideoConfig()` for (W,H), pass `w/h` to
the set, place characters relative to W and FLOOR(H). Make the long version by changing
`compositionConfig` width/height (and the duration) in a sibling file that imports the scene.
**Compilations** (the watch-time engine of every big kids channel): concatenate finished
long episodes with ffmpeg + a 2 s branded transition; title "… + More Kids Songs | 30 min".

## Pipeline (shared with the other tracks)

1. Pick the idea from `kids-shorts/tiny-sparks/IDEAS.md` (🟡 next) for the niche; follow the
   niche skill's beat template. Write `script.md` (beat table) + `beats.json` (`vo[]` with
   `speaker`, `cast{}` copied verbatim from channel.json, `voicePlan: "kokoro"`).
2. Voice first: `python tools/gen_voice.py --beats <ep>/beats.json --engine kokoro` → read the
   clip lengths → PACK the timeline (0.3–0.5 s between lines — slower than the comedy series;
   2–3 s for interaction pauses; room for songs/rewards) → re-run with
   `--emit-ts remotion/src/shots/kids-<niche>-NN/vo.gen.ts` (cached, free).
3. Composition: global seconds everywhere (`S(i)/E(i)` from VO), camera keys with `camAt`,
   scenes as `{t >= a && t < b && …}`. Root: `KidsStage` → set → characters → props/overlays
   in stage space; then screen-space overlays (PopText, ThinkTimer, Confetti, SingAlong) and
   `KidsCaptions` last.
4. `cd remotion && node scripts/gen-registry.mjs`, `python tools/check_short.py <ep>`.
5. QA (below), then `python tools/build_short.py <ep>` (voice → render → mux → sfx) and the
   music bed: `--music kids-shorts/tiny-sparks/songs/<slug>/bed.mp3` (a bed FILE works).
6. Write the title/description/tags into script.md (patterns in each niche skill), update
   IDEAS.md (✅ + next 🟡), commit + push.

## Music (free, legal, no Content-ID risk)

**First choice — make it: `tools/gen_song.py`** (free, local, 100% ours):
- `song.json` = bpm, chords per bar, melody (`C4:1 D4:0.5 R:1 | …`), lyrics (syllables with
  `-`, lines with `/`), instruments (lead `xylophone|musicbox|whistle`, chords `ukulele|piano`,
  bass, soft drums), the singer + Kokoro vocal settings. See `songs/count-with-bobo/song.json`.
- `python tools/gen_song.py <song.json>` → `song.mp3` (mix), `bed.mp3` (instrumental bed for
  videos, ~-24 LUFS), `beatmap.json` (every chord/note/syllable time — drive dances, bounces
  and the SingAlong ball from it).
- `--vocal chant` = lyrics spoken in rhythm on the beat (clear, reliable — the default).
  `--vocal sing` = EXPERIMENTAL toy-singer: each syllable pitch-shifted onto its note
  (≈0.4 semitone median accuracy; cute/robotic) — always audition with the user.
  `--emit-ts <shot>/song.gen.ts` = the sung lines as VO for `<SingAlong>` and lipSync.
- **Public-domain melodies** are free to arrange and sing (use the TRADITIONAL lyrics or write
  new ones): Twinkle Twinkle (= the ABC song melody) · Old MacDonald · Wheels on the Bus · Row
  Row Row Your Boat · Frère Jacques · If You're Happy and You Know It · Itsy Bitsy Spider · Baa
  Baa Black Sheep · Mary Had a Little Lamb · London Bridge · Head Shoulders Knees and Toes ·
  Hickory Dickory Dock · Bingo · The Farmer in the Dell · Pop Goes the Weasel · Happy Birthday
  (public domain since 2016). NEVER modern hits or other channels' versions (Baby Shark's
  Pinkfong recording, Cocomelon arrangements) — their recordings AND new lyrics are protected.

**Free libraries (when you want a ready track):**
- **YouTube Audio Library** (YouTube Studio → Audio Library): free for YouTube videos; filter
  "Attribution not required" or copy the credit line it gives you into the description.
- **Pixabay Music**: free, commercial use OK, no attribution required — keep the download page
  link; if a Content-ID claim appears anyway, dispute it with that link.
- **Incompetech (Kevin MacLeod)**: CC BY 4.0 — credit in the description exactly as he asks.
- **Free Music Archive / ccMixter**: only tracks licensed **CC BY** or **CC0**. Avoid **NC**
  (non-commercial) and **ND** — a monetised channel is commercial.
- **Musopen**: public-domain classical recordings (Mozart, Brahms lullabies) — check each
  recording's licence on its page.
Record every external track (source URL + licence) in the episode's script.md.

**Paid upgrade for real singing** (only if the user wants studio vocals): ElevenLabs Music
(`ELEVENLABS_API_KEY`, gen_music.py), or a paid Suno/Udio plan — their FREE tiers are
non-commercial; check the current terms before monetising.

## YouTube rules for kids content (non-negotiable)

- Mark every upload **"Yes, it's made for kids"** (COPPA — the FTC fines channels that don't).
  Consequences to plan around: no comments, no personalised ads (lower RPM), no notification
  bell / end screens / cards / mini-player. So growth comes from **playlists, consistent
  uploads, long compilations and great thumbnails**, not from community features.
- YouTube's **kids quality principles**: rewarded = age-appropriate, educational, encourages
  curiosity, kindness, play, healthy habits; demoted/demonetised = sensational or
  misleading, heavily commercial, poor quality, or **mass-produced/repetitive ("inauthentic
  content")**. Every video needs its own story, jokes and teaching — never re-skin the same
  script with new nouns.
- No other channels' or brands' characters in titles/tags/thumbnails (Peppa, Cocomelon,
  Bluey…) — misleading metadata gets videos removed.
- Altered/synthetic content disclosure: **No** (it's an obvious cartoon).

## QA (read the frames, every time)

```
cd remotion && node scripts/frames.mjs <Comp> 0,<one per camera key / pose / overlay>,<last> --scale=0.5
```
Check: the ONE teaching element is big and readable at phone size · nothing teaching sits under
the captions band or (Shorts) the bottom 300 px of YouTube UI · faces never cut by the frame
edge in close-ups · counts are CORRECT (objects on screen = number said) · spelling of every
word (EN and FR, with accents) · no flashing/strobe · Leo's wrong answer is clearly corrected
· the reward fires · 16:9 and 9:16 versions both framed.

## The niche skills

| niche | skill | core loop |
|---|---|---|
| 🧠 Educational stories | `kids-stories` | problem → try → fail → learn → succeed (one lesson) |
| 🔢 Numbers & math | `kids-numbers` | count objects → show the numeral → finger count → mini-sum |
| 🔤 English/French words | `kids-words` | picture → word ×3 → FR word → use it in a sentence |
| 🦁 Animal stories | `kids-animals` | meet the animal → sound → 3 facts → a tiny story |
| 🚀 Science for kids | `kids-science` | "Why…?" → wrong guess → Hoot's simple model → see it → recap |
| 🧩 Puzzles | `kids-puzzles` | challenge → ThinkTimer → Leo's wrong try → reveal → reward |
| 📚 Moral stories | `kids-morals` | want → wrong choice → feeling → kind choice → the moral in one line |
| 🎵 Educational songs | `kids-songs` | song.json → gen_song → sing-along animation |
