# App Migration from Dev to Local

## Overview

The app migration feature allows administrators to migrate demo apps from the Convex development deployment to their local deployment. This is useful for:

- Testing apps locally before deploying to production
- Moving approved demo apps from dev to production
- Creating local copies of apps for development and testing

## Setup

### 1. Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Convex Dev Deployment URL
CONVEX_DEV_URL=https://your-deployment-name.convex.cloud

# Optional: Dev Admin Key (if needed for authentication)
# CONVEX_DEV_ADMIN_KEY=your-dev-admin-key
```

**How to find your deployment URL:**
1. Go to your Convex dashboard
2. Select your development deployment
3. Copy the deployment URL from the settings page
4. It should look like: `https://abc-123.convex.cloud`

### 2. Permissions

Only users with admin privileges can access the migration feature. Regular users will not see the "Migrate from Dev" button in the admin dashboard.

## Usage

### Migrating an App

1. Navigate to the Admin Dashboard (`/admin`)
2. Click the "Migrate from Dev" button in the top-right corner
3. Browse or search for the app you want to migrate
4. Click on an app to select it
5. Review the selected app details
6. Click "Migrate App" to start the migration

### What Gets Migrated

The migration process copies:

- **App metadata**: Name, description, subtitle, category
- **Images**: App icon and cover image
- **App screens**: All uploaded app screen images with dimensions
- **Settings**: Platform settings, languages, store URLs, keywords, age rating, style guide
- **Status**: Apps are migrated as "draft" by default

### What Doesn't Get Migrated

The following are NOT migrated:

- Screenshot sets and screenshots
- Mock reviews
- User-generated content
- Publishing status (apps start as draft)

### Name Conflict Handling

If an app with the same name already exists in your local deployment:

- The migrated app will be named `{Original Name} (migrated)`
- If that name also exists, it will become `{Original Name} (migrated 2)`, and so on

### After Migration

After successful migration:

1. The app will appear in your apps list as a draft
2. You can review the migrated content
3. Edit the app details if needed
4. Publish the app when ready
5. Optionally feature the app on the appstore

## Technical Details

### API Endpoints Used

The migration uses Convex's HTTP API to:

- Fetch app list from dev: `POST /api/query` → `adminActions:getAllAppsForAdmin`
- Fetch app details: `POST /api/query` → `apps:getApp`
- Fetch app screens: `POST /api/query` → `appScreens:getAppScreens`

### Storage Migration

Images are downloaded from dev storage URLs and re-uploaded to the local deployment's storage:

1. Download image blob from dev URL
2. Store blob in local Convex storage
3. Link new storage ID to the migrated app/screen record

### Error Handling

The migration process handles various errors gracefully:

- **Network failures**: Displays error message, allows retry
- **Missing images**: Continues migration without the image
- **Individual screen failures**: Continues with other screens
- **Authentication errors**: Prompts to check admin permissions

## Troubleshooting

### "CONVEX_DEV_URL not configured"

Make sure you've added the `CONVEX_DEV_URL` to your `.env.local` file and restarted your development server.

### "Failed to fetch apps from dev"

Check that:
- The dev deployment URL is correct
- The dev deployment is running and accessible
- Your internet connection is stable

### "Unauthorized: Admin access required"

Only admins can migrate apps. Check your profile's `isAdmin` flag in the database.

### Images not migrating

This can happen if:
- The dev storage URLs have expired
- The images are no longer in storage
- There are network connectivity issues

The app will still be migrated without the images.

## Development Notes

### Backend Functions

- `convex/adminActions.ts`:
  - `getDevApps`: Action to fetch apps from dev
  - `migrateAppFromDev`: Action to migrate a single app

- `convex/apps.ts`:
  - `createAppForMigration`: Internal mutation to create app with all fields
  - `checkAppNameExists`: Internal query to check for name conflicts

- `convex/appScreens.ts`:
  - `createAppScreenForMigration`: Internal mutation to create app screens

### Frontend Components

- `src/app/admin/_components/MigrateAppModal.tsx`: Modal UI for selecting and migrating apps
- `src/app/admin/page.tsx`: Admin dashboard with migration button

## Future Enhancements

Potential improvements for the migration feature:

- [ ] Batch migration (migrate multiple apps at once)
- [ ] Migration preview (see what will be migrated before starting)
- [ ] Migration history (track what has been migrated)
- [ ] Selective migration (choose specific screens to migrate)
- [ ] Screenshot set migration (optional)
- [ ] Two-way sync (push changes back to dev)

