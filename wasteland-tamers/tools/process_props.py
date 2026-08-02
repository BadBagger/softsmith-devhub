"""
One-off: crops individual prop/item icons out of banked reference sheets
for use in the battle Item picker and as TownMapScene scenery.

Two source styles, handled differently:
- props2-*.png: magenta chroma-key sheets (same convention as creature
  art) -- grid-sliced, chroma-keyed, and tight-cropped automatically.
- props-*.png: photographic/painterly sheets with a blurred (non-key)
  background -- cropped with fixed pixel boxes found by inspection.

Not part of the game runtime -- run manually if the source art changes.
"""
import sys
sys.path.insert(0, 'tools')
from process_sprites import chroma_key, tight_bbox
import numpy as np
from PIL import Image

OUT_DIR = 'public/props'

# name -> (sheet path, cols, rows, row, col)
GRID_CROPS = {
    'icon-lure': ('tools/drive_batch/staged/props2-items2.png', 4, 3, 0, 1),      # bear trap
    'icon-stim': ('tools/drive_batch/staged/props2-items2.png', 4, 3, 0, 3),      # first-aid kit
    'icon-antidote': ('tools/drive_batch/staged/props2-items2.png', 4, 3, 1, 0),  # green vial

    'prop-shack': ('tools/drive_batch/staged/props2-structures.png', 4, 3, 0, 0),
    'prop-tent2': ('tools/drive_batch/staged/props2-structures.png', 4, 3, 2, 0),

    'prop-crate': ('tools/drive_batch/staged/props2-items1.png', 4, 3, 0, 0),
    'prop-barrel': ('tools/drive_batch/staged/props2-items1.png', 4, 3, 0, 2),

    'prop-tree': ('tools/drive_batch/staged/props2-terrain.png', 4, 3, 0, 0),
    'prop-scrap': ('tools/drive_batch/staged/props2-terrain.png', 4, 3, 2, 0),
    'prop-boulder': ('tools/drive_batch/staged/props2-terrain.png', 4, 3, 2, 1),
}

# name -> (sheet path, pixel box) -- blurred-background sheets, fixed boxes
FIXED_CROPS = {
    'prop-sign': ('tools/drive_batch/staged/props-decor.png', (970, 0, 1536, 290)),
    'prop-lamp': ('tools/drive_batch/staged/props-decor.png', (0, 260, 270, 800)),
}

# name -> (sheet path, pixel box) -- chroma-key sheets, but the structure
# is too wide/tall for a single naive grid cell (a plain grid slice clips
# it), so these use a hand-picked box instead.
CUSTOM_CHROMA_CROPS = {
    'prop-tower': ('tools/drive_batch/staged/props2-structures.png', (280, 330, 800, 1000)),
    'prop-gate': ('tools/drive_batch/staged/props2-structures.png', (700, 330, 1448, 800)),
}

_sheet_cache = {}


def get_chroma_sheet(path):
    if path not in _sheet_cache:
        im = Image.open(path).convert('RGB')
        _sheet_cache[path] = chroma_key(np.array(im))
    return _sheet_cache[path]


def process_grid():
    import os
    os.makedirs(OUT_DIR, exist_ok=True)
    for name, (path, cols, rows, row, col) in GRID_CROPS.items():
        rgba = get_chroma_sheet(path)
        h, w = rgba.shape[:2]
        cw, ch = w / cols, h / rows
        cell = rgba[int(row * ch):int((row + 1) * ch), int(col * cw):int((col + 1) * cw)]
        bbox = tight_bbox(cell[:, :, 3])
        if bbox is None:
            print(f'  !! no content found for {name}', file=sys.stderr)
            continue
        x0, y0, x1, y1 = bbox
        crop = cell[y0:y1, x0:x1]
        out_path = f'{OUT_DIR}/{name}.png'
        Image.fromarray(crop, 'RGBA').save(out_path)
        print(f'{name}: {crop.shape[1]}x{crop.shape[0]} -> {out_path}')


def process_custom_chroma():
    import os
    os.makedirs(OUT_DIR, exist_ok=True)
    for name, (path, box) in CUSTOM_CHROMA_CROPS.items():
        rgba = get_chroma_sheet(path)
        x0, y0, x1, y1 = box
        cell = rgba[y0:y1, x0:x1]
        bbox = tight_bbox(cell[:, :, 3])
        if bbox is None:
            print(f'  !! no content found for {name}', file=sys.stderr)
            continue
        bx0, by0, bx1, by1 = bbox
        crop = cell[by0:by1, bx0:bx1]
        out_path = f'{OUT_DIR}/{name}.png'
        Image.fromarray(crop, 'RGBA').save(out_path)
        print(f'{name}: {crop.shape[1]}x{crop.shape[0]} -> {out_path}')


def process_fixed():
    import os
    os.makedirs(OUT_DIR, exist_ok=True)
    for name, (path, box) in FIXED_CROPS.items():
        im = Image.open(path).convert('RGBA')
        crop = im.crop(box)
        out_path = f'{OUT_DIR}/{name}.png'
        crop.save(out_path)
        print(f'{name}: {crop.size} -> {out_path}')


if __name__ == '__main__':
    process_grid()
    process_custom_chroma()
    process_fixed()
