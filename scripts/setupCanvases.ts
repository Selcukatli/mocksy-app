/**
 * Setup script to generate canvas templates and upload them to Convex
 * Run with: npx tsx scripts/setupCanvases.ts
 */

import "dotenv/config";
import { createCanvas } from "canvas";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import fs from "fs";
import path from "path";

// Screenshot size definitions
const SCREENSHOT_SIZES = [
  // iOS - Priority sizes
  {
    name: "iPhone 16 Pro Max",
    slug: "iphone-6-9",
    platform: "ios" as const,
    deviceCategory: "phone",
    width: 1290,
    height: 2796,
    aspectRatio: "9:19.5",
    displaySize: "6.9 inch",
    isRequired: true,
    isPrimary: true,
    minScreenshots: 1,
    maxScreenshots: 10,
    notes: "Primary iPhone display size, scales to smaller devices",
  },
  {
    name: "iPhone 14 Plus / 13 Pro Max / 12 Pro Max",
    slug: "iphone-6-5",
    platform: "ios" as const,
    deviceCategory: "phone",
    width: 1284,
    height: 2778,
    aspectRatio: "9:19.5",
    displaySize: "6.5 inch",
    isRequired: true,
    isPrimary: false,
    minScreenshots: 1,
    maxScreenshots: 10,
    notes: "Falls back from 6.9 inch display",
  },
  {
    name: "iPhone 8 Plus / 7 Plus / 6s Plus",
    slug: "iphone-5-5",
    platform: "ios" as const,
    deviceCategory: "phone",
    width: 1242,
    height: 2208,
    aspectRatio: "9:16",
    displaySize: "5.5 inch",
    isRequired: true,
    isPrimary: false,
    minScreenshots: 1,
    maxScreenshots: 10,
    notes: "Legacy but still required for older device support",
  },

  // Android - Priority sizes
  {
    name: "Android Phone Portrait",
    slug: "android-phone-portrait",
    platform: "android" as const,
    deviceCategory: "phone",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    displaySize: "Standard",
    isRequired: true,
    isPrimary: true,
    minScreenshots: 2,
    maxScreenshots: 8,
    notes: "Standard for all Android phones, required for promotional features",
  },
  {
    name: "Android Phone Landscape",
    slug: "android-phone-landscape",
    platform: "android" as const,
    deviceCategory: "phone",
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    displaySize: "Standard",
    isRequired: false,
    isPrimary: true,
    minScreenshots: 2,
    maxScreenshots: 8,
    notes: "For games and landscape-oriented apps",
  },
];

async function generateCanvasImage(
  width: number,
  height: number,
  slug: string
): Promise<Buffer> {
  console.log(`Generating ${width}x${height} canvas for ${slug}...`);

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Fill with white background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  return canvas.toBuffer("image/png");
}

async function main() {
  const deploymentUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!deploymentUrl) {
    throw new Error(
      "CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable not set. Run: npx convex dev"
    );
  }

  console.log("Connecting to Convex...");
  const client = new ConvexHttpClient(deploymentUrl);

  // Create temp directory for canvases
  const canvasDir = path.join(process.cwd(), ".temp-canvases");
  if (!fs.existsSync(canvasDir)) {
    fs.mkdirSync(canvasDir, { recursive: true });
  }

  console.log("\n📐 Creating screenshot sizes and generating canvases...\n");

  for (const size of SCREENSHOT_SIZES) {
    try {
      // Generate canvas image
      const canvasBuffer = await generateCanvasImage(
        size.width,
        size.height,
        size.slug
      );

      // Save locally for reference
      const canvasPath = path.join(canvasDir, `${size.slug}.png`);
      fs.writeFileSync(canvasPath, canvasBuffer);
      console.log(`  ✓ Saved canvas: ${canvasPath}`);

      // Upload to Convex storage via HTTP
      console.log(`  ⬆️  Uploading to Convex storage...`);

      // Get upload URL
      const uploadUrl = await client.mutation(
        api.fileStorage.files.generateUploadUrl
      );

      // Upload the file
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "image/png" },
        body: canvasBuffer,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      const { storageId } = await uploadResponse.json();
      console.log(`  ✓ Uploaded to storage: ${storageId}`);

      // Create screenshot size record with canvas
      console.log(`  📝 Creating size record with canvas...`);
      const sizeId = await client.mutation(api.screenshotSizes.createSize, {
        name: size.name,
        slug: size.slug,
        platform: size.platform,
        deviceCategory: size.deviceCategory,
        width: size.width,
        height: size.height,
        aspectRatio: size.aspectRatio,
        displaySize: size.displaySize,
        isRequired: size.isRequired,
        isPrimary: size.isPrimary,
        minScreenshots: size.minScreenshots,
        maxScreenshots: size.maxScreenshots,
        notes: size.notes,
        canvasStorageId: storageId,
      });

      console.log(`  ✅ Created size: ${size.name} (${sizeId})\n`);
    } catch (error) {
      console.error(`  ❌ Error creating ${size.name}:`, error);
    }
  }

  console.log("\n✨ Setup complete!");
  console.log(`\nCanvas images saved to: ${canvasDir}`);
  console.log("All canvases have been uploaded to Convex storage!");

  process.exit(0);
}

main().catch((error) => {
  console.error("Setup failed:", error);
  process.exit(1);
});
