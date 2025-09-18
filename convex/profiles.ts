import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getCurrentProfile = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("profiles"),
      _creationTime: v.number(),
      userId: v.string(),
      username: v.optional(v.string()),
      usernameUpdatedAt: v.optional(v.number()),
      imageUrl: v.optional(v.string()),
      imageUrlUpdatedAt: v.optional(v.number()),
      preferences: v.optional(v.object({})),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .first();

    return profile;
  },
});

export const ensureCurrentUserProfile = mutation({
  args: {
    username: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  returns: v.object({
    created: v.boolean(),
    profileId: v.id("profiles"),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .first();

    if (existingProfile) {
      // Update username and/or imageUrl if provided and different
      const usernameChanged = existingProfile.username !== args.username;
      const imageUrlChanged = existingProfile.imageUrl !== args.imageUrl;

      if (usernameChanged || imageUrlChanged) {
        const updates: any = {
          updatedAt: Date.now(),
        };

        if (usernameChanged) {
          updates.username = args.username;
          updates.usernameUpdatedAt = Date.now();
        }

        if (imageUrlChanged) {
          updates.imageUrl = args.imageUrl;
          updates.imageUrlUpdatedAt = Date.now();
        }

        await ctx.db.patch(existingProfile._id, updates);
      }
      return {
        created: false,
        profileId: existingProfile._id,
        message: usernameChanged || imageUrlChanged ? "Profile synced from Clerk" : "Profile already exists"
      };
    }

    // Create new profile
    const profileId = await ctx.db.insert("profiles", {
      userId: identity.subject,
      username: args.username,
      usernameUpdatedAt: args.username ? Date.now() : undefined,
      imageUrl: args.imageUrl,
      imageUrlUpdatedAt: args.imageUrl ? Date.now() : undefined,
      preferences: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { created: true, profileId, message: "Profile created" };
  },
});

export const getProfileByUsername = query({
  args: { username: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("profiles"),
      _creationTime: v.number(),
      userId: v.string(),
      username: v.optional(v.string()),
      usernameUpdatedAt: v.optional(v.number()),
      imageUrl: v.optional(v.string()),
      imageUrlUpdatedAt: v.optional(v.number()),
      preferences: v.optional(v.object({})),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    return profile;
  },
});