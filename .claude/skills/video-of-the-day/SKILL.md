---
name: video-of-the-day
description: Make the NEXT Tiny Sparks video from the 800-video calendar and tick it off. Use when the user says "just create a video of a day", "video of the day", "next video", "make today's video", "continue the calendar", or "mark day N as done/published". Token-cheap by design — never open TINY-SPARKS-CALENDAR.xlsx; the tracker script prints a 10-line brief and writes the status.
---

# video-of-the-day — next topic from the calendar, then tick it

**Never read `TINY-SPARKS-CALENDAR.xlsx` directly** (800 rows = thousands of tokens) and never
list the idea files. All calendar I/O goes through `tools/next_video.py` (prints only what's needed).

1. `python tools/next_video.py` → the brief: Day #, date, niche + the skill to use, idea, YouTube
   title, format/length, ages, cast, learning goal, rig readiness, project folder, composition id.
   Do not ask the user which topic — the calendar decides.
2. If `rig:` says `Build first: <species>`, add that species to `remotion/src/lib/kids/critter.tsx`
   first (one new branch per species, same face), or restage the idea with a rig-ready animal and
   say so.
3. Make the video with the skill named in the brief (read `make-kids` + that niche skill; they hold
   the formats and rules). Use the brief's project folder and composition id; the YouTube title and
   description go into the project's script.md. Long 16:9 formats: if time is short, make the
   Short version first and say so.
4. Deliver: send the mp4 to the user (SendUserFile; the limit is 30 MB — long videos usually exceed it, so
   first make `<out>/day-NNN-final.mp4` with `ffmpeg -i <mp4> -c:v libx264 -crf 24 -preset slow -c:a copy -movflags +faststart`; if it is STILL over 30 MB — busy 16:9 songs are — encode two-pass
   `-b:v 1250k -preset slow -tune animation` (≈29 MB for 2:45)), then
   `python tools/next_video.py --done <day> --file <path to the mp4>` → prints `N/800 made`.
5. Write the upload kit into the project's script.md (## Upload): title, description with `#Shorts`
   first among 3–8 hashtags, and the two playlists (the niche playlist + "Tiny Sparks Shorts — All
   Episodes"), Made for Kids = Yes. Then commit + push (the xlsx changes with the status). Report in 4 lines: Day N + topic, the title,
   the file, and what's next (`python tools/next_video.py --peek 1`).

Other commands (each one call, no file reading):
- "status" / "where are we" → `python tools/next_video.py --status`
- "what's coming" → `python tools/next_video.py --peek 7`
- "day N is published, link …" → `python tools/next_video.py --published N --link <url>`
- "skip day N" → do `--peek`, tell the user, and make the next one; never edit dates by hand.

The xlsx is the user's file too (they type views/subs in it): never regenerate it with
`tools/gen_kids_calendar.py` (that overwrites statuses) unless the user asks.
