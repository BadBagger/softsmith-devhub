# WASTEBOND — Tame. Fight. Survive.

Standalone 2D sprite game prototype. Post-apocalyptic creature-taming RPG:
Pokemon's find/capture/battle loop, Fallout's wasteland tone. Not part of
the SoftSmith Android app registry — this is a separate browser game living
in this folder (project directory is still named `wasteland-tamers/`; only
the in-game branding changed to WASTEBOND).

## Run it

```
npm install
npm run dev
```

Open the printed local URL. Arrow keys / WASD to move, walk into scrub
(green-flecked) tiles to trigger a wild encounter, Up/Down + Enter (or
click) to pick a battle action.

## Structure

- `src/data/creatures.js` — creature roster as FAMILY x TIER x STRAIN. 8
  families x 3 tiers today (24 species) x 4 strains = ~90+ distinct
  creatures already; add a family or tier entry here to grow the roster,
  no other code changes needed.
- `src/gen/spriteGen.js` — procedural placeholder sprites per family
  silhouette, generated as Phaser textures. Stand-in until real art
  (hand-drawn or AI-generated + processed) replaces it.
- `src/scenes/` — Boot (asset preload + texture setup), Title (WASTEBOND
  splash), Overworld (tile map + movement + encounters), Battle (turn-based
  Attack/Capture/Flee + status effects).
- `src/battle/status.js` — Poison/Sleep/Confuse rules as pure functions,
  unit-testable without Phaser.
- `src/state/gameState.js` — party state shared across scenes.
- `tools/process_sprites.py` — chroma-keys and slices AI-generated 4-pose
  art sheets into game-ready frame PNGs (`public/sprites/`).

## Status

Playable vertical slice: title screen, move, encounter, fight (with status
effects), capture, return. Real art wired in for the scavenger and three
creatures (Glowmite, Scraphowler, Ironback Titan); the rest of the roster
is still procedural placeholder sprites. No save system, no towns/story/
healing/factions yet — see chat history for the fuller WASTEBOND vision
this is scoped down from.
