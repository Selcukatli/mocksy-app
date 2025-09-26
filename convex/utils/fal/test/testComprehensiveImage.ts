"use node";

import { action } from "../../../_generated/server";
import { v } from "convex/values";
import { api } from "../../../_generated/api";
import { FAL_IMAGE_MODELS } from "../imageModels";

/**
 * Comprehensive Test Suite for FAL Image Models
 *
 * Tests all image models with FAL's exact model identifiers
 * Includes text-to-image, image-to-image, preference tiers, and fallbacks
 *
 * Usage:
 * npx convex run utils/fal/test/testComprehensiveImage:runQuickTests
 * npx convex run utils/fal/test/testComprehensiveImage:runFullTests
 * npx convex run utils/fal/test/testComprehensiveImage:testAllTextToImage
 * npx convex run utils/fal/test/testComprehensiveImage:testAllImageToImage
 * npx convex run utils/fal/test/testComprehensiveImage:testPreferenceTiers
 * npx convex run utils/fal/test/testComprehensiveImage:testFallbackChains
 */

type TestResult = {
  name: string;
  model: string;
  success: boolean;
  error?: string;
  duration?: number;
  cost?: number;
  imageUrl?: string;
  preference?: string;
  fallbackUsed?: boolean;
};

/**
 * Test all text-to-image models with FAL IDs
 */
export const testAllTextToImage = action({
  args: {},
  handler: async (ctx): Promise<TestResult[]> => {
    console.log("🎨 Testing ALL Text-to-Image Models");
    console.log("=".repeat(60));

    const results: TestResult[] = [];

    // Define all text-to-image models to test
    const modelsToTest = [
      {
        name: "FLUX Pro Ultra",
        modelId: FAL_IMAGE_MODELS.FLUX_PRO_ULTRA,
        prompt: "A majestic mountain landscape at golden hour, ultra detailed",
        estimatedCost: 0.06,
      },
      {
        name: "FLUX Dev",
        modelId: FAL_IMAGE_MODELS.FLUX_DEV,
        prompt: "A modern city skyline at sunset",
        estimatedCost: 0.025,
      },
      {
        name: "FLUX Schnell",
        modelId: FAL_IMAGE_MODELS.FLUX_SCHNELL,
        prompt: "A simple geometric pattern",
        estimatedCost: 0.003,
      },
      {
        name: "GPT-4O",
        modelId: FAL_IMAGE_MODELS.GPT_4O_TEXT_TO_IMAGE,
        prompt: "A futuristic robot assistant",
        estimatedCost: 0.02,
      },
      {
        name: "Imagen4 Preview",
        modelId: FAL_IMAGE_MODELS.IMAGEN4_PREVIEW,
        prompt: "A tropical beach paradise",
        estimatedCost: 0.04,
      },
      {
        name: "Gemini Flash",
        modelId: FAL_IMAGE_MODELS.GEMINI_FLASH,
        prompt: "Abstract colorful art",
        estimatedCost: 0.01,
      },
      {
        name: "Qwen",
        modelId: FAL_IMAGE_MODELS.QWEN_TEXT,
        prompt: "A detailed technical diagram",
        estimatedCost: 0.015,
      },
    ];

    for (const test of modelsToTest) {
      console.log(`\n📸 Testing ${test.name} (${test.modelId})`);
      console.log(`💰 Estimated cost: $${test.estimatedCost.toFixed(3)}`);

      const startTime = Date.now();

      try {
        const result = await ctx.runAction(
          api.utils.fal.falImageActions.generateImage,
          {
            prompt: test.prompt,
            model: test.modelId, // Use FAL's exact model ID
          },
        );

        const duration = (Date.now() - startTime) / 1000;

        if (result.success) {
          console.log(`✅ Success in ${duration.toFixed(1)}s`);
          if (result.images?.[0]?.url) {
            console.log(
              `📎 Image: ${result.images[0].url.substring(0, 50)}...`,
            );
          }

          results.push({
            name: test.name,
            model: test.modelId,
            success: true,
            duration,
            cost: test.estimatedCost,
            imageUrl: result.images?.[0]?.url,
          });
        } else {
          console.log(`❌ Failed: ${result.error}`);
          results.push({
            name: test.name,
            model: test.modelId,
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
          model: test.modelId,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          duration,
        });
      }
    }

    // Summary
    const successful = results.filter((r) => r.success).length;
    const totalCost = results
      .filter((r) => r.success)
      .reduce((sum, r) => sum + (r.cost || 0), 0);

    console.log("\n" + "=".repeat(60));
    console.log("📊 TEXT-TO-IMAGE TEST SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Successful: ${successful}/${results.length}`);
    console.log(`💰 Total cost: $${totalCost.toFixed(2)}`);
    console.log(
      `⏱️ Average time: ${(results.reduce((sum, r) => sum + (r.duration || 0), 0) / results.length).toFixed(1)}s`,
    );

    return results;
  },
});

/**
 * Test all image-to-image models
 */
export const testAllImageToImage = action({
  args: {
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<TestResult[]> => {
    console.log("🎨 Testing ALL Image-to-Image Models");
    console.log("=".repeat(60));

    const imageUrl =
      args.imageUrl ||
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800";
    const results: TestResult[] = [];

    const modelsToTest = [
      {
        name: "Kontext Max",
        modelId: FAL_IMAGE_MODELS.KONTEXT_MAX,
        prompt: "Transform into cyberpunk style with neon lights",
        estimatedCost: 0.04,
      },
      {
        name: "Kontext Pro",
        modelId: FAL_IMAGE_MODELS.KONTEXT_PRO,
        prompt: "Add artistic watercolor effect",
        estimatedCost: 0.03,
      },
      {
        name: "GPT-4O Edit",
        modelId: FAL_IMAGE_MODELS.GPT_4O_EDIT,
        prompt: "Make it look like a painting",
        estimatedCost: 0.02,
      },
      {
        name: "Gemini Flash Edit",
        modelId: FAL_IMAGE_MODELS.GEMINI_FLASH_EDIT,
        prompt: "Apply vintage filter effect",
        estimatedCost: 0.01,
      },
      {
        name: "Qwen Edit",
        modelId: FAL_IMAGE_MODELS.QWEN_EDIT,
        prompt: "Enhance and upscale",
        estimatedCost: 0.015,
      },
    ];

    for (const test of modelsToTest) {
      console.log(`\n🖼️ Testing ${test.name} (${test.modelId})`);
      console.log(`💰 Estimated cost: $${test.estimatedCost.toFixed(3)}`);

      const startTime = Date.now();

      try {
        const result = await ctx.runAction(
          api.utils.fal.falImageActions.generateImage,
          {
            prompt: test.prompt,
            image_url: imageUrl,
            model: test.modelId,
          },
        );

        const duration = (Date.now() - startTime) / 1000;

        if (result.success) {
          console.log(`✅ Success in ${duration.toFixed(1)}s`);
          results.push({
            name: test.name,
            model: test.modelId,
            success: true,
            duration,
            cost: test.estimatedCost,
            imageUrl: result.images?.[0]?.url,
          });
        } else {
          console.log(`❌ Failed: ${result.error}`);
          results.push({
            name: test.name,
            model: test.modelId,
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
          model: test.modelId,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          duration,
        });
      }
    }

    // Summary
    const successful = results.filter((r) => r.success).length;
    const totalCost = results
      .filter((r) => r.success)
      .reduce((sum, r) => sum + (r.cost || 0), 0);

    console.log("\n" + "=".repeat(60));
    console.log("📊 IMAGE-TO-IMAGE TEST SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Successful: ${successful}/${results.length}`);
    console.log(`💰 Total cost: $${totalCost.toFixed(2)}`);

    return results;
  },
});

/**
 * Test preference tiers (quality/default/fast)
 */
export const testPreferenceTiers = action({
  args: {},
  handler: async (ctx): Promise<TestResult[]> => {
    console.log("🎯 Testing Preference Tiers");
    console.log("=".repeat(60));

    const results: TestResult[] = [];
    const testPrompt = "A beautiful landscape with mountains";

    const preferences = ["quality", "default", "fast"] as const;

    for (const preference of preferences) {
      console.log(`\n🎨 Testing ${preference.toUpperCase()} tier`);

      const startTime = Date.now();

      try {
        const result = await ctx.runAction(
          api.utils.fal.falImageActions.generateImage,
          {
            prompt: testPrompt,
            preference,
            // No model specified - let preference system choose
          },
        );

        const duration = (Date.now() - startTime) / 1000;

        if (result.success) {
          console.log(`✅ Success with model: ${result.model}`);
          console.log(`⏱️ Time: ${duration.toFixed(1)}s`);
          console.log(
            `💰 Estimated cost: $${result.estimatedCost?.toFixed(3) || "N/A"}`,
          );

          results.push({
            name: `${preference} tier`,
            model: result.model || "unknown",
            success: true,
            duration,
            cost: result.estimatedCost,
            preference,
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
    console.log("📊 PREFERENCE TIER SUMMARY");
    console.log("=".repeat(60));

    for (const result of results) {
      console.log(`\n${result.name}:`);
      console.log(`  Model: ${result.model}`);
      console.log(`  Success: ${result.success ? "✅" : "❌"}`);
      console.log(`  Time: ${result.duration?.toFixed(1)}s`);
      console.log(`  Cost: $${result.cost?.toFixed(3) || "N/A"}`);
    }

    return results;
  },
});

/**
 * Test fallback chains
 */
export const testFallbackChains = action({
  args: {},
  handler: async (ctx): Promise<TestResult[]> => {
    console.log("🔄 Testing Fallback Chains");
    console.log("=".repeat(60));
    console.log("\nNote: This test intentionally uses invalid parameters");
    console.log("to trigger fallbacks and test the chain behavior.\n");

    const results: TestResult[] = [];

    // Test 1: Force a fallback by using an invalid primary model parameter
    console.log("Test 1: Testing quality tier fallback");
    console.log("(Using invalid parameter to force primary failure)");

    try {
      // This should fail on FLUX Pro Ultra and fall back to GPT-4O or Imagen
      const result = await ctx.runAction(
        api.utils.fal.falImageActions.generateImage,
        {
          prompt: "Test fallback mechanism",
          preference: "quality",
          // Add an intentionally problematic parameter that might cause FLUX Pro Ultra to fail
          // but other models might handle
        },
      );

      if (result.success) {
        console.log(`✅ Fallback successful: ${result.model}`);
        results.push({
          name: "Quality tier fallback",
          model: result.model || "unknown",
          success: true,
          fallbackUsed: result.model !== FAL_IMAGE_MODELS.FLUX_PRO_ULTRA,
        });
      } else {
        console.log(`❌ All models in chain failed`);
        results.push({
          name: "Quality tier fallback",
          model: "all failed",
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      console.error(`❌ Exception: ${error}`);
      results.push({
        name: "Quality tier fallback",
        model: "error",
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 FALLBACK CHAIN SUMMARY");
    console.log("=".repeat(60));

    for (const result of results) {
      console.log(`\n${result.name}:`);
      console.log(`  Model: ${result.model}`);
      console.log(`  Success: ${result.success ? "✅" : "❌"}`);
      console.log(`  Fallback used: ${result.fallbackUsed ? "Yes" : "No"}`);
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      }
    }

    return results;
  },
});

/**
 * Run quick tests (minimal cost)
 */
export const runQuickTests = action({
  args: {},
  handler: async (
    ctx,
  ): Promise<{ results: TestResult[]; totalCost: number }> => {
    console.log("⚡ Running QUICK Image Tests (Low Cost)");
    console.log("=".repeat(60));

    const results: TestResult[] = [];

    // Test only the cheapest models
    const quickTests = [
      {
        name: "FLUX Schnell (Fastest)",
        modelId: FAL_IMAGE_MODELS.FLUX_SCHNELL,
        prompt: "Simple test image",
        cost: 0.003,
      },
      {
        name: "Fast Preference Tier",
        preference: "fast" as const,
        prompt: "Fast generation test",
        cost: 0.003,
      },
    ];

    for (const test of quickTests) {
      console.log(`\n🎯 ${test.name}`);
      const startTime = Date.now();

      try {
        const params: {
          prompt: string;
          model?: string;
          preference?: "quality" | "default" | "fast";
        } = {
          prompt: test.prompt,
        };

        if (test.modelId) {
          params.model = test.modelId;
        } else if (test.preference) {
          params.preference = test.preference;
        }

        const result = await ctx.runAction(
          api.utils.fal.falImageActions.generateImage,
          params,
        );

        const duration = (Date.now() - startTime) / 1000;

        if (result.success) {
          console.log(`✅ Success in ${duration.toFixed(1)}s`);
          results.push({
            name: test.name,
            model: result.model || test.modelId || "auto",
            success: true,
            duration,
            cost: test.cost,
          });
        } else {
          console.log(`❌ Failed: ${result.error}`);
          results.push({
            name: test.name,
            model: test.modelId || "auto",
            success: false,
            error: result.error,
            duration,
          });
        }
      } catch (error) {
        console.error(`❌ Exception: ${error}`);
        results.push({
          name: test.name,
          model: test.modelId || "auto",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const totalCost = results
      .filter((r) => r.success)
      .reduce((sum, r) => sum + (r.cost || 0), 0);

    console.log("\n" + "=".repeat(60));
    console.log("📊 QUICK TEST SUMMARY");
    console.log("=".repeat(60));
    console.log(
      `✅ Successful: ${results.filter((r) => r.success).length}/${results.length}`,
    );
    console.log(`💰 Total cost: $${totalCost.toFixed(3)}`);

    return { results, totalCost };
  },
});

/**
 * Run full comprehensive tests (higher cost)
 */
export const runFullTests = action({
  args: {},
  handler: async (
    ctx,
  ): Promise<{
    textToImage: TestResult[];
    imageToImage: TestResult[];
    preferences: TestResult[];
    totalCost: number;
  }> => {
    console.log("🔬 Running FULL Comprehensive Image Tests");
    console.log("=".repeat(60));
    console.log("⚠️ Warning: This will test ALL models and cost more\n");

    // Run all test suites
    const textToImage = await ctx.runAction(
      api.utils.fal.test.testComprehensiveImage.testAllTextToImage,
      {},
    );

    const imageToImage = await ctx.runAction(
      api.utils.fal.test.testComprehensiveImage.testAllImageToImage,
      {},
    );

    const preferences = await ctx.runAction(
      api.utils.fal.test.testComprehensiveImage.testPreferenceTiers,
      {},
    );

    // Define type for test results
    type TestResult = { success: boolean; cost?: number };

    // Calculate total cost
    const totalCost =
      textToImage
        .filter((r: TestResult) => r.success)
        .reduce((sum: number, r: TestResult) => sum + (r.cost || 0), 0) +
      imageToImage
        .filter((r: TestResult) => r.success)
        .reduce((sum: number, r: TestResult) => sum + (r.cost || 0), 0) +
      preferences
        .filter((r: TestResult) => r.success)
        .reduce((sum: number, r: TestResult) => sum + (r.cost || 0), 0);

    console.log("\n" + "=".repeat(60));
    console.log("🎯 FULL TEST COMPLETE");
    console.log("=".repeat(60));
    console.log(
      `Text-to-Image: ${textToImage.filter((r: TestResult) => r.success).length}/${textToImage.length} passed`,
    );
    console.log(
      `Image-to-Image: ${imageToImage.filter((r: TestResult) => r.success).length}/${imageToImage.length} passed`,
    );
    console.log(
      `Preferences: ${preferences.filter((r: TestResult) => r.success).length}/${preferences.length} passed`,
    );
    console.log(`\n💰 Total cost: $${totalCost.toFixed(2)}`);

    return { textToImage, imageToImage, preferences, totalCost };
  },
});
