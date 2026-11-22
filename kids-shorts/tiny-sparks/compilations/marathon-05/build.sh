#!/usr/bin/env bash
# Builds Tiny Sparks Marathon #5 (Days 58-61, ~21 min, 1080p) from scratch. Run from the REPO ROOT:
#   bash kids-shorts/tiny-sparks/compilations/marathon-05/build.sh
# Needs: python 3.10+, ffmpeg/ffprobe, node/npm, `pip install -r requirements-optional.txt`,
# `python tools/setup_kokoro.py --full`, `cd remotion && npm install`.
set -euo pipefail
K=kids-shorts/tiny-sparks
M=$K/compilations/marathon-05
# 1-4. the four spoken episodes: voice -> render -> mux -> sfx -> music bed
for ep in numbers/day-058-counting-cars words/day-059-clothes-english-french animals/day-060-luna-the-cat-and-the-missing-ball science/day-061-how-do-rainbows-appear; do
  python tools/build_short.py "$K/$ep" --engine kokoro
done
# 5. the marathon intro: render + the channel jingle + the theme bed
(cd remotion && node scripts/gen-registry.mjs && node scripts/render-all.mjs KidsMarathonIntro05 --scale=1)
mkdir -p "$M/output"
ffmpeg -v error -y -i remotion/out/KidsMarathonIntro05.mp4 -i media/library/sfx/clips/tiny-sparks-jingle.mp3 -i media/library/music/clips/tiny-sparks-bounce.mp3 \
  -filter_complex "[1:a]volume=-2dB[j];[2:a]atrim=0:5.3,adelay=3700|3700,volume=-8dB,afade=t=out:st=7.8:d=1.2[b];[j][b]amix=inputs=2:normalize=0,apad,atrim=0:9[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k "$M/output/intro.mp4"
# 6. join everything (the exact ffmpeg command is stored in cmd.json)
python -c "import json,subprocess;subprocess.run(json.load(open('$M/cmd.json')),check=True)"
echo "DONE -> $M/output/tiny-sparks-marathon-05.mp4"
