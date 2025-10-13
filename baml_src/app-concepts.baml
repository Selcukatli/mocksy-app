// Multi-Concept App Generation
// Generates 4 diverse app concept variations from a single user description

// ============================================
// APP CONCEPT CLASSES
// ============================================

class AppConcept {
  app_name string @description("Short, catchy app name (1-3 words max, e.g., 'FitQuest', 'ZenJournal', 'ShadowVault')")
  app_subtitle string @description("App Store subtitle (30 characters MAX, including spaces). A single punchy phrase that captures the app's core value.")
  app_description string @description("App Store style description (3-5 sentences, 40-80 words). Explain what the app does, key features, and benefits.")
  style_description string @description("2-3 sentence visual style guide describing the UI aesthetic, mood, colors, typography approach, and design philosophy.")
  app_icon_prompt string @description("Complete text-to-image prompt for generating app icon (50-100 words). CRITICAL: Icon must be SIMPLE with LARGE, BOLD symbols recognizable at small sizes. FULL BLEED design extending to all edges with NO margins or padding. 1024x1024 square, iOS-style icon design.")
  cover_image_prompt string @description("Complete text-to-image prompt for generating promotional cover/hero image (100-150 words). Horizontal banner (1920×1080). Should capture app essence visually. CRITICAL: NO TEXT in the image - purely visual storytelling.")
}

class AppConceptsOutput {
  concepts AppConcept[] @description("Exactly 4 diverse app concepts, each with distinct visual style and approach")
}

// ============================================
// MULTI-CONCEPT GENERATION
// ============================================

function GenerateAppConcepts(
  app_description_input: string @description("User-provided app description/concept to generate from"),
  category_hint: string? @description("Optional category hint from user (e.g., 'Productivity', 'Health & Fitness')")
) -> AppConceptsOutput {
  client ScreenshotGeneratorMed
  prompt #"
    {{ _.role("user") }}

    You are generating 4 DIVERSE app concept variations from a single user idea.
    Each concept should explore a different visual style, mood, and design approach.

    USER'S APP IDEA:
    {{ app_description_input }}

    {% if category_hint %}
    CATEGORY HINT: {{ category_hint }}
    (Use this to inform your concepts, but you can vary it if appropriate)
    {% endif %}

    TASK: Create 4 distinct app concepts that interpret this idea in different ways.

    ## DIVERSITY REQUIREMENTS

    The 4 concepts should vary across these dimensions:
    - **Visual Style**: Minimal vs Bold, Light vs Dark, Flat vs 3D, Modern vs Classic
    - **Color Palette**: Different color schemes (e.g., pastels, neons, earth tones, monochrome)
    - **Mood**: Professional vs Playful, Calm vs Energetic, Serious vs Fun
    - **Design Philosophy**: Minimalist, Maximalist, Brutalist, Organic, Futuristic, etc.

    **CRITICAL**: Each concept should feel distinctly different. Users should be able to tell them apart at a glance.

    ## CONCEPT STRUCTURE

    For each of the 4 concepts, provide:

    ### 1. APP NAME
    - Short, catchy app name (1-3 words max)
    - Should match the style's mood:
      * Playful/bright styles → fun, energetic names
      * Zen/minimal styles → calm, simple names
      * Dark/tech styles → edgy, modern names
    - NO hyphens, NO long phrases
    - Can vary the name slightly across concepts if it fits better with the style

    ### 2. APP SUBTITLE
    - App Store subtitle (30 characters MAX, including spaces)
    - A single punchy phrase capturing core value
    - Examples: "Fitness made fun" (18 chars), "Your mindful companion" (23 chars)

    ### 3. APP DESCRIPTION
    - App Store style description (3-5 sentences, 40-80 words)
    - Explain what the app does and core purpose
    - List 2-3 key features or benefits
    - Make it sound exciting and professional
    - Match the style's mood and target audience

    ### 4. STYLE DESCRIPTION
    - 2-3 sentence visual style guide
    - Describe UI aesthetic, colors, typography, mood, design philosophy
    - Be specific about colors (use color names or hex codes)
    - Examples:
      * "Clean minimal interface with soft blue-green (#7EC8B8) and white. Generous whitespace and subtle shadows. Rounded corners throughout for friendly feel."
      * "Bold dark interface with vibrant purple (#8B3DFF) and cyan (#00F0FF) gradients. Strong typography with thick headlines. High contrast and dramatic shadows."
      * "Warm earthy palette with terracotta (#D4704A) and sage green (#8BA888). Organic shapes and hand-drawn elements. Friendly, approachable, natural aesthetic."

    ### 5. APP ICON PROMPT
    - Text-to-image prompt for the app icon (50-100 words)
    - **CRITICAL: Keep it SIMPLE - use ONE large, bold central symbol**
    - **AVOID: Small details, thin lines, complex patterns, tiny text**
    - Format: 1024x1024 square iOS icon (rounded square)
    - **FULL BLEED: Design should extend to all edges with NO margins, NO padding, NO borders**
    - Match the style's color palette and mood
    - Examples of GOOD icons:
      * "iOS app icon, full bleed design. Large bold shield symbol filling the frame, bright gradient (cyan to purple) edge to edge. Simple, clean design. Minimal details. No margins or borders. 1024x1024."
      * "iOS app icon, full bleed design. Big crescent moon symbol on deep purple gradient background filling entire frame. Soft glow effect. Simple and bold. No padding or borders. 1024x1024."

    ### 6. COVER IMAGE PROMPT
    - Text-to-image prompt for promotional banner (100-150 words)
    - Format: Horizontal/landscape banner (1920×1080)
    - Purpose: Promotional hero image for app store
    - **CRITICAL: ABSOLUTELY NO TEXT IN IMAGE**
      * DO NOT include any text, labels, titles, typography, letters, words, or numbers
      * Use color names (teal, violet, orange) NOT hex codes in the prompt
      * Communicate through imagery, composition, colors, shapes only
      * End prompt with: "No text, words, letters, numbers, or readable typography anywhere in the image."
    - Decide whether to show device mockup or pure visual metaphor based on what's more effective
    - Match the visual style and mood of the concept

    ## STYLE VARIATION EXAMPLES

    **Concept 1 - Minimal & Calm:**
    - Soft pastels (light blue, warm beige, soft green)
    - Generous whitespace, subtle shadows
    - Clean sans-serif typography
    - Organic, calming aesthetic

    **Concept 2 - Bold & Energetic:**
    - Vibrant colors (hot pink, electric blue, bright yellow)
    - Strong gradients, high contrast
    - Thick, bold typography
    - Dynamic, playful aesthetic

    **Concept 3 - Dark & Professional:**
    - Dark backgrounds (charcoal, deep purple, midnight blue)
    - Neon accents (cyan, magenta, lime)
    - Sharp, modern typography
    - Sleek, sophisticated aesthetic

    **Concept 4 - Warm & Friendly:**
    - Earth tones (terracotta, sage green, warm cream)
    - Rounded corners, soft shadows
    - Friendly, approachable typography
    - Natural, inviting aesthetic

    ## OUTPUT REQUIREMENTS

    Return exactly 4 concepts in the `concepts` array.
    Each concept should be complete and self-contained.
    Ensure clear visual diversity across all 4 concepts.

    {{ ctx.output_format }}
  "#
}

// ============================================
// TEST CASES
// ============================================

test GenerateMultipleConceptsForFitness {
  functions [GenerateAppConcepts]
  args {
    app_description_input "A fitness app that gamifies workouts with challenges, achievements, and social competition. Track progress, earn rewards, and stay motivated."
    category_hint "Health & Fitness"
  }
}

test GenerateMultipleConceptsForMeditation {
  functions [GenerateAppConcepts]
  args {
    app_description_input "Mindfulness and meditation app for busy professionals. Quick 5-minute guided sessions, breathing exercises, and ambient soundscapes."
    category_hint null
  }
}

