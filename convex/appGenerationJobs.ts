import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const jobStatusValidator = v.union(
  v.literal("pending"),
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
    const updates: any = {
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
