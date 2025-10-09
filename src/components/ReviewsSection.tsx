'use client';

import { useState } from 'react';
import { Star, Edit, Sparkles } from 'lucide-react';
import ReviewCard from './ReviewCard';
import WriteReviewModal from './WriteReviewModal';
import InlineStarRating from './InlineStarRating';
import { Id } from '@convex/_generated/dataModel';

interface ReviewsSectionProps {
  appId: Id<'apps'>;
  appName: string;
  reviews: Array<{
    _id: Id<'mockReviews'>;
    rating: number;
    title?: string;
    reviewText: string;
    helpfulCount?: number;
    createdAt: number;
    reviewer: {
      username?: string;
      firstName?: string;
      imageUrl?: string;
    };
  }>;
  averageRating: number;
  totalReviews: number;
  ratingCounts: {
    five: number;
    four: number;
    three: number;
    two: number;
    one: number;
  };
}

export default function ReviewsSection({
  appId,
  appName,
  reviews,
  averageRating,
  totalReviews,
}: ReviewsSectionProps) {
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);

  // Filter out quick ratings (reviews with just "Rated X stars" text)
  const writtenReviews = reviews.filter(
    (review) => !review.reviewText.match(/^Rated \d stars?$/)
  );

  // If no reviews, show simplified version
  if (totalReviews === 0) {
    return (
      <>
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Title */}
            <div>
              <h2 className="text-2xl font-semibold mb-2">No Reviews Yet</h2>
              <p className="text-sm text-muted-foreground">Be the first to share your thoughts!</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <InlineStarRating appId={appId} />
              <button
                onClick={() => setIsWriteReviewOpen(true)}
                className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 shadow-sm text-sm font-medium"
              >
                <Edit className="w-4 h-4" />
                Write a Review
              </button>
            </div>
          </div>
        </div>

        <WriteReviewModal
          isOpen={isWriteReviewOpen}
          onClose={() => setIsWriteReviewOpen(false)}
          appId={appId}
          appName={appName}
          onSuccess={() => setIsWriteReviewOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Ratings & Reviews</h2>

          {/* Rating Display and Actions */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Rating Display */}
            <div className="flex items-center gap-3">
              <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(averageRating)
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {totalReviews.toLocaleString()} {totalReviews === 1 ? 'Rating' : 'Ratings'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <InlineStarRating appId={appId} />
              <button
                onClick={() => setIsWriteReviewOpen(true)}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 shadow-sm text-sm font-medium"
              >
                <Edit className="w-4 h-4" />
                Write a Review
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Carousel */}
        {writtenReviews.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Most Helpful Reviews</h3>
              {totalReviews > writtenReviews.length && (
                <button className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
                  See All ({totalReviews})
                </button>
              )}
            </div>
            <div className="relative -mx-6">
              <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory px-6 scroll-smooth">
                <div className="flex gap-4 pb-2">
                  {writtenReviews.map((review, index) => (
                    <div
                      key={review._id}
                      className="animate-in fade-in slide-in-from-right-8"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <ReviewCard review={review} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <WriteReviewModal
        isOpen={isWriteReviewOpen}
        onClose={() => setIsWriteReviewOpen(false)}
        appId={appId}
        appName={appName}
        onSuccess={() => setIsWriteReviewOpen(false)}
      />
    </>
  );
}
