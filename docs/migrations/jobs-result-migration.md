# Jobs Table Result Migration

## Summary
Schema now expects `jobs.result` to be a typed result object (`{ table: 'styles', id: ... }`). Older rows still store `resultStyleId`, so Convex rejects the dataset with `Object contains extra field resultStyleId` whenever the schema is loaded.

## Fix
Run `internal/jobs/migrateLegacyResult` for each legacy job to rewrite the document:

```
npx convex run internal/jobs/migrateLegacyResult '{"jobId":"<jobId>"}'
```

Known job IDs needing migration:

- `kx790v8vxw681fhgje9kgjprwn7rqb8z`
- `kx7btp578ze1aspcgkkbq8rt7n7rp35k`

The helper copies the doc, replaces `resultStyleId` with `result`, and removes the legacy field.

## Status
Legacy rows have been migrated and the temporary `resultStyleId` field has been removed from `convex/schema.ts`. Regenerate types with `npx convex codegen` whenever schema changes are pulled.
