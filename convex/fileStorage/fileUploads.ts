import { mutation } from "../_generated/server";

/**
 * Generates a URL that can be used to upload a file directly to Convex storage.
 * This is used for direct browser uploads without needing to convert to base64.
 * @returns A URL that can be used with fetch to upload a file.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    // Return a URL that can be used to upload a file to Convex storage
    return await ctx.storage.generateUploadUrl();
  },
});