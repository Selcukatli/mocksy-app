# Jobs Progress Pattern

## Why it exists
Long-running server work (style generation, image batches, exports) needs richer UX feedback than Convex actions provide by default. We keep execution synchronous inside an action, but we mirror progress to a `jobs` table so the client can subscribe and render realtime messages, progress bars, and finally the new entity link. This pattern works now and keeps the door open for swapping in Convex Workpool later without touching the UI.

## Core pieces
1. **`jobs` table** (`convex/schema.ts`)
   - Fields: `type`, `status`, `message`, `progress`, optional `result`, `error`, and `payload`.
   - Rows are short-lived status documents per background task.

2. **Action** (`convex/styleActions.ts:generateStyleFromDescription`)
   - Creates a job row immediately with `status: 'running'`.
   - Performs the full pipeline (BAML prompt building, FAL generations, DB writes) inline.
   - After each stage, calls `internal.jobs.updateJob` to mutate `message` + `progress`.
   - On success: sets `status: 'succeeded'`, `result: { table: 'styles', id }`, returns `{ jobId, styleId }`.
   - On failure: sets `status: 'failed'`, `error`, then rethrows.

3. **Client** (`src/app/styles/page.tsx`)
   - Uploads reference image (if any), then calls the action via `useAction`.
   - Stores the returned `jobId` locally and uses `useQuery(api.jobs.getActiveJobs)` to locate the matching row.
   - While a row exists, renders live status text, animated progress bar, etc.
   - When the row disappears or reports `succeeded`, it closes the dialog/reset state; the finished style appears through the normal `getPublicStyles` query.

## When to use it
- Server work taking > a couple of seconds where the UI benefits from progressive messaging.
- Action-only implementations (no Workpool) that still need user-facing status.
- Transitional step before introducing Workpool. The action can later enqueue a work item and keep updating the same job row.

## Extending to Workpool later
If we adopt Convex Workpool:
1. Replace the inline action call with a scheduling mutation that inserts the job row (status `queued`) and enqueues the worker (`styleGenerationPool.enqueueAction`).
2. Move the current action body into the worker (`internalAction`) and keep all job updates identical.
3. Client logic stays untouched—still watches the job row by ID.

## Implementation checklist
- [ ] Job row schema defined or updated with needed fields.
- [ ] Action creates row, updates status/progress, writes `result`/`error` on completion.
- [ ] Client stores `jobId`, subscribes to jobs query, and handles lifecycle (start, success, failure).
- [ ] Optional: schedule mutation + Workpool worker if/when background execution is desired.
