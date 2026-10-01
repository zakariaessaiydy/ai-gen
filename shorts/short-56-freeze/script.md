# What If Earth's Oceans Suddenly Froze?

**Niche:** freeze (planetary thought experiment) · **Composition:** `Short56Freeze` · **Length:** 47.0s · **Status:** built (voiced + SFX audition, awaiting ear pass)

## Hook (0–3.4s)
> "What if Earth's oceans suddenly froze?" Frame 0 is the PAYOFF: a real-outline globe completely white,
> SEA ICE 100%, OCEAN ABSORBS 20%, AVG TEMP −50°C. Title "What if Earth's / oceans froze?".

## Beat sheet

| time | on screen | VO |
|---|---|---|
| 0.0–3.4 | HOOK: snowball globe, readouts at −50°C, title. At ~3.1s the ice rewinds to today's polar caps. | What if Earth's oceans suddenly froze? |
| 3.4–18.2 | SETUP: EARTH TODAY. Ocean glows + 71% chip on "seventy-one". Sun rays sink into the sea, 94% chip on "ninety". On "freeze" the ice edge sweeps from both poles to the equator. On "bounces" the rays bounce back to space; ABSORBS lands at 20%. | Oceans cover seventy-one percent of our planet. / That dark water soaks up over ninety percent of sunlight. / Now freeze it. / Ice bounces most of that light back to space. / So would the sun just melt it? |
| 18.2–20.8 | QUIZ: PauseCard WOULD IT MELT? / the Sun is still shining. | — |
| 20.8–31.2 | REVEAL: ice-albedo ring of arrows circles the planet: LESS SUN ABSORBED → COLDER → MORE ICE on their words. The land snows over from the poles; AVG TEMP falls 15 → −50°C, landing on "fifty". | No. Less sunlight absorbed means colder air. / Colder air means even more ice. / Earth's average drops from fifteen to around minus fifty. |
| 31.2–42.3 | TWIST: IT ALREADY HAPPENED. ≈700 MILLION YEARS AGO chip, SNOWBALL EARTH stamp. On "volcanic" seven real volcanic sites erupt CO₂ puffs; on "thaw" the ice retreats and temp climbs back. | And this really happened. / Seven hundred million years ago, Snowball Earth froze nearly pole to pole. / It took millions of years of volcanic carbon dioxide to thaw. |
| 42.3–47.0 | LOOP: on "froze" the ice sweeps back over everything; title returns, punch-in grows 1 → 1.06, last frame == frame 0. | So if the oceans froze... they'd stay frozen. |

## Production notes

- **New niche lib `lib/globe.tsx`, a real Earth in orthographic projection.** Natural Earth 110m outlines
  (the same `geo/world.ts` as short-11/53), horizon-clipped properly (hidden runs are closed along the limb,
  polar caps pick the limb arc whose latitude is inside the cap), one full turn per loop.
- **Ice is one number, the edge latitude `e`.** SEA ICE = `1 − sin e` (area poleward on a sphere),
  OCEAN ABSORBS = mix of ocean (albedo 0.06) and snowy ice (0.8) by that area. Today's edge at 70° → 6%.
- **Rays are decided by the surface under them.** Each streak asks `surfaceAt(lon, lat)` at the moment it
  lands (ocean / ice / land / snow, with a real point-in-country test), so absorption vs. bounce is computed.
- **Module-load assertions:** ocean absorbs 94%, frozen ocean reflects most light, today's ice ≈6%,
  the sweep finishes before "bounces", last frame state == frame 0.
- **Loop:** `loop_diff.py` wrap 0.717% vs step 1.530% → **SEAMLESS (0.47× a normal frame step)**.
- **Facts:** see `beats.json › facts` (NOAA 71%; NSIDC albedo; Budyko/Sellers 1969; Hoffman et al. 1998;
  Hoffman & Schrag 2002; Macdonald et al. 2010 for the ~717 Ma Sturtian onset).
- **Voice:** Edge `en-US-AndrewMultilingualNeural --rate +12%`, every line at 1.00× (windows fitted to the
  real clip lengths before the render).
- **SFX:** library-only (ElevenLabs quota exhausted, so no new ice recipe), 16 cues (3 optional).
  Audition **−15.4 LUFS, −1.6 dBTP**, awaiting an ear pass. An `ice-crackle` recipe would upgrade the
  "freeze" moment once credits are back.
