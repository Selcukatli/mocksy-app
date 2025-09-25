# fal.ai Image Generation Integration

This integration provides a modular, type-safe client for fal.ai's image generation API with dedicated model-specific clients.

## 🚀 Portability & Reuse

### Quick Start for New Projects

This module is designed to be portable. To use in another project:

1. **Copy the entire `fal` folder** to your project's utilities directory
2. **Install dependencies**:
   ```bash
   npm install @fal-ai/client
   ```
3. **Set environment variables**:
   ```bash
   FAL_KEY=your_fal_ai_api_key_here
   OPENAI_API_KEY=your_openai_key_here  # Only for GPT Image models
   ```
4. **Replace Convex-specific imports** (see below)

### Dependencies to Replace

| File | Convex Import | Replace With |
|------|--------------|-------------|
| `falImageActions.ts` | `import { action } from "../../_generated/server"` | Your framework's action/function wrapper |
| `test/*.ts` | `import { action } from "../../../_generated/server"` | Your test framework's action wrapper |

### Standalone Usage Example

```typescript
// Direct usage without Convex
import { generateFluxTextToImage } from './fal/clients/fluxImageClient';
import { generateGptTextToImage } from './fal/clients/gptImageClient';

// FLUX generation
const fluxResult = await generateFluxTextToImage({
  prompt: 'a majestic dragon',
  model: 'dev',
  image_size: 'landscape_4_3'
});

// GPT Image generation  
const gptResult = await generateGptTextToImage({
  prompt: 'cyberpunk city',
  quality: 'high',
  image_size: '1024x1024'
});
```

## Architecture Overview

The integration follows a clean modular architecture:

- **Model-specific clients** handle model logic, endpoint routing, and parameter mapping
- **Actions** provide simple Convex wrappers with validation
- **Types** ensure type safety across all models
- **Generic client** handles the core fal.ai API communication

## File Structure

```
convex/utils/fal/
├── types.ts                           # TypeScript interfaces and types
├── clients/                           # Model-specific client implementations
│   ├── falImageClient.ts              # Core generic API client
│   ├── fluxImageClient.ts             # FLUX model client
│   ├── fluxProUltraClient.ts         # FLUX Pro Ultra client
│   ├── kontextImageClient.ts          # FLUX Kontext model client
│   ├── gptImageClient.ts              # GPT Image model client
│   ├── imagenImageClient.ts           # Imagen4 model client
│   ├── geminiImageClient.ts           # Gemini 2.5 Flash client (text & edit)
│   ├── nanoBananaClient.ts            # Nano Banana client (text & edit)
│   └── qwenImageClient.ts             # Qwen Image client (text & edit)
├── falImageActions.ts                 # Convex action wrappers
├── index.ts                           # Barrel exports
└── README.md                          # This file
```

## Setup

### 1. Environment Variables

Set your required API keys:

```bash
# fal.ai API key (required for all models)
npx convex env set FAL_KEY your_fal_ai_api_key_here

# OpenAI API key (required for GPT Image models only)
npx convex env set OPENAI_API_KEY your_openai_api_key_here

# For production
npx convex env set FAL_KEY your_fal_ai_api_key_here --prod
npx convex env set OPENAI_API_KEY your_openai_api_key_here --prod
```

## Model Distinctions

### Important: Gemini 2.5 Flash vs Nano Banana
- **These are SEPARATE models** from Google, not the same endpoint
- **Gemini 2.5 Flash** (`fal-ai/gemini-25-flash-image`): $0.03/image - Fast, efficient generation
- **Nano Banana** (`fal-ai/nano-banana`): $0.04/image - State-of-the-art quality
- Both support text-to-image AND image editing through separate endpoints

## Supported Models & Clients

| Model | Client | Endpoint | Capabilities | Cost |
|-------|--------|----------|-------------|------|
| **FLUX Schnell/Dev/Pro** | `clients/fluxImageClient.ts` | `fal-ai/flux-1/*` | Fast, high-quality text-to-image | $0.025-0.05 |
| **FLUX Pro Ultra** | `clients/fluxProUltraClient.ts` | `fal-ai/flux-pro/v1.1-ultra` | Premium ultra-quality, 2K-4MP | $0.06 |
| **FLUX Kontext Pro/Max** | `clients/kontextImageClient.ts` | `fal-ai/flux-pro/kontext/*` | Context-aware image editing | $0.04 |
| **GPT Image 1** | `clients/gptImageClient.ts` | `fal-ai/gpt-image-1/*` | OpenAI text-to-image & editing | $0.08 |
| **Imagen4 Preview** | `clients/imagenImageClient.ts` | `fal-ai/imagen4/preview` | Google's photorealistic generation | $0.07 |
| **Gemini 2.5 Flash** | `clients/geminiImageClient.ts` | `fal-ai/gemini-25-flash-image` | Fast generation, text & edit | $0.03 |
| **Nano Banana** | `clients/nanoBananaClient.ts` | `fal-ai/nano-banana` | State-of-the-art Google model | $0.04 |
| **Qwen Image** | `clients/qwenImageClient.ts` | `fal-ai/qwen-image` | Excellent text rendering | $0.02 |

## Usage Examples

### Direct Client Usage (Internal Functions)

```typescript
import { generateFluxTextToImage } from "../utils/fal/clients/fluxImageClient";
import { generateGptTextToImage } from "../utils/fal/clients/gptImageClient";

// FLUX text-to-image
const fluxResult = await generateFluxTextToImage({
  prompt: "a majestic dragon flying over a castle",
  model: "dev", // "schnell" | "dev" | "pro"
  image_size: "landscape_4_3",
  num_inference_steps: 28,
  guidance_scale: 3.5,
  enable_safety_checker: false
});

// GPT Image with structured error handling
const gptResult = await generateGptTextToImage({
  prompt: "A serene cyberpunk cityscape at twilight",
  quality: "high",
  image_size: "1536x1024",
  aspect_ratio: "16:9"
});

if (gptResult.success) {
  const imageUrl = gptResult.data.images[0].url;
} else {
  console.error(`GPT Error: ${gptResult.error.message}`);
}
```

### Action Usage (Public API)

```typescript
// FLUX text-to-image
const result = await convex.action(api.utils.fal.falImageActions.fluxTextToImage, {
  prompt: "a majestic dragon flying over a castle",
  model: "dev",
  image_size: "landscape_4_3",
  guidance_scale: 3.5,
  enable_safety_checker: false
});

// GPT Image text-to-image
const result = await convex.action(api.utils.fal.falImageActions.gptTextToImage, {
  prompt: "A serene cyberpunk cityscape at twilight",
  quality: "high", 
  image_size: "1536x1024",
  aspect_ratio: "16:9"
});

// Imagen4 text-to-image
const result = await convex.action(api.utils.fal.falImageActions.imagenTextToImage, {
  prompt: "a photorealistic golden retriever",
  aspect_ratio: "1:1",
  negative_prompt: "blurry, low quality"
});

// FLUX Kontext image editing
const result = await convex.action(api.utils.fal.falImageActions.kontextEditImage, {
  prompt: "add snow to the mountains",
  image_url: "https://example.com/image.jpg",
  aspect_ratio: "16:9",
  model: "max", // "pro" | "max"
  guidance_scale: 3.5
});

// GPT Image editing
const result = await convex.action(api.utils.fal.falImageActions.gptEditImage, {
  prompt: "add a red car to the scene",
  image_url: "https://example.com/image.jpg",
  quality: "high",
  image_size: "1024x1024"
});
```

## Available Actions

### Text-to-Image Generation
- `fluxTextToImage` - FLUX models with model selection and safety controls
- `fluxProUltraTextToImage` - FLUX Pro Ultra for premium quality
- `gptTextToImage` - GPT Image with structured error responses
- `imagenTextToImage` - Imagen4 with aspect ratio controls
- `geminiFlashTextToImage` - Gemini 2.5 Flash fast generation ✨
- `nanoBananaTextToImage` - Nano Banana state-of-the-art quality ✨
- `qwenTextToImage` - Qwen with excellent text rendering ✨

### Image Editing
- `kontextEditImage` - FLUX Kontext with Pro/Max model selection
- `gptEditImage` - GPT Image editing with structured error responses
- `geminiFlashEditImage` - Gemini 2.5 Flash image editing ✨
- `nanoBananaEditImage` - Nano Banana image editing ✨
- `qwenEditImage` - Qwen image editing with text focus ✨

✨ = Models with both text-to-image AND image editing capabilities

## Model-Specific Features

### FLUX Models (`clients/fluxImageClient.ts`)
- **Models**: Schnell (fastest), Dev (balanced), Pro (highest quality)
- **Smart Safety**: Auto-detects model type and uses appropriate safety system
  - Schnell/Dev: `enable_safety_checker` (boolean)
  - Pro: `safety_tolerance` ("1" strict to "6" permissive)
- **Flexible Sizing**: Preset sizes or custom dimensions
- **Fast Generation**: ~1.2 second generation times

```typescript
await generateFluxTextToImage({
  prompt: "cyberpunk cityscape",
  model: "pro",
  image_size: { width: 1024, height: 768 }, // Custom size
  safety_tolerance: "5", // Pro model uses this
  guidance_scale: 3.5
});
```

### FLUX Kontext (`clients/kontextImageClient.ts`)
- **Models**: Pro (standard), Max (more powerful)
- **Context-Aware**: Understands image content for natural edits
- **Flexible Aspect Ratios**: Wide range including ultra-wide 21:9
- **Safety Controls**: Uses `safety_tolerance` system

```typescript
await editImageWithKontext({
  prompt: "make it a winter scene",
  image_url: "https://example.com/image.jpg",
  model: "max",
  aspect_ratio: "21:9",
  safety_tolerance: "5" // Most permissive
});
```

### GPT Image (`clients/gptImageClient.ts`)
- **BYOK**: Requires your OpenAI API key (from environment)
- **Structured Responses**: Success/error objects with detailed error types
- **Quality Control**: Explicit quality and size parameters required
- **Content Policy Handling**: Detailed error messages for policy violations

```typescript
const result = await generateGptTextToImage({
  prompt: "flying darth vader",
  quality: "high", // Required
  image_size: "1024x1024", // Required
  num_images: 2
});

if (!result.success) {
  if (result.error.type === "content_policy_violation") {
    console.log(`Suggestion: ${result.error.suggestion}`);
  }
}
```

### Imagen4 (`clients/imagenImageClient.ts`)
- **Photorealistic**: Excellent for realistic images and text rendering
- **Aspect Ratio Control**: Required parameter with 5 options
- **Negative Prompts**: Built-in support for exclusion prompts
- **Structured Responses**: Success/error objects like GPT Image

```typescript
const result = await generateImagenTextToImage({
  prompt: "a serene mountain lake at sunset",
  aspect_ratio: "16:9", // Required
  negative_prompt: "people, buildings, cars",
  num_images: 1
});
```

## Error Handling

### FLUX & Kontext Models
Return `null` on error with detailed console logging:

```typescript
const result = await generateFluxTextToImage({ /* params */ });
if (!result?.images?.[0]?.url) {
  console.error("FLUX generation failed - check logs");
  return;
}
```

### GPT Image & Imagen4 Models
Return structured success/error responses:

```typescript
const result = await generateGptTextToImage({ /* params */ });
if (!result.success) {
  switch (result.error.type) {
    case "content_policy_violation":
      console.log(`Content blocked: ${result.error.message}`);
      console.log(`Try: ${result.error.suggestion}`);
      break;
    case "validation_error":
      console.log(`Invalid params: ${result.error.message}`);
      break;
    case "api_error":
      console.log(`API error: ${result.error.message}`);
      break;
  }
  return;
}

const imageUrl = result.data.images[0].url;
```

## Internal Convex Function Examples

```typescript
import { internalAction } from "./_generated/server";
import { generateFluxTextToImage } from "../utils/fal/clients/fluxImageClient";
import { generateGptTextToImage } from "../utils/fal/clients/gptImageClient";

export const generateSlideImage = internalAction({
  args: { prompt: v.string(), model: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    if (args.model === "flux") {
      const result = await generateFluxTextToImage({
        prompt: args.prompt,
        model: "dev",
        image_size: "landscape_4_3"
      });
      return result?.images?.[0]?.url || null;
    }
    
    if (args.model === "gpt") {
      const result = await generateGptTextToImage({
        prompt: args.prompt,
        quality: "high",
        image_size: "1536x1024"
      });
      return result.success ? result.data.images[0].url : null;
    }
  },
});
```

## Key Benefits

✨ **Modular Architecture**: Each model has its own client with specialized logic  
🎯 **Type Safety**: Full TypeScript support with model-specific parameters  
🛡️ **Smart Safety**: Auto-detects model capabilities and uses appropriate safety systems  
⚡ **Fast Performance**: ~1.2 second generation times with queue management  
🔄 **Structured Errors**: Detailed error responses for debugging and user feedback  
🎨 **Flexible**: Support for all major fal.ai models with their unique features  
📦 **Clean API**: Simple action interfaces with complex logic hidden in clients

## Files Overview

| File/Directory | Purpose | Portable? |
|---------------|---------|----------|
| `types.ts` | TypeScript interfaces for all models | ✅ Yes (100% portable) |
| `clients/falImageClient.ts` | Core fal.ai API client | ✅ Yes (100% portable) |
| `clients/fluxImageClient.ts` | FLUX model client | ✅ Yes (100% portable) |
| `clients/kontextImageClient.ts` | Kontext editing client | ✅ Yes (100% portable) |
| `clients/gptImageClient.ts` | GPT Image client | ✅ Yes (100% portable) |
| `clients/imagenImageClient.ts` | Imagen4 client | ✅ Yes (100% portable) |
| `clients/fluxProUltraClient.ts` | FLUX Pro Ultra client | ✅ Yes (100% portable) |
| `clients/geminiImageClient.ts` | Gemini 2.5 Flash client | ✅ Yes (100% portable) |
| `clients/nanoBananaClient.ts` | Nano Banana client | ✅ Yes (100% portable) |
| `clients/qwenImageClient.ts` | Qwen Image client | ✅ Yes (100% portable) |
| `index.ts` | Public exports | ✅ Yes (100% portable) |
| `falImageActions.ts` | Convex action wrappers | ⚠️ Needs adaptation |
| `test/*.ts` | Test files | ⚠️ Needs adaptation |

## Integration Patterns

### With Next.js API Routes

```typescript
// app/api/generate-image/route.ts
import { generateFluxTextToImage } from '@/utils/fal/clients/fluxImageClient';

export async function POST(request: Request) {
  const { prompt, model } = await request.json();
  
  const result = await generateFluxTextToImage({
    prompt,
    model: model || 'dev',
    image_size: 'landscape_4_3'
  });
  
  if (!result?.images?.[0]?.url) {
    return Response.json({ error: 'Generation failed' }, { status: 500 });
  }
  
  return Response.json({ imageUrl: result.images[0].url });
}
```

### With Express.js

```typescript
import { generateGptTextToImage } from './utils/fal/clients/gptImageClient';

app.post('/api/generate-image', async (req, res) => {
  const result = await generateGptTextToImage({
    prompt: req.body.prompt,
    quality: 'high',
    image_size: '1024x1024'
  });
  
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  
  res.json({ imageUrl: result.data.images[0].url });
});
```

### With AWS Lambda

```typescript
import { generateImagenTextToImage } from './fal/clients/imagenImageClient';

export const handler = async (event) => {
  const { prompt } = JSON.parse(event.body);
  
  const result = await generateImagenTextToImage({
    prompt,
    aspect_ratio: '16:9'
  });
  
  return {
    statusCode: result.success ? 200 : 400,
    body: JSON.stringify(result)
  };
};
```

## Migration Checklist

- [ ] Copy entire `fal` folder
- [ ] Install `@fal-ai/client` dependency
- [ ] Set FAL_KEY environment variable
- [ ] Set OPENAI_API_KEY if using GPT Image
- [ ] Replace Convex imports in `falImageActions.ts`
- [ ] Update test imports if needed
- [ ] Test with a simple FLUX generation
- [ ] Test with GPT Image if using it
- [ ] Verify error handling works 