'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';

interface InlineStarRatingProps {
  appId: Id<'apps'>;
  onRatingSubmitted?: () => void;
}

export default function InlineStarRating({ appId, onRatingSubmitted }: InlineStarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const createReview = useMutation(api.mockReviews.createReview);

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
        setSelectedRating(rating);
        if (onRatingSubmitted) {
          onRatingSubmitted();
        }
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

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Click to Rate:</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => !isSubmitting && !selectedRating && handleRatingClick(star)}
            onMouseEnter={() => !selectedRating && setHoverRating(star)}
            onMouseLeave={() => !selectedRating && setHoverRating(0)}
            disabled={isSubmitting || selectedRating > 0}
            className="transition-transform hover:scale-110 active:scale-95 disabled:cursor-default disabled:hover:scale-100"
          >
            <Star
              className={`w-7 h-7 ${
                star <= (selectedRating || hoverRating)
                  ? 'fill-primary text-primary'
                  : 'text-gray-300'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
      {error && (
        <span className="text-xs text-red-600">{error}</span>
      )}
      {selectedRating > 0 && (
        <span className="text-xs text-muted-foreground">Thanks for rating!</span>
      )}
    </div>
  );
}
