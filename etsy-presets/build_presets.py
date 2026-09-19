#!/usr/bin/env python3
"""Build sellable Lightroom preset packs from JSON pack definitions.

Each pack in packs/*.json is rendered into:

    dist/<pack-id>/<Pack Name> Presets/*.xmp   Camera Raw / Lightroom presets
    dist/<pack-id>/INSTALL.txt                 install guide (desktop + mobile)
    dist/<pack-id>/LICENSE.txt                 usage terms for the buyer
    dist/<pack-id>/READ-ME-FIRST.txt           short orientation page
    dist/zips/<Pack Name> Lightroom Presets.zip  the Etsy download
    dist/zips/<Bundle> Lightroom Preset Bundle.zip

The .xmp files are plain Camera Raw settings XML, which is what Lightroom
Classic, Lightroom desktop (CC), and Lightroom mobile all import.

Usage:
    python3 build_presets.py              # build everything into dist/
    python3 build_presets.py --clean      # wipe dist/ first
    python3 build_presets.py --pack golden-hour
"""

from __future__ import annotations

import argparse
import json
import shutil
import uuid
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent
PACKS_DIR = ROOT / "packs"
TEMPLATES_DIR = ROOT / "templates"
DIST_DIR = ROOT / "dist"

# Stable namespace so rebuilding a pack keeps the same preset UUIDs. Lightroom
# treats the UUID as the preset identity, so churning it on every build would
# make updated packs import as duplicates for buyers.
UUID_NAMESPACE = uuid.UUID("6f1d2c7a-4e58-5b1e-9a3d-2f7c8b6e4a10")

XMPTK = "Adobe XMP Core 5.6-c140 79.160451, 2017/05/06-01:08:21"

# Fixed timestamp for zip entries. Any valid date works; pinning it is what
# makes the build reproducible.
ZIP_TIMESTAMP = (1980, 1, 1, 0, 0, 0)

# Camera Raw settings this kit understands.
#
#   kind   : int | float | bool | str
#   signed : write an explicit +/- sign, the way Lightroom writes deltas
#   lo/hi  : accepted range, enforced at build time so a typo in a pack file
#            fails loudly instead of shipping a broken preset
INT = "int"
FLOAT = "float"
BOOL = "bool"
STR = "str"

_TONE = {
    "Exposure2012": (FLOAT, True, -5.0, 5.0),
    "Contrast2012": (INT, True, -100, 100),
    "Highlights2012": (INT, True, -100, 100),
    "Shadows2012": (INT, True, -100, 100),
    "Whites2012": (INT, True, -100, 100),
    "Blacks2012": (INT, True, -100, 100),
}

_PRESENCE = {
    "Texture": (INT, True, -100, 100),
    "Clarity2012": (INT, True, -100, 100),
    "Dehaze": (INT, True, -100, 100),
    "Vibrance": (INT, True, -100, 100),
    "Saturation": (INT, True, -100, 100),
}

# Relative white balance. Presets must never ship absolute Kelvin values:
# "Temperature=5200" would force every photo to the same white balance
# regardless of what it was shot under. Incremental shifts the photo's own
# setting, which is what a look actually wants.
_WHITE_BALANCE = {
    "IncrementalTemperature": (INT, True, -100, 100),
    "IncrementalTint": (INT, True, -100, 100),
}

_COLOR_BANDS = ("Red", "Orange", "Yellow", "Green", "Aqua", "Blue", "Purple", "Magenta")
_HSL = {
    f"{prefix}Adjustment{band}": (INT, True, -100, 100)
    for prefix in ("Hue", "Saturation", "Luminance")
    for band in _COLOR_BANDS
}
_GRAY_MIXER = {f"GrayMixer{band}": (INT, True, -100, 100) for band in _COLOR_BANDS}

_COLOR_GRADING = {}
for _region in ("Shadow", "Midtone", "Highlight", "Global"):
    _COLOR_GRADING[f"ColorGrade{_region}Hue"] = (INT, False, 0, 359)
    _COLOR_GRADING[f"ColorGrade{_region}Sat"] = (INT, False, 0, 100)
    _COLOR_GRADING[f"ColorGrade{_region}Lum"] = (INT, True, -100, 100)
_COLOR_GRADING["ColorGradeBlending"] = (INT, False, 0, 100)

_DETAIL = {
    "Sharpness": (INT, False, 0, 150),
    "SharpenRadius": (FLOAT, False, 0.5, 3.0),
    "SharpenDetail": (INT, False, 0, 100),
    "SharpenEdgeMasking": (INT, False, 0, 100),
    "LuminanceSmoothing": (INT, False, 0, 100),
    "ColorNoiseReduction": (INT, False, 0, 100),
}

_EFFECTS = {
    "PostCropVignetteAmount": (INT, True, -100, 100),
    "PostCropVignetteMidpoint": (INT, False, 0, 100),
    "PostCropVignetteFeather": (INT, False, 0, 100),
    "PostCropVignetteRoundness": (INT, True, -100, 100),
    "PostCropVignetteStyle": (INT, False, 1, 3),
    "GrainAmount": (INT, False, 0, 100),
    "GrainSize": (INT, False, 0, 100),
    "GrainFrequency": (INT, False, 0, 100),
}

_CALIBRATION = {
    "ShadowTint": (INT, True, -100, 100),
    "RedHue": (INT, True, -100, 100),
    "RedSaturation": (INT, True, -100, 100),
    "GreenHue": (INT, True, -100, 100),
    "GreenSaturation": (INT, True, -100, 100),
    "BlueHue": (INT, True, -100, 100),
    "BlueSaturation": (INT, True, -100, 100),
}

_TREATMENT = {
    "ConvertToGrayscale": (BOOL, False, None, None),
    "CameraProfile": (STR, False, None, None),
}

PARAM_SPEC: dict[str, tuple] = {
    **_TONE,
    **_PRESENCE,
    **_WHITE_BALANCE,
    **_HSL,
    **_GRAY_MIXER,
    **_COLOR_GRADING,
    **_DETAIL,
    **_EFFECTS,
    **_CALIBRATION,
    **_TREATMENT,
}

# Order the attributes are written in, so diffs between builds stay readable.
PARAM_ORDER = (
    list(_TREATMENT)
    + list(_WHITE_BALANCE)
    + list(_TONE)
    + list(_PRESENCE)
    + list(_DETAIL)
    + list(_HSL)
    + list(_GRAY_MIXER)
    + list(_CALIBRATION)
    + list(_COLOR_GRADING)
    + list(_EFFECTS)
)

CURVE_CHANNELS = {
    "rgb": "ToneCurvePV2012",
    "red": "ToneCurvePV2012Red",
    "green": "ToneCurvePV2012Green",
    "blue": "ToneCurvePV2012Blue",
}


class PackError(ValueError):
    """A pack definition is invalid. Raised with enough detail to fix it."""


def format_value(key: str, value) -> str:
    """Render one setting the way Camera Raw writes it."""
    kind, signed, lo, hi = PARAM_SPEC[key]

    if kind == BOOL:
        if not isinstance(value, bool):
            raise PackError(f"{key} must be true/false, got {value!r}")
        return "True" if value else "False"

    if kind == STR:
        return str(value)

    if not isinstance(value, (int, float)) or isinstance(value, bool):
        raise PackError(f"{key} must be a number, got {value!r}")
    if value < lo or value > hi:
        raise PackError(f"{key}={value} is outside the allowed range {lo}..{hi}")

    if kind == FLOAT:
        text = f"{abs(value):.2f}"
    else:
        if float(value) != int(value):
            raise PackError(f"{key}={value} must be a whole number")
        text = str(abs(int(value)))

    if signed and value != 0:
        return f"-{text}" if value < 0 else f"+{text}"
    return text


def validate_curve(channel: str, points) -> list[tuple[int, int]]:
    if not isinstance(points, list) or len(points) < 2:
        raise PackError(f"curve '{channel}' needs at least two points")
    cleaned: list[tuple[int, int]] = []
    for point in points:
        if not isinstance(point, list) or len(point) != 2:
            raise PackError(f"curve '{channel}' point {point!r} must be [input, output]")
        x, y = point
        for axis in (x, y):
            if not isinstance(axis, int) or isinstance(axis, bool) or not 0 <= axis <= 255:
                raise PackError(f"curve '{channel}' value {axis!r} must be an int 0..255")
        cleaned.append((x, y))
    inputs = [x for x, _ in cleaned]
    if inputs != sorted(inputs) or len(set(inputs)) != len(inputs):
        raise PackError(f"curve '{channel}' inputs must strictly increase: {inputs}")
    return cleaned


def merge_settings(base: dict, override: dict) -> dict:
    merged = dict(base)
    merged.update(override)
    return merged


def merge_curves(base: dict, override: dict) -> dict:
    """Curves merge per channel; a preset replaces a whole channel or inherits it."""
    merged = {k: list(v) for k, v in base.items()}
    merged.update({k: list(v) for k, v in override.items()})
    return merged


def preset_uuid(pack_id: str, preset_name: str) -> str:
    return uuid.uuid5(UUID_NAMESPACE, f"{pack_id}:{preset_name}").hex.upper()


def render_preset(pack: dict, preset: dict) -> str:
    """Render one preset as a Camera Raw .xmp document."""
    settings = merge_settings(pack.get("base", {}), preset.get("settings", {}))
    curves = merge_curves(pack.get("baseCurves", {}), preset.get("curves", {}))

    unknown = sorted(set(settings) - set(PARAM_SPEC))
    if unknown:
        raise PackError(f"unknown setting(s) {unknown} in preset '{preset['name']}'")
    unknown_curves = sorted(set(curves) - set(CURVE_CHANNELS))
    if unknown_curves:
        raise PackError(f"unknown curve channel(s) {unknown_curves} in '{preset['name']}'")

    attributes = [
        ("crs:PresetType", "Normal"),
        ("crs:Cluster", ""),
        ("crs:UUID", preset_uuid(pack["id"], preset["name"])),
        ("crs:SupportsAmount", "True"),
        ("crs:SupportsAmount2", "True"),
        ("crs:SupportsColor", "True"),
        ("crs:SupportsMonochrome", "True"),
        ("crs:SupportsHighDynamicRange", "True"),
        ("crs:SupportsNormalDynamicRange", "True"),
        ("crs:SupportsSceneReferred", "True"),
        ("crs:SupportsOutputReferred", "True"),
        ("crs:CameraModelRestriction", ""),
        ("crs:Copyright", pack.get("copyright", "")),
        ("crs:ContactInfo", pack.get("contactInfo", "")),
        ("crs:Version", pack.get("crsVersion", "15.4")),
    ]

    # Process Version is deliberately omitted by default. Pinning it (to
    # "11.0" / PV2012, as many preset shops do) forces every photo the buyer
    # applies the preset to onto that older rendering engine, which changes
    # highlight and shadow behaviour and flags the photo as out of date in
    # current Lightroom. Leaving it out lets each photo keep its own.
    if pack.get("processVersion"):
        attributes.append(("crs:ProcessVersion", pack["processVersion"]))

    for key in PARAM_ORDER:
        if key in settings:
            attributes.append((f"crs:{key}", format_value(key, settings[key])))

    if curves:
        attributes.append(("crs:ToneCurveName2012", "Custom"))
    attributes.append(("crs:HasSettings", "True"))

    attribute_block = "\n".join(
        f'    {name}="{escape(str(value), {chr(34): "&quot;"})}"' for name, value in attributes
    )

    lines = [
        '<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="%s">' % XMPTK,
        ' <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">',
        '  <rdf:Description rdf:about=""',
        '    xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/"',
        attribute_block + ">",
        "   <crs:Name>",
        "    <rdf:Alt>",
        f'     <rdf:li xml:lang="x-default">{escape(preset["name"])}</rdf:li>',
        "    </rdf:Alt>",
        "   </crs:Name>",
        "   <crs:ShortName>",
        "    <rdf:Alt>",
        f'     <rdf:li xml:lang="x-default">{escape(preset.get("shortName", preset["name"]))}</rdf:li>',
        "    </rdf:Alt>",
        "   </crs:ShortName>",
        "   <crs:SortName>",
        "    <rdf:Alt>",
        f'     <rdf:li xml:lang="x-default">{escape(preset.get("sortName", preset["name"]))}</rdf:li>',
        "    </rdf:Alt>",
        "   </crs:SortName>",
        "   <crs:Group>",
        "    <rdf:Alt>",
        f'     <rdf:li xml:lang="x-default">{escape(pack["group"])}</rdf:li>',
        "    </rdf:Alt>",
        "   </crs:Group>",
        "   <crs:Description>",
        "    <rdf:Alt>",
        f'     <rdf:li xml:lang="x-default">{escape(preset.get("description", ""))}</rdf:li>',
        "    </rdf:Alt>",
        "   </crs:Description>",
    ]

    for channel, attribute in CURVE_CHANNELS.items():
        if channel not in curves:
            continue
        points = validate_curve(channel, curves[channel])
        lines.append(f"   <crs:{attribute}>")
        lines.append("    <rdf:Seq>")
        lines.extend(f"     <rdf:li>{x}, {y}</rdf:li>" for x, y in points)
        lines.append("    </rdf:Seq>")
        lines.append(f"   </crs:{attribute}>")

    lines += [
        "  </rdf:Description>",
        " </rdf:RDF>",
        "</x:xmpmeta>",
        "",
    ]
    return "\n".join(lines)


def safe_filename(name: str) -> str:
    keep = [c if (c.isalnum() or c in " -_.") else "-" for c in name]
    return "".join(keep).strip()


def load_pack(path: Path) -> dict:
    try:
        pack = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise PackError(f"{path.name} is not valid JSON: {exc}") from exc

    for field in ("id", "name", "group", "presets"):
        if field not in pack:
            raise PackError(f"{path.name} is missing required field '{field}'")
    if not pack["presets"]:
        raise PackError(f"{path.name} has no presets")

    names = [p.get("name") for p in pack["presets"]]
    if any(not n for n in names):
        raise PackError(f"{path.name} has a preset without a name")
    duplicates = {n for n in names if names.count(n) > 1}
    if duplicates:
        raise PackError(f"{path.name} has duplicate preset names: {sorted(duplicates)}")
    return pack


def render_template(name: str, pack: dict) -> str:
    text = (TEMPLATES_DIR / name).read_text(encoding="utf-8")
    fields = {
        "PACK_NAME": pack["name"],
        "PACK_GROUP": pack["group"],
        "PACK_TAGLINE": pack.get("tagline", ""),
        "PRESET_COUNT": str(len(pack["presets"])),
        "PRESET_LIST": "\n".join(f"  - {p['name']}" for p in pack["presets"]),
        "BRAND": pack.get("brand", "SoftSmith Presets"),
        "SUPPORT_EMAIL": pack.get("supportEmail", "your-shop-email@example.com"),
    }
    for key, value in fields.items():
        text = text.replace("{{" + key + "}}", value)
    return text


def build_pack(pack: dict, verbose: bool = True) -> Path:
    pack_dir = DIST_DIR / pack["id"]
    presets_dir = pack_dir / f"{pack['name']} Presets"
    if pack_dir.exists():
        shutil.rmtree(pack_dir)
    presets_dir.mkdir(parents=True)

    for index, preset in enumerate(pack["presets"], start=1):
        document = render_preset(pack, preset)
        filename = f"{index:02d} {safe_filename(preset['name'])}.xmp"
        (presets_dir / filename).write_text(document, encoding="utf-8")

    for template_name, output_name in (
        ("INSTALL.txt", "INSTALL.txt"),
        ("LICENSE.txt", "LICENSE.txt"),
        ("READ-ME-FIRST.txt", "READ-ME-FIRST.txt"),
    ):
        (pack_dir / output_name).write_text(render_template(template_name, pack), encoding="utf-8")

    if verbose:
        print(f"  {pack['name']}: {len(pack['presets'])} presets -> {presets_dir.relative_to(ROOT)}")
    return pack_dir


def zip_directory(source: Path, target: Path, arc_root: str = "") -> None:
    """Write a reproducible zip.

    Entry timestamps are pinned and entries are sorted, so rebuilding an
    unchanged pack produces a byte-identical file. That keeps the committed
    downloads from churning in git on every build.
    """
    target.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(source.rglob("*")):
            if not path.is_file():
                continue
            relative = path.relative_to(source)
            arcname = str(Path(arc_root) / relative) if arc_root else str(relative)
            info = zipfile.ZipInfo(arcname, date_time=ZIP_TIMESTAMP)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            archive.writestr(info, path.read_bytes())


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pack", help="build a single pack by id")
    parser.add_argument("--clean", action="store_true", help="remove dist/ before building")
    parser.add_argument("--no-zip", action="store_true", help="skip zip creation")
    args = parser.parse_args()

    if args.clean and DIST_DIR.exists():
        shutil.rmtree(DIST_DIR)

    pack_files = sorted(PACKS_DIR.glob("*.json"))
    if not pack_files:
        print(f"No pack definitions found in {PACKS_DIR}")
        return 1

    packs = [load_pack(path) for path in pack_files]
    if args.pack:
        packs = [p for p in packs if p["id"] == args.pack]
        if not packs:
            print(f"No pack with id '{args.pack}'")
            return 1

    print(f"Building {len(packs)} pack(s) into {DIST_DIR.relative_to(ROOT)}/")
    built = [(pack, build_pack(pack)) for pack in packs]

    if not args.no_zip:
        zips_dir = DIST_DIR / "zips"
        for pack, pack_dir in built:
            zip_path = zips_dir / f"{pack['name']} Lightroom Presets.zip"
            zip_directory(pack_dir, zip_path)
            print(f"  zip: {zip_path.relative_to(ROOT)} ({zip_path.stat().st_size // 1024} KB)")

        if len(built) > 1:
            bundle_dir = DIST_DIR / "_bundle"
            if bundle_dir.exists():
                shutil.rmtree(bundle_dir)
            bundle_dir.mkdir(parents=True)
            for pack, pack_dir in built:
                shutil.copytree(pack_dir, bundle_dir / pack["name"])
            bundle_zip = zips_dir / "SoftSmith Lightroom Preset Bundle.zip"
            zip_directory(bundle_dir, bundle_zip)
            shutil.rmtree(bundle_dir)
            print(f"  zip: {bundle_zip.relative_to(ROOT)} ({bundle_zip.stat().st_size // 1024} KB)")

    total = sum(len(pack["presets"]) for pack, _ in built)
    print(f"Done. {total} presets across {len(built)} pack(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
