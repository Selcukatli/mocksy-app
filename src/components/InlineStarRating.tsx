'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';

interface InlineStarRatingProps {
  appId: Id<'apps'>;
}

const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export default function InlineStarRating({ appId }: InlineStarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const createReview = useMutation(api.mockReviews.createReview);
  const existingReview = useQuery(api.mockReviews.getUserReview, { appId });

  // Set selectedRating when existingReview loads
  useEffect(() => {
    if (existingReview) {
      setSelectedRating(existingReview.rating);
    }
  }, [existingReview]);

  const handleRatingClick = async (rating: number) => {
    setError('');
    setIsSubmitting(true);

    try {
      const result = await createReview({
        appId,
        rating,
        reviewText: `Rated ${rating} star${rating !== 1 ? 's' : ''}`, // Minimal text for quick ratings
      });

      if (result.success) {
        // Update local state immediately for smooth UI
        setSelectedRating(rating);
        // Convex query will auto-update, no need to force refresh
      } else {
        setError(result.message);
        // Reset after showing error
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to submit rating');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentLabel = hoverRating > 0 ? ratingLabels[hoverRating - 1] : '';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => !isSubmitting && handleRatingClick(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            disabled={isSubmitting}
            className="transition-all duration-200 hover:scale-125 active:scale-95 disabled:cursor-default disabled:hover:scale-100"
          >
            <Star
              className={`w-9 h-9 ${
                star <= (hoverRating || selectedRating)
                  ? 'fill-primary text-primary'
                  : 'text-gray-300'
              } transition-all duration-200`}
            />
          </button>
        ))}
      </div>

      <div className="h-5 flex items-center justify-center">
        {selectedRating > 0 ? (
          hoverRating > 0 ? (
            <span className="text-xs text-primary font-medium animate-in fade-in duration-200">
              Change Rating
            </span>
          ) : (
            <span className="text-xs text-muted-foreground font-medium animate-in fade-in duration-200">
              You rated {selectedRating} {selectedRating === 1 ? 'star' : 'stars'}
            </span>
          )
        ) : error ? (
          <span className="text-xs text-red-600 animate-in fade-in duration-200">{error}</span>
        ) : currentLabel ? (
          <span className="text-xs font-medium text-primary animate-in fade-in duration-200">
            {currentLabel}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Click to Rate</span>
        )}
      </div>
    </div>
  );
}
