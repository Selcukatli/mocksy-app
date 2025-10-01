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
  returns: v.id("screenshotStyles"),
  handler: async (ctx, args) => {
    const now = Date.now();

    // For system styles, createdBy is null
    // For user styles, get current profile (would need auth context)
    const createdBy = args.isSystemStyle ? undefined : undefined; // TODO: Get from auth

    const styleId = await ctx.db.insert("screenshotStyles", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      createdBy,
      isPublic: args.isPublic,
      isSystemStyle: args.isSystemStyle,
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
  returns: v.id("screenshotStyles"),
  handler: async (ctx, args) => {
    const now = Date.now();

    // For system styles, createdBy is null
    // For user styles, get current profile (would need auth context)
    const createdBy = args.isSystemStyle ? undefined : undefined; // TODO: Get from auth

    const styleId = await ctx.db.insert("screenshotStyles", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      createdBy,
      isPublic: args.isPublic,
      isSystemStyle: args.isSystemStyle,
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
 * Get all public styles
 */
export const getPublicStyles = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("screenshotStyles"),
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
      .query("screenshotStyles")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
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
      _id: v.id("screenshotStyles"),
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
      .query("screenshotStyles")
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
  args: { styleId: v.id("screenshotStyles") },
  returns: v.union(
    v.object({
      _id: v.id("screenshotStyles"),
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
      _id: v.id("screenshotStyles"),
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
      .query("screenshotStyles")
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
  args: { styleId: v.id("screenshotStyles") },
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
