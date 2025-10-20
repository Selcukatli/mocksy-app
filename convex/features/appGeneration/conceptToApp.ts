"use node";

import { internalAction, action } from "../../_generated/server";
import { v } from "convex/values";
import { internal, api } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";

import { fetchWithRetry } from "./helpers";
// ============================================
// CONCEPT TO APP GENERATION
// ============================================

/**
 * Public: Generate full app from selected concept
 * Takes conceptId, fetches the concept data, and generates app
 */
export const generateAppFromConcept = action({
  args: {
    conceptId: v.id("appConcepts"),
    skipScreenshots: v.optional(v.boolean()), // If true, only download images and create app, skip screenshot generation
    numScreens: v.optional(v.number()), // Default: 5
    screenshotSizeId: v.optional(v.id("screenshotSizes")),
  },
  returns: v.object({
    appId: v.id("apps"),
    jobId: v.id("appGenerationJobs"),
  }),
  handler: async (ctx, args): Promise<{ appId: Id<"apps">; jobId: Id<"appGenerationJobs"> }> => {
    // Get user's profile
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be authenticated to generate app");
    }

    const profile = await ctx.runQuery(api.data.profiles.getCurrentProfile);
    if (!profile) {
      throw new Error("Failed to get user profile");
    }

    // Fetch the concept
    const concept = await ctx.runQuery(internal.data.appConcepts.getConceptByIdInternal, {
      conceptId: args.conceptId,
    });

    if (!concept) {
      throw new Error("Concept not found");
    }

    // Verify ownership
    if (concept.profileId !== profile._id) {
      throw new Error("Unauthorized to use this concept");
    }

    const numScreens = args.numScreens || 5;

    console.log(`🚀 Generating full app from concept: ${concept.name}`);

    // Create placeholder app with concept data
    const appId: Id<"apps"> = await ctx.runMutation(internal.data.apps.createAIGeneratedApp, {
      profileId: profile._id,
      conceptId: args.conceptId,
      name: concept.name,
      description: `${concept.subtitle}. ${concept.description}`,
      category: concept.category,
      styleGuide: concept.styleDescription,
      iconStorageId: concept.iconStorageId,
      coverImageStorageId: concept.coverImageStorageId,
    });

    // Create job to track progress
    const jobId = await ctx.runMutation(internal.features.appGeneration.jobs.createAppGenerationJob, {
      profileId: profile._id,
      appId,
      status: "pending",
      currentStep: "Starting generation from concept...",
      progressPercentage: 0,
      screensGenerated: 0,
      screensTotal: numScreens,
    });

    // Schedule the actual generation in the background
    await ctx.scheduler.runAfter(0, internal.features.appGeneration.conceptToApp.generateAppFromConceptInternal, {
      profileId: profile._id,
      appId,
      jobId,
      conceptId: args.conceptId,
      skipScreenshots: args.skipScreenshots || false,
      numScreens,
      screenshotSizeId: args.screenshotSizeId,
    });

    return { appId, jobId };
  },
});

/**
 * Internal: Generate app from concept
 * Downloads icon/cover, generates structure + screenshots
 * 
 * Progress allocation:
 * - 20%: Download + store icon/cover images (SKIPPED if already in storage)
 * - 30%: Generate app structure plan
 * - 50%: Generate first screenshot
 * - 100%: Generate remaining screenshots (in parallel)
 */
export const generateAppFromConceptInternal = internalAction({
  args: {
    profileId: v.id("profiles"),
    appId: v.id("apps"),
    jobId: v.id("appGenerationJobs"),
    conceptId: v.id("appConcepts"),
    skipScreenshots: v.boolean(),
    numScreens: v.number(),
    screenshotSizeId: v.optional(v.id("screenshotSizes")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Fetch the concept
    const concept = await ctx.runQuery(internal.data.appConcepts.getConceptByIdInternal, {
      conceptId: args.conceptId,
    });

    if (!concept) {
      throw new Error("Concept not found");
    }

    console.log(`🎬 Generating app from concept: ${concept.name}`);

    try {
      // ===== PHASE 1: Images already in storage (20% progress) =====
      console.log("📥 Phase 1: Checking images in storage...");
      await ctx.runMutation(internal.features.appGeneration.jobs.updateAppGenerationJob, {
        jobId: args.jobId,
        status: "downloading_images",
        currentStep: "Verifying icon and cover images...",
        progressPercentage: 0,
      });

      // Images are already in Convex storage from concept generation
      const iconStorageId = concept.iconStorageId;
      const coverStorageId = concept.coverImageStorageId;

      if (!iconStorageId || !coverStorageId) {
        throw new Error("Concept images not found in storage");
      }

      console.log(`  ✓ Icon found: ${iconStorageId}`);
      console.log(`  ✓ Cover found: ${coverStorageId}`);

      await ctx.runMutation(internal.features.appGeneration.jobs.updateAppGenerationJob, {
        jobId: args.jobId,
        progressPercentage: 20,
        currentStep: "Images verified",
      });

      console.log("✅ Phase 1 complete: Images verified in storage");

      // If skipScreenshots is true, stop here and mark as preview_ready
      if (args.skipScreenshots) {
        console.log("⏸️  Skipping screenshot generation - preview mode");
        await ctx.runMutation(internal.features.appGeneration.jobs.updateAppGenerationJob, {
          jobId: args.jobId,
          status: "preview_ready",
          currentStep: "Ready for screenshot generation",
          progressPercentage: 100,
        });
        console.log("✅ App concept saved successfully - ready for preview");
        return;
      }

      // ===== PHASE 2: Generate app structure plan (30% progress) =====
      console.log("🏗️  Phase 2: Generating app structure plan...");
      await ctx.runMutation(internal.features.appGeneration.jobs.updateAppGenerationJob, {
        jobId: args.jobId,
        status: "generating_structure",
        currentStep: "Generating app structure plan...",
      });

      const { b } = await import("../../../baml_client");
      const appStructure = await b.GenerateAppDesignPlan(
        concept.name,
        concept.description,
        concept.category ?? "Lifestyle",
        concept.styleDescription,
        args.numScreens
      );

      console.log(`  ✓ Structure generated (${appStructure.screens.length} screens)`);
      console.log(`  ✓ Tabs: ${appStructure.tabs.has_tabs ? `Yes (${appStructure.tabs.tab_names.join(', ')})` : 'No'}`);

      await ctx.runMutation(internal.features.appGeneration.jobs.updateAppGenerationJob, {
        jobId: args.jobId,
        progressPercentage: 30,
        currentStep: `Structure planned: ${appStructure.screens.length} screens`,
        screensTotal: appStructure.screens.length,
      });

      console.log("✅ Phase 2 complete: App structure planned");

      // ===== PHASE 3: Generate screenshots (30% -> 100% progress) =====
      console.log("🖼️  Phase 3: Generating screenshots...");
      await ctx.runMutation(internal.features.appGeneration.jobs.updateAppGenerationJob, {
        jobId: args.jobId,
        status: "generating_screens",
        currentStep: `Generating screen 1/${appStructure.screens.length}...`,
      });

      // Fetch canvas
      console.log(`📐 Fetching canvas...`);
      let size;
      if (args.screenshotSizeId) {
        // Use provided size ID
        size = await ctx.runQuery(api.data.screenshotSizes.getSizeById, { sizeId: args.screenshotSizeId });
      } else {
        // Use default iPhone 16 Pro Max by slug (stable across environments)
        size = await ctx.runQuery(api.data.screenshotSizes.getSizeBySlug, { slug: "iphone-6-9" });
      }
      
      if (!size?.canvasStorageId) {
        throw new Error(`Screenshot size not found`);
      }

      const canvasUrl = await ctx.runQuery(api.fileStorage.files.getFileUrl, {
        storageId: size.canvasStorageId,
      });
      if (!canvasUrl) {
        throw new Error(`Could not get canvas URL`);
      }

      // Generate first screen
      console.log(`  → Generating first screen: ${appStructure.screens[0].screen_name}`);
      const firstScreenDetail = appStructure.screens[0];

      const firstPromptResult = await b.GenerateFirstScreenImagePrompt(
        concept.name,
        concept.styleDescription,
        appStructure.common_layout_elements,
        appStructure.tabs,
        firstScreenDetail
      );

      const firstScreenResult = await ctx.runAction(
        internal.utils.fal.falImageActions.geminiFlashEditImage,
        {
          prompt: firstPromptResult.canvas_edit_prompt,
          image_urls: [canvasUrl],
          num_images: 1,
          output_format: "png",
        }
      );

      if (!firstScreenResult.images || firstScreenResult.images.length === 0) {
        throw new Error("Failed to generate first reference screen");
      }

      const firstScreenUrl = firstScreenResult.images[0].url;
      const firstScreenWidth = firstScreenResult.images[0].width || 1290;
      const firstScreenHeight = firstScreenResult.images[0].height || 2796;

      // Upload first screen
      const firstScreenResponse = await fetchWithRetry(firstScreenUrl);
      const firstScreenBlob = await firstScreenResponse.blob();
      const firstScreenStorageId = await ctx.storage.store(firstScreenBlob);

      await ctx.runMutation(internal.data.appScreens.createAIGeneratedAppScreen, {
        appId: args.appId,
        profileId: args.profileId,
        name: firstScreenDetail.screen_name,
        storageId: firstScreenStorageId,
        dimensions: { width: firstScreenWidth, height: firstScreenHeight },
        size: firstScreenBlob.size,
      });

      console.log(`  ✓ First screen created`);

      // Update progress after first screen (50%)
      await ctx.runMutation(internal.features.appGeneration.jobs.updateAppGenerationJob, {
        jobId: args.jobId,
        screensGenerated: 1,
        progressPercentage: 50,
        currentStep: `Matching style from first screen... (1/${appStructure.screens.length})`,
      });

      // Generate remaining screens IN PARALLEL
      if (appStructure.screens.length > 1) {
        console.log(`  → Generating remaining ${appStructure.screens.length - 1} screens in parallel...`);

        const failedScreens: Array<{ screenName: string; errorMessage: string }> = [];
        const remainingScreenCount = appStructure.screens.length - 1;
        const pointsPerScreen = 50 / remainingScreenCount; // 50% for remaining screens

        const remainingScreenResults: (Id<"appScreens"> | null)[] = await Promise.all(
          appStructure.screens.slice(1).map(async (screenDetail, i) => {
            const screenNumber = i + 2;
            console.log(`    → [Screen ${screenNumber}] ${screenDetail.screen_name}`);

            try {
              const promptResult = await b.GenerateScreenImagePromptWithReference(
                concept.name,
                concept.styleDescription,
                appStructure.common_layout_elements,
                appStructure.tabs,
                screenDetail
              );

              const screenResult = await ctx.runAction(
                internal.utils.fal.falImageActions.geminiFlashEditImage,
                {
                  prompt: promptResult.canvas_edit_prompt,
                  image_urls: [firstScreenUrl, canvasUrl],
                  num_images: 1,
                  output_format: "png",
                }
              );

              if (!screenResult.images || screenResult.images.length === 0) {
                const errorMsg = "No images returned from generation";
                failedScreens.push({ screenName: screenDetail.screen_name, errorMessage: errorMsg });
                return null;
              }

              const screenUrl = screenResult.images[0].url;
              const screenWidth = screenResult.images[0].width || 1290;
              const screenHeight = screenResult.images[0].height || 2796;

              const screenResponse = await fetchWithRetry(screenUrl);
              const screenBlob = await screenResponse.blob();
              const screenStorageId = await ctx.storage.store(screenBlob);

              const screenId = await ctx.runMutation(internal.data.appScreens.createAIGeneratedAppScreen, {
                appId: args.appId,
                profileId: args.profileId,
                name: screenDetail.screen_name,
                storageId: screenStorageId,
                dimensions: { width: screenWidth, height: screenHeight },
                size: screenBlob.size,
              });

              console.log(`    ✓ [Screen ${screenNumber}] Created: ${screenId}`);

              // Update progress incrementally
              const newProgress = 50 + (pointsPerScreen * (i + 1));
              await ctx.runMutation(internal.features.appGeneration.jobs.incrementScreenCount, {
                jobId: args.jobId,
                progressPercentage: Math.min(100, Math.round(newProgress)),
              });

              return screenId;
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : String(error);
              console.log(`    ✗ [Screen ${screenNumber}] Error: ${errorMsg}`);
              failedScreens.push({ screenName: screenDetail.screen_name, errorMessage: errorMsg });
              return null;
            }
          })
        );

        const successfulRemainingScreens = remainingScreenResults.filter(
          (id: Id<"appScreens"> | null): id is Id<"appScreens"> => id !== null
        );
        const totalSuccessful = 1 + successfulRemainingScreens.length;

        console.log(`✅ Phase 3 complete: Generated ${totalSuccessful}/${appStructure.screens.length} screens`);

        // Update final job status
        const finalStatus = totalSuccessful === appStructure.screens.length ? "completed" : "partial";
        await ctx.runMutation(internal.features.appGeneration.jobs.updateAppGenerationJob, {
          jobId: args.jobId,
          status: finalStatus,
          currentStep: `Completed: ${totalSuccessful}/${appStructure.screens.length} screens generated`,
          progressPercentage: 100,
          screensGenerated: totalSuccessful,
          failedScreens: failedScreens.length > 0 ? failedScreens : undefined,
        });

        console.log(`🎉 App generation from concept complete! Screens: ${totalSuccessful}/${appStructure.screens.length}`);
      } else {
        // Only one screen, mark as complete
        await ctx.runMutation(internal.features.appGeneration.jobs.updateAppGenerationJob, {
          jobId: args.jobId,
          status: "completed",
          currentStep: "Completed: 1/1 screen generated",
          progressPercentage: 100,
          screensGenerated: 1,
        });

        console.log(`🎉 App generation from concept complete! Screens: 1/1`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ Error during app generation from concept:", errorMessage);

      await ctx.runMutation(internal.features.appGeneration.jobs.updateAppGenerationJob, {
        jobId: args.jobId,
        status: "failed",
        currentStep: "Generation failed",
        error: errorMessage,
      });

      throw error;
    }
  },
});

/**
 * Progress point allocation:
 * - Generating concept: 15 points
 * - Generating icon: 15 points (parallel with screens)
 * - Generating first screen: 20 points
 * - Generating remaining screens: 50 points (distributed equally)
 * Total: 100 points
 */

