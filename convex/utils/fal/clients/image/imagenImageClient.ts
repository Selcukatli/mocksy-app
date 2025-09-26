"use node";

import { callFalModel } from "../falClient";
import {
  ImagenTextToImageParams,
  FalTextToImageResponse,
  FalResponse,
  FalContentPolicyError,
  FalValidationError,
  FalAPIError,
} from "../../types";

/**
 * Handle Imagen4 errors and return structured response
 */
function handleImagenError(
  error: unknown,
): FalResponse<FalTextToImageResponse> {
  if (error instanceof FalContentPolicyError) {
    console.error(`🚫 Content policy violation: ${error.message}`);
    return {
      success: false,
      error: {
        type: "content_policy_violation",
        message: error.message,
        rejectedPrompt: error.rejectedPrompt,
        suggestion:
          "Try rephrasing your prompt to avoid potentially sensitive content.",
        helpUrl: error.url,
      },
    };
  } else if (error instanceof FalValidationError) {
    console.error(`❌ Validation error: ${error.message}`);
    return {
      success: false,
      error: {
        type: "validation_error",
        message: error.message,
        details: error.details,
      },
    };
  } else if (error instanceof FalAPIError) {
    console.error(`❌ API error: ${error.message}`);
    return {
      success: false,
      error: {
        type: "api_error",
        message: error.message,
        status: error.status,
      },
    };
  } else {
    console.error(`❌ Unknown error:`, error);
    return {
      success: false,
      error: {
        type: "unknown_error",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
    };
  }
}

/**
 * Generate text-to-image using Google's Imagen4 model
 * Handles Imagen4-specific parameter mapping and structured error responses
 */
export async function generateImagenTextToImage(
  params: ImagenTextToImageParams,
): Promise<FalResponse<FalTextToImageResponse>> {
  try {
    const {
      prompt,
      aspect_ratio,
      negative_prompt = "",
      num_images = 1,
      ...options
    } = params;

    // Build input object for Imagen4
    const input: Record<string, unknown> = {
      prompt,
      negative_prompt,
      aspect_ratio,
      num_images,
    };

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        input[key] = value;
      }
    });

    console.log(`Generating with Google Imagen4 model`);
    console.log(`Imagen4 Parameters:`, {
      aspect_ratio,
      num_images,
      has_negative_prompt: negative_prompt.length > 0,
    });

    const result = await callFalModel<
      Record<string, unknown>,
      FalTextToImageResponse
    >("fal-ai/imagen4/preview", input);

    if (!result) {
      return {
        success: false,
        error: {
          type: "api_error",
          message: "No result returned from Imagen4 API",
        },
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return handleImagenError(error);
  }
}
