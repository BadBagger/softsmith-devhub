#!/usr/bin/env python3
"""Render Etsy listing images for each preset pack.

Produces, per pack, into covers/:
    <pack-id>-01-cover.png           2000x2000 title card
    <pack-id>-02-whats-included.png  2000x2000 contents card
and one cover for the full bundle.

These are the *graphic* listing images. Etsy listings also need real
before/after photos, which no script can invent. See listings/etsy-listings.md
for what to shoot.

Requires Pillow:   python3 -m pip install pillow
Usage:             python3 make_covers.py
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
PACKS_DIR = ROOT / "packs"
COVERS_DIR = ROOT / "covers"

SIZE = 2000

# Font families are looked up in order. The first path that exists wins, so the
# same script works on Linux and on a Windows machine with Office fonts.
FONT_CANDIDATES = {
    "display": [
        "/mnt/skills/examples/canvas-design/canvas-fonts/Italiana-Regular.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf",
        "C:/Windows/Fonts/georgia.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
    ],
    "serif": [
        "/mnt/skills/examples/canvas-design/canvas-fonts/LibreBaskerville-Regular.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf",
        "C:/Windows/Fonts/georgia.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
    ],
    "sans": [
        "/mnt/skills/examples/canvas-design/canvas-fonts/InstrumentSans-Regular.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ],
}


def load_font(family: str, size: int) -> ImageFont.FreeTypeFont:
    for candidate in FONT_CANDIDATES[family]:
        path = Path(candidate)
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default(size)


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def vertical_gradient(top: str, bottom: str) -> Image.Image:
    """Gradient plus a soft corner falloff, so the card has some depth."""
    top_rgb, bottom_rgb = hex_to_rgb(top), hex_to_rgb(bottom)
    base = Image.new("RGB", (1, SIZE))
    pixels = base.load()
    for y in range(SIZE):
        ratio = y / (SIZE - 1)
        pixels[0, y] = tuple(
            round(top_rgb[c] + (bottom_rgb[c] - top_rgb[c]) * ratio) for c in range(3)
        )
    image = base.resize((SIZE, SIZE))

    vignette = Image.new("L", (SIZE, SIZE), 0)
    ImageDraw.Draw(vignette).ellipse(
        (-SIZE * 0.35, -SIZE * 0.35, SIZE * 1.35, SIZE * 1.35), fill=110
    )
    shadow = Image.new("RGB", (SIZE, SIZE), (0, 0, 0))
    return Image.composite(image, Image.blend(image, shadow, 0.35), vignette)


def tracked_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    font: ImageFont.FreeTypeFont,
    y: int,
    fill,
    tracking: int = 0,
    center_x: int = SIZE // 2,
) -> None:
    """Draw horizontally centred text with optional letter spacing."""
    widths = [draw.textlength(ch, font=font) for ch in text]
    total = sum(widths) + tracking * max(len(text) - 1, 0)
    x = center_x - total / 2
    for ch, width in zip(text, widths):
        draw.text((x, y), ch, font=font, fill=fill)
        x += width + tracking


def wrap(draw, text: str, font, max_width: int) -> list[str]:
    words, lines, line = text.split(), [], ""
    for word in words:
        trial = f"{line} {word}".strip()
        if draw.textlength(trial, font=font) <= max_width or not line:
            line = trial
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def draw_frame(draw: ImageDraw.ImageDraw, text_rgb: tuple[int, int, int]) -> None:
    inset = 90
    draw.rectangle((inset, inset, SIZE - inset, SIZE - inset), outline=text_rgb + (70,), width=3)


def swatch_row(draw: ImageDraw.ImageDraw, palette: list[str], y: int) -> None:
    count = len(palette)
    diameter, gap = 132, 40
    total = count * diameter + (count - 1) * gap
    x = (SIZE - total) / 2
    for colour in palette:
        draw.ellipse((x, y, x + diameter, y + diameter), fill=hex_to_rgb(colour))
        x += diameter + gap


def cover_card(pack: dict) -> Image.Image:
    cover = pack["cover"]
    text_rgb = hex_to_rgb(cover["text"])
    image = vertical_gradient(cover["from"], cover["to"]).convert("RGBA")
    draw = ImageDraw.Draw(image, "RGBA")
    draw_frame(draw, text_rgb)

    tracked_text(
        draw, pack.get("brand", "").upper(), load_font("sans", 40), 230, text_rgb + (215,), 18
    )

    name = pack["name"].upper()
    display = load_font("display", 250 if len(name) <= 14 else 185)
    tracked_text(draw, name, display, 560, text_rgb, 10)

    draw.line((SIZE / 2 - 130, 900, SIZE / 2 + 130, 900), fill=text_rgb + (150,), width=3)

    serif = load_font("serif", 54)
    y = 990
    for line in wrap(draw, pack["tagline"], serif, 1320):
        tracked_text(draw, line, serif, y, text_rgb + (225,), 1)
        y += 82

    swatch_row(draw, cover["palette"], 1340)

    sans = load_font("sans", 46)
    tracked_text(
        draw,
        f"{len(pack['presets'])} LIGHTROOM PRESETS",
        sans,
        1600,
        text_rgb,
        14,
    )
    tracked_text(
        draw,
        "MOBILE  +  DESKTOP  ·  INSTANT DOWNLOAD",
        load_font("sans", 36),
        1690,
        text_rgb + (190,),
        10,
    )
    return image.convert("RGB")


def contents_card(pack: dict) -> Image.Image:
    cover = pack["cover"]
    text_rgb = hex_to_rgb(cover["text"])
    image = vertical_gradient(cover["to"], cover["from"]).convert("RGBA")
    draw = ImageDraw.Draw(image, "RGBA")
    draw_frame(draw, text_rgb)

    tracked_text(draw, "WHAT YOU GET", load_font("sans", 44), 210, text_rgb + (215,), 18)
    tracked_text(draw, pack["name"].upper(), load_font("display", 140), 300, text_rgb, 8)
    draw.line((SIZE / 2 - 130, 520, SIZE / 2 + 130, 520), fill=text_rgb + (150,), width=3)

    serif = load_font("serif", 50)
    y = 610
    for index, preset in enumerate(pack["presets"], start=1):
        # "Coastal Air 02 Turquoise Water" -> "Turquoise Water"; the number is
        # drawn separately in the left column.
        label = preset["name"].replace(pack["name"], "").strip()
        label = label.lstrip("0123456789").strip()
        draw.text((330, y), f"{index:02d}", font=load_font("sans", 40), fill=text_rgb + (150,))
        draw.text((450, y - 6), label, font=serif, fill=text_rgb)
        y += 96

    tracked_text(
        draw,
        "WORKS WITH LIGHTROOM MOBILE, DESKTOP AND CLASSIC",
        load_font("sans", 34),
        1700,
        text_rgb + (200,),
        8,
    )
    tracked_text(
        draw, "RAW  +  JPEG  ·  ONE TAP INSTALL", load_font("sans", 34), 1770, text_rgb + (200,), 8
    )
    return image.convert("RGB")


def bundle_card(packs: list[dict]) -> Image.Image:
    image = vertical_gradient("#14110F", "#6B5B4A").convert("RGBA")
    draw = ImageDraw.Draw(image, "RGBA")
    text_rgb = (250, 245, 238)
    draw_frame(draw, text_rgb)

    total = sum(len(p["presets"]) for p in packs)
    tracked_text(draw, "SOFTSMITH PRESETS", load_font("sans", 40), 230, text_rgb + (215,), 18)
    tracked_text(draw, "THE FULL", load_font("display", 150), 480, text_rgb, 10)
    tracked_text(draw, "BUNDLE", load_font("display", 260), 640, text_rgb, 10)
    draw.line((SIZE / 2 - 130, 1000, SIZE / 2 + 130, 1000), fill=text_rgb + (150,), width=3)

    serif = load_font("serif", 56)
    y = 1080
    for pack in packs:
        tracked_text(draw, pack["name"], serif, y, text_rgb + (230,), 2)
        y += 90

    tracked_text(
        draw, f"{total} PRESETS  ·  {len(packs)} PACKS", load_font("sans", 48), 1640, text_rgb, 14
    )
    tracked_text(
        draw,
        "MOBILE  +  DESKTOP  ·  INSTANT DOWNLOAD",
        load_font("sans", 36),
        1730,
        text_rgb + (190,),
        10,
    )
    return image.convert("RGB")


def main() -> int:
    COVERS_DIR.mkdir(parents=True, exist_ok=True)
    packs = [json.loads(p.read_text(encoding="utf-8")) for p in sorted(PACKS_DIR.glob("*.json"))]

    for pack in packs:
        for suffix, image in (
            ("01-cover", cover_card(pack)),
            ("02-whats-included", contents_card(pack)),
        ):
            out = COVERS_DIR / f"{pack['id']}-{suffix}.png"
            image.save(out, "PNG", optimize=True)
            print(f"  {out.relative_to(ROOT)}")

    bundle_out = COVERS_DIR / "bundle-01-cover.png"
    bundle_card(packs).save(bundle_out, "PNG", optimize=True)
    print(f"  {bundle_out.relative_to(ROOT)}")
    print(f"Done. {len(packs) * 2 + 1} listing images in {COVERS_DIR.relative_to(ROOT)}/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
