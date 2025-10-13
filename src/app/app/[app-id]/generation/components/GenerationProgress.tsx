'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Id } from '@convex/_generated/dataModel';
import AppStorePreviewCard from '@/components/AppStorePreviewCard';

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
  status: 'pending' | 'downloading_images' | 'generating_structure' | 'generating_concept' | 'generating_icon' | 'generating_screens' | 'completed' | 'failed' | 'partial';
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

  const totalScreens = jobStatus?.screensTotal || 5;
  const screenUrls = appStatus.screens.map(s => s.screenUrl).filter((url): url is string => !!url);

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
      if (jobStatus.status === 'generating_structure') return 'designing'; // Planning app structure
      if (jobStatus.status === 'generating_icon') return 'designing';
      if (jobStatus.status === 'downloading_images') return 'app_details'; // Downloading concept images
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

      {/* App Store Preview Card */}
      <AppStorePreviewCard
        app={appStatus.app}
        screens={appStatus.screens}
        totalScreens={totalScreens}
        isLoading={stage !== 'complete'}
      />
    </div>
  );
}
