"""Checks that every generated preset is something safe to sell.

Run from the etsy-presets folder:
    python3 -m unittest discover -s tests -v
"""

import sys
import tempfile
import unittest
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import build_presets as bp  # noqa: E402

NS = {
    "x": "adobe:ns:meta/",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "crs": "http://ns.adobe.com/camera-raw-settings/1.0/",
}

PACK_FILES = sorted(bp.PACKS_DIR.glob("*.json"))
PACKS = [bp.load_pack(path) for path in PACK_FILES]


def rendered_documents():
    for pack in PACKS:
        for preset in pack["presets"]:
            yield pack, preset, bp.render_preset(pack, preset)


class TestPackDefinitions(unittest.TestCase):
    def test_packs_exist(self):
        self.assertGreaterEqual(len(PACKS), 1, "no pack definitions found")

    def test_pack_ids_and_groups_are_unique(self):
        ids = [p["id"] for p in PACKS]
        groups = [p["group"] for p in PACKS]
        self.assertEqual(len(ids), len(set(ids)), "duplicate pack ids")
        self.assertEqual(len(groups), len(set(groups)), "duplicate Lightroom group names")

    def test_every_preset_has_a_description(self):
        for pack in PACKS:
            for preset in pack["presets"]:
                with self.subTest(pack=pack["id"], preset=preset["name"]):
                    self.assertTrue(
                        preset.get("description", "").strip(),
                        "buyers see this text in Lightroom, it should not be blank",
                    )

    def test_presets_differ_from_the_pack_base(self):
        """Preset 01 is the base look, the rest must actually change something."""
        for pack in PACKS:
            for preset in pack["presets"][1:]:
                with self.subTest(pack=pack["id"], preset=preset["name"]):
                    self.assertTrue(
                        preset.get("settings") or preset.get("curves"),
                        "preset is identical to the pack base",
                    )


class TestRenderedXmp(unittest.TestCase):
    def test_documents_are_well_formed_xml(self):
        for pack, preset, document in rendered_documents():
            with self.subTest(pack=pack["id"], preset=preset["name"]):
                ET.fromstring(document)

    def test_name_and_group_are_readable_by_lightroom(self):
        for pack, preset, document in rendered_documents():
            with self.subTest(pack=pack["id"], preset=preset["name"]):
                root = ET.fromstring(document)
                name = root.find(".//crs:Name/rdf:Alt/rdf:li", NS)
                group = root.find(".//crs:Group/rdf:Alt/rdf:li", NS)
                self.assertIsNotNone(name)
                self.assertIsNotNone(group)
                self.assertEqual(name.text, preset["name"])
                self.assertEqual(group.text, pack["group"])

    def test_has_settings_flag_is_set(self):
        """Without HasSettings, Lightroom imports the preset as an empty look."""
        for pack, preset, document in rendered_documents():
            with self.subTest(pack=pack["id"], preset=preset["name"]):
                self.assertIn('crs:HasSettings="True"', document)

    def test_never_writes_absolute_white_balance(self):
        """Absolute Kelvin would force every photo to one white balance."""
        for pack, preset, document in rendered_documents():
            with self.subTest(pack=pack["id"], preset=preset["name"]):
                self.assertNotIn('crs:Temperature=', document)
                self.assertNotIn('crs:Tint=', document)

    def test_never_writes_crop_or_orientation(self):
        """A preset that crops or rotates the buyer's photo is a support ticket."""
        forbidden = ("crs:CropTop", "crs:CropLeft", "crs:HasCrop", "crs:Orientation")
        for pack, preset, document in rendered_documents():
            with self.subTest(pack=pack["id"], preset=preset["name"]):
                for token in forbidden:
                    self.assertNotIn(token, document)

    def test_uuids_are_unique_across_every_pack(self):
        seen = {}
        for pack, preset, document in rendered_documents():
            root = ET.fromstring(document)
            uuid_value = root.find(".//rdf:Description", NS).get(f"{{{NS['crs']}}}UUID")
            self.assertIsNotNone(uuid_value)
            self.assertNotIn(uuid_value, seen, f"UUID clash with {seen.get(uuid_value)}")
            seen[uuid_value] = f"{pack['id']}/{preset['name']}"
        self.assertEqual(len(seen), sum(len(p["presets"]) for p in PACKS))

    def test_uuids_are_stable_between_builds(self):
        """Buyers who update a pack should not get duplicate presets."""
        first = bp.preset_uuid("golden-hour", "Golden Hour 01 Soft Warm")
        second = bp.preset_uuid("golden-hour", "Golden Hour 01 Soft Warm")
        self.assertEqual(first, second)
        self.assertEqual(len(first), 32)

    def test_tone_curve_points_are_written_in_order(self):
        for pack, preset, document in rendered_documents():
            root = ET.fromstring(document)
            seq = root.find(".//crs:ToneCurvePV2012/rdf:Seq", NS)
            if seq is None:
                continue
            with self.subTest(pack=pack["id"], preset=preset["name"]):
                inputs = [int(li.text.split(",")[0]) for li in seq]
                self.assertEqual(inputs, sorted(inputs))

    def test_monochrome_pack_converts_to_grayscale(self):
        mono = [p for p in PACKS if p["id"] == "mono-editorial"]
        self.assertTrue(mono, "mono-editorial pack missing")
        for preset in mono[0]["presets"]:
            document = bp.render_preset(mono[0], preset)
            with self.subTest(preset=preset["name"]):
                self.assertIn('crs:ConvertToGrayscale="True"', document)


class TestValueFormatting(unittest.TestCase):
    def test_signed_values_carry_an_explicit_sign(self):
        self.assertEqual(bp.format_value("Contrast2012", 12), "+12")
        self.assertEqual(bp.format_value("Contrast2012", -12), "-12")

    def test_zero_is_written_without_a_sign(self):
        self.assertEqual(bp.format_value("Contrast2012", 0), "0")
        self.assertEqual(bp.format_value("Exposure2012", 0), "0.00")

    def test_exposure_uses_two_decimals(self):
        self.assertEqual(bp.format_value("Exposure2012", 0.5), "+0.50")
        self.assertEqual(bp.format_value("Exposure2012", -0.25), "-0.25")

    def test_unsigned_values_have_no_sign(self):
        self.assertEqual(bp.format_value("GrainAmount", 24), "24")
        self.assertEqual(bp.format_value("ColorGradeShadowHue", 210), "210")

    def test_booleans_render_as_lightroom_expects(self):
        self.assertEqual(bp.format_value("ConvertToGrayscale", True), "True")
        self.assertEqual(bp.format_value("ConvertToGrayscale", False), "False")

    def test_out_of_range_values_are_rejected(self):
        with self.assertRaises(bp.PackError):
            bp.format_value("Contrast2012", 140)
        with self.assertRaises(bp.PackError):
            bp.format_value("Exposure2012", -9)

    def test_fractional_value_for_an_integer_setting_is_rejected(self):
        with self.assertRaises(bp.PackError):
            bp.format_value("Contrast2012", 12.5)


class TestValidation(unittest.TestCase):
    def test_unknown_setting_is_rejected(self):
        pack = {"id": "t", "name": "T", "group": "T", "base": {}, "presets": []}
        preset = {"name": "x", "settings": {"Contrst2012": 5}}
        with self.assertRaises(bp.PackError) as ctx:
            bp.render_preset(pack, preset)
        self.assertIn("Contrst2012", str(ctx.exception))

    def test_curve_must_increase(self):
        with self.assertRaises(bp.PackError):
            bp.validate_curve("rgb", [[0, 0], [128, 60], [64, 200]])

    def test_curve_rejects_out_of_range_points(self):
        with self.assertRaises(bp.PackError):
            bp.validate_curve("rgb", [[0, 0], [300, 200]])

    def test_curve_needs_at_least_two_points(self):
        with self.assertRaises(bp.PackError):
            bp.validate_curve("rgb", [[0, 0]])

    def test_duplicate_preset_names_are_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "bad.json"
            path.write_text(
                '{"id":"bad","name":"Bad","group":"Bad","presets":'
                '[{"name":"One"},{"name":"One"}]}',
                encoding="utf-8",
            )
            with self.assertRaises(bp.PackError):
                bp.load_pack(path)


class TestDeliverables(unittest.TestCase):
    """The zip is the product. Check it is complete and importable."""

    @classmethod
    def setUpClass(cls):
        cls.zips = sorted((bp.DIST_DIR / "zips").glob("*.zip"))

    def test_a_zip_exists_for_every_pack(self):
        self.assertTrue(self.zips, "run build_presets.py before the tests")
        names = " ".join(z.name for z in self.zips)
        for pack in PACKS:
            with self.subTest(pack=pack["id"]):
                self.assertIn(pack["name"], names)

    def test_each_zip_carries_presets_and_paperwork(self):
        for zip_path in self.zips:
            if "Bundle" in zip_path.name:
                continue
            with self.subTest(zip=zip_path.name):
                with zipfile.ZipFile(zip_path) as archive:
                    entries = archive.namelist()
                xmps = [e for e in entries if e.endswith(".xmp")]
                self.assertEqual(len(xmps), 10)
                for required in ("INSTALL.txt", "LICENSE.txt", "READ-ME-FIRST.txt"):
                    self.assertTrue(
                        any(e.endswith(required) for e in entries),
                        f"{required} missing from {zip_path.name}",
                    )

    def test_no_template_placeholder_survives_into_the_download(self):
        for zip_path in self.zips:
            with self.subTest(zip=zip_path.name):
                with zipfile.ZipFile(zip_path) as archive:
                    for entry in archive.namelist():
                        if entry.endswith(".txt"):
                            text = archive.read(entry).decode("utf-8")
                            self.assertNotIn("{{", text, f"unfilled placeholder in {entry}")

    def test_bundle_contains_every_pack(self):
        bundle = [z for z in self.zips if "Bundle" in z.name]
        self.assertTrue(bundle, "bundle zip missing")
        with zipfile.ZipFile(bundle[0]) as archive:
            entries = archive.namelist()
        xmps = [e for e in entries if e.endswith(".xmp")]
        self.assertEqual(len(xmps), sum(len(p["presets"]) for p in PACKS))



class TestListingCopy(unittest.TestCase):
    """Etsy silently rejects over-long titles and tags. Catch it here instead."""

    MAX_TITLE = 140
    MAX_TAG = 20
    MAX_TAGS = 13

    @classmethod
    def setUpClass(cls):
        path = bp.ROOT / "listings" / "etsy-listings.md"
        cls.lines = path.read_text(encoding="utf-8").splitlines()
        cls.titles = {}
        cls.tags = {}
        section = None
        expecting_title = False
        for line in cls.lines:
            if line.startswith("## "):
                section = line[3:].strip()
                expecting_title = False
            elif line.strip() == "**Title**":
                expecting_title = True
            elif expecting_title and line.strip():
                cls.titles[section] = line.strip()
                expecting_title = False
            elif line.startswith("**Tags:**"):
                raw = line.split("**Tags:**", 1)[1]
                cls.tags[section] = [t.strip() for t in raw.split(",") if t.strip()]

    def test_listing_copy_was_parsed(self):
        self.assertGreaterEqual(len(self.titles), 5, "listing titles not found")
        self.assertEqual(set(self.titles), set(self.tags), "a listing is missing title or tags")

    def test_titles_fit_etsy_limit(self):
        for section, title in self.titles.items():
            with self.subTest(listing=section):
                self.assertLessEqual(len(title), self.MAX_TITLE, f"{len(title)} chars")

    def test_tag_count(self):
        for section, tags in self.tags.items():
            with self.subTest(listing=section):
                self.assertEqual(len(tags), self.MAX_TAGS)

    def test_each_tag_fits_etsy_limit(self):
        for section, tags in self.tags.items():
            for tag in tags:
                with self.subTest(listing=section, tag=tag):
                    self.assertLessEqual(len(tag), self.MAX_TAG, f"'{tag}' is {len(tag)} chars")

    def test_tags_are_not_duplicated_within_a_listing(self):
        for section, tags in self.tags.items():
            with self.subTest(listing=section):
                self.assertEqual(len(tags), len(set(tags)))


if __name__ == "__main__":
    unittest.main()
