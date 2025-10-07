import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Query to get all apps for the current user
export const getApps = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("apps"),
      _creationTime: v.number(),
      profileId: v.id("profiles"),
      name: v.string(),
      description: v.optional(v.string()),
      iconStorageId: v.optional(v.id("_storage")),
      iconUrl: v.optional(v.union(v.string(), v.null())),
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
      isDemo: v.optional(v.boolean()),
      styleGuide: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Get the user's profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!profile) {
      return [];
    }

    // Get all apps for this profile
    const apps = await ctx.db
      .query("apps")
      .withIndex("by_profile_and_created", (q) =>
        q.eq("profileId", profile._id),
      )
      .order("desc")
      .collect();

    // Get icon URLs for all apps with icons
    const appsWithUrls = await Promise.all(
      apps.map(async (app) => {
        let iconUrl: string | null = null;
        if (app.iconStorageId) {
          iconUrl = await ctx.storage.getUrl(app.iconStorageId);
        }
        return {
          ...app,
          iconUrl: iconUrl ?? undefined,
        };
      }),
    );

    return appsWithUrls;
  },
});

// Query to get a single app by ID
export const getApp = query({
  args: { appId: v.id("apps") },
  returns: v.union(
    v.object({
      _id: v.id("apps"),
      _creationTime: v.number(),
      profileId: v.id("profiles"),
      name: v.string(),
      description: v.optional(v.string()),
      iconStorageId: v.optional(v.id("_storage")),
      iconUrl: v.optional(v.union(v.string(), v.null())),
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
      isDemo: v.optional(v.boolean()),
      styleGuide: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Get the user's profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!profile) {
      return null;
    }

    // Get the app
    const app = await ctx.db.get(args.appId);

    // Verify ownership
    if (!app || app.profileId !== profile._id) {
      return null;
    }

    // Get icon URL if exists
    let iconUrl: string | null = null;
    if (app.iconStorageId) {
      iconUrl = await ctx.storage.getUrl(app.iconStorageId);
    }

    return {
      ...app,
      iconUrl: iconUrl ?? undefined,
    };
  },
});

// Mutation to create a new app
export const createApp = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    iconStorageId: v.optional(v.id("_storage")),
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
    description: v.optional(v.string()),
    iconStorageId: v.optional(v.id("_storage")),
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

// Mutation to delete an app
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

    // Verify ownership
    if (!app || app.profileId !== profile._id) {
      throw new Error("App not found or access denied");
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

    // 5. Delete the app icon from storage if it exists
    if (app.iconStorageId) {
      await ctx.storage.delete(app.iconStorageId);
    }

    // 6. Finally, delete the app itself
    await ctx.db.delete(args.appId);

    return null;
  },
});

// Internal mutation to create a demo app (used by demoActions)
export const createDemoApp = internalMutation({
  args: {
    profileId: v.id("profiles"),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    iconStorageId: v.optional(v.id("_storage")),
  },
  returns: v.id("apps"),
  handler: async (ctx, args) => {
    const now = Date.now();

    const appId = await ctx.db.insert("apps", {
      profileId: args.profileId,
      name: args.name,
      description: args.description,
      category: args.category,
      iconStorageId: args.iconStorageId,
      isDemo: true,
      createdAt: now,
      updatedAt: now,
    });

    return appId;
  },
});

// Internal mutation to update a demo app (used by demoActions for progressive updates)
export const updateDemoApp = internalMutation({
  args: {
    appId: v.id("apps"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    iconStorageId: v.optional(v.id("_storage")),
    styleGuide: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { appId, ...updates } = args;

    await ctx.db.patch(appId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return null;
  },
});

// Query to get app generation status with icon and screens info
export const getAppGenerationStatus = query({
  args: { appId: v.id("apps") },
  returns: v.union(
    v.object({
      app: v.object({
        _id: v.id("apps"),
        name: v.string(),
        description: v.optional(v.string()),
        category: v.optional(v.string()),
        iconStorageId: v.optional(v.id("_storage")),
        iconUrl: v.optional(v.string()),
      }),
      screens: v.array(
        v.object({
          _id: v.id("appScreens"),
          name: v.string(),
          screenUrl: v.optional(v.string()),
        })
      ),
      totalScreens: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Get the user's profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!profile) {
      return null;
    }

    // Get the app
    const app = await ctx.db.get(args.appId);

    // Verify ownership
    if (!app || app.profileId !== profile._id) {
      return null;
    }

    // Get icon URL if exists
    let iconUrl: string | undefined = undefined;
    if (app.iconStorageId) {
      const url = await ctx.storage.getUrl(app.iconStorageId);
      iconUrl = url ?? undefined;
    }

    // Get all screens for this app
    const appScreens = await ctx.db
      .query("appScreens")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .order("asc")
      .collect();

    // Get screen URLs
    const screensWithUrls = await Promise.all(
      appScreens.map(async (screen) => {
        let screenUrl: string | undefined = undefined;
        if (screen.storageId) {
          const url = await ctx.storage.getUrl(screen.storageId);
          screenUrl = url ?? undefined;
        }
        return {
          _id: screen._id,
          name: screen.name,
          screenUrl,
        };
      })
    );

    return {
      app: {
        _id: app._id,
        name: app.name,
        description: app.description,
        category: app.category,
        iconStorageId: app.iconStorageId,
        iconUrl,
      },
      screens: screensWithUrls,
      totalScreens: appScreens.length,
    };
  },
});
