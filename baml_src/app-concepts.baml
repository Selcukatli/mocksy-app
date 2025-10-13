// Multi-Concept App Generation
// Generates 4 diverse app concept variations from a single user description

// ============================================
// APP CONCEPT CLASSES
// ============================================

class AppConcept {
  app_name string @description("Short, catchy app name (1-3 words max, e.g., 'FitQuest', 'ZenJournal', 'ShadowVault')")
  app_subtitle string @description("App Store subtitle (30 characters MAX, including spaces). A single punchy phrase that captures the app's core value.")
  app_description string @description("Full App Store description (150-250 words, 8-12 sentences). Structure like real App Store listings: (1) OPENING HOOK: Compelling first sentence that captures the core value proposition. (2) KEY FEATURES: 3-5 standout features with specific details about what users can do. (3) BENEFITS: How it improves users' lives or solves their problems. (4) USE CASES: Specific scenarios or moments when users would use this. (5) CLOSING: Engaging final sentence or call-to-action. Make it persuasive, professional, and detailed enough to understand the full app experience. Example: 'Transform your fitness journey into an epic adventure with FitQuest. Every workout becomes a quest, every rep earns you experience points, and every milestone unlocks new challenges and rewards. Track your workouts with intelligent logging that learns your routines and suggests progressive overload. Join guilds with friends to tackle group challenges, compete on leaderboards, and celebrate victories together. Earn achievements for consistency, personal records, and completing themed quest lines. Your avatar grows stronger as you do, unlocking new abilities and gear that reflect your real-world progress. Perfect for gym-goers who want accountability, gamers seeking active hobbies, or anyone who finds traditional fitness tracking boring. Whether you're lifting weights, running, or doing yoga, FitQuest turns every session into an adventure. Start your quest today and discover how fun fitness can be.'")
  app_category string @description("App Store category. Choose the single most appropriate category from: Games, Productivity, Lifestyle, Education, Health & Fitness, Business, Social Networking, Entertainment, Photo & Video, Travel, Food & Drink, Finance, News, Sports, Weather, Music, Shopping, Utilities, Medical, Reference. If user provided category_hint, use that as guidance but adjust if another category fits better based on the app's actual functionality.")
  style_description string @description("Complete visual style guide (3-5 sentences). MUST include specific design tokens: (1) COLORS: Provide exact hex codes for 2-4 key colors with usage context (e.g., 'Primary: #7EC8B8 (buttons, accents), Background: #FFFFFF, Text: #1A1A1A, Secondary: #E8F5F2 (cards)'). (2) TYPOGRAPHY: Font styles with sizes (e.g., 'Headlines: 28px/700 weight, Body: 16px/400'). (3) SPACING & EFFECTS: Corner radius (8-16px), shadows (e.g., '0px 2px 8px rgba(0,0,0,0.12)'), padding guidelines. (4) DESIGN PHILOSOPHY: Overall aesthetic and mood. Example: 'Clean minimal interface. Colors: Primary #7EC8B8 (CTAs), Background #FFFFFF, Text #2C3E50, Accent #E8F5F2 (cards). Typography: Bold sans-serif headlines 28px/700, body text 16px/400. Rounded corners 12px throughout, subtle shadows 0px 2px 8px rgba(0,0,0,0.1). Generous whitespace for calm, approachable feel.'")
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
    - **CRITICAL: Full App Store description (150-250 words, 8-12 sentences)**
    - Structure like real App Store listings:
      * **OPENING HOOK**: Compelling first sentence capturing core value proposition
      * **KEY FEATURES**: 3-5 standout features with specific details about what users can do
      * **BENEFITS**: How it improves users' lives or solves their problems
      * **USE CASES**: Specific scenarios or moments when users would use this
      * **CLOSING**: Engaging final sentence or call-to-action
    - Make it persuasive, professional, and detailed enough to understand the full app experience
    - Match the style's mood and target audience
    - Example structure:
      * "Transform your [problem] with [AppName]. [Opening hook explaining main benefit]."
      * "[Feature 1 with details]. [Feature 2 with details]. [Feature 3 with details]."
      * "[Who it's perfect for]. [Use case scenarios]."
      * "[Closing call-to-action or inspirational statement]."

    ### 4. APP CATEGORY
    - Choose the single most appropriate App Store category from: Games, Productivity, Lifestyle, Education, Health & Fitness, Business, Social Networking, Entertainment, Photo & Video, Travel, Food & Drink, Finance, News, Sports, Weather, Music, Shopping, Utilities, Medical, Reference
    - If category_hint was provided, use it as guidance but adjust if another category fits better based on the app's actual functionality
    - If no hint provided, infer from the app description and core features

    ### 5. STYLE DESCRIPTION
    - **CRITICAL: 3-5 sentence comprehensive style guide with specific design tokens**
    - MUST include all of the following:
      * **COLORS** (with hex codes): Primary, Background, Text, and 1-2 accent colors. Include usage context for each.
      * **TYPOGRAPHY**: Headline and body text styles with specific sizes (px) and weights
      * **SPACING & EFFECTS**: Corner radius values, shadow specifications, padding/spacing guidelines
      * **DESIGN PHILOSOPHY**: Overall aesthetic and mood description
    - Examples of COMPLETE style descriptions:
      * "Clean minimal interface. Colors: Primary #7EC8B8 (CTAs, links), Background #FFFFFF, Text #2C3E50, Accent #E8F5F2 (cards, sections). Typography: Bold sans-serif headlines 28px/700 weight, body text 16px/400. Rounded corners 12px throughout, subtle shadows 0px 2px 8px rgba(0,0,0,0.1). Generous whitespace for calm, approachable feel."
      * "Bold dark interface. Colors: Primary #8B3DFF (actions, highlights), Background #0A0E27, Text #FFFFFF, Secondary #FF006E (accents, warnings). Typography: Extra bold headlines 32px/800, medium body 18px/500. Sharp corners 4px, dramatic shadows 0px 4px 16px rgba(0,0,0,0.4). High contrast and energetic vibe."
      * "Warm earthy palette. Colors: Primary #D4704A (CTAs), Background #FFF8F0, Text #3D2817, Accent #8BA888 (highlights, success). Typography: Friendly rounded headlines 26px/700, readable body 16px/400. Soft corners 16px, gentle shadows 0px 2px 12px rgba(61,40,23,0.08). Organic shapes create approachable, natural aesthetic."

    ### 6. APP ICON PROMPT
    - Text-to-image prompt for the app icon (50-100 words)
    - **CRITICAL: Keep it SIMPLE - use ONE large, bold central symbol**
    - **AVOID: Small details, thin lines, complex patterns, tiny text**
    - Format: 1024x1024 square iOS icon (rounded square)
    - **FULL BLEED: Design should extend to all edges with NO margins, NO padding, NO borders**
    - Match the style's color palette and mood
    - Examples of GOOD icons:
      * "iOS app icon, full bleed design. Large bold shield symbol filling the frame, bright gradient (cyan to purple) edge to edge. Simple, clean design. Minimal details. No margins or borders. 1024x1024."
      * "iOS app icon, full bleed design. Big crescent moon symbol on deep purple gradient background filling entire frame. Soft glow effect. Simple and bold. No padding or borders. 1024x1024."

    ### 7. COVER IMAGE PROMPT
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

