import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Upload an app screen
export const uploadAppScreen = mutation({
  args: {
    appId: v.id("apps"),
    name: v.string(),
    storageId: v.id("_storage"),
    dimensions: v.object({
      width: v.number(),
      height: v.number(),
    }),
    size: v.number(),
  },
  returns: v.id("appScreens"),
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

    // Create the app screen record
    const screenId = await ctx.db.insert("appScreens", {
      appId: args.appId,
      profileId: profile._id,
      name: args.name,
      storageId: args.storageId,
      dimensions: args.dimensions,
      size: args.size,
      createdAt: now,
      updatedAt: now,
    });

    return screenId;
  },
});

// Get all app screens for an app
export const getAppScreens = query({
  args: { appId: v.id("apps") },
  returns: v.array(v.object({
    _id: v.id("appScreens"),
    _creationTime: v.number(),
    appId: v.id("apps"),
    profileId: v.id("profiles"),
    name: v.string(),
    storageId: v.id("_storage"),
    screenUrl: v.optional(v.string()),
    dimensions: v.object({
      width: v.number(),
      height: v.number(),
    }),
    size: v.number(),
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

    // Get all screens for this app
    const screens = await ctx.db
      .query("appScreens")
      .withIndex("by_app")
      .filter(q => q.eq(q.field("appId"), appId))
      .collect();

    // Add storage URLs to each screen
    const screensWithUrls = await Promise.all(
      screens.map(async (screen) => {
        const screenUrl = await ctx.storage.getUrl(screen.storageId);
        return { ...screen, screenUrl: screenUrl || undefined };
      })
    );

    return screensWithUrls;
  },
});

// Get a single app screen
export const getAppScreen = query({
  args: { screenId: v.id("appScreens") },
  returns: v.union(
    v.object({
      _id: v.id("appScreens"),
      _creationTime: v.number(),
      appId: v.id("apps"),
      profileId: v.id("profiles"),
      name: v.string(),
      storageId: v.id("_storage"),
      screenUrl: v.optional(v.string()),
      dimensions: v.object({
        width: v.number(),
        height: v.number(),
      }),
      size: v.number(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, { screenId }) => {
    const screen = await ctx.db.get(screenId);
    if (!screen) {
      return null;
    }

    // Get the current user's profile to verify ownership
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id")
      .filter(q => q.eq(q.field("userId"), identity.subject))
      .first();

    if (!profile || screen.profileId !== profile._id) {
      return null;
    }

    // Add storage URL
    const screenUrl = await ctx.storage.getUrl(screen.storageId);

    return { ...screen, screenUrl: screenUrl || undefined };
  },
});

// Update app screen name
export const updateAppScreenName = mutation({
  args: {
    screenId: v.id("appScreens"),
    name: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { screenId, name }) => {
    // Get the screen
    const screen = await ctx.db.get(screenId);
    if (!screen) {
      throw new Error("Screen not found");
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

    if (!profile || screen.profileId !== profile._id) {
      throw new Error("Unauthorized");
    }

    // Update the screen name
    await ctx.db.patch(screenId, {
      name,
      updatedAt: Date.now(),
    });

    return null;
  },
});

// Delete an app screen
export const deleteAppScreen = mutation({
  args: { screenId: v.id("appScreens") },
  handler: async (ctx, { screenId }) => {
    // Get the screen
    const screen = await ctx.db.get(screenId);
    if (!screen) {
      throw new Error("Screen not found");
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

    if (!profile || screen.profileId !== profile._id) {
      throw new Error("Unauthorized");
    }

    // Delete the storage file if it exists
    if (screen.storageId) {
      await ctx.storage.delete(screen.storageId);
    }

    // Delete the screen record
    await ctx.db.delete(screenId);
  },
});