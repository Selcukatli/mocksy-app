# Database Migrations

This directory contains one-time migration scripts for updating data structures in the Convex database.

## Available Migrations

### Remove isSystemStyle Field (`removeIsSystemStyleField.ts`)

Removes the deprecated `isSystemStyle` field from all styles in the database.

**Usage:**
```typescript
await ctx.runMutation(internal.migrations.removeIsSystemStyleField.removeIsSystemStyleField, {});
```

---

## App Description Reformatting

To reformat app descriptions to use modern App Store formatting (with section headers and bullet points), use the **admin action** instead of a migration script:

### From Admin UI or App Detail Page:

```typescript
// Single app reformatting (recommended approach)
const result = await ctx.runAction(api.appGenerationActions.reformatAppDescription, {
  appId: "your_app_id"
});

if (result.success) {
  console.log("✅ Description reformatted!");
  console.log(result.formattedDescription);
} else {
  console.error("Error:", result.error);
}
```

### Why Use the Action Instead of Migration?

1. **Simpler**: No complex migration scripts - just call an action
2. **Safer**: Test on individual apps before processing more
3. **Admin-Friendly**: Easy to call from any admin UI page
4. **Better Error Handling**: See results immediately per app
5. **No Node.js Complexity**: Regular action, not a Node.js migration

### Features:

- Checks if app description exists
- Skips if already formatted (contains "KEY FEATURES:")
- Calls BAML to reformat with proper structure
- Automatically updates the app in database
- Returns success status and formatted description

### Formatted Output Structure:

```
[Opening Hook - 2-3 sentences]

KEY FEATURES:
* Feature 1: Description
* Feature 2: Description
* Feature 3: Description
* Feature 4: Description
* Feature 5: Description

BENEFITS:
[Paragraph about benefits]

PERFECT FOR:
[Paragraph about target users]

[Closing CTA]
```

---

## Running Migrations

### Via Convex Dashboard:
1. Go to your Convex dashboard
2. Navigate to Functions
3. Find the migration function under `migrations/`
4. Click "Run" and provide the required arguments
5. Review the console logs for results

### Via Convex CLI:
```bash
# Example: Run removeIsSystemStyleField migration
npx convex run migrations/removeIsSystemStyleField:removeIsSystemStyleField '{}'
```

## Best Practices

1. **Test first**: For app description reformatting, test on 1-2 apps from the UI before doing bulk updates
2. **Check the logs**: Review console output to verify changes are correct
3. **Backup critical data**: Consider exporting data before major migrations
4. **Run during low-traffic periods**: Migrations may take time for large datasets

## Troubleshooting

**"Description is already formatted":**
- The app already has the new formatting (contains "KEY FEATURES:")
- No action needed

**"App has no description to reformat":**
- The app doesn't have a description field populated
- Add a description first, then reformat

**BAML function errors:**
- Ensure environment variables are set (API keys)
- Check network connectivity
- Review BAML logs for detailed error messages
