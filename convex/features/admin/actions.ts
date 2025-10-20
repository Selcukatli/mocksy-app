"use node";

import { action } from "../../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";

/**
 * Helper function to convert blob to base64 string
 */
async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Helper function to convert base64 string back to blob
 */
function base64ToBlob(base64: string, contentType: string = 'image/png'): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}

/**
 * Action to publish an app from current (dev) deployment to production deployment
 * Reads app data locally and writes to prod via HTTP API
 */
export const publishAppToProd = action({
  args: {
    appId: v.id("apps"),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
    console.log("🚀 [PUBLISH] Starting publish to prod for app:", args.appId);
    
    // Check if user is authenticated and is admin
    const profile = await ctx.runQuery(api.data.profiles.getCurrentProfile);
    if (!profile) {
      throw new Error("Not authenticated");
    }
    if (!profile.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }
    console.log("✓ [PUBLISH] Profile verified:", profile._id);
    console.log("✓ [PUBLISH] Admin userId (for matching in prod):", profile.userId);

    // Get prod deployment URL from environment
    const prodUrl = process.env.CONVEX_PROD_URL;
    if (!prodUrl) {
      throw new Error("CONVEX_PROD_URL not configured. Add it to your .env.local file.");
    }
    console.log("✓ [PUBLISH] Prod URL configured:", prodUrl);

    try {
      // Step 1: Read app data from CURRENT (dev) deployment
      const app = await ctx.runQuery(internal.data.apps.getAppByIdInternal, {
        appId: args.appId,
      });
      
      if (!app) {
        throw new Error("App not found in current deployment");
      }
      console.log("✓ [PUBLISH] App loaded:", app.name);

      if (!app.isDemo) {
        throw new Error("Only demo apps can be published to production");
      }

      // Step 2: Get icon image as base64 if exists
      let iconBase64: string | undefined;
      if (app.iconStorageId) {
        const iconUrl = await ctx.storage.getUrl(app.iconStorageId);
        if (iconUrl) {
          try {
            const iconResponse = await fetch(iconUrl);
            if (iconResponse.ok) {
              const iconBlob = await iconResponse.blob();
              iconBase64 = await blobToBase64(iconBlob);
              console.log("✓ [PUBLISH] Icon encoded, size:", iconBase64.length, "chars");
            }
          } catch (error) {
            console.error("✗ [PUBLISH] Failed to fetch icon:", error);
          }
        }
      } else {
        console.log("⊘ [PUBLISH] No icon to transfer");
      }

      // Step 3: Get cover image as base64 if exists
      let coverBase64: string | undefined;
      if (app.coverImageStorageId) {
        const coverUrl = await ctx.storage.getUrl(app.coverImageStorageId);
        if (coverUrl) {
          try {
            const coverResponse = await fetch(coverUrl);
            if (coverResponse.ok) {
              const coverBlob = await coverResponse.blob();
              coverBase64 = await blobToBase64(coverBlob);
              console.log("✓ [PUBLISH] Cover encoded, size:", coverBase64.length, "chars");
            }
          } catch (error) {
            console.error("✗ [PUBLISH] Failed to fetch cover:", error);
          }
        }
      } else {
        console.log("⊘ [PUBLISH] No cover to transfer");
      }

      // Step 4: Get app screens from CURRENT deployment
      const appScreens = await ctx.runQuery(internal.data.appScreens.getScreensByAppId, {
        appId: args.appId,
      });
      console.log("✓ [PUBLISH] Found", appScreens.length, "app screens");

      // Step 5: Fetch app screen images as base64
      const screensWithBase64 = await Promise.all(
        appScreens.map(async (screen: {
          name: string;
          storageId: Id<"_storage">;
          dimensions: { width: number; height: number };
          size: number;
        }) => {
          const screenUrl = await ctx.storage.getUrl(screen.storageId);
          let screenBase64: string | undefined;
          
          if (screenUrl) {
            try {
              const screenResponse = await fetch(screenUrl);
              if (screenResponse.ok) {
                const screenBlob = await screenResponse.blob();
                screenBase64 = await blobToBase64(screenBlob);
                console.log("✓ [PUBLISH] Screen encoded:", screen.name, screenBase64.length, "chars");
              }
            } catch (error) {
              console.error("✗ [PUBLISH] Failed to fetch screen:", screen.name, error);
            }
          }

          return {
            name: screen.name,
            dimensions: screen.dimensions,
            size: screen.size,
            base64: screenBase64,
          };
        })
      );

      const validScreens = screensWithBase64.filter((s: { base64?: string }) => s.base64);
      console.log("✓ [PUBLISH] Successfully encoded", validScreens.length, "of", appScreens.length, "screens");

      // Step 6: Send app data to PROD deployment via HTTP API
      console.log("📤 [PUBLISH] Sending HTTP request to prod:", prodUrl);
      console.log("📤 [PUBLISH] Payload size estimates:");
      console.log("  - Icon:", iconBase64 ? `${iconBase64.length} chars` : "none");
      console.log("  - Cover:", coverBase64 ? `${coverBase64.length} chars` : "none");
      console.log("  - Screens:", validScreens.length);
      
      // Note: createAppFromDev is an action, not a mutation
      const createAppResponse = await fetch(`${prodUrl}/api/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: "features/admin/actions:createAppFromDev",
          args: {
            adminUserId: profile.userId, // Pass admin's userId to match in prod
            name: app.name,
            subtitle: app.subtitle,
            description: app.description,
            category: app.category,
            platforms: app.platforms,
            languages: app.languages,
            appStoreUrl: app.appStoreUrl,
            playStoreUrl: app.playStoreUrl,
            websiteUrl: app.websiteUrl,
            bundleId: app.bundleId,
            keywords: app.keywords,
            ageRating: app.ageRating,
            styleGuide: app.styleGuide,
            iconBase64,
            coverBase64,
            appScreens: validScreens,
          },
          format: "json",
        }),
      });

      console.log("📥 [PUBLISH] Response status:", createAppResponse.status, createAppResponse.statusText);

      if (!createAppResponse.ok) {
        const errorText = await createAppResponse.text();
        console.error("✗ [PUBLISH] Failed response body:", errorText);
        throw new Error(`Failed to create app in prod: ${createAppResponse.statusText} - ${errorText}`);
      }

      const result = await createAppResponse.json();
      console.log("✓ [PUBLISH] Success response:", JSON.stringify(result, null, 2));
      
      // Convex HTTP API wraps the response in a "value" field
      const actionResult = result.value || result;
      
      // Check if the Convex API returned an error even though HTTP status is 200
      if (actionResult.status === "error" || result.status === "error") {
        console.error("✗ [PUBLISH] Convex API error:", actionResult.errorMessage || result.errorMessage);
        throw new Error(`Prod API error: ${actionResult.errorMessage || result.errorMessage}`);
      }

      // Update dev app with prod tracking info
      if (actionResult.success && actionResult.appId) {
        console.log("📝 [PUBLISH] Updating dev app with prod tracking info...");
        await ctx.runMutation(internal.data.apps.updateProdPublishStatus, {
          appId: args.appId,
          prodAppId: actionResult.appId,
          publishedAt: Date.now(),
        });
        console.log("✓ [PUBLISH] Dev app updated with prod ID:", actionResult.appId);
      } else {
        console.warn("⚠️ [PUBLISH] Publish succeeded but no appId returned. Result:", actionResult);
      }
      
      return {
        success: true,
        message: `Successfully published "${app.name}" to production with ${validScreens.length} screen(s)`,
      };
    } catch (error) {
      console.error("✗ [PUBLISH] Error publishing app to prod:", error);
      return {
        success: false,
        message: `Failed to publish app: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});

/**
 * Action to create an app in prod from base64 image data sent from dev
 * This runs on the PROD deployment and is called via HTTP API from dev
 * Uses action instead of mutation because we need ctx.storage.store()
 */
export const createAppFromDev = action({
  args: {
    adminUserId: v.string(), // userId from dev to match admin in prod
    name: v.string(),
    subtitle: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    platforms: v.optional(
      v.object({
        ios: v.boolean(),
        android: v.boolean(),
      }),
    ),
    languages: v.optional(v.array(v.string())),
    appStoreUrl: v.optional(v.string()),
    playStoreUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    bundleId: v.optional(v.string()),
    keywords: v.optional(v.array(v.string())),
    ageRating: v.optional(v.string()),
    styleGuide: v.optional(v.string()),
    iconBase64: v.optional(v.string()),
    coverBase64: v.optional(v.string()),
    appScreens: v.optional(
      v.array(
        v.object({
          name: v.string(),
          dimensions: v.object({
            width: v.number(),
            height: v.number(),
          }),
          size: v.number(),
          base64: v.optional(v.string()),
        })
      )
    ),
  },
  returns: v.object({
    success: v.boolean(),
    appId: v.optional(v.id("apps")),
    message: v.string(),
  }),
  handler: async (ctx, args): Promise<{ success: boolean; appId?: Id<"apps">; message: string }> => {
    console.log("🎯 [RECEIVE] Received publish request from dev");
    console.log("🎯 [RECEIVE] App name:", args.name);
    console.log("🎯 [RECEIVE] Admin userId to match:", args.adminUserId);
    console.log("🎯 [RECEIVE] Has icon:", !!args.iconBase64);
    console.log("🎯 [RECEIVE] Has cover:", !!args.coverBase64);
    console.log("🎯 [RECEIVE] Screens count:", args.appScreens?.length || 0);
    
    // Look up admin profile by userId first (to match the same user across deployments)
    let profile = await ctx.runQuery(api.data.profiles.getAdminProfileByUserId, {
      userId: args.adminUserId,
    });

    // If not found, fall back to any admin profile
    if (!profile) {
      console.log("⚠️ [RECEIVE] Admin with userId", args.adminUserId, "not found, using fallback admin");
      profile = await ctx.runQuery(api.data.profiles.getAnyAdminProfile);
    }

    if (!profile) {
      console.error("✗ [RECEIVE] No admin profile found in prod deployment");
      throw new Error("No admin profile found - please ensure at least one admin exists in production");
    }
    console.log("✓ [RECEIVE] Profile found:", profile._id, `(${profile.username || profile.firstName || "admin"})`);

    try {
      // Convert base64 icon to storage if provided
      let iconStorageId: Id<"_storage"> | undefined;
      if (args.iconBase64) {
        const iconBlob = base64ToBlob(args.iconBase64);
        iconStorageId = (await ctx.storage.store(iconBlob)) as Id<"_storage">;
        console.log("✓ [RECEIVE] Icon stored:", iconStorageId);
      }

      // Convert base64 cover to storage if provided
      let coverImageStorageId: Id<"_storage"> | undefined;
      if (args.coverBase64) {
        const coverBlob = base64ToBlob(args.coverBase64);
        coverImageStorageId = (await ctx.storage.store(coverBlob)) as Id<"_storage">;
        console.log("✓ [RECEIVE] Cover stored:", coverImageStorageId);
      }

      // Create the app using internal mutation
      console.log("📝 [RECEIVE] Creating app via internal mutation...");
      const appId: Id<"apps"> = await ctx.runMutation(internal.data.apps.createAppForMigration, {
        profileId: profile._id as Id<"profiles">,
        name: args.name,
        subtitle: args.subtitle,
        description: args.description,
        category: args.category,
        iconStorageId,
        coverImageStorageId,
        platforms: args.platforms,
        languages: args.languages,
        appStoreUrl: args.appStoreUrl,
        playStoreUrl: args.playStoreUrl,
        websiteUrl: args.websiteUrl,
        bundleId: args.bundleId,
        keywords: args.keywords,
        ageRating: args.ageRating,
        isDemo: true,
        status: "published", // Publish directly to prod
        styleGuide: args.styleGuide,
      });
      console.log("✓ [RECEIVE] App created with ID:", appId);

      // Create app screens if provided
      let screensCreated = 0;
      if (args.appScreens) {
        console.log("📝 [RECEIVE] Creating", args.appScreens.length, "app screens...");
        for (const screen of args.appScreens) {
          if (screen.base64) {
            try {
              const screenBlob = base64ToBlob(screen.base64);
              const screenStorageId = (await ctx.storage.store(screenBlob)) as Id<"_storage">;

              await ctx.runMutation(internal.data.appScreens.createAppScreenForMigration, {
                appId: appId as Id<"apps">,
                profileId: profile._id as Id<"profiles">,
                name: screen.name,
                storageId: screenStorageId,
                dimensions: screen.dimensions,
                size: screen.size,
              });

              screensCreated++;
              console.log("✓ [RECEIVE] Screen created:", screen.name);
            } catch (error) {
              console.error("✗ [RECEIVE] Failed to create screen:", screen.name, error);
            }
          }
        }
      }

      console.log("🎉 [RECEIVE] Success! App", appId, "created with", screensCreated, "screens");

      return {
        success: true,
        appId: appId as Id<"apps">,
        message: `App "${args.name}" created with ${screensCreated} screen(s)`,
      };
    } catch (error) {
      console.error("✗ [RECEIVE] Error creating app from dev:", error);
      return {
        success: false,
        message: `Failed to create app: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});
