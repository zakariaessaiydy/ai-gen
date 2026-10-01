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


def list_edge_voices(prefix="en-"):
    import asyncio
    try:
        import edge_tts
    except ImportError:
        sys.exit("--list-voices needs the edge-tts package:  pip install edge-tts")
    for v in asyncio.run(edge_tts.list_voices()):
        if v["ShortName"].startswith(prefix):
            print(f"  {v['ShortName']:<40s} {v['Gender']:<7s} {v.get('FriendlyName', '')}")


def emit_ts(vo, path):
    """Write the generated VO (with exact word times) as a TS module the shot imports."""
    lines = ["// AUTO-GENERATED by tools/gen_voice.py — do not edit.",
             "// Word times are the REAL ElevenLabs alignment; captions sync exactly.",
             "import type { VoLine } from '../../lib/shorts';", "",
             "export const VO: VoLine[] = ["]
    for line in vo:
        esc = line["text"].replace("\\", "\\\\").replace("'", "\\'")
        ws = ", ".join(
            "{ w: '%s', start: %s, end: %s }" % (w["w"].replace("\\", "\\\\").replace("'", "\\'"), w["start"], w["end"])
            for w in line.get("words", []))
        lines.append(f"  {{ text: '{esc}', start: {line['start']}, end: {line['end']}, words: [{ws}] }},")
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
    ap.add_argument("--engine", choices=("elevenlabs", "edge"), default="elevenlabs",
                    help="elevenlabs (paid key) or edge = free Microsoft Neural TTS, no key")
    ap.add_argument("--voice", help=f"default: {DEFAULT_VOICE} (elevenlabs) / {EDGE_VOICE} (edge)")
    ap.add_argument("--model", default=DEFAULT_MODEL, help="elevenlabs only")
    ap.add_argument("--list-voices", action="store_true", help="list free Edge voices and exit")
    ap.add_argument("--rate", default="+0%", help="edge only: narration speed, e.g. +10%%")
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
        args.voice = EDGE_VOICE if args.engine == "edge" else DEFAULT_VOICE

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
    plan = []  # (i, line, start, window, tts_text, raw, fit)
    for i, line in enumerate(vo):
        start = float(line["start"])
        next_start = float(vo[i + 1]["start"]) if i + 1 < len(vo) else total - 0.3
        window = next_start - start - 0.05
        tts_text = line.get("tts", line["text"])  # optional tagged/phonetic variant for TTS
        h = hashlib.sha1(
            f"{args.engine}|{args.voice}|{args.model}|{args.rate}|{tts_text}".encode()).hexdigest()[:8]
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
            i, _line, _start, _window, tts_text, raw, _fit = p
            if args.engine == "edge":
                tts_line_edge(args.voice, tts_text, raw, args.rate)
            else:
                prev_text = vo[i - 1].get("tts", vo[i - 1]["text"]) if i > 0 else None
                next_text = vo[i + 1].get("tts", vo[i + 1]["text"]) if i + 1 < len(vo) else None
                tts_line(key, args.voice, args.model, tts_text, prev_text, next_text, raw)
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

    beats["voiceStatus"] = f"{args.engine}:{args.voice}"
    json.dump(beats, open(beats_path, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    print(f"actual line timings + word maps written back -> {os.path.relpath(beats_path, ROOT)}")

    if args.emit_ts:
        changed = emit_ts(vo, rp := os.path.abspath(args.emit_ts))
        print(f"VO TS module -> {os.path.relpath(rp, ROOT)}" + ("" if changed else "  (unchanged)"))

    if args.mux:
        out = os.path.splitext(args.mux)[0] + "-voiced.mp4"
        run(["ffmpeg", "-y", "-v", "error", "-i", args.mux, "-i", voice_wav,
             "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
             "-t", str(total), out])
        print(f"voiced preview -> {os.path.relpath(out, ROOT)}")


if __name__ == "__main__":
    main()
