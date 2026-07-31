"""
One-off: turns full-res seamless terrain textures and a status-effect icon
sheet (both from the same Drive batch as process_sprites.py) into the small
assets the game actually loads -- 32x32 tile textures and cropped 64x64
status icons.

Not part of the game runtime -- run manually if the source art changes.
"""
from PIL import Image

STAGE = 'tools/drive_batch/staged2'

TILE_SOURCES = {
    'ground': f'{STAGE}/ChatGPT Image Jul 31, 2026, 06_44_48 PM (1).png',
    'scrub': f'{STAGE}/ChatGPT Image Jul 31, 2026, 06_44_48 PM (2).png',
    'rubble': f'{STAGE}/ChatGPT Image Jul 31, 2026, 06_44_48 PM (3).png',
    'road': f'{STAGE}/ChatGPT Image Jul 31, 2026, 06_44_49 PM (4).png',
}
TILE_SIZE = 32
TILE_OUT_DIR = 'public/tiles'

# (row, col) within the 4x4 icon sheet, matching src/battle/status.js's
# poison/confuse/sleep status types.
ICON_SHEET = f'{STAGE}/ChatGPT Image Jul 31, 2026, 06_53_49 PM (1).png'
ICON_CELL = 256
ICON_PAD = 18
ICON_OUT_SIZE = 64
ICON_OUT_DIR = 'public/icons'
STATUS_ICON_CELLS = {
    'status-poison': (0, 0),
    'status-confuse': (0, 1),
    'status-sleep': (1, 3),
}


def process_tiles():
    import os
    os.makedirs(TILE_OUT_DIR, exist_ok=True)
    for name, path in TILE_SOURCES.items():
        im = Image.open(path).convert('RGB')
        out = im.resize((TILE_SIZE, TILE_SIZE), Image.LANCZOS)
        out.save(f'{TILE_OUT_DIR}/{name}.png')
        print(f'tile {name}: {out.size} -> {TILE_OUT_DIR}/{name}.png')


def process_status_icons():
    import os
    os.makedirs(ICON_OUT_DIR, exist_ok=True)
    sheet = Image.open(ICON_SHEET).convert('RGBA')
    for name, (row, col) in STATUS_ICON_CELLS.items():
        box = (
            col * ICON_CELL + ICON_PAD, row * ICON_CELL + ICON_PAD,
            (col + 1) * ICON_CELL - ICON_PAD, (row + 1) * ICON_CELL - ICON_PAD,
        )
        crop = sheet.crop(box).resize((ICON_OUT_SIZE, ICON_OUT_SIZE), Image.LANCZOS)
        crop.save(f'{ICON_OUT_DIR}/{name}.png')
        print(f'icon {name}: {crop.size} -> {ICON_OUT_DIR}/{name}.png')


if __name__ == '__main__':
    process_tiles()
    process_status_icons()
