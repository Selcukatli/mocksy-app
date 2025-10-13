# Structured Design System

## Overview

The BAML app concept generator now returns structured design system data in addition to the text-based `style_description`. This makes it easier to programmatically access and use design tokens in code.

## What's New

### BAML Schema (`baml_src/app-concepts.baml`)

Three new structured classes:

```baml
class StyleColors {
  primary string        // e.g., '#7EC8B8' - buttons, CTAs, accents
  background string     // e.g., '#FFFFFF' - main canvas
  text string          // e.g., '#2C3E50' - body text and headlines
  accent string        // e.g., '#E8F5F2' - cards, highlights, secondary elements
}

class StyleTypography {
  headlineFont string    // e.g., 'SF Pro Display'
  headlineSize string    // e.g., '28px'
  headlineWeight string  // e.g., '700'
  bodyFont string        // e.g., 'SF Pro Text'
  bodySize string        // e.g., '16px'
  bodyWeight string      // e.g., '400'
}

class StyleEffects {
  cornerRadius string       // e.g., '12px' - border radius
  shadowStyle string        // e.g., '0px 2px 8px rgba(0,0,0,0.1)'
  designPhilosophy string   // e.g., 'Clean minimal interface with generous whitespace'
}
```

### Updated AppConcept

The `AppConcept` class now includes:

```baml
class AppConcept {
  app_name string
  app_subtitle string
  app_description string
  app_category string
  
  // New structured fields
  colors StyleColors
  typography StyleTypography
  effects StyleEffects
  
  // Existing field (still used)
  style_description string
  
  app_icon_prompt string
  cover_image_prompt string
}
```

## Usage Example

### TypeScript/Convex

```typescript
import { api } from "@convex/_generated/api";
import type { AppConcept } from "../baml_client";

// After generating concepts
const result = await b.GenerateAppConcepts(
  "A fitness app that gamifies workouts",
  "Health & Fitness"
);

const concept = result.concepts[0];

// Access structured design tokens
console.log("Primary Color:", concept.colors.primary);        // '#7EC8B8'
console.log("Background:", concept.colors.background);        // '#FFFFFF'
console.log("Text Color:", concept.colors.text);              // '#2C3E50'
console.log("Accent Color:", concept.colors.accent);          // '#E8F5F2'

console.log("Headline Font:", concept.typography.headlineFont);    // 'SF Pro Display'
console.log("Headline Size:", concept.typography.headlineSize);    // '28px'
console.log("Body Font:", concept.typography.bodyFont);            // 'SF Pro Text'
console.log("Body Size:", concept.typography.bodySize);            // '16px'

console.log("Corner Radius:", concept.effects.cornerRadius);       // '12px'
console.log("Shadow:", concept.effects.shadowStyle);               // '0px 2px 8px rgba(0,0,0,0.1)'
console.log("Philosophy:", concept.effects.designPhilosophy);      // 'Clean minimal interface...'

// The existing text description is still available
console.log("Full Style Guide:", concept.style_description);
```

### Potential Use Cases

1. **Automated UI Generation**: Use the structured tokens to generate CSS or styled-components
2. **Design System Export**: Convert to a design system format (e.g., design tokens JSON)
3. **Validation**: Ensure color contrast ratios meet accessibility standards
4. **Consistency Checking**: Validate that all designs use the specified tokens
5. **Preview Generation**: Automatically generate style preview cards using the tokens

### Example: Generating CSS

```typescript
function generateCSS(concept: AppConcept): string {
  return `
    :root {
      --color-primary: ${concept.colors.primary};
      --color-background: ${concept.colors.background};
      --color-text: ${concept.colors.text};
      --color-accent: ${concept.colors.accent};
      
      --font-headline: ${concept.typography.headlineFont};
      --font-headline-size: ${concept.typography.headlineSize};
      --font-headline-weight: ${concept.typography.headlineWeight};
      
      --font-body: ${concept.typography.bodyFont};
      --font-body-size: ${concept.typography.bodySize};
      --font-body-weight: ${concept.typography.bodyWeight};
      
      --corner-radius: ${concept.effects.cornerRadius};
      --shadow: ${concept.effects.shadowStyle};
    }
  `;
}
```

## Backward Compatibility

- The existing `style_description` field is **still present** and **still used** by the current codebase
- All existing functionality continues to work unchanged
- The structured fields are **additive** - they provide additional structured data alongside the text description
- Future features can leverage the structured data without breaking existing code

## Next Steps

Possible future enhancements:

1. Store structured design tokens in the Convex database
2. Use tokens to generate preview cards automatically
3. Enable design token editing in the UI
4. Export design systems to Figma/Sketch format
5. Validate accessibility (e.g., WCAG color contrast)
6. Create design token inheritance for variants

