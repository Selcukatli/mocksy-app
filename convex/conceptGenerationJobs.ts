import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

/**
 * Internal: Create a new concept generation job
 */
export const createConceptGenerationJob = internalMutation({
  args: {
    profileId: v.id("profiles"),
    status: v.union(
      v.literal("generating_concepts"),
      v.literal("generating_images"),
      v.literal("completed"),
      v.literal("failed")
    ),
  },
  returns: v.id("conceptGenerationJobs"),
  handler: async (ctx, args): Promise<Id<"conceptGenerationJobs">> => {
    const now = Date.now();
    const jobId = await ctx.db.insert("conceptGenerationJobs", {
      profileId: args.profileId,
      status: args.status,
      createdAt: now,
      updatedAt: now,
    });
    return jobId;
  },
});

/**
 * Internal: Update concept generation job with text concepts
 */
export const updateConceptsText = internalMutation({
  args: {
    jobId: v.id("conceptGenerationJobs"),
    concepts: v.array(
      v.object({
        app_name: v.string(),
        app_subtitle: v.string(),
        app_description: v.string(),
        app_category: v.optional(v.string()), // Optional for backward compatibility
        style_description: v.string(),
        app_icon_prompt: v.string(),
        cover_image_prompt: v.string(),
        // Structured design system fields
        colors: v.optional(
          v.object({
            primary: v.string(),
            background: v.string(),
            text: v.string(),
            accent: v.string(),
          })
        ),
        typography: v.optional(
          v.object({
            headlineFont: v.string(),
            headlineSize: v.string(),
            headlineWeight: v.string(),
            bodyFont: v.string(),
            bodySize: v.string(),
            bodyWeight: v.string(),
          })
        ),
        effects: v.optional(
          v.object({
            cornerRadius: v.string(),
            shadowStyle: v.string(),
            designPhilosophy: v.string(),
          })
        ),
      })
    ),
    status: v.optional(
      v.union(
        v.literal("generating_concepts"),
        v.literal("generating_images"),
        v.literal("completed"),
        v.literal("failed")
      )
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.jobId, {
      concepts: args.concepts.map((c) => ({
        ...c,
        icon_url: undefined,
        cover_url: undefined,
      })),
      status: args.status || "generating_images",
      updatedAt: now,
    });
  },
});

/**
 * Internal: Update a specific concept's images
 */
export const updateConceptImages = internalMutation({
  args: {
    jobId: v.id("conceptGenerationJobs"),
    conceptIndex: v.number(),
    iconUrl: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job || !job.concepts) {
      throw new Error("Job or concepts not found");
    }

    const updatedConcepts = job.concepts.map((concept, i) => {
      if (i === args.conceptIndex) {
        return {
          ...concept,
          icon_url: args.iconUrl ?? concept.icon_url,
          cover_url: args.coverUrl ?? concept.cover_url,
        };
      }
      return concept;
    });

    // Check if all images are generated
    const allComplete = updatedConcepts.every((c) => c.icon_url && c.cover_url);

    await ctx.db.patch(args.jobId, {
      concepts: updatedConcepts,
      status: allComplete ? "completed" : "generating_images",
      updatedAt: Date.now(),
    });
  },
});

/**
 * Internal: Mark job as failed
 */
export const failConceptGenerationJob = internalMutation({
  args: {
    jobId: v.id("conceptGenerationJobs"),
    error: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      status: "failed",
      error: args.error,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Query: Get concept generation job by ID
 */
export const getConceptGenerationJob = query({
  args: {
    jobId: v.id("conceptGenerationJobs"),
  },
  returns: v.union(
    v.object({
      _id: v.id("conceptGenerationJobs"),
      _creationTime: v.number(),
      profileId: v.id("profiles"),
      status: v.union(
        v.literal("generating_concepts"),
        v.literal("generating_images"),
        v.literal("completed"),
        v.literal("failed")
      ),
      concepts: v.optional(
        v.array(
          v.object({
            app_name: v.string(),
            app_subtitle: v.string(),
            app_description: v.string(),
            app_category: v.optional(v.string()), // Optional for backward compatibility
            style_description: v.string(),
            app_icon_prompt: v.string(),
            cover_image_prompt: v.string(),
            icon_url: v.optional(v.string()),
            cover_url: v.optional(v.string()),
            // Structured design system fields
            colors: v.optional(
              v.object({
                primary: v.string(),
                background: v.string(),
                text: v.string(),
                accent: v.string(),
              })
            ),
            typography: v.optional(
              v.object({
                headlineFont: v.string(),
                headlineSize: v.string(),
                headlineWeight: v.string(),
                bodyFont: v.string(),
                bodySize: v.string(),
                bodyWeight: v.string(),
              })
            ),
            effects: v.optional(
              v.object({
                cornerRadius: v.string(),
                shadowStyle: v.string(),
                designPhilosophy: v.string(),
              })
            ),
          })
        )
      ),
      error: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const job = await ctx.db.get(args.jobId);
    if (!job) {
      return null;
    }

    // Ensure user owns this job
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .first();

    if (!profile || job.profileId !== profile._id) {
      return null;
    }

    return job;
  },
});

