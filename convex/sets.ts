import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Create a new set with empty screenshot slots
export const createSet = mutation({
  args: {
    appId: v.id("apps"),
    name: v.string(),
    deviceType: v.optional(v.string()),
    language: v.optional(v.string()),
  },
  returns: v.id("sets"),
  handler: async (ctx, args) => {
    // Get the current user's profile
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be authenticated");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id")
      .filter(q => q.eq(q.field("userId"), identity.subject))
      .first();

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Verify the user owns the app
    const app = await ctx.db.get(args.appId);
    if (!app || app.profileId !== profile._id) {
      throw new Error("App not found or unauthorized");
    }

    const now = Date.now();

    // Create the set
    const setId = await ctx.db.insert("sets", {
      appId: args.appId,
      createdBy: profile._id,
      name: args.name,
      deviceType: args.deviceType,
      language: args.language,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });

    // Create 10 empty screenshot slots
    const screenshotPromises = [];
    for (let i = 1; i <= 10; i++) {
      screenshotPromises.push(
        ctx.db.insert("screenshots", {
          setId,
          appId: args.appId,
          createdBy: profile._id,
          slotNumber: i,
          isEmpty: true,
          createdAt: now,
          updatedAt: now,
        })
      );
    }

    await Promise.all(screenshotPromises);

    return setId;
  },
});

// Get a single set
export const getSet = query({
  args: { setId: v.id("sets") },
  returns: v.union(
    v.object({
      _id: v.id("sets"),
      _creationTime: v.number(),
      appId: v.id("apps"),
      createdBy: v.id("profiles"),
      name: v.string(),
      deviceType: v.optional(v.string()),
      language: v.optional(v.string()),
      status: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, { setId }) => {
    const set = await ctx.db.get(setId);
    if (!set) {
      return null;
    }

    // Get the current user's profile to verify access
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id")
      .filter(q => q.eq(q.field("userId"), identity.subject))
      .first();

    if (!profile || set.createdBy !== profile._id) {
      return null;
    }

    return set;
  },
});

// Get all sets for an app
export const getSetsForApp = query({
  args: { appId: v.id("apps") },
  returns: v.array(v.object({
    _id: v.id("sets"),
    _creationTime: v.number(),
    appId: v.id("apps"),
    createdBy: v.id("profiles"),
    name: v.string(),
    deviceType: v.optional(v.string()),
    language: v.optional(v.string()),
    status: v.optional(v.string()),
    screenshotCount: v.number(),
    filledCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })),
  handler: async (ctx, { appId }) => {
    // Get the app to verify access
    const app = await ctx.db.get(appId);
    if (!app) {
      return [];
    }

    // Get the current user's profile
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id")
      .filter(q => q.eq(q.field("userId"), identity.subject))
      .first();

    if (!profile || app.profileId !== profile._id) {
      return [];
    }

    // Get all sets for this app
    const sets = await ctx.db
      .query("sets")
      .withIndex("by_app")
      .filter(q => q.eq(q.field("appId"), appId))
      .collect();

    // For each set, count screenshots
    const setsWithCounts = await Promise.all(
      sets.map(async (set) => {
        const screenshots = await ctx.db
          .query("screenshots")
          .withIndex("by_set")
          .filter(q => q.eq(q.field("setId"), set._id))
          .collect();

        const filledCount = screenshots.filter(s => !s.isEmpty).length;

        return {
          ...set,
          screenshotCount: screenshots.length,
          filledCount,
        };
      })
    );

    return setsWithCounts;
  },
});

// Update a set
export const updateSet = mutation({
  args: {
    setId: v.id("sets"),
    name: v.optional(v.string()),
    deviceType: v.optional(v.string()),
    language: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { setId, ...updates }) => {
    // Get the set
    const set = await ctx.db.get(setId);
    if (!set) {
      throw new Error("Set not found");
    }

    // Get the current user's profile
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be authenticated");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id")
      .filter(q => q.eq(q.field("userId"), identity.subject))
      .first();

    if (!profile || set.createdBy !== profile._id) {
      throw new Error("Unauthorized");
    }

    // Update the set
    await ctx.db.patch(setId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return null;
  },
});

// Delete a set and all its screenshots
export const deleteSet = mutation({
  args: { setId: v.id("sets") },
  handler: async (ctx, { setId }) => {
    // Get the set
    const set = await ctx.db.get(setId);
    if (!set) {
      throw new Error("Set not found");
    }

    // Get the current user's profile
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be authenticated");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id")
      .filter(q => q.eq(q.field("userId"), identity.subject))
      .first();

    if (!profile || set.createdBy !== profile._id) {
      throw new Error("Unauthorized");
    }

    // Delete all screenshots for this set
    const screenshots = await ctx.db
      .query("screenshots")
      .withIndex("by_set")
      .filter(q => q.eq(q.field("setId"), setId))
      .collect();

    for (const screenshot of screenshots) {
      // Delete the storage file if it exists
      if (screenshot.imageStorageId) {
        await ctx.storage.delete(screenshot.imageStorageId);
      }
      // Delete the screenshot record
      await ctx.db.delete(screenshot._id);
    }

    // Delete the set
    await ctx.db.delete(setId);
  },
});