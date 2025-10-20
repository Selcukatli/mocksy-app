import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profiles: defineTable({
    userId: v.string(), // Clerk's user ID (unique)
    username: v.optional(v.string()), // Username from Clerk (unique when present)
    usernameUpdatedAt: v.optional(v.number()), // Last time username was synced
    firstName: v.optional(v.string()), // First name from Clerk
    lastName: v.optional(v.string()), // Last name from Clerk
    imageUrl: v.optional(v.string()), // Profile image URL from Clerk
    imageUrlUpdatedAt: v.optional(v.number()), // Last time image was synced from Clerk
    isAdmin: v.optional(v.boolean()), // Admin access flag
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
    conceptId: v.optional(v.id("appConcepts")), // Which concept was used to create this app
    name: v.string(),
    subtitle: v.optional(v.string()), // Short promotional text (App Store subtitle)
    description: v.optional(v.string()),
    iconStorageId: v.optional(v.id("_storage")), // App icon in file storage
    coverImageStorageId: v.optional(v.id("_storage")), // Cover/hero image for app listings
    coverVideoStorageId: v.optional(v.id("_storage")), // Cover video for app listings
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
    // Demo app flag
    isDemo: v.optional(v.boolean()), // true for AI-generated demo apps
    // Publishing status (optional for backward compatibility - undefined means published)
    status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
    // Style guide for UI consistency
    styleGuide: v.optional(v.string()), // Complete design guide including colors, typography, mood, philosophy
    // Production publish tracking (dev deployment only)
    prodAppId: v.optional(v.string()), // ID of published app in prod (string, not Id<"apps"> since it's a different deployment)
    lastPublishedToProdAt: v.optional(v.number()), // Timestamp when app was last published to production
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_profile", ["profileId"])
    .index("by_profile_and_created", ["profileId", "createdAt"])
    .index("by_is_demo", ["isDemo"])
    .index("by_status", ["status"]),

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

  appConcepts: defineTable({
    jobId: v.id("conceptGenerationJobs"), // Which generation job created this
    profileId: v.id("profiles"), // Owner of the concept
    
    // Core concept data
    name: v.string(), // App name
    subtitle: v.string(), // App Store subtitle
    description: v.string(), // Full App Store description
    category: v.optional(v.string()), // App category
    styleDescription: v.string(), // Complete visual style guide
    
    // Structured design system
    colors: v.object({
      primary: v.string(),
      background: v.string(),
      text: v.string(),
      accent: v.string(),
    }),
    typography: v.object({
      headlineFont: v.string(),
      headlineSize: v.string(),
      headlineWeight: v.string(),
      bodyFont: v.string(),
      bodySize: v.string(),
      bodyWeight: v.string(),
    }),
    effects: v.object({
      cornerRadius: v.string(),
      shadowStyle: v.string(),
      designPhilosophy: v.string(),
    }),
    
    // Images stored in Convex storage (downloaded from fal.ai)
    iconStorageId: v.optional(v.id("_storage")),
    coverImageStorageId: v.optional(v.id("_storage")),
    
    // Original generation prompts (for regeneration capability)
    iconPrompt: v.string(),
    coverPrompt: v.string(),
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_job", ["jobId"])
    .index("by_profile", ["profileId"])
    .index("by_profile_and_created", ["profileId", "createdAt"]),

  appReviews: defineTable({
    appId: v.id("apps"), // App being reviewed
    profileId: v.id("profiles"), // Reviewer
    rating: v.number(), // 1-5 stars
    title: v.optional(v.string()), // Review title
    reviewText: v.string(), // Review content
    helpfulCount: v.optional(v.number()), // Number of helpful votes
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_app", ["appId"])
    .index("by_profile", ["profileId"])
    .index("by_app_and_created", ["appId", "createdAt"])
    .index("by_rating", ["appId", "rating"]),

  appGenerationJobs: defineTable({
    profileId: v.id("profiles"), // Owner initiating the generation
    appId: v.id("apps"), // App being generated
    status: v.union(
      v.literal("pending"),
      v.literal("downloading_images"), // Downloading icon/cover from concept
      v.literal("generating_structure"), // Generating app structure plan
      v.literal("preview_ready"), // Concept saved, waiting for user to trigger screenshot generation
      v.literal("generating_concept"),
      v.literal("generating_icon"),
      v.literal("generating_screens"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("partial") // Some screens succeeded, some failed
    ),
    currentStep: v.string(), // Human-readable: "Generating screen 2/5..."
    progressPercentage: v.optional(v.number()), // 0-100 percentage complete (optional for backward compatibility)
    screensGenerated: v.number(), // Number of screens successfully generated
    screensTotal: v.number(), // Total number of screens planned
    failedScreens: v.optional(
      v.array(
        v.object({
          screenName: v.string(),
          errorMessage: v.string(),
        })
      )
    ), // Array of screens that failed to generate
    error: v.optional(v.string()), // Overall error message if job failed
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_profile", ["profileId"])
    .index("by_app", ["appId"])
    .index("by_status", ["status"])
    .index("by_profile_and_status", ["profileId", "status"]),

  conceptGenerationJobs: defineTable({
    profileId: v.id("profiles"), // Owner initiating the generation
    status: v.union(
      v.literal("generating_concepts"), // Generating text concepts with BAML
      v.literal("generating_images"), // Generating images for concepts
      v.literal("completed"),
      v.literal("failed")
    ),
    // Text concepts (generated immediately)
    concepts: v.optional(
      v.array(
        v.object({
          app_name: v.string(),
          app_subtitle: v.string(),
          app_description: v.string(),
          app_category: v.optional(v.string()), // Optional for backward compatibility with existing data
          style_description: v.string(),
          app_icon_prompt: v.string(),
          cover_image_prompt: v.string(),
          // Image URLs (null until generated)
          icon_url: v.optional(v.string()),
          cover_url: v.optional(v.string()),
          // Structured design system fields
          colors: v.optional(
            v.object({
              primary: v.string(),
              background: v.string(),
              text: v.string(),
              accent: v.string(),
            })
          ),
          typography: v.optional(
            v.object({
              headlineFont: v.string(),
              headlineSize: v.string(),
              headlineWeight: v.string(),
              bodyFont: v.string(),
              bodySize: v.string(),
              bodyWeight: v.string(),
            })
          ),
          effects: v.optional(
            v.object({
              cornerRadius: v.string(),
              shadowStyle: v.string(),
              designPhilosophy: v.string(),
            })
          ),
        })
      )
    ),
    error: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_profile", ["profileId"])
    .index("by_status", ["status"]),

  // Universal generation jobs table for simple media generation tasks
  generationJobs: defineTable({
    type: v.union(
      v.literal("coverImage"),
      v.literal("coverVideo"),
      v.literal("icon"),
      v.literal("improveAppDescription")
    ),
    appId: v.id("apps"),
    profileId: v.id("profiles"),
    status: v.union(
      v.literal("pending"),
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed")
    ),
    metadata: v.any(), // Flexible: { prompt, variantCount, selectedVariant, variants, etc. }
    result: v.optional(v.string()), // Final storageId or URL
    error: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_app", ["appId"])
    .index("by_profile", ["profileId"])
    .index("by_app_and_type", ["appId", "type"])
    .index("by_status", ["status"]),

  // Featured apps on the appstore homepage
  featuredApps: defineTable({
    appId: v.id("apps"),
    featuredBy: v.optional(v.id("profiles")), // Admin who featured the app (optional for backward compatibility)
    featuredAt: v.number(), // When the app was featured (for ordering)
  })
    .index("by_app", ["appId"])
    .index("by_featured_at", ["featuredAt"]),

  // Screenshot sizes for app generation (device specifications)
  screenshotSizes: defineTable({
    name: v.string(), // e.g., "iPhone 15 Pro", "iPad Pro 12.9\""
    slug: v.string(), // URL-friendly identifier (e.g., "iphone-15-pro")
    platform: v.union(v.literal("ios"), v.literal("android")),
    deviceCategory: v.union(v.literal("phone"), v.literal("tablet")),
    // Dimensions
    width: v.number(), // Device width in pixels
    height: v.number(), // Device height in pixels
    aspectRatio: v.string(), // e.g., "19.5:9"
    // Canvas template (optional)
    canvasStorageId: v.optional(v.id("_storage")), // Pre-made device frame template
    // Display info
    displaySize: v.optional(v.string()), // e.g., "6.1 inches"
    // Generation settings
    isRequired: v.boolean(), // Whether this size is required for app submission
    isPrimary: v.boolean(), // Whether this is the primary/default size for this platform
    minScreenshots: v.optional(v.number()), // Min required screenshots for this device
    maxScreenshots: v.optional(v.number()), // Max allowed screenshots for this device
    notes: v.optional(v.string()), // Additional notes about this size
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_platform", ["platform"])
    .index("by_slug", ["slug"])
    .index("by_platform_and_primary", ["platform", "isPrimary"]),
});
