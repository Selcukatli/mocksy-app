import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";

// Internal mutation to set admin status (for initial setup)
export const setAdminStatus = internalMutation({
  args: {
    profileId: v.id("profiles"),
    isAdmin: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.profileId, {
      isAdmin: args.isAdmin,
      updatedAt: Date.now(),
    });
    return null;
  },
});

