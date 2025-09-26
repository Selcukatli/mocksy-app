import { v } from "convex/values";
import { internalAction } from "../../../_generated/server";
import { api, internal } from "../../../_generated/api";

/**
 * Test FLUX SRPO text-to-image generation
 */
export const testFluxSrpoTextToImage = internalAction({
  args: {},
  returns: v.any(),
  handler: async (
    ctx,
  ): Promise<{
    summary: string;
    results: Array<{
      test: string;
      success: boolean;
      duration?: number;
      url?: string;
      acceleration?: string;
      steps?: number;
      error?: string;
    }>;
  }> => {
    console.log("🎨 Testing FLUX SRPO Text-to-Image");
    console.log("============================================================");

    const tests = [
      {
        name: "Basic Generation",
        prompt: "A serene lake surrounded by mountains at sunset",
        params: {
          num_images: 1,
          acceleration: "regular" as const,
          num_inference_steps: 28,
          guidance_scale: 4.5,
        },
      },
      {
        name: "High Quality Mode",
        prompt: "A detailed steampunk cityscape with flying airships",
        params: {
          num_images: 1,
          acceleration: "none" as const, // Best quality
          num_inference_steps: 50,
          guidance_scale: 5.5,
        },
      },
      {
        name: "Fast Mode",
        prompt: "A simple cartoon cat",
        params: {
          num_images: 1,
          acceleration: "high" as const, // Fastest generation
          num_inference_steps: 15,
          guidance_scale: 3.5,
        },
      },
    ];

    const results: Array<{
      test: string;
      success: boolean;
      duration?: number;
      url?: string;
      acceleration?: string;
      steps?: number;
      error?: string;
    }> = [];

    for (const test of tests) {
      console.log(`\n🧪 Test: ${test.name}`);
      console.log(`📝 Prompt: ${test.prompt}`);
      console.log(`⚙️ Acceleration: ${test.params.acceleration}`);
      console.log(`🔄 Steps: ${test.params.num_inference_steps}`);

      try {
        const startTime = Date.now();

        const result = await ctx.runAction(
          api.utils.fal.falImageActions.fluxSrpoTextToImage,
          {
            prompt: test.prompt,
            ...test.params,
          },
        );

        const duration = (Date.now() - startTime) / 1000;

        if (result.success) {
          console.log(`✅ Success in ${duration.toFixed(1)}s`);
          console.log(`🖼️ Image URL: ${result.data.images[0].url}`);
          console.log(`🌱 Seed: ${result.data.seed}`);
          console.log(
            `⏱️ Inference time: ${result.data.timings?.inference?.toFixed(2)}s`,
          );

          results.push({
            test: test.name,
            success: true,
            duration,
            url: result.data.images[0].url,
            acceleration: test.params.acceleration,
            steps: test.params.num_inference_steps,
          });
        } else {
          console.log(`❌ Failed: ${result.error.message}`);
          results.push({
            test: test.name,
            success: false,
            error: result.error.message,
            acceleration: test.params.acceleration,
          });
        }
      } catch (error) {
        console.error(`❌ Exception: ${error}`);
        results.push({
          test: test.name,
          success: false,
          error: String(error),
          acceleration: test.params.acceleration,
        });
      }
    }

    // Summary
    console.log(
      "\n============================================================",
    );
    console.log("📊 SUMMARY");
    console.log("============================================================");
    const successful = results.filter((r) => r.success).length;
    console.log(`✅ Successful: ${successful}/${results.length}`);

    // Compare acceleration modes
    const timings = results.filter((r) => r.success && r.duration);
    if (timings.length > 0) {
      console.log("\n⏱️ Performance by Acceleration Mode:");
      timings.forEach((r) => {
        console.log(
          `  ${r.acceleration}: ${r.duration?.toFixed(1)}s (${r.steps} steps)`,
        );
      });
    }

    return {
      summary: `FLUX SRPO text-to-image tests: ${successful}/${results.length} passed`,
      results,
    };
  },
});

/**
 * Test FLUX SRPO image-to-image transformation
 */
export const testFluxSrpoImageToImage = internalAction({
  args: {
    imageUrl: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (
    ctx,
    args,
  ): Promise<{
    summary: string;
    results: Array<{
      test: string;
      success: boolean;
      duration?: number;
      url?: string;
      strength?: number;
      acceleration?: string;
      error?: string;
    }>;
  }> => {
    console.log("🎨 Testing FLUX SRPO Image-to-Image");
    console.log("============================================================");

    // Use provided image or a test image
    const testImageUrl =
      args.imageUrl ||
      "https://fal.media/files/koala/Chls9L2ZnvuipUTEwlnJC.png";

    console.log(`🖼️ Using source image: ${testImageUrl}`);

    const tests = [
      {
        name: "High Strength Transform",
        prompt: "Transform into a winter scene with snow and ice",
        params: {
          strength: 0.95, // High transformation
          num_inference_steps: 40,
          guidance_scale: 4.5,
          acceleration: "none" as const,
        },
      },
      {
        name: "Medium Strength Edit",
        prompt: "Add colorful flowers and butterflies",
        params: {
          strength: 0.7,
          num_inference_steps: 30,
          guidance_scale: 4.0,
          acceleration: "regular" as const,
        },
      },
      {
        name: "Low Strength Enhancement",
        prompt: "Enhance colors and add dramatic lighting",
        params: {
          strength: 0.4,
          num_inference_steps: 25,
          guidance_scale: 3.5,
          acceleration: "high" as const,
        },
      },
    ];

    const results: Array<{
      test: string;
      success: boolean;
      duration?: number;
      url?: string;
      strength?: number;
      acceleration?: string;
      error?: string;
    }> = [];

    for (const test of tests) {
      console.log(`\n🧪 Test: ${test.name}`);
      console.log(`📝 Prompt: ${test.prompt}`);
      console.log(`💪 Strength: ${test.params.strength}`);
      console.log(`⚙️ Acceleration: ${test.params.acceleration}`);

      try {
        const startTime = Date.now();

        const result = await ctx.runAction(
          api.utils.fal.falImageActions.fluxSrpoImageToImage,
          {
            prompt: test.prompt,
            image_url: testImageUrl,
            ...test.params,
          },
        );

        const duration = (Date.now() - startTime) / 1000;

        if (result.success) {
          console.log(`✅ Success in ${duration.toFixed(1)}s`);
          console.log(`🖼️ Result URL: ${result.data.images[0].url}`);
          console.log(
            `⏱️ Inference time: ${result.data.timings?.inference?.toFixed(2)}s`,
          );

          results.push({
            test: test.name,
            success: true,
            duration,
            url: result.data.images[0].url,
            strength: test.params.strength,
            acceleration: test.params.acceleration,
          });
        } else {
          console.log(`❌ Failed: ${result.error.message}`);
          results.push({
            test: test.name,
            success: false,
            error: result.error.message,
            strength: test.params.strength,
          });
        }
      } catch (error) {
        console.error(`❌ Exception: ${error}`);
        results.push({
          test: test.name,
          success: false,
          error: String(error),
          strength: test.params.strength,
        });
      }
    }

    // Summary
    console.log(
      "\n============================================================",
    );
    console.log("📊 SUMMARY");
    console.log("============================================================");
    const successful = results.filter((r) => r.success).length;
    console.log(`✅ Successful: ${successful}/${results.length}`);

    // Analyze strength impact
    const successfulResults = results.filter((r) => r.success);
    if (successfulResults.length > 0) {
      console.log("\n💪 Results by Strength:");
      successfulResults.forEach((r) => {
        console.log(`  Strength ${r.strength}: ${r.duration?.toFixed(1)}s`);
      });
    }

    return {
      summary: `FLUX SRPO image-to-image tests: ${successful}/${results.length} passed`,
      results,
    };
  },
});

/**
 * Test FLUX SRPO through unified API
 */
export const testFluxSrpoUnified = internalAction({
  args: {},
  returns: v.any(),
  handler: async (
    ctx,
  ): Promise<{
    summary: string;
    results: Array<{
      test: string;
      success: boolean;
      usedSrpo?: boolean;
      error?: unknown;
    }>;
  }> => {
    console.log("🎨 Testing FLUX SRPO through Unified API");
    console.log("============================================================");

    const results: Array<{
      test: string;
      success: boolean;
      usedSrpo?: boolean;
      error?: unknown;
    }> = [];

    // Test 1: Direct model selection for text-to-image
    console.log("\n1️⃣ Direct Model Selection (Text-to-Image)");
    try {
      const result = await ctx.runAction(
        api.utils.fal.falImageActions.generateImage,
        {
          prompt: "A futuristic city with neon lights",
          model: "fal-ai/flux/srpo",
        },
      );

      if (result.success) {
        console.log(`✅ Success! Model: ${result.model}`);
        console.log(`🖼️ Image: ${result.images?.[0]?.url}`);
        results.push({ test: "Direct text-to-image", success: true });
      } else {
        console.log(`❌ Failed: ${result.error}`);
        results.push({ test: "Direct text-to-image", success: false });
      }
    } catch (error) {
      console.error(`❌ Error: ${error}`);
      results.push({ test: "Direct text-to-image", success: false, error });
    }

    // Test 2: Direct model selection for image-to-image
    console.log("\n2️⃣ Direct Model Selection (Image-to-Image)");
    try {
      const result = await ctx.runAction(
        api.utils.fal.falImageActions.generateImage,
        {
          prompt: "Make it look like a painting",
          image_url: "https://fal.media/files/koala/Chls9L2ZnvuipUTEwlnJC.png",
          model: "fal-ai/flux/srpo/image-to-image",
        },
      );

      if (result.success) {
        console.log(`✅ Success! Model: ${result.model}`);
        console.log(`🖼️ Image: ${result.images?.[0]?.url}`);
        results.push({ test: "Direct image-to-image", success: true });
      } else {
        console.log(`❌ Failed: ${result.error}`);
        results.push({ test: "Direct image-to-image", success: false });
      }
    } catch (error) {
      console.error(`❌ Error: ${error}`);
      results.push({ test: "Direct image-to-image", success: false, error });
    }

    // Test 3: Quality preference (should use FLUX SRPO as fallback)
    console.log("\n3️⃣ Quality Preference (Should Use SRPO as Fallback)");
    try {
      const result = await ctx.runAction(
        api.utils.fal.falImageActions.generateImage,
        {
          prompt: "An award-winning photograph of nature",
          preference: "quality",
        },
      );

      console.log(`📌 Model used: ${result.model}`);
      console.log(`📌 Preference: ${result.preference}`);

      if (result.model?.includes("srpo")) {
        console.log(`✅ FLUX SRPO was selected in quality tier!`);
      }

      results.push({
        test: "Quality preference",
        success: result.success,
        usedSrpo: result.model?.includes("srpo"),
      });
    } catch (error) {
      console.error(`❌ Error: ${error}`);
      results.push({ test: "Quality preference", success: false, error });
    }

    // Summary
    console.log(
      "\n============================================================",
    );
    console.log("📊 UNIFIED API TEST SUMMARY");
    console.log("============================================================");
    const successful = results.filter((r) => r.success).length;
    console.log(`✅ Successful: ${successful}/${results.length}`);

    return {
      summary: `FLUX SRPO unified API tests: ${successful}/${results.length} passed`,
      results,
    };
  },
});

/**
 * Run all FLUX SRPO tests
 */
export const testFluxSrpoAll = internalAction({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    console.log("🚀 Running ALL FLUX SRPO Tests");
    console.log(
      "============================================================\n",
    );

    const results = {
      textToImage: null as unknown,
      imageToImage: null as unknown,
      unified: null as unknown,
    };

    // Test text-to-image
    console.log("📌 Part 1/3: Text-to-Image Tests");
    results.textToImage = await ctx.runAction(
      internal.utils.fal.test.testFluxSrpo.testFluxSrpoTextToImage,
      {},
    );

    console.log("\n");

    // Test image-to-image
    console.log("📌 Part 2/3: Image-to-Image Tests");
    results.imageToImage = await ctx.runAction(
      internal.utils.fal.test.testFluxSrpo.testFluxSrpoImageToImage,
      {},
    );

    console.log("\n");

    // Test unified API
    console.log("📌 Part 3/3: Unified API Tests");
    results.unified = await ctx.runAction(
      internal.utils.fal.test.testFluxSrpo.testFluxSrpoUnified,
      {},
    );

    console.log(
      "\n============================================================",
    );
    console.log("🎉 ALL TESTS COMPLETE");
    console.log("============================================================");

    return results;
  },
});
