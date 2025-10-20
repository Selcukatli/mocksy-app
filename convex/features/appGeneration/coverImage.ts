"use node";

import { action } from "../../_generated/server";
import { v } from "convex/values";
import { internal, api } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";
import { fetchWithRetry } from "./helpers";

export const generateAppCoverImage = action({
  args: {
    appId: v.id("apps"),
    numVariants: v.optional(v.number()), // Number of variants to generate (1-6), default: 4
    width: v.optional(v.number()), // Custom width, default: 1920
    height: v.optional(v.number()), // Custom height, default: 1080
    userFeedback: v.optional(v.string()), // Optional user guidance for cover image generation
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
    // 1. Fetch app details
    const app = await ctx.runQuery(api.features.apps.queries.getApp, {
      appId: args.appId,
    });
    if (!app) {
      throw new Error("App not found or access denied");
    }

    // 2. Get profile
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.runQuery(api.features.profiles.queries.getCurrentProfile);
    if (!profile) {
      throw new Error("Profile not found");
    }

    console.log(`🎨 Starting cover image generation for app: ${app.name}`);

    try {
      // 3. Create job with status "pending"
      const numVariants = Math.min(args.numVariants || 4, 6);
      const jobId = await ctx.runMutation(internal.features.appGeneration.jobs.createGenerationJob, {
        type: "coverImage",
        appId: args.appId,
        profileId: profile._id,
        metadata: {
          numVariants,
          width: args.width || 1920,
          height: args.height || 960,
          userFeedback: args.userFeedback,
        },
      });

      console.log(`  ✓ Created job: ${jobId}`);

      // 4. Update to "generating"
      await ctx.runMutation(internal.features.appGeneration.jobs.updateGenerationJobStatus, {
        jobId,
        status: "generating",
      });

      // 5. Fetch app screens
      const screens = await ctx.runQuery(api.appScreens.getAppScreens, {
        appId: args.appId,
      });

      const screenNames: string[] = screens.map((s: { name: string }) => s.name);

      // 6. Call BAML to generate image prompt
      console.log("🤖 Generating image prompt with BAML...");
      const { b } = await import("../../../baml_client");
      const promptResult = await b.GenerateAppCoverImagePrompt(
        app.name,
        app.description || "",
        app.category ?? null,
        app.styleGuide ?? null,
        screenNames,
        args.userFeedback ?? null
      );

      console.log(`  ✓ Image prompt generated (${promptResult.image_prompt.length} chars)`);

      // 7. Generate image variants with Seed Dream 4
      const width = args.width || 1920;
      const height = args.height || 960;

      console.log(`🖼️  Generating ${numVariants} variants with Seed Dream 4 (${width}×${height})...`);
      const imageResult: {
        images?: Array<{ url: string; width?: number; height?: number }>;
      } = await ctx.runAction(
        internal.utils.fal.falImageActions.seedDream4TextToImage,
        {
          prompt: promptResult.image_prompt,
          image_size: { width, height },
          num_images: numVariants,
        }
      );

      if (!imageResult.images || imageResult.images.length === 0) {
        throw new Error("No images generated");
      }

      console.log(`  ✅ Generated ${imageResult.images.length} cover image variants`);

      // 8. Update job to "completed" with variants in metadata
      const variants = imageResult.images.map((img) => ({
        imageUrl: img.url,
        width: img.width ?? undefined,
        height: img.height ?? undefined,
      }));

      await ctx.runMutation(internal.features.appGeneration.jobs.updateGenerationJobStatus, {
        jobId,
        status: "completed",
        metadata: {
          ...args,
          numVariants,
          variants,
          imagePrompt: promptResult.image_prompt,
          styleNotes: promptResult.style_notes,
        },
      });

      console.log("🎉 Cover image generation complete!");

      return {
        success: true,
        jobId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ Error generating cover image:", errorMessage);
      
      // Update job to failed if we have a jobId
      // Note: jobId might not exist if error happened before job creation
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});

/**
 * Save a selected cover image to an app
 * Downloads the image from URL and uploads to Convex storage
 */
export const saveAppCoverImage = action({
  args: {
    appId: v.id("apps"),
    imageUrl: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    storageId: v.optional(v.id("_storage")),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<{
    success: boolean;
    storageId?: Id<"_storage">;
    error?: string;
  }> => {
    try {
      // 1. Check ownership (getApp includes auth check)
      const app = await ctx.runQuery(api.features.apps.queries.getApp, { appId: args.appId });
      if (!app) {
        throw new Error("App not found or access denied");
      }

      console.log(`💾 Saving cover image for app: ${app.name}`);

      // 2. Download image from URL
      console.log("📥 Downloading image...");
      const response = await fetchWithRetry(args.imageUrl);
      const blob = await response.blob();
      console.log(`  ✓ Downloaded (${blob.size} bytes)`);

      // 3. Upload to storage
      console.log("📤 Uploading to storage...");
      const storageId = await ctx.storage.store(blob);
      console.log(`  ✓ Uploaded: ${storageId}`);

      // 4. Update app with cover image
      await ctx.runMutation(internal.features.apps.internal.updateAIGeneratedApp, {
        appId: args.appId,
        coverImageStorageId: storageId,
      });
      console.log(`  ✅ App updated with cover image`);

      // 5. Mark any cover image jobs for this app as completed
      // (User has selected a variant and saved it)
      // This is handled by creating a new job when user wants to regenerate

      return {
        success: true,
        storageId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ Error saving cover image:", errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});

/**
 * Generate and automatically save a single cover image
 * Used for admin panel quick generation - generates 1 image and immediately saves it
 */
export const generateAndSaveCoverImage = action({
  args: {
    appId: v.id("apps"),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  },
  returns: v.object({
    success: v.boolean(),
    jobId: v.optional(v.id("generationJobs")),
    storageId: v.optional(v.id("_storage")),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<{
    success: boolean;
    jobId?: Id<"generationJobs">;
    storageId?: Id<"_storage">;
    error?: string;
  }> => {
    // 1. Fetch app details
    const app = await ctx.runQuery(api.features.apps.queries.getApp, {
      appId: args.appId,
    });
    if (!app) {
      throw new Error("App not found or access denied");
    }

    // 2. Get profile
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.runQuery(api.features.profiles.queries.getCurrentProfile);
    if (!profile) {
      throw new Error("Profile not found");
    }

    console.log(`🎨 [Auto-save] Starting cover image generation for app: ${app.name}`);

    try {
      // 3. Create job
      const jobId = await ctx.runMutation(internal.features.appGeneration.jobs.createGenerationJob, {
        type: "coverImage",
        appId: args.appId,
        profileId: profile._id,
        metadata: {
          numVariants: 1,
          width: args.width || 1920,
          height: args.height || 960,
          autoSave: true, // Mark this as auto-save mode
        },
      });

      // 4. Update to "generating"
      await ctx.runMutation(internal.features.appGeneration.jobs.updateGenerationJobStatus, {
        jobId,
        status: "generating",
      });

      // 5. Fetch app screens
      const screens = await ctx.runQuery(api.appScreens.getAppScreens, {
        appId: args.appId,
      });
      const screenNames: string[] = screens.map((s: { name: string }) => s.name);

      // 6. Generate image prompt with BAML
      console.log("🤖 Generating image prompt with BAML...");
      const { b } = await import("../../../baml_client");
      const promptResult = await b.GenerateAppCoverImagePrompt(
        app.name,
        app.description || "",
        app.category ?? null,
        app.styleGuide ?? null,
        screenNames,
        null // no userFeedback
      );

      // 7. Generate single image with Seed Dream 4
      const width = args.width || 1920;
      const height = args.height || 960;
      console.log(`🖼️  Generating 1 image with Seed Dream 4 (${width}×${height})...`);
      
      const imageResult: {
        images?: Array<{ url: string; width?: number; height?: number }>;
      } = await ctx.runAction(
        internal.utils.fal.falImageActions.seedDream4TextToImage,
        {
          prompt: promptResult.image_prompt,
          image_size: { width, height },
          num_images: 1,
        }
      );

      if (!imageResult.images || imageResult.images.length === 0) {
        throw new Error("No images generated");
      }

      const imageUrl = imageResult.images[0].url;
      console.log(`  ✅ Generated cover image: ${imageUrl}`);

      // 8. Download and save to storage
      console.log("📥 Downloading and saving to storage...");
      const response = await fetchWithRetry(imageUrl);
      const blob = await response.blob();
      
      const storageId = await ctx.storage.store(blob);
      console.log(`  ✅ Saved to storage: ${storageId}`);

      // 9. Update app with the new cover image
      await ctx.runMutation(internal.features.apps.internal.updateAIGeneratedApp, {
        appId: args.appId,
        name: app.name,
        coverImageStorageId: storageId,
      });

      // 10. Update job to completed
      await ctx.runMutation(internal.features.appGeneration.jobs.updateGenerationJobStatus, {
        jobId,
        status: "completed",
        result: storageId,
        metadata: {
          numVariants: 1,
          width,
          height,
          autoSave: true,
          imagePrompt: promptResult.image_prompt,
          imageUrl,
        },
      });

      console.log("🎉 Cover image generated and saved!");

      return {
        success: true,
        jobId,
        storageId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ Error in generateAndSaveCoverImage:", errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});

/**
 * Generate cover video from existing cover image
 * Converts app's cover image into a seamless 6-second looping video using Hailuo
 */
