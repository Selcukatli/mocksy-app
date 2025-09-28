"use node";

import { callFalModel } from "../falClient";
import {
  FluxSrpoTextToImageParams,
  FluxSrpoImageToImageParams,
  FluxSrpoResponse,
  FalResponse,
  FalContentPolicyError,
} from "../../types";
import { FAL_IMAGE_MODELS } from "./imageModels";

/**
 * FLUX SRPO Client - 12 billion parameter flow transformer
 * Designed for high-quality image generation with exceptional aesthetic quality
 * Supports both text-to-image and image-to-image at $0.025 per megapixel
 *
 * Note on sync_mode:
 * - sync_mode: false (default) - Returns URLs to generated images (polling internally handled)
 * - sync_mode: true - Returns base64-encoded data URLs (faster response, larger payload)
 */
export class FluxSrpoClient {
  static readonly TEXT_TO_IMAGE_MODEL = FAL_IMAGE_MODELS.FLUX_SRPO_TEXT;
  static readonly IMAGE_TO_IMAGE_MODEL = FAL_IMAGE_MODELS.FLUX_SRPO_IMAGE;

  /**
   * Generate image from text using FLUX SRPO
   * @param params - Text-to-image generation parameters
   * @param apiKey - Optional FAL API key
   * @returns FalResponse with generated image or error
   */
  static async generateTextToImage(
    params: FluxSrpoTextToImageParams,
    apiKey?: string,
  ): Promise<FalResponse<FluxSrpoResponse>> {
    try {
      // Prepare input with defaults
      const input = {
        prompt: params.prompt,
        num_images: params.num_images || 1,
        acceleration: params.acceleration || "none",
        output_format: params.output_format || "jpeg",
        sync_mode: params.sync_mode !== undefined ? params.sync_mode : false, // Default to false to get URLs instead of base64
        guidance_scale: params.guidance_scale || 4.5,
        num_inference_steps: params.num_inference_steps || 40,
        seed: params.seed,
        enable_safety_checker: params.enable_safety_checker !== false,
      };

      console.log(`🎨 Generating image with FLUX SRPO (text-to-image)`);
      console.log(`📊 Parameters:`, {
        acceleration: input.acceleration,
        num_inference_steps: input.num_inference_steps,
        guidance_scale: input.guidance_scale,
      });

      const result = await callFalModel<typeof input, FluxSrpoResponse>(
        this.TEXT_TO_IMAGE_MODEL,
        input,
        apiKey,
      );

      if (!result) {
        return {
          success: false,
          error: {
            type: "api_error",
            message: "Failed to generate image - no result returned",
          },
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error("❌ Error in FLUX SRPO text-to-image:", error);

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
   * Transform an existing image using FLUX SRPO
   * @param params - Image-to-image generation parameters
   * @param apiKey - Optional FAL API key
   * @returns FalResponse with generated image or error
   */
  static async generateImageToImage(
    params: FluxSrpoImageToImageParams,
    apiKey?: string,
  ): Promise<FalResponse<FluxSrpoResponse>> {
    try {
      // Validate required image URL
      if (!params.image_url) {
        throw new Error("Image URL is required for image-to-image generation");
      }

      // Prepare input with defaults
      const input = {
        prompt: params.prompt,
        image_url: params.image_url,
        strength: params.strength || 0.95, // Higher values work better for SRPO
        num_images: params.num_images || 1,
        acceleration: params.acceleration || "none",
        output_format: params.output_format || "jpeg",
        sync_mode: params.sync_mode !== undefined ? params.sync_mode : false, // Default to false to get URLs instead of base64
        guidance_scale: params.guidance_scale || 4.5,
        num_inference_steps: params.num_inference_steps || 40,
        seed: params.seed,
        enable_safety_checker: params.enable_safety_checker !== false,
      };

      console.log(`🎨 Transforming image with FLUX SRPO (image-to-image)`);
      console.log(`🖼️ Source image: ${params.image_url}`);
      console.log(`📊 Parameters:`, {
        strength: input.strength,
        acceleration: input.acceleration,
        num_inference_steps: input.num_inference_steps,
        guidance_scale: input.guidance_scale,
      });

      const result = await callFalModel<typeof input, FluxSrpoResponse>(
        this.IMAGE_TO_IMAGE_MODEL,
        input,
        apiKey,
      );

      if (!result) {
        return {
          success: false,
          error: {
            type: "api_error",
            message: "Failed to transform image - no result returned",
          },
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error("❌ Error in FLUX SRPO image-to-image:", error);

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
   * Calculate cost for FLUX SRPO generation
   * @param width - Image width in pixels
   * @param height - Image height in pixels
   * @param numImages - Number of images to generate
   * @returns Estimated cost in USD
   */
  static calculateCost(
    width: number,
    height: number,
    numImages: number = 1,
  ): number {
    // FLUX SRPO costs $0.025 per megapixel
    const megapixels = Math.ceil((width * height) / 1_000_000);
    return megapixels * 0.025 * numImages;
  }
}
