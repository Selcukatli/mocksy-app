#!/bin/bash

# This hook runs when Claude finishes responding (Stop event)
# Check if any Convex files have been modified and run TypeScript validation

cd "$CLAUDE_PROJECT_DIR"

# Check if convex/ directory exists
if [ ! -d "convex" ]; then
  exit 0
fi

# Check git status for modified convex files (if git is available)
if command -v git &> /dev/null && git rev-parse --git-dir > /dev/null 2>&1; then
  CONVEX_CHANGES=$(git status --short convex/ 2>/dev/null | wc -l)

  if [ "$CONVEX_CHANGES" -eq 0 ]; then
    # No convex changes, skip check
    exit 0
  fi

  echo "🔍 Detected changes in convex/ directory"
else
  # If no git, just run the check (better safe than sorry)
  echo "🔍 Checking Convex files..."
fi

echo "Running TypeScript check..."
npx tsc --noEmit 2>&1

# Capture exit code
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo ""
  echo "⚠️  TypeScript errors found in Convex files"
  echo "💡 You can ask Claude to fix these errors."
  exit 1
else
  echo "✅ No Convex errors detected"
  exit 0
fi
