"use node";

import { callFalModel } from "../falClient";
import {
  LucyImageToVideoParams,
  FalVideoResponse,
  FalVideo,
  FalResponse,
  FalContentPolicyError,
} from "../../types";
import { FAL_VIDEO_MODELS, VIDEO_SPEEDS } from "./videoModels";

/**
 * Generate a video using Lucy-14b (fast and affordable)
 *
 * @param params - Image-to-video generation parameters
 * @param apiKey - Optional FAL API key (uses env var if not provided)
 * @returns FalResponse with generated video or error
 *
 * Pricing: $0.08 per second of generated video
 * Speed: Lightning fast
 *
 * Output Format:
 * - sync_mode: false (default) - Returns a hosted URL (https://v3b.fal.media/...)
 * - sync_mode: true - Returns base64 encoded video data (faster but larger response)
 *
 * @example
 * // Get hosted URL (default, recommended)
 * const result = await generateLucyImageToVideo({
 *   prompt: "The person starts dancing with smooth movements",
 *   image_url: "https://example.com/person.jpg",
 *   aspect_ratio: "16:9"
 * });
 *
 * @example
 * // Get base64 encoded video (if needed for direct processing)
 * const result = await generateLucyImageToVideo({
 *   prompt: "The person starts dancing with smooth movements",
 *   image_url: "https://example.com/person.jpg",
 *   sync_mode: true
 * });
 */
export async function generateLucyImageToVideo(
  params: LucyImageToVideoParams,
  apiKey?: string,
): Promise<FalResponse<FalVideoResponse>> {
  try {
    // Validate prompt length
    if (params.prompt.length > 1500) {
      throw new Error("Prompt exceeds maximum length of 1500 characters");
    }

    // Validate required image URL
    if (!params.image_url) {
      throw new Error("Image URL is required for Lucy-14b video generation");
    }

    // Prepare input for FAL API
    const input = {
      prompt: params.prompt,
      image_url: params.image_url,
      resolution: params.resolution || "720p",
      aspect_ratio: params.aspect_ratio || "16:9",
      sync_mode: params.sync_mode === true, // Default false to return URLs
    };

    console.log(`🚀 Generating video with Lucy-14b (fast model)...`);
    console.log(`🖼️  Source image: ${params.image_url}`);
    console.log(`💸 Estimated cost: ~$0.08-0.40 depending on duration`);

    // Calculate model-specific timeout: Lucy max 30s → (30 * 2 + 60) * 1000 = 120s
    const timeoutMs = (VIDEO_SPEEDS.lucy.max * 2 + 60) * 1000;
    console.log(`⏰ Timeout: ${timeoutMs / 1000}s`);

    // Call the FAL model with timeout
    const result = await callFalModel<typeof input, { video: FalVideo }>(
      FAL_VIDEO_MODELS.LUCY_IMAGE_TO_VIDEO,
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
    // Note: Lucy-14b may not return duration/dimensions
    return {
      success: true,
      data: {
        video: result.video,
        prompt: params.prompt,
      },
    };
  } catch (error) {
    console.error("❌ Error in generateLucyImageToVideo:", error);

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