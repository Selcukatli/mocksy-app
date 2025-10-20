import { internalMutation, internalQuery } from "../../_generated/server";
import { v } from "convex/values";

// Internal query: Get any app by ID (no auth check)
export const getAppByIdInternal = internalQuery({
  args: { appId: v.id("apps") },
  returns: v.any(), // Returns full app document or null
  handler: async (ctx, args) => {
    return await ctx.db.get(args.appId);
  },
});

// Internal mutation: Create app for migration (no auth check, accepts all fields)
export const createAppForMigration = internalMutation({
  args: {
    profileId: v.id("profiles"),
    name: v.string(),
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
    isDemo: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
    styleGuide: v.optional(v.string()),
  },
  returns: v.id("apps"),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const appId = await ctx.db.insert("apps", {
      profileId: args.profileId,
      name: args.name,
      subtitle: args.subtitle,
      description: args.description,
      iconStorageId: args.iconStorageId,
      coverImageStorageId: args.coverImageStorageId,
      category: args.category,
      platforms: args.platforms,
      languages: args.languages,
      appStoreUrl: args.appStoreUrl,
      playStoreUrl: args.playStoreUrl,
      websiteUrl: args.websiteUrl,
      bundleId: args.bundleId,
      keywords: args.keywords,
      ageRating: args.ageRating,
      isDemo: args.isDemo,
      status: args.status,
      styleGuide: args.styleGuide,
      createdAt: now,
      updatedAt: now,
    });

    return appId;
  },
});

// Internal query: Check if app with name exists for a profile
export const checkAppNameExists = internalQuery({
  args: {
    name: v.string(),
    profileId: v.id("profiles"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const existingApp = await ctx.db
      .query("apps")
      .withIndex("by_profile", (q) => q.eq("profileId", args.profileId))
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();
    
    return existingApp !== null;
  },
});

// Internal mutation: Update production publish tracking
export const updateProdPublishStatus = internalMutation({
  args: {
    appId: v.id("apps"),
    prodAppId: v.string(),
    publishedAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.appId, {
      prodAppId: args.prodAppId,
      lastPublishedToProdAt: args.publishedAt,
      updatedAt: Date.now(),
    });
    return null;
  },
});

// Internal mutation to create a demo app (used by generation actions)
export const createAIGeneratedApp = internalMutation({
  args: {
    profileId: v.id("profiles"),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    styleGuide: v.optional(v.string()),
    iconStorageId: v.optional(v.id("_storage")),
    coverImageStorageId: v.optional(v.id("_storage")),
  },
  returns: v.id("apps"),
  handler: async (ctx, args) => {
    const now = Date.now();

    const appId = await ctx.db.insert("apps", {
      profileId: args.profileId,
      name: args.name,
      description: args.description,
      category: args.category,
      styleGuide: args.styleGuide,
      iconStorageId: args.iconStorageId,
      coverImageStorageId: args.coverImageStorageId,
      isDemo: true,
      status: "draft", // New demo apps start as draft
      createdAt: now,
      updatedAt: now,
    });

    return appId;
  },
});

// Internal mutation to update a demo app (used by generation actions for progressive updates)
export const updateAIGeneratedApp = internalMutation({
  args: {
    appId: v.id("apps"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    iconStorageId: v.optional(v.id("_storage")),
    coverImageStorageId: v.optional(v.id("_storage")),
    coverVideoStorageId: v.optional(v.id("_storage")),
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

// Internal mutation: Update app description
export const updateAppDescriptionInternal = internalMutation({
  args: {
    appId: v.id("apps"),
    description: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.appId, {
      description: args.description,
      updatedAt: Date.now(),
    });
    return null;
  },
});

// Internal mutation: Update app icon
export const updateAppIconInternal = internalMutation({
  args: {
    appId: v.id("apps"),
    iconStorageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.appId, {
      iconStorageId: args.iconStorageId,
      updatedAt: Date.now(),
    });
    return null;
  },
});

// Internal mutation: Update app cover image
export const updateAppCoverImageInternal = internalMutation({
  args: {
    appId: v.id("apps"),
    coverImageStorageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.appId, {
      coverImageStorageId: args.coverImageStorageId,
      updatedAt: Date.now(),
    });
    return null;
  },
});

