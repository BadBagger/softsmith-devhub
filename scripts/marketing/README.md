# Marketing asset scripts

Shared imaging primitives (drop shadow, glow, fonts, rounded rects, cover-fit
paste) live in `_common.py` and are used by both scripts below.

## `listing_compositor.py`

Builds a full marketplace-style listing image for an icon pack: title +
kicker + info pill, a count badge ("45 ICONS / 2 WALLPAPERS"), a phone
mockup with a live homescreen preview, a hero icon showcase grid, a small
"icon preview" mini-grid, a wallpaper strip, and a row of feature badges.

This reproduces the *structure* of a typical Etsy/marketplace icon-pack
listing image, not any specific theme. Nothing about moons, stars, pastel
colors, or any other one-off decoration is hardcoded — every color, font,
background image, phone frame, and icon/wallpaper set is passed in through
`ListingConfig` / `build_listing()`, so the same layout works for a
completely different pack next time (neon, minimalist, seasonal, whatever).
Section positions are stored as fractions of the canvas, so the layout
scales with `width`/`height` instead of being pinned to fixed pixels.

Decorative background art (corner flourishes, gems, seasonal motifs, etc.)
is expected to already be baked into the `background` image you supply —
the script only composites text and asset grids on top of it.

### Usage

Edit the `ListingConfig` and the `build_listing()` call at the bottom of
`listing_compositor.py` to point at your own background, phone frame,
wallpaper, and icon files, then run:

```bash
python3 scripts/marketing/listing_compositor.py
```

This writes `listing.png`. Every asset argument is optional — omit
`phone_frame` to fall back to a plain drawn bezel, omit `hero_icons` /
`preview_icons` / `wallpapers` / `badges` to skip those sections entirely.

## `hero_compositor.py`

Builds a consistent hero/banner image (e.g. for an icon pack listing) by
compositing a background image with a grid of icons, instead of asking an
AI image generator to guess the layout every time. Same template, same
placement, same lighting — swap the background and icon files and you get a
new hero image with the same polished look.

### Setup

```bash
pip install -r scripts/marketing/requirements.txt
```

### Usage

Edit the `HeroConfig` and the `build()` call at the bottom of
`hero_compositor.py` to point at your own background and icon files, then
run:

```bash
python3 scripts/marketing/hero_compositor.py
```

This writes `hero.png` in the current directory. No network access is
required — everything is done locally with Pillow.

### What makes it "pop"

- **Drop shadow** under every icon — lifts it off the background.
- **Soft outer glow** — separates icons from busy/generated backgrounds.
- **Dark vignette/scrim overlay** — makes light icons and title text punch
  through a busy background.

Tune `shadow_*`, `glow_*`, `scrim_opacity`, and `vignette_strength` in
`HeroConfig` to adjust the effect strength without touching the compositing
logic.
