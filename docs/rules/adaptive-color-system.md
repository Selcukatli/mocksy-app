# Adaptive Color System with Fast-Average-Color

## Overview

This pattern uses `fast-average-color` to extract dominant colors from images and create beautiful, adaptive UI elements with proper text contrast. It's used for featured app cards, app detail pages, and any component that needs to blend seamlessly with image content.

## Core Hook: `useDominantColor`

### Location
`src/hooks/useDominantColor.ts`

### What It Does
1. Extracts the dominant color from an image URL
2. Calculates brightness using standard luminance formula: `(R × 299 + G × 587 + B × 114) / 1000`
3. Returns:
   - `color`: RGBA string for backgrounds (with 0.85 opacity)
   - `isLight`: Boolean indicating if background is light (brightness > 180)
   - `isLoading`: Boolean for loading state

### Smart Color Boosting
The hook includes intelligent color handling:
- If color is too dark (brightness < 50), it tries to find a more vibrant color
- Falls back to boosting the original color by 2.5x if no better option exists
- Ensures colors are always visible and vibrant

### Usage Example

```typescript
const { color: dominantColor, isLight: isLightBackground, isLoading } = useDominantColor(
  imageUrl
);
```

## Pattern 1: Featured Carousel with Image Blending

### Use Case
Large featured cards that blend a cover image into a solid color background, with app info overlaid at the bottom.

### Implementation (`FeaturedAppsCarousel.tsx`)

```typescript
// 1. Extract color and brightness
const { color: dominantColor, isLight: isLightBackground } = useDominantColor(
  currentApp?.coverImageUrl || currentApp?.iconUrl
);

// 2. Container with dominant color background
<div 
  className="relative w-full rounded-3xl border shadow-xl overflow-hidden"
  style={{
    background: dominantColor || 'rgba(0, 0, 0, 0.85)',
  }}
>
  {/* 3. Cover image with gradient fade */}
  <div className="relative w-full h-[360px] md:h-[440px]">
    <motion.div
      className="absolute inset-0"
      style={{
        maskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
      }}
    >
      <Image src={coverImageUrl} fill className="object-cover" />
    </motion.div>
  </div>
  
  {/* 4. App info with adaptive text colors */}
  <div className="relative px-6 py-4 -mt-6">
    <h2 className={`text-2xl font-bold ${isLightBackground ? 'text-gray-900' : 'text-white'}`}>
      {appName}
    </h2>
    <p className={`text-sm ${isLightBackground ? 'text-gray-800' : 'text-white/90'}`}>
      {description}
    </p>
  </div>
</div>
```

### Key Techniques

#### 1. Image Fade with CSS Masks (The Blending Magic)

This is the core technique that creates the seamless blend from image to solid color.

**The Problem We're Solving:**
When you place an image above a colored background, you get a hard edge. We want a smooth, natural transition where the image gradually fades into the background color.

**The Solution: CSS Mask with Linear Gradient**

```jsx
<div className="relative w-full h-[360px]">
  <div 
    className="absolute inset-0"
    style={{
      maskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
    }}
  >
    <Image src={coverImageUrl} fill className="object-cover" />
  </div>
</div>
```

**How It Works:**

CSS masks define which parts of an element are visible:
- **Black in the mask** = Fully visible (opacity: 1)
- **Transparent in the mask** = Fully hidden (opacity: 0)
- **Gradients** = Smooth transition between visible and hidden

Our gradient breakdown:
```
black 0%      → Top of image is 100% visible
black 65%     → Image stays fully visible until 65% down
transparent 100% → Bottom of image fades to invisible
```

**Visual Effect:**
```
┌─────────────────────┐
│ ████████████████████ │ 0%  - Solid image
│ ████████████████████ │
│ ████████████████████ │ 65% - Still solid
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │     - Fade begins
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │
│ ░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░ │ 100% - Transparent
└─────────────────────┘
      ↓ Color shows through ↓
█████████████████████████ Solid background color
```

**Why Not Use `opacity`?**

Using `opacity` on the entire image would fade everything including the top:
```jsx
// ❌ Wrong approach - fades entire image uniformly
<Image src={url} style={{ opacity: 0.5 }} />
```

CSS mask lets us control **exactly where** the fade happens:
```jsx
// ✅ Right approach - only fades bottom portion
<div style={{ maskImage: 'linear-gradient(...)' }}>
  <Image src={url} />
</div>
```

**Browser Compatibility:**

```jsx
style={{
  maskImage: 'linear-gradient(...)',        // Standard
  WebkitMaskImage: 'linear-gradient(...)',  // Safari/Webkit
}}
```

Both properties are needed for cross-browser support. Safari requires the `-webkit-` prefix.

**Customizing the Blend:**

You can adjust the gradient stops to change the blend effect:

```jsx
// Longer fade (more gradual)
maskImage: 'linear-gradient(to bottom, black 0%, black 50%, transparent 100%)'

// Shorter fade (more abrupt)
maskImage: 'linear-gradient(to bottom, black 0%, black 80%, transparent 100%)'

// Symmetric fade (top and bottom)
maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)'
```

Our default of `black 65%` provides the best balance:
- Enough image visible to understand the content
- Smooth transition that feels natural
- Enough solid color for text legibility

#### 2. Complete Blend Stack (How It All Comes Together)

Here's the complete visual stack from bottom to top:

```
┌─────────────────────────────────────┐
│ 5. Text/Icon Layer (white or dark) │ ← Adaptive text colors
├─────────────────────────────────────┤
│ 4. Solid Color Section (-mt-6)     │ ← Dominant color background
├─────────────────────────────────────┤
│ 3. Transparent Fade Zone            │ ← Image blending to invisible
├─────────────────────────────────────┤
│ 2. Visible Image Content            │ ← Masked image
├─────────────────────────────────────┤
│ 1. Container Background             │ ← Dominant color (shows through)
└─────────────────────────────────────┘
```

**In Code:**
```jsx
<div style={{ background: dominantColor }}>  {/* Layer 1: Container */}
  
  {/* Layer 2-3: Masked Image */}
  <div className="relative w-full h-[360px]">
    <div style={{ maskImage: 'linear-gradient(...)' }}>
      <Image src={coverImageUrl} fill />
    </div>
  </div>
  
  {/* Layer 4: Solid Color Section with Text */}
  <div className="relative px-6 py-4 -mt-6">  {/* Overlaps image */}
    {/* Layer 5: Content */}
    <h2 className={isLightBackground ? 'text-gray-900' : 'text-white'}>
      App Name
    </h2>
  </div>
</div>
```

**The Magic Moment:**
When the image fades to transparent (Layer 3), the container's dominant color (Layer 1) shows through seamlessly. Since Layer 4 also uses the same dominant color, it appears as one continuous background - the image naturally blends into the solid color section!

#### 3. Negative Margin Overlap
```css
className="relative px-6 py-4 -mt-6"
```
- `-mt-6` pulls info section up over the image
- Creates depth and layering
- Info section sits on solid background color

#### 4. Adaptive Text Colors
```typescript
className={`${isLightBackground ? 'text-gray-900' : 'text-white'}`}
```
- Light backgrounds (brightness > 180): Use dark text
- Dark backgrounds: Use white/light text
- Ensures WCAG contrast compliance

## Pattern 2: App Detail Page with Cover

### Use Case
Full-width app detail cards with cover image, icon, and metadata overlaid.

### Implementation (`AppStorePreviewCard.tsx`)

```typescript
// 1. Extract color
const { color: dominantColor, isLight: isLightBackground } = useDominantColor(
  app.coverImageUrl
);

// 2. Card with dominant color
<div 
  className="rounded-xl overflow-hidden shadow-md"
  style={{
    background: dominantColor || 'rgba(0, 0, 0, 0.85)',
  }}
>
  {/* 3. Cover image with fade */}
  <div className="relative w-full aspect-video">
    <div 
      className="absolute inset-0"
      style={{
        maskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
      }}
    >
      <Image src={coverImageUrl} fill className="object-cover" />
    </div>
  </div>
  
  {/* 4. App header overlaid at bottom */}
  <div className="relative p-6 flex items-center gap-5 -mt-16">
    {/* App icon with elevation */}
    <div className="relative h-24 w-24 rounded-[22%] bg-white shadow-2xl ring-2 ring-white/30">
      <Image src={iconUrl} fill />
    </div>
    
    {/* Adaptive text */}
    <div className="flex-1">
      <h1 className={`text-3xl font-bold ${isLightBackground ? 'text-gray-900' : 'text-white'}`}>
        {appName}
      </h1>
      <p className={`text-lg ${isLightBackground ? 'text-gray-800' : 'text-white/90'}`}>
        {category}
      </p>
    </div>
  </div>
</div>
```

## Pattern 3: Adaptive Interactive Elements

### Buttons
```typescript
<button
  className={`px-5 py-2 rounded-full text-sm font-semibold ${
    isLightBackground 
      ? 'bg-gray-900 text-white hover:bg-gray-800' 
      : 'bg-white text-black hover:bg-white/90'
  }`}
>
  View Details
</button>
```

### Pagination Dots
```typescript
<button
  className={`h-2 rounded-full transition-all ${
    index === currentIndex
      ? isLightBackground ? 'w-6 bg-gray-900' : 'w-6 bg-white'
      : isLightBackground ? 'w-2 bg-gray-900/30' : 'w-2 bg-white/30'
  }`}
/>
```

### Navigation Arrows
```typescript
<button
  className={`p-2 rounded-full backdrop-blur-sm border ${
    isLightBackground 
      ? 'bg-gray-900/90 hover:bg-gray-900 text-white' 
      : 'bg-white/90 hover:bg-white'
  }`}
>
  <ChevronLeft className="w-5 h-5" />
</button>
```

### Loading Skeletons
```typescript
<div className={`h-8 w-48 rounded animate-pulse ${
  isLightBackground ? 'bg-gray-900/20' : 'bg-white/20'
}`} />
```

## Color Token Reference

### For Dark Backgrounds
- **Primary text**: `text-white`
- **Secondary text**: `text-white/90`
- **Buttons**: `bg-white text-black`
- **Dots/indicators**: `bg-white` (active), `bg-white/30` (inactive)
- **Skeletons**: `bg-white/20`

### For Light Backgrounds
- **Primary text**: `text-gray-900`
- **Secondary text**: `text-gray-800`
- **Buttons**: `bg-gray-900 text-white`
- **Dots/indicators**: `bg-gray-900` (active), `bg-gray-900/30` (inactive)
- **Skeletons**: `bg-gray-900/20`

## Brightness Threshold

The system uses **180** as the brightness threshold:
```typescript
setIsLight(brightness > 180)
```

### Why 180?
- Standard perceptual brightness formula
- Tested against WCAG AA contrast requirements
- Works well for both vibrant and pastel colors
- Balances false positives/negatives

### Brightness Formula
```typescript
const brightness = (r * 299 + g * 587 + b * 114) / 1000;
```
This weighs green highest (human eyes are most sensitive to green), followed by red, then blue.

## Best Practices

### 1. Always Provide Fallbacks
```typescript
style={{
  background: dominantColor || 'rgba(0, 0, 0, 0.85)',
}}
```

### 2. Use Consistent Opacity
- Background colors: `0.85` opacity
- Overlays: `0.9` opacity for buttons/controls
- Inactive elements: `0.3` opacity

### 3. Add Drop Shadows for Legibility
```typescript
className="text-white drop-shadow-lg"
```
Helps text remain readable even during image transitions.

### 4. Test with Various Images
- Very light (pastels, white backgrounds)
- Very dark (black, deep blues)
- High contrast (bright colors)
- Low saturation (grays, muted tones)

### 5. Animate Color Transitions
```typescript
<motion.div
  key={currentApp._id}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.6 }}
>
```
Smooth transitions prevent jarring color changes.

## Common Pitfalls

### ❌ Don't: Hardcode Text Colors
```typescript
// Bad - doesn't adapt
<h1 className="text-white">Title</h1>
```

### ✅ Do: Use Conditional Classes
```typescript
// Good - adapts to background
<h1 className={isLightBackground ? 'text-gray-900' : 'text-white'}>
  Title
</h1>
```

### ❌ Don't: Forget Loading States
```typescript
// Bad - assumes color exists
style={{ background: dominantColor }}
```

### ✅ Do: Provide Fallbacks
```typescript
// Good - handles undefined state
style={{ background: dominantColor || 'rgba(0, 0, 0, 0.85)' }}
```

### ❌ Don't: Use Only Dominant Color
```typescript
// Bad - may be too dark/light
const { color } = useDominantColor(imageUrl);
```

### ✅ Do: Get Both Color and Brightness
```typescript
// Good - enables adaptive UI
const { color, isLight } = useDominantColor(imageUrl);
```

## Implementation Checklist

When implementing this pattern:

- [ ] Import `useDominantColor` hook
- [ ] Extract both `color` and `isLight` properties
- [ ] Apply dominant color to container background
- [ ] Use CSS mask for image fade gradient
- [ ] Implement negative margin for info overlay
- [ ] Add conditional text colors based on `isLight`
- [ ] Update buttons, dots, arrows to match
- [ ] Add drop-shadow for text legibility
- [ ] Provide fallback colors
- [ ] Test with light and dark images
- [ ] Add smooth transitions between states

## Real-World Examples

### Example 1: Hello Kitty App (Light Background)
- Cover image: Pastel pink/blue
- Detected: Light background
- Applied: Dark text (`text-gray-900`)
- Result: Perfect contrast, highly readable

### Example 2: PixelChronos App (Dark Background)
- Cover image: Teal/cyan
- Detected: Dark background
- Applied: White text (`text-white`)
- Result: Vibrant, high contrast

### Example 3: Ottoman Tales App (Mixed)
- Cover image: Beige/tan
- Detected: Light background
- Applied: Dark text and buttons
- Result: Warm, inviting, readable

## Integration with Component Library

This pattern works seamlessly with:
- **Framer Motion**: Animate color transitions
- **Tailwind CSS**: Conditional utility classes
- **Next.js Image**: Optimized image loading
- **ShadCN UI**: Button and popover components

## Performance Considerations

### Image Loading
- Hook uses `crossOrigin: 'Anonymous'` for CORS
- Supports Convex file storage URLs
- Cleans up on unmount with `fac.destroy()`

### Caching
- Fast-average-color is lightweight (<10KB)
- Color extraction happens once per image
- Results memoized by React state

### Accessibility
- Maintains WCAG AA contrast ratios
- Works with system dark mode
- Screen readers unaffected

## Future Enhancements

Potential improvements to consider:
- Cache dominant colors in database
- Pre-calculate during image upload
- Support for gradient backgrounds
- Custom brightness thresholds per component
- Animation between color states
- User preference overrides

## Related Documentation

- `docs/learnings/shadcn-integration.md` - UI component patterns
- `docs/rules/route-navigation-patterns.mdc` - Page transition patterns
- `src/hooks/useDominantColor.ts` - Hook implementation
- `src/components/FeaturedAppsCarousel.tsx` - Featured carousel example
- `src/components/AppStorePreviewCard.tsx` - Detail page example

## Questions or Issues?

When implementing this pattern, consider:
- What's the primary content? (image or text)
- Should the entire card use the color?
- How much of the image should be visible?
- What interactive elements need adaptation?
- Are there branding color requirements?

