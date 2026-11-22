"""
setup_kokoro.py — one-time install of the FREE local voice engine (gen_voice.py --engine kokoro).

Kokoro-82M (Apache-2.0) is the best open TTS model of its size: natural, 50+ voices, runs on a
plain CPU, no API key, no quota, no network at synthesis time. Its weights normally live on
Hugging Face; this script fetches them from the npm registry instead (reachable from locked-down
networks where Hugging Face is not):

  kokoro-q8-shards@1.0.0  model_quantized.onnx (q8, 92MB) in 6 byte-identical shards
  kokoro-js@1.2.1         the official voice style vectors (voices/*.bin)

and writes, under tools/kokoro/ (gitignored):
  kokoro-v1.0.q8.onnx     the joined model (sha256-verified)
  voices-v1.0.npz         every voice, in the layout kokoro-onnx expects

Needs: `pip install kokoro-onnx` (pulls onnxruntime + espeak-ng via espeakng-loader) and `npm`.

  python tools/setup_kokoro.py           # idempotent — skips when already installed
  python tools/setup_kokoro.py --force
"""
import argparse
import hashlib
import io
import os
import subprocess
import sys
import tarfile
import tempfile

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "kokoro")
MODEL = os.path.join(OUT, "kokoro-v1.0.q8.onnx")
VOICES = os.path.join(OUT, "voices-v1.0.npz")
MODEL_SHA256 = "fbae9257e1e05ffc727e951ef9b9c98418e6d79f1c9b6b13bd59f5c9028a1478"
PKGS = ("kokoro-q8-shards@1.0.0", "kokoro-js@1.2.1")
# --full: the FULL-PRECISION model (fp32, ~310 MB) from the kokoro-onnx GitHub release. Cleaner
# audio than the int8-quantized q8 file (no faint buzz) — used automatically by gen_voice when present.
FULL = os.path.join(OUT, "kokoro-v1.0.onnx")
FULL_SHA256 = "7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5"
FULL_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx"


def fetch_full():
    import urllib.request
    if os.path.exists(FULL):
        print(f"full model already installed -> {os.path.relpath(FULL)}")
        return
    os.makedirs(OUT, exist_ok=True)
    tmp = FULL + ".part"
    h = hashlib.sha256()
    n = 0
    with urllib.request.urlopen(FULL_URL, timeout=60) as r, open(tmp, "wb") as f:
        while True:
            chunk = r.read(1 << 20)
            if not chunk:
                break
            f.write(chunk)
            h.update(chunk)
            n += len(chunk)
    if n < 200e6:
        os.remove(tmp)
        sys.exit(f"full model download looks truncated ({n / 1e6:.0f} MB)")
    if h.hexdigest() != FULL_SHA256:
        os.remove(tmp)
        sys.exit(f"full model checksum mismatch ({h.hexdigest()}) — refusing to install it")
    os.replace(tmp, FULL)
    print(f"full model -> {os.path.relpath(FULL)}  ({n / 1e6:.1f} MB, sha256 {h.hexdigest()})")


def npm_pack(spec, dest):
    """Download a package tarball from the npm registry (no install, no scripts run)."""
    npm = "npm.cmd" if os.name == "nt" else "npm"
    r = subprocess.run([npm, "pack", spec, "--silent"], cwd=dest, capture_output=True, text=True, check=True)
    return os.path.join(dest, r.stdout.strip().splitlines()[-1])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--full", action="store_true", help="also fetch the full-precision model (cleaner voices)")
    args = ap.parse_args()
    if args.full:
        fetch_full()
    if os.path.exists(MODEL) and os.path.exists(VOICES) and not args.force:
        print(f"kokoro already installed -> {os.path.relpath(OUT)}")
        return
    os.makedirs(OUT, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        shards_tgz, js_tgz = (npm_pack(p, tmp) for p in PKGS)

        with tarfile.open(shards_tgz) as tf:
            parts = sorted((m for m in tf.getmembers() if ".part" in m.name),
                           key=lambda m: int(m.name.split(".part")[1].split(".")[0]))
            blob = b"".join(tf.extractfile(m).read() for m in parts)
        digest = hashlib.sha256(blob).hexdigest()
        if digest != MODEL_SHA256:
            sys.exit(f"model checksum mismatch ({digest}) — refusing to install it")
        with open(MODEL, "wb") as f:
            f.write(blob)
        print(f"model  -> {os.path.relpath(MODEL)}  ({len(blob) / 1e6:.1f} MB, sha256 ok)")

        voices = {}
        with tarfile.open(js_tgz) as tf:
            for m in tf.getmembers():
                if "/voices/" in m.name and m.name.endswith(".bin"):
                    name = os.path.basename(m.name)[:-4]
                    arr = np.frombuffer(tf.extractfile(m).read(), dtype=np.float32)
                    voices[name] = arr.reshape(-1, 1, 256)  # (tokens, 1, style)
        buf = io.BytesIO()
        np.savez(buf, **voices)
        with open(VOICES, "wb") as f:
            f.write(buf.getvalue())
        print(f"voices -> {os.path.relpath(VOICES)}  ({len(voices)} voices)")


if __name__ == "__main__":
    main()
