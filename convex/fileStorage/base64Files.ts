"use node";

import { Buffer } from "buffer";
import { action } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

/**
 * Converts base64 data to binary and stores it in Convex storage.
 * Use this when receiving base64-encoded data (e.g., from canvas.toDataURL()).
 *
 * This function requires Node.js runtime for Buffer operations.
 *
 * @param base64Data - Base64 encoded string (with or without data URI prefix)
 * @param contentType - Optional MIME type (e.g., "image/png", "application/pdf")
 * @returns Storage ID of the uploaded file
 */
export const storeBase64File = action({
  args: {
    base64Data: v.string(),
    contentType: v.optional(v.string()),
  },
  returns: v.id("_storage"),
  handler: async (ctx, args): Promise<Id<"_storage">> => {
    try {
      // Remove data URI prefix if present (e.g., "data:image/png;base64,")
      let base64Content = args.base64Data;
      if (base64Content.includes(',')) {
        base64Content = base64Content.split(',')[1];
      }

      // Validate base64 string
      if (!base64Content || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64Content)) {
        throw new Error("Invalid base64 string provided");
      }

      console.log(`Processing base64 data - length: ${base64Content.length}, contentType: ${args.contentType}`);

      // Convert base64 to Buffer (Node.js specific)
      const buffer = Buffer.from(base64Content, 'base64');
      console.log(`Converted to buffer - size: ${buffer.length} bytes`);

      // Create blob from buffer
      const blob = new Blob([buffer], { type: args.contentType });
      console.log(`Created blob - size: ${blob.size} bytes, type: ${blob.type}`);

      // Store in Convex storage
      const storageId = await ctx.storage.store(blob);
      console.log(`✅ Successfully stored file with ID: ${storageId}`);

      // Verify by getting URL
      const url = await ctx.storage.getUrl(storageId);
      console.log(`✅ Verification URL: ${url}`);

      return storageId;
    } catch (error) {
      console.error("❌ Error storing base64 data:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to store base64 data: ${error.message}`);
      } else {
        throw new Error("Failed to store base64 data: Unknown error");
      }
    }
  },
});