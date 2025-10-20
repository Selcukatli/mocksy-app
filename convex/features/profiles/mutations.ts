import { v } from "convex/values";
import { mutation } from "../../_generated/server";

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

// Mutation to sync current user's profile from Clerk identity
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

