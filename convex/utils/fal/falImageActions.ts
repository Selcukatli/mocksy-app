"use node";

import { action } from "../../_generated/server";
import { v } from "convex/values";

// Import model-specific clients
import { generateFluxTextToImage } from "./clients/fluxImageClient";
import { editImageWithKontext, editImageWithKontextMulti } from "./clients/kontextImageClient";
import { generateGptTextToImage, editImageWithGpt } from "./clients/gptImageClient";
import { generateImagenTextToImage } from "./clients/imagenImageClient";
import { GeminiImageClient } from "./clients/geminiImageClient";
import { NanoBananaClient } from "./clients/nanoBananaClient";
import { QwenImageClient } from "./clients/qwenImageClient";
import { FluxProUltraClient } from "./clients/fluxProUltraClient";

// Convex validators for GPT Image enums
const gptQualityValidator = v.union(
  v.literal("auto"),
  v.literal("low"), 
  v.literal("medium"),
  v.literal("high")
);

const gptImageSizeValidator = v.union(
  v.literal("auto"),
  v.literal("1024x1024"),
  v.literal("1536x1024"), 
  v.literal("1024x1536")
);

// Convex validators for FLUX-specific enums
const fluxModelValidator = v.union(
  v.literal("schnell"),
  v.literal("dev"),
  v.literal("pro")
);

const fluxImageSizeValidator = v.union(
  v.literal("square_hd"),
  v.literal("square"),
  v.literal("portrait_4_3"),
  v.literal("portrait_16_9"),
  v.literal("landscape_4_3"),
  v.literal("landscape_16_9")
);

const fluxSafetyToleranceValidator = v.union(
  v.literal("1"),
  v.literal("2"), 
  v.literal("3"),
  v.literal("4"),
  v.literal("5"),
  v.literal("6")
);

// Convex validators for Imagen4-specific enums
const imagenAspectRatioValidator = v.union(
  v.literal("1:1"),
  v.literal("16:9"),
  v.literal("9:16"),
  v.literal("3:4"),
  v.literal("4:3")
);

// Convex validators for FLUX Kontext-specific enums
const kontextAspectRatioValidator = v.union(
  v.literal("21:9"),
  v.literal("16:9"),
  v.literal("4:3"),
  v.literal("3:2"),
  v.literal("1:1"),
  v.literal("2:3"),
  v.literal("3:4"),
  v.literal("9:16"),
  v.literal("9:21")
);

const kontextSafetyToleranceValidator = v.union(
  v.literal("1"),
  v.literal("2"),
  v.literal("3"),
  v.literal("4"),
  v.literal("5"),
  v.literal("6")
);

const kontextModelValidator = v.union(
  v.literal("pro"),
  v.literal("max")
);

/**
 * Generate image using FLUX models with FLUX-specific parameters
 * Supports FLUX Schnell (fastest), Dev (balanced), and Pro (highest quality)
 */
export const fluxTextToImage = action({
  args: {
    prompt: v.string(), // Text description of what to generate
    model: v.optional(fluxModelValidator), // FLUX model: "schnell" | "dev" | "pro", default: "dev"
    
    // === Image Dimensions & Format ===
    image_size: v.optional(v.union(
      fluxImageSizeValidator, // Preset sizes: "square_hd", "square", "portrait_4_3", etc.
      v.object({ width: v.number(), height: v.number() }) // Custom dimensions in pixels
    )), // Image size preset or custom dimensions
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))), // Output format, default: "jpeg"
    
    // === Generation Controls ===
    num_inference_steps: v.optional(v.number()), // Denoising steps (more = higher quality, slower)
    guidance_scale: v.optional(v.number()), // How closely to follow prompt (1-20), higher = more adherent
    num_images: v.optional(v.number()), // Number of images to generate (1-4), default: 1
    seed: v.optional(v.number()), // Random seed for reproducible results
    
    // === Safety Controls ===
    enable_safety_checker: v.optional(v.boolean()), // Enable content filtering (Schnell/Dev), default: false
    safety_tolerance: v.optional(fluxSafetyToleranceValidator), // Safety level for Pro: "1"(strict) to "6"(permissive)
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await generateFluxTextToImage(args);
  },
});

/**
 * Generate image using GPT Image text-to-image model (BYOK - Bring Your Own Key)
 * Uses OpenAI's models through fal.ai with your OpenAI API key
 * Requires OPENAI_API_KEY environment variable
 */
export const gptTextToImage = action({
  args: {
    prompt: v.string(), // Text description of what to generate
    
    // === Required GPT Image Parameters ===
    quality: gptQualityValidator, // Rendering quality: "auto" | "low" | "medium" | "high" (required)
    image_size: gptImageSizeValidator, // Image dimensions: "auto" | "1024x1024" | "1536x1024" | "1024x1536" (required)
    
    // === Optional Generation Controls ===
    aspect_ratio: v.optional(v.string()), // Aspect ratio override (e.g., "16:9", "1:1")
    num_images: v.optional(v.number()), // Number of images to generate (1-4), default: 1
    seed: v.optional(v.number()), // Random seed for reproducible results
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))) // Output format, default: "jpeg"
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await generateGptTextToImage(args);
  },
});

/**
 * Edit image using GPT Image edit model (BYOK - Bring Your Own Key)
 * Uses OpenAI's image editing models through fal.ai with your OpenAI API key
 * Requires OPENAI_API_KEY environment variable
 */
export const gptEditImage = action({
  args: {
    prompt: v.string(), // Description of what to change in the image
    image_url: v.string(), // URL of the image to edit (publicly accessible)
    
    // === Required GPT Image Parameters ===
    quality: gptQualityValidator, // Rendering quality: "auto" | "low" | "medium" | "high" (required)
    image_size: gptImageSizeValidator, // Output dimensions: "auto" | "1024x1024" | "1536x1024" | "1024x1536" (required)
    
    // === Optional Generation Controls ===
    aspect_ratio: v.optional(v.string()), // Aspect ratio override (e.g., "16:9", "1:1")
    num_images: v.optional(v.number()), // Number of edited images to generate (1-4), default: 1
    seed: v.optional(v.number()), // Random seed for reproducible results
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))) // Output format, default: "jpeg"
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const { image_url, ...gptParams } = args;
    return await editImageWithGpt({
      ...gptParams,
      image_urls: [image_url] // Convert single URL to array for GPT client
    });
  },
});

/**
 * Generate image using Google's Imagen4 model
 * High-quality photorealistic images with excellent text rendering
 * Known for superior composition and natural lighting
 */
export const imagenTextToImage = action({
  args: {
    prompt: v.string(), // Text description of what to generate
    
    // === Required Imagen4 Parameters ===
    aspect_ratio: imagenAspectRatioValidator, // Image aspect ratio: "1:1" | "16:9" | "9:16" | "3:4" | "4:3" (required)
    
    // === Optional Generation Controls ===
    negative_prompt: v.optional(v.string()), // What to exclude from the image, default: ""
    num_images: v.optional(v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4))), // Number of images (1-4), default: 1
    seed: v.optional(v.number()), // Random seed for reproducible results
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))) // Output format, default: "jpeg"
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await generateImagenTextToImage(args);
  },
});

/**
 * Edit image using FLUX Kontext (image-to-image)
 * Context-aware image editing with natural language instructions
 * Supports both Pro (standard) and Max (more powerful) versions
 * Perfect for making intuitive edits like "add a rainbow" or "change to winter scene"
 */
export const kontextEditImage = action({
  args: {
    prompt: v.string(), // Natural language description of what to change in the image
    image_url: v.string(), // URL of the image to edit (publicly accessible)
    
    // === Required Kontext Parameters ===
    aspect_ratio: kontextAspectRatioValidator, // Output aspect ratio: "21:9" | "16:9" | "4:3" | "3:2" | "1:1" | "2:3" | "3:4" | "9:16" | "9:21" (required)
    
    // === Model Selection ===
    model: kontextModelValidator, // Kontext version: "pro" (standard) | "max" (more powerful) - required
    
    // === Optional Generation Controls ===
    guidance_scale: v.optional(v.number()), // Edit strength/prompt adherence (1-20), default: 3.5
    num_images: v.optional(v.number()), // Number of edited versions to generate (1-4), default: 1
    seed: v.optional(v.number()), // Random seed for reproducible results
    sync_mode: v.optional(v.boolean()), // Wait for completion vs async processing
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))), // Output format, default: "jpeg"
    
    // === Safety Controls ===
    safety_tolerance: v.optional(kontextSafetyToleranceValidator), // Safety level: "1"(strict) to "6"(permissive), default: "5"
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await editImageWithKontext(args);
  },
});

/**
 * Edit multiple images using FLUX Kontext Max Multi model
 * Context-aware editing with multiple input images for complex compositions
 * Only available with Kontext Max model - perfect for combining multiple images
 * Examples: "Put the person from image 1 into the scene from image 2", "Combine these two products into one image"
 */
export const kontextMultiEditImage = action({
  args: {
    prompt: v.string(), // Natural language description of how to combine/edit the images
    image_urls: v.array(v.string()), // Array of image URLs to edit/combine (2+ images recommended)
    
    // === Required Kontext Parameters ===
    aspect_ratio: kontextAspectRatioValidator, // Output aspect ratio: "21:9" | "16:9" | "4:3" | "3:2" | "1:1" | "2:3" | "3:4" | "9:16" | "9:21" (required)
    
    // === Optional Generation Controls ===
    guidance_scale: v.optional(v.number()), // Edit strength/prompt adherence (1-20), default: 3.5
    num_images: v.optional(v.number()), // Number of combined/edited versions to generate (1-4), default: 1
    seed: v.optional(v.number()), // Random seed for reproducible results
    sync_mode: v.optional(v.boolean()), // Wait for completion vs async processing
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))), // Output format, default: "jpeg"
    
    // === Safety Controls ===
    safety_tolerance: v.optional(kontextSafetyToleranceValidator), // Safety level: "1"(strict) to "6"(permissive), default: "2"
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await editImageWithKontextMulti(args);
  },
});

/**
 * Generate image using Gemini 2.5 Flash - Fast, affordable image generation by Google
 * Best for quick prototyping and testing
 */
export const geminiFlashTextToImage = action({
  args: {
    prompt: v.string(),
    num_images: v.optional(v.number()),
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))),
    sync_mode: v.optional(v.boolean()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await GeminiImageClient.generateFlashImage(args);
  },
});

/**
 * Edit image using Gemini 2.5 Flash Edit
 * Fast image editing with natural language instructions
 */
export const geminiFlashEditImage = action({
  args: {
    prompt: v.string(),
    image_url: v.string(),
    num_images: v.optional(v.number()),
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))),
    sync_mode: v.optional(v.boolean()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await GeminiImageClient.editFlashImage(args);
  },
});

/**
 * Generate image using Nano Banana - Google's state-of-the-art model
 * Advanced generation with excellent quality/speed balance
 */
export const nanoBananaTextToImage = action({
  args: {
    prompt: v.string(),
    num_images: v.optional(v.number()),
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))),
    sync_mode: v.optional(v.boolean()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await NanoBananaClient.generateImage(args);
  },
});

/**
 * Edit image using Nano Banana Edit
 * State-of-the-art image editing by Google
 */
export const nanoBananaEditImage = action({
  args: {
    prompt: v.string(),
    image_url: v.string(),
    num_images: v.optional(v.number()),
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))),
    sync_mode: v.optional(v.boolean()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await NanoBananaClient.editImage(args);
  },
});

/**
 * Generate image using Qwen Image - Excellent text rendering in images
 * Best for images that need clear, readable text
 */
export const qwenTextToImage = action({
  args: {
    prompt: v.string(),
    num_images: v.optional(v.number()),
    image_size: v.optional(v.union(
      v.literal("landscape_4_3"),
      v.literal("portrait_3_4"),
      v.literal("square"),
      v.literal("square_hd"),
      v.literal("landscape_16_9"),
      v.literal("portrait_9_16")
    )),
    acceleration: v.optional(v.union(v.literal("none"), v.literal("regular"), v.literal("high"))),
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))),
    sync_mode: v.optional(v.boolean()),
    guidance_scale: v.optional(v.number()),
    num_inference_steps: v.optional(v.number()),
    seed: v.optional(v.number()),
    negative_prompt: v.optional(v.string()),
    enable_safety_checker: v.optional(v.boolean()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await QwenImageClient.generateImage(args);
  },
});

/**
 * Edit image using Qwen Image Edit Plus
 * Advanced image editing with excellent text preservation
 */
export const qwenEditImage = action({
  args: {
    prompt: v.string(),
    image_url: v.string(),
    num_images: v.optional(v.number()),
    image_size: v.optional(v.union(
      v.literal("landscape_4_3"),
      v.literal("portrait_3_4"),
      v.literal("square"),
      v.literal("square_hd"),
      v.literal("landscape_16_9"),
      v.literal("portrait_9_16")
    )),
    acceleration: v.optional(v.union(v.literal("none"), v.literal("regular"), v.literal("high"))),
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))),
    sync_mode: v.optional(v.boolean()),
    guidance_scale: v.optional(v.number()),
    num_inference_steps: v.optional(v.number()),
    seed: v.optional(v.number()),
    negative_prompt: v.optional(v.string()),
    enable_safety_checker: v.optional(v.boolean()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await QwenImageClient.editImage(args);
  },
});

/**
 * Generate image using FLUX Pro Ultra v1.1 - Ultra-high quality output
 * Premium model for the highest quality results with 2K-4MP resolution
 */
export const fluxProUltraTextToImage = action({
  args: {
    prompt: v.string(),
    aspect_ratio: v.optional(v.union(
      v.literal("1:1"),
      v.literal("16:9"),
      v.literal("9:16"),
      v.literal("4:3"),
      v.literal("3:4")
    )),
    enhance_prompt: v.optional(v.boolean()),
    num_images: v.optional(v.number()),
    output_format: v.optional(v.union(v.literal("jpeg"), v.literal("png"))),
    sync_mode: v.optional(v.boolean()),
    safety_tolerance: v.optional(fluxSafetyToleranceValidator),
    enable_safety_checker: v.optional(v.boolean()),
    seed: v.optional(v.number()),
    raw: v.optional(v.boolean()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await FluxProUltraClient.generateImage(args);
  },
});



 