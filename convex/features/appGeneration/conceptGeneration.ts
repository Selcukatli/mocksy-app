"use node";

import { internalAction, action } from "../../_generated/server";
import { v } from "convex/values";
import { internal, api } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";

/**
 * Public: Generate 4 app concepts from user description
 * Returns concepts with text immediately, then generates images in parallel
 */
export const generateAppConcepts = action({
  args: {
    appDescriptionInput: v.string(),
    categoryHint: v.optional(v.string()),
  },
  returns: v.object({
    jobId: v.id("conceptGenerationJobs"),
    concepts: v.array(
      v.object({
        app_name: v.string(),
        app_subtitle: v.string(),
        app_description: v.string(),
        app_category: v.optional(v.string()),
        style_description: v.string(),
        app_icon_prompt: v.string(),
        cover_image_prompt: v.string(),
        colors: v.optional(
          v.object({
            primary: v.string(),
            background: v.string(),
            text: v.string(),
            accent: v.string(),
          })
        ),
        typography: v.optional(
          v.object({
            headlineFont: v.string(),
            headlineSize: v.string(),
            headlineWeight: v.string(),
            bodyFont: v.string(),
            bodySize: v.string(),
            bodyWeight: v.string(),
          })
        ),
        effects: v.optional(
          v.object({
            cornerRadius: v.string(),
            shadowStyle: v.string(),
            designPhilosophy: v.string(),
          })
        ),
      })
    ),
  }),
  handler: async (ctx, args): Promise<{
    jobId: Id<"conceptGenerationJobs">;
    concepts: Array<{
      app_name: string;
      app_subtitle: string;
      app_description: string;
      app_category?: string;
      style_description: string;
      app_icon_prompt: string;
      cover_image_prompt: string;
      colors?: {
        primary: string;
        background: string;
        text: string;
        accent: string;
      };
      typography?: {
        headlineFont: string;
        headlineSize: string;
        headlineWeight: string;
        bodyFont: string;
        bodySize: string;
        bodyWeight: string;
      };
      effects?: {
        cornerRadius: string;
        shadowStyle: string;
        designPhilosophy: string;
      };
    }>;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be authenticated to generate concepts");
    }

    const profile = await ctx.runQuery(api.features.profiles.queries.getCurrentProfile);
    if (!profile) {
      throw new Error("Failed to get user profile");
    }

    console.log("🎨 Generating 4 app concepts...");

    const jobId: Id<"conceptGenerationJobs"> = await ctx.runMutation(internal.features.appGeneration.jobs.createConceptGenerationJob, {
      profileId: profile._id,
      status: "generating_concepts",
    });

    const { b } = await import("../../../baml_client");
    const result = await b.GenerateAppConcepts(
      args.appDescriptionInput,
      args.categoryHint ?? null
    );

    console.log(`  ✓ Generated ${result.concepts.length} concepts`);

    await ctx.runMutation(internal.features.appGeneration.jobs.updateConceptsText, {
      jobId,
      concepts: result.concepts,
      status: "generating_images",
    });

    await ctx.scheduler.runAfter(0, internal.features.appGeneration.conceptGeneration.generateConceptImages, {
      jobId,
      concepts: result.concepts,
    });

    return {
      jobId,
      concepts: result.concepts,
    };
  },
});

/**
 * Internal: Generate images for all concepts in parallel
 */
export const generateConceptImages = internalAction({
  args: {
    jobId: v.id("conceptGenerationJobs"),
    concepts: v.array(
      v.object({
        app_name: v.string(),
        app_subtitle: v.string(),
        app_description: v.string(),
        app_category: v.optional(v.string()),
        style_description: v.string(),
        app_icon_prompt: v.string(),
        cover_image_prompt: v.string(),
        colors: v.optional(
          v.object({
            primary: v.string(),
            background: v.string(),
            text: v.string(),
            accent: v.string(),
          })
        ),
        typography: v.optional(
          v.object({
            headlineFont: v.string(),
            headlineSize: v.string(),
            headlineWeight: v.string(),
            bodyFont: v.string(),
            bodySize: v.string(),
            bodyWeight: v.string(),
          })
        ),
        effects: v.optional(
          v.object({
            cornerRadius: v.string(),
            shadowStyle: v.string(),
            designPhilosophy: v.string(),
          })
        ),
      })
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    console.log(`🖼️  Generating images for ${args.concepts.length} concepts in parallel...`);

    try {
      await Promise.all(
        args.concepts.map(async (concept, index) => {
          try {
            console.log(`  → [Concept ${index + 1}] Generating icon and cover...`);

            const [iconResult, coverResult] = await Promise.all([
              ctx.runAction(internal.utils.fal.falImageActions.geminiFlashTextToImage, {
                prompt: concept.app_icon_prompt,
                num_images: 1,
                output_format: "png",
              }),
              ctx.runAction(internal.utils.fal.falImageActions.seedDream4TextToImage, {
                prompt: concept.cover_image_prompt,
                image_size: { width: 1920, height: 1080 },
                num_images: 1,
              }),
            ]);

            const iconUrl = iconResult.images?.[0]?.url;
            const coverUrl = coverResult.images?.[0]?.url;

            if (iconUrl && coverUrl) {
              await ctx.runMutation(internal.features.appGeneration.jobs.updateConceptImages, {
                jobId: args.jobId,
                conceptIndex: index,
                iconUrl,
                coverUrl,
              });
              console.log(`  ✓ [Concept ${index + 1}] Images generated`);
            } else {
              console.log(`  ✗ [Concept ${index + 1}] Failed to generate images`);
            }
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.log(`  ✗ [Concept ${index + 1}] Error: ${errorMsg}`);
          }
        })
      );

      console.log("✅ Concept image generation complete");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ Error generating concept images:", errorMessage);
      await ctx.runMutation(internal.features.appGeneration.jobs.failConceptGenerationJob, {
        jobId: args.jobId,
        error: errorMessage,
      });
    }
  },
});

