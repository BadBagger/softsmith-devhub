# Lightroom Preset Packs for Etsy

Seven sellable Lightroom preset packs, 70 presets total, generated from JSON
definitions. Everything a buyer downloads is produced by `build_presets.py`,
so a look can be tweaked and the whole product rebuilt in one command.

This folder is a digital-product line and is independent of the Android app
registry in the rest of DevHub. Nothing here touches `apps.yml`.

## The packs

| Pack | Look | Presets |
| --- | --- | --- |
| Golden Hour | Warm, sunlit portrait and outdoor tones | 10 |
| Coastal Air | Bright, clean, airy blues | 10 |
| Moody Forest | Deep green, low-light nature | 10 |
| Vintage Film 35 | Faded blacks, grain, analog colour shifts | 10 |
| Mono Editorial | Black and white with real channel control | 10 |
| Portrait Natural | Skin-first presets, checked across complexions | 10 |
| Fresh Table | Food, drinks and product photography | 10 |

## Quick start

```bash
python3 build_presets.py --clean          # build all packs + zips
python3 -m unittest discover -s tests     # verify before selling anything
python3 make_covers.py                    # title + contents cards (pillow)
python3 make_before_after.py              # before/after images (pillow, numpy)
python3 make_listings.py                  # ready-to-publish listing packages
```

`build_presets.py` has no dependencies. `make_covers.py` needs Pillow
(`python3 -m pip install pillow`).

## What the buyer gets

Each zip in `dist/zips/` contains:

```
<Pack Name> Presets/   10 .xmp presets
INSTALL.txt            install steps for Classic, desktop, iOS, Android
LICENSE.txt            personal + commercial use, no resale
READ-ME-FIRST.txt      orientation and the preset list
```

`.xmp` is the format Lightroom Classic, Lightroom desktop, Lightroom mobile
(including the free version) and Photoshop Camera Raw all import.

## Editing a look

Looks live in `packs/*.json`. A pack has a `base` block applied to every
preset, and each preset overrides what it needs:

```json
{
  "base": { "Contrast2012": 6, "Vibrance": 14 },
  "presets": [
    { "name": "Golden Hour 03 Deep Amber",
      "description": "Richer and heavier.",
      "settings": { "Contrast2012": 14 } }
  ]
}
```

Setting names are Camera Raw attribute names without the `crs:` prefix.
`PARAM_SPEC` in `build_presets.py` is the allowed list with ranges — an
unknown name or an out-of-range value fails the build rather than shipping a
broken preset. Tone curves go in `baseCurves` / `curves` as `[input, output]`
points from 0 to 255.

## Rules these presets follow

Three decisions that keep the packs working on a buyer's photos rather than
only on the preview images:

- **No absolute white balance.** Presets use `IncrementalTemperature` and
  `IncrementalTint`, which shift the photo's own white balance. A fixed
  Kelvin value would force every photo to the same white balance regardless
  of what it was shot under. Enforced by a test.
- **No Process Version pin.** Pinning PV2012, as many preset shops do, drags
  modern photos onto an older rendering engine and flags them as out of date
  in current Lightroom. Each photo keeps its own.
- **No crop, rotation, or lens correction.** A preset that reframes someone's
  photo is a support ticket. Enforced by a test.

Preset UUIDs are derived from the pack id and preset name, so rebuilding and
reissuing a pack updates a buyer's presets in place instead of creating
duplicates. Zips are byte-identical across rebuilds.

## Before/after images

`make_before_after.py` downloads freely licensed photos into `sources/`,
renders each pack onto them, and writes split before/after frames and
four-up grids into `covers/`.

```bash
python3 make_before_after.py
```

The "after" frames come from `render_preview.py`, an independent
reimplementation of the Camera Raw adjustments. It reads the same .xmp files
that ship to buyers, but it is **not** Adobe's renderer and will not match
Lightroom pixel for pixel. Adobe's tone mapping and colour engine are
proprietary, and Lightroom starts from linear RAW where this starts from an
8-bit JPEG.

So: use these to judge and iterate on a look. **Before publishing, re-export
the same `sources/` files through Lightroom**, so the "after" a buyer sees is
exactly what the preset produces on their machine. Listing an approximation
is how you earn refund requests.

Portraits use two complete frames side by side rather than the split frame,
because bisecting someone's face makes an unsettling listing image.

**Photo licensing, including a caveat you are choosing to accept.** The
landscape photos contain no identifiable people. The portraits obviously do.
The Unsplash Licence permits commercial use but does **not** grant a model
release, and does not cover uses implying the person endorses your product.
Using stock portraits in preset listings is common and generally tolerated,
but it is a real risk. Lower-risk options, worth moving to once the shop
earns: portraits you shot yourself with a signed release, or paid stock
(Adobe Stock, Shutterstock) where a release is included. Full note in
`sources/CREDITS.md`.

## Publishing a listing

`make_listings.py` turns `listings/etsy-listings.md` into one folder per
listing under `listings/ready/`, with the fields in the order Etsy's form
asks for them:

```
listings/ready/fresh-table/
  01-title.txt  02-tags.txt  03-description.txt
  04-price.txt  05-images.txt  06-checklist.md
```

The markdown stays the single source of truth: edit it, re-run the script.
`listings/etsy-listings.csv` has every listing on one row.

Publishing itself is manual. There is no Etsy API integration here, and
doing it through a browser needs a session with browser control (the Claude
desktop app or the Chrome extension), which a headless cloud session does
not have.

## Layout

```text
etsy-presets/
  build_presets.py        preset generator, no dependencies
  make_covers.py          title and contents cards, needs pillow
  make_before_after.py    before/after listing images, needs pillow + numpy
  render_preview.py       approximate Camera Raw renderer (previews only)
  make_listings.py        listing packages from the listing copy
  sources/                downloaded photos + CREDITS.md
  listings/ready/         one folder per listing, in Etsy paste order
  packs/*.json            the looks
  templates/              INSTALL, LICENSE, READ-ME-FIRST sent to buyers
  listings/               Etsy titles, tags, descriptions, pricing
  covers/                 generated listing images
  tests/                  41 checks over presets, zips, images and copy
  dist/zips/              the files you upload to Etsy
```
