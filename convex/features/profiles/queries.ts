import { v } from "convex/values";
import { query, QueryCtx, MutationCtx } from "../../_generated/server";
import { Doc } from "../../_generated/dataModel";

/**
 * Helper function to get the current user's profile
 * Can be used within queries and mutations
 */
export async function getCurrentUser(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"profiles"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
    .first();

  return profile;
}

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
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      imageUrlUpdatedAt: v.optional(v.number()),
      isAdmin: v.optional(v.boolean()),
      preferences: v.optional(v.object({})),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
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
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      imageUrlUpdatedAt: v.optional(v.number()),
      isAdmin: v.optional(v.boolean()),
      preferences: v.optional(v.object({})),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    return profile;
  },
});

// Check if current user is an admin
export const isCurrentUserAdmin = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();
    
    return profile?.isAdmin === true;
  },
});

// Internal query to find any admin profile (for migrations/system operations)
export const getAnyAdminProfile = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("profiles"),
      _creationTime: v.number(),
      userId: v.string(),
      username: v.optional(v.string()),
      usernameUpdatedAt: v.optional(v.number()),
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      imageUrlUpdatedAt: v.optional(v.number()),
      isAdmin: v.optional(v.boolean()),
      preferences: v.optional(v.object({})),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const adminProfile = await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("isAdmin"), true))
      .first();

    return adminProfile;
  },
});

// Internal query to find admin profile by userId (for matching across deployments)
export const getAdminProfileByUserId = query({
  args: {
    userId: v.string(),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("profiles"),
      _creationTime: v.number(),
      userId: v.string(),
      username: v.optional(v.string()),
      usernameUpdatedAt: v.optional(v.number()),
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      imageUrlUpdatedAt: v.optional(v.number()),
      isAdmin: v.optional(v.boolean()),
      preferences: v.optional(v.object({})),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    // Only return if the profile is an admin
    if (profile?.isAdmin === true) {
      return profile;
    }

    return null;
  },
});

