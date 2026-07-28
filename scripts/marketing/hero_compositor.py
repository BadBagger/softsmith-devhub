#!/usr/bin/env python3
"""
hero_compositor.py — build flashy, consistent hero images from AI-generated
backgrounds + icons, using a fixed template instead of AI generation.

The whole point: AI paints pixels and guesses the layout every time (flat, tiny
text, random placement). A compositor STAMPS your assets into a known-good
layout every time — pixel-perfect, repeatable, and free to run.

The "pop" comes from three things this script does that flat AI output doesn't:
  1. Drop shadows under every icon  -> lifts them off the background
  2. A soft outer glow               -> separates icons from busy backgrounds
  3. A dark vignette/scrim overlay   -> makes light icons + text punch

Usage:
    python3 hero_compositor.py

Edit the CONFIG block and the build() call at the bottom to point at your own
background + icon files. No network needed.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


# ----------------------------------------------------------------------------
# CONFIG — this is your "template". Change numbers here, get the same look every
# time with different assets. Nothing below this block usually needs editing.
# ----------------------------------------------------------------------------
@dataclass
class HeroConfig:
    width: int = 1600
    height: int = 900

    # Icon grid
    icon_cols: int = 4            # icons per row
    icon_size: int = 200         # each icon rendered at this px (square)
    icon_gap: int = 60           # gap between icons
    grid_v_offset: int = 60      # nudge grid up/down from vertical center

    # Depth effects (the magic)
    shadow_offset: tuple[int, int] = (0, 18)
    shadow_blur: int = 22
    shadow_opacity: int = 160    # 0-255
    glow_blur: int = 30
    glow_color: tuple[int, int, int] = (120, 180, 255)  # soft blue rim light
    glow_opacity: int = 110

    # Background treatment
    scrim_opacity: int = 90      # dark overlay over bg so icons/text pop (0-255)
    vignette_strength: int = 140 # darkened corners (0 = off)

    # Text
    title: str = "ICON PACK"
    subtitle: str = "60 hand-crafted assets"
    title_size: int = 96
    subtitle_size: int = 40
    text_color: tuple[int, int, int] = (255, 255, 255)
    title_font: str = "DejaVuSans-Bold.ttf"
    subtitle_font: str = "DejaVuSans.ttf"
    title_y: int = 90            # from top
    text_shadow: bool = True


# ----------------------------------------------------------------------------
# Core helpers
# ----------------------------------------------------------------------------
def load_background(path: str | None, cfg: HeroConfig) -> Image.Image:
    """Load bg and cover-fit to canvas. If no path, make a gradient fallback."""
    if path and Path(path).exists():
        bg = Image.open(path).convert("RGB")
        bg = ImageOps.fit(bg, (cfg.width, cfg.height), Image.LANCZOS)
    else:
        bg = _gradient((cfg.width, cfg.height), (30, 30, 46), (16, 16, 28))
    return bg


def _gradient(size, top, bottom) -> Image.Image:
    w, h = size
    base = Image.new("RGB", size, top)
    top_img = Image.new("RGB", size, bottom)
    mask = Image.new("L", size)
    md = mask.load()
    for y in range(h):
        v = int(255 * (y / h))
        for x in range(w):
            md[x, y] = v
    return Image.composite(top_img, base, mask)


def apply_scrim_and_vignette(bg: Image.Image, cfg: HeroConfig) -> Image.Image:
    """Darken the bg overall + at the corners so foreground pops."""
    out = bg.copy()
    if cfg.scrim_opacity > 0:
        scrim = Image.new("RGBA", bg.size, (0, 0, 0, cfg.scrim_opacity))
        out = Image.alpha_composite(out.convert("RGBA"), scrim).convert("RGB")

    if cfg.vignette_strength > 0:
        w, h = bg.size
        mask = Image.new("L", (w, h), 0)
        d = ImageDraw.Draw(mask)
        # bright center ellipse, blurred -> dark edges
        d.ellipse([w * 0.12, h * 0.10, w * 0.88, h * 0.90], fill=255)
        mask = mask.filter(ImageFilter.GaussianBlur(min(w, h) // 6))
        dark = Image.new("RGB", (w, h), (0, 0, 0))
        # blend darkness in where mask is low
        inv = ImageOps.invert(mask).point(lambda p: p * cfg.vignette_strength // 255)
        out = Image.composite(dark, out, inv)
    return out


def prep_icon(path: str, cfg: HeroConfig) -> Image.Image:
    """Load an icon, keep transparency, fit into the icon box."""
    icon = Image.open(path).convert("RGBA")
    icon.thumbnail((cfg.icon_size, cfg.icon_size), Image.LANCZOS)
    # center it in a square canvas so grid spacing stays even
    box = Image.new("RGBA", (cfg.icon_size, cfg.icon_size), (0, 0, 0, 0))
    ox = (cfg.icon_size - icon.width) // 2
    oy = (cfg.icon_size - icon.height) // 2
    box.paste(icon, (ox, oy), icon)
    return box


def make_shadow(icon: Image.Image, cfg: HeroConfig) -> Image.Image:
    """Build a soft drop shadow from the icon's alpha."""
    alpha = icon.split()[-1]
    shadow = Image.new("RGBA", icon.size, (0, 0, 0, 0))
    solid = Image.new("RGBA", icon.size, (0, 0, 0, cfg.shadow_opacity))
    shadow.paste(solid, (0, 0), alpha)
    # pad so blur isn't clipped
    pad = cfg.shadow_blur * 2
    padded = Image.new("RGBA", (icon.width + pad * 2, icon.height + pad * 2), (0, 0, 0, 0))
    padded.paste(shadow, (pad, pad), shadow)
    return padded.filter(ImageFilter.GaussianBlur(cfg.shadow_blur))


def make_glow(icon: Image.Image, cfg: HeroConfig) -> Image.Image:
    """Colored outer glow — separates the icon from a busy background."""
    alpha = icon.split()[-1]
    r, g, b = cfg.glow_color
    glow = Image.new("RGBA", icon.size, (0, 0, 0, 0))
    solid = Image.new("RGBA", icon.size, (r, g, b, cfg.glow_opacity))
    glow.paste(solid, (0, 0), alpha)
    pad = cfg.glow_blur * 2
    padded = Image.new("RGBA", (icon.width + pad * 2, icon.height + pad * 2), (0, 0, 0, 0))
    padded.paste(glow, (pad, pad), glow)
    return padded.filter(ImageFilter.GaussianBlur(cfg.glow_blur))


def _font(name: str, size: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(name, size)
    except OSError:
        return ImageFont.load_default()


def draw_centered_text(canvas, text, y, font, color, shadow=True):
    d = ImageDraw.Draw(canvas)
    bbox = d.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x = (canvas.width - tw) // 2
    if shadow:
        d.text((x + 3, y + 4), text, font=font, fill=(0, 0, 0, 200))
    d.text((x, y), text, font=font, fill=color)


# ----------------------------------------------------------------------------
# The compositor
# ----------------------------------------------------------------------------
def build(background: str | None, icons: list[str], cfg: HeroConfig,
          out_path: str = "hero.png") -> str:
    canvas = apply_scrim_and_vignette(load_background(background, cfg), cfg)
    canvas = canvas.convert("RGBA")

    # figure out grid geometry
    n = len(icons)
    cols = min(cfg.icon_cols, n) if n else 0
    rows = (n + cols - 1) // cols if cols else 0
    cell = cfg.icon_size + cfg.icon_gap
    grid_w = cols * cfg.icon_size + (cols - 1) * cfg.icon_gap
    grid_h = rows * cfg.icon_size + (rows - 1) * cfg.icon_gap
    start_x = (cfg.width - grid_w) // 2
    start_y = (cfg.height - grid_h) // 2 + cfg.grid_v_offset

    for i, icon_path in enumerate(icons):
        icon = prep_icon(icon_path, cfg)
        col, row = i % cols, i // cols
        # center-align the last, possibly shorter, row
        icons_in_row = min(cols, n - row * cols)
        row_w = icons_in_row * cfg.icon_size + (icons_in_row - 1) * cfg.icon_gap
        row_start_x = (cfg.width - row_w) // 2
        x = row_start_x + col * cell
        y = start_y + row * cell

        # glow (bottom) -> shadow -> icon (top)
        glow = make_glow(icon, cfg)
        gpad = cfg.glow_blur * 2
        canvas.alpha_composite(glow, (x - gpad, y - gpad))

        shadow = make_shadow(icon, cfg)
        spad = cfg.shadow_blur * 2
        canvas.alpha_composite(
            shadow, (x - spad + cfg.shadow_offset[0], y - spad + cfg.shadow_offset[1])
        )
        canvas.alpha_composite(icon, (x, y))

    # text
    draw_centered_text(canvas, cfg.title, cfg.title_y,
                       _font(cfg.title_font, cfg.title_size),
                       cfg.text_color, cfg.text_shadow)
    if cfg.subtitle:
        draw_centered_text(canvas, cfg.subtitle, cfg.title_y + cfg.title_size + 20,
                           _font(cfg.subtitle_font, cfg.subtitle_size),
                           cfg.text_color, cfg.text_shadow)

    canvas.convert("RGB").save(out_path, quality=95)
    return out_path


if __name__ == "__main__":
    cfg = HeroConfig(
        title="ICON PACK",
        subtitle="60 hand-crafted assets",
    )
    # Point these at your real files:
    #   background = "backgrounds/generated_bg_01.png"
    #   icons = ["icons/a.png", "icons/b.png", ...]
    build(background=None, icons=[], cfg=cfg, out_path="hero.png")
    print("Wrote hero.png")
