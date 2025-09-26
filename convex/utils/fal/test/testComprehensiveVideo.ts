"use node";

import { internalAction } from "../../../_generated/server";
import { v } from "convex/values";
import { internal } from "../../../_generated/api";
import type { VideoGenerationResult } from "../falVideoActions";

/**
 * Comprehensive Test Suite for FAL Video Models
 *
 * Tests all video models including Kling, SeeDance, and Lucy
 * Covers text-to-video, image-to-video, preference tiers, and fallbacks
 *
 * Usage:
 * npx convex run utils/fal/test/testComprehensiveVideo:runQuickTests
 * npx convex run utils/fal/test/testComprehensiveVideo:runFullTests
 * npx convex run utils/fal/test/testComprehensiveVideo:testAllTextToVideo
 * npx convex run utils/fal/test/testComprehensiveVideo:testAllImageToVideo
 * npx convex run utils/fal/test/testComprehensiveVideo:testPreferenceTiers
 * npx convex run utils/fal/test/testComprehensiveVideo:testVideoParameters
 */

type VideoTestResult = {
  name: string;
  model: string;
  success: boolean;
  error?: string;
  duration?: number;
  generationTime?: number;
  cost?: number;
  videoUrl?: string;
  preference?: string;
  resolution?: string;
  videoDuration?: number;
  fallbackUsed?: boolean;
};

/**
 * Test all text-to-video models
 */
export const testAllTextToVideo = internalAction({
  args: {},
  handler: async (ctx): Promise<VideoTestResult[]> => {
    console.log("🎬 Testing ALL Text-to-Video Models");
    console.log("=".repeat(60));
    console.log("⚠️ Note: Text-to-video is expensive and slower\n");

    const results: VideoTestResult[] = [];

    const modelsToTest = [
      {
        name: "Kling Text-to-Video (5s)",
        model: "klingTextToVideo",
        params: {
          prompt: "A serene beach with waves gently rolling in",
          duration: 5 as const,
          aspect_ratio: "16:9" as const,
        },
        estimatedCost: 0.35,
      },
      {
        name: "SeeDance Text-to-Video (5s 720p)",
        model: "seeDanceTextToVideo",
        params: {
          prompt: "Abstract colorful particles flowing smoothly",
          duration: "5",
          resolution: "720p" as const,
          aspect_ratio: "16:9" as const,
        },
        estimatedCost: 0.18,
      },
    ];

    for (const test of modelsToTest) {
      console.log(`\n📹 Testing ${test.name}`);
      console.log(`💰 Estimated cost: $${test.estimatedCost.toFixed(2)}`);
      console.log(`🎬 Prompt: "${test.params.prompt}"`);

      const startTime = Date.now();

      try {
        const result = await ctx.runAction(
          internal.utils.fal.falVideoActions.generateVideo,
          {
            prompt: test.params.prompt,
            model: test.model,
            duration: test.params.duration as number | undefined,
            resolution: test.params.resolution,
            aspectRatio: test.params.aspect_ratio,
          },
        );

        const duration = (Date.now() - startTime) / 1000;

        if (result.success) {
          console.log(`✅ Success in ${duration.toFixed(1)}s`);
          console.log(`📎 Video: ${result.videoUrl?.substring(0, 50)}...`);
          console.log(`📐 Resolution: ${result.width}x${result.height}`);

          results.push({
            name: test.name,
            model: test.model,
            success: true,
            duration,
            generationTime: result.generationTime,
            cost: result.cost || test.estimatedCost,
            videoUrl: result.videoUrl,
            resolution: `${result.width}x${result.height}`,
            videoDuration: result.duration,
          });
        } else {
          console.log(`❌ Failed: ${result.error}`);
          results.push({
            name: test.name,
            model: test.model,
            success: false,
            error: result.error,
            duration,
          });
        }
      } catch (error) {
        const duration = (Date.now() - startTime) / 1000;
        console.error(`❌ Exception: ${error}`);
        results.push({
          name: test.name,
          model: test.model,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          duration,
        });
      }
    }

    const successful = results.filter((r) => r.success).length;
    const totalCost = results
      .filter((r) => r.success)
      .reduce((sum, r) => sum + (r.cost || 0), 0);

    console.log("\n" + "=".repeat(60));
    console.log("📊 TEXT-TO-VIDEO TEST SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Successful: ${successful}/${results.length}`);
    console.log(`💰 Total cost: $${totalCost.toFixed(2)}`);

    return results;
  },
});

/**
 * Test all image-to-video models
 */
export const testAllImageToVideo = internalAction({
  args: {
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<VideoTestResult[]> => {
    console.log("🎬 Testing ALL Image-to-Video Models");
    console.log("=".repeat(60));

    const imageUrl =
      args.imageUrl ||
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop";
    console.log(`🖼️ Source image: ${imageUrl}\n`);

    const results: VideoTestResult[] = [];

    const modelsToTest = [
      {
        name: "Kling Image-to-Video (5s)",
        model: "klingImageToVideo",
        params: {
          prompt: "Add gentle motion with wind effects",
          duration: 5 as const,
        },
        estimatedCost: 0.35,
      },
      {
        name: "SeeDance Image-to-Video (5s 720p)",
        model: "seeDanceImageToVideo",
        params: {
          prompt: "Bring the scene to life with natural movement",
          duration: 5,
          resolution: "720p" as const,
          aspect_ratio: "16:9" as const,
        },
        estimatedCost: 0.18,
      },
      {
        name: "Lucy-14b Image-to-Video (Fast)",
        model: "lucyImageToVideo",
        params: {
          prompt: "Dynamic motion with energy",
          aspect_ratio: "16:9" as const,
          sync_mode: false,
        },
        estimatedCost: 0.4, // ~5s at $0.08/s
      },
    ];

    for (const test of modelsToTest) {
      console.log(`\n📹 Testing ${test.name}`);
      console.log(`💰 Estimated cost: $${test.estimatedCost.toFixed(2)}`);

      const startTime = Date.now();

      try {
        const result = await ctx.runAction(
          internal.utils.fal.falVideoActions.generateVideo,
          {
            prompt: test.params.prompt,
            imageUrl,
            model: test.model,
            duration: test.params.duration as number | undefined,
            resolution: test.params.resolution,
            aspectRatio: test.params.aspect_ratio,
          },
        );

        const duration = (Date.now() - startTime) / 1000;

        if (result.success) {
          console.log(`✅ Success in ${duration.toFixed(1)}s`);
          console.log(
            `⏱️ Generation time: ${result.generationTime?.toFixed(1)}s`,
          );
          console.log(`📎 Video: ${result.videoUrl?.substring(0, 50)}...`);

          results.push({
            name: test.name,
            model: result.model || test.model,
            success: true,
            duration,
            generationTime: result.generationTime,
            cost: result.cost || test.estimatedCost,
            videoUrl: result.videoUrl,
            resolution: `${result.width}x${result.height}`,
            videoDuration: result.duration,
          });
        } else {
          console.log(`❌ Failed: ${result.error}`);
          results.push({
            name: test.name,
            model: test.model,
            success: false,
            error: result.error,
            duration,
          });
        }
      } catch (error) {
        const duration = (Date.now() - startTime) / 1000;
        console.error(`❌ Exception: ${error}`);
        results.push({
          name: test.name,
          model: test.model,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          duration,
        });
      }
    }

    const successful = results.filter((r) => r.success).length;
    const totalCost = results
      .filter((r) => r.success)
      .reduce((sum, r) => sum + (r.cost || 0), 0);

    console.log("\n" + "=".repeat(60));
    console.log("📊 IMAGE-TO-VIDEO TEST SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Successful: ${successful}/${results.length}`);
    console.log(`💰 Total cost: $${totalCost.toFixed(2)}`);
    console.log(
      `⏱️ Average generation: ${(results.reduce((sum, r) => sum + (r.generationTime || 0), 0) / results.length).toFixed(1)}s`,
    );

    return results;
  },
});

/**
 * Test video preference tiers
 */
export const testPreferenceTiers = internalAction({
  args: {
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<VideoTestResult[]> => {
    console.log("🎯 Testing Video Preference Tiers");
    console.log("=".repeat(60));

    const imageUrl =
      args.imageUrl ||
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop";
    const results: VideoTestResult[] = [];
    const testPrompt = "Add natural motion to the scene";

    const preferences = ["quality", "default", "fast"] as const;

    for (const preference of preferences) {
      console.log(`\n🎬 Testing ${preference.toUpperCase()} tier`);

      const startTime = Date.now();

      try {
        const result = await ctx.runAction(
          internal.utils.fal.falVideoActions.generateVideo,
          {
            prompt: testPrompt,
            imageUrl, // This makes it image-to-video
            preference,
            // No model specified - let preference system choose
          },
        );

        const duration = (Date.now() - startTime) / 1000;

        if (result.success) {
          console.log(`✅ Success with model: ${result.model}`);
          console.log(`⏱️ Total time: ${duration.toFixed(1)}s`);
          console.log(
            `⚡ Generation time: ${result.generationTime?.toFixed(1)}s`,
          );
          console.log(`💰 Cost: $${result.cost?.toFixed(2)}`);

          results.push({
            name: `${preference} tier`,
            model: result.model || "unknown",
            success: true,
            duration,
            generationTime: result.generationTime,
            cost: result.cost,
            preference,
            videoUrl: result.videoUrl,
          });
        } else {
          console.log(`❌ Failed: ${result.error}`);
          results.push({
            name: `${preference} tier`,
            model: "failed",
            success: false,
            error: result.error,
            duration,
            preference,
          });
        }
      } catch (error) {
        const duration = (Date.now() - startTime) / 1000;
        console.error(`❌ Exception: ${error}`);
        results.push({
          name: `${preference} tier`,
          model: "error",
          success: false,
          error: error instanceof Error ? error.message : String(error),
          duration,
          preference,
        });
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 VIDEO PREFERENCE TIER SUMMARY");
    console.log("=".repeat(60));

    for (const result of results) {
      console.log(`\n${result.name}:`);
      console.log(`  Model: ${result.model}`);
      console.log(`  Success: ${result.success ? "✅" : "❌"}`);
      console.log(`  Generation: ${result.generationTime?.toFixed(1)}s`);
      console.log(`  Cost: $${result.cost?.toFixed(2) || "N/A"}`);
    }

    return results;
  },
});

/**
 * Test different video parameters (resolutions, durations, aspect ratios)
 */
export const testVideoParameters = internalAction({
  args: {
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<VideoTestResult[]> => {
    console.log("⚙️ Testing Video Parameters");
    console.log("=".repeat(60));

    const imageUrl =
      args.imageUrl ||
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop";
    const results: VideoTestResult[] = [];

    // Test SeeDance with different parameters (most flexible)
    const parameterTests = [
      {
        name: "SeeDance 480p (Low Cost)",
        params: {
          prompt: "Add motion",
          duration: 3,
          resolution: "480p" as const,
          aspect_ratio: "16:9" as const,
        },
        estimatedCost: 0.11,
      },
      {
        name: "SeeDance 720p Square",
        params: {
          prompt: "Add motion",
          duration: 5,
          resolution: "720p" as const,
          aspect_ratio: "1:1" as const,
        },
        estimatedCost: 0.18,
      },
      // Note: SeeDance only supports 480p and 720p, not 1080p
      {
        name: "SeeDance Portrait Mode",
        params: {
          prompt: "Add motion",
          duration: 5,
          resolution: "720p" as const,
          aspect_ratio: "9:16" as const,
        },
        estimatedCost: 0.18,
      },
    ];

    for (const test of parameterTests) {
      console.log(`\n🎬 ${test.name}`);
      console.log(`📐 ${test.params.resolution} @ ${test.params.aspect_ratio}`);
      console.log(`⏱️ Duration: ${test.params.duration}s`);
      console.log(`💰 Est. cost: $${test.estimatedCost.toFixed(2)}`);

      const startTime = Date.now();

      try {
        const result = await ctx.runAction(
          internal.utils.fal.falVideoActions.seeDanceImageToVideo,
          {
            ...test.params,
            image_url: imageUrl,
          },
        );

        const duration = (Date.now() - startTime) / 1000;

        if (result.success) {
          console.log(`✅ Success in ${duration.toFixed(1)}s`);
          results.push({
            name: test.name,
            model: "seeDanceImageToVideo",
            success: true,
            duration,
            cost: test.estimatedCost,
            resolution: test.params.resolution,
            videoDuration: test.params.duration,
          });
        } else {
          console.log(`❌ Failed: ${result.error}`);
          results.push({
            name: test.name,
            model: "seeDanceImageToVideo",
            success: false,
            error: result.error,
            duration,
          });
        }
      } catch (error) {
        const duration = (Date.now() - startTime) / 1000;
        console.error(`❌ Exception: ${error}`);
        results.push({
          name: test.name,
          model: "seeDanceImageToVideo",
          success: false,
          error: error instanceof Error ? error.message : String(error),
          duration,
        });
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 VIDEO PARAMETERS SUMMARY");
    console.log("=".repeat(60));

    const successful = results.filter((r) => r.success).length;
    console.log(`✅ Successful: ${successful}/${results.length}`);

    for (const result of results) {
      if (result.success) {
        console.log(`\n${result.name}: ✅`);
        console.log(`  Resolution: ${result.resolution}`);
        console.log(`  Duration: ${result.videoDuration}s`);
        console.log(`  Cost: $${result.cost?.toFixed(2)}`);
      }
    }

    return results;
  },
});

/**
 * Run quick video tests (minimal cost)
 */
export const runQuickTests = internalAction({
  args: {
    imageUrl: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ results: VideoTestResult[]; totalCost: number }> => {
    console.log("⚡ Running QUICK Video Tests (Low Cost)");
    console.log("=".repeat(60));

    const imageUrl =
      args.imageUrl ||
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800";
    const results: VideoTestResult[] = [];

    // Test only the fastest/cheapest options
    const quickTests = [
      {
        name: "SeeDance Fast (3s 480p)",
        action: internal.utils.fal.falVideoActions.seeDanceImageToVideo,
        params: {
          prompt: "Quick motion test",
          image_url: imageUrl,
          duration: 3,
          resolution: "480p" as const,
          aspect_ratio: "16:9" as const,
        },
        cost: 0.11,
      },
      {
        name: "Fast Preference Test",
        action: internal.utils.fal.falVideoActions.generateVideo,
        params: {
          prompt: "Fast generation test",
          imageUrl,
          preference: "fast" as const,
        },
        cost: 0.11,
      },
    ];

    for (const test of quickTests) {
      console.log(`\n🎯 ${test.name}`);
      console.log(`💰 Est. cost: $${test.cost.toFixed(2)}`);
      const startTime = Date.now();

      try {
        const result = (await ctx.runAction(
          test.action,
          test.params,
        )) as VideoGenerationResult;
        const duration = (Date.now() - startTime) / 1000;

        if (result.success) {
          console.log(`✅ Success in ${duration.toFixed(1)}s`);
          results.push({
            name: test.name,
            model: result.model || "auto",
            success: true,
            duration,
            cost: test.cost,
            videoUrl: result.videoUrl,
          });
        } else {
          console.log(`❌ Failed: ${result.error}`);
          results.push({
            name: test.name,
            model: "failed",
            success: false,
            error: result.error,
            duration,
          });
        }
      } catch (error) {
        console.error(`❌ Exception: ${error}`);
        results.push({
          name: test.name,
          model: "error",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const totalCost = results
      .filter((r) => r.success)
      .reduce((sum, r) => sum + (r.cost || 0), 0);

    console.log("\n" + "=".repeat(60));
    console.log("📊 QUICK VIDEO TEST SUMMARY");
    console.log("=".repeat(60));
    console.log(
      `✅ Successful: ${results.filter((r) => r.success).length}/${results.length}`,
    );
    console.log(`💰 Total cost: $${totalCost.toFixed(2)}`);

    return { results, totalCost };
  },
});

/**
 * Run full comprehensive video tests (higher cost)
 */
export const runFullTests = internalAction({
  args: {
    imageUrl: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    imageToVideo: VideoTestResult[];
    preferences: VideoTestResult[];
    parameters: VideoTestResult[];
    totalCost: number;
  }> => {
    console.log("🔬 Running FULL Comprehensive Video Tests");
    console.log("=".repeat(60));
    console.log("⚠️ Warning: This will test multiple video models");
    console.log("💰 Estimated total cost: ~$2-3\n");

    // We skip text-to-video in full tests as it's very expensive
    // Focus on image-to-video which is more practical

    const imageToVideo = await ctx.runAction(
      internal.utils.fal.test.testComprehensiveVideo.testAllImageToVideo,
      { imageUrl: args.imageUrl },
    );

    const preferences = await ctx.runAction(
      internal.utils.fal.test.testComprehensiveVideo.testPreferenceTiers,
      { imageUrl: args.imageUrl },
    );

    const parameters = await ctx.runAction(
      internal.utils.fal.test.testComprehensiveVideo.testVideoParameters,
      { imageUrl: args.imageUrl },
    );

    // Calculate total cost
    type TestResult = { success: boolean; cost?: number };
    const totalCost =
      imageToVideo
        .filter((r: TestResult) => r.success)
        .reduce((sum: number, r: TestResult) => sum + (r.cost || 0), 0) +
      preferences
        .filter((r: TestResult) => r.success)
        .reduce((sum: number, r: TestResult) => sum + (r.cost || 0), 0) +
      parameters
        .filter((r: TestResult) => r.success)
        .reduce((sum: number, r: TestResult) => sum + (r.cost || 0), 0);

    console.log("\n" + "=".repeat(60));
    console.log("🎯 FULL VIDEO TEST COMPLETE");
    console.log("=".repeat(60));
    console.log(
      `Image-to-Video: ${imageToVideo.filter((r: TestResult) => r.success).length}/${imageToVideo.length} passed`,
    );
    console.log(
      `Preferences: ${preferences.filter((r: TestResult) => r.success).length}/${preferences.length} passed`,
    );
    console.log(
      `Parameters: ${parameters.filter((r: TestResult) => r.success).length}/${parameters.length} passed`,
    );
    console.log(`\n💰 Total cost: $${totalCost.toFixed(2)}`);

    return { imageToVideo, preferences, parameters, totalCost };
  },
});
