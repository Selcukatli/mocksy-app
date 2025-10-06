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
    screenshotSizeId: v.optional(v.id("screenshotSizes")), // Default: iPhone 16 Pro Max
  },
  returns: v.id("apps"),
  handler: async (ctx, args): Promise<Id<"apps">> => {
    if (!args.styleId && !args.appDescriptionInput) {
      throw new Error("Either styleId or appDescriptionInput must be provided");
    }

    console.log("🎬 Generating demo app...");

    let styleName = "Custom Style";
    let styleConfig = null;

    // 1. If styleId provided, fetch the style
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

    // 2. Use BAML to generate app concept (name, description, icon, color theme)
    console.log("🤖 Calling BAML to generate app concept...");
    const { b } = await import("../baml_client");
    const appConcept = await b.GenerateDemoApp(
      args.appDescriptionInput,
      styleConfig,
      styleName
    );

    console.log(`  ✓ App name: ${appConcept.app_name}`);
    console.log(`  ✓ App description: ${appConcept.app_description.substring(0, 60)}...`);
    console.log(`  ✓ Icon prompt generated (${appConcept.app_icon_prompt.length} chars)`);
    console.log(`  ✓ Color theme: ${appConcept.color_theme}`);

    // 2b. Generate screen prompts using the app concept
    console.log("🖼️  Calling BAML to generate screen prompts...");
    const screenPrompts = await b.GenerateScreensForApp(
      appConcept.app_name,
      appConcept.app_description,
      null, // no specific instructions for demo apps
      5,    // default 5 screens
      appConcept.color_theme,
      styleConfig
    );

    console.log(`  ✓ Screen prompts generated (${screenPrompts.app_screen_prompts.length} screens)`);

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

    // 4. Generate app icon image
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

    // 4. Upload icon to Convex storage
    console.log("📤 Uploading icon to storage...");
    const iconResponse = await fetch(iconUrl);
    if (!iconResponse.ok) {
      throw new Error(`Failed to download icon: ${iconResponse.statusText}`);
    }

    const iconBlob = await iconResponse.blob();
    const iconStorageId = await ctx.storage.store(iconBlob);
    console.log(`  ✓ Icon uploaded: ${iconStorageId}`);

    // 5. Create demo app with icon
    console.log("💾 Creating demo app record...");

    if (!args.profileId) {
      throw new Error("profileId is required to create demo app");
    }

    const appId = await ctx.runMutation(internal.apps.createDemoApp, {
      profileId: args.profileId,
      name: appConcept.app_name,
      description: appConcept.app_description,
      iconStorageId,
    });

    console.log(`✅ Demo app created: ${appId}`);

    // 6. Generate first screen (reference screen for consistency)
    console.log(`🖼️  Generating screen 1 as reference...`);

    const firstScreenPrompt = screenPrompts.app_screen_prompts[0];
    const firstScreenName = firstScreenPrompt.split('.')[0].replace('iPhone screenshot of ', '').trim();

    const firstScreenFinalPrompt = `CANVAS EDITING TASK: You are provided with a BLANK CANVAS image. Your job is to edit this exact canvas by painting app UI directly onto it.

MANDATORY: You MUST use the provided canvas image as your base. DO NOT create a new image or change dimensions. Edit the existing canvas only.

TASK: Paint the following app UI directly onto the provided canvas from edge to edge:

${firstScreenPrompt}

CRITICAL RULES - MUST FOLLOW EXACTLY:
1. USE THE PROVIDED CANVAS - do not create new dimensions or aspect ratio
2. NO device frame, NO phone bezel, NO notch, NO rounded corners, NO drop shadow, NO padding, NO inset
3. This is a RAW SCREEN CAPTURE - just app UI pixels painted directly onto the canvas
4. Fill ENTIRE canvas edge-to-edge:
   - Status bar pixels touch the TOP edge (no gap)
   - App content/background extends to BOTTOM edge (no gap)
   - UI extends to LEFT and RIGHT edges (no side gaps)
5. Background color must fill ALL 4 edges completely - zero white space, zero gaps
6. Bottom of canvas: Content or background color must reach the very last pixel row
7. FORBIDDEN: No rounded corners on the canvas itself, no white gaps at edges, no padding around the UI, no 1:1 square aspect ratio

Think: "Paint UI pixels directly from edge pixel to edge pixel - every edge must touch the canvas boundary."`;

    const firstScreenResult = await ctx.runAction(
      internal.utils.fal.falImageActions.geminiFlashEditImage,
      {
        prompt: firstScreenFinalPrompt,
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
      name: firstScreenName,
      storageId: firstScreenStorageId,
      dimensions: {
        width: firstScreenWidth,
        height: firstScreenHeight,
      },
      size: firstScreenBlob.size,
    });

    console.log(`  ✓ Screen 1 created: ${firstScreenId} (will be used as reference)`);

    // 7. Generate remaining screens in parallel using first screen as reference
    console.log(`🖼️  Generating remaining ${screenPrompts.app_screen_prompts.length - 1} screens with visual reference...`);

    const remainingScreenResults = await Promise.all(
      screenPrompts.app_screen_prompts.slice(1).map(async (screenPrompt, index) => {
        const screenName = screenPrompt.split('.')[0].replace('iPhone screenshot of ', '').trim();
        const screenNumber = index + 2; // +2 because we're skipping screen 1
        console.log(`  → Generating screen ${screenNumber}: ${screenName}`);

        try {
          // Wrap BAML prompt with canvas editing instructions + reference screen guidance
          const finalPrompt = `CANVAS EDITING TASK: You are provided with a BLANK CANVAS and a REFERENCE SCREEN. Your job is to edit the canvas by painting app UI that matches the visual style of the reference.

MANDATORY: You MUST use the provided canvas image as your base. DO NOT create a new image or change dimensions. Edit the existing canvas only.

REFERENCE SCREEN USAGE: The second image shows an existing screen from this app. Match its exact visual design:
- Use the SAME colors, fonts, and UI component styles
- Match the status bar style, navigation bar style, and button designs
- Keep typography, spacing, and visual hierarchy consistent
- CRITICAL FOR NAVIGATION: The reference shows one tab as active - use its ACTIVE styling (color/appearance) for the active tab in YOUR screen, and its INACTIVE styling for inactive tabs. The WHICH tab is active will be different - that's correct, just match the styling approach.
- This ensures all screens look like they belong to the same app

TASK: Paint the following app UI directly onto the provided canvas from edge to edge:

${screenPrompt}

CRITICAL RULES - MUST FOLLOW EXACTLY:
1. USE THE PROVIDED CANVAS - do not create new dimensions or aspect ratio
2. MATCH THE REFERENCE SCREEN'S visual style (colors, fonts, components, spacing)
3. NO device frame, NO phone bezel, NO notch, NO rounded corners, NO drop shadow, NO padding, NO inset
4. This is a RAW SCREEN CAPTURE - just app UI pixels painted directly onto the canvas
5. Fill ENTIRE canvas edge-to-edge:
   - Status bar pixels touch the TOP edge (no gap)
   - App content/background extends to BOTTOM edge (no gap)
   - UI extends to LEFT and RIGHT edges (no side gaps)
6. Background color must fill ALL 4 edges completely - zero white space, zero gaps
7. Bottom of canvas: Content or background color must reach the very last pixel row
8. FORBIDDEN: No rounded corners on the canvas itself, no white gaps at edges, no padding around the UI, no 1:1 square aspect ratio

Think: "Paint UI pixels directly from edge pixel to edge pixel - every edge must touch the canvas boundary. Match the reference screen's visual design exactly."`;

          // Generate screen image with Gemini Flash Edit (canvas + reference screen)
          const screenResult = await ctx.runAction(
            internal.utils.fal.falImageActions.geminiFlashEditImage,
            {
              prompt: finalPrompt,
              image_urls: [canvasUrl, firstScreenUrl], // Canvas + reference screen
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
            name: screenName,
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
    console.log(`✅ Generated ${totalSuccessful}/${screenPrompts.app_screen_prompts.length} app screens (1 reference + ${successfulRemainingScreens.length} matching)`);

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
    colorTheme: v.optional(v.string()),
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

    // 2. Determine color theme (use provided or generate from app name)
    const colorTheme = args.colorTheme || "modern color palette matching the app concept";

    // 3. Call BAML to generate screen prompts
    console.log("🤖 Calling BAML to generate screen prompts...");
    const { b } = await import("../baml_client");
    const result = await b.GenerateScreensForApp(
      app.name,
      app.description || "An app",
      args.screenInstructions || null,
      args.numScreens || 5,
      colorTheme,
      null // style_config optional
    );

    console.log(`  ✓ Generated ${result.app_screen_prompts.length} screen prompts`);

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

    // 5. Generate screens in parallel
    const screenResults = await Promise.all(
      result.app_screen_prompts.map(async (screenPrompt, index) => {
        const screenName = screenPrompt.split('.')[0].replace('iPhone screenshot of ', '').trim();
        console.log(`  → Generating screen ${index + 1}: ${screenName}`);

        try {
          // Wrap BAML prompt with canvas editing instructions
          const finalPrompt = `CANVAS EDITING TASK: You are provided with a BLANK CANVAS image. Your job is to edit this exact canvas by painting app UI directly onto it.

MANDATORY: You MUST use the provided canvas image as your base. DO NOT create a new image or change dimensions. Edit the existing canvas only.

TASK: Paint the following app UI directly onto the provided canvas from edge to edge:

${screenPrompt}

CRITICAL RULES - MUST FOLLOW EXACTLY:
1. USE THE PROVIDED CANVAS - do not create new dimensions or aspect ratio
2. NO device frame, NO phone bezel, NO notch, NO rounded corners, NO drop shadow, NO padding, NO inset
3. This is a RAW SCREEN CAPTURE - just app UI pixels painted directly onto the canvas
4. Fill ENTIRE canvas edge-to-edge:
   - Status bar pixels touch the TOP edge (no gap)
   - App content/background extends to BOTTOM edge (no gap)
   - UI extends to LEFT and RIGHT edges (no side gaps)
5. Background color must fill ALL 4 edges completely - zero white space, zero gaps
6. Bottom of canvas: Content or background color must reach the very last pixel row
7. FORBIDDEN: No rounded corners on the canvas itself, no white gaps at edges, no padding around the UI, no 1:1 square aspect ratio

Think: "Paint UI pixels directly from edge pixel to edge pixel - every edge must touch the canvas boundary."`;

          // Generate screen image with Gemini Flash Edit (canvas-based)
          const screenResult = await ctx.runAction(
            internal.utils.fal.falImageActions.geminiFlashEditImage,
            {
              prompt: finalPrompt,
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
            name: screenName,
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
    console.log(`✅ Generated ${successfulScreens.length}/${result.app_screen_prompts.length} app screens`);

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
    colorTheme: v.optional(v.string()),
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
      colorTheme: args.colorTheme,
    });
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
  }),
  handler: async (
    ctx,
    args
  ): Promise<{ improvedDescription: string }> => {
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
    };
  },
});
