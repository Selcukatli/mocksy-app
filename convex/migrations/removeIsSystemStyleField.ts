import { internalMutation } from "../_generated/server";

/**
 * Migration: Remove isSystemStyle field from all styles
 * Run once to clean up old schema field
 */
export const removeIsSystemStyleField = internalMutation({
  args: {},
  handler: async (ctx) => {
    const styles = await ctx.db.query("styles").collect();

    let updatedCount = 0;
    for (const style of styles) {
      // Check if the old field exists
      if ("isSystemStyle" in style) {
        // Replace the entire document without the isSystemStyle field
        const { isSystemStyle, ...cleanStyle } = style as any;

        await ctx.db.replace(style._id, cleanStyle);
        updatedCount++;
      }
    }

    console.log(`✅ Migration complete: Removed isSystemStyle from ${updatedCount} style(s)`);
    return { updatedCount };
  },
});
