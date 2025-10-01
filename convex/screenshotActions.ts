"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal, api } from "./_generated/api";
import type { FalTextToImageResponse } from "./utils/fal/types";

/**
 * Generate app store screenshots using code-assembled prompts (no BAML)
 *
 * Uses structured positioning parameters for clarity:
 * - headerPosition: Explicit header placement ("top", "bottom", etc.)
 * - devicePosition: Device placement on canvas ("centered", "upper", "lower")
 * - deviceOrientation: Device angle/perspective
 * - headerCopy: Main text
 * - subheaderCopy: Optional secondary text
 * - styleId: Reference to styles table for consistent visual treatment
 */
export const generateScreenshot = internalAction({
  args: {
    // Required references
    styleId: v.id("styles"),
    screenshotSizeId: v.id("screenshotSizes"),

    // App screen options (exactly one required)
    appScreenId: v.optional(v.id("appScreens")),
    appScreenUrl: v.optional(v.string()),

    // Explicit positioning parameters
    headerPosition: v.string(), // "top" | "bottom" | "top-center" | "bottom-center"
    devicePosition: v.optional(v.string()), // "centered" | "upper" | "lower" (default: "centered")
    deviceOrientation: v.string(), // e.g., "tilted 15° right with 3D perspective"

    // Text content
    headerCopy: v.string(), // e.g., "Play Games with Friends!"
    subheaderCopy: v.optional(v.string()), // Optional secondary text

    // Generation options
    numImages: v.optional(v.number()),
  },
  returns: v.any(),
  handler: async (ctx, args): Promise<FalTextToImageResponse> => {
    // ============================================
    // 1. INPUT VALIDATION
    // ============================================

    const hasAppScreenId = args.appScreenId !== undefined;
    const hasAppScreenUrl = args.appScreenUrl !== undefined;
    if (!hasAppScreenId && !hasAppScreenUrl) {
      throw new Error("Must provide either appScreenId or appScreenUrl");
    }
    if (hasAppScreenId && hasAppScreenUrl) {
      throw new Error("Cannot provide both appScreenId and appScreenUrl");
    }

    // ============================================
    // 2. FETCH STYLE CONFIG
    // ============================================

    const style = await ctx.runQuery(api.styles.getStyleById, {
      styleId: args.styleId,
    });

    if (!style) {
      throw new Error(`Style not found: ${args.styleId}`);
    }

    // ============================================
    // 3. FETCH APP SCREEN URL
    // ============================================

    let appScreenUrl: string;

    if (args.appScreenId) {
      const appScreen = await ctx.runQuery(
        api.appScreens.getAppScreenById,
        { screenId: args.appScreenId }
      );

      if (!appScreen) {
        throw new Error(`App screen not found: ${args.appScreenId}`);
      }

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
    // 4. FETCH CANVAS URL
    // ============================================

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

    const canvasUrl = await ctx.runQuery(api.fileStorage.files.getFileUrl, {
      storageId: size.canvasStorageId,
    });
    if (!canvasUrl) {
      throw new Error(`Could not get URL for canvas: ${args.screenshotSizeId}`);
    }

    // ============================================
    // 5. ASSEMBLE PROMPT WITH GROUPED INFORMATION
    // ============================================

    const devicePos = args.devicePosition ?? "centered";

    // Build header text section with subheader if provided
    const headerTextContent = args.subheaderCopy
      ? `"${args.headerCopy}" with subheader "${args.subheaderCopy}" below it`
      : `"${args.headerCopy}"`;

    // Assemble complete prompt with grouped related information
    const prompt = `Create a professional app store screenshot composition with these exact specifications:

BACKGROUND (fills entire canvas edge-to-edge):
${style.backgroundColor}
${style.details}
- Decorative elements sparse and strategic at outer 10-15% border only
- Center 70% kept clear for device and text
- Background extends seamlessly to all edges, no gaps

HEADER TEXT (positioned at ${args.headerPosition}):
- Copy: ${headerTextContent}
- Text style: ${style.textStyle}
- Position: ${args.headerPosition} with 1-2% gap from edge
- Size: Large and bold, 10-12% canvas height maximum
- CRITICAL: Text appears ONCE ONLY at ${args.headerPosition}
- CRITICAL: NO duplicate text anywhere else on canvas
- FORBIDDEN: Do NOT add any text at bottom, sides, corners, or any location other than ${args.headerPosition}

DEVICE (positioned ${devicePos} on canvas):
- Orientation: ${args.deviceOrientation}
- Position: ${devicePos} on canvas
- Frame style: ${style.deviceStyle}
- SIZE CRITICAL: Device must be ENORMOUS at 85-90% of TOTAL canvas height
- Width: Tall and narrow with 1-2% margins each side
- The device should nearly burst from the canvas
- Screen shows provided app screenshot pixel-perfect and unmodified

SPACING & COMPOSITION:
- Ultra-tight 1-2% margins everywhere
- Device + text together fill 95-100% of vertical space
- Text can overlap device edges slightly for aggressive layout
- Aggressive space maximization throughout

CRITICAL RULES:
- Header text appears ONCE ONLY at ${args.headerPosition}, nowhere else
- Device: ENORMOUS 85-90% of total canvas height, nearly touching edges
- Background: Edge-to-edge fill with no gaps
- Decorative elements: Sparse placement, not blocking text or device
- Phone proportions: TALL AND NARROW, never wide or iPad-like
- When unsure, make device BIGGER

FORBIDDEN ELEMENTS:
- Duplicate or repeated text anywhere (especially at bottom if header is at top)
- Text appearing in multiple locations
- Wide or tablet-like device shapes
- Dense decorative borders
- Empty white space at canvas edges
- Small device (must be 85-90% minimum)

Generate a polished, professional app store screenshot.`.trim();

    console.log("Assembled prompt:", prompt);
    console.log("Prompt length:", prompt.length, "characters");
    console.log("Header position:", args.headerPosition);
    console.log("Device position:", devicePos);

    // ============================================
    // 6. GENERATE SCREENSHOTS WITH GEMINI FLASH EDIT
    // ============================================

    const result = await ctx.runAction(
      internal.utils.fal.falImageActions.geminiFlashEditImage,
      {
        prompt,
        image_urls: [canvasUrl, appScreenUrl],
        num_images: args.numImages ?? 3,
        output_format: "png",
        sync_mode: false,
      }
    );

    // ============================================
    // 7. TRACK STYLE USAGE
    // ============================================

    await ctx.runMutation(api.styles.incrementUsage, {
      styleId: args.styleId,
    });

    return result;
  },
});

/**
 * Test action: Generate a set of screenshots in parallel with different configurations
 * Uses the same style ID but varies positioning, orientation, and text for testing
 */
export const generateScreenshotSet = internalAction({
  args: {
    styleId: v.id("styles"),
    screenshotSizeId: v.id("screenshotSizes"),
    screenshots: v.array(
      v.object({
        appScreenId: v.optional(v.id("appScreens")),
        appScreenUrl: v.optional(v.string()),
        headerPosition: v.string(),
        devicePosition: v.optional(v.string()),
        deviceOrientation: v.string(),
        headerCopy: v.string(),
        subheaderCopy: v.optional(v.string()),
      })
    ),
    numImagesPerScreenshot: v.optional(v.number()),
  },
  returns: v.any(),
  handler: async (ctx, args): Promise<{
    totalScreenshots: number;
    successCount: number;
    results: Array<{
      index: number;
      headerCopy: string;
      headerPosition: string;
      success: boolean;
      images?: FalTextToImageResponse["images"];
      error?: string;
    }>;
  }> => {
    console.log(`🎬 Generating screenshot set with ${args.screenshots.length} variations in parallel`);

    // Generate all screenshots in parallel
    const promises = args.screenshots.map(async (screenshot, index): Promise<{
      index: number;
      headerCopy: string;
      headerPosition: string;
      success: boolean;
      images?: FalTextToImageResponse["images"];
      error?: string;
    }> => {
      console.log(`📸 [${index + 1}/${args.screenshots.length}] Starting: "${screenshot.headerCopy}" at ${screenshot.headerPosition}`);

      try {
        // Validate app screen input
        const hasAppScreenId = screenshot.appScreenId !== undefined;
        const hasAppScreenUrl = screenshot.appScreenUrl !== undefined;
        if (!hasAppScreenId && !hasAppScreenUrl) {
          throw new Error("Must provide either appScreenId or appScreenUrl");
        }
        if (hasAppScreenId && hasAppScreenUrl) {
          throw new Error("Cannot provide both appScreenId and appScreenUrl");
        }

        const result: FalTextToImageResponse = await ctx.runAction(
          internal.screenshotActions.generateScreenshot,
          {
            styleId: args.styleId,
            screenshotSizeId: args.screenshotSizeId,
            ...(screenshot.appScreenId ? { appScreenId: screenshot.appScreenId } : { appScreenUrl: screenshot.appScreenUrl! }),
            headerPosition: screenshot.headerPosition,
            devicePosition: screenshot.devicePosition,
            deviceOrientation: screenshot.deviceOrientation,
            headerCopy: screenshot.headerCopy,
            subheaderCopy: screenshot.subheaderCopy,
            numImages: args.numImagesPerScreenshot ?? 1,
          }
        );

        console.log(`✅ [${index + 1}] Completed: "${screenshot.headerCopy}" at ${screenshot.headerPosition} - ${result.images.length} image(s)`);

        return {
          index,
          headerCopy: screenshot.headerCopy,
          headerPosition: screenshot.headerPosition,
          success: true,
          images: result.images,
        };
      } catch (error) {
        console.error(`❌ [${index + 1}] Failed: "${screenshot.headerCopy}":`, error);
        return {
          index,
          headerCopy: screenshot.headerCopy,
          headerPosition: screenshot.headerPosition,
          success: false,
          error: String(error),
        };
      }
    });

    const results = await Promise.all(promises);
    const successCount: number = results.filter((r) => r.success).length;

    console.log(`\n🎉 Screenshot set complete: ${successCount}/${args.screenshots.length} successful`);

    return {
      totalScreenshots: args.screenshots.length,
      successCount,
      results,
    };
  },
});
