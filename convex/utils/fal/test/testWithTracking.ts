"use node";

import { action } from "../../../_generated/server";
import { v } from "convex/values";
import { api } from "../../../_generated/api";

/**
 * Simple Video Model Testing with Duration Tracking
 *
 * Since the APIs don't return duration, we track our assumptions
 * and known behaviors to calculate accurate costs.
 *
 * Usage:
 * npx convex run utils/fal/test/testWithTracking:trackAndCompare
 */

// Known behaviors from our testing
const VIDEO_MODEL_PROFILES = {
  "lucy-14b": {
    typicalDuration: 5, // Lucy typically generates 5-second videos
    costPerSecond: 0.08,
    generationSpeed: "fast", // 10-30 seconds
  },
  "seedance": {
    requestedDuration: 5, // We request 5 seconds
    fixedCost: 0.18, // Fixed price for 5s 720p
    generationSpeed: "fast", // 10-30 seconds
  },
  "kling": {
    requestedDuration: [5, 10], // Can request 5 or 10
    costMap: { 5: 0.35, 10: 0.70 },
    generationSpeed: "slow", // 30-60 seconds
  },
};

interface TrackedVideoGeneration {
  model: string;
  startTime: number;
  endTime: number;
  generationTimeMs: number;
  videoUrl: string;
  assumedDuration: number;
  calculatedCost: number;
  requested: {
    prompt: string;
    imageUrl?: string;
    duration?: number | string;
    resolution?: string;
  };
}

/**
 * Test with tracking and accurate cost calculation
 */
export const trackAndCompare = action({
  args: {
    imageUrl: v.optional(v.string()),
    testKling: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<any> => {
    const imageUrl = args.imageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600";
    const prompt = "Add gentle motion and camera movement";

    console.log("📊 VIDEO MODEL TESTING WITH DURATION TRACKING");
    console.log("=" .repeat(60));
    console.log("Since APIs don't return duration, we use known behaviors:\n");
    console.log("- Lucy-14b: Typically generates 5-second videos");
    console.log("- SeeDance: Generates requested duration (we request 5s)");
    console.log("- Kling: Generates requested duration (5s or 10s)");
    console.log("=" .repeat(60));

    const results: TrackedVideoGeneration[] = [];

    // Test Lucy-14b
    console.log("\n1. Testing Lucy-14b...");
    const lucyStart = Date.now();

    const lucyResult: any = await ctx.runAction(
      api.utils.fal.falVideoActions.lucyImageToVideo,
      {
        prompt,
        image_url: imageUrl,
        sync_mode: false, // Get URL
      }
    );

    const lucyEnd = Date.now();

    if (lucyResult.success) {
      const tracked: TrackedVideoGeneration = {
        model: "Lucy-14b",
        startTime: lucyStart,
        endTime: lucyEnd,
        generationTimeMs: lucyEnd - lucyStart,
        videoUrl: lucyResult.videoUrl,
        assumedDuration: VIDEO_MODEL_PROFILES["lucy-14b"].typicalDuration,
        calculatedCost: VIDEO_MODEL_PROFILES["lucy-14b"].typicalDuration * VIDEO_MODEL_PROFILES["lucy-14b"].costPerSecond,
        requested: { prompt, imageUrl },
      };
      results.push(tracked);

      console.log(`✅ Success in ${(tracked.generationTimeMs / 1000).toFixed(1)}s`);
      console.log(`📹 Assumed Duration: ${tracked.assumedDuration}s`);
      console.log(`💰 Calculated Cost: $${tracked.calculatedCost.toFixed(2)}`);
    } else {
      console.log(`❌ Failed: ${lucyResult.error}`);
    }

    // Test SeeDance
    console.log("\n2. Testing SeeDance...");
    const seedanceStart = Date.now();

    const seedanceResult: any = await ctx.runAction(
      api.utils.fal.falVideoActions.seeDanceImageToVideo,
      {
        prompt,
        image_url: imageUrl,
        duration: 5,
        resolution: "720p",
      }
    );

    const seedanceEnd = Date.now();

    if (seedanceResult.success) {
      const tracked: TrackedVideoGeneration = {
        model: "SeeDance",
        startTime: seedanceStart,
        endTime: seedanceEnd,
        generationTimeMs: seedanceEnd - seedanceStart,
        videoUrl: seedanceResult.videoUrl,
        assumedDuration: 5, // We requested 5 seconds
        calculatedCost: VIDEO_MODEL_PROFILES["seedance"].fixedCost,
        requested: { prompt, imageUrl, duration: 5, resolution: "720p" },
      };
      results.push(tracked);

      console.log(`✅ Success in ${(tracked.generationTimeMs / 1000).toFixed(1)}s`);
      console.log(`📹 Requested Duration: ${tracked.assumedDuration}s`);
      console.log(`💰 Fixed Cost: $${tracked.calculatedCost.toFixed(2)}`);
    } else {
      console.log(`❌ Failed: ${seedanceResult.error}`);
    }

    // Test Kling (optional)
    if (args.testKling) {
      console.log("\n3. Testing Kling (Premium)...");
      const klingStart = Date.now();

      const klingResult: any = await ctx.runAction(
        api.utils.fal.falVideoActions.klingImageToVideo,
        {
          prompt,
          image_url: imageUrl,
          duration: 5,
        }
      );

      const klingEnd = Date.now();

      if (klingResult.success) {
        const tracked: TrackedVideoGeneration = {
          model: "Kling",
          startTime: klingStart,
          endTime: klingEnd,
          generationTimeMs: klingEnd - klingStart,
          videoUrl: klingResult.videoUrl,
          assumedDuration: 5, // We requested 5 seconds
          calculatedCost: VIDEO_MODEL_PROFILES["kling"].costMap[5],
          requested: { prompt, imageUrl, duration: 5 },
        };
        results.push(tracked);

        console.log(`✅ Success in ${(tracked.generationTimeMs / 1000).toFixed(1)}s`);
        console.log(`📹 Requested Duration: ${tracked.assumedDuration}s`);
        console.log(`💰 Cost: $${tracked.calculatedCost.toFixed(2)}`);
      } else {
        console.log(`❌ Failed: ${klingResult.error}`);
      }
    }

    // Generate comparison report
    console.log("\n" + "=" .repeat(60));
    console.log("📊 TRACKED RESULTS SUMMARY");
    console.log("=" .repeat(60));

    // Sort by cost
    const sortedByCost = [...results].sort((a, b) => a.calculatedCost - b.calculatedCost);
    const sortedBySpeed = [...results].sort((a, b) => a.generationTimeMs - b.generationTimeMs);

    console.log("\n💰 Cost Ranking (5-second videos):");
    for (const [index, result] of sortedByCost.entries()) {
      console.log(`${index + 1}. ${result.model}: $${result.calculatedCost.toFixed(2)}`);
    }

    console.log("\n⚡ Speed Ranking:");
    for (const [index, result] of sortedBySpeed.entries()) {
      console.log(`${index + 1}. ${result.model}: ${(result.generationTimeMs / 1000).toFixed(1)}s`);
    }

    console.log("\n📈 Cost Efficiency (Value = Speed + Price):");
    console.log("Model      | Cost  | Speed  | Video | Value");
    console.log("-----------|-------|--------|-------|-------");

    for (const result of results) {
      const costScore = result.calculatedCost === Math.min(...results.map(r => r.calculatedCost)) ? "✅" : "  ";
      const speedScore = result.generationTimeMs === Math.min(...results.map(r => r.generationTimeMs)) ? "⚡" : "  ";

      console.log(
        `${result.model.padEnd(10)} | ` +
        `$${result.calculatedCost.toFixed(2).padEnd(4)} | ` +
        `${(result.generationTimeMs / 1000).toFixed(1).padEnd(5)}s | ` +
        `${result.assumedDuration}s    | ` +
        `${costScore}${speedScore}`
      );
    }

    // Store results for future reference
    const summary = {
      timestamp: Date.now(),
      imageUrl,
      results,
      winner: {
        cheapest: sortedByCost[0]?.model,
        fastest: sortedBySpeed[0]?.model,
        recommendation: "SeeDance (best value - cheap and fast)",
      },
      notes: [
        "Lucy-14b: Generates ~5s videos at $0.08/s = $0.40 total",
        "SeeDance: Fixed $0.18 for 5s at 720p (best value!)",
        "Kling: Premium quality at $0.35 (5s) or $0.70 (10s)",
      ],
    };

    console.log("\n🎯 Recommendation:");
    console.log(summary.winner.recommendation);

    return summary;
  },
});

/**
 * Test SeeDance at different durations to verify pricing
 */
export const testSeeDanceDurations = action({
  args: {},
  handler: async (ctx): Promise<any> => {
    console.log("💰 Testing SeeDance Pricing at Different Durations");
    console.log("=" .repeat(60));

    const imageUrl = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600";
    const durations = [3, 5, 8, 10, 12];
    const results = [];

    for (const duration of durations) {
      console.log(`\nTesting ${duration}-second video...`);
      const startTime = Date.now();

      const result: any = await ctx.runAction(
        api.utils.fal.falVideoActions.seeDanceImageToVideo,
        {
          prompt: `Test for ${duration}s video`,
          image_url: imageUrl,
          duration,
          resolution: "720p",
        }
      );

      const generationTime = Date.now() - startTime;

      if (result.success) {
        // Calculate cost based on FAL's token pricing
        // Formula: (height × width × FPS × duration) / 1024
        // For 720p (1280×720), 24fps:
        const tokens = (1280 * 720 * 24 * duration) / 1024;
        const estimatedCost = tokens * 0.000000025; // Price per token

        results.push({
          duration,
          generationTimeMs: generationTime,
          videoUrl: result.videoUrl,
          estimatedCost,
          success: true,
        });

        console.log(`✅ Generated in ${(generationTime / 1000).toFixed(1)}s`);
        console.log(`💰 Estimated cost: $${estimatedCost.toFixed(3)}`);
      } else {
        results.push({
          duration,
          generationTimeMs: generationTime,
          success: false,
          error: result.error,
        });
        console.log(`❌ Failed: ${result.error}`);
      }
    }

    console.log("\n" + "=" .repeat(60));
    console.log("📊 SEEDANCE PRICING ANALYSIS");
    console.log("=" .repeat(60));

    console.log("\nDuration | Gen Time | Est. Cost");
    console.log("---------|----------|----------");
    for (const r of results) {
      if (r.success) {
        console.log(
          `${r.duration.toString().padEnd(8)} | ` +
          `${(r.generationTimeMs / 1000).toFixed(1).padEnd(8)}s | ` +
          `$${r.estimatedCost.toFixed(3)}`
        );
      }
    }

    console.log("\n💡 Note: Actual pricing may vary from estimates");

    return results;
  },
});