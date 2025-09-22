import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const upsertUserFromClerk = internalMutation({
  args: {
    userId: v.string(),
    username: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (existingProfile) {
      // Update profile if data has changed
      const updates: {
        updatedAt: number;
        username?: string | undefined;
        usernameUpdatedAt?: number;
        imageUrl?: string | undefined;
        imageUrlUpdatedAt?: number;
      } = {
        updatedAt: Date.now(),
      };

      const usernameChanged = existingProfile.username !== args.username;
      const imageUrlChanged = existingProfile.imageUrl !== args.imageUrl;

      if (usernameChanged) {
        updates.username = args.username;
        updates.usernameUpdatedAt = Date.now();
      }

      if (imageUrlChanged) {
        updates.imageUrl = args.imageUrl;
        updates.imageUrlUpdatedAt = Date.now();
      }

      if (usernameChanged || imageUrlChanged) {
        await ctx.db.patch(existingProfile._id, updates);
        console.log(`Updated profile for user ${args.userId}`);
      }
    } else {
      // Create new profile
      await ctx.db.insert("profiles", {
        userId: args.userId,
        username: args.username,
        usernameUpdatedAt: args.username ? Date.now() : undefined,
        imageUrl: args.imageUrl,
        imageUrlUpdatedAt: args.imageUrl ? Date.now() : undefined,
        preferences: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      console.log(`Created profile for user ${args.userId}`);
    }
  },
});

export const deleteUserFromClerk = internalMutation({
  args: {
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Find and delete the profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (profile) {
      await ctx.db.delete(profile._id);
      console.log(`Deleted profile for user ${args.userId}`);
    } else {
      console.log(`No profile found for user ${args.userId}`);
    }
  },
});