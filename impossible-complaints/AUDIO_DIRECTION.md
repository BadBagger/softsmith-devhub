# Audio Direction — The Department of Impossible Complaints

Production bible for the Municipal Lobby / Records Annex playable slice. Covers sound
identity, mix, accessibility, looping rules, voice direction, pronunciation, and licensing.
Scope: `public/audio/**`, this file, and `AUDIO_MANIFEST.json` only.

## 1. Sound identity

Rain-blue bureaucratic noir with a warm, absurd comic pulse — never grim, never cruel,
never a parody impression of an existing show, game, composer, or performer. Think: a
government office that takes itself very seriously about things that shouldn't matter,
scored with restraint instead of stinger-per-joke mickey-mousing.

- **Palette**: muted upright piano (or a plausible procedural stand-in), brushed
  percussion, paper and radiator textures, soft room tone. No big orchestral score, no
  recognizable melodies, no motifs quoted from other media.
- **Motion**: sparse and understated. Music should feel like it's "thinking," not
  driving — long gaps, single sustained or plucked notes, no constant rhythmic
  motion. Comedy timing lives in the SFX and voice, not underscoring every joke.
- **Harmonic unease**: a held dissonant interval (e.g. a tritone dyad) sits low in the
  mix at all times in the Lobby — reality is administratively wrong, and the ear should
  feel that a half-step before the plot confirms it.
- **Dry vs. wet**: Municipal Lobby is the "wetter," warmer space (rain outside, steam
  radiators). Records Annex is drier, dustier, and mechanical (the ticking rhythm reads
  as a clock/stamp-counter, not a heartbeat).

## 2. Mix priorities

Priority order when cues overlap (highest wins headroom, lower cues duck):

1. **Voice** — always fully intelligible. Nothing may mask dialogue.
2. **Puzzle-critical SFX** — `clerk_stamp`, `clue_missing_tuesday`, `drawer_open`,
   `elevator_unlock`/`elevator_arrive`. These confirm state changes; the player must
   hear them even with music at full volume.
3. **UI feedback** — hover/select/cancel; short and quiet, never competing with voice.
4. **Ambience music bed** — always present but subordinate; ducks ~30–40% under voice
   and puzzle SFX (implement via a sidechain/duck on the music bus keyed off the voice
   and SFX-critical buses, or an equivalent manual ducking in the audio manager).
5. **Footsteps / incidental texture** — lowest priority, first to be culled on low-end
   devices if a voice budget is tight.

Suggested bus structure: `music`, `sfx`, `voice`, each independently mutable, mixed to
a `master` bus. Default nominal volumes are given per-cue in `AUDIO_MANIFEST.json`;
treat those as starting mix levels, not hard-coded constants.

## 3. Accessibility / reduced-audio behavior

- Provide independent Music / SFX / Voice sliders (0–100%), not just a single master
  mute. Persist the setting.
- A **"Reduced Audio"** toggle should: drop music bed volume by ~50%, disable the
  `ui-hover.ogg` cue entirely (hover spam is the most fatiguing cue in a point-and-click
  UI), and keep puzzle-critical SFX and all voice at full volume — those carry
  information, not just texture.
- No cue is the sole carrier of required information. Every voice line that reveals a
  clue (`clue_missing_tuesday`, confrontation lines) must have equivalent on-screen text
  in the existing dialogue/subtitle system; audio direction assumes captions exist at
  the UI layer and does not duplicate that requirement here.
- Avoid sustained frequencies above ~6kHz at any meaningful volume (tinnitus/hyperacusis
  friendliness) — already respected in the source renders (see §6).

## 4. Looping rules

- `lobby-ambience-loop.ogg` (64.0s) and `records-annex-loop.ogg` (56.0s) are
  **mathematically exact loops**: every oscillator/LFO in the render completes a whole
  number of cycles across the loop length, and the two noise-texture beds are
  synthesized directly in the frequency domain (IFFT of a spectrum defined only at
  that length), which is inherently periodic at that exact sample count. There is a
  4ms fade at the very start/end as a belt-and-braces silence-matched seam. Loop them
  with **no** crossfade or overlap in the engine — hard-cut loop points at sample 0 and
  end-of-file. Do not resample or time-stretch these files; that will break the exact
  periodicity.
- `case-closed-stinger.ogg` (5.5s) and all SFX/voice files are **one-shots**, not loops.
  Never set `loop: true` on them (see `AUDIO_MANIFEST.json`'s `loop` field, which is
  authoritative).
- When the scene changes (Lobby ↔ Records Annex), crossfade the two music beds over
  ~1.5–2.5s in the engine rather than hard-cutting — the source loops don't need to
  align with each other, only with themselves.
- `case-closed-stinger.ogg` plays as a **layer on top of** the current ambience bed
  (does not replace it), then the bed continues looping underneath.

## 5. Voice direction

General note: all three roles are **role labels**, not named characters — casting,
final voice actors, and any proper names are future decisions and are intentionally
left open here.

### PROTAGONIST
Tired, intelligent, dry, humane. The clerk investigating the complaint has seen enough
municipal absurdity to be unshockable, but hasn't gone cynical or cruel — the humor
comes from precise, deadpan observation, not from mocking the world or other
characters. Avoid: hardboiled noir-detective pastiche, sarcasm that reads as mean,
exhaustion that reads as depressed rather than wry. Play every line like someone who
still, quietly, wants to get this right. Pace: unhurried, slight air of "of course this
is happening," occasional real warmth breaking through the dryness (especially in
reactions to the pigeon and to small kindnesses). Never rushed, never shouted.

### PAPER_CLERK
Officious, and *delighted* by procedure — not malicious, not an obstacle for its own
sake. The comedy is that the clerk finds genuine, sincere joy in forms, stamps, and
correct process; frustration for the player should come from the system, not from the
clerk being unpleasant. Physically "made of forms and rubber stamps" — direction should
lean into crisp, papery, percussive vocal rhythm (short declarative sentences, a
love of enumerating rules) rather than a wet or organic vocal quality. Play with bright
enthusiasm that never curdles into smugness; when procedure is questioned, the clerk
is fluttered/defensive, not cruel.

### PIGEON
Terse, self-important municipal courier. Sparse use by design — a handful of short
lines plus the non-verbal `pigeon-coo.ogg` cue. Every line should sound like an
inter-office memo spoken aloud: clipped, faintly self-satisfied, entirely unbothered by
the absurdity around it. No cartoon squawking, no cutesy bird affectation — the joke is
that the pigeon is the most professionally composed employee in the building.

## 6. Pronunciation & delivery guide

| Phrase | Pronunciation | Delivery notes |
|---|---|---|
| **Form 48-B** | "Form Forty-Eight B" (/fɔːrm ˌfɔːr.ti.eɪt ˈbiː/) — never "four-eight-bee" digit-by-digit, never "forty-eight-bee" run together without the stress on "Forty-Eight." | PAPER_CLERK says this with visible pride, almost savoring the number, like naming a favorite recipe. PROTAGONIST says it flatly, already tired of it. |
| **Official Grievance of Moderate Importance** | Full title spoken evenly, no vocal irony quotes — "Official" and "Moderate" both get light stress, since the joke is the institution's own straight face, not the actor's. | Never wink at the audience. The absurdity is in the phrase existing at all, not in how it's read. PAPER_CLERK recites it like a job title. PROTAGONIST reads it back once, deadpan, as if confirming a diagnosis. |
| **Tuesday was never approved** | Even, level stress across "never" and "approved" — do not over-stress "Tuesday" as if it were a punchline. | This is the confrontation line and the thesis of the mystery. PROTAGONIST delivery should land as a genuine, slightly incredulous realization the first time, not a gag read. PAPER_CLERK, if echoing it back, treats "never approved" as a bureaucratic status, not an absurdity — that mismatch *is* the joke. |

## 7. Originality & licensing

- Every audio asset in this pack — music, SFX, and voice — is **procedurally
  synthesized from first principles** (oscillators, noise fields, and a lightweight
  physical string model for plucked-note material; voice lines rendered via local
  text-to-speech), with **no sampled audio, no licensed sound libraries, and no
  recordings of any existing game, show, composer, or performer** used as source
  material at any point.
- No cue imitates, evokes as an impression, or is derived from copyrighted or
  trademarked characters, voices, musical works, or sound-alikes. Musical material
  avoids quoting recognizable melodies by construction (procedurally generated,
  non-thematic, sparse).
- All assets in this pack are original work product and are cleared for commercial use
  in this project. If any file in this pack is ever replaced by human-performed voice
  or human-composed/recorded music, the same clearance standard applies: original
  composition/performance or properly licensed commercial-use material only — never an
  impression of an existing IP's character voice or a copyrighted recording.
- See §8 for the current quality tier of what's included and what a follow-up pass
  should replace.

## 8. Status of included assets (read before wiring up)

Everything under `public/audio/` in this pack is a **real, playable, implementation-ready
placeholder pass** — not text prompts — generated with open procedural DSP (Python/NumPy
+ a Karplus-Strong style plucked-string model for the piano-ish material, IFFT-based
noise synthesis for loop-exact ambience beds) and local `espeak-ng` text-to-speech for
every voice line. That means:

- **Music and SFX** are original synthesized audio and are reasonably close to final —
  loop math is exact, levels are safe, and they're usable in-engine today.
- **Voice lines** are functional scratch VO: correct final wording, correctly
  differentiated by pitch/speed per character, and safe to wire up for playtesting
  pacing, trigger logic, and talk-while-speaking animation timing today — but they are
  **robotic TTS, not acted performance**, and should be treated as a placeholder pass
  pending a real voice actor or higher-end TTS/voice-cloning-free synthesis pass per
  role, replaced 1:1 by `line_id`/filename so no code needs to change.

This is called out explicitly so nobody mistakes the current voice files for final
quality — swap them 1:1 by filename whenever a real VO pass happens.

### Chapter 1 dialogue/timing manifest

Chapter 1's voice lines are **not** listed individually in `AUDIO_MANIFEST.json`
(that file covers music/SFX and a chapter-agnostic pointer note). The authoritative,
per-line source is **`script/CHAPTER_01_DIALOGUE.json`**: one entry per spoken clip
with `line_id`, `speaker`, final locked `text`, `audio_filename`, `duration_s`, and
`word_timestamps`/`phoneme_timestamps` fields present but `null` — a ready slot for a
forced-alignment pass once real VO exists, without changing the schema. Duration
today is TTS-clip length, which is enough to drive "talk while speaking" animation
now (hold a talk-loop for `duration_s`); true viseme/mouth sync needs the timestamp
fields filled in after real recording. Clip lengths vary by content — short barks
("No.", "Ah.") run under half a second, longer examine/flavor lines run up to ~13s;
there is no fixed cap, unlike the short interactive-cue set in `AUDIO_MANIFEST.json`.
