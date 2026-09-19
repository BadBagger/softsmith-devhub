#!/usr/bin/env python3
"""Approximate a Camera Raw preset on a JPEG, to preview a look.

IMPORTANT, READ THIS BEFORE USING THE OUTPUT IN A LISTING
---------------------------------------------------------
This is an independent reimplementation of the Camera Raw adjustments, not
Adobe's renderer. It reads the same .xmp files that ship to buyers and
applies them as faithfully as it can, but the result will not match
Lightroom pixel for pixel. Adobe's tone mapping, colour engine and local
contrast are proprietary, and Lightroom works from linear RAW data where
this works from an already-rendered 8-bit JPEG.

Use these previews to judge and iterate on a look. Before publishing a
listing, re-export the same source photos through Lightroom so the "after"
a buyer sees is genuinely what the preset produces.

Usage:
    python3 render_preview.py --self-test
    python3 render_preview.py photo.jpg "dist/.../01 Preset.xmp" out.jpg
"""

from __future__ import annotations

import argparse
import xml.etree.ElementTree as ET
from pathlib import Path

import numpy as np
from PIL import Image

CRS = "http://ns.adobe.com/camera-raw-settings/1.0/"
RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#"

# Camera Raw's eight colour bands, by hue angle.
BAND_HUES = {
    "Red": 0.0,
    "Orange": 30.0,
    "Yellow": 60.0,
    "Green": 120.0,
    "Aqua": 180.0,
    "Blue": 240.0,
    "Purple": 285.0,
    "Magenta": 315.0,
}
BAND_NAMES = list(BAND_HUES)


# ---------------------------------------------------------------- xmp input


def parse_xmp(path: Path) -> tuple[dict, dict]:
    """Pull settings and tone curves out of a preset file."""
    root = ET.parse(path).getroot()
    description = root.find(f".//{{{RDF}}}Description")
    settings: dict[str, float | str] = {}
    for key, value in description.attrib.items():
        if not key.startswith(f"{{{CRS}}}"):
            continue
        name = key.split("}", 1)[1]
        try:
            settings[name] = float(value)
        except ValueError:
            settings[name] = value

    curves: dict[str, list[tuple[float, float]]] = {}
    for channel, tag in (
        ("rgb", "ToneCurvePV2012"),
        ("red", "ToneCurvePV2012Red"),
        ("green", "ToneCurvePV2012Green"),
        ("blue", "ToneCurvePV2012Blue"),
    ):
        node = description.find(f"{{{CRS}}}{tag}/{{{RDF}}}Seq")
        if node is None:
            continue
        points = []
        for item in node:
            x, y = item.text.split(",")
            points.append((float(x) / 255.0, float(y) / 255.0))
        curves[channel] = points
    return settings, curves


# ------------------------------------------------------------ colour basics


def srgb_to_linear(x: np.ndarray) -> np.ndarray:
    return np.where(x <= 0.04045, x / 12.92, ((x + 0.055) / 1.055) ** 2.4)


def linear_to_srgb(x: np.ndarray) -> np.ndarray:
    x = np.clip(x, 0.0, 1.0)
    return np.where(x <= 0.0031308, x * 12.92, 1.055 * x ** (1 / 2.4) - 0.055)


def luma(rgb: np.ndarray) -> np.ndarray:
    return rgb[..., 0] * 0.2126 + rgb[..., 1] * 0.7152 + rgb[..., 2] * 0.0722


def smoothstep(edge0: float, edge1: float, x: np.ndarray) -> np.ndarray:
    t = np.clip((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def scale_to_luma(rgb: np.ndarray, old: np.ndarray, new: np.ndarray) -> np.ndarray:
    """Retarget luminance while holding colour ratios, which avoids the hue
    drift you get from adjusting channels independently."""
    gain = np.where(old > 1e-4, new / np.maximum(old, 1e-4), 1.0)
    return rgb * gain[..., None]


def _box_blur(channel: np.ndarray, radius: int) -> np.ndarray:
    """Separable box blur via summed area, in float."""
    if radius < 1:
        return channel
    kernel = 2 * radius + 1
    out = channel
    for axis in (0, 1):
        padded = np.pad(out, [(radius + 1, radius) if a == axis else (0, 0) for a in (0, 1)], mode="edge")
        cumulative = np.cumsum(padded, axis=axis, dtype=np.float32)
        lo = np.take(cumulative, np.arange(0, out.shape[axis]), axis=axis)
        hi = np.take(cumulative, np.arange(kernel, out.shape[axis] + kernel), axis=axis)
        out = (hi - lo) / kernel
    return out


def blur(channel: np.ndarray, radius: float) -> np.ndarray:
    """Gaussian-ish blur kept entirely in float.

    Three box passes approximate a Gaussian. Doing this in float matters: an
    earlier version round-tripped through 8-bit, which quantised the local
    contrast signal and posterised smooth skies.
    """
    r = max(int(round(radius * 0.60)), 1)
    out = channel.astype(np.float32)
    for _ in range(3):
        out = _box_blur(out, r)
    return out


def rgb_to_hsv(rgb: np.ndarray) -> np.ndarray:
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx, mn = rgb.max(-1), rgb.min(-1)
    diff = mx - mn
    hue = np.zeros_like(mx)
    mask = diff > 1e-6
    idx = (mx == r) & mask
    hue[idx] = (60 * ((g[idx] - b[idx]) / diff[idx])) % 360
    idx = (mx == g) & mask
    hue[idx] = 60 * ((b[idx] - r[idx]) / diff[idx]) + 120
    idx = (mx == b) & mask
    hue[idx] = 60 * ((r[idx] - g[idx]) / diff[idx]) + 240
    sat = np.where(mx > 1e-6, diff / np.maximum(mx, 1e-6), 0.0)
    return np.stack([hue % 360, sat, mx], -1)


def hsv_to_rgb(hsv: np.ndarray) -> np.ndarray:
    h, s, v = hsv[..., 0] / 60.0, hsv[..., 1], hsv[..., 2]
    i = np.floor(h).astype(int) % 6
    f = h - np.floor(h)
    p, q, t = v * (1 - s), v * (1 - f * s), v * (1 - (1 - f) * s)
    out = np.zeros(hsv.shape, dtype=np.float32)
    for index, (rr, gg, bb) in enumerate(
        [(v, t, p), (q, v, p), (p, v, t), (p, q, v), (t, p, v), (v, p, q)]
    ):
        m = i == index
        out[m] = np.stack([rr, gg, bb], -1)[m]
    return out


def band_weights(hue: np.ndarray) -> np.ndarray:
    """Split each pixel's hue between its two neighbouring bands, so the
    weights always sum to one and no band edge shows a seam."""
    centres = np.array([BAND_HUES[n] for n in BAND_NAMES], dtype=np.float32)
    weights = np.zeros(hue.shape + (len(centres),), dtype=np.float32)
    extended = np.concatenate([centres, [centres[0] + 360.0]])
    for i in range(len(centres)):
        lo, hi = extended[i], extended[i + 1]
        h = hue.copy()
        if hi > 360.0:
            h = np.where(h < lo, h + 360.0, h)
        inside = (h >= lo) & (h < hi)
        t = np.zeros_like(hue)
        span = hi - lo
        t[inside] = (h[inside] - lo) / span
        weights[..., i] += np.where(inside, 1.0 - t, 0.0)
        weights[..., (i + 1) % len(centres)] += np.where(inside, t, 0.0)
    return weights


def spline(points: list[tuple[float, float]], x: np.ndarray) -> np.ndarray:
    """Monotone cubic interpolation, so a curve never introduces wobble."""
    xs = np.array([p[0] for p in points], dtype=np.float64)
    ys = np.array([p[1] for p in points], dtype=np.float64)
    n = len(xs)
    if n < 3:
        return np.interp(x, xs, ys)

    delta = np.diff(ys) / np.diff(xs)
    m = np.zeros(n)
    m[1:-1] = (delta[:-1] + delta[1:]) / 2
    m[0], m[-1] = delta[0], delta[-1]
    for i in range(n - 1):
        if delta[i] == 0:
            m[i] = m[i + 1] = 0
        else:
            a, b = m[i] / delta[i], m[i + 1] / delta[i]
            s = a * a + b * b
            if s > 9:
                tau = 3.0 / np.sqrt(s)
                m[i], m[i + 1] = tau * a * delta[i], tau * b * delta[i]

    xf = np.clip(x, xs[0], xs[-1])
    idx = np.clip(np.searchsorted(xs, xf) - 1, 0, n - 2)
    h = (xs[idx + 1] - xs[idx])
    t = (xf - xs[idx]) / h
    t2, t3 = t * t, t * t * t
    return (
        (2 * t3 - 3 * t2 + 1) * ys[idx]
        + (t3 - 2 * t2 + t) * h * m[idx]
        + (-2 * t3 + 3 * t2) * ys[idx + 1]
        + (t3 - t2) * h * m[idx + 1]
    )


# ------------------------------------------------------------- the pipeline


def apply_preset(rgb: np.ndarray, s: dict, curves: dict) -> np.ndarray:
    """Apply a parsed preset to a float RGB array in 0..1 sRGB."""
    get = lambda k, d=0.0: float(s.get(k, d))  # noqa: E731

    # --- white balance, as a relative shift (never absolute Kelvin)
    temp, tint = get("IncrementalTemperature") / 100.0, get("IncrementalTint") / 100.0
    lin = srgb_to_linear(rgb)
    if temp or tint:
        lin[..., 0] *= 1.0 + 0.30 * temp
        lin[..., 2] *= 1.0 - 0.30 * temp
        lin[..., 1] *= 1.0 - 0.15 * tint
        lin[..., 0] *= 1.0 + 0.05 * tint
        lin[..., 2] *= 1.0 + 0.05 * tint

    # --- exposure, in linear light where it belongs
    exposure = get("Exposure2012")
    if exposure:
        lin *= 2.0 ** exposure
    rgb = linear_to_srgb(lin)

    # --- parametric tone, driven off luminance so colour ratios survive
    L = luma(rgb)
    target = L.copy()

    contrast = get("Contrast2012") / 100.0
    if contrast:
        target = np.clip(target + contrast * 0.22 * np.sin(2 * np.pi * (target - 0.5)), 0, 1)
        target = np.clip((target - 0.5) * (1.0 + contrast * 0.30) + 0.5, 0, 1)

    highlights = get("Highlights2012") / 100.0
    if highlights:
        target += highlights * 0.42 * smoothstep(0.45, 1.0, target)
    shadows = get("Shadows2012") / 100.0
    if shadows:
        target += shadows * 0.42 * (1.0 - smoothstep(0.0, 0.55, target))
    whites = get("Whites2012") / 100.0
    if whites:
        target += whites * 0.28 * smoothstep(0.65, 1.0, target)
    blacks = get("Blacks2012") / 100.0
    if blacks:
        target += blacks * 0.28 * (1.0 - smoothstep(0.0, 0.35, target))

    target = np.clip(target, 0.0, 1.0)
    rgb = np.clip(scale_to_luma(rgb, L, target), 0.0, 1.5)

    # --- local contrast: clarity is coarse, texture is fine
    clarity, texture, dehaze = (
        get("Clarity2012") / 100.0,
        get("Texture") / 100.0,
        get("Dehaze") / 100.0,
    )
    if clarity or texture:
        L = luma(np.clip(rgb, 0, 1))
        detail = np.zeros_like(L)
        if clarity:
            detail += clarity * 0.55 * (L - blur(L, 22.0))
        if texture:
            detail += texture * 0.45 * (L - blur(L, 4.0))
        # protect the very ends, the way Camera Raw does
        guard = smoothstep(0.0, 0.18, L) * (1.0 - smoothstep(0.82, 1.0, L))
        rgb = np.clip(scale_to_luma(rgb, L, np.clip(L + detail * guard, 0, 1)), 0, 1.5)

    if dehaze:
        L = luma(np.clip(rgb, 0, 1))
        rgb = np.clip((rgb - 0.5) * (1.0 + dehaze * 0.30) + 0.5 - dehaze * 0.02, 0, 1.5)
        if dehaze > 0:
            hsv = rgb_to_hsv(np.clip(rgb, 0, 1))
            # Only saturation is clamped here. Hue is in degrees, so clipping
            # the whole array to 0..1 would flatten every hue to red.
            hsv[..., 1] = np.clip(hsv[..., 1] * (1.0 + dehaze * 0.20), 0.0, 1.0)
            rgb = hsv_to_rgb(hsv)

    rgb = np.clip(rgb, 0.0, 1.0)

    # --- tone curves, per channel like Camera Raw
    if "rgb" in curves:
        rgb = np.stack([spline(curves["rgb"], rgb[..., c]) for c in range(3)], -1)
    for index, channel in enumerate(("red", "green", "blue")):
        if channel in curves:
            rgb[..., index] = spline(curves[channel], rgb[..., index])
    rgb = np.clip(rgb, 0.0, 1.0)

    # --- HSL / colour mixer
    hue_adj = np.array([get(f"HueAdjustment{b}") for b in BAND_NAMES])
    sat_adj = np.array([get(f"SaturationAdjustment{b}") for b in BAND_NAMES])
    lum_adj = np.array([get(f"LuminanceAdjustment{b}") for b in BAND_NAMES])
    grey_mix = np.array([get(f"GrayMixer{b}") for b in BAND_NAMES])
    mono = str(s.get("ConvertToGrayscale", "False")) == "True"

    needs_bands = mono or hue_adj.any() or sat_adj.any() or lum_adj.any()
    if needs_bands:
        hsv = rgb_to_hsv(rgb)
        weights = band_weights(hsv[..., 0])
        colourfulness = np.clip(hsv[..., 1] * 2.2, 0, 1)  # greys must not shift

        if hue_adj.any():
            hsv[..., 0] = (hsv[..., 0] + (weights @ hue_adj) * 0.30 * colourfulness) % 360
        if sat_adj.any():
            hsv[..., 1] = np.clip(hsv[..., 1] * (1.0 + (weights @ sat_adj) / 100.0), 0, 1)
        rgb = hsv_to_rgb(hsv)

        if lum_adj.any():
            L = luma(rgb)
            factor = 1.0 + (weights @ lum_adj) / 100.0 * 0.55 * colourfulness
            rgb = np.clip(scale_to_luma(rgb, L, np.clip(L * factor, 0, 1)), 0, 1)

        if mono:
            L = luma(rgb)
            if grey_mix.any():
                L = np.clip(L * (1.0 + (weights @ grey_mix) / 100.0 * 0.85 * colourfulness), 0, 1)
            rgb = np.repeat(L[..., None], 3, axis=2)

    # --- global vibrance and saturation
    vibrance, saturation = get("Vibrance") / 100.0, get("Saturation") / 100.0
    if (vibrance or saturation) and not mono:
        hsv = rgb_to_hsv(rgb)
        if vibrance:
            # vibrance leans on the least saturated pixels
            hsv[..., 1] = np.clip(hsv[..., 1] * (1.0 + vibrance * (1.0 - hsv[..., 1]) * 0.9), 0, 1)
        if saturation:
            hsv[..., 1] = np.clip(hsv[..., 1] * (1.0 + saturation), 0, 1)
        rgb = hsv_to_rgb(hsv)

    # --- colour grading, including on monochrome (that is how toning works)
    L = luma(rgb)
    blending = get("ColorGradeBlending", 50.0) / 100.0
    width = 0.22 + 0.55 * blending
    regions = (
        ("Shadow", 1.0 - smoothstep(0.0, width + 0.28, L)),
        ("Midtone", np.exp(-(((L - 0.5) / (width * 0.9 + 0.12)) ** 2))),
        ("Highlight", smoothstep(1.0 - width - 0.28, 1.0, L)),
        ("Global", np.ones_like(L)),
    )
    for name, mask in regions:
        sat_value = get(f"ColorGrade{name}Sat")
        lum_value = get(f"ColorGrade{name}Lum")
        if not sat_value and not lum_value:
            continue
        if sat_value:
            hue_value = get(f"ColorGrade{name}Hue")
            tint = hsv_to_rgb(np.array([[[hue_value, 1.0, 1.0]]], dtype=np.float32))[0, 0]
            strength = (sat_value / 100.0) * 0.45 * mask
            rgb = rgb + strength[..., None] * (tint - luma(rgb)[..., None])
        if lum_value:
            rgb *= 1.0 + (lum_value / 100.0) * 0.35 * mask[..., None]
    rgb = np.clip(rgb, 0.0, 1.0)

    # --- post-crop vignette
    amount = get("PostCropVignetteAmount") / 100.0
    if amount:
        h, w = rgb.shape[:2]
        yy, xx = np.mgrid[0:h, 0:w]
        roundness = get("PostCropVignetteRoundness") / 100.0
        nx = (xx - w / 2) / (w / 2)
        ny = (yy - h / 2) / (h / 2)
        radius = np.sqrt(nx**2 + ny**2) / np.sqrt(2) ** (1.0 - 0.5 * (roundness + 1))
        midpoint = get("PostCropVignetteMidpoint", 50.0) / 100.0
        feather = max(get("PostCropVignetteFeather", 50.0) / 100.0, 0.05)
        mask = smoothstep(midpoint * 0.9, midpoint * 0.9 + feather, radius)
        rgb = np.clip(rgb * (1.0 + amount * 0.75 * mask[..., None]), 0, 1)

    # --- grain
    grain = get("GrainAmount") / 100.0
    if grain:
        h, w = rgb.shape[:2]
        rng = np.random.default_rng(7)  # fixed, so rebuilds do not churn
        noise = rng.normal(0.0, 1.0, (h, w)).astype(np.float32)
        size = get("GrainSize", 25.0)
        if size > 10:
            noise = blur(noise * 0.2 + 0.5, size / 22.0) * 5.0 - 2.5
        L = luma(rgb)
        midtone = 1.0 - np.abs(L - 0.5) * 1.4
        rgb = np.clip(rgb + (noise * grain * 0.085 * np.clip(midtone, 0.15, 1))[..., None], 0, 1)

    return np.clip(rgb, 0.0, 1.0)


def render(image_path: Path, preset_path: Path) -> Image.Image:
    source = Image.open(image_path).convert("RGB")
    array = np.asarray(source, dtype=np.float32) / 255.0
    settings, curves = parse_xmp(preset_path)
    out = apply_preset(array, settings, curves)
    # A little noise before quantising breaks up banding in big smooth
    # gradients like skies. Well below one 8-bit step, so it is not visible
    # as noise itself.
    rng = np.random.default_rng(11)
    out = out + rng.uniform(-0.4, 0.4, out.shape).astype(np.float32) / 255.0
    return Image.fromarray(np.clip(out * 255.0 + 0.5, 0, 255).astype(np.uint8), "RGB")


def self_test() -> int:
    """Sanity checks that do not need a photo or a preset on disk."""
    checks = []

    grey = np.full((8, 8, 3), 0.5, dtype=np.float32)
    out = apply_preset(grey.copy(), {}, {})
    checks.append(("empty preset is a no-op", np.allclose(out, grey, atol=1e-3)))

    out = apply_preset(grey.copy(), {"Exposure2012": 1.0}, {})
    checks.append(("exposure +1 brightens", out.mean() > 0.66))

    ramp = np.linspace(0, 1, 64, dtype=np.float32)
    ramp = np.repeat(np.repeat(ramp[None, :, None], 8, 0), 3, 2)
    out = apply_preset(ramp.copy(), {"Contrast2012": 50.0}, {})
    dark, bright = out[:, :16].mean(), out[:, -16:].mean()
    checks.append(("contrast separates ends", dark < ramp[:, :16].mean() + 1e-3 and bright > ramp[:, -16:].mean() - 1e-3))

    colour = np.zeros((4, 4, 3), dtype=np.float32)
    colour[..., 0] = 0.8
    colour[..., 1] = 0.2
    colour[..., 2] = 0.2
    out = apply_preset(colour.copy(), {"ConvertToGrayscale": "True"}, {})
    checks.append(("grayscale is neutral", np.allclose(out[..., 0], out[..., 2], atol=1e-3)))

    out = apply_preset(grey.copy(), {"Saturation": -100.0}, {})
    checks.append(("desaturation keeps grey grey", np.allclose(out, grey, atol=0.02)))

    teal = np.zeros((4, 4, 3), dtype=np.float32)
    teal[..., 0], teal[..., 1], teal[..., 2] = 0.15, 0.65, 0.70
    before = rgb_to_hsv(teal)[..., 0].mean()
    for setting in ({"Dehaze": 20.0}, {"Clarity2012": 40.0}, {"Texture": 40.0}, {"Vibrance": 40.0}):
        after = rgb_to_hsv(apply_preset(teal.copy(), setting, {}))[..., 0].mean()
        checks.append(
            (f"hue survives {list(setting)[0]}", abs(after - before) < 12.0)
        )

    weights = band_weights(np.array([0.0, 30.0, 120.0, 359.0], dtype=np.float32))
    checks.append(("band weights sum to 1", np.allclose(weights.sum(-1), 1.0, atol=1e-4)))

    curve = [(0.0, 0.0), (0.5, 0.5), (1.0, 1.0)]
    x = np.linspace(0, 1, 32)
    checks.append(("identity curve is identity", np.allclose(spline(curve, x), x, atol=1e-3)))

    lifted = spline([(0.0, 0.1), (0.5, 0.55), (1.0, 0.95)], np.array([0.0]))
    checks.append(("lifted curve lifts black", abs(lifted[0] - 0.1) < 1e-6))

    failed = 0
    for name, ok in checks:
        print(f"  {'PASS' if ok else 'FAIL'}  {name}")
        failed += 0 if ok else 1
    print(f"{len(checks) - failed}/{len(checks)} checks passed")
    return 1 if failed else 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("image", nargs="?")
    parser.add_argument("preset", nargs="?")
    parser.add_argument("output", nargs="?")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        return self_test()
    if not (args.image and args.preset and args.output):
        parser.error("need image, preset and output (or --self-test)")

    render(Path(args.image), Path(args.preset)).save(args.output, quality=95)
    print(f"wrote {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
