// Simple test prompts to verify BAML works with OpenRouter

// Test 1: Simple string in, string out
function SimpleTest(input: string) -> string {
  client OpenRouterTest
  prompt #"
    Respond to this: {{ input }}

    Be concise and direct.
  "#
}

// Test 2: Structured output with a class
class BasicResponse {
  answer string @description("The direct answer to the question")
  confidence float @description("Confidence level from 0.0 to 1.0")
}

function StructuredTest(question: string) -> BasicResponse {
  client OpenRouterTest
  prompt #"
    Answer this question: {{ question }}

    Also rate your confidence in your answer from 0.0 (not confident) to 1.0 (very confident).

    {{ ctx.output_format }}
  "#
}

// Test 3: Array output
function ListTest(topic: string) -> string[] {
  client OpenRouterTest
  prompt #"
    List 3 examples of: {{ topic }}

    {{ ctx.output_format }}
  "#
}

// Test 4: Optional fields
class DetailedResponse {
  answer string
  confidence float
  explanation string? @description("Optional explanation if needed")
  sources string[]? @description("Optional list of sources")
}

function DetailedTest(query: string) -> DetailedResponse {
  client OpenRouterSmart  // Use smarter model for this
  prompt #"
    Query: {{ query }}

    Provide an answer with confidence level.
    Include explanation only if the answer needs clarification.
    Include sources only if you're referencing specific information.

    {{ ctx.output_format }}
  "#
}