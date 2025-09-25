# AI SDK Integration

This module provides a unified interface for AI text generation with multiple providers.

## 🚀 Portability & Reuse

### Quick Start for New Projects

This module is designed to be portable. To use in another project:

1. **Copy the entire `aisdk` folder** to your project's utilities directory
2. **Install dependencies (AI SDK v5+)**:
   ```bash
   npm install ai@^5 @ai-sdk/openai@^5 @ai-sdk/anthropic@^5 @ai-sdk/google@^5 @openrouter/ai-sdk-provider@^1 @fal-ai/client@^0
   ```
3. **Set environment variables**:
   ```bash
   # Required for specific providers
   OPENAI_API_KEY=...
   ANTHROPIC_API_KEY=...
   GOOGLE_AI_API_KEY=...
   OPENROUTER_API_KEY=...
   ```
4. **For HTTP streaming endpoints**: See **[streaming-setup.md](./streaming-setup.md)**
5. **Replace Convex-specific imports** (see below)

### Dependencies to Replace

| File | Convex Import | Replace With |
|------|--------------|-------------|
| `aiSdkActions.ts` | `import { internalAction } from "../../_generated/server"` | Your framework's action/function wrapper |
| `test/*.ts` | `import { action } from "../../../_generated/server"` | Your test framework's action wrapper |

### Standalone Usage Example

```typescript
// Direct usage without Convex
import { generateTextWithAI, createSystemPrompt, createUserMessage } from './aisdk/aiSdkClient';

const result = await generateTextWithAI({
  provider: { name: 'openai', model: 'gpt-5' },
  messages: [
    createSystemPrompt('You are a helpful assistant'),
    createUserMessage('Hello!'),
  ],
  maxOutputTokens: 1000,
  temperature: 0.7,
});

console.log(result?.content);
```

## ⚠️ CRITICAL: Always Use Our Wrapper Functions

### ❌ DO NOT use AI SDK functions directly:
```typescript
// ❌ WRONG - GPT-5 returns empty text
import { generateText } from "ai";
const result = await generateText({ model: openrouter("openai/gpt-5"), ... });

// ❌ WRONG - GPT-5 doesn't stream properly  
import { streamText } from "ai";
const result = await streamText({ model: openrouter("openai/gpt-5"), ... });
```

### ✅ ALWAYS use our wrapper functions:
```typescript
// ✅ CORRECT - Handles GPT-5 correctly
import { generateTextWithAI } from "./utils/aisdk/aiSdkClient";
const result = await generateTextWithAI({ provider: { name: "openai", model: "gpt-5" }, ... });

// ✅ CORRECT - Fixes GPT-5 streaming
import { streamTextWithAI } from "./utils/aisdk/aiSdkStreamClient";
await streamTextWithAI({ provider: { name: "openai", model: "gpt-5" }, ... });
```

### Why These Wrappers Exist

We now target **AI SDK v5**, which shipped a breaking change to token accounting and streaming configuration. The helper functions keep our call sites stable by reshaping arguments and responses to the new primitives while continuing to smooth over GPT-5 quirks.

**What the wrappers handle for you**
1. Detect GPT-5 models and select the fastest path (`openai.responses()` in v5, or a direct OpenAI fallback when needed)
2. Normalize `maxOutputTokens`/`reasoning` options so older callers using `maxTokens` continue to work
3. Map the new usage structure (`inputTokens`, `outputTokens`, `reasoningTokens`) into a consistent shape for the app
4. Preserve the automatic fallback chain across providers
5. Provide consistent logging hooks for latency and token usage

**Bonus Features**:
- Automatic fallback chains (GPT-5 → GPT-4.1 → Claude)
- Unified error handling
- Consistent logging
- Smart provider selection based on available API keys

## Architecture

```
Frontend → Convex Actions → aiSdkClient.ts → AI Providers
                                           ├── Direct OpenAI (for GPT-5)
                                           ├── AI SDK → OpenAI
                                           ├── AI SDK → Anthropic
                                           ├── AI SDK → Google
                                           └── AI SDK → OpenRouter
```

## GPT-5 Configuration Options

### Option 1: Direct OpenAI (Current - Best Performance)
```typescript
provider: { name: "openai", model: "gpt-5" }
```
- **Pros**: Lowest latency, no markup costs
- **Cons**: Requires custom handling for GPT-5 quirks
- **Implementation**: Uses `openaiDirect.ts` for GPT-5 models

### Option 2: Via OpenRouter (Alternative - Simpler)
```typescript
provider: { name: "openrouter", model: "openai/gpt-5" }
```
- **Pros**: OpenRouter handles GPT-5 quirks automatically, unified billing
- **Cons**: Extra latency, small markup cost
- **Implementation**: Uses AI SDK with OpenRouter provider

## Model Configuration

Edit `aiModels.ts` to change the default models:

```typescript
// For direct OpenAI (current)
creative: {
  provider: { name: "openai", model: "gpt-5" }
}

// For OpenRouter (alternative)
creative: {
  provider: { name: "openrouter", model: "openai/gpt-5" }
}
```

## Integration Patterns

### With Convex (Current Implementation)

await ctx.runAction(internal.utils.aisdk.aiSdkActions.generateTextInternal, {
  messages: [...],
  modelPreset: 'creative', // or 'fast', 'vision'
  maxOutputTokens: 1000,
});
```

### With Next.js API Routes

```typescript
// app/api/generate/route.ts
import { generateTextWithAI } from '@/utils/aisdk/aiSdkClient';

export async function POST(request: Request) {
  const { prompt } = await request.json();
  
  const result = await generateTextWithAI({
    provider: { name: 'openai', model: 'gpt-5' },
    messages: [{ role: 'user', content: prompt }],
    maxOutputTokens: 1000,
  });
  
  return Response.json({ content: result.content });
}
```

### With Express.js

```typescript
import { generateTextWithAI } from './utils/aisdk/aiSdkClient';

app.post('/api/generate', async (req, res) => {
  const result = await generateTextWithAI({
    provider: req.body.provider,
    messages: req.body.messages,
    maxOutputTokens: 1000,
  });
  
  res.json({ content: result.content });
});
```

## GPT-5 Special Requirements

AI SDK v5 speaks to GPT-5 through the new `responses` API, but a direct HTTP fallback is still available for edge cases. When you override the provider to call OpenAI directly, keep in mind:

1. **Temperature is optional** – GPT-5 assumes deterministic output unless you set it explicitly.
2. **Use `maxOutputTokens`** – the wrapper converts this into the correct `max_completion_tokens` payload.
3. **Reasoning tokens** – the helper automatically budgets extra capacity when you pass `reasoningEffort`.

The response object now includes `usage.inputTokens`, `usage.outputTokens`, and (when supplied by the provider) `usage.reasoningTokens`. Update any downstream analytics accordingly.

## Core Features

### Automatic Fallback Chain

If a model fails, the system automatically tries the next one:
1. GPT-5 (primary)
2. Claude Sonnet 4.0 (fallback)
3. GPT-5-mini (secondary fallback)
4. Mistral via OpenRouter (tertiary)
5. Claude Haiku (last resort)

### Files Overview

| File | Purpose | Portable? |
|------|---------|----------|
| `aiSdkClient.ts` | Core text generation logic | ✅ Yes (100% portable) |
| `aiSdkStreamClient.ts` | Streaming text generation | ✅ Yes (100% portable) |
| `openaiDirect.ts` | Direct OpenAI API for GPT-5 | ✅ Yes (100% portable) |
| `aiModels.ts` | Model configurations | ✅ Yes (100% portable) |
| `types.ts` | TypeScript interfaces | ✅ Yes (100% portable) |
| `index.ts` | Public exports | ✅ Yes (100% portable) |
| `aiSdkActions.ts` | Convex action wrappers | ⚠️ Needs adaptation |
| `test/*.ts` | Test files | ⚠️ Needs adaptation |

### Documentation & Examples

| Resource | Description |
|----------|-------------|
| **[streaming-setup.md](./streaming-setup.md)** | Complete guide for HTTP streaming endpoints |
| **[examples/streamingWithComponent.ts](./examples/streamingWithComponent.ts)** | Production streaming with Convex component (RECOMMENDED) |
| **[examples/streamingEndpoint.ts](./examples/streamingEndpoint.ts)** | Raw SSE streaming endpoint (portable) |
| **[examples/client.html](./examples/client.html)** | Interactive test client for streaming |

## Migration Checklist

- [ ] Copy entire `aisdk` folder
- [ ] Install npm dependencies
- [ ] Set environment variables
- [ ] For streaming: Follow **[streaming-setup.md](./streaming-setup.md)**
- [ ] Replace Convex imports in `aiSdkActions.ts`
- [ ] Update test imports if needed
- [ ] Configure model presets in `aiModels.ts`
- [ ] Test with a simple generation
- [ ] Verify fallback chain works
- [ ] Test streaming with **[examples/client.html](./examples/client.html)**
