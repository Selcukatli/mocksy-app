import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./profiles";

/**
 * Create a new template
 */
export const createTemplate = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentUser(ctx);
    if (!profile) {
      throw new Error("User not found");
    }

    const templateId = await ctx.db.insert("templates", {
      profileId: profile._id,
      name: args.name,
      description: args.description,
      isPublic: args.isPublic,
      usageCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return templateId;
  },
});

/**
 * Get all templates for the current user
 */
export const getMyTemplates = query({
  args: {},
  handler: async (ctx) => {
    const profile = await getCurrentUser(ctx);
    if (!profile) {
      return [];
    }

    const templates = await ctx.db
      .query("templates")
      .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
      .order("desc")
      .collect();

    // For each template, get the active variant and image URL
    const templatesWithVariants = await Promise.all(
      templates.map(async (template) => {
        let activeVariant = null;
        if (template.currentVariantId) {
          activeVariant = await ctx.db.get(template.currentVariantId);
        }
        let imageUrl = null;
        if (template.imageStorageId) {
          imageUrl = await ctx.storage.getUrl(template.imageStorageId);
        }
        return {
          ...template,
          activeVariant,
          imageUrl,
        };
      })
    );

    return templatesWithVariants;
  },
});

/**
 * Get public templates for discovery
 */
export const getPublicTemplates = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    const templates = await ctx.db
      .query("templates")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .order("desc")
      .take(limit);

    // Add profile info, active variant, and image URL
    const templatesWithDetails = await Promise.all(
      templates.map(async (template) => {
        const profile = await ctx.db.get(template.profileId);
        let activeVariant = null;
        if (template.currentVariantId) {
          activeVariant = await ctx.db.get(template.currentVariantId);
        }
        let imageUrl = null;
        if (template.imageStorageId) {
          imageUrl = await ctx.storage.getUrl(template.imageStorageId);
        }
        return {
          ...template,
          profile: profile ? {
            username: profile.username,
            imageUrl: profile.imageUrl,
          } : null,
          activeVariant,
          imageUrl,
        };
      })
    );

    return templatesWithDetails;
  },
});

/**
 * Get a single template by ID
 */
export const getTemplate = query({
  args: {
    templateId: v.id("templates"),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      return null;
    }

    // Check if user has access (owner or public)
    const profile = await getCurrentUser(ctx);
    if (!template.isPublic && (!profile || template.profileId !== profile._id)) {
      throw new Error("Access denied");
    }

    // Get active variant
    let activeVariant = null;
    if (template.currentVariantId) {
      activeVariant = await ctx.db.get(template.currentVariantId);
    }

    // Get image URL
    let imageUrl = null;
    if (template.imageStorageId) {
      imageUrl = await ctx.storage.getUrl(template.imageStorageId);
    }

    // Get all variants for this template
    const variants = await ctx.db
      .query("templateVariants")
      .withIndex("by_template", (q) => q.eq("templateId", args.templateId))
      .order("desc")
      .collect();

    return {
      ...template,
      activeVariant,
      variants,
      imageUrl,
    };
  },
});

/**
 * Update a template
 */
export const updateTemplate = mutation({
  args: {
    templateId: v.id("templates"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Check ownership
    const profile = await getCurrentUser(ctx);
    if (!profile || template.profileId !== profile._id) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.templateId, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.isPublic !== undefined && { isPublic: args.isPublic }),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Delete a template and all its associated data
 */
export const deleteTemplate = mutation({
  args: {
    templateId: v.id("templates"),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Check ownership
    const profile = await getCurrentUser(ctx);
    if (!profile || template.profileId !== profile._id) {
      throw new Error("Access denied");
    }

    // Delete all template variants
    const variants = await ctx.db
      .query("templateVariants")
      .withIndex("by_template", (q) => q.eq("templateId", args.templateId))
      .collect();

    for (const variant of variants) {
      await ctx.db.delete(variant._id);
    }

    // Delete all template screenshots
    const screenshots = await ctx.db
      .query("templateScreenshots")
      .withIndex("by_template", (q) => q.eq("templateId", args.templateId))
      .collect();

    for (const screenshot of screenshots) {
      await ctx.db.delete(screenshot._id);
    }

    // Delete the template itself
    await ctx.db.delete(args.templateId);
  },
});

/**
 * Duplicate a template (for forking public templates)
 */
export const duplicateTemplate = mutation({
  args: {
    templateId: v.id("templates"),
    newName: v.string(),
  },
  handler: async (ctx, args) => {
    const originalTemplate = await ctx.db.get(args.templateId);
    if (!originalTemplate) {
      throw new Error("Template not found");
    }

    const profile = await getCurrentUser(ctx);
    if (!profile) {
      throw new Error("User not found");
    }

    // Check if template is public or owned by user
    if (!originalTemplate.isPublic && originalTemplate.profileId !== profile._id) {
      throw new Error("Access denied");
    }

    // Create new template
    const newTemplateId = await ctx.db.insert("templates", {
      profileId: profile._id,
      name: args.newName,
      description: originalTemplate.description,
      isPublic: false, // Start as private
      usageCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Copy variants if they exist
    if (originalTemplate.currentVariantId) {
      const originalVariant = await ctx.db.get(originalTemplate.currentVariantId);
      if (originalVariant) {
        const newVariantId = await ctx.db.insert("templateVariants", {
          templateId: newTemplateId,
          version: 1,
          basePrompt: originalVariant.basePrompt,
          styleSettings: originalVariant.styleSettings,
          deviceFrameSettings: originalVariant.deviceFrameSettings,
          isActive: true,
          notes: "Duplicated from original template",
          createdAt: Date.now(),
        });

        // Update template with current variant
        await ctx.db.patch(newTemplateId, {
          currentVariantId: newVariantId,
        });
      }
    }

    return newTemplateId;
  },
});

/**
 * Increment usage count when a template is used
 */
export const incrementUsageCount = mutation({
  args: {
    templateId: v.id("templates"),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    await ctx.db.patch(args.templateId, {
      usageCount: (template.usageCount || 0) + 1,
    });
  },
});