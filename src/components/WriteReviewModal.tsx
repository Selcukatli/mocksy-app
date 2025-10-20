'use client';

import { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { useUser } from '@clerk/nextjs';
import LoginDialog from './LoginDialog';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appId: Id<'apps'>;
  appName: string;
  onSuccess: () => void;
}

export default function WriteReviewModal({
  isOpen,
  onClose,
  appId,
  appName,
  onSuccess,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [shouldSubmitAfterAuth, setShouldSubmitAfterAuth] = useState(false);

  const { isSignedIn } = useUser();
  const createReview = useMutation(api.data.appReviews.createReview);

  // Auto-submit review after authentication if user tried to submit while not logged in
  useEffect(() => {
    if (isSignedIn && showLoginDialog && shouldSubmitAfterAuth) {
      // User just authenticated, close login dialog and submit review
      setShowLoginDialog(false);
      // Submit the review on next tick
      setTimeout(() => {
        handleSubmit(new Event('submit') as unknown as React.FormEvent);
        setShouldSubmitAfterAuth(false);
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, showLoginDialog, shouldSubmitAfterAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (reviewText.trim().length < 10) {
      setError('Review must be at least 10 characters');
      return;
    }

    // Check if user is signed in
    if (!isSignedIn) {
      setShouldSubmitAfterAuth(true);
      setShowLoginDialog(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createReview({
        appId,
        rating,
        title: title.trim() || undefined,
        reviewText: reviewText.trim(),
      });

      if (result.success) {
        onSuccess();
        onClose();
        // Reset form
        setRating(0);
        setTitle('');
        setReviewText('');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // Reset form after animation
      setTimeout(() => {
        setRating(0);
        setTitle('');
        setReviewText('');
        setError('');
      }, 300);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-card rounded-2xl border shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-xl font-semibold">Write a Review</h2>
                  <p className="text-sm text-muted-foreground mt-1">{appName}</p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="p-2 hover:bg-muted/50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium mb-2">Rating *</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= (hoverRating || rating)
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        {rating} {rating === 1 ? 'star' : 'stars'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title (optional) */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-2">
                    Review Title (Optional)
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Summarize your experience"
                    maxLength={100}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  />
                </div>

                {/* Review Text */}
                <div>
                  <label htmlFor="reviewText" className="block text-sm font-medium mb-2">
                    Your Review *
                  </label>
                  <textarea
                    id="reviewText"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your thoughts about this app..."
                    rows={6}
                    maxLength={1000}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-50"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">Minimum 10 characters</p>
                    <p className="text-xs text-muted-foreground">
                      {reviewText.length}/1000
                    </p>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
                    {error}
                  </div>
                )}
              </form>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg border hover:bg-muted/50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting || rating === 0 || reviewText.trim().length < 10}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Login Dialog - shown over the review modal */}
          <LoginDialog
            isOpen={showLoginDialog}
            onClose={() => setShowLoginDialog(false)}
            title="Login to Write Review"
            message="Please sign in to write a review and share your experience with the community."
          />
        </>
      )}
    </AnimatePresence>
  );
}
