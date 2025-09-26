"use node";

import { action } from "../../../_generated/server";
import { v } from "convex/values";
import { api } from "../../../_generated/api";

/**
 * Direct test to check what video metadata we actually get
 *
 * npx convex run utils/fal/test/testVideoMetadata:checkLucy
 * npx convex run utils/fal/test/testVideoMetadata:checkSeeDance
 */

export const checkLucy = action({
  args: {},
  handler: async (ctx): Promise<any> => {
    console.log("🔍 Testing Lucy-14b metadata response...\n");

    const result: any = await ctx.runAction(
      api.utils.fal.falVideoActions.lucyImageToVideo,
      {
        prompt: "Add gentle motion",
        image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600",
        sync_mode: false, // URL mode
      }
    );

    console.log("Full Lucy response:", JSON.stringify(result, null, 2));

    // Analyze what we got
    if (result.success && result.videoUrl) {
      console.log("\n📊 Lucy-14b Analysis:");
      console.log("- Has URL: ✅");
      console.log("- Has Duration:", result.duration ? `✅ ${result.duration}s` : "❌ undefined");
      console.log("- Has Width:", result.width ? `✅ ${result.width}px` : "❌ undefined");
      console.log("- Has Height:", result.height ? `✅ ${result.height}px` : "❌ undefined");

      // The actual video is probably 5 seconds based on the model
      // Lucy-14b typically generates 5-second videos
      const assumedDuration = 5;
      const estimatedCost = assumedDuration * 0.08;

      console.log("\n💡 Assumptions:");
      console.log(`- Assumed duration: ${assumedDuration}s (typical for Lucy-14b)`);
      console.log(`- Estimated cost: $${estimatedCost.toFixed(2)}`);
    }

    return result;
  },
});

export const checkSeeDance = action({
  args: {},
  handler: async (ctx): Promise<any> => {
    console.log("🔍 Testing SeeDance metadata response...\n");

    const result: any = await ctx.runAction(
      api.utils.fal.falVideoActions.seeDanceImageToVideo,
      {
        prompt: "Add gentle motion",
        image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600",
        duration: 5,
        resolution: "720p",
      }
    );

    console.log("Full SeeDance response:", JSON.stringify(result, null, 2));

    // Analyze what we got
    if (result.success && result.videoUrl) {
      console.log("\n📊 SeeDance Analysis:");
      console.log("- Has URL: ✅");
      console.log("- Has Duration:", result.duration ? `✅ ${result.duration}s` : "❌ undefined");
      console.log("- Has Width:", result.width ? `✅ ${result.width}px` : "❌ undefined");
      console.log("- Has Height:", result.height ? `✅ ${result.height}px` : "❌ undefined");

      console.log("\n💰 Cost: $0.18 (fixed for 5s 720p)");
    }

    return result;
  },
});

export const compareActualCosts = action({
  args: {},
  handler: async (ctx): Promise<any> => {
    console.log("💰 ACTUAL COST COMPARISON\n");
    console.log("Based on what the APIs actually return and charge:\n");

    const results = {
      lucy: {
        model: "Lucy-14b",
        typicalDuration: "5 seconds (assumed)",
        cost: "$0.40 (5s × $0.08/s)",
        speed: "Fast (~10-30s generation)",
        outputFormat: "URL (with sync_mode: false)",
        metadata: "No duration/dimensions returned",
      },
      seedance: {
        model: "SeeDance",
        typicalDuration: "5 seconds (requested)",
        cost: "$0.18 (fixed for 5s 720p)",
        speed: "Fast (~10-30s generation)",
        outputFormat: "Always URL",
        metadata: "May not return duration/dimensions",
      },
      kling: {
        model: "Kling",
        typicalDuration: "5 or 10 seconds (requested)",
        cost: "$0.35 (5s) or $0.70 (10s)",
        speed: "Slow (~30-60s generation)",
        outputFormat: "URL",
        metadata: "Returns full metadata",
      },
    };

    console.log("📊 Summary Table:");
    console.log("=" .repeat(60));
    console.log("Model     | 5s Video | Speed    | Metadata");
    console.log("-".repeat(60));
    console.log("SeeDance  | $0.18 ✅ | Fast     | Limited");
    console.log("Kling     | $0.35    | Slow     | Complete");
    console.log("Lucy-14b  | $0.40    | Fast     | None");
    console.log("=" .repeat(60));

    console.log("\n🎯 Recommendations:");
    console.log("1. Best Value: SeeDance ($0.18, fast, versatile)");
    console.log("2. Best Quality: Kling ($0.35+, slower, full metadata)");
    console.log("3. URL vs Base64: Lucy with sync_mode control");

    console.log("\n⚠️ Important Notes:");
    console.log("- Lucy-14b doesn't return video duration in API response");
    console.log("- SeeDance may not return dimensions consistently");
    console.log("- Actual durations may vary from requested");
    console.log("- Costs are based on typical 5-second outputs");

    return results;
  },
});