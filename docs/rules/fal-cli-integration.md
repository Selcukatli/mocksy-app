# FAL CLI Integration Rules for AI Agents

**Tag this file when you need AI image generation in any project: `@fal-cli-integration.md`**

## Overview
The FAL CLI is a globally installed command-line tool for generating high-quality AI images using FAL AI models. This document provides rules and guidelines for AI agents to use the FAL CLI in any project.

## ⚠️ CRITICAL SECURITY RULES

### API Key Protection
- **NEVER** include FAL API keys directly in code, commands, or outputs
- **NEVER** echo, print, or display the FAL_KEY environment variable
- **NEVER** commit API keys to version control
- **ALWAYS** assume the API key is already configured in the user's environment
- **ALWAYS** use the CLI without exposing credentials

## Available Commands

### Basic Image Generation
```bash
# Generate with specific model and prompt
fal-cli generate -p "your prompt here" -m "model-id" --no-optimize

# Generate with prompt optimization
fal-cli generate -p "your prompt here" -m "model-id"

# Generate with custom output directory
fal-cli generate -p "your prompt here" -m "model-id" -o ./output/path
```

### Model Discovery
```bash
# List all available models with pricing
fal-cli models

# Get models in JSON format for parsing
fal-cli models --json

# Filter models by category
fal-cli models -c "Ultra Quality"
```

### Prompt Optimization
```bash
# Optimize a prompt for better results
fal-cli optimize "your basic prompt"

# Optimize for specific model
fal-cli optimize "your prompt" -m "flux-pro-ultra"
```

## Available Models & Costs

| Model ID | Name | Cost | Best For |
|----------|------|------|----------|
| `flux-kontext-pro` | FLUX Pro Kontext | $0.04/img | Contextual understanding, cheapest option |
| `flux-kontext-max` | FLUX Pro Kontext Max | $0.08/img | Advanced context, complex scenes |
| `flux-pro-ultra` | FLUX Pro Ultra v1.1 | $0.06/img | Ultra-high quality, 2K-4MP resolution |
| `imagen4-ultra` | Imagen 4 Ultra | $0.06/img | Photorealistic images |
| `qwen-image` | Qwen Image | $0.05/img | Excellent text rendering in images |

## Integration Patterns

### For Web Projects
```bash
# Generate assets for web application
fal-cli generate -p "hero banner with abstract gradient" -m "flux-pro-ultra" -o ./public/images

# Generate multiple icon variations
fal-cli generate -p "minimalist app icon" -m "qwen-image" -o ./src/assets/icons
```

### For Design Projects
```bash
# Generate design concepts
fal-cli generate -p "modern dashboard UI concept" -m "imagen4-ultra" -o ./designs/concepts

# Generate background patterns
fal-cli generate -p "seamless geometric pattern" -m "flux-kontext-pro" -o ./assets/patterns
```

### For Content Creation
```bash
# Generate blog post images
fal-cli generate -p "illustration for tech blog about AI" -m "flux-pro-ultra" -o ./content/images

# Generate social media content
fal-cli generate -p "instagram post about sustainability" -m "imagen4-ultra" -o ./social/instagram
```

## Output Structure
Generated images are saved with this structure:
```
output_directory/
└── gen_{timestamp}_{id}/
    └── {model}_{prompt#}_{iteration}_{image#}_{timestamp}_{random}.png
```

## Best Practices

### 1. Model Selection
- Use `flux-kontext-pro` for testing and development (cheapest at $0.04)
- Use `flux-pro-ultra` or `imagen4-ultra` for production-quality images
- Use `qwen-image` when text needs to be rendered in the image

### 2. Prompt Optimization
- Always use `--no-optimize` flag for testing to save API calls
- Use optimization for final production images
- Optimize prompts separately with `fal-cli optimize` to reuse

### 3. Output Management
- Always specify output directory with `-o` flag
- Use project-relative paths for consistency
- Create dedicated directories for different image types

### 4. Cost Management
- Check costs before bulk generation: `fal-cli models`
- Start with single images before batch generation
- Use cheaper models for prototyping

## Error Handling

### Common Issues & Solutions

```bash
# If "Unauthorized" error occurs
# Check API key configuration:
fal-cli config --show

# If "command not found" error
# Ensure global installation:
which fal-cli

# If output directory error
# Use absolute or relative paths:
fal-cli generate -p "test" -m "flux-kontext-pro" -o ~/Desktop/test
```

## Automation Examples

### Bash Script Integration
```bash
#!/bin/bash
# generate-assets.sh

# Generate multiple images for a project
PROMPTS=(
  "hero section background"
  "feature icon set"
  "testimonial avatars"
)

for prompt in "${PROMPTS[@]}"; do
  fal-cli generate -p "$prompt" -m "flux-kontext-pro" -o ./generated
done
```

### Node.js Integration
```javascript
// generate-images.js
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function generateImage(prompt, model = 'flux-kontext-pro', outputDir = './images') {
  try {
    const command = `fal-cli generate -p "${prompt}" -m "${model}" -o ${outputDir} --no-optimize`;
    const { stdout, stderr } = await execAsync(command);
    console.log('Generated:', stdout);
    return stdout;
  } catch (error) {
    console.error('Generation failed:', error);
    throw error;
  }
}

// Usage
await generateImage('modern website hero image', 'flux-pro-ultra', './public/images');
```

## DO's and DON'Ts

### ✅ DO's
- DO use the CLI for generating project assets
- DO specify output directories explicitly
- DO check model costs before bulk generation
- DO use prompt optimization for production images
- DO handle errors gracefully in scripts

### ❌ DON'Ts
- DON'T expose or log API keys
- DON'T hardcode API keys in scripts
- DON'T generate without checking costs first
- DON'T use expensive models for testing
- DON'T assume API key exists - check configuration first

## Quick Reference

```bash
# Check if FAL CLI is available
which fal-cli

# Check configuration (without showing key)
fal-cli config --show

# Generate cheap test image
fal-cli generate -p "test" -m "flux-kontext-pro" --no-optimize -o ./test

# Generate production image with optimization
fal-cli generate -p "professional headshot" -m "imagen4-ultra" -o ./final

# List models with costs
fal-cli models

# Get help
fal-cli --help
fal-cli generate --help
```

## Notes for AI Agents

When assisting users with FAL CLI:
1. Always protect API key security
2. Suggest cost-effective models for testing
3. Recommend appropriate output directories
4. Provide complete, working commands
5. Include error handling in scripts
6. Explain cost implications of choices

Remember: The FAL CLI is a powerful tool for AI image generation. Use it responsibly and always prioritize security and cost-effectiveness.