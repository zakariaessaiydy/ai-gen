#!/usr/bin/env python3
"""
gen_backgrounds.py — paint the kids channel's PLACES (media/library/backgrounds/) as one unified world.

Reads media/library/backgrounds/plan.json (STYLE + per-orientation RULES + one prompt per place) and,
for every place × orientation whose file does not exist yet, calls tools/gen_image.py with STYLE
REFERENCES — the plan's style_refs for the place's light (outdoor/indoor/night) plus the same place's
other orientation when it exists — so every painting matches the library. Each result is cover-fitted
to an exact 16:9 / 9:16 jpg (long side = out_long_side), its prompt sidecar kept in _raw/, and the
place is added to catalog.json (which lib/kids/places.tsx imports — no code change needed).

  python tools/gen_backgrounds.py --dry-run                 what would be generated (and how many)
  python tools/gen_backgrounds.py                           generate everything missing
  python tools/gen_backgrounds.py --only underwater,pond    just these places
  python tools/gen_backgrounds.py --orient tall             only 9:16 files
  python tools/gen_backgrounds.py --remaster                re-paint the existing low-res (<2000px)
                                                            files at high resolution from themselves
  python tools/gen_backgrounds.py --redo classroom-916      regenerate one file (overwrites)

Needs GEMINI_API_KEY (see gen_image.py). Then QA: node scripts/frames.mjs KidsPlacesBoard 45 (and
KidsPlacesBoardTall) from remotion/.
"""
import json
import os
import subprocess
import sys

from common import get_arg, write_json
from ffmpeg_path import find

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BG = os.path.join(ROOT, "media", "library", "backgrounds")
RAW = os.path.join(BG, "_raw")
ORIENT = {"wide": ("169", "16:9"), "tall": ("916", "9:16")}
DEFAULT_FX = {"outdoor": ["butterflies", "birds"], "indoor": ["motes"], "night": ["fireflies", "stars"]}
REMASTER = ("Recreate this exact image at high resolution: the same composition, layout, objects, colours "
            "and lighting, with crisper clean detail. Do not add or remove anything.")


def load(name):
    with open(os.path.join(BG, name), encoding="utf-8") as f:
        return json.load(f)


def width_of(path):
    out = subprocess.run([find("ffprobe"), "-v", "error", "-select_streams", "v:0", "-show_entries",
                          "stream=width,height", "-of", "csv=p=0", path], capture_output=True, text=True).stdout
    w, h = (int(x) for x in out.strip().split(","))
    return max(w, h)


def finish(png, jpg, orient, long_side):
    """cover-fit the generated png to an exact 16:9 / 9:16 jpg"""
    short = round(long_side * 9 / 16)
    w, h = (long_side, short) if orient == "wide" else (short, long_side)
    vf = f"scale={w}:{h}:force_original_aspect_ratio=increase:flags=lanczos,crop={w}:{h}"
    subprocess.run([find("ffmpeg"), "-v", "error", "-y", "-i", png, "-vf", vf, "-q:v", "2", jpg], check=True)


def gen(prompt, refs, aspect, out_png, plan, dry):
    cmd = [sys.executable, os.path.join(ROOT, "tools", "gen_image.py"), "--prompt", prompt, "--out", out_png,
           "--model", plan.get("model", "pro"), "--aspect", aspect, "--size", plan.get("size", "2K")]
    for r in refs:
        cmd += ["--ref", r]
    if dry:
        print(f"    refs: {', '.join(os.path.basename(r) for r in refs)}")
        return True
    return subprocess.run(cmd).returncode == 0


def main():
    args = sys.argv[1:]
    dry = "--dry-run" in args
    only = set(filter(None, (get_arg(args, "--only") or "").split(",")))
    orients = [get_arg(args, "--orient")] if get_arg(args, "--orient") else ["wide", "tall"]
    redo = get_arg(args, "--redo")
    plan, catalog = load("plan.json"), load("catalog.json")
    places = catalog["places"]
    long_side = int(plan.get("out_long_side", 2560))
    os.makedirs(RAW, exist_ok=True)
    jobs = []  # (place, orient, file, prompt, refs)

    if "--remaster" in args:
        for place, p in places.items():
            for o in orients:
                for f in p[o]:
                    path = os.path.join(BG, f)
                    if (not only or place in only) and width_of(path) < 2000:
                        jobs.append((place, o, f, REMASTER, [path]))
    else:
        for place, spec in plan["places"].items():
            if only and place not in only:
                continue
            for o in orients:
                suffix, _ = ORIENT[o]
                f = f"{place}-{suffix}.jpg"
                have = places.get(place, {}).get(o, [])
                if have and f"{place}-{suffix}" != redo:
                    continue
                other = places.get(place, {}).get("tall" if o == "wide" else "wide", [])
                refs = [os.path.join(BG, r) for r in dict.fromkeys(other[:1] + plan["style_refs"][spec["light"]])]
                prompt = " ".join([plan["style"], "The scene:", spec["prompt"] + ".", plan["rules"][o], plan["rules"]["always"]])
                jobs.append((place, o, f, prompt, refs))

    print(f"{len(jobs)} image(s) to paint ({plan.get('model', 'pro')}, {plan.get('size', '2K')}) — each is one billed Gemini image call")
    done = 0
    for place, o, f, prompt, refs in jobs:
        print(f"  {f}")
        png = os.path.join(RAW, f.replace(".jpg", ".png"))
        if not gen(prompt, refs, ORIENT[o][1], png, plan, dry):
            print(f"    FAILED: {f} (skipped)")
            continue
        if dry:
            continue
        finish(png, os.path.join(BG, f), o, long_side)
        entry = places.setdefault(place, {"wide": [], "tall": [], "fx": [], "use": ""})
        spec = plan["places"].get(place, {})
        entry["fx"] = entry["fx"] or spec.get("fx") or DEFAULT_FX[spec.get("light", "outdoor")]
        entry["use"] = entry["use"] or spec.get("use", place.replace("-", " "))
        if f not in entry[o]:
            entry[o].insert(0, f)
        write_json(os.path.join(BG, "catalog.json"), catalog, indent=2)  # after every image: a crash keeps progress
        done += 1
    if not dry:
        print(f"done: {done}/{len(jobs)} — now QA with KidsPlacesBoard / KidsPlacesBoardTall")


if __name__ == "__main__":
    main()
