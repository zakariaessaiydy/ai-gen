#!/usr/bin/env python3
"""
ffmpeg_path.py — find ffmpeg/ffprobe even when the shell's PATH doesn't have them.

winget / scoop / choco install ffmpeg into per-user shim directories that a freshly spawned
shell (a CI runner, an agent's subshell, a terminal opened before the install) often does not
inherit. Every tool here then dies with a bare "command not found" for something that IS
installed. Each tool calls ensure_on_path() once at import; after that the plain
["ffmpeg", ...] argv the tools already use resolves normally.

  from ffmpeg_path import ensure_on_path
  ensure_on_path()

Run it directly to see what it found:  python tools/ffmpeg_path.py
"""
import os
import shutil
import sys

_HOME = os.path.expanduser("~")
_LOCALAPPDATA = os.environ.get("LOCALAPPDATA", os.path.join(_HOME, "AppData", "Local"))

# Ordered: the places these three installers actually put the shims, then the unix defaults.
CANDIDATE_DIRS = [
    os.path.join(_LOCALAPPDATA, "Microsoft", "WinGet", "Links"),
    os.path.join(_HOME, "scoop", "shims"),
    r"C:\ProgramData\chocolatey\bin",
    os.path.join(_LOCALAPPDATA, "Programs", "ffmpeg", "bin"),
    r"C:\ffmpeg\bin",
    "/usr/local/bin",
    "/usr/bin",
    "/opt/homebrew/bin",
]


def find(exe="ffmpeg"):
    """Absolute path to `exe`, or None. Checks PATH first, then the known install dirs."""
    hit = shutil.which(exe)
    if hit:
        return hit
    for d in CANDIDATE_DIRS:
        for name in (exe + ".exe", exe):
            p = os.path.join(d, name)
            if os.path.isfile(p):
                return p
    return None


_done = False


def ensure_on_path(required=True):
    """Prepend ffmpeg's directory to PATH if it isn't already resolvable.

    Returns the directory added (or None when ffmpeg was already on PATH). With required=True
    a genuinely missing ffmpeg exits with an install hint instead of a cryptic OSError later.
    """
    global _done
    if _done:
        return None
    _done = True
    if shutil.which("ffmpeg") and shutil.which("ffprobe"):
        return None
    hit = find("ffmpeg")
    if not hit:
        if required:
            sys.exit(
                "ffmpeg not found. Install it, then re-run:\n"
                "  winget install Gyan.FFmpeg     (Windows)\n"
                "  brew install ffmpeg            (macOS)\n"
                "  sudo apt install ffmpeg        (Debian/Ubuntu)"
            )
        return None
    d = os.path.dirname(hit)
    os.environ["PATH"] = d + os.pathsep + os.environ.get("PATH", "")
    return d


if __name__ == "__main__":
    added = ensure_on_path(required=False)
    for exe in ("ffmpeg", "ffprobe"):
        print(f"  {exe:8s} {find(exe) or 'NOT FOUND'}")
    if added:
        print(f"  (added to PATH for this process: {added})")
