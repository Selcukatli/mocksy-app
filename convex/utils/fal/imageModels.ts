// Business logic configuration for FAL image model selection
// Defines model chains based on quality, speed, and cost priorities

import {
  FluxModel,
  GptImageQuality,
  GptImageSize,
  ImagenAspectRatio,
  KontextModel,
  KontextAspectRatio,
} from "./types";

/**
 * FAL Image Model Identifiers - Use these exact strings when working with FAL
 * These match FAL's official model endpoints
 */
export const FAL_IMAGE_MODELS = {
  // Text-to-Image Models
  FLUX_PRO_ULTRA: "fal-ai/flux-pro/v1.1-ultra",
  FLUX_SRPO_TEXT: "fal-ai/flux/srpo", // High-quality with SRPO optimization
  FLUX_DEV: "fal-ai/flux/dev",
  FLUX_SCHNELL: "fal-ai/flux/schnell",
  GPT_4O_TEXT_TO_IMAGE: "fal-ai/gpt-4o/text-to-image",
  IMAGEN4_PREVIEW: "fal-ai/imagen4/preview/text-to-image",
  GEMINI_FLASH: "fal-ai/gemini-flash/text-to-image",
  QWEN_TEXT: "fal-ai/qwen/text-to-image",

  // Image-to-Image Models (Editing)
  FLUX_SRPO_IMAGE: "fal-ai/flux/srpo/image-to-image", // SRPO image transformation
  KONTEXT_PRO: "fal-ai/flux-pro/kontext",
  KONTEXT_MAX: "fal-ai/flux-pro/kontext/max",
  GPT_4O_EDIT: "fal-ai/gpt-4o/edit-image",
  GEMINI_FLASH_EDIT: "fal-ai/gemini-flash/edit-image",
  QWEN_EDIT: "fal-ai/qwen/edit-image",
} as const;

/**
 * Image model configurations for different preferences
 * Strategy: Chain models from best to fallback based on use case
 *
 * Model identifiers use FAL's exact model strings for direct compatibility:
 * - fal-ai/flux-pro/v1.1-ultra - Premium ultra quality
 * - fal-ai/flux/dev - Standard Flux dev model
 * - fal-ai/flux/schnell - Fast Flux model
 * - fal-ai/flux-pro/kontext/max - Context-aware editing
 * - fal-ai/gpt-4o/text-to-image - GPT-4o image generation
 * - fal-ai/imagen4/preview/text-to-image - Google Imagen
 */
export const IMAGE_MODELS = {
  // Quality - best results, cost no object
  quality: {
    textToImage: {
      primary: {
        model: FAL_IMAGE_MODELS.FLUX_PRO_ULTRA,
        params: {
          num_inference_steps: 50,
          guidance_scale: 3.5,
          safety_tolerance: "5",
        },
      },
      fallbacks: [
        {
          model: FAL_IMAGE_MODELS.FLUX_SRPO_TEXT, // High-quality alternative with SRPO
          params: {
            num_inference_steps: 50,
            guidance_scale: 4.5,
            acceleration: "none", // Best quality mode
          },
        },
        {
          model: FAL_IMAGE_MODELS.GPT_4O_TEXT_TO_IMAGE,
          params: {
            quality: "high" as GptImageQuality,
            image_size: "1536x1024" as GptImageSize,
          },
        },
        {
          model: FAL_IMAGE_MODELS.IMAGEN4_PREVIEW,
          params: {
            aspect_ratio: "16:9" as ImagenAspectRatio,
            num_images: 2,
          },
        },
      ],
    },
    imageToImage: {
      primary: {
        model: FAL_IMAGE_MODELS.KONTEXT_MAX,
        params: {
          model: "max" as KontextModel,
          aspect_ratio: "16:9" as KontextAspectRatio,
          guidance_scale: 3.5,
        },
      },
      fallbacks: [
        {
          model: FAL_IMAGE_MODELS.FLUX_SRPO_IMAGE, // SRPO image transformation
          params: {
            strength: 0.95,
            num_inference_steps: 40,
            guidance_scale: 4.5,
            acceleration: "none",
          },
        },
        {
          model: FAL_IMAGE_MODELS.GPT_4O_EDIT,
          params: {
            quality: "high" as GptImageQuality,
            image_size: "1536x1024" as GptImageSize,
          },
        },
      ],
    },
  },

  // Default - balanced quality/speed for most use cases
  default: {
    textToImage: {
      primary: {
        model: FAL_IMAGE_MODELS.FLUX_DEV,
        params: {
          model: "dev" as FluxModel,
          num_inference_steps: 28,
          guidance_scale: 3.5,
        },
      },
      fallbacks: [
        {
          model: FAL_IMAGE_MODELS.GPT_4O_TEXT_TO_IMAGE,
          params: {
            quality: "medium" as GptImageQuality,
            image_size: "1024x1024" as GptImageSize,
          },
        },
        {
          model: FAL_IMAGE_MODELS.GEMINI_FLASH,
          params: {},
        },
      ],
    },
    imageToImage: {
      primary: {
        model: FAL_IMAGE_MODELS.KONTEXT_MAX,
        params: {
          model: "pro" as KontextModel,
          aspect_ratio: "16:9" as KontextAspectRatio,
        },
      },
      fallbacks: [
        {
          model: FAL_IMAGE_MODELS.GPT_4O_EDIT,
          params: {
            quality: "medium" as GptImageQuality,
            image_size: "1024x1024" as GptImageSize,
          },
        },
      ],
    },
  },

  // Fast - quick iterations, drafts
  fast: {
    textToImage: {
      primary: {
        model: FAL_IMAGE_MODELS.FLUX_SCHNELL,
        params: {
          model: "schnell" as FluxModel,
          num_inference_steps: 4,
          guidance_scale: 1.0,
        },
      },
      fallbacks: [
        {
          model: FAL_IMAGE_MODELS.GEMINI_FLASH,
          params: {},
        },
      ],
    },
    imageToImage: {
      primary: {
        model: "nanoBananaEditImage",
        params: {},
      },
      fallbacks: [
        {
          model: "geminiFlashEditImage",
          params: {
            quality: "low",
            image_size: "1024x1024",
          },
        },
      ],
    },
  },
};

/**
 * Aspect ratio presets for different use cases
 */
export const ASPECT_RATIOS = {
  // Social media
  instagram_square: "1:1",
  instagram_portrait: "4:5",
  instagram_story: "9:16",

  // Standard formats
  landscape: "16:9",
  portrait: "9:16",
  square: "1:1",
  widescreen: "21:9",

  // Print
  photo_landscape: "3:2",
  photo_portrait: "2:3",
  standard_print: "4:3",
};

/**
 * Image generation parameters by use case
 */
export const IMAGE_PARAMS = {
  // App screenshots
  appScreenshot: {
    tier: "quality",
    aspectRatio: "9:16",
    numImages: 1,
    enhancePrompt: true,
  },

  // Marketing materials
  marketing: {
    tier: "default",
    aspectRatio: "16:9",
    numImages: 3,
    enhancePrompt: true,
  },

  // Quick drafts
  draft: {
    tier: "fast",
    aspectRatio: "1:1",
    numImages: 1,
    enhancePrompt: false,
  },

  // Bulk generation
  bulk: {
    tier: "fast",
    aspectRatio: "1:1",
    numImages: 1,
    enhancePrompt: false,
  },
};

/**
 * Model cost estimates (per image)
 */
export const IMAGE_COSTS = {
  // Premium models
  fluxProUltraTextToImage: 0.05,
  gptTextToImage_high: 0.08,
  kontextEditImage_max: 0.04,

  // Balanced models
  fluxTextToImage_dev: 0.025,
  gptTextToImage_medium: 0.06,
  kontextEditImage_pro: 0.02,
  geminiFlashTextToImage: 0.02,

  // Fast models
  fluxTextToImage_schnell: 0.00325,
  geminiFlashTextToImage_low: 0.01,
  nanoBananaTextToImage: 0.015,

  // Budget models
  qwenTextToImage: 0.01,
  qwenEditImage: 0.015,
};

/**
 * Helper to get the image model configuration
 */
/**
 * Model cost estimates (per generation)
 */
export const FAL_IMAGE_COSTS: Record<string, number> = {
  [FAL_IMAGE_MODELS.FLUX_PRO_ULTRA]: 0.06,
  [FAL_IMAGE_MODELS.FLUX_SRPO_TEXT]: 0.025, // $0.025 per megapixel
  [FAL_IMAGE_MODELS.FLUX_SRPO_IMAGE]: 0.025, // $0.025 per megapixel
  [FAL_IMAGE_MODELS.FLUX_DEV]: 0.025,
  [FAL_IMAGE_MODELS.FLUX_SCHNELL]: 0.003,
  [FAL_IMAGE_MODELS.GPT_4O_TEXT_TO_IMAGE]: 0.02,
  [FAL_IMAGE_MODELS.GPT_4O_EDIT]: 0.02,
  [FAL_IMAGE_MODELS.IMAGEN4_PREVIEW]: 0.04,
  [FAL_IMAGE_MODELS.KONTEXT_MAX]: 0.04,
  [FAL_IMAGE_MODELS.KONTEXT_PRO]: 0.03,
  [FAL_IMAGE_MODELS.GEMINI_FLASH]: 0.01,
  [FAL_IMAGE_MODELS.GEMINI_FLASH_EDIT]: 0.01,
  [FAL_IMAGE_MODELS.QWEN_TEXT]: 0.015,
  [FAL_IMAGE_MODELS.QWEN_EDIT]: 0.015,
};

export function getImageConfig(
  operation: "textToImage" | "imageToImage",
  tier: "quality" | "default" | "fast" = "default",
) {
  const config = IMAGE_MODELS[tier][operation];

  // Get cost from our cost map
  const estimatedCost = FAL_IMAGE_COSTS[config.primary.model] || 0.02;

  return {
    primary: config.primary,
    fallbacks: config.fallbacks,
    estimatedCost,
  };
}

/**
 * Get recommended tier based on requirements
 */
export function recommendImageTier(requirements: {
  quality?: "high" | "medium" | "low";
  speed?: "fast" | "normal" | "slow";
  budget?: "unlimited" | "moderate" | "tight";
}): keyof typeof IMAGE_MODELS {
  const {
    quality = "medium",
    speed = "normal",
    budget = "moderate",
  } = requirements;

  // Quality is most important
  if (quality === "high" && budget !== "tight") {
    return "quality";
  }

  // Speed is most important
  if (speed === "fast" && quality !== "high") {
    return "fast";
  }

  // Default
  return "default";
}
