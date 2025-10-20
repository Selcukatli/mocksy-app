import { mutation } from "../../_generated/server";
import { v } from "convex/values";

// Mutation to create a new app
export const createApp = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    iconStorageId: v.optional(v.id("_storage")),
    coverImageStorageId: v.optional(v.id("_storage")),
    category: v.optional(v.string()),
    platforms: v.optional(
      v.object({
        ios: v.boolean(),
        android: v.boolean(),
      }),
    ),
    languages: v.optional(v.array(v.string())),
  },
  returns: v.id("apps"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the user's profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!profile) {
      throw new Error("Profile not found");
    }

    const now = Date.now();

    // Create the app
    const appId = await ctx.db.insert("apps", {
      profileId: profile._id,
      name: args.name,
      description: args.description,
      iconStorageId: args.iconStorageId,
      coverImageStorageId: args.coverImageStorageId,
      category: args.category,
      platforms: args.platforms,
      languages: args.languages,
      createdAt: now,
      updatedAt: now,
    });

    return appId;
  },
});

// Mutation to update an app
export const updateApp = mutation({
  args: {
    appId: v.id("apps"),
    name: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    description: v.optional(v.string()),
    iconStorageId: v.optional(v.id("_storage")),
    coverImageStorageId: v.optional(v.id("_storage")),
    category: v.optional(v.string()),
    platforms: v.optional(
      v.object({
        ios: v.boolean(),
        android: v.boolean(),
      }),
    ),
    languages: v.optional(v.array(v.string())),
    appStoreUrl: v.optional(v.string()),
    playStoreUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    bundleId: v.optional(v.string()),
    keywords: v.optional(v.array(v.string())),
    ageRating: v.optional(v.string()),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the user's profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Get the app
    const app = await ctx.db.get(args.appId);

    // Verify ownership
    if (!app || app.profileId !== profile._id) {
      throw new Error("App not found or access denied");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { appId, ...updates } = args;

    // Update the app
    await ctx.db.patch(args.appId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return null;
  },
});

// Mutation to delete an app (owner or admin can delete)
export const deleteApp = mutation({
  args: {
    appId: v.id("apps"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the user's profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Get the app
    const app = await ctx.db.get(args.appId);
    if (!app) {
      throw new Error("App not found");
    }

    // Verify ownership OR admin access
    const isOwner = app.profileId === profile._id;
    const isAdmin = profile.isAdmin === true;
    
    if (!isOwner && !isAdmin) {
      throw new Error("Access denied: You must be the owner or an admin to delete this app");
    }

    // Delete all related data in reverse dependency order

    // 1. Delete all screenshots (which reference screenshotSets)
    const screenshots = await ctx.db
      .query("screenshots")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .collect();

    for (const screenshot of screenshots) {
      // Delete screenshot image from storage if it exists
      if (screenshot.imageStorageId) {
        await ctx.storage.delete(screenshot.imageStorageId);
      }
      await ctx.db.delete(screenshot._id);
    }

    // 2. Delete all screenshot sets
    const screenshotSets = await ctx.db
      .query("screenshotSets")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .collect();

    for (const set of screenshotSets) {
      await ctx.db.delete(set._id);
    }

    // 3. Delete all app screens and their storage files
    const appScreens = await ctx.db
      .query("appScreens")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .collect();

    for (const screen of appScreens) {
      // Delete screen image from storage
      if (screen.storageId) {
        await ctx.storage.delete(screen.storageId);
      }
      await ctx.db.delete(screen._id);
    }

    // 4. Delete all template screenshots associated with this app
    const templateScreenshots = await ctx.db
      .query("templateScreenshots")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .collect();

    for (const templateScreenshot of templateScreenshots) {
      // Delete generated image from storage if it exists
      if (templateScreenshot.imageStorageId) {
        await ctx.storage.delete(templateScreenshot.imageStorageId);
      }
      await ctx.db.delete(templateScreenshot._id);
    }

    // 5. Delete all reviews for this app
    const reviews = await ctx.db
      .query("mockReviews")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .collect();

    for (const review of reviews) {
      await ctx.db.delete(review._id);
    }

    // 6. Delete generation jobs
    const generationJobs = await ctx.db
      .query("appGenerationJobs")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .collect();

    for (const job of generationJobs) {
      await ctx.db.delete(job._id);
    }

    // 7. Remove from featured apps if featured
    const featuredApp = await ctx.db
      .query("featuredApps")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .unique();

    if (featuredApp) {
      await ctx.db.delete(featuredApp._id);
    }

    // 8. Delete the app icon from storage if it exists
    if (app.iconStorageId) {
      await ctx.storage.delete(app.iconStorageId);
    }

    // 9. Delete the cover image from storage if it exists
    if (app.coverImageStorageId) {
      await ctx.storage.delete(app.coverImageStorageId);
    }

    // 10. Finally, delete the app itself
    await ctx.db.delete(args.appId);

    return null;
  },
});

// Public mutation to update app details (used by preview page)
export const updateAppDetails = mutation({
  args: {
    appId: v.id("apps"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    styleGuide: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user's profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Verify ownership
    const app = await ctx.db.get(args.appId);
    if (!app || app.profileId !== profile._id) {
      throw new Error("App not found or access denied");
    }

    // Update app
    const { appId, ...updates } = args;
    await ctx.db.patch(appId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return null;
  },
});

// Mutation to update cover video (no authentication required for migration script)
export const updateCoverVideo = mutation({
  args: {
    appId: v.id("apps"),
    coverVideoStorageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get the app
    const app = await ctx.db.get(args.appId);
    
    if (!app) {
      throw new Error("App not found");
    }

    // Update the app with the cover video
    await ctx.db.patch(args.appId, {
      coverVideoStorageId: args.coverVideoStorageId,
      updatedAt: Date.now(),
    });

    return null;
  },
});

// Mutation: Remove cover video from an app
export const removeCoverVideo = mutation({
  args: {
    appId: v.id("apps"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the app
    const app = await ctx.db.get(args.appId);
    
    if (!app) {
      throw new Error("App not found");
    }

    // Check ownership
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!profile || app.profileId !== profile._id) {
      throw new Error("Not authorized to modify this app");
    }

    // Remove the cover video
    await ctx.db.patch(args.appId, {
      coverVideoStorageId: undefined,
      updatedAt: Date.now(),
    });

    return null;
  },
});

