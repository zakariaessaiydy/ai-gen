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


def npm_pack(spec, dest):
    """Download a package tarball from the npm registry (no install, no scripts run)."""
    npm = "npm.cmd" if os.name == "nt" else "npm"
    r = subprocess.run([npm, "pack", spec, "--silent"], cwd=dest, capture_output=True, text=True, check=True)
    return os.path.join(dest, r.stdout.strip().splitlines()[-1])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()
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
