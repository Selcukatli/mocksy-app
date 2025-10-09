'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { Sparkles, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppStorePreviewCard from '@/components/AppStorePreviewCard';
import { motion } from 'framer-motion';
import { usePageHeader } from '@/components/RootLayoutContent';

interface PageProps {
  params: Promise<{
    'app-id': string;
  }>;
}

export default function PublicAppStorePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const appId = resolvedParams['app-id'];
  const router = useRouter();
  const { setTitle, setActions } = usePageHeader();
  const [copied, setCopied] = useState(false);

  const appPreview = useQuery(api.apps.getPublicAppPreview, { appId: appId as Id<'apps'> });

  const handleShareClick = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleCreateYourOwn = useCallback(() => {
    router.push('/create');
  }, [router]);

  useEffect(() => {
    setTitle('Appstore');
    setActions(
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShareClick}
          className="flex items-center gap-2"
        >
          <Share className="h-4 w-4" />
          {copied ? 'Copied!' : 'Share'}
        </Button>
        <Button
          size="sm"
          onClick={handleCreateYourOwn}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Create Your Own
        </Button>
      </>
    );

    return () => setActions(null);
  }, [setTitle, setActions, copied, handleShareClick, handleCreateYourOwn]);

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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 min-w-0">
        {/* App Store Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <AppStorePreviewCard
            app={appPreview.app}
            screens={appPreview.screens}
            totalScreens={appPreview.totalScreens}
            isLoading={false}
          />
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-12 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border p-8 text-center relative overflow-hidden"
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
  );
}
