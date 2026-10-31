# Sammy and the Rolling Acorn

**Track:** kids-stories · **Composition:** `Ks1Acorn` (+ `Ks1AcornVertical`) · **Length:** ~150.0s
**Cast:** sammy, oliver · **Series:** Sammy & Friends · **Status:** draft

## The question (frame 0)
> TODO the question bubble + first line. Sammy is ALREADY doing something at frame 0.
> The episode is the answer to this question.

## Beat sheet

| time | beat | on screen | VO (speaker) |
|---|---|---|---|
| 0–3s | HOOK | sammy ALREADY mid-action + question bubble at frame 0 | TODO |
| 3–27s | SETUP | TODO who, where, what they want | TODO |
| 27–57s | PROBLEM | TODO the thing that goes wrong | TODO |
| 57–88s | TRY | TODO they try alone — it does not work | TODO |
| 88–111s | HELP | TODO a friend helps | TODO |
| 111–128s | SUCCESS | TODO it works — everybody cheers | TODO |
| 128–142s | LESSON | TODO ONE sentence, said twice | TODO |
| 142–150s | NEXT | NEXT-UP card + spoken tease of the next episode | TODO |

## The lesson (one sentence, said twice)
> TODO

## Next episode (spoken + NEXT-UP card)
> TODO "Next time, …"

## Production notes
- **No intro.** No logo sting, no title card, no "hi friends!" before the story starts — the
  channel's audience left at ~30s; the first 3 seconds are the episode.
- **A new picture every <= 8s** (cut, camera move, or new action). check_short.py warns.
- **Narration ~2.2 words/sec**, short sentences, words a 4-year-old knows. Repeat key words.
- **Characters talk in their own voices** (`"speaker"` on a vo line → beats.json `voices`).
- **No "subscribe / comment / like"** — Made for Kids disables them; end on the next-episode tease.
- **Compilation-ready:** this episode will be stitched into a 20-60 min themed compilation
  (`tools/compile_kids.py`) — the NEXT tease is trimmed there automatically.
