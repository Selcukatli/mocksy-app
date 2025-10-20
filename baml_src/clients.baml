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

// Claude Sonnet 4.5 - Highest quality reasoning
client<llm> ClaudeSonnet45 {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "anthropic/claude-sonnet-4.5"
    headers {
      "HTTP-Referer" "https://mocksy.app"
      "X-Title" "Mocksy BAML"
    }
  }
}

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

// Claude Haiku 4.5 - Latest fast model
client<llm> ClaudeHaiku45 {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "anthropic/claude-haiku-4.5"
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