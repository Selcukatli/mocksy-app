# AI Style Generation System

## Overview
AI-powered system to generate screenshot styles from text descriptions using BAML + FAL AI models.

## Status: Planning Phase
- [ ] BAML function implementation
- [ ] Convex action implementation
- [ ] Image generation integration
- [ ] Storage upload utilities
- [ ] Testing

---

## User Flow

1. **User Input:** Text description (e.g., "cyberpunk neon with pink and blue colors")
2. **BAML Processing:** Analyze description → Generate structured output
3. **Image Generation:** Create device reference + preview card
4. **Storage:** Upload images to Convex
5. **Database:** Save complete style with all metadata

---

## Architecture Components

### 1. BAML Function (`baml_src/screenshotStyles.baml`)
**Function:** `GenerateStyleFromDescription`

**Input:**
- `description: string` - User's text description
- `reference_image: image?` - Optional inspiration image

**Output:** `StyleGenerationOutput`
```typescript
{
  style_config: {
    background_color: string,
    details: string,
    text_style: string,
    device_style: string
  },
  device_reference_prompt: string,
  preview_image_prompt: string
}
```

### 2. Convex Action (`convex/screenshotStyleActions.ts`)
**Action:** `generateStyleFromDescription`

**Orchestration Flow:**
1. Call BAML → Get style analysis
2. Generate device reference (Seed Dream 4)
3. Generate preview card (Gemini Flash)
4. Upload both images to storage
5. Save to database

### 3. Image Generation

#### Device Reference Image
- **Model:** Seed Dream 4 (`seedDream4TextToImage`)
- **Dimensions:** 1290x2796 (portrait iPhone)
- **Purpose:** Reference for device frame styling
- **Why Seed Dream 4:** Supports custom dimensions

#### Preview Style Card
- **Model:** Gemini 2.5 Flash (`geminiFlashTextToImage`)
- **Dimensions:** Default (square-ish)
- **Purpose:** Style showcase card for web app browsing
- **Why Gemini Flash:** Same model used for actual screenshot generation (consistency)

### 4. Database Schema
Uses existing `screenshotStyles` table:
- `backgroundColor`, `details`, `textStyle`, `deviceStyle` from `style_config`
- `deviceReferenceImageStorageId` from device image
- `previewImageStorageId` from preview card

---

## Key Design Decisions

### Model Selection
| Component | Model | Rationale |
|-----------|-------|-----------|
| BAML Analysis | Claude Sonnet 4.5 | Best for creative prompt generation |
| Device Reference | Seed Dream 4 | Custom dimensions support |
| Preview Card | Gemini 2.5 Flash ✅ | Same as production screenshots |

### Visual Consistency Strategy
Preview cards use **Gemini 2.5 Flash** (same model as final screenshot generation) to ensure users see accurate style representation.

### Preview Image Format
- **NOT a full screenshot** - pure style showcase card
- **Square format** for easy card display in UI
- **Shows:** Background, colors, decorative elements, text style, mood
- **Use case:** Browseable style gallery

---

## Example Output

### Input
```
description: "cyberpunk neon with pink and blue colors"
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
  device_reference_prompt: "Generate a vertical iPhone 16 Pro device frame with glossy black metal finish and bright neon cyan glowing edges, futuristic cyberpunk aesthetic...",
  preview_image_prompt: "Square style showcase card with neon pink and cyan gradient background, holographic circuit patterns, futuristic bold text, high-tech cyberpunk aesthetic..."
}
```

### Generated Images
1. **Device Reference:** 1290x2796 portrait device frame
2. **Preview Card:** Square style showcase card (Gemini Flash)

---

## Implementation Checklist

### Phase 1: BAML Function
- [ ] Create `GenerateStyleFromDescription` function
- [ ] Define `StyleConfig` class
- [ ] Define `StyleGenerationOutput` class
- [ ] Write comprehensive prompt
- [ ] Add test cases (cyberpunk, halloween, minimalist)
- [ ] Generate TypeScript client

### Phase 2: Convex Action
- [ ] Create `screenshotStyleActions.ts`
- [ ] Implement `generateStyleFromDescription` action
- [ ] Add image download utility
- [ ] Add storage upload utility
- [ ] Add error handling
- [ ] Add logging

### Phase 3: Testing
- [ ] Test BAML function in playground
- [ ] Test Seed Dream 4 device generation
- [ ] Test Gemini Flash preview generation
- [ ] Test storage uploads
- [ ] Test database mutation
- [ ] Test end-to-end flow

### Phase 4: Future Enhancements
- [ ] Frontend UI for style generation
- [ ] Edit generated styles
- [ ] Style variations/remixes
- [ ] Style versioning
- [ ] Batch style generation

---

## Files

### New Files
- `baml_src/screenshotStyles.baml` - BAML function
- `convex/screenshotStyleActions.ts` - Convex action
- `docs/features/styleGeneration/` - Documentation

### Modified Files
- None (using existing schema and FAL actions)

---

## Related Documentation
- [BAML Rules](../../rules/baml-rules.md)
- [FAL MCP Integration](../../rules/fal-mcp-integration.md)
- [Screenshot Styles Schema](../../schema/screenshotStyles.md)

---

## Notes
- Preview card dimensions may vary based on Gemini Flash output
- Consider adding style categories auto-generation
- Future: Support style evolution/variations
- Future: Community style sharing
