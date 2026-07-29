# Gothic Rose Icon Pack — "Thorn & Velvet"

107 hand-illustrated app icons (rose-and-thorn gothic style), separated from a
single contact sheet and re-cut individually at **1040×1040px PNG**.

## Contents

- `icons/` — all 107 icons, one file per icon, named `icon-{row}-{col}-{name}.png`
  (e.g. `icon-01-01-phone.png`). Row/col refer to the position in the original
  10-wide contact sheet (row 11 is the partial trailing row of 7 icons).
- `manifest.json` — machine-readable index of every icon: filename, source
  row/col, slug name, catalog plate number, and the thematic "cabinet"
  (category) it's grouped under on the hero page.
- `hero.html` — a self-contained showcase page (fonts and thumbnails are
  inlined as data URIs, so it opens standalone with no other files needed).
  Open it directly in a browser, or serve the folder statically.

## Regenerating

The icons were produced by slicing the original contact sheet on a detected
grid, padding each crop to a square, upscaling with Lanczos resampling, and
applying a light unsharp mask, then compressing with `pngquant`. There is no
checked-in regeneration script in this repo — this folder is the delivered
output, not a build pipeline.
