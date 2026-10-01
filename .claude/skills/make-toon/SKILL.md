---
name: make-toon
description: Build an episode of a RECURRING-CHARACTER 2D cartoon comedy series (vertical 1080×1920, 25–35s) end-to-end — pick the episode from the series idea bank, write dialogue with per-speaker lines, animate the LOCKED cast on the toon rig (expressions, lip-sync, poses, camera cuts, the series' signature ending), frame QA, multi-voice TTS, render, SFX. Use when the user wants a "cartoon short", a "character series", a new episode of "Bro Thinks He's Him" (or any toon-shorts/<series>), "make episode N", "same character, new situation", or wants to start a NEW recurring-character comedy series. Not for narrated explainers (make-short), video-model pixels (make-ai-short) or paper collage (make-vox). Defers raw TSX crash rules to vidtsx-2d-generator and SFX taste to suggest-sfx.
---

# make-toon — recurring-character cartoon series, one episode at a time

A series lives or dies on **recognition**: the viewer must know who this is within a second,
and every episode must feel like the same show. So the character is not drawn per episode; he
is a **locked spec** fed to one shared **rig**, and every episode follows the same beat
grammar and ends on the same **signature ending**. Episodes only change the situation.

Run everything from the **repo root**.

## The files

```
remotion/src/lib/toon/
  rig.tsx            <Toon> — THE body every character is drawn with (expr, arms, legs, mouth, look…)
  comedy.tsx         camera (camAt/Stage/shakeAt), Cut, Flash, lipSync/talking, DialogueCaptions,
                     TitleBar, TimeCard, Rays, Sparkles, signatureFilter + SignatureStamp
  sets.tsx           Room, Street (Mini Mart + joke poster slot), Table, Bottle, Crate
  series/<series>.ts LOCKED cast specs + speaker colours + series name/catchphrase/accent
remotion/src/shots/
  toon-<series>/<Series>ModelSheet.tsx   the model sheet -> toon-shorts/<series>/character.png
  <series>-NN/<Series>NN<Slug>.tsx       one episode composition (+ vo.gen.ts)
toon-shorts/<series>/
  series.json        THE BIBLE: premise, hero, cast, catchphrase rule, signature ending, beat grammar
  character.png      rendered model sheet (the visual reference — read it before posing anyone)
  IDEAS.md           episode bank with status + recurring gags + future series
  ep-NN-<slug>/      script.md · beats.json (vo[] with speaker, cast{} voices) · sfx-plan.json
                     voice/ + output/ are gitignored
```

The reference episode is **`toon-shorts/bro/ep-01-business`** +
`remotion/src/shots/bro-01/Bro01Business.tsx`. Copy its structure for every new episode, not
an empty file.

## Iron rules

1. **Never edit a locked spec inside an episode.** `BRO`/`DEE` come from `series/<series>.ts`
   untouched. One-off characters are `extra('id', {...})` specs in the episode file. Changing
   a locked character is a series decision for the user: edit the spec, re-render the model
   sheet into `character.png`, note the date in series.json.
2. **Read series.json + character.png first.** Its catchphrase rule, signature ending and beat
   grammar are the format, so don't improvise a different ending.
3. **Global seconds everywhere.** Episodes do NOT nest `<Sequence>`s: scenes are
   `{t >= a && t < b && <Scene t={t}/>}` and every cue (camera key, pose switch, sfx) is the
   same number in beats.json, the TSX and sfx-plan.json.
4. **Frame 0 is composed:** hero close-up mid-attitude, title bar up. No fade-in.
5. **Plant before payoff:** the thing that humiliates him is visible in frame before anyone
   says it (EP1: the WATER $1 poster). That's what makes people rewatch and comment.
6. **Layout zones (1080×1920):** TitleBar ≈ y150–420 · captions centred ≈ y1385 · YouTube UI
   below ≈ y1420. Keep faces below the title and joke props (signs, posters) between y450 and
   y1330 in every camera framing. Check this in QA, it's the #1 bug (EP1 hit it 3 times).
7. **No CTA outros**, no "follow for part 2". The signature ending IS the outro.

## Comedy writing rules (the script is the product; a pretty unfunny episode is a failure)

The user rejected EP1 v1 ("no one will laugh"): one predictable joke stretched over 30s.
v2 (`ep-01-business/script.md`) is the bar every episode is held to:

1. **A punchline every 3–4 seconds.** Write the jokes FIRST and the connecting lines after.
   If 5 seconds pass without a laugh, cut or add a joke.
2. **Second 1 is a joke, not just setup.** Claim → instant deflation → he doubles down
   ("I quit my job" / "You don't have a job" / "That's how fast I quit").
3. **The engine is doubling down.** He never admits a failure; every humiliation turns
   into a dumber justification. That is the character.
4. **Setup → beat of silence → short punchline.** Punchlines are 1–4 words and start with
   "..." ("...The price." "...Hater."); leave a 0.5–0.7s gap before them in beats.json.
5. **Rule of three + escalation:** each round of pushback is worse than the last, and the
   third breaks the pattern.
6. **Let the straight man say the audience's thought** ("Ten dollars? For water?").
7. **Plant before payoff:** the thing that destroys him is visible in frame before anyone
   mentions it.
8. **End on "bro math":** a conclusion that's dumb but *almost* logical ("saved $10… so I'm
   up nine"). People argue about it in the comments, and that's how a video spreads.
9. **2–3 quotable lines per episode**, short enough to be a comment.
10. **Self-check before animating:** read the script out loud and mark each laugh. Fewer than
    6 laughs in 35s means rewrite it. Never animate a script you wouldn't laugh at.

## Stage 1 — the episode script

Pick from `toon-shorts/<series>/IDEAS.md` (🟡 = next up), or invent one that fits the
premise. Then write `script.md` (beat table: time | on screen | line) and `beats.json`:

- `vo[]`: one entry per spoken line with `"speaker"` (cast id or extra id), `start`/`end` in
  global seconds (~2.7–3 words/sec, comedic pauses are free), `text`.
- `cast{}`: voice per speaker per engine, e.g.
  `"bro": {"kokoro": "am_puck", "elevenlabs": "<id>", "edge": "en-US-ChristopherNeural", "rate": "+6%"}`.
  Copy the recurring cast's voices from the previous episode **verbatim** (a voice is part of
  the locked character), and add each extra's voice.
- `voicePlan`: `"kokoro"` (free, default), `"elevenlabs"` or `"edge"`: a bare engine name, so
  voices come from `cast`.
- `beats[]`: hook · setup · reveal · escalate · stare · (later) · twist · signature, with
  `visual` notes.
- Bro series: the catchphrase is said exactly twice (full in setup, short as the last line),
  plus one cope line at camera mid-episode.
- **Timing workflow:** write the lines with rough times, run gen_voice once to get the real
  clip lengths, then PACK the timeline (0.2–0.3s between replies, 0.5–0.7s before a
  punchline, room for walks, cuts and cards) and run it again (cached, so it's free). Derive
  every animation cue from the VO times in the TSX (`S(i)`/`E(i)`, see Bro01Business.tsx),
  never hard-coded seconds, so a retime never breaks the animation.

## Stage 2 — the composition

Copy `Bro01Business.tsx` into `remotion/src/shots/<series>-NN/` and rewrite it. Its parts:

- **Placements** (feet x/y in stage px) per scene, plus `faceAt(x, y, scale, legs)` to aim
  close-ups.
- **`CAM: CamKey[]`**: `{t, z, x, y, rot?, cut?}`. `cut: true` = hard cut at t (holds the
  previous framing until then). Wide = `z 1, (540,960)`; close-up ≈ `z 1.7–2.1` on
  `faceY + 70…120`. Every new framing gets a QA frame.
- **Scenes** as components taking `t`; each `<Toon>` gets `expr`, `look`, `armL/armR`,
  `mouth={lipSync(VO, '<speaker>', t)}`, optional `legs: 'walk' | 'sit'`, `holdL/holdR`
  props, `sweat`, `tilt`.
- **Root**: `<Stage cam shake filter={signatureFilter(t, SIG)}>` → `<TimeCard>` → `<Flash>`
  on smash cuts → `<TitleBar>` (until SIG) → `<SignatureStamp>` → `<DialogueCaptions>` (not
  over the signature).

Rig vocabulary (see rig.tsx for all of it):
- `expr`: neutral · smug · confident · shock · **deadpan (THE STARE)** · sad · happy · annoyed · side-eye
- `arm`: down · hip · point · point-up · wave · gun · hold · shrug · cross · flex · drink ·
  facepalm · thumb · present · `{a,b}` angles · `{to:[dx,dy]}` IK reach
- `legs`: stand · wide · walk (pass `walk={t*1.8}`) · sit
- props: `<Bottle anchor="center" level>` in a hand via `holdR` + `holdRotR`

New sets/props go in `sets.tsx` (same ink #22160f, 7px stroke, flat fills), reusable, never
inline in an episode. After adding a shot: `cd remotion && npm run gen`.

## Stage 3 — QA (read the frames, every time)

```
python tools/check_short.py toon-shorts/<series>/ep-NN-<slug>
cd remotion && node scripts/gen-registry.mjs && \
  node scripts/frames.mjs <Comp> 0,<one frame per camera key / pose change>,<last> --scale=0.5
```
Pass ALL frames in ONE call (each call overwrites `-sheet1.png`). Read every sheet:
title never covers a face · captions never cover the joke prop · the planted gag is readable
at phone scale · lip-sync on the right character · arms read (crossed arms in front, reaches
over the head) · signature stamp below the face. Model sheet for a new pose:
`node scripts/frames.mjs <Series>ModelSheet 0 --scale=1`.

## Stage 4 — voice → render → mux → sfx (one command)

```
python tools/build_short.py toon-shorts/<series>/ep-NN-<slug>
```
gen_voice reads `cast` and voices each line with its speaker's voice, writing word times
**and speakers** into `vo.gen.ts`, so lip-sync and captions retime themselves. Then render,
mux and the SFX mix. `--stages render` renders without voice (silent preview).

Voice engine = beats.json `voicePlan`:
- **`kokoro` (default, free, local).** Kokoro-82M on the CPU (~2× real time), no key, no quota,
  no network. One-time setup: `pip install kokoro-onnx && python tools/setup_kokoro.py`
  (weights come from npm). Cast entries: `"kokoro": "am_puck"`, or a blend
  `"am_puck:0.6+am_fenrir:0.4"` for a voice nobody else has; `"rate": "+6%"` = speed. Best
  voices: af_heart, af_bella (female) · am_puck, am_fenrir, am_michael (male) · bm_george,
  bf_emma (British). Word times are derived from the audio's pauses (syllable-accurate).
  When choosing a new character's voice, make an audition file like
  `toon-shorts/bro/voice-audition.mp3` and let the user pick by ear.
- `elevenlabs`: the paid upgrade (`ELEVENLABS_API_KEY` in `.env`), with exact word alignment.
- `edge`: free but online over WebSockets (fails behind proxies that block them).
Every line should fit its window with tempo 1.00 in the voice table; if one overflows, widen
the window in beats.json and don't squeeze the line.

SFX: `sfx-plan.json` (library ids only; see /suggest-sfx). Comedy staples: smash cut =
`impact-deep-soft`, stare = `impact-deep-soft`, stamp = `stamp-hit`, time card =
`whoosh-wind`, cuts = `whoosh-soft`. Missing from the library (generate with gen_sfx.py when
there's a key): record scratch, vine boom, cash register, crickets, slide whistle.
Audition mix → the user's ear decides.

## Starting a NEW series

1. Agree the premise, hero, catchphrase and signature ending with the user (IDEAS.md lists
   candidates).
2. `remotion/src/lib/toon/series/<name>.ts`: hero + friend specs (distinct silhouette: one
   bold hat/hair shape + one accessory + one signature colour), speaker colours, SERIES const.
3. Model sheet composition → render → `toon-shorts/<name>/character.png`. **Show it to the
   user and get approval before episode 1** (that's the lock).
4. `toon-shorts/<name>/series.json` + `IDEAS.md` (≥10 episode ideas), then episode 1.

## Done =

script.md + beats.json (speakers + cast) · check_short clean · QA sheets read and every framing
fixed · voiced build (or a silent render + the reason why) · sfx-plan + audition mix ·
IDEAS.md status updated (✅ this one, 🟡 the next).
