#!/usr/bin/env python3
"""
kids_lib.py — shared helpers for the kids-stories track (imported, not run).

  - kit_vocab()        the scene kinds / cast ids / actions / moods, PARSED from
                       remotion/src/lib/kids.tsx so the Python checks can never drift from the kit
  - emit_shots_ts()    beats.json "shots" + "shortCut" -> remotion/src/shots/ks-N/shots.gen.ts
  - check_kids()       the kids rules check_short.py runs on a kids-stories project

Why rules at all: the channel's numbers said viewers left at ~25-40s of a 3-5 min video, almost
nobody came back, and compilations held ~8 min. Each rule below targets one of those: a hook
that is already moving at frame 0, a visual change every few seconds, slower narration, a
spoken next-episode tease (Made for Kids videos get no end screens, cards or comments), and
no engagement CTAs (pointless on Made for Kids, and they read as low-quality to YouTube's
kids quality principles).
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KIT = os.path.join(ROOT, "remotion", "src", "lib", "kids.tsx")

FORMAT = (1920, 1080)
MAX_SHOT_SEC = 8.0     # a new picture at least this often — preschool attention resets on stillness
MIN_SHOT_SEC = 1.0
MAX_WPS = 2.4          # kids narration is slower than the shorts' 2.7
HOOK_VO_BY = 0.6       # the first word lands before this (seconds)
NEXT_WITHIN = 15.0     # the NEXT-UP tease sits in the last N seconds
LENGTH_OK = (90, 420)  # seconds; longer stories belong in a compilation
CTA = re.compile(r"\b(subscribe|comment|like and|smash|notification|bell|link in|hit the)\b", re.I)


def is_kids(beats, proj=""):
    return beats.get("track") == "kids-stories" or "kids-stories" in proj.replace("\\", "/")


def kit_vocab():
    src = open(KIT, encoding="utf-8").read()
    out = {}
    for name in ("SCENE_KINDS", "CAST_IDS", "ACTIONS", "MOODS", "PROP_KINDS"):
        m = re.search(r"export const " + name + r"\s*=\s*\[([^\]]*)\]", src)
        out[name] = re.findall(r"'([^']+)'", m.group(1)) if m else []
    return out


def shots_ts(beats):
    shots = beats.get("shots", [])
    cut = beats.get("shortCut")
    body = [
        "// AUTO-GENERATED from beats.json (\"shots\" + \"shortCut\") by tools/kids_lib.py — do not edit.",
        "// Edit beats.json, then run build_short.py (its gen stage re-emits this).",
        "import type { Cut, Shot } from '../../lib/kids';",
        "",
        f"export const SHOTS = {json.dumps(shots, indent=2, ensure_ascii=False)} as Shot[];",
        "",
        f"export const CUT: Cut = {json.dumps({'start': cut['start'], 'end': cut['end']} if cut else {'start': 0, 'end': 30})};",
        "",
    ]
    return "\n".join(body)


def emit_shots_ts(beats, path):
    """Write shots.gen.ts only when it changed — an untouched mtime keeps the render cache warm."""
    content = shots_ts(beats)
    if os.path.exists(path) and open(path, encoding="utf-8").read() == content:
        return False
    open(path, "w", encoding="utf-8").write(content)
    return True


def check_kids(beats, rep, total, shot_dir=None):
    fmt = beats.get("format", {})
    if (fmt.get("width"), fmt.get("height")) != FORMAT:
        rep.error("beats.json", f"kids-stories episodes are {FORMAT[0]}x{FORMAT[1]} (16:9), got "
                                f"{fmt.get('width')}x{fmt.get('height')}")
    if not LENGTH_OK[0] <= total <= LENGTH_OK[1]:
        rep.warn("beats.json", f"{total:.0f}s episode — aim for {LENGTH_OK[0]}-{LENGTH_OK[1]}s; "
                               "longer runtime comes from compilations (tools/compile_kids.py)")

    vocab = kit_vocab()
    cast_ids = set(vocab["CAST_IDS"])

    # ── the hook ────────────────────────────────────────────────────────────────
    vo = beats.get("vo", [])
    if vo:
        first = vo[0]
        if float(first["start"]) > HOOK_VO_BY:
            rep.warn("hook", f"first VO word at {first['start']}s — start talking by {HOOK_VO_BY}s "
                             "(no logo, no music-only intro)")
        if not re.search(r"[?!]", first["text"]):
            rep.warn("hook", f"first line {first['text'][:50]!r} is not a question or exclamation — "
                             "open on the question the episode answers")
    for b in beats.get("beats", []):
        if b.get("id", "").lower() in ("intro", "logo", "title", "titlecard", "opening") and float(b["start"]) < 6:
            rep.warn(f"beat {b['id']}", "an intro/title beat in the first seconds is where the "
                                        "audience was leaving — cut it, start mid-action")

    # ── narration pace + CTAs + speakers ────────────────────────────────────────
    voiced = any(line.get("words") for line in vo)
    todo = [i for i, line in enumerate(vo) if "TODO" in line["text"]]
    if todo:
        rep.warn("vo", f"{len(todo)} placeholder line(s) still say TODO (first: vo[{todo[0]}])")
    for i, line in enumerate(vo):
        if i in todo:
            continue
        if CTA.search(line["text"]):
            rep.warn(f"vo[{i}]", f"engagement CTA {CTA.search(line['text']).group(0)!r} — Made for "
                                 "Kids videos have no comments/notifications; end on the next-episode tease")
        sp = line.get("speaker")
        if sp and sp not in cast_ids:
            rep.error(f"vo[{i}]", f"speaker {sp!r} is not in the kit's CAST_IDS {sorted(cast_ids)}")
        nxt = float(vo[i + 1]["start"]) if i + 1 < len(vo) else total
        window = nxt - float(line["start"]) - 0.05
        if not voiced and window > 0 and len(line["text"].split()) / window > MAX_WPS:
            rep.warn(f"vo[{i}]", f"{len(line['text'].split()) / window:.1f} words/sec — kids narration "
                                 f"wants <= {MAX_WPS}: {line['text'][:48]!r}")

    # ── the shot list ───────────────────────────────────────────────────────────
    shots = beats.get("shots", [])
    if not shots:
        rep.error("shots", "no shots[] — the episode has nothing to play")
    prev_end = 0.0
    for i, s in enumerate(shots):
        where = f"shots[{i}]"
        st, en = float(s["start"]), float(s["end"])
        if abs(st - prev_end) > 0.01:
            rep.error(where, f"starts at {st} but the previous shot ends at {prev_end} — shots must be contiguous")
        prev_end = en
        d = en - st
        if d > MAX_SHOT_SEC + 0.01:
            rep.warn(where, f"{d:.1f}s on one picture — cut, move the camera or change the action "
                            f"at least every {MAX_SHOT_SEC:.0f}s")
        if d < MIN_SHOT_SEC:
            rep.warn(where, f"{d:.2f}s shot is a flicker at this age")
        if s.get("scene") not in vocab["SCENE_KINDS"]:
            rep.error(where, f"scene {s.get('scene')!r} not in {vocab['SCENE_KINDS']}")
        for c in s.get("cast", []):
            if c.get("id") not in cast_ids:
                rep.error(where, f"cast id {c.get('id')!r} not in {sorted(cast_ids)}")
            if c.get("action") and c["action"] not in vocab["ACTIONS"]:
                rep.error(where, f"action {c['action']!r} not in {vocab['ACTIONS']}")
            if c.get("mood") and c["mood"] not in vocab["MOODS"]:
                rep.error(where, f"mood {c['mood']!r} not in {vocab['MOODS']}")
            xs = c.get("x") if isinstance(c.get("x"), list) else [c.get("x", 0.5)]
            if any(not 0.0 <= float(x) <= 1.0 for x in xs):
                rep.warn(where, f"{c.get('id')} x={c.get('x')} is off screen (0..1)")
        for pr in s.get("props", []):
            if pr.get("kind") not in vocab["PROP_KINDS"]:
                rep.error(where, f"prop {pr.get('kind')!r} not in {vocab['PROP_KINDS']}")
        if s.get("next") and s["next"].get("cast") not in cast_ids:
            rep.error(where, f"next.cast {s['next'].get('cast')!r} not in {sorted(cast_ids)}")
    if shots:
        if abs(prev_end - total) > 0.05:
            rep.error("shots", f"shots end at {prev_end}s but the episode is {total}s")
        if not shots[0].get("cast"):
            rep.error("shots[0]", "frame 0 has nobody in it — the hook is a character mid-action")
        if not any(s.get("next") for s in shots if float(s["end"]) > total - NEXT_WITHIN):
            rep.warn("shots", "no NEXT-UP card in the last shots — Made for Kids videos have no end "
                              "screens, so the tease for the next episode is how viewers stay")

    # ── the vertical cut ────────────────────────────────────────────────────────
    cut = beats.get("shortCut")
    if cut:
        cs, ce = float(cut["start"]), float(cut["end"])
        if not 0 <= cs < ce <= total:
            rep.error("shortCut", f"[{cs}, {ce}] is outside the {total}s episode")
        elif ce - cs > 60:
            rep.warn("shortCut", f"{ce - cs:.0f}s — keep the vertical teaser <= 60s")
        if shot_dir:
            comp = beats.get("composition", "") + "Vertical"
            p = os.path.join(shot_dir, comp + ".tsx")
            if not os.path.exists(p):
                rep.error("shortCut", f"no {os.path.relpath(p, ROOT)} — the vertical composition is missing")
            else:
                m = re.search(r"durationInSeconds\s*:\s*([0-9.]+)", open(p, encoding="utf-8").read())
                if m and abs(float(m.group(1)) - (ce - cs)) > 0.05:
                    rep.error("shortCut", f"{comp} durationInSeconds {m.group(1)} != cut length {ce - cs:g}")

    if shot_dir:
        gen = os.path.join(shot_dir, "shots.gen.ts")
        if not os.path.exists(gen) or open(gen, encoding="utf-8").read() != shots_ts(beats):
            rep.warn("shots.gen.ts", "stale vs beats.json — build_short.py's gen stage re-emits it "
                                     "(frames.mjs alone would QA the OLD shots)")
    rep.note(f"kids: {len(shots)} shots, {len(vo)} VO lines, "
             f"{len({c['id'] for s in shots for c in s.get('cast', [])})} cast member(s)")


def emit_estimated_vo(beats, path):
    """Before the voice exists, keep vo.gen.ts in step with the SCRIPT (estimated timings), so
    QA frames show the real captions and the right mouths moving. Never overwrites real word times."""
    if any(line.get("words") for line in beats.get("vo", [])):
        return False
    from gen_voice import emit_ts  # local import: gen_voice pulls in ffmpeg path setup
    return emit_ts(beats.get("vo", []), path)

