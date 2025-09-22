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
});