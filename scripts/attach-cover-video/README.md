# Attach Cover Video Migration Script

This script allows you to attach a cover video to an app by its ID. The video will be uploaded to Convex storage and linked to the app's `coverVideoStorageId` field.

## Quick Start

### 1. Place Your Video

Put your video file in the `input/` folder:

```bash
cp ~/Downloads/my-video.mp4 scripts/attach-cover-video/input/
```

### 2. Run the Script

```bash
# For development (requires `npx convex dev` running in another terminal)
npx tsx scripts/attach-cover-video/attachCoverVideo.ts <appId> <videoFilename>

# For production deployment
CONVEX_URL=https://your-prod.convex.cloud npx tsx scripts/attach-cover-video/attachCoverVideo.ts <appId> <videoFilename>
```

## Usage Examples

### Basic Usage (Development)

```bash
# Attach video.mp4 to app with ID kg2abc123def
npx tsx scripts/attach-cover-video/attachCoverVideo.ts kg2abc123def video.mp4
```

### Production Deployment

```bash
# Set production Convex URL and run
export CONVEX_URL=https://your-production.convex.cloud
npx tsx scripts/attach-cover-video/attachCoverVideo.ts kg2abc123def promo-video.mov
```

### Different Video Formats

```bash
# MP4 video
npx tsx scripts/attach-cover-video/attachCoverVideo.ts kg2abc123def app-showcase.mp4

# WebM video
npx tsx scripts/attach-cover-video/attachCoverVideo.ts kg2abc123def app-showcase.webm

# MOV video (QuickTime)
npx tsx scripts/attach-cover-video/attachCoverVideo.ts kg2abc123def app-showcase.mov
```

## Supported Video Formats

- **MP4** (`.mp4`) - Most widely supported, recommended for web
- **WebM** (`.webm`) - Open format, good compression
- **MOV** (`.mov`) - QuickTime format, common for iOS/macOS

## How It Works

1. **Validates** the app ID exists in your Convex deployment
2. **Reads** the video file from the `input/` folder
3. **Uploads** the video to Convex storage
4. **Updates** the app record with the `coverVideoStorageId`
5. **Allows overwriting** if the app already has a cover video

## Environment Variables

The script requires one of these environment variables:

- `CONVEX_URL` - Full deployment URL (e.g., `https://your-prod.convex.cloud`)
- `NEXT_PUBLIC_CONVEX_URL` - Alternative environment variable name

Set them in your shell or `.env.local` file:

```bash
# In terminal
export CONVEX_URL=https://your-deployment.convex.cloud

# Or in .env.local
CONVEX_URL=https://your-deployment.convex.cloud
```

## Finding Your App ID

You can find app IDs in several ways:

### 1. Convex Dashboard
- Go to your Convex dashboard
- Navigate to Data → `apps` table
- Copy the `_id` field (e.g., `kg2abc123def`)

### 2. In Your App
- Log in and view your apps
- Check the browser console or network tab for app IDs

### 3. Via Convex CLI
```bash
npx convex data query apps --limit 10
```

## Output Example

```
=== Attach Cover Video ===
App ID:           kg2abc123def
Video file:       promo-video.mp4
Deployment URL:   https://your-prod.convex.cloud

🔌 Connecting to Convex...
🔍 Verifying app exists...
✓ Found app: My Awesome App
📖 Reading video file...
✓ Read 5.32 MB from promo-video.mp4
📤 Generating upload URL...
✓ Got upload URL
⬆️  Uploading video to Convex storage...
✓ Uploaded to storage: kg9xyz789ghi
💾 Updating app with cover video...
✓ Successfully attached cover video to app

=== Complete ===
App "My Awesome App" now has a cover video!
Storage ID: kg9xyz789ghi
```

## Overwriting Existing Videos

If an app already has a cover video, the script will warn you:

```
⚠️  App already has a cover video (kg9xyz789ghi)
This will overwrite the existing cover video.
```

The script will proceed and replace the old video with the new one. The old video file will remain in Convex storage but will no longer be referenced by the app.

## Troubleshooting

### "CONVEX_URL environment variable not set"

Make sure you've set either `CONVEX_URL` or `NEXT_PUBLIC_CONVEX_URL`:

```bash
export CONVEX_URL=https://your-deployment.convex.cloud
```

Or run `npx convex dev` in another terminal for local development.

### "Video file not found"

Ensure your video is in the correct location:

```bash
ls scripts/attach-cover-video/input/
# Should show your video file
```

### "Unsupported video format"

Only `.mp4`, `.webm`, and `.mov` formats are supported. Convert your video:

```bash
# Convert to MP4 using ffmpeg
ffmpeg -i input-video.avi -c:v libx264 -c:a aac output-video.mp4
```

### "App with ID ... not found"

Double-check the app ID is correct and exists in your deployment:

```bash
npx convex data query apps --limit 10
```

### "Upload failed"

- Check your internet connection
- Verify the Convex URL is correct
- Ensure you have permission to write to the deployment

## File Size Recommendations

- **Recommended**: 5-15 MB for optimal loading performance
- **Maximum**: Convex storage limits apply (check your plan)
- **Consider**: Compress large videos before uploading

### Compressing Videos

```bash
# Compress with ffmpeg (good quality, smaller size)
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -c:a aac -b:a 128k output.mp4

# More aggressive compression
ffmpeg -i input.mp4 -c:v libx264 -crf 32 -c:a aac -b:a 96k output.mp4
```

## Schema Changes

This script requires the `coverVideoStorageId` field in the `apps` table:

```typescript
// convex/schema.ts
apps: defineTable({
  // ... other fields ...
  coverVideoStorageId: v.optional(v.id("_storage")),
})
```

## Integration with Frontend

After attaching a cover video, you can retrieve it in your queries:

```typescript
// In a Convex query
const app = await ctx.db.get(appId);
if (app.coverVideoStorageId) {
  const videoUrl = await ctx.storage.getUrl(app.coverVideoStorageId);
  // Use videoUrl in your response
}
```

```tsx
// In your React component
<video controls>
  <source src={app.coverVideoUrl} type="video/mp4" />
</video>
```

## Notes

- The `input/` folder is gitignored to prevent committing large video files
- Each run is idempotent - you can safely rerun with the same app ID
- Video files remain in the `input/` folder after upload for your reference
- Old cover videos are not automatically deleted from storage when replaced

