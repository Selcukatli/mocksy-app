import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

/**
 * Create a new screenshot style
 */
export const createStyle = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
    isSystemStyle: v.boolean(),
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

    // For system styles, createdBy is null
    // For user styles, get current profile (would need auth context)
    const createdBy = args.isSystemStyle ? undefined : undefined; // TODO: Get from auth

    const styleId = await ctx.db.insert("styles", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      createdBy,
      isPublic: args.isPublic,
      isSystemStyle: args.isSystemStyle,
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
    isPublic: v.boolean(),
    isSystemStyle: v.boolean(),
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

    // For system styles, createdBy is null
    // For user styles, get current profile (would need auth context)
    const createdBy = args.isSystemStyle ? undefined : undefined; // TODO: Get from auth

    const styleId = await ctx.db.insert("styles", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      createdBy,
      isPublic: args.isPublic,
      isSystemStyle: args.isSystemStyle,
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
    })
  ),
  handler: async (ctx) => {
    const styles = await ctx.db
      .query("styles")
      .withIndex("by_public_and_status", (q) =>
        q.eq("isPublic", true).eq("status", "published")
      )
      .collect();

    return styles.map((style) => ({
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
    }));
  },
});

/**
 * Get all system styles
 */
export const getSystemStyles = query({
  args: {},
  returns: v.array(
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
    })
  ),
  handler: async (ctx) => {
    const styles = await ctx.db
      .query("styles")
      .withIndex("by_system", (q) => q.eq("isSystemStyle", true))
      .collect();

    return styles.map((style) => ({
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
    }));
  },
});

/**
 * Get style by ID (internal - used by screenshotActions)
 */
export const getStyleById = query({
  args: { styleId: v.id("styles") },
  returns: v.union(
    v.object({
      _id: v.id("styles"),
      backgroundColor: v.string(),
      details: v.string(),
      textStyle: v.string(),
      deviceStyle: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const style = await ctx.db.get(args.styleId);
    if (!style) return null;

    return {
      _id: style._id,
      backgroundColor: style.backgroundColor,
      details: style.details,
      textStyle: style.textStyle,
      deviceStyle: style.deviceStyle,
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

    if (style.isSystemStyle) {
      throw new Error("Cannot unpublish system styles");
    }

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
