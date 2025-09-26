"use node";

import { callFalModel } from "./falImageClient";
import {
  FluxTextToImageParams,
  FluxModel,
  FalTextToImageResponse,
} from "../types";

/**
 * Map FLUX model name to fal.ai endpoint
 */
function getFluxModelEndpoint(model: FluxModel): string {
  switch (model) {
    case "schnell":
      return "fal-ai/flux-1/schnell";
    case "dev":
      return "fal-ai/flux-1/dev";
    case "pro":
      return "fal-ai/flux-pro/new";
    default:
      return "fal-ai/flux-1/dev"; // Default to dev
  }
}

/**
 * Handle safety settings based on FLUX model type
 */
function configureSafetySettings(
  model: FluxModel,
  enable_safety_checker?: boolean,
  safety_tolerance?: string,
): Record<string, unknown> {
  if (model === "pro") {
    // FLUX Pro uses safety_tolerance instead of enable_safety_checker
    if (safety_tolerance !== undefined) {
      return { safety_tolerance };
    }
    // Convert enable_safety_checker to safety_tolerance for Pro model
    // false → "5" (most permissive), true → "2" (default)
    return { safety_tolerance: enable_safety_checker ? "2" : "5" };
  } else {
    // FLUX Schnell/Dev uses enable_safety_checker
    return { enable_safety_checker: enable_safety_checker ?? false };
  }
}

/**
 * Generate text-to-image using FLUX models
 * Handles model-specific endpoint routing and parameter mapping
 */
export async function generateFluxTextToImage(
  params: FluxTextToImageParams,
): Promise<FalTextToImageResponse | null> {
  const {
    prompt,
    model = "dev",
    enable_safety_checker,
    safety_tolerance,
    ...options
  } = params;

  const modelEndpoint = getFluxModelEndpoint(model);

  // Build input object with FLUX-specific parameters
  const input: Record<string, unknown> = { prompt };

  // Configure safety settings based on model type
  const safetySettings = configureSafetySettings(
    model,
    enable_safety_checker,
    safety_tolerance,
  );
  Object.assign(input, safetySettings);

  // Add optional parameters
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined) {
      input[key] = value;
    }
  });

  console.log(`Generating with FLUX model: ${model} (${modelEndpoint})`);
  console.log(`FLUX Parameters:`, {
    model,
    image_size: options.image_size,
    safety_setting:
      model === "pro"
        ? `safety_tolerance: ${safetySettings.safety_tolerance}`
        : `enable_safety_checker: ${safetySettings.enable_safety_checker}`,
  });

  return await callFalModel<Record<string, unknown>, FalTextToImageResponse>(
    modelEndpoint,
    input,
  );
}
