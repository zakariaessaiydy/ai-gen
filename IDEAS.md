# TSX Shorts — Idea Bank

Fully-synthetic vertical shorts (1080×1920, ~40s) rendered 100% from Remotion TSX.
No footage, no stock, no screen recordings — every pixel is code, so every video is
repeatable, editable, and brandable after the fact.

## The filter: when does TSX win?

A niche works when **the content's native representation is a diagram, board, UI, or
chart** — the value must *live in the drawing*, not in a face or real-world footage.
Test for any idea: *"If I drew this on a whiteboard, would the drawing alone carry the
video?"* If yes, TSX renders a cleaner whiteboard than any human can draw, animated.

TSX loses when the point is photographic proof, human emotion, or real-world texture.
Don't fight that — those stay long-form/talking-head territory.

## Universal beat grammar (every short, every niche)

```
HOOK (0–3s)    frame 0 fully composed, payoff/trap already VISIBLE, first words on screen
SETUP (3–12s)  show the situation fast — build the tension the hook promised
QUIZ (opt.)    "pause — can you solve it?" card (~2.5s). Drives comments + rewatches
REVEAL (12–30s) the payoff in 2–4 steps, each step synced to VO words
TWIST (30–38s)  reframe / bonus insight — the "share this" moment
LOOP (38–42s)   last frame visually rhymes with frame 0 → seamless replay
```

Retention devices that transfer across niches:
- **Pause-quiz card** — pose a solvable challenge (chess move, math answer, spot-the-bug)
- **Live counter** — numbers ticking up while narrating (money, probability, iterations)
- **Before/after morph** — same canvas, wrong→right transition
- **Progress bar** — thin top bar; signals "this is short, stay"
- **Word-pop captions** — always on, big, inside safe areas
- **The rewind** — visibly undo the board/canvas to a decision point ("but right HERE…")

## Niches (ranked by fit × demand × repeatability × build cost)

| # | Niche | Why TSX wins | Lib needed | Series examples |
|---|-------|--------------|-----------|-----------------|
| 1 | **Chess traps & tactics** | board = pure SVG; pause-quiz native to the niche; infinite puzzle supply | `lib/chess.tsx` ✅ | 4-move mate punish · Fried Liver · Stafford Gambit traps · endgame rules (opposition) · "why grandmasters resign here" |
| 2 | **Math tricks & visual proofs** | the aha IS the animation; micro-3Blue1Brown | `lib/math.tsx` (number line, grid, equation morph) | ×11 in your head · 20% loss ≠ 20% gain · 0.999…=1 · Pythagoras rearrangement · why you can't divide by zero |
| 3 | **Probability & paradoxes** | simulations impossible to film, trivial to render | `lib/prob.tsx` ✅ | Monty Hall doors · birthday paradox counter · gambler's fallacy coin run · false-positive medical test |
| 4 | **Algorithms visualized** | sorting races / pathfinding are hypnotic + educational | `lib/algo.tsx` (bar array, grid walker) | bubble vs quick sort race · how A* finds the path · binary search "20 questions" · hash collisions |
| 5 | **Dev / AI tips** | VS Code, terminal, browser clones ALREADY BUILT | `lib/vscode.tsx` ✅ `lib/browser.tsx` ✅ | git reflog saves you · the regex that parses anything · 5 VS Code shortcuts · prompt patterns that 10x Claude |
| 6 | **Excel / Sheets tricks** | a spreadsheet is a table — pixel-perfect clone, huge audience | `lib/sheet.tsx` | Flash Fill (Ctrl+E) · XLOOKUP kills VLOOKUP · $ absolute refs · pivot in 10 seconds |
| 7 | **Money math** | compound curves, fee erosion — charts ARE the story | `lib/chart.tsx` ✅ | 1% fee eats 24% of retirement ✅ (short-10) · rule of 72 · minimum-payment trap · latte math done honestly |
| 8 | **Regex / SQL visually** | live match-highlighting over text is pure TSX | code panel + highlighter | email regex decoded char by char · JOIN types as venn-tables · the query that finds duplicates |
| 9 | **Keyboard shortcut mastery** | animated keycaps + instant result split | `lib/keyboard.tsx` | Windows/Mac power moves · VS Code multi-cursor · Excel navigation |
| 10 | **UX dark patterns exposed** | render the manipulative UI itself, annotate it | browser lib ✅ | fake countdown timers · confirm-shaming · roach-motel subscriptions |
| 11 | **Physics intuitions** | frame-based animation = physics sim for free | `lib/orbit.tsx` ✅ | why astronauts float (falling!) ✅ (short-12) · escape velocity · why the Moon doesn't fall · why rockets go sideways · time dilation twin clocks |
| 12 | **Geography / maps** | real projections over real outlines — the distortion is computed, not drawn | `lib/map.tsx` ✅ | the Mercator lie ✅ (short-11) · only country inside a country · straightest border story · time-zone weirdness |
| 13 | **Music theory** | piano roll / fretboard as UI | `lib/piano.tsx` ✅ | the 4 chords in every hit ✅ (short-9) · why the tritone sounds evil · circle of fifths in 40s · why sad songs are minor |
| 14 | **Logic riddles** | minimal shapes + pause card | shorts kit only | wolf-goat-cabbage · 2 doors 2 guards · coin weighing |
| 15 | **"Numbers that don't feel real"** | scale zooms (million vs billion) | counters + zoom | million vs billion seconds · stadium of rice doubling · your heartbeats vs the sun's |
| 16 | **Cybersecurity awareness** | fake phishing UI in the browser clone — annotated | browser lib ✅ | the URL that isn't paypal.com ✅ (short-8) · `rn`→`m` lookalikes · why "123456" falls in 0.02s (live counter) · QR code scams |
| 17 | **Language / grammar** | typography morphs (affect→effect) | shorts kit only | commonly confused words · etymology trees · silent-letter history |
| 18 | **Poker / game odds** | cards are just rounded rects; odds bars | `lib/cards.tsx` | why you fold pocket jacks · pot odds in 30s · the math of bluffing |

## The queue (agreed 2026-07-10)

Goal: multiple niches, one per short, proving the FLOW (script → beats → linked shots
→ full video). Style/brand per-niche comes later. **The flow is now the `/make-short` skill.**

1. **short-1 · Chess** — "The 4-Move Checkmate — Punished" ✅ (voice + SFX audition)
2. **short-2 · Math** — "The ×11 Trick" ✅ (voice + SFX + 4 music-bed auditions)
3. **short-3 · Algorithms** — "Bubble vs Quick: The Race" ✅ (`lib/algo.tsx`, real instrumented sorts)
4. **short-4 · Dev tip** — "Undo Any Git Mistake" (git reflog) ✅ (`Short4Reflog`; persistent `lib/terminal.tsx` canvas — no new niche lib; git-accurate reset→reflog→restore session; voice + SFX audition). Added an additive per-line `hl` highlight to `lib/terminal.tsx`.
5. **short-5 · Probability** — "Monty Hall, Finally Intuitive" ✅ (`lib/prob.tsx`: `Door`/`Brace`/`ProbChip`/`TallyGrid`/`BigPct` + a REAL seeded `montyTrials`; the persistent 3-door canvas rewinds→annotates→collapses the 2/3 onto one door, then a live 100-game sim converges to SWITCH 66 / STAY 34; voice + SFX audition at −15.5 LUFS). Seeds the probability series: **birthday paradox · gambler's-fallacy coin run · false-positive medical test** all reuse `lib/prob.tsx`.
6. **short-6 · Excel** — "Excel Reads Your Mind" (Flash Fill / Ctrl+E) ✅ (`lib/sheet.tsx` built themeable; voice + SFX audition). Seeds an Excel series (XLOOKUP · $ absolute refs · pivot-in-10s) — all reuse `lib/sheet.tsx`, none built yet.
7. **short-7 · Kids story** — "Little Pip" ✅ — a NEW SUB-TYPE, not a TSX niche: 9 AI-generated 9:16 stills ken-burned in Remotion, over an emotion-tagged **ElevenLabs v3** VO (warm → playful → scared → crying → whisper → joyful). Built to stress-test the v3 delivery tags across a full emotional arc. Voice + SFX + final render. (This took the slot the Excel series had penciled in, so Excel's follow-ups slide to a later number.)
8. **short-8 · Cybersecurity** — "The URL That Isn't PayPal" ✅ (`Short8Phish`; reuses `lib/browser.tsx` — no new niche lib). One persistent browser canvas: the reveal is a **camera lift into the browser's own URL bar**, not a cut, with the login page dimmed but still behind it. Annotations live *inside* the URL string as self-positioned children of each segment, so nothing needs measured coordinates and the zoom magnifies them with the text. Voice + SFX audition at −16.1 LUFS.
   - **Fact-check that changed the script:** the planned capital-`I`/lowercase-`l` homoglyph (`paypaI.com`) **does not work in a URL bar** — the WHATWG URL spec's domain parser ASCII-lowercases the host, so it renders as `paypai.com` and the dot on the `i` gives it away. That trick is real only in link text / display names / sender fields. Replaced with the **subdomain trick** (`paypal.com.secure-login.net/login` → the real site is `secure-login.net`), which is the most common structure in actual phishing, is all-ASCII, and survives every browser defense because nothing about it is malformed. Rule taught: ignore everything after the first `/`, read right-to-left, the real site is the last two parts.
   - Added two **additive** props to `lib/browser.tsx` (`url` now accepts a ReactNode, rendered unclipped so annotations can escape the pill; `uiScale` sizes the chrome for vertical) plus a z-index so chrome paints above the page, as a real browser does. Existing 16:9 shots pass strings and default `uiScale: 1` — unchanged.
   - Seeds the **cybersecurity series**: `rn` → `m` (`arnazon.com` — the lookalike that *does* survive lowercasing) · "123456" falls in 0.02s (live cracking counter) · QR-code scams (the URL you can't read at all).
9. **short-9 · Music theory** — "The 4 Chords In Every Hit" ✅ (`Short9Chords`; new niche lib `lib/piano.tsx`). One persistent keyboard: the chords light and decay on it, six hit songs stack up over the loop, and the **twist rotates the SAME four chips in place** to vi–IV–I–V — the visual argument being that nothing new arrived, they just re-ordered.
   - **First short whose audio is MUSIC, not sound design.** New engine tool `tools/gen_chords.py` synthesizes the chords **deterministically** — equal temperament, A4 = 440, additive harmonics with a soft attack and long decay (Rhodes-ish, calmer under a voice than a grand). `gen_music.py` prompts a generative Music API for ambient beds and *cannot* deliver "A minor, exactly, at concert pitch" — and in a music-theory video an out-of-tune chord is a factual error. Exact pitch, exact frame, zero API cost, identical every run. The four one-shots (`piano-c-maj/g-maj/a-min/f-maj`) live in the SFX library, so `mix_sfx.py` places them like any other cue and the whole music series reuses them.
   - **One source of truth for timing:** `beats.json.piano.schedule` lists every chord press in global seconds; the TSX lights keys from it AND `sfx-plan.json` places the audio from it. Sound cannot drift from picture.
   - Facts verified: I–V–vi–IV = **C–G–Am–F** in C major; the twist is the *documented* rotation **vi–IV–I–V** (Am–F–C–G, the "sensitive female chord progression") which powers a genuinely different song set (Africa · Apologize · One of Us). We name song titles (not copyrightable) and play only the **chords** (progressions aren't copyrightable) — **no melody is ever reproduced**.
   - Seeds the **music series** (all reuse `lib/piano.tsx` + `gen_chords.py`): why the tritone sounds evil · the circle of fifths in 40s · why sad songs are minor (major 3rd → minor 3rd).

10. **short-10 · Money math** — "The 1% Fee That Eats 24% Of Your Retirement" ✅ (`Short10Fees`; new niche lib `lib/chart.tsx`). One persistent chart: two compound curves, the shaded gap between them, a live counter, and a share-bar. Opens the money-math niche (#7).
   - **Math verified before scripting, and re-verified BY the render.** $500/mo · 40y · monthly compounding: 7% net → **$1,312,407**, 6% net → **$995,745**, gap **$316,661 = 24.13%** of the bigger pot. `lib/chart.tsx`'s `contribSeries()` regenerates the curves at render time from the same formula the beats file states, so the drawn line, the head labels and the counter **cannot** disagree with each other. The title claims what the screen shows: "eats 24%".
   - **THE RETIME LESSON (new, and it generalizes).** The estimates grew the curves across the whole reveal — but the real ElevenLabs times have him naming *both pot values at 21.3s*, while the curves would still have been mid-growth showing ~$1.0M / ~$780K. **One animated quantity per spoken number, each landing on its own word:** curves land at 21.6 (under "one point three one million"), the counter runs separately 26.0→28.9 (under "three hundred sixteen thousand dollars"). Retiming isn't nudging cues by 0.2s — sometimes it means *splitting one animation into two*.
   - **The rewind earns the loop for free.** Frame 0 is the finished chart; the SETUP rewinds it to year 0; the REVEAL re-draws it. So the end of the reveal IS frame 0 again — the loop closes with no extra choreography, and the "undo the canvas" retention device does the setup's work.
   - Two smaller wins worth reusing: a **deposits line** ($240K, dashed) draws in during the setup so the chart is never an empty box for 9 seconds; and any label that lands on a filled area needs a **plate** (red-on-red-gap was illegible).
   - Seeds the **money series** (all reuse `lib/chart.tsx`): rule of 72 · the minimum-payment trap (balance curves + interest-as-share-of-payments `ShareBar`) · latte math done honestly · "your fee gap is bigger than everything you deposited" (the $240K line is already on screen).

11. **short-11 · Geography** — "The Map Lied To You" (Mercator) ✅ (`Short11Map`; new niche lib `lib/map.tsx` + `lib/geo/world.ts`). One persistent world map: Greenland **tears off the north and slides to the equator, shrinking as it goes**, and lands dwarfed inside Africa. Opens the geography niche (#12).
   - **The map's lie is COMPUTED, not drawn.** `lib/map.tsx` implements the actual Mercator formula over real Natural Earth 110m outlines (public domain, baked into `lib/geo/world.ts`), so the distortion on screen is one *our own code produces*, exactly as a wall map produces it. The on-screen counter (×16.2 → ×1.0) is **measured by shoelace off the projected polygon every frame**. Same ethos as `montyTrials` and `gen_chords.py`: never assert a number the code could compute.
   - **Facts, each cross-checked two ways.** True: Africa is **14×** Greenland (30.37M vs 2.17M km²; our rendered polygons independently give 13.6× — the 3% gap is 110m generalization). As *drawn on Mercator*: Africa's on-screen area is only **0.92×** Greenland's — i.e. **Greenland genuinely looks BIGGER than Africa**, which is a far stronger hook than "they look similar", and we only found it by measuring the polygons we were already rendering.
   - **THE BUG, and the rule it buys (new, and it generalizes to every map short).** Moving a country by *adding a lat/lon offset to every vertex* is wrong, and wrong in a way that renders plausibly: Mercator's **x depends only on longitude**, so a country dragged south keeps its full longitude span while its height compresses — Greenland arrived at the equator **squashed and far too wide**, still covering half of Africa, while the counter next to it read ×1.0. The fix is the **convergence of the meridians**: a vertex's east-west offset must rescale by **cos(φ)/cos(φ′)** as it travels, so the shape keeps its true ground size and *arrives* true-size. **On a map, translation is not a translation — the projection must be re-derived, not offset.**
   - **A camera is part of the payoff.** At world scale the true-size Greenland lands ~50px wide: technically on screen, completely unreadable. The map **pushes in 1.0→1.6× anchored on Africa**, tied to the same `slide` value, so the comparison happens close up — and the setup pulls back out for the one beat that needs the whole world ("Mercator stretches the world").
   - The rewind-earns-the-loop trick (from short-10) transferred perfectly: frame 0 is the *end* of the reveal, the setup rewinds it, the reveal re-plays it, and the loop closes for free.
   - Seeds the **geography series** (all reuse `lib/map.tsx`): the Peters/equal-area projections · the only country inside a country · the straightest border on Earth · time-zone weirdness · "your country is not where you think it is".

12. **short-12 · Physics** — "Astronauts Aren't Weightless. They're Falling." ✅ (`Short12Orbit`; new niche lib `lib/orbit.tsx`). Newton's cannonball, actually simulated. Opens the physics niche (#11).
   - **The arcs are INTEGRATED, not drawn.** `lib/orbit.tsx` is velocity Verlet under Newton's law of gravitation in SI units. Fire the same cannon at 3 / 5 / 7 km/s and it lands at 960 / 1,950 / 5,180 km downrange *because the math lands it*; fire it at 7.673 and the arc closes. Verlet is symplectic, so the check is brutal and it passes: **the orbital radius stays within 6771.000–6771.017 km across a full revolution — 17 m of drift over 40,000 km.** The ring closes because the physics closes it. (Naive Euler would have spiralled in and quietly faked a decaying orbit.)
   - **The globe is real too** — the same Natural Earth 110m outlines `lib/map.tsx` uses, re-projected *orthographically* onto the disc: keep the near hemisphere (z > 0), and close each visible run back along the limb so landmasses still fill against the silhouette. `lib/geo/world.ts` has now paid for itself twice.
   - **THE FACT-CHECK THAT CHANGED THE SCRIPT (and it was the whole video).** The brief said: it falls 4.35 m in one second, moves 7.7 km sideways, and *the Earth's surface curves away 4.35 m over that distance* — identical. The equality is real, but that sentence is **not**: the ground (r = 6371 km) is more sharply curved and drops **4.62 m** over a 7.67 km chord, a 6% error in the one number the entire video rests on. What *is* exactly 4.347 m is the sagitta of the **shell the station orbits on** (r = R + h = 6771 km) — and that shell is precisely what "the Earth curving away *beneath it*" means for something at altitude, because it's the surface of constant height above the ground. So `sagitta()` takes the radius as an argument, the shot passes `R + h`, and the VO says "the Earth curves away by **exactly the same amount**" — never naming a second, different number. **The claim on the track equals the number on the screen.** Rule: when a video's payoff is an equality, check *which two things* are equal, not just that they're equal.
   - **Gravity up there is 88.5% of ground level, not 89%.** Recomputed rather than trusted; the screen prints `8.69 m/s² — 88.5% of ground` and the VO says "nearly ninety percent". Same discipline caught the 3 km/s shot: an early beats.json said 970 km (from a rounded 8.7°); the integrator says 8.67° = **960 km**, and the code won.
   - **The orbit HUGS the globe, and that is half the argument.** 400 km is 6.3% of Earth's radius, so the ring sits ~23 px off a 330 px globe. Every cartoon parks the ISS far out in space; ours is skimming the surface — which is what makes "it's falling" even sayable.
   - The rewind-earns-the-loop trick (short-10/11) and the camera-is-the-payoff lesson (short-11) both transferred, and the camera one got sharper: the setup pushes in 2.8× on the tower so a 3 km/s hop isn't a 57-px scratch on the limb, and then **the 7 km/s shot literally outruns the frame and the camera pulls back to keep up**, arriving at 1.0 exactly when the orbit needs the whole globe. The pull-back *is* the reveal.
   - One new SFX recipe: `launch-thump` (a muffled mortar/rocket push, deliberately NOT a war-film cannon crack — brand §10's calm register). Audition at −15.6 LUFS.
   - Seeds the **physics series** (all reuse `lib/orbit.tsx`, which already exports `vEsc`/`period`/`gAt`): escape velocity · why the Moon doesn't fall · why rockets go sideways, not up · geostationary orbit · tides.

13. **short-13 · Kids science** — "Earth Never Makes New Water" (the water cycle) ✅ (`Short13Water`; new niche lib `lib/cycle.tsx`). The first short aimed at **children (~5–10)** — simple words on the track, the curriculum words (EVAPORATION · CONDENSATION · PRECIPITATION · COLLECTION) on the screen. Opens a kids-science niche and a **closed-loop conserved-particle** engine.
    - **The loop rule, finally taken literally.** The water cycle is the one topic whose content *is* a loop, so nothing is choreographed to fake one: 160 droplets sit at `frac(u_i + 4·f/1275)` on a closed path and every ambient motion (sun rays, waves, cloud bob, dash march) is `f/1275` times an integer. The composition is exactly 4 laps long, so the wrap is just another frame step. **The video loops because the cycle loops.**
    - **Conservation is structural, and the census MEASURES it.** There is no spawn and no despawn anywhere in `lib/cycle.tsx`, so the population cannot change even if the choreography is wrong. The twist beat prints five live counts bucketed off the actual particle array each frame — SEA · RISING · CLOUD · RAIN · RIVER churn while TOTAL sits at `DROPS.length` and never moves. Same ethos as `montyTrials`, the real Mercator and the Verlet integrator: the screen cannot contradict itself.
    - **THE LESSON, and it generalises to every short that claims a loop.** Beat-by-beat QA passed clean, and the loop still had a defect: `Sun` took `pulse` (a raw phase angle, `TAU·cyc·4`) and used it as a *magnitude* — `r * (2.6 + 0.12 * pulse)` — so the outer glow swelled 229px → 494px across the whole video and snapped back at the wrap. Invisible frame-by-frame; obvious the moment you **diff the last frame against frame 0 and compare it to an ordinary frame step**. Before: 8.1% of channels changed, ~3× a normal step. After `Math.sin(pulse)`: **2.16% vs 2.27% for frame 0 → frame 1** — the join is now *quieter* than an average frame transition. A stdlib PNG differ is enough; don't eyeball a loop, measure it.
    - **Focus, not cuts.** A soft radial dim closes onto the active stage and sweeps between them (following the water *up* from sea to cloud) while the cycle keeps running underneath — fully open at frame 0 and the last frame, which is what lets the loop close. It also fixes the problem an always-running cycle creates: rain falls from frame 0 and would give the quiz away, so the mountain stays dimmed until "It rains."
    - **Droplet alpha is the lesson.** Liquid is opaque; rising vapour fades to 0.22 and swells; in the cloud it fades back in. Evaporation and condensation are the *same property run in opposite directions*, so the science is the animation rather than a caption about it.
    - Two build notes worth reusing: rain that steers onto its landing point *late* (`w = t²`) stays bunched at the cloud exit for the whole fall and the spread never appears on screen — steer near-linearly and spread the START across the cloud's underside instead; and any line the particle stream converges onto (here the river) needs to be **much** wider than looks right in isolation, because the stream sits directly on top of it.
    - Seeds the **kids-science series** (all reuse `lib/cycle.tsx` — a new cycle ships a new `Geom`, not a new engine): the carbon cycle · the rock cycle · the nitrogen cycle · where your rubbish goes · food chains as a loop.

14. **short-14 · Kids science** — "A Plant Is Mostly Air" (how a seed becomes a plant) ✅ (`Short14Seed`; new niche lib `lib/grow.tsx`). Second in the kids-science niche, and the first short whose engine is **morphogenesis**: a growing tip integrated under **Sachs' sine law of gravitropism** (`ang += k·sin(target − ang) + bias + wander`, then a step forward).
    - **ONE SOLVER, FOUR CLAIMS.** The primary root, the oblique laterals, the shoot and the upside-down demo are the same function with different initial angles. The video's central claim — *plant a seed upside down and the root still turns down* — is therefore not animated: it is the primary root's own constants (k = 0.22, same wander, same seed) re-run from ang0 = −108°, and the sine law does the rest, turning slowest while inverted and fastest through horizontal. Same ethos as `montyTrials`, the real Mercator, the Verlet integrator and cycle.tsx's conserved particles.
    - **THE BUG THAT SHAPED THE ENGINE (new, and it generalises).** The hypocotyl hook was first a constant bias applied while the tip was underground. **A constant bias over a growing axis draws a circle** — measured at three strengths, the shoot coiled below the soil and then *uncoiled explosively* when the bias decayed. Weakening it only produced a lean, because near horizontal the sine law's restoring term is at its maximum (that *is* the law), so a bias barely above k creeps through at 0.02 rad/step and parks sideways. The fix: the hook is **local to the elongation zone behind the tip**, so it migrates upward with the tip and leaves a straight stem behind it — which is real basipetal straightening. Measured hook depth as it pushes up and unbends: 0 → 11 → 27 → 33 → 32 → 15 → 2 → 0 px. **Rule: when a bend is a property of a growing tip, apply it in the tip's frame. A term held constant along a lengthening body integrates to a circle.**
    - **The loop diff caught a SECOND kind of defect.** Short-13's rule (measure the wrap, never eyeball it) transferred and paid twice: 4.24% of channels changed against 0.06% for a normal step. One cause was familiar — `spin={f * 0.12}` left the sun's 12-ray ring 153° out of phase, fixed to `(f/END)*360`. The other was **not a scene defect at all**: the final caption was still on screen at the last frame while frame 0 has none. The captions kit holds the last chunk for `end + 0.8s`, so **a 42.5s short's last word has to finish by ~41.7s** — the whole twist block moved 0.6s earlier. After both: 0.24% at the wrap vs 0.07% for a normal step, all of it the progress bar. **Any short claiming a loop must check its captions, not just its pixels.**
    - **The camera lesson (short-11/12) is now unavoidable, and it killed short-13's focus trick.** A seed is 92px on a 1080px canvas: the first QA pass had the entire germination happening in a thumbnail of dirt under 950px of empty sky. The view now pushes to 1.75×/1.9× for the underground beats and **pulls back out with the rising shoot**. And a travelling radial dim — which was exactly right over short-13's dark landscape — reads as a **fog blob over a pale sky**, because the undimmed hole is *brighter* than its surround. It is now a constant gentle vignette; the camera does the focusing.
    - Two build details worth reusing: labels attached to world objects need a **counter-scale** (`scale(1/camS)`) to stay legible at any camera distance, and inset diagrams belong **outside** the camera group or it magnifies your annotations along with the scene.
    - **First short voiced by the FREE engine** (`gen_voice.py --engine edge --rate +12%`, Microsoft Edge Neural TTS — no key, no quota, still REAL per-word times). Every line fitted its window at tempo 1.00 (one at 1.03), so nothing was time-stretched. ElevenLabs Liam remains a one-flag swap.
    - Facts verified before scripting: ~95% of a plant's **dry** mass is C/H/O from CO₂ and water against ~5% soil minerals (so the bar is labelled DRY MASS and the VO says "dry it out" first) · radicle emergence is what completes germination · germination needs water, oxygen and warmth — light is not required by most species and soil not at all, which is why the chips are headed **TO SPROUT** rather than "to grow", since sunlight becomes essential at the twist and the video says so.
    - Seeds more of the **kids-science series** on `lib/grow.tsx` (a new plant ships new constants, not a new engine): how a tree drinks · why leaves are flat · the fungal network under a forest · why some seeds need fire.

15. **short-15 · Energy** — "Life Runs On 0.08% Of The Sun" ✅ (`Short15Sun`; new niche lib `lib/flow.tsx`). A **proportional flow network** (Sankey): sunlight enters as one trunk and splits into BOUNCES BACK 30% · WATER 23% · HEAT 46.9% · LIFE 0.08%. Opens an energy-ledger niche, and it is the first engine here whose subject is a *quantity being divided* rather than an object being moved.
    - **NOTHING IS GIVEN A WIDTH.** `flow.tsx` takes shares and multiplies them by the trunk; the trunk is `1361 W/m² × π(6.371e6 m)² = 173,549 TW` computed at render time, across Earth's *shadow disc* rather than its surface; and the last branch of every split is its parent's **REMAINDER** (`1 − 0.30 − 0.23 − 0.0008 = 0.4692`), so the four shares sum to exactly 1 on screen however a share is edited. Same ethos as `montyTrials`, the real Mercator, the Verlet integrator, cycle.tsx's conserved particles and grow.tsx's one solver.
    - **THE CONSEQUENCE THAT BECAME THE VIDEO (new, and it generalises).** An honest width mapping **has no floor**: 0.08% of an 800px trunk is **0.64 pixels**, so the branch the entire short is about *cannot be drawn*. A log or √ width scale would fix that by lying about the proportion — which is the one claim the diagram exists to make — so the widths stay true and a **loupe** magnifies the hairline, with `magFor(0.64, 28)` deriving **×44** from the ribbon's own width and printing it on screen. The video therefore states a claim about its own picture ("on this chart, that is less than one pixel") that its own picture proves. **Rule: when the payoff is too small to read, the fix is optical, not a distortion of the data** — the same move as short-11's camera and short-12's pull-back, applied to a value axis instead of a viewport.
    - **A SPLIT IS A MOVING POINT, NOT A FADING OVERLAY (the build bug).** Animating a Sankey split the obvious way is wrong twice, and QA caught each separately: fading children in **by alpha** puts a half-transparent grey bar across the column (a 0.92-alpha stream under a 0.1-alpha branch is a smudge, not half a branch — and the same stacking made a bright seam where the retracting trunk overlapped the drawing stream); and **trimming their length** leaves them hanging, with the parent running 150px past the point its children attach to. The fix animates *where the split happens*: `splitPoint()` raises the division out of the head line, the parent ends exactly there, the children fill the gap, and at s=0 every child is degenerate and draws nothing. **In a flow diagram, a partially-happened split is a split point in a different place. Animate the topology, not the opacity.**
    - **The loop rule (short-13/14) transferred and held first time.** The rewind earns it — frame 0 is the finished ledger, the setup un-draws it in reverse construction order to the bare trunk, the reveal re-draws it to the same numbers. The only thing always moving is the light packets, whose phase is `laps · f/END` with an **integer** lap count. Measured: **0.44% of channels changed at the wrap against 0.56% for an ordinary frame step** (outside the progress bar, which resets by design) — the join is quieter than an average frame transition, and it was right on the first measurement because the integer-lap rule was applied at construction rather than debugged in.
    - **The fact-check that changed a word.** The draft said one hour of sunlight **beats** everything humanity burns in a year. 625 EJ against ~620 EJ (2023) is true; against ~640 EJ (2024) it is false. The line became "**matches**", the two bars are drawn the same length, and the claim survives whichever year's figure you use. Same discipline as short-12's sagitta: check *which* two things are equal. Also kept exact: "nothing **here** makes energy" is a claim about the chart — geothermal (~47 TW), tidal (~3 TW) and fission are genuinely not solar, and together are ~0.03% of the trunk.
    - Two build details worth reusing: anything landing in a band over a bright beam needs **its own panel** (yellow bars and a yellow note were invisible against the trunk), and a card sharing a band with a cross-fading title must be **fully out before the title is in**.
    - Seeds an **energy-ledger series** (all reuse `lib/flow.tsx` — a new flow ships a new ledger, not a new engine): where a barrel of oil's energy actually goes · the calories in and out of a hamburger · where a country's electricity is generated and where it is lost · what a data centre does with a watt.
16. **short-16 · Tidiness** — "Your Room Has One Tidy State" ✅ (`Short16Room`; new niche lib `lib/order.tsx`). A room as **one permutation of 20 things over 20 places**, and three numbers read off that single array: the size of the state space (20! = 2,432,902,008,176,640,000), what living in the wrong part of it costs (11 places checked, 19 hours a year), and how far away the right part is (16 put-backs). Opens an **everyday-combinatorics** niche — the first engine here whose subject is a *configuration* rather than a quantity or a body.
    - **THE FINDING THAT BECAME THE VIDEO.** "Keep your room clean" is normally a sermon about character. The permutation model makes it a **base rate**: one arrangement is tidy and 2,432,902,008,176,639,999 are not, so mess is arithmetic, not a flaw. But that argues *for* despair — until the twist, which is a genuinely surprising theorem: **the size of a state space says nothing about the distance across it.** Sorting a permutation costs exactly `n − c` swaps, so twenty things are **never more than nineteen put-backs from tidy**, for every one of the 2.4 quintillion arrangements. The video's claim is not "be tidy", it is *the job is finite and here is its exact size* — the only version of this topic an adult can watch.
    - **ANIMATE THE THING THAT PRODUCES THE COUNT (new rule, and it generalises).** Easing tiles toward home while a counter ticks beside them makes the counter **decorative** — a second number, computed a second way, free to drift out of sync. Instead `sortStates(perm)` emits the array after each real put-back; the frame picks `k = floor(u·K)`, the tiles interpolate `states[k] → states[k+1]`, and the counter prints `k`. They cannot disagree because they are the same data, and `K = states.length − 1` is where the sixteen came from in the first place. Same move for the search sweep: it steps a seeded order and the *target* is selected as whatever that order reaches on look 11 (= `round((N+1)/2)`), rather than the sweep being staged to look like eleven.
    - **The model is the place; the mess is a pose.** A thing dumped in a place is still *in* it, so mess is a `jit` parameter (0 = dead centre and square, 1 = ±31px and ±15°) layered over a true permutation. That keeps the twenty-places claim honest while making tidy-vs-messy readable at thumbnail size, which a grid of correctly-boxed-but-wrongly-coloured tiles was not. Ten stroked glyphs × seven brand hues, paired `(i % 10, 3i % 7)`, so no two of the twenty look alike, and every place carries a 12% ghost of what belongs in it — which is what makes "wrong" legible with no labels at all.
    - **THE LOOP IS THE THESIS, not just retention.** Frame 0 is the mess; the rewind tidies it to state the model, the setup scatters it to show the space, the twist sorts it in sixteen, and the loop lets it **drift back to exactly frame 0's arrangement** — same jitter, same tilt, reached slowly instead of thrown. The video returning to its own first frame *is* the last line of narration. Measured with the stdlib PNG differ: **1.22% of channels changed at the wrap against 2.66% and 1.55% for the two ordinary frame steps beside it.**
    - **THE VOICE LESSON THAT COST A PASS (applies to every short from here).** `gen_voice.py`'s `clip` column is the **fitted** duration, not the raw one — a line reading `2.78 1.21` is really 3.36s of audio. Sizing windows from the 2.7 wps estimate said two lines were safe; Liam's sentence-stops made them 30% longer and both got a 1.30× squeeze. **Read the tempo column, widen by pushing the FOLLOWING line's start, re-run the voice stage alone, repeat until every row says 1.00** — and when a line cannot be widened without pushing the last line past the loop, **trim the line** instead (the twist's "never more than nineteen" was already on the panel for the whole beat, so the voice kept only what the picture could not say).
    - **Two measurements, not one, when balancing SFX.** For a cue under continuous speech, mixed-vs-voice-only in the same window is the truth (+1.5–2.5 dB delta = felt-not-heard and correct). For a cue in a word **gap** that same ratio reads +100 dB and is meaningless — there you need **absolute dBFS against the voice's own level**, and it found seven cues sitting 2–6 dB *above* the narration, which brand §7 forbids. Then level against the **series** (−14.3/−14.8 LUFS on short-14/15), not just against itself.
    - **A scrim is not free.** The hook's `AbsoluteFill` scrim sat over the SVG — where the hero number lives — and was dimming the thumbnail's brightest element to protect white type on a flat dark wall that needed no protection at all. Check what a full-screen overlay actually covers.
    - Seeds an **everyday-combinatorics series** (all reuse `lib/order.tsx` — a new video is a new set of things, not a new engine): the sock drawer (why pairs are the hardest case) · forty browser tabs · a toolbox · why a kitchen has a "one right place" and a garage does not · file trees.

20. **short-20 · Family health / chronobiology** — "School Starts Seven Nights Early" ✅ (`Short20Sleep`; new niche lib `lib/phase.tsx`). Twelve nights on a clock axis, each one a single scalar. Opens a **circadian** niche, and it is the first engine here whose subject is *when* something happens rather than how much of it there is.
    - **THE REFRAME.** "How to prepare kids for a new school year" is a shopping list — labels, shoes, a lunchbox — and all of it can be done in one afternoon, which is exactly why none of it is a video. The one preparation that *cannot* be done in an afternoon is the clock, and it comes with arithmetic: a phase moves about **fifteen minutes a night**, the seven steps between a holiday bedtime and a school one are going to be taken either way, and the only question is whether they happen in a week with an alarm in it. "Start bedtime earlier" is a nag; **"the same seven steps, moved seven days"** is a claim with a receipt.
    - **ONE SCALAR, AND THE THESIS IS ITS ARGUMENT.** A night is `phase`; `onset = 23:30 + phase`, `natural wake = onset + 9h`, `wake = school ? min(natural, 06:45) : natural`. The reveal and the twist are the *same solver* with one argument changed — the row the staircase starts on — which is what lets the video claim the two weeks are identical arithmetic and **show** it instead of asserting it. Three constants (onset 23:30, alarm 06:45, need 9h) produce everything: `1h45 / 15min = 7` nights, deficits 90+75+60+45+30 = **5h 00m**, and a twist that lands on a mathematically exact **zero**. Same ethos as `montyTrials`, the real Mercator, the Verlet integrator, cycle.tsx's conserved particles, order.tsx's replayed swaps, budget.tsx's read-back hub and kid.tsx's measured gaits.
    - **THE WEDGE IS THE THESIS, DRAWN ONCE.** Lost sleep is not a caption and not a second animation: it is literally the gap between where they *would* wake and where the alarm is, so it opens when the phase is late and closes by itself the instant the phase arrives. Nothing has to be kept in sync with it because there is nothing else. **Rule: when a video's claim is a difference between two quantities, draw the difference, not two things and a number.**
    - **THE ZONE HAS TO TRAVEL, or it quietly becomes a curfew.** The wake-maintenance zone (Lavie 1986; Strogatz/Kronauer/Czeisler 1987 — the ~2h before habitual onset is the *lowest* sleep propensity of the day) is circadian-phase-locked, so the band is anchored to **that row's own onset** and steps left with the staircase. That is the whole mechanistic answer to "why not just do it all on Sunday?", and it is why the two-hour attempt in the quiz is worth exactly **one** fifteen-minute step: the video shows you asking for two hours and getting fifteen minutes, and *then* names the rate. **The rate is derived from the demonstration, not announced before it.**
    - **THE READOUT CANNOT ARRIVE MID-CLIMB.** While the staircase forms, the rows it has not reached still carry their full 1h45 forecast wedge, so the sum on screen is the cost of a week that never adapts — 8h 45m, a number this video deliberately refuses to state, because it models the clock adapting *as fast as it can* and still charges five hours. The readout appears only once every row has stepped, where the drawn wedges and the printed total are the same five numbers. **A read-back readout is only honest at the frames where the drawing is finished.**
    - **THE SFX LESSON, and it is short-17/18/19's rule arriving from a new direction: A CUE CAN BE INAUDIBLE BY RMS AND THE LOUDEST SAMPLE IN THE PROGRAMME AT THE SAME TIME.** Two clicks measured +0.4 and +0.5 dB of RMS delta under speech — "INAUDIBLE" — so both were raised 5 dB. A half-second peak scan then put the programme's single loudest sample at **24.38s and then at 10.45s: those two clicks**, pushing the master to +0.3 dBTP. The cause is structural, not a mistake: the voiced master peaks at **−1.50 dBFS**, so a transient landing on the loudest phrase in the video has ~1.4 dB to work with and the RMS window it hides in is describing the narration, not the click. One was **deleted** (a cue that cannot be heard is not seasoning, it is peak risk — and the bracket it marked was already carried by a kicker and the caption); the other was re-tabled by its **dPeak** at ~+2 dB. Final: **−15.8 LUFS, −0.8 dBTP over a −15.9 LUFS voiced master — +0.1 LUFS of SFX over the narration, the tightest in the series, and it does not clip.**
    - **Matched gains beat matched measurements for a repeated cue.** One of the four staircase clicks turned out to sit in a word gap *inside its own line* (voice −38.4 dBFS there), so at its siblings' gain it would have kept the full +6.02 dB makeup and been the loud one of the four. It is tabled 5 dB down to **sound** identical, which is the only property a click-sequence has.
    - **THE VOICE LESSON, in the direction nobody warns you about: A WINDOW CAN BE TOO GENEROUS.** Short-16/19 taught sizing windows from measured raw clip length so nothing gets squeezed. Every line here came in at tempo 1.00 on the first pass — and that was the problem: Liam finished each line early, so the 3.4s pause card ended up with **1.4s** of real silence while 2.9s of slack sat unused in the tail. The whole reveal moved ~1s later, every gap is now ≥0.65s, and the quiz gets **2.2s**. **Read the gaps between the returned lines, not just the tempo column.**
    - The rewind-earns-the-loop trick transferred a seventh time, and this time it was structural rather than choreographed: the canvas is mounted on GLOBAL time outside every `<Sequence>`, so frame 0 and frame END-1 are the same two scalars evaluated twice and the join cannot drift. `loop_diff.py`: **0.312% of channels changed at the wrap against 1.440% for the frame step beside it — 0.22× a normal frame**, and what remains is the progress bar.
    - **Layout finding worth reusing: a divider between two blocks needs LANES.** The pills naming the two halves and the measure brackets over the first school row both wanted the same 80px band, and both were drawn there. Pills above the line, brackets below it, and a bracket's label moved to the **side** of the measure at the line's own height — which needs no vertical room at all and works for a 15px bracket as well as a 120px one.
    - Facts, floors throughout (short-18's rule): 9 hours is the **bottom** of the AASM 9–12 range for ages 6–12 (Paruthi et al., *JCSM* 2016), and the summer schedule the video draws — 23:30 to 08:30 — **meets** it, so the video never argues the holiday is the problem. The 15-minute bite is stated as the practice (AAP back-to-school guidance), never as a physical constant; the seven is 1h45 divided by it. Morning light after the core-temperature minimum is what phase-advances a human clock (Khalsa et al., *J Physiol* 2003), which is why the payoff line is about the morning and not about bedtime.
    - Seeds a **circadian series** (all reuse `lib/phase.tsx` — a new subject is a new phase and a new anchor, not a new engine): jet lag as the same staircase with a bigger gap · why daylight saving costs a week · why teenagers cannot fall asleep at ten (the zone moves later in puberty) · the shift worker who never arrives · why the weekend lie-in resets the whole thing.

21. **short-21 · School / child anxiety** — "Two Answers. One Makes It Worse." ✅ (`Short21School`; new niche lib `lib/avoid.tsx`). One week of mornings on one shared fear axis, five rows deep, and the whole video is the **gap between the two Friday curves**. Opens an **anxiety/parent-response** niche, and it is the first engine here whose subject is a *reinforcement map* — what today's answer does to tomorrow's starting height.
    - **THE REFRAME.** "How to handle school refusal" is a listicle and every item in it is advice. The thing that is actually mechanical is much narrower: at the door there are exactly **two** answers, they are the **same morning** up to that point, and the difference between them is not how today goes — it is where **tomorrow** starts. So the video draws the same climb once, forks it at the door, and runs both branches five mornings forward. "Don't let them skip" is a nag; **"the relief is the reward"** is a claim with a curve under it.
    - **THE HOOK IS THE LAST FRAME.** Short-10's rewind trick, taken further: frame 0 is the *finished* argument — five rows, ten curves, both multiples — and the setup **erases** it, growing row 0 from a 112px stack row into a 700px hero plot, because a morning nobody can read is not an argument. `spread` is the single scalar that is the whole layout (1 = stack, 0 = hero), the hook opens at 1 and the reveal puts it back, and there is **no `<Sequence>` around the canvas at all** — every scene reads the global frame, so frame 1259 evaluates the same scalars as frame 0 and the loop is *structural* rather than choreographed. Cheapest seamless loop in the series so far.
    - **THE HONEST FRAME IS THE ONE THAT KEEPS THE VIEWER.** The teal (stay) curve crests **higher** than the pink (rescue) one — `CREST = 1.10` — because at the door, going in *is* worse in the moment than being let off. A video that drew staying as instantly easier would lose the one parent who has actually tried it inside five seconds. The teal curve wins on the **next four mornings**, not on this one, and that is exactly what the stack shows.
    - **Nothing on screen is a keyframed number.** Every curve is sampled from `fearAt(u, peak, branch)` and both multiples are measured back off those sampled arrays (`multipleOf(branch)` = max of morning 5 / max of morning 1), so a mis-tuned constant prints a wrong multiple instead of hiding behind a right-looking one. The rates are a **stated premise**, not an effect size — chosen so five mornings land on exactly ×2.0 and ×0.5 — and the plot carries a `MODEL · FEAR, RELATIVE` tag from frame 0 to the last frame. Same ethos as `montyTrials`, the real Mercator, the Verlet integrator, cycle.tsx's conserved particles and phase.tsx's read-back debt.
    - **The twist is a category argument, drawn as geometry.** "You'll be fine, nothing bad will happen" is struck through and a thin pink tie runs from it **down to the pink branch** — a promise you cannot keep is the same rescue in a softer voice, so it lands on the same curve. That is a claim you can *point at*, which is why it beat saying it.
    - Sourced throughout, with the caveat on screen rather than hidden: negative reinforcement of escape (Mowrer 1947/1960; Kearney & Silverman, *Behavior Modification* 1990) · within-situation decline and a lower next start (Foa & Kozak, *Psych Bull* 1986) with the mechanism **label** explicitly left contested (Craske et al., *BRAT* 2014 — inhibitory learning, not habituation) · accommodation in >97% of parents of anxious youth (Lebowitz et al., *Depression and Anxiety* 2013), stated as "nearly every parent" per short-18's floor rule · and the two-part sentence itself from **SPACE**, where the children never met a therapist and the arm was noninferior to CBT (Lebowitz et al., *JAACAP* 2020;59(3):362–372, N=124) — printed as a source line under the whole video. The qualifier plate ("not bullying · not illness · not a school that is actually unsafe") is up through the entire setup **and** the quiz.
    - **SFX finding: one ripple wants a gain SLOPE, the other wants a flat table.** Two four-click ripples score the two weeks arriving. The pink one plays *under* thinning narration (voice −14.0 → −31.0 across its four clicks), so matched gains would have made the last two the loud ones — it runs −9/−9/−11/−13. The teal one plays almost entirely in a word gap, so it sits flat at −13. **Matched sound needed unmatched gains, and only on the ripple the voice was leaving.** Otherwise short-22's rule held again: the peak scan put the programme's two loudest windows on exactly the two cues the RMS column had just told me to raise. Final: **−16.1 LUFS, −1.1 dBTP**, and the loudest window in the programme is the first spoken syllable, not a cue.
    - Seeds an **avoidance series** (all reuse `lib/avoid.tsx` — a new video is a new door and a new pair of branches, not a new engine): the dog that gets walked past the thing it barks at · why checking the lock twice makes three times feel necessary · the phone call an adult has put off for six weeks · reassurance-seeking as the same curve with a shorter period · what "just this once" costs on a scale of five.
22. **short-22 · Learning science / parenting** — "Don't Do Your Child's Homework — Do This" ✅ (`Short22Homework`; new niche lib `lib/recall.tsx`). Two retention curves over a week, each one **two measured numbers and a power law fitted through them**. Opens a **memory** niche, and it is the first engine here whose x axis is logarithmic — because it has to be.
    - **THE REFRAME, and it is mostly about what we THREW AWAY.** The evidence everyone reaches for on this topic is the survey finding that parental homework help correlates with *worse* achievement (Robinson & Harris, *The Broken Compass*, 2014). We cut it: it is confounded by reverse causation — parents help the child who is struggling — and child fixed-effects models wash the association out. Building a video on the weakest available evidence for a claim that has a **randomised** one is the mistake. So the video never says helping hurts. It says something mechanical instead: **handing over the answer converts a retrieval into a re-reading**, and re-reading is the condition that wins tonight and loses in a week. **Rule: when a topic has both a scary correlation and a boring experiment, the experiment is the video.**
    - **THE PAYOFF IS DERIVED, NOT FOUND.** Roediger & Karpicke 2006 Exp. 2 gives four numbers — read it 4× → 83% at five minutes, 40% at a week; recall it 3× with no feedback → 71% and 61%. Fitting `R = r0(1+t)^-b` through each pair and setting them equal solves in closed form to **t = 0.7536 days = 18.09 hours**. Nobody published "eighteen hours"; it falls out of four published numbers and one standard forgetting law. That is the whole hook, and the title. **A derived quantity can be the headline as long as the screen says it is derived** — the marker reads `FITTED CROSSING`, and `beats.json.facts` records that only the *position* comes from the fit while the *existence* of a crossing is guaranteed by the data.
    - **THE ENGINE REPRODUCES ITS OWN SOURCE, which is the cheapest possible self-test.** `forgot(c) = (r0 − r7)/r0` off the anchors prints **52%** and **14%** — exactly the proportional-forgetting figures in the paper's Fig. 3, which we never typed in. If the anchors are ever edited wrongly, the bars stop matching a published number.
    - **A LOG X AXIS IS NOT A STYLE CHOICE HERE.** On a linear 0–7 day axis the crossing sits at 10.8% across the panel and is invisible on a phone. On `ln(1+t)` — the axis a power law is naturally read on — it lands at **27%**, and "tonight" and "next week" both get room. **Rule: pick the axis the model is linear-ish in, then check where the payoff lands in pixels.**
    - **NO TEXT MAY RIDE A MOVING CURVE HEAD.** The first build labelled each line at its own head. At the crossing the two heads are, *by definition*, the same point, so the two labels landed on top of each other — a bug the model itself guarantees. Values moved to `EndLabel` (after the lines separate) and to `Gap` (which measures them). A second version of the same bug: the `+21 POINTS` label, centred in a 190px gap, was struck through by the SHOWN curve passing behind it — gap labels now anchor to the **top** of the bracket, above the line they are measuring.
    - **THE CAPTION LESSON, and it cost a full VO rewrite: THE CHUNKER IS PART OF THE SCRIPT.** `chunkLines` breaks at four words, and the first two passes were splitting **"FORTY | PERCENT"** and **"SEVENTY | ONE"** across two cards — the two numbers the whole video turns on. Six lines were rewritten so every number falls *inside* a chunk: compound numbers hyphenated into single tokens (`eighty-three`, `sixty-one`, `eighty-six`), and a word added where a key phrase sat on a boundary ("So do not hand over the answer **tonight**." makes `Ask for it back.` start a card). **Write the line, then count to four.**
    - **THE VOICE TOOK FOUR PASSES AND EACH FOUND A DIFFERENT FAULT:** windows sized from a word count squeezed two lines (1.16×, 1.23×) and closed three gaps to 0.05s → sizing from measured clip length fixed that and exposed the caption splits → the rewrite changed every measured length so placement had to be redone → and at 42.5s the only way to fund every gap was to starve the quiz card to **1.05s** of silence, so **the composition grew to 43.0s**. **A pause card is a retention device, not a spacer; if the arithmetic says otherwise, lengthen the video.**
    - **THE SFX LESSON IS SHORT-20'S, ARRIVED AT BACKWARDS.** Pass 1 audited at **+0.4 dBTP** with four cues over the voice. Pass 2 lowered those four and the true peak went **UP, to +0.7**. `mix_sfx.py` has no loudness normalisation — only an `alimiter` at 0.97 — so the programme peak is not set by the loud cues, it is set by whichever transients ride the limiter, and a peak scan put the top **nine** 0.25s windows of the programme on **nine cue times**. Every click in the video was pinned to the ceiling while the RMS column called four of them INAUDIBLE. Re-tabling the whole sheet by **dPeak against the voiced master's own −1.49 dBFS** (not by RMS delta) dropped the transients 3–11 dB: **−16.0 LUFS, −0.4 dBTP, −0.1 LUFS of SFX against the narration.** **Rule: audit the peak scan before the RMS column — the RMS window describes the narration, not the cue.**
    - The structural loop transferred an eighth time: one scalar `u` (the sweep, 0 = tonight, 1 = test day), mounted on GLOBAL time outside every `<Sequence>`, is 1 at frame 0 and 1 at frame 1289. `loop_diff.py`: **0.312% of channels changed at the wrap against a 1.072% frame step beside it — 0.29× a normal frame.**
    - **The "do this" has its own source, and it is not withdrawal.** Patall, Cooper & Robinson (2008), *RER* 78(4): training parents in homework involvement raised completion and cut homework problems, and **rule-setting** had the strongest positive association of any involvement strategy. So the payoff chip is what to *say*, not what to stop doing.
    - Seeds a **memory series** (all reuse `lib/recall.tsx` — a new claim is two new anchors, not a new engine): the spacing effect (same total minutes, spread) · why cramming feels best and tests worst · sleep between study and test · highlighting vs a blank page · and the fluency illusion the confidence bars already half-tell.
23. **short-23 · Human biology / body facts** — "Born In 300 Pieces. Finished At 25." ✅ (`Short23Bones`; new niche lib `lib/bone.tsx`). A schematic skeleton on an age rail, where **every seam in the drawing is one group's openness at one age** and the big readout is those groups summed. Opens a **body-development** niche, and it is the first engine here whose subject is a *count that falls*.
    - **THE REFRAME, and it is about throwing away the number everyone stops at.** "Babies have more bones than adults" is a trivia card, and the number is the least checkable part of it — published newborn estimates run 270–300, because at birth much of the skeleton is still cartilage and the count depends on what you agree to count. So the number becomes the HOOK and the mechanism becomes the video: **a bone can only get longer at a gap**, so you are built in pieces with the seams left open, and the count only falls as the growing stops. **206 is not a body that lost parts, it is a body that finished** — and not at eighteen: the medial clavicular epiphysis closes at 22–30. **Rule: when the famous version of a fact is a number, check whether the number is the weakest thing you know about it.**
    - **HOW TO BE HONEST ABOUT A SOFT ANCHOR.** The two ends are modelled differently on purpose: seven groups, six of them documented fusions with published windows (frontal 2→1 at 3–19 months, hip 6→2, sternum, sacrum 5→1 at 16–30y, coccyx, clavicle 4→2 at 22–30y) plus **one honest aggregate** (`plates`, 275→198) that carries the residual so the ends land on exactly 300 and exactly 206. That anchoring is what earns the chip's leading **`≈`** on every value that is not one of the two anchors, with the 270–300 range on the source plate. **Rule: a fabricated breakdown presented as a census is worse than one bucket labelled as a bucket.**
    - **THE SOFT SPOT IS NOT DRAWN.** The five vault plates are wedges radiating from bregma, each pushed out along its own direction; the fontanelle is the **hole they leave behind**, so it closes exactly when they do and cannot be keyframed out of sync with them. Same class of win as recall.tsx's crossing: the interesting feature is emergent from the model, not a second thing to maintain.
    - **THE BUG THAT ATE TWO QA PASSES, and it is a new species.** `Skeleton` had `figureAt(age, 540, 400, 760)` hardcoded from the first layout draft while the shot had moved its viewport to `top 520 / H 630`. The camera targets were computed from the shot's constants and the drawing from the lib's, so **a whole skull was drawn 120px above the clip and simply vanished** — no error, no crash, just a headless skeleton that `check_short.py` cannot see. The figure box is now a required prop, and `femurOf()` / `seamFracs()` exist so the camera and the arrows read a bone's geometry from the same call that draws it. **Rule: when a lib draws and a shot aims, exactly one of them owns the coordinates.**
    - **SUTURES ARE TISSUE, NOT CRACKS.** Leaving the stage colour between the plates read as a *broken* shell. A membrane ellipse under the wedges fixed the anatomy and the tone in one line — the difference between "damaged" and "not finished yet". Related: yellow arrows drawn on ivory bone are invisible; the growth-plate annotation only landed once it moved off the bone against the stage.
    - **THE VO LESSON IS SHORT-20'S, CONFIRMED.** Windows sized at words/3.0 + 0.35s were too **generous** — Liam came in under every one at tempo 1.00, L10 measuring **1.66s in a 4.79s slot** — which left a 0.05s gap before the quiz question and 3.5s of dead tail. Re-placed from measured clip lengths, the composition came **down** from 45.0s to 43.5s with every gap at 0.80–1.00s and the card back to 2.60s of real silence. **Rule: size the first pass loosely, then place the second pass from what the voice actually did — in whichever direction it went.**
    - **THE SFX PASS FOUND AN ENGINE BUG, NOT A TASTE PROBLEM.** `audit_sfx.py` took its voice reference from a hardcoded **25.6–27.1s** window — continuous speech in *short-22*. On this timeline L6 ends at 26.69, so the window was 27% silence and read **−29.8 dBFS against a true −19.4**, flagging nine gap cues as LOUDER THAN VOICE when most sat 2–6 dB under it. Re-tabling on that reading would have made the whole sheet inaudible. `audit_sfx.py` now takes **`--ref-at`**. **Rule: before believing an audit, check that its reference window is inside a line.** A separate peak pass then found the entire +0.3 dBTP overshoot came from **one** cue — the pause-card click, landing in absolute silence where it takes the full duck makeup and has nothing for the limiter to work against. Final: **−16.1 LUFS, −1.2 dBTP**, 21 cues.
    - The structural loop transferred a ninth time: one scalar `u` (the rail, 0 = birth, 1 = twenty-five), mounted on GLOBAL time outside every `<Sequence>`, is 1 at frame 0 and 1 at frame 1304. `loop_diff.py`: **0.312% of channels changed at the wrap against a 1.988% frame step beside it — 0.16× a normal frame.**
    - **THE AXIS IS A POWER LAW, NOT A LOG.** Linear time crushes the first year and a log axis crushes the twenties, and this video needs both ends — the skull closes before you can walk, the collarbone when you can rent a car. `p = (age/25)^0.62` gives each about a third of the rail. **Companion to short-22's rule: pick the axis, then check where BOTH payoffs land in pixels.**
    - Seeds a **body-development series** (all reuse `lib/bone.tsx` — a new claim is new groups and new windows, not a new engine): baby teeth vs adult teeth · why you stop growing (and why the plates close) · why children heal faster · growth plates and youth-sport injury · why astronauts come back taller.
24. **short-24 · Learning science / parenting** — "Let Them Pick. Skip The Chart." ✅ (`Short24Reading`; new niche lib `lib/effect.tsx`). Six estimates on ONE effect-size axis, each with its 95% interval and its k. Opens an **evidence-quality** niche, and it is the first engine here that makes honesty *structural*: an `Est` cannot exist without a number, an interval and a study count, so a claim that cannot supply all three cannot be drawn.
    - **THE REFRAME, and again it is mostly about what we THREW AWAY.** "How to make kids love reading" pulls two famous correlations: books in the home, and minutes read per day (Anderson, Wilson & Fielding 1988). Both run in the obvious wrong direction — the parents who own books are different parents, and the child who reads more was already the better reader. Same cut as short-22's homework survey, same reason. The video is built on the **randomised** literature instead: choice is an intervention you can assign, and it has a meta-analysis. **Rule (third time): when a topic has both a famous correlation and a boring experiment, the experiment is the video.**
    - **THE INTERVAL IS THE ARGUMENT, not decoration.** The payoff is a NULL result — a reward given after the choice takes d from 0.35 to **−0.01**. A bar alone would read as "a small win"; the 95% whisker visibly straddling the zero line is the picture saying *indistinguishable from nothing* at the same moment the narration says "gone". **Rule: if the payoff is a null, the engine has to be able to draw uncertainty, or it will let you cheat.**
    - **PRINT THE k, ESPECIALLY THE SMALL ONE.** The reward cell is k = 5, the smallest in the set, and it is on screen under its own bar. The claim is not rested there: Deci, Koestner & Ryan (1999), **128 studies**, has engagement-contingent rewards at d = −0.40 and *more* detrimental for children — same direction, forty times the evidence. **Rule: a thin cell can carry a video only if the screen admits it is thin and something else corroborates it.**
    - **THE BRIDGE IS WHAT MAKES IT A VIDEO ABOUT READING AT ALL.** Patall et al. is choice across many tasks, not reading, and the video never says otherwise — the source plate names the choice paper explicitly. The single reading-specific sentence ("Kids paid in tokens read less") is sourced to a reading experiment: Marinak & Gambrell (2008), third graders, book-reward and no-reward beat token-reward on subsequent reading. **Rule: name the gap between the evidence you have and the claim you are making, then close it with one line that has its own source.**
    - **NARRATION RATIOS ARE DERIVED.** `CHILD_OVER_ADULT` = 0.55/0.25 = 2.2 ("twice as well") and `FEW_OVER_ONCE` = 0.61/0.21 = 2.90 ("nearly triples") are computed in the lib, so the script cannot drift from the table. Same trick as bone.tsx's summed count and recall.tsx's fitted crossing.
    - **FOUR SLOTS FROM THE START.** The three frequency bars mount into a 4-slot layout, so the fourth is a visible gap for fourteen seconds and nothing slides when it is filled. It is **labelled** at 22.87, half a second before the pause card asks "what does a reward add?", so the question has something to point at. The card itself had to move off the chart — at y=1000 it covered the very label it was asking about.
    - **THE VO LESSON, CONFIRMED A THIRD TIME.** Windows sized at words/2.91 + 0.30s — using the wps Liam MEASURED on short-23 rather than the skill's 2.7 — were *still* too generous (L7 came in at 1.16s in a 2.08s slot). Re-placed from measured lengths, the composition came DOWN from 45.0s to 43.0s. **The first pass is a measurement, not a placement.**
    - **THE SFX PASS REPEATED SHORT-22'S PARADOX EXACTLY.** After lowering three impacts the programme went **UP**, from −0.0 to +0.5 dBTP — because the two cues that had come *up* were clicks, and a click is almost all transient: dPeak +4.4 and +3.6 while the delta column read +0.5 and +0.8. Pulled back to −5, final **−15.8 LUFS, −0.5 dBTP** with nothing measuring INAUDIBLE. The two hero layers are deliberately opposite in shape: riser → *bright* impact on "triples.", riser → *deep* impact on "gone.", the second making the same promise as the first and breaking it.
    - The structural loop transferred a tenth time: `warm()`/`only()` on GLOBAL time, frame 0 == frame 1289. `loop_diff.py`: **0.312% of channels changed at the wrap against a 1.771% frame step beside it — 0.18× a normal frame.**
    - Seeds an **evidence-quality series** (all reuse `lib/effect.tsx` — a new claim is new `Est` objects, not a new engine): process vs person praise · screen-time limits · phonics vs whole language · sleep interventions · and any topic where the honest answer is "the interval crosses zero".

25. **short-25 · Family time / scheduling** — "Four People, One House, 15 Minutes" ✅ (`Short25Together`; new niche lib `lib/overlap.tsx`). Four people's days as strips of busy blocks, each person's free time drawn as the **complement** of their blocks, and the time they share drawn as the **intersection** of those complements — recomputed every frame from the blocks actually on screen.
    - **THE REFRAME IS ARITHMETIC, not evidence.** "How to make your family spend more time together" pulls the weakest literature available — family-dinner cross-sections, screen-time correlations, quality-time homilies — every one confounded by the households that could already hold a regular dinner. All of it was thrown away for short-24's reason. What is left is the thing nobody says out loud: **family time is not a SUM, it is an INTERSECTION.** Four people with plenty of free time can share almost none of it; adding free time to one of them can buy exactly zero; moving a single block two hours buys ninety minutes without giving anybody a minute back.
    - **NOTHING IS KEYFRAMED, so the bloom cannot lie.** `stateAt(slide, mumExtra)` returns the four block lists for the current frame and the free sets and intersection are computed off *those*, so while the training block slides the shared band grows continuously and correctly — the bloom is not animated, it is the arithmetic happening. Same ethos as `montyTrials`, `gen_chords.py` and the Verlet integrator: never assert a number the code could compute. Both narration ratios are derived (`RATIO` = 105/15 = **7**, `GAINED` = 15 − 15 = **0:00**).
    - **AN INTERSECTION IS A VERTICAL FACT, so it is drawn as one** — a column of light straight through all four strips at once, plus a solid segment inside each person's own track. You can see *why* the column is where it is by looking up and down it.
    - **A 15-MINUTE WINDOW IS 12 PIXELS AND STAYS 12 PIXELS.** The temptation was a minimum drawn width so the hook's column would read; that would make the picture lie about the one quantity the video is about. A caret + clock label does the finding instead. (0.81 px/minute over a 07:00–22:00 window on a 730px axis.)
    - **WHY MUM GETS THE EXTRA HOUR AND NOT DAD.** Dad finishing an hour early *does* buy 30 minutes, because his block is what holds the evening shut until 18:30. Mum's extra hour lands at 15:30–16:30, where dad is still at work, and buys **exactly nothing** — so hers is the demo that is true and clean. The dad variant is recorded in `beats.json.model` so the choice is on the record rather than hidden.
    - **THE SFX PASS FOUND SHORT-23'S BUG FROM THE OTHER DIRECTION.** `audit_sfx.py`'s default reference put continuous speech at −22.6 dBFS; sampling nine mid-line windows off `voice.wav` directly gives a true level of about **−19.2**. A 3.4 dB pessimistic reference made the first sheet wrong in BOTH directions at once — five cues printed LOUDER THAN VOICE that were, and nine printed INAUDIBLE that were. **Always establish the voice reference from the voice track before believing either verdict.** Then the peak pass repeated the rule: the programme's +0.8 dBTP was set by the finding-2 toggle landing at 0.00 dBFS in a window whose RMS was only −22.1 — the transient with no company, not the loud cues. Audition at **−15.9 LUFS, −0.6 dBTP**.
    - **EQUAL GAIN IS NOT EQUAL AUDIBILITY.** The two finding toggles are 0.33s apart and sit 2 dB apart on purpose: one lands ON the attack of "fades," and the other in its decay.
    - The structural loop transferred an eleventh time — every animated quantity is a product of two ramps that is 0 (or 1) at both f=0 and f=END−1 *by construction*, authored rather than debugged. `loop_diff.py`: **0.312% of channels changed at the wrap, 0.13× a normal frame step.**
    - Seeds a **coordination series** (all reuse `lib/overlap.tsx` — a new question is a new roster, not a new engine): a remote team across four time zones · two parents and a childminder · shift work · shop opening hours · the sleep *opportunity* window that is smaller than the sleep you need.

27. **short-27 · Family relationships** — "Your Family Is Not Four People" ✅ (`Short27Pairs`; new niche lib `lib/pairs.tsx`). A household drawn as the **complete graph** on its own roster, where every edge carries how much one-on-one time that pair has had this week. Opens a **relationship-structure** niche, and it is the **settling network** the next-slate table has been asking for since 2026-07-14 — the first engine here whose layout is *solved* rather than authored.
    - **THE REFRAME IS COMBINATORIAL, and it is the whole video.** "How to make your family happier in 10 minutes" pulls the weakest literature in the building — family dinners, togetherness scales, quality-time homilies, every one of them confounded by the households that could already hold a regular dinner. All of it was thrown away for short-24's reason. What is left is arithmetic nobody says out loud: **a family of four is not four people, it is six relationships**, and an evening with all four in the room is one of them, the group's — because inside a room with four people in it, *nobody is alone with anybody*. That last sentence is a definition made visible, not a claim, which is exactly why it survives fact-checking.
    - **NOTHING IS TYPED TWICE, so the twist cannot disagree with the hook.** The roster is the only authored content; `pairsOf()` generates C(n,2) at render time and every number on screen — PEOPLE, RELATIONSHIPS, MIN / WEEK, the slots on the day rail, and the `n` inside the formula chip — is counted off the nodes and edges actually drawn on that frame. Adding GRAN to the roster re-argues the entire video. Same ethos as `montyTrials`, the real Mercator, the Verlet integrator, cycle.tsx's conserved particles and overlap.tsx's recomputed intersection. The shot also *asserts* it: a module-level check throws if the generated edges disagree with n(n−1)/2, or if the six turns on the timeline are not a permutation of the six relationships.
    - **THE LAYOUT IS THE ARGUMENT SOLVED, NOT AN ANIMATION OF IT.** `relax()` is a deterministic spring relaxation in which each edge's REST LENGTH is a function of its own charge — a pair that has had its ten minutes wants to be near, a pair that has had nothing wants to be far — so the network visibly tightens as the week fills. It is a pure function of the charges (fixed anchors, fixed iteration count, no state between frames), which is also why the loop is exact to the pixel.
    - **A SETTLING LAYOUT NEEDS A STIFFER ANCHOR THAN IT LOOKS LIKE IT DOES (new, and it generalises).** At `kAnchor = 0.045` the four-person ring was beautiful and the five-person twist was broken: GRAN's four *starved* edges (rest 470) pushed her to radius 320 and dragged the other four into a clump on the far side, labels overlapping. The fix was measured, not eyeballed — a sweep over kAnchor × near/far printed the ring radius and the minimum node-to-node distance for fed-4, starved-4 and twist-5, and `kAnchor = 0.13` keeps the fed/starved contraction visible (215 → 261 px) while holding the twist inside 217..289. **When a force layout has to stay legible under a changing roster, tune the anchor against the WORST roster, not the prettiest one.**
    - **THE TWIST TICKS, IT DOES NOT CUT.** GRAN's four lines are drawn one at a time, 8 frames apart, under the words "four relationships," — so RELATIONSHIPS counts 6-7-8-9-10 while the narration says "four", and the formula chip re-prints itself as 5 × 4 / 2 = 10. One person joining a household of four adds four relationships; in general a joiner adds n, the size of the household they joined. Nobody's ten minutes multiplied.
    - **A LABEL AN EDGE CROSSES IS A LABEL YOU CANNOT READ** — short-19's value-separation lesson, transferred from limbs to typography. Every node name and sub-label carries a stage-coloured `paint-order` halo (11px / 9px), so the graph passes *behind* the text instead of through it; the same halo is what lets the evening hull's dashed outline cross the roster at all.
    - **THE PAUSE CARD SITS ON THE ANSWER, NOT ON THE SUBJECT.** The first cut put it over the middle of the graph, hiding the four people the viewer is being asked to count. It now sits at y1180 **on the readouts**, which fade out with the question and come back with the reveal — the household stays fully drawn, and the number that answers it is gone. Short-26's rule, applied to a different half of the screen.
    - **The rewind earns the loop a seventh time.** Frame 0 is the finished week; the setup rewinds it; the reveal rebuilds it, so the end of the rotation IS frame 0 again. Every animated quantity is a product of ramps that is 1 (or 0) at both ends by construction, the ring anchors are mixed by GRAN's own presence so nobody teleports, and the formula chip is deliberately ON at frame 0 as well as at the end (short-18's rule: audit every string that fades in). `loop_diff.py`: **0.312% of channels changed at the wrap against 0.529% for a normal frame step — 0.59× an ordinary frame.**
    - **THE SFX PASS ADDED A THIRD KIND OF PASS.** Levels, then PLACEMENT, then peak. The couple's ring at 24.31 read INAUDIBLE at −8 dB and *still* read INAUDIBLE at −2: six extra dB moved the delta by 0.5, because the attack of "couple" and the sidechain duck own that window between them. The fix was not gain, it was **0.31 seconds** — moved into the gap after the word it lands at −6 and reads +1.6. **When a cue will not come up, move it before you raise it.** Then the peak pass repeated the series' oldest lesson exactly: the programme sat at −0.2 dBTP and a 0.25s scan named the one cue in a line, `pop-reveal` on "Ten now, not six." hitting −0.23 dBFS on an RMS of −21.1 while the audit's delta called it a harmless +0.9. Final: **−15.8 LUFS, −1.2 dBTP** over a −16.0 / −1.5 voiced master, with the top five peak windows now all voice.
    - **THE VOICE FELL BACK MID-BUILD, and the pipeline held.** The ElevenLabs measurement pass returned Liam at 2.81 wps and then the account's free tier was disabled between two lines (401 `detected_unusual_activity`). The whole track was re-measured and re-cut on the keyless fallback the skill documents — Edge Neural TTS `en-US-AndrewMultilingualNeural` at `--rate +12%`, 2.92 wps — and because edge-tts returns real word boundaries too, **the captions stayed word-exact**. Twelve lines, 100 words, every tempo 1.00, nothing time-stretched. Worth knowing: the fallback is a genuine fallback, not a downgrade of the contract.
    - Facts: the video's ten minutes deliberately **overshoot** the sourced dose. The daily one-on-one that has actually been randomised is **five minutes** — PCIT's Child-Directed Interaction home practice (meta-analysis Ward, Theule & Cheung 2016, *Child & Youth Care Forum* 45(5), 12 studies, 254 treated / 118 control, **d = −1.65**) — and the plate prints the setting: clinic-referred 2–5s with conduct problems, not typical households. Short-18's floor rule, applied to a prescription: promise more effort than the evidence asked for, never less.
    - Seeds a **relationship-structure series** (all reuse `lib/pairs.tsx` — a new question is a new roster and a new charge schedule, not a new engine): a team's one-to-ones · the group chat that is not the same as the friendship · a class of thirty (435 pairs) and why the teacher cannot know them all · the support network that shrinks when you move · who a new baby actually costs.
28. **short-28 · Habits / environment design** — "How to Start Your Day Without Checking Your Phone" ✅ (`Short28Morning`; new niche lib `lib/route.tsx`). A flat drawn in METRES, a walking route with arc-length parametrisation, and stops that light when the walker actually reaches them. Opens a **space / proximity** niche, and it is the first engine here whose subject is **a body moving through a room**.
    - **THE REFRAME.** The topic is normally a willpower sermon. The mechanical version is smaller and usable: **if your phone is your alarm, your hand has to pick it up to switch it off**, so the first check is step two of silencing an alarm, not a decision. The fix is to move the phone, not to resist it: charge it in the kitchen, put a cheap alarm across the room, and the route to the phone passes the curtains and the tap. "You didn't resist the phone. You just reached it last." The VO keeps the alarm claim CONDITIONAL ("If it's your alarm"), so it needs no prevalence statistic.
    - **NOTHING TYPED TWICE.** A stop is given the OBJECT it belongs to; `placeStops()` projects it onto the route, so its station, its order and "3 THINGS BEFORE THE PHONE" / "16.8 m walked" are the route's own arithmetic, and the readout counts the walker's actual arc position. The shot throws if the phone stops being the last stop or the nightstand phone leaves arm's reach. Same ethos as `montyTrials`, the Verlet integrator and overlap.tsx's recomputed intersection.
    - **THE EVIDENCE AND ITS GAP, BOTH ON SCREEN.** The only measured claim is the Cochrane proximity review (Hollands et al. 2019): food placed farther away is eaten less, SMD −0.60 (95% CI −0.84 to −0.36), 12 studies, 1,098 people, **low certainty**. It is food, not phones, and the plate says so. That's short-24's rule: name the gap, don't hide it. Cut: Olson et al. 2022 (an RCT, but of a ten-nudge BUNDLE, so it can't credit the bedroom move alone; a secondary-source "−1.6 points" figure was unverifiable) and Wood/Quinn/Kashy's 43% (true, cut for length).
    - **THE VOICE LESSON, CONFIRMED A FOURTH TIME.** ElevenLabs Liam came in at tempo 1.00 on every line with ~4s of slack. Re-placed from measured clip lengths (~0.65s gaps, 2.8s of real quiz silence), the composition came DOWN from 45.0s to **42.0s**. The re-placement re-used cached clips, so nothing was billed twice.
    - **THE SFX LESSON, AGAIN, AND IT WAS THE OPTIONAL CUE.** Pass 1: −15.7 LUFS, **+0.2 dBTP, clipping**. The 0.25s peak scan named one cue: an `optional` `ui-click-soft` on "pick" at −0.10 dBFS (+5.2 dB of peak) that the RMS column had called felt-not-heard. It was deleted, not re-gained. Two more transients were re-tabled by dPeak. Final **−15.7 LUFS, −1.2 dBTP** over a −16.1 voiced master, with the top five peak windows all voice. Stations 2–3 and the "morning" shimmer still read INAUDIBLE by RMS under continuous speech and were left there on purpose (short-17: the duck owns them).
    - The structural loop transferred again: the canvas is mounted on GLOBAL time with no `<Sequence>` around it, and frame 0 is the finished walk that the setup rewinds. `loop_diff.py`: **0.312% of channels changed at the wrap vs 1.837% for a normal frame step (0.17×)**.
    - Seeds a **proximity series** (all reuse `lib/route.tsx`; a new video is a new plan and a new stop table, not a new engine): the fruit bowl vs the biscuit tin · where the gym bag lives · why the TV remote wins · the desk that makes you stand · the supermarket layout that walks you past everything.
29. **short-29 · Sleep / everyday psychology** — "How to Stop Overthinking at Night" ✅ (`Short29Mind`; new niche lib `lib/loops.tsx`). Four unfinished tasks as **open loops on tilted orbits inside a head**, and a notepad that takes them off it. Opens an **open-loops** niche, and it is the first engine here where **text is the orbiting body**: depth-sorted, bigger and brighter at the front of the ring, which is literally "the front of your mind".
    - **THE REFRAME.** The topic is normally a list of calming tricks. The mechanical version: an unfinished task stays switched on until it has a PLAN (Masicampo & Baumeister 2011, *JPSP* 101(4): plan-making eliminated the intrusive thoughts unfulfilled goals caused), and at night nothing competes with it. So the video doesn't calm the thoughts, it **closes** them. Suppression is covered with its weaker claim ("doesn't close it"), because Harvey 2003's longer sleep onset was *estimated*, not measured.
    - **THE CONTROL IS THE TWIST.** Scullin et al. 2018 (*J Exp Psychol Gen* 147(1), N=57, randomised, PSG, first lab night): 5 minutes on a to-do list → asleep in **15.82 min**, 5 minutes listing what you'd already done → **25.09 min** (d = .63). Same pen and same five minutes, so it isn't the writing, it's the closing. The plate draws both means as bars and **computes** the 9.3-min gap; the VO says "nine". Cut: the Zeigarnik MEMORY effect, since Ghibellini & Meier's 2025 meta-analysis (*Humanit Soc Sci Commun* 12) finds no memory advantage, only a tendency to resume. The video never says "Zeigarnik".
    - **CUES ARE READ, NOT TYPED (new, and it generalises).** Every cue constant is `wAt(line, 'word')` over `vo.gen.ts`, and a missing key throws. The VO was re-placed three times (merged a line, then 46.0 → 44.0s) and the picture never desynced once. **Rule: if the composition can import the word times, it should never hold a copy of them.**
    - **THE ORBIT PHASES ARE SOLVED FROM THE SCRIPT.** `phase0 = 0.25 − laps·f_word/END`, so each thought is exactly at the front of its ring on the frame its own name is spoken ("Email, rent, dentist, slides."), and it is written down at the moment it comes back. Laps are integers, so the loop is still structural. CAME BACK ×N is `comebacks()` counting front-of-ring crossings of open thoughts. Same ethos as `montyTrials`: never assert a number the code could compute.
    - **VOICE: THE MEASUREMENT PASS WAS THE LONG ONE THIS TIME.** Liam read at ~2.6 wps and the draft would have run ~50s. The fix was to merge two setup lines that made the same claim, not to squeeze them. The second pass came back with different clip lengths (a 1.11× squeeze on a line pass 1 had fitted), so **re-generated lines are new measurements too**: re-place from the latest `clip × tempo`, never from the pass before.
    - **THE SFX LESSON, A THIRD TIME, AND AGAIN IT WAS THE OPTIONAL CUE.** Raising seven INAUDIBLE cues took the programme to −0.1 dBTP. The peak scan's top window was the optional `pencil-scribble` (+10.5 dPeak over a −12.3 dB voice). It was deleted, not re-gained; so was a toggle that stayed INAUDIBLE at two gains because the attack of "coming" owned its window. Final **−15.8 LUFS, −0.8 dBTP** over a −16.1 voiced master, 17 cues.
    - Loop: `loop_diff.py` **0.312% at the wrap vs 1.496% for a normal step (0.21×)**.
    - Seeds an **open-loops series** (all reuse `lib/loops.tsx`; a new video is a new set of thoughts and a new closing action, not a new engine): the tabs you never close · the Sunday-night dread · why a half-finished chore nags harder than an unstarted one · the inbox as orbits · the worry-time appointment.
30. **short-30 · Habits / everyday health** — "How to Drink More Water Every Day" ✅ (`Short30Drink`; new niche lib `lib/fluid.tsx`). A day strip with eight triggers, one 250 mL cup on each, and a tall glass whose fill is **eight counted bands**. Opens a **liquid** motion language: the first engine here where something *sloshes*.
    - **THE REFRAME.** The topic is normally a listicle (carry a bottle, set reminders). The mechanical version: "eight glasses a day" is a number with **no moment on it**, so it is a *time-based* intention: you have to remember it yourself, all day. Tie each glass to something that already happens and it becomes *event-based*, and the event does the remembering (Einstein & McDaniel: time-based prospective memory relies on self-initiated retrieval, event-based is cued). Same eight glasses in both halves; only the triggers change. Payoff: "Same eight glasses. Every one has a moment."
    - **THE LIQUID IS INTEGRATED, NOT KEYFRAMED.** `simulateSurface()` is a damped 1D wave equation (c² = 0.28, reflective walls, mean subtracted every substep so a splash moves water but never creates any), excited ONLY by the streams that land on it, precomputed once for the whole composition so any frame renders the same in any order. The shot **throws** if the surface is not calm at the wrap (`quietBy(SIM, END-1) > 1%`): the loop contract is measured at module load, not hoped for.
    - **VOLUME IS CONSERVED ON EVERY FRAME.** Cups + glass = 2.00 L at all times: the setup's rewind streams each band back up into its own cup (last-poured first), the reveal pours it back down. The readout is `columnPx / LITRE_PX`, the bands read back; "8 OF 8" counts full bands.
    - **POURS ARE THE CURSOR'S ARITHMETIC.** The cursor keyframes are pinned to the spoken words (WAKE on "Wake", COFFEE on "coffee"…) and each cup pours on the frame the cursor *crosses* its trigger, found by scanning, so DESK, BREAK, DINNER and TEETH pour wherever the line puts them. A stream path rises out of the lip, crosses over the mouth and falls **straight down** (a cubic with its second control point directly above the landing), so it never cuts through a wall.
    - **Two QA catches worth reusing.** A depth gradient drawn as a rect painted a dark stripe *above* the water: shading must take the surface's own shape. And the trigger dots were `fired` by frame index (hollow at f0, filled at the wrap), which broke the loop until they were read off each cup's own fill. **A state that is "done" at frame 0 must be derived from the model, not from time.**
    - **VOICE:** ElevenLabs Liam; pass 1 squeezed the hook 1.18× and the four-item list 1.25×. Re-placed from `clip × tempo` with 0.25 s gaps and ~2.9 s of quiz silence: every line 1.00, composition **38.0 → 36.5 s**, nothing re-billed.
    - **SFX:** one new library clip, `water-pour-glass` (the only genuine miss), as an eight-landing sequence re-tabled to *sound* matched (gap pours −8, the half-gap DESK pour −10, under speech −6). The peak scan put pass 1's two loudest windows on cues: the optional plate-swap whoosh was deleted, and so was the LAND whoosh, which was INAUDIBLE at −13 but still the programme's loudest window. Final **−15.9 LUFS, −1.1 dBTP**, 19 cues. Loop: `loop_diff.py` **0.322% at the wrap vs 1.738% for a normal step (0.19×)**.
    - Facts: Gollwitzer & Sheeran 2006 (94 tests, d = .65, drawn on Cohen's ruler rather than translated to a percentage) · Killer et al. 2014 PLoS ONE (50 habitual coffee drinkers, 4 × 200 mL coffee vs water, no hydration difference; corroborated by Maughan et al. 2016's beverage hydration index). **Not claimed:** any daily requirement. "Eight glasses" is named only as the familiar number (Valtin 2002: no scientific origin; NASEM 2004's 2.7/3.7 L is TOTAL water incl. ~20% from food).
    - Seeds a **liquid series** (all reuse `lib/fluid.tsx`; a new video is a new pour table, not a new engine): where a litre of tap water actually goes · how much sugar is in the bottle (layered bands) · the bathtub model of debt / CO₂ (inflow vs outflow) · caffeine half-life as a draining glass · why a full cup spills when you walk.

31. **short-31 · Everyday psychology / procrastination** — "Stop Procrastinating. In Ten
    Seconds." ✅ (`Short31Start`; **reuses** `lib/avoid.tsx` from short-21 — no new niche lib). Five
    tries at the same dreaded task on one shared resistance axis; the first video to prove the
    "avoidance series" seed line from short-21 literally — a new video is a new door and a new
    pair of branches, not a new engine.
    - **THE REUSE REQUIRED GENERICIZING THE LIB, NOT JUST RESKINNING THE SHOT.** `avoid.tsx` had
      the school scenario hardcoded into six places — `DAYS`, `'WAKE'`, `'THE DOOR'`, `'BY
      FRIDAY'`, `'SAME CHILD'`, the qualifier/source/false-comfort strings. Each got an optional
      prop with the original text as its default, so short-21 is byte-for-byte unaffected and
      short-31 passes `TRY 1..5` / `SEE IT` / `START` / `BY TRY 5` / `SAME TASK` and its own
      qualifier, source line and struck-through quote. **Rule: "reuse the engine" is a promise
      about the MATH (the iterated map, the sampled curves) — the display strings are part of
      the interface too, and the first reuse is what proves whether they were actually generic.**
    - **THE REFRAME.** "How to stop procrastinating" is a listicle of productivity hacks. The
      mechanical version is short-21's model applied one level up: escaping an aversive task is
      negatively reinforced (Mowrer 1947/1960) exactly as escaping a feared situation is, and
      procrastination researchers have their own name for the same short-term trade — Sirois &
      Pychyl 2013's mood-repair account: avoidance fixes how you feel NOW at the cost of a worse
      encounter later. The "ten seconds" technique is not a new mechanism, it's the OLD one
      (Foa & Kozak's habituation, already carrying short-21's honest Craske et al. 2014 caveat)
      pointed at the size of the commitment rather than the size of the task: small enough that
      starting doesn't need motivation, big enough to already be inside it.
    - **"TEN SECONDS" IS DELIBERATELY NEVER A CHART UNIT.** The curve's `u` axis is relative and
      unitless (short-21's own convention), so putting a literal second-count on it would claim
      precision the model doesn't have. "Ten seconds" only ever appears as spoken self-talk —
      the size of the promise ("I just need ten seconds") — and `beats.json.facts` says so
      explicitly: a commitment-sizing heuristic, not a measured physiological constant.
    - **THE TWIST REUSES short-21's FalseComfort SLOT FOR A DIFFERENT WRONG ANSWER.** Where
      short-21 struck through false reassurance, short-31 strikes through "I'll start when I
      feel motivated" — grounded in Jacobson et al. 1996's behavioral-activation trial (acting
      without first changing thoughts or motivation matched full CBT). Same component, same
      tie-to-the-avoid-branch move, different bad advice for a different door.
    - **VOICE, FIRST TRY, NO SQUEEZE PROBLEM.** ElevenLabs Liam, all 10 lines at tempo 1.00-1.14
      — the three reveal lines ran slightly hot (1.10-1.14) but never crossed the squeeze
      threshold that forced a rewrite in short-16/19/23/24. Cue frames were then retimed once
      against the REAL word timestamps (every `_A`/`_B` constant lands on a specific word,
      documented inline) rather than shipped on the pre-voice estimate.
    - **SFX SHEET WAS COPIED POSITION-BY-POSITION FROM short-21's AUDITED TABLE** (same voice,
      same engine, structurally the same beat shape), then re-verified with `audit_sfx.py`
      against THIS take's actual voice levels rather than assumed to transfer: **-15.8 LUFS,
      -0.5 dBTP**, no clipping. Two hero layers (the cliff/relief, the closing brace) and two
      four-click ripples (the pink stack building, the teal stack shrinking) carried over intact;
      several ripple clicks read INAUDIBLE by RMS under continuous narration, same as short-21's
      accepted pattern for that exact cue shape — left as designed rather than raised into a peak
      problem, on the record here for the user's ear rather than resolved unilaterally.
    - Confirms the **avoidance series** is real, not aspirational (all reuse `lib/avoid.tsx`,
      generic labels now proven by a second door): the phone call put off for six weeks · the
      dog walked past what it barks at · checking the lock twice · reassurance-seeking on a
      shorter period · "just this once" on a scale of five.
32. **short-32 · Identity / self-improvement** — "One More Vote Changes The Count" ✅
    (`Short32Identity`; new niche lib `lib/vote.tsx`). A week of small actions as **votes cast
    into one of two competing self-labels**, drawn as two chip stacks whose taller side names
    the identity currently in force. Opens an **identity-vote** niche, and it is the first
    engine here whose subject is a self-label that FLIPS at a majority threshold.
    - **THE REFRAME.** "How to become who you want to be" is a stack of pep-talk slogans —
      visualize your future self, fake it till you make it, believe in yourself. None of it is
      checkable and none of it is a picture. The mechanical version is self-perception theory
      (Bem, 1972): identity isn't decided, it's INFERRED from the balance of your own past
      behavior. So the video draws a tally, not a decision — `voteSeries(schedule)` is the only
      authored content, and the label above the ledger (`leaderOf()`) is read off whichever side
      is winning, never typed. Same ethos as `montyTrials`, the real Mercator and every counted
      readout in the series.
    - **ONE SCALAR RUNS BOTH DIRECTIONS, FOR FREE.** `revealCount` rising casts votes in
      schedule order (Mon..Sun); falling — the setup's rewind — it un-casts them in the exact
      reverse order, because both directions are the same interpolation between adjacent
      cumulative states (`voteSeries(schedule)[k]` at a fractional `k`). No reverse-animation
      code was written; rewind and build are the same function read backward.
    - **THE HOOK IS THE FINISHED LEDGER**, short-10/17/21's rewind-earns-the-loop trick again:
      frame 0 is the week's final tally (2-5, "A RUNNER"); the setup erases it to empty; the
      reveal rebuilds it; twist and payoff never touch the ledger's numbers again, so the loop
      closes because nothing after the reveal has anywhere left to go. `loop_diff.py`: **0.312%
      of channels changed at the wrap** (the series' usual figure, entirely the progress bar) —
      though the tool's own "normal frame step" reference is a false alarm here since both ends
      of this video hold static frames, driving its ratio heuristic to 540× instead of the
      usual ~0.2×. The absolute number is what matters and it matches the series' baseline.
    - **A CAMERA MOVE, BORROWED FROM short-16's `spread`.** The twist needs room for two
      CompareBars the ledger's full-size layout doesn't have, so a single `compact` scalar
      shrinks the SAME ledger to a top recap (not a cut to a new scene) and expands it back
      before the loop needs the full-size frame again — the continuity rule holds because it's
      one component's timeline, not two components.
    - **THE FACT-CHECK.** Freedman & Fraser (1966), *JPSP* — the foot-in-the-door experiment:
      homeowners who first agreed to a small request complied with a large follow-up (a big
      "Drive Carefully" yard sign) at **76%**, versus **17%** asked cold, corroborated by two
      independent sources. The weekly 2-5 vote split is explicitly logged in `beats.json.facts`
      as an illustrative model of the mechanism, not a measured statistic — short-16's honesty
      rule, applied to a mechanism instead of a state-space size.
    - **THE VOICE LESSON, CONFIRMED AGAIN, AND IT COST A REWRITE.** The reveal line had 5
      sentence-final periods and squeezed to **1.30× tempo with an OVERFLOW flag**, overlapping
      the next line by 1.7s — short-19's "count sentences, not words" rule exactly. Cut from 5
      sentences to 2 ("Wednesday you run, Thursday too, and by Friday the votes flip. Sunday:
      five to two."), every line now reads tempo 1.00. **ElevenLabs' free tier ran out of quota
      mid-session** (a real 401 `quota_exceeded`, not a hypothetical) — the whole track shipped
      on the keyless Edge Neural TTS fallback the skill documents, and captions stayed
      word-exact because edge-tts returns real word boundaries too.
    - **THE SFX PASS, A FOURTH CONFIRMATION OF short-19/20's RULE.** Three cues were INAUDIBLE by
      both RMS delta and dPeak at the calibration table's default gain and needed raising; two
      of the raised clicks then each hit **-0.01 dBFS** individually — a 0.25s peak scan (not
      the RMS column) is what caught it, same as every prior short's SFX lesson. One click split
      the difference between a peak that clipped at -3 and a delta still inaudible at -6,
      landing at -4. The two silent-gap whoosh cues (ledger compact/expand) were tabled absolute
      against the voice's own working level, not by delta, per short-17/23's rule. Final:
      **-16.0 LUFS, -0.3 dBTP**, no clipping, top peak scan window -0.71 dBFS.
    - Seeds an **identity-vote series** (all reuse `lib/vote.tsx` — a new video is a new weekly
      schedule and a new pair of labels, not a new engine): saving vs. spending as a weekly
      ledger · reading vs. scrolling before bed · the "cheat day" vote that isn't · calling
      yourself a writer only after the tenth page, not the first idea.

33. **short-33 · Consumer psychology** — "You Never Chose It" ✅ (`Short33Spend`; new niche
    lib `lib/choice.tsx`). A two-option decision card whose second option is **blank**, and a
    cohort of a hundred discrete people partitioned between the options. Opens a
    **decision-framing** niche, and it is the first engine here whose subject is **a
    population responding to a change of wording**.
    - **THE REFRAME.** "How to stop buying things you don't need" is a willpower sermon —
      budget harder, wait 30 days, unsubscribe. None of it is checkable and none of it is a
      picture. The mechanical version is one structural fact about how a purchase is put to
      you: **the decision is a two-option card and the second option is blank.** You are not
      choosing between the thing and something else, you are choosing between the thing and
      *nothing*, because nobody spontaneously generates what the money would otherwise
      become. Anything beats nothing. The payoff is the title read back: you never chose it.
    - **THE TWIST IS THE VIDEO'S OWN HEADLINE NUMBER BEING CUT DOWN.** Every other video on
      this topic would draw 75% → 55% and stop. The meta-analysis (Maguire 2023, *J. Econ.
      Science Assoc.*, 12 articles / **39 experiments / N = 12,093** across 5 countries incl.
      7 unpublished) finds the effect **robust but far smaller — pooled Cohen's d = 0.22**
      against Frederick's d = 0.45–0.85, and a leave-one-out analysis found Frederick's
      experiments **significantly different from every other study** (p < .001): I² falls
      79.68% → 54.96% without them, funnel asymmetry stops being significant, and the effect
      settles at d = 0.16. So the short draws its own hero number and then tells you it is an
      outlier. What survives is the *mechanism*, not the 20 points — and the two EffectBars
      (a RANGE bar for the range, a point for the point) put both on one Cohen's-d axis.
      **Rule: when the famous number for your topic is an outlier, that IS the twist — a
      self-improvement video that cites the correction is the only one an adult finishes.**
    - **NOTHING IS TYPED TWICE.** The authored content is two integers from the paper
      (75, 55); `BAND = [55, 75)` follows, "twenty walk away" is `BAND.hi - BAND.lo`, and both
      readouts are `countLeft()` — literally how many of the hundred dots are left of the
      midline **on that frame**. The counter ticks because bodies cross, never from a
      keyframe (short-16's rule). Module-load assertions throw if the settled counts aren't
      75/55, if the band isn't 20, or if the on-screen phrase isn't the six words the VO
      says. Same ethos as `montyTrials`, the real Mercator and the Verlet integrator.
    - **A STREAM IS A STAGGER PARAMETER, AND 0.5 IS WRONG (new, and it generalises).** First
      QA pass: with `stagger = 0.5` half the band is airborne at once, the arcs overlap and
      twenty people crossing rendered as a *smudge* — the one moment the video exists to
      show. At 0.82 each agent is in flight for ~18% of the move, three or four at a time,
      and they read as individuals leaving the top of the A column one after another. **When
      a crowd moves, tune how many are moving at once before you touch the path.**
    - **THE SIX WORDS LAND ON THEIR OWN SPOKEN WORDS.** The bracket text and the narration are
      the same sentence, so every word is `wAt` on the word it *is* — no guessing. `fill` is
      "how many words are showing", and because ChoiceCard paints word *i* at `fill*n - i`,
      the SAME scalar writes left-to-right as it rises and **backspaces right-to-left as it
      falls**, which is the loop's erase for free (vote.tsx's one-scalar-both-directions).
    - **THE LOOP IS THE THESIS, literally.** Frame 0 is the blank card at 75/25. The reveal
      fills the blank and twenty walk across; the payoff beat **erases the words and the
      twenty walk back**, because opportunity cost neglect is not a lesson you learn once, it
      is a framing that only works while it is on the screen. "Take the words away and it's
      seventy-five again, so write them down" narrates the loop and gives the instruction in
      one line. `loop_diff.py`: **0.312% of channels changed at the wrap** — and 1080×6 px of
      progress bar *is* 0.3125% of the frame, so every other pixel is identical to frame 0.
      (The tool's 540× ratio is short-32's documented false alarm: both ends hold static
      frames, so its reference step is 0.001%.)
    - **THE PAUSE CARD WENT TO THE TOP, AND THAT IS SHORT-27's RULE, NOT AN EXCEPTION.** First
      pass put it at y1180 where it sliced the bottom two rows off both columns. short-27 says
      the card sits on the ANSWER, not the subject — but at quiz time the answer (55/45)
      *has not happened yet*, so there was nothing to hide and the only sin was occlusion. It
      moved into the dead band above the card. **Check what the card would be covering before
      deciding where it goes; "cover the answer" is vacuous when the answer isn't drawn yet.**
    - **THE VOICE FELL BACK MID-BUILD, AND THE PIPELINE HELD** (short-27/32 again). ElevenLabs
      returned a real 401 `quota_exceeded` (27 credits left, 41 needed) on the first line; the
      whole track shipped on the keyless Edge Neural TTS the skill documents, captions still
      word-exact. Pass 1 squeezed two lines to 1.10/1.11; re-placed from the measured clip
      lengths, **all nine lines read tempo 1.00** and the composition came down 42.0 → 40.5s.
      Worth recording: `gen_voice.py`'s `clip` column here was the RAW duration, so
      `clip × tempo` over-allocated — harmless (nothing is stretched), but the safe move is to
      re-place and re-read rather than trust either reading of the column.
    - **THE SFX PASS REPRODUCED short-25's REFERENCE BUG AND short-19's PEAK BUG IN ONE GO.**
      `audit_sfx.py`'s default reference window (25.6–27.1s) straddled a word gap and put the
      voice at **−32.6 dBFS**; eight mid-line windows measured off `voice.wav` give the true
      working level as **−20.5**. A 12 dB pessimistic reference flagged five cues LOUDER THAN
      VOICE that were fine. Then raising the four INAUDIBLE cues took the programme to
      **+0.2 dBTP** and only a 0.25s peak scan named the culprit — a `ui-toggle-on` whose RMS
      delta was +0.6 while its dPeak was +4.9, hitting **−0.00 dBFS**. It was **moved 0.36s
      off the attack of "experiment" rather than raised** (short-27's rule), one cue was
      deleted for smearing into its neighbour 0.22s earlier, and the four hottest transients
      came down so the programme's top peak window is **voice**. Final: **−16.4 LUFS, −2.3
      dBTP over a −16.5 LUFS voiced master — the SFX add 0.1 LUFS**, the tightest
      felt-not-heard figure in the series. Deliberate taste note: the twist's two bars are
      **unmatched on purpose** — a confident toggle for the inflated 2009 range, a small click
      for the honest d = 0.22, so the sound undersells it exactly as the picture does.
    - **Logged for a follow-up, not used:** Frederick Study 2 (110 MIT MBAs) is a three-way
      test of the SAME $300 — control 59%, "leaving you $300" **82%**, "spend $300 more"
      **51%**, the premium framing *not* significantly different from control (p = .5). The
      framing has to name money you **keep**, not money you'd **spend**. A better tactic, but
      the meta-analysis is the more honest twist and a 40-second video gets one.
    - Seeds a **decision-framing series** (all reuse `lib/choice.tsx` — a new video is a new
      card and a new split, not a new engine): the default option nobody opts out of (organ
      donation) · the subscription that renews because cancelling is a second card · "compared
      to what?" on a salary offer · why a menu's most expensive dish sells the second-most
      expensive one · the cheaper-flight card that hides the bag fee.

34. **short-34 · Tidiness / home organization** — "How to Keep Your Home Organized With One
    Rule" ✅ (`Short34Clutter`; **reuses** `lib/order.tsx` from short-16 — no new niche lib).
    short-16's room with the one thing short-16 never allowed: **more things than homes.**
    - **THE REFRAME.** "How to keep your home organized" is a list of storage hacks. The
      mechanical version is the pigeonhole principle: 26 things over 20 homes leave at least 6
      homeless in *every* arrangement, so the room has **zero** tidy states and no amount of
      cleaning can finish it. Tidying rearranges; it never subtracts. The one rule that holds
      the count is **one in, one out**. This is short-16's fine print: "one tidy state, never
      more than 19 put-backs away" is only true while things ≤ homes.
    - **COUNTS ARE READ OFF THE STATE, NOT KEYFRAMED.** Each thing's location is a code (home
      0..19, floor 100+j, outside −1/−2); THINGS and ON THE FLOOR are counted from those arrays
      every frame, flipping at each thing's u = 0.5. A swap pair shares one u, so the two
      tidying put-backs visibly leave the floor at 6, and the six one-in-one-out swaps hold
      THINGS at 20 with no flicker to 21. Module-load assertions throw unless FULL is 26/6,
      the swaps keep 26/6 and RULE is 20/0.
    - **THE REUSE GENERICIZED THE LIB (short-31's rule again).** `slotXY` takes an optional
      `RoomLayout`, `RoomStage` takes `floorY`/`glowY`, `Place` takes `layout`, and `Thing`
      takes `cell` and `look` (for things with no place in `THINGS`). `HUES` is exported, and
      there's a new generic `Tally` panel. Every default is short-16's value, so short-16 renders
      the same as before. The grid shrank to cell 150 at y0 490 to free a floor row for the
      pile.
    - **THE LOOP IS THE THESIS.** Frame 0 is the overflowing room. The video rewinds it, builds
      it (six arrivals, each refused by its taken home on "mug / book / gift"), fails to tidy
      it, fixes it with the rule, and then "skip the rule, and this room comes back" returns it
      to frame 0's exact arrangement. `loop_diff.py`: **0.353%** at the wrap, SEAMLESS.
    - **Voice:** Edge Neural TTS (`en-US-AndrewMultilingualNeural --rate +12%`), all ten lines
      at tempo 1.00 on the first pass. Cues were retimed once against the real word times.
    - **SFX:** knock ×6 (refusals), two wooden thocks (tidying that changes nothing), six soft
      clicks (swaps), deep impact on "Six", chime on "twenty". The first mix was at **+0.4
      dBTP**. A 0.25s peak scan named the clicks (each −0.0 dBFS at 0 dB, RMS delta only +0.2),
      and nine cues came down. Final: **−16.3 LUFS, −0.6 dBTP**. The loop whoosh at 40.6 still
      reads "LOUDER" by delta, but it sits in a near-gap at −21.7 dBFS, below the −20.6 voice
      reference (short-16's absolute rule), so it stays.
    - **Deliberately not used:** clutter–cortisol correlations (Saxbe & Repetti 2010). They're
      correlational, and the series' rule is that a mechanism beats a scary correlation. The
      26/20 numbers are logged in `beats.json.facts` as an illustrative model.
    - Seeds more of the **everyday-combinatorics series** on `lib/order.tsx`: the closet with
      more hangers than rail · the inbox where every new email needs a folder · the toy box
      after a birthday · the app grid on a phone's home screen.

35. **short-35 · Everyday productivity / attention** — "How to Make Your Day Feel More Organized" ✅
    (`Short35Batch`; new niche lib `lib/cuts.tsx`). One day drawn as a single vertical column,
    cut by interruptions. Opens a **fragmentation** niche, and it is the first engine here whose
    subject is not how much time is used but **how it is broken**.
    - **THE REFRAME.** "Make your day feel organized" is normally a planner-and-app listicle,
      none of it checkable. The mechanical version: a day feels messy because it is *cut up*,
      not because it is full. Keep all eighteen pings, answer every one, and just move them —
      answered on arrival they are 18 cuts and the longest unbroken stretch is **0:51**;
      answered in three batches they are 3 cuts and the longest stretch is **5:51**. Nothing
      was deleted, only grouped, which is exactly the payoff line ("an organized day isn't
      emptier, it's grouped").
    - **THE TWIST IS THAT THE TRIAL RAN THE OBVIOUS ADVICE TOO, AND IT LOST.** Fitz, Kushlev,
      Jagannathan, Lewis, Paliwal & Ariely (2019), *Computers in Human Behavior* 101:84-94 —
      randomised field experiment, **n = 237, two weeks**, four arms. Batched **3×/day** (9am,
      3pm, 9pm): lower stress (PSS d = -0.56), more control over the phone (d = 0.58), more
      attentive and productive. **Hourly**: "did not differ from the control". **Off entirely**:
      few of the benefits and **higher anxiety** (d = 0.56) and FoMO. So the video plays all
      three arms on the SAME column and you can see *why* hourly does nothing — it is still 14
      cuts and ~1h stretches. Turning notifications off is the advice everyone gives and the
      only arm that made people worse.
    - **NOTHING IS TYPED TWICE.** `measure()` runs every frame on the cuts actually drawn:
      clusters (cuts closer than 6 min are one pull away), stretches (their complement in the
      day), the longest. "18×", "3×", "0:51", "5:51", "14×", "1:00", "14:30" are all that
      function's output — a mis-timed cut shows a wrong number instead of hiding behind a
      keyframed counter. Module-load assertions: scattered = 18 pulls & longest < 1h, batched =
      3 pulls & longest > 5h, off = 0 pulls.
    - **A PING CAN NEVER BE ANSWERED BEFORE IT ARRIVES (new, and it generalises).** The obvious
      implementation splits 18 pings into three equal batches, which silently moves morning
      pings *backwards in time* into the 9am batch. Here each ping goes to the next batch
      **after** its own arrival — so the batches come out uneven (3 / 7 / 8), every ping slides
      only DOWN, and the motion reads as *waiting* rather than teleporting. Asserted at module
      load. **Rule: when a schedule is rearranged on screen, check the direction of every move
      against the thing it represents, not just the final layout.**
    - **A STAGGER CAN INVENT A FACT THAT ISN'T IN EITHER STATE.** The batched → hourly re-slot
      was staggered by ping index, and mid-move the column briefly read **5:39 unbroken** —
      a long stretch that exists in neither the before nor the after state, under narration
      saying hourly does nothing. Made it one 14-frame step. Generalises short-33's stream
      lesson: **a stagger is a claim about the intermediate frames; if the readout is computed,
      those frames have to be true too.**
    - **THE SFX LESSON, AND IT IS THE MONO-SCAN TRAP.** A 0.25s peak scan (short-19's rule) said
      the mix topped out at -0.34 dBFS while ebur128 kept reporting **+0.2 dBTP**. The scan was
      decoding to **mono**, averaging L and R and hiding a one-channel peak; the same scan at
      `-ac 2` named the offender immediately (the loop's landing pop, in a silent gap where the
      duck's makeup hands back all 6 dB — short-18's bug). **Scan per channel, never mono.**
      Final: **-15.6 LUFS, -0.5 dBFS**, six cues levelled by the audit and four more by the scan.
    - **THE LOOP SEAM WAS A CAPTION, NOT THE ANIMATION** (short-18's rule, fourth confirmation).
      The wrap measured 1.16% — 16.5x a frame step — and every changed pixel was the last caption
      chunk still on screen at the last frame, because a chunk holds for `end + 0.8s`. The fix is
      arithmetic, not animation: the composition must outlast the final word by more than that
      hold. At 44.1s the wrap is **0.315% and lies entirely in the progress bar** (the series'
      baseline, matching short-32's 0.312%); `loop_diff.py` still prints its static-ends false
      alarm, since both ends hold still and its ratio heuristic has nothing to divide by.
    - Seeds a **fragmentation series** (all reuse `lib/cuts.tsx` — a new video is a new schedule,
      not a new engine): meetings scattered vs. stacked into one afternoon · a toddler's naps
      cutting a parent's day · errands batched into one trip · two projects in one week vs. one
      project in two · the commute that is 40 minutes of nothing but 8 interruptions.

Each short adds at most ONE new niche lib; the shorts kit (captions, hook, pause card,
progress bar) is shared by all.

## The next slate — 8 videos, 8 NEW engines (agreed 2026-07-14)

**The axis is the visual engine, not the topic.** A new topic on an existing lib proves nothing;
a new *engine* expands what the channel can physically render. After 12 shorts, every single one
is a **diagram, a UI, or a plot** — that's the honest risk, and this slate is the answer to it.

17. **short-17 · Family health** — "How Much Screen Time Is OK?" ✅ (`Short17Screen`; new niche lib `lib/budget.tsx`). A 24-hour dial where the answer is a **subtraction**, not a rule. Opens a time/allocation niche.
    - **The premise is a documented ABSENCE, and that is the hook.** Under 5 there is a real published number (WHO/AAP: none, then one hour). From six upward the AAP deliberately stopped giving one — it moved to "quality not quantity" plus the Family Media Plan. So the video draws the guidance *on the ring, in the day's own units*: a hard stop at zero, a real 1-hour arc (15°), and then a dashed arc with **no length**. The third arc is short because nobody has given it one.
    - **Every number is read back off the geometry.** `spent()` sums the arcs actually rendered this frame and the hub prints `24 − that`, so **6h 18m** is the arcs, not a keyframed counter — a mis-timed animation would show a wrong number instead of hiding behind a right-looking one. Same ethos as `montyTrials`, the real Mercator, the Verlet integrator, cycle.tsx's conserved particles and order.tsx's replayed swaps. Sourced terms: sleep 10h (AASM/AAP 9–12 for ages 6–12) · school 6.7h (NCES elementary average) · moving 1h (WHO 2020, ≥60 min/day for 5–17) → **6h 18m left**; measured average tween screen use 5h33m (Common Sense Census, 8–12, entertainment only, still the figure the AAP cites) → **45 minutes** for eat · wash · homework · family. The video never claims more than the ring is drawing.
    - **THE SFX LESSON, and it is the biggest one in the series so far: RMS AND PEAK DISAGREE ABOUT TRANSIENTS.** Short-16 established measuring cues instead of guessing, and this short's first three passes did exactly that and still shipped a stab. A `clock-tick-soft` filling the silent quiz gap measured **−33.5 dBFS RMS — 14 dB under the narration, which every audit rule passed** — while its **peak hit −2.9 dBFS in dead silence**. A tick is nothing but transient (~30 dB crest factor), so the RMS number was describing the *gaps between the ticks*. The same fault hid in the opposite direction: a `ui-toggle-on` on the word "none" measured +0.2 dB of RMS at *any* gain (the sidechain duck owns it) while adding **+4.7 dB to the mix's peak** — RMS called it inaudible, and it was one of the most audible things in the video. **Rule: measure sustained cues by RMS delta, transients by what they add to the PEAK, and always locate the programme's true peak second by second before calling a mix done.** `tools/audit_sfx.py` now prints both columns and picks the right test per cue (delta under speech, absolute dBFS in a gap).
    - **That audit also caught the series.** Shorts 14/15/16 all ship at **+0.8..+0.9 dBTP — clipping** — and 1.5–2.6 LUFS above their own voiced masters, i.e. the SFX are louder than the narration, which brand §7 forbids outright. All three voiced sources are ~−16 LUFS; short-17's mix is **−15.8 LUFS / −0.2 dBTP**, adding 0.3 LUFS over its voice. It is the first mix in the series that does not clip. **Worth a re-mix pass on 14–16.**
    - **A window can be wrong in a way that reads as a quiet cue.** Measuring a `whoosh-reverse` at its *attack* returned +0.5 dB and the audit called it inaudible; a reverse whoosh is a suck, its energy is at the END, and measured over its final third it was +5.5 dB — too loud. The cue was never quiet; the window was.
    - Two composition lessons that generalise: **arcs may cross-dissolve, hub TEXT may not** (two words cross-faded in the same 200px box read as a smudge — the guidance hubs hand over with a 4-frame gap instead), and **a fade-out that ends where the next fade-in begins leaves a HOLE** — one frame of empty ring and empty hub, invisible unless you happen to render that exact frame.
    - The rewind-earns-the-loop trick (short-10/11/13) transferred a fourth time and `tools/loop_diff.py` (new, stdlib) measured the wrap at **0.31% of channels vs 1.04% for a normal frame step** — the join is quieter than an average frame, and what remains is the progress bar.
    - Seeds an **allocation series** (all reuse `lib/budget.tsx` — a new subject ships a new block table, not a new engine): where your salary actually goes · what is really in a calorie · the 40-hour week that is 52 · where a country's water goes · the attention budget.

18. **short-18 · Perception** — "You Went Blind For 24 Minutes Today" ✅ (`Short18Blink`; new niche lib `lib/tape.tsx`). A span of time drawn as a strip, and the gaps that interrupt it. Opens a perception niche, and it is the first engine here whose subject is **time that is missing**.
    - **ONE SCALAR, TWO OPPOSITE CONCLUSIONS — and that IS the video.** `cut` removes the gaps and slides everything after them back. Add `pack` and the removed time reappears as a block at the far end: the loss is conserved and countable (**24 minutes**). Add `stretch` instead and the strip refills its own width: the loss is unobservable (**it felt like 60 seconds**). The reveal collects, the twist splices, and the argument is that the *same operation on the same data* supports both. No previous engine here has had its thesis be a parameter.
    - **Every claim is the FLOOR of its published range, so the video can only understate.** Spontaneous blink rate is 15–20/min and blackout per blink is 100–150 ms; the shot takes **15** and **0.100 s** and the voice says "about". 15 × 60 × 16 waking hours = **14,400 blinks**, × 0.1 s = **24 minutes** = 2.5% of a waking day, × 365 = **6 whole days a year** (`Math.floor`). The marks on screen are `SCHED.length`, the block widths are `totalLost × cut × (w/span)`, and the counters print those widths read back — same ethos as `montyTrials`, the real Mercator, the Verlet integrator, cycle.tsx's conserved particles, order.tsx's replayed swaps and budget.tsx's read-back hub.
    - **THE FACT THAT MADE IT A VIDEO AND NOT TRIVIA.** "You blink thousands of times a day" changes nobody's life. The payoff is that you have **never experienced one second of the 24 minutes**, and not because a tenth of a second is too fast to notice — vision is *actively suppressed*. Bristow et al. (2005, Current Biology) held retinal illumination constant through a blink (trans-palatine stimulation, so the lid never changes the light reaching the retina) and blinking **still** suppressed the BOLD response in visual cortex, strongest in V3. And the suppression **begins before the lid does**. The gap is edited out before it exists, which is why it can never be experienced as a gap. That is the last line.
    - **THE LID AND THE LOSS ARE DIFFERENT EVENTS, and separating them resolved a literature contradiction.** Published blink durations range 100–150 ms and 150–400 ms depending on the source, and the two are not measuring the same thing: one is the vision lost, the other is the shutter moving. `occlusionAt` takes the gap as the blackout *plateau* and adds asymmetric ramps (~90 ms closing, ~170 ms opening — closing is about twice as fast), so a blink reads as a third of a second on screen while costing a tenth in the arithmetic. Both numbers are then true simultaneously, and the strip only ever draws the one it counts.
    - **The mark is 1.4 px and that is not a bug** (short-15's loupe lesson, transferred to a time axis). At 14 px per tape-second an honest blink is 1.4 px wide. A log width scale would fix the legibility by lying about the one proportion the strip exists to state, so the widths stay true and the fix is **optical**: a loupe at **×50**, with the power derived from the two pixel scales it sits between and printed on screen.
    - **14,400 marks cannot be drawn**, so the day strip carries their SUM rather than the events, grown by lengthening the aggregate gap itself — which keeps the block's width `totalLost × (w/span)` and its label that width read back in minutes. A summary, drawn to scale, saying so.
    - **A LID PAINTED AT STAGE VALUE IS NOT A LID, IT IS A HOLE.** Frame-by-frame QA at a blink caught a fully closed eye rendering as an empty almond outline: the lids were filled `#161c27` against a `#0f1216` stage, so closing the eye *deleted* it. A lid is a lit surface in FRONT of the eye and has to be brighter than the ground behind it — it now carries its own gradient and a crease that appears only once there is enough lid down to fold. Generalises: **any occluder drawn in the background's own value reads as a hole punched in the scene, not as something covering it.**
    - **THE SFX LESSON, and it is a tooling bug the whole series has been paying for.** Short-17 established measuring transients by PEAK rather than RMS, and this mix reproduced the failure anyway on three cues before the cause turned up: **`mix_sfx.py`'s duck sets `sidechaincompress=...:makeup=2`, and ffmpeg reads `makeup` as a LINEAR multiplier — a flat +6.02 dB on the SFX bus.** Under speech the compressor gives most of it back; a cue sitting in a *word gap* keeps all six. So gap cues, and only gap cues, ship ~6 dB hotter than their plan gain reads — which is exactly the failure short-17 recorded across shorts 14/15/16 (all +0.8 dBTP, clipping). Measured here: `ui-toggle-on` at plan gain −5 peaked at **−0.06 dBFS** in a −72 dBFS silence; predicted from −1.5 (clip peak) − 5 (gain) + 6.02 (makeup) = −0.48, and the rest is AAC overshoot. **Worth fixing at the tool (`makeup=1`, or express it in dB) and re-mixing 14–17 — but that changes every existing mix, so it is a deliberate decision, not a drive-by.** This short is calibrated against measurement regardless: **−16.1 LUFS, −0.6 dBTP**, 0.2 LUFS over its voiced master, seven of thirteen cues gained DOWN 5–12 dB from the skill's calibration table because that table assumes continuous narration doing the masking and this video is deliberately full of silence.
    - The rewind-earns-the-loop trick transferred a sixth time and `loop_diff.py` measured the wrap at **0.32% of channels vs 1.69% for a normal frame step** — 0.19× an ordinary frame. Getting there needed short-14's caption rule applied to a *label*: "14,400 BLINKS" faded in during the reveal and was still on at the last frame while frame 0 had none. **The pixels can loop while the TEXT does not; audit every string that fades in, not just the animation.** The eye is loop-safe by construction — its schedule's span IS the composition, so `occlusionAt` returns 0 at both ends and the lid can never be caught half-shut at the wrap.
    - **The eye is not the tape.** It runs its own `gapSchedule` at the same 15/min in real time — 11 blinks over 43 s — so the arithmetic on screen is the arithmetic on the face, and the video never has to fast-forward a face to fill a chart.
    - Seeds a **perception / missing-time series** (all reuse `lib/tape.tsx` — a new subject ships a new span and gap table, not a new engine): how much of a 90-minute match the ball is actually in play (~55 min) · the ads in a TV hour · red lights on a commute · a working day minus meetings · saccadic suppression (the same engine, a different reason the gap is invisible).

19. **short-19 · Family health / play** — "Nobody Has A Spare Hour" ✅ (`Short19Play`; new niche lib `lib/kid.tsx`). A jointed body driven by gait functions, over a rail that collects an hour out of scraps. Opens a **movement** niche, and it is the first engine here whose subject is **a body**, not a diagram, a quantity or a configuration.
    - **THE REFRAME THAT MADE IT A VIDEO.** "Fun ways to get kids moving" is a listicle, and a listicle has no claim in it, nothing computed, and nobody remembers item four. The claim underneath is real and sourced: the hour is **not a block you have to find, it is a sum**, and the guidelines say so in writing. WHO 2020 asks for *an average of* 60 min/day *across the week* for ages 5-17, and the Physical Activity Guidelines for Americans 2nd ed. (2018) **deleted** the rule that activity had to come in ten-minute bouts — "bouts of any duration may be included in the accumulated total volume." So five silly games add to **62 minutes** and not one of them is exercise. The games then arrive as the *evidence for a claim* rather than as the content, which is the only version of this topic an adult watches to the end.
    - **ONE SOLVER, SEVEN GAITS.** `lib/kid.tsx` is a single skeleton and a single forward-kinematics pass; `stand`, `slump`, `bear`, `crab`, `leap`, `reach` and `run` are the SAME draw call with different joint-angle functions of phase. Freeze dance is not a special case — `dance` maps its cycle onto three beats through a monotonic ramp with a **flat plateau in the middle**, so the figure holds dead still for a quarter of every cycle. The freeze is in the function, and because the ramp is continuous and lands on an integer it is loop-safe for the same reason a plain gait is.
    - **THE BADGE MEASURES THE ANIMATION.** `travel()` walks a gait around one full cycle, runs the same FK that draws it, and sums how far the hands, feet and head actually move; `intensity` scales that by the gait's own frequency. The talk-test band on screen is that measurement against the `run` reference, so it cannot say VIGOROUS over a figure that is barely moving. And **62 is never typed**: `TOTAL` is the table added up and the readout is the rail's DRAWN WIDTH converted back to minutes, so a mis-timed chip shows a wrong number instead of hiding behind a keyframed counter. Friday on the week chart carries `TOTAL` too — the day the video just built is on its own chart by construction. Same ethos as `montyTrials`, the real Mercator, the Verlet integrator, cycle.tsx's conserved particles, order.tsx's replayed swaps and budget.tsx's read-back hub.
    - **A FIGURE IS NOT A STICK FIGURE UNTIL ITS PARTS CAN BE TOLD APART (new, and it generalises).** The first render was a white capsule with a ball on it. Three separate causes, each invisible in the code and obvious in a frame: the head radius (27) was **smaller than the torso was thick** (38 stroke), so the head had 8px of silhouette and vanished; both arms and both legs hung off a single chest/pelvis POINT, so a limb resting near the body was inside the body; and same-value shapes that touch read as one mass. Fixes, in order of impact: real **shoulder and hip offsets perpendicular to the spine**, a head **bigger** than the torso is thick over a longer neck, and every near limb drawn over its own **stage-coloured gap stroke**. Rule: an articulated figure needs joint SEPARATION and value SEPARATION, not better angles.
    - **A CRAWL IS A HORIZONTAL SPAN, NOT A BENT SPINE.** The bear crawl first read as someone touching their toes. Rotating the spine toward horizontal did not fix it, because the arms and legs still dropped from points only 50 units apart. It became a crawl when the arms were angled **forward** and the legs **back**, putting the hands ~108 units ahead of the feet. The shape of a gait lives in where its contacts are, not in the angle of the torso.
    - **THE VOICE LESSON, ONE LAYER DEEPER THAN SHORT-16'S.** Short-16 established reading the tempo column and widening windows. That was not enough here, because **the `clip` column is the ALREADY-FITTED duration** — a line reading `5.05 1.25` is 6.31s of raw audio, and sizing the next window from 5.05 leaves it squeezed again. Size from `clip x tempo`. The offender was "Freeze dance. Floor is lava. Animal walks. Balloon keep up." — ten words but **four sentences**, and Liam's full stops made it 6.31s, so no window that fit it left room for the payoff line. Rewritten as one comma-separated sentence it is **3.85s**: a 39% cut with every word kept. **Count sentences, not words, when a line overruns** — commas are cheap and full stops are not.
    - **THE SFX LESSON: THE RMS COLUMN PASSED THE CUE THAT WAS CLIPPING.** Short-17 established measuring transients by peak, and this mix reproduced the failure anyway. `audit_sfx.py` returned "ok (felt-not-heard)" on all five chip pops at deltas of +1.6..+2.8 while the programme sat at **+0.1 dBTP, clipping**. A half-second peak scan named the culprits exactly — 26.0s, 28.0s, 29.0s, 32.0s, the pops themselves — because a pop is nothing but transient and its RMS over a 0.30s window is describing the silence around it. Their `dPeak` column had said +3.9..+5.5 all along. **Read dPeak for anything with an attack, and scan the programme's peak second by second: the summary dBTP says there is a problem, only the scan says which cue it is.** The worst offender was not a hero cue at all (`ui-toggle-on` at 37.72: +1.8 RMS, **+16.3 dPeak**). Final: **-15.6 LUFS, -0.9 dBTP** over a -16.0 LUFS voiced master.
    - **The loop was right on the first measurement**, because integer lap counts were applied at construction rather than debugged in: every gait's phase is `LAPS[gait] * (f / END)` with `LAPS` an integer, so whichever gait is on screen at the wrap returns to its own first pose. `loop_diff.py`: **0.695% of channels changed at the wrap against 1.242% for an ordinary frame step — 0.56x a normal frame.** A constant per-gait phase offset (`PHASE0.bear = 0.3`) is also loop-safe, since it shifts every frame equally, and it buys a frame 0 whose crawl has its limbs spread instead of aligned — frame 0 is the thumbnail and a collapsed pose wastes it.
    - Facts checked before scripting, and one of them changed a number: **"fewer than a third"** comes from the 20-28% of 6-17 year olds who meet 60 min/day (NSCH/NHANES), stated at the TOP of that range so the video can only understate (short-18's floor rule). The NHIS-Teen **61.1%** figure is deliberately unused — it measures self-reported activity "most days or every day", not the guideline, and quoting it would overstate the situation by roughly 2x. The five minute values (9/12/7/14/20) are the lengths of the games, not sourced data, and the video's claim is only that they sum.
    - Seeds a **movement series** (all reuse `lib/kid.tsx` — a new video is new gaits and a new rail, not a new engine): the ten thousand steps that were a 1960s marketing number · what "an hour of exercise" undoes about a day of sitting · the sleep a school start time costs · desk breaks as a collector · how far a toddler actually walks in a day.

**Engines already claimed:** board of discrete pieces (chess) · equation/number-line morph (math) ·
discrete objects + Monte Carlo (prob) · instrumented array (algo) · UI clone (terminal/vscode/
browser/sheet) · keyboard (piano) · plotted curve (chart) · projection cartography (map) ·
sphere + integrated trajectory (orbit) · AI stills + Ken Burns (story) · layered collage (vox) ·
relaxed dyad graph / settling network (pairs) ·
closed-loop conserved-particle circulation over a landscape (cycle) · tip integration under a
growth law (grow) · proportional flow network / Sankey (flow) · finite-total allocation ring
(budget) · spliceable time strip (tape) · height-field liquid in a vessel, poured and sloshing (fluid) ·
partitioned cohort of discrete agents under a two-option card (choice) ·
fragmented span: cuts, their clusters and the stretches between them (cuts).

**Never rendered by this channel:** many independent agents · a lattice coming alive · a perceptual proof · refracting light · text as the subject · a mechanism in cutaway.

| # | Video | Niche | New engine | The motion language nothing in the repo can do |
|---|-------|-------|-----------|-----------------------------------------------|
| 13 | **The Traffic Jam With No Cause** | emergence | `lib/agents.tsx` — car-following model (IDM) | **Mass motion.** 22+ independently simulated cars; a jam crystallises from one brake tap and travels *backward* through them. Cannot be keyframed — only simulated. Extends the spine: Monte Carlo → Mercator → Verlet → **agent-based model**. (Real experiment: Sugiyama 2008.) |
| 14 | **These Two Squares Are The Same Colour** | perception | `lib/illusion.tsx` — shading, masks, proof-bridges | **Perceptual proof.** A camera can only *assert* it; our code *proves* it by filling both squares from ONE hex constant, live, on screen. The single best argument for TSX that exists. |
| 15 | **One Sentence. Seven Meanings.** | language | `lib/kinetic.tsx` — typographic choreography | **Text as the subject.** No diagram at all — "I never said she stole my money," stressed on each of 7 words, meaning flipping each time. |
| 16 | **The Pool Is Deeper Than It Looks** | optics | `lib/optics.tsx` — real Snell's law ray tracer | **Light as geometry.** Rays bending at the surface, the eye back-projecting them to a false bottom. The illusion is *computed* from n = 1.33, not drawn. |
| 17 | **Why Ice Floats** | chemistry | `lib/lattice.tsx` — molecular packing | **Matter organising itself.** Molecules jostling in liquid, then snapping into a hexagonal lattice that takes up *more* room. |
| 18 | **R = 2. Ten Rounds. The Whole Room.** | networks | `lib/graph.tsx` — force-directed + contagion | **A network settling and igniting.** Nodes finding their own positions, colour sweeping the graph like fire — then R = 0.9 and the same sim dies in four rounds. |
| 19 | **How A Watch Keeps Time** | mechanism | `lib/mech.tsx` — cutaway mechanism | **Machinery in cross-section.** The escapement: gear, pallet, balance wheel — the tick you hear is a tooth escaping, once, and you *watch* it. (SFX becomes the content.) **Most expensive build here — cut this first if velocity matters.** |
| 20 | **Same Voters. Three Maps. Three Winners.** | civics / math | `lib/district.tsx` — partitioning grid | **A grid re-cut.** 50 voters, unchanged; redraw the boundaries three ways and the winner flips — and the code *counts* each district, so nothing is asserted. **The only politically-loaded one: keep it factual and party-neutral, by choice not by accident.** |

**Order: 13 → 14 → 15 first.** That trio is deliberately maximally spread — a swarm, a static
perceptual trick, and pure text. If those land, the channel has proven it isn't secretly a
"diagram channel".

Every number in that table is still **unverified** and must go through the usual pass before
scripting (the percolation threshold, n = 1.33, the seven-meanings example, ice densities). See
`[[shorts-verify-the-equality]]`: when the payoff is an equality, check *which two things* are
equal, not just that they are.

## The other track: `ai-video/` (generative, NOT TSX)

Agreed 2026-07-14. Real AI-generated video (fal.ai via `tools/gen_clip.py`) — the blue-man
recurring character, motivational, kids story in motion, realistic story, gym-aesthetic workout.
**Kept in its own workspace so the two pipelines never contaminate each other's skills.** Plan and
the character-consistency method live in `ai-video/IDEAS.md`.

**Outros — no engagement-CTAs (locked 2026-07-12).** Ending on a comment-bait question
("what should I race next?", "comment your pick") is banned — it reads dated. End on
the PAYOFF and let the visual LOOP dissolve back into the intro (last frame == frame 0); the
loop-into-intro IS the ending. If a clean loop isn't possible, just end — no filler, no dead
tail. (short-1/2/3 shipped with the old comment-bait outros; leave those as historical record,
but never author a new one.) The /channel-short track locked the same rule 2026-07-10.

## Per-short artifact contract (what /make-short will formalize)

```
shorts/short-N-<niche>/
  script.md      — hook, VO lines with start/end seconds, beat sheet, visual notes
  beats.json     — machine contract: format, vo[], beats[], niche-specific timeline
remotion/src/shots/short-N/
  ShortN<Name>.tsx — ONE composition (1080×1920), beats as <Sequence>s over a
                     persistent canvas, captions + progress bar as global layers
```

36. **short-36 · Sleep / chronobiology** — "How to Fall Asleep Faster Tonight" ✅
    (`Short36Cool`; new niche lib `lib/thermo.tsx`). A night as ONE descending core-temperature
    curve against the clock, with a horizontal GATE it has to cross before sleep happens. Opens
    a **crossing-time** niche: the subject is never the level, it is *when the line gets there*.
    - **THE REFRAME.** Every other version of this topic is hygiene advice about your mind or
      your room (dim the lights, no phone, count backwards). The mechanical version is about the
      thermostat: you fall asleep while your core is **falling**, you dump that heat through your
      hands and feet, and heating your skin 90 minutes before bed makes the fall steeper — which
      sounds backwards and is the whole trick. Deliberately the opposite lever from short-29
      ("How to Stop Overthinking at Night"): same shelf, mind vs. thermostat, no overlap.
    - **THE BEND IS SOLVED, NOT DRAWN.** `solveBoost` bisects for how much extra cooling the bath
      buys so the warmed curve meets the gate at exactly `bed + 28×(1−0.36)`. The published 36%
      (Haghayegh 2019, 13 trials) is the only number driving the picture; 28 min is stated out
      loud as a premise. Module-load assertions refuse to render if either crossing drifts, if
      the scanned day range is not 1.0 °C, or if the steepest fall lands nowhere near bedtime.
    - **HONEST SMALLNESS.** Ten minutes really is a thin slice of a degree — the curves sit ~17 px
      apart — so instead of exaggerating the gap it is carried by the filled wedge, a bracketed
      head start on the gate line, and wait bars on their own px-per-minute scale. A useful
      precedent for any future short whose real effect size is visually small.
    - Seeds the **crossing-time series**, all reusing `lib/thermo.tsx`: caffeine clearing the
      threshold before bed · blood sugar after a meal · a room cooling overnight · alcohol
      leaving the blood before a drive.

37. **short-37 · Home / everyday scheduling** — "The 7-Minute House Reset" ✅
    (`Short37Reset`; new niche lib `lib/rate.tsx`). A week as ONE backlog curve: mess accrues at a
    steady rate and is drained by scheduled work sessions drawn as bars *below* the axis. Opens a
    **period-not-effort** niche: the subject is never how much work there is, it is how often you do it.
    - **THE REFRAME.** Every other version of this topic is a routine listicle. The mechanical
      version is that a mess is a *backlog*, and the average of a sawtooth is half its peak — so the
      mess you actually live in is proportional to how long you let it run. Clear it daily instead of
      weekly and the average drops **7×** for **exactly the same weekly minutes**. Deliberately a
      different lever from short-16 (a room has one tidy state) and short-34 (more things than homes):
      those change the room and the count, this one changes only the schedule.
    - **THE TITLE'S NUMBER IS DERIVED.** Two premises, printed as premises: 28 person-minutes of
      tidying a day, 4 people. 28 ÷ 4 = **7 min each**; 7 × 28 = 196 min/week = **49 min each**, the
      "hour" the hook rejects. Both schedules spend 196 — sessions carry their minutes when they move,
      so the invariant is structural, not asserted. Module-load assertions refuse to render unless the
      two runs total the same, peak 196/28, average 98/14, and the ratio is exactly 7.00.
    - **MEASURE THE PICTURE.** `simulate` integrates the sawtooth actually drawn (avg = area ÷ width)
      and `above(run, 60)` returns the hours the week spends with more than an hour of tidying waiting
      — 117 h weekly vs **0 h** daily, which is the readout that ties back to the title.
    - Seeds the **backlog series**, all reusing `lib/rate.tsx`: laundry · an inbox answered nightly vs
      Sunday · revision before an exam · debt paid weekly vs monthly · a ticket queue.

38. **short-38 · Home / family organization** — "The 2-Basket Family Rule" ✅
    (`Short38Baskets`; new niche lib `lib/carry.tsx`). A two-storey house as a CROSS-SECTION:
    twelve things coloured by the floor they belong on, a staircase, two baskets, walkers on an
    arc-length path. Opens a **carry / piggyback** niche: the subject is what it COSTS to put a
    thing away, not how much mess there is.
    - **THE REFRAME.** The 2-basket rule is usually given as a tip with no reason. The mechanical
      version: a wrong-floor thing costs a whole stair trip, so it stays; a basket parked where the
      trips already happen makes that **zero extra trips**. Twist: the family already climbs the
      stairs all day, empty-handed. Deliberately a different lever from short-16/34 (the room's
      states and count) and short-37 (when you tidy): this one is *who carries it*.
    - **"HALF" IS COUNTED, NOT CLAIMED.** THIS HOUSE: 12 out of place, 6 on the wrong floor. The tally
      counts each thing's state (slot / basket / shelf) every frame. OUT OF PLACE 12→6 and EXTRA
      STAIR TRIPS 6→0 fall out of it. Module-load assertions: frame 0 = 12/6/6, post-basket = exactly
      half with 0 on the wrong floor, last frame counts the same as frame 0, a thing only ever drops
      into the basket on its own floor that is headed to its home, and nothing leaves a basket
      before the walker arrives. No study cited: the video never gives a percentage for real households.
    - **COLOUR IS THE LEGEND.** Periwinkle = belongs upstairs, amber = downstairs, and the floor
      labels carry those colours, so an amber shoe upstairs reads as wrong before the VO says it.
    - **Voice:** Edge (`AndrewMultilingual --rate +12%`) read faster than the 2.7 wps estimate and left
      ~1s of air per line. Windows were rebuilt from the measured clip lengths (+0.3s) in one pass, and
      the whole short shrank 44.3 → 38.6s with every line at tempo 1.00.
    - **SFX:** six wooden thocks as things land in the baskets, six soft clicks onto the shelves,
      stamp + chime layered on HALF GONE, reverse whoosh on the rewind. The pop and impact first read
      LOUDER than the voice, and the stamp pushed the peak to −0.4 dBTP. Final: **−15.5 LUFS, −1.2 dBTP**.
    - **Loop:** `loop_diff.py` flags 2.1× (stills) / 3.8× (MP4), but a band histogram shows 1,620 of
      the ~1,700 changed pixels are the progress bar resetting. The canvas barely moves between
      normal frames, so the ratio overstates it. Seamless in practice.
    - Seeds the **carry series**, all reusing `lib/carry.tsx`: the dish bin that rides to the kitchen
      · the car-boot outbox · a launch pad by the front door · the laundry chute vs the hamper.

39. **short-39 · Home / everyday organization** — "The Doorway Rule" ✅
    (`Short39Doorway`; new niche lib `lib/rooms.tsx`, the single-storey sibling of `lib/carry.tsx`,
    whose things, walker and tally it reuses). Three rooms in cross-section joined by two doorways
    that light in the colour of whatever crosses them. Each room's shelf shows dashed slots for its homes.
    - **THE REFRAME.** Clutter here is 12 things in the wrong room, waiting for a cleaning day. You
      already cross every doorway all day, empty-handed. One lap (BED→LIV→KIT→LIV→BED) is 4
      doorways with one thing that belongs next door on each, so 3 laps = 12 doorways = all 12 home,
      with **nothing extra**. A different lever from short-38: no container and no batching, one thing
      per crossing, continuously.
    - **THE TWIST EXPLAINS THE WORD PEOPLE SKIP ("BEFORE").** The doorway effect (Radvansky & Copeland
      2006, virtual rooms): a mug in a thought bubble turns into "?" at the door. The limit is printed
      on the plate: McFadyen et al. 2021 mostly failed to replicate it, except under working-memory load.
      So the VO says "in some lab studies" and the headline says "CAN make you forget".
    - **COUNTED, NOT CLAIMED.** OUT OF PLACE and DOORWAYS are both derived per frame, from the things'
      states and each leg's crossing frame. Module-load assertions check that frame 0 = 12/0, the
      empty lap = 4 doors with 0 moved, 12 crossings = 0 out of place, each leg carries a *different*
      thing that belongs in the *next* room, drops happen only after the door, and last frame = frame 0.
      The reveal leg length is solved so the 12th thing lands on the word "away".
    - **Voice:** ElevenLabs was out of quota (27 credits), so this used Edge `--rate +12%`. Pass 1
      squeezed one line 1.24×. Line starts were re-placed from the measured clip lengths, so every
      line is at 1.00 and the composition is 44.3 → 40.6s. Nothing was billed.
    - **SFX:** library-only, 25 cues. Twelve wooden thocks as things land on their shelves (the content),
      four optional clicks for the empty-handed doors, stamp + chime on ALL PUT AWAY, a pop on the
      forgotten thought, reverse whoosh on the loop. Cue times came from replaying the legs' timing in
      node (`crossAt`/`dropAt`), not guesses. Audition: **−16.1 LUFS, −0.9 dBTP** over a −16.2 LUFS
      voiced master. The thocks may sit too low, so it needs an ear pass.
    - **Loop:** `loop_diff.py` wrap 0.361% vs a normal step 0.295% (**1.23×**), SEAMLESS.
    - Seeds a **rooms series** on `lib/rooms.tsx`: the one-touch rule · a launch pad by the front
      door · the kitchen-closing lap · "nothing lives on the stairs".

40. **short-40 · Home / family organization** — "The 10-Second Morning Test" ✅
    (`Short40Launch`; second in the rooms series. `lib/rooms.tsx` grew furniture to hide things in,
    a front door, the LAUNCH PAD and search tags. `lib/carry.tsx` gained `coat` + `bottle` glyphs.
    No new niche lib.) It is the "launch pad by the front door" seed from shorts 38 and 39.
    - **THE REFRAME.** The slogan ("if your child can't find it in 10 seconds, your morning isn't
      organized") becomes a mechanism. A thing without a fixed home is *searched for*, and every place
      it might be is a place someone checks. A thing with a home by the door is *picked up*. The hook
      is the LAST frame (pad full, 0:08). The setup scatters it, the reveal puts it back, and the loop
      is the evening return.
    - **THE TWIST REFRAMES THE TEST, NOT THE TIP.** "It was never about speed. It's whether they can
      do it without asking you." A third tally column, ASKED YOU, counts the search's empty checks (the
      "WHERE'S MY…?" bubbles): 5 → 0.
    - **COUNTED, NOT CLAIMED.** The clock is model time from `MODEL · WALK 1 M/S · 25 S A PLACE · 2 S A
      GRAB` (printed on screen). 1490 px walked plus 9 places works out to **4:09**, and 4 grabs to
      **0:08**. The fast-forward badge prints the real ratio (×41 / ×6). Module-load assertions check the VO's
      "four things / nine places / over four minutes / eight seconds" against the model, and check that
      the last frame puts every thing and the kid where frame 0 has them. No study cited.
    - **Voice:** Edge `--rate +12%`, placed from measured clip lengths in one pass, all lines at 1.00.
    - **SFX:** library-only, 28 cues. Thocks for the four finds, the evening drops and the loop drops.
      Optional soft clicks for the five misses, quick clicks for the morning grabs, stamp on TEST FAILED,
      stamp + chime on TEST PASSED. Audition **−16.0 LUFS, −1.2 dBTP** over a −16.1 voiced master. Needs
      an ear pass.
    - **Loop:** `loop_diff.py` wrap 0.375% vs step 0.207% (**1.82×**), SEAMLESS.
    - Next in the rooms series: the one-touch rule · the kitchen-closing lap · "nothing lives on the stairs"
      · a homework station (the same 10-second test for pencils, charger, folder).

41. **short-41 · Home / everyday organization** — "The One-Touch Rule" ✅
    (`Short41Once`; third in the rooms series. `lib/rooms.tsx` grew HOMES drawn in two halves — `Hamper`,
    `MailTray` — plus `KeyHook` and a per-thing `TouchBadge`. `lib/carry.tsx` gained a `mail` glyph. No new niche lib.)
    It is the "one-touch rule" seed from short-39.
    - **THE REFRAME.** Count the TOUCHES, not the mess. Every "for now" put-down is a future pick-up.
      Each thing wears a badge of its own touches, and the twist brings the 8 "for now" spots back as ghosts
      (11 − 3 = 8 extra pick-ups).
    - **COUNTED, NOT CLAIMED.** An order list (thing → place, cued to a word) is compiled into walks,
      pick-ups and put-downs. Badges and the TOUCHES / PUT DOWN / PUT AWAY tally count the stations.
      Module-load assertions check the VO's three / eleven / three, ghosts = 11 − 3, routes reaching home
      only at their end, one touch each after, every put-down ≤ 6 frames from its word, and last frame = frame 0.
      Heuristic, not research: no study cited, and the house is labelled THIS HOUSE.
    - **Voice:** Edge `--rate +12%`, placed from measured clip lengths, all lines at 1.00. One line was lengthened
      so the tray → hamper walk isn't a sprint. Composition 43.3s.
    - **SFX:** library-only, 21 cues. Thocks on every put-down: the "for now" ones sit 3 dB under the ones
      that reach home. Two reverse whooshes for the rewinds, stamp on 11 TOUCHES, stamp + chime on ONE TOUCH EACH.
      Audition **−16.0 LUFS, −1.2 dBTP**. Needs an ear pass.
    - **Loop:** `loop_diff.py` wrap 0.362% vs step 0.237% (**1.53×**), SEAMLESS.
    - Next in the rooms series: the kitchen-closing lap · "nothing lives on the stairs" · a homework station.

42. **short-42 · Money math** — "Why Small Purchases Destroy Your Budget" ✅
    (`Short42Money`; reuses `lib/budget.tsx` — the ring from short-17 — as a $600 month. No new niche lib;
    `Ring` gained two additive props: `gap` (seams so 90 small blocks read as 90 taps) and `alphaOf` (isolate a block).)
    - **THE REFRAME.** Frequency beats size. One $120 jacket vs a $5 coffee a day ($150), then + $3 snack
      + $8 delivery = $16/day = $480 = 4× the jacket. The twist: "judge the month, not the price tag" — one lit
      sliver ($5) becomes thirty ($150 PER MONTH).
    - **COUNTED, NOT CLAIMED.** Hub and legend chips are read back off the drawn arcs (`spent()`); the pen steps
      one sliver per tap, so the "day N of 30" counter is the ring. Module-load assertions: blocks sum to $600,
      small stuff = 4× jacket. Prices are illustrative; the "each tap judged alone" line rests on mental
      accounting (Thaler 1985) and pennies-a-day framing (Gourville 1998).
    - **Voice:** Edge `--rate +12%`, all lines at 1.00. Every cue is a spoken word (`wAt`). Composition 42.5s.
    - **SFX:** library-only, 35 cues — soft UI clicks as purchase taps (every 3rd coffee / 4th delivery / 5th
      snack), stamps on $150 > $120 and 4×, deep impact at $0, chime on the lit month. Audition **−15.6 LUFS**.
      Needs an ear pass.
    - **Loop:** `loop_diff.py` wrap 0.448% vs step 0.355%, SEAMLESS.
    - Money-series follow-ups on the same ring: subscriptions you forgot · the "it's on sale" math · BNPL split.

43. **short-43 · Money math** — "The Cost Per Use Trick" ✅
    (`Short43Peruse`; new niche lib `lib/peruse.tsx`, the amortization engine: price as a bar, each use one more slice.)
    - **THE REFRAME.** The price you pay is not the cost you carry. $50 boots split after 25 wears ($2.00/wear) and
      $200 boots last 400 ($0.50/wear), so the good pair is 4× cheaper per wear. The twist runs it backwards:
      a $50 gym month used twice is $25 a workout.
    - **THE CAVEAT IS SHOWN.** The two pairs are sliced side by side, day for day. At wear 25 the $200 pair reads
      **$8.00** and only ties at wear 100 (a TIE stamp). The video argues for the expensive pair only on the
      condition that you actually use it.
    - **COUNTED, NOT CLAIMED.** Every readout is `price / slices drawn`. Module-load assertions check break-even
      at 100, 4× cheaper and $25/workout.
    - **Voice:** Edge `--rate +12%`, placed from measured clip lengths, so every line came in at 1.00 on the first pass. 43.3s.
    - **SFX:** library-only, 27 cues. Clicks are slice cuts (every 5th / 25th / 100th wear), one knock on the split,
      and stamps on the tie, 4× (layered with an impact) and $25. Audition **−15.9 LUFS**. Needs an ear pass.
    - **Loop:** `loop_diff.py` wrap 1.191% vs step 1.732% (0.36× a normal step), SEAMLESS.
    - Series on `lib/peruse.tsx`: cost per streaming hour · rent vs buy the drill · the course you never opened ·
      a car's real cost per mile · the "investment piece" that stays in the closet.

44. **short-44 · Sleep / chronobiology** — "Why Do You Wake Up at 3 AM?" ✅
    (`Short44Wake`; new niche lib `lib/hypno.tsx`, the hypnogram engine: a night as a segment list, depth against the clock.)
    - **THE REFRAME.** You don't wake up at 3 AM out of nowhere. You surface at the end of every ~90-min cycle and
      forget almost all of those awakenings. 3 AM is the one you remember because by then the floor has risen:
      deep sleep is spent, sleep pressure is two-thirds drained and cortisol is starting to rise.
    - **DERIVED, NOT DRAWN.** Spikes, cycles, each cycle's FLOOR (the deepest stage it reaches) and the deep-sleep
      share are all read off one segment list. "100% over by 3 AM" and "34% left" (e^(−4.5/4.2), Process S) are
      computed, not typed. The floor line stepping up from DEEP to LIGHT *is* the thesis.
    - **THE TWIST IS BEHAVIOURAL.** Waking is normal and checking the clock is the problem (Tang, Schmidt & Harvey
      2007: clock monitoring → more worry, longer to fall asleep). The awake stretch widens on "worry" while the chip
      counts 03:04 → 03:40 (illustrative, nothing spoken), then closes on "don't look".
    - **Voice:** Edge `--rate +12%`, one line at 1.11×, the rest at 1.00. 44.0s.
    - **SFX:** library-only, 24 cues. The pen clicks at each surfacing (diegetic). Three heroes: deep-impact on the
      deep blocks, riser→impact on FLOOR RISES, and toggle + clock ticks on the clock chip. Audition **−15.6 LUFS**.
      Needs an ear pass.
    - **Loop:** `loop_diff.py` wrap 0.312% vs step 2.329% (0.13×), SEAMLESS.
    - Series on `lib/hypno.tsx`: alcohol steals the second half's REM · why a 90-min nap beats a 45 · why the alarm
      mid-deep-sleep wrecks you · the first night in a hotel (one ear awake) · teens' shifted night.

45. **short-45 · Productivity / one-page planning** — "How to Organize Your Life in One Page" ✅
    (`Short45Page`; new niche lib `lib/page.tsx`, the one-page engine: a sheet of paper, loop chips with one
    geometry per stage, a head profile and counted tallies.)
    - **THE REFRAME.** Organizing your life is usually a system-and-app listicle. Here the page is a method in
      three steps printed on the page itself: DUMP (24 loops leave the head) · SORT (six area boxes) · PICK ONE
      (one NEXT action per box, the other 18 go to LATER). "Six things, not twenty-four."
    - **THE TWIST IS THE STUDY.** DONE reads 0 / 6 while IN YOUR HEAD reads 0. Masicampo & Baumeister 2011
      (JPSP 101:667–683) found that making a specific plan, without making any progress, eliminated the intrusive
      thoughts from unfulfilled goals. Hedged as "in one set of studies". Payoff: "It needs it written down."
    - **COUNTED, NOT CLAIMED.** Each chip blends head → dump → box slot → NEXT/waiting → LATER by per-chip
      progress. IN YOUR HEAD / ON THE PAGE / NEXT / LATER / DONE are all counted from those same values.
      Module-load assertions: frame 0 = 0/6/18, 24 in the head on "shouting", head empty by "small", 6/18 on
      "six", and the last frame counts like frame 0. Area colours relight on each spoken area word.
    - **Voice:** Edge `--rate +12%`, all 11 lines at 1.00 on the first pass. 43.5s.
    - **SFX:** library-only, 28 cues. Soft clicks as loops land on the paper (every 3rd), a page-flip for the sheet,
      a pencil scribble on "circle", and stamp + chime on WRITTEN, NOT DONE. Audition **−15.9 LUFS, −1.2 dBTP**.
      Needs an ear pass (the scribble sits under the duck).
    - **Loop:** `loop_diff.py` wrap 0.312% vs step 6.849% (0.05×), SEAMLESS.
    - Series on `lib/page.tsx`: the weekly review on one page · the 3-item daily card · a brain-dump before
      sleep · the "someday" list that stops the guilt · a project that fits on one index card.

46. **short-46 · Psychology / creativity** — "Why You Suddenly Get Ideas in the Shower" ✅
    (`Short46Shower`; new niche lib `lib/wander.tsx`, the thought-network engine: nodes packed in HEAD space and
    projected through a head pose, kNN wiring, path pulses, a spotlight, ShowerRain periodic in the composition
    length, SparkBadge, a 3-zone Dial. Reuses `Head` + `Tally` from `lib/page.tsx`.)
    - **ONE CANVAS.** Frame 0 is the payoff (gold link THE PROBLEM ↔ Lego, IDEA lit, water falling). "At your desk"
      rewinds it: FOCUS MODE spotlight, the same 3-node path run ×3 into a pink X. "Step into the shower": water
      falls, spotlight dissolves on "lets go", the wander hops through every labelled memory (NEW LINKS 1→6),
      "touch" draws the gold arc, "Click" fires the spark.
    - **THE TWIST IS THE STUDY.** Baird et al. 2012 (Psychological Science 23:1117–1122): an undemanding task
      during an incubation break beat rest, a demanding task and no break. The dial HARD TASK · JUST ENOUGH ·
      PURE REST: needle parks on rest ("isn't best", struck through), glides to JUST ENOUGH on "easy task".
      Hedged as "in one study". The network is illustrative.
    - **COUNTED.** SAME PATH ×n and NEW LINKS n are counted from the run/hop schedule; module-load assertions:
      3 runs by "dead end", all 6 hops done by "touch", no node revisited.
    - **Voice:** Edge `--rate +12%`, lines 5 and 7 squeezed 1.03/1.04, the rest 1.00. 45.0s.
    - **SFX:** library-only, 22 cues. A click per dead-end run and per new link, `stream-soft` as the water turns
      on, riser → impact + chime on "Click". Audition **−15.7 LUFS**. Needs an ear pass.
    - **Loop:** `loop_diff.py` wrap 3.438% vs step 5.183% (0.66×), SEAMLESS.
    - Series on `lib/wander.tsx`: why walks unstick problems · the "tip of the tongue" that returns later ·
      why boredom breeds ideas · sleep on it (incubation overnight) · why you remember at the door.

47. **short-47 · Habits / automaticity** — "How to Make Good Habits Feel Automatic" ✅
    (`Short47Autopilot`; new niche lib `lib/autopilot.tsx`, the automaticity engine: a habit is a SCHEDULE of
    done/missed days, automaticity is read off the repetition count through one asymptotic curve
    `1 − e^(−reps/τ)` with τ solved so 95% lands on the plateau day. Reuses `Tally` from `lib/page.tsx`.)
    - **ONE CANVAS.** Frame 0 is the payoff (CUE "After coffee" wired to THE HABIT by a thick gold link, curve at
      DAY 66 · 95%). "Most people" rewinds it to day 0; the cue card flips to MOTIVATION and a pink DECIDE gate
      grows back mid-link (the gate's fade and the link's width ARE the automaticity). Three decisions knock the
      gate; "cue" flips the card back; "Every repeat" runs days 0→66 with one pulse per repetition.
    - **THE TWIST IS THE STUDY.** Lally et al. 2010 (EJSP 40:998–1009): median 66 days to 95% of the plateau,
      range 18–254; one missed opportunity did not materially affect formation. "21 days?" marker prints the
      curve's own value there (62%) and is struck; day 24 is missed in the schedule, a pink "reset" ghost is drawn
      and dismissed (NO RESET). "21 days" = Maltz 1960, not a habit study. The curve is illustrative.
    - **COUNTED.** Module-load assertions: day 66 reads 95% and is the FIRST day at 95%; 3 decisions by "costs";
      the run is finished before "21 days" is struck; the first days are individually visible.
    - **Voice:** Edge `--rate +12%`, every line at 1.00 (windows re-fitted after a first pass squeezed line 3
      1.14×). 41.6s.
    - **SFX:** library-only, 28 cues. A knock per forced decision, a tick per early rep landing on THE HABIT,
      riser as the reps blur → chime at the plateau, pencil strike on "21 days", chime on NO RESET. Audition
      **−15.6 LUFS**. Needs an ear pass.
    - **Loop:** `loop_diff.py` wrap 0.312% vs step 3.153% (0.10×), SEAMLESS.
    - Series on `lib/autopilot.tsx`: habit stacking (the cue is an old habit) · why evening habits stick slower ·
      "never miss twice" (two misses vs one, drawn) · why vacations break routines (the context changes) ·
      the two-minute version (tiny reps still count).

48. **short-48 · Physiology / thought experiment** — "What If Humans Could Breathe Underwater?" ✅
    (`Short48Gills`; new niche lib `lib/gill.tsx`, the gill-breather engine: an O₂ budget and a heat budget
    computed from textbook inputs, a side-profile swimmer with gill slits, a temperature-coloured blood loop, a
    water stream with integrated periodic phase, flasks of O₂ dots, bars, fish. Reuses `Tally` from `lib/page.tsx`.)
    - **THE REFRAME.** Oxygen is the problem everyone expects: air holds ~33× more per liter, so you'd pump ~49 L of
      water a minute at rest (your body weight every 86 s). The twist is HEAT. All blood crosses the gills and
      leaves at sea temperature, so you lose 5.4 kW against 84 W made (×65). That's why almost every water breather
      is cold-blooded. "Gills aren't the hard part. Staying warm is."
    - **COMPUTED, NOT CLAIMED.** The ×33 chip is the dot count, 49 L/min and 1:26 come from demand/extraction, and
      BLOOD OUT and HEAT LOST are read off the same `tOut`. Module-load assertions tie each to its VO wording.
    - **Voice:** Edge `--rate +12%`, all lines 1.00. 40.3s.
    - **SFX:** library-only, 22 cues. A water pour on "pump", a tick-clock for the body-weight run, riser → deep
      impact on "heat", riser → impact on the ×65 pill, chime on "warm". Audition **−15.6 LUFS**. Needs an ear pass.
    - **Loop:** `loop_diff.py` wrap 1.427% vs step 1.732% (0.82×), SEAMLESS.
    - Series on `lib/gill.tsx`: why fish suffocate in warm water (O₂ solubility vs temperature) · how tuna stay warm
      (countercurrent retia) · why whales still breathe air · liquid breathing (perfluorocarbon) · why altitude
      feels like thin water.

49. **short-49 · Actuarial / thought experiment** — "What If Humans Could Live for 500 Years?" ✅
    (`Short49Life`; new niche lib `lib/life.tsx`, the survival engine: a Gompertz–Makeham hazard
    h(t) = 0.0007 + 0.00005·2^(t/8), an "ageless" world with the hazard frozen at h(20), a survival chart with a
    zoomable age axis, a 100-person grid where each person dies at their own survival quantile, years-left bars.)
    - **THE REFRAME.** No aging does not mean immortality. Frozen at the age-20 risk (~1 in 1,000/yr), only 61% make
      it to 500 and the median death is ~708. Old-age deaths drop to zero, so accidents become the top killer and
      expected years left at 30 go from 49 to ~1,020. "You'd stop aging. You wouldn't stop dying."
    - **COMPUTED, NOT CLAIMED.** 61 alive, 3 at 100, median 708, 49 vs ~1,020 come from the curves. Module-load
      assertions tie each number to its VO wording, and frame 0 / the last frame must both show the year-500 count.
    - **Voice:** Edge `--rate +12%`, all lines 1.00. 37.6s.
    - **SFX:** library-only, 16 cues. Reverse whoosh on each rewind, a toggle on "off", a wind glide as the axis zooms
      to 1000, a tick-clock under the 500-year scrub, riser → deep impact as the dead turn pink on "accidents", chime
      as the ageless bar fills on "centuries". Audition **−15.1 LUFS**. Needs an ear pass.
    - **Loop:** `loop_diff.py` wrap 0.312% vs step 4.900% (0.06×), SEAMLESS.
    - Series on `lib/life.tsx`: why women outlive men (hazard offset) · what curing cancer adds (~3 yrs, cause
      removal) · the 1900 vs today survival curve (infant mortality) · why a 90-year-old's odds look like a coin
      flip · how insurers price your birthday.

50. **short-50 · Physics / thought experiment** — "What If Sound Traveled as Fast as Light?" ✅
    (`Short50Thunder`; new niche lib `lib/wave.tsx`, the wavefront race: a source fires, its light reaches the
    listener that frame, its sound rings crawl at `speed`; cloud/bolt, volcano + plume, listener with FLASH/BOOM
    tags, distance bracket, a delay readout, and a log-scale speed ladder with a wall.)
    - **THE REFRAME.** Frame 0 is today's world (thunder lands at 2.92 s) under the question; the setup strike
      crawls 1 km in REAL time, so the delay you watch is the delay you would hear. Light-speed sound collapses it to
      0.0000033 s; Krakatoa -> Rodrigues (4,800 km) goes from 3 h 53 min to 0.016 s. Twist: condensed matter caps sound
      at ~36 km/s (Trachenko et al., Sci. Adv. 2020), still ~8,300x slower than light. "So thunder will always come second."
    - **COMPUTED, NOT CLAIMED.** Every readout is distance / speed from `PHYS`; module-load assertions tie each to its
      VO wording (3 s, 3 millionths, nearly 4 h, 16 ms, nearly 900k x) and require the loop thunder to land and settle
      before the last frame (it caught a 2-frame shortfall on the first QA pass).
    - **Voice:** Edge `--rate +12%`; the Krakatoa line needed +0.8 s of room to avoid a 1.13x squeeze, all lines now
      1.00-1.05. 48.0s.
    - **SFX:** library-only, 25 cues. Each strike = flash (impact-soft) + boom (impact-deep-soft) on the exact landing
      frame (strike + 87f), so the audio gap IS the physics gap. `thunder-clap` recipe added to palette.json but not
      generated (ElevenLabs quota exhausted); swap it onto the HERO booms when available. Audition **-16.0 LUFS**.
      Needs an ear pass.
    - **Loop:** `loop_diff.py` wrap 0.312% vs step 2.399% (0.13x), SEAMLESS.
    - Series on `lib/wave.tsx`: why you see fireworks before you hear them · what a sonic boom actually is · what if
      light were as slow as sound · how bats and sonar measure distance · why the Moon landing had no sound.

51. **short-51 · Bioacoustics / thought experiment** — "What If Humans Could Talk to Animals?" ✅
    (`Short51Talk`; new niche lib `lib/hear.tsx`, the hearing chart: a log-frequency axis (10 Hz – 150 kHz),
    species call bands, a listening window (your ears / a translator) that lights the part of each band it covers,
    `heardShare` = log overlap, plus `CallCard`/`CallGlyph` for "this sound means this" vocab cards.)
    - **THE REFRAME.** Talking to animals first means HEARING them. Frame 0 is the translator world (5/5 heard in
      full); the window shuts to 20 Hz – 20 kHz and only YOU stay at 100%: rat laughter (50 kHz) and mouse song
      are 0%, the elephant rumble 61%. Then they're not just noises (vervet alarm calls for leopard / eagle / snake,
      dolphin signature whistles). Twist: "a translator wouldn't give animals a voice. It would give us ears."
    - **COMPUTED, NOT CLAIMED.** Every % HEARD and the HEARD IN FULL count come from the bands vs the window;
      module-load assertions tie them to the VO.
    - **Voice:** Edge `--rate +12%`, all lines 1.00 (elephant line 1.03). 43.5s.
    - **SFX:** library-only, 21 cues. Reverse whoosh as the window shuts, clicks per spotlighted caller, deep impact
      on "rumble", pops per vocab card, stamp on NAME, riser → chime as the translator opens. Audition
      **−15.5 LUFS**. Needs an ear pass.
    - **Loop:** `loop_diff.py` wrap 0.381% vs step 5.640% (0.07×), SEAMLESS.
    - Series on `lib/hear.tsx`: why dogs hear the whistle you can't · how bats "see" with 100 kHz · why your
      hearing tops out lower every decade · whale songs that cross oceans · the mosquito ringtone only teens hear.

Voice comes later by design: VO timings are ESTIMATED (~2.8–3.3 words/sec) now; when
Record or TTS-generate the track, transcribe (AssemblyAI / vidtsx_transcribe)
and swap the word-timing map — shots retime, nothing rebuilds.

52. **short-52 · Astronomy / thought experiment** — "What If Earth Had Two Suns?" ✅ (`Short52Suns`; new niche lib `lib/suns.tsx`). A star system top down, with two stars and one planet, and three readouts that are formulas read back (distance, L/d², Kepler III). Opens a **star-systems** niche.
    - **THE REFRAME.** "Double sunsets like Tatooine" is a picture, not a claim. The claim is a ledger: a second Sun doubles your light, **2× is about what Venus gets (1.91×)**, and about 10% more (1.06–1.1×, Kopparapu 2013 / Leconte 2013) is enough to start a runaway greenhouse. The fix is inverse-square: move √2 = 1.41 AU out, almost to Mars. The twist sits inside the same formula: two suns pull harder, so the year there is **434 d, not the 614 d one Sun would give**. Then it is real, and the canvas morphs into Kepler-16, whose readout computes 229 d by itself.
    - **ONE CANVAS, TWO SYSTEMS.** Kepler-16 is a `Sys` like ours, so the twist is `mixSys(ours, K16, k)`, not a cut. The hidden reset (√2 → 1 AU) happens while k = 1, which is what lets the loop return with one morph.
    - **The loop was structural on the first measurement:** integrated phases quantised to whole laps (planet 3, binary rounded). 0.66× a normal frame step.
    - Seeds a **star-systems series** (all reuse `lib/suns.tsx`, where a new video is a new `Sys` table): what if the Sun were a red dwarf (tidal lock, a 20-day year) · Proxima b's sky · why Mars is cold (0.43×) · a Sun twice as massive (a 10× brighter, far shorter life) · what Earth looks like from Venus.


53. **short-53 · Geography / economics thought experiment** — "What If Every Country Removed Its Borders?" ✅ (`Short53Borders`; no new lib, built on `lib/map.tsx` + a new `inCountry` hit test + the missing Estonia outline). The real world map, where borders are a separate layer you can fade.
    - **THE REFRAME.** The expected answer is chaos. The ledger says otherwise: the same worker earns up to **8.4×** by moving (median 2.7×), **750M** adults would move, open borders are estimated at **+50–150% of world GDP** vs **~1.7%** for free trade, and Europe's experiment (29 Schengen states) ended with only **4.4%** of working-age EU citizens living in another member state.
    - **ONE CANVAS.** Hook = borderless gradient world; borders snap in, dissolve on "freely", return everywhere except Schengen on "Europe", dissolve again on "Open". The loop is frame-0 by construction.
    - Seeds a **"what if the map changed"** series on the same canvas: one world time zone · every country the same size · if Pangaea re-formed · the world with no oceans in the way.

54. **short-54 · Physics thought experiment** — "What If Gravity Reversed for 10 Seconds?" ✅ (`Short54Fall`; new niche lib `lib/fall.tsx`). A to-scale side view against the Empire State Building, driven by a real drag simulation and a visible **sim clock** (slow-mo, fast-forward, pause, rewind, all labelled).
    - **THE REFRAME.** "You'd float away" is wrong twice: air drag caps you at 182 km/h and 339 m after 10 s (not 490 m), you coast to **431 m** (above the ESB roof), then fall for 11.8 s and land at **186 km/h**. Indoors you just hit the ceiling at **15 km/h**.
    - **The sim-clock idea generalises:** the narration never has to match real time; the clock chip keeps it honest.
    - Seeds a **falling / gravity** series on `lib/fall.tsx`: penny off the Empire State (terminal velocity, not a bullet) · jumping on the Moon vs Earth · the tallest fall anyone survived · a hole through the Earth (45 min fall).55. **short-55 · Memory thought experiment** — "What If Humans Could Remember Everything?" ✅ (`Short55Memory`; new niche lib `lib/days.tsx`). A 30-year life drawn as **one cell per real day** (10,958 cells, contribution-graph year blocks, rows are real weekdays), with a meter that **counts the lit cells**: it forgets, HSAM relights it, the bad days turn pink, and it filters again for the payoff.
    - **THE REFRAME.** "Perfect memory would be a superpower" gets two corrections, both sourced: HSAM is no better at word pairs and other lab tests (LePort et al. 2012), and the first case called it "non-stop, uncontrollable and totally exhausting" (Price, in Parker, Cahill & McGaugh 2006). Payoff: "Forgetting isn't a flaw. It's the filter."
    - **The calendar does the arithmetic:** "almost eleven thousand days", "a Tuesday three years ago" and "Mar 14, 2011 → MONDAY" are all read off the cells and asserted at module load. The kept landmarks and the bad days are seeded choices, so the meter says ILLUSTRATIVE whenever it shows them.
    - **11k cells, few nodes:** cells are grouped by (class, random stagger, chronological stagger) into about 256 `<path>`s, so a frame only sets group opacities. Render 75 s at scale 1.
    - Seeds a **days** series on `lib/days.tsx`: how many days you have left (life in days) · how many Mondays until you're 80 · why the last year feels shorter (proportion of life) · how many full moons you'll see.

56. **short-56 · Planet thought experiment** — "What If Earth's Oceans Suddenly Froze?" ✅ (`Short56Freeze`; new niche lib `lib/globe.tsx`). A real-outline orthographic Earth (Natural Earth 110m, horizon-clipped) whose sea-ice edge is ONE number driving every readout: SEA ICE = 1 − sin e, OCEAN ABSORBS from real albedos, sun rays that sink or bounce depending on the surface they actually land on.
    - **THE REFRAME.** "The Sun would melt it" is wrong: ice-albedo feedback locks it in (Budyko/Sellers 1969) — and it already happened, Snowball Earth ~700 Ma, thawed only by volcanic CO₂ over millions of years.
    - Seeds a **globe** series on `lib/globe.tsx`: what if Earth stopped spinning · what if the ice caps melted (sea level on real coasts) · what if Earth had no Moon (tilt wobble) · what if Earth were flat-lit (no axial tilt, no seasons).
