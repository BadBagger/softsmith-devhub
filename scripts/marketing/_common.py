"""Shared low-level imaging helpers used by the marketing compositor scripts.

Nothing here is theme-specific: no fixed colors, fonts, or decorative motifs.
Each helper takes plain parameters (size, blur, opacity, color, ...) so both
hero_compositor.py and listing_compositor.py can reuse them for whatever
theme a given icon pack needs.
"""

from __future__ import annotations
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


def gradient(size: tuple[int, int], top: tuple[int, int, int],
             bottom: tuple[int, int, int]) -> Image.Image:
    """A vertical two-color gradient, used as a fallback when no background is given."""
    w, h = size
    base = Image.new("RGB", size, top)
    bottom_img = Image.new("RGB", size, bottom)
    mask = Image.new("L", size)
    md = mask.load()
    for y in range(h):
        v = int(255 * (y / h))
        for x in range(w):
            md[x, y] = v
    return Image.composite(bottom_img, base, mask)


def load_cover_image(path: str | None, size: tuple[int, int],
                      fallback: Image.Image | None = None) -> Image.Image:
    """Load an image and cover-fit it to `size`. Falls back to a flat gradient."""
    if path and Path(path).exists():
        img = Image.open(path).convert("RGB")
        return ImageOps.fit(img, size, Image.LANCZOS)
    if fallback is not None:
        return ImageOps.fit(fallback, size, Image.LANCZOS)
    return gradient(size, (30, 30, 46), (16, 16, 28))


def square_icon(path: str, size: int) -> Image.Image:
    """Load an icon, keep transparency, center it in a `size`x`size` box."""
    icon = Image.open(path).convert("RGBA")
    icon.thumbnail((size, size), Image.LANCZOS)
    box = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ox = (size - icon.width) // 2
    oy = (size - icon.height) // 2
    box.paste(icon, (ox, oy), icon)
    return box


def drop_shadow(icon: Image.Image, blur: int, opacity: int,
                 color: tuple[int, int, int] = (0, 0, 0)) -> Image.Image:
    """Soft drop shadow built from `icon`'s alpha channel. Returns a padded RGBA."""
    alpha = icon.split()[-1]
    r, g, b = color
    shadow = Image.new("RGBA", icon.size, (0, 0, 0, 0))
    solid = Image.new("RGBA", icon.size, (r, g, b, opacity))
    shadow.paste(solid, (0, 0), alpha)
    pad = blur * 2
    padded = Image.new("RGBA", (icon.width + pad * 2, icon.height + pad * 2), (0, 0, 0, 0))
    padded.paste(shadow, (pad, pad), shadow)
    return padded.filter(ImageFilter.GaussianBlur(blur))


def outer_glow(icon: Image.Image, blur: int, opacity: int,
               color: tuple[int, int, int]) -> Image.Image:
    """Colored outer glow built from `icon`'s alpha channel. Returns a padded RGBA."""
    alpha = icon.split()[-1]
    r, g, b = color
    glow = Image.new("RGBA", icon.size, (0, 0, 0, 0))
    solid = Image.new("RGBA", icon.size, (r, g, b, opacity))
    glow.paste(solid, (0, 0), alpha)
    pad = blur * 2
    padded = Image.new("RGBA", (icon.width + pad * 2, icon.height + pad * 2), (0, 0, 0, 0))
    padded.paste(glow, (pad, pad), glow)
    return padded.filter(ImageFilter.GaussianBlur(blur))


def load_font(name: str, size: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(name, size)
    except OSError:
        return ImageFont.load_default()


def centered_text(canvas: Image.Image, text: str, y: int, font: ImageFont.FreeTypeFont,
                   color: tuple[int, int, int], shadow: bool = True) -> None:
    """Draw `text` horizontally centered on `canvas` at height `y`."""
    d = ImageDraw.Draw(canvas)
    bbox = d.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x = (canvas.width - tw) // 2
    if shadow:
        d.text((x + 3, y + 4), text, font=font, fill=(0, 0, 0, 200))
    d.text((x, y), text, font=font, fill=color)


def tracked_text(canvas: Image.Image, text: str, center_x: int, y: int,
                  font: ImageFont.FreeTypeFont, color: tuple[int, int, int],
                  tracking: int = 0) -> int:
    """Draw letter-spaced text centered horizontally at `center_x`. Returns total width."""
    d = ImageDraw.Draw(canvas)
    widths = [d.textbbox((0, 0), ch, font=font)[2] for ch in text]
    total = sum(widths) + tracking * max(0, len(text) - 1)
    x = center_x - total // 2
    for ch, w in zip(text, widths):
        d.text((x, y), ch, font=font, fill=color)
        x += w + tracking
    return total


def rounded_rect(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], radius: int,
                  fill=None, outline=None, width: int = 1) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def paste_cover(dest: Image.Image, source: str | Image.Image,
                 box: tuple[int, int, int, int], radius: int = 0) -> None:
    """Cover-fit `source` into `box` on `dest`, optionally with rounded corners."""
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    if w <= 0 or h <= 0:
        return
    img = Image.open(source).convert("RGB") if isinstance(source, str) else source.convert("RGB")
    fitted = ImageOps.fit(img, (w, h), Image.LANCZOS)
    if radius > 0:
        mask = Image.new("L", (w, h), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, w, h], radius=radius, fill=255)
        dest.paste(fitted, (x0, y0), mask)
    else:
        dest.paste(fitted, (x0, y0))
