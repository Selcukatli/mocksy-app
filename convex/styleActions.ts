"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { b } from "../baml_client";
import BAML from "@boundaryml/baml";
const { Image } = BAML;
import type { Id } from "./_generated/dataModel";

/**
 * Generate a screenshot style from text description
 * Uses BAML to analyze description and generate style config + image prompts
 * Then generates device reference + preview card images via FAL
 */
export const generateStyleFromDescription = action({
  args: {
    description: v.string(),
    referenceImageStorageId: v.optional(v.id("_storage")),
    // Optional style overrides for advanced controls
    backgroundStyle: v.optional(v.string()),
    textStyle: v.optional(v.string()),
    deviceStyle: v.optional(v.string()),
    decorativeElements: v.optional(v.string()),
  },
  returns: v.object({
    jobId: v.id("jobs"),
    styleId: v.optional(v.id("styles")),
  }),
  handler: async (ctx, args): Promise<{ jobId: Id<"jobs">; styleId?: Id<"styles"> }> => {
    console.log("🎨 Starting style generation from description:", args.description);

    // Get current user profile (actions can't query directly, need mutation helper)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get or ensure profile exists via the profiles mutation
    const result = await ctx.runMutation(api.profiles.ensureCurrentUserProfile, {});
    const profileId = result.profileId;

    const generationPayload = args.referenceImageStorageId
      ? {
          description: args.description,
          referenceImageStorageId: args.referenceImageStorageId,
        }
      : {
          description: args.description,
        };

    const jobId = await ctx.runMutation(internal.jobs.createJob, {
      profileId,
      type: "style",
      status: "running",
      message: "Starting style generation",
      progress: 0.05,
      payload: generationPayload,
    });

    // Step 1: Call BAML to analyze description and generate style specification
    console.log("📝 Calling BAML GenerateStyleFromDescription...");
    let referenceImageUrl: string | null = null;
    if (args.referenceImageStorageId) {
      referenceImageUrl = await ctx.storage.getUrl(args.referenceImageStorageId);
      console.log("📎 Reference image detected:", {
        storageId: args.referenceImageStorageId,
        resolvedUrl: referenceImageUrl,
      });
    }

    try {
      await ctx.runMutation(internal.jobs.updateJob, {
        jobId,
        message: "Analyzing description with AI",
        progress: 0.15,
      });

      const styleOutput = await b.GenerateStyleFromDescription(
        args.description,
        null, // style_name - let AI generate it
        referenceImageUrl ? Image.fromUrl(referenceImageUrl) : null,
        // Pass optional style overrides
        args.backgroundStyle ?? null,
        args.textStyle ?? null,
        args.deviceStyle ?? null,
        args.decorativeElements ?? null
      );

      console.log("✅ BAML analysis complete:");
      console.log("  - Style config:", styleOutput.style_config);
      console.log("  - Device prompt length:", styleOutput.device_reference_prompt.length);
      console.log("  - Preview prompt length:", styleOutput.preview_image_prompt.length);

      // Steps 2-4: Run in parallel for faster execution
      // Track progress with weighted completion (device: 50%, preview: 30%, slug: 5%)
      const taskProgress = {
        device: { weight: 50, completed: false },
        preview: { weight: 30, completed: false },
        slug: { weight: 5, completed: false },
      };

      const baseProgress = 0.15; // Already at 15% from BAML
      const parallelProgressRange = 0.75; // Can gain 75% from parallel tasks (15% + 75% = 90%)

      const updateParallelProgress = async (message: string) => {
        const totalWeight = 85; // Sum of all task weights
        const completedWeight = Object.values(taskProgress)
          .filter(task => task.completed)
          .reduce((sum, task) => sum + task.weight, 0);
        const progress = baseProgress + (completedWeight / totalWeight) * parallelProgressRange;

        await ctx.runMutation(internal.jobs.updateJob, {
          jobId,
          message,
          progress,
        });
      };

      const [deviceReferenceImageStorageId, previewImageStorageId, slug] = await Promise.all([
        // Task 1: Generate device reference images (4 candidates + scoring)
        (async () => {
          let storageId: Id<"_storage"> | undefined;
          try {
            console.log("📱 Generating 4 device reference image candidates (Seed Dream 4)...");
            const deviceResult = await ctx.runAction(
              internal.utils.fal.falImageActions.seedDream4TextToImage,
              {
                prompt: styleOutput.device_reference_prompt,
                image_size: {
                  width: 1290,
                  height: 2796,
                },
                num_images: 4, // Generate 4 candidates
                enable_safety_checker: false,
              }
            );

            if (deviceResult.images && deviceResult.images.length > 0) {
              console.log(`  Generated ${deviceResult.images.length} device image candidates`);

              // Log all candidate URLs for reference
              deviceResult.images.forEach((img: { url: string }, idx: number) => {
                console.log(`  Candidate ${idx + 1} URL: ${img.url}`);
              });

              // Score all candidates in parallel
              console.log("🔍 Scoring device image candidates...");
              const scoringPromises = deviceResult.images.map(async (image: { url: string }, index: number) => {
                try {
                  const score = await b.ScoreDeviceReferenceImage(
                    Image.fromUrl(image.url),
                    styleOutput.style_config.device_style
                  );
                  console.log(`  Candidate ${index + 1}: Score ${score.overall_score}/100`);
                  console.log(`    Reasoning: ${score.reasoning}`);
                  if (score.issues.length > 0) {
                    console.log(`    Issues: ${score.issues.join(", ")}`);
                  }
                  return {
                    url: image.url,
                    index,
                    score: score.overall_score,
                    details: score,
                  };
                } catch (error) {
                  console.error(`  ❌ Failed to score candidate ${index + 1}:`, error);
                  return {
                    url: image.url,
                    index,
                    score: 0,
                    details: null,
                  };
                }
              });

              const scoredImages = await Promise.all(scoringPromises);

              // Find the best scoring image
              const bestImage = scoredImages.reduce((best, current) =>
                current.score > best.score ? current : best
              );

              console.log(`✅ Selected best candidate: #${bestImage.index + 1} with score ${bestImage.score}/100`);

              if (bestImage.score < 60) {
                console.warn(`⚠️  Warning: Best image score (${bestImage.score}) is below threshold (60)`);
              }

              // Upload the best image to Convex storage
              storageId = await uploadImageToStorage(
                ctx,
                bestImage.url,
                `device-ref-${Date.now()}.png`
              );
              console.log("✅ Best device image uploaded to storage:", storageId);
            }
          } catch (error) {
            console.error("❌ Device image generation failed:", error);
          }

          taskProgress.device.completed = true;
          await updateParallelProgress("Device images ready");
          return storageId;
        })(),

        // Task 2: Generate preview style card (Gemini Flash)
        (async () => {
          let storageId: Id<"_storage"> | undefined;
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
              storageId = await uploadImageToStorage(
                ctx,
                previewImageUrl,
                `preview-${Date.now()}.png`
              );
              console.log("✅ Preview card uploaded to storage:", storageId);
            }
          } catch (error) {
            console.error("❌ Preview image generation failed:", error);
          }

          taskProgress.preview.completed = true;
          await updateParallelProgress("Preview card ready");
          return storageId;
        })(),

        // Task 3: Generate slug from style name
        (async () => {
          const generatedSlug = generateSlug(styleOutput.style_name);
          taskProgress.slug.completed = true;
          await updateParallelProgress("Processing metadata");
          return generatedSlug;
        })(),
      ]);

      const name = styleOutput.style_name;

      console.log("💾 Saving style to database...");
      console.log("  Name:", name);
      console.log("  Slug:", slug);

      await ctx.runMutation(internal.jobs.updateJob, {
        jobId,
        message: "Saving style",
        progress: 0.9,
      });

      // Step 5: Save to database
      const styleId: Id<"styles"> = await ctx.runMutation(
        internal.styles.createStyleInternal,
        {
          name,
          slug,
          description: args.description,
          createdBy: profileId,
          isPublic: true,
          status: "published", // Auto-publish generated styles
          backgroundColor: styleOutput.style_config.background_color,
          details: styleOutput.style_config.details,
          textStyle: styleOutput.style_config.text_style,
          deviceStyle: styleOutput.style_config.device_style,
          deviceReferenceImageStorageId,
          previewImageStorageId,
          referenceImageStorageId: args.referenceImageStorageId,
          tags: extractTags(args.description),
          category: categorizeStyle(args.description),
          isFeatured: false,
        }
      );

      console.log("✅ Style created successfully! ID:", styleId);
      await ctx.runMutation(internal.jobs.updateJob, {
        jobId,
        status: "succeeded",
        message: "Style ready",
        progress: 1,
        result: {
          table: "styles",
          id: styleId,
        },
      });

      return { jobId, styleId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await ctx.runMutation(internal.jobs.updateJob, {
        jobId,
        status: "failed",
        message: "Generation failed",
        error: errorMessage,
      });

      throw error;
    }
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

/**
 * Regenerate preview image for an existing style with updated prompt
 * Uses Gemini Flash to create a new preview card image
 */
export const regenerateStylePreviewImage = action({
  args: {
    styleId: v.id("styles"),
    editPrompt: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    console.log("🔄 Regenerating preview image for style:", args.styleId);

    // Get the style
    const style = await ctx.runQuery(api.styles.getStyleById, { styleId: args.styleId });
    if (!style) {
      throw new Error("Style not found");
    }

    // Build the preview image prompt with edge-to-edge instructions
    const basePrompt = `Square style showcase card. Background fills entire canvas edge-to-edge with no padding or margins. ${style.backgroundColor}. ${style.details}. Style name prominently displayed using: ${style.textStyle}. Full bleed, no white space around edges.`;

    const finalPrompt = args.editPrompt
      ? `${basePrompt}\n\nADDITIONAL INSTRUCTIONS: ${args.editPrompt}`
      : basePrompt;

    console.log("📝 Generated prompt:", finalPrompt);

    try {
      console.log("🖼️  Generating new preview image (Gemini Flash)...");
      const previewResult = await ctx.runAction(
        internal.utils.fal.falImageActions.geminiFlashTextToImage,
        {
          prompt: finalPrompt,
          num_images: 1,
          output_format: "png",
        }
      );

      if (previewResult.images && previewResult.images.length > 0) {
        const previewImageUrl = previewResult.images[0].url;
        console.log("  Preview image generated:", previewImageUrl);

        // Upload to Convex storage
        const previewImageStorageId = await uploadImageToStorage(
          ctx,
          previewImageUrl,
          `preview-${args.styleId}-${Date.now()}.png`
        );
        console.log("✅ Preview image uploaded to storage:", previewImageStorageId);

        // Update the style with new preview image
        await ctx.runMutation(internal.styles.updateStylePreviewImage, {
          styleId: args.styleId,
          previewImageStorageId,
        });

        console.log("✅ Style preview image updated successfully!");
      }
    } catch (error) {
      console.error("❌ Preview image generation failed:", error);
      throw error;
    }

    return null;
  },
});
