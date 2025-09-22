import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profiles: defineTable({
    userId: v.string(), // Clerk's user ID (unique)
    username: v.optional(v.string()), // Username from Clerk (unique when present)
    usernameUpdatedAt: v.optional(v.number()), // Last time username was synced
    imageUrl: v.optional(v.string()), // Profile image URL from Clerk
    imageUrlUpdatedAt: v.optional(v.number()), // Last time image was synced from Clerk
    preferences: v.optional(v.object({
      // Future preferences can be added here
    })),
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
    platforms: v.optional(v.object({
      ios: v.boolean(),
      android: v.boolean(),
    })),
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
    themeId: v.optional(v.string()), // Theme/vibe used for generation
    layoutId: v.optional(v.string()), // Layout template used
    isEmpty: v.boolean(), // Whether this slot is empty
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_set", ["setId", "slotNumber"])
    .index("by_app", ["appId"])
    .index("by_creator", ["createdBy"]),
});