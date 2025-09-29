// OpenRouter client configuration for BAML
// Using openai-generic provider with OpenRouter's base URL

// Fast model - GPT-5 Nano (same as AI SDK's "tiny" preset)
client<llm> GPT5Nano {
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
client<llm> GPT5 {
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

// Balanced model - GPT-5 Mini
client<llm> GPT5Mini {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "openai/gpt-5-mini"  // Balanced performance
    headers {
      "HTTP-Referer" "https://mocksy.app"
      "X-Title" "Mocksy BAML Test"
    }
  }
}

// Qwen 2.5 VL - Vision model
client<llm> Qwen25VL {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "qwen/qwen2.5-vl-72b-instruct"
    headers {
      "HTTP-Referer" "https://mocksy.app"
      "X-Title" "Mocksy BAML"
    }
  }
}

// Gemini 2.0 Flash Exp - Free vision model
client<llm> Gemini20FlashExp {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "google/gemini-2.0-flash-exp:free"
    headers {
      "HTTP-Referer" "https://mocksy.app"
      "X-Title" "Mocksy BAML"
    }
  }
}

// Llama 3.2 90B Vision - Vision model
client<llm> Llama32Vision {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "meta-llama/llama-3.2-90b-vision-instruct"
    headers {
      "HTTP-Referer" "https://mocksy.app"
      "X-Title" "Mocksy BAML"
    }
  }
}

// Gemini 2.5 Pro - Premium reasoning model
client<llm> Gemini25Pro {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "google/gemini-2.5-pro"  // High capability, premium model
    headers {
      "HTTP-Referer" "https://mocksy.app"
      "X-Title" "Mocksy BAML"
    }
  }
}

// Gemini 2.5 Flash - Fast and efficient
client<llm> Gemini25Flash {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "google/gemini-2.5-flash"  // Balanced speed and quality
    headers {
      "HTTP-Referer" "https://mocksy.app"
      "X-Title" "Mocksy BAML"
    }
  }
}

// Gemini 2.5 Flash Lite - Ultra-lightweight
client<llm> Gemini25FlashLite {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "google/gemini-2.5-flash-lite"  // Fastest, most lightweight
    headers {
      "HTTP-Referer" "https://mocksy.app"
      "X-Title" "Mocksy BAML"
    }
  }
}

// ===========================================
// ANTHROPIC MODELS (via OpenRouter)
// ===========================================

// Claude Sonnet 4 - High-quality reasoning
client<llm> ClaudeSonnet4 {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "anthropic/claude-sonnet-4"
    headers {
      "HTTP-Referer" "https://mocksy.app"
      "X-Title" "Mocksy BAML"
    }
  }
}

// Claude 3.5 Haiku - Fast and efficient
client<llm> ClaudeHaiku {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "anthropic/claude-3-5-haiku-20241022"
    headers {
      "HTTP-Referer" "https://mocksy.app"
      "X-Title" "Mocksy BAML"
    }
  }
}

// ===========================================
// MISTRAL MODELS (via OpenRouter)
// ===========================================

// Mistral Large - Premium reasoning
client<llm> MistralLarge {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "mistralai/mistral-large-2411"
    headers {
      "HTTP-Referer" "https://mocksy.app"
      "X-Title" "Mocksy BAML"
    }
  }
}

// Mistral Small - Fast and efficient
client<llm> MistralSmall {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "mistralai/mistral-small-2412"
    headers {
      "HTTP-Referer" "https://mocksy.app"
      "X-Title" "Mocksy BAML"
    }
  }
}

// ============================================
// MODEL TESTING
// ============================================

class ModelTestResponse {
  model_name string @description("Name of the model being tested")
  response_text string @description("The model's response to the test prompt")
  character_count int @description("Number of characters in the response")
  passed bool @description("Whether the model responded successfully")
}

class VisionTestResponse {
  model_name string @description("Name of the vision model being tested")
  can_see_image bool @description("Whether the model can process the image")
  description string @description("Brief description of what the model sees")
  object_count int @description("Number of distinct objects/people identified")
}

// Test functions for each model
function TestGPT5Nano() -> ModelTestResponse {
  client GPT5Nano
  prompt #"
    {{ _.role("user") }}
    You are being tested. Please respond with exactly: "GPT5Nano is working correctly."
    Then add one interesting fact about programming.
    {{ ctx.output_format }}
  "#
}

function TestGPT5() -> ModelTestResponse {
  client GPT5
  prompt #"
    {{ _.role("user") }}
    You are being tested. Please respond with exactly: "GPT5 is working correctly."
    Then add one interesting fact about programming.
    {{ ctx.output_format }}
  "#
}

function TestGPT5Mini() -> ModelTestResponse {
  client GPT5Mini
  prompt #"
    {{ _.role("user") }}
    You are being tested. Please respond with exactly: "GPT5Mini is working correctly."
    Then add one interesting fact about programming.
    {{ ctx.output_format }}
  "#
}

function TestGemini25Pro() -> ModelTestResponse {
  client Gemini25Pro
  prompt #"
    {{ _.role("user") }}
    You are being tested. Please respond with exactly: "Gemini25Pro is working correctly."
    Then add one interesting fact about programming.
    {{ ctx.output_format }}
  "#
}

function TestGemini25Flash() -> ModelTestResponse {
  client Gemini25Flash
  prompt #"
    {{ _.role("user") }}
    You are being tested. Please respond with exactly: "Gemini25Flash is working correctly."
    Then add one interesting fact about programming.
    {{ ctx.output_format }}
  "#
}

function TestGemini25FlashLite() -> ModelTestResponse {
  client Gemini25FlashLite
  prompt #"
    {{ _.role("user") }}
    You are being tested. Please respond with exactly: "Gemini25FlashLite is working correctly."
    Then add one interesting fact about programming.
    {{ ctx.output_format }}
  "#
}

function TestClaudeSonnet4() -> ModelTestResponse {
  client ClaudeSonnet4
  prompt #"
    {{ _.role("user") }}
    You are being tested. Please respond with exactly: "ClaudeSonnet4 is working correctly."
    Then add one interesting fact about programming.
    {{ ctx.output_format }}
  "#
}

function TestClaudeHaiku() -> ModelTestResponse {
  client ClaudeHaiku
  prompt #"
    {{ _.role("user") }}
    You are being tested. Please respond with exactly: "ClaudeHaiku is working correctly."
    Then add one interesting fact about programming.
    {{ ctx.output_format }}
  "#
}

function TestMistralLarge() -> ModelTestResponse {
  client MistralLarge
  prompt #"
    {{ _.role("user") }}
    You are being tested. Please respond with exactly: "MistralLarge is working correctly."
    Then add one interesting fact about programming.
    {{ ctx.output_format }}
  "#
}

function TestMistralSmall() -> ModelTestResponse {
  client MistralSmall
  prompt #"
    {{ _.role("user") }}
    You are being tested. Please respond with exactly: "MistralSmall is working correctly."
    Then add one interesting fact about programming.
    {{ ctx.output_format }}
  "#
}

function TestQwen25VL(image: image) -> VisionTestResponse {
  client Qwen25VL
  prompt #"
    {{ _.role("user") }}
    You are testing the Qwen25VL vision model.
    Image to analyze: {{ image }}
    Please describe what you see in this image in 1-2 sentences.
    Count how many distinct objects or people you can identify.
    {{ ctx.output_format }}
  "#
}

function TestGemini20FlashExp(image: image) -> VisionTestResponse {
  client Gemini20FlashExp
  prompt #"
    {{ _.role("user") }}
    You are testing the Gemini20FlashExp vision model.
    Image to analyze: {{ image }}
    Please describe what you see in this image in 1-2 sentences.
    Count how many distinct objects or people you can identify.
    {{ ctx.output_format }}
  "#
}

function TestLlama32Vision(image: image) -> VisionTestResponse {
  client Llama32Vision
  prompt #"
    {{ _.role("user") }}
    You are testing the Llama32Vision vision model.
    Image to analyze: {{ image }}
    Please describe what you see in this image in 1-2 sentences.
    Count how many distinct objects or people you can identify.
    {{ ctx.output_format }}
  "#
}

// Test cases
test GPT5NanoTest {
  functions [TestGPT5Nano]
  args {}
}

test GPT5Test {
  functions [TestGPT5]
  args {}
}

test GPT5MiniTest {
  functions [TestGPT5Mini]
  args {}
}

test Gemini25ProTest {
  functions [TestGemini25Pro]
  args {}
}

test Gemini25FlashTest {
  functions [TestGemini25Flash]
  args {}
}

test Gemini25FlashLiteTest {
  functions [TestGemini25FlashLite]
  args {}
}

test ClaudeSonnet4Test {
  functions [TestClaudeSonnet4]
  args {}
}

test ClaudeHaikuTest {
  functions [TestClaudeHaiku]
  args {}
}

test MistralLargeTest {
  functions [TestMistralLarge]
  args {}
}

test MistralSmallTest {
  functions [TestMistralSmall]
  args {}
}

test Qwen25VLTest {
  functions [TestQwen25VL]
  args {
    image { url "https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/73ccdd21-b99f-5c5d-b5d3-583189e20070/5e778976-0fdd-5ccc-9d03-6cbd59095783.jpg" }
  }
}

test Gemini20FlashExpTest {
  functions [TestGemini20FlashExp]
  args {
    image { url "https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/73ccdd21-b99f-5c5d-b5d3-583189e20070/5e778976-0fdd-5ccc-9d03-6cbd59095783.jpg" }
  }
}

test Llama32VisionTest {
  functions [TestLlama32Vision]
  args {
    image { url "https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/73ccdd21-b99f-5c5d-b5d3-583189e20070/5e778976-0fdd-5ccc-9d03-6cbd59095783.jpg" }
  }
}