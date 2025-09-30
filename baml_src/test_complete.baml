// Test for complete screenshot generation with retro vaporwave aesthetic
test RetroVaporwaveScreenshot {
  functions [GenerateScreenshotPrompt]
  args {
    text {
      header "Chill Vibes Only"
      subheader null
    }
    layout {
      composition "Device centered vertically filling 95% of canvas, header positioned at bottom below device with tight 1-2% gap, minimal spacing throughout"
      device_orientation "straight-on frontal view with no tilt"
      device_type "iPhone 16 Pro with under-display camera, 19.5:9 aspect ratio, pure rectangular display with slim 2-3mm uniform bezels, no notch or Dynamic Island, tall narrow form factor"
    }
    style {
      background_color "Classic vaporwave gradient from pink #FF71CE at top through purple #B967FF in middle to cyan #05FFA1 at bottom"
      details "Retro 80s-90s vaporwave aesthetic with retro grid floor perspective at bottom edge fading into distance, palm tree silhouettes (60-80px dark purple, 2-3 at sides), geometric triangles and rectangles with pink/cyan borders (40-60px, 5-7 floating), sun/grid sphere (80-100px, 1 in top corner), subtle scan lines effect overlay. ALL decorative elements at outer 10-15% edge border only, center 70% clear. Dreamy nostalgic retro-futuristic vibe."
      text_style "Impact font at 130-150px, extra bold 900 weight, white color with thick 5-7px purple outline stroke, pink drop shadow for retro effect"
      device_style "Glossy white frame with subtle rainbow iridescent sheen, retro-modern fusion appearance, slim uniform bezels"
    }
  }
}