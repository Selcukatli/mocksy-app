import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./profiles";
import { Id } from "./_generated/dataModel";

/**
 * Create a new screenshot from a template
 */
export const createTemplateScreenshot = mutation({
  args: {
    templateVariantId: v.id("templateVariants"),
    appId: v.optional(v.id("apps")),
    headerText: v.string(),
    subheaderText: v.optional(v.string()),
    layoutSettings: v.object({
      textPosition: v.union(
        v.literal("top"),
        v.literal("bottom"),
        v.literal("overlay-top"),
        v.literal("overlay-bottom")
      ),
      textAlignment: v.union(
        v.literal("left"),
        v.literal("center"),
        v.literal("right")
      ),
      headerStyle: v.optional(v.object({
        fontSize: v.optional(v.string()),
        fontWeight: v.optional(v.string()),
        color: v.optional(v.string()),
      })),
      subheaderStyle: v.optional(v.object({
        fontSize: v.optional(v.string()),
        fontWeight: v.optional(v.string()),
        color: v.optional(v.string()),
      })),
    }),
    sourceScreenId: v.optional(v.id("appScreens")),
    slotNumber: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentUser(ctx);
    if (!profile) {
      throw new Error("User not found");
    }

    // Get the variant and template
    const variant = await ctx.db.get(args.templateVariantId);
    if (!variant) {
      throw new Error("Template variant not found");
    }

    const template = await ctx.db.get(variant.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Check access (owner or public template)
    if (!template.isPublic && template.profileId !== profile._id) {
      throw new Error("Access denied");
    }

    // Verify app ownership if provided
    if (args.appId) {
      const app = await ctx.db.get(args.appId);
      if (!app || app.profileId !== profile._id) {
        throw new Error("App not found or access denied");
      }
    }

    // Create the screenshot
    const screenshotId = await ctx.db.insert("templateScreenshots", {
      templateVariantId: args.templateVariantId,
      templateId: variant.templateId,
      appId: args.appId,
      headerText: args.headerText,
      subheaderText: args.subheaderText,
      layoutSettings: args.layoutSettings,
      sourceScreenId: args.sourceScreenId,
      slotNumber: args.slotNumber,
      tags: args.tags,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Increment template usage count
    await ctx.db.patch(variant.templateId, {
      usageCount: (template.usageCount || 0) + 1,
    });

    return screenshotId;
  },
});

/**
 * Update a template screenshot
 */
export const updateTemplateScreenshot = mutation({
  args: {
    screenshotId: v.id("templateScreenshots"),
    headerText: v.optional(v.string()),
    subheaderText: v.optional(v.string()),
    layoutSettings: v.optional(v.object({
      textPosition: v.union(
        v.literal("top"),
        v.literal("bottom"),
        v.literal("overlay-top"),
        v.literal("overlay-bottom")
      ),
      textAlignment: v.union(
        v.literal("left"),
        v.literal("center"),
        v.literal("right")
      ),
      headerStyle: v.optional(v.object({
        fontSize: v.optional(v.string()),
        fontWeight: v.optional(v.string()),
        color: v.optional(v.string()),
      })),
      subheaderStyle: v.optional(v.object({
        fontSize: v.optional(v.string()),
        fontWeight: v.optional(v.string()),
        color: v.optional(v.string()),
      })),
    })),
    imageStorageId: v.optional(v.id("_storage")),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const screenshot = await ctx.db.get(args.screenshotId);
    if (!screenshot) {
      throw new Error("Screenshot not found");
    }

    // Check ownership through template
    const template = await ctx.db.get(screenshot.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    const profile = await getCurrentUser(ctx);
    if (!profile || template.profileId !== profile._id) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.screenshotId, {
      ...(args.headerText !== undefined && { headerText: args.headerText }),
      ...(args.subheaderText !== undefined && { subheaderText: args.subheaderText }),
      ...(args.layoutSettings !== undefined && { layoutSettings: args.layoutSettings }),
      ...(args.imageStorageId !== undefined && { imageStorageId: args.imageStorageId }),
      ...(args.tags !== undefined && { tags: args.tags }),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Get screenshots for a template
 */
export const getTemplateScreenshots = query({
  args: {
    templateId: v.id("templates"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Check access
    const profile = await getCurrentUser(ctx);
    if (!template.isPublic && (!profile || template.profileId !== profile._id)) {
      throw new Error("Access denied");
    }

    const limit = args.limit || 20;
    const screenshots = await ctx.db
      .query("templateScreenshots")
      .withIndex("by_template", (q) => q.eq("templateId", args.templateId))
      .order("desc")
      .take(limit);

    // Add image URLs
    const screenshotsWithUrls = await Promise.all(
      screenshots.map(async (screenshot) => {
        let imageUrl = null;
        if (screenshot.imageStorageId) {
          imageUrl = await ctx.storage.getUrl(screenshot.imageStorageId);
        }
        return {
          ...screenshot,
          imageUrl,
        };
      })
    );

    return screenshotsWithUrls;
  },
});

/**
 * Get screenshots for a specific variant version
 */
export const getVariantScreenshots = query({
  args: {
    templateVariantId: v.id("templateVariants"),
  },
  handler: async (ctx, args) => {
    const variant = await ctx.db.get(args.templateVariantId);
    if (!variant) {
      throw new Error("Variant not found");
    }

    const template = await ctx.db.get(variant.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Check access
    const profile = await getCurrentUser(ctx);
    if (!template.isPublic && (!profile || template.profileId !== profile._id)) {
      throw new Error("Access denied");
    }

    const screenshots = await ctx.db
      .query("templateScreenshots")
      .withIndex("by_template_variant", (q) => q.eq("templateVariantId", args.templateVariantId))
      .order("desc")
      .collect();

    // Add image URLs
    const screenshotsWithUrls = await Promise.all(
      screenshots.map(async (screenshot) => {
        let imageUrl = null;
        if (screenshot.imageStorageId) {
          imageUrl = await ctx.storage.getUrl(screenshot.imageStorageId);
        }
        return {
          ...screenshot,
          imageUrl,
        };
      })
    );

    return screenshotsWithUrls;
  },
});

/**
 * Delete a template screenshot
 */
export const deleteTemplateScreenshot = mutation({
  args: {
    screenshotId: v.id("templateScreenshots"),
  },
  handler: async (ctx, args) => {
    const screenshot = await ctx.db.get(args.screenshotId);
    if (!screenshot) {
      throw new Error("Screenshot not found");
    }

    const template = await ctx.db.get(screenshot.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Check ownership
    const profile = await getCurrentUser(ctx);
    if (!profile || template.profileId !== profile._id) {
      throw new Error("Access denied");
    }

    await ctx.db.delete(args.screenshotId);
  },
});

/**
 * Batch create screenshots for a template
 */
export const batchCreateScreenshots = mutation({
  args: {
    templateVariantId: v.id("templateVariants"),
    appId: v.optional(v.id("apps")),
    screenshots: v.array(v.object({
      headerText: v.string(),
      subheaderText: v.optional(v.string()),
      layoutSettings: v.object({
        textPosition: v.union(
          v.literal("top"),
          v.literal("bottom"),
          v.literal("overlay-top"),
          v.literal("overlay-bottom")
        ),
        textAlignment: v.union(
          v.literal("left"),
          v.literal("center"),
          v.literal("right")
        ),
        headerStyle: v.optional(v.object({
          fontSize: v.optional(v.string()),
          fontWeight: v.optional(v.string()),
          color: v.optional(v.string()),
        })),
        subheaderStyle: v.optional(v.object({
          fontSize: v.optional(v.string()),
          fontWeight: v.optional(v.string()),
          color: v.optional(v.string()),
        })),
      }),
      sourceScreenId: v.optional(v.id("appScreens")),
      slotNumber: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentUser(ctx);
    if (!profile) {
      throw new Error("User not found");
    }

    const variant = await ctx.db.get(args.templateVariantId);
    if (!variant) {
      throw new Error("Template variant not found");
    }

    const template = await ctx.db.get(variant.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Check access
    if (!template.isPublic && template.profileId !== profile._id) {
      throw new Error("Access denied");
    }

    const screenshotIds: Id<"templateScreenshots">[] = [];

    for (const screenshot of args.screenshots) {
      const id = await ctx.db.insert("templateScreenshots", {
        templateVariantId: args.templateVariantId,
        templateId: variant.templateId,
        appId: args.appId,
        headerText: screenshot.headerText,
        subheaderText: screenshot.subheaderText,
        layoutSettings: screenshot.layoutSettings,
        sourceScreenId: screenshot.sourceScreenId,
        slotNumber: screenshot.slotNumber,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      screenshotIds.push(id);
    }

    // Update usage count once for the batch
    await ctx.db.patch(variant.templateId, {
      usageCount: (template.usageCount || 0) + args.screenshots.length,
    });

    return screenshotIds;
  },
});

/**
 * Copy screenshot to another template
 */
export const copyScreenshotToTemplate = mutation({
  args: {
    screenshotId: v.id("templateScreenshots"),
    targetTemplateVariantId: v.id("templateVariants"),
  },
  handler: async (ctx, args) => {
    const screenshot = await ctx.db.get(args.screenshotId);
    if (!screenshot) {
      throw new Error("Screenshot not found");
    }

    const targetVariant = await ctx.db.get(args.targetTemplateVariantId);
    if (!targetVariant) {
      throw new Error("Target template variant not found");
    }

    const targetTemplate = await ctx.db.get(targetVariant.templateId);
    if (!targetTemplate) {
      throw new Error("Target template not found");
    }

    // Check ownership of target template
    const profile = await getCurrentUser(ctx);
    if (!profile || targetTemplate.profileId !== profile._id) {
      throw new Error("Access denied to target template");
    }

    // Create copy
    const newScreenshotId = await ctx.db.insert("templateScreenshots", {
      templateVariantId: args.targetTemplateVariantId,
      templateId: targetVariant.templateId,
      appId: screenshot.appId,
      headerText: screenshot.headerText,
      subheaderText: screenshot.subheaderText,
      layoutSettings: screenshot.layoutSettings,
      sourceScreenId: screenshot.sourceScreenId,
      tags: screenshot.tags,
      generationSettings: screenshot.generationSettings,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return newScreenshotId;
  },
});