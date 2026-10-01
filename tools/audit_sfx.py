#!/usr/bin/env python3
"""
audit_sfx.py — MEASURE whether each SFX cue actually lands, instead of hoping.

Two different measurements are needed and mixing them up wastes a pass (short-16's lesson):

  * a cue under SPEECH — compare the mixed track against the voice-only preview in the SAME
    window. +1.5..+2.5 dB is felt-not-heard and correct; +3 dB means the cue equals the voice;
    ~0 dB means it is inaudible and should be re-gained or cut.
  * a cue in a word GAP — that ratio explodes (the baseline is near-silence) and means nothing.
    There the number that matters is ABSOLUTE dBFS against the voice's own level: brand 7 forbids
    anything louder than the narration, including in the silences.

Windows are matched to the cue: ~0.30s for a transient, and a riser is measured over its FINAL
third, because that is where its energy is.

  python tools/audit_sfx.py shorts/short-17-screen/sfx-plan.json
"""
import json
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import ffmpeg_path

FF = ffmpeg_path.find("ffmpeg") or "ffmpeg"

# how long a window each sound wants, and where in the cue it sits
WIN = {"riser": (1.36, 0.45, "final third"), "clock": (2.20, 2.20, "whole clip"),
       "reverse": (0.88, 0.30, "final third")}
DEFAULT_WIN = 0.30


def rms_db(path, start, dur):
    out = subprocess.run(
        [FF, "-hide_banner", "-nostats", "-ss", f"{start:.3f}", "-t", f"{dur:.3f}", "-i", str(path),
         "-af", "astats=metadata=1:reset=0", "-f", "null", "-"],
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
    ).stdout
    rms = [float(m) for m in re.findall(r"RMS level dB:\s*(-?\d+\.?\d*)", out)]
    pk = [float(m) for m in re.findall(r"Peak level dB:\s*(-?\d+\.?\d*)", out)]
    return (max(rms) if rms else -120.0, max(pk) if pk else -120.0)


def main():
    plan = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    voiced = Path(plan["render"]["preview"])
    mixed = Path(plan["render"]["out"])

    # The voice's own working level, measured over a continuously-narrated stretch. The
    # window MUST fall inside ONE line: straddling a line end mixes silence into the
    # reference, reads ~10 dB low, and then every cue in a gap is flagged LOUDER THAN
    # VOICE when it is not (short-23, where 25.6-27.1 is 27% silence and read -29.8
    # against a true -19.0). Override with --ref-at when 25.6 is not continuous speech.
    ref_at = 25.6
    for _i, _a in enumerate(sys.argv):
        if _a == '--ref-at' and _i + 1 < len(sys.argv):
            ref_at = float(sys.argv[_i + 1])
    ref = rms_db(voiced, ref_at, 1.5)[0]
    print(f"voice reference level ({ref_at:.1f}-{ref_at + 1.5:.1f}s, continuous speech): {ref:6.1f} dBFS" + chr(10))
    print(f"{'at_s':>6} {'sfx_id':<17}{'gain':>5}  {'window':>12}  {'voice':>7} {'mixed':>7} {'delta':>7} {'dPeak':>7}  verdict")

    rows = []
    for e in plan["events"]:
        sid, at, gain = e["sfx_id"], e["at_s"], e["gain_db"]
        kind = next((k for k in ("riser", "clock", "reverse") if k in sid), None)
        if kind:
            clip, dur, label = WIN[kind]
            start = at + clip - dur
        else:
            start, dur, label = at, DEFAULT_WIN, "0.30s"
        v, vpk = rms_db(voiced, start, dur)
        m, mpk = rms_db(mixed, start, dur)
        d = m - v
        dpk = mpk - vpk  # what the cue adds to the PEAK — the only thing a click has
        gap = v < ref - 10  # near-silence (or a word's decay tail) => judge absolutely, not by delta
        # TWO rules, and using the wrong one wastes a pass (short-16). Under SPEECH the voice
        # level varies line to line, so a fixed reference is meaningless and the DELTA is the
        # measurement: +1.5..2.5 dB is felt-not-heard, ~+3 means the cue equals the voice.
        # In a word GAP the delta explodes against near-silence, and only the ABSOLUTE level
        # against the voice's own working level says whether brand 7 is being broken.
        over = m - ref
        if gap:
            verdict = f"GAP {over:+5.1f} vs voice  " + ("*** LOUDER THAN VOICE ***" if over > 0 else "ok")
        elif d < 0.8:
            # A click is nothing but transient: it can add 5 dB of peak and 0.3 dB of RMS.
            # Calling that inaudible is how a stab gets shipped (short-17's lesson).
            verdict = (f"    {dpk:+5.1f} peak         ok (transient)" if dpk > 2.0
                       else f"    {d:+5.1f} delta        INAUDIBLE")
        elif d <= 3.0:
            verdict = f"    {d:+5.1f} delta        ok (felt-not-heard)"
        else:
            verdict = f"    {d:+5.1f} delta        *** LOUDER THAN VOICE ***"
        rows.append((at, sid, gain, d, gap, verdict))
        print(f"{at:6.2f} {sid:<17}{gain:>4}dB  {label:>12}  {v:7.1f} {m:7.1f} {d:+7.1f} {dpk:+7.1f}  {verdict}")

    lo = subprocess.run(
        [FF, "-hide_banner", "-nostats", "-i", str(mixed), "-af",
         "loudnorm=I=-15:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
    ).stdout
    j = re.search(r"\{[^{}]*input_i[^{}]*\}", lo, re.S)
    if j:
        d = json.loads(j.group(0))
        print(f"\nprogramme: {float(d['input_i']):.1f} LUFS   true peak {float(d['input_tp']):.1f} dBTP")


if __name__ == "__main__":
    main()
