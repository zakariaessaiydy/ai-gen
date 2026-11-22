#!/usr/bin/env python3
"""
paperdoc.py — a drawn ("crayon / paper") documentary from ONE script file, in one command.

  python tools/paperdoc.py paper-docs/<slug>              # voice → timing → composition → SFX → render → music
  python tools/paperdoc.py paper-docs/<slug> --no-render  # stop after writing the composition (QA frames first)

paper-docs/<slug>/doc.json:
  {
    "id": "PaperDocTulips",                     # the Remotion composition id
    "title": "Tulip Mania",
    "voice": {"kokoro": "bm_george", "rate": "-4%"},   # any gen_voice cast entry (kokoro/edge/azure/elevenlabs)
    "music": {"bed": "docu-pluck", "gain": -9, "duck": 8},
    "gap": 0.55,                                 # default pause after each line (s); a scene may set "gap"
    "format": "16:9",                            # or "9:16" (Shorts)
    "captions": false,
    "scenes": [ {"type": "title", "vo": "...", "kicker": "...", "title": "..."}, ... ]
  }
Scene types and fields: remotion/src/lib/paperdoc/index.tsx (the `Scene` type). One scene = one narration line.

Writes: beats.json (voice + timing), remotion/src/shots/paperdoc-<slug>/{<Id>.tsx, scenes.gen.ts, vo.gen.ts},
sfx-plan.json (page turns, pops, stamps, scribbles timed to the words), then runs tools/build_short.py.
"""
import argparse
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.path.join(ROOT, "remotion", "src", "shots")
LEAD = 0.35  # = LEAD in lib/paperdoc (a scene arrives this long before its line)
TAIL = 2.6  # s of picture after the last line


def run(cmd):
    print("$", " ".join(cmd), flush=True)
    r = subprocess.run(cmd, cwd=ROOT)
    if r.returncode:
        sys.exit(f"FAILED ({r.returncode}): {' '.join(cmd)}")


def norm(w):
    return re.sub(r"[^a-z0-9$%]", "", w.lower())


def cue(line, word, t0, t1, frac=0.15):
    """The same rule as makeCue() in lib/paperdoc: first word that starts with / contains `word`."""
    if word:
        target = norm(word)
        for w in line.get("words") or []:
            n = norm(w["w"])
            if n.startswith(target) or (len(target) > 3 and target in n):
                return w["start"]
    return t0 + (t1 - t0) * frac


def voice(beats_path, emit=None):
    cmd = [sys.executable, os.path.join("tools", "gen_voice.py"), "--beats", beats_path, "--engine", "kokoro", "--jobs", "4"]
    if emit:
        cmd += ["--emit-ts", emit]
    run(cmd)


def sfx_plan(doc, beats, comp_id, proj, total):
    vo = beats["vo"]
    wins = []
    for i, l in enumerate(vo):
        t0 = 0 if i == 0 else max(0, l["start"] - LEAD)
        t1 = total if i == len(vo) - 1 else vo[i + 1]["start"] - LEAD
        wins.append((t0, t1))
    ev = []

    def add(at, sid, gain, what):
        ev.append({"at_s": round(max(0.0, at), 3), "sfx_id": sid, "gain_db": gain, "shot": comp_id, "cue": what})

    for i, (s, l, (t0, t1)) in enumerate(zip(doc["scenes"], vo, wins)):
        k = s["type"]
        if i:
            add(t0, "page-flip", -11, f"scene {i}: new sheet")
        if k == "title":
            add(t0 + 0.25, "impact-soft", -10, "title lands")
        elif k == "number":
            at = cue(l, s.get("cue"), t0, t1, 0.12)
            add(at - 0.9, "riser-soft", -14, "number builds")
            add(at, "pop-reveal", -9, "number")
        elif k == "chart":
            add(t0 + 0.6, "pencil-scribble", -12, "chart draws")
        elif k == "timeline":
            n = len(s["events"])
            for j, e in enumerate(s["events"]):
                at = cue(l, e.get("cue"), t0, t1) if e.get("cue") else t0 + 0.8 + (t1 - t0 - 1.4) * j / n
                add(at, "pop-reveal", -14, f"event {j}")
        elif k == "compare":
            add(t0 + 0.3, "whoosh-soft", -13, "left card")
            add(cue(l, s.get("cue"), t0, t1, 0.45), "whoosh-soft", -12, "right card")
        elif k == "list":
            n = len(s["items"])
            for j in range(n):
                add(t0 + 0.5 + (t1 - t0 - 1.0) * j / n, "pop-reveal", -14, f"note {j}")
        elif k == "quote":
            add(t0 + 0.4, "keys-typing-soft", -16, "the quote types out")
        elif k == "document":
            add(cue(l, s.get("cue"), t0, t1, 0.45), "pencil-scribble", -12, "highlight")
        if s.get("stamp"):
            add(cue(l, s["stamp"].get("cue"), t0, t1, 0.6), "stamp-hit", -7, f"stamp {s['stamp']['text']}")
        for c in s.get("cast") or []:
            if c.get("cue") and c.get("enter", "pop") == "pop":
                add(cue(l, c["cue"], t0, t1), "pop-reveal", -15, "character pops in")
        for x in s.get("sfx") or []:
            add(t0 + 0.3, x, -11, "extra")
    ev.sort(key=lambda e: e["at_s"])
    return {
        "master": f"remotion/out/{comp_id}-voiced.mp4",
        "master_fps": 30,
        "catalog": "media/library/sfx/catalog.json",
        "render": {"preview": f"remotion/out/{comp_id}-voiced.mp4", "out": f"{proj}/output/{os.path.basename(proj)}-sfx.mp4",
                   "end_s": total, "duck": True},
        "events": ev,
    }


TSX = """// PAPERDOC · {title} — drawn documentary, generated by tools/paperdoc.py from {proj}/doc.json.
// Edit the SCRIPT (doc.json) and re-run the tool; this file only wires the engine.
import React from 'react';
import {{ PaperDoc }} from '../../lib/paperdoc';
import {{ SCENES }} from './scenes.gen';
import {{ VO }} from './vo.gen';

export const compositionConfig = {{ id: '{id}', durationInSeconds: {dur}, fps: 30, width: {w}, height: {h} }};

export default function {id}() {{
  return <PaperDoc vo={{VO}} scenes={{SCENES}} captions={{{captions}}} />;
}}
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--no-render", action="store_true")
    ap.add_argument("--concurrency", type=int)
    a = ap.parse_args()
    proj = os.path.relpath(os.path.abspath(a.project), ROOT)
    doc = json.load(open(os.path.join(ROOT, proj, "doc.json"), encoding="utf-8"))
    comp_id = doc["id"]
    slug = os.path.basename(proj)
    w, h = (1080, 1920) if doc.get("format") == "9:16" else (1920, 1080)
    shot_dir = os.path.join(SHOTS, f"paperdoc-{slug}")
    os.makedirs(shot_dir, exist_ok=True)
    beats_path = os.path.join(proj, "beats.json")

    # 1. beats.json — one narration line per scene, spaced wide for the first (measuring) voice pass
    gap = doc.get("gap", 0.55)
    vo = [{"beat": f"s{i:02d}", "speaker": "narrator", "text": s["vo"], "gap": s.get("gap", gap), "start": round(0.3 + i * 40, 2)}
          for i, s in enumerate(doc["scenes"])]
    beats = {"id": slug, "title": doc.get("title", slug), "composition": comp_id,
             "format": {"width": w, "height": h, "fps": 30, "durationSec": round(len(vo) * 40, 1)},
             "voicePlan": "kokoro", "cast": {"narrator": doc.get("voice", {"kokoro": "bm_george", "rate": "-4%"})},
             "music": doc.get("music", {"bed": "docu-pluck", "gain": -9, "duck": 8, "start": 0, "fade_in": 0.4}), "vo": vo}
    old = json.load(open(os.path.join(ROOT, beats_path), encoding="utf-8")) if os.path.exists(os.path.join(ROOT, beats_path)) else None
    json.dump(beats, open(os.path.join(ROOT, beats_path), "w", encoding="utf-8"), indent=1, ensure_ascii=False)

    # the composition files must exist before gen_voice can --emit-ts next to them
    with open(os.path.join(shot_dir, "scenes.gen.ts"), "w", encoding="utf-8") as f:
        f.write("// AUTO-GENERATED by tools/paperdoc.py from the doc.json scenes — do not edit.\n")
        f.write("import type { Scene } from '../../lib/paperdoc';\n")
        f.write("export const SCENES: Scene[] = " + json.dumps(doc["scenes"], indent=1, ensure_ascii=False) + ";\n")
    tsx_path = os.path.join(shot_dir, f"{comp_id}.tsx")

    def write_tsx(dur):
        with open(tsx_path, "w", encoding="utf-8") as f:
            f.write(TSX.format(title=doc.get("title", slug), proj=proj, id=comp_id, dur=dur, w=w, h=h,
                               captions="true" if doc.get("captions") else "false"))

    if not os.path.exists(tsx_path):
        write_tsx(len(vo) * 40)

    # 2. measure every line (TTS is cached by text+voice, so re-runs are free), then pack the timeline
    voice(beats_path)
    beats = json.load(open(os.path.join(ROOT, beats_path), encoding="utf-8"))
    t = 0.3
    for l in beats["vo"]:
        d = l["end"] - l["start"]
        l["start"], l["end"] = round(t, 2), round(t + d, 2)
        l.pop("words", None)
        t = l["end"] + l["gap"]
    total = round(beats["vo"][-1]["end"] + TAIL, 1)
    beats["format"]["durationSec"] = total
    json.dump(beats, open(os.path.join(ROOT, beats_path), "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    voice(beats_path, emit=os.path.join("remotion", "src", "shots", f"paperdoc-{slug}", "vo.gen.ts"))
    beats = json.load(open(os.path.join(ROOT, beats_path), encoding="utf-8"))
    write_tsx(total)
    print(f"\ncomposition {comp_id}: {len(vo)} scenes, {total:.1f} s ({int(total // 60)}:{int(total % 60):02d})")

    # 3. the SFX plan, timed to the words
    plan = sfx_plan(doc, beats, comp_id, proj, total)
    json.dump(plan, open(os.path.join(ROOT, proj, "sfx-plan.json"), "w", encoding="utf-8"), indent=1)
    print(f"sfx-plan.json: {len(plan['events'])} cues")

    if a.no_render:
        print("\nnext: QA frames →  cd remotion && node scripts/frames.mjs", comp_id, "--auto --scale=0.5")
        return
    # 4. render → mux → SFX → music (voice is cached, so build_short's voice stage is instant)
    cmd = [sys.executable, os.path.join("tools", "build_short.py"), proj, "--engine", "kokoro"]
    if a.concurrency:
        cmd.append(f"--concurrency={a.concurrency}")
    run(cmd)


if __name__ == "__main__":
    main()
