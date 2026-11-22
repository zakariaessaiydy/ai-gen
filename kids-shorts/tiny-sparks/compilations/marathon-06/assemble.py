"""Marathon #6: writes plan.json, chapters.txt and cmd.json (the ffmpeg concat) from the built episodes' real durations.
Run from the repo root (build.sh does)."""
import json
import os
import subprocess

K = "kids-shorts/tiny-sparks"
M = f"{K}/compilations/marathon-06"
BOUNCE = "output/day-{d:03d}-sfx-tiny-sparks-bounce.mp4"
EPISODES = [
    (46, "animals/day-046-coco-the-penguin-finds-a-friend", BOUNCE, "Coco the Penguin Finds a Friend 🐧"),
    (47, "science/day-047-how-does-rain-form", BOUNCE, "How Does Rain Form? The Water Cycle 🌧️"),
    (48, "puzzles/day-048-find-the-different-shape", BOUNCE, "Find the Different Shape 🧩"),
    (49, "songs/day-049-months-of-the-year-song", "output/day-049-final.mp4", "Months of the Year Song 🗓️"),
    (50, "morals/day-050-the-kind-little-rabbit", BOUNCE, "The Kind Little Rabbit 🐰"),
    (51, "numbers/day-051-count-the-butterflies", BOUNCE, "Count the Butterflies 🦋"),
    (52, "words/day-052-toys-english-french", BOUNCE, "Toys in English and French 🧸"),
    (53, "animals/day-053-max-the-dog-saves-the-day", BOUNCE, "Max the Dog Saves the Day 🐶"),
    (54, "science/day-054-how-does-snow-form", BOUNCE, "How Does Snow Form? ❄️"),
    (55, "puzzles/day-055-find-the-different-number", BOUNCE, "Find the Different Number 🔢"),
    (56, "songs/day-056-four-seasons-song", "output/day-056-final.mp4", "Four Seasons Song 🌸☀️🍂❄️"),
    (57, "stories/day-057-leo-learns-why-we-must-listen", BOUNCE, "Leo Learns Why We Must Listen 👂"),
    (58, "numbers/day-058-counting-cars", BOUNCE, "Counting Cars 🚗"),
    (59, "words/day-059-clothes-english-french", BOUNCE, "Clothes in English and French 👕"),
    (60, "animals/day-060-luna-the-cat-and-the-missing-ball", BOUNCE, "Luna the Cat and the Missing Ball 🐱"),
    (61, "science/day-061-how-do-rainbows-appear", BOUNCE, "How Do Rainbows Appear? 🌈"),
    (80, None, f"{M}/output/day-080-16x9.mp4", "Wild Animals in English and French 🐯"),
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
        f"{M}/output/tiny-sparks-marathon-06.mp4"]
with open(f"{M}/cmd.json", "w", encoding="utf-8") as fh:
    json.dump(cmd, fh, ensure_ascii=False)
