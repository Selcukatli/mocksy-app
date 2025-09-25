"use node";

/**
 * ⚠️ IMPORTANT: This is THE wrapper for AI text generation
 *
 * DO NOT use generateText from "ai" directly - it doesn't handle GPT-5 correctly!
 *
 * ❌ WRONG:
 * import { generateText } from "ai";
 * await generateText({ model: openrouter("openai/gpt-5"), ... }); // Returns empty text!
 *
 * ✅ CORRECT:
 * import { generateTextWithAI } from "./aiSdkClient";
 * await generateTextWithAI({ provider: { name: "openai", model: "gpt-5" }, ... });
 *
 * This wrapper:
 * - Detects GPT-5 and bypasses the AI SDK
 * - Makes direct OpenAI API calls for GPT-5
 * - Handles fallback chains automatically
 * - Returns actual text content (not empty!)
 */

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openrouter } from "@openrouter/ai-sdk-provider";
import type {
  AIMessage,
  AIProvider,
  TextGenerationParams,
  TextGenerationResponse,
  ToolCall,
  ToolResult,
} from "./types";

/**
 * Get the AI model provider based on configuration
 */
function getProvider(provider: AIProvider) {
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
      // Use official OpenRouter provider
      return openrouter(provider.model);
    default:
      throw new Error(`Unsupported AI provider: ${provider.name}`);
  }
}

/**
 * Get default provider configuration
 */
function getDefaultProvider(): AIProvider {
  // Check for OpenRouter API key first (for access to many models)
  if (process.env.OPENROUTER_API_KEY) {
    return {
      name: "openrouter",
      model: "mistralai/mistral-small-3.2-24b-instruct",
    };
  }

  // Check for Google/Gemini API key (for fastest/cheapest)
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
    return { name: "google", model: "gemini-2.5-flash" };
  }

  // Check for OpenAI API key
  if (process.env.OPENAI_API_KEY) {
    return { name: "openai", model: "gpt-4.1-2025-04-14" };
  }

  // Fallback to Anthropic if available
  if (process.env.ANTHROPIC_API_KEY) {
    return { name: "anthropic", model: "claude-sonnet-4-20250514" };
  }

  throw new Error(
    "No AI provider API keys found. Please set OPENROUTER_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY or ANTHROPIC_API_KEY",
  );
}

/**
 * Generate text using AI SDK with automatic fallback support
 *
 * IMPORTANT: GPT-5 Routing Behavior
 * ----------------------------------
 * When a GPT-5 model is detected (from either 'openai' or 'openrouter' provider):
 * 1. The function bypasses the AI SDK entirely
 * 2. Calls `callGPT5Direct` which makes a direct HTTP POST to OpenAI's API
 * 3. This is ~1.3x faster than going through OpenRouter
 * 4. Properly handles GPT-5's response format and returns text content
 *
 * This special handling is necessary because:
 * - GPT-5 models return responses in a different format than other models
 * - The AI SDK and OpenRouter don't fully support GPT-5's reasoning models yet
 * - Direct API calls ensure we get the actual text content from GPT-5
 *
 * For all other models, the standard AI SDK flow is used with the configured provider.
 *
 * @param params - Text generation parameters including messages, provider, and options
 * @returns Generated text response with content, usage stats, and model info
 */
export async function generateTextWithAI(
  params: TextGenerationParams,
): Promise<TextGenerationResponse | null> {
  const providers = [
    params.provider || getDefaultProvider(),
    ...(params.fallbackProviders || []),
  ];
  let lastError: Error | null = null;
  const maxOutputTokens = params.maxOutputTokens ?? params.maxTokens ?? 2000;

  // Try each provider in order
  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    const isLastProvider = i === providers.length - 1;
    const isGPT5Model = provider.model.includes("gpt-5");

    try {
      const startTime = Date.now();
      console.log(
        `[AI SDK] Attempting with ${provider.name}/${provider.model} at ${new Date(startTime).toISOString()}`,
      );

      // OPTIMIZATION UPDATE: v5 SDK's openai.responses() model is 2x faster than direct API
      // Direct API: ~1500ms, v5 SDK responses: ~860ms
      // So we now let the SDK handle GPT-5 through the normal flow
      // The getProvider() function already correctly uses openai.responses() for GPT-5
      /*
      if ((provider.name === 'openai' || provider.name === 'openrouter') && isGPT5Model) {
        console.log(`[AI SDK] Using direct OpenAI API for ${provider.model} (faster than OpenRouter)`);
        const modelName = provider.model.replace('openai/', ''); // Remove openai/ prefix if present
        const result = await callGPT5Direct(
          modelName,
          params.messages,
          maxOutputTokens,
          params.reasoningEffort || 'minimal'
        );

        if (result) {
          return result;
        }
        // If direct API fails, fall through to regular flow
        console.log(`[AI SDK] Direct API failed, falling back to ${provider.name}`);
      }
      */

      // Use AI SDK for all other cases (including GPT-5 via OpenRouter)
      const model = getProvider(provider);

      // Build the configuration object
      // Convert our messages to the format expected by the AI SDK
      const messages = params.messages.map((msg) => {
        // If content is a string, use it directly
        if (typeof msg.content === "string") {
          return {
            role: msg.role,
            content: msg.content,
          };
        }
        // If content is an array, keep all parts (text and images)
        return {
          role: msg.role,
          content: msg.content,
        };
      });

      // Build config based on model type
      const baseConfig = {
        model,
        messages,
        maxOutputTokens,
      } as const;

      const config = isGPT5Model
        ? baseConfig
        : {
            ...baseConfig,
            temperature: params.temperature || 0.7,
          };

      // Build final config with tools if provided
      const finalConfig = params.tools
        ? {
            ...config,
            tools: params.tools,
            toolChoice: params.toolChoice || "auto",
            maxSteps: params.maxSteps || 1,
          }
        : config;

      const result = await generateText(
        finalConfig as Parameters<typeof generateText>[0],
      );

      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(
        `[AI SDK] ${provider.name}/${provider.model} completed in ${duration}ms (${(duration / 1000).toFixed(2)}s)`,
      );

      if (result.usage) {
        console.log(
          `[AI SDK] Token usage - Input: ${result.usage.inputTokens ?? 0}, Output: ${result.usage.outputTokens ?? 0}, Total: ${result.usage.totalTokens ?? 0}`,
        );
      }

      // Build the response
      if (!result.text && result.usage?.outputTokens && result.usage.outputTokens > 0) {
        console.warn(
          `[AI SDK] Warning: Model generated ${result.usage.outputTokens} tokens but returned empty text. ` +
          `This usually means the token limit was hit mid-generation. Consider increasing maxOutputTokens.`
        );
      }
      
      const response: TextGenerationResponse = {
        content: result.text || "",
        usage: result.usage
          ? {
              inputTokens: result.usage.inputTokens ?? 0,
              outputTokens: result.usage.outputTokens ?? 0,
              totalTokens: result.usage.totalTokens ?? 0,
              reasoningTokens: result.usage.reasoningTokens ?? undefined,
            }
          : undefined,
        model: provider.model,
      };

      // Add tool-related data if tools were used
      if (params.tools && result.steps) {
        response.steps = result.steps;

        // Extract tool calls and results from steps
        const toolCalls: ToolCall[] = [];
        const toolResults: ToolResult[] = [];

        for (const step of result.steps) {
          if (step.toolCalls) {
            // Map v5 tool calls to our format
            for (const call of step.toolCalls) {
              const toolCall = call as {
                toolCallId: string;
                toolName: string;
                args?: unknown;
                input?: unknown;
              };
              toolCalls.push({
                toolCallId: toolCall.toolCallId,
                toolName: toolCall.toolName,
                args: toolCall.args ?? toolCall.input ?? null,
              });
            }
          }
          if (step.toolResults) {
            // Map v5 tool results to our format
            for (const res of step.toolResults) {
              const toolResult = res as {
                toolCallId: string;
                toolName: string;
                result?: unknown;
                output?: unknown;
              };
              toolResults.push({
                toolCallId: toolResult.toolCallId,
                toolName: toolResult.toolName,
                result: toolResult.result ?? toolResult.output ?? null,
              });
            }
          }
        }

        if (toolCalls.length > 0) {
          response.toolCalls = toolCalls;
        }
        if (toolResults.length > 0) {
          response.toolResults = toolResults;
        }
      }

      return response;
    } catch (error: unknown) {
      lastError = error as Error;
      console.error(
        `[AI SDK] Failed with ${provider.name}/${provider.model}:`,
        (error as Error).message || error,
      );

      // Check if it's a retryable error (like 529 overload)
      const isRetryable =
        (error as { statusCode?: number })?.statusCode === 529 ||
        (error as { cause?: { statusCode?: number } })?.cause?.statusCode ===
          529 ||
        (error as { lastError?: { statusCode?: number } })?.lastError
          ?.statusCode === 529 ||
        ((error as { errors?: Array<{ statusCode?: number }> })?.errors &&
          (error as { errors: Array<{ statusCode?: number }> }).errors.some(
            (e) => e.statusCode === 529,
          ));

      if (!isLastProvider && isRetryable) {
        console.log(`[AI SDK] Error is retryable, trying next provider...`);
        continue;
      }

      // If not retryable or last provider, throw the error
      if (isLastProvider) {
        console.error(`[AI SDK] All providers exhausted, throwing error`);
        throw lastError;
      }
    }
  }

  // Should never reach here, but just in case
  throw lastError || new Error("Failed to generate text with all providers");
}

/**
 * Create a system prompt for consistent AI behavior
 */
export function createSystemPrompt(
  role: string,
  instructions: string,
): AIMessage {
  return {
    role: "system",
    content: `You are ${role}. ${instructions}`,
  };
}

/**
 * Create a user message
 */
export function createUserMessage(content: string): AIMessage {
  return {
    role: "user",
    content,
  };
}

/**
 * Create a user message with images
 */
export function createUserMessageWithImages(
  text: string,
  images: Array<string>,
): AIMessage {
  return {
    role: "user",
    content: [
      { type: "text", text },
      ...images.map((image) => ({
        type: "image" as const,
        image,
      })),
    ],
  };
}
