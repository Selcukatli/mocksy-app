"use node";

import { callFalModel } from "../falClient";
import {
  GptTextToImageParams,
  GptEditImageParams,
  GptImageResponse,
  FalResponse,
  FalContentPolicyError,
  FalValidationError,
  FalAPIError,
} from "../../types";

/**
 * Get OpenAI API key from environment variable
 */
function getOpenAIKey(): string {
  const envKey = process.env.OPENAI_API_KEY as string;
  if (!envKey) {
    throw new Error(
      "OpenAI API key is required for GPT Image models. " +
        "Please set OPENAI_API_KEY environment variable.",
    );
  }

  return envKey;
}

/**
 * Handle GPT Image errors and return structured response
 */
function handleGptImageError(error: unknown): FalResponse<GptImageResponse> {
  if (error instanceof FalContentPolicyError) {
    console.error(`🚫 Content policy violation: ${error.message}`);
    return {
      success: false,
      error: {
        type: "content_policy_violation",
        message: error.message,
        rejectedPrompt: error.rejectedPrompt,
        suggestion:
          "Try rephrasing your prompt to avoid copyrighted characters or potentially sensitive content.",
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
 * Generate text-to-image using GPT Image models
 * Handles OpenAI API key management and structured error responses
 */
export async function generateGptTextToImage(
  params: GptTextToImageParams,
): Promise<FalResponse<GptImageResponse>> {
  try {
    const { prompt, quality, image_size, ...options } = params;
    const resolvedOpenAIKey = getOpenAIKey();

    // Build input object with required OpenAI API key
    const input: Record<string, unknown> = {
      prompt,
      quality,
      image_size,
      openai_api_key: resolvedOpenAIKey,
    };

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        input[key] = value;
      }
    });

    console.log(`Generating with GPT Image text-to-image model`);
    console.log(`GPT Parameters:`, { quality, image_size });

    const result = await callFalModel<
      Record<string, unknown>,
      GptImageResponse
    >("fal-ai/gpt-image-1/text-to-image/byok", input);

    if (!result) {
      return {
        success: false,
        error: {
          type: "api_error",
          message: "No result returned from GPT Image API",
        },
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return handleGptImageError(error);
  }
}

/**
 * Edit image using GPT Image models
 * Handles OpenAI API key management and structured error responses
 */
export async function editImageWithGpt(
  params: GptEditImageParams,
): Promise<FalResponse<GptImageResponse>> {
  try {
    const { prompt, image_urls, quality, image_size, ...options } = params;
    const resolvedOpenAIKey = getOpenAIKey();

    // Build input object with required OpenAI API key and image
    const input: Record<string, unknown> = {
      prompt,
      image_urls, // GPT Image edit API expects an array
      quality,
      image_size,
      openai_api_key: resolvedOpenAIKey,
    };

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        input[key] = value;
      }
    });

    console.log(`Generating with GPT Image edit model`);
    console.log(`GPT Parameters:`, { quality, image_size });

    const result = await callFalModel<
      Record<string, unknown>,
      GptImageResponse
    >("fal-ai/gpt-image-1/edit-image/byok", input);

    if (!result) {
      return {
        success: false,
        error: {
          type: "api_error",
          message: "No result returned from GPT Image API",
        },
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return handleGptImageError(error);
  }
}
