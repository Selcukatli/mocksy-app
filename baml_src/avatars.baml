// Avatar Analysis BAML Domain
// Simplified version - Takes a person's photo and returns essential avatar attributes

// ============================================
// AVATAR-SPECIFIC CLIENT CONFIGURATION
// ============================================

// Avatar analyzer with fallback chain
client<llm> AvatarAnalyzer {
  provider "fallback"
  options {
    strategy [
      Qwen25VL,           // Primary vision model
      Gemini20FlashExp,   // Free fast fallback
      Llama32Vision       // Final fallback
    ]
  }
}

// ============================================
// AVATAR MODEL - SIMPLIFIED
// ============================================

class Avatar {
  // Summary
  summary string @description("Neutral physical description without expressions or emotions")

  // Core Demographics
  apparent_age string @description("Age range (e.g., 18-25, 25-35, 35-45)")
  gender_presentation string @description("How the person presents (male, female, androgynous)")
  ethnic_appearance string? @description("Apparent ethnic features if relevant (East Asian, South Asian, Middle Eastern, African, European, Latin American, Mixed/Multiethnic)")

  // Face & Body
  face_shape string @description("Face shape (oval, round, square, heart, diamond, oblong)")
  jawline string @description("Jawline type (soft, defined, angular, square, rounded)")
  body_build string? @description("Overall build if visible (slim, athletic, average, stocky, muscular, curvy, plus-size)")

  // Skin
  skin_tone string @description("Skin tone (porcelain, fair, light, medium, olive, tan, brown, dark)")
  complexion_details string? @description("Notable skin features (freckles, beauty marks, etc.)")

  // Hair
  hair_color string @description("Hair color (jet black, dark brown, light brown, blonde, auburn, gray, white)")
  hair_length string @description("Hair length (buzz cut, short, medium, shoulder-length, long)")
  hair_style string @description("Hairstyle including texture (straight bob, wavy layers, curly afro, tousled undercut)")

  // Eyes
  eye_color string @description("Eye color (dark brown, brown, hazel, green, blue, gray)")
  eye_shape string @description("Eye shape (almond, round, hooded, monolid, upturned, downturned)")

  // Eyebrows
  eyebrows string @description("Eyebrow description (thin arched, thick straight, bushy, soft arch)")

  // Nose
  nose_description string @description("Nose description (narrow straight, broad with rounded tip, upturned button)")

  // Lips
  lip_description string @description("Lip description (thin, full, wide medium, heart-shaped)")

  // Facial Hair
  facial_hair string? @description("Facial hair if present (clean shaven, stubble, goatee, full beard, mustache)")

  // Accessories
  glasses bool @description("Whether person wears glasses")
  glasses_style string? @description("Glasses description (rectangular black, round tortoise, wire-rimmed)")

  // Notable Features
  distinctive_features string[]? @description("Other notable features (dimples, piercings, etc.)")

  // Metadata
  confidence float @description("Confidence in analysis (0.0-1.0)")
  key_features string[] @description("Top 5 most distinctive physical features")
}

// ============================================
// AVATAR ANALYSIS FUNCTION
// ============================================

function AnalyzeAvatar(image: image) -> Avatar {
  client AvatarAnalyzer
  prompt #"
    {{ _.role("user") }}

    Analyze this person's photo to extract essential avatar attributes.

    Image to analyze:
    {{ image }}

    CRITICAL RULES - MUST FOLLOW:
    1. Focus ONLY on permanent physical features
    2. NEVER mention expressions (no smile, frown, laugh, etc.)
    3. NEVER describe emotions, mood, or demeanor
    4. NEVER describe clothing or accessories (except glasses)
    5. NEVER describe pose, gestures, or body position
    6. NEVER use emotional descriptors (warm, friendly, serious, etc.)
    7. The summary must be purely physical description
    8. For body_build: Try to determine from visible portions (shoulders, neck, face fullness)
       - If full body visible: provide accurate assessment
       - If only upper body/face visible: make reasonable inference from visible cues
       - Only use null if absolutely no body indicators are visible (rare)

    For the summary field:
    ✅ GOOD: "A person with curly black hair, brown eyes, rectangular glasses, and a goatee"
    ❌ BAD: "A friendly person with a warm smile and curly black hair"

    IMPORTANT - Use concise, combined descriptions:
    - For hair_style: Include texture and style together (e.g., "wavy bob", "straight ponytail", "curly afro")
    - For nose_description: Combine key features (e.g., "broad with rounded tip", "narrow and upturned")
    - For lip_description: Include size and shape (e.g., "full and wide", "thin heart-shaped")
    - For eyebrows: Combine thickness and shape (e.g., "thick arched", "thin straight")

    For key_features, list the 5 most distinctive PERMANENT physical traits.

    For body_build (IMPORTANT - try to always provide):
    - Use neutral, respectful terms: slim, athletic, average, stocky, muscular, curvy, plus-size
    - Even with just face/shoulders visible, make reasonable inference from:
      * Face fullness and neck width
      * Shoulder breadth if visible
      * Overall proportions
    - This helps with consistent character generation across scenes

    For ethnic_appearance (optional):
    - Only include if features are clearly distinctive
    - Use broad, respectful categories
    - If uncertain, leave as null

    For distinctive_features:
    - List things like dimples, piercings, moles, etc.
    - Keep as array of short descriptions

    Be specific enough that an artist could recreate this person's appearance as an avatar.

    {{ ctx.output_format }}
  "#
}

// ============================================
// TEST CASE
// ============================================

test AvatarTest {
  functions [AnalyzeAvatar]
  args {
    image { url "https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/73ccdd21-b99f-5c5d-b5d3-583189e20070/5e778976-0fdd-5ccc-9d03-6cbd59095783.jpg" }
  }
}