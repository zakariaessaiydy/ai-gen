#!/usr/bin/env bash
# Builds Tiny Sparks Marathon #8 (Days 62, 65, 66, 68, ~23 min, 1080p). Run from the REPO ROOT:
#   bash kids-shorts/tiny-sparks/compilations/marathon-08/build.sh
# Episodes whose output already exists are skipped (build_short.py also caches voice + render), so a rerun is cheap.
# Needs: python 3.10+, ffmpeg/ffprobe, node 22/npm, `python tools/setup_kokoro.py --full`, `cd remotion && npm install`.
set -euo pipefail
export PYTHONUTF8=1
K=kids-shorts/tiny-sparks
M=$K/compilations/marathon-08
C=${CONCURRENCY:-4}   # parallel Chrome tabs per render; lower = less RAM
mkdir -p "$M/output"

# 1. the four long episodes: voice -> render -> mux -> sfx -> music bed
for ep in puzzles/day-062-find-the-hidden-star numbers/day-065-count-the-stars \
          words/day-066-body-parts-english-french science/day-068-what-is-lightning; do
  d=$(basename "$ep" | cut -d- -f2)
  [ -f "$K/$ep/output/day-$d-sfx-tiny-sparks-bounce.mp4" ] && continue
  python tools/build_short.py "$K/$ep" --engine kokoro --concurrency=$C
done

# 2. the marathon intro: render + the channel jingle + the theme bed
(cd remotion && node scripts/gen-registry.mjs && node scripts/render-all.mjs KidsMarathonIntro08 --scale=1)
ffmpeg -v error -y -i remotion/out/KidsMarathonIntro08.mp4 -i media/library/sfx/clips/tiny-sparks-jingle.mp3 -i media/library/music/clips/tiny-sparks-bounce.mp3 \
  -filter_complex "[1:a]volume=-2dB[j];[2:a]atrim=0:5.3,adelay=3700|3700,volume=-8dB,afade=t=out:st=7.8:d=1.2[b];[j][b]amix=inputs=2:normalize=0,apad,atrim=0:9[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k "$M/output/intro.mp4"

# 3. plan.json + chapters.txt + cmd.json from the real durations, then join everything
python "$M/assemble.py"
python -c "import json,subprocess;subprocess.run(json.load(open('$M/cmd.json',encoding='utf-8')),check=True)"
echo "DONE -> $M/output/tiny-sparks-marathon-08.mp4"

# 4. each episode on its own, with its own intro -> $M/output/singles/ (add --send for copies under 30 MB)
python tools/kids_singles.py "$M"
