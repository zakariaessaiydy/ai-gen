"""Marathon #7: writes plan.json, chapters.txt and cmd.json (the ffmpeg concat) from the built episodes' real durations.
Run from the repo root (build.sh does)."""
import json
import os
import subprocess

K = "kids-shorts/tiny-sparks"
M = f"{K}/compilations/marathon-07"
BOUNCE = "output/day-{d:03d}-sfx-tiny-sparks-bounce.mp4"
EPISODES = [
    (64, "morals/day-064-the-lion-who-learned-humility", BOUNCE, "The Lion Who Learned Humility 🦁"),
    (67, "animals/day-067-bella-the-butterflys-journey", BOUNCE, "Bella the Butterfly's Journey 🦋"),
    (71, "stories/day-071-lily-learns-to-help-her-friends", BOUNCE, "Lily Learns to Help Her Friends 🤝"),
    (81, "animals/day-081-the-rabbit-and-the-wise-owl", BOUNCE, "The Rabbit and the Wise Owl 🐰🦉"),
]


def dur(f):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f],
                         capture_output=True, text=True, check=True).stdout
    return round(float(out), 1)


def stamp(s):
    s = int(s)
    return f"{s // 3600}:{s % 3600 // 60:02d}:{s % 60:02d}" if s >= 3600 else f"{s // 60}:{s % 60:02d}"


intro = f"{M}/output/intro.mp4"
eps = []
for day, folder, rel, title in EPISODES:
    f = f"{K}/{folder}/{rel.format(d=day)}" if folder else rel
    if not os.path.exists(f):
        raise SystemExit(f"day {day}: missing {f} — run build.sh")
    eps.append({"day": day, "file": f, "dur": dur(f), "title": title})

with open(f"{M}/plan.json", "w", encoding="utf-8") as fh:
    json.dump({"intro": intro, "episodes": eps}, fh, indent=1, ensure_ascii=False)

t, lines = dur(intro), ["0:00 Intro"]
for e in eps:
    lines.append(f"{stamp(t)} {e['title']}")
    t += e["dur"]
with open(f"{M}/chapters.txt", "w", encoding="utf-8") as fh:
    fh.write("\n".join(lines) + "\n")
print("\n".join(lines) + f"\nTOTAL {stamp(t)}")

files = [intro] + [e["file"] for e in eps]
cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-stats", "-y"]
for f in files:
    cmd += ["-i", f]
fc = "".join(f"[{i}:v]scale=1920:1080:flags=lanczos,fps=30,format=yuv420p,setsar=1[v{i}];"
             f"[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo[a{i}];" for i in range(len(files)))
fc += "".join(f"[v{i}][a{i}]" for i in range(len(files))) + f"concat=n={len(files)}:v=1:a=1[v][a]"
cmd += ["-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "medium", "-tune", "animation",
        "-crf", "24", "-maxrate", "1800k", "-bufsize", "3600k", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart",
        f"{M}/output/tiny-sparks-marathon-07.mp4"]
with open(f"{M}/cmd.json", "w", encoding="utf-8") as fh:
    json.dump(cmd, fh, ensure_ascii=False)
