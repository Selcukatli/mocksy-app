'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Image as ImageIcon, Video as VideoIcon, Trash2, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Id } from '@convex/_generated/dataModel';
import Image from 'next/image';

interface ImageLightboxProps {
  imageUrl: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
  type?: 'image' | 'video';
  videoUrl?: string;
  coverImageUrl?: string;
  appId?: Id<'apps'>;
  onGenerateVideo?: () => void;
  isGeneratingVideo?: boolean;
  onGenerateImage?: () => void;
  isGeneratingImage?: boolean;
  onRemoveVideo?: () => void;
}

export default function ImageLightbox({
  imageUrl,
  alt,
  isOpen,
  onClose,
  type = 'image',
  videoUrl,
  coverImageUrl,
  appId,
  onGenerateVideo,
  isGeneratingVideo = false,
  onGenerateImage, // eslint-disable-line @typescript-eslint/no-unused-vars
  isGeneratingImage = false,
  onRemoveVideo,
}: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const [isSafari, setIsSafari] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const hasBoth = !!(coverImageUrl && videoUrl);
  const canGenerateVideo = !!(coverImageUrl && !videoUrl && appId && onGenerateVideo);
  const showVideoTab = (hasBoth || canGenerateVideo) && !!coverImageUrl; // Only show video tab if image exists
  const isVideo = activeTab === 'video'; // Only check activeTab, not type

  // Detect Safari
  useEffect(() => {
    const ua = navigator.userAgent;
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(ua);
    setIsSafari(isSafariBrowser);
  }, []);
  
  // Track generation progress
  useEffect(() => {
    const isGenerating = isGeneratingVideo || isGeneratingImage;
    if (isGenerating && !generationStartTime) {
      setGenerationStartTime(Date.now());
    } else if (!isGenerating) {
      setGenerationStartTime(null);
      setGenerationProgress(0);
    }
  }, [isGeneratingVideo, isGeneratingImage, generationStartTime]);

  // Calculate smart progress with different durations for image vs video
  useEffect(() => {
    const isGenerating = isGeneratingVideo || isGeneratingImage;
    if (!isGenerating || !generationStartTime) {
      return;
    }

    const updateProgress = () => {
      const elapsed = Date.now() - generationStartTime;
      // Video generation takes longer than image generation
      const targetDuration = isGeneratingVideo ? 90000 : 40000; // 90s for video, 40s for image
      const timeRatio = elapsed / targetDuration;
      
      // Asymptotic formula: reaches ~87% at target time, then slows down
      // Formula: 100 * (1 - e^(-2*t/targetTime))
      // For video (90s): At 45s: ~63%, at 90s: ~87%, at 135s: ~95%, at 180s: ~98%
      // For image (40s): At 20s: ~63%, at 40s: ~87%, at 60s: ~95%, at 80s: ~98%
      const progress = 100 * (1 - Math.exp(-2 * timeRatio));
      setGenerationProgress(Math.min(progress, 99)); // Cap at 99%
    };

    updateProgress();
    const interval = setInterval(updateProgress, 100);
    return () => clearInterval(interval);
  }, [isGeneratingVideo, isGeneratingImage, generationStartTime]);
  
  // Set initial tab based on type
  useEffect(() => {
    if (isOpen) {
      setActiveTab(type === 'video' ? 'video' : 'image');
    }
  }, [isOpen, type]);

  // Reset scale when opening
  useEffect(() => {
    if (isOpen) {
      setScale(1);
    }
  }, [isOpen]);

  // Disable body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />

          {/* Content */}
          <div className="relative z-10 w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/50">
              {!isVideo && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  disabled={scale <= 0.5}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom out"
                >
                  <ZoomOut className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={handleZoomIn}
                  disabled={scale >= 3}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom in"
                >
                  <ZoomIn className="w-5 h-5 text-white" />
                </button>
                <span className="text-white text-sm ml-2">
                  {Math.round(scale * 100)}%
                </span>
              </div>
              )}
              {isVideo && <div />}
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                title="Close (Esc)"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Tabs - Show if both exist OR if generation is possible */}
            {showVideoTab && (
              <div className="flex items-center justify-center gap-2 px-4 py-3 bg-black/50">
                <button
                  onClick={() => setActiveTab('image')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'image'
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Cover Image</span>
                </button>
                <button
                  onClick={() => setActiveTab('video')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'video'
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
                  }`}
                >
                  <VideoIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Cover Video</span>
                </button>
              </div>
            )}

            {/* Image/Video Container */}
            <div className={`flex-1 p-4 flex items-center justify-center min-h-0 ${!isVideo && scale > 1 ? 'overflow-auto' : 'overflow-hidden'}`}>
              {/* Image generation UI - Show when on image tab without image */}
              {activeTab === 'image' && !coverImageUrl && !imageUrl && isGeneratingImage ? (
                <div className="flex flex-col items-center justify-center gap-6 max-w-2xl mx-auto px-4 w-full">
                  {/* Loading state with blurred placeholder */}
                  <div className="relative w-full max-w-md">
                    {/* Blurred placeholder background */}
                    <div className="relative rounded-2xl overflow-hidden bg-muted/30" style={{ aspectRatio: '16/9' }}>
                      {/* Mocksy and progress overlay */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
                        {/* Mocksy animation */}
                        {isSafari ? (
                          <Image
                            src="/mocksy-study.gif"
                            alt="Mocksy generating"
                            width={160}
                            height={160}
                            unoptimized
                            className="w-32 h-32 md:w-40 md:h-40"
                          />
                        ) : (
                          <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-32 h-32 md:w-40 md:h-40"
                          >
                            <source src="/mocksy-study.webm" type="video/webm" />
                          </video>
                        )}
                        
                        {/* Progress bar and text */}
                        <div className="w-full max-w-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-white text-sm md:text-base font-semibold">
                              Generating image{' '}
                              <span className="inline-flex">
                                <motion.span
                                  animate={{ opacity: [0, 1, 0] }}
                                  transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                                >
                                  .
                                </motion.span>
                                <motion.span
                                  animate={{ opacity: [0, 1, 0] }}
                                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                                >
                                  .
                                </motion.span>
                                <motion.span
                                  animate={{ opacity: [0, 1, 0] }}
                                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                                >
                                  .
                                </motion.span>
                              </span>
                            </p>
                            <span className="text-xs md:text-sm text-white/70 font-mono">
                              {Math.round(generationProgress)}%
                            </span>
                          </div>
                          {/* Progress Bar */}
                          <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                            <motion.div
                              className="h-full bg-white rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${generationProgress}%` }}
                              transition={{ duration: 0.3, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'video' && !videoUrl ? (
                <div className="flex flex-col items-center justify-center gap-6 w-full px-4">
                  {isGeneratingVideo ? (
                    // Loading state with blurred cover image background
                    <div className="relative w-full max-w-4xl">
                      {/* Blurred cover image background */}
                      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={coverImageUrl || imageUrl}
                          alt="Generating preview"
                          className="w-full h-auto blur-xl opacity-30"
                        />
                        
                        {/* Mocksy and progress overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
                          {/* Mocksy animation */}
                          {isSafari ? (
                            <Image
                              src="/mocksy-study.gif"
                              alt="Mocksy generating"
                              width={160}
                              height={160}
                              unoptimized
                              className="w-32 h-32 md:w-40 md:h-40"
                            />
                          ) : (
                            <video
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-32 h-32 md:w-40 md:h-40"
                            >
                              <source src="/mocksy-study.webm" type="video/webm" />
                            </video>
                          )}
                          
                          {/* Progress bar and text */}
                          <div className="w-full max-w-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-white text-sm md:text-base font-semibold">
                                Generating video{' '}
                                <span className="inline-flex">
                                  <motion.span
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                                  >
                                    .
                                  </motion.span>
                                  <motion.span
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                                  >
                                    .
                                  </motion.span>
                                  <motion.span
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                                  >
                                    .
                                  </motion.span>
                                </span>
                              </p>
                              <span className="text-xs md:text-sm text-white/70 font-mono">
                                {Math.round(generationProgress)}%
                              </span>
                            </div>
                            {/* Progress Bar */}
                            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                              <motion.div
                                className="h-full bg-white rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${generationProgress}%` }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Generate button - Show image preview with overlay
                    <div className="relative w-full max-w-4xl px-4 select-none">
                      {/* Cover image preview */}
                      {(coverImageUrl || imageUrl) && (
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl select-none">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={coverImageUrl || imageUrl}
                            alt="Cover preview"
                            className="w-full h-auto opacity-40 select-none pointer-events-none"
                          />
                          
                          {/* Overlay button */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 cursor-default select-none">
                            <button
                              onClick={() => {
                                console.log('Generate video button clicked!', { onGenerateVideo, coverImageUrl, imageUrl });
                                onGenerateVideo?.();
                              }}
                              className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/30 hover:border-white/40 transition-all hover:scale-105 cursor-pointer select-none"
                            >
                              <VideoIcon className="w-5 h-5 text-white" />
                              <span className="text-white text-lg font-semibold select-none">Generate Cover Video</span>
                            </button>
                            <p className="text-white/70 text-sm text-center px-4 pointer-events-none select-none">
                              Create a 6-second looping animation from this image
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Time estimate below */}
                      <p className="text-white/50 text-xs text-center mt-4 pointer-events-none select-none">
                        This will take approximately 90 seconds
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // Normal media display
              <motion.div
                  key={activeTab}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                className="relative flex items-center justify-center"
                style={{
                    transform: isVideo ? 'none' : `scale(${scale})`,
                    transition: isVideo ? 'none' : 'transform 0.2s ease-out',
                  transformOrigin: 'center center',
                }}
                >
                  {isVideo ? (
                    videoUrl || imageUrl ? (
                      <div className="flex flex-col items-center gap-4">
                        <video
                          src={videoUrl || imageUrl}
                          autoPlay
                          loop
                          controls
                          playsInline
                          className="max-w-full max-h-full w-auto h-auto rounded-lg shadow-2xl"
                          style={{
                            maxHeight: 'calc(100vh - 280px)',
                            maxWidth: 'calc(100vw - 32px)',
                          }}
                        />
                        {/* Video action buttons */}
                        {videoUrl && (onRemoveVideo || onGenerateVideo) && (
                          <div className="flex gap-3">
                            {onGenerateVideo && (
                              <button
                                onClick={onGenerateVideo}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all text-white text-sm font-medium"
                              >
                                <RotateCcw className="w-4 h-4" />
                                Regenerate Video
                              </button>
                            )}
                            {onRemoveVideo && (
                              <button
                                onClick={onRemoveVideo}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 backdrop-blur-sm border border-red-500/20 hover:border-red-500/30 transition-all text-red-400 hover:text-red-300 text-sm font-medium"
                              >
                                <Trash2 className="w-4 h-4" />
                                Remove Video
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ) : null
                  ) : (
                    coverImageUrl || imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={coverImageUrl || imageUrl}
                  alt={alt}
                  className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl"
                  style={{
                    maxHeight: 'calc(100vh - 200px)',
                    maxWidth: 'calc(100vw - 32px)',
                  }}
                />
                    ) : null
                  )}
              </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-black/50 text-center">
              <p className="text-white text-sm">{alt}</p>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

