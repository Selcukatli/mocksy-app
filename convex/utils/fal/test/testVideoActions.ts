"use node";

import { action } from "../../../_generated/server";
import { v } from "convex/values";
import { klingTextToVideo, klingImageToVideo } from "../falVideoActions";
import { api } from "../../../_generated/api";

/**
 * Test Kling Video generation actions
 *
 * This file contains test actions for video generation functionality.
 * Run these tests to verify video generation is working correctly.
 *
 * Usage:
 * npx convex run utils/fal/test/testVideoActions:testKlingTextToVideo
 * npx convex run utils/fal/test/testVideoActions:testKlingImageToVideo
 * npx convex run utils/fal/test/testVideoActions:testAllVideoModels
 */

/**
 * Test Kling text-to-video generation
 *
 * Tests basic text-to-video functionality with different durations
 */
export const testKlingTextToVideo = action({
  args: {},
  handler: async (ctx): Promise<any[]> => {
    console.log("🎬 Testing Kling Text-to-Video...");

    const testCases = [
      {
        name: "5-second cinematic video",
        params: {
          prompt: "A majestic eagle soaring through mountain peaks at golden hour, cinematic aerial shot with dynamic camera movement",
          duration: 5 as const,
          aspect_ratio: "16:9" as const,
        },
      },
      {
        name: "10-second portrait video",
        params: {
          prompt: "A professional chef preparing a gourmet dish in a modern kitchen, close-up shots of hands working with ingredients, smooth transitions",
          duration: 10 as const,
          aspect_ratio: "9:16" as const,
        },
      },
      {
        name: "Square format animation",
        params: {
          prompt: "Abstract colorful particles flowing and morphing into geometric shapes, smooth animation with vibrant colors",
          duration: 5 as const,
          aspect_ratio: "1:1" as const,
        },
      },
    ];

    const results = [];

    for (const testCase of testCases) {
      console.log(`\n📹 Testing: ${testCase.name}`);
      console.log(`Prompt: "${testCase.params.prompt}"`);
      console.log(`Duration: ${testCase.params.duration}s, Aspect: ${testCase.params.aspect_ratio}`);

      try {
        const result: any = await ctx.runAction(
          api.utils.fal.falVideoActions.klingTextToVideo,
          testCase.params
        );

        if (result.success && result.videoUrl) {
          console.log(`✅ Success! Video URL: ${result.videoUrl}`);
          console.log(`   Resolution: ${result.width}x${result.height}, Duration: ${result.duration}s`);
          results.push({
            test: testCase.name,
            success: true,
            videoUrl: result.videoUrl,
            details: {
              width: result.width,
              height: result.height,
              duration: result.duration,
            },
          });
        } else {
          console.error(`❌ Failed: ${result.error}`);
          if (result.errorType === "content_policy_violation") {
            console.log(`   Rejected prompt: "${result.rejectedPrompt}"`);
            console.log(`   Suggestion: ${result.suggestion}`);
          }
          results.push({
            test: testCase.name,
            success: false,
            error: result.error,
            errorType: result.errorType,
          });
        }
      } catch (error) {
        console.error(`❌ Test failed with error:`, error);
        results.push({
          test: testCase.name,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Summary
    console.log("\n📊 Test Summary:");
    const successCount = results.filter(r => r.success).length;
    console.log(`Total: ${results.length}, Success: ${successCount}, Failed: ${results.length - successCount}`);
    console.log(`Success rate: ${(successCount / results.length * 100).toFixed(1)}%`);

    return results;
  },
});

/**
 * Test Kling image-to-video generation
 *
 * Tests converting static images to videos with motion
 */
export const testKlingImageToVideo = action({
  args: {
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any[]> => {
    console.log("🎬 Testing Kling Image-to-Video...");

    // Use a sample image URL if not provided
    const defaultImageUrl = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop";
    const imageUrl = args.imageUrl || defaultImageUrl;

    const testCases = [
      {
        name: "Landscape coming alive",
        params: {
          prompt: "The landscape comes alive with wind blowing through trees, clouds moving across the sky, subtle camera pan",
          image_url: imageUrl,
          duration: 5 as const,
        },
      },
      {
        name: "Dynamic motion effect",
        params: {
          prompt: "Add dynamic motion with particles and light effects, camera slowly zooming in",
          image_url: imageUrl,
          duration: 10 as const,
          cfg_scale: 0.7,
        },
      },
    ];

    const results = [];

    for (const testCase of testCases) {
      console.log(`\n📹 Testing: ${testCase.name}`);
      console.log(`Source image: ${testCase.params.image_url}`);
      console.log(`Prompt: "${testCase.params.prompt}"`);
      console.log(`Duration: ${testCase.params.duration}s`);

      try {
        const result: any = await ctx.runAction(
          api.utils.fal.falVideoActions.klingImageToVideo,
          testCase.params
        );

        if (result.success && result.videoUrl) {
          console.log(`✅ Success! Video URL: ${result.videoUrl}`);
          console.log(`   Resolution: ${result.width}x${result.height}, Duration: ${result.duration}s`);
          results.push({
            test: testCase.name,
            success: true,
            videoUrl: result.videoUrl,
            details: {
              width: result.width,
              height: result.height,
              duration: result.duration,
            },
          });
        } else {
          console.error(`❌ Failed: ${result.error}`);
          results.push({
            test: testCase.name,
            success: false,
            error: result.error,
            errorType: result.errorType,
          });
        }
      } catch (error) {
        console.error(`❌ Test failed with error:`, error);
        results.push({
          test: testCase.name,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Summary
    console.log("\n📊 Test Summary:");
    const successCount = results.filter(r => r.success).length;
    console.log(`Total: ${results.length}, Success: ${successCount}, Failed: ${results.length - successCount}`);
    console.log(`Success rate: ${(successCount / results.length * 100).toFixed(1)}%`);

    return results;
  },
});

/**
 * Test all video models comprehensively
 *
 * Runs both text-to-video and image-to-video tests
 */
export const testAllVideoModels = action({
  args: {},
  handler: async (ctx): Promise<{ textToVideo: any[]; imageToVideo: any[] }> => {
    console.log("🎬 Running comprehensive video model tests...\n");

    const allResults = {
      textToVideo: [] as any[],
      imageToVideo: [] as any[],
    };

    // Test text-to-video
    console.log("=== Testing Text-to-Video ===");
    try {
      const textToVideoResults = await ctx.runAction(
        api.utils.fal.test.testVideoActions.testKlingTextToVideo,
        {}
      );
      allResults.textToVideo = textToVideoResults;
    } catch (error) {
      console.error("Text-to-video tests failed:", error);
      allResults.textToVideo = [{
        test: "Text-to-Video Suite",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }];
    }

    // Test image-to-video
    console.log("\n=== Testing Image-to-Video ===");
    try {
      const imageToVideoResults = await ctx.runAction(
        api.utils.fal.test.testVideoActions.testKlingImageToVideo,
        {}
      );
      allResults.imageToVideo = imageToVideoResults;
    } catch (error) {
      console.error("Image-to-video tests failed:", error);
      allResults.imageToVideo = [{
        test: "Image-to-Video Suite",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }];
    }

    // Overall summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 OVERALL VIDEO TEST SUMMARY");
    console.log("=".repeat(50));

    const totalTests = allResults.textToVideo.length + allResults.imageToVideo.length;
    const totalSuccess =
      allResults.textToVideo.filter(r => r.success).length +
      allResults.imageToVideo.filter(r => r.success).length;

    console.log(`\nText-to-Video: ${allResults.textToVideo.filter(r => r.success).length}/${allResults.textToVideo.length} passed`);
    console.log(`Image-to-Video: ${allResults.imageToVideo.filter(r => r.success).length}/${allResults.imageToVideo.length} passed`);
    console.log(`\nTotal: ${totalTests} tests, ${totalSuccess} passed, ${totalTests - totalSuccess} failed`);
    console.log(`Overall success rate: ${(totalSuccess / totalTests * 100).toFixed(1)}%`);

    // Calculate estimated costs
    const estimatedCost = allResults.textToVideo.reduce((sum, r) => {
      if (r.success && r.details) {
        return sum + (r.details.duration === 5 ? 0.35 : 0.70);
      }
      return sum;
    }, 0) + allResults.imageToVideo.reduce((sum, r) => {
      if (r.success && r.details) {
        return sum + (r.details.duration === 5 ? 0.35 : 0.70);
      }
      return sum;
    }, 0);

    console.log(`\n💸 Estimated cost for successful generations: $${estimatedCost.toFixed(2)}`);

    return allResults;
  },
});

/**
 * Quick test with minimal cost
 *
 * Tests basic functionality with a single 5-second video
 */
export const testQuick = action({
  args: {},
  handler: async (ctx): Promise<any> => {
    console.log("🎬 Running quick video test (5-second video only)...\n");

    const result = await ctx.runAction(
      api.utils.fal.falVideoActions.klingTextToVideo,
      {
        prompt: "A simple test: colorful abstract shapes morphing smoothly",
        duration: 5,
        aspect_ratio: "16:9",
      }
    );

    if (result.success) {
      console.log(`✅ Quick test passed!`);
      console.log(`Video URL: ${result.videoUrl}`);
      console.log(`Cost: $0.35`);
    } else {
      console.log(`❌ Quick test failed: ${result.error}`);
    }

    return result;
  },
});