import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./profiles";

/**
 * Admin-only mutation to feature an app on the appstore
 */
export const featureApp = mutation({
  args: {
    appId: v.id("apps"),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    // Check if user is authenticated and is admin
    const profile = await getCurrentUser(ctx);
    if (!profile) {
      throw new Error("Not authenticated");
    }
    if (!profile.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Verify app exists
    const app = await ctx.db.get(args.appId);
    if (!app) {
      throw new Error("App not found");
    }

    // Verify it's a demo app
    if (!app.isDemo) {
      throw new Error("Only demo apps can be featured");
    }

    // Check if already featured
    const existingFeature = await ctx.db
      .query("featuredApps")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .unique();

    if (existingFeature) {
      return {
        success: false,
        message: "App is already featured",
      };
    }

    // If app is draft, automatically publish it when featuring
    const isPublished = app.status === "published" || app.status === undefined;
    if (!isPublished) {
      await ctx.db.patch(args.appId, {
        status: "published",
        updatedAt: Date.now(),
      });
    }

    // Add to featured apps
    await ctx.db.insert("featuredApps", {
      appId: args.appId,
      featuredBy: profile._id,
      featuredAt: Date.now(),
    });

    return {
      success: true,
      message: !isPublished
        ? `"${app.name}" has been published and featured`
        : `"${app.name}" has been featured`,
    };
  },
});

/**
 * Admin-only mutation to unfeature an app from the appstore
 */
export const unfeatureApp = mutation({
  args: {
    appId: v.id("apps"),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    // Check if user is authenticated and is admin
    const profile = await getCurrentUser(ctx);
    if (!profile) {
      throw new Error("Not authenticated");
    }
    if (!profile.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Find the featured app entry
    const featuredApp = await ctx.db
      .query("featuredApps")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .unique();

    if (!featuredApp) {
      return {
        success: false,
        message: "App is not currently featured",
      };
    }

    // Get app name for response message
    const app = await ctx.db.get(args.appId);
    const appName = app?.name || "App";

    // Remove from featured apps
    await ctx.db.delete(featuredApp._id);

    return {
      success: true,
      message: `"${appName}" has been unfeatured`,
    };
  },
});

/**
 * Admin-only mutation to update app status
 */
export const updateAppStatus = mutation({
  args: {
    appId: v.id("apps"),
    status: v.union(v.literal("draft"), v.literal("published")),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    // Check if user is authenticated and is admin
    const profile = await getCurrentUser(ctx);
    if (!profile) {
      throw new Error("Not authenticated");
    }
    if (!profile.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Verify app exists
    const app = await ctx.db.get(args.appId);
    if (!app) {
      throw new Error("App not found");
    }

    // Update the app status
    await ctx.db.patch(args.appId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: `App status updated to ${args.status}`,
    };
  },
});

/**
 * Public query to check if a specific app is featured
 */
export const isFeatured = query({
  args: {
    appId: v.id("apps"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const featuredApp = await ctx.db
      .query("featuredApps")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .unique();

    return featuredApp !== null;
  },
});

/**
 * Admin-only query to get all apps with their featured status
 */
export const getAllAppsForAdmin = query({
  args: {
    searchQuery: v.optional(v.string()),
    category: v.optional(v.string()),
    status: v.optional(v.union(v.literal("published"), v.literal("draft"), v.literal("all"))),
    featuredFilter: v.optional(v.union(v.literal("featured"), v.literal("not-featured"), v.literal("all"))),
  },
  returns: v.array(
    v.object({
      _id: v.id("apps"),
      name: v.string(),
      description: v.optional(v.string()),
      category: v.optional(v.string()),
      iconUrl: v.optional(v.string()),
      coverImageUrl: v.optional(v.string()),
      status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
      isDemo: v.optional(v.boolean()),
      isFeatured: v.boolean(),
      featuredAt: v.optional(v.number()),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    // Check if user is authenticated and is admin
    const profile = await getCurrentUser(ctx);
    if (!profile) {
      throw new Error("Not authenticated");
    }
    if (!profile.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get all apps
    const allApps = await ctx.db
      .query("apps")
      .order("desc")
      .collect();

    // Get all featured apps
    const featuredApps = await ctx.db
      .query("featuredApps")
      .collect();

    // Create a map of featured apps for quick lookup
    const featuredMap = new Map(
      featuredApps.map((f) => [f.appId, f.featuredAt])
    );

    // Process and filter apps
    let filteredApps = await Promise.all(
      allApps.map(async (app) => {
        // Get icon URL
        let iconUrl: string | undefined = undefined;
        if (app.iconStorageId) {
          const url = await ctx.storage.getUrl(app.iconStorageId);
          iconUrl = url ?? undefined;
        }

        // Get cover image URL
        let coverImageUrl: string | undefined = undefined;
        if (app.coverImageStorageId) {
          const url = await ctx.storage.getUrl(app.coverImageStorageId);
          coverImageUrl = url ?? undefined;
        }

        const isFeatured = featuredMap.has(app._id);
        const featuredAt = featuredMap.get(app._id);

        return {
          _id: app._id,
          name: app.name,
          description: app.description,
          category: app.category,
          iconUrl,
          coverImageUrl,
          status: app.status,
          isDemo: app.isDemo,
          isFeatured,
          featuredAt,
          createdAt: app.createdAt,
        };
      })
    );

    // Apply filters
    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      filteredApps = filteredApps.filter((app) =>
        app.name.toLowerCase().includes(query) ||
        app.description?.toLowerCase().includes(query)
      );
    }

    if (args.category && args.category !== "all") {
      filteredApps = filteredApps.filter((app) => app.category === args.category);
    }

    if (args.status && args.status !== "all") {
      filteredApps = filteredApps.filter((app) => {
        const appStatus = app.status || "published"; // undefined means published
        return appStatus === args.status;
      });
    }

    if (args.featuredFilter && args.featuredFilter !== "all") {
      if (args.featuredFilter === "featured") {
        filteredApps = filteredApps.filter((app) => app.isFeatured);
      } else {
        filteredApps = filteredApps.filter((app) => !app.isFeatured);
      }
    }

    return filteredApps;
  },
});

