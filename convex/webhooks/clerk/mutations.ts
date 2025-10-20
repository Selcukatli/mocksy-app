import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";

export const upsertUserFromClerk = internalMutation({
  args: {
    userId: v.string(),
    username: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    console.log("🔵 upsertUserFromClerk called with args:", {
      userId: args.userId,
      username: args.username,
      firstName: args.firstName,
      lastName: args.lastName,
      imageUrl: args.imageUrl ? "present" : undefined,
    });

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    console.log("🔍 Existing profile found:", existingProfile ? "YES" : "NO");

    if (existingProfile) {
      // Update profile if data has changed
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

      const usernameChanged = existingProfile.username !== args.username;
      const firstNameChanged = existingProfile.firstName !== args.firstName;
      const lastNameChanged = existingProfile.lastName !== args.lastName;
      const imageUrlChanged = existingProfile.imageUrl !== args.imageUrl;

      console.log("🔄 Change detection:", {
        usernameChanged,
        firstNameChanged,
        lastNameChanged,
        imageUrlChanged,
      });

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

      if (usernameChanged || firstNameChanged || lastNameChanged || imageUrlChanged) {
        console.log("📝 Applying updates:", updates);
        await ctx.db.patch(existingProfile._id, updates);
        console.log(`✅ Updated profile for user ${args.userId}`);
      } else {
        console.log("⏭️  No changes needed for profile");
      }
    } else {
      // Create new profile
      console.log("➕ Creating new profile with data:", {
        userId: args.userId,
        username: args.username,
        firstName: args.firstName,
        lastName: args.lastName,
        imageUrl: args.imageUrl ? "present" : undefined,
      });

      const profileId = await ctx.db.insert("profiles", {
        userId: args.userId,
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
      console.log(`✅ Created profile for user ${args.userId} with ID ${profileId}`);
    }

    return null;
  },
});

export const deleteUserFromClerk = internalMutation({
  args: {
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    console.log(`🗑️  Attempting to delete profile for Clerk user: ${args.userId}`);
    
    // Find and delete the profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (profile) {
      console.log(`📋 Found profile: ${profile._id}`, {
        username: profile.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
      });
      
      await ctx.db.delete(profile._id);
      console.log(`✅ Profile deleted successfully for user ${args.userId}`);
    } else {
      console.log(`⚠️  No profile found for user ${args.userId} - may have been already deleted or never created`);
    }

    return null;
  },
});

