#!/usr/bin/env python3
"""Turn listings/etsy-listings.md into ready-to-publish listing packages.

For each listing, writes listings/ready/<slug>/ containing the fields in the
order Etsy's form asks for them, so publishing is copy, paste, next:

    01-title.txt          paste into Title
    02-tags.txt           thirteen tags, comma separated
    03-description.txt    paste into Description
    04-price.txt          price and intro sale price
    05-images.txt         which image to upload in which slot
    06-checklist.md       everything else the form asks for

Also writes listings/etsy-listings.csv with every listing on one row, for
bulk reference or a spreadsheet.

The markdown file stays the single source of truth. Edit it, re-run this.

Usage:
    python3 make_listings.py
"""

from __future__ import annotations

import csv
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LISTINGS_MD = ROOT / "listings" / "etsy-listings.md"
READY_DIR = ROOT / "listings" / "ready"
COVERS = ROOT / "covers"

# Slot order matters: Etsy shows image 1 as the thumbnail, and buyers swipe
# 2 and 3 far more than the rest.
IMAGE_PLAN = [
    ("{pack}-01-cover.png", "Title card. This is the thumbnail buyers see in search."),
    ("{pack}-03-before-after.jpg", "Before/after. The single most persuasive image."),
    ("{pack}-04-before-after.jpg", "Second before/after, different subject and light."),
    ("{pack}-05-grid.jpg", "Four presets on one photo, shows the range."),
    ("{pack}-02-whats-included.png", "Contents card, lists all ten presets."),
]

MANUAL_IMAGES = [
    "A phone screenshot of the presets installed in Lightroom Mobile.",
    "A before/after on one of your own photos, so the listing is not all stock.",
    "Optional: an 'installs in 60 seconds' graphic or the import screen.",
]

CHECKLIST = """# Publishing checklist - {title_short}

## Fields
- [ ] Title: paste `01-title.txt`
- [ ] Description: paste `03-description.txt`
- [ ] Tags: paste `02-tags.txt` (13 tags, Etsy takes them comma separated)
- [ ] Price: see `04-price.txt`
- [ ] Quantity: 999 (digital, so it never sells out)

## Listing type
- [ ] Type: Digital
- [ ] Upload the download file: `{zip}`
- [ ] Confirm the file is under Etsy's 20 MB per-file limit (this one is tiny)

## Category and attributes
- [ ] Category: Craft Supplies & Tools > Digital > Photography Tools
- [ ] Digital download: instant
- [ ] Leave Occasion and Holiday blank

## Images
- [ ] Upload in the order given in `05-images.txt`
- [ ] Images 6 to 8 still need making, see the bottom of that file

## Before you hit publish
- [ ] Re-export the before/after images from Lightroom (see README). The
      ones in covers/ are rendered by an approximation, not by Adobe.
- [ ] Check the title reads well truncated, Etsy cuts it short in search
- [ ] Set the shop sale if you are using the intro price
"""


def parse_listings() -> list[dict]:
    """Pull every listing out of the markdown."""
    text = LISTINGS_MD.read_text(encoding="utf-8")
    listings = []
    # Sections look like "## 3. Moody Forest"; stop before the shop notes.
    sections = re.split(r"^## ", text, flags=re.M)[1:]
    for section in sections:
        heading = section.splitlines()[0].strip()
        if not re.match(r"^\d+\.", heading):
            continue
        name = re.sub(r"^\d+\.\s*", "", heading)

        title = _after_marker(section, "**Title**")
        price_line = _line_starting(section, "**Price:**")
        tags_line = _line_starting(section, "**Tags:**")
        body = re.search(r"```\n(.*?)\n```", section, flags=re.S)
        if not (title and tags_line and body):
            continue

        listings.append(
            {
                "name": name,
                "slug": _slug(name),
                "title": title,
                "price": price_line.replace("**Price:**", "").strip(),
                "tags": [t.strip() for t in tags_line.split("**Tags:**")[1].split(",") if t.strip()],
                "description": body.group(1),
            }
        )
    return listings


def _after_marker(section: str, marker: str) -> str:
    lines = section.splitlines()
    for index, line in enumerate(lines):
        if line.strip() == marker:
            for candidate in lines[index + 1 :]:
                if candidate.strip():
                    return candidate.strip()
    return ""


def _line_starting(section: str, prefix: str) -> str:
    for line in section.splitlines():
        if line.startswith(prefix):
            return line
    return ""


def _slug(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return "bundle" if slug.startswith("the-full-bundle") else slug


def pack_for(slug: str) -> dict | None:
    path = ROOT / "packs" / f"{slug}.json"
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return None


def image_lines(slug: str, pack: dict | None) -> list[str]:
    lines = ["Upload these in this order. Slot 1 is the search thumbnail.", ""]
    if pack is None:
        lines += [
            "  1. covers/bundle-01-cover.png",
            "     Bundle title card.",
            "",
            "  2-7. One before/after from each pack, your pick. Lead with the",
            "       strongest two, usually Portrait Natural and Golden Hour.",
            "",
        ]
    else:
        for index, (pattern, why) in enumerate(IMAGE_PLAN, start=1):
            filename = pattern.format(pack=slug)
            exists = (COVERS / filename).exists()
            mark = "" if exists else "   [MISSING - run make_before_after.py]"
            lines.append(f"  {index}. covers/{filename}{mark}")
            lines.append(f"     {why}")
            lines.append("")
    lines.append("Still to make yourself:")
    for item in MANUAL_IMAGES:
        lines.append(f"  - {item}")
    lines.append("")
    lines.append("Etsy allows 10 images. Square, 2000x2000 or larger.")
    return lines


def main() -> int:
    listings = parse_listings()
    if not listings:
        print("No listings parsed. Has etsy-listings.md changed shape?")
        return 1

    if READY_DIR.exists():
        shutil.rmtree(READY_DIR)
    READY_DIR.mkdir(parents=True)

    rows = []
    for listing in listings:
        slug = listing["slug"]
        pack = pack_for(slug)
        folder = READY_DIR / slug
        folder.mkdir()

        zip_name = (
            f"{pack['name']} Lightroom Presets.zip"
            if pack
            else "SoftSmith Lightroom Preset Bundle.zip"
        )

        (folder / "01-title.txt").write_text(listing["title"] + "\n", encoding="utf-8")
        (folder / "02-tags.txt").write_text(", ".join(listing["tags"]) + "\n", encoding="utf-8")
        (folder / "03-description.txt").write_text(listing["description"] + "\n", encoding="utf-8")
        (folder / "04-price.txt").write_text(listing["price"] + "\n", encoding="utf-8")
        (folder / "05-images.txt").write_text("\n".join(image_lines(slug, pack)) + "\n", encoding="utf-8")
        (folder / "06-checklist.md").write_text(
            CHECKLIST.format(title_short=listing["name"], zip=f"dist/zips/{zip_name}"),
            encoding="utf-8",
        )

        rows.append(
            {
                "listing": listing["name"],
                "title": listing["title"],
                "title_length": len(listing["title"]),
                "price": listing["price"],
                "tags": ", ".join(listing["tags"]),
                "tag_count": len(listing["tags"]),
                "download_file": f"dist/zips/{zip_name}",
                "description": listing["description"],
            }
        )
        print(f"  listings/ready/{slug}/")

    csv_path = ROOT / "listings" / "etsy-listings.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    print(f"  listings/etsy-listings.csv ({len(rows)} listings)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
