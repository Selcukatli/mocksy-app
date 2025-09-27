# BAML with Convex Setup Guide

## Overview
BAML (Boundary ML) is a domain-specific language for building reliable, type-safe LLM functions. This guide explains how to integrate BAML with Convex for type-safe AI operations.

## Project Structure
```
project-root/
├── baml_src/           # BAML source files (prompts, clients, types)
├── baml_client/        # Generated TypeScript client (auto-generated)
├── convex/
│   └── actions/        # Convex actions that use BAML
├── package.json
└── convex.json         # Convex configuration
```

## Setup Steps

### 1. Install BAML
```bash
npm install @boundaryml/baml
```

### 2. Create BAML Source Directory
Create `baml_src/` in your project root (NOT inside convex folder):

```bash
mkdir baml_src
```

### 3. Configure BAML Generator
Create `baml_src/generators.baml`:
```baml
generator target {
  output_type "typescript"
  output_dir ".."  // Outputs to project root
  version "0.76.2"
}
```

### 4. Configure OpenRouter Client
Create `baml_src/clients.baml`:
```baml
// OpenRouter client configuration
client<llm> OpenRouterClient {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY  // Reads from Convex environment
    model "openai/gpt-5-nano"       // Or any OpenRouter model
    headers {
      "HTTP-Referer" "https://yourapp.com"
      "X-Title" "Your App Name"
    }
  }
}
```

### 5. Define Your Prompts
Create `baml_src/prompts.baml`:
```baml
// Example: Structured output with type safety
class AnalysisResult {
  summary string @description("Brief summary of the analysis")
  score float @description("Score from 0.0 to 1.0")
  tags string[] @description("Relevant tags")
}

function AnalyzeContent(content: string) -> AnalysisResult {
  client OpenRouterClient
  prompt #"
    Analyze the following content:
    {{ content }}

    Provide a summary, score its quality, and suggest relevant tags.

    {{ ctx.output_format }}
  "#
}
```

### 6. Configure Convex External Packages (REQUIRED)
Create `convex.json` in project root:
```json
{
  "node": {
    "externalPackages": ["@boundaryml/baml"]
  }
}
```

**Why this is necessary:** BAML includes native Node.js modules (.node files) that cannot be bundled by Convex. Without this configuration, you'll get errors like:
```
No loader is configured for ".node" files: node_modules/@boundaryml/baml-darwin-arm64/baml.darwin-arm64.node
```

The external package configuration tells Convex to use BAML directly from node_modules at runtime instead of trying to bundle it.

### 7. Add Generation Script
In `package.json`:
```json
{
  "scripts": {
    "baml:generate": "baml-cli generate"
  }
}
```

### 8. Generate TypeScript Client
```bash
npm run baml:generate
```

This creates `baml_client/` with type-safe TypeScript code.

### 9. Use BAML in Convex Actions
Create `convex/aiActions.ts`:
```typescript
"use node";  // REQUIRED: Enables Node.js runtime and environment access
import { action } from "./_generated/server";
import { b } from "../baml_client";
import type { AnalysisResult } from "../baml_client/types";

export const analyzeContent = action({
  args: {
    content: v.string(),
  },
  handler: async ({ content }) => {
    // BAML automatically uses OPENROUTER_API_KEY from Convex environment
    const result: AnalysisResult = await b.AnalyzeContent(content);

    return {
      summary: result.summary,
      score: result.score,
      tags: result.tags
    };
  }
});
```

## Key Points

### Three Essential Requirements
1. **BAML in root directory** - Keeps generated files outside Convex bundling
2. **"use node" directive** - Enables Node.js runtime and environment access in Convex actions
3. **External package config** - Prevents Convex from trying to bundle native modules

### Why BAML Must Be Outside Convex Folder
- BAML generates files with native Node.js modules (.node files)
- These generated files cannot be modified to add "use node" directive
- Placing BAML in root avoids Convex bundling issues

### Why External Package Configuration is Required
- BAML contains native Node.js modules (.node files)
- Convex cannot bundle these binary files
- The `convex.json` configuration tells Convex to load BAML from node_modules at runtime
- Without this, you'll get "No loader is configured for .node files" errors

### How Environment Variables Work
- BAML reads environment variables at **runtime**, not build time
- When BAML executes inside a Convex action with "use node", it has access to Convex environment variables
- No wrapper needed - direct imports work fine

### The "use node" Directive
- MUST be at the top of any Convex file using BAML
- Provides access to Node.js APIs and Convex environment variables
- Enables BAML to read `env.OPENROUTER_API_KEY` from Convex environment

## Common Issues and Solutions

### Issue: "Could not resolve fs" or native module errors
**Solution**: Ensure BAML folders are in project root, not inside convex/

### Issue: "Provider returned error" from OpenRouter
**Solution**: Check that your model ID is valid and your API key is set in Convex environment

### Issue: Nested baml_client/baml_client structure after generation
**Solution**: Set `output_dir ".."` in generators.baml (not `"../baml_client"`)

## Benefits of BAML with Convex

1. **Type Safety**: Compile-time type checking for LLM responses
2. **Structured Outputs**: Guaranteed response format with classes
3. **Environment Security**: API keys stay in Convex environment
4. **Better DX**: Prompts defined in .baml files with syntax highlighting
5. **Reliability**: Built-in retry logic and error handling

## Example: Complete Setup for Screenshot Generation

```baml
// baml_src/screenshot.baml
class ScreenshotMetadata {
  title string @description("App screen title")
  description string @description("Screen description")
  keywords string[] @description("SEO keywords")
  primaryColor string @description("Hex color code")
}

function GenerateScreenshotMetadata(
  imageDescription: string,
  appContext: string
) -> ScreenshotMetadata {
  client OpenRouterClient
  prompt #"
    Given this app screen: {{ imageDescription }}
    App context: {{ appContext }}

    Generate metadata for this screenshot.

    {{ ctx.output_format }}
  "#
}
```

```typescript
// convex/screenshotActions.ts
"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { b } from "../baml_client";

export const generateMetadata = action({
  args: {
    imageDescription: v.string(),
    appContext: v.string(),
  },
  handler: async (ctx, { imageDescription, appContext }) => {
    const metadata = await b.GenerateScreenshotMetadata(
      imageDescription,
      appContext
    );

    // Type-safe access to all fields
    return {
      title: metadata.title,
      description: metadata.description,
      keywords: metadata.keywords,
      primaryColor: metadata.primaryColor,
    };
  }
});
```

## Comparison with AI SDK

| Feature | BAML | AI SDK |
|---------|------|--------|
| Type Safety | Compile-time with DSL | Runtime TypeScript |
| Prompt Management | .baml files | Inline strings |
| Response Validation | Automatic | Manual |
| Setup Complexity | Requires generation step | Direct usage |
| Flexibility | Schema-focused | Runtime configuration |
| Best For | Structured outputs, type safety | Dynamic prompts, fallbacks |

Choose BAML when you need strong type guarantees and structured outputs. Choose AI SDK for more runtime flexibility and dynamic prompt construction.