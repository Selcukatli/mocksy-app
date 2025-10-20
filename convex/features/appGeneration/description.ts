"use node";

import { internalAction, action } from "../../_generated/server";
import { v } from "convex/values";
import { internal, api } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";
export const generateAppDescription = action({
  args: {
    draftDescription: v.string(),
    uiStyleHint: v.optional(v.string()),
  },
  returns: v.object({
    improvedDescription: v.string(),
    improvedStyle: v.string(),
    inferredCategory: v.string(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (!args.draftDescription.trim()) {
      throw new Error("Description is required");
    }

    const { b } = await import("../../../baml_client");
    const result = await b.ImproveAppDescription(
      args.draftDescription,
      args.uiStyleHint ?? null
    );

    return {
      improvedDescription: result.improved_description,
      improvedStyle: result.improved_style,
      inferredCategory: result.inferred_category,
    };
  },
});

/**
 * Public: Reformat an existing app's description to use modern App Store formatting
 * with section headers (KEY FEATURES, BENEFITS, PERFECT FOR) and bullet points
 * 
 * Admin action - callable from app detail pages
 */
// Action to improve/reformat app description with optional user feedback
export const improveAppStoreDescription = action({
  args: {
    appId: v.id("apps"),
    userFeedback: v.optional(v.string()),
    includeScreenshots: v.optional(v.boolean()),
  },
  returns: v.object({
    success: v.boolean(),
    jobId: v.optional(v.id("generationJobs")),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<{
    success: boolean;
    jobId?: Id<"generationJobs">;
    error?: string;
  }> => {
    try {
      // Check authentication
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Not authenticated");
      }

      // Get user profile
      const profile = await ctx.runQuery(api.features.profiles.queries.getCurrentProfile, {});

      if (!profile) {
        throw new Error("Profile not found");
      }

      // Fetch app
      const app = await ctx.runQuery(api.features.apps.queries.getApp, { appId: args.appId });
      if (!app) {
        throw new Error("App not found or access denied");
      }

      // Check if description exists
      if (!app.description) {
        return {
          success: false,
          error: "App has no description to improve",
        };
      }

      console.log(`🔄 Creating job to improve description for app: "${app.name}"`);

      // Create generation job
      const jobId = await ctx.runMutation(internal.features.appGeneration.jobs.createGenerationJob, {
        type: "improveAppDescription",
        appId: args.appId,
        profileId: profile._id,
        metadata: { 
          userFeedback: args.userFeedback,
          includeScreenshots: args.includeScreenshots ?? true
        },
      });

      // Schedule the processing action
      await ctx.scheduler.runAfter(0, internal.features.appGeneration.description.processImproveAppStoreDescriptionJob, {
        jobId,
      });

      console.log(`✅ Job created: ${jobId}`);

      return {
        success: true,
        jobId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ Error creating improve description job:", errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});

// Internal action to process improve description job
export const processImproveAppStoreDescriptionJob = internalAction({
  args: {
    jobId: v.id("generationJobs"),
  },
  handler: async (ctx, args) => {
    try {
      // Get job
      const job = await ctx.runQuery(internal.features.appGeneration.jobs.getJobById, {
        jobId: args.jobId,
      });

      if (!job) {
        console.error("❌ Job not found:", args.jobId);
        return;
      }

      // Update job status to generating
      await ctx.runMutation(internal.features.appGeneration.jobs.updateGenerationJobStatus, {
        jobId: args.jobId,
        status: "generating",
      });

      // Fetch app
      const app = await ctx.runQuery(internal.features.apps.internal.getAppByIdInternal, { appId: job.appId });
      if (!app) {
        await ctx.runMutation(internal.features.appGeneration.jobs.updateGenerationJobStatus, {
          jobId: args.jobId,
          status: "failed",
          error: "App not found",
        });
        return;
      }

      if (!app.description) {
        await ctx.runMutation(internal.features.appGeneration.jobs.updateGenerationJobStatus, {
          jobId: args.jobId,
          status: "failed",
          error: "App has no description",
        });
        return;
      }

      console.log(`🔄 Processing description improvement for app: "${app.name}"`);

      // Fetch app screenshots to provide visual context (if user opted in)
      const includeScreenshots = (job.metadata?.includeScreenshots as boolean | undefined) ?? true;
      
      const screenshotUrls: string[] = [];
      if (includeScreenshots) {
        try {
          const screenshots = await ctx.runQuery(internal.appScreens.getScreensByAppId, { appId: job.appId });
          // Get up to 5 screenshots for context (to avoid token limits)
          const screenshotStorageIds = screenshots
            .filter(s => s.storageId)
            .slice(0, 5)
            .map(s => s.storageId);
          
          // Convert storage IDs to URLs
          for (const storageId of screenshotStorageIds) {
            const url = await ctx.storage.getUrl(storageId);
            if (url) {
              screenshotUrls.push(url);
            }
          }
          
          if (screenshotUrls.length > 0) {
            console.log(`📸 Including ${screenshotUrls.length} screenshots for context`);
          } else {
            console.log(`⚠️ User opted to include screenshots, but none found`);
          }
        } catch {
          console.log("⚠️ Could not fetch screenshots, continuing without visual context");
        }
      } else {
        console.log(`ℹ️ User opted to skip screenshot context`);
      }

      // Call BAML to improve description
      const { b } = await import("../../../baml_client");
      const userFeedback = job.metadata?.userFeedback as string | undefined;
      
      // BAML's Image type requires objects with 'url' property, not raw strings
      const screenshotImages = screenshotUrls.length > 0 
        ? screenshotUrls.map(url => ({ url }))
        : null;
      
      const improvedDescription = await b.ReformatAppDescription(
        app.name,
        app.description,
        app.category ?? null,
        app.styleGuide ?? null,
        userFeedback ?? null,
        // Type assertion needed due to BAML's complex union type for image arrays
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        screenshotImages as any
      );

      console.log(`✅ Improved description (${improvedDescription.length} chars)`);

      // Update app with improved description
      await ctx.runMutation(internal.features.apps.internal.updateAIGeneratedApp, {
        appId: job.appId,
        description: improvedDescription,
      });

      // Mark job as completed
      await ctx.runMutation(internal.features.appGeneration.jobs.updateGenerationJobStatus, {
        jobId: args.jobId,
        status: "completed",
        result: "Description improved successfully",
      });

      console.log(`✅ Job completed: ${args.jobId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ Error processing improve description job:", errorMessage);
      
      // Mark job as failed but keep original description
      await ctx.runMutation(internal.features.appGeneration.jobs.updateGenerationJobStatus, {
        jobId: args.jobId,
        status: "failed",
        error: errorMessage,
      });
    }
  },
});

/**
 * Generate cover image variants for an app using BAML + Seed Dream 4
 * Analyzes app description and screens to create promotional banner images
 * Returns multiple variants for user selection (does not save to database)
 */
