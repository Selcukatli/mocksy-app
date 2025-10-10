'use client';

import { use, useEffect, useState, useCallback, useMemo } from 'react';
import { useQuery, useAction } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppStorePreviewCard from '@/components/AppStorePreviewCard';
import AppsInCategoryCarousel from '@/components/AppsInCategoryCarousel';
import ReviewsSection from '@/components/ReviewsSection';
import CoverImageSelectionModal from '@/components/CoverImageSelectionModal';
import { motion } from 'framer-motion';
import { usePageHeader } from '@/components/RootLayoutContent';
import Toast from '@/components/Toast';

interface PageProps {
  params: Promise<{
    'app-id': string;
  }>;
}

export default function PublicAppStorePage({ params }: PageProps) {
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

  const appPreview = useQuery(api.apps.getPublicAppPreview, { appId: appId as Id<'apps'> });
  const isAdmin = useQuery(api.profiles.isCurrentUserAdmin);
  const generateCoverImage = useAction(api.demoActions.generateAppCoverImage);
  const saveCoverImage = useAction(api.demoActions.saveAppCoverImage);

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

  const handleCreateYourOwn = useCallback(() => {
    router.push('/create');
  }, [router]);

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
    
    try {
      const result = await generateCoverImage({ 
        appId: appId as Id<'apps'>,
        numVariants: 4,
        userFeedback: feedback || undefined,
      });
      
      if (result.success && result.variants) {
        setCoverVariants(result.variants);
        setGeneratedPrompt(result.imagePrompt);
      } else {
        setToastMessage(result.error || 'Failed to generate cover images');
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

  // Filter out current app from similar apps
  const filteredSimilarApps = useMemo(() => {
    if (!similarApps) return [];
    return similarApps.filter((app) => app._id !== appId);
  }, [similarApps, appId]);

  useEffect(() => {
    setTitle('Appstore');
  }, [setTitle]);

  // Loading state
  if (appPreview === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16))] py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading app preview...</p>
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
            This app doesn&apos;t exist or is no longer available. Try creating your own amazing app!
          </p>
          <button
            type="button"
            onClick={handleCreateYourOwn}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
          >
            Create Your Own App
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 min-w-0">
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
            isLoading={false}
            onShare={handleShareClick}
            onCreateYourOwn={handleCreateYourOwn}
            isAdmin={isAdmin}
            onGenerateCover={handleGenerateCoverImage}
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
              onClick={handleCreateYourOwn}
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
    />

    <Toast
      message={toastMessage}
      type={toastType}
      isOpen={showToast}
      onClose={() => setShowToast(false)}
      duration={2000}
    />
    </>
  );
}
