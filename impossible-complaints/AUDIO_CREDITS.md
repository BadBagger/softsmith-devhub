# Audio Credits — Third-Party Sourced Material

Everything under `public/audio/music/` and `public/audio/sfx/` that is **not** listed
here is original procedurally-synthesized audio (see `AUDIO_DIRECTION.md` §7) or, for
voice lines, placeholder TTS — no attribution required for those.

The sounds below were sourced from [Freesound.org](https://freesound.org) and are
processed derivatives (trimmed, normalized, mixed, and in one case re-spliced) of the
original recordings. Freesound "Attribution" (CC-BY) licenses require the credit line
below to ship with the game; "CC0" sounds are logged here for provenance only — no
legal attribution is required for them, but keeping the record avoids ever losing
track of where third-party material came from.

## Requires attribution (CC-BY 4.0)

- **`public/audio/sfx/dispenser-ticket.ogg`** — derived from "Token Dispenser" by
  [sniffin_fer_sounds](https://freesound.org/people/sniffin_fer_sounds/sounds/856358/),
  licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Trimmed and
  normalized; otherwise unmodified.

**Suggested in-game/store credit line:**
> "Token Dispenser" by sniffin_fer_sounds (freesound.org), licensed under CC BY 4.0.

## CC0 (public domain equivalent — no attribution required, logged for provenance)

- **`public/audio/music/weather-ambience-loop.ogg`** — built from two CC0 sources,
  mixed and re-engineered into a seamless 64s loop (loop-tiled, loop-crossfaded, and
  mixed together; not a direct trim of either source):
  - "INT Rainy ambience (rain heard from inside a room)" by
    [Sayuri_Odin](https://freesound.org/people/Sayuri_Odin/sounds/216134/) — CC0.
  - "Ominous Rumble - loopable (24bit flac)" by
    [steaq](https://freesound.org/people/steaq/sounds/593785/) — CC0.
- **`public/audio/sfx/clue-pattern-discovered.ogg`** — derived from "Triangle_Open_02"
  by [cabled_mess](https://freesound.org/people/cabled_mess/sounds/349503/) — CC0.
  Trimmed to the initial hit + natural decay.
- **`public/audio/sfx/dill-stamp.ogg`** — derived from "Office stamp" by
  [whammy](https://freesound.org/people/whammy/sounds/514486/) — CC0. The source file
  contains several stamp takes; two of them were extracted and spliced with a short
  gap to create a deliberately hesitant "double-tap" stamp sound (see
  `script/chapter-02-weather-atmosphere-permits.md` for why — it's Officer Dill's
  stamp, and he's nervous).

## Policy going forward

New non-voice audio may be sourced from Freesound under CC0 or CC-BY only (per
project decision) — no CC-BY-NC, CC-BY-ND, CC-BY-SA, or Sampling+ licensed material.
Every CC-BY sound used must get an entry in this file with a working credit line
before it ships. `AUDIO_DIRECTION.md` §7 has been updated to describe this as a mixed
sourcing policy (originally-synthesized + curated CC-licensed samples) rather than a
100%-synthesized-only policy.
