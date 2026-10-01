#!/usr/bin/env python3
"""
loop_diff.py — MEASURE a short's wrap instead of eyeballing it.

short-13 and short-14 both shipped beat-by-beat QA clean and still had a defect at the join
(a raw phase used as a magnitude; a caption still on screen at the last frame). Neither is
visible frame-by-frame — both are obvious the moment you diff the LAST frame against frame 0
and compare that against an ordinary frame step.

  python tools/loop_diff.py remotion/out/qa/Short17Screen

Reads <prefix>-f0000.png, -f0001.png, and the two highest-numbered frames present, and prints
the fraction of channels that changed at the wrap next to the fraction that change over one
normal frame. The wrap should be the SMALLER of the two, or very close to it.
"""
import re
import struct
import sys
import zlib
from pathlib import Path


def read_png(path):
    data = Path(path).read_bytes()
    assert data[:8] == b"\x89PNG\r\n\x1a\n", f"{path} is not a PNG"
    pos, idat, w = 8, b"", None
    while pos < len(data):
        (ln,) = struct.unpack(">I", data[pos : pos + 4])
        typ = data[pos + 4 : pos + 8]
        body = data[pos + 8 : pos + 8 + ln]
        if typ == b"IHDR":
            w, h, depth, color = struct.unpack(">IIBB", body[:10])
            assert depth == 8 and color in (2, 6), f"unsupported PNG: depth={depth} color={color}"
            nch = 3 if color == 2 else 4
        elif typ == b"IDAT":
            idat += body
        elif typ == b"IEND":
            break
        pos += 12 + ln
    raw = zlib.decompress(idat)
    stride = w * nch
    out = bytearray(stride * h)
    prev = bytearray(stride)
    p = 0
    for y in range(h):
        ft = raw[p]
        p += 1
        line = bytearray(raw[p : p + stride])
        p += stride
        if ft == 1:
            for i in range(nch, stride):
                line[i] = (line[i] + line[i - nch]) & 0xFF
        elif ft == 2:
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 0xFF
        elif ft == 3:
            for i in range(stride):
                a = line[i - nch] if i >= nch else 0
                line[i] = (line[i] + ((a + prev[i]) >> 1)) & 0xFF
        elif ft == 4:
            for i in range(stride):
                a = line[i - nch] if i >= nch else 0
                b = prev[i]
                c = prev[i - nch] if i >= nch else 0
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + pr) & 0xFF
        out[y * stride : (y + 1) * stride] = line
        prev = line
    return bytes(out), nch


def diff(a, b, thresh=6):
    pa, _ = read_png(a)
    pb, _ = read_png(b)
    assert len(pa) == len(pb), "frames differ in size"
    n = sum(1 for x, y in zip(pa, pb) if abs(x - y) > thresh)
    return n / len(pa)


def main():
    prefix = sys.argv[1]
    d = Path(prefix).parent
    stem = Path(prefix).name
    frames = sorted(
        (int(m.group(1)), p)
        for p in d.glob(f"{stem}-f*.png")
        if (m := re.search(r"-f(\d+)\.png$", p.name))
    )
    assert len(frames) >= 4, "need frames 0, 1 and the last two rendered"
    (n0, f0), (n1, f1) = frames[0], frames[1]
    (nm1, fm1), (nlast, flast) = frames[-2], frames[-1]
    wrap = diff(flast, f0)
    step = diff(f0, f1)
    step2 = diff(fm1, flast)
    print(f"  wrap  f{nlast:04d} -> f{n0:04d} : {wrap * 100:6.3f}% of channels changed")
    print(f"  step  f{n0:04d} -> f{n1:04d} : {step * 100:6.3f}%")
    print(f"  step  f{nm1:04d} -> f{nlast:04d} : {step2 * 100:6.3f}%")
    ref = max(step, step2)
    verdict = "SEAMLESS" if wrap <= ref * 1.6 + 0.001 else "*** JOIN IS VISIBLE ***"
    print(f"  -> {verdict}  (wrap is {wrap / max(ref, 1e-9):.2f}x a normal frame step)")


if __name__ == "__main__":
    main()
