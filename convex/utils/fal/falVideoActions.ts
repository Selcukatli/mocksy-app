"use node";

import { internalAction, ActionCtx } from "../../_generated/server";
import { v, Infer } from "convex/values";
import { internal } from "../../_generated/api";
import { FalErrorResponse } from "./types";
import { VIDEO_MODELS } from "./clients/video/videoModels";

// Re-export constants for better discoverability
export { VIDEO_MODELS } from "./clients/video/videoModels";

export const VIDEO_PREFERENCES = {
  QUALITY: "quality",
  DEFAULT: "default",
  FAST: "fast",
} as const;

export const VIDEO_TYPES = {
  TEXT_TO_VIDEO: "text-to-video",
  IMAGE_TO_VIDEO: "image-to-video",
} as const;

// Import video generation clients
import {
  generateKlingTextToVideo,
  generateKlingImageToVideo,
} from "./clients/video/klingVideoClient";
import { generateLucyImageToVideo } from "./clients/video/lucyVideoClient";
import {
  generateSeeDanceImageToVideo,
  generateSeeDanceTextToVideo,
} from "./clients/video/seeDanceVideoClient";
import { generateHailuoImageToVideo } from "./clients/video/hailuoVideoClient";

// Convex validators for Kling Video enums
const klingVideoAspectRatioValidator = v.union(
  v.literal("16:9"),
  v.literal("9:16"),
  v.literal("1:1"),
);

const klingVideoDurationValidator = v.union(v.literal(5), v.literal(10));

/**
 * Generate a video from text using Kling Video v2.5 Turbo Pro
 *
 * Features:
 * - Cinematic quality video generation
 * - Exceptional motion fluidity
 * - Precise prompt following
 * - Support for 5 or 10 second videos
 *
 * Pricing:
 * - 5-second video: $0.35
 * - 10-second video: $0.70
 *
 * @example
 * // Simple text-to-video
 * await ctx.runAction(api.utils.fal.falVideoActions.klingTextToVideo, {
 *   prompt: "A majestic eagle soaring through mountain clouds at sunset",
 *   duration: 5,
 *   aspect_ratio: "16:9"
 * });
 *
 * @example
 * // Text-to-video with starting image
 * await ctx.runAction(api.utils.fal.falVideoActions.klingTextToVideo, {
 *   prompt: "The landscape comes alive with wind and movement",
 *   image_url: "https://example.com/landscape.jpg",
 *   duration: 10,
 *   aspect_ratio: "16:9"
 * });
 */
export const klingTextToVideo = internalAction({
  args: {
    prompt: v.string(), // Text description (max 2500 characters)
    duration: v.optional(klingVideoDurationValidator), // 5 or 10 seconds, default: 5
    aspect_ratio: v.optional(klingVideoAspectRatioValidator), // Video dimensions, default: "16:9"
    negative_prompt: v.optional(v.string()), // What to avoid, default: "blur, distort, and low quality"
    cfg_scale: v.optional(v.number()), // 0-1, prompt adherence, default: 0.5
    image_url: v.optional(v.string()), // Optional starting image for video
    apiKey: v.optional(v.string()), // Optional API key override
  },
  returns: v.object({
    success: v.boolean(),
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    error: v.optional(v.string()),
    errorType: v.optional(v.string()),
    rejectedPrompt: v.optional(v.string()),
    suggestion: v.optional(v.string()),
  }),
  handler: async (_ctx, args) => {
    console.log("🎬 Kling Text-to-Video Action Started!");
    console.log(`Prompt: "${args.prompt}"`);
    console.log(`Duration: ${args.duration || 5} seconds`);
    console.log(`Aspect Ratio: ${args.aspect_ratio || "16:9"}`);

    try {
      // Generate the video
      const result = await generateKlingTextToVideo(
        {
          prompt: args.prompt,
          duration: args.duration,
          aspect_ratio: args.aspect_ratio,
          negative_prompt: args.negative_prompt,
          cfg_scale: args.cfg_scale,
          image_url: args.image_url,
        },
        args.apiKey,
      );

      if (result.success && result.data) {
        console.log("✅ Video generated successfully!");
        console.log(`Video URL: ${result.data.video.url}`);

        return {
          success: true,
          videoUrl: result.data.video.url,
          duration: result.data.video.duration,
          width: result.data.video.width,
          height: result.data.video.height,
        };
      } else {
        // Type narrowing - if not success, it's an error response
        const errorResult = result as FalErrorResponse;
        console.error("❌ Video generation failed:", errorResult.error);

        return {
          success: false,
          error: errorResult.error?.message || "Failed to generate video",
          errorType: errorResult.error?.type,
          rejectedPrompt: errorResult.error?.rejectedPrompt,
          suggestion: errorResult.error?.suggestion,
        };
      }
    } catch (error) {
      console.error("❌ Unexpected error in klingTextToVideo:", error);

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unexpected error occurred",
        errorType: "unexpected_error",
      };
    }
  },
});

/**
 * Generate a video from an image using Kling Video v2.5 Turbo Pro
 *
 * Features:
 * - Transform static images into dynamic videos
 * - Natural motion generation
 * - Prompt-guided animation
 * - Support for 5 or 10 second videos
 *
 * Pricing:
 * - 5-second video: $0.35
 * - 10-second video: $0.70
 *
 * @example
 * await ctx.runAction(api.utils.fal.falVideoActions.klingImageToVideo, {
 *   prompt: "The car accelerates forward with motion blur",
 *   image_url: "https://example.com/car.jpg",
 *   duration: 5
 * });
 */
export const klingImageToVideo = internalAction({
  args: {
    prompt: v.string(), // Text description guiding the video
    image_url: v.string(), // Source image URL (required)
    duration: v.optional(klingVideoDurationValidator), // 5 or 10 seconds, default: 5
    negative_prompt: v.optional(v.string()), // What to avoid, default: "blur, distort, and low quality"
    cfg_scale: v.optional(v.number()), // 0-1, prompt adherence, default: 0.5
    apiKey: v.optional(v.string()), // Optional API key override
  },
  returns: v.object({
    success: v.boolean(),
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    error: v.optional(v.string()),
    errorType: v.optional(v.string()),
    rejectedPrompt: v.optional(v.string()),
    suggestion: v.optional(v.string()),
  }),
  handler: async (_ctx, args) => {
    console.log("🎬 Kling Image-to-Video Action Started");
    console.log(`Prompt: "${args.prompt}"`);
    console.log(`Source Image: ${args.image_url}`);
    console.log(`Duration: ${args.duration || 5} seconds`);

    try {
      // Generate the video
      const result = await generateKlingImageToVideo(
        {
          prompt: args.prompt,
          image_url: args.image_url,
          duration: args.duration,
          negative_prompt: args.negative_prompt,
          cfg_scale: args.cfg_scale,
        },
        args.apiKey,
      );

      if (result.success && result.data) {
        console.log("✅ Video generated successfully!");
        console.log(`Video URL: ${result.data.video.url}`);

        return {
          success: true,
          videoUrl: result.data.video.url,
          duration: result.data.video.duration,
          width: result.data.video.width,
          height: result.data.video.height,
        };
      } else {
        // Type narrowing - if not success, it's an error response
        const errorResult = result as FalErrorResponse;
        console.error("❌ Video generation failed:", errorResult.error);

        return {
          success: false,
          error: errorResult.error?.message || "Failed to generate video",
          errorType: errorResult.error?.type,
          rejectedPrompt: errorResult.error?.rejectedPrompt,
          suggestion: errorResult.error?.suggestion,
        };
      }
    } catch (error) {
      console.error("❌ Unexpected error in klingImageToVideo:", error);

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unexpected error occurred",
        errorType: "unexpected_error",
      };
    }
  },
});

/**
 * Generate a video using Lucy-14b (FAST & AFFORDABLE)
 *
 * Features:
 * - Lightning fast generation
 * - Affordable pricing ($0.08/second)
 * - High quality output
 * - 720p resolution
 *
 * Output Format:
 * - sync_mode: false (default) - Returns a hosted URL
 * - sync_mode: true - Returns base64 encoded video data
 *
 * @example
 * // Get hosted URL (default, recommended)
 * await ctx.runAction(internal.utils.fal.falVideoActions.lucyImageToVideo, {
 *   prompt: "The person starts dancing with energetic movements",
 *   image_url: "https://example.com/person.jpg"
 * });
 *
 * @example
 * // Get base64 encoded video (if needed)
 * await ctx.runAction(internal.utils.fal.falVideoActions.lucyImageToVideo, {
 *   prompt: "The person starts dancing with energetic movements",
 *   image_url: "https://example.com/person.jpg",
 *   sync_mode: true
 * });
 */
export const lucyImageToVideo = internalAction({
  args: {
    prompt: v.string(), // Max 1500 characters
    image_url: v.string(), // Required - source image
    aspect_ratio: v.optional(v.union(v.literal("16:9"), v.literal("9:16"))), // Default: "16:9"
    sync_mode: v.optional(v.boolean()), // Default: false for URLs
    apiKey: v.optional(v.string()), // Optional API key override
  },
  returns: v.object({
    success: v.boolean(),
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    error: v.optional(v.string()),
    errorType: v.optional(v.string()),
  }),
  handler: async (_ctx, args) => {
    console.log("🚀 Lucy-14b Image-to-Video (FAST)");
    console.log(`Prompt: "${args.prompt}"`);
    console.log(`Source Image: ${args.image_url}`);

    try {
      const result = await generateLucyImageToVideo(
        {
          prompt: args.prompt,
          image_url: args.image_url,
          aspect_ratio: args.aspect_ratio,
          resolution: "720p",
          sync_mode: args.sync_mode,
        },
        args.apiKey,
      );

      if (result.success && result.data) {
        console.log("✅ Video generated successfully!");
        console.log(`Video URL: ${result.data.video.url}`);

        return {
          success: true,
          videoUrl: result.data.video.url,
          duration: result.data.video.duration,
          width: result.data.video.width,
          height: result.data.video.height,
        };
      } else {
        const errorResult = result as FalErrorResponse;
        console.error("❌ Video generation failed:", errorResult.error);

        return {
          success: false,
          error: errorResult.error?.message || "Failed to generate video",
          errorType: errorResult.error?.type,
        };
      }
    } catch (error) {
      console.error("❌ Unexpected error in lucyImageToVideo:", error);

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unexpected error occurred",
        errorType: "unexpected_error",
      };
    }
  },
});

/**
 * Generate a video using SeeDance v1 Lite (FAST & CUSTOMIZABLE)
 *
 * Features:
 * - Fast generation
 * - Affordable pricing ($0.18 for 5s 720p)
 * - Camera control options
 * - Multiple aspect ratios
 *
 * @example
 * await ctx.runAction(api.utils.fal.falVideoActions.seeDanceImageToVideo, {
 *   prompt: "The landscape comes alive with wind and movement",
 *   image_url: "https://example.com/landscape.jpg",
 *   duration: 5,
 *   camera_fixed: true
 * });
 */
export const seeDanceImageToVideo = internalAction({
  args: {
    prompt: v.string(), // Text description
    image_url: v.string(), // Required - source image
    aspect_ratio: v.optional(
      v.union(
        v.literal("16:9"),
        v.literal("9:16"),
        v.literal("4:3"),
        v.literal("3:4"),
        v.literal("1:1"),
      ),
    ), // Default: "16:9"
    resolution: v.optional(v.union(v.literal("720p"), v.literal("480p"))), // Default: "720p"
    duration: v.optional(v.number()), // Default: 5 seconds
    camera_fixed: v.optional(v.boolean()), // Default: false
    seed: v.optional(v.number()), // For reproducibility
    apiKey: v.optional(v.string()), // Optional API key override
  },
  returns: v.object({
    success: v.boolean(),
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    error: v.optional(v.string()),
    errorType: v.optional(v.string()),
  }),
  handler: async (_ctx, args) => {
    console.log("🎬 SeeDance v1 Lite Image-to-Video");
    console.log(`Prompt: "${args.prompt}"`);
    console.log(`Source Image: ${args.image_url}`);
    console.log(
      `Duration: ${args.duration || 5}s, Resolution: ${args.resolution || "720p"}`,
    );

    try {
      const result = await generateSeeDanceImageToVideo(
        {
          prompt: args.prompt,
          image_url: args.image_url,
          aspect_ratio: args.aspect_ratio,
          resolution: args.resolution,
          duration: args.duration,
          camera_fixed: args.camera_fixed,
          seed: args.seed,
          enable_safety_checker: true,
        },
        args.apiKey,
      );

      if (result.success && result.data) {
        console.log("✅ Video generated successfully!");
        console.log(`Video URL: ${result.data.video.url}`);

        return {
          success: true,
          videoUrl: result.data.video.url,
          duration: result.data.video.duration,
          width: result.data.video.width,
          height: result.data.video.height,
        };
      } else {
        const errorResult = result as FalErrorResponse;
        console.error("❌ Video generation failed:", errorResult.error);

        return {
          success: false,
          error: errorResult.error?.message || "Failed to generate video",
          errorType: errorResult.error?.type,
        };
      }
    } catch (error) {
      console.error("❌ Unexpected error in seeDanceImageToVideo:", error);

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unexpected error occurred",
        errorType: "unexpected_error",
      };
    }
  },
});

/**
 * Generate a video from text using SeeDance v1 Lite (FAST & CREATIVE)
 *
 * Features:
 * - Text-to-video generation
 * - Fast generation
 * - Supports up to 1080p resolution
 * - Variable duration (3-12 seconds)
 * - Multiple aspect ratios
 *
 * @example
 * await ctx.runAction(api.utils.fal.falVideoActions.seeDanceTextToVideo, {
 *   prompt: "A beautiful sunset over the ocean with gentle waves",
 *   duration: "8",
 *   resolution: "1080p"
 * });
 */
export const seeDanceTextToVideo = internalAction({
  args: {
    prompt: v.string(), // Text description
    aspect_ratio: v.optional(
      v.union(
        v.literal("21:9"),
        v.literal("16:9"),
        v.literal("4:3"),
        v.literal("1:1"),
        v.literal("3:4"),
        v.literal("9:16"),
        v.literal("9:21"),
      ),
    ), // Default: "16:9"
    resolution: v.optional(
      v.union(v.literal("480p"), v.literal("720p"), v.literal("1080p")),
    ), // Default: "720p"
    duration: v.optional(v.string()), // "3" to "12" seconds, default: "5"
    camera_fixed: v.optional(v.boolean()), // Default: false
    seed: v.optional(v.number()), // For reproducibility, -1 for random
    apiKey: v.optional(v.string()), // Optional API key override
  },
  returns: v.object({
    success: v.boolean(),
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    error: v.optional(v.string()),
    errorType: v.optional(v.string()),
  }),
  handler: async (_ctx, args) => {
    console.log("🎬 SeeDance v1 Lite Text-to-Video");
    console.log(`Prompt: "${args.prompt}"`);
    console.log(
      `Duration: ${args.duration || "5"}s, Resolution: ${args.resolution || "720p"}`,
    );

    try {
      const result = await generateSeeDanceTextToVideo(
        {
          prompt: args.prompt,
          aspect_ratio: args.aspect_ratio,
          resolution: args.resolution,
          duration: args.duration,
          camera_fixed: args.camera_fixed,
          seed: args.seed,
          enable_safety_checker: true,
        },
        args.apiKey,
      );

      if (result.success && result.data) {
        console.log("✅ Video generated successfully!");
        console.log(`Video URL: ${result.data.video.url}`);

        return {
          success: true,
          videoUrl: result.data.video.url,
          duration: result.data.video.duration,
          width: result.data.video.width,
          height: result.data.video.height,
        };
      } else {
        const errorResult = result as FalErrorResponse;
        console.error("❌ Video generation failed:", errorResult.error);

        return {
          success: false,
          error: errorResult.error?.message || "Failed to generate video",
          errorType: errorResult.error?.type,
        };
      }
    } catch (error) {
      console.error("❌ Unexpected error in seeDanceTextToVideo:", error);

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unexpected error occurred",
        errorType: "unexpected_error",
      };
    }
  },
});

/**
 * Generate a video using Minimax Hailuo-02 Fast (FAST & ECONOMICAL)
 *
 * Features:
 * - Blazing fast generation
 * - Most economical pricing ($0.017/second)
 * - 512p resolution
 * - Prompt optimizer for better results
 *
 * Pricing:
 * - 6 seconds: ~$0.10
 * - 10 seconds: ~$0.17
 *
 * @example
 * await ctx.runAction(api.utils.fal.falVideoActions.hailuoImageToVideo, {
 *   prompt: "Extremely realistic movement. The scene comes alive",
 *   image_url: "https://example.com/image.jpg",
 *   duration: "6"
 * });
 */
export const hailuoImageToVideo = internalAction({
  args: {
    prompt: v.string(), // Max 2000 characters
    image_url: v.string(), // Required - source image
    duration: v.optional(v.union(v.literal("6"), v.literal("10"))), // Default: "6"
    prompt_optimizer: v.optional(v.boolean()), // Default: true
    apiKey: v.optional(v.string()), // Optional API key override
  },
  returns: v.object({
    success: v.boolean(),
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    error: v.optional(v.string()),
    errorType: v.optional(v.string()),
  }),
  handler: async (_ctx, args) => {
    console.log("⚡ Hailuo-02 Fast Image-to-Video (ECONOMICAL)");
    console.log(`Prompt: "${args.prompt}"`);
    console.log(`Source Image: ${args.image_url}`);
    console.log(`Duration: ${args.duration || "6"}s`);

    try {
      const result = await generateHailuoImageToVideo(
        {
          prompt: args.prompt,
          image_url: args.image_url,
          duration: args.duration,
          prompt_optimizer: args.prompt_optimizer,
        },
        args.apiKey,
      );

      if (result.success && result.data) {
        console.log("✅ Video generated successfully!");
        console.log(`Video URL: ${result.data.video.url}`);

        return {
          success: true,
          videoUrl: result.data.video.url,
          duration: result.data.video.duration,
          width: result.data.video.width,
          height: result.data.video.height,
        };
      } else {
        const errorResult = result as FalErrorResponse;
        console.error("❌ Video generation failed:", errorResult.error);

        return {
          success: false,
          error: errorResult.error?.message || "Failed to generate video",
          errorType: errorResult.error?.type,
        };
      }
    } catch (error) {
      console.error("❌ Unexpected error in hailuoImageToVideo:", error);

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unexpected error occurred",
        errorType: "unexpected_error",
      };
    }
  },
});

// Define the return validator separately so we can export its type
const generateVideoReturns = v.object({
  success: v.boolean(),
  model: v.optional(v.string()),
  preference: v.optional(v.string()),
  tier: v.optional(v.string()),
  operation: v.optional(v.string()),
  videoUrl: v.optional(v.string()),
  duration: v.optional(v.number()),
  width: v.optional(v.number()),
  height: v.optional(v.number()),
  generationTime: v.optional(v.number()),
  cost: v.optional(v.number()),
  capabilities: v.optional(v.any()),
  error: v.optional(v.string()),
  attemptedModels: v.optional(v.array(v.string())),
});

// Export the type for use in other files
export type VideoGenerationResult = Infer<typeof generateVideoReturns>;

/**
 * Unified video generation with flexible control
 *
 * Control hierarchy:
 * 1. model - Direct model selection (overrides everything)
 * 2. preference - Quality/speed preference
 * 3. Auto-detection - Based on imageUrl presence (imageUrl → animate, no imageUrl → generate)
 *
 * @example
 * // Simple - auto-detects everything
 * await generateVideo({ prompt: "Sunset timelapse" })
 *
 * @example
 * // With preference
 * await generateVideo({ prompt: "Professional video", preference: "quality", duration: 10 })
 *
 * @example
 * // Animate image (auto-detected from imageUrl)
 * await generateVideo({
 *   prompt: "Add gentle motion to the scene",
 *   imageUrl: "https://static-image.jpg"
 * })
 *
 * @example
 * // Direct model control (power user)
 * await generateVideo({
 *   prompt: "Ocean waves",
 *   model: "klingTextToVideo"  // Bypasses preference
 * })
 */
export const generateVideo = internalAction({
  args: {
    prompt: v.string(),
    imageUrl: v.optional(v.string()), // Determines operation: present → animate, absent → generate

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
    duration: v.optional(v.number()),
    resolution: v.optional(v.string()),
    aspectRatio: v.optional(v.string()),
    apiKey: v.optional(v.string()),
  },
  returns: generateVideoReturns,
  handler: async (ctx, args) => {
    // Dynamic import of configuration
    const { getVideoConfig, calculateVideoCost } = await import(
      "./clients/video/videoModels"
    );

    // 1. Handle direct model override
    if (args.model) {
      console.log(`🎬 Using specific model: ${args.model}`);

      try {
        const startTime = Date.now();
        const result = await executeVideoModel(ctx, args.model, {
          prompt: args.prompt,
          imageUrl: args.imageUrl,
          duration: args.duration,
          resolution: args.resolution,
          aspectRatio: args.aspectRatio,
          apiKey: args.apiKey,
        });

        if (result.success) {
          const generationTime = (Date.now() - startTime) / 1000;
          const actualCost = calculateVideoCost(
            args.model,
            result.duration || args.duration || 5,
            args.resolution,
          );

          return {
            success: true,
            model: args.model,
            mode: "direct",
            videoUrl: result.videoUrl,
            duration: result.duration,
            width: result.width,
            height: result.height,
            generationTime,
            cost: actualCost,
          };
        } else {
          return {
            success: false,
            model: args.model,
            error: result.error || "Model execution failed",
          };
        }
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

    // 2. Determine operation type based on imageUrl presence
    const operation = args.imageUrl ? "imageToVideo" : "textToVideo";

    // 3. Use preference (explicit or default)
    const preference = args.preference || "default";

    console.log(
      `🎬 Generating video with ${preference} preference (${operation})`,
    );

    // Get model configuration with fallback chain
    const config = getVideoConfig(operation, preference);
    const attemptedModels: string[] = [];

    // Try primary model
    try {
      const modelName = config.primary.model;
      attemptedModels.push(modelName);

      console.log(`Trying primary model: ${modelName}`);
      console.log(`⏱️ Estimated time: ${config.estimatedSpeed.typical}s`);
      console.log(`💰 Estimated cost: $${config.estimatedCost.toFixed(2)}`);

      const startTime = Date.now();
      const primaryParams = config.primary.params as {
        duration?: string | number;
        resolution?: string;
        aspect_ratio?: string;
        cfg_scale?: number;
        prompt_optimizer?: boolean;
        [key: string]: string | number | boolean | undefined;
      };
      const result = await executeVideoModel(ctx, modelName, {
        prompt: args.prompt,
        imageUrl: args.imageUrl,
        apiKey: args.apiKey,
        ...config.primary.params, // Spread all params first
        // Then override with explicit args if provided
        ...(args.duration !== undefined && { duration: args.duration }),
        ...(args.resolution !== undefined && { resolution: args.resolution }),
        ...(args.aspectRatio !== undefined && { aspectRatio: args.aspectRatio }),
      });

      if (result.success) {
        const generationTime = (Date.now() - startTime) / 1000;
        const actualDuration =
          result.duration ||
          args.duration ||
          (typeof primaryParams.duration === "number"
            ? primaryParams.duration
            : parseInt(String(primaryParams.duration) || "5"));
        const actualCost = calculateVideoCost(
          modelName,
          actualDuration,
          args.resolution,
        );

        console.log(`✅ Success with ${modelName}`);
        console.log(`⏱️ Actual time: ${generationTime.toFixed(1)}s`);
        console.log(`💰 Actual cost: $${actualCost.toFixed(2)}`);

        return {
          success: true,
          model: modelName,
          preference,
          operation,
          videoUrl: result.videoUrl,
          duration: result.duration,
          width: result.width,
          height: result.height,
          generationTime,
          cost: actualCost,
          capabilities: config.capabilities,
        };
      }
    } catch (error) {
      console.error(`Primary model failed:`, error);
    }

    // Try fallback models
    for (const fallback of config.fallbacks) {
      try {
        const modelName = fallback.model;
        attemptedModels.push(modelName);

        console.log(`Trying fallback: ${modelName}`);

        const startTime = Date.now();
        const fallbackParams = fallback.params as {
          duration?: string | number;
          resolution?: string;
          aspect_ratio?: string;
          cfg_scale?: number;
          prompt_optimizer?: boolean;
          [key: string]: string | number | boolean | undefined;
        };
        const result = await executeVideoModel(ctx, modelName, {
          prompt: args.prompt,
          imageUrl: args.imageUrl,
          apiKey: args.apiKey,
          ...fallback.params, // Spread all params first
          // Then override with explicit args if provided
          ...(args.duration !== undefined && { duration: args.duration }),
          ...(args.resolution !== undefined && { resolution: args.resolution }),
          ...(args.aspectRatio !== undefined && { aspectRatio: args.aspectRatio }),
        });

        if (result.success) {
          const generationTime = (Date.now() - startTime) / 1000;
          const actualDuration =
            result.duration ||
            args.duration ||
            (typeof fallbackParams.duration === "number"
              ? fallbackParams.duration
              : parseInt(String(fallbackParams.duration) || "5"));
          const actualCost = calculateVideoCost(
            modelName,
            actualDuration,
            args.resolution,
          );

          console.log(`✅ Success with fallback: ${modelName}`);
          console.log(`⏱️ Actual time: ${generationTime.toFixed(1)}s`);
          console.log(`💰 Actual cost: $${actualCost.toFixed(2)}`);

          return {
            success: true,
            model: modelName,
            preference,
            operation,
            videoUrl: result.videoUrl,
            duration: result.duration,
            width: result.width,
            height: result.height,
            generationTime,
            cost: actualCost,
            capabilities: config.capabilities,
          };
        }
      } catch (error) {
        console.error(`Fallback ${fallback.model} failed:`, error);
      }
    }

    // All models failed
    console.error(`❌ All models failed for ${preference} preference`);
    return {
      success: false,
      model: config.primary.model, // Return the primary model that was attempted
      preference,
      operation,
      error: "All models failed to generate video",
      attemptedModels,
    };
  },
});

// Helper function to execute the appropriate video model
interface VideoModelParams {
  prompt?: string;
  imageUrl?: string;
  duration?: number | string;
  resolution?: string;
  aspectRatio?: string;
  aspect_ratio?: string;
  apiKey?: string;
  sync_mode?: boolean;
  cfg_scale?: number;
  negative_prompt?: string;
  camera_fixed?: boolean;
  seed?: number;
  [key: string]: string | number | boolean | undefined; // Allow additional properties
}

interface VideoModelResult {
  success: boolean;
  videoUrl?: string;
  duration?: number;
  width?: number;
  height?: number;
  error?: string;
}

async function executeVideoModel(
  ctx: ActionCtx,
  modelName: string,
  params: VideoModelParams,
): Promise<VideoModelResult> {
  // Map model names to action calls
  switch (modelName) {
    case VIDEO_MODELS.KLING_TEXT:
      return await ctx.runAction(
        internal.utils.fal.falVideoActions.klingTextToVideo,
        {
          prompt: params.prompt || "",
          duration: (typeof params.duration === "number"
            ? params.duration
            : parseInt(params.duration || "5")) as 5 | 10,
          aspect_ratio: (params.aspectRatio ||
            params.aspect_ratio ||
            "16:9") as "16:9" | "1:1" | "9:16",
          cfg_scale: params.cfg_scale,
          negative_prompt: params.negative_prompt,
          image_url: params.imageUrl,
          apiKey: params.apiKey,
        },
      );

    case VIDEO_MODELS.KLING_IMAGE:
      return await ctx.runAction(
        internal.utils.fal.falVideoActions.klingImageToVideo,
        {
          prompt: params.prompt || "",
          image_url: params.imageUrl || "",
          duration: (typeof params.duration === "number"
            ? params.duration
            : parseInt(params.duration || "5")) as 5 | 10,
          cfg_scale: params.cfg_scale,
          negative_prompt: params.negative_prompt,
          apiKey: params.apiKey,
        },
      );

    case VIDEO_MODELS.SEEDANCE_TEXT:
      return await ctx.runAction(
        internal.utils.fal.falVideoActions.seeDanceTextToVideo,
        {
          prompt: params.prompt || "",
          duration: String(params.duration || 5),
          resolution: (params.resolution || "720p") as
            | "1080p"
            | "720p"
            | "480p",
          aspect_ratio: (params.aspectRatio ||
            params.aspect_ratio ||
            "16:9") as
            | "16:9"
            | "1:1"
            | "9:16"
            | "4:3"
            | "3:4"
            | "21:9"
            | "9:21",
          camera_fixed: params.camera_fixed,
          seed: params.seed,
          apiKey: params.apiKey,
        },
      );

    case VIDEO_MODELS.SEEDANCE_IMAGE:
      return await ctx.runAction(
        internal.utils.fal.falVideoActions.seeDanceImageToVideo,
        {
          prompt: params.prompt || "",
          image_url: params.imageUrl || "",
          duration:
            typeof params.duration === "number"
              ? params.duration
              : parseInt(params.duration || "5"),
          resolution: (params.resolution || "720p") as "720p" | "480p",
          aspect_ratio: (params.aspectRatio ||
            params.aspect_ratio ||
            "16:9") as "16:9" | "1:1" | "9:16" | "4:3" | "3:4",
          camera_fixed: params.camera_fixed,
          seed: params.seed,
          apiKey: params.apiKey,
        },
      );

    case VIDEO_MODELS.LUCY_IMAGE:
      return await ctx.runAction(
        internal.utils.fal.falVideoActions.lucyImageToVideo,
        {
          prompt: params.prompt || "",
          image_url: params.imageUrl || "",
          aspect_ratio: (params.aspectRatio ||
            params.aspect_ratio ||
            "16:9") as "16:9" | "9:16",
          sync_mode: params.sync_mode === true, // Default false for URLs
          apiKey: params.apiKey,
        },
      );

    case VIDEO_MODELS.HAILUO_IMAGE:
      return await ctx.runAction(
        internal.utils.fal.falVideoActions.hailuoImageToVideo,
        {
          prompt: params.prompt || "",
          image_url: params.imageUrl || "",
          duration: String(params.duration || 6) as "6" | "10",
          prompt_optimizer: typeof params.prompt_optimizer === "boolean" ? params.prompt_optimizer : undefined,
          apiKey: params.apiKey,
        },
      );

    default:
      throw new Error(`Unknown model: ${modelName}`);
  }
}
