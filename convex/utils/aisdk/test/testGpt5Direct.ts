"use node";

import { action } from "../../../_generated/server";

// Test haiku generation directly
export const testGpt5HaikuDirect = action({
  args: {},
  handler: async () => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not set");
    }

    console.log("🔍 Testing GPT-5 Mini haiku generation directly via OpenRouter API...");

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-5-mini",
          messages: [
            {
              role: "user",
              content: "Write a haiku about artificial intelligence."
            }
          ],
          max_tokens: 500,
          temperature: 0.8
        })
      });

      const data = await response.json();

      console.log("📊 Raw API Response:");
      console.log(JSON.stringify(data, null, 2));

      if (data.choices && data.choices[0]) {
        const choice = data.choices[0];
        console.log("\n✅ Message content:", choice.message?.content || "(empty)");
        console.log("🔢 Finish reason:", choice.finish_reason);

        if (data.usage) {
          console.log("\n📈 Token usage:");
          console.log("  - Prompt tokens:", data.usage.prompt_tokens);
          console.log("  - Completion tokens:", data.usage.completion_tokens);
          console.log("  - Total tokens:", data.usage.total_tokens);
        }

        return {
          success: true,
          content: choice.message?.content || "",
          hasContent: !!choice.message?.content,
          contentLength: choice.message?.content?.length || 0,
          usage: data.usage,
          raw: data
        };
      } else {
        console.error("❌ Unexpected response structure:", data);
        return {
          success: false,
          error: "Unexpected response structure",
          raw: data
        };
      }
    } catch (error) {
      console.error("❌ API call failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },
});

// Direct test using fetch to OpenRouter API
export const testGpt5DirectApi = action({
  args: {},
  handler: async () => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not set");
    }

    console.log("🔍 Testing GPT-5 Mini directly via OpenRouter API...");

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-5-mini",
          messages: [
            {
              role: "user",
              content: "What is 2+2? Answer with just the number."
            }
          ],
          max_tokens: 100,
          temperature: 0
        })
      });

      const data = await response.json();

      console.log("📊 Raw API Response:");
      console.log(JSON.stringify(data, null, 2));

      if (data.choices && data.choices[0]) {
        const choice = data.choices[0];
        console.log("\n✅ Message content:", choice.message?.content);
        console.log("🔢 Finish reason:", choice.finish_reason);

        if (data.usage) {
          console.log("\n📈 Token usage:");
          console.log("  - Prompt tokens:", data.usage.prompt_tokens);
          console.log("  - Completion tokens:", data.usage.completion_tokens);
          console.log("  - Total tokens:", data.usage.total_tokens);
        }

        return {
          success: true,
          content: choice.message?.content || "",
          usage: data.usage,
          raw: data
        };
      } else {
        console.error("❌ Unexpected response structure:", data);
        return {
          success: false,
          error: "Unexpected response structure",
          raw: data
        };
      }
    } catch (error) {
      console.error("❌ API call failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },
});

// Test using AI SDK with detailed logging
export const testGpt5WithSdk = action({
  args: {},
  handler: async () => {
    console.log("🔍 Testing GPT-5 Mini via AI SDK...");

    // Import inside handler to avoid module issues
    const { generateTextWithAI } = await import("../aiSdkClient");

    try {
      const result = await generateTextWithAI({
        messages: [
          { role: "user", content: "What is 2+2? Answer with just the number." }
        ],
        provider: { name: "openrouter", model: "openai/gpt-5-mini" },
        temperature: 0,
        maxTokens: 100
      });

      console.log("\n📊 SDK Result:");
      console.log("  - Content:", result?.content || "(empty)");
      console.log("  - Model:", result?.model);
      if (result?.usage) {
        console.log("  - Input tokens:", result.usage.inputTokens);
        console.log("  - Output tokens:", result.usage.outputTokens);
        console.log("  - Total tokens:", result.usage.totalTokens);
      }

      return {
        success: !!result?.content,
        content: result?.content,
        usage: result?.usage,
        model: result?.model
      };
    } catch (error) {
      console.error("❌ SDK call failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },
});