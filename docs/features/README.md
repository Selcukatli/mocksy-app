# Features Documentation

This directory contains feature proposals, specifications, and implementation plans organized by status.

## Directory Structure

```
features/
├── upnext/           # Proposed features to be built
├── in-progress/      # Features currently being implemented
├── completed/        # Shipped features (for reference)
└── styleGeneration/  # Legacy feature docs (to be reorganized)
```

## Feature Status Categories

### `upnext/`
Features that are:
- Fully specified and ready to implement
- Waiting for prioritization
- Documented with implementation details

### `in-progress/`
Features that are:
- Currently being developed
- Have active work/PRs
- Not yet shipped to production

### `completed/`
Features that are:
- Fully implemented and shipped
- Kept for historical reference
- Useful for understanding architecture decisions

## Workflow

When starting work on a feature:

```bash
# Move feature from upnext to in-progress
mv docs/features/upnext/[feature-name].md docs/features/in-progress/

# Update the feature doc status
# Change: Status: Proposed
# To:     Status: In Progress
```

When completing a feature:

```bash
# Move feature from in-progress to completed
mv docs/features/in-progress/[feature-name].md docs/features/completed/

# Update the feature doc status and add completion date
# Change: Status: In Progress
# To:     Status: Completed
#         Completed: 2025-10-02
```

## Feature Document Template

Each feature document should include:

1. **Status** - Proposed, In Progress, Completed
2. **Priority** - High, Medium, Low
3. **Created Date**
4. **Problem Statement** - What problem does this solve?
5. **Proposed Solution** - High-level approach
6. **Implementation Details** - Code snippets, architecture
7. **Benefits** - Why build this?
8. **Cost Analysis** - Performance/cost trade-offs
9. **Testing Plan** - How to validate
10. **References** - Related code/docs

## Current Features

### Up Next
- [Device Frame Auto-Selection](./upnext/device-frame-auto-selection.md) - Generate 4 device frame variants and auto-select best frontal angle using BAML

### Style Generation (Legacy)
- Various style generation documentation (to be reorganized)
