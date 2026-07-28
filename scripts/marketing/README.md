# Marketing asset scripts

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
