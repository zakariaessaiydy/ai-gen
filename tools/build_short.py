#!/usr/bin/env python3
"""
build_short.py — the whole back half of a short in ONE command.

Stages 3-6 of /make-short used to be six commands typed in order, each waited on:
registry gen, render, gen_voice, ffmpeg mux, mix_sfx, mix_music. Worse, the documented order
rendered the composition TWICE — once before the voice existed, then again after gen_voice
wrote the real word times into vo.gen.ts. This runs them in the ONE order that is correct:

    gen -> voice -> render -> mux -> sfx -> music

Voice first means the captions are word-exact on the FIRST render, so a ~40s short renders
once (~50s) instead of twice (~110s).

Usage:
  python tools/build_short.py shorts/short-14-seed              # everything it can
  python tools/build_short.py shorts/short-14-seed --draft      # half-scale motion check, fast
  python tools/build_short.py shorts/short-14-seed --stages render,mux
  python tools/build_short.py shorts/short-14-seed --engine edge --rate +12%
  python tools/build_short.py shorts/short-14-seed --music all  # audition every bed

Reads the engine/voice/rate from beats.json ("voicePlan": "edge:en-US-Andrew... --rate +12%")
unless overridden. Skips a render when nothing that feeds it changed (--force to override).
Works for shorts/, ai-shorts/ and vox-shorts/ projects alike.
"""
import argparse
import hashlib
import json
import os
import re
import shlex
import subprocess
import sys
import time

from ffmpeg_path import ensure_on_path

ensure_on_path()

# Windows consoles default to cp1252 — force UTF-8 so the stage log prints cleanly
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REMOTION = os.path.join(ROOT, "remotion")
ALL_STAGES = ["gen", "voice", "render", "mux", "sfx", "music"]


def sh(cmd, cwd=None, quiet=False):
    """Run a command, streaming its output. Exits with the tool's own message on failure."""
    printable = " ".join(shlex.quote(c) for c in cmd)
    if not quiet:
        print(f"\n$ {printable}", flush=True)
    r = subprocess.run(cmd, cwd=cwd)
    if r.returncode != 0:
        sys.exit(f"\nFAILED ({r.returncode}): {printable}")


def find_shot_dir(comp_id):
    """The remotion/src/shots/<group>/ directory whose .tsx declares this composition id."""
    shots = os.path.join(REMOTION, "src", "shots")
    for group in sorted(os.listdir(shots)):
        gdir = os.path.join(shots, group)
        if not os.path.isdir(gdir):
            continue
        for name in os.listdir(gdir):
            if not name.endswith(".tsx"):
                continue
            src = open(os.path.join(gdir, name), encoding="utf-8").read()
            if re.search(r"id\s*:\s*['\"]" + re.escape(comp_id) + r"['\"]", src):
                return gdir
    return None


def parse_voice_plan(beats, args):
    """engine/voice/rate from --flags, else beats.json's voicePlan/voiceStatus, else defaults."""
    engine, voice, rate = args.engine, args.voice, args.rate
    plan = beats.get("voicePlan") or beats.get("voiceStatus") or ""
    if not engine or not voice:
        # "edge:<voice> --rate +12%", or a bare "edge" / "elevenlabs" for a cast episode
        # whose voices come from beats.json's per-speaker "cast" map
        m = re.match(r"\s*(elevenlabs|edge|kokoro)\b(?:\s*:\s*([^\s]+))?", plan)
        if m:
            engine = engine or m.group(1)
            voice = voice or m.group(2)
    if not rate:
        m = re.search(r"--rate\s+(\S+)", plan)
        rate = m.group(1) if m else None
    return engine or "elevenlabs", voice, rate


def render_fingerprint(shot_dir, comp_id, scale):
    """Hash of everything the render depends on: the shot, the shared libs, and the scale."""
    h = hashlib.sha1(f"{comp_id}|{scale}".encode())
    roots = [shot_dir, os.path.join(REMOTION, "src", "lib")]
    for r in roots:
        for dirpath, _dirs, files in os.walk(r):
            for f in sorted(files):
                p = os.path.join(dirpath, f)
                st = os.stat(p)
                h.update(f"{os.path.relpath(p, REMOTION)}|{st.st_size}|{int(st.st_mtime)}\n".encode())
    for extra in ("brand.ts", "fonts.ts", "Root.tsx", "index.ts"):
        p = os.path.join(REMOTION, "src", extra)
        if os.path.exists(p):
            h.update(open(p, "rb").read())
    return h.hexdigest()[:12]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project", help="the short's folder, e.g. shorts/short-14-seed")
    ap.add_argument("--stages", help=f"comma list of {','.join(ALL_STAGES)} (default: all that apply)")
    ap.add_argument("--skip", help="comma list of stages to skip")
    ap.add_argument("--draft", action="store_true",
                    help="render at half scale / crf 30 into <Id>-draft.mp4 — a motion check, not a master")
    ap.add_argument("--scale", type=float, help="render scale (default 1 for shorts, 0.5 with --draft)")
    ap.add_argument("--engine", choices=("elevenlabs", "edge", "kokoro"))
    ap.add_argument("--voice")
    ap.add_argument("--rate", help="edge/kokoro, e.g. +12%%")
    ap.add_argument("--jobs", type=int, default=4, help="parallel TTS lines (default 4)")
    ap.add_argument("--music", help="bed id, or 'all' to audition every bed")
    ap.add_argument("--force", action="store_true", help="re-render even when nothing changed")
    ap.add_argument("--force-voice", action="store_true", help="re-bill every TTS line")
    ap.add_argument("--no-check", action="store_true", help="skip the preflight (check_short.py)")
    args = ap.parse_args()

    proj = os.path.abspath(args.project)
    beats_path = os.path.join(proj, "beats.json")
    if not os.path.exists(beats_path):
        sys.exit(f"no beats.json in {args.project}")
    beats = json.load(open(beats_path, encoding="utf-8"))
    comp_id = beats.get("composition")
    if not comp_id:
        sys.exit("beats.json has no \"composition\" id")
    total = float(beats["format"]["durationSec"])

    shot_dir = find_shot_dir(comp_id)
    if not shot_dir:
        sys.exit(f"no .tsx under remotion/src/shots/ declares id '{comp_id}' — write the composition first")

    stages = [s.strip() for s in args.stages.split(",")] if args.stages else list(ALL_STAGES)
    if not args.stages:
        if not os.path.exists(os.path.join(proj, "sfx-plan.json")):
            stages.remove("sfx")
        if not args.music:
            stages.remove("music")
    for s in (args.skip or "").split(","):
        if s.strip() in stages:
            stages.remove(s.strip())

    scale = args.scale if args.scale is not None else (0.5 if args.draft else 1)
    suffix = "-draft" if args.draft else ""
    video = os.path.join(REMOTION, "out", f"{comp_id}{suffix}.mp4")
    voiced = os.path.join(REMOTION, "out", f"{comp_id}{suffix}-voiced.mp4")
    voice_wav = os.path.join(proj, "voice", "voice.wav")

    print(f"build {beats.get('id', comp_id)}  [{comp_id}]  {total:.1f}s  scale={scale}")
    print(f"stages: {' -> '.join(stages)}")
    timings = []

    def stage(name):
        return name in stages

    t_all = time.time()

    # Preflight first: a banned hook or a non-monotonic interpolate range is a crash 45s into
    # the render, and a duration mismatch is a re-render. Both are a one-second check.
    if not args.no_check:
        print("\npreflight:")
        r = subprocess.run(["python", os.path.join(ROOT, "tools", "check_short.py"), proj], cwd=ROOT)
        if r.returncode != 0:
            sys.exit("preflight found errors — fix them (or pass --no-check) before building")

    if stage("gen"):
        t = time.time()
        sh(["node", "scripts/gen-registry.mjs"], cwd=REMOTION)
        timings.append(("gen", time.time() - t))

    if stage("voice"):
        t = time.time()
        engine, voice, rate = parse_voice_plan(beats, args)
        cmd = ["python", os.path.join(ROOT, "tools", "gen_voice.py"),
               "--beats", beats_path, "--engine", engine, "--jobs", str(args.jobs),
               "--emit-ts", os.path.join(shot_dir, "vo.gen.ts")]
        if voice:
            cmd += ["--voice", voice]
        if rate and engine in ("edge", "kokoro"):
            cmd += ["--rate", rate]
        if args.force_voice:
            cmd += ["--force"]
        sh(cmd, cwd=ROOT)
        timings.append(("voice", time.time() - t))

    if stage("render"):
        # vo.gen.ts was just rewritten, so the fingerprint below already reflects the new
        # word times — a voice change correctly forces a re-render.
        fp = render_fingerprint(shot_dir, comp_id, scale)
        stampf = os.path.join(REMOTION, "out", f".{comp_id}{suffix}.fingerprint")
        fresh = (not args.force and os.path.exists(video) and os.path.exists(stampf)
                 and open(stampf).read().strip() == fp)
        if fresh:
            print(f"\nrender: up to date ({os.path.relpath(video, ROOT)}) — --force to redo")
            timings.append(("render", 0.0))
        else:
            t = time.time()
            cmd = ["node", "scripts/render-all.mjs", comp_id]
            cmd += ["--draft"] if args.draft else [f"--scale={scale}"]
            sh(cmd, cwd=REMOTION)
            open(stampf, "w").write(fp)
            timings.append(("render", time.time() - t))

    if stage("mux"):
        if not os.path.exists(voice_wav):
            print("\nmux: no voice/voice.wav yet — skipping")
        else:
            t = time.time()
            sh(["ffmpeg", "-y", "-v", "error", "-i", video, "-i", voice_wav,
                "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
                "-t", str(total), voiced], cwd=ROOT)
            print(f"voiced -> {os.path.relpath(voiced, ROOT)}")
            timings.append(("mux", time.time() - t))

    if stage("sfx"):
        plan = os.path.join(proj, "sfx-plan.json")
        if not os.path.exists(plan):
            print("\nsfx: no sfx-plan.json — skipping (author one with /suggest-sfx)")
        else:
            t = time.time()
            env = dict(os.environ, PYTHONIOENCODING="utf-8")
            subprocess.run(["python", os.path.join(ROOT, "tools", "mix_sfx.py"), plan],
                           cwd=ROOT, env=env, check=True)
            timings.append(("sfx", time.time() - t))

    if stage("music") and args.music:
        t = time.time()
        base = os.path.join(proj, "output", f"{beats.get('id', comp_id)}-sfx.mp4")
        base = base if os.path.exists(base) else voiced
        cmd = ["python", os.path.join(ROOT, "tools", "mix_music.py"), "--base", base]
        cmd += ["--all"] if args.music == "all" else ["--bed", args.music]
        sh(cmd, cwd=ROOT)
        timings.append(("music", time.time() - t))

    print("\n" + "-" * 46)
    for name, secs in timings:
        print(f"  {name:8s} {secs:6.1f}s" + ("   (cached)" if secs == 0.0 else ""))
    print(f"  {'TOTAL':8s} {time.time() - t_all:6.1f}s")
    print("-" * 46)
    for label, p in (("video", video), ("voiced", voiced)):
        if os.path.exists(p):
            print(f"  {label:8s} {os.path.relpath(p, ROOT)}")


if __name__ == "__main__":
    main()
