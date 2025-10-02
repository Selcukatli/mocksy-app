import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import type { Id } from "./_generated/dataModel";

const jobStatusValidator = v.union(
  v.literal("queued"),
  v.literal("running"),
  v.literal("succeeded"),
  v.literal("failed")
);

const jobTypeValidator = v.union(
  v.literal("style"),
  v.literal("screenshot"),
  v.literal("template")
);

const jobPayloadValidator = v.object({
  description: v.optional(v.string()),
  referenceImageStorageId: v.optional(v.id("_storage")),
});

const jobResultValidator = v.union(
  v.object({
    table: v.literal("styles"),
    id: v.id("styles"),
  })
);

export const createJob = internalMutation({
  args: {
    profileId: v.id("profiles"),
    type: jobTypeValidator,
    status: jobStatusValidator,
    message: v.optional(v.string()),
    progress: v.optional(v.number()),
    payload: v.optional(jobPayloadValidator),
    result: v.optional(jobResultValidator),
  },
  returns: v.id("jobs"),
  handler: async (ctx, args) => {
    const now = Date.now();

    const jobId = await ctx.db.insert("jobs", {
      profileId: args.profileId,
      type: args.type,
      status: args.status,
      message: args.message,
      progress: args.progress,
      payload: args.payload,
      result: args.result,
      createdAt: now,
      updatedAt: now,
    });

    return jobId;
  },
});

export const updateJob = internalMutation({
  args: {
    jobId: v.id("jobs"),
    status: v.optional(jobStatusValidator),
    message: v.optional(v.string()),
    progress: v.optional(v.number()),
    result: v.optional(jobResultValidator),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const updates: Partial<Doc<"jobs">> = {
      updatedAt: Date.now(),
    };

    if (args.status !== undefined) {
      updates.status = args.status as never;
    }
    if (args.message !== undefined) {
      updates.message = args.message;
    }
    if (args.progress !== undefined) {
      updates.progress = args.progress;
    }
    if (args.result !== undefined) {
      updates.result = args.result as never;
    }
    if (args.error !== undefined) {
      updates.error = args.error;
    }

    await ctx.db.patch(args.jobId, updates);
    return null;
  },
});

export const getJob = query({
  args: {
    jobId: v.id("jobs"),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("jobs"),
      type: jobTypeValidator,
      status: jobStatusValidator,
      message: v.optional(v.string()),
      progress: v.optional(v.number()),
      result: v.optional(jobResultValidator),
      error: v.optional(v.string()),
      payload: v.optional(jobPayloadValidator),
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

    const job = await ctx.db.get(args.jobId);
    if (!job || job.profileId !== profile._id) {
      return null;
    }

    return {
      _id: job._id,
      type: job.type,
      status: job.status,
      message: job.message,
      progress: job.progress,
      result: job.result,
      error: job.error,
      payload: job.payload,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  },
});

export const getActiveJobs = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("jobs"),
      type: jobTypeValidator,
      status: jobStatusValidator,
      message: v.optional(v.string()),
      progress: v.optional(v.number()),
      result: v.optional(jobResultValidator),
      error: v.optional(v.string()),
      payload: v.optional(jobPayloadValidator),
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
      .query("jobs")
      .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
      .collect();

    return jobs
      .filter((job) => job.status === "queued" || job.status === "running")
      .map((job) => ({
        _id: job._id,
        type: job.type,
        status: job.status,
        message: job.message,
        progress: job.progress,
        result: job.result,
        error: job.error,
        payload: job.payload,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const migrateLegacyResult = internalMutation({
  args: {
    jobId: v.id("jobs"),
  },
  returns: v.null(),
  handler: async (ctx, { jobId }: { jobId: Id<"jobs"> }) => {
    const job = await ctx.db.get(jobId);
    if (!job) {
      return null;
    }

    if (!("resultStyleId" in job)) {
      return null;
    }

    const legacyJob = job as Doc<"jobs"> & { resultStyleId?: Id<"styles"> };
    const { resultStyleId, ...rest } = legacyJob;

    await ctx.db.replace(jobId, {
      ...rest,
      result: resultStyleId
        ? {
            table: "styles" as const,
            id: resultStyleId,
          }
        : undefined,
    });

    return null;
  },
});
