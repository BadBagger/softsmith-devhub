"""
One-off: crops individual UI chrome elements out of the banked UI/icon
batch sheets for use as backdrops in game modals.

Not part of the game runtime -- run manually if the source art changes.
"""
from PIL import Image

CROPS = {
    # parchment plaque frame -- TownScene's Town Square notice-board modal
    'notice-frame': (
        'tools/drive_batch/staged/ChatGPT Image Jul 31, 2026, 07_10_45 PM (9).png',
        (260, 46, 1240, 494),
    ),
    # dual-panel frame with a center swap console -- PartyScene
    'swap-frame': (
        'tools/drive_batch/staged/ChatGPT Image Jul 31, 2026, 07_10_45 PM (8).png',
        (20, 65, 1500, 955),
    ),
}
OUT_DIR = 'public/ui'


def process():
    import os
    os.makedirs(OUT_DIR, exist_ok=True)
    for name, (source, box) in CROPS.items():
        im = Image.open(source).convert('RGB')
        crop = im.crop(box)
        out_path = f'{OUT_DIR}/{name}.png'
        crop.save(out_path)
        print(f'{name}: {crop.size} -> {out_path}')


if __name__ == '__main__':
    process()
