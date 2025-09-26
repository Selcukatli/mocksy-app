"use node";

import { action } from "../../../_generated/server";
import { v } from "convex/values";
import { api } from "../../../_generated/api";

/**
 * Comprehensive Video Model Comparison Test Suite
 *
 * This test suite measures:
 * - Generation time (how long it takes to generate)
 * - Output duration (length of video produced)
 * - Actual cost (based on real duration)
 * - Video quality metrics (resolution)
 *
 * Usage:
 * npx convex run utils/fal/test/testVideoComparison:compareAll
 * npx convex run utils/fal/test/testVideoComparison:detailedComparison
 */

interface VideoTestResult {
  model: string;
  success: boolean;
  generationTimeMs: number;
  videoDuration?: number;
  videoUrl?: string;
  resolution?: string;
  actualCost?: number;
  error?: string;
}

/**
 * Test a single video model and measure performance
 */
async function testModel(
  ctx: any,
  modelName: string,
  actionPath: any,
  params: any,
  costCalculation: (duration: number) => number
): Promise<VideoTestResult> {
  const startTime = Date.now();

  try {
    const result = await ctx.runAction(actionPath, params);
    const generationTimeMs = Date.now() - startTime;

    if (result.success) {
      const duration = result.duration || 0;
      return {
        model: modelName,
        success: true,
        generationTimeMs,
        videoDuration: duration,
        videoUrl: result.videoUrl,
        resolution: result.width && result.height ? `${result.width}x${result.height}` : "unknown",
        actualCost: costCalculation(duration),
      };
    } else {
      return {
        model: modelName,
        success: false,
        generationTimeMs,
        error: result.error,
      };
    }
  } catch (error) {
    return {
      model: modelName,
      success: false,
      generationTimeMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Compare all video models with the same image
 */
export const compareAll = action({
  args: {
    imageUrl: v.optional(v.string()),
    testKling: v.optional(v.boolean()), // Kling is slow, make it optional
  },
  handler: async (ctx, args): Promise<any> => {
    const imageUrl = args.imageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop";
    const prompt = "Add gentle motion and camera movement to the scene";

    console.log("🎬 VIDEO MODEL COMPARISON TEST");
    console.log("=" .repeat(60));
    console.log(`Test Image: ${imageUrl}`);
    console.log(`Prompt: "${prompt}"`);
    console.log("=" .repeat(60));

    const results: VideoTestResult[] = [];

    // Test Lucy-14b (with URL output)
    console.log("\n1. Testing Lucy-14b...");
    const lucyResult = await testModel(
      ctx,
      "Lucy-14b",
      api.utils.fal.falVideoActions.lucyImageToVideo,
      {
        prompt,
        image_url: imageUrl,
        sync_mode: false, // URL output
      },
      (duration) => duration * 0.08 // $0.08 per second
    );
    results.push(lucyResult);

    // Test SeeDance Image-to-Video
    console.log("\n2. Testing SeeDance Image-to-Video...");
    const seeDanceResult = await testModel(
      ctx,
      "SeeDance",
      api.utils.fal.falVideoActions.seeDanceImageToVideo,
      {
        prompt,
        image_url: imageUrl,
        duration: 5,
        resolution: "720p",
      },
      (duration) => {
        // SeeDance pricing is more complex
        // $0.18 for 5s 720p is the base price
        if (duration <= 5) return 0.18;
        // Need to calculate based on token formula for longer videos
        return 0.18 * (duration / 5); // Approximate
      }
    );
    results.push(seeDanceResult);

    // Test Kling (optional, it's slow)
    if (args.testKling) {
      console.log("\n3. Testing Kling Image-to-Video (this will take 30-60s)...");
      const klingResult = await testModel(
        ctx,
        "Kling",
        api.utils.fal.falVideoActions.klingImageToVideo,
        {
          prompt,
          image_url: imageUrl,
          duration: 5,
        },
        (duration) => duration === 5 ? 0.35 : 0.70
      );
      results.push(klingResult);
    }

    // Generate comparison report
    console.log("\n" + "=" .repeat(60));
    console.log("📊 RESULTS SUMMARY");
    console.log("=" .repeat(60));

    for (const result of results) {
      console.log(`\n${result.model}:`);
      if (result.success) {
        console.log(`  ✅ Success`);
        console.log(`  ⏱️  Generation Time: ${(result.generationTimeMs / 1000).toFixed(1)}s`);
        console.log(`  🎬 Video Duration: ${result.videoDuration || "unknown"}s`);
        console.log(`  📐 Resolution: ${result.resolution}`);
        console.log(`  💰 Actual Cost: $${result.actualCost?.toFixed(3) || "unknown"}`);
        console.log(`  🔗 URL: ${result.videoUrl?.substring(0, 50)}...`);
      } else {
        console.log(`  ❌ Failed: ${result.error}`);
        console.log(`  ⏱️  Failed after: ${(result.generationTimeMs / 1000).toFixed(1)}s`);
      }
    }

    // Performance rankings
    const successful = results.filter(r => r.success);
    if (successful.length > 0) {
      console.log("\n" + "=" .repeat(60));
      console.log("🏆 RANKINGS");
      console.log("=" .repeat(60));

      // Fastest generation
      const fastest = successful.sort((a, b) => a.generationTimeMs - b.generationTimeMs)[0];
      console.log(`\n⚡ Fastest: ${fastest.model} (${(fastest.generationTimeMs / 1000).toFixed(1)}s)`);

      // Cheapest
      const withCost = successful.filter(r => r.actualCost !== undefined);
      if (withCost.length > 0) {
        const cheapest = withCost.sort((a, b) => (a.actualCost || 0) - (b.actualCost || 0))[0];
        console.log(`💵 Cheapest: ${cheapest.model} ($${cheapest.actualCost?.toFixed(3)})`);
      }

      // Cost per second analysis
      console.log("\n💰 Cost Efficiency ($/second of video):");
      for (const result of successful) {
        if (result.actualCost && result.videoDuration) {
          const costPerSecond = result.actualCost / result.videoDuration;
          console.log(`  ${result.model}: $${costPerSecond.toFixed(4)}/second`);
        }
      }
    }

    return results;
  },
});

/**
 * Detailed comparison with multiple test runs
 */
export const detailedComparison = action({
  args: {
    imageUrl: v.optional(v.string()),
    runs: v.optional(v.number()), // Number of test runs per model
  },
  handler: async (ctx, args): Promise<any> => {
    const runs = args.runs || 3;
    const imageUrl = args.imageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop";

    console.log(`🔬 DETAILED COMPARISON (${runs} runs per model)`);
    console.log("=" .repeat(60));

    const allResults: { [model: string]: VideoTestResult[] } = {
      "Lucy-14b": [],
      "SeeDance": [],
    };

    // Run multiple tests for each model
    for (let i = 0; i < runs; i++) {
      console.log(`\n📍 Run ${i + 1} of ${runs}`);

      // Test Lucy
      const lucyResult = await testModel(
        ctx,
        "Lucy-14b",
        api.utils.fal.falVideoActions.lucyImageToVideo,
        {
          prompt: `Test run ${i + 1}: Add motion`,
          image_url: imageUrl,
          sync_mode: false,
        },
        (duration) => duration * 0.08
      );
      allResults["Lucy-14b"].push(lucyResult);

      // Test SeeDance
      const seeDanceResult = await testModel(
        ctx,
        "SeeDance",
        api.utils.fal.falVideoActions.seeDanceImageToVideo,
        {
          prompt: `Test run ${i + 1}: Add motion`,
          image_url: imageUrl,
          duration: 5,
        },
        () => 0.18
      );
      allResults["SeeDance"].push(seeDanceResult);
    }

    // Calculate statistics
    console.log("\n" + "=" .repeat(60));
    console.log("📈 STATISTICS");
    console.log("=" .repeat(60));

    for (const [model, results] of Object.entries(allResults)) {
      const successful = results.filter(r => r.success);

      if (successful.length > 0) {
        const times = successful.map(r => r.generationTimeMs);
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);

        const durations = successful.map(r => r.videoDuration || 0);
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

        const costs = successful.map(r => r.actualCost || 0);
        const avgCost = costs.reduce((a, b) => a + b, 0) / costs.length;

        console.log(`\n${model}:`);
        console.log(`  Success Rate: ${successful.length}/${results.length}`);
        console.log(`  Generation Time:`);
        console.log(`    - Average: ${(avgTime / 1000).toFixed(1)}s`);
        console.log(`    - Min: ${(minTime / 1000).toFixed(1)}s`);
        console.log(`    - Max: ${(maxTime / 1000).toFixed(1)}s`);
        console.log(`  Video Duration: ${avgDuration.toFixed(1)}s average`);
        console.log(`  Cost: $${avgCost.toFixed(3)} average`);
      } else {
        console.log(`\n${model}: All ${results.length} runs failed`);
      }
    }

    return allResults;
  },
});

/**
 * Test SeeDance text-to-video pricing at different durations
 */
export const testSeeDancePricing = action({
  args: {},
  handler: async (ctx): Promise<any> => {
    console.log("💰 Testing SeeDance Text-to-Video Pricing");
    console.log("=" .repeat(60));

    const durations = ["3", "5", "8", "10", "12"];
    const results = [];

    for (const duration of durations) {
      console.log(`\nTesting ${duration}s video...`);

      const startTime = Date.now();
      const result: any = await ctx.runAction(
        api.utils.fal.falVideoActions.seeDanceTextToVideo,
        {
          prompt: "A beautiful sunset over the ocean",
          duration,
          resolution: "720p",
        }
      );

      const generationTime = Date.now() - startTime;

      if (result.success) {
        results.push({
          requestedDuration: duration,
          actualDuration: result.duration,
          generationTimeMs: generationTime,
          success: true,
        });

        console.log(`  ✅ Success`);
        console.log(`  Requested: ${duration}s, Got: ${result.duration || "unknown"}s`);
        console.log(`  Generation time: ${(generationTime / 1000).toFixed(1)}s`);
      } else {
        results.push({
          requestedDuration: duration,
          generationTimeMs: generationTime,
          success: false,
          error: result.error,
        });
        console.log(`  ❌ Failed: ${result.error}`);
      }
    }

    console.log("\n" + "=" .repeat(60));
    console.log("📊 SEEDANCE PRICING ANALYSIS");
    console.log("Based on actual test results:");
    console.log("Note: Actual pricing depends on resolution and duration");

    return results;
  },
});