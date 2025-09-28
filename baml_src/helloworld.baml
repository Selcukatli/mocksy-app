// Hello World BAML Domain
// Basic examples for getting started with BAML and OpenRouter integration
// Tests are co-located with their functions for better maintainability

// ============================================
// MODELS
// ============================================

class BasicResponse {
  answer string @description("The direct answer to the question")
  confidence float @description("Confidence level from 0.0 to 1.0")
}

class DetailedResponse {
  answer string
  confidence float
  explanation string? @description("Optional explanation if needed")
  sources string[]? @description("Optional list of sources")
}

// ============================================
// SIMPLE STRING FUNCTIONS WITH TESTS
// ============================================

function SimpleStringGPT5Nano(input: string) -> string {
  client GPT5Nano
  prompt #"
    Respond to this: {{ input }}

    Be concise and direct.
  "#
}

test NanoGreeting {
  functions [SimpleStringGPT5Nano]
  args {
    input "Say hello if you can hear me"
  }
}

test NanoMath {
  functions [SimpleStringGPT5Nano]
  args {
    input "What is 2+2?"
  }
}

function SimpleStringGPT5(input: string) -> string {
  client GPT5
  prompt #"
    Respond to this: {{ input }}

    Be concise and direct.
  "#
}

test GPT5Greeting {
  functions [SimpleStringGPT5]
  args {
    input "Write a poetic greeting"
  }
}

test GPT5Philosophy {
  functions [SimpleStringGPT5]
  args {
    input "What is the meaning of life in one sentence?"
  }
}

// ============================================
// STRUCTURED RESPONSE FUNCTIONS WITH TESTS
// ============================================

function StructuredResponseGPT5Nano(question: string) -> BasicResponse {
  client GPT5Nano
  prompt #"
    Answer this question: {{ question }}

    Also rate your confidence in your answer from 0.0 (not confident) to 1.0 (very confident).

    {{ ctx.output_format }}
  "#
}

test NanoCapital {
  functions [StructuredResponseGPT5Nano]
  args {
    question "What is the capital of France?"
  }
}

test NanoScience {
  functions [StructuredResponseGPT5Nano]
  args {
    question "What is H2O?"
  }
}

function StructuredResponseGPT5(question: string) -> BasicResponse {
  client GPT5
  prompt #"
    Answer this question: {{ question }}

    Also rate your confidence in your answer from 0.0 (not confident) to 1.0 (very confident).

    {{ ctx.output_format }}
  "#
}

test GPT5History {
  functions [StructuredResponseGPT5]
  args {
    question "When did World War II end?"
  }
}

test GPT5Complex {
  functions [StructuredResponseGPT5]
  args {
    question "Explain quantum entanglement"
  }
}

// ============================================
// LIST GENERATOR FUNCTIONS WITH TESTS
// ============================================

function ListGeneratorGPT5Nano(topic: string) -> string[] {
  client GPT5Nano
  prompt #"
    List 3 examples of: {{ topic }}

    {{ ctx.output_format }}
  "#
}

test NanoProgramming {
  functions [ListGeneratorGPT5Nano]
  args {
    topic "programming languages"
  }
}

test NanoColors {
  functions [ListGeneratorGPT5Nano]
  args {
    topic "primary colors"
  }
}

function ListGeneratorGPT5(topic: string) -> string[] {
  client GPT5
  prompt #"
    List 5 examples of: {{ topic }}

    Provide detailed, high-quality examples.

    {{ ctx.output_format }}
  "#
}

test GPT5Frameworks {
  functions [ListGeneratorGPT5]
  args {
    topic "modern JavaScript frameworks"
  }
}

test GPT5AIModels {
  functions [ListGeneratorGPT5]
  args {
    topic "popular large language models"
  }
}

// ============================================
// DETAILED ANALYSIS FUNCTIONS WITH TESTS
// ============================================

function DetailedAnalysisGPT5Nano(query: string) -> DetailedResponse {
  client GPT5Nano
  prompt #"
    Query: {{ query }}

    Provide a quick answer with confidence level.
    Be brief and to the point.

    {{ ctx.output_format }}
  "#
}

test NanoQuickAnswer {
  functions [DetailedAnalysisGPT5Nano]
  args {
    query "What is 100 divided by 4?"
  }
}

test NanoSimpleFact {
  functions [DetailedAnalysisGPT5Nano]
  args {
    query "What year was the iPhone released?"
  }
}

function DetailedAnalysisGPT5(query: string) -> DetailedResponse {
  client GPT5
  prompt #"
    Query: {{ query }}

    Provide a comprehensive answer with confidence level.
    Include explanation only if the answer needs clarification.
    Include sources only if you're referencing specific information.

    {{ ctx.output_format }}
  "#
}

test GPT5SkyQuestion {
  functions [DetailedAnalysisGPT5]
  args {
    query "Why is the sky blue? Explain the physics behind it."
  }
}

test GPT5MathExplanation {
  functions [DetailedAnalysisGPT5]
  args {
    query "What is the square root of 144 and how do you calculate it manually?"
  }
}

test GPT5SpaceHistory {
  functions [DetailedAnalysisGPT5]
  args {
    query "Who was the first person to walk on the moon and what was significant about the mission?"
  }
}

test GPT5Photosynthesis {
  functions [DetailedAnalysisGPT5]
  args {
    query "Explain photosynthesis in detail with the chemical equations"
  }
}

// ============================================
// COMPARISON TESTS
// ============================================
// These tests run the same prompt on different models for comparison

test CompareSimple_Nano {
  functions [SimpleStringGPT5Nano]
  args {
    input "Explain AI in one sentence"
  }
}

test CompareSimple_GPT5 {
  functions [SimpleStringGPT5]
  args {
    input "Explain AI in one sentence"
  }
}

test CompareDetailed_Nano {
  functions [DetailedAnalysisGPT5Nano]
  args {
    query "What are the benefits of TypeScript?"
  }
}

test CompareDetailed_GPT5 {
  functions [DetailedAnalysisGPT5]
  args {
    query "What are the benefits of TypeScript?"
  }
}