# Video Models Complete Guide

## Quick Summary

Based on our testing, here's what we know about actual costs and performance:

| Model | 5-second Video | Speed | API Returns Duration? |
|-------|---------------|-------|----------------------|
| **SeeDance** | **$0.18** ✅ | Fast (~10-30s) | No |
| **Kling** | $0.35 | Slow (~30-60s) | Yes |
| **Lucy-14b** | $0.40 | Fast (~10-30s) | No |

**Winner: SeeDance - Cheapest AND Fast!**

## Known Video Durations

Since APIs don't always return duration, we track known behaviors:

- **Lucy-14b**: Always generates ~5 second videos (regardless of what you request)
- **SeeDance**: Generates the duration you request (3-12 seconds)
- **Kling**: Generates exactly 5 or 10 seconds (as requested)

## How to Use

### From React/Next.js Client

```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function VideoGenerator() {
  // Best value - SeeDance ($0.18 for 5s)
  const generateSeeDance = useMutation(api.utils.fal.falVideoActions.seeDanceImageToVideo);

  const handleGenerateVideo = async (imageUrl: string) => {
    const result = await generateSeeDance({
      prompt: "Add natural motion to the scene",
      image_url: imageUrl,
      duration: 5,        // Request 5 seconds
      resolution: "720p"
    });

    if (result.success) {
      // Track the known duration since API doesn't return it
      const actualDuration = 5; // We requested 5 seconds
      const actualCost = 0.18;  // Fixed price for 5s 720p

      console.log("Video URL:", result.videoUrl);
      console.log("Duration:", actualDuration, "seconds");
      console.log("Cost:", actualCost);
    }
  };
}
```

### From Convex Actions/Mutations

```typescript
// In convex/screenshots.ts or similar
export const generateVideoWithTracking = mutation({
  args: { screenshotId: v.id("screenshots") },
  handler: async (ctx, args) => {
    const screenshot = await ctx.db.get(args.screenshotId);
    if (!screenshot?.imageUrl) throw new Error("No image");

    // Use SeeDance for best value
    const result = await ctx.runAction(
      api.utils.fal.falVideoActions.seeDanceImageToVideo,
      {
        prompt: "Add motion to the screenshot",
        image_url: screenshot.imageUrl,
        duration: 5,
        resolution: "720p"
      }
    );

    if (result.success) {
      // Store with known metadata
      await ctx.db.patch(args.screenshotId, {
        videoUrl: result.videoUrl,
        videoDuration: 5,       // We know it's 5 seconds
        videoCost: 0.18,       // Fixed cost for SeeDance 5s
        videoModel: "seedance"
      });
    }

    return result;
  }
});
```

## Testing Commands

### Quick Tests
```bash
# Test SeeDance (Best Value)
npx convex run utils/fal/test/testFastVideoActions:testSeeDance

# Test Lucy-14b (with URL output)
npx convex run utils/fal/test/testFastVideoActions:testLucy '{"syncMode": false}'

# Test SeeDance Text-to-Video
npx convex run utils/fal/test/testFastVideoActions:testSeeDanceText
```

### Comparison Tests
```bash
# Compare actual costs
npx convex run utils/fal/test/testVideoMetadata:compareActualCosts

# Compare all models
npx convex run utils/fal/test/testVideoComparison:compareAll

# Test with tracking (when deployed)
npx convex run utils/fal/test/testWithTracking:trackAndCompare
```

### Advanced Analysis (requires ffprobe)
```bash
# Analyze actual video properties
npx convex run utils/fal/test/testVideoAnalysis:analyzeVideo '{"model": "lucy", "useFFprobe": true}'

# Full comparison with metadata
npx convex run utils/fal/test/testVideoAnalysis:fullAnalysis '{"useFFprobe": true}'
```

## Cost Tracking Implementation

Since APIs don't return duration, implement your own tracking:

```typescript
// Video generation tracking
const VIDEO_COSTS = {
  lucy: {
    typical_duration: 5,
    cost_per_second: 0.08,
    total_cost: 0.40
  },
  seedance: {
    requested_duration: 5,
    fixed_cost: 0.18
  },
  kling: {
    costs: { 5: 0.35, 10: 0.70 }
  }
};

// Track in your database
interface VideoGeneration {
  id: string;
  model: "lucy" | "seedance" | "kling";
  videoUrl: string;
  requestedDuration: number;
  assumedDuration: number;  // What we know it generates
  calculatedCost: number;    // Based on our knowledge
  generatedAt: number;
}
```

## Model Selection Guide

### Use SeeDance When:
- You want the cheapest option ($0.18)
- You need fast generation
- You want both text-to-video and image-to-video
- 720p quality is sufficient

### Use Kling When:
- You need premium cinematic quality
- You can wait 30-60 seconds
- You need actual duration metadata from API
- Quality matters more than cost

### Use Lucy-14b When:
- You need base64 output (with sync_mode: true)
- You want URL/base64 flexibility
- Speed is critical (marginally faster than SeeDance)

## Important Notes

1. **Duration Tracking**: Since Lucy and SeeDance don't return duration in API response, we track it ourselves based on known behaviors

2. **Actual Costs** (for 5-second videos):
   - SeeDance: $0.18 (BEST VALUE)
   - Kling: $0.35
   - Lucy-14b: $0.40 (5s × $0.08/s)

3. **Generation Speed**: Both Lucy and SeeDance are fast (~10-30s), Kling is slower (~30-60s)

4. **Output Formats**:
   - Lucy: Configurable (base64 or URL via sync_mode)
   - SeeDance: Always URL
   - Kling: Always URL

## Example: Complete Implementation with Tracking

```typescript
// Comprehensive video generation with cost tracking
async function generateAndTrackVideo(
  ctx: any,
  imageUrl: string,
  preferredModel: "seedance" | "lucy" | "kling" = "seedance"
) {
  const startTime = Date.now();
  let result: any;
  let knownDuration: number;
  let calculatedCost: number;

  switch (preferredModel) {
    case "seedance":
      // BEST VALUE: $0.18 for 5s
      result = await ctx.runAction(api.utils.fal.falVideoActions.seeDanceImageToVideo, {
        prompt: "Add natural motion",
        image_url: imageUrl,
        duration: 5,
        resolution: "720p"
      });
      knownDuration = 5;
      calculatedCost = 0.18;
      break;

    case "lucy":
      // Fast but more expensive: $0.40 for 5s
      result = await ctx.runAction(api.utils.fal.falVideoActions.lucyImageToVideo, {
        prompt: "Add motion",
        image_url: imageUrl,
        sync_mode: false // Get URL
      });
      knownDuration = 5; // Lucy always generates ~5s
      calculatedCost = 0.40;
      break;

    case "kling":
      // Premium quality: $0.35 for 5s
      result = await ctx.runAction(api.utils.fal.falVideoActions.klingImageToVideo, {
        prompt: "Cinematic motion",
        image_url: imageUrl,
        duration: 5
      });
      knownDuration = 5;
      calculatedCost = 0.35;
      break;
  }

  const generationTime = Date.now() - startTime;

  // Store tracked data
  const videoData = {
    model: preferredModel,
    videoUrl: result.videoUrl,
    success: result.success,
    knownDuration,
    calculatedCost,
    generationTimeMs: generationTime,
    apiReturnedDuration: result.duration || null,
    timestamp: Date.now()
  };

  console.log(`Generated ${knownDuration}s video in ${generationTime/1000}s for $${calculatedCost}`);

  return videoData;
}
```