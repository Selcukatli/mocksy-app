import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

/**
 * Create a new screenshot size (internal - called by setup script)
 */
export const createSize = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    platform: v.union(v.literal("ios"), v.literal("android")),
    deviceCategory: v.string(),
    width: v.number(),
    height: v.number(),
    aspectRatio: v.string(),
    displaySize: v.optional(v.string()),
    isRequired: v.boolean(),
    isPrimary: v.boolean(),
    minScreenshots: v.optional(v.number()),
    maxScreenshots: v.optional(v.number()),
    notes: v.optional(v.string()),
    canvasStorageId: v.optional(v.id("_storage")),
  },
  returns: v.id("screenshotSizes"),
  handler: async (ctx, args) => {
    const now = Date.now();

    const sizeId = await ctx.db.insert("screenshotSizes", {
      name: args.name,
      slug: args.slug,
      platform: args.platform,
      deviceCategory: args.deviceCategory,
      width: args.width,
      height: args.height,
      aspectRatio: args.aspectRatio,
      displaySize: args.displaySize,
      isRequired: args.isRequired,
      isPrimary: args.isPrimary,
      minScreenshots: args.minScreenshots,
      maxScreenshots: args.maxScreenshots,
      notes: args.notes,
      canvasStorageId: args.canvasStorageId,
      createdAt: now,
      updatedAt: now,
    });

    return sizeId;
  },
});

/**
 * Update canvas storage ID for a screenshot size
 */
export const updateCanvas = internalMutation({
  args: {
    sizeId: v.id("screenshotSizes"),
    canvasStorageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sizeId, {
      canvasStorageId: args.canvasStorageId,
      updatedAt: Date.now(),
    });
    return null;
  },
});

/**
 * Get all screenshot sizes
 */
export const getAllSizes = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("screenshotSizes"),
      _creationTime: v.number(),
      name: v.string(),
      slug: v.string(),
      platform: v.union(v.literal("ios"), v.literal("android")),
      deviceCategory: v.string(),
      width: v.number(),
      height: v.number(),
      aspectRatio: v.string(),
      canvasStorageId: v.optional(v.id("_storage")),
      displaySize: v.optional(v.string()),
      isRequired: v.boolean(),
      isPrimary: v.boolean(),
      minScreenshots: v.optional(v.number()),
      maxScreenshots: v.optional(v.number()),
      notes: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const sizes = await ctx.db.query("screenshotSizes").collect();
    return sizes.map((size) => ({
      _id: size._id,
      _creationTime: size._creationTime,
      name: size.name,
      slug: size.slug,
      platform: size.platform,
      deviceCategory: size.deviceCategory,
      width: size.width,
      height: size.height,
      aspectRatio: size.aspectRatio,
      canvasStorageId: size.canvasStorageId,
      displaySize: size.displaySize,
      isRequired: size.isRequired,
      isPrimary: size.isPrimary,
      minScreenshots: size.minScreenshots,
      maxScreenshots: size.maxScreenshots,
      notes: size.notes,
      createdAt: size.createdAt,
      updatedAt: size.updatedAt,
    }));
  },
});

/**
 * Get sizes by platform
 */
export const getSizesByPlatform = query({
  args: { platform: v.union(v.literal("ios"), v.literal("android")) },
  returns: v.array(
    v.object({
      _id: v.id("screenshotSizes"),
      _creationTime: v.number(),
      name: v.string(),
      slug: v.string(),
      platform: v.union(v.literal("ios"), v.literal("android")),
      deviceCategory: v.string(),
      width: v.number(),
      height: v.number(),
      aspectRatio: v.string(),
      canvasStorageId: v.optional(v.id("_storage")),
      displaySize: v.optional(v.string()),
      isRequired: v.boolean(),
      isPrimary: v.boolean(),
      minScreenshots: v.optional(v.number()),
      maxScreenshots: v.optional(v.number()),
      notes: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const sizes = await ctx.db
      .query("screenshotSizes")
      .withIndex("by_platform", (q) => q.eq("platform", args.platform))
      .collect();

    return sizes.map((size) => ({
      _id: size._id,
      _creationTime: size._creationTime,
      name: size.name,
      slug: size.slug,
      platform: size.platform,
      deviceCategory: size.deviceCategory,
      width: size.width,
      height: size.height,
      aspectRatio: size.aspectRatio,
      canvasStorageId: size.canvasStorageId,
      displaySize: size.displaySize,
      isRequired: size.isRequired,
      isPrimary: size.isPrimary,
      minScreenshots: size.minScreenshots,
      maxScreenshots: size.maxScreenshots,
      notes: size.notes,
      createdAt: size.createdAt,
      updatedAt: size.updatedAt,
    }));
  },
});

/**
 * Get primary sizes by platform
 */
export const getPrimarySizesByPlatform = query({
  args: { platform: v.union(v.literal("ios"), v.literal("android")) },
  returns: v.array(
    v.object({
      _id: v.id("screenshotSizes"),
      _creationTime: v.number(),
      name: v.string(),
      slug: v.string(),
      platform: v.union(v.literal("ios"), v.literal("android")),
      deviceCategory: v.string(),
      width: v.number(),
      height: v.number(),
      aspectRatio: v.string(),
      canvasStorageId: v.optional(v.id("_storage")),
      displaySize: v.optional(v.string()),
      isRequired: v.boolean(),
      isPrimary: v.boolean(),
      minScreenshots: v.optional(v.number()),
      maxScreenshots: v.optional(v.number()),
      notes: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const sizes = await ctx.db
      .query("screenshotSizes")
      .withIndex("by_platform_and_primary", (q) =>
        q.eq("platform", args.platform).eq("isPrimary", true)
      )
      .collect();

    return sizes.map((size) => ({
      _id: size._id,
      _creationTime: size._creationTime,
      name: size.name,
      slug: size.slug,
      platform: size.platform,
      deviceCategory: size.deviceCategory,
      width: size.width,
      height: size.height,
      aspectRatio: size.aspectRatio,
      canvasStorageId: size.canvasStorageId,
      displaySize: size.displaySize,
      isRequired: size.isRequired,
      isPrimary: size.isPrimary,
      minScreenshots: size.minScreenshots,
      maxScreenshots: size.maxScreenshots,
      notes: size.notes,
      createdAt: size.createdAt,
      updatedAt: size.updatedAt,
    }));
  },
});

/**
 * Get size by ID (internal - used by screenshotActions)
 */
export const getSizeById = query({
  args: { sizeId: v.id("screenshotSizes") },
  returns: v.union(
    v.object({
      _id: v.id("screenshotSizes"),
      canvasStorageId: v.optional(v.id("_storage")),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const size = await ctx.db.get(args.sizeId);
    if (!size) return null;

    return {
      _id: size._id,
      canvasStorageId: size.canvasStorageId,
    };
  },
});

/**
 * Get size by slug
 */
export const getSizeBySlug = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("screenshotSizes"),
      _creationTime: v.number(),
      name: v.string(),
      slug: v.string(),
      platform: v.union(v.literal("ios"), v.literal("android")),
      deviceCategory: v.string(),
      width: v.number(),
      height: v.number(),
      aspectRatio: v.string(),
      canvasStorageId: v.optional(v.id("_storage")),
      displaySize: v.optional(v.string()),
      isRequired: v.boolean(),
      isPrimary: v.boolean(),
      minScreenshots: v.optional(v.number()),
      maxScreenshots: v.optional(v.number()),
      notes: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const size = await ctx.db
      .query("screenshotSizes")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!size) return null;

    return {
      _id: size._id,
      _creationTime: size._creationTime,
      name: size.name,
      slug: size.slug,
      platform: size.platform,
      deviceCategory: size.deviceCategory,
      width: size.width,
      height: size.height,
      aspectRatio: size.aspectRatio,
      canvasStorageId: size.canvasStorageId,
      displaySize: size.displaySize,
      isRequired: size.isRequired,
      isPrimary: size.isPrimary,
      minScreenshots: size.minScreenshots,
      maxScreenshots: size.maxScreenshots,
      notes: size.notes,
      createdAt: size.createdAt,
      updatedAt: size.updatedAt,
    };
  },
});
