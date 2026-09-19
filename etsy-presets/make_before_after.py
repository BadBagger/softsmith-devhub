#!/usr/bin/env python3
"""Build before/after listing images for each preset pack.

Downloads a set of freely licensed photos once into sources/, then renders
each pack onto them and composes:

    covers/<pack-id>-03-before-after.jpg   split frame, before | after
    covers/<pack-id>-04-before-after.jpg   a second photo and preset
    covers/<pack-id>-05-grid.jpg           four presets on one photo

The "after" frames come from render_preview.py, which approximates Camera
Raw rather than being Adobe's renderer. Treat these as previews. Before
publishing, re-export the same sources/ files through Lightroom so the
listing shows exactly what a buyer's copy produces.

Photo sources and licence notes are written to sources/CREDITS.md.

Usage:
    python3 make_before_after.py            # fetch if needed, then build
    python3 make_before_after.py --fetch-only
"""

from __future__ import annotations

import argparse
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw

import render_preview as rp
from make_covers import load_font

ROOT = Path(__file__).resolve().parent
SOURCES_DIR = ROOT / "sources"
COVERS_DIR = ROOT / "covers"
SIZE = 2000

# Unsplash photos, used under the Unsplash Licence, which permits commercial
# use. Subjects were chosen with no identifiable people in frame, so no model
# release is needed for use in a product listing.
SOURCES = {
    "beach-sunset": ("1507525428034-b723cf961d3e", "Turquoise beach at sunset"),
    "mountain-clouds": ("1506905925346-21bda4d32df4", "Mountain peaks above cloud"),
    "lake-sunrise": ("1493246507139-91e8fad9978e", "Turquoise mountain lake at sunrise"),
    "green-hills": ("1470071459604-3b5ec3a7fe05", "Green hills with breaking sun"),
    "forest-path": ("1441974231531-c6227db76b6e", "Sunlit forest path"),
    "forest-bridge": ("1447752875215-b2761acb3c5d", "Boardwalk through dense forest"),
    "foggy-pines": ("1509316975850-ff9c5deb0cd9", "Fog over a pine forest"),
    "lake-dock": ("1439066615861-d1af74d74000", "Wooden dock on a still lake"),
    "desert-road": ("1500530855697-b586d89ba3ee", "Empty road through red rock"),
    "palms-sky": ("1454391304352-2bf4678b1a7a", "Palm trees seen from below"),
    "city-tower": ("1511739001486-6bfe10ce785f", "City skyline with tower"),
    "lone-tree": ("1502082553048-f009c37129b9", "Lone broad tree in a field"),
    # Portraits. See the note in CREDITS.md about model releases.
    "portrait-studio-man": ("1507003211169-0a1dd7228f2d", "Man, studio light, medium skin tone"),
    "portrait-warm-field": ("1544005313-94ddf0286df2", "Woman outdoors in warm late light"),
    "portrait-freckles": ("1489424731084-a5d8b219a5bb", "Woman with freckles, fair skin tone"),
    "portrait-sunflare": ("1524250502761-1ac6f2e30d43", "Woman backlit with sun flare"),
    "portrait-cool-studio": ("1534528741775-53994a69daeb", "Woman, cool studio light"),
    "portrait-rooftop": ("1521119989659-a83eee488004", "Man on a rooftop, deep skin tone"),
    "portrait-denim": ("1488426862026-3ee34a7d66df", "Woman in denim on a pink backdrop"),
    "portrait-curly": ("1519345182560-3f2917c472ef", "Man with curly hair, deep skin tone"),
}

# Which photo and preset to showcase per pack. Preset numbers are 1-based and
# match the filenames in dist/<pack>/<Pack> Presets/.
PAIRINGS = {
    "golden-hour": {
        "split": [("beach-sunset", 1), ("portrait-sunflare", 4)],
        "grid": ("lake-sunrise", [1, 3, 7, 10]),
    },
    "coastal-air": {
        "split": [("lake-dock", 1), ("portrait-cool-studio", 5)],
        "grid": ("beach-sunset", [1, 3, 8, 10]),
    },
    "moody-forest": {
        "split": [("forest-path", 1), ("portrait-rooftop", 6)],
        "grid": ("forest-bridge", [1, 2, 5, 6]),
    },
    "vintage-film-35": {
        "split": [("desert-road", 1), ("portrait-denim", 3)],
        "grid": ("green-hills", [1, 5, 6, 10]),
    },
    "mono-editorial": {
        "split": [("forest-bridge", 1), ("portrait-curly", 2)],
        "grid": ("desert-road", [2, 3, 6, 9]),
    },
    "portrait-natural": {
        "split": [("portrait-studio-man", 1), ("portrait-warm-field", 2)],
        "grid": ("portrait-freckles", [1, 2, 5, 10]),
    },
}


def fetch_sources(width: int = 2400) -> None:
    SOURCES_DIR.mkdir(parents=True, exist_ok=True)
    for key, (cdn_id, _) in SOURCES.items():
        target = SOURCES_DIR / f"{key}.jpg"
        if target.exists():
            continue
        url = f"https://images.unsplash.com/photo-{cdn_id}?w={width}&q=80&fm=jpg"
        print(f"  fetching {key}")
        request = urllib.request.Request(url, headers={"User-Agent": "preset-kit/1.0"})
        with urllib.request.urlopen(request, timeout=60) as response:
            target.write_bytes(response.read())
    write_credits()


def write_credits() -> None:
    lines = [
        "# Photo sources",
        "",
        "Photos used to build the before/after listing images.",
        "",
        "All are from Unsplash and used under the Unsplash Licence, which",
        "permits commercial use and does not require attribution.",
        "",
        "The source URL of each file is recorded below as provenance. These",
        "are not photographer credits: the CDN URL does not carry a name. If",
        "you want to credit the photographers, look each photo up on Unsplash",
        "and add their names here.",
        "",
        "MODEL RELEASES - READ THIS",
        "",
        "This set includes portraits of identifiable people. The Unsplash",
        "Licence permits commercial use, but it does NOT grant a model",
        "release, and it does not cover uses that imply the person endorses",
        "a product. Using these portraits in a shop listing is common and",
        "generally tolerated, but it is a risk you are choosing to take.",
        "",
        "Lower-risk options, worth moving to once the shop earns:",
        "  - portraits you shot yourself, with a signed model release",
        "  - paid stock (Adobe Stock, Shutterstock) where a model release",
        "    is included in the licence, often for a few dollars an image",
        "",
        "The landscape photos here contain no identifiable people and do",
        "not carry this caveat.",
        "",
        "Verify the licence on the source page before publishing if you are",
        "at all unsure. Licences can change; these were correct when fetched.",
        "",
        "| File | Subject | Source |",
        "| --- | --- | --- |",
    ]
    for key, (cdn_id, subject) in SOURCES.items():
        url = f"https://images.unsplash.com/photo-{cdn_id}"
        lines.append(f"| `{key}.jpg` | {subject} | {url} |")
    lines.append("")
    (SOURCES_DIR / "CREDITS.md").write_text("\n".join(lines), encoding="utf-8")


def square(image: Image.Image, size: int = SIZE) -> Image.Image:
    """Centre crop to a square, then resize."""
    w, h = image.size
    side = min(w, h)
    box = ((w - side) // 2, (h - side) // 2)
    cropped = image.crop((box[0], box[1], box[0] + side, box[1] + side))
    return cropped.resize((size, size), Image.LANCZOS)


def strip_pack_prefix(preset_name: str, pack_name: str) -> str:
    """"Vintage Film 01 Faded 400" -> "Faded 400".

    Matches word by word rather than by exact pack name, because a pack like
    "Vintage Film 35" does not appear verbatim in its own preset names.
    """
    words = preset_name.split()
    pack_words = [w.lower() for w in pack_name.split()]
    while words and words[0].lower() in pack_words:
        words.pop(0)
    while words and words[0].isdigit():
        words.pop(0)
    return " ".join(words) or preset_name


def fit(image: Image.Image, width: int, height: int) -> Image.Image:
    """Centre crop to the given aspect, then resize to exactly width x height."""
    w, h = image.size
    scale = max(width / w, height / h)
    new = image.resize((max(round(w * scale), width), max(round(h * scale), height)), Image.LANCZOS)
    left, top = (new.width - width) // 2, (new.height - height) // 2
    return new.crop((left, top, left + width, top + height))


def preset_path(pack_id: str, number: int) -> Path:
    folder = next((ROOT / "dist" / pack_id).glob("* Presets"))
    matches = sorted(folder.glob(f"{number:02d} *.xmp"))
    if not matches:
        raise FileNotFoundError(f"preset {number} not found in {folder}")
    return matches[0]


BAR_HEIGHT = 150


def label_bar(draw: ImageDraw.ImageDraw, text: str, sub: str) -> None:
    """Caption strip along the bottom of a listing image."""
    height = BAR_HEIGHT
    draw.rectangle((0, SIZE - height, SIZE, SIZE), fill=(12, 12, 12))
    font = load_font("sans", 46)
    small = load_font("sans", 34)
    draw.text((70, SIZE - height + 34), text, font=font, fill=(250, 250, 250))
    width = draw.textlength(sub, font=small)
    draw.text((SIZE - 70 - width, SIZE - height + 44), sub, font=small, fill=(180, 180, 180))


def tag(draw: ImageDraw.ImageDraw, text: str, xy: tuple[int, int], anchor_right=False) -> None:
    font = load_font("sans", 40)
    pad = 22
    width = draw.textlength(text, font=font)
    x, y = xy
    if anchor_right:
        x -= width + pad * 2
    draw.rectangle((x, y, x + width + pad * 2, y + 78), fill=(0, 0, 0, 200))
    draw.text((x + pad, y + 18), text, font=font, fill=(255, 255, 255))


def side_by_side_image(source: Path, preset: Path, pack_name: str) -> Image.Image:
    """Two complete frames, before and after.

    Used for portraits. The split-down-the-middle layout works on a
    landscape, but bisecting someone's face is unsettling to look at and
    makes a bad listing image.
    """
    before = Image.open(source).convert("RGB")
    after = rp.render(source, preset)

    margin, gutter = 24, 20
    area_h = SIZE - BAR_HEIGHT - margin * 2
    frame_w = (SIZE - margin * 2 - gutter) // 2
    frame_h = min(area_h, round(frame_w * before.height / before.width))

    canvas = Image.new("RGB", (SIZE, SIZE), (12, 12, 12))
    top = margin + (area_h - frame_h) // 2
    for index, image in enumerate((before, after)):
        canvas.paste(fit(image, frame_w, frame_h), (margin + index * (frame_w + gutter), top))

    draw = ImageDraw.Draw(canvas, "RGBA")
    tag(draw, "BEFORE", (margin + 28, top + 28))
    tag(draw, "AFTER", (margin + frame_w + gutter + frame_w - 28, top + 28), anchor_right=True)
    label_bar(draw, pack_name, preset.stem[3:])
    return canvas


def split_image(source: Path, preset: Path, pack_name: str) -> Image.Image:
    before = square(Image.open(source).convert("RGB"))
    after = square(rp.render(source, preset))

    canvas = Image.new("RGB", (SIZE, SIZE))
    canvas.paste(before.crop((0, 0, SIZE // 2, SIZE)), (0, 0))
    canvas.paste(after.crop((SIZE // 2, 0, SIZE, SIZE)), (SIZE // 2, 0))

    draw = ImageDraw.Draw(canvas, "RGBA")
    draw.rectangle((SIZE // 2 - 3, 0, SIZE // 2 + 3, SIZE), fill=(255, 255, 255))
    tag(draw, "BEFORE", (70, 70))
    tag(draw, "AFTER", (SIZE - 70, 70), anchor_right=True)
    label_bar(draw, pack_name, preset.stem[3:])
    return canvas


def grid_image(source: Path, pack_id: str, pack_name: str, numbers: list[int]) -> Image.Image:
    canvas = Image.new("RGB", (SIZE, SIZE), (12, 12, 12))
    draw = ImageDraw.Draw(canvas, "RGBA")
    # Reserve the caption bar's height, or the bottom row's tile labels end up
    # underneath it.
    # Tiles are slightly landscape so two rows plus the caption bar fill the
    # square frame exactly, with no dead margin.
    cell_w = (SIZE - 6) // 2
    cell_h = (SIZE - BAR_HEIGHT - 6) // 2
    for index, number in enumerate(numbers[:4]):
        preset = preset_path(pack_id, number)
        tile = fit(rp.render(source, preset), cell_w, cell_h)
        x = (index % 2) * (cell_w + 6)
        y = (index // 2) * (cell_h + 6)
        canvas.paste(tile, (x, y))
        name = strip_pack_prefix(preset.stem[3:], pack_name)
        font = load_font("sans", 34)
        width = draw.textlength(name, font=font)
        draw.rectangle((x + 24, y + cell_h - 86, x + 24 + width + 36, y + cell_h - 24), fill=(0, 0, 0, 190))
        draw.text((x + 42, y + cell_h - 74), name, font=font, fill=(255, 255, 255))
    label_bar(draw, pack_name, f"{len(numbers)} of 10 presets")
    return canvas


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--fetch-only", action="store_true")
    args = parser.parse_args()

    print("Sources:")
    fetch_sources()
    if args.fetch_only:
        return 0

    import json

    COVERS_DIR.mkdir(parents=True, exist_ok=True)
    print("Listing images:")
    for pack_id, plan in PAIRINGS.items():
        pack = json.loads((ROOT / "packs" / f"{pack_id}.json").read_text(encoding="utf-8"))
        name = pack["name"]
        for offset, (source_key, number) in enumerate(plan["split"]):
            # Portraits get two whole frames; landscapes get the split frame.
            compose = side_by_side_image if source_key.startswith("portrait-") else split_image
            image = compose(SOURCES_DIR / f"{source_key}.jpg", preset_path(pack_id, number), name)
            out = COVERS_DIR / f"{pack_id}-{3 + offset:02d}-before-after.jpg"
            image.save(out, "JPEG", quality=92, subsampling=0, optimize=True)
            print(f"  {out.relative_to(ROOT)}")
        source_key, numbers = plan["grid"]
        out = COVERS_DIR / f"{pack_id}-05-grid.jpg"
        grid_image(SOURCES_DIR / f"{source_key}.jpg", pack_id, name, numbers).save(
            out, "JPEG", quality=92, subsampling=0, optimize=True
        )
        print(f"  {out.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
