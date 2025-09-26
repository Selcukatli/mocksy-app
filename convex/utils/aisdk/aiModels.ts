// Business logic configuration for AI model selection
// This defines which models to use and in what order based on current availability and performance

import { AIProvider } from "./types";

/**
 * AI model configurations for different use cases
 * Strategy: Use OpenRouter for everything (unified interface, handles all model quirks)
 * Naming: Size-based tiers (large/medium/small/tiny) for clear hierarchy
 */
export const AI_MODELS = {
  // Premium reasoning & creativity - best quality, cost no object
  large: {
    provider: {
      name: "openrouter",
      model: "openai/gpt-5",
    } as AIProvider,
    reasoningEffort: "high" as const, // Maximum reasoning for complex tasks
    fallbackProviders: [
      { name: "openrouter", model: "google/gemini-2.5-pro" },
      { name: "openrouter", model: "anthropic/claude-sonnet-4" },
      { name: "openrouter", model: "mistralai/mistral-large-2411" },
      { name: "openrouter", model: "openai/gpt-5-mini" },
    ] as AIProvider[],
  },

  // Balanced quality/speed - professional work with efficiency
  medium: {
    provider: {
      name: "openrouter",
      model: "openai/gpt-5",
    } as AIProvider,
    reasoningEffort: "medium" as const, // Balanced reasoning
    fallbackProviders: [
      { name: "openrouter", model: "google/gemini-2.5-pro" }, // Prioritized
      { name: "openrouter", model: "anthropic/claude-sonnet-4" },
      { name: "openrouter", model: "openai/gpt-5-mini" },
      { name: "openrouter", model: "mistralai/mistral-large-2411" },
    ] as AIProvider[],
  },

  // Fast & efficient - quick tasks with good quality
  small: {
    provider: {
      name: "openrouter",
      model: "openai/gpt-5-mini",
    } as AIProvider,
    reasoningEffort: "low" as const,
    fallbackProviders: [
      { name: "openrouter", model: "google/gemini-2.5-flash" },
      { name: "openrouter", model: "anthropic/claude-3-5-haiku-20241022" },
      { name: "openrouter", model: "mistralai/mistral-small-2412" },
    ] as AIProvider[],
  },

  // Ultra-lightweight - simple tasks, maximum speed
  tiny: {
    provider: {
      name: "openrouter",
      model: "openai/gpt-5-nano",
    } as AIProvider,
    reasoningEffort: "low" as const,
    fallbackProviders: [
      { name: "openrouter", model: "google/gemini-2.5-flash-lite" },
      { name: "openrouter", model: "anthropic/claude-3-5-haiku-20241022" },
    ] as AIProvider[],
  },

  // For vision/image analysis tasks
  vision: {
    provider: {
      name: "openrouter",
      model: "qwen/qwen2.5-vl-72b-instruct",
    } as AIProvider,
    fallbackProviders: [
      { name: "openrouter", model: "google/gemini-2.5-flash" },
      { name: "openrouter", model: "meta-llama/llama-3.2-90b-vision-instruct" },
      // Could add GPT-5 vision here when multimodal support is confirmed
    ] as AIProvider[],
  },

  // Future: Could add different chains for different purposes
  // accurate: { ... },  // For fact-checking
  // budget: { ... },    // For high-volume, low-priority tasks
};

/**
 * Temperature settings for different generation tasks
 * Higher = more creative/random, Lower = more focused/deterministic
 */
export const TEMPERATURES = {
  // Size-based defaults
  large: 0.9, // More creative for complex tasks
  medium: 0.8, // Balanced creativity
  small: 0.7, // More focused for speed
  tiny: 0.6, // Deterministic for simple tasks

  // Task-specific overrides (if needed)
  outline: 0.8, // Standard creativity for outlines
  outlineWithVariety: 0.9, // Higher temp when avoiding repeated outlines
  revision: 0.7, // More focused for revisions
  article: 0.8, // Standard creativity for articles
  imagePrompt: 0.8, // Creative for image generation
};

/**
 * Token limits for different content types
 * These are optimized for speed and cost while maintaining quality
 */
export const MAX_TOKENS = {
  // Size-based defaults
  large: 4000, // Maximum tokens for complex reasoning
  medium: 2000, // Balanced token limit
  small: 1000, // Efficient token usage
  tiny: 500, // Minimal tokens for speed

  // Task-specific limits (when needed)
  outline: 150, // Brief 1-2 sentence outlines
  outlineImproved: 200, // Slightly more for improvements
  header: 100, // Headlines are short
  summary: 200, // 2-3 sentence summaries
  content: 1000, // Main article body
  article: 3000, // Full article generation
  imagePrompt: 3000, // Detailed image descriptions (significantly increased for GPT-5)
  revision: 200, // General revision tasks
};

/**
 * Helper to get the full provider configuration
 * This ensures consistent usage across all AI calls
 */
export function getAIConfig(useCase: keyof typeof AI_MODELS = "medium") {
  const config = AI_MODELS[useCase];
  return {
    provider: config.provider,
    fallbackProviders: config.fallbackProviders,
    reasoningEffort:
      "reasoningEffort" in config ? config.reasoningEffort : undefined,
  };
}
