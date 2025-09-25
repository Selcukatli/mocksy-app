// Business logic configuration for AI model selection
// This defines which models to use and in what order based on current availability and performance

import { AIProvider } from "./types";

/**
 * AI model configurations for different use cases
 * Strategy: Use OpenRouter for everything (unified interface, handles all model quirks)
 */
export const AI_MODELS = {
  // For creative content generation (articles, outlines, revisions)
  creative: {
    provider: { 
      name: "openrouter", 
      model: "openai/gpt-5" 
    } as AIProvider,
    fallbackProviders: [
      { name: "openrouter", model: "anthropic/claude-sonnet-4-20250514" },
      { name: "openrouter", model: "openai/gpt-5-mini" },
      { name: "openrouter", model: "mistralai/mistral-large-2411" },
      { name: "openrouter", model: "anthropic/claude-3-5-haiku-20241022" }
    ] as AIProvider[]
  },
  
  // For quick outline generation (prioritize speed while maintaining quality)
  outline: {
    provider: {
      name: "openrouter",
      model: "openai/gpt-5-mini" // Faster than full GPT-5, still good quality
    } as AIProvider,
    fallbackProviders: [
      { name: "openrouter", model: "anthropic/claude-3-5-haiku-20241022" }, // Very fast
      { name: "openrouter", model: "google/gemini-2.5-flash" },
      { name: "openrouter", model: "openai/gpt-5-nano" }
    ] as AIProvider[]
  },
  
  // For fast routing/orchestration tasks (tool selection, intent analysis)
  fast: {
    provider: { 
      name: "openrouter", 
      model: "openai/gpt-5-nano"
    } as AIProvider,
    fallbackProviders: [
      { name: "openrouter", model: "openai/gpt-5-mini" },
      { name: "openrouter", model: "anthropic/claude-3-5-haiku-20241022" },
      { name: "openrouter", model: "google/gemini-2.5-flash" },
      { name: "openrouter", model: "google/gemini-1.5-flash" }
    ] as AIProvider[]
  },
  
  // For vision/image analysis tasks
  vision: {
    provider: { 
      name: "openrouter", 
      model: "qwen/qwen2.5-vl-72b-instruct"
    } as AIProvider,
    fallbackProviders: [
      { name: "openrouter", model: "google/gemini-2.0-flash-001" },
      { name: "openrouter", model: "meta-llama/llama-3.2-90b-vision-instruct" }
      // Could add GPT-5 vision here when multimodal support is confirmed
    ] as AIProvider[]
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
  outline: 0.8,              // Standard creativity for outlines
  outlineWithVariety: 0.9,   // Higher temp when avoiding repeated outlines
  revision: 0.7,             // More focused for revisions
  article: 0.8,              // Standard creativity for articles
  imagePrompt: 0.8,          // Creative for image generation
};

/**
 * Token limits for different content types
 * These are optimized for speed and cost while maintaining quality
 */
export const MAX_TOKENS = {
  // Outlines
  outline: 150,              // Brief 1-2 sentence outlines
  outlineImproved: 200,      // Slightly more for improvements
  
  // Article components
  header: 100,               // Headlines are short
  summary: 200,              // 2-3 sentence summaries
  content: 1000,             // Main article body
  article: 3000,             // Full article generation
  
  // Other
  imagePrompt: 3000,         // Detailed image descriptions (significantly increased for GPT-5)
  revision: 200,             // General revision tasks
};

/**
 * Helper to get the full provider configuration
 * This ensures consistent usage across all AI calls
 */
export function getAIConfig(useCase: keyof typeof AI_MODELS = 'creative') {
  return {
    provider: AI_MODELS[useCase].provider,
    fallbackProviders: AI_MODELS[useCase].fallbackProviders
  };
}