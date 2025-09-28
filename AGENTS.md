# Repository Guidelines

## Contextual Documentation System

### Documentation Map for Agents

Before implementing features, agents should consult the appropriate specialized documentation:

#### Technology-Specific Guides
| Technology Area | Documentation File | Use When |
|----------------|-------------------|-----------|
| **Convex Backend** | `docs/rules/convex-rules.mdc` | Working with queries, mutations, actions, or database operations |
| **BAML Integration** | `docs/rules/baml-convex-setup.md` | Implementing type-safe LLM functions or AI features |
| **FAL AI Models** | `docs/rules/fal-mcp-integration.md` | Image/video generation with FAL models |
| **FAL CLI** | `docs/rules/fal-cli-integration.md` | Using FAL command-line tools |
| **Clerk Auth** | `docs/rules/clerk-convex-setup.mdc` | Authentication, user management, webhooks |
| **Route Patterns** | `docs/rules/route-navigation-patterns.mdc` | Navigation, routing, page transitions |
| **Exa Search** | `docs/rules/exa-mcp-setup.md` | Search and context retrieval |

#### Learning Resources
- **ShadCN UI Patterns**: `docs/learnings/shadcn-integration.md`
- **PR Review History**: `docs/pr-reviews/` directory

### Agent Task Triggers

Agents should automatically check documentation based on these patterns:

1. **File Location Triggers**:
   - Working in `convex/` → Read `convex-rules.mdc`
   - Working in `src/app/` → Read `route-navigation-patterns.mdc`
   - Working in `baml_src/` → Read `baml-convex-setup.md`

2. **Feature Triggers**:
   - AI/LLM features → Check BAML documentation
   - Image generation → Check FAL documentation
   - Database operations → Check Convex documentation
   - Authentication → Check Clerk documentation

3. **Pre-Task Checklist**:
   ```bash
   # Agents should run this before starting work
   ls docs/rules/  # List available guides
   # Then read relevant files based on the task
   ```

## Project Structure & Module Organization
Next.js App Router files live in `src/app`; each segment keeps `page.tsx`, optional `layout.tsx`, and co-located assets. Global styling and Tailwind layers stay in `src/app/globals.css`; static assets belong in `public/`. Root configs (`next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`) should change only with review. Use the `@/*` alias for imports to avoid brittle relative paths.

## Build, Test, and Development Commands
- `npm run dev` — start the Turbopack dev server with live reload.
- `npm run build` — create the optimized production bundle; run before deploying or cutting releases.
- `npm run start` — serve the production build locally to validate runtime behaviour.
- `npm run lint` — run the Next.js ESLint suite; required before any PR.

## Coding Style & Naming Conventions
TypeScript strict mode is the baseline. Use 2-space indentation. Components are PascalCase, hooks and helpers camelCase, and route folders should read like final URLs (`src/app/dashboard/page.tsx`). Keep layout styling inline with Tailwind utilities and promote repeats into `globals.css` or shared components. Finish edits with `npm run lint` to stay aligned with `next/core-web-vitals` guidance and keep theme tokens consistent.

## Testing Guidelines
There is no automated suite yet. Add tests alongside features (for example, `src/app/dashboard/__tests__/page.test.tsx`) and document new tooling in the README. Prefer React Testing Library for component behaviour and Playwright for end-to-end flows. Until coverage targets exist, note manual or automated checks in the PR body so reviewers know how the change was validated.

## Commit & Pull Request Guidelines
Write short imperative commit subjects (`Add screenshot editor`). Every PR should include a change summary, UI screenshots where relevant, manual test notes (`npm run build && npm run start`), and links to related issues. Rebase onto the latest `main` before requesting review and confirm `npm run lint` passes in the PR checks.

## Configuration & Secrets
Secrets belong in `.env.local` (gitignored) and should be read through `process.env`. Document required keys in the PR description and never commit real credentials or API tokens.

## Architecture & Tooling Notes
The stack is Next.js 15.5.3 with Turbopack for dev and build, Tailwind CSS v4 plus PostCSS, and TypeScript. Dark mode derives from CSS variables defined in `globals.css`, so adjust shared tokens instead of hard-coding colours. Mocksy's product goal is AI-assisted app-store screenshot generation; when introducing new agents or external services, annotate their purpose in code comments and PR notes to keep future integrations predictable.

## Technology-Specific Agent Guidelines

### Convex Backend Operations
When agents work with Convex:
- **MUST** use new function syntax: `query({args: {}, returns: v.null(), handler: async (ctx, args) => {}})`
- **NEVER** use `filter` in queries - always use indexes
- **ALWAYS** include `returns: v.null()` even for void functions
- Add `"use node"` directive for actions using Node.js modules
- Full guide: `docs/rules/convex-rules.mdc`

### BAML AI Integration
When agents implement LLM features:
- Place BAML files in project root (`baml_src/`), NOT in `convex/`
- Configure `convex.json` with external packages
- Centralize all LLM clients in `baml_src/clients.baml`
- Use CommonJS imports for BAML in Convex actions
- Full guide: `docs/rules/baml-convex-setup.md`

### FAL Image Generation
When agents work with FAL AI:
- Use MCP tools: `mcp__fal__generate_image`, `mcp__fal__list_models`
- Always calculate costs before generation
- Use `get_model_recommendations` for optimal model selection
- Save images with organized folder structure
- Full guide: `docs/rules/fal-mcp-integration.md`

### Authentication with Clerk
When agents implement auth features:
- Follow webhook security patterns
- Implement proper user synchronization
- Handle token refresh correctly
- Full guide: `docs/rules/clerk-convex-setup.mdc`

### Route Navigation Patterns
When agents work on navigation:
- Keep route-specific components in route directories
- Use parallel/intercepting routes for overlays
- Maintain page context with proper layouts
- Full guide: `docs/rules/route-navigation-patterns.mdc`

## Agent Best Practices

1. **Documentation First**: Always check relevant docs before implementing
2. **Pattern Matching**: Follow established patterns from existing code
3. **Type Safety**: Leverage TypeScript strict mode and Convex validators
4. **Error Handling**: Implement proper error boundaries and fallbacks
5. **Testing**: Document manual test procedures in PR notes
