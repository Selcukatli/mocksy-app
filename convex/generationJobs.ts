import { query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

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
    metadata: v.optional(v.any()), // Allow updating metadata too
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

