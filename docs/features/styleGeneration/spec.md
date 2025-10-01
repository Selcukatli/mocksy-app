# AI Style Generation System - Specification

**Status:** Planning Phase

**Last Updated:** 2025-10-01

---

## Overview

AI-powered system to generate screenshot styles from text descriptions using BAML + FAL AI models.

### User Flow
1. **Input:** Text description (e.g., "cyberpunk neon with pink and blue colors")
2. **BAML Analysis:** Generate structured style configuration
3. **Image Generation:** Create device reference + preview card
4. **Storage:** Upload images to Convex
5. **Database:** Save complete style

---

## Architecture

### 1. BAML Function

**Location:** `baml_src/screenshotStyles.baml`

**Function:** `GenerateStyleFromDescription`

**Input:**
```baml
function GenerateStyleFromDescription(
  description: string,
  reference_image: image?  // Optional inspiration image
) -> StyleGenerationOutput
```

**Output Classes:**
```baml
class StyleConfig {
  background_color string
  details string
  text_style string
  device_style string
}

class StyleGenerationOutput {
  style_config StyleConfig
  device_reference_prompt string
  preview_image_prompt string
}
```

**LLM Client:** `ScreenshotGeneratorHigh` (Claude Sonnet 4.5 → Gemini 2.5 Pro → GPT5 fallback chain)

---

### 2. Convex Action

**Location:** `convex/screenshotStyleActions.ts`

**Action:** `generateStyleFromDescription`

**Signature:**
```typescript
export const generateStyleFromDescription = internalAction({
  args: {
    description: v.string(),
    referenceImageUrl: v.optional(v.string()),
  },
  returns: v.id("screenshotStyles"),
  handler: async (ctx, args) => { ... }
});
```

**Flow:**
```
1. Call BAML → Get StyleGenerationOutput
   ├─ style_config { background_color, details, text_style, device_style }
   ├─ device_reference_prompt
   └─ preview_image_prompt

2. Generate Device Reference Image
   ├─ Model: seedDream4TextToImage
   ├─ Dimensions: { width: 1290, height: 2796 }
   ├─ Prompt: device_reference_prompt
   ├─ Download from FAL URL
   ├─ Upload to Convex storage
   └─ Result: deviceReferenceImageStorageId

3. Generate Preview Style Card
   ├─ Model: geminiFlashTextToImage ⭐
   ├─ Dimensions: Default (square)
   ├─ Prompt: preview_image_prompt
   ├─ Download from FAL URL
   ├─ Upload to Convex storage
   └─ Result: previewImageStorageId

4. Save to Database
   ├─ Call: internal.screenshotStyles.createStyle
   ├─ Pass: style_config fields
   ├─ Pass: deviceReferenceImageStorageId
   ├─ Pass: previewImageStorageId
   └─ Result: styleId
```

---

### 3. Image Generation Strategy

#### Device Reference Image
- **Model:** Seed Dream 4 (`seedDream4TextToImage`)
- **Dimensions:** 1290x2796 (portrait iPhone)
- **Purpose:** Reference for device frame styling
- **Why Seed Dream 4:** Supports custom dimensions

#### Preview Style Card ⭐
- **Model:** Gemini 2.5 Flash (`geminiFlashTextToImage`)
- **Dimensions:** Default (square format)
- **Purpose:** Style showcase card for web app browsing
- **Content:** Background, colors, decorative elements, text sample (NO device mockup)
- **Why Gemini Flash:** Same model used for actual screenshot generation (ensures visual consistency)

---

## Key Design Decisions

### Model Selection
| Component | Model | Rationale |
|-----------|-------|-----------|
| BAML Analysis | Claude Sonnet 4.5 | Best for creative prompt generation |
| Device Reference | Seed Dream 4 | Custom dimensions support (1290x2796) |
| Preview Card | Gemini 2.5 Flash ✅ | **Same as production screenshots** |

### Visual Consistency Strategy
Preview cards use **Gemini 2.5 Flash** (same model as final screenshot generation) to ensure users see accurate style representation.

### Preview Card Format
- **Square format** for easy card display in UI
- **Pure style showcase** - NOT a full screenshot mockup
- **Shows:** Background, colors, decorative elements, text style, mood
- **Use case:** Browseable style gallery

---

## Implementation Details

### BAML Prompt Engineering

**Key Requirements:**

1. **Style Config Fields** (for database)
   - Extract visual attributes from description
   - Be specific but concise (10-100 words each)
   - Focus only on visual styling

2. **Device Reference Prompt**
   - Describe isolated device frame
   - Include dimensions (1290x2796)
   - Focus on frame styling: colors, materials, effects
   - Must work with Seed Dream 4 model

3. **Preview Image Prompt**
   - Square format showcase card
   - **NO device mockup**
   - Show style essence: colors, decorative elements, text sample
   - Must work with Gemini 2.5 Flash model

**Example Prompts:**

*Cyberpunk Style:*
- **device_reference_prompt:** "Generate a vertical iPhone 16 Pro device frame, 1290x2796 dimensions, glossy black metal finish with bright neon cyan glowing edges, futuristic cyberpunk aesthetic..."
- **preview_image_prompt:** "Square style showcase card with neon pink and cyan gradient background, holographic circuit patterns, futuristic bold text, high-tech cyberpunk aesthetic. Pure style preview, no device."

---

### Convex Action Implementation

#### Step 1: BAML Integration
```typescript
import { b } from "../../baml_client";
import pkg from "@boundaryml/baml";
const { Image } = pkg;

const styleOutput = await b.GenerateStyleFromDescription(
  args.description,
  args.referenceImageUrl ? Image.fromUrl(args.referenceImageUrl) : undefined
);
```

#### Step 2: Device Image Generation
```typescript
const deviceResult = await ctx.runAction(
  internal.utils.fal.falImageActions.seedDream4TextToImage,
  {
    prompt: styleOutput.device_reference_prompt,
    image_size: { width: 1290, height: 2796 },
    num_images: 1,
    output_format: "png",
  }
);
```

#### Step 3: Preview Image Generation
```typescript
const previewResult = await ctx.runAction(
  internal.utils.fal.falImageActions.geminiFlashTextToImage,
  {
    prompt: styleOutput.preview_image_prompt,
    num_images: 1,
    output_format: "png",
  }
);
```

#### Step 4: Storage Upload Helper
```typescript
async function uploadImageToStorage(
  ctx: ActionCtx,
  imageUrl: string,
  fileName: string
): Promise<Id<"_storage">> {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  return await ctx.storage.store(blob);
}

const deviceReferenceImageStorageId = await uploadImageToStorage(
  ctx,
  deviceResult.images[0].url,
  `device-${Date.now()}.png`
);

const previewImageStorageId = await uploadImageToStorage(
  ctx,
  previewResult.images[0].url,
  `preview-${Date.now()}.png`
);
```

#### Step 5: Database Mutation
```typescript
const styleId = await ctx.runMutation(
  internal.screenshotStyles.createStyle,
  {
    name: generateName(args.description),
    slug: generateSlug(args.description),
    description: args.description,
    isPublic: true,
    isSystemStyle: false,
    backgroundColor: styleOutput.style_config.background_color,
    details: styleOutput.style_config.details,
    textStyle: styleOutput.style_config.text_style,
    deviceStyle: styleOutput.style_config.device_style,
    deviceReferenceImageStorageId,
    previewImageStorageId,
  }
);
```

---

## Error Handling Strategy

**Graceful Degradation:** Save style even if image generation fails.

```typescript
let deviceReferenceImageStorageId: Id<"_storage"> | undefined;
let previewImageStorageId: Id<"_storage"> | undefined;

try {
  // Generate device image
  deviceReferenceImageStorageId = await generateDeviceImage(...);
} catch (error) {
  console.error("Device image failed:", error);
  // Continue without device image
}

try {
  // Generate preview image
  previewImageStorageId = await generatePreviewImage(...);
} catch (error) {
  console.error("Preview image failed:", error);
  // Continue without preview image
}

// Save style with whatever images succeeded
await ctx.runMutation(internal.screenshotStyles.createStyle, {
  // ... other fields
  deviceReferenceImageStorageId, // May be undefined
  previewImageStorageId, // May be undefined
});
```

---

## Test Cases

### BAML Test Cases (in playground)

```baml
test CyberpunkStyle {
  functions [GenerateStyleFromDescription]
  args {
    description "cyberpunk neon with pink and blue colors"
  }
}

test HalloweenStyle {
  functions [GenerateStyleFromDescription]
  args {
    description "spooky Halloween with orange and purple gradient"
  }
}

test MinimalistStyle {
  functions [GenerateStyleFromDescription]
  args {
    description "clean minimalist with soft pastels and zen vibes"
  }
}
```

### Integration Tests (Convex dashboard)

```typescript
// Test via Convex dashboard
await ctx.runAction(
  internal.screenshotStyleActions.generateStyleFromDescription,
  { description: "cyberpunk neon with pink and blue colors" }
);
```

---

## Implementation Checklist

### Phase 1: BAML Function ✅ COMPLETED
- [x] Create `baml_src/screenshotStyles.baml`
- [x] Define `StyleConfig` class (reused existing)
- [x] Define `StyleGenerationOutput` class
- [x] Implement `GenerateStyleFromDescription` function
- [x] Write comprehensive prompt
- [x] Add test cases (cyberpunk, halloween, minimalist)
- [x] Run `npm run baml:generate`
- [x] Test with BAML CLI - all tests passed!

### Phase 2: Convex Action ✅ COMPLETED
- [x] Create `convex/screenshotStyleActions.ts`
- [x] Implement BAML integration
- [x] Implement device image generation (Seed Dream 4)
- [x] Implement preview image generation (Gemini Flash)
- [x] Implement storage upload helper
- [x] Implement database mutation with auto-generated name/slug
- [x] Add error handling with graceful degradation
- [x] Add comprehensive logging
- [x] Add helper functions (extractTags, categorizeStyle)

### Phase 3: Testing ⏳ READY FOR TESTING
- [x] Test BAML function with CLI (cyberpunk, halloween, minimalist - all passed!)
- [ ] Test end-to-end flow via Convex (requires internet connection)
- [ ] Verify device image generation works
- [ ] Verify preview image generation works
- [ ] Verify storage uploads
- [ ] Verify database records created correctly
- [ ] Test error scenarios

### Phase 4: Future Enhancements
- [ ] Frontend UI for style generation
- [ ] Auto-categorization
- [ ] Auto-tagging
- [ ] Style editing
- [ ] Style variations/remixes
- [ ] Style versioning

---

## Expected Performance

**Duration:** ~20-40 seconds total
- BAML analysis: 2-5 seconds
- Device image generation: 10-20 seconds
- Preview image generation: 5-10 seconds
- Storage uploads: 2-4 seconds

---

## Database Schema

**Table:** `screenshotStyles`

Uses existing schema (no changes needed):
- `backgroundColor`, `details`, `textStyle`, `deviceStyle` ← from `style_config`
- `deviceReferenceImageStorageId` ← device image
- `previewImageStorageId` ← preview card
- `name`, `slug`, `description`, `tags`, `category`

---

## Files

### New Files
- `baml_src/screenshotStyles.baml` - BAML function
- `convex/screenshotStyleActions.ts` - Convex action

### Modified Files
- None (uses existing schema and FAL actions)

---

## Example Output

### Input
```json
{
  "description": "cyberpunk neon with pink and blue colors"
}
```

### BAML Output
```typescript
{
  style_config: {
    background_color: "radial gradient from dark navy through deep purple to bright magenta",
    details: "Neon cyan hexagons, glowing circuit lines, pink grid squares, holographic particles",
    text_style: "Bold futuristic font, white with cyan outline and neon glow",
    device_style: "Glossy black frame with neon cyan edge glow"
  },
  device_reference_prompt: "Generate a vertical iPhone 16 Pro device frame, 1290x2796 dimensions, glossy black metal finish with bright neon cyan glowing edges...",
  preview_image_prompt: "Square style showcase card with neon pink and cyan gradient background, holographic circuit patterns, futuristic bold text..."
}
```

### Generated Images
1. **Device Reference:** 1290x2796 portrait device frame
2. **Preview Card:** Square style showcase (Gemini Flash)

### Database Record
```typescript
{
  _id: "jx...",
  name: "Cyberpunk Neon With Pink",
  slug: "cyberpunk-neon-with-pink-and-blue-colors",
  description: "cyberpunk neon with pink and blue colors",
  backgroundColor: "radial gradient from dark navy through deep purple to bright magenta",
  details: "Neon cyan hexagons, glowing circuit lines...",
  textStyle: "Bold futuristic font, white with cyan outline...",
  deviceStyle: "Glossy black frame with neon cyan edge glow",
  deviceReferenceImageStorageId: "kg...",
  previewImageStorageId: "kg...",
  isPublic: true,
  isSystemStyle: false,
  // ...
}
```

---

## Related Documentation
- [BAML Rules](../../rules/baml-rules.md)
- [FAL MCP Integration](../../rules/fal-mcp-integration.md)
- [Convex Rules](../../rules/convex-rules.mdc)

---

## Notes
- Preview card dimensions may vary based on Gemini Flash default output
- Consider adding style categories auto-generation
- Future: Support style evolution/variations
- Future: Community style sharing
- Future: Style quality scoring system
