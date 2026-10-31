#!/usr/bin/env python3
"""
new_kids_story.py — scaffold the next kids-stories episode (16:9, ~3 min) so it RENDERS at once.

Writes, wired together:
  kids-stories/ks-N-<slug>/script.md      the beat sheet to fill in
  kids-stories/ks-N-<slug>/beats.json     THE contract: vo[] (with speakers), beats[], shots[], shortCut
  remotion/src/shots/ks-N/KsN<Slug>.tsx          the episode (plays the shot list — no drawing code)
  remotion/src/shots/ks-N/KsN<Slug>Vertical.tsx  the 1080x1920 teaser cut, follows the cast
  remotion/src/shots/ks-N/shots.gen.ts           emitted from beats.json (build_short re-emits it)
  remotion/src/shots/ks-N/vo.gen.ts              placeholder, overwritten by the voice stage

The episode grammar (sized to --duration):
  HOOK 0-3s     the hero ALREADY mid-action, a question bubble up at frame 0, first word by 0.5s
  SETUP         who, where, what they want
  PROBLEM       the thing that goes wrong
  TRY           they try alone — it does not work (kids love being ahead of the character)
  HELP          a friend from the cast helps — this is where the series' world grows
  SUCCESS       it works; everybody cheers
  LESSON        ONE sentence, said twice (once by a character, once by the narrator)
  NEXT          the spoken + drawn next-episode tease — Made for Kids has no end screens

  python tools/new_kids_story.py sammy "Sammy and the Rolling Acorn"
  python tools/new_kids_story.py oliver "Oliver's Starry Night" --friend mila --duration 200

Then: write the story into beats.json (vo + shots), run
  python tools/check_short.py kids-stories/ks-N-<slug>
  python tools/build_short.py kids-stories/ks-N-<slug>
"""
import argparse
import json
import os
import re
import subprocess
import sys

from kids_lib import emit_shots_ts, kit_vocab

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WPS = 2.2  # kids narration pace the windows are sized from
SERIES = {"sammy": "Sammy & Friends", "oliver": "Oliver's Night Sky", "mila": "Mila's Manners"}

# (id, share of the runtime between the hook and the tease, what happens)
GRAMMAR = [
    ("setup", 0.17, "who, where, what they want"),
    ("problem", 0.22, "the thing that goes wrong"),
    ("try", 0.22, "they try alone — it does not work"),
    ("help", 0.17, "a friend helps"),
    ("success", 0.12, "it works — everybody cheers"),
    ("lesson", 0.10, "ONE sentence, said twice"),
]
HOOK_END = 3.0
NEXT_LEN = 8.0
SHOT_LEN = 6.0


def next_index():
    base = os.path.join(ROOT, "kids-stories")
    n = 0
    for d in os.listdir(base) if os.path.isdir(base) else []:
        m = re.match(r"ks-(\d+)-", d)
        if m:
            n = max(n, int(m.group(1)))
    return n + 1


def pascal(s):
    return "".join(p.capitalize() for p in re.split(r"[^a-zA-Z0-9]+", s) if p)


def slug_of(title):
    words = [w for w in re.split(r"[^a-z0-9]+", title.lower()) if w and w not in
             ("the", "a", "an", "and", "of", "to", "s", "learns", "for", "kids")]
    return words[-1] if words else "story"


def plan(total, hero, friend):
    body = total - HOOK_END - NEXT_LEN
    beats = [{"id": "hook", "start": 0.0, "end": HOOK_END,
              "visual": f"{hero} ALREADY mid-action + question bubble at frame 0"}]
    t = HOOK_END
    for bid, share, what in GRAMMAR:
        end = round(t + body * share, 2)
        beats.append({"id": bid, "start": round(t, 2), "end": end, "visual": f"TODO {what}"})
        t = end
    beats[-1]["end"] = round(total - NEXT_LEN, 2)
    beats.append({"id": "next", "start": round(total - NEXT_LEN, 2), "end": total,
                  "visual": "NEXT-UP card + spoken tease of the next episode"})

    scenes = ["meadow", "forest", "pond", "meadow", "forest", "meadow", "meadow", "meadow"]
    actions = ["walk", "idle", "hop", "idle", "walk", "idle"]
    shots, vo = [], []
    for bi, b in enumerate(beats):
        span = b["end"] - b["start"]
        n = max(1, round(span / SHOT_LEN))
        for k in range(n):
            st = round(b["start"] + k * span / n, 2)
            en = round(b["start"] + (k + 1) * span / n, 2) if k < n - 1 else b["end"]
            a = actions[(bi + k) % len(actions)]
            hx = [0.25, 0.6] if a == "walk" else 0.4
            cast = [{"id": hero, "x": hx, "action": a, "mood": "happy"}]
            if friend and b["id"] in ("help", "success", "lesson", "next"):
                cast.append({"id": friend, "x": 0.72, "action": "cheer" if b["id"] == "success" else "idle",
                             "mood": "happy", "facing": -1})
            shot = {"start": st, "end": en, "beat": b["id"], "scene": scenes[bi % len(scenes)], "cast": cast}
            if b["id"] == "hook":
                shot["cast"][0].update(action="hop", mood="surprised")
                shot["ask"] = "TODO the question?"
            if b["id"] == "next":
                shot["next"] = {"title": "TODO next episode", "cast": friend or hero}
            shots.append(shot)
        # one placeholder VO line per ~5s; hook speaks at 0.2s
        m = max(1, round(span / 5.0))
        for k in range(m):
            st = round(b["start"] + (0.2 if b["id"] == "hook" else 0.3) + k * span / m, 2)
            vo.append({"beat": b["id"], "text": "TODO", "budgetWords": int((span / m - 0.6) * WPS),
                       "start": st, "end": round(st + span / m - 0.6, 2)})
    vo[0]["text"] = "TODO the question?"
    return beats, shots, vo


SCRIPT_MD = """# {title}

**Track:** kids-stories · **Composition:** `{comp}` (+ `{comp}Vertical`) · **Length:** ~{total}s
**Cast:** {cast} · **Series:** {series} · **Status:** draft

## The question (frame 0)
> TODO the question bubble + first line. {hero_name} is ALREADY doing something at frame 0.
> The episode is the answer to this question.

## Beat sheet

| time | beat | on screen | VO (speaker) |
|---|---|---|---|
{rows}

## The lesson (one sentence, said twice)
> TODO

## Next episode (spoken + NEXT-UP card)
> TODO "Next time, …"

## Production notes
- **No intro.** No logo sting, no title card, no "hi friends!" before the story starts — the
  channel's audience left at ~30s; the first 3 seconds are the episode.
- **A new picture every <= 8s** (cut, camera move, or new action). check_short.py warns.
- **Narration ~{wps} words/sec**, short sentences, words a 4-year-old knows. Repeat key words.
- **Characters talk in their own voices** (`"speaker"` on a vo line → beats.json `voices`).
- **No "subscribe / comment / like"** — Made for Kids disables them; end on the next-episode tease.
- **Compilation-ready:** this episode will be stitched into a 20-60 min themed compilation
  (`tools/compile_kids.py`) — the NEXT tease is trimmed there automatically.
"""

EP_TSX = """import React from 'react';
import {{ StoryPlayer }} from '../../lib/kids';
import {{ SHOTS }} from './shots.gen';
import {{ VO }} from './vo.gen';

// =============================================================================
// {title} — kids-stories episode. The picture is DATA: edit "shots" in
// kids-stories/{proj}/beats.json, not this file. New scenes / characters / actions go in
// lib/kids.tsx so every episode gets them.
// =============================================================================
export const compositionConfig = {{
  id: '{comp}',
  durationInSeconds: {total},
  fps: 30,
  width: 1920,
  height: 1080,
}};

const {comp}: React.FC = () => <StoryPlayer shots={{SHOTS}} vo={{VO}} series="{series}" />;

export default {comp};
"""

VERT_TSX = """import React from 'react';
import {{ VerticalCut }} from '../../lib/kids';
import {{ CUT, SHOTS }} from './shots.gen';
import {{ VO }} from './vo.gen';

// The 9:16 teaser carved from {comp} (beats.json "shortCut"). durationInSeconds MUST equal
// shortCut.end - shortCut.start — check_short.py verifies it.
export const compositionConfig = {{
  id: '{comp}Vertical',
  durationInSeconds: {cut_len},
  fps: 30,
  width: 1080,
  height: 1920,
}};

const {comp}Vertical: React.FC = () => <VerticalCut shots={{SHOTS}} vo={{VO}} cut={{CUT}} />;

export default {comp}Vertical;
"""

VO_GEN = """// PLACEHOLDER — written by tools/new_kids_story.py from the ESTIMATED beats.json timings.
// tools/gen_voice.py overwrites this with the REAL per-word alignment; never hand-edit.
import type {{ VoLine }} from '../../lib/shorts';

export const VO: VoLine[] = [
{lines}
];
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("hero", help="lead cast id (sammy / oliver / mila — see lib/kids.tsx CAST_IDS)")
    ap.add_argument("title", help='the episode title, e.g. "Sammy and the Rolling Acorn"')
    ap.add_argument("--friend", help="second cast member for the HELP beat (default: next in the cast)")
    ap.add_argument("--duration", type=float, default=180.0, help="seconds (default 180)")
    ap.add_argument("--slug", help="folder/composition word (default: derived from the title)")
    ap.add_argument("--index", type=int, help="force the episode number (default: next free)")
    args = ap.parse_args()

    cast_ids = kit_vocab()["CAST_IDS"]
    if args.hero not in cast_ids:
        sys.exit(f"unknown hero {args.hero!r} — the cast is {cast_ids} (add new characters in lib/kids.tsx)")
    friend = args.friend or next((c for c in cast_ids if c != args.hero), None)
    if friend and friend not in cast_ids:
        sys.exit(f"unknown friend {friend!r} — the cast is {cast_ids}")

    n = args.index or next_index()
    slug = (args.slug or slug_of(args.title)).lower()
    comp = f"Ks{n}{pascal(slug)}"
    total = round(args.duration, 2)
    rel = f"kids-stories/ks-{n}-{slug}"
    proj = os.path.join(ROOT, rel)
    shot = os.path.join(ROOT, "remotion", "src", "shots", f"ks-{n}")
    if os.path.exists(proj):
        sys.exit(f"{rel} already exists")
    os.makedirs(proj)
    os.makedirs(shot, exist_ok=True)

    beats, shots, vo = plan(total, args.hero, friend)
    series = SERIES.get(args.hero, "Tiny Sparks Stories")
    contract = {
        "id": f"ks-{n}-{slug}",
        "track": "kids-stories",
        "title": args.title,
        "series": series,
        "composition": comp,
        "audience": "ages 2-6 and the parent holding the phone",
        "madeForKids": True,
        "format": {"width": 1920, "height": 1080, "fps": 30, "durationSec": total},
        "voicePlan": "edge:en-US-AvaMultilingualNeural --rate -4%",
        "voices": {
            "edge": {"sammy": "en-US-AnaNeural", "mila": "en-GB-MaisieNeural", "oliver": "en-GB-RyanNeural"},
            "elevenlabs": {},
        },
        "cast": [c for c in (args.hero, friend) if c],
        "shortCut": {"start": 0.0, "end": 30.0},
        "vo": vo,
        "beats": beats,
        "shots": shots,
        "lesson": "TODO one sentence",
        "next": "TODO the next episode's title",
    }
    json.dump(contract, open(os.path.join(proj, "beats.json"), "w", encoding="utf-8"),
              indent=2, ensure_ascii=False)

    rows = "\n".join(f"| {b['start']:.0f}–{b['end']:.0f}s | {b['id'].upper()} | {b['visual']} | TODO |"
                     for b in beats)
    open(os.path.join(proj, "script.md"), "w", encoding="utf-8").write(SCRIPT_MD.format(
        title=args.title, comp=comp, total=total, cast=", ".join(contract["cast"]), series=series,
        hero_name=args.hero.capitalize(), rows=rows, wps=WPS))

    open(os.path.join(shot, f"{comp}.tsx"), "w", encoding="utf-8").write(
        EP_TSX.format(title=args.title, proj=os.path.basename(proj), comp=comp, total=total, series=series))
    cut = contract["shortCut"]
    open(os.path.join(shot, f"{comp}Vertical.tsx"), "w", encoding="utf-8").write(
        VERT_TSX.format(comp=comp, cut_len=round(cut["end"] - cut["start"], 2)))
    emit_shots_ts(contract, os.path.join(shot, "shots.gen.ts"))
    lines = "\n".join("  {{ text: '{t}', start: {s}, end: {e}, words: [] }},".format(
        t=l["text"].replace("'", "\\'"), s=l["start"], e=l["end"]) for l in vo)
    open(os.path.join(shot, "vo.gen.ts"), "w", encoding="utf-8").write(VO_GEN.format(lines=lines))

    subprocess.run(["node", "scripts/gen-registry.mjs"], cwd=os.path.join(ROOT, "remotion"),
                   check=True, stdout=subprocess.DEVNULL)

    print(f"""
scaffolded {rel}  [{comp} + {comp}Vertical]  {total}s  cast: {', '.join(contract['cast'])}
  {rel}/beats.json      write the story here: vo[] (+ "speaker"), shots[], shortCut
  {rel}/script.md       the beat sheet
  remotion/src/shots/ks-{n}/   renders as-is (no drawing code — it plays beats.json's shots)

next:
  python tools/check_short.py {rel}
  cd remotion && node scripts/frames.mjs {comp} --auto      # QA (after build's gen stage if shots changed)
  python tools/build_short.py {rel} --engine edge
""")


if __name__ == "__main__":
    main()
