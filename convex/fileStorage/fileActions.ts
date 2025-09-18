"use node";

import { Buffer } from "buffer";
import { internalAction, action } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

/**
 * Stores binary data (provided as a base64 string) into Convex file storage.
 * @param base64Data The base64 encoded string of the data to store.
 * @param contentType Optional MIME type for the data (e.g., "image/png").
 * @returns The storageId (`Id<"_storage">`) of the newly stored file.
 */
export const storeFromBase64 = action({
  args: {
    base64Data: v.string(),
    contentType: v.optional(v.string()),
  },
  returns: v.id("_storage"),
  handler: async (ctx, args): Promise<Id<"_storage">> => {
    try {
      // Strip data URI prefix if present (e.g., "data:image/png;base64,")
      let base64Content = args.base64Data;
      if (base64Content.includes(',')) {
        base64Content = base64Content.split(',')[1];
      }

      // Validate base64 string
      if (!base64Content || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64Content)) {
        throw new Error("Invalid base64 string provided");
      }
      
      console.log(`Processing base64 data - length: ${base64Content.length}, contentType: ${args.contentType}`);
      
      // Convert base64 to Buffer
      const buffer = Buffer.from(base64Content, 'base64');
      console.log(`Converted to buffer - size: ${buffer.length} bytes`);
      
      // Create blob from buffer
      const blob = new Blob([buffer], { type: args.contentType });
      console.log(`Created blob - size: ${blob.size} bytes, type: ${blob.type}`);
      
      // Store in Convex storage
      const storageId = await ctx.storage.store(blob);
      console.log(`✅ Successfully stored file with ID: ${storageId}`);
      
      // Verify the file was stored by getting its URL
      const url = await ctx.storage.getUrl(storageId);
      console.log(`✅ Generated URL: ${url}`);
      
      return storageId;
    } catch (error) {
      console.error("❌ Error storing data from base64:", error);
      if (error instanceof Error) {
         throw new Error(`Failed to store data from base64: ${error.message}`);
      } else {
         throw new Error("Failed to store data from base64: Unknown error");
      }
    }
  },
});



/**
 * Fetches content from a given URL and stores it in Convex file storage.
 * @param sourceUrl The URL to fetch the content from.
 * @returns The storageId (`Id<"_storage">`) of the newly stored file.
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
      // Important: Check content type if needed, otherwise store as generic blob
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

/**
 * Test function to verify storage is working
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
      // Create a simple test file
      const testContent = "Hello, this is a test file for storage verification";
      const blob = new Blob([testContent], { type: "text/plain" });
      
      // Store it
      const storageId = await ctx.storage.store(blob);
      console.log(`📝 Test file stored with ID: ${storageId}`);
      
      // Get URL
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