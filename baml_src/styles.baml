// Screenshot Style Generation BAML Domain
// Generates style configurations from text descriptions with AI-powered analysis

// ============================================
// STYLE GENERATION
// ============================================

// Note: StyleConfig class is defined in screenshots.baml and reused here

class StyleGenerationOutput {
  style_config StyleConfig @description("Style configuration for database storage")
  device_reference_prompt string @description("Complete prompt for generating device frame reference image at 1290x2796 dimensions")
  preview_image_prompt string @description("Complete prompt for generating square style showcase card (NO device mockup)")
}

// Generate style from user description
function GenerateStyleFromDescription(
  description: string @description("User's text description of desired style"),
  reference_image: image? @description("Optional reference/inspiration image")
) -> StyleGenerationOutput {
  client ScreenshotGeneratorHigh
  prompt #"
    {{ _.role("user") }}

    You are an expert style designer analyzing user descriptions to create screenshot styles.

    USER DESCRIPTION: "{{ description }}"
    {% if reference_image %}
    REFERENCE IMAGE FOR INSPIRATION:
    {{ reference_image }}
    {% endif %}

    TASK: Generate a complete style specification.

    ## 1. STYLE CONFIG (for database)

    Analyze the description and extract:

    **background_color**: Describe the background color(s) and type
    - Examples: "bright yellow solid color", "gradient from dark purple to bright orange", "radial gradient from navy to magenta"
    - Be specific about colors and how they blend

    **details**: Describe ALL decorative elements, their placement, sizes, and aesthetic
    - What elements: emojis, shapes, icons, patterns
    - Where placed: edges, corners, scattered, clustered
    - How many: specific counts or ranges
    - Visual style: pop art, minimalist, spooky, futuristic, etc.
    - Example: "Pop art style with smiley emojis (80-100px, 3-4 at edges), star sparkles (30-60px, 6-8 scattered), lightning bolts (50-70px, 2-3 at sides). Elements pushed to outer 10-15% border, center clear."

    **text_style**: Describe the typography styling
    - Font family and style (Impact, sans-serif, futuristic, elegant)
    - Weight (bold, extra bold, medium)
    - Color with effects (white with black outline, cyan with glow)
    - Example: "Impact font, extra bold 900 weight, white with thick 6px black outline and drop shadow"

    **device_style**: Describe how the device frame should look
    - Frame color and finish (glossy black, matte silver, rainbow)
    - Material (metal, glass, plastic)
    - Special effects (neon glow, holographic, wood texture)
    - Example: "Glossy midnight black frame with subtle cyan glow effect and thin bezels"

    ## 2. DEVICE REFERENCE PROMPT

    Generate a COMPLETE prompt for creating an iPhone 16 Pro device frame.

    YOU MUST START YOUR PROMPT WITH THESE EXACT CRITICAL CONSTRAINTS (copy verbatim, emphasize angle constraints):

    "CRITICAL LAYOUT RULES - MUST FOLLOW:
    - VERTICAL tall phone orientation
    - Facing DIRECTLY forward like a flat icon or emoji
    - Looking STRAIGHT at the screen, NOT from the side
    - You see ONLY the front - NO side edges visible, NO volume buttons visible
    - Complete phone showing - top to bottom, all 4 corners visible
    - Canvas: 1290x2796 vertical
    - Phone size: Very large, fills 96-97% of height
    - Phone screen: Solid flat [pick one color] fill - plain flat color, no patterns
    - Background: Solid [contrasting color] behind the phone
    - Style: Simple flat vector graphic like a design template, NOT a photo"

    THEN add your creative description:
    "iPhone 16 Pro flat mockup template. [Describe frame styling - colors, materials, glows, textures on frame edges only]. Dynamic Island at top. Flat 2D graphic template, NOT photograph, NOT 3D render."

    Length: 120-180 words total

    Example: "CRITICAL LAYOUT RULES - MUST FOLLOW:
    - VERTICAL tall phone orientation
    - Facing DIRECTLY forward like a flat icon or emoji
    - Looking STRAIGHT at the screen, NOT from the side
    - You see ONLY the front - NO side edges visible, NO volume buttons visible
    - Complete phone showing - top to bottom, all 4 corners visible
    - Canvas: 1290x2796 vertical
    - Phone size: Very large, fills 96-97% of height
    - Phone screen: Solid flat deep purple (#1A0B2E) fill - plain flat color, no patterns
    - Background: Solid bright cyan (#00F0FF) behind the phone
    - Style: Simple flat vector graphic like a design template, NOT a photo

    iPhone 16 Pro flat mockup template. Glossy black metallic frame with vibrant electric cyan (#00F0FF) neon glow on left edge and hot pink (#FF006E) neon glow on right edge. Holographic iridescent shimmer coating on frame with subtle circuit pattern etching. All decorative elements on frame edges only. Dynamic Island at top center. Flat 2D graphic template."

    ## 3. PREVIEW IMAGE PROMPT

    Generate a COMPLETE prompt for a style showcase card:
    - Square format (mention this)
    - Shows style essence WITHOUT any device mockup
    - Include: background colors, decorative elements, text sample
    - Should capture the mood/vibe
    - Should work with Gemini 2.5 Flash model
    - Length: 50-150 words
    - IMPORTANT: NO phone, NO device, NO mockup - pure style showcase

    Example: "Square style showcase card portraying cyberpunk neon aesthetic. Neon pink and cyan radial gradient background flowing from dark navy center to bright magenta edges. Holographic circuit patterns and geometric hexagons scattered around (cyan, 60-80px, 4-5 pieces). Glowing pink grid squares (40-60px, 6-8 scattered). Futuristic bold text sample reading 'CYBERPUNK STYLE' in white with cyan outline and neon glow. High-tech, energetic atmosphere. Pure style preview, no device."

    ## WRITING GUIDELINES:
    - Be specific and descriptive but concise
    - Use exact color names or hex codes when possible
    - Include size ranges for decorative elements (in px)
    - Specify quantities (3-4 emojis, 6-8 stars, etc.)
    - Describe visual style and mood clearly
    - Each field: 50-150 words max

    {{ ctx.output_format }}
  "#
}

// ============================================
// STYLE GENERATION TEST CASES
// ============================================

test CyberpunkStyleGeneration {
  functions [GenerateStyleFromDescription]
  args {
    description "cyberpunk neon with pink and blue colors"
  }
}

test HalloweenStyleGeneration {
  functions [GenerateStyleFromDescription]
  args {
    description "spooky Halloween with orange and purple gradient and jack-o-lanterns"
  }
}

test MinimalistStyleGeneration {
  functions [GenerateStyleFromDescription]
  args {
    description "clean minimalist with soft pastels and zen vibes"
  }
}
