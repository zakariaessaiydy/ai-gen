#!/usr/bin/env python3
"""
new_short.py — scaffold the next short so stage 1 starts from a RENDERING composition.

Every short in shorts/ repeats the same skeleton: the beat grammar (HOOK -> SETUP -> QUIZ ->
REVEAL -> TWIST -> LOOP), a beats.json in the same shape, a .tsx that mounts Captions +
ProgressBar at the root with scenes beneath, and a vo.gen.ts the composition imports. Typing
that by hand is ~20 minutes of boilerplate before any of the actual video exists — and it is
where the local-vs-global frame bug gets introduced.

This writes all four, wired together and already renderable (`node scripts/frames.mjs <Id>
--auto` works immediately), with the niche canvas left as a clearly marked TODO.

  python tools/new_short.py salt "Why the ocean is salty"
  python tools/new_short.py salt "Why the ocean is salty" --duration 40 --no-quiz

Then: write the real script + VO into beats.json, build the canvas in the .tsx, and run
  python tools/build_short.py shorts/short-N-salt
"""
import argparse
import os
import re
import subprocess
import sys

from common import write_json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WPS = 2.7  # words/sec the voice actually lands at — the windows below are sized from it


def next_index():
    n = 0
    for d in os.listdir(os.path.join(ROOT, "shorts")):
        m = re.match(r"short-(\d+)-", d)
        if m:
            n = max(n, int(m.group(1)))
    return n + 1


def pascal(s):
    return "".join(p.capitalize() for p in re.split(r"[^a-zA-Z0-9]+", s) if p)


def beat_plan(total, quiz):
    """The house beat grammar, stretched to `total` seconds."""
    hook_end = 3.4
    loop_start = round(total - 4.5, 2)
    twist_start = round(loop_start - 6.0, 2)
    if quiz:
        setup_end, quiz_end = 13.0, 15.6
        beats = [
            ("hook", 0.0, hook_end,
             "Frame 0 FULLY composed and thumbnail-grade: the payoff is already on screen, "
             "punch-in settles 1.06 -> 1.0. No fade from black."),
            ("setup", hook_end, setup_end, "TODO the canvas that carries the whole video is established here."),
            ("quiz", setup_end, quiz_end, "PauseCard — the question the reveal answers. ~2.6s."),
            ("reveal", quiz_end, twist_start, "TODO 2-4 steps, each landing on a VO word."),
            ("twist", twist_start, loop_start, "TODO the second thing they did not expect."),
            ("loop", loop_start, total,
             "Reverses the hook's punch-in (settle 1.06 -> 1) and dissolves back into frame 0 "
             "so the replay is seamless. No CTA."),
        ]
    else:
        setup_end = 13.0
        beats = [
            ("hook", 0.0, hook_end, "Frame 0 FULLY composed and thumbnail-grade. No fade from black."),
            ("setup", hook_end, setup_end, "TODO establish the canvas."),
            ("reveal", setup_end, twist_start, "TODO 2-4 steps, each landing on a VO word."),
            ("twist", twist_start, loop_start, "TODO the second thing they did not expect."),
            ("loop", loop_start, total, "Dissolves back into frame 0. No CTA."),
        ]
    return [{"id": i, "start": s, "end": e, "visual": v} for i, s, e, v in beats]


def vo_plan(beats):
    """One placeholder VO line per ~3.4s slot, windows sized at 2.7 words/sec."""
    vo = []
    for b in beats:
        if b["id"] == "quiz":
            continue
        span = b["end"] - b["start"]
        n = max(1, round(span / 3.4))
        for k in range(n):
            start = round(b["start"] + 0.3 + k * (span / n), 2)
            budget = int((span / n - 0.5) * WPS)
            # the budget lives in its own field, not in the placeholder text: a placeholder
            # long enough to describe itself would trip check_short.py's words/sec warning
            vo.append({
                "beat": b["id"],
                "text": "TODO",
                "budgetWords": budget,
                "start": start,
                "end": round(start + (span / n) - 0.5, 2),
            })
    return vo


SCRIPT_MD = """# {title}

**Niche:** {niche} · **Composition:** `{comp}` · **Length:** ~{total}s · **Status:** draft

## Hook (0–3.4s)
> TODO the first line. The payoff is ALREADY on screen at frame 0 — the hook explains what
> the viewer is already looking at.

## Beat sheet

| time | on screen | VO |
|---|---|---|
{rows}

## Production notes

- **Frame 0 is the thumbnail.** Fully composed, no fade from black, `warm` props on the title.
- **The loop is the ending.** Last frame == frame 0. No CTA, no "comment below" — end on the
  payoff line and let the visual dissolve back into the intro.
- **VO budget:** ~{words} words total at ~{wps} words/sec. Tighter forces an audible atempo squeeze.
- **Facts to verify before recording:** TODO list every number that appears on screen.
- **One new niche lib at most** (`remotion/src/lib/{niche}.tsx`), written generically enough
  to carry a series.
"""

TSX = """import React from 'react';
import {{ AbsoluteFill, Sequence, useCurrentFrame }} from 'remotion';
import {{
  BigTitle,
  Captions,
  Kicker,
  PauseCard,
  ProgressBar,
  ShortsBackdrop,
  prog,
  EASE_OUT,
}} from '../../lib/shorts';
import {{ VO }} from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {{
  id: '{comp}',
  durationInSeconds: {total},
  fps: 30,
  width: 1080,
  height: 1920,
}};

const ACCENT = '#f5d76e';
const F = (s: number) => Math.round(s * 30);
const END = F({total});

// =============================================================================
// CUES — global seconds from beats.json, converted ONCE here.
// Inside a <Sequence> the frame is LOCAL: local_f = global_s * 30 - sequence_from.
// Every cue below is global; subtract the sequence's `from` when you use it in a scene.
// =============================================================================
{cues}

// =============================================================================
// THE CANVAS — the one persistent thing the whole video happens on.
// TODO replace this placeholder with the real canvas ({niche}). Keep it ONE component whose
// timeline evolves, not a series of cuts: the continuity is what makes the loop work.
// =============================================================================
const Canvas: React.FC<{{ from: number }}> = ({{ from }}) => {{
  const f = useCurrentFrame() + from; // GLOBAL frame — scenes mount this inside a Sequence
  const grow = EASE_OUT(prog(f, 0, END));
  return (
    <AbsoluteFill style={{{{ alignItems: 'center', justifyContent: 'center' }}}}>
      <div
        style={{{{
          width: 520,
          height: 520,
          borderRadius: 40,
          border: `4px solid ${{ACCENT}}66`,
          background: 'rgba(255,255,255,0.03)',
          transform: `scale(${{0.9 + 0.1 * grow}})`,
        }}}}
      />
    </AbsoluteFill>
  );
}};

// =============================================================================
// THE SHOT
// =============================================================================
export default function {comp}() {{
  return (
    <AbsoluteFill style={{{{ background: '#0f1216' }}}}>
      <ShortsBackdrop />

      {{/* HOOK — frame 0 fully composed: `warm` pre-rolls the title's entrance. */}}
      <Sequence from={{0}} durationInFrames={{HOOK_OUT}}>
        <Canvas from={{0}} />
        <BigTitle
          warm
          lines={{[{{ text: '{hook1}' }}, {{ text: '{hook2}', color: ACCENT }}]}}
          subtitle="TODO one-line promise"
        />
      </Sequence>

      {{/* SETUP */}}
      <Sequence from={{HOOK_OUT}} durationInFrames={{SETUP_OUT - HOOK_OUT}}>
        <Canvas from={{HOOK_OUT}} />
        <Kicker text="TODO SETUP" at={{4}} />
      </Sequence>
{quiz_block}
      {{/* REVEAL */}}
      <Sequence from={{REVEAL_IN}} durationInFrames={{REVEAL_OUT - REVEAL_IN}}>
        <Canvas from={{REVEAL_IN}} />
        <Kicker text="TODO REVEAL" at={{4}} />
      </Sequence>

      {{/* TWIST */}}
      <Sequence from={{TWIST_IN}} durationInFrames={{LOOP_IN - TWIST_IN}}>
        <Canvas from={{TWIST_IN}} />
        <Kicker text="TODO TWIST" at={{4}} />
      </Sequence>

      {{/* LOOP — reverse the hook's punch-in so frame END lands on frame 0. */}}
      <Sequence from={{LOOP_IN}} durationInFrames={{END - LOOP_IN}}>
        <Canvas from={{LOOP_IN}} />
        <BigTitle
          lines={{[{{ text: '{hook1}' }}, {{ text: '{hook2}', color: ACCENT }}]}}
          subtitle="TODO one-line promise"
        />
      </Sequence>

      {{/* GLOBAL — mounted at the root so their time is the video's time, not a scene's. */}}
      <Captions lines={{VO}} accent={{ACCENT}} />
      <ProgressBar color={{ACCENT}} />
    </AbsoluteFill>
  );
}}
"""

QUIZ_BLOCK = """
      {/* QUIZ — the pause gate. Drives comments; keep it ~2.6s. */}
      <Sequence from={QUIZ_IN} durationInFrames={QUIZ_OUT - QUIZ_IN}>
        <Canvas from={QUIZ_IN} />
        <PauseCard subtitle="TODO the question" durSec={(QUIZ_OUT - QUIZ_IN) / 30} />
      </Sequence>
"""

VO_GEN = """// PLACEHOLDER — written by tools/new_short.py from the ESTIMATED beats.json timings.
// tools/gen_voice.py overwrites this with the REAL per-word alignment; never hand-edit.
import type {{ VoLine }} from '../../lib/shorts';

export const VO: VoLine[] = [
{lines}
];
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("niche", help="one word, e.g. salt / chess / orbit — names the folder and the lib")
    ap.add_argument("title", help="the video's title")
    ap.add_argument("--duration", type=float, default=42.0, help="seconds (default 42)")
    ap.add_argument("--no-quiz", action="store_true", help="skip the PauseCard beat")
    ap.add_argument("--index", type=int, help="force the short number (default: next free)")
    args = ap.parse_args()

    n = args.index if args.index is not None else next_index()
    niche = args.niche.lower()
    comp = f"Short{n}{pascal(niche)}"
    total = round(args.duration, 2)
    # the skeleton needs the reveal to start after setup (13s) / the quiz (15.6s): twist = total - 10.5
    min_total = (15.6 if not args.no_quiz else 13.0) + 10.5 + 1.0
    if total < min_total:
        sys.exit(f"--duration {total}s is too short for the beat skeleton (min ~{min_total:.0f}s)")
    proj = os.path.join(ROOT, "shorts", f"short-{n}-{niche}")
    shot = os.path.join(ROOT, "remotion", "src", "shots", f"short-{n}")
    if os.path.exists(proj):
        sys.exit(f"{os.path.relpath(proj, ROOT)} already exists")
    os.makedirs(proj)
    os.makedirs(shot, exist_ok=True)

    beats = beat_plan(total, quiz=not args.no_quiz)
    vo = vo_plan(beats)

    write_json(os.path.join(proj, "beats.json"), {
        "id": f"short-{n}-{niche}",
        "title": args.title,
        "composition": comp,
        "audience": "TODO who this is for, in one line",
        "format": {"width": 1080, "height": 1920, "fps": 30, "durationSec": total},
        "voicePlan": "edge:en-US-AndrewMultilingualNeural --rate +12%",
        "vo": vo,
        "beats": beats,
        "facts": ["TODO every on-screen number, with its source"],
    }, indent=2)

    rows = "\n".join(
        f"| {b['start']:.1f}–{b['end']:.1f} | {b['id'].upper()} — TODO | TODO |" for b in beats)
    open(os.path.join(proj, "script.md"), "w", encoding="utf-8").write(SCRIPT_MD.format(
        title=args.title, niche=niche, comp=comp, total=total, rows=rows,
        words=int(total * WPS * 0.85), wps=WPS))

    quiz = not args.no_quiz
    cue_names = [("HOOK_OUT", beats[0]["end"]), ("SETUP_OUT", beats[1]["end"])]
    if quiz:
        cue_names += [("QUIZ_IN", beats[2]["start"]), ("QUIZ_OUT", beats[2]["end"])]
    rev = beats[3] if quiz else beats[2]
    tw = beats[4] if quiz else beats[3]
    lp = beats[5] if quiz else beats[4]
    cue_names += [("REVEAL_IN", rev["start"]), ("REVEAL_OUT", rev["end"]),
                  ("TWIST_IN", tw["start"]), ("LOOP_IN", lp["start"])]
    cues = "\n".join(f"const {name} = F({sec}); // {sec}s" for name, sec in cue_names)

    open(os.path.join(shot, f"{comp}.tsx"), "w", encoding="utf-8").write(TSX.format(
        comp=comp, total=total, niche=niche, cues=cues,
        quiz_block=QUIZ_BLOCK if quiz else "",
        hook1="TODO HOOK LINE ONE", hook2="TODO PAYOFF"))

    lines = "\n".join(
        "  {{ text: '{t}', start: {s}, end: {e}, words: [] }},".format(
            t=l["text"].replace("'", "\\'"), s=l["start"], e=l["end"]) for l in vo)
    open(os.path.join(shot, "vo.gen.ts"), "w", encoding="utf-8").write(VO_GEN.format(lines=lines))

    subprocess.run(["node", "scripts/gen-registry.mjs"],
                   cwd=os.path.join(ROOT, "remotion"), check=True)

    rel = os.path.relpath(proj, ROOT).replace("\\", "/")
    print(f"""
scaffolded {rel}  [{comp}]  {total}s
  {rel}/script.md            the beat sheet to fill in
  {rel}/beats.json           vo[] windows already sized at {WPS} words/sec
  remotion/src/shots/short-{n}/{comp}.tsx   renders as-is; build the canvas here
  remotion/src/shots/short-{n}/vo.gen.ts    placeholder, overwritten by the voice stage

next:
  cd remotion && node scripts/frames.mjs {comp} --auto      # it already renders
  python tools/check_short.py {rel}
  python tools/build_short.py {rel}
""")


if __name__ == "__main__":
    main()
