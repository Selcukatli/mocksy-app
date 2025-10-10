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
  app_subtitle string @description("App Store subtitle (30 characters MAX, including spaces). A single punchy phrase that captures the app's core value. Examples: 'Fitness made fun', 'Your mindful companion', 'Track workouts, earn rewards'. CRITICAL: Must be 30 characters or less.")
  app_description string @description("App Store style description (3-5 sentences, 40-80 words). Explain what the app does, key features, and benefits. Make it compelling and professional.")
  app_category string @description("App Store category. Choose from: Games, Productivity, Lifestyle, Education, Health & Fitness, Business, Social Networking, Entertainment, Photo & Video, Travel, Food & Drink, Finance, News, Sports, Weather, Music, Shopping, Utilities, Medical, Reference. Pick the single most relevant category that matches this app's primary purpose.")
  app_icon_prompt string @description("Complete text-to-image prompt for generating app icon (50-100 words). CRITICAL: Icon must be SIMPLE with LARGE, BOLD symbols recognizable at small sizes. Avoid tiny details, thin lines, or complex patterns. Should be 1024x1024 square, iOS-style icon design matching the app concept and style aesthetic.")
  style_guide string @description("Complete visual style guide describing the UI aesthetic, color palette, mood, typography approach, and design philosophy (3-5 sentences). MUST include specific color values (hex codes or names). Example: 'Clean minimal interface with soft sage green background (#E8F2E8) and muted gold accents (#D4AF37). Generous whitespace and subtle shadows (0px 2px 8px rgba(0,0,0,0.12)). Rounded corners throughout (12-16px) for friendly, approachable feel. Typography: Bold sans-serif headlines (28px/700 weight) paired with readable body text (16px/400 weight).' Should be comprehensive enough to generate consistent screens.")
}

class ImprovedDescriptionOutput {
  improved_description string @description("Combined app name and description in a single cohesive text. Format: 'AppName: Description here.' The app name should be 1-3 catchy words followed by a colon, then a polished App Store style description (3-5 sentences, 50-90 words). Example: 'DynamicDuo: Connect and share privately with your most trusted partner. Securely exchange photos and messages, keeping your communications off the public grid. Coordinate with encrypted chats and instant sharing. Your secret HQ for two.'")
  improved_style string @description("2-3 sentence visual style guide describing the UI aesthetic, mood, typography approach, and design philosophy that matches the app concept. Example: 'Modern dark interface with purple and cyan gradients. Clean typography with bold headlines and readable body text. Rounded UI elements throughout for a friendly, approachable vibe.' Should align with the app's purpose and target audience.")
  inferred_category string @description("App Store category that best matches this app. Choose from: Games, Productivity, Lifestyle, Education, Health & Fitness, Business, Social Networking, Entertainment, Photo & Video, Travel, Food & Drink, Finance, News, Sports, Weather, Music, Shopping, Utilities, Medical, Reference. Pick the single most relevant category.")
}

class AppScreenPromptsOutput {
  app_screen_prompts string[] @description("Array of 3-10 iPhone screenshot prompts for different app screens. Each prompt follows the full-bleed edge-to-edge pattern.")
}

// ============================================
// APP STRUCTURE PLANNING (Two-Stage Generation)
// ============================================

class TabStructure {
  has_tabs bool @description("Whether this app uses bottom navigation tabs")
  tab_names string[] @description("Array of tab names in order (e.g., ['Home', 'Explore', 'Profile']). Empty if has_tabs is false.")
  tab_icon_descriptions string[] @description("Icon description for each tab (e.g., 'house outline icon', 'compass icon'). Should match tab_names length.")
  active_tab_color string @description("EXACT hex color for active tab icon and label (e.g., '#7B68EE', '#D4704A'). Must be a valid hex code.")
  inactive_tab_color string @description("EXACT hex color for inactive tab icons and labels (e.g., '#999999', '#CCCCCC'). Must be a valid hex code.")
  active_icon_style string @description("Icon style for active tab: either 'filled' or 'outline'")
  inactive_icon_style string @description("Icon style for inactive tabs: either 'filled' or 'outline' (usually opposite of active)")
  tab_styling string @description("Complete styling description including visual selection indicators, decorations, positioning, and sizing. Must include: (1) SELECTION INDICATOR: How the active tab is visually distinguished - choose ONE clear approach: bottom underline (specify thickness and position), background pill/rounded rectangle behind icon+label (specify padding and corner radius), top border accent, subtle glow/shadow effect, or background color fill. Be specific with measurements. (2) Tab bar layout: height (typically 60-80px), icon size (20-28px), label font size (10-12px), spacing between tabs. (3) Positioning: distance from bottom edge, alignment. Example: 'Active tab has rounded pill background (12px corner radius, 8px horizontal padding, 4px vertical padding) in active color at 20% opacity. Tab bar: 72px height at absolute bottom, 24px icons above 11px labels, evenly spaced with 4px gap between icon and label.' Colors are specified separately in active_tab_color and inactive_tab_color fields.")
}

class ScreenDetail {
  screen_name string @description("Name of this screen (e.g., 'Home Dashboard', 'Profile Settings')")
  purpose string @description("What this screen does in 1-2 sentences")
  layout_type string @description("Layout pattern: 'list', 'grid', 'detail', 'form', 'dashboard', etc.")
  unique_elements string @description("Specific UI elements unique to this screen (cards, buttons, images, text content, interactive components)")
  active_tab_index int? @description("Which tab is active (0-based index), null if no tabs or if screen doesn't correspond to a tab")
}

class AppStructure {
  tabs TabStructure @description("Tab navigation structure")
  common_layout_elements string @description("UI elements common across ALL screens: status bar styling, background color, header patterns, overall spacing/margins")
  screens ScreenDetail[] @description("Detailed plan for each screen (3-10 screens)")
}

class ScreenImagePrompt {
  canvas_edit_prompt string @description("Complete prompt for editing canvas image to create this screen") @assert(max_length, {{ this|length <= 4500 }})
}

// ============================================
// DEMO APP GENERATION
// ============================================

// Generate a demo app concept with name, description, category, icon prompt, and color theme
function GenerateDemoApp(
  app_description_input: string? @description("Optional user-provided app description/concept to generate from"),
  category_hint: string? @description("Optional category hint from user (e.g., 'Productivity', 'Health & Fitness'). Use this to inform the category choice, but you can adjust if another category fits better."),
  ui_style: string? @description("Optional UI style/aesthetic hint (e.g., 'Minimal & clean', 'Playful & vibrant', 'Dark mode with neon accents'). Use this to influence color palette, typography, and visual design.")
) -> DemoAppOutput {
  client ScreenshotGeneratorMed
  prompt #"
    {{ _.role("user") }}

    You are generating a demo app concept with name, description, category, icon prompt, and color theme.

    USER'S APP CONCEPT:
    {{ app_description_input }}

    {% if category_hint %}
    CATEGORY HINT: {{ category_hint }}
    (Use this to inform your category choice, but adjust if another category fits better)
    {% endif %}

    {% if ui_style %}
    UI STYLE/AESTHETIC: {{ ui_style }}
    (Use this to influence color palette, typography, and visual design)
    {% endif %}

    TASK: Create a fictional app based on this user's description. Generate a short catchy name, App Store category, professional description, icon prompt, and color theme that matches the concept.

    ## 1. APP NAME

    **IMPORTANT**: If the user's description already includes a specific app name, use that exact name. Do not change it or suggest alternatives.

    If no app name is provided, create a short, catchy app name (1-3 words max):
    - Examples: "FitQuest", "ZenJournal", "BeatFlow", "ShadowVault", "NightGuard"
    - Should match the style's mood:
      * Playful/bright styles → fun, energetic names
      * Zen/minimal styles → calm, simple names
      * Dark/cyberpunk styles → edgy, mysterious names
    - NO hyphens, NO long phrases, NO descriptions in the name

    ## 2. APP SUBTITLE

    Create an App Store subtitle (30 characters MAX):
    - **CRITICAL: Must be 30 characters or less, including spaces**
    - A single punchy phrase capturing the app's core value
    - Examples (all ≤30 chars):
      * "Fitness made fun" (18 chars)
      * "Your mindful companion" (23 chars)
      * "Track workouts, earn rewards" (29 chars)
      * "Gamify your fitness journey" (28 chars)
      * "Find calm in chaos" (18 chars)
    - Be concise and impactful
    - Avoid articles ("a", "the") to save space
    - Should complement the app name, not repeat it

    ## 3. APP CATEGORY

    Choose the most appropriate App Store category from this list:
    - **Games** - Gaming apps of all types
    - **Productivity** - Task management, notes, calendars, organization tools
    - **Lifestyle** - General lifestyle, hobbies, interests
    - **Education** - Learning, courses, study tools
    - **Health & Fitness** - Wellness, workouts, meditation, health tracking
    - **Business** - Professional tools, team collaboration, enterprise
    - **Social Networking** - Communication, social media, messaging
    - **Entertainment** - Media consumption, fun content
    - **Photo & Video** - Camera, editing, creative tools
    - **Travel** - Maps, booking, trip planning
    - **Food & Drink** - Recipes, restaurants, cooking
    - **Finance** - Banking, budgeting, investing, payments
    - **News** - News aggregation, journalism
    - **Sports** - Sports tracking, scores, fan engagement
    - **Weather** - Weather forecasts and tracking
    - **Music** - Music streaming, creation, discovery
    - **Shopping** - E-commerce, retail
    - **Utilities** - System tools, widgets, extensions
    - **Medical** - Healthcare, medical tools (professional)
    - **Reference** - Dictionaries, encyclopedias, information lookup

    Pick ONE category that best matches the app's PRIMARY purpose.
    {% if category_hint %}Consider the user's hint: {{ category_hint }}{% endif %}

    ## 4. APP DESCRIPTION

    Write an App Store style description (3-5 sentences, 40-80 words):
    - Explain what the app does and its core purpose
    - List 2-3 key features or benefits
    - Make it sound exciting and professional
    - Match the style's mood and target audience
    - Example: "Transform your fitness journey into an epic adventure. FitQuest gamifies your workouts with challenges, achievements, and rewards. Track your progress, compete with friends, and unlock new levels as you get stronger. Perfect for anyone who wants to stay motivated and make exercise fun."

    ## 5. APP ICON PROMPT

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

    ## 6. COLOR THEME

    Define a color palette/theme for the app UI that will be used to generate consistent app screens:
    - Be specific about colors (e.g., "dark purple and electric cyan", "warm beige and sage green")
    - Should match the icon's color palette
    - Should complement the style's aesthetic if a style is provided
    - {% if ui_style %}Match the vibe: {{ ui_style }}{% endif %}
    - Include 2-4 specific colors that work well together
    - Examples:
      * "Dark purple gradient with electric cyan accents"
      * "Soft blue-green with white and pale yellow highlights"
      * "Bright vibrant yellow with hot pink and cyan accents"

    ## 7. STYLE GUIDE

    Write a 2-3 sentence visual style guide describing the UI aesthetic:
    - Cover: UI mood/aesthetic, typography approach, and overall design philosophy
    - Should align with the color theme and app concept
    - {% if ui_style %}Match the vibe: {{ ui_style }}{% endif %}
    - Examples:
      * "Clean minimal interface with generous whitespace and soft shadows. Uses rounded corners throughout for friendly, approachable feel. Typography: Bold sans-serif headlines paired with readable body text."
      * "Energetic interface with vibrant gradients and bold gamification elements. Dynamic typography with strong headlines and clear stats. Rounded corners and playful animations create an engaging experience."
      * "Serene minimal design with generous whitespace. Elegant serif headings paired with clean sans-serif body text. Subtle animations and organic shapes evoke calm and mindfulness."

    ## MATCHING GUIDELINES:
    - App concept should feel natural with the style's personality
    - Category should accurately reflect the app's primary purpose
    - Icon colors should match the color theme
    - Icon mood should match style energy (calm vs energetic, playful vs serious, etc.)
    - Color theme should be cohesive with the overall style aesthetic
    - Style guide should align with color theme and app purpose
    - {% if ui_style %}Visual style/vibe should be reflected in colors, icon, and style guide: {{ ui_style }}{% endif %}
    - All outputs (name, category, description, icon, color theme, style guide) should work together harmoniously

    {{ ctx.output_format }}
  "#
}

function ImproveAppDescription(
  draft_description: string @description("Rough or placeholder description that needs to sound polished and App Store ready"),
  vibe_hint: string? @description("Optional tone, vibe, or audience notes to weave into the copy")
) -> ImprovedDescriptionOutput {
  client Gemini25Flash
  prompt #"
    {{ _.role("system") }}
    You are a marketing copywriter who specializes in App Store product descriptions that are clear, benefit-driven, and polished.

    **CRITICAL APP STORE FORMAT REQUIREMENTS:**
    - First sentence: Hook with the main value proposition (what the app does and why it matters)
    - Middle 2-3 sentences: Key features and benefits (specific, tangible)
    - Final sentence: Call-to-action or emotional closer
    - Length: 3-5 sentences, 50-90 words total
    - Tone: Professional but approachable, exciting but trustworthy
    - Avoid: Repetition, buzzword overload, vague claims, excessive punctuation

    **APP STORE DESCRIPTION EXAMPLES:**
    - "Transform your fitness journey into an epic adventure. Track workouts, earn achievements, and compete with friends through gamified challenges. Stay motivated with smart reminders and personalized goals. Your path to a stronger, healthier you starts here."
    - "Find calm in the chaos with guided meditation sessions designed for busy professionals. Choose from 5-minute mindfulness breaks, breathing exercises, and ambient soundscapes. Build a consistent practice with gentle reminders and progress tracking. Peace of mind, just a tap away."

    {{ _.role("user") }}
    DRAFT DESCRIPTION:
    {{ draft_description }}

    {% if vibe_hint %}
    TONE / VIBE TO REFLECT: {{ vibe_hint }}
    {% endif %}

    **YOUR TASK:**
    Return THREE outputs:
    1. improved_description: The app name + polished description
    2. improved_style: A visual style guide that matches the app
    3. inferred_category: The most appropriate App Store category

    **improved_description Format:** `AppName: Description sentence 1. Description sentence 2. Description sentence 3. [Optional sentence 4-5.]`

    **improved_description Requirements:**
    1. Start with a catchy app name (1-3 words) followed by a colon
       - If input is rough concept like "photo sharing app between batman and robin" → Create catchy name (e.g., "DynamicDuo", "Gotham Link")
       - If input mentions an app name → Extract and refine it
    2. After the colon, write the polished App Store description (3-5 sentences, 50-90 words)
    3. Match the requested tone/vibe if provided

    **improved_style Requirements:**
    1. Write 2-3 sentences describing the visual design approach
    2. Cover: UI mood/aesthetic, color palette hints, typography style, and overall design philosophy
    3. Should feel cohesive with the app's purpose and target audience
    4. Match the tone/vibe if provided

    **inferred_category Requirements:**
    1. Choose the SINGLE most relevant App Store category from this list:
       - Games, Productivity, Lifestyle, Education, Health & Fitness, Business, Social Networking, Entertainment, Photo & Video, Travel, Food & Drink, Finance, News, Sports, Weather, Music, Shopping, Utilities, Medical, Reference
    2. Base your choice on the app's PRIMARY purpose and functionality
    3. Return ONLY the category name (e.g., "Health & Fitness", not "the category is Health & Fitness")

    **Examples:**

    improved_description: "FitQuest: Transform your fitness journey into an epic adventure. Track workouts, earn achievements, and compete with friends through gamified challenges. Stay motivated with smart reminders and personalized goals. Your path to a stronger, healthier you starts here."
    improved_style: "Energetic interface with vibrant gradients (purple to cyan) and bold gamification elements. Dynamic typography with strong headlines and clear stats. Rounded corners and playful animations create an engaging, motivating experience."
    inferred_category: "Health & Fitness"

    improved_description: "Mindful Minutes: Discover tranquility amidst your busy schedule with guided meditations crafted for real life. Access quick sessions from 3 to 15 minutes, perfect for commutes or breaks. Build consistent practice with calming sounds and mood tracking. Reclaim your focus and peace, one minute at a time."
    improved_style: "Serene minimal design with soft blue-green palette and generous whitespace. Elegant serif headings paired with clean sans-serif body text. Subtle animations and organic shapes evoke calm and mindfulness."
    inferred_category: "Health & Fitness"

    {{ ctx.output_format }}
  "#
}

// ============================================
// APP DESIGN PLANNING
// ============================================

// Generate app design plan (tabs, layout, screen details) - NO image generation
function GenerateAppDesignPlan(
  app_name: string @description("Name of the app"),
  app_description: string @description("Description of what the app does"),
  app_category: string @description("App Store category (e.g., 'Games', 'Productivity', 'Social Networking'). Used to determine appropriate screen types."),
  style_guide: string @description("Complete visual style guide including colors, typography, mood, and design philosophy"),
  num_screens: int @description("Number of screens to plan (3-10)")
) -> AppStructure {
  client ScreenshotGeneratorMed
  prompt #"
    {{ _.role("user") }}

    You are creating a structural blueprint for an iPhone app. This plan will guide image generation, so be specific and detailed.

    **APP DETAILS:**
    - Name: {{ app_name }}
    - Category: {{ app_category }}
    - Description: {{ app_description }}
    - Style Guide: {{ style_guide }}
    - Number of screens: {{ num_screens }}

    **YOUR TASK:**
    Create a comprehensive app structure plan that defines:
    1. Navigation pattern (tabs or no tabs)
    2. Common layout elements across all screens
    3. Detailed plan for each of the {{ num_screens }} screens

    **CRITICAL REQUIREMENTS:**

    ## 1. TAB NAVIGATION ANALYSIS

    Determine if this app should use bottom navigation tabs:
    - **Use tabs if:** App has 3-5 distinct sections users switch between frequently (e.g., social apps, e-commerce, content platforms)
    - **No tabs if:** Single-purpose utility, linear workflows, games, or simple tools

    If using tabs:
    - Choose 3-5 clear tab names (e.g., "Home", "Explore", "Messages", "Profile")
    - Describe each tab's icon (outline style, 24px size)
    - **CRITICAL: Extract EXACT colors as hex codes:**
      * **active_tab_color**: EXACT hex code for active tab icon and label (e.g., '#7B68EE', '#D4704A', '#FF6B6B'). Extract from style_guide colors.
      * **inactive_tab_color**: EXACT hex code for inactive tabs (e.g., '#999999', '#CCCCCC', '#888888'). Usually a muted gray.
      * **active_icon_style**: Either "filled" or "outline" - which looks better for the active tab?
      * **inactive_icon_style**: Either "filled" or "outline" - usually opposite of active (if active is filled, inactive is outline)
    - **CRITICAL: Define tab_styling (decorations and positioning):**
      * **SELECTION INDICATOR** - Pick ONE clear visual indicator for the active tab:
        - Bottom underline: Specify thickness (2-3px) and positioning ("2px bottom underline centered under icon+label")
        - Background pill: Specify corner radius and padding ("rounded pill with 12px corners, 8px horizontal padding, 4px vertical padding")
        - Top border accent: Specify thickness and position ("3px top border accent")
        - Glow/shadow: Specify blur and spread ("soft glow with 4px blur, 2px spread")
        - Background fill: Specify coverage ("full tab area background fill at 15% opacity")
      * Specify exact measurements for the selection indicator
      * Specify tab bar layout: height (typically 60-80px), icon size (20-28px), label font size (10-12px), icon-to-label spacing (2-4px), tab spacing
      * **Example**: "Active tab has rounded pill background (12px corner radius, 8px horizontal padding, 4px vertical padding) in active color at 20% opacity. Tab bar: 72px height at absolute bottom, 24px icons above 11px labels, evenly spaced with 4px gap between icon and label."
      * Note: Colors are specified separately in active_tab_color and inactive_tab_color
    - Call out safe area behavior: tab bar hugs absolute bottom edge, but interactive content stays above it with at least 24px spacing

    ## 2. COMMON LAYOUT ELEMENTS

    Define elements that appear on EVERY screen:

    **CRITICAL - FULL BLEED REQUIREMENT:**
    - ALL screens MUST be full-bleed (edge-to-edge) with NO white margins or borders
    - Background fills from coordinates (0, 0) to (full canvas width, full canvas height)
    - Status bar starts at y=0 (absolute top edge, no gap above)
    - Tab bar (if exists) ends at y=canvas_height (absolute bottom edge, no gap below)
    - Content can extend to all four edges of the screen

    **Common elements to define:**
    - **Status bar:** ALWAYS at absolute top edge (y=0, no gap above). Styling: text color (light/dark based on background), icons (battery, signal, time)
    - **Background color:** Main background color from style_guide that fills ENTIRE screen edge-to-edge
    - **Content start position:** Where main content begins (immediately below status bar, around 44-60px from top)
    - **Header patterns:** If any common headers appear across screens (style, positioning)
    - **Overall spacing:** Internal padding for content (NOT edge margins - backgrounds fill to edges)
    - **Safe area guidance:** Define where scrollable content ends and safe area begins. When tabs exist: all interactive content (CTAs, buttons, cards) must end at least 24-32px ABOVE the tab bar. Floating action buttons should be positioned in this safe area zone (e.g., "bottom: 96px" for 72px tab bar + 24px spacing). When no tabs: maintain 24-32px from bottom edge for home indicator.
    - **Any persistent UI elements:** Elements that appear on all screens

    ## 3. SCREEN DETAILS

    For each of the {{ num_screens }} screens, define:

    **screen_name:** Descriptive name (e.g., "Home Dashboard", "Video Chat", "Settings")

    **purpose:** What this screen accomplishes in 1-2 sentences

    **layout_type:** Choose from:

    GENERAL (all apps):
    - "dashboard" - Stats, cards, summaries, overview
    - "list" - Scrollable list of items (messages, products, articles)
    - "grid" - Grid of images/cards (photos, products, media)
    - "detail" - Single item detail view (profile, article, product page)
    - "form" - Input fields, settings, creation flows
    - "media" - Large media display (video, photo viewer)
    - "chat" - Messaging interface
    - "map" - Location-based interface

    GAMES ONLY (use these for Games category):
    - "gameplay" - Main game action screen showing actual gameplay (player view, HUD, interactive scene, game environment)
    - "level" - Level/mission selection or progress screen
    - "inventory" - Character equipment, items, upgrades, gear
    - "dialogue" - Story scenes, character conversations, narrative moments

    **unique_elements:** Specific UI components for THIS screen:
    - Headers, titles, labels (with text examples)
    - Buttons and CTAs (what they say, where positioned)
    - Cards, lists, grids (what content they contain)
    - Input fields (what data they collect)
    - Images, icons, illustrations (what they depict)
    - Stats, progress bars, graphs (what metrics)
    - **CRITICAL: Use REALISTIC placeholder content, NOT bracketed placeholders:**
      * ✅ GOOD: "Username: Sarah Chen", "Post title: My Morning Routine", "Score: 1,250 points", "Profile photo: woman with glasses"
      * ❌ BAD: "[Username]", "[Post Title]", "[User Photo]", "[Image #1]", "[Score]"
      * Generate believable names, titles, numbers, descriptions
    - Be concrete and specific!

    **active_tab_index:** If using tabs, which tab (0-based index) is active on this screen? If screen doesn't map to a tab or no tabs exist, use null.

    **SCREEN VARIETY:**

    **CRITICAL - Category-Specific Screen Types:**

    {% if app_category == "Games" %}
    **THIS IS A GAME (Category: {{ app_category }}):**
    Focus on GAMEPLAY screens, NOT menu screens. Players want to see the actual game experience.

    For {{ num_screens }} screens, breakdown:
    - **{{ num_screens - 1 }} screens: GAMEPLAY-FOCUSED**
      * Use layout_type: "gameplay", "level", "inventory", "dialogue"
      * Examples: "Desert Highway Chase", "Bar Fight Scene", "Character Inventory", "Boss Battle", "Story Dialogue with Villain"
      * Show actual game environments, characters, action, HUD elements
    - **Maximum 1 screen: Menu/UI screen**
      * Only if needed: main menu, settings, or pause screen
      * Use layout_type: "dashboard" or "form"

    ❌ **AVOID for games:**
    - Multiple settings/preferences screens
    - Save game screens
    - Credits screens
    - "Quit to title" screens
    - Loading screens

    ✅ **SHOW for games:**
    - Different game locations/levels
    - Character interactions
    - Combat/action scenes
    - Puzzle/challenge screens
    - Inventory/equipment management
    - Story/narrative moments

    {% else %}
    **THIS IS A REGULAR APP (Category: {{ app_category }}):**
    - Include diverse screen types (mix of dashboard, list, detail, form)
    - Each screen should serve a distinct purpose
    - Cover main user flows of the app
    - For {{ num_screens }} screens, typical breakdown:
      * 1-2 landing/home screens
      * 2-3 feature screens (core functionality)
      * 1 profile/account screen
      * 1 settings/preferences screen
    {% endif %}

    {{ ctx.output_format }}
  "#
}

// ============================================
// IMAGE PROMPT GENERATION
// ============================================

// Generate image prompt for the FIRST screen (establishes visual style foundation)
function GenerateFirstScreenImagePrompt(
  app_name: string @description("Name of the app"),
  style_guide: string @description("Complete visual style guide including colors, typography, mood"),
  common_layout: string @description("Common layout elements from AppStructure"),
  tabs: TabStructure @description("Tab structure from AppStructure"),
  screen_detail: ScreenDetail @description("Details for this specific screen")
) -> ScreenImagePrompt {
  client ScreenshotGeneratorMed
  prompt #"
    {{ _.role("user") }}

    Generate a canvas-editing prompt for Gemini Flash to create the FIRST iPhone app screen.
    This screen establishes the visual style foundation for all subsequent screens.

    **APP CONTEXT:**
    - App Name: {{ app_name }}
    - Style Guide: {{ style_guide }}

    **COMMON LAYOUT (applies to all screens):**
    {{ common_layout }}

    **TAB NAVIGATION:**
    {% if tabs.has_tabs %}
    This app uses bottom navigation with {{ tabs.tab_names | length }} tabs:
    {% for tab_name in tabs.tab_names %}
    - Tab {{ loop.index0 }}: "{{ tab_name }}" ({{ tabs.tab_icon_descriptions[loop.index0] }})
    {% endfor %}

    **TAB STYLING (USE EXACT HEX CODES):**
    - Active tab color: {{ tabs.active_tab_color }} (icon + label)
    - Inactive tab color: {{ tabs.inactive_tab_color }} (icon + label)
    - Active icon style: {{ tabs.active_icon_style }}
    - Inactive icon style: {{ tabs.inactive_icon_style }}
    - Decorations: {{ tabs.tab_styling }}

    **NO inventing colors. Use {{ tabs.active_tab_color }} for active, {{ tabs.inactive_tab_color }} for inactive.**
    {% else %}
    This app does not use bottom navigation tabs.
    {% endif %}

    **THIS SCREEN:**
    - Name: {{ screen_detail.screen_name }}
    - Purpose: {{ screen_detail.purpose }}
    - Layout Type: {{ screen_detail.layout_type }}
    - Unique Elements: {{ screen_detail.unique_elements }}
    {% if screen_detail.active_tab_index is defined and screen_detail.active_tab_index is not none %}
    - Active Tab: {{ tabs.tab_names[screen_detail.active_tab_index] }} (index {{ screen_detail.active_tab_index }})
    {% endif %}

    **IMAGE EDITING INSTRUCTIONS:**
    You will receive ONE image:
    - **Canvas image**: Blank iPhone-sized canvas to paint on

    Paint the app UI directly onto this canvas.

    **CRITICAL FULL-BLEED REQUIREMENTS:**
    - Background fills entire canvas edge-to-edge. NO white borders around edges.
    - Status bar at top edge (y=0)
    {% if tabs.has_tabs %}- Tab bar at bottom edge{% endif %}
    - Paint OVER entire canvas. IGNORE any device frame you see. Fill EVERY pixel.

    **GENERATE THE PROMPT:**

    **CRITICAL: Output MUST be under 4000 characters. Use extreme brevity.**

    Create a concise canvas-editing prompt:
    1. Start: "EDIT TASK: Paint DIRECTLY ONTO entire canvas image. CRITICAL: Fill EVERY pixel edge-to-edge from top-left corner to bottom-right corner. NO margins, NO white space, NO borders around edges. Paint over entire canvas area."
    2. Screen: "{{ screen_detail.screen_name }}"
    3. **BACKGROUND**: Extract bg color from common_layout. Fill entire canvas edge-to-edge with this color.
    4. **STATUS BAR** (y=0, top edge): Time left, wifi/battery/icons right, styling from common_layout
    {% if tabs.has_tabs %}
    5. **TAB BAR** (bottom of canvas, 72px height): {{ tabs.tab_names | join(', ') }}. {{ tabs.tab_styling }}
    {% if screen_detail.active_tab_index is defined and screen_detail.active_tab_index is not none %}
    - Active: "{{ tabs.tab_names[screen_detail.active_tab_index] }}" - {{ tabs.active_icon_style }} icon + label {{ tabs.active_tab_color }}
    - Inactive: {{ tabs.inactive_icon_style }} icon + label {{ tabs.inactive_tab_color }}
    {% else %}
    - Active: "{{ tabs.tab_names[0] }}" - {{ tabs.active_icon_style }} icon + label {{ tabs.active_tab_color }}
    - Inactive: {{ tabs.inactive_icon_style }} icon + label {{ tabs.inactive_tab_color }}
    {% endif %}
    6. **CONTENT**: {{ screen_detail.unique_elements }}. All buttons/interactive elements must end at least 96px above tab bar.
    {% else %}
    5. **CONTENT**: {{ screen_detail.unique_elements }}. Buttons/CTAs near bottom should leave ~32px margin from bottom edge.
    {% endif %}
    7. Colors: Use hex from style_guide

    **BREVITY RULES:**
    - Use abbreviations: "y=" not "y-coordinate", "bg", "px"
    - Combine related info
    - Target 2500-3500 chars MAX

    **MUST INCLUDE:**
    - Paint entire canvas edge-to-edge. ZERO margins. Fill EVERY pixel to all 4 edges.
    - Status bar at top edge{% if tabs.has_tabs %}, tab bar at bottom edge{% endif %}
    {% if tabs.has_tabs %}- All buttons/CTAs at least 96px above tab bar{% endif %}
    - Background color fills entire canvas corner to corner
    - If you see white space or device frame, paint OVER it completely

    {{ ctx.output_format }}
  "#
}

// Generate image prompt for screens 2+ WITH reference image (maintains visual consistency)
function GenerateScreenImagePromptWithReference(
  app_name: string @description("Name of the app"),
  style_guide: string @description("Complete visual style guide including colors, typography, mood"),
  common_layout: string @description("Common layout elements from AppStructure"),
  tabs: TabStructure @description("Tab structure from AppStructure"),
  screen_detail: ScreenDetail @description("Details for this specific screen")
) -> ScreenImagePrompt {
  client ScreenshotGeneratorMed
  prompt #"
    {{ _.role("user") }}

    Generate a canvas-editing prompt for Gemini Flash. This screen MUST match the reference image's visual style.

    **APP CONTEXT:**
    - App Name: {{ app_name }}
    - Style Guide: {{ style_guide }}

    **COMMON LAYOUT:**
    {{ common_layout }}

    **TAB NAVIGATION:**
    {% if tabs.has_tabs %}
    Tabs: {% for tab_name in tabs.tab_names %}"{{ tab_name }}"{% if not loop.last %}, {% endif %}{% endfor %}

    **TAB COLORS (EXACT):**
    - Active: {{ tabs.active_tab_color }} ({{ tabs.active_icon_style }} icon + label)
    - Inactive: {{ tabs.inactive_tab_color }} ({{ tabs.inactive_icon_style }} icon + label)
    - Decorations: {{ tabs.tab_styling }}
    {% else %}
    No tabs.
    {% endif %}

    **THIS SCREEN:**
    - Name: {{ screen_detail.screen_name }}
    - Layout: {{ screen_detail.layout_type }}
    - Elements: {{ screen_detail.unique_elements }}
    {% if screen_detail.active_tab_index is defined and screen_detail.active_tab_index is not none %}
    - Active Tab: "{{ tabs.tab_names[screen_detail.active_tab_index] }}" (index {{ screen_detail.active_tab_index }})
    {% endif %}

    **IMAGE EDITING:**
    TWO images provided:
    1. Reference image (image 1) - match this visual style EXACTLY
    2. Blank canvas (image 2) - paint on this

    **MATCH REFERENCE:**
    - Copy EXACT colors, fonts, shadows, spacing, corner radius from reference (image 1)
    - Status bar positioning and background fill - no gap at top
    - Paint on blank canvas (image 2) using reference (image 1) as style guide

    {% if tabs.has_tabs and screen_detail.active_tab_index is defined and screen_detail.active_tab_index is not none %}
    **TAB ADAPTATION (CRITICAL):**
    Reference shows different active tab. For THIS screen:
    - Active "{{ tabs.tab_names[screen_detail.active_tab_index] }}": {{ tabs.active_icon_style }} icon + label in {{ tabs.active_tab_color }}
    - Inactive (all others): {{ tabs.inactive_icon_style }} icon + label in {{ tabs.inactive_tab_color }}

    Match reference decorations (underline/glow/pill), but use EXACT colors above. NO color copying from reference.
    {% endif %}

    Only change: screen-specific content for "{{ screen_detail.screen_name }}".

    **FULL-BLEED:**
    - Paint entire canvas edge-to-edge. NO white borders around edges.
    - Status bar at top edge{% if tabs.has_tabs %}, tab bar at bottom edge{% endif %}
    - Paint OVER entire canvas. IGNORE device frame. Fill EVERY pixel.

    **GENERATE PROMPT:**

    **CRITICAL: Under 4000 chars. Extreme brevity.**

    1. Start: "EDIT TASK: Paint on blank canvas (image 2). Match reference (image 1) style EXACTLY. Fill EVERY pixel edge-to-edge from corner to corner. NO margins, NO white space."
    2. Screen: "{{ screen_detail.screen_name }}"
    3. **BG**: Match reference gradient/color exactly. Fill entire canvas edge-to-edge.
    4. **STATUS BAR** (top edge): Match reference positioning exactly
    {% if tabs.has_tabs %}
    5. **TAB BAR UPDATE (CRITICAL - bottom edge, 72px)**: Look at reference (image 1) tab bar. Copy its EXACT visual style (layout, spacing, icons, decorations). ONLY change: deselect previously active tab, activate "{{ tabs.tab_names[screen_detail.active_tab_index] if screen_detail.active_tab_index is defined and screen_detail.active_tab_index is not none else tabs.tab_names[0] }}" tab.
    - Active "{{ tabs.tab_names[screen_detail.active_tab_index] if screen_detail.active_tab_index is defined and screen_detail.active_tab_index is not none else tabs.tab_names[0] }}": {{ tabs.active_icon_style }} icon + {{ tabs.active_tab_color }} label + decoration (pill/underline/etc from reference)
    - All other tabs: {{ tabs.inactive_icon_style }} icon + {{ tabs.inactive_tab_color }} label, no decoration
    - Tab order: {{ tabs.tab_names | join(', ') }}. Keep EXACT positioning, sizing, spacing from reference.
    6. **CONTENT**: {{ screen_detail.unique_elements }}. All buttons/CTAs at least 96px above tab bar.
    {% else %}
    5. **CONTENT**: {{ screen_detail.unique_elements }}. Buttons/CTAs near bottom leave ~32px margin from bottom edge.
    {% endif %}
    7. Match reference: colors, fonts, shadows, spacing, corner radii

    **BREVITY:**
    - Abbreviations: y=, bg, px
    - Combine info
    - 2500-3500 chars

    **MUST INCLUDE:**
    - Match reference (image 1). Paint on canvas (image 2). Fill EVERY pixel edge-to-edge to all 4 corners. ZERO white space.
    - Background fills entire canvas corner to corner
    {% if tabs.has_tabs %}- Tab bar: Copy reference tab bar exactly. ONLY update active tab indicator from reference tab to "{{ tabs.tab_names[screen_detail.active_tab_index] if screen_detail.active_tab_index is defined and screen_detail.active_tab_index is not none else tabs.tab_names[0] }}" ({{ tabs.active_tab_color }}){% endif %}
    - Status bar at top edge{% if tabs.has_tabs %}, tabs at bottom edge{% endif %}

    {{ ctx.output_format }}
  "#
}

// ============================================
// COVER IMAGE GENERATION
// ============================================

class CoverImagePrompt {
  image_prompt string @description("Complete text-to-image prompt for generating a promotional cover image (100-150 words). Should capture the app's essence, visual style, and key features in a single compelling hero image.")
  style_notes string @description("Visual style guidance: composition, color palette, mood, and design approach for the cover image")
}

function GenerateAppCoverImagePrompt(
  app_name: string @description("Name of the app"),
  app_description: string @description("App description and subtitle"),
  app_category: string? @description("App Store category"),
  style_guide: string? @description("Visual style guide if available"),
  screen_names: string[] @description("Names of the app screens (e.g., 'Home Dashboard', 'Profile Settings', 'Chat View'). These names are often descriptive of the screen's purpose."),
  user_feedback: string? @description("Optional user guidance or feedback for the cover image generation (e.g., 'focus on gameplay', 'show the social features', 'make it minimal')")
) -> CoverImagePrompt {
  client ScreenshotGeneratorMed
  prompt #"
    {{ _.role("user") }}
    
    You are creating a text-to-image prompt for a promotional COVER IMAGE for an app.
    This is like the hero/banner images you see in app stores - NOT the app icon.
    
    **APP DETAILS:**
    - Name: {{ app_name }}
    - Description: {{ app_description }}
    {% if app_category %}- Category: {{ app_category }}{% endif %}
    {% if style_guide %}- Style Guide: {{ style_guide }}{% endif %}
    
    **APP SCREENS:**
    The app has the following screens:
    {% for screen_name in screen_names %}
    - {{ screen_name }}
    {% endfor %}
    
    {% if user_feedback %}
    **USER GUIDANCE:**
    {{ user_feedback }}
    (Consider this feedback when deciding on composition, device mockup usage, visual elements, and overall approach)
    {% endif %}
    
    **COVER IMAGE REQUIREMENTS:**
    
    1. **Format:** Horizontal/landscape banner (works well at 1920×1080 or similar)
    2. **Purpose:** Promotional hero image for app store listings - eye-catching, professional
    3. **Content:** Should showcase the app's personality and key features visually
    4. **NOT an icon:** This is a large promotional banner, not a small icon
    5. **Device mockups:** Use a smartphone mockup ONLY if it genuinely helps demonstrate the app's UI or functionality. For abstract concepts, lifestyle imagery, or conceptual apps, consider pure visual storytelling without devices.
    
    **CRITICAL: ABSOLUTELY NO TEXT IN IMAGE**
    - DO NOT include any text, labels, titles, typography, letters, words, or numbers in the image prompt
    - NO app name overlays, NO screen labels, NO UI text mockups, NO readable text of any kind
    - NO hex codes or color values (use "bright teal" instead of hex codes)
    - NO UI elements with visible text (buttons with text, labels, captions, etc.)
    - The cover image should be purely visual - no readable text, codes, or typography whatsoever
    - Communicate the app through imagery, composition, colors, shapes, and visual elements only
    - Use color names (teal, violet, orange) NOT hex codes in the prompt
    - When describing device mockups, specify "no visible text on screen" or "abstract UI elements without text"
    
    **DECISION FRAMEWORK - Use device mockup when:**
    - The app's UI is a key selling point (design tools, games, productivity apps with unique interfaces)
    - Showing specific screens helps explain functionality (multi-screen flows, unique interactions)
    - The app category is UI-focused (Photo & Video, Productivity, Games with visible UI)
    
    **Skip device mockup when:**
    - Abstract concept is more powerful (meditation, wellness, simple utilities)
    - Lifestyle imagery better conveys the benefit (fitness outcomes, travel experiences, social connection)
    - The app is more about outcomes than interface (habits, tracking, minimal tools)
    - Pure visual metaphor tells the story better
    
    **PROMPT STRUCTURE:**
    
    Your image_prompt should describe:
    - Main visual concept (what's the hero image showing?)
    - Composition (layout, perspective, focal points)
    - Color scheme (should align with style_guide if provided)
    - Mood and atmosphere
    - Key visual elements that represent the app's functionality
    - Style (modern UI mockup, lifestyle shot, abstract concept, etc.)
    - **NO TEXT** - purely visual storytelling
    
    **EXAMPLES OF GOOD PROMPTS (showing variety):**
    
    WITH device mockup (when it demonstrates the UI):
    "Modern fitness app promotional banner. Dynamic composition with vibrant gradient background (purple to cyan). Central phone mockup showing colorful workout interface with abstract stats and progress rings—no readable text or numbers on screen. Energetic diagonal layout with floating UI elements (achievement badges, graph lines, heart rate icons) around the phone. Depth and dimension with subtle shadows. Professional product photography style. Clean, motivational, high-energy aesthetic. Purely visual composition with no text overlays, labels, or readable typography anywhere. 1920x1080."
    
    WITHOUT device (when concept is more powerful abstractly):
    "Serene meditation cover image. Abstract breathing visualization with expanding concentric circles pulsing from center. Soft blue-green gradient background with organic flowing waves and particles. Floating abstract elements: gentle ripples, soft orbs, calming geometric patterns in muted pastels (sage green, warm beige, soft blue). Generous whitespace. Dreamy, tranquil atmosphere with subtle glow effects. Minimal, zen aesthetic. Pure visual metaphor for mindfulness. Horizontal banner format. No text, numbers, letters, or typography of any kind."
    
    WITH device mockup (showcasing social features):
    "Vibrant social networking app banner. Bright gradient background (yellow to pink). Angled phone mockup showing colorful chat interface with abstract message bubbles—no visible text in the UI mockup. Floating emoji reactions, notification bubbles, and message icons creating depth around the device. Playful, energetic composition. Modern, fun, connected vibe. Bold colors and rounded UI elements. Product shot style. Pure visual composition without text overlays, readable words, or typography. 1920x1080."
    
    WITHOUT device (lifestyle/conceptual):
    "Travel adventure app cover. Sweeping landscape with abstract location pins and route lines overlaid on mountain vista. Warm sunset gradient (orange to deep purple). Flowing path lines connecting floating compass icons, map markers, and destination badges. Sense of journey and exploration. Inspiring, wanderlust atmosphere. Dynamic composition suggesting movement and discovery. Clean, adventurous aesthetic without device mockup. No text, labels, or readable typography. 1920x1080."
    
    **YOUR TASK:**
    Generate image_prompt (100-150 words) and style_notes (2-3 sentences) for {{ app_name }}.
    
    **CRITICAL REMINDER - REPEAT THESE IN YOUR OUTPUT:**
    - DO NOT include text, titles, labels, numbers, letters, words, or any readable typography in the image prompt
    - DO NOT include hex codes or color values (use "bright teal" not hex codes)
    - Reference visual scenes and elements, but don't ask for text labels on them
    - The image should communicate purely through visuals, colors, shapes, and composition
    - Colors should be described as names/adjectives: "vibrant teal", "deep violet", "bright orange"
    - END YOUR PROMPT with explicit instruction: "No text, words, letters, numbers, or readable typography anywhere in the image."
    
    {{ ctx.output_format }}
  "#
}


// ============================================
// DEMO APP TEST CASES
// ============================================

test DemoFromDescription {
  functions [GenerateDemoApp]
  args {
    app_description_input "A meditation and mindfulness app for busy professionals. Helps users find calm moments throughout their day with 5-minute guided sessions, breathing exercises, and ambient soundscapes."
    style_config null
    style_name null
  }
}

test ImproveDescriptionFromDraft {
  functions [ImproveAppDescription]
  args {
    draft_description "This app helps you track workouts and offers some motivation features. It has reminders, a few templates, and a social feed, but the copy feels flat."
    vibe_hint "Energetic fitness mentor"
  }
}

test BatSignalAppDesignPlan {
  functions [GenerateAppDesignPlan]
  args {
    app_name "BatSignal"
    app_description "Emergency Batman summoning app. Fire the iconic bat signal into the Gotham sky with a tap. Track Batman's response time and view your signal history."
    app_category "Utilities"
    style_guide "Dark noir aesthetic with deep blacks (#0A0A0A) and bright yellow accents (#FFD700) for the bat signal glow. Dramatic shadows and bold typography. Status bar in light color for dark background. Glowing effects on interactive elements."
    num_screens 5
  }
}

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
      background_color "soft sage green solid color (#E8F2E8)"
      details "Minimalist zen aesthetic with subtle organic elements. 3-4 small earthy white (#F5F1E8) circular shapes (30-50px), 2-3 warm cream (#F5E6D3) abstract leaf silhouettes (40-60px). Simple muted gold (#D4AF37) line accents (2-3px thick, 60-100px long, 2-3 lines). All elements scattered lightly in outer edges, emphasizing negative space and calm."
      text_style "Clean sans-serif font (Poppins or Inter style), 700 weight, earthy white color (#F5F1E8) with subtle drop shadow (0px 1px 2px rgba(0,0,0,0.08))"
      device_style "Warm natural wood finish frame (light oak or bamboo texture) with matte surface and subtle grain texture"
    }
    style_name "Zen Minimal"
  }
}

test PlayfulPopArtDemoApp {
  functions [GenerateDemoApp]
  args {
    app_description_input null
    style_config {
      background_color "bright yellow solid color (#FFD60A)"
      details "Playful pop art style with vibrant emoji-like decorations. 4-5 large colorful emojis (😊🎉⭐❤️, 80-120px). 3-4 bold geometric shapes: cyan circles, magenta triangles, orange stars (60-100px). 5-6 thick black comic-style lines/lightning bolts (5-8px thick, 80-140px). Halftone dot patterns in corners (cyan dots on yellow). High energy, scattered placement."
      text_style "Extra bold rounded sans-serif font (Impact or similar), 900 weight, white color with thick 5-7px black outline stroke and subtle drop shadow"
      device_style "Colorful gradient frame with cyan-to-green fade on left edge transitioning to orange-to-pink fade on bottom right, glossy finish"
    }
    style_name "Snap Style"
  }
}

// NOTE: Old GenerateScreensForApp function removed - replaced by two-stage approach:
// 1. GenerateAppStructure (creates plan with tabs, layout, screen details)
// 2. GenerateScreenImagePrompt (generates prompts from structure)
