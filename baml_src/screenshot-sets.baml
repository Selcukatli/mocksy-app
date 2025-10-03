// Screenshot Set Generation BAML Domain
// Generates complete sets of app store screenshots with cohesive styling

// ============================================
// IMPORTS & REUSED CLASSES
// ============================================

// Note: StyleConfig, TextConfig, and LayoutConfig are defined in screenshots.baml and reused here

// ============================================
// STYLE DEMO CLASSES
// ============================================

class StyleDemoScreenshotConfig {
  header_copy string @description("Catchy header text (3-5 words)")
  subheader_copy string? @description("Optional subheader text")
  header_position string @description("Either 'top' or 'bottom'")
  device_orientation string @description("Device angle description, e.g., 'straight-on frontal view' or 'tilted 15° right with subtle 3D perspective'")
  device_position string @description("Either 'centered', 'upper', or 'lower'")
  app_screen_prompt string @description("Complete text-to-image prompt for generating a fake app UI screen showing this feature (80-150 words)")
}

class StyleDemoOutput {
  app_concept string @description("Brief app concept matching the style's mood (1-2 sentences, e.g., 'A fitness app for tracking runs and competing with friends')")
  app_icon_prompt string @description("Complete text-to-image prompt for generating app icon (50-100 words). Should be 1024x1024 square, iOS-style icon design matching the app concept and style aesthetic.")
  screenshots StyleDemoScreenshotConfig[] @description("3-5 screenshot configs showcasing the style with varied layouts and features")
}

// ============================================
// SCREENSHOT SET CLASSES
// ============================================

class ScreenshotSetInput {
  app_description string @description("App description with key features, target audience, and unique selling points")
  screenshot_count int @description("Number of screenshots to generate (typically 3-8 for app stores)")
}

class ScreenshotConfig {
  text TextConfig @description("Header and optional subheader copy")
  layout LayoutConfig @description("Composition and device orientation")
}

// ============================================
// GENERATION FUNCTION
// ============================================

// Generates a complete set of screenshot configurations for app store listings
function GenerateScreenshotSet(
  input: ScreenshotSetInput @description("App description, style, and count configuration")
) -> ScreenshotConfig[] {
  client ScreenshotGeneratorMed
  prompt #"
    {{ _.role("user") }}

    You are generating a cohesive set of {{ input.screenshot_count }} app store screenshot configurations.

    APP DESCRIPTION:
    {{ input.app_description }}

    TASK: Create {{ input.screenshot_count }} screenshot configurations that tell a compelling story about the app.

    ## REQUIREMENTS FOR EACH SCREENSHOT:

    ### 1. TEXT (header copy)
    - header: Catchy, action-oriented copy (3-5 words maximum)
    - Examples: "Track Your Progress", "Share With Friends", "Discover New Goals"
    - Each should highlight a different feature or benefit
    - Use active voice and benefit-focused language
    - subheader: Optional (usually null, use sparingly for extra context)

    ### 2. LAYOUT (composition and device orientation)
    - composition: Describe element placement
      * Vary between "Header at top, device below" and "Device in upper area, header at bottom"
      * Always specify tight spacing (1-2% gaps) to maximize space usage
      * Example: "Header at top centered, device fills lower 95% of canvas with tight 1-2% gap"
    - device_orientation: Vary the device angle for visual interest
      * Mix: "straight-on frontal view", "slight 8-10° right tilt with 3D perspective", "15° left angle"
      * Use straight-on for professional/clean screenshots
      * Use tilts for dynamic/energetic screenshots
    - device_type: Always "iPhone 16 Pro with Dynamic Island, 19.5:9 aspect ratio, tall and narrow"

    ## STORYTELLING SEQUENCE:

    Create a logical flow through the screenshots:
    1. First screenshot: Introduction/hero feature (most impressive capability)
    2. Middle screenshots: Supporting features and benefits
    3. Last screenshot: Call-to-action or social proof

    Vary device angles and text placement to create visual rhythm:
    - Don't put text in the same position for all screenshots
    - Mix straight-on and tilted device orientations
    - Create a dynamic, engaging sequence

    ## WRITING STYLE:
    - Keep copy punchy and benefit-focused
    - Use variety in header copy - don't repeat patterns
    - Ensure each screenshot has a clear, distinct purpose

    {{ ctx.output_format }}
  "#
}

// ============================================
// TEST CASES
// ============================================

test FitnessAppScreenshotSet {
  functions [GenerateScreenshotSet]
  args {
    input {
      app_description "FitQuest is a gamified fitness app that turns your daily workouts into an epic adventure. Track your steps, calories, and active minutes while completing quests, unlocking achievements, and competing with friends. Features include: customizable workout plans, social challenges, progress tracking with beautiful data visualizations, integration with Apple Health, and motivational rewards system. Perfect for anyone who wants to make fitness fun and stay motivated with friends."
      screenshot_count 5
    }
  }
}

test ProductivityAppScreenshotSet {
  functions [GenerateScreenshotSet]
  args {
    input {
      app_description "TaskFlow is a minimalist productivity app that helps you focus on what matters most. Features include: smart task prioritization using AI, pomodoro timer with ambient sounds, daily focus goals, beautiful progress analytics, calendar integration, and distraction blocking. Designed for professionals, students, and anyone who wants to boost their productivity with a clean, distraction-free interface."
      screenshot_count 4
    }
  }
}

// ============================================
// STYLE DEMO GENERATION
// ============================================

// Generate demo screenshot configs from a style to showcase how it looks
function GenerateStyleDemoScreenshots(
  style_config: StyleConfig @description("The style configuration to showcase"),
  style_name: string @description("Name of the style for context"),
  screenshot_count: int? @description("Number of demo screenshots to generate (default: 3, max: 5)")
) -> StyleDemoOutput {
  client ScreenshotGeneratorMed
  prompt #"
    {{ _.role("user") }}

    You are generating a demo screenshot set to showcase a visual style.

    STYLE TO SHOWCASE:
    - Name: {{ style_name }}
    - Background: {{ style_config.background_color }}
    - Details: {{ style_config.details }}
    - Text Style: {{ style_config.text_style }}
    - Device Style: {{ style_config.device_style }}

    TASK: Create a fictional app concept and {% if screenshot_count %}{{ screenshot_count }}{% else %}3{% endif %} screenshot configs that showcase this style effectively.

    ## 1. APP CONCEPT

    Invent a simple, modern app concept that would look great in this style:
    - Examples: fitness tracker, recipe app, meditation app, photo editor, social app, music player, habit tracker
    - Should match the style's mood (e.g., playful style → fun social app, zen style → meditation app, energetic style → fitness app)
    - Keep it generic enough to not require real UI complexity
    - 1-2 sentences max
    - Make it sound exciting and appealing

    ## 1.5. APP ICON PROMPT

    Generate a complete text-to-image prompt for creating the app icon:
    - Format: 1024x1024 square icon
    - Style: iOS app icon design (rounded square with slight gradient lighting)
    - Content: Should represent the app concept clearly
    - Design: Match the overall style aesthetic (colors, mood, energy level)
    - Simplicity: Icons should be simple and recognizable at small sizes
    - Length: 50-100 words
    - Example: "Modern fitness app icon for iOS. Circular running track symbol in bright gradient (cyan to purple). Clean minimalist design with subtle depth. Central lightning bolt element suggesting energy. Rounded square format with smooth gradient background. Professional, contemporary aesthetic. 1024x1024 square format."

    ## 2. SCREENSHOT CONFIGS ({% if screenshot_count %}{{ screenshot_count }}{% else %}3{% endif %} screenshots)

    For each screenshot, provide:

    **header_copy**: Punchy feature headline (3-5 words)
    - Examples: "Track Your Progress", "Share With Friends", "Discover New Goals", "Stay Motivated Daily"
    - Should relate to the fictional app concept
    - Each should be different and highlight a unique aspect
    - Action-oriented and benefit-focused

    **subheader_copy**: Optional secondary text (use sparingly, usually null)
    - Only include if you really need extra context
    - Most screenshots should have null here

    **header_position**: "top" or "bottom"
    - Vary positions across screenshots for visual rhythm
    - Don't use the same position for all screenshots

    **device_orientation**: Device angle description
    - Examples: "straight-on frontal view", "tilted 12° right with subtle 3D perspective", "slight 8° left angle"
    - Mix orientations for variety
    - Use straight-on for professional/clean screenshots
    - Use tilts for dynamic/energetic screenshots

    **device_position**: "centered", "upper", or "lower"
    - Usually "centered" unless header position requires adjustment
    - Most should be "centered"

    **app_screen_prompt**: Complete text-to-image prompt for generating the app UI screen
    - Generate a FULL prompt describing a modern mobile app UI screen for this feature
    - Specify: screen type (onboarding, dashboard, profile, settings, etc.), key UI elements, colors, layout
    - Should look like a real app screenshot when generated
    - Use modern design patterns: iOS-style cards, gradients, clean typography, generous whitespace
    - Length: 80-150 words
    - Example: "Modern fitness app dashboard screen showing circular progress rings (steps, calories, active minutes) in bright gradient colors (cyan to purple). Large numbers displaying daily stats (8,432 steps, 1,847 calories). Clean iOS-style interface with card-based layout. Bottom navigation bar with 5 icons (home, activity, social, profile, settings). Top header showing 'Today' and profile avatar in top right. White background with subtle shadows on cards. Contemporary design with generous whitespace and rounded corners."

    ## VARIETY REQUIREMENTS:
    - Vary header positions (mix top/bottom across all screenshots)
    - Vary device orientations (mix straight-on and tilted)
    - Each app screen should show a DIFFERENT screen type (e.g., onboarding, home, profile, settings, feature detail)
    - Create visual rhythm and storytelling flow
    - First screenshot should be the most impressive/hero feature

    ## WRITING STYLE:
    - Keep copy punchy and benefit-focused
    - Use variety in header copy - don't repeat patterns
    - Ensure each screenshot has a clear, distinct purpose
    - Match the energy/mood of the style (playful vs serious, energetic vs calm, etc.)

    {{ ctx.output_format }}
  "#
}

// ============================================
// STYLE DEMO TEST CASES
// ============================================

test CyberpunkStyleDemo {
  functions [GenerateStyleDemoScreenshots]
  args {
    style_config {
      background_color "radial gradient from dark navy (#0A0E27) center to bright magenta (#FF006E) edges"
      details "Futuristic cyberpunk style with holographic circuit patterns (cyan, 60-80px, 4-5 scattered). Glowing pink grid squares (40-60px, 6-8 pieces). Neon hexagons with cyan outline (50-70px, 3-4 at edges). Elements concentrated in outer 12-15% border area."
      text_style "Futuristic bold sans-serif font, 800 weight, white color with bright cyan (#00F0FF) outline (4-5px) and neon glow effect"
      device_style "Glossy midnight black frame with vibrant cyan (#00F0FF) neon glow effect around edges and thin modern bezels"
    }
    style_name "Cyberpunk Neon"
    screenshot_count 3
  }
}

test MinimalistZenStyleDemo {
  functions [GenerateStyleDemoScreenshots]
  args {
    style_config {
      background_color "soft gradient from warm beige (#F5F1E8) to pale sage green (#E8F2E8)"
      details "Minimalist zen style with delicate watercolor brush strokes (soft greens and browns, 40-60px, 3-4 at corners). Subtle organic leaf silhouettes (30-50px, 4-5 scattered). Small zen circle enso symbols (35-45px, 2-3 pieces). Elements very sparse, outer 10% border only."
      text_style "Elegant serif font (Playfair Display or similar), 600 weight, deep forest green (#2D4A3E) with subtle cream shadow for depth"
      device_style "Matte warm wood texture frame with natural bamboo aesthetic and organic rounded edges"
    }
    style_name "Zen Minimalist"
    screenshot_count 3
  }
}

test PlayfulPopArtStyleDemo {
  functions [GenerateStyleDemoScreenshots]
  args {
    style_config {
      background_color "bright vibrant yellow (#FFDD00) solid color"
      details "Playful pop art style with smiley face emojis (80-100px, 4-5 at edges). Star sparkles in hot pink and cyan (60-80px, 6-8 scattered). Lightning bolts in bright orange (55-75px, 3-4 pieces). Comic book style explosion shapes (70-90px, 2-3 at corners). Elements concentrated in outer 12-18% border area, center clear."
      text_style "Extra bold rounded sans-serif font (Impact or similar), 900 weight, white color with thick 5-7px black outline stroke and subtle drop shadow"
      device_style "Colorful gradient frame with cyan-to-green fade on left edge transitioning to orange-to-pink fade on bottom right, glossy finish"
    }
    style_name "Snap Style"
    screenshot_count 3
  }
}
