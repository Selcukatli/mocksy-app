# 🍌 NANO BANANA PROMPT ENGINEERING RULES
## For Claude Code Integration with Gemini 2.5 Flash Image Model

**Version:** 2.0 (Enhanced)  
**Model:** `gemini-2.5-flash-image` (Nano Banana)  
**Optimized for:** Claude Code automated prompt generation  
**Dataset Reference:** Nano-consistent-150K (150,000+ high-quality samples with 35+ editing variations per identity)

---

## 🎯 Core Principles

### 1. **Task-Oriented Thinking**
- Each prompt = One clear, atomic operation
- Chain multiple prompts for complex workflows rather than cramming everything into one
- Use imperative, direct language ("Change", "Generate", "Apply", "Transform")

### 2. **Identity Preservation as Default**
- **CRITICAL:** Nano Banana's strength is maintaining subject identity across 35+ variations
- Always explicitly state what should remain unchanged
- Default preservation order: `Face > Hair > Outfit > Background > Pose`
- Override explicitly only when modification is intended

### 3. **Context-Aware Editing**
- Nano Banana has deep 3D spatial understanding and lighting physics
- Specify lighting direction, perspective, and occlusion relationships
- Trust the model to handle: reflections, shadows, material properties, depth of field

### 4. **Multi-Image Fusion Strategy**
- When using multiple references, establish hierarchy: `Primary Subject > Secondary Elements > Background`
- Explicitly state which reference takes priority for conflicts
- Maximum recommended references: 3-4 for optimal coherence

### 5. **Iterative Refinement Over Regeneration**
- Start with minimal prompts (10-20 words)
- Add constraints only when the model drifts
- Build complexity incrementally: `Basic → Identity Locks → Realism Constraints → Style Refinements`

---

## 📋 Canonical Prompt Templates

### **CATEGORY 1: IDENTITY & CHARACTER WORK**

#### 1.1 Character Design Suite
```
Generate character design sheet for the subject in the image:
- Three-view turnaround (front, side, back)
- Expression sheet showing [list 6-8 emotions]
- Pose sheet with [list 5-7 actions]
- Height comparison chart showing subject at [ages/scales]
Maintain consistent identity, outfit, and proportions across all views.
Style: [2D illustration / 3D model sheet / anime / realistic]
```

#### 1.2 Temporal Transformation (Era Shift)
```
Transform the subject to [specific year/era: e.g., "1920s", "Victorian England", "2080 cyberpunk"].
Preserve facial identity exactly (eyes, nose, mouth structure, jawline).
Update: clothing, hairstyle, accessories, background setting, lighting style.
Period-accurate elements: [list specific details like "flapper dress, art deco patterns, sepia tone"].
Remove all modern anachronisms.
```

#### 1.3 Age Progression/Regression
```
Show the subject at age [target age].
Preserve core facial structure and features.
Naturally age/de-age: skin texture, wrinkles, facial fullness, hair color/volume.
Adjust body proportions appropriately for age.
Keep outfit style consistent with age transformation.
```

#### 1.4 Identity-Consistent Series
```
Generate [number] variations of the subject performing different [actions/wearing different outfits/in different settings].
CRITICAL: Maintain exact facial identity across all variations.
Variables to change: [specify what varies]
Constants: [specify what stays identical]
Lighting and perspective: [consistent / varied per scene]
```

---

### **CATEGORY 2: POSE & GESTURE EDITING**

#### 2.1 Direct Pose Transfer
```
Change the subject's pose to match the pose shown in [reference image 2].
Preserve: facial identity, hairstyle, outfit colors and style, background.
Adjust: body position, limb placement, hand gestures, head angle.
Maintain realistic joint angles and natural body mechanics.
Match the energy level: [dynamic / relaxed / formal / candid].
```

#### 2.2 Hand-Drawn Pose Control
```
Using the stick figure/sketch provided, position the subject in this exact pose.
Translate the sketch proportions to realistic human anatomy.
Preserve subject's identity and clothing from reference image.
Ensure natural weight distribution and balance.
Background: [describe setting or leave unchanged]
```

#### 2.3 Multi-Character Pose Coordination
```
Using references of [Person A] and [Person B], generate them [interacting: e.g., "shaking hands", "dancing together", "sitting across a table"].
Maintain both identities distinctly.
Ensure: natural eye contact, realistic spatial relationship, plausible physical interaction.
Lighting: [unified source, time of day]
Background: [setting description]
Composition: [framing, camera angle]
```

#### 2.4 Action Sequence Generation
```
Create a [3/4/5]-panel sequence showing the subject performing [action].
Panel 1: [starting pose]
Panel 2: [mid-action]
Panel 3: [conclusion]
Preserve identity throughout. Show motion blur if applicable.
Style: [comic book / storyboard / photo sequence]
```

---

### **CATEGORY 3: OUTFIT & FASHION EDITING**

#### 3.1 Virtual Try-On (OOTD)
```
Dress the subject from Image 1 in the complete outfit shown in Image 2.
Include: [list all garments and accessories: "jacket, shoes, sunglasses, watch, etc."]
Shoot in [setting: "studio with neutral background" / "outdoor street style" / "indoor lifestyle"]
Lighting: natural daylight, soft shadows
Camera: full-body shot, slight low angle to show footwear
Preserve facial identity and natural pose variations allowed for outfit display.
Render realistic fabric drape, texture (denim, silk, leather), and fit.
```

#### 3.2 Outfit Swap with Style
```
Replace the subject's outfit with [description: "business formal suit" / "athletic wear" / "vintage 70s style"].
Preserve: identity, pose, background, lighting
Update: clothing only, ensure fabrics and fit match body naturally
Add appropriate accessories: [specify if needed]
Color palette: [specify or "match original mood"]
```

#### 3.3 Accessories Addition
```
Add [item list: "sunglasses, watch, scarf, hat"] to the subject.
Place items naturally and proportionally.
Preserve identity and existing outfit.
Ensure accessories cast appropriate shadows and reflections.
Style: [matching / contrasting / themed]
```

---

### **CATEGORY 4: BACKGROUND & ENVIRONMENT**

#### 4.1 Background Swap (Photorealistic)
```
Replace the background with [detailed scene description: "bustling Tokyo street at night with neon signs" / "minimalist white studio with soft box lighting" / "forest clearing with dappled sunlight"].
Preserve: subject identity, pose, outfit
Match: lighting direction, color temperature, perspective/camera height
Add: appropriate environmental reflections on subject (ambient light on skin, reflections in eyes)
Blend: subject's edges naturally, cast realistic shadows on new ground plane
```

#### 4.2 Object/Element Insertion into Scene
```
Add [object: "red sports car" / "cafe table with coffee cups" / "large houseplant"] to the scene [location: "to the left of the subject" / "in the background" / "foreground right"].
Preserve: existing composition and subject
Match: lighting, scale, perspective
Ensure: proper occlusion (what's in front/behind), cast shadows, surface reflections
Integration: blend naturally with existing color grading and depth of field
```

#### 4.3 Weather & Time-of-Day Shift
```
Transform the scene to [weather condition: "rainy with puddle reflections" / "golden hour sunset" / "overcast soft light" / "nighttime with street lamps"].
Preserve: subject identity and pose
Update: lighting on subject to match new conditions, background illumination, sky
Add: weather-specific elements (raindrops, lens flare, mist, streetlight glow)
Adjust: color temperature and mood appropriately
```

#### 4.4 Outpainting / Scene Extension
```
Extend the image [direction: "left and right" / "upward" / "all sides"] to reveal [context: "full room interior" / "surrounding landscape" / "crowd of people around subject"].
Maintain: existing subject, lighting, and perspective
Extrapolate: architecture/environment logically from visible clues
Ensure: seamless blend at original image boundaries
Add: contextually appropriate details in extended areas
```

---

### **CATEGORY 5: STYLE TRANSFER & ARTISTIC RENDERING**

#### 5.1 Comprehensive Style Translation
```
Recreate this scene in [target style: "Pixar 3D animation" / "Studio Ghibli watercolor" / "Sin City noir graphic novel" / "isometric video game art" / "oil painting impressionism"].
Preserve: subject identity, pose, composition
Translate to style: colors, textures, line work, shading technique, characteristic exaggerations
Maintain: readability and emotional tone
Reference: [if needed: "like the style of Hayao Miyazaki films" / "Unreal Engine 5 render quality"]
```

#### 5.2 Cartoon/Anime Conversion
```
Convert the subject to [specific style: "anime character (Studio Trigger style)" / "Disney 2D animation" / "Western cartoon (Adventure Time aesthetic)"].
Preserve: distinctive facial features translated to style
Adapt: proportions (if needed: larger eyes, simplified nose), line weights, shading approach
Background: [maintain and stylize / replace with simple color / detailed anime background]
Keep: personality and likeness recognizable in new style
```

#### 5.3 Material/Medium Transformation
```
Render the subject as if made of [material: "shining marble sculpture" / "colorful LEGO bricks" / "folded origami" / "clay animation figure" / "woven fabric tapestry"].
Show: material-specific properties (smoothness, texture, construction method, reflectivity)
Lighting: enhance material qualities (gloss on marble, matte on clay)
Background: [complementary display setting: "museum pedestal" / "craft table" / "art gallery"]
Preserve: recognizable silhouette and identity within material constraints
```

#### 5.4 Pencil/Sketch/Line Art
```
Convert to [line art style: "clean vector illustration" / "pencil sketch with shading" / "ink comic book line work" / "charcoal drawing"].
Line weight: [consistent / varied for depth / expressive]
Shading: [none / crosshatching / tonal gradient / stippling]
Background: [minimal linework / detailed / white/transparent]
Preserve: subject proportions and characteristic features
```

---

### **CATEGORY 6: SPECIAL EFFECTS & CREATIVE CONCEPTS**

#### 6.1 Real Object + Hand-Drawn Doodle Fusion
```
Merge the photographed [object/person] with hand-drawn doodles that [interaction: "climb on the subject" / "float around" / "interact with the real object's hands"].
Preserve: real object's lighting, shadows, texture
Integrate: doodles with proper scale, shadows cast by doodles, lighting on doodles matching scene
Style: [whimsical 2D cartoon / technical blueprint / children's crayon drawing]
Ensure: seamless blend of realism and illustration
```

#### 6.2 Product Visualization & Advertising
```
Create a [product type: "commercial advertisement shot" / "e-commerce product display" / "editorial magazine spread"] featuring [product].
Composition: [product placement, viewing angle]
Background: [explosive ingredient splash / clean gradient / lifestyle setting]
Lighting: dramatic, emphasizing product features
Additional elements: [flying ingredients / lifestyle props / text-free space for copy]
Style: [high-end luxury / energetic dynamic / minimal clean]
Brand colors: [specify if applicable]
```

#### 6.3 Miniature/Diorama Creation
```
Create a [scale] collectible figure/diorama of the subject.
Display: [clear acrylic case / glass bottle scene / museum display box / product card with die-cut hole]
Setting within display: [detailed environment: "beach sand with shells" / "urban street scene" / "fantasy landscape"]
Figure quality: [1/7 scale commercial quality / handcrafted artisan / 3D printed prototype]
Lighting: realistic shadows and reflections on display case
Accessories: [product card, brand logo, descriptive text if applicable]
```

#### 6.4 Isometric/3D Model Extraction
```
Extract the [building/object] from the scene and render as [output: "isometric building illustration (like SimCity/Theme Park)" / "clean 3D model on transparent background" / "technical exploded-view diagram"].
Style: [game asset / architectural diagram / technical illustration]
Viewing angle: [isometric 45° / front orthographic / three-quarter view]
Details: [simplified geometry / highly detailed / blueprint-style with dimensions]
Background: [transparent / clean gradient / grid]
```

#### 6.5 Tarot Card / Poster / Graphic Design
```
Design a [format: "tarot card" / "movie poster" / "retro travel poster" / "album cover"] featuring the subject.
Theme: [Gothic mystical / Art Deco / Minimalist modern / Retro 80s]
Include symbolic elements: [list relevant icons, objects, symbols]
Text areas: [title placeholder, decorative borders, ornate frames]
Color scheme: [moody darks / vibrant saturated / muted pastels]
Style: [illustration / photo-composite / vintage print]
Preserve: subject's identity as central focus
```

---

### **CATEGORY 7: FUNCTIONAL EDITING**

#### 7.1 Object Removal
```
Remove [object: "person in background" / "power lines" / "unwanted item"] from the scene.
Intelligently fill the removed area with: contextually appropriate content (extend background, replicate textures)
Preserve: lighting, perspective, image quality
Ensure: no visible artifacts or unnatural patterns
```

#### 7.2 Color Correction & Enhancement
```
Apply [adjustment: "color grading to cinematic teal-orange" / "black and white conversion with high contrast" / "vintage film look with grain" / "vibrant saturation boost"].
Preserve: subject identity and detail
Enhance: [specific aspect: "skin tones" / "sky drama" / "overall mood"]
Add if applicable: film grain, vignetting, color temperature shift
```

#### 7.3 Resolution Enhancement & Detail
```
Upscale and enhance image quality.
Increase: sharpness, detail in textures (fabric, skin, hair)
Reduce: noise, compression artifacts
Preserve: natural look, avoid over-sharpening or AI hallucination of details
Target quality: [print-ready / high-resolution digital display]
```

#### 7.4 Subject Extraction (Background Removal)
```
Extract the subject cleanly with transparent background.
Edge quality: [soft natural edge / sharp precise cutout]
Include: fine details (hair strands, fabric texture edges)
Remove: all background elements completely
Output: subject on transparent layer, suitable for compositing
```

---

### **CATEGORY 8: SPECIALTY APPLICATIONS**

#### 8.1 Medical/Educational Diagrams
```
Generate [anatomical/educational content: "3D heart model with labeled chambers" / "botanical diagram of plant life cycle" / "physics concept visualization"].
Style: [academic illustration / 3D render / simplified infographic]
Include: clear labels with leader lines, annotations explaining [key concepts]
Color coding: [if applicable for different parts/stages]
Accuracy: scientifically/technically accurate representation
Clarity: optimized for presentation and learning
```

#### 8.2 Makeup Application Transfer
```
Apply the makeup look from Image 2 to the subject in Image 1.
Transfer: eye shadow colors/style, lip color, contouring, blush placement, eyebrow shape
Preserve: subject's identity, pose, background, hair
Match: makeup intensity and finish (matte/glossy)
Adjust: for subject's unique facial structure and skin tone
```

#### 8.3 Comic Book / Graphic Novel Creation
```
Create a [panel count]-panel comic strip with the subject.
Story: [brief plot description]
Panel layout: [traditional grid / dynamic overlapping / manga-style]
Style: [superhero comics / manga / indie graphic novel / newspaper strip]
Include: speech bubbles (placeholder text), action lines, sound effects
Subject: maintain identity across panels, show emotional range
Backgrounds: [detailed / simplified / speed lines]
```

#### 8.4 Information Overlay (AR Style)
```
Add augmented reality style information overlays to the scene.
Display: [labels, measurements, data visualizations, directional arrows, highlighted areas]
Style: [futuristic HUD / technical blueprint / instructional diagram / game UI]
Information type: [specify what data to show]
Visual treatment: [holographic translucent / solid graphics / line-art annotations]
Preserve: original image visible beneath overlays
```

#### 8.5 Cross-Perspective Generation
```
Transform the view to [new perspective: "top-down aerial view" / "first-person POV from subject's eyes" / "security camera angle" / "drone shot from above"].
Extrapolate: spatial information from single view intelligently
Preserve: subject identity and scene context
Add: appropriate environmental context for new viewpoint
Maintain: lighting logic and scale
```

#### 8.6 Historical Photo Colorization
```
Colorize this black and white/sepia photograph.
Research-accurate colors for: [era-specific clothing, vehicles, environments]
Skin tones: natural and historically appropriate
Preserve: grain, texture, vintage quality of original
Add: subtle color without over-saturation
Maintain: contrast and tonal values from original
```

#### 8.7 Infographic from Text/Data
```
Convert [article/data/text content] into a visual infographic.
Layout: [vertical flow / grid / circular / timeline]
Include: key statistics, main points, visual metaphors
Style: [modern flat / isometric / illustrated / corporate clean]
Color scheme: [specify or brand-appropriate]
Text: translate to English, extract key information, hierarchical typography
Graphics: icons, charts, decorative elements supporting content
```

---

## 🔐 Identity Preservation Framework

### **Tier 1: Absolute Identity Lock (Use for Multi-Variation Series)**
```
IDENTITY PRESERVATION PROTOCOL:
- Facial structure: EXACT match (eyes, nose, mouth, jawline, cheekbones, chin)
- Biometric features: EXACT match (eye color, pupil size, iris pattern, skin tone, facial proportions)
- Hair: IDENTICAL (color, length, style, texture, hairline)
- Age and morphology: UNCHANGED
- Unique markers: PRESERVE (moles, freckles, scars, beauty marks)
- Head-to-body ratio: CONSISTENT
- Camera perspective relative to subject: MAINTAIN
```

### **Tier 2: Flexible Identity (Allows Minor Natural Variations)**
```
Preserve core identity:
- Maintain recognizable facial features and structure
- Keep subject's distinctive characteristics
- Allow: natural expression changes, slight angle variations, age-appropriate adaptations
- Preserve: overall likeness and personality essence
```

### **Tier 3: Identity Essence (Character Type Preservation)**
```
Preserve character archetype:
- General appearance category (gender presentation, age range, build)
- Style and aesthetic vibe
- Allow: significant stylization, artistic interpretation
- Maintain: recognizable "spirit" of the subject
```

---

## 🎨 Realism & Technical Quality Standards

### **Lighting Standards**
```
Lighting Specification:
- Direction: [specify: "soft box from upper left" / "natural sunlight from right" / "dramatic side lighting" / "evenly lit studio"]
- Quality: [hard/soft, diffused/direct]
- Color temperature: [warm 3200K / neutral 5600K / cool 6500K / golden hour 2500K]
- Shadows: [soft and subtle / defined with hard edges / absent for flat lighting]
- Highlights: avoid clipping, preserve texture in bright areas
- Ambient: specify fill light or reflected light if relevant
```

### **Perspective & Composition Standards**
```
Camera Specifications:
- Lens: [wide angle 24mm / normal 50mm / portrait 85mm / telephoto 200mm / fisheye]
- Height: [eye level / high angle / low angle / overhead / worm's eye view]
- Distance: [close-up / medium shot / full body / environmental / extreme close-up]
- Depth of field: [shallow bokeh / deep focus / specific f-stop equivalent]
- Framing: [rule of thirds / centered / dynamic diagonal / symmetrical]
```

### **Anatomical Accuracy Standards**
```
Human Anatomy Check:
- Proportions: realistic head-to-body ratio (1:7 to 1:8 for adults)
- Hands: correct finger count, natural joint bending, proper thumb opposition
- Feet: anatomically correct, appropriate perspective foreshortening
- Joints: natural range of motion, no impossible angles
- Posture: believable weight distribution and balance
- Face: bilateral symmetry (with natural subtle asymmetries), correct eye alignment
```

### **Material & Texture Standards**
```
Material Rendering:
- Specify: [matte/glossy/metallic/translucent/rough]
- Fabric behavior: natural drape, wrinkle patterns, appropriate weight
- Surface properties: reflectivity, subsurface scattering for skin, displacement for textures
- Environmental interaction: how materials respond to scene lighting
```

### **Integration & Blending Standards**
```
Composite Quality:
- Edge treatment: soft natural transitions, no harsh cutout lines
- Color harmony: unified color grading across all elements
- Atmospheric perspective: distant elements appropriately hazed/desaturated
- Shadow consistency: all elements cast shadows in same direction with matching softness
- Reflection/ambient: new elements receive and cast light like original elements
```

---

## 🔧 Advanced Techniques

### **Multi-Image Fusion Hierarchy**
```
When combining [N] reference images:

PRIMARY REFERENCE (Image 1):
- Use for: main subject identity, pose foundation, primary lighting
- Priority: highest

SECONDARY REFERENCE (Image 2):
- Use for: outfit/accessory details, secondary character, style elements
- Integration: harmonize with primary subject's lighting and perspective

TERTIARY REFERENCES (Images 3, 4...):
- Use for: background elements, environmental details, color palette inspiration
- Integration: support primary and secondary without competing for focus

Conflict Resolution:
- If references contradict: explicitly state which takes precedence
- Example: "Use Image 1 face, Image 2 outfit, Image 3 background"
```

### **Iterative Editing Workflow**
```
STAGE 1 - FOUNDATION (Prompt 1):
[Make primary change with minimal constraints]

STAGE 2 - REFINEMENT (Prompt 2):
"Using the previous result, now [adjust specific aspect].
Preserve everything else exactly."

STAGE 3 - POLISH (Prompt 3):
"Enhance [technical quality aspect: resolution/lighting/detail].
No content changes, only quality improvement."

STAGE 4 - FINAL TOUCHES (Prompt 4):
"Add [subtle final elements: atmospheric effects/color grade/minor details]."
```

### **Negative Prompting (Avoidance Specification)**
```
Exclusion Directives:
- "Do NOT alter [specific elements]"
- "Remove [unwanted elements] completely"
- "Avoid [style/look]: no [examples of what to avoid]"
- "Exclude [anachronisms / modern objects / specific colors]"

Examples:
- "Do NOT change facial features or add makeup"
- "Remove all text, logos, and watermarks"
- "Avoid oversaturation and excessive contrast"
- "Exclude modern objects like phones, cars, buildings"
```

### **Prompt Chaining for Complex Outcomes**
```
CHAIN EXAMPLE - Historical Portrait Series:

Prompt 1: "Generate clean background-removed subject"
↓
Prompt 2: "Place subject in [era] setting with period costume"
↓
Prompt 3: "Add [era]-appropriate lighting and color grading"
↓
Prompt 4: "Apply [artistic style] while preserving photorealism"
↓
Prompt 5: "Add [final details: props, environmental elements]"
```

---

## 📊 Quality Assurance Checklist

Before finalizing any prompt, verify:

- [ ] **Identity preservation**: Explicitly stated what maintains consistency
- [ ] **Technical specifications**: Lighting, perspective, lens type mentioned if critical
- [ ] **Material properties**: Textures and surface treatments specified
- [ ] **Spatial relationships**: Occlusions, depth, and scaling addressed
- [ ] **Style consistency**: Unified aesthetic across all elements
- [ ] **Anatomical plausibility**: Human figures have correct proportions and poses
- [ ] **Integration quality**: Composites have matching lighting and color grading
- [ ] **Output clarity**: Prompt is unambiguous and action-oriented
- [ ] **Exclusions stated**: What NOT to change is as important as what to change
- [ ] **Reference hierarchy**: Priority order clear when using multiple images

---

## ⚠️ Common Pitfalls & Solutions

| Problem | Cause | Solution |
|---------|-------|----------|
| **Identity drift across variations** | Insufficient identity constraints | Use Tier 1 Identity Lock protocol explicitly |
| **Lighting mismatch in composites** | No lighting direction specified | Always state light source position and quality |
| **Unnatural pose/anatomy** | Overcomplicated pose description | Use reference image for pose OR simplify to basic action |
| **Flat, lifeless composition** | Missing camera/lens specifications | Add focal length, DoF, and camera angle details |
| **Style inconsistency** | Multiple conflicting style references | Establish single primary style, others as accents only |
| **Oversaturated or blown highlights** | No color/exposure guidance | Request "balanced exposure, preserved highlights, natural saturation" |
| **Obvious AI artifacts** | Overly complex prompt confusing model | Simplify prompt, break into multiple steps |
| **Background doesn't match subject lighting** | Separate elements not integrated | Add "match lighting direction and color temperature to subject" |
| **Lost fine details (hair, fabric)** | Prompt focused on macro changes only | Explicitly request "preserve fine details and textures" |
| **Repeated/tiled patterns in backgrounds** | Model extrapolating without enough context | Provide more specific background description or reference |

---

## 🎯 Context-Specific Best Practices

### **For E-Commerce / Product Photography:**
- Always specify: clean background OR lifestyle context
- Lighting: evenly lit, minimal shadows unless dramatic style
- Perspective: straight-on or slight angle, not extreme
- Include: "product-focused, commercial quality, sharp details"

### **For Character Design / Concept Art:**
- Emphasize: multiple views, consistent proportions
- Include: scale reference, color palette
- Specify: level of detail (simplified vs. highly detailed)
- Request: "model sheet format" or "turnaround sheet"

### **For Social Media Content:**
- Consider: aspect ratio (9:16 for stories, 1:1 for feed, 16:9 for landscape)
- Style: vibrant, high contrast for attention
- Include: space for text overlay if needed
- Request: "Instagram-ready" or "TikTok style"

### **For Professional/Editorial:**
- Emphasize: natural realism, subtle editing
- Lighting: flattering but realistic
- Avoid: over-processing, heavy filters
- Request: "magazine quality, editorial realism"

### **For Creative/Artistic Projects:**
- Freedom to specify: unconventional perspectives, extreme styles
- Emphasize: artistic vision over realism if desired
- Can request: "prioritize creative impact over photorealism"

---

## 📝 Quick Reference: Prompt Modifiers

### **Quality & Detail Modifiers:**
- "highly detailed", "extremely fine detail", "8K quality", "photorealistic", "hyperrealistic"
- "clean and sharp", "crisp focus", "professional photography quality"

### **Lighting Descriptors:**
- "soft diffused lighting", "dramatic side lighting", "golden hour glow", "studio lighting"
- "rim light", "backlit", "chiaroscuro", "flat even lighting", "high key", "low key"

### **Style Keywords:**
- "cinematic", "editorial", "commercial", "artistic", "minimalist", "maximalist"
- "vintage", "modern", "futuristic", "retro", "contemporary", "classic"

### **Mood & Atmosphere:**
- "moody", "dreamy", "energetic", "calm", "mysterious", "playful", "elegant"
- "dramatic", "intimate", "grand", "cozy", "sterile", "warm", "cool"

### **Composition Terms:**
- "centered composition", "rule of thirds", "leading lines", "symmetrical"
- "dynamic angle", "overhead view", "worm's eye view", "Dutch angle"

### **Material Descriptors:**
- "matte finish", "glossy", "metallic sheen", "soft fabric", "rough texture"
- "smooth", "bumpy", "polished", "weathered", "pristine", "aged"

---

## 🚀 Claude Code Integration Guidelines

### **When generating prompts automatically:**

1. **Parse user intent** into category (identity work, pose edit, style transfer, etc.)
2. **Select appropriate template** from this rule file
3. **Fill template variables** with user-specific details
4. **Add identity locks** automatically based on context
5. **Include technical specs** (lighting, perspective) when relevant
6. **Output clean, formatted prompt** ready for Gemini API

### **Example Claude Code Workflow:**
```python
# User: "Make me look like I'm in the 1920s"

# Claude Code interprets as: Temporal Transformation
# Selects: Template 1.2 from CATEGORY 1
# Fills: era="1920s", adds period-specific details
# Outputs formatted prompt:

"""
Transform the subject to 1920s era.
Preserve facial identity exactly (eyes, nose, mouth structure, jawline).
Update: clothing (flapper dress or dapper suit), hairstyle (finger waves or slicked back), 
accessories (cloche hat, pearl necklace, pocket watch), background (art deco interior).
Period-accurate elements: sepia tone color grading, soft focus, vintage photograph aesthetic.
Remove all modern anachronisms.
"""
```

### **Prompt Validation Checklist (for Claude Code):**
```python
def validate_nano_banana_prompt(prompt):
    checks = {
        'has_action_verb': check_for(['generate', 'change', 'apply', 'transform', 'create']),
        'has_subject_reference': check_for(['subject', 'person', 'character', 'image']),
        'has_preservation_clause': check_for(['preserve', 'maintain', 'keep']),
        'clear_and_concise': len(prompt.split()) < 150,  # Optimal under 150 words
        'no_ambiguity': not contains(['maybe', 'try to', 'if possible', 'somewhat'])
    }
    return all(checks.values())
```

---

## 📚 Reference: Example Prompt Patterns by Use Case

### **Pattern: Simple Attribute Change**
```
Change [attribute] to [new value].
Preserve: [everything else].
```

### **Pattern: Multi-Element Fusion**
```
Combine [element A from image 1] with [element B from image 2] in [setting].
Primary reference: [which image for conflicts].
Maintain: [consistency requirements].
```

### **Pattern: Style Adaptation**
```
Recreate in [style].
Preserve: [identity/composition].
Translate: [what changes for style].
Reference: [style examples if needed].
```

### **Pattern: Additive Editing**
```
Add [element] to [location in scene].
Integrate naturally: [lighting/perspective/scale].
Preserve: [existing elements].
```

### **Pattern: Subtractive Editing**
```
Remove [element].
Fill with: [replacement content type].
Maintain: [surrounding context].
```

---

## 🔄 Version History & Updates

- **v2.0** (Current): Enhanced with 68+ use cases from Awesome-Nano-Banana-images repo, added Claude Code integration guidelines, expanded templates to 8 major categories with 40+ specific templates
- **v1.0** (Original): Basic prompt patterns and philosophy

---

## 📖 Additional Resources

- **Nano-consistent-150K Dataset**: 150,000+ samples showing 35+ variations per identity
- **GitHub Repository**: [Awesome-Nano-Banana-images](https://github.com/PicoTrex/Awesome-Nano-Banana-images)
- **Model**: `gemini-2.5-flash-image` via Gemini API, Google AI Studio, or Vertex AI
- **Community**: Twitter/X #NanoBanana, Reddit r/GoogleGemini

---

*This rule file is designed for Claude Code to generate optimal prompts for Nano Banana (Gemini 2.5 Flash Image). Always adapt templates to specific use cases while maintaining core principles of identity preservation, clarity, and technical precision.*

**END OF RULE FILE** 🍌
