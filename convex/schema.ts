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
});