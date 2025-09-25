# FAL MCP Server Integration Rules

**Tag this file when you need FAL AI image generation through MCP: `@fal-mcp-integration.md`**

## Overview
The FAL MCP Server provides Model Context Protocol integration for AI assistants to generate high-quality AI images using FAL AI models.

## ⚠️ CRITICAL SECURITY RULES

### API Key Protection
- **NEVER** include FAL API keys directly in configurations shown to users
- **NEVER** display or log the FAL_KEY in any output
- **ALWAYS** use environment variables or secure config files
- **ALWAYS** refer to the key as "your_fal_api_key" in examples

## MCP Server Setup

### Starting the Server Standalone
```bash
# Default port (3001)
npm run mcp-server

# Custom port
PORT=3002 npm run mcp-server

# From any directory (if globally installed)
cd /path/to/fal-cli && npm run mcp-server
```

## Integration Configurations

### Claude Desktop Integration
Claude Desktop is the standalone desktop application. Configure in:
`~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "fal-cli": {
      "command": "node",
      "args": ["/Users/your-username/Documents/mcps/fal-cli/mcp-server.js"],
      "env": {
        "FAL_KEY": "your_fal_api_key"
      }
    }
  }
}
```

### Claude Code Integration (CLI)
Claude Code is the CLI tool that can use MCP servers. It supports stdio, SSE, and HTTP transports.

#### Adding FAL MCP to Claude Code CLI:
```bash
# Add at user level (recommended for global use)
claude mcp add fal -s user -e FAL_KEY="your_fal_api_key" -- node /path/to/fal-cli/mcp-server.js

# Or add at project level (for specific project only)
claude mcp add fal -s project -e FAL_KEY="your_fal_api_key" -- node /path/to/fal-cli/mcp-server.js

# Or add at local level (current session only)
claude mcp add fal -s local -e FAL_KEY="your_fal_api_key" -- node /path/to/fal-cli/mcp-server.js
```

**Scope Options:**
- `user`: Available in all your projects (recommended for FAL since it's globally installed)
- `project`: Only for current project
- `local`: Current session only (default)

**Note:** After adding, restart your Claude Code session to load the MCP server.

### Cursor Integration
Add to Cursor's MCP settings:
```json
{
  "mcpServers": {
    "fal-cli": {
      "command": "node",
      "args": ["/path/to/fal-cli/mcp-server.js"],
      "env": {
        "FAL_KEY": "your_fal_api_key"
      }
    }
  }
}
```

## Available MCP Tools

### 1. `mcp__fal__generate_image`
Generate a single image with any FAL AI model.

**Parameters:**
- `model` (required): Full model ID (e.g., "fal-ai/flux-pro/kontext/text-to-image")
- `prompt` (required): Text description
- `save_to_disk`: Save locally (true/false)
- `output_directory`: Where to save images
- `parameters`: Object with:
  - `aspect_ratio`: Image ratio ("16:9", "1:1", "9:16", etc.)
  - `num_images`: Number of images (1-4)
  - `guidance_scale`: Prompt adherence (1.0-20.0)
  - `num_inference_steps`: Quality/speed tradeoff (4-50)

**Example Usage (Actual Working Code):**
```javascript
mcp__fal__generate_image({
  prompt: "A modern mobile app screenshot showing a fitness dashboard",
  model: "fal-ai/flux-pro/kontext/text-to-image",
  save_to_disk: true,
  output_directory: "./.temp-images",  // Use .temp-images folder (gitignored)
  parameters: {
    aspect_ratio: "9:16",
    num_images: 1,
    guidance_scale: 3.5,
    num_inference_steps: 28
  }
})
```

**Result:** Successfully generated image in 5.6 seconds, saved to local directory.

### 2. `mcp__fal__list_models`
Get all available models with pricing and capabilities.

**Parameters:**
- `quality` (optional): Filter by quality level ("fast", "balanced", "high", "ultra")
- `max_cost` (optional): Maximum cost per generation in USD
- `provider` (optional): Filter by AI provider name

**Note:** The `type` parameter (e.g., "image") currently returns no results. Use without filters or with the parameters above.

**Usage in AI Assistant:**
```
List all high quality models with their pricing
```

### 3. `mcp__fal__optimize_prompt`
Enhance prompts using AI for better generation results.

**Parameters:**
- `prompt` (required): Original prompt
- `model` (optional): Target model
- `style` (optional): Style preference ("detailed", "artistic", "technical", "creative")

### 4. `mcp__fal__batch_generate`
Generate multiple images with different prompts/models.

**Parameters:**
- `tasks` (required): Array of generation tasks
- `output_directory`: Where to save images
- `batch_size`: Concurrent generations (1-5)

### 5. `mcp__fal__calculate_cost`
Estimate costs before generation.

**Parameters:**
- `tasks` (required): Array of tasks with model and image_count

### 6. `mcp__fal__get_model_info`
Get detailed information about a specific model.

**Parameters:**
- `model_id` (required): Model identifier

### 7. `mcp__fal__get_model_recommendations`
Get model recommendations based on criteria.

**Parameters:**
- `quality`: Quality preference ("high", "medium", "fast")
- `speed`: Speed preference ("fast", "medium", "slow")
- `budget`: Maximum budget per image
- `type`: Preferred model type

## Model Pricing Reference

| Model | Cost/Image | Best For |
|-------|------------|----------|
| `flux-kontext-pro` | $0.04 | Testing, context understanding |
| `flux-kontext-max` | $0.08 | Advanced context, complex scenes |
| `flux-pro-ultra` | $0.06 | Ultra-high quality, 2K-4MP |
| `imagen4-ultra` | $0.06 | Photorealistic images |
| `qwen-image` | $0.05 | Text rendering in images |

## Cost Control Features

The MCP server includes:
- **$5 spending limit** per session by default
- Automatic cost calculation before generation
- Requires confirmation for high-cost operations
- Batch operations show total cost upfront

## Testing MCP Server Connection

### 1. Verify Server Starts
```bash
cd /path/to/fal-cli
npm run mcp-server
# Should show: "FAL CLI MCP Server running on stdio"
```

### 2. Check Available Tools
Once connected, the AI assistant should be able to:
- List available models
- Calculate costs
- Generate images
- Optimize prompts

### 3. Test Generation
Ask the AI assistant:
```
"Use the FAL MCP server to generate a simple test image with the cheapest model"
```

## Common Issues & Solutions

### "Unauthorized" Error
- Check FAL_KEY environment variable is set
- Verify API key is valid at fal.ai
- Ensure key is passed to MCP server

### "Model not found" Error
- Use `list_models` to see available models
- Check model ID spelling
- Use exact IDs like "flux-kontext-pro"

### "Command not found" Error
- Verify full path to mcp-server.js
- Check Node.js is installed
- Ensure fal-cli dependencies are installed

### Server Won't Start
```bash
# Debug steps
cd /path/to/fal-cli
npm install  # Ensure dependencies installed
node --version  # Check Node.js 18+
FAL_KEY="your_key" node mcp-server.js  # Test directly
```

### MCP Tools Not Available in Claude Code
If `mcp__fal__*` tools don't appear after adding the server:
1. Restart your Claude Code session completely
2. Check the MCP was added successfully: Look for success message
3. Verify the path is correct: `ls /path/to/fal-cli/mcp-server.js`
4. Check your configuration scope matches your needs
5. Ensure FAL_KEY environment variable is properly set

## Best Practices

### Configuration Scope Decision
**When to use each scope:**
- **User Level** (Recommended for FAL):
  - When the tool is globally installed (like FAL CLI via npm)
  - When you'll use it across multiple projects
  - For general-purpose tools like image generation
  - Example: `claude mcp add fal -s user ...`

- **Project Level**:
  - When the tool is project-specific
  - When different projects need different configurations
  - For project-specific API keys or settings
  - Example: `claude mcp add myapp -s project ...`

- **Local Level**:
  - For testing or temporary use
  - When you don't want to persist the configuration
  - For one-off experiments
  - Example: `claude mcp add test -s local ...`

### For Development
1. Use `flux-kontext-pro` (cheapest at $0.04)
2. Always check costs before generation
3. Test with single images first

### For Production
1. Use `flux-pro-ultra` or `imagen4-ultra`
2. Optimize all prompts before generation
3. Set appropriate output directories

### For Integration
1. Store API keys securely
2. Use absolute paths in configurations
3. Test connection before bulk operations

## DO's and DON'Ts

### ✅ DO's
- DO protect API keys in all configurations
- DO use cost calculation before bulk operations
- DO specify full paths to mcp-server.js
- DO test with cheap models first

### ❌ DON'Ts
- DON'T expose API keys in examples or logs
- DON'T hardcode keys in configurations
- DON'T exceed spending limits carelessly
- DON'T use relative paths in configs

## Quick Test Commands

```bash
# Start server with debug output
FAL_KEY="your_key" node /path/to/fal-cli/mcp-server.js 2>&1 | tee mcp.log

# Check if port is in use
lsof -i :3001

# Test API key validity
FAL_KEY="your_key" node -e "console.log('Key format valid')"
```

## Notes for AI Assistants

When using FAL MCP Server:
1. Never expose actual API keys
2. Always suggest cheapest models for testing
3. Calculate costs before any generation
4. Provide clear error messages
5. Confirm high-cost operations
6. Use absolute paths in examples

Remember: The MCP server bridges FAL AI's powerful image generation with AI assistants while maintaining security and cost control.