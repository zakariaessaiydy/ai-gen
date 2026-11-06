#!/usr/bin/env bash
# Builds Tiny Sparks Marathon #4 (Days 54-57, ~21 min, 1080p) from scratch. Run from the REPO ROOT:
#   bash kids-shorts/tiny-sparks/compilations/marathon-04/build.sh
# Needs: python 3.10+, ffmpeg/ffprobe, node/npm, `pip install -r requirements-optional.txt`,
# `python tools/setup_kokoro.py --full`, `cd remotion && npm install`.
set -euo pipefail
K=kids-shorts/tiny-sparks
M=$K/compilations/marathon-04
# 1-3. the spoken episodes: voice -> render -> mux -> sfx -> music bed
for ep in science/day-054-how-does-snow-form puzzles/day-055-find-the-different-number stories/day-057-leo-learns-why-we-must-listen; do
  python tools/build_short.py "$K/$ep" --engine kokoro
done
# 4. the song: render, the song under it after the 3.7 s ident, the SFX
S=$K/songs/day-056-four-seasons-song
(cd remotion && node scripts/gen-registry.mjs && node scripts/render-all.mjs KidsSongs056 --scale=1)
ffmpeg -v error -y -i remotion/out/KidsSongs056.mp4 -i "$S/song.mp3" -filter_complex "[1:a]adelay=3700|3700,apad[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -t 312.1 remotion/out/KidsSongs056-voiced.mp4
mkdir -p "$S/output"
python tools/mix_sfx.py "$S/sfx-plan.json"
mv "$S/output/day-056-sfx.mp4" "$S/output/day-056-final.mp4"
# 5. the marathon intro: render + the channel jingle + the theme bed
(cd remotion && node scripts/render-all.mjs KidsMarathonIntro04 --scale=1)
mkdir -p "$M/output"
ffmpeg -v error -y -i remotion/out/KidsMarathonIntro04.mp4 -i media/library/sfx/clips/tiny-sparks-jingle.mp3 -i media/library/music/clips/tiny-sparks-bounce.mp3 \
  -filter_complex "[1:a]volume=-2dB[j];[2:a]atrim=0:5.3,adelay=3700|3700,volume=-8dB,afade=t=out:st=7.8:d=1.2[b];[j][b]amix=inputs=2:normalize=0,apad,atrim=0:9[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k "$M/output/intro.mp4"
# 6. join everything (the exact ffmpeg command is stored in cmd.json)
python -c "import json,subprocess;subprocess.run(json.load(open('$M/cmd.json')),check=True)"
echo "DONE -> $M/output/tiny-sparks-marathon-04.mp4"
