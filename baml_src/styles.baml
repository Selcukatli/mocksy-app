// Screenshot Style Generation BAML Domain
// Generates style configurations from text descriptions with AI-powered analysis

// ============================================
// STYLE GENERATION
// ============================================

// Note: StyleConfig class is defined in screenshots.baml and reused here

class StyleGenerationOutput {
  style_name string @description("User-friendly style name (2-4 words, title case, e.g., 'Cyberpunk Neon', 'Snap Style', 'Halloween Spooky')")
  style_config StyleConfig @description("Style configuration for database storage")
  device_reference_prompt string @description("Complete prompt for generating device frame reference image at 1290x2796 dimensions")
  preview_image_prompt string @description("Complete prompt for generating square style showcase card showing the style name text (NO device mockup)")
}

class StyleRevisionOutput {
  revised_style StyleGenerationOutput @description("The revised style configuration")
  revision_summary string @description("Friendly summary of what changed (2-3 sentences, e.g., 'I changed the background from bright yellow to a deep purple and navy gradient. The decorative elements now use vibrant neon colors to pop against the darker background. All other elements remain the same.')")
}

// Generate style from user description
function GenerateStyleFromDescription(
  description: string @description("User's text description of desired style"),
  style_name: string? @description("Optional user-provided style name. If not provided, AI will generate one."),
  reference_image: image? @description("Optional reference/inspiration image"),
  // Optional specific style controls - these OVERRIDE general description when provided
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
    REFERENCE IMAGE INTERPRETATION RULES:
    - Carefully extract the color palette, lighting, background treatment, and decorative motifs
    - Capture typography character: font families, letter shapes, weight, outline, glow, and color styling
    - Mirror overall mood (e.g., neon arcade, cozy pastel, tech minimal)
    - Completely ignore layout/composition of elements and any header/body copy wording
    - If a device appears in the image, ignore the UI content on the screen—focus only on frame styling and outer glow effects
    - Incorporate these visual cues into style_config, device_reference_prompt, and preview_image_prompt details
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

    ## 1. STYLE NAME

    {% if style_name %}
    Use the user-provided style name: "{{ style_name }}"
    {% else %}
    Generate a catchy, user-friendly name for this style:
    - 2-4 words maximum
    - Title case (e.g., "Cyberpunk Neon", "Snap Style", "Halloween Spooky")
    - Should capture the essence and mood
    - Easy to remember and identify
    - Examples: "Retro Vaporwave", "Zen Minimalist", "Pop Art Burst"
    {% endif %}

    ## 2. STYLE CONFIG (for database)

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

    ## 3. DEVICE REFERENCE PROMPT

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

    ## 4. PREVIEW IMAGE PROMPT

    Generate a COMPLETE prompt for a style showcase card featuring the style name as text:
    - Square format (mention this)
    - Shows style essence WITHOUT any device mockup
    - Include: background colors, decorative elements, AND the style name as display text
    - The style name should be prominently displayed using the text_style specifications
    - Should capture the mood/vibe
    - Should work with Gemini 2.5 Flash model
    - Length: 50-150 words
    - IMPORTANT: NO phone, NO device - pure style showcase with background, decorative elements, and style name text
    - CRITICAL: Background and elements must fill ENTIRE canvas edge-to-edge with NO white padding, NO margins, NO borders around the image

    Example: "Square style showcase card portraying cyberpunk neon aesthetic. Background fills entire canvas edge-to-edge with no padding or margins. Neon pink and cyan radial gradient background flowing from dark navy center to bright magenta edges, extending to all four edges. Holographic circuit patterns and geometric hexagons scattered around (cyan, 60-80px, 4-5 pieces). Glowing pink grid squares (40-60px, 6-8 scattered). Center displays style name 'CYBERPUNK NEON' in futuristic bold font with white color, cyan outline and neon glow matching the text_style. High-tech, energetic atmosphere. Pure style preview, no device. Full bleed, no white space around edges."

    ## WRITING GUIDELINES:
    - Be specific and descriptive but concise
    - Use exact color names or hex codes when possible
    - Include size ranges for decorative elements (in px)
    - Specify quantities (3-4 emojis, 6-8 stars, etc.)
    - Describe visual style and mood clearly
    - Each field: 50-150 words max
    - When a reference image is provided, ensure every stylistic field clearly reflects the extracted palette, typography, and background energy from that image

    ## OUTPUT FORMAT (STRICT)
    respond with a single JSON object that matches this exact structure. Do not include markdown fences or commentary:
    {
      "style_name": "...",
      "style_config": {
        "background_color": "...",
        "details": "...",
        "text_style": "...",
        "device_style": "..."
      },
      "device_reference_prompt": "...",
      "preview_image_prompt": "..."
    }
    - All fields are REQUIRED and must be non-empty strings.
    - Do NOT add extra fields.
    - Do NOT wrap the JSON in backticks.
    - Ensure any quotes inside strings are escaped.

    {{ ctx.output_format }}
  "#
}

// Revise an existing style based on user feedback
function ReviseStyle(
  current_style: StyleGenerationOutput @description("Current style configuration to revise"),
  revision_prompt: string @description("User's revision instructions (e.g., 'make it darker', 'add more playful elements', 'change to purple tones')"),
  new_style_name: string? @description("Optional new name for the revised style. If not provided, keeps the current name."),
  reference_image: image? @description("Optional new reference image for revision")
) -> StyleRevisionOutput {
  client ScreenshotGeneratorHigh
  prompt #"
    {{ _.role("user") }}

    You are revising an existing screenshot style based on user feedback.

    CURRENT STYLE CONFIGURATION:
    - Name: {{ current_style.style_name }}
    - Background: {{ current_style.style_config.background_color }}
    - Details: {{ current_style.style_config.details }}
    - Text Style: {{ current_style.style_config.text_style }}
    - Device Style: {{ current_style.style_config.device_style }}

    REVISION REQUEST: "{{ revision_prompt }}"
    {% if new_style_name %}
    NEW STYLE NAME: "{{ new_style_name }}"
    {% endif %}
    {% if reference_image %}
    NEW REFERENCE IMAGE FOR INSPIRATION:
    {{ reference_image }}
    {% endif %}

    TASK: Revise the style while maintaining its core identity unless the revision explicitly requests changes.

    ## REVISION GUIDELINES:
    - Keep unchanged elements from the current style
    - Apply the specific changes requested in the revision prompt
    - If reference image provided, incorporate its visual elements
    - Maintain consistency across all style components
    - Preserve the overall vibe unless explicitly asked to change it

    ## 1. STYLE NAME

    {% if new_style_name %}
    Use the new style name: "{{ new_style_name }}"
    {% else %}
    Keep the current style name: "{{ current_style.style_name }}"
    {% endif %}

    ## 2. STYLE CONFIG (for database)

    Generate the revised style configuration:

    **background_color**: Describe the background color(s) and type
    - Examples: "bright yellow solid color", "gradient from dark purple to bright orange", "radial gradient from navy to magenta"
    - Be specific about colors and how they blend
    - Apply any color changes from revision prompt

    **details**: Describe ALL decorative elements, their placement, sizes, and aesthetic
    - What elements: emojis, shapes, icons, patterns
    - Where placed: edges, corners, scattered, clustered
    - How many: specific counts or ranges
    - Visual style: pop art, minimalist, spooky, futuristic, etc.
    - Example: "Pop art style with smiley emojis (80-100px, 3-4 at edges), star sparkles (30-60px, 6-8 scattered), lightning bolts (50-70px, 2-3 at sides). Elements pushed to outer 10-15% border, center clear."
    - Incorporate requested changes to elements

    **text_style**: Describe the typography styling
    - Font family and style (Impact, sans-serif, futuristic, elegant)
    - Weight (bold, extra bold, medium)
    - Color with effects (white with black outline, cyan with glow)
    - Example: "Impact font, extra bold 900 weight, white with thick 6px black outline and drop shadow"
    - Update text styling if revision requests it

    **device_style**: Describe how the device frame should look
    - Frame color and finish (glossy black, matte silver, rainbow)
    - Material (metal, glass, plastic)
    - Special effects (neon glow, holographic, wood texture)
    - Example: "Glossy midnight black frame with subtle cyan glow effect and thin bezels"
    - Revise device styling as requested

    ## 3. DEVICE REFERENCE PROMPT

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

    THEN add your creative description incorporating the revised device styling:
    "iPhone 16 Pro flat mockup template. [Describe frame styling - colors, materials, glows, textures on frame edges only]. Dynamic Island at top. Flat 2D graphic template, NOT photograph, NOT 3D render."

    Length: 120-180 words total

    ## 4. PREVIEW IMAGE PROMPT

    Generate a COMPLETE prompt for a style showcase card with revised styling featuring the style name as text:
    - Square format (mention this)
    - Shows style essence WITHOUT any device mockup
    - Include: background colors, decorative elements, AND the style name as display text
    - The style name should be prominently displayed using the text_style specifications
    - Should capture the mood/vibe
    - Should work with Gemini 2.5 Flash model
    - Length: 50-150 words
    - IMPORTANT: NO phone, NO device - pure style showcase with background, decorative elements, and style name text
    - CRITICAL: Background and elements must fill ENTIRE canvas edge-to-edge with NO white padding, NO margins, NO borders around the image
    - Incorporate all revisions into the preview

    ## WRITING GUIDELINES:
    - Be specific and descriptive but concise
    - Use exact color names or hex codes when possible
    - Include size ranges for decorative elements (in px)
    - Specify quantities (3-4 emojis, 6-8 stars, etc.)
    - Describe visual style and mood clearly
    - Each field: 50-150 words max
    - Only change what the revision prompt requests

    ## 5. REVISION SUMMARY

    Write a friendly, conversational summary (2-3 sentences) explaining what you changed:
    - Mention specific changes made (colors, elements, styling)
    - Note what stayed the same
    - Use first person ("I changed...", "I kept...", "I added...")
    - Be clear and helpful for the user to understand the revision

    Example: "I changed the background from bright yellow to a deep purple and navy gradient as requested. The decorative elements now use vibrant neon colors (yellow, cyan, hot pink) to pop against the darker background. I kept the playful pop art style with the same emojis, stars, and lightning bolts, just made them more vibrant to work with the new darker palette."

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

test RetroVaporwaveWithReference {
  functions [GenerateStyleFromDescription]
  args {
    description "retro vaporwave aesthetic with pink and purple tones"
    reference_image { url "https://images.unsplash.com/photo-1550745165-9bc0b252726f" }
  }
}

test SnapStyleWithReference {
  functions [GenerateStyleFromDescription]
  args {
    description "snap style playful design with bright colors and fun elements"
    reference_image { url "https://fantastic-squid-750.convex.cloud/api/storage/17ca4c3e-fb3a-4732-b4f5-85731984db87" }
  }
}

// ============================================
// STYLE REVISION TEST CASES
// ============================================

test ReviseColorToDarker {
  functions [ReviseStyle]
  args {
    current_style {
      style_name "Snap Style"
      style_config {
        background_color "#FFDD00 solid bright vibrant yellow"
        details "Playful pop art style with smiley emojis (80-100px, 4-5 at edges), star sparkles (60-80px, 6-8 scattered), lightning bolts (55-75px, 3-4 pieces). Elements concentrated in outer 12-18% border area."
        text_style "Extra bold rounded sans-serif font, 900 weight, white color with thick 5-7px black outline stroke."
        device_style "Colorful gradient frame with cyan-to-green fade on left edge transitioning to orange-to-pink fade on bottom right."
      }
      device_reference_prompt "CRITICAL LAYOUT RULES - MUST FOLLOW..."
      preview_image_prompt "Square style showcase card..."
    }
    revision_prompt "make the background darker, change yellow to deep purple and navy blue gradient"
  }
}

test ReviseAddMoreElements {
  functions [ReviseStyle]
  args {
    current_style {
      style_name "Minimalist Zen"
      style_config {
        background_color "gradient from dark purple to bright orange"
        details "Minimalist style with 3-4 small star icons (40-50px) at corners only."
        text_style "Sans-serif font, 700 weight, white with subtle shadow."
        device_style "Matte black frame with thin bezels."
      }
      device_reference_prompt "CRITICAL LAYOUT RULES - MUST FOLLOW..."
      preview_image_prompt "Square minimalist showcase..."
    }
    revision_prompt "add more playful elements like emojis and lightning bolts, make it more energetic"
  }
}

test ReviseWithNewReferenceImage {
  functions [ReviseStyle]
  args {
    current_style {
      style_name "Cyberpunk Neon"
      style_config {
        background_color "#00F0FF solid cyan"
        details "Futuristic style with geometric hexagons (60-80px, 5-6 pieces) and circuit patterns."
        text_style "Futuristic font, 800 weight, white with cyan glow."
        device_style "Glossy black frame with neon cyan glow."
      }
      device_reference_prompt "CRITICAL LAYOUT RULES - MUST FOLLOW..."
      preview_image_prompt "Square futuristic showcase..."
    }
    revision_prompt "change the aesthetic to match this new reference image"
    reference_image { url "https://images.unsplash.com/photo-1550745165-9bc0b252726f" }
  }
}
