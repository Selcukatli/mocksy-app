# Streaming Setup Guide for AI SDK

This guide explains how to set up HTTP streaming endpoints using the AI SDK module in a Convex project. The snippets below assume **AI SDK v5** (matching the versions installed in `package.json`) where `maxOutputTokens` replaces the older `maxTokens` option and streaming results expose `inputTokens`/`outputTokens` usage.

## Two Approaches to Streaming

### 🏆 Approach 1: Persistent Text Streaming Component (RECOMMENDED)
- **Example**: [`examples/streamingWithComponent.ts`](./examples/streamingWithComponent.ts)
- **Best for**: Production Convex applications
- **Benefits**: Automatic reconnection, state persistence, better error recovery
- **Based on**: Production code pattern from `articleTextStreaming.ts`

### 🔧 Approach 2: Raw Server-Sent Events (SSE)
- **Example**: [`examples/streamingEndpoint.ts`](./examples/streamingEndpoint.ts)  
- **Best for**: Learning, portability, non-Convex environments
- **Benefits**: Framework-agnostic, standard Web APIs, full control

## Quick Start (Recommended Approach)

To add streaming with the persistent-text-streaming component:

1. **Copy this entire `aisdk` folder** to your `convex/utils/` directory
2. **Install the component**: 
   ```bash
   npx convex import persistent-text-streaming
   ```
3. **Use the example from `streamingWithComponent.ts`** (see below)
4. **Deploy and test**

## Step 1: Create HTTP Router

Create or update `convex/http.ts`:

```typescript
import { httpRouter } from "convex/server";

const http = httpRouter();

// Import and register your streaming endpoints here
// Example:
// import { streamCompletion } from "./streaming/streamCompletion";
// http.route({
//   path: "/stream",
//   method: "POST",
//   handler: streamCompletion
// });

export default http;
```

## Step 2: Choose Your Streaming Approach

### Option A: Using Persistent Text Streaming Component (RECOMMENDED)

This approach uses Convex's battle-tested streaming component:

```typescript
import { httpAction } from "../_generated/server";
import { components } from "../_generated/api";
import { PersistentTextStreaming } from "@convex-dev/persistent-text-streaming";
import { streamTextWithAI } from "../utils/aisdk/aiSdkStreamClient";

const persistentTextStreaming = new PersistentTextStreaming(
  components.persistentTextStreaming
);

export const streamEndpoint = httpAction(async (ctx, request) => {
  const { streamId, prompt } = await request.json();
  
  return await persistentTextStreaming.stream(
    ctx,
    request,
    streamId,
    async (streamCtx, streamRequest, streamId, chunkAppender) => {
      let accumulatedContent = "";
      
      await streamTextWithAI({
        messages: [{ role: "user", content: prompt }],
        provider: { name: "openai", model: "gpt-4.1" },
        maxOutputTokens: 1200,
        onChunk: async (chunk) => {
          accumulatedContent += chunk;
          await chunkAppender(chunk);
        }
      });
      
      return accumulatedContent;
    }
  );
});
```

**Full example**: See [`examples/streamingWithComponent.ts`](./examples/streamingWithComponent.ts)

### Option B: Raw SSE Streaming (For Learning/Portability)

Create `convex/streaming/simpleStream.ts`:

```typescript
import { httpAction } from "../_generated/server";
import { streamTextWithAI } from "../utils/aisdk/aiSdkStreamClient";

export const simpleStream = httpAction(async (ctx, request) => {
  const { prompt } = await request.json();
  
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial connection message
        controller.enqueue(encoder.encode('data: {"status":"connected"}\n\n'));
        
        let fullText = "";
        
        // Stream text using AI SDK
        const result = await streamTextWithAI({
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
          ],
          provider: { name: "openai", model: "gpt-4.1" },
          maxOutputTokens: 1000,
          onChunk: (chunk) => {
            fullText += chunk;
            // Send chunk to client
            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({ text: chunk })}\n\n`
            ));
          }
        });
        
        // Send completion message
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ done: true, fullText, usage: result?.usage })}\n\n`
        ));
        
      } catch (error) {
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ error: error.message })}\n\n`
        ));
      } finally {
        controller.close();
      }
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
});
```

### Example 2: Advanced Streaming with Model Selection

Create `convex/streaming/advancedStream.ts`:

```typescript
import { httpAction } from "../_generated/server";
import { streamTextWithAI } from "../utils/aisdk/aiSdkStreamClient";
import { createSystemPrompt, createUserMessage } from "../utils/aisdk/aiSdkClient";

export const advancedStream = httpAction(async (ctx, request) => {
  const { prompt, model = "gpt-5", temperature = 0.7 } = await request.json();
  
  const encoder = new TextEncoder();
  let timeToFirstToken: number | null = null;
  const startTime = Date.now();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send metadata
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ 
            status: "starting",
            model,
            timestamp: new Date().toISOString()
          })}\n\n`
        ));
        
        let fullText = "";
        let tokenCount = 0;
        
        const result = await streamTextWithAI({
          messages: [
            createSystemPrompt("assistant", "You are a creative writer."),
            createUserMessage(prompt)
          ],
          provider: { 
            name: model.startsWith("claude") ? "anthropic" : "openai", 
            model 
          },
          temperature,
          maxOutputTokens: 2000,
          onChunk: (chunk) => {
            if (timeToFirstToken === null) {
              timeToFirstToken = Date.now() - startTime;
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ 
                  metrics: { timeToFirstToken }
                })}\n\n`
              ));
            }
            
            fullText += chunk;
            tokenCount++;
            
            // Stream the chunk
            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({ 
                text: chunk,
                tokenCount 
              })}\n\n`
            ));
          }
        });
        
        // Send completion with metrics
        const totalTime = Date.now() - startTime;
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ 
            done: true,
            fullText,
            metrics: {
              totalTime,
              timeToFirstToken,
              tokensPerSecond: (tokenCount / (totalTime / 1000)).toFixed(2),
              totalTokens: result?.usage?.totalTokens,
              outputTokens: result?.usage?.outputTokens,
            },
            usage: result?.usage,
          })}\n\n`
        ));
        
      } catch (error) {
        console.error("[Stream Error]", error);
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ 
            error: error.message,
            type: "stream_error"
          })}\n\n`
        ));
      } finally {
        controller.close();
      }
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
});
```

## Step 3: Register Endpoints

Update your `convex/http.ts`:

```typescript
import { httpRouter } from "convex/server";
import { simpleStream } from "./streaming/simpleStream";
import { advancedStream } from "./streaming/advancedStream";

const http = httpRouter();

// Register streaming endpoints
http.route({
  path: "/stream/simple",
  method: "POST",
  handler: simpleStream
});

http.route({
  path: "/stream/advanced",
  method: "POST",
  handler: advancedStream
});

// Add CORS preflight handling
http.route({
  path: "/stream/simple",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  })
});

export default http;
```

## Step 4: Client-Side Implementation

### JavaScript/TypeScript Client

```typescript
async function streamCompletion(prompt: string) {
  const response = await fetch('https://your-app.convex.site/stream/simple', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  if (!reader) throw new Error('No response body');
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        
        if (data.text) {
          // Append text to UI
          console.log('Received:', data.text);
        }
        
        if (data.done) {
          console.log('Complete:', data.fullText);
        }
        
        if (data.error) {
          console.error('Error:', data.error);
        }
      }
    }
  }
}
```

### React Hook Example

```typescript
import { useState, useCallback } from 'react';

export function useStreamingCompletion() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const stream = useCallback(async (prompt: string) => {
    setIsStreaming(true);
    setText('');
    setError(null);
    
    try {
      const response = await fetch('/api/stream/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) throw new Error('No response body');
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.text) {
              setText(prev => prev + data.text);
            }
            
            if (data.error) {
              setError(data.error);
            }
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsStreaming(false);
    }
  }, []);
  
  return { stream, text, isStreaming, error };
}
```

## Advanced Features

### Streaming with Reasoning (GPT-5)

```typescript
const result = await streamTextWithAI({
  messages,
  provider: { name: "openai", model: "gpt-5" },
  reasoningEffort: "high", // Enable reasoning for GPT-5
  onChunk: (chunk) => {
    // Handle streaming chunks
  }
});
```

### Fallback Providers

```typescript
const result = await streamTextWithAI({
  messages,
  provider: { name: "openai", model: "gpt-5" },
  fallbackProvider: { name: "anthropic", model: "claude-3-5-sonnet" },
  onChunk: (chunk) => {
    // Automatically falls back if primary fails
  }
});
```

### Custom Headers and CORS

```typescript
return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': process.env.CLIENT_URL || '*',
    'X-Accel-Buffering': 'no', // Disable Nginx buffering
  },
});
```

## Testing Your Endpoints

### Using curl

```bash
curl -X POST https://your-app.convex.site/stream/simple \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Tell me a story"}'
```

### Using the Browser

Create a simple HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Streaming Test</title>
</head>
<body>
  <button onclick="testStream()">Test Stream</button>
  <div id="output"></div>
  
  <script>
    async function testStream() {
      const output = document.getElementById('output');
      output.innerHTML = '';
      
      const response = await fetch('/stream/simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Tell me a joke' })
      });
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.text) {
              output.innerHTML += data.text;
            }
          }
        }
      }
    }
  </script>
</body>
</html>
```

## Common Issues and Solutions

### Issue: CORS Errors
**Solution**: Add OPTIONS handlers and proper CORS headers to all endpoints.

### Issue: Connection Drops
**Solution**: Implement reconnection logic on the client side.

### Issue: Buffering in Production
**Solution**: Add `X-Accel-Buffering: no` header for Nginx environments.

### Issue: Token Limits
**Solution**: Use appropriate `maxOutputTokens` values and handle truncation gracefully.

## Integration with Other Frameworks

### Next.js API Routes
See the main README.md for Next.js integration examples.

### Express.js
The streaming logic can be adapted for Express with minimal changes.

### AWS Lambda
Note: Lambda doesn't support true streaming. Consider using WebSockets or polling instead.

## Migration Checklist

- [ ] Copy entire `aisdk` folder to `convex/utils/`
- [ ] Create or update `convex/http.ts`
- [ ] Create streaming endpoint files
- [ ] Register routes in HTTP router
- [ ] Add CORS handlers if needed
- [ ] Test with curl or browser
- [ ] Implement client-side handling
- [ ] Deploy to production
