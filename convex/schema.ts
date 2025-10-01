import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profiles: defineTable({
    userId: v.string(), // Clerk's user ID (unique)
    username: v.optional(v.string()), // Username from Clerk (unique when present)
    usernameUpdatedAt: v.optional(v.number()), // Last time username was synced
    imageUrl: v.optional(v.string()), // Profile image URL from Clerk
    imageUrlUpdatedAt: v.optional(v.number()), // Last time image was synced from Clerk
    preferences: v.optional(
      v.object({
        // Future preferences can be added here
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_username", ["username"]),

  apps: defineTable({
    profileId: v.id("profiles"), // Owner of the app
    name: v.string(),
    description: v.optional(v.string()),
    iconStorageId: v.optional(v.id("_storage")), // App icon in file storage
    category: v.optional(v.string()),
    platforms: v.optional(
      v.object({
        ios: v.boolean(),
        android: v.boolean(),
      }),
    ),
    languages: v.optional(v.array(v.string())),
    // Store links (optional)
    appStoreUrl: v.optional(v.string()),
    playStoreUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    // Metadata
    bundleId: v.optional(v.string()),
    keywords: v.optional(v.array(v.string())),
    ageRating: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_profile", ["profileId"])
    .index("by_profile_and_created", ["profileId", "createdAt"]),

  appScreens: defineTable({
    appId: v.id("apps"), // Which app this screen belongs to
    profileId: v.id("profiles"), // Owner of the screen
    name: v.string(), // File name or descriptive name
    storageId: v.id("_storage"), // File storage ID
    dimensions: v.object({
      width: v.number(),
      height: v.number(),
    }),
    size: v.number(), // File size in bytes
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_app", ["appId"])
    .index("by_profile", ["profileId"]),

  screenshotSets: defineTable({
    appId: v.id("apps"), // Which app this set belongs to
    createdBy: v.id("profiles"), // User who created the set
    name: v.string(), // Set name (e.g., "iOS Screenshots - English")
    deviceType: v.optional(v.string()), // e.g. "iPhone 15 Pro", "iPad Pro", "Pixel 8"
    language: v.optional(v.string()), // e.g. "en", "es", "fr"
    status: v.optional(v.string()), // "draft", "ready", "exported"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_app", ["appId"])
    .index("by_creator", ["createdBy"])
    .index("by_app_and_created", ["appId", "createdAt"]),

  screenshots: defineTable({
    setId: v.id("screenshotSets"), // Which set this screenshot belongs to
    appId: v.id("apps"), // Denormalized for easier queries
    createdBy: v.id("profiles"), // User who created the screenshot
    slotNumber: v.number(), // Position in the set (1-10)
    title: v.optional(v.string()), // Screenshot title/heading
    subtitle: v.optional(v.string()), // Screenshot subtitle/description
    imageStorageId: v.optional(v.id("_storage")), // Generated image in storage
    appScreenId: v.optional(v.id("appScreens")), // Optional reference to source app screen
    themeId: v.optional(v.string()), // Theme/vibe used for generation
    layoutId: v.optional(v.string()), // Layout template used
    isEmpty: v.boolean(), // Whether this slot is empty
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_set", ["setId", "slotNumber"])
    .index("by_app", ["appId"])
    .index("by_creator", ["createdBy"]),

  // Templates system - replaces vibes
  templates: defineTable({
    profileId: v.id("profiles"), // Template owner
    name: v.string(), // Template name
    description: v.optional(v.string()), // Template description
    imageStorageId: v.optional(v.id("_storage")), // Representative preview image
    referenceImageStorageId: v.optional(v.id("_storage")), // Reference/inspiration image for generating prompts
    isPublic: v.boolean(), // Whether template is public/shareable
    currentVariantId: v.optional(v.id("templateVariants")), // Points to active variant
    usageCount: v.optional(v.number()), // Track how many times used
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_profile", ["profileId"])
    .index("by_public", ["isPublic"])
    .index("by_profile_and_created", ["profileId", "createdAt"]),

  templateVariants: defineTable({
    templateId: v.id("templates"), // Parent template
    version: v.number(), // Version number (1, 2, 3...)
    basePrompt: v.string(), // Core image-to-image prompt
    styleSettings: v.object({
      colorScheme: v.optional(v.string()), // Color palette/theme
      artStyle: v.optional(v.string()), // Art direction
      mood: v.optional(v.string()), // Mood/feeling
      effects: v.optional(v.array(v.string())), // Special effects/filters
    }),
    deviceFrameSettings: v.optional(
      v.object({
        showFrame: v.boolean(),
        frameColor: v.string(),
        frameThickness: v.number(),
        showDynamicIsland: v.optional(v.boolean()),
      }),
    ),
    isActive: v.boolean(), // Whether this is the active variant
    notes: v.optional(v.string()), // Version notes/changelog
    createdAt: v.number(),
  })
    .index("by_template", ["templateId"])
    .index("by_template_and_active", ["templateId", "isActive"])
    .index("by_template_and_version", ["templateId", "version"]),

  templateScreenshots: defineTable({
    templateVariantId: v.id("templateVariants"), // Links to specific variant
    templateId: v.id("templates"), // Denormalized for queries
    appId: v.optional(v.id("apps")), // Optional app association

    // Content
    headerText: v.string(),
    subheaderText: v.optional(v.string()),

    // Layout configuration
    layoutSettings: v.object({
      textPosition: v.union(
        v.literal("top"),
        v.literal("bottom"),
        v.literal("overlay-top"),
        v.literal("overlay-bottom"),
      ),
      textAlignment: v.union(
        v.literal("left"),
        v.literal("center"),
        v.literal("right"),
      ),
      headerStyle: v.optional(
        v.object({
          fontSize: v.optional(v.string()),
          fontWeight: v.optional(v.string()),
          color: v.optional(v.string()),
        }),
      ),
      subheaderStyle: v.optional(
        v.object({
          fontSize: v.optional(v.string()),
          fontWeight: v.optional(v.string()),
          color: v.optional(v.string()),
        }),
      ),
    }),

    // Generated assets
    imageStorageId: v.optional(v.id("_storage")), // Generated screenshot
    sourceScreenId: v.optional(v.id("appScreens")), // Source app screen used

    // Metadata
    slotNumber: v.optional(v.number()), // If part of a set
    tags: v.optional(v.array(v.string())), // For searching/filtering
    generationSettings: v.optional(v.string()), // JSON string of generation params

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_template_variant", ["templateVariantId"])
    .index("by_template", ["templateId"])
    .index("by_app", ["appId"]),

  screenshotSizes: defineTable({
    // Identity
    name: v.string(), // e.g., "iPhone 16 Pro Max", "Google Play Phone Portrait"
    slug: v.string(), // URL-friendly identifier (e.g., "iphone-6-9", "android-phone-portrait")
    platform: v.union(v.literal("ios"), v.literal("android")), // Platform
    deviceCategory: v.string(), // "phone", "tablet", "watch"

    // Dimensions
    width: v.number(), // Width in pixels
    height: v.number(), // Height in pixels
    aspectRatio: v.string(), // e.g., "9:16", "16:9"

    // Canvas template
    canvasStorageId: v.optional(v.id("_storage")), // Blank canvas image at exact dimensions

    // Metadata
    displaySize: v.optional(v.string()), // e.g., "6.9 inch", "10 inch tablet"
    isRequired: v.boolean(), // Whether this size is required by the store
    isPrimary: v.boolean(), // Whether this is a primary/recommended size
    minScreenshots: v.optional(v.number()), // Min required screenshots for this size
    maxScreenshots: v.optional(v.number()), // Max allowed screenshots

    // Store requirements
    notes: v.optional(v.string()), // Special requirements or notes

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_platform", ["platform"])
    .index("by_platform_and_primary", ["platform", "isPrimary"])
    .index("by_slug", ["slug"])
    .index("by_aspect_ratio", ["aspectRatio"]),

  screenshotStyles: defineTable({
    // Identity
    name: v.string(), // e.g., "Snap Style", "Spooky Halloween", "Watercolor Zen"
    slug: v.string(), // URL-friendly identifier (e.g., "snap-style", "spooky-halloween")
    description: v.optional(v.string()), // Brief description of the style

    // Ownership & visibility
    createdBy: v.optional(v.id("profiles")), // Creator (null for system styles)
    isPublic: v.boolean(), // Whether style is publicly available
    isSystemStyle: v.boolean(), // Built-in styles vs user-created

    // BAML StyleConfig - Only visual styling, no content or layout
    backgroundColor: v.string(), // Background color description (e.g., "bright yellow solid color")
    details: v.string(), // Decorative elements description (emojis, shapes, placement)
    textStyle: v.string(), // Text styling only (font, weight, color, effects)
    deviceStyle: v.string(), // Device frame styling (colors, materials, effects)

    // Preview & metadata
    referenceImageStorageId: v.optional(v.id("_storage")), // Reference/inspiration image
    previewImageStorageId: v.optional(v.id("_storage")), // Example screenshot
    deviceReferenceImageStorageId: v.optional(v.id("_storage")), // Device frame reference image for consistent styling
    tags: v.optional(v.array(v.string())), // Categorization (e.g., ["playful", "pop-art", "bright"])
    category: v.optional(v.string()), // Style category (e.g., "Pop Art", "Minimalist", "Seasonal")

    // Usage tracking
    usageCount: v.optional(v.number()), // How many times used
    isFeatured: v.optional(v.boolean()), // Highlight in UI

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_creator", ["createdBy"])
    .index("by_public", ["isPublic"])
    .index("by_system", ["isSystemStyle"])
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_featured", ["isFeatured"]),
});
