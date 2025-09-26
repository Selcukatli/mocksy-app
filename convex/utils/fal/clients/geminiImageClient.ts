"use node";

import { callFalModel } from "./falImageClient";
import { logger } from "../../logger";

const logInfo = (...args: unknown[]) => logger.info(...args);
const logError = (...args: unknown[]) => logger.error(...args);

export interface GeminiFlashImageInput {
  prompt: string;
  num_images?: number;
  output_format?: "jpeg" | "png";
  sync_mode?: boolean;
}

export interface GeminiFlashEditInput extends GeminiFlashImageInput {
  image_url: string;
  image_urls?: string[];
}

export interface GeminiFlashImageOutput {
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

export class GeminiImageClient {
  static readonly FLASH_MODEL = "fal-ai/gemini-25-flash-image";
  static readonly FLASH_EDIT_MODEL = "fal-ai/gemini-25-flash-image/edit";
  static readonly FLASH_EDIT_OLD_MODEL = "fal-ai/gemini-flash-edit";

  static async generateFlashImage(
    input: GeminiFlashImageInput,
  ): Promise<GeminiFlashImageOutput> {
    logInfo(`Generating image with Gemini 2.5 Flash model`);
    logInfo(`Gemini Flash Parameters:`, {
      num_images: input.num_images || 1,
      output_format: input.output_format || "jpeg",
      sync_mode: input.sync_mode || false,
    });

    try {
      logInfo(`Calling fal.ai model: ${this.FLASH_MODEL}`);
      logInfo(`Input:`, input);

      const result = await callFalModel(
        this.FLASH_MODEL,
        input as unknown as Record<string, unknown>,
      );

      logInfo(`✅ Success! Got result from ${this.FLASH_MODEL}`);
      return result as GeminiFlashImageOutput;
    } catch (error) {
      logError(`❌ Error with Gemini Flash generation:`, error);
      throw error;
    }
  }

  static async editFlashImage(
    input: GeminiFlashEditInput,
  ): Promise<GeminiFlashImageOutput> {
    logInfo(`Editing image with Gemini 2.5 Flash Edit model`);
    logInfo(`Gemini Flash Edit Parameters:`, {
      num_images: input.num_images || 1,
      output_format: input.output_format || "jpeg",
      sync_mode: input.sync_mode || false,
      has_image_url: !!input.image_url,
      has_image_urls: !!input.image_urls,
    });

    try {
      logInfo(`Calling fal.ai model: ${this.FLASH_EDIT_MODEL}`);
      logInfo(`Input:`, input);

      const result = await callFalModel(
        this.FLASH_EDIT_MODEL,
        input as unknown as Record<string, unknown>,
      );

      logInfo(`✅ Success! Got result from ${this.FLASH_EDIT_MODEL}`);
      return result as GeminiFlashImageOutput;
    } catch (error) {
      logError(`❌ Error with Gemini Flash edit:`, error);
      throw error;
    }
  }

  static async editImage(
    input: GeminiFlashEditInput,
  ): Promise<GeminiFlashImageOutput> {
    logInfo(`Editing image with Gemini Flash Edit model (old)`);

    try {
      logInfo(`Calling fal.ai model: ${this.FLASH_EDIT_OLD_MODEL}`);
      logInfo(`Input:`, input);

      const result = await callFalModel(
        this.FLASH_EDIT_OLD_MODEL,
        input as unknown as Record<string, unknown>,
      );

      logInfo(`✅ Success! Got result from ${this.FLASH_EDIT_OLD_MODEL}`);
      return result as GeminiFlashImageOutput;
    } catch (error) {
      logError(`❌ Error with Gemini Flash edit:`, error);
      throw error;
    }
  }
}
