# The cast — the locked model sheet

The drawings live in ONE place: `remotion/src/lib/kids.tsx` (`CAST` + the `Sammy` / `Oliver` /
`Mila` components). Every episode reuses them, so a character looks the same everywhere. Change
the look there, never per episode. Kids come back for characters they recognise, and a
character that changes from episode to episode feels like a stranger.

| id | Who | Look | Personality (keep it consistent) | Voice (edge default → recast freely) |
|---|---|---|---|---|
| `sammy` | Sammy the turtle | green, golden hexagon shell, brown rim | slow, kind, determined; learns patience and asking for help | `en-US-AnaNeural` |
| `oliver` | Oliver the owl | brown, cream belly, big eye discs, orange beak + feet | wise, a little proud, can fly up and see far; stars, night, counting | `en-GB-RyanNeural` |
| `mila` | Mila the bunny | lavender-white, long pink-lined ears, pink bow | polite, bouncy, a good friend; manners: please, thank you, sharing | `en-GB-MaisieNeural` |

Narrator: `en-US-AvaMultilingualNeural` at `-4%` (warm, unhurried). With ElevenLabs, fill
`voices.elevenlabs` in beats.json with voice IDs. Narrator lines (no `speaker`) use `voicePlan`.

**Matching the existing channel.** If the channel's earlier videos used a different look for
Sammy, Oliver or Mila, change the colours in `CAST` and the shapes in the components once, and
every episode follows.

**Adding a character:** draw a `React.FC<{ m: Motion; mood: Mood; talk: number }>` in kids.tsx
(facing right, feet at y=0, ~400 units tall), add it to `CAST`, `DRAW`, `SEED`, and the single-line
`CAST_IDS` array, and add a row here.

## Series
- **Sammy & Friends**: everyday feelings and teamwork (Sammy leads)
- **Oliver's Night Sky**: counting, stars, bedtime (Oliver leads; night scene)
- **Mila's Manners**: please, thank you, sharing, waiting your turn (Mila leads)

Each series gets its own YouTube playlist and its own compilations.
