"use node";

import { callFalModel } from "../falClient";
import {
  SeeDanceImageToVideoParams,
  SeeDanceTextToVideoParams,
  FalVideoResponse,
  FalVideo,
  FalResponse,
  FalContentPolicyError,
} from "../../types";
import { FAL_VIDEO_MODELS, VIDEO_SPEEDS } from "./videoModels";

/**
 * Generate a video from text using SeeDance v1 Lite
 *
 * @param params - Text-to-video generation parameters
 * @param apiKey - Optional FAL API key (uses env var if not provided)
 * @returns FalResponse with generated video or error
 *
 * Pricing: Varies by resolution and duration
 * Speed: Fast
 *
 * @example
 * const result = await generateSeeDanceTextToVideo({
 *   prompt: "A dog running in the sunshine through a garden",
 *   duration: "5",
 *   resolution: "720p"
 * });
 */
export async function generateSeeDanceTextToVideo(
  params: SeeDanceTextToVideoParams,
  apiKey?: string,
): Promise<FalResponse<FalVideoResponse>> {
  try {
    // Validate duration if provided
    if (params.duration) {
      const duration = parseInt(params.duration);
      if (duration < 3 || duration > 12) {
        throw new Error("Duration must be between 3 and 12 seconds");
      }
    }

    // Prepare input for FAL API
    const input = {
      prompt: params.prompt,
      aspect_ratio: params.aspect_ratio || "16:9",
      resolution: params.resolution || "720p",
      duration: params.duration || "5",
      camera_fixed: params.camera_fixed || false,
      enable_safety_checker: params.enable_safety_checker !== false,
      ...(params.seed && { seed: params.seed }),
    };

    console.log(`🎬 Generating video with SeeDance v1 Lite (text-to-video)...`);
    console.log(`📝 Prompt: "${params.prompt}"`);
    console.log(
      `⏱️  Duration: ${input.duration}s, Resolution: ${input.resolution}`,
    );

    // Calculate model-specific timeout: SeeDance max 30s → (30 * 2 + 60) * 1000 = 120s
    const timeoutMs = (VIDEO_SPEEDS.seedance.max * 2 + 60) * 1000;
    console.log(`⏰ Timeout: ${timeoutMs / 1000}s`);

    // Call the FAL model with timeout
    const result = await callFalModel<typeof input, { video: FalVideo }>(
      FAL_VIDEO_MODELS.SEEDANCE_TEXT_TO_VIDEO,
      input,
      apiKey,
      timeoutMs
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
    console.error("❌ Error in generateSeeDanceTextToVideo:", error);

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

/**
 * Generate a video using SeeDance v1 Lite (affordable and customizable)
 *
 * @param params - Image-to-video generation parameters
 * @param apiKey - Optional FAL API key (uses env var if not provided)
 * @returns FalResponse with generated video or error
 *
 * Pricing: $0.18 for 720p 5-second video
 * Speed: Fast
 *
 * @example
 * const result = await generateSeeDanceImageToVideo({
 *   prompt: "The scene comes alive with gentle motion and wind",
 *   image_url: "https://example.com/landscape.jpg",
 *   duration: 5,
 *   camera_fixed: true
 * });
 */
export async function generateSeeDanceImageToVideo(
  params: SeeDanceImageToVideoParams,
  apiKey?: string,
): Promise<FalResponse<FalVideoResponse>> {
  try {
    // Validate required image URL
    if (!params.image_url) {
      throw new Error("Image URL is required for SeeDance video generation");
    }

    // Prepare input for FAL API
    const input = {
      prompt: params.prompt,
      image_url: params.image_url,
      aspect_ratio: params.aspect_ratio || "16:9",
      resolution: params.resolution || "720p",
      duration: params.duration || 5,
      camera_fixed: params.camera_fixed || false,
      enable_safety_checker: params.enable_safety_checker !== false,
      ...(params.seed && { seed: params.seed }),
    };

    console.log(`🎬 Generating video with SeeDance v1 Lite...`);
    console.log(`🖼️  Source image: ${params.image_url}`);
    console.log(
      `⏱️  Duration: ${input.duration}s, Resolution: ${input.resolution}`,
    );
    console.log(
      `💸 Estimated cost: $${input.resolution === "720p" && input.duration === 5 ? "0.18" : "varies"}`,
    );

    // Calculate model-specific timeout: SeeDance max 30s → (30 * 2 + 60) * 1000 = 120s
    const timeoutMs = (VIDEO_SPEEDS.seedance.max * 2 + 60) * 1000;
    console.log(`⏰ Timeout: ${timeoutMs / 1000}s`);

    // Call the FAL model with timeout
    const result = await callFalModel<typeof input, { video: FalVideo }>(
      FAL_VIDEO_MODELS.SEEDANCE_IMAGE_TO_VIDEO,
      input,
      apiKey,
      timeoutMs
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
    console.error("❌ Error in generateSeeDanceImageToVideo:", error);

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