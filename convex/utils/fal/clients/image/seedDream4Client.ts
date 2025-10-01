"use node";

import { callFalModel } from "../falClient";
import { logger } from "../../../logger";

const logInfo = (...args: unknown[]) => logger.info(...args);
const logError = (...args: unknown[]) => logger.error(...args);

export interface SeedDream4Input {
  prompt: string;
  image_size?:
    | {
        width: number;
        height: number;
      }
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  num_images?: number;
  max_images?: number; // Number of images per generation (1-6)
  seed?: number;
  sync_mode?: boolean;
  enable_safety_checker?: boolean;
}

export interface SeedDream4Output {
  images: Array<{
    url: string;
    content_type: string;
    width?: number;
    height?: number;
    file_name?: string;
    file_size?: number;
  }>;
  timings?: {
    inference: number;
  };
  seed?: number;
  has_nsfw_concepts?: boolean[];
  prompt?: string;
}

export class SeedDream4Client {
  static readonly MODEL = "fal-ai/bytedance/seedream/v4/text-to-image";

  static async generateImage(
    input: SeedDream4Input,
  ): Promise<SeedDream4Output> {
    logInfo(`Generating image with Seed Dream 4 model`);
    logInfo(`Seed Dream 4 Parameters:`, {
      image_size: input.image_size,
      num_images: input.num_images || 1,
      max_images: input.max_images || 1,
      seed: input.seed,
      sync_mode: input.sync_mode || false,
      enable_safety_checker: input.enable_safety_checker ?? true,
    });

    try {
      logInfo(`Calling fal.ai model: ${this.MODEL}`);
      logInfo(`Input:`, input);

      const result = await callFalModel(
        this.MODEL,
        input as unknown as Record<string, unknown>,
      );

      logInfo(`✅ Success! Got result from ${this.MODEL}`);
      return result as SeedDream4Output;
    } catch (error) {
      logError(`❌ Error with Seed Dream 4 generation:`, error);
      throw error;
    }
  }
}
