import { query, mutation } from "./_generated/server";
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

    // TODO: In the future, also delete related sets, screenshots, etc.

    // Delete the app
    await ctx.db.delete(args.appId);

    return null;
  },
});
