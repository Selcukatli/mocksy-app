import { internalAction, action, mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

// ========================
// Upload Operations
// ========================

/**
 * Generates a URL for direct browser uploads to Convex storage.
 * Use this when uploading files directly from the client.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Fetches content from a URL and stores it in Convex storage.
 * Use this for server-side file fetching (e.g., from external APIs).
 */
export const storeFromUrl = internalAction({
  args: {
    sourceUrl: v.string(),
  },
  returns: v.id("_storage"),
  handler: async (ctx, args): Promise<Id<"_storage">> => {
    try {
      const response = await fetch(args.sourceUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch URL (${response.status}): ${response.statusText}`);
      }
      const blob = await response.blob();
      const storageId = await ctx.storage.store(blob);
      console.log(`Stored file from URL ${args.sourceUrl} with ID: ${storageId}`);
      return storageId;
    } catch (error) {
      console.error(`Error storing file from URL ${args.sourceUrl}:`, error);
      if (error instanceof Error) {
        throw new Error(`Failed to store data from URL: ${error.message}`);
      } else {
        throw new Error("Failed to store data from URL: Unknown error");
      }
    }
  },
});

// ========================
// Retrieval Operations
// ========================

/**
 * Gets a short-lived URL for accessing a stored file.
 * Use this to display images or allow file downloads in your app.
 */
export const getFileUrl = query({
  args: {
    storageId: v.id("_storage")
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    try {
      console.log(`🔍 Getting URL for storage ID: ${args.storageId}`);

      // Check if file exists
      const fileMetadata = await ctx.db.system.get(args.storageId);
      if (!fileMetadata) {
        console.warn(`❌ File not found: ${args.storageId}`);
        return null;
      }

      console.log(`✅ File found:`, {
        id: fileMetadata._id,
        size: fileMetadata.size,
        contentType: fileMetadata.contentType,
      });

      // Generate URL
      const url = await ctx.storage.getUrl(args.storageId);
      if (url) {
        console.log(`✅ Generated URL: ${url}`);
      }

      return url;
    } catch (error) {
      console.error(`❌ Error getting URL for ${args.storageId}:`, error);
      return null;
    }
  },
});

// ========================
// Testing/Debug Operations
// ========================

/**
 * Test function to verify storage is working correctly.
 * Creates a test file and returns its details.
 */
export const testStorage = action({
  args: {},
  returns: v.object({
    storageId: v.id("_storage"),
    url: v.union(v.string(), v.null()),
    size: v.number(),
  }),
  handler: async (ctx) => {
    try {
      const testContent = "Hello, this is a test file for storage verification";
      const blob = new Blob([testContent], { type: "text/plain" });

      const storageId = await ctx.storage.store(blob);
      console.log(`📝 Test file stored with ID: ${storageId}`);

      const url = await ctx.storage.getUrl(storageId);
      console.log(`🔗 Test file URL: ${url}`);

      return {
        storageId,
        url,
        size: blob.size,
      };
    } catch (error) {
      console.error("❌ Storage test failed:", error);
      throw error;
    }
  },
});