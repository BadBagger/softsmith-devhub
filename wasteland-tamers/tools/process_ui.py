"""
One-off: crops the parchment notice-board frame out of the UI/icon batch
sheet for use as a modal backdrop in TownScene's Town Square.

Not part of the game runtime -- run manually if the source art changes.
"""
from PIL import Image

SOURCE = 'tools/drive_batch/staged/ChatGPT Image Jul 31, 2026, 07_10_45 PM (9).png'
CROP_BOX = (260, 46, 1240, 494)  # parchment plaque frame, top of the sheet
OUT_PATH = 'public/ui/notice-frame.png'


def process():
    import os
    os.makedirs('public/ui', exist_ok=True)
    im = Image.open(SOURCE).convert('RGB')
    crop = im.crop(CROP_BOX)
    crop.save(OUT_PATH)
    print(f'notice-frame: {crop.size} -> {OUT_PATH}')


if __name__ == '__main__':
    process()
