#!/usr/bin/env python3
"""
gen_kids_sounds.py — the Tiny Sparks ENERGY sound pack, made FREE and LOCAL (no API key, no network).

Big kids channels are never quiet: a channel jingle, bouncy music under everything and a cartoon sound on
every action. This tool synthesizes all of it from scratch (deterministic, seeded):
  · cartoon SFX (numpy): boing, slide whistle up/down, drum roll, cymbal crash, correct ding, sad trombone,
    uh-oh, pop, rubber stretch, whip whoosh, bonk, zip, kids applause, think tick-tock (120 bpm)
  · kids CROWD shouts (Kokoro voices layered, pitched up, spread in stereo): yay, oh no, wow, laugh
  · the "Tiny Sparks!" channel JINGLE (drum fill → big hit + kids shouting the name → sparkle → ta-da)
  · a bouncy 120 bpm THEME BED (written as a gen_song song.json and rendered by tools/gen_song.py)

Outputs (registered in the catalogs, so mix_sfx.py / mix_music.py find them by id):
  SFX + jingle → media/library/sfx/clips/<id>.mp3     (media/library/sfx/catalog.json)
  theme bed    → media/library/music/clips/tiny-sparks-bounce.mp3   (media/library/music/catalog.json)
Levels: every clip is matched to ≈ -20 dB active RMS (the library's ~-20 LUFS) with a -1.5 dBFS peak cap.

Usage:
  python tools/gen_kids_sounds.py                    # everything (crowd + jingle need Kokoro: tools/setup_kokoro.py)
  python tools/gen_kids_sounds.py --only cartoon-boing,kids-yay
  python tools/gen_kids_sounds.py --list
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from ffmpeg_path import ensure_on_path  # noqa: E402

ensure_on_path()

SR = 44100
SFX_DIR = os.path.join(ROOT, "media", "library", "sfx")
MUSIC_DIR = os.path.join(ROOT, "media", "library", "music")
THEME_DIR = os.path.join(ROOT, "kids-shorts", "tiny-sparks", "songs", "tiny-sparks-theme")
CACHE = os.path.join(ROOT, "tools", ".cache", "kids-sounds")
LICENSE = "original — synthesized locally by tools/gen_kids_sounds.py (no third-party samples)"
LICENSE_VOX = "original — synthesized locally by tools/gen_kids_sounds.py; voices: Kokoro-82M (Apache-2.0)"


# ─────────────────────────────── building blocks ─────────────────────────────────────────────────
def T(d):
    return np.arange(int(SR * d)) / SR


def noise(n, seed):
    return np.random.default_rng(seed).uniform(-1, 1, n)


def band(x, lo=None, hi=None, order=2):
    """Static band-limit via the FFT (no scipy): soft Butterworth-like edges."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    H = np.ones_like(f)
    if lo:
        H *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** (2 * order))
    if hi:
        H *= 1 / np.sqrt(1 + (f / hi) ** (2 * order))
    return np.fft.irfft(X * H, n=len(x))


def stereo(x):
    return x if x.ndim == 2 else np.vstack([x, x])


def place(buf, sig, at):
    """Add `sig` into `buf` at `at` seconds (mono or stereo, buf and sig must match)."""
    i = int(round(at * SR))
    if i < 0:
        sig = sig[..., -i:]
        i = 0
    n = buf.shape[-1]
    if i >= n:
        return
    j = min(n, i + sig.shape[-1])
    buf[..., i:j] += sig[..., : j - i]


def pan(mono, p):
    """Constant-power pan, p in [-1 (left), 1 (right)]."""
    a = (p + 1) * np.pi / 4
    return np.vstack([mono * np.cos(a), mono * np.sin(a)])


def conv(x, ir):
    n = len(x) + len(ir) - 1
    nfft = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(ir, nfft), nfft)[:n]


def reverb(x, size=0.4, mix=0.2, seed=11):
    """A small bright room: decaying filtered noise impulse, decorrelated per channel."""
    st = stereo(x)
    out = []
    for c in range(2):
        t = T(size)
        ir = band(noise(len(t), seed + c), 200, 7000) * np.exp(-t / (size / 5))
        ir[0] = 0
        wet = conv(st[c], ir)
        wet *= np.sqrt(np.mean(st[c] ** 2) + 1e-12) / (np.sqrt(np.mean(wet ** 2)) + 1e-12)
        dry = np.concatenate([st[c], np.zeros(len(wet) - st.shape[1])])
        out.append(dry + mix * wet)
    return np.vstack(out)


def fit_level(x, rms_db=-20.0, peak_db=-1.5):
    """Match the ACTIVE part (loud 50 ms windows) to rms_db, never letting the peak pass peak_db."""
    mono = x if x.ndim == 1 else x.mean(axis=0)
    w = int(SR * 0.05)
    k = max(1, len(mono) // w)
    win = np.sqrt(np.mean(mono[: k * w].reshape(k, w) ** 2, axis=1) + 1e-12)
    top = np.sort(win)[-max(1, int(k * 0.3)):]
    rms = float(np.mean(top))
    g = 10 ** (rms_db / 20) / max(rms, 1e-9)
    peak = float(np.max(np.abs(x))) * g
    cap = 10 ** (peak_db / 20)
    if peak > cap:
        g *= cap / peak
    return x * g


def fade_tail(x, secs=0.03):
    n = min(x.shape[-1], int(SR * secs))
    if n > 1:
        x[..., -n:] *= np.linspace(1, 0, n)
    return x


def lufs_of(x):
    """Integrated loudness (ffmpeg ebur128) of an array; None when the clip is too short to gate."""
    ch = 1 if x.ndim == 1 else 2
    pcm = (np.clip(x if ch == 1 else x.T, -1, 1) * 32767).astype(np.int16)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        wav = tmp.name
    with wave.open(wav, "wb") as w:
        w.setnchannels(ch)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", wav, "-af", "ebur128", "-f", "null", "-"],
                       capture_output=True, text=True)
    os.remove(wav)
    vals = [ln.split("I:")[1].split("LUFS")[0] for ln in r.stderr.splitlines() if ln.strip().startswith("I:")]
    try:
        v = float(vals[-1])
    except (IndexError, ValueError):
        return None
    return v if v > -69 else None


def match_lufs(x, target, peak_db=-1.5):
    """Loudness-match to `target` LUFS (2 passes), peak capped. Short clips keep the RMS match."""
    for _ in range(2):
        v = lufs_of(x)
        if v is None:
            return x
        g = 10 ** ((target - v) / 20)
        cap = 10 ** (peak_db / 20) / (float(np.max(np.abs(x))) + 1e-12)
        x = x * min(g, cap)
    return x


def write_mp3(path, x):
    x = fade_tail(np.array(x, dtype=np.float64))
    ch = 1 if x.ndim == 1 else 2
    pcm = (np.clip(x if ch == 1 else x.T, -1, 1) * 32767).astype(np.int16)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        wav = tmp.name
    with wave.open(wav, "wb") as w:
        w.setnchannels(ch)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    os.makedirs(os.path.dirname(path), exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-ar", str(SR), "-b:a", "192k", path], check=True)
    os.remove(wav)
    return x.shape[-1] / SR


# ─────────────────────────────── instruments ─────────────────────────────────────────────────────
def rel(y, ms=12):
    """Fade the last `ms` of a note buffer, so a still-ringing note never ends in a click."""
    n = min(len(y), int(SR * ms / 1000))
    if n > 1:
        y = y.copy()
        y[-n:] *= np.linspace(1, 0, n)
    return y


def snare(seed, d=0.16):
    t = T(d)
    return rel(band(noise(len(t), seed), 1200, 9000) * np.exp(-t / 0.045) * 0.8 + np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.025) * 0.5)


def kick(d=0.35):
    t = T(d)
    fr = 50 + 80 * np.exp(-t / 0.035)
    return rel(np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.13))


def bell(f, d=1.3, idx=3.0):
    t = T(d)
    I = idx * np.exp(-t / 0.12)
    y = np.sin(2 * np.pi * f * t + I * np.sin(2 * np.pi * 3.5 * f * t)) * np.exp(-t / 0.5)
    y += 0.25 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / 0.18)
    return rel(y * np.minimum(1, t / 0.002), 30)


def marimba(f, d=0.6):
    t = T(d)
    y = (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.22) + 0.3 * np.sin(2 * np.pi * 3.99 * f * t) * np.exp(-t / 0.045)
         + 0.1 * np.sin(2 * np.pi * 9.9 * f * t) * np.exp(-t / 0.012))
    return rel(y * np.minimum(1, t / 0.0015), 25)


def brass(f, d, vib=False, wah=True):
    """Additive brass: the harmonic tilt opens and closes over the note (the trombone 'wah')."""
    t = T(d)
    fv = np.full_like(t, f)  # an ARRAY even without vibrato: cumsum of a scalar is one sample (a DC thump)
    if vib:
        fv *= 1 + 0.03 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.35)
    ph = 2 * np.pi * np.cumsum(fv) / SR
    if vib:
        b = 0.55 + 0.45 * np.minimum(1, t / 0.3) * np.exp(-t / 1.4)
    elif wah:
        b = np.sin(np.pi * np.minimum(1, t / (d * 0.9))) ** 0.7
    else:
        b = np.full_like(t, 0.8)
    y = np.zeros_like(t)
    for k in range(1, 16):
        y += np.exp(-(k - 1) * (1.0 - 0.82 * b)) / k ** 0.5 * np.sin(k * ph)
    return y * np.minimum(1, t / 0.03) * np.clip((d - t) / 0.08, 0, 1) * 0.25


def woodblock(f, d=0.12):
    t = T(d)
    return rel((np.sin(2 * np.pi * f * t) * np.exp(-t / 0.03) + 0.3 * np.sin(2 * np.pi * 2.6 * f * t) * np.exp(-t / 0.012)) * np.minimum(1, t / 0.0008))


def shaker(seed, d=0.07):
    t = T(d)
    return band(noise(len(t), seed), 4000, 12000) * np.exp(-t / 0.018)


def clap1(seed, bright):
    t = T(0.05)
    return band(noise(len(t), seed), 700 + bright * 900, 9000) * np.exp(-t / 0.011)


# ─────────────────────────────── the cartoon SFX ─────────────────────────────────────────────────
def s_boing():
    t = T(0.8)
    f = 200 * (1 + 0.5 * np.minimum(1, t / 0.6))
    vib = 1 + 0.42 * np.exp(-t / 0.25) * np.sin(2 * np.pi * 13 * t)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    y = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.22 * np.sin(3 * ph) + 0.1 * np.sin(4 * ph)
    env = np.minimum(1, t / 0.004) * np.exp(-t / 0.32)
    thud = np.sin(2 * np.pi * np.cumsum(80 + 60 * np.exp(-t / 0.03)) / SR) * np.exp(-t / 0.06)
    return y * env * 0.55 + thud * 0.7


def _slide(f0, f1, d=0.6, seed=1):
    t = T(d)
    f = f0 * (f1 / f0) ** ((t / d) ** 1.1) * (1 + 0.01 * np.sin(2 * np.pi * 7 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) + 0.15 * np.sin(2 * ph) + 0.05 * np.sin(3 * ph)
    breath = band(noise(len(t), seed), 2000, 7000) * 0.06
    return (y * 0.8 + breath) * np.minimum(1, t / 0.035) * np.clip((d - t) / 0.07, 0, 1)


def s_slide_up():
    return _slide(480, 1500, 0.6, 1)


def s_slide_down():
    return _slide(1400, 420, 0.65, 2)


def s_drum_roll():
    d = 1.6
    buf = np.zeros(int(SR * (d + 0.3)))
    rng = np.random.default_rng(5)
    n = int(d * 24)
    for i in range(n):
        a = 0.3 + 0.7 * (i / n) ** 1.6
        place(buf, snare(100 + i) * a * rng.uniform(0.85, 1), max(0.0, i / 24 + rng.uniform(-0.003, 0.003)))
    place(buf, snare(999) * 1.2, d)
    return buf


def s_cymbal():
    d = 2.2
    t = T(d)
    metal = sum(np.sin(2 * np.pi * f * t + p) * np.exp(-t / dec) for f, p, dec in
                [(3150, 0, 0.7), (4270, 1, 0.6), (5530, 2, 0.5), (7210, 3, 0.4), (8890, 4, 0.35)]) * 0.08
    att = np.minimum(1, t / 0.002)
    ch = [(band(noise(len(t), 21 + c), 3000, 15000) * np.exp(-t / 0.55) + metal) * att for c in range(2)]
    return np.vstack(ch) * 0.7


def s_ding():
    buf = np.zeros(int(SR * 1.6))
    place(buf, bell(1046.5) * 0.6, 0)
    place(buf, bell(1568.0) * 0.7, 0.11)
    for f, at in [(3136, 0.2), (4186, 0.27), (3520, 0.33)]:
        place(buf, bell(f, 0.4) * 0.12, at)
    return buf


def s_sad_trombone():
    buf = np.zeros(int(SR * 2.9))
    at = 0.0
    for i, (f, d) in enumerate([(233.08, 0.42), (220.0, 0.42), (207.65, 0.42), (196.0, 1.15)]):
        place(buf, brass(f, d, vib=(i == 3)), at)
        at += d + 0.05
    return buf


def s_uh_oh():
    buf = np.zeros(int(SR * 0.95))
    place(buf, marimba(783.99) * 0.8, 0)
    place(buf, marimba(659.25) * 0.95, 0.22)
    return buf


def s_pop():
    t = T(0.2)
    f = 300 + 1500 * (1 - np.exp(-t / 0.025))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.045) * np.minimum(1, t / 0.001)
    return y + noise(len(t), 3) * np.exp(-t / 0.0015) * 0.35


def s_rubber():
    d = 0.7
    t = T(d)
    jit = band(noise(len(t), 9), None, 25)
    jit /= np.max(np.abs(jit))
    f = 240 * 3.4 ** (t / d) * (1 + 0.05 * jit)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = sum(np.sin(k * ph) / k ** 1.2 for k in range(1, 9))
    return y * (1 + 0.45 * np.sin(2 * np.pi * 31 * t)) * np.minimum(1, t / 0.03) * np.clip((d - t) / 0.05, 0, 1) * 0.35


def s_whip():
    d = 0.45
    t = T(d)
    nz = band(noise(len(t), 12), 600, 8000)
    env = np.where(t < 0.13, (t / 0.13) ** 2, np.exp(-(t - 0.13) / 0.07))
    tone = np.sin(2 * np.pi * np.cumsum(700 * 3.2 ** (t / d)) / SR) * 0.12
    y = (nz * 0.9 + tone) * env
    p = np.clip(t / d * 2 - 1, -1, 1)
    return np.vstack([y * np.cos((p + 1) * np.pi / 4), y * np.sin((p + 1) * np.pi / 4)])


def s_bonk():
    t = T(0.4)
    wood = (np.sin(2 * np.pi * np.cumsum(820 * (1 - 0.15 * t)) / SR) * np.exp(-t / 0.05)
            + 0.4 * np.sin(2 * np.pi * 1960 * t) * np.exp(-t / 0.02))
    thud = np.sin(2 * np.pi * np.cumsum(150 - 50 * t) / SR) * np.exp(-t / 0.08)
    return (wood * 0.6 + thud * 0.8) * np.minimum(1, t / 0.001)


def s_zip():
    d = 0.26
    t = T(d)
    ph = 2 * np.pi * np.cumsum(350 * 7 ** (t / d)) / SR
    am = 0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 65 * t))
    return np.sin(ph) * am * np.minimum(1, t / 0.01) * np.clip((d - t) / 0.04, 0, 1) * 0.6


def s_applause():
    d = 2.6
    n = int(SR * (d + 0.2))
    buf = np.zeros((2, n))
    rng = np.random.default_rng(31)
    tt = 0.0
    while True:
        dens = 30 * min(1, tt / 0.15 + 0.05) * (1 if tt < d - 0.8 else max(0.0, (d - tt) / 0.8))
        tt += rng.exponential(1 / max(dens, 1))
        if tt >= d:
            break
        c = clap1(int(rng.integers(1_000_000)), rng.uniform(0, 1)) * rng.uniform(0.4, 1)
        place(buf, pan(c, rng.uniform(-0.8, 0.8)), tt)
    return reverb(buf, 0.35, 0.18)


def s_think_tick():
    """Tick-tock woodblock on every beat + soft 8th shakers, 120 bpm, 4 s — sits ON the theme bed's grid
    (start it on a bed beat). Fills a 'your turn' pause with rhythm instead of silence."""
    spb = 0.5
    buf = np.zeros(int(SR * 4.3))
    for i in range(8):
        place(buf, woodblock(1500 if i % 2 == 0 else 1100) * 0.7, i * spb)
        place(buf, shaker(50 + i) * 0.25, i * spb + spb / 2)
    return buf


def s_stomp():
    """A big friendly dinosaur footstep: a soft low thump + a muffled thud + a short rumble tail."""
    t = T(0.9)
    f = 34 + 46 * np.exp(-t / 0.06)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22)
    thud = band(noise(len(t), 77), hi=420) * np.exp(-t / 0.05) * 1.4
    rumble = band(noise(len(t), 78), lo=30, hi=160) * np.exp(-t / 0.35) * 0.5
    return rel((boom + thud + rumble) * np.minimum(1, t / 0.004), 40)


def s_egg_crack():
    """An egg cracking: three crisp shell crackles + tiny clicks, 0.45 s."""
    buf = np.zeros(int(SR * 0.45))
    rng = np.random.default_rng(91)
    for i, at in enumerate([0.0, 0.11, 0.19]):
        n = int(SR * (0.03 + 0.01 * i))
        tt = np.arange(n) / SR
        burst = band(noise(n, 92 + i), lo=1800, hi=7000) * np.exp(-tt / 0.012) * (1.0 - i * 0.15)
        place(buf, burst, at)
    for _ in range(9):
        n = int(SR * 0.006)
        place(buf, band(noise(n, int(rng.integers(1000))), lo=3000, hi=9000) * 0.35, float(rng.uniform(0.02, 0.4)))
    return buf


# ─────────────────────────────── kids crowd (Kokoro) ─────────────────────────────────────────────
VOICES = ["af_sky", "af_nicole", "af_nova", "af_jessica", "bf_lily", "am_puck", "af_bella", "af_kore", "af_river", "bf_alice"]


def kokoro_wav(voice, text, rate):
    import hashlib
    import gen_voice  # the shared Kokoro engine (tools/gen_voice.py)
    os.makedirs(CACHE, exist_ok=True)
    h = hashlib.sha1(f"{voice}|{rate}|{text}".encode()).hexdigest()[:10]
    mp3 = os.path.join(CACHE, f"{h}.mp3")
    wav = mp3[:-4] + ".wav"
    if not os.path.exists(wav):
        if not os.path.exists(mp3):
            gen_voice.tts_line_kokoro(voice, text, mp3, rate, 0)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", mp3, "-ac", "1", "-ar", str(SR), wav], check=True)
    with wave.open(wav, "rb") as w:
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    nz = np.nonzero(np.abs(x) > 0.01)[0]  # trim the silence around the shout
    return x[max(0, nz[0] - 200): nz[-1] + 2000] if len(nz) else x


def crowd(text, n=8, seed=1, spread=0.09, pitch=(1.12, 1.3), rates=("+0%", "+6%", "-4%")):
    """A group of kids shouting `text`: each voice pitched up (resampled → brighter, smaller), offset a
    little in time, spread across the stereo field, in a small bright room."""
    rng = np.random.default_rng(seed)
    parts = []
    for v in VOICES[:n]:
        x = kokoro_wav(v, text, str(rng.choice(rates)))
        r = rng.uniform(*pitch)
        x = np.interp(np.arange(0, len(x) - 1, r), np.arange(len(x)), x)
        parts.append((x, rng.uniform(0, spread), rng.uniform(-0.85, 0.85), rng.uniform(0.7, 1.0)))
    total = max(len(p[0]) + int(p[1] * SR) for p in parts) + SR // 4
    buf = np.zeros((2, total))
    for x, off, p, g in parts:
        place(buf, pan(x / (np.max(np.abs(x)) + 1e-9) * g, p), off)
    return reverb(buf, 0.35, 0.22, seed=seed + 40)


def s_kids_yay():
    return crowd("Yay!", seed=1)


def s_kids_ohno():
    return crowd("Oh no!", seed=2)


def s_kids_wow():
    return crowd("Wow!", seed=3)


def s_kids_laugh():
    return crowd("Ha ha ha!", seed=4, spread=0.14)


# ─────────────────────────────── the channel jingle ─────────────────────────────────────────────
JINGLE_SHOUT = 0.47  # seconds: when the kids shout "Tiny Sparks!" (the intro animation syncs to this)


def s_jingle():
    d = 3.7
    buf = np.zeros((2, int(SR * d)))
    for i, a in enumerate([0.45, 0.6, 0.8, 1.0]):  # drum fill
        place(buf, stereo(snare(400 + i) * a * 0.9), i * 0.11)
    hit = 0.45
    place(buf, stereo(kick() * 1.1), hit)
    place(buf, s_cymbal() * 0.55, hit)
    chord = sum(brass(f, 0.6, wah=False) for f in (261.63, 329.63, 392.0, 523.25))
    place(buf, pan(chord * 0.38, -0.15), hit)  # under the kids' shout
    shout = crowd("Tiny Sparks!", n=9, seed=7, spread=0.06)
    place(buf, shout / (np.max(np.abs(shout)) + 1e-9) * 0.95, JINGLE_SHOUT)
    for k, (f, at) in enumerate([(1046.5, 1.3), (1318.5, 1.38), (1568.0, 1.46), (2093.0, 1.54)]):  # sparkle up
        place(buf, pan(bell(f, 0.7) * 0.3, -0.5 + k * 0.33), at)
    g = sum(brass(f, 0.2, wah=False) for f in (196.0, 246.94, 293.66))  # ta-da: G → C
    place(buf, stereo(g * 0.5), 1.8)
    c = sum(brass(f, 1.3, vib=True) for f in (261.63, 329.63, 392.0, 523.25))
    place(buf, stereo(c * 0.5), 2.05)
    place(buf, stereo(kick() * 0.9), 2.05)
    place(buf, s_cymbal() * 0.45, 2.05)
    for f, at in [(3136, 2.15), (4186, 2.25), (3520, 2.33)]:
        place(buf, stereo(bell(f, 0.5) * 0.1), at)
    return buf


# ─────────────────────────────── registry ────────────────────────────────────────────────────────
SFX = {
    "cartoon-boing": (s_boing, "cartoon", ["boing", "spring", "jump", "bounce", "hop", "cartoon", "kids"], "cartoon spring boing for hops and bounces, 0.8 s", False),
    "slide-whistle-up": (s_slide_up, "cartoon", ["slide-whistle", "up", "jump", "rise", "cartoon", "kids"], "slide whistle gliding up — jumps, lifts, surprises, 0.6 s", False),
    "slide-whistle-down": (s_slide_down, "cartoon", ["slide-whistle", "down", "fall", "drop", "cartoon", "kids"], "slide whistle gliding down — falls, oops, 0.65 s", False),
    "drum-roll": (s_drum_roll, "cartoon", ["drum-roll", "snare", "build", "reveal", "suspense", "kids"], "snare drum roll crescendo with a final accent — before a reveal, 1.9 s", False),
    "cymbal-crash": (s_cymbal, "cartoon", ["cymbal", "crash", "reveal", "hit", "ta-da", "kids"], "bright cymbal crash — the reveal after a drum roll, 2.2 s", False),
    "ding-correct": (s_ding, "reward", ["ding", "correct", "right-answer", "bell", "reward", "kids"], "two bright bell notes + glints — the right answer, 1.6 s", False),
    "sad-trombone": (s_sad_trombone, "cartoon", ["sad-trombone", "wah-wah", "fail", "oops", "funny", "kids"], "wah-wah-wah-waaah sad trombone — a funny oops, 2.9 s", False),
    "uh-oh": (s_uh_oh, "cartoon", ["uh-oh", "oops", "marimba", "problem", "kids"], "two-note marimba 'uh-oh' — a small problem, 0.95 s", False),
    "cartoon-pop": (s_pop, "cartoon", ["pop", "bloop", "appear", "pop-in", "cartoon", "kids"], "bubbly cartoon pop — something pops in, 0.2 s", False),
    "rubber-stretch": (s_rubber, "cartoon", ["stretch", "rubber", "squeak", "pull", "strain", "cartoon", "kids"], "squeaky rubber stretch — pulling, straining, 0.7 s", False),
    "whip-whoosh": (s_whip, "motion", ["whoosh", "whip", "swish", "fast", "transition", "camera", "kids"], "fast whip whoosh panning left to right — whip pans and dashes, 0.45 s", False),
    "bonk": (s_bonk, "cartoon", ["bonk", "bump", "hit", "wood", "thud", "cartoon", "kids"], "cartoon bonk — a bump on the head or a jar hitting the ground, 0.4 s", False),
    "zip-up": (s_zip, "cartoon", ["zip", "zoom", "fast", "rise", "cartoon", "kids"], "quick rising zip — zooms and fast moves, 0.26 s", False),
    "kids-applause": (s_applause, "crowd", ["applause", "clapping", "celebrate", "kids", "crowd"], "kids clapping in a small room — celebrations, 2.8 s", False),
    "dino-stomp": (s_stomp, "impact", ["stomp", "footstep", "dinosaur", "thud", "big", "kids"], "a big friendly dinosaur footstep: soft low thump + muffled thud, 0.9 s", False),
    "egg-crack": (s_egg_crack, "foley", ["egg", "crack", "hatch", "shell", "kids"], "an egg cracking: three crisp shell crackles + tiny clicks, 0.45 s", False),
    "think-tick": (s_think_tick, "rhythm", ["tick-tock", "woodblock", "think", "pause", "your-turn", "120bpm", "kids"], "tick-tock woodblock + shakers at 120 bpm for 4 s — fills a 'your turn' pause (start on a theme-bed beat)", False),
    "kids-yay": (s_kids_yay, "crowd", ["yay", "cheer", "crowd", "kids", "celebrate", "voices"], "a group of kids cheering 'Yay!'", True),
    "kids-ohno": (s_kids_ohno, "crowd", ["oh-no", "crowd", "kids", "surprise", "voices"], "a group of kids gasping 'Oh no!'", True),
    "kids-wow": (s_kids_wow, "crowd", ["wow", "crowd", "kids", "amazed", "voices"], "a group of kids going 'Wow!'", True),
    "kids-laugh": (s_kids_laugh, "crowd", ["laugh", "giggle", "crowd", "kids", "funny", "voices"], "a group of kids laughing 'Ha ha ha!'", True),
    "tiny-sparks-jingle": (s_jingle, "sting", ["jingle", "intro", "logo", "channel", "tiny-sparks", "kids", "sting"],
                           f"the Tiny Sparks channel jingle: drum fill → hit + kids shout 'Tiny Sparks!' at {JINGLE_SHOUT}s → sparkle → ta-da, 3.7 s", True),
}
RMS = {"tiny-sparks-jingle": -16.0, "cymbal-crash": -24.0, "kids-applause": -22.0, "think-tick": -22.0, "drum-roll": -22.0}


def update_catalog(path, entries):
    cat = json.load(open(path, encoding="utf-8"))
    clips = cat.setdefault("clips", [])
    for e in entries:
        old = next((c for c in clips if c.get("id") == e["id"]), None)
        if old:
            e["used_in"] = old.get("used_in", [])
            clips[clips.index(old)] = e
        else:
            clips.append(e)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(cat, f, indent=1, ensure_ascii=False)
        f.write("\n")


# ─────────────────────────────── the theme bed (via gen_song) ────────────────────────────────────
THEME = {
    "title": "Tiny Sparks Theme — Bounce (bed, Tiny Sparks original)",
    "bpm": 120, "beatsPerBar": 4, "introBars": 0, "outroBars": 0,
    "instruments": {"lead": "xylophone", "chords": "ukulele", "bass": True, "drums": "soft"},
    "sections": {
        "A": {"chords": "C | G | Am | F | C | G | F G | C",
              "melody": "G4:1 E4:0.5 G4:0.5 C5:1 E5:1 | D5:1 B4:0.5 G4:0.5 D5:2 | C5:1 A4:0.5 C5:0.5 E5:1 C5:1 | F4:0.5 A4:0.5 C5:1 A4:2 | "
                        "G4:1 E4:0.5 G4:0.5 C5:1 E5:1 | D5:0.5 E5:0.5 D5:0.5 B4:0.5 G4:2 | A4:0.5 C5:0.5 F5:1 G4:0.5 B4:0.5 D5:1 | C5:2 R:2"},
        "B": {"chords": "Am | F | C | G | Am | F | G | G",
              "melody": "E5:1 C5:1 A4:2 | F4:1 A4:1 C5:2 | E5:0.5 D5:0.5 C5:1 G4:2 | B4:1 D5:1 G5:2 | "
                        "E5:1 C5:1 A4:1 C5:1 | F5:1 E5:1 C5:2 | D5:1 E5:1 F5:1 D5:1 | G5:2 R:2"},
    },
    "form": ["A", "B", "A", "B"],
}


def make_bed():
    os.makedirs(THEME_DIR, exist_ok=True)
    sj = os.path.join(THEME_DIR, "song.json")
    with open(sj, "w", encoding="utf-8") as f:
        json.dump(THEME, f, indent=1)
    subprocess.run([sys.executable, os.path.join(HERE, "gen_song.py"), sj], check=True)
    out = os.path.join(MUSIC_DIR, "clips", "tiny-sparks-bounce.mp3")
    secs = 32 * 4 * 60 / THEME["bpm"]  # exactly 32 bars → loops seamlessly (ends on G, loops to C)
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", os.path.join(THEME_DIR, "instrumental.wav"),
                          "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.float32).astype(np.float64).reshape(-1, 2).T
    n = int(round(secs * SR))
    tail = x[:, n:]
    x = x[:, :n].copy()
    x[:, :tail.shape[1]] += tail[:, :n]  # wrap the ringing tail onto the head: the loop seam has no click
    m = int(0.004 * SR)  # + 4 ms half-cosine edges: the lossy codec can't join a sample step cleanly
    edge = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, m))
    x[:, :m] *= edge
    x[:, -m:] *= edge[::-1]
    x = match_lufs(x, -20.0)
    pcm = (np.clip(x.T, -1, 1) * 32767).astype(np.int16)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        wav = tmp.name
    with wave.open(wav, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-b:a", "192k", out], check=True)
    os.remove(wav)
    lufs = lufs_of(x)
    update_catalog(os.path.join(MUSIC_DIR, "catalog.json"), [{
        "id": "tiny-sparks-bounce", "file": "clips/tiny-sparks-bounce.mp3", "category": "kids",
        "tags": ["kids", "bouncy", "happy", "upbeat", "120bpm", "xylophone", "ukulele", "claps", "tiny-sparks", "theme", "bed", "loop"],
        "duration_s": round(secs, 3), "loudness_lufs": round(lufs, 1), "source": "local synth (tools/gen_song.py via tools/gen_kids_sounds.py)",
        "license": LICENSE, "desc": "The Tiny Sparks theme, bouncy bed: 120 bpm, xylophone lead, ukulele, bass, kick/clap/shaker. "
        "32 bars (64 s), loops seamlessly. Beats every 0.5 s from the bed start (think-tick sits on that grid).",
        "used_in": []}])
    print(f"  tiny-sparks-bounce  -> media/library/music/clips/tiny-sparks-bounce.mp3 ({secs:.1f}s)")


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--only", help="comma list of ids (SFX ids, or 'tiny-sparks-bounce' for the bed)")
    ap.add_argument("--list", action="store_true")
    args = ap.parse_args()
    if args.list:
        for k, v in SFX.items():
            print(f"  {k:20s} {v[3]}")
        print("  tiny-sparks-bounce   the theme bed (music library)")
        return
    only = set(args.only.split(",")) if args.only else None
    entries = []
    for sid, (fn, cat, tags, desc, vox) in SFX.items():
        if only and sid not in only:
            continue
        x = match_lufs(fit_level(fn(), RMS.get(sid, -20.0)), RMS.get(sid, -20.0))
        dur = write_mp3(os.path.join(SFX_DIR, "clips", f"{sid}.mp3"), x)
        entries.append({"id": sid, "file": f"clips/{sid}.mp3", "category": cat, "tags": tags, "desc": desc,
                        "duration_s": round(dur, 2), "loudness_lufs": RMS.get(sid, -20.0),
                        "source": "local synth (tools/gen_kids_sounds.py)" + (" + Kokoro-82M voices" if vox else ""),
                        "license": LICENSE_VOX if vox else LICENSE, "used_in": []})
        print(f"  {sid:20s} -> media/library/sfx/clips/{sid}.mp3 ({dur:.2f}s)")
    if entries:
        update_catalog(os.path.join(SFX_DIR, "catalog.json"), entries)
    if not only or "tiny-sparks-bounce" in only:
        make_bed()


if __name__ == "__main__":
    main()
