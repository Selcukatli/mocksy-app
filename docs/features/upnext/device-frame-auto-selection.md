# Device Frame Auto-Selection Feature

**Status:** Proposed
**Priority:** Medium
**Created:** 2025-10-02

## Problem Statement

When generating device reference images for styles, the AI model sometimes produces tilted or 3D perspective views despite explicit instructions for a direct frontal angle. This makes these reference images unusable for screenshot generation because:

1. Visual information in images overrides text instructions in multimodal models
2. When passed to screenshot generation, the AI copies the tilt from the reference image
3. This conflicts with the orientation specified in the screenshot prompt (e.g., "straight-on" vs "15° left angle")

**Current Workaround:** We don't pass device reference images to screenshot generation at all - we only use the text description in `style.deviceStyle`. This works, but we lose the benefit of having a visual reference for device styling.

## Proposed Solution

**Generate 4 device frame variants and use BAML to automatically score and select the best frontal-angle image.**

### Approach

1. Generate 4 device reference images (instead of 1) when creating a style
2. Use BAML to analyze all 4 images in parallel
3. Score each image based on how well it meets frontal angle criteria
4. Automatically select the image with the highest score
5. Store only the best image as the style's device reference

### Benefits

- ✅ **Fully automated** - No user interaction needed
- ✅ **More reliable** - 4 attempts = higher chance of getting good frontal view
- ✅ **Objective scoring** - BAML detects tilt/perspective issues consistently
- ✅ **Fast** - Parallel scoring takes ~same time as scoring 1
- ✅ **Cost effective** - BAML analysis is cheap (uses medium model for 4 images)
- ✅ **Better UX** - Styles work immediately without review

## Implementation Details

### 1. New BAML Function

Add to `baml_src/styles.baml`:

```baml
class DeviceFrameScore {
  score int @description("Score 0-100: How well does this match direct frontal angle requirements")
  is_frontal_view bool @description("True if device is facing directly forward with no tilt")
  issues string[] @description("List of problems: 'tilted left', 'side view', '3D perspective', 'volume buttons visible', etc.")
  reasoning string @description("Brief explanation of the score")
}

function ScoreDeviceFrameImage(
  device_image: image @description("Device frame image to analyze")
) -> DeviceFrameScore {
  client ScreenshotGeneratorMed  // Fast, cheap model
  prompt #"
    {{ _.role("user") }}

    Analyze this device frame image and score how well it matches these requirements:

    REQUIRED CRITERIA:
    1. VERTICAL tall phone orientation (not horizontal)
    2. Facing DIRECTLY forward like a flat icon - NO tilt, NO 3D perspective
    3. Looking STRAIGHT at the screen - NOT from the side
    4. You see ONLY the front - NO side edges visible, NO volume buttons visible
    5. Complete phone showing - all 4 corners visible
    6. Flat 2D graphic style - NOT a photograph, NOT 3D render

    SCORING:
    - 100: Perfect direct frontal view, all criteria met
    - 80-99: Mostly frontal but minor issues (very slight tilt <5°)
    - 50-79: Some tilt or perspective visible
    - 0-49: Strong tilt, side view, or 3D perspective

    Analyze the provided image:
    {{ device_image }}

    {{ ctx.output_format }}
  "#
}
```

### 2. Update Style Generation Action

Modify `convex/styleActions.ts` in the `generateStyleFromDescription` action:

```typescript
// Generate 4 device reference variants
console.log("🎨 Generating 4 device reference variants...");

const deviceReferenceResult = await ctx.runAction(
  internal.utils.fal.falImageActions.geminiFlashTextToImage,
  {
    prompt: deviceReferencePrompt,
    num_images: 4,  // Generate 4 variants
    image_size: "portrait_9_16",
    output_format: "png",
  }
);

const deviceImages = deviceReferenceResult.images;
console.log(`✅ Generated ${deviceImages.length} device frame variants`);

// Score all 4 in parallel using BAML
console.log("🔍 Analyzing device frames in parallel...");

const scorePromises = deviceImages.map(async (img, index) => {
  console.log(`  [${index + 1}/4] Scoring device frame...`);
  const score = await b.ScoreDeviceFrameImage({
    device_image: { url: img.url }
  });
  console.log(`  [${index + 1}/4] Score: ${score.score}/100 - Frontal: ${score.is_frontal_view}`);
  return { url: img.url, score, index };
});

const scoredImages = await Promise.all(scorePromises);

// Find the best one (highest score, must be frontal view)
const frontalImages = scoredImages.filter(s => s.score.is_frontal_view);
const bestImage = frontalImages.length > 0
  ? frontalImages.sort((a, b) => b.score.score - a.score.score)[0]
  : scoredImages.sort((a, b) => b.score.score - a.score.score)[0]; // Fallback

if (!frontalImages.length) {
  console.warn("⚠️ No perfect frontal view found, using best available:", {
    score: bestImage.score.score,
    issues: bestImage.score.issues
  });
} else {
  console.log("✅ Selected best device frame:", {
    index: bestImage.index,
    score: bestImage.score.score,
    reasoning: bestImage.score.reasoning
  });
}

// Upload the selected one to storage
const deviceResponse = await fetch(bestImage.url);
const deviceBlob = await deviceResponse.blob();
const deviceReferenceImageStorageId = await uploadImageToStorage(ctx, deviceBlob);
```

### 3. Scoring Criteria

The BAML function scores each image based on:

- **Orientation**: Must be vertical/portrait
- **Angle**: Direct frontal view (0° tilt)
- **Perspective**: Flat 2D, no 3D depth
- **Visibility**: Only front visible, no side edges or buttons
- **Completeness**: All 4 corners visible
- **Style**: Flat graphic, not photo/render

**Scoring Scale:**
- `100`: Perfect direct frontal view, all criteria met
- `80-99`: Mostly frontal but minor issues (slight tilt <5°)
- `50-79`: Some tilt or perspective visible
- `0-49`: Strong tilt, side view, or 3D perspective

### 4. Fallback Logic

```typescript
// Prefer frontal views
const frontalImages = scoredImages.filter(s => s.score.is_frontal_view);

if (frontalImages.length > 0) {
  // Pick highest scored frontal view
  bestImage = frontalImages.sort((a, b) => b.score.score - a.score.score)[0];
} else {
  // No perfect frontal views - pick least bad option
  bestImage = scoredImages.sort((a, b) => b.score.score - a.score.score)[0];
  console.warn("No perfect frontal view found");
}
```

## Future Enhancements

### Option 1: User Selection UI (Alternative)
Instead of auto-selection, show user all 4 variants and let them choose:
- **Pros**: User has final say, can pick based on aesthetics
- **Cons**: Requires user interaction, slows workflow

### Option 2: Retry Generation
If all 4 scores are below threshold (e.g., <80), regenerate another batch:
- **Pros**: Higher chance of perfect result
- **Cons**: Slower, higher cost, might never converge

### Option 3: Hybrid Approach
Auto-select if any image scores >90, otherwise show user options:
- **Pros**: Best of both worlds
- **Cons**: More complex UX

## Cost Analysis

### Current (1 device image per style):
- 1x Gemini Flash text-to-image generation

### Proposed (4 images + BAML scoring):
- 4x Gemini Flash text-to-image generation (4x current cost)
- 4x BAML analysis with medium model (~$0.0001 per analysis)

**Net increase:** ~4x generation cost + negligible analysis cost
**Trade-off:** Worth it for 4x higher reliability and automated selection

## Testing Plan

1. Test with existing styles that had tilt issues
2. Generate 100 device frames, verify frontal view success rate
3. Compare BAML scoring accuracy vs manual human review
4. Test fallback logic with intentionally bad prompts
5. Measure end-to-end performance impact

## Related Issues

- Device reference images currently not used in screenshot generation (docs/learnings/device-reference-removal.md)
- Future: Re-enable device reference usage once auto-selection ensures frontal views

## References

- BAML documentation: https://docs.boundaryml.com
- Current device frame generation: `convex/styleActions.ts:92-118`
- Device reference prompt specs: `baml_src/styles.baml:92-127`
