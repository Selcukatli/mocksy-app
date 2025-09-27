// OpenRouter client configuration for BAML
// Using openai-generic provider with OpenRouter's base URL

// Fast model - GPT-5 Nano (same as AI SDK's "tiny" preset)
client<llm> OpenRouterTest {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "openai/gpt-5-nano"  // Fast and cheap for testing
    headers {
      "HTTP-Referer" "https://mocksy.app"
      "X-Title" "Mocksy BAML Test"
    }
  }
}

// Smart model - GPT-5 (same as AI SDK's "large" preset)
client<llm> OpenRouterSmart {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "openai/gpt-5"  // High reasoning capability
    headers {
      "HTTP-Referer" "https://mocksy.app"
      "X-Title" "Mocksy BAML Test"
    }
  }
}