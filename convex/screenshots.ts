import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get all screenshots for a set
export const getScreenshotsForSet = query({
  args: { setId: v.id("sets") },
  returns: v.array(v.object({
    _id: v.id("screenshots"),
    _creationTime: v.number(),
    setId: v.id("sets"),
    appId: v.id("apps"),
    createdBy: v.id("profiles"),
    slotNumber: v.number(),
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    themeId: v.optional(v.string()),
    layoutId: v.optional(v.string()),
    isEmpty: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })),
  handler: async (ctx, { setId }) => {
    // Get the set to verify access
    const set = await ctx.db.get(setId);
    if (!set) {
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

    if (!profile || set.createdBy !== profile._id) {
      return [];
    }

    // Get all screenshots for this set, ordered by slot number
    const screenshots = await ctx.db
      .query("screenshots")
      .withIndex("by_set")
      .filter(q => q.eq(q.field("setId"), setId))
      .collect();

    // Sort by slot number
    const sortedScreenshots = screenshots.sort((a, b) => a.slotNumber - b.slotNumber);

    // Add storage URLs for screenshots with images
    const screenshotsWithUrls = await Promise.all(
      sortedScreenshots.map(async (screenshot) => {
        const imageUrl = screenshot.imageStorageId
          ? await ctx.storage.getUrl(screenshot.imageStorageId)
          : undefined;

        return {
          ...screenshot,
          imageUrl: imageUrl || undefined,
        };
      })
    );

    return screenshotsWithUrls;
  },
});

// Update a screenshot
export const updateScreenshot = mutation({
  args: {
    screenshotId: v.id("screenshots"),
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    themeId: v.optional(v.string()),
    layoutId: v.optional(v.string()),
    isEmpty: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, { screenshotId, ...updates }) => {
    // Get the screenshot
    const screenshot = await ctx.db.get(screenshotId);
    if (!screenshot) {
      throw new Error("Screenshot not found");
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

    if (!profile || screenshot.createdBy !== profile._id) {
      throw new Error("Unauthorized");
    }

    // If we're updating the image, delete the old one if it exists
    if (updates.imageStorageId !== undefined && screenshot.imageStorageId) {
      await ctx.storage.delete(screenshot.imageStorageId);
    }

    // If we're setting an image, mark as not empty
    if (updates.imageStorageId) {
      updates.isEmpty = false;
    }

    // Update the screenshot
    await ctx.db.patch(screenshotId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return null;
  },
});

// Clear a screenshot slot
export const clearScreenshot = mutation({
  args: { screenshotId: v.id("screenshots") },
  returns: v.null(),
  handler: async (ctx, { screenshotId }) => {
    // Get the screenshot
    const screenshot = await ctx.db.get(screenshotId);
    if (!screenshot) {
      throw new Error("Screenshot not found");
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

    if (!profile || screenshot.createdBy !== profile._id) {
      throw new Error("Unauthorized");
    }

    // Delete the storage file if it exists
    if (screenshot.imageStorageId) {
      await ctx.storage.delete(screenshot.imageStorageId);
    }

    // Clear all fields except the required ones
    await ctx.db.patch(screenshotId, {
      title: undefined,
      subtitle: undefined,
      imageStorageId: undefined,
      themeId: undefined,
      layoutId: undefined,
      isEmpty: true,
      updatedAt: Date.now(),
    });

    return null;
  },
});

// Get a single screenshot
export const getScreenshot = query({
  args: { screenshotId: v.id("screenshots") },
  returns: v.union(
    v.object({
      _id: v.id("screenshots"),
      _creationTime: v.number(),
      setId: v.id("sets"),
      appId: v.id("apps"),
      createdBy: v.id("profiles"),
      slotNumber: v.number(),
      title: v.optional(v.string()),
      subtitle: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      imageStorageId: v.optional(v.id("_storage")),
      themeId: v.optional(v.string()),
      layoutId: v.optional(v.string()),
      isEmpty: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, { screenshotId }) => {
    const screenshot = await ctx.db.get(screenshotId);
    if (!screenshot) {
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

    if (!profile || screenshot.createdBy !== profile._id) {
      return null;
    }

    // Add storage URL if image exists
    const imageUrl = screenshot.imageStorageId
      ? await ctx.storage.getUrl(screenshot.imageStorageId)
      : undefined;

    return {
      ...screenshot,
      imageUrl: imageUrl || undefined,
    };
  },
});