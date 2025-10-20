"use node";

import { action } from "../../_generated/server";
import { v } from "convex/values";
import { internal, api } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";
import { fetchWithRetry } from "./helpers";

export const generateAppCoverVideo = action({
  args: {
    appId: v.id("apps"),
    customPrompt: v.optional(v.string()),
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
      // 1. Check ownership and fetch app
      const app = await ctx.runQuery(api.features.apps.queries.getApp, { appId: args.appId });
      if (!app) {
        throw new Error("App not found or access denied");
      }

      // 2. Verify cover image exists
      if (!app.coverImageStorageId) {
        return {
          success: false,
          error: "App must have a cover image before generating video",
        };
      }

      // 3. Get profile
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Not authenticated");
      }

      const profile = await ctx.runQuery(api.features.profiles.queries.getCurrentProfile);
      if (!profile) {
        throw new Error("Profile not found");
      }

      console.log(`🎬 Starting cover video generation for app: ${app.name}`);

      // 4. Create job with status "pending"
      const jobId = await ctx.runMutation(internal.features.appGeneration.jobs.createGenerationJob, {
        type: "coverVideo",
        appId: args.appId,
        profileId: profile._id,
        metadata: {
          coverImageStorageId: app.coverImageStorageId,
        },
      });

      console.log(`  ✓ Created job: ${jobId}`);

      // 5. Update to "generating"
      await ctx.runMutation(internal.features.appGeneration.jobs.updateGenerationJobStatus, {
        jobId,
        status: "generating",
      });

      // 6. Get cover image URL
      const coverImageUrl = await ctx.runQuery(api.fileStorage.files.getFileUrl, {
        storageId: app.coverImageStorageId,
      });
      if (!coverImageUrl) {
        throw new Error("Could not get cover image URL");
      }

      console.log(`📸 Cover image URL: ${coverImageUrl.substring(0, 60)}...`);

      // 7. Generate video prompt with BAML
      console.log("🤖 Generating video motion prompt with BAML...");
      const { b } = await import("../../../baml_client");
      const promptResult = await b.GenerateCoverVideoPrompt(
        coverImageUrl,
        app.name,
        app.description || "",
        args.customPrompt ?? null
      );

      console.log(`  ✓ Video prompt generated (${promptResult.video_prompt.length} chars)`);

      // 8. Generate video with Hailuo
      console.log("🎥 Generating video with Hailuo-02 Fast...");
      console.log("⏱️  Duration: 6 seconds");

      const videoResult = await ctx.runAction(
        internal.utils.fal.falVideoActions.hailuoImageToVideo,
        {
          prompt: promptResult.video_prompt,
          image_url: coverImageUrl,
          duration: "6",
          prompt_optimizer: true,
        }
      );

      if (!videoResult.success || !videoResult.videoUrl) {
        const errorMsg = videoResult.error || "Failed to generate video - no URL returned";
        console.error("❌ Video generation failed:", errorMsg);
        console.error("Full video result:", JSON.stringify(videoResult));
        
        // Update job to failed BEFORE throwing
        await ctx.runMutation(internal.features.appGeneration.jobs.updateGenerationJobStatus, {
          jobId,
          status: "failed",
          error: errorMsg,
        });
        
        throw new Error(errorMsg);
      }

      console.log(`  ✓ Video generated: ${videoResult.videoUrl.substring(0, 60)}...`);

      // 9. Download video from URL
      console.log("📥 Downloading video...");
      const videoResponse = await fetchWithRetry(videoResult.videoUrl);
      const videoBlob = await videoResponse.blob();
      console.log(`  ✓ Downloaded (${videoBlob.size} bytes)`);

      // 10. Upload to Convex storage
      console.log("📤 Uploading to storage...");
      const storageId = await ctx.storage.store(videoBlob);
      console.log(`  ✓ Uploaded: ${storageId}`);

      // 11. Update app with cover video
      await ctx.runMutation(internal.features.apps.internal.updateAIGeneratedApp, {
        appId: args.appId,
        coverVideoStorageId: storageId,
      });
      console.log(`  ✅ App updated with cover video`);

      // 12. Update job to "completed"
      await ctx.runMutation(internal.features.appGeneration.jobs.updateGenerationJobStatus, {
        jobId,
        status: "completed",
        result: storageId,
        metadata: {
          coverImageStorageId: app.coverImageStorageId,
          videoPrompt: promptResult.video_prompt,
          customPrompt: args.customPrompt,
        },
      });

      console.log("🎉 Cover video generation complete!");

      return {
        success: true,
        jobId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ Error generating cover video:", errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});

