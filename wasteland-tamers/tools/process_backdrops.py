"""
One-off: resizes the full-res town backdrop paintings from Drive down to a
web-friendly size for use as TownScene location backgrounds.

Not part of the game runtime -- run manually whenever a new backdrop batch
comes in.
"""
from PIL import Image

SOURCES = {
    'infirmary': 'tools/drive_batch/staged/ChatGPT Image Jul 31, 2026, 07_10_43 PM (1).png',
    'creature-market': 'tools/drive_batch/staged/ChatGPT Image Jul 31, 2026, 07_10_44 PM (2).png',
    'town-square': 'tools/drive_batch/staged/ChatGPT Image Jul 31, 2026, 07_10_44 PM (3).png',
    'forge': 'tools/drive_batch/staged/ChatGPT Image Jul 31, 2026, 07_10_44 PM (4).png',
    'general-store': 'tools/drive_batch/staged/ChatGPT Image Jul 31, 2026, 07_10_44 PM (5).png',
}

OUT_DIR = 'public/backgrounds'
TARGET_WIDTH = 960


def process_one(name, path):
    import os
    os.makedirs(OUT_DIR, exist_ok=True)
    im = Image.open(path).convert('RGB')
    scale = TARGET_WIDTH / im.width
    out = im.resize((TARGET_WIDTH, round(im.height * scale)), Image.LANCZOS)
    out.save(f'{OUT_DIR}/{name}.png')
    print(f'{name}: {out.size} -> {OUT_DIR}/{name}.png')


if __name__ == '__main__':
    for name, path in SOURCES.items():
        process_one(name, path)
