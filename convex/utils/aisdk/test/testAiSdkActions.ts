"use node";

import { action } from "../../../_generated/server";
import { v } from "convex/values";
import { generateTextWithAI } from "../aiSdkClient";
import { getAIConfig } from "../aiModels";

/**
 * Test the AI SDK with different model presets
 */
export const testAllModelPresets = action({
  args: {},
  handler: async (ctx) => {
    console.log("🚀 Starting AI SDK comprehensive tests (running in parallel)...\n");

    const results = {
      fast: null as any,
      creative: null as any,
      outline: null as any,
      vision: null as any,
      fallback: null as any,
      errors: [] as string[]
    };

    try {
      // Run all tests in parallel for speed
      const [fastTest, creativeTest, outlineTest, visionTest] = await Promise.all([
        // Test 1: Fast model for routing
        (async () => {
          console.log("1️⃣ Testing FAST model preset (GPT-5 Nano)...");
          try {
                const fastResult = await generateTextWithAI({
              messages: [
                { role: "system", content: "You are a concise assistant. Answer in 1-2 sentences." },
                { role: "user", content: "What is 2+2?" }
              ],
              ...getAIConfig("fast"),
              temperature: 0.3,
              maxTokens: 50
            });

            if (fastResult) {
              console.log(`✅ Fast model success: ${fastResult.model}`);
              console.log(`   Response: ${fastResult.content.substring(0, 100)}...`);
              console.log(`   Tokens: ${fastResult.usage?.totalTokens || 'N/A'}\n`);
              return {
                content: fastResult.content,
                model: fastResult.model,
                usage: fastResult.usage
              };
            }
            return null;
          } catch (error) {
            console.error(`❌ Fast model failed:`, error);
            return { error: `Fast model: ${error}` };
          }
        })(),

        // Test 2: Creative model for content generation
        (async () => {
          console.log("2️⃣ Testing CREATIVE model preset (GPT-5)...");
          try {
            const creativeResult = await generateTextWithAI({
          messages: [
            { role: "system", content: "You are a creative writer." },
            { role: "user", content: "Write a one-sentence story about a robot learning to paint." }
          ],
          ...getAIConfig("creative"),
          temperature: 0.8,
          maxTokens: 100
        });

            if (creativeResult) {
              console.log(`✅ Creative model success: ${creativeResult.model}`);
              console.log(`   Response: ${creativeResult.content.substring(0, 150)}...`);
              console.log(`   Tokens: ${creativeResult.usage?.totalTokens || 'N/A'}\n`);
              return {
                content: creativeResult.content,
                model: creativeResult.model,
                usage: creativeResult.usage
              };
            }
            return null;
          } catch (error) {
            console.error(`❌ Creative model failed:`, error);
            return { error: `Creative model: ${error}` };
          }
        })(),

        // Test 3: Outline model for quick generation
        (async () => {
          console.log("3️⃣ Testing OUTLINE model preset (GPT-5 Mini)...");
          try {
            const outlineResult = await generateTextWithAI({
          messages: [
            { role: "system", content: "You create brief outlines." },
            { role: "user", content: "Create a 3-point outline for a blog post about AI safety." }
          ],
          ...getAIConfig("outline"),
          temperature: 0.7,
          maxTokens: 150
        });

            if (outlineResult) {
              console.log(`✅ Outline model success: ${outlineResult.model}`);
              console.log(`   Response: ${outlineResult.content.substring(0, 200)}...`);
              console.log(`   Tokens: ${outlineResult.usage?.totalTokens || 'N/A'}\n`);
              return {
                content: outlineResult.content,
                model: outlineResult.model,
                usage: outlineResult.usage
              };
            }
            return null;
          } catch (error) {
            console.error(`❌ Outline model failed:`, error);
            return { error: `Outline model: ${error}` };
          }
        })(),

        // Test 4: Vision model (text-only test since we're not providing images)
        (async () => {
          console.log("4️⃣ Testing VISION model preset (Qwen 2.5 VL)...");
          try {
            const visionResult = await generateTextWithAI({
          messages: [
            { role: "system", content: "You are a visual description assistant." },
            { role: "user", content: "Describe what a sunset typically looks like." }
          ],
          ...getAIConfig("vision"),
          temperature: 0.7,
          maxTokens: 100
        });

            if (visionResult) {
              console.log(`✅ Vision model success: ${visionResult.model}`);
              console.log(`   Response: ${visionResult.content.substring(0, 150)}...`);
              console.log(`   Tokens: ${visionResult.usage?.totalTokens || 'N/A'}\n`);
              return {
                content: visionResult.content,
                model: visionResult.model,
                usage: visionResult.usage
              };
            }
            return null;
          } catch (error) {
            console.error(`❌ Vision model failed:`, error);
            return { error: `Vision model: ${error}` };
          }
        })()
      ]);

      // Process results from parallel execution
      if (fastTest && !('error' in fastTest)) results.fast = fastTest;
      else if (fastTest?.error) results.errors.push(fastTest.error);

      if (creativeTest && !('error' in creativeTest)) results.creative = creativeTest;
      else if (creativeTest?.error) results.errors.push(creativeTest.error);

      if (outlineTest && !('error' in outlineTest)) results.outline = outlineTest;
      else if (outlineTest?.error) results.errors.push(outlineTest.error);

      if (visionTest && !('error' in visionTest)) results.vision = visionTest;
      else if (visionTest?.error) results.errors.push(visionTest.error);

      // Test 5: Fallback mechanism (intentionally use a model that might fail)
      console.log("5️⃣ Testing FALLBACK mechanism...");
      try {
        const fallbackResult = await generateTextWithAI({
          messages: [
            { role: "user", content: "Say 'fallback test successful'" }
          ],
          provider: { name: "openrouter", model: "nonexistent/model" },
          fallbackProviders: [
            { name: "openrouter", model: "openai/gpt-5-nano" },
            { name: "openrouter", model: "google/gemini-2.5-flash" }
          ],
          temperature: 0.3,
          maxTokens: 50
        });

        if (fallbackResult) {
          results.fallback = {
            content: fallbackResult.content,
            model: fallbackResult.model,
            usage: fallbackResult.usage
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

    const tests = ['fast', 'creative', 'outline', 'vision', 'fallback'];
    const passed = tests.filter(t => results[t as keyof typeof results] !== null);
    const failed = tests.filter(t => results[t as keyof typeof results] === null);

    console.log(`✅ Passed: ${passed.length}/${tests.length}`);
    if (passed.length > 0) {
      passed.forEach(t => {
        const result = results[t as keyof typeof results];
        console.log(`   - ${t.toUpperCase()}: ${result?.model || 'Unknown model'}`);
      });
    }

    if (failed.length > 0) {
      console.log(`\n❌ Failed: ${failed.length}/${tests.length}`);
      failed.forEach(t => console.log(`   - ${t.toUpperCase()}`));
    }

    if (results.errors.length > 0) {
      console.log(`\n⚠️ Errors encountered:`);
      results.errors.forEach(e => console.log(`   - ${e}`));
    }

    return {
      summary: `Tests completed: ${passed.length}/${tests.length} passed`,
      results,
      passed: passed.length,
      failed: failed.length,
      total: tests.length
    };
  }
});

/**
 * Test a specific model configuration
 */
export const testSpecificModel = action({
  args: {
    provider: v.string(),
    model: v.string(),
    prompt: v.string()
  },
  handler: async (ctx, args) => {
    console.log(`🧪 Testing ${args.provider}/${args.model}...`);

    try {
      const result = await generateTextWithAI({
        messages: [
          { role: "user", content: args.prompt }
        ],
        provider: {
          name: args.provider as any,
          model: args.model
        },
        temperature: 0.7,
        maxTokens: 100
      });

      if (result) {
        console.log(`✅ Success!`);
        console.log(`Model: ${result.model}`);
        console.log(`Response: ${result.content}`);
        console.log(`Tokens used: ${result.usage?.totalTokens || 'N/A'}`);

        return {
          success: true,
          content: result.content,
          model: result.model,
          usage: result.usage
        };
      }

      return {
        success: false,
        error: "No result returned"
      };
    } catch (error) {
      console.error(`❌ Error:`, error);
      return {
        success: false,
        error: String(error)
      };
    }
  }
});

/**
 * Test multimodal capabilities with image + text
 */
export const testMultimodalWithImage = action({
  args: {
    provider: v.string(),
    model: v.string(),
    prompt: v.string(),
    imageUrl: v.string()
  },
  handler: async (ctx, args) => {
    console.log(`🖼️ Testing multimodal: ${args.provider}/${args.model}...`);
    console.log(`Image URL: ${args.imageUrl}`);
    console.log(`Prompt: ${args.prompt}`);

    try {
      // Convert image URL to base64 or use directly
      const imageContent = args.imageUrl.startsWith('data:')
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
                mimeType: "image/jpeg"
              }
            ]
          }
        ],
        provider: {
          name: args.provider as any,
          model: args.model
        },
        temperature: 0.7,
        maxTokens: 200
      });

      if (result) {
        console.log(`✅ Multimodal test success!`);
        console.log(`Model: ${result.model}`);
        console.log(`Response: ${result.content.substring(0, 500)}...`);
        console.log(`Tokens used: ${result.usage?.totalTokens || 'N/A'}`);

        return {
          success: true,
          content: result.content,
          model: result.model,
          usage: result.usage
        };
      }

      return {
        success: false,
        error: "No result returned"
      };
    } catch (error) {
      console.error(`❌ Multimodal test failed:`, error);
      return {
        success: false,
        error: String(error)
      };
    }
  }
});

/**
 * Test all vision models with a sample image
 */
export const testAllVisionModels = action({
  args: {
    imageUrl: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    console.log("🎨 Starting comprehensive vision model tests...\n");

    // Use a default test image if none provided
    const testImageUrl = args.imageUrl || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400";

    const visionModels = [
      // Direct Anthropic API
      { provider: "anthropic", model: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet (Direct)" },
      { provider: "anthropic", model: "claude-3-opus-20240229", name: "Claude 3 Opus (Direct)" },

      // Claude via OpenRouter (including Claude 4.x)
      { provider: "openrouter", model: "anthropic/claude-opus-4.1", name: "Claude Opus 4.1" },
      { provider: "openrouter", model: "anthropic/claude-opus-4", name: "Claude Opus 4" },
      { provider: "openrouter", model: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4" },
      { provider: "openrouter", model: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet (OR)" },
      { provider: "openrouter", model: "anthropic/claude-3-opus", name: "Claude 3 Opus (OR)" },
      { provider: "openrouter", model: "anthropic/claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku" },

      // Google models (Direct API)
      { provider: "google", model: "gemini-2.5-flash", name: "Gemini 2.5 Flash (Direct)" },

      // Google AI Studio models via OpenRouter
      { provider: "openrouter", model: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash" },
      { provider: "openrouter", model: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro" },
      { provider: "openrouter", model: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash (OR)" },
      { provider: "openrouter", model: "google/gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite" },
      { provider: "openrouter", model: "google/gemini-pro-1.5", name: "Gemini Pro 1.5" },

      // Other vision models
      { provider: "openrouter", model: "qwen/qwen2.5-vl-72b-instruct", name: "Qwen Vision 72B" },
      { provider: "openrouter", model: "openai/gpt-4o", name: "GPT-4o Vision" },
      { provider: "openrouter", model: "openai/gpt-4o-mini", name: "GPT-4o Mini Vision" }
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
                { type: "text", text: "Describe this image in one sentence. What do you see?" },
                {
                  type: "image",
                  image: testImageUrl,
                  mimeType: "image/jpeg"
                }
              ]
            }
          ],
          provider: {
            name: model.provider as any,
            model: model.model
          },
          temperature: 0.7,
          maxTokens: 100
        });

        if (result && result.content) {
          console.log(`✅ ${model.name}: Success!`);
          console.log(`   Response: ${result.content.substring(0, 150)}...`);
          console.log(`   Tokens: ${result.usage?.totalTokens || 'N/A'}`);

          return {
            model: model.name,
            provider: model.provider,
            modelId: model.model,
            success: true,
            response: result.content,
            tokens: result.usage?.totalTokens
          };
        } else {
          console.log(`⚠️ ${model.name}: Empty response`);
          return {
            model: model.name,
            provider: model.provider,
            modelId: model.model,
            success: false,
            error: "Empty response"
          };
        }
      } catch (error) {
        console.error(`❌ ${model.name}: Failed with error:`, error);
        return {
          model: model.name,
          provider: model.provider,
          modelId: model.model,
          success: false,
          error: String(error)
        };
      }
    });

    // Wait for all models to complete
    const results = await Promise.all(modelPromises);

    // Summary
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log("\n📊 VISION MODEL TEST SUMMARY:");
    console.log("==============================");
    console.log(`✅ Successful: ${successful.length}/${results.length}`);
    successful.forEach(r => {
      console.log(`   - ${r.model}: "${r.response?.substring(0, 50)}..."`);
    });

    if (failed.length > 0) {
      console.log(`\n❌ Failed: ${failed.length}/${results.length}`);
      failed.forEach(r => {
        console.log(`   - ${r.model}: ${r.error}`);
      });
    }

    return {
      summary: `Vision tests: ${successful.length}/${results.length} passed`,
      results,
      testImageUrl
    };
  }
});

/**
 * Test all GPT-5 models (Full, Mini, Nano)
 */
export const testAllGPT5Models = action({
  args: {},
  handler: async (ctx) => {
    console.log("🚀 Testing all GPT-5 models via OpenRouter (running in parallel)...\n");

    const gpt5Models = [
      {
        model: "openai/gpt-5",
        name: "GPT-5 (Full)",
        description: "Most capable, highest quality"
      },
      {
        model: "openai/gpt-5-mini",
        name: "GPT-5 Mini",
        description: "Balanced speed and quality"
      },
      {
        model: "openai/gpt-5-nano",
        name: "GPT-5 Nano",
        description: "Fastest, most efficient"
      }
    ];

    const testPrompts = [
      {
        prompt: "What is 2+2? Answer with just the number.",
        type: "simple",
        expectedTokens: 10
      },
      {
        prompt: "Write a haiku about artificial intelligence.",
        type: "creative",
        expectedTokens: 30
      },
      {
        prompt: "Explain quantum computing in one sentence.",
        type: "complex",
        expectedTokens: 50
      }
    ];

    // Run all models in parallel
    const modelPromises = gpt5Models.map(async (model) => {
      console.log(`\n📝 Testing ${model.name} (${model.description})`);
      console.log(`Model: ${model.model}`);
      console.log("=" .repeat(50));

      const modelResults: any = {
        model: model.model,
        name: model.name,
        tests: [],
        totalTime: 0,
        totalTokens: 0,
        success: true
      };

      // Run all prompts for this model in parallel
      const promptPromises = testPrompts.map(async (test) => {
        console.log(`\n  Test: ${test.type} - "${test.prompt}" [${model.name}]`);

        try {
          const startTime = Date.now();

          const result = await generateTextWithAI({
            messages: [
              { role: "user", content: test.prompt }
            ],
            provider: {
              name: "openrouter",
              model: model.model
            },
            temperature: test.type === "creative" ? 0.8 : 0.3,
            maxTokens: 500  // Increased for GPT-5 models which need more tokens
          });

          const duration = Date.now() - startTime;

          if (result && result.content) {
            console.log(`  ✅ Success in ${duration}ms`);
            console.log(`  Response: "${result.content}"`);
            if (result.usage) {
              console.log(`  Tokens - Input: ${result.usage.inputTokens}, Output: ${result.usage.outputTokens}, Total: ${result.usage.totalTokens}`);
              if (result.usage.reasoningTokens) {
                console.log(`  Reasoning tokens: ${result.usage.reasoningTokens}`);
              }
            }

            return {
              type: test.type,
              prompt: test.prompt,
              response: result.content,
              duration,
              usage: result.usage,
              success: true
            };
          } else {
            console.log(`  ⚠️ Empty response for ${model.name}`);
            return {
              type: test.type,
              prompt: test.prompt,
              error: "Empty response",
              success: false
            };
          }
        } catch (error) {
          console.error(`  ❌ Error for ${model.name}: ${error}`);
          return {
            type: test.type,
            prompt: test.prompt,
            error: String(error),
            success: false
          };
        }
      });

      // Wait for all prompts to complete for this model
      const testResults = await Promise.all(promptPromises);

      // Process results
      modelResults.tests = testResults;
      modelResults.totalTime = testResults
        .filter(t => t.success && t.duration)
        .reduce((sum, t) => sum + (t.duration || 0), 0);
      modelResults.totalTokens = testResults
        .filter(t => t.success && t.usage)
        .reduce((sum, t) => sum + (t.usage?.totalTokens || 0), 0);
      modelResults.success = testResults.every(t => t.success);

      // Calculate averages
      const successfulTests = modelResults.tests.filter((t: any) => t.success);
      if (successfulTests.length > 0) {
        modelResults.avgResponseTime = Math.round(modelResults.totalTime / successfulTests.length);
        modelResults.avgTokens = Math.round(modelResults.totalTokens / successfulTests.length);
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
      const successRate = (result.tests.filter((t: any) => t.success).length / result.tests.length * 100).toFixed(0);
      console.log(`\n${result.name}:`);
      console.log(`  Success Rate: ${successRate}%`);
      if (result.avgResponseTime) {
        console.log(`  Avg Response Time: ${result.avgResponseTime}ms`);
        console.log(`  Avg Tokens Used: ${result.avgTokens}`);
      }
      console.log(`  Tests Passed: ${result.tests.filter((t: any) => t.success).length}/${result.tests.length}`);
    }

    // Performance ranking
    const successfulModels = results.filter(r => r.success && r.avgResponseTime);
    if (successfulModels.length > 0) {
      successfulModels.sort((a, b) => a.avgResponseTime - b.avgResponseTime);
      console.log("\n⚡ Speed Ranking:");
      successfulModels.forEach((model, idx) => {
        console.log(`  ${idx + 1}. ${model.name}: ${model.avgResponseTime}ms avg`);
      });
    }

    return {
      summary: `Tested ${gpt5Models.length} GPT-5 models`,
      results,
      totalModels: gpt5Models.length,
      successfulModels: results.filter(r => r.success).length
    };
  }
});

/**
 * Test the internal action wrapper
 */
export const testInternalAction = action({
  args: {
    modelPreset: v.optional(v.union(
      v.literal("fast"),
      v.literal("creative"),
      v.literal("vision"),
      v.literal("outline")
    )),
    prompt: v.string()
  },
  handler: async (ctx, args) => {
    console.log(`🔧 Testing internal action with preset: ${args.modelPreset || 'default'}...`);

    try {
      // We'll call the internal action through the client directly
      // since we can't use ctx.runAction from an action to call an internal action
      const config = args.modelPreset ? getAIConfig(args.modelPreset) : getAIConfig("fast");

      const result = await generateTextWithAI({
        messages: [
          { role: "user", content: args.prompt }
        ],
        ...config,
        temperature: 0.7,
        maxTokens: 100
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
          usage: result.usage
        };
      }

      return {
        success: false,
        error: "No result returned"
      };
    } catch (error) {
      console.error(`❌ Internal action test failed:`, error);
      return {
        success: false,
        error: String(error)
      };
    }
  }
});