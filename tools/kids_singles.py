"""kids_singles.py — every episode of a marathon as its OWN video, each with an intro.

For each episode in <marathon>/plan.json (written by the marathon's assemble.py):
  1. renders KidsEpIntroNNN (remotion/src/shots/kids-compilation: the channel ident on the jingle, then the cast waves
     under the episode's title — the same intro design as the marathons)
  2. adds the jingle + the theme bed to it (the same mix as the marathon intro)
  3. joins intro + episode → <marathon>/output/singles/day-NNN-<slug>.mp4 (1080p30, CRF 24, AAC 128k)
  4. with --send: a copy under 30 MB → <marathon>/output/send/day-NNN-<slug>.mp4 (two-pass, for sending in chat)
Steps whose output already exists are skipped (--force redoes them). The episodes must be built first (build.sh).

  python tools/kids_singles.py kids-shorts/tiny-sparks/compilations/marathon-08 [marathon-09 ...] [--send] [--force]
Run from the repo root.
"""
import argparse
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JINGLE = "media/library/sfx/clips/tiny-sparks-jingle.mp3"
BED = "media/library/music/clips/tiny-sparks-bounce.mp3"
SEND_MB = 28.0


def run(cmd, cwd=None):
    print("$", " ".join(cmd))
    subprocess.run(cmd, cwd=cwd, check=True)


def dur(f):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f],
                         capture_output=True, text=True, check=True).stdout
    return float(out)


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("marathons", nargs="+")
    ap.add_argument("--send", action="store_true", help="also write copies under 30 MB to output/send/")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--concurrency", type=int)
    a = ap.parse_args()
    os.chdir(ROOT)

    jobs = []
    for m in a.marathons:
        plan = json.load(open(os.path.join(m, "plan.json"), encoding="utf-8"))
        for e in plan["episodes"]:
            if not os.path.exists(e["file"]):
                sys.exit(f"day {e['day']}: missing {e['file']} — build the marathon first (build.sh)")
            name = f"day-{e['day']:03d}-{slug(e['title'])}.mp4"
            jobs.append((m, e, name))

    # 1. the intros (one render call for all of them; cached renders are skipped)
    ids = [f"KidsEpIntro{e['day']:03d}" for _, e, _ in jobs]
    need = [i for i in ids if a.force or not os.path.exists(f"remotion/out/{i}.mp4")]
    if need:
        cmd = ["node", "scripts/render-all.mjs", *need, "--scale=1"]
        if a.concurrency:
            cmd.append(f"--concurrency={a.concurrency}")
        run(cmd, cwd="remotion")

    for m, e, name in jobs:
        d = e["day"]
        out_dir = os.path.join(m, "output", "singles")
        os.makedirs(out_dir, exist_ok=True)
        intro = os.path.join(out_dir, f"intro-{d:03d}.mp4")
        final = os.path.join(out_dir, name)
        # 2. jingle + bed under the intro (same mix as the marathon intro)
        if a.force or not os.path.exists(intro):
            run(["ffmpeg", "-v", "error", "-y", "-i", f"remotion/out/KidsEpIntro{d:03d}.mp4", "-i", JINGLE, "-i", BED,
                 "-filter_complex", "[1:a]volume=-2dB[j];[2:a]atrim=0:5.3,adelay=3700|3700,volume=-8dB,afade=t=out:st=7.8:d=1.2[b];"
                 "[j][b]amix=inputs=2:normalize=0,apad,atrim=0:9[a]",
                 "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", intro])
        # 3. intro + episode
        if a.force or not os.path.exists(final):
            fc = "".join(f"[{i}:v]scale=1920:1080:flags=lanczos,fps=30,format=yuv420p,setsar=1[v{i}];"
                         f"[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo[a{i}];" for i in range(2))
            fc += "[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]"
            run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", intro, "-i", e["file"], "-filter_complex", fc,
                 "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "medium", "-tune", "animation", "-crf", "24",
                 "-maxrate", "1800k", "-bufsize", "3600k", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", final])
        # 4. a copy under 30 MB (two-pass to an exact size)
        if a.send:
            send_dir = os.path.join(m, "output", "send")
            os.makedirs(send_dir, exist_ok=True)
            small = os.path.join(send_dir, name)
            if a.force or not os.path.exists(small):
                vb = int(SEND_MB * 8 * 1024 / dur(final) - 72)
                log = os.path.join(send_dir, f"pass-{d:03d}")
                common = ["-c:v", "libx264", "-preset", "slow", "-tune", "animation", "-b:v", f"{vb}k", "-passlogfile", log]
                run(["ffmpeg", "-v", "error", "-y", "-i", final, *common, "-pass", "1", "-an", "-f", "null", os.devnull])
                run(["ffmpeg", "-v", "error", "-y", "-i", final, *common, "-pass", "2", "-c:a", "aac", "-b:a", "64k",
                     "-movflags", "+faststart", small])
                for f in os.listdir(send_dir):
                    if f.startswith(f"pass-{d:03d}"):
                        os.remove(os.path.join(send_dir, f))
        print(f"day {d}: {final}  ({dur(final) / 60:.1f} min)")


if __name__ == "__main__":
    main()
