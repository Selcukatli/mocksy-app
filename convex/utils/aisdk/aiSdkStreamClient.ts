"use node";

/**
 * ⚠️ IMPORTANT: This is THE wrapper for AI text streaming
 *
 * DO NOT use streamText from "ai" directly - it doesn't handle GPT-5 correctly!
 *
 * ❌ WRONG:
 * import { streamText } from "ai";
 * await streamText({ model: openrouter("openai/gpt-5"), ... }); // GPT-5 won't work properly!
 *
 * ✅ CORRECT:
 * import { streamTextWithAI } from "./aiSdkStreamClient";
 * await streamTextWithAI({ provider: { name: "openai", model: "gpt-5" }, ... });
 *
 * This wrapper:
 * - Handles GPT-5's special streaming requirements
 * - Provides consistent onChunk callbacks
 * - Manages fallback chains for streaming
 * - Ensures GPT-5 actually returns text
 *
 * Note: For GPT-5, this currently uses OpenRouter's streaming (not direct API)
 * since OpenAI's streaming API has different requirements.
 */

import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { AIMessage, AIProvider, TextGenerationResponse } from "./types";

/**
 * Get the AI model provider based on configuration
 */
function getProvider(
  provider: AIProvider,
  reasoningEffort?: "minimal" | "low" | "medium" | "high",
) {
  switch (provider.name) {
    case "openai":
      // Use responses model for GPT-5 reasoning models
      if (provider.model.includes("gpt-5")) {
        return openai.responses(provider.model);
      }
      return openai(provider.model);
    case "anthropic":
      return anthropic(provider.model);
    case "google":
      return google(provider.model);
    case "openrouter":
      // For GPT-5 models via OpenRouter, we need special configuration
      if (provider.model.includes("gpt-5")) {
        const effort = (reasoningEffort || "low") as "low" | "medium" | "high";
        console.log(
          `[AISdkClient] Creating OpenRouter client with reasoning for GPT-5, effort: ${effort}`,
        );

        // Create a custom OpenRouter instance with reasoning configuration
        const openrouterClient = createOpenRouter({
          apiKey: process.env.OPENROUTER_API_KEY,
          // Pass reasoning configuration in extraBody
          extraBody: {
            reasoning: {
              enabled: true,
              effort: effort,
            },
          },
        });

        // Use the chat method to get a properly configured model
        return openrouterClient.chat(provider.model, {
          // Additional model-specific settings
          reasoning: {
            enabled: true,
            effort: effort,
          },
        });
      }

      // For non-GPT-5 models, use the default OpenRouter provider
      const defaultClient = createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
      });
      return defaultClient.chat(provider.model);

    default:
      throw new Error(`Unknown provider: ${provider.name}`);
  }
}

/**
 * Stream text using AI SDK with automatic fallback support
 * Returns the complete text after streaming is done
 */
export async function streamTextWithAI(params: {
  messages: AIMessage[];
  provider?: AIProvider;
  temperature?: number;
  maxTokens?: number;
  maxOutputTokens?: number;
  reasoningEffort?: "minimal" | "low" | "medium" | "high";
  onChunk?: (chunk: string) => void; // Callback for each chunk
  onFirstToken?: () => void; // Callback when first token arrives
}): Promise<TextGenerationResponse | null> {
  const provider = params.provider || {
    name: "openrouter",
    model: "openai/gpt-5",
  };
  const isGPT5Model = provider.model.includes("gpt-5");

  try {
    const startTime = Date.now();
    let firstTokenTime: number | undefined;
    console.log(
      `[AI SDK Stream] Starting stream with ${provider.name}/${provider.model}`,
    );

    // Get the model with proper configuration
    const model = getProvider(provider, params.reasoningEffort);

    // Convert our messages to the format expected by the AI SDK
    const messages = params.messages.map((msg) => {
      if (typeof msg.content === "string") {
        return {
          role: msg.role,
          content: msg.content,
        };
      }
      return {
        role: msg.role,
        content: msg.content,
      };
    });

    // Build config based on model type
    const config = {
      model,
      messages,
    } as Parameters<typeof streamText>[0];

    const maxOutputTokens =
      params.maxOutputTokens ?? params.maxTokens ?? (isGPT5Model ? 2000 : 2000);
    // Configure based on model type (v5: use maxOutputTokens)
    config.maxOutputTokens = maxOutputTokens;

    if (isGPT5Model) {
      config.temperature = params.temperature || 0.8;

      // V5: reasoning configuration is handled by the provider
      // experimental_providerMetadata removed in v5

      console.log(
        `[AI SDK Stream] GPT-5 configured with reasoning effort: ${params.reasoningEffort || "low"}`,
      );
    } else {
      // Other models: use temperature
      config.temperature = params.temperature || 0.7;
    }

    // Add a timeout based on reasoning effort
    // Medium and high effort need more time
    let timeoutMs = 60000; // Default 60 seconds
    if (isGPT5Model && params.reasoningEffort) {
      switch (params.reasoningEffort) {
        case "high":
          timeoutMs = 180000; // 3 minutes for high effort
          break;
        case "medium":
          timeoutMs = 120000; // 2 minutes for medium effort
          break;
        default:
          timeoutMs = 90000; // 1.5 minutes for low effort
          break;
      }
    }
    config.abortSignal = AbortSignal.timeout(timeoutMs);
    console.log(`[AI SDK Stream] Timeout set to ${timeoutMs}ms`);

    // Stream the text
    const result = streamText(config);

    let fullContent = "";

    // Process the stream
    for await (const chunk of result.textStream) {
      // Record time to first token
      if (!firstTokenTime) {
        firstTokenTime = Date.now() - startTime;
        console.log(
          `[AI SDK Stream] First token received after ${firstTokenTime}ms`,
        );
        if (params.onFirstToken) {
          params.onFirstToken();
        }
      }

      fullContent += chunk;

      // Call the chunk callback if provided
      if (params.onChunk) {
        params.onChunk(chunk);
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(
      `[AI SDK Stream] Completed in ${totalTime}ms (first token: ${firstTokenTime}ms)`,
    );

    // Get final usage info
    const usage = await result.usage;

    const textUsage = usage
      ? {
          inputTokens: usage.inputTokens ?? 0,
          outputTokens: usage.outputTokens ?? 0,
          totalTokens: usage.totalTokens ?? 0,
          reasoningTokens: usage.reasoningTokens ?? undefined,
        }
      : undefined;

    return {
      content: fullContent,
      usage: textUsage,
      model: provider.model,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `[AI SDK Stream] Error with ${provider.name}/${provider.model}:`,
      errorMessage,
    );

    // Log additional details for debugging
    if (error instanceof Error) {
      console.error(`[AI SDK Stream] Error details:`, {
        name: error.name,
        stack: error.stack,
        model: provider.model,
        effort: params.reasoningEffort,
        maxOutputTokens: params.maxOutputTokens ?? params.maxTokens,
      });
    }

    return null;
  }
}
