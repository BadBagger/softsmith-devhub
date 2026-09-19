# ComfyUI Integration Guide

This guide explains how to use IconSmith Studio workflows with ComfyUI to generate custom icon packs.

## Prerequisites

- ComfyUI installed and configured
- Stable Diffusion model (1.5 or higher recommended)
- Python 3.8+
- At least 6GB VRAM (8GB+ recommended for high-quality output)

## Installation

### 1. Setup ComfyUI

```bash
# Clone ComfyUI if not already done
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI

# Install dependencies
pip install -r requirements.txt

# Download a model (if needed)
# Place in: ComfyUI/models/checkpoints/
```

### 2. Copy IconSmith Workflows

```bash
# Copy workflow JSON files to ComfyUI
cp workflows/*.json /path/to/ComfyUI/input/

# Copy theme configurations
cp themes/*.json /path/to/ComfyUI/input/
```

### 3. Configure Paths

Edit workflow JSON files to point to your ComfyUI installation:

```json
{
  "checkpoint_path": "/path/to/ComfyUI/models/checkpoints/",
  "output_path": "/path/to/ComfyUI/output/",
  "vae_path": "/path/to/ComfyUI/models/vae/"
}
```

## Using Workflows in ComfyUI

### Loading a Workflow

1. Open ComfyUI web interface
2. Click "Load" 
3. Select a workflow from `workflows/` directory
4. The workflow nodes will appear in the editor

### Available Workflows

#### Y2K Aesthetic Icon Generator
- **File**: `y2k-icon-generator.json`
- **Models**: Stable Diffusion 1.5
- **Output**: 512x512 PNG icons
- **Variants**: Tamagotchi, Gameboy, Flip Phone, CRT, Messenger, MP3 Player

#### Cottagecore Icon Generator
- **File**: `cottagecore-icon-generator.json`
- **Models**: Stable Diffusion 1.5
- **Output**: 512x512 PNG icons
- **Variants**: Plants, Animals, Cooking, Gardening, Books, Crafts

### Workflow Node Reference

Each workflow contains:

1. **Seed Input** (1)
   - Randomness control
   - Use same seed for consistency
   - Change seed for variations

2. **KSampler** (1)
   - Main generation node
   - Adjustable steps: 15-50 (higher = better quality, slower)
   - CFG scale: 5-15 (higher = more prompt adherence)
   - Scheduler: "normal", "karras", "exponential", "simple"
   - Sampler: "euler", "heun", "lms", "dpmpp_2m", etc.

3. **Checkpoint Loader** (4)
   - Loads Stable Diffusion model
   - Supports .ckpt, .safetensors formats

4. **VAE Encoder/Decoder** (2, 3, 5)
   - Compresses/decompresses latent space
   - VAE Loader selects VAE model

5. **Save Image** (6)
   - Exports final PNG
   - Configurable output directory
   - Auto-numbered file names

## Customization

### Editing Prompts

1. Right-click on the KSampler node
2. Click "Inspect" to view inputs
3. Edit the "positive" prompt field
4. Click "Queue Prompt" to regenerate

### Prompt Engineering Tips

#### Y2K Aesthetic Prompts
```
cute y2k aesthetic icon, [SUBJECT], nostalgic 2000s, pastel colors, 
glossy finish, rounded square shape, 512x512, isolated on white background
```

Common subjects:
- `tamagotchi electronic pet device`
- `flip phone mobile device`
- `old desktop CRT monitor`
- `gameboy game console`
- `AIM instant messenger bubble`
- `MP3 player, iPod style`

#### Cottagecore Prompts
```
rustic cottagecore icon, [SUBJECT], nature-inspired, earthy tones, 
vintage charm, watercolor style, 512x512, isolated background
```

Common subjects:
- `gardening tools and plants`
- `woodland animals`
- `vintage kitchen utensils`
- `forest cottage scene`
- `hand-bound journal and books`
- `wildflower bouquet`

### Adjusting Generation Parameters

| Parameter | Range | Effect |
|-----------|-------|--------|
| Steps | 15-50 | Higher = better quality, longer time |
| CFG Scale | 3-15 | Higher = more prompt-focused |
| Seed | 0+ | Fixed = reproducible, random = new |
| Sampler | Various | Different quality/speed tradeoffs |
| Denoise | 0.0-1.0 | Lower = more subtle changes |

### Color Customization

For color-specific icons, adjust prompts:

```
[BASE PROMPT], color palette of [COLOR1], [COLOR2], [COLOR3]
```

Example:
```
cute icon, pastel pink #FFB6C1, mint green #98D8C8, lavender #E6E6FA
```

## Batch Generation

### Using ComfyUI UI

1. Create multiple seed variations:
   - Note the workflow
   - Change seed value
   - Queue multiple prompts

2. Monitor queue:
   - Check "Queue" in ComfyUI
   - Review generated images
   - Adjust parameters as needed

### Using Command Line

```bash
# Run ComfyUI with custom arguments
python main.py --listen 0.0.0.0 --port 8188

# Use API to queue prompts:
curl -X POST http://localhost:8188/prompt \
  -H "Content-Type: application/json" \
  -d @workflow.json
```

### Batch Export Script

Use the included export tool:

```bash
python export-packs.py --theme y2k-aesthetic --formats png,svg,ai
```

## Output Organization

Generated files are organized as:

```
exports/
├── y2k-aesthetic/
│   ├── icons/
│   │   ├── tamagotchi-1.png
│   │   ├── tamagotchi-2.png
│   │   └── ...
│   ├── wallpapers/
│   ├── widgets/
│   └── metadata/
│       ├── manifest.json
│       ├── colors.json
│       └── icons-index.json
```

## Performance Optimization

### GPU Memory Usage

```python
# In ComfyUI config or environment:
CUDA_VISIBLE_DEVICES=0  # Use GPU 0
export PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb=512

# For lower-end GPUs:
# - Reduce image size to 384x384 or 256x256
# - Decrease steps to 15-20
# - Use simpler model (SD 1.5 vs 2.1)
```

### Batch Processing

For generating 100+ icons:

1. Create template workflow
2. Loop through seed values: 0-999
3. Export after each generation
4. Monitor VRAM usage
5. Use checkpointing to save progress

```bash
for seed in {0..99}; do
    python generate.py --workflow workflow.json --seed $seed
done
```

## Troubleshooting

### Common Issues

**Issue**: CUDA out of memory
- **Solution**: Reduce image size or decrease steps

**Issue**: Low-quality output
- **Solution**: Increase steps (20-30), improve prompt, adjust CFG scale

**Issue**: Repeating patterns
- **Solution**: Vary seed, try different samplers

**Issue**: Wrong style/colors
- **Solution**: Refine prompt, add style keywords (e.g., "glossy", "pastel", "matte")

### Model Troubleshooting

- Ensure model is in correct directory
- Check file format (.ckpt or .safetensors)
- Verify model hash if multiple versions exist
- Clear ComfyUI cache if models not loading

## Advanced: Custom Workflows

### Creating New Workflows

1. Open ComfyUI web UI
2. Add nodes: Checkpoint Loader → VAE Encode → KSampler → VAE Decode → Save
3. Configure each node
4. Test the workflow
5. Export as JSON: `Save (API Format)` button
6. Save to `workflows/` directory

### Using Custom Models

```json
{
  "4": {
    "inputs": {
      "ckpt_name": "your-custom-model.safetensors"
    },
    "class_type": "CheckpointLoader"
  }
}
```

### Adding Control Nodes

For more control:
- **ControlNet**: Pose/layout control
- **Face Detailer**: High-quality faces
- **Tiling**: Seamless textures
- **Upscaler**: Higher resolution output

## API Integration

### ComfyUI API Endpoint

```python
import requests
import json

workflow = json.load(open('y2k-icon-generator.json'))

# Queue prompt
response = requests.post(
    'http://localhost:8188/prompt',
    json=workflow
)

prompt_id = response.json()['prompt_id']

# Poll for status
status = requests.get(f'http://localhost:8188/history/{prompt_id}')
```

## Production Deployment

For automated icon pack generation:

1. Set up ComfyUI server on dedicated GPU machine
2. Create API wrapper for batch processing
3. Implement queue management
4. Monitor resource usage
5. Automate pack export and archiving
6. Integrate with Etsy fulfillment

## Resources

- **ComfyUI Documentation**: https://github.com/comfyanonymous/ComfyUI
- **Stable Diffusion Models**: https://huggingface.co/models
- **Workflow Examples**: `workflows/` directory
- **Prompt Engineering**: See theme config comments

---

**Need Help?** Check the workflow files for inline comments and examples.
