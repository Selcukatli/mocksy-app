// Screenshot Set Generation BAML Domain
// Generates complete sets of app store screenshots with cohesive styling

// ============================================
// IMPORTS & REUSED CLASSES
// ============================================

// Note: StyleConfig, TextConfig, and LayoutConfig are defined in screenshots.baml and reused here

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
