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
  color_theme string @description("Color palette/theme for the app UI (e.g., 'dark purple and electric cyan', 'warm beige and sage green', 'bright yellow with hot pink accents'). This will be used to generate consistent app screens.")
}

class AppScreenPromptsOutput {
  app_screen_prompts string[] @description("Array of 3-10 iPhone screenshot prompts for different app screens. Each prompt follows the full-bleed edge-to-edge pattern.")
}

// ============================================
// DEMO APP GENERATION
// ============================================

// Generate a demo app concept with name, description, icon prompt, and color theme
function GenerateDemoApp(
  app_description_input: string? @description("Optional user-provided app description/concept to generate from"),
  style_config: StyleConfig? @description("Optional style configuration to base the app on"),
  style_name: string? @description("Optional name of the style for context")
) -> DemoAppOutput {
  client ScreenshotGeneratorMed
  prompt #"
    {{ _.role("user") }}

    You are generating a demo app concept with name, description, icon prompt, and color theme.

    {% if app_description_input %}
    USER'S APP CONCEPT:
    {{ app_description_input }}

    TASK: Create a fictional app based on this user's description. Generate a short catchy name, professional App Store description, and icon prompt that matches the concept.
    {% elif style_config %}
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

    ## 4. COLOR THEME

    Define a color palette/theme for the app UI that will be used to generate consistent app screens:
    - Be specific about colors (e.g., "dark purple and electric cyan", "warm beige and sage green")
    - Should match the icon's color palette
    - Should complement the style's aesthetic if a style is provided
    - Include 2-4 specific colors that work well together
    - Examples:
      * "Dark purple gradient with electric cyan accents"
      * "Soft blue-green with white and pale yellow highlights"
      * "Bright vibrant yellow with hot pink and cyan accents"

    ## MATCHING GUIDELINES:
    - App concept should feel natural with the style's personality
    - Icon colors should match the color theme
    - Icon mood should match style energy (calm vs energetic, playful vs serious, etc.)
    - Color theme should be cohesive with the overall style aesthetic
    - All outputs (name, description, icon, color theme) should work together harmoniously

    {{ ctx.output_format }}
  "#
}

// ============================================
// APP SCREEN GENERATION
// ============================================

// Generate app screen prompts for any app (demo or user-created)
function GenerateScreensForApp(
  app_name: string @description("Name of the app to generate screens for"),
  app_description: string @description("Description of what the app does"),
  screen_instructions: string? @description("Optional specific instructions for what screens to generate (e.g., 'generate a video chat screen, a chat messages screen, and a settings screen'). If not provided, will generate common app screens automatically."),
  num_screens: int? @description("Number of screens to generate (3-10). Defaults to 5 if not specified."),
  color_theme: string @description("Color palette/theme to use for all screens (e.g., 'dark purple and cyan', 'warm orange and yellow')"),
  style_config: StyleConfig? @description("Optional style configuration to match visual aesthetic")
) -> AppScreenPromptsOutput {
  client ScreenshotGeneratorMed
  prompt #"
    {{ _.role("user") }}

    Generate {{ num_screens or 5 }} iPhone app screen prompts for the following app:

    **APP DETAILS:**
    - Name: {{ app_name }}
    - Description: {{ app_description }}
    - Color Theme: {{ color_theme }}
    {% if style_config %}
    - Visual Style Context: {{ style_config.text_style }}
    {% endif %}

    {% if screen_instructions %}
    **SCREEN REQUIREMENTS:**
    {{ screen_instructions }}
    {% else %}
    **SCREEN REQUIREMENTS:**
    Generate {{ num_screens or 5 }} diverse screens showcasing different parts of the app. Include common screens like:
    - Home/Dashboard (main entry point)
    - Main feature screen(s) specific to this app type
    - Profile/Account screen
    - Settings/Preferences screen
    - Any other relevant screens for this app's functionality

    Make each screen showcase a unique aspect of the app.
    {% endif %}

    **CRITICAL PROMPT REQUIREMENTS:**

    Each prompt MUST follow this exact pattern:
    "iPhone screenshot of [screen name]. Raw screen capture filling the entire canvas - status bar touching top edge, app background extending to all edges (left, right, bottom). [Detailed UI description: specific elements like headers, buttons, cards, lists, images, text content, interactive components]. Bottom navigation tabs/buttons with safe area spacing (NO home indicator visible). NO device frame, NO rounded corners, NO padding around edges - just the screen pixels. {{ color_theme }}."

    **EXAMPLE PROMPT:**
    "iPhone screenshot of Home Dashboard. Raw screen capture filling the entire canvas - status bar touching top edge, app background extending to all edges. Dark purple gradient background with subtle neural network pattern. Central 'New Mind Map' button with glowing effect. Recently created mind maps displayed in scrollable carousel below with thumbnail previews and project titles. Bottom navigation tabs (Home, Projects, Ideas, Settings) with safe area spacing. NO device frame, NO rounded corners, NO padding - just screen pixels. Dark purple and electric cyan colors."

    **DESIGN CONSISTENCY:**
    - All screens MUST use the same color theme: {{ color_theme }}
    - Use consistent typography and UI patterns across all screens
    - Maintain the same visual style and mood throughout
    - Each screen should feel like part of the same cohesive app
    - Bottom navigation should be consistent (same tabs/icons) if applicable

    {{ ctx.output_format }}
  "#
}

// ============================================
// DEMO APP TEST CASES
// ============================================

test CyberpunkDemoApp {
  functions [GenerateDemoApp]
  args {
    app_description_input null
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
  functions [GenerateDemoApp]
  args {
    app_description_input null
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
  functions [GenerateDemoApp]
  args {
    app_description_input null
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
  functions [GenerateDemoApp]
  args {
    app_description_input "A meditation and mindfulness app for busy professionals. Helps users find calm moments throughout their day with 5-minute guided sessions, breathing exercises, and ambient soundscapes."
    style_config null
    style_name null
  }
}

// ============================================
// SCREEN GENERATION TEST CASES
// ============================================

test GenerateScreensCustomInstructions {
  functions [GenerateScreensForApp]
  args {
    app_name "FitQuest"
    app_description "Gamified fitness tracking app with challenges, achievements, and social features"
    screen_instructions "Generate: 1) Today's workout dashboard with progress rings and stats, 2) Exercise library with video previews and categories, 3) Social feed showing friend activities and challenges, 4) Achievement showcase with unlocked badges and trophies"
    num_screens 4
    color_theme "vibrant purple gradient with electric cyan accents"
    style_config null
  }
}

test GenerateScreensAuto {
  functions [GenerateScreensForApp]
  args {
    app_name "CalmFlow"
    app_description "Meditation and mindfulness app for busy professionals with guided sessions and breathing exercises"
    screen_instructions null
    num_screens 5
    color_theme "serene blue-green with soft white and pale yellow highlights"
    style_config null
  }
}
