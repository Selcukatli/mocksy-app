# Style Creation Advanced Controls

**Status:** Completed
**Priority:** Medium
**Created:** 2025-10-02
**Started:** 2025-10-02
**Completed:** 2025-10-02

## Problem Statement

Currently, the style creation dialog only has:
1. **Description textarea** - General description of the style
2. **Reference image** - Optional inspiration image

Users have limited control over specific aspects of the style. If they want to specify exact details for background, text styling, device frame, or decorative elements, they have to hope the AI interprets their description correctly.

## Proposed Solution

Add **optional advanced control inputs** in the style dialog under a "More Details" expandable section:

### Fields to Add

1. **Background Style** (optional)
   - Maps to: `background_color` in BAML
   - Placeholder: "e.g., gradient from dark purple to bright orange"
   - Examples: "bright yellow solid", "radial gradient navy to magenta"

2. **Text Style** (optional)
   - Maps to: `text_style` in BAML
   - Placeholder: "e.g., Impact font, white with thick black outline"
   - Examples: "Bold sans-serif, cyan with glow", "Futuristic font, gradient text"

3. **Device Frame Style** (optional)
   - Maps to: `device_style` in BAML
   - Placeholder: "e.g., Glossy black frame with neon cyan glow"
   - Examples: "Matte silver with holographic coating", "Wood texture finish"

4. **Decorative Elements** (optional)
   - Maps to: `details` in BAML
   - Placeholder: "e.g., Palm trees, geometric shapes, grid patterns at edges"
   - Examples: "Emojis (80-100px, 3-4 at edges), star sparkles scattered", "Minimal zen circles at corners"

### UI/UX Design

#### Collapsed State (Default)
```
┌─────────────────────────────────────────────┐
│ Describe your style                         │
│ ┌─────────────────────────────────────────┐ │
│ │ e.g., Cyberpunk neon with dark purple   │ │
│ │ gradient, futuristic typography...      │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Reference Image Upload Area]              │
│                                             │
│ ▼ More Details (optional)                  │
└─────────────────────────────────────────────┘
```

#### Expanded State
```
┌─────────────────────────────────────────────┐
│ Describe your style                         │
│ ┌─────────────────────────────────────────┐ │
│ │ ...                                     │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Reference Image Upload Area]              │
│                                             │
│ ▲ More Details (optional)                  │
│                                             │
│ Background Style (optional)                 │
│ ┌─────────────────────────────────────────┐ │
│ │ e.g., gradient dark purple to orange   │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Text Style (optional)                       │
│ ┌─────────────────────────────────────────┐ │
│ │ e.g., Impact font, white with outline  │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Device Frame Style (optional)               │
│ ┌─────────────────────────────────────────┐ │
│ │ e.g., Glossy black with cyan glow      │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Decorative Elements (optional)              │
│ ┌─────────────────────────────────────────┐ │
│ │ e.g., Palm trees, grid patterns        │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Implementation Details

### 1. Update BAML Function Signature

Add optional parameters to `GenerateStyleFromDescription` in `baml_src/styles.baml`:

```baml
function GenerateStyleFromDescription(
  description: string @description("User's text description of desired style"),
  style_name: string? @description("Optional user-provided style name. If not provided, AI will generate one."),
  reference_image: image? @description("Optional reference/inspiration image"),
  // NEW: Optional specific style controls
  background_style: string? @description("Optional specific background color/gradient instructions"),
  text_style: string? @description("Optional specific typography styling instructions"),
  device_style: string? @description("Optional specific device frame styling instructions"),
  decorative_elements: string? @description("Optional specific decorative elements instructions")
) -> StyleGenerationOutput {
  client ScreenshotGeneratorHigh
  prompt #"
    {{ _.role("user") }}

    You are an expert style designer analyzing user descriptions to create screenshot styles.

    USER DESCRIPTION: "{{ description }}"
    {% if style_name %}
    USER-PROVIDED STYLE NAME: "{{ style_name }}"
    {% endif %}
    {% if reference_image %}
    REFERENCE IMAGE FOR INSPIRATION:
    {{ reference_image }}
    ...
    {% endif %}

    {% if background_style or text_style or device_style or decorative_elements %}
    ## USER-SPECIFIED STYLE OVERRIDES

    The user has provided specific styling requirements. These OVERRIDE and take precedence over
    the general description. Use these exact specifications:

    {% if background_style %}
    **REQUIRED background_color**: {{ background_style }}
    {% endif %}

    {% if text_style %}
    **REQUIRED text_style**: {{ text_style }}
    {% endif %}

    {% if device_style %}
    **REQUIRED device_style**: {{ device_style }}
    {% endif %}

    {% if decorative_elements %}
    **REQUIRED details**: {{ decorative_elements }}
    {% endif %}
    {% endif %}

    TASK: Generate a complete style specification.

    // Rest of prompt...
  "#
}
```

### 2. Update Frontend (src/app/styles/page.tsx)

Add state and UI:

```typescript
// Add state (around line 35-40)
const [showAdvancedControls, setShowAdvancedControls] = useState(false);
const [backgroundStyle, setBackgroundStyle] = useState('');
const [textStyleInput, setTextStyleInput] = useState('');
const [deviceStyleInput, setDeviceStyleInput] = useState('');
const [decorativeElements, setDecorativeElements] = useState('');

// Update handleGenerateStyle (around line 240)
await generateStyleFromDescription({
  description: descriptionForGeneration,
  referenceImageStorageId,
  // Add optional fields if provided
  backgroundStyle: backgroundStyle.trim() || undefined,
  textStyle: textStyleInput.trim() || undefined,
  deviceStyle: deviceStyleInput.trim() || undefined,
  decorativeElements: decorativeElements.trim() || undefined,
});

// Add to dialog content (around line 543, after reference image upload)
{/* Advanced Controls - Expandable */}
<div className="col-span-2 border-t pt-4 mt-2">
  <button
    type="button"
    onClick={() => setShowAdvancedControls(!showAdvancedControls)}
    className="flex w-full items-center justify-between text-sm font-medium hover:text-primary transition-colors"
  >
    <span>More Details (optional)</span>
    <ChevronDown
      className={`h-4 w-4 transition-transform ${showAdvancedControls ? 'rotate-180' : ''}`}
    />
  </button>

  {showAdvancedControls && (
    <div className="mt-4 space-y-4">
      {/* Background Style */}
      <div>
        <label htmlFor="background-style" className="text-sm font-medium mb-1.5 block">
          Background Style <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          id="background-style"
          type="text"
          value={backgroundStyle}
          onChange={(e) => setBackgroundStyle(e.target.value)}
          placeholder="e.g., gradient from dark purple to bright orange"
          className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Text Style */}
      <div>
        <label htmlFor="text-style" className="text-sm font-medium mb-1.5 block">
          Text Style <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          id="text-style"
          type="text"
          value={textStyleInput}
          onChange={(e) => setTextStyleInput(e.target.value)}
          placeholder="e.g., Impact font, white with thick black outline"
          className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Device Frame Style */}
      <div>
        <label htmlFor="device-style" className="text-sm font-medium mb-1.5 block">
          Device Frame Style <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          id="device-style"
          type="text"
          value={deviceStyleInput}
          onChange={(e) => setDeviceStyleInput(e.target.value)}
          placeholder="e.g., Glossy black frame with neon cyan glow"
          className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Decorative Elements */}
      <div>
        <label htmlFor="decorative-elements" className="text-sm font-medium mb-1.5 block">
          Decorative Elements <span className="text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="decorative-elements"
          value={decorativeElements}
          onChange={(e) => setDecorativeElements(e.target.value)}
          placeholder="e.g., Palm trees, geometric shapes, grid patterns at edges"
          className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px] resize-none"
        />
      </div>
    </div>
  )}
</div>
```

### 3. Update Convex Action

Update `convex/styleActions.ts` to accept and pass optional parameters:

```typescript
export const generateStyleFromDescription = internalAction({
  args: {
    description: v.string(),
    styleName: v.optional(v.string()),
    referenceImageStorageId: v.optional(v.id("_storage")),
    // NEW: Optional style overrides
    backgroundStyle: v.optional(v.string()),
    textStyle: v.optional(v.string()),
    deviceStyle: v.optional(v.string()),
    decorativeElements: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // ... existing code ...

    const styleGeneration = await b.GenerateStyleFromDescription({
      description: args.description,
      style_name: args.styleName ?? null,
      reference_image: referenceImageUrl ? { url: referenceImageUrl } : null,
      // Pass optional overrides
      background_style: args.backgroundStyle ?? null,
      text_style: args.textStyle ?? null,
      device_style: args.deviceStyle ?? null,
      decorative_elements: args.decorativeElements ?? null,
    });

    // ... rest of code ...
  },
});
```

## Benefits

1. **More Control** - Users can specify exact details for each style component
2. **Hybrid Approach** - Can use general description + specific overrides
3. **Better Results** - AI has explicit instructions for critical styling
4. **Flexibility** - Still optional - users can use general description only
5. **Power User Feature** - Advanced users get granular control

## User Experience Flow

### Scenario 1: Basic User
1. Enter general description: "cyberpunk neon with pink and blue"
2. Skip advanced controls
3. Generate → AI infers all style components

### Scenario 2: Advanced User
1. Enter general description: "retro vaporwave"
2. Expand "More Details"
3. Specify:
   - Background: "gradient from deep purple #8B3A8F to hot pink #FF6EC7"
   - Text Style: "Bold futuristic, cyan to pink gradient"
   - Device: "Glossy black with holographic coating, neon pink glow"
   - Elements: "Cyan palm trees (80-100px, 2-3), pink grid patterns at corners"
4. Generate → AI uses exact specifications

### Scenario 3: Reference Image + Overrides
1. Upload reference image
2. Leave description empty or minimal
3. Override specific aspect: "Change background to solid yellow instead"
4. Generate → AI uses reference but respects override

## Testing Plan

1. Test with only description (no advanced controls)
2. Test with only advanced controls (no description)
3. Test with description + partial advanced controls
4. Test with description + all advanced controls filled
5. Test with reference image + advanced overrides
6. Verify BAML prompt properly prioritizes user overrides

## Future Enhancements

### Visual Style Pickers
Instead of text inputs, add visual pickers:
- **Background**: Color picker + gradient builder
- **Text**: Font selector + style presets
- **Device**: Frame color picker + effect toggles
- **Elements**: Icon/emoji selector with placement grid

### Save as Template
Allow users to save their advanced control presets for reuse

### Copy from Existing Style
Button to populate advanced controls from an existing style

## References

- Current style dialog: `src/app/styles/page.tsx:482-702`
- BAML style generation: `baml_src/styles.baml:22-173`
- Convex style action: `convex/styleActions.ts`
- Style config fields: `baml_src/styles.baml:69-90`
