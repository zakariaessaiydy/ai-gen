#!/usr/bin/env python3
"""
compile_kids.py — stitch finished kids-stories episodes into ONE long themed compilation,
with YouTube chapters ready to paste into the description.

Why: on the channel, single 3-5 min videos held ~30s per view while marathons held ~8 min. Parents
let a long video run, and YouTube recommends by watch time. Every episode is built to be a
compilation segment; this is the step that turns six of them into a 20-minute video.

A compilation is a small JSON file (kids-stories/compilations/<name>.json):

  {
    "id": "bedtime-stories-1",
    "title": "Bedtime Animal Stories | 20 Minutes | Tiny Sparks",
    "episodes": [
      "kids-stories/ks-1-acorn",
      {"project": "kids-stories/ks-2-stars", "file": "path/to/a/specific/final.mp4"}
    ],
    "trimNext": true
  }

For each episode the richest finished file is used: music mix > sfx mix > voiced render
(or the explicit "file"). "trimNext" (default true) cuts each episode at the start of its NEXT
beat — the "next time…" tease makes no sense when the next story starts two seconds later — and
keeps it on the LAST episode only.

  python tools/compile_kids.py kids-stories/compilations/bedtime-stories-1.json
  python tools/compile_kids.py kids-stories/compilations/bedtime-stories-1.json --dry-run

Writes kids-stories/compilations/output/<id>.mp4 and <id>-chapters.txt.
"""
import argparse
import json
import os
import subprocess
import sys

from ffmpeg_path import ensure_on_path

ensure_on_path()
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REMOTION = os.path.join(ROOT, "remotion")


def probe(path, entry):
    r = subprocess.run(["ffprobe", "-v", "error", *entry, "-of", "default=noprint_wrappers=1:nokey=1", path],
                       stdout=subprocess.PIPE, text=True)
    return r.stdout.strip()


def best_file(proj, beats):
    pid = beats.get("id")
    out = os.path.join(proj, "output")
    files = sorted(os.listdir(out)) if os.path.isdir(out) else []
    music = [f for f in files if f.startswith(f"{pid}-sfx-") and f.endswith(".mp4")]
    for cand in ([os.path.join(out, music[0])] if music else []) + [
            os.path.join(out, f"{pid}-sfx.mp4"),
            os.path.join(REMOTION, "out", f"{beats['composition']}-voiced.mp4")]:
        if os.path.exists(cand):
            return cand
    return None


def stamp(sec):
    sec = int(sec)
    h, m, s = sec // 3600, (sec % 3600) // 60, sec % 60
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("compilation", help="kids-stories/compilations/<name>.json")
    ap.add_argument("--dry-run", action="store_true", help="print the plan + chapters, encode nothing")
    args = ap.parse_args()

    spec_path = os.path.abspath(args.compilation)
    spec = json.load(open(spec_path, encoding="utf-8"))
    trim_next = spec.get("trimNext", True)
    eps = spec.get("episodes", [])
    if len(eps) < 2:
        sys.exit("a compilation needs at least 2 episodes")

    plan = []  # (title, file, dur, has_audio)
    missing = []
    for i, ep in enumerate(eps):
        ep = {"project": ep} if isinstance(ep, str) else ep
        proj = os.path.abspath(ep["project"])
        beats = json.load(open(os.path.join(proj, "beats.json"), encoding="utf-8"))
        f = os.path.abspath(ep["file"]) if ep.get("file") else best_file(proj, beats)
        if not f or not os.path.exists(f):
            missing.append(ep["project"])
            continue
        dur = float(probe(f, ["-show_entries", "format=duration"]))
        last = i == len(eps) - 1
        nxt = next((b for b in beats.get("beats", []) if b.get("id") == "next"), None)
        if trim_next and nxt and not last:
            dur = min(dur, float(nxt["start"]) + 0.4)
        has_audio = bool(probe(f, ["-select_streams", "a", "-show_entries", "stream=index"]))
        plan.append((ep.get("title") or beats.get("title", ep["project"]), f, dur, has_audio))
    if missing:
        sys.exit("no finished video for: " + ", ".join(missing) +
                 "\n  build them first:  python tools/build_short.py <project>")

    # YouTube chapters: first at 0:00, at least 3, each >= 10s
    chapters, t = [], 0.0
    for title, _f, dur, _a in plan:
        chapters.append(f"{stamp(t)} {title.split('|')[0].strip()}")
        t += dur
    total = t
    print(f"{spec.get('id')}: {len(plan)} episodes, {stamp(total)} total")
    for (title, f, dur, a), ch in zip(plan, chapters):
        print(f"  {ch:<46s} {dur:6.1f}s  {os.path.relpath(f, ROOT)}{'' if a else '  [no audio → silence]'}")
    if len(plan) < 3:
        print("  ! YouTube needs >= 3 chapters to show them — add an episode")
    if total < 600:
        print(f"  ! {stamp(total)} — compilations earn their watch time at 15-60 min")

    out_dir = os.path.join(os.path.dirname(spec_path), "output")
    os.makedirs(out_dir, exist_ok=True)
    cid = spec.get("id", os.path.splitext(os.path.basename(spec_path))[0])
    chap_path = os.path.join(out_dir, f"{cid}-chapters.txt")
    desc = [spec.get("title", cid), "", *chapters, ""]
    open(chap_path, "w", encoding="utf-8").write("\n".join(desc))
    print(f"chapters -> {os.path.relpath(chap_path, ROOT)}")
    if args.dry_run:
        return

    # normalise every input to 1920x1080@30 yuv420p + 48k stereo, then concat (re-encode once)
    inputs, parts = [], []
    for j, (_t, f, dur, has_audio) in enumerate(plan):
        inputs += ["-t", f"{dur:.3f}", "-i", f]
        parts.append(f"[{j}:v]scale=1920:1080:force_original_aspect_ratio=decrease,"
                     f"pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,format=yuv420p,setsar=1[v{j}]")
        if has_audio:
            parts.append(f"[{j}:a]aresample=48000,aformat=channel_layouts=stereo,"
                         f"afade=t=out:st={max(0, dur - 0.5):.3f}:d=0.5[a{j}]")
        else:
            parts.append(f"anullsrc=r=48000:cl=stereo,atrim=0:{dur:.3f}[a{j}]")
    chain = "".join(f"[v{j}][a{j}]" for j in range(len(plan)))
    fc = ";".join(parts) + f";{chain}concat=n={len(plan)}:v=1:a=1[v][a];[a]loudnorm=I=-16:TP=-1.5:LRA=11[ao]"
    out = os.path.join(out_dir, f"{cid}.mp4")
    cmd = ["ffmpeg", "-y", "-v", "error", "-stats", *inputs, "-filter_complex", fc,
           "-map", "[v]", "-map", "[ao]", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
           "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out]
    r = subprocess.run(cmd)
    if r.returncode:
        sys.exit("ffmpeg failed")
    print(f"compilation -> {os.path.relpath(out, ROOT)}  ({stamp(total)})")


if __name__ == "__main__":
    main()
