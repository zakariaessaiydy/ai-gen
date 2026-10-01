# What If Humans Could Remember Everything?

**Niche:** memory (thought experiment) · **Composition:** `Short55Memory` · **Length:** 40.3s · **Status:** built (voiced + SFX audition, awaiting ear pass)

## Hook (0–3.1s)
> "What if you remembered every day of your life?" Frame 0 is the PAYOFF: a 30-year life as a calendar, one cell per real
> day (1996–2025, contribution-graph year blocks), all 10,958 lit teal; meter DAYS YOU CAN REPLAY 10,958 / 10,958.

## Beat sheet

| time | on screen | VO |
|---|---|---|
| 0.0–3.1 | HOOK: every day lit, title. | What if you remembered every day of your life? |
| 3.1–20.8 | SETUP: 'eleven' a bright sweep runs through the years in order, chip 30 YEARS = 10,958 DAYS. 'Tuesday' ring on TUESDAY · DEC 27, 2022 + card. 'Gone' the grid forgets, only landmarks + last 3 weeks stay (meter → 285, ILLUSTRATIVE), card ???. 'HSAM' relights chronologically, chip HIGHLY SUPERIOR AUTOBIOGRAPHICAL MEMORY. 'Name' the ring hops three dates and lands on MAR 14, 2011; card fills MONDAY (computed) / LIGHT RAIN / FIRST DAY, NEW JOB (EXAMPLE ANSWERS) on their words. | Thirty years is almost eleven thousand days. / Try a random Tuesday from three years ago. Gone. / But a rare few, with a condition called HSAM, keep almost every one. / Name a date. They'll tell you the weekday, the weather, what they did. / So would they ace every exam? |
| 20.8–23.3 | QUIZ: PauseCard ACE EVERY EXAM? / they remember every day. | — |
| 23.3–27.7 | REVEAL: word-pair test card, AVERAGE stamp on 'everyone', chip LEPORT ET AL., 2012. | No. Give them word pairs to learn, and they score like everyone else. |
| 27.7–36.2 | TWIST: 'bad' a scatter of days turns pink and pulses, everything else steps back. 'first' quote card, the three phrases land on their words, credit JILL PRICE · THE FIRST HSAM CASE, 2006. | And it won't switch off. Every bad day stays sharp. / The first one studied called it nonstop, uncontrollable, and totally exhausting. |
| 36.2–40.3 | LOOP: 'Forgetting' the grid filters to landmarks again; after 'filter' it relights chronologically, title returns, punch-in grows → last frame == frame 0. | Forgetting isn't a flaw. It's the filter. |

## Production notes

- **New niche lib `lib/days.tsx`.** `makeLife` builds a real calendar: one cell per day, rows by weekday, columns by week,
  one block per year. The cells are grouped into about 256 `<path>`s by (class, random stagger, chronological stagger), so the
  forget (random order) and relight (date order) animations only change group opacities. `DayMeter` counts the lit cells.
- **Module-load assertions:** 10,958 days (almost eleven thousand), thirty calendar years, the random day is a Tuesday about
  3 years back that a normal memory didn't keep, Mar 14 2011 is a Monday, the quiz sits in ≥2 s of silence, and the relight
  plus the last caption finish before the loop frame.
- **Illustrative, and labelled:** which days a normal memory keeps (9 seeded landmarks/year + the last 21 days) and which
  days are 'bad' (5%) are choices, not data. The example card answers are fiction; the weekday is computed.
- **Facts:** see `beats.json › facts`.
- **Voice:** Edge `en-US-AndrewMultilingualNeural --rate +12%`; after one respacing pass all lines run at 1.00× except
  line 1 (1.03×) and line 8 (1.04×).
- **SFX:** library-only, 19 cues (`sfx-plan.json`, 8 optional). Audition **−15.7 LUFS**, awaiting an ear pass.
