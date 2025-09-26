"use node";

import { action } from "../../_generated/server";
import { v, Infer } from "convex/values";

// Re-export model identifiers from imageModels.ts for convenience
export { FAL_IMAGE_MODELS } from "./imageModels";

export const IMAGE_PREFERENCES = {
  QUALITY: "quality",
  DEFAULT: "default",
  FAST: "fast",
} as const;

export const IMAGE_TYPES = {
  TEXT_TO_IMAGE: "text-to-image",
  IMAGE_TO_IMAGE: "image-to-image",
} as const;

// Import model-specific clients
import { generateFluxTextToImage } from "./clients/fluxImageClient";
import {
  editImageWithKontext,
  editImageWithKontextMulti,
} from "./clients/kontextImageClient";
import {
  generateGptTextToImage,
  editImageWithGpt,
} from "./clients/gptImageClient";
import { generateImagenTextToImage } from "./clients/imagenImageClient";
import { GeminiImageClient } from "./clients/geminiImageClient";
import { QwenImageClient } from "./clients/qwenImageClient";
import { FluxProUltraClient } from "./clients/fluxProUltraClient";

// Convex validators for GPT Image enums
const gptQualityValidator = v.union(
  v.literal("auto"),
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
);

const gptImageSizeValidator = v.union(
  v.literal("auto"),
  v.literal("1024x1024"),
  v.literal("1536x1024"),
  v.literal("1024x1536"),
);

// Convex validators for FLUX-specific enums
const fluxModelValidator = v.union(
  v.literal("schnell"),
  v.literal("dev"),
  v.literal("pro"),
);

const fluxImageSizeValidator = v.union(
  v.literal("square_hd"),
  v.literal("square"),
  v.literal("portrait_4_3"),
  v.literal("portrait_16_9"),
  v.literal("landscape_4_3"),
  v.literal("landscape_16_9"),
);

const fluxSafetyToleranceValidator = v.union(
  v.literal("1"),
  v.literal("2"),
  v.literal("3"),
  v.literal("4"),
  v.literal("5"),
  v.literal("6"),
);

// Convex validators for Imagen4-specific enums
const imagenAspectRatioValidator = v.union(
  v.literal("1:1"),
  v.literal("16:9"),
  v.literal("9:16"),
  v.literal("3:4"),
  v.literal("4:3"),
);

// Convex validators for FLUX Kontext-specific enums
const kontextAspectRatioValidator = v.union(
  v.literal("21:9"),
  v.literal("16:9"),
  v.literal("4:3"),
  v.literal("3:2"),
  v.literal("1:1"),
  v.literal("2:3"),
  v.literal("3:4"),
  v.literal("9:16"),
  v.literal("9:21"),
);

const kontextSafetyToleranceValidator = v.union(
  v.literal("1"),
  v.literal("2"),
  v.literal("3"),
  v.literal("4"),
  v.literal("5"),
  v.literal("6"),
);

const kontextModelValidator = v.union(v.literal("pro"), v.literal("max"));

/**
 * Generate image using FLUX models with FLUX-specific parameters
 * Supports FLUX Schnell (fastest), Dev (balanced), and Pro (highest quality)
 */
export const fluxTextToImage = action({
  args: {
    prompt: v.string(), // Text description of what to generate
    model: v.optional(fluxModelValidator), // FLUX model: "schnell" | "dev" | "pro", default: "dev"

    // === Image Dimensions & Format ===
    image_size: v.optional(
      v.union(
        fluxImageSizeValidator, // Preset sizes: "square_hd", "square", "portrait_4_3", etc.
        v.object({ width: v.number(), height: v.number() }), // Custom dimensions in pixels
      ),
    ), // Image size preset or custom dimensions
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))), // Output format, default: "jpeg"

    // === Generation Controls ===
    num_inference_steps: v.optional(v.number()), // Denoising steps (more = higher quality, slower)
    guidance_scale: v.optional(v.number()), // How closely to follow prompt (1-20), higher = more adherent
    num_images: v.optional(v.number()), // Number of images to generate (1-4), default: 1
    seed: v.optional(v.number()), // Random seed for reproducible results

    // === Safety Controls ===
    enable_safety_checker: v.optional(v.boolean()), // Enable content filtering (Schnell/Dev), default: false
    safety_tolerance: v.optional(fluxSafetyToleranceValidator), // Safety level for Pro: "1"(strict) to "6"(permissive)
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await generateFluxTextToImage(args);
  },
});

/**
 * Generate image using GPT Image text-to-image model (BYOK - Bring Your Own Key)
 * Uses OpenAI's models through fal.ai with your OpenAI API key
 * Requires OPENAI_API_KEY environment variable
 */
export const gptTextToImage = action({
  args: {
    prompt: v.string(), // Text description of what to generate

    // === Required GPT Image Parameters ===
    quality: gptQualityValidator, // Rendering quality: "auto" | "low" | "medium" | "high" (required)
    image_size: gptImageSizeValidator, // Image dimensions: "auto" | "1024x1024" | "1536x1024" | "1024x1536" (required)

    // === Optional Generation Controls ===
    aspect_ratio: v.optional(v.string()), // Aspect ratio override (e.g., "16:9", "1:1")
    num_images: v.optional(v.number()), // Number of images to generate (1-4), default: 1
    seed: v.optional(v.number()), // Random seed for reproducible results
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))), // Output format, default: "jpeg"
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await generateGptTextToImage(args);
  },
});

/**
 * Edit image using GPT Image edit model (BYOK - Bring Your Own Key)
 * Uses OpenAI's image editing models through fal.ai with your OpenAI API key
 * Requires OPENAI_API_KEY environment variable
 */
export const gptEditImage = action({
  args: {
    prompt: v.string(), // Description of what to change in the image
    image_url: v.string(), // URL of the image to edit (publicly accessible)

    // === Required GPT Image Parameters ===
    quality: gptQualityValidator, // Rendering quality: "auto" | "low" | "medium" | "high" (required)
    image_size: gptImageSizeValidator, // Output dimensions: "auto" | "1024x1024" | "1536x1024" | "1024x1536" (required)

    // === Optional Generation Controls ===
    aspect_ratio: v.optional(v.string()), // Aspect ratio override (e.g., "16:9", "1:1")
    num_images: v.optional(v.number()), // Number of edited images to generate (1-4), default: 1
    seed: v.optional(v.number()), // Random seed for reproducible results
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))), // Output format, default: "jpeg"
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const { image_url, ...gptParams } = args;
    return await editImageWithGpt({
      ...gptParams,
      image_urls: [image_url], // Convert single URL to array for GPT client
    });
  },
});

/**
 * Generate image using Google's Imagen4 model
 * High-quality photorealistic images with excellent text rendering
 * Known for superior composition and natural lighting
 */
export const imagenTextToImage = action({
  args: {
    prompt: v.string(), // Text description of what to generate

    // === Required Imagen4 Parameters ===
    aspect_ratio: imagenAspectRatioValidator, // Image aspect ratio: "1:1" | "16:9" | "9:16" | "3:4" | "4:3" (required)

    // === Optional Generation Controls ===
    negative_prompt: v.optional(v.string()), // What to exclude from the image, default: ""
    num_images: v.optional(
      v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4)),
    ), // Number of images (1-4), default: 1
    seed: v.optional(v.number()), // Random seed for reproducible results
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))), // Output format, default: "jpeg"
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await generateImagenTextToImage(args);
  },
});

/**
 * Edit image using FLUX Kontext (image-to-image)
 * Context-aware image editing with natural language instructions
 * Supports both Pro (standard) and Max (more powerful) versions
 * Perfect for making intuitive edits like "add a rainbow" or "change to winter scene"
 */
export const kontextEditImage = action({
  args: {
    prompt: v.string(), // Natural language description of what to change in the image
    image_url: v.string(), // URL of the image to edit (publicly accessible)

    // === Required Kontext Parameters ===
    aspect_ratio: kontextAspectRatioValidator, // Output aspect ratio: "21:9" | "16:9" | "4:3" | "3:2" | "1:1" | "2:3" | "3:4" | "9:16" | "9:21" (required)

    // === Model Selection ===
    model: kontextModelValidator, // Kontext version: "pro" (standard) | "max" (more powerful) - required

    // === Optional Generation Controls ===
    guidance_scale: v.optional(v.number()), // Edit strength/prompt adherence (1-20), default: 3.5
    num_images: v.optional(v.number()), // Number of edited versions to generate (1-4), default: 1
    seed: v.optional(v.number()), // Random seed for reproducible results
    sync_mode: v.optional(v.boolean()), // Wait for completion vs async processing
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))), // Output format, default: "jpeg"

    // === Safety Controls ===
    safety_tolerance: v.optional(kontextSafetyToleranceValidator), // Safety level: "1"(strict) to "6"(permissive), default: "5"
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await editImageWithKontext(args);
  },
});

/**
 * Edit multiple images using FLUX Kontext Max Multi model
 * Context-aware editing with multiple input images for complex compositions
 * Only available with Kontext Max model - perfect for combining multiple images
 * Examples: "Put the person from image 1 into the scene from image 2", "Combine these two products into one image"
 */
export const kontextMultiEditImage = action({
  args: {
    prompt: v.string(), // Natural language description of how to combine/edit the images
    image_urls: v.array(v.string()), // Array of image URLs to edit/combine (2+ images recommended)

    // === Required Kontext Parameters ===
    aspect_ratio: kontextAspectRatioValidator, // Output aspect ratio: "21:9" | "16:9" | "4:3" | "3:2" | "1:1" | "2:3" | "3:4" | "9:16" | "9:21" (required)

    // === Optional Generation Controls ===
    guidance_scale: v.optional(v.number()), // Edit strength/prompt adherence (1-20), default: 3.5
    num_images: v.optional(v.number()), // Number of combined/edited versions to generate (1-4), default: 1
    seed: v.optional(v.number()), // Random seed for reproducible results
    sync_mode: v.optional(v.boolean()), // Wait for completion vs async processing
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))), // Output format, default: "jpeg"

    // === Safety Controls ===
    safety_tolerance: v.optional(kontextSafetyToleranceValidator), // Safety level: "1"(strict) to "6"(permissive), default: "2"
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await editImageWithKontextMulti(args);
  },
});

/**
 * Generate image using Gemini 2.5 Flash - Fast, affordable image generation by Google
 * Best for quick prototyping and testing
 */
export const geminiFlashTextToImage = action({
  args: {
    prompt: v.string(),
    num_images: v.optional(v.number()),
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))),
    sync_mode: v.optional(v.boolean()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await GeminiImageClient.generateFlashImage(args);
  },
});

/**
 * Edit image using Gemini 2.5 Flash Edit
 * Fast image editing with natural language instructions
 */
export const geminiFlashEditImage = action({
  args: {
    prompt: v.string(),
    image_url: v.string(),
    num_images: v.optional(v.number()),
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))),
    sync_mode: v.optional(v.boolean()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await GeminiImageClient.editFlashImage(args);
  },
});

/**
 * Generate image using Qwen Image - Excellent text rendering in images
 * Best for images that need clear, readable text
 */
export const qwenTextToImage = action({
  args: {
    prompt: v.string(),
    num_images: v.optional(v.number()),
    image_size: v.optional(
      v.union(
        v.literal("landscape_4_3"),
        v.literal("portrait_3_4"),
        v.literal("square"),
        v.literal("square_hd"),
        v.literal("landscape_16_9"),
        v.literal("portrait_9_16"),
      ),
    ),
    acceleration: v.optional(
      v.union(v.literal("none"), v.literal("regular"), v.literal("high")),
    ),
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))),
    sync_mode: v.optional(v.boolean()),
    guidance_scale: v.optional(v.number()),
    num_inference_steps: v.optional(v.number()),
    seed: v.optional(v.number()),
    negative_prompt: v.optional(v.string()),
    enable_safety_checker: v.optional(v.boolean()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await QwenImageClient.generateImage(args);
  },
});

/**
 * Edit image using Qwen Image Edit Plus
 * Advanced image editing with excellent text preservation
 */
export const qwenEditImage = action({
  args: {
    prompt: v.string(),
    image_url: v.string(),
    num_images: v.optional(v.number()),
    image_size: v.optional(
      v.union(
        v.literal("landscape_4_3"),
        v.literal("portrait_3_4"),
        v.literal("square"),
        v.literal("square_hd"),
        v.literal("landscape_16_9"),
        v.literal("portrait_9_16"),
      ),
    ),
    acceleration: v.optional(
      v.union(v.literal("none"), v.literal("regular"), v.literal("high")),
    ),
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))),
    sync_mode: v.optional(v.boolean()),
    guidance_scale: v.optional(v.number()),
    num_inference_steps: v.optional(v.number()),
    seed: v.optional(v.number()),
    negative_prompt: v.optional(v.string()),
    enable_safety_checker: v.optional(v.boolean()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await QwenImageClient.editImage(args);
  },
});

/**
 * Generate image using FLUX Pro Ultra v1.1 - Ultra-high quality output
 * Premium model for the highest quality results with 2K-4MP resolution
 */
export const fluxProUltraTextToImage = action({
  args: {
    prompt: v.string(),
    aspect_ratio: v.optional(
      v.union(
        v.literal("1:1"),
        v.literal("16:9"),
        v.literal("9:16"),
        v.literal("4:3"),
        v.literal("3:4"),
      ),
    ),
    enhance_prompt: v.optional(v.boolean()),
    num_images: v.optional(v.number()),
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))),
    sync_mode: v.optional(v.boolean()),
    safety_tolerance: v.optional(fluxSafetyToleranceValidator),
    enable_safety_checker: v.optional(v.boolean()),
    seed: v.optional(v.number()),
    raw: v.optional(v.boolean()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await FluxProUltraClient.generateImage(args);
  },
});

/**
 * Generate image using FLUX SRPO - High-quality with SRPO optimization
 * 12 billion parameter flow transformer with exceptional aesthetic quality
 * Cost: $0.025 per megapixel
 */
export const fluxSrpoTextToImage = action({
  args: {
    prompt: v.string(),
    num_images: v.optional(v.number()),
    acceleration: v.optional(
      v.union(v.literal("none"), v.literal("regular"), v.literal("high")),
    ),
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))),
    sync_mode: v.optional(v.boolean()),
    guidance_scale: v.optional(v.number()),
    num_inference_steps: v.optional(v.number()),
    seed: v.optional(v.number()),
    enable_safety_checker: v.optional(v.boolean()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const { FluxSrpoClient } = await import("./clients/fluxSrpoClient");
    return await FluxSrpoClient.generateTextToImage(args);
  },
});

/**
 * Transform image using FLUX SRPO - Image-to-image transformation
 * High-quality image transformation with SRPO optimization
 * Cost: $0.025 per megapixel
 */
export const fluxSrpoImageToImage = action({
  args: {
    prompt: v.string(),
    image_url: v.string(),
    strength: v.optional(v.number()),
    num_images: v.optional(v.number()),
    acceleration: v.optional(
      v.union(v.literal("none"), v.literal("regular"), v.literal("high")),
    ),
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))),
    sync_mode: v.optional(v.boolean()),
    guidance_scale: v.optional(v.number()),
    num_inference_steps: v.optional(v.number()),
    seed: v.optional(v.number()),
    enable_safety_checker: v.optional(v.boolean()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const { FluxSrpoClient } = await import("./clients/fluxSrpoClient");
    return await FluxSrpoClient.generateImageToImage(args);
  },
});

// Define the return validator separately so we can export its type
const generateImageReturns = v.object({
  success: v.boolean(),
  model: v.optional(v.string()),
  preference: v.optional(v.string()),
  operation: v.optional(v.string()),
  mode: v.optional(v.string()),
  estimatedCost: v.optional(v.number()),
  images: v.optional(
    v.array(
      v.object({
        url: v.string(),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        content_type: v.optional(v.string()),
        file_name: v.optional(v.union(v.string(), v.null())),
        file_size: v.optional(v.union(v.number(), v.null())),
      }),
    ),
  ),
  error: v.optional(v.string()),
  errorType: v.optional(v.string()),
  attempted: v.optional(v.array(v.string())),
  // Additional FAL response fields
  has_nsfw_concepts: v.optional(v.array(v.boolean())),
  prompt: v.optional(v.string()),
  seed: v.optional(v.number()),
  timings: v.optional(
    v.object({
      inference: v.optional(v.number()),
    }),
  ),
  // GPT-4o specific fields
  data: v.optional(
    v.object({
      images: v.array(
        v.object({
          url: v.string(),
          width: v.optional(v.union(v.number(), v.null())),
          height: v.optional(v.union(v.number(), v.null())),
          content_type: v.optional(v.string()),
          file_name: v.optional(v.string()),
          file_size: v.optional(v.number()),
        }),
      ),
      usage: v.optional(
        v.object({
          input_tokens: v.optional(v.number()),
          output_tokens: v.optional(v.number()),
          total_tokens: v.optional(v.number()),
          input_tokens_details: v.optional(
            v.object({
              image_tokens: v.optional(v.number()),
              text_tokens: v.optional(v.number()),
            }),
          ),
        }),
      ),
    }),
  ),
});

// Export the type for use in other files
export type ImageGenerationResult = Infer<typeof generateImageReturns>;

/**
 * Unified image generation with flexible control
 *
 * Control hierarchy:
 * 1. model - Direct model selection (overrides everything)
 * 2. preference - Quality/speed preference
 * 3. Auto-detection - Based on image_url presence (image_url → edit, no image_url → generate)
 *
 * @example
 * // Simple - auto-detects everything
 * await generateImage({ prompt: "Beautiful landscape" })
 *
 * @example
 * // With preference
 * await generateImage({ prompt: "Professional photo", preference: "quality" })
 *
 * @example
 * // Edit image (auto-detected from image_url)
 * await generateImage({
 *   prompt: "Make it sunset",
 *   image_url: "https://original.jpg"
 * })
 *
 * @example
 * // Direct model control (power user)
 * await generateImage({
 *   prompt: "Sunset",
 *   model: "fluxProUltraTextToImage"  // Bypasses preference
 * })
 */
export const generateImage = action({
  args: {
    prompt: v.string(),
    image_url: v.optional(v.string()), // Determines operation: present → edit, absent → generate

    // Control hierarchy (each level overrides the ones below)
    model: v.optional(v.string()), // Direct model name (overrides everything)
    preference: v.optional(
      v.union(
        // Quality/speed preference
        v.literal("quality"),
        v.literal("default"),
        v.literal("fast"),
      ),
    ),

    // Additional parameters
    aspectRatio: v.optional(v.string()),
    numImages: v.optional(v.number()),
  },
  returns: generateImageReturns,
  handler: async (ctx, args) => {
    // Import the configuration function and model identifiers
    const { getImageConfig, FAL_IMAGE_MODELS } = await import("./imageModels");

    // Import api for action references
    const { api } = await import("../../_generated/api");

    // Model to action mapping using FAL's exact model identifiers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modelActions: Record<string, any> = {
      // Text-to-image models
      [FAL_IMAGE_MODELS.FLUX_PRO_ULTRA]:
        api.utils.fal.falImageActions.fluxProUltraTextToImage,
      [FAL_IMAGE_MODELS.FLUX_SRPO_TEXT]:
        api.utils.fal.falImageActions.fluxSrpoTextToImage,
      [FAL_IMAGE_MODELS.FLUX_DEV]:
        api.utils.fal.falImageActions.fluxTextToImage,
      [FAL_IMAGE_MODELS.FLUX_SCHNELL]:
        api.utils.fal.falImageActions.fluxTextToImage,
      [FAL_IMAGE_MODELS.GPT_4O_TEXT_TO_IMAGE]:
        api.utils.fal.falImageActions.gptTextToImage,
      [FAL_IMAGE_MODELS.IMAGEN4_PREVIEW]:
        api.utils.fal.falImageActions.imagenTextToImage,
      [FAL_IMAGE_MODELS.GEMINI_FLASH]:
        api.utils.fal.falImageActions.geminiFlashTextToImage,
      [FAL_IMAGE_MODELS.QWEN_TEXT]:
        api.utils.fal.falImageActions.qwenTextToImage,

      // Image-to-image models
      [FAL_IMAGE_MODELS.FLUX_SRPO_IMAGE]:
        api.utils.fal.falImageActions.fluxSrpoImageToImage,
      [FAL_IMAGE_MODELS.KONTEXT_PRO]:
        api.utils.fal.falImageActions.kontextEditImage,
      [FAL_IMAGE_MODELS.KONTEXT_MAX]:
        api.utils.fal.falImageActions.kontextEditImage,
      [FAL_IMAGE_MODELS.GPT_4O_EDIT]:
        api.utils.fal.falImageActions.gptEditImage,
      [FAL_IMAGE_MODELS.GEMINI_FLASH_EDIT]:
        api.utils.fal.falImageActions.geminiFlashEditImage,
      [FAL_IMAGE_MODELS.QWEN_EDIT]: api.utils.fal.falImageActions.qwenEditImage,

      // Also support our old naming for backward compatibility
      fluxProUltraTextToImage:
        api.utils.fal.falImageActions.fluxProUltraTextToImage,
      fluxSrpoTextToImage: api.utils.fal.falImageActions.fluxSrpoTextToImage,
      fluxSrpoImageToImage: api.utils.fal.falImageActions.fluxSrpoImageToImage,
      fluxTextToImage: api.utils.fal.falImageActions.fluxTextToImage,
      gptTextToImage: api.utils.fal.falImageActions.gptTextToImage,
      imagenTextToImage: api.utils.fal.falImageActions.imagenTextToImage,
      geminiFlashTextToImage:
        api.utils.fal.falImageActions.geminiFlashTextToImage,
      qwenTextToImage: api.utils.fal.falImageActions.qwenTextToImage,
      kontextEditImage: api.utils.fal.falImageActions.kontextEditImage,
      gptEditImage: api.utils.fal.falImageActions.gptEditImage,
      geminiFlashEditImage: api.utils.fal.falImageActions.geminiFlashEditImage,
      qwenEditImage: api.utils.fal.falImageActions.qwenEditImage,
    };

    // 1. Handle direct model override
    if (args.model) {
      console.log(`🎨 Using specific model: ${args.model}`);

      const action = modelActions[args.model];
      if (!action) {
        const availableModels = Object.keys(modelActions).join(", ");
        throw new Error(
          `Model '${args.model}' not found. Available models: ${availableModels}`,
        );
      }

      try {
        const params = {
          prompt: args.prompt,
          ...(args.image_url && { image_url: args.image_url }),
          ...(args.aspectRatio && { aspect_ratio: args.aspectRatio }),
          ...(args.numImages && { num_images: args.numImages }),
        };

        const result = await ctx.runAction(action, params);

        return {
          success: true,
          model: args.model,
          mode: "direct",
          ...result,
        };
      } catch (error) {
        console.error(`Model ${args.model} failed:`, error);
        return {
          success: false,
          model: args.model,
          error:
            error instanceof Error ? error.message : "Model execution failed",
        };
      }
    }

    // 2. Determine operation type based on image_url presence
    const operation = args.image_url ? "imageToImage" : "textToImage";

    // 3. Use preference (explicit or default)
    const preference = args.preference || "default";

    console.log(
      `🎨 ${operation === "imageToImage" ? "Editing" : "Generating"} image with ${preference} preference`,
    );

    // Get model configuration with fallback chain
    const config = getImageConfig(operation, preference);

    // Try primary model
    try {
      const primaryAction = modelActions[config.primary.model];
      if (!primaryAction)
        throw new Error(`Unknown model: ${config.primary.model}`);

      console.log(`Trying primary: ${config.primary.model}`);

      const params = {
        prompt: args.prompt,
        ...(args.image_url && { image_url: args.image_url }),
        ...(args.aspectRatio && { aspect_ratio: args.aspectRatio }),
        ...(args.numImages && { num_images: args.numImages }),
        ...config.primary.params,
      };

      const result = await ctx.runAction(primaryAction, params);

      if (result.success || result.images) {
        console.log(`✅ Success with ${config.primary.model}`);
        return {
          success: true,
          model: config.primary.model,
          preference,
          estimatedCost: config.estimatedCost,
          ...result,
        };
      }
    } catch (error) {
      console.error(`Primary model failed: ${error}`);
    }

    // Try fallbacks
    for (const fallback of config.fallbacks) {
      try {
        const fallbackAction = modelActions[fallback.model];
        if (!fallbackAction) continue;

        console.log(`Trying fallback: ${fallback.model}`);

        const params = {
          prompt: args.prompt,
          ...(args.image_url && { image_url: args.image_url }),
          ...(args.aspectRatio && { aspect_ratio: args.aspectRatio }),
          ...(args.numImages && { num_images: args.numImages }),
          ...fallback.params,
        };

        const result = await ctx.runAction(fallbackAction, params);

        if (result.success || result.images) {
          console.log(`✅ Success with fallback: ${fallback.model}`);
          return {
            success: true,
            model: fallback.model,
            preference,
            estimatedCost: config.estimatedCost,
            ...result,
          };
        }
      } catch (error) {
        console.error(`Fallback ${fallback.model} failed: ${error}`);
      }
    }

    return {
      success: false,
      error: "All models in chain failed",
      model: config.primary.model, // Return the primary model that was attempted
      preference,
      attempted: [
        config.primary.model,
        ...config.fallbacks.map((f) => f.model),
      ],
    };
  },
});
