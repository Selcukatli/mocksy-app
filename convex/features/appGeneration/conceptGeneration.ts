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

    const profile = await ctx.runQuery(api.data.profiles.getCurrentProfile);
    if (!profile) {
      throw new Error("Failed to get user profile");
    }

    console.log("🎨 Generating 4 app concepts in parallel...");

    const jobId: Id<"conceptGenerationJobs"> = await ctx.runMutation(internal.features.appGeneration.jobs.createConceptGenerationJob, {
      profileId: profile._id,
      status: "generating_concepts",
    });

    const { b } = await import("../../../baml_client");
    
    // Generate 4 concepts in parallel using Haiku (faster & cheaper than 1 Sonnet call)
    const conceptResults = await Promise.all([
      b.GenerateAppConcepts(args.appDescriptionInput, args.categoryHint ?? null, 1),
      b.GenerateAppConcepts(args.appDescriptionInput, args.categoryHint ?? null, 1),
      b.GenerateAppConcepts(args.appDescriptionInput, args.categoryHint ?? null, 1),
      b.GenerateAppConcepts(args.appDescriptionInput, args.categoryHint ?? null, 1),
    ]);

    // Extract the single concept from each result
    const concepts = conceptResults.map(result => result.concepts[0]);

    console.log(`  ✓ Generated ${concepts.length} concepts`);

    // Create persistent appConcepts records for each concept
    const conceptIds = await Promise.all(
      concepts.map(async (concept) => {
        return await ctx.runMutation(internal.data.appConcepts.createConcept, {
          jobId,
          profileId: profile._id,
          name: concept.app_name,
          subtitle: concept.app_subtitle,
          description: concept.app_description,
          category: concept.app_category,
          styleDescription: concept.style_description,
          colors: concept.colors ?? {
            primary: "#000000",
            background: "#FFFFFF",
            text: "#000000",
            accent: "#000000",
          },
          typography: concept.typography ?? {
            headlineFont: "System",
            headlineSize: "24px",
            headlineWeight: "bold",
            bodyFont: "System",
            bodySize: "16px",
            bodyWeight: "normal",
          },
          effects: concept.effects ?? {
            cornerRadius: "8px",
            shadowStyle: "none",
            designPhilosophy: "Clean and simple",
          },
          iconPrompt: concept.app_icon_prompt,
          coverPrompt: concept.cover_image_prompt,
        });
      })
    );

    console.log(`  ✓ Created ${conceptIds.length} persistent concept records`);

    await ctx.runMutation(internal.features.appGeneration.jobs.updateConceptsText, {
      jobId,
      concepts: concepts,
      status: "generating_images",
    });

    await ctx.scheduler.runAfter(0, internal.features.appGeneration.conceptGeneration.generateConceptImages, {
      jobId,
      conceptIds,
      concepts: concepts,
    });

    return {
      jobId,
      concepts: concepts,
    };
  },
});

/**
 * Internal: Generate images for all concepts in parallel
 */
export const generateConceptImages = internalAction({
  args: {
    jobId: v.id("conceptGenerationJobs"),
    conceptIds: v.array(v.id("appConcepts")),
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
              // Download images to Convex storage using existing storeFromUrl
              const [iconStorageId, coverStorageId] = await Promise.all([
                ctx.runAction(internal.fileStorage.files.storeFromUrl, {
                  sourceUrl: iconUrl,
                }),
                ctx.runAction(internal.fileStorage.files.storeFromUrl, {
                  sourceUrl: coverUrl,
                }),
              ]);

              // Update the appConcept with storage IDs
              await ctx.runMutation(internal.data.appConcepts.updateConceptImages, {
                conceptId: args.conceptIds[index],
                iconStorageId,
                coverImageStorageId: coverStorageId,
              });

              // Also update the job's concept array for backward compatibility
              await ctx.runMutation(internal.features.appGeneration.jobs.updateConceptImages, {
                jobId: args.jobId,
                conceptIndex: index,
                iconUrl,
                coverUrl,
              });
              console.log(`  ✓ [Concept ${index + 1}] Images generated and stored`);
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

