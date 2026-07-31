"""
One-off asset pipeline: takes the 4-pose magenta-background sheets from
ChatGPT, chroma-keys the background out, auto-splits each sheet into its
4 poses, tightly crops + re-centers each pose on a shared per-creature
canvas (bottom-anchored so feet don't bob across frames), and writes
individual frame PNGs Phaser can load directly as animation frames.

Not part of the game runtime -- run manually whenever a new art batch
comes in from the source uploads.
"""
import sys
import numpy as np
from PIL import Image

SOURCES = {
    'scavenger': '/root/.claude/uploads/65f5aa64-3929-5a50-bac1-c63ff1f77529/74cac43f-2890.png',
    'glowmite': '/root/.claude/uploads/65f5aa64-3929-5a50-bac1-c63ff1f77529/815562d2-2891.png',
    'scraphowler': '/root/.claude/uploads/65f5aa64-3929-5a50-bac1-c63ff1f77529/0a975590-2892.png',
    'ironback_titan': '/root/.claude/uploads/65f5aa64-3929-5a50-bac1-c63ff1f77529/8407cec3-2893.png',
    # Top-down/chibi angle batch, for the overworld map (distinct from the
    # side-view battle poses above). Only the scavenger has a slot in the
    # game right now -- the top-down creature poses from this same batch
    # aren't wired in yet, see chat notes.
    'scavenger_overworld': '/root/.claude/uploads/65f5aa64-3929-5a50-bac1-c63ff1f77529/41a40d58-2894.png',

    # Batch pulled from Google Drive (desktop paste never landed as real
    # uploads, so these came through the Drive connector instead). Picking
    # one take per species where the batch had duplicates.
    'radrat': 'tools/drive_batch/staged/ChatGPT Image Jul 31, 2026, 06_38_46 PM (8).png',
    'snarlpup': 'tools/drive_batch/staged/ChatGPT Image Jul 31, 2026, 06_38_44 PM (1).png',
    'diremaw': 'tools/drive_batch/staged/ChatGPT Image Jul 31, 2026, 06_39_56 PM (6).png',
    'rustling': 'tools/drive_batch/staged/ChatGPT Image Jul 31, 2026, 06_38_45 PM (2).png',
    'ironhide': 'tools/drive_batch/staged/ChatGPT Image Jul 31, 2026, 06_38_46 PM (9).png',
    'buzzmite': 'tools/drive_batch/staged/ChatGPT Image Jul 31, 2026, 06_38_46 PM (10).png',
    'hiveborn': 'tools/drive_batch/staged/ChatGPT Image Jul 31, 2026, 06_39_56 PM (7).png',
    'sandviper': 'tools/drive_batch/staged/ChatGPT Image Jul 31, 2026, 06_38_45 PM (4).png',
    'toxicoil': 'tools/drive_batch/staged/ChatGPT Image Jul 31, 2026, 06_39_55 PM (1).png',
    'wyrmrot': 'tools/drive_batch/staged/ChatGPT Image Jul 31, 2026, 06_39_56 PM (8).png',
    'featherscrap': 'tools/drive_batch/staged/ChatGPT Image Jul 31, 2026, 06_38_45 PM (5).png',
    'rustwing': 'tools/drive_batch/staged/ChatGPT Image Jul 31, 2026, 06_39_55 PM (2).png',
    'skytearer': 'tools/drive_batch/staged/ChatGPT Image Jul 31, 2026, 06_39_57 PM (9).png',
    'ooze': 'tools/drive_batch/staged/ChatGPT Image Jul 31, 2026, 06_38_46 PM (6).png',
    'tarbehemoth': 'tools/drive_batch/staged/ChatGPT Image Jul 31, 2026, 06_39_55 PM (3).png',
    'whisp': 'tools/drive_batch/staged/ChatGPT Image Jul 31, 2026, 06_38_46 PM (7).png',
    'fumewraith': 'tools/drive_batch/staged/ChatGPT Image Jul 31, 2026, 06_39_55 PM (4).png',
}

OUT_DIR = '/home/user/softsmith-devhub/wasteland-tamers/public/sprites'
TARGET_MAX_DIM = 220
PAD = 6
BOTTOM_PAD = 4


def chroma_key(arr):
    r = arr[:, :, 0].astype(np.int16)
    g = arr[:, :, 1].astype(np.int16)
    b = arr[:, :, 2].astype(np.int16)
    magentaness = np.minimum(r, b) - g  # high for magenta bg, low for painted subject
    # Soft ramp: fully opaque below 35, fully transparent above 95.
    alpha = np.clip(255 - (magentaness - 35) * (255 / 60), 0, 255).astype(np.uint8)

    # Despill: pull R/B down toward G on partially-transparent edge pixels
    # so we don't keep a magenta halo around the subject.
    spill = np.clip(magentaness, 0, None)
    factor = np.clip(spill / 90.0, 0, 1)
    r2 = r - (r - g) * factor
    b2 = b - (b - g) * factor
    out = np.stack([
        np.clip(r2, 0, 255),
        g,
        np.clip(b2, 0, 255),
        alpha,
    ], axis=-1).astype(np.uint8)
    return out


def find_frame_ranges(alpha, n_frames=4, search_window=90):
    colsum = (alpha > 20).sum(axis=0)
    nonzero = np.where(colsum > 0)[0]
    content_start, content_end = int(nonzero[0]), int(nonzero[-1])
    width = content_end - content_start

    splits = [content_start]
    for i in range(1, n_frames):
        target = content_start + round(width * i / n_frames)
        lo = max(content_start, target - search_window)
        hi = min(content_end, target + search_window)
        window = colsum[lo:hi + 1]
        best = lo + int(np.argmin(window))
        splits.append(best)
    splits.append(content_end + 1)

    ranges = [(splits[i], splits[i + 1]) for i in range(n_frames)]
    return ranges


def tight_bbox(alpha):
    rows = np.where((alpha > 20).any(axis=1))[0]
    cols = np.where((alpha > 20).any(axis=0))[0]
    if len(rows) == 0 or len(cols) == 0:
        return None
    return int(cols[0]), int(rows[0]), int(cols[-1]) + 1, int(rows[-1]) + 1


def process_one(name, path):
    im = Image.open(path).convert('RGB')
    arr = np.array(im)
    rgba = chroma_key(arr)
    alpha = rgba[:, :, 3]

    ranges = find_frame_ranges(alpha, 4)
    crops = []
    for (x0, x1) in ranges:
        strip = rgba[:, x0:x1]
        bbox = tight_bbox(strip[:, :, 3])
        if bbox is None:
            continue
        bx0, by0, bx1, by1 = bbox
        crops.append(strip[by0:by1, bx0:bx1])

    if not crops:
        print(f'  !! no frames detected for {name}', file=sys.stderr)
        return

    max_w = max(c.shape[1] for c in crops)
    max_h = max(c.shape[0] for c in crops)
    canvas_w = max_w + PAD * 2
    canvas_h = max_h + PAD * 2 + BOTTOM_PAD

    import os
    frame_dir = f'{OUT_DIR}/{name}'
    os.makedirs(frame_dir, exist_ok=True)

    scale = TARGET_MAX_DIM / max(canvas_w, canvas_h)
    out_w, out_h = max(1, round(canvas_w * scale)), max(1, round(canvas_h * scale))

    for i, crop in enumerate(crops):
        canvas = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
        h, w = crop.shape[0], crop.shape[1]
        paste_x = (canvas_w - w) // 2
        paste_y = canvas_h - BOTTOM_PAD - h  # bottom-anchored
        canvas.paste(Image.fromarray(crop, 'RGBA'), (paste_x, paste_y))
        canvas = canvas.resize((out_w, out_h), Image.LANCZOS)
        canvas.save(f'{frame_dir}/frame_{i}.png')

    print(f'{name}: {len(crops)} frames -> {frame_dir} ({out_w}x{out_h})')


if __name__ == '__main__':
    for name, path in SOURCES.items():
        process_one(name, path)
