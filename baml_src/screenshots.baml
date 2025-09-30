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
// SIMPLIFIED CLASSES FOR SCREENSHOT GENERATION
// ============================================

// Layout configuration
class Layout {
  composition string @description("Overall layout composition. Example: 'Device fills most of vertical canvas in upper area, text centered below at bottom', 'Device centered with text overlay on top', 'Device on left side, text on right'")
  device_size string @description("Device size relative to canvas (fills-most, large, medium, compact)")
  device_angle string @description("Device viewing angle and perspective (straight-on, slight-tilt, angled-3d)")
  device_description string @description("Exact device description including model and screen characteristics. Example: 'iPhone 16 Pro with under-display camera technology, perfect rectangular screen with NO notch, NO dynamic island, NO cutouts. Slim uniform bezels all around. The screen is a complete uninterrupted rectangle from edge to edge.'")
}

// Visual style for screenshot frame
class VisualStyle {
  // Background - describe the entire scene with precise details
  background string @description("Complete background description including exact color, decorative elements, their size, placement, and overall aesthetic. Be specific about element characteristics. Example: 'Solid flat bright yellow (#FFED00) background. Simple black outlined smiley face emojis (large, about 60-80px) placed sparsely at corners - top-left and bottom-right only. Small colorful four-point star shapes in blue, pink, orange scattered minimally around edges. Tiny confetti rectangles in pink, purple, blue. Simple, clean, not cluttered.'")

  // Device styling - be more specific
  device_frame string @description("Device frame appearance with precise gradient direction. Examples: 'rainbow gradient from cyan (top-left) through pink/magenta (top-right) to yellow (bottom) on glossy finish', 'matte black', 'glossy white'")

  // Text styling
  text_font string @description("Font family (Impact, SF-Pro-Display, Inter, Poppins)")
  text_color string @description("Text fill color (black, white)")
  text_outline string @description("Stroke around text (thick-white-outline, medium-black-outline, thin-white-outline, none)")
  text_style string @description("Additional text styling (bold, extra-bold, black-weight, with-drop-shadow)")
}


// ============================================
// GENERATION FUNCTIONS
// ============================================

// Output structure for background generation with HTML text overlay
class BackgroundWithTextSpec {
  background_prompt string @description("Detailed prompt for generating just the background image")
  text_html string @description("HTML structure for the text overlay")
  text_tailwind_classes string @description("Tailwind CSS classes for styling the text")
  text_content string @description("The actual text content to display")
  text_position string @description("CSS positioning properties (e.g., 'bottom-8 text-center')")
}

// Generates a background-only image prompt + Tailwind CSS for text overlay
// This allows you to composite device + text separately for perfect control
function GenerateBackgroundWithTextOverlay(
  header: string @description("Text to display"),
  layout: Layout @description("Layout configuration"),
  style: VisualStyle @description("Visual style configuration")
) -> BackgroundWithTextSpec {
  client ScreenshotGeneratorMed
  prompt #"
    {{ _.role("user") }}

    Generate a specification for creating an app store screenshot background with HTML text overlay.

    INPUTS:
    Header text: "{{ header }}"
    Layout: {{ layout.composition }}
    Background: {{ style.background }}
    Text font: {{ style.text_font }}
    Text color: {{ style.text_color }}
    Text outline: {{ style.text_outline }}
    Text style: {{ style.text_style }}
    Device size: {{ layout.device_size }}

    Generate a JSON object with this structure:
    {
      "background_prompt": "Detailed image generation prompt for ONLY the background (no device, no text, no phone, no mockup). Describe the background: {{ style.background }}. Fill the ENTIRE canvas edge-to-edge with the gradient and decorative elements. Do NOT mention leaving space for a device. Do NOT draw any device or phone shape. Include canvas dimensions, gradient details, decorative elements, and spatial composition. The composition should be: {{ layout.composition }} but IGNORE any mention of device placement - just describe the background filling the full canvas. 5-8 sentences, natural language.",

      "text_html": "HTML structure like: <div class='[tailwind-classes]'><h1 class='[text-classes]'>{{ header }}</h1></div>",

      "text_tailwind_classes": "Tailwind classes that match the style specification. Based on: font={{ style.text_font }}, color={{ style.text_color }}, outline={{ style.text_outline }}, style={{ style.text_style }}. Example: 'text-8xl font-black text-white drop-shadow-[0_0_8px_rgba(139,92,246,1)] [text-shadow:_-4px_-4px_0_rgb(139_92_246),_4px_-4px_0_rgb(139_92_246),_-4px_4px_0_rgb(139_92_246),_4px_4px_0_rgb(139_92_246)]'",

      "text_content": "{{ header }}",

      "text_position": "Tailwind positioning classes based on layout. From: {{ layout.composition }}. Example: 'absolute bottom-8 left-0 right-0 text-center' or 'absolute top-12 left-0 right-0 text-center'"
    }

    INSTRUCTIONS:
    - background_prompt: Natural language image generation prompt, no device or text mentioned
    - text_tailwind_classes: Use actual Tailwind v4 classes for font size, weight, color, text-shadow/outline effects
    - Map font names: Impact → font-[Impact], SF-Pro-Display → font-sans, Inter → font-sans, Poppins → font-[Poppins]
    - Map text outline: thick-purple-outline → use text-shadow CSS with purple, thick-black-outline → text-shadow with black
    - Map text style: extra-bold → font-black, bold → font-bold, with-drop-shadow → drop-shadow-2xl
    - text_position: Use absolute positioning with Tailwind classes

    Output ONLY valid JSON with NO markdown, NO preamble.

    {{ ctx.output_format }}
  "#
}

// ============================================
// COMPLETE SCREENSHOT GENERATION (NO APP SCREEN INPUT)
// ============================================

// Generates a complete app store screenshot with device mockup and text
// Input: Black rectangle canvas (inpainting reference)
// Output: Full composition with background, device frame, blank screen, and text
function GenerateCompleteScreenshotPrompt(
  header: string @description("Text to display"),
  layout: Layout @description("Layout configuration"),
  style: VisualStyle @description("Visual style configuration")
) -> string {
  client ScreenshotGeneratorMed
  prompt #"
    {{ _.role("user") }}

    Generate a detailed visual prompt for creating a complete app store marketing screenshot.
    This will be used with an inpainting reference (black rectangle canvas).

    INPUTS:
    Header text: "{{ header }}"
    Layout: {{ layout.composition }}
    Device size: {{ layout.device_size }}
    Device angle: {{ layout.device_angle }}
    Device description: {{ layout.device_description }}
    Background: {{ style.background }}
    Device frame: {{ style.device_frame }}
    Text font: {{ style.text_font }}
    Text color: {{ style.text_color }}
    Text outline: {{ style.text_outline }}
    Text style: {{ style.text_style }}

    Write a comprehensive visual description (10-15 sentences) that includes:

    1. **Canvas and overall composition**: The image fills a tall rectangular canvas (approximately 1170x2532 pixels, portrait orientation). {{ layout.composition }}. The device should be {{ layout.device_size }} and positioned to maximize canvas usage.

    2. **Background details**: {{ style.background }}. The background fills the entire canvas edge-to-edge with decorative elements dynamically placed to avoid large empty areas.

    3. **Device appearance - CRITICAL**:
       - {{ layout.device_description }}
       - Device frame finish: {{ style.device_frame }}
       - Viewing angle: {{ layout.device_angle }}
       - The device screen is COMPLETELY BLANK - a solid dark gray or black empty screen with NO app UI, NO content, NO icons, NO text
       - Think of it as a powered-off phone screen - just a pure dark rectangular display
       - The blank screen will be replaced with actual app content later, so it must be completely empty

    4. **Text styling**: The text "{{ header }}" appears in {{ style.text_font }} font with {{ style.text_color }} color. The text has {{ style.text_outline }} and uses {{ style.text_style }} styling. The text should be VERY LARGE, BOLD, and instantly readable.

    5. **Space efficiency**: Maximize canvas usage - device and text fill the frame efficiently with minimal wasted space. Background elements fill remaining areas.

    6. **Critical requirements**:
       - Device screen must be BLANK/EMPTY (solid dark gray or black)
       - NO app UI or content on the screen
       - Device maintains proper aspect ratio
       - Text is positioned according to layout specification
       - Background fills all gaps

    Write this as a flowing, natural description for an image AI. Focus on the complete composition being painted into a rectangular canvas.

    Output ONLY the detailed visual prompt with NO preamble, NO explanation, NO JSON formatting, NO markdown.
  "#
}

// ============================================
// MAIN GENERATION FUNCTION (WITH APP SCREEN INPUT)
// ============================================

// Nested classes for screenshot specification
class BackgroundSpec {
  colors string[] @description("Array of background colors")
  effects string[] @description("Array of decorative elements")
  placement string @description("How effects are arranged spatially")
  seamless_to_bottom bool @description("Whether background extends seamlessly to bottom")
  forbidden string[] @description("Forbidden elements in background")
}

class ScreenshotTreatment {
  treatment string @description("How screenshot is composited")
  preserve bool @description("Whether to preserve original content")
  forbidden string[] @description("Forbidden operations on screenshot")
}

class DeviceSpec {
  type string @description("Device type description")
  aspect_ratio string @description("Device aspect ratio")
  frame string @description("Device frame appearance")
  angle string @description("Device viewing angle")
  scale string @description("Device size on canvas")
  position string @description("Device positioning")
  screenshot ScreenshotTreatment @description("Screenshot handling specification")
}

class HeaderFont {
  family string @description("Font family")
  weight int @description("Font weight")
  color string @description("Color with outline description")
  effects string[] @description("Text effects")
}

class HeaderTextSpec {
  copy string @description("Header text content")
  placement string @description("Where header appears")
  font HeaderFont @description("Font specification")
  size string @description("Text size description")
}

class CompositionSpec {
  priority string @description("What dominates the space")
  rules string[] @description("Composition guidelines")
}

// Output structure for screenshot edit specification (matches the reference format)
class ScreenshotEditSpec {
  style string @description("Overall style description")
  background BackgroundSpec @description("Background specification")
  device DeviceSpec @description("Device specification")
  header_text HeaderTextSpec @description("Header text specification")
  composition CompositionSpec @description("Composition specification")
}

// Generates structured JSON specification for image-to-image screenshot compositing
function GenerateScreenshotEditPrompt(
  header: string @description("Text to display (e.g., 'Play Games with Friends!')"),
  layout: Layout @description("Layout configuration"),
  style: VisualStyle @description("Visual style configuration")
) -> ScreenshotEditSpec {
  client ScreenshotGeneratorMed
  prompt #"
    {{ _.role("user") }}

    Generate a structured JSON specification for app store screenshot generation using image-to-image compositing.

    INPUTS:
    Header text: "{{ header }}"
    Layout: {{ layout.composition }}
    Device size: {{ layout.device_size }}
    Device angle: {{ layout.device_angle }}
    Device description: {{ layout.device_description }}
    Background: {{ style.background }}
    Device frame: {{ style.device_frame }}
    Text font: {{ style.text_font }}
    Text color: {{ style.text_color }}
    Text outline: {{ style.text_outline }}
    Text style: {{ style.text_style }}

    Generate a nested JSON object matching this structure:

    {
      "style": "Brief style description (e.g., 'Playful Snapchat-inspired', '80s/90s Retro-futuristic')",
      "background": {
        "colors": ["Array of hex colors or color names from {{ style.background }}"],
        "effects": ["Array of decorative elements from {{ style.background }}"],
        "placement": "How effects are spatially arranged, emphasizing readability",
        "seamless_to_bottom": true,
        "forbidden": ["black bars", "solid footer fills", "text placeholders"]
      },
      "device": {
        "type": "Extract from {{ layout.device_description }}, but use generic description like 'iPhone 16 Pro' or 'Modern smartphone'",
        "aspect_ratio": "19.5:9 (~2.16:1, tall and narrow)",
        "frame": "{{ style.device_frame }}",
        "angle": "{{ layout.device_angle }} with detail (e.g., 'slight 3D tilt (~5-10°) but mostly front-facing' or 'straight-on frontal view')",
        "scale": "CRITICAL: Based on {{ layout.device_size }}, device should be MAXIMUM size possible. For 'large' or 'fills-most': use 90-95% of canvas height. Minimize margins. The device should dominate the frame.",
        "position": "From {{ layout.composition }}, e.g., 'centered horizontally'",
        "screenshot": {
          "treatment": "pixel-perfect placement into the screen cutout",
          "preserve": true,
          "forbidden": ["cropping", "stretching", "UI redrawing"]
        }
      },
      "header_text": {
        "copy": "{{ header }}",
        "placement": "From {{ layout.composition }}, e.g., 'top, centered horizontally above the phone' or 'bottom, centered below device'. CRITICAL: Text should be positioned with MINIMAL gap from device - tight spacing to maximize space usage.",
        "font": {
          "family": "{{ style.text_font }}",
          "weight": Infer number from {{ style.text_style }} (700, 800, or 900),
          "color": "{{ style.text_color }} with {{ style.text_outline }}",
          "effects": ["Array from {{ style.text_outline }} and {{ style.text_style }}"]
        },
        "size": "CRITICAL: From {{ style.text_style }} - text should be VERY LARGE and BOLD, taking up significant vertical space. For example: 'extremely large and bold, dominant, filling available space' - NOT 'balanced' or 'moderate'."
      },
      "composition": {
        "priority": "From {{ layout.composition }}, e.g., 'device + header text dominate vertical space'. CRITICAL: MAXIMIZE space efficiency - device and text should fill 95%+ of canvas vertically with minimal empty space.",
        "rules": [
          "phone must remain tall and narrow (no iPad-like shapes)",
          "background adapts to keep header readable",
          "no placeholder boxes or bands at bottom or top",
          "CRITICAL: minimize empty space - device and text should be scaled up to fill canvas as much as possible",
          "tight spacing between text and device - minimal gaps"
        ]
      }
    }

    CRITICAL: Output ONLY valid JSON with NO markdown code blocks, NO preamble.

    {{ ctx.output_format }}
  "#
}

// ============================================
// TEST CASES
// ============================================

test VaporwaveBackgroundWithText {
  functions [GenerateBackgroundWithTextOverlay]
  args {
    header "Chill Vibes Only"
    layout {
      composition "Device will be centered vertically, filling 85-90% of canvas height. Text positioned at bottom below device. Nostalgic 80s-90s aesthetic with balanced symmetry."
      device_size "large"
      device_angle "straight-on"
      device_description "iPhone 16 Pro with under-display camera technology"
    }
    style {
      background "Classic vaporwave gradient from pink (#FF71CE) at top through purple (#B967FF) in middle to cyan (#05FFA1) at bottom. Retro grid floor perspective at bottom fading into distance. Palm tree silhouettes (60-80px) in dark purple at sides. Geometric shapes: triangles and rectangles with pink and cyan borders floating around. Sun/grid sphere in top corner. Scan lines effect subtly overlaid. 80s/90s retro-futuristic aesthetic with dreamy nostalgic feel."
      device_frame "Glossy white with subtle rainbow iridescent sheen."
      text_font "Impact"
      text_color "white"
      text_outline "thick-purple-outline with-pink-shadow"
      text_style "extra-bold black-weight"
    }
  }
}

test SnapStyleScreenshot {
  functions [GenerateScreenshotEditPrompt]
  args {
    header "Play Games with Friends!"
    layout {
      composition "Text positioned at the TOP of the canvas taking up about 20-25% of vertical space. Device positioned in the lower area filling about 90-95% of remaining vertical space. Center everything horizontally. Maximize canvas usage with minimal gaps between elements."
      device_size "fills-most"
      device_angle "straight-on"
      device_description "iPhone 16 Pro with under-display camera technology, perfect rectangular screen with NO notch, NO dynamic island, NO cutouts. Slim uniform bezels all around. The screen is a complete uninterrupted rectangle from edge to edge."
    }
    style {
      background "Solid flat bright vibrant yellow (#FFED00) background. Mix of bold graphic elements scattered dynamically around the edges and corners: Large simple black outlined smiley face emojis (80-100px) - 3-4 total scattered around sides. Bold four-point star sparkles in white and black outline (varying sizes 30-60px) - about 6-8 total. Curved arrows in thick black outline (60-80px) - 2-3 arrows pointing in dynamic directions. Lightning bolt zigzag shapes in black outline (50-70px) - 2-3 bolts. Abstract geometric elements: small circles, rectangles, curved lines in black and white (20-40px) - scattered moderately. Small confetti dashes and dots in white and light yellow - sprinkled lightly throughout. Very dynamic, bold, graphic design aesthetic inspired by comic books and pop art with strong contrast."
      device_frame "Simple clean design - matte white or light silver frame with thin black bezels. Minimal, modern aesthetic that doesn't compete with the bold background elements."
      text_font "Impact"
      text_color "white"
      text_outline "thick-black-outline"
      text_style "extra-bold black-weight"
    }
  }
}

test ZenWatercolorScreenshot {
  functions [GenerateScreenshotEditPrompt]
  args {
    header "Find Your Inner Peace"
    layout {
      composition "Device centered vertically and horizontally filling 85-90% of canvas height. Text positioned gracefully above the device with ample spacing. Balanced, serene composition with intentional negative space."
      device_size "large"
      device_angle "slight-tilt"
      device_description "iPhone 16 Pro with under-display camera technology, perfect rectangular screen with NO notch, NO dynamic island, NO cutouts. Slim uniform bezels all around. The screen is a complete uninterrupted rectangle from edge to edge."
    }
    style {
      background "Soft watercolor gradient background transitioning from pale lavender (#E6E6FA) at top through light mint green (#E0F8F0) in middle to soft peach (#FFE5D9) at bottom. Delicate watercolor brush stroke textures creating organic, flowing transitions. Subtle abstract watercolor lotus petals (translucent, 40-50px) floating gently - only 2-3 petals in soft pink and pale blue. Tiny watercolor dots and gentle paint splatters in muted tones. Dreamy, tranquil, organic aesthetic with soft edges and transparency."
      device_frame "Soft matte silver with subtle brushed metal texture. Elegant minimal bezels. Gentle, calming appearance with no harsh reflections."
      text_font "SF-Pro-Display"
      text_color "deep-sage-green"
      text_outline "subtle-soft-white-glow"
      text_style "light-weight elegant-spacing"
    }
  }
}

test MrBeastStyleScreenshot {
  functions [GenerateScreenshotEditPrompt]
  args {
    header "$10,000 CHALLENGE!"
    layout {
      composition "Text DOMINATES the top 30% of canvas in massive bold letters. Device fills 90-95% of remaining space below. Everything centered horizontally. High-energy, in-your-face composition with minimal breathing room."
      device_size "fills-most"
      device_angle "straight-on"
      device_description "iPhone 16 Pro with under-display camera technology, perfect rectangular screen with NO notch, NO dynamic island, NO cutouts. Slim uniform bezels all around. The screen is a complete uninterrupted rectangle from edge to edge."
    }
    style {
      background "Electric gradient from vibrant hot pink (#FF10F0) at top to electric cyan (#00F0FF) at bottom. Explosive energy rays radiating from corners in bright yellow (#FFFF00) and orange (#FF8800). Large dollar sign symbols ($) scattered around edges (60-80px) in bright green (#00FF00) with black outline. Lightning bolts and explosion shapes in white with thick black outlines. Money bag emojis and fire emojis strategically placed. Starburst shapes and action lines. Maximum energy, chaos, and excitement - inspired by YouTube thumbnail aesthetics."
      device_frame "Glossy metallic gold frame with high reflectivity. Bold, premium, attention-grabbing appearance."
      text_font "Impact"
      text_color "white"
      text_outline "thick-black-outline with red inner shadow"
      text_style "extra-bold black-weight massive-size with-drop-shadow"
    }
  }
}

test MinimalistModernScreenshot {
  functions [GenerateScreenshotEditPrompt]
  args {
    header "Design Made Simple"
    layout {
      composition "Device positioned center-left taking up 85-90% of canvas height. Text positioned on upper-right area creating asymmetric balance. Modern, editorial magazine-style layout with strategic white space."
      device_size "large"
      device_angle "slight-tilt"
      device_description "iPhone 16 Pro with under-display camera technology, perfect rectangular screen with NO notch, NO dynamic island, NO cutouts. Slim uniform bezels all around. The screen is a complete uninterrupted rectangle from edge to edge."
    }
    style {
      background "Clean gradient from light gray (#F5F5F5) at top to pure white (#FFFFFF) at bottom. Minimal geometric elements: thin outlined circles (50-70px) in dark gray (#333333) - only 2-3 placed strategically in corners. Subtle diagonal lines (2px thick) in light gray creating subtle depth. Ultra-clean, Swiss design inspired, emphasizing typography and negative space. Professional, sophisticated, uncluttered."
      device_frame "Matte black with premium matte finish. Clean lines, minimal bezels. Sophisticated and timeless."
      text_font "Inter"
      text_color "black"
      text_outline "none"
      text_style "bold clean-spacing"
    }
  }
}

test NeonCyberpunkScreenshot {
  functions [GenerateScreenshotEditPrompt]
  args {
    header "Enter The Future"
    layout {
      composition "Device fills 90-95% of canvas height, positioned slightly off-center left. Text overlaid on top-right with glowing effect. Dramatic, cinematic composition inspired by sci-fi movie posters."
      device_size "fills-most"
      device_angle "slight-tilt"
      device_description "iPhone 16 Pro with under-display camera technology, perfect rectangular screen with NO notch, NO dynamic island, NO cutouts. Slim uniform bezels all around. The screen is a complete uninterrupted rectangle from edge to edge."
    }
    style {
      background "Dark purple to black gradient (#1A0033 to #000000) with electric neon accents. Bright neon pink (#FF006E) and cyan (#00F5FF) grid lines creating depth perspective. Glowing hexagon shapes (40-60px) scattered around edges in neon blue and pink. Digital circuit board patterns subtly visible in dark areas. Light beams and lens flares in cyan and magenta. Cyberpunk, futuristic, high-tech aesthetic with strong contrast between dark background and bright neon elements."
      device_frame "Glossy black with neon blue edge lighting effect. Futuristic, tech-forward appearance."
      text_font "Poppins"
      text_color "white"
      text_outline "thick-neon-cyan-glow"
      text_style "extra-bold with-neon-glow"
    }
  }
}

test RetroVaporwaveScreenshot {
  functions [GenerateScreenshotEditPrompt]
  args {
    header "Chill Vibes Only"
    layout {
      composition "Device fills 75-80% of canvas height positioned in upper-middle area. Text positioned at bottom with MINIMAL gap - only 2-3% spacing between device and text. Maximize vertical space usage - device and text together should fill 95%+ of canvas height. Nostalgic 80s-90s aesthetic with balanced symmetry."
      device_size "fills-most"
      device_angle "straight-on"
      device_description "iPhone 16 Pro with revolutionary under-display camera technology. The screen is a PERFECT RECTANGLE with rounded corners and NO notch, NO dynamic island, NO camera cutouts of any kind. Slim uniform bezels all around (approximately 2-3mm). The screen is completely uninterrupted from edge to edge - think of it as a pure rectangular display with nothing cutting into it. The camera and sensors are hidden beneath the display using advanced technology. NO status bar visible, NO home indicator bar. This is a reimagined iPhone 16 Pro with a completely clean rectangular screen."
    }
    style {
      background "Classic vaporwave gradient from pink (#FF71CE) at top through purple (#B967FF) in middle to cyan (#05FFA1) at bottom. Retro grid floor perspective at bottom fading into distance. Palm tree silhouettes (60-80px) in dark purple at sides. Geometric shapes: triangles and rectangles with pink and cyan borders floating around. Sun/grid sphere in top corner. Scan lines effect subtly overlaid. 80s/90s retro-futuristic aesthetic with dreamy nostalgic feel."
      device_frame "Glossy white with subtle rainbow iridescent sheen. Retro-modern fusion appearance."
      text_font "Impact"
      text_color "white"
      text_outline "thick-purple-outline with-pink-shadow"
      text_style "bold retro-spacing"
    }
  }
}