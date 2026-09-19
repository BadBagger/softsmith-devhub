# Moody - Minecraft Shader Pack

A spooky elementary aesthetic shader pack optimized for NVIDIA RTX 2070 Super and above.

## Overview

**Moody** is a lightweight shader pack designed to bring a spooky, atmospheric aesthetic to Minecraft while maintaining excellent performance on mid-range to high-end RTX GPUs. The shader provides:

- **Spooky Color Grading**: Desaturated colors with purple and orange tints
- **Dynamic Lighting**: Enhanced block and sky light interaction
- **Atmospheric Effects**: Fog, vignette, and bloom effects
- **Efficient Shadow Mapping**: Optimized for RTX 2070 Super
- **Elementary Visual Style**: Simplified geometry and lighting for visual clarity

## Requirements

### Minimum Specifications
- **GPU**: NVIDIA RTX 2070 Super or equivalent
- **VRAM**: 6GB minimum
- **Minecraft Version**: 1.20.x or compatible
- **Shader Loader**: Iris Shaders (recommended) or OptiFine

### Recommended Specifications
- **GPU**: RTX 3070 or higher
- **VRAM**: 8GB or more
- **CPU**: Ryzen 5 3600 / Intel i7-9700K or better
- **RAM**: 12GB minimum for smooth gameplay

## Installation

### For Iris Shaders
1. Install Iris Shaders from https://irisshaders.net/
2. Download the `minecraft-moody-shader` folder
3. Copy the folder to `.minecraft/shaderpacks/`
4. Launch Minecraft with the Fabric loader
5. In-game: Options → Video Settings → Shaders → Select "Moody"

### For OptiFine
1. Install OptiFine from https://optifine.net/
2. Download the shader pack
3. Copy to `.minecraft/shaderpacks/`
4. Launch Minecraft with OptiFine
5. In-game: Options → Shader Packs → Select "Moody"

## Features

### Color Grading
- **Saturation**: 75% - Slightly desaturated for eerie feel
- **Contrast**: 1.1x - Enhanced contrast for visual pop
- **Temperature**: 0.95 - Slightly cool white balance
- **Spooky Tint**: Purple and orange color cast

### Lighting System
- **Block Light**: Warm, orange-ish illumination
- **Sky Light**: Cool, blue-ish atmospheric light
- **Ambient Brightness**: 0.6 - Dark, moody baseline
- **Shadow Quality**: Configurable (0.4 to 1.0)

### Visual Effects
- **Bloom**: 0.5 intensity, threshold-based bright area selection
- **Vignette**: 0.4 strength with smooth edges
- **Fog**: 1.2x density with purple/blue tint
- **Atmospheric Haze**: Subtle noise-based effect

### Performance Optimizations
- **Ray Marching Steps**: 64 steps (configurable: 32-128)
- **Sample Count**: 4 samples per pixel
- **Reflection Quality**: 60% - efficient reflections
- **Volumetric Lighting**: Disabled for 2070 Super optimization
- **Complex Normals**: Simplified for faster calculation

## Configuration

Edit `shaders/shaders.properties` to customize:

```properties
# Lighting
option.SHADOW_QUALITY=0.8
option.SHADOW_DISTANCE=160
option.AMBIENT_BRIGHTNESS=0.6
option.FOG_DENSITY=1.2

# Visual Effects
option.BLOOM_INTENSITY=0.5
option.SATURATION=0.75
option.CONTRAST=1.1
option.VIGNETTE=0.4

# Performance
option.RAY_MARCH_STEPS=64
option.SAMPLE_COUNT=4
option.REFLECTION_QUALITY=0.6
```

## Performance Tips

### For RTX 2070 Super
- Keep Shadow Quality at 0.7-0.8
- Enable Ray Tracing in OptiFine (if using RTX Shaders edition)
- Keep Render Distance at 12-16 chunks
- Disable dynamic reflections if FPS drops

### For RTX 3070+
- Increase Shadow Quality to 0.9-1.0
- Enable all visual effects
- Use Render Distance of 24 chunks or higher
- Enable Complex Normals for better detail

### For Lower-End RTX Cards
- Reduce Shadow Quality to 0.4-0.6
- Disable Bloom or reduce intensity
- Lower Ray March Steps to 32-48
- Reduce Sample Count to 2

## Shader Structure

```
minecraft-moody-shader/
├── pack.mcmeta              # Pack metadata
├── shaders/
│   ├── shaders.properties   # Configuration options
│   ├── gbuffers/
│   │   ├── terrain.vsh      # Terrain vertex shader
│   │   └── terrain.fsh      # Terrain fragment shader
│   ├── shadow/
│   │   ├── terrain.vsh      # Shadow vertex shader
│   │   └── terrain.fsh      # Shadow fragment shader
│   ├── composite.vsh        # Post-processing vertex shader
│   ├── composite.fsh        # Post-processing fragment shader
│   ├── final.vsh            # Final tone mapping vertex shader
│   └── final.fsh            # Final tone mapping fragment shader
├── assets/
│   └── minecraft/
│       └── textures/
│           └── colormaps/   # Custom color maps (optional)
└── docs/                    # Documentation
```

## Shader Pipeline

1. **Geometry Pass (gbuffers)**: Renders terrain with normals and lighting
2. **Shadow Pass**: Generates shadow map for dynamic shadows
3. **Composite Pass**: Applies bloom and post-processing effects
4. **Final Pass**: Tone mapping and final color grading

## Spooky Elementary Aesthetic

The shader achieves its distinctive look through:

- **Desaturation**: 75% saturation makes colors muted and eerie
- **Cool Lighting**: Sky light emphasizes blues and purples
- **Warm Shadows**: Block light adds warm, spooky ambience
- **Fog Effects**: Dense fog creates mysterious, enclosed feeling
- **Color Tint**: Purple/orange tint evokes Halloween atmosphere
- **Simplified Details**: Elementary style keeps textures clean

## Troubleshooting

### Low FPS
- Reduce Shadow Quality from 0.8 to 0.6
- Lower Ray March Steps from 64 to 48 or 32
- Reduce Render Distance
- Disable Bloom effect

### Flickering or Artifacts
- Ensure drivers are up-to-date
- Disable other shader mods
- Try lowering Sample Count to 2
- Check for conflicting mods (Replay Mod, etc.)

### Colors Look Wrong
- Verify Gamma setting in Minecraft options
- Check monitor calibration
- Try adjusting COLOR_TEMP in properties
- Disable HDR if enabled

### Performance on RTX 2070 Super
- This is the minimum target GPU
- Use preset optimizations from Configuration section
- Disable Complex Normals
- Keep Render Distance at 12-16 chunks

## Development Notes

### For RTX 2070 Super Optimization
- Shader uses 2-level shadow cascade instead of complex cascades
- Volumetric lighting disabled to save VRAM
- Normal calculation simplified
- 64 ray marching steps (vs 128 for higher-end)
- 4x MSAA instead of higher sampling

### Future Enhancements
- [ ] Custom water shader with refraction
- [ ] Parallax mapping for terrain detail
- [ ] More advanced PBR lighting
- [ ] Configurable weather effects
- [ ] Per-biome color grading

## Credits

Developed for the SoftSmith DevHub project.

## License

This shader pack is provided as-is for personal use. Feel free to modify for your own needs.

## Support

For issues, feedback, or suggestions:
1. Check the Troubleshooting section above
2. Verify GPU drivers are current
3. Report bugs with detailed system specs
4. Include screenshots if possible

---

**Happy spooking!** 👻
