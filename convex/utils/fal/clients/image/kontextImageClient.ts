"use node";

import { callFalModel } from "../falClient";
import {
  KontextEditImageParams,
  KontextMultiEditImageParams,
  KontextModel,
  FalTextToImageResponse,
} from "../../types";
import { FAL_IMAGE_MODELS } from "./imageModels";

/**
 * Map Kontext model name to fal.ai endpoint
 */
function getKontextModelEndpoint(model: KontextModel): string {
  switch (model) {
    case "pro":
      return FAL_IMAGE_MODELS.KONTEXT_PRO;
    case "max":
      return FAL_IMAGE_MODELS.KONTEXT_MAX;
    default:
      return FAL_IMAGE_MODELS.KONTEXT_PRO; // Default to pro
  }
}

/**
 * Edit image using FLUX Kontext models
 * Handles Kontext-specific endpoint routing and parameter mapping
 */
export async function editImageWithKontext(
  params: KontextEditImageParams,
): Promise<FalTextToImageResponse | null> {
  const {
    prompt,
    image_url,
    aspect_ratio,
    model,
    guidance_scale = 3.5,
    num_images = 1,
    safety_tolerance = "5",
    output_format = "jpeg",
    ...options
  } = params;

  const modelEndpoint = getKontextModelEndpoint(model);

  // Build input object for FLUX Kontext image editing
  const input: Record<string, unknown> = {
    prompt,
    image_url,
    aspect_ratio,
    guidance_scale,
    num_images,
    safety_tolerance,
    output_format,
  };

  // Add optional parameters if provided
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined) {
      input[key] = value;
    }
  });

  console.log(
    `Editing image with FLUX Kontext ${model} model (${modelEndpoint})`,
  );
  console.log(`Kontext Parameters:`, {
    model,
    aspect_ratio,
    guidance_scale,
    num_images,
    safety_tolerance,
    output_format,
  });

  return await callFalModel<Record<string, unknown>, FalTextToImageResponse>(
    modelEndpoint,
    input,
  );
}

/**
 * Edit multiple images using FLUX Kontext Max Multi model
 * Supports editing with multiple input images for more complex compositions
 * Only available with the Max model
 */
export async function editImageWithKontextMulti(
  params: KontextMultiEditImageParams,
): Promise<FalTextToImageResponse | null> {
  const {
    prompt,
    image_urls,
    aspect_ratio,
    guidance_scale = 3.5,
    num_images = 1,
    safety_tolerance = "2",
    output_format = "jpeg",
    ...options
  } = params;

  // Multi-image editing is only available with the Max model
  const modelEndpoint = "fal-ai/flux-pro/kontext/max/multi";

  // Build input object for FLUX Kontext Multi image editing
  const input: Record<string, unknown> = {
    prompt,
    image_urls,
    aspect_ratio,
    guidance_scale,
    num_images,
    safety_tolerance,
    output_format,
  };

  // Add optional parameters if provided
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined) {
      input[key] = value;
    }
  });

  console.log(
    `Editing ${image_urls.length} images with FLUX Kontext Max Multi model`,
  );
  console.log(`Kontext Multi Parameters:`, {
    imageCount: image_urls.length,
    aspect_ratio,
    guidance_scale,
    num_images,
    safety_tolerance,
    output_format,
  });

  return await callFalModel<Record<string, unknown>, FalTextToImageResponse>(
    modelEndpoint,
    input,
  );
}
