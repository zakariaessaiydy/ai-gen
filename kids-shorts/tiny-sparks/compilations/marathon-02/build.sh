#!/usr/bin/env bash
# Builds Tiny Sparks Marathon #2 (Days 46-49, ~21 min, 1080p) from scratch. Run from the REPO ROOT:
#   bash kids-shorts/tiny-sparks/compilations/marathon-02/build.sh
# Needs: python 3.10+, ffmpeg/ffprobe, node/npm, `pip install -r requirements-optional.txt`,
# `python tools/setup_kokoro.py --full`, `cd remotion && npm install`.
set -euo pipefail
K=kids-shorts/tiny-sparks
M=$K/compilations/marathon-02

# 1-3. the three spoken episodes: voice -> render -> mux -> sfx -> music bed
for ep in animals/day-046-coco-the-penguin-finds-a-friend science/day-047-how-does-rain-form puzzles/day-048-find-the-different-shape; do
  python tools/build_short.py "$K/$ep" --engine kokoro
done

# 4. the song episode: render, put the song under it (after the 3.7 s ident), add the SFX
S=$K/songs/day-049-months-of-the-year-song
(cd remotion && node scripts/gen-registry.mjs && node scripts/render-all.mjs KidsSongs049 --scale=1)
ffmpeg -v error -y -i remotion/out/KidsSongs049.mp4 -i "$S/song.mp3" \
  -filter_complex "[1:a]adelay=3700|3700,apad[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -t 346.6 \
  remotion/out/KidsSongs049-voiced.mp4
mkdir -p "$S/output"
python tools/mix_sfx.py "$S/sfx-plan.json"
cp "$S/output/day-049-sfx.mp4" "$S/output/day-049-final.mp4"

# 5. the marathon intro: render + the channel jingle + the theme bed
(cd remotion && node scripts/render-all.mjs KidsMarathonIntro02 --scale=1)
mkdir -p "$M/output"
ffmpeg -v error -y -i remotion/out/KidsMarathonIntro02.mp4 -i media/library/sfx/clips/tiny-sparks-jingle.mp3 \
  -i "media/library/music/$(python -c "import json;c=json.load(open('media/library/music/catalog.json'));it=c.get('tracks') or c.get('beds') or c.get('clips');print([x for x in it if x['id']=='tiny-sparks-bounce'][0]['file'])")" \
  -filter_complex "[1:a]volume=-2dB[j];[2:a]atrim=0:5.3,adelay=3700|3700,volume=-8dB,afade=t=out:st=7.8:d=1.2[b];[j][b]amix=inputs=2:normalize=0,apad,atrim=0:9[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k "$M/output/intro.mp4"

# 6. join everything (the exact ffmpeg command is stored in cmd.json)
python -c "import json,subprocess;subprocess.run(json.load(open('$M/cmd.json')),check=True)"
echo "DONE -> $M/output/tiny-sparks-marathon-02.mp4"
