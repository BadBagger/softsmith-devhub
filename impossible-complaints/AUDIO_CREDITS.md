# Audio Credits — Third-Party Sourced Material

**All music and SFX in this pack are built from Freesound.org recordings** (CC0 or
CC-BY only — no NC, ND, SA, or Sampling+), processed (trimmed, normalized,
pitch-shifted, re-spliced, and/or mixed into loops) rather than used verbatim in most
cases. **All voice lines (both chapters) are ElevenLabs TTS** — see below.
See `AUDIO_DIRECTION.md` §7 for the full policy statement this file backs up.

## Voice: ElevenLabs (⚠️ non-commercial free tier, read before shipping)

All 166 voice lines across both chapters (`public/audio/voice/chapter-01/*.ogg`,
`public/audio/voice/chapter-02/*.ogg`) are generated via the
[ElevenLabs](https://elevenlabs.io) text-to-speech API, model
`eleven_multilingual_v2`, using premade stock voices:

| Character | ElevenLabs voice | Voice ID |
|---|---|---|
| MARA (protagonist) | Sarah — Mature, Reassuring, Confident | `EXAVITQu4vr4xnSDxMaL` |
| QUIRE (paper clerk) | Daniel — Steady Broadcaster | `onwK4e9ZLuTAKqWW03F9` |
| DILL (permit officer) | Liam — Energetic, Social Media Creator | `TX3LPaxmHKxFdv7VOQHJ` |
| PIGEON | River — Relaxed, Neutral, Informative | `SAz9YHcvj6GT2YYXdXww` |

**⚠️ Generated on ElevenLabs' free tier, which is explicitly non-commercial per their
Terms of Service and requires crediting ElevenLabs on any public use.** This audio is
NOT cleared to ship in a commercial release as-is. Before release, either:
1. Regenerate the same 166 lines against the same voice IDs on a paid ElevenLabs plan
   (Starter tier or above includes commercial rights) — same `line_id` filenames, drop
   in as a direct replacement, no code changes; or
2. Replace with real voice-actor performance.

If shipped free-tier output is ever used even temporarily in a public build/demo, an
ElevenLabs attribution credit must be included per their ToS.

## Requires attribution (CC-BY — credit must ship with the game)

| Output file | Source | Author | License |
|---|---|---|---|
| `sfx/dispenser-ticket.ogg` | ["Token Dispenser"](https://freesound.org/people/sniffin_fer_sounds/sounds/856358/) | sniffin_fer_sounds | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| `music/case-closed-stinger.ogg` (subtle layer) | ["Perfect Gong - Success Sound"](https://freesound.org/people/qubodup/sounds/160513/) | qubodup | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |

**Suggested in-game/store credit block:**
> "Token Dispenser" by sniffin_fer_sounds (freesound.org), licensed under CC BY 4.0.
> "Perfect Gong - Success Sound" by qubodup (freesound.org), licensed under CC BY 4.0.

## CC0 (public domain equivalent — no attribution required, logged for provenance)

### Music

- **`music/lobby-ambience-loop.ogg`** (64s loop) — layered from:
  - "NYC steam radiator hiss.wav" — [sethlind](https://freesound.org/people/sethlind/sounds/265013/)
  - "INT Rainy ambience (rain heard from inside a room)" — [Sayuri_Odin](https://freesound.org/people/Sayuri_Odin/sounds/216134/) (heavily low-passed here for a "through the glass" read, distinct from its use in Ch.2)
  - "PAPER RUSTLING" — [stevielematt](https://freesound.org/people/stevielematt/sounds/707835/)
  - Piano notes C4 / Eb4 / E3 / E4 / F4 / G3 from the "88 piano keys" set — [TEDAgame](https://freesound.org/people/TEDAgame/) (ids 448549, 448602, 448614, 448613, 448595, 448559), heavily low-passed/muted and played sparsely for the "muted upright piano" + harmonic-unease texture.
- **`music/records-annex-loop.ogg`** (56s loop) — layered from:
  - "quiet library" — [Bathulile231236](https://freesound.org/people/Bathulile231236/sounds/708234/)
  - "Old Clock - Loop" — [vdr3](https://freesound.org/people/vdr3/sounds/393695/)
  - The same piano note set as above, trimmed shorter/drier for a subdued-curiosity motif.
- **`music/case-closed-stinger.ogg`** (5.3s) — "RewardText_Jingle" by
  [BaggoNotes](https://freesound.org/people/BaggoNotes/sounds/720219/) (CC0) as the
  main content, layered with a stamp thunk (see Office stamp, below) and the CC-BY
  gong listed above.

### SFX

| Output file | Source | Author |
|---|---|---|
| `sfx/ui-hover.ogg` | ["Soft UI Button Click"](https://freesound.org/people/Jummit/sounds/528561/) | Jummit |
| `sfx/ui-select.ogg` | ["Triple_Ping_Notification_Sound"](https://freesound.org/people/PiesHelpfulOven/sounds/842513/) | PiesHelpfulOven |
| `sfx/ui-cancel.ogg` | ["UI Button Sound (Cancel/Back/Exit)"](https://freesound.org/people/Nomagician/sounds/833628/) | Nomagician |
| `sfx/footstep-tile-01.ogg` | ["Footsteps on tiles"](https://freesound.org/people/Sadiquecat/sounds/707249/), one step extracted | Sadiquecat |
| `sfx/footstep-tile-02.ogg` | ["Footsteps, Tile, Male Tennis Shoes, Slow Pace"](https://freesound.org/people/SpliceSound/sounds/170498/), one step extracted | SpliceSound |
| `sfx/drawer-open.ogg` | ["drawer small wood slide open close"](https://freesound.org/people/kyles/sounds/452220/), open motion extracted | kyles |
| `sfx/paper-pickup.ogg` | ["handle_paper_2.wav"](https://freesound.org/people/jakobhandersen/sounds/181054/) | jakobhandersen |
| `sfx/paper-stamp.ogg` | ["Office stamp"](https://freesound.org/people/whammy/sounds/514486/), one clean single take extracted (Quire's confident stamp — see `sfx/dill-stamp.ogg` above for the same source used differently) | whammy |
| `sfx/elevator-button.ogg` | ["Elevator_ButtonPress_Take1"](https://freesound.org/people/BaggoNotes/sounds/719432/) | BaggoNotes |
| `sfx/elevator-arrive.ogg` | ["Soft-Notifications - Bell - LowDing"](https://freesound.org/people/LegitCheese/sounds/571511/) (ding) + ["elevator door open 7a"](https://freesound.org/people/Yoyodaman234/sounds/341186/) (mechanical layer) | LegitCheese, Yoyodaman234 |
| `sfx/ledger-open.ogg` | ["Opening a book"](https://freesound.org/people/mateusboga/sounds/614081/) + ["Page Turn 01"](https://freesound.org/people/LilMati/sounds/397548/) | mateusboga, LilMati |
| `sfx/clue-discovered.ogg` | ["Handheld Bell"](https://freesound.org/people/IENBA/sounds/648960/), pitch-shifted into a 4-note ascending arpeggio (same family as `clue-pattern-discovered.ogg`, distinct source/timbre) | IENBA |
| `sfx/pigeon-coo.ogg` | ["pigeon territorial coo.wav"](https://freesound.org/people/5ro4/sounds/649390/) | 5ro4 |
| `sfx/case-closed.ogg` | "Office stamp" (whammy, above) + "RewardText_Jingle" (BaggoNotes, above), shorter/distinct edit from the music stinger | whammy, BaggoNotes |
| `sfx/clue-pattern-discovered.ogg` | ["Triangle_Open_02"](https://freesound.org/people/cabled_mess/sounds/349503/), trimmed | cabled_mess |
| `sfx/dill-stamp.ogg` | "Office stamp" (whammy, above), two takes spliced into a hesitant double-tap | whammy |

## Policy

Non-voice audio is sourced from Freesound under **CC0 or CC-BY only** — no NC, ND,
SA, or Sampling+. Every CC-BY sound gets an entry above with a working credit line
before it ships; that credit block must appear somewhere in the shipped game (About
screen, credits roll, or README — implementer's choice, but it must exist).
`AUDIO_MANIFEST.json` tags every cue built this way with `"sourced": "freesound"`.
