// App Store Screenshot Generation BAML Domain
// Generates AI-powered app store screenshot designs with consistent styling

// ============================================
// SCREENSHOT-SPECIFIC CLIENT CONFIGURATION
// ============================================

// High Quality - For final production screenshots
client<llm> ScreenshotGeneratorHigh {
  provider "fallback"
  options {
    strategy [
      ClaudeSonnet45,
      Gemini25Pro,
      GPT5,
      ClaudeSonnet4,
      MistralLarge
    ]
  }
}

// Medium Quality - Balanced for standard use
client<llm> ScreenshotGeneratorMed {
  provider "fallback"
  options {
    strategy [
      Gemini25Flash,
      GPT5Mini,
      ClaudeHaiku,
      MistralSmall
    ]
  }
}

// Low Quality - Fast iterations and testing
client<llm> ScreenshotGeneratorLow {
  provider "fallback"
  options {
    strategy [
      Gemini25FlashLite,
      GPT5Nano,
      ClaudeHaiku
    ]
  }
}

// ============================================
// STRUCTURED CLASSES FOR SCREENSHOT GENERATION
// ============================================

// INPUT CONFIGURATION CLASSES

// Text content configuration
class TextConfig {
  header string @description("Main headline text")
  subheader string? @description("Optional subheader text below header")
}

// Layout configuration - describes spatial arrangement and composition
class LayoutConfig {
  composition string @description("Overall composition description: header position (top/bottom), device position (upper/center/lower), text alignment, spacing between elements. Example: 'Header at top centered, device fills lower 95% of canvas with tight 1-2% gap, minimal spacing throughout'")
  device_orientation string @description("Device 3D perspective and rotation. Examples: 'straight-on frontal view', 'slight 8-10° right tilt with subtle 3D depth', 'dramatic 15° left angle with perspective'")
  device_type string @description("Device model and key specs. Example: 'iPhone 16 Pro with Dynamic Island, 19.5:9 aspect ratio, tall and narrow form factor'")
}

// Style configuration - describes visual aesthetics
class StyleConfig {
  background_color string @description("Background color and type. Example: '#FFED00 solid bright yellow' or 'gradient from pink #FF71CE to cyan #05FFA1'")
  details string @description("Overall aesthetic style and decorative elements. Describe the vibe, decorative elements (emojis, shapes, icons), their placement (edges only, corners, scattered), sizes, and visual treatment. Example: 'Playful pop-art style with smiley emojis (80-100px), star sparkles (30-60px), and lightning bolts (50-70px) pushed tightly to outer 10-15% edge border only. Center 70% completely clear. Comic book aesthetic with strong contrast.'")
  text_style string @description("Complete text styling description. Font family, weight, size (in px), color, outline/stroke details, effects. Example: 'Impact font at 130-150px, extra bold (900 weight), white color with thick 4-6px black outline stroke, subtle drop shadow for readability'")
  device_style string @description("Device frame and bezel styling. Example: 'Matte silver metal frame with thin black bezels, minimal modern design' or 'Glossy white frame with rainbow iridescent effect and neon cyan glow'")
}

// OUTPUT STRUCTURED CLASSES

class FontStyle {
  family string @description("Font family name (e.g., 'Impact')")
  weight int @description("Font weight (e.g., 900)")
  color string @description("Color description with effects (e.g., 'white with thick-black-outline')")
  effects string[] @description("Array of text effects (e.g., ['thick-black-outline', 'extra-bold'])")
}

class HeaderText {
  copy string @description("Exact text content to display")
  placement string @description("Position and layout description")
  font FontStyle @description("Font styling details")
  size string @description("Size description (e.g., 'extremely large and bold, taking up 10-12% vertical space')")
}

class ScreenshotTreatment {
  treatment string @description("How to handle the screenshot (e.g., 'pixel-perfect placement into screen cutout')")
  preserve bool @description("Whether to preserve original screenshot quality")
  forbidden string[] @description("List of forbidden operations (e.g., ['cropping', 'stretching', 'UI redrawing'])")
}

class DeviceSpec {
  type string @description("Device model with specs")
  aspect_ratio string @description("Device aspect ratio (e.g., '19.5:9 (~2.16:1, tall and narrow)')")
  frame string @description("Frame color and finish description")
  angle string @description("Orientation angle and perspective")
  scale string @description("Size relative to canvas (e.g., '90-95% of canvas height')")
  position string @description("Position on canvas")
  screenshot ScreenshotTreatment @description("Screenshot handling configuration")
}

class Background {
  colors string[] @description("Array of hex colors used in background")
  effects string[] @description("Array of decorative element descriptions with size, count, and placement")
  placement string @description("Overall distribution strategy and aesthetic")
  seamless_to_bottom bool @description("Whether background extends seamlessly to bottom")
  forbidden string[] @description("List of forbidden elements (e.g., ['black bars', 'solid footer fills'])")
}

class Composition {
  priority string @description("What elements should dominate")
  rules string[] @description("Array of composition rules to follow")
}

class ScreenshotPromptStructured {
  style string @description("Overall aesthetic style name")
  background Background @description("Background configuration")
  device DeviceSpec @description("Device specifications and positioning")
  header_text HeaderText @description("Header text configuration")
  composition Composition @description("Composition rules and priorities")
}


// ============================================
// GENERATION FUNCTIONS
// ============================================

// Generates structured prompt specification for image-to-image screenshot compositing
function GenerateScreenshotPrompt(
  text: TextConfig @description("Text content configuration"),
  layout: LayoutConfig @description("Layout configuration"),
  style: StyleConfig @description("Visual style configuration")
) -> ScreenshotPromptStructured {
  client ScreenshotGeneratorHigh
  prompt #"
    {{ _.role("user") }}

    You are generating a structured specification for app store screenshot composition. Be specific but CONCISE - use short, punchy descriptions.

    EXACT COMPOSITION REQUIREMENTS:

    1. CANVAS & BACKGROUND (LAYER 1 - BASE):
       - Full portrait canvas: {{ style.background_color }}
       - Background fills 100% of canvas edge-to-edge, no gaps, no transparency
       - {{ style.details }}
       - Decorative elements (emojis, shapes, icons) are BOLD, FILLED, SOLID shapes with visual weight
       - These elements are SPARSE and STRATEGIC - placed naturally around and near the device to create visual interest
       - Elements should INTERACT with the device (arrows pointing at it, emojis near corners, etc.) without blocking the header text
       - DO NOT create a dense border or frame - keep it sparse with intentional placement for visual flow

    2. TEXT HEADER (LAYER 2 - TOP):
       - Position: {{ layout.composition }}
       - Text content: "{{ text.header }}"{% if text.subheader and text.subheader != "null" %} with "{{ text.subheader }}" below{% endif %}
       - Style: {{ style.text_style }}
       - Size: Large, bold, eye-catching - takes approximately 10-12% of total canvas height
       - CRITICAL: Text must be BOLD, PROMINENT, and immediately grab attention

    3. DEVICE (LAYER 3 - DOMINANT ELEMENT):
       - Type: {{ layout.device_type }}
       - Orientation: {{ layout.device_orientation }}
       - Frame style: {{ style.device_style }}
       - SIZE: ABSOLUTELY CRITICAL - device must be ENORMOUS
         * Device height should be 90-95% of REMAINING canvas height after text
         * Width should be proportional to maintain realistic phone aspect ratio (19.5:9 - tall and narrow)
         * The device should feel almost too large - like it's bursting out of frame
       - Position: Positioned to maximize space with minimal gap from text header
       - The screen content inside device must remain pixel-perfect and unmodified

    4. SPACING & LAYOUT:
       - Gap between text and device: Ultra-tight, approximately 1-2% of canvas height
       - Side margins around device: Minimal, just enough to show background (3-5% total width)
       - Bottom margin: Minimal, device nearly touches bottom edge (2-3% of height)
       - Goal: Maximum space utilization - text 10-12%, gap 1-2%, device 85-87%

    CRITICAL SUCCESS FACTORS:
    - Device must be the HERO - absolutely massive and commanding, 90-95% of remaining space
    - Text must be BOLD and prominent but compact in height
    - Background completely fills canvas with no empty areas
    - Decorative elements are subtle accents at edges, not competing for attention
    - Screen inside device stays perfect
    - Phone must remain TALL AND NARROW (19.5:9 aspect ratio) - NO iPad-like wide shapes

    WRITING STYLE:
    - Keep ALL descriptions SHORT and PUNCHY
    - Use simple, direct language
    - Avoid overly detailed explanations
    - Example GOOD: "colorful neon design with rainbow colors blending"
    - Example BAD: "Colorful neon rainbow gradient - seamless blend from red to orange to yellow to green to blue to purple flowing around device edges, vibrant and eye-catching"
    - Aim for 10-15 words per description field, not 30+
    - In effects array: each element should be ONE concise line
    - In composition rules: each rule should be ONE short sentence

    {{ ctx.output_format }}
  "#
}

// ============================================
// TEST CASES
// ============================================

test SnapStyleScreenshot {
  functions [GenerateScreenshotPrompt]
  args {
    text {
      header "Play Games with Friends!"
      subheader null
    }
    layout {
      composition "Device in upper area of canvas, header text at bottom centered below device with minimal gap to maximize space usage"
      device_orientation "tilt to the right with a cool 3d perspective"
      device_type "iPhone 16 Pro with Dynamic Island, 19.5:9 aspect ratio, tall and narrow"
    }
    style {
      background_color "bright yellow solid color"
      details "Dynamic pop art comic book style with varied decorative elements scattered around edges and corners: large simple black outlined smiley face emojis (80-100px) - 3-4 total scattered around sides, bold four-point star sparkles in white and black outline with varying sizes (30-60px) - about 6-8 total, curved arrows in thick black outline (60-80px) - 2-3 arrows pointing in dynamic directions, lightning bolt zigzag shapes in black outline (50-70px) - 2-3 bolts, abstract geometric elements like small circles, rectangles, curved lines in black and white (20-40px) scattered moderately, small confetti dashes and dots in white and light yellow sprinkled lightly throughout. Elements placed dynamically to create visual interest while keeping device and header text readable. Comic book aesthetic with strong contrast."
      text_style "Impact font, extra bold weight (900), white color with thick black outline, bold and eye-catching, extremely large and dominant"
      device_style "colorful neon design with rainbow colors blending into each other"
    }
  }
}


test SpookyHalloweenScreenshot {
  functions [GenerateScreenshotPrompt]
  args {
    text {
      header "Scary Good Fun!"
      subheader null
    }
    layout {
      composition "Header at top centered, device fills lower 95% of canvas with tight 1-2% gap, minimal spacing"
      device_orientation "slight 8-10° right tilt with dramatic 3D perspective"
      device_type "iPhone 16 Pro with Dynamic Island, 19.5:9 aspect ratio, tall narrow smartphone"
    }
    style {
      background_color "gradient from dark purple #1a0b2e at top through #2d1b3d to orange #ff6b35 at bottom"
      details "Spooky Halloween night atmosphere with jack-o-lantern pumpkins (70-90px glowing orange, 3-4 at corners), ghost emojis (60-80px white floating, 2-3 at sides), flying bats (40-60px black silhouettes, 5-7 scattered), spider webs (50-70px thin white lines, 2-3 in corners), skull emoji (60-75px white, 1-2 at edges), orange and white twinkling stars (15-25px, 8-12 scattered). ALL elements pushed to outer 10-15% edge border only, center 70% clear. Eerie, spooky vibe."
      text_style "Impact font at 130-150px, extra bold 900 weight, white color with extra-thick 6-8px orange outline stroke, orange glow drop shadow for spooky effect"
      device_style "Glossy midnight black metal frame with subtle glow effect, thin uniform bezels"
    }
  }
}

test NeonCyberpunkScreenshot {
  functions [GenerateScreenshotPrompt]
  args {
    text {
      header "Level Up Your Game"
      subheader null
    }
    layout {
      composition "Device in upper area, header at bottom centered below device, tight 1-2% gap, minimal spacing"
      device_orientation "straight-on frontal view"
      device_type "iPhone 16 Pro with Dynamic Island, 19.5:9 aspect ratio, tall narrow smartphone"
    }
    style {
      background_color "radial gradient from dark navy #0a0e27 through #1a1f3a to magenta #ff006e"
      details "Futuristic cyberpunk neon cityscape with glowing cyan hexagons (60-80px, 4-5 at edges), bright cyan/magenta circuit lines radiating from corners (100-150px, 3-4 total), neon pink grid squares (40-60px, 6-8 scattered), cyan/magenta glitch rectangles (30-50px, 5-7 at edges), bright cyan neon stars (20-30px glowing, 10-15 scattered), holographic cyan particles (5-12px with glow, 20-25 throughout). ALL elements at outer 10-15% edge border, center 70% clear. High-tech, neon-lit atmosphere."
      text_style "Impact font at 130-150px, extra bold 900 weight, white color with extra-thick 6-8px cyan outline stroke, cyan and magenta neon glow drop shadow"
      device_style "Glossy black metal frame with neon cyan glow effect, thin uniform bezels"
    }
  }
}

test WatercolorZenScreenshot {
  functions [GenerateScreenshotPrompt]
  args {
    text {
      header "Find Your Peace"
      subheader null
    }
    layout {
      composition "Device in upper area, header at bottom centered below device with minimal gap"
      device_orientation "straight-on frontal view with subtle natural tilt"
      device_type "iPhone 16 Pro with Dynamic Island, 19.5:9 aspect ratio, tall narrow smartphone"
    }
    style {
      background_color "soft gradient from pale sage green to warm cream white"
      details "Serene watercolor zen aesthetic with soft organic elements: delicate watercolor brush strokes in sage green and dusty rose (varying sizes 40-80px) - 3-4 scattered gently, simple leaf silhouettes in muted green (30-50px) - 4-6 placed naturally around edges, minimal zen circle enso brushstrokes in soft gray (50-70px) - 2-3 at corners, small sakura cherry blossom petals in pale pink (20-35px) - 6-8 floating delicately, abstract watercolor washes creating subtle texture - very light and airy throughout. Elements have soft edges with watercolor transparency effect, placed with intentional negative space. Calm, minimal, meditative aesthetic."
      text_style "Sans-serif elegant font, medium weight, soft gray or muted sage color with subtle glow, clean and readable"
      device_style "Matte finish in natural wood tone or soft white with minimal bezels"
    }
  }
}