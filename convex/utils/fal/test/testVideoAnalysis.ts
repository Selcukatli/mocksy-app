"use node";

import { action } from "../../../_generated/server";
import { v } from "convex/values";
import { api } from "../../../_generated/api";
import { exec } from "child_process";
import { promisify } from "util";
import fetch from "node-fetch";
import * as fs from "fs/promises";
import * as path from "path";

const execAsync = promisify(exec);

/**
 * Video Analysis Test Suite
 *
 * This suite downloads videos and analyzes their actual properties
 * to get accurate duration, resolution, and cost calculations.
 *
 * Usage:
 * npx convex run utils/fal/test/testVideoAnalysis:analyzeVideo
 * npx convex run utils/fal/test/testVideoAnalysis:fullAnalysis
 */

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fileSize: number;
  format: string;
  fps?: number;
}

/**
 * Get video metadata using ffprobe
 */
async function getVideoMetadata(filePath: string): Promise<VideoMetadata | null> {
  try {
    const command = `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`;
    const { stdout } = await execAsync(command);
    const data = JSON.parse(stdout);

    const videoStream = data.streams.find((s: any) => s.codec_type === "video");
    const format = data.format;

    if (!videoStream || !format) {
      return null;
    }

    // Parse frame rate (e.g., "30/1" -> 30)
    let fps: number | undefined;
    if (videoStream.r_frame_rate) {
      const [num, den] = videoStream.r_frame_rate.split('/').map(Number);
      fps = den ? num / den : num;
    }

    return {
      duration: parseFloat(format.duration),
      width: videoStream.width,
      height: videoStream.height,
      fileSize: parseInt(format.size),
      format: format.format_name,
      fps,
    };
  } catch (error) {
    console.error("Error getting video metadata:", error);
    return null;
  }
}

/**
 * Download video and analyze it
 */
async function downloadAndAnalyze(videoUrl: string, modelName: string): Promise<VideoMetadata | null> {
  try {
    // Create temp directory if it doesn't exist
    const tempDir = "/tmp/video-analysis";
    await fs.mkdir(tempDir, { recursive: true });

    // Download video
    const fileName = `${modelName}-${Date.now()}.mp4`;
    const filePath = path.join(tempDir, fileName);

    console.log(`📥 Downloading ${modelName} video...`);
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`);
    }

    const buffer = await response.buffer();
    await fs.writeFile(filePath, buffer);
    console.log(`✅ Downloaded to ${filePath}`);

    // Analyze video
    console.log(`🔍 Analyzing video metadata...`);
    const metadata = await getVideoMetadata(filePath);

    // Clean up
    await fs.unlink(filePath);

    return metadata;
  } catch (error) {
    console.error(`Error analyzing ${modelName} video:`, error);
    return null;
  }
}

/**
 * Simple analysis without ffprobe (just file size from headers)
 */
async function getBasicVideoInfo(videoUrl: string): Promise<{ fileSize?: number; contentType?: string }> {
  try {
    const response = await fetch(videoUrl, { method: 'HEAD' });
    return {
      fileSize: parseInt(response.headers.get('content-length') || '0'),
      contentType: response.headers.get('content-type') || undefined,
    };
  } catch (error) {
    console.error("Error fetching video info:", error);
    return {};
  }
}

/**
 * Analyze a single video model with actual measurements
 */
export const analyzeVideo = action({
  args: {
    model: v.union(v.literal("lucy"), v.literal("seedance"), v.literal("kling")),
    imageUrl: v.optional(v.string()),
    useFFprobe: v.optional(v.boolean()), // Requires ffprobe installed
  },
  handler: async (ctx, args): Promise<any> => {
    const imageUrl = args.imageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600";
    const prompt = "Add gentle motion to the scene";

    console.log(`🎬 Analyzing ${args.model.toUpperCase()} Video Generation`);
    console.log("=" .repeat(60));

    let result: any;
    let expectedCostPerSecond: number;

    // Generate video based on model
    switch (args.model) {
      case "lucy":
        result = await ctx.runAction(api.utils.fal.falVideoActions.lucyImageToVideo, {
          prompt,
          image_url: imageUrl,
          sync_mode: false, // Get URL
        });
        expectedCostPerSecond = 0.08;
        break;

      case "seedance":
        result = await ctx.runAction(api.utils.fal.falVideoActions.seeDanceImageToVideo, {
          prompt,
          image_url: imageUrl,
          duration: 5,
          resolution: "720p",
        });
        expectedCostPerSecond = 0.036; // $0.18 / 5 seconds
        break;

      case "kling":
        result = await ctx.runAction(api.utils.fal.falVideoActions.klingImageToVideo, {
          prompt,
          image_url: imageUrl,
          duration: 5,
        });
        expectedCostPerSecond = 0.07; // $0.35 / 5 seconds
        break;
    }

    if (!result.success || !result.videoUrl) {
      console.log("❌ Video generation failed:", result.error);
      return result;
    }

    console.log(`✅ Video generated: ${result.videoUrl}`);

    // Get basic info (always available)
    const basicInfo = await getBasicVideoInfo(result.videoUrl);
    console.log(`\n📊 Basic Info:`);
    console.log(`- File Size: ${basicInfo.fileSize ? `${(basicInfo.fileSize / 1024 / 1024).toFixed(2)} MB` : 'unknown'}`);
    console.log(`- Content Type: ${basicInfo.contentType || 'unknown'}`);

    // Get detailed metadata if ffprobe is available
    let metadata: VideoMetadata | null = null;
    if (args.useFFprobe) {
      metadata = await downloadAndAnalyze(result.videoUrl, args.model);

      if (metadata) {
        console.log(`\n🎥 Actual Video Properties:`);
        console.log(`- Duration: ${metadata.duration.toFixed(2)} seconds`);
        console.log(`- Resolution: ${metadata.width}x${metadata.height}`);
        console.log(`- FPS: ${metadata.fps || 'unknown'}`);
        console.log(`- Format: ${metadata.format}`);

        const actualCost = metadata.duration * expectedCostPerSecond;
        console.log(`\n💰 Cost Analysis:`);
        console.log(`- Actual Duration: ${metadata.duration.toFixed(2)}s`);
        console.log(`- Cost per Second: $${expectedCostPerSecond}`);
        console.log(`- Actual Cost: $${actualCost.toFixed(3)}`);
      }
    }

    // Store the measured data
    const measuredData = {
      model: args.model,
      videoUrl: result.videoUrl,
      apiReturnedDuration: result.duration,
      apiReturnedResolution: result.width && result.height ? `${result.width}x${result.height}` : null,
      measuredDuration: metadata?.duration,
      measuredResolution: metadata ? `${metadata.width}x${metadata.height}` : null,
      measuredFPS: metadata?.fps,
      fileSize: metadata?.fileSize || basicInfo.fileSize,
      actualCost: metadata ? metadata.duration * expectedCostPerSecond : null,
      timestamp: Date.now(),
    };

    console.log(`\n📝 Summary:`);
    console.log(JSON.stringify(measuredData, null, 2));

    return measuredData;
  },
});

/**
 * Analyze all models and create comparison
 */
export const fullAnalysis = action({
  args: {
    useFFprobe: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<any> => {
    console.log("🔬 FULL VIDEO ANALYSIS");
    console.log("=" .repeat(60));
    console.log("Testing all models to measure actual video properties\n");

    const results = [];

    // Test Lucy
    console.log("\n1. Testing Lucy-14b...");
    const lucyData = await ctx.runAction(api.utils.fal.test.testVideoAnalysis.analyzeVideo, {
      model: "lucy",
      useFFprobe: args.useFFprobe,
    });
    results.push(lucyData);

    // Test SeeDance
    console.log("\n2. Testing SeeDance...");
    const seedanceData = await ctx.runAction(api.utils.fal.test.testVideoAnalysis.analyzeVideo, {
      model: "seedance",
      useFFprobe: args.useFFprobe,
    });
    results.push(seedanceData);

    // Summary
    console.log("\n" + "=" .repeat(60));
    console.log("📊 FINAL COMPARISON");
    console.log("=" .repeat(60));

    console.log("\nActual Measurements:");
    for (const data of results) {
      console.log(`\n${data.model.toUpperCase()}:`);
      console.log(`- API Duration: ${data.apiReturnedDuration || 'not returned'}`);
      console.log(`- Measured Duration: ${data.measuredDuration ? `${data.measuredDuration.toFixed(2)}s` : 'not measured'}`);
      console.log(`- File Size: ${data.fileSize ? `${(data.fileSize / 1024 / 1024).toFixed(2)} MB` : 'unknown'}`);
      console.log(`- Actual Cost: ${data.actualCost ? `$${data.actualCost.toFixed(3)}` : 'unknown'}`);
    }

    return results;
  },
});

/**
 * Store measured durations in a simple cache
 */
const videoMetadataCache: Record<string, VideoMetadata> = {};

export const getMeasuredDuration = action({
  args: {
    videoUrl: v.string(),
  },
  handler: async (_ctx, args): Promise<any> => {
    // Check cache first
    if (videoMetadataCache[args.videoUrl]) {
      return videoMetadataCache[args.videoUrl];
    }

    // Get basic info
    const basicInfo = await getBasicVideoInfo(args.videoUrl);

    // For now, return estimates based on model patterns
    // Lucy typically generates 5-second videos
    // SeeDance generates what you request
    const estimates = {
      lucyTypicalDuration: 5,
      seedanceRequestedDuration: 5,
      klingRequestedDuration: 5,
    };

    return {
      ...basicInfo,
      estimates,
      note: "Install ffprobe for actual duration measurement",
    };
  },
});