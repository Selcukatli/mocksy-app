"use node";

import { action } from "../../../_generated/server";
import { v } from "convex/values";
import { generateTextWithAI } from "../aiSdkClient";
import { getAIConfig } from "../aiModels";

// Test result types
interface TestResult {
  success: boolean;
  model?: string;
  provider?: string;
  response?: string;
  error?: string;
  duration?: number;
}

interface TestResults {
  tiny: TestResult | null;
  large: TestResult | null;
  small: TestResult | null;
  vision: TestResult | null;
  fallback: TestResult | null;
  errors: string[];
}

interface ModelTestResult {
  model: string;
  name: string;
  tests: Array<{
    test: string;
    success: boolean;
    response?: string;
    error?: string;
    duration: number;
  }>;
  totalTime: number;
  totalTokens: number;
  success: boolean;
  avgResponseTime?: number;
  avgTokens?: number;
}

/**
 * Test the AI SDK with different model presets
 */
export const testAllModelPresets = action({
  args: {},
  handler: async () => {
    console.log(
      "🚀 Starting AI SDK comprehensive tests (running in parallel)...\n",
    );

    const results: TestResults = {
      tiny: null,
      large: null,
      small: null,
      vision: null,
      fallback: null,
      errors: [],
    };

    try {
      // Run all tests in parallel for speed
      const [tinyTest, largeTest, smallTest, visionTest] = await Promise.all([
        // Test 1: Fast model for routing
        (async () => {
          console.log("1️⃣ Testing TINY model preset (GPT-5 Nano)...");
          try {
            const tinyResult = await generateTextWithAI({
              messages: [
                {
                  role: "system",
                  content:
                    "You are a concise assistant. Answer in 1-2 sentences.",
                },
                { role: "user", content: "What is 2+2?" },
              ],
              ...getAIConfig("tiny"),
              temperature: 0.3,
              maxTokens: 50,
            });

            if (tinyResult) {
              console.log(`✅ Tiny model success: ${tinyResult.model}`);
              console.log(
                `   Response: ${tinyResult.content.substring(0, 100)}...`,
              );
              console.log(
                `   Tokens: ${tinyResult.usage?.totalTokens || "N/A"}\n`,
              );
              return {
                success: true,
                response: tinyResult.content,
                model: tinyResult.model,
                provider: "openrouter",
              };
            }
            return null;
          } catch (error) {
            console.error(`❌ Tiny model failed:`, error);
            return { success: false, error: `Tiny model: ${error}` };
          }
        })(),

        // Test 2: Creative model for content generation
        (async () => {
          console.log(
            "2️⃣ Testing LARGE model preset (GPT-5 with high reasoning)...",
          );
          try {
            const largeResult = await generateTextWithAI({
              messages: [
                { role: "system", content: "You are a creative writer." },
                {
                  role: "user",
                  content:
                    "Write a one-sentence story about a robot learning to paint.",
                },
              ],
              ...getAIConfig("large"),
              temperature: 0.8,
              maxTokens: 100,
            });

            if (largeResult) {
              console.log(`✅ Large model success: ${largeResult.model}`);
              console.log(
                `   Response: ${largeResult.content.substring(0, 150)}...`,
              );
              console.log(
                `   Tokens: ${largeResult.usage?.totalTokens || "N/A"}\n`,
              );
              return {
                success: true,
                response: largeResult.content,
                model: largeResult.model,
                provider: "openrouter",
              };
            }
            return null;
          } catch (error) {
            console.error(`❌ Large model failed:`, error);
            return { success: false, error: `Large model: ${error}` };
          }
        })(),

        // Test 3: Outline model for quick generation
        (async () => {
          console.log("3️⃣ Testing SMALL model preset (GPT-5 Mini)...");
          try {
            const smallResult = await generateTextWithAI({
              messages: [
                { role: "system", content: "You create brief outlines." },
                {
                  role: "user",
                  content:
                    "Create a 3-point outline for a blog post about AI safety.",
                },
              ],
              ...getAIConfig("small"),
              temperature: 0.7,
              maxTokens: 150,
            });

            if (smallResult) {
              console.log(`✅ Small model success: ${smallResult.model}`);
              console.log(
                `   Response: ${smallResult.content.substring(0, 200)}...`,
              );
              console.log(
                `   Tokens: ${smallResult.usage?.totalTokens || "N/A"}\n`,
              );
              return {
                success: true,
                response: smallResult.content,
                model: smallResult.model,
                provider: "openrouter",
              };
            }
            return null;
          } catch (error) {
            console.error(`❌ Small model failed:`, error);
            return { success: false, error: `Small model: ${error}` };
          }
        })(),

        // Test 4: Vision model (text-only test since we're not providing images)
        (async () => {
          console.log("4️⃣ Testing VISION model preset (Qwen 2.5 VL)...");
          try {
            const visionResult = await generateTextWithAI({
              messages: [
                {
                  role: "system",
                  content: "You are a visual description assistant.",
                },
                {
                  role: "user",
                  content: "Describe what a sunset typically looks like.",
                },
              ],
              ...getAIConfig("vision"),
              temperature: 0.7,
              maxTokens: 100,
            });

            if (visionResult) {
              console.log(`✅ Vision model success: ${visionResult.model}`);
              console.log(
                `   Response: ${visionResult.content.substring(0, 150)}...`,
              );
              console.log(
                `   Tokens: ${visionResult.usage?.totalTokens || "N/A"}\n`,
              );
              return {
                success: true,
                response: visionResult.content,
                model: visionResult.model,
                provider: "openrouter",
              };
            }
            return null;
          } catch (error) {
            console.error(`❌ Vision model failed:`, error);
            return { success: false, error: `Vision model: ${error}` };
          }
        })(),
      ]);

      // Process results from parallel execution
      if (tinyTest && !("error" in tinyTest)) results.tiny = tinyTest;
      else if (tinyTest?.error) results.errors.push(tinyTest.error);

      if (largeTest && !("error" in largeTest)) results.large = largeTest;
      else if (largeTest?.error) results.errors.push(largeTest.error);

      if (smallTest && !("error" in smallTest)) results.small = smallTest;
      else if (smallTest?.error) results.errors.push(smallTest.error);

      if (visionTest && !("error" in visionTest)) results.vision = visionTest;
      else if (visionTest?.error) results.errors.push(visionTest.error);

      // Test 5: Fallback mechanism (intentionally use a model that might fail)
      console.log("5️⃣ Testing FALLBACK mechanism...");
      try {
        const fallbackResult = await generateTextWithAI({
          messages: [
            { role: "user", content: "Say 'fallback test successful'" },
          ],
          provider: { name: "openrouter", model: "nonexistent/model" },
          fallbackProviders: [
            { name: "openrouter", model: "openai/gpt-5-nano" },
            { name: "openrouter", model: "google/gemini-2.5-flash" },
          ],
          temperature: 0.3,
          maxTokens: 50,
        });

        if (fallbackResult) {
          results.fallback = {
            success: true,
            response: fallbackResult.content,
            model: fallbackResult.model,
            provider: "openrouter",
          };
          console.log(`✅ Fallback mechanism worked: ${fallbackResult.model}`);
          console.log(`   Response: ${fallbackResult.content}\n`);
        }
      } catch (error) {
        console.error(`❌ Fallback mechanism failed:`, error);
        results.errors.push(`Fallback: ${error}`);
      }
    } catch (error) {
      console.error("❌ Test suite error:", error);
      results.errors.push(`Suite: ${error}`);
    }

    // Summary
    console.log("\n📊 TEST SUMMARY:");
    console.log("================");

    const tests = ["tiny", "large", "small", "vision", "fallback"];
    const passed = tests.filter(
      (t) => results[t as keyof typeof results] !== null,
    );
    const failed = tests.filter(
      (t) => results[t as keyof typeof results] === null,
    );

    console.log(`✅ Passed: ${passed.length}/${tests.length}`);
    if (passed.length > 0) {
      passed.forEach((t) => {
        const result = results[t as keyof typeof results];
        const modelName =
          result && typeof result === "object" && "model" in result
            ? result.model
            : "Unknown model";
        console.log(`   - ${t.toUpperCase()}: ${modelName}`);
      });
    }

    if (failed.length > 0) {
      console.log(`\n❌ Failed: ${failed.length}/${tests.length}`);
      failed.forEach((t) => console.log(`   - ${t.toUpperCase()}`));
    }

    if (results.errors.length > 0) {
      console.log(`\n⚠️ Errors encountered:`);
      results.errors.forEach((e) => console.log(`   - ${e}`));
    }

    return {
      summary: `Tests completed: ${passed.length}/${tests.length} passed`,
      results,
      passed: passed.length,
      failed: failed.length,
      total: tests.length,
    };
  },
});

/**
 * Test a specific model configuration
 */
export const testSpecificModel = action({
  args: {
    provider: v.string(),
    model: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`🧪 Testing ${args.provider}/${args.model}...`);

    try {
      const result = await generateTextWithAI({
        messages: [{ role: "user", content: args.prompt }],
        provider: {
          name: args.provider as
            | "openai"
            | "anthropic"
            | "google"
            | "openrouter",
          model: args.model,
        },
        temperature: 0.7,
        maxTokens: 100,
      });

      if (result) {
        console.log(`✅ Success!`);
        console.log(`Model: ${result.model}`);
        console.log(`Response: ${result.content}`);
        console.log(`Tokens used: ${result.usage?.totalTokens || "N/A"}`);

        return {
          success: true,
          content: result.content,
          model: result.model,
          usage: result.usage,
        };
      }

      return {
        success: false,
        error: "No result returned",
      };
    } catch (error) {
      console.error(`❌ Error:`, error);
      return {
        success: false,
        error: String(error),
      };
    }
  },
});

/**
 * Test multimodal capabilities with image + text
 */
export const testMultimodalWithImage = action({
  args: {
    provider: v.string(),
    model: v.string(),
    prompt: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`🖼️ Testing multimodal: ${args.provider}/${args.model}...`);
    console.log(`Image URL: ${args.imageUrl}`);
    console.log(`Prompt: ${args.prompt}`);

    try {
      // Convert image URL to base64 or use directly
      const imageContent = args.imageUrl.startsWith("data:")
        ? args.imageUrl
        : args.imageUrl;

      const result = await generateTextWithAI({
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: args.prompt },
              {
                type: "image",
                image: imageContent,
                mimeType: "image/jpeg",
              },
            ],
          },
        ],
        provider: {
          name: args.provider as
            | "openai"
            | "anthropic"
            | "google"
            | "openrouter",
          model: args.model,
        },
        temperature: 0.7,
        maxTokens: 200,
      });

      if (result) {
        console.log(`✅ Multimodal test success!`);
        console.log(`Model: ${result.model}`);
        console.log(`Response: ${result.content.substring(0, 500)}...`);
        console.log(`Tokens used: ${result.usage?.totalTokens || "N/A"}`);

        return {
          success: true,
          content: result.content,
          model: result.model,
          usage: result.usage,
        };
      }

      return {
        success: false,
        error: "No result returned",
      };
    } catch (error) {
      console.error(`❌ Multimodal test failed:`, error);
      return {
        success: false,
        error: String(error),
      };
    }
  },
});

/**
 * Test all vision models with a sample image
 */
export const testAllVisionModels = action({
  args: {
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("🎨 Starting comprehensive vision model tests...\n");

    // Use a default test image if none provided
    const testImageUrl =
      args.imageUrl ||
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400";

    const visionModels = [
      // Direct Anthropic API
      {
        provider: "anthropic",
        model: "claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet (Direct)",
      },
      {
        provider: "anthropic",
        model: "claude-3-opus-20240229",
        name: "Claude 3 Opus (Direct)",
      },

      // Claude via OpenRouter (including Claude 4.x)
      {
        provider: "openrouter",
        model: "anthropic/claude-opus-4.1",
        name: "Claude Opus 4.1",
      },
      {
        provider: "openrouter",
        model: "anthropic/claude-opus-4",
        name: "Claude Opus 4",
      },
      {
        provider: "openrouter",
        model: "anthropic/claude-sonnet-4",
        name: "Claude Sonnet 4",
      },
      {
        provider: "openrouter",
        model: "anthropic/claude-3.5-sonnet",
        name: "Claude 3.5 Sonnet (OR)",
      },
      {
        provider: "openrouter",
        model: "anthropic/claude-3-opus",
        name: "Claude 3 Opus (OR)",
      },
      {
        provider: "openrouter",
        model: "anthropic/claude-3-5-haiku-20241022",
        name: "Claude 3.5 Haiku",
      },

      // Google models (Direct API)
      {
        provider: "google",
        model: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash (Direct)",
      },

      // Google AI Studio models via OpenRouter (2.5 generation only)
      {
        provider: "openrouter",
        model: "google/gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
      },
      {
        provider: "openrouter",
        model: "google/gemini-2.5-flash",
        name: "Gemini 2.5 Flash (OR)",
      },
      {
        provider: "openrouter",
        model: "google/gemini-2.5-flash-lite",
        name: "Gemini 2.5 Flash Lite",
      },

      // Other vision models
      {
        provider: "openrouter",
        model: "qwen/qwen2.5-vl-72b-instruct",
        name: "Qwen Vision 72B",
      },
      { provider: "openrouter", model: "openai/gpt-4o", name: "GPT-4o Vision" },
      {
        provider: "openrouter",
        model: "openai/gpt-4o-mini",
        name: "GPT-4o Mini Vision",
      },
    ];

    // Run all vision models in parallel
    const modelPromises = visionModels.map(async (model) => {
      console.log(`\n📸 Testing ${model.name}...`);

      try {
        const result = await generateTextWithAI({
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Describe this image in one sentence. What do you see?",
                },
                {
                  type: "image",
                  image: testImageUrl,
                  mimeType: "image/jpeg",
                },
              ],
            },
          ],
          provider: {
            name: model.provider as
              | "openai"
              | "anthropic"
              | "google"
              | "openrouter",
            model: model.model,
          },
          temperature: 0.7,
          maxTokens: 100,
        });

        if (result && result.content) {
          console.log(`✅ ${model.name}: Success!`);
          console.log(`   Response: ${result.content.substring(0, 150)}...`);
          console.log(`   Tokens: ${result.usage?.totalTokens || "N/A"}`);

          return {
            model: model.name,
            provider: model.provider,
            modelId: model.model,
            success: true,
            response: result.content,
            tokens: result.usage?.totalTokens,
          };
        } else {
          console.log(`⚠️ ${model.name}: Empty response`);
          return {
            model: model.name,
            provider: model.provider,
            modelId: model.model,
            success: false,
            error: "Empty response",
          };
        }
      } catch (error) {
        console.error(`❌ ${model.name}: Failed with error:`, error);
        return {
          model: model.name,
          provider: model.provider,
          modelId: model.model,
          success: false,
          error: String(error),
        };
      }
    });

    // Wait for all models to complete
    const results = await Promise.all(modelPromises);

    // Summary
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    console.log("\n📊 VISION MODEL TEST SUMMARY:");
    console.log("==============================");
    console.log(`✅ Successful: ${successful.length}/${results.length}`);
    successful.forEach((r) => {
      console.log(`   - ${r.model}: "${r.response?.substring(0, 50)}..."`);
    });

    if (failed.length > 0) {
      console.log(`\n❌ Failed: ${failed.length}/${results.length}`);
      failed.forEach((r) => {
        console.log(`   - ${r.model}: ${r.error}`);
      });
    }

    return {
      summary: `Vision tests: ${successful.length}/${results.length} passed`,
      results,
      testImageUrl,
    };
  },
});

/**
 * Test all GPT-5 models (Full, Mini, Nano)
 */
export const testAllGPT5Models = action({
  args: {},
  handler: async () => {
    console.log(
      "🚀 Testing all GPT-5 models via OpenRouter (running in parallel)...\n",
    );

    const gpt5Models = [
      {
        model: "openai/gpt-5",
        name: "GPT-5 (Full)",
        description: "Most capable, highest quality",
      },
      {
        model: "openai/gpt-5-mini",
        name: "GPT-5 Mini",
        description: "Balanced speed and quality",
      },
      {
        model: "openai/gpt-5-nano",
        name: "GPT-5 Nano",
        description: "Fastest, most efficient",
      },
    ];

    const testPrompts = [
      {
        prompt: "What is 2+2? Answer with just the number.",
        type: "simple",
        expectedTokens: 10,
      },
      {
        prompt: "Write a haiku about artificial intelligence.",
        type: "creative",
        expectedTokens: 30,
      },
      {
        prompt: "Explain quantum computing in one sentence.",
        type: "complex",
        expectedTokens: 50,
      },
    ];

    // Run all models in parallel
    const modelPromises = gpt5Models.map(async (model) => {
      console.log(`\n📝 Testing ${model.name} (${model.description})`);
      console.log(`Model: ${model.model}`);
      console.log("=".repeat(50));

      const modelResults: ModelTestResult = {
        model: model.model,
        name: model.name,
        tests: [],
        totalTime: 0,
        totalTokens: 0,
        success: true,
      };

      // Run all prompts for this model in parallel
      const promptPromises = testPrompts.map(async (test) => {
        console.log(
          `\n  Test: ${test.type} - "${test.prompt}" [${model.name}]`,
        );
        const startTime = Date.now();

        try {
          const result = await generateTextWithAI({
            messages: [{ role: "user", content: test.prompt }],
            provider: {
              name: "openrouter",
              model: model.model,
            },
            temperature: test.type === "creative" ? 0.8 : 0.3,
            maxTokens: 500, // Increased for GPT-5 models which need more tokens
          });

          const duration = Date.now() - startTime;

          if (result && result.content) {
            console.log(`  ✅ Success in ${duration}ms`);
            console.log(`  Response: "${result.content}"`);
            if (result.usage) {
              console.log(
                `  Tokens - Input: ${result.usage.inputTokens}, Output: ${result.usage.outputTokens}, Total: ${result.usage.totalTokens}`,
              );
              if (result.usage.reasoningTokens) {
                console.log(
                  `  Reasoning tokens: ${result.usage.reasoningTokens}`,
                );
              }
            }

            return {
              test: test.type,
              response: result.content,
              duration,
              success: true,
            };
          } else {
            console.log(`  ⚠️ Empty response for ${model.name}`);
            return {
              test: test.type,
              error: "Empty response",
              duration,
              success: false,
            };
          }
        } catch (error) {
          console.error(`  ❌ Error for ${model.name}: ${error}`);
          return {
            test: test.type,
            error: String(error),
            duration: Date.now() - startTime,
            success: false,
          };
        }
      });

      // Wait for all prompts to complete for this model
      const testResults = await Promise.all(promptPromises);

      // Process results
      modelResults.tests = testResults;
      modelResults.totalTime = testResults
        .filter((t) => t.success && t.duration)
        .reduce((sum, t) => sum + (t.duration || 0), 0);
      modelResults.totalTokens = 0; // TestResult doesn't have usage field
      modelResults.success = testResults.every((t) => t.success);

      // Calculate averages
      const successfulTests = modelResults.tests.filter((t) => t.success);
      if (successfulTests.length > 0) {
        modelResults.avgResponseTime = Math.round(
          modelResults.totalTime / successfulTests.length,
        );
        modelResults.avgTokens = Math.round(
          modelResults.totalTokens / successfulTests.length,
        );
      }

      return modelResults;
    });

    // Wait for all models to complete
    const results = await Promise.all(modelPromises);

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 GPT-5 MODEL COMPARISON SUMMARY");
    console.log("=".repeat(60));

    for (const result of results) {
      const successRate = (
        (result.tests.filter((t) => t.success).length / result.tests.length) *
        100
      ).toFixed(0);
      console.log(`\n${result.name}:`);
      console.log(`  Success Rate: ${successRate}%`);
      if (result.avgResponseTime) {
        console.log(`  Avg Response Time: ${result.avgResponseTime}ms`);
        console.log(`  Avg Tokens Used: ${result.avgTokens}`);
      }
      console.log(
        `  Tests Passed: ${result.tests.filter((t) => t.success).length}/${result.tests.length}`,
      );
    }

    // Performance ranking
    const successfulModels = results.filter(
      (r) => r.success && r.avgResponseTime,
    );
    if (successfulModels.length > 0) {
      successfulModels.sort(
        (a, b) => (a.avgResponseTime || 0) - (b.avgResponseTime || 0),
      );
      console.log("\n⚡ Speed Ranking:");
      successfulModels.forEach((model, idx) => {
        console.log(
          `  ${idx + 1}. ${model.name}: ${model.avgResponseTime}ms avg`,
        );
      });
    }

    return {
      summary: `Tested ${gpt5Models.length} GPT-5 models`,
      results,
      totalModels: gpt5Models.length,
      successfulModels: results.filter((r) => r.success).length,
    };
  },
});

/**
 * Test the internal action wrapper
 */
export const testInternalAction = action({
  args: {
    modelPreset: v.optional(
      v.union(
        v.literal("tiny"),
        v.literal("small"),
        v.literal("medium"),
        v.literal("large"),
        v.literal("vision"),
      ),
    ),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(
      `🔧 Testing internal action with preset: ${args.modelPreset || "default"}...`,
    );

    try {
      // We'll call the internal action through the client directly
      // since we can't use ctx.runAction from an action to call an internal action
      const config = args.modelPreset
        ? getAIConfig(args.modelPreset)
        : getAIConfig("small");

      const result = await generateTextWithAI({
        messages: [{ role: "user", content: args.prompt }],
        ...config,
        temperature: 0.7,
        maxTokens: 100,
      });

      if (result) {
        console.log(`✅ Internal action test success!`);
        console.log(`Model used: ${result.model}`);
        console.log(`Response: ${result.content.substring(0, 200)}...`);

        return {
          success: true,
          modelPreset: args.modelPreset,
          modelUsed: result.model,
          content: result.content,
          usage: result.usage,
        };
      }

      return {
        success: false,
        error: "No result returned",
      };
    } catch (error) {
      console.error(`❌ Internal action test failed:`, error);
      return {
        success: false,
        error: String(error),
      };
    }
  },
});
