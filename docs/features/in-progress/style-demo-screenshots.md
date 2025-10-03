# Style Demo Screenshot Generation

## Overview

When a style is generated, automatically create a demo screenshot set that showcases the style with a fictional app concept. This provides visual previews of how the style looks in practice without requiring real app screens.

## Architecture

### Data Model

Demo screenshots are persisted as real database records with special flags:

```
Style → Demo App → Demo Screenshot Set → Demo Screenshots
  ↓         ↓              ↓                    ↓
styles   apps      screenshotSets        screenshots
         (isDemo)                        (using appScreens)
```

**Key Relationships:**
- `styles.demoAppId` → `apps._id` (optional, links to currently selected demo app)
- `styles.demoSetId` → `screenshotSets._id` (optional, links to currently selected demo set)
- `apps.isDemo` → `boolean` (marks this as AI-generated demo)
- **Note:** No bidirectional link from apps → styles. Demo apps are reusable across multiple styles.

### Flow

```
1. User creates style
   ↓
2. generateStyleFromDescription (styleActions.ts)
   ↓
3. BAML generates style config (existing)
   ↓
4. Generate device reference + preview card (existing)
   ↓
5. NEW: BAML GenerateStyleDemoScreenshots
   - Input: StyleConfig + style name
   - Output: App concept + 3-5 screenshot configs
   ↓
6. NEW: Create demo app record (apps table, isDemo: true)
   ↓
7. NEW: Generate app UI screens from BAML prompts
   - Use Gemini Flash text-to-image
   - Upload to storage
   - Create appScreens records
   ↓
8. NEW: Create demo screenshot set record
   ↓
9. NEW: Generate final composited screenshots
   - Use existing generateScreenshot action
   - Upload to storage
   - Create screenshots records
   ↓
10. Link demo app/set to style record
```

## Schema Changes

### `apps` Table

```typescript
apps: defineTable({
  profileId: v.id("profiles"),
  name: v.string(),
  description: v.optional(v.string()),
  iconStorageId: v.optional(v.id("_storage")),
  category: v.optional(v.string()),
  platforms: v.optional(v.object({ ios: v.boolean(), android: v.boolean() })),
  languages: v.optional(v.array(v.string())),

  // Store links
  appStoreUrl: v.optional(v.string()),
  playStoreUrl: v.optional(v.string()),
  websiteUrl: v.optional(v.string()),

  // Metadata
  bundleId: v.optional(v.string()),
  keywords: v.optional(v.array(v.string())),
  ageRating: v.optional(v.string()),

  // NEW: Demo app flag
  isDemo: v.optional(v.boolean()), // true for AI-generated demo apps

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_profile", ["profileId"])
  .index("by_profile_and_created", ["profileId", "createdAt"])
  .index("by_is_demo", ["isDemo"]) // NEW: Filter demo apps
```

### `styles` Table

```typescript
styles: defineTable({
  // ... existing fields

  // NEW: Demo links
  demoAppId: v.optional(v.id("apps")), // Demo app showcasing this style
  demoSetId: v.optional(v.id("screenshotSets")), // Demo screenshot set

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_creator", ["createdBy"])
  .index("by_public", ["isPublic"])
  .index("by_slug", ["slug"])
  .index("by_category", ["category"])
  .index("by_featured", ["isFeatured"])
  .index("by_status", ["status"])
  .index("by_public_and_status", ["isPublic", "status"])
```

## BAML Functions

### New Function: `GenerateStyleDemoScreenshots`

**File:** `baml_src/screenshot-sets.baml`

**Input:**
- `style_config: StyleConfig` - The style to showcase
- `style_name: string` - Style name for context
- `screenshot_count: int?` - Number of demos (default: 3, max: 5)

**Output:** `StyleDemoOutput`
```typescript
{
  app_concept: string,           // "A fitness app for tracking runs"
  screenshots: [
    {
      header_copy: string,        // "Track Your Miles"
      subheader_copy: string?,    // Optional
      header_position: string,    // "top" | "bottom"
      device_orientation: string, // "straight-on" | "tilted 15°"
      device_position: string,    // "centered" | "upper" | "lower"
      app_screen_prompt: string   // Full prompt for app UI generation
    },
    // ... 2-4 more
  ]
}
```

**Purpose:**
- Invents a fictional app concept matching the style's mood
- Generates varied screenshot configs with layout/text
- Creates text-to-image prompts for app UI screens
- Ensures visual variety (positions, orientations)

## Convex Functions

### New Mutations

**`convex/apps.ts: createDemoApp`**
```typescript
internal mutation({
  args: {
    profileId: v.id("profiles"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  returns: v.id("apps"),
})
```
Creates a demo app record with `isDemo: true`. No style link - demos are reusable.

**`convex/styles.ts: updateStyleDemoLinks`**
```typescript
internal mutation({
  args: {
    styleId: v.id("styles"),
    demoAppId: v.id("apps"),
    demoSetId: v.id("screenshotSets"),
  },
  returns: v.null(),
})
```
Links demo app/set to style record.

### New Actions

**`convex/screenshotActions.ts: generateAndSaveAppScreens`**
```typescript
internal action({
  args: {
    appId: v.id("apps"),
    profileId: v.id("profiles"),
    screenPrompts: v.array(v.string()),
  },
  returns: v.array(v.id("appScreens")),
})
```
- Generates app UI images from text prompts (Gemini Flash)
- Uploads to Convex storage
- Creates `appScreens` records
- Returns array of screen IDs

**`convex/screenshotActions.ts: generateAndSaveScreenshots`**
```typescript
internal action({
  args: {
    setId: v.id("screenshotSets"),
    appId: v.id("apps"),
    styleId: v.id("styles"),
    screenshotSizeId: v.id("screenshotSizes"),
    configs: v.array(v.object({
      header_copy: v.string(),
      subheader_copy: v.optional(v.string()),
      header_position: v.string(),
      device_orientation: v.string(),
      device_position: v.string(),
    })),
    appScreenIds: v.array(v.id("appScreens")),
  },
  returns: v.null(),
})
```
- Generates final composited screenshots
- Uses existing `generateScreenshot` action
- Uploads to storage
- Creates `screenshots` records with proper `slotNumber`

### Integration into Style Generation

**`convex/styleActions.ts: generateStyleFromDescription`**

Add after line ~286 (after style creation):

```typescript
// Step 6: Generate demo screenshot configs
console.log("🎬 Generating demo screenshot configs...");
const demoOutput = await b.GenerateStyleDemoScreenshots(
  styleOutput.style_config,
  styleOutput.style_name,
  3 // Default to 3 demos
);

// Step 7: Create demo app
const demoAppId = await ctx.runMutation(internal.apps.createDemoApp, {
  profileId,
  name: demoOutput.app_concept,
  description: `Demo app showcasing ${styleOutput.style_name} style`,
});

// Step 8: Generate and save app screens
const appScreenIds = await ctx.runAction(
  internal.screenshotActions.generateAndSaveAppScreens,
  {
    appId: demoAppId,
    profileId,
    screenPrompts: demoOutput.screenshots.map(s => s.app_screen_prompt),
  }
);

// Step 9: Create demo screenshot set
const demoSetId = await ctx.runMutation(api.screenshotSets.createSet, {
  appId: demoAppId,
  name: `${styleOutput.style_name} Demo Set`,
  deviceType: "iPhone 16 Pro",
  status: "ready",
});

// Step 10: Generate and save final screenshots
await ctx.runAction(internal.screenshotActions.generateAndSaveScreenshots, {
  setId: demoSetId,
  appId: demoAppId,
  styleId,
  screenshotSizeId: DEFAULT_DEMO_SIZE_ID,
  configs: demoOutput.screenshots,
  appScreenIds,
});

// Step 11: Link demo to style
await ctx.runMutation(internal.styles.updateStyleDemoLinks, {
  styleId,
  demoAppId,
  demoSetId,
});
```

## Configuration

### Constants

```typescript
// convex/styleActions.ts or config file
const DEFAULT_DEMO_SIZE_ID = "..."; // Default screenshot size for demos
const DEMO_SCREENSHOT_COUNT = 3;    // Default number of demos
```

### User Choice Flow

**Demo generation is user-triggered, not automatic:**

When creating or viewing a style, users can:
1. **Select existing app** - Choose from their own apps or any demo app
2. **Generate new demo** - Click "Generate Demo" to create a new demo app + screenshot set
3. **Skip demo** - Leave style without demo previews

**Demo Apps:**
- Created with `isDemo: true` flag
- Owned by the user who generated them (or could be system-owned)
- Reusable across multiple styles
- Can be filtered in app lists with `by_is_demo` index

## Implementation Phases

### Phase 1: Schema & Infrastructure ✅
1. ✅ Updated `apps` table schema (added `isDemo` flag only, no bidirectional link)
2. ✅ Updated `styles` table schema (added `demoAppId`, `demoSetId`)
3. ✅ Added index `by_is_demo` for filtering demo apps
4. ✅ Created mutation: `createDemoApp` (convex/apps.ts)
5. ✅ Created mutation: `setStyleDemo` (renamed from `updateStyleDemoLinks`)

### Phase 2: Demo App Generation ✅
1. ✅ Created `baml_src/demo-apps.baml` file
2. ✅ Defined `DemoAppOutput` class (app_concept, app_icon_prompt)
3. ✅ Implemented `GenerateDemoAppFromStyle` BAML function
4. ✅ Added 3 test cases (Cyberpunk, Zen Minimalist, Pop Art)
5. ✅ Created `convex/demoActions.ts` for demo-specific actions
6. ✅ Implemented `generateDemoApp` action (icon generation + app creation)
7. ✅ Implemented `generateDemoAppFromStyle` action (BAML → demo app)
8. ✅ All TypeScript checks pass

**Key Decision:** Demo apps are reusable - no `demoForStyleId` field. Users can select any app (theirs or demo) when creating style previews.

### Phase 3: Screenshot Generation Actions (Next)
1. ⏳ Implement `generateDemoAppScreens` action
   - Takes BAML screenshot configs
   - Generates app UI screens from prompts
   - Uploads to storage, creates `appScreens` records
2. ⏳ Implement `generateDemoScreenshots` action
   - Composites final screenshots using existing `generateScreenshot`
   - Creates screenshot set and screenshot records
3. ⏳ Test standalone generation

### Phase 4: Full Demo Flow (Future)
1. ⏳ Create `generateCompleteDemoFromStyle` orchestration action
   - Calls BAML `GenerateStyleDemoScreenshots`
   - Generates app (via `generateDemoAppFromStyle`)
   - Generates app screens
   - Creates screenshot set
   - Generates final screenshots
   - Links to style via `setStyleDemo`
2. ⏳ Add progress tracking
3. ⏳ Handle errors gracefully

### Phase 5: UI & Queries (Future)
1. ⏳ Add queries to fetch demo screenshots
2. ⏳ UI: "Generate Demo" button on style page
3. ⏳ UI: App picker (user apps + demo apps)
4. ⏳ Filter demo apps in app list (optional)
5. ⏳ "Regenerate demo" functionality

## Benefits

1. **Reusability**: Demo app screens are real storage items, can be reused
2. **Consistency**: Uses existing app/screenshot infrastructure
3. **Discoverability**: Demo apps are queryable, browseable
4. **Data integrity**: Proper foreign keys and cascading deletes
5. **Future features**:
   - "Use demo as template" to convert demo → real app
   - Regenerate demos with different concepts
   - Share demo apps as examples

## Open Questions

1. **System profile creation**: How to create/manage system profile?
2. **Demo visibility**: Should demos appear in public galleries?
3. **Cost control**: Should we limit demo count for non-premium users?
4. **Cleanup**: Should we auto-delete old demos to save storage?
5. **Screenshot size**: Always use same size for demos, or vary?

## Testing Strategy

1. **BAML tests**: Test `GenerateStyleDemoScreenshots` with various styles
2. **Unit tests**: Test demo app/screenshot creation mutations
3. **Integration tests**: Test full flow from style → demo screenshots
4. **Manual testing**: Verify demo quality and variety
5. **Cost testing**: Monitor AI generation costs per style
