// Test for complete screenshot generation
test VaporwaveCompleteScreenshot {
  functions [GenerateCompleteScreenshotPrompt]
  args {
    header "Chill Vibes Only"
    layout {
      composition "Device centered vertically, filling 85-90% of canvas height. Text positioned at bottom below device. Nostalgic 80s-90s aesthetic with balanced symmetry."
      device_size "large"
      device_angle "straight-on"
      device_description "iPhone 16 Pro with revolutionary under-display camera technology. The screen is a PERFECT RECTANGLE with rounded corners and NO notch, NO dynamic island, NO camera cutouts of any kind. Slim uniform bezels all around (approximately 2-3mm). The screen is completely uninterrupted from edge to edge - think of it as a pure rectangular display with nothing cutting into it. The camera and sensors are hidden beneath the display using advanced technology. NO status bar visible, NO home indicator bar."
    }
    style {
      background "Classic vaporwave gradient from pink (#FF71CE) at top through purple (#B967FF) in middle to cyan (#05FFA1) at bottom. Retro grid floor perspective at bottom fading into distance. Palm tree silhouettes (60-80px) in dark purple at sides. Geometric shapes: triangles and rectangles with pink and cyan borders floating around. Sun/grid sphere in top corner. Scan lines effect subtly overlaid. 80s/90s retro-futuristic aesthetic with dreamy nostalgic feel."
      device_frame "Glossy white with subtle rainbow iridescent sheen. Retro-modern fusion appearance."
      text_font "Impact"
      text_color "white"
      text_outline "thick-purple-outline with-pink-shadow"
      text_style "extra-bold black-weight"
    }
  }
}