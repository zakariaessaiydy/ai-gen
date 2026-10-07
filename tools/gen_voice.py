#!/usr/bin/env python3
"""
gen_voice.py — TTS voice track for a TSX short, driven by its beats.json.

Shorts-track voice step. Reads a short's beats.json (vo[] lines with estimated
start/end seconds), generates each line with text-to-speech (per line, so a
single line can be re-rolled without re-billing the rest), time-fits any clip that
overflows its window (gentle atempo, capped), assembles one timed voice track, and
writes the ACTUAL line timings back into beats.json — the TSX captions retime from it.

Two engines, both giving REAL per-word timestamps (captions sync exactly):
  --engine elevenlabs  (default) ElevenLabs /with-timestamps. Needs ELEVENLABS_API_KEY.
                       Supports eleven_v3 audio tags like [excited] in the `tts` field.
  --engine edge        Microsoft Edge Neural TTS — FREE, no API key, no quota.
                       Needs `pip install edge-tts`. Audio tags are stripped, not spoken.

LIBRARY-FIRST: generated lines are cached by (engine, voice, text-hash); unchanged lines
are never re-billed. --force regenerates everything.

Usage:
  python tools/gen_voice.py --beats shorts/short-1-chess/beats.json
  python tools/gen_voice.py --beats ... --engine edge                        # free voice
  python tools/gen_voice.py --beats ... --engine edge --list-voices          # free voices
  python tools/gen_voice.py --beats ... --mux remotion/out/Short1Chess.mp4   # + voiced preview
  python tools/gen_voice.py --beats ... --dry-run                            # plan only

ffmpeg/ffprobe on PATH.
Default voice: ElevenLabs premade "Liam" / Edge "en-US-AndrewMultilingualNeural".

DIALOGUE (multi-voice): a vo line may carry "speaker": "<id>", and beats.json a "cast" map
  "cast": {"bro": {"elevenlabs": "<voice id>", "edge": "en-US-...", "rate": "+10%"}, ...}
Each line is then voiced by its speaker's voice for the active engine (falling back to
--voice), and the speaker is emitted into vo.gen.ts so the composition can lip-sync the
right character. Lines without a speaker are narration and use --voice as before.
"""
import argparse
import hashlib
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from ffmpeg_path import ensure_on_path

ensure_on_path()

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_VOICE = "TX3LPaxmHKxFdv7VOQHJ"  # ElevenLabs premade "Liam"
DEFAULT_MODEL = "eleven_multilingual_v2"
EDGE_VOICE = "en-US-AndrewMultilingualNeural"  # free engine's Liam-alike (warm male)
MAX_ATEMPO = 1.3  # never speed a line up more than 30%


def load_env():
    env = {}
    p = os.path.join(ROOT, ".env")
    if os.path.exists(p):
        for line in open(p, encoding="utf-8"):
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return {**env, **os.environ}


def run(cmd):
    r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if r.returncode != 0:
        sys.exit(f"command failed: {' '.join(cmd)}\n{r.stdout}")
    return r.stdout


def probe_duration(path):
    out = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
               "-of", "default=noprint_wrappers=1:nokey=1", path])
    return float(out.strip())


def tts_line(key, voice, model, text, prev_text, next_text, out_path):
    """TTS with character-level timestamps -> writes the mp3 AND <out_path>.words.json
    (per-word start/end seconds in the RAW clip) so captions can sync exactly.

    `text` may contain eleven_v3 audio tags like [excited] — they steer delivery and are
    FILTERED out of the word map (never captioned). If the model rejects /with-timestamps,
    falls back to plain TTS with an empty word map (captions then use estimated timing)."""
    body = {"text": text, "model_id": model}
    if not model.startswith("eleven_v3"):
        # v3 rejects the classic settings block AND previous/next context stitching;
        # server defaults are right for it
        body["voice_settings"] = {"stability": 0.5, "similarity_boost": 0.75, "style": 0.3,
                                  "use_speaker_boost": True}
        if prev_text:
            body["previous_text"] = prev_text
        if next_text:
            body["next_text"] = next_text

    import base64

    def call(url, tries=4):
        # lines are generated in parallel (--jobs), so a plan's concurrency cap shows up as
        # 429s — back off and retry rather than failing the whole run
        for attempt in range(tries):
            req = urllib.request.Request(url, data=json.dumps(body).encode(),
                                         headers={"xi-api-key": key, "Content-Type": "application/json"})
            try:
                with urllib.request.urlopen(req, timeout=180) as r:
                    ctype = r.headers.get("Content-Type", "")
                    raw = r.read()
                return json.loads(raw) if "json" in ctype else raw
            except urllib.error.HTTPError as e:
                if e.code in (429, 500, 502, 503) and attempt < tries - 1:
                    time.sleep(2 ** attempt)
                    continue
                raise

    base = f"https://api.elevenlabs.io/v1/text-to-speech/{voice}"
    try:
        resp = call(f"{base}/with-timestamps?output_format=mp3_44100_128")
        audio = base64.b64decode(resp["audio_base64"])
        align = resp.get("alignment") or {}
        words = chars_to_words(align.get("characters", []),
                               align.get("character_start_times_seconds", []),
                               align.get("character_end_times_seconds", []))
    except urllib.error.HTTPError as e:
        detail = e.read().decode()[:500]
        if e.code in (400, 404, 422):  # model may not support timestamps — plain fallback
            print(f"    (with-timestamps not available: {e.code}; falling back to plain TTS)")
            try:
                audio = call(f"{base}?output_format=mp3_44100_128")
                words = []
            except urllib.error.HTTPError as e2:
                sys.exit(f"ElevenLabs TTS failed ({e2.code}) for: {text!r}\n{e2.read().decode()[:500]}")
        else:
            sys.exit(f"ElevenLabs TTS failed ({e.code}) for: {text!r}\n{detail}")

    # audio tags ([excited], [pause]…) are delivery directions, not spoken words
    words = [w for w in words if not (w["w"].startswith("[") or w["w"].endswith("]"))]
    with open(out_path, "wb") as f:
        f.write(audio)
    with open(out_path + ".words.json", "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False)


def chars_to_words(chars, starts, ends):
    """Collapse character alignment into [{w, start, end}] (whitespace-delimited)."""
    words, cur, w_start, w_end = [], "", None, None
    for ch, s, e in zip(chars, starts, ends):
        if ch.isspace():
            if cur:
                words.append({"w": cur, "start": round(w_start, 3), "end": round(w_end, 3)})
                cur, w_start = "", None
            continue
        if not cur:
            w_start = s
        cur += ch
        w_end = e
    if cur:
        words.append({"w": cur, "start": round(w_start, 3), "end": round(w_end, 3)})
    return words


def strip_tags(text):
    """Drop eleven_v3 audio tags ([excited], [pause]) — the free engine would SPEAK them."""
    out, depth = [], 0
    for ch in text:
        if ch == "[":
            depth += 1
        elif ch == "]":
            depth = max(0, depth - 1)
        elif depth == 0:
            out.append(ch)
    return " ".join("".join(out).split())


def merge_word_times(text, bounds):
    """Map Edge's WordBoundary events back onto the ORIGINAL whitespace tokens.

    Edge reports words without their punctuation ('calm' for 'calm.'), sometimes splits one
    written token across events ('A1:B10' -> A1, B10) and sometimes merges two into one
    ('In 1997'). So flatten the events to character times (linear inside an event, exactly
    like ElevenLabs' own character alignment) and re-cut them on the WRITTEN tokens. If the
    two sequences ever disagree, fall back to Edge's own words — times stay right, only the
    punctuation is lost."""
    def core(s):
        return "".join(c for c in s.lower() if c.isalnum())

    chars = []  # (char, start, end), punctuation-free
    for b in bounds:
        c = core(b["w"])
        if not c:
            continue
        span = (b["end"] - b["start"]) / len(c)
        chars += [(ch, b["start"] + i * span, b["start"] + (i + 1) * span)
                  for i, ch in enumerate(c)]

    out, ci = [], 0
    for tok in text.split():
        want = core(tok)
        if not want:
            continue  # a bare '—' or '...' is never spoken
        if ci + len(want) > len(chars) or \
                "".join(c[0] for c in chars[ci:ci + len(want)]) != want:
            return [{"w": b["w"], "start": round(b["start"], 3), "end": round(b["end"], 3)}
                    for b in bounds]
        out.append({"w": tok, "start": round(chars[ci][1], 3),
                    "end": round(chars[ci + len(want) - 1][2], 3)})
        ci += len(want)
    return out


def tts_line_edge(voice, text, out_path, rate="+0%"):
    """FREE engine: Microsoft Edge Neural TTS. Same contract as tts_line() — writes the
    mp3 AND <out_path>.words.json with real per-word times (Edge WordBoundary events).

    Edge reads slower than ElevenLabs' Liam, so beats windows written for Liam tend to
    overflow; `rate` narrates faster at the source, which sounds better than atempo."""
    import asyncio
    try:
        import edge_tts
    except ImportError:
        sys.exit("--engine edge needs the edge-tts package:  pip install edge-tts")

    spoken = strip_tags(text)

    async def go():
        com = edge_tts.Communicate(spoken, voice, rate=rate, boundary="WordBoundary")
        audio, bounds = b"", []
        async for ch in com.stream():
            if ch["type"] == "audio":
                audio += ch["data"]
            elif ch["type"] == "WordBoundary":
                bounds.append({"w": ch["text"], "start": ch["offset"] / 1e7,
                               "end": (ch["offset"] + ch["duration"]) / 1e7})
        return audio, bounds

    try:
        audio, bounds = asyncio.run(go())
    except Exception as e:  # network/endpoint trouble — say which line died
        sys.exit(f"Edge TTS failed for: {spoken!r}\n{type(e).__name__}: {e}")
    if not audio:
        sys.exit(f"Edge TTS returned no audio for: {spoken!r}")

    with open(out_path, "wb") as f:
        f.write(audio)
    with open(out_path + ".words.json", "w", encoding="utf-8") as f:
        json.dump(merge_word_times(spoken, bounds), f, ensure_ascii=False)


# ── FREE LOCAL engine: Kokoro-82M ───────────────────────────────────────────────────────
# Apache-2.0, runs on CPU, no key/quota/network (install once: python tools/setup_kokoro.py).
# Kokoro has no word-boundary events, so word times are DERIVED from the audio: the clip is cut
# into voiced runs at its pauses, the line's words are grouped at their punctuation, and when the
# groups line up with the runs each word gets a share of its run weighted by its phoneme count
# (else the whole voiced span is shared). Accurate to a syllable or so — plenty for word-pop
# captions and lip-flap; the timings stay REAL in that every boundary is measured audio.
KOKORO_DIR = os.path.join(ROOT, "tools", "kokoro")
KOKORO_VOICE = "am_michael"
_kokoro = None
_kokoro_lock = None


def _kokoro_engine():
    global _kokoro, _kokoro_lock
    import threading
    if _kokoro_lock is None:
        _kokoro_lock = threading.Lock()
    if _kokoro is None:
        model = os.path.join(KOKORO_DIR, "kokoro-v1.0.q8.onnx")
        voices = os.path.join(KOKORO_DIR, "voices-v1.0.npz")
        if not (os.path.exists(model) and os.path.exists(voices)):
            sys.exit("kokoro is not installed — run:  pip install kokoro-onnx && python tools/setup_kokoro.py")
        try:
            from kokoro_onnx import Kokoro
        except ImportError:
            sys.exit("--engine kokoro needs:  pip install kokoro-onnx  (then python tools/setup_kokoro.py)")
        _kokoro = Kokoro(model, voices)
    return _kokoro


def kokoro_voice(k, spec):
    """'am_puck' or a BLEND 'am_puck:0.7+am_fenrir:0.3' (style vectors mixed — a voice of your own)."""
    if "+" not in spec and ":" not in spec:
        return spec
    import numpy as np
    mix = None
    for part in spec.split("+"):
        name, _, w = part.partition(":")
        vec = k.voices[name.strip()] * float(w or 1)
        mix = vec if mix is None else mix + vec
    return mix.astype(np.float32)


def rate_to_speed(rate):
    """'+6%' -> 1.06 (the Edge-style rate string, reused so cast entries stay engine-neutral)."""
    try:
        return 1.0 + float(str(rate).strip().rstrip("%")) / 100.0
    except ValueError:
        return 1.0


def voiced_runs(samples, sr, gap=0.11, floor_db=-38.0):
    """[(start, end)] seconds of speech, split at silences >= `gap`s (10ms RMS frames)."""
    import numpy as np
    hop = int(sr * 0.01)
    n = len(samples) // hop
    if n == 0:
        return []
    frames = samples[: n * hop].reshape(n, hop)
    rms = np.sqrt((frames.astype(np.float64) ** 2).mean(axis=1)) + 1e-9
    db = 20 * np.log10(rms / rms.max())
    on = db > floor_db
    runs, i = [], 0
    while i < n:
        if not on[i]:
            i += 1
            continue
        j = i
        while j < n and on[j]:
            j += 1
        runs.append([i, j])
        i = j
    merged = []
    for r in runs:  # close gaps shorter than `gap` (stops/plosives inside words)
        if merged and (r[0] - merged[-1][1]) * 0.01 < gap:
            merged[-1][1] = r[1]
        else:
            merged.append(r)
    return [(a * 0.01, b * 0.01) for a, b in merged if (b - a) >= 3]


def derive_word_times(text, runs, weight):
    words = [w for w in text.split() if any(c.isalnum() for c in w)]
    if not words or not runs:
        return []
    groups, cur = [], []
    for w in words:
        cur.append(w)
        if w.rstrip("\"')")[-1:] in ".,!?;:—…":
            groups.append(cur)
            cur = []
    if cur:
        groups.append(cur)
    if len(groups) != len(runs):  # pauses don't match punctuation: share the whole span
        groups, runs = [words], [(runs[0][0], runs[-1][1])]
    out = []
    for g, (a, b) in zip(groups, runs):
        ws = [max(1, weight(w)) for w in g]
        t, tot = a, sum(ws)
        for w, k in zip(g, ws):
            d = (b - a) * k / tot
            out.append({"w": w, "start": round(t, 3), "end": round(t + d, 3)})
            t += d
    return out


KOKORO_LANGS = {"a": "en-us", "b": "en-gb", "f": "fr-fr", "e": "es", "i": "it", "p": "pt-br", "h": "hi", "j": "ja", "z": "cmn"}


def kokoro_lang(voice, lang=None):
    """Phonemizer language for a line: explicit `lang`, else the voice's prefix (ff_ = French)."""
    if lang:
        return {"fr": "fr-fr", "en": "en-us", "es": "es", "it": "it", "pt": "pt-br"}.get(lang, lang)
    return KOKORO_LANGS.get((voice.split(":")[0].split("+")[0] or "a")[0], "en-us")


def tts_line_kokoro(voice, text, out_path, rate="+0%", pitch=0.0, lang=None, formant=False):
    """FREE LOCAL engine. Same contract as tts_line(): writes the audio AND
    <out_path>.words.json (word times derived from the audio's own pauses — see above).
    pitch = semitones (e.g. +4 turns an adult voice into a kid/cartoon voice; rubberband keeps
    the duration, so word times are unchanged). formant=True keeps the adult timbre (less
    chipmunk). lang = phonemizer language (default from the voice prefix; 'fr' for French)."""
    import tempfile
    import wave
    import numpy as np
    k = _kokoro_engine()
    spoken = strip_tags(text)
    with _kokoro_lock:  # one ONNX session; lines queue rather than fight over the CPU
        lg = kokoro_lang(voice, lang)
        audio, sr = k.create(spoken, voice=kokoro_voice(k, voice), speed=rate_to_speed(rate), lang=lg)

        def weight(w):
            ph = k.tokenizer.phonemize("".join(c for c in w if c.isalnum() or c == "'"), lg)
            return len([c for c in ph if c.isalpha() or c in "ɑɐɒæɔəɘɚɛɜɝɞɤɨɪʉʊʌʏŋðθʃʒ"])

        words = derive_word_times(spoken, voiced_runs(audio, sr), weight)
    pcm = (np.clip(audio, -1, 1) * 32767).astype(np.int16)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        wav = tmp.name
    with wave.open(wav, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())
    af = []
    if pitch:
        # highest-quality pitch path (fewer warbles), then a light clean-up: rumble cut, soft
        # de-ess (pitched voices get hissy), gentle compression so lines sit evenly
        af = ["-af", f"rubberband=pitch={2 ** (float(pitch) / 12):.5f}:pitchq=quality:transients=mixed:window=standard"
              + (":formant=preserved" if formant else "")
              + ",highpass=f=80,deesser=i=0.35,acompressor=threshold=0.12:ratio=2.5:attack=8:release=120:makeup=1.3"]
    run(["ffmpeg", "-y", "-v", "error", "-i", wav, *af, "-b:a", "192k", out_path])
    os.remove(wav)
    with open(out_path + ".words.json", "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False)


def list_edge_voices(prefix="en-"):
    import asyncio
    try:
        import edge_tts
    except ImportError:
        sys.exit("--list-voices needs the edge-tts package:  pip install edge-tts")
    for v in asyncio.run(edge_tts.list_voices()):
        if v["ShortName"].startswith(prefix):
            print(f"  {v['ShortName']:<40s} {v['Gender']:<7s} {v.get('FriendlyName', '')}")


def emit_ts(vo, path, engine="elevenlabs"):
    """Write the generated VO (with exact word times) as a TS module the shot imports."""
    how = {"elevenlabs": "the REAL ElevenLabs alignment", "edge": "Edge's real word boundaries",
           "kokoro": "derived from the Kokoro audio's own pauses"}.get(engine, engine)
    lines = ["// AUTO-GENERATED by tools/gen_voice.py — do not edit.",
             f"// Word times are {how}; captions + lip-sync follow them.",
             "import type { VoLine } from '../../lib/shorts';", "",
             "export const VO: VoLine[] = ["]
    for line in vo:
        esc = line["text"].replace("\\", "\\\\").replace("'", "\\'")
        ws = ", ".join(
            "{ w: '%s', start: %s, end: %s }" % (w["w"].replace("\\", "\\\\").replace("'", "\\'"), w["start"], w["end"])
            for w in line.get("words", []))
        spk = f"speaker: '{line['speaker']}', " if line.get("speaker") else ""
        lines.append(f"  {{ {spk}text: '{esc}', start: {line['start']}, end: {line['end']}, words: [{ws}] }},")
    lines += ["];", ""]
    body = "\n".join(lines)
    # only touch the file when it actually changed: an unchanged mtime is what lets
    # build_short.py skip a re-render (and Remotion's bundle cache stay warm)
    if os.path.exists(path) and open(path, encoding="utf-8").read() == body:
        return False
    with open(path, "w", encoding="utf-8") as f:
        f.write(body)
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--beats", help="path to the short's beats.json")
    ap.add_argument("--engine", choices=("elevenlabs", "edge", "kokoro"), default="elevenlabs",
                    help="elevenlabs (paid key) · edge = free Microsoft Neural TTS (online) · "
                         "kokoro = free LOCAL Kokoro-82M (setup: tools/setup_kokoro.py)")
    ap.add_argument("--voice", help=f"default: {DEFAULT_VOICE} (elevenlabs) / {EDGE_VOICE} (edge)")
    ap.add_argument("--model", default=DEFAULT_MODEL, help="elevenlabs only")
    ap.add_argument("--list-voices", action="store_true", help="list free Edge voices and exit")
    ap.add_argument("--rate", default="+0%", help="edge/kokoro: narration speed, e.g. +10%%")
    ap.add_argument("--mux", help="optional rendered mp4 to mux the voice onto (-voiced.mp4)")
    ap.add_argument("--emit-ts", help="write the VO (with exact word times) as a TS module, e.g. remotion/src/shots/short-2/vo.gen.ts")
    ap.add_argument("--jobs", type=int, default=4,
                    help="lines to synthesize in parallel (default 4; lower it if the API 429s)")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    if args.list_voices:
        list_edge_voices()
        return
    if not args.beats:
        ap.error("--beats is required")
    if not args.voice:
        args.voice = {"edge": EDGE_VOICE, "kokoro": KOKORO_VOICE}.get(args.engine, DEFAULT_VOICE)

    beats_path = os.path.abspath(args.beats)
    beats = json.load(open(beats_path, encoding="utf-8"))
    vo = beats["vo"]
    total = float(beats["format"]["durationSec"])
    vdir = os.path.join(os.path.dirname(beats_path), "voice")
    os.makedirs(vdir, exist_ok=True)

    key = load_env().get("ELEVENLABS_API_KEY")
    if args.engine == "elevenlabs" and not key and not args.dry_run:
        sys.exit("ELEVENLABS_API_KEY not found in .env  (or use --engine edge — free, no key)")

    # ── plan every line first, then generate the MISSING ones in parallel ────────────
    # TTS is ~3-12s of network per line; serially that is over a minute for a 13-line short.
    # Cache hits (unchanged text) cost nothing, so only genuine misses are dispatched.
    cast = beats.get("cast", {})

    def voice_of(line):
        """(voice, rate) for a line: its speaker's cast entry for this engine, else the defaults.
        A line with "lang": "fr" uses the speaker's "<engine>_fr" voice when the cast has one."""
        c = cast.get(line.get("speaker") or "", {})
        lg = line.get("lang")
        v = (lg and c.get(f"{args.engine}_{lg}")) or c.get(args.engine) or args.voice
        return v, c.get("rate", args.rate)

    def kokoro_extras(line):
        """(pitch semitones, lang, formant) — kokoro-only cast/line options for kid voices + French."""
        c = cast.get(line.get("speaker") or "", {})
        return float(c.get("pitch", 0) or 0), line.get("lang") or c.get("lang"), bool(c.get("formant", False))

    plan = []  # (i, line, start, window, tts_text, raw, fit)
    for i, line in enumerate(vo):
        start = float(line["start"])
        next_start = float(vo[i + 1]["start"]) if i + 1 < len(vo) else total - 0.3
        window = next_start - start - 0.05
        tts_text = line.get("tts", line["text"])  # optional tagged/phonetic variant for TTS
        voice, rate = voice_of(line)
        extra = ""
        if args.engine == "kokoro":
            pitch, lg, formant = kokoro_extras(line)
            extra = (f"|p{pitch}v2" if pitch else "") + (f"|{lg}" if lg else "") + ("|fm" if formant and pitch else "")
        h = hashlib.sha1(
            f"{args.engine}|{voice}|{args.model}|{rate}|{tts_text}{extra}".encode()).hexdigest()[:8]
        plan.append((i, line, start, window, tts_text,
                     os.path.join(vdir, f"line-{i:02d}-{h}.mp3"),
                     os.path.join(vdir, f"line-{i:02d}-{h}-fit.wav")))

    if args.dry_run:
        print(f"{'line':4s} {'start':>6s} {'window':>6s} {'clip':>6s} {'tempo':>5s}  text")
        for i, _line, start, window, tts_text, _raw, _fit in plan:
            print(f"{i:4d} {start:6.2f} {window:6.2f}      ?     ?  {tts_text}")
        return

    todo = [p for p in plan
            if args.force or not os.path.exists(p[5]) or not os.path.exists(p[5] + ".words.json")]
    if todo:
        def generate(p):
            i, line, _start, _window, tts_text, raw, _fit = p
            voice, rate = voice_of(line)
            if args.engine == "edge":
                tts_line_edge(voice, tts_text, raw, rate)
            elif args.engine == "kokoro":
                pitch, lg, formant = kokoro_extras(line)
                tts_line_kokoro(voice, tts_text, raw, rate, pitch, lg, formant)
            else:
                # neighbour context steers prosody — only stitch lines from the SAME speaker,
                # another character's line would bleed their delivery into this one
                def ctx(j):
                    ok = 0 <= j < len(vo) and vo[j].get("speaker") == line.get("speaker")
                    return vo[j].get("tts", vo[j]["text"]) if ok else None
                tts_line(key, voice, args.model, tts_text, ctx(i - 1), ctx(i + 1), raw)
            print(f"  generated line {i:02d}")

        t0 = time.time()
        print(f"generating {len(todo)}/{len(plan)} line(s) with {args.engine} "
              f"({min(args.jobs, len(todo))} at a time; {len(plan) - len(todo)} cached)")
        with ThreadPoolExecutor(max_workers=max(1, args.jobs)) as pool:
            list(pool.map(generate, todo))
        print(f"  TTS done in {time.time() - t0:.1f}s")

    fitted = []  # (path, start_sec, fitted_dur)
    print(f"{'line':4s} {'start':>6s} {'window':>6s} {'clip':>6s} {'tempo':>5s}  text")
    for i, line, start, window, tts_text, raw, fit in plan:
        dur = probe_duration(raw)
        tempo = 1.0
        if dur > window:
            tempo = min(MAX_ATEMPO, dur / window)
        if args.force or not os.path.exists(fit):
            run(["ffmpeg", "-y", "-v", "error", "-i", raw,
                 "-filter:a", f"atempo={tempo:.4f}", "-ar", "44100", "-ac", "2", fit])
        fdur = probe_duration(fit)
        overflow = " OVERFLOW" if fdur > window + 0.05 else ""
        print(f"{i:4d} {start:6.2f} {window:6.2f} {fdur:6.2f} {tempo:5.2f}  {line['text']}{overflow}")
        line["end"] = round(start + fdur, 2)
        # exact word times: raw alignment, scaled by the tempo fit, offset to global
        raw_words = json.load(open(raw + ".words.json", encoding="utf-8"))
        line["words"] = [{"w": w["w"],
                          "start": round(start + w["start"] / tempo, 3),
                          "end": round(start + w["end"] / tempo, 3)} for w in raw_words]
        fitted.append((fit, start, fdur))

    # assemble: delay each line to its start, sum (lines never overlap), pad to length
    voice_wav = os.path.join(vdir, "voice.wav")
    inputs, parts = [], []
    for j, (path, start, _d) in enumerate(fitted):
        inputs += ["-i", path]
        ms = int(round(start * 1000))
        parts.append(f"[{j}:a]adelay={ms}|{ms}[a{j}]")
    chain = "".join(f"[a{j}]" for j in range(len(fitted)))
    fc = ";".join(parts) + f";{chain}amix=inputs={len(fitted)}:normalize=0,apad,atrim=0:{total}," \
         f"loudnorm=I=-16:TP=-1.5:LRA=11[out]"
    run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", fc,
         "-map", "[out]", "-ar", "44100", "-ac", "2", voice_wav])
    print(f"voice track -> {os.path.relpath(voice_wav, ROOT)}")

    beats["voiceStatus"] = f"{args.engine}:{'cast' if cast else args.voice}"
    json.dump(beats, open(beats_path, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    print(f"actual line timings + word maps written back -> {os.path.relpath(beats_path, ROOT)}")

    if args.emit_ts:
        changed = emit_ts(vo, rp := os.path.abspath(args.emit_ts), args.engine)
        print(f"VO TS module -> {os.path.relpath(rp, ROOT)}" + ("" if changed else "  (unchanged)"))

    if args.mux:
        out = os.path.splitext(args.mux)[0] + "-voiced.mp4"
        run(["ffmpeg", "-y", "-v", "error", "-i", args.mux, "-i", voice_wav,
             "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
             "-t", str(total), out])
        print(f"voiced preview -> {os.path.relpath(out, ROOT)}")


if __name__ == "__main__":
    main()
