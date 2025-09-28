"use node";

import { callFalModel } from "../falClient";
import { logger } from "../../../logger";

const logInfo = (...args: unknown[]) => logger.info(...args);
const logError = (...args: unknown[]) => logger.error(...args);

export interface QwenImageInput {
  prompt: string;
  num_images?: number;
  image_size?:
    | string
    | "landscape_4_3"
    | "portrait_3_4"
    | "square"
    | "square_hd"
    | "landscape_16_9"
    | "portrait_9_16";
  acceleration?: "none" | "regular" | "high";
  output_format?: "jpeg" | "png";
  sync_mode?: boolean;
  loras?: Array<{
    url: string;
    scale?: number;
  }>;
  guidance_scale?: number;
  num_inference_steps?: number;
  seed?: number;
  negative_prompt?: string;
  enable_safety_checker?: boolean;
}

export interface QwenImageEditInput extends QwenImageInput {
  image_url: string;
}

export interface QwenImageOutput {
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

export class QwenImageClient {
  static readonly TEXT_MODEL = "fal-ai/qwen-image";
  static readonly EDIT_MODEL = "fal-ai/qwen-image-edit-plus";

  static async generateImage(input: QwenImageInput): Promise<QwenImageOutput> {
    logInfo(`Generating image with Qwen Image model`);
    logInfo(`Qwen Parameters:`, {
      num_images: input.num_images || 1,
      image_size: input.image_size || "landscape_4_3",
      acceleration: input.acceleration || "none",
      output_format: input.output_format || "png",
      guidance_scale: input.guidance_scale || 2.5,
      num_inference_steps: input.num_inference_steps || 30,
      enable_safety_checker: input.enable_safety_checker !== false,
    });

    try {
      logInfo(`Calling fal.ai model: ${this.TEXT_MODEL}`);
      logInfo(`Input:`, input);

      const result = await callFalModel(this.TEXT_MODEL, {
        ...input,
        sync_mode: input.sync_mode !== undefined ? input.sync_mode : false, // Default to false for URLs
        negative_prompt: input.negative_prompt || " ",
      } as unknown as Record<string, unknown>);

      logInfo(`✅ Success! Got result from ${this.TEXT_MODEL}`);
      return result as QwenImageOutput;
    } catch (error) {
      logError(`❌ Error with Qwen Image generation:`, error);
      throw error;
    }
  }

  static async editImage(input: QwenImageEditInput): Promise<QwenImageOutput> {
    logInfo(`Editing image with Qwen Image Edit Plus model`);
    logInfo(`Qwen Edit Parameters:`, {
      num_images: input.num_images || 1,
      image_size: input.image_size || "square_hd",
      acceleration: input.acceleration || "regular",
      output_format: input.output_format || "png",
      guidance_scale: input.guidance_scale || 4,
      num_inference_steps: input.num_inference_steps || 50,
      enable_safety_checker: input.enable_safety_checker !== false,
    });

    try {
      logInfo(`Calling fal.ai model: ${this.EDIT_MODEL}`);
      logInfo(`Input:`, input);

      const result = await callFalModel(this.EDIT_MODEL, {
        ...input,
        sync_mode: input.sync_mode !== undefined ? input.sync_mode : false, // Default to false for URLs
        image_size: input.image_size || "square_hd",
        acceleration: input.acceleration || "regular",
        guidance_scale: input.guidance_scale || 4,
        num_inference_steps: input.num_inference_steps || 50,
        negative_prompt: input.negative_prompt || " ",
      } as unknown as Record<string, unknown>);

      logInfo(`✅ Success! Got result from ${this.EDIT_MODEL}`);
      return result as QwenImageOutput;
    } catch (error) {
      logError(`❌ Error with Qwen Image edit:`, error);
      throw error;
    }
  }
}
