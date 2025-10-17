# Video Conversion Scripts

This folder contains utility scripts for processing videos for the Mocksy application.

## convert-video-with-transparency.sh

Converts videos with solid backgrounds to transparent WebM and GIF formats. This is essential for animations that need to display with transparency across different browsers.

### Features

- **WebM Output**: Creates VP9-encoded WebM with alpha channel (transparent background)
- **GIF Output**: Creates animated GIF with transparency using palette generation
- **Automatic Sizing**: GIFs are automatically sized to max 400px dimension for optimal web performance
- **Color Key Removal**: Removes specified background color with configurable similarity threshold

### Requirements

- **ffmpeg**: Install with `brew install ffmpeg`

### Usage

```bash
cd scripts/convert-mascots
./convert-video-with-transparency.sh <input-filename> <background-color> [output-name]
```

### Parameters

- `input-filename`: Filename in the `input/` folder (e.g., `video.mp4`)
- `background-color`: Hex color to remove (format: `#RRGGBB` or `0xRRGGBB`)
- `output-name`: (optional) Base name for output files, defaults to input filename

### Examples

```bash
# First, place your video in the input/ folder
cp ~/Downloads/video.mp4 input/

# Then convert it with beige background
./convert-video-with-transparency.sh video.mp4 "#EBE9E6" mocksybot

# Convert video with light green background
./convert-video-with-transparency.sh mocsy-study-green.mp4 "#B9E2AC" mocksy-study

# Use default output name (same as input)
./convert-video-with-transparency.sh animation.mp4 "0x000000"
```

### Input/Output Paths

**Input:**
- Place video files in `scripts/convert-mascots/input/` folder
- The script looks for files in this local input folder

**Output:**
- Files are created in `scripts/convert-mascots/output/` folder
- Output files:
  - `<output-name>.webm`: Transparent WebM video (for Chrome/Firefox)
  - `<output-name>.gif`: Transparent animated GIF (for Safari)
- Both `input/` and `output/` folders are gitignored by default

### Integration with React

After generating the files, copy them to the `public/` folder and use Safari detection:

```tsx
const [isSafari, setIsSafari] = useState(false);

useEffect(() => {
  const ua = navigator.userAgent;
  const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(ua);
  setIsSafari(isSafariBrowser);
}, []);

// Then in your JSX:
{isSafari ? (
  <img src="/mocksybot.gif" alt="Animation" />
) : (
  <video autoPlay loop muted playsInline>
    <source src="/mocksybot.webm" type="video/webm" />
  </video>
)}
```

### Customization

If you need to adjust the transparency removal, edit these parameters in the script:

- **Similarity**: `0.08` (lower = more strict matching)
- **Blend**: `0.02` (edge smoothing)
- **GIF FPS**: `24` (frames per second)
- **GIF Size**: `400` (max dimension in pixels)

### Troubleshooting

**Background not fully removed:**
- Try adjusting the similarity value in the script (increase from 0.08 to 0.15)
- Ensure the background color hex value is correct

**Colors inside the subject are removed:**
- Decrease the similarity value (from 0.08 to 0.05)
- Check that the background color doesn't match colors in your subject

**GIF file is too large:**
- Reduce the target size (change 400 to 300 or smaller)
- Reduce FPS (change 24 to 15)
- Reduce color palette size (adjust palettegen parameters)

## Notes

- WebM files use VP9 codec with alpha channel for best transparency support
- GIF files use palette generation with reserved transparent color
- Safari doesn't support transparent video, hence the need for GIF fallback
- Chrome/Firefox support transparent WebM video
