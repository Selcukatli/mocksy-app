import { query, mutation, internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";

// ============================================================================
// QUERIES
// ============================================================================

// Query: Get any app by ID (public, no auth check - for migration scripts)
export const getAppById = query({
  args: { appId: v.id("apps") },
  returns: v.union(v.any(), v.null()), // Returns full app document or null
  handler: async (ctx, args) => {
    return await ctx.db.get(args.appId);
  },
});

// Query to get all apps for the current user
export const getApps = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("apps"),
      _creationTime: v.number(),
      profileId: v.id("profiles"),
      conceptId: v.optional(v.id("appConcepts")),
      name: v.string(),
      description: v.optional(v.string()),
      iconStorageId: v.optional(v.id("_storage")),
      iconUrl: v.optional(v.union(v.string(), v.null())),
      coverImageStorageId: v.optional(v.id("_storage")),
      coverImageUrl: v.optional(v.union(v.string(), v.null())),
      coverVideoStorageId: v.optional(v.id("_storage")),
      coverVideoUrl: v.optional(v.union(v.string(), v.null())),
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
      prodAppId: v.optional(v.string()),
      lastPublishedToProdAt: v.optional(v.number()),
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

    // Get icon URLs and cover image URLs for all apps
    const appsWithUrls = await Promise.all(
      apps.map(async (app) => {
        let iconUrl: string | null = null;
        if (app.iconStorageId) {
          iconUrl = await ctx.storage.getUrl(app.iconStorageId);
        }
        let coverImageUrl: string | null = null;
        if (app.coverImageStorageId) {
          coverImageUrl = await ctx.storage.getUrl(app.coverImageStorageId);
        }
        let coverVideoUrl: string | null = null;
        if (app.coverVideoStorageId) {
          coverVideoUrl = await ctx.storage.getUrl(app.coverVideoStorageId);
        }
        return {
          ...app,
          iconUrl: iconUrl ?? undefined,
          coverImageUrl: coverImageUrl ?? undefined,
          coverVideoUrl: coverVideoUrl ?? undefined,
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
      conceptId: v.optional(v.id("appConcepts")),
      name: v.string(),
      description: v.optional(v.string()),
      iconStorageId: v.optional(v.id("_storage")),
      iconUrl: v.optional(v.union(v.string(), v.null())),
      coverImageStorageId: v.optional(v.id("_storage")),
      coverImageUrl: v.optional(v.union(v.string(), v.null())),
      coverVideoStorageId: v.optional(v.id("_storage")),
      coverVideoUrl: v.optional(v.union(v.string(), v.null())),
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
      prodAppId: v.optional(v.string()),
      lastPublishedToProdAt: v.optional(v.number()),
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

    // Get cover image URL if exists
    let coverImageUrl: string | null = null;
    if (app.coverImageStorageId) {
      coverImageUrl = await ctx.storage.getUrl(app.coverImageStorageId);
    }

    // Get cover video URL if exists
    let coverVideoUrl: string | null = null;
    if (app.coverVideoStorageId) {
      coverVideoUrl = await ctx.storage.getUrl(app.coverVideoStorageId);
    }

    return {
      ...app,
      iconUrl: iconUrl ?? undefined,
      coverImageUrl: coverImageUrl ?? undefined,
      coverVideoUrl: coverVideoUrl ?? undefined,
    };
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
        coverImageStorageId: v.optional(v.id("_storage")),
        coverImageUrl: v.optional(v.string()),
        status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
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

    // Get cover image URL if exists
    let coverImageUrl: string | undefined = undefined;
    if (app.coverImageStorageId) {
      const url = await ctx.storage.getUrl(app.coverImageStorageId);
      coverImageUrl = url ?? undefined;
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
        coverImageStorageId: app.coverImageStorageId,
        coverImageUrl,
        status: app.status,
      },
      screens: screensWithUrls,
      totalScreens: appScreens.length,
    };
  },
});

// Public query to get all published demo apps for the explore page
export const getPublicDemoApps = query({
  args: {
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("apps"),
      name: v.string(),
      description: v.optional(v.string()),
      category: v.optional(v.string()),
      iconUrl: v.optional(v.string()),
      coverImageUrl: v.optional(v.string()),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    // Query published demo apps
    const query = ctx.db
      .query("apps")
      .withIndex("by_is_demo", (q) => q.eq("isDemo", true));

    const allDemoApps = await query.collect();

    // Filter for published apps and optionally by category
    const filteredApps = allDemoApps.filter((app) => {
      const isPublished = app.status === "published" || app.status === undefined;
      const matchesCategory = !args.category || app.category === args.category;
      return isPublished && matchesCategory;
    });

    // Sort by creation date (newest first) and limit
    const sortedApps = filteredApps
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);

    // Get icon URLs and cover image URLs
    const appsWithUrls = await Promise.all(
      sortedApps.map(async (app) => {
        let iconUrl: string | undefined = undefined;
        if (app.iconStorageId) {
          const url = await ctx.storage.getUrl(app.iconStorageId);
          iconUrl = url ?? undefined;
        }
        let coverImageUrl: string | undefined = undefined;
        if (app.coverImageStorageId) {
          const url = await ctx.storage.getUrl(app.coverImageStorageId);
          coverImageUrl = url ?? undefined;
        }
        return {
          _id: app._id,
          name: app.name,
          description: app.description,
          category: app.category,
          iconUrl,
          coverImageUrl,
          createdAt: app.createdAt,
        };
      })
    );

    return appsWithUrls;
  },
});

// Public query to get featured demo apps for the carousel
export const getFeaturedApps = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("apps"),
      name: v.string(),
      description: v.optional(v.string()),
      category: v.optional(v.string()),
      iconUrl: v.optional(v.string()),
      coverImageUrl: v.optional(v.string()),
      coverVideoUrl: v.optional(v.string()),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    // Query featured apps, sorted by featuredAt (newest featured first)
    const featuredAppEntries = await ctx.db
      .query("featuredApps")
      .withIndex("by_featured_at")
      .order("desc")
      .take(limit);

    // Get the actual app details for each featured app
    const appsWithUrls = await Promise.all(
      featuredAppEntries.map(async (featuredEntry) => {
        const app = await ctx.db.get(featuredEntry.appId);
        
        // Skip if app doesn't exist or isn't published
        if (!app) return null;
        const isPublished = app.status === "published" || app.status === undefined;
        if (!isPublished) return null;

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

        // Get cover video URL
        let coverVideoUrl: string | undefined = undefined;
        if (app.coverVideoStorageId) {
          const url = await ctx.storage.getUrl(app.coverVideoStorageId);
          coverVideoUrl = url ?? undefined;
        }

        return {
          _id: app._id,
          name: app.name,
          description: app.description,
          category: app.category,
          iconUrl,
          coverImageUrl,
          coverVideoUrl,
          createdAt: app.createdAt,
        };
      })
    );

    // Filter out null entries (unpublished or deleted apps)
    return appsWithUrls.filter((app): app is NonNullable<typeof app> => app !== null);
  },
});

// Public query to get unique categories from published demo apps
export const getAppCategories = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    // Query all published demo apps
    const allDemoApps = await ctx.db
      .query("apps")
      .withIndex("by_is_demo", (q) => q.eq("isDemo", true))
      .collect();

    // Filter for published apps and extract unique categories
    const categories = new Set<string>();
    allDemoApps.forEach((app) => {
      const isPublished = app.status === "published" || app.status === undefined;
      if (isPublished && app.category) {
        categories.add(app.category);
      }
    });

    // Convert to sorted array
    return Array.from(categories).sort();
  },
});

// Public query to get app preview (no authentication required)
export const getPublicAppPreview = query({
  args: { appId: v.id("apps") },
  returns: v.union(
    v.object({
      app: v.object({
        _id: v.id("apps"),
        name: v.string(),
        description: v.optional(v.string()),
        category: v.optional(v.string()),
        iconUrl: v.optional(v.string()),
        coverImageUrl: v.optional(v.string()),
        coverVideoUrl: v.optional(v.string()),
        coverVideoStorageId: v.optional(v.id("_storage")),
        isDemo: v.optional(v.boolean()),
        status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
      }),
      creator: v.optional(
        v.object({
          username: v.optional(v.string()),
          imageUrl: v.optional(v.string()),
        })
      ),
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
    // Get the app (no authentication required)
    const app = await ctx.db.get(args.appId);

    // Return null if app doesn't exist
    if (!app) {
      return null;
    }

    // Get icon URL if exists
    let iconUrl: string | undefined = undefined;
    if (app.iconStorageId) {
      const url = await ctx.storage.getUrl(app.iconStorageId);
      iconUrl = url ?? undefined;
    }

    // Get cover image URL if exists
    let coverImageUrl: string | undefined = undefined;
    if (app.coverImageStorageId) {
      const url = await ctx.storage.getUrl(app.coverImageStorageId);
      coverImageUrl = url ?? undefined;
    }

    // Get cover video URL if exists
    let coverVideoUrl: string | undefined = undefined;
    if (app.coverVideoStorageId) {
      const url = await ctx.storage.getUrl(app.coverVideoStorageId);
      coverVideoUrl = url ?? undefined;
    }

    // Get creator profile
    let creator: { username?: string; imageUrl?: string } | undefined = undefined;
    if (app.profileId) {
      const profile = await ctx.db.get(app.profileId);
      if (profile) {
        // Use username, or fall back to firstName, or "Developer"
        const displayName = profile.username || profile.firstName || undefined;
        creator = {
          username: displayName,
          imageUrl: profile.imageUrl,
        };
      }
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
        iconUrl,
        coverImageUrl,
        coverVideoUrl,
        coverVideoStorageId: app.coverVideoStorageId,
        isDemo: app.isDemo,
        status: app.status,
      },
      creator,
      screens: screensWithUrls,
      totalScreens: appScreens.length,
    };
// ============================================================================
// MUTATIONS
// ============================================================================

  },
});



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

    // 1. Delete all app screens and their storage files
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

    // 2. Delete all reviews for this app
    const reviews = await ctx.db
      .query("appReviews")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .collect();

    for (const review of reviews) {
      await ctx.db.delete(review._id);
    }

    // 3. Delete generation jobs
    const generationJobs = await ctx.db
      .query("appGenerationJobs")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .collect();

    for (const job of generationJobs) {
      await ctx.db.delete(job._id);
    }

    // 4. Remove from featured apps if featured
    const featuredApp = await ctx.db
      .query("featuredApps")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .unique();

    if (featuredApp) {
      await ctx.db.delete(featuredApp._id);
    }

    // 5. Delete the app icon from storage if it exists
    if (app.iconStorageId) {
      await ctx.storage.delete(app.iconStorageId);
    }

    // 6. Delete the cover image from storage if it exists
    if (app.coverImageStorageId) {
      await ctx.storage.delete(app.coverImageStorageId);
    }

    // 7. Finally, delete the app itself
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

// ============================================================================
// INTERNAL QUERIES & MUTATIONS
// ============================================================================

    return null;
  },
});



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
    conceptId: v.optional(v.id("appConcepts")),
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
      conceptId: args.conceptId,
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

