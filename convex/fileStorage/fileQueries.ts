import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Generates a short-lived URL for a file stored in Convex storage.
 * @param storageId The ID of the file in Convex storage (`_storage` table).
 * @returns A URL string if the file exists and is accessible, otherwise null.
 */
export const getUrl = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    try {
        console.log(`🔍 Getting URL for storage ID: ${args.storageId}`);
        
        // First check if the file exists by querying the _storage system table
        const fileMetadata = await ctx.db.system.get(args.storageId);
        if (!fileMetadata) {
            console.warn(`❌ File not found in storage for ID: ${args.storageId}`);
            return null;
        }
        
        console.log(`✅ File metadata found:`, {
            id: fileMetadata._id,
            size: fileMetadata.size,
            contentType: fileMetadata.contentType,
            creationTime: fileMetadata._creationTime
        });
        
        // Generate the URL
        const url = await ctx.storage.getUrl(args.storageId);
        if (url) {
            console.log(`✅ Generated URL: ${url}`);
        } else {
            console.warn(`❌ Failed to generate URL for storage ID: ${args.storageId}`);
        }
        
        return url;
    } catch (error) {
        console.error(`❌ Error getting URL for storage ID ${args.storageId}:`, error);
        return null;
    }
  },
}); 