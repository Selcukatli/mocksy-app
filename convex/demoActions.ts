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

    // 3. Generate app icon image
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

    // 6. Generate app screens in parallel
    console.log(`🖼️  Generating ${screenPrompts.app_screen_prompts.length} app screens...`);

    const screenResults = await Promise.all(
      screenPrompts.app_screen_prompts.map(async (screenPrompt, index) => {
        const screenName = screenPrompt.split('.')[0].replace('iPhone screenshot of ', '').trim();
        console.log(`  → Generating screen ${index + 1}: ${screenName}`);

        try {
          // Generate screen image with Gemini Flash
          const screenResult = await ctx.runAction(
            internal.utils.fal.falImageActions.geminiFlashTextToImage,
            {
              prompt: screenPrompt,
              num_images: 1,
              aspect_ratio: "9:16",
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

          console.log(`  ✓ Screen ${index + 1} created: ${screenId}`);
          return screenId;
        } catch (error) {
          console.log(`  ❌ Error generating screen ${index + 1}:`, error);
          return null;
        }
      })
    );

    const successfulScreens = screenResults.filter(id => id !== null);
    console.log(`✅ Generated ${successfulScreens.length}/${screenPrompts.app_screen_prompts.length} app screens`);

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

    // 4. Generate screens in parallel
    const screenResults = await Promise.all(
      result.app_screen_prompts.map(async (screenPrompt, index) => {
        const screenName = screenPrompt.split('.')[0].replace('iPhone screenshot of ', '').trim();
        console.log(`  → Generating screen ${index + 1}: ${screenName}`);

        try {
          // Generate screen image with Gemini Flash
          const screenResult = await ctx.runAction(
            internal.utils.fal.falImageActions.geminiFlashTextToImage,
            {
              prompt: screenPrompt,
              num_images: 1,
              aspect_ratio: "9:16",
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

    const successfulScreens = screenResults.filter(id => id !== null) as Id<"appScreens">[];
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
