"use node";

import { internalAction } from "../../_generated/server";
import { v } from "convex/values";
import { generateTextWithAI } from "./aiSdkClient";
import { getAIConfig } from "./aiModels";

/**
 * Internal action for other Convex functions to use for AI text generation.
 * This is the main production API for AI SDK usage within Convex.
 *
 * Features:
 * - Multi-provider support (OpenAI, Anthropic, Google, OpenRouter)
 * - Tool/function calling support
 * - Multimodal message support (text and images)
 * - Token usage tracking
 *
 * @example
 * // Simple text generation
 * await ctx.runAction(internal.utils.aisdk.aiSdkActions.generateTextInternal, {
 *   messages: [
 *     { role: "system", content: "You are a helpful assistant" },
 *     { role: "user", content: "Hello!" }
 *   ]
 * });
 *
 * @example
 * // With tools
 * await ctx.runAction(internal.utils.aisdk.aiSdkActions.generateTextInternal, {
 *   messages: [...],
 *   tools: {
 *     search: searchTool,
 *     calculate: calculateTool
 *   },
 *   toolChoice: 'auto'
 * });
 *
 * @example
 * // With model preset
 * await ctx.runAction(internal.utils.aisdk.aiSdkActions.generateTextInternal, {
 *   messages: [...],
 *   modelPreset: 'fast' // Uses fast model configuration (e.g., Gemini Flash)
 * });
 */
export const generateTextInternal = internalAction({
  args: {
    messages: v.array(
      v.object({
        role: v.union(
          v.literal("user"),
          v.literal("assistant"),
          v.literal("system"),
        ),
        content: v.union(
          v.string(),
          v.array(
            v.union(
              v.object({ type: v.literal("text"), text: v.string() }),
              v.object({
                type: v.literal("image"),
                image: v.string(),
                mimeType: v.optional(v.string()),
              }),
            ),
          ),
        ),
      }),
    ),
    // Model selection - either use a preset or specify provider details
    modelPreset: v.optional(
      v.union(
        v.literal("tiny"),
        v.literal("small"),
        v.literal("medium"),
        v.literal("large"),
        v.literal("vision"),
      ),
    ),
    provider: v.optional(
      v.object({
        name: v.union(
          v.literal("openai"),
          v.literal("anthropic"),
          v.literal("google"),
          v.literal("openrouter"),
        ),
        model: v.string(),
      }),
    ),
    temperature: v.optional(v.number()),
    maxTokens: v.optional(v.number()),
    maxOutputTokens: v.optional(v.number()),
    // GPT-5 reasoning optimization
    reasoningEffort: v.optional(
      v.union(
        v.literal("minimal"),
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
      ),
    ),
    // Tool-related parameters
    tools: v.optional(v.any()), // Tools with their schemas
    toolChoice: v.optional(
      v.union(v.literal("auto"), v.literal("none"), v.literal("required")),
    ),
    maxSteps: v.optional(v.number()),
    // Fallback providers
    fallbackProviders: v.optional(
      v.array(
        v.object({
          name: v.union(
            v.literal("openai"),
            v.literal("anthropic"),
            v.literal("google"),
            v.literal("openrouter"),
          ),
          model: v.string(),
        }),
      ),
    ),
  },
  returns: v.union(
    v.object({
      content: v.string(),
      usage: v.optional(
        v.object({
          inputTokens: v.number(),
          outputTokens: v.number(),
          totalTokens: v.number(),
          reasoningTokens: v.optional(v.number()),
        }),
      ),
      model: v.optional(v.string()),
      // Tool-related returns
      toolCalls: v.optional(v.array(v.any())),
      toolResults: v.optional(v.array(v.any())),
      steps: v.optional(v.array(v.any())),
    }),
    v.null(),
  ),
  handler: async (_ctx, args) => {
    // If modelPreset is specified, use the configuration from aiModels
    let provider = args.provider;
    let fallbackProviders = args.fallbackProviders;

    if (args.modelPreset) {
      const aiConfig = getAIConfig(args.modelPreset);
      // Only override if not explicitly provided
      provider = provider || aiConfig.provider;
      fallbackProviders = fallbackProviders || aiConfig.fallbackProviders;
    }

    const result = await generateTextWithAI({
      messages: args.messages,
      provider,
      temperature: args.temperature,
      maxTokens: args.maxTokens,
      maxOutputTokens: args.maxOutputTokens ?? args.maxTokens,
      reasoningEffort: args.reasoningEffort,
      tools: args.tools,
      toolChoice: args.toolChoice,
      maxSteps: args.maxSteps,
      fallbackProviders,
    });

    // Log the model preset used if available
    if (args.modelPreset && result?.model) {
      console.log(
        `[AI SDK Actions] Model preset '${args.modelPreset}' used model: ${result.model}`,
      );
    }

    return result;
  },
});
