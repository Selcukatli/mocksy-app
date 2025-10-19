'use client';

import { use, useEffect, useState, useCallback, useMemo } from 'react';
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Sparkles, Trash2, Settings, Eye, CheckCircle, Star, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AppStorePreviewCard from '@/components/AppStorePreviewCard';
import AppsInCategoryCarousel from '@/components/AppsInCategoryCarousel';
import ReviewsSection from '@/components/ReviewsSection';
import CoverImageSelectionModal from '@/components/CoverImageSelectionModal';
import GenerateVideoModal from '@/components/GenerateVideoModal';
import { motion } from 'framer-motion';
import { usePageHeader } from '@/components/RootLayoutContent';
import Toast from '@/components/Toast';
import { Skeleton } from '@/components/ui/skeleton';

interface PageProps {
  params: Promise<{
    'app-id': string;
  }>;
}

export default function AppStorePageClient({ params }: PageProps) {
  const resolvedParams = use(params);
  const appId = resolvedParams['app-id'];
  const router = useRouter();
  const { setTitle } = usePageHeader();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Link copied to clipboard');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingVariants, setIsGeneratingVariants] = useState(false);
  const [coverVariants, setCoverVariants] = useState<Array<{
    imageUrl: string;
    width?: number;
    height?: number;
  }> | undefined>(undefined);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | undefined>(undefined);
  const [estimatedTimeMs, setEstimatedTimeMs] = useState<number | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Detect Safari
  useEffect(() => {
    const ua = navigator.userAgent;
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(ua);
    setIsSafari(isSafariBrowser);
  }, []);

  const appPreview = useQuery(api.apps.getPublicAppPreview, { appId: appId as Id<'apps'> });
  const isAdmin = useQuery(api.profiles.isCurrentUserAdmin);
  const deletePermissions = useQuery(api.adminActions.canDeleteApp, { appId: appId as Id<'apps'> });
  const isFeatured = useQuery(api.adminActions.isFeatured, { appId: appId as Id<'apps'> });
  const generationJob = useQuery(api.appGenerationJobs.getAppGenerationJobByAppId, { appId: appId as Id<'apps'> });
  const coverGenerationJob = useQuery(api.generationJobs.getActiveGenerationJob, { appId: appId as Id<'apps'>, type: "coverImage" });
  const videoGenerationJob = useQuery(api.generationJobs.getActiveGenerationJob, { appId: appId as Id<'apps'>, type: "coverVideo" });
  const generateCoverImage = useAction(api.appGenerationActions.generateAppCoverImage);
  const saveCoverImage = useAction(api.appGenerationActions.saveAppCoverImage);
  const generateCoverVideo = useAction(api.appGenerationActions.generateAppCoverVideo);
  const removeCoverVideoMutation = useMutation(api.apps.removeCoverVideo);
  const deleteAppMutation = useMutation(api.apps.deleteApp);
  const updateAppMutation = useMutation(api.apps.updateApp);
  const featureAppMutation = useMutation(api.adminActions.featureApp);
  const unfeatureAppMutation = useMutation(api.adminActions.unfeatureApp);

  // Fetch reviews for this app (Convex queries are reactive and auto-update)
  const reviewsData = useQuery(api.mockReviews.getAppReviews, { appId: appId as Id<'apps'>, limit: 5 });

  // Fetch similar apps from the same category
  const similarApps = useQuery(
    api.apps.getPublicDemoApps,
    appPreview?.app.category
      ? { category: appPreview.app.category, limit: 7 }
      : 'skip'
  );

  const handleShareClick = useCallback(async () => {
    const url = window.location.href;

    // Always copy to clipboard first
    await navigator.clipboard.writeText(url);
    setToastMessage('Link copied to clipboard');
    setToastType('success');
    setShowToast(true);

    // Then show native share sheet if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: appPreview?.app.name || 'Check out this app',
          url: url,
        });
      } catch (err) {
        // User cancelled or share failed, but we already copied to clipboard
        console.log('Share cancelled or failed', err);
      }
    }
  }, [appPreview?.app.name]);

  const handlePublishApp = useCallback(async () => {
    if (!appPreview?.app) return;
    
    try {
      setIsPublishing(true);
      await updateAppMutation({
        appId: appId as Id<"apps">,
        status: "published",
      });
      setShowPublishSuccess(true);
      setTimeout(() => setShowPublishSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to publish app:', error);
      setToastMessage('Failed to publish app');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsPublishing(false);
    }
  }, [appPreview?.app, appId, updateAppMutation]);

  const handleGenerateCoverImage = useCallback(() => {
    if (!appId) return;
    // Just open the modal - generation happens after user provides feedback
    setIsModalOpen(true);
  }, [appId]);

  const handleStartGeneration = useCallback(async (feedback: string) => {
    if (!appId) return;
    
    setIsGeneratingVariants(true);
    setCoverVariants(undefined);
    setGeneratedPrompt(undefined);
    setEstimatedTimeMs(undefined);
    
    try {
      const result = await generateCoverImage({ 
        appId: appId as Id<'apps'>,
        numVariants: 4,
        userFeedback: feedback || undefined,
      });
      
      if (result.success && result.jobId) {
        // Job created successfully - close modal and show inline loading
        setIsModalOpen(false);
        setToastMessage('Generating cover images...');
        setToastType('success');
        setShowToast(true);
        // The coverGenerationJob query will update reactively when job completes
      } else {
        setToastMessage(result.error || 'Failed to start cover image generation');
        setToastType('error');
        setShowToast(true);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error generating cover images:', error);
      setToastMessage('Failed to generate cover images');
      setToastType('error');
      setShowToast(true);
      setIsModalOpen(false);
    } finally {
      setIsGeneratingVariants(false);
    }
  }, [appId, generateCoverImage]);

  const handleSaveCoverImage = useCallback(async (imageUrl: string) => {
    if (!appId) return;
    
    try {
      const result = await saveCoverImage({
        appId: appId as Id<'apps'>,
        imageUrl,
      });
      
      if (result.success) {
        setToastMessage('Cover image saved successfully!');
        setToastType('success');
        setShowToast(true);
      } else {
        setToastMessage(result.error || 'Failed to save cover image');
        setToastType('error');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error saving cover image:', error);
      setToastMessage('Failed to save cover image');
      setToastType('error');
      setShowToast(true);
      throw error; // Re-throw to let modal handle it
    }
  }, [appId, saveCoverImage]);

  const handleGenerateCoverVideo = useCallback(async (customPrompt?: string) => {
    if (!appId || !appPreview?.app.coverImageUrl) return;
    
    setToastMessage('Starting cover video generation...');
    setToastType('success');
    setShowToast(true);
    
    try {
      const result = await generateCoverVideo({ 
        appId: appId as Id<'apps'>,
        customPrompt,
      });
      
      if (result.success && result.jobId) {
        // Job created successfully - show toast, isVideoGenerating will update reactively
        setToastMessage('Generating cover video...');
        setToastType('success');
        setShowToast(true);
      } else {
        setToastMessage(result.error || 'Failed to start cover video generation');
        setToastType('error');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error generating cover video:', error);
      setToastMessage('Failed to generate cover video');
      setToastType('error');
      setShowToast(true);
    }
  }, [appId, appPreview?.app.coverImageUrl, generateCoverVideo]);

  const handleRemoveCoverVideo = useCallback(async () => {
    if (!appId) return;
    
    try {
      await removeCoverVideoMutation({ appId: appId as Id<'apps'> });
      setToastMessage('Cover video removed successfully!');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error removing cover video:', error);
      setToastMessage('Failed to remove cover video');
      setToastType('error');
      setShowToast(true);
    }
  }, [appId, removeCoverVideoMutation]);


  const handleDeleteApp = useCallback(async () => {
    if (!appId || isDeleting) return;
    
    setIsDeleting(true);
    setShowDeleteConfirm(false);
    
    try {
      await deleteAppMutation({ appId: appId as Id<'apps'> });
      
      // Redirect immediately to avoid "app not found" errors from reactive queries
      router.push('/create');
    } catch (error) {
      console.error('Error deleting app:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete app';
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
      setIsDeleting(false);
    }
  }, [appId, isDeleting, deleteAppMutation, router]);

  const handleFeatureApp = useCallback(async () => {
    if (!appId) return;
    
    try {
      await featureAppMutation({ appId: appId as Id<'apps'> });
      setToastMessage('App featured successfully!');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error featuring app:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to feature app';
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
    }
  }, [appId, featureAppMutation]);

  const handleUnfeatureApp = useCallback(async () => {
    if (!appId) return;
    
    try {
      await unfeatureAppMutation({ appId: appId as Id<'apps'> });
      setToastMessage('App removed from featured!');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error unfeaturing app:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to unfeature app';
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
    }
  }, [appId, unfeatureAppMutation]);

  // Filter out current app from similar apps
  const filteredSimilarApps = useMemo(() => {
    if (!similarApps) return [];
    return similarApps.filter((app) => app._id !== appId);
  }, [similarApps, appId]);

  // Check if app is currently generating
  const isGenerating = useMemo(() => {
    if (!generationJob) return false;
    const activeStatuses = ['pending', 'downloading_images', 'generating_structure', 'generating_screens'];
    return activeStatuses.includes(generationJob.status);
  }, [generationJob]);

  // Check if cover generation is active
  const isCoverGenerating = useMemo(() => {
    if (!coverGenerationJob) return false;
    return ['pending', 'generating'].includes(coverGenerationJob.status);
  }, [coverGenerationJob]);

  // Check if video generation is active
  const isVideoGenerating = useMemo(() => {
    if (!videoGenerationJob) return false;
    return ['pending', 'generating'].includes(videoGenerationJob.status);
  }, [videoGenerationJob]);

  // Calculate smart progress for cover generation (different durations for image vs video)
  const [coverGenerationProgress, setCoverGenerationProgress] = useState(0);

  useEffect(() => {
    if (!isCoverGenerating && !isVideoGenerating) {
      setCoverGenerationProgress(0);
      return;
    }

    const activeJob = isVideoGenerating ? videoGenerationJob : coverGenerationJob;
    if (!activeJob) return;

    const startTime = activeJob.createdAt;
    // Video takes longer than image generation
    const targetDuration = isVideoGenerating ? 90000 : 40000; // 90s for video, 40s for image

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const timeRatio = elapsed / targetDuration;
      
      // Asymptotic formula: reaches ~87% at target time, then slows down
      // Formula: 100 * (1 - e^(-2*t/targetTime))
      // For video (90s): At 45s: ~63%, at 90s: ~87%, at 135s: ~95%
      // For image (40s): At 20s: ~63%, at 40s: ~87%, at 60s: ~95%
      const progress = 100 * (1 - Math.exp(-2 * timeRatio));
      
      setCoverGenerationProgress(Math.min(progress, 99)); // Cap at 99% until complete
    };

    updateProgress();
    const interval = setInterval(updateProgress, 100); // Update every 100ms

    return () => clearInterval(interval);
  }, [isCoverGenerating, isVideoGenerating, coverGenerationJob, videoGenerationJob]);

  // Get generation status message and progress
  const generationStatus = useMemo(() => {
    if (!generationJob || !isGenerating) return null;
    
    const { status, screensGenerated, screensTotal, progressPercentage } = generationJob;
    
    let message = 'Starting generation...';
    let progress = progressPercentage || 0;
    
    if (status === 'downloading_images') {
      message = 'Preparing images...';
      progress = progressPercentage || 10;
    } else if (status === 'generating_structure') {
      message = 'Planning app design...';
      progress = progressPercentage || 30;
    } else if (status === 'generating_screens') {
      message = `Generating screenshots... ${screensGenerated}/${screensTotal}`;
      progress = progressPercentage || (screensTotal > 0 ? (screensGenerated / screensTotal) * 100 : 0);
    }
    
    return { message, progress };
  }, [generationJob, isGenerating]);

  useEffect(() => {
    setTitle('Appstore');
  }, [setTitle]);

  // Loading state
  if (appPreview === undefined) {
    return (
      <div className="mx-auto max-w-4xl px-4 pt-4 pb-8 sm:px-6 min-w-0">
        {/* App Store Preview Card Skeleton */}
        <div className="w-full rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">
            {/* Card Header - Creator and Actions */}
            <div className="flex items-center justify-between gap-4">
              {/* Creator Info Skeleton */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>

            {/* Cover Image with App Header Skeleton */}
            <div className="rounded-xl overflow-hidden shadow-md">
              {/* Cover Image */}
              <div className="relative w-full aspect-[2/1]">
                <Skeleton className="w-full h-full" />
              </div>
              
              {/* App info positioned at bottom */}
              <div className="relative p-4 md:p-6 flex items-center gap-4 -mt-12 bg-gradient-to-t from-muted/80 to-transparent">
                <Skeleton className="h-16 w-16 md:h-20 md:w-20 rounded-[22%] flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
            </div>

            {/* Description Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Preview Section */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>

              {/* Screenshot Carousel Skeleton */}
              <div className="sticky top-16 z-10">
                <div className="flex gap-6 pb-2 overflow-x-hidden">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton
                      key={i}
                      className="aspect-[9/19.5] w-[50vw] sm:w-[38vw] md:w-[200px] lg:w-[220px] flex-shrink-0 rounded-2xl"
                    />
                  ))}
                </div>
                
                {/* Dots Skeleton */}
                <div className="flex justify-center gap-2 mt-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="w-2 h-2 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section Skeleton */}
        <div className="mt-6 rounded-2xl border bg-card p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>

            {/* Rating Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col items-center justify-center gap-2">
                <Skeleton className="h-16 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-2 flex-1" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-4 pt-4 border-t">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Similar Apps Carousel Skeleton */}
        <div className="mt-6 space-y-4">
          <Skeleton className="h-7 w-48" />
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-64 flex-shrink-0 rounded-2xl border bg-card overflow-hidden"
              >
                <Skeleton className="w-full h-40" />
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA Skeleton */}
        <div className="mt-6 rounded-2xl border bg-card p-8">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-96 max-w-full" />
            <Skeleton className="h-11 w-48" />
          </div>
        </div>
      </div>
    );
  }

  // App not found
  if (appPreview === null) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16))] py-12 px-6">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-semibold">App Not Found</h1>
          <p className="text-sm text-muted-foreground">
            This app doesn&apos;t exist or is no longer available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
    {/* Sticky Generation Status Bar */}
    {isGenerating && generationStatus && (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
      >
        <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6">
          <div className="flex items-center gap-5 md:gap-6">
            {/* Mocksybot generating animation - breaks out of container */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="flex-shrink-0 relative -my-8 md:-my-12"
            >
              {isSafari ? (
                <Image
                  src="/mocksy-study.gif"
                  alt="Mocksy studying"
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
            </motion.div>
            
            {/* Progress content */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm md:text-base font-medium text-primary">
                  {generationStatus.message}
                </p>
                <span className="text-xs md:text-sm text-muted-foreground font-mono flex-shrink-0">
                  {Math.round(generationStatus.progress)}%
                </span>
              </div>
              {/* Progress Bar */}
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${generationStatus.progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )}

    {/* Sticky Cover Generation Status Bar */}
    {(isCoverGenerating || isVideoGenerating) && (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
      >
        <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6">
          <div className="flex items-center gap-5 md:gap-6">
            {/* Mocksybot generating animation - breaks out of container */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="flex-shrink-0 relative -my-8 md:-my-12"
            >
              {isSafari ? (
                <Image
                  src="/mocksy-study.gif"
                  alt="Mocksy studying"
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
            </motion.div>
            
            {/* Message content */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm md:text-base font-medium text-primary">
                  {isVideoGenerating ? 'Generating cover video...' : 'Generating cover image...'}
                </p>
                <span className="text-xs md:text-sm text-muted-foreground font-mono flex-shrink-0">
                  {Math.round(coverGenerationProgress)}%
                </span>
              </div>
              {/* Smart Progress Bar */}
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${coverGenerationProgress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )}

    <div className="mx-auto max-w-4xl px-4 pt-4 pb-8 sm:px-6 min-w-0">

        {/* Draft Status Banner - Only show after app generation is complete */}
        {appPreview?.app.isDemo && 
         appPreview.app.status === "draft" && 
         deletePermissions?.isOwner && 
         !isGenerating && 
         appPreview.totalScreens > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-6 backdrop-blur-md"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3 lg:items-center lg:gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20 flex-shrink-0">
                  <Eye className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">
                    Your app is ready to publish!
                  </p>
                  <p className="text-sm text-yellow-600/80 dark:text-yellow-400/80 mt-1">
                    This app is currently in draft mode and only visible to you. Publish it to make it discoverable in the app store.
                  </p>
                </div>
              </div>
              <Button
                onClick={handlePublishApp}
                disabled={isPublishing}
                size="lg"
                className={cn(
                  "w-full lg:w-auto flex-shrink-0",
                  isPublishing
                    ? "bg-green-500/50 text-white cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                )}
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                {isPublishing ? "Publishing..." : "Publish to App Store"}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Published Success Banner */}
        {showPublishSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 p-6 backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                  Successfully published!
                </p>
                <p className="text-sm text-green-600/80 dark:text-green-400/80">
                  Your app is now live and discoverable in the app store.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* App Store Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <AppStorePreviewCard
            app={appPreview.app}
            creator={appPreview.creator}
            screens={appPreview.screens}
            totalScreens={appPreview.totalScreens}
            isLoading={isGenerating}
            onShare={handleShareClick}
            isAdmin={isAdmin}
            onGenerateCover={handleGenerateCoverImage}
            onGenerateVideo={() => setIsVideoModalOpen(true)}
            onRemoveVideo={handleRemoveCoverVideo}
            isGeneratingVideo={isVideoGenerating}
            adminActionsSlot={
              deletePermissions?.canDelete ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="font-medium">Manage</span>
                      <MoreVertical className="h-3.5 w-3.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-56 p-1">
                    <div className="space-y-1">
                      {/* Feature/Unfeature App */}
                      {isAdmin && (
                        <button
                          onClick={isFeatured ? handleUnfeatureApp : handleFeatureApp}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted/50 text-left"
                        >
                          <Star className={cn("h-4 w-4", isFeatured && "fill-yellow-500 text-yellow-500")} />
                          <span className="flex-1">{isFeatured ? 'Remove from Featured' : 'Feature This App'}</span>
                        </button>
                      )}
                      
                      {/* Delete App */}
                      {isAdmin && <div className="h-px bg-border my-1" />}
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-destructive/10 text-destructive text-left"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="flex-1">Delete App</span>
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : undefined
            }
          />
        </motion.div>

        {/* Reviews Section */}
        {reviewsData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mt-6"
          >
            <ReviewsSection
              appId={appId as Id<'apps'>}
              appName={appPreview.app.name}
              reviews={reviewsData.reviews}
              averageRating={reviewsData.averageRating}
              totalReviews={reviewsData.totalReviews}
              ratingCounts={reviewsData.ratingCounts}
            />
          </motion.div>
        )}

        {/* Similar Apps Recommendations */}
        {filteredSimilarApps.length > 0 && appPreview.app.category && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-6"
          >
            <AppsInCategoryCarousel
              category={appPreview.app.category}
              apps={filteredSimilarApps}
            />
          </motion.div>
        )}

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border p-8 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Create Your Own App</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Generate stunning App Store screenshots with AI in minutes. No design skills needed.
            </p>
            <Button
              onClick={() => router.push('/generate')}
              size="lg"
              className="flex items-center gap-2 mx-auto shadow-lg"
            >
              <Sparkles className="h-5 w-5" />
              Get Started for Free
            </Button>
          </div>
        </motion.div>
    </div>

    <CoverImageSelectionModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      variants={coverVariants}
      isGenerating={isGeneratingVariants}
      imagePrompt={generatedPrompt}
      onSave={handleSaveCoverImage}
      appName={appPreview?.app.name || 'App'}
      appIconUrl={appPreview?.app.iconUrl || null}
      onGenerate={handleStartGeneration}
      estimatedTimeMs={estimatedTimeMs}
    />

    {/* Delete Confirmation Dialog */}
    {showDeleteConfirm && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={() => !isDeleting && setShowDeleteConfirm(false)}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="mx-4 w-full max-w-md rounded-xl bg-card p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Delete App</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Are you sure you want to delete &quot;{appPreview?.app.name}&quot;? This will permanently delete all screenshots, reviews, and related data. This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteApp}
              className="flex-1"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    )}

    <Toast
      message={toastMessage}
      type={toastType}
      isOpen={showToast}
      onClose={() => setShowToast(false)}
      duration={2000}
    />

    <GenerateVideoModal
      isOpen={isVideoModalOpen}
      onClose={() => setIsVideoModalOpen(false)}
      onGenerate={handleGenerateCoverVideo}
      isRegenerating={!!appPreview?.app.coverVideoUrl}
      isGenerating={isVideoGenerating}
    />
    </>
  );
}

