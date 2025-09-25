"use node";

import { callFalModel } from "./falImageClient";
import { logger } from "../../logger";

const logInfo = (...args: unknown[]) => logger.info(...args);
const logError = (...args: unknown[]) => logger.error(...args);

export interface NanoBananaInput {
  prompt: string;
  num_images?: number;
  output_format?: "jpeg" | "png";
  sync_mode?: boolean;
}

export interface NanoBananaEditInput extends NanoBananaInput {
  image_url: string;
}

export interface NanoBananaOutput {
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

export class NanoBananaClient {
  static readonly TEXT_MODEL = "fal-ai/nano-banana";
  static readonly EDIT_MODEL = "fal-ai/nano-banana/edit";

  static async generateImage(input: NanoBananaInput): Promise<NanoBananaOutput> {
    logInfo(`Generating image with Nano Banana model`);
    logInfo(`Nano Banana Parameters:`, {
      num_images: input.num_images || 1,
      output_format: input.output_format || "jpeg",
      sync_mode: input.sync_mode || false,
    });

    try {
      logInfo(`Calling fal.ai model: ${this.TEXT_MODEL}`);
      logInfo(`Input:`, input);

      const result = await callFalModel(this.TEXT_MODEL, input as unknown as Record<string, unknown>);

      logInfo(`✅ Success! Got result from ${this.TEXT_MODEL}`);
      return result as NanoBananaOutput;
    } catch (error) {
      logError(`❌ Error with Nano Banana generation:`, error);
      throw error;
    }
  }

  static async editImage(input: NanoBananaEditInput): Promise<NanoBananaOutput> {
    logInfo(`Editing image with Nano Banana Edit model`);
    logInfo(`Nano Banana Edit Parameters:`, {
      num_images: input.num_images || 1,
      output_format: input.output_format || "jpeg",
      sync_mode: input.sync_mode || false,
      has_image_url: !!input.image_url,
    });

    try {
      logInfo(`Calling fal.ai model: ${this.EDIT_MODEL}`);
      logInfo(`Input:`, input);

      const result = await callFalModel(this.EDIT_MODEL, input as unknown as Record<string, unknown>);

      logInfo(`✅ Success! Got result from ${this.EDIT_MODEL}`);
      return result as NanoBananaOutput;
    } catch (error) {
      logError(`❌ Error with Nano Banana edit:`, error);
      throw error;
    }
  }
}