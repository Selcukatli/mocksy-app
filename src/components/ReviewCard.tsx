'use client';

import { Star } from 'lucide-react';
import { Id } from '@convex/_generated/dataModel';
import Image from 'next/image';

interface ReviewCardProps {
  review: {
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
  };
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const displayName = review.reviewer.username || review.reviewer.firstName || 'Anonymous';
  const timeAgo = getTimeAgo(review.createdAt);

  return (
    <div className="w-[280px] md:w-[320px] flex-shrink-0 p-4 rounded-xl border bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      {/* Review title */}
      {review.title && (
        <h5 className="font-semibold text-sm mb-2 line-clamp-1">{review.title}</h5>
      )}

      {/* Star rating and date */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-3.5 h-3.5 ${
                star <= review.rating
                  ? 'fill-yellow-500 text-yellow-500'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{timeAgo}</span>
      </div>

      {/* Review content */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3">
        {review.reviewText}
      </p>

      {/* Reviewer info */}
      <div className="flex items-center gap-2 pt-3">
        {/* Avatar */}
        <div className="w-6 h-6 rounded-full overflow-hidden bg-muted flex-shrink-0 relative">
          {review.reviewer.imageUrl ? (
            <Image
              src={review.reviewer.imageUrl}
              alt={displayName}
              fill
              className="object-cover"
              sizes="24px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold text-xs">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <span className="font-medium text-xs">{displayName}</span>
      </div>
    </div>
  );
}

function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years}y ago`;
  if (months > 0) return `${months}mo ago`;
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}
