"use node";

import { internalAction, action } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

/**
 * Internal: Generate a demo app from a style OR description using BAML
 *
 * Accepts either a styleId OR a user-provided description.
 * Uses BAML to generate app concept and icon prompt,
 * generates the icon, and creates the complete demo app.
 */
export const generateDemoAppInternal = internalAction({
  args: {
    styleId: v.optional(v.id("styles")),
    profileId: v.optional(v.id("profiles")),
    appDescriptionInput: v.optional(v.string()),
    categoryHint: v.optional(v.string()),
    vibeStyle: v.optional(v.string()),
    screenshotSizeId: v.optional(v.id("screenshotSizes")), // Default: iPhone 16 Pro Max
    appId: v.optional(v.id("apps")), // If provided, update existing app instead of creating new one
  },
  returns: v.id("apps"),
  handler: async (ctx, args): Promise<Id<"apps">> => {
    if (!args.styleId && !args.appDescriptionInput) {
      throw new Error("Either styleId or appDescriptionInput must be provided");
    }

    console.log("🎬 Generating demo app...");

    if (!args.profileId) {
      throw new Error("profileId is required to create demo app");
    }

    // 1. Use existing app ID or create new one
    let appId: Id<"apps">;
    if (args.appId) {
      appId = args.appId;
      console.log(`✅ Using existing app: ${appId} (will update progressively)`);
    } else {
      // CREATE APP IMMEDIATELY with placeholder data
      console.log("💾 Creating app record with placeholder data...");
      appId = await ctx.runMutation(internal.apps.createDemoApp, {
        profileId: args.profileId,
        name: "Generating...",
        description: "AI is generating your app. This will update in real-time.",
        category: args.categoryHint,
      });
      console.log(`✅ App created: ${appId} (will update progressively)`);
    }

    let styleName = "Custom Style";
    let styleConfig = null;

    // 2. If styleId provided, fetch the style
    if (args.styleId) {
      console.log("  From style:", args.styleId);
      const style = await ctx.runQuery(api.styles.getStyleById, {
        styleId: args.styleId,
      });

      if (!style) {
        throw new Error(`Style not found: ${args.styleId}`);
      }

      styleName = style.name;
      styleConfig = {
        background_color: style.backgroundColor,
        details: style.details,
        text_style: style.textStyle,
        device_style: style.deviceStyle,
      };
    } else {
      console.log("  From description:", args.appDescriptionInput?.substring(0, 60) + "...");
    }

    // 3. Use BAML to generate app concept (name, description, category, icon, color theme)
    console.log("🤖 Calling BAML to generate app concept...");
    const { b } = await import("../baml_client");
    const appConcept = await b.GenerateDemoApp(
      args.appDescriptionInput ?? null,
      args.categoryHint ?? null,
      args.vibeStyle ?? null,
      styleConfig,
      styleName
    );

    console.log(`  ✓ App name: ${appConcept.app_name}`);
    console.log(`  ✓ App subtitle: ${appConcept.app_subtitle}`);
    console.log(`  ✓ App category: ${appConcept.app_category}`);
    console.log(`  ✓ App description: ${appConcept.app_description.substring(0, 60)}...`);
    console.log(`  ✓ Icon prompt generated (${appConcept.app_icon_prompt.length} chars)`);
    console.log(`  ✓ Style guide: ${appConcept.style_guide.substring(0, 60)}...`);

    // 4. UPDATE APP with generated concept (combine subtitle into description for display)
    console.log("💾 Updating app with generated name, description, and category...");
    // Use subtitle as the first sentence/preview of description
    const fullDescription = `${appConcept.app_subtitle}. ${appConcept.app_description}`;
    await ctx.runMutation(internal.apps.updateDemoApp, {
      appId,
      name: appConcept.app_name,
      description: fullDescription,
      category: appConcept.app_category,
      styleGuide: appConcept.style_guide,
    });
    console.log(`✅ App details updated in real-time`);

    // 2b. Generate app structure plan (tabs, layout, screen details)
    console.log("🏗️  Calling BAML to generate app structure plan...");
    const appStructure = await b.GenerateAppStructure(
      appConcept.app_name,
      appConcept.app_description,
      appConcept.style_guide,
      5 // default 5 screens
    );

    console.log(`  ✓ App structure generated (${appStructure.screens.length} screens planned)`);
    console.log(`  ✓ Tabs: ${appStructure.tabs.has_tabs ? `Yes (${appStructure.tabs.tab_names.join(', ')})` : 'No'}`);

    // 3. Fetch canvas for screen generation
    const IPHONE_16_PRO_MAX_SIZE_ID = "kh74jsbefpsc7wn9pjqfqfa0sd7rn4ct" as Id<"screenshotSizes">;
    const sizeId = args.screenshotSizeId || IPHONE_16_PRO_MAX_SIZE_ID;

    console.log(`📐 Fetching canvas for screenshot size: ${sizeId}`);
    const size = await ctx.runQuery(api.screenshotSizes.getSizeById, {
      sizeId,
    });

    if (!size) {
      throw new Error(`Screenshot size not found: ${sizeId}`);
    }

    if (!size.canvasStorageId) {
      throw new Error(`Screenshot size ${sizeId} has no canvas image`);
    }

    const canvasUrl = await ctx.runQuery(api.fileStorage.files.getFileUrl, {
      storageId: size.canvasStorageId,
    });

    if (!canvasUrl) {
      throw new Error(`Could not get canvas URL for size: ${sizeId}`);
    }

    console.log(`  ✓ Canvas URL retrieved`);

    // 5. Generate app icon image
    console.log("🎨 Generating demo app icon...");
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
    console.log(`  ✓ Icon generated: ${iconUrl.substring(0, 60)}...`);

    // 6. Upload icon to Convex storage
    console.log("📤 Uploading icon to storage...");
    const iconResponse = await fetch(iconUrl);
    if (!iconResponse.ok) {
      throw new Error(`Failed to download icon: ${iconResponse.statusText}`);
    }

    const iconBlob = await iconResponse.blob();
    const iconStorageId = await ctx.storage.store(iconBlob);
    console.log(`  ✓ Icon uploaded: ${iconStorageId}`);

    // 7. UPDATE APP with icon
    console.log("💾 Updating app with icon...");
    await ctx.runMutation(internal.apps.updateDemoApp, {
      appId,
      iconStorageId,
    });
    console.log(`✅ Icon added to app in real-time`);

    // 6. Generate first screen (reference screen for consistency)
    console.log(`🖼️  Generating screen 1 as reference...`);

    const firstScreenDetail = appStructure.screens[0];
    console.log(`  Screen: ${firstScreenDetail.screen_name}`);

    // Generate prompt for first screen (no reference image)
    const firstPromptResult = await b.GenerateScreenImagePrompt(
      appConcept.app_name,
      appConcept.style_guide,
      appStructure.common_layout_elements,
      appStructure.tabs,
      firstScreenDetail,
      false // no reference image for first screen
    );

    // Generate first screen image
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

    // Download and upload first screen to storage
    const firstScreenResponse = await fetch(firstScreenUrl);
    if (!firstScreenResponse.ok) {
      throw new Error("Failed to download first screen");
    }

    const firstScreenBlob = await firstScreenResponse.blob();
    const firstScreenStorageId = await ctx.storage.store(firstScreenBlob);

    // Create first screen record
    const firstScreenId = await ctx.runMutation(internal.appScreens.createDemoAppScreen, {
      appId,
      profileId: args.profileId!,
      name: firstScreenDetail.screen_name,
      storageId: firstScreenStorageId,
      dimensions: {
        width: firstScreenWidth,
        height: firstScreenHeight,
      },
      size: firstScreenBlob.size,
    });

    console.log(`  ✓ Screen 1 created: ${firstScreenId} (will be used as reference)`);

    // 7. Generate remaining screens in parallel using first screen as visual reference
    console.log(`🖼️  Generating remaining ${appStructure.screens.length - 1} screens with visual reference...`);

    const remainingScreenResults = await Promise.all(
      appStructure.screens.slice(1).map(async (screenDetail, index) => {
        const screenNumber = index + 2; // +2 because we're skipping screen 1
        console.log(`  → Generating screen ${screenNumber}: ${screenDetail.screen_name}`);

        try {
          // Generate prompt for this screen (WITH reference image)
          const promptResult = await b.GenerateScreenImagePrompt(
            appConcept.app_name,
            appConcept.style_guide,
            appStructure.common_layout_elements,
            appStructure.tabs,
            screenDetail,
            true // has reference image
          );

          // Generate screen image with canvas + first screen as reference
          const screenResult = await ctx.runAction(
            internal.utils.fal.falImageActions.geminiFlashEditImage,
            {
              prompt: promptResult.canvas_edit_prompt,
              image_urls: [canvasUrl, firstScreenUrl], // canvas + reference
              num_images: 1,
              output_format: "png",
            }
          );

          if (!screenResult.images || screenResult.images.length === 0) {
            console.log(`  ❌ Failed to generate screen ${screenNumber}: No images returned`);
            return null;
          }

          const screenUrl = screenResult.images[0].url;
          const screenWidth = screenResult.images[0].width || 1290;
          const screenHeight = screenResult.images[0].height || 2796;

          // Download and upload to storage
          const screenResponse = await fetch(screenUrl);
          if (!screenResponse.ok) {
            console.log(`  ❌ Failed to download screen ${screenNumber}`);
            return null;
          }

          const screenBlob = await screenResponse.blob();
          const screenStorageId = await ctx.storage.store(screenBlob);

          // Create app screen record
          const screenId = await ctx.runMutation(internal.appScreens.createDemoAppScreen, {
            appId,
            profileId: args.profileId!,
            name: screenDetail.screen_name,
            storageId: screenStorageId,
            dimensions: {
              width: screenWidth,
              height: screenHeight,
            },
            size: screenBlob.size,
          });

          console.log(`  ✓ Screen ${screenNumber} created: ${screenId}`);
          return screenId;
        } catch (error) {
          console.log(`  ❌ Error generating screen ${screenNumber}:`, error);
          return null;
        }
      })
    );

    const successfulRemainingScreens = remainingScreenResults.filter(
      (id): id is Id<"appScreens"> => id !== null
    );
    const totalSuccessful = 1 + successfulRemainingScreens.length; // +1 for first screen
    console.log(`✅ Generated ${totalSuccessful}/${appStructure.screens.length} app screens (1 reference + ${successfulRemainingScreens.length} matching)`);

    return appId;
  },
});

/**
 * Generate app screens for an existing app (demo or user-created)
 *
 * Uses BAML to generate screen prompts based on app details,
 * then generates the screens in parallel using Gemini Flash.
 */
export const generateScreensForExistingApp = internalAction({
  args: {
    appId: v.id("apps"),
    profileId: v.id("profiles"),
    screenInstructions: v.optional(v.string()),
    numScreens: v.optional(v.number()),
    screenshotSizeId: v.optional(v.id("screenshotSizes")), // Default: iPhone 16 Pro Max
  },
  returns: v.array(v.id("appScreens")),
  handler: async (ctx, args): Promise<Id<"appScreens">[]> => {
    console.log(`🖼️  Generating screens for existing app: ${args.appId}`);

    // 1. Get app details
    const app = await ctx.runQuery(api.apps.getApp, { appId: args.appId });
    if (!app) {
      throw new Error("App not found");
    }

    console.log(`  App: ${app.name}`);
    console.log(`  Instructions: ${args.screenInstructions || "auto-generate"}`);
    console.log(`  Num screens: ${args.numScreens || 5}`);

    // 2. Use app's styleGuide or generate a default one
    const styleGuide = app.styleGuide || "Modern, clean design with a neutral color palette and sans-serif typography.";

    // 3. Generate app structure plan
    console.log("🏗️  Calling BAML to generate app structure plan...");
    const { b } = await import("../baml_client");
    const appStructure = await b.GenerateAppStructure(
      app.name,
      app.description || "An app",
      styleGuide,
      args.numScreens || 5
    );

    console.log(`  ✓ App structure generated (${appStructure.screens.length} screens planned)`);

    // 4. Fetch canvas for screen generation
    const IPHONE_16_PRO_MAX_SIZE_ID = "kh74jsbefpsc7wn9pjqfqfa0sd7rn4ct" as Id<"screenshotSizes">;
    const sizeId = args.screenshotSizeId || IPHONE_16_PRO_MAX_SIZE_ID;

    console.log(`📐 Fetching canvas for screenshot size: ${sizeId}`);
    const size = await ctx.runQuery(api.screenshotSizes.getSizeById, {
      sizeId,
    });

    if (!size) {
      throw new Error(`Screenshot size not found: ${sizeId}`);
    }

    if (!size.canvasStorageId) {
      throw new Error(`Screenshot size ${sizeId} has no canvas image`);
    }

    const canvasUrl = await ctx.runQuery(api.fileStorage.files.getFileUrl, {
      storageId: size.canvasStorageId,
    });

    if (!canvasUrl) {
      throw new Error(`Could not get canvas URL for size: ${sizeId}`);
    }

    console.log(`  ✓ Canvas URL retrieved`);

    // 5. Generate all screens in parallel (all with canvas only, no reference)
    const screenResults = await Promise.all(
      appStructure.screens.map(async (screenDetail, index) => {
        const screenNumber = index + 1;
        console.log(`  → Generating screen ${screenNumber}: ${screenDetail.screen_name}`);

        try {
          // Generate prompt for this screen
          const promptResult = await b.GenerateScreenImagePrompt(
            app.name,
            styleGuide,
            appStructure.common_layout_elements,
            appStructure.tabs,
            screenDetail,
            false // no reference image for user-generated apps (generate all in parallel)
          );

          // Generate screen image with canvas
          const screenResult = await ctx.runAction(
            internal.utils.fal.falImageActions.geminiFlashEditImage,
            {
              prompt: promptResult.canvas_edit_prompt,
              image_urls: [canvasUrl],
              num_images: 1,
              output_format: "png",
            }
          );

          if (!screenResult.images || screenResult.images.length === 0) {
            console.log(`  ❌ Failed to generate screen ${index + 1}: No images returned`);
            return null;
          }

          const screenUrl = screenResult.images[0].url;
          const screenWidth = screenResult.images[0].width || 1080; // Default 9:16 aspect ratio
          const screenHeight = screenResult.images[0].height || 1920;

          // Download and upload to storage
          const screenResponse = await fetch(screenUrl);
          if (!screenResponse.ok) {
            console.log(`  ❌ Failed to download screen ${index + 1}`);
            return null;
          }

          const screenBlob = await screenResponse.blob();
          const screenStorageId = await ctx.storage.store(screenBlob);

          // Create app screen record
          const screenId = await ctx.runMutation(internal.appScreens.createDemoAppScreen, {
            appId: args.appId,
            profileId: args.profileId,
            name: screenDetail.screen_name,
            storageId: screenStorageId,
            dimensions: {
              width: screenWidth,
              height: screenHeight,
            },
            size: screenBlob.size,
          });

          console.log(`  ✓ Screen ${index + 1} created: ${screenId}`);
          return screenId;
        } catch (error) {
          console.log(`  ❌ Error generating screen ${index + 1}:`, error);
          return null;
        }
      })
    );

    const successfulScreens = screenResults.filter(
      (id): id is Id<"appScreens"> => id !== null
    );
    console.log(`✅ Generated ${successfulScreens.length}/${appStructure.screens.length} app screens`);

    return successfulScreens;
  },
});

// ============================================
// PUBLIC ACTIONS
// ============================================

/**
 * Public: Generate a demo app from a style for the current user
 */
export const generateDemoAppFromStyle = action({
  args: {
    styleId: v.id("styles"),
  },
  returns: v.id("apps"),
  handler: async (ctx, args): Promise<Id<"apps">> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user's profile
    const profile = await ctx.runQuery(api.profiles.getCurrentProfile);
    if (!profile) {
      throw new Error("Profile not found");
    }

    // Call internal action
    return await ctx.runAction(internal.demoActions.generateDemoAppInternal, {
      styleId: args.styleId,
      profileId: profile._id,
      appDescriptionInput: undefined,
    });
  },
});

/**
 * Public: Generate a demo app from a description for the current user
 */
export const generateDemoAppFromDescription = action({
  args: {
    appDescription: v.string(),
  },
  returns: v.id("apps"),
  handler: async (ctx, args): Promise<Id<"apps">> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user's profile
    const profile = await ctx.runQuery(api.profiles.getCurrentProfile);
    if (!profile) {
      throw new Error("Profile not found");
    }

    // Call internal action
    return await ctx.runAction(internal.demoActions.generateDemoAppInternal, {
      styleId: undefined,
      profileId: profile._id,
      appDescriptionInput: args.appDescription,
    });
  },
});

/**
 * Public: Generate additional screens for an existing app
 */
export const generateScreensForApp = action({
  args: {
    appId: v.id("apps"),
    screenInstructions: v.optional(v.string()),
    numScreens: v.optional(v.number()),
  },
  returns: v.array(v.id("appScreens")),
  handler: async (ctx, args): Promise<Id<"appScreens">[]> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user's profile
    const profile = await ctx.runQuery(api.profiles.getCurrentProfile);
    if (!profile) {
      throw new Error("Profile not found");
    }

    // Verify app ownership
    const app = await ctx.runQuery(api.apps.getApp, { appId: args.appId });
    if (!app || app.profileId !== profile._id) {
      throw new Error("App not found or access denied");
    }

    // Call internal action
    return await ctx.runAction(internal.demoActions.generateScreensForExistingApp, {
      appId: args.appId,
      profileId: profile._id,
      screenInstructions: args.screenInstructions,
      numScreens: args.numScreens,
    });
  },
});

/**
 * Public: Generate a complete app with icon and screens from user's description
 * This is the main action called from the new-app form
 *
 * IMPORTANT: Returns app ID immediately and generates content in the background
 */
export const generateApp = action({
  args: {
    appDescription: v.string(),
    category: v.optional(v.string()),
    vibe: v.optional(v.string()),
  },
  returns: v.id("apps"),
  handler: async (ctx, args): Promise<Id<"apps">> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user's profile
    const profile = await ctx.runQuery(api.profiles.getCurrentProfile);
    if (!profile) {
      throw new Error("Profile not found");
    }

    // Parse the "AppName: Description" format if present
    let cleanDescription = args.appDescription.trim();

    // If description contains "AppName: Description", extract just the description part
    const colonIndex = cleanDescription.indexOf(':');
    if (colonIndex > 0 && colonIndex < 30) {
      const potentialName = cleanDescription.substring(0, colonIndex).trim();
      const wordCount = potentialName.split(/\s+/).length;
      if (wordCount <= 4 && potentialName.length <= 30) {
        // This looks like "AppName: Description" format, use the full thing
        cleanDescription = cleanDescription;
      }
    }

    // Create placeholder app record immediately
    const appId = await ctx.runMutation(internal.apps.createDemoApp, {
      profileId: profile._id,
      name: "Generating...",
      description: "AI is generating your app. This will update in real-time.",
      category: args.category,
    });

    // Schedule background generation (fire and forget)
    // Note: We intentionally don't await this to return the app ID immediately
    void ctx.scheduler.runAfter(0, internal.demoActions.generateDemoAppInternal, {
      styleId: undefined,
      profileId: profile._id,
      appDescriptionInput: cleanDescription,
      categoryHint: args.category,
      vibeStyle: args.vibe,
      appId, // Pass the app ID so we update the existing record
    });

    // Return app ID immediately so modal can start showing progress
    return appId;
  },
});

/**
 * Public: Improve an app description draft using BAML
 */
export const improveAppDescription = action({
  args: {
    draftDescription: v.string(),
    vibeHint: v.optional(v.string()),
  },
  returns: v.object({
    improvedDescription: v.string(),
    improvedStyle: v.string(),
    inferredCategory: v.string(),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{ improvedDescription: string; improvedStyle: string; inferredCategory: string }> => {
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
      args.vibeHint ?? null
    );

    return {
      improvedDescription: result.improved_description,
      improvedStyle: result.improved_style,
      inferredCategory: result.inferred_category,
    };
  },
});
