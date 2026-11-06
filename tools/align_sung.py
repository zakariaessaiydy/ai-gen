#!/usr/bin/env python3
"""
align_sung.py — align an ACE-Step take in the order it was ACTUALLY SUNG, then emit one video variant per take.

align_song.py assumes the take follows song.json's form. On long songs (5–6 min, 60+ lines) ACE-Step often
doesn't: it skips verses, repeats a chorus or the actions, reorders sections, adds "ooh" bars. An ordered alignment
then squeezes the skipped lines into a second and puts the lyric bar out of sync for minutes. This tool doesn't
force the form:
  1. whisper transcript (cached by align_song: ace/<take>.<model>.words.json), number words split
     ('sixtyone' / '61' → 'sixty one') so counting songs match;
  2. a DP tiles the transcript with SECTION INSTANCES: any section of song.json, any order, repeats allowed,
     unexplained words ("ooh", riffs) skipped at a small cost;
  3. each instance keeps only the lines that were really sung (≥ 1 recognised word); the rest are dropped.
Writes, per take ranked by score (A = best): remotion/src/shots/kids-songs-NNN/song.<L>.gen.ts with SONG (sung order),
SONG_FORM (section + which of its lines were sung, in order), SONG_BEAT, SONG_DURATION; <song>/song-<L>.mp3 (intro cut:
first word at 0.25 s); and <song>/ace/align.json "_sung". The composition reads SONG_FORM (lib/kids/song-show.tsx).

Usage:  python tools/align_sung.py kids-shorts/tiny-sparks/songs/day-063-numbers-1-100-song [--model small.en]
"""
import argparse
import glob
import json
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import write_json  # noqa: E402
from song_to_ace import lyric_lines  # noqa: E402
from align_song import _sim, duration_of, norm as norm1, transcribe  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen " \
       "seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()
JOINED = re.compile(r"^(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(one|two|three|four|five|six|seven|eight|nine)$")


def num_words(n):
    if n < 20:
        return [ONES[n]]
    if n < 100:
        return [TENS[n // 10]] + ([ONES[n % 10]] if n % 10 else [])
    if n < 1000:
        return [ONES[n // 100], "hundred"] + (num_words(n % 100) if n % 100 else [])
    return [str(n)]


def expand(tok):
    """one recognised/lyric token -> normalised word(s): '61' / 'sixtyone' -> ['sixty', 'one']"""
    w = re.sub(r"[^a-z0-9]", "", tok.lower())
    if not w:
        return []
    if w.isdigit():
        return num_words(int(w))
    m = JOINED.match(w)
    if m:
        return [m.group(1), m.group(2)]
    return [norm1(w)]


def sections_of(song):
    out = {}
    for name, sec in song["sections"].items():
        lines = lyric_lines(sec.get("lyrics", ""))
        if not lines:
            continue
        words = []  # (slot, original word, normalised)
        for slot, l in enumerate(lines):
            for w in l.split():
                for k, x in enumerate(expand(w)):
                    words.append((slot, w if k == 0 else "", x))
        out[name] = {"lines": lines, "words": words}
    return out


SKIP_E, SKIP_R, SKIP_FREE = -0.4, -0.3, -0.08


def fit(E, R):
    """E (lyric words) aligned to a prefix of R starting at R[0]; returns (last row scores, back matrix)."""
    n, m = len(E), len(R)
    NEG = -1e9
    prev = [0.0] + [NEG] * m          # must start at R[0]: no free leading skips of R
    back = []
    for i in range(1, n + 1):
        cur = [i * SKIP_E] + [NEG] * m
        bk = [1] + [0] * m
        for j in range(1, m + 1):
            best, op = cur[j - 1] + SKIP_R, 2
            s = _sim(E[i - 1], R[j - 1])
            if s > 0 and prev[j - 1] + s > best:
                best, op = prev[j - 1] + s, 0
            if prev[j] + SKIP_E > best:
                best, op = prev[j] + SKIP_E, 1
            cur[j], bk[j] = best, op
        back.append(bk)
        prev = cur
    return prev, back


def trace(back, n, e):
    pairs = {}
    i, j = n, e
    while i > 0 and j > 0:
        op = back[i - 1][j]
        if op == 0:
            pairs[i - 1] = j - 1
            i, j = i - 1, j - 1
        elif op == 1:
            i -= 1
        else:
            j -= 1
    return pairs


def tile(secs, R):
    """best tiling of the transcript R (list of words) with section instances"""
    M = len(R)
    best = [-1e18] * (M + 1)
    best[0] = 0.0
    back = [None] * (M + 1)
    starts = {name: {w[2] for w in s["words"][:4]} for name, s in secs.items()}
    for j in range(M):
        if best[j] < -1e17:
            continue
        if best[j] + SKIP_FREE > best[j + 1]:
            best[j + 1], back[j + 1] = best[j] + SKIP_FREE, None
        for name, s in secs.items():
            if R[j] not in starts[name]:
                continue
            E = [w[2] for w in s["words"]]
            W = min(M - j, int(len(E) * 1.6) + 6)
            row, _ = fit(E, R[j:j + W])
            need = max(3.0, 0.5 * len(E))
            for e in range(1, W + 1):
                if row[e] >= need * 0.7 and best[j] + row[e] > best[j + e]:
                    best[j + e], back[j + e] = best[j] + row[e], (j, name)
    # traceback
    inst, j = [], M
    while j > 0:
        b = back[j]
        if b is None:
            j -= 1
            continue
        j0, name = b
        inst.append((name, j0, j))
        j = j0
    return inst[::-1]


def lay_out(secs, inst, rec):
    """instances -> sung lines [(name, slot, text, [(w, s, e)])] with word times"""
    R = [r[0] for r in rec]
    out = []
    for name, j0, j1 in inst:
        s = secs[name]
        E = [w[2] for w in s["words"]]
        row, back = fit(E, R[j0:j1])
        pairs = trace(back, len(E), j1 - j0)
        n = len(E)
        t = [None] * n
        for i, jj in pairs.items():
            t[i] = (rec[j0 + jj][1], rec[j0 + jj][2])
        anchors = [i for i in range(n) if t[i]]
        if not anchors:
            continue
        lens = [max(1, len(x)) for x in E]

        def fill(i0, i1, a, b):
            if i1 <= i0:
                return
            span = max(0.08 * (i1 - i0), b - a)
            tot = sum(lens[i0:i1])
            c = a
            for i in range(i0, i1):
                d = span * lens[i] / tot
                t[i] = (c, c + d)
                c += d
        f0, l0 = anchors[0], anchors[-1]
        fill(0, f0, t[f0][0] - 0.32 * f0, t[f0][0])
        for a, b in zip(anchors, anchors[1:]):
            fill(a + 1, b, t[a][1], t[b][0])
        fill(l0 + 1, n, t[l0][1], t[l0][1] + 0.32 * (n - l0 - 1))
        sung = {s["words"][i][0] for i in anchors}
        for slot, text in enumerate(s["lines"]):
            if slot not in sung:
                continue
            idx = [i for i, w in enumerate(s["words"]) if w[0] == slot]
            words = []
            for i in idx:  # merge split numbers back onto the lyric word ('sixty one' stays two lyric words already)
                ow = s["words"][i][1]
                if ow:
                    words.append([ow, t[i][0], t[i][1]])
                else:
                    words[-1][2] = t[i][1]
            out.append((name, slot, text, words))
    # monotonic, sane
    flat = [w for l in out for w in l[3]]
    for i in range(1, len(flat)):
        if flat[i][1] < flat[i - 1][1] + 0.02:
            flat[i][1] = flat[i - 1][1] + 0.02
        flat[i][2] = max(flat[i][2], flat[i][1] + 0.08)
    for i in range(len(flat) - 1):
        flat[i][2] = min(flat[i][2], max(flat[i + 1][1], flat[i][1] + 0.08))
    return out


def emit(path, lines, bpm, duration, singer, take, lead):
    esc = lambda x: x.replace("\\", "\\\\").replace('"', '\\"')
    form = []
    for name, slot, _, _ in lines:
        if form and form[-1][0] == name and slot > form[-1][1][-1]:
            form[-1][1].append(slot)
        else:
            form.append([name, [slot]])
    o = [f"// AUTO-GENERATED by tools/align_sung.py from {take} — do not edit. SUNG ORDER: lines as the take sings them.",
         "import type { VoLine } from '../../lib/shorts';", "",
         f"export const SONG_BPM = {bpm};", f"export const SONG_BEAT = {60.0 / bpm:.5f};",
         f"export const SONG_DURATION = {duration:.2f};",
         "export const SONG_FORM: [string, number[]][] = " + json.dumps(form) + ";", "", "export const SONG: VoLine[] = ["]
    for name, slot, text, ws in lines:
        wj = ", ".join(f'{{ w: "{esc(w)}", start: {s - lead:.3f}, end: {e - lead:.3f} }}' for w, s, e in ws)
        o.append(f'  {{ speaker: "{singer}", text: "{esc(text)}", start: {ws[0][1] - lead:.3f}, end: {ws[-1][2] - lead:.3f}, words: [{wj}] }},')
    o.append("];\n")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w", encoding="utf-8").write("\n".join(o))
    return form


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("song_dir")
    ap.add_argument("--model", default="small.en")
    ap.add_argument("--shot", help="default remotion/src/shots/kids-songs-NNN")
    args = ap.parse_args()
    d = os.path.abspath(args.song_dir)
    song = json.load(open(os.path.join(d, "song.json"), encoding="utf-8"))
    secs = sections_of(song)
    prompt = " ".join(l for n in song["form"] for l in lyric_lines(song["sections"][n].get("lyrics", "")))
    takes = sorted(glob.glob(os.path.join(d, "ace", "*.wav")))
    m = re.search(r"day-(\d+)", os.path.basename(d))
    shot = args.shot or os.path.join(ROOT, "remotion", "src", "shots", f"kids-songs-{m.group(1)}")
    results = []
    for tp in takes:
        total = duration_of(tp)
        raw = transcribe(tp, args.model, prompt)
        rec = []
        for w, a, b in raw:  # split number tokens, sharing the span
            xs = expand(w)
            for k, x in enumerate(xs):
                rec.append((x, a + (b - a) * k / len(xs), a + (b - a) * (k + 1) / len(xs)))
        inst = tile(secs, [r[0] for r in rec])
        lines = lay_out(secs, inst, rec)
        sung_words = sum(len(l[3]) for l in lines)
        lyric_words = sum(len(l.split()) for n in song["form"] for l in lyric_lines(song["sections"][n].get("lyrics", "")))
        covered = sum(1 for _ in rec)
        score = sung_words / max(1, lyric_words)
        results.append((score, tp, lines, total))
        print(f"{os.path.basename(tp)}: {len(inst)} sections sung, {len(lines)} lines, {sung_words}/{lyric_words} lyric words "
              f"({score:.0%} of song.json; {covered} recognised)", flush=True)
        print("   " + " · ".join(n for n, _, _ in inst), flush=True)
    results.sort(key=lambda r: -r[0])
    alp = os.path.join(d, "ace", "align.json")
    report = json.load(open(alp, encoding="utf-8")) if os.path.exists(alp) else {}
    report["_sung"] = {}
    for k, (score, tp, lines, total) in enumerate(results):
        L = "ABCDEFGH"[k]
        first = lines[0][3][0][1]
        lead = round(first - 0.25, 3) if first > 0.6 else 0.0
        take_rel = os.path.relpath(tp, ROOT).replace("\\", "/")
        form = emit(os.path.join(shot, f"song.{L}.gen.ts"), lines, int(song["bpm"]), total - lead, song.get("singer", "mila"), take_rel, lead)
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{lead:.3f}", "-i", tp,
                        "-af", "afade=t=in:d=0.12" if lead else "anull", "-codec:a", "libmp3lame", "-b:a", "192k",
                        os.path.join(d, f"song-{L}.mp3")], check=True)
        report["_sung"][L] = {"take": os.path.basename(tp), "score": round(score, 3), "intro_cut": lead,
                              "duration": round(total - lead, 2), "form": [f[0] for f in form]}
        print(f"variant {L}: {os.path.basename(tp)} ({score:.0%}) {total - lead:.2f}s -> song.{L}.gen.ts + song-{L}.mp3")
    write_json(alp, report, indent=1)


if __name__ == "__main__":
    main()
