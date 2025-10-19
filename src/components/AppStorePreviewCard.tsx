'use client';

import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Share, Sparkles, Edit3, ImagePlus, ChevronLeft, ChevronRight, Video, Loader2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Id } from '@convex/_generated/dataModel';
import ScreenshotLightbox from '@/components/ScreenshotLightbox';
import { useDominantColor } from '@/hooks/useDominantColor';

interface AppStorePreviewCardProps {
  app: {
    _id: Id<'apps'>;
    name: string;
    description?: string;
    category?: string;
    iconUrl?: string;
    coverImageUrl?: string;
    coverVideoUrl?: string;
  };
  creator?: {
    username?: string;
    imageUrl?: string;
  };
  screens: Array<{
    _id: Id<'appScreens'>;
    name: string;
    screenUrl?: string;
  }>;
  totalScreens: number;
  isLoading?: boolean;
  onShare?: () => void;
  isAdmin?: boolean;
  onGenerateCover?: () => void;
  onGenerateVideo?: () => void;
  onRemoveVideo?: () => void;
  isGeneratingVideo?: boolean;
  isImprovingDescription?: boolean;
  improveDescriptionSlot?: React.ReactNode; // Slot for rendering the improve description popover
  isImprovePopoverOpen?: boolean; // Track if popover is open to control hover state
  adminActionsSlot?: React.ReactNode; // Slot for rendering admin actions
}

export default function AppStorePreviewCard({
  app,
  creator,
  screens,
  totalScreens,
  isLoading = false,
  onShare,
  isAdmin = false,
  onGenerateCover,
  onGenerateVideo,
  onRemoveVideo,
  isGeneratingVideo = false,
  isImprovingDescription = false,
  improveDescriptionSlot,
  isImprovePopoverOpen = false,
  adminActionsSlot,
}: AppStorePreviewCardProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null);
  const [showCoverMenu, setShowCoverMenu] = useState(false);
  const [isDescriptionHovered, setIsDescriptionHovered] = useState(false);
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const screenUrls = screens.map(s => s.screenUrl).filter((url): url is string => !!url);
  const hasIcon = !!app.iconUrl;
  const hasDetails = !!app.name && app.name !== 'Generating...';
  
  // Extract dominant color from cover image for dynamic blending
  const { color: dominantColor, isLight: isLightBackground } = useDominantColor(app.coverImageUrl);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCoverMenu(false);
      }
    };

    if (showCoverMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCoverMenu]);

  // Check scroll position and update chevron visibility
  const checkScrollPosition = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  // Function to scroll to a specific screenshot
  const scrollToScreenshot = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const screenshotWidth = container.scrollWidth / screenUrls.length;
    container.scrollTo({
      left: screenshotWidth * index,
      behavior: 'smooth',
    });
    setCurrentScreenshotIndex(index);
  };

  // Navigate to previous screenshot
  const handlePrevious = () => {
    const newIndex = currentScreenshotIndex > 0 ? currentScreenshotIndex - 1 : 0;
    scrollToScreenshot(newIndex);
  };

  // Navigate to next screenshot
  const handleNext = () => {
    const newIndex = currentScreenshotIndex < screenUrls.length - 1 ? currentScreenshotIndex + 1 : screenUrls.length - 1;
    scrollToScreenshot(newIndex);
  };

  // Add scroll event listener to check position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollPosition();
    container.addEventListener('scroll', checkScrollPosition);
    
    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
    };
  }, [screenUrls, checkScrollPosition]);

  return (
    <>
      <div className="w-full rounded-2xl border bg-card shadow-sm overflow-hidden">
        {/* Admin Banner for Missing Cover */}
        {isAdmin && !app.coverVideoUrl && !app.coverImageUrl && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImagePlus className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                No cover image
              </p>
            </div>
            <button
              onClick={onGenerateCover}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generate
            </button>
          </div>
        )}
        
        <div className="p-6 md:p-8 space-y-6">
          {/* Card Header - Creator and Actions */}
          <div className="flex items-center justify-between gap-4">
            {/* Creator Info */}
            {creator && (
              <div className="flex items-center gap-2">
                {creator.imageUrl && (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={creator.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Created by</p>
                  <p className="text-sm font-medium">{creator.username || 'Developer'}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {(onShare || adminActionsSlot) && (
              <div className="flex items-center gap-2">
                {adminActionsSlot}
                {onShare && (
                  <button
                    onClick={onShare}
                    className="px-3 py-2 text-sm rounded-lg border hover:bg-muted/50 transition-colors flex items-center gap-1.5"
                  >
                    <Share className="h-3.5 w-3.5" />
                    Share
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Cover Image with Integrated App Header */}
          {(app.coverVideoUrl || app.coverImageUrl) ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-xl overflow-hidden shadow-md group relative"
              style={{
                background: dominantColor || 'rgba(0, 0, 0, 0.85)',
              }}
            >
              {/* Admin Edit Overlay - Only show on hover when admin and not generating video */}
              {isAdmin && !isGeneratingVideo && (
                <>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 z-10 pointer-events-none" />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                      <div className="relative" ref={menuRef}>
                        {/* Popover Menu */}
                        {showCoverMenu ? (
                          <div className="absolute top-0 right-0 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-10">
                            <button
                              onClick={() => {
                                setShowCoverMenu(false);
                                onGenerateCover?.();
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                            >
                              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Generate New Cover</span>
                            </button>
                            {app.coverImageUrl && (
                              <button
                                onClick={() => {
                                  setShowCoverMenu(false);
                                  onGenerateVideo?.();
                                }}
                                disabled={isGeneratingVideo}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isGeneratingVideo ? (
                                  <Loader2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400 animate-spin" />
                                ) : (
                                  <Video className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                                )}
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {isGeneratingVideo ? 'Generating...' : app.coverVideoUrl ? 'Regenerate Cover Video' : 'Generate Cover Video'}
                                </span>
                              </button>
                            )}
                            {app.coverVideoUrl && (
                              <button
                                onClick={() => {
                                  setShowCoverMenu(false);
                                  onRemoveVideo?.();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                              >
                                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Remove Cover Video</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setShowCoverMenu(false);
                                // onEditWithAI?.(); // Coming later
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left opacity-50 cursor-not-allowed"
                            >
                              <Edit3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Edit with AI</span>
                              <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">Soon</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowCoverMenu(true)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm transition-colors ${
                              isLightBackground
                                ? 'bg-gray-900/95 hover:bg-gray-900 text-white'
                                : 'bg-white/95 hover:bg-white text-gray-900'
                            }`}
                          >
                            <Sparkles className="h-4 w-4" />
                            <span className="text-sm font-medium">Edit with AI</span>
                          </button>
                        )}
                      </div>
                    </div>
                </>
              )}
              
              {/* Cover Media (Video or Image) - fades to transparent at bottom */}
              <div className="relative w-full aspect-[2/1]">
                {app.coverVideoUrl ? (
                  /* Cover Video */
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ opacity: { duration: 0.6 } }}
                    className="absolute inset-0"
                    style={{
                      maskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
                    }}
                  >
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    >
                      <source src={app.coverVideoUrl} type="video/mp4" />
                    </video>
                  </motion.div>
                ) : (
                  /* Cover Image */
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1,
                      scale: [1, 1.15, 1],
                      x: [0, 20, 0],
                    }}
                    transition={{ 
                      opacity: { duration: 0.6 },
                      scale: { 
                        duration: 25, 
                        repeat: Infinity, 
                        ease: "linear",
                        delay: 0.6 
                      },
                      x: { 
                        duration: 25, 
                        repeat: Infinity, 
                        ease: "linear",
                        delay: 0.6 
                      },
                    }}
                    className="absolute inset-0"
                    style={{
                      maskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
                    }}
                  >
                    <Image
                      src={app.coverImageUrl!}
                      alt={`${app.name} cover image`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 896px"
                      unoptimized
                    />
                  </motion.div>
                )}
              </div>
              
              {/* App info positioned at card bottom - higher z-index to stay above loading overlay */}
              <div className="relative p-4 md:p-6 flex items-center gap-4 -mt-12 z-50">
                {/* App Icon - Smaller size with border and elevation */}
                <div className="relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 rounded-[22%] overflow-hidden bg-white shadow-2xl ring-2 ring-white/30">
                  {hasIcon && app.iconUrl ? (
                    <Image
                      src={app.iconUrl}
                      alt="App icon"
                      fill
                      className="object-cover"
                      sizes="80px"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                      <span className="text-2xl md:text-3xl font-bold text-primary">
                        {app.name?.charAt(0).toUpperCase() || 'A'}
                      </span>
                    </div>
                  )}
                </div>

                {/* App Title & Category - Smaller text */}
                <div className="flex-1 min-w-0">
                  {hasDetails ? (
                    <div className="space-y-0.5">
                      <h1 className={`text-2xl md:text-3xl font-bold drop-shadow-lg truncate ${isLightBackground ? 'text-gray-900' : 'text-white'}`}>
                        {app.name}
                      </h1>
                      {app.category && (
                        <p className={`text-sm md:text-base font-medium uppercase tracking-wide drop-shadow ${isLightBackground ? 'text-gray-800' : 'text-white/90'}`}>
                          {app.category}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className={`h-6 w-40 rounded animate-pulse ${isLightBackground ? 'bg-gray-900/20' : 'bg-white/20'}`} />
                      <div className={`h-4 w-20 rounded animate-pulse ${isLightBackground ? 'bg-gray-900/20' : 'bg-white/20'}`} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            /* Fallback: Traditional Header Layout when no cover image */
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
              {/* App Icon */}
              <div className="relative h-20 w-20 flex-shrink-0 rounded-[22%] overflow-hidden bg-muted/15 shadow-lg md:h-24 md:w-24">
                {hasIcon && app.iconUrl ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{ position: 'relative' }}
                    className="h-full w-full"
                  >
                    <Image
                      src={app.iconUrl}
                      alt="App icon"
                      fill
                      className="object-cover"
                      sizes="96px"
                      unoptimized
                    />
                  </motion.div>
                ) : (
                  <div className="relative h-full w-full overflow-hidden">
                    {isLoading ? (
                      <>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-muted/70 via-muted/40 to-muted/70"
                          animate={{ opacity: [0.6, 0.85, 0.6], scale: [1, 1.03, 1] }}
                          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/20 to-transparent"
                          animate={{ x: ['-120%', '220%'] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                        />
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                        <span className="text-2xl font-bold text-primary">
                          {app.name?.charAt(0).toUpperCase() || 'A'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* App Title & Category */}
              <div className="flex-1 w-full">
                {hasDetails ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-1"
                  >
                    <h1 className="text-3xl font-bold text-foreground">
                      {app.name}
                    </h1>
                    {app.category && (
                      <p className="text-sm text-primary font-medium uppercase tracking-wide">
                        {app.category}
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative h-10 w-64 overflow-hidden rounded-lg bg-muted">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/20 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>
                    <div className="relative h-5 w-40 overflow-hidden rounded-md bg-muted">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/20 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 0.2 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {hasDetails && app.description && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="space-y-2"
            >
              <div 
                className="relative group"
                onMouseEnter={() => isAdmin && !isImprovePopoverOpen && setIsDescriptionHovered(true)}
                onMouseLeave={() => !isImprovePopoverOpen && setIsDescriptionHovered(false)}
              >
                {/* Hover background + outline for admin - hide when popover is open */}
                {isAdmin && isDescriptionHovered && !isImprovePopoverOpen && (
                  <div className="absolute -inset-3 border border-primary/20 bg-primary/5 rounded-lg pointer-events-none" />
                )}
                
                {/* Edit with AI button with popover - keep rendered but hide visually when popover is open */}
                {isAdmin && improveDescriptionSlot && (
                  <div className={`absolute -top-2 -right-2 z-20 ${!isDescriptionHovered || isImprovePopoverOpen ? 'opacity-0 pointer-events-none' : ''}`}>
                    {improveDescriptionSlot}
                  </div>
                )}
                
                <p className={`text-base leading-relaxed text-muted-foreground whitespace-pre-line ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
                  {app.description}
                </p>
                
                {/* Shimmer overlay during processing - always show when improving, regardless of hover */}
                {isImprovingDescription && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer pointer-events-none rounded-lg z-10" />
                )}
              </div>
              {app.description.length > 200 && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  {isDescriptionExpanded ? (
                    <>
                      Show less <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      See more <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </motion.div>
          )}

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Preview</h2>
              <span className="text-sm text-muted-foreground">
                {isLoading && screenUrls.length === 0 
                  ? 'Generating screenshots...' 
                  : `${screenUrls.length} ${screenUrls.length === 1 ? 'screenshot' : 'screenshots'}`
                }
              </span>
            </div>

            {/* Large Sticky Screenshot Carousel */}
            <div className="sticky top-16 z-10">
              <div className="relative">
                {/* Previous Button */}
                {screenUrls.length > 1 && canScrollLeft && (
                  <button
                    onClick={handlePrevious}
                    className="absolute -left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-background/30 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center hover:bg-background/50 hover:scale-105 transition-all"
                    aria-label="Previous screenshot"
                  >
                    <ChevronLeft className="h-6 w-6 opacity-70" />
                  </button>
                )}

                {/* Next Button */}
                {screenUrls.length > 1 && canScrollRight && (
                  <button
                    onClick={handleNext}
                    className="absolute -right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-background/30 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center hover:bg-background/50 hover:scale-105 transition-all"
                    aria-label="Next screenshot"
                  >
                    <ChevronRight className="h-6 w-6 opacity-70" />
                  </button>
                )}

                <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                  <div className="flex gap-6 pb-2">
                    {Array.from({ length: Math.max(totalScreens, screenUrls.length, isLoading ? 5 : 0) }).map((_, index) => {
                      const screenUrl = screenUrls[index];
                      const colors = [
                        'from-blue-500/20 via-purple-500/20 to-pink-500/20',
                        'from-green-500/20 via-teal-500/20 to-cyan-500/20',
                        'from-orange-500/20 via-red-500/20 to-rose-500/20',
                        'from-violet-500/20 via-indigo-500/20 to-blue-500/20',
                        'from-amber-500/20 via-yellow-500/20 to-lime-500/20',
                      ];
                      const gradientClass = colors[index % colors.length];

                      return (
                        <div
                          key={index}
                          className="relative aspect-[9/19.5] w-[50vw] sm:w-[38vw] md:w-[200px] lg:w-[220px] flex-shrink-0 snap-center overflow-hidden rounded-2xl border-2 bg-background shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-[1.02]"
                        >
                        {screenUrl ? (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            style={{ position: 'relative' }}
                            className="h-full w-full cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => {
                              const lightboxIndex = screenUrls.findIndex(url => url === screenUrl);
                              if (lightboxIndex === -1) return;
                              setLightboxImageIndex(lightboxIndex);
                            }}
                          >
                            <Image
                              src={screenUrl}
                              alt={`Screenshot ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 38vw, 220px"
                              unoptimized
                            />
                          </motion.button>
                        ) : isLoading ? (
                          <div className="relative h-full w-full">
                            <motion.div
                              className={`absolute inset-0 bg-gradient-to-br ${gradientClass} blur-xl`}
                              animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 5, -5, 0],
                              }}
                              transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                            />
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/15 to-transparent"
                              animate={{ x: ['-100%', '200%'] }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                            />
                            <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 p-3 backdrop-blur-sm">
                              <motion.div
                                className="h-12 w-12 rounded-lg bg-muted-foreground/25"
                                animate={{
                                  scale: [1, 1.1, 1],
                                  opacity: [0.4, 0.7, 0.4],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: 'easeInOut',
                                }}
                              />
                              <div className="space-y-1 w-full">
                                <motion.div
                                  className="h-1.5 w-full rounded bg-muted-foreground/25"
                                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    delay: 0.2,
                                  }}
                                />
                                <motion.div
                                  className="h-1.5 w-3/4 mx-auto rounded bg-muted-foreground/25"
                                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    delay: 0.4,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
              </div>
              
              {/* Interactive Scroll Indicator Dots */}
              {screenUrls.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {screenUrls.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => scrollToScreenshot(index)}
                      className={`rounded-full transition-all ${
                        currentScreenshotIndex === index
                          ? 'w-8 h-2 bg-primary'
                          : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                      aria-label={`Go to screenshot ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
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

      {/* Screenshot Lightbox */}
      {lightboxImageIndex !== null && (
        <ScreenshotLightbox
          imageUrl={null}
          onClose={() => setLightboxImageIndex(null)}
          alt="App screenshot preview"
          allImages={screenUrls}
          initialIndex={lightboxImageIndex}
        />
      )}
    </>
  );
}
