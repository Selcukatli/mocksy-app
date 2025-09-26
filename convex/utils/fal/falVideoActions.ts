"use node";

import { action } from "../../_generated/server";
import { v } from "convex/values";
import { FalErrorResponse } from "./types";

// Import video generation clients
import {
  generateKlingTextToVideo,
  generateKlingImageToVideo,
} from "./clients/klingVideoClient";
import {
  generateLucyImageToVideo,
  generateSeeDanceImageToVideo,
  generateSeeDanceTextToVideo,
} from "./clients/fastVideoClient";

// Convex validators for Kling Video enums
const klingVideoAspectRatioValidator = v.union(
  v.literal("16:9"),
  v.literal("9:16"),
  v.literal("1:1")
);

const klingVideoDurationValidator = v.union(
  v.literal(5),
  v.literal(10)
);

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
export const klingTextToVideo = action({
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
        args.apiKey
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
        error: error instanceof Error ? error.message : "Unexpected error occurred",
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
export const klingImageToVideo = action({
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
        args.apiKey
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
        error: error instanceof Error ? error.message : "Unexpected error occurred",
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
 * - sync_mode: true (default) - Returns base64 encoded video data
 * - sync_mode: false - Returns a hosted URL
 *
 * @example
 * // Get base64 encoded video (default, faster)
 * await ctx.runAction(api.utils.fal.falVideoActions.lucyImageToVideo, {
 *   prompt: "The person starts dancing with energetic movements",
 *   image_url: "https://example.com/person.jpg"
 * });
 *
 * @example
 * // Get hosted URL
 * await ctx.runAction(api.utils.fal.falVideoActions.lucyImageToVideo, {
 *   prompt: "The person starts dancing with energetic movements",
 *   image_url: "https://example.com/person.jpg",
 *   sync_mode: false
 * });
 */
export const lucyImageToVideo = action({
  args: {
    prompt: v.string(), // Max 1500 characters
    image_url: v.string(), // Required - source image
    aspect_ratio: v.optional(v.union(v.literal("16:9"), v.literal("9:16"))), // Default: "16:9"
    sync_mode: v.optional(v.boolean()), // Default: true for speed
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
        args.apiKey
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
        error: error instanceof Error ? error.message : "Unexpected error occurred",
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
export const seeDanceImageToVideo = action({
  args: {
    prompt: v.string(), // Text description
    image_url: v.string(), // Required - source image
    aspect_ratio: v.optional(
      v.union(
        v.literal("16:9"),
        v.literal("9:16"),
        v.literal("4:3"),
        v.literal("3:4"),
        v.literal("1:1")
      )
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
    console.log(`Duration: ${args.duration || 5}s, Resolution: ${args.resolution || "720p"}`);

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
        args.apiKey
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
        error: error instanceof Error ? error.message : "Unexpected error occurred",
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
export const seeDanceTextToVideo = action({
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
        v.literal("9:21")
      )
    ), // Default: "16:9"
    resolution: v.optional(v.union(v.literal("480p"), v.literal("720p"), v.literal("1080p"))), // Default: "720p"
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
    console.log(`Duration: ${args.duration || "5"}s, Resolution: ${args.resolution || "720p"}`);

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
        args.apiKey
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
        error: error instanceof Error ? error.message : "Unexpected error occurred",
        errorType: "unexpected_error",
      };
    }
  },
});