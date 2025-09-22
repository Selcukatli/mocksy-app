# Convex Webhooks Require Explicit Null Return

## Review Context
- Reviewer flagged new Convex webhook mutations declaring `returns: v.null()` but falling through without `return null;`.
- Runtime validation throws (`ConvexError: Expected null, got undefined`), blocking Clerk user creation/updates.

## Requested Action
- Append `return null;` at the end of each relevant webhook handler in `convex/webhooks.ts`.

## Notes
- Convex enforces exact return values for typed mutations; implicit `undefined` is rejected.
- Fix should unblock user lifecycle webhooks and keep the declared return contract.
