# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mocksy is a Next.js application for generating, editing, and translating app store screenshots using AI. Built with Next.js 15.5.3, TypeScript, and Tailwind CSS v4.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## Architecture

- **Framework**: Next.js 15.5.3 with App Router
- **Styling**: Tailwind CSS v4 with PostCSS
- **Type Safety**: TypeScript with strict mode enabled
- **Bundler**: Turbopack (enabled in dev and build scripts)
- **Path Aliases**: `@/*` maps to `./src/*`

## Code Structure

The application uses Next.js App Router with the following structure:
- `src/app/` - App router pages and layouts
- `src/app/layout.tsx` - Root layout with Geist font family
- `src/app/page.tsx` - Main entry point
- `src/app/globals.css` - Global styles with Tailwind CSS imports and CSS variables for theming

## Development Notes

- ESLint configuration extends Next.js core-web-vitals and TypeScript rules
- Dark mode support is configured through CSS variables in globals.css
- The project currently contains only the Next.js starter template and needs implementation of the screenshot generation features

## Code Quality Standards

### ESLint Rules - IMPORTANT
- **NEVER** disable ESLint rules with comments like `// eslint-disable-next-line` unless absolutely necessary
- **ALWAYS** fix the underlying issue properly instead of suppressing warnings
- If an ESLint rule truly needs to be disabled (rare cases), you MUST:
  1. First attempt to fix it properly
  2. Explain to the user why it cannot be fixed
  3. Get explicit confirmation before adding any disable comments

### Common ESLint Fixes (Do These Instead of Disabling):
- `@next/next/no-img-element`: Use Next.js `Image` component with proper width/height or fill props
- `@typescript-eslint/no-unused-vars`: Remove unused imports/variables or prefix with underscore if intentionally unused
- `@typescript-eslint/no-explicit-any`: Define proper types instead of using `any`
- `react-hooks/rules-of-hooks`: Restructure component logic to follow hooks rules

### Image Handling
- Always use `next/image` for optimized performance
- Configure proper `sizes` prop for responsive images
- Add `position: relative` to parent containers when using `fill` prop
- Never use regular `<img>` tags unless dealing with external unoptimized sources (and explain why)

## Contextual Documentation System

### Documentation Reference Guide

IMPORTANT: Before working on any feature, consult the relevant documentation below:

#### Backend & Database
- **Convex Development**: `docs/rules/convex-rules.mdc` - Convex function syntax, validators, queries, mutations, actions
- **BAML Integration**: `docs/rules/baml-rules.md` - Type-safe LLM functions with BAML and Convex

#### AI & Image Generation
- **FAL MCP Integration**: `docs/rules/fal-mcp-integration.md` - FAL AI models via MCP
- **FAL CLI Integration**: `docs/rules/fal-cli-integration.md` - FAL command-line interface setup
- **Exa MCP Setup**: `docs/rules/exa-mcp-setup.md` - Exa search and context API configuration

#### Authentication & Navigation
- **Clerk Authentication**: `docs/rules/clerk-convex-setup.mdc` - Clerk auth with Convex backend
- **Route Navigation**: `docs/rules/route-navigation-patterns.mdc` - Next.js routing patterns and best practices

#### Code Reviews & Learnings
- **ShadCN Integration**: `docs/learnings/shadcn-integration.md` - Lessons from ShadCN UI setup
- **PR Reviews**: `docs/pr-reviews/` - Historical PR feedback and patterns

### Proactive Documentation Loading

**CRITICAL INSTRUCTION**: You MUST proactively read the appropriate documentation based on these triggers:

1. **File Pattern Triggers** (automatic via MDC globs):
   - Working in `convex/**` → Rules from `convex-rules.mdc` apply automatically
   - Authentication routes → Check `clerk-convex-setup.mdc`

2. **Keyword Triggers** (manual reading required):
   - BAML, LLM functions, type-safe AI, `.baml` files → Read `docs/rules/baml-rules.md`
   - Convex queries/mutations/actions → Read `docs/rules/convex-rules.mdc`
   - FAL, image generation, AI models → Read `docs/rules/fal-mcp-integration.md`
   - Authentication, Clerk, webhooks → Read `docs/rules/clerk-convex-setup.mdc`
   - Navigation, routing, Next.js routes → Read `docs/rules/route-navigation-patterns.mdc`

3. **Before Starting Any Task**:
   ```bash
   # Quick check for relevant docs
   ls docs/rules/  # List available documentation
   # Then use Read tool on relevant files
   ```

### Critical Quick References

#### Convex Essentials
- **ALWAYS** use new function syntax: `query({args: {}, returns: v.null(), handler: async (ctx, args) => {}})`
- **NEVER** use `filter` in queries - use indexes instead
- **ALWAYS** include `returns: v.null()` for functions with no return value
- Use `"use node"` directive at file top for actions using Node.js modules
- See full guide: `docs/rules/convex-rules.mdc`

#### BAML Integration Essentials
- **MUST** place BAML in project root, NOT in convex/
- **ALWAYS** add `"use node"` to Convex actions using BAML
- **REQUIRED**: Configure external packages in `convex.json`:
  ```json
  {"node": {"externalPackages": ["@boundaryml/baml"]}}
  ```
- Centralize all LLM clients in `baml_src/clients.baml`
- **ALWAYS** run `npm run baml:generate` after editing `.baml` files
- See full guide: `docs/rules/baml-rules.md`

#### FAL AI Integration
- Use MCP tools: `mcp__fal__generate_image`, `mcp__fal__list_models`
- Cost awareness: Always calculate costs before generation
- Model selection: Use `get_model_recommendations` for optimal choice
- See full guide: `docs/rules/fal-mcp-integration.md`