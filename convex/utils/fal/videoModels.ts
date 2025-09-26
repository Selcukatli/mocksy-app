// Business logic configuration for FAL video model selection
// Defines model chains based on quality, speed, and cost priorities

import { KlingVideoDuration } from "./types";

/**
 * Video model configurations for different preferences
 * Strategy: Chain models from best to fallback based on use case
 */
export const VIDEO_MODELS = {
  // Quality - cinematic results, cost no object
  quality: {
    textToVideo: {
      primary: {
        model: "klingTextToVideo",
        params: {
          duration: 10 as KlingVideoDuration,
          aspect_ratio: "16:9",
          cfg_scale: 0.7, // Higher adherence to prompt
        }
      },
      fallbacks: [
        {
          model: "klingTextToVideo",
          params: {
            duration: 5 as KlingVideoDuration,
            aspect_ratio: "16:9",
            cfg_scale: 0.5
          }
        },
        {
          model: "seeDanceTextToVideo",
          params: {
            duration: "10",
            resolution: "1080p",
            aspect_ratio: "16:9"
          }
        }
      ]
    },
    imageToVideo: {
      primary: {
        model: "klingImageToVideo",
        params: {
          duration: 10 as KlingVideoDuration,
          cfg_scale: 0.7
        }
      },
      fallbacks: [
        {
          model: "klingImageToVideo",
          params: {
            duration: 5 as KlingVideoDuration,
            cfg_scale: 0.5
          }
        }
      ]
    }
  },

  // Default - balanced quality/speed/cost for most use cases
  default: {
    textToVideo: {
      primary: {
        model: "seeDanceTextToVideo",
        params: {
          duration: "5",
          resolution: "720p",
          aspect_ratio: "16:9"
        }
      },
      fallbacks: [
        {
          model: "seeDanceTextToVideo",
          params: {
            duration: "5",
            resolution: "480p",
            aspect_ratio: "16:9"
          }
        },
        {
          model: "klingTextToVideo",
          params: {
            duration: 5 as KlingVideoDuration,
            aspect_ratio: "16:9"
          }
        }
      ]
    },
    imageToVideo: {
      primary: {
        model: "seeDanceImageToVideo",
        params: {
          duration: 5,
          resolution: "720p"
        }
      },
      fallbacks: [
        {
          model: "lucyImageToVideo",
          params: {
            sync_mode: false, // Get URL instead of base64
            aspect_ratio: "16:9"
          }
        },
        {
          model: "seeDanceImageToVideo",
          params: {
            duration: 5,
            resolution: "480p"
          }
        }
      ]
    }
  },

  // Fast - quick iterations, drafts
  fast: {
    textToVideo: {
      primary: {
        model: "seeDanceTextToVideo",
        params: {
          duration: "3",
          resolution: "480p",
          aspect_ratio: "16:9"
        }
      },
      fallbacks: [
        {
          model: "seeDanceTextToVideo",
          params: {
            duration: "5",
            resolution: "480p",
            aspect_ratio: "1:1" // Smaller aspect ratio for speed
          }
        }
      ]
    },
    imageToVideo: {
      primary: {
        model: "lucyImageToVideo",
        params: {
          sync_mode: true, // Base64 for faster response
          aspect_ratio: "16:9"
        }
      },
      fallbacks: [
        {
          model: "seeDanceImageToVideo",
          params: {
            duration: 3,
            resolution: "480p"
          }
        }
      ]
    }
  }
};

/**
 * Video generation parameters by use case
 */
export const VIDEO_PARAMS = {
  // App preview videos
  appPreview: {
    tier: "default",
    duration: 5,
    aspectRatio: "9:16",
    resolution: "720p"
  },

  // Marketing videos
  marketing: {
    tier: "quality",
    duration: 10,
    aspectRatio: "16:9",
    resolution: "1080p"
  },

  // Social media clips
  social: {
    tier: "default",
    duration: 5,
    aspectRatio: "1:1",
    resolution: "720p"
  },

  // Quick drafts
  draft: {
    tier: "fast",
    duration: 3,
    aspectRatio: "16:9",
    resolution: "480p"
  },

  // Bulk generation
  bulk: {
    tier: "fast",
    duration: 3,
    aspectRatio: "1:1",
    resolution: "480p"
  }
};

/**
 * Model cost estimates (based on typical durations)
 */
export const VIDEO_COSTS = {
  // Kling (Premium)
  kling_5s: 0.35,
  kling_10s: 0.70,

  // Lucy-14b (Fast, image-to-video only)
  lucy_5s: 0.40, // 5s × $0.08/s

  // SeeDance (Best value)
  seedance_3s_480p: 0.11, // Estimated
  seedance_5s_720p: 0.18, // Confirmed
  seedance_5s_1080p: 0.25, // Estimated
  seedance_10s_720p: 0.36, // Estimated
};

/**
 * Video generation speed estimates (seconds)
 */
export const VIDEO_SPEEDS = {
  // Kling: Slow but high quality
  kling: {
    min: 30,
    max: 60,
    typical: 45
  },

  // Lucy-14b: Lightning fast
  lucy: {
    min: 10,
    max: 30,
    typical: 20
  },

  // SeeDance: Fast and versatile
  seedance: {
    min: 10,
    max: 30,
    typical: 20
  }
};

/**
 * Helper to get the video model configuration
 */
export function getVideoConfig(
  operation: "textToVideo" | "imageToVideo",
  tier: keyof typeof VIDEO_MODELS = "default"
) {
  const config = VIDEO_MODELS[tier][operation];

  // Estimate cost based on model and duration
  const primaryModel = config.primary.model;
  const params = config.primary.params;
  const duration = 'duration' in params ? params.duration : 5;
  let estimatedCost = 0.18; // Default to SeeDance 5s

  if (primaryModel.includes("kling")) {
    estimatedCost = duration === 10 ? VIDEO_COSTS.kling_10s : VIDEO_COSTS.kling_5s;
  } else if (primaryModel.includes("lucy")) {
    estimatedCost = VIDEO_COSTS.lucy_5s;
  } else if (primaryModel.includes("seedance")) {
    const resolution = 'resolution' in params ? params.resolution : "720p";
    const durationNum = typeof duration === 'string' ? parseInt(duration) : duration || 5;

    if (durationNum === 3 && resolution === "480p") {
      estimatedCost = VIDEO_COSTS.seedance_3s_480p;
    } else if (durationNum === 5 && resolution === "720p") {
      estimatedCost = VIDEO_COSTS.seedance_5s_720p;
    } else if (durationNum === 5 && resolution === "1080p") {
      estimatedCost = VIDEO_COSTS.seedance_5s_1080p;
    } else if (durationNum === 10) {
      estimatedCost = VIDEO_COSTS.seedance_10s_720p;
    }
  }

  // Get speed estimate
  const modelType = primaryModel.includes("kling") ? "kling" :
                   primaryModel.includes("lucy") ? "lucy" : "seedance";
  const speed = VIDEO_SPEEDS[modelType];

  return {
    primary: config.primary,
    fallbacks: config.fallbacks,
    estimatedCost,
    estimatedSpeed: speed,
    capabilities: {
      supportsTextToVideo: operation === "textToVideo" || primaryModel.includes("kling") || primaryModel.includes("seedance"),
      supportsImageToVideo: true, // All our models support this
      maxDuration: primaryModel.includes("seedance") ? 12 :
                  primaryModel.includes("kling") ? 10 : 5,
      resolutions: primaryModel.includes("seedance") ? ["480p", "720p", "1080p"] :
                   primaryModel.includes("lucy") ? ["720p"] :
                   ["720p"], // Kling default
    }
  };
}

/**
 * Get recommended tier based on requirements
 */
export function recommendVideoTier(requirements: {
  quality?: "high" | "medium" | "low";
  speed?: "fast" | "normal" | "slow";
  budget?: "unlimited" | "moderate" | "tight";
  duration?: number;
}): keyof typeof VIDEO_MODELS {
  const { quality = "medium", speed = "normal", budget = "moderate", duration = 5 } = requirements;

  // Long duration requires quality tier (Kling or SeeDance)
  if (duration > 5 && budget !== "tight") {
    return "quality";
  }

  // Quality is most important
  if (quality === "high" && budget !== "tight") {
    return "quality";
  }

  // Speed is most important
  if (speed === "fast" && quality !== "high") {
    return "fast";
  }

  // Default (best value with SeeDance)
  return "default";
}

/**
 * Calculate actual video cost based on model and parameters
 */
export function calculateVideoCost(
  model: string,
  duration: number,
  resolution?: string
): number {
  // Kling pricing
  if (model.includes("kling")) {
    return duration <= 5 ? VIDEO_COSTS.kling_5s : VIDEO_COSTS.kling_10s;
  }

  // Lucy pricing (per second)
  if (model.includes("lucy")) {
    return duration * 0.08;
  }

  // SeeDance pricing (complex based on resolution and duration)
  if (model.includes("seedance")) {
    // Simplified estimation
    const basePrice = 0.18; // 5s at 720p
    const durationMultiplier = duration / 5;
    const resolutionMultiplier =
      resolution === "1080p" ? 1.4 :
      resolution === "480p" ? 0.6 : 1.0;

    return basePrice * durationMultiplier * resolutionMultiplier;
  }

  // Default fallback
  return 0.18;
}