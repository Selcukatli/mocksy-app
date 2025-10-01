# BAML Function Specification

## Status: Planning

---

## Function Definition

### Name
`GenerateStyleFromDescription`

### Location
`baml_src/screenshotStyles.baml`

### Purpose
Analyze user's text description and generate structured style configuration with image generation prompts.

---

## Input Parameters

```baml
function GenerateStyleFromDescription(
  description: string @description("User's text description of desired style"),
  reference_image: image? @description("Optional reference/inspiration image")
) -> StyleGenerationOutput
```

### Parameters
- **description** (required): User's natural language description
  - Examples: "cyberpunk neon with pink and blue colors", "spooky Halloween orange and purple"
- **reference_image** (optional): URL or image for style inspiration
  - Use case: User provides existing screenshot for style matching

---

## Output Structure

### StyleGenerationOutput Class

```baml
class StyleConfig {
  background_color string @description("Background color description (e.g., 'bright yellow solid color', 'gradient from purple to orange')")

  details string @description("Decorative elements description - emojis, shapes, placement strategy (e.g., 'pop art emojis at edges, star sparkles, comic style')")

  text_style string @description("Text styling - font, weight, color, effects (e.g., 'Impact font, bold, white with black outline')")

  device_style string @description("Device frame styling - colors, materials, effects (e.g., 'colorful neon rainbow frame with glossy finish')")
}

class StyleGenerationOutput {
  // Database fields
  style_config StyleConfig @description("Style configuration that goes directly to database")

  // Image generation prompts
  device_reference_prompt string @description("Complete prompt for generating device frame reference image. Should describe isolated iPhone 16 Pro frame with styling applied. Example: 'Generate a colorful neon rainbow iPhone 16 Pro frame with glossy metallic finish and glowing edges, portrait orientation, 1290x2796 dimensions'")

  preview_image_prompt string @description("Complete prompt for generating square style showcase card. Should describe a visual representation of the style WITHOUT device mockup. Example: 'Square style showcase card with neon pink and cyan gradient background, holographic circuit patterns, futuristic bold text, cyberpunk aesthetic'")
}
```

---

## LLM Client Configuration

### Primary Client
```baml
client ScreenshotGeneratorHigh
```

### Fallback Chain
1. ClaudeSonnet45 (primary)
2. Gemini25Pro
3. GPT5
4. ClaudeSonnet4
5. MistralLarge

### Rationale
Claude Sonnet 4.5 excels at creative prompt generation and structured outputs.

---

## Prompt Engineering Strategy

### Key Requirements

1. **Style Config Fields**
   - Extract from user description
   - Be specific but concise
   - Use descriptive language for visual elements
   - Focus on visual attributes only

2. **Device Reference Prompt**
   - Describe isolated device frame
   - Include dimensions (1290x2796)
   - Focus on frame styling (colors, materials, effects)
   - Should work with Seed Dream 4 model

3. **Preview Image Prompt**
   - Square format showcase card
   - NO device mockup
   - Show style essence: colors, decorative elements, text sample
   - Should work with Gemini 2.5 Flash model

### Prompt Template Structure

```baml
prompt #"
  {{ _.role("user") }}

  You are an expert style designer analyzing user descriptions to create screenshot styles.

  USER DESCRIPTION: {{ description }}
  {% if reference_image %}
  REFERENCE IMAGE: {{ reference_image }}
  {% endif %}

  TASK: Generate a complete style specification with:

  1. STYLE CONFIG (for database):
     - background_color: Describe colors and type (solid/gradient/pattern)
     - details: Describe decorative elements (what, where, how many)
     - text_style: Describe typography (font, weight, color, effects)
     - device_style: Describe device frame appearance

  2. DEVICE REFERENCE PROMPT:
     Generate a complete prompt for creating an iPhone 16 Pro device frame
     - Portrait orientation, 1290x2796 dimensions
     - Focus ONLY on frame styling
     - Include: frame color, material, finish, special effects

  3. PREVIEW IMAGE PROMPT:
     Generate a complete prompt for a square style showcase card
     - Square format (no specific dimensions)
     - Shows style essence WITHOUT device mockup
     - Include: background, colors, decorative elements, text sample
     - Should capture the mood/vibe of the style

  {{ ctx.output_format }}
"#
```

---

## Test Cases

### Test 1: Cyberpunk Style
```baml
test CyberpunkStyle {
  functions [GenerateStyleFromDescription]
  args {
    description "cyberpunk neon with pink and blue colors"
  }
}
```

**Expected Output:**
- Style config with neon colors, futuristic elements
- Device prompt describing glowing frame
- Preview prompt for tech-aesthetic showcase card

### Test 2: Halloween Style
```baml
test HalloweenStyle {
  functions [GenerateStyleFromDescription]
  args {
    description "spooky Halloween with orange and purple gradient"
  }
}
```

**Expected Output:**
- Style config with Halloween colors, spooky elements
- Device prompt with themed frame
- Preview prompt for Halloween aesthetic card

### Test 3: Minimalist Style
```baml
test MinimalistStyle {
  functions [GenerateStyleFromDescription]
  args {
    description "clean minimalist with soft pastels and zen vibes"
  }
}
```

**Expected Output:**
- Style config with soft colors, minimal elements
- Device prompt with clean frame
- Preview prompt for calm, minimal card

### Test 4: With Reference Image
```baml
test StyleFromReference {
  functions [GenerateStyleFromDescription]
  args {
    description "match this aesthetic"
    reference_image { url "https://example.com/inspiration.jpg" }
  }
}
```

**Expected Output:**
- Style config derived from reference image
- Prompts that capture reference aesthetic

---

## Validation Rules

### Style Config Fields
- ✅ All 4 fields must be non-empty strings
- ✅ Each should be 10-100 words
- ✅ Focus on visual attributes only
- ✅ Be descriptive but concise

### Device Reference Prompt
- ✅ Must mention "iPhone 16 Pro"
- ✅ Must mention portrait/vertical orientation
- ✅ Should mention dimensions (1290x2796)
- ✅ Focus on frame styling only
- ✅ Length: 50-200 words

### Preview Image Prompt
- ✅ Must NOT mention device/phone/mockup
- ✅ Should mention "style showcase card" or similar
- ✅ Should mention square format
- ✅ Must describe visual elements
- ✅ Length: 50-200 words

---

## Success Criteria

✅ Function generates valid `StyleGenerationOutput`
✅ Style config has all 4 fields populated
✅ Device prompt suitable for Seed Dream 4
✅ Preview prompt suitable for Gemini Flash
✅ Test cases pass in BAML playground
✅ Generated prompts produce good images

---

## Implementation Status

- [ ] Classes defined
- [ ] Function implemented
- [ ] Prompt written
- [ ] Test cases added
- [ ] TypeScript client generated
- [ ] Playground testing complete
- [ ] Integration tested

---

## Next Steps

1. Write comprehensive prompt template
2. Define all classes with descriptions
3. Add test cases
4. Generate TypeScript client
5. Test in BAML playground
6. Iterate on prompt based on results
