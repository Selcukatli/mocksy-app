"use node";

import { callFalModel } from "../falClient";
import { logger } from "../../../logger";
import { FAL_IMAGE_MODELS } from "./imageModels";

const logInfo = (...args: unknown[]) => logger.info(...args);
const logError = (...args: unknown[]) => logger.error(...args);

export interface FluxProUltraInput {
  prompt: string;
  aspect_ratio?: string;
  enhance_prompt?: boolean;
  num_images?: number;
  output_format?: "jpeg" | "png";
  sync_mode?: boolean;
  safety_tolerance?: "1" | "2" | "3" | "4" | "5" | "6";
  enable_safety_checker?: boolean;
  seed?: number;
  raw?: boolean;
}

export interface FluxProUltraOutput {
  images: Array<{
    url: string;
    content_type: string;
    width: number;
    height: number;
  }>;
  timings: {
    inference: number;
  };
  seed: number;
  has_nsfw_concepts: boolean[];
  prompt: string;
}

export class FluxProUltraClient {
  static readonly MODEL = FAL_IMAGE_MODELS.FLUX_PRO_ULTRA;

  static async generateImage(
    input: FluxProUltraInput,
  ): Promise<FluxProUltraOutput> {
    logInfo(`Generating image with FLUX Pro Ultra v1.1 model`);
    logInfo(`FLUX Pro Ultra Parameters:`, {
      aspect_ratio: input.aspect_ratio || "16:9",
      enhance_prompt: input.enhance_prompt || false,
      num_images: input.num_images || 1,
      output_format: input.output_format || "jpeg",
      safety_tolerance: input.safety_tolerance || "2",
      enable_safety_checker: input.enable_safety_checker !== false,
      raw: input.raw || false,
    });

    try {
      logInfo(`Calling fal.ai model: ${this.MODEL}`);
      logInfo(`Input:`, input);

      const result = await callFalModel(this.MODEL, {
        ...input,
        aspect_ratio: input.aspect_ratio || "16:9",
        safety_tolerance: input.safety_tolerance || "2",
        enable_safety_checker: input.enable_safety_checker !== false,
        sync_mode: input.sync_mode !== undefined ? input.sync_mode : false, // Default to false for URLs
      } as unknown as Record<string, unknown>);

      logInfo(`✅ Success! Got result from ${this.MODEL}`);
      return result as FluxProUltraOutput;
    } catch (error) {
      logError(`❌ Error with FLUX Pro Ultra generation:`, error);
      throw error;
    }
  }
}
