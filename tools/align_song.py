#!/usr/bin/env python3
"""
align_song.py — make an ACE-Step take usable by the song videos: find WHEN each lyric word is sung,
keep the best take, and write the same song.gen.ts gen_song.py writes (SONG lines + word times,
SONG_BEAT, SONG_DURATION), so <SingAlong>, lipSync and every cue in the composition follow the real vocal.

How: faster-whisper (free, local, CPU) transcribes the take with word timestamps; the KNOWN lyrics
(song.json, the exact lines the composition indexes) are aligned to the recognised words with a
sequence match; words whisper missed are interpolated between their matched neighbours. The share of
lyric words that matched = the take's score; the best-scoring take wins.

Usage (after unzipping the Kaggle ace_songs.zip at the repo root):
  python tools/align_song.py kids-shorts/tiny-sparks/songs/day-028-colors-song
  python tools/align_song.py <song dir> --model medium.en      # slower, better on busy mixes
  python tools/align_song.py <song dir> --take ace/sunshine-seed46.wav   # force a take

Writes: remotion/src/shots/kids-songs-NNN/song.gen.ts · <song dir>/song.mp3 (the winning take; the old
chanted track is kept once as song-chant.mp3) · <song dir>/ace/align.json (scores + per-word matches).
Needs: pip install faster-whisper (first run downloads the whisper model, ~250 MB for small.en).
"""
import argparse
import difflib
import glob
import json
import os
import re
import shutil
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import write_json  # noqa: E402
from song_to_ace import lyric_lines  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


_ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen "         "seventeen eighteen nineteen".split()
_TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def _num_word(n):
    if n < 20:
        return _ONES[n]
    if n < 100:
        return _TENS[n // 10] + ("" if n % 10 == 0 else _ONES[n % 10])
    return str(n)


def norm(w):
    """Spelling-agnostic word key: lowercase letters/digits, digits -> words ('7' == 'seven'), UK -> US ('colour')."""
    w = re.sub(r"[^a-z0-9]", "", w.lower())
    if w.isdigit() and int(w) < 100:
        w = _num_word(int(w))
    return w.replace("colour", "color").replace("favourite", "favorite")


def expected_words(song):
    """[(line_index, word_text)] in sung order + the line texts — identical to gen_song's lines."""
    lines = [l for n in song["form"] for l in lyric_lines(song["sections"][n].get("lyrics", ""))]
    words = [(li, w) for li, l in enumerate(lines) for w in l.split()]
    return lines, words


def load_16k(path):
    """Decode with ffmpeg (not PyAV: its API drifts between versions) -> mono float32 @ 16 kHz."""
    import numpy as np
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def transcribe(path, model, prompt):
    cache = os.path.splitext(path)[0] + f".{model}.words.json"   # whisper on CPU is minutes; re-aligning is free
    if os.path.exists(cache) and os.path.getmtime(cache) >= os.path.getmtime(path):
        out = [tuple(x) for x in json.load(open(cache, encoding="utf-8"))]
    else:
        out = _transcribe(path, model, prompt)
        json.dump(out, open(cache, "w", encoding="utf-8"))
    # whisper stretches a segment's FIRST word back over the instrumental before it ('one' 0.0-11.0 s): no sung
    # word lasts > 1 s here, so pin its start to its end
    out = [(w, max(a, b - 1.0), b) for w, a, b in out]
    # ... or "hears" a lone word in the intro ('one' at 0.0, then nothing until 11 s): drop 1-2 leading words cut
    # off from the rest by > 4 s; the real line gets interpolated before its first true anchor
    while len(out) > 3 and out[1][1] - out[0][2] > 4.0:
        out = out[1:]
    if len(out) > 3 and out[2][1] - out[1][2] > 4.0:
        out = out[2:]
    return out


def _transcribe(path, model, prompt):
    from faster_whisper import WhisperModel
    m = WhisperModel(model, device="cpu", compute_type="int8")
    segs, _ = m.transcribe(load_16k(path), language="en", word_timestamps=True, beam_size=5,
                           condition_on_previous_text=False,  # singing repeats: avoid hallucinated loops
                           initial_prompt=prompt[:220])
    out = []
    for s in segs:
        for w in s.words or []:
            if norm(w.word):
                out.append((norm(w.word), float(w.start), float(w.end)))
    return out


def _sim(e, r):
    if e == r:
        return 1.0
    if min(len(e), len(r)) >= 3 and difflib.SequenceMatcher(None, e, r).ratio() >= 0.75:
        return 0.6
    return 0.0


def align(exp, rec, total):
    """Map every expected word to (start, end). Returns times, matched-count.

    Global ORDERED alignment (Needleman-Wunsch): lyric words pair with recognised words in order; either side may
    skip. A sung take repeats and reorders lines (the AI riffs on a chorus, sings a question twice), so a greedy
    longest-block match can pin chorus #3 onto chorus #4; the DP cannot — pairs never cross."""
    E = [norm(w) for _, w in exp]
    R = [r[0] for r in rec]
    n, m = len(E), len(R)
    SKIP_E = -0.25                         # unsung lyric word costs more than an extra sung word (AI repeats)
    # skipping recognised words is cheap BETWEEN lines (the AI repeats a whole chorus) but costly INSIDE a line,
    # so a line's words pair with ONE contiguous sung copy instead of straddling two repeats
    line_of = [li for li, _ in exp]
    skip_r = [-0.02 if i == 0 or i == n or line_of[i - 1] != line_of[i] else -0.35 for i in range(n + 1)]
    NEG = -1e9
    prev = [j * skip_r[0] for j in range(m + 1)]
    back = []                              # back[i-1][j]: 0 = pair, 1 = skip E, 2 = skip R
    for i in range(1, n + 1):
        cur = [i * SKIP_E] + [NEG] * m
        bk = [1] + [0] * m
        ei = E[i - 1]
        for j in range(1, m + 1):
            # a word whisper heard twice in a row ('rain rain') is free to skip
            sr = 0.0 if j >= 2 and R[j - 1] == R[j - 2] else skip_r[i]
            # ties -> skip the LATER recognised word (traceback runs from the end), i.e. the EARLIEST sung copy of
            # a repeated chorus wins, so the lyric bar never waits on a line the AI already sang
            best, op = cur[j - 1] + sr, 2
            s = _sim(ei, R[j - 1])
            if s > 0 and prev[j - 1] + s > best + 1e-9:
                best, op = prev[j - 1] + s, 0
            v = prev[j] + SKIP_E
            if v > best + 1e-9:
                best, op = v, 1
            cur[j], bk[j] = best, op
        back.append(bk)
        prev = cur
    t = [None] * n
    i, j = n, m
    while i > 0 and j > 0:
        op = back[i - 1][j]
        if op == 0:
            t[i - 1] = (rec[j - 1][1], rec[j - 1][2])
            i, j = i - 1, j - 1
        elif op == 1:
            i -= 1
        else:
            j -= 1
    matched = sum(x is not None for x in t)
    # interpolate the gaps by character length between matched anchors
    anchors = [i for i, x in enumerate(t) if x is not None]
    if not anchors:
        raise SystemExit("no lyric word recognised in this take")
    lens = [max(1, len(e)) for e in E]
    def fill(i0, i1, a, b):  # words i0..i1-1 share the span a..b
        if i1 <= i0:
            return
        span = max(0.05 * (i1 - i0), b - a)
        tot = sum(lens[i0:i1])
        cur = a
        for i in range(i0, i1):
            d = span * lens[i] / tot
            t[i] = (cur, cur + d)
            cur += d
    first, last = anchors[0], anchors[-1]
    fill(0, first, max(0.0, t[first][0] - 0.45 * first), t[first][0])
    for a, b in zip(anchors, anchors[1:]):
        fill(a + 1, b, t[a][1], t[b][0])
    fill(last + 1, len(E), t[last][1], min(total, t[last][1] + 0.45 * (len(E) - last - 1)))
    # monotonic + sane ends (a word ends where the next starts if whisper ran long)
    for i in range(1, len(t)):
        if t[i][0] < t[i - 1][0]:
            t[i] = (t[i - 1][0] + 0.02, max(t[i][1], t[i - 1][0] + 0.1))
    for i in range(len(t) - 1):
        s, e = t[i]
        t[i] = (s, min(max(e, s + 0.08), max(t[i + 1][0], s + 0.08)))
    return t, matched


def emit_ts(path, lines, exp, times, bpm, duration, singer, take):
    by_line = {}
    for (li, w), (s, e) in zip(exp, times):
        by_line.setdefault(li, []).append((w, s, e))
    esc = lambda x: x.replace("\\", "\\\\").replace('"', '\\"')
    out = [f"// AUTO-GENERATED by tools/align_song.py from {take} — do not edit. Word times = the sung vocal.",
           "import type { VoLine } from '../../lib/shorts';", "",
           f"export const SONG_BPM = {bpm};", f"export const SONG_BEAT = {60.0 / bpm:.5f};",
           f"export const SONG_DURATION = {duration:.2f};", "", "export const SONG: VoLine[] = ["]
    for li, text in enumerate(lines):
        ws = by_line[li]
        wj = ", ".join(f'{{ w: "{esc(w)}", start: {s:.3f}, end: {e:.3f} }}' for w, s, e in ws)
        out.append(f'  {{ speaker: "{singer}", text: "{esc(text)}", start: {ws[0][1]:.3f}, end: {ws[-1][2]:.3f}, words: [{wj}] }},')
    out.append("];\n")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w", encoding="utf-8").write("\n".join(out))


def duration_of(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                       capture_output=True, text=True)
    return float(r.stdout.strip())


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("song_dir")
    ap.add_argument("--take", help="force one take (path relative to the song dir or absolute)")
    ap.add_argument("--model", default="small.en", help="whisper model: small.en (default) · medium.en · large-v3")
    ap.add_argument("--no-trim", action="store_true", help="keep ACE-Step's instrumental intro (default: cut it)")
    ap.add_argument("--shot", help="override the shot folder (default remotion/src/shots/kids-songs-NNN)")
    args = ap.parse_args()

    d = os.path.abspath(args.song_dir)
    song = json.load(open(os.path.join(d, "song.json"), encoding="utf-8"))
    lines, exp = expected_words(song)
    prompt = " ".join(lines)
    takes = [os.path.join(d, args.take) if args.take and not os.path.isabs(args.take) else args.take] if args.take \
        else sorted(glob.glob(os.path.join(d, "ace", "*.wav")))
    if not takes:
        sys.exit(f"no takes in {os.path.join(d, 'ace')} — unzip the Kaggle ace_songs.zip at the repo root first")

    report, best = {}, None
    for tp in takes:
        total = duration_of(tp)
        print(f"transcribing {os.path.basename(tp)} ({total:.0f}s, whisper {args.model}) ...", flush=True)
        rec = transcribe(tp, args.model, prompt)
        times, matched = align(exp, rec, total)
        score = matched / len(exp)
        report[os.path.basename(tp)] = {"score": round(score, 3), "matched": matched, "words": len(exp),
                                        "recognised": len(rec), "duration": round(total, 2)}
        print(f"  score {score:.0%} ({matched}/{len(exp)} lyric words matched)", flush=True)
        if best is None or score > best[0]:
            best = (score, tp, times, total)

    score, tp, times, total = best
    # THE FIRST 10 SECONDS rule: the hook must be sung at <= 0.5 s. ACE-Step usually plays an instrumental intro
    # (10-15 s) -> cut it: the audio starts 0.25 s before the first sung word (the band is already playing).
    lead = 0.0
    if not args.no_trim and times[0][0] > 0.6:
        lead = round(times[0][0] - 0.25, 3)
        times = [(s - lead, e - lead) for s, e in times]
        total -= lead
        print(f"  cut the {lead:.2f}s instrumental intro: first word now at 0.25 s")
    m = re.search(r"day-(\d+)", os.path.basename(d))
    shot = args.shot or os.path.join(ROOT, "remotion", "src", "shots", f"kids-songs-{m.group(1)}")
    ts = os.path.join(shot, "song.gen.ts")
    take_rel = os.path.relpath(tp, ROOT).replace("\\", "/")
    emit_ts(ts, lines, exp, times, int(song["bpm"]), total, song.get("singer", "mila"), take_rel)
    mp3 = os.path.join(d, "song.mp3")
    if os.path.exists(mp3) and not os.path.exists(os.path.join(d, "song-chant.mp3")):
        shutil.copyfile(mp3, os.path.join(d, "song-chant.mp3"))
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{lead:.3f}", "-i", tp,
                    "-af", "afade=t=in:d=0.12" if lead else "anull", "-codec:a", "libmp3lame", "-b:a", "192k", mp3],
                   check=True)
    report["_winner"] = os.path.basename(tp)
    report["_intro_cut"] = lead
    write_json(os.path.join(d, "ace", "align.json"), report, indent=1)
    print(f"\nwinner {os.path.basename(tp)} ({score:.0%}) -> {os.path.relpath(ts, ROOT)} + {os.path.relpath(mp3, ROOT)}"
          f"\nset the composition's durationInSeconds to {total:.2f} (SONG_DURATION) if it is fixed.")
    if score < 0.6:
        print("WARNING: under 60 % of the lyrics matched — the take may have skipped/garbled lines. "
              "Listen, or re-run with --model medium.en.")


if __name__ == "__main__":
    main()
