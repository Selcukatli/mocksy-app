// Demo App Generation BAML Domain
// Generates demo apps from styles for preview/showcase purposes

// ============================================
// IMPORTS & REUSED CLASSES
// ============================================

// Note: StyleConfig is defined in screenshots.baml and reused here

// ============================================
// DEMO APP CLASSES
// ============================================

class DemoAppOutput {
  app_name string @description("Short, catchy app name (1-3 words max, e.g., 'FitQuest', 'ZenJournal', 'ShadowVault')")
  app_description string @description("App Store style description (3-5 sentences, 40-80 words). Explain what the app does, key features, and benefits. Make it compelling and professional.")
  app_icon_prompt string @description("Complete text-to-image prompt for generating app icon (50-100 words). CRITICAL: Icon must be SIMPLE with LARGE, BOLD symbols recognizable at small sizes. Avoid tiny details, thin lines, or complex patterns. Should be 1024x1024 square, iOS-style icon design matching the app concept and style aesthetic.")
}

// ============================================
// DEMO APP GENERATION
// ============================================

// Generate a demo app concept and icon from either a style OR a description
function GenerateDemoAppFromStyle(
  style_config: StyleConfig? @description("Optional style configuration to base the app on"),
  style_name: string? @description("Optional name of the style for context"),
  app_description_input: string? @description("Optional user-provided app description/concept to generate from")
) -> DemoAppOutput {
  client ScreenshotGeneratorMed
  prompt #"
    {{ _.role("user") }}

    You are generating a demo app concept with name, description, and icon prompt.

    {% if app_description_input %}
    USER'S APP CONCEPT:
    {{ app_description_input }}

    TASK: Create a fictional app based on this user's description. Generate a short catchy name, professional App Store description, and icon prompt that matches the concept.
    {% else %}
    STYLE TO SHOWCASE:
    - Name: {{ style_name }}
    - Background: {{ style_config.background_color }}
    - Details: {{ style_config.details }}
    - Text Style: {{ style_config.text_style }}
    - Device Style: {{ style_config.device_style }}

    TASK: Create a fictional app with name, description, and icon prompt that would look great in this style.
    {% endif %}

    ## 1. APP NAME

    Create a short, catchy app name (1-3 words max):
    - Examples: "FitQuest", "ZenJournal", "BeatFlow", "ShadowVault", "NightGuard"
    - Should match the style's mood:
      * Playful/bright styles → fun, energetic names
      * Zen/minimal styles → calm, simple names
      * Dark/cyberpunk styles → edgy, mysterious names
    - NO hyphens, NO long phrases, NO descriptions in the name

    ## 2. APP DESCRIPTION

    Write an App Store style description (3-5 sentences, 40-80 words):
    - Explain what the app does and its core purpose
    - List 2-3 key features or benefits
    - Make it sound exciting and professional
    - Match the style's mood and target audience
    - Example: "Transform your fitness journey into an epic adventure. FitQuest gamifies your workouts with challenges, achievements, and rewards. Track your progress, compete with friends, and unlock new levels as you get stronger. Perfect for anyone who wants to stay motivated and make exercise fun."

    ## 3. APP ICON PROMPT

    Generate a text-to-image prompt for creating the app icon (50-100 words):
    - **CRITICAL: Keep it SIMPLE - use ONE large, bold central symbol**
    - **AVOID: Small details, thin lines, complex patterns, circuit boards, tiny text**
    - Format: 1024x1024 square iOS icon (rounded square)
    - Use bold, chunky shapes that work at small sizes
    - Match the style's color palette from background_color
    - Professional, modern, App Store quality
    - Examples of GOOD icons:
      * "iOS app icon. Large bold shield symbol in center, bright gradient (cyan to purple). Simple, clean design. Minimal details. Rounded square. 1024x1024."
      * "iOS app icon. Big crescent moon symbol, deep purple gradient background. Soft glow effect. Simple and bold. Rounded square. 1024x1024."
      * "iOS app icon. Single large bat silhouette in center, glowing purple outline on dark background. Bold and simple. Rounded square. 1024x1024."

    ## MATCHING GUIDELINES:
    - App concept should feel natural with the style's personality
    - Icon colors should complement or use the style's color palette
    - Icon mood should match style energy (calm vs energetic, playful vs serious, etc.)
    - Both app and icon should feel cohesive with the overall style aesthetic

    {{ ctx.output_format }}
  "#
}

// ============================================
// DEMO APP TEST CASES
// ============================================

test CyberpunkDemoApp {
  functions [GenerateDemoAppFromStyle]
  args {
    style_config {
      background_color "radial gradient from dark navy (#0A0E27) center to bright magenta (#FF006E) edges"
      details "Futuristic cyberpunk style with holographic circuit patterns (cyan, 60-80px, 4-5 scattered). Glowing pink grid squares (40-60px, 6-8 pieces). Neon hexagons with cyan outline (50-70px, 3-4 at edges). Elements concentrated in outer 12-15% border area."
      text_style "Futuristic bold sans-serif font, 800 weight, white color with bright cyan (#00F0FF) outline (4-5px) and neon glow effect"
      device_style "Glossy midnight black frame with vibrant cyan (#00F0FF) neon glow effect around edges and thin modern bezels"
    }
    style_name "Cyberpunk Neon"
  }
}

test ZenMinimalistDemoApp {
  functions [GenerateDemoAppFromStyle]
  args {
    style_config {
      background_color "soft gradient from warm beige (#F5F1E8) to pale sage green (#E8F2E8)"
      details "Minimalist zen style with delicate watercolor brush strokes (soft greens and browns, 40-60px, 3-4 at corners). Subtle organic leaf silhouettes (30-50px, 4-5 scattered). Small zen circle enso symbols (35-45px, 2-3 pieces). Elements very sparse, outer 10% border only."
      text_style "Elegant serif font (Playfair Display or similar), 600 weight, deep forest green (#2D4A3E) with subtle cream shadow for depth"
      device_style "Matte warm wood texture frame with natural bamboo aesthetic and organic rounded edges"
    }
    style_name "Zen Minimalist"
  }
}

test PlayfulPopArtDemoApp {
  functions [GenerateDemoAppFromStyle]
  args {
    style_config {
      background_color "bright vibrant yellow (#FFDD00) solid color"
      details "Playful pop art style with smiley face emojis (80-100px, 4-5 at edges). Star sparkles in hot pink and cyan (60-80px, 6-8 scattered). Lightning bolts in bright orange (55-75px, 3-4 pieces). Comic book style explosion shapes (70-90px, 2-3 at corners). Elements concentrated in outer 12-18% border area, center clear."
      text_style "Extra bold rounded sans-serif font (Impact or similar), 900 weight, white color with thick 5-7px black outline stroke and subtle drop shadow"
      device_style "Colorful gradient frame with cyan-to-green fade on left edge transitioning to orange-to-pink fade on bottom right, glossy finish"
    }
    style_name "Snap Style"
  }
}

test DemoFromDescription {
  functions [GenerateDemoAppFromStyle]
  args {
    app_description_input "A meditation and mindfulness app for busy professionals. Helps users find calm moments throughout their day with 5-minute guided sessions, breathing exercises, and ambient soundscapes."
  }
}
