import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { getCurrentUser } from "./profiles";

/**
 * Create a new screenshot style
 */
export const createStyle = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
    status: v.union(v.literal("draft"), v.literal("published")),
    backgroundColor: v.string(),
    details: v.string(),
    textStyle: v.string(),
    deviceStyle: v.string(),
    referenceImageStorageId: v.optional(v.id("_storage")),
    previewImageStorageId: v.optional(v.id("_storage")),
    deviceReferenceImageStorageId: v.optional(v.id("_storage")),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    isFeatured: v.optional(v.boolean()),
  },
  returns: v.id("styles"),
  handler: async (ctx, args) => {
    const now = Date.now();

    // TODO: Get current user profile from auth context
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!profile) {
      throw new Error("Profile not found");
    }

    const styleId = await ctx.db.insert("styles", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      createdBy: profile._id,
      isPublic: args.isPublic,
      status: args.status,
      backgroundColor: args.backgroundColor,
      details: args.details,
      textStyle: args.textStyle,
      deviceStyle: args.deviceStyle,
      referenceImageStorageId: args.referenceImageStorageId,
      previewImageStorageId: args.previewImageStorageId,
      deviceReferenceImageStorageId: args.deviceReferenceImageStorageId,
      tags: args.tags,
      category: args.category,
      usageCount: 0,
      isFeatured: args.isFeatured ?? false,
      createdAt: now,
      updatedAt: now,
    });

    return styleId;
  },
});

/**
 * Create a new screenshot style (internal version for actions)
 */
export const createStyleInternal = internalMutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    createdBy: v.optional(v.id("profiles")),
    isPublic: v.boolean(),
    status: v.union(v.literal("draft"), v.literal("published")),
    backgroundColor: v.string(),
    details: v.string(),
    textStyle: v.string(),
    deviceStyle: v.string(),
    referenceImageStorageId: v.optional(v.id("_storage")),
    previewImageStorageId: v.optional(v.id("_storage")),
    deviceReferenceImageStorageId: v.optional(v.id("_storage")),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    isFeatured: v.optional(v.boolean()),
  },
  returns: v.id("styles"),
  handler: async (ctx, args) => {
    const now = Date.now();

    const styleId = await ctx.db.insert("styles", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      createdBy: args.createdBy,
      isPublic: args.isPublic,
      status: args.status,
      backgroundColor: args.backgroundColor,
      details: args.details,
      textStyle: args.textStyle,
      deviceStyle: args.deviceStyle,
      referenceImageStorageId: args.referenceImageStorageId,
      previewImageStorageId: args.previewImageStorageId,
      deviceReferenceImageStorageId: args.deviceReferenceImageStorageId,
      tags: args.tags,
      category: args.category,
      usageCount: 0,
      isFeatured: args.isFeatured ?? false,
      createdAt: now,
      updatedAt: now,
    });

    return styleId;
  },
});

/**
 * Get all published public styles
 */
export const getPublicStyles = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("styles"),
      _creationTime: v.number(),
      name: v.string(),
      slug: v.string(),
      description: v.optional(v.string()),
      createdBy: v.optional(v.id("profiles")),
      backgroundColor: v.string(),
      details: v.string(),
      textStyle: v.string(),
      deviceStyle: v.string(),
      referenceImageStorageId: v.optional(v.id("_storage")),
      previewImageStorageId: v.optional(v.id("_storage")),
      deviceReferenceImageStorageId: v.optional(v.id("_storage")),
      previewImageUrl: v.union(v.string(), v.null()),
      referenceImageUrl: v.union(v.string(), v.null()),
      deviceReferenceImageUrl: v.union(v.string(), v.null()),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
      isFeatured: v.optional(v.boolean()),
      usageCount: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const styles = await ctx.db
      .query("styles")
      .withIndex("by_public_and_status", (q) =>
        q.eq("isPublic", true).eq("status", "published")
      )
      .collect();

    return Promise.all(
      styles.map(async (style) => {
        // Get image URLs from storage IDs
        let previewImageUrl = null;
        if (style.previewImageStorageId) {
          previewImageUrl = await ctx.storage.getUrl(style.previewImageStorageId);
        }
        let referenceImageUrl = null;
        if (style.referenceImageStorageId) {
          referenceImageUrl = await ctx.storage.getUrl(style.referenceImageStorageId);
        }
        let deviceReferenceImageUrl = null;
        if (style.deviceReferenceImageStorageId) {
          deviceReferenceImageUrl = await ctx.storage.getUrl(style.deviceReferenceImageStorageId);
        }

        return {
          _id: style._id,
          _creationTime: style._creationTime,
          name: style.name,
          slug: style.slug,
          description: style.description,
          createdBy: style.createdBy,
          backgroundColor: style.backgroundColor,
          details: style.details,
          textStyle: style.textStyle,
          deviceStyle: style.deviceStyle,
          referenceImageStorageId: style.referenceImageStorageId,
          previewImageStorageId: style.previewImageStorageId,
          deviceReferenceImageStorageId: style.deviceReferenceImageStorageId,
          previewImageUrl,
          referenceImageUrl,
          deviceReferenceImageUrl,
          tags: style.tags,
          category: style.category,
          isFeatured: style.isFeatured,
          usageCount: style.usageCount,
          createdAt: style.createdAt,
          updatedAt: style.updatedAt,
        };
      })
    );
  },
});

/**
 * Get style by ID (internal - used by screenshotActions and detail page)
 */
export const getStyleById = query({
  args: { styleId: v.id("styles") },
  returns: v.union(
    v.object({
      _id: v.id("styles"),
      _creationTime: v.number(),
      name: v.string(),
      slug: v.string(),
      description: v.optional(v.string()),
      createdBy: v.optional(v.id("profiles")),
      isPublic: v.boolean(),
      status: v.union(v.literal("draft"), v.literal("published")),
      backgroundColor: v.string(),
      details: v.string(),
      textStyle: v.string(),
      deviceStyle: v.string(),
      previewImageStorageId: v.optional(v.id("_storage")),
      previewImageUrl: v.union(v.string(), v.null()),
      referenceImageUrl: v.union(v.string(), v.null()),
      deviceReferenceImageUrl: v.union(v.string(), v.null()),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
      usageCount: v.optional(v.number()),
      isFeatured: v.optional(v.boolean()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const style = await ctx.db.get(args.styleId);
    if (!style) return null;

    // Resolve image URLs
    let previewImageUrl = null;
    if (style.previewImageStorageId) {
      previewImageUrl = await ctx.storage.getUrl(style.previewImageStorageId);
    }
    let referenceImageUrl = null;
    if (style.referenceImageStorageId) {
      referenceImageUrl = await ctx.storage.getUrl(style.referenceImageStorageId);
    }
    let deviceReferenceImageUrl = null;
    if (style.deviceReferenceImageStorageId) {
      deviceReferenceImageUrl = await ctx.storage.getUrl(style.deviceReferenceImageStorageId);
    }

    return {
      _id: style._id,
      _creationTime: style._creationTime,
      name: style.name,
      slug: style.slug,
      description: style.description,
      createdBy: style.createdBy,
      isPublic: style.isPublic,
      status: style.status,
      backgroundColor: style.backgroundColor,
      details: style.details,
      textStyle: style.textStyle,
      deviceStyle: style.deviceStyle,
      previewImageStorageId: style.previewImageStorageId,
      previewImageUrl,
      referenceImageUrl,
      deviceReferenceImageUrl,
      tags: style.tags,
      category: style.category,
      usageCount: style.usageCount,
      isFeatured: style.isFeatured,
      createdAt: style.createdAt,
      updatedAt: style.updatedAt,
    };
  },
});

/**
 * Get style by slug
 */
export const getStyleBySlug = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("styles"),
      _creationTime: v.number(),
      name: v.string(),
      slug: v.string(),
      description: v.optional(v.string()),
      backgroundColor: v.string(),
      details: v.string(),
      textStyle: v.string(),
      deviceStyle: v.string(),
      referenceImageStorageId: v.optional(v.id("_storage")),
      previewImageStorageId: v.optional(v.id("_storage")),
      deviceReferenceImageStorageId: v.optional(v.id("_storage")),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
      isFeatured: v.optional(v.boolean()),
      usageCount: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const style = await ctx.db
      .query("styles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!style) return null;

    return {
      _id: style._id,
      _creationTime: style._creationTime,
      name: style.name,
      slug: style.slug,
      description: style.description,
      backgroundColor: style.backgroundColor,
      details: style.details,
      textStyle: style.textStyle,
      deviceStyle: style.deviceStyle,
      referenceImageStorageId: style.referenceImageStorageId,
      previewImageStorageId: style.previewImageStorageId,
      deviceReferenceImageStorageId: style.deviceReferenceImageStorageId,
      tags: style.tags,
      category: style.category,
      isFeatured: style.isFeatured,
      usageCount: style.usageCount,
      createdAt: style.createdAt,
      updatedAt: style.updatedAt,
    };
  },
});

/**
 * Increment usage count for a style
 */
export const incrementUsage = mutation({
  args: { styleId: v.id("styles") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const style = await ctx.db.get(args.styleId);
    if (!style) {
      throw new Error("Style not found");
    }

    await ctx.db.patch(args.styleId, {
      usageCount: (style.usageCount ?? 0) + 1,
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Publish a draft style (make it visible)
 */
export const publishStyle = mutation({
  args: { styleId: v.id("styles") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const style = await ctx.db.get(args.styleId);
    if (!style) {
      throw new Error("Style not found");
    }

    // TODO: Add auth check - only creator can publish their style

    if (style.status === "published") {
      throw new Error("Style is already published");
    }

    await ctx.db.patch(args.styleId, {
      status: "published",
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Unpublish a style (make it draft again)
 */
export const unpublishStyle = mutation({
  args: { styleId: v.id("styles") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const style = await ctx.db.get(args.styleId);
    if (!style) {
      throw new Error("Style not found");
    }

    // TODO: Add auth check - only creator can unpublish their style

    if (style.status === "draft") {
      throw new Error("Style is already a draft");
    }

    await ctx.db.patch(args.styleId, {
      status: "draft",
      updatedAt: Date.now(),
    });

    return null;
  },
});

export const deleteStyle = mutation({
  args: { styleId: v.id("styles") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const style = await ctx.db.get(args.styleId);
    if (!style) {
      throw new Error("Style not found");
    }

    const profile = await getCurrentUser(ctx);
    if (style.createdBy && (!profile || style.createdBy !== profile._id)) {
      throw new Error("Access denied");
    }

    await ctx.db.delete(args.styleId);
    return null;
  },
});

/**
 * Update style preview image (internal - used by styleActions)
 */
export const updateStylePreviewImage = internalMutation({
  args: {
    styleId: v.id("styles"),
    previewImageStorageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.styleId, {
      previewImageStorageId: args.previewImageStorageId,
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Set demo app and screenshot set for a style (internal - used by demo generation)
 */
export const setStyleDemo = internalMutation({
  args: {
    styleId: v.id("styles"),
    demoAppId: v.id("apps"),
    demoSetId: v.id("screenshotSets"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.styleId, {
      demoAppId: args.demoAppId,
      demoSetId: args.demoSetId,
      updatedAt: Date.now(),
    });

    return null;
  },
});
