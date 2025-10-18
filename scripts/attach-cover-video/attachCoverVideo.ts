/**
 * Migration script to attach a cover video to an app by ID
 * 
 * Usage: npx tsx scripts/attach-cover-video/attachCoverVideo.ts <appId> <videoFilename>
 * 
 * Examples:
 *   npx tsx scripts/attach-cover-video/attachCoverVideo.ts kg2abc123def <video.mp4>
 *   CONVEX_URL=https://prod.convex.cloud npx tsx scripts/attach-cover-video/attachCoverVideo.ts kg2abc123def <video.mov>
 * 
 * Requirements:
 *   - Place your video file in scripts/attach-cover-video/input/ folder
 *   - Set CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable
 *   - Video formats supported: mp4, webm, mov
 */

import "dotenv/config";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import fs from "fs";
import path from "path";

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

// Helper to detect content type from file extension
function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const contentTypes: Record<string, string> = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
  };
  return contentTypes[ext] || "video/mp4";
}

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error(`${colors.red}Error: Missing required arguments${colors.reset}`);
    console.log("");
    console.log("Usage: npx tsx scripts/attach-cover-video/attachCoverVideo.ts <appId> <videoFilename>");
    console.log("");
    console.log("Examples:");
    console.log("  npx tsx scripts/attach-cover-video/attachCoverVideo.ts kg2abc123def video.mp4");
    console.log("  CONVEX_URL=https://prod.convex.cloud npx tsx scripts/attach-cover-video/attachCoverVideo.ts kg2abc123def video.mov");
    console.log("");
    process.exit(1);
  }

  const [appId, videoFilename] = args;

  // Get Convex URL from environment
  const deploymentUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!deploymentUrl) {
    throw new Error(
      "CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable not set.\n" +
      "For dev: npx convex dev (in another terminal)\n" +
      "For prod: export CONVEX_URL=https://your-prod.convex.cloud"
    );
  }

  // Get the directory where the script is located
  const scriptDir = path.dirname(new URL(import.meta.url).pathname);
  const inputDir = path.join(scriptDir, "input");
  const videoPath = path.join(inputDir, videoFilename);

  // Validate video file exists
  if (!fs.existsSync(videoPath)) {
    console.error(`${colors.red}Error: Video file not found: ${videoPath}${colors.reset}`);
    console.log(`${colors.yellow}Make sure to place your video in: ${inputDir}${colors.reset}`);
    process.exit(1);
  }

  // Validate file extension
  const ext = path.extname(videoFilename).toLowerCase();
  const supportedFormats = [".mp4", ".webm", ".mov"];
  if (!supportedFormats.includes(ext)) {
    console.error(`${colors.red}Error: Unsupported video format: ${ext}${colors.reset}`);
    console.log(`${colors.yellow}Supported formats: ${supportedFormats.join(", ")}${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.green}=== Attach Cover Video ===${colors.reset}`);
  console.log(`App ID:           ${colors.cyan}${appId}${colors.reset}`);
  console.log(`Video file:       ${colors.cyan}${videoFilename}${colors.reset}`);
  console.log(`Deployment URL:   ${colors.cyan}${deploymentUrl}${colors.reset}`);
  console.log("");

  // Connect to Convex
  console.log("🔌 Connecting to Convex...");
  const client = new ConvexHttpClient(deploymentUrl);

  try {
    // Check if app exists
    console.log("🔍 Verifying app exists...");
    const appPreview = await client.query(api.apps.getPublicAppPreview, {
      appId: appId as Id<"apps">,
    });

    if (!appPreview) {
      throw new Error(`App with ID ${appId} not found`);
    }

    const app = appPreview.app;
    console.log(`${colors.green}✓${colors.reset} Found app: ${colors.cyan}${app.name}${colors.reset}`);

    // Check if app already has a cover video
    if (app.coverVideoStorageId) {
      console.log(`${colors.yellow}⚠️  App already has a cover video (${app.coverVideoStorageId})${colors.reset}`);
      console.log("This will overwrite the existing cover video.");
    }

    // Read video file
    console.log("📖 Reading video file...");
    const videoBuffer = fs.readFileSync(videoPath);
    const fileSizeMB = (videoBuffer.length / (1024 * 1024)).toFixed(2);
    console.log(`${colors.green}✓${colors.reset} Read ${fileSizeMB} MB from ${videoFilename}`);

    // Get upload URL from Convex
    console.log("📤 Generating upload URL...");
    const uploadUrl = await client.mutation(
      api.fileStorage.files.generateUploadUrl
    );
    console.log(`${colors.green}✓${colors.reset} Got upload URL`);

    // Upload video to Convex storage
    console.log("⬆️  Uploading video to Convex storage...");
    const contentType = getContentType(videoFilename);
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": contentType },
      body: new Blob([new Uint8Array(videoBuffer)], { type: contentType }),
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    const { storageId } = await uploadResponse.json();
    console.log(`${colors.green}✓${colors.reset} Uploaded to storage: ${colors.cyan}${storageId}${colors.reset}`);

    // Update app with cover video
    console.log("💾 Updating app with cover video...");
    await client.mutation(api.apps.updateCoverVideo, {
      appId: appId as Id<"apps">,
      coverVideoStorageId: storageId,
    });

    console.log(`${colors.green}✓${colors.reset} Successfully attached cover video to app`);
    console.log("");
    console.log(`${colors.green}=== Complete ===${colors.reset}`);
    console.log(`App "${app.name}" now has a cover video!`);
    console.log(`Storage ID: ${colors.cyan}${storageId}${colors.reset}`);

    process.exit(0);
  } catch (error) {
    console.error(`${colors.red}❌ Error:${colors.reset}`, error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});

