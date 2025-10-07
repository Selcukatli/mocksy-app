'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Id } from '@/../convex/_generated/dataModel';
import ScreenshotLightbox from '@/components/ScreenshotLightbox';

type GenerationStage =
  | 'initializing'      // No data yet
  | 'app_details'       // Has name/description but no icon
  | 'designing'         // Has icon but no screens
  | 'first_screen'      // Has 1 screen
  | 'remaining_screens' // Has 2+ screens but not all
  | 'complete';         // All screens done

interface AppStatus {
  app: {
    _id: Id<'apps'>;
    name: string;
    description?: string;
    category?: string;
    iconStorageId?: Id<'_storage'>;
    iconUrl?: string;
  };
  screens: Array<{
    _id: Id<'appScreens'>;
    name: string;
    screenUrl?: string;
  }>;
  totalScreens: number;
}

type JobStatus = {
  _id: Id<'appGenerationJobs'>;
  appId: Id<'apps'>;
  status: 'pending' | 'generating_concept' | 'generating_icon' | 'generating_screens' | 'completed' | 'failed' | 'partial';
  currentStep: string;
  screensGenerated: number;
  screensTotal: number;
  failedScreens?: Array<{ screenName: string; errorMessage: string }>;
  error?: string;
  createdAt: number;
  updatedAt: number;
} | null | undefined;

interface GenerationProgressProps {
  appStatus: AppStatus;
  jobStatus: JobStatus;
  appId: Id<'apps'>;
}

export default function GenerationProgress({ appStatus, jobStatus, appId }: GenerationProgressProps) {
  const router = useRouter();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isSubtitleExpanded, setIsSubtitleExpanded] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null);

  const totalScreens = jobStatus?.screensTotal || 5;
  const screenUrls = appStatus.screens.map(s => s.screenUrl).filter((url): url is string => !!url);

  useEffect(() => {
    setLightboxImageIndex((current) => {
      if (current === null) return current;
      if (screenUrls.length === 0) return null;
      if (current < 0) return 0;
      if (current >= screenUrls.length) return screenUrls.length - 1;
      return current;
    });
  }, [screenUrls.length]);

  // Determine current stage based on job status (preferred) or infer from data
  const getCurrentStage = (): GenerationStage => {
    // If we have job status, use it for accurate stage determination
    if (jobStatus) {
      if (jobStatus.status === 'completed') return 'complete';
      if (jobStatus.status === 'failed') return 'complete'; // Show as complete with error
      if (jobStatus.status === 'partial') return 'complete'; // Show as complete with partial error
      if (jobStatus.status === 'generating_screens') {
        const screenCount = jobStatus.screensGenerated;
        if (screenCount >= 2) return 'remaining_screens';
        if (screenCount === 1) return 'first_screen';
        return 'designing'; // About to generate first screen
      }
      if (jobStatus.status === 'generating_icon') return 'designing';
      if (jobStatus.status === 'generating_concept') return 'app_details';
      if (jobStatus.status === 'pending') return 'initializing';
    }

    // Fallback: infer from data (for legacy apps without job tracking)
    const hasDetails = !!appStatus.app.name && appStatus.app.name !== 'Generating...';
    const hasIcon = !!appStatus.app.iconUrl;
    const screenCount = screenUrls.length;

    if (screenCount >= totalScreens) return 'complete';
    if (screenCount >= 2) return 'remaining_screens';
    if (screenCount === 1) return 'first_screen';
    if (hasIcon) return 'designing';
    if (hasDetails) return 'app_details';
    return 'initializing';
  };

  const stage = getCurrentStage();
  const hasIcon = !!appStatus.app.iconUrl;
  const hasDetails = !!appStatus.app.name && appStatus.app.name !== 'Generating...';

  // Calculate overall progress percentage
  const getProgressPercentage = (): number => {
    // If we have job status with screen counts, use it for accurate progress
    if (jobStatus && jobStatus.status === 'generating_screens' && jobStatus.screensTotal > 0) {
      // 40% for setup (concept + icon), 60% for screens
      return 40 + (60 * (jobStatus.screensGenerated / jobStatus.screensTotal));
    }

    // Fallback to stage-based progress
    switch (stage) {
      case 'initializing':
        return 0;
      case 'app_details':
        return 15;
      case 'designing':
        return 30;
      case 'first_screen':
        return 40;
      case 'remaining_screens':
        return 40 + (60 * (screenUrls.length / totalScreens));
      case 'complete':
        return 100;
      default:
        return 0;
    }
  };

  const progressPercentage = getProgressPercentage();

  // Get status message from job if available
  const getStatusMessage = (): string => {
    if (jobStatus?.currentStep) {
      return jobStatus.currentStep;
    }

    // Fallback messages based on stage
    switch (stage) {
      case 'initializing':
        return 'Starting generation...';
      case 'app_details':
        return 'Creating app identity...';
      case 'designing':
        return 'Planning app structure...';
      case 'first_screen':
        return 'First screen designed!';
      case 'remaining_screens':
        return `Matching style from first screen... (${screenUrls.length}/${totalScreens})`;
      case 'complete':
        return 'Your app is ready!';
      default:
        return 'Generating...';
    }
  };

  const statusMessage = getStatusMessage();

  const handleViewApp = () => {
    router.push(`/app/${appId}`);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 min-w-0">
      {/* Status Banner */}
      <div className="sticky top-4 z-30">
        <AnimatePresence mode="wait">
          {stage === 'complete' && jobStatus?.status === 'failed' ? (
            <motion.div
              key="failed"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 mb-8 backdrop-blur-md"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                    <Sparkles className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-semibold text-red-700 dark:text-red-400">
                      Generation Failed
                    </p>
                    <p className="text-sm text-red-600/80 dark:text-red-400/80">
                      {jobStatus.error || 'An error occurred during generation'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleViewApp}
                  size="lg"
                  variant="outline"
                  className="w-full lg:w-auto"
                >
                  View Partial Results
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ) : stage === 'complete' && jobStatus?.status === 'partial' ? (
            <motion.div
              key="partial"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-6 mb-8 backdrop-blur-md"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
                    <Sparkles className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-semibold text-amber-700 dark:text-amber-400">
                      Partially Complete
                    </p>
                    <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                      {jobStatus.screensGenerated} of {jobStatus.screensTotal} screens generated successfully.
                      {jobStatus.failedScreens && jobStatus.failedScreens.length > 0 && (
                        <> {jobStatus.failedScreens.length} screen(s) failed.</>
                      )}
                    </p>
                    {jobStatus.failedScreens && jobStatus.failedScreens.length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer hover:underline">
                          View failed screens
                        </summary>
                        <ul className="mt-2 space-y-1 text-xs">
                          {jobStatus.failedScreens.map((failed, idx) => (
                            <li key={idx} className="pl-2 border-l-2 border-amber-500/30">
                              <span className="font-medium">{failed.screenName}:</span> {failed.errorMessage}
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleViewApp}
                  size="lg"
                  className="w-full lg:w-auto bg-amber-600 hover:bg-amber-700 text-white"
                >
                  View App
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ) : stage === 'complete' ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-green-500/20 bg-green-500/10 p-6 mb-8 backdrop-blur-md"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3 lg:items-center lg:gap-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                    <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                    Your app is ready!
                  </p>
                  <p className="text-sm text-green-600/80 dark:text-green-400/80">
                    All screenshots have been generated. Click below to start customizing.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleViewApp}
                size="lg"
                className="w-full lg:w-auto bg-green-600 hover:bg-green-700 text-white"
              >
                View App
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ) : stage === 'initializing' ? (
          <motion.div
            key="initializing"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-primary/20 bg-primary/5 p-6 mb-8 backdrop-blur-md"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                  <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-foreground">
                    {statusMessage}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Analyzing your idea and creating the app concept.
                  </p>
                </div>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/10">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>
        ) : stage === 'app_details' ? (
          <motion.div
            key="app-details"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-6 mb-8 backdrop-blur-md"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20">
                  <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400 animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-foreground">
                    {statusMessage}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Designing icon and visual style.
                  </p>
                </div>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-purple-500/10">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>
        ) : stage === 'designing' ? (
          <motion.div
            key="designing"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 mb-8 backdrop-blur-md"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
                  <Sparkles className="h-6 w-6 text-amber-600 dark:text-amber-400 animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-foreground">
                    {statusMessage}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Designing screens, navigation, and layout.
                  </p>
                </div>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-amber-500/10">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>
        ) : stage === 'first_screen' ? (
          <motion.div
            key="first-screen"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-6 mb-8 backdrop-blur-md"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/20">
                  <Sparkles className="h-6 w-6 text-cyan-600 dark:text-cyan-400 animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-foreground">
                    {statusMessage}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Using it as a reference to create the remaining screens.
                  </p>
                </div>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-cyan-500/10">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-cyan-600 dark:from-cyan-400 dark:to-cyan-500"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="remaining-screens"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 mb-8 backdrop-blur-md"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
                  <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-foreground">
                    {statusMessage}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Using the first screen as a visual reference for consistency.
                  </p>
                </div>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-blue-500/10">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* App Store Style Preview */}
      <div className="w-full rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          {/* App Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
            {/* App Icon */}
            <div className="relative h-24 w-24 flex-shrink-0 rounded-[22%] overflow-hidden bg-muted/15 shadow-lg md:h-32 md:w-32">
              {hasIcon && appStatus.app.iconUrl ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  style={{ position: 'relative' }}
                  className="h-full w-full"
                >
                  <Image
                    src={appStatus.app.iconUrl}
                    alt="App icon"
                    fill
                    className="object-cover"
                    sizes="128px"
                    unoptimized
                  />
                </motion.div>
              ) : (
                <div className="relative h-full w-full overflow-hidden">
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
                </div>
              )}
            </div>

            {/* App Info */}
            <div className="flex-1 w-full space-y-2">
              {hasDetails ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-1"
                >
                  <h1 className="text-3xl font-bold text-foreground">
                    {appStatus.app.name}
                  </h1>
                  {appStatus.app.category && (
                    <p className="text-sm text-primary font-medium uppercase tracking-wide">
                      {appStatus.app.category}
                    </p>
                  )}
                  {appStatus.app.description && (
                    <div className="pt-1 space-y-1">
                      <p className={`text-base text-muted-foreground ${!isSubtitleExpanded ? 'line-clamp-3' : ''}`}>
                        {appStatus.app.description.split('.')[0]}.
                      </p>
                      {appStatus.app.description.split('.')[0].length > 100 && (
                        <button
                          onClick={() => setIsSubtitleExpanded(!isSubtitleExpanded)}
                          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                          {isSubtitleExpanded ? 'Show less' : 'See more'}
                        </button>
                      )}
                    </div>
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

          {/* Description */}
          <div className="space-y-2">
            {hasDetails && appStatus.app.description ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="space-y-2"
              >
                <p className={`text-base leading-relaxed text-muted-foreground ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
                  {appStatus.app.description}
                </p>
                {appStatus.app.description.length > 200 && (
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
                        Show more <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-2">
                {[100, 98, 85].map((width, i) => (
                  <div key={i} className={`relative h-4 overflow-hidden rounded-md bg-muted`} style={{ width: `${width}%` }}>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/20 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: i * 0.15 }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Preview</h2>
              <span className="text-sm text-muted-foreground">
                {screenUrls.length} of {totalScreens} screenshots
              </span>
            </div>

            {/* Screenshot Carousel - Mobile friendly with 1.5 screens visible */}
            <div className="relative sm:-mx-6 md:mx-0">
              <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                <div className="flex gap-4 pb-4 sm:pl-6 lg:grid lg:grid-cols-5 lg:gap-4 lg:pl-0">
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
                          sizes="(max-width: 768px) 20vw, 15vw"
                          unoptimized
                        />
                      </motion.button>
                    ) : (
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
                    )}
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
    </div>
  );
}
