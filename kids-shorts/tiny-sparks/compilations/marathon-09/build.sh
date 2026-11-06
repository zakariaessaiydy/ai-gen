#!/usr/bin/env bash
# Builds Tiny Sparks Marathon #9 (Days 69, 72, 73, 74, ~21 min, 1080p). Run from the REPO ROOT:
#   bash kids-shorts/tiny-sparks/compilations/marathon-09/build.sh
# Episodes whose output already exists are skipped (build_short.py also caches voice + render), so a rerun is cheap.
# Needs: python 3.10+, ffmpeg/ffprobe, node 22/npm, `python tools/setup_kokoro.py --full`, `cd remotion && npm install`.
set -euo pipefail
export PYTHONUTF8=1
K=kids-shorts/tiny-sparks
M=$K/compilations/marathon-09
C=${CONCURRENCY:-4}   # parallel Chrome tabs per render; lower = less RAM
mkdir -p "$M/output"

# 1. the four long episodes: voice -> render -> mux -> sfx -> music bed
for ep in puzzles/day-069-find-the-hidden-heart numbers/day-072-learn-number-1 \
          words/day-073-farm-animals-english-french animals/day-074-the-lion-and-the-little-mouse; do
  d=$(basename "$ep" | cut -d- -f2)
  [ -f "$K/$ep/output/day-$d-sfx-tiny-sparks-bounce.mp4" ] && continue
  python tools/build_short.py "$K/$ep" --engine kokoro --concurrency=$C
done

# 2. the marathon intro: render + the channel jingle + the theme bed
(cd remotion && node scripts/gen-registry.mjs && node scripts/render-all.mjs KidsMarathonIntro09 --scale=1)
ffmpeg -v error -y -i remotion/out/KidsMarathonIntro09.mp4 -i media/library/sfx/clips/tiny-sparks-jingle.mp3 -i media/library/music/clips/tiny-sparks-bounce.mp3 \
  -filter_complex "[1:a]volume=-2dB[j];[2:a]atrim=0:5.3,adelay=3700|3700,volume=-8dB,afade=t=out:st=7.8:d=1.2[b];[j][b]amix=inputs=2:normalize=0,apad,atrim=0:9[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k "$M/output/intro.mp4"

# 3. plan.json + chapters.txt + cmd.json from the real durations, then join everything
python "$M/assemble.py"
python -c "import json,subprocess;subprocess.run(json.load(open('$M/cmd.json',encoding='utf-8')),check=True)"
echo "DONE -> $M/output/tiny-sparks-marathon-09.mp4"
