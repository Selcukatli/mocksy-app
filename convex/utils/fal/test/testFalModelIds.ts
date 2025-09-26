"use node";

import { internalAction } from "../../../_generated/server";
import { internal } from "../../../_generated/api";
import { FAL_IMAGE_MODELS } from "../clients/image/imageModels";
import type { ImageGenerationResult } from "../falImageActions";

/**
 * Test using FAL's exact model identifiers
 *
 * Usage:
 * npx convex run utils/fal/test/testFalModelIds:testWithFalIds
 * npx convex run utils/fal/test/testFalModelIds:testAllModelConstants
 * npx convex run utils/fal/test/testFalModelIds:validateModelIds
 */

interface TestResult {
  test: string;
  modelId: string;
  success: boolean;
  error?: string;
}

export const testWithFalIds = internalAction({
  args: {},
  handler: async (ctx): Promise<TestResult[]> => {
    console.log("🎨 Testing with FAL's Exact Model IDs");
    console.log("=".repeat(60));

    const prompt = "A serene forest path with sunlight filtering through trees";

    // Test 1: Use FAL's exact model ID
    console.log("\n1. Using FAL model ID: fal-ai/flux-1/dev");
    const result1 = await ctx.runAction(
      internal.utils.fal.falImageActions.generateImage,
      {
        prompt,
        model: "fal-ai/flux-1/dev", // FAL's exact model ID
      },
    );

    console.log(`Result: ${result1.success ? "✅ Success" : "❌ Failed"}`);
    console.log(`Model used: ${result1.model}`);
    if (result1.success && result1.images?.[0]) {
      console.log(`Image URL: ${result1.images[0].url}`);
    }

    // Test 2: Use another FAL model ID
    console.log("\n2. Using FAL model ID: fal-ai/nano-banana/text-to-image");
    const result2 = await ctx.runAction(
      internal.utils.fal.falImageActions.generateImage,
      {
        prompt,
        model: "fal-ai/nano-banana/text-to-image",
      },
    );

    console.log(`Result: ${result2.success ? "✅ Success" : "❌ Failed"}`);
    console.log(`Model used: ${result2.model}`);
    if (result2.success && result2.images?.[0]) {
      console.log(`Image URL: ${result2.images[0].url}`);
    }

    // Test 3: Test that preference-based selection also uses FAL IDs
    console.log("\n3. Using preference (should return FAL model ID):");
    const result3 = await ctx.runAction(
      internal.utils.fal.falImageActions.generateImage,
      {
        prompt,
        preference: "fast",
      },
    );

    console.log(`Result: ${result3.success ? "✅ Success" : "❌ Failed"}`);
    console.log(`Model used: ${result3.model}`);
    console.log(
      `Is FAL ID format: ${result3.model?.startsWith("fal-ai/") ? "Yes ✅" : "No ❌"}`,
    );

    // Already imported at the top

    console.log("\n" + "=".repeat(60));
    console.log("📝 Available FAL Model IDs:");
    console.log("=".repeat(60));

    console.log("\nText-to-Image Models:");
    console.log(`  FLUX_PRO_ULTRA: ${FAL_IMAGE_MODELS.FLUX_PRO_ULTRA}`);
    console.log(`  FLUX_DEV: ${FAL_IMAGE_MODELS.FLUX_DEV}`);
    console.log(`  FLUX_SCHNELL: ${FAL_IMAGE_MODELS.FLUX_SCHNELL}`);
    console.log(`  GPT_4O: ${FAL_IMAGE_MODELS.GPT_4O_TEXT_TO_IMAGE}`);
    console.log(`  GEMINI_FLASH: ${FAL_IMAGE_MODELS.GEMINI_FLASH}`);

    console.log("\nImage-to-Image Models:");
    console.log(`  KONTEXT_MAX: ${FAL_IMAGE_MODELS.KONTEXT_MAX}`);
    console.log(`  GPT_4O_EDIT: ${FAL_IMAGE_MODELS.GPT_4O_EDIT}`);

    return [
      {
        test: "FAL model ID: fal-ai/flux-1/dev",
        modelId: "fal-ai/flux-1/dev",
        success: result1.success,
        error: result1.error,
      },
      {
        test: "FAL model ID: fal-ai/nano-banana/text-to-image",
        modelId: "fal-ai/nano-banana/text-to-image",
        success: result2.success,
        error: result2.error,
      },
      {
        test: "FAL model ID: fal-ai/flux-pro/kontext/text-to-image",
        modelId: "fal-ai/flux-pro/kontext/text-to-image",
        success: result3.success,
        error: result3.error,
      },
    ];
  },
});

/**
 * Test all model constants to ensure they're correctly formatted
 */
interface ModelTestResult {
  validIds: string[];
  invalidIds: string[];
  details: Array<{
    id: string;
    valid: boolean;
    error?: string;
  }>;
}

export const testAllModelConstants = internalAction({
  args: {},
  handler: async (): Promise<ModelTestResult> => {
    console.log("🔍 Testing All FAL Model Constants");
    console.log("=".repeat(60));

    const results = {
      validIds: [] as string[],
      invalidIds: [] as string[],
    };

    // Check all image model IDs
    console.log("\n📸 IMAGE MODELS:");
    for (const [key, value] of Object.entries(FAL_IMAGE_MODELS)) {
      console.log(`  ${key}: ${value}`);

      // Validate format (should start with fal-ai/)
      if (value.startsWith("fal-ai/")) {
        results.validIds.push(value);
      } else {
        console.warn(`  ⚠️ Invalid format: ${value}`);
        results.invalidIds.push(value);
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 VALIDATION SUMMARY:");
    console.log(`✅ Valid FAL IDs: ${results.validIds.length}`);
    console.log(`❌ Invalid IDs: ${results.invalidIds.length}`);

    if (results.invalidIds.length > 0) {
      console.log("\n⚠️ Invalid IDs found:");
      results.invalidIds.forEach((id) => console.log(`  - ${id}`));
    }

    const details = Object.entries(FAL_IMAGE_MODELS).map(([, id]) => ({
      id,
      valid: results.validIds.includes(id),
      error: results.invalidIds.includes(id) ? "Invalid format" : undefined,
    }));

    return {
      validIds: results.validIds,
      invalidIds: results.invalidIds,
      details,
    };
  },
});

/**
 * Validate that model IDs work with the FAL API
 */
interface ValidationResult {
  name: string;
  id: string;
  status: "success" | "failed";
  error?: string;
  response?: ImageGenerationResult;
}

export const validateModelIds = internalAction({
  args: {},
  handler: async (ctx): Promise<ValidationResult[]> => {
    console.log("✅ Validating Model IDs with FAL API");
    console.log("=".repeat(60));

    const testPrompt = "Simple test image";
    const results: ValidationResult[] = [];

    // Test a few key models to validate they work
    const modelsToValidate = [
      { name: "FLUX Dev", id: FAL_IMAGE_MODELS.FLUX_DEV },
      { name: "FLUX Schnell", id: FAL_IMAGE_MODELS.FLUX_SCHNELL },
      { name: "Gemini Flash", id: FAL_IMAGE_MODELS.GEMINI_FLASH },
    ];

    for (const model of modelsToValidate) {
      console.log(`\n🧪 Validating ${model.name}: ${model.id}`);

      try {
        const result = await ctx.runAction(
          internal.utils.fal.falImageActions.generateImage,
          {
            prompt: testPrompt,
            model: model.id,
          },
        );

        if (result.success) {
          console.log(`✅ ${model.name} validated successfully`);
          results.push({
            name: model.name,
            id: model.id,
            status: "success",
            response: result,
          });
        } else {
          console.log(`❌ ${model.name} failed: ${result.error}`);
          results.push({
            name: model.name,
            id: model.id,
            status: "failed",
            error: result.error,
          });
        }
      } catch (error) {
        console.error(`❌ ${model.name} exception: ${error}`);
        results.push({
          name: model.name,
          id: model.id,
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 VALIDATION RESULTS:");
    console.log("=".repeat(60));

    const validCount = results.filter((r) => r.status === "success").length;
    console.log(`\n✅ Valid models: ${validCount}/${results.length}`);

    for (const result of results) {
      console.log(`\n${result.name}:`);
      console.log(`  ID: ${result.id}`);
      console.log(
        `  Status: ${result.status === "success" ? "✅ Valid" : "❌ Invalid"}`,
      );
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      }
    }

    return results;
  },
});
