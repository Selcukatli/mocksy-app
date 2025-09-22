# Shadcn/ui Integration Learnings

## Issue: CSS Variables Overwritten During Init

**Date**: 2025-09-19

### What Happened
When adding a dropdown menu component from shadcn/ui to an existing project with custom design, running `npx shadcn@latest init` overwrote all our custom CSS variables with shadcn's defaults.

**Impact**:
- Lost custom purple/pink brand colors (replaced with grayscale)
- Changed color format from HSL to OKLCH
- Added unnecessary CSS variables (sidebar-related)
- Broke the existing design system

### Root Cause
The `shadcn init` command assumes you want their complete default theme and will overwrite any existing CSS variables in `globals.css`.

### What We Should Have Done

#### Option 1: Skip CSS during init (BEST)
```bash
npx shadcn@latest init --no-css
```

#### Option 2: Add components without re-initializing
If shadcn was already partially set up:
```bash
npx shadcn@latest add dropdown-menu --yes
```

#### Option 3: Manual setup
Create `components.json` manually without running init:
```json
{
  "$schema": "https://shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Best Practices

1. **For existing projects with custom styles**:
   - Always backup `globals.css` before running init
   - Use `--no-css` flag to preserve custom CSS
   - Or skip init entirely if possible

2. **Adding components to existing shadcn setup**:
   - Use `add` command, not `init`
   - Check if components.json already exists

3. **For projects with brand colors**:
   - Keep custom color variables in a separate file
   - Document your color system
   - Consider using CSS layers to separate concerns

### Recovery Steps
If CSS gets overwritten:
1. Check git diff to see what changed
2. Restore original color variables
3. Keep only necessary shadcn additions (like animation utilities)
4. Remove unused variables (like sidebar-related ones)

### Key Takeaway
**Always be cautious with initialization commands in existing projects.** They often assume a blank slate and will overwrite customizations. Read documentation about flags and options before running init commands.