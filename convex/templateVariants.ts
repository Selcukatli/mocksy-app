import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./profiles";

/**
 * Create a new variant for a template
 */
export const createVariant = mutation({
  args: {
    templateId: v.id("templates"),
    basePrompt: v.string(),
    styleSettings: v.object({
      colorScheme: v.optional(v.string()),
      artStyle: v.optional(v.string()),
      mood: v.optional(v.string()),
      effects: v.optional(v.array(v.string())),
    }),
    deviceFrameSettings: v.optional(v.object({
      showFrame: v.boolean(),
      frameColor: v.string(),
      frameThickness: v.number(),
      showDynamicIsland: v.optional(v.boolean()),
    })),
    notes: v.optional(v.string()),
    setAsActive: v.optional(v.boolean()),
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

    // Get the next version number
    const existingVariants = await ctx.db
      .query("templateVariants")
      .withIndex("by_template", (q) => q.eq("templateId", args.templateId))
      .collect();

    const nextVersion = existingVariants.length > 0
      ? Math.max(...existingVariants.map(v => v.version)) + 1
      : 1;

    // If setting as active, deactivate other versions
    if (args.setAsActive) {
      for (const variant of existingVariants) {
        if (variant.isActive) {
          await ctx.db.patch(variant._id, { isActive: false });
        }
      }
    }

    // Create the new variant
    const variantId = await ctx.db.insert("templateVariants", {
      templateId: args.templateId,
      version: nextVersion,
      basePrompt: args.basePrompt,
      styleSettings: args.styleSettings,
      deviceFrameSettings: args.deviceFrameSettings,
      isActive: args.setAsActive || existingVariants.length === 0,
      notes: args.notes,
      createdAt: Date.now(),
    });

    // Update template's current variant if this is active
    if (args.setAsActive || existingVariants.length === 0) {
      await ctx.db.patch(args.templateId, {
        currentVariantId: variantId,
        updatedAt: Date.now(),
      });
    }

    return variantId;
  },
});

/**
 * Update an existing variant
 */
export const updateVariant = mutation({
  args: {
    variantId: v.id("templateVariants"),
    basePrompt: v.optional(v.string()),
    styleSettings: v.optional(v.object({
      colorScheme: v.optional(v.string()),
      artStyle: v.optional(v.string()),
      mood: v.optional(v.string()),
      effects: v.optional(v.array(v.string())),
    })),
    deviceFrameSettings: v.optional(v.object({
      showFrame: v.boolean(),
      frameColor: v.string(),
      frameThickness: v.number(),
      showDynamicIsland: v.optional(v.boolean()),
    })),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const variant = await ctx.db.get(args.variantId);
    if (!variant) {
      throw new Error("Variant not found");
    }

    const template = await ctx.db.get(variant.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Check ownership
    const profile = await getCurrentUser(ctx);
    if (!profile || template.profileId !== profile._id) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.variantId, {
      ...(args.basePrompt !== undefined && { basePrompt: args.basePrompt }),
      ...(args.styleSettings !== undefined && { styleSettings: args.styleSettings }),
      ...(args.deviceFrameSettings !== undefined && { deviceFrameSettings: args.deviceFrameSettings }),
      ...(args.notes !== undefined && { notes: args.notes }),
    });

    // Update template's updatedAt
    await ctx.db.patch(variant.templateId, {
      updatedAt: Date.now(),
    });
  },
});

/**
 * Set a variant as active
 */
export const setActiveVariant = mutation({
  args: {
    variantId: v.id("templateVariants"),
  },
  handler: async (ctx, args) => {
    const variant = await ctx.db.get(args.variantId);
    if (!variant) {
      throw new Error("Variant not found");
    }

    const template = await ctx.db.get(variant.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Check ownership
    const profile = await getCurrentUser(ctx);
    if (!profile || template.profileId !== profile._id) {
      throw new Error("Access denied");
    }

    // Deactivate all other variants for this template
    const allVariants = await ctx.db
      .query("templateVariants")
      .withIndex("by_template", (q) => q.eq("templateId", variant.templateId))
      .collect();

    for (const v of allVariants) {
      if (v._id !== args.variantId && v.isActive) {
        await ctx.db.patch(v._id, { isActive: false });
      }
    }

    // Activate this variant
    await ctx.db.patch(args.variantId, { isActive: true });

    // Update template's current variant
    await ctx.db.patch(variant.templateId, {
      currentVariantId: args.variantId,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Get all variant versions for a template
 */
export const getTemplateVariants = query({
  args: {
    templateId: v.id("templates"),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Check if user has access
    const profile = await getCurrentUser(ctx);
    if (!template.isPublic && (!profile || template.profileId !== profile._id)) {
      throw new Error("Access denied");
    }

    const variants = await ctx.db
      .query("templateVariants")
      .withIndex("by_template_and_version", (q) => q.eq("templateId", args.templateId))
      .order("desc")
      .collect();

    return variants;
  },
});

/**
 * Delete a variant version
 */
export const deleteVariant = mutation({
  args: {
    variantId: v.id("templateVariants"),
  },
  handler: async (ctx, args) => {
    const variant = await ctx.db.get(args.variantId);
    if (!variant) {
      throw new Error("Variant not found");
    }

    const template = await ctx.db.get(variant.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Check ownership
    const profile = await getCurrentUser(ctx);
    if (!profile || template.profileId !== profile._id) {
      throw new Error("Access denied");
    }

    // Don't allow deleting the only variant
    const allVariants = await ctx.db
      .query("templateVariants")
      .withIndex("by_template", (q) => q.eq("templateId", variant.templateId))
      .collect();

    if (allVariants.length <= 1) {
      throw new Error("Cannot delete the last variant version");
    }

    // If this was active, activate another version
    if (variant.isActive) {
      const otherVariant = allVariants.find(v => v._id !== args.variantId);
      if (otherVariant) {
        await ctx.db.patch(otherVariant._id, { isActive: true });
        await ctx.db.patch(variant.templateId, {
          currentVariantId: otherVariant._id,
        });
      }
    }

    // Delete associated screenshots
    const screenshots = await ctx.db
      .query("templateScreenshots")
      .withIndex("by_template_variant", (q) => q.eq("templateVariantId", args.variantId))
      .collect();

    for (const screenshot of screenshots) {
      await ctx.db.delete(screenshot._id);
    }

    // Delete the variant
    await ctx.db.delete(args.variantId);
  },
});

/**
 * Compare two variant versions
 */
export const compareVariants = query({
  args: {
    variantId1: v.id("templateVariants"),
    variantId2: v.id("templateVariants"),
  },
  handler: async (ctx, args) => {
    const variant1 = await ctx.db.get(args.variantId1);
    const variant2 = await ctx.db.get(args.variantId2);

    if (!variant1 || !variant2) {
      throw new Error("One or both variants not found");
    }

    if (variant1.templateId !== variant2.templateId) {
      throw new Error("Variants must belong to the same template");
    }

    const template = await ctx.db.get(variant1.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Check access
    const profile = await getCurrentUser(ctx);
    if (!template.isPublic && (!profile || template.profileId !== profile._id)) {
      throw new Error("Access denied");
    }

    return {
      variant1,
      variant2,
      differences: {
        basePrompt: variant1.basePrompt !== variant2.basePrompt,
        colorScheme: variant1.styleSettings.colorScheme !== variant2.styleSettings.colorScheme,
        artStyle: variant1.styleSettings.artStyle !== variant2.styleSettings.artStyle,
        mood: variant1.styleSettings.mood !== variant2.styleSettings.mood,
        effects: JSON.stringify(variant1.styleSettings.effects) !== JSON.stringify(variant2.styleSettings.effects),
        deviceFrameSettings: JSON.stringify(variant1.deviceFrameSettings) !== JSON.stringify(variant2.deviceFrameSettings),
      },
    };
  },
});