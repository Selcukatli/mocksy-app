// Multi-Concept App Generation
// Generates 4 diverse app concept variations from a single user description

// ============================================
// APP CONCEPT CLASSES
// ============================================

class StyleColors {
  primary string @description("Primary brand color as hex code (e.g., '#7EC8B8'). Used for buttons, CTAs, and key accents.")
  background string @description("Background color as hex code (e.g., '#FFFFFF' for white, '#1A1A1A' for dark). Main canvas color.")
  text string @description("Primary text color as hex code (e.g., '#2C3E50'). For body text and headlines.")
  accent string @description("Secondary accent color as hex code (e.g., '#E8F5F2'). For cards, highlights, or secondary elements.")
}

class StyleTypography {
  headlineFont string @description("Font family for headlines (e.g., 'SF Pro Display', 'Inter Bold', 'Poppins')")
  headlineSize string @description("Font size for headlines (e.g., '28px', '32px', '24px')")
  headlineWeight string @description("Font weight for headlines (e.g., '700', '600', 'bold')")
  bodyFont string @description("Font family for body text (e.g., 'SF Pro Text', 'Inter', 'Roboto')")
  bodySize string @description("Font size for body text (e.g., '16px', '14px', '15px')")
  bodyWeight string @description("Font weight for body text (e.g., '400', '500', 'regular')")
}

class StyleEffects {
  cornerRadius string @description("Border radius for UI elements (e.g., '12px', '8px', '16px'). Consistent rounding value.")
  shadowStyle string @description("Shadow specification (e.g., '0px 2px 8px rgba(0,0,0,0.1)', 'none', '0px 4px 12px rgba(0,0,0,0.15)')")
  designPhilosophy string @description("Overall aesthetic and mood in 1-2 sentences (e.g., 'Clean minimal interface with generous whitespace for a calm, approachable feel', 'Bold cyberpunk aesthetic with neon accents and futuristic vibes')")
}

class AppConcept {
  app_name string @description("Short, catchy app name (1-3 words max, e.g., 'FitQuest', 'ZenJournal', 'ShadowVault')")
  app_subtitle string @description("App Store subtitle (30 characters MAX, including spaces). A single punchy phrase that captures the app's core value.")
  app_description string @description("Full App Store description (300-400 words, ~2,100 characters). MUST be formatted with bullet points for features and natural paragraph flow following this structure:\n\n[Opening Hook - 2-3 sentences capturing core value proposition]\n\nKEY FEATURES:\n* Feature 1: Detailed description of what users can do\n* Feature 2: Detailed description of what users can do\n* Feature 3: Detailed description of what users can do\n* Feature 4: Detailed description of what users can do\n* Feature 5: Detailed description of what users can do (optional)\n\n[Benefits paragraph - naturally explain how the app improves users' lives or solves their problems without a header]\n\n[Target audience paragraph - naturally describe who would love this app and when they'd use it, without saying 'perfect for' or using a header]\n\n[Closing call-to-action sentence]\n\nExample:\n'Transform your fitness journey into an epic adventure with FitQuest. Every workout becomes a quest, every rep earns experience points, and every milestone unlocks new challenges.\n\nKEY FEATURES:\n* Quest-based workouts: Turn any exercise routine into an exciting adventure with themed quest lines and progressive challenges\n* Intelligent workout logging: Track your sessions with AI that learns your routines and suggests optimal progressive overload\n* Guild system: Join forces with friends to tackle group challenges, compete on leaderboards, and celebrate victories together\n* Achievement system: Earn badges for consistency streaks, personal records, and completing special quest lines\n* Avatar progression: Watch your character grow stronger as you do, unlocking new abilities and gear that mirror your real-world gains\n\nStay motivated with gamification that makes fitness fun and addictive. Never miss a workout when you're part of a guild counting on you. Track your progress with insights that help you improve faster and avoid plateaus.\n\nWhether you're a gym regular looking for accountability, a gamer who wants an active hobby, or someone who finds traditional fitness apps boring, you'll discover a new way to stay motivated. From lifting weights to running to yoga, every session becomes an adventure worth completing.\n\nStart your quest today and discover how fun fitness can be!'")
  app_category string @description("App Store category. Choose the single most appropriate category from: Games, Productivity, Lifestyle, Education, Health & Fitness, Business, Social Networking, Entertainment, Photo & Video, Travel, Food & Drink, Finance, News, Sports, Weather, Music, Shopping, Utilities, Medical, Reference. If user provided category_hint, use that as guidance but adjust if another category fits better based on the app's actual functionality.")
  
  colors StyleColors
  typography StyleTypography
  effects StyleEffects
  
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
    - **CRITICAL: Full App Store description (300-400 words, ~2,100 characters)**
    - **MUST use natural, conversational formatting with KEY FEATURES as the only header:**
    
    **FORMAT TEMPLATE:**
    ```
    [Opening Hook - 2-3 compelling sentences capturing core value proposition]

    KEY FEATURES:
    * Feature 1 name: Detailed description of what users can do and why it matters
    * Feature 2 name: Detailed description of what users can do and why it matters
    * Feature 3 name: Detailed description of what users can do and why it matters
    * Feature 4 name: Detailed description of what users can do and why it matters
    * Feature 5 name: Detailed description of what users can do and why it matters

    [Benefits paragraph - naturally explain how the app improves lives without using "BENEFITS:" header]

    [Target audience paragraph - naturally describe who would love this without using "PERFECT FOR:" header]

    [Closing call-to-action sentence]
    ```
    
    - **Include literal line breaks** between sections (use \n\n in output)
    - Use asterisk bullets (*) for each feature
    - Each feature should have both a name and detailed description
    - Write benefits and target audience as NATURAL paragraphs without headers
    - Make it persuasive, conversational, and match the style's mood
    - Must feel like a real App Store description, not a formal document
    
    **EXAMPLE OF PROPERLY FORMATTED OUTPUT:**
    ```
    Transform your fitness journey into an epic adventure with FitQuest. Every workout becomes a quest, every rep earns experience points, and every milestone unlocks new challenges.

    KEY FEATURES:
    * Quest-based workouts: Turn any exercise routine into an exciting adventure with themed quest lines and progressive challenges
    * Intelligent workout logging: Track your sessions with AI that learns your routines and suggests optimal progressive overload
    * Guild system: Join forces with friends to tackle group challenges, compete on leaderboards, and celebrate victories together
    * Achievement system: Earn badges for consistency streaks, personal records, and completing special quest lines
    * Avatar progression: Watch your character grow stronger as you do, unlocking new abilities and gear that mirror your real-world gains

    Stay motivated with gamification that makes fitness fun and addictive. Never miss a workout when you're part of a guild counting on you. Track your progress with insights that help you improve faster and avoid plateaus.

    Whether you're a gym regular looking for accountability, a gamer who wants an active hobby, or someone who finds traditional fitness apps boring, you'll discover a new way to stay motivated. From lifting weights to running to yoga, every session becomes an adventure worth completing.

    Start your quest today and discover how fun fitness can be!
    ```

    ### 4. APP CATEGORY
    - Choose the single most appropriate App Store category from: Games, Productivity, Lifestyle, Education, Health & Fitness, Business, Social Networking, Entertainment, Photo & Video, Travel, Food & Drink, Finance, News, Sports, Weather, Music, Shopping, Utilities, Medical, Reference
    - If category_hint was provided, use it as guidance but adjust if another category fits better based on the app's actual functionality
    - If no hint provided, infer from the app description and core features

    ### 5. STRUCTURED STYLE DESIGN SYSTEM
    
    **colors** object with exactly these fields:
    - **primary**: Primary brand color hex code (e.g., '#7EC8B8'). Used for buttons, CTAs, key accents.
    - **background**: Background/canvas color hex code (e.g., '#FFFFFF', '#1A1A1A').
    - **text**: Primary text color hex code (e.g., '#2C3E50', '#FFFFFF').
    - **accent**: Secondary accent color hex code (e.g., '#E8F5F2'). For cards, highlights, secondary elements.

    **typography** object with exactly these fields:
    - **headlineFont**: Font family for headlines (e.g., 'SF Pro Display', 'Inter Bold', 'Poppins')
    - **headlineSize**: Size for headlines (e.g., '28px', '32px', '24px')
    - **headlineWeight**: Weight for headlines (e.g., '700', '600', 'bold')
    - **bodyFont**: Font family for body text (e.g., 'SF Pro Text', 'Inter', 'Roboto')
    - **bodySize**: Size for body text (e.g., '16px', '14px', '15px')
    - **bodyWeight**: Weight for body text (e.g., '400', '500', 'regular')

    **effects** object with exactly these fields:
    - **cornerRadius**: Consistent border radius (e.g., '12px', '8px', '16px', '4px')
    - **shadowStyle**: Shadow CSS value (e.g., '0px 2px 8px rgba(0,0,0,0.1)', 'none', '0px 4px 12px rgba(0,0,0,0.15)')
    - **designPhilosophy**: 1-2 sentence aesthetic/mood (e.g., 'Clean minimal interface with generous whitespace for calm feel', 'Bold cyberpunk with neon accents')

    ### 6. STYLE DESCRIPTION (TEXT SUMMARY)
    - **CRITICAL: 3-5 sentence comprehensive style guide combining all design tokens above**
    - This should be a readable summary that incorporates the colors, typography, and effects
    - Include usage context for colors and philosophy
    - Examples of COMPLETE style descriptions:
      * "Clean minimal interface. Colors: Primary #7EC8B8 (CTAs, links), Background #FFFFFF, Text #2C3E50, Accent #E8F5F2 (cards, sections). Typography: Bold sans-serif headlines 28px/700 weight, body text 16px/400. Rounded corners 12px throughout, subtle shadows 0px 2px 8px rgba(0,0,0,0.1). Generous whitespace for calm, approachable feel."
      * "Bold dark interface. Colors: Primary #8B3DFF (actions, highlights), Background #0A0E27, Text #FFFFFF, Secondary #FF006E (accents, warnings). Typography: Extra bold headlines 32px/800, medium body 18px/500. Sharp corners 4px, dramatic shadows 0px 4px 16px rgba(0,0,0,0.4). High contrast and energetic vibe."
      * "Warm earthy palette. Colors: Primary #D4704A (CTAs), Background #FFF8F0, Text #3D2817, Accent #8BA888 (highlights, success). Typography: Friendly rounded headlines 26px/700, readable body 16px/400. Soft corners 16px, gentle shadows 0px 2px 12px rgba(61,40,23,0.08). Organic shapes create approachable, natural aesthetic."

    ### 7. APP ICON PROMPT
    - Text-to-image prompt for the app icon (50-100 words)
    - **CRITICAL: Keep it SIMPLE - use ONE large, bold central symbol**
    - **AVOID: Small details, thin lines, complex patterns, tiny text**
    - Format: 1024x1024 perfect square with sharp 90-degree corners (NOT rounded)
    - **ABSOLUTELY MANDATORY FULL BLEED REQUIREMENTS:**
      * Color and imagery MUST extend completely to all four edges of the square
      * NO vignetting effects (no dark/faded corners or edges)
      * NO centered composition with fade-to-black around the edges
      * NO letterboxing, NO margins, NO inner padding, NO frames, NO borders
      * NO floating sticker effects, NO artificial rounded-corner cutouts
      * Background color/gradient MUST fill corner pixels completely
      * If using gradients, they must reach all corners without fading to empty space
    - **STRICTLY forbid any words, letterforms, numbers, or store labels (e.g., 'App Store', initials). The symbol must be purely graphic.**
    - **Prompt structure should explicitly state:** "flat square artwork filling entire 1024x1024 canvas edge to edge with no empty corners"
    - Match the style's color palette and mood
    - Examples of GOOD full-bleed icon prompts:
      * "Flat square app icon artwork, 1024x1024. Large bold shield symbol centered on solid gradient background (cyan to purple) that fills entire canvas edge to edge including all corners. Sharp 90-degree corners. No rounded edges, no vignette, no faded corners. Simple bold design. Purely graphic, no text."
      * "Flat square app icon artwork, 1024x1024. Big crescent moon symbol on deep purple to magenta gradient background filling entire square from corner to corner. Sharp edges. Background extends to all four corners with full color saturation. No fade to black, no vignette. Simple and bold. Purely graphic, no text."

    ### 8. COVER IMAGE PROMPT
    - Text-to-image prompt for promotional banner (100-150 words)
    - Format: Horizontal/landscape banner (1920×1080)
    - Purpose: Promotional hero image for app store
    - **CRITICAL: ABSOLUTELY NO TEXT IN IMAGE**
      * DO NOT include any text, labels, titles, typography, letters, words, or numbers
      * Use color names (teal, violet, orange) NOT hex codes in the prompt
      * Communicate through imagery, composition, colors, shapes only
      * Command a true full-bleed composition: no letterboxing, no frames, no borders, no empty or faded margins, and no UI chrome surrounding the scene.
      * End prompt with: "No text, words, letters, numbers, or readable typography anywhere in the image."
    - Decide whether to show device mockup or pure visual metaphor based on what's more effective while keeping the scene full-bleed edge to edge
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

