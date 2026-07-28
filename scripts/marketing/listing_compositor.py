#!/usr/bin/env python3
"""
listing_compositor.py — build a full marketplace-style icon-pack listing image:
title block, an icon/wallpaper count badge, a phone mockup with a live
homescreen preview, a hero icon showcase grid, a small "icon preview" grid,
a wallpaper strip, and a row of feature badges.

This mirrors the STRUCTURE of a typical Etsy/marketplace icon-pack listing
image — it does not bake in any particular theme. Every color, font,
background image, phone frame, and icon set is passed in through
ListingConfig / build_listing(), so the same layout works for a pastel
celestial pack, a neon cyberpunk pack, a minimalist mono pack, etc. Section
positions are stored as fractions of the canvas (0.0-1.0), so the whole
layout scales with `width`/`height` instead of being pinned to fixed pixels.

Usage:
    python3 listing_compositor.py

Edit the CONFIG block and the build_listing() call at the bottom to point at
your own background, phone frame, icon, and wallpaper files. No network needed.
"""

from __future__ import annotations
from dataclasses import dataclass
from PIL import Image, ImageDraw

from _common import (
    load_cover_image,
    square_icon,
    drop_shadow,
    outer_glow,
    load_font,
    centered_text,
    tracked_text,
    rounded_rect,
    paste_cover,
)


Rect = tuple[float, float, float, float]  # (x0, y0, x1, y1) as fractions of canvas


@dataclass
class FeatureBadge:
    label: str
    sublabel: str = ""
    icon: str | None = None


@dataclass
class ListingConfig:
    width: int = 1600
    height: int = 1600

    # ---- Colors / fonts (swap these per theme) --------------------------
    heading_color: tuple[int, int, int] = (90, 60, 120)
    body_color: tuple[int, int, int] = (70, 55, 90)
    accent_color: tuple[int, int, int] = (150, 110, 200)
    card_fill: tuple[int, int, int, int] = (255, 255, 255, 140)
    card_outline: tuple[int, int, int, int] = (150, 110, 200, 200)

    title_font: str = "DejaVuSerif-Bold.ttf"
    label_font: str = "DejaVuSans-Bold.ttf"
    body_font: str = "DejaVuSans.ttf"

    # ---- Text content -----------------------------------------------------
    title: str = "ICON PACK"
    kicker: str = "APP ICON PACK"          # small caps line under the title
    pill_text: str = "45 APP ICONS + 2 WALLPAPERS"
    meta_lines: tuple[str, ...] = ("For iPhone & Android", "PNG Digital Download")
    preview_label: str = "ICON PREVIEW"
    wallpaper_label: str = "WALLPAPERS"

    # ---- Count badge (top-right seal) -------------------------------------
    counts: tuple[tuple[str, str], ...] = (("45", "ICONS"), ("2", "WALLPAPERS"))
    badge_center: tuple[float, float] = (0.87, 0.19)
    badge_radius_frac: float = 0.09

    # ---- Section layout (fractions of canvas) ------------------------------
    title_y_frac: float = 0.035
    kicker_y_frac: float = 0.135
    pill_y_frac: float = 0.175
    meta_y_frac: float = 0.215

    phone_frame_rect: Rect = (0.03, 0.27, 0.42, 0.97)
    phone_screen_rect: Rect = (0.065, 0.305, 0.385, 0.90)

    hero_grid_rect: Rect = (0.44, 0.30, 0.85, 0.585)
    hero_cols: int = 3
    hero_icon_gap: int = 24

    preview_rect: Rect = (0.44, 0.635, 0.665, 0.895)
    preview_cols: int = 4

    wallpaper_rect: Rect = (0.685, 0.635, 0.95, 0.895)

    badges_rect: Rect = (0.03, 0.915, 0.97, 0.99)

    # ---- Depth effects for the hero grid only -----------------------------
    shadow_blur: int = 18
    shadow_opacity: int = 130
    glow_blur: int = 22
    glow_opacity: int = 90


def _abs_rect(rect: Rect, width: int, height: int) -> tuple[int, int, int, int]:
    x0, y0, x1, y1 = rect
    return (round(x0 * width), round(y0 * height), round(x1 * width), round(y1 * height))


# ----------------------------------------------------------------------------
# Section builders
# ----------------------------------------------------------------------------
def draw_title_block(canvas: Image.Image, cfg: ListingConfig) -> None:
    w, h = canvas.size
    centered_text(canvas, cfg.title, round(cfg.title_y_frac * h),
                  load_font(cfg.title_font, round(h * 0.06)), cfg.heading_color, shadow=False)
    d = ImageDraw.Draw(canvas)
    tracked_text(canvas, cfg.kicker, w // 2, round(cfg.kicker_y_frac * h),
                 load_font(cfg.label_font, round(h * 0.02)), cfg.body_color, tracking=6)

    if cfg.pill_text:
        pf = load_font(cfg.body_font, round(h * 0.018))
        tw = d.textbbox((0, 0), cfg.pill_text, font=pf)[2]
        pad_x, pad_y = round(w * 0.02), round(h * 0.012)
        px0 = w // 2 - tw // 2 - pad_x
        px1 = w // 2 + tw // 2 + pad_x
        py0 = round(cfg.pill_y_frac * h)
        py1 = py0 + round(h * 0.018) + pad_y * 2
        rounded_rect(d, (px0, py0, px1, py1), radius=(py1 - py0) // 2,
                     outline=cfg.accent_color, width=2)
        d.text((w // 2 - tw // 2, py0 + pad_y), cfg.pill_text, font=pf, fill=cfg.body_color)

    my = round(cfg.meta_y_frac * h)
    mf = load_font(cfg.body_font, round(h * 0.015))
    for line in cfg.meta_lines:
        centered_text(canvas, line, my, mf, cfg.body_color, shadow=False)
        my += round(h * 0.022)


def draw_count_badge(canvas: Image.Image, cfg: ListingConfig) -> None:
    w, h = canvas.size
    cx, cy = round(cfg.badge_center[0] * w), round(cfg.badge_center[1] * h)
    r = round(cfg.badge_radius_frac * w)
    d = ImageDraw.Draw(canvas)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=cfg.card_fill, outline=cfg.accent_color, width=3)
    d.ellipse((cx - r + 10, cy - r + 10, cx + r - 10, cy + r - 10), outline=cfg.accent_color, width=1)

    n = len(cfg.counts)
    if n == 0:
        return
    band_h = (2 * r) / n
    num_font = load_font(cfg.label_font, round(r * 0.55))
    lbl_font = load_font(cfg.body_font, round(r * 0.16))
    for i, (num, label) in enumerate(cfg.counts):
        band_cy = cy - r + band_h * (i + 0.5)
        num_bbox = d.textbbox((0, 0), num, font=num_font)
        num_h = num_bbox[3] - num_bbox[1]
        d.text((cx, band_cy - num_h * 0.65), num, font=num_font, fill=cfg.heading_color, anchor="mm")
        tracked_text(canvas, label, cx, round(band_cy + num_h * 0.25), lbl_font, cfg.body_color, tracking=2)
        if i < n - 1:
            ly = round(cy - r + band_h * (i + 1))
            d.line((cx - r * 0.55, ly, cx + r * 0.55, ly), fill=cfg.accent_color, width=1)


def draw_phone_mockup(canvas: Image.Image, cfg: ListingConfig,
                       wallpaper: str | None, icons: list[dict],
                       phone_frame: str | None) -> None:
    w, h = canvas.size
    sx0, sy0, sx1, sy1 = _abs_rect(cfg.phone_screen_rect, w, h)
    screen = Image.new("RGBA", (sx1 - sx0, sy1 - sy0), (0, 0, 0, 0))
    fill = load_cover_image(wallpaper, (screen.width, screen.height)).convert("RGBA")
    screen.paste(fill, (0, 0))

    n = len(icons)
    if n:
        cols = 4
        rows = (n + cols - 1) // cols
        pad = round(screen.width * 0.06)
        cell_w = (screen.width - pad * 2) / cols
        cell_h = (screen.height - pad * 2) / min(rows, 6)
        icon_size = round(min(cell_w, cell_h) * 0.62)
        icon_font = load_font(cfg.body_font, round(icon_size * 0.22))
        d = ImageDraw.Draw(screen)
        for i, item in enumerate(icons):
            col, row = i % cols, i // cols
            cx = round(pad + cell_w * (col + 0.5))
            cy = round(pad + cell_h * (row + 0.5))
            icon_img = square_icon(item["icon"], icon_size)
            screen.alpha_composite(icon_img, (cx - icon_size // 2, cy - icon_size // 2))
            label = item.get("label")
            if label:
                d.text((cx, cy + icon_size // 2 + 4), label, font=icon_font,
                       fill=(255, 255, 255), anchor="ma", stroke_width=2, stroke_fill=(0, 0, 0))

    canvas.alpha_composite(screen, (sx0, sy0))

    if phone_frame:
        fx0, fy0, fx1, fy1 = _abs_rect(cfg.phone_frame_rect, w, h)
        frame = Image.open(phone_frame).convert("RGBA")
        frame = frame.resize((fx1 - fx0, fy1 - fy0), Image.LANCZOS)
        canvas.alpha_composite(frame, (fx0, fy0))
    else:
        # No frame asset supplied: draw a plain rounded bezel so the mockup
        # still reads as a phone.
        d = ImageDraw.Draw(canvas)
        bezel = round((sx1 - sx0) * 0.08)
        rounded_rect(d, (sx0 - bezel, sy0 - bezel, sx1 + bezel, sy1 + bezel),
                     radius=round(bezel * 2.2), outline=(20, 20, 20), width=bezel)


def draw_hero_grid(canvas: Image.Image, cfg: ListingConfig, icons: list[str]) -> None:
    if not icons:
        return
    w, h = canvas.size
    x0, y0, x1, y1 = _abs_rect(cfg.hero_grid_rect, w, h)
    n = len(icons)
    cols = min(cfg.hero_cols, n)
    rows = (n + cols - 1) // cols
    gap = cfg.hero_icon_gap
    icon_size = round(min((x1 - x0 - gap * (cols - 1)) / cols,
                           (y1 - y0 - gap * (rows - 1)) / rows))
    grid_w = cols * icon_size + (cols - 1) * gap
    grid_h = rows * icon_size + (rows - 1) * gap
    start_x = x0 + ((x1 - x0) - grid_w) // 2
    start_y = y0 + ((y1 - y0) - grid_h) // 2

    for i, path in enumerate(icons):
        icon = square_icon(path, icon_size)
        col, row = i % cols, i // cols
        icons_in_row = min(cols, n - row * cols)
        row_w = icons_in_row * icon_size + (icons_in_row - 1) * gap
        row_x = start_x + ((grid_w - row_w) // 2)
        x = row_x + col * (icon_size + gap)
        y = start_y + row * (icon_size + gap)

        glow = outer_glow(icon, cfg.glow_blur, cfg.glow_opacity, cfg.accent_color)
        gpad = cfg.glow_blur * 2
        canvas.alpha_composite(glow, (x - gpad, y - gpad))

        shadow = drop_shadow(icon, cfg.shadow_blur, cfg.shadow_opacity)
        spad = cfg.shadow_blur * 2
        canvas.alpha_composite(shadow, (x - spad, y - spad + 8))

        canvas.alpha_composite(icon, (x, y))


def draw_preview_grid(canvas: Image.Image, cfg: ListingConfig, icons: list[str]) -> None:
    w, h = canvas.size
    x0, y0, x1, y1 = _abs_rect(cfg.preview_rect, w, h)
    d = ImageDraw.Draw(canvas)
    label_h = round(h * 0.03)
    tracked_text(canvas, cfg.preview_label, (x0 + x1) // 2, y0, load_font(cfg.label_font, round(h * 0.016)),
                 cfg.body_color, tracking=4)
    card = (x0, y0 + label_h, x1, y1)
    rounded_rect(d, card, radius=round(h * 0.015), outline=cfg.card_outline, width=2)

    if not icons:
        return
    cols = cfg.preview_cols
    n = len(icons)
    rows = (n + cols - 1) // cols
    pad = round((x1 - x0) * 0.06)
    cw = (card[2] - card[0] - pad * 2) / cols
    ch = (card[3] - card[1] - pad * 2) / max(rows, 1)
    icon_size = round(min(cw, ch) * 0.72)
    for i, path in enumerate(icons):
        col, row = i % cols, i // cols
        cx = round(card[0] + pad + cw * (col + 0.5))
        cy = round(card[1] + pad + ch * (row + 0.5))
        icon = square_icon(path, icon_size)
        canvas.alpha_composite(icon, (cx - icon_size // 2, cy - icon_size // 2))


def draw_wallpaper_strip(canvas: Image.Image, cfg: ListingConfig, wallpapers: list[str]) -> None:
    w, h = canvas.size
    x0, y0, x1, y1 = _abs_rect(cfg.wallpaper_rect, w, h)
    label_h = round(h * 0.03)
    tracked_text(canvas, cfg.wallpaper_label, (x0 + x1) // 2, y0, load_font(cfg.label_font, round(h * 0.016)),
                 cfg.body_color, tracking=4)

    if not wallpapers:
        return
    gap = round((x1 - x0) * 0.06)
    n = len(wallpapers)
    thumb_w = ((x1 - x0) - gap * (n - 1)) / n
    thumb_top = y0 + label_h
    d = ImageDraw.Draw(canvas)
    for i, path in enumerate(wallpapers):
        tx0 = round(x0 + i * (thumb_w + gap))
        tx1 = round(tx0 + thumb_w)
        box = (tx0, thumb_top, tx1, y1)
        paste_cover(canvas, path, box, radius=round(h * 0.015))
        rounded_rect(d, box, radius=round(h * 0.015), outline=cfg.card_outline, width=2)


def draw_feature_badges(canvas: Image.Image, cfg: ListingConfig, badges: list[FeatureBadge]) -> None:
    if not badges:
        return
    w, h = canvas.size
    x0, y0, x1, y1 = _abs_rect(cfg.badges_rect, w, h)
    n = len(badges)
    gap = round((x1 - x0) * 0.02)
    card_w = ((x1 - x0) - gap * (n - 1)) / n
    d = ImageDraw.Draw(canvas)
    label_font = load_font(cfg.label_font, round(h * 0.016))
    sub_font = load_font(cfg.body_font, round(h * 0.013))

    for i, badge in enumerate(badges):
        cx0 = round(x0 + i * (card_w + gap))
        cx1 = round(cx0 + card_w)
        rounded_rect(d, (cx0, y0, cx1, y1), radius=round((y1 - y0) * 0.3),
                     fill=cfg.card_fill, outline=cfg.card_outline, width=2)

        chip_r = round((y1 - y0) * 0.32)
        chip_cx, chip_cy = cx0 + round((x1 - x0) * 0.03) + chip_r, (y0 + y1) // 2
        if badge.icon:
            d.ellipse((chip_cx - chip_r, chip_cy - chip_r, chip_cx + chip_r, chip_cy + chip_r),
                      fill=(255, 255, 255, 200))
            icon_img = square_icon(badge.icon, chip_r)
            canvas.alpha_composite(icon_img, (chip_cx - chip_r // 2, chip_cy - chip_r // 2))
            text_x = chip_cx + chip_r + round((x1 - x0) * 0.015)
        else:
            text_x = cx0 + round((x1 - x0) * 0.05)

        d.text((text_x, chip_cy - round((y1 - y0) * 0.16)), badge.label, font=label_font,
               fill=cfg.heading_color, anchor="lm")
        if badge.sublabel:
            d.text((text_x, chip_cy + round((y1 - y0) * 0.16)), badge.sublabel, font=sub_font,
                   fill=cfg.body_color, anchor="lm")


# ----------------------------------------------------------------------------
# The compositor
# ----------------------------------------------------------------------------
def build_listing(
    cfg: ListingConfig,
    background: str | None,
    out_path: str = "listing.png",
    phone_frame: str | None = None,
    phone_wallpaper: str | None = None,
    phone_icons: list[dict] | None = None,
    hero_icons: list[str] | None = None,
    preview_icons: list[str] | None = None,
    wallpapers: list[str] | None = None,
    badges: list[FeatureBadge] | None = None,
) -> str:
    canvas = load_cover_image(background, (cfg.width, cfg.height)).convert("RGBA")

    draw_title_block(canvas, cfg)
    draw_count_badge(canvas, cfg)
    draw_phone_mockup(canvas, cfg, phone_wallpaper, phone_icons or [], phone_frame)
    draw_hero_grid(canvas, cfg, hero_icons or [])
    draw_preview_grid(canvas, cfg, preview_icons or [])
    draw_wallpaper_strip(canvas, cfg, wallpapers or [])
    draw_feature_badges(canvas, cfg, badges or [])

    canvas.convert("RGB").save(out_path, quality=95)
    return out_path


if __name__ == "__main__":
    cfg = ListingConfig(
        title="ICON PACK",
        kicker="APP ICON PACK",
        pill_text="45 APP ICONS + 2 WALLPAPERS",
        counts=(("45", "ICONS"), ("2", "WALLPAPERS")),
    )
    # Point these at your real files:
    #   background = "backgrounds/theme_bg.png"      (theme art, ornaments baked in)
    #   phone_frame = "frames/iphone_frame.png"       (transparent screen cutout)
    #   phone_wallpaper = "wallpapers/theme_wall.png"
    #   phone_icons = [{"icon": "icons/a.png", "label": "Messages"}, ...]
    #   hero_icons = ["icons/a.png", "icons/b.png", ...]          # up to hero_cols * rows
    #   preview_icons = ["icons/c.png", ...]                       # small grid, any count
    #   wallpapers = ["wallpapers/w1.png", "wallpapers/w2.png"]
    #   badges = [FeatureBadge("PASTEL", "Dreamy & Soft", icon="icons/flower.png"), ...]
    build_listing(cfg, background=None, out_path="listing.png")
    print("Wrote listing.png")
