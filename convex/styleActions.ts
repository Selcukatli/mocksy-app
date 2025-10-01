"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { b } from "../baml_client";
import * as BAML from "@boundaryml/baml";
const Image = BAML.Image;
import type { Id } from "./_generated/dataModel";

/**
 * Generate a screenshot style from text description
 * Uses BAML to analyze description and generate style config + image prompts
 * Then generates device reference + preview card images via FAL
 */
export const generateStyleFromDescription = internalAction({
  args: {
    description: v.string(),
    referenceImageUrl: v.optional(v.string()),
  },
  returns: v.id("styles"),
  handler: async (ctx, args): Promise<Id<"styles">> => {
    console.log("🎨 Starting style generation from description:", args.description);

    // Step 1: Call BAML to analyze description and generate style specification
    console.log("📝 Calling BAML GenerateStyleFromDescription...");
    const styleOutput = await b.GenerateStyleFromDescription(
      args.description,
      null, // style_name - let AI generate it
      args.referenceImageUrl ? Image.fromUrl(args.referenceImageUrl) : null
    );

    console.log("✅ BAML analysis complete:");
    console.log("  - Style config:", styleOutput.style_config);
    console.log("  - Device prompt length:", styleOutput.device_reference_prompt.length);
    console.log("  - Preview prompt length:", styleOutput.preview_image_prompt.length);

    // Step 2: Generate device reference image (Seed Dream 4)
    let deviceReferenceImageStorageId: Id<"_storage"> | undefined;
    try {
      console.log("📱 Generating device reference image (Seed Dream 4)...");
      const deviceResult = await ctx.runAction(
        internal.utils.fal.falImageActions.seedDream4TextToImage,
        {
          prompt: styleOutput.device_reference_prompt,
          image_size: {
            width: 1290,
            height: 2796,
          },
          num_images: 1,
          enable_safety_checker: false,
        }
      );

      if (deviceResult.images && deviceResult.images.length > 0) {
        const deviceImageUrl = deviceResult.images[0].url;
        console.log("  Device image generated:", deviceImageUrl);

        // Upload to Convex storage
        deviceReferenceImageStorageId = await uploadImageToStorage(
          ctx,
          deviceImageUrl,
          `device-ref-${Date.now()}.png`
        );
        console.log("✅ Device image uploaded to storage:", deviceReferenceImageStorageId);
      }
    } catch (error) {
      console.error("❌ Device image generation failed:", error);
      // Continue without device image
    }

    // Step 3: Generate preview style card (Gemini Flash)
    let previewImageStorageId: Id<"_storage"> | undefined;
    try {
      console.log("🖼️  Generating preview style card (Gemini Flash)...");
      const previewResult = await ctx.runAction(
        internal.utils.fal.falImageActions.geminiFlashTextToImage,
        {
          prompt: styleOutput.preview_image_prompt,
          num_images: 1,
          output_format: "png",
        }
      );

      if (previewResult.images && previewResult.images.length > 0) {
        const previewImageUrl = previewResult.images[0].url;
        console.log("  Preview card generated:", previewImageUrl);

        // Upload to Convex storage
        previewImageStorageId = await uploadImageToStorage(
          ctx,
          previewImageUrl,
          `preview-${Date.now()}.png`
        );
        console.log("✅ Preview card uploaded to storage:", previewImageStorageId);
      }
    } catch (error) {
      console.error("❌ Preview image generation failed:", error);
      // Continue without preview image
    }

    // Step 4: Use AI-generated name and create slug
    const name = styleOutput.style_name;
    const slug = generateSlug(name);

    console.log("💾 Saving style to database...");
    console.log("  Name:", name);
    console.log("  Slug:", slug);

    // Step 5: Save to database
    const styleId: Id<"styles"> = await ctx.runMutation(
      internal.styles.createStyleInternal,
      {
      name,
      slug,
      description: args.description,
      isPublic: true,
      isSystemStyle: false,
      status: "published", // Auto-publish generated styles
      backgroundColor: styleOutput.style_config.background_color,
      details: styleOutput.style_config.details,
      textStyle: styleOutput.style_config.text_style,
      deviceStyle: styleOutput.style_config.device_style,
      deviceReferenceImageStorageId,
      previewImageStorageId,
      tags: extractTags(args.description),
        category: categorizeStyle(args.description),
        isFeatured: false,
      }
    );

    console.log("✅ Style created successfully! ID:", styleId);

    return styleId;
  },
});

/**
 * Helper: Upload image from URL to Convex storage
 */
async function uploadImageToStorage(
  ctx: { storage: { store: (blob: Blob) => Promise<Id<"_storage">> } },
  imageUrl: string,
  fileName: string
): Promise<Id<"_storage">> {
  console.log(`  Downloading image: ${imageUrl}`);
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const blob = await response.blob();
  console.log(`  Uploading ${fileName} (${(blob.size / 1024).toFixed(2)} KB)...`);

  const storageId = await ctx.storage.store(blob);
  return storageId;
}

/**
 * Helper: Generate URL-friendly slug from name
 */
function generateSlug(description: string): string {
  return description
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
    .substring(0, 50); // Limit length
}

/**
 * Helper: Extract tags from description
 */
function extractTags(description: string): string[] {
  const tags: string[] = [];

  // Color keywords
  const colorWords = [
    "pink",
    "blue",
    "purple",
    "orange",
    "yellow",
    "green",
    "red",
    "black",
    "white",
    "cyan",
    "neon",
    "pastel",
  ];
  colorWords.forEach((color) => {
    if (description.toLowerCase().includes(color)) {
      tags.push(color);
    }
  });

  // Theme keywords
  const themeWords = [
    "cyberpunk",
    "halloween",
    "minimalist",
    "zen",
    "retro",
    "modern",
    "vintage",
    "futuristic",
  ];
  themeWords.forEach((theme) => {
    if (description.toLowerCase().includes(theme)) {
      tags.push(theme);
    }
  });

  return Array.from(new Set(tags)); // Remove duplicates
}

/**
 * Helper: Categorize style based on description
 */
function categorizeStyle(description: string): string | undefined {
  const desc = description.toLowerCase();

  if (desc.includes("cyberpunk") || desc.includes("futuristic") || desc.includes("tech")) {
    return "Tech & Futuristic";
  }
  if (desc.includes("halloween") || desc.includes("spooky") || desc.includes("scary")) {
    return "Seasonal";
  }
  if (desc.includes("minimalist") || desc.includes("zen") || desc.includes("clean")) {
    return "Minimalist";
  }
  if (desc.includes("retro") || desc.includes("vintage") || desc.includes("80s")) {
    return "Retro";
  }
  if (desc.includes("pop art") || desc.includes("playful") || desc.includes("fun")) {
    return "Pop Art";
  }

  return undefined; // No category match
}
