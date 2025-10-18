"use node";

import { callFalModel } from "../falClient";
import {
  FalVideoResponse,
  FalVideo,
  FalResponse,
  FalContentPolicyError,
} from "../../types";
import { FAL_VIDEO_MODELS } from "./videoModels";

/**
 * Parameters for Hailuo-02 Fast Image-to-Video generation
 */
export interface HailuoImageToVideoParams {
  prompt: string; // Max 2000 characters
  image_url: string; // Required - source image
  duration?: "6" | "10"; // Duration in seconds, default "6"
  prompt_optimizer?: boolean; // Whether to use prompt optimizer, default true
}

/**
 * Generate a video using Minimax Hailuo-02 Fast (FAST & ECONOMICAL)
 *
 * @param params - Image-to-video generation parameters
 * @param apiKey - Optional FAL API key (uses env var if not provided)
 * @returns FalResponse with generated video or error
 *
 * Pricing: ~$0.017 per second
 * - 6 seconds: ~$0.10
 * - 10 seconds: ~$0.17
 *
 * Resolution: 512p (economical quality)
 * Speed: Blazing fast (~15-25s typical generation time)
 *
 * @example
 * const result = await generateHailuoImageToVideo({
 *   prompt: "Extremely realistic movement. An old samurai is breaking a stone in half",
 *   image_url: "https://example.com/samurai.jpg",
 *   duration: "6"
 * });
 */
export async function generateHailuoImageToVideo(
  params: HailuoImageToVideoParams,
  apiKey?: string,
): Promise<FalResponse<FalVideoResponse>> {
  try {
    // Validate prompt length
    if (params.prompt.length > 2000) {
      throw new Error("Prompt exceeds maximum length of 2000 characters");
    }

    // Validate required image URL
    if (!params.image_url) {
      throw new Error("Image URL is required for Hailuo video generation");
    }

    // Prepare input for FAL API
    const input = {
      prompt: params.prompt,
      image_url: params.image_url,
      duration: params.duration || "6",
      prompt_optimizer: params.prompt_optimizer !== false, // Default true
    };

    const durationNum = parseInt(input.duration);
    const estimatedCost = (durationNum * 0.017).toFixed(2);

    console.log(`🎬 Generating video with Hailuo-02 Fast (economical)...`);
    console.log(`🖼️  Source image: ${params.image_url}`);
    console.log(`⏱️  Duration: ${durationNum}s`);
    console.log(`💸 Estimated cost: $${estimatedCost}`);

    // Call the FAL model
    const result = await callFalModel<typeof input, { video: FalVideo }>(
      FAL_VIDEO_MODELS.HAILUO_IMAGE_TO_VIDEO,
      input,
      apiKey,
    );

    if (!result) {
      return {
        success: false,
        error: {
          type: "api_error",
          message: "Failed to generate video - no result returned",
        },
      };
    }

    // Return successful response
    return {
      success: true,
      data: {
        video: result.video,
        prompt: params.prompt,
      },
    };
  } catch (error) {
    console.error("❌ Error in generateHailuoImageToVideo:", error);

    // Handle specific error types
    if (error instanceof FalContentPolicyError) {
      return {
        success: false,
        error: {
          type: "content_policy_violation",
          message: error.message,
          rejectedPrompt: error.rejectedPrompt,
          suggestion:
            "Try modifying your prompt to avoid potentially sensitive content",
          helpUrl: error.url,
        },
      };
    }

    // Generic error response
    return {
      success: false,
      error: {
        type: "api_error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      },
    };
  }
}

