'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
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

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const currentImageUrl = allImages.length > 0 ? allImages[currentIndex] : imageUrl;
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < allImages.length - 1;

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
                {allImages.length > 0 && (
                  <p className="text-white/70 text-sm">
                    {currentIndex + 1} of {allImages.length}
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
                {allImages.length > 1 && (
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
                  className="relative w-full max-w-sm h-[85vh]"
                >
                  <Image
                    src={currentImageUrl}
                    alt={alt}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 100vw, 640px"
                    quality={95}
                  />
                </motion.div>

                {/* Next Button */}
                {allImages.length > 1 && (
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
            {allImages.length > 1 && (
              <div className="bg-black/50 p-3 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-center">
                  <div className="flex gap-2 overflow-x-auto max-w-full px-2">
                    {allImages.map((imgUrl, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`flex-shrink-0 relative rounded overflow-hidden transition-all duration-200 ${
                          index === currentIndex
                            ? 'opacity-100 border-2 border-white'
                            : 'opacity-50 hover:opacity-80 border-2 border-transparent'
                        }`}
                      >
                        {imgUrl ? (
                          <Image
                            src={imgUrl}
                            alt={`Screenshot ${index + 1}`}
                            width={56}
                            height={96}
                            className="w-14 h-24 object-cover"
                          />
                        ) : (
                          <div className="w-14 h-24 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
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
            {allImages.length <= 1 && (
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
