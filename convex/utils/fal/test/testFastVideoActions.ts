"use node";

import { action } from "../../../_generated/server";
import { v } from "convex/values";
import { api } from "../../../_generated/api";

/**
 * Test FAST video models (Lucy-14b and SeeDance)
 *
 * These models are much faster and more affordable than Kling.
 *
 * Usage:
 * npx convex run utils/fal/test/testFastVideoActions:testLucy
 * npx convex run utils/fal/test/testFastVideoActions:testSeeDance
 * npx convex run utils/fal/test/testFastVideoActions:testBothFast
 */

/**
 * Test Lucy-14b - LIGHTNING FAST
 * Cost: ~$0.08/second
 */
export const testLucy = action({
  args: {
    imageUrl: v.optional(v.string()),
    syncMode: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<any> => {
    console.log("🚀 Testing Lucy-14b (FAST model)...\n");
    console.log(`Sync mode: ${args.syncMode !== false ? 'true (sync)' : 'false (async)'}`);

    const imageUrl = args.imageUrl || "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&h=1080&fit=crop";

    const result: any = await ctx.runAction(
      api.utils.fal.falVideoActions.lucyImageToVideo,
      {
        prompt: "The person or scene starts moving with dynamic energy and natural motion",
        image_url: imageUrl,
        aspect_ratio: "16:9",
        sync_mode: args.syncMode !== false, // Default to true
      }
    );

    if (result.success) {
      console.log("✅ Lucy-14b test PASSED!");
      console.log(`Video URL: ${result.videoUrl}`);
      console.log(`Resolution: ${result.width}x${result.height}`);
      console.log(`Duration: ${result.duration}s`);
      console.log(`Estimated cost: ~$${(result.duration || 5) * 0.08}`);
    } else {
      console.log("❌ Lucy-14b test FAILED:", result.error);
    }

    return result;
  },
});

/**
 * Test SeeDance v1 Lite - FAST & CUSTOMIZABLE
 * Cost: $0.18 for 5s 720p
 */
export const testSeeDance = action({
  args: {
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    console.log("🎬 Testing SeeDance v1 Lite...\n");

    const imageUrl = args.imageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop";

    const result: any = await ctx.runAction(
      api.utils.fal.falVideoActions.seeDanceImageToVideo,
      {
        prompt: "The landscape comes alive with gentle wind and flowing motion",
        image_url: imageUrl,
        duration: 5,
        resolution: "720p",
        aspect_ratio: "16:9",
        camera_fixed: false, // Allow camera movement
      }
    );

    if (result.success) {
      console.log("✅ SeeDance test PASSED!");
      console.log(`Video URL: ${result.videoUrl}`);
      console.log(`Resolution: ${result.width}x${result.height}`);
      console.log(`Duration: ${result.duration}s`);
      console.log(`Cost: $0.18 (for 5s 720p)`);
    } else {
      console.log("❌ SeeDance test FAILED:", result.error);
    }

    return result;
  },
});

/**
 * Test SeeDance text-to-video
 */
export const testSeeDanceText = action({
  args: {},
  handler: async (ctx): Promise<any> => {
    console.log("🎬 Testing SeeDance v1 Lite Text-to-Video...\n");

    const result: any = await ctx.runAction(
      api.utils.fal.falVideoActions.seeDanceTextToVideo,
      {
        prompt: "A beautiful sunset over the ocean with gentle waves, birds flying in the distance",
        duration: "5",
        resolution: "720p",
        aspect_ratio: "16:9",
      }
    );

    if (result.success) {
      console.log("✅ SeeDance text-to-video test PASSED!");
      console.log(`Video URL: ${result.videoUrl}`);
      console.log(`Resolution: ${result.width}x${result.height}`);
      console.log(`Duration: ${result.duration}s`);
    } else {
      console.log("❌ SeeDance text-to-video test FAILED:", result.error);
    }

    return result;
  },
});

/**
 * Test both fast models in parallel
 */
export const testBothFast = action({
  args: {
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    console.log("⚡ Testing BOTH fast video models...\n");

    const imageUrl = args.imageUrl || "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=1920&h=1080&fit=crop";

    // Run both tests in parallel for speed
    const [lucyResult, seeDanceResult] = await Promise.all([
      ctx.runAction(api.utils.fal.test.testFastVideoActions.testLucy, { imageUrl }),
      ctx.runAction(api.utils.fal.test.testFastVideoActions.testSeeDance, { imageUrl }),
    ]);

    console.log("\n" + "=".repeat(50));
    console.log("📊 FAST VIDEO MODELS TEST SUMMARY");
    console.log("=".repeat(50));

    const results = {
      lucy: lucyResult,
      seeDance: seeDanceResult,
      summary: {
        lucySuccess: lucyResult.success,
        seeDanceSuccess: seeDanceResult.success,
        totalCost:
          (lucyResult.success ? (lucyResult.duration || 5) * 0.08 : 0) +
          (seeDanceResult.success ? 0.18 : 0),
      }
    };

    console.log(`\nLucy-14b: ${results.summary.lucySuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`SeeDance: ${results.summary.seeDanceSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`\n💸 Total cost: $${results.summary.totalCost.toFixed(2)}`);

    return results;
  },
});

/**
 * Quick speed comparison test
 */
export const speedTest = action({
  args: {},
  handler: async (ctx): Promise<any> => {
    console.log("🏁 Speed Test: Fast models vs Kling...\n");

    const testImage = "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&h=600&fit=crop";
    const testPrompt = "Simple test: add subtle motion";

    console.log("Testing Lucy-14b (expected: <10 seconds)...");
    const lucyStart = Date.now();

    const lucyResult: any = await ctx.runAction(
      api.utils.fal.falVideoActions.lucyImageToVideo,
      {
        prompt: testPrompt,
        image_url: testImage,
        sync_mode: true,
      }
    );

    const lucyTime = (Date.now() - lucyStart) / 1000;

    console.log(`Lucy-14b completed in ${lucyTime.toFixed(1)}s`);

    if (lucyResult.success) {
      console.log(`✅ Video URL: ${lucyResult.videoUrl}`);
      console.log(`Cost: $${(lucyResult.duration || 5) * 0.08}`);
    } else {
      console.log(`❌ Failed: ${lucyResult.error}`);
    }

    return {
      model: "Lucy-14b",
      timeSeconds: lucyTime,
      success: lucyResult.success,
      videoUrl: lucyResult.videoUrl,
      cost: lucyResult.success ? (lucyResult.duration || 5) * 0.08 : 0,
    };
  },
});

/**
 * Test output format with different sync modes
 */
export const testOutputFormat = action({
  args: {
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    console.log("🔍 Testing Lucy-14b output format with different sync modes...\n");

    const imageUrl = args.imageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop";
    const prompt = "Gentle camera movement over the landscape";

    // Test with sync_mode: true
    console.log("Testing with sync_mode: true...");
    const syncResult: any = await ctx.runAction(
      api.utils.fal.falVideoActions.lucyImageToVideo,
      {
        prompt,
        image_url: imageUrl,
        sync_mode: true,
      }
    );

    console.log("\nSync mode result:");
    if (syncResult.success && syncResult.videoUrl) {
      const isBase64 = syncResult.videoUrl.startsWith("data:");
      const isUrl = syncResult.videoUrl.startsWith("http");
      console.log(`- Format: ${isBase64 ? "Base64" : isUrl ? "URL" : "Unknown"}`);
      if (!isBase64) {
        console.log(`- Video URL: ${syncResult.videoUrl}`);
      } else {
        console.log(`- Base64 data (${syncResult.videoUrl.substring(0, 50)}...)`);
      }
    }

    // Test with sync_mode: false
    console.log("\nTesting with sync_mode: false...");
    const asyncResult: any = await ctx.runAction(
      api.utils.fal.falVideoActions.lucyImageToVideo,
      {
        prompt,
        image_url: imageUrl,
        sync_mode: false,
      }
    );

    console.log("\nAsync mode result:");
    if (asyncResult.success && asyncResult.videoUrl) {
      const isBase64 = asyncResult.videoUrl.startsWith("data:");
      const isUrl = asyncResult.videoUrl.startsWith("http");
      console.log(`- Format: ${isBase64 ? "Base64" : isUrl ? "URL" : "Unknown"}`);
      if (isUrl) {
        console.log(`- Video URL: ${asyncResult.videoUrl}`);
      } else {
        console.log(`- Base64 data (${asyncResult.videoUrl.substring(0, 50)}...)`);
      }
    }

    return {
      syncMode: {
        success: syncResult.success,
        isBase64: syncResult.videoUrl?.startsWith("data:") || false,
        isUrl: syncResult.videoUrl?.startsWith("http") || false,
      },
      asyncMode: {
        success: asyncResult.success,
        isBase64: asyncResult.videoUrl?.startsWith("data:") || false,
        isUrl: asyncResult.videoUrl?.startsWith("http") || false,
      },
    };
  },
});