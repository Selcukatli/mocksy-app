'use client';

import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Share, Sparkles, Edit3, ImagePlus } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
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
  onCreateYourOwn?: () => void;
  isAdmin?: boolean;
  onGenerateCover?: () => void;
}

export default function AppStorePreviewCard({
  app,
  creator,
  screens,
  totalScreens,
  isLoading = false,
  onShare,
  onCreateYourOwn,
  isAdmin = false,
  onGenerateCover,
}: AppStorePreviewCardProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null);
  const [showCoverMenu, setShowCoverMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Extract dominant color from cover image for dynamic blending
  const { color: dominantColor } = useDominantColor(app.coverImageUrl);

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

  const screenUrls = screens.map(s => s.screenUrl).filter((url): url is string => !!url);
  const hasIcon = !!app.iconUrl;
  const hasDetails = !!app.name && app.name !== 'Generating...';

  return (
    <>
      <div className="w-full rounded-2xl border bg-card shadow-sm overflow-hidden">
        {/* Admin Banner for Missing Cover */}
        {isAdmin && !app.coverImageUrl && (
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
            {(onShare || onCreateYourOwn) && (
              <div className="flex items-center gap-2">
                {onShare && (
                  <button
                    onClick={onShare}
                    className="px-3 py-2 text-sm rounded-lg border hover:bg-muted/50 transition-colors flex items-center gap-1.5"
                  >
                    <Share className="h-3.5 w-3.5" />
                    Share
                  </button>
                )}
                {onCreateYourOwn && (
                  <button
                    onClick={onCreateYourOwn}
                    className="px-3 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Remix
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Cover Image with Integrated App Header */}
          {app.coverImageUrl ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-xl overflow-hidden shadow-md group relative"
              style={{
                background: dominantColor || 'rgba(0, 0, 0, 0.85)',
              }}
            >
              {/* Admin Edit Overlay - Only show on hover when admin - covers entire card */}
              {isAdmin && (
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
                            className="flex items-center gap-2 px-3 py-2 bg-white/95 hover:bg-white text-gray-900 rounded-lg shadow-lg backdrop-blur-sm transition-colors"
                          >
                            <Sparkles className="h-4 w-4" />
                            <span className="text-sm font-medium">Edit with AI</span>
                          </button>
                        )}
                      </div>
                    </div>
                </>
              )}
              
              {/* Cover Image - fades to transparent at bottom */}
              <div className="relative w-full aspect-video">
                <div 
                  className="absolute inset-0"
                  style={{
                    maskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
                  }}
                >
                  <Image
                    src={app.coverImageUrl}
                    alt={`${app.name} cover image`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 896px"
                    unoptimized
                  />
                </div>
              </div>
              
              {/* App info positioned at card bottom */}
              <div className="relative p-6 md:p-8 flex items-center gap-5 -mt-16">
                {/* App Icon - Larger size with border and elevation */}
                <div className="relative h-24 w-24 md:h-28 md:w-28 flex-shrink-0 rounded-[22%] overflow-hidden bg-white shadow-2xl ring-2 ring-white/30">
                  {hasIcon && app.iconUrl ? (
                    <Image
                      src={app.iconUrl}
                      alt="App icon"
                      fill
                      className="object-cover"
                      sizes="112px"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                      <span className="text-3xl md:text-4xl font-bold text-primary">
                        {app.name?.charAt(0).toUpperCase() || 'A'}
                      </span>
                    </div>
                  )}
                </div>

                {/* App Title & Category - Larger text */}
                <div className="flex-1 min-w-0">
                  {hasDetails ? (
                    <div className="space-y-1">
                      <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg truncate">
                        {app.name}
                      </h1>
                      {app.category && (
                        <p className="text-base md:text-lg text-white/90 font-medium uppercase tracking-wide drop-shadow">
                          {app.category}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="h-8 w-48 bg-white/20 rounded animate-pulse" />
                      <div className="h-5 w-24 bg-white/20 rounded animate-pulse" />
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
              <p className={`text-base leading-relaxed text-muted-foreground ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
                {app.description}
              </p>
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
                {screenUrls.length} {screenUrls.length === 1 ? 'screenshot' : 'screenshots'}
              </span>
            </div>

            {/* Screenshot Carousel - Mobile friendly with 1.5 screens visible */}
            <div className="relative sm:-mx-6 md:mx-0">
              <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                <div className="flex gap-4 pb-4 sm:pl-6 lg:grid lg:grid-cols-5 lg:gap-4 lg:pl-0">
                  {Array.from({ length: Math.max(totalScreens, screenUrls.length) }).map((_, index) => {
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
                        className="relative aspect-[9/19.5] w-[60vw] flex-shrink-0 snap-center overflow-hidden rounded-xl border bg-background shadow-md hover:shadow-lg transition-shadow scroll-ml-6 sm:scroll-ml-6 lg:w-auto lg:flex-shrink"
                      >
                        {screenUrl ? (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            style={{ position: 'relative' }}
                            className="h-full w-full cursor-pointer hover:opacity-90 transition-opacity"
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
                              sizes="(max-width: 768px) 60vw, 15vw"
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
