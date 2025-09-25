"use node";

import { action } from "../../../_generated/server";
import type { ActionCtx } from "../../../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../../../_generated/api";

// Test result type
type TestResult = {
  name: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
  error?: string;
  details?: unknown;
};

/**
 * Test FLUX text-to-image generation
 */
const testFluxTextToImage = async (ctx: ActionCtx): Promise<TestResult> => {
  const startTime = Date.now();

  try {
    console.log("[Test] Testing FLUX text-to-image generation");
    
    // Use cheapest/fastest settings
    const result = await ctx.runAction(api.utils.fal.falImageActions.fluxTextToImage, {
      prompt: "A simple red cube on white background, minimalist",
      model: "schnell", // Fastest model
      image_size: "square", // Smallest size
      safety_tolerance: "5",
      guidance_scale: 3.5,
      num_images: 1,
      output_format: "jpeg"
    });
    
    // Validate response
    if (!result || typeof result !== 'object') {
      throw new Error("Invalid response from FLUX");
    }
    
    const typedResult = result as { images?: Array<{ url: string; content_type?: string }> };
    
    if (!typedResult.images || !Array.isArray(typedResult.images)) {
      throw new Error("No images array in response");
    }
    
    if (typedResult.images.length === 0) {
      throw new Error("Empty images array");
    }
    
    const image = typedResult.images[0];
    if (!image.url || !image.url.startsWith('http')) {
      throw new Error("Invalid image URL");
    }
    
    console.log("[Test] FLUX generated image:", image.url.substring(0, 50) + "...");
    
    return {
      name: "FLUX Text-to-Image",
      status: "passed",
      duration: Date.now() - startTime,
      details: {
        imageUrl: image.url,
        model: "schnell"
      }
    };
  } catch (error) {
    console.error("[Test] FLUX test failed:", error);
    return {
      name: "FLUX Text-to-Image",
      status: "failed",
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Test Kontext image editing
 */
const testKontextEditImage = async (ctx: ActionCtx): Promise<TestResult> => {
  const startTime = Date.now();

  try {
    console.log("[Test] Testing Kontext image editing");

    // Use a public stock image for testing
    const testImageUrl = "https://picsum.photos/512/512";

    const result = await ctx.runAction(api.utils.fal.falImageActions.kontextEditImage, {
      prompt: "Transform into a cartoon illustration style with bright colors",
      image_url: testImageUrl,
      aspect_ratio: "1:1",
      model: "pro", // Use the standard model
      guidance_scale: 3.5,
      num_images: 1,
      output_format: "jpeg"
    });

    // Kontext returns images directly, not wrapped in data
    const typedResult = result as { images?: Array<{ url: string }> };

    if (!typedResult?.images?.[0]?.url) {
      throw new Error("No image returned from Kontext");
    }

    console.log("[Test] Kontext edited image:", typedResult.images[0].url.substring(0, 50) + "...");

    return {
      name: "Kontext Image Edit",
      status: "passed",
      duration: Date.now() - startTime,
      details: {
        originalUrl: testImageUrl,
        editedUrl: typedResult.images[0].url
      }
    };
  } catch (error) {
    console.error("[Test] Kontext test failed:", error);
    return {
      name: "Kontext Image Edit",
      status: "failed",
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Test Kontext multi-image editing
 */
const testKontextMultiEdit = async (ctx: ActionCtx): Promise<TestResult> => {
  const startTime = Date.now();

  try {
    console.log("[Test] Testing Kontext multi-image editing");

    // Use multiple public images for testing
    const testImageUrls = [
      "https://picsum.photos/512/512?random=1",
      "https://picsum.photos/512/512?random=2"
    ];

    const result = await ctx.runAction(api.utils.fal.falImageActions.kontextMultiEditImage, {
      prompt: "Blend these images into a surreal artistic composition",
      image_urls: testImageUrls,
      aspect_ratio: "1:1",
      guidance_scale: 3.5,
      num_images: 1,
      output_format: "jpeg"
    });

    // Kontext returns images directly, not wrapped in data
    const typedResult = result as { images?: Array<{ url: string }> };

    if (!typedResult?.images?.[0]?.url) {
      throw new Error("No image returned from Kontext Multi");
    }

    console.log("[Test] Kontext multi-edited image:", typedResult.images[0].url.substring(0, 50) + "...");

    return {
      name: "Kontext Multi-Image Edit",
      status: "passed",
      duration: Date.now() - startTime,
      details: {
        sourceImages: testImageUrls,
        resultUrl: typedResult.images[0].url
      }
    };
  } catch (error) {
    console.error("[Test] Kontext multi test failed:", error);
    return {
      name: "Kontext Multi-Image Edit",
      status: "failed",
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Test GPT text-to-image generation
 */
const testGptTextToImage = async (ctx: ActionCtx): Promise<TestResult> => {
  const startTime = Date.now();

  try {
    console.log("[Test] Testing GPT text-to-image generation");
    
    const result = await ctx.runAction(api.utils.fal.falImageActions.gptTextToImage, {
      prompt: "A simple blue triangle on white background",
      quality: "low", // Cheapest quality
      image_size: "1024x1024",
      num_images: 1
    });
    
    const typedResult = result as { success?: boolean; data?: { images?: Array<{ url: string }> } };

    if (!typedResult?.data?.images?.[0]?.url) {
      throw new Error("No image returned from GPT");
    }

    console.log("[Test] GPT generated image:", typedResult.data.images[0].url.substring(0, 50) + "...");
    
    return {
      name: "GPT Text-to-Image",
      status: "passed",
      duration: Date.now() - startTime,
      details: {
        imageUrl: typedResult.data.images[0].url
      }
    };
  } catch (error) {
    console.error("[Test] GPT test failed:", error);
    return {
      name: "GPT Text-to-Image",
      status: "failed",
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Test Imagen text-to-image generation
 */
const testImagenTextToImage = async (ctx: ActionCtx): Promise<TestResult> => {
  const startTime = Date.now();

  try {
    console.log("[Test] Testing Imagen text-to-image generation");
    
    const result = await ctx.runAction(api.utils.fal.falImageActions.imagenTextToImage, {
      prompt: "A simple green circle on white background",
      aspect_ratio: "1:1",
      num_images: 1,
      output_format: "jpeg"
    });
    
    const typedResult = result as { success?: boolean; data?: { images?: Array<{ url: string }> } };

    if (!typedResult?.data?.images?.[0]?.url) {
      throw new Error("No image returned from Imagen");
    }

    console.log("[Test] Imagen generated image:", typedResult.data.images[0].url.substring(0, 50) + "...");
    
    return {
      name: "Imagen Text-to-Image",
      status: "passed",
      duration: Date.now() - startTime,
      details: {
        imageUrl: typedResult.data.images[0].url
      }
    };
  } catch (error) {
    console.error("[Test] Imagen test failed:", error);
    return {
      name: "Imagen Text-to-Image",
      status: "failed",
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Test error handling with invalid parameters
 */
const testErrorHandling = async (ctx: ActionCtx): Promise<TestResult> => {
  const startTime = Date.now();
  
  try {
    console.log("[Test] Testing error handling with invalid parameters");
    
    // Test with null prompt (which should actually fail)
    try {
      await ctx.runAction(api.utils.fal.falImageActions.fluxTextToImage, {
        prompt: null as unknown as string, // Invalid null prompt
        model: "schnell",
        image_size: "square",
        safety_tolerance: "5",
        guidance_scale: 3.5,
        num_images: 1,
        output_format: "jpeg"
      });

      // Should have thrown an error
      throw new Error("Expected error for null prompt, but got success");
    } catch (error) {
      if (error instanceof Error && error.message.includes("Expected error")) {
        throw error; // Re-throw our test failure
      }
      // Expected error - test passes
      console.log("[Test] Correctly handled null prompt error");
    }
    
    // Test with invalid model
    try {
      await ctx.runAction(api.utils.fal.falImageActions.fluxTextToImage, {
        prompt: "Test",
        model: "invalid_model" as "schnell", // Invalid model
        image_size: "square",
        safety_tolerance: "5",
        guidance_scale: 3.5,
        num_images: 1,
        output_format: "jpeg"
      });
      
      throw new Error("Expected error for invalid model, but got success");
    } catch (error) {
      if (error instanceof Error && error.message.includes("Expected error")) {
        throw error;
      }
      console.log("[Test] Correctly handled invalid model error");
    }
    
    return {
      name: "Error Handling",
      status: "passed",
      duration: Date.now() - startTime,
      details: {
        testedScenarios: ["empty prompt", "invalid model"]
      }
    };
  } catch (error) {
    console.error("[Test] Error handling test failed:", error);
    return {
      name: "Error Handling",
      status: "failed",
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Test image storage in Convex
 */
const testImageStorage = async (ctx: ActionCtx): Promise<TestResult> => {
  const startTime = Date.now();
  
  try {
    console.log("[Test] Testing image storage in Convex");
    
    // Use a small public test image from a reliable source
    const testImageUrl = "https://picsum.photos/50/50";
    
    // Store the image
    const storageId = await ctx.runAction(internal.fileStorage.files.storeFromUrl, {
      sourceUrl: testImageUrl
    });
    
    if (!storageId) {
      throw new Error("Failed to get storage ID");
    }
    
    // Get the Convex URL
    const convexUrl = await ctx.storage.getUrl(storageId);
    
    if (!convexUrl) {
      throw new Error("Failed to get Convex storage URL");
    }
    
    if (!convexUrl.startsWith('http')) {
      throw new Error("Invalid Convex URL format");
    }
    
    console.log("[Test] Successfully stored image in Convex");
    
    return {
      name: "Image Storage",
      status: "passed",
      duration: Date.now() - startTime,
      details: {
        storageId,
        convexUrl: convexUrl.substring(0, 50) + "...",
        originalUrl: testImageUrl
      }
    };
  } catch (error) {
    console.error("[Test] Storage test failed:", error);
    return {
      name: "Image Storage",
      status: "failed",
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Run all FAL image action tests
 */
export const runAllTests = action({
  args: {},  // No need for expensive flag - we always test the real endpoints
  returns: v.object({
    tests: v.array(v.object({
      name: v.string(),
      status: v.union(v.literal("passed"), v.literal("failed"), v.literal("skipped")),
      duration: v.number(),
      error: v.optional(v.string()),
      details: v.optional(v.any())
    })),
    summary: v.object({
      total: v.number(),
      passed: v.number(),
      failed: v.number(),
      skipped: v.number(),
      duration: v.number()
    })
  }),
  handler: async (ctx) => {
    console.log("=== Running FAL Image Action Tests ===");
    const startTime = Date.now();

    // Run all tests in parallel for faster execution
    const tests = await Promise.all([
      testImageStorage(ctx),
      testErrorHandling(ctx),
      testFluxTextToImage(ctx),
      testGptTextToImage(ctx),
      testImagenTextToImage(ctx),
      testKontextEditImage(ctx),
      testKontextMultiEdit(ctx),
    ]);
    
    // Calculate summary
    const summary = {
      total: tests.length,
      passed: tests.filter(t => t.status === "passed").length,
      failed: tests.filter(t => t.status === "failed").length,
      skipped: tests.filter(t => t.status === "skipped").length,
      duration: Date.now() - startTime
    };
    
    console.log("\n=== Image Action Test Summary ===");
    console.log(`Total: ${summary.total}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Skipped: ${summary.skipped}`);
    console.log(`Duration: ${summary.duration}ms`);
    
    if (summary.failed > 0) {
      console.log("\nFailed tests:");
      tests.filter(t => t.status === "failed").forEach(t => {
        console.log(`- ${t.name}: ${t.error}`);
      });
    }
    
    return {
      tests,
      summary
    };
  }
});
