# Lint Fix - Automatic Linter Error Resolution

Automatically detects and fixes linter errors across your codebase with intelligent error resolution and clear reporting.

## 🚀 Core Features

### Persistent Fixing
- **Iterative Approach** - Keeps running until all auto-fixable issues are resolved
- **Smart Detection** - Identifies when fixes create new issues and addresses them
- **Progress Tracking** - Shows improvement with each iteration
- **Loop Prevention** - Stops after 5 rounds or when no progress is made

### Auto-Detection
- **ESLint** - JavaScript/TypeScript linting
- **TypeScript Compiler** - Type checking
- **Prettier** - Code formatting
- **Biome** - Rust-based linter/formatter
- **Ruff** - Python linting
- **RuboCop** - Ruby linting
- **Clippy** - Rust linting

### Smart Fixing
- Runs appropriate `--fix` flags for each linter
- Handles TypeScript `any` types intelligently
- Preserves code functionality while fixing style
- Groups related fixes for better commits

## 📋 Usage Examples

### Basic Usage
```
/lint-fix
```
Runs all detected linters on the current workspace

### Scope Control
```
/lint-fix file:current
/lint-fix file:src/components/Button.tsx
/lint-fix dir:src/components
/lint-fix dir:convex/utils
/lint-fix project
```

### Specific Linters
```
/lint-fix eslint
/lint-fix typescript
/lint-fix prettier
/lint-fix eslint,typescript
```

### Options
```
/lint-fix --dry-run          # Show what would be fixed without changing files
/lint-fix --no-typescript    # Skip TypeScript checking
/lint-fix --strict           # Fix all issues, even potentially breaking ones
/lint-fix --staged           # Only fix staged files (git)
```

## 🎯 Workflow

### Phase 1: Detection
1. **Detect Project Type** - Check package.json, Gemfile, Cargo.toml, etc.
2. **Find Config Files** - .eslintrc, tsconfig.json, .prettierrc, etc.
3. **Identify Installed Tools** - Check for local and global installations
4. **Determine Scope** - Based on user input or defaults

### Phase 2: Analysis
1. **Run Linters** - Execute each detected linter
2. **Parse Output** - Categorize errors by type and severity
3. **Identify Fixable** - Separate auto-fixable from manual issues
4. **Create Fix Plan** - Order fixes to avoid conflicts

### Phase 3: Fixing (Iterative)
1. **Apply Auto-Fixes** - Run linters with fix flags
2. **Handle TypeScript** - Special handling for type issues
3. **Format Code** - Apply consistent formatting
4. **Verify Changes** - Ensure fixes didn't break anything
5. **Repeat Until Clean** - Keep running fixes until no more auto-fixable issues remain
   - Maximum 5 iterations to prevent infinite loops
   - Stop if no progress is made between runs
   - Continue fixing new issues that appear after initial fixes

### Phase 4: Reporting
1. **Show Summary** - What was fixed vs what needs manual attention
2. **Group by File** - Organize issues by file for clarity
3. **Provide Suggestions** - Help with manual fixes
4. **Save Report** - Optional detailed report file

## 🔧 Linter-Specific Behaviors

### ESLint
```bash
# Auto-fix command
npx eslint --fix [files]

# Fixable issues:
- Unused imports
- Missing semicolons
- Quote consistency
- Spacing issues
- Some simple type issues

# Manual fixes needed:
- Complex conditionals
- Function complexity
- Custom rule violations
```

### TypeScript
```bash
# Check command
npx tsc --noEmit

# Smart fixes:
- Replace 'any' with inferred types
- Add missing type annotations
- Fix import paths
- Add return types

# Manual fixes:
- Complex type errors
- Circular dependencies
- Declaration conflicts
```

### Prettier
```bash
# Format command
npx prettier --write [files]

# Always fixable:
- Indentation
- Line length
- Quote style
- Trailing commas
- Bracket spacing
```

## 🎨 Smart Type Fixing

### Replace 'any' Types
```typescript
// Before
const result: any = await fetchData();

// After (inferred)
const result: ApiResponse = await fetchData();
```

### Add Missing Returns
```typescript
// Before
handler: async (ctx) => { ... }

// After
handler: async (ctx): Promise<ResultType> => { ... }
```

### Fix Convex Types
```typescript
// Before
export const myAction = action({
  args: {},
  handler: async (ctx): Promise<any> => { ... }
});

// After
export const myAction = action({
  args: {},
  returns: v.object({ ... }),
  handler: async (ctx) => { ... }
});
```

## 📊 Output Format

### Success Case (Iterative)
```
🔍 Detecting linters...
  ✓ ESLint (config: .eslintrc.json)
  ✓ TypeScript (config: tsconfig.json)
  ✓ Prettier (config: .prettierrc)

📋 Analyzing issues...
  ESLint: 45 issues (38 fixable)
  TypeScript: 12 issues (8 fixable)
  Prettier: 23 issues (23 fixable)

✨ Applying fixes...
  ✅ ESLint: Fixed 38/45 issues
     - Removed 12 unused imports
     - Fixed 15 spacing issues
     - Corrected 11 quote inconsistencies

  ✅ TypeScript: Fixed 8/12 issues
     - Replaced 5 'any' types with proper types
     - Added 3 missing return type annotations

  ✅ Prettier: Fixed 23/23 issues
     - Formatted 15 files

🔄 Round 2: New issues detected after fixes...
  ESLint: 5 new issues (5 fixable)

✨ Continuing fixes...
  ✅ ESLint: Fixed 5/5 issues

🎯 Round 3: Checking for remaining issues...
  ✓ All auto-fixable issues resolved!

⚠️  Manual fixes required (7 issues):

convex/utils/api.ts:
  Line 45: ESLint - Function 'processData' has too many parameters (max: 4)
  Line 67: TypeScript - Type 'unknown' is not assignable to type 'string'

src/components/Button.tsx:
  Line 23: ESLint - Avoid nested ternary expressions
  Line 89: TypeScript - Property 'onClick' is missing in type

📝 Summary:
  Total issues: 80
  Auto-fixed: 69 (86%)
  Manual required: 11 (14%)
  Files modified: 23
  Time taken: 4.2s

💡 Run with --verbose for detailed fix explanations
```

### Dry Run Output
```
🔍 DRY RUN MODE - No changes will be made

Would fix:
  ✓ 38 ESLint issues
  ✓ 8 TypeScript issues
  ✓ 23 Prettier issues

Files that would be modified:
  - src/app/page.tsx (5 fixes)
  - src/components/Header.tsx (3 fixes)
  - convex/utils/helpers.ts (8 fixes)
  ... and 20 more files

Run without --dry-run to apply these fixes
```

## 🛡️ Safety Features

### Backup Creation
- Creates `.backup` files before fixing (optional)
- Can rollback if fixes cause issues
- Preserves original formatting in comments

### Incremental Fixing
- Fixes one linter at a time
- Verifies each step before proceeding
- Stops if critical errors occur

### Git Integration
- Can fix only staged files
- Warns about uncommitted changes
- Optional auto-commit after fixing

## 🎮 Advanced Options

### Custom Rules
```
/lint-fix --rules=strict
/lint-fix --rules=relaxed
/lint-fix --ignore-rule=no-console
```

### Performance
```
/lint-fix --parallel         # Run linters in parallel
/lint-fix --cache           # Use linter caches
/lint-fix --incremental     # Only check changed files
```

### Reporting
```
/lint-fix --report=detailed  # Generate detailed report
/lint-fix --format=json      # Output as JSON
/lint-fix --quiet           # Minimal output
```

## 💡 Best Practices

### Before Running
1. **Commit your changes** - Allows easy rollback if needed
2. **Run tests** - Ensure code works before fixing
3. **Check scope** - Start with single file, then expand

### After Running
1. **Review changes** - Use `git diff` to see what changed
2. **Run tests again** - Verify fixes didn't break anything
3. **Commit separately** - Keep linter fixes in their own commit

### Regular Usage
- Run before PR submissions
- Include in pre-commit hooks
- Schedule regular codebase cleanup
- Use after major refactoring

## 🔌 Integration Examples

### Pre-commit Hook
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "/lint-fix --staged"
    }
  }
}
```

### CI/CD Pipeline
```yaml
- name: Lint and Fix
  run: /lint-fix --strict --report=detailed
```

### VS Code Task
```json
{
  "label": "Fix All Linters",
  "type": "shell",
  "command": "/lint-fix",
  "problemMatcher": []
}
```

## 🎯 Common Scenarios

### After Refactoring
```
/lint-fix --scope=refactored
```

### Before Code Review
```
/lint-fix --staged --strict
```

### Type Safety Improvement
```
/lint-fix typescript --replace-any
```

### Quick Formatting
```
/lint-fix prettier
```

## 📈 Metrics Tracking

The command can track:
- Issues fixed over time
- Most common error types
- Files with most issues
- Time saved by auto-fixing

## 🚀 Future Enhancements

Planned features:
- AI-powered fix suggestions for complex issues
- Custom fix patterns/templates
- Cross-file refactoring
- Performance optimization suggestions
- Security issue detection and fixing

This command transforms the tedious task of fixing linter errors into a single, intelligent operation that maintains code quality while saving developer time!