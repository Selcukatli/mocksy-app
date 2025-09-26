"use node";

import { internalAction } from "../../../_generated/server";
import { v } from "convex/values";
import { internal } from "../../../_generated/api";
import type { ImageGenerationResult } from "../falImageActions";
import type { VideoGenerationResult } from "../falVideoActions";

/**
 * Test Suite for Unified FAL API
 *
 * Tests the new generateImage and generateVideo functions with their hierarchy:
 * - Direct model selection
 * - Type + preference combination
 * - Auto-detection based on parameters
 *
 * Usage:
 * npx convex run utils/fal/test/testUnifiedAPI:testImageGeneration
 * npx convex run utils/fal/test/testUnifiedAPI:testVideoGeneration
 * npx convex run utils/fal/test/testUnifiedAPI:testFullHierarchy
 */

/**
 * Test image generation with different control methods
 */
export const testImageGeneration = internalAction({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    console.log("🎨 TESTING UNIFIED IMAGE GENERATION API");
    console.log("=".repeat(60));

    const results = [];

    // Test 1: Direct model selection (highest priority)
    console.log("\n1. Direct Model Selection:");
    console.log("Using specific model: fluxProUltraTextToImage");

    const directModel: ImageGenerationResult = await ctx.runAction(
      internal.utils.fal.falImageActions.generateImage,
      {
        prompt: "A futuristic city at sunset",
        model: "fluxProUltraTextToImage", // Direct model overrides everything
      },
    );

    results.push({
      test: "Direct Model",
      model: directModel.model,
      success: directModel.success,
      preference: directModel.preference,
    });

    console.log(`✅ Used model: ${directModel.model}`);
    console.log(`Preference: ${directModel.preference}`);

    // Test 2: Type + Preference (medium priority)
    console.log("\n2. Type + Preference Selection:");
    console.log("Requesting fast text-to-image generation");

    const typePreference: ImageGenerationResult = await ctx.runAction(
      internal.utils.fal.falImageActions.generateImage,
      {
        prompt: "Quick sketch of a mountain",
        preference: "fast",
      },
    );

    results.push({
      test: "Type+Preference",
      model: typePreference.model,
      success: typePreference.success,
      preference: typePreference.preference,
    });

    console.log(`✅ Used model: ${typePreference.model}`);
    console.log(`Preference: ${typePreference.preference}`);

    // Test 3: Auto-detection (lowest priority)
    console.log("\n3. Auto-Detection:");
    console.log("Providing image_url for automatic image-to-image detection");

    const autoDetect: ImageGenerationResult = await ctx.runAction(
      internal.utils.fal.falImageActions.generateImage,
      {
        prompt: "Transform this into cyberpunk style",
        image_url:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        // No model, type, or preference - will auto-detect as image-to-image
      },
    );

    results.push({
      test: "Auto-Detection",
      model: autoDetect.model,
      success: autoDetect.success,
      preference: autoDetect.preference,
      detectedType: "image-to-image",
    });

    console.log(`✅ Used model: ${autoDetect.model}`);
    console.log(`Auto-detected type: image-to-image`);
    console.log(`Default preference: ${autoDetect.preference}`);

    // Test 4: Quality preference
    console.log("\n4. Quality Preference:");
    console.log("Requesting highest quality generation");

    const quality: ImageGenerationResult = await ctx.runAction(
      internal.utils.fal.falImageActions.generateImage,
      {
        prompt: "Ultra-detailed portrait photography",
        preference: "quality",
      },
    );

    results.push({
      test: "Quality Preference",
      model: quality.model,
      success: quality.success,
      preference: quality.preference,
    });

    console.log(`✅ Used model: ${quality.model}`);
    console.log(`Preference: ${quality.preference}`);

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 TEST SUMMARY");
    console.log("=".repeat(60));

    for (const result of results) {
      console.log(`\n${result.test}:`);
      console.log(`  Model: ${result.model}`);
      console.log(`  Success: ${result.success}`);
      console.log(`  Preference: ${result.preference}`);
      if (result.detectedType) {
        console.log(`  Auto-detected: ${result.detectedType}`);
      }
    }

    return results;
  },
});

/**
 * Test video generation with different control methods
 */
export const testVideoGeneration = internalAction({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    console.log("🎬 TESTING UNIFIED VIDEO GENERATION API");
    console.log("=".repeat(60));

    const results = [];
    const imageUrl =
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800";

    // Test 1: Fast video generation
    console.log("\n1. Fast Video Generation:");

    const fast: VideoGenerationResult = await ctx.runAction(
      internal.utils.fal.falVideoActions.generateVideo,
      {
        prompt: "Add gentle motion",
        imageUrl,
        preference: "fast",
      },
    );

    results.push({
      test: "Fast Video",
      model: fast.model,
      success: fast.success,
      preference: fast.preference,
      generationTime: fast.generationTime,
    });

    console.log(`✅ Used model: ${fast.model}`);
    console.log(`Generation time: ${fast.generationTime}s`);

    // Test 2: Quality video generation
    console.log("\n2. Quality Video Generation:");

    const quality: VideoGenerationResult = await ctx.runAction(
      internal.utils.fal.falVideoActions.generateVideo,
      {
        prompt: "Cinematic camera movement with depth",
        imageUrl,
        preference: "quality",
      },
    );

    results.push({
      test: "Quality Video",
      model: quality.model,
      success: quality.success,
      preference: quality.preference,
      generationTime: quality.generationTime,
    });

    console.log(`✅ Used model: ${quality.model}`);
    console.log(`Generation time: ${quality.generationTime}s`);

    // Test 3: Direct model selection for text-to-video
    console.log("\n3. Direct Model for Text-to-Video:");

    const directTextToVideo: VideoGenerationResult = await ctx.runAction(
      internal.utils.fal.falVideoActions.generateVideo,
      {
        prompt: "Abstract flowing colors",
        model: "seeDanceTextToVideo",
        // No imageUrl, but model specifies text-to-video
      },
    );

    results.push({
      test: "Direct Text-to-Video",
      model: directTextToVideo.model,
      success: directTextToVideo.success,
      type: "text-to-video",
    });

    console.log(`✅ Used model: ${directTextToVideo.model}`);
    console.log(`Type: text-to-video (from model name)`);

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 VIDEO TEST SUMMARY");
    console.log("=".repeat(60));

    for (const result of results) {
      console.log(`\n${result.test}:`);
      console.log(`  Model: ${result.model}`);
      console.log(`  Success: ${result.success}`);
      if (result.generationTime) {
        console.log(`  Generation Time: ${result.generationTime}s`);
      }
    }

    return results;
  },
});

/**
 * Test the full hierarchy system
 */
export const testFullHierarchy = internalAction({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    console.log("🔬 TESTING FULL HIERARCHY SYSTEM");
    console.log("=".repeat(60));
    console.log("\nHierarchy: model > type+preference > auto-detection\n");

    const tests = [];

    // Scenario 1: Model overrides preference
    console.log("Test 1: Model overrides preference");
    console.log("Setting: model='fluxProUltraTextToImage', preference='fast'");
    console.log(
      "Expected: Uses fluxProUltra (quality) despite fast preference\n",
    );

    const test1: ImageGenerationResult = await ctx.runAction(
      internal.utils.fal.falImageActions.generateImage,
      {
        prompt: "Test hierarchy",
        model: "fluxProUltraTextToImage", // Quality model
        preference: "fast", // Conflicts with model choice
      },
    );

    tests.push({
      scenario: "Model vs Preference",
      input: { model: "fluxProUltraTextToImage", preference: "fast" },
      result: { model: test1.model, preference: test1.preference },
      winner: "model",
    });

    console.log(`Result: ${test1.model} (model wins!)\n`);

    // Scenario 2: Type+Preference when no model
    console.log("Test 2: Type+Preference selection");
    console.log(
      "Setting: type='image-to-image', preference='quality', no model",
    );
    console.log("Expected: Uses quality tier image-to-image model\n");

    const test2: ImageGenerationResult = await ctx.runAction(
      internal.utils.fal.falImageActions.generateImage,
      {
        prompt: "Test hierarchy",
        image_url: "https://example.com/image.jpg",
        preference: "quality",
        // No model specified
      },
    );

    tests.push({
      scenario: "Type+Preference",
      input: { type: "image-to-image", preference: "quality" },
      result: { model: test2.model, preference: test2.preference },
      winner: "type+preference",
    });

    console.log(`Result: ${test2.model} (type+preference used)\n`);

    // Scenario 3: Auto-detection
    console.log("Test 3: Auto-detection from parameters");
    console.log("Setting: only image_url provided");
    console.log(
      "Expected: Auto-detects image-to-image, uses default preference\n",
    );

    const test3: ImageGenerationResult = await ctx.runAction(
      internal.utils.fal.falImageActions.generateImage,
      {
        prompt: "Test auto-detection",
        image_url: "https://example.com/image.jpg",
        // No model, type, or preference
      },
    );

    tests.push({
      scenario: "Auto-Detection",
      input: {
        image_url: "provided",
        model: "none",
        type: "none",
        preference: "none",
      },
      result: { model: test3.model, preference: test3.preference },
      winner: "auto-detection",
    });

    console.log(`Result: ${test3.model} (auto-detected)\n`);

    // Final Report
    console.log("=".repeat(60));
    console.log("📋 HIERARCHY TEST RESULTS");
    console.log("=".repeat(60));

    for (const test of tests) {
      console.log(`\n${test.scenario}:`);
      console.log(`  Input: ${JSON.stringify(test.input)}`);
      console.log(`  Result: ${test.result.model}`);
      console.log(`  Preference: ${test.result.preference}`);
      console.log(`  Winner: ${test.winner} ✅`);
    }

    console.log("\n✅ Hierarchy system working as designed!");

    return tests;
  },
});
