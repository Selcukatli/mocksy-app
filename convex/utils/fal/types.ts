// Generic fal.ai API types

export interface FalImage {
  url: string;
  width: number;
  height: number;
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
}

// Structured response types for better error handling
export interface FalSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface FalErrorResponse {
  success: false;
  error: {
    type: "content_policy_violation" | "validation_error" | "api_error" | "unknown_error";
    message: string;
    rejectedPrompt?: string;  // For content policy violations
    suggestion?: string;      // Helpful suggestion for content policy violations
    helpUrl?: string;         // Link to error documentation
    details?: unknown;        // Additional error details
    status?: number;          // HTTP status code
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
  aspect_ratio?: "21:9" | "16:9" | "4:3" | "3:2" | "1:1" | "2:3" | "3:4" | "9:16" | "9:21";
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
export type KontextAspectRatio = "21:9" | "16:9" | "4:3" | "3:2" | "1:1" | "2:3" | "3:4" | "9:16" | "9:21";
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

// Available model endpoints (cleaned up to only include what we use)
export type FalModel = 
  // FLUX models
  | "fal-ai/flux-1/dev"
  | "fal-ai/flux-1/schnell" 
  | "fal-ai/flux-pro/new"
  // FLUX Kontext models
  | "fal-ai/flux-pro/kontext"
  | "fal-ai/flux-pro/kontext/max"
  | "fal-ai/flux-pro/kontext/max/multi"  // Multi-image variant of Kontext Max
  // GPT Image models
  | "fal-ai/gpt-image-1/text-to-image/byok"
  | "fal-ai/gpt-image-1/edit-image/byok"
  // Imagen4 models
  | "fal-ai/imagen4/preview";

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