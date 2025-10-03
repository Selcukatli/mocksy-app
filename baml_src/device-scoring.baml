// Device Reference Image Quality Scoring
// Analyzes generated device images and scores them based on quality criteria

class DeviceImageScore {
  overall_score int @description("Overall quality score from 0-100 (higher is better)")
  is_front_facing bool @description("Device is facing directly forward (not tilted or angled)")
  has_black_screen bool @description("Screen display area is solid black")
  has_black_background bool @description("Canvas background behind device is solid black")
  no_notch_or_island bool @description("No Dynamic Island, notch, or camera cutouts visible")
  proper_size bool @description("Device fills approximately 80-90% of the frame")
  all_corners_visible bool @description("All 4 corners of the device are visible")
  is_vertical bool @description("Device is in vertical/portrait orientation")
  no_text_or_labels bool @description("No text, labels, or markings on device or frame")
  frame_matches_style bool @description("Device frame styling matches the expected description")
  issues string[] @description("List of specific issues found (empty if perfect)")
  reasoning string @description("Brief explanation of the score (2-3 sentences)")
}

// Score a single device reference image
function ScoreDeviceReferenceImage(
  device_image: image @description("The generated device reference image to score"),
  expected_frame_style: string @description("Expected frame styling description (e.g., 'glossy black frame with cyan glow')")
) -> DeviceImageScore {
  client Gemini25Flash
  prompt #"
    {{ _.role("user") }}

    You are a quality control expert analyzing a generated device mockup image.

    EXPECTED FRAME STYLE: "{{ expected_frame_style }}"

    IMAGE TO ANALYZE:
    {{ device_image }}

    SCORING CRITERIA:

    Analyze the image and check each criterion carefully:

    1. **Front-Facing (is_front_facing)**:
       - Device should be facing DIRECTLY forward like a flat icon
       - NOT tilted, NOT at an angle, NOT showing side edges
       - Should look straight-on at the screen

    2. **Black Screen (has_black_screen)**:
       - Screen display area must be solid black (#000000)
       - No content, no UI elements, just pure black

    3. **Black Background (has_black_background)** - CRITICAL CHECK:
       - Look at the CANVAS/BACKGROUND color surrounding the device
       - The area OUTSIDE the device frame must be pure black (#000000)
       - Common mistakes to catch:
         * WHITE background = FAIL (deduct 20 points)
         * GRAY background = FAIL (deduct 20 points)
         * Light colored background = FAIL (deduct 20 points)
       - Only PASS if the background is definitively dark black
       - When in doubt about background color, assume it fails

    4. **No Notch/Island (no_notch_or_island)**:
       - Should NOT show Dynamic Island, notch, or camera cutouts
       - Bezel should be completely clean and uniform

    5. **Proper Size (proper_size)**:
       - Device should fill approximately 80-90% of the image frame
       - Not too small, not cut off at edges

    6. **All Corners Visible (all_corners_visible)**:
       - All 4 corners of the device must be visible in frame
       - Device not cropped or cut off

    7. **Vertical Orientation (is_vertical)**:
       - Device should be in portrait/vertical orientation
       - Taller than it is wide

    8. **No Text/Labels (no_text_or_labels)**:
       - NO text, labels, or markings anywhere on device or frame
       - No brand names, model numbers, etc.

    9. **Frame Matches Style (frame_matches_style)**:
       - Device frame should match the expected styling description
       - Check colors, materials, glows, textures described

    OVERALL SCORE CALCULATION:
    - Start at 100 points
    - Deduct points for each failed criterion:
      * Front-facing: -25 points if tilted/angled
      * Black screen: -15 points if not solid black
      * Black background: -20 points if not pure black (white, gray, or any other color)
      * No notch/island: -15 points if visible
      * Proper size: -10 points if too small/large
      * All corners visible: -10 points if cropped
      * Vertical orientation: -5 points if horizontal
      * No text/labels: -5 points if text present
      * Frame matches style: -5 points if doesn't match

    IMPORTANT: Be very strict about the black background check. White backgrounds are a common mistake.

    ISSUES ARRAY:
    - List specific problems found (e.g., "Device is tilted at 15° angle", "Dynamic Island visible at top", "Background is gray instead of black")
    - Leave empty if no issues found

    REASONING:
    - Provide 2-3 sentences explaining the score
    - Highlight major issues or confirm it's good
    - Be specific and actionable

    {{ ctx.output_format }}
  "#
}

// ============================================
// TEST CASES
// ============================================

test ScoreWhiteBackgroundImage {
  functions [ScoreDeviceReferenceImage]
  args {
    device_image { url "https://v3b.fal.media/files/b/panda/Zw5iNOfktBsj9crZWLIKq_4899ace7a198486fafcf11882de4c6a5.png" }
    expected_frame_style "Glossy black metallic frame with dual neon edge lighting"
  }
}
