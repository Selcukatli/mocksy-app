'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import ScreenshotLightbox from '@/components/ScreenshotLightbox';

interface GenerationProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  appIcon?: string;
  appName?: string;
  appDescription?: string;
  screenUrls?: string[];
  screensGenerated?: number;
  totalScreens?: number;
  onViewApp: () => void;
}

export default function GenerationProgressModal({
  isOpen,
  appIcon,
  appName,
  appDescription,
  screenUrls = [],
  totalScreens = 5,
  onViewApp,
}: GenerationProgressModalProps) {
  const isComplete = screenUrls.length >= totalScreens;
  const hasIcon = !!appIcon;
  const hasDetails = !!appName && appName !== 'Generating...';
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {isComplete ? "App Generation Complete" : "Generating Your App"}
          </DialogTitle>
        </DialogHeader>

        {/* Status Banner - Top of modal */}
        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 mb-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      Your app is ready!
                    </p>
                    <p className="text-xs text-green-600/80 dark:text-green-400/80">
                      Click below to start customizing.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={onViewApp}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  View app
                </Button>
              </div>
            </motion.div>
          ) : !hasDetails ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-4"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary animate-pulse flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Generating your app...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This takes about 30-60 seconds. Watch as it comes to life.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="loading-screens"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 mb-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Generating screenshots...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {screenUrls.length} of {totalScreens} complete
                    </p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-blue-500/10">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(screenUrls.length / totalScreens) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6 py-2">
          {/* App Header - Icon + Name + Subtitle */}
          <div className="flex items-center gap-4">
            {/* App Icon */}
            <div className="relative h-24 w-24 flex-shrink-0 rounded-[22%] overflow-hidden bg-muted/20">
              {hasIcon && appIcon ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="h-full w-full"
                >
                  <Image
                    src={appIcon}
                    alt="App icon"
                    fill
                    className="object-cover"
                  />
                </motion.div>
              ) : (
                <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50 p-5">
                  <div className="h-full w-full rounded-xl bg-muted-foreground/20" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/30 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              )}
            </div>

            {/* App Name + Category */}
            <div className="flex-1 space-y-1">
              {hasDetails ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-1"
                >
                  <h2 className="text-3xl font-bold text-foreground leading-tight">
                    {appName}
                  </h2>
                  <p className="text-base text-muted-foreground">
                    {appDescription?.split('.')[0] || 'Generating details...'}
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-2.5">
                  <div className="relative h-9 w-56 overflow-hidden rounded-md bg-muted">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/25 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                  <div className="relative h-5 w-40 overflow-hidden rounded-md bg-muted">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/25 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear', delay: 0.15 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            {hasDetails ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="space-y-2"
              >
                <p className={`text-sm leading-relaxed text-muted-foreground ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
                  {appDescription}
                </p>
                {appDescription && appDescription.length > 150 && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    {isDescriptionExpanded ? (
                      <>
                        See less <ChevronUp className="h-3 w-3" />
                      </>
                    ) : (
                      <>
                        See more <ChevronDown className="h-3 w-3" />
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-2.5">
                <div className="relative h-4 w-full overflow-hidden rounded-md bg-muted">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/25 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
                <div className="relative h-4 w-[98%] overflow-hidden rounded-md bg-muted">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/25 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear', delay: 0.1 }}
                  />
                </div>
                <div className="relative h-4 w-[85%] overflow-hidden rounded-md bg-muted">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/25 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear', delay: 0.2 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Screenshots Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Preview</h3>
              <span className="text-xs text-muted-foreground">
                {screenUrls.length} of {totalScreens} screenshots
              </span>
            </div>

            {/* Screenshot Grid */}
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: totalScreens }).map((_, index) => {
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
                    className="relative aspect-[9/19.5] overflow-hidden rounded-lg border bg-background shadow-sm"
                  >
                    {screenUrl ? (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="relative h-full w-full cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setLightboxImage(screenUrl)}
                      >
                        <Image
                          src={screenUrl}
                          alt={`Screenshot ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </motion.button>
                    ) : (
                      <div className="relative h-full w-full">
                        {/* Animated gradient background */}
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-br ${gradientClass} blur-xl`}
                          animate={{
                            scale: [1, 1.3, 1],
                            rotate: [0, 10, -10, 0],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />

                        {/* Shimmer effect - more visible */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent"
                          animate={{
                            x: ['-100%', '200%'],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />

                        {/* Content skeleton */}
                        <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 p-4 backdrop-blur-sm">
                          <motion.div
                            className="h-16 w-16 rounded-lg bg-white/40 dark:bg-white/20"
                            animate={{
                              scale: [1, 1.1, 1],
                              opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                          <div className="space-y-1.5 w-full">
                            <motion.div
                              className="h-2 w-full rounded bg-white/40 dark:bg-white/20"
                              animate={{
                                opacity: [0.5, 0.8, 0.5],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.2,
                              }}
                            />
                            <motion.div
                              className="h-2 w-4/5 mx-auto rounded bg-white/40 dark:bg-white/20"
                              animate={{
                                opacity: [0.5, 0.8, 0.5],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.4,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </DialogContent>

      {/* Screenshot Lightbox */}
      <ScreenshotLightbox
        imageUrl={lightboxImage}
        onClose={() => setLightboxImage(null)}
        alt="App screenshot preview"
      />
    </Dialog>
  );
}
