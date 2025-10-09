import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser } from "./profiles";

export const getAppReviews = query({
  args: { appId: v.id("apps"), limit: v.optional(v.number()) },
  returns: v.object({
    reviews: v.array(
      v.object({
        _id: v.id("mockReviews"),
        rating: v.number(),
        title: v.optional(v.string()),
        reviewText: v.string(),
        helpfulCount: v.optional(v.number()),
        createdAt: v.number(),
        reviewer: v.object({
          username: v.optional(v.string()),
          firstName: v.optional(v.string()),
          imageUrl: v.optional(v.string()),
        }),
      })
    ),
    averageRating: v.number(),
    totalReviews: v.number(),
    ratingCounts: v.object({
      five: v.number(),
      four: v.number(),
      three: v.number(),
      two: v.number(),
      one: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    // Get all reviews for the app
    const allReviews = await ctx.db
      .query("mockReviews")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .collect();

    // Calculate rating statistics
    const totalReviews = allReviews.length;
    const ratingCounts = {
      five: allReviews.filter((r) => r.rating === 5).length,
      four: allReviews.filter((r) => r.rating === 4).length,
      three: allReviews.filter((r) => r.rating === 3).length,
      two: allReviews.filter((r) => r.rating === 2).length,
      one: allReviews.filter((r) => r.rating === 1).length,
    };

    const averageRating =
      totalReviews > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    // Get most recent reviews with limit
    const recentReviews = await ctx.db
      .query("mockReviews")
      .withIndex("by_app_and_created", (q) => q.eq("appId", args.appId))
      .order("desc")
      .take(limit);

    // Fetch reviewer profiles
    const reviewsWithProfiles = await Promise.all(
      recentReviews.map(async (review) => {
        const profile = await ctx.db.get(review.profileId);
        return {
          _id: review._id,
          rating: review.rating,
          title: review.title,
          reviewText: review.reviewText,
          helpfulCount: review.helpfulCount,
          createdAt: review.createdAt,
          reviewer: {
            username: profile?.username,
            firstName: profile?.firstName,
            imageUrl: profile?.imageUrl,
          },
        };
      })
    );

    return {
      reviews: reviewsWithProfiles,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews,
      ratingCounts,
    };
  },
});

export const getUserReview = query({
  args: { appId: v.id("apps") },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("mockReviews"),
      rating: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const profile = await getCurrentUser(ctx);
    if (!profile) {
      return null;
    }

    const existingReview = await ctx.db
      .query("mockReviews")
      .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
      .filter((q) => q.eq(q.field("appId"), args.appId))
      .first();

    if (!existingReview) {
      return null;
    }

    return {
      _id: existingReview._id,
      rating: existingReview.rating,
    };
  },
});

export const createReview = mutation({
  args: {
    appId: v.id("apps"),
    rating: v.number(),
    title: v.optional(v.string()),
    reviewText: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    reviewId: v.optional(v.id("mockReviews")),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    // Get current user
    const profile = await getCurrentUser(ctx);
    if (!profile) {
      throw new Error("Must be logged in to write a review");
    }

    // Validate rating
    if (args.rating < 1 || args.rating > 5) {
      return {
        success: false,
        message: "Rating must be between 1 and 5 stars",
      };
    }

    // Check if user already reviewed this app
    const existingReview = await ctx.db
      .query("mockReviews")
      .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
      .filter((q) => q.eq(q.field("appId"), args.appId))
      .first();

    let reviewId: any;

    if (existingReview) {
      // Update existing review
      await ctx.db.patch(existingReview._id, {
        rating: args.rating,
        title: args.title,
        reviewText: args.reviewText,
        updatedAt: Date.now(),
      });
      reviewId = existingReview._id;
    } else {
      // Create new review
      reviewId = await ctx.db.insert("mockReviews", {
        appId: args.appId,
        profileId: profile._id,
        rating: args.rating,
        title: args.title,
        reviewText: args.reviewText,
        helpfulCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return {
      success: true,
      reviewId,
      message: existingReview ? "Review updated successfully" : "Review submitted successfully",
    };
  },
});
