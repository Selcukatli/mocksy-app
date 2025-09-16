# Repository Guidelines

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
The stack is Next.js 15.5.3 with Turbopack for dev and build, Tailwind CSS v4 plus PostCSS, and TypeScript. Dark mode derives from CSS variables defined in `globals.css`, so adjust shared tokens instead of hard-coding colours. Mocksy’s product goal is AI-assisted app-store screenshot generation; when introducing new agents or external services, annotate their purpose in code comments and PR notes to keep future integrations predictable.
