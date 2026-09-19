# IconSmith Studio - ComfyUI Icon Packs

Premium aesthetic app icon packs powered by ComfyUI workflows. Generate, customize, and export beautiful icon sets with ease.

## 📦 Available Packs

### Y2K Aesthetic
- **Icons**: 150+ nostalgic 2000s icons (Tamagotchi, Gameboy, CRT TVs, flip phones)
- **Price**: $14.99
- **Includes**: 5 wallpapers, 8 widgets
- **Variants**: Light, Dark, Saturated
- **Colors**: Pastel pinks, blues, greens, yellows with glossy finish
- **Rating**: ⭐ 4.9/5 (127 reviews)

### Cottagecore
- **Icons**: 180+ rustic, nature-inspired icons
- **Price**: $14.99
- **Includes**: 6 wallpapers, 10 widgets
- **Variants**: Light, Dark, Muted
- **Colors**: Earthy browns, forest greens, tans
- **Rating**: ⭐ 4.8/5 (95 reviews)

### Candy Glossy
- **Icons**: 120+ sweet 3D icons with pastel colors
- **Price**: $12.99
- **Includes**: 4 wallpapers, 12 widgets
- **Variants**: Glossy, Matte, Mirror
- **Colors**: Pastel pinks, teals, purples with 3D effects
- **Rating**: ⭐ 4.9/5 (156 reviews)

### Minimalist Matte
- **Icons**: 200+ clean, simple matte icons
- **Price**: $9.99
- **Includes**: 3 wallpapers
- **Variants**: Light, Dark, Grayscale
- **Colors**: Neutral grays with blue accents
- **Rating**: ⭐ 4.7/5 (203 reviews)

## 💎 Bundle Deals

- **All Themes Bundle**: All 4 packs (save 24%) - $39.99
- **Trending Bundle**: Y2K + Candy Glossy (save 18%) - $22.99

## 📊 Statistics

- **Total Icons**: 650+
- **Total Wallpapers**: 18
- **Total Widgets**: 30
- **Happy Customers**: 2,847+
- **Average Rating**: 4.825/5

## 🛠 How It Works

### ComfyUI Workflows

Each pack includes a ComfyUI workflow for generating additional custom variations:

```json
{
  "packId": "y2k-aesthetic",
  "name": "Generate Y2K Icons",
  "version": "1.0",
  "file": "workflows/y2k-icon-generator.json"
}
```

### Using the Generator

1. **Load Workflow**: Import `y2k-icon-generator.json` into ComfyUI
2. **Customize Prompt**: Edit the prompt to create variations
3. **Adjust Colors**: Modify the color palette in the metadata
4. **Generate**: Run the workflow to create new icons
5. **Export**: Save as PNG, SVG, or AI file

### Default Prompts

Each theme includes pre-configured prompts:

```javascript
"defaultPrompts": {
  "tamagotchi": "cute tamagotchi y2k electronic pet icon...",
  "gameboy": "retro gameboy console icon...",
  "flipphone": "flip phone mobile device icon...",
  "computer": "old desktop computer monitor icon...",
  "messaging": "instant messenger bubble icon...",
  "music": "MP3 player icon, iPod style..."
}
```

## 📂 Directory Structure

```
comfyui-icon-packs/
├── themes/                      # Pack configuration files
│   ├── y2k-aesthetic.json
│   ├── cottagecore.json
│   ├── candy-glossy.json
│   └── minimalist.json
├── workflows/                   # ComfyUI workflow templates
│   ├── y2k-icon-generator.json
│   └── cottagecore-icon-generator.json
├── exports/                     # Generated icon packs
│   ├── y2k-aesthetic/
│   │   ├── icons/
│   │   ├── wallpapers/
│   │   └── widgets/
│   └── [other packs]/
├── dashboard/                   # Web-based preview & store
│   └── index.html
├── catalog.json                 # Master catalog & metadata
└── README.md                    # This file
```

## 🎨 Customization

### Creating a New Theme

1. **Create theme file** in `themes/` directory:

```json
{
  "id": "custom-theme",
  "name": "My Custom Theme",
  "colors": {
    "primary": ["#COLOR1", "#COLOR2"],
    "secondary": ["#COLOR3", "#COLOR4"]
  },
  "iconCount": 150,
  "categories": ["social", "productivity"],
  "price": 14.99
}
```

2. **Create ComfyUI workflow**:

```json
{
  "1": {
    "inputs": {
      "positive": "your custom prompt here"
    },
    "class_type": "KSampler"
  }
}
```

3. **Add to catalog.json**:

```json
{
  "id": "custom-theme",
  "name": "My Custom Theme",
  "price": 14.99
}
```

## 🚀 Installation & Setup

### Prerequisites

- ComfyUI (latest version)
- Python 3.8+
- Node.js (for web dashboard)

### Steps

1. Clone the repository:
```bash
cd comfyui-icon-packs
```

2. Install dependencies:
```bash
pip install -r requirements.txt
npm install  # if needed
```

3. Launch the dashboard:
```bash
python -m http.server 8000
# Visit http://localhost:8000/dashboard/
```

4. Configure ComfyUI paths:
   - Copy workflows to your ComfyUI `input/` directory
   - Set output directory in workflow metadata

## 📥 Exporting Packs

### Batch Export Script

Use the included export tool to generate all pack variations:

```bash
python export-packs.py --theme y2k-aesthetic --formats png,svg,ai
```

### Manual Export

1. Run ComfyUI workflow
2. Save generated images
3. Organize into pack structure:
   - `icons/` - Individual icon files
   - `wallpapers/` - Wallpaper variations
   - `widgets/` - Widget templates
4. Create preview thumbnails
5. Archive as `.zip` for distribution

## 💰 Pricing Strategy

| Pack | Base Price | Bundle Discount | Notes |
|------|-----------|-----------------|-------|
| Y2K Aesthetic | $14.99 | $12.99 (13% off) | Most popular, 150 icons |
| Cottagecore | $14.99 | $12.99 (13% off) | 180 icons, largest pack |
| Candy Glossy | $12.99 | $10.99 (15% off) | 120 icons, high reviews |
| Minimalist | $9.99 | $8.49 (15% off) | Budget option, 200 icons |
| All Themes | $52.96 | $39.99 (24% off) | Best value |

## 📈 Marketing Tactics

1. **Seasonal Themes**: Rotate themes (holiday, seasonal)
2. **Limited Editions**: Time-limited packs create urgency
3. **Free Previews**: Share 5-10 free icons from each pack
4. **Bundle Deals**: 15-24% off when buying multiple packs
5. **Social Proof**: Highlight 4.8+ average rating, 2,800+ customers
6. **Before/After**: Show home screen customization examples

## 🔧 Technical Details

### Color Palette Management

Each theme defines:
- **Primary Colors**: Main icon palette
- **Secondary Colors**: Alternative variants
- **Accents**: Highlights and special elements

```json
"colors": {
  "primary": ["#FF1493", "#FFB6C1", "#87CEEB"],
  "secondary": ["#FF69B4", "#00CED1", "#7B68EE"],
  "accents": {
    "bright": "#FFFF00",
    "dark": "#0D0D0D",
    "light": "#FFFFFF"
  }
}
```

### ComfyUI Node Reference

- **KSampler**: Main generation node
- **VAEEncode/Decode**: Image compression
- **CheckpointLoader**: Model loading
- **SaveImage**: Export output

## 📞 Support & Resources

- **Etsy Shop**: https://www.etsy.com/shop/iconsmithstudio
- **Documentation**: See theme config files
- **Custom Requests**: Support custom themes via ComfyUI workflows
- **Updates**: Check catalog.json for new packs

## 📄 License

Commercial use for icon pack sales. ComfyUI workflows are configurable and customizable by purchasers.

## 🎯 Future Roadmap

- [ ] Real-time ComfyUI integration dashboard
- [ ] Custom color picker for theme variations
- [ ] Animated icon export (webp, gif)
- [ ] Widget template builder
- [ ] Seasonal pack rotation system
- [ ] Bulk batch export optimization
- [ ] API for automated order fulfillment

---

**IconSmith Studio** - Your Creative Icons, Powered by AI
