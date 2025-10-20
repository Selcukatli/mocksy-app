import { v } from "convex/values";
import { query, internalMutation, internalQuery } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";

// ============================================
// CONCEPT GENERATION JOBS
// ============================================

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
        app_category: v.optional(v.string()),
        style_description: v.string(),
        app_icon_prompt: v.string(),
        cover_image_prompt: v.string(),
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
 * Internal: Mark concept generation job as failed
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
            app_category: v.optional(v.string()),
            style_description: v.string(),
            app_icon_prompt: v.string(),
            cover_image_prompt: v.string(),
            icon_url: v.optional(v.string()),
            cover_url: v.optional(v.string()),
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

// ============================================
// APP GENERATION JOBS
// ============================================

const jobStatusValidator = v.union(
  v.literal("pending"),
  v.literal("downloading_images"),
  v.literal("generating_structure"),
  v.literal("preview_ready"),
  v.literal("generating_concept"),
  v.literal("generating_icon"),
  v.literal("generating_screens"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("partial")
);

const failedScreenValidator = v.object({
  screenName: v.string(),
  errorMessage: v.string(),
});

// Create a new app generation job
export const createAppGenerationJob = internalMutation({
  args: {
    profileId: v.id("profiles"),
    appId: v.id("apps"),
    status: jobStatusValidator,
    currentStep: v.string(),
    progressPercentage: v.optional(v.number()),
    screensGenerated: v.number(),
    screensTotal: v.number(),
  },
  returns: v.id("appGenerationJobs"),
  handler: async (ctx, args) => {
    const now = Date.now();

    const jobId = await ctx.db.insert("appGenerationJobs", {
      profileId: args.profileId,
      appId: args.appId,
      status: args.status,
      currentStep: args.currentStep,
      progressPercentage: args.progressPercentage ?? 0,
      screensGenerated: args.screensGenerated,
      screensTotal: args.screensTotal,
      createdAt: now,
      updatedAt: now,
    });

    return jobId;
  },
});

// Update an existing app generation job
export const updateAppGenerationJob = internalMutation({
  args: {
    jobId: v.id("appGenerationJobs"),
    status: v.optional(jobStatusValidator),
    currentStep: v.optional(v.string()),
    progressPercentage: v.optional(v.number()),
    screensGenerated: v.optional(v.number()),
    screensTotal: v.optional(v.number()),
    failedScreens: v.optional(v.array(failedScreenValidator)),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const updates: {
      updatedAt: number;
      status?: typeof args.status;
      currentStep?: string;
      progressPercentage?: number;
      screensGenerated?: number;
      screensTotal?: number;
      failedScreens?: typeof args.failedScreens;
      error?: string;
    } = {
      updatedAt: Date.now(),
    };

    if (args.status !== undefined) {
      updates.status = args.status;
    }
    if (args.currentStep !== undefined) {
      updates.currentStep = args.currentStep;
    }
    if (args.progressPercentage !== undefined) {
      updates.progressPercentage = args.progressPercentage;
    }
    if (args.screensGenerated !== undefined) {
      updates.screensGenerated = args.screensGenerated;
    }
    if (args.screensTotal !== undefined) {
      updates.screensTotal = args.screensTotal;
    }
    if (args.failedScreens !== undefined) {
      updates.failedScreens = args.failedScreens;
    }
    if (args.error !== undefined) {
      updates.error = args.error;
    }

    await ctx.db.patch(args.jobId, updates);
    return null;
  },
});

// Get app generation job by app ID
export const getAppGenerationJobByAppId = query({
  args: {
    appId: v.id("apps"),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("appGenerationJobs"),
      appId: v.id("apps"),
      status: jobStatusValidator,
      currentStep: v.string(),
      progressPercentage: v.optional(v.number()),
      screensGenerated: v.number(),
      screensTotal: v.number(),
      failedScreens: v.optional(v.array(failedScreenValidator)),
      error: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!profile) {
      return null;
    }

    const job = await ctx.db
      .query("appGenerationJobs")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .order("desc")
      .first();

    if (!job || job.profileId !== profile._id) {
      return null;
    }

    return {
      _id: job._id,
      appId: job.appId,
      status: job.status,
      currentStep: job.currentStep,
      progressPercentage: job.progressPercentage,
      screensGenerated: job.screensGenerated,
      screensTotal: job.screensTotal,
      failedScreens: job.failedScreens,
      error: job.error,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  },
});

// Increment screen count atomically (for concurrent screen generation)
export const incrementScreenCount = internalMutation({
  args: {
    jobId: v.id("appGenerationJobs"),
    progressPercentage: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    await ctx.db.patch(args.jobId, {
      screensGenerated: job.screensGenerated + 1,
      progressPercentage: args.progressPercentage,
      currentStep: `Generated ${job.screensGenerated + 1}/${job.screensTotal} screens`,
      updatedAt: Date.now(),
    });

    return null;
  },
});

// Get all active app generation jobs for current user
export const getActiveAppGenerationJobs = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("appGenerationJobs"),
      appId: v.id("apps"),
      status: jobStatusValidator,
      currentStep: v.string(),
      progressPercentage: v.optional(v.number()),
      screensGenerated: v.number(),
      screensTotal: v.number(),
      failedScreens: v.optional(v.array(failedScreenValidator)),
      error: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!profile) {
      return [];
    }

    const jobs = await ctx.db
      .query("appGenerationJobs")
      .withIndex("by_profile_and_status", (q) => q.eq("profileId", profile._id))
      .collect();

    // Filter for active jobs (not completed, failed, or partial)
    const activeJobs = jobs.filter(
      (job) =>
        job.status !== "completed" &&
        job.status !== "failed" &&
        job.status !== "partial"
    );

    return activeJobs.map((job) => ({
      _id: job._id,
      appId: job.appId,
      status: job.status,
      currentStep: job.currentStep,
      progressPercentage: job.progressPercentage,
      screensGenerated: job.screensGenerated,
      screensTotal: job.screensTotal,
      failedScreens: job.failedScreens,
      error: job.error,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    }));
  },
});

// ============================================
// GENERATION JOBS (cover image, cover video, icon, description)
// ============================================

// Query: Get active generation job for an app by type
export const getActiveGenerationJob = query({
  args: {
    appId: v.id("apps"),
    type: v.union(
      v.literal("coverImage"), 
      v.literal("coverVideo"), 
      v.literal("icon"),
      v.literal("improveAppDescription")
    ),
  },
  returns: v.union(
    v.object({
      _id: v.id("generationJobs"),
      _creationTime: v.number(),
      type: v.union(
        v.literal("coverImage"), 
        v.literal("coverVideo"), 
        v.literal("icon"),
        v.literal("improveAppDescription")
      ),
      appId: v.id("apps"),
      profileId: v.id("profiles"),
      status: v.union(
        v.literal("pending"),
        v.literal("generating"),
        v.literal("completed"),
        v.literal("failed")
      ),
      metadata: v.any(),
      result: v.optional(v.string()),
      error: v.optional(v.string()),
      createdAt: v.number(),
      completedAt: v.optional(v.number()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    // Get authenticated user's profile
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!profile) {
      return null;
    }

    // Query jobs by appId + type + status (pending/generating)
    const job = await ctx.db
      .query("generationJobs")
      .withIndex("by_app_and_type", (q) => q.eq("appId", args.appId).eq("type", args.type))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("status"), "generating")
        )
      )
      .first();

    // Return active job if it belongs to the user
    if (job && job.profileId === profile._id) {
      return job;
    }

    return null;
  },
});

// Internal query: Get job by ID
export const getJobById = internalQuery({
  args: {
    jobId: v.id("generationJobs"),
  },
  returns: v.union(
    v.object({
      _id: v.id("generationJobs"),
      _creationTime: v.number(),
      type: v.union(
        v.literal("coverImage"),
        v.literal("coverVideo"),
        v.literal("icon"),
        v.literal("improveAppDescription")
      ),
      appId: v.id("apps"),
      profileId: v.id("profiles"),
      status: v.union(
        v.literal("pending"),
        v.literal("generating"),
        v.literal("completed"),
        v.literal("failed")
      ),
      metadata: v.any(),
      result: v.optional(v.string()),
      error: v.optional(v.string()),
      createdAt: v.number(),
      completedAt: v.optional(v.number()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    return job;
  },
});

// Internal mutation: Create generation job
export const createGenerationJob = internalMutation({
  args: {
    type: v.union(
      v.literal("coverImage"), 
      v.literal("coverVideo"), 
      v.literal("icon"),
      v.literal("improveAppDescription")
    ),
    appId: v.id("apps"),
    profileId: v.id("profiles"),
    metadata: v.any(),
  },
  returns: v.id("generationJobs"),
  handler: async (ctx, args) => {
    const now = Date.now();

    // Cancel any existing pending/generating jobs for this app + type
    const existingJobs = await ctx.db
      .query("generationJobs")
      .withIndex("by_app_and_type", (q) => q.eq("appId", args.appId).eq("type", args.type))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("status"), "generating")
        )
      )
      .collect();

    for (const job of existingJobs) {
      await ctx.db.patch(job._id, {
        status: "failed",
        error: "Cancelled due to new job creation",
        completedAt: now,
      });
    }

    // Create new job with status "pending"
    const jobId = await ctx.db.insert("generationJobs", {
      type: args.type,
      appId: args.appId,
      profileId: args.profileId,
      status: "pending",
      metadata: args.metadata,
      createdAt: now,
    });

    return jobId;
  },
});

// Internal mutation: Update job status
export const updateGenerationJobStatus = internalMutation({
  args: {
    jobId: v.id("generationJobs"),
    status: v.union(
      v.literal("pending"),
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed")
    ),
    result: v.optional(v.string()),
    error: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const updateData: {
      status: "pending" | "generating" | "completed" | "failed";
      result?: string;
      error?: string;
      metadata?: unknown;
      completedAt?: number;
    } = {
      status: args.status,
    };

    if (args.result !== undefined) {
      updateData.result = args.result;
    }

    if (args.error !== undefined) {
      updateData.error = args.error;
    }

    if (args.metadata !== undefined) {
      updateData.metadata = args.metadata;
    }

    // Set completedAt if completed/failed
    if (args.status === "completed" || args.status === "failed") {
      updateData.completedAt = Date.now();
    }

    await ctx.db.patch(args.jobId, updateData);

    return null;
  },
});

// Internal mutation: Clean up old completed jobs
export const cleanupCompletedJobs = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000; // 24 hours

    // Find all completed/failed jobs older than 24 hours
    const oldJobs = await ctx.db
      .query("generationJobs")
      .withIndex("by_status")
      .filter((q) =>
        q.and(
          q.or(
            q.eq(q.field("status"), "completed"),
            q.eq(q.field("status"), "failed")
          ),
          q.lt(q.field("createdAt"), oneDayAgo)
        )
      )
      .collect();

    // Delete them
    for (const job of oldJobs) {
      await ctx.db.delete(job._id);
    }

    console.log(`Cleaned up ${oldJobs.length} old generation jobs`);

    return null;
  },
});

// Internal mutation: Fail stuck jobs that have been generating for too long
export const failStuckJobs = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const sixMinutesAgo = Date.now() - (6 * 60 * 1000);
    
    const stuckJobs = await ctx.db
      .query("generationJobs")
      .withIndex("by_status")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "generating"),
          q.lt(q.field("createdAt"), sixMinutesAgo)
        )
      )
      .collect();
    
    for (const job of stuckJobs) {
      await ctx.db.patch(job._id, {
        status: "failed",
        error: "Job timed out after 6 minutes",
        completedAt: Date.now(),
      });
    }
    
    console.log(`Failed ${stuckJobs.length} stuck jobs`);
    return null;
  },
});

