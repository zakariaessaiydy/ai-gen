#!/usr/bin/env python3
"""
song_to_ace.py — turn Tiny Sparks song.json files into ONE Kaggle notebook that sings them all
with ACE-Step 1.5 (free, real vocals), so the pipeline no longer uses gen_song.py's chanted vocal.

For each song: the full lyrics from song.json (form order, section tags), its bpm, its current length
(beatmap.json durationSec, so long videos stay ≥ 5 min), and a STYLE from the rotation in
kids-shorts/tiny-sparks/songs/ace-styles.json. The style + seeds are written back into song.json
("ace": {...}) the first time, so a re-run keeps the same sound and the next new song gets the next style.

Usage:
  python tools/song_to_ace.py                                   # every songs/day-* folder
  python tools/song_to_ace.py kids-shorts/tiny-sparks/songs/day-028-colors-song   # just these
  python tools/song_to_ace.py --takes 2 --out tools/notebooks/ace_step_songs.ipynb

Then on Kaggle (GPU T4 x2, Internet ON): import the notebook → Run All → download ace_songs.zip →
unzip into the repo root (it recreates kids-shorts/tiny-sparks/songs/<song>/ace/*.wav) →
  python tools/align_song.py kids-shorts/tiny-sparks/songs/<song>      # word times + best take
"""
import argparse
import glob
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import write_json  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SONGS = os.path.join(ROOT, "kids-shorts", "tiny-sparks", "songs")
STYLES = os.path.join(SONGS, "ace-styles.json")
SEED_BASE = [11, 42, 2026, 7, 99]


def section_tag(name, lyrics):
    n = name.lower()
    if not lyrics.strip():
        return "[Instrumental]"
    if n in ("chorus", "a", "b") or n.startswith("chorus"):
        return "[Chorus]"
    if n in ("slow", "outro"):
        return "[Outro]"
    if n.startswith(("mix", "build", "weekend", "birthday", "actions", "bridge")):
        return "[Bridge]"
    return "[Verse]"


def lyric_lines(text):
    """song.json lyric markup → sung lines ("Co-lors" → "Colors", "_" holds dropped). Same words as gen_song."""
    out = []
    for raw in text.split("/"):
        words = [w.replace("-", "") for w in raw.split() if w != "_"]
        if words:
            out.append(" ".join(words))
    return out


def ace_lyrics(song):
    secs, form = song["sections"], song.get("form") or list(song["sections"].keys())
    blocks = []
    for name in form:
        lyr = secs[name].get("lyrics", "")
        tag = section_tag(name, lyr)
        lines = lyric_lines(lyr)
        blocks.append(tag + ("\n" + "\n".join(lines) if lines else ""))
    return "\n\n".join(blocks) + "\n"


def estimate_duration(song):
    """No beatmap yet (new song): length from the form's bars, floored at 5 min (long-video minimum)."""
    bars = song.get("introBars", 0) + song.get("outroBars", 0)
    for name in song.get("form") or song["sections"]:
        bars += len(song["sections"][name]["chords"].split("|"))
    sec = bars * song.get("beatsPerBar", 4) * 60.0 / float(song["bpm"])
    return round(max(sec, 300.0), 1)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("songs", nargs="*", help="song folders (default: every songs/day-*)")
    ap.add_argument("--takes", type=int, default=2, help="takes per song (align_song.py keeps the best)")
    ap.add_argument("--model", default="acestep-v15-turbo", help="acestep-v15-turbo | acestep-v15-sft (2B: fits a T4 in float32)")
    ap.add_argument("--out", default=os.path.join(ROOT, "tools", "notebooks", "ace_step_songs.ipynb"))
    args = ap.parse_args()

    bank = json.load(open(STYLES, encoding="utf-8"))
    dirs = [os.path.abspath(d) for d in args.songs] or sorted(glob.glob(os.path.join(SONGS, "day-*")))
    used = 0
    for d in sorted(glob.glob(os.path.join(SONGS, "*", "song.json"))):  # count styles already assigned
        if "ace" in json.load(open(d, encoding="utf-8")):
            used += 1
    jobs = []
    for d in dirs:
        sp = os.path.join(d, "song.json")
        song = json.load(open(sp, encoding="utf-8"))
        bm = os.path.join(d, "beatmap.json")
        dur = json.load(open(bm, encoding="utf-8"))["durationSec"] if os.path.exists(bm) else estimate_duration(song)
        if "ace" not in song:
            style = bank["rotation"][used % len(bank["rotation"])]
            used += 1
            song["ace"] = {"style": style, "seeds": [s + used for s in SEED_BASE[: args.takes]]}
            write_json(sp, song, indent=1)
        ace = song["ace"]
        rel = os.path.relpath(d, ROOT).replace("\\", "/")
        jobs.append({
            "id": os.path.basename(d), "dir": rel, "style": ace["style"], "seeds": ace["seeds"][: args.takes],
            "caption": bank["styles"][ace["style"]], "bpm": int(song["bpm"]),
            "duration": round(float(dur), 1), "lyrics": ace_lyrics(song),
        })
        print(f"{os.path.basename(d):40s} {ace['style']:9s} {dur:6.1f}s  seeds {ace['seeds'][: args.takes]}")
    build_notebook(jobs, args.model, args.out)
    print(f"\n{len(jobs)} song(s) -> {os.path.relpath(args.out, ROOT)}")


# ─────────────────────────────── the Kaggle notebook ─────────────────────────────────────────────
INTRO = """
# Tiny Sparks — sing ALL the songs with ACE-Step 1.5 (FREE, Kaggle T4)

Made by `tools/song_to_ace.py` — every job below is a real Tiny Sparks song (full lyrics, its bpm and length,
its own rotating style). **Settings → GPU T4 x2 · Internet ON → Run All.**
- Cell 1 installs ACE-Step 1.5 in its own Python 3.11 (`uv`, ~5–10 min; red dependency warnings are normal).
- Cell 4 downloads the model to the big temporary disk on first use, then sings every take.
- At the end download **`ace_songs.zip`** (Output panel) and unzip it at the ROOT of the repo: it recreates
  `kids-shorts/tiny-sparks/songs/<song>/ace/*.wav`. Then `python tools/align_song.py <song folder>`.

T4 notes (all handled): float16 overflows → float32 patch; XL doesn't fit in float32 → 2B model;
cuDNN off; models in /kaggle/tmp (/kaggle/working is ~20 GB); matplotlib backend fix.
"""

INSTALL = """
# 1) Install ACE-Step 1.5 in its own Python 3.11 environment
!nvidia-smi --query-gpu=name,memory.total --format=csv
!pip install -q uv
!git clone -q https://github.com/ACE-Step/ACE-Step-1.5.git /kaggle/working/ACE-Step-1.5 || echo "already cloned"
!cd /kaggle/working/ACE-Step-1.5 && uv sync --python 3.11 2>&1 | tail -n 8
!test -x /kaggle/working/ACE-Step-1.5/.venv/bin/python && echo "READY: ACE-Step 1.5 environment OK" || echo "NOT READY: paste the output above"
"""

GEN = r'''
%%writefile /kaggle/working/gen_songs.py
# Runs INSIDE the ACE-Step 1.5 venv (Python 3.11): load the model once, sing every job x seed.
import json, os, shutil, sys, time
os.environ.setdefault("CUDA_VISIBLE_DEVICES", "0")
os.environ["MPLBACKEND"] = "Agg"
J = json.load(open("/kaggle/working/jobs.json"))
ROOT = "/kaggle/working/ACE-Step-1.5"
OUT = "/kaggle/working/ace_out"
sys.path.insert(0, ROOT); os.chdir(ROOT); os.makedirs(OUT, exist_ok=True)
os.makedirs("/kaggle/tmp", exist_ok=True)
CK_BASE = max(["/kaggle/tmp", "/tmp"], key=lambda d: shutil.disk_usage(d).free)
os.environ["ACESTEP_CHECKPOINTS_DIR"] = os.path.join(CK_BASE, "acestep-checkpoints")
os.environ["HF_HOME"] = os.path.join(CK_BASE, "hf")
os.environ["MODELSCOPE_CACHE"] = os.path.join(CK_BASE, "modelscope")
shutil.rmtree(os.path.join(ROOT, "checkpoints"), ignore_errors=True)
# T4: ACE-Step picks float16 on pre-Ampere GPUs, which overflows (NaN = silent takes) -> float32
f = os.path.join(ROOT, "acestep/core/generation/handler/init_service_orchestrator.py")
src = open(f).read()
if "self.dtype = torch.float16" in src:
    open(f, "w").write(src.replace("self.dtype = torch.float16", "self.dtype = torch.float32  # patched: T4"))
import torch
torch.backends.cudnn.enabled = False
from acestep.handler import AceStepHandler
from acestep.inference import GenerationParams, GenerationConfig, generate_music

dit = AceStepHandler()
msg, ok = dit.initialize_service(project_root=ROOT, config_path=J["model"], device="cuda",
                                 offload_to_cpu=True, quantization=None)
print(msg, flush=True)
if not ok:
    sys.exit("model init failed (see above)")
turbo = "turbo" in J["model"]
for job in J["jobs"]:
    odir = os.path.join(OUT, job["dir"], "ace")
    os.makedirs(odir, exist_ok=True)
    for seed in job["seeds"]:
        out = os.path.join(odir, f"{job['style']}-seed{seed}.wav")
        if os.path.exists(out):
            print("skip (done):", out, flush=True); continue
        p = GenerationParams(
            task_type="text2music", caption=job["caption"], lyrics=job["lyrics"], instrumental=False,
            vocal_language="en", bpm=job["bpm"], duration=job["duration"],
            inference_steps=8 if turbo else 50, guidance_scale=1.0 if turbo else 7.0,
            shift=3.0 if turbo else 1.0, seed=seed, thinking=False,
            use_cot_metas=False, use_cot_caption=False, use_cot_language=False,
        )
        c = GenerationConfig(batch_size=1, use_random_seed=False, seeds=[seed], audio_format="wav")
        tmp = "/kaggle/working/tmp_songs"; shutil.rmtree(tmp, ignore_errors=True)
        t = time.time()
        r = generate_music(dit, None, p, c, save_dir=tmp)
        if r.success and r.audios:
            a = r.audios[0]
            if a.get("path") and os.path.exists(a["path"]):
                shutil.move(a["path"], out)
            else:
                import soundfile as sf
                sf.write(out, a["tensor"].numpy().T, a.get("sample_rate", 48000))
            print(f"{job['id']} {os.path.basename(out)}  OK  ({time.time() - t:.0f}s)", flush=True)
        else:
            print(f"{job['id']} {os.path.basename(out)}  FAILED: {r.error or r.status_message}", flush=True)
'''

RUN = """
# 4) Sing everything (re-running skips takes that are already done)
!rm -rf /kaggle/working/ACE-Step-1.5/checkpoints /kaggle/working/tmp_songs
!df -h /kaggle/working /tmp | sed 1d
!cd /kaggle/working/ACE-Step-1.5 && MPLBACKEND=Agg .venv/bin/python /kaggle/working/gen_songs.py 2>&1 | grep -E " OK | FAILED|skip|Error|error|Traceback|initialized|Dtype"
"""

LISTEN = """
# 5) Listen
import glob, os
from IPython.display import Audio, display, Markdown
for p in sorted(glob.glob("/kaggle/working/ace_out/**/*.wav", recursive=True)):
    display(Markdown(f"**{os.path.relpath(p, '/kaggle/working/ace_out')}**")); display(Audio(p))
"""

ZIP = """
# 6) Download ace_songs.zip (Output panel) and unzip it at the ROOT of the repo
import os, shutil
if not glob.glob("/kaggle/working/ace_out/**/*.wav", recursive=True):
    raise SystemExit("No takes yet: look at cell 4's output.")
shutil.make_archive("/kaggle/working/ace_songs", "zip", "/kaggle/working/ace_out")
print("-> /kaggle/working/ace_songs.zip")
"""


def build_notebook(jobs, model, out):
    def md(s): return {"cell_type": "markdown", "metadata": {}, "source": s.strip("\n").splitlines(True)}
    def code(s): return {"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [], "source": s.strip("\n").splitlines(True)}
    payload = json.dumps({"model": model, "jobs": jobs}, ensure_ascii=False, indent=1)
    jobs_cell = ("# 2) The jobs (generated by tools/song_to_ace.py — edit there, not here)\n"
                 "import json, glob\nJOBS = json.loads(r'''" + payload + "''')\n"
                 "json.dump(JOBS, open('/kaggle/working/jobs.json', 'w'), indent=1)\n"
                 "for j in JOBS['jobs']: print(f\"{j['id']:40s} {j['style']:9s} {j['duration']:6.1f}s  takes {j['seeds']}\")\n")
    cells = [md(INTRO), code(INSTALL), code(jobs_cell), code(GEN), code(RUN), code(LISTEN), code(ZIP)]
    for c in cells:
        if c["cell_type"] == "code":
            compile("".join(l for l in c["source"] if not l.lstrip().startswith(("!", "%%"))), "cell", "exec")
    nb = {"cells": cells,
          "metadata": {"kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
                       "language_info": {"name": "python"}, "kaggle": {"accelerator": "gpu", "isInternetEnabled": True}},
          "nbformat": 4, "nbformat_minor": 5}
    os.makedirs(os.path.dirname(out), exist_ok=True)
    write_json(out, nb, indent=1)


if __name__ == "__main__":
    main()
