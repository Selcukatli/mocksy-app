"use node";

import { internalAction, action } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

// ============================================
// CONCEPT GENERATION (Multi-variant preview)
// ============================================

/**
 * Public: Generate 4 app concepts from user description
 * Returns concepts with text immediately, then generates images in parallel
 */
export const generateAppConcepts = action({
  args: {
    appDescriptionInput: v.string(),
    categoryHint: v.optional(v.string()),
  },
  returns: v.object({
    jobId: v.id("conceptGenerationJobs"),
    concepts: v.array(
      v.object({
        app_name: v.string(),
        app_subtitle: v.string(),
        app_description: v.string(),
        app_category: v.optional(v.string()), // Optional for backward compatibility
        style_description: v.string(),
        app_icon_prompt: v.string(),
        cover_image_prompt: v.string(),
        // Structured design system fields
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
  }),
  handler: async (ctx, args): Promise<{
    jobId: Id<"conceptGenerationJobs">;
    concepts: Array<{
      app_name: string;
      app_subtitle: string;
      app_description: string;
      app_category?: string; // Optional for backward compatibility
      style_description: string;
      app_icon_prompt: string;
      cover_image_prompt: string;
      // Structured design system fields
      colors?: {
        primary: string;
        background: string;
        text: string;
        accent: string;
      };
      typography?: {
        headlineFont: string;
        headlineSize: string;
        headlineWeight: string;
        bodyFont: string;
        bodySize: string;
        bodyWeight: string;
      };
      effects?: {
        cornerRadius: string;
        shadowStyle: string;
        designPhilosophy: string;
      };
    }>;
  }> => {
    // Get user's profile
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be authenticated to generate concepts");
    }

    const profile = await ctx.runQuery(api.profiles.getCurrentProfile);
    if (!profile) {
      throw new Error("Failed to get user profile");
    }

    console.log("🎨 Generating 4 app concepts...");

    // 1. Create job record
    const jobId: Id<"conceptGenerationJobs"> = await ctx.runMutation(internal.conceptGenerationJobs.createConceptGenerationJob, {
      profileId: profile._id,
      status: "generating_concepts",
    });

    // 2. Generate text concepts with BAML
    const { b } = await import("../baml_client");
    const result = await b.GenerateAppConcepts(
      args.appDescriptionInput,
      args.categoryHint ?? null
    );

    console.log(`  ✓ Generated ${result.concepts.length} concepts`);

    // 3. Update job with text concepts
    await ctx.runMutation(internal.conceptGenerationJobs.updateConceptsText, {
      jobId,
      concepts: result.concepts,
      status: "generating_images",
    });

    // 4. Schedule parallel image generation
    await ctx.scheduler.runAfter(0, internal.appGenerationActions.generateConceptImages, {
      jobId,
      concepts: result.concepts,
    });

    // Return text concepts immediately (images will load progressively)
    return {
      jobId,
      concepts: result.concepts,
    };
  },
});

/**
 * Internal: Generate images for all concepts in parallel
 */
export const generateConceptImages = internalAction({
  args: {
    jobId: v.id("conceptGenerationJobs"),
    concepts: v.array(
      v.object({
        app_name: v.string(),
        app_subtitle: v.string(),
        app_description: v.string(),
        app_category: v.optional(v.string()), // Optional for backward compatibility
        style_description: v.string(),
        app_icon_prompt: v.string(),
        cover_image_prompt: v.string(),
        // Structured design system fields
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
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    console.log(`🖼️  Generating images for ${args.concepts.length} concepts in parallel...`);

    try {
      // Generate all images in parallel (8 images: 4 icons + 4 covers)
      await Promise.all(
        args.concepts.map(async (concept, index) => {
          try {
            console.log(`  → [Concept ${index + 1}] Generating icon and cover...`);

            // Generate icon and cover in parallel for this concept
            const [iconResult, coverResult] = await Promise.all([
              // Icon generation
              ctx.runAction(internal.utils.fal.falImageActions.geminiFlashTextToImage, {
                prompt: concept.app_icon_prompt,
                num_images: 1,
                output_format: "png",
              }),
              // Cover generation
              ctx.runAction(internal.utils.fal.falImageActions.seedDream4TextToImage, {
                prompt: concept.cover_image_prompt,
                image_size: { width: 1920, height: 1080 },
                num_images: 1,
              }),
            ]);

            const iconUrl = iconResult.images?.[0]?.url;
            const coverUrl = coverResult.images?.[0]?.url;

            if (iconUrl && coverUrl) {
              // Update concept with generated image URLs
              await ctx.runMutation(internal.conceptGenerationJobs.updateConceptImages, {
                jobId: args.jobId,
                conceptIndex: index,
                iconUrl,
                coverUrl,
              });
              console.log(`  ✓ [Concept ${index + 1}] Images generated`);
            } else {
              console.log(`  ✗ [Concept ${index + 1}] Failed to generate images`);
            }
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.log(`  ✗ [Concept ${index + 1}] Error: ${errorMsg}`);
          }
        })
      );

      console.log("✅ Concept image generation complete");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ Error generating concept images:", errorMessage);
      await ctx.runMutation(internal.conceptGenerationJobs.failConceptGenerationJob, {
        jobId: args.jobId,
        error: errorMessage,
      });
    }
  },
});

// ============================================
// CONCEPT TO APP GENERATION
// ============================================

/**
 * Public: Generate full app from selected concept
 * Takes concept data (already has icon/cover URLs), downloads images,
 * generates app structure and screenshots
 */
export const generateAppFromConcept = action({
  args: {
    concept: v.object({
      app_name: v.string(),
      app_subtitle: v.string(),
      app_description: v.string(),
      app_category: v.string(),
      style_description: v.string(),
      icon_url: v.optional(v.string()),
      cover_url: v.optional(v.string()),
      // Structured design system fields
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
    }),
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

    const profile = await ctx.runQuery(api.profiles.getCurrentProfile);
    if (!profile) {
      throw new Error("Failed to get user profile");
    }

    const numScreens = args.numScreens || 5;

    console.log(`🚀 Generating full app from concept: ${args.concept.app_name}`);

    // Create placeholder app with concept data
    const appId: Id<"apps"> = await ctx.runMutation(internal.apps.createAIGeneratedApp, {
      profileId: profile._id,
      name: args.concept.app_name,
      description: `${args.concept.app_subtitle}. ${args.concept.app_description}`,
      category: args.concept.app_category,
      styleGuide: args.concept.style_description,
    });

    // Create job to track progress
    const jobId = await ctx.runMutation(internal.appGenerationJobs.createAppGenerationJob, {
      profileId: profile._id,
      appId,
      status: "pending",
      currentStep: "Starting generation from concept...",
      progressPercentage: 0,
      screensGenerated: 0,
      screensTotal: numScreens,
    });

    // Schedule the actual generation in the background
    await ctx.scheduler.runAfter(0, internal.appGenerationActions.generateAppFromConceptInternal, {
      profileId: profile._id,
      appId,
      jobId,
      concept: args.concept,
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
 * - 20%: Download + store icon/cover images
 * - 30%: Generate app structure plan
 * - 50%: Generate first screenshot
 * - 100%: Generate remaining screenshots (in parallel)
 */
export const generateAppFromConceptInternal = internalAction({
  args: {
    profileId: v.id("profiles"),
    appId: v.id("apps"),
    jobId: v.id("appGenerationJobs"),
    concept: v.object({
      app_name: v.string(),
      app_subtitle: v.string(),
      app_description: v.string(),
      app_category: v.string(),
      style_description: v.string(),
      icon_url: v.optional(v.string()),
      cover_url: v.optional(v.string()),
      // Structured design system fields
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
    }),
    skipScreenshots: v.boolean(),
    numScreens: v.number(),
    screenshotSizeId: v.optional(v.id("screenshotSizes")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    console.log(`🎬 Generating app from concept: ${args.concept.app_name}`);

    try {
      // ===== PHASE 1: Download and store images (20% progress) =====
      console.log("📥 Phase 1: Downloading icon and cover images...");
      await ctx.runMutation(internal.appGenerationJobs.updateAppGenerationJob, {
        jobId: args.jobId,
        status: "downloading_images",
        currentStep: "Downloading icon and cover images...",
        progressPercentage: 0,
      });

      let iconStorageId: Id<"_storage"> | undefined;
      let coverStorageId: Id<"_storage"> | undefined;

      // Download and store icon if available
      if (args.concept.icon_url) {
        console.log("  → Downloading icon...");
        const iconResponse = await fetchWithRetry(args.concept.icon_url);
        const iconBlob = await iconResponse.blob();
        iconStorageId = await ctx.storage.store(iconBlob);
        console.log(`  ✓ Icon stored: ${iconStorageId}`);
      }

      // Download and store cover if available
      if (args.concept.cover_url) {
        console.log("  → Downloading cover...");
        const coverResponse = await fetchWithRetry(args.concept.cover_url);
        const coverBlob = await coverResponse.blob();
        coverStorageId = await ctx.storage.store(coverBlob);
        console.log(`  ✓ Cover stored: ${coverStorageId}`);
      }

      // Update app with stored images
      await ctx.runMutation(internal.apps.updateAIGeneratedApp, {
        appId: args.appId,
        iconStorageId,
        coverImageStorageId: coverStorageId,
      });

      await ctx.runMutation(internal.appGenerationJobs.updateAppGenerationJob, {
        jobId: args.jobId,
        progressPercentage: 20,
        currentStep: "Images downloaded",
      });

      console.log("✅ Phase 1 complete: Images downloaded and stored");

      // If skipScreenshots is true, stop here and mark as preview_ready
      if (args.skipScreenshots) {
        console.log("⏸️  Skipping screenshot generation - preview mode");
        await ctx.runMutation(internal.appGenerationJobs.updateAppGenerationJob, {
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
      await ctx.runMutation(internal.appGenerationJobs.updateAppGenerationJob, {
        jobId: args.jobId,
        status: "generating_structure",
        currentStep: "Generating app structure plan...",
      });

      const { b } = await import("../baml_client");
      const appStructure = await b.GenerateAppDesignPlan(
        args.concept.app_name,
        args.concept.app_description,
        args.concept.app_category,
        args.concept.style_description,
        args.numScreens
      );

      console.log(`  ✓ Structure generated (${appStructure.screens.length} screens)`);
      console.log(`  ✓ Tabs: ${appStructure.tabs.has_tabs ? `Yes (${appStructure.tabs.tab_names.join(', ')})` : 'No'}`);

      await ctx.runMutation(internal.appGenerationJobs.updateAppGenerationJob, {
        jobId: args.jobId,
        progressPercentage: 30,
        currentStep: `Structure planned: ${appStructure.screens.length} screens`,
        screensTotal: appStructure.screens.length,
      });

      console.log("✅ Phase 2 complete: App structure planned");

      // ===== PHASE 3: Generate screenshots (30% -> 100% progress) =====
      console.log("🖼️  Phase 3: Generating screenshots...");
      await ctx.runMutation(internal.appGenerationJobs.updateAppGenerationJob, {
        jobId: args.jobId,
        status: "generating_screens",
        currentStep: `Generating screen 1/${appStructure.screens.length}...`,
      });

      // Fetch canvas
      const IPHONE_16_PRO_MAX_SIZE_ID = "kh74jsbefpsc7wn9pjqfqfa0sd7rn4ct" as Id<"screenshotSizes">;
      const sizeId = args.screenshotSizeId || IPHONE_16_PRO_MAX_SIZE_ID;

      console.log(`📐 Fetching canvas...`);
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
      console.log(`  → Generating first screen: ${appStructure.screens[0].screen_name}`);
      const firstScreenDetail = appStructure.screens[0];

      const firstPromptResult = await b.GenerateFirstScreenImagePrompt(
        args.concept.app_name,
        args.concept.style_description,
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

      await ctx.runMutation(internal.appScreens.createAIGeneratedAppScreen, {
        appId: args.appId,
        profileId: args.profileId,
        name: firstScreenDetail.screen_name,
        storageId: firstScreenStorageId,
        dimensions: { width: firstScreenWidth, height: firstScreenHeight },
        size: firstScreenBlob.size,
      });

      console.log(`  ✓ First screen created`);

      // Update progress after first screen (50%)
      await ctx.runMutation(internal.appGenerationJobs.updateAppGenerationJob, {
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
                args.concept.app_name,
                args.concept.style_description,
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

              const screenId = await ctx.runMutation(internal.appScreens.createAIGeneratedAppScreen, {
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
              await ctx.runMutation(internal.appGenerationJobs.incrementScreenCount, {
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
        await ctx.runMutation(internal.appGenerationJobs.updateAppGenerationJob, {
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
        await ctx.runMutation(internal.appGenerationJobs.updateAppGenerationJob, {
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

      await ctx.runMutation(internal.appGenerationJobs.updateAppGenerationJob, {
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

// ============================================
// APP GENERATION (Full generation)
// ============================================

/**
 * Public: Schedule app generation and return app ID + job ID
 * Client can poll the job for progress and the app for results
 */
export const scheduleAppGeneration = action({
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
    const appId: Id<"apps"> = await ctx.runMutation(internal.apps.createAIGeneratedApp, {
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
    await ctx.scheduler.runAfter(0, internal.appGenerationActions.generateApp, {
      ...args,
      profileId: profile._id,
      appId,
      jobId,
    });

    return { appId, jobId };
  },
});

/**
 * Internal: Generate an app from user description using BAML
 * Uses parallel execution for icon + screen generation
 */
export const generateApp = internalAction({
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

    console.log("🎬 Generating app with AI...");

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
        appId = await ctx.runMutation(internal.apps.createAIGeneratedApp, {
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
      const appConcept = await b.GenerateApp(
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
      await ctx.runMutation(internal.apps.updateAIGeneratedApp, {
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
          await ctx.runMutation(internal.apps.updateAIGeneratedApp, {
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

          const firstScreenId = await ctx.runMutation(internal.appScreens.createAIGeneratedAppScreen, {
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

                const screenId = await ctx.runMutation(internal.appScreens.createAIGeneratedAppScreen, {
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

      console.log(`🎉 App generation complete! Icon: ${iconStorageId}, Screens: ${totalSuccessful}/${totalScreens}`);

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
 * Generate cover image variants for an app using BAML + Seed Dream 4
 * Analyzes app description and screens to create promotional banner images
 * Returns multiple variants for user selection (does not save to database)
 */
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
    variants: v.optional(v.array(v.object({
      imageUrl: v.string(),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
    }))),
    imagePrompt: v.optional(v.string()),
    styleNotes: v.optional(v.string()),
    estimatedTimeMs: v.optional(v.number()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<{
    success: boolean;
    variants?: Array<{
      imageUrl: string;
      width?: number;
      height?: number;
    }>;
    imagePrompt?: string;
    styleNotes?: string;
    estimatedTimeMs?: number;
    error?: string;
  }> => {
    // 1. Fetch app details
    const app = await ctx.runQuery(api.apps.getApp, {
      appId: args.appId,
    });
    if (!app) {
      throw new Error("App not found or access denied");
    }

    // 2. Fetch app screens
    const screens = await ctx.runQuery(api.appScreens.getAppScreens, {
      appId: args.appId,
    });

    console.log(`🎨 Generating cover image for app: ${app.name}`);
    console.log(`  Description: ${app.description?.substring(0, 60)}...`);
    console.log(`  Screens: ${screens.length}`);

    try {
      // 4. Prepare screen names
      const screenNames: string[] = screens.map((s: { name: string }) => s.name);

      // 5. Call BAML to generate image prompt
      console.log("🤖 Generating image prompt with BAML...");
      const { b } = await import("../baml_client");
      const promptResult = await b.GenerateAppCoverImagePrompt(
        app.name,
        app.description || "",
        app.category ?? null,
        app.styleGuide ?? null,
        screenNames,
        args.userFeedback ?? null
      );

      console.log(`  ✓ Image prompt generated (${promptResult.image_prompt.length} chars)`);
      console.log(`  Prompt preview: ${promptResult.image_prompt.substring(0, 100)}...`);

      // 6. Generate image variants with Seed Dream 4
      // Using 2:1 aspect ratio to match AppStorePreviewCard display (aspect-[2/1])
      const width = args.width || 1920;
      const height = args.height || 960;
      const numVariants = Math.min(args.numVariants || 4, 6); // Max 6 variants

      // Calculate estimated time: 7 seconds per image
      const { FAL_IMAGE_GENERATION_TIMES, FAL_IMAGE_MODELS } = await import("../convex/utils/fal/clients/image/imageModels");
      const timePerImage = FAL_IMAGE_GENERATION_TIMES[FAL_IMAGE_MODELS.SEED_DREAM_4] || 7000;
      const estimatedTimeMs = timePerImage * numVariants;

      console.log(`🖼️  Generating ${numVariants} variants with Seed Dream 4 (${width}×${height})...`);
      console.log(`⏱️  Estimated time: ${(estimatedTimeMs / 1000).toFixed(1)}s`);
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

      // Return all variants without saving
      const variants = imageResult.images.map((img) => ({
        imageUrl: img.url,
        width: img.width ?? undefined,
        height: img.height ?? undefined,
      }));

      return {
        success: true,
        variants,
        imagePrompt: promptResult.image_prompt,
        styleNotes: promptResult.style_notes,
        estimatedTimeMs,
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
      const app = await ctx.runQuery(api.apps.getApp, { appId: args.appId });
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
      await ctx.runMutation(internal.apps.updateAIGeneratedApp, {
        appId: args.appId,
        coverImageStorageId: storageId,
      });
      console.log(`  ✅ App updated with cover image`);

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

