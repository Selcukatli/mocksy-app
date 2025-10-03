"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

/**
 * Generate a complete demo app (icon + app record)
 *
 * Takes app concept and icon prompt, generates the icon image,
 * uploads to storage, and creates the app record.
 */
export const generateDemoApp = internalAction({
  args: {
    profileId: v.id("profiles"),
    appConcept: v.string(),
    appDescription: v.optional(v.string()),
    iconPrompt: v.string(),
    styleName: v.string(),
  },
  returns: v.id("apps"),
  handler: async (ctx, args): Promise<Id<"apps">> => {
    console.log("🎨 Generating demo app icon...");

    // 1. Generate app icon image
    const iconResult = await ctx.runAction(
      internal.utils.fal.falImageActions.geminiFlashTextToImage,
      {
        prompt: args.iconPrompt,
        num_images: 1,
        output_format: "png",
      }
    );

    if (!iconResult.images || iconResult.images.length === 0) {
      throw new Error("Failed to generate app icon");
    }

    const iconUrl = iconResult.images[0].url;
    console.log(`  ✓ Icon generated: ${iconUrl.substring(0, 60)}...`);

    // 2. Upload icon to Convex storage
    console.log("📤 Uploading icon to storage...");
    const iconResponse = await fetch(iconUrl);
    if (!iconResponse.ok) {
      throw new Error(`Failed to download icon: ${iconResponse.statusText}`);
    }

    const iconBlob = await iconResponse.blob();
    const iconStorageId = await ctx.storage.store(iconBlob);
    console.log(`  ✓ Icon uploaded: ${iconStorageId}`);

    // 3. Create demo app with icon
    console.log("💾 Creating demo app record...");
    const appId = await ctx.runMutation(internal.apps.createDemoApp, {
      profileId: args.profileId,
      name: args.appConcept,
      description: args.appDescription || `Demo app showcasing ${args.styleName} style`,
      iconStorageId,
    });

    console.log(`✅ Demo app created: ${appId}`);
    return appId;
  },
});

/**
 * Generate a demo app from a style using BAML
 *
 * Fetches the style, uses BAML to generate app concept and icon prompt,
 * then generates the complete demo app.
 */
export const generateDemoAppFromStyle = internalAction({
  args: {
    styleId: v.id("styles"),
    profileId: v.id("profiles"),
  },
  returns: v.id("apps"),
  handler: async (ctx, args): Promise<Id<"apps">> => {
    console.log("🎬 Generating demo app from style:", args.styleId);

    // 1. Fetch the style
    const style = await ctx.runQuery(api.styles.getStyleById, {
      styleId: args.styleId,
    });

    if (!style) {
      throw new Error(`Style not found: ${args.styleId}`);
    }

    // 2. Use BAML to generate app concept and icon prompt
    console.log("🤖 Calling BAML to generate app concept...");
    const { b } = await import("../baml_client");
    const demoApp = await b.GenerateDemoAppFromStyle(
      {
        background_color: style.backgroundColor,
        details: style.details,
        text_style: style.textStyle,
        device_style: style.deviceStyle,
      },
      style.name
    );

    console.log(`  ✓ App name: ${demoApp.app_name}`);
    console.log(`  ✓ App description: ${demoApp.app_description.substring(0, 60)}...`);
    console.log(`  ✓ Icon prompt generated (${demoApp.app_icon_prompt.length} chars)`);

    // 3. Generate the demo app (icon + record)
    const appId = await ctx.runAction(internal.demoActions.generateDemoApp, {
      profileId: args.profileId,
      appConcept: demoApp.app_name,
      appDescription: demoApp.app_description,
      iconPrompt: demoApp.app_icon_prompt,
      styleName: style.name,
    });

    return appId;
  },
});
