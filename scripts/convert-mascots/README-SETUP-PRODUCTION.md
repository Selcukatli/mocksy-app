# Setup Screenshot Sizes in Production

This guide explains how to initialize the `screenshotSizes` table in your production Convex deployment.

## The Problem

The `screenshotSizes` table is empty in production, causing errors when generating apps:
```
ArgumentValidationError: Found ID "..." from table `styles`, which does not match the table name in validator `v.id("screenshotSizes")`
```

## The Solution

Run the `setupCanvases.ts` script to create all screenshot size records with canvas templates.

## Prerequisites

1. Ensure you have the production Convex URL
2. Install dependencies: `npm install`

## Running on Production

### Step 1: Set Production Environment Variable

```bash
# Get your production URL from Convex dashboard
export CONVEX_URL=https://your-production-deployment.convex.cloud
```

**OR** add to your `.env.local`:
```bash
CONVEX_URL=https://your-production-deployment.convex.cloud
```

### Step 2: Run the Setup Script

```bash
npx tsx scripts/convert-mascots/setupCanvases.ts
```

### Step 3: Verify

The script will:
- ✅ Check if each size already exists (safe to run multiple times)
- ✅ Generate 5 blank canvas templates (white backgrounds)
- ✅ Upload them to Convex storage
- ✅ Create `screenshotSizes` records linked to the canvases

Expected output:
```
📐 Creating screenshot sizes and generating canvases...

Processing: iPhone 16 Pro Max (iphone-6-9)
  ✓ Saved canvas: /path/to/.temp-canvases/iphone-6-9.png
  ⬆️  Uploading to Convex storage...
  ✓ Uploaded to storage: kg...
  📝 Creating size record with canvas...
  ✅ Created size: iPhone 16 Pro Max (kg...)

...

✨ Setup complete!

📊 Summary:
  ✅ Created: 5
  ⏭️  Skipped: 0
  📦 Total: 5
```

## What Gets Created

The script creates 5 screenshot sizes:

### iOS (3 sizes)
1. **iPhone 16 Pro Max** (6.9") - 1290×2796 - Primary
2. **iPhone 14 Plus / 13 Pro Max / 12 Pro Max** (6.5") - 1284×2778
3. **iPhone 8 Plus / 7 Plus / 6s Plus** (5.5") - 1242×2208 - Legacy support

### Android (2 sizes)
4. **Android Phone Portrait** - 1080×1920 - Primary
5. **Android Phone Landscape** - 1920×1080 - For games

## After Running

1. Check the Convex dashboard → Data → `screenshotSizes` table
2. Verify all 5 records exist with `canvasStorageId` populated
3. Test app generation - it should now work! ✨

## Troubleshooting

### "CONVEX_URL environment variable not set"
- Make sure you've exported the CONVEX_URL or added it to .env.local

### "Upload failed"
- Verify the Convex URL is correct
- Check you have network access to Convex

### "Already exists - skipping"
- This is normal! The script is idempotent (safe to run multiple times)
- If you see this for all 5 sizes, they're already set up

## Code Changes Made

The following files were updated to fix the hard-coded ID issue:

1. **convex/appGenerationActions.ts** - Now uses slug-based lookups instead of hard-coded IDs
2. **scripts/convert-mascots/setupCanvases.ts** - Made idempotent (safe to rerun)

Both changes are deployed and working in dev. After running this script in production, everything should work! 🎉

