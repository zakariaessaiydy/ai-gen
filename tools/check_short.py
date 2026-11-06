#!/usr/bin/env python3
"""
check_short.py — preflight a short in under a second, before a 50s render proves it broken.

Every check here corresponds to a mistake that has actually cost a full render + QA cycle:
the non-deterministic React hooks that make Remotion renders flicker or hang, non-monotonic
interpolate() ranges (a hard crash), Easing.bezier passed uncalled, a composition whose length
disagrees with beats.json, VO windows too tight for the narration to fit without an audible
atempo squeeze, and sfx cues pointing at ids the catalog does not have.

  python tools/check_short.py shorts/short-14-seed
  python tools/check_short.py shorts/short-14-seed --strict   # warnings count as failures

Exit code 0 = clean (or warnings only), 1 = errors. build_short.py runs it before rendering.
"""
import argparse
import json
import os
import re
import sys

# Windows consoles default to cp1252 — force UTF-8 so the report's punctuation prints
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REMOTION = os.path.join(ROOT, "remotion")

# Remotion renders every frame in a fresh browser context: state that survives across frames,
# wall-clock time, and randomness all produce frames that disagree with each other.
BANNED = [
    (r"\buseState\s*\(", "useState — frame-based only; derive values from useCurrentFrame()"),
    (r"\buseEffect\s*\(", "useEffect — side effects never run consistently across rendered frames"),
    (r"\bsetTimeout\s*\(", "setTimeout — animation must be a pure function of the frame"),
    (r"\bsetInterval\s*\(", "setInterval — animation must be a pure function of the frame"),
    (r"\bMath\.random\s*\(", "Math.random() — non-deterministic; seed it or precompute a table"),
    (r"\bDate\.now\s*\(", "Date.now() — non-deterministic across frames"),
    (r"\bnew Date\s*\(\s*\)", "new Date() — non-deterministic across frames"),
]


class Report:
    def __init__(self):
        self.errors, self.warnings, self.notes = [], [], []

    def error(self, where, msg):
        self.errors.append(f"{where}: {msg}")

    def warn(self, where, msg):
        self.warnings.append(f"{where}: {msg}")

    def note(self, msg):
        self.notes.append(msg)


def strip_comments(src):
    """Drop // and /* */ so a rule mentioned in a comment is not reported as a violation."""
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)


def check_tsx(path, rep):
    raw = open(path, encoding="utf-8").read()
    src = strip_comments(raw)
    rel = os.path.relpath(path, ROOT)

    for pattern, msg in BANNED:
        for m in re.finditer(pattern, src):
            line = src[:m.start()].count("\n") + 1
            rep.error(f"{rel}:{line}", msg)

    # interpolate(frame, [a, b, c], ...) — the input range must be STRICTLY increasing or
    # Remotion throws at render time. Only all-numeric ranges can be judged statically.
    for m in re.finditer(r"interpolate\s*\(\s*[^,]+,\s*\[([^\]]*)\]", src):
        nums = [x.strip() for x in m.group(1).split(",") if x.strip()]
        if not all(re.fullmatch(r"-?\d+(\.\d+)?", n) for n in nums):
            continue
        vals = [float(n) for n in nums]
        if any(b <= a for a, b in zip(vals, vals[1:])):
            line = src[:m.start()].count("\n") + 1
            rep.error(f"{rel}:{line}", f"interpolate input range not strictly increasing: {vals}")

    # Easing.bezier must be CALLED: `easing: Easing.bezier(.22,1,.36,1)`, never bare.
    for m in re.finditer(r"easing\s*:\s*Easing\.bezier\s*(?!\()", src):
        line = src[:m.start()].count("\n") + 1
        rep.error(f"{rel}:{line}", "Easing.bezier passed uncalled — it must be Easing.bezier(a,b,c,d)")

    cfg = re.search(r"export\s+const\s+compositionConfig\s*=\s*{(.*?)}\s*;", src, re.S)
    if not cfg:
        rep.error(rel, "no exported compositionConfig — gen-registry.mjs will skip this file")
        return None
    body = cfg.group(1)
    get_s = lambda k: (re.search(k + r"\s*:\s*['\"]([^'\"]+)['\"]", body) or [None, None])[1]
    get_n = lambda k: float(m.group(1)) if (m := re.search(k + r"\s*:\s*([0-9.]+)", body)) else None
    return {"id": get_s("id"), "durationInSeconds": get_n("durationInSeconds"),
            "fps": get_n("fps"), "width": get_n("width"), "height": get_n("height"),
            "imports_vo_gen": "vo.gen" in raw}


def check_beats(beats, cfg, proj, rep):
    fmt = beats.get("format", {})
    total = float(fmt.get("durationSec", 0))
    fps = float(fmt.get("fps", 30))

    if fmt.get("width") != 1080 or fmt.get("height") != 1920:
        rep.warn("beats.json", f"format is {fmt.get('width')}x{fmt.get('height')}, not 1080x1920")

    if cfg:
        if cfg["durationInSeconds"] and abs(cfg["durationInSeconds"] - total) > 0.05:
            rep.error("beats.json",
                      f"durationSec {total} != composition durationInSeconds {cfg['durationInSeconds']} "
                      "— captions and the loop will land on the wrong frames")
        if cfg["fps"] and cfg["fps"] != fps:
            rep.error("beats.json", f"fps {fps} != composition fps {cfg['fps']}")

    vo = beats.get("vo", [])
    voiced = any("words" in line and line["words"] for line in vo)
    for i, line in enumerate(vo):
        start, end = float(line["start"]), float(line.get("end", 0))
        nxt = float(vo[i + 1]["start"]) if i + 1 < len(vo) else total
        words = len(line["text"].split())
        window = nxt - start - 0.05
        if window <= 0:
            rep.error(f"vo[{i}]", f"line starts at {start} but the next line starts at {nxt}")
            continue
        wps = words / window
        if not voiced and wps > 3.0:
            rep.warn(f"vo[{i}]", f"{wps:.1f} words/sec in its window (>3.0 forces an audible "
                                 f"atempo squeeze; aim for ~2.7): {line['text'][:48]!r}")
        if end > total + 0.01:
            rep.error(f"vo[{i}]", f"ends at {end} past the {total}s composition")
        if end > nxt + 0.01:
            rep.warn(f"vo[{i}]", f"overruns the next line by {end - nxt:.2f}s")
    if voiced:
        rep.note(f"vo: {len(vo)} lines with REAL word times (captions are word-exact)")
    else:
        rep.note(f"vo: {len(vo)} lines with ESTIMATED timing — run the voice stage before rendering")

    for i, b in enumerate(beats.get("beats", [])):
        if float(b["end"]) > total + 0.01:
            rep.error(f"beats[{i}] {b.get('id')}", f"ends at {b['end']} past the {total}s composition")
        if i and float(b["start"]) < float(beats["beats"][i - 1]["end"]) - 0.01:
            rep.warn(f"beats[{i}] {b.get('id')}", "overlaps the previous beat")

    if cfg and voiced and not cfg["imports_vo_gen"]:
        rep.warn("composition", "beats.json has real word times but the .tsx does not import "
                                "./vo.gen — captions are still running on estimates")
    return total, fps


def check_sfx(proj, total, rep):
    plan_path = os.path.join(proj, "sfx-plan.json")
    if not os.path.exists(plan_path):
        return
    plan = json.load(open(plan_path, encoding="utf-8"))
    cat_path = os.path.join(ROOT, plan.get("catalog", "media/library/sfx/catalog.json"))
    have = set()
    if os.path.exists(cat_path):
        cat = json.load(open(cat_path, encoding="utf-8"))
        entries = cat.get("clips", cat) if isinstance(cat, dict) else cat
        have = {c["id"] for c in entries} if isinstance(entries, list) else set(entries)
    end_s = float(plan.get("render", {}).get("end_s", total))
    for i, ev in enumerate(plan.get("events", [])):
        if have and ev["sfx_id"] not in have:
            rep.error(f"sfx-plan[{i}]", f"'{ev['sfx_id']}' is not in the catalog")
        if float(ev["at_s"]) > end_s:
            rep.warn(f"sfx-plan[{i}]", f"cue at {ev['at_s']}s is past the {end_s}s mix end")
    rep.note(f"sfx: {len(plan.get('events', []))} cues")


def find_tsx(comp_id):
    shots = os.path.join(REMOTION, "src", "shots")
    for dirpath, _dirs, files in os.walk(shots):
        for f in files:
            if not f.endswith(".tsx"):
                continue
            p = os.path.join(dirpath, f)
            if re.search(r"id\s*:\s*['\"]" + re.escape(comp_id) + r"['\"]",
                         open(p, encoding="utf-8").read()):
                return p
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project", help="the short's folder, e.g. shorts/short-14-seed")
    ap.add_argument("--strict", action="store_true", help="treat warnings as failures")
    args = ap.parse_args()

    proj = os.path.abspath(args.project)
    rep = Report()
    beats_path = os.path.join(proj, "beats.json")
    if not os.path.exists(beats_path):
        sys.exit(f"no beats.json in {args.project}")
    beats = json.load(open(beats_path, encoding="utf-8"))
    comp_id = beats.get("composition")

    cfg = None
    tsx = find_tsx(comp_id) if comp_id else None
    if not tsx:
        rep.error("composition", f"no .tsx under remotion/src/shots/ declares id '{comp_id}'")
    else:
        cfg = check_tsx(tsx, rep)
        rep.note(f"composition: {os.path.relpath(tsx, ROOT)}")

    total, _fps = check_beats(beats, cfg, proj, rep)
    check_sfx(proj, total, rep)

    for n in rep.notes:
        print(f"  . {n}")
    for w in rep.warnings:
        print(f"  ! {w}")
    for e in rep.errors:
        print(f"  X {e}")
    print(f"\n{len(rep.errors)} error(s), {len(rep.warnings)} warning(s)")
    if rep.errors or (args.strict and rep.warnings):
        sys.exit(1)


if __name__ == "__main__":
    main()
