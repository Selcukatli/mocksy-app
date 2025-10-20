import { v } from "convex/values";
import { query, mutation, internalMutation, QueryCtx, MutationCtx } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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

// ============================================================================
// QUERIES
// ============================================================================

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

// ============================================================================
// MUTATIONS
// ============================================================================

export const ensureCurrentUserProfile = mutation({
  args: {
    username: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
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
      // Update username, firstName, lastName, and/or imageUrl if provided and different
      const usernameChanged = existingProfile.username !== args.username;
      const firstNameChanged = existingProfile.firstName !== args.firstName;
      const lastNameChanged = existingProfile.lastName !== args.lastName;
      const imageUrlChanged = existingProfile.imageUrl !== args.imageUrl;

      if (usernameChanged || firstNameChanged || lastNameChanged || imageUrlChanged) {
        const updates: {
          updatedAt: number;
          username?: string | undefined;
          usernameUpdatedAt?: number;
          firstName?: string | undefined;
          lastName?: string | undefined;
          imageUrl?: string | undefined;
          imageUrlUpdatedAt?: number;
        } = {
          updatedAt: Date.now(),
        };

        if (usernameChanged) {
          updates.username = args.username;
          updates.usernameUpdatedAt = Date.now();
        }

        if (firstNameChanged) {
          updates.firstName = args.firstName;
        }

        if (lastNameChanged) {
          updates.lastName = args.lastName;
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
        message:
          usernameChanged || firstNameChanged || lastNameChanged || imageUrlChanged
            ? "Profile synced from Clerk"
            : "Profile already exists",
      };
    }

    // Create new profile
    const profileId = await ctx.db.insert("profiles", {
      userId: identity.subject,
      username: args.username,
      usernameUpdatedAt: args.username ? Date.now() : undefined,
      firstName: args.firstName,
      lastName: args.lastName,
      imageUrl: args.imageUrl,
      imageUrlUpdatedAt: args.imageUrl ? Date.now() : undefined,
      preferences: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { created: true, profileId, message: "Profile created" };
  },
});

export const syncMyProfileFromClerk = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .first();

    if (!profile) {
      return {
        success: false,
        message: "Profile not found",
      };
    }

    // Get name from Clerk identity
    const firstName = identity.givenName || undefined;
    const lastName = identity.familyName || undefined;
    const username = identity.nickname || identity.name || undefined;
    const imageUrl = identity.pictureUrl || undefined;

    await ctx.db.patch(profile._id, {
      firstName,
      lastName,
      username,
      imageUrl,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: `Synced profile: ${firstName} ${lastName || ''}`,
    };
  },
});

// ============================================================================
// INTERNAL MUTATIONS
// ============================================================================

export const setAdminStatus = internalMutation({
  args: {
    profileId: v.id("profiles"),
    isAdmin: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.profileId, {
      isAdmin: args.isAdmin,
      updatedAt: Date.now(),
    });
    return null;
  },
});

