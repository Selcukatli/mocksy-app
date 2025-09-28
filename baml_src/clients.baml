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

// Vision model for avatar analysis - Primary (Qwen 2.5 VL)
client<llm> AvatarVision {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "qwen/qwen2.5-vl-72b-instruct"  // Primary vision model
    headers {
      "HTTP-Referer" "https://mocksy.app"
      "X-Title" "Mocksy Avatar Analysis"
    }
  }
}

// Vision fallback 1 - Gemini Flash
client<llm> AvatarVisionGemini {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "google/gemini-2.0-flash-exp:free"  // Fast and capable vision model
    headers {
      "HTTP-Referer" "https://mocksy.app"
      "X-Title" "Mocksy Avatar Analysis"
    }
  }
}

// Vision fallback 2 - Llama Vision
client<llm> AvatarVisionLlama {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "meta-llama/llama-3.2-90b-vision-instruct"  // Llama vision model
    headers {
      "HTTP-Referer" "https://mocksy.app"
      "X-Title" "Mocksy Avatar Analysis"
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

// Fallback chain for avatar vision analysis
client<llm> AvatarVisionWithFallback {
  provider "fallback"
  options {
    strategy [
      AvatarVision,
      AvatarVisionGemini,
      AvatarVisionLlama
    ]
  }
}