"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

/**
 * Generate a demo app from a style OR description using BAML
 *
 * Accepts either a styleId OR a user-provided description.
 * Uses BAML to generate app concept and icon prompt,
 * generates the icon, and creates the complete demo app.
 */
export const generateDemoApp = internalAction({
  args: {
    styleId: v.optional(v.id("styles")),
    profileId: v.id("profiles"),
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

    // 2. Use BAML to generate app concept and icon prompt
    console.log("🤖 Calling BAML to generate app concept...");
    const { b } = await import("../baml_client");
    const demoApp = await b.GenerateDemoAppFromStyle(
      styleConfig,
      styleName,
      args.appDescriptionInput
    );

    console.log(`  ✓ App name: ${demoApp.app_name}`);
    console.log(`  ✓ App description: ${demoApp.app_description.substring(0, 60)}...`);
    console.log(`  ✓ Icon prompt generated (${demoApp.app_icon_prompt.length} chars)`);

    // 3. Generate app icon image
    console.log("🎨 Generating demo app icon...");
    const iconResult = await ctx.runAction(
      internal.utils.fal.falImageActions.geminiFlashTextToImage,
      {
        prompt: demoApp.app_icon_prompt,
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
    const appId = await ctx.runMutation(internal.apps.createDemoApp, {
      profileId: args.profileId,
      name: demoApp.app_name,
      description: demoApp.app_description,
      iconStorageId,
    });

    console.log(`✅ Demo app created: ${appId}`);
    return appId;
  },
});
