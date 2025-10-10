"use node";

import { internalAction, action } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

/**
 * Progress point allocation:
 * - Generating concept: 15 points
 * - Generating icon: 15 points (parallel with screens)
 * - Generating first screen: 20 points
 * - Generating remaining screens: 50 points (distributed equally)
 * Total: 100 points
 */
const PROGRESS_POINTS = {
  CONCEPT: 15,
  ICON: 15,
  FIRST_SCREEN: 20,
  REMAINING_SCREENS: 50,
};

/**
 * Helper function to fetch with retry logic
 */
async function fetchWithRetry(url: string, maxAttempts = 3): Promise<Response> {
  let lastError: string = "";

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`  Attempt ${attempt}/${maxAttempts} to download from ${url.substring(0, 60)}...`);
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }
      lastError = response.statusText;
      console.log(`  ⚠️  Attempt ${attempt} failed: ${lastError}`);
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      console.log(`  ⚠️  Attempt ${attempt} failed: ${lastError}`);
    }

    // Wait before retrying (exponential backoff)
    if (attempt < maxAttempts) {
      const delayMs = Math.pow(2, attempt) * 1000; // 2s, 4s
      console.log(`  ⏳ Waiting ${delayMs/1000}s before retry...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw new Error(`Failed to download after ${maxAttempts} attempts: ${lastError}`);
}

/**
 * Public: Schedule demo app generation and return app ID + job ID
 * Client can poll the job for progress and the app for results
 */
export const scheduleDemoAppGeneration = action({
  args: {
    appDescriptionInput: v.optional(v.string()),
    categoryHint: v.optional(v.string()),
    uiStyle: v.optional(v.string()),
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
      throw new Error("Must be authenticated to generate demo app");
    }

    const profile = await ctx.runQuery(api.profiles.getCurrentProfile);
    if (!profile) {
      throw new Error("Failed to get user profile");
    }

    // Create placeholder app
    const appId: Id<"apps"> = await ctx.runMutation(internal.apps.createDemoApp, {
      profileId: profile._id,
      name: "Generating...",
      description: "AI is generating your app. This will update in real-time.",
      category: args.categoryHint,
    });

    // Create job to track progress
    const jobId = await ctx.runMutation(internal.appGenerationJobs.createAppGenerationJob, {
      profileId: profile._id,
      appId,
      status: "pending",
      currentStep: "Starting generation...",
      progressPercentage: 0,
      screensGenerated: 0,
      screensTotal: 0,
    });

    // Schedule the actual generation in the background
    await ctx.scheduler.runAfter(0, internal.demoActions.generateDemoApp, {
      ...args,
      profileId: profile._id,
      appId,
      jobId,
    });

    return { appId, jobId };
  },
});

/**
 * Internal: Generate a demo app from user description using BAML
 * Uses parallel execution for icon + screen generation
 */
export const generateDemoApp = internalAction({
  args: {
    profileId: v.optional(v.id("profiles")),
    appDescriptionInput: v.optional(v.string()),
    categoryHint: v.optional(v.string()),
    uiStyle: v.optional(v.string()),
    screenshotSizeId: v.optional(v.id("screenshotSizes")),
    appId: v.optional(v.id("apps")),
    jobId: v.optional(v.id("appGenerationJobs")),
  },
  returns: v.id("apps"),
  handler: async (ctx, args): Promise<Id<"apps">> => {
    if (!args.appDescriptionInput) {
      throw new Error("appDescriptionInput is required");
    }

    console.log("🎬 Generating demo app...");

    if (!args.profileId) {
      throw new Error("profileId is required to create demo app");
    }

    // Wrap entire generation in try-catch to handle errors gracefully
    try {
      // 1. Use existing app ID or create new one
      let appId: Id<"apps">;
      if (args.appId) {
        appId = args.appId;
        console.log(`✅ Using existing app: ${appId} (will update progressively)`);
      } else {
        console.log("💾 Creating app record with placeholder data...");
        appId = await ctx.runMutation(internal.apps.createDemoApp, {
          profileId: args.profileId,
          name: "Generating...",
          description: "AI is generating your app. This will update in real-time.",
          category: args.categoryHint,
        });
        console.log(`✅ App created: ${appId} (will update progressively)`);
      }

      console.log("  From description:", args.appDescriptionInput.substring(0, 60) + "...");

      // 2. Use BAML to generate app concept
      if (args.jobId) {
        await ctx.runMutation(internal.appGenerationJobs.updateAppGenerationJob, {
          jobId: args.jobId,
          status: "generating_concept",
          currentStep: "Generating app concept...",
          progressPercentage: 0,
        });
      }

      console.log("🤖 Calling BAML to generate app concept...");
      const { b } = await import("../baml_client");
      const appConcept = await b.GenerateDemoApp(
        args.appDescriptionInput,
        args.categoryHint ?? null,
        args.uiStyle ?? null
      );

      console.log(`  ✓ App name: ${appConcept.app_name}`);
      console.log(`  ✓ App category: ${appConcept.app_category}`);
      console.log(`  ✓ Style guide: ${appConcept.style_guide.substring(0, 60)}...`);

      // Update progress after concept generation
      if (args.jobId) {
        await ctx.runMutation(internal.appGenerationJobs.updateAppGenerationJob, {
          jobId: args.jobId,
          progressPercentage: PROGRESS_POINTS.CONCEPT,
        });
      }

      // 3. UPDATE APP with generated concept
      console.log("💾 Updating app with generated name, description, and category...");
      const fullDescription = `${appConcept.app_subtitle}. ${appConcept.app_description}`;
      await ctx.runMutation(internal.apps.updateDemoApp, {
        appId,
        name: appConcept.app_name,
        description: fullDescription,
        category: appConcept.app_category,
        styleGuide: appConcept.style_guide,
      });
      console.log(`✅ App details updated in real-time`);

      // PARALLEL EXECUTION: Icon generation + Screen generation
      console.log("🚀 Starting parallel generation: Icon + Screens...");

      const IPHONE_16_PRO_MAX_SIZE_ID = "kh74jsbefpsc7wn9pjqfqfa0sd7rn4ct" as Id<"screenshotSizes">;
      const sizeId = args.screenshotSizeId || IPHONE_16_PRO_MAX_SIZE_ID;

      const [iconStorageId, screenResults] = await Promise.all([
        // ===== PARALLEL BRANCH 1: Icon Generation =====
        (async () => {
          console.log("🎨 [ICON] Generating app icon...");
          const iconResult = await ctx.runAction(
            internal.utils.fal.falImageActions.geminiFlashTextToImage,
            {
              prompt: appConcept.app_icon_prompt,
              num_images: 1,
              output_format: "png",
            }
          );

          if (!iconResult.images || iconResult.images.length === 0) {
            throw new Error("Failed to generate app icon");
          }

          const iconUrl = iconResult.images[0].url;
          console.log(`  ✓ [ICON] Generated`);

          console.log("📤 [ICON] Uploading to storage...");
          const iconResponse = await fetchWithRetry(iconUrl);
          const iconBlob = await iconResponse.blob();
          const storageId = await ctx.storage.store(iconBlob);
          console.log(`  ✓ [ICON] Uploaded: ${storageId}`);

          // Update app with icon
          await ctx.runMutation(internal.apps.updateDemoApp, {
            appId,
            iconStorageId: storageId,
          });
          console.log(`✅ [ICON] Added to app`);

          // Update progress for icon completion
          if (args.jobId) {
            await ctx.runMutation(internal.appGenerationJobs.updateAppGenerationJob, {
              jobId: args.jobId,
              progressPercentage: PROGRESS_POINTS.CONCEPT + PROGRESS_POINTS.ICON,
            });
          }

          return storageId;
        })(),

        // ===== PARALLEL BRANCH 2: Screen Generation =====
        (async () => {
          // Generate app structure plan
          console.log("🏗️  [SCREENS] Generating app structure plan...");
          const appStructure = await b.GenerateAppDesignPlan(
            appConcept.app_name,
            appConcept.app_description,
            appConcept.app_category,
            appConcept.style_guide,
            5
          );

          console.log(`  ✓ [SCREENS] Structure generated (${appStructure.screens.length} screens)`);
          console.log(`  ✓ [SCREENS] Tabs: ${appStructure.tabs.has_tabs ? `Yes (${appStructure.tabs.tab_names.join(', ')})` : 'No'}`);

          // Update job with screen count
          if (args.jobId) {
            await ctx.runMutation(internal.appGenerationJobs.updateAppGenerationJob, {
              jobId: args.jobId,
              screensTotal: appStructure.screens.length,
            });
          }

          // Fetch canvas
          console.log(`📐 [SCREENS] Fetching canvas...`);
          const size = await ctx.runQuery(api.screenshotSizes.getSizeById, { sizeId });
          if (!size?.canvasStorageId) {
            throw new Error(`Screenshot size not found: ${sizeId}`);
          }

          const canvasUrl = await ctx.runQuery(api.fileStorage.files.getFileUrl, {
            storageId: size.canvasStorageId,
          });
          if (!canvasUrl) {
            throw new Error(`Could not get canvas URL`);
          }

          // Generate first screen
          if (args.jobId) {
            await ctx.runMutation(internal.appGenerationJobs.updateAppGenerationJob, {
              jobId: args.jobId,
              status: "generating_screens",
              currentStep: `Generating screen 1/${appStructure.screens.length}...`,
            });
          }

          console.log(`🖼️  [SCREENS] Generating screen 1 as reference...`);
          const firstScreenDetail = appStructure.screens[0];

          const firstPromptResult = await b.GenerateFirstScreenImagePrompt(
            appConcept.app_name,
            appConcept.style_guide,
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

          const firstScreenId = await ctx.runMutation(internal.appScreens.createDemoAppScreen, {
            appId,
            profileId: args.profileId!,
            name: firstScreenDetail.screen_name,
            storageId: firstScreenStorageId,
            dimensions: { width: firstScreenWidth, height: firstScreenHeight },
            size: firstScreenBlob.size,
          });

          console.log(`  ✓ [SCREENS] Screen 1 created: ${firstScreenId}`);

          // Update progress after first screen
          const progressAfterFirstScreen = PROGRESS_POINTS.CONCEPT + PROGRESS_POINTS.ICON + PROGRESS_POINTS.FIRST_SCREEN;
          if (args.jobId) {
            await ctx.runMutation(internal.appGenerationJobs.updateAppGenerationJob, {
              jobId: args.jobId,
              screensGenerated: 1,
              progressPercentage: progressAfterFirstScreen,
              currentStep: `Matching style from first screen... (1/${appStructure.screens.length})`,
            });
          }

          // Generate remaining screens IN PARALLEL
          console.log(`🖼️  [SCREENS] Generating remaining ${appStructure.screens.length - 1} screens in parallel...`);

          const failedScreens: Array<{ screenName: string; errorMessage: string }> = [];
          const remainingScreenCount = appStructure.screens.length - 1;
          const pointsPerScreen = PROGRESS_POINTS.REMAINING_SCREENS / remainingScreenCount;

          const remainingScreenResults: (Id<"appScreens"> | null)[] = await Promise.all(
            appStructure.screens.slice(1).map(async (screenDetail, i) => {
              const screenNumber = i + 2;
              console.log(`  → [SCREENS] Generating screen ${screenNumber}: ${screenDetail.screen_name}`);

              try {
                const promptResult = await b.GenerateScreenImagePromptWithReference(
                  appConcept.app_name,
                  appConcept.style_guide,
                  appStructure.common_layout_elements,
                  appStructure.tabs,
                  screenDetail
                );

                const screenResult = await ctx.runAction(
                  internal.utils.fal.falImageActions.geminiFlashEditImage,
                  {
                    prompt: promptResult.canvas_edit_prompt,
                    image_urls: [firstScreenUrl, canvasUrl], // Reference first, canvas second
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

                const screenId = await ctx.runMutation(internal.appScreens.createDemoAppScreen, {
                  appId,
                  profileId: args.profileId!,
                  name: screenDetail.screen_name,
                  storageId: screenStorageId,
                  dimensions: { width: screenWidth, height: screenHeight },
                  size: screenBlob.size,
                });

                console.log(`  ✓ [SCREENS] Screen ${screenNumber} created: ${screenId}`);

                // Update progress
                if (args.jobId) {
                  const newProgress = progressAfterFirstScreen + (pointsPerScreen * (i + 1));
                  await ctx.runMutation(internal.appGenerationJobs.incrementScreenCount, {
                    jobId: args.jobId,
                    progressPercentage: Math.min(100, Math.round(newProgress)),
                  });
                }

                return screenId;
              } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.log(`  ❌ [SCREENS] Error generating screen ${screenNumber}:`, errorMsg);
                failedScreens.push({ screenName: screenDetail.screen_name, errorMessage: errorMsg });
                return null;
              }
            })
          );

          const successfulRemainingScreens = remainingScreenResults.filter(
            (id: Id<"appScreens"> | null): id is Id<"appScreens"> => id !== null
          );
          const totalSuccessful = 1 + successfulRemainingScreens.length;
          console.log(`✅ [SCREENS] Generated ${totalSuccessful}/${appStructure.screens.length} screens`);

          return { totalSuccessful, totalScreens: appStructure.screens.length, failedScreens };
        })(),
      ]);

      // Both branches complete - update final job status
      const { totalSuccessful, totalScreens, failedScreens } = screenResults;

      if (args.jobId) {
        const finalStatus = totalSuccessful === totalScreens ? "completed" : "partial";
        await ctx.runMutation(internal.appGenerationJobs.updateAppGenerationJob, {
          jobId: args.jobId,
          status: finalStatus,
          currentStep: `Completed: ${totalSuccessful}/${totalScreens} screens generated`,
          progressPercentage: 100,
          screensGenerated: totalSuccessful,
          failedScreens: failedScreens.length > 0 ? failedScreens : undefined,
        });
      }

      console.log(`🎉 Demo app generation complete! Icon: ${iconStorageId}, Screens: ${totalSuccessful}/${totalScreens}`);

      return appId;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ Error during app generation:", errorMessage);

      if (args.jobId) {
        await ctx.runMutation(internal.appGenerationJobs.updateAppGenerationJob, {
          jobId: args.jobId,
          status: "failed",
          currentStep: "Generation failed",
          error: errorMessage,
        });
      }

      throw error;
    }
  },
});

/**
 * Public: Improve an app description draft using BAML
 */
export const improveAppDescription = action({
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

    const { b } = await import("../baml_client");
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
 * Internal: Generate a cover image for an app using BAML + Seed Dream 4
 * Analyzes app description and screens to create a promotional banner image
 * No authentication required - for admin/internal use
 */
export const generateAppCoverImage = internalAction({
  args: {
    appId: v.id("apps"),
    width: v.optional(v.number()), // Custom width, default: 1920
    height: v.optional(v.number()), // Custom height, default: 1080
  },
  returns: v.object({
    success: v.boolean(),
    imageUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    imagePrompt: v.optional(v.string()),
    styleNotes: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<{
    success: boolean;
    imageUrl?: string;
    storageId?: Id<"_storage">;
    imagePrompt?: string;
    styleNotes?: string;
    width?: number;
    height?: number;
    error?: string;
  }> => {
    // 1. Fetch app details (no auth check - internal use)
    const app = await ctx.runQuery(internal.apps.getAppById, {
      appId: args.appId,
    });
    if (!app) {
      throw new Error("App not found");
    }

    // 2. Fetch app screens (no auth check - internal use)
    const screens = await ctx.runQuery(internal.appScreens.getScreensByAppId, {
      appId: args.appId,
    });

    console.log(`🎨 Generating cover image for app: ${app.name}`);
    console.log(`  Description: ${app.description?.substring(0, 60)}...`);
    console.log(`  Screens: ${screens.length}`);

    try {
      // 4. Prepare screen names
      const screenNames: string[] = screens.map((s) => s.name);

      // 5. Call BAML to generate image prompt
      console.log("🤖 Generating image prompt with BAML...");
      const { b } = await import("../baml_client");
      const promptResult = await b.GenerateAppCoverImagePrompt(
        app.name,
        app.description || "",
        app.category ?? null,
        app.styleGuide ?? null,
        screenNames
      );

      console.log(`  ✓ Image prompt generated (${promptResult.image_prompt.length} chars)`);
      console.log(`  Prompt preview: ${promptResult.image_prompt.substring(0, 100)}...`);

      // 6. Generate image with Seed Dream 4
      const width = args.width || 1920;
      const height = args.height || 1080;

      console.log(`🖼️  Generating image with Seed Dream 4 (${width}×${height})...`);
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

      const imageUrl: string = imageResult.images[0].url;
      console.log(`  ✅ Cover image generated: ${imageUrl}`);

      // 6. Download and save to storage
      console.log("📤 Downloading and uploading to storage...");
      const imageResponse = await fetchWithRetry(imageUrl);
      const imageBlob = await imageResponse.blob();
      const storageId = await ctx.storage.store(imageBlob);
      console.log(`  ✓ Uploaded to storage: ${storageId}`);

      // 7. Update app with cover image
      await ctx.runMutation(internal.apps.updateDemoApp, {
        appId: args.appId,
        coverImageStorageId: storageId,
      });
      console.log(`  ✓ App updated with cover image`);

      return {
        success: true,
        imageUrl,
        storageId,
        imagePrompt: promptResult.image_prompt,
        styleNotes: promptResult.style_notes,
        width: imageResult.images[0].width ?? undefined,
        height: imageResult.images[0].height ?? undefined,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ Error generating cover image:", errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});
