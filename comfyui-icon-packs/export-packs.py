#!/usr/bin/env python3
"""
IconSmith Studio - Icon Pack Export Tool
Generates and exports icon packs from ComfyUI workflows
"""

import json
import os
import sys
import argparse
from pathlib import Path
from datetime import datetime

class IconPackExporter:
    """Handles generation and export of icon packs"""

    def __init__(self, base_dir="."):
        self.base_dir = Path(base_dir)
        self.themes_dir = self.base_dir / "themes"
        self.workflows_dir = self.base_dir / "workflows"
        self.exports_dir = self.base_dir / "exports"
        self.catalog_path = self.base_dir / "catalog.json"

    def load_theme(self, theme_id):
        """Load a theme configuration"""
        theme_path = self.themes_dir / f"{theme_id}.json"
        if not theme_path.exists():
            raise FileNotFoundError(f"Theme not found: {theme_id}")

        with open(theme_path, 'r') as f:
            return json.load(f)

    def load_catalog(self):
        """Load the master catalog"""
        if not self.catalog_path.exists():
            raise FileNotFoundError("Catalog not found")

        with open(self.catalog_path, 'r') as f:
            return json.load(f)

    def create_pack_structure(self, theme_id):
        """Create directory structure for a pack"""
        pack_dir = self.exports_dir / theme_id
        subdirs = ['icons', 'wallpapers', 'widgets', 'metadata']

        for subdir in subdirs:
            (pack_dir / subdir).mkdir(parents=True, exist_ok=True)

        return pack_dir

    def generate_manifest(self, theme, pack_dir):
        """Generate a manifest file for the pack"""
        manifest = {
            "id": theme["id"],
            "name": theme["name"],
            "description": theme["description"],
            "version": theme["version"],
            "author": theme["author"],
            "createdAt": datetime.now().isoformat(),
            "statistics": {
                "totalIcons": theme["iconCount"],
                "totalWallpapers": theme.get("wallpaperCount", 0),
                "totalWidgets": theme.get("widgetCount", 0),
            },
            "colors": theme.get("colors", {}),
            "styles": theme.get("styles", {}),
            "categories": theme.get("categories", []),
            "variants": theme.get("variants", []),
            "formats": theme.get("formats", ["png", "svg"]),
            "price": theme.get("price", 0),
            "tags": theme.get("tags", [])
        }

        manifest_path = pack_dir / "metadata" / "manifest.json"
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)

        return manifest_path

    def create_placeholder_assets(self, theme, pack_dir):
        """Create placeholder files for the pack (for demo purposes)"""
        theme_id = theme["id"]

        # Create icon index
        icons_index = {
            "theme": theme_id,
            "totalIcons": theme["iconCount"],
            "categories": {},
            "createdAt": datetime.now().isoformat()
        }

        for category in theme.get("categories", []):
            icons_index["categories"][category] = {
                "name": category.replace("-", " ").title(),
                "count": 10,
                "icons": [f"{category}-icon-{i+1}" for i in range(10)]
            }

        icons_index_path = pack_dir / "metadata" / "icons-index.json"
        with open(icons_index_path, 'w') as f:
            json.dump(icons_index, f, indent=2)

        # Create color palette file
        colors_path = pack_dir / "metadata" / "colors.json"
        with open(colors_path, 'w') as f:
            json.dump(theme.get("colors", {}), f, indent=2)

        # Create variants reference
        variants_info = {
            "available": theme.get("variants", ["light", "dark"]),
            "formats": theme.get("formats", ["png", "svg"]),
            "sizes": theme.get("sizes", [60, 120, 180])
        }

        variants_path = pack_dir / "metadata" / "variants.json"
        with open(variants_path, 'w') as f:
            json.dump(variants_info, f, indent=2)

        print(f"✓ Created placeholder assets for {theme_id}")

    def generate_preview_html(self, theme, pack_dir):
        """Generate an HTML preview file"""
        colors = theme.get("colors", {})
        primary_colors = colors.get("primary", ["#FF1493", "#FFD700"])

        html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{theme['name']} - Icon Pack Preview</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
            background: linear-gradient(135deg, {primary_colors[0]}, {primary_colors[-1]});
            color: #fff;
            padding: 2rem;
            min-height: 100vh;
        }}
        .container {{ max-width: 1200px; margin: 0 auto; }}
        h1 {{ font-size: 2.5rem; margin-bottom: 0.5rem; }}
        .subtitle {{ font-size: 1.1rem; opacity: 0.9; margin-bottom: 2rem; }}
        .info-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin: 2rem 0; }}
        .info-box {{ background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 12px; }}
        .stat {{ font-size: 2rem; font-weight: 600; color: {primary_colors[0]}; }}
        .label {{ color: rgba(255,255,255,0.7); margin-top: 0.5rem; }}
        .colors-section {{ margin-top: 2rem; }}
        .color-palette {{ display: flex; gap: 1rem; margin-top: 1rem; flex-wrap: wrap; }}
        .color-box {{ width: 80px; height: 80px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }}
        .footer {{ margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.2); text-align: center; opacity: 0.8; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 {theme['name']}</h1>
        <p class="subtitle">{theme['description']}</p>

        <div class="info-grid">
            <div class="info-box">
                <div class="stat">{theme['iconCount']}</div>
                <div class="label">Icons</div>
            </div>
            <div class="info-box">
                <div class="stat">{theme.get('wallpaperCount', 0)}</div>
                <div class="label">Wallpapers</div>
            </div>
            <div class="info-box">
                <div class="stat">{theme.get('widgetCount', 0)}</div>
                <div class="label">Widgets</div>
            </div>
            <div class="info-box">
                <div class="stat">${{theme['price']}}</div>
                <div class="label">Price</div>
            </div>
        </div>

        <div class="colors-section">
            <h2>Color Palette</h2>
            <div class="color-palette">
                {chr(10).join(f'<div class="color-box" style="background: {color};" title="{color}"></div>' for color in primary_colors)}
            </div>
        </div>

        <div class="footer">
            <p>Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p>IconSmith Studio - ComfyUI Icon Packs</p>
        </div>
    </div>
</body>
</html>
"""

        preview_path = pack_dir / "preview.html"
        with open(preview_path, 'w') as f:
            f.write(html_content)

        return preview_path

    def export_pack(self, theme_id, formats=None):
        """Export a complete icon pack"""
        if formats is None:
            formats = ["png", "svg", "ai"]

        print(f"\n📦 Exporting pack: {theme_id}")

        # Load theme
        theme = self.load_theme(theme_id)

        # Create directory structure
        pack_dir = self.create_pack_structure(theme_id)

        # Generate files
        self.generate_manifest(theme, pack_dir)
        self.create_placeholder_assets(theme, pack_dir)
        self.generate_preview_html(theme, pack_dir)

        print(f"✓ Pack exported to: {pack_dir}")

        # Print summary
        print(f"\n📊 Pack Summary:")
        print(f"  Name: {theme['name']}")
        print(f"  Icons: {theme['iconCount']}")
        print(f"  Wallpapers: {theme.get('wallpaperCount', 0)}")
        print(f"  Widgets: {theme.get('widgetCount', 0)}")
        print(f"  Price: ${theme['price']}")
        print(f"  Formats: {', '.join(formats)}")
        print(f"  Location: {pack_dir}")

        return pack_dir

    def export_all_packs(self):
        """Export all themes in catalog"""
        catalog = self.load_catalog()

        print("📦 Exporting all packs...")
        results = []

        for pack in catalog.get("packs", []):
            pack_id = pack["id"]
            try:
                pack_dir = self.export_pack(pack_id)
                results.append((pack_id, "✓ Success"))
            except Exception as e:
                results.append((pack_id, f"✗ Error: {str(e)}"))

        # Print summary
        print("\n" + "="*50)
        print("EXPORT SUMMARY")
        print("="*50)
        for pack_id, status in results:
            print(f"{pack_id}: {status}")

        return results

    def list_themes(self):
        """List all available themes"""
        catalog = self.load_catalog()

        print("\n🎨 Available Icon Packs:")
        print("="*60)

        for pack in catalog.get("packs", []):
            print(f"\n{pack['name']} (${pack['price']})")
            print(f"  ID: {pack['id']}")
            print(f"  Description: {pack['shortDescription']}")
            print(f"  Rating: {'⭐' * int(pack['rating'])} {pack['rating']}/5 ({pack['reviews']} reviews)")

def main():
    parser = argparse.ArgumentParser(
        description="IconSmith Studio - Export Icon Packs"
    )
    parser.add_argument(
        "--theme",
        help="Export specific theme (use --list to see options)"
    )
    parser.add_argument(
        "--formats",
        default="png,svg,ai",
        help="Export formats (comma-separated, default: png,svg,ai)"
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Export all packs in catalog"
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List all available themes"
    )

    args = parser.parse_args()

    # Determine base directory
    script_dir = Path(__file__).parent
    exporter = IconPackExporter(script_dir)

    try:
        if args.list:
            exporter.list_themes()
        elif args.all:
            exporter.export_all_packs()
        elif args.theme:
            formats = [f.strip() for f in args.formats.split(",")]
            exporter.export_pack(args.theme, formats)
        else:
            parser.print_help()
    except Exception as e:
        print(f"❌ Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
