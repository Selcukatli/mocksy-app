import { v } from "convex/values";
import { query, mutation, internalMutation, internalQuery } from "../_generated/server";
import { getCurrentUser } from "./profiles";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Query: Get all concepts for current user
 */
export const getUserConcepts = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("appConcepts"),
      _creationTime: v.number(),
      jobId: v.id("conceptGenerationJobs"),
      profileId: v.id("profiles"),
      name: v.string(),
      subtitle: v.string(),
      description: v.string(),
      category: v.optional(v.string()),
      styleDescription: v.string(),
      colors: v.object({
        primary: v.string(),
        background: v.string(),
        text: v.string(),
        accent: v.string(),
      }),
      typography: v.object({
        headlineFont: v.string(),
        headlineSize: v.string(),
        headlineWeight: v.string(),
        bodyFont: v.string(),
        bodySize: v.string(),
        bodyWeight: v.string(),
      }),
      effects: v.object({
        cornerRadius: v.string(),
        shadowStyle: v.string(),
        designPhilosophy: v.string(),
      }),
      iconStorageId: v.optional(v.id("_storage")),
      coverImageStorageId: v.optional(v.id("_storage")),
      iconUrl: v.optional(v.string()),
      coverUrl: v.optional(v.string()),
      iconPrompt: v.string(),
      coverPrompt: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const profile = await getCurrentUser(ctx);
    if (!profile) {
      return [];
    }

    const limit = args.limit ?? 50;

    // Query concepts by profile, ordered by creation date desc
    const concepts = await ctx.db
      .query("appConcepts")
      .withIndex("by_profile_and_created", (q) => q.eq("profileId", profile._id))
      .order("desc")
      .take(limit);

    // Fetch storage URLs for icon and cover
    const conceptsWithUrls = await Promise.all(
      concepts.map(async (concept) => {
        let iconUrl: string | undefined = undefined;
        if (concept.iconStorageId) {
          const url = await ctx.storage.getUrl(concept.iconStorageId);
          iconUrl = url ?? undefined;
        }

        let coverUrl: string | undefined = undefined;
        if (concept.coverImageStorageId) {
          const url = await ctx.storage.getUrl(concept.coverImageStorageId);
          coverUrl = url ?? undefined;
        }

        return {
          ...concept,
          iconUrl,
          coverUrl,
        };
      })
    );

    return conceptsWithUrls;
  },
});

/**
 * Query: Get concepts by job ID
 */
export const getConceptsByJobId = query({
  args: { jobId: v.id("conceptGenerationJobs") },
  returns: v.array(
    v.object({
      _id: v.id("appConcepts"),
      _creationTime: v.number(),
      jobId: v.id("conceptGenerationJobs"),
      profileId: v.id("profiles"),
      name: v.string(),
      subtitle: v.string(),
      description: v.string(),
      category: v.optional(v.string()),
      styleDescription: v.string(),
      colors: v.object({
        primary: v.string(),
        background: v.string(),
        text: v.string(),
        accent: v.string(),
      }),
      typography: v.object({
        headlineFont: v.string(),
        headlineSize: v.string(),
        headlineWeight: v.string(),
        bodyFont: v.string(),
        bodySize: v.string(),
        bodyWeight: v.string(),
      }),
      effects: v.object({
        cornerRadius: v.string(),
        shadowStyle: v.string(),
        designPhilosophy: v.string(),
      }),
      iconStorageId: v.optional(v.id("_storage")),
      coverImageStorageId: v.optional(v.id("_storage")),
      iconUrl: v.optional(v.string()),
      coverUrl: v.optional(v.string()),
      iconPrompt: v.string(),
      coverPrompt: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const profile = await getCurrentUser(ctx);
    if (!profile) {
      return [];
    }

    // Verify user owns the job
    const job = await ctx.db.get(args.jobId);
    if (!job || job.profileId !== profile._id) {
      return [];
    }

    // Get concepts by jobId
    const concepts = await ctx.db
      .query("appConcepts")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .collect();

    // Fetch storage URLs
    const conceptsWithUrls = await Promise.all(
      concepts.map(async (concept) => {
        let iconUrl: string | undefined = undefined;
        if (concept.iconStorageId) {
          const url = await ctx.storage.getUrl(concept.iconStorageId);
          iconUrl = url ?? undefined;
        }

        let coverUrl: string | undefined = undefined;
        if (concept.coverImageStorageId) {
          const url = await ctx.storage.getUrl(concept.coverImageStorageId);
          coverUrl = url ?? undefined;
        }

        return {
          ...concept,
          iconUrl,
          coverUrl,
        };
      })
    );

    return conceptsWithUrls;
  },
});

/**
 * Query: Get single concept by ID
 */
export const getConceptById = query({
  args: { conceptId: v.id("appConcepts") },
  returns: v.union(
    v.object({
      _id: v.id("appConcepts"),
      _creationTime: v.number(),
      jobId: v.id("conceptGenerationJobs"),
      profileId: v.id("profiles"),
      name: v.string(),
      subtitle: v.string(),
      description: v.string(),
      category: v.optional(v.string()),
      styleDescription: v.string(),
      colors: v.object({
        primary: v.string(),
        background: v.string(),
        text: v.string(),
        accent: v.string(),
      }),
      typography: v.object({
        headlineFont: v.string(),
        headlineSize: v.string(),
        headlineWeight: v.string(),
        bodyFont: v.string(),
        bodySize: v.string(),
        bodyWeight: v.string(),
      }),
      effects: v.object({
        cornerRadius: v.string(),
        shadowStyle: v.string(),
        designPhilosophy: v.string(),
      }),
      iconStorageId: v.optional(v.id("_storage")),
      coverImageStorageId: v.optional(v.id("_storage")),
      iconUrl: v.optional(v.string()),
      coverUrl: v.optional(v.string()),
      iconPrompt: v.string(),
      coverPrompt: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const profile = await getCurrentUser(ctx);
    if (!profile) {
      return null;
    }

    const concept = await ctx.db.get(args.conceptId);
    if (!concept || concept.profileId !== profile._id) {
      return null;
    }

    // Fetch storage URLs
    let iconUrl: string | undefined = undefined;
    if (concept.iconStorageId) {
      const url = await ctx.storage.getUrl(concept.iconStorageId);
      iconUrl = url ?? undefined;
    }

    let coverUrl: string | undefined = undefined;
    if (concept.coverImageStorageId) {
      const url = await ctx.storage.getUrl(concept.coverImageStorageId);
      coverUrl = url ?? undefined;
    }

    return {
      ...concept,
      iconUrl,
      coverUrl,
    };
  },
});

// ============================================================================
// INTERNAL QUERIES
// ============================================================================

/**
 * Internal query: Get concept by ID (no auth check)
 */
export const getConceptByIdInternal = internalQuery({
  args: { conceptId: v.id("appConcepts") },
  returns: v.union(
    v.object({
      _id: v.id("appConcepts"),
      _creationTime: v.number(),
      jobId: v.id("conceptGenerationJobs"),
      profileId: v.id("profiles"),
      name: v.string(),
      subtitle: v.string(),
      description: v.string(),
      category: v.optional(v.string()),
      styleDescription: v.string(),
      colors: v.object({
        primary: v.string(),
        background: v.string(),
        text: v.string(),
        accent: v.string(),
      }),
      typography: v.object({
        headlineFont: v.string(),
        headlineSize: v.string(),
        headlineWeight: v.string(),
        bodyFont: v.string(),
        bodySize: v.string(),
        bodyWeight: v.string(),
      }),
      effects: v.object({
        cornerRadius: v.string(),
        shadowStyle: v.string(),
        designPhilosophy: v.string(),
      }),
      iconStorageId: v.optional(v.id("_storage")),
      coverImageStorageId: v.optional(v.id("_storage")),
      iconPrompt: v.string(),
      coverPrompt: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conceptId);
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Mutation: Delete concept
 */
export const deleteConcept = mutation({
  args: { conceptId: v.id("appConcepts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const profile = await getCurrentUser(ctx);
    if (!profile) {
      throw new Error("Must be authenticated to delete concept");
    }

    const concept = await ctx.db.get(args.conceptId);
    if (!concept) {
      throw new Error("Concept not found");
    }

    // Verify ownership
    if (concept.profileId !== profile._id) {
      throw new Error("Unauthorized to delete this concept");
    }

    // Delete storage files
    if (concept.iconStorageId) {
      await ctx.storage.delete(concept.iconStorageId);
    }
    if (concept.coverImageStorageId) {
      await ctx.storage.delete(concept.coverImageStorageId);
    }

    // Delete concept
    await ctx.db.delete(args.conceptId);

    return null;
  },
});

// ============================================================================
// INTERNAL MUTATIONS
// ============================================================================

/**
 * Internal mutation: Create concept (called during generation)
 */
export const createConcept = internalMutation({
  args: {
    jobId: v.id("conceptGenerationJobs"),
    profileId: v.id("profiles"),
    name: v.string(),
    subtitle: v.string(),
    description: v.string(),
    category: v.optional(v.string()),
    styleDescription: v.string(),
    colors: v.object({
      primary: v.string(),
      background: v.string(),
      text: v.string(),
      accent: v.string(),
    }),
    typography: v.object({
      headlineFont: v.string(),
      headlineSize: v.string(),
      headlineWeight: v.string(),
      bodyFont: v.string(),
      bodySize: v.string(),
      bodyWeight: v.string(),
    }),
    effects: v.object({
      cornerRadius: v.string(),
      shadowStyle: v.string(),
      designPhilosophy: v.string(),
    }),
    iconPrompt: v.string(),
    coverPrompt: v.string(),
  },
  returns: v.id("appConcepts"),
  handler: async (ctx, args) => {
    const now = Date.now();

    const conceptId = await ctx.db.insert("appConcepts", {
      jobId: args.jobId,
      profileId: args.profileId,
      name: args.name,
      subtitle: args.subtitle,
      description: args.description,
      category: args.category,
      styleDescription: args.styleDescription,
      colors: args.colors,
      typography: args.typography,
      effects: args.effects,
      iconPrompt: args.iconPrompt,
      coverPrompt: args.coverPrompt,
      createdAt: now,
      updatedAt: now,
    });

    return conceptId;
  },
});

/**
 * Internal mutation: Update concept images
 */
export const updateConceptImages = internalMutation({
  args: {
    conceptId: v.id("appConcepts"),
    iconStorageId: v.optional(v.id("_storage")),
    coverImageStorageId: v.optional(v.id("_storage")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conceptId, {
      iconStorageId: args.iconStorageId,
      coverImageStorageId: args.coverImageStorageId,
      updatedAt: Date.now(),
    });

    return null;
  },
});




