#!/usr/bin/env python3
"""
gen_song.py — make an ORIGINAL kids song (or a public-domain nursery melody) for FREE, locally.

WHY: a kids channel lives on songs, and "free music" downloaded from the web is the #1 source of
Content-ID claims and demonetisation. A song we SYNTHESIZE from notes is 100% ours: no licence,
no attribution, no claim risk. Melodies written for the channel are original works; traditional
melodies (Twinkle Twinkle, Old MacDonald, Frère Jacques, Wheels on the Bus…) are public domain,
and OUR performance of them is ours too.

WHAT IT MAKES (from a song.json):
  <out>/instrumental.wav   ukulele strums + xylophone/music-box lead + bass + soft drums
  <out>/vocal.wav          (optional) the lyrics voiced with Kokoro, either
                             --vocal chant : each lyric line spoken on the beat, stretched to fit
                                             its bars (reliable, clear — the "chant/rap" style)
                             --vocal sing  : EXPERIMENTAL "toy singer": every syllable is pitch-
                                             shifted onto its melody note + stretched to the note
                                             length (rubberband). Cute/robotic — audition it.
  <out>/song.mp3           the mix (loudness-normalised for a song, ~-16 LUFS)
  <out>/bed.mp3            instrumental only, quieter (~-24 LUFS) — a background bed for videos
  <out>/beatmap.json       bars, beats, every note with its syllable + time (for animation)
  --emit-ts <file>         lyric lines with word times as a VO module (the same shape gen_voice
                           writes) → <SingAlong> bouncing ball + lipSync for the singer

song.json:
  {
    "title": "Count With Bobo",
    "bpm": 100, "beatsPerBar": 4, "introBars": 2, "outroBars": 2, "transpose": 0,
    "instruments": {"lead": "xylophone|musicbox|whistle|none", "chords": "ukulele|piano|none",
                    "bass": true, "drums": "soft|none", "leadWithVocal": true},
    "singer": "mila",
    "vocal": {"voice": "af_bella", "pitch": 4, "rate": "-6%", "lang": "en"},
    "sections": {
      "verse": {"chords": "C | G | Am | F",                 # one chord per bar ("C G" = 2 per bar)
                "melody": "C4:1 C4:1 G4:1 G4:1 | A4:1 A4:1 G4:2 | …",   # NOTE:beats, R = rest
                "lyrics": "One, two, three, four, / five lit-tle bears"}   # syllables ↔ notes,
    },                                                     # "-" splits syllables, "/" = new line,
    "form": ["verse", "verse"]                             # "_" holds the previous syllable
  }

Usage:
  python tools/gen_song.py kids-shorts/tiny-sparks/songs/count-with-bobo/song.json
  python tools/gen_song.py <song.json> --vocal chant --emit-ts remotion/src/shots/kids-x/song.gen.ts
  python tools/gen_song.py <song.json> --vocal sing      # experimental toy singer

Needs numpy (installed with kokoro-onnx) and ffmpeg with the rubberband filter (for vocals).
"""
import argparse
import hashlib
import json
import math
import os
import re
import subprocess
import sys
import wave

import numpy as np

SR = 44100
HERE = os.path.dirname(os.path.abspath(__file__))

NOTE_RE = re.compile(r"^([A-Ga-g])([#b]?)(-?\d)$")
SEMI = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def midi_of(name):
    m = NOTE_RE.match(name)
    if not m:
        raise ValueError(f"bad note '{name}' (use e.g. C4, F#4, Bb3)")
    n, acc, octv = m.groups()
    return 12 * (int(octv) + 1) + SEMI[n.upper()] + (1 if acc == "#" else -1 if acc == "b" else 0)


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


CHORD_RE = re.compile(r"^([A-G])([#b]?)(m|maj7|m7|7|dim|sus4|sus2|add9)?$")
QUAL = {None: [0, 4, 7], "m": [0, 3, 7], "7": [0, 4, 7, 10], "maj7": [0, 4, 7, 11], "m7": [0, 3, 7, 10],
        "dim": [0, 3, 6], "sus4": [0, 5, 7], "sus2": [0, 2, 7], "add9": [0, 4, 7, 14]}


def chord_notes(sym, transpose=0):
    m = CHORD_RE.match(sym)
    if not m:
        raise ValueError(f"bad chord '{sym}' (use C, Am, G7, Fmaj7, Bb, F#m, Dsus4…)")
    n, acc, q = m.groups()
    root = 60 + SEMI[n] + (1 if acc == "#" else -1 if acc == "b" else 0) + transpose
    while root > 64:
        root -= 12
    return root, [root + i for i in QUAL[q]]


# ─────────────────────────────── instruments (numpy) ───────────────────────────────────────────
def env(n, attack=0.005, decay=0.5):
    t = np.arange(n) / SR
    a = np.minimum(1, t / max(attack, 1e-4))
    return a * np.exp(-t / decay)


def xylophone(f, dur):
    n = int(SR * min(dur + 0.6, 1.6))
    t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.45)
         + 0.35 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t / 0.09)
         + 0.12 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t / 0.03))
    return y * np.minimum(1, t / 0.002) * 0.5


def musicbox(f, dur):
    n = int(SR * min(dur + 1.2, 2.4))
    t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * f * 2 * t) + 0.4 * np.sin(2 * np.pi * f * 4.01 * t) * np.exp(-t / 0.3)
         + 0.2 * np.sin(2 * np.pi * f * 6.02 * t) * np.exp(-t / 0.12))
    return y * np.exp(-t / 0.9) * np.minimum(1, t / 0.002) * 0.32


def whistle(f, dur):
    n = int(SR * (dur + 0.05))
    t = np.arange(n) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 0.25)
    ph = 2 * np.pi * f * 2 * np.cumsum(vib) / SR
    y = np.sin(ph) + 0.08 * np.sin(2 * ph)
    e = np.minimum(1, t / 0.04) * np.minimum(1, (dur + 0.05 - t) / 0.06)
    return y * np.clip(e, 0, 1) * 0.28


def pluck(f, dur, bright=0.5):
    """Karplus-Strong string (ukulele/guitar), vectorised block by block."""
    n = int(SR * min(dur + 0.4, 2.2))
    N = max(2, int(SR / f))
    rng = np.random.default_rng(int(f * 100))
    y = np.zeros(n + N + 1)
    y[:N] = rng.uniform(-1, 1, N) * (0.6 + bright * 0.4)
    decay = 0.996
    i = N
    while i < n + 1:
        j = min(i + N, n + 1)
        prev = y[i - N:j - N]
        prev2 = y[i - N - 1:j - N - 1] if i - N - 1 >= 0 else np.concatenate([[0], y[i - N:j - N - 1]])
        y[i:j] = decay * 0.5 * (prev + prev2[: j - i])
        i = j
    out = y[:n]
    t = np.arange(n) / SR
    return out * np.minimum(1, (dur + 0.4 - t) / 0.08).clip(0, 1) * 0.35


def epiano(f, dur):
    n = int(SR * (dur + 0.5))
    t = np.arange(n) / SR
    y = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t / 0.4)
    return y * env(n, 0.004, 1.0) * np.minimum(1, (dur + 0.5 - t) / 0.15).clip(0, 1) * 0.16


def bass(f, dur):
    n = int(SR * (dur * 0.95))
    t = np.arange(n) / SR
    y = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * f * 2 * t)
    return y * env(n, 0.01, 0.8) * np.minimum(1, (dur * 0.95 - t) / 0.03).clip(0, 1) * 0.42


def kick():
    n = int(SR * 0.35)
    t = np.arange(n) / SR
    fr = 50 + 70 * np.exp(-t / 0.04)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.12) * 0.55


def clap():
    n = int(SR * 0.18)
    t = np.arange(n) / SR
    rng = np.random.default_rng(7)
    nz = rng.uniform(-1, 1, n)
    nz = nz - np.concatenate([[0], nz[:-1]]) * 0.6  # brighten
    return nz * np.exp(-t / 0.05) * 0.22


def shaker():
    n = int(SR * 0.06)
    t = np.arange(n) / SR
    rng = np.random.default_rng(3)
    nz = rng.uniform(-1, 1, n)
    nz = nz - np.concatenate([[0], nz[:-1]])
    return nz * np.exp(-t / 0.015) * 0.06


LEADS = {"xylophone": xylophone, "musicbox": musicbox, "whistle": whistle}


def place(buf, sig, at):
    i = int(at * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]


# ─────────────────────────────── parsing the song ──────────────────────────────────────────────
def parse_melody(s):
    notes = []
    for tok in s.replace("|", " ").split():
        name, _, beats = tok.partition(":")
        b = float(beats or 1)
        notes.append((None if name.upper() == "R" else midi_of(name), b))
    return notes


def parse_lyrics(s):
    """→ list of lines; each line = list of (syllable_text, word_index, is_word_start, is_hold)."""
    lines = []
    for raw in s.split("/"):
        sy = []
        for wi, word in enumerate(raw.split()):
            if word == "_":
                sy.append(("_", None, False, True))
                continue
            parts = word.split("-")
            for k, p in enumerate(parts):
                sy.append((p, wi, k == 0, False))
        if sy:
            lines.append(sy)
    return lines


def parse_chords(s):
    bars = []
    for bar in s.split("|"):
        cs = bar.split()
        if cs:
            bars.append(cs)
    return bars


def build(song):
    bpm = float(song["bpm"])
    bpb = int(song.get("beatsPerBar", 4))
    spb = 60.0 / bpm
    tr = int(song.get("transpose", 0))
    secs = song["sections"]
    form = song.get("form") or list(secs.keys())
    intro = int(song.get("introBars", 2))
    outro = int(song.get("outroBars", 2))

    chords = []  # (start_s, dur_s, symbol)
    notes = []  # (start_s, dur_s, midi, syllable or None, line_id, word_id, word_start)
    lines_out = []  # (line_id, [syllable events])
    t = 0.0
    first = parse_chords(secs[form[0]]["chords"])
    for b in range(intro):
        bar = first[b % len(first)]
        for c in bar:
            chords.append((t, bpb * spb / len(bar), c))
            t += bpb * spb / len(bar)
    line_id = 0
    for name in form:
        sec = secs[name]
        cb = parse_chords(sec["chords"])
        sec_start = t
        for bar in cb:
            for c in bar:
                chords.append((t, bpb * spb / len(bar), c))
                t += bpb * spb / len(bar)
        mel = parse_melody(sec.get("melody", ""))
        mel_beats = sum(b for _, b in mel)
        if mel and abs(mel_beats - len(cb) * bpb) > 1e-6:
            print(f"  ! section '{name}': melody is {mel_beats:g} beats, chords are {len(cb) * bpb} beats")
        lyr = parse_lyrics(sec.get("lyrics", ""))
        flat = [(li, s) for li, line in enumerate(lyr) for s in line]
        k = 0
        mt = sec_start
        for midi, b in mel:
            syl = None
            if midi is not None and k < len(flat):
                li, s = flat[k]
                syl = (line_id + li, s)
                k += 1
            notes.append((mt, b * spb, midi, syl))
            mt += b * spb
        if k < len(flat):
            print(f"  ! section '{name}': {len(flat) - k} syllable(s) have no note")
        line_id += len(lyr)
    for b in range(outro):
        c = chords[-1][2] if b < outro - 1 else parse_chords(secs[form[0]]["chords"])[0][0]
        chords.append((t, bpb * spb, c))
        t += bpb * spb
    return dict(bpm=bpm, bpb=bpb, spb=spb, transpose=tr, chords=chords, notes=notes, total=t + 2.0, intro=intro)


def lyric_lines(plan):
    """Group the sung syllables into lines of words with start/end times."""
    lines = {}
    for start, dur, midi, syl in plan["notes"]:
        if not syl:
            continue
        lid, (text, wi, wstart, hold) = syl
        L = lines.setdefault(lid, {"words": []})
        if hold or not wstart:
            if L["words"]:
                w = L["words"][-1]
                if not hold:
                    w["w"] += text
                w["end"] = round(start + dur, 3)
            continue
        L["words"].append({"w": text, "start": round(start, 3), "end": round(start + dur, 3)})
    out = []
    for lid in sorted(lines):
        ws = lines[lid]["words"]
        if ws:
            out.append({"text": " ".join(w["w"] for w in ws), "start": ws[0]["start"], "end": ws[-1]["end"], "words": ws})
    return out


# ─────────────────────────────── rendering ────────────────────────────────────────────────────
def render_instrumental(song, plan):
    ins = song.get("instruments", {})
    tr = plan["transpose"]
    spb, bpb = plan["spb"], plan["bpb"]
    buf = np.zeros(int(SR * plan["total"]) + SR)
    chord_kind = ins.get("chords", "ukulele")
    # chords: ukulele strum pattern D . D U . U D U  (8ths) — or sustained e-piano
    for start, dur, sym in plan["chords"]:
        root, cn = chord_notes(sym, tr)
        if chord_kind == "ukulele":
            pattern = [0, 1, 1.5, 2.5, 3, 3.5]  # beats within a 4-beat bar
            for p in pattern:
                if p * spb >= dur - 1e-6:
                    continue
                up = (p % 1) != 0
                voices = cn[::-1] if up else cn
                for k, m in enumerate(voices):
                    place(buf, pluck(hz(m + 12), spb * 1.2, 0.3 if up else 0.6) * (0.55 if up else 0.8), start + p * spb + k * 0.012)
        elif chord_kind == "piano":
            for m in cn:
                place(buf, epiano(hz(m), dur), start)
        if ins.get("bass", True):
            beats = [0, 2] if dur >= 2 * spb - 1e-6 else [0]
            for p in beats:
                place(buf, bass(hz(root - 12), spb * 1.8), start + p * spb)
    if ins.get("drums", "soft") != "none":
        nbars = int(plan["total"] / (bpb * spb))
        end = plan["chords"][-1][0]
        for b in range(nbars):
            bt = b * bpb * spb
            if bt > end:
                break
            for beat in range(bpb):
                at = bt + beat * spb
                if beat % 2 == 0:
                    place(buf, kick(), at)
                else:
                    place(buf, clap(), at)
                place(buf, shaker(), at + spb / 2)
                place(buf, shaker() * 0.6, at)
    lead = ins.get("lead", "xylophone")
    if lead in LEADS:
        gain = 0.55 if (song.get("_has_vocal") and ins.get("leadWithVocal", True)) else 1.0
        if song.get("_has_vocal") and not ins.get("leadWithVocal", True):
            gain = 0.0
        for start, dur, midi, _ in plan["notes"]:
            if midi is not None and gain > 0:
                place(buf, LEADS[lead](hz(midi + tr), dur) * gain, start)
    return buf


def write_wav(path, y):
    y = y / max(1e-9, np.max(np.abs(y))) * 0.89
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((y * 32767).astype(np.int16).tobytes())


def read_wav(path):
    with wave.open(path, "rb") as w:
        sr = w.getframerate()
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32767
        if w.getnchannels() == 2:
            a = a.reshape(-1, 2).mean(axis=1)
    return a, sr


def f0_of(seg, sr):
    """Median pitch (Hz) of a voiced segment by autocorrelation; None if unvoiced."""
    if len(seg) < sr * 0.04:
        return None
    hop = int(sr * 0.02)
    win = int(sr * 0.04)
    fs = []
    for i in range(0, len(seg) - win, hop):
        x = seg[i:i + win] * np.hanning(win)
        if np.sqrt(np.mean(x ** 2)) < 0.02:
            continue
        ac = np.correlate(x, x, "full")[win - 1:]
        lo, hi = int(sr / 500), int(sr / 70)
        if hi >= len(ac):
            continue
        k = lo + int(np.argmax(ac[lo:hi]))
        if ac[k] > 0.3 * ac[0]:
            fs.append(sr / k)
    return float(np.median(fs)) if fs else None


def ff(*a):
    subprocess.run(["ffmpeg", "-y", "-v", "error", *a], check=True)


def render_vocal(song, plan, mode, workdir):
    sys.path.insert(0, HERE)
    import gen_voice  # noqa: E402  (kokoro engine + word timing)

    v = song.get("vocal", {})
    voice = v.get("voice", "af_bella")
    pitch = float(v.get("pitch", 4))
    rate = v.get("rate", "-6%")
    lang = v.get("lang")
    vdir = os.path.join(workdir, "voice")
    os.makedirs(vdir, exist_ok=True)
    lines = lyric_lines(plan)
    buf = np.zeros(int(SR * plan["total"]) + SR)
    tr = plan["transpose"]
    for li, L in enumerate(lines):
        text = L["text"].replace("_", "")
        h = hashlib.sha1(f"{voice}|{rate}|{lang}|{pitch if mode == 'chant' else 0}|{text}".encode()).hexdigest()[:8]
        raw = os.path.join(vdir, f"l{li:02d}-{h}.mp3")
        if not os.path.exists(raw):
            gen_voice.tts_line_kokoro(voice, text, raw, rate, pitch if mode == "chant" else 0, lang)
        wav = raw[:-4] + ".wav"
        if not os.path.exists(wav):
            ff("-i", raw, "-ar", str(SR), "-ac", "1", wav)
        a, _ = read_wav(wav)
        if mode == "chant":
            span = L["end"] - L["start"] + 0.25
            have = len(a) / SR
            tempo = min(1.35, max(0.75, have / span))
            out = raw[:-4] + f"-fit{tempo:.3f}.wav"
            if not os.path.exists(out):
                ff("-i", wav, "-af", f"rubberband=tempo={tempo:.4f}", out)
            seg, _ = read_wav(out)
            place(buf, seg * 0.9, L["start"] - 0.03)
            continue
        # SING: per word segment → split across its notes → pitch to each note, stretch to fit
        words = json.load(open(raw + ".words.json", encoding="utf-8"))
        sung_notes = [(s, d, m, syl) for s, d, m, syl in plan["notes"] if syl and syl[0] == li_global(plan, li)]
        groups = group_notes_by_word(sung_notes)
        for wi, wnotes in enumerate(groups):
            if wi >= len(words):
                break
            ws, we = words[wi]["start"], words[wi]["end"]
            seg = a[int(ws * SR):int(we * SR)]
            total_d = sum(d for _, d, _, _ in wnotes)
            off = 0
            for s, d, m, _ in wnotes:
                piece = seg[int(off / total_d * len(seg)):int((off + d) / total_d * len(seg))]
                off += d
                if len(piece) < SR * 0.03:
                    continue
                target = hz(m + tr)
                tempo = max(0.25, min(4.0, (len(piece) / SR) / (d * 0.92)))
                # correct the pitch every ~0.1s of source: speech glides inside a word, a single
                # shift per note leaves long notes flat/sharp at the end
                k = max(1, int(round(len(piece) / (SR * 0.1))))
                chunks = []
                for c in range(k):
                    sub = piece[int(c / k * len(piece)):int((c + 1) / k * len(piece)) + int(SR * 0.012)]
                    f0 = f0_of(sub, SR) or f0_of(piece, SR) or 220.0
                    tg = target
                    while tg / f0 > 2.2:
                        tg /= 2
                    while f0 / tg > 2.2:
                        tg *= 2
                    semis = max(-12, min(12, 12 * math.log2(tg / f0)))
                    pin = os.path.join(vdir, f"p{li:02d}-{wi:02d}-{int(s * 1000)}-{c}.wav")
                    pout = pin[:-4] + "-s.wav"
                    write_wav(pin, sub)
                    ff("-i", pin, "-af", f"rubberband=tempo={tempo:.4f}:pitch={2 ** (semis / 12):.5f}:formant=preserved", pout)
                    chunks.append(read_wav(pout)[0])
                xf = int(SR * 0.012 / tempo)
                y = chunks[0]
                for ch in chunks[1:]:
                    n = min(xf, len(y), len(ch))
                    if n > 1:
                        r = np.linspace(0, 1, n)
                        y = np.concatenate([y[:-n], y[-n:] * (1 - r) + ch[:n] * r, ch[n:]])
                    else:
                        y = np.concatenate([y, ch])
                fade = min(len(y) // 4, int(SR * 0.015))
                if fade > 1:
                    y[:fade] *= np.linspace(0, 1, fade)
                    y[-fade:] *= np.linspace(1, 0, fade)
                place(buf, y * 0.9, s)
    return buf, lines


def li_global(plan, li):
    ids = sorted({syl[0] for _, _, _, syl in plan["notes"] if syl})
    return ids[li] if li < len(ids) else -1


def group_notes_by_word(notes):
    groups = []
    for n in notes:
        _, (text, wi, wstart, hold) = n[3]
        if wstart and not hold:
            groups.append([n])
        elif groups:
            groups[-1].append(n)
    return groups


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("song")
    ap.add_argument("--vocal", choices=["none", "chant", "sing"], default="none")
    ap.add_argument("--out", help="output dir (default: next to song.json)")
    ap.add_argument("--emit-ts", help="write the sung lines as a VO TS module (SingAlong / lipSync)")
    args = ap.parse_args()

    song = json.load(open(args.song, encoding="utf-8"))
    out = args.out or os.path.dirname(os.path.abspath(args.song))
    os.makedirs(out, exist_ok=True)
    song["_has_vocal"] = args.vocal != "none"
    plan = build(song)
    print(f"{song.get('title', 'song')}: {plan['bpm']:g} bpm, {len(plan['chords'])} chord hits, "
          f"{sum(1 for n in plan['notes'] if n[2] is not None)} melody notes, {plan['total']:.1f}s")

    inst = render_instrumental(song, plan)
    ipath = os.path.join(out, "instrumental.wav")
    write_wav(ipath, inst)
    mix = inst / max(1e-9, np.max(np.abs(inst)))
    lines = lyric_lines(plan)
    if args.vocal != "none":
        voc, lines = render_vocal(song, plan, args.vocal, out)
        write_wav(os.path.join(out, "vocal.wav"), voc)
        mix = mix * 0.55 + voc / max(1e-9, np.max(np.abs(voc))) * 0.75
    mpath = os.path.join(out, "mix.wav")
    write_wav(mpath, mix)
    ff("-i", mpath, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "44100", "-b:a", "192k", os.path.join(out, "song.mp3"))
    ff("-i", ipath, "-af", "loudnorm=I=-24:TP=-3:LRA=11", "-ar", "44100", "-b:a", "160k", os.path.join(out, "bed.mp3"))
    os.remove(mpath)

    beatmap = {
        "title": song.get("title"), "bpm": plan["bpm"], "beatsPerBar": plan["bpb"], "secondsPerBeat": plan["spb"],
        "durationSec": round(plan["total"], 2), "introBars": plan["intro"],
        "chords": [{"t": round(s, 3), "dur": round(d, 3), "chord": c} for s, d, c in plan["chords"]],
        "notes": [{"t": round(s, 3), "dur": round(d, 3), "midi": m, "syllable": (syl[1][0] if syl else None)} for s, d, m, syl in plan["notes"] if m is not None],
        "lines": lines,
    }
    json.dump(beatmap, open(os.path.join(out, "beatmap.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    if args.emit_ts:
        singer = song.get("singer", "singer")
        ts = ["// AUTO-GENERATED by tools/gen_song.py — do not edit. Word times = the melody's note times.",
              "import type { VoLine } from '../../lib/shorts';", "",
              f"export const SONG_BPM = {plan['bpm']:g};", f"export const SONG_BEAT = {plan['spb']:.5f};",
              f"export const SONG_DURATION = {plan['total']:.2f};", "",
              "export const SONG: VoLine[] = ["]
        for L in lines:
            ws = ", ".join(f"{{ w: {json.dumps(w['w'])}, start: {w['start']}, end: {w['end']} }}" for w in L["words"])
            ts.append(f"  {{ speaker: {json.dumps(singer)}, text: {json.dumps(L['text'])}, start: {L['start']}, end: {L['end']}, words: [{ws}] }},")
        ts.append("];")
        os.makedirs(os.path.dirname(os.path.abspath(args.emit_ts)), exist_ok=True)
        open(args.emit_ts, "w", encoding="utf-8").write("\n".join(ts) + "\n")
        print(f"  lyric module -> {args.emit_ts}")
    print(f"  -> {out}/song.mp3 (mix) · bed.mp3 (instrumental bed) · beatmap.json")


if __name__ == "__main__":
    main()
