#!/usr/bin/env python3
"""
common.py — the small helpers several tools share (stdlib only, no side effects on import).

  load_env()                 .env at the repo root, overlaid by the real environment
  get_arg / get_args_multi   tiny argv readers for the hand-rolled CLIs (gen_clip, gen_image, …)
  parse_val                  "--param k 5" → 5, "--param k true" → True, else the raw string
  download(url, out)         fetch a result file with a timeout (urlretrieve has none)
  write_json(path, obj)      atomic write (tmp + os.replace) — a crash never leaves half a beats.json
  probe_duration … normalize_clip   the library-clip audio block shared by gen_sfx / gen_music
"""
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_env():
    env = {}
    p = os.path.join(ROOT, ".env")
    if os.path.exists(p):
        with open(p, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    return {**env, **os.environ}


def get_arg(args, name, default=None):
    if name not in args:
        return default
    i = args.index(name) + 1
    if i >= len(args):
        sys.exit(f"{name} needs a value")
    return args[i]


def get_args_multi(args, name):
    return [args[i + 1] for i, a in enumerate(args[:-1]) if a == name]


def parse_val(v):
    try:
        return json.loads(v)
    except (ValueError, json.JSONDecodeError):
        return v


def write_json(path, obj, **dump_kw):
    """json.dump to `path` atomically: write a sibling tmp file, then os.replace it in."""
    dump_kw.setdefault("ensure_ascii", False)
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, **dump_kw)
    os.replace(tmp, path)


def download(url, out, timeout=300):
    """Stream `url` to `out` (via a tmp file, so a dropped connection leaves no half file)."""
    tmp = out + ".part"
    with urllib.request.urlopen(url, timeout=timeout) as r, open(tmp, "wb") as f:
        shutil.copyfileobj(r, f)
    os.replace(tmp, out)


# ── library-clip audio (gen_sfx.py, gen_music.py) ──────────────────────────────────────────

def run_capture(cmd):
    return subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True).stdout


def probe_duration(path):
    """Seconds (3 dp), or None when ffprobe cannot read the file."""
    out = run_capture(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                       "-of", "default=nw=1:nk=1", path]).strip()
    try:
        return round(float(out), 3)
    except ValueError:
        return None


def measure_peak_db(path):
    out = run_capture(["ffmpeg", "-hide_banner", "-i", path, "-af", "volumedetect",
                       "-f", "null", os.devnull])
    m = re.search(r"max_volume:\s*(-?[\d.]+) dB", out)
    return float(m.group(1)) if m else None


def measure_lufs(path):
    """Best-effort integrated loudness (ebur128). Unreliable for <1s transients; informational."""
    out = run_capture(["ffmpeg", "-hide_banner", "-i", path, "-af", "ebur128", "-f", "null", os.devnull])
    ms = re.findall(r"I:\s*(-?[\d.]+)\s*LUFS", out)
    try:
        return float(ms[-1]) if ms else None
    except ValueError:
        return None


def apply_gain(path, gain_db):
    if abs(gain_db) < 0.1:
        return True
    tmp = path + ".norm.mp3"
    run_capture(["ffmpeg", "-y", "-hide_banner", "-i", path, "-af", f"volume={gain_db:.2f}dB",
                 "-c:a", "libmp3lame", "-q:a", "2", tmp])
    if os.path.exists(tmp) and os.path.getsize(tmp) > 0:
        os.replace(tmp, path)
        return True
    if os.path.exists(tmp):
        os.remove(tmp)
    return False


def normalize_clip(path, target_lufs, ceiling_db):
    """Loudness-normalize to target_lufs so gain_db in a plan is perceptually meaningful,
    but never let the peak exceed ceiling_db (single re-encode). Falls back to a plain
    peak-to-ceiling normalize for transients too short for a reliable ebur128 reading."""
    lufs = measure_lufs(path)
    peak = measure_peak_db(path)
    if peak is None:
        return None, None
    if lufs is None or lufs < -50:  # ebur128 gated the clip — peak-normalize instead
        apply_gain(path, ceiling_db - peak)
    else:
        gain = target_lufs - lufs
        if peak + gain > ceiling_db:      # would clip -> clamp to the ceiling
            gain = ceiling_db - peak
        apply_gain(path, gain)
    return measure_lufs(path), measure_peak_db(path)
