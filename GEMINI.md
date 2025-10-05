# GEMINI.md

This file provides guidance to Gemini when working with code in this repository.

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
- `src/app/layout.tsx` - Root layout
- `src/app/page.tsx` - Main entry point
- `src/app/globals.css` - Global styles with Tailwind CSS imports and CSS variables for theming

## Testing Guidelines
There is no automated suite yet. Add tests alongside features (for example, `src/app/dashboard/__tests__/page.test.tsx`) and document new tooling in the README. Prefer React Testing Library for component behaviour and Playwright for end-to-end flows. Until coverage targets exist, note manual or automated checks in the PR body so reviewers know how the change was validated.

## Commit & Pull Request Guidelines
Write short imperative commit subjects (`Add screenshot editor`). Every PR should include a change summary, UI screenshots where relevant, manual test notes (`npm run build && npm run start`), and links to related issues. Rebase onto the latest `main` before requesting review and confirm `npm run lint` passes in the PR checks.

## Configuration & Secrets
Secrets belong in `.env.local` (gitignored) and should be read through `process.env`. Document required keys in the PR description and never commit real credentials or API tokens.

## Code Quality Standards

### ESLint Rules - IMPORTANT
- **NEVER** disable ESLint rules with comments like `// eslint-disable-next-line` unless absolutely necessary.
- **ALWAYS** fix the underlying issue properly instead of suppressing warnings.
- If an ESLint rule truly needs to be disabled, you MUST:
  1. First attempt to fix it properly.
  2. Explain why it cannot be fixed.
  3. Get explicit confirmation before adding any disable comments.

### Common ESLint Fixes (Do These Instead of Disabling):
- `@next/next/no-img-element`: Use Next.js `Image` component with proper width/height or fill props.
- `@typescript-eslint/no-unused-vars`: Remove unused imports/variables or prefix with underscore if intentionally unused.
- `@typescript-eslint/no-explicit-any`: Define proper types instead of using `any`.
- `react-hooks/rules-of-hooks`: Restructure component logic to follow hooks rules.

### Image Handling
- Always use `next/image` for optimized performance.
- Configure proper `sizes` prop for responsive images.
- Add `position: relative` to parent containers when using `fill` prop.
- Never use regular `<img>` tags unless dealing with external unoptimized sources (and explain why).

## Contextual Documentation System

### Documentation Reference Guide

**IMPORTANT**: Before working on any feature, you MUST consult the relevant documentation below.

| Technology Area | Documentation File | Use When |
|---|---|---|
| **Convex Backend** | `docs/rules/convex-rules.mdc` | Working with queries, mutations, actions, or database operations |
| **BAML Integration** | `docs/rules/baml-rules.md` | Implementing type-safe LLM functions or AI features |
| **FAL AI Models** | `docs/rules/fal-mcp-integration.md` | Image/video generation with FAL models |
| **FAL CLI** | `docs/rules/fal-cli-integration.md` | Using FAL command-line tools |
| **Clerk Auth** | `docs/rules/clerk-convex-setup.mdc` | Authentication, user management, webhooks |
| **Route Patterns** | `docs/rules/route-navigation-patterns.mdc` | Navigation, routing, page transitions |
| **Exa Search** | `docs/rules/exa-mcp-setup.md` | Search and context retrieval |
| **ShadCN UI** | `docs/learnings/shadcn-integration.md`| UI patterns and implementation |
| **PR Reviews** | `docs/pr-reviews/` | Historical PR feedback and patterns |


### Proactive Documentation Loading

**CRITICAL INSTRUCTION**: You MUST proactively read the appropriate documentation based on these triggers:

1.  **File Location Triggers**:
    *   Working in `convex/` → Read `docs/rules/convex-rules.mdc`
    *   Working in `src/app/` → Read `docs/rules/route-navigation-patterns.mdc`
    *   Working in `baml_src/` → Read `docs/rules/baml-rules.md`

2.  **Keyword Triggers**:
    *   BAML, LLM, AI, `.baml` files → Read `docs/rules/baml-rules.md`
    *   Convex, query, mutation, action → Read `docs/rules/convex-rules.mdc`
    *   FAL, image generation → Read `docs/rules/fal-mcp-integration.md`
    *   Auth, Clerk, webhook → Read `docs/rules/clerk-convex-setup.mdc`
    *   Navigation, routing → Read `docs/rules/route-navigation-patterns.mdc`

3.  **Pre-Task Checklist**:
    ```bash
    # Before starting work, list available guides
    ls docs/rules/
    # Then read relevant files based on the task.
    ```

## Critical Quick References

#### Convex Essentials
- **ALWAYS** use new function syntax: `query({args: {}, returns: v.null(), handler: async (ctx, args) => {}})`
- **NEVER** use `filter` in queries - use indexes instead.
- **ALWAYS** include `returns: v.null()` for functions with no return value.
- Use `"use node"` directive at file top for actions using Node.js modules.
- See full guide: `docs/rules/convex-rules.mdc`

#### BAML Integration Essentials
- **MUST** place BAML in project root (`baml_src/`), NOT in `convex/`.
- **ALWAYS** add `"use node"` to Convex actions using BAML.
- **REQUIRED**: Configure external packages in `convex.json`:
  ```json
  {"node": {"externalPackages": ["@boundaryml/baml"]}}
  ```
- Centralize all LLM clients in `baml_src/clients.baml`.
- **ALWAYS** run `npm run baml:generate` after editing `.baml` files.
- See full guide: `docs/rules/baml-rules.md`

#### FAL AI Integration
- Use MCP tools: `mcp__fal__generate_image`, `mcp__fal__list_models`.
- Cost awareness: Always calculate costs before generation.
- Model selection: Use `get_model_recommendations` for optimal choice.
- See full guide: `docs/rules/fal-mcp-integration.md`

## Agent Best Practices

1.  **Documentation First**: Always check relevant docs before implementing.
2.  **Pattern Matching**: Follow established patterns from existing code.
3.  **Type Safety**: Leverage TypeScript strict mode and Convex validators.
4.  **Error Handling**: Implement proper error boundaries and fallbacks.
5.  **Testing**: Document manual test procedures in PR notes.
