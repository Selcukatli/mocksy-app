"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { b } from "../baml_client";
import type { TextConfig, LayoutConfig, StyleConfig } from "../baml_client/types";

/**
 * Generate app store screenshots using BAML + Gemini Flash 2.5 Edit
 *
 * Flexible inputs allow using either DB references or direct URLs/configs:
 * - Style: styleId OR customStyle
 * - App Screen: appScreenId OR appScreenUrl
 * - Canvas: screenshotSizeId OR canvasUrl
 */
export const generateScreenshot = internalAction({
  args: {
    // Style options (exactly one required)
    styleId: v.optional(v.id("screenshotStyles")),
    customStyle: v.optional(
      v.object({
        backgroundColor: v.string(),
        details: v.string(),
        textStyle: v.string(),
        deviceStyle: v.string(),
      })
    ),

    // App screen options (exactly one required)
    appScreenId: v.optional(v.id("appScreens")),
    appScreenUrl: v.optional(v.string()),

    // Canvas options (exactly one required)
    screenshotSizeId: v.optional(v.id("screenshotSizes")),
    canvasUrl: v.optional(v.string()),

    // Required text and layout config
    headerText: v.string(),
    subheaderText: v.optional(v.string()),
    layoutComposition: v.string(),
    deviceOrientation: v.string(),
    deviceType: v.string(),

    // Generation options
    numImages: v.optional(v.number()),
  },
  returns: v.any(),
  handler: async (ctx, args): Promise<any> => {
    // ============================================
    // 1. INPUT VALIDATION
    // ============================================

    // Validate style input
    const hasStyleId = args.styleId !== undefined;
    const hasCustomStyle = args.customStyle !== undefined;
    if (!hasStyleId && !hasCustomStyle) {
      throw new Error("Must provide either styleId or customStyle");
    }
    if (hasStyleId && hasCustomStyle) {
      throw new Error("Cannot provide both styleId and customStyle");
    }

    // Validate app screen input
    const hasAppScreenId = args.appScreenId !== undefined;
    const hasAppScreenUrl = args.appScreenUrl !== undefined;
    if (!hasAppScreenId && !hasAppScreenUrl) {
      throw new Error("Must provide either appScreenId or appScreenUrl");
    }
    if (hasAppScreenId && hasAppScreenUrl) {
      throw new Error("Cannot provide both appScreenId and appScreenUrl");
    }

    // Validate canvas input
    const hasScreenshotSizeId = args.screenshotSizeId !== undefined;
    const hasCanvasUrl = args.canvasUrl !== undefined;
    if (!hasScreenshotSizeId && !hasCanvasUrl) {
      throw new Error("Must provide either screenshotSizeId or canvasUrl");
    }
    if (hasScreenshotSizeId && hasCanvasUrl) {
      throw new Error("Cannot provide both screenshotSizeId and canvasUrl");
    }

    // ============================================
    // 2. FETCH/USE STYLE CONFIG
    // ============================================

    let styleConfig: StyleConfig;

    if (args.styleId) {
      const style = await ctx.runQuery(api.screenshotStyles.getStyleById, {
        styleId: args.styleId,
      });

      if (!style) {
        throw new Error(`Style not found: ${args.styleId}`);
      }

      styleConfig = {
        background_color: style.backgroundColor,
        details: style.details,
        text_style: style.textStyle,
        device_style: style.deviceStyle,
      };
    } else {
      // Use custom style
      styleConfig = {
        background_color: args.customStyle!.backgroundColor,
        details: args.customStyle!.details,
        text_style: args.customStyle!.textStyle,
        device_style: args.customStyle!.deviceStyle,
      };
    }

    // ============================================
    // 3. FETCH/USE APP SCREEN URL
    // ============================================

    let appScreenUrl: string;

    if (args.appScreenId) {
      // Directly get app screen from DB (no auth needed in internal action)
      const appScreen = await ctx.runQuery(
        api.appScreens.getAppScreenById,
        { screenId: args.appScreenId }
      );

      if (!appScreen) {
        throw new Error(`App screen not found: ${args.appScreenId}`);
      }

      // Get the file URL from storage
      const url = await ctx.runQuery(
        api.fileStorage.files.getFileUrl,
        { storageId: appScreen.storageId }
      );
      if (!url) {
        throw new Error(`Could not get URL for app screen: ${args.appScreenId}`);
      }
      appScreenUrl = url;
    } else {
      appScreenUrl = args.appScreenUrl!;
    }

    // ============================================
    // 4. FETCH/USE CANVAS URL
    // ============================================

    let canvasUrl: string;

    if (args.screenshotSizeId) {
      const size = await ctx.runQuery(
        api.screenshotSizes.getSizeById,
        { sizeId: args.screenshotSizeId }
      );

      if (!size) {
        throw new Error(`Screenshot size not found: ${args.screenshotSizeId}`);
      }

      if (!size.canvasStorageId) {
        throw new Error(
          `Screenshot size ${args.screenshotSizeId} has no canvas image`
        );
      }

      // Get the canvas URL from storage
      const url = await ctx.runQuery(api.fileStorage.files.getFileUrl, {
        storageId: size.canvasStorageId,
      });
      if (!url) {
        throw new Error(`Could not get URL for canvas: ${args.screenshotSizeId}`);
      }
      canvasUrl = url;
    } else {
      canvasUrl = args.canvasUrl!;
    }

    // ============================================
    // 5. CALL BAML TO GENERATE STRUCTURED PROMPT
    // ============================================

    const textConfig: TextConfig = {
      header: args.headerText,
      subheader: args.subheaderText ?? null,
    };

    const layoutConfig: LayoutConfig = {
      composition: args.layoutComposition,
      device_orientation: args.deviceOrientation,
      device_type: args.deviceType,
    };

    console.log("Calling BAML GenerateScreenshotPrompt with:", {
      text: textConfig,
      layout: layoutConfig,
      style: styleConfig,
    });

    const bamlResult = await b.GenerateScreenshotPrompt(
      textConfig,
      layoutConfig,
      styleConfig
    );

    console.log("BAML generated structured prompt:", bamlResult);

    // Convert BAML result to JSON string for Gemini
    const promptJson = JSON.stringify(bamlResult, null, 2);

    // ============================================
    // 6. GENERATE SCREENSHOTS WITH GEMINI FLASH EDIT
    // ============================================

    console.log("Calling Gemini Flash Edit with:", {
      canvasUrl,
      appScreenUrl,
      numImages: args.numImages ?? 3,
    });

    const result: any = await ctx.runAction(
      internal.utils.fal.falImageActions.geminiFlashEditImage,
      {
        prompt: promptJson,
        image_urls: [canvasUrl, appScreenUrl],
        num_images: args.numImages ?? 3,
        output_format: "png",
        sync_mode: false,
      }
    );

    // ============================================
    // 7. TRACK STYLE USAGE (if using styleId)
    // ============================================

    if (args.styleId) {
      await ctx.runMutation(api.screenshotStyles.incrementUsage, {
        styleId: args.styleId,
      });
    }

    return result;
  },
});
