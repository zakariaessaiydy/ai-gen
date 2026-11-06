#!/usr/bin/env bash
# Builds Tiny Sparks Marathon #6 (Days 46-61 + Day 80, ~90 min, 1080p) — a REBUILD: every episode is built by its
# existing sources (the same steps as marathons #2-#5), nothing is re-authored. Run from the REPO ROOT:
#   bash kids-shorts/tiny-sparks/compilations/marathon-06/build.sh
# Episodes whose output already exists are skipped (build_short.py also caches voice + render), so a rerun is cheap.
# Needs: python 3.10+, ffmpeg/ffprobe, node/npm, `python tools/setup_kokoro.py --full`, `cd remotion && npm install`.
set -euo pipefail
export PYTHONUTF8=1
K=kids-shorts/tiny-sparks
M=$K/compilations/marathon-06
C=${CONCURRENCY:-4}   # parallel Chrome tabs per render; lower = less RAM
mkdir -p "$M/output"

# 1. the spoken long episodes: voice -> render -> mux -> sfx -> music bed
for ep in animals/day-046-coco-the-penguin-finds-a-friend science/day-047-how-does-rain-form \
          puzzles/day-048-find-the-different-shape morals/day-050-the-kind-little-rabbit \
          numbers/day-051-count-the-butterflies words/day-052-toys-english-french \
          animals/day-053-max-the-dog-saves-the-day science/day-054-how-does-snow-form \
          puzzles/day-055-find-the-different-number stories/day-057-leo-learns-why-we-must-listen \
          numbers/day-058-counting-cars words/day-059-clothes-english-french \
          animals/day-060-luna-the-cat-and-the-missing-ball science/day-061-how-do-rainbows-appear; do
  python tools/build_short.py "$K/$ep" --engine kokoro --concurrency=$C
done

# 2. the two songs: render + the song track + sfx (as marathon-02 / marathon-04 built them)
(cd remotion && node scripts/gen-registry.mjs)
# (Nov 2026: ACE-Step AI vocals — no ident, the song starts at 0, so song.mp3 is muxed as-is; no old SFX plan.)
song() {  # $1 = folder, $2 = comp, $3 = day
  local S=$K/songs/$1
  [ -f "$S/output/day-$3-final.mp4" ] && return
  (cd remotion && node scripts/render-all.mjs "$2" --scale=1 --concurrency=$C)
  mkdir -p "$S/output"
  ffmpeg -v error -y -i "remotion/out/$2.mp4" -i "$S/song.mp3" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k \
    -shortest "$S/output/day-$3-final.mp4"
}
song day-049-months-of-the-year-song KidsSongs049 049
song day-056-four-seasons-song KidsSongs056 056

# 3. Day 80 is a 9:16 Short: build it if missing, then pillarbox it into 16:9 over a blurred copy of itself
D80=$K/words/day-080-wild-animals-english-french
[ -f "$D80/output/day-080-final.mp4" ] || python tools/build_short.py "$D80" --engine kokoro --concurrency=$C
ffmpeg -v error -y -i "$D80/output/day-080-final.mp4" \
  -filter_complex "[0:v]split[a][b];[a]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=40:4,eq=brightness=-0.06[bg];[b]scale=-2:1080[fg];[bg][fg]overlay=(W-w)/2:0,format=yuv420p[v]" \
  -map "[v]" -map 0:a -c:v libx264 -preset medium -crf 18 -c:a aac -b:a 192k "$M/output/day-080-16x9.mp4"

# 4. the marathon intro: render + the channel jingle + the theme bed
(cd remotion && node scripts/render-all.mjs KidsMarathonIntro06 --scale=1)
ffmpeg -v error -y -i remotion/out/KidsMarathonIntro06.mp4 -i media/library/sfx/clips/tiny-sparks-jingle.mp3 -i media/library/music/clips/tiny-sparks-bounce.mp3 \
  -filter_complex "[1:a]volume=-2dB[j];[2:a]atrim=0:5.3,adelay=3700|3700,volume=-8dB,afade=t=out:st=7.8:d=1.2[b];[j][b]amix=inputs=2:normalize=0,apad,atrim=0:9[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k "$M/output/intro.mp4"

# 5. plan.json + chapters.txt + cmd.json from the real durations, then join everything
python "$M/assemble.py"
python -c "import json,subprocess;subprocess.run(json.load(open('$M/cmd.json')),check=True)"
echo "DONE -> $M/output/tiny-sparks-marathon-06.mp4"
