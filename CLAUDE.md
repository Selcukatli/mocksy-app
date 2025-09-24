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