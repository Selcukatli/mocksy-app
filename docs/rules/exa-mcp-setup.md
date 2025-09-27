# Exa MCP Setup Guide

## Overview
Exa MCP provides AI-powered code search capabilities through the `get_code_context_exa` tool. This configuration optimizes for development by enabling only the code search tool.

## Current Configuration

### HTTP Endpoint with Tool Filtering
The Exa MCP is configured using the HTTP endpoint with selective tool enabling:

```json
{
  "mcpServers": {
    "exa": {
      "type": "http",
      "url": "https://mcp.exa.ai/mcp?exaApiKey=YOUR_API_KEY&enabledTools=%5B%22get_code_context_exa%22%5D",
      "headers": {}
    }
  }
}
```

### Configuration Details
- **Type**: HTTP (more reliable than stdio/npx)
- **API Key**: Included in URL via `exaApiKey` parameter
- **Tool Filtering**: `enabledTools` parameter with URL-encoded array
- **Enabled Tool**: Only `get_code_context_exa` for optimal performance
- **URL Encoding**: `%5B%22get_code_context_exa%22%5D` = `["get_code_context_exa"]`

## Available Tools

### get_code_context_exa (Enabled)
Search and retrieve relevant code context from:
- Open source libraries and frameworks
- GitHub repositories
- Programming documentation
- Code examples and implementation patterns
- API usage examples

**Parameters:**
- `query`: Search query for code/documentation
- `tokensNum`: Either "dynamic" (auto-optimized) or 1000-50000

**Example Usage:**
```typescript
mcp__exa__get_code_context_exa({
  query: "React custom hooks best practices",
  tokensNum: "dynamic"
})
```

### Disabled Tools (for performance)
According to the official Exa MCP documentation, these tools are available but disabled in our setup:
- `web_search_exa` - General web search
- `company_research` - Company information gathering
- `crawling` - URL content extraction
- `linkedin_search` - LinkedIn search
- `deep_researcher_start/check` - Deep research tasks

## Installation Methods

### Method 1: HTTP Configuration (Currently Used)
Add directly to `~/.claude.json`:
```python
# Python script to add configuration
import json
import urllib.parse

with open('/Users/YOUR_USERNAME/.claude.json', 'r') as f:
    data = json.load(f)

enabled_tools = ['get_code_context_exa']
encoded_tools = urllib.parse.quote(json.dumps(enabled_tools))

data['mcpServers']['exa'] = {
    'type': 'http',
    'url': f'https://mcp.exa.ai/mcp?exaApiKey=YOUR_API_KEY&enabledTools={encoded_tools}',
    'headers': {}
}

with open('/Users/YOUR_USERNAME/.claude.json', 'w') as f:
    json.dump(data, f, indent=2)
```

### Method 2: Claude CLI with stdio (Alternative - has issues)
```bash
# Note: This method has executable issues with npx
claude mcp add exa -e EXA_API_KEY=YOUR_API_KEY --scope user -- npx -y exa-mcp-server --tools=get_code_context_exa
```

## Troubleshooting

### Connection Status
Check connection via `/mcp` command in Claude Code.

### Common Issues

1. **stdio/npx fails to connect**
   - Solution: Use HTTP configuration instead
   - The npx executable has known issues

2. **Tool not available error**
   - Verify `get_code_context_exa` is in enabledTools
   - Check URL encoding is correct
   - Restart Claude Code after changes

3. **API Key issues**
   - Ensure API key is valid
   - Check it's properly included in the URL

## Performance Benefits
By enabling only `get_code_context_exa`:
- Faster response times
- More focused code search results
- Reduced overhead from unused tools
- Optimized for development workflows

## References
- [Exa MCP GitHub](https://github.com/exa-labs/exa-mcp-server)
- [Exa MCP Documentation](https://docs.exa.ai/reference/exa-mcp)
- [Exa Dashboard](https://dashboard.exa.ai)