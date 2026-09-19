# Moody Shader - Configuration Guide

## Overview

The `shaders/shaders.properties` file contains all user-configurable options for the Moody shader. This guide explains each setting and its impact.

## Lighting & Atmosphere

### Shadow Quality
```
option.SHADOW_QUALITY=0.8 0.4 0.5 0.6 0.7 0.8 0.9 1.0
```

Controls the resolution and quality of shadow mapping.

- **0.4**: Very low quality, fast (~150 FPS on 2070S)
- **0.6**: Low quality, improved shadows (~120 FPS)
- **0.8**: Balanced (recommended, ~80-100 FPS)
- **1.0**: Maximum quality, shadows visible at distance (~60 FPS)

**Recommendation**: Start at 0.8, adjust based on FPS preference

### Shadow Distance
```
option.SHADOW_DISTANCE=160
```

How far from player shadows are rendered (in blocks).

- **80**: Close range only, minimal shadow cost
- **160**: Default, reasonable compromise
- **240+**: Very far, high cost on performance

**Recommendation**: Keep at 160 unless FPS is critical

### Ambient Brightness
```
option.AMBIENT_BRIGHTNESS=0.6 0.3 0.5 0.6 0.7 0.8 0.9 1.0
```

Base brightness when no direct light reaches an area.

- **0.3**: Very dark, dramatic/spooky
- **0.6**: Moody default
- **1.0**: Bright, less atmospheric

**Recommendation**: 0.6 for the intended spooky feel

### Fog Density
```
option.FOG_DENSITY=1.2 0.5 0.8 1.0 1.2 1.4 1.6
```

Thickness of atmospheric fog.

- **0.5**: Almost no fog, clear visibility
- **1.0**: Minecraft default fog
- **1.2**: Moody default, more atmospheric
- **1.6+**: Very thick, mysterious

**Recommendation**: 1.2-1.4 for best aesthetic

### Fog Color (RGB)
```
option.FOG_COLOR_R=0.15
option.FOG_COLOR_G=0.15
option.FOG_COLOR_B=0.25
```

Color of the atmospheric fog (values 0.0 to 1.0).

Current: Slightly purple-tinted dark fog
- **R=0.15, G=0.15, B=0.25**: Purple tint (default)
- **R=0.20, G=0.20, B=0.20**: Neutral gray
- **R=0.25, G=0.15, B=0.10**: Warm amber

**Recommendation**: Keep current for spooky aesthetic

## Visual Effects

### Bloom Intensity
```
option.BLOOM_INTENSITY=0.5 0.2 0.4 0.5 0.6 0.8 1.0
```

Strength of bloom (glow) effect on bright areas.

- **0.2**: Subtle, minimal FPS impact
- **0.5**: Balanced, recommended
- **1.0**: Intense, glowing effect

**Recommendation**: 0.5 (good balance)

### Saturation
```
option.SATURATION=0.75 0.5 0.65 0.75 0.85 0.95 1.0
```

Color intensity (0.0 = grayscale, 1.0 = vibrant).

- **0.5**: Highly desaturated, very spooky
- **0.75**: Moody default
- **1.0**: Natural colors

**Recommendation**: 0.75 for intended look (0.5 for extreme spooky)

### Contrast
```
option.CONTRAST=1.1 0.8 0.9 1.0 1.1 1.2 1.3
```

Difference between dark and light areas.

- **0.8**: Soft, muted look
- **1.0**: Standard Minecraft
- **1.1**: Moody default, more dramatic
- **1.3**: Extreme contrast, very striking

**Recommendation**: 1.1 (balances spooky aesthetic)

### Vignette
```
option.VIGNETTE=0.4 0.0 0.2 0.4 0.6 0.8 1.0
```

Darkening of screen edges for focus effect.

- **0.0**: No vignette
- **0.4**: Subtle (default)
- **0.8+**: Strong darkening

**Recommendation**: 0.4 (enhances spooky focus)

## Performance Options

### Ray Marching Steps
```
option.RAY_MARCH_STEPS=64 32 48 64 96 128
```

Steps for volumetric lighting calculations (higher = better quality, slower).

- **32**: Fast (~100 FPS boost)
- **64**: Balanced, recommended for 2070S
- **96**: Better quality
- **128**: Best quality (~20 FPS hit)

**Recommendation**: 64 for 2070 Super

### Sample Count
```
option.SAMPLE_COUNT=4 1 2 4 8 16
```

Anti-aliasing quality (samples per pixel).

- **1**: No AA, fast but aliased
- **2**: 2x MSAA, basic AA
- **4**: 4x MSAA, good balance (default)
- **8**: 8x MSAA, high quality
- **16**: 16x MSAA, excellent (expensive)

**Recommendation**: 4 for 2070 Super

### Enable Reflections
```
option.ENABLE_REFLECTIONS=true
```

Toggle water and wet surface reflections.

- **true**: Realistic reflections (default)
- **false**: No reflections (~5 FPS gain)

**Recommendation**: Keep true

### Reflection Quality
```
option.REFLECTION_QUALITY=0.6 0.3 0.5 0.6 0.75 0.9 1.0
```

Resolution of reflection probes.

- **0.3**: Low quality, fast
- **0.6**: Balanced (default)
- **1.0**: High quality

**Recommendation**: 0.6 for 2070 Super

## Color Grading

### Color Temperature
```
option.COLOR_TEMP=0.95 0.7 0.8 0.9 0.95 1.05 1.2
```

Warm (< 1.0) or cool (> 1.0) white balance.

- **0.7**: Very warm, orange cast
- **0.95**: Slightly cool (default)
- **1.2**: Very cool, blue cast

**Recommendation**: 0.95 for spooky mood

### Spooky Tint
```
option.SPOOKY_TINT=1.5 0.5 1.0 1.5 2.0 2.5
```

Intensity of purple/orange spooky color overlay.

- **0.5**: Subtle
- **1.5**: Moderate (default)
- **2.5**: Extreme

**Recommendation**: 1.5 for intended aesthetic (2.0+ for extreme)

## Advanced Options

### Enable Normals
```
option.ENABLE_NORMALS=true
```

Enables normal mapping for surface detail.

- **true**: Enhanced detail (default)
- **false**: Flat surfaces

**Recommendation**: Keep true

### Enable PBR
```
option.ENABLE_PBR=true
```

Physically-based rendering for realistic materials.

- **true**: Realistic reflectivity (default)
- **false**: Simpler, faster rendering

**Recommendation**: Keep true

### Enable Parallax
```
option.ENABLE_PARALLAX=false
```

Parallax mapping for depth effect (expensive).

- **true**: Enhanced 3D detail
- **false**: Disabled for performance (default)

**Recommendation**: Keep false for 2070 Super

## Preset Configurations

### "Atmospheric" - Maximum Spooky
```properties
SHADOW_QUALITY=0.7
AMBIENT_BRIGHTNESS=0.4
FOG_DENSITY=1.6
BLOOM_INTENSITY=0.6
SATURATION=0.5
VIGNETTE=0.6
SPOOKY_TINT=2.5
RAY_MARCH_STEPS=96
```
**Performance**: ~70 FPS, very spooky

### "Balanced" (Recommended)
```properties
SHADOW_QUALITY=0.8
AMBIENT_BRIGHTNESS=0.6
FOG_DENSITY=1.2
BLOOM_INTENSITY=0.5
SATURATION=0.75
VIGNETTE=0.4
SPOOKY_TINT=1.5
RAY_MARCH_STEPS=64
```
**Performance**: ~85-100 FPS, good aesthetic/performance

### "Performance"
```properties
SHADOW_QUALITY=0.5
AMBIENT_BRIGHTNESS=0.8
FOG_DENSITY=0.8
BLOOM_INTENSITY=0.3
SATURATION=0.85
VIGNETTE=0.2
SPOOKY_TINT=1.0
RAY_MARCH_STEPS=32
```
**Performance**: ~120+ FPS, lighter aesthetic

## Troubleshooting Specific Issues

### "Game is too dark"
- Increase `AMBIENT_BRIGHTNESS` to 0.7-0.8
- Reduce `SATURATION` reduction (increase value)

### "Colors look washed out"
- Decrease `FOG_DENSITY` to 0.8-1.0
- Increase `CONTRAST` to 1.2+
- Check gamma setting in Minecraft options

### "Too much bloom/glow"
- Reduce `BLOOM_INTENSITY` to 0.3
- Increase bloom threshold in shader code

### "Stuttering despite high FPS"
- Reduce `RAY_MARCH_STEPS` to 48
- Reduce `SHADOW_QUALITY` to 0.6
- Lower render distance in Minecraft

### "Water looks weird"
- Adjust `REFLECTION_QUALITY` to 0.5
- Check if reflection toggle is enabled

## Platform-Specific Notes

### RTX 2070 Super (Target)
- Keep preset at "Balanced"
- Shadow Quality: 0.7-0.8
- Render Distance: 12-16 chunks

### RTX 2080/2080 Ti
- Can use "Atmospheric" preset
- Increase Ray March Steps to 96-128
- Increase Render Distance to 20+

### RTX 3070/3080
- Maximum settings without penalty
- Ray March Steps: 128
- Shadow Cascades: 4
- Reflection Quality: 1.0

### RTX 2060/2070
- Use "Performance" preset
- Consider disabling reflections
- Keep render distance at 12

---

## Advanced: Manual Shader Code Tweaking

Edit these files directly for fine-tuning:

### `shaders/gbuffers/terrain.fsh`
- Line 36: Adjust `CONTRAST` multiplier
- Line 35: Adjust `SATURATION` factor
- Line 37: Modify spooky tint colors

### `shaders/composite.fsh`
- Line 28: Change `BLOOM_THRESHOLD`
- Line 29: Modify `VIGNETTE_STRENGTH`
- Line 30: Adjust `VIGNETTE_SMOOTHNESS`

### `shaders/final.fsh`
- Line 44: Tone mapping curve (Reinhard)
- Line 49-54: Color grading adjustments

## Resetting to Defaults

Delete `shaderpacks/Moody/shaders/shaders.properties` and restart Minecraft to regenerate with default values.
