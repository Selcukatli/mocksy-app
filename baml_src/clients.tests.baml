// ============================================
// CLIENT INFRASTRUCTURE TESTS
// ============================================
// Tests to verify AI model clients are working correctly

// ============================================
// TEST RESPONSE CLASSES
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

// ============================================
// TEXT MODEL TEST FUNCTIONS
// ============================================

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

// ============================================
// VISION MODEL TEST FUNCTIONS
// ============================================

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

// ============================================
// TEST CASES
// ============================================

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

