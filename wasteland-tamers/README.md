# Wasteland Tamers — The Dead Sunbelt

Standalone 2D sprite game prototype. Post-apocalyptic creature-taming RPG:
Pokemon's find/capture/battle loop, Fallout's wasteland tone. Not part of
the SoftSmith Android app registry — this is a separate browser game living
in this folder.

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
- `src/scenes/` — Boot (texture setup), Overworld (tile map + movement +
  encounters), Battle (turn-based Attack/Capture/Flee).
- `src/state/gameState.js` — party state shared across scenes.

## Status

Playable vertical slice: move, encounter, fight, capture, return. No save
system, no towns/story/healing yet, no real sprite art yet — see chat
history for the "art bible" concept sheet this palette/tone is based on.
