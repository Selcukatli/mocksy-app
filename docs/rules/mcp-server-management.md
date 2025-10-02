# MCP Server Management Guide

## Overview

MCP (Model Context Protocol) servers provide specialized tools and capabilities to AI assistants. This guide explains how to configure and sync MCP servers across Claude Code and Codex.

## Configuration Files

### Claude Code
- **Location**: Managed internally by Claude Code application
- **Command to view**: `claude mcp list`
- **Permissions**: Project-specific permissions in `.claude/settings.local.json`

### Codex
- **Location**: `~/.codex/config.toml`
- **Format**: TOML configuration file
- **Scope**: User-level (global across all projects)

## Current MCP Servers

### 1. Convex (Backend/Database)
```toml
[mcp_servers.convex]
command = "npx"
args = ["-y", "convex@latest", "mcp", "start"]
```

### 2. Playwright (Browser Automation)
```toml
[mcp_servers.playwright]
command = "npx"
args = ["@playwright/mcp@latest"]
```

### 3. FAL (AI Image Generation)
```toml
[mcp_servers.fal]
command = "node"
args = ["/Users/selcuk/.nvm/versions/node/v20.19.4/lib/node_modules/fal-cli/mcp-server.js"]
```

**Note**: Path is specific to your Node.js installation. Update if using different Node version.

### 4. Context7 (Documentation Retrieval)
```toml
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp@latest"]
```

### 5. Stripe (Payment Integration)
```toml
[mcp_servers.stripe]
command = "npx"
args = ["-y", "@stripe/mcp", "--tools=all"]
```

**Status**: Currently failing to connect in Claude Code. May need additional configuration.

### 6. Exa (Code Context Search)
**Claude Code Config**:
- URL-based HTTP connection: `https://mcp.exa.ai/mcp?exaApiKey=<key>&enabledTools=%5B%22get_code_context_exa%22%5D`

**Codex Config**:
- Not yet configured (HTTP-based servers need different approach)
- Alternative: Check if npm package `@exa/mcp-server` exists

## Syncing Process

### From Claude Code to Codex

1. **List current Claude Code MCP servers**:
   ```bash
   claude mcp list
   ```

2. **For each server, add to `~/.codex/config.toml`**:
   - Extract the command and arguments
   - Convert to TOML format
   - Add under `[mcp_servers.server-name]`

3. **Handle environment variables**:
   ```toml
   [mcp_servers.example]
   command = "npx"
   args = ["-y", "example-mcp"]
   env = { API_KEY = "your-key-here" }
   ```

### Adding New MCP Servers

1. **Install/configure in Claude Code first** (via UI or CLI)
2. **Verify it works**: `claude mcp list` should show "✓ Connected"
3. **Add to Codex config**: Update `~/.codex/config.toml`
4. **Add permissions** (if needed): Update `.claude/settings.local.json`

## Permissions Management

Project-specific auto-approve permissions are in `.claude/settings.local.json`:

```json
{
  "permissions": {
    "allow": [
      "mcp__convex__status",
      "mcp__convex__data",
      "mcp__fal__generate_image",
      "mcp__playwright__browser_navigate"
      // ... more permissions
    ]
  }
}
```

## Troubleshooting

### Server Won't Connect
1. Check server is installed: `npx <server-package> --version`
2. Verify environment variables are set
3. Check for conflicting ports or processes
4. Review server logs

### Path-Specific Issues (FAL)
- FAL MCP uses absolute path to Node.js installation
- If you upgrade Node or switch versions, update the path
- Alternative: Install fal-cli globally and use `npx` instead

### HTTP-Based Servers (Exa)
- May not work with standard TOML config
- Check if npm package alternative exists
- Consider using environment variables for API keys

## Security Notes

- **Never commit MCP config files with API keys** to version control
- Add to `.gitignore`:
  ```
  .claude/mcp_config.json
  .codex/config.toml
  ```
- Use environment variables for sensitive data when possible

## Best Practices

1. **Keep configs in sync**: When adding MCP to Claude Code, add to Codex too
2. **Document custom servers**: Add notes here for project-specific MCPs
3. **Test after changes**: Run `claude mcp list` to verify connectivity
4. **Version control permissions**: `.claude/settings.local.json` can be committed (without secrets)
5. **Regular audits**: Periodically review and remove unused MCP servers

## Quick Reference Commands

```bash
# List all MCP servers
claude mcp list

# View Codex config
cat ~/.codex/config.toml

# View Claude Code permissions
cat .claude/settings.local.json

# Search for MCP files
find ~/.claude ~/.config -name "*mcp*"
```
