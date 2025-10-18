# Publish Tracking Feature

## Overview

Track which demo apps have been published from dev to production, when they were published, and provide quick access to view them in prod.

## Features

### Dev Admin Dashboard

**Publish Status Badges**

In the admin apps table Status column, published apps show:
- ✓ "Published to Prod" badge with emerald green indicator
- Relative timestamp (e.g., "2 hours ago")
- "View in Prod" link with external link icon

**Re-publish Capability**

- Button tooltip changes from "Publish to Production" to "Re-publish to Production"
- Allows updating existing prod apps with latest changes
- Tracks most recent publish timestamp

## Database Schema

### Apps Table (Dev Only)

```typescript
prodAppId: v.optional(v.string())
// - ID of the app in production deployment
// - String type (not Id<"apps">) since it's a different deployment
// - Used to construct "View in Prod" link

lastPublishedToProdAt: v.optional(v.number())
// - Timestamp of most recent publish to production
// - Used to display relative time ("2 hours ago")
// - Updated on every successful publish/re-publish
```

## Implementation

### Backend

**convex/schema.ts**
- Added `prodAppId` and `lastPublishedToProdAt` fields to apps table

**convex/apps.ts**
- `updateProdPublishStatus` - Internal mutation to update tracking fields after publish

**convex/adminActions.ts**
- `publishAppToProd` - Updated to call `updateProdPublishStatus` after successful publish
- Logs the prod app ID returned from the response

### Frontend

**src/app/admin/_components/AppsTable.tsx**
- Added `prodAppId` and `lastPublishedToProdAt` to App interface
- Imported `formatDistanceToNow` from `date-fns` for relative timestamps
- Imported `ExternalLink` icon from lucide-react
- Added publish status badge in Status column
- Updated button tooltip to show "Re-publish" for already-published apps

**Dependencies**
- Installed `date-fns` for time formatting

## UI/UX

### Status Column Layout

```
┌─────────────────────────────┐
│ ● Published      ▼          │ ← Status dropdown
├─────────────────────────────┤
│ ● Published to Prod         │ ← Emerald badge
│ 2 hours ago                 │ ← Relative time
│ View in Prod →              │ ← External link
└─────────────────────────────┘
```

### Visibility Rules

Publish status badge shows when:
1. `app.isDemo === true` (demo apps only)
2. `onPublishToProd` exists (dev deployment only)
3. `app.lastPublishedToProdAt` exists (has been published)

### Prod App Link

- Constructs URL using `prodAppId`: `https://energized-orca-703.convex.site/appstore/{prodAppId}`
- Opens in new tab (`target="_blank"`)
- Uses `rel="noopener noreferrer"` for security

## Data Sync Behavior

### Simple Tracking Approach

The system uses **simple local tracking** - it doesn't verify if the prod app still exists:

**Pros:**
- Fast - no HTTP calls on page load
- Simple - no complex sync logic
- Good enough - prod is source of truth

**Cons:**
- Can show stale data if app deleted from prod
- "View in Prod" link will 404 if app deleted

**This is acceptable because:**
1. The badge shows historical data ("was published 2 hours ago" is accurate)
2. Clicking the link makes it obvious if the app was deleted
3. Prod deployment is the source of truth - dev is just tracking

### Future Enhancements (Optional)

If stale data becomes an issue:

1. **Manual "Verify Status" button** - Makes HTTP call to check prod app exists
2. **Background verification job** - Runs periodically to check all published apps
3. **Real-time webhooks** - Prod notifies dev when apps are deleted (complex)

## Usage

### For Admins

1. **First Publish**:
   - Click CloudUpload icon on any demo app
   - Confirm in modal
   - After success, badge appears: "Published to Prod"

2. **Re-publish (Update)**:
   - Click CloudUpload icon again (tooltip shows "Re-publish")
   - Confirm in modal
   - Timestamp updates to show latest publish time

3. **View in Prod**:
   - Click "View in Prod" link in status badge
   - Opens prod appstore page in new tab

### For Developers

**Check if app was published:**
```typescript
if (app.lastPublishedToProdAt) {
  console.log("Published at:", new Date(app.lastPublishedToProdAt));
  console.log("Prod ID:", app.prodAppId);
}
```

**Get prod app URL:**
```typescript
const prodUrl = `https://energized-orca-703.convex.site/appstore/${app.prodAppId}`;
```

## Logging

Publish process logs include:

```
📝 [PUBLISH] Updating dev app with prod tracking info...
✓ [PUBLISH] Dev app updated with prod ID: k17abc123
```

## Testing

### Manual Test Steps

1. **Fresh Publish:**
   - Publish a demo app from dev
   - Verify badge appears with "just now" timestamp
   - Verify "View in Prod" link works

2. **Re-publish:**
   - Wait a few minutes
   - Re-publish the same app
   - Verify timestamp updates

3. **Prod Link:**
   - Click "View in Prod" link
   - Verify correct app opens in prod

4. **Prod Deployment:**
   - Check prod admin dashboard
   - Verify publish button does NOT appear (dev only)

## Troubleshooting

### Badge doesn't appear after publish

**Check:**
1. Publish succeeded (check toast message)
2. `result.appId` was returned from prod
3. `updateProdPublishStatus` mutation succeeded (check logs)
4. Refresh the page

### "View in Prod" link gives 404

**Possible causes:**
1. App was deleted from prod (expected - shows stale data)
2. Wrong prod URL in environment variable
3. `prodAppId` was not saved correctly

### Wrong timestamp showing

**Check:**
1. `lastPublishedToProdAt` field in database
2. Browser timezone settings
3. Date-fns version compatibility

## Environment Variables

None required for tracking - uses data already in database.

For "View in Prod" link, optionally set:
```bash
NEXT_PUBLIC_CONVEX_PROD_URL=https://energized-orca-703.convex.site
```

(Falls back to hardcoded URL if not set)

