// Generic fal.ai API types

export interface FalImage {
  url: string;
  width: number;
  height: number;
  content_type?: string;
  file_name?: string;
  file_size?: number;
}

export interface FalVideo {
  url: string;
  width?: number;
  height?: number;
  duration?: number; // Duration in seconds
  content_type?: string;
  file_name?: string;
  file_size?: number;
}

// Generic request/response types
export interface FalRequest<T = unknown> {
  input: T;
  logs?: boolean;
  sync_mode?: boolean;
  webhook_url?: string;
}

export interface FalApiResponse<T = unknown> {
  data: T;
  requestId: string;
  logs?: string[];
}

export interface FalQueueSubmitResponse {
  request_id: string;
}

export interface FalQueueStatus {
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  response_url?: string;
  queue_position?: number;
  logs?: Array<{
    message: string;
    level: string;
    timestamp: string;
  }>;
}

// GPT Image specific types
export type GptImageQuality = "auto" | "low" | "medium" | "high";
export type GptImageSize = "auto" | "1024x1024" | "1536x1024" | "1024x1536";

export interface GptTextToImageParams {
  prompt: string;
  quality: GptImageQuality; // Required for explicit control
  image_size: GptImageSize; // Required for explicit control
  aspect_ratio?: string;
  num_images?: number;
  seed?: number;
  output_format?: "jpeg" | "png";
}

export interface GptEditImageParams {
  prompt: string;
  image_urls: string[]; // API expects array of image URLs
  quality: GptImageQuality; // Required for explicit control
  image_size: GptImageSize; // Required for explicit control
  aspect_ratio?: string;
  num_images?: number;
  seed?: number;
  output_format?: "jpeg" | "png";
}

export interface GptImageResponse {
  images: FalImage[];
  // Additional fields that FAL returns
  has_nsfw_concepts?: boolean[];
  prompt?: string;
  seed?: number;
  timings?: {
    inference?: number;
  };
  // GPT-4o specific nested structure
  data?: {
    images: FalImage[];
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      total_tokens?: number;
      input_tokens_details?: {
        image_tokens?: number;
        text_tokens?: number;
      };
    };
  };
}

// Structured response types for better error handling
export interface FalSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface FalErrorResponse {
  success: false;
  error: {
    type:
      | "content_policy_violation"
      | "validation_error"
      | "api_error"
      | "unknown_error";
    message: string;
    rejectedPrompt?: string; // For content policy violations
    suggestion?: string; // Helpful suggestion for content policy violations
    helpUrl?: string; // Link to error documentation
    details?: unknown; // Additional error details
    status?: number; // HTTP status code
  };
}

export type FalResponse<T = unknown> = FalSuccessResponse<T> | FalErrorResponse;

// FLUX specific types
export type FluxModel = "schnell" | "dev" | "pro";
export type FluxImageSize =
  | "square_hd"
  | "square"
  | "portrait_4_3"
  | "portrait_16_9"
  | "landscape_4_3"
  | "landscape_16_9";

export type FluxSafetyTolerance = "1" | "2" | "3" | "4" | "5" | "6";

export interface FluxCustomImageSize {
  width: number;
  height: number;
}

export interface FluxTextToImageParams {
  prompt: string;
  model?: FluxModel;
  image_size?: FluxImageSize | FluxCustomImageSize;
  num_inference_steps?: number;
  seed?: number;
  guidance_scale?: number;
  num_images?: number;
  enable_safety_checker?: boolean;
  safety_tolerance?: FluxSafetyTolerance;
  output_format?: "jpeg" | "png";
}

export interface FluxImageToImageParams {
  prompt: string;
  model?: FluxModel;
  image_url: string;
  seed?: number;
  guidance_scale?: number;
  sync_mode?: boolean;
  num_images?: number;
  safety_tolerance?: "1" | "2" | "3" | "4" | "5" | "6";
  output_format?: "jpeg" | "png";
  aspect_ratio?:
    | "21:9"
    | "16:9"
    | "4:3"
    | "3:2"
    | "1:1"
    | "2:3"
    | "3:4"
    | "9:16"
    | "9:21";
}

// Imagen4 model types
export type ImagenAspectRatio = "1:1" | "16:9" | "9:16" | "3:4" | "4:3";

export interface ImagenTextToImageParams {
  prompt: string;
  aspect_ratio: ImagenAspectRatio; // Required - key feature of Imagen4
  negative_prompt?: string; // Default: ""
  num_images?: number; // Default: 1, range 1-4
  seed?: number;
  output_format?: "jpeg" | "png";
}

// FLUX Kontext model types
export type KontextModel = "pro" | "max";
export type KontextAspectRatio =
  | "21:9"
  | "16:9"
  | "4:3"
  | "3:2"
  | "1:1"
  | "2:3"
  | "3:4"
  | "9:16"
  | "9:21";
export type KontextSafetyTolerance = "1" | "2" | "3" | "4" | "5" | "6";

// FLUX Kontext is an image editing model only - requires an input image
export interface KontextEditImageParams {
  prompt: string;
  image_url: string; // Required - Kontext only works with existing images
  aspect_ratio: KontextAspectRatio; // Required for Kontext
  model: KontextModel; // "pro" (standard) | "max" (more powerful) - required
  seed?: number;
  guidance_scale?: number; // Default: 3.5
  sync_mode?: boolean;
  num_images?: number; // Default: 1
  safety_tolerance?: KontextSafetyTolerance; // Default: "5"
  output_format?: "jpeg" | "png"; // Default: "jpeg"
}

// FLUX Kontext Multi - supports multiple input images (Max model only)
export interface KontextMultiEditImageParams {
  prompt: string;
  image_urls: string[]; // Required - Array of image URLs for multi-image editing
  aspect_ratio: KontextAspectRatio; // Required for Kontext
  seed?: number;
  guidance_scale?: number; // Default: 3.5
  sync_mode?: boolean;
  num_images?: number; // Default: 1
  safety_tolerance?: KontextSafetyTolerance; // Default: "2"
  output_format?: "jpeg" | "png"; // Default: "jpeg"
}

// Standard response type for text-to-image models
export interface FalTextToImageResponse {
  images: FalImage[];
  seed?: number;
  timings?: {
    inference: number;
  };
  has_nsfw_concepts?: boolean[];
  prompt?: string;
}

// API error response
export interface FalError {
  error: string;
  message?: string;
  details?: unknown;
}

// Specific error types for better client handling
export class FalContentPolicyError extends Error {
  readonly type = "content_policy_violation";
  readonly status = 422;
  readonly url: string;
  readonly rejectedPrompt: string;

  constructor(message: string, prompt: string, helpUrl?: string) {
    super(message);
    this.name = "FalContentPolicyError";
    this.rejectedPrompt = prompt;
    this.url = helpUrl || "https://docs.fal.ai/errors#content_policy_violation";
  }
}

export class FalValidationError extends Error {
  readonly type = "validation_error";
  readonly status = 422;
  readonly details: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "FalValidationError";
    this.details = details;
  }
}

export class FalAPIError extends Error {
  readonly type = "api_error";
  readonly status: number;
  readonly details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "FalAPIError";
    this.status = status;
    this.details = details;
  }
}

// Model types derived from constants to ensure single source of truth
// These types are automatically generated from the model constants

// Re-export the model constants for convenience
export { FAL_IMAGE_MODELS } from './clients/image/imageModels';

// Derive types from the constants
export type FalImageModel = typeof import('./clients/image/imageModels').FAL_IMAGE_MODELS[keyof typeof import('./clients/image/imageModels').FAL_IMAGE_MODELS];

// For backward compatibility, FalModel includes all image models
// Use FalImageModel for type safety when working specifically with image models
export type FalModel = FalImageModel;

export interface FalImageSize {
  width: number;
  height: number;
}

export type FalImageSizePreset =
  | "square_hd"
  | "square"
  | "portrait_4_3"
  | "portrait_16_9"
  | "landscape_4_3"
  | "landscape_16_9";

export type FalOutputFormat = "jpeg" | "png";

// Generic text-to-image parameters (works across FLUX/Imagen models)
export interface FalTextToImageParams {
  prompt: string;
  negative_prompt?: string;
  image_size?: FalImageSizePreset | FalImageSize;
  num_inference_steps?: number;
  seed?: number;
  guidance_scale?: number;
  sync_mode?: boolean;
  num_images?: number;
  enable_safety_checker?: boolean;
  output_format?: FalOutputFormat;
}

// Kling Video specific types
export type KlingVideoAspectRatio = "16:9" | "9:16" | "1:1";
export type KlingVideoDuration = 5 | 10; // Duration in seconds

export interface KlingTextToVideoParams {
  prompt: string; // Max 2500 characters
  duration?: KlingVideoDuration; // Default: 5 seconds
  aspect_ratio?: KlingVideoAspectRatio; // Default: "16:9"
  negative_prompt?: string; // Default: "blur, distort, and low quality"
  cfg_scale?: number; // 0-1, controls how closely model follows prompt, default: 0.5
  image_url?: string; // Optional starting image for video generation
}

export interface KlingImageToVideoParams {
  prompt: string; // Text description guiding video generation
  image_url: string; // Required - source image for video transformation
  duration?: KlingVideoDuration; // Default: 5 seconds
  negative_prompt?: string; // Default: "blur, distort, and low quality"
  cfg_scale?: number; // 0-1, controls how closely model follows prompt, default: 0.5
}

export interface FalVideoResponse {
  video: FalVideo;
  seed?: number;
  timings?: {
    inference: number;
  };
  prompt?: string;
}

// Lucy-14b Video specific types
export interface LucyImageToVideoParams {
  prompt: string; // Max 1500 characters
  image_url: string; // Required - source image for video
  resolution?: "720p"; // Default: "720p"
  aspect_ratio?: "16:9" | "9:16"; // Default: "16:9"
  sync_mode?: boolean; // Default: true for faster response
}

// SeeDance Video specific types
export interface SeeDanceImageToVideoParams {
  prompt: string; // Text description
  image_url: string; // Required - source image
  aspect_ratio?: "16:9" | "9:16" | "4:3" | "3:4" | "1:1"; // Default: "16:9"
  resolution?: "720p" | "480p"; // Default: "720p"
  duration?: number; // Default: 5 seconds
  camera_fixed?: boolean; // Default: false
  seed?: number; // For reproducibility
  enable_safety_checker?: boolean; // Default: true
}

export interface SeeDanceTextToVideoParams {
  prompt: string; // Text description
  aspect_ratio?: "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "9:21"; // Default: "16:9"
  resolution?: "480p" | "720p" | "1080p"; // Default: "720p"
  duration?: string; // "3" to "12" seconds, default: "5"
  camera_fixed?: boolean; // Default: false
  seed?: number; // -1 for random
  enable_safety_checker?: boolean; // Default: true
}

// FLUX SRPO specific types
export type FluxSrpoAcceleration = "none" | "regular" | "high";

export interface FluxSrpoTextToImageParams {
  prompt: string;
  num_images?: number; // 1-4, default: 1
  acceleration?: FluxSrpoAcceleration; // Speed/quality tradeoff
  output_format?: "jpeg" | "png";
  sync_mode?: boolean;
  guidance_scale?: number; // 1-20, default: 4.5
  num_inference_steps?: number; // 10-50, default: 40
  seed?: number;
  enable_safety_checker?: boolean;
}

export interface FluxSrpoImageToImageParams {
  prompt: string;
  image_url: string;
  strength?: number; // 0.01-1, default: 0.95 (higher values work better for SRPO)
  num_images?: number; // 1-4, default: 1
  acceleration?: FluxSrpoAcceleration;
  output_format?: "jpeg" | "png";
  sync_mode?: boolean;
  guidance_scale?: number; // 1-20, default: 4.5
  num_inference_steps?: number; // 10-50, default: 40
  seed?: number;
  enable_safety_checker?: boolean;
}

export interface FluxSrpoResponse {
  prompt: string;
  images: FalImage[];
  seed: number;
  has_nsfw_concepts: boolean[];
  timings: {
    inference?: number;
  };
}

// Pricing constants for reference (in comments for documentation)
// FLUX SRPO Pricing:
// - $0.025 per megapixel (both text-to-image and image-to-image)
// Kling Video Pricing:
// - $0.35 for 5-second video
// - $0.07 per additional second (so 10-second video = $0.35 + $0.35 = $0.70)
// Lucy-14b Pricing:
// - $0.08 per second of generated video
// SeeDance Pricing:
// - $0.18 for 720p 5-second video
// - Token calculation: (height x width x FPS x duration) / 1024
