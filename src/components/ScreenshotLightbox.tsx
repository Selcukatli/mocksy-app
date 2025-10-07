'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

interface ScreenshotLightboxProps {
  imageUrl: string | null;
  onClose: () => void;
  alt?: string;
  allImages?: string[]; // Array of all image URLs for navigation
  initialIndex?: number; // Starting index in the array
}

export default function ScreenshotLightbox({
  imageUrl,
  onClose,
  alt = 'Screenshot preview',
  allImages = [],
  initialIndex = 0,
}: ScreenshotLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const imageCount = allImages.length;

  // Update current index when initialIndex changes
  useEffect(() => {
    if (imageCount === 0) {
      setCurrentIndex(0);
      return;
    }

    const clampedIndex = Math.max(0, Math.min(initialIndex, imageCount - 1));
    setCurrentIndex(clampedIndex);
  }, [initialIndex, imageCount]);

  const currentImageUrl = imageCount > 0 ? allImages[currentIndex] : imageUrl;
  const canGoPrevious = imageCount > 0 && currentIndex > 0;
  const canGoNext = imageCount > 0 && currentIndex < imageCount - 1;

  const goToPrevious = useCallback(() => {
    if (canGoPrevious) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [canGoPrevious]);

  const goToNext = useCallback(() => {
    if (canGoNext) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [canGoNext]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!currentImageUrl) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentImageUrl, onClose, goToPrevious, goToNext]);

  return (
    <AnimatePresence>
      {currentImageUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col bg-black/95"
          onClick={onClose}
        >
          <div className="flex flex-1 flex-col pointer-events-none">
            {/* Header */}
            <div className="flex items-center justify-between p-4 pointer-events-auto">
              <span className="h-10 w-10" aria-hidden="true" />
              <div className="flex-1 text-center text-white">
                {imageCount > 0 && (
                  <p className="text-white/70 text-sm">
                    {currentIndex + 1} of {imageCount}
                  </p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Close preview"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Main Image */}
            <div
              className="flex-1 flex items-center justify-center px-4 py-2 min-h-0 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex items-center gap-4 max-w-full h-full">
                {/* Previous Button */}
                {imageCount > 1 && (
                  <button
                    onClick={goToPrevious}
                    className={`p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all ${
                      !canGoPrevious ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={!canGoPrevious}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                )}

                {/* Screenshot container - optimized for phone aspect ratio */}
                <motion.div
                  key={currentIndex}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-sm h-[78vh] flex items-center justify-center"
                >
                  {currentImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentImageUrl}
                      alt={alt}
                      className="max-h-full max-w-full object-contain rounded-xl"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
                    </div>
                  )}
                </motion.div>

                {/* Next Button */}
                {imageCount > 1 && (
                  <button
                    onClick={goToNext}
                    className={`p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all ${
                      !canGoNext ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={!canGoNext}
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {imageCount > 1 && (
              <div
                className="bg-black/70 p-3 pt-2 pointer-events-auto backdrop-blur-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-center">
                  <div className="flex gap-2 overflow-x-auto max-w-full px-2 pb-1">
                    {allImages.map((imgUrl, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`flex-shrink-0 relative rounded overflow-hidden transition-all duration-200 ${
                          index === currentIndex
                            ? 'opacity-100 border-[3px] border-white shadow-lg shadow-primary/30'
                            : 'opacity-40 hover:opacity-80 border-2 border-transparent'
                        }`}
                      >
                        {imgUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imgUrl}
                            alt={`Screenshot ${index + 1}`}
                            className="w-[56px] h-[100px] object-cover rounded-md"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-[56px] h-[100px] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center rounded-md">
                            <ImageIcon className="w-4 h-4 text-muted-foreground/30" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Helper text */}
            {imageCount <= 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none">
                <p className="text-sm text-white/60">Click anywhere to close</p>
                <p className="text-xs text-white/40 mt-1">or press ESC</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
