// Scene Generation BAML Domain
// Takes character objects (with avatars), scene prompt, and art style to generate optimized image prompts
// Note: Avatar class is automatically available from avatars.baml in the same directory

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
  client Gemini25Pro
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

    1. CREATE TWO PROMPT FORMATS:
       A. main_prompt: Natural language prompt (150-250 words)
       B. structured_prompt: JSON-friendly structured format

    2. MAIN PROMPT STRUCTURE:
       - Lead with art style for style-focused models
       - Follow with clear character description
       - Include action/pose and environment
       - End with mood, lighting, and quality markers
       - Format: "[style], [character], [action], [environment], [mood], [quality]"

    3. STRUCTURED PROMPT (for JSON-capable models like NanoBanana/Gemini):
       - Break down into clear categories
       - Subjects: Array of character descriptions with individual actions
       - Group Action: What they're doing together (if multiple)
       - Environment: Setting details
       - Style: Art style, colors, mood, lighting
       - Technical: Camera angle, shot type, composition
       - Quality: Detail level markers

    4. CHARACTER CONSISTENCY:
       - EXACT avatar features: face shape, skin tone, hair details, eye color
       - Use the provided outfit details (top, bottom, footwear, accessories)
       - Apply outfit modifications if scene requires (wet in rain, torn in battle)
       - Natural poses that fit the scene and character expression
       - Include distinctive features (glasses, facial hair, etc.)
       - For multiple characters: describe positioning and relationships

    5. NEGATIVE PROMPT:
       - Universal: "bad anatomy, blurry, low quality, watermark, signature"
       - Style-specific: Add based on art style
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
        summary "A person with short, thick dark brown hair, olive skin, a full beard, and thick-framed rectangular glasses."
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
      summary "A person with short, thick dark brown hair, olive skin, a full beard, and thick-framed rectangular glasses."
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

// Test 3: Multiple avatars - action scene battle
test ActionBattleTest {
  functions [GenerateScene]
  args {
    scene_prompt "Two characters in an epic martial arts battle stance, facing each other in a dojo with dramatic lighting, about to clash"
    art_style "toony anime style, dynamic action lines, vibrant colors"
    characters [
      {
        name "Fighter 1"
        avatar {
          summary "A person with short, thick dark brown hair, olive skin, a full beard, and thick-framed rectangular glasses."
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