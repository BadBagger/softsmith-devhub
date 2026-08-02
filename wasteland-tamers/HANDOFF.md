# WASTEBOND handoff

Repo: `BadBagger/softsmith-devhub`, branch `claude/2d-sprite-game-tej79k`, folder `wasteland-tamers/`.
Live playtest build: https://badbagger.github.io/softsmith-devhub/wasteland-tamers/ (deployed to the `gh-pages` branch, NOT auto-updating -- see Deploying below).

## What it is

Phaser 3 + Vite browser game. Post-apocalyptic creature-taming RPG (find/battle/capture/bond), Pokemon-shaped loop. Playable vertical slice: title -> overworld -> encounter/battle -> capture -> walkable town with buildings -> back out.

## Scene graph

```
BootScene (preload) -> TitleScene -> OverworldScene
OverworldScene --[walk into scrub]--> BattleScene --(stop/wake)--> OverworldScene
OverworldScene --[press P]--> PartyScene --(stop/wake)--> OverworldScene
OverworldScene --[walk onto TOWN tile]--> TownMapScene (walkable town map)
TownMapScene --[walk into a building]--> TownScene (that building's interior) --(stop/wake)--> TownMapScene
TownMapScene --[walk onto south exit]--> back to OverworldScene
```

All scene transitions use `this.scene.launch(...)` + `this.scene.sleep()` on the way in, `this.scene.stop()` + `this.scene.wake(...)` on the way out -- state (gridX/gridY, party, etc.) persists on the sleeping scene instance because Phaser reuses scene objects rather than recreating them.

## Key files

- `src/data/creatures.js` -- FAMILY x TIER x STRAIN roster (8 families x 3 tiers x 4 strains). All 24 species have real AI-generated art now (`src/gen/spriteGen.js` REAL_ART_FOLDERS).
- `src/data/items.js`, `src/state/gameState.js` -- 3 consumable items (heal/cure/capture-boost), inventory as `{itemId: count}`.
- `src/data/townLocations.js` -- the 5 town buildings' backdrop/flavor/action, shared by TownMapScene (signage) and TownScene (interior).
- `src/scenes/` -- one file per scene, see graph above.
- `src/audio/sound.js` -- thin helpers over Phaser's SoundManager (`playSfx`, `playMusic`/`pauseMusic`/`stopMusic` using `scene.sound.get(key)` to hand music off between scenes without restarting it).
- `src/ui/button.js`, `src/ui/dpad.js` -- shared touch-control widgets.
- `tools/process_*.py` -- one-off asset pipelines (chroma-key slicing, UI frame cropping, prop cropping). Not run automatically; re-run manually if source art changes. Source sheets live in `tools/drive_batch/staged/` (gitignored -- if you need to re-run one of these and the source PNGs aren't there, they'll need to be re-fetched/re-pasted).

## Building & deploying

```bash
npm install
npm run dev          # local dev server
npm run build        # local build, served from /
GH_PAGES=true npm run build   # build for the Pages subpath (see vite.config.js)
```

**The playtest URL does NOT auto-deploy.** Every time you want the live URL to reflect new commits, you have to manually rebuild and push to the `gh-pages` branch:

```bash
GH_PAGES=true npm run build
# then copy dist/ into a gh-pages worktree under wasteland-tamers/ and push --
# see any of the "Update playtest build: ..." commits on gh-pages for the exact
# worktree dance (rm -rf wasteland-tamers/, mkdir, cp -r dist/. , commit, push).
```

The repo-root Pages URL (`badbagger.github.io/softsmith-devhub/`) is intentionally NOT used for this -- that's reserved for the actual SoftSmith DevHub product (an Android app this monorepo is named for). Keep builds scoped to the `/wasteland-tamers/` subpath.

## Known open issues

1. **Mobile viewport gap persists on a real device despite the dvh fix.** A real-phone screenshot (Android, Chrome-family browser) still shows a large black gap above the canvas with the game squeezed near the bottom -- the exact symptom the `100dvh` fix (commit `fec8b2a`) was supposed to resolve. I confirmed the fix IS present in the currently-served HTML (`curl`'d the live URL, both `height: 100vh` and `height: 100dvh` are there), so this isn't a stale deploy. Two live hypotheses, neither confirmed:
   - The phone's browser is serving a **cached copy of index.html** from before the fix (GitHub Pages doesn't set aggressive cache-busting headers on HTML, and mobile Chrome/Samsung Internet can cache HTML documents surprisingly persistently). Worth a hard-refresh / clear-site-data test before assuming the CSS approach itself is wrong.
   - Phaser's `Scale.FIT` may be capturing the parent element's size **once at construction**, before the mobile browser's dynamic address bar has settled into its final collapsed/expanded state, and never re-measuring. If a cache-busted reload still shows the gap, try forcing a `game.scale.refresh()` after a short delay on load, or explicitly listening for `resize`/`orientationchange` and calling `refresh()`.
   - I could not reproduce this at all in my own environment -- the Browser preview tool here runs in a backgrounded/non-composited tab, which independently breaks live-resize behavior (confirmed separately, unrelated root cause), so I have no way to iterate on a real mobile-viewport repro from this session. This needs actual device testing to resolve.

2. **"No assets used in overworld"** (user's phrasing, unconfirmed which meaning): the overworld map (`OverworldScene`) only renders plain ground/scrub/rubble tiles + the player sprite -- it has none of the decorative props (crates, trees, gate, etc.) that `TownMapScene` just got in commit `0b55c0f`. I read the code and didn't find an actual asset-loading failure (same `BootScene` preload serves both scenes, and `TownMapScene` demonstrably renders its assets fine in the same screenshot that flagged this) -- my best read is this is a design observation ("the overworld looks bare next to the new town") rather than a broken-texture bug, but I haven't verified on a real device myself. Worth a screenshot of the overworld specifically to confirm which it is before doing anything.

3. `public/props/prop-shack.png` was cropped but never wired into any scene -- harmless leftover.

4. Two banked sounds (`public/audio/banked/floor-collapse.mp3`, `big-splash.mp3`) have no feature to attach to yet (were pulled ahead of time for a possible flooded-passage/rescue encounter that doesn't exist).

## Asset sourcing conventions (for continuing the pattern)

- Creature/prop art: AI-generated on a **magenta chroma-key background**, processed via `tools/process_sprites.py` (creatures) or `tools/process_props.py` (props/icons) using the shared `chroma_key()`/`tight_bbox()` helpers -- grid-slice the sheet, chroma-key each cell, tight-crop to content. This is the preferred pipeline going forward since it's robust to imprecise crop boxes (excess magenta just becomes transparent).
- Backdrop paintings / UI frames: NOT chroma-keyed (photographic/painterly sheets with a blurred non-key background) -- these need manually-found fixed pixel crop boxes (see `tools/process_backdrops.py`, `tools/process_ui.py` for examples of the box-hunting approach: crop generously, view, narrow down).
- Sound effects/music: sourced from freesound.org (CC0/CC-BY only, commercial-use-safe), see `public/audio/CREDITS.md` for attribution requirements on the two CC-BY tracks.
