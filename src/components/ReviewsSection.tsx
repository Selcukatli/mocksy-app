'use client';

import { useState } from 'react';
import { Star, Edit } from 'lucide-react';
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
  onReviewSubmitted?: () => void;
}

export default function ReviewsSection({
  appId,
  appName,
  reviews,
  averageRating,
  totalReviews,
  onReviewSubmitted,
}: ReviewsSectionProps) {
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);

  const handleReviewSuccess = () => {
    if (onReviewSubmitted) {
      onReviewSubmitted();
    }
  };

  // If no reviews, show simplified version
  if (totalReviews === 0) {
    return (
      <>
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden p-6">
          <h2 className="text-2xl font-semibold mb-6">Ratings & Reviews</h2>
          <p className="text-muted-foreground mb-6 text-center">No reviews yet. Be the first to review this app!</p>

          {/* Actions Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
            <InlineStarRating appId={appId} onRatingSubmitted={handleReviewSuccess} />
            <button
              onClick={() => setIsWriteReviewOpen(true)}
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <Edit className="w-4 h-4" />
              Write a Review
            </button>
          </div>
        </div>

        <WriteReviewModal
          isOpen={isWriteReviewOpen}
          onClose={() => setIsWriteReviewOpen(false)}
          appId={appId}
          appName={appName}
          onSuccess={handleReviewSuccess}
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
        </div>

        {/* Actions Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <InlineStarRating appId={appId} onRatingSubmitted={handleReviewSuccess} />
          <button
            onClick={() => setIsWriteReviewOpen(true)}
            className="text-primary hover:text-primary/80 text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            <Edit className="w-4 h-4" />
            Write a Review
          </button>
        </div>

        {/* Reviews Carousel */}
        {reviews.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Reviews</h3>
            <div className="relative -mx-6">
              <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory px-6">
                <div className="flex gap-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} />
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
        onSuccess={handleReviewSuccess}
      />
    </>
  );
}
