#!/usr/bin/env bash
# Builds Tiny Sparks Marathon #2 · Part 3 (Days 48-51, ~23.5 min, 1080p) from scratch. Run from the REPO ROOT:
#   bash kids-shorts/tiny-sparks/compilations/marathon-02/part3/build.sh
# Needs: python 3.10+, ffmpeg/ffprobe, node/npm, `python tools/setup_kokoro.py --full`, `cd remotion && npm install`.
# Renders write big temp files: if C: is short on space, export TEMP/TMP to a folder on a roomier drive first.
set -euo pipefail
K=kids-shorts/tiny-sparks
M=$K/compilations/marathon-02/part3

# 1. the three spoken episodes: voice -> render -> mux -> sfx -> music bed
for ep in puzzles/day-048-find-the-different-shape morals/day-050-the-kind-little-rabbit numbers/day-051-count-the-butterflies; do
  python tools/build_short.py "$K/$ep" --engine kokoro
done

# 2. the song episode: render, put the song under it (after the 3.7 s ident), add the SFX
S=$K/songs/day-049-months-of-the-year-song
(cd remotion && node scripts/gen-registry.mjs && node scripts/render-all.mjs KidsSongs049 --scale=1)
ffmpeg -v error -y -i remotion/out/KidsSongs049.mp4 -i "$S/song.mp3" \
  -filter_complex "[1:a]adelay=3700|3700,apad[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -t 346.6 \
  remotion/out/KidsSongs049-voiced.mp4
mkdir -p "$S/output"
python tools/mix_sfx.py "$S/sfx-plan.json"
cp "$S/output/day-049-sfx.mp4" "$S/output/day-049-final.mp4"

# 3. the Part 3 intro: render + the channel jingle + the theme bed
(cd remotion && node scripts/render-all.mjs KidsMarathonIntro02P3 --scale=1)
mkdir -p "$M/output"
ffmpeg -v error -y -i remotion/out/KidsMarathonIntro02P3.mp4 -i media/library/sfx/clips/tiny-sparks-jingle.mp3 \
  -i media/library/music/clips/tiny-sparks-bounce.mp3 \
  -filter_complex "[1:a]volume=-2dB[j];[2:a]atrim=0:5.3,adelay=3700|3700,volume=-8dB,afade=t=out:st=7.8:d=1.2[b];[j][b]amix=inputs=2:normalize=0,apad,atrim=0:9[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k "$M/output/intro.mp4"

# 4. join everything (the exact ffmpeg command is stored in cmd.json)
python -c "import json,subprocess;subprocess.run(json.load(open('$M/cmd.json',encoding='utf-8')),check=True)"
echo "DONE -> $M/output/tiny-sparks-marathon-02-part3.mp4"
