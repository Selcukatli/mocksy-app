"use node";

import { callFalModel } from "../falClient";
import {
  KlingTextToVideoParams,
  KlingImageToVideoParams,
  FalVideoResponse,
  FalVideo,
  FalResponse,
  FalContentPolicyError,
} from "../../types";
import { FAL_VIDEO_MODELS, VIDEO_SPEEDS } from "./videoModels";

/**
 * Generate a video from text using Kling Video v2.5 Turbo Pro
 *
 * @param params - Text-to-video generation parameters
 * @param apiKey - Optional FAL API key (uses env var if not provided)
 * @returns FalResponse with generated video or error
 *
 * Pricing:
 * - 5-second video: $0.35
 * - 10-second video: $0.70 ($0.35 + $0.35)
 *
 * @example
 * const result = await generateKlingTextToVideo({
 *   prompt: "A majestic eagle soaring through mountain clouds at sunset",
 *   duration: 5,
 *   aspect_ratio: "16:9"
 * });
 */
export async function generateKlingTextToVideo(
  params: KlingTextToVideoParams,
  apiKey?: string,
): Promise<FalResponse<FalVideoResponse>> {
  try {
    // Validate prompt length
    if (params.prompt.length > 2500) {
      throw new Error("Prompt exceeds maximum length of 2500 characters");
    }

    // Prepare input for FAL API
    const input = {
      prompt: params.prompt,
      duration: params.duration || 5,
      aspect_ratio: params.aspect_ratio || "16:9",
      negative_prompt:
        params.negative_prompt || "blur, distort, and low quality",
      cfg_scale: params.cfg_scale || 0.5,
      ...(params.image_url && { image_url: params.image_url }),
    };

    console.log(`🎬 Generating ${input.duration}s video from text prompt...`);
    console.log(
      `💸 Estimated cost: $${input.duration === 5 ? "0.35" : "0.70"}`,
    );

    // Calculate model-specific timeout: Kling max 60s → (60 * 2 + 60) * 1000 = 180s
    const timeoutMs = (VIDEO_SPEEDS.kling.max * 2 + 60) * 1000;
    console.log(`⏰ Timeout: ${timeoutMs / 1000}s`);

    // Call the FAL model with timeout
    const result = await callFalModel<typeof input, { video: FalVideo }>(
      FAL_VIDEO_MODELS.KLING_TEXT_TO_VIDEO,
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
    console.error("❌ Error in generateKlingTextToVideo:", error);

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
 * Generate a video from an image using Kling Video v2.5 Turbo Pro
 *
 * @param params - Image-to-video generation parameters
 * @param apiKey - Optional FAL API key (uses env var if not provided)
 * @returns FalResponse with generated video or error
 *
 * Pricing:
 * - 5-second video: $0.35
 * - 10-second video: $0.70 ($0.35 + $0.35)
 *
 * @example
 * const result = await generateKlingImageToVideo({
 *   prompt: "The car speeds forward, leaving trails of motion blur",
 *   image_url: "https://example.com/car.jpg",
 *   duration: 5
 * });
 */
export async function generateKlingImageToVideo(
  params: KlingImageToVideoParams,
  apiKey?: string,
): Promise<FalResponse<FalVideoResponse>> {
  try {
    // Validate required image URL
    if (!params.image_url) {
      throw new Error("Image URL is required for image-to-video generation");
    }

    // Prepare input for FAL API
    const input = {
      prompt: params.prompt,
      image_url: params.image_url,
      duration: params.duration || 5,
      negative_prompt:
        params.negative_prompt || "blur, distort, and low quality",
      cfg_scale: params.cfg_scale || 0.5,
    };

    console.log(`🎬 Generating ${input.duration}s video from image...`);
    console.log(`🖼️  Source image: ${params.image_url}`);
    console.log(
      `💸 Estimated cost: $${input.duration === 5 ? "0.35" : "0.70"}`,
    );

    // Calculate model-specific timeout: Kling max 60s → (60 * 2 + 60) * 1000 = 180s
    const timeoutMs = (VIDEO_SPEEDS.kling.max * 2 + 60) * 1000;
    console.log(`⏰ Timeout: ${timeoutMs / 1000}s`);

    // Call the FAL model with timeout
    const result = await callFalModel<typeof input, { video: FalVideo }>(
      FAL_VIDEO_MODELS.KLING_IMAGE_TO_VIDEO,
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
    console.error("❌ Error in generateKlingImageToVideo:", error);

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
