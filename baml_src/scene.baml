// Scene Generation BAML Domain
// Takes character objects (with avatars), scene prompt, and art style to generate optimized image prompts
// Note: Avatar class is automatically available from avatars.baml in the same directory

// ============================================
// SCENE-SPECIFIC CLIENT CONFIGURATION
// ============================================

// High Quality - Best scene generation for final/hero images
client<llm> SceneGeneratorHigh {
  provider "fallback"
  options {
    strategy [
      Gemini25Pro,        // Premium Gemini model
      GPT5,               // Top-tier OpenAI
      ClaudeSonnet4,      // High-quality Anthropic
      MistralLarge        // Premium Mistral fallback
    ]
  }
}

// Medium Quality - Balanced for standard use
client<llm> SceneGeneratorMed {
  provider "fallback"
  options {
    strategy [
      Gemini25Flash,      // Good balance of speed/quality
      GPT5Mini,           // Balanced OpenAI
      ClaudeHaiku,        // Fast Claude
      MistralSmall        // Efficient Mistral
    ]
  }
}

// Low Quality - Fast and cheap for drafts/testing
client<llm> SceneGeneratorLow {
  provider "fallback"
  options {
    strategy [
      Gemini25FlashLite,  // Ultra-fast Gemini
      GPT5Nano,           // Cheapest OpenAI
      ClaudeHaiku         // Fast fallback
    ]
  }
}

// Default scene generator (uses medium tier)
client<llm> SceneGenerator {
  provider "fallback"
  options {
    strategy [
      Gemini25Flash,      // Start with balanced
      Gemini25FlashLite,  // Fallback to fast
      Gemini25Pro         // Escalate to premium if needed
    ]
  }
}

// ============================================
// SCENE MODEL
// ============================================

class Scene {
  // Core Scene Description
  main_description string @description("Complete scene description in 2-3 clear sentences")

  // Character Integration (supports multiple characters)
  characters CharacterInScene[] @description("How each avatar appears in the scene")
  character_arrangement string @description("Overall arrangement and positioning of characters")

  // Visual Composition
  camera_angle string @description("Camera angle (eye-level, low angle, high angle, profile, three-quarter)")
  shot_type string @description("Shot type (close-up, medium shot, full body, wide shot)")

  // Environment
  setting string @description("Location and environment in simple terms")
  background string @description("Background elements in order of importance")
  time_of_day string @description("Time of day and its lighting effect")

  // Mood & Atmosphere
  mood string @description("Emotional tone (epic, peaceful, mysterious, energetic, etc.)")
  color_palette string @description("Dominant colors (max 3-4 colors)")
  lighting_style string @description("Lighting description (dramatic, soft, golden hour, etc.)")

  // Art Style Application
  style_keywords string[] @description("Key style descriptors for the art style (max 5)")
  quality_markers string[] @description("Quality indicators (masterpiece, best quality, ultra detailed, etc.)")

  // Optimized Prompts for Image Generation
  main_prompt string @description("Complete prompt for image generation (150-250 words max)")
  negative_prompt string @description("Things to avoid (bad anatomy, blurry, low quality, etc.)")

  // Structured Prompt Components (for JSON-capable models)
  structured_prompt PromptStructure @description("Structured prompt for models that support JSON")

  // Generation Hints
  suggested_guidance float @description("Suggested guidance scale (typically 3.5-12)")
  complexity_score float @description("Scene complexity (0.0-1.0)")

  // Metadata
  avatar_integration string @description("How well the avatars are integrated in the prompt")
  character_count int @description("Number of characters in the scene")
  key_elements string[] @description("Top 3-5 most important elements to get right")
}

// ============================================
// CHARACTER DEFINITION
// ============================================

class Character {
  // Identity
  name string? @description("Optional character name/identifier")
  avatar Avatar @description("Physical characteristics from avatar analysis")

  // Structured Outfit
  outfit Outfit @description("Character's clothing and accessories")

  // Scene generation hints
  expression string? @description("Default expression (confident, shy, serious, cheerful, etc.)")
  signature_colors string[]? @description("Preferred color palette for this character")
}

class Outfit {
  // Clothing layers
  top string? @description("Upper body clothing (t-shirt, blouse, jacket, etc.)")
  bottom string? @description("Lower body clothing (jeans, skirt, shorts, etc.)")
  footwear string? @description("Shoes, boots, sandals, etc.")
  outerwear string? @description("Coat, hoodie, vest, etc.")

  // Integrated accessories (part of the outfit)
  accessories string[]? @description("Watches, jewelry, belts, hats, scarves, bags, etc.")

  // Style metadata
  style string @description("Overall style (casual, formal, athletic, punk, vintage, etc.)")
  color_scheme string? @description("Main colors of the outfit")
  fabric_textures string[]? @description("Materials like denim, leather, silk, cotton")
}

// ============================================
// CHARACTER IN SCENE
// ============================================

class CharacterInScene {
  character_index int @description("Index of the character this refers to (0-based)")
  description string @description("Character appearance in this specific scene")
  pose string @description("Character's pose or action")
  placement string @description("Where positioned (left, center, right, foreground, background)")
  outfit_modifications string? @description("Scene-specific outfit changes (wet, torn, dirty, etc.)")
  interaction string? @description("How they interact with others or environment")
}

// ============================================
// STRUCTURED PROMPT FORMAT
// ============================================

class PromptStructure {
  // Core Elements
  subjects Subject[] @description("All characters/subjects in the scene")
  group_action string? @description("What the group is doing together (if multiple)")
  environment string @description("Setting and surroundings")

  // Style Elements
  style PromptStyle @description("Visual style specifications")

  // Technical Details
  technical PromptTechnical @description("Camera and shot specifications")

  // Quality Markers
  quality string[] @description("Quality and detail markers")
}

class PromptStyle {
  art_style string @description("Primary art style")
  color_palette string @description("Color scheme")
  mood string @description("Emotional tone")
  lighting string @description("Lighting setup")
  texture string @description("Surface and material qualities")
}

class PromptTechnical {
  camera_angle string @description("Camera perspective")
  shot_type string @description("Framing and distance")
  composition string @description("Visual arrangement")
  depth_of_field string @description("Focus and blur effects")
}

class Subject {
  description string @description("Physical appearance and outfit")
  action string @description("Individual action or pose")
  position string @description("Position in frame")
}

// ============================================
// SCENE GENERATION FUNCTION
// ============================================

function GenerateScene(
  scene_prompt: string @description("User's scene description"),
  art_style: string @description("Desired art style"),
  characters: Character[] @description("Array of characters with avatars and outfits (1-5 characters)")
) -> Scene {
  client SceneGeneratorMed  // Change to SceneGeneratorHigh or SceneGeneratorLow as needed
  prompt #"
    {{ _.role("user") }}

    Generate an optimized scene description for image generation.

    INPUTS:
    Scene Request: {{ scene_prompt }}
    Art Style: {{ art_style }}

    Character Descriptions:
    {% for character in characters %}
    Character {{ loop.index }}{% if character.name %} ({{ character.name }}){% endif %}:

    Physical Traits:
    - Summary: {{ character.avatar.summary }}
    - Age/Gender: {{ character.avatar.apparent_age }}, {{ character.avatar.gender_presentation }}
    - Face: {{ character.avatar.face_shape }} face, {{ character.avatar.skin_tone }} skin
    - Hair: {{ character.avatar.hair_color }}, {{ character.avatar.hair_length }}, {{ character.avatar.hair_style }}
    - Eyes: {{ character.avatar.eye_color }}, {{ character.avatar.eye_shape }}
    - Eyebrows: {{ character.avatar.eyebrows }}
    - Nose: {{ character.avatar.nose_description }}
    - Lips: {{ character.avatar.lip_description }}
    - Distinctive: {{ character.avatar.key_features }}
    {% if character.avatar.body_build %}
    - Body build: {{ character.avatar.body_build }}
    {% endif %}
    {% if character.avatar.facial_hair %}
    - Facial hair: {{ character.avatar.facial_hair }}
    {% endif %}
    {% if character.avatar.glasses %}
    - Glasses: {{ character.avatar.glasses_style }}
    {% endif %}
    {% if character.avatar.ethnic_appearance %}
    - Ethnic appearance: {{ character.avatar.ethnic_appearance }}
    {% endif %}

    Outfit:
    - Style: {{ character.outfit.style }}
    {% if character.outfit.top %}
    - Top: {{ character.outfit.top }}
    {% endif %}
    {% if character.outfit.bottom %}
    - Bottom: {{ character.outfit.bottom }}
    {% endif %}
    {% if character.outfit.outerwear %}
    - Outerwear: {{ character.outfit.outerwear }}
    {% endif %}
    {% if character.outfit.footwear %}
    - Footwear: {{ character.outfit.footwear }}
    {% endif %}
    {% if character.outfit.accessories %}
    - Accessories: {{ character.outfit.accessories }}
    {% endif %}
    {% if character.outfit.color_scheme %}
    - Color scheme: {{ character.outfit.color_scheme }}
    {% endif %}
    {% if character.expression %}
    - Expression: {{ character.expression }}
    {% endif %}
    {% if character.signature_colors %}
    - Signature colors: {{ character.signature_colors }}
    {% endif %}

    {% endfor %}

    INSTRUCTIONS FOR PROMPT GENERATION:

    CRITICAL: You MUST include EVERY physical trait and outfit detail provided above in your main_prompt.
    Do not summarize or skip any features. If it's listed above, it must appear in the prompt.

    1. CREATE TWO PROMPT FORMATS:
       A. main_prompt: Natural language prompt (150-250 words)
       B. structured_prompt: JSON-friendly structured format

    2. MAIN PROMPT STRUCTURE:
       - Lead with art style REPEATED 2-3 times for emphasis
       - Character descriptions should be DETAILED (30-50 words per character):
         * Include age, ethnicity, face shape, skin tone
         * Complete hair description (color, length, style, texture if notable)
         * Eye color AND shape
         * ALL distinctive features
         * Complete outfit with all items
       - Include specific action/pose with body language
       - Describe environment with at least 3 details
       - End with mood, lighting, and quality markers
       - Format: "[style]x3, [detailed characters], [specific actions], [rich environment], [mood/lighting], [quality]"
       - For non-photorealistic styles, explicitly state what it is NOT

    3. STRUCTURED PROMPT (for JSON-capable models like NanoBanana/Gemini):
       - Break down into clear categories
       - Subjects: Array of character descriptions with individual actions
       - Group Action: What they're doing together (if multiple)
       - Environment: Setting details
       - Style: Art style, colors, mood, lighting
       - Technical: Camera angle, shot type, composition
       - Quality: Detail level markers

    4. CHARACTER CONSISTENCY AND DETAIL:
       - Include ALL provided physical traits in the main prompt:
         * Face shape AND skin tone (e.g., "round olive-skinned face")
         * Complete hair description (color + length + style)
         * Eye color AND shape (e.g., "dark brown almond eyes")
         * ALL distinctive features (glasses style, facial hair type, piercings)
       - Describe complete outfits:
         * Every clothing item provided (top, bottom, footwear)
         * All accessories (watches, jewelry, belts)
         * Fabric textures if provided
       - Add character-specific details:
         * Body language matching their expression
         * How clothing fits their body type
         * Any scene-appropriate modifications (sweat, battle damage, etc.)
       - For multiple characters:
         * Describe relative heights/builds if different
         * Show personality through posture and stance

       IMPORTANT - ACCESSORY CONFLICT RESOLUTION:
       - Character outfit/accessories ALWAYS override conflicting Avatar traits (Character is scene-specific, Avatar is base description)
       - If outfit accessories include eyewear (sunglasses, goggles, etc.) AND avatar has glasses:
         * PRIORITIZE the outfit's eyewear as the currently worn item
         * Mention avatar glasses only if contextually appropriate (e.g., "wearing sunglasses over their prescription frames" or "sunglasses instead of their usual glasses")
         * If outfit says "sunglasses on head", show sunglasses on head and prescription glasses on face
       - Avoid depicting characters wearing TWO pairs of glasses on their face simultaneously unless explicitly specified
       - For any Character vs Avatar conflicts, Character wins (outfit trumps base appearance)

    5. NEGATIVE PROMPT:
       - Universal: "bad anatomy, blurry, low quality, watermark, signature"
       - Style-specific: Add based on art style
       - For non-photorealistic styles: Include "photorealistic, photograph, 3d render, ultra realistic"
       - Keep concise and focused

    6. MODEL ADAPTABILITY:
       - Midjourney: Focus on artistic descriptions, avoid parameters
       - DALL-E: Use rich, narrative language
       - Stable Diffusion: Balance technical and artistic
       - NanoBanana/Gemini: Leverage structured format
       - Flux: Emphasize style and quality markers

    7. BEST PRACTICES:
       - Clear, unambiguous descriptions
       - Avoid model-specific jargon
       - Maintain character-scene coherence
       - Prioritize the most important elements

    The goal is to create BOTH a natural language prompt AND a structured format that can be used across different image generation models, ensuring consistent character representation and scene quality.

    MULTI-CHARACTER CONSIDERATIONS:
    - When multiple avatars provided, describe their spatial relationship
    - Include interactions between characters if appropriate
    - Ensure each character is distinctly describable
    - Balance detail across all characters
    - For group shots, describe overall composition first, then individuals

    REQUIRED OUTPUT FIELDS:
    You MUST generate ALL of the following fields for the Scene object:
    - main_description: 2-3 sentence overview of the complete scene
    - characters: Array of CharacterInScene objects describing how each character appears
    - character_arrangement: Overall spatial arrangement and positioning of characters
    - camera_angle: (eye-level, low angle, high angle, profile, three-quarter)
    - shot_type: (close-up, medium shot, full body, wide shot)
    - setting: Location/environment description
    - background: Background elements in order of importance
    - time_of_day: Time and its lighting effect
    - mood: Emotional tone of the scene
    - color_palette: 3-4 dominant colors
    - lighting_style: Type of lighting (dramatic, soft, golden hour, etc.)
    - style_keywords: 5 key style descriptors as array
    - quality_markers: Quality indicators as array (masterpiece, best quality, etc.)
    - main_prompt: Complete 150-250 word prompt for image generation
    - negative_prompt: Things to avoid
    - structured_prompt: PromptStructure object with all sub-fields
    - suggested_guidance: Float between 3.5-12
    - complexity_score: Float between 0.0-1.0
    - avatar_integration: Description of how avatars are integrated
    - character_count: Integer number of characters
    - key_elements: Array of 3-5 most important elements

    {{ ctx.output_format }}
  "#
}

// ============================================
// TEST CASES
// ============================================

// Test 1: Single avatar - full body waving hello
test FullBodyWaveTest {
  functions [GenerateScene]
  args {
    scene_prompt "A friendly person standing in a bright, clean environment, waving hello with a welcoming gesture, full body visible from head to toe"
    art_style "toony anime style, bright colors, cel-shaded"
    characters [{
      name "Sam"
      avatar {
        summary "A person with short, thick, dark wavy hair, dark brown eyes, a short full beard, and rectangular glasses on a round face."
        apparent_age "25-35"
        gender_presentation "male"
        ethnic_appearance "Middle Eastern"
        face_shape "round"
        jawline "rounded"
        body_build "stocky"
        skin_tone "medium"
        complexion_details null
        hair_color "dark brown"
        hair_length "short"
        hair_style "thick and wavy, tousled"
        eye_color "dark brown"
        eye_shape "almond"
        eyebrows "thick with a soft arch"
        nose_description "broad with a rounded tip"
        lip_description "medium width with a fuller lower lip"
        facial_hair "short full beard"
        glasses true
        glasses_style "dark purple rectangular frames"
        distinctive_features ["left ear piercing"]
        confidence 0.95
        key_features ["Thick-framed rectangular glasses", "Short full beard", "Thick, dark wavy hair", "Round face shape", "Broad nose"]
      }
      outfit {
        style "casual modern"
        top "navy blue cotton t-shirt"
        bottom "dark jeans"
        footwear "white sneakers"
        accessories ["silver watch"]
        color_scheme "navy, denim blue, white"
      }
      expression "cheerful"
      signature_colors ["blue", "navy", "gray"]
    }]
  }
}

// Test 2: Single avatar - action scene running
test ActionRunningTest {
  functions [GenerateScene]
  args {
    scene_prompt "A person sprinting through a futuristic city street, dynamic running pose with motion blur, neon lights reflecting off wet pavement"
    art_style "8-bit pixel art, retro video game style, limited color palette"
    characters [{
      name "Runner"
      avatar {
        summary "A person with short, thick, dark wavy hair, dark brown eyes, a short full beard, and rectangular glasses on a round face."
      apparent_age "25-35"
      gender_presentation "male"
      ethnic_appearance "Middle Eastern"
      face_shape "round"
      jawline "rounded"
      body_build null
      skin_tone "olive"
      complexion_details null
      hair_color "dark brown"
      hair_length "short"
      hair_style "short, thick wavy"
      eye_color "dark brown"
      eye_shape "almond"
      eyebrows "thick with a soft arch"
      nose_description "medium width with a rounded tip"
      lip_description "medium fullness"
      facial_hair "full beard"
      glasses true
      glasses_style "thick-framed rectangular"
      distinctive_features ["left ear piercing"]
      confidence 0.95
      key_features ["thick-framed rectangular glasses", "full beard", "short, thick wavy hair", "round face shape", "olive skin tone"]
      }
      outfit {
        style "athletic cyberpunk"
        top "black tech hoodie"
        bottom "cargo pants"
        footwear "high-tech running shoes"
        accessories ["LED wristband", "earbuds"]
        color_scheme "black, neon blue, silver"
      }
      expression "determined"
      signature_colors ["black", "blue", "silver"]
    }]
  }
}

// Test 3: Multiple avatars - martial arts scene
test MartialArtsTest {
  functions [GenerateScene]
  args {
    scene_prompt "Two characters in an epic martial arts battle stance, facing each other in a dojo with dramatic lighting, about to clash"
    art_style "toony anime style, dynamic action lines, vibrant colors"
    characters [
      {
        name "Fighter 1"
        avatar {
            summary "A person with short, thick, dark wavy hair, dark brown eyes, a short full beard, and rectangular glasses on a round face."
          apparent_age "25-35"
          gender_presentation "male"
          ethnic_appearance "Middle Eastern"
          face_shape "round"
          jawline "rounded"
          body_build null
          skin_tone "olive"
          complexion_details null
          hair_color "dark brown"
          hair_length "short"
          hair_style "short, thick wavy"
          eye_color "dark brown"
          eye_shape "almond"
          eyebrows "thick with a soft arch"
          nose_description "medium width with a rounded tip"
          lip_description "medium fullness"
          facial_hair "full beard"
          glasses true
          glasses_style "thick-framed rectangular"
          distinctive_features ["left ear piercing"]
          confidence 0.95
          key_features ["thick-framed rectangular glasses", "full beard", "short, thick wavy hair", "round face shape", "olive skin tone"]
        }
        outfit {
          style "martial arts"
          top "black gi jacket with white belt"
          bottom "black gi pants"
          footwear "barefoot"
          accessories []
          color_scheme "black, white"
        }
        expression "focused"
        signature_colors ["black", "white"]
      },
      {
        name "Fighter 2"
        avatar {
          summary "A woman with long auburn hair, green eyes, and light freckles."
          apparent_age "20-30"
          gender_presentation "female"
          ethnic_appearance "European"
          face_shape "oval"
          jawline "soft"
          body_build "slim"
          skin_tone "light"
          complexion_details "light freckles"
          hair_color "auburn"
          hair_length "long"
          hair_style "wavy layers with red highlights"
          eye_color "green"
          eye_shape "round"
          eyebrows "medium natural arch"
          nose_description "narrow and refined"
          lip_description "full"
          facial_hair null
          glasses false
          glasses_style null
          distinctive_features ["Light freckles", "Dimples on both cheeks", "Earlobe piercings"]
          confidence 0.92
          key_features ["Long wavy auburn hair", "Bright green eyes", "Light freckles", "Dimples", "Oval face"]
        }
        outfit {
          style "martial arts"
          top "white gi jacket with red belt"
          bottom "white gi pants"
          footwear "barefoot"
          accessories ["hair tie pulling hair into high ponytail"]
          color_scheme "white, red"
        }
        expression "fierce"
        signature_colors ["white", "red", "auburn"]
      }
    ]
  }
}

// Test 4: Beach hangout - Three friends relaxing
test BeachHangoutTest {
  functions [GenerateScene]
  args {
    scene_prompt "Three friends relaxing and hanging out on a beautiful beach during golden hour. They're sitting on a blanket, laughing and enjoying snacks, with the ocean waves in the background"
    art_style "studio ghibli art style, anime style, cel-shaded, warm colors"
    characters [
      {
        name "Alex"
        avatar {
          summary "A person with short, thick, dark wavy hair, dark brown eyes, a short full beard, and rectangular glasses on a round face."
          apparent_age "25-35"
          gender_presentation "male"
          ethnic_appearance "Middle Eastern"
          face_shape "round"
          jawline "rounded"
          body_build "stocky"
          skin_tone "medium"
          complexion_details null
          hair_color "dark brown"
          hair_length "short"
          hair_style "thick and wavy, tousled"
          eye_color "dark brown"
          eye_shape "almond"
          eyebrows "thick with a soft arch"
          nose_description "broad with a rounded tip"
          lip_description "medium width with a fuller lower lip"
          facial_hair "short full beard"
          glasses true
          glasses_style "dark purple rectangular frames"
          distinctive_features ["left ear piercing"]
          confidence 0.95
          key_features ["Thick-framed rectangular glasses", "Short full beard", "Thick, dark wavy hair", "Round face shape", "Broad nose"]
        }
        outfit {
          style "casual beach"
          top "light blue linen shirt, unbuttoned"
          bottom "khaki shorts"
          footwear "barefoot"
          accessories ["leather bracelet", "sunglasses on head"]
          color_scheme "light blue, khaki, tan"
        }
        expression "relaxed and happy"
        signature_colors ["blue", "tan", "white"]
      },
      {
        name "Emma"
        avatar {
          summary "A woman with long auburn hair, green eyes, and light freckles."
          apparent_age "20-30"
          gender_presentation "female"
          ethnic_appearance "European"
          face_shape "oval"
          jawline "soft"
          body_build "slim"
          skin_tone "light"
          complexion_details "light freckles"
          hair_color "auburn"
          hair_length "long"
          hair_style "wavy layers with red highlights"
          eye_color "green"
          eye_shape "round"
          eyebrows "medium natural arch"
          nose_description "narrow and refined"
          lip_description "full"
          facial_hair null
          glasses false
          glasses_style null
          distinctive_features ["Light freckles", "Dimples on both cheeks", "Earlobe piercings"]
          confidence 0.92
          key_features ["Long wavy auburn hair", "Bright green eyes", "Light freckles", "Dimples", "Oval face"]
        }
        outfit {
          style "beach casual"
          top "white sundress with floral patterns"
          bottom null
          footwear "sandals"
          accessories ["straw sun hat", "shell necklace"]
          color_scheme "white, light pink, natural straw"
        }
        expression "joyful"
        signature_colors ["white", "pink", "coral"]
      },
      {
        name "Marcus"
        avatar {
          summary "A tall young man with short curly black hair, warm brown eyes, and a bright smile."
          apparent_age "22-28"
          gender_presentation "male"
          ethnic_appearance "African"
          face_shape "rectangular"
          jawline "defined"
          body_build "athletic"
          skin_tone "dark"
          complexion_details null
          hair_color "black"
          hair_length "short"
          hair_style "tight curls, well-groomed"
          eye_color "brown"
          eye_shape "round"
          eyebrows "medium thickness, straight"
          nose_description "medium width with straight bridge"
          lip_description "full"
          facial_hair null
          glasses false
          glasses_style null
          distinctive_features ["small scar on right eyebrow", "diamond stud earrings"]
          confidence 0.93
          key_features ["Short curly hair", "Athletic build", "Bright smile", "Diamond studs", "Defined jawline"]
        }
        outfit {
          style "beach casual"
          top "red tank top"
          bottom "navy board shorts"
          footwear "flip flops"
          accessories ["silver chain necklace", "sports watch"]
          color_scheme "red, navy, silver"
        }
        expression "cheerful and laughing"
        signature_colors ["red", "navy", "white"]
      }
    ]
  }
}

// Test 5: Beach bonfire - Continuation of beach hangout at sunset
test BeachBonfireTest {
  functions [GenerateScene]
  args {
    scene_prompt "The same three friends now gathered around a cozy beach bonfire as the sun sets. They're roasting marshmallows, telling stories, with guitars and blankets scattered around. The fire's warm glow illuminates their faces against the purple-orange twilight sky, waves gently lapping in the background"
    art_style "studio ghibli art style, anime style, cel-shaded, warm sunset colors, magical lighting"
    characters [
      {
        name "Alex"
        avatar {
          summary "A person with short, thick, dark wavy hair, dark brown eyes, a short full beard, and rectangular glasses on a round face."
          apparent_age "25-35"
          gender_presentation "male"
          ethnic_appearance "Middle Eastern"
          face_shape "round"
          jawline "rounded"
          body_build "stocky"
          skin_tone "medium"
          complexion_details null
          hair_color "dark brown"
          hair_length "short"
          hair_style "thick and wavy, tousled"
          eye_color "dark brown"
          eye_shape "almond"
          eyebrows "thick with a soft arch"
          nose_description "broad with a rounded tip"
          lip_description "medium width with a fuller lower lip"
          facial_hair "short full beard"
          glasses true
          glasses_style "dark purple rectangular frames"
          distinctive_features ["left ear piercing"]
          confidence 0.95
          key_features ["Thick-framed rectangular glasses", "Short full beard", "Thick, dark wavy hair", "Round face shape", "Broad nose"]
        }
        outfit {
          style "casual evening beach"
          top "navy hoodie over the light blue shirt"
          bottom "same khaki shorts"
          footwear "barefoot"
          accessories ["leather bracelet", "marshmallow roasting stick"]
          color_scheme "navy, light blue, khaki"
        }
        expression "content, storytelling"
        signature_colors ["navy", "blue", "tan"]
      },
      {
        name "Emma"
        avatar {
          summary "A woman with long auburn hair, green eyes, and light freckles."
          apparent_age "20-30"
          gender_presentation "female"
          ethnic_appearance "European"
          face_shape "oval"
          jawline "soft"
          body_build "slim"
          skin_tone "light"
          complexion_details "light freckles"
          hair_color "auburn"
          hair_length "long"
          hair_style "wavy layers with red highlights"
          eye_color "green"
          eye_shape "round"
          eyebrows "medium natural arch"
          nose_description "narrow and refined"
          lip_description "full"
          facial_hair null
          glasses false
          glasses_style null
          distinctive_features ["Light freckles", "Dimples on both cheeks", "Earlobe piercings"]
          confidence 0.92
          key_features ["Long wavy auburn hair", "Bright green eyes", "Light freckles", "Dimples", "Oval face"]
        }
        outfit {
          style "cozy beach evening"
          top "cream knit cardigan over white sundress"
          bottom null
          footwear "barefoot, sandals beside her"
          accessories ["shell necklace", "flower crown made of beach flowers"]
          color_scheme "cream, white, natural tones"
        }
        expression "listening intently, soft smile"
        signature_colors ["cream", "white", "coral"]
      },
      {
        name "Marcus"
        avatar {
          summary "A tall young man with short curly black hair, warm brown eyes, and a bright smile."
          apparent_age "22-28"
          gender_presentation "male"
          ethnic_appearance "African"
          face_shape "rectangular"
          jawline "defined"
          body_build "athletic"
          skin_tone "dark"
          complexion_details null
          hair_color "black"
          hair_length "short"
          hair_style "tight curls, well-groomed"
          eye_color "brown"
          eye_shape "round"
          eyebrows "medium thickness, straight"
          nose_description "medium width with straight bridge"
          lip_description "full"
          facial_hair null
          glasses false
          glasses_style null
          distinctive_features ["small scar on right eyebrow", "diamond stud earrings"]
          confidence 0.93
          key_features ["Short curly hair", "Athletic build", "Bright smile", "Diamond studs", "Defined jawline"]
        }
        outfit {
          style "relaxed beach evening"
          top "red tank top with gray zip-up jacket"
          bottom "navy board shorts"
          footwear "barefoot"
          accessories ["silver chain necklace", "acoustic guitar beside him"]
          color_scheme "red, gray, navy"
        }
        expression "playing guitar, focused but happy"
        signature_colors ["red", "gray", "navy"]
      }
    ]
  }
}